import { BaseChartPane } from "./BaseChartPane";

export class SARPane extends BaseChartPane {

    protected calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        const baseValue = chartData[0].close || 0;
        return chartData.map((item, index) => ({
            time: item.time,
            value: baseValue * 0.95 + Math.random() * baseValue * 0.1
        }));
    }
}