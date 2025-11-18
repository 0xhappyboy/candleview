import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class LongPositionMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _startTime: number; 
    private _endTime: number; 
    private _upperPrice: number;
    private _lowerPrice: number;
    private _middlePrice: number;
    private _renderer: any;
    private _color: string = '#000000';
    private _lineWidth: number = 2;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'middle' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.LongPosition;
    private _hoverPoint: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'middle' | null = null;
    private _upperFillColor: string = '#00FF00';
    private _lowerFillColor: string = '#FF0000';
    private _fillOpacity: number = 0.2;

    constructor(
        startTime: number, 
        endTime: number, 
        upperPrice: number,
        lowerPrice: number,
        color: string = '#000000',
        lineWidth: number = 2,
        isPreview: boolean = false,
        upperFillColor?: string,
        lowerFillColor?: string
    ) {
        this._startTime = startTime;
        this._endTime = endTime;
        this._upperPrice = upperPrice;
        this._lowerPrice = lowerPrice;
        this._middlePrice = (upperPrice + lowerPrice) / 2;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._upperFillColor = upperFillColor || '#00FF00';
        this._lowerFillColor = lowerFillColor || '#FF0000';
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

    updatePrices(upperPrice: number, lowerPrice: number) {
        this._upperPrice = upperPrice;
        this._lowerPrice = lowerPrice;
        this.requestUpdate();
    }

    updateTimeRange(startTime: number, endTime: number) { 
        this._startTime = startTime;
        this._endTime = endTime;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'middle' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    setHoverPoint(hoverPoint: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'middle' | null) {
        this._hoverPoint = hoverPoint;
        this.requestUpdate();
    }

    dragByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const upperY = this._series.priceToCoordinate(this._upperPrice);
        const lowerY = this._series.priceToCoordinate(this._lowerPrice);
        const middleY = this._series.priceToCoordinate(this._middlePrice);
        if (startX === null || endX === null || upperY === null || lowerY === null || middleY === null) return;
        const newStartX = startX + deltaX;
        const newEndX = endX + deltaX;
        const newUpperY = upperY + deltaY;
        const newLowerY = lowerY + deltaY;
        const newMiddleY = middleY + deltaY;
        const newStartTime = this._chart.timeScale().coordinateToTime(newStartX);
        const newEndTime = this._chart.timeScale().coordinateToTime(newEndX);
        const newUpperPrice = this._series.coordinateToPrice(newUpperY);
        const newLowerPrice = this._series.coordinateToPrice(newLowerY);
        const newMiddlePrice = this._series.coordinateToPrice(newMiddleY);
        if (newStartTime !== null && newEndTime !== null && !isNaN(newUpperPrice) && !isNaN(newLowerPrice) && !isNaN(newMiddlePrice)) {
            this._startTime = newStartTime; 
            this._endTime = newEndTime; 
            this._upperPrice = newUpperPrice;
            this._lowerPrice = newLowerPrice;
            this._middlePrice = newMiddlePrice;
            this.requestUpdate();
        }
    }

    adjustByHandle(handleType: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'middle', newTime: number, newPrice: number) { 
        if (!this._chart || !this._series) return;

        switch (handleType) {
            case 'top-left':
                this._startTime = newTime;
                this._upperPrice = newPrice;
                break;
            case 'top-right':
                this._endTime = newTime;
                this._upperPrice = newPrice;
                break;
            case 'bottom-left':
                this._startTime = newTime;
                this._lowerPrice = newPrice;
                break;
            case 'bottom-right':
                this._endTime = newTime;
                this._lowerPrice = newPrice;
                break;
            case 'middle':
                const constrainedPrice = Math.max(
                    this._lowerPrice,
                    Math.min(this._upperPrice, newPrice)
                );
                this._middlePrice = constrainedPrice;
                break;
        }
        this.requestUpdate();
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'middle' | null {
        if (!this._chart || !this._series) return null;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const upperY = this._series.priceToCoordinate(this._upperPrice);
        const middleY = this._series.priceToCoordinate(this._middlePrice);
        const lowerY = this._series.priceToCoordinate(this._lowerPrice);
        if (startX == null || endX == null || upperY == null || middleY == null || lowerY == null) return null;
        const points = [
            { type: 'top-left' as const, x: startX, y: upperY },
            { type: 'top-right' as const, x: endX, y: upperY },
            { type: 'bottom-left' as const, x: startX, y: lowerY },
            { type: 'bottom-right' as const, x: endX, y: lowerY },
            { type: 'middle' as const, x: (startX + endX) / 2, y: middleY }
        ];
        for (const point of points) {
            const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (dist <= threshold) {
                return point.type;
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
        return this._middlePrice;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
                    const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
                    const upperY = this._series.priceToCoordinate(this._upperPrice);
                    const middleY = this._series.priceToCoordinate(this._middlePrice);
                    const lowerY = this._series.priceToCoordinate(this._lowerPrice);
                    if (startX == null || endX == null || upperY == null || middleY == null || lowerY == null) return;
                    ctx.save();
                    ctx.globalAlpha = 1.0;
                    
                    ctx.fillStyle = this._upperFillColor + Math.round(this._fillOpacity * 255).toString(16).padStart(2, '0');
                    ctx.beginPath();
                    ctx.rect(startX, upperY, endX - startX, middleY - upperY);
                    ctx.fill();
                    
                    ctx.fillStyle = this._lowerFillColor + Math.round(this._fillOpacity * 255).toString(16).padStart(2, '0');
                    ctx.beginPath();
                    ctx.rect(startX, middleY, endX - startX, lowerY - middleY);
                    ctx.fill();
                    ctx.strokeStyle = '#3964FE';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(startX, middleY);
                    ctx.lineTo(endX, middleY);
                    ctx.stroke();
                    if ((this._showHandles || this._isDragging || this._hoverPoint) && !this._isPreview) {
                        this.drawHandles(ctx, startX, endX, upperY, middleY, lowerY);
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private drawHandles(ctx: CanvasRenderingContext2D, startX: number, endX: number, upperY: number, middleY: number, lowerY: number) {
        this.drawCornerHandle(ctx, startX, upperY, 'top-left');
        this.drawCornerHandle(ctx, endX, upperY, 'top-right');
        this.drawCornerHandle(ctx, startX, lowerY, 'bottom-left');
        this.drawCornerHandle(ctx, endX, lowerY, 'bottom-right');
        this.drawMiddleHandle(ctx, (startX + endX) / 2, middleY);
    }

    private drawCornerHandle(ctx: CanvasRenderingContext2D, x: number, y: number, type: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') {
        ctx.save();
        ctx.fillStyle = '#3964FE';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        if (this._dragPoint === type || this._hoverPoint === type) {
            ctx.strokeStyle = '#3964FE';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        let infoText = '';
        if (type === 'top-left' || type === 'top-right') {
            const price = this._upperPrice.toFixed(2);
            infoText = `${price}`;
        } else if (type === 'bottom-left' || type === 'bottom-right') {
            const price = this._lowerPrice.toFixed(2);
            infoText = `${price}`;
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const textWidth = ctx.measureText(infoText).width;
        ctx.fillRect(x - textWidth / 2 - 5, y - 25, textWidth + 10, 18);
        ctx.fillStyle = '#333333';
        ctx.fillText(infoText, x, y - 10);
        ctx.restore();
    }

    private drawMiddleHandle(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        ctx.fillStyle = '#3964FE';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        if (this._dragPoint === 'middle' || this._hoverPoint === 'middle') {
            ctx.strokeStyle = '#3964FE';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const upperPrice = this._upperPrice.toFixed(2);
        const middlePrice = this._middlePrice.toFixed(2);
        const lowerPrice = this._lowerPrice.toFixed(2);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        const upperTextWidth = ctx.measureText(`TP: ${upperPrice}`).width;
        ctx.fillRect(x - upperTextWidth / 2 - 5, y - 60, upperTextWidth + 10, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`TP: ${upperPrice}`, x, y - 45);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        const middleTextWidth = ctx.measureText(`Entry: ${middlePrice}`).width;
        ctx.fillRect(x - middleTextWidth / 2 - 5, y - 25, middleTextWidth + 10, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Entry: ${middlePrice}`, x, y - 10);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        const lowerTextWidth = ctx.measureText(`SL: ${lowerPrice}`).width;
        ctx.fillRect(x - lowerTextWidth / 2 - 5, y + 10, lowerTextWidth + 10, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`SL: ${lowerPrice}`, x, y + 25);
        ctx.restore();
    }

    getStartTime(): number { 
        return this._startTime;
    }

    getEndTime(): number { 
        return this._endTime;
    }

    getUpperPrice(): number {
        return this._upperPrice;
    }

    getLowerPrice(): number {
        return this._lowerPrice;
    }

    getMiddlePrice(): number {
        return this._middlePrice;
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

    updateUpperFillColor(upperFillColor: string) {
        this._upperFillColor = upperFillColor;
        this.requestUpdate();
    }

    updateLowerFillColor(lowerFillColor: string) {
        this._lowerFillColor = lowerFillColor;
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
        upperFillColor?: string;
        lowerFillColor?: string;
        fillOpacity?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.upperFillColor) this.updateUpperFillColor(styles.upperFillColor);
        if (styles.lowerFillColor) this.updateLowerFillColor(styles.lowerFillColor);
        if (styles.fillOpacity !== undefined) this.updateFillOpacity(styles.fillOpacity);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            upperFillColor: this._upperFillColor,
            lowerFillColor: this._lowerFillColor,
            fillOpacity: this._fillOpacity,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;

        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const upperY = this._series.priceToCoordinate(this._upperPrice);
        const lowerY = this._series.priceToCoordinate(this._lowerPrice);

        if (startX == null || endX == null || upperY == null || lowerY == null) return null;

        return {
            startX, endX, upperY, lowerY,
            minX: Math.min(startX, endX),
            maxX: Math.max(startX, endX),
            minY: Math.min(upperY, lowerY),
            maxY: Math.max(upperY, lowerY)
        };
    }

    isPointInRect(x: number, y: number): boolean {
        const bounds = this.getBounds();
        if (!bounds) return false;

        return x >= bounds.minX && x <= bounds.maxX &&
            y >= bounds.minY && y <= bounds.maxY;
    }
}