import { CandlestickSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";

export class HollowCandlestick implements IMainChart {

    private candleSeries: any | null = null;

    private theme: ThemeConfig | null = null;

    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.candleSeries = chartLayer.props.chart.addSeries(CandlestickSeries, {
            upColor: 'transparent',
            downColor: 'transparent',
            borderUpColor: theme.chart.candleUpColor || '#26a69a',
            borderDownColor: theme.chart.candleDownColor || '#ef5350',
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

        const candlestickData = this.transformToHollowCandlestickData(chartLayer.props.chartData);
        if (candlestickData.length > 0 && this.candleSeries) {
            setTimeout(() => {
                this.candleSeries.setData(candlestickData);
            }, 0);
        }
    }

    private transformToHollowCandlestickData(chartData: ICandleViewDataPoint[]): any[] {
        return chartData.map(item => {
            const isHollow = item.close > item.open;
            const baseData = {
                time: item.time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close
            };

            if (item.isVirtual) {
                return {
                    ...baseData,
                    color: 'rgba(0, 0, 0, 0)'
                };
            } else {
                return {
                    ...baseData,
                    borderColor: isHollow ? this.theme?.chart.candleUpColor : this.theme?.chart.candleDownColor,
                    wickColor: isHollow ? this.theme?.chart.candleUpColor : this.theme?.chart.candleDownColor,
                };
            }
        });
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.candleSeries) return;
        const candlestickData = this.transformToHollowCandlestickData(chartLayer.props.chartData);
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

    public getSeries(): any {
        return this.candleSeries;
    }
}