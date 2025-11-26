import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class ImageMark implements IGraph, IMarkStyle {
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
    private _fillColor: string = 'transparent';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'line' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.Image;
    private _image: HTMLImageElement | null = null;
    private _imageUrl: string = '';
    private _opacity: number = 1.0;

    constructor(
        startTime: number,
        startPrice: number,
        endTime: number,
        endPrice: number,
        imageUrl: string = '',
        color: string = '#2962FF',
        lineWidth: number = 2,
        fillColor: string = 'transparent',
        opacity: number = 1.0,
        isPreview: boolean = false
    ) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this._endTime = endTime;
        this._endPrice = endPrice;
        this._color = color;
        this._lineWidth = lineWidth;
        this._fillColor = fillColor;
        this._opacity = opacity;
        this._isPreview = isPreview;
        if (imageUrl) {
            this.loadImage(imageUrl);
        }
    }

    private loadImage(url: string): void {
        this._image = new Image();
        this._imageUrl = url;
        this._image.onload = () => {
            this.requestUpdate();
        };
        this._image.onerror = () => {
            console.error('Failed to load image:', url);
            this._image = null;
        };
        this._image.src = url;
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

    setImage(url: string): void {
        this.loadImage(url);
    }

    setOpacity(opacity: number): void {
        this._opacity = Math.max(0, Math.min(1, opacity));
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
                    const width = endX - startX;
                    const height = endY - startY;
                    ctx.save();
                    if (this._image && this._image.complete && this._image.naturalWidth > 0) {
                        ctx.globalAlpha = this._opacity * (this._isPreview ? 0.7 : 1.0);
                        ctx.drawImage(this._image, startX, startY, width, height);
                    }
                    ctx.globalAlpha = this._isPreview ? 0.7 : 1.0;
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    if (this._isPreview) {
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
                    if (this._isDragging) {
                        ctx.globalAlpha = 0.7;
                    }
                    ctx.beginPath();
                    ctx.rect(startX, startY, width, height);
                    ctx.stroke();
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
                        drawHandle(endX, startY, false);
                        drawHandle(startX, endY, false);
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

    getImageUrl(): string {
        return this._imageUrl;
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

    updateFillColor(fillColor: string) {
        this._fillColor = fillColor;
        this.requestUpdate();
    }

    updateOpacity(opacity: number): void {
        this._opacity = Math.max(0, Math.min(1, opacity));
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        fillColor?: string;
        opacity?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.fillColor) this.updateFillColor(styles.fillColor);
        if (styles.opacity !== undefined) this.updateOpacity(styles.opacity);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            fillColor: this._fillColor,
            opacity: this._opacity,
            imageUrl: this._imageUrl
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

    isPointInRectangle(x: number, y: number, threshold: number = 15): boolean {
        const bounds = this.getBounds();
        if (!bounds) return false;
        const { minX, maxX, minY, maxY } = bounds;
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            return true;
        }
        const nearLeftEdge = Math.abs(x - minX) <= threshold && y >= minY - threshold && y <= maxY + threshold;
        const nearRightEdge = Math.abs(x - maxX) <= threshold && y >= minY - threshold && y <= maxY + threshold;
        const nearTopEdge = Math.abs(y - minY) <= threshold && x >= minX - threshold && x <= maxX + threshold;
        const nearBottomEdge = Math.abs(y - maxY) <= threshold && x >= minX - threshold && x <= maxX + threshold;
        return nearLeftEdge || nearRightEdge || nearTopEdge || nearBottomEdge;
    }
}