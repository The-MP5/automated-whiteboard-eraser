import { useState, useCallback, useRef, useEffect } from "react";
import { Canvas as FabricCanvas } from "fabric";
import type {
  SystemStatus,
  EraseMode,
  EraseArea,
  SavedNote,
  SystemLog,
  ProximitySensor,
  EraseProgress,
  ArmRuntimeState,
} from "@/types/whiteboard";
import { toast } from "sonner";
import {
  COUNTDOWN_SECONDS,
  applyEraseToCanvas,
  createSnapshotNote,
  createSystemLog,
  proximityWhenClear,
  proximityWhenObstacleDetected,
  ARM_CONFIG,
  MAX_ARM_TELEMETRY_SAMPLES,
  buildEraseWaypoints,
  buildExecutionPlan,
  sampleExecutionPlan,
  validateArmSafety,
  createTelemetryTick,
  runHilChecks,
} from "@/simulation";

const MAX_LOG_ENTRIES = 500;
const MAX_SAVED_NOTES = 100;

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
  const [armState, setArmState] = useState<ArmRuntimeState>({
    isCalibrated: false,
    isHomed: false,
    pose: { ...ARM_CONFIG.homePose },
    joints: { baseDeg: 0, shoulderDeg: 0, elbowDeg: 0 },
    telemetry: [],
    lastError: null,
  });

  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const eraseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<number>(0);
  /** Wall-clock elapsed ms into the current execution plan (persists across pause / FR4 resume). */
  const elapsedMsInPlanRef = useRef<number>(0);
  const executionPlanRef = useRef<ReturnType<typeof buildExecutionPlan> | null>(null);

  const trimTelemetry = useCallback(
    (prev: ArmRuntimeState["telemetry"], next: ArmRuntimeState["telemetry"][number]) =>
      [...prev.slice(-(MAX_ARM_TELEMETRY_SAMPLES - 1)), next],
    []
  );

  const addLog = useCallback((type: SystemLog["type"], message: string) => {
    setLogs((prev) => [...prev, createSystemLog(type, message)].slice(-MAX_LOG_ENTRIES));
  }, []);

  const setCanvas = useCallback(
    (canvas: FabricCanvas) => {
      fabricCanvasRef.current = canvas;
      addLog("info", "Canvas initialized successfully");

      const checks = runHilChecks();
      checks.forEach((check) =>
        addLog(
          check.passed ? "success" : "error",
          `${check.id}: ${check.details} (${check.passed ? "PASS" : "FAIL"})`
        )
      );
    },
    [addLog]
  );

  const saveSnapshot = useCallback(() => {
    if (!fabricCanvasRef.current) {
      addLog("error", "Cannot save snapshot: Canvas not available");
      return;
    }

    try {
      const dataUrl = fabricCanvasRef.current.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
      });

      const note = createSnapshotNote(dataUrl);
      setNotes((prev) => [...prev, note].slice(-MAX_SAVED_NOTES));
      addLog("success", `Snapshot saved: ${note.name}`);
      toast.success("Snapshot saved to Notes");
    } catch (error) {
      addLog("error", "Failed to save snapshot");
      toast.error("Snapshot failed. Please try again.");
      console.error("Snapshot save failed", error);
    }
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
    elapsedMsInPlanRef.current = 0;
    addLog("success", "Erase operation completed successfully");
    toast.success("Whiteboard erased successfully!");

    setTimeout(() => setStatus("idle"), 2000);
  }, [eraseMode, partialArea, addLog]);

  const simulateErase = useCallback((resume = false) => {
    if (!fabricCanvasRef.current) return;

    const waypoints = buildEraseWaypoints(eraseMode, partialArea);
    executionPlanRef.current = buildExecutionPlan(waypoints);
    const segmentStart = Date.now();
    if (!resume) {
      progressRef.current = 0;
      elapsedMsInPlanRef.current = 0;
    }

    const updateProgress = () => {
      const elapsedMs = elapsedMsInPlanRef.current + (Date.now() - segmentStart);
      const plan = executionPlanRef.current;
      if (!plan) return;
      const tick = sampleExecutionPlan(plan, elapsedMs);
      progressRef.current = tick.percentage;
      elapsedMsInPlanRef.current = elapsedMs;

      const safetyError = validateArmSafety(tick.target, tick.joints);
      if (safetyError) {
        if (eraseIntervalRef.current) {
          clearInterval(eraseIntervalRef.current);
          eraseIntervalRef.current = null;
        }
        setStatus("error");
        setProgress(null);
        setArmState((prev) => ({
          ...prev,
          lastError: safetyError,
          telemetry: trimTelemetry(prev.telemetry, createTelemetryTick(tick, "error", safetyError)),
        }));
        addLog("error", `FR3 safety stop: ${safetyError}`);
        toast.error(`Arm safety stop: ${safetyError}`);
        return;
      }

      setProgress({
        ...tick,
        isPaused: false,
      });

      setArmState((prev) => ({
        ...prev,
        pose: tick.target,
        joints: tick.joints,
        lastError: null,
        telemetry: trimTelemetry(prev.telemetry, createTelemetryTick(tick, "ok", "Tracking trajectory")),
      }));

      if (tick.percentage >= 100) {
        completeErase();
      }
    };

    eraseIntervalRef.current = setInterval(updateProgress, 100);
    addLog("info", "FR3 arm trajectory started");
  }, [addLog, completeErase, eraseMode, partialArea, trimTelemetry]);

  const startErase = useCallback(() => {
    if (status !== "idle" && status !== "completed" && status !== "paused" && status !== "error") return;

    if (status === "paused") {
      setStatus("erasing");
      simulateErase(true);
      addLog("info", "Erase operation resumed");
      return;
    }

    setArmState((prev) => ({
      ...prev,
      isCalibrated: true,
      isHomed: true,
      pose: { ...ARM_CONFIG.homePose },
      joints: { baseDeg: 0, shoulderDeg: 0, elbowDeg: 0 },
      lastError: null,
      telemetry: prev.telemetry,
    }));
    addLog("info", "FR3 homing + calibration complete");

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
    elapsedMsInPlanRef.current = 0;
    setArmState((prev) => ({
      ...prev,
      pose: { ...ARM_CONFIG.homePose },
      joints: { baseDeg: 0, shoulderDeg: 0, elbowDeg: 0 },
      lastError: null,
      telemetry: prev.telemetry,
    }));
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
        simulateErase(true);
        addLog("success", "FR4: Area clear - operation resumed");
        toast.success("Area clear. Resuming operation.");
      }
    }
  }, [isObstacleSimulated, status, addLog, simulateErase]);

  useEffect(() => {
    return () => {
      if (eraseIntervalRef.current) {
        clearInterval(eraseIntervalRef.current);
        eraseIntervalRef.current = null;
      }
    };
  }, []);

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
    armState,
  };
};
