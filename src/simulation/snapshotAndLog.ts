import type { SavedNote, SystemLog } from "@/types/whiteboard";

export function createSystemLog(type: SystemLog["type"], message: string): SystemLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    timestamp: new Date(),
    type,
    message,
  };
}

export function createSnapshotNote(pngDataUrl: string): SavedNote {
  return {
    id: `note-${Date.now()}`,
    timestamp: new Date(),
    imageData: pngDataUrl,
    name: `Snapshot ${new Date().toLocaleTimeString()}`,
  };
}
