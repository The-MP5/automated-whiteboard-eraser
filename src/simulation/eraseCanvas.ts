import { Canvas as FabricCanvas } from "fabric";
import type { EraseArea, EraseMode } from "@/types/whiteboard";

/**
 * Applies full-board clear or partial region removal on a Fabric canvas.
 * FR1/FR2: digital erase behavior; kept pure of React.
 */
export function applyEraseToCanvas(
  canvas: FabricCanvas,
  eraseMode: EraseMode,
  partialArea: EraseArea | null
): void {
  if (eraseMode === "full") {
    canvas.clear();
    canvas.backgroundColor = "#f8fafc";
  } else if (partialArea) {
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      const objBounds = obj.getBoundingRect();
      if (
        objBounds.left >= partialArea.x &&
        objBounds.top >= partialArea.y &&
        objBounds.left + objBounds.width <= partialArea.x + partialArea.width &&
        objBounds.top + objBounds.height <= partialArea.y + partialArea.height
      ) {
        canvas.remove(obj);
      }
    });
  }
  canvas.renderAll();
}
