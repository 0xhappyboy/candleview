import { AreaSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";

export class Area implements IMainChart {

    private areaSeries: any | null = null;
    private theme: ThemeConfig | null = null;

    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.areaSeries = chartLayer.props.chart.addSeries(AreaSeries, {
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
        chartLayer.props.chart.priceScale('right').applyOptions({
            scaleMargins: {
                top: 0.05,
                bottom: 0.1,
            },
        });
        const areaData = this.transformToAreaData(chartLayer.props.chartData);
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

    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.areaSeries) return;
        const areaData = this.transformToAreaData(chartLayer.props.chartData);
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

    public destroy = (chartLayer: ChartLayer): void => {
        if (this.areaSeries && chartLayer.props.chart) {
            chartLayer.props.chart.removeSeries(this.areaSeries);
            this.areaSeries = null;
        }
    }

    public getSeries(): any {
        return this.areaSeries;
    }
}