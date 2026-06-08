import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { PriceEventMarkManager } from '../../../MarkManager/Script/PriceEventMarkManager';
import { TimeEventMarkManager } from '../../../MarkManager/Script/TimeEventMarkManager';
import { DrawingType } from '../../../types';

export class ScriptMarkersManager implements MarkManagerModule {
    public timeEventMarkManager: TimeEventMarkManager | null = null;
    public priceEventMarkManager: PriceEventMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.timeEventMarkManager = new TimeEventMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing,
            onDoubleClick: (id, time, script) => {
                // open script editor
            }
        });
        this.priceEventMarkManager = new PriceEventMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing,
            onDoubleClick: (id, price, script) => {
                // open script editor
            }
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.timeEventMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.priceEventMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.timeEventMarkManager?.destroy();
        this.priceEventMarkManager?.destroy();
    }

    clearState(): void {
        this.timeEventMarkManager?.clearState();
        this.priceEventMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.timeEventMarkManager?.isOperatingOnChart?.() ||
            this.priceEventMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [this.timeEventMarkManager, this.priceEventMarkManager];
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
        if (this.priceEventMarkManager) {
            result = this.priceEventMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.timeEventMarkManager) {
            result = this.timeEventMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.priceEventMarkManager) {
            result = this.priceEventMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.timeEventMarkManager) {
            result = this.timeEventMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.priceEventMarkManager) {
            result = this.priceEventMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.timeEventMarkManager) {
            result = this.timeEventMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        let result: any = null;
        if (this.priceEventMarkManager) {
            result = this.priceEventMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        return null;
    }

    setPriceEventMode(chart: Chart): any {
        if (!this.priceEventMarkManager) return null;
        const newState = this.priceEventMarkManager.setPriceEventMode();
        chart.currentDrawingType = DrawingType.PriceEvent;
        return newState;
    }

    setTimeEventMode(chart: Chart): any {
        if (!this.timeEventMarkManager) return null;
        const newState = this.timeEventMarkManager.setTimeEventMode();
        chart.currentDrawingType = DrawingType.TimeEvent;
        return newState;
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        if (drawingType === DrawingType.PriceEvent) {
            this.priceEventMarkManager?.removePriceEventMark(iGraph);
        } else if (drawingType === DrawingType.TimeEvent) {
            this.timeEventMarkManager?.removeTimeEventMark(iGraph);
        }
    }

    deleteAllMarks(): void {
        this.priceEventMarkManager?.getPriceEventMarks().forEach(mark => {
            this.priceEventMarkManager?.removePriceEventMark(mark);
        });
        this.timeEventMarkManager?.getTimeEventMarks().forEach(mark => {
            this.timeEventMarkManager?.removeTimeEventMark(mark);
        });
    }

    showAllMarks(): void {
        this.priceEventMarkManager?.showAllMarks();
        this.timeEventMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.priceEventMarkManager?.hideAllMarks();
        this.timeEventMarkManager?.hideAllMarks();
    }
}