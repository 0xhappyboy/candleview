import { ThemeConfig } from "../../theme";
import { SubChartIndicatorType } from "../../types";
import { IChartPane } from "./IChartPanes";
import { ADX } from "./subchart/ADX";
import { ATR } from "./subchart/ATR";
import { BBWidth } from "./subchart/BBWidth";
import { CCI } from "./subchart/CCI";
import { KDJ } from "./subchart/KDJ";
import { MACD } from "./subchart/MACD";
import { OBV } from "./subchart/OBV";
import { RSI } from "./subchart/RSI";
import { SAR } from "./subchart/SAR";
import { Stochastic } from "./subchart/Stochastic";
import { Volume } from "./subchart/Volume";

export class ChartPaneFactory {
    static createPane(
        chartInstance: any,
        paneInstance: any,
        id: string,
        size: number,
        vertPosition: 'left' | 'right',
        indicatorType: SubChartIndicatorType,
        theme: ThemeConfig,
        onSettingsClick: (subChartIndicatorType: SubChartIndicatorType) => void,
        onCloseClick: (subChartIndicatorType: SubChartIndicatorType) => void,
    ): IChartPane {
        switch (indicatorType) {
            case SubChartIndicatorType.VOLUME:
                return new Volume(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.RSI:
                return new RSI(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.MACD:
                return new MACD(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.STOCHASTIC:
                return new Stochastic(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.SAR:
                return new SAR(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.KDJ:
                return new KDJ(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.ATR:
                return new ATR(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.CCI:
                return new CCI(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.BBWIDTH:
                return new BBWidth(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.ADX:
                return new ADX(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.OBV:
                return new OBV(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
            default:
                return new RSI(id, size, vertPosition, indicatorType, chartInstance, paneInstance, theme, onSettingsClick, onCloseClick);
        }
    }
}