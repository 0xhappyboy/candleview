export class LineMark {
    private _chart: any;
    private _series: any;
    private _startX: number;  
    private _startY: number;
    private _endX: number;
    private _endY: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'start' | 'end' | 'line' | null = null;
    private _showHandles: boolean = false;
    private _originalStartX: number = 0;
    private _originalStartY: number = 0;
    private _originalEndX: number = 0;
    private _originalEndY: number = 0;

    constructor(
        startX: number,   
        startY: number,
        endX: number,
        endY: number,
        color: string = '#2962FF',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {
        this._startX = startX;
        this._startY = startY;
        this._endX = endX;
        this._endY = endY;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._originalStartX = startX;
        this._originalStartY = startY;
        this._originalEndX = endX;
        this._originalEndY = endY;
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this.requestUpdate();
    }

    updateAllViews() { }

    updateEndPoint(endX: number, endY: number) {
        this._endX = endX;
        this._endY = endY;
        this.requestUpdate();
    }

    updateStartPoint(startX: number, startY: number) {
        this._startX = startX;
        this._startY = startY;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'line' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        if (isDragging) {
            this._originalStartX = this._startX;
            this._originalStartY = this._startY;
            this._originalEndX = this._endX;
            this._originalEndY = this._endY;
        }
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    dragLine(deltaX: number, deltaY: number) {
        this._startX = this._originalStartX + deltaX;
        this._startY = this._originalStartY + deltaY;
        this._endX = this._originalEndX + deltaX;
        this._endY = this._originalEndY + deltaY;
        this.requestUpdate();
    }

    isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | null {
        const distToStart = Math.sqrt(Math.pow(x - this._startX, 2) + Math.pow(y - this._startY, 2));
        if (distToStart <= threshold) {
            return 'start';
        }
        const distToEnd = Math.sqrt(Math.pow(x - this._endX, 2) + Math.pow(y - this._endY, 2));
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
        return Date.now().toString();
    }

    priceValue() {
        return 0;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx) return;
                    ctx.save();
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
                    ctx.moveTo(this._startX, this._startY);
                    ctx.lineTo(this._endX, this._endY);
                    ctx.stroke();
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, isActive: boolean = false) => {
                            ctx.save();
                            ctx.fillStyle = this._color;
                            ctx.beginPath();
                            ctx.arc(x, y, 5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            ctx.arc(x, y, 3, 0, Math.PI * 2);
                            ctx.fill();
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
                        drawHandle(this._startX, this._startY, this._dragPoint === 'start');
                        drawHandle(this._endX, this._endY, this._dragPoint === 'end');
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getStartX(): number {
        return this._startX;
    }

    getStartY(): number {
        return this._startY;
    }

    getEndX(): number {
        return this._endX;
    }

    getEndY(): number {
        return this._endY;
    }

    updateColor(color: string) {
        this._color = color;
        this.requestUpdate();
    }

    updateLineWidth(lineWidth: number) {
        this._lineWidth = lineWidth;
        this.requestUpdate();
    }

    getBounds() {
        return {
            startX: this._startX,
            startY: this._startY,
            endX: this._endX,
            endY: this._endY,
            minX: Math.min(this._startX, this._endX),
            maxX: Math.max(this._startX, this._endX),
            minY: Math.min(this._startY, this._endY),
            maxY: Math.max(this._startY, this._endY)
        };
    }
}