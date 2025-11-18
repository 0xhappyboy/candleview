import { ICandleViewDataPoint } from "../../types";

export class DonchianChannelIndicator {
  static calculate(data: ICandleViewDataPoint[], period: number = 20, p0: any, p1: any): any[] {
    if (data.length < period) return [];

    const result = [];

    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1);
      const highs = periodData.map(d => d.high || d.volume);
      const lows = periodData.map(d => d.low || d.volume);
      const upper = Math.max(...highs);
      const lower = Math.min(...lows);
      const middle = (upper + lower) / 2;

      result.push({
        time: data[i].time,
        upper,
        lower,
        middle
      });
    }

    return result;
  }
}