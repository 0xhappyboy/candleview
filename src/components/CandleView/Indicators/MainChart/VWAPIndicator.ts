import { IChartApi, LineSeries } from 'lightweight-charts';
import { ICandleViewDataPoint } from '../../types';
import { BaseIndicator } from './BaseIndicator';
import { MainChartIndicatorInfo } from './MainChartIndicatorInfo';

export class VWAPIndicator extends BaseIndicator {
  private config: { color: string; lineWidth: number } = { color: '#E91E63', lineWidth: 1 };

  static calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    if (!data.length) return [];

    const result: any[] = [];
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;

    for (let i = 0; i < data.length; i++) {
      const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
      const volume = data[i].volume || 1;
      cumulativeTPV += typicalPrice * volume;
      cumulativeVolume += volume;
      const vwap = cumulativeTPV / cumulativeVolume;

      result.push({
        time: data[i].time,
        vwap: vwap
      });
    }
    return result;
  }

  calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    return VWAPIndicator.calculate(data, mainChartIndicatorInfo);
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
        const param = mainChartIndicatorInfo.params[0];
        const color = param.lineColor || this.config.color;
        const lineWidth = param.lineWidth || this.config.lineWidth;
        const seriesId = 'vwap';

        const series = chart.addSeries(LineSeries, {
          color: color,
          lineWidth: lineWidth as any,
          title: 'VWAP',
          priceScaleId: 'right'
        });

        const vwapData = indicatorData.map(item => ({
          time: item.time,
          value: item.vwap !== undefined ? item.vwap : this.getLastValidValue(indicatorData, 'vwap')
        })).filter(item => item.value !== undefined && item.value !== null);

        series.setData(vwapData);
        this.activeSeries.set(seriesId, series);
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
      if (mainChartIndicatorInfo?.params && mainChartIndicatorInfo.params.length > 0) {
        const param = mainChartIndicatorInfo.params[0];
        if (param.lineColor) this.config.color = param.lineColor;
        if (param.lineWidth) this.config.lineWidth = param.lineWidth;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  getYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): { [key: string]: number } | null {
    try {
      const vwapValues: { [key: string]: number } = {};
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);

      this.activeSeries.forEach((series, seriesId) => {
        if (seriesId === 'vwap') {
          try {
            const data = series.dataByIndex(roundedIndex);
            if (data && data.value !== undefined) {
              vwapValues['VWAP'] = data.value;
            }
          } catch (error) {
          }
        }
      });

      return Object.keys(vwapValues).length > 0 ? vwapValues : null;
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

  getConfig(): { color: string; lineWidth: number } {
    return { ...this.config };
  }

  updateData(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): boolean {
    try {
      const filteredData = this.filterVirtualData(data);
      if (filteredData.length === 0 || !mainChartIndicatorInfo?.params) {
        return false;
      }
      const newIndicatorData = this.calculate(filteredData, mainChartIndicatorInfo);
      const seriesId = 'vwap';
      const series = this.activeSeries.get(seriesId);
      if (series) {
        series.setData(newIndicatorData);
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}