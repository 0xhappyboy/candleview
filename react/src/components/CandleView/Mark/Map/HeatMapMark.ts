import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

interface DataPoint {
    time: number;
    price: number;
    volume?: number;
}

export class HeatMapMark implements IGraph, IMarkStyle {
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
    private _dragPoint: 'start' | 'end' | 'body' | null = null; 
    private _showHandles: boolean = false;
    private _opacity: number = 0.7;
    private markType: MarkType = MarkType.HeatMap;
    private _hoverPoint: 'start' | 'end' | 'body' | null = null; 
    private _chartData: Array<{ time: number, value: number, volume?: number }> = [];
    private _volumeData: Map<number, number> = new Map(); 
    private _maxVolume: number = 0;

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

    getMarkType(): MarkType {
        return this.markType;
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this._chartData = this._series.data() || [];
        this._processVolumeData();
        this.requestUpdate();
    }

    private _processVolumeData() {
        this._volumeData.clear();
        this._maxVolume = 0;
        const dataInRange = this.getDataPointsInRange();
        dataInRange.forEach(point => {
            if (point.volume !== undefined) {
                this._volumeData.set(point.time, point.volume);
                this._maxVolume = Math.max(this._maxVolume, point.volume);
            }
        });
        if (this._maxVolume === 0) {
            dataInRange.forEach((point, index) => {
                const volume = Math.random() * 1000 + 100; 
                this._volumeData.set(point.time, volume);
                this._maxVolume = Math.max(this._maxVolume, volume);
            });
        }
    }

    updateAllViews() { }

    updateEndPoint(endTime: number, endPrice: number) {
        this._endTime = endTime;
        this._endPrice = endPrice;
        this._processVolumeData();
        this.requestUpdate();
    }

    updateStartPoint(startTime: number, startPrice: number) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this._processVolumeData();
        this.requestUpdate();
    }

    updateOpacity(opacity: number) {
        this._opacity = Math.max(0.1, Math.min(1, opacity));
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'body' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    setHoverPoint(hoverPoint: 'start' | 'end' | 'body' | null) {
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
            this._startTime = newStartTime;
            this._startPrice = newStartPrice;
            this._endTime = newEndTime;
            this._endPrice = newEndPrice;
            this._processVolumeData();
            this.requestUpdate();
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 20): 'start' | 'end' | 'body' | null {
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
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            return 'body';
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
                    this._drawHeatMap(ctx, Math.min(startX, endX), Math.max(startX, endX), Math.min(startY, endY), Math.max(startY, endY));
                    if ((this._showHandles || this._isDragging || this._hoverPoint) && !this._isPreview) {
                        this._drawHandles(ctx, startX, startY, endX, endY);
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private _drawHeatMap(ctx: CanvasRenderingContext2D, leftX: number, rightX: number, topY: number, bottomY: number) {
        const dataInRange = this.getDataPointsInRange();
        if (dataInRange.length === 0) return;
        const width = Math.abs(rightX - leftX);
        const height = Math.abs(bottomY - topY);
        const filteredData = dataInRange.filter((_, index) => index % 3 === 0);
        if (filteredData.length === 0) return;
        const barHeight = height / filteredData.length;
        let currentY = topY;
        filteredData.forEach((point, index) => {
            const volume = this._volumeData.get(point.time) || 0;
            const normalizedVolume = this._maxVolume > 0 ? volume / this._maxVolume : 0;
            const intensity = Math.min(1, normalizedVolume * 2);
            const color = this._getHeatColor(intensity);
            const minBarWidth = width * 0.1; 
            const barWidth = Math.max(minBarWidth, width * normalizedVolume);
            const barX = leftX;
            ctx.fillStyle = color;
            ctx.fillRect(barX, currentY, barWidth, barHeight);
            currentY += barHeight;
        });
    }

    private _getHeatColor(intensity: number): string {
        if (intensity < 0.33) {
            return `rgba(100, 150, 255)`;
        } else if (intensity < 0.66) {
            return `rgba(100, 200, 200)`;
        } else {
            return `rgba(255, 150, 100)`;
        }
    }

    private _drawHandles(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
        const drawHandle = (x: number, y: number, type: 'start' | 'end' | 'body', isActive: boolean = false) => {
            ctx.save();
            if (type === 'body') {
            } else {
                ctx.fillStyle = type === 'start' ? '#2962FF' : '#FF5252';
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
                if (isActive) {
                    ctx.strokeStyle = type === 'start' ? '#2962FF' : '#FF5252';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.arc(x, y, 8, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            ctx.restore();
        };
        drawHandle(startX, startY, 'start', this._dragPoint === 'start' || this._hoverPoint === 'start');
        drawHandle(endX, endY, 'end', this._dragPoint === 'end' || this._hoverPoint === 'end');
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

    getOpacity(): number {
        return this._opacity;
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
        opacity?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.opacity !== undefined) this.updateOpacity(styles.opacity);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            opacity: this._opacity,
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

    private getDataPointsInRange(): DataPoint[] {
        if (!this._chartData || this._chartData.length === 0) {
            return [
                { time: this._startTime, price: this._startPrice },
                { time: this._endTime, price: this._endPrice }
            ];
        }

        const minTime = Math.min(this._startTime, this._endTime);
        const maxTime = Math.max(this._startTime, this._endTime);

        return this._chartData
            .filter(data => data.time >= minTime && data.time <= maxTime)
            .map(data => ({
                time: data.time,
                price: (data as any).close || data.value || (data as any).price || 0,
                volume: (data as any).volume || 0
            }));
    }
}