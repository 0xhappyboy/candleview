import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { ImageMarkManager } from '../../../MarkManager/Content/ImageMarkManager';
import { DrawingType } from '../../../types';

export class ContentMarkersManager implements MarkManagerModule {
    public imageMarkManager: ImageMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.imageMarkManager = new ImageMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.imageMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.imageMarkManager?.destroy();
    }

    clearState(): void {
        this.imageMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!this.imageMarkManager?.isOperatingOnChart?.();
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        if (this.imageMarkManager?.getMarkAtPoint) {
            return this.imageMarkManager.getMarkAtPoint(point);
        }
        return null;
    }

    handleMouseDown(point: { x: number; y: number }): any {
        if (this.imageMarkManager) {
            return this.imageMarkManager.handleMouseDown(point);
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        if (this.imageMarkManager) {
            return this.imageMarkManager.handleMouseMove(point);
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        if (this.imageMarkManager) {
            return this.imageMarkManager.handleMouseUp(point);
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        return null;
    }

    setImageMarkMode(chart: Chart): void {
        if (this.imageMarkManager) {
            chart.currentDrawingType = DrawingType.Image;
        }
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        if (drawingType === DrawingType.Image) {
            this.imageMarkManager?.removeImageMark(iGraph);
        }
    }

    deleteAllMarks(): void {
        this.imageMarkManager?.getImageMarks().forEach(mark => {
            this.imageMarkManager?.removeImageMark(mark);
        });
    }

    showAllMarks(): void {
        this.imageMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.imageMarkManager?.hideAllMarks();
    }
}