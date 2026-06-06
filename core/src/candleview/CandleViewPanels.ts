import { CoreState } from './types';
import { CandleViewData } from './CandleViewData';
import { CandleViewChart } from './CandleViewChart';
import { LeftPanel } from '../components/leftpanel';
import { TopPanel } from '../components/toppanel';
import { I18n } from '../i18n';
import { Theme } from '../theme';
import { CandleViewBrushHint } from './CandleViewBrushHint';
import { MainChartIndicatorType, SubChartIndicatorType } from '../types';

export class CandleViewPanels {
    private state: CoreState;
    private dataManager: CandleViewData;
    private brushManager: CandleViewBrushHint;
    private chartManager: CandleViewChart;
    private topPanel: TopPanel | null = null;
    private leftPanel: LeftPanel | null = null;

    constructor(state: CoreState, dataManager: CandleViewData, brushManager: CandleViewBrushHint, chartManager: CandleViewChart) {
        this.state = state;
        this.dataManager = dataManager;
        this.brushManager = brushManager;
        this.chartManager = chartManager;
    }

    public init(): void {
        const topPanelContainer = (this.state as any).topPanelContainer;
        const leftPanelContainer = (this.state as any).leftPanelContainer;
        const i18n = this.state.i18n;

        if (this.state.config.showTopPanel && topPanelContainer) {
            this.topPanel = new TopPanel({
                container: topPanelContainer,
                theme: this.state.theme,
                i18n: i18n,
                state: this.state.topPanelState,
                onStateChange: (updates) => this.updateTopPanelState(updates),
                onTimeframeSelect: (tf) => this.handleTimeframeChange(tf),
                onChartTypeSelect: (type) => this.handleChartTypeChange(type),
                onMainChartIndicatorSelect: (indicator) => this.handleMainChartIndicatorSelect(indicator),
                onSubChartIndicatorSelect: (indicators) => this.handleSubChartIndicatorSelect(indicators),
                onThemeToggle: () => this.handleThemeToggle(),
                onCameraClick: () => this.handleCameraClick(),
                onFullscreenClick: () => this.handleFullscreenClick(),
                onTimezoneSelect: (tz) => this.handleTimezoneSelect(tz),
            });
        } else if (topPanelContainer) {
            topPanelContainer.style.display = 'none';
        }

        if (this.state.config.showLeftPanel && leftPanelContainer) {
            this.leftPanel = new LeftPanel({
                container: leftPanelContainer,
                theme: this.state.theme,
                i18n: this.state.i18n,
                state: this.state.leftPanelState,
                onStateChange: (updates) => {
                    this.updateLeftPanelState(updates);
                    if (updates.isBrushActive !== undefined) {
                        if (updates.isBrushActive) this.brushManager.show();
                        else this.brushManager.hide();
                    }
                },
                onToolSelect: (tool) => this.handleToolSelect(tool),
                chart: this.chartManager.getChart(),
            });
        } else if (leftPanelContainer) {
            leftPanelContainer.style.display = 'none';
        }
    }

    private updateTopPanelState(updates: any): void {
        this.state.topPanelState = { ...this.state.topPanelState, ...updates };
    }

    private updateLeftPanelState(updates: any): void {
        this.state.leftPanelState = { ...this.state.leftPanelState, ...updates };
    }

    private setSelectedSubChartIndicators(indicators: SubChartIndicatorType[]): void {
        this.updateTopPanelState({ selectedSubChartIndicators: indicators });
    }

    private setSelectedMainChartIndicator(indicator: any): void {
        this.updateTopPanelState({ selectedMainChartIndicator: indicator });
    }

    private handleTimeframeChange(timeframe: string): void {
        this.state.currentTimeframe = timeframe as any;
        this.updateTopPanelState({ activeTimeframe: timeframe });
        this.dataManager.refreshViewData();
        const preprocessedData = this.dataManager.getPreprocessedData();
        if (preprocessedData) {
            this.chartManager.getChart()?.updateData(this.state.rawData, preprocessedData);
        }
        this.state.config.onTimeframeChange?.(timeframe);
    }

