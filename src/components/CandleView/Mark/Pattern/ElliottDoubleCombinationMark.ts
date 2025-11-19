import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class ElliottDoubleCombinationMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _points: { time: number; price: number }[] = [];
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isDragging: boolean = false;
    private _dragPoint: number | null = null;
    private _showHandles: boolean = true;
    private markType: MarkType = MarkType.Elliott_Double_Combination;

    constructor(
        points: { time: number; price: number }[],
        color: string = '#3694FE',
        lineWidth: number = 2
    ) {
        this._points = points;
        this._color = color;
        this._lineWidth = lineWidth;
        this._showHandles = true;
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

    updatePoint(index: number, time: number, price: number) {
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
        return this._points[0]?.time || 0;
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
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    ctx.globalAlpha = this._isDragging ? 0.7 : 1.0;
                    switch (this._lineStyle) {
                        case 'dashed':
                            ctx.setLineDash([5, 3]);
                            break;
                        case 'dotted':
                            ctx.setLineDash([2, 2]);
                            break;
                        default:
                            ctx.setLineDash([]);
                    }
                    ctx.beginPath();
                    ctx.moveTo(validCoordinates[0].x!, validCoordinates[0].y!);
                    for (let i = 1; i < 4; i++) {
                        ctx.lineTo(validCoordinates[i].x!, validCoordinates[i].y!);
                    }
                    ctx.stroke();
                    this.drawFibonacciLevels(ctx, validCoordinates);
                    for (let i = 0; i < 3; i++) {
                        this.drawLineValue(ctx, validCoordinates[i], validCoordinates[i + 1], i, i + 1);
                    }
                    if (this._showHandles) {
                        const pointLabels = ['0', 'W', 'X', 'Y'];
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
                            this.drawPointLabel(ctx, coord, pointLabels[index]);
                            ctx.restore();
                        });
                    }
                    ctx.restore();
                }
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private drawPointLabel(ctx: any, coord: any, label: string) {
        const labelX = coord.x!;
        const labelY = coord.y! - 15;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = this._color;
        ctx.lineWidth = 1;
        const textMetrics = ctx.measureText(label);
        const textWidth = textMetrics.width + 8;
        const textHeight = 16;
        ctx.beginPath();
        ctx.roundRect(labelX - textWidth / 2, labelY - textHeight / 2, textWidth, textHeight, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = this._color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, labelX, labelY);
        ctx.restore();
    }

    private drawFibonacciLevels(ctx: any, coordinates: any[]) {
        if (coordinates.length < 4) return;
        ctx.save();
        ctx.strokeStyle = this._color;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.globalAlpha = 0.8;
        for (let i = 1; i < coordinates.length; i++) {
            ctx.beginPath();
            ctx.moveTo(coordinates[0].x!, coordinates[i].y!);
            ctx.lineTo(coordinates[i].x!, coordinates[i].y!);
            ctx.stroke();
            const priceText = this._points[i].price.toFixed(4);
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
            ctx.strokeStyle = this._color;
            ctx.lineWidth = 2;
            const textMetrics = ctx.measureText(priceText);
            const textWidth = textMetrics.width + 12;
            const textHeight = 18;
            ctx.beginPath();
            ctx.roundRect(coordinates[0].x! + 5, coordinates[i].y! - textHeight / 2, textWidth, textHeight, 4);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = this._color;
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(priceText, coordinates[0].x! + 11, coordinates[i].y!);
            ctx.restore();
        }
        ctx.restore();
    }

    private drawLineValue(ctx: any, start: any, end: any, startIdx: number, endIdx: number) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const startPrice = this._points[startIdx].price;
        const endPrice = this._points[endIdx].price;
        const priceDiff = endPrice - startPrice;
        const percentDiff = (priceDiff / startPrice) * 100;
        const waveLabels = ['0-W', 'W-X', 'X-Y'];
        const waveLabel = waveLabels[startIdx] || '';
        const lineText = `${waveLabel}: ${percentDiff.toFixed(2)}%`;
        ctx.save();
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
        ctx.restore();
    }

    getPoints(): { time: number; price: number }[] {
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
        for (let i = 0; i < 3; i++) {
            const start = validCoordinates[i];
            const end = validCoordinates[i + 1];
            if (this.isPointNearLine(x, y, start.x!, start.y!, end.x!, end.y!, threshold)) {
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
                    time: currentTime as number,
                    price: currentPrice
                };
            }
        }
        this.requestUpdate();
    }
}