import { SubChartIndicatorType } from "../types";

export interface PaneConfig {
    id: string;
    size: number;
    vertPosition: 'left' | 'right';
    indicatorType: SubChartIndicatorType;
    series: any;
}

export interface IChartPane {

    readonly id: string;

    readonly size: number;

    readonly vertPosition: 'left' | 'right';

    readonly indicatorType: SubChartIndicatorType;

    getChart(): any;

    updateData(chartData: any[]): void;

    setStyles(styles: any): void;

    setVisible(visible: boolean): void;

    destroy(): void;
    
}
