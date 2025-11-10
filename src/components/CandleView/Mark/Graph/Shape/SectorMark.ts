import { MarkType } from "../../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class SectorMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _centerPrice: number;
    private _radiusPrice: number;
    private _anglePrice: number;
    private _centerTime: string;
    private _radiusTime: string;
    private _angleTime: string;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'center' | 'radius' | 'angle' | 'sector' | null = null;
    private _showHandles: boolean = false;
    private _fillOpacity: number = 0.3;
    private _sectorAngle: number = 0;
    private markType: MarkType = MarkType.Sector;
    private _radiusLength: number = 0;
    private _centerAngle: number = 0;

    constructor(
        centerPrice: number,
        radiusPrice: number,
        anglePrice: number,
        centerTime: string,
        radiusTime: string,
        angleTime: string,
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
        this._updateSectorAngle();
    }

    private _updateSectorAngle() {
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
        this._sectorAngle = angleDiff * (180 / Math.PI);
        
        const midAngle = (radiusAngle + angleAngle) / 2;
        this._centerAngle = midAngle * (180 / Math.PI);
        
        const radiusLength1 = Math.sqrt(Math.pow(radiusX - centerX, 2) + Math.pow(radiusY - centerY, 2));
        const radiusLength2 = Math.sqrt(Math.pow(angleX - centerX, 2) + Math.pow(angleY - centerY, 2));
        this._radiusLength = Math.max(radiusLength1, radiusLength2);
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
        this._updateSectorAngle();
        this.requestUpdate();
    }

    updateAnglePoint(anglePrice: number, angleTime: string) {
        this._anglePrice = anglePrice;
        this._angleTime = angleTime;
        this._updateSectorAngle();
        this.requestUpdate();
    }

    updateCenterPoint(centerPrice: number, centerTime: string) {
        this._centerPrice = centerPrice;
        this._centerTime = centerTime;
        this._updateSectorAngle();
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'center' | 'radius' | 'angle' | 'sector' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragSectorByPixels(deltaY: number, deltaX: number = 0) {
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
            this._centerTime = newCenterTime.toString();
            this._radiusTime = newRadiusTime.toString();
            this._angleTime = newAngleTime.toString();
            this._updateSectorAngle();
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
                this._centerTime = newCenterTime.toString();
                this._radiusPrice = newRadiusPrice;
                this._radiusTime = newRadiusTime.toString();
                this._anglePrice = newAnglePrice;
                this._angleTime = newAngleTime.toString();
                this._updateSectorAngle();
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
                this._radiusTime = newRadiusTime.toString();
                this._updateSectorAngle();
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
                this._angleTime = newAngleTime.toString();
                this._updateSectorAngle();
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

    isPointNearSector(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;

        const timeScale = this._chart.timeScale();
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const centerX = timeScale.timeToCoordinate(this._centerTime);

        if (centerY == null || centerX == null) return false;

        const radiusY = this._series.priceToCoordinate(this._radiusPrice);
        const radiusX = timeScale.timeToCoordinate(this._radiusTime);

        if (radiusY == null || radiusX == null) return false;

        
        const distanceToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const pointAngle = Math.atan2(y - centerY, x - centerX);

        
        const radiusAngle = Math.atan2(radiusY - centerY, radiusX - centerX);
        const angleAngle = Math.atan2(
            this._series.priceToCoordinate(this._anglePrice) - centerY,
            timeScale.timeToCoordinate(this._angleTime) - centerX
        );

        const startAngle = Math.min(radiusAngle, angleAngle);
        const endAngle = Math.max(radiusAngle, angleAngle);
        const angleDiff = endAngle - startAngle;

        
        const isInAngleRange = pointAngle >= startAngle && pointAngle <= endAngle;
        const distanceToArc = Math.abs(distanceToCenter - this._radiusLength);

        return distanceToArc <= threshold && isInAngleRange && distanceToCenter <= this._radiusLength;
    }

    isPointInsideSector(x: number, y: number): boolean {
        if (!this._chart || !this._series) return false;

        const timeScale = this._chart.timeScale();
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        const centerX = timeScale.timeToCoordinate(this._centerTime);

        if (centerY == null || centerX == null) return false;

        
        const distanceToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const pointAngle = Math.atan2(y - centerY, x - centerX);

        
        const radiusAngle = Math.atan2(
            this._series.priceToCoordinate(this._radiusPrice) - centerY,
            timeScale.timeToCoordinate(this._radiusTime) - centerX
        );
        const angleAngle = Math.atan2(
            this._series.priceToCoordinate(this._anglePrice) - centerY,
            timeScale.timeToCoordinate(this._angleTime) - centerX
        );

        const startAngle = Math.min(radiusAngle, angleAngle);
        const endAngle = Math.max(radiusAngle, angleAngle);

        
        const isInAngleRange = pointAngle >= startAngle && pointAngle <= endAngle;

        return isInAngleRange && distanceToCenter <= this._radiusLength;
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

                    ctx.save();
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';

                    
                    const radiusAngle = Math.atan2(radiusY - centerY, radiusX - centerX);
                    const angleAngle = Math.atan2(angleY - centerY, angleX - centerX);

                    const startAngle = Math.min(radiusAngle, angleAngle);
                    const endAngle = Math.max(radiusAngle, angleAngle);

                    
                    const radiusLength1 = Math.sqrt(Math.pow(radiusX - centerX, 2) + Math.pow(radiusY - centerY, 2));
                    const radiusLength2 = Math.sqrt(Math.pow(angleX - centerX, 2) + Math.pow(angleY - centerY, 2));
                    const radiusPixels = Math.max(radiusLength1, radiusLength2);

                    
                    if (this._fillOpacity > 0) {
                        ctx.save();
                        ctx.fillStyle = this._color;
                        ctx.globalAlpha = this._fillOpacity;
                        ctx.beginPath();
                        ctx.moveTo(centerX, centerY);
                        ctx.arc(centerX, centerY, radiusPixels, startAngle, endAngle);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    }

                    
                    ctx.save();
                    ctx.strokeStyle = this._color;
                    ctx.globalAlpha = 1.0;

                    
                    switch (this._lineStyle) {
                        case 'dashed':
                            ctx.setLineDash([5, 5]);
                            break;
                        case 'dotted':
                            ctx.setLineDash([2, 2]);
                            break;
                        default:
                            ctx.setLineDash([]);
                    }

                    
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radiusPixels, startAngle, endAngle);
                    ctx.stroke();

                    
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(
                        centerX + radiusPixels * Math.cos(startAngle),
                        centerY + radiusPixels * Math.sin(startAngle)
                    );
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(
                        centerX + radiusPixels * Math.cos(endAngle),
                        centerY + radiusPixels * Math.sin(endAngle)
                    );
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

    getCenterTime(): string {
        return this._centerTime;
    }

    getRadiusTime(): string {
        return this._radiusTime;
    }

    getAngleTime(): string {
        return this._angleTime;
    }

    getSectorAngle(): number {
        return this._sectorAngle;
    }

    getRadiusLength(): number {
        return this._radiusLength;
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
            fillOpacity: this._fillOpacity
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

        const radiusPixels = this._radiusLength;

        return {
            centerX, centerY, radiusX, radiusY, angleX, angleY,
            minX: centerX - radiusPixels,
            maxX: centerX + radiusPixels,
            minY: centerY - radiusPixels,
            maxY: centerY + radiusPixels,
            radiusLength: radiusPixels,
            sectorAngle: this._sectorAngle
        };
    }
}