import type { EraseArea } from "@/types/whiteboard";

/**
 * Section-erase (F2) geometry validator.
 *
 * Pure, side-effect free. Returns a discriminated union so callers can switch
 * on the concrete failure reason without string matching. Used by FR2 command
 * guards to reject Start when the selected region is missing or malformed.
 *
 * `canvasBounds` is optional: if supplied, the selection must lie fully
 * within `[0, width] x [0, height]`. When omitted, only intrinsic checks
 * (non-null, positive dimensions, finite numbers) are performed.
 */

export type EraseAreaInvalidReason =
  | "missing"
  | "non_positive_dimensions"
  | "non_finite_coordinates"
  | "out_of_bounds";

export type EraseAreaValidation =
  | { valid: true; area: EraseArea }
  | { valid: false; reason: EraseAreaInvalidReason };

export interface CanvasBounds {
  width: number;
  height: number;
}

const isFiniteNumber = (n: number): boolean => Number.isFinite(n);

export function validateEraseArea(
  area: EraseArea | null | undefined,
  canvasBounds?: CanvasBounds,
): EraseAreaValidation {
  if (!area) return { valid: false, reason: "missing" };

  const { x, y, width, height } = area;

  if (![x, y, width, height].every(isFiniteNumber)) {
    return { valid: false, reason: "non_finite_coordinates" };
  }

  if (width <= 0 || height <= 0) {
    return { valid: false, reason: "non_positive_dimensions" };
  }

  if (canvasBounds) {
    const { width: cw, height: ch } = canvasBounds;
    const leftInside = x >= 0 && x <= cw;
    const topInside = y >= 0 && y <= ch;
    const rightInside = x + width <= cw;
    const bottomInside = y + height <= ch;
    if (!(leftInside && topInside && rightInside && bottomInside)) {
      return { valid: false, reason: "out_of_bounds" };
    }
  }

  return { valid: true, area };
}
