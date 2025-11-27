import { CandleViewTopPanelState } from ".";
import { I18n } from "../I18n";
import { MainChartIndicatorType, SubChartIndicatorType, TimeframeEnum } from "../types";

export const mainIndicators = [
    { id: 'ma', name: 'Moving Average (MA)', icon: '📊', type: MainChartIndicatorType.MA },
    { id: 'ema', name: 'Exponential Moving Average (EMA)', icon: '📈', type: MainChartIndicatorType.EMA },
    { id: 'bollinger', name: 'Bollinger Bands', icon: '📉', type: MainChartIndicatorType.BOLLINGER },
    { id: 'ichimoku', name: 'Ichimoku Cloud', icon: '☁️', type: MainChartIndicatorType.ICHIMOKU },
    { id: 'donchian', name: 'Donchian Channel', icon: '📐', type: MainChartIndicatorType.DONCHIAN },
    { id: 'envelope', name: 'Envelope', icon: '📨', type: MainChartIndicatorType.ENVELOPE },
    { id: 'vwap', name: 'Volume Weighted Average Price (VWAP)', icon: '⚖️', type: MainChartIndicatorType.VWAP },
];

export const mainChartMaps = [
    { id: 'heatmap', name: 'Heat Map', icon: '🔥', type: MainChartIndicatorType.HEATMAP },
    { id: 'market-profile', name: 'Market Profile', icon: '🔥', type: MainChartIndicatorType.MARKETPROFILE },
];

export const subChartIndicators = [
    { id: 'rsi', name: 'Relative Strength Index (RSI)', icon: '⚡', type: SubChartIndicatorType.RSI },
    { id: 'macd', name: 'MACD', icon: '🔍', type: SubChartIndicatorType.MACD },
    { id: 'volume', name: 'Volume', icon: '📦', type: SubChartIndicatorType.VOLUME },
    { id: 'sar', name: 'Parabolic SAR (SAR)', icon: '🔄', type: SubChartIndicatorType.SAR },
    { id: 'kdj', name: 'KDJ', icon: '🎯', type: SubChartIndicatorType.KDJ },
    { id: 'atr', name: 'Average True Range (ATR)', icon: '📏', type: SubChartIndicatorType.ATR },
    { id: 'stochastic', name: 'Stochastic Oscillator', icon: '🔄', type: SubChartIndicatorType.STOCHASTIC },
    { id: 'cci', name: 'Commodity Channel Index (CCI)', icon: '📊', type: SubChartIndicatorType.CCI },
    { id: 'bbwidth', name: 'Bollinger Bands Width', icon: '📈', type: SubChartIndicatorType.BBWIDTH },
    { id: 'adx', name: 'Average Directional Index (ADX)', icon: '🎯', type: SubChartIndicatorType.ADX },
    { id: 'obv', name: 'On Balance Volume (OBV)', icon: '💧', type: SubChartIndicatorType.OBV },
];

export function getAllTimeframes(i18n: I18n) {
    return [
        {
            type: i18n.timeframeSections.second,
            sectionKey: 'Second' as keyof CandleViewTopPanelState['timeframeSections'],
            values: [
                TimeframeEnum.ONE_SECOND,
                TimeframeEnum.FIVE_SECONDS,
                TimeframeEnum.FIFTEEN_SECONDS,
                TimeframeEnum.THIRTY_SECONDS
            ]
        },
        {
            type: i18n.timeframeSections.minute,
            sectionKey: 'Minute' as keyof CandleViewTopPanelState['timeframeSections'],
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
            sectionKey: 'Hour' as keyof CandleViewTopPanelState['timeframeSections'],
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
            sectionKey: 'Day' as keyof CandleViewTopPanelState['timeframeSections'],
            values: [
                TimeframeEnum.ONE_DAY,
                TimeframeEnum.THREE_DAYS
            ]
        },
        {
            type: i18n.timeframeSections.week,
            sectionKey: 'Week' as keyof CandleViewTopPanelState['timeframeSections'],
            values: [
                TimeframeEnum.ONE_WEEK,
                TimeframeEnum.TWO_WEEKS
            ]
        },
        {
            type: i18n.timeframeSections.month,
            sectionKey: 'Month' as keyof CandleViewTopPanelState['timeframeSections'],
            values: [
                TimeframeEnum.ONE_MONTH,
                TimeframeEnum.THREE_MONTHS,
                TimeframeEnum.SIX_MONTHS
            ]
        }
    ];
};