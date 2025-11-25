import { HistogramSeries } from "lightweight-charts";
import { ChartLayer } from ".";

export class ChartVolume {
    // volume series
    private volumeSeries: any | null = null;

    constructor(chartLayer: ChartLayer) {
        this.volumeSeries = chartLayer.props.chart.addSeries(HistogramSeries, {
            priceScaleId: 'volume_bottom',
            color: '#26a69a',
        });
        chartLayer.props.chart.priceScale('volume_bottom').applyOptions({
            scaleMargins: {
                top: 0.85,
                bottom: 0,
            },
            visible: false,
            mode: 2,
            autoScale: false,
        });
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        const volumeData = chartLayer.props.chartData
            .map(item => {
                if (item.isVirtual) {
                    return {
                        time: item.time,
                        value: item.volume!,
                        color: 'rgba(0, 0, 0, 0)'
                    };
                } else {
                    return {
                        time: item.time,
                        value: item.volume!,
                        color: item.close >= item.open ? 'rgba(38, 166, 154, 0.8)' : 'rgba(239, 83, 80, 0.8)'
                    };
                }
            });
        if (volumeData.length > 0 && this.volumeSeries) {
            setTimeout(() => {
                this.volumeSeries.setData(volumeData);
            }, 0);
        }
    }
}