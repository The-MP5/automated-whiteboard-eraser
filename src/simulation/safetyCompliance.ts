import type { ProximityZone } from "./proximityClassifier";
import {
  checkEnergyBudget,
  type EnergyBudget,
  type EnergySample,
} from "./energyBudget";
import type { DutyCycleState } from "./dutyCycle";

/**
 * F12 / FR4 — safety + energy compliance aggregator.
 *
 * Composes the three independent signals (proximity zone, energy
 * budget check, duty-cycle reducer output) into a single typed
 * `ComplianceReport`. Single decision surface FR4 can cite when
 * refusing to Start a trajectory or halting mid-run.
 *
 * Pure — no timers, no DOM, no external state.
 */

export type ComplianceFindingCode =
  | "proximity_danger"
  | "proximity_warning"
  | "energy_instant_exceeded"
  | "energy_average_exceeded"
  | "energy_peak_exceeded"
  | "energy_invalid_sample"
  | "duty_cycle_exceeded"
  | "estop_not_verified";

export type ComplianceSeverity = "info" | "warn" | "fail";

export interface ComplianceFinding {
  code: ComplianceFindingCode;
  severity: ComplianceSeverity;
  message: string;
  detail?: Record<string, number | string>;
}

export type ComplianceStatus = "pass" | "warn" | "fail";

export interface ComplianceReport {
  status: ComplianceStatus;
  findings: readonly ComplianceFinding[];
}

export interface ComplianceInput {
  proximityZone: ProximityZone;
  energy?: { sample: EnergySample; budget?: EnergyBudget };
  duty?: DutyCycleState;
  estopVerified?: boolean;
}

const highestSeverity = (findings: readonly ComplianceFinding[]): ComplianceStatus => {
  let status: ComplianceStatus = "pass";
  for (const f of findings) {
    if (f.severity === "fail") return "fail";
    if (f.severity === "warn") status = "warn";
  }
  return status;
};

export function evaluateCompliance(input: ComplianceInput): ComplianceReport {
  const findings: ComplianceFinding[] = [];

  if (input.proximityZone === "danger") {
    findings.push({
      code: "proximity_danger",
      severity: "fail",
      message: "FR4: student in danger zone — robot must not operate.",
    });
  } else if (input.proximityZone === "warning") {
    findings.push({
      code: "proximity_warning",
      severity: "warn",
      message: "FR4: student in warning zone — proceed with caution.",
    });
  }

  if (input.energy) {
    const check = checkEnergyBudget(input.energy.sample, input.energy.budget);
    if (!check.ok) {
      const severity: ComplianceSeverity =
        check.reason === "invalid_sample" ? "warn" : "fail";
      const code: ComplianceFindingCode =
        check.reason === "instant_exceeded"
          ? "energy_instant_exceeded"
          : check.reason === "average_exceeded"
            ? "energy_average_exceeded"
            : check.reason === "peak_exceeded"
              ? "energy_peak_exceeded"
              : "energy_invalid_sample";
      findings.push({
        code,
        severity,
        message: `FR4/F12: energy budget violated (${check.reason.replace(/_/g, " ")}).`,
        detail: { limitW: check.limitW },
      });
    }
  }

  if (input.duty?.exceeded) {
    findings.push({
      code: "duty_cycle_exceeded",
      severity: "fail",
      message: "FR4/F12: duty-cycle exceeded — robot must cool before next run.",
      detail: { ratio: Number(input.duty.ratio.toFixed(3)) },
    });
  }

  if (input.estopVerified === false) {
    findings.push({
      code: "estop_not_verified",
      severity: "fail",
      message: "FR4/F12: E-stop verification missing — refuse to Start.",
    });
  }

  return {
    status: highestSeverity(findings),
    findings,
  };
}
