import { Chart } from "../Chart";

export interface IMainChart {
    refreshData(chart: Chart): void;
    updateStyle(options: any): void;
    destroy(chart: Chart): void;
    getSeries(): any;
}