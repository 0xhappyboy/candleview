import { ChartData } from "./MainChartIndicatorManager";

export class EMAIndicator {
  static calculate(data: ChartData[], period: number = 20): any[] {
    if (data.length === 0) return [];

    const result = [];
    const multiplier = 2 / (period + 1);
    let ema = data[0].close || data[0].value;

    result.push({
      time: data[0].time,
      value: ema
    });

    for (let i = 1; i < data.length; i++) {
      const value = data[i].close || data[i].value;
      ema = (value - ema) * multiplier + ema;
      result.push({
        time: data[i].time,
        value: ema
      });
    }
    return result;
  }
}