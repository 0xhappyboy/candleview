import { IChartApi, LineSeries } from 'lightweight-charts';
import { ICandleViewDataPoint } from '../../types';
import { BaseIndicator } from './BaseIndicator';
import { MainChartIndicatorInfo } from './MainChartIndicatorInfo';

export class EnvelopeIndicator extends BaseIndicator {
  private config: { period: number; percentage: number } = { period: 20, percentage: 2.5 };

  static calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    if (!mainChartIndicatorInfo?.params || data.length === 0) return [];
    const periodParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Period');
    const percentageParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Percentage');

    const period = periodParam?.paramValue || 20;
    const percentage = percentageParam?.paramValue || 2.5;

    const result: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const resultItem: any = { time: data[i].time };

      if (i >= period - 1) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += data[i - j].close;
        }
        const sma = sum / period;
        const upper = sma * (1 + percentage / 100);
        const lower = sma * (1 - percentage / 100);

        resultItem.sma = sma;
        resultItem.upper = upper;
        resultItem.lower = lower;
      } else {
        const availableDataCount = i + 1;
        let sum = 0;
        for (let j = 0; j < availableDataCount; j++) {
          sum += data[j].close;
        }
        const sma = sum / availableDataCount;
        const upper = sma * (1 + percentage / 100);
        const lower = sma * (1 - percentage / 100);

        resultItem.sma = sma;
        resultItem.upper = upper;
        resultItem.lower = lower;
      }

      result.push(resultItem);
    }
    return result;
  }

  calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    return EnvelopeIndicator.calculate(data, mainChartIndicatorInfo);
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
        const lineTypes = ['upper', 'sma', 'lower'];
        lineTypes.forEach((lineType, index) => {
          if (mainChartIndicatorInfo.params && mainChartIndicatorInfo.params.length > 0) {
            const param = mainChartIndicatorInfo.params.find(p =>
              p.paramName.toLowerCase().includes(lineType)
            ) || mainChartIndicatorInfo.params[index] || mainChartIndicatorInfo.params[0];
            const color = param.lineColor || this.getDefaultColor(index);
            const lineWidth = param.lineWidth || 2;
            const seriesId = `envelope_${lineType}`;
            const title = this.getLineTitle(lineType);
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
        const percentageParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Percentage');

        if (periodParam) this.config.period = periodParam.paramValue;
        if (percentageParam) this.config.percentage = percentageParam.paramValue;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  getYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): { [key: string]: number } | null {
    try {
      const envelopeValues: { [key: string]: number } = {};
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);
      this.activeSeries.forEach((series, seriesId) => {
        if (seriesId.startsWith('envelope_')) {
          const lineType = seriesId.replace('envelope_', '');
          try {
            const data = series.dataByIndex(roundedIndex);
            if (data && data.value !== undefined) {
              const displayName = this.getLineTitle(lineType);
              envelopeValues[displayName] = data.value;
            }
          } catch (error) {
          }
        }
      });
      return Object.keys(envelopeValues).length > 0 ? envelopeValues : null;
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

  private getLineTitle(lineType: string): string {
    const titles: { [key: string]: string } = {
      upper: 'Envelope Upper',
      sma: 'Envelope SMA',
      lower: 'Envelope Lower'
    };
    return titles[lineType] || lineType;
  }

  getConfig(): { period: number; percentage: number } {
    return { ...this.config };
  }

  updateData(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): boolean {
    try {
      const filteredData = this.filterVirtualData(data);
      if (filteredData.length === 0 || !mainChartIndicatorInfo?.params) {
        return false;
      }
      const newIndicatorData = this.calculate(filteredData, mainChartIndicatorInfo);
      const lineTypes = ['upper', 'sma', 'lower'];
      lineTypes.forEach((lineType, index) => {
        const seriesId = `envelope_${lineType}`;
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