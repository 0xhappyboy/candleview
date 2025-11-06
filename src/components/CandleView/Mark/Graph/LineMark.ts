
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

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
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
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';
                    if (this._isPreview) {
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
                    if (!this._isPreview) {
                        ctx.fillStyle = this._color;
                        ctx.beginPath();
                        ctx.arc(startX, startY, 3, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(endX, endY, 3, 0, Math.PI * 2);
                        ctx.fill();
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
}