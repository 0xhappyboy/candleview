import { HistogramSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";

export class Histogram implements IMainChart {
    private series: any | null = null;
    private theme: ThemeConfig | null = null;

    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.series = chartLayer.props.chart.addSeries(HistogramSeries, {
            color: theme.chart.histogramColor || '#4CAF50',
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        });
        this.theme = theme;
        chartLayer.props.chart.priceScale('right').applyOptions({
            scaleMargins: {
                top: 0.05,
                bottom: 0.1,
            },
        });
        const histogramData = this.transformToHistogramData(chartLayer.props.chartData);
        if (histogramData.length > 0 && this.series) {
            setTimeout(() => {
                this.series.setData(histogramData);
            }, 0);
        }
    }

    private transformToHistogramData(chartData: ICandleViewDataPoint[]): any[] {
        return chartData.map(item => {
            const baseData = {
                time: item.time,
                value: item.close
            };
            if (item.isVirtual) {
                return {
                    ...baseData,
                    color: 'transparent'
                };
            } else {
                return {
                    ...baseData,
                    color: item.close >= (item.open || 0) ?
                        this.theme?.chart.candleUpColor : this.theme?.chart.candleDownColor
                };
            }
        });
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.series) return;
        const histogramData = this.transformToHistogramData(chartLayer.props.chartData);
        if (histogramData.length > 0) {
            setTimeout(() => {
                this.series.setData(histogramData);
            }, 0);
        }
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
}