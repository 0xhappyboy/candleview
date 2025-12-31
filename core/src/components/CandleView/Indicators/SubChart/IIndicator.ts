import { ICandleViewDataPoint } from "../../types";

export interface IIndicatorInfo {
    paramName: string;
    paramValue: number;
    lineColor: string;
    lineWidth: number;
    data: IIndicatorData[]
}

export interface IIndicatorData {
    time: any;
    value: number;
}

export interface IIndicator {
    calculate(iIIndicatorInfo: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[];
}