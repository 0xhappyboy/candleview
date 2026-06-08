import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { ABCDMarkManager } from '../../../MarkManager/Pattern/ABCDMarkManager';
import { HeadAndShouldersMarkManager } from '../../../MarkManager/Pattern/HeadAndShouldersMarkManager';
import { TriangleABCDMarkManager } from '../../../MarkManager/Pattern/TriangleABCDMarkManager';
import { XABCDMarkManager } from '../../../MarkManager/Pattern/XABCDMarkManager';
import { DrawingType } from '../../../types';

export class PatternMarkersManager implements MarkManagerModule {
    public xabcdMarkManager: XABCDMarkManager | null = null;
    public headAndShouldersMarkManager: HeadAndShouldersMarkManager | null = null;
    public abcdMarkManager: ABCDMarkManager | null = null;
    public triangleABCDMarkManager: TriangleABCDMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.xabcdMarkManager = new XABCDMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.headAndShouldersMarkManager = new HeadAndShouldersMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.abcdMarkManager = new ABCDMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.triangleABCDMarkManager = new TriangleABCDMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.xabcdMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.headAndShouldersMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.abcdMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.triangleABCDMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.xabcdMarkManager?.destroy();
        this.headAndShouldersMarkManager?.destroy();
        this.abcdMarkManager?.destroy();
        this.triangleABCDMarkManager?.destroy();
    }

    clearState(): void {
        this.xabcdMarkManager?.clearState();
        this.headAndShouldersMarkManager?.clearState();
        this.abcdMarkManager?.clearState();
        this.triangleABCDMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.xabcdMarkManager?.isOperatingOnChart?.() ||
            this.headAndShouldersMarkManager?.isOperatingOnChart?.() ||
            this.abcdMarkManager?.isOperatingOnChart?.() ||
            this.triangleABCDMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [
            this.xabcdMarkManager,
            this.headAndShouldersMarkManager,
            this.abcdMarkManager,
            this.triangleABCDMarkManager
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
        if (this.xabcdMarkManager) {
            result = this.xabcdMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.headAndShouldersMarkManager) {
            result = this.headAndShouldersMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.abcdMarkManager) {
            result = this.abcdMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.triangleABCDMarkManager) {
            result = this.triangleABCDMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.xabcdMarkManager) {
            result = this.xabcdMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.headAndShouldersMarkManager) {
            result = this.headAndShouldersMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.abcdMarkManager) {
            result = this.abcdMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.triangleABCDMarkManager) {
            result = this.triangleABCDMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.xabcdMarkManager) {
            result = this.xabcdMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.headAndShouldersMarkManager) {
            result = this.headAndShouldersMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.abcdMarkManager) {
            result = this.abcdMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.triangleABCDMarkManager) {
            result = this.triangleABCDMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        let result: any = null;
        if (this.triangleABCDMarkManager) {
            result = this.triangleABCDMarkManager.handleKeyDown?.(event);
            if (result) return result;
        }
        return null;
    }

    setXABCDMode(chart: Chart): any {
        if (!this.xabcdMarkManager) return null;
        const newState = this.xabcdMarkManager.setXABCDMode();
        chart.currentDrawingType = DrawingType.XABCD;
        return newState;
    }

    setHeadAndShouldersMode(chart: Chart): any {
        if (!this.headAndShouldersMarkManager) return null;
        const newState = this.headAndShouldersMarkManager.setHeadAndShouldersMode();
        chart.currentDrawingType = DrawingType.HeadAndShoulders;
        return newState;
    }

    setABCDMode(chart: Chart): any {
        if (!this.abcdMarkManager) return null;
        const newState = this.abcdMarkManager.setABCDMode();
        chart.currentDrawingType = DrawingType.ABCD;
        return newState;
    }

    setTriangleABCDMode(chart: Chart): any {
        if (!this.triangleABCDMarkManager) return null;
        const newState = this.triangleABCDMarkManager.setGlassTriangleABCDMode();
        chart.currentDrawingType = DrawingType.TriangleABCD;
        return newState;
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        switch (drawingType) {
            case DrawingType.XABCD:
                this.xabcdMarkManager?.removeXABCDMark(iGraph);
                break;
            case DrawingType.HeadAndShoulders:
                this.headAndShouldersMarkManager?.removeHeadAndShouldersMark(iGraph);
                break;
            case DrawingType.ABCD:
                this.abcdMarkManager?.removeABCDMark(iGraph);
                break;
            case DrawingType.TriangleABCD:
                this.triangleABCDMarkManager?.removeTriangleABCDMark(iGraph);
                break;
        }
    }

    deleteAllMarks(): void {
        this.xabcdMarkManager?.getXABCDMarks().forEach(mark => {
            this.xabcdMarkManager?.removeXABCDMark(mark);
        });
        this.headAndShouldersMarkManager?.getHeadAndShouldersMarks().forEach(mark => {
            this.headAndShouldersMarkManager?.removeHeadAndShouldersMark(mark);
        });
        this.abcdMarkManager?.getABCDMarks().forEach(mark => {
            this.abcdMarkManager?.removeABCDMark(mark);
        });
        this.triangleABCDMarkManager?.getTriangleABCDMarks().forEach(mark => {
            this.triangleABCDMarkManager?.removeTriangleABCDMark(mark);
        });
    }

    showAllMarks(): void {
        this.xabcdMarkManager?.showAllMarks();
        this.headAndShouldersMarkManager?.showAllMarks();
        this.abcdMarkManager?.showAllMarks();
        this.triangleABCDMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.xabcdMarkManager?.hideAllMarks();
        this.headAndShouldersMarkManager?.hideAllMarks();
        this.abcdMarkManager?.hideAllMarks();
        this.triangleABCDMarkManager?.hideAllMarks();
    }
}