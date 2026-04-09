import { SystemStatus, EraseProgress, ProximitySensor, ArmRuntimeState } from "@/types/whiteboard";
import { AlertTriangle, CheckCircle, Loader2, Pause, Radio, Shield } from "lucide-react";

interface StatusDisplayProps {
  status: SystemStatus;
  progress: EraseProgress | null;
  proximitySensor: ProximitySensor;
  armState: ArmRuntimeState;
}

const StatusDisplay = ({ status, progress, proximitySensor, armState }: StatusDisplayProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          label: 'System Ready',
          icon: CheckCircle,
          className: 'status-safe',
        };
      case 'countdown':
        return {
          label: 'Countdown Active',
          icon: Radio,
          className: 'status-warning',
        };
      case 'erasing':
        return {
          label: 'Erasing in Progress',
          icon: Loader2,
          className: 'status-indicator bg-primary/20 text-primary glow-primary',
        };
      case 'paused':
        return {
          label: 'Operation Paused',
          icon: Pause,
          className: 'status-warning',
        };
      case 'obstacle-detected':
        return {
          label: 'Obstacle Detected',
          icon: AlertTriangle,
          className: 'status-danger',
        };
      case 'completed':
        return {
          label: 'Erase Complete',
          icon: CheckCircle,
          className: 'status-safe',
        };
      case 'error':
        return {
          label: 'System Error',
          icon: AlertTriangle,
          className: 'status-danger',
        };
      default:
        return {
          label: 'Unknown',
          icon: Radio,
          className: 'status-indicator bg-muted text-muted-foreground',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="control-panel space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        System Status
      </h3>

      {/* Main Status */}
      <div className={`${config.className} justify-center`}>
        <Icon className={`h-4 w-4 ${status === 'erasing' ? 'animate-spin' : ''}`} />
        <span>{config.label}</span>
      </div>

      {/* Progress Display */}
      {progress && (status === 'erasing' || status === 'paused' || status === 'obstacle-detected') && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono text-primary">{Math.round(progress.percentage)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>Elapsed: {progress.timeElapsed.toFixed(1)}s</span>
            <span>Remaining: {progress.timeRemaining.toFixed(1)}s</span>
          </div>
        </div>
      )}

      {/* Proximity Sensor */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Proximity Sensor
          </span>
          <span className={`text-xs font-mono ${
            proximitySensor.isObstacleDetected ? 'text-danger' : 'text-success'
          }`}>
            {proximitySensor.isObstacleDetected ? 'BLOCKED' : 'CLEAR'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                proximitySensor.distance < proximitySensor.threshold 
                  ? 'bg-danger' 
                  : 'bg-success'
              }`}
              style={{ 
                width: `${Math.min(100, (proximitySensor.distance / 2) * 100)}%` 
              }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground w-14 text-right">
            {proximitySensor.distance.toFixed(2)}m
          </span>
        </div>
      </div>

      {/* FR3 Robotic Arm State */}
      <div className="pt-2 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Arm State</span>
          <span className={`font-mono text-xs ${armState.lastError ? "text-danger" : "text-success"}`}>
            {armState.lastError ? "FAULT" : "READY"}
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          Pose: ({Math.round(armState.pose.x)}, {Math.round(armState.pose.y)}) mm
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          Joints: B {armState.joints.baseDeg.toFixed(1)}° / S {armState.joints.shoulderDeg.toFixed(1)}° / E {armState.joints.elbowDeg.toFixed(1)}°
        </div>
        <div className="text-xs text-muted-foreground">
          Calibration: {armState.isCalibrated ? "complete" : "pending"} · Home: {armState.isHomed ? "set" : "not set"}
        </div>
        <div className="text-xs text-muted-foreground">
          Telemetry points: {armState.telemetry.length}
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;
