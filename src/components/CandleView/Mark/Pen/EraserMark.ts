import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class EraserMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _renderer: any;
    private _color: string = "#FF4136";
    private _lineWidth: number = 2;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean = false;
    private _points: Array<{ time: number; price: number }> = [];
    private markType: MarkType = MarkType.Eraser;

    constructor(
        points: Array<{ time: number; price: number }> = [],
        color: string = '#FF4136',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {
        this._points = [...points];
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
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

    
    addPoint(time: number, price: number) {
        this._points.push({ time, price });
        this.requestUpdate();
    }
    
    clearPoints() {
        this._points = [];
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
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
        return this._points.length > 0 ? this._points[0].time : 0;
    }

    priceValue() {
        return this._points.length > 0 ? this._points[0].price : 0;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series || this._points.length < 1) return;
                    
                    ctx.save();
                    
                    
                    if (this._points.length >= 2) {
                        ctx.strokeStyle = this._color;
                        ctx.lineWidth = this._lineWidth;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.setLineDash([5, 3]); 
                        ctx.globalAlpha = 0.7;
                        
                        ctx.beginPath();
                        const firstPoint = this._points[0];
                        const firstX = this._chart.timeScale().timeToCoordinate(firstPoint.time);
                        const firstY = this._series.priceToCoordinate(firstPoint.price);
                        
                        if (firstX !== null && firstY !== null) {
                            ctx.moveTo(firstX, firstY);
                            for (let i = 1; i < this._points.length; i++) {
                                const point = this._points[i];
                                const x = this._chart.timeScale().timeToCoordinate(point.time);
                                const y = this._series.priceToCoordinate(point.price);
                                if (x !== null && y !== null) {
                                    ctx.lineTo(x, y);
                                }
                            }
                        }
                        ctx.stroke();
                    }
                    
                    
                    if (this._points.length > 0) {
                        const lastPoint = this._points[this._points.length - 1];
                        const x = this._chart.timeScale().timeToCoordinate(lastPoint.time);
                        const y = this._series.priceToCoordinate(lastPoint.price);
                        
                        if (x !== null && y !== null) {
                            ctx.setLineDash([]);
                            ctx.globalAlpha = 1.0;
                            
                            
                            const size = 12;
                            
                            
                            ctx.fillStyle = this._color;
                            ctx.strokeStyle = 'white';
                            ctx.lineWidth = 1;
                            
                            
                            ctx.fillRect(x - size/2, y - size/3, size, size/1.5);
                            ctx.strokeRect(x - size/2, y - size/3, size, size/1.5);
                            
                            
                            ctx.beginPath();
                            ctx.moveTo(x - size/3, y - size/3);
                            ctx.lineTo(x, y - size);
                            ctx.lineTo(x + size/3, y - size/3);
                            ctx.closePath();
                            ctx.fill();
                            ctx.stroke();
                        }
                    }
                    
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getPoints(): Array<{ time: number; price: number }> {
        return [...this._points];
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
        if (!this._chart || !this._series || this._points.length === 0) return null;
        
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const point of this._points) {
            const x = this._chart.timeScale().timeToCoordinate(point.time);
            const y = this._series.priceToCoordinate(point.price);
            if (x !== null && y !== null) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
        
        if (minX === Infinity) return null;
        return { minX, maxX, minY, maxY };
    }

    clear() {
        this._points = [];
        this.requestUpdate();
    }

    getPointCount(): number {
        return this._points.length;
    }
}