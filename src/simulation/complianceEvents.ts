import type { ComplianceFindingCode, ComplianceStatus } from "./safetyCompliance";

/**
 * F12 / FR4 compliance audit events. Typed factories for the audit
 * trail, mirroring `SafetyEvent` / `NotificationEvent` / `VoiceEvent`.
 * Pure; timestamps injectable for deterministic tests.
 */

export type ComplianceEventKind =
  | "budget_exceeded"
  | "duty_cycle_exceeded"
  | "estop_verified"
  | "compliance_pass"
  | "compliance_warn"
  | "compliance_fail";

export interface ComplianceEvent {
  id: string;
  kind: ComplianceEventKind;
  status: ComplianceStatus;
  findingCode: ComplianceFindingCode | null;
  at: Date;
  message: string;
  detail?: Record<string, number | string>;
}

let counter = 0;
const nextId = (at: Date): string => {
  counter = (counter + 1) % 1_000_000;
  return `compliance-${at.getTime()}-${counter.toString(36)}`;
};

const baseMessage = (kind: ComplianceEventKind): string => {
  switch (kind) {
    case "budget_exceeded":
      return "FR4/F12: energy budget exceeded.";
    case "duty_cycle_exceeded":
      return "FR4/F12: duty-cycle exceeded — cooling required.";
    case "estop_verified":
      return "FR4/F12: E-stop verified — Start permitted.";
    case "compliance_pass":
      return "FR4/F12: compliance check passed.";
    case "compliance_warn":
      return "FR4/F12: compliance warning.";
    case "compliance_fail":
      return "FR4/F12: compliance failed — operation blocked.";
  }
};

export interface ComplianceEventInput {
  status: ComplianceStatus;
  findingCode?: ComplianceFindingCode | null;
  at?: Date;
  message?: string;
  detail?: Record<string, number | string>;
}

export function createComplianceEvent(
  kind: ComplianceEventKind,
  input: ComplianceEventInput,
): ComplianceEvent {
  const at = input.at ?? new Date();
  return {
    id: nextId(at),
    kind,
    status: input.status,
    findingCode: input.findingCode ?? null,
    at,
    message: input.message ?? baseMessage(kind),
    detail: input.detail,
  };
}
