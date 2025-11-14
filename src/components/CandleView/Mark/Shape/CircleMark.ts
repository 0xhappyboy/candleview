import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class CircleMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _centerTime: string;
    private _centerPrice: number;
    private _radiusTime: number = 0;
    private _radiusPrice: number = 0;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'center' | 'radius' | 'circle' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.Circle;
    private _fillColor: string = '';
    private _pixelRadius: number = 0;
    private _radiusHandleAngle: number = 0;

    constructor(
        centerTime: string,
        centerPrice: number,
        radiusTime: number = 0,
        radiusPrice: number = 0,
        color: string = '#2962FF',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {
        this._centerTime = centerTime;
        this._centerPrice = centerPrice;
        this._radiusTime = radiusTime;
        this._radiusPrice = radiusPrice;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._fillColor = this.hexToRGBA(color, 0.2);
        this._pixelRadius = this.calculatePixelRadius();
        this._radiusHandleAngle = 0;
    }

    private hexToRGBA(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

    updateRadius(radiusTime: number, radiusPrice: number) {
        this._radiusTime = radiusTime;
        this._radiusPrice = radiusPrice;
        this._pixelRadius = this.calculatePixelRadius();
        this.requestUpdate();
    }

    updateCenter(centerTime: string, centerPrice: number) {
        this._centerTime = centerTime;
        this._centerPrice = centerPrice;
        this._pixelRadius = this.calculatePixelRadius();
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'center' | 'radius' | 'circle' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragCircleByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const centerX = timeScale.timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return;
        const newCenterX = centerX + deltaX;
        const newCenterY = centerY + deltaY;
        const newCenterTime = timeScale.coordinateToTime(newCenterX);
        const newCenterPrice = this._series.coordinateToPrice(newCenterY);
        if (newCenterTime !== null && !isNaN(newCenterPrice)) {
            this._centerTime = newCenterTime.toString();
            this._centerPrice = newCenterPrice;
            this.requestUpdate();
        }
    }

    scaleCircle(scaleFactor: number) {
        this._pixelRadius *= scaleFactor;
        this.requestUpdate();
    }

    updateRadiusHandleAngle(angle: number) {
        this._radiusHandleAngle = angle;
        this.requestUpdate();
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'center' | 'radius' | null {
        if (!this._chart || !this._series) return null;
        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX == null || centerY == null) return null;
        const distToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        if (distToCenter <= threshold) {
            return 'center';
        }
        if (this._pixelRadius > 0) {
            const radiusPoint = this.getRadiusHandlePosition();
            const distToRadius = Math.sqrt(Math.pow(x - radiusPoint.x, 2) + Math.pow(y - radiusPoint.y, 2));
            if (distToRadius <= threshold) {
                return 'radius';
            }
        }
        return null;
    }


    getRadiusHandlePosition(): { x: number; y: number } {
        if (!this._chart || !this._series) return { x: 0, y: 0 };
        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return { x: 0, y: 0 };
        const radius = this.getRadius();
        const angle = this._radiusHandleAngle;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return { x, y };
    }


    calculateAngleFromCenter(mouseX: number, mouseY: number): number {
        if (!this._chart || !this._series) return 0;
        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return 0;
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        return Math.atan2(deltaY, deltaX);
    }


    private calculatePixelRadius(): number {
        if (!this._chart || !this._series) return 0;
        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return 0;
        if (this._radiusTime !== 0 || this._radiusPrice !== 0) {
            try {
                let radiusX = centerX;
                let radiusY = centerY;
                if (this._radiusTime !== 0) {
                    const radiusTimePoint = parseFloat(this._centerTime) + this._radiusTime;
                    const radiusXCoord = this._chart.timeScale().timeToCoordinate(radiusTimePoint.toString());
                    if (radiusXCoord !== null) {
                        radiusX = radiusXCoord;
                    }
                }
                if (this._radiusPrice !== 0) {
                    const radiusPricePoint = this._centerPrice + this._radiusPrice;
                    const radiusYCoord = this._series.priceToCoordinate(radiusPricePoint);
                    if (radiusYCoord !== null) {
                        radiusY = radiusYCoord;
                    }
                }
                const radius = Math.sqrt(Math.pow(radiusX - centerX, 2) + Math.pow(radiusY - centerY, 2));
                return Math.max(radius, 10);
            } catch (error) {
                console.warn('Error calculating radius from time/price:', error);
            }
        }
        if (this._pixelRadius > 0) {
            return this._pixelRadius;
        }
        return 50;
    }

    private getRadius(): number {
        return this._pixelRadius;
    }

    updatePixelRadius(newPixelRadius: number) {
        this._pixelRadius = Math.max(newPixelRadius, 10);
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
        return this._centerTime;
    }

    priceValue() {
        return this._centerPrice;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
                    const centerY = this._series.priceToCoordinate(this._centerPrice);
                    if (centerX == null || centerY == null) return;
                    const radius = this.getRadius();
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
                    if (!this._isPreview) {
                        ctx.fillStyle = this._fillColor;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.stroke();
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, isActive: boolean = false) => {
                            ctx.save();
                            ctx.fillStyle = this._color;
                            ctx.beginPath();
                            ctx.arc(x, y, 5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(x, y, 3, 0, Math.PI * 2);
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
                        drawHandle(centerX, centerY, this._dragPoint === 'center');
                        if (radius > 0) {
                            const radiusPoint = this.getRadiusHandlePosition();
                            drawHandle(radiusPoint.x, radiusPoint.y, this._dragPoint === 'radius');
                        }
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getCenterTime(): string {
        return this._centerTime;
    }

    getCenterPrice(): number {
        return this._centerPrice;
    }

    getRadiusTime(): number {
        return this._radiusTime;
    }

    getRadiusPrice(): number {
        return this._radiusPrice;
    }

    getPixelRadius(): number {
        return this._pixelRadius;
    }

    getRadiusHandleAngle(): number {
        return this._radiusHandleAngle;
    }

    updateColor(color: string) {
        this._color = color;
        this._fillColor = this.hexToRGBA(color, 0.2);
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
        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX == null || centerY == null) return null;
        const radius = this.getRadius();
        return {
            centerX, centerY, radius,
            minX: centerX - radius,
            maxX: centerX + radius,
            minY: centerY - radius,
            maxY: centerY + radius
        };
    }

    isPointInCircle(x: number, y: number, threshold: number = 5): boolean {
        const bounds = this.getBounds();
        if (!bounds) return false;
        const { centerX, centerY, radius } = bounds;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return distance <= radius + threshold;
    }

    isPointNearCircle(x: number, y: number, threshold: number = 15): boolean {
        const bounds = this.getBounds();
        if (!bounds) return false;
        const { centerX, centerY, radius } = bounds;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return Math.abs(distance - radius) <= threshold;
    }
}