import { MainChartIndicatorType } from "../types";

export const mainIndicators = [
    { id: 'ma', name: 'Moving Average (MA)', icon: '📊', type: MainChartIndicatorType.MA },
    { id: 'ema', name: 'Exponential Moving Average (EMA)', icon: '📈', type: MainChartIndicatorType.EMA },
    { id: 'bollinger', name: 'Bollinger Bands', icon: '📉', type: MainChartIndicatorType.BOLLINGER },
    { id: 'ichimoku', name: 'Ichimoku Cloud', icon: '☁️', type: MainChartIndicatorType.ICHIMOKU },
    { id: 'donchian', name: 'Donchian Channel', icon: '📐', type: MainChartIndicatorType.DONCHIAN },
    { id: 'envelope', name: 'Envelope', icon: '📨', type: MainChartIndicatorType.ENVELOPE },
    { id: 'vwap', name: 'Volume Weighted Average Price (VWAP)', icon: '⚖️', type: MainChartIndicatorType.VWAP },
];

export const subChartIndicators = [
    { id: 'rsi', name: 'Relative Strength Index (RSI)', icon: '⚡' },
    { id: 'macd', name: 'MACD', icon: '🔍' },
    { id: 'volume', name: 'Volume', icon: '📦' },
    { id: 'sar', name: 'Parabolic SAR (SAR)', icon: '🔄' },
    { id: 'kdj', name: 'KDJ', icon: '🎯' },
    { id: 'atr', name: 'Average True Range (ATR)', icon: '📏' },
    { id: 'stochastic', name: 'Stochastic Oscillator', icon: '🔄' },
    { id: 'cci', name: 'Commodity Channel Index (CCI)', icon: '📊' },
    { id: 'bbwidth', name: 'Bollinger Bands Width', icon: '📈' },
    { id: 'adx', name: 'Average Directional Index (ADX)', icon: '🎯' },
    { id: 'obv', name: 'On Balance Volume (OBV)', icon: '💧' },
];