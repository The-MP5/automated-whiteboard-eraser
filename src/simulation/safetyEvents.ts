import type { ProximityZone } from "./proximityClassifier";

/**
 * F5 / FR4 safety audit events.
 *
 * Typed factories that record *why* the robot paused / resumed /
 * refused to start, so the audit log and future reports can cite
 * proximity causes without string matching. Pure — no React, no DOM,
 * no timers. Timestamps are injected for determinism.
 */

export type SafetyEventKind =
  | "entered_warning"
  | "entered_danger"
  | "cleared"
  | "committed_pause"
  | "committed_resume"
  | "refused_start";

export interface SafetyEvent {
  id: string;
  kind: SafetyEventKind;
  zone: ProximityZone;
  distanceMeters: number | null;
  at: Date;
  message: string;
}

let counter = 0;
const nextId = (prefix: string, at: Date): string => {
  counter = (counter + 1) % 1_000_000;
  return `${prefix}-${at.getTime()}-${counter.toString(36)}`;
};

export interface SafetyEventInput {
  zone: ProximityZone;
  distanceMeters?: number | null;
  at?: Date;
  message?: string;
}

const baseMessage = (kind: SafetyEventKind, zone: ProximityZone): string => {
  switch (kind) {
    case "entered_warning":
      return `FR4: student entered warning zone (${zone}).`;
    case "entered_danger":
      return `FR4: student entered danger zone — erase paused for safety.`;
    case "cleared":
      return `FR4: area cleared — safe to resume.`;
    case "committed_pause":
      return `FR4: pause committed due to proximity.`;
    case "committed_resume":
      return `FR4: resume committed after area cleared.`;
    case "refused_start":
      return `FR4: start refused — student still in danger zone.`;
  }
};

export function createSafetyEvent(
  kind: SafetyEventKind,
  input: SafetyEventInput,
): SafetyEvent {
  const at = input.at ?? new Date();
  return {
    id: nextId("safety", at),
    kind,
    zone: input.zone,
    distanceMeters: input.distanceMeters ?? null,
    at,
    message: input.message ?? baseMessage(kind, input.zone),
  };
}
