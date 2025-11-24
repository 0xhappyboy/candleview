import { MouseEventParams } from "lightweight-charts";
import { ThemeConfig } from "../CandleViewTheme";
import { IIndicatorInfo } from "../Indicators/SubChart/IIndicator";
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

    readonly paneInstance: any;

    getChart(): any;

    init(chartData: any[], settings?: {
        paramName: string,
        paramValue: number,
        lineColor: string,
        lineWidth: number
    }[]): void;

    getSeries(): { [key: string]: any };

    getParams(): IIndicatorInfo[];

    setStyles(styles: any): void;

    setVisible(visible: boolean): void;

    destroy(): void;

    updateData(chartData: any[]): void;

    updateSettings(chartData: any[], settings: IIndicatorInfo[]): void;

    updateThme(theme: ThemeConfig): void;

    onSettingsClick(subChartIndicatorType: SubChartIndicatorType): void;

    onCloseClick(subChartIndicatorType: SubChartIndicatorType): void;

    handleMouseDown(poin: Point): void;

    handleMouseMove(poin: Point): void;

    handleMouseUp(poin: Point): void;

    handleCrosshairMoveEvent(event: MouseEventParams): void;
}
