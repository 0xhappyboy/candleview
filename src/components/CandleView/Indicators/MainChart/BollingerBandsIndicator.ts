import { IChartApi, LineSeries } from 'lightweight-charts';
import { ICandleViewDataPoint } from '../../types';
import { BaseIndicator } from './BaseIndicator';
import { MainChartIndicatorInfo } from './MainChartIndicatorInfo';

export class BollingerBandsIndicator extends BaseIndicator {
  private config: { period: number; multiplier: number } = { period: 20, multiplier: 2 };

  static calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    if (!mainChartIndicatorInfo?.params || data.length === 0) return [];
    const periodParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Period');
    const multiplierParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Multiplier');
    const period = periodParam?.paramValue || 20;
    const multiplier = multiplierParam?.paramValue || 2;
    const result: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const resultItem: any = { time: data[i].time };
      if (i >= period - 1) {
        let sum = 0;
        const values = [];
        for (let j = 0; j < period; j++) {
          const value = data[i - j].close;
          sum += value;
          values.push(value);
        }
        const middle = sum / period;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - middle, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        resultItem.middle = middle;
        resultItem.upper = middle + (stdDev * multiplier);
        resultItem.lower = middle - (stdDev * multiplier);
      } else {
        const availableDataCount = i + 1;
        let sum = 0;
        const values = [];
        for (let j = 0; j < availableDataCount; j++) {
          const value = data[j].close;
          sum += value;
          values.push(value);
        }
        const middle = sum / availableDataCount;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - middle, 2), 0) / availableDataCount;
        const stdDev = Math.sqrt(variance);
        resultItem.middle = middle;
        resultItem.upper = middle + (stdDev * multiplier);
        resultItem.lower = middle - (stdDev * multiplier);
      }
      result.push(resultItem);
    }
    return result;
  }

  calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    return BollingerBandsIndicator.calculate(data, mainChartIndicatorInfo);
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
        const lineTypes = ['middle', 'upper', 'lower'];
        lineTypes.forEach((lineType, index) => {
          if (mainChartIndicatorInfo.params && mainChartIndicatorInfo.params.length > 0) {
            const param = mainChartIndicatorInfo.params.find(p =>
              p.paramName.toLowerCase().includes(lineType)
            ) || mainChartIndicatorInfo.params[index] || mainChartIndicatorInfo.params[0];
            const color = param.lineColor || this.getDefaultColor(index);
            const lineWidth = param.lineWidth || 2;
            const seriesId = `bollinger_${lineType}`;
            const title = `BB ${lineType.charAt(0).toUpperCase() + lineType.slice(1)}`;
            const series = chart.addSeries(LineSeries, {
              color: color,
              lineWidth: lineWidth as any,
              title: title,
              priceScaleId: 'right'
            });
            const lineData = indicatorData.map(item => ({
              time: item.time,
              value: item[lineType] !== undefined ? item[lineType] : this.getLastValidBBValue(indicatorData, lineType)
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
        const multiplierParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Multiplier');

        if (periodParam) this.config.period = periodParam.paramValue;
        if (multiplierParam) this.config.multiplier = multiplierParam.paramValue;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  getYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): { [key: string]: number } | null {
    try {
      const bbValues: { [key: string]: number } = {};
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);
      this.activeSeries.forEach((series, seriesId) => {
        if (seriesId.startsWith('bollinger_')) {
          const lineType = seriesId.replace('bollinger_', '');
          try {
            const data = series.dataByIndex(roundedIndex);
            if (data && data.value !== undefined) {
              const displayName = `BB ${lineType.charAt(0).toUpperCase() + lineType.slice(1)}`;
              bbValues[displayName] = data.value;
            }
          } catch (error) {
          }
        }
      });
      return Object.keys(bbValues).length > 0 ? bbValues : null;
    } catch (error) {
      return null;
    }
  }

  private getLastValidBBValue(data: any[], key: string): number | null {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][key] !== undefined && data[i][key] !== null) {
        return data[i][key];
      }
    }
    return null;
  }

  getConfig(): { period: number; multiplier: number } {
    return { ...this.config };
  }

  updateData(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): boolean {
    try {
      const filteredData = this.filterVirtualData(data);
      if (filteredData.length === 0 || !mainChartIndicatorInfo?.params) {
        return false;
      }
      const newIndicatorData = this.calculate(filteredData, mainChartIndicatorInfo);
      const lineTypes = ['middle', 'upper', 'lower'];
      lineTypes.forEach((lineType, index) => {
        const seriesId = `bollinger_${lineType}`;
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