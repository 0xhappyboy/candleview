import { MarkType } from "../../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class FibonacciExtensionMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _startPrice: number;
    private _endPrice: number;
    private _extensionPrice: number;
    private _startTime: string;
    private _endTime: string;
    private _extensionTime: string;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'extension' | 'line' | null = null;
    private _showHandles: boolean = false;
    private _fibonacciLevels: number[] = [0, 0.382, 0.618, 1, 1.382, 1.618, 2, 2.618, 3.618, 4.618];
    private _fibonacciColors: string[] = [
        '#FF4444', '#00A8FF', '#9C27B0', '#4CAF50', '#FF9800', '#795548', '#607D8B',
        '#E91E63', '#3F51B5', '#009688', '#FF5722'
    ];
    private _fillOpacity: number = 0.3;
    private markType: MarkType = MarkType.FibonacciExtension;
    private _fibonacciLinePositions: { y: number; level: number; price: number }[] = [];
    private _dragSensitivity: number = 0;

    constructor(
        startPrice: number,
        endPrice: number,
        extensionPrice: number,
        startTime: string,
        endTime: string,
        extensionTime: string,
        color: string = '#2962FF',
        lineWidth: number = 1,
        isPreview: boolean = false,
        dragSensitivity: number = 1.5
    ) {
        this._startPrice = startPrice;
        this._endPrice = endPrice;
        this._extensionPrice = extensionPrice;
        this._startTime = startTime;
        this._endTime = endTime;
        this._extensionTime = extensionTime;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._dragSensitivity = dragSensitivity;
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

    updateExtensionPoint(extensionPrice: number, extensionTime: string) {
        this._extensionPrice = extensionPrice;
        this._extensionTime = extensionTime;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'extension' | 'line' | null = null) {
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
        const adjustedDeltaY = deltaY * this._dragSensitivity;
        const adjustedDeltaX = deltaX * this._dragSensitivity;
        const timeScale = this._chart.timeScale();
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const extensionY = this._series.priceToCoordinate(this._extensionPrice);
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const extensionX = timeScale.timeToCoordinate(this._extensionTime);
        if (startY === null || endY === null || extensionY === null ||
            startX === null || endX === null || extensionX === null) return;
        const newStartY = startY + adjustedDeltaY;
        const newEndY = endY + adjustedDeltaY;
        const newExtensionY = extensionY + adjustedDeltaY;
        const newStartX = startX + adjustedDeltaX;
        const newEndX = endX + adjustedDeltaX;
        const newExtensionX = extensionX + adjustedDeltaX;
        const newStartPrice = this._series.coordinateToPrice(newStartY);
        const newEndPrice = this._series.coordinateToPrice(newEndY);
        const newExtensionPrice = this._series.coordinateToPrice(newExtensionY);
        const newStartTime = timeScale.coordinateToTime(newStartX);
        const newEndTime = timeScale.coordinateToTime(newEndX);
        const newExtensionTime = timeScale.coordinateToTime(newExtensionX);
        if (newStartPrice !== null && newEndPrice !== null && newExtensionPrice !== null &&
            newStartTime !== null && newEndTime !== null && newExtensionTime !== null) {
            this._startPrice = newStartPrice;
            this._endPrice = newEndPrice;
            this._extensionPrice = newExtensionPrice;
            this._startTime = newStartTime.toString();
            this._endTime = newEndTime.toString();
            this._extensionTime = newExtensionTime.toString();
            this.requestUpdate();
        }
    }

    dragHandleByPixels(deltaY: number, deltaX: number = 0, handleType: 'start' | 'end' | 'extension') {
        if (isNaN(deltaY) || isNaN(deltaX)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const adjustedDeltaY = deltaY * this._dragSensitivity;
        const adjustedDeltaX = deltaX * this._dragSensitivity;
        const timeScale = this._chart.timeScale();
        if (handleType === 'start') {
            const startY = this._series.priceToCoordinate(this._startPrice);
            const startX = timeScale.timeToCoordinate(this._startTime);
            if (startY === null || startX === null) return;
            const newStartY = startY + adjustedDeltaY;
            const newStartX = startX + adjustedDeltaX;
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
            const newEndY = endY + adjustedDeltaY;
            const newEndX = endX + adjustedDeltaX;
            const newEndPrice = this._series.coordinateToPrice(newEndY);
            const newEndTime = timeScale.coordinateToTime(newEndX);
            if (newEndPrice !== null && newEndTime !== null) {
                this._endPrice = newEndPrice;
                this._endTime = newEndTime.toString();
                this.requestUpdate();
            }
        } else if (handleType === 'extension') {
            const extensionY = this._series.priceToCoordinate(this._extensionPrice);
            const extensionX = timeScale.timeToCoordinate(this._extensionTime);
            if (extensionY === null || extensionX === null) return;
            const newExtensionY = extensionY + adjustedDeltaY;
            const newExtensionX = extensionX + adjustedDeltaX;
            const newExtensionPrice = this._series.coordinateToPrice(newExtensionY);
            const newExtensionTime = timeScale.coordinateToTime(newExtensionX);
            if (newExtensionPrice !== null && newExtensionTime !== null) {
                this._extensionPrice = newExtensionPrice;
                this._extensionTime = newExtensionTime.toString();
                this.requestUpdate();
                setTimeout(() => {
                    this.adjustChartPriceRangeForExtension();
                }, 0);
            }
        }
    }

    public adjustChartPriceRangeForExtension(): void {
        if (!this._chart || !this._series) return;
        try {
            const timeScale = this._chart.timeScale();
            const extensionPrice = this._extensionPrice;
            const endPrice = this._endPrice;
            const startPrice = this._startPrice;
            const priceDiff = this._endPrice - this._startPrice;
            const fibPrices = this._fibonacciLevels.map(level => this._endPrice + priceDiff * level);
            const allPrices = [startPrice, endPrice, extensionPrice, ...fibPrices];
            const minPrice = Math.min(...allPrices);
            const maxPrice = Math.max(...allPrices);
            const visibleRange = timeScale.getVisibleLogicalRange();
            if (!visibleRange) return;
            const data = this._series.data();
            if (!data || data.length === 0) return;
            let seriesMin = Number.MAX_VALUE;
            let seriesMax = Number.MIN_VALUE;
            data.forEach((item: any) => {
                if (item.low !== undefined && item.low < seriesMin) seriesMin = item.low;
                if (item.high !== undefined && item.high > seriesMax) seriesMax = item.high;
            });
            if (seriesMin > seriesMax) {
                seriesMin = Math.min(...allPrices);
                seriesMax = Math.max(...allPrices);
            }
            const overallMin = Math.min(seriesMin, minPrice);
            const overallMax = Math.max(seriesMax, maxPrice);
            const margin = (overallMax - overallMin) * 0.15;
            const newMinPrice = overallMin - margin;
            const newMaxPrice = overallMax + margin;
            this._chart.applyOptions({
                priceScale: {
                    minValue: newMinPrice,
                    maxValue: newMaxPrice
                }
            });
        } catch (error) {
            console.error('Error adjusting chart price range for extension:', error);
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | 'extension' | null {
        if (!this._chart || !this._series) return null;
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const extensionY = this._series.priceToCoordinate(this._extensionPrice);
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const extensionX = timeScale.timeToCoordinate(this._extensionTime);
        if (startY == null || endY == null || extensionY == null ||
            startX == null || endX == null || extensionX == null) return null;
        const distToStart = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        const distToEnd = Math.sqrt(Math.pow(x - endX, 2) + Math.pow(y - endY, 2));
        const distToExtension = Math.sqrt(Math.pow(x - extensionX, 2) + Math.pow(y - extensionY, 2));
        if (distToStart <= threshold) {
            return 'start';
        }
        if (distToEnd <= threshold) {
            return 'end';
        }
        if (distToExtension <= threshold) {
            return 'extension';
        }
        return null;
    }

    isPointNearFibonacciLine(x: number, y: number, threshold: number = 15): number | null {
        if (!this._chart || !this._series) return null;
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const extensionX = timeScale.timeToCoordinate(this._extensionTime);
        if (startX == null || endX == null || extensionX == null) return null;
        const minX = Math.min(endX, extensionX);
        const maxX = Math.max(endX, extensionX);
        const priceDiff = this._endPrice - this._startPrice;
        for (let i = 0; i < this._fibonacciLevels.length; i++) {
            const level = this._fibonacciLevels[i];
            const fibPrice = this._endPrice + priceDiff * level;
            const fibY = this._series.priceToCoordinate(fibPrice);
            if (fibY === null) continue;
            const distance = Math.abs(y - fibY);
            if (distance <= threshold && x >= minX && x <= maxX) {
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
                    const extensionY = this._series.priceToCoordinate(this._extensionPrice);
                    const startX = timeScale.timeToCoordinate(this._startTime);
                    const endX = timeScale.timeToCoordinate(this._endTime);
                    const extensionX = timeScale.timeToCoordinate(this._extensionTime);
                    if (startY == null || endY == null || extensionY == null ||
                        startX == null || endX == null || extensionX == null) return;
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
                    ctx.strokeStyle = this._color;
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(endX, endY);
                    ctx.lineTo(extensionX, extensionY);
                    ctx.stroke();
                    const priceDiff = this._endPrice - this._startPrice;
                    const extensionMinX = Math.min(endX, extensionX);
                    const extensionMaxX = Math.max(endX, extensionX);
                    this._fibonacciLevels.forEach((level, index) => {
                        const fibPrice = this._endPrice + priceDiff * level;
                        const fibY = this._series.priceToCoordinate(fibPrice);
                        if (fibY === null) return;
                        this._fibonacciLinePositions.push({
                            y: fibY,
                            level: level,
                            price: fibPrice
                        });
                        ctx.strokeStyle = this._fibonacciColors[index % this._fibonacciColors.length];
                        ctx.beginPath();
                        ctx.moveTo(extensionMinX, fibY);
                        ctx.lineTo(extensionMaxX, fibY);
                        ctx.stroke();
                        ctx.save();
                        ctx.fillStyle = this._fibonacciColors[index % this._fibonacciColors.length];
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(`${(level * 100).toFixed(1)}%`, extensionMaxX + 5, fibY);
                        ctx.restore();
                        if (index < this._fibonacciLevels.length - 1) {
                            const nextLevel = this._fibonacciLevels[index + 1];
                            const nextFibPrice = this._endPrice + priceDiff * nextLevel;
                            const nextFibY = this._series.priceToCoordinate(nextFibPrice);
                            if (nextFibY !== null) {
                                ctx.fillStyle = this._fibonacciColors[index % this._fibonacciColors.length];
                                ctx.globalAlpha = this._fillOpacity;
                                ctx.fillRect(
                                    extensionMinX,
                                    Math.min(fibY, nextFibY),
                                    extensionMaxX - extensionMinX,
                                    Math.abs(fibY - nextFibY)
                                );
                                ctx.globalAlpha = this._isPreview || this._isDragging ? 0.7 : 1.0;
                            }
                        }
                    });
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
                        drawHandle(extensionX, extensionY, this._dragPoint === 'extension');
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

    getExtensionPrice(): number {
        return this._extensionPrice;
    }

    getStartTime(): string {
        return this._startTime;
    }

    getEndTime(): string {
        return this._endTime;
    }

    getExtensionTime(): string {
        return this._extensionTime;
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
        const extensionY = this._series.priceToCoordinate(this._extensionPrice);
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const extensionX = timeScale.timeToCoordinate(this._extensionTime);
        if (startY == null || endY == null || extensionY == null ||
            startX == null || endX == null || extensionX == null) return null;
        return {
            startX, endX, extensionX, startY, endY, extensionY,
            minX: Math.min(startX, endX, extensionX),
            maxX: Math.max(startX, endX, extensionX),
            minY: Math.min(startY, endY, extensionY),
            maxY: Math.max(startY, endY, extensionY),
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