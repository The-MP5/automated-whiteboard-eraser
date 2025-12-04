import { useEffect, useState } from "react";
import { AlertTriangle, Volume2 } from "lucide-react";

interface CountdownOverlayProps {
  seconds: number;
  onComplete: () => void;
  onCancel: () => void;
  isActive: boolean;
}

const CountdownOverlay = ({ 
  seconds, 
  onComplete, 
  onCancel, 
  isActive 
}: CountdownOverlayProps) => {
  const [currentSeconds, setCurrentSeconds] = useState(seconds);

  useEffect(() => {
    if (!isActive) {
      setCurrentSeconds(seconds);
      return;
    }

    if (currentSeconds <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setCurrentSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, currentSeconds, onComplete, seconds]);

  useEffect(() => {
    if (isActive) {
      setCurrentSeconds(seconds);
    }
  }, [isActive, seconds]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in">
      <div className="text-center space-y-8">
        {/* Warning Icon */}
        <div className="flex items-center justify-center gap-3 text-warning animate-pulse-glow">
          <AlertTriangle className="h-8 w-8" />
          <Volume2 className="h-8 w-8" />
        </div>

        {/* Main Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide">
            Erase Operation Starting
          </h2>
          <p className="text-lg text-muted-foreground">
            Clear the whiteboard area immediately
          </p>
        </div>

        {/* Countdown Number */}
        <div className="relative">
          <div 
            className="text-[180px] font-bold font-mono text-primary leading-none animate-countdown"
            style={{ textShadow: '0 0 60px hsl(185 75% 50% / 0.6)' }}
          >
            {currentSeconds}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-72 h-72 -rotate-90">
              <circle
                cx="144"
                cy="144"
                r="130"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
              />
              <circle
                cx="144"
                cy="144"
                r="130"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 130}
                strokeDashoffset={2 * Math.PI * 130 * (1 - currentSeconds / seconds)}
                className="transition-all duration-1000 ease-linear"
                style={{ filter: 'drop-shadow(0 0 10px hsl(185 75% 50% / 0.5))' }}
              />
            </svg>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="px-8 py-3 bg-danger text-danger-foreground font-bold uppercase tracking-wider rounded-lg shadow-glow-danger hover:bg-danger/90 transition-all active:scale-95"
        >
          Cancel Operation
        </button>

        {/* Info */}
        <p className="text-sm text-muted-foreground">
          Student Story 6: 10-second warning before erase operation
        </p>
      </div>
    </div>
  );
};

export default CountdownOverlay;
