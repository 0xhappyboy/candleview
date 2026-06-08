import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { LongPositionMarkManager } from '../../../MarkManager/Range/LongPositionMarkManager';
import { PriceRangeMarkManager } from '../../../MarkManager/Range/PriceRangeMarkManager';
import { ShortPositionMarkManager } from '../../../MarkManager/Range/ShortPositionMarkManager';
import { TimePriceRangeMarkManager } from '../../../MarkManager/Range/TimePriceRangeMarkManager';
import { TimeRangeMarkManager } from '../../../MarkManager/Range/TimeRangeMarkManager';
import { DrawingType } from '../../../types';

export class RangeMarkersManager implements MarkManagerModule {
    public timeRangeMarkManager: TimeRangeMarkManager | null = null;
    public priceRangeMarkManager: PriceRangeMarkManager | null = null;
    public timePriceRangeMarkManager: TimePriceRangeMarkManager | null = null;
    public longPositionMarkManager: LongPositionMarkManager | null = null;
    public shortPositionMarkManager: ShortPositionMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.timeRangeMarkManager = new TimeRangeMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.priceRangeMarkManager = new PriceRangeMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.timePriceRangeMarkManager = new TimePriceRangeMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.longPositionMarkManager = new LongPositionMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.shortPositionMarkManager = new ShortPositionMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.timeRangeMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.priceRangeMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.timePriceRangeMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.longPositionMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.shortPositionMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.timeRangeMarkManager?.destroy();
        this.priceRangeMarkManager?.destroy();
        this.timePriceRangeMarkManager?.destroy();
        this.longPositionMarkManager?.destroy();
        this.shortPositionMarkManager?.destroy();
    }

    clearState(): void {
        this.timeRangeMarkManager?.clearState();
        this.priceRangeMarkManager?.clearState();
        this.timePriceRangeMarkManager?.clearState();
        this.longPositionMarkManager?.clearState();
        this.shortPositionMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.timeRangeMarkManager?.isOperatingOnChart?.() ||
            this.priceRangeMarkManager?.isOperatingOnChart?.() ||
            this.timePriceRangeMarkManager?.isOperatingOnChart?.() ||
            this.longPositionMarkManager?.isOperatingOnChart?.() ||
            this.shortPositionMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [
            this.timeRangeMarkManager,
            this.priceRangeMarkManager,
            this.timePriceRangeMarkManager,
            this.longPositionMarkManager,
            this.shortPositionMarkManager
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
        if (this.timeRangeMarkManager) {
            result = this.timeRangeMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.priceRangeMarkManager) {
            result = this.priceRangeMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.timePriceRangeMarkManager) {
            result = this.timePriceRangeMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.longPositionMarkManager) {
            result = this.longPositionMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.shortPositionMarkManager) {
            result = this.shortPositionMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.timeRangeMarkManager) {
            result = this.timeRangeMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.priceRangeMarkManager) {
            result = this.priceRangeMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.timePriceRangeMarkManager) {
            result = this.timePriceRangeMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.longPositionMarkManager) {
            result = this.longPositionMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.shortPositionMarkManager) {
            result = this.shortPositionMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.timeRangeMarkManager) {
            result = this.timeRangeMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.priceRangeMarkManager) {
            result = this.priceRangeMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.timePriceRangeMarkManager) {
            result = this.timePriceRangeMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.longPositionMarkManager) {
            result = this.longPositionMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.shortPositionMarkManager) {
            result = this.shortPositionMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        return null;
    }

    setTimeRangeMarkMode(chart: Chart): any {
        if (!this.timeRangeMarkManager) return null;
        const newState = this.timeRangeMarkManager.setTimeRangeMarkMode();
        chart.currentDrawingType = DrawingType.TimeRange;
        return newState;
    }

    setPriceRangeMarkMode(chart: Chart): any {
        if (!this.priceRangeMarkManager) return null;
        const newState = this.priceRangeMarkManager.setPriceRangeMarkMode();
        chart.currentDrawingType = DrawingType.PriceRange;
        return newState;
    }

    setTimePriceRangeMarkMode(chart: Chart): any {
        if (!this.timePriceRangeMarkManager) return null;
        const newState = this.timePriceRangeMarkManager.setTimePriceRangeMarkMode();
        chart.currentDrawingType = DrawingType.TimePriceRange;
        return newState;
    }

    setLongPositionMarkMode(chart: Chart): any {
        if (!this.longPositionMarkManager) return null;
        const newState = this.longPositionMarkManager.setLongPositionMarkMode();
        chart.currentDrawingType = DrawingType.LongPosition;
        return newState;
    }

    setShortPositionMarkMode(chart: Chart): any {
        if (!this.shortPositionMarkManager) return null;
        const newState = this.shortPositionMarkManager.setShortPositionMarkMode();
        chart.currentDrawingType = DrawingType.ShortPosition;
        return newState;
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        switch (drawingType) {
            case DrawingType.TimeRange:
                this.timeRangeMarkManager?.removeTimeRangeMark(iGraph);
                break;
            case DrawingType.PriceRange:
                this.priceRangeMarkManager?.removePriceRangeMark(iGraph);
                break;
            case DrawingType.TimePriceRange:
                this.timePriceRangeMarkManager?.removeTimePriceRangeMark(iGraph);
                break;
            case DrawingType.LongPosition:
                this.longPositionMarkManager?.removeLongPositionMark(iGraph);
                break;
            case DrawingType.ShortPosition:
                this.shortPositionMarkManager?.removeShortPositionMark(iGraph);
                break;
        }
    }

    deleteAllMarks(): void {
        this.timeRangeMarkManager?.getTimeRangeMarks().forEach(mark => {
            this.timeRangeMarkManager?.removeTimeRangeMark(mark);
        });
        this.priceRangeMarkManager?.getPriceRangeMarks().forEach(mark => {
            this.priceRangeMarkManager?.removePriceRangeMark(mark);
        });
        this.timePriceRangeMarkManager?.getTimePriceRangeMarks().forEach(mark => {
            this.timePriceRangeMarkManager?.removeTimePriceRangeMark(mark);
        });
        this.longPositionMarkManager?.getLongPositionMarks().forEach(mark => {
            this.longPositionMarkManager?.removeLongPositionMark(mark);
        });
        this.shortPositionMarkManager?.getShortPositionMarks().forEach(mark => {
            this.shortPositionMarkManager?.removeShortPositionMark(mark);
        });
    }

    showAllMarks(): void {
        this.timeRangeMarkManager?.showAllMarks();
        this.priceRangeMarkManager?.showAllMarks();
        this.timePriceRangeMarkManager?.showAllMarks();
        this.longPositionMarkManager?.showAllMarks();
        this.shortPositionMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.timeRangeMarkManager?.hideAllMarks();
        this.priceRangeMarkManager?.hideAllMarks();
        this.timePriceRangeMarkManager?.hideAllMarks();
        this.longPositionMarkManager?.hideAllMarks();
        this.shortPositionMarkManager?.hideAllMarks();
    }
}