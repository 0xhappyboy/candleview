import { ICandleViewDataPoint, MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum, CursorType, MarkDrawing, MainChartIndicatorType } from './types';
import { Dark, Light, Theme, ThemeConfig } from './theme';
import { getI18n, I18n, setLocale } from './i18n';
import { Chart } from './chart/Chart';
import { LeftPanel } from './components/leftpanel/LeftPanel';
import { TopPanel } from './components/toppanel/TopPanel';
import { DataPreprocessor, DataPreprocessResult } from './DataPreprocessor';
import { TopPanelState, DEFAULT_TOP_PANEL_STATE } from './components/toppanel/TopPanelState';
import { LeftPanelState, DEFAULT_LEFT_PANEL_STATE } from './components/leftpanel/LeftPanelState';
import { DrawingManagerState } from './chart/DrawingManager';
import { ToolManager } from './components/leftpanel';
import { MainChartIndicatorInfo } from './Indicators/mainchart/MainChartIndicatorInfo';
import { IIndicatorInfo } from './Indicators/subchart/IIndicator';

export interface CandleViewConfig {
    container?: HTMLElement;
    containerSelector?: string;
    parent?: HTMLElement;
    parentSelector?: string;
    id?: string;
    title?: string;
    data?: ICandleViewDataPoint[];
    theme?: 'light' | 'dark';
    locale?: 'en' | 'zh-cn';
    showTopPanel?: boolean;
    showLeftPanel?: boolean;
    chartType?: MainChartType;
    activeTimeframe?: string;
    currentTimezone?: string;
    onToolSelect?: (tool: string) => void;
    onTimeframeChange?: (timeframe: string) => void;
    onChartTypeChange?: (type: MainChartType) => void;
    onMainChartIndicatorSelect?: (indicator: MainChartIndicatorInfo) => void;
    onSubChartIndicatorSelect?: (indicators: SubChartIndicatorType[]) => void;
    onThemeToggle?: (theme: string) => void;
    onCameraClick?: () => void;
    onFullscreenClick?: () => void;
    onTimezoneSelect?: (timezone: string) => void;
}

export class CandleView {
    private container: HTMLElement;
    private isOwnContainer: boolean = false;
    private config: CandleViewConfig;
    private theme: Theme;
    public currentTheme: ThemeConfig;
    private i18n: I18n;
    private chart: Chart | null = null;
    private topPanel: TopPanel | null = null;
    private leftPanel: LeftPanel | null = null;
    private chartType: MainChartType;
    private preprocessedData: DataPreprocessResult | null = null;
    private currentTool: string | null = null;
    private topPanelState: TopPanelState;
    private leftPanelState: LeftPanelState;
    private rootEl: HTMLElement | null = null;
    private chartContainerEl: HTMLElement | null = null;
    private toolManager: ToolManager | null = null;
    private initToolManager(): void {
        this.toolManager = new ToolManager(this.chart || undefined);
    }

    constructor(config: CandleViewConfig) {
        const { container, isOwn } = this.resolveContainer(config);
        this.container = container;
        this.isOwnContainer = isOwn;
        this.chartType = config.chartType || MainChartType.Candle;
        this.config = {
            title: '',
            data: [],
            theme: 'dark',
            locale: 'zh-cn',
            showTopPanel: true,
            showLeftPanel: true,
            chartType: this.chartType,
            ...config
        };
        this.theme = new Theme(this.config.theme);
        this.currentTheme = this.theme.isDark() ? Dark : Light;
        setLocale(this.config.locale || 'zh-cn');
        this.i18n = getI18n();
        this.topPanelState = { ...DEFAULT_TOP_PANEL_STATE };
        this.leftPanelState = { ...DEFAULT_LEFT_PANEL_STATE };
        if (this.config.activeTimeframe) {
            this.topPanelState.activeTimeframe = this.config.activeTimeframe as TimeframeEnum;
        }
        if (this.config.currentTimezone) {
            this.topPanelState.currentTimezone = this.config.currentTimezone;
        }
        this.init();
    }

    private resolveContainer(config: CandleViewConfig): { container: HTMLElement; isOwn: boolean } {
        if (config.container) {
            return { container: config.container, isOwn: false };
        }
        if (config.containerSelector) {
            const el = document.querySelector(config.containerSelector);
            if (!el) {
                throw new Error(`[CandleView] Container element not found: ${config.containerSelector}`);
            }
            return { container: el as HTMLElement, isOwn: false };
        }
        if (config.id) {
            const el = document.getElementById(config.id);
            if (!el) {
                throw new Error(`[CandleView] Container element not found: #${config.id}`);
            }
            return { container: el, isOwn: false };
        }
        if (config.parent) {
            const container = this.createAutoContainer();
            config.parent.appendChild(container);
            return { container, isOwn: true };
        }
        if (config.parentSelector) {
            const parent = document.querySelector(config.parentSelector);
            if (!parent) {
                throw new Error(`[CandleView] Parent element not found: ${config.parentSelector}`);
            }
            const container = this.createAutoContainer();
            parent.appendChild(container);
            return { container, isOwn: true };
        }
        throw new Error('[CandleView] Must provide one of: container, containerSelector, id, parent, or parentSelector');
    }

