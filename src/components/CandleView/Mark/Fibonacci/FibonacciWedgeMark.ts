import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class FibonacciWedgeMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _centerPrice: number;
    private _radiusPrice: number;
    private _anglePrice: number;
    private _centerTime: number;
    private _radiusTime: number;
    private _angleTime: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'center' | 'radius' | 'angle' | 'wedge' | null = null;
    private _showHandles: boolean = false;
    private _fibonacciLevels: number[] = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 4.236, 6.854];
    private _fibonacciColors: string[] = [
        '#FF1744', '#00E5FF', '#D500F9', '#00E676', '#FF9100',
        '#8D6E63', '#546E7A', '#F50057', '#304FFE', '#00BFA5', '#FF6D00'
    ];
    private _fillOpacity: number = 0.2;
    private _wedgeAngle: number = 45;
    private markType: MarkType = MarkType.FibonacciWedge;
    private _fibonacciWedgePositions: { radius: number; level: number; startAngle: number; endAngle: number }[] = [];
    private _radiusLength: number = 0;
    private _centerAngle: number = 0;

    constructor(
        centerPrice: number,
        radiusPrice: number,
        anglePrice: number,
        centerTime: number,
        radiusTime: number,
        angleTime: number,
        color: string = '#FF3D00',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {
        this._centerPrice = centerPrice;
        this._radiusPrice = radiusPrice;
        this._anglePrice = anglePrice;
        this._centerTime = centerTime;
        this._radiusTime = radiusTime;
        this._angleTime = angleTime;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._fillOpacity = 0.1;
        this._updateWedgeAngle();
    }

    private _updateWedgeAngle() {
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const radiusY = this._series.priceToCoordinate(this._radiusPrice);
        const angleY = this._series.priceToCoordinate(this._anglePrice);
        const centerX = timeScale.timeToCoordinate(this._centerTime);
        const radiusX = timeScale.timeToCoordinate(this._radiusTime);
        const angleX = timeScale.timeToCoordinate(this._angleTime);
        if (centerY === null || radiusY === null || angleY === null ||
            centerX === null || radiusX === null || angleX === null) return;
        const radiusAngle = Math.atan2(radiusY - centerY, radiusX - centerX);
        const angleAngle = Math.atan2(angleY - centerY, angleX - centerX);
        let angleDiff = Math.abs(radiusAngle - angleAngle);
        angleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
        this._wedgeAngle = angleDiff * (180 / Math.PI);
        const midAngle = (radiusAngle + angleAngle) / 2;
        this._centerAngle = midAngle * (180 / Math.PI);
        const radiusLength1 = Math.sqrt(Math.pow(radiusX - centerX, 2) + Math.pow(radiusY - centerY, 2));
        const radiusLength2 = Math.sqrt(Math.pow(angleX - centerX, 2) + Math.pow(angleY - centerY, 2));
        this._radiusLength = Math.min(radiusLength1, radiusLength2);
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

    updateRadiusPoint(radiusPrice: number, radiusTime: number) {
        this._radiusPrice = radiusPrice;
        this._radiusTime = radiusTime;
        this.requestUpdate();
    }

    updateAnglePoint(anglePrice: number, angleTime: number) {
        this._anglePrice = anglePrice;
        this._angleTime = angleTime;
        this._updateWedgeAngle();
        this.requestUpdate();
    }

    updateCenterPoint(centerPrice: number, centerTime: number) {
        this._centerPrice = centerPrice;
        this._centerTime = centerTime;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'center' | 'radius' | 'angle' | 'wedge' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragWedgeByPixels(deltaY: number, deltaX: number = 0) {
        if (isNaN(deltaY) || isNaN(deltaX)) {
            return;
        }
        if (!this._chart || !this._series) return;

        const timeScale = this._chart.timeScale();

        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const radiusY = this._series.priceToCoordinate(this._radiusPrice);
        const angleY = this._series.priceToCoordinate(this._anglePrice);
        const centerX = timeScale.timeToCoordinate(this._centerTime);
        const radiusX = timeScale.timeToCoordinate(this._radiusTime);
        const angleX = timeScale.timeToCoordinate(this._angleTime);

        if (centerY === null || radiusY === null || angleY === null ||
            centerX === null || radiusX === null || angleX === null) return;

        const newCenterY = centerY + deltaY;
        const newRadiusY = radiusY + deltaY;
        const newAngleY = angleY + deltaY;
        const newCenterX = centerX + deltaX;
        const newRadiusX = radiusX + deltaX;
        const newAngleX = angleX + deltaX;

        const newCenterPrice = this._series.coordinateToPrice(newCenterY);
        const newRadiusPrice = this._series.coordinateToPrice(newRadiusY);
        const newAnglePrice = this._series.coordinateToPrice(newAngleY);
        const newCenterTime = timeScale.coordinateToTime(newCenterX);
        const newRadiusTime = timeScale.coordinateToTime(newRadiusX);
        const newAngleTime = timeScale.coordinateToTime(newAngleX);

        if (newCenterPrice !== null && newRadiusPrice !== null && newAnglePrice !== null &&
            newCenterTime !== null && newRadiusTime !== null && newAngleTime !== null) {
            this._centerPrice = newCenterPrice;
            this._radiusPrice = newRadiusPrice;
            this._anglePrice = newAnglePrice;
            this._centerTime = newCenterTime;
            this._radiusTime = newRadiusTime;
            this._angleTime = newAngleTime;
            this.requestUpdate();
        }
    }

    dragHandleByPixels(deltaY: number, deltaX: number = 0, handleType: 'center' | 'radius' | 'angle') {
        if (isNaN(deltaY) || isNaN(deltaX)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        if (handleType === 'center') {
            const centerY = this._series.priceToCoordinate(this._centerPrice);
            const centerX = timeScale.timeToCoordinate(this._centerTime);
            const radiusY = this._series.priceToCoordinate(this._radiusPrice);
            const radiusX = timeScale.timeToCoordinate(this._radiusTime);
            const angleY = this._series.priceToCoordinate(this._anglePrice);
            const angleX = timeScale.timeToCoordinate(this._angleTime);
            if (centerY === null || centerX === null || radiusY === null ||
                radiusX === null || angleY === null || angleX === null) return;
            const newCenterY = centerY + deltaY;
            const newCenterX = centerX + deltaX;
            const newRadiusY = radiusY + deltaY;
            const newRadiusX = radiusX + deltaX;
            const newAngleY = angleY + deltaY;
            const newAngleX = angleX + deltaX;
            const newCenterPrice = this._series.coordinateToPrice(newCenterY);
            const newCenterTime = timeScale.coordinateToTime(newCenterX);
            const newRadiusPrice = this._series.coordinateToPrice(newRadiusY);
            const newRadiusTime = timeScale.coordinateToTime(newRadiusX);
            const newAnglePrice = this._series.coordinateToPrice(newAngleY);
            const newAngleTime = timeScale.coordinateToTime(newAngleX);
            if (newCenterPrice !== null && newCenterTime !== null &&
                newRadiusPrice !== null && newRadiusTime !== null &&
                newAnglePrice !== null && newAngleTime !== null) {
                this._centerPrice = newCenterPrice;
                this._centerTime = newCenterTime;
                this._radiusPrice = newRadiusPrice;
                this._radiusTime = newRadiusTime;
                this._anglePrice = newAnglePrice;
                this._angleTime = newAngleTime;
                this.requestUpdate();
            }
        } else if (handleType === 'radius') {
            const centerY = this._series.priceToCoordinate(this._centerPrice);
            const centerX = timeScale.timeToCoordinate(this._centerTime);
            const radiusY = this._series.priceToCoordinate(this._radiusPrice);
            const radiusX = timeScale.timeToCoordinate(this._radiusTime);
            if (centerY === null || centerX === null || radiusY === null || radiusX === null) return;
            const newRadiusY = radiusY + deltaY;
            const newRadiusX = radiusX + deltaX;
            const newRadiusPrice = this._series.coordinateToPrice(newRadiusY);
            const newRadiusTime = timeScale.coordinateToTime(newRadiusX);
            if (newRadiusPrice !== null && newRadiusTime !== null) {
                this._radiusPrice = newRadiusPrice;
                this._radiusTime = newRadiusTime;
                this._updateWedgeAngle();
                this.requestUpdate();
            }
        } else if (handleType === 'angle') {
            const centerY = this._series.priceToCoordinate(this._centerPrice);
            const centerX = timeScale.timeToCoordinate(this._centerTime);
            const angleY = this._series.priceToCoordinate(this._anglePrice);
            const angleX = timeScale.timeToCoordinate(this._angleTime);
            if (centerY === null || centerX === null || angleY === null || angleX === null) return;
            const newAngleY = angleY + deltaY;
            const newAngleX = angleX + deltaX;
            const newAnglePrice = this._series.coordinateToPrice(newAngleY);
            const newAngleTime = timeScale.coordinateToTime(newAngleX);
            if (newAnglePrice !== null && newAngleTime !== null) {
                this._anglePrice = newAnglePrice;
                this._angleTime = newAngleTime;
                this._updateWedgeAngle();
                this.requestUpdate();
            }
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'center' | 'radius' | 'angle' | null {
        if (!this._chart || !this._series) return null;

        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const radiusY = this._series.priceToCoordinate(this._radiusPrice);
        const angleY = this._series.priceToCoordinate(this._anglePrice);
        const timeScale = this._chart.timeScale();
        const centerX = timeScale.timeToCoordinate(this._centerTime);
        const radiusX = timeScale.timeToCoordinate(this._radiusTime);
        const angleX = timeScale.timeToCoordinate(this._angleTime);

        if (centerY == null || radiusY == null || angleY == null ||
            centerX == null || radiusX == null || angleX == null) return null;

        const distToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const distToRadius = Math.sqrt(Math.pow(x - radiusX, 2) + Math.pow(y - radiusY, 2));
        const distToAngle = Math.sqrt(Math.pow(x - angleX, 2) + Math.pow(y - angleY, 2));

        if (distToCenter <= threshold) {
            return 'center';
        }
        if (distToRadius <= threshold) {
            return 'radius';
        }
        if (distToAngle <= threshold) {
            return 'angle';
        }
        return null;
    }

    isPointNearFibonacciWedge(x: number, y: number, threshold: number = 15): number | null {
        if (!this._chart || !this._series) return null;
        const timeScale = this._chart.timeScale();
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const centerX = timeScale.timeToCoordinate(this._centerTime);
        if (centerY == null || centerX == null) return null;
        const radiusY = this._series.priceToCoordinate(this._radiusPrice);
        const radiusX = timeScale.timeToCoordinate(this._radiusTime);
        if (radiusY == null || radiusX == null) return null;
        const radiusPixels = Math.sqrt(Math.pow(radiusX - centerX, 2) + Math.pow(radiusY - centerY, 2));
        const angleRad = this._wedgeAngle * (Math.PI / 180);
        const wedgeSpread = 30 * (Math.PI / 180);
        for (let i = 0; i < this._fibonacciLevels.length; i++) {
            const level = this._fibonacciLevels[i];
            const currentRadius = radiusPixels * level;
            if (currentRadius <= 0) continue;
            const distanceToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const pointAngle = Math.atan2(y - centerY, x - centerX);
            const angleDiff = Math.abs(pointAngle - angleRad);
            const normalizedAngleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
            const distanceToArc = Math.abs(distanceToCenter - currentRadius);
            const isInWedge = normalizedAngleDiff <= wedgeSpread / 2;
            if (distanceToArc <= threshold && isInWedge && currentRadius > 0) {
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

    getCenterAngle(): number {
        return this._centerAngle;
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
                    const angleY = this._series.priceToCoordinate(this._anglePrice);
                    const centerX = timeScale.timeToCoordinate(this._centerTime);
                    const radiusX = timeScale.timeToCoordinate(this._radiusTime);
                    const angleX = timeScale.timeToCoordinate(this._angleTime);
                    if (centerY == null || radiusY == null || angleY == null ||
                        centerX == null || radiusX == null || angleX == null) return;
                    this._fibonacciWedgePositions = [];
                    ctx.save();
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    const radiusAngle = Math.atan2(radiusY - centerY, radiusX - centerX);
                    const angleAngle = Math.atan2(angleY - centerY, angleX - centerX);
                    let angleDiff = Math.abs(radiusAngle - angleAngle);
                    angleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
                    const midAngle = (radiusAngle + angleAngle) / 2;
                    const startAngle = midAngle - angleDiff / 2;
                    const endAngle = midAngle + angleDiff / 2;
                    const radiusLength1 = Math.sqrt(Math.pow(radiusX - centerX, 2) + Math.pow(radiusY - centerY, 2));
                    const radiusLength2 = Math.sqrt(Math.pow(angleX - centerX, 2) + Math.pow(angleY - centerY, 2));
                    const radiusPixels = Math.min(radiusLength1, radiusLength2);
                    for (let i = 0; i < this._fibonacciLevels.length; i++) {
                        const level = this._fibonacciLevels[i];
                        const currentRadius = radiusPixels * level;
                        if (currentRadius <= 0) continue;
                        this._fibonacciWedgePositions.push({
                            radius: currentRadius,
                            level: level,
                            startAngle: startAngle,
                            endAngle: endAngle
                        });
                        if (this._fillOpacity > 0) {
                            ctx.save();
                            ctx.fillStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                            ctx.globalAlpha = this._fillOpacity;
                            ctx.beginPath();
                            ctx.moveTo(centerX, centerY);
                            ctx.arc(centerX, centerY, currentRadius, startAngle, endAngle);
                            ctx.closePath();
                            ctx.fill();
                            ctx.restore();
                        }
                        ctx.save();
                        ctx.strokeStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                        ctx.globalAlpha = 1.0;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, currentRadius, startAngle, endAngle);
                        ctx.stroke();
                        ctx.restore();
                        ctx.save();
                        ctx.fillStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                        ctx.globalAlpha = 1.0;
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        const labelX = centerX + Math.cos(midAngle) * currentRadius;
                        const labelY = centerY + Math.sin(midAngle) * currentRadius;
                        ctx.fillText(
                            `${(level * 100).toFixed(1)}%`,
                            labelX + 15 * Math.cos(midAngle),
                            labelY + 15 * Math.sin(midAngle)
                        );
                        ctx.restore();
                    }
                    ctx.save();
                    ctx.strokeStyle = this._color;
                    ctx.globalAlpha = 1.0;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(radiusX, radiusY);
                    ctx.stroke();
                    ctx.strokeStyle = this._color;
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(angleX, angleY);
                    ctx.stroke();
                    ctx.restore();
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, isActive: boolean = false) => {
                            ctx.save();
                            ctx.fillStyle = this._color;
                            ctx.globalAlpha = 1.0;
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
                        drawHandle(angleX, angleY, this._dragPoint === 'angle');
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

    getAnglePrice(): number {
        return this._anglePrice;
    }

    getCenterTime(): number {
        return this._centerTime;
    }

    getRadiusTime(): number {
        return this._radiusTime;
    }

    getAngleTime(): number {
        return this._angleTime;
    }

    getWedgeAngle(): number {
        return this._wedgeAngle;
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
        const angleY = this._series.priceToCoordinate(this._anglePrice);
        const centerX = timeScale.timeToCoordinate(this._centerTime);
        const radiusX = timeScale.timeToCoordinate(this._radiusTime);
        const angleX = timeScale.timeToCoordinate(this._angleTime);

        if (centerY == null || radiusY == null || angleY == null ||
            centerX == null || radiusX == null || angleX == null) return null;

        const radiusPixels = Math.sqrt(Math.pow(radiusX - centerX, 2) + Math.pow(radiusY - centerY, 2));
        const angleRad = this._wedgeAngle * (Math.PI / 180);

        return {
            centerX, centerY, radiusX, radiusY, angleX, angleY,
            minX: centerX - radiusPixels,
            maxX: centerX + radiusPixels,
            minY: centerY - radiusPixels,
            maxY: centerY + radiusPixels,
            fibonacciWedgePositions: this._fibonacciWedgePositions
        };
    }

    getFibonacciLevels(): number[] {
        return [...this._fibonacciLevels];
    }

    getFibonacciWedgePositions(): { radius: number; level: number; startAngle: number; endAngle: number }[] {
        return [...this._fibonacciWedgePositions];
    }

    getFibonacciColors(): string[] {
        return [...this._fibonacciColors];
    }

    getPriceRadius(): number {
        return Math.abs(this._radiusPrice - this._centerPrice);
    }

    getTimeRadius(): number {
        return Math.abs(this._radiusTime - this._centerTime);
    }
}