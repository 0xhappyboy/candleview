import { IChartApi, LineSeries } from 'lightweight-charts';
import { ICandleViewDataPoint } from '../../types';
import { BaseIndicator } from './BaseIndicator';
import { MainChartIndicatorInfo } from './MainChartIndicatorInfo';

export class IchimokuIndicator extends BaseIndicator {
  private config: {
    conversionPeriod: number;
    basePeriod: number;
    leadingSpanPeriod: number;
    laggingSpanPeriod: number
  } = {
      conversionPeriod: 9,
      basePeriod: 26,
      leadingSpanPeriod: 52,
      laggingSpanPeriod: 26
    };

  static calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    if (!mainChartIndicatorInfo?.params || data.length === 0) return [];

    const conversionParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Tenkan');
    const baseParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Kijun');
    const leadingParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Senkou');
    const laggingParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Chikou');

    const conversionPeriod = conversionParam?.paramValue || 9;
    const basePeriod = baseParam?.paramValue || 26;
    const leadingSpanPeriod = leadingParam?.paramValue || 52;
    const laggingSpanPeriod = laggingParam?.paramValue || 26;

    const result: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const resultItem: any = { time: data[i].time };

      if (i >= conversionPeriod - 1) {
        const conversionHigh = Math.max(...data.slice(i - conversionPeriod + 1, i + 1).map(d => d.high));
        const conversionLow = Math.min(...data.slice(i - conversionPeriod + 1, i + 1).map(d => d.low));
        resultItem.tenkanSen = (conversionHigh + conversionLow) / 2;
      }

      if (i >= basePeriod - 1) {
        const baseHigh = Math.max(...data.slice(i - basePeriod + 1, i + 1).map(d => d.high));
        const baseLow = Math.min(...data.slice(i - basePeriod + 1, i + 1).map(d => d.low));
        resultItem.kijunSen = (baseHigh + baseLow) / 2;
      }

      if (resultItem.tenkanSen !== undefined && resultItem.kijunSen !== undefined) {
        resultItem.senkouSpanA = (resultItem.tenkanSen + resultItem.kijunSen) / 2;
      }

      if (i >= leadingSpanPeriod - 1) {
        const leadingHigh = Math.max(...data.slice(i - leadingSpanPeriod + 1, i + 1).map(d => d.high));
        const leadingLow = Math.min(...data.slice(i - leadingSpanPeriod + 1, i + 1).map(d => d.low));
        resultItem.senkouSpanB = (leadingHigh + leadingLow) / 2;
      }

      if (i >= laggingSpanPeriod) {
        resultItem.chikouSpan = data[i - laggingSpanPeriod].close;
      }

      result.push(resultItem);
    }
    return result;
  }

  calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    return IchimokuIndicator.calculate(data, mainChartIndicatorInfo);
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
        const lineTypes = ['tenkanSen', 'kijunSen', 'chikouSpan', 'senkouSpanA', 'senkouSpanB'];
        lineTypes.forEach((lineType, index) => {
          if (mainChartIndicatorInfo.params && mainChartIndicatorInfo.params.length > 0) {
            const param = mainChartIndicatorInfo.params.find(p =>
              p.paramName.toLowerCase().includes(lineType.toLowerCase().replace('sen', '').replace('span', ''))
            ) || mainChartIndicatorInfo.params[index] || mainChartIndicatorInfo.params[0];
            const color = param.lineColor || this.getDefaultColor(index);
            const lineWidth = param.lineWidth || 2;
            const seriesId = `ichimoku_${lineType}`;
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
        const conversionParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Tenkan');
        const baseParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Kijun');
        const leadingParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Senkou');
        const laggingParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Chikou');

        if (conversionParam) this.config.conversionPeriod = conversionParam.paramValue;
        if (baseParam) this.config.basePeriod = baseParam.paramValue;
        if (leadingParam) this.config.leadingSpanPeriod = leadingParam.paramValue;
        if (laggingParam) this.config.laggingSpanPeriod = laggingParam.paramValue;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  getYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): { [key: string]: number } | null {
    try {
      const ichimokuValues: { [key: string]: number } = {};
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);

      this.activeSeries.forEach((series, seriesId) => {
        if (seriesId.startsWith('ichimoku_')) {
          const lineType = seriesId.replace('ichimoku_', '');
          try {
            const data = series.dataByIndex(roundedIndex);
            if (data && data.value !== undefined) {
              const displayName = this.getLineTitle(lineType);
              ichimokuValues[displayName] = data.value;
            }
          } catch (error) {
          }
        }
      });

      return Object.keys(ichimokuValues).length > 0 ? ichimokuValues : null;
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
      tenkanSen: 'Tenkan',
      kijunSen: 'Kijun',
      chikouSpan: 'Chikou',
      senkouSpanA: 'Senkou A',
      senkouSpanB: 'Senkou B'
    };
    return titles[lineType] || lineType;
  }

  getConfig(): { conversionPeriod: number; basePeriod: number; leadingSpanPeriod: number; laggingSpanPeriod: number } {
    return { ...this.config };
  }

  updateData(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): boolean {
    try {
      const filteredData = this.filterVirtualData(data);
      if (filteredData.length === 0 || !mainChartIndicatorInfo?.params) {
        return false;
      }
      const newIndicatorData = this.calculate(filteredData, mainChartIndicatorInfo);
      const lineTypes = ['tenkanSen', 'kijunSen', 'chikouSpan', 'senkouSpanA', 'senkouSpanB'];
      lineTypes.forEach((lineType, index) => {
        const seriesId = `ichimoku_${lineType}`;
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