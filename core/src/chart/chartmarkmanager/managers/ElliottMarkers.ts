import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { ElliottCorrectiveMarkManager } from '../../../MarkManager/Elliott/ElliottCorrectiveMarkManager';
import { ElliottDoubleCombinationMarkManager } from '../../../MarkManager/Elliott/ElliottDoubleCombinationMarkManager';
import { ElliottImpulseMarkManager } from '../../../MarkManager/Elliott/ElliottImpulseMarkManager';
import { ElliottTriangleMarkManager } from '../../../MarkManager/Elliott/ElliottTriangleMarkManager';
import { ElliottTripleCombinationMarkManager } from '../../../MarkManager/Elliott/ElliottTripleCombinationMarkManager';
import { DrawingType } from '../../../types';

export class ElliottMarkersManager implements MarkManagerModule {
    public elliottImpulseMarkManager: ElliottImpulseMarkManager | null = null;
    public elliottCorrectiveMarkManager: ElliottCorrectiveMarkManager | null = null;
    public elliottTriangleMarkManager: ElliottTriangleMarkManager | null = null;
    public elliottDoubleCombinationMarkManager: ElliottDoubleCombinationMarkManager | null = null;
    public elliottTripleCombinationMarkManager: ElliottTripleCombinationMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.elliottImpulseMarkManager = new ElliottImpulseMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.elliottCorrectiveMarkManager = new ElliottCorrectiveMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.elliottTriangleMarkManager = new ElliottTriangleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.elliottDoubleCombinationMarkManager = new ElliottDoubleCombinationMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.elliottTripleCombinationMarkManager = new ElliottTripleCombinationMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.elliottImpulseMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.elliottCorrectiveMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.elliottTriangleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.elliottDoubleCombinationMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.elliottTripleCombinationMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.elliottImpulseMarkManager?.destroy();
        this.elliottCorrectiveMarkManager?.destroy();
        this.elliottTriangleMarkManager?.destroy();
        this.elliottDoubleCombinationMarkManager?.destroy();
        this.elliottTripleCombinationMarkManager?.destroy();
    }

    clearState(): void {
        this.elliottImpulseMarkManager?.clearState();
        this.elliottCorrectiveMarkManager?.clearState();
        this.elliottTriangleMarkManager?.clearState();
        this.elliottDoubleCombinationMarkManager?.clearState();
        this.elliottTripleCombinationMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.elliottImpulseMarkManager?.isOperatingOnChart?.() ||
            this.elliottCorrectiveMarkManager?.isOperatingOnChart?.() ||
            this.elliottTriangleMarkManager?.isOperatingOnChart?.() ||
            this.elliottDoubleCombinationMarkManager?.isOperatingOnChart?.() ||
            this.elliottTripleCombinationMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [
            this.elliottImpulseMarkManager,
            this.elliottCorrectiveMarkManager,
            this.elliottTriangleMarkManager,
            this.elliottDoubleCombinationMarkManager,
            this.elliottTripleCombinationMarkManager
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
        if (this.elliottImpulseMarkManager) {
            result = this.elliottImpulseMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.elliottCorrectiveMarkManager) {
            result = this.elliottCorrectiveMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.elliottTriangleMarkManager) {
            result = this.elliottTriangleMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.elliottDoubleCombinationMarkManager) {
            result = this.elliottDoubleCombinationMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.elliottTripleCombinationMarkManager) {
            result = this.elliottTripleCombinationMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.elliottImpulseMarkManager) {
            result = this.elliottImpulseMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.elliottCorrectiveMarkManager) {
            result = this.elliottCorrectiveMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.elliottTriangleMarkManager) {
            result = this.elliottTriangleMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.elliottDoubleCombinationMarkManager) {
            result = this.elliottDoubleCombinationMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.elliottTripleCombinationMarkManager) {
            result = this.elliottTripleCombinationMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.elliottImpulseMarkManager) {
            result = this.elliottImpulseMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.elliottCorrectiveMarkManager) {
            result = this.elliottCorrectiveMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.elliottTriangleMarkManager) {
            result = this.elliottTriangleMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.elliottDoubleCombinationMarkManager) {
            result = this.elliottDoubleCombinationMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.elliottTripleCombinationMarkManager) {
            result = this.elliottTripleCombinationMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        return null;
    }

    setElliottImpulseMode(chart: Chart): any {
        if (!this.elliottImpulseMarkManager) return null;
        const newState = this.elliottImpulseMarkManager.setElliottImpulseMode();
        chart.currentDrawingType = DrawingType.Elliott_Impulse;
        return newState;
    }

    setElliottCorrectiveMode(chart: Chart): any {
        if (!this.elliottCorrectiveMarkManager) return null;
        const newState = this.elliottCorrectiveMarkManager.setElliottCorrectiveMode();
        chart.currentDrawingType = DrawingType.Elliott_Corrective;
        return newState;
    }

    setElliottTriangleMode(chart: Chart): any {
        if (!this.elliottTriangleMarkManager) return null;
        const newState = this.elliottTriangleMarkManager.setElliottTriangleMode();
        chart.currentDrawingType = DrawingType.Elliott_Triangle;
        return newState;
    }

    setElliottDoubleCombinationMode(chart: Chart): any {
        if (!this.elliottDoubleCombinationMarkManager) return null;
        const newState = this.elliottDoubleCombinationMarkManager.setElliottDoubleCombinationMode();
        chart.currentDrawingType = DrawingType.Elliott_Double_Combination;
        return newState;
    }

    setElliottTripleCombinationMode(chart: Chart): any {
        if (!this.elliottTripleCombinationMarkManager) return null;
        const newState = this.elliottTripleCombinationMarkManager.setElliottTripleCombinationMode();
        chart.currentDrawingType = DrawingType.Elliott_Triple_Combination;
        return newState;
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        switch (drawingType) {
            case DrawingType.Elliott_Impulse:
                this.elliottImpulseMarkManager?.removeElliottImpulseMark(iGraph);
                break;
            case DrawingType.Elliott_Corrective:
                this.elliottCorrectiveMarkManager?.removeElliottCorrectiveMark(iGraph);
                break;
            case DrawingType.Elliott_Triangle:
                this.elliottTriangleMarkManager?.removeElliottTriangleMark(iGraph);
                break;
            case DrawingType.Elliott_Double_Combination:
                this.elliottDoubleCombinationMarkManager?.removeElliottDoubleCombinationMark(iGraph);
                break;
            case DrawingType.Elliott_Triple_Combination:
                this.elliottTripleCombinationMarkManager?.removeElliottTripleCombinationMark(iGraph);
                break;
        }
    }

    deleteAllMarks(): void {
        this.elliottImpulseMarkManager?.getElliottImpulseMarks().forEach(mark => {
            this.elliottImpulseMarkManager?.removeElliottImpulseMark(mark);
        });
        this.elliottCorrectiveMarkManager?.getElliottCorrectiveMarks().forEach(mark => {
            this.elliottCorrectiveMarkManager?.removeElliottCorrectiveMark(mark);
        });
        this.elliottTriangleMarkManager?.getElliottTriangleMarks().forEach(mark => {
            this.elliottTriangleMarkManager?.removeElliottTriangleMark(mark);
        });
        this.elliottDoubleCombinationMarkManager?.getElliottDoubleCombinationMarks().forEach(mark => {
            this.elliottDoubleCombinationMarkManager?.removeElliottDoubleCombinationMark(mark);
        });
        this.elliottTripleCombinationMarkManager?.getElliottTripleCombinationMarks().forEach(mark => {
            this.elliottTripleCombinationMarkManager?.removeElliottTripleCombinationMark(mark);
        });
    }

    showAllMarks(): void {
        this.elliottImpulseMarkManager?.showAllMarks();
        this.elliottCorrectiveMarkManager?.showAllMarks();
        this.elliottTriangleMarkManager?.showAllMarks();
        this.elliottDoubleCombinationMarkManager?.showAllMarks();
        this.elliottTripleCombinationMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.elliottImpulseMarkManager?.hideAllMarks();
        this.elliottCorrectiveMarkManager?.hideAllMarks();
        this.elliottTriangleMarkManager?.hideAllMarks();
        this.elliottDoubleCombinationMarkManager?.hideAllMarks();
        this.elliottTripleCombinationMarkManager?.hideAllMarks();
    }
}