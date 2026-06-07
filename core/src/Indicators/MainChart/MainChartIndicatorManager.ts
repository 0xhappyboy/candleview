import { IChartApi, ISeriesApi } from 'lightweight-charts';
import { ICandleViewDataPoint, MainChartIndicatorType } from '../../types';
import { Chart } from '../../chart/Chart';
import { MAIndicator } from './MAIndicator';
import { BollingerBandsIndicator } from './BollingerBandsIndicator';
import { DonchianChannelIndicator } from './DonchianChannelIndicator';
import { EMAIndicator } from './EMAIndicator';
import { EnvelopeIndicator } from './EnvelopeIndicator';
import { IchimokuIndicator } from './IchimokuIndicator';
import { MainChartIndicatorInfo } from './MainChartIndicatorInfo';
import { VWAPIndicator } from './VWAPIndicator';
import { BaseIndicator } from './BaseIndicator';

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

  public removeIndicator(chart: IChartApi, mainChartIndicatorType: MainChartIndicatorType): boolean {
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

  public updateAllMainChartIndicatorData(chart: Chart, mainChartIndicatorInfo: MainChartIndicatorInfo): boolean {
    try {
      let allSuccess = true;
      this.indicators.forEach((indicator, indicatorType) => {
        if (indicator.getAllSeries().length > 0) {
          const success = indicator.updateData(chart.preprocessedData?.displayData!, mainChartIndicatorInfo);
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

  public updateMainChartIndicator = (chart: Chart, updatedIndicator: MainChartIndicatorInfo) => {
    if (!chart.chart) {
      return;
    }
    if (!updatedIndicator.params) {
      return;
    }
    try {
      if (updatedIndicator.type) {
        this.removeIndicator(chart.chart, updatedIndicator.type);
      }
      switch (updatedIndicator.type) {
        case MainChartIndicatorType.MA:
          this.addIndicator(chart.chart, MainChartIndicatorType.MA, chart.preprocessedData?.displayData!, updatedIndicator);
          break;
        case MainChartIndicatorType.EMA:
          this.addIndicator(chart.chart, MainChartIndicatorType.EMA, chart.preprocessedData?.displayData!, updatedIndicator);
          break;
        case MainChartIndicatorType.BOLLINGER:
          this.addIndicator(chart.chart, MainChartIndicatorType.BOLLINGER, chart.preprocessedData?.displayData!, updatedIndicator);
          break;
        case MainChartIndicatorType.ICHIMOKU:
          this.addIndicator(chart.chart, MainChartIndicatorType.ICHIMOKU, chart.preprocessedData?.displayData!, updatedIndicator);
          break;
        case MainChartIndicatorType.DONCHIAN:
          this.addIndicator(chart.chart, MainChartIndicatorType.DONCHIAN, chart.preprocessedData?.displayData!, updatedIndicator);
          break;
        case MainChartIndicatorType.ENVELOPE:
          this.addIndicator(chart.chart, MainChartIndicatorType.ENVELOPE, chart.preprocessedData?.displayData!, updatedIndicator);
          break;
        case MainChartIndicatorType.VWAP:
          this.addIndicator(chart.chart, MainChartIndicatorType.VWAP, chart.preprocessedData?.displayData!, updatedIndicator);
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

  public updateTheme(theme: any): void {
    this.theme = theme;
  }

  public destroy(chart: IChartApi): void {
    this.indicators.forEach((indicator) => {
      indicator.removeAllSeries(chart);
    });
    this.indicators.clear();
  }
}