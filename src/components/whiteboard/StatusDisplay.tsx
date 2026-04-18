import { SystemStatus, EraseProgress, ProximitySensor, CommandAudit } from "@/types/whiteboard";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Loader2, Pause, Radio, Shield } from "lucide-react";

interface StatusDisplayProps {
  status: SystemStatus;
  progress: EraseProgress | null;
  proximitySensor: ProximitySensor;
  commandAudit: CommandAudit;
}

const StatusDisplay = ({ status, progress, proximitySensor, commandAudit }: StatusDisplayProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "idle":
        return { label: "System Ready", icon: CheckCircle, className: "status-safe" };
      case "countdown":
        return { label: "Countdown Active", icon: Radio, className: "status-warning" };
      case "erasing":
        return {
          label: "Erasing in Progress",
          icon: Loader2,
          className: "status-indicator bg-primary/20 text-primary glow-primary",
        };
      case "paused":
        return { label: "Operation Paused", icon: Pause, className: "status-warning" };
      case "obstacle-detected":
        return { label: "Obstacle Detected", icon: AlertTriangle, className: "status-danger" };
      case "completed":
        return { label: "Erase Complete", icon: CheckCircle, className: "status-safe" };
      case "error":
        return { label: "System Error", icon: AlertTriangle, className: "status-danger" };
      default:
        return {
          label: "Unknown",
          icon: Radio,
          className: "status-indicator bg-muted text-muted-foreground",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const getProximityLabel = (): string => {
    if (proximitySensor.isObstacleDetected) return "BLOCKED";
    if (proximitySensor.distance < 1) return "NEAR";
    return "CLEAR";
  };

  const proximityLabel = getProximityLabel();
  const proximityPercent = Math.min(100, (proximitySensor.distance / 2) * 100);

  return (
    <div className="control-panel space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        System Status
      </h3>

      <div
        className={`${config.className} justify-center`}
        role="status"
        aria-live="polite"
        aria-label={`System status: ${config.label}`}
      >
        <Icon className={`h-4 w-4 ${status === "erasing" ? "animate-spin" : ""}`} />
        <span>{config.label}</span>
      </div>

      {progress &&
        (status === "erasing" || status === "paused" || status === "obstacle-detected") && (
          <div className="space-y-2" role="region" aria-label="Erase progress">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono font-semibold text-primary">
                {Math.round(progress.percentage)}%
              </span>
            </div>

            <Progress
              value={progress.percentage}
              className="h-3"
              aria-label={`Erase progress: ${Math.round(progress.percentage)} percent`}
            />

            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>Elapsed: {progress.timeElapsed.toFixed(1)}s</span>
              <span>Remaining: {progress.timeRemaining.toFixed(1)}s</span>
            </div>

            {progress.isPaused && (
              <p className="text-xs font-medium text-warning text-center animate-pulse-glow">
                Paused — press Resume to continue
              </p>
            )}
          </div>
        )}

      <div className="pt-2 border-t border-border" role="region" aria-label="Proximity sensor">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Proximity Sensor
          </span>
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
              proximitySensor.isObstacleDetected
                ? "bg-danger/15 text-danger"
                : proximityLabel === "NEAR"
                  ? "bg-warning/15 text-warning"
                  : "bg-success/15 text-success"
            }`}
          >
            {proximityLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                proximitySensor.distance < proximitySensor.threshold
                  ? "bg-danger"
                  : proximitySensor.distance < 1
                    ? "bg-warning"
                    : "bg-success"
              }`}
              style={{ width: `${proximityPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground w-16 text-right">
            {proximitySensor.distance.toFixed(2)} m
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground mt-1">
          FR4 threshold: {proximitySensor.threshold} m
        </p>
      </div>

      <div className="pt-2 border-t border-border text-xs" role="log" aria-label="Command audit log">
        <p className="text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
          Command Audit (FR2)
        </p>
        <div className="space-y-0.5 font-mono">
          <p>
            Last:{" "}
            <span className="font-semibold">
              {commandAudit.lastCommand ? commandAudit.lastCommand.toUpperCase() : "N/A"}
            </span>
          </p>
          {commandAudit.lastCommandAt && (
            <p className="text-muted-foreground">
              At: {commandAudit.lastCommandAt.toLocaleTimeString()}
            </p>
          )}
        </div>
        {commandAudit.rejectedCommandReason && (
          <p className="text-danger mt-1 font-medium">{commandAudit.rejectedCommandReason}</p>
        )}
      </div>
    </div>
  );
};

export default StatusDisplay;
