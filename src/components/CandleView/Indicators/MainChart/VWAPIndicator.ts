import { ChartData } from "./MainChartIndicatorManager";

export class VWAPIndicator {
  static calculate(data: ChartData[]): any[] {
    if (data.length === 0) return [];

    const result = [];
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;

    for (let i = 0; i < data.length; i++) {
      const typicalPrice = ((data[i].high || data[i].value) + (data[i].low || data[i].value) + (data[i].close || data[i].value)) / 3;
      const volume = data[i].value || 1000;

      cumulativeTPV += typicalPrice * volume;
      cumulativeVolume += volume;

      const vwap = cumulativeTPV / cumulativeVolume;

      result.push({
        time: data[i].time,
        value: vwap
      });
    }

    return result;
  }
}