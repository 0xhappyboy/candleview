import { ThemeConfig } from "../../Theme";
import { SubChartIndicatorType } from "../../types";
import { ADX } from "../SubChart/ADX";
import { ATR } from "../SubChart/ATR";
import { BBWidth } from "../SubChart/BBWidth";
import { CCI } from "../SubChart/CCI";
import { KDJ } from "../SubChart/KDJ";
import { MACD } from "../SubChart/MACD";
import { OBV } from "../SubChart/OBV";
import { RSI } from "../SubChart/RSI";
import { SAR } from "../SubChart/SAR";
import { Stochastic } from "../SubChart/Stochastic";
import { Volume } from "../SubChart/Volume";
import { IChartPane } from "./IChartPanes";

export class ChartPaneFactory {
    static createPane(
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
                return new Volume(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.RSI:
                return new RSI(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.MACD:
                return new MACD(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.STOCHASTIC:
                return new Stochastic(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.SAR:
                return new SAR(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.KDJ:
                return new KDJ(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.ATR:
                return new ATR(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.CCI:
                return new CCI(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.BBWIDTH:
                return new BBWidth(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.ADX:
                return new ADX(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
            case SubChartIndicatorType.OBV:
                return new OBV(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
            default:
                return new RSI(id, size, vertPosition, indicatorType, paneInstance, theme, onSettingsClick, onCloseClick);
        }
    }
}