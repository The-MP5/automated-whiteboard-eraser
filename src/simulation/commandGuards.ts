import type { CommandAction, SystemStatus } from "@/types/whiteboard";

/**
 * FR2 command control — pure, side-effect free guards for start / pause / stop
 * commands operating on the automatic full-erase pipeline (F1: "automatic full erase
 * at the press of a button"). Used by the React bridge (`useWhiteboardSimulation`)
 * and by any future non-UI caller (e.g. teacher voice command, scheduled task).
 *
 * Design (Subissue 1.1 / #51):
 *   - Guards are pure functions of `SystemStatus`; no React, no toasts, no timers.
 *   - Rejections carry a typed `reason` code so audit logs / tests / UI can all
 *     distinguish cases without string matching.
 *   - `canStart` covers both "begin from idle/completed" and "resume from paused".
 */

export type CommandRejectionCode =
  | "invalid_state"
  | "already_running"
  | "nothing_to_pause"
  | "nothing_to_stop";

export interface CommandRejection {
  code: CommandRejectionCode;
  message: string;
  status: SystemStatus;
}

export type CommandGuardResult =
  | { allowed: true }
  | { allowed: false; rejection: CommandRejection };

const deny = (
  code: CommandRejectionCode,
  status: SystemStatus,
  message: string,
): CommandGuardResult => ({ allowed: false, rejection: { code, status, message } });

export function canStart(status: SystemStatus): CommandGuardResult {
  if (status === "idle" || status === "completed" || status === "paused") {
    return { allowed: true };
  }
  if (status === "erasing" || status === "countdown") {
    return deny("already_running", status, `Start ignored — erase is already ${status}.`);
  }
  return deny(
    "invalid_state",
    status,
    `Start is unavailable while status is '${status}'.`,
  );
}

export function canPause(status: SystemStatus): CommandGuardResult {
  if (status === "erasing") return { allowed: true };
  return deny(
    status === "idle" || status === "completed" ? "nothing_to_pause" : "invalid_state",
    status,
    `Pause is unavailable while status is '${status}'.`,
  );
}

export function canStop(status: SystemStatus): CommandGuardResult {
  const stoppable: SystemStatus[] = ["erasing", "countdown", "paused", "obstacle-detected"];
  if (stoppable.includes(status)) return { allowed: true };
  return deny("nothing_to_stop", status, `Stop is unavailable while status is '${status}'.`);
}

/** Dispatch helper: pick the guard matching a `CommandAction`. */
export function evaluateCommand(
  action: CommandAction,
  status: SystemStatus,
): CommandGuardResult {
  switch (action) {
    case "start":
      return canStart(status);
    case "pause":
      return canPause(status);
    case "stop":
      return canStop(status);
  }
}
