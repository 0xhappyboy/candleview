import { ICandleViewDataPoint } from "../../types";
import { IIndicator, IIndicatorInfo } from "./IIndicator";

export class RSI implements IIndicator {

    private calculateRSI(data: ICandleViewDataPoint[], period: number): any[] {
        if (data.length < period + 1) return [];
        const rsiData: { time: any; value: number; }[] = [];
        const gains: number[] = [];
        const losses: number[] = [];
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
        const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const firstRSI = 100 - (100 / (1 + firstRS));
        rsiData.push({
            time: data[period].time,
            value: firstRSI,
            ...(data[period].isVirtual && { color: 'transparent' })
        });
        for (let i = period; i < gains.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            rsiData.push({
                time: data[i + 1].time,
                value: rsi,
                ...(data[i + 1].isVirtual && { color: 'transparent' })
            });
        }
        return rsiData;
    }

    public calculate(iIIndicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        iIIndicatorInfos.forEach(info => {
            const rsiData = this.calculateRSI(ohlcData, info.paramValue);
            if (rsiData.length > 0) {
                info.data = rsiData;
            }
        });
        return iIIndicatorInfos;
    }

}