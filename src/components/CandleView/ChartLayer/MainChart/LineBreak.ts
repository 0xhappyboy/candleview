import { LineSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";

export class LineBreak implements IMainChart {
    private series: any | null = null;
    private lineCount: number = 3;
    private globalChartData: ICandleViewDataPoint[] = [];

    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.series = chartLayer.props.chart.addSeries(LineSeries, {
            color: theme.chart.lineColor || '#2196F3',
            lineWidth: 2,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        });
        this.globalChartData = chartLayer.props.chartData;
        const lineBreakData = this.generateLineBreakData(this.globalChartData);
        if (lineBreakData.length > 0 && this.series) {
            setTimeout(() => {
                this.series.setData(lineBreakData);
            }, 0);
        }
    }

    private generateLineBreakData(globalData: ICandleViewDataPoint[]): any[] {
        if (globalData.length === 0) return [];
        const lines: any[] = [];
        let previousLines: number[] = [];
        for (let i = 0; i < globalData.length; i++) {
            const currentClose = globalData[i].close;
            if (lines.length === 0) {
                lines.push({
                    time: globalData[i].time,
                    value: currentClose
                });
                previousLines.push(currentClose);
                continue;
            }
            const shouldDrawNewLine = currentClose > Math.max(...previousLines) ||
                currentClose < Math.min(...previousLines);
            if (shouldDrawNewLine) {
                lines.push({
                    time: globalData[i].time,
                    value: currentClose
                });
                previousLines.push(currentClose);
                if (previousLines.length > this.lineCount) {
                    previousLines.shift();
                }
            }
        }
        return lines;
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.series) return;
        const processedData = chartLayer.props.chartData.map(item =>
            item.isVirtual ? {
                time: item.time,
                value: item.close,
                color: 'rgba(0, 0, 0, 0)'
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

    public setLineCount(count: number): void {
        this.lineCount = count;
    }
}