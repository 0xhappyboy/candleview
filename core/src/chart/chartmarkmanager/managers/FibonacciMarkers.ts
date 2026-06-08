import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { FibonacciArcMarkManager } from '../../../MarkManager/Fibonacci/FibonacciArcMarkManager';
import { FibonacciChannelMarkManager } from '../../../MarkManager/Fibonacci/FibonacciChannelMarkManager';
import { FibonacciCircleMarkManager } from '../../../MarkManager/Fibonacci/FibonacciCircleMarkManager';
import { FibonacciExtensionBasePriceMarkManager } from '../../../MarkManager/Fibonacci/FibonacciExtensionBasePriceMarkManager';
import { FibonacciExtensionBaseTimeMarkManager } from '../../../MarkManager/Fibonacci/FibonacciExtensionBaseTimeMarkManager';
import { FibonacciFanMarkManager } from '../../../MarkManager/Fibonacci/FibonacciFanMarkManager';
import { FibonacciRetracementMarkManager } from '../../../MarkManager/Fibonacci/FibonacciRetracementMarkManager';
import { FibonacciSpiralMarkManager } from '../../../MarkManager/Fibonacci/FibonacciSpiralMarkManager';
import { FibonacciTimeZoonMarkManager } from '../../../MarkManager/Fibonacci/FibonacciTimeZoonMarkManager';
import { FibonacciWedgeMarkManager } from '../../../MarkManager/Fibonacci/FibonacciWedgeMarkManager';
import { DrawingType } from '../../../types';

