import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { AndrewPitchforkMarkManager } from '../../../MarkManager/Fork/AndrewPitchforkMarkManager';
import { EnhancedAndrewPitchforkMarkManager } from '../../../MarkManager/Fork/EnhancedAndrewPitchforkMarkManager';
import { SchiffPitchforkMarkManager } from '../../../MarkManager/Fork/SchiffPitchforkMarkManager';
import { DrawingType } from '../../../types';

export class ForkMarkersManager implements MarkManagerModule {
    public andrewPitchforkMarkManager: AndrewPitchforkMarkManager | null = null;
    public enhancedAndrewPitchforkMarkManager: EnhancedAndrewPitchforkMarkManager | null = null;
    public schiffPitchforkMarkManager: SchiffPitchforkMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.andrewPitchforkMarkManager = new AndrewPitchforkMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.enhancedAndrewPitchforkMarkManager = new EnhancedAndrewPitchforkMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.schiffPitchforkMarkManager = new SchiffPitchforkMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.andrewPitchforkMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.enhancedAndrewPitchforkMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.schiffPitchforkMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.andrewPitchforkMarkManager?.destroy();
        this.enhancedAndrewPitchforkMarkManager?.destroy();
        this.schiffPitchforkMarkManager?.destroy();
    }

    clearState(): void {
        this.andrewPitchforkMarkManager?.clearState();
        this.enhancedAndrewPitchforkMarkManager?.clearState();
        this.schiffPitchforkMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.andrewPitchforkMarkManager?.isOperatingOnChart?.() ||
            this.enhancedAndrewPitchforkMarkManager?.isOperatingOnChart?.() ||
            this.schiffPitchforkMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [
            this.andrewPitchforkMarkManager,
            this.enhancedAndrewPitchforkMarkManager,
            this.schiffPitchforkMarkManager
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
        if (this.andrewPitchforkMarkManager) {
            result = this.andrewPitchforkMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.enhancedAndrewPitchforkMarkManager) {
            result = this.enhancedAndrewPitchforkMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.schiffPitchforkMarkManager) {
            result = this.schiffPitchforkMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.andrewPitchforkMarkManager) {
            result = this.andrewPitchforkMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.enhancedAndrewPitchforkMarkManager) {
            result = this.enhancedAndrewPitchforkMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.schiffPitchforkMarkManager) {
            result = this.schiffPitchforkMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.andrewPitchforkMarkManager) {
            result = this.andrewPitchforkMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.enhancedAndrewPitchforkMarkManager) {
            result = this.enhancedAndrewPitchforkMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.schiffPitchforkMarkManager) {
            result = this.schiffPitchforkMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        let result: any = null;
        if (this.schiffPitchforkMarkManager) {
            result = this.schiffPitchforkMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        return null;
    }

    setAndrewPitchforkMode(chart: Chart): any {
        if (!this.andrewPitchforkMarkManager) return null;
        const newState = this.andrewPitchforkMarkManager.setAndrewPitchforkMode();
        chart.currentDrawingType = DrawingType.AndrewPitchfork;
        return newState;
    }

    setEnhancedAndrewPitchforkMode(chart: Chart): any {
        if (!this.enhancedAndrewPitchforkMarkManager) return null;
        const newState = this.enhancedAndrewPitchforkMarkManager.setEnhancedAndrewPitchforkMode();
        chart.currentDrawingType = DrawingType.EnhancedAndrewPitchfork;
        return newState;
    }

    setSchiffPitchforkMode(chart: Chart): any {
        if (!this.schiffPitchforkMarkManager) return null;
        const newState = this.schiffPitchforkMarkManager.setSchiffPitchforkMode();
        chart.currentDrawingType = DrawingType.SchiffPitchfork;
        return newState;
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        if (drawingType === DrawingType.AndrewPitchfork) {
            this.andrewPitchforkMarkManager?.removeAndrewPitchforkMark(iGraph);
        } else if (drawingType === DrawingType.EnhancedAndrewPitchfork) {
            this.enhancedAndrewPitchforkMarkManager?.removeEnhancedAndrewPitchforkMark(iGraph);
        } else if (drawingType === DrawingType.SchiffPitchfork) {
            this.schiffPitchforkMarkManager?.removeSchiffPitchforkMark(iGraph);
        }
    }

    deleteAllMarks(): void {
        this.andrewPitchforkMarkManager?.getAndrewPitchforkMarks().forEach(mark => {
            this.andrewPitchforkMarkManager?.removeAndrewPitchforkMark(mark);
        });
        this.enhancedAndrewPitchforkMarkManager?.getEnhancedAndrewPitchforkMarks().forEach(mark => {
            this.enhancedAndrewPitchforkMarkManager?.removeEnhancedAndrewPitchforkMark(mark);
        });
        this.schiffPitchforkMarkManager?.getSchiffPitchforkMarks().forEach(mark => {
            this.schiffPitchforkMarkManager?.removeSchiffPitchforkMark(mark);
        });
    }

    showAllMarks(): void {
        this.andrewPitchforkMarkManager?.showAllMarks();
        this.enhancedAndrewPitchforkMarkManager?.showAllMarks();
        this.schiffPitchforkMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.andrewPitchforkMarkManager?.hideAllMarks();
        this.enhancedAndrewPitchforkMarkManager?.hideAllMarks();
        this.schiffPitchforkMarkManager?.hideAllMarks();
    }
}