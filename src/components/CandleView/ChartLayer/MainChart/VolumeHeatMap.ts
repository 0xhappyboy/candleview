import { ChartLayer } from "..";

export class VolumeHeatMap {
    private _chart: any = null;
    private _series: any = null;
    private _renderer: any = null;
    private _chartData: any[] = [];
    private _width: number = 0;
    private _height: number = 0;
    private _isAttached: boolean = false;

    constructor(chartLayer: ChartLayer) {
        this.initializeHeatMap(chartLayer);
    }

    private initializeHeatMap(chartLayer: ChartLayer): void {
        this._chartData = chartLayer.props.chartData || [];
        if (chartLayer.props.chartSeries && chartLayer.props.chartSeries.series) {
            this.attached({
                chart: chartLayer.props.chart,
                series: chartLayer.props.chartSeries.series
            });
            chartLayer.props.chartSeries.series.attachPrimitive(this);
            this._isAttached = true;
        }
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        this._chartData = chartLayer.props.chartData || [];
        this.requestUpdate();
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this.requestUpdate();
    }

    updateAllViews() {
        this.requestUpdate();
    }

    time() {
        return this._chartData.length > 0 ? this._chartData[0].time : 0;
    }

    priceValue() {
        return this._chartData.length > 0 ? this._chartData[0].close : 0;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart) return;
                    const chartElement = this._chart.chartElement();
                    if (!chartElement) return;
                    const chartRect = chartElement.getBoundingClientRect();
                    this._width = chartRect.width;
                    this._height = chartRect.height - 29;
                    if (this._width <= 0 || this._height <= 0) return;
                    this.drawHeatMap(ctx);
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private drawHeatMap(ctx: CanvasRenderingContext2D): void {
        const chartData = this._chartData;
        if (!chartData || chartData.length === 0) return;
        const validData = chartData.filter(item => !item.isVirtual && item.volume);
        if (validData.length === 0) return;
        const minPrice = Math.min(...validData.map(item => item.low));
        const maxPrice = Math.max(...validData.map(item => item.high));
        const priceDiff = maxPrice - minPrice;
        if (priceDiff <= 0) return;
        const heatMapWidth = this._width * 0.25;
        const heatMapX = this._width - heatMapWidth;
        ctx.clearRect(heatMapX, 0, heatMapWidth, this._height);
        const priceLevels = Math.min(200, Math.floor(this._height / 2));
        const volumeByPrice: number[] = new Array(priceLevels).fill(0);
        validData.forEach(item => {
            const highLevel = Math.min(priceLevels - 1, Math.max(0,
                Math.floor(((item.high - minPrice) / priceDiff) * priceLevels)
            ));
            const lowLevel = Math.min(priceLevels - 1, Math.max(0,
                Math.floor(((item.low - minPrice) / priceDiff) * priceLevels)
            ));
            const levels = Math.max(1, highLevel - lowLevel + 1);
            const volumePerLevel = item.volume / levels;

            for (let level = lowLevel; level <= highLevel; level++) {
                volumeByPrice[level] += volumePerLevel;
            }
        });
        const maxLevelVolume = Math.max(...volumeByPrice);
        if (maxLevelVolume === 0) return;
        const minWidth = 2;
        const cellHeight = this._height / priceLevels;
        ctx.save();
        for (let i = 0; i < priceLevels; i++) {
            const volume = volumeByPrice[i];
            if (volume === 0) continue;
            const volumeRatio = volume / maxLevelVolume;
            const minVolumeRatio = 0.01;
            const effectiveVolumeRatio = Math.max(volumeRatio, minVolumeRatio);
            const cellWidth = Math.max(minWidth, heatMapWidth * effectiveVolumeRatio);
            const intensity = Math.pow(effectiveVolumeRatio, 0.5); 
            let red, green, blue;
            if (intensity < 0.5) {
                const t = intensity * 2;
                red = Math.floor(0);
                green = Math.floor(165 * t);
                blue = Math.floor(255 * (1 - t) + 255 * t);
            } else {
                const t = (intensity - 0.5) * 2;
                red = Math.floor(255 * t);
                green = Math.floor(255 * (1 - t));
                blue = Math.floor(255 * (1 - t));
            }
            const alpha = 0.4 + intensity * 0.6;
            const color = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            const x = heatMapX + (heatMapWidth - cellWidth);
            const y = this._height - (i + 1) * cellHeight;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, cellWidth, cellHeight);
        }
        ctx.restore();
    }

    private requestUpdate(): void {
        if (this._chart && this._isAttached) {
            try {
                if (this._chart._internal__paneUpdate) {
                    this._chart._internal__paneUpdate();
                }
                if (this._series && this._series._internal__dataChanged) {
                    this._series._internal__dataChanged();
                }
            } catch (error) {
            }
        }
    }

    public destroy(): void {
        if (this._series && this._isAttached) {
            try {
                this._series.detachPrimitive(this);
                this._isAttached = false;
            } catch (error) {
            }
        }
    }
}