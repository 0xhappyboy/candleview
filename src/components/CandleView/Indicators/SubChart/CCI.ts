import { ICandleViewDataPoint } from "../../types";
import { IIndicator, IIndicatorInfo } from "./IIndicator";

export class CCI implements IIndicator {

    private calculateCCI(data: ICandleViewDataPoint[], period: number): any[] {
        if (data.length < period) return [];
        const result: { time: any; value: number; color?: string }[] = [];
        for (let i = period - 1; i < data.length; i++) {
            const periodData = data.slice(i - period + 1, i + 1);
            const typicalPrices = periodData.map(d => (d.high + d.low + d.close) / 3);
            const sma = typicalPrices.reduce((sum, price) => sum + price, 0) / period;
            const meanDeviation = typicalPrices.reduce((sum, price) =>
                sum + Math.abs(price - sma), 0) / period;
            const cci = meanDeviation !== 0 ? (typicalPrices[typicalPrices.length - 1] - sma) / (0.015 * meanDeviation) : 0;
            result.push({
                time: data[i].time,
                value: cci,
                ...(data[i].isVirtual && { color: 'transparent' })
            });
        }
        return result;
    }

    public calculate(iIIndicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        iIIndicatorInfos.forEach(info => {
            const cciData = this.calculateCCI(ohlcData, info.paramValue);
            if (cciData.length > 0) {
                info.data = cciData;
            }
        });
        return iIIndicatorInfos;
    }
}