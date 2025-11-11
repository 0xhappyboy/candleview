import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class TriangleABCDMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _points: { time: string; price: number }[] = [];
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isDragging: boolean = false;
    private _dragPoint: number | null = null;
    private _showHandles: boolean = true;
    private markType: MarkType = MarkType.TriangleABCD;
    private _triangleFillColor: string = 'rgba(57, 109, 254, 0.2)';
    private _triangleStrokeColor: string = '#396DFE';
    private _triangleStrokeWidth: number = 1;

    constructor(
        points: { time: string; price: number }[],
        color: string = '#396DFE',
        lineWidth: number = 2
    ) {
        this._points = points;
        this._color = color;
        this._lineWidth = lineWidth;
        this._showHandles = true;
        this._triangleStrokeColor = color;
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

    updatePoint(index: number, time: string, price: number) {
        if (index >= 0 && index < this._points.length) {
            this._points[index] = { time, price };
            this.requestUpdate();
        }
    }

    setDragging(isDragging: boolean, dragPoint: number | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): number | null {
        if (!this._chart || !this._series) return null;
        for (let i = 0; i < this._points.length; i++) {
            const point = this._points[i];
            const pointX = this._chart.timeScale().timeToCoordinate(point.time);
            const pointY = this._series.priceToCoordinate(point.price);
            if (pointX == null || pointY == null) continue;
            const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
            if (distance <= threshold) {
                return i;
            }
        }
        return null;
    }

    private requestUpdate() {
        if (this._chart && this._series) {
            try {
                this._chart.timeScale().applyOptions({});
            } catch (error) {
                console.log(error);
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
        return this._points[0]?.time || '';
    }

    priceValue() {
        return this._points[0]?.price || 0;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const coordinates = this._points.map(point => ({
                        x: this._chart.timeScale().timeToCoordinate(point.time),
                        y: this._series.priceToCoordinate(point.price)
                    }));
                    const validCoordinates = coordinates.filter(coord => coord.x != null && coord.y != null);
                    if (validCoordinates.length < 4) return;
                    ctx.save();
                    const A = validCoordinates[0];
                    const B = validCoordinates[1];
                    const C = validCoordinates[2];
                    const D = validCoordinates[3];
                    const triangleTop = this.calculateTriangleTop(A, D, B, C);
                    ctx.fillStyle = this._triangleFillColor;
                    ctx.beginPath();
                    ctx.moveTo(A.x!, A.y!);
                    ctx.lineTo(D.x!, D.y!);
                    ctx.lineTo(triangleTop.x, triangleTop.y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = this._triangleStrokeColor;
                    ctx.lineWidth = this._triangleStrokeWidth;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(A.x!, A.y!);
                    ctx.lineTo(D.x!, D.y!);
                    ctx.lineTo(triangleTop.x, triangleTop.y);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    ctx.globalAlpha = this._isDragging ? 0.7 : 1.0;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(A.x!, A.y!);
                    ctx.lineTo(B.x!, B.y!);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(B.x!, B.y!);
                    ctx.lineTo(C.x!, C.y!);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(C.x!, C.y!);
                    ctx.lineTo(D.x!, D.y!);
                    ctx.stroke();
                    this.drawLineValue(ctx, A, B, 'AB');
                    this.drawLineValue(ctx, B, C, 'BC');
                    this.drawLineValue(ctx, C, D, 'CD');
                    if (this._showHandles) {
                        const pointLabels = ['A', 'B', 'C', 'D'];
                        validCoordinates.forEach((coord, index) => {
                            if (index >= pointLabels.length) return;
                            ctx.save();
                            ctx.fillStyle = this._color;
                            ctx.beginPath();
                            ctx.arc(coord.x!, coord.y!, 5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(coord.x!, coord.y!, 3, 0, Math.PI * 2);
                            ctx.fill();
                            if (this._dragPoint === index) {
                                ctx.strokeStyle = this._color;
                                ctx.lineWidth = 1;
                                ctx.setLineDash([]);
                                ctx.beginPath();
                                ctx.arc(coord.x!, coord.y!, 8, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            ctx.fillStyle = this._color;
                            ctx.font = '12px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(pointLabels[index], coord.x!, coord.y! - 15);
                            ctx.restore();
                        });
                    }
                    ctx.restore();
                }
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private calculateTriangleTop(A: any, D: any, B: any, C: any): { x: number, y: number } {
        const slope1 = (B.y - A.y) / (B.x - A.x);
        const intercept1 = A.y - slope1 * A.x;
        const slope2 = (C.y - D.y) / (C.x - D.x);
        const intercept2 = D.y - slope2 * D.x;
        if (slope1 === slope2) {
            return { x: (A.x + D.x) / 2, y: Math.min(A.y, B.y, C.y, D.y) - 50 };
        }
        const x = (intercept2 - intercept1) / (slope1 - slope2);
        const y = slope1 * x + intercept1;
        return { x, y };
    }

    private drawLineValue(ctx: any, start: any, end: any, label: string) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const startIndex = this._points.findIndex(p =>
            Math.abs(this._chart.timeScale().timeToCoordinate(p.time) - start.x) < 1 &&
            Math.abs(this._series.priceToCoordinate(p.price) - start.y) < 1
        );
        const endIndex = this._points.findIndex(p =>
            Math.abs(this._chart.timeScale().timeToCoordinate(p.time) - end.x) < 1 &&
            Math.abs(this._series.priceToCoordinate(p.price) - end.y) < 1
        );
        if (startIndex === -1 || endIndex === -1) return;
        const startPrice = this._points[startIndex].price;
        const endPrice = this._points[endIndex].price;
        const priceDiff = endPrice - startPrice;
        const percentDiff = (priceDiff / startPrice) * 100;
        const lineText = `${label}: ${percentDiff.toFixed(2)}%`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = this._color;
        ctx.lineWidth = 1;
        const textMetrics = ctx.measureText(lineText);
        const textWidth = textMetrics.width + 8;
        const textHeight = 16;
        ctx.beginPath();
        ctx.roundRect(midX - textWidth / 2, midY - textHeight / 2, textWidth, textHeight, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = this._color;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lineText, midX, midY);
    }

    getPoints(): { time: string; price: number }[] {
        return [...this._points];
    }

    updateColor(color: string) {
        this._color = color;
        this._triangleStrokeColor = color;
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

    updateTriangleStyle(fillColor?: string, strokeColor?: string, strokeWidth?: number) {
        if (fillColor) this._triangleFillColor = fillColor;
        if (strokeColor) this._triangleStrokeColor = strokeColor;
        if (strokeWidth) this._triangleStrokeWidth = strokeWidth;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        triangleFillColor?: string;
        triangleStrokeColor?: string;
        triangleStrokeWidth?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.triangleFillColor || styles.triangleStrokeColor || styles.triangleStrokeWidth) {
            this.updateTriangleStyle(
                styles.triangleFillColor,
                styles.triangleStrokeColor,
                styles.triangleStrokeWidth
            );
        }
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            triangleFillColor: this._triangleFillColor,
            triangleStrokeColor: this._triangleStrokeColor,
            triangleStrokeWidth: this._triangleStrokeWidth,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const coordinates = this._points.map(point => ({
            x: this._chart.timeScale().timeToCoordinate(point.time),
            y: this._series.priceToCoordinate(point.price)
        }));
        if (coordinates.some(coord => coord.x == null || coord.y == null)) return null;
        const xs = coordinates.map(coord => coord.x!).filter(x => x != null);
        const ys = coordinates.map(coord => coord.y!).filter(y => y != null);
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    }

    isPointNearGraph(x: number, y: number, threshold: number = 10): boolean {
        if (!this._chart || !this._series) return false;
        const coordinates = this._points.map(point => ({
            x: this._chart.timeScale().timeToCoordinate(point.time),
            y: this._series.priceToCoordinate(point.price)
        }));
        const validCoordinates = coordinates.filter(coord => coord.x != null && coord.y != null);
        if (validCoordinates.length < 4) return false;
        const A = validCoordinates[0];
        const B = validCoordinates[1];
        const C = validCoordinates[2];
        const D = validCoordinates[3];
        const triangleTop = this.calculateTriangleTop(A, D, B, C);
        const triangleLines = [
            [A.x!, A.y!, D.x!, D.y!],
            [D.x!, D.y!, triangleTop.x, triangleTop.y],
            [triangleTop.x, triangleTop.y, A.x!, A.y!]
        ];
        for (const [x1, y1, x2, y2] of triangleLines) {
            if (this.isPointNearLine(x, y, x1, y1, x2, y2, threshold)) {
                return true;
            }
        }
        const internalLines = [
            [A.x!, A.y!, B.x!, B.y!],
            [B.x!, B.y!, C.x!, C.y!],
            [C.x!, C.y!, D.x!, D.y!]
        ];
        for (const [x1, y1, x2, y2] of internalLines) {
            if (this.isPointNearLine(x, y, x1, y1, x2, y2, threshold)) {
                return true;
            }
        }
        return false;
    }

    private isPointNearLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number, threshold: number): boolean {
        const A = px - x1;
        const B = py - y1;
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
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy) <= threshold;
    }

    moveAllPoints(deltaTime: number, deltaPrice: number) {
        if (!this._chart || !this._series) return;
        for (let i = 0; i < this._points.length; i++) {
            const point = this._points[i];
            const currentTime = this._chart.timeScale().coordinateToTime(
                this._chart.timeScale().timeToCoordinate(point.time) + deltaTime
            );
            const currentPrice = this._series.priceToCoordinate(
                this._series.coordinateToPrice(point.price) + deltaPrice
            );
            if (currentTime && currentPrice !== null) {
                this._points[i] = {
                    time: currentTime.toString(),
                    price: currentPrice
                };
            }
        }
        this.requestUpdate();
    }
}