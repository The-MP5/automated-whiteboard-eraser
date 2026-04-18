import type { EraseArea, EraseMode } from "@/types/whiteboard";

/**
 * F3 "schedule erase after class" — pure, side-effect free scheduling core.
 *
 * Intent: keep the policy questions ("is this schedule allowed to fire now?",
 * "which scheduled erase should run next?") separate from the runner / UI.
 * The FR2 command guard consumes these helpers to accept or reject
 * schedule-driven Start commands with typed reasons.
 *
 * No timers, no DOM, no React. `now` is always injected so the caller
 * controls clock sources and tests stay deterministic.
 */

export interface EraseSchedule {
  id: string;
  scheduledAt: Date;
  eraseMode: EraseMode;
  partialArea?: EraseArea | null;
  enabled: boolean;
  label?: string;
}

/**
 * Window (ms) around `scheduledAt` during which the schedule is considered
 * "due". Anything older than this is `expired`. Matches the FR2 audit
 * expectation that a fire-attempt beyond the window is not silently
 * retried — it's rejected so the teacher can re-schedule explicitly.
 */
export const SCHEDULE_DUE_WINDOW_MS = 60_000;

export type ScheduleInvalidReason =
  | "missing_id"
  | "missing_time"
  | "invalid_time"
  | "past_time";

export type ScheduleValidation =
  | { valid: true; schedule: EraseSchedule }
  | { valid: false; reason: ScheduleInvalidReason };

export interface ScheduleInput {
  id: string;
  scheduledAt: Date | string | number;
  eraseMode: EraseMode;
  partialArea?: EraseArea | null;
  enabled?: boolean;
  label?: string;
}

const toDate = (value: Date | string | number): Date =>
  value instanceof Date ? value : new Date(value);

export function validateSchedule(
  input: ScheduleInput,
  now: Date = new Date(),
): ScheduleValidation {
  if (!input.id || typeof input.id !== "string") {
    return { valid: false, reason: "missing_id" };
  }
  if (input.scheduledAt == null) {
    return { valid: false, reason: "missing_time" };
  }

  const scheduledAt = toDate(input.scheduledAt);
  if (!(scheduledAt instanceof Date) || Number.isNaN(scheduledAt.getTime())) {
    return { valid: false, reason: "invalid_time" };
  }

  if (scheduledAt.getTime() + SCHEDULE_DUE_WINDOW_MS < now.getTime()) {
    return { valid: false, reason: "past_time" };
  }

  return {
    valid: true,
    schedule: {
      id: input.id,
      scheduledAt,
      eraseMode: input.eraseMode,
      partialArea: input.partialArea ?? null,
      enabled: input.enabled ?? true,
      label: input.label,
    },
  };
}

export type ScheduleDueState = "pending" | "due" | "expired";

export function scheduleDueState(
  schedule: EraseSchedule,
  now: Date = new Date(),
): ScheduleDueState {
  const delta = now.getTime() - schedule.scheduledAt.getTime();
  if (delta < 0) return "pending";
  if (delta <= SCHEDULE_DUE_WINDOW_MS) return "due";
  return "expired";
}

export function isScheduleDue(
  schedule: EraseSchedule,
  now: Date = new Date(),
): boolean {
  return schedule.enabled && scheduleDueState(schedule, now) === "due";
}

/** Returns the nearest-in-time enabled, non-expired schedule, or null. */
export function nextDueSchedule(
  schedules: readonly EraseSchedule[],
  now: Date = new Date(),
): EraseSchedule | null {
  let best: EraseSchedule | null = null;
  for (const s of schedules) {
    if (!s.enabled) continue;
    if (scheduleDueState(s, now) === "expired") continue;
    if (best == null) {
      best = s;
      continue;
    }
    if (s.scheduledAt.getTime() < best.scheduledAt.getTime()) best = s;
  }
  return best;
}
