import { IChartApi, ISeriesApi } from 'lightweight-charts';
import { ICandleViewDataPoint, MainChartIndicatorType } from '../../types';
import { BaseIndicator } from './BaseIndicator';
import { MAIndicator } from './MAIndicator';
import { EMAIndicator } from './EMAIndicator';
import { BollingerBandsIndicator } from './BollingerBandsIndicator';
import { IchimokuIndicator } from './IchimokuIndicator';
import { DonchianChannelIndicator } from './DonchianChannelIndicator';
import { EnvelopeIndicator } from './EnvelopeIndicator';
import { VWAPIndicator } from './VWAPIndicator';
import { ChartLayer } from '../../ChartLayer';
import { MainChartIndicatorInfo } from './MainChartIndicatorInfo';

export class MainChartTechnicalIndicatorManager {
  private theme: any;
  private indicators: Map<MainChartIndicatorType, BaseIndicator> = new Map();

  constructor(theme: any) {
    this.theme = theme;
    this.initializeIndicators();
  }

  private initializeIndicators(): void {
    this.indicators.set(MainChartIndicatorType.MA, new MAIndicator(this.theme));
    this.indicators.set(MainChartIndicatorType.EMA, new EMAIndicator(this.theme));
    this.indicators.set(MainChartIndicatorType.BOLLINGER, new BollingerBandsIndicator(this.theme));
    this.indicators.set(MainChartIndicatorType.ICHIMOKU, new IchimokuIndicator(this.theme));
    this.indicators.set(MainChartIndicatorType.DONCHIAN, new DonchianChannelIndicator(this.theme));
    this.indicators.set(MainChartIndicatorType.ENVELOPE, new EnvelopeIndicator(this.theme));
    this.indicators.set(MainChartIndicatorType.VWAP, new VWAPIndicator(this.theme));
  }

  addIndicator(chart: IChartApi, mainChartIndicatorType: MainChartIndicatorType, data: ICandleViewDataPoint[], mainChartIndicatorInfo?: MainChartIndicatorInfo): boolean {
    try {
      const indicator = this.indicators.get(mainChartIndicatorType);
      if (!indicator) {
        return false;
      }
      return indicator.addSeries(chart, data, mainChartIndicatorInfo);
    } catch (error) {
      return false;
    }
  }

  removeIndicator(chart: IChartApi, mainChartIndicatorType: MainChartIndicatorType): boolean {
    try {
      const indicator = this.indicators.get(mainChartIndicatorType);
      if (!indicator) {
        return false;
      }
      indicator.removeAllSeries(chart);
      return true;
    } catch (error) {
      return false;
    }
  }

  removeAllIndicators(chart: IChartApi): void {
    this.indicators.forEach(indicator => {
      indicator.removeAllSeries(chart);
    });
  }

  public updateAllMainChartIndicatorData(chartLayer: ChartLayer, mainChartIndicatorInfo: MainChartIndicatorInfo): boolean {
    try {
      let allSuccess = true;
      this.indicators.forEach((indicator, indicatorType) => {
        if (indicator.getAllSeries().length > 0) {
          const success = indicator.updateData(chartLayer.props.chartData, mainChartIndicatorInfo);
          if (!success) {
            allSuccess = false;
          }
        }
      });
      return allSuccess;
    } catch (error) {
      return false;
    }
  }

  public updateMainChartIndicatorData(mainChartIndicatorType: MainChartIndicatorType, data: ICandleViewDataPoint[], mainChartIndicatorInfo: MainChartIndicatorInfo): boolean {
    try {
      const indicator = this.indicators.get(mainChartIndicatorType);
      if (!indicator) {
        return false;
      }
      return indicator.updateData(data, mainChartIndicatorInfo);
    } catch (error) {
      return false;
    }
  }

  public updateMainChartIndicator = (chartLayer: ChartLayer, updatedIndicator: MainChartIndicatorInfo) => {
    if (!chartLayer.props.chart) {
      return;
    }
    if (!updatedIndicator.params) {
      return;
    }
    try {
      if (updatedIndicator.type) {
        this.removeIndicator(chartLayer.props.chart, updatedIndicator.type);
      }
      switch (updatedIndicator.type) {
        case MainChartIndicatorType.MA:
          this.addIndicator(chartLayer.props.chart, MainChartIndicatorType.MA, chartLayer.props.chartData, updatedIndicator);
          break;
        case MainChartIndicatorType.EMA:
          this.addIndicator(chartLayer.props.chart, MainChartIndicatorType.EMA, chartLayer.props.chartData, updatedIndicator);
          break;
        case MainChartIndicatorType.BOLLINGER:
          this.addIndicator(chartLayer.props.chart, MainChartIndicatorType.BOLLINGER, chartLayer.props.chartData, updatedIndicator);
          break;
        case MainChartIndicatorType.ICHIMOKU:
          this.addIndicator(chartLayer.props.chart, MainChartIndicatorType.ICHIMOKU, chartLayer.props.chartData, updatedIndicator);
          break;
        case MainChartIndicatorType.DONCHIAN:
          this.addIndicator(chartLayer.props.chart, MainChartIndicatorType.DONCHIAN, chartLayer.props.chartData, updatedIndicator);
          break;
        case MainChartIndicatorType.ENVELOPE:
          this.addIndicator(chartLayer.props.chart, MainChartIndicatorType.ENVELOPE, chartLayer.props.chartData, updatedIndicator);
          break;
        case MainChartIndicatorType.VWAP:
          this.addIndicator(chartLayer.props.chart, MainChartIndicatorType.VWAP, chartLayer.props.chartData, updatedIndicator);
          break;
        default:
      }
    } catch (error) {
      throw new Error(`Failed to update ${updatedIndicator.type} indicator`);
    }
  };

