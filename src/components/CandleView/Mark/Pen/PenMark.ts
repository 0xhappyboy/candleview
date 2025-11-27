import { MarkType } from "../../types";
import { IDeletableMark } from "../IDeletableMark";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class PenMark implements IGraph, IMarkStyle, IDeletableMark {
    private _chart: any;
    private _series: any;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _points: Array<{ time: number; price: number }> = [];
    private markType: MarkType = MarkType.Pen;
    private _showHandles: boolean = false;

    constructor(
        points: Array<{ time: number; price: number }> = [],
        color: string = '#0074D9',
        lineWidth: number = 4,
        isPreview: boolean = false
    ) {
        this._points = [...points];
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

    addPoint(time: number, price: number) {
        this._points.push({ time, price });
        this.requestUpdate();
    }

    updatePoints(points: Array<{ time: number; price: number }>) {
        this._points = [...points];
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean) {
        this._isDragging = isDragging;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const newPoints = [];
        for (const point of this._points) {
            const x = timeScale.timeToCoordinate(point.time);
            const y = this._series.priceToCoordinate(point.price);
            if (x === null || y === null) continue;
            const newX = x + deltaX;
            const newY = y + deltaY;
            const newTime = timeScale.coordinateToTime(newX);
            const newPrice = this._series.coordinateToPrice(newY);
            if (newTime !== null && !isNaN(newPrice)) {
                newPoints.push({
                    time: newTime,
                    price: newPrice
                });
            }
        }
        if (newPoints.length === this._points.length) {
            this._points = newPoints;
            this.requestUpdate();
        }
    }

    isPointNearPath(x: number, y: number, threshold: number = 12): boolean {
        if (!this._chart || !this._series || this._points.length < 2) return false;
        for (let i = 0; i < this._points.length - 1; i++) {
            const startPoint = this._points[i];
            const endPoint = this._points[i + 1];
            const startX = this._chart.timeScale().timeToCoordinate(startPoint.time);
            const startY = this._series.priceToCoordinate(startPoint.price);
            const endX = this._chart.timeScale().timeToCoordinate(endPoint.time);
            const endY = this._series.priceToCoordinate(endPoint.price);
            if (startX == null || startY == null || endX == null || endY == null) continue;
            const A = x - startX;
            const B = y - startY;
            const C = endX - startX;
            const D = endY - startY;
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            if (lenSq !== 0) {
                param = dot / lenSq;
            }
            let xx, yy;
            if (param < 0) {
                xx = startX;
                yy = startY;
            } else if (param > 1) {
                xx = endX;
                yy = endY;
            } else {
                xx = startX + param * C;
                yy = startY + param * D;
            }
            const dx = x - xx;
            const dy = y - yy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= threshold) {
                return true;
            }
        }
        return false;
    }

    private requestUpdate() {
        if (this._chart && this._series) {
            try {
                this._chart.timeScale().applyOptions({});
            } catch (error) {
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
        return this._points.length > 0 ? this._points[0].time : 0;
    }

    priceValue() {
        return this._points.length > 0 ? this._points[0].price : 0;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series || this._points.length < 2) return;
                    ctx.save();
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    if (this._isPreview || this._isDragging) {
                        ctx.globalAlpha = 0.8;
                    } else {
                        ctx.globalAlpha = 1.0;
                    }
                    if (this._isPreview || this._isDragging) {
                        ctx.setLineDash([]);
                        ctx.globalAlpha = 0.9;
                    } else {
                        switch (this._lineStyle) {
                            case 'dashed':
                                ctx.setLineDash([8, 4]);
                                break;
                            case 'dotted':
                                ctx.setLineDash([4, 4]);
                                break;
                            case 'solid':
                            default:
                                ctx.setLineDash([]);
                                break;
                        }
                    }
                    ctx.beginPath();
                    const firstPoint = this._points[0];
                    const firstX = this._chart.timeScale().timeToCoordinate(firstPoint.time);
                    const firstY = this._series.priceToCoordinate(firstPoint.price);
                    if (firstX !== null && firstY !== null) {
                        ctx.moveTo(firstX, firstY);
                        for (let i = 1; i < this._points.length; i++) {
                            const point = this._points[i];
                            const x = this._chart.timeScale().timeToCoordinate(point.time);
                            const y = this._series.priceToCoordinate(point.price);
                            if (x !== null && y !== null) {
                                ctx.lineTo(x, y);
                            }
                        }
                    }
                    ctx.stroke();
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        ctx.fillStyle = this._color;
                        ctx.setLineDash([]);
                        for (const point of this._points) {
                            const x = this._chart.timeScale().timeToCoordinate(point.time);
                            const y = this._series.priceToCoordinate(point.price);
                            if (x !== null && y !== null) {
                                ctx.beginPath();
                                ctx.arc(x, y, 4, 0, Math.PI * 2);
                                ctx.fill();
                                ctx.strokeStyle = 'white';
                                ctx.lineWidth = 1;
                                ctx.stroke();
                            }
                        }
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getPoints(): Array<{ time: number; price: number }> {
        return [...this._points];
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
        if (!this._chart || !this._series || this._points.length === 0) return null;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const point of this._points) {
            const x = this._chart.timeScale().timeToCoordinate(point.time);
            const y = this._series.priceToCoordinate(point.price);
            if (x !== null && y !== null) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
        if (minX === Infinity) return null;
        return {
            minX, maxX, minY, maxY
        };
    }

    clear() {
        this._points = [];
        this.requestUpdate();
    }

    getPointCount(): number {
        return this._points.length;
    }
}