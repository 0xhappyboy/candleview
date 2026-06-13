import { TopPanel } from '../components/toppanel';
import { LeftPanel } from '../components/leftpanel';
import { Theme } from '../theme';
import { I18n } from '../i18n';
import { TopPanelState, DEFAULT_TOP_PANEL_STATE } from '../components/toppanel/TopPanelState';
import { LeftPanelState, DEFAULT_LEFT_PANEL_STATE } from '../components/leftpanel/LeftPanelState';
import { MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from '../types';

export interface CandleViewPanelsConfig {
    technologyPanelContainer: HTMLElement | null;
    drawingPanelContainer: HTMLElement | null;
    rootContainer: HTMLElement;
    theme: Theme;
    i18n: I18n;
    chartManager: any;
    dataManager: any;
    brushHint: any;
    marks: any;
    candleView: any;
    topPanelState: TopPanelState;
    leftPanelState: LeftPanelState;
    onTimeframeChange: (tf: TimeframeEnum) => void;
    onChartTypeChange: (type: MainChartType) => void;
    onThemeToggle: () => void;
    onToolSelect: (tool: string) => void;
    onFullscreenClick: () => void;
    onTimezoneSelect: (tz: TimezoneEnum) => void;
    onMainChartIndicatorSelect: (indicator: any) => void;
    getSelectedSubChartIndicators?: () => SubChartIndicatorType[];
    onSubChartIndicatorToggle?: (indicatorType: SubChartIndicatorType) => void;
    onSubChartIndicatorSelect?: (indicators: SubChartIndicatorType[]) => void;
}

export class CandleViewPanels {
    private topPanel: TopPanel | null = null;
    private leftPanel: LeftPanel | null = null;
    private config: CandleViewPanelsConfig;
    private topPanelState: TopPanelState = { ...DEFAULT_TOP_PANEL_STATE };
    private leftPanelState: LeftPanelState = { ...DEFAULT_LEFT_PANEL_STATE };
    constructor(config: CandleViewPanelsConfig) {
        this.config = config;
        this.topPanelState = config.topPanelState;
        this.leftPanelState = config.leftPanelState;
    }
    public init(): void {
        this.initTopPanel();
        this.initLeftPanel();
    }

    private initTopPanel(): void {
        if (!this.config.technologyPanelContainer) return;
        const selectedIndicators = this.config.getSelectedSubChartIndicators?.() || [];
        this.topPanel = new TopPanel({
            container: this.config.technologyPanelContainer,
            rootContainer: this.config.rootContainer,
            theme: this.config.theme,
            i18n: this.config.i18n,
            state: this.topPanelState,
            activeTimeframe: this.topPanelState.activeTimeframe,
            activeMainChartType: this.topPanelState.currentMainChartType,
            currentTimezone: this.topPanelState.currentTimezone,
            onStateChange: (updates) => this.updateTopPanelState(updates),
            onTimeframeSelect: (tf: TimeframeEnum) => this.config.onTimeframeChange(tf),
            onChartTypeSelect: (type: MainChartType) => this.config.onChartTypeChange(type),
            onMainChartIndicatorSelect: (indicator) => this.config.onMainChartIndicatorSelect(indicator),
            onSubChartIndicatorToggle: (indicatorType) => this.config.onSubChartIndicatorToggle?.(indicatorType),
            onSubChartIndicatorSelect: (indicators) => this.config.onSubChartIndicatorSelect?.(indicators),
            onThemeToggle: () => this.config.onThemeToggle(),
            onCameraClick: async () => { /* ... */ },
            onFullscreenClick: () => { /* ... */ },
            onTimezoneSelect: (tz: TimezoneEnum) => this.config.onTimezoneSelect(tz),
            getSelectedSubChartIndicators: () => this.config.candleView?.getSelectedSubChartIndicators?.() || [],
        });
    }


    private initLeftPanel(): void {
        if (!this.config.drawingPanelContainer) return;
        this.leftPanel = new LeftPanel({
            container: this.config.drawingPanelContainer,
            theme: this.config.theme,
            i18n: this.config.i18n,
            state: this.leftPanelState,
            onStateChange: (updates) => {
                this.updateLeftPanelState(updates);
                if (updates.isBrushActive !== undefined) {
                    if (updates.isBrushActive && this.config.drawingPanelContainer) {
                        this.config.brushHint?.show(this.config.drawingPanelContainer);
                    } else {
                        this.config.brushHint?.hide();
                    }
                }
            },
            onToolSelect: (tool) => this.config.onToolSelect(tool),
            chart: this.config.chartManager?.getChart(),
        });
        const chart = this.config.chartManager?.getChart();
        if (chart) chart.leftPanel = this.leftPanel;
    }
    private updateTopPanelState(updates: Partial<TopPanelState>): void {
        this.topPanelState = { ...this.topPanelState, ...updates };
    }
    private updateLeftPanelState(updates: Partial<LeftPanelState>): void {
        this.leftPanelState = { ...this.leftPanelState, ...updates };
    }

    public updateSubChartIndicatorsState(indicators: SubChartIndicatorType[]): void {
        if (this.topPanel) {
            (this.topPanel as any).refreshModalCheckboxes?.();
        }
    }

    public getTopPanel(): TopPanel | null {
        return this.topPanel;
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