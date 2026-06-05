import { DrawingType } from "../types";

export interface IGraph<T = any> {
    /**
     * Get the current graphic marker type
     */
    getDrawingType(): DrawingType;
}