import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class BubbleBoxMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _controlPointTime: string;
    private _controlPointPrice: number;
    private _bubbleTime: string;
    private _bubblePrice: number;
    private _renderer: any;
    private _color: string;
    private _backgroundColor: string;
    private _textColor: string;
    private _fontSize: number;
    private _lineWidth: number;
    private _text: string;
    private _isDraggingControlPoint: boolean = false;
    private _isDraggingBubble: boolean = false;
    private markType: MarkType = MarkType.BubbleBox;

    constructor(
        controlPointTime: string,
        controlPointPrice: number,
        bubbleTime: string,
        bubblePrice: number,
        text: string = '',
        color: string = '#2962FF',
        backgroundColor: string = 'rgba(41, 98, 255)',
        textColor: string = '#FFFFFF',
        fontSize: number = 12,
        lineWidth: number = 1,
    ) {
        this._controlPointTime = controlPointTime;
        this._controlPointPrice = controlPointPrice;
        this._bubbleTime = bubbleTime;
        this._bubblePrice = bubblePrice;
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

    updateControlPointPosition(time: string, price: number) {
        this._controlPointTime = time;
        this._controlPointPrice = price;
        this.requestUpdate();
    }

    updateBubblePosition(time: string, price: number) {
        this._bubbleTime = time;
        this._bubblePrice = price;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this.requestUpdate();
    }

    setDraggingControlPoint(isDragging: boolean) {
        this._isDraggingControlPoint = isDragging;
        this.requestUpdate();
    }

    setDraggingBubble(isDragging: boolean) {
        this._isDraggingBubble = isDragging;
        this.requestUpdate();
    }

    setShowLabel(show: boolean) {
        this.requestUpdate();
    }

    dragControlPointByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;

        const timeScale = this._chart.timeScale();
        const currentX = timeScale.timeToCoordinate(this._controlPointTime);
        const currentY = this._series.priceToCoordinate(this._controlPointPrice);
        if (currentX === null || currentY === null) return;

        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        const newTime = timeScale.coordinateToTime(newX);
        const newPrice = this._series.coordinateToPrice(newY);

        if (newTime !== null && !isNaN(newPrice)) {
            this._controlPointTime = newTime.toString();
            this._controlPointPrice = newPrice;
            this.requestUpdate();
        }
    }

    dragBubbleByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;

        const timeScale = this._chart.timeScale();
        const currentX = timeScale.timeToCoordinate(this._bubbleTime);
        const currentY = this._series.priceToCoordinate(this._bubblePrice);
        if (currentX === null || currentY === null) return;

        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        const newTime = timeScale.coordinateToTime(newX);
        const newPrice = this._series.coordinateToPrice(newY);

        if (newTime !== null && !isNaN(newPrice)) {
            this._bubbleTime = newTime.toString();
            this._bubblePrice = newPrice;
            this.requestUpdate();
        }
    }

    isPointNearControlPoint(x: number, y: number, threshold: number = 8): boolean {
        if (!this._chart || !this._series) return false;

        const controlX = this._chart.timeScale().timeToCoordinate(this._controlPointTime);
        const controlY = this._series.priceToCoordinate(this._controlPointPrice);
        if (controlX === null || controlY === null) return false;

        const distance = Math.sqrt(Math.pow(x - controlX, 2) + Math.pow(y - controlY, 2));
        return distance <= threshold;
    }

    isPointNearBubble(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;

        const bubbleX = this._chart.timeScale().timeToCoordinate(this._bubbleTime);
        const bubbleY = this._series.priceToCoordinate(this._bubblePrice);
        if (bubbleX === null || bubbleY === null) return false;

        const padding = 12;
        const textWidth = this._text.length * this._fontSize * 0.6;
        const textHeight = this._fontSize;

        const bubbleRect = {
            x: bubbleX - textWidth / 2 - padding,
            y: bubbleY - textHeight / 2 - padding,
            width: textWidth + padding * 2,
            height: textHeight + padding * 2
        };

        return x >= bubbleRect.x &&
            x <= bubbleRect.x + bubbleRect.width &&
            y >= bubbleRect.y &&
            y <= bubbleRect.y + bubbleRect.height;
    }

    isPointNearConnectionLine(x: number, y: number, threshold: number = 4): boolean {
        if (!this._chart || !this._series) return false;

        const controlX = this._chart.timeScale().timeToCoordinate(this._controlPointTime);
        const controlY = this._series.priceToCoordinate(this._controlPointPrice);
        const bubbleX = this._chart.timeScale().timeToCoordinate(this._bubbleTime);
        const bubbleY = this._series.priceToCoordinate(this._bubblePrice);

        if (controlX === null || controlY === null || bubbleX === null || bubbleY === null) return false;

        return this.pointToLineDistance(x, y, controlX, controlY, bubbleX, bubbleY) <= threshold;
    }

    private pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
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

    controlPointTime(): string {
        return this._controlPointTime;
    }

    controlPointPrice(): number {
        return this._controlPointPrice;
    }

    bubbleTime(): string {
        return this._bubbleTime;
    }

    bubblePrice(): number {
        return this._bubblePrice;
    }


    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const controlX = this._chart.timeScale().timeToCoordinate(this._controlPointTime);
                    const controlY = this._series.priceToCoordinate(this._controlPointPrice);
                    const bubbleX = this._chart.timeScale().timeToCoordinate(this._bubbleTime);
                    const bubbleY = this._series.priceToCoordinate(this._bubblePrice);
                    if (controlX === null || controlY === null || bubbleX === null || bubbleY === null) return;
                    ctx.save();
                    ctx.globalAlpha = 1.0;
                    ctx.strokeStyle = this._color;
                    ctx.fillStyle = this._backgroundColor;
                    ctx.lineWidth = this._lineWidth;
                    ctx.setLineDash([]);
                    const angle = Math.atan2(bubbleY - controlY, bubbleX - controlX);
                    const triangleBaseWidth = 20;
                    const tipX = controlX;
                    const tipY = controlY;
                    const perpendicularAngle = angle + Math.PI / 2;
                    const base1X = bubbleX + Math.cos(perpendicularAngle) * triangleBaseWidth / 2;
                    const base1Y = bubbleY + Math.sin(perpendicularAngle) * triangleBaseWidth / 2;
                    const base2X = bubbleX - Math.cos(perpendicularAngle) * triangleBaseWidth / 2;
                    const base2Y = bubbleY - Math.sin(perpendicularAngle) * triangleBaseWidth / 2;
                    ctx.beginPath();
                    ctx.moveTo(tipX, tipY);
                    ctx.lineTo(base1X, base1Y);
                    ctx.lineTo(base2X, base2Y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(tipX, tipY);
                    ctx.lineTo(base1X, base1Y);
                    ctx.lineTo(base2X, base2Y);
                    ctx.closePath();
                    ctx.stroke();
                    this.drawControlPoint(ctx, controlX, controlY);
                    const padding = 12;
                    const textWidth = this._text.length * this._fontSize * 0.6;
                    const textHeight = this._fontSize;
                    const bubbleRect = {
                        x: bubbleX - textWidth / 2 - padding,
                        y: bubbleY - textHeight / 2 - padding,
                        width: textWidth + padding * 2,
                        height: textHeight + padding * 2
                    };
                    ctx.fillStyle = this._backgroundColor;
                    ctx.beginPath();
                    ctx.roundRect(bubbleRect.x, bubbleRect.y, bubbleRect.width, bubbleRect.height, 6);
                    ctx.fill();
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.beginPath();
                    ctx.roundRect(bubbleRect.x, bubbleRect.y, bubbleRect.width, bubbleRect.height, 6);
                    ctx.stroke();
                    ctx.fillStyle = this._textColor;
                    ctx.font = `${this._fontSize}px Arial, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(this._text, bubbleX, bubbleY);
                    if (this._isDraggingBubble) {
                        ctx.strokeStyle = this._color;
                        ctx.lineWidth = 1;
                        ctx.setLineDash([5, 5]);
                        ctx.beginPath();
                        ctx.roundRect(
                            bubbleRect.x - 2,
                            bubbleRect.y - 2,
                            bubbleRect.width + 4,
                            bubbleRect.height + 4,
                            8
                        );
                        ctx.stroke();
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private drawControlPoint(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        ctx.fillStyle = '#3964FE';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        if (this._isDraggingControlPoint) {
            ctx.strokeStyle = '#3964FE';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    getControlPointTime(): string {
        return this._controlPointTime;
    }

    getControlPointPrice(): number {
        return this._controlPointPrice;
    }

    getBubbleTime(): string {
        return this._bubbleTime;
    }

    getBubblePrice(): number {
        return this._bubblePrice;
    }

    getText(): string {
        return this._text;
    }

    updateText(text: string) {
        this._text = text;
        this.requestUpdate();
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
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.backgroundColor) this.updateBackgroundColor(styles.backgroundColor);
        if (styles.textColor) this.updateTextColor(styles.textColor);
        if (styles.fontSize) this.updateFontSize(styles.fontSize);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor,
            fontSize: this._fontSize,
            lineWidth: this._lineWidth,
            text: this._text
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;

        const controlX = this._chart.timeScale().timeToCoordinate(this._controlPointTime);
        const controlY = this._series.priceToCoordinate(this._controlPointPrice);
        const bubbleX = this._chart.timeScale().timeToCoordinate(this._bubbleTime);
        const bubbleY = this._series.priceToCoordinate(this._bubblePrice);

        if (controlX === null || controlY === null || bubbleX === null || bubbleY === null) return null;

        const padding = 12;
        const textWidth = this._text.length * this._fontSize * 0.6;
        const textHeight = this._fontSize;

        const bubbleRect = {
            x: bubbleX - textWidth / 2 - padding,
            y: bubbleY - textHeight / 2 - padding,
            width: textWidth + padding * 2,
            height: textHeight + padding * 2
        };

        return {
            controlX,
            controlY,
            bubbleX,
            bubbleY,
            minX: Math.min(controlX, bubbleRect.x),
            maxX: Math.max(controlX, bubbleRect.x + bubbleRect.width),
            minY: Math.min(controlY, bubbleRect.y),
            maxY: Math.max(controlY, bubbleRect.y + bubbleRect.height)
        };
    }
}