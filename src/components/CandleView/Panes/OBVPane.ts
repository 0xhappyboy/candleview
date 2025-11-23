import { BaseChartPane } from "./BaseChartPane";

export class OBVPane extends BaseChartPane {

    protected calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map((item, index) => ({
            time: item.time,
            value: index * 1000 + Math.random() * 5000
        }));
    }
}