    private handleChartTypeChange(type: any): void {
        this.updateTopPanelState({ currentMainChartType: type });
        this.state.chartType = type;
        this.chartManager.getChart()?.updateChartType(type);
        this.state.config.onChartTypeChange?.(type);
    }

    private handleMainChartIndicatorSelect(indicator: any): void {
        this.setSelectedMainChartIndicator(indicator);
        this.state.config.onMainChartIndicatorSelect?.(indicator);
        const chart = this.chartManager.getChart();
        chart?.addOrUpdateMainChartIndicator(indicator);
        if (indicator.type === MainChartIndicatorType.HEATMAP) {
            chart?.showHeatMap();
        } else if (indicator.type === MainChartIndicatorType.MARKETPROFILE) {
            chart?.showMarketProfile();
        }
    }

    private handleSubChartIndicatorSelect(indicators: SubChartIndicatorType[]): void {
        this.setSelectedSubChartIndicators(indicators);
        this.topPanel?.setSelectedSubChartIndicators(indicators);
        this.state.config.onSubChartIndicatorSelect?.(indicators);

        const chart = this.chartManager.getChart();
        if (!chart || !chart.chartPanesManager) return;

        chart.chartPanesManager.removeAllPane();
        indicators.forEach(indicatorType => {
            chart.addSubChart(
                indicatorType,
                (t) => this.handleSubChartSettingsClick(t),
                (t) => this.handleSubChartCloseClick(t)
            );
        });
    }

    private handleSubChartSettingsClick(type: SubChartIndicatorType): void {
        const chart = this.chartManager.getChart();
        if (!chart) return;
        const params = chart.chartPanesManager?.getParamsByIndicatorType(type) || [];
        chart.openSubChartIndicatorsModal(params, type);
    }

    private handleSubChartCloseClick(type: SubChartIndicatorType): void {
        const newIndicators = this.state.topPanelState.selectedSubChartIndicators.filter(t => t !== type);
        this.setSelectedSubChartIndicators(newIndicators);
        this.topPanel?.setSelectedSubChartIndicators(newIndicators);
        this.state.config.onSubChartIndicatorSelect?.(newIndicators);

        const chart = this.chartManager.getChart();
        if (!chart || !chart.chartPanesManager) return;

        chart.chartPanesManager.removeAllPane();
        setTimeout(() => {
            newIndicators.forEach(indicatorType => {
                chart.addSubChart(
                    indicatorType,
                    (t) => this.handleSubChartSettingsClick(t),
                    (t) => this.handleSubChartCloseClick(t)
                );
            });
        }, 50);
    }

    private handleThemeToggle(): void {
        const newThemeType = this.state.theme.isDark() ? 'light' : 'dark';
        this.state.config.onThemeToggle?.(newThemeType);
    }

    private handleCameraClick(): void {
        this.state.config.onCameraClick?.();
    }

    private handleFullscreenClick(): void {
        this.state.config.onFullscreenClick?.();
    }

    private handleTimezoneSelect(timezone: string): void {
        this.updateTopPanelState({ currentTimezone: timezone });
        const preprocessedData = this.dataManager.preprocessData(this.state.config.data || [], {
            timeframe: this.state.topPanelState.activeTimeframe,
            timezone: timezone as any
        });
        this.chartManager.getChart()?.updateData(this.state.config.data || [], preprocessedData);
        this.state.config.onTimezoneSelect?.(timezone);
    }

    private handleToolSelect(tool: string): void {
        this.state.config.onToolSelect?.(tool);
    }

    public updateTheme(theme: Theme): void {
        this.topPanel?.updateTheme(theme);
        this.leftPanel?.updateTheme(theme);
    }

    public updateI18n(i18n: I18n): void {
        this.topPanel?.updateI18n(i18n);
        this.leftPanel?.updateI18n(i18n);
    }

    public destroy(): void {
        this.topPanel?.destroy();
        this.leftPanel?.destroy();
        this.topPanel = null;
        this.leftPanel = null;
    }
}