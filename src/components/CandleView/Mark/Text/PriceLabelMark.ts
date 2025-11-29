import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class PriceLabelMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _time: number;
    private _price: number;
    private _renderer: any;
    private _color: string;
    private _backgroundColor: string;
    private _textColor: string;
    private _fontSize: number;
    private _lineWidth: number;
    private markType: MarkType = MarkType.PriceLabel;
    private _graphColor: string;
    private _graphLineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _graphLineWidth: number;
    private _isBold: boolean = false;
    private _isItalic: boolean = false;

    constructor(
        time: number,
        price: number,
        color: string = '#2962FF',
        backgroundColor: string = 'rgba(41, 98, 255, 0.9)',
        textColor: string = '#FFFFFF',
        fontSize: number = 12,
        lineWidth: number = 1,
    ) {
        this._time = time;
        this._price = price;
        this._color = color;
        this._backgroundColor = backgroundColor;
        this._textColor = textColor;
        this._fontSize = fontSize;
        this._lineWidth = lineWidth;
        this._graphColor = color;
        this._graphLineStyle = 'solid';
        this._graphLineWidth = lineWidth;
    }

    updateLineStyle(lineStyle: "solid" | "dashed" | "dotted"): void {
        this._graphLineStyle = lineStyle;
        this.requestUpdate();
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

    updatePosition(time: number, price: number) {
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

    setShowLabel(show: boolean) {
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
            this._time = newTime;
            this._price = newPrice;
            this.requestUpdate();
        }
    }

    isPointNearLabel(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;
        const labelX = this._chart.timeScale().timeToCoordinate(this._time);
        const labelY = this._series.priceToCoordinate(this._price);
        if (labelX === null || labelY === null) return false;
        const pointerLength = 20;
        const padding = 8;
        const text = this._price.toFixed(2);
        const textWidth = text.length * this._fontSize * 0.6;
        const textHeight = this._fontSize;
        const labelRect = {
            x: labelX - textWidth / 2 - padding,
            y: labelY - pointerLength - textHeight - padding,
            width: textWidth + padding * 2,
            height: textHeight + padding * 2 + pointerLength
        };
        const inRect = x >= labelRect.x &&
            x <= labelRect.x + labelRect.width &&
            y >= labelRect.y &&
            y <= labelRect.y + labelRect.height;
        if (inRect) return true;
        const distToPointer = this.pointToLineDistance(x, y, labelX, labelY, labelX, labelY - pointerLength);
        return distToPointer <= threshold;
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
                    const pointerLength = 20;
                    const padding = 8;
                    const text = this._price.toFixed(2);
                    const fontString = this._buildFontString();
                    ctx.font = fontString;
                    const textMetrics = ctx.measureText(text);
                    const textWidth = textMetrics.width;
                    const textHeight = this._fontSize;
                    const bubbleBottomY = labelY - pointerLength;
                    const labelRect = {
                        x: labelX - textWidth / 2 - padding,
                        y: bubbleBottomY - textHeight - padding * 2,
                        width: textWidth + padding * 2,
                        height: textHeight + padding * 2
                    };
                    const triangleSize = 6;
                    ctx.fillStyle = this._graphColor;
                    ctx.strokeStyle = this._graphColor;
                    ctx.lineWidth = this._graphLineWidth;
                    ctx.beginPath();
                    ctx.moveTo(labelX - triangleSize, bubbleBottomY);
                    ctx.lineTo(labelX, labelY);
                    ctx.lineTo(labelX + triangleSize, bubbleBottomY);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.strokeStyle = this._graphColor;
                    ctx.lineWidth = this._graphLineWidth;
                    ctx.setLineDash(this._getLineDashPattern(this._graphLineStyle));
                    ctx.beginPath();
                    ctx.moveTo(labelX, bubbleBottomY);
                    ctx.lineTo(labelX, labelRect.y + labelRect.height);
                    ctx.stroke();
                    ctx.fillStyle = this._graphColor;
                    ctx.beginPath();
                    ctx.roundRect(labelRect.x, labelRect.y, labelRect.width, labelRect.height, 4);
                    ctx.fill();
                    ctx.strokeStyle = this._graphColor;
                    ctx.lineWidth = this._graphLineWidth;
                    ctx.setLineDash(this._getLineDashPattern(this._graphLineStyle));
                    ctx.beginPath();
                    ctx.roundRect(labelRect.x, labelRect.y, labelRect.width, labelRect.height, 4);
                    ctx.stroke();
                    ctx.fillStyle = this._textColor;
                    ctx.font = fontString;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        text,
                        labelX,
                        labelRect.y + labelRect.height / 2
                    );
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getTime(): number {
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

    public updateStyles(styles: {
        color?: string;
        backgroundColor?: string;
        textColor?: string;
        fontSize?: number;
        lineWidth?: number;
        graphColor?: string;
        graphLineStyle?: 'solid' | 'dashed' | 'dotted';
        graphLineWidth?: number;
        isBold?: boolean;
        isItalic?: boolean;
        [key: string]: any;
    }): void {
        let needsUpdate = false;
        if (styles['isBold'] !== undefined) {
            this._isBold = !!styles['isBold'];
            needsUpdate = true;
        }
        if (styles['isItalic'] !== undefined) {
            this._isItalic = !!styles['isItalic'];
            needsUpdate = true;
        }
        if (styles['graphColor']) {
            this._graphColor = styles['graphColor'];
            needsUpdate = true;
        }
        if (styles['graphLineStyle']) {
            this._graphLineStyle = styles['graphLineStyle'];
            needsUpdate = true;
        }
        if (styles['graphLineWidth']) {
            this._graphLineWidth = styles['graphLineWidth'];
            needsUpdate = true;
        }
        if (styles.color) this._textColor = styles.color;
        if (styles.backgroundColor) this._backgroundColor = styles.backgroundColor;
        if (styles.textColor) this._textColor = styles.textColor;
        if (styles.fontSize) this._fontSize = styles.fontSize;
        if (styles.lineWidth) this._lineWidth = styles.lineWidth;
        if (needsUpdate) {
            this.requestUpdate();
        }
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor,
            fontSize: this._fontSize,
            lineWidth: this._lineWidth,
            graphColor: this._graphColor,
            graphLineStyle: this._graphLineStyle,
            graphLineWidth: this._graphLineWidth,
            isBold: this._isBold,
            isItalic: this._isItalic
        };
    }

    private _buildFontString(): string {
        let fontStyle = '';
        let fontWeight = '';

        if (this._isItalic) {
            fontStyle = 'italic ';
        }
        if (this._isBold) {
            fontWeight = 'bold ';
        }

        return `${fontStyle}${fontWeight}${this._fontSize}px Arial, sans-serif`;
    }

    private _getLineDashPattern(style: 'solid' | 'dashed' | 'dotted'): number[] {
        switch (style) {
            case 'dashed':
                return [5, 5];
            case 'dotted':
                return [2, 2];
            case 'solid':
            default:
                return [];
        }
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const labelX = this._chart.timeScale().timeToCoordinate(this._time);
        const labelY = this._series.priceToCoordinate(this._price);
        if (labelX === null || labelY === null) return null;
        const pointerLength = 20;
        const padding = 8;
        const text = this._price.toFixed(2);
        const textWidth = text.length * this._fontSize * 0.6;
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
}