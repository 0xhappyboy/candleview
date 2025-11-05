import {
    ISeriesPrimitive,
    SeriesAttachedParameter,
    Time,
} from 'lightweight-charts';

export class BottomArrowMark implements ISeriesPrimitive<Time> {
    private _chart: any;
    private _series: any;
    private _time: Time;
    private _price: number;
    private _renderer: any;

    constructor(time: Time, price: number) {
        this._time = time;
        this._price = price;
    }

    attached(param: SeriesAttachedParameter<Time, 'Candlestick'>) {
        this._chart = param.chart;
        this._series = param.series;
        param.requestUpdate();
    }

    updateAllViews() {
        // refresh
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
                    const highPrice = bar.high ?? this._price;
                    let y = this._series.priceToCoordinate(highPrice);
                    if (y == null) return;
                    y -= 20;
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, y + 12);
                    ctx.lineTo(x - 6, y);
                    ctx.lineTo(x + 6, y);
                    ctx.closePath();
                    ctx.fillStyle = 'red';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y - 8);
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();
                }
            };
        }
        return [{ renderer: () => this._renderer }];
    }
}