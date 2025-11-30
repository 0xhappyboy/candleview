import { Point } from "../types";

export interface IMarkManager<T = any> {
    // get the target object being dragged
    getCurrentDragTarget(): T | null;

    // get the type of the currently dragged point
    getCurrentDragPoint(): string | null;

    // get the marker object of the current operation
    getCurrentOperatingMark(): T | null;

    // Determine if a chart is being manipulated
    isOperatingOnChart(): boolean;

    // get all marked objects
    getAllMarks(): T[];

    // Cancel current operation mode
    cancelOperationMode(): any;

    // get the marker object at the specified coordinates
    getMarkAtPoint(point: Point): T | null;

    // clear state
    clearState(): void;
}