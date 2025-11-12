import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class EnhancedAndrewPitchforkMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _handleTime: string;
    private _handlePrice: number;
    private _baseStartTime: string;
    private _baseStartPrice: number;
    private _baseEndTime: string;
    private _baseEndPrice: number;
    private _renderer: any;
    private _lineColor: string;
    private _handleColor: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'handle' | 'baseStart' | 'baseEnd' | 'line' | null = null;
    private _showHandles: boolean = false;
    private _backgroundOpacity: number = 0.1;
    private markType: MarkType = MarkType.EnhancedAndrewPitchfork;
    private _hoverPoint: 'handle' | 'baseStart' | 'baseEnd' | 'line' | null = null;
    private _numberOfForks: number = 5;

    constructor(
        handleTime: string,
        handlePrice: number,
        baseStartTime: string,
        baseStartPrice: number,
        baseEndTime: string,
        baseEndPrice: number,
        lineColor: string = '#2962FF',
        handleColor: string = '#FF6B6B',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {
        this._handleTime = handleTime;
        this._handlePrice = handlePrice;
        this._baseStartTime = baseStartTime;
        this._baseStartPrice = baseStartPrice;
        this._baseEndTime = baseEndTime;
        this._baseEndPrice = baseEndPrice;
        this._lineColor = lineColor;
        this._handleColor = handleColor;
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

    updateHandlePoint(time: string, price: number) {
        this._handleTime = time;
        this._handlePrice = price;
        this.requestUpdate();
    }

    updateBaseStartPoint(time: string, price: number) {
        this._baseStartTime = time;
        this._baseStartPrice = price;
        this.requestUpdate();
    }

    updateBaseEndPoint(time: string, price: number) {
        this._baseEndTime = time;
        this._baseEndPrice = price;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'handle' | 'baseStart' | 'baseEnd' | 'line' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    setHoverPoint(hoverPoint: 'handle' | 'baseStart' | 'baseEnd' | 'line' | null) {
        this._hoverPoint = hoverPoint;
        this.requestUpdate();
    }

    dragLineByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const handleX = timeScale.timeToCoordinate(this._handleTime);
        const handleY = this._series.priceToCoordinate(this._handlePrice);
        const baseStartX = timeScale.timeToCoordinate(this._baseStartTime);
        const baseStartY = this._series.priceToCoordinate(this._baseStartPrice);
        const baseEndX = timeScale.timeToCoordinate(this._baseEndTime);
        const baseEndY = this._series.priceToCoordinate(this._baseEndPrice);
        if (handleX === null || handleY === null || baseStartX === null || baseStartY === null || baseEndX === null || baseEndY === null) return;
        const newHandleX = handleX + deltaX;
        const newHandleY = handleY + deltaY;
        const newBaseStartX = baseStartX + deltaX;
        const newBaseStartY = baseStartY + deltaY;
        const newBaseEndX = baseEndX + deltaX;
        const newBaseEndY = baseEndY + deltaY;
        const newHandleTime = timeScale.coordinateToTime(newHandleX);
        const newHandlePrice = this._series.coordinateToPrice(newHandleY);
        const newBaseStartTime = timeScale.coordinateToTime(newBaseStartX);
        const newBaseStartPrice = this._series.coordinateToPrice(newBaseStartY);
        const newBaseEndTime = timeScale.coordinateToTime(newBaseEndX);
        const newBaseEndPrice = this._series.coordinateToPrice(newBaseEndY);
        if (newHandleTime !== null && !isNaN(newHandlePrice) &&
            newBaseStartTime !== null && !isNaN(newBaseStartPrice) &&
            newBaseEndTime !== null && !isNaN(newBaseEndPrice)) {
            this._handleTime = newHandleTime.toString();
            this._handlePrice = newHandlePrice;
            this._baseStartTime = newBaseStartTime.toString();
            this._baseStartPrice = newBaseStartPrice;
            this._baseEndTime = newBaseEndTime.toString();
            this._baseEndPrice = newBaseEndPrice;
            this.requestUpdate();
        }
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'handle' | 'baseStart' | 'baseEnd' | null {
        if (!this._chart || !this._series) return null;
        const handleX = this._chart.timeScale().timeToCoordinate(this._handleTime);
        const handleY = this._series.priceToCoordinate(this._handlePrice);
        const baseStartX = this._chart.timeScale().timeToCoordinate(this._baseStartTime);
        const baseStartY = this._series.priceToCoordinate(this._baseStartPrice);
        const baseEndX = this._chart.timeScale().timeToCoordinate(this._baseEndTime);
        const baseEndY = this._series.priceToCoordinate(this._baseEndPrice);
        if (handleX == null || handleY == null || baseStartX == null || baseStartY == null || baseEndX == null || baseEndY == null) return null;
        const distToHandle = Math.sqrt(Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2));
        if (distToHandle <= threshold) {
            return 'handle';
        }
        const distToBaseStart = Math.sqrt(Math.pow(x - baseStartX, 2) + Math.pow(y - baseStartY, 2));
        if (distToBaseStart <= threshold) {
            return 'baseStart';
        }
        const distToBaseEnd = Math.sqrt(Math.pow(x - baseEndX, 2) + Math.pow(y - baseEndY, 2));
        if (distToBaseEnd <= threshold) {
            return 'baseEnd';
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
        return this._handleTime;
    }

    priceValue() {
        return this._handlePrice;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const handleX = this._chart.timeScale().timeToCoordinate(this._handleTime);
                    const handleY = this._series.priceToCoordinate(this._handlePrice);
                    const baseStartX = this._chart.timeScale().timeToCoordinate(this._baseStartTime);
                    const baseStartY = this._series.priceToCoordinate(this._baseStartPrice);
                    const baseEndX = this._chart.timeScale().timeToCoordinate(this._baseEndTime);
                    const baseEndY = this._series.priceToCoordinate(this._baseEndPrice);
                    if (handleX == null || handleY == null || baseStartX == null || baseStartY == null || baseEndX == null || baseEndY == null) return;
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
                    const baseMidX = (baseStartX + baseEndX) / 2;
                    const baseMidY = (baseStartY + baseEndY) / 2;
                    const isBasePointsSame = baseStartX === baseEndX && baseStartY === baseEndY;
                    ctx.strokeStyle = '#FF6B35'; 
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(baseMidX, baseMidY);
                    ctx.lineTo(handleX, handleY);
                    ctx.stroke();
                    if (!isBasePointsSame) {
                        const handleVectorX = handleX - baseMidX;
                        const handleVectorY = handleY - baseMidY;
                        const SCALE_FACTOR = 3;
                        const reverseVectorX = -handleVectorX * SCALE_FACTOR;
                        const reverseVectorY = -handleVectorY * SCALE_FACTOR;
                        const basePoints = [];
                        for (let i = 0; i < this._numberOfForks; i++) {
                            const t = i / (this._numberOfForks - 1);
                            const x = baseStartX + (baseEndX - baseStartX) * t;
                            const y = baseStartY + (baseEndY - baseStartY) * t;
                            basePoints.push({ x, y });
                        }
                        const lineColors = [
                            '#FF4444',  
                            '#FFAA00',  
                            '#4CAF50', 
                            '#2196F3',  
                            '#9C27B0'   
                        ];
                        const areaColors = [
                            'rgba(255, 68, 68, 0.15)',    
                            'rgba(255, 170, 0, 0.25)',    
                            'rgba(76, 175, 80, 0.35)',   
                            'rgba(33, 150, 243, 0.25)',  
                            'rgba(156, 39, 176, 0.15)'    
                        ];
                        ctx.setLineDash(this._isPreview ? [5, 3] : []);
                        basePoints.forEach((point, index) => {
                            ctx.strokeStyle = lineColors[index];
                            ctx.lineWidth = index === 2 ? this._lineWidth + 1 : this._lineWidth;  
                            ctx.beginPath();
                            ctx.moveTo(point.x, point.y);
                            ctx.lineTo(point.x + reverseVectorX, point.y + reverseVectorY);
                            ctx.stroke();
                        });
                        ctx.lineWidth = this._lineWidth;
                        const gradient = ctx.createLinearGradient(baseStartX, baseStartY, baseEndX, baseEndY);
                        gradient.addColorStop(0, '#FF4444');  
                        gradient.addColorStop(0.5, '#4CAF50');  
                        gradient.addColorStop(1, '#9C27B0');  
                        ctx.strokeStyle = gradient;
                        ctx.setLineDash([]);
                        ctx.beginPath();
                        ctx.moveTo(baseStartX, baseStartY);
                        ctx.lineTo(baseEndX, baseEndY);
                        ctx.stroke();
                        if (!this._isPreview) {
                            for (let i = 0; i < basePoints.length - 1; i++) {
                                const start1 = basePoints[i];
                                const start2 = basePoints[i + 1];
                                const areaGradient = ctx.createLinearGradient(
                                    start1.x, start1.y,
                                    start2.x + reverseVectorX, start2.y + reverseVectorY
                                );
                                if (i === 0) { 
                                    areaGradient.addColorStop(0, 'rgba(255, 68, 68, 0.2)');
                                    areaGradient.addColorStop(1, 'rgba(255, 170, 0, 0.3)');
                                } else if (i === 1) {  
                                    areaGradient.addColorStop(0, 'rgba(255, 170, 0, 0.3)');
                                    areaGradient.addColorStop(1, 'rgba(76, 175, 80, 0.4)');
                                } else if (i === 2) {  
                                    areaGradient.addColorStop(0, 'rgba(76, 175, 80, 0.4)');
                                    areaGradient.addColorStop(1, 'rgba(33, 150, 243, 0.3)');
                                } else if (i === 3) {  
                                    areaGradient.addColorStop(0, 'rgba(33, 150, 243, 0.3)');
                                    areaGradient.addColorStop(1, 'rgba(156, 39, 176, 0.2)');
                                }
                                ctx.fillStyle = areaGradient;
                                ctx.beginPath();
                                ctx.moveTo(start1.x, start1.y);
                                ctx.lineTo(start1.x + reverseVectorX, start1.y + reverseVectorY);
                                ctx.lineTo(start2.x + reverseVectorX, start2.y + reverseVectorY);
                                ctx.lineTo(start2.x, start2.y);
                                ctx.closePath();
                                ctx.fill();
                                ctx.strokeStyle = lineColors[i];
                                ctx.lineWidth = 0.5;
                                ctx.setLineDash([2, 2]);
                                ctx.stroke();
                                ctx.setLineDash([]);
                            }
                        }
                        if (!this._isPreview) {
                            basePoints.forEach((point, index) => {
                                const endX = point.x + reverseVectorX;
                                const endY = point.y + reverseVectorY;
                                ctx.fillStyle = lineColors[index];
                                ctx.beginPath();
                                ctx.arc(endX, endY, 3, 0, Math.PI * 2);
                                ctx.fill();
                                ctx.fillStyle = '#FFFFFF';
                                ctx.beginPath();
                                ctx.arc(endX, endY, 1, 0, Math.PI * 2);
                                ctx.fill();
                            });
                        }
                    }
                    const shouldShowHandles = (this._showHandles || this._isDragging || this._hoverPoint) && !this._isPreview;
                    const shouldShowPreviewHandles = this._isPreview;
                    if (shouldShowHandles || shouldShowPreviewHandles) {
                        this.drawHandles(ctx, handleX, handleY, baseStartX, baseStartY, baseEndX, baseEndY, shouldShowPreviewHandles);
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private drawHandles(
        ctx: CanvasRenderingContext2D,
        handleX: number,
        handleY: number,
        baseStartX: number,
        baseStartY: number,
        baseEndX: number,
        baseEndY: number,
        isPreview: boolean = false
    ) {
        const drawHandle = (x: number, y: number, type: 'handle' | 'baseStart' | 'baseEnd', isActive: boolean = false) => {
            ctx.save();
            let color = type === 'handle' ? this._handleColor : this._lineColor;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, isPreview ? 4 : 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, isPreview ? 2 : 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };
        const baseMidX = (baseStartX + baseEndX) / 2;
        const baseMidY = (baseStartY + baseEndY) / 2;
        const isBasePointsSame = baseStartX === baseEndX && baseStartY === baseEndY;
        drawHandle(handleX, handleY, 'handle', this._dragPoint === 'handle' || this._hoverPoint === 'handle');
        if (isPreview && isBasePointsSame) {
            drawHandle(baseMidX, baseMidY, 'baseStart', false);
        } else {
            drawHandle(baseStartX, baseStartY, 'baseStart', this._dragPoint === 'baseStart' || this._hoverPoint === 'baseStart');
            drawHandle(baseEndX, baseEndY, 'baseEnd', this._dragPoint === 'baseEnd' || this._hoverPoint === 'baseEnd');
        }
    }

    private hexToRgba(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    getHandleTime(): string {
        return this._handleTime;
    }

    getHandlePrice(): number {
        return this._handlePrice;
    }

    getBaseStartTime(): string {
        return this._baseStartTime;
    }

    getBaseStartPrice(): number {
        return this._baseStartPrice;
    }

    getBaseEndTime(): string {
        return this._baseEndTime;
    }

    getBaseEndPrice(): number {
        return this._baseEndPrice;
    }

    updateColor(color: string) {
        this._lineColor = color;
        this.requestUpdate();
    }

    updateHandleColor(color: string) {
        this._handleColor = color;
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
        handleColor?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        backgroundOpacity?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.handleColor) this.updateHandleColor(styles.handleColor);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.backgroundOpacity !== undefined) this._backgroundOpacity = styles.backgroundOpacity;
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._lineColor,
            handleColor: this._handleColor,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            backgroundOpacity: this._backgroundOpacity,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;

        const handleX = this._chart.timeScale().timeToCoordinate(this._handleTime);
        const handleY = this._series.priceToCoordinate(this._handlePrice);
        const baseStartX = this._chart.timeScale().timeToCoordinate(this._baseStartTime);
        const baseStartY = this._series.priceToCoordinate(this._baseStartPrice);
        const baseEndX = this._chart.timeScale().timeToCoordinate(this._baseEndTime);
        const baseEndY = this._series.priceToCoordinate(this._baseEndPrice);
        if (handleX == null || handleY == null || baseStartX == null || baseStartY == null || baseEndX == null || baseEndY == null) return null;
        const baseMidX = (baseStartX + baseEndX) / 2;
        const baseMidY = (baseStartY + baseEndY) / 2;
        const handleVectorX = handleX - baseMidX;
        const handleVectorY = handleY - baseMidY;
        const SCALE_FACTOR = 3;
        const reverseVectorX = -handleVectorX * SCALE_FACTOR;
        const reverseVectorY = -handleVectorY * SCALE_FACTOR;

        const basePoints = [];
        for (let i = 0; i < this._numberOfForks; i++) {
            const t = i / (this._numberOfForks - 1);
            const x = baseStartX + (baseEndX - baseStartX) * t;
            const y = baseStartY + (baseEndY - baseStartY) * t;
            basePoints.push({ x, y });
        }

        const extendedPoints = basePoints.map(point => ({
            x: point.x + reverseVectorX,
            y: point.y + reverseVectorY
        }));
        const allPoints = [
            { x: handleX, y: handleY },
            { x: baseStartX, y: baseStartY },
            { x: baseEndX, y: baseEndY },
            { x: baseMidX, y: baseMidY },
            ...basePoints,
            ...extendedPoints
        ];
        const xs = allPoints.map(p => p.x);
        const ys = allPoints.map(p => p.y);
        return {
            handleX, handleY,
            baseStartX, baseStartY,
            baseEndX, baseEndY,
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    }
}