import { IChartApi, LineSeries, ISeriesApi } from 'lightweight-charts';
import { ICandleViewDataPoint } from '../../types';
import { BaseIndicator } from './BaseIndicator';
import { MainChartIndicatorInfo } from './MainChartIndicatorInfo';

export class BollingerBandsIndicator extends BaseIndicator {
  private config: { period: number; multiplier: number } = { period: 20, multiplier: 2 };
  private _chart: IChartApi | null = null;
  private _renderer: any = null;
  private _indicatorData: any[] = [];
  private _isAttached: boolean = false;
  private _upperSeries: ISeriesApi<'Line'> | null = null;
  private _middleSeries: ISeriesApi<'Line'> | null = null;
  private _lowerSeries: ISeriesApi<'Line'> | null = null;
  private _lineWidth: number = 1;
  private _timeScale: any = null;
  private _mainChartIndicatorInfoMap: Map<string, MainChartIndicatorInfo> = new Map();

  hideSeries(): void {
    super.hideSeries();
    this.requestUpdate();
  }

  showSeries(): void {
    super.showSeries();
    this.requestUpdate();
  }

  isVisible(): boolean {
    if (this._middleSeries) {
      const options = this._middleSeries.options();
      return options.visible !== false;
    }
    return super.isVisible();
  }

  removeSeries(chart: IChartApi, seriesId: string): boolean {
    try {
      const result = super.removeSeries(chart, seriesId);
      if (seriesId === 'bollinger_middle' && this._middleSeries) {
        if (this._isAttached) {
          try {
            (this._middleSeries as any).detachPrimitive(this);
            this._isAttached = false;
          } catch (error) {
          }
        }
        this._middleSeries = null;
      }
      this.requestUpdate();
      return result;
    } catch (error) {
      return false;
    }
  }

