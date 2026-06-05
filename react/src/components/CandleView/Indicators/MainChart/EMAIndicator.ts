import { IChartApi, LineSeries } from 'lightweight-charts';
import { ICandleViewDataPoint } from '../../types';
import { BaseIndicator } from './BaseIndicator';
import { MainChartIndicatorInfo, MainChartIndicatorParam } from './MainChartIndicatorInfo';

export class EMAIndicator extends BaseIndicator {
  private config: { periods: number[] } = { periods: [12, 26] };

  static calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    if (!mainChartIndicatorInfo?.params || data.length === 0) return [];
    const periods = mainChartIndicatorInfo.params.map(param => param.paramValue);
    if (periods.length === 0) return [];
    const result: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const resultItem: any = { time: data[i].time };
      periods.forEach((period, index) => {
        const multiplier = 2 / (period + 1);
        if (i === 0) {
          resultItem[`ema${period}`] = data[i].close;
        } else {
          const prevEMA = result[i - 1][`ema${period}`] || data[i - 1].close;
          const currentClose = data[i].close;
          resultItem[`ema${period}`] = (currentClose - prevEMA) * multiplier + prevEMA;
        }
      });
      result.push(resultItem);
    }
    return result;
  }

  calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    return EMAIndicator.calculate(data, mainChartIndicatorInfo);
  }

  addSeries(chart: IChartApi, data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): boolean {
    try {
      if (!chart) {
        return false;
      }

      const filteredData = this.filterVirtualData(data);
      if (filteredData.length === 0 || !mainChartIndicatorInfo?.params) {
        return false;
      }

      const indicatorData = this.calculate(filteredData, mainChartIndicatorInfo);

      if (indicatorData.length > 0) {
        mainChartIndicatorInfo.params.forEach((param: MainChartIndicatorParam, index: number) => {
          const period = param.paramValue;
          const color = param.lineColor || this.getDefaultColor(index);
          const lineWidth = param.lineWidth || 2;
          const seriesId = `ema_${period}`;

          const series = chart.addSeries(LineSeries, {
            color: color,
            lineWidth: lineWidth as any,
            title: `EMA${period}`,
            priceScaleId: 'right'
          });

          const periodData = indicatorData.map(item => ({
            time: item.time,
            value: item[`ema${period}`] !== undefined ? item[`ema${period}`] : this.getLastValidEMAValue(indicatorData, `ema${period}`)
          })).filter(item => item.value !== undefined && item.value !== null);

          series.setData(periodData);
          this.activeSeries.set(seriesId, series);
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  updateSeriesStyle(seriesId: string, style: { color?: string; lineWidth?: number; visible?: boolean }): boolean {
    try {
      const series = this.activeSeries.get(seriesId);
      if (series) {
        const options: any = {};
        if (style.color) options.color = style.color;
        if (style.lineWidth) options.lineWidth = style.lineWidth;
        if (style.visible !== undefined) options.visible = style.visible;

        series.applyOptions(options);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  updateParams(mainChartIndicatorInfo?: MainChartIndicatorInfo): boolean {
    try {
      if (mainChartIndicatorInfo?.params) {
        this.config.periods = mainChartIndicatorInfo.params.map(param => param.paramValue);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  getYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): { [key: string]: number } | null {
    try {
      const emaValues: { [key: string]: number } = {};
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);

      this.activeSeries.forEach((series, seriesId) => {
        if (seriesId.startsWith('ema_')) {
          const period = seriesId.replace('ema_', '');
          try {
            const data = series.dataByIndex(roundedIndex);
            if (data && data.value !== undefined) {
              emaValues[`EMA${period}`] = data.value;
            }
          } catch (error) {
          }
        }
      });

      return Object.keys(emaValues).length > 0 ? emaValues : null;
    } catch (error) {
      return null;
    }
  }

  private getLastValidEMAValue(data: any[], key: string): number | null {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][key] !== undefined && data[i][key] !== null) {
        return data[i][key];
      }
    }
    return null;
  }

  getConfig(): { periods: number[] } {
    return { ...this.config };
  }

  updateData(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): boolean {
    try {
      const filteredData = this.filterVirtualData(data);
      if (filteredData.length === 0 || !mainChartIndicatorInfo?.params) {
        return false;
      }
      const newIndicatorData = this.calculate(filteredData, mainChartIndicatorInfo);
      mainChartIndicatorInfo.params.forEach((param: MainChartIndicatorParam) => {
        const period = param.paramValue;
        const seriesId = `ema_${period}`;
        const series = this.activeSeries.get(seriesId);
        if (series) {
          const periodData = newIndicatorData.map(item => ({
            time: item.time,
            value: item[`ema${period}`] !== undefined ? item[`ema${period}`] : this.getLastValidEMAValue(newIndicatorData, `ema${period}`)
          })).filter(item => item.value !== undefined && item.value !== null);
          series.setData(periodData);
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

}