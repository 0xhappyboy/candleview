import { BaseChartPane } from "./BaseChartPane";

export class KDJPane extends BaseChartPane {

    protected calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map((item, index) => ({
            time: item.time,
            value: 50 + Math.sin(index * 0.08) * 40
        }));
    }
}