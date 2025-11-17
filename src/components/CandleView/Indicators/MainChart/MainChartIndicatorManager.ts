import { AreaSeries, IChartApi, ISeriesApi, LineSeries, Time } from 'lightweight-charts';
import { BollingerBandsIndicator } from './BollingerBandsIndicator';
import { DonchianChannelIndicator } from './DonchianChannelIndicator';
import { EMAIndicator } from './EMAIndicator';
import { EnvelopeIndicator } from './EnvelopeIndicator';
import { IchimokuIndicator } from './IchimokuIndicator';
import { MAIndicator, MAConfig } from './MAIndicator';
import { VWAPIndicator } from './VWAPIndicator';
import { MainChartIndicatorType } from '../../types';

export interface MainChartTechnicalIndicatorConfig {
  id: string;
  name: string;
  calculate: (data: any[]) => any[];
}

export interface ChartData {
  time: string;
  value: number;
  close?: number;
  open?: number;
  high?: number;
  low?: number;
}

export class MainChartTechnicalIndicatorManager {
  private theme: any;
  private activeIndicators: Map<string, ISeriesApi<any>> = new Map();

  private defaultMAConfig: MAConfig = {
    periods: [5, 10, 20],
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1']
  };

  constructor(theme: any) {
    this.theme = theme;
  }

  static calculateMA = MAIndicator.calculate;
  static calculateEMA = EMAIndicator.calculate;
  static calculateBollingerBands = BollingerBandsIndicator.calculate;
  static calculateIchimoku = IchimokuIndicator.calculate;
  static calculateDonchianChannel = DonchianChannelIndicator.calculate;
  static calculateEnvelope = EnvelopeIndicator.calculate;
  static calculateVWAP = VWAPIndicator.calculate;

