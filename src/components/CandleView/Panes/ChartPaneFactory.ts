import { ThemeConfig } from "../CandleViewTheme";
import { SubChartIndicatorType } from "../types";
import { ADXPane } from "./ADXPane";
import { ATRPane } from "./ATRPane";
import { BaseChartPane } from "./BaseChartPane";
import { BBWidthPane } from "./BBWidthPane";
import { CCIPane } from "./CCIPane";
import { IChartPane } from "./IChartPanes";
import { KDJPane } from "./KDJPane";
import { MACDPane } from "./MACDPane";
import { OBVPane } from "./OBVPane";
import { RSIPane } from "./RSIPane";
import { SARPane } from "./SARPane";
import { StochasticPane } from "./StochasticPane";
import { VolumePane } from "./VolumePane";

export class ChartPaneFactory {
    static createPane(
        paneInstance: any,
        id: string,
        size: number,
        vertPosition: 'left' | 'right',
        indicatorType: SubChartIndicatorType,
        theme: ThemeConfig
    ): IChartPane {
        switch (indicatorType) {
            case SubChartIndicatorType.VOLUME:
                return new VolumePane(id, size, vertPosition, indicatorType, paneInstance, theme);
            case SubChartIndicatorType.RSI:
                return new RSIPane(id, size, vertPosition, indicatorType, paneInstance, theme);
            case SubChartIndicatorType.MACD:
                return new MACDPane(id, size, vertPosition, indicatorType, paneInstance, theme);
            case SubChartIndicatorType.STOCHASTIC:
                return new StochasticPane(id, size, vertPosition, indicatorType, paneInstance, theme);
            case SubChartIndicatorType.SAR:
                return new SARPane(id, size, vertPosition, indicatorType, paneInstance, theme);
            case SubChartIndicatorType.KDJ:
                return new KDJPane(id, size, vertPosition, indicatorType, paneInstance, theme);
            case SubChartIndicatorType.ATR:
                return new ATRPane(id, size, vertPosition, indicatorType, paneInstance, theme);
            case SubChartIndicatorType.CCI:
                return new CCIPane(id, size, vertPosition, indicatorType, paneInstance, theme);
            case SubChartIndicatorType.BBWIDTH:
                return new BBWidthPane(id, size, vertPosition, indicatorType, paneInstance, theme);
            case SubChartIndicatorType.ADX:
                return new ADXPane(id, size, vertPosition, indicatorType, paneInstance, theme);
            case SubChartIndicatorType.OBV:
                return new OBVPane(id, size, vertPosition, indicatorType, paneInstance, theme);
            default:
                return new RSIPane(id, size, vertPosition, indicatorType, paneInstance, theme);
        }
    }
}