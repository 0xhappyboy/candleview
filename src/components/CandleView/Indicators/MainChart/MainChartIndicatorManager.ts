import { AreaSeries, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { BollingerBandsIndicator } from './BollingerBandsIndicator';
import { DonchianChannelIndicator } from './DonchianChannelIndicator';
import { EMAIndicator } from './EMAIndicator';
import { EnvelopeIndicator } from './EnvelopeIndicator';
import { IchimokuIndicator } from './IchimokuIndicator';
import { MAIndicator, MAConfig } from './MAIndicator';
import { VWAPIndicator } from './VWAPIndicator';

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
            colors: config?.colors || this.defaultMAConfig.colors
          };
          indicatorData = MAIndicator.calculate(data, maConfig.periods);
          if (indicatorData.length > 0) {
            maConfig.periods.forEach((period: number, index: number) => {
              const color = maConfig.colors?.[index] || this.getDefaultColor(index);
              const seriesId = `ma_${period}`;
              const series = chart.addSeries(LineSeries, {
                color: color,
                lineWidth: 2,
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
          indicatorData = EMAIndicator.calculate(data, config?.period || 20);
          if (indicatorData.length > 0) {
            const series = chart.addSeries(LineSeries, {
              color: config?.color || '#FF6B6B',
              lineWidth: 2,
              title: `EMA${config?.period || 20}`,
              priceScaleId: 'right'
            });
            series.setData(indicatorData);
            this.activeIndicators.set(indicatorId, series);
            return true;
          }
          break;
        case 'bollinger':
          indicatorData = BollingerBandsIndicator.calculate(data);
          if (indicatorData.length > 0) {
            const middleSeries = chart.addSeries(LineSeries, {
              color: config?.middleColor || '#2962FF',
              lineWidth: 1,
              title: 'BB Middle',
              priceScaleId: 'right'
            });
            const upperSeries = chart.addSeries(LineSeries, {
              color: config?.upperColor || '#FF6B6B',
              lineWidth: 1,
              title: 'BB Upper',
              priceScaleId: 'right'
            });
            const lowerSeries = chart.addSeries(LineSeries, {
              color: config?.lowerColor || '#FF6B6B',
              lineWidth: 1,
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
              lineWidth: 1,
              priceScaleId: 'right',
            });
            const kijunSeries = chart.addSeries(LineSeries, {
              color: config?.kijunColor || '#2962FF',
              lineWidth: 1,
              priceScaleId: 'right',
            });
            const chikouSeries = chart.addSeries(LineSeries, {
              color: config?.chikouColor || '#9C27B0',
              lineWidth: 1,
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
          indicatorData = DonchianChannelIndicator.calculate(data, config?.period || 20);
          if (indicatorData.length > 0) {
            const channelSeries = chart.addSeries(AreaSeries, {
              lineColor: 'transparent',
              topColor: config?.channelColor || 'rgba(33, 150, 243, 0.2)',
              bottomColor: config?.channelColor || 'rgba(33, 150, 243, 0.2)',
              priceScaleId: 'right',
            });
            const upperSeries = chart.addSeries(LineSeries, {
              color: config?.upperColor || '#2196F3',
              lineWidth: 1,
              priceScaleId: 'right',
            });
            const lowerSeries = chart.addSeries(LineSeries, {
              color: config?.lowerColor || '#2196F3',
              lineWidth: 1,
              priceScaleId: 'right',
            });
            const middleSeries = chart.addSeries(LineSeries, {
              color: config?.middleColor || '#FF9800',
              lineWidth: 1,
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
          indicatorData = EnvelopeIndicator.calculate(
            data,
            config?.period || 20,
            config?.percentage || 2.5
          );
          if (indicatorData.length > 0) {
            const envelopeSeries = chart.addSeries(AreaSeries, {
              lineColor: 'transparent',
              topColor: config?.envelopeColor || 'rgba(255, 152, 0, 0.2)',
              bottomColor: config?.envelopeColor || 'rgba(255, 152, 0, 0.2)',
              priceScaleId: 'right',
            });
            const upperSeries = chart.addSeries(LineSeries, {
              color: config?.upperColor || '#FF9800',
              lineWidth: 1,
              priceScaleId: 'right',
            });
            const lowerSeries = chart.addSeries(LineSeries, {
              color: config?.lowerColor || '#FF9800',
              lineWidth: 1,
              priceScaleId: 'right',
            });
            const smaSeries = chart.addSeries(LineSeries, {
              color: config?.smaColor || '#666666',
              lineWidth: 1,
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
              lineWidth: 2,
              title: 'VWAP',
              priceScaleId: 'right'
            });
            series.setData(indicatorData);
            this.activeIndicators.set(indicatorId, series);
            return true;
          }
          break;
        default:
          console.warn(`Unknown indicator: ${indicatorId}`);
          return false;
      }
      return false;
    } catch (error) {
      console.error(`Error adding indicator ${indicatorId}:`, error);
      return false;
    }
  }

  removeIndicator(chart: IChartApi, indicatorId: string): boolean {
    try {
      const compositeIndicators: { [key: string]: string[] } = {
        'bollinger': ['bollinger_middle', 'bollinger_upper', 'bollinger_lower'],
        'ichimoku': ['ichimoku_cloud', 'ichimoku_tenkan', 'ichimoku_kijun', 'ichimoku_chikou'],
        'donchian': ['donchian_channel', 'donchian_upper', 'donchian_lower', 'donchian_middle'],
        'envelope': ['envelope_area', 'envelope_upper', 'envelope_lower', 'envelope_sma'],
        'ma': []
      };
      if (indicatorId === 'ma') {
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
        compositeIndicators[indicatorId].forEach(seriesId => {
          const series = this.activeIndicators.get(seriesId);
          if (series) {
            chart.removeSeries(series);
            this.activeIndicators.delete(seriesId);
          }
        });
        return true;
      } else {
        const series = this.activeIndicators.get(indicatorId);
        if (series) {
          chart.removeSeries(series);
          this.activeIndicators.delete(indicatorId);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(`Error removing indicator ${indicatorId}:`, error);
      return false;
    }
  }

  removeAllIndicators(chart: IChartApi): void {
    this.activeIndicators.forEach((series, indicatorId) => {
      try {
        chart.removeSeries(series);
      } catch (error) {
        console.error(`Error removing indicator ${indicatorId}:`, error);
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
}