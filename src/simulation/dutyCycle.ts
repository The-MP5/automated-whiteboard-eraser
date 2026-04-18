/**
 * F12 / FR4 — duty-cycle reducer.
 *
 * Tracks active-vs-idle time over a sliding window and flags when the
 * active ratio exceeds the configured cap so the robot cools between
 * erases and honors the thermal clause of the safety / energy
 * standard.
 *
 * Pure reducer; caller supplies `now`. No timers, no DOM.
 */

export interface DutyCycleConfig {
  /** Length of the evaluation window (ms). */
  windowMs: number;
  /** Max active / window (0..1). */
  maxActiveRatio: number;
}

export const DEFAULT_DUTY_CYCLE: DutyCycleConfig = {
  windowMs: 5 * 60_000,
  maxActiveRatio: 0.5,
};

export interface DutyCycleSample {
  active: boolean;
  at: Date | number;
}

export interface DutyCycleState {
  samples: readonly DutyCycleSample[];
  activeMs: number;
  windowMs: number;
  ratio: number;
  exceeded: boolean;
}

export const INITIAL_DUTY_CYCLE: DutyCycleState = {
  samples: [],
  activeMs: 0,
  windowMs: 0,
  ratio: 0,
  exceeded: false,
};

const toMs = (t: Date | number): number => (t instanceof Date ? t.getTime() : t);

/**
 * Append a sample and evict samples outside the window. Returns the
 * next state (immutable). `ratio` is active_ms / actual_window_ms.
 */
export function reduceDutyCycle(
  state: DutyCycleState,
  sample: DutyCycleSample,
  config: DutyCycleConfig = DEFAULT_DUTY_CYCLE,
): DutyCycleState {
  const nowMs = toMs(sample.at);
  const windowStart = nowMs - Math.max(1, config.windowMs);

  const kept: DutyCycleSample[] = [];
  for (const s of state.samples) {
    if (toMs(s.at) >= windowStart) kept.push(s);
  }
  kept.push(sample);

  let activeMs = 0;
  for (let i = 0; i < kept.length - 1; i += 1) {
    const a = kept[i];
    const b = kept[i + 1];
    const dt = toMs(b.at) - toMs(a.at);
    if (dt > 0 && a.active) activeMs += dt;
  }

  const first = toMs(kept[0].at);
  const last = toMs(kept[kept.length - 1].at);
  const actualWindowMs = Math.max(1, last - first);
  const ratio = activeMs / actualWindowMs;

  return {
    samples: kept,
    activeMs,
    windowMs: actualWindowMs,
    ratio,
    exceeded: ratio > config.maxActiveRatio,
  };
}
