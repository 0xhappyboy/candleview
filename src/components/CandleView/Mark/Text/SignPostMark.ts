import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";
import { MarkType } from "../../types";

export class SignPostMark implements IGraph, IGraphStyle {
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
    private _text: string;
    private markType: MarkType = MarkType.SignPost;
    private _lineLength: number = 100;

    constructor(
        time: string,
        price: number,
        text: string = "",
        color: string = '#FFFFFF',
        backgroundColor: string = '#FFFFFF',
        textColor: string = '#FFFFFF',
        fontSize: number = 12,
        lineWidth: number = 2,
    ) {
        this._time = time;
        this._price = price;
        this._text = text;
        this._color = color;
        this._backgroundColor = backgroundColor;
        this._textColor = textColor;
        this._fontSize = fontSize;
        this._lineWidth = lineWidth;
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

    updateText(text: string) {
        this._text = text;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this.requestUpdate();
    }

    setDragging(isDragging: boolean) {
        this.requestUpdate();
    }

    setShowLabel(show: boolean) {
        this.requestUpdate();
    }

    public dragByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const currentX = timeScale.timeToCoordinate(this._time);
        if (currentX === null) return;
        const newX = currentX + deltaX;
        const newTime = timeScale.coordinateToTime(newX);
        if (newTime !== null) {
            const snappedData = this.snapToNearestBar(newTime.toString());
            this._time = snappedData.time;
            this._price = snappedData.price;
            if (deltaY !== 0) {
                this._lineLength = Math.max(10, this._lineLength - deltaY);
            }
            this.requestUpdate();
        }
    }

    isPointNearLabel(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;
        const labelX = this._chart.timeScale().timeToCoordinate(this._time);
        const labelY = this._series.priceToCoordinate(this._price);
        if (labelX === null || labelY === null) return false;
        const pointerLength = this._lineLength;
        const padding = 8;
        const textWidth = this._text.length * this._fontSize * 0.6;
        const textHeight = this._fontSize;
        const bubbleRect = {
            x: labelX - textWidth / 2 - padding,
            y: labelY - pointerLength - textHeight - padding * 2,
            width: textWidth + padding * 2,
            height: textHeight + padding * 2
        };
        const inBubble = x >= bubbleRect.x &&
            x <= bubbleRect.x + bubbleRect.width &&
            y >= bubbleRect.y &&
            y <= bubbleRect.y + bubbleRect.height;
        if (inBubble) return true;
        const lineThreshold = 8;
        const inLine = Math.abs(x - labelX) <= lineThreshold &&
            y >= labelY - pointerLength &&
            y <= labelY;
        return inLine;
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
                    const labelX = this._chart.timeScale().timeToCoordinate(this._time);
                    const labelY = this._series.priceToCoordinate(this._price);
                    if (labelX === null || labelY === null) return;
                    ctx.save();
                    ctx.globalAlpha = 1.0;
                    const pointerLength = this._lineLength;
                    const padding = 8;
                    const textWidth = this._text.length * this._fontSize * 0.6;
                    const textHeight = this._fontSize;
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = 1;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 2;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.beginPath();
                    ctx.moveTo(labelX, labelY);
                    ctx.lineTo(labelX, labelY - pointerLength);
                    ctx.stroke();
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    const bubbleRect = {
                        x: labelX - textWidth / 2 - padding,
                        y: labelY - pointerLength - textHeight - padding * 2,
                        width: textWidth + padding * 2,
                        height: textHeight + padding * 2
                    };
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 2;
                    ctx.fillStyle = '#FFFFFF';
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.beginPath();
                    ctx.roundRect(bubbleRect.x, bubbleRect.y, bubbleRect.width, bubbleRect.height, 4);
                    ctx.fill();
                    ctx.stroke();
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.fillStyle = '#000000';
                    ctx.font = `${this._fontSize}px Arial, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        this._text,
                        labelX,
                        bubbleRect.y + bubbleRect.height / 2
                    );
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

    getText(): string {
        return this._text;
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

    public updateStyles(styles: {
        color?: string;
        backgroundColor?: string;
        textColor?: string;
        fontSize?: number;
        lineWidth?: number;
        text?: string;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.backgroundColor) this.updateBackgroundColor(styles.backgroundColor);
        if (styles.textColor) this.updateTextColor(styles.textColor);
        if (styles.fontSize) this.updateFontSize(styles.fontSize);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.text) this.updateText(styles.text);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor,
            fontSize: this._fontSize,
            lineWidth: this._lineWidth,
            text: this._text,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const labelX = this._chart.timeScale().timeToCoordinate(this._time);
        const labelY = this._series.priceToCoordinate(this._price);
        if (labelX === null || labelY === null) return null;
        const pointerLength = 25;
        const padding = 8;
        const textWidth = this._text.length * this._fontSize * 0.6;
        const textHeight = this._fontSize;
        return {
            x: labelX,
            y: labelY,
            minX: labelX - textWidth / 2 - padding,
            maxX: labelX + textWidth / 2 + padding,
            minY: labelY - pointerLength - textHeight - padding * 2,
            maxY: labelY
        };
    }

    /**
     * 吸附到最近的K线
     */
    public snapToNearestBar(targetTime: string): { time: string; price: number } {
        if (!this._series) {
            return { time: targetTime, price: this._price };
        }
        try {
            const seriesData = this._series.data();
            if (!seriesData || seriesData.length === 0) {
                return { time: targetTime, price: this._price };
            }
            let nearestBar = null;
            let minTimeDiff = Number.MAX_SAFE_INTEGER;
            const targetTimestamp = new Date(targetTime).getTime();
            for (const bar of seriesData) {
                const barTimestamp = new Date(bar.time).getTime();
                const timeDiff = Math.abs(barTimestamp - targetTimestamp);
                if (timeDiff < minTimeDiff) {
                    minTimeDiff = timeDiff;
                    nearestBar = bar;
                }
            }
            if (nearestBar) {
                return {
                    time: nearestBar.time,
                    price: nearestBar.close || nearestBar.value || this._price
                };
            }
        } catch (error) {
            console.error('Error snapping to nearest bar:', error);
        }

        return { time: targetTime, price: this._price };
    }

    public static createWithSnap(time: string, price: number, text?: string): SignPostMark {
        const tempMark = new SignPostMark(time, price, text);
        const snappedData = tempMark.snapToNearestBar(time);
        return new SignPostMark(snappedData.time, snappedData.price, text);
    }
}