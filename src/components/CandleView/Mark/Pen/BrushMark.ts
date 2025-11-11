import { MarkType } from "../../types";
import { IGraph } from "../Graph/IGraph";
import { IGraphStyle } from "../Graph/IGraphStyle";

export class BrushMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _points: Array<{ time: string; price: number }> = [];
    private _originalPoints: Array<{ time: string; price: number }> = [];
    private markType: MarkType = MarkType.Brush;
    private _showHandles: boolean = false;
    private _brushPressure: number = 0.5;

    constructor(
        points: Array<{ time: string; price: number }> = [],
        color: string = '#2962FF',
        lineWidth: number = 20,
        isPreview: boolean = false
    ) {
        this._points = [...points];
        this._originalPoints = [...points];
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

    addPoint(time: string, price: number) {
        this._points.push({ time, price });
        this.requestUpdate();
    }

    updatePoints(points: Array<{ time: string; price: number }>) {
        this._points = [...points];
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean) {
        this._isDragging = isDragging;
        if (isDragging) {
            this._originalPoints = [...this._points];
        }
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
                    time: newTime.toString(),
                    price: newPrice
                });
            }
        }
        if (newPoints.length === this._points.length) {
            this._points = newPoints;
            this.requestUpdate();
        }
    }

    isPointNearPath(x: number, y: number, threshold: number = 15): boolean {
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
        return this._points.length > 0 ? this._points[0].time : '';
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
                    if (this._isPreview || this._isDragging) {
                        ctx.globalAlpha = 0.7;
                    } else {
                        ctx.globalAlpha = 1.0;
                    }
                    this.drawBrushStroke(ctx);
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        this.drawControlPoints(ctx);
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private drawBrushStroke(ctx: CanvasRenderingContext2D) {
        if (this._points.length < 2) return;
        ctx.strokeStyle = this._color;
        ctx.lineWidth = this._lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (this._isPreview || this._isDragging) {
            ctx.setLineDash([5, 3]);
        } else {
            switch (this._lineStyle) {
                case 'dashed':
                    ctx.setLineDash([8, 4]);
                    break;
                case 'dotted':
                    ctx.setLineDash([3, 3]);
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


        if (!this._isPreview && !this._isDragging && this._lineStyle === 'solid') {
            ctx.strokeStyle = this.adjustColorBrightness(this._color, 20);
            ctx.lineWidth = Math.max(1, this._lineWidth * 0.5);
            ctx.globalAlpha = 0.6;
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
        }
    }


    private drawControlPoints(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this._color;
        ctx.setLineDash([]);
        for (const point of this._points) {
            const x = this._chart.timeScale().timeToCoordinate(point.time);
            const y = this._series.priceToCoordinate(point.price);
            if (x !== null && y !== null) {
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();


                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }
    }


    private adjustColorBrightness(color: string, percent: number): string {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }


    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        brushPressure?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.brushPressure !== undefined) this._brushPressure = styles.brushPressure;
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            brushPressure: this._brushPressure,
        };
    }

    getPoints(): Array<{ time: string; price: number }> {
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