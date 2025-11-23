import { BaseChartPane } from "./BaseChartPane";

export class ATRPane extends BaseChartPane {

    protected calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map(item => ({
            time: item.time,
            value: (item.high - item.low) * 0.7 + Math.random() * 0.5
        }));
    }
}