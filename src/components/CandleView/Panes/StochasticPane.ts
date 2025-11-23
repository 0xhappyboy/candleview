import { BaseChartPane } from "./BaseChartPane";

export class StochasticPane extends BaseChartPane {
   
    protected calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map((item, index) => ({
            time: item.time,
            value: 50 + Math.cos(index * 0.1) * 40
        }));
    }
}