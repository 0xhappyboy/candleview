import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class FibonacciChannelMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _startTime: string;
    private _startPrice: number;
    private _endTime: string;
    private _endPrice: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'channel' | 'line' | null = null;
    private _showHandles: boolean = false;
    private _originalStartTime: string = '';
    private _originalStartPrice: number = 0;
    private _originalEndTime: string = '';
    private _originalEndPrice: number = 0;
    private _channelHeight: number = 0;
    private _originalChannelHeight: number = 0;
    private markType: MarkType = MarkType.FibonacciChannel;
    private _hoverPoint: 'start' | 'end' | 'channel' | 'line' | null = null;
    private _fibonacciLevels: number[] = [
        0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.236, 1.382, 1.5, 1.618, 2.618, 3.618
    ];
    private _showLevelLabels: boolean = true;
    private _levelColors: string[] = [
        '#FF6B35',
        '#FF8E53',
        '#FFB174',
        '#FFD495',
        '#4ECDC4',
        '#45B7AF',
        '#FF6B6B',
        '#FF8E8E',
        '#FFB1B1',
        '#FFD4D4',
        '#556270',
        '#2C3E50',
        '#1A2530'
    ];

    constructor(
        startTime: string,
        startPrice: number,
        endTime: string,
        endPrice: number,
        color: string = '#FF6B35',
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
        this._originalStartTime = startTime;
        this._originalStartPrice = startPrice;
        this._originalEndTime = endTime;
        this._originalEndPrice = endPrice;

        this._channelHeight = Math.abs(endPrice - startPrice) * 0.5;
        this._originalChannelHeight = this._channelHeight;
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

    updateEndPoint(endTime: string, endPrice: number) {
        this._endTime = endTime;
        this._endPrice = endPrice;
        this.requestUpdate();
    }

    updateStartPoint(startTime: string, startPrice: number) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this.requestUpdate();
    }

    updateChannelHeight(height: number) {
        this._channelHeight = Math.max(0.001, height);
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'channel' | 'line' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        if (isDragging) {
            this._originalStartTime = this._startTime;
            this._originalStartPrice = this._startPrice;
            this._originalEndTime = this._endTime;
            this._originalEndPrice = this._endPrice;
            this._originalChannelHeight = this._channelHeight;
        }
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    setHoverPoint(hoverPoint: 'start' | 'end' | 'channel' | 'line' | null) {
        this._hoverPoint = hoverPoint;
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
        if (this._dragPoint === 'start') {
            const newStartX = startX + deltaX;
            const newStartY = startY + deltaY;
            const newStartTime = timeScale.coordinateToTime(newStartX);
            const newStartPrice = this._series.coordinateToPrice(newStartY);
            if (newStartTime !== null && !isNaN(newStartPrice)) {
                this._startTime = newStartTime.toString();
                this._startPrice = newStartPrice;
            }
        } else if (this._dragPoint === 'end') {
            const newEndX = endX + deltaX;
            const newEndY = endY + deltaY;
            const newEndTime = timeScale.coordinateToTime(newEndX);
            const newEndPrice = this._series.coordinateToPrice(newEndY);
            if (newEndTime !== null && !isNaN(newEndPrice)) {
                this._endTime = newEndTime.toString();
                this._endPrice = newEndPrice;
            }
        } else if (this._dragPoint === 'channel') {
            const dx = endX - startX;
            const dy = endY - startY;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length === 0) return;
            const perpX = -dy / length;
            const perpY = dx / length;
            const projectedDelta = deltaX * perpX + deltaY * perpY;
            const startCoord = this._series.priceToCoordinate(this._startPrice);
            const endCoord = this._series.priceToCoordinate(this._endPrice);
            if (startCoord === null || endCoord === null) return;
            const pixelToPriceRatio = Math.abs((this._endPrice - this._startPrice) / (endCoord - startCoord)) || 0.01;
            const heightChange = projectedDelta * pixelToPriceRatio;
            const newChannelHeight = Math.max(0.001, this._channelHeight + heightChange);
            this.updateChannelHeight(newChannelHeight);
        } else {
            const newStartX = startX + deltaX;
            const newStartY = startY + deltaY;
            const newEndX = endX + deltaX;
            const newEndY = endY + deltaY;
            const newStartTime = timeScale.coordinateToTime(newStartX);
            const newStartPrice = this._series.coordinateToPrice(newStartY);
            const newEndTime = timeScale.coordinateToTime(newEndX);
            const newEndPrice = this._series.coordinateToPrice(newEndY);
            if (newStartTime !== null && !isNaN(newStartPrice) && newEndTime !== null && !isNaN(newEndPrice)) {
                this._startTime = newStartTime.toString();
                this._startPrice = newStartPrice;
                this._endTime = newEndTime.toString();
                this._endPrice = newEndPrice;
            }
        }

        this.requestUpdate();
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | 'channel' | null {
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
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return null;
        const perpX = -dy / length;
        const perpY = dx / length;
        const channelHeightPixels = Math.abs(
            this._series.priceToCoordinate(this._startPrice - this._channelHeight) -
            this._series.priceToCoordinate(this._startPrice)
        );

        const maxOffset = Math.min(channelHeightPixels, length * 0.8);
        const channelHandleX = midX + perpX * maxOffset;
        const channelHandleY = midY + perpY * maxOffset;

        const distToChannel = Math.sqrt(Math.pow(x - channelHandleX, 2) + Math.pow(y - channelHandleY, 2));
        if (distToChannel <= threshold) {
            return 'channel';
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

    public setFibonacciType(type: 'standard' | 'extended' | 'custom'): void {
        switch (type) {
            case 'standard':
                this._fibonacciLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
                break;
            case 'extended':
                this._fibonacciLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.236, 1.382, 1.5, 1.618, 2.618, 3.618];
                break;
            case 'custom':
            default:
                break;
        }
        this.requestUpdate();
    }

    public setCustomFibonacciLevels(levels: number[]): void {
        this._fibonacciLevels = [...levels].sort((a, b) => a - b);
        this.requestUpdate();
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
                        ctx.setLineDash([]);
                    }
                    const dx = endX - startX;
                    const dy = endY - startY;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    if (length === 0) {
                        ctx.restore();
                        return;
                    }
                    const verticalHeight = this._channelHeight;
                    for (let i = 0; i < this._fibonacciLevels.length; i++) {
                        const level = this._fibonacciLevels[i];
                        const colorIndex = i % this._levelColors.length;
                        ctx.strokeStyle = this._levelColors[colorIndex];


                        if (level === 0 || level === 0.618 || level === 1 || level === 1.618) {
                            ctx.lineWidth = this._lineWidth + 1;
                        } else {
                            ctx.lineWidth = this._lineWidth;
                        }




                        const levelPriceOffset = verticalHeight * level;


                        const startLevelPrice = this._startPrice + levelPriceOffset;
                        const endLevelPrice = this._endPrice + levelPriceOffset;


                        const levelStartY = this._series.priceToCoordinate(startLevelPrice);
                        const levelEndY = this._series.priceToCoordinate(endLevelPrice);

                        if (levelStartY == null || levelEndY == null) continue;

                        ctx.beginPath();
                        ctx.moveTo(startX, levelStartY);
                        ctx.lineTo(endX, levelEndY);
                        ctx.stroke();


                        if (this._showLevelLabels && !this._isPreview) {
                            this.drawLevelLabel(ctx, endX, levelEndY, level, this._levelColors[colorIndex]);
                        }
                    }


                    if ((this._showHandles || this._isDragging || this._hoverPoint) && !this._isPreview) {
                        this.drawControlPoints(ctx, startX, startY, endX, endY);
                    }

                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }


    private drawLevelLabel(ctx: any, x: number, y: number, level: number, color: string) {
        ctx.save();
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const labelText = `${level !== 0 ? level.toFixed(3) : '0'}`;
        const labelX = x + 5;
        const labelY = y;


        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const textWidth = ctx.measureText(labelText).width;
        const textHeight = 16;
        ctx.fillRect(labelX - 2, labelY - textHeight / 2, textWidth + 4, textHeight);


        ctx.fillStyle = color;
        ctx.fillText(labelText, labelX, labelY);
        ctx.restore();
    }


    private calculateSlopeAngle(): number {
        const priceDiff = this._endPrice - this._startPrice;
        const timeDiff = this._chart.timeScale().timeToCoordinate(this._endTime) -
            this._chart.timeScale().timeToCoordinate(this._startTime);
        return Math.atan2(priceDiff, timeDiff);
    }


    private getChartDimensions(): { width: number; height: number } {
        if (!this._chart || !this._series) {
            console.warn('Chart or series not initialized');
            return { width: 800, height: 600 };
        }

        try {
            const timeScale = this._chart.timeScale();
            const priceScale = this._series.priceScale();

            if (!timeScale || !priceScale) {
                return { width: 800, height: 600 };
            }

            return {
                width: timeScale.width() || 800,
                height: priceScale.height() || 600
            };
        } catch (error) {
            console.warn('Error getting chart dimensions:', error);
            return { width: 800, height: 600 };
        }
    }




    private drawControlPoints(ctx: any, startX: number, startY: number, endX: number, endY: number) {
        if (!this._chart || !this._series) {
            console.warn('Cannot draw control points: chart or series not available');
            return;
        }

        const drawHandle = (x: number, y: number, type: 'start' | 'end' | 'channel', isActive: boolean = false) => {

            const dimensions = this.getChartDimensions();


            const clampedX = Math.max(10, Math.min(x, dimensions.width - 10));
            const clampedY = Math.max(10, Math.min(y, dimensions.height - 10));

            ctx.save();
            ctx.fillStyle = this._color;
            ctx.beginPath();
            ctx.arc(clampedX, clampedY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(clampedX, clampedY, 4, 0, Math.PI * 2);
            ctx.fill();
            if (isActive) {
                ctx.strokeStyle = this._color;
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.arc(clampedX, clampedY, 8, 0, Math.PI * 2);
                ctx.stroke();
            }


            ctx.fillStyle = this._color;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            let infoText = '';
            if (type === 'start') {
                const price = this._startPrice.toFixed(2);
                infoText = `${price}`;
            } else if (type === 'end') {
                const price = this._endPrice.toFixed(2);
                infoText = `${price}`;
            } else if (type === 'channel') {
                const height = (this._channelHeight / Math.min(this._startPrice, this._endPrice) * 100).toFixed(2);
                infoText = `${height}%`;
            }


            const labelX = clampedX;
            const labelY = Math.max(25, clampedY - 15);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            const textWidth = ctx.measureText(infoText).width;
            ctx.fillRect(labelX - textWidth / 2 - 5, labelY - 8, textWidth + 4, 16);
            ctx.fillStyle = '#333333';
            ctx.fillText(infoText, labelX, labelY);
            ctx.restore();
        };
        drawHandle(startX, startY, 'start', this._dragPoint === 'start' || this._hoverPoint === 'start');
        drawHandle(endX, endY, 'end', this._dragPoint === 'end' || this._hoverPoint === 'end');
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return;
        const perpX = -dy / length;
        const perpY = dx / length;
        try {
            const startCoord = this._series.priceToCoordinate(this._startPrice);
            const channelCoord = this._series.priceToCoordinate(this._startPrice - this._channelHeight);
            if (startCoord === null || channelCoord === null) return;
            const channelHeightPixels = Math.abs(channelCoord - startCoord);
            const maxOffset = Math.min(channelHeightPixels, length * 0.8);
            const channelHandleX = midX + perpX * maxOffset;
            const channelHandleY = midY + perpY * maxOffset;

            drawHandle(channelHandleX, channelHandleY, 'channel', this._dragPoint === 'channel' || this._hoverPoint === 'channel');
        } catch (error) {
            console.warn('Error calculating channel handle position:', error);
        }
    }

    getStartTime(): string {
        return this._startTime;
    }

    getStartPrice(): number {
        return this._startPrice;
    }

    getEndTime(): string {
        return this._endTime;
    }

    getEndPrice(): number {
        return this._endPrice;
    }

    getChannelHeight(): number {
        return this._channelHeight;
    }

    getFibonacciLevels(): number[] {
        return [...this._fibonacciLevels];
    }

    setFibonacciLevels(levels: number[]): void {
        this._fibonacciLevels = [...levels].sort((a, b) => a - b);
        this.requestUpdate();
    }

    setShowLevelLabels(show: boolean): void {
        this._showLevelLabels = show;
        this.requestUpdate();
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
        channelHeight?: number;
        fibonacciLevels?: number[];
        showLevelLabels?: boolean;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.channelHeight !== undefined) this.updateChannelHeight(styles.channelHeight);
        if (styles.fibonacciLevels) this.setFibonacciLevels(styles.fibonacciLevels);
        if (styles.showLevelLabels !== undefined) this.setShowLevelLabels(styles.showLevelLabels);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            channelHeight: this._channelHeight,
            fibonacciLevels: this._fibonacciLevels,
            showLevelLabels: this._showLevelLabels,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;

        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);

        if (startX == null || startY == null || endX == null || endY == null) return null;


        const points = [];

        for (let i = 0; i < this._fibonacciLevels.length; i++) {
            const level = this._fibonacciLevels[i];
            const levelPriceOffset = this._channelHeight * level;


            const startLevelPrice = this._startPrice + levelPriceOffset;
            const endLevelPrice = this._endPrice + levelPriceOffset;


            const levelStartY = this._series.priceToCoordinate(startLevelPrice);
            const levelEndY = this._series.priceToCoordinate(endLevelPrice);

            if (levelStartY !== null) points.push({ x: startX, y: levelStartY });
            if (levelEndY !== null) points.push({ x: endX, y: levelEndY });
        }

        if (points.length === 0) return null;

        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);

        return {
            startX, startY, endX, endY,
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    }
}