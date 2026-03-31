import { ERASE_DURATION_MS } from "./constants";

export interface EraseProgressTick {
  percentage: number;
  timeElapsed: number;
  timeRemaining: number;
}

/**
 * Maps elapsed wall time to progress fields for NFR1 erase duration.
 */
export function computeEraseProgressTick(elapsedMs: number): EraseProgressTick {
  const percentage = Math.min(100, (elapsedMs / ERASE_DURATION_MS) * 100);
  const timeElapsed = elapsedMs / 1000;
  const timeRemaining = Math.max(0, (ERASE_DURATION_MS - elapsedMs) / 1000);
  return { percentage, timeElapsed, timeRemaining };
}
