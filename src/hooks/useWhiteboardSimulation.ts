import { useState, useCallback, useRef } from "react";
import { Canvas as FabricCanvas } from "fabric";
import type {
  SystemStatus,
  EraseMode,
  EraseArea,
  SavedNote,
  SystemLog,
  ProximitySensor,
  EraseProgress,
} from "@/types/whiteboard";
import { toast } from "sonner";
import {
  COUNTDOWN_SECONDS,
  applyEraseToCanvas,
  computeEraseProgressTick,
  createSnapshotNote,
  createSystemLog,
  proximityWhenClear,
  proximityWhenObstacleDetected,
} from "@/simulation";

/**
 * React bridge for the whiteboard simulation: holds UI state and wires Fabric + toasts.
 * Domain rules live under `@/simulation` (testable, SRP).
 */
export const useWhiteboardSimulation = () => {
  const [status, setStatus] = useState<SystemStatus>("idle");
  const [eraseMode, setEraseMode] = useState<EraseMode>("full");
  const [partialArea, setPartialArea] = useState<EraseArea | null>(null);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [progress, setProgress] = useState<EraseProgress | null>(null);
  const [isObstacleSimulated, setIsObstacleSimulated] = useState(false);
  const [proximitySensor, setProximitySensor] = useState<ProximitySensor>(proximityWhenClear);

  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const eraseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<number>(0);

  const addLog = useCallback((type: SystemLog["type"], message: string) => {
    setLogs((prev) => [...prev, createSystemLog(type, message)]);
  }, []);

  const setCanvas = useCallback(
    (canvas: FabricCanvas) => {
      fabricCanvasRef.current = canvas;
      addLog("info", "Canvas initialized successfully");
    },
    [addLog]
  );

  const saveSnapshot = useCallback(() => {
    if (!fabricCanvasRef.current) {
      addLog("error", "Cannot save snapshot: Canvas not available");
      return;
    }

    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const note = createSnapshotNote(dataUrl);
    setNotes((prev) => [...prev, note]);
    addLog("success", `Snapshot saved: ${note.name}`);
    toast.success("Snapshot saved to Notes");
  }, [addLog]);

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
      addLog("info", "Snapshot deleted");
    },
    [addLog]
  );

  const downloadNote = useCallback(
    (note: SavedNote) => {
      const link = document.createElement("a");
      link.download = `${note.name.replace(/\s+/g, "_")}.png`;
      link.href = note.imageData;
      link.click();
      addLog("info", `Downloaded: ${note.name}`);
    },
    [addLog]
  );

  const completeErase = useCallback(() => {
    if (eraseIntervalRef.current) {
      clearInterval(eraseIntervalRef.current);
      eraseIntervalRef.current = null;
    }

    const canvas = fabricCanvasRef.current;
    if (canvas) {
      applyEraseToCanvas(canvas, eraseMode, partialArea);
    }

    setStatus("completed");
    setProgress(null);
    setPartialArea(null);
    addLog("success", "Erase operation completed successfully");
    toast.success("Whiteboard erased successfully!");

    setTimeout(() => setStatus("idle"), 2000);
  }, [eraseMode, partialArea, addLog]);

  const simulateErase = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const startTime = Date.now();
    progressRef.current = 0;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const tick = computeEraseProgressTick(elapsed);
      progressRef.current = tick.percentage;

      setProgress({
        ...tick,
        isPaused: false,
      });

      if (tick.percentage >= 100) {
        completeErase();
      }
    };

    eraseIntervalRef.current = setInterval(updateProgress, 100);
    addLog("info", "Erase operation started (NFR1: 10s target)");
  }, [addLog, completeErase]);

  const startErase = useCallback(() => {
    if (status !== "idle" && status !== "completed" && status !== "paused") return;

    if (status === "paused") {
      setStatus("erasing");
      simulateErase();
      addLog("info", "Erase operation resumed");
      return;
    }

    saveSnapshot();
    setStatus("countdown");
    addLog("info", "Countdown started (10 seconds warning)");
  }, [status, saveSnapshot, simulateErase, addLog]);

  const onCountdownComplete = useCallback(() => {
    setStatus("erasing");
    simulateErase();
  }, [simulateErase]);

  const onCountdownCancel = useCallback(() => {
    setStatus("idle");
    addLog("info", "Countdown cancelled by user");
    toast.info("Operation cancelled");
  }, [addLog]);

  const pauseErase = useCallback(() => {
    if (status !== "erasing") return;

    if (eraseIntervalRef.current) {
      clearInterval(eraseIntervalRef.current);
      eraseIntervalRef.current = null;
    }

    setStatus("paused");
    setProgress((prev) => (prev ? { ...prev, isPaused: true } : null));
    addLog("warning", "Erase operation paused by user");
    toast.warning("Operation paused");
  }, [status, addLog]);

  const stopErase = useCallback(() => {
    if (eraseIntervalRef.current) {
      clearInterval(eraseIntervalRef.current);
      eraseIntervalRef.current = null;
    }

    setStatus("idle");
    setProgress(null);
    setPartialArea(null);
    progressRef.current = 0;
    addLog("warning", "Erase operation stopped by user");
    toast.warning("Operation stopped");
  }, [addLog]);

  const simulateObstacle = useCallback(() => {
    const newObstacleState = !isObstacleSimulated;
    setIsObstacleSimulated(newObstacleState);

    if (newObstacleState) {
      setProximitySensor(proximityWhenObstacleDetected());

      if (status === "erasing") {
        if (eraseIntervalRef.current) {
          clearInterval(eraseIntervalRef.current);
          eraseIntervalRef.current = null;
        }
        setStatus("obstacle-detected");
        setProgress((prev) => (prev ? { ...prev, isPaused: true } : null));
        addLog("warning", "FR4: Obstacle detected within 0.5m - operation paused");
        toast.warning("Obstacle detected! Operation paused for safety.");
      }
    } else {
      setProximitySensor(proximityWhenClear());

      if (status === "obstacle-detected") {
        setStatus("erasing");
        simulateErase();
        addLog("success", "FR4: Area clear - operation resumed");
        toast.success("Area clear. Resuming operation.");
      }
    }
  }, [isObstacleSimulated, status, addLog, simulateErase]);

  return {
    status,
    eraseMode,
    partialArea,
    notes,
    logs,
    progress,
    proximitySensor,
    isObstacleSimulated,
    countdownSeconds: COUNTDOWN_SECONDS,

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
