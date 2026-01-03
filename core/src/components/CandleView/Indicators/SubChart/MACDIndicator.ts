import { ICandleViewDataPoint } from "../../types";
import { IIndicator, IIndicatorInfo } from "./IIndicator";

export class MACDIndicator implements IIndicator {

    private calculateMACD(data: ICandleViewDataPoint[], fastPeriod: number, slowPeriod: number, signalPeriod: number): any[] {
        const calculateEMA = (data: number[], period: number) => {
            if (data.length < period) return [];
            const multiplier = 2 / (period + 1);
            const ema = [data[0]];
            for (let i = 1; i < data.length; i++) {
                ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
            }
            return ema;
        };
        const values = data.map(d => d.close);
        if (values.length < slowPeriod) return [];
        const emaFast = calculateEMA(values, fastPeriod);
        const emaSlow = calculateEMA(values, slowPeriod);
        const macdLine: number[] = [];
        const startIndex = Math.max(fastPeriod, slowPeriod) - 1;
        for (let i = startIndex; i < values.length; i++) {
            macdLine.push(emaFast[i] - emaSlow[i]);
        }
        if (macdLine.length < signalPeriod) return [];
        const signalLine = calculateEMA(macdLine, signalPeriod);
        const histogram: number[] = [];
        const finalStartIndex = signalPeriod - 1;
        for (let i = finalStartIndex; i < macdLine.length; i++) {
            histogram.push(macdLine[i] - signalLine[i - finalStartIndex]);
        }
        const result = [];
        const timeOffset = startIndex + finalStartIndex;
        for (let i = 0; i < histogram.length; i++) {
            if (data[timeOffset + i]) {
                const originalTime = data[timeOffset + i].time;
                const timeValue = typeof originalTime === 'string' ?
                    new Date(originalTime).getTime() / 1000 : originalTime;
                const isVirtual = data[timeOffset + i].isVirtual || false;
                result.push({
                    time: timeValue,
                    macd: macdLine[finalStartIndex + i],
                    signal: signalLine[i],
                    histogram: histogram[i],
                    isVirtual: isVirtual,
                    ...(isVirtual && { color: 'transparent' })
                });
            }
        }
        return result;
    }

    public calculate(iIIndicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        let fastPeriod = 12;
        let slowPeriod = 26;
        let signalPeriod = 9;
        iIIndicatorInfos.forEach(info => {
            if (info.paramName === 'DIF' && typeof info.paramValue === 'number') {
                fastPeriod = info.paramValue;
            } else if (info.paramName === 'DEA' && typeof info.paramValue === 'number') {
                slowPeriod = info.paramValue;
            } else if (info.paramName === 'MACD' && typeof info.paramValue === 'number') {
                signalPeriod = info.paramValue;
            }
        });
        const macdData = this.calculateMACD(ohlcData, fastPeriod, slowPeriod, signalPeriod);
        if (macdData.length === 0) {
            return iIIndicatorInfos.map(info => ({
                ...info,
                data: []
            }));
        }
        return iIIndicatorInfos.map(info => {
            const result = { ...info };
            const filteredData = macdData.filter(d => !d.isVirtual);
            if (info.paramName === 'DIF') {
                result.data = filteredData.map(d => ({
                    time: d.time,
                    value: d.macd || 0,
                }));
            }
            else if (info.paramName === 'DEA') {
                result.data = filteredData.map(d => ({
                    time: d.time,
                    value: d.signal || 0,
                }));
            }
            else if (info.paramName === 'MACD') {
                result.data = filteredData.map(d => ({
                    time: d.time,
                    value: d.histogram || 0,
                }));
            }
            return result;
        });
    }
}