import { TopPanelState } from ".";
import { I18n } from "../I18n";
import { MainChartIndicatorType, SubChartIndicatorType, TimeframeEnum } from "../types";

export const getMainIndicators = (i18n: I18n) => [
    { id: 'ma', name: i18n.mainIndicators.ma, type: MainChartIndicatorType.MA },
    { id: 'ema', name: i18n.mainIndicators.ema, type: MainChartIndicatorType.EMA },
    { id: 'bollinger', name: i18n.mainIndicators.bollinger, type: MainChartIndicatorType.BOLLINGER },
    { id: 'ichimoku', name: i18n.mainIndicators.ichimoku, type: MainChartIndicatorType.ICHIMOKU },
    { id: 'donchian', name: i18n.mainIndicators.donchian, type: MainChartIndicatorType.DONCHIAN },
    { id: 'envelope', name: i18n.mainIndicators.envelope, type: MainChartIndicatorType.ENVELOPE },
    { id: 'vwap', name: i18n.mainIndicators.vwap, type: MainChartIndicatorType.VWAP },
];

export const getMainChartMaps = (i18n: I18n) => [
    { id: 'heatmap', name: i18n.mainChartMaps.heatmap, type: MainChartIndicatorType.HEATMAP },
    { id: 'market-profile', name: i18n.mainChartMaps.marketProfile, type: MainChartIndicatorType.MARKETPROFILE },
];

export const getSubChartIndicators = (i18n: I18n) => [
    { id: 'rsi', name: i18n.subChartIndicatorName.rsi, type: SubChartIndicatorType.RSI },
    { id: 'macd', name: i18n.subChartIndicatorName.macd, type: SubChartIndicatorType.MACD },
    { id: 'volume', name: i18n.subChartIndicatorName.volume, type: SubChartIndicatorType.VOLUME },
    { id: 'sar', name: i18n.subChartIndicatorName.sar, type: SubChartIndicatorType.SAR },
    { id: 'kdj', name: i18n.subChartIndicatorName.kdj, type: SubChartIndicatorType.KDJ },
    { id: 'atr', name: i18n.subChartIndicatorName.atr, type: SubChartIndicatorType.ATR },
    { id: 'stochastic', name: i18n.subChartIndicatorName.stochastic, type: SubChartIndicatorType.STOCHASTIC },
    { id: 'cci', name: i18n.subChartIndicatorName.cci, type: SubChartIndicatorType.CCI },
    { id: 'bbwidth', name: i18n.subChartIndicatorName.bbwidth, type: SubChartIndicatorType.BBWIDTH },
    { id: 'adx', name: i18n.subChartIndicatorName.adx, type: SubChartIndicatorType.ADX },
    { id: 'obv', name: i18n.subChartIndicatorName.obv, type: SubChartIndicatorType.OBV },
];

export function getAllTimeframes(i18n: I18n) {
    return [
        {
            type: i18n.timeframeSections.second,
            sectionKey: 'Second' as keyof TopPanelState['timeframeSections'],
            values: [
                TimeframeEnum.ONE_SECOND,
                TimeframeEnum.FIVE_SECONDS,
                TimeframeEnum.FIFTEEN_SECONDS,
                TimeframeEnum.THIRTY_SECONDS
            ]
        },
        {
            type: i18n.timeframeSections.minute,
            sectionKey: 'Minute' as keyof TopPanelState['timeframeSections'],
            values: [
                TimeframeEnum.ONE_MINUTE,
                TimeframeEnum.THREE_MINUTES,
                TimeframeEnum.FIVE_MINUTES,
                TimeframeEnum.FIFTEEN_MINUTES,
                TimeframeEnum.THIRTY_MINUTES,
                TimeframeEnum.FORTY_FIVE_MINUTES
            ]
        },
        {
            type: i18n.timeframeSections.hour,
            sectionKey: 'Hour' as keyof TopPanelState['timeframeSections'],
            values: [
                TimeframeEnum.ONE_HOUR,
                TimeframeEnum.TWO_HOURS,
                TimeframeEnum.THREE_HOURS,
                TimeframeEnum.FOUR_HOURS,
                TimeframeEnum.SIX_HOURS,
                TimeframeEnum.EIGHT_HOURS,
                TimeframeEnum.TWELVE_HOURS
            ]
        },
        {
            type: i18n.timeframeSections.day,
            sectionKey: 'Day' as keyof TopPanelState['timeframeSections'],
            values: [
                TimeframeEnum.ONE_DAY,
                TimeframeEnum.THREE_DAYS
            ]
        },
        {
            type: i18n.timeframeSections.week,
            sectionKey: 'Week' as keyof TopPanelState['timeframeSections'],
            values: [
                TimeframeEnum.ONE_WEEK,
                TimeframeEnum.TWO_WEEKS
            ]
        },
        {
            type: i18n.timeframeSections.month,
            sectionKey: 'Month' as keyof TopPanelState['timeframeSections'],
            values: [
                TimeframeEnum.ONE_MONTH,
                TimeframeEnum.THREE_MONTHS,
                TimeframeEnum.SIX_MONTHS
            ]
        }
    ];
};