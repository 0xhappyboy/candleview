import { MarkType } from "../../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class FibonacciArcMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _startPrice: number;
    private _endPrice: number;
    private _startTime: string;
    private _endTime: string;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'line' | null = null;
    private _showHandles: boolean = false;
    private _fibonacciLevels: number[] = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.414, 1.618, 2.0];
    private _fibonacciColors: string[] = [
        '#FF4444', '#FF6B6B', '#FF9800', '#4CAF50', '#2196F3',
        '#9C27B0', '#E91E63', '#FF5722', '#00BCD4', '#FFEB3B', '#8BC34A'
    ];
    private _fillOpacity: number = 0.3;
    private markType: MarkType = MarkType.FibonacciArc;
    private _arcSegments: { level: number; path: Path2D; centerX: number; centerY: number; radius: number }[] = [];
    private _arcDirection: 'up' | 'down' = 'up';

    constructor(
        startPrice: number,
        endPrice: number,
        startTime: string,
        endTime: string,
        color: string = '#2962FF',
        lineWidth: number = 1,
        isPreview: boolean = false,
        dragSensitivity: number = 2.5
    ) {
        this._startPrice = startPrice;
        this._endPrice = endPrice;
        this._startTime = startTime;
        this._endTime = endTime;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._updateArcDirection();
    }

    private _updateArcDirection() {
        this._arcDirection = this._endPrice >= this._startPrice ? 'down' : 'up';
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

    updateEndPoint(endPrice: number, endTime: string) {
        this._endPrice = endPrice;
        this._endTime = endTime;
        this._updateArcDirection();
        this.requestUpdate();
    }

    updateStartPoint(startPrice: number, startTime: string) {
        this._startPrice = startPrice;
        this._startTime = startTime;
        this._updateArcDirection();
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'line' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragLineByPixels(deltaY: number, deltaX: number = 0) {
        if (isNaN(deltaY) || isNaN(deltaX)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        if (startY === null || endY === null || startX === null || endX === null) return;
        const newStartY = startY + deltaY;
        const newEndY = endY + deltaY;
        const newStartX = startX + deltaX;
        const newEndX = endX + deltaX;
        const newStartPrice = this._series.coordinateToPrice(newStartY);
        const newEndPrice = this._series.coordinateToPrice(newEndY);
        const newStartTime = timeScale.coordinateToTime(newStartX);
        const newEndTime = timeScale.coordinateToTime(newEndX);
        if (newStartPrice !== null && newEndPrice !== null && newStartTime !== null && newEndTime !== null) {
            this._startPrice = newStartPrice;
            this._endPrice = newEndPrice;
            this._startTime = newStartTime.toString();
            this._endTime = newEndTime.toString();
            this._updateArcDirection();
            this.requestUpdate();
        }
    }

    dragHandleByPixels(deltaY: number, deltaX: number = 0, handleType: 'start' | 'end') {
        if (isNaN(deltaY) || isNaN(deltaX)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();

        if (handleType === 'start') {
            
            const startY = this._series.priceToCoordinate(this._startPrice);
            const startX = timeScale.timeToCoordinate(this._startTime);
            if (startY === null || startX === null) return;
            const newStartY = startY + deltaY;
            const newStartX = startX + deltaX;
            const newStartPrice = this._series.coordinateToPrice(newStartY);
            const newStartTime = timeScale.coordinateToTime(newStartX);
            if (newStartPrice !== null && newStartTime !== null) {
                this._startPrice = newStartPrice;
                this._startTime = newStartTime.toString();
                this._updateArcDirection();
                this.requestUpdate();
            }
        } else if (handleType === 'end') {
            
            const startY = this._series.priceToCoordinate(this._startPrice);
            const startX = timeScale.timeToCoordinate(this._startTime);
            const endY = this._series.priceToCoordinate(this._endPrice);
            const endX = timeScale.timeToCoordinate(this._endTime);

            if (startY === null || startX === null || endY === null || endX === null) return;

            
            const baseRadius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            const sixthLevel = this._fibonacciLevels[5]; 
            const sixthRadius = baseRadius * sixthLevel;
            const angle = Math.atan2(endY - startY, endX - startX);
            const sixthX = startX + sixthRadius * Math.cos(angle);
            const sixthY = startY + sixthRadius * Math.sin(angle);

            
            const newSixthX = sixthX + deltaX;
            const newSixthY = sixthY + deltaY;

            
            const newAngle = Math.atan2(newSixthY - startY, newSixthX - startX);
            const newSixthRadius = Math.sqrt(Math.pow(newSixthX - startX, 2) + Math.pow(newSixthY - startY, 2));

            
            const newBaseRadius = newSixthRadius / sixthLevel;

            
            const actualEndX = startX + newBaseRadius * Math.cos(newAngle);
            const actualEndY = startY + newBaseRadius * Math.sin(newAngle);

            const newEndPrice = this._series.coordinateToPrice(actualEndY);
            const newEndTime = timeScale.coordinateToTime(actualEndX);

            if (newEndPrice !== null && newEndTime !== null) {
                this._endPrice = newEndPrice;
                this._endTime = newEndTime.toString();
                this._updateArcDirection();
                this.requestUpdate();
            }
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | null {
        if (!this._chart || !this._series) return null;
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        if (startY == null || endY == null || startX == null || endX == null) return null;

        
        const distToStart = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));

        
        const baseRadius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const sixthLevel = this._fibonacciLevels[5]; 
        const sixthRadius = baseRadius * sixthLevel;
        const angle = Math.atan2(endY - startY, endX - startX);
        const sixthX = startX + sixthRadius * Math.cos(angle);
        const sixthY = startY + sixthRadius * Math.sin(angle);

        const distToEnd = Math.sqrt(Math.pow(x - sixthX, 2) + Math.pow(y - sixthY, 2));

        if (distToStart <= threshold) {
            return 'start';
        }
        if (distToEnd <= threshold) {
            return 'end';
        }
        return null;
    }

    isPointNearArc(x: number, y: number, threshold: number = 15): number | null {
        if (!this._chart || !this._series) return null;
        const timeScale = this._chart.timeScale();
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        if (startY == null || endY == null || startX == null || endX == null) return null;

        
        const centerX = startX; 
        const centerY = startY;
        const baseRadius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

        for (let i = 0; i < this._fibonacciLevels.length; i++) {
            const level = this._fibonacciLevels[i];
            const radius = baseRadius * level;

            
            const distanceToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const distanceToArc = Math.abs(distanceToCenter - radius);

            if (distanceToArc <= threshold) {
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
        return this._startTime;
    }

    priceValue() {
        return this._startPrice;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const timeScale = this._chart.timeScale();
                    const startY = this._series.priceToCoordinate(this._startPrice);
                    const endY = this._series.priceToCoordinate(this._endPrice);
                    const startX = timeScale.timeToCoordinate(this._startTime);
                    const endX = timeScale.timeToCoordinate(this._endTime);
                    if (startY == null || endY == null || startX == null || endX == null) return;

                    this._arcSegments = [];
                    ctx.save();

                    
                    if (this._isPreview || this._isDragging) {
                        ctx.globalAlpha = 0.7;
                    } else {
                        ctx.globalAlpha = 1.0;
                    }

                    
                    const centerX = startX;
                    const centerY = startY;
                    const baseRadius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

                    
                    const sixthLevel = this._fibonacciLevels[5]; 
                    const sixthRadius = baseRadius * sixthLevel;
                    const angle = Math.atan2(endY - centerY, endX - centerX);
                    const sixthX = centerX + sixthRadius * Math.cos(angle);
                    const sixthY = centerY + sixthRadius * Math.sin(angle);

                    
                    for (let i = 0; i < this._fibonacciLevels.length - 1; i++) {
                        const currentLevel = this._fibonacciLevels[i];
                        const nextLevel = this._fibonacciLevels[i + 1];
                        const currentRadius = baseRadius * currentLevel;
                        const nextRadius = baseRadius * nextLevel;

                        
                        ctx.fillStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                        ctx.globalAlpha = 0.15; 

                        ctx.beginPath();
                        if (this._arcDirection === 'up') {
                            
                            ctx.arc(centerX, centerY, nextRadius, 0, Math.PI, false);
                            ctx.arc(centerX, centerY, currentRadius, Math.PI, 0, true);
                        } else {
                            
                            ctx.arc(centerX, centerY, nextRadius, Math.PI, 0, false);
                            ctx.arc(centerX, centerY, currentRadius, 0, Math.PI, true);
                        }
                        ctx.closePath();
                        ctx.fill();
                    }

                    
                    if (this._isPreview || this._isDragging) {
                        ctx.globalAlpha = 0.7;
                    } else {
                        ctx.globalAlpha = 1.0;
                    }
                    for (let i = 0; i < this._fibonacciLevels.length; i++) {
                        const level = this._fibonacciLevels[i];
                        const radius = baseRadius * level;
                        ctx.strokeStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                        ctx.lineWidth = this._lineWidth + (i * 0.3); 
                        ctx.lineCap = 'round';
                        ctx.setLineDash([]);
                        ctx.beginPath();
                        if (this._arcDirection === 'up') {
                            
                            ctx.arc(centerX, centerY, radius, 0, Math.PI, false);
                        } else {
                            
                            ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
                        }
                        ctx.stroke();
                        const path = new Path2D();
                        if (this._arcDirection === 'up') {
                            path.arc(centerX, centerY, radius, 0, Math.PI, false);
                        } else {
                            path.arc(centerX, centerY, radius, Math.PI, 0, false);
                        }
                        this._arcSegments.push({
                            level: level,
                            path: path,
                            centerX: centerX,
                            centerY: centerY,
                            radius: radius
                        });
                        ctx.save();
                        ctx.fillStyle = this._fibonacciColors[i % this._fibonacciColors.length];
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        if (this._arcDirection === 'up') {
                            ctx.fillText(`${(level * 100).toFixed(1)}%`, centerX, centerY + radius + 15);
                        } else {
                            ctx.fillText(`${(level * 100).toFixed(1)}%`, centerX, centerY - radius - 15);
                        }
                        ctx.restore();
                    }
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    if (this._isPreview || this._isDragging) {
                        ctx.setLineDash([5, 3]);
                    } else {
                        ctx.setLineDash([]);
                    }
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(sixthX, sixthY);
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
                        drawHandle(centerX, centerY, this._dragPoint === 'start');
                        drawHandle(sixthX, sixthY, this._dragPoint === 'end');
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getStartPrice(): number {
        return this._startPrice;
    }

    getEndPrice(): number {
        return this._endPrice;
    }

    getStartTime(): string {
        return this._startTime;
    }

    getEndTime(): string {
        return this._endTime;
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

        const startY = this._series.priceToCoordinate(this._startPrice);
        const endY = this._series.priceToCoordinate(this._endPrice);
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        if (startY == null || endY == null || startX == null || endX == null) return null;

        return {
            startX, endX, startY, endY,
            minX: Math.min(startX, endX),
            maxX: Math.max(startX, endX),
            minY: Math.min(startY, endY),
            maxY: Math.max(startY, endY),
            arcSegments: this._arcSegments
        };
    }

    getFibonacciLevels(): number[] {
        return [...this._fibonacciLevels];
    }

    getArcSegments(): { level: number; path: Path2D; centerX: number; centerY: number; radius: number }[] {
        return [...this._arcSegments];
    }

    getFibonacciColors(): string[] {
        return [...this._fibonacciColors];
    }

    getArcDirection(): 'up' | 'down' {
        return this._arcDirection;
    }
}