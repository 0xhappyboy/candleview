import { MainChartIndicatorInfo, MainChartIndicatorParam } from '../Indicators/mainchart/MainChartIndicatorInfo';
import { MainChartIndicatorType } from '../types';
import { MainChartTechnicalIndicatorManager } from '../Indicators/mainchart/MainChartIndicatorManager';
import { ThemeConfig } from '../theme';
import { Chart } from './Chart';

export class ChartIndicatorsManager {
    private chart: Chart;
    public indicators: MainChartIndicatorInfo[] = [];
    public visibleIndicatorTypes: MainChartIndicatorType[] = [];
    public mainChartTechnicalIndicatorManager: MainChartTechnicalIndicatorManager | null = null;
    public maIndicatorValues: { [key: string]: number } = {};
    public emaIndicatorValues: { [key: string]: number } = {};
    public bollingerBandsValues: { [key: string]: number } = {};
    public ichimokuValues: { [key: string]: number } = {};
    public donchianChannelValues: { [key: string]: number } = {};
    public envelopeValues: { [key: string]: number } = {};
    public vwapValue: number | null = null;

    constructor(chart: Chart) {
        this.chart = chart;
    }

    public init(currentTheme: ThemeConfig): void {
        this.mainChartTechnicalIndicatorManager = new MainChartTechnicalIndicatorManager(currentTheme);
    }

    public addOrUpdateIndicator(indicator: MainChartIndicatorInfo): void {
        if (indicator.visible === undefined) indicator.visible = true;
        const existingIndex = this.indicators.findIndex(i => i.type === indicator.type);
        if (existingIndex !== -1) {
            this.indicators[existingIndex] = indicator;
        } else {
            this.indicators.push(indicator);
        }
        this.updateVisibleTypes();
        this.mainChartTechnicalIndicatorManager?.updateMainChartIndicator(this.chart as any, indicator);
        this.chart.updateChartInfoData();
    }

    public removeIndicator(type: MainChartIndicatorType): void {
        this.indicators = this.indicators.filter(i => i.type !== type);
        this.updateVisibleTypes();
        this.chart.updateChartInfoData();
        if (this.chart.chart) {
            this.mainChartTechnicalIndicatorManager?.removeIndicator(this.chart.chart, type);
        }
    }

    public toggleVisibility(type: MainChartIndicatorType): void {
        const indicator = this.indicators.find(i => i.type === type);
        if (indicator) {
            indicator.visible = !indicator.visible;
            this.updateVisibleTypes();
            this.chart.updateChartInfoData();
            if (indicator.visible) {
                this.mainChartTechnicalIndicatorManager?.showIndicator(type);
            } else {
                this.mainChartTechnicalIndicatorManager?.hideIndicator(type);
            }
        }
    }

    public updateParams(indicatorId: string, newParams: MainChartIndicatorParam[]): void {
        const indicator = this.indicators.find(i => i.id === indicatorId);
        if (indicator && indicator.params) {
            indicator.params = newParams;
            if (indicator.type) {
                this.mainChartTechnicalIndicatorManager?.updateMainChartIndicator(this.chart as any, indicator);
            }
            this.chart.updateChartInfoData();
        }
    }

    public updateAllIndicatorsData(displayData: any[]): void {
        if (!this.mainChartTechnicalIndicatorManager) return;
        this.indicators.forEach(indicator => {
            if (indicator.type && indicator.visible !== false) {
                this.mainChartTechnicalIndicatorManager?.updateMainChartIndicatorData(
                    indicator.type,
                    displayData,
                    indicator
                );
            }
        });
    }

    public setIndicatorValues(values: {
        ma?: { [key: string]: number };
        ema?: { [key: string]: number };
        bollinger?: { [key: string]: number };
        ichimoku?: { [key: string]: number };
        donchian?: { [key: string]: number };
        envelope?: { [key: string]: number };
        vwap?: number | null;
    }): void {
        if (values.ma) this.maIndicatorValues = values.ma;
        if (values.ema) this.emaIndicatorValues = values.ema;
        if (values.bollinger) this.bollingerBandsValues = values.bollinger;
        if (values.ichimoku) this.ichimokuValues = values.ichimoku;
        if (values.donchian) this.donchianChannelValues = values.donchian;
        if (values.envelope) this.envelopeValues = values.envelope;
        if (values.vwap !== undefined) this.vwapValue = values.vwap;
        this.chart.updateChartInfoData();
    }

    private updateVisibleTypes(): void {
        this.visibleIndicatorTypes = this.indicators
            .filter(i => i.visible !== false)
            .map(i => i.type!)
            .filter(type => type !== undefined);
    }

    public getIndicators(): MainChartIndicatorInfo[] { return [...this.indicators]; }
    public getVisibleTypes(): MainChartIndicatorType[] { return [...this.visibleIndicatorTypes]; }

    public updateTheme(theme: ThemeConfig): void {
        this.mainChartTechnicalIndicatorManager?.updateTheme(theme);
    }

    public destroy(): void {
        if (this.chart.chart) {
            this.mainChartTechnicalIndicatorManager?.destroy(this.chart.chart);
        }
    }
}