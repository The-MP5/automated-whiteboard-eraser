import type { CountdownPhase } from "./eraseNotification";

/**
 * F6 notification audit events. Typed factories mirroring the FR4
 * `SafetyEvent` pattern so the audit trail records *why* a pre-erase
 * warning was raised, acknowledged, or canceled. Pure — timestamps are
 * injectable.
 */

export type NotificationEventKind =
  | "warning_shown"
  | "acknowledged"
  | "canceled_during_grace"
  | "auto_started";

export interface NotificationEvent {
  id: string;
  kind: NotificationEventKind;
  phase: CountdownPhase;
  at: Date;
  message: string;
}

let counter = 0;
const nextId = (at: Date): string => {
  counter = (counter + 1) % 1_000_000;
  return `notify-${at.getTime()}-${counter.toString(36)}`;
};

const baseMessage = (
  kind: NotificationEventKind,
  phase: CountdownPhase,
): string => {
  switch (kind) {
    case "warning_shown":
      return `FR2/F6: pre-erase warning shown (phase=${phase}).`;
    case "acknowledged":
      return `FR2/F6: user acknowledged pre-erase warning.`;
    case "canceled_during_grace":
      return `FR2/F6: user canceled erase during ${phase} phase.`;
    case "auto_started":
      return `FR2/F6: grace window elapsed — erase auto-started.`;
  }
};

export interface NotificationEventInput {
  phase: CountdownPhase;
  at?: Date;
  message?: string;
}

export function createNotificationEvent(
  kind: NotificationEventKind,
  input: NotificationEventInput,
): NotificationEvent {
  const at = input.at ?? new Date();
  return {
    id: nextId(at),
    kind,
    phase: input.phase,
    at,
    message: input.message ?? baseMessage(kind, input.phase),
  };
}
