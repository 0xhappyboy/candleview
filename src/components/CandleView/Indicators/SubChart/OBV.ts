import { ICandleViewDataPoint } from "../../types";
import { IIndicator, IIndicatorInfo } from "./IIndicator";

export class OBV implements IIndicator {

    private calculateOBV(data: ICandleViewDataPoint[]): any[] {
        if (data.length === 0) return [];
        const result: { time: number; value: number; color?: string }[] = [];
        let obv = 0;
        result.push({
            time: data[0].time,
            value: obv,
            ...(data[0].isVirtual && { color: 'transparent' })
        });
        for (let i = 1; i < data.length; i++) {
            const currentClose = data[i].close;
            const previousClose = data[i - 1].close;
            const currentVolume = data[i].volume;
            if (currentClose > previousClose) {
                obv += currentVolume;
            } else if (currentClose < previousClose) {
                obv -= currentVolume;
            }
            result.push({
                time: data[i].time,
                value: obv,
                ...(data[i].isVirtual && { color: 'transparent' })
            });
        }
        return result as any;
    }

    public calculate(iIIndicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        iIIndicatorInfos.forEach(info => {
            const obvData = this.calculateOBV(ohlcData);
            if (obvData.length > 0) {
                info.data = obvData;
            }
        });
        return iIIndicatorInfos;
    }
}