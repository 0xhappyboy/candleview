import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class EmojiMark implements IGraph, IMarkStyle {
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
    private _fillColor: string = 'transparent';
    private _emoji: string = '😊';
    private _fontSize: number = 24;
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'line' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.Emoji;

    constructor(
        startTime: string,
        startPrice: number,
        endTime: string,
        endPrice: number,
        emoji: string = '😊',
        color: string = '#2962FF',
        lineWidth: number = 2,
        fillColor: string = 'rgba(41, 98, 255, 0.1)',
        fontSize: number = 24,
        isPreview: boolean = false
    ) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this._endTime = endTime;
        this._endPrice = endPrice;
        this._emoji = emoji;
        this._color = color;
        this._lineWidth = lineWidth;
        this._fillColor = fillColor;
        this._fontSize = fontSize;
        this._isPreview = isPreview;
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
            this._startTime = newStartTime.toString();
            this._startPrice = newStartPrice;
            this._endTime = newEndTime.toString();
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
        const width = endX - startX;
        const height = endY - startY;
        const rectWidth = Math.max(Math.abs(width), 30);
        const rectHeight = Math.max(Math.abs(height), 30);
        const actualStartX = width >= 0 ? startX : startX + width;
        const actualStartY = height >= 0 ? startY : startY + height;
        const topLeft = { x: actualStartX, y: actualStartY, type: 'start' as const };
        const bottomRight = { x: actualStartX + rectWidth, y: actualStartY + rectHeight, type: 'end' as const };
        const corners = [topLeft, bottomRight];
        for (const corner of corners) {
            const dist = Math.sqrt(Math.pow(x - corner.x, 2) + Math.pow(y - corner.y, 2));
            if (dist <= threshold) {
                return corner.type;
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
                    const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
                    const startY = this._series.priceToCoordinate(this._startPrice);
                    const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
                    const endY = this._series.priceToCoordinate(this._endPrice);
                    if (startX == null || startY == null || endX == null || endY == null) return;
                    ctx.save();
                    const width = endX - startX;
                    const height = endY - startY;
                    const rectWidth = Math.max(Math.abs(width), 30);
                    const rectHeight = Math.max(Math.abs(height), 30);
                    const actualStartX = width >= 0 ? startX : startX + width;
                    const actualStartY = height >= 0 ? startY : startY + height;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = this._color;
                    const centerX = actualStartX + rectWidth / 2;
                    const centerY = actualStartY + rectHeight / 2;
                    const fontSize = Math.max(
                        Math.min(rectWidth, rectHeight) - 10,
                        8
                    );
                    if (fontSize >= 8) {
                        ctx.font = `bold ${fontSize}px Arial, sans-serif, "Segoe UI Emoji", "Apple Color Emoji"`;
                        ctx.fillText(this._emoji, centerX, centerY);
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
                        drawHandle(actualStartX, actualStartY, this._dragPoint === 'start');
                        drawHandle(actualStartX + rectWidth, actualStartY + rectHeight, this._dragPoint === 'end');
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

    getEmoji(): string {
        return this._emoji;
    }

    updateEmoji(emoji: string) {
        this._emoji = emoji;
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

    updateFillColor(fillColor: string) {
        this._fillColor = fillColor;
        this.requestUpdate();
    }

    updateFontSize(fontSize: number) {
        this._fontSize = fontSize;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        fillColor?: string;
        emoji?: string;
        fontSize?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.fillColor) this.updateFillColor(styles.fillColor);
        if (styles.emoji) this.updateEmoji(styles.emoji);
        if (styles.fontSize) this.updateFontSize(styles.fontSize);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            fillColor: this._fillColor,
            emoji: this._emoji,
            fontSize: this._fontSize,
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

        if (this._fillColor !== 'transparent') {
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                return true;
            }
        }

        const nearLeftEdge = Math.abs(x - minX) <= threshold && y >= minY - threshold && y <= maxY + threshold;
        const nearRightEdge = Math.abs(x - maxX) <= threshold && y >= minY - threshold && y <= maxY + threshold;
        const nearTopEdge = Math.abs(y - minY) <= threshold && x >= minX - threshold && x <= maxX + threshold;
        const nearBottomEdge = Math.abs(y - maxY) <= threshold && x >= minX - threshold && x <= maxX + threshold;

        return nearLeftEdge || nearRightEdge || nearTopEdge || nearBottomEdge;
    }
}