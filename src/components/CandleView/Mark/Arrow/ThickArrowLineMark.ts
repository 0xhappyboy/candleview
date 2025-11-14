import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class ThickArrowLineMark implements IGraph, IMarkStyle {
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
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'line' | null = null;
    private _showHandles: boolean = false;
    private _originalStartTime: string = '';
    private _originalStartPrice: number = 0;
    private _originalEndTime: string = '';
    private _originalEndPrice: number = 0;
    private _arrowHeadSize: number = 20; 
    private _arrowHeadWidth: number = 15; 
    private _arrowShaftWidth: number = 8; 
    private markType: MarkType = MarkType.ThickArrowLine;

    constructor(
        startTime: string,
        startPrice: number,
        endTime: string,
        endPrice: number,
        color: string = '#FF6B35',
        lineWidth: number = 3,
        isPreview: boolean = false
    ) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this._endTime = endTime;
        this._endPrice = endPrice;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._originalStartTime = startTime;
        this._originalStartPrice = startPrice;
        this._originalEndTime = endTime;
        this._originalEndPrice = endPrice;
    }
    updateFontSize(fontSize: number): void;
    updateFontSize(fontSize: number): void;
    updateFontSize(fontSize: unknown): void {
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
        if (isDragging) {
            this._originalStartTime = this._startTime;
            this._originalStartPrice = this._startPrice;
            this._originalEndTime = this._endTime;
            this._originalEndPrice = this._endPrice;
        }
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

    dragLine(deltaTime: number, deltaPrice: number) {
        if (isNaN(deltaTime) || isNaN(deltaPrice)) {
            return;
        }
        const startTimeNum = parseFloat(this._startTime);
        const endTimeNum = parseFloat(this._endTime);
        if (isNaN(startTimeNum) || isNaN(endTimeNum)) {
            return;
        }
        const newStartTime = startTimeNum + deltaTime;
        const newEndTime = endTimeNum + deltaTime;
        if (!isNaN(newStartTime) && !isNaN(newEndTime)) {
            this._startTime = newStartTime.toString();
            this._startPrice = this._startPrice + deltaPrice;
            this._endTime = newEndTime.toString();
            this._endPrice = this._endPrice + deltaPrice;
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


    private drawThickArrow(
        ctx: CanvasRenderingContext2D,
        startX: number,
        startY: number,
        endX: number,
        endY: number
    ) {
        const len = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        if (len < 5) return;
        const angle = Math.atan2(endY - startY, endX - startX);
        const headLength = len * 0.35;
        const headWidth = len * 0.18;
        const tailWidth = len * 0.04;
        const baseX = endX - Math.cos(angle) * headLength;
        const baseY = endY - Math.sin(angle) * headLength;
        ctx.save();
        ctx.fillStyle = this._color;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(
            baseX - headWidth * 0.3 * Math.sin(angle),
            baseY + headWidth * 0.3 * Math.cos(angle)
        );
        ctx.lineTo(
            baseX - headWidth * Math.sin(angle),
            baseY + headWidth * Math.cos(angle)
        );
        ctx.lineTo(endX, endY);
        ctx.lineTo(
            baseX + headWidth * Math.sin(angle),
            baseY - headWidth * Math.cos(angle)
        );
        ctx.lineTo(
            baseX + headWidth * 0.3 * Math.sin(angle),
            baseY - headWidth * 0.3 * Math.cos(angle)
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
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
                    this.drawThickArrow(ctx, startX, startY, endX, endY);
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, isActive: boolean = false) => {
                            ctx.save();
                            ctx.fillStyle = this._color;
                            ctx.beginPath();
                            ctx.arc(x, y, 6, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(x, y, 4, 0, Math.PI * 2);
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
                        drawHandle(endX, endY, this._dragPoint === 'end');
                    }
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

    updateArrowHeadSize(size: number) {
        this._arrowHeadSize = size;
        this.requestUpdate();
    }

    updateArrowHeadWidth(width: number) {
        this._arrowHeadWidth = width;
        this.requestUpdate();
    }

    updateArrowShaftWidth(width: number) {
        this._arrowShaftWidth = width;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        arrowHeadSize?: number;
        arrowHeadWidth?: number;
        arrowShaftWidth?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.arrowHeadSize) this.updateArrowHeadSize(styles.arrowHeadSize);
        if (styles.arrowHeadWidth) this.updateArrowHeadWidth(styles.arrowHeadWidth);
        if (styles.arrowShaftWidth) this.updateArrowShaftWidth(styles.arrowShaftWidth);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            arrowHeadSize: this._arrowHeadSize,
            arrowHeadWidth: this._arrowHeadWidth,
            arrowShaftWidth: this._arrowShaftWidth,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;

        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);

        if (startX == null || startY == null || endX == null || endY == null) return null;

        const margin = Math.max(this._arrowHeadSize, this._arrowHeadWidth, this._arrowShaftWidth);
        return {
            startX, startY, endX, endY,
            minX: Math.min(startX, endX) - margin,
            maxX: Math.max(startX, endX) + margin,
            minY: Math.min(startY, endY) - margin,
            maxY: Math.max(startY, endY) + margin
        };
    }
}