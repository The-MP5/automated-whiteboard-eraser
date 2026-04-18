import type { ProximityZone } from "./proximityClassifier";

/**
 * F5 / FR4 — hysteresis for proximity transitions.
 *
 * Raw sensor streams flap: one noisy reading can cross a threshold and
 * trip a pause, the next reading clears it, and the erase state
 * oscillates. This reducer requires N consecutive samples of the same
 * candidate zone before the committed zone changes.
 *
 * Direction-aware:
 *   - Into a more-dangerous zone (clear→warning, warning→danger,
 *     clear→danger) commits after `escalateSamples`.
 *   - Into a less-dangerous zone (danger→warning, warning→clear,
 *     danger→clear) commits after `deescalateSamples` — usually larger,
 *     so we're conservative about resuming.
 *
 * Pure reducer: `reduceProximityHysteresis(state, sample, config) =>
 * nextState`. No timers, no DOM. The caller (React hook, robot runner)
 * owns the clock and the sample cadence.
 */

export interface HysteresisConfig {
  escalateSamples: number;
  deescalateSamples: number;
}

export const DEFAULT_HYSTERESIS: HysteresisConfig = {
  escalateSamples: 1,
  deescalateSamples: 3,
};

export interface ProximityHysteresisState {
  committedZone: ProximityZone;
  candidateZone: ProximityZone;
  candidateRunLength: number;
}

export function initialHysteresisState(
  zone: ProximityZone = "clear",
): ProximityHysteresisState {
  return {
    committedZone: zone,
    candidateZone: zone,
    candidateRunLength: 0,
  };
}

const severity: Record<ProximityZone, number> = {
  clear: 0,
  warning: 1,
  danger: 2,
};

const isEscalation = (from: ProximityZone, to: ProximityZone): boolean =>
  severity[to] > severity[from];

export function reduceProximityHysteresis(
  state: ProximityHysteresisState,
  sampleZone: ProximityZone,
  config: HysteresisConfig = DEFAULT_HYSTERESIS,
): ProximityHysteresisState {
  if (sampleZone === state.committedZone) {
    return {
      committedZone: state.committedZone,
      candidateZone: state.committedZone,
      candidateRunLength: 0,
    };
  }

  const nextRun =
    state.candidateZone === sampleZone ? state.candidateRunLength + 1 : 1;

  const required = isEscalation(state.committedZone, sampleZone)
    ? Math.max(1, config.escalateSamples)
    : Math.max(1, config.deescalateSamples);

  if (nextRun >= required) {
    return {
      committedZone: sampleZone,
      candidateZone: sampleZone,
      candidateRunLength: 0,
    };
  }

  return {
    committedZone: state.committedZone,
    candidateZone: sampleZone,
    candidateRunLength: nextRun,
  };
}
