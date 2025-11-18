import {
    ISeriesPrimitive,
    SeriesAttachedParameter,
    Time,
} from 'lightweight-charts';

export class MultiTopArrowMark implements ISeriesPrimitive<Time> {
    private _chart: any;
    private _series: any;
    private _time: Time;
    private _renderer: any;
    private _count: number;

    constructor(time: Time, count: number = 1) {
        this._time = time;
        this._count = count;
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
                    const highPrice = bar.high;
                    let baseY = this._series.priceToCoordinate(highPrice);
                    if (baseY == null) return;
                    baseY -= 20;
                    ctx.save();
                    for (let i = 0; i < this._count; i++) {
                        const y = baseY - (i * 25);
                        ctx.beginPath();
                        ctx.moveTo(x, y + 12);
                        ctx.lineTo(x - 6, y);
                        ctx.lineTo(x + 6, y);
                        ctx.closePath();
                        if (this._count === 1) {
                            ctx.fillStyle = 'red';
                        } else if (this._count === 2) {
                            ctx.fillStyle = i === 0 ? 'red' : 'orange';
                        } else {
                            const colors = ['red', 'orange', '#1237dbff', 'purple'];
                            ctx.fillStyle = colors[i] || 'red';
                        }
                        ctx.fill();
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x, y - 8);
                        ctx.strokeStyle = ctx.fillStyle;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        if (this._count >= 3) {
                            ctx.fillStyle = 'black';
                            ctx.font = '10px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText((i + 1).toString(), x, y - 20);
                        }
                    }
                    ctx.restore();
                }
            };
        }
        return [{ renderer: () => this._renderer }];
    }
}