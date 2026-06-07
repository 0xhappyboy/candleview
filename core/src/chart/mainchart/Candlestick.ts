import { CandlestickSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { IMainChart } from "./IMainChart";
import { ThemeConfig } from "../../theme";
import { Chart } from "../Chart";

export class Candlestick implements IMainChart {
    // candlestick series
    private candleSeries: any | null = null;
    constructor(chartLayer: Chart, theme: ThemeConfig) {
        this.candleSeries = chartLayer.chart!.addSeries(CandlestickSeries, {
            upColor: theme.chart.candleUpColor || '#26a69a',
            downColor: theme.chart.candleDownColor || '#ef5350',
            borderVisible: false,
            wickUpColor: theme.chart.candleUpColor || '#26a69a',
            wickDownColor: theme.chart.candleDownColor || '#ef5350',
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        });
        chartLayer.chart!.priceScale('right').applyOptions({
            scaleMargins: {
                top: 0.05,
                bottom: 0.1,
            },
        });
        const candlestickData = this.transformToCandlestickData(chartLayer.preprocessedData?.displayData!);
        if (candlestickData.length > 0 && this.candleSeries) {
            setTimeout(() => {
                this.candleSeries.setData(candlestickData);
            }, 0);
        }
    }

    private transformToCandlestickData(chartData: ICandleViewDataPoint[]): any[] {
        return chartData.map(item => {
            if (item.isVirtual) {
                return {
                    time: item.time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                    color: 'rgba(0, 0, 0, 0)'
                };
            } else {
                return {
                    time: item.time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close
                };
            }
        });
    }
    public refreshData = (chartLayer: Chart): void => {
        if (!this.candleSeries) return;
        const candlestickData = this.transformToCandlestickData(chartLayer.preprocessedData?.displayData!);
        if (candlestickData.length > 0) {
            setTimeout(() => {
                this.candleSeries.setData(candlestickData);
            }, 0);
        }
    }
    public updateStyle = (options: any): void => {
        if (this.candleSeries) {
            this.candleSeries.applyOptions(options);
        }
    }

    public destroy = (chartLayer: Chart): void => {
        if (!this.candleSeries) {
            return;
        }
        if (!chartLayer || !chartLayer || !chartLayer.chart) {
            this.candleSeries = null;
            return;
        }
        const seriesToRemove = this.candleSeries;
        this.candleSeries = null;
        try {
            chartLayer.chart.removeSeries(seriesToRemove);
        } catch (error) {
        }
    }

    public getSeries(): any {
        return this.candleSeries;
    }
}