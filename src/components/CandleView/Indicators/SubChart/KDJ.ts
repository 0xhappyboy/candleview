import { ICandleViewDataPoint } from "../../types";
import { IIndicator, IIndicatorInfo } from "./IIndicator";

interface KDJDataPoint {
    time: any;
    value: number;
    color?: string;
}

export class KDJ implements IIndicator {

    private calculateKDJ(data: ICandleViewDataPoint[], kPeriod: number = 9, dPeriod: number = 3): { K: KDJDataPoint[], D: KDJDataPoint[], J: KDJDataPoint[] } {
        if (data.length < kPeriod) return { K: [], D: [], J: [] };
        const result = {
            K: [] as KDJDataPoint[],
            D: [] as KDJDataPoint[],
            J: [] as KDJDataPoint[]
        };
        const rsvValues: number[] = [];
        const kValues: number[] = [];
        const dValues: number[] = [];
        for (let i = kPeriod - 1; i < data.length; i++) {
            const periodData = data.slice(i - kPeriod + 1, i + 1);
            const high = Math.max(...periodData.map(d => d.high));
            const low = Math.min(...periodData.map(d => d.low));
            const close = data[i].close;
            const rsv = high === low ? 50 : ((close - low) / (high - low)) * 100;
            rsvValues.push(rsv);
            let kValue;
            if (kValues.length === 0) {
                kValue = 50 + (rsv - 50) * 2 / 3;
            } else {
                kValue = (kValues[kValues.length - 1] * (dPeriod - 1) + rsv) / dPeriod;
            }
            kValues.push(kValue);
            let dValue;
            if (dValues.length === 0) {
                dValue = 50 + (kValue - 50) * 2 / 3;
            } else {
                dValue = (dValues[dValues.length - 1] * (dPeriod - 1) + kValue) / dPeriod;
            }
            dValues.push(dValue);
            const jValue = 3 * kValue - 2 * dValue;
            const kdjPoint: KDJDataPoint = {
                time: data[i].time,
                value: kValue
            };
            if (data[i].isVirtual) {
                kdjPoint.color = 'transparent';
            }
            result.K.push(kdjPoint);
            result.D.push({
                time: data[i].time,
                value: dValue,
                ...(data[i].isVirtual && { color: 'transparent' })
            });
            result.J.push({
                time: data[i].time,
                value: jValue,
                ...(data[i].isVirtual && { color: 'transparent' })
            });
        }
        return result;
    }

    public calculate(iIIndicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        const kParam = iIIndicatorInfos.find(info => info.paramName === 'K');
        const dParam = iIIndicatorInfos.find(info => info.paramName === 'D');
        const kPeriod = kParam?.paramValue || 9;
        const dPeriod = dParam?.paramValue || 3;
        const kdjData = this.calculateKDJ(ohlcData, kPeriod, dPeriod);
        iIIndicatorInfos.forEach(info => {
            const lineData = kdjData[info.paramName as keyof typeof kdjData];
            if (lineData && lineData.length > 0) {
                info.data = lineData.map(point => ({
                    time: point.time,
                    value: point.value
                }));
            }
        });
        return iIIndicatorInfos;
    }
}