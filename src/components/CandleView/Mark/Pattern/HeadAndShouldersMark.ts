import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class HeadAndShouldersMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _points: { time: number; price: number }[] = [];
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isDragging: boolean = false;
    private _dragPoint: number | null = null;
    private _showHandles: boolean = true;
    private markType: MarkType = MarkType.HeadAndShoulders;
    private _drawingProgress: number = 0; 

    constructor(
        points: { time: number; price: number }[],
        color: string = '#3964FE',
        lineWidth: number = 2,
        drawingProgress: number = 0 
    ) {
        this._points = points;
        this._color = color;
        this._lineWidth = lineWidth;
        this._showHandles = true;
        this._drawingProgress = drawingProgress;
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

    updatePoint(index: number, time: number, price: number) {
        if (index >= 0 && index < this._points.length) {
            this._points[index] = { time, price };
            this.requestUpdate();
        }
    }

    setDragging(isDragging: boolean, dragPoint: number | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    
    setDrawingProgress(progress: number) {
        this._drawingProgress = progress;
        this.requestUpdate();
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): number | null {
        if (!this._chart || !this._series) return null;
        for (let i = 0; i < this._points.length; i++) {
            const point = this._points[i];
            const pointX = this._chart.timeScale().timeToCoordinate(point.time);
            const pointY = this._series.priceToCoordinate(point.price);
            if (pointX == null || pointY == null) continue;
            const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
            if (distance <= threshold) {
                return i;
            }
        }
        return null;
    }

    private requestUpdate() {
        if (this._chart && this._series) {
            try {
                this._chart.timeScale().applyOptions({});
            } catch (error) {
                console.log(error);
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
        return this._points[0]?.time || 0;
    }

    priceValue() {
        return this._points[0]?.price || 0;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const coordinates = this._points.map(point => ({
                        x: this._chart.timeScale().timeToCoordinate(point.time),
                        y: this._series.priceToCoordinate(point.price)
                    }));
                    const validCoordinates = coordinates.filter(coord => coord.x != null && coord.y != null);
                    if (validCoordinates.length < 7) return; 
                    ctx.save();
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    ctx.globalAlpha = this._isDragging ? 0.7 : 1.0;
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
                    this.drawHeadAndShouldersPattern(ctx, validCoordinates);
                    if (this._showHandles) {
                        this.drawHandlesAndLabels(ctx, validCoordinates);
                    }
                    ctx.restore();
                }
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    
    private drawGlassAreas(ctx: any, coordinates: any[]) {
        this.drawGlassTriangle(ctx, coordinates[0], coordinates[1], coordinates[2]);
        this.drawGlassTriangle(ctx, coordinates[2], coordinates[3], coordinates[4]);
        this.drawGlassTriangle(ctx, coordinates[4], coordinates[5], coordinates[6]);
    }

    private drawGlassTriangle(ctx: any, p1: any, p2: any, p3: any) {
        ctx.fillStyle = '#3964FE'; 
        ctx.globalAlpha = 0.2; 
        ctx.beginPath();
        ctx.moveTo(p1.x!, p1.y!);
        ctx.lineTo(p2.x!, p2.y!);
        ctx.lineTo(p3.x!, p3.y!);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0; 
    }

    private drawHeadAndShouldersPattern(ctx: any, coordinates: any[]) {
        this.drawGlassAreas(ctx, coordinates);
        this.drawLineSegment(ctx, coordinates[0], coordinates[1], 'Left Shoulder');
        this.drawLineSegment(ctx, coordinates[1], coordinates[2], '');
        this.drawLineSegment(ctx, coordinates[2], coordinates[3], 'Head');
        this.drawLineSegment(ctx, coordinates[3], coordinates[4], '');
        this.drawLineSegment(ctx, coordinates[4], coordinates[5], 'Right Shoulder');
        this.drawLineSegment(ctx, coordinates[5], coordinates[6], '');
    }

    
    private drawLineSegment(ctx: any, p1: any, p2: any, label: string) {
        ctx.beginPath();
        ctx.moveTo(p1.x!, p1.y!);
        ctx.lineTo(p2.x!, p2.y!);
        ctx.stroke();
        if (label) {
            let shouldShow = false;
            if (label === 'Left Shoulder') {
                shouldShow = this._drawingProgress >= 2;
            } else if (label === 'Head') {
                shouldShow = this._drawingProgress >= 4;
            } else if (label === 'Right Shoulder') {
                shouldShow = this._drawingProgress >= 6;
            }
            if (shouldShow) {
                ctx.fillStyle = this._color;
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, p2.x!, p2.y! - 20);
            }
        }
    }

    private drawHandlesAndLabels(ctx: any, coordinates: any[]) {
        coordinates.forEach((coord, index) => {
            ctx.save();
            ctx.fillStyle = this._color;
            ctx.beginPath();
            ctx.arc(coord.x!, coord.y!, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(coord.x!, coord.y!, 3, 0, Math.PI * 2);
            ctx.fill();
            if (this._dragPoint === index) {
                ctx.strokeStyle = this._color;
                ctx.lineWidth = 1;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.arc(coord.x!, coord.y!, 8, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    getPoints(): { time: number; price: number }[] {
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
        if (!this._chart || !this._series) return null;
        const coordinates = this._points.map(point => ({
            x: this._chart.timeScale().timeToCoordinate(point.time),
            y: this._series.priceToCoordinate(point.price)
        }));
        if (coordinates.some(coord => coord.x == null || coord.y == null)) return null;
        const xs = coordinates.map(coord => coord.x!).filter(x => x != null);
        const ys = coordinates.map(coord => coord.y!).filter(y => y != null);
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    }

    isPointNearGraph(x: number, y: number, threshold: number = 10): boolean {
        if (!this._chart || !this._series) return false;
        const coordinates = this._points.map(point => ({
            x: this._chart.timeScale().timeToCoordinate(point.time),
            y: this._series.priceToCoordinate(point.price)
        }));
        const validCoordinates = coordinates.filter(coord => coord.x != null && coord.y != null);
        if (validCoordinates.length < 7) return false;
        for (let i = 0; i < validCoordinates.length - 1; i++) {
            if (this.isPointNearLine(x, y,
                validCoordinates[i].x!, validCoordinates[i].y!,
                validCoordinates[i + 1].x!, validCoordinates[i + 1].y!,
                threshold)) {
                return true;
            }
        }
        return false;
    }

    private isPointNearLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number, threshold: number): boolean {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
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
        return Math.sqrt(dx * dx + dy * dy) < threshold;
    }

    moveAllPoints(deltaTime: number, deltaPrice: number) {
        if (!this._chart || !this._series) return;
        for (let i = 0; i < this._points.length; i++) {
            const point = this._points[i];
            const currentX = this._chart.timeScale().timeToCoordinate(point.time);
            const currentY = this._series.priceToCoordinate(point.price);
            if (currentX !== null && currentY !== null) {
                const newX = currentX + deltaTime;
                const newY = currentY + deltaPrice;
                const newTime = this._chart.timeScale().coordinateToTime(newX);
                const newPrice = this._series.coordinateToPrice(newY);
                if (newTime && newPrice !== null) {
                    this._points[i] = {
                        time: newTime,
                        price: newPrice
                    };
                }
            }
        }
        this.requestUpdate();
    }
}