import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class MockKLineMark implements IGraph, IMarkStyle {
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
    private _dragPoint: 'start' | 'end' | 'line' | null = null;
    private _showHandles: boolean = false;
    private _candleCount: number = 10;
    private _candleWidth: number = 6;
    private markType: MarkType = MarkType.MockKLine;

    private _cachedCandles: Array<{
        bodyHeight: number;
        shadowLength: number;
        isUp: boolean;
    }> = [];

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

    private _generateCachedCandles() {
        this._cachedCandles = [];
        if (this._chart && this._series) {
            const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
            const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
            if (startX !== null && endX !== null) {
                const segmentWidth = Math.abs(endX - startX);
                this._candleCount = Math.max(15, Math.floor(segmentWidth / 3.5));
            }
        }
        this._candleCount = Math.max(this._candleCount, 15);
        for (let i = 0; i < this._candleCount; i++) {
            this._cachedCandles.push({
                bodyHeight: 8 + Math.random() * 12,
                shadowLength: 4 + Math.random() * 8,
                isUp: Math.random() > 0.5
            });
        }
    }

    getMarkType(): MarkType {
        return this.markType;
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this._generateCachedCandles();
        this.requestUpdate();
    }

    updateAllViews() { }

    updateEndPoint(endTime: number, endPrice: number) {
        this._endTime = endTime;
        this._endPrice = endPrice;
        this._generateCachedCandles(); 
        this.requestUpdate();
    }

    updateStartPoint(startTime: number, startPrice: number) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this._generateCachedCandles(); 
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
            this._generateCachedCandles(); 
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

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | null {
        if (!this._chart || !this._series) return null;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startX == null || startY == null || endX == null || endY == null) return null;
        const distToStart = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        if (distToStart <= threshold) {
            return 'start';
        }
        const distToEnd = Math.sqrt(Math.pow(x - endX, 2) + Math.pow(y - endY, 2));
        if (distToEnd <= threshold) {
            return 'end';
        }
        return null;
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
                    if (startX == null || startY == null || endX == null || endY == null) return;
                    ctx.save();
                    if (this._isPreview) {
                        ctx.strokeStyle = this._color;
                        ctx.lineWidth = this._lineWidth;
                        ctx.lineCap = 'round';
                        ctx.globalAlpha = 0.7;
                        ctx.setLineDash([5, 3]);
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        ctx.stroke();
                    }
                    if (!this._isPreview) {
                        const totalSegmentWidth = Math.abs(endX - startX);
                        const actualCandleWidth = Math.max(2, totalSegmentWidth / this._candleCount * 0.8);
                        for (let i = 0; i < this._candleCount; i++) {
                            if (i >= this._cachedCandles.length) {
                                break;
                            }
                            const progress = i / (this._candleCount - 1);
                            const candleX = startX + (endX - startX) * progress;
                            const baseY = startY + (endY - startY) * progress;
                            const candleData = this._cachedCandles[i];
                            if (!candleData) {
                                continue;
                            }
                            const bodyHeight = candleData.bodyHeight;
                            const shadowLength = candleData.shadowLength;
                            const isUp = candleData.isUp;
                            let openY, closeY, highY, lowY;
                            if (isUp) {
                                closeY = baseY - bodyHeight / 2;
                                openY = baseY + bodyHeight / 2;
                                highY = closeY - shadowLength;
                                lowY = openY + shadowLength;
                            } else {
                                openY = baseY - bodyHeight / 2;
                                closeY = baseY + bodyHeight / 2;
                                highY = openY - shadowLength;
                                lowY = closeY + shadowLength;
                            }
                            ctx.fillStyle = isUp ? '#26a69a' : '#ef5350';
                            ctx.strokeStyle = isUp ? '#26a69a' : '#ef5350';
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(candleX, highY);
                            ctx.lineTo(candleX, lowY);
                            ctx.stroke();
                            const bodyTop = Math.min(openY, closeY);
                            const bodyBottom = Math.max(openY, closeY);
                            const actualBodyHeight = bodyBottom - bodyTop;
                            ctx.fillRect(
                                candleX - actualCandleWidth / 2,
                                bodyTop,
                                actualCandleWidth,
                                actualBodyHeight
                            );
                        }
                    }
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

    updateCandleCount(count: number) {
        this._candleCount = count;
        this.requestUpdate();
    }

    updateCandleWidth(width: number) {
        this._candleWidth = width;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        candleCount?: number;
        candleWidth?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.candleCount) this.updateCandleCount(styles.candleCount);
        if (styles.candleWidth) this.updateCandleWidth(styles.candleWidth);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            candleCount: this._candleCount,
            candleWidth: this._candleWidth,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;

        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);

        if (startX == null || startY == null || endX == null || endY == null) return null;

        return {
            startX, startY, endX, endY,
            minX: Math.min(startX, endX),
            maxX: Math.max(startX, endX),
            minY: Math.min(startY, endY),
            maxY: Math.max(startY, endY)
        };
    }
}