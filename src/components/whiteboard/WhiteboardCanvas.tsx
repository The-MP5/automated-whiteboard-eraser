import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, PencilBrush, Rect, FabricText } from "fabric";
import { Button } from "@/components/ui/button";
import { EraseMode, EraseArea } from "@/types/whiteboard";
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
    const height = Math.min(500, window.innerHeight * 0.5);

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#f8fafc",
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

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
  };

  const handleAddText = () => {
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
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#f8fafc";
    fabricCanvas.renderAll();
  };

  const handleUndo = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length > 0) {
      fabricCanvas.remove(objects[objects.length - 1]);
      fabricCanvas.renderAll();
    }
  };

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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTool === 'select' ? 'toolActive' : 'tool'}
            size="iconSm"
            onClick={() => handleToolChange('select')}
            disabled={isErasing}
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === 'draw' ? 'toolActive' : 'tool'}
            size="iconSm"
            onClick={() => handleToolChange('draw')}
            disabled={isErasing}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="tool"
            size="iconSm"
            onClick={handleAddText}
            disabled={isErasing}
          >
            <Type className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="tool"
            size="iconSm"
            onClick={handleUndo}
            disabled={isErasing}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="tool"
            size="iconSm"
            onClick={handleClear}
            disabled={isErasing}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onSaveSnapshot}
          disabled={isErasing}
        >
          <Download className="h-4 w-4" />
          Save Snapshot
        </Button>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="relative canvas-container"
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
          Simulated: 4ft × 6ft (NFR1)
        </div>
      </div>
    </div>
  );
};

export default WhiteboardCanvas;
