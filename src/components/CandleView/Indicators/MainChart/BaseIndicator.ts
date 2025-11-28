import { IChartApi, ISeriesApi } from 'lightweight-charts';
import { ICandleViewDataPoint } from '../../types';
import { MainChartIndicatorInfo } from './MainChartIndicatorInfo';

export abstract class BaseIndicator {
  protected theme: any;
  protected activeSeries: Map<string, ISeriesApi<any>> = new Map();

  constructor(theme: any) {
    this.theme = theme;
  }

  abstract calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[];

  abstract addSeries(chart: IChartApi, data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): boolean;

  abstract updateSeriesStyle(seriesId: string, style: { color?: string; lineWidth?: number; visible?: boolean }): boolean;

  abstract updateParams(mainChartIndicatorInfo?: MainChartIndicatorInfo): boolean;

  abstract updateData(data: ICandleViewDataPoint[], mainChartIndicatorInfo: MainChartIndicatorInfo): boolean;

  removeSeries(chart: IChartApi, seriesId: string): boolean {
    try {
      const series = this.activeSeries.get(seriesId);
      if (series) {
        chart.removeSeries(series);
        this.activeSeries.delete(seriesId);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  removeAllSeries(chart: IChartApi): void {
    this.activeSeries.forEach((series) => {
      try {
        chart.removeSeries(series);
      } catch (error) {
      }
    });
    this.activeSeries.clear();
  }

  getSeries(seriesId: string): ISeriesApi<any> | undefined {
    return this.activeSeries.get(seriesId);
  }

  getAllSeries(): ISeriesApi<any>[] {
    return Array.from(this.activeSeries.values());
  }

  hideSeries(): void {
    this.activeSeries.forEach(series => {
      series.applyOptions({ visible: false });
    });
  }

  showSeries(): void {
    this.activeSeries.forEach(series => {
      series.applyOptions({ visible: true });
    });
  }

  isVisible(): boolean {
    const firstSeries = this.getAllSeries()[0];
    if (!firstSeries) return false;
    const options = firstSeries.options();
    return options.visible !== false;
  }

  protected filterVirtualData(data: ICandleViewDataPoint[]): ICandleViewDataPoint[] {
    return data.filter(item => !item.isVirtual);
  }

  protected getDefaultColor(index: number): string {
    const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return defaultColors[index % defaultColors.length];
  }
}