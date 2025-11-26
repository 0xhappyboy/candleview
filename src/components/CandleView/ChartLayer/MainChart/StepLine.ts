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
            lineType: 2,
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

        const stepLineData = this.transformToStepLineData(chartLayer.props.chartData);
        if (stepLineData.length > 0 && this.stepLineSeries) {
            setTimeout(() => {
                this.stepLineSeries.setData(stepLineData);
            }, 0);
        }
    }

    private transformToStepLineData(chartData: ICandleViewDataPoint[]): any[] {
        return chartData.map(item => ({
            time: item.time,
            value: item.close
        }));
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
            this.stepLineSeries.applyOptions(options);
        }
    }

    public destroy = (chartLayer: ChartLayer): void => {
        if (this.stepLineSeries && chartLayer.props.chart) {
            chartLayer.props.chart.removeSeries(this.stepLineSeries);
            this.stepLineSeries = null;
        }
    }

    public getSeries(): any {
        return this.stepLineSeries;
    }
}