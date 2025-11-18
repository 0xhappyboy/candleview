import { ICandleViewDataPoint } from "../../types";

export class IchimokuIndicator {
  static calculate(data: ICandleViewDataPoint[]): any[] {
    if (data.length < 52) return [];

    const result = [];

    for (let i = 25; i < data.length; i++) {
      const tenkanHigh = Math.max(...data.slice(i - 8, i + 1).map(d => d.high || d.volume));
      const tenkanLow = Math.min(...data.slice(i - 8, i + 1).map(d => d.low || d.volume));
      const tenkanSen = (tenkanHigh + tenkanLow) / 2;

      const kijunHigh = Math.max(...data.slice(i - 25, i + 1).map(d => d.high || d.volume));
      const kijunLow = Math.min(...data.slice(i - 25, i + 1).map(d => d.low || d.volume));
      const kijunSen = (kijunHigh + kijunLow) / 2;

      const senkouSpanA = (tenkanSen + kijunSen) / 2;

      let senkouSpanB = 0;
      if (i >= 51) {
        const spanBHigh = Math.max(...data.slice(i - 51, i + 1).map(d => d.high || d.volume));
        const spanBLow = Math.min(...data.slice(i - 51, i + 1).map(d => d.low || d.volume));
        senkouSpanB = (spanBHigh + spanBLow) / 2;
      }

      const chikouSpan = data[Math.max(i - 25, 0)].close || data[Math.max(i - 25, 0)].volume;

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