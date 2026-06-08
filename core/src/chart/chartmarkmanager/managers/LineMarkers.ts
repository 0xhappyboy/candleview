import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { ArrowLineMarkManager } from '../../../MarkManager/Line/ArrowLineMarkManager';
import { AxisLineMarkManager } from '../../../MarkManager/Line/AxisLineMarkManager';
import { LineSegmentMarkManager } from '../../../MarkManager/Line/LineSegmentMarkManager';
import { ThickArrowLineMarkManager } from '../../../MarkManager/Line/ThickArrowLineMarkManager';
import { DrawingType } from '../../../types';

export class LineMarkersManager implements MarkManagerModule {
    public lineSegmentMarkManager: LineSegmentMarkManager | null = null;
    public axisLineMarkManager: AxisLineMarkManager | null = null;
    public arrowLineMarkManager: ArrowLineMarkManager | null = null;
    public thickArrowLineMarkManager: ThickArrowLineMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.lineSegmentMarkManager = new LineSegmentMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.axisLineMarkManager = new AxisLineMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.arrowLineMarkManager = new ArrowLineMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.thickArrowLineMarkManager = new ThickArrowLineMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.lineSegmentMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.arrowLineMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.axisLineMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.thickArrowLineMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.lineSegmentMarkManager?.destroy();
        this.arrowLineMarkManager?.destroy();
        this.axisLineMarkManager?.destroy();
        this.thickArrowLineMarkManager?.destroy();
    }

    clearState(): void {
        this.lineSegmentMarkManager?.clearState();
        this.arrowLineMarkManager?.clearState();
        this.axisLineMarkManager?.clearState();
        this.thickArrowLineMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.lineSegmentMarkManager?.isOperatingOnChart?.() ||
            this.arrowLineMarkManager?.isOperatingOnChart?.() ||
            this.axisLineMarkManager?.isOperatingOnChart?.() ||
            this.thickArrowLineMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [
            this.lineSegmentMarkManager,
            this.arrowLineMarkManager,
            this.axisLineMarkManager,
            this.thickArrowLineMarkManager
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
        if (this.lineSegmentMarkManager) {
            result = this.lineSegmentMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.arrowLineMarkManager) {
            result = this.arrowLineMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.axisLineMarkManager) {
            result = this.axisLineMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.thickArrowLineMarkManager) {
            result = this.thickArrowLineMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.lineSegmentMarkManager) {
            result = this.lineSegmentMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.arrowLineMarkManager) {
            result = this.arrowLineMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.axisLineMarkManager) {
            result = this.axisLineMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.thickArrowLineMarkManager) {
            result = this.thickArrowLineMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.lineSegmentMarkManager) {
            result = this.lineSegmentMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.arrowLineMarkManager) {
            result = this.arrowLineMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.axisLineMarkManager) {
            result = this.axisLineMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.thickArrowLineMarkManager) {
            result = this.thickArrowLineMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        let result: any = null;
        if (this.lineSegmentMarkManager) {
            result = this.lineSegmentMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        return null;
    }

    setLineSegmentMarkMode(chart: Chart): any {
        if (!this.lineSegmentMarkManager) return null;
        const newState = this.lineSegmentMarkManager.setLineSegmentMarkMode();
        chart.currentDrawingType = DrawingType.LineSegment;
        return newState;
    }

    setHorizontalLineMode(chart: Chart): any {
        if (!this.axisLineMarkManager) return null;
        const newState = this.axisLineMarkManager.setHorizontalLineMode();
        chart.currentDrawingType = DrawingType.HorizontalLine;
        return newState;
    }

    setVerticalLineMode(chart: Chart): any {
        if (!this.axisLineMarkManager) return null;
        const newState = this.axisLineMarkManager.setVerticalLineMode();
        chart.currentDrawingType = DrawingType.VerticalLine;
        return newState;
    }

    setArrowLineMarkMode(chart: Chart): any {
        if (!this.arrowLineMarkManager) return null;
        const newState = this.arrowLineMarkManager.setArrowLineMarkMode();
        chart.currentDrawingType = DrawingType.ArrowLine;
        return newState;
    }

    setThickArrowLineMode(chart: Chart): any {
        if (!this.thickArrowLineMarkManager) return null;
        const newState = this.thickArrowLineMarkManager.setThickArrowLineMarkMode();
        chart.currentDrawingType = DrawingType.ThickArrowLine;
        return newState;
    }
    deleteMark(drawingType: DrawingType, iGraph: any): void {
        switch (drawingType) {
            case DrawingType.LineSegment:
                this.lineSegmentMarkManager?.removeLineSegmentMark(iGraph);
                break;
            case DrawingType.ArrowLine:
                this.arrowLineMarkManager?.removeArrowLineMark(iGraph);
                break;
            case DrawingType.ThickArrowLine:
                this.thickArrowLineMarkManager?.removeThickArrowLineMark(iGraph);
                break;
            case DrawingType.HorizontalLine:
                this.axisLineMarkManager?.removeHorizontalLine(iGraph);
                break;
            case DrawingType.VerticalLine:
                this.axisLineMarkManager?.removeVerticalLine(iGraph);
                break;
        }
    }

    deleteAllMarks(): void {
        this.lineSegmentMarkManager?.getLineSegmentMarks().forEach(mark => {
            this.lineSegmentMarkManager?.removeLineSegmentMark(mark);
        });
        this.arrowLineMarkManager?.getArrowLineMarks().forEach(mark => {
            this.arrowLineMarkManager?.removeArrowLineMark(mark);
        });
        this.thickArrowLineMarkManager?.getThickArrowLineMarks().forEach(mark => {
            this.thickArrowLineMarkManager?.removeThickArrowLineMark(mark);
        });
        this.axisLineMarkManager?.getHorizontalLines().forEach(mark => {
            this.axisLineMarkManager?.removeHorizontalLine(mark);
        });
        this.axisLineMarkManager?.getVerticalLines().forEach(mark => {
            this.axisLineMarkManager?.removeVerticalLine(mark);
        });
    }

    showAllMarks(): void {
        this.lineSegmentMarkManager?.showAllMarks();
        this.arrowLineMarkManager?.showAllMarks();
        this.thickArrowLineMarkManager?.showAllMarks();
        this.axisLineMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.lineSegmentMarkManager?.hideAllMarks();
        this.arrowLineMarkManager?.hideAllMarks();
        this.thickArrowLineMarkManager?.hideAllMarks();
        this.axisLineMarkManager?.hideAllMarks();
    }
}