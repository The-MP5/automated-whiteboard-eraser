import { Button } from "@/components/ui/button";
import { SystemStatus, EraseMode } from "@/types/whiteboard";
import { 
  Play, 
  Pause, 
  Square, 
  Eraser, 
  Maximize2, 
  Grid3X3,
  AlertTriangle
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
  const isOperating = status === 'erasing' || status === 'countdown' || status === 'paused' || status === 'obstacle-detected';
  const canStart = status === 'idle' || status === 'completed';
  const canPause = status === 'erasing';
  const canResume = status === 'paused';
  const canStop = isOperating;

  return (
    <div className="control-panel space-y-6">
      {/* Erase Mode Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Erase Mode
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={eraseMode === 'full' ? 'toolActive' : 'tool'}
            size="lg"
            onClick={() => onSetMode('full')}
            disabled={isOperating}
            className="flex-col h-auto py-4 gap-2"
          >
            <Maximize2 className="h-5 w-5" />
            <span className="text-xs">Full Board</span>
          </Button>
          <Button
            variant={eraseMode === 'partial' ? 'toolActive' : 'tool'}
            size="lg"
            onClick={() => onSetMode('partial')}
            disabled={isOperating}
            className="flex-col h-auto py-4 gap-2"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs">Partial</span>
          </Button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Robot Controls
        </h3>
        <div className="space-y-2">
          {/* Start/Resume Button */}
          <Button
            variant="control"
            size="xl"
            className="w-full"
            onClick={onStart}
            disabled={!canStart && !canResume}
          >
            <Play className="h-5 w-5" />
            {canResume ? 'Resume' : 'Start Erase'}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            {/* Pause Button */}
            <Button
              variant="controlPause"
              size="lg"
              onClick={onPause}
              disabled={!canPause}
            >
              <Pause className="h-5 w-5" />
              Pause
            </Button>

            {/* Stop Button */}
            <Button
              variant="controlStop"
              size="lg"
              onClick={onStop}
              disabled={!canStop}
            >
              <Square className="h-5 w-5" />
              Stop
            </Button>
          </div>
        </div>
      </div>

      {/* Safety Simulation */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Safety Test
        </h3>
        <Button
          variant={isObstacleSimulated ? 'controlStop' : 'secondary'}
          size="default"
          className="w-full"
          onClick={onSimulateObstacle}
        >
          <AlertTriangle className="h-4 w-4" />
          {isObstacleSimulated ? 'Remove Obstacle' : 'Simulate Obstacle'}
        </Button>
        <p className="text-xs text-muted-foreground">
          FR4: System pauses when obstacle is within 0.5m
        </p>
      </div>

      {/* Mode Info */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eraser className="h-4 w-4" />
          <span>
            {eraseMode === 'full' 
              ? 'Full board erase (4ft × 6ft)' 
              : 'Select area on canvas to erase'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
