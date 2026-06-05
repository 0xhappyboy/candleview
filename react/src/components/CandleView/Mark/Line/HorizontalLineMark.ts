import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class HorizontalLineMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _price: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isDragging: boolean = false;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.HorizontalLine;

    constructor(
        price: number,
        color: string = '#2962FF',
        lineWidth: number = 2
    ) {
        this._price = price;
        this._color = color;
        this._lineWidth = lineWidth;
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

    updatePrice(price: number) {
        this._price = price;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean) {
        this._isDragging = isDragging;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragLineByPixels(deltaY: number) {
        if (isNaN(deltaY) || !this._chart || !this._series) return;
        
        const currentY = this._series.priceToCoordinate(this._price);
        if (currentY === null) return;
        
        const newY = currentY + deltaY;
        const newPrice = this._series.coordinateToPrice(newY);
        
        if (!isNaN(newPrice)) {
            this._price = newPrice;
            this.requestUpdate();
        }
    }

    isPointNearLine(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;
        
        const lineY = this._series.priceToCoordinate(this._price);
        if (lineY === null) return false;
        
        return Math.abs(y - lineY) <= threshold;
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
        return '';
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
                    
                    const timeScale = this._chart.timeScale();
                    const startX = 0;
                    const endX = timeScale.width();
                    const lineY = this._series.priceToCoordinate(this._price);
                    
                    if (lineY === null) return;
                    
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
                    ctx.moveTo(startX, lineY);
                    ctx.lineTo(endX, lineY);
                    ctx.stroke();
                    if (this._showHandles || this._isDragging) {
                        const midX = (startX + endX) / 2;
                        ctx.save();
                        ctx.fillStyle = this._color;
                        ctx.beginPath();
                        ctx.arc(midX, lineY, 5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#FFFFFF';
                        ctx.beginPath();
                        ctx.arc(midX, lineY, 3, 0, Math.PI * 2);
                        ctx.fill();
                        if (this._isDragging) {
                            ctx.strokeStyle = this._color;
                            ctx.lineWidth = 1;
                            ctx.setLineDash([]);
                            ctx.beginPath();
                            ctx.arc(midX, lineY, 8, 0, Math.PI * 2);
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

    getPrice(): number {
        return this._price;
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

        const lineY = this._series.priceToCoordinate(this._price);
        if (lineY === null) return null;

        const timeScale = this._chart.timeScale();
        return {
            startX: 0,
            startY: lineY,
            endX: timeScale.width(),
            endY: lineY,
            minX: 0,
            maxX: timeScale.width(),
            minY: lineY,
            maxY: lineY
        };
    }
}