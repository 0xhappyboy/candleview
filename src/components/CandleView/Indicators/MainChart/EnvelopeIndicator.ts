import { IChartApi, LineSeries, ISeriesApi } from 'lightweight-charts';
import { ICandleViewDataPoint } from '../../types';
import { BaseIndicator } from './BaseIndicator';
import { MainChartIndicatorInfo } from './MainChartIndicatorInfo';

export class EnvelopeIndicator extends BaseIndicator {
  private config: { period: number; percentage: number } = { period: 20, percentage: 2.5 };
  private _chart: IChartApi | null = null;
  private _renderer: any = null;
  private _indicatorData: any[] = [];
  private _isAttached: boolean = false;
  private _upperSeries: ISeriesApi<'Line'> | null = null;
  private _middleSeries: ISeriesApi<'Line'> | null = null;
  private _lowerSeries: ISeriesApi<'Line'> | null = null;
  private _lineWidth: number = 2;
  private _timeScale: any = null;
  private _mainChartIndicatorInfoMap: Map<string, MainChartIndicatorInfo> = new Map();

  static calculate(data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): any[] {
    if (!mainChartIndicatorInfo?.params || data.length === 0) return [];
    const periodParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Period');
    const percentageParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Percentage');
    const period = periodParam?.paramValue || 20;
    const percentage = percentageParam?.paramValue || 2.5;
    const result: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const resultItem: any = { time: data[i].time };
      const availablePeriod = Math.min(period, i + 1);
      let sum = 0;
      for (let j = 0; j < availablePeriod; j++) {
        sum += data[i - j].close;
      }
      const sma = sum / availablePeriod;
      const upper = sma * (1 + percentage / 100);
      const lower = sma * (1 - percentage / 100);
      resultItem.sma = sma;
      resultItem.upper = upper;
      resultItem.lower = lower;
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
      const upperParam = mainChartIndicatorInfo.params.find(p => p.paramName.toLowerCase().includes('upper')) || mainChartIndicatorInfo.params[0];
      const middleParam = mainChartIndicatorInfo.params.find(p => p.paramName.toLowerCase().includes('middle') || p.paramName.toLowerCase().includes('sma')) || mainChartIndicatorInfo.params[0];
      const lowerParam = mainChartIndicatorInfo.params.find(p => p.paramName.toLowerCase().includes('lower')) || mainChartIndicatorInfo.params[0];
      this._upperSeries = chart.addSeries(LineSeries, {
        color: upperParam.lineColor || '#26a69a',
        lineWidth: upperParam.lineWidth || this._lineWidth as any,
        title: 'Envelope Upper',
        priceScaleId: 'right',
        priceLineVisible: true,
        lastValueVisible: true,
      });
      this._middleSeries = chart.addSeries(LineSeries, {
        color: middleParam.lineColor || '#2196F3',
        lineWidth: middleParam.lineWidth || this._lineWidth as any,
        title: 'Envelope SMA',
        priceScaleId: 'right',
        priceLineVisible: true,
        lastValueVisible: true,
      });
      this._lowerSeries = chart.addSeries(LineSeries, {
        color: lowerParam.lineColor || '#ef5350',
        lineWidth: lowerParam.lineWidth || this._lineWidth as any,
        title: 'Envelope Lower',
        priceScaleId: 'right',
        priceLineVisible: true,
        lastValueVisible: true,
      });
      const upperData = this._indicatorData.map(item => ({
        time: item.time,
        value: item.upper
      }));
      const middleData = this._indicatorData.map(item => ({
        time: item.time,
        value: item.sma
      }));
      const lowerData = this._indicatorData.map(item => ({
        time: item.time,
        value: item.lower
      }));
      this._upperSeries.setData(upperData);
      this._middleSeries.setData(middleData);
      this._lowerSeries.setData(lowerData);
      this.activeSeries.set('envelope_upper', this._upperSeries);
      this.activeSeries.set('envelope_middle', this._middleSeries);
      this.activeSeries.set('envelope_lower', this._lowerSeries);
      this.attachEnvelopeRenderer();
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

  private attachEnvelopeRenderer(): void {
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
    return this._indicatorData.length > 0 ? this._indicatorData[0].sma : 0;
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
          this.drawEnvelopeFill(ctx, mainChartIndicatorInfo);
        },
      };
    }
    return [{ renderer: () => this._renderer }];
  }

  private drawEnvelopeFill(ctx: CanvasRenderingContext2D, mainChartIndicatorInfo?: MainChartIndicatorInfo): void {
    if (!this._chart || !this._middleSeries || this._indicatorData.length === 0) {
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
      const y = this._middleSeries.priceToCoordinate(item.sma);
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
        const y = this._middleSeries.priceToCoordinate(item.sma);
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
        const y = this._middleSeries.priceToCoordinate(item.sma);
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
        const periodParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Period');
        const percentageParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Percentage');
        if (periodParam) this.config.period = periodParam.paramValue;
        if (percentageParam) this.config.percentage = percentageParam.paramValue;
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
        value: item.sma
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
              const displayName = `Envelope ${lineType.charAt(0).toUpperCase() + lineType.slice(1)}`;
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

  getConfig(): { period: number; percentage: number } {
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
    if (this._isAttached && this._middleSeries) {
      try {
        (this._middleSeries as any).detachPrimitive(this);
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