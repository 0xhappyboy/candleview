import { ICandleViewDataPoint } from "../../types";
import { IIndicator, IIndicatorInfo } from "./IIndicator";

export class ADX implements IIndicator {

    private calculateADX(data: ICandleViewDataPoint[], period: number): { ADX: any[]; PlusDI: any[]; MinusDI: any[] } {
        if (data.length < period + 1) {
            return { ADX: [], PlusDI: [], MinusDI: [] };
        }
        const result = {
            ADX: [] as Array<{ time: any; value: number; color?: string }>,
            PlusDI: [] as Array<{ time: any; value: number; color?: string }>,
            MinusDI: [] as Array<{ time: any; value: number; color?: string }>
        };
        const times = data.map(item => item.time);
        const trValues: number[] = [0];
        const plusDM: number[] = [0];
        const minusDM: number[] = [0];
        for (let i = 1; i < data.length; i++) {
            const high = data[i].high;
            const low = data[i].low;
            const prevHigh = data[i - 1].high;
            const prevLow = data[i - 1].low;
            const prevClose = data[i - 1].close;
            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            trValues.push(tr);
            const upMove = high - prevHigh;
            const downMove = prevLow - low;
            if (upMove > downMove && upMove > 0) {
                plusDM.push(upMove);
                minusDM.push(0);
            } else if (downMove > upMove && downMove > 0) {
                plusDM.push(0);
                minusDM.push(downMove);
            } else {
                plusDM.push(0);
                minusDM.push(0);
            }
        }
        const smoothTR: number[] = [];
        const smoothPlusDM: number[] = [];
        const smoothMinusDM: number[] = [];
        let sumTR = trValues.slice(0, period).reduce((sum, tr) => sum + tr, 0);
        let sumPlusDM = plusDM.slice(0, period).reduce((sum, dm) => sum + dm, 0);
        let sumMinusDM = minusDM.slice(0, period).reduce((sum, dm) => sum + dm, 0);
        smoothTR.push(sumTR);
        smoothPlusDM.push(sumPlusDM);
        smoothMinusDM.push(sumMinusDM);
        for (let i = period; i < trValues.length; i++) {
            sumTR = sumTR - (sumTR / period) + trValues[i];
            sumPlusDM = sumPlusDM - (sumPlusDM / period) + plusDM[i];
            sumMinusDM = sumMinusDM - (sumMinusDM / period) + minusDM[i];
            smoothTR.push(sumTR);
            smoothPlusDM.push(sumPlusDM);
            smoothMinusDM.push(sumMinusDM);
        }
        const plusDIValues: number[] = [];
        const minusDIValues: number[] = [];
        const dxValues: number[] = [];
        for (let i = 0; i < smoothTR.length; i++) {
            if (smoothTR[i] === 0) {
                plusDIValues.push(0);
                minusDIValues.push(0);
                dxValues.push(0);
                continue;
            }
            const plusDI = (smoothPlusDM[i] / smoothTR[i]) * 100;
            const minusDI = (smoothMinusDM[i] / smoothTR[i]) * 100;
            plusDIValues.push(plusDI);
            minusDIValues.push(minusDI);
            const diSum = plusDI + minusDI;
            const dx = diSum > 0 ? (Math.abs(plusDI - minusDI) / diSum) * 100 : 0;
            dxValues.push(dx);
        }
        const adxValues: number[] = [];
        if (dxValues.length >= period) {
            let adx = dxValues.slice(0, period).reduce((sum, dx) => sum + dx, 0) / period;
            adxValues.push(adx);
            for (let i = period; i < dxValues.length; i++) {
                adx = ((adx * (period - 1)) + dxValues[i]) / period;
                adxValues.push(adx);
            }
        }
        const startIndex = period;
        for (let i = 0; i < adxValues.length; i++) {
            const dataIndex = startIndex + i;
            if (dataIndex < data.length) {
                result.ADX.push({
                    time: times[dataIndex],
                    value: Math.min(100, Math.max(0, adxValues[i])),
                    ...(data[dataIndex].isVirtual && { color: 'transparent' })
                });
                if (i < plusDIValues.length) {
                    result.PlusDI.push({
                        time: times[dataIndex],
                        value: Math.min(100, Math.max(0, plusDIValues[i])),
                        ...(data[dataIndex].isVirtual && { color: 'transparent' })
                    });
                }
                if (i < minusDIValues.length) {
                    result.MinusDI.push({
                        time: times[dataIndex],
                        value: Math.min(100, Math.max(0, minusDIValues[i])),
                        ...(data[dataIndex].isVirtual && { color: 'transparent' })
                    });
                }
            }
        }
        return result;
    }

    public calculate(iIIndicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        iIIndicatorInfos.forEach(info => {
            const adxData = this.calculateADX(ohlcData, info.paramValue);
            let seriesData: any[] = [];
            switch (info.paramName) {
                case 'ADX':
                    seriesData = adxData.ADX;
                    break;
                case '+DI':
                    seriesData = adxData.PlusDI;
                    break;
                case '-DI':
                    seriesData = adxData.MinusDI;
                    break;
            }
            if (seriesData.length > 0) {
                info.data = seriesData;
            }
        });
        return iIIndicatorInfos;
    }
}