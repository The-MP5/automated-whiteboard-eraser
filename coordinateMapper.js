/**
 * Maps UI coordinates (0–1 normalized) to physical board coordinates
 * @param {number} x - normalized x (0 to 1)
 * @param {number} y - normalized y (0 to 1)
 * @param {object} board - board dimensions { width, height }
 * @returns {{x: number, y: number}}
 */

export function mapCoordinates(x, y, board) {
  // Defensive input validation (THIS IS YOUR "IMPROVE" STEP)
  if (typeof x !== "number" || typeof y !== "number") {
    throw new Error("Invalid input: coordinates must be numbers");
  }

  if (x < 0 || x > 1 || y < 0 || y > 1) {
    throw new Error("Coordinates must be normalized between 0 and 1");
  }

  if (!board || typeof board.width !== "number" || typeof board.height !== "number") {
    throw new Error("Invalid board dimensions");
  }

  const mappedX = x * board.width;
  const mappedY = y * board.height;

  return { x: mappedX, y: mappedY };
}
