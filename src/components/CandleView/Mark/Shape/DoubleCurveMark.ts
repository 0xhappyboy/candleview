import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class DoubleCurveMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _startTime: number;
    private _startPrice: number;
    private _endTime: number;
    private _endPrice: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'line' | 'mid1' | 'mid2' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.LineSegment;
    private _mid1PixelOffsetX: number = 0;
    private _mid1PixelOffsetY: number = 0;
    private _mid2PixelOffsetX: number = 0;
    private _mid2PixelOffsetY: number = 0;

    constructor(
        startTime: number,
        startPrice: number,
        endTime: number,
        endPrice: number,
        color: string = '#2962FF',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this._endTime = endTime;
        this._endPrice = endPrice;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
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

    updateEndPoint(endTime: number, endPrice: number) {
        this._endTime = endTime;
        this._endPrice = endPrice;
        this.requestUpdate();
    }

    updateStartPoint(startTime: number, startPrice: number) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'line' | 'mid1' | 'mid2' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragLineByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startX === null || startY === null || endX === null || endY === null) return;
        const newStartX = startX + deltaX;
        const newStartY = startY + deltaY;
        const newEndX = endX + deltaX;
        const newEndY = endY + deltaY;
        const newStartTime = timeScale.coordinateToTime(newStartX);
        const newStartPrice = this._series.coordinateToPrice(newStartY);
        const newEndTime = timeScale.coordinateToTime(newEndX);
        const newEndPrice = this._series.coordinateToPrice(newEndY);
        if (newStartTime !== null && !isNaN(newStartPrice) && newEndTime !== null && !isNaN(newEndPrice)) {
            this._startTime = newStartTime;
            this._startPrice = newStartPrice;
            this._endTime = newEndTime;
            this._endPrice = newEndPrice;
            this.requestUpdate();
        }
    }

    dragLine(deltaTime: number, deltaPrice: number) {
        if (isNaN(deltaTime) || isNaN(deltaPrice)) {
            return;
        }
        this._startTime = this._startTime + deltaTime;
        this._endTime = this._endTime + deltaTime;
        this._startPrice = this._startPrice + deltaPrice;
        this._endPrice = this._endPrice + deltaPrice;
        this.requestUpdate();
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | 'mid1' | 'mid2' | null {
        if (!this._chart || !this._series) return null;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startX == null || startY == null || endX == null || endY == null) return null;
        const originalMid1X = startX + (endX - startX) * 1 / 3;
        const originalMid1Y = startY + (endY - startY) * 1 / 3;
        const originalMid2X = startX + (endX - startX) * 2 / 3;
        const originalMid2Y = startY + (endY - startY) * 2 / 3;
        const mid1X = originalMid1X + this._mid1PixelOffsetX;
        const mid1Y = originalMid1Y + this._mid1PixelOffsetY;
        const mid2X = originalMid2X + this._mid2PixelOffsetX;
        const mid2Y = originalMid2Y + this._mid2PixelOffsetY;
        const curveMid1X = this.cubicBezierPoint(startX, mid1X, mid2X, endX, 1 / 3);
        const curveMid1Y = this.cubicBezierPoint(startY, mid1Y, mid2Y, endY, 1 / 3);
        const curveMid2X = this.cubicBezierPoint(startX, mid1X, mid2X, endX, 2 / 3);
        const curveMid2Y = this.cubicBezierPoint(startY, mid1Y, mid2Y, endY, 2 / 3);
        const distToStart = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        if (distToStart <= threshold) {
            return 'start';
        }
        const distToEnd = Math.sqrt(Math.pow(x - endX, 2) + Math.pow(y - endY, 2));
        if (distToEnd <= threshold) {
            return 'end';
        }
        const distToMid1 = Math.sqrt(Math.pow(x - curveMid1X, 2) + Math.pow(y - curveMid1Y, 2));
        if (distToMid1 <= threshold) {
            return 'mid1';
        }
        const distToMid2 = Math.sqrt(Math.pow(x - curveMid2X, 2) + Math.pow(y - curveMid2Y, 2));
        if (distToMid2 <= threshold) {
            return 'mid2';
        }
        return null;
    }

    isPointNearCurve(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startX == null || startY == null || endX == null || endY == null) return false;
        const originalMid1X = startX + (endX - startX) * 1 / 3;
        const originalMid1Y = startY + (endY - startY) * 1 / 3;
        const originalMid2X = startX + (endX - startX) * 2 / 3;
        const originalMid2Y = startY + (endY - startY) * 2 / 3;
        const mid1X = originalMid1X + this._mid1PixelOffsetX;
        const mid1Y = originalMid1Y + this._mid1PixelOffsetY;
        const mid2X = originalMid2X + this._mid2PixelOffsetX;
        const mid2Y = originalMid2Y + this._mid2PixelOffsetY;
        const segments = 50;
        for (let i = 0; i < segments; i++) {
            const t1 = i / segments;
            const t2 = (i + 1) / segments;
            const x1 = this.cubicBezierPoint(startX, mid1X, mid2X, endX, t1);
            const y1 = this.cubicBezierPoint(startY, mid1Y, mid2Y, endY, t1);
            const x2 = this.cubicBezierPoint(startX, mid1X, mid2X, endX, t2);
            const y2 = this.cubicBezierPoint(startY, mid1Y, mid2Y, endY, t2);
            if (this.isPointNearLineSegment(x, y, x1, y1, x2, y2, threshold)) {
                return true;
            }
        }
        return false;
    }

    private cubicBezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
        const mt = 1 - t;
        return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
    }

    private isPointNearLineSegment(x: number, y: number,
        x1: number, y1: number, x2: number, y2: number,
        threshold: number): boolean {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy) <= threshold;
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

    public getMid1PixelOffsetX(): number {
        return this._mid1PixelOffsetX;
    }

    public getMid1PixelOffsetY(): number {
        return this._mid1PixelOffsetY;
    }

    public getMid2PixelOffsetX(): number {
        return this._mid2PixelOffsetX;
    }

    public getMid2PixelOffsetY(): number {
        return this._mid2PixelOffsetY;
    }

    updateMid1Point(pixelOffsetX: number, pixelOffsetY: number) {
        this._mid1PixelOffsetX = pixelOffsetX;
        this._mid1PixelOffsetY = pixelOffsetY;
        this.requestUpdate();
    }

    updateMid2Point(pixelOffsetX: number, pixelOffsetY: number) {
        this._mid2PixelOffsetX = pixelOffsetX;
        this._mid2PixelOffsetY = pixelOffsetY;
        this.requestUpdate();
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
                    if (startX == null || startY == null || endX == null || endY == null) return;
                    const originalMid1X = startX + (endX - startX) * 1 / 3;
                    const originalMid1Y = startY + (endY - startY) * 1 / 3;
                    const originalMid2X = startX + (endX - startX) * 2 / 3;
                    const originalMid2Y = startY + (endY - startY) * 2 / 3;
                    const mid1X = originalMid1X + this._mid1PixelOffsetX;
                    const mid1Y = originalMid1Y + this._mid1PixelOffsetY;
                    const mid2X = originalMid2X + this._mid2PixelOffsetX;
                    const mid2Y = originalMid2Y + this._mid2PixelOffsetY;
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
                    ctx.bezierCurveTo(mid1X, mid1Y, mid2X, mid2Y, endX, endY);
                    ctx.stroke();
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, isActive: boolean = false) => {
                            ctx.save();
                            ctx.fillStyle = this._color;
                            ctx.beginPath();
                            ctx.arc(x, y, 5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(x, y, 3, 0, Math.PI * 2);
                            ctx.fill();
                            if (isActive) {
                                ctx.strokeStyle = this._color;
                                ctx.lineWidth = 1;
                                ctx.setLineDash([]);
                                ctx.beginPath();
                                ctx.arc(x, y, 8, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            ctx.restore();
                        };
                        drawHandle(startX, startY, this._dragPoint === 'start');
                        drawHandle(endX, endY, this._dragPoint === 'end');
                        const curveMid1X = this.cubicBezierPoint(startX, mid1X, mid2X, endX, 1 / 3);
                        const curveMid1Y = this.cubicBezierPoint(startY, mid1Y, mid2Y, endY, 1 / 3);
                        const curveMid2X = this.cubicBezierPoint(startX, mid1X, mid2X, endX, 2 / 3);
                        const curveMid2Y = this.cubicBezierPoint(startY, mid1Y, mid2Y, endY, 2 / 3);
                        drawHandle(curveMid1X, curveMid1Y, this._dragPoint === 'mid1');
                        drawHandle(curveMid2X, curveMid2Y, this._dragPoint === 'mid2');
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getStartTime(): number {
        return this._startTime;
    }

    getStartPrice(): number {
        return this._startPrice;
    }

    getEndTime(): number {
        return this._endTime;
    }

    getEndPrice(): number {
        return this._endPrice;
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
        if (startX == null || startY == null || endX == null || endY == null) return null;
        const originalMid1X = startX + (endX - startX) * 1 / 3;
        const originalMid1Y = startY + (endY - startY) * 1 / 3;
        const originalMid2X = startX + (endX - startX) * 2 / 3;
        const originalMid2Y = startY + (endY - startY) * 2 / 3;
        const mid1X = originalMid1X + this._mid1PixelOffsetX;
        const mid1Y = originalMid1Y + this._mid1PixelOffsetY;
        const mid2X = originalMid2X + this._mid2PixelOffsetX;
        const mid2Y = originalMid2Y + this._mid2PixelOffsetY;
        const samplePoints = [
            { x: startX, y: startY },
            { x: endX, y: endY },
            { x: mid1X, y: mid1Y },
            { x: mid2X, y: mid2Y },
            { x: this.cubicBezierPoint(startX, mid1X, mid2X, endX, 0.25), y: this.cubicBezierPoint(startY, mid1Y, mid2Y, endY, 0.25) },
            { x: this.cubicBezierPoint(startX, mid1X, mid2X, endX, 0.5), y: this.cubicBezierPoint(startY, mid1Y, mid2Y, endY, 0.5) },
            { x: this.cubicBezierPoint(startX, mid1X, mid2X, endX, 0.75), y: this.cubicBezierPoint(startY, mid1Y, mid2Y, endY, 0.75) }
        ];
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        samplePoints.forEach(point => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        });
        return {
            startX, startY, endX, endY,
            minX, maxX, minY, maxY
        };
    }
}