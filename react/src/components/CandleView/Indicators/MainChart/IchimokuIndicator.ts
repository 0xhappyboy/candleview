import { IChartApi, LineSeries, ISeriesApi } from 'lightweight-charts';
import { ICandleViewDataPoint } from '../../types';
import { BaseIndicator } from './BaseIndicator';
import { MainChartIndicatorInfo } from './MainChartIndicatorInfo';

export class IchimokuIndicator extends BaseIndicator {
  private config: {
    conversionPeriod: number;
    basePeriod: number;
    leadingSpanPeriod: number;
    laggingSpanPeriod: number;
  } = {
      conversionPeriod: 9,
      basePeriod: 26,
      leadingSpanPeriod: 52,
      laggingSpanPeriod: 26
    };
  private _chart: IChartApi | null = null;
  private _renderer: any = null;
  private _indicatorData: any[] = [];
  private _isAttached: boolean = false;
  private _timeScale: any = null;
  private _mainChartIndicatorInfoMap: Map<string, MainChartIndicatorInfo> = new Map();
  private _tenkanSeries: ISeriesApi<'Line'> | null = null;
  private _kijunSeries: ISeriesApi<'Line'> | null = null;
  private _chikouSeries: ISeriesApi<'Line'> | null = null;
  private _senkouASeries: ISeriesApi<'Line'> | null = null;
  private _senkouBSeries: ISeriesApi<'Line'> | null = null;
  private _lineWidth: number = 2;

  hideSeries(): void {
    super.hideSeries();
    this.requestUpdate();
  }

  showSeries(): void {
    super.showSeries();
    this.requestUpdate();
  }

  isVisible(): boolean {
    if (this._tenkanSeries) {
      const options = this._tenkanSeries.options();
      return options.visible !== false;
    }
    return super.isVisible();
  }

