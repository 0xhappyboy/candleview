export class ImageClickableMark {
    private _chart: any;
    private _series: any;
    private _time: string;
    private _price: number;
    private _image: HTMLImageElement | null = null;
    private _imageReady = false;
    private _renderer: any;
    private _bounds: { x: number; y: number; w: number; h: number } | null = null;
    private _onClick?: () => void;
    constructor(time: string, price: number, imageUrl: string, onClick?: () => void) {
        this._time = time;
        this._price = price;
        this._onClick = onClick;
        this._image = new Image();
        this._image.crossOrigin = 'anonymous';
        this._image.src = imageUrl;
        this._image.onload = () => {
            this._imageReady = true;
            this._requestDrawIfReady();
        };
        this._image.onerror = (e) => {
        };
    }

    private _param: any | null = null;
    private _requestDrawIfReady() {
        if (this._param) {
            this._param.requestUpdate();
        }
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this._param = param;
        this._chart.subscribeClick(this._handleClick);
        if (this._imageReady) param.requestUpdate();
    }

    detached() {
        if (this._chart) {
            this._chart.unsubscribeClick(this._handleClick);
        }
    }

    updateAllViews() { }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const x = this._chart.timeScale().timeToCoordinate(this._time);
                    const y = this._series.priceToCoordinate(this._price);
                    if (x == null || y == null) return;
                    const imgW = 28;
                    const imgH = 28;
                    this._bounds = { x: x - imgW / 2, y: y - imgH - 8, w: imgW, h: imgH };
                    if (this._imageReady && this._image) {
                        ctx.save();
                        ctx.drawImage(this._image, this._bounds.x, this._bounds.y, imgW, imgH);
                        ctx.restore();
                    }
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private _handleClick = (param: any) => {
        if (!this._bounds || !this._chart) return;
        const { x, y } = param.point ?? {};
        if (x == null || y == null) return;
        const { x: bx, y: by, w, h } = this._bounds;
        if (x >= bx && x <= bx + w && y >= by && y <= by + h) {
            if (this._onClick) this._onClick();
        }
    };
}
