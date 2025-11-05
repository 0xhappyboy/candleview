export class OperableEmojiMark {
    private _chart: any;
    private _series: any;
    private _time: string;
    private _price: number;
    private _renderer: any;
    private _emoji: string;
    private _text: string;
    
    private _isDragging = false;
    private _dragStartX = 0;
    private _dragStartY = 0;
    private _originalTime: string;
    private _originalPrice: number;
    private _scale = 1;
    private _minScale = 0.5;
    private _maxScale = 3;
    private _hitRadius = 20;

    constructor(time: string, price: number, emoji: string, text?: string) {
        this._time = time;
        this._price = price;
        this._emoji = emoji;
        this._text = text || '';
        this._originalTime = time;
        this._originalPrice = price;
        
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onWheel = this._onWheel.bind(this);
        this._onContextMenu = this._onContextMenu.bind(this);
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this._addEventListeners();
        param.requestUpdate();
    }

    private _addEventListeners() {
        if (!this._chart) return;
        const chartElement = this._chart.chartElement();
        if (chartElement) {
            chartElement.addEventListener('mousedown', this._onMouseDown, true);
            chartElement.addEventListener('wheel', this._onWheel, { passive: false, capture: true });
            chartElement.addEventListener('contextmenu', this._onContextMenu, true);
            document.addEventListener('mousemove', this._onMouseMove);
            document.addEventListener('mouseup', this._onMouseUp);
        }
    }

    private _removeEventListeners() {
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mouseup', this._onMouseUp);
        if (!this._chart) return;
        const chartElement = this._chart.chartElement();
        if (chartElement) {
            chartElement.removeEventListener('mousedown', this._onMouseDown, true);
            chartElement.removeEventListener('wheel', this._onWheel, true);
            chartElement.removeEventListener('contextmenu', this._onContextMenu, true);
        }
    }

    private _isPointInMark(clientX: number, clientY: number): boolean {
        if (!this._chart || !this._series) return false;
        const chartElement = this._chart.chartElement();
        const rect = chartElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const markX = this._chart.timeScale().timeToCoordinate(this._time);
        const markY = this._series.priceToCoordinate(this._price);
        if (markX == null || markY == null) return false;
        const distance = Math.sqrt(Math.pow(x - markX, 2) + Math.pow(y - markY, 2));
        const scaledHitRadius = this._hitRadius * this._scale;
        return distance <= scaledHitRadius;
    }

    private _onMouseDown(event: MouseEvent) {
        if (event.button !== 0) return;
        if (this._isPointInMark(event.clientX, event.clientY)) {
            this._isDragging = true;
            this._dragStartX = event.clientX;
            this._dragStartY = event.clientY;
            this._originalTime = this._time;
            this._originalPrice = this._price;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            this._chart.applyOptions({
                handleScroll: false,
                handleScale: false
            });
        }
    }

    private _onMouseMove(event: MouseEvent) {
        if (!this._isDragging) return;
        event.preventDefault();
        event.stopPropagation();
        const deltaX = event.clientX - this._dragStartX;
        const deltaY = event.clientY - this._dragStartY;
        const timeScale = this._chart.timeScale();
        const priceScale = this._series;
        const originalCoordX = timeScale.timeToCoordinate(this._originalTime);
        const originalCoordY = priceScale.priceToCoordinate(this._originalPrice);
        if (originalCoordX !== null) {
            const newCoordX = originalCoordX + deltaX;
            const newTime = timeScale.coordinateToTime(newCoordX);
            if (newTime) {
                this._time = newTime.toString();
            }
        }
        if (originalCoordY !== null) {
            const newCoordY = originalCoordY + deltaY;
            const newPrice = priceScale.coordinateToPrice(newCoordY);
            if (newPrice !== null) {
                this._price = newPrice;
            }
        }
        this._chart.applyOptions({});
    }

    private _onMouseUp(event: MouseEvent) {
        if (this._isDragging) {
            this._isDragging = false;
            this._chart.applyOptions({
                handleScroll: true,
                handleScale: true
            });
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private _onWheel(event: WheelEvent) {
        if (this._isPointInMark(event.clientX, event.clientY)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            const delta = Math.sign(event.deltaY);
            const scaleFactor = delta > 0 ? 0.9 : 1.1;
            this._scale = Math.max(this._minScale, 
                                Math.min(this._maxScale, 
                                this._scale * scaleFactor));
            this._chart.applyOptions({});
        }
    }

    private _onContextMenu(event: MouseEvent) {
        if (this._isPointInMark(event.clientX, event.clientY)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private _getScreenCoordinates() {
        const x = this._chart.timeScale().timeToCoordinate(this._time);
        const y = this._series.priceToCoordinate(this._price);
        return { x, y };
    }

    updateAllViews() {}

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const { x, y } = this._getScreenCoordinates();
                    if (x == null || y == null) return;
                    const baseSize = 24;
                    const scaledSize = baseSize * this._scale;
                    const textOffset = 14 * this._scale;
                    ctx.save();
                    ctx.font = `${scaledSize}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    if (this._isDragging) {
                        ctx.globalAlpha = 0.7;
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                        ctx.shadowBlur = 10;
                    }
                    ctx.fillText(this._emoji, x, y - scaledSize / 2 - 8);
                    ctx.restore();
                    if (this._text) {
                        ctx.save();
                        ctx.fillStyle = this._isDragging ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0,0,0,0.6)';
                        ctx.font = `${12 * this._scale}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.fillText(this._text, x, y + textOffset);
                        ctx.restore();
                    }
                    if (true) {
                        ctx.save();
                        ctx.strokeStyle = this._isDragging ? 'red' : 'rgba(0, 0, 255, 0.5)';
                        ctx.setLineDash([5, 5]);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.arc(x, y, this._hitRadius * this._scale, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.restore();
                    }
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    destroy() {
        this._removeEventListeners();
    }

    getPosition() {
        return {
            time: this._time,
            price: this._price,
            scale: this._scale
        };
    }

    setPosition(time: string, price: number) {
        this._time = time;
        this._price = price;
        if (this._chart) {
            this._chart.applyOptions({});
        }
    }

    setScale(scale: number) {
        this._scale = Math.max(this._minScale, Math.min(this._maxScale, scale));
        if (this._chart) {
            this._chart.applyOptions({});
        }
    }
}