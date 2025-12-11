import { ChartSeries } from "../ChartLayer/ChartTypeManager";
import { MultiBottomTextMark } from "../Mark/Static/MultiBottomTextMark";
import { MultiTopTextMark } from "../Mark/Static/MultiTopTextMark";

export enum StaticMarkDirection {
  Top = "Top", Bottom = "Bottom"
}

export enum StaticMarkType {
  Text = "Text", Arrow = "Arrow"
}

export interface IStaticMarkData {
  time: number,
  type: string,
  data: {
    direction: string,
    text: string,
    fontSize?: number,
    textColor?: string,
    backgroundColor?: string,
    isCircular?: boolean,
    padding?: number,
  }[]
}

export class StaticMarkManager {
  private _marks: any[] = [];
  private _tolerance: number = 24 * 60 * 60 * 1000;
  private _timeframe: string = '1d';
  private _chartSeries: ChartSeries | null = null;

  constructor() { }

  private autoDetectTimeframe(seriesData: any[]): string {
    if (!seriesData || seriesData.length < 2) {
      return '1d';
    }
    const timeDiffs: number[] = [];
    for (let i = 1; i < Math.min(seriesData.length, 10); i++) {
      const diff = seriesData[i].time - seriesData[i - 1].time;
      timeDiffs.push(diff);
    }
    const typicalDiff = this.median(timeDiffs);
    if (typicalDiff <= 60 * 1000) {
      return '1m';
    } else if (typicalDiff <= 5 * 60 * 1000) {
      return '5m';
    } else if (typicalDiff <= 15 * 60 * 1000) {
      return '15m';
    } else if (typicalDiff <= 60 * 60 * 1000) {
      return '1h';
    } else if (typicalDiff <= 4 * 60 * 60 * 1000) {
      return '4h';
    } else if (typicalDiff <= 24 * 60 * 60 * 1000) {
      return '1d';
    } else if (typicalDiff <= 7 * 24 * 60 * 60 * 1000) {
      return '1w';
    } else {
      return '1M';
    }
  }

