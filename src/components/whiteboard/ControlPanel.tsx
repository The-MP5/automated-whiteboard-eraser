import { Button } from "@/components/ui/button";
import { SystemStatus, EraseMode } from "@/types/whiteboard";
import {
  Play,
  Pause,
  Square,
  Eraser,
  Maximize2,
  Grid3X3,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

interface ControlPanelProps {
  status: SystemStatus;
  eraseMode: EraseMode;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onSetMode: (mode: EraseMode) => void;
  onSimulateObstacle: () => void;
  isObstacleSimulated: boolean;
}

const ControlPanel = ({
  status,
  eraseMode,
  onStart,
  onPause,
  onStop,
  onSetMode,
  onSimulateObstacle,
  isObstacleSimulated,
}: ControlPanelProps) => {
  const isOperating =
    status === "erasing" ||
    status === "countdown" ||
    status === "paused" ||
    status === "obstacle-detected";
  const canStart = status === "idle" || status === "completed";
  const canPause = status === "erasing";
  const canResume = status === "paused";
  const canStop = isOperating;

  const getPhaseLabel = (): { text: string; className: string } => {
    switch (status) {
      case "erasing":
        return { text: "Erasing…", className: "text-primary" };
      case "countdown":
        return { text: "Countdown…", className: "text-warning" };
      case "paused":
        return { text: "Paused", className: "text-warning" };
      case "obstacle-detected":
        return { text: "Obstacle – Halted", className: "text-danger" };
      case "completed":
        return { text: "Complete ✓", className: "text-success" };
      case "error":
        return { text: "Error", className: "text-danger" };
      default:
        return { text: "Ready", className: "text-muted-foreground" };
    }
  };

  const phase = getPhaseLabel();

  return (
    <div className="control-panel space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Erase Mode
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={eraseMode === "full" ? "toolActive" : "tool"}
            size="lg"
            onClick={() => onSetMode("full")}
            disabled={isOperating}
            className="flex-col h-auto py-4 gap-2"
            aria-pressed={eraseMode === "full"}
            aria-label="Full board erase mode"
          >
            <Maximize2 className="h-5 w-5" />
            <span className="text-xs">Full Board</span>
          </Button>
          <Button
            variant={eraseMode === "partial" ? "toolActive" : "tool"}
            size="lg"
            onClick={() => onSetMode("partial")}
            disabled={isOperating}
            className="flex-col h-auto py-4 gap-2"
            aria-pressed={eraseMode === "partial"}
            aria-label="Partial area erase mode"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs">Partial</span>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Robot Controls
          </h3>
          <span className={`text-xs font-semibold ${phase.className}`}>{phase.text}</span>
        </div>

        <div className="space-y-2">
          <Button
            variant="control"
            size="xl"
            className="w-full"
            onClick={onStart}
            disabled={!canStart && !canResume}
            aria-label={canResume ? "Resume erasing" : "Start erasing"}
          >
            {canResume ? <RotateCcw className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {canResume ? "Resume" : "Start Erase"}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="controlPause"
              size="lg"
              onClick={onPause}
              disabled={!canPause}
              aria-label="Pause erasing"
            >
              <Pause className="h-5 w-5" />
              Pause
            </Button>

            <Button
              variant="controlStop"
              size="lg"
              onClick={onStop}
              disabled={!canStop}
              aria-label="Stop erasing"
            >
              <Square className="h-5 w-5" />
              Stop
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Safety Test
        </h3>
        <Button
          variant={isObstacleSimulated ? "controlStop" : "secondary"}
          size="default"
          className="w-full"
          onClick={onSimulateObstacle}
          aria-label={
            isObstacleSimulated ? "Remove simulated obstacle" : "Simulate obstacle detection"
          }
        >
          <AlertTriangle className="h-4 w-4" />
          {isObstacleSimulated ? "Remove Obstacle" : "Simulate Obstacle"}
        </Button>
        <p className="text-xs text-muted-foreground">
          FR4: System pauses when obstacle is within 0.5 m
        </p>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eraser className="h-4 w-4" />
          <span>
            {eraseMode === "full"
              ? "Full board erase (4 ft × 6 ft)"
              : "Select area on canvas to erase"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
