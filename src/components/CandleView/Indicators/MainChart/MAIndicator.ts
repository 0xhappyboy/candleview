import { ICandleViewDataPoint } from "../../types";

export interface MAConfig {
  periods: number[];
  colors?: string[];
}

export class MAIndicator {
  static calculate(data: ICandleViewDataPoint[], periods: number | number[] = [5, 10, 20]): any[] {
    const periodArray = Array.isArray(periods) ? periods : [periods];
    if (data.length === 0 || periodArray.length === 0) return [];
    const maxPeriod = Math.max(...periodArray);
    if (data.length < maxPeriod) return [];
    const result: any[] = [];
    for (let i = maxPeriod - 1; i < data.length; i++) {
      const resultItem: any = { time: data[i].time };
      periodArray.forEach((period, index) => {
        if (i >= period - 1) {
          let sum = 0;
          for (let j = 0; j < period; j++) {
            sum += data[i - j].close || data[i - j].volume;
          }
          resultItem[`ma${period}`] = sum / period;
        }
      });
      result.push(resultItem);
    }
    return result;
  }
}