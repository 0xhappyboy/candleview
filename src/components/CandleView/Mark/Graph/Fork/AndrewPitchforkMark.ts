import { MarkType } from "../../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class AndrewPitchforkMark implements IGraph, IGraphStyle {
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
    private markType: MarkType = MarkType.AndrewPitchfork;
    private _hoverPoint: 'handle' | 'baseStart' | 'baseEnd' | 'line' | null = null;

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

        // Check handle point
        const distToHandle = Math.sqrt(Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2));
        if (distToHandle <= threshold) {
            return 'handle';
        }

        // Check base start point
        const distToBaseStart = Math.sqrt(Math.pow(x - baseStartX, 2) + Math.pow(y - baseStartY, 2));
        if (distToBaseStart <= threshold) {
            return 'baseStart';
        }

        // Check base end point
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

    // 新增方法：只绘制手柄
    private drawHandleOnly(ctx: CanvasRenderingContext2D, handleX: number, handleY: number, baseX: number, baseY: number) {
        // 绘制手柄线
        ctx.strokeStyle = this._handleColor;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(handleX, handleY);
        ctx.stroke();

        // 在预览模式下显示控制点
        if (this._isPreview) {
            ctx.fillStyle = this._handleColor;
            ctx.beginPath();
            ctx.arc(handleX, handleY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(handleX, handleY, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = this._lineColor;
            ctx.beginPath();
            ctx.arc(baseX, baseY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(baseX, baseY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
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

                    // 设置透明度
                    if (this._isPreview || this._isDragging) {
                        ctx.globalAlpha = 0.7;
                    } else {
                        ctx.globalAlpha = 1.0;
                    }

                    // 设置线条样式
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

                    // 计算底座中点
                    const baseMidX = (baseStartX + baseEndX) / 2;
                    const baseMidY = (baseStartY + baseEndY) / 2;

                    // 检查底座起点和终点是否相同（第一次点击后的状态）
                    const isBasePointsSame = baseStartX === baseEndX && baseStartY === baseEndY;

                    // ========== 关键修改：总是绘制手柄线 ==========
                    ctx.strokeStyle = this._handleColor;
                    ctx.setLineDash([]); // 手柄线总是实线
                    ctx.beginPath();
                    ctx.moveTo(baseMidX, baseMidY);
                    ctx.lineTo(handleX, handleY);
                    ctx.stroke();

                    // 只在底座点不同的情况下绘制完整的草叉（三个叉和底座线）
                    if (!isBasePointsSame) {
                        // ========== 关键修改：计算反方向向量 ==========
                        // 手柄向量（从底座中点到手柄点）
                        const handleVectorX = handleX - baseMidX;
                        const handleVectorY = handleY - baseMidY;

                        // 反方向向量（从底座中点向手柄反方向延伸）
                        const reverseVectorX = -handleVectorX;
                        const reverseVectorY = -handleVectorY;

                        // 绘制三个叉（向手柄反方向延伸）
                        ctx.strokeStyle = this._lineColor;
                        ctx.setLineDash(this._isPreview ? [5, 3] : []);

                        const lineStarts = [
                            { x: baseStartX, y: baseStartY },
                            { x: baseMidX, y: baseMidY },
                            { x: baseEndX, y: baseEndY }
                        ];

                        lineStarts.forEach(start => {
                            ctx.beginPath();
                            ctx.moveTo(start.x, start.y);
                            // ========== 关键修改：向反方向绘制 ==========
                            ctx.lineTo(start.x + reverseVectorX, start.y + reverseVectorY);
                            ctx.stroke();
                        });

                        // 绘制底座线
                        ctx.strokeStyle = this._handleColor;
                        ctx.setLineDash([]);
                        ctx.beginPath();
                        ctx.moveTo(baseStartX, baseStartY);
                        ctx.lineTo(baseEndX, baseEndY);
                        ctx.stroke();

                        // 绘制背景区域（只在非预览模式）
                        if (!this._isPreview) {
                            for (let i = 0; i < lineStarts.length - 1; i++) {
                                const start1 = lineStarts[i];
                                const start2 = lineStarts[i + 1];

                                ctx.fillStyle = this.hexToRgba(this._lineColor, this._backgroundOpacity * 0.3);
                                ctx.beginPath();
                                ctx.moveTo(start1.x, start1.y);
                                // ========== 关键修改：背景区域也向反方向延伸 ==========
                                ctx.lineTo(start1.x + reverseVectorX, start1.y + reverseVectorY);
                                ctx.lineTo(start2.x + reverseVectorX, start2.y + reverseVectorY);
                                ctx.lineTo(start2.x, start2.y);
                                ctx.closePath();
                                ctx.fill();
                            }
                        }
                    }

                    // 绘制控制点（在需要时）
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

            // 绘制外圆
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, isPreview ? 4 : 6, 0, Math.PI * 2);
            ctx.fill();

            // 绘制内圆
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, isPreview ? 2 : 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        // 计算底座中点
        const baseMidX = (baseStartX + baseEndX) / 2;
        const baseMidY = (baseStartY + baseEndY) / 2;

        // 检查底座点是否相同（第一次点击后的预览状态）
        const isBasePointsSame = baseStartX === baseEndX && baseStartY === baseEndY;

        // 总是绘制手柄点
        drawHandle(handleX, handleY, 'handle', this._dragPoint === 'handle' || this._hoverPoint === 'handle');

        if (isPreview && isBasePointsSame) {
            // 在第一次点击后的预览中，只显示手柄点和底座中点
            drawHandle(baseMidX, baseMidY, 'baseStart', false);
        } else {
            // 正常情况，显示所有控制点
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

        // Calculate base midpoint
        const baseMidX = (baseStartX + baseEndX) / 2;
        const baseMidY = (baseStartY + baseEndY) / 2;

        // ========== 关键修改：计算反方向向量 ==========
        // Handle vector
        const handleVectorX = handleX - baseMidX;
        const handleVectorY = handleY - baseMidY;

        // Reverse vector
        const reverseVectorX = -handleVectorX;
        const reverseVectorY = -handleVectorY;

        // Calculate the three lines endpoints (in reverse direction)
        const lines = [
            { start: baseStartX, startY: baseStartY },
            { start: baseMidX, startY: baseMidY },
            { start: baseEndX, startY: baseEndY }
        ];

        const extendedPoints = lines.map(point => ({
            x: point.start + reverseVectorX,
            y: point.startY + reverseVectorY
        }));

        const allPoints = [
            { x: handleX, y: handleY },
            { x: baseStartX, y: baseStartY },
            { x: baseEndX, y: baseEndY },
            { x: baseMidX, y: baseMidY },
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