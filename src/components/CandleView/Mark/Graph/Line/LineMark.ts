export class LineMark {
    private _chart: any;
    private _series: any;
    private _startTime: string;
    private _startPrice: number;
    private _endTime: string;
    private _endPrice: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'line' | null = null;
    private _showHandles: boolean = false;
    private _originalStartTime: string = '';
    private _originalStartPrice: number = 0;
    private _originalEndTime: string = '';
    private _originalEndPrice: number = 0;

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
        
        // 保存原始位置用于拖动计算
        this._originalStartTime = startTime;
        this._originalStartPrice = startPrice;
        this._originalEndTime = endTime;
        this._originalEndPrice = endPrice;
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this.requestUpdate();
    }

    updateAllViews() { }

    updateEndPoint(endTime: string, endPrice: number) {
        this._endTime = endTime;
        this._endPrice = endPrice;
        this.requestUpdate();
    }

    updateStartPoint(startTime: string, startPrice: number) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'line' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        
        // 开始拖动时保存原始位置
        if (isDragging) {
            this._originalStartTime = this._startTime;
            this._originalStartPrice = this._startPrice;
            this._originalEndTime = this._endTime;
            this._originalEndPrice = this._endPrice;
        }
        
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    // 拖动整条直线
    dragLine(deltaTime: number, deltaPrice: number) {
        const startTimeNum = parseFloat(this._originalStartTime);
        const endTimeNum = parseFloat(this._originalEndTime);
        
        this._startTime = (startTimeNum + deltaTime).toString();
        this._startPrice = this._originalStartPrice + deltaPrice;
        this._endTime = (endTimeNum + deltaTime).toString();
        this._endPrice = this._originalEndPrice + deltaPrice;
        
        this.requestUpdate();
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | null {
        if (!this._chart || !this._series) return null;

        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);

        if (startX == null || startY == null || endX == null || endY == null) return null;

        // 检查是否靠近起点
        const distToStart = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        if (distToStart <= threshold) {
            return 'start';
        }

        // 检查是否靠近终点
        const distToEnd = Math.sqrt(Math.pow(x - endX, 2) + Math.pow(y - endY, 2));
        if (distToEnd <= threshold) {
            return 'end';
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
                    
                    const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
                    const startY = this._series.priceToCoordinate(this._startPrice);
                    const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
                    const endY = this._series.priceToCoordinate(this._endPrice);
                    
                    if (startX == null || startY == null || endX == null || endY == null) return;
                    
                    ctx.save();
                    
                    // 绘制直线
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    
                    if (this._isPreview || this._isDragging) {
                        ctx.setLineDash([5, 3]);
                        ctx.globalAlpha = 0.7;
                    } else {
                        ctx.setLineDash([]);
                        ctx.globalAlpha = 1.0;
                    }
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();

                    // 绘制控制点（只有在显示把手或拖动时）
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, isActive: boolean = false) => {
                            ctx.save();
                            
                            // 外圈
                            ctx.fillStyle = this._color;
                            ctx.beginPath();
                            ctx.arc(x, y, 5, 0, Math.PI * 2);
                            ctx.fill();
                            
                            // 内圈（空心白色）
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(x, y, 3, 0, Math.PI * 2);
                            ctx.fill();
                            
                            // 如果是激活状态，显示更大的圆圈
                            if (isActive) {
                                ctx.strokeStyle = this._color;
                                ctx.lineWidth = 1;
                                ctx.setLineDash([]);
                                ctx.beginPath();
                                ctx.arc(x, y, 8, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            
                            ctx.restore();
                        };

                        // 绘制起点
                        drawHandle(startX, startY, this._dragPoint === 'start');
                        // 绘制终点
                        drawHandle(endX, endY, this._dragPoint === 'end');
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

    getStartPrice(): number {
        return this._startPrice;
    }

    getEndTime(): string {
        return this._endTime;
    }

    getEndPrice(): number {
        return this._endPrice;
    }

    updateColor(color: string) {
        this._color = color;
        this.requestUpdate();
    }

    updateLineWidth(lineWidth: number) {
        this._lineWidth = lineWidth;
        this.requestUpdate();
    }

    // 获取直线边界信息，用于碰撞检测
    getBounds() {
        if (!this._chart || !this._series) return null;

        const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);

        if (startX == null || startY == null || endX == null || endY == null) return null;

        return {
            startX, startY, endX, endY,
            minX: Math.min(startX, endX),
            maxX: Math.max(startX, endX),
            minY: Math.min(startY, endY),
            maxY: Math.max(startY, endY)
        };
    }
}