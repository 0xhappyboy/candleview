import { MarkType } from "../../../types";
import { IGraph } from "../../IGraph";
import { IGraphStyle } from "../../IGraphStyle";

export class EquidistantChannelMark implements IGraph, IGraphStyle {
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
    private _dragPoint: 'start' | 'end' | 'channel' | 'line' | null = null;
    private _showHandles: boolean = false;
    private _originalStartTime: string = '';
    private _originalStartPrice: number = 0;
    private _originalEndTime: string = '';
    private _originalEndPrice: number = 0;
    private _channelHeight: number = 0;
    private _originalChannelHeight: number = 0;
    private markType: MarkType = MarkType.EquidistantChannel;
    private _hoverPoint: 'start' | 'end' | 'channel' | 'line' | null = null;

    constructor(
        startTime: string,
        startPrice: number,
        endTime: string,
        endPrice: number,
        color: string = '#2962FF',
        lineWidth: number = 2,
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
        this._channelHeight = Math.abs(endPrice - startPrice) * 0.1;
        this._originalChannelHeight = this._channelHeight;
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

    updateChannelHeight(height: number) {
        this._channelHeight = Math.max(0.001, height);
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'channel' | 'line' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        if (isDragging) {
            this._originalStartTime = this._startTime;
            this._originalStartPrice = this._startPrice;
            this._originalEndTime = this._endTime;
            this._originalEndPrice = this._endPrice;
            this._originalChannelHeight = this._channelHeight;
        }
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    setHoverPoint(hoverPoint: 'start' | 'end' | 'channel' | 'line' | null) {
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
            this._startTime = newStartTime.toString();
            this._startPrice = newStartPrice;
            this._endTime = newEndTime.toString();
            this._endPrice = newEndPrice;
            this.requestUpdate();
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | 'channel' | null {
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

        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return null;

        const perpX = -dy / length;
        const perpY = dx / length;
        const channelHeightPixels = Math.abs(this._series.priceToCoordinate(this._startPrice - this._channelHeight) - this._series.priceToCoordinate(this._startPrice));

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const channelHandleX = midX + perpX * channelHeightPixels;
        const channelHandleY = midY + perpY * channelHeightPixels;

        const distToChannel = Math.sqrt(Math.pow(x - channelHandleX, 2) + Math.pow(y - channelHandleY, 2));
        if (distToChannel <= threshold) {
            return 'channel';
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

                    const unitX = dx / length;
                    const unitY = dy / length;
                    const perpX = -unitY;
                    const perpY = unitX;
                    const channelHeightPixels = Math.abs(this._series.priceToCoordinate(this._startPrice - this._channelHeight) - this._series.priceToCoordinate(this._startPrice));


                    for (let i = -1; i <= 1; i += 2) {
                        const offsetX = perpX * channelHeightPixels * i;
                        const offsetY = perpY * channelHeightPixels * i;

                        ctx.beginPath();
                        ctx.moveTo(startX + offsetX, startY + offsetY);
                        ctx.lineTo(endX + offsetX, endY + offsetY);
                        ctx.stroke();
                    }


                    if ((this._showHandles || this._isDragging || this._hoverPoint) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, type: 'start' | 'end' | 'channel', isActive: boolean = false) => {
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


                        const midX = (startX + endX) / 2;
                        const midY = (startY + endY) / 2;
                        const channelHandleX = midX + perpX * channelHeightPixels;
                        const channelHandleY = midY + perpY * channelHeightPixels;
                        drawHandle(channelHandleX, channelHandleY, 'channel', this._dragPoint === 'channel' || this._hoverPoint === 'channel');
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

    getChannelHeight(): number {
        return this._channelHeight;
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
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.channelHeight !== undefined) this.updateChannelHeight(styles.channelHeight);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            channelHeight: this._channelHeight,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startX == null || startY == null || endX == null || endY == null) return null;

        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return null;

        const perpX = -dy / length;
        const perpY = dx / length;
        const channelHeightPixels = Math.abs(this._series.priceToCoordinate(this._startPrice - this._channelHeight) - this._series.priceToCoordinate(this._startPrice));

        const points = [];
        for (let i = -1; i <= 1; i += 2) {
            const offsetX = perpX * channelHeightPixels * i;
            const offsetY = perpY * channelHeightPixels * i;
            points.push({ x: startX + offsetX, y: startY + offsetY });
            points.push({ x: endX + offsetX, y: endY + offsetY });
        }

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