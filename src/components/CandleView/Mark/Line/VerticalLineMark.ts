import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class VerticalLineMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _time: string;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isDragging: boolean = false;
    private _showHandles: boolean = false;
    private _originalTime: string = '';
    private markType: MarkType = MarkType.VerticalLine;

    constructor(
        time: string,
        color: string = '#2962FF',
        lineWidth: number = 2
    ) {
        this._time = time;
        this._color = color;
        this._lineWidth = lineWidth;
        this._originalTime = time;
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

    updateTime(time: string) {
        this._time = time;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean) {
        this._isDragging = isDragging;
        if (isDragging) {
            this._originalTime = this._time;
        }
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragLineByPixels(deltaX: number) {
        if (isNaN(deltaX) || !this._chart || !this._series) return;

        const timeScale = this._chart.timeScale();
        const currentX = timeScale.timeToCoordinate(this._time);
        if (currentX === null) return;

        const newX = currentX + deltaX;
        const newTime = timeScale.coordinateToTime(newX);

        if (newTime !== null) {
            this._time = newTime.toString();
            this.requestUpdate();
        }
    }

    isPointNearLine(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;

        const timeScale = this._chart.timeScale();
        const lineX = timeScale.timeToCoordinate(this._time);
        if (lineX === null) return false;

        return Math.abs(x - lineX) <= threshold;
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
        return 0;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const timeScale = this._chart.timeScale();
                    const lineX = timeScale.timeToCoordinate(this._time);
                    if (lineX === null) return;
                    const priceScale = this._series.priceScale();
                    const startY = 0; 
                    const endY = this._chart.chartElement()?.clientHeight || 400;  
                    ctx.save();
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    if (this._isDragging) {
                        ctx.globalAlpha = 0.7;
                    } else {
                        ctx.globalAlpha = 1.0;
                    }
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

                    ctx.beginPath();
                    ctx.moveTo(lineX, startY);
                    ctx.lineTo(lineX, endY);
                    ctx.stroke();

                    if (this._showHandles || this._isDragging) {
                        const midY = (startY + endY) / 2;
                        ctx.save();
                        ctx.fillStyle = this._color;
                        ctx.beginPath();
                        ctx.arc(lineX, midY, 5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#FFFFFF';
                        ctx.beginPath();
                        ctx.arc(lineX, midY, 3, 0, Math.PI * 2);
                        ctx.fill();

                        if (this._isDragging) {
                            ctx.strokeStyle = this._color;
                            ctx.lineWidth = 1;
                            ctx.setLineDash([]);
                            ctx.beginPath();
                            ctx.arc(lineX, midY, 8, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                        ctx.restore();
                    }

                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getTime(): string {
        return this._time;
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
        const timeScale = this._chart.timeScale();
        const lineX = timeScale.timeToCoordinate(this._time);
        if (lineX === null) return null;
        const startY = 0;
        const endY = this._chart.chartElement()?.clientHeight || 400;
        return {
            startX: lineX,
            startY: startY,
            endX: lineX,
            endY: endY,
            minX: lineX,
            maxX: lineX,
            minY: startY,
            maxY: endY
        };
    }
}