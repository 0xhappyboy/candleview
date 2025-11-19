import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class FibonacciExtensionBaseTimeMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _startTime: number;
    private _endTime: number;
    private _extensionTime: number;
    private _startPrice: number;
    private _endPrice: number;
    private _extensionPrice: number;
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
    private markType: MarkType = MarkType.FibonacciExtensionBaseTime;
    private _fibonacciLinePositions: { x: number; level: number; time: number }[] = [];
    private _dragSensitivity: number = 0;

    constructor(
        startTime: number,
        endTime: number,
        extensionTime: number,
        startPrice: number,
        endPrice: number,
        extensionPrice: number,
        color: string = '#2962FF',
        lineWidth: number = 1,
        isPreview: boolean = false,
        dragSensitivity: number = 1.5
    ) {
        this._startTime = startTime;
        this._endTime = endTime;
        this._extensionTime = extensionTime;
        this._startPrice = startPrice;
        this._endPrice = endPrice;
        this._extensionPrice = extensionPrice;
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

    updateExtensionPoint(extensionTime: number, extensionPrice: number) {
        this._extensionTime = extensionTime;
        this._extensionPrice = extensionPrice;
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

    dragLineByPixels(deltaX: number, deltaY: number = 0) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;

        const adjustedDeltaX = deltaX;
        const adjustedDeltaY = deltaY;

        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const extensionX = timeScale.timeToCoordinate(this._extensionTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const extensionY = this._series.priceToCoordinate(this._extensionPrice);

        if (startX === null || endX === null || extensionX === null ||
            startY === null || endY === null || extensionY === null) return;

        const newStartX = startX + adjustedDeltaX;
        const newEndX = endX + adjustedDeltaX;
        const newExtensionX = extensionX + adjustedDeltaX;
        const newStartY = startY + adjustedDeltaY;
        const newEndY = endY + adjustedDeltaY;
        const newExtensionY = extensionY + adjustedDeltaY;

        const newStartTime = timeScale.coordinateToTime(newStartX);
        const newEndTime = timeScale.coordinateToTime(newEndX);
        const newExtensionTime = timeScale.coordinateToTime(newExtensionX);
        const newStartPrice = this._series.coordinateToPrice(newStartY);
        const newEndPrice = this._series.coordinateToPrice(newEndY);
        const newExtensionPrice = this._series.coordinateToPrice(newExtensionY);

        if (newStartTime !== null && newEndTime !== null && newExtensionTime !== null &&
            newStartPrice !== null && newEndPrice !== null && newExtensionPrice !== null) {
            this._startTime = newStartTime;
            this._endTime = newEndTime;
            this._extensionTime = newExtensionTime;
            this._startPrice = newStartPrice;
            this._endPrice = newEndPrice;
            this._extensionPrice = newExtensionPrice;
            this.requestUpdate();
        }
    }

    dragHandleByPixels(deltaX: number, deltaY: number = 0, handleType: 'start' | 'end' | 'extension') {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;

        const adjustedDeltaX = deltaX;
        const adjustedDeltaY = deltaY;

        const timeScale = this._chart.timeScale();

        if (handleType === 'start') {
            const startX = timeScale.timeToCoordinate(this._startTime);
            const startY = this._series.priceToCoordinate(this._startPrice);
            if (startX === null || startY === null) return;
            const newStartX = startX + adjustedDeltaX;
            const newStartY = startY + adjustedDeltaY;
            const newStartTime = timeScale.coordinateToTime(newStartX);
            const newStartPrice = this._series.coordinateToPrice(newStartY);
            if (newStartTime !== null && newStartPrice !== null) {
                this._startTime = newStartTime;
                this._startPrice = newStartPrice;
                this.requestUpdate();
            }
        } else if (handleType === 'end') {
            const endX = timeScale.timeToCoordinate(this._endTime);
            const endY = this._series.priceToCoordinate(this._endPrice);
            if (endX === null || endY === null) return;
            const newEndX = endX + adjustedDeltaX;
            const newEndY = endY + adjustedDeltaY;
            const newEndTime = timeScale.coordinateToTime(newEndX);
            const newEndPrice = this._series.coordinateToPrice(newEndY);
            if (newEndTime !== null && newEndPrice !== null) {
                this._endTime = newEndTime;
                this._endPrice = newEndPrice;
                this.requestUpdate();
            }
        } else if (handleType === 'extension') {
            const extensionX = timeScale.timeToCoordinate(this._extensionTime);
            const extensionY = this._series.priceToCoordinate(this._extensionPrice);
            if (extensionX === null || extensionY === null) return;
            const newExtensionX = extensionX + adjustedDeltaX;
            const newExtensionY = extensionY + adjustedDeltaY;
            const newExtensionTime = timeScale.coordinateToTime(newExtensionX);
            const newExtensionPrice = this._series.coordinateToPrice(newExtensionY);
            if (newExtensionTime !== null && newExtensionPrice !== null) {
                this._extensionTime = newExtensionTime;
                this._extensionPrice = newExtensionPrice;
                this.requestUpdate();
                setTimeout(() => {
                    this.adjustChartTimeRangeForExtension();
                }, 0);
            }
        }
    }

    public adjustChartTimeRangeForExtension(): void {
        if (!this._chart || !this._series) return;
        try {
            const timeScale = this._chart.timeScale();
            const extensionTime = this._extensionTime;
            const endTime = this._endTime;
            const startTime = this._startTime;
            const timeDiff = this._endTime - this._startTime;
            const fibTimes = this._fibonacciLevels.map(level => this._endTime + timeDiff * level);
            const allTimes = [startTime, endTime, extensionTime, ...fibTimes];
            const minTime = Math.min(...allTimes);
            const maxTime = Math.max(...allTimes);

            const visibleRange = timeScale.getVisibleLogicalRange();
            if (!visibleRange) return;

            const data = this._series.data();
            if (!data || data.length === 0) return;

            let seriesMinTime = Number.MAX_VALUE;
            let seriesMaxTime = Number.MIN_VALUE;
            data.forEach((item: any) => {
                if (item.time !== undefined) {
                    if (item.time < seriesMinTime) seriesMinTime = item.time;
                    if (item.time > seriesMaxTime) seriesMaxTime = item.time;
                }
            });

            if (seriesMinTime > seriesMaxTime) {
                seriesMinTime = Math.min(...allTimes);
                seriesMaxTime = Math.max(...allTimes);
            }

            const overallMin = Math.min(seriesMinTime, minTime);
            const overallMax = Math.max(seriesMaxTime, maxTime);
            const margin = (overallMax - overallMin) * 0.15;
            const newMinTime = overallMin - margin;
            const newMaxTime = overallMax + margin;

            this._chart.applyOptions({
                timeScale: {
                    minValue: newMinTime,
                    maxValue: newMaxTime
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | 'extension' | null {
        if (!this._chart || !this._series) return null;
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const extensionX = timeScale.timeToCoordinate(this._extensionTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const extensionY = this._series.priceToCoordinate(this._extensionPrice);

        if (startX == null || endX == null || extensionX == null ||
            startY == null || endY == null || extensionY == null) return null;

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
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const extensionY = this._series.priceToCoordinate(this._extensionPrice);

        if (startY == null || endY == null || extensionY == null) return null;

        const minY = Math.min(startY, endY, extensionY);
        const maxY = Math.max(startY, endY, extensionY);
        const timeDiff = this._endTime - this._startTime;

        for (let i = 0; i < this._fibonacciLevels.length; i++) {
            const level = this._fibonacciLevels[i];
            const fibTime = this._endTime + timeDiff * level;
            const fibX = timeScale.timeToCoordinate(fibTime);
            if (fibX === null) continue;

            const distance = Math.abs(x - fibX);
            if (distance <= threshold && y >= minY && y <= maxY) {
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
                    const startX = timeScale.timeToCoordinate(this._startTime);
                    const endX = timeScale.timeToCoordinate(this._endTime);
                    const extensionX = timeScale.timeToCoordinate(this._extensionTime);
                    const startY = this._series.priceToCoordinate(this._startPrice);
                    const endY = this._series.priceToCoordinate(this._endPrice);
                    const extensionY = this._series.priceToCoordinate(this._extensionPrice);

                    if (startX == null || endX == null || extensionX == null ||
                        startY == null || endY == null || extensionY == null) return;

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

                    const timeDiff = this._endTime - this._startTime;
                    const extensionMinY = Math.min(endY, extensionY);
                    const extensionMaxY = Math.max(endY, extensionY);

                    this._fibonacciLevels.forEach((level, index) => {
                        const fibTime = this._endTime + timeDiff * level;
                        const fibX = timeScale.timeToCoordinate(fibTime);
                        if (fibX === null) return;

                        this._fibonacciLinePositions.push({
                            x: fibX,
                            level: level,
                            time: fibTime
                        });

                        ctx.strokeStyle = this._fibonacciColors[index % this._fibonacciColors.length];
                        ctx.beginPath();
                        ctx.moveTo(fibX, extensionMinY);
                        ctx.lineTo(fibX, extensionMaxY);
                        ctx.stroke();

                        ctx.save();
                        ctx.fillStyle = this._fibonacciColors[index % this._fibonacciColors.length];
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.fillText(`${(level * 100).toFixed(1)}%`, fibX, extensionMaxY + 5);
                        ctx.restore();

                        if (index < this._fibonacciLevels.length - 1) {
                            const nextLevel = this._fibonacciLevels[index + 1];
                            const nextFibTime = this._endTime + timeDiff * nextLevel;
                            const nextFibX = timeScale.timeToCoordinate(nextFibTime);
                            if (nextFibX !== null) {
                                ctx.fillStyle = this._fibonacciColors[index % this._fibonacciColors.length];
                                ctx.globalAlpha = this._fillOpacity;
                                ctx.fillRect(
                                    Math.min(fibX, nextFibX),
                                    extensionMinY,
                                    Math.abs(fibX - nextFibX),
                                    extensionMaxY - extensionMinY
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

    getStartTime(): number {
        return this._startTime;
    }

    getEndTime(): number {
        return this._endTime;
    }

    getExtensionTime(): number {
        return this._extensionTime;
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
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const extensionX = timeScale.timeToCoordinate(this._extensionTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const extensionY = this._series.priceToCoordinate(this._extensionPrice);

        if (startX == null || endX == null || extensionX == null ||
            startY == null || endY == null || extensionY == null) return null;

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

    getFibonacciLinePositions(): { x: number; level: number; time: number }[] {
        return [...this._fibonacciLinePositions];
    }

    getFibonacciColors(): string[] {
        return [...this._fibonacciColors];
    }
}