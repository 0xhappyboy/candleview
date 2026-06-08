import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { GannBoxMarkManager } from '../../../MarkManager/Gann/GannBoxMarkManager';
import { GannFanMarkManager } from '../../../MarkManager/Gann/GannFanMarkManager';
import { GannRectangleMarkManager } from '../../../MarkManager/Gann/GannRectangleManager';
import { DrawingType } from '../../../types';

export class GannMarkersManager implements MarkManagerModule {
    public gannFanMarkManager: GannFanMarkManager | null = null;
    public gannBoxMarkManager: GannBoxMarkManager | null = null;
    public gannRectangleMarkManager: GannRectangleMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.gannFanMarkManager = new GannFanMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.gannBoxMarkManager = new GannBoxMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.gannRectangleMarkManager = new GannRectangleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.gannFanMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.gannBoxMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.gannRectangleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.gannFanMarkManager?.destroy();
        this.gannBoxMarkManager?.destroy();
        this.gannRectangleMarkManager?.destroy();
    }

    clearState(): void {
        this.gannFanMarkManager?.clearState();
        this.gannBoxMarkManager?.clearState();
        this.gannRectangleMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.gannFanMarkManager?.isOperatingOnChart?.() ||
            this.gannBoxMarkManager?.isOperatingOnChart?.() ||
            this.gannRectangleMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [
            this.gannFanMarkManager,
            this.gannBoxMarkManager,
            this.gannRectangleMarkManager
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
        if (this.gannFanMarkManager) {
            result = this.gannFanMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.gannBoxMarkManager) {
            result = this.gannBoxMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.gannRectangleMarkManager) {
            result = this.gannRectangleMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.gannFanMarkManager) {
            result = this.gannFanMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.gannBoxMarkManager) {
            result = this.gannBoxMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.gannRectangleMarkManager) {
            result = this.gannRectangleMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.gannFanMarkManager) {
            result = this.gannFanMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.gannBoxMarkManager) {
            result = this.gannBoxMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.gannRectangleMarkManager) {
            result = this.gannRectangleMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        let result: any = null;
        if (this.gannRectangleMarkManager) {
            result = this.gannRectangleMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        return null;
    }

    setGannFanMode(chart: Chart): any {
        if (!this.gannFanMarkManager) return null;
        const newState = this.gannFanMarkManager.setGannFanMode();
        chart.currentDrawingType = DrawingType.GannFan;
        return newState;
    }

    setGannBoxMode(chart: Chart): any {
        if (!this.gannBoxMarkManager) return null;
        const newState = this.gannBoxMarkManager.setGannBoxMode();
        chart.currentDrawingType = DrawingType.GannBox;
        return newState;
    }

    setGannRectangleMode(chart: Chart): any {
        if (!this.gannRectangleMarkManager) return null;
        const newState = this.gannRectangleMarkManager.setGannRectangMode();
        chart.currentDrawingType = DrawingType.GannRectangle;
        return newState;
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        if (drawingType === DrawingType.GannFan) {
            this.gannFanMarkManager?.removeGannFan(iGraph);
        } else if (drawingType === DrawingType.GannBox) {
            this.gannBoxMarkManager?.removeGannBox(iGraph);
        } else if (drawingType === DrawingType.GannRectangle) {
            this.gannRectangleMarkManager?.removeGannRectangle(iGraph);
        }
    }

    deleteAllMarks(): void {
        this.gannFanMarkManager?.getGannFans().forEach(mark => {
            this.gannFanMarkManager?.removeGannFan(mark);
        });
        this.gannBoxMarkManager?.getGannBoxes().forEach(mark => {
            this.gannBoxMarkManager?.removeGannBox(mark);
        });
        this.gannRectangleMarkManager?.getGannRectangles().forEach(mark => {
            this.gannRectangleMarkManager?.removeGannRectangle(mark);
        });
    }

    showAllMarks(): void {
        this.gannFanMarkManager?.showAllMarks();
        this.gannBoxMarkManager?.showAllMarks();
        this.gannRectangleMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.gannFanMarkManager?.hideAllMarks();
        this.gannBoxMarkManager?.hideAllMarks();
        this.gannRectangleMarkManager?.hideAllMarks();
    }
}