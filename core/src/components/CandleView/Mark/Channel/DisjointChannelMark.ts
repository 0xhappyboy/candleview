import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class DisjointChannelMark implements IGraph, IMarkStyle {
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
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'channel' | 'angle' | 'line' | null = null;
    private _hoverPoint: 'start' | 'end' | 'channel' | 'angle' | 'line' | null = null;
    private _showHandles: boolean = false;
    private _channelHeight: number = 0;
    private markType: MarkType = MarkType.EquidistantChannel;
    private _angle: number = 50;
    private _originalAngle: number = 50;

    constructor(
        startTime: number,
        startPrice: number,
        endTime: number,
        endPrice: number,
        color: string = '#2962FF',
        lineWidth: number = 2,
        isPreview: boolean = false,
        angle: number = 50
    ) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this._endTime = endTime;
        this._endPrice = endPrice;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._channelHeight = Math.abs(endPrice - startPrice) * 0.1;
        this._angle = angle;
        this._originalAngle = angle;
    }

    updateFontSize(fontSize: unknown): void {
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

    updateChannelHeight(height: number) {
        this._channelHeight = Math.max(0.001, height);
        this.requestUpdate();
    }

    updateAngle(angle: number) {
        this._angle = angle;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'channel' | 'angle' | 'line' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    setHoverPoint(hoverPoint: 'start' | 'end' | 'channel' | 'angle' | 'line' | null) {
        this._hoverPoint = hoverPoint;
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

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | 'channel' | 'angle' | null {
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
        const channelHeightPixels = Math.abs(this._series.priceToCoordinate(this._startPrice - this._channelHeight) - this._series.priceToCoordinate(this._startPrice));
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angleRad = (this._angle * Math.PI) / 180;
        const angleOffset = Math.tan(angleRad) * length * 0.5;
        const channelMidX = (startX + endX) / 2;
        const channelMidY = (startY + endY) / 2;
        const channelHandleX = channelMidX;
        const channelHandleY = channelMidY - channelHeightPixels;
        const distToChannel = Math.sqrt(Math.pow(x - channelHandleX, 2) + Math.pow(y - channelHandleY, 2));
        if (distToChannel <= threshold) {
            return 'channel';
        }
        const topEndY = endY - channelHeightPixels - angleOffset;
        const bottomEndY = endY + channelHeightPixels + angleOffset;
        const angleHandleX = endX;
        const angleHandleY = (topEndY + bottomEndY) / 2;
        const distToAngle = Math.sqrt(Math.pow(x - angleHandleX, 2) + Math.pow(y - angleHandleY, 2));
        if (distToAngle <= threshold) {
            return 'angle';
        }
        return null;
    }

    updateAngleByPixels(deltaY: number) {
        if (!this._chart || !this._series) return;
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startY === null || endY === null) return;
        const length = Math.abs(endY - startY);
        if (length === 0) return;
        const angleDelta = (deltaY / 10) * -1;
        const newAngle = Math.max(25, this._originalAngle + angleDelta);
        this.updateAngle(newAngle);
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
                    const dx = endX - startX;
                    const dy = endY - startY;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    if (length === 0) {
                        ctx.restore();
                        return;
                    }
                    const channelHeightPixels = Math.abs(this._series.priceToCoordinate(this._startPrice - this._channelHeight) - this._series.priceToCoordinate(this._startPrice));
                    const angleRad = (this._angle * Math.PI) / 180;
                    const angleOffset = Math.tan(angleRad) * length * 0.5;
                    const topStartX = startX;
                    const topStartY = startY - channelHeightPixels;
                    const topEndX = endX;
                    const topEndY = endY - channelHeightPixels - angleOffset;
                    const bottomStartX = startX;
                    const bottomStartY = startY + channelHeightPixels;
                    const bottomEndX = endX;
                    const bottomEndY = endY + channelHeightPixels + angleOffset;
                    if (!this._isPreview) {
                        ctx.save();
                        ctx.fillStyle = this._color + '15';
                        ctx.beginPath();
                        ctx.moveTo(topStartX, topStartY);
                        ctx.lineTo(topEndX, topEndY);
                        ctx.lineTo(bottomEndX, bottomEndY);
                        ctx.lineTo(bottomStartX, bottomStartY);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    }
                    ctx.beginPath();
                    ctx.moveTo(topStartX, topStartY);
                    ctx.lineTo(topEndX, topEndY);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(bottomStartX, bottomStartY);
                    ctx.lineTo(bottomEndX, bottomEndY);
                    ctx.stroke();
                    if ((this._showHandles || this._isDragging || this._hoverPoint) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, type: 'start' | 'end' | 'channel' | 'angle', isActive: boolean = false) => {
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
                                ctx.lineWidth = 2;
                                ctx.setLineDash([]);
                                ctx.beginPath();
                                ctx.arc(x, y, 8, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            ctx.fillStyle = this._color;
                            ctx.font = '12px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            let infoText = '';
                            if (type === 'start') {
                                const price = this._startPrice.toFixed(2);
                                infoText = `${price}`;
                            } else if (type === 'end') {
                                const price = this._endPrice.toFixed(2);
                                infoText = `${price}`;
                            } else if (type === 'channel') {
                                const height = (this._channelHeight / this._startPrice * 100).toFixed(2);
                                infoText = `${height}%`;
                            } else if (type === 'angle') {
                                const angleText = this._angle.toFixed(1);
                                infoText = `${angleText}°`;
                            }
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                            const textWidth = ctx.measureText(infoText).width;
                            ctx.fillRect(x - textWidth / 2 - 5, y - 25, textWidth + 10, 18);
                            ctx.fillStyle = '#333333';
                            ctx.fillText(infoText, x, y - 10);
                            ctx.restore();
                        };
                        drawHandle(startX, startY, 'start', this._dragPoint === 'start' || this._hoverPoint === 'start');
                        drawHandle(endX, endY, 'end', this._dragPoint === 'end' || this._hoverPoint === 'end');
                        const channelMidX = (startX + endX) / 2;
                        const channelMidY = (startY + endY) / 2;
                        const channelHandleX = channelMidX;
                        const channelHandleY = channelMidY - channelHeightPixels;
                        drawHandle(channelHandleX, channelHandleY, 'channel', this._dragPoint === 'channel' || this._hoverPoint === 'channel');
                        const angleHandleX = endX;
                        const angleHandleY = (topEndY + bottomEndY) / 2;
                        drawHandle(angleHandleX, angleHandleY, 'angle', this._dragPoint === 'angle' || this._hoverPoint === 'angle');
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

    getChannelHeight(): number {
        return this._channelHeight;
    }

    getAngle(): number {
        return this._angle;
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

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        channelHeight?: number;
        angle?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.channelHeight !== undefined) this.updateChannelHeight(styles.channelHeight);
        if (styles.angle !== undefined) this.updateAngle(styles.angle);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            channelHeight: this._channelHeight,
            angle: this._angle,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startX == null || startY == null || endX == null || endY == null) return null;
        const channelHeightPixels = Math.abs(this._series.priceToCoordinate(this._startPrice - this._channelHeight) - this._series.priceToCoordinate(this._startPrice));
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angleRad = (this._angle * Math.PI) / 180;
        const angleOffset = Math.tan(angleRad) * length * 0.5;
        const topStartY = startY - channelHeightPixels;
        const topEndY = endY - channelHeightPixels - angleOffset;
        const bottomStartY = startY + channelHeightPixels;
        const bottomEndY = endY + channelHeightPixels + angleOffset;
        const points = [
            { x: startX, y: topStartY },
            { x: endX, y: topEndY },
            { x: startX, y: bottomStartY },
            { x: endX, y: bottomEndY }
        ];
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        return {
            startX, startY, endX, endY,
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    }
}