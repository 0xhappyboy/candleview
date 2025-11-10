import { MarkType } from "../../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class CurveMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _startTime: string;
    private _startPrice: number;
    private _endTime: string;
    private _endPrice: number;
    private _controlTime: string;
    private _controlPrice: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'control' | 'curve' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.Curve;

    constructor(
        startTime: string,
        startPrice: number,
        endTime: string,
        endPrice: number,
        controlTime: string,
        controlPrice: number,
        color: string = '#2962FF',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {

        this._startTime = this.formatTime(startTime);
        this._startPrice = startPrice;
        this._endTime = this.formatTime(endTime);
        this._endPrice = endPrice;
        this._controlTime = this.formatTime(controlTime);
        this._controlPrice = controlPrice;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
    }


    private formatTime(time: any): string {
        if (time === null || time === undefined) {
            return new Date().toISOString().split('T')[0];
        }
        if (typeof time === 'number') {
            const date = new Date(time * 1000);
            return date.toISOString().split('T')[0];
        } else if (typeof time === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(time)) {
                return time;
            } else if (/^\d+$/.test(time)) {
                const date = new Date(parseInt(time) * 1000);
                return date.toISOString().split('T')[0];
            } else {
                try {
                    const date = new Date(time);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                } catch (e) {
                    console.warn('Invalid time format:', time);
                }
            }
        }
        return new Date().toISOString().split('T')[0];
    }

    getMarkType(): MarkType {
        return this.markType;
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this.requestUpdate();
    }

    updateAllViews() { }

    updateStartPoint(startTime: string, startPrice: number) {
        this._startTime = this.formatTime(startTime);
        this._startPrice = startPrice;
        this.requestUpdate();
    }

    updateEndPoint(endTime: string, endPrice: number) {
        this._endTime = this.formatTime(endTime);
        this._endPrice = endPrice;
        this.requestUpdate();
    }

    updateControlPoint(controlTime: string, controlPrice: number) {
        this._controlTime = this.formatTime(controlTime);
        this._controlPrice = controlPrice;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'control' | 'curve' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragCurveByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        if (startX === null || startY === null) return;
        const newStartX = startX + deltaX;
        const newStartY = startY + deltaY;
        const newStartTime = timeScale.coordinateToTime(newStartX);
        const newStartPrice = this._series.coordinateToPrice(newStartY);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (endX === null || endY === null) return;
        const newEndX = endX + deltaX;
        const newEndY = endY + deltaY;
        const newEndTime = timeScale.coordinateToTime(newEndX);
        const newEndPrice = this._series.coordinateToPrice(newEndY);
        const controlX = timeScale.timeToCoordinate(this._controlTime);
        const controlY = this._series.priceToCoordinate(this._controlPrice);
        if (controlX === null || controlY === null) return;
        const newControlX = controlX + deltaX;
        const newControlY = controlY + deltaY;
        const newControlTime = timeScale.coordinateToTime(newControlX);
        const newControlPrice = this._series.coordinateToPrice(newControlY);
        if (newStartTime !== null && !isNaN(newStartPrice) &&
            newEndTime !== null && !isNaN(newEndPrice) &&
            newControlTime !== null && !isNaN(newControlPrice)) {
            this._startTime = this.formatTime(newStartTime);
            this._startPrice = newStartPrice;
            this._endTime = this.formatTime(newEndTime);
            this._endPrice = newEndPrice;
            this._controlTime = this.formatTime(newControlTime);
            this._controlPrice = newControlPrice;
            this.requestUpdate();
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | 'control' | null {
        if (!this._chart || !this._series) return null;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const controlX = this._chart.timeScale().timeToCoordinate(this._controlTime);
        const controlY = this._series.priceToCoordinate(this._controlPrice);
        if (startX == null || startY == null || endX == null || endY == null || controlX == null || controlY == null) return null;
        const distToStart = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        if (distToStart <= threshold) {
            return 'start';
        }
        const distToEnd = Math.sqrt(Math.pow(x - endX, 2) + Math.pow(y - endY, 2));
        if (distToEnd <= threshold) {
            return 'end';
        }
        const distToControl = Math.sqrt(Math.pow(x - controlX, 2) + Math.pow(y - controlY, 2));
        if (distToControl <= threshold) {
            return 'control';
        }
        return null;
    }

    isPointNearCurve(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const controlX = this._chart.timeScale().timeToCoordinate(this._controlTime);
        const controlY = this._series.priceToCoordinate(this._controlPrice);
        if (startX == null || startY == null || endX == null || endY == null || controlX == null || controlY == null) return false;
        return this.isPointNearQuadraticBezier(x, y, startX, startY, controlX, controlY, endX, endY, threshold);
    }

    private isPointNearQuadraticBezier(x: number, y: number,
        startX: number, startY: number,
        controlX: number, controlY: number,
        endX: number, endY: number,
        threshold: number): boolean {
        const steps = 20;
        let minDistance = Infinity;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const curveX = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;
            const curveY = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;
            const distance = Math.sqrt(Math.pow(x - curveX, 2) + Math.pow(y - curveY, 2));
            minDistance = Math.min(minDistance, distance);
            if (minDistance <= threshold) {
                return true;
            }
        }
        return minDistance <= threshold;
    }

    private requestUpdate() {
        if (this._chart && this._series) {
            try {
                this._chart.timeScale().applyOptions({});
            } catch (error) {
                console.log('Apply options method not available');
            }
            if (this._series._internal__dataChanged) {
                this._series._internal__dataChanged();
            }
            if (this._chart._internal__paneUpdate) {
                this._chart._internal__paneUpdate();
            }
        }
    }

    time() {
        return this._startTime;
    }

    priceValue() {
        return this._startPrice;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
                    const startY = this._series.priceToCoordinate(this._startPrice);
                    const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
                    const endY = this._series.priceToCoordinate(this._endPrice);
                    const controlX = this._chart.timeScale().timeToCoordinate(this._controlTime);
                    const controlY = this._series.priceToCoordinate(this._controlPrice);
                    if (startX == null || startY == null || endX == null || endY == null || controlX == null || controlY == null) return;
                    ctx.save();
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    if (this._isPreview || this._isDragging) {
                        ctx.globalAlpha = 0.7;
                    } else {
                        ctx.globalAlpha = 1.0;
                    }
                    if (this._isPreview || this._isDragging) {
                        ctx.setLineDash([5, 3]);
                    } else {
                        switch (this._lineStyle) {
                            case 'dashed':
                                ctx.setLineDash([5, 3]);
                                break;
                            case 'dotted':
                                ctx.setLineDash([2, 2]);
                                break;
                            case 'solid':
                            default:
                                ctx.setLineDash([]);
                                break;
                        }
                    }
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
                    ctx.stroke();
                    if (this._showHandles || this._isDragging) {
                        ctx.save();
                        ctx.setLineDash([2, 2]);
                        ctx.strokeStyle = this._color;
                        ctx.globalAlpha = 0.5;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(controlX, controlY);
                        ctx.lineTo(endX, endY);
                        ctx.stroke();
                        ctx.restore();
                    }
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, isActive: boolean = false, isControl: boolean = false) => {
                            ctx.save();
                            ctx.fillStyle = isControl ? '#FF6B6B' : this._color;
                            ctx.beginPath();
                            ctx.arc(x, y, isControl ? 6 : 5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(x, y, isControl ? 4 : 3, 0, Math.PI * 2);
                            ctx.fill();
                            if (isActive) {
                                ctx.strokeStyle = isControl ? '#FF6B6B' : this._color;
                                ctx.lineWidth = 1;
                                ctx.setLineDash([]);
                                ctx.beginPath();
                                ctx.arc(x, y, isControl ? 10 : 8, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            ctx.restore();
                        };
                        drawHandle(startX, startY, this._dragPoint === 'start', false);
                        drawHandle(endX, endY, this._dragPoint === 'end', false);
                        drawHandle(controlX, controlY, this._dragPoint === 'control', true);
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getStartTime(): string {
        return this._startTime;
    }

    getStartPrice(): number {
        return this._startPrice;
    }

    getEndTime(): string {
        return this._endTime;
    }

    getEndPrice(): number {
        return this._endPrice;
    }

    getControlTime(): string {
        return this._controlTime;
    }

    getControlPrice(): number {
        return this._controlPrice;
    }

    updateColor(color: string) {
        this._color = color;
        this.requestUpdate();
    }

    updateLineWidth(lineWidth: number) {
        this._lineWidth = lineWidth;
        this.requestUpdate();
    }

    updateLineStyle(lineStyle: "solid" | "dashed" | "dotted"): void {
        this._lineStyle = lineStyle;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const controlX = this._chart.timeScale().timeToCoordinate(this._controlTime);
        const controlY = this._series.priceToCoordinate(this._controlPrice);
        if (startX == null || startY == null || endX == null || endY == null || controlX == null || controlY == null) return null;
        const minX = Math.min(startX, endX, controlX);
        const maxX = Math.max(startX, endX, controlX);
        const minY = Math.min(startY, endY, controlY);
        const maxY = Math.max(startY, endY, controlY);
        return {
            startX, startY,
            endX, endY,
            controlX, controlY,
            minX, maxX, minY, maxY
        };
    }
}