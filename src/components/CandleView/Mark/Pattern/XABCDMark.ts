import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class XABCDMark implements IGraph, IMarkStyle {
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
    private markType: MarkType = MarkType.XABCD;

    constructor(
        points: { time: number; price: number }[],
        color: string = '#FF6B6B',
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
                    if (validCoordinates.length < 2) return;
                    ctx.save();
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    ctx.globalAlpha = this._isDragging ? 0.7 : 1.0;
                    if (validCoordinates.length >= 5) {
                        ctx.setLineDash([5, 3]);
                        ctx.strokeStyle = this._color;
                        const dashedConnections = [
                            [0, 2],
                            [1, 3],
                            [4, 2],
                            [0, 4]
                        ];
                        dashedConnections.forEach(([startIdx, endIdx]) => {
                            if (startIdx < validCoordinates.length && endIdx < validCoordinates.length) {
                                ctx.beginPath();
                                ctx.moveTo(validCoordinates[startIdx].x!, validCoordinates[startIdx].y!);
                                ctx.lineTo(validCoordinates[endIdx].x!, validCoordinates[endIdx].y!);
                                ctx.stroke();
                                this.drawLineValue(ctx, validCoordinates[startIdx], validCoordinates[endIdx], startIdx, endIdx);
                            }
                        });
                        ctx.setLineDash([]);
                    }
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
                    ctx.beginPath();
                    for (let i = 0; i < validCoordinates.length - 1; i++) {
                        ctx.moveTo(validCoordinates[i].x!, validCoordinates[i].y!);
                        ctx.lineTo(validCoordinates[i + 1].x!, validCoordinates[i + 1].y!);
                    }
                    ctx.stroke();
                    if (validCoordinates.length >= 3) {
                        if (validCoordinates.length >= 5) {
                            ctx.strokeStyle = this._color;
                            ctx.beginPath();
                            for (let i = 0; i < validCoordinates.length; i++) {
                                if (i === 0) {
                                    ctx.moveTo(validCoordinates[i].x!, validCoordinates[i].y!);
                                } else {
                                    ctx.lineTo(validCoordinates[i].x!, validCoordinates[i].y!);
                                }
                            }
                            ctx.stroke();
                            ctx.fillStyle = '#FFE0A530';
                            ctx.beginPath();
                            ctx.moveTo(validCoordinates[0].x!, validCoordinates[0].y!);
                            ctx.lineTo(validCoordinates[1].x!, validCoordinates[1].y!);
                            ctx.lineTo(validCoordinates[2].x!, validCoordinates[2].y!);
                            ctx.closePath();
                            ctx.fill();
                            ctx.fillStyle = '#FFE0A520';
                            ctx.beginPath();
                            ctx.moveTo(validCoordinates[2].x!, validCoordinates[2].y!);
                            ctx.lineTo(validCoordinates[3].x!, validCoordinates[3].y!);
                            ctx.lineTo(validCoordinates[4].x!, validCoordinates[4].y!);
                            ctx.closePath();
                            ctx.fill();
                        } else {
                            ctx.fillStyle = '#FFF0D920';
                            ctx.beginPath();
                            ctx.moveTo(validCoordinates[0].x!, validCoordinates[0].y!);
                            ctx.lineTo(validCoordinates[1].x!, validCoordinates[1].y!);
                            ctx.lineTo(validCoordinates[2].x!, validCoordinates[2].y!);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                    if (this._showHandles) {
                        const pointLabels = ['X', 'A', 'B', 'C', 'D'];
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

    private drawLineValue(ctx: any, start: any, end: any, startIdx: number, endIdx: number) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const startPrice = this._points[startIdx].price;
        const endPrice = this._points[endIdx].price;
        const priceDiff = endPrice - startPrice;
        const percentDiff = (priceDiff / startPrice) * 100;
        let lineText = '';
        const lineTypes = [
            { indices: [0, 4], name: 'XD' },
            { indices: [4, 2], name: 'BD' },
            { indices: [0, 2], name: 'XB' },
            { indices: [1, 3], name: 'AC' }
        ];
        const lineType = lineTypes.find(type =>
            (type.indices[0] === startIdx && type.indices[1] === endIdx) ||
            (type.indices[0] === endIdx && type.indices[1] === startIdx)
        );
        if (lineType) {
            lineText = `${lineType.name}: ${percentDiff.toFixed(2)}%`;
        } else {
            lineText = `${percentDiff.toFixed(2)}%`;
        }
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
        if (validCoordinates.length < 2) return false;
        for (let i = 0; i < validCoordinates.length - 1; i++) {
            const start = validCoordinates[i];
            const end = validCoordinates[i + 1];

            if (this.isPointNearLine(x, y, start.x!, start.y!, end.x!, end.y!, threshold)) {
                return true;
            }
        }
        if (validCoordinates.length >= 3) {
            if (this.isPointInTriangle(x, y,
                validCoordinates[0].x!, validCoordinates[0].y!,
                validCoordinates[1].x!, validCoordinates[1].y!,
                validCoordinates[2].x!, validCoordinates[2].y!
            )) {
                return true;
            }
            if (validCoordinates.length >= 5) {
                if (this.isPointInTriangle(x, y,
                    validCoordinates[2].x!, validCoordinates[2].y!,
                    validCoordinates[3].x!, validCoordinates[3].y!,
                    validCoordinates[4].x!, validCoordinates[4].y!
                )) {
                    return true;
                }
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

    private isPointInTriangle(px: number, py: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): boolean {
        const area = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);
        const s = ((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py)) / area;
        const t = ((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py)) / area;
        return s >= 0 && t >= 0 && s + t <= 1;
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
                    time: currentTime,
                    price: currentPrice
                };
            }
        }
        this.requestUpdate();
    }
}