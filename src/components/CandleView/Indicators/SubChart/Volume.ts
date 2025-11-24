import { ICandleViewDataPoint } from "../../types";
import { IIndicator, IIndicatorInfo } from "./IIndicator";

export interface VolumeData {
    time: any;
    value: number;
    color: string;
}

export class Volume implements IIndicator {
    private calculateVolume(data: ICandleViewDataPoint[], type: number, upColor: string, downColor: string): VolumeData[] {
        return data.map((item, index) => {
            let volumeValue: number;
            switch (type) {
                case 1:
                    const period = 20;
                    const startIndex = Math.max(0, index - period + 1);
                    const periodData = data.slice(startIndex, index + 1);
                    volumeValue = periodData.reduce((sum, dataItem) => sum + dataItem.volume, 0) / periodData.length;
                    break;
                case 2:
                    volumeValue = item.volume * (0.8 + Math.random() * 0.4);
                    break;
                default:
                    volumeValue = item.volume;
                    break;
            }
            const color = index > 0 && item.close > data[index - 1].close
                ? upColor
                : downColor;
            return {
                time: item.time,
                value: volumeValue,
                color: item.isVirtual ? 'transparent' : color
            };
        });
    }

    public calculate(iIIndicatorInfos: IIndicatorInfo[], ohlcData: ICandleViewDataPoint[]): IIndicatorInfo[] {
        iIIndicatorInfos.forEach(info => {
            const upColor = (info as any).upColor || '#00C087';
            const downColor = (info as any).downColor || '#FF5B5A';
            const volumeData = this.calculateVolume(ohlcData, info.paramValue, upColor, downColor);
            if (volumeData.length > 0) {
                info.data = volumeData.map(item => ({
                    time: item.time,
                    value: item.value
                }));
            }
        });
        return iIIndicatorInfos;
    }
}