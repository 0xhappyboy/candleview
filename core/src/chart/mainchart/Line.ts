import { LineSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ThemeConfig } from "../../theme";
import { Chart } from "../Chart";
import { IMainChart } from "./IMainChart";

export class Line implements IMainChart {
    private lineSeries: any | null = null;
    private _lineWidht: number = 2;

    constructor(chartLayer: Chart, theme: ThemeConfig) {
        this.lineSeries = chartLayer.chart!.addSeries(LineSeries, {
            color: theme.chart.lineColor || '#2196F3',
            // lineWidth: this._lineWidht,
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
        const lineData = this.transformToLineData(chartLayer.preprocessedData?.displayData!);
        if (lineData.length > 0 && this.lineSeries) {
            setTimeout(() => {
                this.lineSeries.setData(lineData);
            }, 0);
        }
    }

    private transformToLineData(chartData: ICandleViewDataPoint[]): any[] {
        return chartData
            .filter(item => !item.isVirtual)
            .map(item => ({
                time: item.time,
                value: item.close
            }));
    }

    public refreshData = (chartLayer: Chart): void => {
        if (!this.lineSeries) return;
        const lineData = this.transformToLineData(chartLayer.preprocessedData?.displayData!);
        if (lineData.length > 0) {
            setTimeout(() => {
                this.lineSeries.setData(lineData);
            }, 0);
        }
    }

    public updateStyle = (options: any): void => {
        if (this.lineSeries) {
            this.lineSeries.applyOptions(options);
        }
    }

    public destroy = (chartLayer: Chart): void => {
        if (!this.lineSeries) {
            return;
        }
        if (!chartLayer || !chartLayer || !chartLayer.chart!) {
            this.lineSeries = null;
            return;
        }
        const seriesToRemove = this.lineSeries;
        this.lineSeries = null;
        try {
            chartLayer.chart!.removeSeries(seriesToRemove);
        } catch (error) {
        }
    }

    public getSeries(): any {
        return this.lineSeries;
    }
}