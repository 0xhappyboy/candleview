import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { HeatMapMarkManager } from '../../../MarkManager/Map/HeatMapMarkManager';
import { MockKLineMarkManager } from '../../../MarkManager/Mock/MockKLineMarkManager';
import { DrawingType } from '../../../types';

export class SpecialMarkersManager implements MarkManagerModule {
    public mockKLineMarkManager: MockKLineMarkManager | null = null;
    public heatMapMarkManager: HeatMapMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.mockKLineMarkManager = new MockKLineMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing,
        });
        this.heatMapMarkManager = new HeatMapMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.mockKLineMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.heatMapMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.mockKLineMarkManager?.destroy();
        this.heatMapMarkManager?.destroy();
    }

    clearState(): void {
        this.mockKLineMarkManager?.clearState();
        this.heatMapMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.mockKLineMarkManager?.isOperatingOnChart?.() ||
            this.heatMapMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [this.mockKLineMarkManager, this.heatMapMarkManager];
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
        if (this.mockKLineMarkManager) {
            result = this.mockKLineMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.heatMapMarkManager) {
            result = this.heatMapMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.mockKLineMarkManager) {
            result = this.mockKLineMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.heatMapMarkManager) {
            result = this.heatMapMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.mockKLineMarkManager) {
            result = this.mockKLineMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.heatMapMarkManager) {
            result = this.heatMapMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        let result: any = null;
        if (this.mockKLineMarkManager) {
            result = this.mockKLineMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        return null;
    }

    setMockKLineMarkMode(chart: Chart): any {
        if (!this.mockKLineMarkManager) return null;
        const newState = this.mockKLineMarkManager.setMockKLineMarkMode();
        chart.currentDrawingType = DrawingType.MockKLine;
        return newState;
    }

    setHeatMapMode(chart: Chart): any {
        if (!this.heatMapMarkManager) return null;
        const newState = this.heatMapMarkManager.setHeatMapMode();
        chart.currentDrawingType = DrawingType.HeatMap;
        return newState;
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        if (drawingType === DrawingType.MockKLine) {
            this.mockKLineMarkManager?.removeMockKLineMark(iGraph);
        }
    }

    deleteAllMarks(): void {
        this.mockKLineMarkManager?.getMockKLineMarks().forEach(mark => {
            this.mockKLineMarkManager?.removeMockKLineMark(mark);
        });
        this.heatMapMarkManager?.getHeatMapMarks().forEach(mark => {
            this.heatMapMarkManager?.removeHeatMapMark(mark);
        });
    }

    showAllMarks(): void {
        this.mockKLineMarkManager?.showAllMarks();
        this.heatMapMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.mockKLineMarkManager?.hideAllMarks();
        this.heatMapMarkManager?.hideAllMarks();
    }
}