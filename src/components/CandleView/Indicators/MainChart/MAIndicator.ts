import { ICandleViewDataPoint } from "../../types";

export interface MAConfig {
  periods: number[];
  colors?: string[];
}

export class MAIndicator {
  static calculate(data: ICandleViewDataPoint[], periods: number | number[] = [5, 10, 20]): any[] {
    const periodArray = Array.isArray(periods) ? periods : [periods];
    if (data.length === 0 || periodArray.length === 0) return [];
    const result: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const resultItem: any = { time: data[i].time };
      periodArray.forEach((period, index) => {
        if (i >= period - 1) {
          let sum = 0;
          for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
          }
          resultItem[`ma${period}`] = sum / period;
        } else {
          const availableDataCount = i + 1;
          let sum = 0;
          for (let j = 0; j < availableDataCount; j++) {
            sum += data[j].close;
          }
          const missingDataCount = period - availableDataCount;
          if (missingDataCount > 0) {
            const lastClose = data[availableDataCount - 1].close;
            sum += lastClose * missingDataCount;
          }
          resultItem[`ma${period}`] = sum / period;
        }
      });
      result.push(resultItem);
    }
    return result;
  }
}