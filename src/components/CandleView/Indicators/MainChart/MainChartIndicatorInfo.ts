import { MainChartIndicatorType } from "../../types";

export interface MainChartIndicatorInfo {
    id: string;
    type: MainChartIndicatorType | null;
    params: MainChartIndicatorParam[] | null;
}

export interface MainChartIndicatorParam {
    lineColor: string;
    lineWidth: number;
    paramName: string;
    paramValue: number;
}

export function getMainChartIndicatorInfoParamValue(mainChartIndicatorInfo: MainChartIndicatorInfo, paramName: string): number {
    mainChartIndicatorInfo.params?.forEach(p => {
        if (p.paramName === paramName) {
            return p.paramValue;
        } else {
            return -1;
        }
    })
    return -1;
}

export function getDefaultMainChartIndicators(): MainChartIndicatorInfo[] {
    return [
        {
            id: '1',
            type: MainChartIndicatorType.MA,
            params: [
                { paramName: 'MA(5)', paramValue: 5, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'MA(10)', paramValue: 10, lineColor: '#6958ffff', lineWidth: 1 },
                { paramName: 'MA(20)', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 },
                { paramName: 'MA(30)', paramValue: 30, lineColor: '#3bf79fff', lineWidth: 1 },
                { paramName: 'MA(60)', paramValue: 60, lineColor: '#f7c933ff', lineWidth: 1 }
            ]
        },
        {
            id: '2',
            type: MainChartIndicatorType.EMA,
            params: [
                { paramName: 'EMA(12)', paramValue: 12, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'EMA(26)', paramValue: 26, lineColor: '#6958ffff', lineWidth: 1 }
            ]
        },
        {
            id: '3',
            type: MainChartIndicatorType.BOLLINGER,
            params: [
                { paramName: 'Upper(20,2)', paramValue: 20, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'Middle(20,2)', paramValue: 20, lineColor: '#6958ffff', lineWidth: 1 },
                { paramName: 'Lower(20,2)', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 }
            ]
        },
        {
            id: '4',
            type: MainChartIndicatorType.ICHIMOKU,
            params: [
                { paramName: 'Tenkan(9)', paramValue: 9, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'Kijun(26)', paramValue: 26, lineColor: '#6958ffff', lineWidth: 1 },
                { paramName: 'SenkouA(26,52)', paramValue: 26, lineColor: '#0ed3ffff', lineWidth: 1 },
                { paramName: 'SenkouB(52)', paramValue: 52, lineColor: '#3bf79fff', lineWidth: 1 },
                { paramName: 'Chikou(26)', paramValue: 26, lineColor: '#f7c933ff', lineWidth: 1 }
            ]
        },
        {
            id: '5',
            type: MainChartIndicatorType.DONCHIAN,
            params: [
                { paramName: 'Upper(20)', paramValue: 20, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'Middle(20)', paramValue: 20, lineColor: '#6958ffff', lineWidth: 1 },
                { paramName: 'Lower(20)', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 }
            ]
        },
        {
            id: '6',
            type: MainChartIndicatorType.ENVELOPE,
            params: [
                { paramName: 'Upper(20,2.5%)', paramValue: 20, lineColor: '#FF6B6B', lineWidth: 1 },
                { paramName: 'Middle(20)', paramValue: 20, lineColor: '#6958ffff', lineWidth: 1 },
                { paramName: 'Lower(20,2.5%)', paramValue: 20, lineColor: '#0ed3ffff', lineWidth: 1 }
            ]
        },
        {
            id: '7',
            type: MainChartIndicatorType.VWAP,
            params: [
                { paramName: 'VWAP', paramValue: 0, lineColor: '#FF6B6B', lineWidth: 1 }
            ]
        }
    ];
};
