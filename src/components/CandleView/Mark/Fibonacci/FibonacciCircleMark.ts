import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class FibonacciCircleMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _centerPrice: number;
    private _radiusPrice: number;
    private _centerTime: string;
    private _radiusTime: string;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'center' | 'radius' | 'circle' | null = null;
    private _showHandles: boolean = false;
    private _fibonacciLevels: number[] = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 4.236, 6.854];
    private _fibonacciColors: string[] = [
        '#FF4444', '#00A8FF', '#9C27B0', '#4CAF50', '#FF9800', '#795548', '#607D8B',
        '#E91E63', '#3F51B5', '#009688', '#FF5722'
    ];
    private _fillOpacity: number = 0.2;
    private markType: MarkType = MarkType.FibonacciCircle;
    private _fibonacciCirclePositions: { radius: number; level: number }[] = [];

    constructor(
        centerPrice: number,
        radiusPrice: number,
        centerTime: string,
        radiusTime: string,
        color: string = '#2962FF',
        lineWidth: number = 1,
        isPreview: boolean = false
    ) {
        this._centerPrice = centerPrice;
        this._radiusPrice = radiusPrice;
        this._centerTime = centerTime;
        this._radiusTime = radiusTime;
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

    updateRadiusPoint(radiusPrice: number, radiusTime: string) {
        this._radiusPrice = radiusPrice;
        this._radiusTime = radiusTime;
        this.requestUpdate();
    }

    updateCenterPoint(centerPrice: number, centerTime: string) {
        this._centerPrice = centerPrice;
        this._centerTime = centerTime;
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

    dragCircleByPixels(deltaY: number, deltaX: number = 0) {
        if (isNaN(deltaY) || isNaN(deltaX)) {
            return;
        }
        if (!this._chart || !this._series) return;

        const timeScale = this._chart.timeScale();
        
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const radiusY = this._series.priceToCoordinate(this._radiusPrice);
        const centerX = timeScale.timeToCoordinate(this._centerTime);
        const radiusX = timeScale.timeToCoordinate(this._radiusTime);

        if (centerY === null || radiusY === null || centerX === null || radiusX === null) return;

        const newCenterY = centerY + deltaY;
        const newRadiusY = radiusY + deltaY;
        const newCenterX = centerX + deltaX;
        const newRadiusX = radiusX + deltaX;

        const newCenterPrice = this._series.coordinateToPrice(newCenterY);
        const newRadiusPrice = this._series.coordinateToPrice(newRadiusY);
        const newCenterTime = timeScale.coordinateToTime(newCenterX);
        const newRadiusTime = timeScale.coordinateToTime(newRadiusX);

        if (newCenterPrice !== null && newRadiusPrice !== null &&
            newCenterTime !== null && newRadiusTime !== null) {
            this._centerPrice = newCenterPrice;
            this._radiusPrice = newRadiusPrice;
            this._centerTime = newCenterTime.toString();
            this._radiusTime = newRadiusTime.toString();
            this.requestUpdate();
        }
    }

    dragHandleByPixels(deltaY: number, deltaX: number = 0, handleType: 'center' | 'radius') {
        if (isNaN(deltaY) || isNaN(deltaX)) {
            return;
        }
        if (!this._chart || !this._series) return;

        const timeScale = this._chart.timeScale();

        if (handleType === 'center') {
            const centerY = this._series.priceToCoordinate(this._centerPrice);
            const centerX = timeScale.timeToCoordinate(this._centerTime);
            if (centerY === null || centerX === null) return;

            const newCenterY = centerY + deltaY;
            const newCenterX = centerX + deltaX;
            const newCenterPrice = this._series.coordinateToPrice(newCenterY);
            const newCenterTime = timeScale.coordinateToTime(newCenterX);

            if (newCenterPrice !== null && newCenterTime !== null) {
                this._centerPrice = newCenterPrice;
                this._centerTime = newCenterTime.toString();
                this.requestUpdate();
            }
        } else if (handleType === 'radius') {
            const radiusY = this._series.priceToCoordinate(this._radiusPrice);
            const radiusX = timeScale.timeToCoordinate(this._radiusTime);
            if (radiusY === null || radiusX === null) return;

            const newRadiusY = radiusY + deltaY;
            const newRadiusX = radiusX + deltaX;
            const newRadiusPrice = this._series.coordinateToPrice(newRadiusY);
            const newRadiusTime = timeScale.coordinateToTime(newRadiusX);

            if (newRadiusPrice !== null && newRadiusTime !== null) {
                this._radiusPrice = newRadiusPrice;
                this._radiusTime = newRadiusTime.toString();
                this.requestUpdate();
            }
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'center' | 'radius' | null {
        if (!this._chart || !this._series) return null;

        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const radiusY = this._series.priceToCoordinate(this._radiusPrice);
        const timeScale = this._chart.timeScale();
        const centerX = timeScale.timeToCoordinate(this._centerTime);
        const radiusX = timeScale.timeToCoordinate(this._radiusTime);

        if (centerY == null || radiusY == null || centerX == null || radiusX == null) return null;

        const distToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const distToRadius = Math.sqrt(Math.pow(x - radiusX, 2) + Math.pow(y - radiusY, 2));

        if (distToCenter <= threshold) {
            return 'center';
        }
        if (distToRadius <= threshold) {
            return 'radius';
        }
        return null;
    }

    isPointNearFibonacciCircle(x: number, y: number, threshold: number = 15): number | null {
        if (!this._chart || !this._series) return null;

        const timeScale = this._chart.timeScale();
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const centerX = timeScale.timeToCoordinate(this._centerTime);

        if (centerY == null || centerX == null) return null;

        
        const radiusY = this._series.priceToCoordinate(this._radiusPrice);
        const radiusX = timeScale.timeToCoordinate(this._radiusTime);
        if (radiusY == null || radiusX == null) return null;

        const radiusPixels = Math.sqrt(Math.pow(radiusX - centerX, 2) + Math.pow(radiusY - centerY, 2));

        
        for (let i = 0; i < this._fibonacciLevels.length; i++) {
            const level = this._fibonacciLevels[i];
            const currentRadius = radiusPixels * level;

            const distanceToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const distanceToCircle = Math.abs(distanceToCenter - currentRadius);

            if (distanceToCircle <= threshold && currentRadius > 0) {
                return level;
            }
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

                    const timeScale = this._chart.timeScale();
                    const centerY = this._series.priceToCoordinate(this._centerPrice);
                    const radiusY = this._series.priceToCoordinate(this._radiusPrice);
                    const centerX = timeScale.timeToCoordinate(this._centerTime);
                    const radiusX = timeScale.timeToCoordinate(this._radiusTime);

                    if (centerY == null || radiusY == null || centerX == null || radiusX == null) return;

                    this._fibonacciCirclePositions = [];
                    ctx.save();
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';

                    
                    if (this._isPreview || this._isDragging) {
                        ctx.globalAlpha = 1.0; 
                    } else {
                        ctx.globalAlpha = 1.0;
                    }

                    
                    if (this._isPreview || this._isDragging) {
                        ctx.setLineDash([]); 
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

                    
                    const radiusPixels = Math.sqrt(Math.pow(radiusX - centerX, 2) + Math.pow(radiusY - centerY, 2));

                    
                    for (let i = 0; i < this._fibonacciLevels.length; i++) {
                        const level = this._fibonacciLevels[i];
                        const currentRadius = radiusPixels * level;

                        if (currentRadius <= 0) continue;

                        this._fibonacciCirclePositions.push({
                            radius: currentRadius,
                            level: level
                        });

                        ctx.strokeStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
                        ctx.stroke();

                        
                        if (i > 0 && this._fillOpacity > 0) {
                            const prevLevel = this._fibonacciLevels[i - 1];
                            const prevRadius = radiusPixels * prevLevel;

                            ctx.fillStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                            ctx.globalAlpha = this._fillOpacity;
                            ctx.beginPath();
                            ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
                            ctx.arc(centerX, centerY, prevRadius, 0, Math.PI * 2, true);
                            ctx.fill();
                            
                            ctx.globalAlpha = this._isPreview || this._isDragging ? 1.0 : 1.0;
                        }

                        
                        ctx.save();
                        ctx.fillStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(
                            `${(level * 100).toFixed(1)}%`,
                            centerX + currentRadius + 15,
                            centerY
                        );
                        ctx.restore();
                    }

                    
                    ctx.strokeStyle = this._color;
                    ctx.setLineDash([]); 
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(radiusX, radiusY);
                    ctx.stroke();

                    
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
                                ctx.lineWidth = 2;
                                ctx.setLineDash([]);
                                ctx.beginPath();
                                ctx.arc(x, y, 8, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            ctx.restore();
                        };

                        drawHandle(centerX, centerY, this._dragPoint === 'center');
                        drawHandle(radiusX, radiusY, this._dragPoint === 'radius');
                    }

                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getCenterPrice(): number {
        return this._centerPrice;
    }

    getRadiusPrice(): number {
        return this._radiusPrice;
    }

    getCenterTime(): string {
        return this._centerTime;
    }

    getRadiusTime(): string {
        return this._radiusTime;
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

    updateFillOpacity(opacity: number) {
        this._fillOpacity = opacity;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        fillOpacity?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.fillOpacity !== undefined) this.updateFillOpacity(styles.fillOpacity);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            fillOpacity: this._fillOpacity,
            fibonacciColors: this._fibonacciColors
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;

        const timeScale = this._chart.timeScale();
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const radiusY = this._series.priceToCoordinate(this._radiusPrice);
        const centerX = timeScale.timeToCoordinate(this._centerTime);
        const radiusX = timeScale.timeToCoordinate(this._radiusTime);

        if (centerY == null || radiusY == null || centerX == null || radiusX == null) return null;

        const radiusPixels = Math.sqrt(Math.pow(radiusX - centerX, 2) + Math.pow(radiusY - centerY, 2));

        return {
            centerX, centerY, radiusX, radiusY,
            minX: centerX - radiusPixels,
            maxX: centerX + radiusPixels,
            minY: centerY - radiusPixels,
            maxY: centerY + radiusPixels,
            fibonacciCirclePositions: this._fibonacciCirclePositions
        };
    }

    getFibonacciLevels(): number[] {
        return [...this._fibonacciLevels];
    }

    getFibonacciCirclePositions(): { radius: number; level: number }[] {
        return [...this._fibonacciCirclePositions];
    }

    getFibonacciColors(): string[] {
        return [...this._fibonacciColors];
    }

    
    getPriceRadius(): number {
        return Math.abs(this._radiusPrice - this._centerPrice);
    }

    
    getTimeRadius(): number {
        const centerTimeNum = parseFloat(this._centerTime);
        const radiusTimeNum = parseFloat(this._radiusTime);
        return Math.abs(radiusTimeNum - centerTimeNum);
    }
}