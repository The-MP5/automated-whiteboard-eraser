/**
 * FR1 — Digital Interface for Input (Subissue 7.1).
 * Hosts the Fabric.js surface: pencil, selection, text, partial-erase rectangle,
 * and snapshot/clear/undo. See docs/FR1_SUBISSUE_7_1.md for decomposition and acceptance tests.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, PencilBrush, Rect, FabricText } from "fabric";
import { Button } from "@/components/ui/button";
import { EraseMode, EraseArea } from "@/types/whiteboard";
import {
  WHITEBOARD_CANVAS_BACKGROUND_COLOR,
  WHITEBOARD_CANVAS_MAX_HEIGHT_PX,
  WHITEBOARD_CANVAS_HEIGHT_VIEWPORT_RATIO,
} from "@/config/simulation";
import { 
  Pencil, 
  Type, 
  MousePointer, 
  Trash2, 
  Undo, 
  Download 
} from "lucide-react";

interface WhiteboardCanvasProps {
  eraseMode: EraseMode;
  isErasing: boolean;
  eraseProgress: number;
  partialArea: EraseArea | null;
  onSetPartialArea: (area: EraseArea | null) => void;
  onCanvasReady: (canvas: FabricCanvas) => void;
  onSaveSnapshot: () => void;
}

type Tool = 'select' | 'draw' | 'text';

const WhiteboardCanvas = ({
  eraseMode,
  isErasing,
  eraseProgress,
  partialArea,
  onSetPartialArea,
  onCanvasReady,
  onSaveSnapshot,
}: WhiteboardCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('draw');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionRect, setSelectionRect] = useState<EraseArea | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = Math.min(
      WHITEBOARD_CANVAS_MAX_HEIGHT_PX,
      window.innerHeight * WHITEBOARD_CANVAS_HEIGHT_VIEWPORT_RATIO,
    );

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: WHITEBOARD_CANVAS_BACKGROUND_COLOR,
      isDrawingMode: true,
    });

    // Initialize drawing brush
    const brush = new PencilBrush(canvas);
    brush.color = "#1e293b";
    brush.width = 3;
    canvas.freeDrawingBrush = brush;

    // Add some initial content for demonstration
    const welcomeText = new FabricText("Welcome to the Automated Whiteboard Eraser", {
      left: 50,
      top: 30,
      fontSize: 24,
      fontFamily: "Inter",
      fill: "#0f172a",
      selectable: true,
    });

    const infoText = new FabricText("Draw on the canvas to add content • Select an area for partial erase", {
      left: 50,
      top: 70,
      fontSize: 14,
      fontFamily: "Inter",
      fill: "#64748b",
      selectable: true,
    });

    canvas.add(welcomeText);
    canvas.add(infoText);
    canvas.renderAll();

    setFabricCanvas(canvas);
    onCanvasReady(canvas);

    const handleResize = () => {
      const newWidth = container.offsetWidth;
      canvas.setDimensions({ width: newWidth, height });
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, [onCanvasReady]);

  useEffect(() => {
    if (!fabricCanvas) return;

    if (activeTool === 'draw') {
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.selection = false;
    } else if (activeTool === 'select') {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = true;
    } else {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = true;
    }
  }, [activeTool, fabricCanvas]);

  const handleToolChange = useCallback((tool: Tool) => {
    setActiveTool(tool);
  }, []);

  const handleAddText = useCallback(() => {
    if (!fabricCanvas) return;
    const text = new FabricText("New Text", {
      left: 100,
      top: 100,
      fontSize: 20,
      fontFamily: "Inter",
      fill: "#0f172a",
      selectable: true,
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    setActiveTool('select');
  }, [fabricCanvas]);

  const handleClear = useCallback(() => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = WHITEBOARD_CANVAS_BACKGROUND_COLOR;
    fabricCanvas.renderAll();
  }, [fabricCanvas]);

  const handleUndo = useCallback(() => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length > 0) {
      fabricCanvas.remove(objects[objects.length - 1]);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

  // Partial area selection handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (eraseMode !== 'partial' || isErasing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionRect({ x, y, width: 0, height: 0 });
  }, [eraseMode, isErasing]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectionRect({
      x: Math.min(selectionStart.x, x),
      y: Math.min(selectionStart.y, y),
      width: Math.abs(x - selectionStart.x),
      height: Math.abs(y - selectionStart.y),
    });
  }, [isSelecting, selectionStart]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting || !selectionRect) return;
    
    setIsSelecting(false);
    if (selectionRect.width > 20 && selectionRect.height > 20) {
      onSetPartialArea(selectionRect);
    } else {
      setSelectionRect(null);
    }
  }, [isSelecting, selectionRect, onSetPartialArea]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isErasing) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "d") handleToolChange("draw");
      if (key === "s") handleToolChange("select");
      if (key === "t") handleAddText();
      if (key === "u") handleUndo();
      if (key === "delete" || key === "backspace") handleClear();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isErasing, handleAddText, handleClear, handleToolChange, handleUndo]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2" role="toolbar" aria-label="Whiteboard input tools">
          <Button
            variant={activeTool === 'select' ? 'toolActive' : 'tool'}
            size="iconSm"
            onClick={() => handleToolChange('select')}
            disabled={isErasing}
            aria-label="Select tool (shortcut: S)"
            title="Select tool (S)"
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === 'draw' ? 'toolActive' : 'tool'}
            size="iconSm"
            onClick={() => handleToolChange('draw')}
            disabled={isErasing}
            aria-label="Draw tool (shortcut: D)"
            title="Draw tool (D)"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="tool"
            size="iconSm"
            onClick={handleAddText}
            disabled={isErasing}
            aria-label="Add text (shortcut: T)"
            title="Add text (T)"
          >
            <Type className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="tool"
            size="iconSm"
            onClick={handleUndo}
            disabled={isErasing}
            aria-label="Undo last object (shortcut: U)"
            title="Undo (U)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="tool"
            size="iconSm"
            onClick={handleClear}
            disabled={isErasing}
            aria-label="Clear board (shortcut: Delete)"
            title="Clear board (Delete)"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onSaveSnapshot}
          disabled={isErasing}
          aria-label="Save whiteboard snapshot"
        >
          <Download className="h-4 w-4" />
          Save Snapshot
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        FR1 quick keys: <span className="font-mono">D</span> draw, <span className="font-mono">S</span> select, <span className="font-mono">T</span> text, <span className="font-mono">U</span> undo, <span className="font-mono">Delete</span> clear.
      </p>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="relative canvas-container"
        role="application"
        aria-label="Digital whiteboard: draw, select, or place text. Drag to select a partial erase region when partial mode is on."
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => isSelecting && handleMouseUp()}
      >
        <canvas ref={canvasRef} className="max-w-full" />

        {/* Erase Progress Overlay */}
        {isErasing && (
          <div 
            className="absolute inset-0 bg-primary/10 pointer-events-none overflow-hidden"
          >
            <div 
              className="absolute inset-y-0 left-0 bg-primary/30"
              style={{ width: `${eraseProgress}%`, transition: 'width 0.1s linear' }}
            >
              <div className="absolute right-0 inset-y-0 w-2 bg-primary animate-pulse" />
            </div>
          </div>
        )}

        {/* Partial Selection Overlay */}
        {eraseMode === 'partial' && !isErasing && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Selection guide */}
            {!partialArea && !selectionRect && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <p className="text-muted-foreground text-sm bg-card px-4 py-2 rounded-lg border border-border">
                  Click and drag to select area for partial erase
                </p>
              </div>
            )}

            {/* Active selection rectangle */}
            {(selectionRect || partialArea) && (
              <div 
                className="absolute border-2 border-dashed border-primary bg-primary/10"
                style={{
                  left: (selectionRect || partialArea)!.x,
                  top: (selectionRect || partialArea)!.y,
                  width: (selectionRect || partialArea)!.width,
                  height: (selectionRect || partialArea)!.height,
                }}
              />
            )}
          </div>
        )}

        {/* Board Dimensions Label */}
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded">
          Simulated board: 4ft × 6ft
        </div>
      </div>
    </div>
  );
};

export default WhiteboardCanvas;
