import { ThemeConfig } from "../CandleViewTheme";
import { Point, SubChartIndicatorType } from "../types";

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

    setStyles(styles: any): void;

    setVisible(visible: boolean): void;

    destroy(): void;

    updateData(chartData: any[]): void;

    updateSettings(chartData: any[], settings: {
        paramName: string,
        paramValue: number,
        lineColor: string,
        lineWidth: number
    }[]): void;

    updateThme(theme: ThemeConfig): void;

    onSettingsClick(): void;

    onCloseClick(): void;

    handleMouseDown(poin: Point): void;

    handleMouseMove(poin: Point): void;

    handleMouseUp(poin: Point): void;

}
