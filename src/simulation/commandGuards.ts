import type {
  CommandAction,
  EraseArea,
  EraseMode,
  SystemStatus,
} from "@/types/whiteboard";
import {
  validateEraseArea,
  type CanvasBounds,
  type EraseAreaInvalidReason,
} from "./validateEraseArea";
import {
  scheduleDueState,
  type EraseSchedule,
} from "./eraseSchedule";
import {
  checkTouchRateLimit,
  DEFAULT_TOUCH_MIN_INTERVAL_MS,
} from "./touchRateLimit";
import {
  DEFAULT_VOICE_CONFIDENCE_MIN,
  type VoiceIntent,
} from "./voiceIntent";

/**
 * FR2 command control — pure, side-effect free guards for start / pause / stop
 * commands covering every erase pipeline:
 *
 *   - F1 (#39) "automatic full erase at the press of a button"
 *   - F2 (#40) "select specific sections to erase"
 *   - F3 (#41) "schedule erase after class"
 *
 * Used by the React bridge (`useWhiteboardSimulation`) and by any future
 * non-UI caller (teacher voice command, scheduled runner, robot CLI).
 *
 * Design:
 *   - Guards are pure functions; no React, no toasts, no timers.
 *   - Rejections carry a typed `code` so audit logs / tests / UI can branch
 *     without string matching.
 *   - F2 callers pass an optional `CommandContext` describing the current
 *     erase mode and selected region. When `eraseMode === "partial"`, Start
 *     requires a valid `EraseArea` (non-null, positive dims, in-bounds).
 *   - F3 callers use `canScheduledStart(schedule, now, status, context)`,
 *     which composes schedule state (enabled, due, not expired) with the
 *     existing `canStart` state/context invariants — partial-mode section
 *     validation still applies to schedule-fired starts.
 *   - F4 callers annotate `context.source` (`touch` / `mouse` / `keyboard`
 *     / `programmatic`) and optionally pass `lastCommandAt` +
 *     `minTouchIntervalMs`. Touch-sourced commands fired within the
 *     interval of a prior command are rejected with `rate_limited`, so
 *     kiosk / mobile double-taps don't accidentally re-fire. Mouse and
 *     keyboard sources remain un-rate-limited to preserve desktop UX.
 *   - F6 callers set `context.requireAcknowledgment = true` and supply
 *     `acknowledgedAt` once the teacher dismisses the pre-erase warning.
 *     Start is rejected with `notification_not_acknowledged` until the
 *     warning is acknowledged, so accidental taps during the grace
 *     window can't bypass the "notify me before erase" policy.
 *   - F8 callers set `context.source = "voice"` and pass a `voiceIntent`
 *     (see `parseVoiceIntent`). The guard rejects when the intent's
 *     action mismatches the attempted action or the confidence is below
 *     `voiceConfidenceMin` (default `DEFAULT_VOICE_CONFIDENCE_MIN`).
 *     Non-voice sources are unaffected.
 *   - F1 callers may omit the context entirely; full-erase semantics apply.
 *
 * Rejection codes:
 *   - `invalid_state`          — command invalid for current `SystemStatus`.
 *   - `already_running`        — Start while `erasing` / `countdown`.
 *   - `nothing_to_pause`       — Pause while `idle` / `completed`.
 *   - `nothing_to_stop`        — Stop while no operation is interruptible.
 *   - `no_section_selected`    — F2: Start pressed in partial mode with no
 *                                selection.
 *   - `invalid_section_bounds` — F2: selected rectangle has non-positive
 *                                dimensions or lies outside the canvas.
 *   - `schedule_disabled`      — F3: schedule exists but is toggled off.
 *   - `schedule_not_due`       — F3: scheduled time has not yet arrived.
 *   - `schedule_expired`       — F3: scheduled time is beyond the grace
 *                                window; teacher must re-schedule.
 *   - `rate_limited`           — F4: touch-sourced command fired within
 *                                the minimum inter-command interval.
 *   - `notification_not_acknowledged`
 *                              — F6: Start pressed while a pre-erase
 *                                warning is still pending acknowledgment.
 *   - `low_confidence`         — F8: voice intent confidence below
 *                                threshold.
 *   - `unrecognized_voice_command`
 *                              — F8: transcript parsed but no known
 *                                action, or intent action mismatches
 *                                the attempted command.
 */

