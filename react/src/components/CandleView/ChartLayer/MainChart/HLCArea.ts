import { LineSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";

export class HLCArea implements IMainChart {
    private series: any | null = null;
    private _chart: any = null;
    private _renderer: any = null;
    private _chartData: ICandleViewDataPoint[] = [];
    private _width: number = 0;
    private _height: number = 0;
    private _isAttached: boolean = false;
    private channelWidthPercent: number = 0.3;
    private _timeScale: any = null;
    private _lineWidth: number = 2;

    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this._chartData = chartLayer.props.chartData || [];
        this._chart = chartLayer.props.chart;
        this._timeScale = this._chart.timeScale();
        this.series = chartLayer.props.chart.addSeries(LineSeries, {
            color: theme.chart.lineColor || '#2196F3',
            lineWidth: this._lineWidth,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        });
        this.attachChannelRenderer(chartLayer);
        chartLayer.props.chart.priceScale('right').applyOptions({
            scaleMargins: {
                top: 0.05,
                bottom: 0.1,
            },
        });
        const baselineData = this.transformToBaselineData(chartLayer.props.chartData);
        if (baselineData.length > 0 && this.series) {
            setTimeout(() => {
                this.series.setData(baselineData);
                this.requestUpdate();
            }, 0);
        }
    }

    private attachChannelRenderer(chartLayer: ChartLayer): void {
        if (chartLayer.props.chartSeries && chartLayer.props.chartSeries.series) {
            this.attached({
                chart: chartLayer.props.chart,
                series: chartLayer.props.chartSeries.series
            });
            chartLayer.props.chartSeries.series.attachPrimitive(this);
            this._isAttached = true;
        }
    }

    private transformToBaselineData(chartData: ICandleViewDataPoint[]): any[] {
        const validData = chartData.filter(item => !item.isVirtual);
        return validData.map(item => ({
            time: item.time,
            value: item.close
        }));
    }

    attached(param: any) {
        this._chart = param.chart;
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
                    this.drawChannel(ctx);
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private drawChannel(ctx: CanvasRenderingContext2D): void {
        if (!this.series || !this._timeScale) return;
        const timeVisibleRange = this._timeScale.getVisibleRange();
        if (!timeVisibleRange) return;
        const visibleValidData = this._chartData.filter(item =>
            !item.isVirtual &&
            item.time >= timeVisibleRange.from &&
            item.time <= timeVisibleRange.to
        );
        if (visibleValidData.length < 2) return;
        const prices = visibleValidData.map(item => item.close);
        const period = 5;
        const smoothedPrices = [];
        for (let i = 0; i < prices.length; i++) {
            const start = Math.max(0, i - period + 1);
            const end = i + 1;
            const slice = prices.slice(start, end);
            smoothedPrices.push(slice.reduce((sum, price) => sum + price, 0) / slice.length);
        }
        const channelWidth = (Math.max(...smoothedPrices) - Math.min(...smoothedPrices)) * this.channelWidthPercent;
        this.drawChannelLines(ctx, visibleValidData, channelWidth);
    }

    private drawChannelLines(
        ctx: CanvasRenderingContext2D,
        validData: ICandleViewDataPoint[],
        channelWidth: number
    ): void {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#26a69a';
        ctx.lineWidth = this._lineWidth;
        ctx.setLineDash([]);
        let isFirstUpper = true;
        for (const item of validData) {
            const x = this._timeScale.timeToCoordinate(item.time);
            const upperValue = item.close + channelWidth;
            const y = this.series.priceToCoordinate(upperValue);
            if (x === null || y === null) continue;
            if (isFirstUpper) {
                ctx.moveTo(x, y);
                isFirstUpper = false;
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = this._lineWidth;
        ctx.setLineDash([]);
        let isFirstLower = true;
        for (const item of validData) {
            const x = this._timeScale.timeToCoordinate(item.time);
            const lowerValue = item.close - channelWidth;
            const y = this.series.priceToCoordinate(lowerValue);
            if (x === null || y === null) continue;
            if (isFirstLower) {
                ctx.moveTo(x, y);
                isFirstLower = false;
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        ctx.restore();
        this.drawChannelFill(ctx, validData, channelWidth);
    }

    private drawChannelFill(
        ctx: CanvasRenderingContext2D,
        validData: ICandleViewDataPoint[],
        channelWidth: number
    ): void {
        if (validData.length < 2) return;
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < validData.length; i++) {
            const item = validData[i];
            const x = this._timeScale.timeToCoordinate(item.time);
            const upperValue = item.close + channelWidth;
            const y = this.series.priceToCoordinate(upperValue);
            if (x === null || y === null) continue;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        for (let i = validData.length - 1; i >= 0; i--) {
            const item = validData[i];
            const x = this._timeScale.timeToCoordinate(item.time);
            const y = this.series.priceToCoordinate(item.close);
            if (x === null || y === null) continue;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(38, 166, 154, 0.3)';
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < validData.length; i++) {
            const item = validData[i];
            const x = this._timeScale.timeToCoordinate(item.time);
            const y = this.series.priceToCoordinate(item.close);
            if (x === null || y === null) continue;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        for (let i = validData.length - 1; i >= 0; i--) {
            const item = validData[i];
            const x = this._timeScale.timeToCoordinate(item.time);
            const lowerValue = item.close - channelWidth;
            const y = this.series.priceToCoordinate(lowerValue);
            if (x === null || y === null) continue;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(239, 83, 80, 0.3)';
        ctx.fill();
        ctx.restore();
    }

    private requestUpdate(): void {
        if (this._chart && this._isAttached) {
            try {
                if (this._chart._internal__paneUpdate) {
                    this._chart._internal__paneUpdate();
                }
            } catch (error) {
            }
        }
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.series) return;
        this._chartData = chartLayer.props.chartData || [];
        const processedData = this.transformToBaselineData(chartLayer.props.chartData);
        if (processedData.length > 0) {
            this.series.setData(processedData);
        }
        this.requestUpdate();
    }

    public updateStyle = (options: any): void => {
        if (this.series) {
            this.series.applyOptions(options);
        }
    }

    public destroy = (chartLayer: ChartLayer): void => {
        if (!this.series) {
            return;
        }
        if (!chartLayer || !chartLayer.props || !chartLayer.props.chart) {
            this.series = null;
            return;
        }
        const seriesToRemove = this.series;
        this.series = null;
        try {
            chartLayer.props.chart.removeSeries(seriesToRemove);
        } catch (error) {
        }
    }

    public getSeries(): any {
        return this.series;
    }

    public setChannelWidth(percent: number): void {
        this.channelWidthPercent = Math.max(0.01, Math.min(1, percent));
        this.requestUpdate();
    }

    public getChannelWidth(): number {
        return this.channelWidthPercent;
    }
}