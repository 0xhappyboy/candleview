import { LineSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";

export class BaseLine implements IMainChart {
    private baseLineSeries: any | null = null;
    
    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.baseLineSeries = chartLayer.props.chart.addSeries(LineSeries, {
            color: theme.chart.baseLineColor || '#aa6600ff',
            lineWidth: 1,
            lineStyle: 2, 
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
        
        const baseLineData = this.transformToBaseLineData(chartLayer.props.chartData);
        if (baseLineData.length > 0 && this.baseLineSeries) {
            setTimeout(() => {
                this.baseLineSeries.setData(baseLineData);
            }, 0);
        }
    }

    private transformToBaseLineData(chartData: ICandleViewDataPoint[]): any[] {
        return chartData.map(item => ({
            time: item.time,
            value: item.close
        }));
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.baseLineSeries) return;
        const baseLineData = this.transformToBaseLineData(chartLayer.props.chartData);
        if (baseLineData.length > 0) {
            setTimeout(() => {
                this.baseLineSeries.setData(baseLineData);
            }, 0);
        }
    }

    public updateStyle = (options: any): void => {
        if (this.baseLineSeries) {
            this.baseLineSeries.applyOptions(options);
        }
    }

    public destroy = (chartLayer: ChartLayer): void => {
        if (this.baseLineSeries && chartLayer.props.chart) {
            chartLayer.props.chart.removeSeries(this.baseLineSeries);
            this.baseLineSeries = null;
        }
    }

    public getSeries(): any {
        return this.baseLineSeries;
    }
}