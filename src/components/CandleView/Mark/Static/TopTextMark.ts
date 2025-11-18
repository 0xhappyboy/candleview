import {
    ISeriesPrimitive,
    SeriesAttachedParameter,
    Time,
} from 'lightweight-charts';

export class TopTextMark implements ISeriesPrimitive<Time> {
    private _chart: any;
    private _series: any;
    private _time: Time;
    private _text: string;
    private _textColor: string;
    private _backgroundColor: string;
    private _isCircular: boolean;
    private _renderer: any;
    private _fontSize: number;
    private _padding: number;

    constructor(time: Time,
        text: string,
        textColor: string = 'white',
        backgroundColor: string = 'red',
        isCircular: boolean = true,
        fontSize: number = 11,
        padding: number = 2,
    ) {
        this._time = time;
        this._text = text;
        this._textColor = textColor;
        this._backgroundColor = backgroundColor;
        this._isCircular = isCircular;
        this._fontSize = fontSize;
        this._padding = padding;
    }

    attached(param: SeriesAttachedParameter<Time, 'Candlestick'>) {
        this._chart = param.chart;
        this._series = param.series;
        param.requestUpdate();
    }

    updateAllViews() {
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const x = this._chart.timeScale().timeToCoordinate(this._time);
                    if (x == null) return;
                    const bar = this._series.data().find((d: any) => d.time === this._time);
                    if (!bar) return;
                    const highPrice = bar.high;
                    let y = this._series.priceToCoordinate(highPrice);
                    if (y == null) return;
                    y -= 20;
                    ctx.save();
                    const fontSize = this._fontSize;
                    const fontFamily = 'Arial';
                    ctx.font = `${fontSize}px ${fontFamily}`;
                    const textMetrics = ctx.measureText(this._text);
                    const textWidth = textMetrics.width;
                    const textHeight = fontSize;
                    const padding = this._padding;
                    const totalWidth = textWidth + padding * 2;
                    const totalHeight = textHeight + padding * 2;
                    const bgX = x - totalWidth / 2;
                    const bgY = y - totalHeight / 2;
                    ctx.fillStyle = this._backgroundColor;
                    if (this._isCircular) {
                        const radius = Math.max(totalWidth, totalHeight) / 2;
                        ctx.beginPath();
                        ctx.arc(x, y, radius, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.fillRect(bgX, bgY, totalWidth, totalHeight);
                    }
                    ctx.fillStyle = this._textColor;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(this._text, x, y);
                    ctx.restore();
                }
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    updateText(text: string) {
        this._text = text;
        if (this._chart) {
            this._chart.requestUpdate();
        }
    }

    updateColors(textColor: string, backgroundColor: string) {
        this._textColor = textColor;
        this._backgroundColor = backgroundColor;
        if (this._chart) {
            this._chart.requestUpdate();
        }
    }

    updateCircular(isCircular: boolean) {
        this._isCircular = isCircular;
        if (this._chart) {
            this._chart.requestUpdate();
        }
    }
}