import { AreaSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { IMainChart } from "./IMainChart";
import { ThemeConfig } from "../../theme";
import { Chart } from "../Chart";

export class Area implements IMainChart {

    private areaSeries: any | null = null;
    private theme: ThemeConfig | null = null;

    constructor(chartLayer: Chart, theme: ThemeConfig) {
        this.areaSeries = chartLayer.chart!.addSeries(AreaSeries, {
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
        this.theme = theme;
        chartLayer.chart!.priceScale('right').applyOptions({
            scaleMargins: {
                top: 0.05,
                bottom: 0.1,
            },
        });
        const areaData = this.transformToAreaData(chartLayer.preprocessedData?.displayData!);
        if (areaData.length > 0 && this.areaSeries) {
            setTimeout(() => {
                this.areaSeries.setData(areaData);
            }, 0);
        }
    }

    private transformToAreaData(chartData: ICandleViewDataPoint[]): any[] {
        return chartData.map(item => {
            const baseData = {
                time: item.time,
                value: item.close
            };
            if (item.isVirtual) {
                return {
                    ...baseData,
                    color: 'transparent',
                    lineColor: 'transparent',
                    topColor: 'transparent',
                    bottomColor: 'transparent'
                };
            } else {
                return baseData;
            }
        });
    }

    public refreshData = (chartLayer: Chart): void => {
        if (!this.areaSeries) return;
        const areaData = this.transformToAreaData(chartLayer.preprocessedData?.displayData!);
        if (areaData.length > 0) {
            setTimeout(() => {
                this.areaSeries.setData(areaData);
            }, 0);
        }
    }

    public updateStyle = (options: any): void => {
        if (this.areaSeries) {
            this.areaSeries.applyOptions(options);
        }
    }

    public destroy = (chartLayer: Chart): void => {
        if (!this.areaSeries) {
            return;
        }
        if (!chartLayer || !chartLayer || !chartLayer.chart) {
            this.areaSeries = null;
            return;
        }
        const seriesToRemove = this.areaSeries;
        this.areaSeries = null;
        try {
            chartLayer.chart.removeSeries(seriesToRemove);
        } catch (error) {
        }
    }

    public getSeries(): any {
        return this.areaSeries;
    }
}