import { ERASE_DURATION_MS } from "./constants";

/**
 * Scale factor for converting a 0–1 ratio into an NFR1 progress percentage.
 * Promotes the previously inlined literal `100` into a named constant so the
 * meaning is explicit at each call site.
 */
const PERCENT_SCALE = 100;

/**
 * Milliseconds-per-second conversion used when exposing elapsed / remaining
 * time to the UI in seconds. Named to avoid an unexplained `1000` literal.
 */
const MS_PER_SECOND = 1000;

export interface EraseProgressTick {
  /** NFR1 progress clamped to [0, 100]. */
  readonly percentage: number;
  /** Elapsed wall time in seconds, clamped to >= 0. */
  readonly timeElapsed: number;
  /** Remaining time in seconds until the NFR1 target, clamped to >= 0. */
  readonly timeRemaining: number;
}

/**
 * Thrown when the erase-duration constant is non-positive. A zero or negative
 * NFR1 target would produce a divide-by-zero or an inverted progress scale,
 * so the caller is told loudly instead of silently returning NaN or Infinity.
 */
export class InvalidEraseDurationError extends Error {
  constructor(durationMs: number) {
    super(
      `ERASE_DURATION_MS must be a positive, finite number; received ${durationMs}.`,
    );
    this.name = "InvalidEraseDurationError";
  }
}

/**
 * Coerces an arbitrary input into a finite, non-negative elapsed-millisecond
 * value. NaN, Infinity, and negative numbers all collapse to 0 because the
 * simulation's wall-clock tick should never regress; if the caller feeds us
 * garbage we still want a safe, forward-only progress reading rather than a
 * poisoned `NaN` that would propagate into React state and the progress bar.
 */
function normalizeElapsedMs(elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return 0;
  }
  return elapsedMs;
}

/**
 * Maps elapsed wall time to progress fields for the NFR1 erase duration.
 *
 * Defensive contract:
 *  - Non-finite or negative `elapsedMs` is treated as 0 (no backward motion).
 *  - `percentage` is clamped to [0, 100] even if `elapsedMs` exceeds the target.
 *  - `timeRemaining` is clamped to >= 0.
 *  - Throws `InvalidEraseDurationError` if the NFR1 constant is misconfigured.
 *  - The returned tick is frozen so downstream React state cannot mutate it.
 */
export function computeEraseProgressTick(elapsedMs: number): EraseProgressTick {
  if (!Number.isFinite(ERASE_DURATION_MS) || ERASE_DURATION_MS <= 0) {
    throw new InvalidEraseDurationError(ERASE_DURATION_MS);
  }

  const safeElapsedMs = normalizeElapsedMs(elapsedMs);

  const rawPercentage = (safeElapsedMs / ERASE_DURATION_MS) * PERCENT_SCALE;
  const percentage = Math.min(PERCENT_SCALE, Math.max(0, rawPercentage));

  const timeElapsed = safeElapsedMs / MS_PER_SECOND;
  const timeRemaining = Math.max(
    0,
    (ERASE_DURATION_MS - safeElapsedMs) / MS_PER_SECOND,
  );

  return Object.freeze({ percentage, timeElapsed, timeRemaining });
}
