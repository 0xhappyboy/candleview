import { MarkType } from "../../../types";
import { IGraph } from "../../IGraph";
import { IGraphStyle } from "../../IGraphStyle";

export class FibonacciFanMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _startTime: string;
    private _startPrice: number;
    private _endTime: string;
    private _endPrice: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'center' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.FibonacciFan;
    private _fibRatios: number[] = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.618, 2.0, 2.618];
    private _fibRatioColors: string[] = [
        '#FF6B6B', '#FFA726', '#FFD54F', '#9CCC65', '#4FC3F7',
        '#2962FF', '#7E57C2', '#EC407A', '#8D6E63', '#78909C'
    ];
    private _fibRatioOpacities: number[] = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4];
    private _glassFillColors: string[] = [
        'rgba(255, 107, 107, 0.08)',  // 0.236
        'rgba(255, 167, 38, 0.08)',   // 0.382
        'rgba(255, 213, 79, 0.08)',   // 0.5
        'rgba(156, 204, 101, 0.08)',  // 0.618
        'rgba(79, 195, 247, 0.08)',   // 0.786
        'rgba(41, 98, 255, 0.08)',    // 1.0
        'rgba(126, 87, 194, 0.08)',   // 1.272
        'rgba(236, 64, 122, 0.08)',   // 1.618
        'rgba(141, 110, 99, 0.08)',   // 2.0
        'rgba(120, 144, 156, 0.08)'   // 2.618
    ];
    private _showRatioLabels: boolean = true;
    private _labelFont: string = '12px Arial';
    private _labelColor: string = '#333333';
    private _showGlassEffect: boolean = true;
    private _isDarkTheme: boolean = false;

    constructor(
        startTime: string,
        startPrice: number,
        endTime: string,
        endPrice: number,
        color: string = '#2962FF',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this._endTime = endTime;
        this._endPrice = endPrice;
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

    updateStartPoint(startTime: string, startPrice: number) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this.requestUpdate();
    }

    updateEndPoint(endTime: string, endPrice: number) {
        this._endTime = endTime;
        this._endPrice = endPrice;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'center' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    private drawGlassEffect(
        ctx: CanvasRenderingContext2D,
        startX: number,
        startY: number,
        ratio1: number,
        ratio2: number,
        fillColor: string
    ) {
        if (!this._showGlassEffect || this._isPreview) return;
        
        const { startX: actualStartX, startY: actualStartY, endX: controlX, endY: controlY } = this.getControlPoints();
        const deltaX = controlX - actualStartX;
        const deltaY = controlY - actualStartY;
        const baseSlope = deltaX === 0 ? 0 : deltaY / deltaX;
        const isRightDirection = controlX >= actualStartX;
        
        let endX: number;
        if (isRightDirection) {
            endX = this._chart.timeScale().width();
        } else {
            endX = 0;
        }
        const slope1 = baseSlope * ratio1;
        const slope2 = baseSlope * ratio2;
        const endY1 = actualStartY + slope1 * (endX - actualStartX);
        const endY2 = actualStartY + slope2 * (endX - actualStartX);
        ctx.save();
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(actualStartX, actualStartY);
        ctx.lineTo(endX, endY1);
        ctx.lineTo(endX, endY2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    private getControlPoints() {
        if (!this._chart || !this._series) {
            return { startX: 0, startY: 0, endX: 0, endY: 0 };
        }
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startX === null || startY === null || endX === null || endY === null) {
            return { startX: 0, startY: 0, endX: 0, endY: 0 };
        }
        return { startX, startY, endX, endY };
    }

    private drawFibonacciLine(
        ctx: CanvasRenderingContext2D,
        startX: number,
        startY: number,
        fibRatio: number,
        color: string,
        opacity: number,
        ratioIndex: number
    ) {
        const { startX: actualStartX, startY: actualStartY, endX: controlX, endY: controlY } = this.getControlPoints();
        const deltaX = controlX - actualStartX;
        const deltaY = controlY - actualStartY;
        const baseSlope = deltaX === 0 ? 0 : deltaY / deltaX;
        const isRightDirection = controlX >= actualStartX;
        let endX: number;
        if (isRightDirection) {
            endX = this._chart.timeScale().width();
        } else {
            endX = 0;
        }
        const ratioSlope = baseSlope * fibRatio;
        const lineEndY = actualStartY + ratioSlope * (endX - actualStartX);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = this._lineWidth;
        ctx.lineCap = 'round';
        ctx.globalAlpha = opacity;
        if (this._isPreview || this._isDragging) {
            ctx.globalAlpha = opacity * 0.7;
        }
        switch (this._lineStyle) {
            case 'dashed': ctx.setLineDash([5, 3]); break;
            case 'dotted': ctx.setLineDash([2, 2]); break;
            default: ctx.setLineDash([]); break;
        }
        ctx.beginPath();
        ctx.moveTo(actualStartX, actualStartY);
        ctx.lineTo(endX, lineEndY);
        ctx.stroke();
        if (this._showRatioLabels && !this._isPreview && ratioIndex >= 2 && ratioIndex <= 7) {
            this.drawRatioLabel(ctx, endX, lineEndY, fibRatio, color, ratioIndex, isRightDirection);
        }
        ctx.restore();
    }

    private drawRatioLabel(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        fibRatio: number,
        color: string,
        ratioIndex: number,
        isRightDirection: boolean
    ) {
        const labelOffset = isRightDirection ? -60 : 10;
        const labelX = x + labelOffset;
        const labelY = y - 15 - ((ratioIndex - 2) * 12);

        ctx.fillStyle = this._labelColor;
        ctx.font = this._labelFont;
        
        const labelText = fibRatio === 1 ? '1.0' : fibRatio.toFixed(3);

        ctx.save();
        ctx.fillStyle = this._isDarkTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(labelX - 25, labelY - 12, 45, 16);
        ctx.restore();

        ctx.fillText(labelText, labelX - 20, labelY);
        ctx.fillStyle = color;
        ctx.fillRect(labelX - 35, labelY - 6, 8, 8);
    }

    private drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number, isActive: boolean = false) {
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
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
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

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'center' | null {
        const { startX, startY, endX: controlX, endY: controlY } = this.getControlPoints();
        if (startX === 0 && startY === 0 && controlX === 0 && controlY === 0) return null;

        const distToStart = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        const distToCenter = Math.sqrt(Math.pow(x - controlX, 2) + Math.pow(y - controlY, 2));

        if (distToStart <= threshold) {
            return 'start';
        }
        if (distToCenter <= threshold) {
            return 'center';
        }
        return null;
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
                    const { startX, startY, endX: controlX, endY: controlY } = this.getControlPoints();
                    if (startX === 0 && startY === 0 && controlX === 0 && controlY === 0) return;
                    ctx.save();
                    if (this._showGlassEffect && !this._isPreview) {
                        for (let i = 0; i < this._fibRatios.length - 1; i++) {
                            this.drawGlassEffect(
                                ctx,
                                startX,
                                startY,
                                this._fibRatios[i],
                                this._fibRatios[i + 1],
                                this._glassFillColors[i]
                            );
                        }
                    }
                    this._fibRatios.forEach((fibRatio, index) => {
                        const color = this._fibRatioColors[index % this._fibRatioColors.length];
                        const opacity = this._fibRatioOpacities[index % this._fibRatioOpacities.length];
                        this.drawFibonacciLine(ctx, startX, startY, fibRatio, color, opacity, index);
                    });
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        this.drawHandle(ctx, startX, startY, this._dragPoint === 'start');
                        this.drawHandle(ctx, controlX, controlY, this._dragPoint === 'center');
                        if (this._showHandles) {
                            ctx.fillStyle = this._labelColor;
                            ctx.font = '10px Arial';
                            ctx.save();
                            ctx.fillStyle = this._isDarkTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)';
                            const startLabelX = this.getAdjustedLabelPosition(startX, true);
                            const controlLabelX = this.getAdjustedLabelPosition(controlX, false);
                            ctx.fillRect(startLabelX, startY - 25, 120, 32);
                            ctx.fillRect(controlLabelX, controlY - 25, 120, 32);
                            ctx.restore();
                            ctx.fillText(`${this._startPrice.toFixed(4)}`, startLabelX + 5, startY - 10);
                            ctx.fillText(`${this._endPrice.toFixed(4)}`, controlLabelX + 5, controlY - 10);
                        }
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private getAdjustedLabelPosition(x: number, isStart: boolean): number {
        const timeScale = this._chart.timeScale();
        const chartWidth = timeScale.width();
        if (isStart) {
            return x > chartWidth / 2 ? x - 130 : x + 10;
        } else {
            return x > chartWidth / 2 ? x - 130 : x + 10;
        }
    }

    getFibRatios(): number[] {
        return [...this._fibRatios];
    }

    setFibRatios(ratios: number[]): void {
        this._fibRatios = ratios;
        this.requestUpdate();
    }

    getFibRatioColors(): string[] {
        return [...this._fibRatioColors];
    }

    setFibRatioColors(colors: string[]): void {
        this._fibRatioColors = colors;
        this.requestUpdate();
    }

    getFibRatioOpacities(): number[] {
        return [...this._fibRatioOpacities];
    }

    setFibRatioOpacities(opacities: number[]): void {
        this._fibRatioOpacities = opacities;
        this.requestUpdate();
    }

    getGlassFillColors(): string[] {
        return [...this._glassFillColors];
    }

    setGlassFillColors(colors: string[]): void {
        this._glassFillColors = colors;
        this.requestUpdate();
    }

    setTheme(isDark: boolean) {
        this._isDarkTheme = isDark;
        this._labelColor = isDark ? '#FFFFFF' : '#333333';
        this.requestUpdate();
    }

    setShowGlassEffect(show: boolean) {
        this._showGlassEffect = show;
        this.requestUpdate();
    }

    setShowRatioLabels(show: boolean) {
        this._showRatioLabels = show;
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

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        fibRatios?: number[];
        fibRatioColors?: string[];
        fibRatioOpacities?: number[];
        glassFillColors?: string[];
        showRatioLabels?: boolean;
        showGlassEffect?: boolean;
        isDarkTheme?: boolean;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.fibRatios) this.setFibRatios(styles.fibRatios);
        if (styles.fibRatioColors) this.setFibRatioColors(styles.fibRatioColors);
        if (styles.fibRatioOpacities) this.setFibRatioOpacities(styles.fibRatioOpacities);
        if (styles.glassFillColors) this.setGlassFillColors(styles.glassFillColors);
        if (styles.showRatioLabels !== undefined) {
            this._showRatioLabels = styles.showRatioLabels;
        }
        if (styles.showGlassEffect !== undefined) {
            this.setShowGlassEffect(styles.showGlassEffect);
        }
        if (styles.isDarkTheme !== undefined) {
            this.setTheme(styles.isDarkTheme);
        }
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            fibRatios: this._fibRatios,
            fibRatioColors: this._fibRatioColors,
            fibRatioOpacities: this._fibRatioOpacities,
            glassFillColors: this._glassFillColors,
            showRatioLabels: this._showRatioLabels,
            showGlassEffect: this._showGlassEffect,
            isDarkTheme: this._isDarkTheme,
        };
    }

    getBounds() {
        const { startX, startY, endX: controlX, endY: controlY } = this.getControlPoints();
        if (startX === 0 && startY === 0 && controlX === 0 && controlY === 0) return null;

        const timeScale = this._chart.timeScale();
        const chartWidth = timeScale.width();
        const isRightDirection = controlX >= startX;
        const endX = isRightDirection ? chartWidth : 0;

        const deltaX = controlX - startX;
        const deltaY = controlY - startY;
        const baseSlope = deltaX === 0 ? 0 : deltaY / deltaX;

        let minX = Math.min(startX, controlX, endX);
        let maxX = Math.max(startX, controlX, endX);
        let minY = Math.min(startY, controlY);
        let maxY = Math.max(startY, controlY);

        this._fibRatios.forEach(fibRatio => {
            const ratioSlope = baseSlope * fibRatio;
            const endY = startY + ratioSlope * (endX - startX);
            minY = Math.min(minY, endY);
            maxY = Math.max(maxY, endY);
        });

        return { startX, startY, centerX: controlX, centerY: controlY, minX, maxX, minY, maxY };
    }

    isPointInBounds(x: number, y: number, threshold: number = 15): boolean {
        const bounds = this.getBounds();
        if (!bounds) return false;
        return x >= bounds.minX - threshold && x <= bounds.maxX + threshold &&
            y >= bounds.minY - threshold && y <= bounds.maxY + threshold;
    }

    dragFibonacciFanByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;

        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const centerX = timeScale.timeToCoordinate(this._endTime);
        const centerY = this._series.priceToCoordinate(this._endPrice);

        if (startX === null || startY === null || centerX === null || centerY === null) return;

        const newStartX = startX + deltaX;
        const newStartY = startY + deltaY;
        const newCenterX = centerX + deltaX;
        const newCenterY = centerY + deltaY;

        const newStartTime = timeScale.coordinateToTime(newStartX);
        const newStartPrice = this._series.coordinateToPrice(newStartY);
        const newCenterTime = timeScale.coordinateToTime(newCenterX);
        const newCenterPrice = this._series.coordinateToPrice(newCenterY);

        if (newStartTime !== null && !isNaN(newStartPrice) &&
            newCenterTime !== null && !isNaN(newCenterPrice)) {
            this._startTime = newStartTime.toString();
            this._startPrice = newStartPrice;
            this._endTime = newCenterTime.toString();
            this._endPrice = newCenterPrice;
            this.requestUpdate();
        }
    }
}