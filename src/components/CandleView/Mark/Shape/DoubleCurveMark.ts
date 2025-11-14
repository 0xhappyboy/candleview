import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class DoubleCurveMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _startTime: string;
    private _startPrice: number;
    private _endTime: string;
    private _endPrice: number;
    private _controlTime1: string;
    private _controlPrice1: number;
    private _controlTime2: string;
    private _controlPrice2: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'control1' | 'control2' | 'curve' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.DoubleCurve;

    constructor(
        startTime: string,
        startPrice: number,
        endTime: string,
        endPrice: number,
        controlTime1: string,
        controlPrice1: number,
        controlTime2: string,
        controlPrice2: number,
        color: string = '#2962FF',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {
        this._startTime = this.formatTime(startTime);
        this._startPrice = startPrice;
        this._endTime = this.formatTime(endTime);
        this._endPrice = endPrice;
        this._controlTime1 = this.formatTime(controlTime1);
        this._controlPrice1 = controlPrice1;
        this._controlTime2 = this.formatTime(controlTime2);
        this._controlPrice2 = controlPrice2;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
    }

    private formatTime(time: any): string {
        if (time === null || time === undefined) {
            return new Date().toISOString().split('T')[0];
        }
        if (typeof time === 'number') {
            const date = new Date(time * 1000);
            return date.toISOString().split('T')[0];
        } else if (typeof time === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(time)) {
                return time;
            } else if (/^\d+$/.test(time)) {
                const date = new Date(parseInt(time) * 1000);
                return date.toISOString().split('T')[0];
            } else {
                try {
                    const date = new Date(time);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                } catch (e) {
                    console.warn('Invalid time format:', time);
                }
            }
        }
        return new Date().toISOString().split('T')[0];
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

    updateStartPoint(startTime: string, startPrice: number) {
        this._startTime = this.formatTime(startTime);
        this._startPrice = startPrice;
        this.requestUpdate();
    }

    updateEndPoint(endTime: string, endPrice: number) {
        this._endTime = this.formatTime(endTime);
        this._endPrice = endPrice;
        this.requestUpdate();
    }

    updateControlPoint1(controlTime: string, controlPrice: number) {
        this._controlTime1 = this.formatTime(controlTime);
        this._controlPrice1 = controlPrice;
        this.requestUpdate();
    }

    updateControlPoint2(controlTime: string, controlPrice: number) {
        this._controlTime2 = this.formatTime(controlTime);
        this._controlPrice2 = controlPrice;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'control1' | 'control2' | 'curve' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragCurveByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const updatePoint = (time: string, price: number) => {
            const x = timeScale.timeToCoordinate(time);
            const y = this._series.priceToCoordinate(price);
            if (x === null || y === null) return null;
            const newX = x + deltaX;
            const newY = y + deltaY;
            const newTime = timeScale.coordinateToTime(newX);
            const newPrice = this._series.coordinateToPrice(newY);

            if (newTime !== null && !isNaN(newPrice)) {
                return {
                    time: this.formatTime(newTime),
                    price: newPrice
                };
            }
            return null;
        };
        const startResult = updatePoint(this._startTime, this._startPrice);
        const endResult = updatePoint(this._endTime, this._endPrice);
        const control1Result = updatePoint(this._controlTime1, this._controlPrice1);
        const control2Result = updatePoint(this._controlTime2, this._controlPrice2);
        if (startResult) {
            this._startTime = startResult.time;
            this._startPrice = startResult.price;
        }
        if (endResult) {
            this._endTime = endResult.time;
            this._endPrice = endResult.price;
        }
        if (control1Result) {
            this._controlTime1 = control1Result.time;
            this._controlPrice1 = control1Result.price;
        }
        if (control2Result) {
            this._controlTime2 = control2Result.time;
            this._controlPrice2 = control2Result.price;
        }
        this.requestUpdate();
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | 'control1' | 'control2' | null {
        if (!this._chart || !this._series) return null;
        const checkHandle = (handleTime: string, handlePrice: number, handleType: 'start' | 'end' | 'control1' | 'control2'): boolean => {
            const handleX = this._chart.timeScale().timeToCoordinate(handleTime);
            const handleY = this._series.priceToCoordinate(handlePrice);
            if (handleX == null || handleY == null) return false;
            const distance = Math.sqrt(Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2));
            return distance <= threshold;
        };
        if (checkHandle(this._startTime, this._startPrice, 'start')) return 'start';
        if (checkHandle(this._endTime, this._endPrice, 'end')) return 'end';
        if (checkHandle(this._controlTime1, this._controlPrice1, 'control1')) return 'control1';
        if (checkHandle(this._controlTime2, this._controlPrice2, 'control2')) return 'control2';
        return null;
    }

    isPointNearCurve(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const control1X = this._chart.timeScale().timeToCoordinate(this._controlTime1);
        const control1Y = this._series.priceToCoordinate(this._controlPrice1);
        const control2X = this._chart.timeScale().timeToCoordinate(this._controlTime2);
        const control2Y = this._series.priceToCoordinate(this._controlPrice2);
        if (startX == null || startY == null || endX == null || endY == null ||
            control1X == null || control1Y == null || control2X == null || control2Y == null) {
            return false;
        }
        return this.isPointNearCubicBezier(x, y, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY, threshold);
    }

    private isPointNearCubicBezier(
        x: number, y: number,
        startX: number, startY: number,
        control1X: number, control1Y: number,
        control2X: number, control2Y: number,
        endX: number, endY: number,
        threshold: number
    ): boolean {
        const steps = 30;
        let minDistance = Infinity;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const curveX = Math.pow(1 - t, 3) * startX +
                3 * Math.pow(1 - t, 2) * t * control1X +
                3 * (1 - t) * Math.pow(t, 2) * control2X +
                Math.pow(t, 3) * endX;
            const curveY = Math.pow(1 - t, 3) * startY +
                3 * Math.pow(1 - t, 2) * t * control1Y +
                3 * (1 - t) * Math.pow(t, 2) * control2Y +
                Math.pow(t, 3) * endY;
            const distance = Math.sqrt(Math.pow(x - curveX, 2) + Math.pow(y - curveY, 2));
            minDistance = Math.min(minDistance, distance);
            if (minDistance <= threshold) {
                return true;
            }
        }
        return minDistance <= threshold;
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
                    const control1X = this._chart.timeScale().timeToCoordinate(this._controlTime1);
                    const control1Y = this._series.priceToCoordinate(this._controlPrice1);
                    const control2X = this._chart.timeScale().timeToCoordinate(this._controlTime2);
                    const control2Y = this._series.priceToCoordinate(this._controlPrice2);
                    if (startX == null || startY == null || endX == null || endY == null ||
                        control1X == null || control1Y == null || control2X == null || control2Y == null) return;
                    ctx.save();
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    if (this._isPreview || this._isDragging) {
                        ctx.globalAlpha = 0.7;
                    } else {
                        ctx.globalAlpha = 1.0;
                    }
                    if (this._isPreview || this._isDragging) {
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
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.bezierCurveTo(control1X, control1Y, control2X, control2Y, endX, endY);
                    ctx.stroke();
                    if (this._showHandles || this._isDragging) {
                        ctx.save();
                        ctx.setLineDash([2, 2]);
                        ctx.strokeStyle = this._color;
                        ctx.globalAlpha = 0.5;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(control1X, control1Y);
                        ctx.moveTo(control1X, control1Y);
                        ctx.lineTo(control2X, control2Y);
                        ctx.moveTo(control2X, control2Y);
                        ctx.lineTo(endX, endY);
                        ctx.stroke();
                        ctx.restore();
                    }
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, isActive: boolean = false, isControl: boolean = false) => {
                            ctx.save();
                            ctx.fillStyle = isControl ? '#FF6B6B' : this._color;
                            ctx.beginPath();
                            ctx.arc(x, y, isControl ? 6 : 5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(x, y, isControl ? 4 : 3, 0, Math.PI * 2);
                            ctx.fill();
                            if (isActive) {
                                ctx.strokeStyle = isControl ? '#FF6B6B' : this._color;
                                ctx.lineWidth = 1;
                                ctx.setLineDash([]);
                                ctx.beginPath();
                                ctx.arc(x, y, isControl ? 10 : 8, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            ctx.restore();
                        };
                        drawHandle(startX, startY, this._dragPoint === 'start', false);
                        drawHandle(endX, endY, this._dragPoint === 'end', false);
                        drawHandle(control1X, control1Y, this._dragPoint === 'control1', true);
                        drawHandle(control2X, control2Y, this._dragPoint === 'control2', true);
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getStartTime(): string { return this._startTime; }
    getStartPrice(): number { return this._startPrice; }
    getEndTime(): string { return this._endTime; }
    getEndPrice(): number { return this._endPrice; }
    getControlTime1(): string { return this._controlTime1; }
    getControlPrice1(): number { return this._controlPrice1; }
    getControlTime2(): string { return this._controlTime2; }
    getControlPrice2(): number { return this._controlPrice2; }
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
    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const control1X = this._chart.timeScale().timeToCoordinate(this._controlTime1);
        const control1Y = this._series.priceToCoordinate(this._controlPrice1);
        const control2X = this._chart.timeScale().timeToCoordinate(this._controlTime2);
        const control2Y = this._series.priceToCoordinate(this._controlPrice2);
        if (startX == null || startY == null || endX == null || endY == null ||
            control1X == null || control1Y == null || control2X == null || control2Y == null) return null;
        const allX = [startX, endX, control1X, control2X];
        const allY = [startY, endY, control1Y, control2Y];
        const minX = Math.min(...allX);
        const maxX = Math.max(...allX);
        const minY = Math.min(...allY);
        const maxY = Math.max(...allY);
        return {
            startX, startY, endX, endY,
            control1X, control1Y, control2X, control2Y,
            minX, maxX, minY, maxY
        };
    }
}