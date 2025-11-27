import { CandlestickSeries } from "lightweight-charts";
import { ICandleViewDataPoint } from "../../types";
import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { IMainChart } from "./IMainChart";

export class HighLow implements IMainChart {
    private series: any | null = null;
    
    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.series = chartLayer.props.chart.addSeries(CandlestickSeries, {
            upColor: theme.chart.candleUpColor || '#26a69a',
            downColor: theme.chart.candleDownColor || '#ef5350',
            borderVisible: false,
            wickUpColor: 'rgba(0, 0, 0, 0)', 
            wickDownColor: 'rgba(0, 0, 0, 0)', 
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
        
        const highLowData = this.transformToHighLowData(chartLayer.props.chartData);
        if (highLowData.length > 0 && this.series) {
            setTimeout(() => {
                this.series.setData(highLowData);
            }, 0);
        }
    }

    private transformToHighLowData(chartData: ICandleViewDataPoint[]): any[] {
        return chartData.map(item => {
            if (item.isVirtual) {
                return {
                    time: item.time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                    color: 'rgba(0, 0, 0, 0)',
                    wickUpColor: 'rgba(0, 0, 0, 0)',
                    wickDownColor: 'rgba(0, 0, 0, 0)',
                    borderColor: 'rgba(0, 0, 0, 0)'
                };
            } else {
                const isUp = item.close >= item.open;
                const bodyTop = isUp ? item.close : item.open;
                const bodyBottom = isUp ? item.open : item.close;
                
                return {
                    time: item.time,
                    open: bodyBottom,
                    high: item.high,
                    low: item.low,
                    close: bodyTop,
                    wickUpColor: 'rgba(0, 0, 0, 0)',
                    wickDownColor: 'rgba(0, 0, 0, 0)',
                    borderVisible: false
                };
            }
        });
    }
    
    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.series) return;
        
        const processedData = chartLayer.props.chartData.map(item => {
            if (item.isVirtual) {
                return {
                    time: item.time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                    color: 'rgba(0, 0, 0, 0)',
                    wickUpColor: 'rgba(0, 0, 0, 0)',
                    wickDownColor: 'rgba(0, 0, 0, 0)',
                    borderColor: 'rgba(0, 0, 0, 0)'
                };
            } else {
                const isUp = item.close >= item.open;
                const bodyTop = isUp ? item.close : item.open;
                const bodyBottom = isUp ? item.open : item.close;
                
                return {
                    time: item.time,
                    open: bodyBottom,
                    high: item.high,
                    low: item.low,
                    close: bodyTop,
                    wickUpColor: 'rgba(0, 0, 0, 0)',
                    wickDownColor: 'rgba(0, 0, 0, 0)',
                    borderVisible: false
                };
            }
        });
        
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