import { ThemeConfig } from '../CandleViewTheme';
import { DrawingShape } from './DrawingManager';
import { DrawingConfig } from './DrawingConfigs';

export interface Point {
  x: number;
  y: number;
}

export interface Drawing {
  id: string;
  type: string;
  points: Point[];
  color: string;
  lineWidth: number;
  isSelected?: boolean;
  rotation?: number;
  properties?: any;
}

export interface HistoryRecord {
  drawings: Drawing[];
  description: string;
}

export interface FloatingPanelPosition {
  x: number;
  y: number;
}

export interface DrawingLayerProps {
  chart: any;
  currentTheme: ThemeConfig;
  activeTool: string | null;
  onDrawingComplete?: (drawing: DrawingShape) => void;
  onCloseDrawing?: () => void;
}

export interface DrawingLayerState {
  isDrawing: boolean;
  drawingPoints: Point[];
  currentDrawing: any;
  drawingStartPoint: Point | null;
  drawings: Drawing[];
  selectedDrawing: Drawing | null;
  floatingPanelPosition: FloatingPanelPosition;
  isDraggingFloatingPanel: boolean;
  dragStartPoint: Point | null;
  history: HistoryRecord[];
  historyIndex: number;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  resizeHandle: string | null;
}