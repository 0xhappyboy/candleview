import { HistogramSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";
import { Theme } from "antd/es/config-provider/context";

export class Histogram implements IMainChart {
    private histogramSeries: any | null = null;
    private theme: ThemeConfig | null = null;

    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.histogramSeries = chartLayer.props.chart.addSeries(HistogramSeries, {
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
        if (histogramData.length > 0 && this.histogramSeries) {
            setTimeout(() => {
                this.histogramSeries.setData(histogramData);
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
        if (!this.histogramSeries) return;
        const histogramData = this.transformToHistogramData(chartLayer.props.chartData);
        if (histogramData.length > 0) {
            setTimeout(() => {
                this.histogramSeries.setData(histogramData);
            }, 0);
        }
    }

    public updateStyle = (options: any): void => {
        if (this.histogramSeries) {
            this.histogramSeries.applyOptions(options);
        }
    }

    public destroy = (chartLayer: ChartLayer): void => {
        if (this.histogramSeries && chartLayer.props.chart) {
            chartLayer.props.chart.removeSeries(this.histogramSeries);
            this.histogramSeries = null;
        }
    }

    public getSeries(): any {
        return this.histogramSeries;
    }
}