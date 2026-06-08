import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { IDeletableMark } from '../../../Mark/IDeletableMark';
import { BrushMarkManager } from '../../../MarkManager/Pen/BrushMarkManager';
import { EraserMarkManager } from '../../../MarkManager/Pen/EraserMarkManager';
import { MarkerPenMarkManager } from '../../../MarkManager/Pen/MarkerPenMarkManager';
import { PencilMarkManager } from '../../../MarkManager/Pen/PencilMarkManager';
import { PenMarkManager } from '../../../MarkManager/Pen/PenMarkManager';
import { DrawingType } from '../../../types';

export class PenMarkersManager implements MarkManagerModule {
    public pencilMarkManager: PencilMarkManager | null = null;
    public penMarkManager: PenMarkManager | null = null;
    public brushMarkManager: BrushMarkManager | null = null;
    public markerPenMarkManager: MarkerPenMarkManager | null = null;
    public eraserMarkManager: EraserMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.eraserMarkManager = new EraserMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: () => {
                if (chart.onCloseDrawing) {
                    chart.onCloseDrawing();
                }
            }
        });
        this.markerPenMarkManager = new MarkerPenMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.brushMarkManager = new BrushMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.penMarkManager = new PenMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.pencilMarkManager = new PencilMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    registerAllDeletableMarks(): void {
        if (!this.eraserMarkManager) return;
        const allDeletableMarks: IDeletableMark[] = [];
        if (this.penMarkManager) {
            allDeletableMarks.push(...this.penMarkManager.getAllMarks());
        }
        if (this.pencilMarkManager) {
            allDeletableMarks.push(...this.pencilMarkManager.getAllMarks());
        }
        if (this.brushMarkManager) {
            allDeletableMarks.push(...this.brushMarkManager.getAllMarks());
        }
        if (this.markerPenMarkManager) {
            allDeletableMarks.push(...this.markerPenMarkManager.getAllMarks());
        }
        this.eraserMarkManager.setPenMarks(allDeletableMarks);
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.markerPenMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.brushMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.penMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.pencilMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.eraserMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.pencilMarkManager?.destroy();
        this.penMarkManager?.destroy();
        this.brushMarkManager?.destroy();
        this.markerPenMarkManager?.destroy();
        this.eraserMarkManager?.destroy();
    }

    clearState(): void {
        this.pencilMarkManager?.clearState();
        this.penMarkManager?.clearState();
        this.brushMarkManager?.clearState();
        this.markerPenMarkManager?.clearState();
        this.eraserMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.pencilMarkManager?.isOperatingOnChart?.() ||
            this.penMarkManager?.isOperatingOnChart?.() ||
            this.brushMarkManager?.isOperatingOnChart?.() ||
            this.markerPenMarkManager?.isOperatingOnChart?.() ||
            this.eraserMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [
            this.pencilMarkManager,
            this.penMarkManager,
            this.brushMarkManager,
            this.markerPenMarkManager
        ];
        for (const manager of managers) {
            if (manager?.getMarkAtPoint) {
                const result = manager.getMarkAtPoint(point);
                if (result) return result;
            }
        }
        return null;
    }

    handleMouseDown(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.pencilMarkManager) {
            result = this.pencilMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.penMarkManager) {
            result = this.penMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.brushMarkManager) {
            result = this.brushMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.markerPenMarkManager) {
            result = this.markerPenMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.eraserMarkManager) {
            result = this.eraserMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.pencilMarkManager) {
            result = this.pencilMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.penMarkManager) {
            result = this.penMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.brushMarkManager) {
            result = this.brushMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.markerPenMarkManager) {
            result = this.markerPenMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.eraserMarkManager) {
            result = this.eraserMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.pencilMarkManager) {
            result = this.pencilMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.penMarkManager) {
            result = this.penMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.brushMarkManager) {
            result = this.brushMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.markerPenMarkManager) {
            result = this.markerPenMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.eraserMarkManager) {
            result = this.eraserMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        let result: any = null;
        if (this.pencilMarkManager) {
            result = this.pencilMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        if (this.penMarkManager) {
            result = this.penMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        if (this.brushMarkManager) {
            result = this.brushMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        if (this.markerPenMarkManager) {
            result = this.markerPenMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        if (this.eraserMarkManager) {
            result = this.eraserMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        return null;
    }

    setPencilMode(chart: Chart): any {
        if (!this.pencilMarkManager) return null;
        const newState = this.pencilMarkManager.setPencilMode();
        chart.currentDrawingType = DrawingType.Pencil;
        return newState;
    }

    setPenMode(chart: Chart): any {
        if (!this.penMarkManager) return null;
        const newState = this.penMarkManager.setPenMode();
        chart.currentDrawingType = DrawingType.Pen;
        return newState;
    }

    setBrushMode(chart: Chart): any {
        if (!this.brushMarkManager) return null;
        const newState = this.brushMarkManager.setBrushMode();
        chart.currentDrawingType = DrawingType.Brush;
        return newState;
    }

    setMarkerPenMode(chart: Chart): any {
        if (!this.markerPenMarkManager) return null;
        const newState = this.markerPenMarkManager.setMarkerPenMarkMode();
        chart.currentDrawingType = DrawingType.MarkerPen;
        return newState;
    }

    setEraserMode(chart: Chart): any {
        if (!this.eraserMarkManager) return null;
        this.registerAllDeletableMarks();
        this.eraserMarkManager.setEraserMode();
        chart.currentDrawingType = DrawingType.Eraser;
        return { isEraserMode: true, isErasing: false, eraserHoveredMark: null };
    }

    closeAllBrushTools(chart: Chart): void {
        if (this.pencilMarkManager && chart.currentDrawingType === DrawingType.Pencil) {
            const newState = this.pencilMarkManager.closeBrush();
            chart.drawingManager?.updateState({
                isPencilMode: newState.isPencilMode,
                isDrawing: newState.isDrawing,
                currentPencilMark: newState.currentPencilMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.penMarkManager && chart.currentDrawingType === DrawingType.Pen) {
            const newState = this.penMarkManager.closeBrush();
            chart.drawingManager?.updateState({
                isPenMode: newState.isPenMode,
                isDrawing: newState.isDrawing,
                currentPenMark: newState.currentPenMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.brushMarkManager && chart.currentDrawingType === DrawingType.Brush) {
            const newState = this.brushMarkManager.closeBrush();
            chart.drawingManager?.updateState({
                isBrushMode: newState.isBrushMode,
                isDrawing: newState.isDrawing,
                currentBrushMark: newState.currentBrushMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.markerPenMarkManager && chart.currentDrawingType === DrawingType.MarkerPen) {
            const newState = this.markerPenMarkManager.closeBrush();
            chart.drawingManager?.updateState({
                isMarkerPenMode: newState.isMarkerPenMarkMode,
                isDrawing: newState.isDrawing,
                currentMarkerPen: newState.currentMarkerPenMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.eraserMarkManager && chart.currentDrawingType === DrawingType.Eraser) {
            const newState = this.eraserMarkManager.closeBrush();
            chart.drawingManager?.updateState({
                isEraserMode: newState.isEraserMode,
                isErasing: newState.isErasing,
                eraserHoveredMark: null
            });
        }
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        switch (drawingType) {
            case DrawingType.Pencil:
                this.pencilMarkManager?.removePencilMark(iGraph);
                break;
            case DrawingType.Pen:
                this.penMarkManager?.removePenMark(iGraph);
                break;
            case DrawingType.Brush:
                this.brushMarkManager?.removeBrushMark(iGraph);
                break;
            case DrawingType.MarkerPen:
                this.markerPenMarkManager?.removeMarkerPenMark(iGraph);
                break;
        }
    }

    deleteAllMarks(): void {
        this.pencilMarkManager?.getPencilMarks().forEach(mark => {
            this.pencilMarkManager?.removePencilMark(mark);
        });
        this.penMarkManager?.getPenMarks().forEach(mark => {
            this.penMarkManager?.removePenMark(mark);
        });
        this.brushMarkManager?.getBrushMarks().forEach(mark => {
            this.brushMarkManager?.removeBrushMark(mark);
        });
        this.markerPenMarkManager?.getMarkerPenMarks().forEach(mark => {
            this.markerPenMarkManager?.removeMarkerPenMark(mark);
        });
    }

    showAllMarks(): void {
        this.pencilMarkManager?.showAllMarks();
        this.penMarkManager?.showAllMarks();
        this.brushMarkManager?.showAllMarks();
        this.markerPenMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.pencilMarkManager?.hideAllMarks();
        this.penMarkManager?.hideAllMarks();
        this.brushMarkManager?.hideAllMarks();
        this.markerPenMarkManager?.hideAllMarks();
    }
}