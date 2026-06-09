import { ICandleViewDataPoint } from "../../types";
import { IIndicator, IIndicatorInfo, IIndicatorData } from "./IIndicator";

export class ATRIndicator implements IIndicator {

    private calculateATR(data: ICandleViewDataPoint[], period: number): IIndicatorData[] {
        if (data.length < period + 1) return [];
        const result: IIndicatorData[] = [];
        const trueRanges: number[] = [];
        for (let i = 1; i < data.length; i++) {
            const current = data[i];
            const previous = data[i - 1];
            const high = current.high;
            const low = current.low;
            const previousClose = previous.close;
            const tr1 = high - low;
            const tr2 = Math.abs(high - previousClose);
            const tr3 = Math.abs(low - previousClose);
            const trueRange = Math.max(tr1, tr2, tr3);
            trueRanges.push(trueRange);
        }
        let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
        const firstTime = data[period].time;
        const isFirstVirtual = data[period].isVirtual || false;
        if (!isFirstVirtual) {
            result.push({
                time: firstTime,
                value: atr
            });
        }
        for (let i = period; i < trueRanges.length; i++) {
            atr = (atr * (period - 1) + trueRanges[i]) / period;
            const currentTime = data[i + 1].time;
            const isCurrentVirtual = data[i + 1].isVirtual || false;
            if (!isCurrentVirtual) {
                result.push({
                    time: currentTime,
                    value: atr
                });
            }
        }
        return result;
    }

    public calculate(iIIndicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        iIIndicatorInfos.forEach(info => {
            const atrData = this.calculateATR(ohlcData, info.paramValue);
            info.data = atrData; 
        });
        return iIIndicatorInfos;
    }
}