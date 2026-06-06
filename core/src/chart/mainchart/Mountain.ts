import { AreaSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { Chart } from "../Chart";
import { IMainChart } from "./IMainChart";
import { ThemeConfig } from "../../theme";

export class Mountain implements IMainChart {
    private series: any | null = null;

    constructor(chartLayer: Chart, theme: ThemeConfig) {
        this.series = chartLayer.chart!.addSeries(AreaSeries, {
            topColor: theme.chart.areaTopColor || 'rgba(33, 150, 243, 0.4)',
            bottomColor: theme.chart.areaBottomColor || 'rgba(33, 150, 243, 0)',
            lineColor: theme.chart.areaLineColor || '#2196F3',
            lineWidth: 2,
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
        const mountainData = this.transformToMountainData(chartLayer.data);
        if (mountainData.length > 0 && this.series) {
            setTimeout(() => {
                this.series.setData(mountainData);
            }, 0);
        }
    }

    private transformToMountainData(chartData: ICandleViewDataPoint[]): any[] {
        return chartData.map(item => ({
            time: item.time,
            value: item.close,
            ...(item.isVirtual && {
                lineColor: 'rgba(0, 0, 0, 0)',
                topColor: 'rgba(0, 0, 0, 0)',
                bottomColor: 'rgba(0, 0, 0, 0)'
            })
        }));
    }

    public refreshData = (chartLayer: Chart): void => {
        if (!this.series) return;
        const processedData = chartLayer.data.map(item =>
            item.isVirtual ? {
                time: item.time,
                value: item.close,
                lineColor: 'rgba(0, 0, 0, 0)',
                topColor: 'rgba(0, 0, 0, 0)',
                bottomColor: 'rgba(0, 0, 0, 0)'
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

    public destroy = (chartLayer: Chart): void => {
        if (!this.series) {
            return;
        }
        if (!chartLayer || !chartLayer || !chartLayer.chart!) {
            this.series = null;
            return;
        }
        const seriesToRemove = this.series;
        this.series = null;
        try {
            chartLayer.chart!.removeSeries(seriesToRemove);
        } catch (error) {
        }
    }

    public getSeries(): any {
        return this.series;
    }
}