    private createAutoContainer(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        `;
        return container;
    }

    private updateTopPanelState(updates: Partial<TopPanelState>): void {
        this.topPanelState = { ...this.topPanelState, ...updates };
    }

    private updateLeftPanelState(updates: Partial<LeftPanelState>): void {
        this.leftPanelState = { ...this.leftPanelState, ...updates };
    }

    public getTopPanelState(): TopPanelState {
        return { ...this.topPanelState };
    }

    public getLeftPanelState(): LeftPanelState {
        return { ...this.leftPanelState };
    }

    private setActiveTimeframe(timeframe: TimeframeEnum): void {
        this.updateTopPanelState({ activeTimeframe: timeframe });
    }

    private setCurrentMainChartType(type: MainChartType): void {
        this.updateTopPanelState({ currentMainChartType: type });
    }

    private setCurrentTimezone(timezone: string): void {
        this.updateTopPanelState({ currentTimezone: timezone });
    }

    private setSelectedSubChartIndicators(indicators: SubChartIndicatorType[]): void {
        this.updateTopPanelState({ selectedSubChartIndicators: indicators });
    }

    private setSelectedMainChartIndicator(indicator: MainChartIndicatorInfo | null): void {
        this.updateTopPanelState({ selectedMainChartIndicator: indicator });
    }

    private setLoadingState(isLoading: boolean, progress?: number, error?: string | null): void {
        this.updateTopPanelState({
            isDataLoading: isLoading,
            dataLoadProgress: progress ?? this.topPanelState.dataLoadProgress,
            loadError: error ?? null
        });
    }

    private setSelectedEmoji(emoji: string): void {
        this.updateLeftPanelState({ selectedEmoji: emoji });
    }

    private setSelectedCursor(cursor: string): void {
        this.updateLeftPanelState({ selectedCursor: cursor });
    }

    private setLastSelectedTool(category: keyof LeftPanelState['lastSelectedTools'], toolId: string): void {
        const newLastSelectedTools = {
            ...this.leftPanelState.lastSelectedTools,
            [category]: toolId
        };
        this.updateLeftPanelState({ lastSelectedTools: newLastSelectedTools });
    }

    private setMarkLocked(locked: boolean): void {
        this.updateLeftPanelState({ isMarkLocked: locked });
    }

    private setMarkVisibility(visible: boolean): void {
        this.updateLeftPanelState({ isMarkVisibility: visible });
    }

    private init(): void {
        this.createDOM();
        this.initChart();
        this.initPanels();
        this.bindEvents();
        this.initToolManager();
    }

    private createDOM(): void {
        this.container.innerHTML = '';
        this.container.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
        box-sizing: border-box;
    `;
        const colors = this.theme.getColors();
        this.rootEl = document.createElement('div');
        this.rootEl.className = 'candleview-root';
        this.rootEl.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: ${colors.background};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        user-select: none;
        overflow: hidden;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    `;
        const topPanelContainer = document.createElement('div');
        topPanelContainer.className = 'candleview-top-panel-container';
        topPanelContainer.style.cssText = `
        flex-shrink: 0;
    `;
        this.rootEl.appendChild(topPanelContainer);
        const mainContent = document.createElement('div');
        mainContent.className = 'candleview-main-content';
        mainContent.style.cssText = `
        display: flex;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        position: relative;
    `;
        const leftPanelContainer = document.createElement('div');
        leftPanelContainer.className = 'candleview-left-panel-container';
        leftPanelContainer.style.cssText = `
        flex-shrink: 0;
    `;
        mainContent.appendChild(leftPanelContainer);
        this.chartContainerEl = document.createElement('div');
        this.chartContainerEl.className = 'candleview-chart-container';
        this.chartContainerEl.style.cssText = `
        flex: 1;
        min-width: 0;
        min-height: 0;
        position: relative;
        overflow: hidden;
    `;
        mainContent.appendChild(this.chartContainerEl);
        this.rootEl.appendChild(mainContent);
        this.container.appendChild(this.rootEl);
    }

    private preprocessData(
        originalData: ICandleViewDataPoint[],
        options?: {
            timeframe?: TimeframeEnum;
            timezone?: TimezoneEnum;
            virtualDataBeforeCount?: number;
            virtualDataAfterCount?: number;
        }
    ): DataPreprocessResult {
        return DataPreprocessor.preprocess(originalData, {
            timeframe: options?.timeframe,
            timezone: options?.timezone,
            virtualDataBeforeCount: options?.virtualDataBeforeCount,
            virtualDataAfterCount: options?.virtualDataAfterCount,
        });
    }

    private initChart(): void {
        if (this.chart) {
            console.warn('[CandleView] Chart already initialized, skipping');
            return;
        }
        this.preprocessedData = this.preprocessData(this.config.data || []);
        this.chart = new Chart({
            container: this.chartContainerEl!,
            data: this.config.data || [],
            theme: this.theme,
            chartType: this.chartType,
            preprocessedData: this.preprocessedData,
            i18n: this.i18n,
            onCloseDrawing: () => {
                this.currentTool = null;
                this.config.onToolSelect?.('');
            },
            onToggleOHLC: () => { },
            onOpenIndicatorsModal: () => { },
            onRemoveIndicator: (type) => {
                this.chart?.removeMainChartIndicator(type);
            },
            onToggleIndicator: (type) => {
                this.chart?.toggleIndicatorVisibility(type);
            },
            onEditIndicatorParams: (id, params) => {
                this.chart?.updateIndicatorParams(id, params);
            },
            onOpenIndicatorSettings: (indicator) => {
                this.chart?.openMainChartIndicatorsModal(indicator);
            },
            onMainChartIndicatorConfirm: (indicator: MainChartIndicatorInfo) => {
                this.chart?.addOrUpdateMainChartIndicator(indicator);
            },
            onSubChartIndicatorConfirm: (params: IIndicatorInfo[]) => {
                if (this.chart?.currentSubChartType) {
                    this.chart?.chartPanesManager?.updateSettingsBySubChartIndicatorType(
                        this.chart.data,
                        params,
                        this.chart.currentSubChartType
                    );
                }
            },
        });
        if (this.chart) {
            this.chart.currentTheme = this.currentTheme;
        }
    }

    private initPanels(): void {
        const topPanelContainer = this.rootEl?.querySelector('.candleview-top-panel-container');
        const leftPanelContainer = this.rootEl?.querySelector('.candleview-left-panel-container');
        const i18n = getI18n();

        if (this.config.showTopPanel && topPanelContainer) {
            this.topPanel = new TopPanel({
                container: topPanelContainer as HTMLElement,
                theme: this.theme,
                i18n: i18n,
                state: this.topPanelState,
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
            (topPanelContainer as HTMLElement).style.display = 'none';
        }

        if (this.config.showLeftPanel && leftPanelContainer) {
            this.leftPanel = new LeftPanel({
                container: leftPanelContainer as HTMLElement,
                theme: this.theme,
                i18n: this.i18n,
                state: this.leftPanelState,
                onStateChange: (updates) => this.updateLeftPanelState(updates),
                onToolSelect: (tool) => this.handleToolSelect(tool),
                chart: this.chart,
            });
        } else if (leftPanelContainer) {
            (leftPanelContainer as HTMLElement).style.display = 'none';
        }
    }

    private bindEvents(): void {
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }

    private handleResize(): void {
        this.chart?.handleResize();
    }

    private handleTimeframeChange(timeframe: string): void {
        const timeframeEnum = timeframe as TimeframeEnum;
        this.setActiveTimeframe(timeframeEnum);

        this.preprocessedData = this.preprocessData(this.config.data || [], {
            timeframe: timeframeEnum,
            timezone: this.topPanelState.currentTimezone as TimezoneEnum
        });
        this.chart?.updateData(this.config.data || [], this.preprocessedData);
        this.config.onTimeframeChange?.(timeframe);
    }

    private handleChartTypeChange(type: MainChartType): void {
        this.setCurrentMainChartType(type);
        this.chartType = type;
        this.chart?.updateChartType(type);
        this.config.onChartTypeChange?.(type);
    }

    private handleMainChartIndicatorSelect(indicator: MainChartIndicatorInfo): void {
        this.setSelectedMainChartIndicator(indicator);
        this.config.onMainChartIndicatorSelect?.(indicator);
        this.chart?.addOrUpdateMainChartIndicator(indicator);
        if (indicator.type === MainChartIndicatorType.HEATMAP) {
            // this.chart?.showHeatMap();
        } else if (indicator.type === MainChartIndicatorType.MARKETPROFILE) {
            // this.chart?.showMarketProfile();
        }
    }

    private handleRemoveMainChartIndicator(type: MainChartIndicatorType): void {
        this.chart?.removeMainChartIndicator(type);
    }

    private handleSubChartIndicatorSelect(indicators: SubChartIndicatorType[]): void {
        this.setSelectedSubChartIndicators(indicators);
        this.topPanel?.setSelectedSubChartIndicators(indicators);
        this.config.onSubChartIndicatorSelect?.(indicators);
        if (!this.chart || !this.chart.chartPanesManager) return;
        this.chart.chartPanesManager.removeAllPane();
        indicators.forEach(indicatorType => {
            this.chart?.addSubChart(
                indicatorType,
                (t) => this.handleSubChartSettingsClick(t),
                (t) => this.handleSubChartCloseClick(t)
            );
        });
    }

    private handleSubChartSettingsClick(type: SubChartIndicatorType): void {
        const params = this.chart?.chartPanesManager?.getParamsByIndicatorType(type) || [];
        this.chart?.openSubChartIndicatorsModal(params, type);
    }

    private handleSubChartCloseClick(type: SubChartIndicatorType): void {
        const newIndicators = this.topPanelState.selectedSubChartIndicators.filter(t => t !== type);
        this.setSelectedSubChartIndicators(newIndicators);
        this.topPanel?.setSelectedSubChartIndicators(newIndicators);
        this.config.onSubChartIndicatorSelect?.(newIndicators);
        if (!this.chart || !this.chart.chartPanesManager) return;
        this.chart.chartPanesManager.removeAllPane();
        setTimeout(() => {
            newIndicators.forEach(indicatorType => {
                this.chart?.addSubChart(
                    indicatorType,
                    (t) => this.handleSubChartSettingsClick(t),
                    (t) => this.handleSubChartCloseClick(t)
                );
            });
        }, 50);
    }

    private handleThemeToggle(): void {
        const newThemeType = this.theme.isDark() ? 'light' : 'dark';
        this.setTheme(newThemeType);
        this.config.onThemeToggle?.(newThemeType);
    }


    private handleCameraClick(): void {
        this.config.onCameraClick?.();
    }

    private handleFullscreenClick(): void {
        this.config.onFullscreenClick?.();
    }

    private handleTimezoneSelect(timezone: string): void {
        this.setCurrentTimezone(timezone);

        this.preprocessedData = this.preprocessData(this.config.data || [], {
            timeframe: this.topPanelState.activeTimeframe,
            timezone: timezone as TimezoneEnum
        });
        this.chart?.updateData(this.config.data || [], this.preprocessedData);
        this.config.onTimezoneSelect?.(timezone);
    }

    private handleToolSelect(tool: string): void {

        this.currentTool = tool;

        if (this.toolManager && this.leftPanel) {
            this.toolManager.handleToolSelect(this.leftPanel, tool);
        }
        this.config.onToolSelect?.(tool);
    }

    public getCurrentTool(): string | null {
        return this.currentTool;
    }

    public clearCurrentTool(): void {
        if (this.toolManager) {
            this.toolManager.clearCurrentTool();
        }
        this.currentTool = null;
    }

    public getDrawingState(): DrawingManagerState | null {
        return this.chart?.getDrawingState() || null;
    }

    public setCursorType(cursorType: CursorType): void {
        this.chart?.setCursorType(cursorType);
    }

    public showAllMarks(): void {
        this.chart?.showAllMark();
    }

    public hideAllMarks(): void {
        this.chart?.hideAllMark();
    }

    public clearAllMarks(): void {
        this.chart?.clearAllMark();
    }

    public setData(data: ICandleViewDataPoint[]): void {
        this.config.data = data;
        this.preprocessedData = this.preprocessData(data, {
            timeframe: this.topPanelState.activeTimeframe,
            timezone: this.topPanelState.currentTimezone as TimezoneEnum
        });
        this.chart?.updateData(data, this.preprocessedData);
    }

    public getCurrentTheme(): ThemeConfig {
        return this.currentTheme;
    }

    public setTheme(themeType: 'light' | 'dark'): void {
        this.theme.setTheme(themeType);
        this.currentTheme = this.theme.isDark() ? Dark : Light;
        const colors = this.theme.getColors();
        if (this.rootEl) {
            this.rootEl.style.background = colors.background;
        }
        this.topPanel?.updateTheme(this.theme);  
        this.leftPanel?.updateTheme(this.theme); 
        this.chart?.updateTheme(this.theme);     
    }

    public setChartType(type: MainChartType): void {
        this.setCurrentMainChartType(type);
        this.chartType = type;
        this.chart?.updateChartType(type);
    }

    public setLocale(locale: 'en' | 'zh-cn'): void {
        setLocale(locale);
        this.i18n = getI18n();
        this.topPanel?.updateI18n(this.i18n);
        this.leftPanel?.updateI18n(this.i18n);
        this.chart?.updateI18n(this.i18n);
    }

    public getChart(): Chart | null {
        return this.chart;
    }

    public destroy(): void {
        this.topPanel?.destroy();
        this.leftPanel?.destroy();
        this.chart?.destroy();
        this.rootEl?.remove();
        if (this.isOwnContainer && this.container.parentNode) {
            this.container.remove();
        }
        window.removeEventListener('resize', () => this.handleResize());
    }
}