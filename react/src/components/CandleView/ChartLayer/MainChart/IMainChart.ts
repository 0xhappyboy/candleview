import { ChartLayer } from "..";

export interface IMainChart {
    refreshData(chartLayer: ChartLayer): void;
    updateStyle(options: any): void;
    destroy(chartLayer: ChartLayer): void;
    getSeries(): any;
}