  updateIndicatorStyle(mainChartIndicatorType: MainChartIndicatorType, seriesId: string, style: { color?: string; lineWidth?: number; visible?: boolean }): boolean {
    try {
      const indicator = this.indicators.get(mainChartIndicatorType);
      if (!indicator) {
        return false;
      }
      return indicator.updateSeriesStyle(seriesId, style);
    } catch (error) {
      return false;
    }
  }

  updateIndicatorParams(mainChartIndicatorType: MainChartIndicatorType, mainChartIndicatorInfo: MainChartIndicatorInfo): boolean {
    try {
      const indicator = this.indicators.get(mainChartIndicatorType);
      if (!indicator) {
        return false;
      }
      return indicator.updateParams(mainChartIndicatorInfo);
    } catch (error) {
      return false;
    }
  }

  hideIndicator(mainChartIndicatorType: MainChartIndicatorType): boolean {
    try {
      const indicator = this.indicators.get(mainChartIndicatorType);
      if (!indicator) {
        return false;
      }
      indicator.hideSeries();
      return true;
    } catch (error) {
      return false;
    }
  }

  showIndicator(mainChartIndicatorType: MainChartIndicatorType): boolean {
    try {
      const indicator = this.indicators.get(mainChartIndicatorType);
      if (!indicator) {
        return false;
      }
      indicator.showSeries();
      return true;
    } catch (error) {
      return false;
    }
  }

  getIndicatorSeries(mainChartIndicatorType: MainChartIndicatorType): ISeriesApi<any>[] {
    const indicator = this.indicators.get(mainChartIndicatorType);
    if (!indicator) {
      return [];
    }
    return indicator.getAllSeries();
  }

  getActiveIndicators(): string[] {
    const activeIndicators: string[] = [];
    this.indicators.forEach((indicator, indicatorId) => {
      if (indicator.getAllSeries().length > 0) {
        activeIndicators.push(indicatorId);
      }
    });
    return activeIndicators;
  }

  getYAxisValuesAtMouseX(mainChartIndicatorType: MainChartIndicatorType, mouseX: number, chart: IChartApi): any {
    try {
      const indicator = this.indicators.get(mainChartIndicatorType);
      if (!indicator) {
        return null;
      }
      if (mainChartIndicatorType === MainChartIndicatorType.MA && indicator instanceof MAIndicator) {
        return indicator.getYAxisValuesAtMouseX(mouseX, chart);
      } else if (mainChartIndicatorType === MainChartIndicatorType.EMA && indicator instanceof EMAIndicator) {
        return indicator.getYAxisValuesAtMouseX(mouseX, chart);
      } else if (mainChartIndicatorType === MainChartIndicatorType.BOLLINGER && indicator instanceof BollingerBandsIndicator) {
        return indicator.getYAxisValuesAtMouseX(mouseX, chart);
      } else if (mainChartIndicatorType === MainChartIndicatorType.ICHIMOKU && indicator instanceof IchimokuIndicator) {
        return indicator.getYAxisValuesAtMouseX(mouseX, chart);
      } else if (mainChartIndicatorType === MainChartIndicatorType.DONCHIAN && indicator instanceof DonchianChannelIndicator) {
        return indicator.getYAxisValuesAtMouseX(mouseX, chart);
      } else if (mainChartIndicatorType === MainChartIndicatorType.ENVELOPE && indicator instanceof EnvelopeIndicator) {
        return indicator.getYAxisValuesAtMouseX(mouseX, chart);
      } else if (mainChartIndicatorType === MainChartIndicatorType.VWAP && indicator instanceof VWAPIndicator) {
        return indicator.getYAxisValuesAtMouseX(mouseX, chart);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  isVisible(mainChartIndicatorType: MainChartIndicatorType): boolean {
    return this.indicators.get(mainChartIndicatorType)?.isVisible() || false;
  }
}