import type { SystemStatus } from "@/types/whiteboard";
import type { ProximityZone } from "./proximityClassifier";

/**
 * F5 / FR4 safety policy engine.
 *
 * Pure mapping from `(SystemStatus, currentZone, previousZone)` to a
 * required `SafetyAction`. Used by the React bridge and by any
 * non-UI runner (robot CLI) so "when a student steps into the danger
 * band, the erase pauses" is described once and tested once.
 *
 * Actions:
 *   - `continue` — keep running, no change.
 *   - `pause`    — pause an active erase because zone escalated to
 *                  danger; caller transitions status → `obstacle-detected`.
 *   - `halt`     — refuse to start (or cancel a countdown) because the
 *                  student is already in the danger zone.
 *   - `resume`   — the previously-tripped condition has cleared and the
 *                  erase should continue; caller transitions status
 *                  back to `erasing`.
 *   - `no_op`    — nothing to do in the current combination.
 */

export type SafetyAction = "continue" | "pause" | "halt" | "resume" | "no_op";

export type SafetyReason =
  | "student_in_danger_zone"
  | "student_in_warning_zone"
  | "area_cleared"
  | "idle_unchanged";

export interface SafetyDecision {
  action: SafetyAction;
  reason: SafetyReason;
  zone: ProximityZone;
}

const decide = (
  action: SafetyAction,
  reason: SafetyReason,
  zone: ProximityZone,
): SafetyDecision => ({ action, reason, zone });

export function evaluateSafetyAction(
  status: SystemStatus,
  currentZone: ProximityZone,
  previousZone: ProximityZone = currentZone,
): SafetyDecision {
  if (currentZone === "danger") {
    if (status === "erasing" || status === "countdown") {
      return decide("pause", "student_in_danger_zone", currentZone);
    }
    if (status === "idle" || status === "completed" || status === "paused") {
      return decide("halt", "student_in_danger_zone", currentZone);
    }
    return decide("no_op", "student_in_danger_zone", currentZone);
  }

  if (currentZone === "warning") {
    return decide(
      status === "erasing" || status === "countdown" ? "continue" : "no_op",
      "student_in_warning_zone",
      currentZone,
    );
  }

  if (status === "obstacle-detected" && previousZone !== "clear") {
    return decide("resume", "area_cleared", currentZone);
  }
  if (status === "erasing" || status === "countdown") {
    return decide("continue", "area_cleared", currentZone);
  }
  return decide("no_op", "idle_unchanged", currentZone);
}
