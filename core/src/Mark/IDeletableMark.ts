import { DrawingType } from "../types";

export interface IDeletableMark {
    isPointNearPath(x: number, y: number, threshold?: number): boolean;
    getDrawingType(): DrawingType;
}