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
    onTimeframeChange: (tf: TimeframeEnum) => void;
    onChartTypeChange: (type: MainChartType) => void;
    onThemeToggle: () => void;
    onToolSelect: (tool: string) => void;
    onFullscreenClick: () => void;
    onTimezoneSelect: (tz: TimezoneEnum) => void;
    onMainChartIndicatorSelect: (indicator: any) => void;
    onSubChartIndicatorSelect: (indicators: SubChartIndicatorType[]) => void;
}

export class CandleViewPanels {
    private topPanel: TopPanel | null = null;
    private leftPanel: LeftPanel | null = null;
    private config: CandleViewPanelsConfig;
    private topPanelState: TopPanelState = { ...DEFAULT_TOP_PANEL_STATE };
    private leftPanelState: LeftPanelState = { ...DEFAULT_LEFT_PANEL_STATE };
    constructor(config: CandleViewPanelsConfig) {
        this.config = config;
    }
    public init(): void {
        this.initTopPanel();
        this.initLeftPanel();
    }
    private initTopPanel(): void {
        if (!this.config.technologyPanelContainer) return;
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
            onSubChartIndicatorSelect: (indicators) => this.config.onSubChartIndicatorSelect(indicators),
            onThemeToggle: () => this.config.onThemeToggle(),
            onCameraClick: async () => {
                if (typeof window === 'undefined' || typeof document === 'undefined') return;
                const base64 = await this.config.candleView.captureScreenshot();
                const link = document.createElement('a');
                link.download = `candleview-screenshot-${Date.now()}.png`;
                link.href = base64;
                link.click();
            },
            onFullscreenClick: () => {
                if (typeof window === 'undefined' || typeof document === 'undefined') return;
                const fullscreenElement = this.config.candleView.dom.getRootEl();
                const elem = fullscreenElement;
                if (!elem) return;
                const isFullscreen = !!(
                    document.fullscreenElement ||
                    (document as any).webkitFullscreenElement ||
                    (document as any).msFullscreenElement
                );
                if (isFullscreen) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if ((document as any).webkitExitFullscreen) {
                        (document as any).webkitExitFullscreen();
                    } else if ((document as any).msExitFullscreen) {
                        (document as any).msExitFullscreen();
                    }
                } else {
                    if (elem.requestFullscreen) {
                        elem.requestFullscreen();
                    } else if ((elem as any).webkitRequestFullscreen) {
                        (elem as any).webkitRequestFullscreen();
                    } else if ((elem as any).msRequestFullscreen) {
                        (elem as any).msRequestFullscreen();
                    }
                }
            },
            onTimezoneSelect: (tz: TimezoneEnum) => this.config.onTimezoneSelect(tz),
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
        if (this.topPanel && typeof this.topPanel.setSelectedSubChartIndicators === 'function') {
            this.topPanel.setSelectedSubChartIndicators(indicators);
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