  static calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    if (!mainChartIndicatorInfo?.params || data.length === 0) return [];
    const periodParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Period') ||
      mainChartIndicatorInfo.params.find(p => p.paramName === 'Middle');
    const multiplierParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Multiplier') ||
      mainChartIndicatorInfo.params.find(p => p.paramName === 'Upper');
    const period = periodParam?.paramValue ?? 20;
    const multiplier = multiplierParam?.paramValue ?? 2;
    const result: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const resultItem: any = { time: data[i].time };
      const availablePeriod = Math.min(period, i + 1);
      let sum = 0;
      const values = [];
      for (let j = 0; j < availablePeriod; j++) {
        const value = data[i - j].close;
        sum += value;
        values.push(value);
      }
      const middle = sum / availablePeriod;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - middle, 2), 0) / availablePeriod;
      const stdDev = Math.sqrt(variance);
      resultItem.middle = middle;
      resultItem.upper = middle + (stdDev * multiplier);
      resultItem.lower = middle - (stdDev * multiplier);
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
      this._chart = chart;
      this._timeScale = this._chart.timeScale();
      const filteredData = this.filterVirtualData(data);
      if (filteredData.length === 0 || !mainChartIndicatorInfo?.params) {
        return false;
      }
      this.updateParams(mainChartIndicatorInfo);
      this._indicatorData = this.calculate(filteredData, mainChartIndicatorInfo);
      if (mainChartIndicatorInfo.id) {
        this._mainChartIndicatorInfoMap.set(mainChartIndicatorInfo.id, mainChartIndicatorInfo);
      }
      const middleParam = mainChartIndicatorInfo.params.find(p => p.paramName.toLowerCase().includes('middle')) || mainChartIndicatorInfo.params[0];
      this._middleSeries = chart.addSeries(LineSeries, {
        color: middleParam.lineColor || '#2196F3',
        lineWidth: middleParam.lineWidth || this._lineWidth as any,
        title: 'BB Middle',
        priceScaleId: 'right',
        priceLineVisible: true,
        lastValueVisible: true,
      });
      const middleData = this._indicatorData.map(item => ({
        time: item.time,
        value: item.middle
      }));
      this._middleSeries.setData(middleData);
      this.activeSeries.set('bollinger_middle', this._middleSeries);
      this.attachChannelRenderer();
      chart.priceScale('right').applyOptions({
        scaleMargins: {
          top: 0.05,
          bottom: 0.1,
        },
      });
      setTimeout(() => {
        this.requestUpdate();
      }, 0);
      return true;
    } catch (error) {
      return false;
    }
  }

  private attachChannelRenderer(): void {
    if (this._middleSeries) {
      try {
        (this._middleSeries as any).attachPrimitive(this);
        this._isAttached = true;
      } catch (error) {
      }
    }
  }

  attached(param: any) {
    this._chart = param.chart;
    this.requestUpdate();
  }

  updateAllViews() {
    this.requestUpdate();
  }

  time() {
    return this._indicatorData.length > 0 ? this._indicatorData[0].time : 0;
  }

  priceValue() {
    return this._indicatorData.length > 0 ? this._indicatorData[0].middle : 0;
  }

  paneViews() {
    if (!this._renderer) {
      this._renderer = {
        draw: (target: any) => {
          const ctx = target.context ?? target._context;
          if (!ctx || !this._chart) return;
          const chartElement = this._chart.chartElement();
          if (!chartElement) return;
          const chartRect = chartElement.getBoundingClientRect();
          const width = chartRect.width;
          const height = chartRect.height - 29;
          if (width <= 0 || height <= 0) return;
          const mainChartIndicatorInfo = this._mainChartIndicatorInfoMap.size > 0
            ? Array.from(this._mainChartIndicatorInfoMap.values())[0]
            : undefined;
          this.drawChannelFill(ctx, mainChartIndicatorInfo);
        },
      };
    }
    return [{ renderer: () => this._renderer }];
  }

  private drawChannelFill(ctx: CanvasRenderingContext2D, mainChartIndicatorInfo?: MainChartIndicatorInfo): void {
    if (!this._chart || !this._middleSeries || this._indicatorData.length === 0) {
      return;
    }
    if (!this.isVisible()) {
      return;
    }
    const timeVisibleRange = this._timeScale.getVisibleRange();
    if (!timeVisibleRange) return;
    const visibleData = this._indicatorData.filter(item =>
      item.time >= timeVisibleRange.from &&
      item.time <= timeVisibleRange.to
    );
    if (visibleData.length === 0) return;
    const upperColor = this.getParamColor(mainChartIndicatorInfo, 'Upper') || '#26a69a';
    const middleColor = this.getParamColor(mainChartIndicatorInfo, 'Middle') || '#2196F3';
    const lowerColor = this.getParamColor(mainChartIndicatorInfo, 'Lower') || '#ef5350';
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = upperColor;
    ctx.lineWidth = this._lineWidth;
    let isFirstUpper = true;
    for (const item of visibleData) {
      const x = this._timeScale.timeToCoordinate(item.time);
      const y = this._middleSeries.priceToCoordinate(item.upper);
      if (x === null || y === null) continue;
      if (isFirstUpper) {
        ctx.moveTo(x, y);
        isFirstUpper = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = middleColor;
    ctx.lineWidth = this._lineWidth;
    let isFirstMiddle = true;
    for (const item of visibleData) {
      const x = this._timeScale.timeToCoordinate(item.time);
      const y = this._middleSeries.priceToCoordinate(item.middle);
      if (x === null || y === null) continue;
      if (isFirstMiddle) {
        ctx.moveTo(x, y);
        isFirstMiddle = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = lowerColor;
    ctx.lineWidth = this._lineWidth;
    let isFirstLower = true;
    for (const item of visibleData) {
      const x = this._timeScale.timeToCoordinate(item.time);
      const y = this._middleSeries.priceToCoordinate(item.lower);
      if (x === null || y === null) continue;
      if (isFirstLower) {
        ctx.moveTo(x, y);
        isFirstLower = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    if (visibleData.length > 1) {
      ctx.beginPath();
      for (let i = 0; i < visibleData.length; i++) {
        const item = visibleData[i];
        const x = this._timeScale.timeToCoordinate(item.time);
        const y = this._middleSeries.priceToCoordinate(item.upper);
        if (x === null || y === null) continue;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      for (let i = visibleData.length - 1; i >= 0; i--) {
        const item = visibleData[i];
        const x = this._timeScale.timeToCoordinate(item.time);
        const y = this._middleSeries.priceToCoordinate(item.middle);
        if (x === null || y === null) continue;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = this.hexToRgba(upperColor, 0.2);
      ctx.fill();
    }
    if (visibleData.length > 1) {
      ctx.beginPath();
      for (let i = 0; i < visibleData.length; i++) {
        const item = visibleData[i];
        const x = this._timeScale.timeToCoordinate(item.time);
        const y = this._middleSeries.priceToCoordinate(item.middle);
        if (x === null || y === null) continue;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      for (let i = visibleData.length - 1; i >= 0; i--) {
        const item = visibleData[i];
        const x = this._timeScale.timeToCoordinate(item.time);
        const y = this._middleSeries.priceToCoordinate(item.lower);
        if (x === null || y === null) continue;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = this.hexToRgba(lowerColor, 0.2);
      ctx.fill();
    }
    ctx.restore();
  }

  private getParamColor(mainChartIndicatorInfo: MainChartIndicatorInfo | undefined, paramName: string): string | null {
    if (!mainChartIndicatorInfo?.params) return null;
    const param = mainChartIndicatorInfo.params.find(p => p.paramName === paramName);
    return param?.lineColor || null;
  }

  private hexToRgba(hex: string, alpha: number): string {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
        this.requestUpdate();
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
        const periodParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Period') ||
          mainChartIndicatorInfo.params.find(p => p.paramName === 'Middle');
        const multiplierParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Multiplier') ||
          mainChartIndicatorInfo.params.find(p => p.paramName === 'Upper');

        if (periodParam) this.config.period = periodParam.paramValue;
        if (multiplierParam) this.config.multiplier = multiplierParam.paramValue;
        this.requestUpdate();
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  updateData(data: ICandleViewDataPoint[], mainChartIndicatorInfo: MainChartIndicatorInfo): boolean {
    try {
      const filteredData = this.filterVirtualData(data);
      if (filteredData.length === 0 || !mainChartIndicatorInfo?.params) {
        return false;
      }
      if (mainChartIndicatorInfo.id) {
        this._mainChartIndicatorInfoMap.set(mainChartIndicatorInfo.id, mainChartIndicatorInfo);
      }
      this._indicatorData = this.calculate(filteredData, mainChartIndicatorInfo);
      const upperData = this._indicatorData.map(item => ({
        time: item.time,
        value: item.upper
      })).filter(item => item.value !== undefined && item.value !== null);
      const middleData = this._indicatorData.map(item => ({
        time: item.time,
        value: item.middle
      })).filter(item => item.value !== undefined && item.value !== null);
      const lowerData = this._indicatorData.map(item => ({
        time: item.time,
        value: item.lower
      })).filter(item => item.value !== undefined && item.value !== null);
      if (this._upperSeries) this._upperSeries.setData(upperData);
      if (this._middleSeries) this._middleSeries.setData(middleData);
      if (this._lowerSeries) this._lowerSeries.setData(lowerData);
      this.requestUpdate();
      return true;
    } catch (error) {
      return false;
    }
  }

  getYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): { [key: string]: number } | null {
    try {
      const bbValues: { [key: string]: number } = {};
      const timeScale = chart.timeScale();
      const time = timeScale.coordinateToTime(mouseX);
      if (time === null) return null;
      const dataPoint = this._indicatorData.find(item => item.time === time);
      if (!dataPoint) return null;
      if (dataPoint.upper !== undefined && dataPoint.upper !== null) {
        bbValues['Upper'] = dataPoint.upper;
      }
      if (dataPoint.middle !== undefined && dataPoint.middle !== null) {
        bbValues['Middle'] = dataPoint.middle;
      }
      if (dataPoint.lower !== undefined && dataPoint.lower !== null) {
        bbValues['Lower'] = dataPoint.lower;
      }
      return Object.keys(bbValues).length > 0 ? bbValues : null;
    } catch (error) {
      return null;
    }
  }

  getConfig(): { period: number; multiplier: number } {
    return { ...this.config };
  }

  private requestUpdate(): void {
    if (this._chart && this._isAttached) {
      try {
        if ((this._chart as any)._internal__paneUpdate) {
          (this._chart as any)._internal__paneUpdate();
        }
      } catch (error) {
      }
    }
  }

  destroy(): void {
    if (this._isAttached && this._upperSeries) {
      try {
        (this._upperSeries as any).detachPrimitive(this);
        this._isAttached = false;
      } catch (error) {
      }
    }
    if (this._chart) {
      if (this._upperSeries) {
        this._chart.removeSeries(this._upperSeries);
      }
      if (this._middleSeries) {
        this._chart.removeSeries(this._middleSeries);
      }
      if (this._lowerSeries) {
        this._chart.removeSeries(this._lowerSeries);
      }
    }
    this._chart = null;
    this._renderer = null;
    this._indicatorData = [];
    this._upperSeries = null;
    this._middleSeries = null;
    this._lowerSeries = null;
    this._timeScale = null;
    this.activeSeries.clear();
    this._mainChartIndicatorInfoMap.clear();
  }
}
