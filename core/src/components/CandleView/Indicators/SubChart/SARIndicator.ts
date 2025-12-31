import { ICandleViewDataPoint } from "../../types";
import { IIndicator, IIndicatorInfo } from "./IIndicator";

export class SARIndicator implements IIndicator {
    private calculateSAR(data: ICandleViewDataPoint[], accelerationFactor: number, maxAccelerationFactor: number): { time: any; value: number; color?: string }[] {
        if (data.length < 2) return [];
        const sarData: { time: any; value: number; color?: string }[] = [];
        let sar = data[0].low;
        let trend = 1;
        let af = accelerationFactor;
        let ep = data[0].high;
        for (let i = 1; i < data.length; i++) {
            const { high, low, time, isVirtual } = data[i];
            if (trend === 1) {
                sar = sar + af * (ep - sar);
                if (low < sar) {
                    trend = -1;
                    sar = ep;
                    af = accelerationFactor;
                    ep = low;
                } else {
                    if (high > ep) {
                        ep = high;
                        af = Math.min(af + accelerationFactor, maxAccelerationFactor);
                    }
                }
            } else {
                sar = sar + af * (ep - sar);
                if (high > sar) {
                    trend = 1;
                    sar = ep;
                    af = accelerationFactor;
                    ep = high;
                } else {
                    if (low < ep) {
                        ep = low;
                        af = Math.min(af + accelerationFactor, maxAccelerationFactor);
                    }
                }
            }
            sarData.push({
                time: time as any,
                value: sar,
                ...(isVirtual && { color: 'transparent' })
            });
        }
        return sarData;
    }

    public calculate(iIIndicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        iIIndicatorInfos.forEach(info => {
            let accelerationFactor = 0.02; 
            if (typeof info.paramValue === 'number') {
                accelerationFactor = info.paramValue;
            } else if (typeof info.paramValue === 'string') {
                accelerationFactor = parseFloat(info.paramValue) || 0.02;
            }
            const maxAccelerationFactor = accelerationFactor * 10;
            const sarData = this.calculateSAR(ohlcData, accelerationFactor, maxAccelerationFactor);
            if (sarData.length > 0) {
                info.data = sarData.map(d => ({
                    time: d.time,
                    value: d.value,
                    ...(d.color && { color: d.color })
                }));
            }
        });
        return iIIndicatorInfos;
    }
}