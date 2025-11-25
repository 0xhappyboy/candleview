import { ICandleViewDataPoint } from "../../types";
import { IIndicator, IIndicatorInfo } from "./IIndicator";

export class BBWidthIndicator implements IIndicator {
    
    private calculateBBWidth(data: ICandleViewDataPoint[], period: number, multiplier: number): any[] {
        if (data.length < period) return [];
        const result: { time: any; value: number; color?: string }[] = [];
        for (let i = period - 1; i < data.length; i++) {
            const periodData = data.slice(i - period + 1, i + 1);
            const values = periodData.map(d => d.close);
            const sma = values.reduce((sum, value) => sum + value, 0) / period;
            const variance = values.reduce((sum, value) => 
                sum + Math.pow(value - sma, 2), 0) / period;
            const stdDev = Math.sqrt(variance);
            const bbWidth = (2 * multiplier * stdDev) / sma * 100;
            result.push({
                time: data[i].time,
                value: bbWidth,
                ...(data[i].isVirtual && { color: 'transparent' })
            });
        }
        return result;
    }

    public calculate(iIIndicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        iIIndicatorInfos.forEach(info => {
            const match = info.paramName.match(/BBW\((\d+),([\d.]+)\)/);
            if (match) {
                const period = parseInt(match[1]);
                const multiplier = parseFloat(match[2]);
                const bbWidthData = this.calculateBBWidth(ohlcData, period, multiplier);
                
                if (bbWidthData.length > 0) {
                    info.data = bbWidthData;
                }
            }
        });
        return iIIndicatorInfos;
    }
}