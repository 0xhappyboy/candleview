import { AreaSeries, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';

export interface IndicatorConfig {
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

export class TechnicalIndicatorManager {
  private chart: IChartApi;
  private theme: any;
  private activeIndicators: Map<string, ISeriesApi<any>> = new Map();

  constructor(chart: IChartApi, theme: any) {
    this.chart = chart;
    this.theme = theme;
  }


  static calculateMA(data: ChartData[], period: number = 20): any[] {
    if (data.length < period) return [];

    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close || data[i - j].value;
      }
      result.push({
        time: data[i].time,
        value: sum / period
      });
    }
    return result;
  }


  static calculateEMA(data: ChartData[], period: number = 20): any[] {
    if (data.length === 0) return [];

    const result = [];
    const multiplier = 2 / (period + 1);
    let ema = data[0].close || data[0].value;

    result.push({
      time: data[0].time,
      value: ema
    });

    for (let i = 1; i < data.length; i++) {
      const value = data[i].close || data[i].value;
      ema = (value - ema) * multiplier + ema;
      result.push({
        time: data[i].time,
        value: ema
      });
    }
    return result;
  }

  static calculateBollingerBands(data: ChartData[], period: number = 20, multiplier: number = 2): any[] {
    if (data.length < period) return [];

    const result = [];

    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      const values = [];

      for (let j = 0; j < period; j++) {
        const value = data[i - j].close || data[i - j].value;
        sum += value;
        values.push(value);
      }

      const middle = sum / period;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - middle, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      result.push({
        time: data[i].time,
        middle: middle,
        upper: middle + (stdDev * multiplier),
        lower: middle - (stdDev * multiplier)
      });
    }

    return result;
  }



  // 新增：一目均衡表计算
  static calculateIchimoku(data: ChartData[]): any[] {
    if (data.length < 52) return [];

    const result = [];

    for (let i = 25; i < data.length; i++) {
      // 转换期 (9)
      const tenkanHigh = Math.max(...data.slice(i - 8, i + 1).map(d => d.high || d.value));
      const tenkanLow = Math.min(...data.slice(i - 8, i + 1).map(d => d.low || d.value));
      const tenkanSen = (tenkanHigh + tenkanLow) / 2;

      // 基准期 (26)
      const kijunHigh = Math.max(...data.slice(i - 25, i + 1).map(d => d.high || d.value));
      const kijunLow = Math.min(...data.slice(i - 25, i + 1).map(d => d.low || d.value));
      const kijunSen = (kijunHigh + kijunLow) / 2;

      // 先行跨度A (26)
      const senkouSpanA = (tenkanSen + kijunSen) / 2;

      // 先行跨度B (52)
      let senkouSpanB = 0;
      if (i >= 51) {
        const spanBHigh = Math.max(...data.slice(i - 51, i + 1).map(d => d.high || d.value));
        const spanBLow = Math.min(...data.slice(i - 51, i + 1).map(d => d.low || d.value));
        senkouSpanB = (spanBHigh + spanBLow) / 2;
      }

      // 延迟跨度 (26)
      const chikouSpan = data[Math.max(i - 25, 0)].close || data[Math.max(i - 25, 0)].value;

      result.push({
        time: data[i].time,
        tenkanSen,
        kijunSen,
        senkouSpanA,
        senkouSpanB,
        chikouSpan
      });
    }

    return result;
  }

  // 新增：唐奇安通道计算
  static calculateDonchianChannel(data: ChartData[], period: number = 20): any[] {
    if (data.length < period) return [];

    const result = [];

    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1);
      const highs = periodData.map(d => d.high || d.value);
      const lows = periodData.map(d => d.low || d.value);
      const upper = Math.max(...highs);
      const lower = Math.min(...lows);
      const middle = (upper + lower) / 2;

      result.push({
        time: data[i].time,
        upper,
        lower,
        middle
      });
    }

    return result;
  }

  // 新增：包络线计算
  static calculateEnvelope(data: ChartData[], period: number = 20, percentage: number = 2.5): any[] {
    if (data.length < period) return [];

    const result = [];

    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1);
      const values = periodData.map(d => d.close || d.value);
      const sma = values.reduce((sum, value) => sum + value, 0) / period;

      const upper = sma * (1 + percentage / 100);
      const lower = sma * (1 - percentage / 100);

      result.push({
        time: data[i].time,
        sma,
        upper,
        lower
      });
    }

    return result;
  }

  // 新增：VWAP计算
  static calculateVWAP(data: ChartData[]): any[] {
    if (data.length === 0) return [];

    const result = [];
    let cumulativeTPV = 0; // 典型价格 * 成交量累计
    let cumulativeVolume = 0;

    for (let i = 0; i < data.length; i++) {
      const typicalPrice = ((data[i].high || data[i].value) + (data[i].low || data[i].value) + (data[i].close || data[i].value)) / 3;
      const volume = data[i].value || 1000; // 默认成交量

      cumulativeTPV += typicalPrice * volume;
      cumulativeVolume += volume;

      const vwap = cumulativeTPV / cumulativeVolume;

      result.push({
        time: data[i].time,
        value: vwap
      });
    }

    return result;
  }


  addIndicator(indicatorId: string, data: ChartData[], config?: any): boolean {
    try {
      if (!this.chart) {
        console.error('Chart not initialized');
        return false;
      }

      let indicatorData: any[];

      switch (indicatorId) {
        case 'ma':
          indicatorData = TechnicalIndicatorManager.calculateMA(data, config?.period || 20);
          if (indicatorData.length > 0) {
            const series = this.chart.addSeries(LineSeries, {
              color: config?.color || '#2962FF',
              lineWidth: 2,
              title: `MA${config?.period || 20}`,
              priceScaleId: 'right'
            });
            series.setData(indicatorData);
            this.activeIndicators.set(indicatorId, series);
            return true;
          }
          break;

        case 'ema':
          indicatorData = TechnicalIndicatorManager.calculateEMA(data, config?.period || 20);
          if (indicatorData.length > 0) {
            const series = this.chart.addSeries(LineSeries, {
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
          indicatorData = TechnicalIndicatorManager.calculateBollingerBands(data);
          if (indicatorData.length > 0) {
            const middleSeries = this.chart.addSeries(LineSeries, {
              color: config?.middleColor || '#2962FF',
              lineWidth: 1,
              title: 'BB Middle',
              priceScaleId: 'right'
            });
            const upperSeries = this.chart.addSeries(LineSeries, {
              color: config?.upperColor || '#FF6B6B',
              lineWidth: 1,
              title: 'BB Upper',
              priceScaleId: 'right'
            });
            const lowerSeries = this.chart.addSeries(LineSeries, {
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

        // 新增：一目均衡表
        case 'ichimoku':
          indicatorData = TechnicalIndicatorManager.calculateIchimoku(data);
          if (indicatorData.length > 0) {
            // 云层 (先行跨度A和B之间的区域)
            const cloudSeries = this.chart.addSeries(AreaSeries, {
              lineColor: 'transparent',
              topColor: config?.cloudColor || 'rgba(76, 175, 80, 0.2)',
              bottomColor: config?.cloudColor || 'rgba(76, 175, 80, 0.2)',
              priceScaleId: 'right',
            });

            // 转换线
            const tenkanSeries = this.chart.addSeries(LineSeries, {
              color: config?.tenkanColor || '#FF6B6B',
              lineWidth: 1,
              priceScaleId: 'right',
            });

            // 基准线
            const kijunSeries = this.chart.addSeries(LineSeries, {
              color: config?.kijunColor || '#2962FF',
              lineWidth: 1,
              priceScaleId: 'right',
            });

            // 延迟跨度
            const chikouSeries = this.chart.addSeries(LineSeries, {
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

        // 新增：唐奇安通道
        case 'donchian':
          indicatorData = TechnicalIndicatorManager.calculateDonchianChannel(data, config?.period || 20);
          if (indicatorData.length > 0) {
            // 通道区域
            const channelSeries = this.chart.addSeries(AreaSeries, {
              lineColor: 'transparent',
              topColor: config?.channelColor || 'rgba(33, 150, 243, 0.2)',
              bottomColor: config?.channelColor || 'rgba(33, 150, 243, 0.2)',
              priceScaleId: 'right',
            });

            // 上轨
            const upperSeries = this.chart.addSeries(LineSeries, {
              color: config?.upperColor || '#2196F3',
              lineWidth: 1,
              priceScaleId: 'right',
            });

            // 下轨
            const lowerSeries = this.chart.addSeries(LineSeries, {
              color: config?.lowerColor || '#2196F3',
              lineWidth: 1,
              priceScaleId: 'right',
            });

            // 中轨
            const middleSeries = this.chart.addSeries(LineSeries, {
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

        // 新增：包络线
        case 'envelope':
          indicatorData = TechnicalIndicatorManager.calculateEnvelope(
            data,
            config?.period || 20,
            config?.percentage || 2.5
          );
          if (indicatorData.length > 0) {
            // 包络区域
            const envelopeSeries = this.chart.addSeries(AreaSeries, {
              lineColor: 'transparent',
              topColor: config?.envelopeColor || 'rgba(255, 152, 0, 0.2)',
              bottomColor: config?.envelopeColor || 'rgba(255, 152, 0, 0.2)',
              priceScaleId: 'right',
            });

            // 上轨
            const upperSeries = this.chart.addSeries(LineSeries, {
              color: config?.upperColor || '#FF9800',
              lineWidth: 1,
              priceScaleId: 'right',
            });

            // 下轨
            const lowerSeries = this.chart.addSeries(LineSeries, {
              color: config?.lowerColor || '#FF9800',
              lineWidth: 1,
              priceScaleId: 'right',
            });

            // 移动平均线
            const smaSeries = this.chart.addSeries(LineSeries, {
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

        // 新增：VWAP
        case 'vwap':
          indicatorData = TechnicalIndicatorManager.calculateVWAP(data);
          if (indicatorData.length > 0) {
            const series = this.chart.addSeries(LineSeries, {
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

  removeIndicator(indicatorId: string): boolean {
    try {
      // 处理复合指标（包含多个系列的指标）
      const compositeIndicators: { [key: string]: string[] } = {
        'bollinger': ['bollinger_middle', 'bollinger_upper', 'bollinger_lower'],
        'ichimoku': ['ichimoku_cloud', 'ichimoku_tenkan', 'ichimoku_kijun', 'ichimoku_chikou'],
        'donchian': ['donchian_channel', 'donchian_upper', 'donchian_lower', 'donchian_middle'],
        'envelope': ['envelope_area', 'envelope_upper', 'envelope_lower', 'envelope_sma']
      };

      if (compositeIndicators[indicatorId]) {
        // 移除复合指标的所有系列
        compositeIndicators[indicatorId].forEach(seriesId => {
          const series = this.activeIndicators.get(seriesId);
          if (series) {
            this.chart.removeSeries(series);
            this.activeIndicators.delete(seriesId);
          }
        });
        return true;
      } else {
        // 移除单个系列指标
        const series = this.activeIndicators.get(indicatorId);
        if (series) {
          this.chart.removeSeries(series);
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

  removeAllIndicators(): void {
    this.activeIndicators.forEach((series, indicatorId) => {
      try {
        this.chart.removeSeries(series);
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
      } else {
        indicators.add(indicatorId);
      }
    });

    return Array.from(indicators);
  }
}