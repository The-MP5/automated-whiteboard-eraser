import type { CommandAction } from "@/types/whiteboard";

/**
 * F8 voice audit events. Typed factories mirroring `SafetyEvent` /
 * `NotificationEvent` so the audit log records *why* a voice command
 * was honored or dropped. Pure; timestamps are injectable.
 */

export type VoiceEventKind =
  | "utterance_heard"
  | "intent_parsed"
  | "intent_rejected"
  | "wake_word_missed";

export interface VoiceEvent {
  id: string;
  kind: VoiceEventKind;
  action: CommandAction | null;
  confidence: number | null;
  transcript: string;
  at: Date;
  message: string;
}

let counter = 0;
const nextId = (at: Date): string => {
  counter = (counter + 1) % 1_000_000;
  return `voice-${at.getTime()}-${counter.toString(36)}`;
};

const baseMessage = (
  kind: VoiceEventKind,
  action: CommandAction | null,
  confidence: number | null,
): string => {
  switch (kind) {
    case "utterance_heard":
      return `FR2/F8: utterance captured.`;
    case "intent_parsed":
      return `FR2/F8: intent '${action ?? "unknown"}' parsed (confidence=${confidence?.toFixed(2) ?? "n/a"}).`;
    case "intent_rejected":
      return `FR2/F8: voice intent rejected (confidence=${confidence?.toFixed(2) ?? "n/a"}).`;
    case "wake_word_missed":
      return `FR2/F8: wake word missing — utterance ignored.`;
  }
};

export interface VoiceEventInput {
  action?: CommandAction | null;
  confidence?: number | null;
  transcript: string;
  at?: Date;
  message?: string;
}

export function createVoiceEvent(
  kind: VoiceEventKind,
  input: VoiceEventInput,
): VoiceEvent {
  const at = input.at ?? new Date();
  const action = input.action ?? null;
  const confidence = input.confidence ?? null;
  return {
    id: nextId(at),
    kind,
    action,
    confidence,
    transcript: input.transcript,
    at,
    message: input.message ?? baseMessage(kind, action, confidence),
  };
}
