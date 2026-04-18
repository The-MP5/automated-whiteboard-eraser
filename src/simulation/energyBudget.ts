/**
 * F12 / FR4 — energy budget validator.
 *
 * Pure check that a power sample (instantaneous W, average W, peak W)
 * satisfies a configured budget, consistent with the safety / energy
 * standards clause (draw caps for motors + compute + sensors).
 *
 * Returns a discriminated union so the compliance aggregator can cite
 * the specific failure mode without string matching.
 */

export interface EnergyBudget {
  /** Hard ceiling on instantaneous power (W). */
  maxInstantW: number;
  /** Ceiling on sliding average power (W). */
  maxAverageW: number;
  /** Ceiling on observed peak (W). */
  maxPeakW: number;
}

export const DEFAULT_ENERGY_BUDGET: EnergyBudget = {
  maxInstantW: 150,
  maxAverageW: 80,
  maxPeakW: 180,
};

export interface EnergySample {
  instantW: number;
  averageW: number;
  peakW: number;
  at?: Date;
}

export type EnergyCheckReason =
  | "instant_exceeded"
  | "average_exceeded"
  | "peak_exceeded"
  | "invalid_sample";

export type EnergyCheck =
  | { ok: true; sample: EnergySample }
  | { ok: false; reason: EnergyCheckReason; sample: EnergySample; limitW: number };

const finite = (n: number): boolean => Number.isFinite(n);

export function checkEnergyBudget(
  sample: EnergySample,
  budget: EnergyBudget = DEFAULT_ENERGY_BUDGET,
): EnergyCheck {
  if (!finite(sample.instantW) || !finite(sample.averageW) || !finite(sample.peakW)) {
    return { ok: false, reason: "invalid_sample", sample, limitW: 0 };
  }
  if (sample.instantW > budget.maxInstantW) {
    return { ok: false, reason: "instant_exceeded", sample, limitW: budget.maxInstantW };
  }
  if (sample.averageW > budget.maxAverageW) {
    return { ok: false, reason: "average_exceeded", sample, limitW: budget.maxAverageW };
  }
  if (sample.peakW > budget.maxPeakW) {
    return { ok: false, reason: "peak_exceeded", sample, limitW: budget.maxPeakW };
  }
  return { ok: true, sample };
}
