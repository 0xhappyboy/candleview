import { MarkManagerContext, MarkManagerModule } from '../types';
import { Chart } from '../../Chart';
import { CircleMarkManager } from '../../../MarkManager/Shape/CircleMarkManager';
import { CurveMarkManager } from '../../../MarkManager/Shape/CurveMarkManager';
import { DoubleCurveMarkManager } from '../../../MarkManager/Shape/DoubleCurveMarkManager';
import { EllipseMarkManager } from '../../../MarkManager/Shape/EllipseMarkManager';
import { RectangleMarkManager } from '../../../MarkManager/Shape/RectangleMarkManager';
import { SectorMarkManager } from '../../../MarkManager/Shape/SectorMarkManager';
import { TriangleMarkManager } from '../../../MarkManager/Shape/TriangleMarkManager';
import { DrawingType } from '../../../types';

export class ShapeMarkersManager implements MarkManagerModule {
    public rectangleMarkManager: RectangleMarkManager | null = null;
    public circleMarkManager: CircleMarkManager | null = null;
    public ellipseMarkManager: EllipseMarkManager | null = null;
    public triangleMarkManager: TriangleMarkManager | null = null;
    public sectorMarkManager: SectorMarkManager | null = null;
    public curveMarkManager: CurveMarkManager | null = null;
    public doubleCurveMarkManager: DoubleCurveMarkManager | null = null;