export class FibonacciMarkersManager implements MarkManagerModule {
    public fibonacciTimeZoonMarkManager: FibonacciTimeZoonMarkManager | null = null;
    public fibonacciRetracementMarkManager: FibonacciRetracementMarkManager | null = null;
    public fibonacciArcMarkManager: FibonacciArcMarkManager | null = null;
    public fibonacciCircleMarkManager: FibonacciCircleMarkManager | null = null;
    public fibonacciSpiralMarkManager: FibonacciSpiralMarkManager | null = null;
    public fibonacciWedgeMarkManager: FibonacciWedgeMarkManager | null = null;
    public fibonacciFanMarkManager: FibonacciFanMarkManager | null = null;
    public fibonacciChannelMarkManager: FibonacciChannelMarkManager | null = null;
    public fibonacciExtensionBasePriceMarkManager: FibonacciExtensionBasePriceMarkManager | null = null;
    public fibonacciExtensionBaseTimeMarkManager: FibonacciExtensionBaseTimeMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.fibonacciTimeZoonMarkManager = new FibonacciTimeZoonMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.fibonacciRetracementMarkManager = new FibonacciRetracementMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.fibonacciArcMarkManager = new FibonacciArcMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.fibonacciCircleMarkManager = new FibonacciCircleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.fibonacciSpiralMarkManager = new FibonacciSpiralMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.fibonacciWedgeMarkManager = new FibonacciWedgeMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.fibonacciFanMarkManager = new FibonacciFanMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.fibonacciChannelMarkManager = new FibonacciChannelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.fibonacciExtensionBasePriceMarkManager = new FibonacciExtensionBasePriceMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.fibonacciExtensionBaseTimeMarkManager = new FibonacciExtensionBaseTimeMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.fibonacciTimeZoonMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.fibonacciRetracementMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.fibonacciArcMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.fibonacciCircleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.fibonacciSpiralMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.fibonacciWedgeMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.fibonacciFanMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.fibonacciChannelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.fibonacciExtensionBasePriceMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.fibonacciExtensionBaseTimeMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.fibonacciTimeZoonMarkManager?.destroy();
        this.fibonacciRetracementMarkManager?.destroy();
        this.fibonacciArcMarkManager?.destroy();
        this.fibonacciCircleMarkManager?.destroy();
        this.fibonacciSpiralMarkManager?.destroy();
        this.fibonacciWedgeMarkManager?.destroy();
        this.fibonacciFanMarkManager?.destroy();
        this.fibonacciChannelMarkManager?.destroy();
        this.fibonacciExtensionBasePriceMarkManager?.destroy();
        this.fibonacciExtensionBaseTimeMarkManager?.destroy();
    }

    clearState(): void {
        this.fibonacciTimeZoonMarkManager?.clearState();
        this.fibonacciRetracementMarkManager?.clearState();
        this.fibonacciArcMarkManager?.clearState();
        this.fibonacciCircleMarkManager?.clearState();
        this.fibonacciSpiralMarkManager?.clearState();
        this.fibonacciWedgeMarkManager?.clearState();
        this.fibonacciFanMarkManager?.clearState();
        this.fibonacciChannelMarkManager?.clearState();
        this.fibonacciExtensionBasePriceMarkManager?.clearState();
        this.fibonacciExtensionBaseTimeMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.fibonacciTimeZoonMarkManager?.isOperatingOnChart?.() ||
            this.fibonacciRetracementMarkManager?.isOperatingOnChart?.() ||
            this.fibonacciArcMarkManager?.isOperatingOnChart?.() ||
            this.fibonacciCircleMarkManager?.isOperatingOnChart?.() ||
            this.fibonacciSpiralMarkManager?.isOperatingOnChart?.() ||
            this.fibonacciWedgeMarkManager?.isOperatingOnChart?.() ||
            this.fibonacciFanMarkManager?.isOperatingOnChart?.() ||
            this.fibonacciChannelMarkManager?.isOperatingOnChart?.() ||
            this.fibonacciExtensionBasePriceMarkManager?.isOperatingOnChart?.() ||
            this.fibonacciExtensionBaseTimeMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [
            this.fibonacciTimeZoonMarkManager,
            this.fibonacciRetracementMarkManager,
            this.fibonacciArcMarkManager,
            this.fibonacciCircleMarkManager,
            this.fibonacciSpiralMarkManager,
            this.fibonacciWedgeMarkManager,
            this.fibonacciFanMarkManager,
            this.fibonacciChannelMarkManager,
            this.fibonacciExtensionBasePriceMarkManager,
            this.fibonacciExtensionBaseTimeMarkManager
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
        const managers = [
            this.fibonacciTimeZoonMarkManager,
            this.fibonacciRetracementMarkManager,
            this.fibonacciArcMarkManager,
            this.fibonacciCircleMarkManager,
            this.fibonacciSpiralMarkManager,
            this.fibonacciWedgeMarkManager,
            this.fibonacciFanMarkManager,
            this.fibonacciChannelMarkManager,
            this.fibonacciExtensionBasePriceMarkManager,
            this.fibonacciExtensionBaseTimeMarkManager
        ];
        for (const manager of managers) {
            if (manager) {
                result = manager.handleMouseDown(point);
                if (result) return result;
            }
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        const managers = [
            this.fibonacciTimeZoonMarkManager,
            this.fibonacciRetracementMarkManager,
            this.fibonacciArcMarkManager,
            this.fibonacciCircleMarkManager,
            this.fibonacciSpiralMarkManager,
            this.fibonacciWedgeMarkManager,
            this.fibonacciFanMarkManager,
            this.fibonacciChannelMarkManager,
            this.fibonacciExtensionBasePriceMarkManager,
            this.fibonacciExtensionBaseTimeMarkManager
        ];
        for (const manager of managers) {
            if (manager) {
                result = manager.handleMouseMove(point);
                if (result) return result;
            }
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        const managers = [
            this.fibonacciTimeZoonMarkManager,
            this.fibonacciRetracementMarkManager,
            this.fibonacciArcMarkManager,
            this.fibonacciCircleMarkManager,
            this.fibonacciSpiralMarkManager,
            this.fibonacciWedgeMarkManager,
            this.fibonacciFanMarkManager,
            this.fibonacciChannelMarkManager,
            this.fibonacciExtensionBasePriceMarkManager,
            this.fibonacciExtensionBaseTimeMarkManager
        ];
        for (const manager of managers) {
            if (manager) {
                result = manager.handleMouseUp(point);
                if (result) return result;
            }
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        let result: any = null;
        const managers = [
            this.fibonacciTimeZoonMarkManager,
            this.fibonacciRetracementMarkManager,
            this.fibonacciCircleMarkManager,
            this.fibonacciSpiralMarkManager,
            this.fibonacciFanMarkManager,
            this.fibonacciExtensionBasePriceMarkManager,
            this.fibonacciExtensionBaseTimeMarkManager
        ];
        for (const manager of managers) {
            if (manager) {
                result = manager.handleKeyDown?.(event);
                if (result) return result;
            }
        }
        return null;
    }

    setFibonacciTimeZoonMode(chart: Chart): any {
        if (!this.fibonacciTimeZoonMarkManager) return null;
        const newState = this.fibonacciTimeZoonMarkManager.setFibonacciTimeZoneMode();
        chart.currentDrawingType = DrawingType.FibonacciTimeZoon;
        return newState;
    }

    setFibonacciRetracementMode(chart: Chart): any {
        if (!this.fibonacciRetracementMarkManager) return null;
        const newState = this.fibonacciRetracementMarkManager.setFibonacciRetracementMode();
        chart.currentDrawingType = DrawingType.FibonacciRetracement;
        return newState;
    }

    setFibonacciArcMode(chart: Chart): any {
        if (!this.fibonacciArcMarkManager) return null;
        const newState = this.fibonacciArcMarkManager.setFibonacciArcMode();
        chart.currentDrawingType = DrawingType.FibonacciArc;
        return newState;
    }

    setFibonacciCircleMode(chart: Chart): any {
        if (!this.fibonacciCircleMarkManager) return null;
        const newState = this.fibonacciCircleMarkManager.setFibonacciCircleMode();
        chart.currentDrawingType = DrawingType.FibonacciCircle;
        return newState;
    }

    setFibonacciSpiralMode(chart: Chart): any {
        if (!this.fibonacciSpiralMarkManager) return null;
        const newState = this.fibonacciSpiralMarkManager.setFibonacciSpiralMode();
        chart.currentDrawingType = DrawingType.FibonacciSpiral;
        return newState;
    }

    setFibonacciWedgeMode(chart: Chart): any {
        if (!this.fibonacciWedgeMarkManager) return null;
        const newState = this.fibonacciWedgeMarkManager.setFibonacciWedgeMode();
        chart.currentDrawingType = DrawingType.FibonacciWedge;
        return newState;
    }

    setFibonacciFanMode(chart: Chart): any {
        if (!this.fibonacciFanMarkManager) return null;
        const newState = this.fibonacciFanMarkManager.setFibonacciFanMode();
        chart.currentDrawingType = DrawingType.FibonacciFan;
        return newState;
    }

    setFibonacciChannelMode(chart: Chart): any {
        if (!this.fibonacciChannelMarkManager) return null;
        const newState = this.fibonacciChannelMarkManager.setFibonacciChannelMarkMode();
        chart.currentDrawingType = DrawingType.FibonacciChannel;
        return newState;
    }

    setFibonacciExtensionBasePriceMode(chart: Chart): any {
        if (!this.fibonacciExtensionBasePriceMarkManager) return null;
        const newState = this.fibonacciExtensionBasePriceMarkManager.setFibonacciExtensionBasePriceMode();
        chart.currentDrawingType = DrawingType.FibonacciExtensionBasePrice;
        return newState;
    }

    setFibonacciExtensionBaseTimeMode(chart: Chart): any {
        if (!this.fibonacciExtensionBaseTimeMarkManager) return null;
        const newState = this.fibonacciExtensionBaseTimeMarkManager.setFibonacciExtensionBaseTimeMode();
        chart.currentDrawingType = DrawingType.FibonacciExtensionBaseTime;
        return newState;
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        switch (drawingType) {
            case DrawingType.FibonacciTimeZoon:
                this.fibonacciTimeZoonMarkManager?.removeFibonacciTimeZoonMark(iGraph);
                break;
            case DrawingType.FibonacciRetracement:
                this.fibonacciRetracementMarkManager?.removeFibonacciRetracementMark(iGraph);
                break;
            case DrawingType.FibonacciArc:
                this.fibonacciArcMarkManager?.removeFibonacciArcMark(iGraph);
                break;
            case DrawingType.FibonacciCircle:
                this.fibonacciCircleMarkManager?.removeFibonacciCircleMark(iGraph);
                break;
            case DrawingType.FibonacciSpiral:
                this.fibonacciSpiralMarkManager?.removeFibonacciSpiralMark(iGraph);
                break;
            case DrawingType.FibonacciWedge:
                this.fibonacciWedgeMarkManager?.removeFibonacciWedgeMark(iGraph);
                break;
            case DrawingType.FibonacciFan:
                this.fibonacciFanMarkManager?.removeFibonacciFan(iGraph);
                break;
            case DrawingType.FibonacciChannel:
                this.fibonacciChannelMarkManager?.removeFibonacciChannelMark(iGraph);
                break;
            case DrawingType.FibonacciExtensionBasePrice:
                this.fibonacciExtensionBasePriceMarkManager?.removeFibonacciExtensionBasePriceMark(iGraph);
                break;
            case DrawingType.FibonacciExtensionBaseTime:
                this.fibonacciExtensionBaseTimeMarkManager?.removeFibonacciExtensionBaseTimeMark(iGraph);
                break;
        }
    }

    deleteAllMarks(): void {
        this.fibonacciTimeZoonMarkManager?.getFibonacciTimeZoonMarks().forEach(mark => {
            this.fibonacciTimeZoonMarkManager?.removeFibonacciTimeZoonMark(mark);
        });
        this.fibonacciRetracementMarkManager?.getFibonacciRetracementMarks().forEach(mark => {
            this.fibonacciRetracementMarkManager?.removeFibonacciRetracementMark(mark);
        });
        this.fibonacciArcMarkManager?.getFibonacciArcMarks().forEach(mark => {
            this.fibonacciArcMarkManager?.removeFibonacciArcMark(mark);
        });
        this.fibonacciCircleMarkManager?.getFibonacciCircleMarks().forEach(mark => {
            this.fibonacciCircleMarkManager?.removeFibonacciCircleMark(mark);
        });
        this.fibonacciSpiralMarkManager?.getFibonacciSpiralMarks().forEach(mark => {
            this.fibonacciSpiralMarkManager?.removeFibonacciSpiralMark(mark);
        });
        this.fibonacciWedgeMarkManager?.getFibonacciWedgeMarks().forEach(mark => {
            this.fibonacciWedgeMarkManager?.removeFibonacciWedgeMark(mark);
        });
        this.fibonacciFanMarkManager?.getFibonacciFans().forEach(mark => {
            this.fibonacciFanMarkManager?.removeFibonacciFan(mark);
        });
        this.fibonacciChannelMarkManager?.getFibonacciChannelMarks().forEach(mark => {
            this.fibonacciChannelMarkManager?.removeFibonacciChannelMark(mark);
        });
        this.fibonacciExtensionBasePriceMarkManager?.getFibonacciExtensionBasePriceMarks().forEach(mark => {
            this.fibonacciExtensionBasePriceMarkManager?.removeFibonacciExtensionBasePriceMark(mark);
        });
        this.fibonacciExtensionBaseTimeMarkManager?.getFibonacciExtensionBaseTimeMarks().forEach(mark => {
            this.fibonacciExtensionBaseTimeMarkManager?.removeFibonacciExtensionBaseTimeMark(mark);
        });
    }

    showAllMarks(): void {
        this.fibonacciTimeZoonMarkManager?.showAllMarks();
        this.fibonacciRetracementMarkManager?.showAllMarks();
        this.fibonacciArcMarkManager?.showAllMarks();
        this.fibonacciCircleMarkManager?.showAllMarks();
        this.fibonacciSpiralMarkManager?.showAllMarks();
        this.fibonacciWedgeMarkManager?.showAllMarks();
        this.fibonacciFanMarkManager?.showAllMarks();
        this.fibonacciChannelMarkManager?.showAllMarks();
        this.fibonacciExtensionBasePriceMarkManager?.showAllMarks();
        this.fibonacciExtensionBaseTimeMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.fibonacciTimeZoonMarkManager?.hideAllMarks();
        this.fibonacciRetracementMarkManager?.hideAllMarks();
        this.fibonacciArcMarkManager?.hideAllMarks();
        this.fibonacciCircleMarkManager?.hideAllMarks();
        this.fibonacciSpiralMarkManager?.hideAllMarks();
        this.fibonacciWedgeMarkManager?.hideAllMarks();
        this.fibonacciFanMarkManager?.hideAllMarks();
        this.fibonacciChannelMarkManager?.hideAllMarks();
        this.fibonacciExtensionBasePriceMarkManager?.hideAllMarks();
        this.fibonacciExtensionBaseTimeMarkManager?.hideAllMarks();
    }
}