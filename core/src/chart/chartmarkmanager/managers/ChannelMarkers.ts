import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { DisjointChannelMarkManager } from '../../../MarkManager/Channel/DisjointChannelMarkManager';
import { EquidistantChannelMarkManager } from '../../../MarkManager/Channel/EquidistantChannelMarkManager';
import { LinearRegressionChannelMarkManager } from '../../../MarkManager/Channel/LinearRegressionChannelMarkManager';
import { ParallelChannelMarkManager } from '../../../MarkManager/Channel/ParallelChannelMarkManager';
import { DrawingType } from '../../../types';

export class ChannelMarkersManager implements MarkManagerModule {
    public parallelChannelMarkManager: ParallelChannelMarkManager | null = null;
    public linearRegressionChannelMarkManager: LinearRegressionChannelMarkManager | null = null;
    public equidistantChannelMarkManager: EquidistantChannelMarkManager | null = null;
    public disjointChannelMarkManager: DisjointChannelMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.parallelChannelMarkManager = new ParallelChannelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.linearRegressionChannelMarkManager = new LinearRegressionChannelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.equidistantChannelMarkManager = new EquidistantChannelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.disjointChannelMarkManager = new DisjointChannelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.parallelChannelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.linearRegressionChannelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.equidistantChannelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.disjointChannelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.parallelChannelMarkManager?.destroy();
        this.linearRegressionChannelMarkManager?.destroy();
        this.equidistantChannelMarkManager?.destroy();
        this.disjointChannelMarkManager?.destroy();
    }

    clearState(): void {
        this.parallelChannelMarkManager?.clearState();
        this.linearRegressionChannelMarkManager?.clearState();
        this.equidistantChannelMarkManager?.clearState();
        this.disjointChannelMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.parallelChannelMarkManager?.isOperatingOnChart?.() ||
            this.linearRegressionChannelMarkManager?.isOperatingOnChart?.() ||
            this.equidistantChannelMarkManager?.isOperatingOnChart?.() ||
            this.disjointChannelMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [
            this.parallelChannelMarkManager,
            this.linearRegressionChannelMarkManager,
            this.equidistantChannelMarkManager,
            this.disjointChannelMarkManager
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
        if (this.parallelChannelMarkManager) {
            result = this.parallelChannelMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.linearRegressionChannelMarkManager) {
            result = this.linearRegressionChannelMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.equidistantChannelMarkManager) {
            result = this.equidistantChannelMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.disjointChannelMarkManager) {
            result = this.disjointChannelMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.parallelChannelMarkManager) {
            result = this.parallelChannelMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.linearRegressionChannelMarkManager) {
            result = this.linearRegressionChannelMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.equidistantChannelMarkManager) {
            result = this.equidistantChannelMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.disjointChannelMarkManager) {
            result = this.disjointChannelMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.parallelChannelMarkManager) {
            result = this.parallelChannelMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.linearRegressionChannelMarkManager) {
            result = this.linearRegressionChannelMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.equidistantChannelMarkManager) {
            result = this.equidistantChannelMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.disjointChannelMarkManager) {
            result = this.disjointChannelMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        let result: any = null;
        if (this.parallelChannelMarkManager) {
            result = this.parallelChannelMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        return null;
    }

    setParallelChannelMarkMode(chart: Chart): any {
        if (!this.parallelChannelMarkManager) return null;
        const newState = this.parallelChannelMarkManager.setParallelChannelMarkMode();
        chart.currentDrawingType = DrawingType.ParallelChannel;
        return newState;
    }

    setLinearRegressionChannelMode(chart: Chart): any {
        if (!this.linearRegressionChannelMarkManager) return null;
        const newState = this.linearRegressionChannelMarkManager.setLinearRegressionChannelMode();
        chart.currentDrawingType = DrawingType.LinearRegressionChannel;
        return newState;
    }

    setEquidistantChannelMarkMode(chart: Chart): any {
        if (!this.equidistantChannelMarkManager) return null;
        const newState = this.equidistantChannelMarkManager.setEquidistantChannelMarkMode();
        chart.currentDrawingType = DrawingType.EquidistantChannel;
        return newState;
    }

    setDisjointChannelMarkMode(chart: Chart): any {
        if (!this.disjointChannelMarkManager) return null;
        const newState = this.disjointChannelMarkManager.setDisjointChannelMarkMode();
        chart.currentDrawingType = DrawingType.DisjointChannel;
        return newState;
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        if (drawingType === DrawingType.ParallelChannel) {
            this.parallelChannelMarkManager?.removeParallelChannelMark(iGraph);
        } else if (drawingType === DrawingType.LinearRegressionChannel) {
            this.linearRegressionChannelMarkManager?.removeLinearRegressionChannelMark(iGraph);
        } else if (drawingType === DrawingType.EquidistantChannel) {
            this.equidistantChannelMarkManager?.removeEquidistantChannelMark(iGraph);
        } else if (drawingType === DrawingType.DisjointChannel) {
            this.disjointChannelMarkManager?.removeDisjointChannelMark(iGraph);
        }
    }

    deleteAllMarks(): void {
        this.parallelChannelMarkManager?.getParallelChannelMarks().forEach(mark => {
            this.parallelChannelMarkManager?.removeParallelChannelMark(mark);
        });
        this.linearRegressionChannelMarkManager?.getLinearRegressionChannelMarks().forEach(mark => {
            this.linearRegressionChannelMarkManager?.removeLinearRegressionChannelMark(mark);
        });
        this.equidistantChannelMarkManager?.getEquidistantChannelMarks().forEach(mark => {
            this.equidistantChannelMarkManager?.removeEquidistantChannelMark(mark);
        });
        this.disjointChannelMarkManager?.getDisjointChannelMarks().forEach(mark => {
            this.disjointChannelMarkManager?.removeDisjointChannelMark(mark);
        });
    }

    showAllMarks(): void {
        this.parallelChannelMarkManager?.showAllMarks();
        this.linearRegressionChannelMarkManager?.showAllMarks();
        this.equidistantChannelMarkManager?.showAllMarks();
        this.disjointChannelMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.parallelChannelMarkManager?.hideAllMarks();
        this.linearRegressionChannelMarkManager?.hideAllMarks();
        this.equidistantChannelMarkManager?.hideAllMarks();
        this.disjointChannelMarkManager?.hideAllMarks();
    }
}