import {
    ISeriesPrimitive,
    SeriesAttachedParameter,
    Time,
} from 'lightweight-charts';

interface TextItem {
    text: string;
    textColor?: string;
    backgroundColor?: string;
    isCircular?: boolean;
    fontSize?: number;
    padding?: number;
}

export class MultiTopTextMark implements ISeriesPrimitive<Time> {
    private _chart: any;
    private _series: any;
    private _time: Time;
    private _renderer: any;
    private _textItems: TextItem[];
    private _defaultIsCircular: boolean = true;
    private _defaultFontSize: number = 11;
    private _defaultPadding: number = 2;
    private _defaultTextColor: string = 'white';
    private _defaultBackgroundColor: string = 'red';

    constructor(time: Time, textItems: TextItem[] = []) {
        this._time = time;
        this._textItems = textItems;
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
                    let baseY = this._series.priceToCoordinate(highPrice);
                    if (baseY == null) return;
                    baseY -= 20;
                    ctx.save();
                    for (let i = 0; i < this._textItems.length; i++) {
                        const item = this._textItems[i];
                        const y = baseY - (i * 40);
                        const fontSize = item.fontSize ?? this._defaultFontSize;
                        const fontFamily = 'Arial';
                        ctx.font = `${fontSize}px ${fontFamily}`;
                        const textMetrics = ctx.measureText(item.text);
                        const textWidth = textMetrics.width;
                        const textHeight = fontSize;
                        const padding = item.padding ?? this._defaultPadding;
                        const totalWidth = textWidth + padding * 2;
                        const totalHeight = textHeight + padding * 2;
                        const bgX = x - totalWidth / 2;
                        const bgY = y - totalHeight / 2;
                        ctx.fillStyle = item.backgroundColor ?? this._defaultBackgroundColor;
                        if (item.isCircular ?? this._defaultIsCircular) {
                            const radius = Math.max(totalWidth, totalHeight) / 2;
                            ctx.beginPath();
                            ctx.arc(x, y, radius, 0, Math.PI * 2);
                            ctx.fill();
                        } else {
                            ctx.fillRect(bgX, bgY, totalWidth, totalHeight);
                        }
                        ctx.fillStyle = item.textColor ?? this._defaultTextColor;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(item.text, x, y);
                    }
                    ctx.restore();
                }
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    addTextItem(text: string,
        textColor: string = 'white',
        backgroundColor: string = 'blue',
        isCircular: boolean = false,
        fontSize: number = this._defaultFontSize,
        padding: number = this._defaultPadding
    ) {
        this._textItems.push({
            text,
            textColor,
            backgroundColor,
            isCircular,
            fontSize,
            padding
        });
        if (this._chart) {
            this._chart.requestUpdate();
        }
    }

    setTextItems(textItems: TextItem[]) {
        this._textItems = textItems;
        if (this._chart) {
            this._chart.requestUpdate();
        }
    }

    updateText(index: number, text: string) {
        if (this._textItems[index]) {
            this._textItems[index].text = text;
            if (this._chart) {
                this._chart.requestUpdate();
            }
        }
    }

    updateColors(index: number, textColor: string, backgroundColor: string) {
        if (this._textItems[index]) {
            this._textItems[index].textColor = textColor;
            this._textItems[index].backgroundColor = backgroundColor;
            if (this._chart) {
                this._chart.requestUpdate();
            }
        }
    }

    updateCircular(index: number, isCircular: boolean) {
        if (this._textItems[index]) {
            this._textItems[index].isCircular = isCircular;
            if (this._chart) {
                this._chart.requestUpdate();
            }
        }
    }

    removeTextItem(index: number) {
        if (this._textItems[index]) {
            this._textItems.splice(index, 1);
            if (this._chart) {
                this._chart.requestUpdate();
            }
        }
    }

    clearTextItems() {
        this._textItems = [];
        if (this._chart) {
            this._chart.requestUpdate();
        }
    }

    getTextItemCount(): number {
        return this._textItems.length;
    }
}