export type CommandRejectionCode =
  | "invalid_state"
  | "already_running"
  | "nothing_to_pause"
  | "nothing_to_stop"
  | "no_section_selected"
  | "invalid_section_bounds"
  | "schedule_disabled"
  | "schedule_not_due"
  | "schedule_expired"
  | "rate_limited"
  | "notification_not_acknowledged"
  | "low_confidence"
  | "unrecognized_voice_command";

export type CommandSource =
  | "touch"
  | "mouse"
  | "keyboard"
  | "programmatic"
  | "voice";

export interface CommandRejection {
  code: CommandRejectionCode;
  message: string;
  status: SystemStatus;
}

export type CommandGuardResult =
  | { allowed: true }
  | { allowed: false; rejection: CommandRejection };

export interface CommandContext {
  eraseMode?: EraseMode;
  partialArea?: EraseArea | null;
  canvasBounds?: CanvasBounds;
  source?: CommandSource;
  lastCommandAt?: Date | number | null;
  now?: Date | number;
  minTouchIntervalMs?: number;
  requireAcknowledgment?: boolean;
  acknowledgedAt?: Date | number | null;
  voiceIntent?: VoiceIntent | null;
  voiceConfidenceMin?: number;
}

/**
 * F8: validate a voice-sourced command against its parsed intent. Runs
 * only when `source === "voice"`. Returns a populated rejection when
 * the intent mismatches / is below threshold, otherwise null.
 */
const voiceRejection = (
  action: CommandAction,
  context: CommandContext,
  status: SystemStatus,
): CommandGuardResult | null => {
  if (context.source !== "voice") return null;
  const intent = context.voiceIntent;
  if (intent == null) {
    return deny(
      "unrecognized_voice_command",
      status,
      "Voice command ignored — no intent parsed from transcript.",
    );
  }
  if (intent.action == null) {
    return deny(
      "unrecognized_voice_command",
      status,
      `Voice command ignored — transcript '${intent.normalized}' did not match a known action.`,
    );
  }
  if (intent.action !== action) {
    return deny(
      "unrecognized_voice_command",
      status,
      `Voice command mismatch — heard '${intent.action}', expected '${action}'.`,
    );
  }
  const min = context.voiceConfidenceMin ?? DEFAULT_VOICE_CONFIDENCE_MIN;
  if (intent.confidence < min) {
    return deny(
      "low_confidence",
      status,
      `Voice command ignored — confidence ${intent.confidence.toFixed(2)} below ${min.toFixed(2)}.`,
    );
  }
  return null;
};

/**
 * F4: If the command arrived from a touchscreen / mobile tap, reject
 * presses that land inside the minimum inter-command interval so the
 * kiosk doesn't re-fire on finger bounce. Returns `null` when no
 * rate-limit violation; a populated rejection otherwise.
 */
const touchRateRejection = (
  context: CommandContext,
  status: SystemStatus,
): CommandGuardResult | null => {
  if (context.source !== "touch") return null;
  if (context.lastCommandAt == null) return null;

  const interval = context.minTouchIntervalMs ?? DEFAULT_TOUCH_MIN_INTERVAL_MS;
  const now = context.now ?? Date.now();
  const check = checkTouchRateLimit(context.lastCommandAt, now, interval);
  if (check.ok) return null;

  return deny(
    "rate_limited",
    status,
    `Touch command ignored — retry in ${Math.ceil(check.retryAfterMs)} ms.`,
  );
};

const deny = (
  code: CommandRejectionCode,
  status: SystemStatus,
  message: string,
): CommandGuardResult => ({ allowed: false, rejection: { code, status, message } });