    initialize(context: MarkManagerContext): void {
        const chart = context.chart;
        this.rectangleMarkManager = new RectangleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.circleMarkManager = new CircleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.ellipseMarkManager = new EllipseMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.triangleMarkManager = new TriangleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.sectorMarkManager = new SectorMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.curveMarkManager = new CurveMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.doubleCurveMarkManager = new DoubleCurveMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef.current,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    updateProps(context: MarkManagerContext): void {
        const chart = context.chart;
        this.rectangleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.circleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.ellipseMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.triangleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.sectorMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.curveMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.doubleCurveMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
    }

    destroy(): void {
        this.rectangleMarkManager?.destroy();
        this.circleMarkManager?.destroy();
        this.ellipseMarkManager?.destroy();
        this.triangleMarkManager?.destroy();
        this.sectorMarkManager?.destroy();
        this.curveMarkManager?.destroy();
        this.doubleCurveMarkManager?.destroy();
    }

    clearState(): void {
        this.rectangleMarkManager?.clearState();
        this.circleMarkManager?.clearState();
        this.ellipseMarkManager?.clearState();
        this.triangleMarkManager?.clearState();
        this.sectorMarkManager?.clearState();
        this.curveMarkManager?.clearState();
        this.doubleCurveMarkManager?.clearState();
    }

    isOperatingOnChart(): boolean {
        return !!(this.rectangleMarkManager?.isOperatingOnChart?.() ||
            this.circleMarkManager?.isOperatingOnChart?.() ||
            this.ellipseMarkManager?.isOperatingOnChart?.() ||
            this.triangleMarkManager?.isOperatingOnChart?.() ||
            this.sectorMarkManager?.isOperatingOnChart?.() ||
            this.curveMarkManager?.isOperatingOnChart?.() ||
            this.doubleCurveMarkManager?.isOperatingOnChart?.());
    }

    getMarkAtPoint(point: { x: number; y: number }): any {
        const managers = [
            this.rectangleMarkManager,
            this.circleMarkManager,
            this.ellipseMarkManager,
            this.triangleMarkManager,
            this.sectorMarkManager,
            this.curveMarkManager,
            this.doubleCurveMarkManager
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
        if (this.rectangleMarkManager) {
            result = this.rectangleMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.circleMarkManager) {
            result = this.circleMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.ellipseMarkManager) {
            result = this.ellipseMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.triangleMarkManager) {
            result = this.triangleMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.sectorMarkManager) {
            result = this.sectorMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.curveMarkManager) {
            result = this.curveMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        if (this.doubleCurveMarkManager) {
            result = this.doubleCurveMarkManager.handleMouseDown(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseMove(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.rectangleMarkManager) {
            result = this.rectangleMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.circleMarkManager) {
            result = this.circleMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.ellipseMarkManager) {
            result = this.ellipseMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.triangleMarkManager) {
            result = this.triangleMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.sectorMarkManager) {
            result = this.sectorMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.curveMarkManager) {
            result = this.curveMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        if (this.doubleCurveMarkManager) {
            result = this.doubleCurveMarkManager.handleMouseMove(point);
            if (result) return result;
        }
        return null;
    }

    handleMouseUp(point: { x: number; y: number }): any {
        let result: any = null;
        if (this.rectangleMarkManager) {
            result = this.rectangleMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.circleMarkManager) {
            result = this.circleMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.ellipseMarkManager) {
            result = this.ellipseMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.triangleMarkManager) {
            result = this.triangleMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.sectorMarkManager) {
            result = this.sectorMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.curveMarkManager) {
            result = this.curveMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        if (this.doubleCurveMarkManager) {
            result = this.doubleCurveMarkManager.handleMouseUp(point);
            if (result) return result;
        }
        return null;
    }

    handleKeyDown(event: KeyboardEvent): any {
        return null;
    }

    setRectangleMarkMode(chart: Chart): any {
        if (!this.rectangleMarkManager) return null;
        const newState = this.rectangleMarkManager.setRectangleMarkMode();
        chart.currentDrawingType = DrawingType.Rectangle;
        return newState;
    }

    setCircleMarkMode(chart: Chart): any {
        if (!this.circleMarkManager) return null;
        const newState = this.circleMarkManager.setCircleMarkMode();
        chart.currentDrawingType = DrawingType.Circle;
        return newState;
    }

    setEllipseMarkMode(chart: Chart): any {
        if (!this.ellipseMarkManager) return null;
        const newState = this.ellipseMarkManager.setEllipseMarkMode();
        chart.currentDrawingType = DrawingType.Ellipse;
        return newState;
    }

    setTriangleMarkMode(chart: Chart): any {
        if (!this.triangleMarkManager) return null;
        const newState = this.triangleMarkManager.setTriangleMarkMode();
        chart.currentDrawingType = DrawingType.Triangle;
        return newState;
    }

    setSectorMode(chart: Chart): any {
        if (!this.sectorMarkManager) return null;
        const newState = this.sectorMarkManager.setSectorMode();
        chart.currentDrawingType = DrawingType.Sector;
        return newState;
    }

    setCurveMode(chart: Chart): any {
        if (!this.curveMarkManager) return null;
        const newState = this.curveMarkManager.setCurveMarkMode();
        chart.currentDrawingType = DrawingType.Curve;
        return newState;
    }

    setDoubleCurveMode(chart: Chart): any {
        if (!this.doubleCurveMarkManager) return null;
        const newState = this.doubleCurveMarkManager.setDoubleCurveMarkMode();
        chart.currentDrawingType = DrawingType.DoubleCurve;
        return newState;
    }

    deleteMark(drawingType: DrawingType, iGraph: any): void {
        switch (drawingType) {
            case DrawingType.Rectangle:
                this.rectangleMarkManager?.removeRectangleMark(iGraph);
                break;
            case DrawingType.Circle:
                this.circleMarkManager?.removeCircleMark(iGraph);
                break;
            case DrawingType.Ellipse:
                this.ellipseMarkManager?.removeEllipseMark(iGraph);
                break;
            case DrawingType.Triangle:
                this.triangleMarkManager?.removeTriangleMark(iGraph);
                break;
            case DrawingType.Sector:
                this.sectorMarkManager?.removeSectorMark(iGraph);
                break;
            case DrawingType.Curve:
                this.curveMarkManager?.removeCurveMark(iGraph);
                break;
            case DrawingType.DoubleCurve:
                this.doubleCurveMarkManager?.removeDoubleCurveMark(iGraph);
                break;
        }
    }

    deleteAllMarks(): void {
        this.rectangleMarkManager?.getRectangleMarks().forEach(mark => {
            this.rectangleMarkManager?.removeRectangleMark(mark);
        });
        this.circleMarkManager?.getCircleMarks().forEach(mark => {
            this.circleMarkManager?.removeCircleMark(mark);
        });
        this.ellipseMarkManager?.getEllipseMarks().forEach(mark => {
            this.ellipseMarkManager?.removeEllipseMark(mark);
        });
        this.triangleMarkManager?.getTriangleMarks().forEach(mark => {
            this.triangleMarkManager?.removeTriangleMark(mark);
        });
        this.sectorMarkManager?.getSectorMarks().forEach(mark => {
            this.sectorMarkManager?.removeSectorMark(mark);
        });
        this.curveMarkManager?.getCurveMarks().forEach(mark => {
            this.curveMarkManager?.removeCurveMark(mark);
        });
        this.doubleCurveMarkManager?.getDoubleCurveMarks().forEach(mark => {
            this.doubleCurveMarkManager?.removeDoubleCurveMark(mark);
        });
    }

    showAllMarks(): void {
        this.rectangleMarkManager?.showAllMarks();
        this.circleMarkManager?.showAllMarks();
        this.ellipseMarkManager?.showAllMarks();
        this.triangleMarkManager?.showAllMarks();
        this.sectorMarkManager?.showAllMarks();
        this.curveMarkManager?.showAllMarks();
        this.doubleCurveMarkManager?.showAllMarks();
    }

    hideAllMarks(): void {
        this.rectangleMarkManager?.hideAllMarks();
        this.circleMarkManager?.hideAllMarks();
        this.ellipseMarkManager?.hideAllMarks();
        this.triangleMarkManager?.hideAllMarks();
        this.sectorMarkManager?.hideAllMarks();
        this.curveMarkManager?.hideAllMarks();
        this.doubleCurveMarkManager?.hideAllMarks();
    }
}