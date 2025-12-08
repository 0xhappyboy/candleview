import { CandlestickSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";

export class HeikinAshi implements IMainChart {
    private series: any | null = null;

    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.series = chartLayer.props.chart.addSeries(CandlestickSeries, {
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
        const heikinAshiData = this.transformToHeikinAshiData(chartLayer.props.chartData);
        if (heikinAshiData.length > 0 && this.series) {
            setTimeout(() => {
                this.series.setData(heikinAshiData);
            }, 0);
        }
    }

    private transformToHeikinAshiData(chartData: ICandleViewDataPoint[]): any[] {
        if (chartData.length === 0) return [];
        const heikinAshiData: any[] = [];
        let prevHA: { open: number; close: number } | null = null;
        for (let i = 0; i < chartData.length; i++) {
            const current = chartData[i];
            if (current.isVirtual) {
                heikinAshiData.push({
                    time: current.time,
                    open: current.open,
                    high: current.high,
                    low: current.low,
                    close: current.close,
                    color: 'rgba(0, 0, 0, 0)'
                });
                continue;
            }
            let haOpen: number, haHigh: number, haLow: number, haClose: number;
            if (prevHA === null) {
                haOpen = (current.open + current.close) / 2;
                haClose = (current.open + current.high + current.low + current.close) / 4;
                haHigh = current.high;
                haLow = current.low;
            } else {
                // Heikin Ashi 计算公式：
                // HA_Close = (Open + High + Low + Close) / 4
                // HA_Open = (前一根HA_Open + 前一根HA_Close) / 2
                // HA_High = Max(High, HA_Open, HA_Close)
                // HA_Low = Min(Low, HA_Open, HA_Close)
                haOpen = (prevHA.open + prevHA.close) / 2;
                haClose = (current.open + current.high + current.low + current.close) / 4;
                haHigh = Math.max(current.high, haOpen, haClose);
                haLow = Math.min(current.low, haOpen, haClose);
            }
            const heikinAshiPoint = {
                time: current.time,
                open: haOpen,
                high: haHigh,
                low: haLow,
                close: haClose
            };
            heikinAshiData.push(heikinAshiPoint);
            prevHA = { open: haOpen, close: haClose };
        }
        return heikinAshiData;
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.series) return;
        const heikinAshiData = this.transformToHeikinAshiData(chartLayer.props.chartData);
        if (heikinAshiData.length > 0) {
            setTimeout(() => {
                this.series.setData(heikinAshiData);
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