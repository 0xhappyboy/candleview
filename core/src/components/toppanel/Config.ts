import { I18n } from '../../i18n';
import { MainChartIndicatorType, SubChartIndicatorType, TimeframeEnum } from '../../types';

export const getMainIndicators = (i18n: I18n) => [
    { id: 'ma', name: i18n.indicators.ma, type: MainChartIndicatorType.MA },
    { id: 'ema', name: i18n.indicators.ema, type: MainChartIndicatorType.EMA },
    { id: 'bollinger', name: i18n.indicators.bollinger, type: MainChartIndicatorType.BOLLINGER },
    { id: 'ichimoku', name: i18n.indicators.ichimoku, type: MainChartIndicatorType.ICHIMOKU },
    { id: 'donchian', name: i18n.indicators.donchian, type: MainChartIndicatorType.DONCHIAN },
    { id: 'envelope', name: i18n.indicators.envelope, type: MainChartIndicatorType.ENVELOPE },
    { id: 'vwap', name: i18n.indicators.vwap, type: MainChartIndicatorType.VWAP },
];

export const getMainChartMaps = (i18n: I18n) => [
    { id: 'heatmap', name: i18n.mainChartMaps.heatmap, type: MainChartIndicatorType.HEATMAP },
    { id: 'market-profile', name: i18n.mainChartMaps.marketProfile, type: MainChartIndicatorType.MARKETPROFILE },
];

export const getSubChartIndicators = (i18n: I18n) => [
    { id: 'rsi', name: i18n.indicators.rsi, type: SubChartIndicatorType.RSI },
    { id: 'macd', name: i18n.indicators.macd, type: SubChartIndicatorType.MACD },
    { id: 'volume', name: i18n.indicators.volume, type: SubChartIndicatorType.VOLUME },
    { id: 'sar', name: i18n.indicators.sar, type: SubChartIndicatorType.SAR },
    { id: 'kdj', name: i18n.indicators.kdj, type: SubChartIndicatorType.KDJ },
    { id: 'atr', name: i18n.indicators.atr, type: SubChartIndicatorType.ATR },
    { id: 'stochastic', name: i18n.indicators.stochastic, type: SubChartIndicatorType.STOCHASTIC },
    { id: 'cci', name: i18n.indicators.cci, type: SubChartIndicatorType.CCI },
    { id: 'bbwidth', name: i18n.indicators.bbwidth, type: SubChartIndicatorType.BBWIDTH },
    { id: 'adx', name: i18n.indicators.adx, type: SubChartIndicatorType.ADX },
    { id: 'obv', name: i18n.indicators.obv, type: SubChartIndicatorType.OBV },
];

export function getAllTimeframes(i18n: I18n) {
    return [
        { type: i18n.timeframeSections.second, sectionKey: 'Second', values: [TimeframeEnum.ONE_SECOND, TimeframeEnum.FIVE_SECONDS, TimeframeEnum.FIFTEEN_SECONDS, TimeframeEnum.THIRTY_SECONDS] },
        { type: i18n.timeframeSections.minute, sectionKey: 'Minute', values: [TimeframeEnum.ONE_MINUTE, TimeframeEnum.THREE_MINUTES, TimeframeEnum.FIVE_MINUTES, TimeframeEnum.FIFTEEN_MINUTES, TimeframeEnum.THIRTY_MINUTES, TimeframeEnum.FORTY_FIVE_MINUTES] },
        { type: i18n.timeframeSections.hour, sectionKey: 'Hour', values: [TimeframeEnum.ONE_HOUR, TimeframeEnum.TWO_HOURS, TimeframeEnum.THREE_HOURS, TimeframeEnum.FOUR_HOURS, TimeframeEnum.SIX_HOURS, TimeframeEnum.EIGHT_HOURS, TimeframeEnum.TWELVE_HOURS] },
        { type: i18n.timeframeSections.day, sectionKey: 'Day', values: [TimeframeEnum.ONE_DAY, TimeframeEnum.THREE_DAYS] },
        { type: i18n.timeframeSections.week, sectionKey: 'Week', values: [TimeframeEnum.ONE_WEEK, TimeframeEnum.TWO_WEEKS] },
        { type: i18n.timeframeSections.month, sectionKey: 'Month', values: [TimeframeEnum.ONE_MONTH, TimeframeEnum.THREE_MONTHS, TimeframeEnum.SIX_MONTHS] }
    ];
}

export const timezones = [
    { id: 'America/New_York', name: 'New York', offset: '-05:00' },
    { id: 'America/Chicago', name: 'Chicago', offset: '-06:00' },
    { id: 'America/Denver', name: 'Denver', offset: '-07:00' },
    { id: 'America/Los_Angeles', name: 'Los Angeles', offset: '-08:00' },
    { id: 'America/Toronto', name: 'Toronto', offset: '-05:00' },
    { id: 'Europe/London', name: 'London', offset: '+00:00' },
    { id: 'Europe/Paris', name: 'Paris', offset: '+01:00' },
    { id: 'Europe/Frankfurt', name: 'Frankfurt', offset: '+01:00' },
    { id: 'Europe/Zurich', name: 'Zurich', offset: '+01:00' },
    { id: 'Europe/Moscow', name: 'Moscow', offset: '+03:00' },
    { id: 'Asia/Dubai', name: 'Dubai', offset: '+04:00' },
    { id: 'Asia/Karachi', name: 'Karachi', offset: '+05:00' },
    { id: 'Asia/Kolkata', name: 'Kolkata', offset: '+05:30' },
    { id: 'Asia/Shanghai', name: 'Shanghai', offset: '+08:00' },
    { id: 'Asia/Hong_Kong', name: 'Hong Kong', offset: '+08:00' },
    { id: 'Asia/Singapore', name: 'Singapore', offset: '+08:00' },
    { id: 'Asia/Tokyo', name: 'Tokyo', offset: '+09:00' },
    { id: 'Asia/Seoul', name: 'Seoul', offset: '+09:00' },
    { id: 'Australia/Sydney', name: 'Sydney', offset: '+10:00' },
    { id: 'Pacific/Auckland', name: 'Auckland', offset: '+12:00' },
    { id: 'UTC', name: 'UTC', offset: '+00:00' }
];