import { MarkDrawing } from "../types";

export interface DrawingConfig {
  type: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  draw: (ctx: CanvasRenderingContext2D, drawing: MarkDrawing) => void;
  getBoundingBox: (drawing: MarkDrawing) => { x: number; y: number; width: number; height: number };
  isPointInShape: (drawing: MarkDrawing, point: { x: number; y: number }) => boolean;
}

