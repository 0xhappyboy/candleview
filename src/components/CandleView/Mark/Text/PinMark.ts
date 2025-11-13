import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class PinMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _time: string;
    private _price: number;
    private _renderer: any;
    private _color: string;
    private _backgroundColor: string;
    private _textColor: string;
    private _fontSize: number;
    private _lineWidth: number;
    private _showBubble: boolean = false;
    private _bubbleText: string = "";
    private markType: MarkType = MarkType.Pin;

    constructor(
        time: string,
        price: number,
        color: string = '#3964FE',
        backgroundColor: string = 'rgba(57, 100, 254, 0.9)',
        textColor: string = '#FFFFFF',
        fontSize: number = 12,
        lineWidth: number = 2,
        bubbleText: string = ""
    ) {
        this._time = time;
        this._price = price;
        this._color = color;
        this._backgroundColor = backgroundColor;
        this._textColor = textColor;
        this._fontSize = fontSize;
        this._lineWidth = lineWidth;
        this._bubbleText = bubbleText;
    }

    updateLineStyle(lineStyle: "solid" | "dashed" | "dotted"): void {
        throw new Error("Method not implemented.");
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

    updatePosition(time: string, price: number) {
        this._time = time;
        this._price = price;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this.requestUpdate();
    }

    setDragging(isDragging: boolean) {
        this.requestUpdate();
    }

    setShowBubble(show: boolean) {
        this._showBubble = show;
        this.requestUpdate();
    }

    setBubbleText(text: string) {
        this._bubbleText = text;
        this.requestUpdate();
    }

    dragByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const currentX = timeScale.timeToCoordinate(this._time);
        const currentY = this._series.priceToCoordinate(this._price);
        if (currentX === null || currentY === null) return;
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        const newTime = timeScale.coordinateToTime(newX);
        const newPrice = this._series.coordinateToPrice(newY);
        if (newTime !== null && !isNaN(newPrice)) {
            this._time = newTime.toString();
            this._price = newPrice;
            this.requestUpdate();
        }
    }

    isPointNearPin(x: number, y: number, threshold: number = 20): boolean {
        if (!this._chart || !this._series) return false;
        const pinX = this._chart.timeScale().timeToCoordinate(this._time);
        const pinY = this._series.priceToCoordinate(this._price);
        if (pinX === null || pinY === null) return false;
        const pinWidth = 24;
        const pinHeight = 32;
        const pinRect = {
            x: pinX - pinWidth / 2,
            y: pinY - pinHeight,
            width: pinWidth,
            height: pinHeight
        };
        const inPin = x >= pinRect.x &&
            x <= pinRect.x + pinRect.width &&
            y >= pinRect.y &&
            y <= pinRect.y + pinRect.height;
        if (inPin) return true;
        if (this._showBubble) {
            const bubbleWidth = this._bubbleText.length * this._fontSize * 0.6 + 16;
            const bubbleHeight = this._fontSize + 12;
            const bubbleY = pinY - pinHeight - bubbleHeight - 10;
            const bubbleRect = {
                x: pinX - bubbleWidth / 2,
                y: bubbleY,
                width: bubbleWidth,
                height: bubbleHeight
            };
            const inBubble = x >= bubbleRect.x &&
                x <= bubbleRect.x + bubbleRect.width &&
                y >= bubbleRect.y &&
                y <= bubbleRect.y + bubbleRect.height;

            if (inBubble) return true;
        }
        return false;
    }

    private drawInvertedDropIcon(ctx: CanvasRenderingContext2D, x: number, y: number, width: number = 28, height: number = 38) {
        ctx.save();
        ctx.fillStyle = this._color;
        ctx.strokeStyle = this._color;
        ctx.lineWidth = this._lineWidth;
        ctx.beginPath();
        const topRadius = width / 2;
        const topCenterY = y - height + topRadius * 0.8;
        ctx.moveTo(x, topCenterY - topRadius);
        ctx.bezierCurveTo(
            x - topRadius * 1.0, topCenterY - topRadius * 0.6,
            x - topRadius * 0.8, topCenterY + topRadius * 0.8,
            x - topRadius * 0.3, y - topRadius * 0.3
        );
        ctx.quadraticCurveTo(x, y, x + topRadius * 0.3, y - topRadius * 0.3);
        ctx.bezierCurveTo(
            x + topRadius * 0.8, topCenterY + topRadius * 0.8,
            x + topRadius * 1.0, topCenterY - topRadius * 0.6,
            x, topCenterY - topRadius
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, topCenterY - topRadius * 0.1, width / 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
    }

    private drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
        if (!text) return;
        const padding = 8;
        const pointerHeight = 6;
        const textWidth = text.length * this._fontSize * 0.6;
        const textHeight = this._fontSize;
        const bubbleWidth = textWidth + padding * 2;
        const bubbleHeight = textHeight + padding * 2;
        const pinHeight = 32;
        const bubbleY = y - pinHeight - bubbleHeight - 10;
        const bubbleX = x - bubbleWidth / 2;
        ctx.fillStyle = this._backgroundColor;
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 4);
        ctx.fill();
        ctx.strokeStyle = this._color;
        ctx.lineWidth = this._lineWidth;
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 4);
        ctx.stroke();
        ctx.fillStyle = this._backgroundColor;
        ctx.beginPath();
        ctx.moveTo(x - 6, bubbleY + bubbleHeight);
        ctx.lineTo(x, bubbleY + bubbleHeight + pointerHeight);
        ctx.lineTo(x + 6, bubbleY + bubbleHeight);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this._color;
        ctx.lineWidth = this._lineWidth;
        ctx.beginPath();
        ctx.moveTo(x - 6, bubbleY + bubbleHeight);
        ctx.lineTo(x, bubbleY + bubbleHeight + pointerHeight);
        ctx.lineTo(x + 6, bubbleY + bubbleHeight);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = this._textColor;
        ctx.font = `${this._fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, bubbleY + bubbleHeight / 2);
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
        return this._time;
    }

    priceValue() {
        return this._price;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const pinX = this._chart.timeScale().timeToCoordinate(this._time);
                    const pinY = this._series.priceToCoordinate(this._price);
                    if (pinX === null || pinY === null) return;
                    ctx.save();
                    ctx.globalAlpha = 1.0;
                    if (this._showBubble && this._bubbleText) {
                        this.drawBubble(ctx, pinX, pinY, this._bubbleText);
                    }
                    this.drawInvertedDropIcon(ctx, pinX, pinY, 24, 32);
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getTime(): string {
        return this._time;
    }

    getPrice(): number {
        return this._price;
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

    updateLineWidth(lineWidth: number) {
        this._lineWidth = lineWidth;
        this.requestUpdate();
    }

    updateBubbleText(text: string) {
        this._bubbleText = text;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        backgroundColor?: string;
        textColor?: string;
        fontSize?: number;
        lineWidth?: number;
        bubbleText?: string;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.backgroundColor) this.updateBackgroundColor(styles.backgroundColor);
        if (styles.textColor) this.updateTextColor(styles.textColor);
        if (styles.fontSize) this.updateFontSize(styles.fontSize);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.bubbleText) this.updateBubbleText(styles.bubbleText);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor,
            fontSize: this._fontSize,
            lineWidth: this._lineWidth,
            bubbleText: this._bubbleText,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const pinX = this._chart.timeScale().timeToCoordinate(this._time);
        const pinY = this._series.priceToCoordinate(this._price);
        if (pinX === null || pinY === null) return null;

        const pinWidth = 24;
        const pinHeight = 32;
        let minY = pinY - pinHeight;
        let maxY = pinY;


        if (this._showBubble && this._bubbleText) {
            const bubbleHeight = this._fontSize + 12;
            minY = Math.min(minY, pinY - pinHeight - bubbleHeight - 10);
        }

        return {
            x: pinX,
            y: pinY,
            minX: pinX - pinWidth / 2,
            maxX: pinX + pinWidth / 2,
            minY: minY,
            maxY: maxY
        };
    }
}