  addIndicator(chart: IChartApi, indicatorId: string, data: ChartData[], config?: any): boolean {
    try {
      if (!chart) {
        console.error('Chart not initialized');
        return false;
      }

      let indicatorData: any[];

      switch (indicatorId) {
        case 'ma':
          const maConfig = {
            periods: config?.periods || this.defaultMAConfig.periods,
            colors: config?.colors || this.defaultMAConfig.colors,
            lineWidths: config?.lineWidths || Array(config?.periods?.length || this.defaultMAConfig.periods.length).fill(2)
          };
          indicatorData = MAIndicator.calculate(data, maConfig.periods);
          if (indicatorData.length > 0) {
            maConfig.periods.forEach((period: number, index: number) => {
              const color = maConfig.colors?.[index] || this.getDefaultColor(index);
              const lineWidth = maConfig.lineWidths?.[index] || 2;
              const seriesId = `ma_${period}`;
              const series = chart.addSeries(LineSeries, {
                color: color,
                lineWidth: lineWidth,
                title: `MA${period}`,
                priceScaleId: 'right'
              });
              const periodData = indicatorData.map(item => ({
                time: item.time,
                value: item[`ma${period}`]
              })).filter(item => item.value !== undefined);
              series.setData(periodData);
              this.activeIndicators.set(seriesId, series);
            });
            return true;
          }
          break;
        case 'ema':
          if (indicatorId.startsWith('ema_')) {
            const period = parseInt(indicatorId.replace('ema_', ''));
            if (!isNaN(period)) {
              indicatorData = EMAIndicator.calculate(data, period);
              if (indicatorData.length > 0) {
                const series = chart.addSeries(LineSeries, {
                  color: config?.color || '#FF6B6B',
                  lineWidth: config?.lineWidth || 2,
                  title: `EMA${period}`,
                  priceScaleId: 'right'
                });
                series.setData(indicatorData);
                this.activeIndicators.set(indicatorId, series);
                return true;
              }
            }
          } else {
            const periods = config?.periods || [12, 26];
            let hasValidData = false;
            periods.forEach((period: number, index: number) => {
              const emaData = EMAIndicator.calculate(data, period);
              if (emaData.length > 0) {
                const color = config?.colors?.[index] || this.getDefaultColor(index);
                const lineWidth = config?.lineWidths?.[index] || 2;
                const seriesId = `ema_${period}`;
                const series = chart.addSeries(LineSeries, {
                  color: color,
                  lineWidth: lineWidth,
                  title: `EMA${period}`,
                  priceScaleId: 'right'
                });
                series.setData(emaData);
                this.activeIndicators.set(seriesId, series);
                hasValidData = true;
              }
            });
            return hasValidData;
          }
          break;

        case 'bollinger':
          // BollingerBandsIndicator.calculate(data, period, multiplier)
          const bollingerPeriod = config?.period || 20;
          const bollingerMultiplier = config?.multiplier || 2;
          indicatorData = BollingerBandsIndicator.calculate(data, bollingerPeriod, bollingerMultiplier);
          if (indicatorData.length > 0) {
            const middleSeries = chart.addSeries(LineSeries, {
              color: config?.middleColor || '#2962FF',
              lineWidth: config?.middleLineWidth || 1,
              title: 'BB Middle',
              priceScaleId: 'right'
            });
            const upperSeries = chart.addSeries(LineSeries, {
              color: config?.upperColor || '#FF6B6B',
              lineWidth: config?.upperLineWidth || 1,
              title: 'BB Upper',
              priceScaleId: 'right'
            });
            const lowerSeries = chart.addSeries(LineSeries, {
              color: config?.lowerColor || '#FF6B6B',
              lineWidth: config?.lowerLineWidth || 1,
              title: 'BB Lower',
              priceScaleId: 'right'
            });

            const middleData = indicatorData.map(item => ({ time: item.time, value: item.middle }));
            const upperData = indicatorData.map(item => ({ time: item.time, value: item.upper }));
            const lowerData = indicatorData.map(item => ({ time: item.time, value: item.lower }));

            middleSeries.setData(middleData);
            upperSeries.setData(upperData);
            lowerSeries.setData(lowerData);

            this.activeIndicators.set('bollinger_middle', middleSeries);
            this.activeIndicators.set('bollinger_upper', upperSeries);
            this.activeIndicators.set('bollinger_lower', lowerSeries);
            return true;
          }
          break;
        case 'ichimoku':
          indicatorData = IchimokuIndicator.calculate(data);
          if (indicatorData.length > 0) {
            const cloudSeries = chart.addSeries(AreaSeries, {
              lineColor: 'transparent',
              topColor: config?.cloudColor || 'rgba(76, 175, 80, 0.2)',
              bottomColor: config?.cloudColor || 'rgba(76, 175, 80, 0.2)',
              priceScaleId: 'right',
            });
            const tenkanSeries = chart.addSeries(LineSeries, {
              color: config?.tenkanColor || '#FF6B6B',
              lineWidth: config?.tenkanLineWidth || 1,
              priceScaleId: 'right',
            });
            const kijunSeries = chart.addSeries(LineSeries, {
              color: config?.kijunColor || '#2962FF',
              lineWidth: config?.kijunLineWidth || 1,
              priceScaleId: 'right',
            });
            const chikouSeries = chart.addSeries(LineSeries, {
              color: config?.chikouColor || '#9C27B0',
              lineWidth: config?.chikouLineWidth || 1,
              priceScaleId: 'right',
            });
            const cloudData = indicatorData.map(item => ({
              time: item.time,
              value: item.senkouSpanA,
              value2: item.senkouSpanB
            }));
            const tenkanData = indicatorData.map(item => ({
              time: item.time,
              value: item.tenkanSen
            }));
            const kijunData = indicatorData.map(item => ({
              time: item.time,
              value: item.kijunSen
            }));
            const chikouData = indicatorData.map(item => ({
              time: item.time,
              value: item.chikouSpan
            }));

            cloudSeries.setData(cloudData);
            tenkanSeries.setData(tenkanData);
            kijunSeries.setData(kijunData);
            chikouSeries.setData(chikouData);
            this.activeIndicators.set('ichimoku_cloud', cloudSeries);
            this.activeIndicators.set('ichimoku_tenkan', tenkanSeries);
            this.activeIndicators.set('ichimoku_kijun', kijunSeries);
            this.activeIndicators.set('ichimoku_chikou', chikouSeries);
            return true;
          }
          break;
        case 'donchian':
          const donchianPeriod = config?.period || 20;
          indicatorData = DonchianChannelIndicator.calculate(data, donchianPeriod, null, null);
          if (indicatorData.length > 0) {
            const channelSeries = chart.addSeries(AreaSeries, {
              lineColor: 'transparent',
              topColor: config?.channelColor || 'rgba(33, 150, 243, 0.2)',
              bottomColor: config?.channelColor || 'rgba(33, 150, 243, 0.2)',
              priceScaleId: 'right',
            });
            const upperSeries = chart.addSeries(LineSeries, {
              color: config?.upperColor || '#2196F3',
              lineWidth: config?.upperLineWidth || 1,
              priceScaleId: 'right',
            });
            const lowerSeries = chart.addSeries(LineSeries, {
              color: config?.lowerColor || '#2196F3',
              lineWidth: config?.lowerLineWidth || 1,
              priceScaleId: 'right',
            });
            const middleSeries = chart.addSeries(LineSeries, {
              color: config?.middleColor || '#FF9800',
              lineWidth: config?.middleLineWidth || 1,
              lineStyle: 2,
              priceScaleId: 'right',
            });
            const channelData = indicatorData.map(item => ({
              time: item.time,
              value: item.upper,
              value2: item.lower
            }));
            const upperData = indicatorData.map(item => ({
              time: item.time,
              value: item.upper
            }));
            const lowerData = indicatorData.map(item => ({
              time: item.time,
              value: item.lower
            }));
            const middleData = indicatorData.map(item => ({
              time: item.time,
              value: item.middle
            }));
            channelSeries.setData(channelData);
            upperSeries.setData(upperData);
            lowerSeries.setData(lowerData);
            middleSeries.setData(middleData);
            this.activeIndicators.set('donchian_channel', channelSeries);
            this.activeIndicators.set('donchian_upper', upperSeries);
            this.activeIndicators.set('donchian_lower', lowerSeries);
            this.activeIndicators.set('donchian_middle', middleSeries);
            return true;
          }
          break;
        case 'envelope':
          const envelopePeriod = config?.period || 20;
          const envelopePercentage = config?.percentage || 2.5;
          indicatorData = EnvelopeIndicator.calculate(data, envelopePeriod, envelopePercentage);
          if (indicatorData.length > 0) {
            const envelopeSeries = chart.addSeries(AreaSeries, {
              lineColor: 'transparent',
              topColor: config?.envelopeColor || 'rgba(255, 152, 0, 0.2)',
              bottomColor: config?.envelopeColor || 'rgba(255, 152, 0, 0.2)',
              priceScaleId: 'right',
            });
            const upperSeries = chart.addSeries(LineSeries, {
              color: config?.upperColor || '#FF9800',
              lineWidth: config?.upperLineWidth || 1,
              priceScaleId: 'right',
            });
            const lowerSeries = chart.addSeries(LineSeries, {
              color: config?.lowerColor || '#FF9800',
              lineWidth: config?.lowerLineWidth || 1,
              priceScaleId: 'right',
            });
            const smaSeries = chart.addSeries(LineSeries, {
              color: config?.smaColor || '#666666',
              lineWidth: config?.smaLineWidth || 1,
              lineStyle: 2,
              priceScaleId: 'right',
            });
            const envelopeData = indicatorData.map(item => ({
              time: item.time,
              value: item.upper,
              value2: item.lower
            }));
            const upperData = indicatorData.map(item => ({
              time: item.time,
              value: item.upper
            }));
            const lowerData = indicatorData.map(item => ({
              time: item.time,
              value: item.lower
            }));
            const smaData = indicatorData.map(item => ({
              time: item.time,
              value: item.sma
            }));
            envelopeSeries.setData(envelopeData);
            upperSeries.setData(upperData);
            lowerSeries.setData(lowerData);
            smaSeries.setData(smaData);
            this.activeIndicators.set('envelope_area', envelopeSeries);
            this.activeIndicators.set('envelope_upper', upperSeries);
            this.activeIndicators.set('envelope_lower', lowerSeries);
            this.activeIndicators.set('envelope_sma', smaSeries);
            return true;
          }
          break;
        case 'vwap':
          indicatorData = VWAPIndicator.calculate(data);
          if (indicatorData.length > 0) {
            const series = chart.addSeries(LineSeries, {
              color: config?.color || '#E91E63',
              lineWidth: config?.lineWidth || 1,
              title: 'VWAP',
              priceScaleId: 'right'
            });
            series.setData(indicatorData);
            this.activeIndicators.set(indicatorId, series);
            return true;
          }
          break;
        default:
          return false;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public updateMASeriesStyle(period: number, style: { color?: string; lineWidth?: number }): boolean {
    try {
      const seriesId = `ma_${period}`;
      const series = this.activeIndicators.get(seriesId);
      if (series) {
        const options: any = {};
        if (style.color) options.color = style.color;
        if (style.lineWidth) options.lineWidth = style.lineWidth;

        series.applyOptions(options);
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public updateAllMASeriesStyles(styles: { [period: number]: { color?: string; lineWidth?: number } }): void {
    Object.entries(styles).forEach(([period, style]) => {
      this.updateMASeriesStyle(Number(period), style);
    });
  }

  getIndicatorSeriesByType(indicatorType: MainChartIndicatorType | null): ISeriesApi<any>[] {
    const series: ISeriesApi<any>[] = [];
    switch (indicatorType) {
      case MainChartIndicatorType.MA:
        this.activeIndicators.forEach((seriesItem, seriesId) => {
          if (seriesId.startsWith('ma_')) {
            series.push(seriesItem);
          }
        });
        break;
      case MainChartIndicatorType.EMA:
        this.activeIndicators.forEach((seriesItem, seriesId) => {
          if (seriesId.startsWith('ema') || seriesId === 'ema') {
            series.push(seriesItem);
          }
        });
        break;
      case MainChartIndicatorType.BOLLINGER:
        ['bollinger_middle', 'bollinger_upper', 'bollinger_lower'].forEach(seriesId => {
          const seriesItem = this.activeIndicators.get(seriesId);
          if (seriesItem) series.push(seriesItem);
        });
        break;
      case MainChartIndicatorType.ICHIMOKU:
        ['ichimoku_cloud', 'ichimoku_tenkan', 'ichimoku_kijun', 'ichimoku_chikou'].forEach(seriesId => {
          const seriesItem = this.activeIndicators.get(seriesId);
          if (seriesItem) series.push(seriesItem);
        });
        break;
      case MainChartIndicatorType.DONCHIAN:
        ['donchian_channel', 'donchian_upper', 'donchian_lower', 'donchian_middle'].forEach(seriesId => {
          const seriesItem = this.activeIndicators.get(seriesId);
          if (seriesItem) series.push(seriesItem);
        });
        break;
      case MainChartIndicatorType.ENVELOPE:
        ['envelope_area', 'envelope_upper', 'envelope_lower', 'envelope_sma'].forEach(seriesId => {
          const seriesItem = this.activeIndicators.get(seriesId);
          if (seriesItem) series.push(seriesItem);
        });
        break;
      case MainChartIndicatorType.VWAP:
        const vwapSeries = this.activeIndicators.get('vwap');
        if (vwapSeries) series.push(vwapSeries);
        break;
    }
    return series;
  }

  hideIndicator(chart: IChartApi, indicatorId: MainChartIndicatorType | null): boolean {
    try {
      const seriesList = this.getIndicatorSeriesByType(indicatorId);
      seriesList.forEach(series => {
        try {
          series.applyOptions({
            visible: false
          });
        } catch (error) {
          console.error(error);
        }
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  showIndicator(chart: IChartApi, indicatorId: MainChartIndicatorType | null): boolean {
    try {
      const seriesList = this.getIndicatorSeriesByType(indicatorId);
      seriesList.forEach(series => {
        try {
          series.applyOptions({
            visible: true
          });
        } catch (error) {
          console.error(error);
        }
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }


  removeIndicator(chart: IChartApi, indicatorId: MainChartIndicatorType): boolean {
    try {
      const compositeIndicators: { [key in MainChartIndicatorType]?: string[] } = {
        [MainChartIndicatorType.BOLLINGER]: ['bollinger_middle', 'bollinger_upper', 'bollinger_lower'],
        [MainChartIndicatorType.ICHIMOKU]: ['ichimoku_cloud', 'ichimoku_tenkan', 'ichimoku_kijun', 'ichimoku_chikou'],
        [MainChartIndicatorType.DONCHIAN]: ['donchian_channel', 'donchian_upper', 'donchian_lower', 'donchian_middle'],
        [MainChartIndicatorType.ENVELOPE]: ['envelope_area', 'envelope_upper', 'envelope_lower', 'envelope_sma'],
        [MainChartIndicatorType.MA]: []
      };
      const indicatorKey = indicatorId.toLowerCase();
      if (indicatorKey === 'ma') {
        const maSeriesIds = Array.from(this.activeIndicators.keys()).filter(id => id.startsWith('ma_'));
        maSeriesIds.forEach(seriesId => {
          const series = this.activeIndicators.get(seriesId);
          if (series) {
            chart.removeSeries(series);
            this.activeIndicators.delete(seriesId);
          }
        });
        return true;
      }
      else if (compositeIndicators[indicatorId]) {
        const seriesIds = compositeIndicators[indicatorId]!;
        seriesIds.forEach(seriesId => {
          const series = this.activeIndicators.get(seriesId);
          if (series) {
            chart.removeSeries(series);
            this.activeIndicators.delete(seriesId);
          }
        });
        return true;
      } else {
        const series = this.activeIndicators.get(indicatorKey);
        if (series) {
          chart.removeSeries(series);
          this.activeIndicators.delete(indicatorKey);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  removeAllIndicators(chart: IChartApi): void {
    this.activeIndicators.forEach((series, indicatorId) => {
      try {
        chart.removeSeries(series);
      } catch (error) {
        console.error(error);
      }
    });
    this.activeIndicators.clear();
  }

  getActiveIndicators(): string[] {
    const indicators = new Set<string>();
    this.activeIndicators.forEach((series, indicatorId) => {
      if (indicatorId.startsWith('bollinger_')) {
        indicators.add('bollinger');
      } else if (indicatorId.startsWith('ichimoku_')) {
        indicators.add('ichimoku');
      } else if (indicatorId.startsWith('donchian_')) {
        indicators.add('donchian');
      } else if (indicatorId.startsWith('envelope_')) {
        indicators.add('envelope');
      } else if (indicatorId.startsWith('ma_')) {
        indicators.add('ma');
      } else {
        indicators.add(indicatorId);
      }
    });
    return Array.from(indicators);
  }

  private getDefaultColor(index: number): string {
    const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return defaultColors[index % defaultColors.length];
  }

  updateMAConfig(config: Partial<MAConfig>): void {
    this.defaultMAConfig = {
      ...this.defaultMAConfig,
      ...config
    };
  }

  getMAConfig(): MAConfig {
    return { ...this.defaultMAConfig };
  }

  getIndicatorSeries(indicatorId: string): ISeriesApi<any>[] {
    const series: ISeriesApi<any>[] = [];
    if (indicatorId === 'ma') {
      this.activeIndicators.forEach((seriesItem, seriesId) => {
        if (seriesId.startsWith('ma_')) {
          series.push(seriesItem);
        }
      });
    } else {
      const compositeIndicators: { [key: string]: string[] } = {
        'bollinger': ['bollinger_middle', 'bollinger_upper', 'bollinger_lower'],
        'ichimoku': ['ichimoku_cloud', 'ichimoku_tenkan', 'ichimoku_kijun', 'ichimoku_chikou'],
        'donchian': ['donchian_channel', 'donchian_upper', 'donchian_lower', 'donchian_middle'],
        'envelope': ['envelope_area', 'envelope_upper', 'envelope_lower', 'envelope_sma']
      };
      const seriesIds = compositeIndicators[indicatorId] || [indicatorId];
      seriesIds.forEach(seriesId => {
        const seriesItem = this.activeIndicators.get(seriesId);
        if (seriesItem) {
          series.push(seriesItem);
        }
      });
    }
    return series;
  }

  // get the MA Y axis value at the mouse pointer X position
  getMAYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): { [key: string]: number } | null {
    try {
      const maValues: { [key: string]: number } = {};
      const entries = Array.from(this.activeIndicators.entries());
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);
      for (const [seriesId, series] of entries) {
        if (seriesId.startsWith('ma_')) {
          const period = seriesId.replace('ma_', '');
          try {
            const data = series.dataByIndex(roundedIndex);
            if (data && data.value !== undefined) {
              maValues[`MA${period}`] = data.value;
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
      return Object.keys(maValues).length > 0 ? maValues : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // get the EMA Y axis value at the mouse pointer X position
  getEMAYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): { [key: string]: number } | null {
    try {
      const emaValues: { [key: string]: number } = {};
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);
      const emaSeriesKeys = Array.from(this.activeIndicators.keys()).filter(key =>
        key.startsWith('ema') || key === 'ema'
      );
      if (emaSeriesKeys.length === 0) return null;
      for (const seriesKey of emaSeriesKeys) {
        const series = this.activeIndicators.get(seriesKey);
        if (series) {
          try {
            const data = series.dataByIndex(roundedIndex);
            if (data && data.value !== undefined) {
              let period = '20';
              const title = (series as any).options().title;
              if (title && typeof title === 'string') {
                const match = title.match(/EMA(\d+)/);
                if (match) period = match[1];
              }
              emaValues[`EMA${period}`] = data.value;
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
      return Object.keys(emaValues).length > 0 ? emaValues : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // get the BollingerBands Y axis value at the mouse pointer X position
  getBollingerBandsYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): { Middle: number, Upper: number, Lower: number } | null {
    try {
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);
      const middleSeries = this.activeIndicators.get('bollinger_middle');
      const upperSeries = this.activeIndicators.get('bollinger_upper');
      const lowerSeries = this.activeIndicators.get('bollinger_lower');
      if (!middleSeries || !upperSeries || !lowerSeries) return null;
      const middleData = middleSeries.dataByIndex(roundedIndex);
      const upperData = upperSeries.dataByIndex(roundedIndex);
      const lowerData = lowerSeries.dataByIndex(roundedIndex);
      if (middleData && middleData.value !== undefined &&
        upperData && upperData.value !== undefined &&
        lowerData && lowerData.value !== undefined) {
        return {
          Middle: middleData.value,
          Upper: upperData.value,
          Lower: lowerData.value
        };
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // get the Ichimoku Y axis value at the mouse pointer X position
  getIchimokuYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): {
    Tenkan: number,
    Kijun: number,
    Chikou: number,
    SenkouA: number,
    SenkouB: number
  } | null {
    try {
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);
      const tenkanSeries = this.activeIndicators.get('ichimoku_tenkan');
      const kijunSeries = this.activeIndicators.get('ichimoku_kijun');
      const chikouSeries = this.activeIndicators.get('ichimoku_chikou');
      const cloudSeries = this.activeIndicators.get('ichimoku_cloud');
      if (!tenkanSeries || !kijunSeries) return null;
      const tenkanData = tenkanSeries.dataByIndex(roundedIndex);
      const kijunData = kijunSeries.dataByIndex(roundedIndex);
      const chikouData = chikouSeries ? chikouSeries.dataByIndex(roundedIndex) : null;
      const cloudData = cloudSeries ? cloudSeries.dataByIndex(roundedIndex) as any : null;
      if (tenkanData && tenkanData.value !== undefined &&
        kijunData && kijunData.value !== undefined) {
        return {
          Tenkan: tenkanData.value,
          Kijun: kijunData.value,
          Chikou: chikouData && chikouData.value !== undefined ? chikouData.value : 0,
          SenkouA: cloudData && cloudData.value !== undefined ? cloudData.value : 0,
          SenkouB: cloudData && cloudData.value2 !== undefined ? cloudData.value2 : 0
        };
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // get the Donchian Channel Y axis value at the mouse pointer X position
  getDonchianChannelYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): {
    Upper: number,
    Lower: number,
    Middle: number
  } | null {
    try {
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);
      const upperSeries = this.activeIndicators.get('donchian_upper');
      const lowerSeries = this.activeIndicators.get('donchian_lower');
      const middleSeries = this.activeIndicators.get('donchian_middle');
      if (!upperSeries || !lowerSeries) return null;
      const upperData = upperSeries.dataByIndex(roundedIndex);
      const lowerData = lowerSeries.dataByIndex(roundedIndex);
      const middleData = middleSeries ? middleSeries.dataByIndex(roundedIndex) : null;
      if (upperData && upperData.value !== undefined &&
        lowerData && lowerData.value !== undefined) {
        return {
          Upper: upperData.value,
          Lower: lowerData.value,
          Middle: middleData && middleData.value !== undefined ? middleData.value : 0
        };
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // get the Envelope Y axis value at the mouse pointer X position
  getEnvelopeYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): {
    Upper: number,
    Lower: number,
    Middle: number
  } | null {
    try {
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);
      const upperSeries = this.activeIndicators.get('envelope_upper');
      const lowerSeries = this.activeIndicators.get('envelope_lower');
      const smaSeries = this.activeIndicators.get('envelope_sma');
      if (!upperSeries || !lowerSeries) return null;
      const upperData = upperSeries.dataByIndex(roundedIndex);
      const lowerData = lowerSeries.dataByIndex(roundedIndex);
      const smaData = smaSeries ? smaSeries.dataByIndex(roundedIndex) : null;
      if (upperData && upperData.value !== undefined &&
        lowerData && lowerData.value !== undefined) {
        return {
          Upper: upperData.value,
          Lower: lowerData.value,
          Middle: smaData && smaData.value !== undefined ? smaData.value : 0
        };
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // get the VWAP Y axis value at the mouse pointer X position
  getVWAPYAxisValueAtMouseX(mouseX: number, chart: IChartApi): number | null {
    try {
      const timeScale = chart.timeScale();
      const logicalIndex = timeScale.coordinateToLogical(mouseX);
      if (logicalIndex === null) return null;
      const roundedIndex = Math.round(logicalIndex);
      const series = this.activeIndicators.get('vwap');
      if (!series) return null;
      const data = series.dataByIndex(roundedIndex);
      return data && data.value !== undefined ? data.value : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

}