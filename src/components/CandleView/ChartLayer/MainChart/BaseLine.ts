import { BaselineSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";

export class BaseLine implements IMainChart {
    private series: any | null = null;

    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.series = chartLayer.props.chart.addSeries(BaselineSeries, {
            baseValue: { type: 'price', price: 0 },
            topLineColor: theme.chart.candleUpColor || '#26a69a',
            topFillColor1: 'rgba(0, 0, 0, 0)',
            topFillColor2: 'rgba(0, 0, 0, 0)',
            bottomLineColor: theme.chart.candleDownColor || '#ef5350',
            bottomFillColor1: 'rgba(0, 0, 0, 0)',
            bottomFillColor2: 'rgba(0, 0, 0, 0)',
            lineWidth: 2,
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
        const baselineData = this.transformToBaselineData(chartLayer.props.chartData);
        if (baselineData.length > 0 && this.series) {
            setTimeout(() => {
                this.series.setData(baselineData);
            }, 0);
        }
    }

    private transformToBaselineData(chartData: ICandleViewDataPoint[]): any[] {
        const validData = chartData.filter(item => !item.isVirtual);
        const baselineValue = validData.length > 0
            ? validData.reduce((sum, item) => sum + item.close, 0) / validData.length
            : 0;
        if (this.series) {
            this.series.applyOptions({
                baseValue: { type: 'price', price: baselineValue }
            });
        }
        return chartData.map(item => ({
            time: item.time,
            value: item.close,
            ...(item.isVirtual && {
                topLineColor: 'rgba(0, 0, 0, 0)',
                bottomLineColor: 'rgba(0, 0, 0, 0)'
            })
        }));
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.series) return;
        const validData = chartLayer.props.chartData.filter(item => !item.isVirtual);
        const baselineValue = validData.length > 0
            ? validData.reduce((sum, item) => sum + item.close, 0) / validData.length
            : 0;
        this.series.applyOptions({
            baseValue: { type: 'price', price: baselineValue }
        });
        const processedData = chartLayer.props.chartData.map(item =>
            item.isVirtual ? {
                time: item.time,
                value: item.close,
                topLineColor: 'rgba(0, 0, 0, 0)',
                bottomLineColor: 'rgba(0, 0, 0, 0)'
            } : {
                time: item.time,
                value: item.close
            }
        );
        if (processedData.length > 0) {
            this.series.setData(processedData);
        }
    }

    public updateStyle = (options: any): void => {
        if (this.series) {
            this.series.applyOptions(options);
        }
    }

    public destroy = (chartLayer: ChartLayer): void => {
        if (this.series && chartLayer.props.chart) {
            chartLayer.props.chart.removeSeries(this.series);
            this.series = null;
        }
    }

    public getSeries(): any {
        return this.series;
    }
}