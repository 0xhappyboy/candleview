import { MainChartIndicatorType, SubChartIndicatorType } from "../types";

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