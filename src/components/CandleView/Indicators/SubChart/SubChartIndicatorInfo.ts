import { MainChartIndicatorType, SubChartIndicatorType } from "../../types";

export interface SubChartIndicatorInfo {
    id: string;
    type: SubChartIndicatorType | null;
    params: SubChartIndicatorParam[] | null;
}

export interface SubChartIndicatorParam {
    lineColor: string;
    lineWidth: number;
    paramName: string;
    paramValue: number;
}