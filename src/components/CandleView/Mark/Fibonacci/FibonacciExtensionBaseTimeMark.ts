import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class FibonacciExtensionBaseTimeMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _startPrice: number;
    private _endPrice: number;
    private _extensionPrice: number;
    private _startTime: number;
    private _endTime: number;
    private _extensionTime: number;
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
        startPrice: number,
        endPrice: number,
        extensionPrice: number,
        startTime: number,
        endTime: number,
        extensionTime: number,
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

    updateEndPoint(endPrice: number, endTime: number) {
        this._endPrice = endPrice;
        this._endTime = endTime;
        this.requestUpdate();
    }

    updateStartPoint(startPrice: number, startTime: number) {
        this._startPrice = startPrice;
        this._startTime = startTime;
        this.requestUpdate();
    }

    updateExtensionPoint(extensionPrice: number, extensionTime: number) {
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

        const adjustedDeltaY = deltaY * 0.5;
        const adjustedDeltaX = deltaX * 0.5;

        const timeScale = this._chart.timeScale();

        try {
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
                this._startTime = newStartTime;
                this._endTime = newEndTime;
                this._extensionTime = newExtensionTime;
                this.requestUpdate();
            }
        } catch (error) {
            console.error('Error in dragLineByPixels:', error);
        }
    }

    dragHandleByPixels(deltaY: number, deltaX: number = 0, handleType: 'start' | 'end' | 'extension') {
        if (isNaN(deltaY) || isNaN(deltaX)) {
            return;
        }
        if (!this._chart || !this._series) return;

        const adjustedDeltaY = deltaY * 0.5;
        const adjustedDeltaX = deltaX * 0.5;

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
                this._startTime = newStartTime;
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
                this._endTime = newEndTime;
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
                this._extensionTime = newExtensionTime;
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

            const timeDiff = endTime - startTime;

            
            const fibTimes = this._fibonacciLevels.map(level => {
                return endTime + timeDiff * level;
            });

            const allTimes = [
                startTime,
                endTime,
                extensionTime,
                ...fibTimes
            ];

            const minTime = Math.min(...allTimes);
            const maxTime = Math.max(...allTimes);

            
            const timeMargin = (maxTime - minTime) * 0.1;
            
            timeScale.applyOptions({
                rightOffset: 0,
                visibleRange: {
                    from: minTime - timeMargin,
                    to: maxTime + timeMargin
                }
            });
        } catch (error) {
            console.error('Error adjusting chart time range for extension:', error);
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
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const extensionY = this._series.priceToCoordinate(this._extensionPrice);
        if (startY == null || endY == null || extensionY == null) return null;

        const minY = Math.min(startY, endY, extensionY);
        const maxY = Math.max(startY, endY, extensionY);

        const startTime = this._startTime;
        const endTime = this._endTime;
        const timeDiff = endTime - startTime;

        for (let i = 0; i < this._fibonacciLevels.length; i++) {
            const level = this._fibonacciLevels[i];
            const fibTime = endTime + timeDiff * level;

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

                    const startTime = this._startTime;
                    const endTime = this._endTime;
                    const timeDiff = endTime - startTime;

                    const minY = Math.min(startY, endY, extensionY);
                    const maxY = Math.max(startY, endY, extensionY);

                    
                    for (let i = 0; i < this._fibonacciLevels.length; i++) {
                        const level = this._fibonacciLevels[i];
                        const fibTime = endTime + timeDiff * level;

                        const fibX = timeScale.timeToCoordinate(fibTime);

                        if (fibX === null) continue;

                        this._fibonacciLinePositions.push({
                            x: fibX,
                            level: level,
                            time: fibTime
                        });

                        
                        ctx.strokeStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                        ctx.beginPath();
                        ctx.moveTo(fibX, minY);
                        ctx.lineTo(fibX, maxY);
                        ctx.stroke();

                        
                        ctx.save();
                        ctx.fillStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.fillText(`${(level * 100).toFixed(1)}%`, fibX, maxY + 5);
                        ctx.restore();
                    }

                    
                    for (let i = 0; i < this._fibonacciLevels.length - 1; i++) {
                        const currentLevel = this._fibonacciLevels[i];
                        const nextLevel = this._fibonacciLevels[i + 1];
                        
                        const currentFibTime = endTime + timeDiff * currentLevel;
                        const nextFibTime = endTime + timeDiff * nextLevel;

                        const currentFibX = timeScale.timeToCoordinate(currentFibTime);
                        const nextFibX = timeScale.timeToCoordinate(nextFibTime);

                        if (currentFibX !== null && nextFibX !== null) {
                            ctx.fillStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                            ctx.globalAlpha = this._fillOpacity;
                            
                            const startFillX = Math.min(currentFibX, nextFibX);
                            const endFillX = Math.max(currentFibX, nextFibX);
                            const fillWidth = endFillX - startFillX;
                            
                            ctx.fillRect(startFillX, minY, fillWidth, maxY - minY);
                            
                            
                            ctx.globalAlpha = this._isPreview || this._isDragging ? 0.7 : 1.0;
                        }
                    }

                    
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

    getStartTime(): number {
        return this._startTime;
    }

    getEndTime(): number {
        return this._endTime;
    }

    getExtensionTime(): number {
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

    getFibonacciLinePositions(): { x: number; level: number; time: number }[] {
        return [...this._fibonacciLinePositions];
    }

    getFibonacciColors(): string[] {
        return [...this._fibonacciColors];
    }
}