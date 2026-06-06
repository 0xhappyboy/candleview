import { HistogramSeries } from "lightweight-charts";
import { Chart } from "../Chart";

export class Volume {
    // volume series
    private volumeSeries: any | null = null;

    constructor(chartLayer: Chart) {
        this.volumeSeries = chartLayer.chart!.addSeries(HistogramSeries, {
            priceScaleId: 'volume_bottom',
            color: '#26a69a',
        });
        chartLayer.chart!.priceScale('volume_bottom').applyOptions({
            scaleMargins: {
                top: 0.9,
                bottom: 0,
            },
        });
    }

    public refreshData = (chartLayer: Chart): void => {
        if (!this.volumeSeries) return;
        const volumeData = chartLayer.data
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

    public destroy(chartLayer: Chart): void {
        if (this.volumeSeries && chartLayer.chart!) {
            try {
                chartLayer.chart!.removeSeries(this.volumeSeries);
            } catch (error) {
            }
            this.volumeSeries = null;
        }
    }
}