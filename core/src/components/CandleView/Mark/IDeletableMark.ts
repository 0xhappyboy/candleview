import { MarkType } from "../types";

export interface IDeletableMark {
    isPointNearPath(x: number, y: number, threshold?: number): boolean;
    getMarkType(): MarkType;
}