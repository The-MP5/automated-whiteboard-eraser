/**
 * F5 "operate safely near students" — pure proximity zone classifier.
 *
 * The existing `ProximitySensor` gives us a raw distance (meters) and a
 * single obstacle threshold. FR4 for F5 needs a richer safety model that
 * distinguishes an early-warning band from a hard-stop band so the robot
 * can slow / pause before a student reaches true danger distance.
 *
 * Zones (inclusive of the upper bound):
 *   - `danger`  : distance <= `dangerMaxM`      (immediate pause)
 *   - `warning` : dangerMaxM < distance <= warnMaxM (visual / audible cue)
 *   - `clear`   : distance  > warnMaxM          (normal operation)
 *
 * Pure — no React, no DOM, no timers. Used by the hysteresis reducer and
 * safety policy engine.
 */

export type ProximityZone = "clear" | "warning" | "danger";

export interface ProximityZoneThresholds {
  /** Distance (m) at or below which the robot must stop immediately. */
  dangerMaxM: number;
  /** Distance (m) at or below which the robot should warn / slow. */
  warnMaxM: number;
}

/** Defaults derived from FR4 (0.5 m obstacle threshold) with a 0.5 m warning band. */
export const DEFAULT_PROXIMITY_THRESHOLDS: ProximityZoneThresholds = {
  dangerMaxM: 0.5,
  warnMaxM: 1.0,
};

export function classifyProximityZone(
  distanceMeters: number,
  thresholds: ProximityZoneThresholds = DEFAULT_PROXIMITY_THRESHOLDS,
): ProximityZone {
  if (!Number.isFinite(distanceMeters)) return "danger";
  if (distanceMeters <= thresholds.dangerMaxM) return "danger";
  if (distanceMeters <= thresholds.warnMaxM) return "warning";
  return "clear";
}
