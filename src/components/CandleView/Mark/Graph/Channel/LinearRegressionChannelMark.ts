import { MarkType } from "../../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

interface DataPoint {
    time: string;
    price: number;
}

export class LinearRegressionChannelMark implements IGraph, IGraphStyle {
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
    private _deviation: number = 2;
    private _originalDeviation: number = 2;
    private markType: MarkType = MarkType.LinearRegressionChannel;
    private _hoverPoint: 'start' | 'end' | 'channel' | 'line' | null = null;
    private _chartData: Array<{time: string, value: number}> = [];

    constructor(
        startTime: string,
        startPrice: number,
        endTime: string,
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
        this._originalStartTime = startTime;
        this._originalStartPrice = startPrice;
        this._originalEndTime = endTime;
        this._originalEndPrice = endPrice;
    }

    getMarkType(): MarkType {
        return this.markType;
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this._chartData = this._series.data() || [];
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

    updateDeviation(deviation: number) {
        this._deviation = Math.max(0.1, deviation);
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
            this._originalDeviation = this._deviation;
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
            this.requestUpdate();
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | 'channel' | 'line' | null {
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
        
        const channelHandleX = midX + perpX * 40;
        const channelHandleY = midY + perpY * 40;
        
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
                    ctx.strokeStyle = this._color;
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

                    
                    const regression = this.calculateLinearRegression();
                    
                    
                    const startTimeNum = this.getTimeAsNumber(this._startTime);
                    const endTimeNum = this.getTimeAsNumber(this._endTime);
                    
                    const startPredictedPrice = regression.slope * startTimeNum + regression.intercept;
                    const endPredictedPrice = regression.slope * endTimeNum + regression.intercept;
                    
                    
                    const startPredictedY = this._series.priceToCoordinate(startPredictedPrice);
                    const endPredictedY = this._series.priceToCoordinate(endPredictedPrice);
                    
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startPredictedY);
                    ctx.lineTo(endX, endPredictedY);
                    ctx.stroke();
                    
                    
                    const stdDevPixels = Math.abs(this._series.priceToCoordinate(regression.stdDev * this._deviation) - this._series.priceToCoordinate(0));
                    
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startPredictedY - stdDevPixels);
                    ctx.lineTo(endX, endPredictedY - stdDevPixels);
                    ctx.stroke();
                    
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startPredictedY + stdDevPixels);
                    ctx.lineTo(endX, endPredictedY + stdDevPixels);
                    ctx.stroke();
                    
                    
                    if (!this._isPreview) {
                        ctx.fillStyle = this._color + '20';
                        ctx.beginPath();
                        ctx.moveTo(startX, startPredictedY - stdDevPixels);
                        ctx.lineTo(endX, endPredictedY - stdDevPixels);
                        ctx.lineTo(endX, endPredictedY + stdDevPixels);
                        ctx.lineTo(startX, startPredictedY + stdDevPixels);
                        ctx.closePath();
                        ctx.fill();
                    }
                    
                    
                    if ((this._showHandles || this._isDragging || this._hoverPoint) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, type: 'start' | 'end' | 'channel', isActive: boolean = false) => {
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
                            
                            
                            ctx.fillStyle = this._color;
                            ctx.font = '12px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            let infoText = '';
                            if (type === 'start') {
                                infoText = this._startPrice.toFixed(2);
                            } else if (type === 'end') {
                                infoText = this._endPrice.toFixed(2);
                            } else if (type === 'channel') {
                                infoText = `${this._deviation.toFixed(1)}σ`;
                            }
                            
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                            const textWidth = ctx.measureText(infoText).width;
                            ctx.fillRect(x - textWidth/2 - 5, y - 25, textWidth + 10, 18);
                            ctx.fillStyle = '#333333';
                            ctx.fillText(infoText, x, y - 10);
                            ctx.restore();
                        };
                        
                        
                        drawHandle(startX, startY, 'start', this._dragPoint === 'start' || this._hoverPoint === 'start');
                        drawHandle(endX, endY, 'end', this._dragPoint === 'end' || this._hoverPoint === 'end');
                        
                        
                        const midX = (startX + endX) / 2;
                        const midY = (startY + endY) / 2;
                        
                        const dx = endX - startX;
                        const dy = endY - startY;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        if (length > 0) {
                            const perpX = -dy / length;
                            const perpY = dx / length;
                            
                            
                            const channelHandleX = midX + perpX * 40;
                            const channelHandleY = midY + perpY * 40;
                            
                            drawHandle(channelHandleX, channelHandleY, 'channel', this._dragPoint === 'channel' || this._hoverPoint === 'channel');
                        }
                    }
                    
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
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

    getDeviation(): number {
        return this._deviation;
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
        deviation?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.deviation !== undefined) this.updateDeviation(styles.deviation);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            deviation: this._deviation,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startX == null || startY == null || endX == null || endY == null) return null;
        
        const regression = this.calculateLinearRegression();
        const startTimeNum = this.getTimeAsNumber(this._startTime);
        const endTimeNum = this.getTimeAsNumber(this._endTime);
        
        const startPredictedPrice = regression.slope * startTimeNum + regression.intercept;
        const endPredictedPrice = regression.slope * endTimeNum + regression.intercept;
        
        const startPredictedY = this._series.priceToCoordinate(startPredictedPrice);
        const endPredictedY = this._series.priceToCoordinate(endPredictedPrice);
        
        const stdDevPixels = Math.abs(this._series.priceToCoordinate(regression.stdDev * this._deviation) - this._series.priceToCoordinate(0));
        
        const points = [
            { x: startX, y: startPredictedY - stdDevPixels },
            { x: endX, y: endPredictedY - stdDevPixels },
            { x: startX, y: startPredictedY + stdDevPixels },
            { x: endX, y: endPredictedY + stdDevPixels }
        ];
        
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

    private calculateLinearRegression(): {slope: number, intercept: number, stdDev: number} {
        const dataInRange = this.getDataPointsInRange();
        
        if (dataInRange.length < 2) {
            const slope = (this._endPrice - this._startPrice) / (this.getTimeDifference() || 1);
            const intercept = this._startPrice - slope * this.getTimeAsNumber(this._startTime);
            return { slope, intercept, stdDev: Math.abs(this._endPrice - this._startPrice) * 0.1 };
        }

        const n = dataInRange.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        dataInRange.forEach(point => {
            const x = this.getTimeAsNumber(point.time);
            sumX += x;
            sumY += point.price;
            sumXY += x * point.price;
            sumXX += x * x;
        });
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        let sumSquaredErrors = 0;
        dataInRange.forEach(point => {
            const x = this.getTimeAsNumber(point.time);
            const predictedY = slope * x + intercept;
            sumSquaredErrors += Math.pow(point.price - predictedY, 2);
        });
        const stdDev = Math.sqrt(sumSquaredErrors / n);
        
        return { slope, intercept, stdDev };
    }

    private getDataPointsInRange(): DataPoint[] {
        if (!this._chartData || this._chartData.length === 0) {
            return [
                { time: this._startTime, price: this._startPrice },
                { time: this._endTime, price: this._endPrice }
            ];
        }
        
        return this._chartData
            .filter(data => data.time >= this._startTime && data.time <= this._endTime)
            .map(data => ({
                time: data.time,
                price: (data as any).close || data.value || (data as any).price || 0
            }));
    }

    private getTimeAsNumber(time: string): number {
        return new Date(time).getTime();
    }

    private getTimeDifference(): number {
        return this.getTimeAsNumber(this._endTime) - this.getTimeAsNumber(this._startTime);
    }
}