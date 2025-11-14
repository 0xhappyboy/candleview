import { ChartData } from "./MainChartIndicatorManager";

export class MAIndicator {
  static calculate(data: ChartData[], period: number = 20): any[] {
    if (data.length < period) return [];

    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close || data[i - j].value;
      }
      result.push({
        time: data[i].time,
        value: sum / period
      });
    }
    return result;
  }
}