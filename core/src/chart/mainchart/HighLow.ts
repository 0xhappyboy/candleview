import { CandlestickSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { IMainChart } from "./IMainChart";
import { ThemeConfig } from "../../theme";
import { Chart } from "../Chart";

export class HighLow implements IMainChart {
    private series: any | null = null;

    constructor(chartLayer: Chart, theme: ThemeConfig) {
        this.series = chartLayer.chart!.addSeries(CandlestickSeries, {
            upColor: theme.chart.candleUpColor || '#26a69a',
            downColor: theme.chart.candleDownColor || '#ef5350',
            borderVisible: false,
            wickUpColor: 'rgba(0, 0, 0, 0)',
            wickDownColor: 'rgba(0, 0, 0, 0)',
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
        const highLowData = this.transformToHighLowData(chartLayer.preprocessedData?.displayData!);
        if (highLowData.length > 0 && this.series) {
            setTimeout(() => {
                this.series.setData(highLowData);
            }, 0);
        }
    }

    private transformToHighLowData(data: ICandleViewDataPoint[]): any[] {
        return data.map(item => {
            if (item.isVirtual) {
                return {
                    time: item.time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                    color: 'rgba(0, 0, 0, 0)',
                    wickUpColor: 'rgba(0, 0, 0, 0)',
                    wickDownColor: 'rgba(0, 0, 0, 0)',
                    borderColor: 'rgba(0, 0, 0, 0)'
                };
            } else {
                const isUp = item.close >= item.open;
                const bodyTop = isUp ? item.close : item.open;
                const bodyBottom = isUp ? item.open : item.close;

                return {
                    time: item.time,
                    open: bodyBottom,
                    high: item.high,
                    low: item.low,
                    close: bodyTop,
                    wickUpColor: 'rgba(0, 0, 0, 0)',
                    wickDownColor: 'rgba(0, 0, 0, 0)',
                    borderVisible: false
                };
            }
        });
    }

    public refreshData = (chartLayer: Chart): void => {
        if (!this.series) return;
        const displayData = chartLayer.preprocessedData?.displayData;
        if (!displayData || displayData.length === 0) {
            return;
        }
        const processedData = displayData.map(item => {
            if (item.isVirtual) {
                return {
                    time: item.time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                    color: 'rgba(0, 0, 0, 0)',
                    wickUpColor: 'rgba(0, 0, 0, 0)',
                    wickDownColor: 'rgba(0, 0, 0, 0)',
                    borderColor: 'rgba(0, 0, 0, 0)'
                };
            } else {
                const isUp = item.close >= item.open;
                const bodyTop = isUp ? item.close : item.open;
                const bodyBottom = isUp ? item.open : item.close;

                return {
                    time: item.time,
                    open: bodyBottom,
                    high: item.high,
                    low: item.low,
                    close: bodyTop,
                    wickUpColor: 'rgba(0, 0, 0, 0)',
                    wickDownColor: 'rgba(0, 0, 0, 0)',
                    borderVisible: false
                };
            }
        });

        if (processedData.length > 0) {
            this.series.setData(processedData);
        }
    }

    public updateStyle = (options: any): void => {
        if (this.series) {
            this.series.applyOptions(options);
        }
    }

    public destroy = (chartLayer: Chart): void => {
        if (!this.series) {
            return;
        }
        if (!chartLayer || !chartLayer || !chartLayer.chart) {
            this.series = null;
            return;
        }
        const seriesToRemove = this.series;
        this.series = null;
        try {
            chartLayer.chart.removeSeries(seriesToRemove);
        } catch (error) {
        }
    }

    public getSeries(): any {
        return this.series;
    }
}