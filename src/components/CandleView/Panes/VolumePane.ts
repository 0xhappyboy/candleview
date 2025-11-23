import { BaseChartPane } from "./BaseChartPane";

export class VolumePane extends BaseChartPane {

    protected calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map(item => ({
            time: item.time,
            value: item.volume || Math.random() * 1000,
            color: item.close >= item.open ? 'rgba(38, 166, 154, 0.8)' : 'rgba(239, 83, 80, 0.8)'
        }));
    }
}