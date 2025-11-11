import { MarkType } from "../../../types";
import { IGraph } from "../../IGraph";
import { IGraphStyle } from "../../IGraphStyle";

export class FibonacciRetracementMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _startPrice: number;
    private _endPrice: number;
    private _startTime: string;
    private _endTime: string;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'line' | null = null;
    private _showHandles: boolean = false;
    private _fibonacciLevels: number[] = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 4.236, 6.854];
    private _fibonacciColors: string[] = [
        '#FF4444', '#00A8FF', '#9C27B0', '#4CAF50', '#FF9800', '#795548', '#607D8B',
        '#E91E63', '#3F51B5', '#009688', '#FF5722'
    ];
    private _fillOpacity: number = 0.3; 
    private markType: MarkType = MarkType.FibonacciRetracement;
    private _fibonacciLinePositions: { y: number; level: number; price: number }[] = [];

    constructor(
        startPrice: number,
        endPrice: number,
        startTime: string,
        endTime: string,
        color: string = '#2962FF',
        lineWidth: number = 1,
        isPreview: boolean = false,
        dragSensitivity: number = 2.5
    ) {
        this._startPrice = startPrice;
        this._endPrice = endPrice;
        this._startTime = startTime;
        this._endTime = endTime;
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

    updateEndPoint(endPrice: number, endTime: string) {
        this._endPrice = endPrice;
        this._endTime = endTime;
        this.requestUpdate();
    }

    updateStartPoint(startPrice: number, startTime: string) {
        this._startPrice = startPrice;
        this._startTime = startTime;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'line' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragLineByPixels(deltaY: number, deltaX: number = 0) {
        if (isNaN(deltaY) || isNaN(deltaX)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        if (startY === null || endY === null || startX === null || endX === null) return;
        const newStartY = startY + deltaY;
        const newEndY = endY + deltaY;
        const newStartX = startX + deltaX;
        const newEndX = endX + deltaX;
        const newStartPrice = this._series.coordinateToPrice(newStartY);
        const newEndPrice = this._series.coordinateToPrice(newEndY);
        const newStartTime = timeScale.coordinateToTime(newStartX);
        const newEndTime = timeScale.coordinateToTime(newEndX);
        if (newStartPrice !== null && newEndPrice !== null && newStartTime !== null && newEndTime !== null) {
            this._startPrice = newStartPrice;
            this._endPrice = newEndPrice;
            this._startTime = newStartTime.toString();
            this._endTime = newEndTime.toString();
            this.requestUpdate();
        }
    }

    dragHandleByPixels(deltaY: number, deltaX: number = 0, handleType: 'start' | 'end') {
        if (isNaN(deltaY) || isNaN(deltaX)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        if (handleType === 'start') {
            const startY = this._series.priceToCoordinate(this._startPrice);
            const startX = timeScale.timeToCoordinate(this._startTime);
            if (startY === null || startX === null) return;
            const newStartY = startY + deltaY;
            const newStartX = startX + deltaX;
            const newStartPrice = this._series.coordinateToPrice(newStartY);
            const newStartTime = timeScale.coordinateToTime(newStartX);
            if (newStartPrice !== null && newStartTime !== null) {
                this._startPrice = newStartPrice;
                this._startTime = newStartTime.toString();
                this.requestUpdate();
            }
        } else if (handleType === 'end') {
            const endY = this._series.priceToCoordinate(this._endPrice);
            const endX = timeScale.timeToCoordinate(this._endTime);
            if (endY === null || endX === null) return;
            const newEndY = endY + deltaY;
            const newEndX = endX + deltaX;
            const newEndPrice = this._series.coordinateToPrice(newEndY);
            const newEndTime = timeScale.coordinateToTime(newEndX);
            if (newEndPrice !== null && newEndTime !== null) {
                this._endPrice = newEndPrice;
                this._endTime = newEndTime.toString();
                this.requestUpdate();
            }
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | null {
        if (!this._chart || !this._series) return null;
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        if (startY == null || endY == null || startX == null || endX == null) return null;
        const distToStart = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        const distToEnd = Math.sqrt(Math.pow(x - endX, 2) + Math.pow(y - endY, 2));
        if (distToStart <= threshold) {
            return 'start';
        }
        if (distToEnd <= threshold) {
            return 'end';
        }
        return null;
    }

    isPointNearFibonacciLine(x: number, y: number, threshold: number = 15): number | null {
        if (!this._chart || !this._series) return null;
        const timeScale = this._chart.timeScale();
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        if (startY == null || endY == null || startX == null || endX == null) return null;
        for (let i = 0; i < this._fibonacciLevels.length; i++) {
            const level = this._fibonacciLevels[i];
            const priceDiff = this._endPrice - this._startPrice;
            const fibPrice = this._startPrice + priceDiff * level;
            const fibY = this._series.priceToCoordinate(fibPrice);
            if (fibY === null) continue;
            const distance = Math.abs(y - fibY);
            if (distance <= threshold && x >= Math.min(startX, endX) && x <= Math.max(startX, endX)) {
                return level;
            }
        }
        return null;
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
                    const timeScale = this._chart.timeScale();
                    const startY = this._series.priceToCoordinate(this._startPrice);
                    const endY = this._series.priceToCoordinate(this._endPrice);
                    const startX = timeScale.timeToCoordinate(this._startTime);
                    const endX = timeScale.timeToCoordinate(this._endTime);
                    if (startY == null || endY == null || startX == null || endX == null) return;
                    this._fibonacciLinePositions = [];
                    ctx.save();
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
                    const minX = Math.min(startX, endX);
                    const maxX = Math.max(startX, endX);
                    const priceDiff = this._endPrice - this._startPrice;
                    for (let i = 0; i < this._fibonacciLevels.length - 1; i++) {
                        const currentLevel = this._fibonacciLevels[i];
                        const nextLevel = this._fibonacciLevels[i + 1];
                        const currentPrice = this._startPrice + priceDiff * currentLevel;
                        const nextPrice = this._startPrice + priceDiff * nextLevel;
                        const currentY = this._series.priceToCoordinate(currentPrice);
                        const nextY = this._series.priceToCoordinate(nextPrice);
                        if (currentY === null || nextY === null) continue;
                        ctx.fillStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                        ctx.globalAlpha = this._fillOpacity;
                        ctx.fillRect(minX, Math.min(currentY, nextY), maxX - minX, Math.abs(currentY - nextY));
                    }
                    ctx.globalAlpha = this._isPreview || this._isDragging ? 0.7 : 1.0;
                    this._fibonacciLevels.forEach((level, index) => {
                        const fibPrice = this._startPrice + priceDiff * level;
                        const fibY = this._series.priceToCoordinate(fibPrice);
                        if (fibY === null) return;
                        this._fibonacciLinePositions.push({
                            y: fibY,
                            level: level,
                            price: fibPrice
                        });
                        ctx.strokeStyle = this._fibonacciColors[index % this._fibonacciColors.length];
                        ctx.beginPath();
                        ctx.moveTo(minX, fibY);
                        ctx.lineTo(maxX, fibY);
                        ctx.stroke();
                        ctx.save();
                        ctx.fillStyle = this._fibonacciColors[index % this._fibonacciColors.length];
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(`${(level * 100).toFixed(1)}%`, maxX + 5, fibY);
                        ctx.restore();
                    });
                    ctx.strokeStyle = this._color;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, isActive: boolean = false) => {
                            ctx.save();
                            ctx.fillStyle = this._color;
                            ctx.beginPath();
                            ctx.arc(x, y, 6, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(x, y, 4, 0, Math.PI * 2);
                            ctx.fill();
                            if (isActive) {
                                ctx.strokeStyle = this._color;
                                ctx.lineWidth = 2;
                                ctx.setLineDash([]);
                                ctx.beginPath();
                                ctx.arc(x, y, 8, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            ctx.restore();
                        };
                        drawHandle(startX, startY, this._dragPoint === 'start');
                        drawHandle(endX, endY, this._dragPoint === 'end');
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getStartPrice(): number {
        return this._startPrice;
    }

    getEndPrice(): number {
        return this._endPrice;
    }

    getStartTime(): string {
        return this._startTime;
    }

    getEndTime(): string {
        return this._endTime;
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

    updateFillOpacity(opacity: number) {
        this._fillOpacity = opacity;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        fillOpacity?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.fillOpacity !== undefined) this.updateFillOpacity(styles.fillOpacity);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            fillOpacity: this._fillOpacity,
            fibonacciColors: this._fibonacciColors
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const timeScale = this._chart.timeScale();
        
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        if (startY == null || endY == null || startX == null || endX == null) return null;
        return {
            startX, endX, startY, endY,
            minX: Math.min(startX, endX),
            maxX: Math.max(startX, endX),
            minY: Math.min(startY, endY),
            maxY: Math.max(startY, endY),
            fibonacciLinePositions: this._fibonacciLinePositions
        };
    }

    getFibonacciLevels(): number[] {
        return [...this._fibonacciLevels];
    }

    getFibonacciLinePositions(): { y: number; level: number; price: number }[] {
        return [...this._fibonacciLinePositions];
    }

    getFibonacciColors(): string[] {
        return [...this._fibonacciColors];
    }
}