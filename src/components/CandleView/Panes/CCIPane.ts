import { BaseChartPane } from "./BaseChartPane";

export class CCIPane extends BaseChartPane {

    protected calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map((item, index) => ({
            time: item.time,
            value: Math.sin(index * 0.07) * 100
        }));
    }
}