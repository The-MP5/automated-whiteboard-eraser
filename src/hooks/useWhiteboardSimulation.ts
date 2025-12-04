import { useState, useCallback, useRef } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { 
  SystemStatus, 
  EraseMode, 
  EraseArea, 
  SavedNote, 
  SystemLog, 
  ProximitySensor,
  EraseProgress 
} from "@/types/whiteboard";
import { toast } from "sonner";

const COUNTDOWN_SECONDS = 10;
const ERASE_DURATION_MS = 10000; // NFR1: 10 seconds for full board
const PROXIMITY_THRESHOLD = 0.5; // FR4: 0.5 meters

export const useWhiteboardSimulation = () => {
  const [status, setStatus] = useState<SystemStatus>('idle');
  const [eraseMode, setEraseMode] = useState<EraseMode>('full');
  const [partialArea, setPartialArea] = useState<EraseArea | null>(null);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [progress, setProgress] = useState<EraseProgress | null>(null);
  const [isObstacleSimulated, setIsObstacleSimulated] = useState(false);
  const [proximitySensor, setProximitySensor] = useState<ProximitySensor>({
    isObstacleDetected: false,
    distance: 2.0,
    threshold: PROXIMITY_THRESHOLD,
  });

  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const eraseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<number>(0);

  const addLog = useCallback((type: SystemLog['type'], message: string) => {
    const log: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      message,
    };
    setLogs(prev => [...prev, log]);
  }, []);

  const setCanvas = useCallback((canvas: FabricCanvas) => {
    fabricCanvasRef.current = canvas;
    addLog('info', 'Canvas initialized successfully');
  }, [addLog]);

  const saveSnapshot = useCallback(() => {
    if (!fabricCanvasRef.current) {
      addLog('error', 'Cannot save snapshot: Canvas not available');
      return;
    }

    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    const note: SavedNote = {
      id: `note-${Date.now()}`,
      timestamp: new Date(),
      imageData: dataUrl,
      name: `Snapshot ${new Date().toLocaleTimeString()}`,
    };

    setNotes(prev => [...prev, note]);
    addLog('success', `Snapshot saved: ${note.name}`);
    toast.success("Snapshot saved to Notes");
  }, [addLog]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    addLog('info', 'Snapshot deleted');
  }, [addLog]);

  const downloadNote = useCallback((note: SavedNote) => {
    const link = document.createElement('a');
    link.download = `${note.name.replace(/\s+/g, '_')}.png`;
    link.href = note.imageData;
    link.click();
    addLog('info', `Downloaded: ${note.name}`);
  }, [addLog]);

  const simulateErase = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const startTime = Date.now();
    progressRef.current = 0;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min(100, (elapsed / ERASE_DURATION_MS) * 100);
      progressRef.current = percentage;

      setProgress({
        percentage,
        timeElapsed: elapsed / 1000,
        timeRemaining: Math.max(0, (ERASE_DURATION_MS - elapsed) / 1000),
        isPaused: false,
      });

      if (percentage >= 100) {
        completeErase();
      }
    };

    eraseIntervalRef.current = setInterval(updateProgress, 100);
    addLog('info', 'Erase operation started (NFR1: 10s target)');
  }, [addLog]);

  const completeErase = useCallback(() => {
    if (eraseIntervalRef.current) {
      clearInterval(eraseIntervalRef.current);
      eraseIntervalRef.current = null;
    }

    if (fabricCanvasRef.current) {
      if (eraseMode === 'full') {
        fabricCanvasRef.current.clear();
        fabricCanvasRef.current.backgroundColor = "#f8fafc";
      } else if (partialArea) {
        // For partial erase, remove objects in the selected area
        const objects = fabricCanvasRef.current.getObjects();
        objects.forEach(obj => {
          const objBounds = obj.getBoundingRect();
          if (
            objBounds.left >= partialArea.x &&
            objBounds.top >= partialArea.y &&
            objBounds.left + objBounds.width <= partialArea.x + partialArea.width &&
            objBounds.top + objBounds.height <= partialArea.y + partialArea.height
          ) {
            fabricCanvasRef.current?.remove(obj);
          }
        });
      }
      fabricCanvasRef.current.renderAll();
    }

    setStatus('completed');
    setProgress(null);
    setPartialArea(null);
    addLog('success', 'Erase operation completed successfully');
    toast.success("Whiteboard erased successfully!");

    // Reset to idle after a short delay
    setTimeout(() => setStatus('idle'), 2000);
  }, [eraseMode, partialArea, addLog]);

  const startErase = useCallback(() => {
    if (status !== 'idle' && status !== 'completed' && status !== 'paused') return;

    if (status === 'paused') {
      // Resume from pause
      setStatus('erasing');
      simulateErase();
      addLog('info', 'Erase operation resumed');
      return;
    }

    // Save snapshot before erasing (Student Story 7)
    saveSnapshot();

    // Start countdown (Student Story 6)
    setStatus('countdown');
    addLog('info', 'Countdown started (10 seconds warning)');
  }, [status, saveSnapshot, simulateErase, addLog]);

  const onCountdownComplete = useCallback(() => {
    setStatus('erasing');
    simulateErase();
  }, [simulateErase]);

  const onCountdownCancel = useCallback(() => {
    setStatus('idle');
    addLog('info', 'Countdown cancelled by user');
    toast.info("Operation cancelled");
  }, [addLog]);

  const pauseErase = useCallback(() => {
    if (status !== 'erasing') return;

    if (eraseIntervalRef.current) {
      clearInterval(eraseIntervalRef.current);
      eraseIntervalRef.current = null;
    }

    setStatus('paused');
    setProgress(prev => prev ? { ...prev, isPaused: true } : null);
    addLog('warning', 'Erase operation paused by user');
    toast.warning("Operation paused");
  }, [status, addLog]);

  const stopErase = useCallback(() => {
    if (eraseIntervalRef.current) {
      clearInterval(eraseIntervalRef.current);
      eraseIntervalRef.current = null;
    }

    setStatus('idle');
    setProgress(null);
    setPartialArea(null);
    progressRef.current = 0;
    addLog('warning', 'Erase operation stopped by user');
    toast.warning("Operation stopped");
  }, [addLog]);

  const simulateObstacle = useCallback(() => {
    const newObstacleState = !isObstacleSimulated;
    setIsObstacleSimulated(newObstacleState);

    if (newObstacleState) {
      // Simulate obstacle appearing
      setProximitySensor({
        isObstacleDetected: true,
        distance: 0.3, // Less than 0.5m threshold
        threshold: PROXIMITY_THRESHOLD,
      });

      if (status === 'erasing') {
        // FR4: Pause when obstacle detected
        if (eraseIntervalRef.current) {
          clearInterval(eraseIntervalRef.current);
          eraseIntervalRef.current = null;
        }
        setStatus('obstacle-detected');
        setProgress(prev => prev ? { ...prev, isPaused: true } : null);
        addLog('warning', 'FR4: Obstacle detected within 0.5m - operation paused');
        toast.warning("Obstacle detected! Operation paused for safety.");
      }
    } else {
      // Clear obstacle
      setProximitySensor({
        isObstacleDetected: false,
        distance: 2.0,
        threshold: PROXIMITY_THRESHOLD,
      });

      if (status === 'obstacle-detected') {
        // FR4: Resume when area is clear
        setStatus('erasing');
        simulateErase();
        addLog('success', 'FR4: Area clear - operation resumed');
        toast.success("Area clear. Resuming operation.");
      }
    }
  }, [isObstacleSimulated, status, addLog, simulateErase]);

  return {
    // State
    status,
    eraseMode,
    partialArea,
    notes,
    logs,
    progress,
    proximitySensor,
    isObstacleSimulated,
    countdownSeconds: COUNTDOWN_SECONDS,

    // Actions
    setCanvas,
    setEraseMode,
    setPartialArea,
    saveSnapshot,
    deleteNote,
    downloadNote,
    startErase,
    pauseErase,
    stopErase,
    simulateObstacle,
    onCountdownComplete,
    onCountdownCancel,
  };
};
