import { Chart } from '../Chart';

export interface MarkManagerContext {
    chart: Chart;
}

export interface MarkManagerModule {
    initialize(context: MarkManagerContext): void;
    updateProps(context: MarkManagerContext): void;
    destroy(): void;
    clearState(): void;
    isOperatingOnChart(): boolean;
    getMarkAtPoint(point: { x: number; y: number }): any;
    handleMouseDown(point: { x: number; y: number }): any;
    handleMouseMove(point: { x: number; y: number }): any;
    handleMouseUp(point: { x: number; y: number }): any;
    handleKeyDown(event: KeyboardEvent): any;
}