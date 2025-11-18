import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class PriceRangeMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _startPrice: number;
    private _endPrice: number;
    private _startTime: number;
    private _endTime: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'line' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.PriceRange;
    private _hoverPoint: 'start' | 'end' | 'line' | null = null;
    private _fillColor: string;
    private _fillOpacity: number = 0.2;

    constructor(
        startPrice: number,
        endPrice: number,
        startTime: number,
        endTime: number,
        color: string = '#3964FE',
        lineWidth: number = 2,
        isPreview: boolean = false,
        fillColor?: string
    ) {
        this._startPrice = startPrice;
        this._endPrice = endPrice;
        this._startTime = startTime;
        this._endTime = endTime;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._fillColor = fillColor || color;
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

    setHoverPoint(hoverPoint: 'start' | 'end' | 'line' | null) {
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
            this.requestUpdate();
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | null {
        if (!this._chart || !this._series) return null;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startX == null || startY == null || endX == null || endY == null) return null;
        const distToStart = Math.abs(y - startY);
        if (distToStart <= threshold && Math.abs(x - startX) <= 5) {
            return 'start';
        }
        const distToEnd = Math.abs(y - endY);
        if (distToEnd <= threshold && Math.abs(x - endX) <= 5) {
            return 'end';
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
                    if (!this._isPreview) {
                        ctx.fillStyle = this._fillColor + Math.round(this._fillOpacity * 255).toString(16).padStart(2, '0');
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, startY);
                        ctx.lineTo(endX, endY);
                        ctx.lineTo(startX, endY);
                        ctx.closePath();
                        ctx.fill();
                    }
                    ctx.beginPath();
                    ctx.moveTo(Math.min(startX, endX), startY);
                    ctx.lineTo(Math.max(startX, endX), startY);
                    ctx.moveTo(Math.min(startX, endX), endY);
                    ctx.lineTo(Math.max(startX, endX), endY);
                    ctx.stroke();
                    this.drawArrowLine(ctx, startX, startY, endX, endY);
                    if ((this._showHandles || this._isDragging || this._hoverPoint) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, type: 'start' | 'end', isActive: boolean = false) => {
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
                            ctx.textAlign = type === 'start' ? 'right' : 'left';
                            ctx.textBaseline = 'middle';
                            let infoText = '';
                            if (type === 'start') {
                                const price = this._startPrice.toFixed(2);
                                infoText = `${price}`;
                                ctx.fillText(infoText, x - 10, y);
                            } else if (type === 'end') {
                                const price = this._endPrice.toFixed(2);
                                infoText = `${price}`;
                                ctx.fillText(infoText, x + 10, y);
                            }
                            ctx.restore();
                        };
                        drawHandle(startX, startY, 'start', this._dragPoint === 'start' || this._hoverPoint === 'start');
                        drawHandle(endX, endY, 'end', this._dragPoint === 'end' || this._hoverPoint === 'end');
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private drawArrowLine(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
        const midX = (startX + endX) / 2;
        const arrowSize = 8;

        ctx.beginPath();
        ctx.moveTo(midX, Math.min(startY, endY));
        ctx.lineTo(midX, Math.max(startY, endY));
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = this._color;

        const isStartLower = this._startPrice < this._endPrice;
        if (isStartLower) {
            ctx.beginPath();
            ctx.moveTo(midX - arrowSize / 2, Math.max(startY, endY) - arrowSize);
            ctx.lineTo(midX, Math.max(startY, endY));
            ctx.lineTo(midX + arrowSize / 2, Math.max(startY, endY) - arrowSize);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(midX - arrowSize / 2, Math.min(startY, endY) + arrowSize);
            ctx.lineTo(midX, Math.min(startY, endY));
            ctx.lineTo(midX + arrowSize / 2, Math.min(startY, endY) + arrowSize);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    getStartPrice(): number {
        return this._startPrice;
    }

    getEndPrice(): number {
        return this._endPrice;
    }

    getStartTime(): number {
        return this._startTime;
    }

    getEndTime(): number {
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

    updateFillColor(fillColor: string) {
        this._fillColor = fillColor;
        this.requestUpdate();
    }

    updateFillOpacity(fillOpacity: number) {
        this._fillOpacity = Math.max(0, Math.min(1, fillOpacity));
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        fillColor?: string;
        fillOpacity?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.fillColor) this.updateFillColor(styles.fillColor);
        if (styles.fillOpacity !== undefined) this.updateFillOpacity(styles.fillOpacity);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            fillColor: this._fillColor,
            fillOpacity: this._fillOpacity,
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

    isPointInRect(x: number, y: number): boolean {
        const bounds = this.getBounds();
        if (!bounds) return false;

        return x >= bounds.minX && x <= bounds.maxX &&
            y >= bounds.minY && y <= bounds.maxY;
    }
}