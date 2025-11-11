import { MarkType } from "../../../types";
import { IGraph } from "../../IGraph";
import { IGraphStyle } from "../../IGraphStyle";

export class EllipseMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _centerTime: string;
    private _centerPrice: number;
    private _radiusX: number = 0;
    private _radiusY: number = 0;
    private _angle: number = 0;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'rotate' | 'ellipse' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.Ellipse;
    private _fillColor: string = '';
    private _pixelRadiusX: number = 0;
    private _pixelRadiusY: number = 0;
    private _lastUpdateTime: number = 0;

    constructor(
        centerTime: string,
        centerPrice: number,
        radiusX: number = 0,
        radiusY: number = 0,
        angle: number = 0,
        color: string = '#2962FF',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {
        this._centerTime = centerTime;
        this._centerPrice = centerPrice;
        this._radiusX = radiusX;
        this._radiusY = radiusY;
        this._angle = angle;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._fillColor = this.hexToRGBA(color, 0.2);
        this.calculatePixelRadii();

        this.bindChartEvents();
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
        this.bindChartEvents();
        this.calculatePixelRadii();
        this.requestUpdate();
    }

    updateAllViews() { }

    updateRadii(radiusX: number, radiusY: number) {
        this._radiusX = radiusX;
        this._radiusY = radiusY;
        this.calculatePixelRadii();
        this.requestUpdate();
    }

    updateCenter(centerTime: string, centerPrice: number) {
        this._centerTime = centerTime;
        this._centerPrice = centerPrice;
        this.calculatePixelRadii();
        this.requestUpdate();
    }

    updateAngle(angle: number) {
        this._angle = angle;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    
    setDragging(isDragging: boolean, dragPoint: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'rotate' | 'ellipse' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragEllipseByPixels(deltaX: number, deltaY: number) {
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
    
    getHandlePosition(handleType: 'top' | 'bottom' | 'left' | 'right' | 'rotate'): { x: number; y: number } {
        if (!this._chart || !this._series) return { x: 0, y: 0 };

        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return { x: 0, y: 0 };

        let x = 0, y = 0;
        const radiusX = this.getPixelRadiusX();
        const radiusY = this.getPixelRadiusY();
        const angle = this._angle;

        switch (handleType) {
            case 'top':
                x = centerX + radiusY * Math.sin(angle);
                y = centerY - radiusY * Math.cos(angle);
                break;
            case 'bottom':
                x = centerX - radiusY * Math.sin(angle);
                y = centerY + radiusY * Math.cos(angle);
                break;
            case 'left':
                x = centerX - radiusX * Math.cos(angle);
                y = centerY - radiusX * Math.sin(angle);
                break;
            case 'right':
                x = centerX + radiusX * Math.cos(angle);
                y = centerY + radiusX * Math.sin(angle);
                break;
            case 'rotate':
                
                const rotateDistance = 25; 
                x = centerX + (radiusY + rotateDistance) * Math.sin(angle);
                y = centerY - (radiusY + rotateDistance) * Math.cos(angle);
                break;
        }

        return { x, y };
    }

    
    isPointNearHandle(x: number, y: number, threshold: number = 15): 'center' | 'top' | 'bottom' | 'left' | 'right' | 'rotate' | 'ellipse' | null {
        if (!this._chart || !this._series) return null;

        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX == null || centerY == null) return null;

        const distToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        if (distToCenter <= threshold) {
            return 'center';
        }

        
        const handleTypes: ('top' | 'bottom' | 'left' | 'right' | 'rotate')[] = ['top', 'bottom', 'left', 'right', 'rotate'];
        for (const handleType of handleTypes) {
            const handlePos = this.getHandlePosition(handleType);
            const distToHandle = Math.sqrt(Math.pow(x - handlePos.x, 2) + Math.pow(y - handlePos.y, 2));
            if (distToHandle <= threshold) {
                return handleType;
            }
        }

        if (this.isPointInEllipse(x, y)) {
            return 'ellipse';
        }

        return null;
    }

    calculateRotationAngle(mouseX: number, mouseY: number): number {
        if (!this._chart || !this._series) return this._angle;

        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return this._angle;

        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;

        return Math.atan2(deltaY, deltaX) + Math.PI / 2;
    }

    calculateAngleFromCenter(mouseX: number, mouseY: number): number {
        if (!this._chart || !this._series) return 0;

        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return 0;

        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;

        const cosAngle = Math.cos(-this._angle);
        const sinAngle = Math.sin(-this._angle);
        const localX = deltaX * cosAngle - deltaY * sinAngle;
        const localY = deltaX * sinAngle + deltaY * cosAngle;

        return Math.atan2(localY, localX);
    }

    private bindChartEvents() {
        if (this._chart) {
            const timeScale = this._chart.timeScale();
            if (timeScale && timeScale.subscribeSizeChange) {
                timeScale.subscribeSizeChange(this.handleSizeChange.bind(this));
            }
        }
    }

    private handleSizeChange() {
        const now = Date.now();
        if (now - this._lastUpdateTime < 50) {
            return;
        }
        this._lastUpdateTime = now;

        this.calculatePixelRadii();
        this.requestUpdate();
    }

    private calculatePixelRadii(): void {
        if (!this._chart || !this._series) return;

        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return;

        if (this._radiusX !== 0) {
            try {
                const centerTimeNum = parseFloat(this._centerTime);
                const radiusTimePoint = centerTimeNum + this._radiusX;
                const radiusXCoord = this._chart.timeScale().timeToCoordinate(radiusTimePoint.toString());
                if (radiusXCoord !== null) {
                    this._pixelRadiusX = Math.abs(radiusXCoord - centerX);
                }
            } catch (error) {
                console.warn('Error calculating radius X:', error);
            }
        }

        if (this._radiusY !== 0) {
            try {
                const radiusPricePoint = this._centerPrice + this._radiusY;
                const radiusYCoord = this._series.priceToCoordinate(radiusPricePoint);
                if (radiusYCoord !== null) {
                    this._pixelRadiusY = Math.abs(radiusYCoord - centerY);
                }
            } catch (error) {
                console.warn('Error calculating radius Y:', error);
            }
        }

        this._pixelRadiusX = Math.max(this._pixelRadiusX, 10);
        this._pixelRadiusY = Math.max(this._pixelRadiusY, 10);
    }

    private updateLogicalRadiiFromPixels(): void {
        if (!this._chart || !this._series) return;

        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return;

        try {
            const radiusXTime = this._chart.timeScale().coordinateToTime(centerX + this._pixelRadiusX);
            if (radiusXTime !== null) {
                const centerTimeNum = parseFloat(this._centerTime);
                const radiusTimeNum = parseFloat(radiusXTime.toString());
                this._radiusX = Math.abs(radiusTimeNum - centerTimeNum);
            }
        } catch (error) {
            console.warn('Error updating logical radius X:', error);
        }

        try {
            const radiusYPrice = this._series.coordinateToPrice(centerY + this._pixelRadiusY);
            if (radiusYPrice !== null && !isNaN(radiusYPrice)) {
                this._radiusY = Math.abs(radiusYPrice - this._centerPrice);
            }
        } catch (error) {
            console.warn('Error updating logical radius Y:', error);
        }
    }

    updatePixelRadii(newRadiusX: number, newRadiusY: number) {
        this._pixelRadiusX = Math.max(newRadiusX, 10);
        this._pixelRadiusY = Math.max(newRadiusY, 10);

        this.updateLogicalRadiiFromPixels();

        this.requestUpdate();
    }

    forceUpdate() {
        this.calculatePixelRadii();
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
                    const radiusX = this.getPixelRadiusX();
                    const radiusY = this.getPixelRadiusY();
                    const angle = this._angle;
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
                    ctx.translate(centerX, centerY);
                    ctx.rotate(angle);
                    if (!this._isPreview) {
                        ctx.fillStyle = this._fillColor;
                        ctx.beginPath();
                        ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.beginPath();
                    ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.rotate(-angle);
                    ctx.translate(-centerX, -centerY);
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, isActive: boolean = false, isRotateHandle: boolean = false) => {
                            ctx.save();
                            if (isRotateHandle) {
                                ctx.fillStyle = '#FF4444'; 
                            } else {
                                ctx.fillStyle = this._color;
                            }
                            ctx.beginPath();
                            ctx.arc(x, y, 5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(x, y, 3, 0, Math.PI * 2);
                            ctx.fill();

                            if (isActive) {
                                ctx.strokeStyle = isRotateHandle ? '#FF4444' : this._color;
                                ctx.lineWidth = 1;
                                ctx.setLineDash([]);
                                ctx.beginPath();
                                ctx.arc(x, y, 8, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            ctx.restore();
                        };
                        drawHandle(centerX, centerY, this._dragPoint === 'center');
                        const handleTypes: ('top' | 'bottom' | 'left' | 'right' | 'rotate')[] = ['top', 'bottom', 'left', 'right', 'rotate'];
                        for (const handleType of handleTypes) {
                            const handlePos = this.getHandlePosition(handleType);
                            drawHandle(handlePos.x, handlePos.y, this._dragPoint === handleType, handleType === 'rotate');
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

    getRadiusX(): number {
        return this._radiusX;
    }

    getRadiusY(): number {
        return this._radiusY;
    }

    getAngle(): number {
        return this._angle;
    }

    getPixelRadiusX(): number {
        return this._pixelRadiusX;
    }

    getPixelRadiusY(): number {
        return this._pixelRadiusY;
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

        const radiusX = this.getPixelRadiusX();
        const radiusY = this.getPixelRadiusY();
        const angle = this._angle;

        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const boundX = Math.sqrt(Math.pow(radiusX * cosAngle, 2) + Math.pow(radiusY * sinAngle, 2));
        const boundY = Math.sqrt(Math.pow(radiusX * sinAngle, 2) + Math.pow(radiusY * cosAngle, 2));

        return {
            centerX, centerY, radiusX, radiusY, angle,
            minX: centerX - boundX,
            maxX: centerX + boundX,
            minY: centerY - boundY,
            maxY: centerY + boundY
        };
    }

    isPointInEllipse(x: number, y: number, threshold: number = 5): boolean {
        const bounds = this.getBounds();
        if (!bounds) return false;

        const { centerX, centerY, radiusX, radiusY, angle } = bounds;

        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const cosAngle = Math.cos(-angle);
        const sinAngle = Math.sin(-angle);
        const localX = deltaX * cosAngle - deltaY * sinAngle;
        const localY = deltaX * sinAngle + deltaY * cosAngle;

        const normalizedDistance = Math.pow(localX / radiusX, 2) + Math.pow(localY / radiusY, 2);
        return normalizedDistance <= 1 + (threshold / Math.min(radiusX, radiusY));
    }
}