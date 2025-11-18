import { ICandleViewDataPoint } from "../../types";

export class EnvelopeIndicator {
  static calculate(data: ICandleViewDataPoint[], period: number = 20, percentage: number = 2.5): any[] {
    if (data.length < period) return [];

    const result = [];

    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1);
      const values = periodData.map(d => d.close || d.volume);
      const sma = values.reduce((sum, value) => sum + value, 0) / period;

      const upper = sma * (1 + percentage / 100);
      const lower = sma * (1 - percentage / 100);

      result.push({
        time: data[i].time,
        sma,
        upper,
        lower
      });
    }

    return result;
  }
}