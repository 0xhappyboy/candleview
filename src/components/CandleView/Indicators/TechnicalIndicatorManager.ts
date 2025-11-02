import { IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';

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

  
  static calculateRSI(data: ChartData[], period: number = 14): any[] {
    if (data.length < period + 1) return [];

    const result = [];
    const gains: number[] = [];
    const losses: number[] = [];

    
    for (let i = 1; i < data.length; i++) {
      const change = (data[i].close || data[i].value) - (data[i - 1].close || data[i - 1].value);
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }

    
    let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

    
    if (avgLoss === 0) {
      result.push({
        time: data[period].time,
        value: 100
      });
    } else {
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      result.push({
        time: data[period].time,
        value: rsi
      });
    }

    
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

      if (avgLoss === 0) {
        result.push({
          time: data[i + 1].time,
          value: 100
        });
      } else {
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        result.push({
          time: data[i + 1].time,
          value: rsi
        });
      }
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

  
  static calculateMACD(data: ChartData[]): any[] {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    const result = [];

    
    const startIndex = Math.max(
      ema12.findIndex(item => item !== undefined),
      ema26.findIndex(item => item !== undefined)
    );

    for (let i = startIndex; i < Math.min(ema12.length, ema26.length); i++) {
      if (ema12[i] && ema26[i]) {
        const macd = ema12[i].value - ema26[i].value;
        result.push({
          time: ema26[i].time,
          value: macd
        });
      }
    }

    return result;
  }

  
  static calculateATR(data: ChartData[], period: number = 14): any[] {
    if (data.length < period + 1) return [];

    const result = [];
    const trueRanges: number[] = [];

    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];

      const high = current.high || current.value;
      const low = current.low || current.value;
      const previousClose = previous.close || previous.value;

      const tr1 = high - low;
      const tr2 = Math.abs(high - previousClose);
      const tr3 = Math.abs(low - previousClose);

      const trueRange = Math.max(tr1, tr2, tr3);
      trueRanges.push(trueRange);
    }

    
    let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;

    result.push({
      time: data[period].time,
      value: atr
    });

    
    for (let i = period; i < trueRanges.length; i++) {
      atr = (atr * (period - 1) + trueRanges[i]) / period;
      result.push({
        time: data[i + 1].time,
        value: atr
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

        case 'rsi':
          this.activeIndicators.set(indicatorId, null as any);
          return true;
          break;

        case 'macd':
          this.activeIndicators.set(indicatorId, null as any);
          return true;
          break;

        case 'atr':
          
          console.log('ATR indicator added (displayed in sub-chart only)');
          this.activeIndicators.set(indicatorId, null as any);
          return true;
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
      if (indicatorId === 'bollinger') {
        
        const middleSeries = this.activeIndicators.get('bollinger_middle');
        const upperSeries = this.activeIndicators.get('bollinger_upper');
        const lowerSeries = this.activeIndicators.get('bollinger_lower');

        if (middleSeries) this.chart.removeSeries(middleSeries);
        if (upperSeries) this.chart.removeSeries(upperSeries);
        if (lowerSeries) this.chart.removeSeries(lowerSeries);

        this.activeIndicators.delete('bollinger_middle');
        this.activeIndicators.delete('bollinger_upper');
        this.activeIndicators.delete('bollinger_lower');

        return true;
      } else {
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
      } else {
        indicators.add(indicatorId);
      }
    });

    return Array.from(indicators);
  }
}