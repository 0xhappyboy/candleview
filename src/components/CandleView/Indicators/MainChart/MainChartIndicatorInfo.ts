import { MainChartIndicatorType } from "../../types";

export interface MainChartIndicatorInfo {
    id: string;
    type: MainChartIndicatorType | null;
    params: MainChartIndicatorParam[] | null;
    nonce: number | null;
}

export interface MainChartIndicatorParam {
    lineColor: string;
    lineWidth: number;
    paramName: string;
    paramValue: number;
}

export function getMainChartIndicatorInfoParamValue(mainChartIndicatorInfo: MainChartIndicatorInfo, paramName: string): number {
    if (!mainChartIndicatorInfo.params) return -1;
    for (const p of mainChartIndicatorInfo.params) {
        if (p.paramName === paramName) {
            return p.paramValue;
        }
    }
    return -1;
}

export const DEFAULT_MA: MainChartIndicatorInfo = {
    id: '1',
    type: MainChartIndicatorType.MA,
    params: [
        { paramName: 'MA', paramValue: 5, lineColor: '#FF6B6B', lineWidth: 1 },
        { paramName: 'MA', paramValue: 10, lineColor: '#6958ffff', lineWidth: 1 },
        { paramName: 'MA', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 },
        { paramName: 'MA', paramValue: 30, lineColor: '#3bf79fff', lineWidth: 1 },
        { paramName: 'MA', paramValue: 60, lineColor: '#f7c933ff', lineWidth: 1 }
    ],
    nonce: Date.now()
};

export const DEFAULT_EMA: MainChartIndicatorInfo = {
    id: '2',
    type: MainChartIndicatorType.EMA,
    params: [
        { paramName: 'EMA', paramValue: 12, lineColor: '#FF6B6B', lineWidth: 1 },
        { paramName: 'EMA', paramValue: 26, lineColor: '#6958ffff', lineWidth: 1 }
    ], nonce: Date.now()
};

export const DEFAULT_BOLLINGER: MainChartIndicatorInfo = {
    id: '3',
    type: MainChartIndicatorType.BOLLINGER,
    params: [
        { paramName: 'Upper', paramValue: 20, lineColor: '#FF6B6B', lineWidth: 1 },
        { paramName: 'Middle', paramValue: 20, lineColor: '#6958ffff', lineWidth: 1 },
        { paramName: 'Lower', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 }
    ], nonce: Date.now()
};

export const DEFAULT_ICHIMOKU: MainChartIndicatorInfo = {
    id: '4',
    type: MainChartIndicatorType.ICHIMOKU,
    params: [
        { paramName: 'Tenkan', paramValue: 9, lineColor: '#FF6B6B', lineWidth: 1 },
        { paramName: 'Kijun', paramValue: 26, lineColor: '#6958ffff', lineWidth: 1 },
        { paramName: 'SenkouA', paramValue: 26, lineColor: '#0ed3ffff', lineWidth: 1 },
        { paramName: 'SenkouB', paramValue: 52, lineColor: '#3bf79fff', lineWidth: 1 },
        { paramName: 'Chikou', paramValue: 26, lineColor: '#f7c933ff', lineWidth: 1 }
    ], nonce: Date.now()
};

export const DEFAULT_DONCHIAN: MainChartIndicatorInfo = {
    id: '5',
    type: MainChartIndicatorType.DONCHIAN,
    params: [
        { paramName: 'Upper', paramValue: 20, lineColor: '#FF6B6B', lineWidth: 1 },
        { paramName: 'Middle', paramValue: 20, lineColor: '#6958ffff', lineWidth: 1 },
        { paramName: 'Lower', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 }
    ], nonce: Date.now()
};

export const DEFAULT_ENVELOPE: MainChartIndicatorInfo = {
    id: '6',
    type: MainChartIndicatorType.ENVELOPE,
    params: [
        { paramName: 'Upper', paramValue: 20, lineColor: '#FF6B6B', lineWidth: 1 },
        { paramName: 'Middle', paramValue: 20, lineColor: '#6958ffff', lineWidth: 1 },
        { paramName: 'Lower', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 }
    ], nonce: Date.now()
};