const sectionRejection = (
  status: SystemStatus,
  reason: EraseAreaInvalidReason,
): CommandGuardResult => {
  if (reason === "missing") {
    return deny(
      "no_section_selected",
      status,
      "Start ignored — select an area on the whiteboard before starting a partial erase.",
    );
  }
  return deny(
    "invalid_section_bounds",
    status,
    `Start ignored — selected section is invalid (${reason.replace(/_/g, " ")}).`,
  );
};

export function canStart(
  status: SystemStatus,
  context: CommandContext = {},
): CommandGuardResult {
  const rate = touchRateRejection(context, status);
  if (rate) return rate;
  const voice = voiceRejection("start", context, status);
  if (voice) return voice;

  if (status === "erasing" || status === "countdown") {
    return deny("already_running", status, `Start ignored — erase is already ${status}.`);
  }
  if (status !== "idle" && status !== "completed" && status !== "paused") {
    return deny(
      "invalid_state",
      status,
      `Start is unavailable while status is '${status}'.`,
    );
  }

  if (context.eraseMode === "partial" && status !== "paused") {
    const check = validateEraseArea(context.partialArea, context.canvasBounds);
    if (!check.valid) return sectionRejection(status, check.reason);
  }

  if (context.requireAcknowledgment && context.acknowledgedAt == null) {
    return deny(
      "notification_not_acknowledged",
      status,
      "Start ignored — acknowledge the pre-erase warning before starting.",
    );
  }

  return { allowed: true };
}

export function canPause(
  status: SystemStatus,
  context: CommandContext = {},
): CommandGuardResult {
  const rate = touchRateRejection(context, status);
  if (rate) return rate;
  const voice = voiceRejection("pause", context, status);
  if (voice) return voice;

  if (status === "erasing") return { allowed: true };
  return deny(
    status === "idle" || status === "completed" ? "nothing_to_pause" : "invalid_state",
    status,
    `Pause is unavailable while status is '${status}'.`,
  );
}

export function canStop(
  status: SystemStatus,
  context: CommandContext = {},
): CommandGuardResult {
  const rate = touchRateRejection(context, status);
  if (rate) return rate;
  const voice = voiceRejection("stop", context, status);
  if (voice) return voice;

  const stoppable: SystemStatus[] = ["erasing", "countdown", "paused", "obstacle-detected"];
  if (stoppable.includes(status)) return { allowed: true };
  return deny("nothing_to_stop", status, `Stop is unavailable while status is '${status}'.`);
}

/** Dispatch helper: pick the guard matching a `CommandAction`. */
export function evaluateCommand(
  action: CommandAction,
  status: SystemStatus,
  context: CommandContext = {},
): CommandGuardResult {
  switch (action) {
    case "start":
      return canStart(status, context);
    case "pause":
      return canPause(status, context);
    case "stop":
      return canStop(status, context);
  }
}

/**
 * F3 Start guard. Composes schedule state with the FR2 state/context guard.
 * Schedule-fired callers pass the `EraseSchedule` they intend to run plus
 * `now` (injected for determinism). If the schedule is disabled, not yet
 * due, or past its grace window, reject with the matching typed code.
 * Otherwise delegate to `canStart` so partial-mode section validation and
 * run-state rules still apply to scheduled starts.
 */
export function canScheduledStart(
  schedule: EraseSchedule,
  now: Date,
  status: SystemStatus,
  context: CommandContext = {},
): CommandGuardResult {
  if (!schedule.enabled) {
    return deny(
      "schedule_disabled",
      status,
      `Schedule '${schedule.label ?? schedule.id}' is disabled.`,
    );
  }

  const due = scheduleDueState(schedule, now);
  if (due === "pending") {
    return deny(
      "schedule_not_due",
      status,
      `Schedule '${schedule.label ?? schedule.id}' is not due yet.`,
    );
  }
  if (due === "expired") {
    return deny(
      "schedule_expired",
      status,
      `Schedule '${schedule.label ?? schedule.id}' has expired — please re-schedule.`,
    );
  }

  const scheduleContext: CommandContext = {
    eraseMode: context.eraseMode ?? schedule.eraseMode,
    partialArea: context.partialArea ?? schedule.partialArea ?? null,
    canvasBounds: context.canvasBounds,
  };
  return canStart(status, scheduleContext);
}
