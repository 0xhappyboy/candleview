import { MarkType } from "../../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class FibonacciTimeZoonMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
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
    private _fibonacciLevels: number[] = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    private markType: MarkType = MarkType.FibonacciTimeZoon;
    private _fibonacciLinePositions: { x: number; level: number; time: string }[] = [];
    private _dragSensitivity: number;

    constructor(
        startTime: string,
        endTime: string,
        color: string = '#2962FF',
        lineWidth: number = 1,
        isPreview: boolean = false,
        dragSensitivity: number = 2.5
    ) {
        this._startTime = startTime;
        this._endTime = endTime;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._dragSensitivity = dragSensitivity;
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

    updateEndPoint(endTime: string) {
        this._endTime = endTime;
        this.requestUpdate();
    }

    updateStartPoint(startTime: string) {
        this._startTime = startTime;
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

    
    dragLineByPixels(deltaX: number) {
        if (isNaN(deltaX)) {
            return;
        }
        if (!this._chart) return;
        const dragSensitivity = 1.5; 
        const adjustedDeltaX = deltaX * dragSensitivity;
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        if (startX === null || endX === null) return;
        const newStartX = startX + adjustedDeltaX;
        const newEndX = endX + adjustedDeltaX;
        const newStartTime = timeScale.coordinateToTime(newStartX);
        const newEndTime = timeScale.coordinateToTime(newEndX);
        if (newStartTime !== null && newEndTime !== null) {
            this._startTime = newStartTime.toString();
            this._endTime = newEndTime.toString();
            this.requestUpdate();
        }
    }
    
    dragHandleByPixels(deltaX: number, handleType: 'start' | 'end') {
        if (isNaN(deltaX)) {
            return;
        }
        if (!this._chart) return;
        const adjustedDeltaX = deltaX * this._dragSensitivity;
        const timeScale = this._chart.timeScale();
        if (handleType === 'start') {
            const startX = timeScale.timeToCoordinate(this._startTime);
            if (startX === null) return;
            const newStartX = startX + adjustedDeltaX;
            const newStartTime = timeScale.coordinateToTime(newStartX);
            if (newStartTime !== null) {
                this._startTime = newStartTime.toString();
                this.requestUpdate();
            }
        } else if (handleType === 'end') {
            const endX = timeScale.timeToCoordinate(this._endTime);
            if (endX === null) return;
            const newEndX = endX + adjustedDeltaX;
            const newEndTime = timeScale.coordinateToTime(newEndX);
            if (newEndTime !== null) {
                this._endTime = newEndTime.toString();
                this.requestUpdate();
            }
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | null {
        if (!this._chart) return null;
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        if (startX == null || endX == null) return null;
        const chartHeight = this._chart.chartElement()?.clientHeight || 500;
        const midY = chartHeight / 2;
        const firstLevel = this._fibonacciLevels[1]; 
        const firstRatio = firstLevel / this._fibonacciLevels[this._fibonacciLevels.length - 1];
        const firstLineX = startX + (endX - startX) * firstRatio;
        const distToFirstLine = Math.sqrt(Math.pow(x - firstLineX, 2) + Math.pow(y - midY, 2));
        if (distToFirstLine <= threshold) {
            return 'start';
        }
        if (this._fibonacciLevels.length >= 3) {
            const secondLevel = this._fibonacciLevels[2]; 
            const secondRatio = secondLevel / this._fibonacciLevels[this._fibonacciLevels.length - 1];
            const secondLineX = startX + (endX - startX) * secondRatio;
            const distToSecondLine = Math.sqrt(Math.pow(x - secondLineX, 2) + Math.pow(y - midY, 2));
            if (distToSecondLine <= threshold) {
                return 'end';
            }
        }
        return null;
    }

    isPointNearFibonacciLine(x: number, y: number, threshold: number = 15): number | null {
        if (!this._chart) return null;
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const endX = timeScale.timeToCoordinate(this._endTime);
        if (startX == null || endX == null) return null;
        for (let i = 0; i < this._fibonacciLevels.length; i++) {
            const level = this._fibonacciLevels[i];
            if (level === 0) continue;
            const ratio = level / this._fibonacciLevels[this._fibonacciLevels.length - 1];
            const fibX = startX + (endX - startX) * ratio;
            const distance = Math.abs(x - fibX);
            if (distance <= threshold) {
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
        return 0;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const timeScale = this._chart.timeScale();
                    const startX = timeScale.timeToCoordinate(this._startTime);
                    const endX = timeScale.timeToCoordinate(this._endTime);
                    if (startX == null || endX == null) return;
                    const chartHeight = this._chart.chartElement()?.clientHeight || 500;
                    this._fibonacciLinePositions = [];
                    ctx.save();
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
                    this._fibonacciLevels.forEach((level, index) => {
                        if (level === 0) return; 
                        const spacingOffset = index > 1 ? 2 : 0; 
                        const ratio = level / this._fibonacciLevels[this._fibonacciLevels.length - 1];
                        const fibX = startX + (endX - startX) * ratio + spacingOffset;
                        const fibTime = timeScale.coordinateToTime(fibX);
                        if (fibTime !== null) {
                            this._fibonacciLinePositions.push({
                                x: fibX,
                                level: level,
                                time: fibTime.toString()
                            });
                        }
                        if (index === 1) { 
                            ctx.strokeStyle = '#FF6B00'; 
                        } else {
                            ctx.strokeStyle = this._color;
                        }
                        ctx.beginPath();
                        ctx.moveTo(fibX, 0);
                        ctx.lineTo(fibX, chartHeight);
                        ctx.stroke();
                        ctx.save();
                        ctx.fillStyle = index === 1 ? '#FF6B00' : this._color;
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(level.toString(), fibX, 15);
                        ctx.restore();
                    });
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, isActive: boolean = false) => {
                            const midY = chartHeight / 2;
                            ctx.save();
                            ctx.fillStyle = this._color;
                            ctx.beginPath();
                            ctx.arc(x, midY, 6, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(x, midY, 4, 0, Math.PI * 2);
                            ctx.fill();
                            if (isActive) {
                                ctx.strokeStyle = this._color;
                                ctx.lineWidth = 2;
                                ctx.setLineDash([]);
                                ctx.beginPath();
                                ctx.arc(x, midY, 8, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            ctx.restore();
                        };
                        const firstLevel = this._fibonacciLevels[1];
                        const firstRatio = firstLevel / this._fibonacciLevels[this._fibonacciLevels.length - 1];
                        const firstLineX = startX + (endX - startX) * firstRatio;
                        drawHandle(firstLineX, this._dragPoint === 'start');
                        if (this._fibonacciLevels.length >= 3) {
                            const secondLevel = this._fibonacciLevels[2];
                            const secondRatio = secondLevel / this._fibonacciLevels[this._fibonacciLevels.length - 1];
                            const secondLineX = startX + (endX - startX) * secondRatio;
                            drawHandle(secondLineX, this._dragPoint === 'end');
                        }
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
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
        if (!this._chart) return null;
        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        if (startX == null || endX == null) return null;
        const chartHeight = this._chart.chartElement()?.clientHeight || 500;
        return {
            startX, endX,
            minX: Math.min(startX, endX),
            maxX: Math.max(startX, endX),
            minY: 0,
            maxY: chartHeight,
            fibonacciLinePositions: this._fibonacciLinePositions
        };
    }

    getFibonacciLevels(): number[] {
        return [...this._fibonacciLevels];
    }

    getFibonacciLinePositions(): { x: number; level: number; time: string }[] {
        return [...this._fibonacciLinePositions];
    }
}