  private median(values: number[]): number {
    if (values.length === 0) return 0;
    values.sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);
    if (values.length % 2) {
      return values[half];
    }
    return (values[half - 1] + values[half]) / 2;
  }

  private calculateTolerance(timeframe: string): number {
    const unit = timeframe.slice(-1).toLowerCase();
    const value = parseInt(timeframe.slice(0, -1)) || 1;
    switch (unit) {
      case 'm':
        return Math.max(value * 60 * 1000, 5 * 60 * 1000);
      case 'h':
        return value * 60 * 60 * 1000;

      case 'd':
        return value * 24 * 60 * 60 * 1000;

      case 'w':
        return value * 7 * 24 * 60 * 60 * 1000;

      case 'M':
        return value * 30 * 24 * 60 * 60 * 1000;

      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  private findClosestBarTime(seriesData: any[], targetTime: number): number | null {
    const detectedTimeframe = this.autoDetectTimeframe(seriesData);
    if (detectedTimeframe !== this._timeframe) {
      this._timeframe = detectedTimeframe;
      this._tolerance = this.calculateTolerance(detectedTimeframe);
    }
    let closestTime: number | null = null;
    let minTimeDiff = Infinity;
    for (const bar of seriesData) {
      const timeDiff = Math.abs(bar.time - targetTime);
      if (this._timeframe.endsWith('w') || this._timeframe.endsWith('M')) {
        if (this.isInSameTimeUnit(bar.time, targetTime, this._timeframe)) {
          if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            closestTime = bar.time;
          }
        }
      } else {
        if (timeDiff <= this._tolerance && timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestTime = bar.time;
        }
      }
    }

    return closestTime;
  }

  private isInSameTimeUnit(time1: number, time2: number, timeframe: string): boolean {
    const date1 = new Date(time1);
    const date2 = new Date(time2);

    if (timeframe.endsWith('w')) {
      const week1 = this.getWeekNumber(date1);
      const week2 = this.getWeekNumber(date2);
      return week1.year === week2.year && week1.week === week2.week;
    } else if (timeframe.endsWith('M')) {
      return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth();
    }

    return false;
  }

  private getWeekNumber(date: Date): { year: number, week: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return {
      year: d.getUTCFullYear(),
      week: Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    };
  }

  public addMark(
    data: IStaticMarkData[],
    chartSeries: ChartSeries
  ) {
    if (!chartSeries || !chartSeries.series) {
      return;
    }
    this._chartSeries = chartSeries;
    const seriesData = chartSeries.series.data();
    if (!seriesData || seriesData.length === 0) {
      return;
    }
    const timeGroups = new Map<number, IStaticMarkData[]>();
    data.forEach(markData => {
      if (!timeGroups.has(markData.time)) {
        timeGroups.set(markData.time, []);
      }
      timeGroups.get(markData.time)!.push(markData);
    });
    const resolvedTimeGroups = new Map<number, IStaticMarkData[]>();
    timeGroups.forEach((markDatas, originalTime) => {
      const resolvedTime = this.findClosestBarTime(seriesData, originalTime);
      if (resolvedTime !== null) {
        if (!resolvedTimeGroups.has(resolvedTime)) {
          resolvedTimeGroups.set(resolvedTime, []);
        }
        markDatas.forEach(markData => {
          resolvedTimeGroups.get(resolvedTime)!.push({
            ...markData,
            time: resolvedTime
          });
        });
      }
    });
    resolvedTimeGroups.forEach((markDatas, resolvedTime) => {
      const typeGroups = new Map<StaticMarkType, IStaticMarkData[]>();
      markDatas.forEach(markData => {
        const type = Object.values(StaticMarkType).find(t => t === markData.type);
        if (!type) {
          return;
        }
        if (!typeGroups.has(type)) {
          typeGroups.set(type, []);
        }
        typeGroups.get(type)!.push(markData);
      });
      typeGroups.forEach((typeDatas, type) => {
        const allData = typeDatas.flatMap(markData => markData.data);
        const topItems = allData.filter(item =>
          Object.values(StaticMarkDirection).find(d => d === item.direction) === StaticMarkDirection.Top
        );
        const bottomItems = allData.filter(item =>
          Object.values(StaticMarkDirection).find(d => d === item.direction) === StaticMarkDirection.Bottom
        );
        if (topItems.length > 0) {
          this.addTopMark([{
            time: resolvedTime,
            type: type,
            data: topItems
          }], type, chartSeries);
        }
        if (bottomItems.length > 0) {
          this.addBottomMark([{
            time: resolvedTime,
            type: type,
            data: bottomItems
          }], type, chartSeries);
        }
      });
    });
  }

  public recalculateMarks() {
    if (!this._chartSeries) {
      return;
    }
    const currentMarks = [...this._marks];
    this.clearAllMarks();
  }

  public refreshTimeframe() {
    if (!this._chartSeries) return;
    const seriesData = this._chartSeries.series.data();
    if (!seriesData || seriesData.length < 2) return;
    const newTimeframe = this.autoDetectTimeframe(seriesData);
    if (newTimeframe !== this._timeframe) {
      this._timeframe = newTimeframe;
      this._tolerance = this.calculateTolerance(newTimeframe);
      this.recalculateMarks();
    }
  }

  private addTopMark(data: IStaticMarkData[], type: StaticMarkType, chartSeries: ChartSeries) {
    switch (type) {
      case StaticMarkType.Text:
        data.forEach(markData => {
          const textItems = markData.data.map(item => {
            const textItem: any = {
              text: item.text
            };
            if (item.textColor !== undefined) textItem.textColor = item.textColor;
            if (item.backgroundColor !== undefined) textItem.backgroundColor = item.backgroundColor;
            if (item.isCircular !== undefined) textItem.isCircular = item.isCircular;
            if (item.fontSize !== undefined) textItem.fontSize = item.fontSize;
            if (item.padding !== undefined) textItem.padding = item.padding;
            return textItem;
          });
          const mark = new MultiTopTextMark(markData.time, textItems);
          chartSeries.series.attachPrimitive(mark);
          this._marks.push(mark);
        });
        break;
      case StaticMarkType.Arrow:
        // const mark = new MultiTopArrowMark(markData.time, count);
        // chartSeries.series.attachPrimitive(mark);
        // this._marks.push(mark);
        break;
      default:
        return;
    }
  }

  private addBottomMark(data: IStaticMarkData[], type: StaticMarkType, chartSeries: ChartSeries) {
    switch (type) {
      case StaticMarkType.Text:
        data.forEach(markData => {
          const textItems = markData.data.map(item => {
            const textItem: any = {
              text: item.text
            };
            if (item.textColor !== undefined) textItem.textColor = item.textColor;
            if (item.backgroundColor !== undefined) textItem.backgroundColor = item.backgroundColor;
            if (item.isCircular !== undefined) textItem.isCircular = item.isCircular;
            if (item.fontSize !== undefined) textItem.fontSize = item.fontSize;
            if (item.padding !== undefined) textItem.padding = item.padding;
            return textItem;
          });
          const mark = new MultiBottomTextMark(markData.time, textItems);
          chartSeries.series.attachPrimitive(mark);
          this._marks.push(mark);
        });
        break;
      case StaticMarkType.Arrow:
        // const mark = new MultiBottomArrowMark(markData.time, count);
        // chartSeries.series.attachPrimitive(mark);
        // this._marks.push(mark);
        break;
      default:
        return;
    }
  }

  public removeAllMark() {
    this._marks = [];
  }

  public getTolerance(): number {
    return this._tolerance;
  }

  public getTimeframe(): string {
    return this._timeframe;
  }

  public getMarkCount(): number {
    return this._marks.length;
  }

  public clearAllMarks(chartSeries?: ChartSeries) {
    const targetSeries = chartSeries || this._chartSeries;
    if (targetSeries) {
      this._marks.forEach(mark => {
        targetSeries.series.detachPrimitive(mark);
      });
    }
    this._marks = [];
  }

  public destroy() {
    this.clearAllMarks();
    this._chartSeries = null;
  }
}
