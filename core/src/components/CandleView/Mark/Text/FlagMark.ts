import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class FlagMark implements IGraph, IMarkStyle {
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
    private _lineStyle: "solid" | "dashed" | "dotted";
    private _flagSize: number;
    private markType: MarkType = MarkType.Flag;

    constructor(
        time: number,
        price: number,
        color: string = '#000000',
        backgroundColor: string = '#3964FE',
        textColor: string = '#FFFFFF',
        fontSize: number = 12,
        lineWidth: number = 2,
        flagSize: number = 20
    ) {
        this._time = time;
        this._price = price;
        this._color = color;
        this._backgroundColor = backgroundColor;
        this._textColor = textColor;
        this._fontSize = fontSize;
        this._lineWidth = lineWidth;
        this._flagSize = flagSize;
        this._lineStyle = 'solid';
    }

    updateLineStyle(lineStyle: "solid" | "dashed" | "dotted"): void {
        this._lineStyle = lineStyle;
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

    isPointNearFlag(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;
        const flagX = this._chart.timeScale().timeToCoordinate(this._time);
        const flagY = this._series.priceToCoordinate(this._price);
        if (flagX === null || flagY === null) return false;
        const poleLength = 40;
        const flagWidth = this._flagSize;
        const flagHeight = this._flagSize * 0.6;
        const padding = 8;
        const poleRect = {
            x: flagX - this._lineWidth - threshold,
            y: flagY - poleLength,
            width: this._lineWidth * 2 + threshold * 2,
            height: poleLength + threshold
        };
        const inPole = x >= poleRect.x &&
            x <= poleRect.x + poleRect.width &&
            y >= poleRect.y &&
            y <= poleRect.y + poleRect.height;
        if (inPole) return true;
        const flagRect = {
            x: flagX,
            y: flagY - poleLength - flagHeight / 2,
            width: flagWidth + padding,
            height: flagHeight + padding
        };
        const inFlag = x >= flagRect.x &&
            x <= flagRect.x + flagRect.width &&
            y >= flagRect.y &&
            y <= flagRect.y + flagRect.height;
        if (inFlag) return true;
        const distToPole = this.pointToLineDistance(x, y, flagX, flagY, flagX, flagY - poleLength);
        return distToPole <= threshold;
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
                const flagX = this._chart.timeScale().timeToCoordinate(this._time);
                const flagY = this._series.priceToCoordinate(this._price);
                if (flagX === null || flagY === null) return;
                ctx.save();
                ctx.globalAlpha = 1.0;
                const poleLength = 40;
                const flagWidth = this._flagSize;
                const flagHeight = this._flagSize * 0.6;
                const segmentWidth = 1;
                const totalWidth = this._lineWidth;
                const startX = flagX - totalWidth / 2;
                ctx.lineWidth = 1;
                for (let i = 0; i < totalWidth / segmentWidth; i++) {
                    ctx.fillStyle = i % 2 === 0 ? '#000000' : '#FFFFFF';
                    ctx.fillRect(
                        startX + i * segmentWidth,
                        flagY - poleLength,
                        segmentWidth,
                        poleLength
                    );
                }
                ctx.fillStyle = this._color;
                ctx.strokeStyle = this._color;
                ctx.lineWidth = 1;
                const flagStartX = flagX;
                const flagStartY = flagY - poleLength;
                const waveAmplitude = flagHeight * 0.3;
                ctx.beginPath();
                ctx.moveTo(flagStartX + waveAmplitude, flagStartY - flagHeight / 2);
                ctx.bezierCurveTo(
                    flagStartX + flagWidth * 0.3, flagStartY - flagHeight / 2 - waveAmplitude,
                    flagStartX + flagWidth * 0.7, flagStartY - flagHeight / 2 + waveAmplitude,
                    flagStartX + flagWidth, flagStartY - flagHeight / 2
                );
                ctx.lineTo(flagStartX + flagWidth, flagStartY + flagHeight / 2);
                ctx.bezierCurveTo(
                    flagStartX + flagWidth * 0.7, flagStartY + flagHeight / 2 - waveAmplitude,
                    flagStartX + flagWidth * 0.3, flagStartY + flagHeight / 2 + waveAmplitude,
                    flagStartX, flagStartY + flagHeight / 2
                );
                ctx.lineTo(flagStartX + waveAmplitude, flagStartY - flagHeight / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
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

    updateFlagSize(flagSize: number) {
        this._flagSize = flagSize;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        backgroundColor?: string;
        textColor?: string;
        fontSize?: number;
        lineWidth?: number;
        lineStyle?: "solid" | "dashed" | "dotted";
        flagSize?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.backgroundColor) this.updateBackgroundColor(styles.backgroundColor);
        if (styles.textColor) this.updateTextColor(styles.textColor);
        if (styles.fontSize) this.updateFontSize(styles.fontSize);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.flagSize) this.updateFlagSize(styles.flagSize);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor,
            fontSize: this._fontSize,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            flagSize: this._flagSize,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const flagX = this._chart.timeScale().timeToCoordinate(this._time);
        const flagY = this._series.priceToCoordinate(this._price);
        if (flagX === null || flagY === null) return null;
        const poleLength = 40;
        const flagWidth = this._flagSize;
        const flagHeight = this._flagSize * 0.6;
        const padding = 8;
        return {
            x: flagX,
            y: flagY,
            minX: flagX - padding,
            maxX: flagX + flagWidth + padding,
            minY: flagY - poleLength - flagHeight - padding,
            maxY: flagY
        };
    }
}