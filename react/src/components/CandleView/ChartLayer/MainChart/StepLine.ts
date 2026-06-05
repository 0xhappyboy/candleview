import { LineSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";

export class StepLine implements IMainChart {
    private stepLineSeries: any | null = null;
    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.stepLineSeries = chartLayer.props.chart.addSeries(LineSeries, {
            color: theme.chart.stepLineColor || '#9C27B0',
            lineWidth: 2,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        });
        this.stepLineSeries.applyOptions({
            lineType: 1,
        });
        chartLayer.props.chart.priceScale('right').applyOptions({
            scaleMargins: {
                top: 0.05,
                bottom: 0.1,
            },
        });
        const stepLineData = this.transformToStepLineData(chartLayer.props.chartData);
        if (stepLineData.length > 0 && this.stepLineSeries) {
            setTimeout(() => {
                this.stepLineSeries.setData(stepLineData);
            }, 0);
        }
    }

    private transformToStepLineData(chartData: ICandleViewDataPoint[]): any[] {
        return chartData.map(item => {
            const baseData = {
                time: item.time,
                value: item.close
            };
            if (item.isVirtual) {
                return {
                    ...baseData,
                    color: 'transparent'
                };
            } else {
                return baseData;
            }
        });
    }
    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.stepLineSeries) return;
        const stepLineData = this.transformToStepLineData(chartLayer.props.chartData);
        if (stepLineData.length > 0) {
            setTimeout(() => {
                this.stepLineSeries.setData(stepLineData);
            }, 0);
        }
    }
    public updateStyle = (options: any): void => {
        if (this.stepLineSeries) {
            const stepOptions = {
                ...options,
                lineType: 1
            };
            this.stepLineSeries.applyOptions(stepOptions);
        }
    }

    public destroy = (chartLayer: ChartLayer): void => {
        if (!this.stepLineSeries) {
            return;
        }
        if (!chartLayer || !chartLayer.props || !chartLayer.props.chart) {
            this.stepLineSeries = null;
            return;
        }
        const seriesToRemove = this.stepLineSeries;
        this.stepLineSeries = null;
        try {
            chartLayer.props.chart.removeSeries(seriesToRemove);
        } catch (error) {
        }
    }

    public getSeries(): any {
        return this.stepLineSeries;
    }
}