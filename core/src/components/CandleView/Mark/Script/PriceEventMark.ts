import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export interface PriceEventConfig {
    price: number;
    time?: number;
    title?: string;
    description?: string;
    color?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    padding?: number;
    arrowWidth?: number;
    borderRadius?: number;
    isPreview?: boolean;
    showPrice?: boolean;
    priceFormat?: string | ((price: number) => string);
}

export class PriceEventMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _price: number;
    private _time: number;
    private _title: string;
    private _description: string;
    private _color: string;
    private _backgroundColor: string;
    private _textColor: string;
    private _fontSize: number;
    private _padding: number;
    private _arrowWidth: number;
    private _borderRadius: number;
    private _isPreview: boolean;
    private _renderer: any;
    private _showHandles: boolean = false;
    private _isDragging: boolean = false;
    private markType: MarkType = MarkType.PriceEvent;
    private _leftMargin: number = 28;
    private _showPrice: boolean = true;
    private _priceFormat: string | ((price: number) => string) = "0.00";

    constructor(config: PriceEventConfig) {
        this._price = config.price;
        this._time = config.time || Date.now();
        this._title = config.title || '';
        this._description = config.description || '';
        this._color = config.color || '#FF5722';
        this._backgroundColor = config.backgroundColor || '#FFFFFF';
        this._textColor = config.textColor || '#333333';
        this._fontSize = config.fontSize || 12;
        this._padding = config.padding || 8;
        this._arrowWidth = config.arrowWidth || 6;
        this._borderRadius = config.borderRadius || 4;
        this._isPreview = config.isPreview || false;
        this._showPrice = config.showPrice !== undefined ? config.showPrice : true;
        this._priceFormat = config.priceFormat || "0.00";
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

    updatePrice(price: number) {
        this._price = price;
        this.requestUpdate();
    }

    updateTime(time: number) {
        this._time = time;
        this.requestUpdate();
    }

    updateTitle(title: string) {
        this._title = title;
        this.requestUpdate();
    }

    updateDescription(description: string) {
        this._description = description;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean) {
        this._isDragging = isDragging;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    setLeftMargin(margin: number) {
        this._leftMargin = margin;
        this.requestUpdate();
    }

    setShowPrice(show: boolean) {
        this._showPrice = show;
        this.requestUpdate();
    }

    setPriceFormat(format: string | ((price: number) => string)) {
        this._priceFormat = format;
        this.requestUpdate();
    }

    private formatPrice(price: number): string {
        if (typeof this._priceFormat === 'function') {
            return this._priceFormat(price);
        } else {
            return price.toFixed(parseInt(this._priceFormat) || 2);
        }
    }

    isPointNear(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;
        const bubbleBounds = this.getBubbleBounds();
        if (!bubbleBounds) return false;
        const { minX, maxX, minY, maxY } = bubbleBounds;
        return x >= minX - threshold &&
            x <= maxX + threshold &&
            y >= minY - threshold &&
            y <= maxY + threshold;
    }

    dragByPixels(deltaY: number) {
        if (isNaN(deltaY) || !this._series) return;
        const currentY = this._series.priceToCoordinate(this._price);
        if (currentY === null) return;
        const newY = currentY + deltaY;
        const newPrice = this._series.coordinateToPrice(newY);
        if (newPrice !== null) {
            this._price = newPrice;
            this.requestUpdate();
        }
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

    price() {
        return this._price;
    }

    timeValue() {
        return this._time;
    }

    getBubbleBounds() {
        if (!this._series) return null;
        const bubbleY = this._series.priceToCoordinate(this._price);
        if (bubbleY === null) return null;
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) return null;
        ctx.font = `${this._fontSize}px Arial`;
        const displayTitle = this._showPrice ? `${this._title}${this.formatPrice(this._price)}` : this._title;
        const titleWidth = ctx.measureText(displayTitle).width;
        const descWidth = this._description ? ctx.measureText(this._description).width : 0;
        const maxTextWidth = Math.max(titleWidth, descWidth);
        const bubbleWidth = maxTextWidth + this._padding * 2 + 20;
        const lineHeight = this._fontSize + 4;
        let bubbleHeight = this._padding * 2;
        bubbleHeight += lineHeight;
        if (this._description) {
            bubbleHeight += lineHeight;
        }
        const chartElement = this._chart?.chartElement();
        const chartWidth = chartElement?.clientWidth || 0;
        const rightMargin = 10;
        const bubbleBoxX = chartWidth - bubbleWidth - this._arrowWidth - rightMargin - 60;
        const arrowX = bubbleBoxX + bubbleWidth;
        const totalWidth = bubbleWidth + this._arrowWidth;
        return {
            x: bubbleBoxX,
            y: bubbleY,
            width: totalWidth,
            height: bubbleHeight,
            minX: bubbleBoxX,
            maxX: arrowX + this._arrowWidth,
            minY: bubbleY - bubbleHeight / 2,
            maxY: bubbleY + bubbleHeight / 2
        };
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._series) return;
                    const bubbleY = this._series.priceToCoordinate(this._price);
                    if (bubbleY === null) return;
                    ctx.save();
                    ctx.font = `${this._fontSize}px Arial`;
                    const displayTitle = this._showPrice ? `${this._title}${this.formatPrice(this._price)}` : this._title;
                    const titleWidth = ctx.measureText(displayTitle).width;
                    const descWidth = this._description ? ctx.measureText(this._description).width : 0;
                    const maxTextWidth = Math.max(titleWidth, descWidth);
                    const bubbleWidth = maxTextWidth + this._padding * 2 + 20;
                    const lineHeight = this._fontSize + 4;
                    let bubbleHeight = this._padding * 2;
                    bubbleHeight += lineHeight;
                    if (this._description) {
                        bubbleHeight += lineHeight;
                    }
                    const chartElement = this._chart?.chartElement();
                    const chartWidth = chartElement?.clientWidth || 0;
                    const rightMargin = 10;
                    const bubbleBoxX = chartWidth - bubbleWidth - this._arrowWidth - rightMargin - 60;
                    ctx.fillStyle = this._color;
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(
                        bubbleBoxX,
                        bubbleY - bubbleHeight / 2,
                        bubbleWidth,
                        bubbleHeight,
                        this._borderRadius
                    );
                    ctx.fill();
                    ctx.stroke();
                    const arrowX = bubbleBoxX + bubbleWidth + 6;
                    ctx.fillStyle = this._color;
                    ctx.beginPath();
                    ctx.moveTo(arrowX, bubbleY);
                    ctx.lineTo(arrowX - this._arrowWidth, bubbleY - this._arrowWidth);
                    ctx.lineTo(arrowX - this._arrowWidth, bubbleY + this._arrowWidth);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#FFFFFF';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    const textX = bubbleBoxX + this._padding;
                    const titleY = bubbleY - (this._description ? lineHeight / 2 : 0);
                    ctx.font = `${this._fontSize}px Arial`;
                    ctx.fillText(displayTitle, textX, titleY);
                    if (this._description) {
                        const descY = bubbleY + lineHeight / 2;
                        ctx.font = `${this._fontSize - 2}px Arial`;
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillText(this._description, textX, descY);
                    }
                    ctx.restore();
                }
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    updateColor(color: string) {
        this._color = color;
        this.requestUpdate();
    }

    updateBackgroundColor(backgroundColor: string) {
        this._backgroundColor = backgroundColor;
        this.requestUpdate();
    }

    updateTextColor(textColor: string) {
        this._textColor = textColor;
        this.requestUpdate();
    }

    updateFontSize(fontSize: number) {
        this._fontSize = fontSize;
        this.requestUpdate();
    }

    updateStyles(styles: {
        color?: string;
        backgroundColor?: string;
        textColor?: string;
        fontSize?: number;
        padding?: number;
        arrowWidth?: number;
        borderRadius?: number;
        leftMargin?: number;
        showPrice?: boolean;
        priceFormat?: string | ((price: number) => string);
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.backgroundColor) this.updateBackgroundColor(styles.backgroundColor);
        if (styles.textColor) this.updateTextColor(styles.textColor);
        if (styles.fontSize) this.updateFontSize(styles.fontSize);
        if (styles.padding) this._padding = styles.padding;
        if (styles.arrowWidth) this._arrowWidth = styles.arrowWidth;
        if (styles.borderRadius) this._borderRadius = styles.borderRadius;
        if (styles.leftMargin !== undefined) this._leftMargin = styles.leftMargin;
        if (styles.showPrice !== undefined) this._showPrice = styles.showPrice;
        if (styles.priceFormat !== undefined) this._priceFormat = styles.priceFormat;
        this.requestUpdate();
    }

    getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor,
            fontSize: this._fontSize,
            padding: this._padding,
            arrowWidth: this._arrowWidth,
            borderRadius: this._borderRadius,
            leftMargin: this._leftMargin,
            showPrice: this._showPrice,
            priceFormat: this._priceFormat
        };
    }
}