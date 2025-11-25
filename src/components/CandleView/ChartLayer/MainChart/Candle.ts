import { CandlestickSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";

export class Candle {
    // candlestick series
    private candleSeries: any | null = null;
    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.candleSeries = chartLayer.props.chart.addSeries(CandlestickSeries, {
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
        chartLayer.props.chart.priceScale('right').applyOptions({
            scaleMargins: {
                top: 0.05,
                bottom: 0.1,
            },
        });
        const candlestickData = this.transformToCandlestickData(chartLayer.props.chartData);
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
    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.candleSeries) return;
        const candlestickData = this.transformToCandlestickData(chartLayer.props.chartData);
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
    public destroy = (chartLayer: ChartLayer): void => {
        if (this.candleSeries && chartLayer.props.chart) {
            chartLayer.props.chart.removeSeries(this.candleSeries);
            this.candleSeries = null;
        }
    }
}