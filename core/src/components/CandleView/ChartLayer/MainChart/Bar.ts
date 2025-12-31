import { BarSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";

export class Bar implements IMainChart {
    private barSeries: any | null = null;
    private theme: ThemeConfig | null = null;

    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.barSeries = chartLayer.props.chart.addSeries(BarSeries, {
            upColor: theme.chart.candleUpColor || '#26a69a',
            downColor: theme.chart.candleDownColor || '#ef5350',
            thinBars: true,
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
        const barData = this.transformToBarData(chartLayer.props.chartData);
        if (barData.length > 0 && this.barSeries) {
            setTimeout(() => {
                this.barSeries.setData(barData);
            }, 0);
        }
    }

    private transformToBarData(chartData: ICandleViewDataPoint[]): any[] {
        return chartData.map(item => {
            const baseData = {
                time: item.time,
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close)
            };
            if (item.isVirtual) {
                return {
                    ...baseData,
                    color: 'transparent',
                    borderColor: 'transparent'
                };
            } else {
                return baseData;
            }
        });
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.barSeries) return;
        const barData = this.transformToBarData(chartLayer.props.chartData);
        if (barData.length > 0) {
            setTimeout(() => {
                this.barSeries.setData(barData);
            }, 0);
        }
    }

    public updateStyle = (options: any): void => {
        if (this.barSeries) {
            this.barSeries.applyOptions(options);
        }
    }

    public destroy = (chartLayer: ChartLayer): void => {
        if (!this.barSeries) {
            return;
        }
        if (!chartLayer || !chartLayer.props || !chartLayer.props.chart) {
            this.barSeries = null;
            return;
        }
        const seriesToRemove = this.barSeries;
        this.barSeries = null;
        try {
            chartLayer.props.chart.removeSeries(seriesToRemove);
        } catch (error) {
        }
    }
    
    public getSeries(): any {
        return this.barSeries;
    }
}