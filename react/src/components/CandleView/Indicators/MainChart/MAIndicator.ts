import { IChartApi, LineSeries } from 'lightweight-charts';
import { ICandleViewDataPoint } from '../../types';
import { BaseIndicator } from './BaseIndicator';
import { MainChartIndicatorInfo, MainChartIndicatorParam } from './MainChartIndicatorInfo';

export class MAIndicator extends BaseIndicator {
  private config: { periods: number[] } = { periods: [5, 10, 20] };

  static calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    if (!mainChartIndicatorInfo?.params || data.length === 0) return [];
    const periods = mainChartIndicatorInfo.params.map(param => param.paramValue);
    if (periods.length === 0) return [];
    const result: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const resultItem: any = { time: data[i].time };
      periods.forEach((period, index) => {
        if (i >= period - 1) {
          let sum = 0;
          for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
          }
          resultItem[`ma${period}`] = sum / period;
        } else {
          const availableDataCount = i + 1;
          let sum = 0;
          for (let j = 0; j < availableDataCount; j++) {
            sum += data[j].close;
          }
          const missingDataCount = period - availableDataCount;
          if (missingDataCount > 0) {
            const lastClose = data[availableDataCount - 1].close;
            sum += lastClose * missingDataCount;
          }
          resultItem[`ma${period}`] = sum / period;
        }
      });
      result.push(resultItem);
    }
    return result;
  }

  calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    return MAIndicator.calculate(data, mainChartIndicatorInfo);
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
          const seriesId = `ma_${period}`;
          const series = chart.addSeries(LineSeries, {
            color: color,
            lineWidth: lineWidth as any,
            title: `MA${period}`,
            priceScaleId: 'right'
          });
          const periodData = indicatorData.map(item => ({
            time: item.time,
            value: item[`ma${period}`] !== undefined ? item[`ma${period}`] : this.getLastValidMAValue(indicatorData, `ma${period}`)
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
      const maValues: { [key: string]: number } = {};
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);
      this.activeSeries.forEach((series, seriesId) => {
        if (seriesId.startsWith('ma_')) {
          const period = seriesId.replace('ma_', '');
          try {
            const data = series.dataByIndex(roundedIndex);
            if (data && data.value !== undefined) {
              maValues[`MA${period}`] = data.value;
            }
          } catch (error) {
          }
        }
      });
      return Object.keys(maValues).length > 0 ? maValues : null;
    } catch (error) {
      return null;
    }
  }

  private getLastValidMAValue(data: any[], key: string): number | null {
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

  updateData(data: ICandleViewDataPoint[], mainChartIndicatorInfo: MainChartIndicatorInfo): boolean {
    try {
      const filteredData = this.filterVirtualData(data);
      if (filteredData.length === 0 || !mainChartIndicatorInfo?.params) {
        return false;
      }
      const newIndicatorData = this.calculate(filteredData, mainChartIndicatorInfo);
      mainChartIndicatorInfo.params.forEach((param: MainChartIndicatorParam) => {
        const period = param.paramValue;
        const seriesId = `ma_${period}`;
        const series = this.activeSeries.get(seriesId);
        if (series) {
          const periodData = newIndicatorData.map(item => ({
            time: item.time,
            value: item[`ma${period}`] !== undefined ? item[`ma${period}`] : this.getLastValidMAValue(newIndicatorData, `ma${period}`)
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