export class ImageMark {
    private _chart: any;
    private _series: any;
    private _time: string;
    private _price: number;
    private _renderer: any;
    private _image: HTMLImageElement | null = null;
    private _imageReady = false;
    private _onReady?: () => void;

    constructor(time: string, price: number, imageUrl: string) {
        this._time = time;
        this._price = price;
        this._image = new Image();
        this._image.crossOrigin = 'anonymous';  
        this._image.src = imageUrl;
        this._image.onload = () => {
            this._imageReady = true;
            if (this._onReady) this._onReady();
        };
        this._image.onerror = (e) => {
            this._imageReady = false;
        };
    }
    attached(param: any) {
        console.log('✅ Primitive attached');
        this._chart = param.chart;
        this._series = param.series;
        if (!this._imageReady) {
            this._onReady = () => param.requestUpdate();
        } else {
            param.requestUpdate();
        }
    }
    updateAllViews() {}
    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const x = this._chart.timeScale().timeToCoordinate(this._time);
                    const y = this._series.priceToCoordinate(this._price);
                    if (x == null || y == null) return;
                    if (!this._imageReady || !this._image) {
                        return;
                    }
                    const imgW = 24;
                    const imgH = 24;
                    ctx.save();
                    ctx.drawImage(this._image, x - imgW / 2, y - imgH - 8, imgW, imgH);
                    ctx.restore();
                    ctx.save();
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('Buy', x, y + 14);
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }
}
