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
        result.push({
            time: data[period].time,
            value: atr
        });
        for (let i = period; i < trueRanges.length; i++) {
            atr = (atr * (period - 1) + trueRanges[i]) / period;
            result.push({
                time: data[i + 1].time,
                value: atr
            });
        }
        return result;
    }

    public calculate(iIIndicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        iIIndicatorInfos.forEach(info => {
            const atrData = this.calculateATR(ohlcData, info.paramValue);
            if (atrData.length > 0) {
                info.data = atrData;
            }
        });
        return iIIndicatorInfos;
    }
}