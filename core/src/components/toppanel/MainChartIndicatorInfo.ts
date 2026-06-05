import { MainChartIndicatorType } from '../../types';

export interface MainChartIndicatorInfo {
    type: MainChartIndicatorType;
    parameters?: Record<string, number>;
    visible?: boolean;
    nonce?: number;
    [key: string]: any;
}

export const DEFAULT_MA: MainChartIndicatorInfo = {
    type: MainChartIndicatorType.MA,
    parameters: { period1: 5, period2: 10, period3: 20, period4: 60 },
    visible: true
};

export const DEFAULT_EMA: MainChartIndicatorInfo = {
    type: MainChartIndicatorType.EMA,
    parameters: { period1: 5, period2: 10, period3: 20, period4: 60 },
    visible: true
};

export const DEFAULT_BOLLINGER: MainChartIndicatorInfo = {
    type: MainChartIndicatorType.BOLLINGER,
    parameters: { period: 20, stdDev: 2 },
    visible: true
};

export const DEFAULT_ICHIMOKU: MainChartIndicatorInfo = {
    type: MainChartIndicatorType.ICHIMOKU,
    parameters: { shortPeriod: 9, mediumPeriod: 26, longPeriod: 52 },
    visible: true
};

export const DEFAULT_DONCHIAN: MainChartIndicatorInfo = {
    type: MainChartIndicatorType.DONCHIAN,
    parameters: { period: 20 },
    visible: true
};

export const DEFAULT_ENVELOPE: MainChartIndicatorInfo = {
    type: MainChartIndicatorType.ENVELOPE,
    parameters: { period: 20, percent: 10 },
    visible: true
};

export const DEFAULT_VWAP: MainChartIndicatorInfo = {
    type: MainChartIndicatorType.VWAP,
    parameters: {},
    visible: true
};

export const DEFAULT_HEATMAP: MainChartIndicatorInfo = {
    type: MainChartIndicatorType.HEATMAP,
    parameters: {},
    visible: true
};

export const DEFAULT_MARKETPROFILE: MainChartIndicatorInfo = {
    type: MainChartIndicatorType.MARKETPROFILE,
    parameters: {},
    visible: true
};