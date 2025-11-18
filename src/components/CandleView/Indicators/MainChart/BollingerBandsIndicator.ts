import { ICandleViewDataPoint } from "../../types";

export class BollingerBandsIndicator {
  static calculate(data: ICandleViewDataPoint[], period: number = 20, multiplier: number = 2): any[] {
    if (data.length < period) return [];

    const result = [];

    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      const values = [];

      for (let j = 0; j < period; j++) {
        const value = data[i - j].close || data[i - j].volume;
        sum += value;
        values.push(value);
      }

      const middle = sum / period;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - middle, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      result.push({
        time: data[i].time,
        middle: middle,
        upper: middle + (stdDev * multiplier),
        lower: middle - (stdDev * multiplier)
      });
    }

    return result;
  }
}