  removeSeries(chart: IChartApi, seriesId: string): boolean {
    try {
      const result = super.removeSeries(chart, seriesId);
      if (seriesId === 'ichimoku_tenkan' && this._tenkanSeries) {
        if (this._isAttached) {
          try {
            (this._tenkanSeries as any).detachPrimitive(this);
            this._isAttached = false;
          } catch (error) {
          }
        }
        this._tenkanSeries = null;
      } else if (seriesId === 'ichimoku_kijun') {
        this._kijunSeries = null;
      } else if (seriesId === 'ichimoku_chikou') {
        this._chikouSeries = null;
      } else if (seriesId === 'ichimoku_senkou_a') {
        this._senkouASeries = null;
      } else if (seriesId === 'ichimoku_senkou_b') {
        this._senkouBSeries = null;
      }
      this.requestUpdate();
      return result;
    } catch (error) {
      return false;
    }
  }

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
      this.createSeries(chart, mainChartIndicatorInfo);
      this.updateSeriesData();
      chart.priceScale('right').applyOptions({
        scaleMargins: {
          top: 0.05,
          bottom: 0.1,
        },
      });
      this.attachCloudRenderer();
      setTimeout(() => {
        this.requestUpdate();
      }, 0);
      return true;
    } catch (error) {
      return false;
    }
  }

  private createSeries(chart: IChartApi, mainChartIndicatorInfo: MainChartIndicatorInfo): void {
    const params = mainChartIndicatorInfo.params || [];
    const tenkanParam = params.find(p => p.paramName.toLowerCase().includes('tenkan')) || params[0];
    this._tenkanSeries = chart.addSeries(LineSeries, {
      color: tenkanParam.lineColor || '#FF6B6B',
      lineWidth: tenkanParam.lineWidth || this._lineWidth as any,
      title: 'Tenkan',
      priceScaleId: 'right',
      priceLineVisible: true,
      lastValueVisible: true,
    });
    this.activeSeries.set('ichimoku_tenkan', this._tenkanSeries);
    const kijunParam = params.find(p => p.paramName.toLowerCase().includes('kijun')) || params[1] || params[0];
    this._kijunSeries = chart.addSeries(LineSeries, {
      color: kijunParam.lineColor || '#4ECDC4',
      lineWidth: kijunParam.lineWidth || this._lineWidth as any,
      title: 'Kijun',
      priceScaleId: 'right',
      priceLineVisible: true,
      lastValueVisible: true,
    });
    this.activeSeries.set('ichimoku_kijun', this._kijunSeries);
    const chikouParam = params.find(p => p.paramName.toLowerCase().includes('chikou')) || params[2] || params[0];
    this._chikouSeries = chart.addSeries(LineSeries, {
      color: chikouParam.lineColor || '#FFD166',
      lineWidth: chikouParam.lineWidth || this._lineWidth as any,
      title: 'Chikou',
      priceScaleId: 'right',
      priceLineVisible: true,
      lastValueVisible: true,
    });
    this.activeSeries.set('ichimoku_chikou', this._chikouSeries);
    const senkouAParam = params.find(p => p.paramName.toLowerCase().includes('senkoua') || p.paramName.toLowerCase().includes('senkou a')) || params[3] || params[0];
    this._senkouASeries = chart.addSeries(LineSeries, {
      color: senkouAParam.lineColor || '#96CEB4',
      lineWidth: senkouAParam.lineWidth || this._lineWidth as any,
      title: 'Senkou A',
      priceScaleId: 'right',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    this.activeSeries.set('ichimoku_senkou_a', this._senkouASeries);
    const senkouBParam = params.find(p => p.paramName.toLowerCase().includes('senkoub') || p.paramName.toLowerCase().includes('senkou b')) || params[4] || params[0];
    this._senkouBSeries = chart.addSeries(LineSeries, {
      color: senkouBParam.lineColor || '#FFA69E',
      lineWidth: senkouBParam.lineWidth || this._lineWidth as any,
      title: 'Senkou B',
      priceScaleId: 'right',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    this.activeSeries.set('ichimoku_senkou_b', this._senkouBSeries);
  }

  private updateSeriesData(): void {
    if (!this._indicatorData.length) return;
    const tenkanData = this._indicatorData
      .map(item => ({ time: item.time, value: item.tenkanSen }))
      .filter(item => item.value !== undefined && item.value !== null);
    const kijunData = this._indicatorData
      .map(item => ({ time: item.time, value: item.kijunSen }))
      .filter(item => item.value !== undefined && item.value !== null);
    const chikouData = this._indicatorData
      .map(item => ({ time: item.time, value: item.chikouSpan }))
      .filter(item => item.value !== undefined && item.value !== null);
    const senkouAData = this._indicatorData
      .map(item => ({ time: item.time, value: item.senkouSpanA }))
      .filter(item => item.value !== undefined && item.value !== null);
    const senkouBData = this._indicatorData
      .map(item => ({ time: item.time, value: item.senkouSpanB }))
      .filter(item => item.value !== undefined && item.value !== null);
    if (this._tenkanSeries) this._tenkanSeries.setData(tenkanData);
    if (this._kijunSeries) this._kijunSeries.setData(kijunData);
    if (this._chikouSeries) this._chikouSeries.setData(chikouData);
    if (this._senkouASeries) this._senkouASeries.setData(senkouAData);
    if (this._senkouBSeries) this._senkouBSeries.setData(senkouBData);
  }

  private attachCloudRenderer(): void {
    if (this._tenkanSeries) {
      try {
        (this._tenkanSeries as any).attachPrimitive(this);
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
    return this._indicatorData.length > 0 ? this._indicatorData[0].tenkanSen || 0 : 0;
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
          this.drawCloudFill(ctx, mainChartIndicatorInfo);
        },
      };
    }
    return [{ renderer: () => this._renderer }];
  }

  private drawCloudFill(ctx: CanvasRenderingContext2D, mainChartIndicatorInfo?: MainChartIndicatorInfo): void {
    if (!this._chart || !this._senkouASeries || !this._senkouBSeries || this._indicatorData.length === 0) {
      return;
    }
    if (!this.isVisible()) {
      return;
    }
    const timeVisibleRange = this._timeScale.getVisibleRange();
    if (!timeVisibleRange) return;
    const visibleData = this._indicatorData.filter(item =>
      item.time >= timeVisibleRange.from &&
      item.time <= timeVisibleRange.to &&
      item.senkouSpanA !== undefined &&
      item.senkouSpanB !== undefined
    );
    if (visibleData.length === 0) return;
    const senkouAColor = this.getParamColor(mainChartIndicatorInfo, 'SenkouA') || '#96CEB4';
    const senkouBColor = this.getParamColor(mainChartIndicatorInfo, 'SenkouB') || '#FFA69E';
    ctx.save();
    if (visibleData.length > 1) {
      ctx.beginPath();
      for (let i = 0; i < visibleData.length; i++) {
        const item = visibleData[i];
        const x = this._timeScale.timeToCoordinate(item.time);
        const upperValue = Math.max(item.senkouSpanA, item.senkouSpanB);
        const y = this._senkouASeries!.priceToCoordinate(upperValue);
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
        const lowerValue = Math.min(item.senkouSpanA, item.senkouSpanB);
        const y = this._senkouASeries!.priceToCoordinate(lowerValue);
        if (x === null || y === null) continue;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      const firstItem = visibleData[0];
      const fillColor = firstItem.senkouSpanA >= firstItem.senkouSpanB
        ? this.hexToRgba(senkouAColor, 0.3)
        : this.hexToRgba(senkouBColor, 0.3);
      ctx.fillStyle = fillColor;
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
        const conversionParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Tenkan');
        const baseParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Kijun');
        const leadingParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Senkou');
        const laggingParam = mainChartIndicatorInfo.params.find(p => p.paramName === 'Chikou');
        if (conversionParam) this.config.conversionPeriod = conversionParam.paramValue;
        if (baseParam) this.config.basePeriod = baseParam.paramValue;
        if (leadingParam) this.config.leadingSpanPeriod = leadingParam.paramValue;
        if (laggingParam) this.config.laggingSpanPeriod = laggingParam.paramValue;
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
      this.updateSeriesData();
      this.requestUpdate();
      return true;
    } catch (error) {
      return false;
    }
  }

  getYAxisValuesAtMouseX(mouseX: number, chart: IChartApi): { [key: string]: number } | null {
    try {
      const ichimokuValues: { [key: string]: number } = {};
      const timeScale = chart.timeScale();
      for (const data of this._indicatorData) {
        const x = timeScale.timeToCoordinate(data.time);
        if (x !== null && Math.abs(x - mouseX) < 10) {
          ichimokuValues['Tenkan'] = data.tenkanSen || 0;
          ichimokuValues['Kijun'] = data.kijunSen || 0;
          ichimokuValues['Chikou'] = data.chikouSpan || 0;
          ichimokuValues['SenkouA'] = data.senkouSpanA || 0;
          ichimokuValues['SenkouB'] = data.senkouSpanB || 0;
          return ichimokuValues;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private getLineTitle(lineType: string): string {
    const titles: { [key: string]: string } = {
      tenkan: 'Tenkan',
      kijun: 'Kijun',
      chikou: 'Chikou',
      senkou_a: 'Senkou A',
      senkou_b: 'Senkou B'
    };
    return titles[lineType] || lineType;
  }

  getConfig(): { conversionPeriod: number; basePeriod: number; leadingSpanPeriod: number; laggingSpanPeriod: number } {
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
    if (this._isAttached && this._tenkanSeries) {
      try {
        (this._tenkanSeries as any).detachPrimitive(this);
        this._isAttached = false;
      } catch (error) {
      }
    }
    if (this._chart) {
      const seriesToRemove = [
        this._tenkanSeries,
        this._kijunSeries,
        this._chikouSeries,
        this._senkouASeries,
        this._senkouBSeries
      ];
      seriesToRemove.forEach(series => {
        if (series) {
          this._chart!.removeSeries(series);
        }
      });
    }
    this._chart = null;
    this._renderer = null;
    this._indicatorData = [];
    this._tenkanSeries = null;
    this._kijunSeries = null;
    this._chikouSeries = null;
    this._senkouASeries = null;
    this._senkouBSeries = null;
    this._timeScale = null;
    this.activeSeries.clear();
    this._mainChartIndicatorInfoMap.clear();
  }
}
