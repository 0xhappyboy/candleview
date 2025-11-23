import { BaseChartPane } from "./BaseChartPane";

export class BBWidthPane extends BaseChartPane {

    protected calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map((item, index) => ({
            time: item.time,
            value: Math.sin(index * 0.06) * 2 + 3
        }));
    }
}