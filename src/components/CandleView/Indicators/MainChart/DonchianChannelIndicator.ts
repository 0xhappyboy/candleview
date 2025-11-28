import { IChartApi, LineSeries } from 'lightweight-charts';
import { ICandleViewDataPoint } from '../../types';
import { BaseIndicator } from './BaseIndicator';
import { MainChartIndicatorInfo } from './MainChartIndicatorInfo';

export class DonchianChannelIndicator extends BaseIndicator {
  private config: { period: number } = { period: 20 };

  static calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    if (!mainChartIndicatorInfo?.params || data.length === 0) return [];
    const periodParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Period');
    const period = periodParam?.paramValue || 20;
    const result: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const resultItem: any = { time: data[i].time };
      if (i >= period - 1) {
        const periodData = data.slice(i - period + 1, i + 1);
        const upper = Math.max(...periodData.map(d => d.high));
        const lower = Math.min(...periodData.map(d => d.low));
        const middle = (upper + lower) / 2;
        resultItem.upper = upper;
        resultItem.lower = lower;
        resultItem.middle = middle;
      } else {
        const availableData = data.slice(0, i + 1);
        const upper = Math.max(...availableData.map(d => d.high));
        const lower = Math.min(...availableData.map(d => d.low));
        const middle = (upper + lower) / 2;
        resultItem.upper = upper;
        resultItem.lower = lower;
        resultItem.middle = middle;
      }
      result.push(resultItem);
    }
    return result;
  }

  calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    return DonchianChannelIndicator.calculate(data, mainChartIndicatorInfo);
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
        const lineTypes = ['upper', 'middle', 'lower'];
        lineTypes.forEach((lineType, index) => {
          if (mainChartIndicatorInfo.params && mainChartIndicatorInfo.params.length > 0) {
            const param = mainChartIndicatorInfo.params.find(p =>
              p.paramName.toLowerCase().includes(lineType)
            ) || mainChartIndicatorInfo.params[index] || mainChartIndicatorInfo.params[0];
            const color = param.lineColor || this.getDefaultColor(index);
            const lineWidth = param.lineWidth || 2;
            const seriesId = `donchian_${lineType}`;
            const title = `Donchian ${lineType.charAt(0).toUpperCase() + lineType.slice(1)}`;
            const series = chart.addSeries(LineSeries, {
              color: color,
              lineWidth: lineWidth as any,
              title: title,
              priceScaleId: 'right'
            });
            const lineData = indicatorData.map(item => ({
              time: item.time,
              value: item[lineType] !== undefined ? item[lineType] : this.getLastValidValue(indicatorData, lineType)
            })).filter(item => item.value !== undefined && item.value !== null);
            series.setData(lineData);
            this.activeSeries.set(seriesId, series);
          }
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
        const periodParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Period');
        if (periodParam) this.config.period = periodParam.paramValue;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  getYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): { [key: string]: number } | null {
    try {
      const donchianValues: { [key: string]: number } = {};
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);

      this.activeSeries.forEach((series, seriesId) => {
        if (seriesId.startsWith('donchian_')) {
          const lineType = seriesId.replace('donchian_', '');
          try {
            const data = series.dataByIndex(roundedIndex);
            if (data && data.value !== undefined) {
              const displayName = `Donchian ${lineType.charAt(0).toUpperCase() + lineType.slice(1)}`;
              donchianValues[displayName] = data.value;
            }
          } catch (error) {
          }
        }
      });

      return Object.keys(donchianValues).length > 0 ? donchianValues : null;
    } catch (error) {
      return null;
    }
  }

  private getLastValidValue(data: any[], key: string): number | null {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][key] !== undefined && data[i][key] !== null) {
        return data[i][key];
      }
    }
    return null;
  }

  getConfig(): { period: number } {
    return { ...this.config };
  }

  updateData(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): boolean {
    try {
      const filteredData = this.filterVirtualData(data);
      if (filteredData.length === 0 || !mainChartIndicatorInfo?.params) {
        return false;
      }
      const newIndicatorData = this.calculate(filteredData, mainChartIndicatorInfo);
      const lineTypes = ['upper', 'middle', 'lower'];
      lineTypes.forEach((lineType, index) => {
        const seriesId = `donchian_${lineType}`;
        const series = this.activeSeries.get(seriesId);
        if (series) {
          series.setData(newIndicatorData);
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

}