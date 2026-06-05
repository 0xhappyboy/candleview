import { ICandleViewDataPoint } from "../../types";
import { IIndicator, IIndicatorInfo, IIndicatorData } from "./IIndicator";

export interface StochasticDataPoint extends IIndicatorData {
    color?: string;
}

export interface StochasticIndicatorParam {
    paramName: string;
    kPeriod: number;
    dPeriod: number;
    smooth: number;
    kLineColor: string;
    dLineColor: string;
    lineWidth: number;
}

export interface StochasticResult {
    k: StochasticDataPoint[];
    d: StochasticDataPoint[];
}

export class StochasticIndicator implements IIndicator {

    private calculateStochastic(
        data: ICandleViewDataPoint[],
        kPeriod: number,
        dPeriod: number,
        smooth: number
    ): StochasticResult {
        if (data.length < kPeriod + smooth - 1) return { k: [], d: [] };
        const kValues: StochasticDataPoint[] = [];
        for (let i = kPeriod - 1; i < data.length; i++) {
            const periodData = data.slice(i - kPeriod + 1, i + 1);
            const highs = periodData.map(d => d.high);
            const lows = periodData.map(d => d.low);
            const high = Math.max(...highs);
            const low = Math.min(...lows);
            const close = data[i].close;
            if (high === low) {
                kValues.push({
                    time: data[i].time,
                    value: 50,
                    ...(data[i].isVirtual && { color: 'transparent' })
                });
            } else {
                const k = ((close - low) / (high - low)) * 100;
                kValues.push({
                    time: data[i].time,
                    value: k,
                    ...(data[i].isVirtual && { color: 'transparent' })
                });
            }
        }
        const smoothedKValues: StochasticDataPoint[] = [];
        for (let i = smooth - 1; i < kValues.length; i++) {
            const smoothData = kValues.slice(i - smooth + 1, i + 1);
            const smoothedValue = smoothData.reduce((sum, item) => sum + item.value, 0) / smooth;
            smoothedKValues.push({
                time: kValues[i].time,
                value: smoothedValue,
                ...(kValues[i].color && { color: kValues[i].color })
            });
        }
        const dValues: StochasticDataPoint[] = [];
        for (let i = dPeriod - 1; i < smoothedKValues.length; i++) {
            const dPeriodData = smoothedKValues.slice(i - dPeriod + 1, i + 1);
            const dValue = dPeriodData.reduce((sum, item) => sum + item.value, 0) / dPeriod;
            dValues.push({
                time: smoothedKValues[i].time,
                value: dValue,
                ...(smoothedKValues[i].color && { color: smoothedKValues[i].color })
            });
        }
        const finalKValues = smoothedKValues.slice(dPeriod - 1);
        const finalDValues = dValues;
        return { k: finalKValues, d: finalDValues };
    }

    public calculate(indicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        const kInfo = indicatorInfos.find(info => info.paramName === 'K');
        const dInfo = indicatorInfos.find(info => info.paramName === 'D');
        if (!kInfo || !dInfo) {
            return indicatorInfos;
        }
        const kPeriod = kInfo.paramValue || 14;
        const dPeriod = dInfo.paramValue || 3;
        const smooth = 1; 
        const stochasticData = this.calculateStochastic(
            ohlcData,
            kPeriod,
            dPeriod,
            smooth
        );
        indicatorInfos.forEach(info => {
            if (info.paramName === 'K' && stochasticData.k.length > 0) {
                info.data = stochasticData.k;
            } else if (info.paramName === 'D' && stochasticData.d.length > 0) {
                info.data = stochasticData.d;
            }
        });
        return indicatorInfos;
    }

    public calculateMultiple(
        params: StochasticIndicatorParam[],
        ohlcData: ICandleViewDataPoint[]
    ): { [key: string]: StochasticResult } {
        const result: { [key: string]: StochasticResult } = {};
        params.forEach(param => {
            const stochasticData = this.calculateStochastic(
                ohlcData,
                param.kPeriod,
                param.dPeriod,
                param.smooth
            );

            if (stochasticData.k.length > 0 && stochasticData.d.length > 0) {
                result[param.paramName] = stochasticData;
            }
        });
        return result;
    }
}