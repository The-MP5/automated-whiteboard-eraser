export type SystemStatus = 
  | 'idle' 
  | 'countdown' 
  | 'erasing' 
  | 'paused' 
  | 'obstacle-detected' 
  | 'completed'
  | 'error';

export type EraseMode = 'full' | 'partial';

export interface EraseArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SavedNote {
  id: string;
  timestamp: Date;
  imageData: string;
  name: string;
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export interface ProximitySensor {
  isObstacleDetected: boolean;
  distance: number; // in meters
  threshold: number; // 0.5 meters per FR4
}

export interface EraseProgress {
  percentage: number;
  timeElapsed: number;
  timeRemaining: number;
  isPaused: boolean;
}