export const DEFAULT_VWAP: MainChartIndicatorInfo = {
    id: '7',
    type: MainChartIndicatorType.VWAP,
    params: [
        { paramName: 'VWAP', paramValue: 0, lineColor: '#FF6B6B', lineWidth: 1 }
    ], nonce: Date.now()
};

export const DEFAULT_HEATMAP: MainChartIndicatorInfo = {
    id: '8',
    type: MainChartIndicatorType.HEATMAP,
    params: [
        { paramName: 'HEATMAP', paramValue: 0, lineColor: '#FF6B6B', lineWidth: 1 }
    ], nonce: Date.now()
};

export const DEFAULT_MARKETPROFILE: MainChartIndicatorInfo = {
    id: '9',
    type: MainChartIndicatorType.MARKETPROFILE,
    params: [
        { paramName: 'MARKETPROFILE', paramValue: 0, lineColor: '#FF6B6B', lineWidth: 1 }
    ], nonce: Date.now()
};

export function getDefaultMainChartIndicators(): MainChartIndicatorInfo[] {
    return [
        {
            id: '1',
            type: MainChartIndicatorType.MA,
            params: [
                { paramName: 'MA', paramValue: 5, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'MA', paramValue: 10, lineColor: '#6958ffff', lineWidth: 1 },
                { paramName: 'MA', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 },
                { paramName: 'MA', paramValue: 30, lineColor: '#3bf79fff', lineWidth: 1 },
                { paramName: 'MA', paramValue: 60, lineColor: '#f7c933ff', lineWidth: 1 }
            ], nonce: Date.now()
        },
        {
            id: '2',
            type: MainChartIndicatorType.EMA,
            params: [
                { paramName: 'EMA', paramValue: 12, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'EMA', paramValue: 26, lineColor: '#6958ffff', lineWidth: 1 }
            ], nonce: Date.now()
        },
        {
            id: '3',
            type: MainChartIndicatorType.BOLLINGER,
            params: [
                { paramName: 'Upper', paramValue: 20, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'Middle', paramValue: 20, lineColor: '#6958ffff', lineWidth: 1 },
                { paramName: 'Lower', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 }
            ], nonce: Date.now()
        },
        {
            id: '4',
            type: MainChartIndicatorType.ICHIMOKU,
            params: [
                { paramName: 'Tenkan', paramValue: 9, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'Kijun', paramValue: 26, lineColor: '#6958ffff', lineWidth: 1 },
                { paramName: 'SenkouA', paramValue: 26, lineColor: '#0ed3ffff', lineWidth: 1 },
                { paramName: 'SenkouB', paramValue: 52, lineColor: '#3bf79fff', lineWidth: 1 },
                { paramName: 'Chikou', paramValue: 26, lineColor: '#f7c933ff', lineWidth: 1 }
            ], nonce: Date.now()
        },
        {
            id: '5',
            type: MainChartIndicatorType.DONCHIAN,
            params: [
                { paramName: 'Upper', paramValue: 20, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'Middle', paramValue: 20, lineColor: '#6958ffff', lineWidth: 1 },
                { paramName: 'Lower', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 }
            ], nonce: Date.now()
        },
        {
            id: '6',
            type: MainChartIndicatorType.ENVELOPE,
            params: [
                { paramName: 'Upper', paramValue: 20, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'Middle', paramValue: 20, lineColor: '#6958ffff', lineWidth: 1 },
                { paramName: 'Lower', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 }
            ], nonce: Date.now()
        },
        {
            id: '7',
            type: MainChartIndicatorType.VWAP,
            params: [
                { paramName: 'VWAP', paramValue: 0, lineColor: '#FF6B6B', lineWidth: 1 }
            ], nonce: Date.now()
        }
    ];
};
