import { ChartData } from "./MainChartIndicatorManager";

export class IchimokuIndicator {
  static calculate(data: ChartData[]): any[] {
    if (data.length < 52) return [];

    const result = [];

    for (let i = 25; i < data.length; i++) {
      const tenkanHigh = Math.max(...data.slice(i - 8, i + 1).map(d => d.high || d.value));
      const tenkanLow = Math.min(...data.slice(i - 8, i + 1).map(d => d.low || d.value));
      const tenkanSen = (tenkanHigh + tenkanLow) / 2;

      const kijunHigh = Math.max(...data.slice(i - 25, i + 1).map(d => d.high || d.value));
      const kijunLow = Math.min(...data.slice(i - 25, i + 1).map(d => d.low || d.value));
      const kijunSen = (kijunHigh + kijunLow) / 2;

      const senkouSpanA = (tenkanSen + kijunSen) / 2;

      let senkouSpanB = 0;
      if (i >= 51) {
        const spanBHigh = Math.max(...data.slice(i - 51, i + 1).map(d => d.high || d.value));
        const spanBLow = Math.min(...data.slice(i - 51, i + 1).map(d => d.low || d.value));
        senkouSpanB = (spanBHigh + spanBLow) / 2;
      }

      const chikouSpan = data[Math.max(i - 25, 0)].close || data[Math.max(i - 25, 0)].value;

      result.push({
        time: data[i].time,
        tenkanSen,
        kijunSen,
        senkouSpanA,
        senkouSpanB,
        chikouSpan
      });
    }

    return result;
  }
}