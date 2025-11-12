import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class FibonacciSpiralMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _centerPrice: number;
    private _centerTime: string;
    private _radiusPrice: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'center' | 'radius' | 'spiral' | null = null;
    private _showHandles: boolean = false;
    private _spiralPoints: { x: number; y: number }[] = [];
    private _fillOpacity: number = 0.3;
    private markType: MarkType = MarkType.FibonacciSpiral;
    private _goldenRatio: number = 1.61803398875;
    private _radiusPoint: { x: number; y: number } = { x: 0, y: 0 };
    private _spiralStyle: 'standard' | 'extended' = 'standard';
    private _showGrid: boolean = false;
    private _showFibonacciLevels: boolean = false;
    private _baseRadius: number = 0;

    constructor(
        centerPrice: number,
        centerTime: string,
        radiusPrice: number,
        color: string = '#2962FF',
        lineWidth: number = 1,
        isPreview: boolean = false
    ) {
        this._centerPrice = centerPrice;
        this._centerTime = centerTime;
        this._radiusPrice = radiusPrice;
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

    updateCenterPoint(centerPrice: number, centerTime: string) {
        this._centerPrice = centerPrice;
        this._centerTime = centerTime;
        this.requestUpdate();
    }

    updateRadius(radiusPrice: number) {
        this._radiusPrice = radiusPrice;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'center' | 'radius' | 'spiral' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragSpiralByPixels(deltaY: number, deltaX: number = 0) {
        if (isNaN(deltaY) || isNaN(deltaX)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
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
            const newRadiusX = this._radiusPoint.x + deltaX;
            const newRadiusY = this._radiusPoint.y + deltaY;
            const centerY = this._series.priceToCoordinate(this._centerPrice);
            const centerX = timeScale.timeToCoordinate(this._centerTime);
            if (centerY === null || centerX === null) return;
            const dx = newRadiusX - centerX;
            const dy = newRadiusY - centerY;
            const pixelDistance = Math.sqrt(dx * dx + dy * dy);
            const radiusY = centerY + pixelDistance;
            const radiusPrice = this._series.coordinateToPrice(radiusY);
            if (radiusPrice !== null) {
                this._radiusPrice = Math.abs(radiusPrice - this._centerPrice);
                this._radiusPoint = { x: newRadiusX, y: newRadiusY };
                this.requestUpdate();
            }
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'center' | 'radius' | null {
        if (!this._chart || !this._series) return null;
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const timeScale = this._chart.timeScale();
        const centerX = timeScale.timeToCoordinate(this._centerTime);
        if (centerY == null || centerX == null) return null;
        const distToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const distToRadius = Math.sqrt(Math.pow(x - this._radiusPoint.x, 2) + Math.pow(y - this._radiusPoint.y, 2));
        if (distToCenter <= threshold) {
            return 'center';
        }
        if (distToRadius <= threshold) {
            return 'radius';
        }
        return null;
    }

    isPointNearSpiral(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;
        for (let i = 0; i < this._spiralPoints.length - 1; i++) {
            const p1 = this._spiralPoints[i];
            const p2 = this._spiralPoints[i + 1];
            const distance = this.pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distance <= threshold) {
                return true;
            }
        }
        return false;
    }

    private pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
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
        return Math.sqrt(dx * dx + dy * dy);
    }

    private calculateSpiralPoints(centerX: number, centerY: number, pixelRadius: number) {
        this._spiralPoints = [];
        const angleToRadius = Math.atan2(
            this._radiusPoint.y - centerY,
            this._radiusPoint.x - centerX
        );
        this._baseRadius = pixelRadius;
        const totalTurns = 3; 
        const segmentsPerTurn = 72; 
        const totalPoints = totalTurns * segmentsPerTurn;
        for (let i = 0; i <= totalPoints; i++) {
            const angle = angleToRadius + (i / segmentsPerTurn) * Math.PI * 2;
            const growthFactor = 0.15317445; 
            const radius = pixelRadius * Math.exp(growthFactor * (i / segmentsPerTurn) * Math.PI * 2);
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            this._spiralPoints.push({ x, y });
        }
        if (this._spiralPoints.length > 0) {
            let closestPoint = this._spiralPoints[0];
            let minDistance = Number.MAX_VALUE;
            for (const point of this._spiralPoints) {
                const distance = Math.sqrt(
                    Math.pow(point.x - this._radiusPoint.x, 2) +
                    Math.pow(point.y - this._radiusPoint.y, 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = point;
                }
            }
            this._radiusPoint = {
                x: closestPoint.x,
                y: closestPoint.y
            };
        }
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
                    const centerX = timeScale.timeToCoordinate(this._centerTime);

                    if (centerY == null || centerX == null) return;

                    
                    const radiusY = this._series.priceToCoordinate(this._centerPrice + this._radiusPrice);
                    if (radiusY == null) return;

                    const pixelRadius = Math.abs(radiusY - centerY);

                    
                    if (this._radiusPoint.x === 0 && this._radiusPoint.y === 0) {
                        
                        const angle = Math.PI / 4; 
                        this._radiusPoint = {
                            x: centerX + pixelRadius * Math.cos(angle),
                            y: centerY + pixelRadius * Math.sin(angle)
                        };
                    }

                    ctx.save();
                    ctx.lineWidth = this._lineWidth + 2;
                    ctx.lineCap = 'round';

                    if (this._isPreview || this._isDragging) {
                        ctx.globalAlpha = 0.7;
                    } else {
                        ctx.globalAlpha = 1.0;
                    }

                    if (this._isPreview || this._isDragging) {
                        ctx.setLineDash([]);
                    } else {
                        switch (this._lineStyle) {
                            case 'dashed':
                                ctx.setLineDash([]);
                                break;
                            case 'dotted':
                                ctx.setLineDash([]);
                                break;
                            case 'solid':
                            default:
                                ctx.setLineDash([]);
                                break;
                        }
                    }
                    this.calculateSpiralPoints(centerX, centerY, pixelRadius);
                    ctx.strokeStyle = this._color;
                    ctx.setLineDash([]); 
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(this._radiusPoint.x, this._radiusPoint.y);
                    ctx.stroke();
                    ctx.setLineDash([]); 
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth + 2;
                    ctx.setLineDash(this._isPreview ? [] : []);
                    ctx.beginPath();
                    if (this._spiralPoints.length > 0) {
                        ctx.moveTo(centerX, centerY);
                        for (let i = 0; i < this._spiralPoints.length - 2; i += 1) {
                            const p0 = i === 0 ? { x: centerX, y: centerY } : this._spiralPoints[i - 1];
                            const p1 = this._spiralPoints[i];
                            const p2 = this._spiralPoints[i + 1];
                            const p3 = this._spiralPoints[i + 2];
                            const cp1x = p1.x + (p2.x - p0.x) * 0.2;
                            const cp1y = p1.y + (p2.y - p0.y) * 0.2;
                            const cp2x = p2.x - (p3.x - p1.x) * 0.2;
                            const cp2y = p2.y - (p3.y - p1.y) * 0.2;
                            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
                        }
                        if (this._spiralPoints.length >= 2) {
                            const lastIndex = this._spiralPoints.length - 1;
                            const p1 = this._spiralPoints[lastIndex - 1];
                            const p2 = this._spiralPoints[lastIndex];
                            ctx.quadraticCurveTo(
                                p1.x + (p2.x - p1.x) * 0.5,
                                p1.y + (p2.y - p1.y) * 0.5,
                                p2.x,
                                p2.y
                            );
                        }
                    }
                    ctx.stroke();
                    ctx.globalAlpha = this._isPreview || this._isDragging ? 0.7 : 1.0;
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
                        drawHandle(this._radiusPoint.x, this._radiusPoint.y, this._dragPoint === 'radius');
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

    getCenterTime(): string {
        return this._centerTime;
    }

    getRadius(): number {
        return this._radiusPrice;
    }

    getRadiusPoint(): { x: number; y: number } {
        return { ...this._radiusPoint };
    }

    setRadiusPoint(point: { x: number; y: number }) {
        this._radiusPoint = point;
        this.requestUpdate();
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

    public updateSpiralStyle(style: 'standard' | 'extended') {
        this._spiralStyle = style;
        this.requestUpdate();
    }

    public setShowGrid(show: boolean) {
        this._showGrid = show;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        fillOpacity?: number;
        spiralStyle?: 'standard' | 'extended';
        showGrid?: boolean;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.fillOpacity !== undefined) this.updateFillOpacity(styles.fillOpacity);
        if (styles.spiralStyle) this.updateSpiralStyle(styles.spiralStyle);
        if (styles.showGrid !== undefined) this.setShowGrid(styles.showGrid);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            fillOpacity: this._fillOpacity,
            spiralStyle: this._spiralStyle,
            showGrid: this._showGrid
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const timeScale = this._chart.timeScale();

        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const centerX = timeScale.timeToCoordinate(this._centerTime);

        if (centerY == null || centerX == null) return null;

        const pixelRadius = Math.abs(this._series.priceToCoordinate(this._centerPrice + this._radiusPrice) - centerY);
        const maxRadius = pixelRadius * Math.pow(this._goldenRatio, 8);

        return {
            centerX, centerY,
            minX: Math.min(centerX - maxRadius, this._radiusPoint.x),
            maxX: Math.max(centerX + maxRadius, this._radiusPoint.x),
            minY: Math.min(centerY - maxRadius, this._radiusPoint.y),
            maxY: Math.max(centerY + maxRadius, this._radiusPoint.y),
            spiralPoints: this._spiralPoints,
            radiusPoint: this._radiusPoint
        };
    }

    getSpiralPoints(): { x: number; y: number }[] {
        return [...this._spiralPoints];
    }

    getBaseRadius(): number {
        return this._baseRadius;
    }
}