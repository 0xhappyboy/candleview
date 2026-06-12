import { DrawingManagerState } from '../chart/DrawingManager';
import { ThemeConfig } from '../theme';
import { CursorType, ICandleViewDataPoint, MainChartIndicatorType, MainChartType, PriceEvent, StaticMarkDirection, StaticMarkType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from '../types';
import { IStaticMarkOptions, IStaticMarkItem, CandleViewMark } from './CandleViewMark';
import { CandleViewConfig } from './types';
import { CandleViewDOM } from './CandleViewDOM';
import { CandleViewData } from './CandleViewData';
import { CandleViewChart } from './CandleViewChart';
import { CandleViewPanels } from './CandleViewPanels';
import { CandleViewPriceEvents } from './CandleViewPriceEvents';
import { CandleViewBrushHint } from './CandleViewBrushHint';
import { setLocale, getI18n } from '../i18n';
import { Theme, Dark, Light } from '../theme';
import { MainChartIndicatorInfo, DEFAULT_MA, DEFAULT_EMA, DEFAULT_BOLLINGER, DEFAULT_ICHIMOKU, DEFAULT_DONCHIAN, DEFAULT_ENVELOPE, DEFAULT_VWAP, DEFAULT_HEATMAP, DEFAULT_MARKETPROFILE } from '../Indicators/mainchart/MainChartIndicatorInfo';
import { DEFAULT_LEFT_PANEL_STATE } from '../components/leftpanel/LeftPanelState';
import { DEFAULT_TOP_PANEL_STATE } from '../components/toppanel/TopPanelState';

export class CandleView {
    private dom: CandleViewDOM;
    private theme: Theme;
    private i18n: any;
    private dataManager: CandleViewData;
    private candleViewChart: CandleViewChart;
    private panels: CandleViewPanels | null = null;
    private priceEvents: CandleViewPriceEvents | null = null;
    public marks: CandleViewMark | null = null;
    private brushHint: CandleViewBrushHint | null = null;
    private config: CandleViewConfig;
    private container: HTMLElement;
    private isOwnContainer: boolean;
    private currentTheme: ThemeConfig;
    private topPanelState = { ...DEFAULT_TOP_PANEL_STATE };
    private leftPanelState = { ...DEFAULT_LEFT_PANEL_STATE };
    private currentTimeframe: TimeframeEnum;
    private currentTimezone: TimezoneEnum;
    private chartType: MainChartType;
    private onTimeframeChangeCallback: ((candleView: CandleView, timeframe: TimeframeEnum) => void) | null = null;
    private isDataLoaded: boolean = false;
    private pendingData: ICandleViewDataPoint[] | null = null;

    constructor(config: CandleViewConfig) {
        this.config = config;
        const { container, isOwn } = this.resolveContainer(config);
        this.container = container;
        this.isOwnContainer = isOwn;
        this.chartType = config.chartType || MainChartType.Candle;
        this.currentTimeframe = config.timeframe || TimeframeEnum.FIFTEEN_MINUTES;
        this.currentTimezone = config.timezone || TimezoneEnum.NEW_YORK;
        this.topPanelState.activeTimeframe = this.currentTimeframe;
        this.topPanelState.currentTimezone = this.currentTimezone;
        this.topPanelState.currentMainChartType = this.chartType;
        this.theme = new Theme(config.theme || 'dark');
        this.currentTheme = this.theme.isDark() ? Dark : Light;
        setLocale(config.locale || 'zh-cn');
        this.i18n = getI18n();
        this.dom = new CandleViewDOM();
        this.initDOM();
        this.candleViewChart = new CandleViewChart(this.dom.getChartContainerEl()!, this.theme, this.i18n, this.chartType, config.title);
        this.candleViewChart.showLoader();
        setTimeout(() => {
            this.candleViewChart.updateLoaderProgress(5, 'Creating DOM...');
        }, 1);
        this.dataManager = new CandleViewData(
            config.data || [],
            this.currentTimeframe,
            this.currentTimezone
        );
        setTimeout(() => {
            this.candleViewChart.updateLoaderProgress(20, 'Data Manager Initialized');
        }, 2);
        this.candleViewChart.init(this.dataManager.getPreprocessedData());
        setTimeout(() => {
            this.candleViewChart.updateLoaderProgress(35, 'Chart Initialized');
        }, 3);
        this.initPanels();
        setTimeout(() => {
            this.candleViewChart.updateLoaderProgress(50, 'Panels Initialized');
        }, 4);
        this.marks = new CandleViewMark(this.candleViewChart);
        this.marks.setTimezone(this.currentTimezone);
        setTimeout(() => {
            this.candleViewChart.updateLoaderProgress(65, 'Marks Initialized');
        }, 5);
        this.brushHint = new CandleViewBrushHint(this.theme, this.i18n);
        this.brushHint.injectStyles();
        setTimeout(() => {
            this.candleViewChart.updateLoaderProgress(80, 'Brush Hint Initialized');
        }, 6);
        this.priceEvents = new CandleViewPriceEvents(this.candleViewChart, this.dataManager, this.currentTheme);
        setTimeout(() => {
            this.candleViewChart.updateLoaderProgress(95, 'Price Events Initialized');
        }, 7);
        this.isDataLoaded = true;
        this.candleViewChart.updateLoaderProgress(100, 'Ready');
        setTimeout(() => {
            this.candleViewChart.hideLoader();
        }, 200);
        window.addEventListener('resize', () => this.handleResize());
    }

    private resolveContainer(config: CandleViewConfig): { container: HTMLElement; isOwn: boolean } {
        if (config.container) return { container: config.container, isOwn: false };
        if (config.containerSelector) {
            const el = document.querySelector(config.containerSelector);
            if (!el) throw new Error(`[CandleView] Container not found: ${config.containerSelector}`);
            return { container: el as HTMLElement, isOwn: false };
        }
        if (config.id) {
            const el = document.getElementById(config.id);
            if (!el) throw new Error(`[CandleView] Container not found: #${config.id}`);
            return { container: el, isOwn: false };
        }
        if (config.parent) {
            const container = this.createAutoContainer();
            config.parent.appendChild(container);
            return { container, isOwn: true };
        }
        if (config.parentSelector) {
            const parent = document.querySelector(config.parentSelector);
            if (!parent) throw new Error(`[CandleView] Parent not found: ${config.parentSelector}`);
            const container = this.createAutoContainer();
            parent.appendChild(container);
            return { container, isOwn: true };
        }
        throw new Error('[CandleView] Must provide container, containerSelector, id, parent, or parentSelector');
    }

    private createAutoContainer(): HTMLElement {
        const div = document.createElement('div');
        div.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;';
        return div;
    }

    private initDOM(): void {
        this.dom.create(this.container, this.theme.getColors());
    }

    private initPanels(): void {
        this.panels = new CandleViewPanels({
            technologyPanelContainer: this.config.technologyPanel !== false ? this.dom.getTechnologyPanelContainer() : null,
            drawingPanelContainer: this.config.drawingPanel !== false ? this.dom.getDrawingPanelContainer() : null,
            rootContainer: this.dom.getRootEl()!,
            theme: this.theme,
            i18n: this.i18n,
            chartManager: this.candleViewChart,
            dataManager: this.dataManager,
            brushHint: this.brushHint,
            marks: this.marks,
            candleView: this,
            topPanelState: this.topPanelState, 
            leftPanelState: this.leftPanelState, 
            onTimeframeChange: (tf: TimeframeEnum) => this.handleTimeframeChange(tf),
            onChartTypeChange: (type: MainChartType) => this.handleChartTypeChange(type),
            onThemeToggle: () => this.handleThemeToggle(),
            onToolSelect: (tool: string) => this.config.onToolSelect?.(tool),
            onFullscreenClick: () => this.config.onFullscreenClick?.(),
            onTimezoneSelect: (tz: TimezoneEnum) => this.handleTimezoneSelect(tz),
            onMainChartIndicatorSelect: (indicator: MainChartIndicatorInfo) => {
                this.candleViewChart.getChart()?.addOrUpdateMainChartIndicator(indicator);
                this.config.onMainChartIndicatorSelect?.(indicator);
            },
            onSubChartIndicatorSelect: (indicators: SubChartIndicatorType[]) => {
                const chart = this.candleViewChart.getChart();
                if (!chart) return;
                const currentEnabled = this.getEnabledSubChartIndicators();
                const toAdd = indicators.filter(ind => !currentEnabled.includes(ind));
                const toRemove = currentEnabled.filter(ind => !indicators.includes(ind));
                toRemove.forEach(indicatorType => {
                    chart.removeSubChart(indicatorType);
                });
                toAdd.forEach(indicatorType => {
                    chart.addSubChart(
                        indicatorType,
                        (type) => {
                            if (chart) {
                                const currentParams = chart.chartPanesManager?.getParamsByIndicatorType(type) || [];
                                chart.openSubChartIndicatorsModal(currentParams, type);
                            }
                        },
                        (type) => {
                            chart.removeSubChart(type);
                            this.syncSubChartIndicatorState();
                        }
                    );
                });
                this.config.onSubChartIndicatorSelect?.(indicators);
            },
        });
        this.panels.init();
    }


    private handleTimeframeChange(timeframe: TimeframeEnum): void {
        if (this.onTimeframeChangeCallback) {
            this.onTimeframeChangeCallback(this, timeframe);
        } else {
            this.currentTimeframe = timeframe;

            if (this.isDataLoaded) {
                this.candleViewChart.showLoader();
                this.candleViewChart.updateLoaderProgress(100, 'changingTimeframe');
            }

            this.dataManager.setTimeframe(timeframe);
            this.dataManager.refresh();
            this.candleViewChart.setData(this.dataManager.getPreprocessedData());
            setTimeout(() => this.marks?.reapplyMarks(), 100);

            if (this.isDataLoaded) {
                setTimeout(() => {
                    this.candleViewChart.hideLoader();
                }, 300);
            }
            this.config.onTimeframeChange?.(timeframe);
        }
    }

    private handleTimezoneSelect(timezone: TimezoneEnum): void {
        this.currentTimezone = timezone;

        if (this.isDataLoaded) {
            this.candleViewChart.showLoader();
            this.candleViewChart.updateLoaderProgress(100, 'changingTimezone');
        }

        this.dataManager.setTimezone(timezone);
        this.dataManager.refresh();
        this.candleViewChart.setData(this.dataManager.getPreprocessedData());
        this.marks?.setTimezone(timezone);
        setTimeout(() => this.marks?.reapplyMarks(), 100);

        if (this.isDataLoaded) {
            setTimeout(() => {
                this.candleViewChart.hideLoader();
            }, 300);
        }
        this.config.onTimezoneSelect?.(timezone);
    }


    private handleChartTypeChange(type: MainChartType): void {
        this.chartType = type;
        if (this.isDataLoaded) {
            this.candleViewChart.updateChartType(type);
        }
        this.config.onChartTypeChange?.(type);
    }

    private handleThemeToggle(): void {
        const newType = this.theme.isDark() ? 'light' : 'dark';
        this.theme.setTheme(newType);
        this.currentTheme = this.theme.isDark() ? Dark : Light;
        this.dom.getRootEl()?.style.setProperty('background', this.theme.getColors().background);
        if (this.isDataLoaded) {
            this.candleViewChart.updateTheme(this.theme);
        }
        this.brushHint?.updateTheme();
        this.panels?.updateTheme(this.theme);
        this.config.onThemeToggle?.(newType);
    }

    private handleResize(): void {
        this.candleViewChart.getChart()?.handleResize();
    }

    public setData(data: ICandleViewDataPoint[], showProgress: boolean = false): void {
        if (!this.isDataLoaded) {
            this.pendingData = data;
            this.dataManager.setData(data);
            return;
        }
        if (showProgress) {
            this.candleViewChart.showLoader();
            this.candleViewChart.updateLoaderProgress(100, 'loadingData');
            this.dataManager.setData(data);
            this.candleViewChart.setData(this.dataManager.getPreprocessedData());
            setTimeout(() => {
                this.candleViewChart.hideLoader();
            }, 300);
        } else {
            this.dataManager.setData(data);
            this.candleViewChart.setData(this.dataManager.getPreprocessedData());
        }
    }

    public updateData(newData: ICandleViewDataPoint[]): void {
        if (!this.isDataLoaded) {
            this.pendingData = [...(this.pendingData || []), ...newData];
            this.dataManager.appendData(newData);
            return;
        }
        const chart = this.candleViewChart.getChart();
        const savedRange = chart?.getChart()?.timeScale().getVisibleLogicalRange();
        this.dataManager.appendData(newData);
        this.candleViewChart.setData(this.dataManager.getPreprocessedData());
        if (savedRange && chart?.getChart()) {
            setTimeout(() => chart.getChart()?.timeScale().setVisibleLogicalRange(savedRange), 0);
        }
    }

    public setTheme(themeType: 'light' | 'dark'): void {
        this.theme.setTheme(themeType);
        this.currentTheme = this.theme.isDark() ? Dark : Light;
        this.dom.getRootEl()?.style.setProperty('background', this.theme.getColors().background);
        if (this.isDataLoaded) {
            this.candleViewChart.updateTheme(this.theme);
        }
        this.brushHint?.updateTheme();
        this.panels?.updateTheme(this.theme);
    }

    public setLocale(locale: 'en' | 'zh-cn'): void {
        setLocale(locale);
        this.i18n = getI18n();
        this.panels?.updateI18n(this.i18n);
        if (this.isDataLoaded) {
            this.candleViewChart.updateI18n(this.i18n);
        }
        this.brushHint?.updateI18n(this.i18n);
    }

    public setOnTimeframeChangeCallback(callback: (candleView: CandleView, timeframe: TimeframeEnum) => void): void {
        this.onTimeframeChangeCallback = callback;
    }

    public getOnTimeframeChangeCallback(): ((candleView: CandleView, timeframe: TimeframeEnum) => void) | null {
        return this.onTimeframeChangeCallback;
    }

    public setChartType(type: MainChartType): void {
        if (this.isDataLoaded) {
            this.candleViewChart.updateChartType(type);
        }
    }

    public getCurrentTheme(): ThemeConfig {
        return this.currentTheme;
    }

    public getTopPanelState() {
        return { ...this.topPanelState };
    }

    public getLeftPanelState() {
        return { ...this.leftPanelState };
    }

    public getDrawingState(): DrawingManagerState | null {
        return this.candleViewChart.getChart()?.getDrawingState() || null;
    }

    public setCursorType(cursorType: CursorType): void {
        this.candleViewChart.getChart()?.setCursorType(cursorType);
    }

    public showAllMarks(): void {
        this.candleViewChart.getChart()?.showAllMark();
    }

    public hideAllMarks(): void {
        this.candleViewChart.getChart()?.hideAllMark();
    }

    public clearAllMarks(): void {
        this.candleViewChart.getChart()?.clearAllMark();
    }

    public clearCurrentTool(): void {
    }

    public getCurrentTool(): string | null {
        return null;
    }

    public registerPriceEvents(events: PriceEvent[]): void {
        if (this.isDataLoaded) {
            this.priceEvents?.register(events);
        }
    }

    public removePriceEventMarker(price: number): void {
        this.priceEvents?.remove(price);
    }

    public clearAllPriceEventMarkers(): void {
        this.priceEvents?.clearAll();
    }

    public getPriceEvents(): PriceEvent[] {
        return this.priceEvents?.getAll() || [];
    }

    public addStaticMark(
        time: number,
        text: string,
        direction: StaticMarkDirection,
        type: StaticMarkType,
        options?: IStaticMarkOptions
    ): void {
        this.marks?.addStaticMark(time, text, direction, type, options);
    }

    public addStaticMarks(marks: IStaticMarkItem[]): void {
        this.marks?.addStaticMarks(marks);
    }

    public addTextMark(
        time: number,
        text: string,
        direction: StaticMarkDirection,
        options?: IStaticMarkOptions
    ): void {
        this.marks?.addTextMark(time, text, direction, options);
    }

    public addArrowMark(
        time: number,
        direction: StaticMarkDirection,
        options?: IStaticMarkOptions & { label?: string }
    ): void {
        this.marks?.addArrowMark(time, direction, options);
    }

    public addTextMarks(
        marks: Array<{
            time: number;
            text: string;
            direction: StaticMarkDirection;
            options?: IStaticMarkOptions;
        }>
    ): void {
        this.marks?.addTextMarks(marks);
    }

    public addArrowMarks(
        marks: Array<{
            time: number;
            direction: StaticMarkDirection;
            options?: IStaticMarkOptions & { label?: string };
        }>
    ): void {
        this.marks?.addArrowMarks(marks);
    }

    public clearAllStaticMarks(): void {
        this.marks?.clearAllStaticMarks();
    }

    public getStaticMarkCount(): number {
        return this.marks?.getStaticMarkCount() || 0;
    }

    public getChart() {
        return this.candleViewChart.getChart();
    }

    public setTitle(title: string) {
        this.getChart()?.setTitle(title);
    }

    public openMainChartIndicator(
        indicatorType: MainChartIndicatorType,
        params?: Record<string, any>
    ): void {
        const chart = this.candleViewChart.getChart();
        if (!chart || !this.isDataLoaded) return;
        let indicatorInfo: MainChartIndicatorInfo | null = null;
        switch (indicatorType) {
            case MainChartIndicatorType.MA:
                indicatorInfo = { ...DEFAULT_MA, nonce: Date.now() };
                break;
            case MainChartIndicatorType.EMA:
                indicatorInfo = { ...DEFAULT_EMA, nonce: Date.now() };
                break;
            case MainChartIndicatorType.BOLLINGER:
                indicatorInfo = { ...DEFAULT_BOLLINGER, nonce: Date.now() };
                break;
            case MainChartIndicatorType.ICHIMOKU:
                indicatorInfo = { ...DEFAULT_ICHIMOKU, nonce: Date.now() };
                break;
            case MainChartIndicatorType.DONCHIAN:
                indicatorInfo = { ...DEFAULT_DONCHIAN, nonce: Date.now() };
                break;
            case MainChartIndicatorType.ENVELOPE:
                indicatorInfo = { ...DEFAULT_ENVELOPE, nonce: Date.now() };
                break;
            case MainChartIndicatorType.VWAP:
                indicatorInfo = { ...DEFAULT_VWAP, nonce: Date.now() };
                break;
            case MainChartIndicatorType.HEATMAP:
                indicatorInfo = { ...DEFAULT_HEATMAP, nonce: Date.now() };
                break;
            case MainChartIndicatorType.MARKETPROFILE:
                indicatorInfo = { ...DEFAULT_MARKETPROFILE, nonce: Date.now() };
                break;
            default:
                return;
        }
        if (params && indicatorInfo) {
            indicatorInfo.parameters = { ...indicatorInfo.parameters, ...params };
        }
        if (indicatorInfo) {
            chart.addOrUpdateMainChartIndicator(indicatorInfo);
        }
    }

    public closeMainChartIndicator(indicatorType: MainChartIndicatorType): void {
        const chart = this.candleViewChart.getChart();
        if (!chart || !this.isDataLoaded) return;
        if (indicatorType === MainChartIndicatorType.HEATMAP) {
            chart.hideHeatMap();
            chart.removeMainChartIndicator(indicatorType);
            return;
        }
        if (indicatorType === MainChartIndicatorType.MARKETPROFILE) {
            chart.hideMarketProfile();
            chart.removeMainChartIndicator(indicatorType);
            return;
        }
        chart.removeMainChartIndicator(indicatorType);
    }

    public closeAllMainChartIndicators(): void {
        const chart = this.candleViewChart.getChart();
        if (!chart || !this.isDataLoaded) return;
        chart.hideHeatMap();
        chart.removeMainChartIndicator(MainChartIndicatorType.HEATMAP);
        chart.hideMarketProfile();
        chart.removeMainChartIndicator(MainChartIndicatorType.MARKETPROFILE);
        const allMainIndicatorTypes = [
            MainChartIndicatorType.MA,
            MainChartIndicatorType.EMA,
            MainChartIndicatorType.BOLLINGER,
            MainChartIndicatorType.ICHIMOKU,
            MainChartIndicatorType.DONCHIAN,
            MainChartIndicatorType.ENVELOPE,
            MainChartIndicatorType.VWAP
        ];
        allMainIndicatorTypes.forEach(type => {
            chart.removeMainChartIndicator(type);
        });
    }

    public openSubChartIndicator(
        indicatorType: SubChartIndicatorType,
        onOpenModal?: (type: SubChartIndicatorType) => void,
        onClose?: (type: SubChartIndicatorType) => void
    ): void {
        const chart = this.candleViewChart.getChart();
        if (!chart || !this.isDataLoaded) return;
        chart.addSubChart(
            indicatorType,
            (type) => {
                if (chart) {
                    const currentParams = chart.chartPanesManager?.getParamsByIndicatorType(type) || [];
                    chart.openSubChartIndicatorsModal(currentParams, type);
                }
                onOpenModal?.(type);
            },
            (type) => {
                chart.removeSubChart(type);
                onClose?.(type);
            }
        );
        this.syncSubChartIndicatorState();
    }

    public closeSubChartIndicator(indicatorType: SubChartIndicatorType): void {
        const chart = this.candleViewChart.getChart();
        if (!chart || !this.isDataLoaded) return;
        chart.removeSubChart(indicatorType);
        this.syncSubChartIndicatorState();
    }

    public closeAllSubChartIndicators(): void {
        const chart = this.candleViewChart.getChart();
        if (!chart || !this.isDataLoaded) return;
        const allSubIndicatorTypes = [
            SubChartIndicatorType.RSI,
            SubChartIndicatorType.MACD,
            SubChartIndicatorType.VOLUME,
            SubChartIndicatorType.SAR,
            SubChartIndicatorType.KDJ,
            SubChartIndicatorType.ATR,
            SubChartIndicatorType.STOCHASTIC,
            SubChartIndicatorType.CCI,
            SubChartIndicatorType.BBWIDTH,
            SubChartIndicatorType.ADX,
            SubChartIndicatorType.OBV
        ];
        allSubIndicatorTypes.forEach(type => {
            chart.removeSubChart(type);
        });
        this.syncSubChartIndicatorState();
    }

    private syncSubChartIndicatorState(): void {
        const enabledIndicators = this.getEnabledSubChartIndicators();
        if (this.panels && (this.panels as any).topPanel) {
            const topPanel = (this.panels as any).topPanel;
            if (topPanel && typeof topPanel.setSelectedSubChartIndicators === 'function') {
                topPanel.setSelectedSubChartIndicators(enabledIndicators);
            }
        }
    }

    public isMainChartIndicatorEnabled(indicatorType: MainChartIndicatorType): boolean {
        const chart = this.candleViewChart.getChart();
        if (!chart) return false;
        return chart.isMainChartIndicatorEnabled?.(indicatorType) ?? false;
    }

    public isSubChartIndicatorEnabled(indicatorType: SubChartIndicatorType): boolean {
        const chart = this.candleViewChart.getChart();
        if (!chart) return false;
        return chart.isSubChartIndicatorEnabled?.(indicatorType) ?? false;
    }

    public getEnabledMainChartIndicators(): MainChartIndicatorType[] {
        const chart = this.candleViewChart.getChart();
        if (!chart) return [];
        return chart.getEnabledMainChartIndicators?.() ?? [];
    }

    public getEnabledSubChartIndicators(): SubChartIndicatorType[] {
        const chart = this.candleViewChart.getChart();
        if (!chart) return [];
        return chart.getEnabledSubChartIndicators?.() ?? [];
    }

    public async captureScreenshot(watermark: string = "CandleView", watermarkOpacity: number = 0.15): Promise<string> {
        const chartContainer = this.dom.getChartContainerEl();
        if (!chartContainer) throw new Error('[CandleView] Chart container not found');
        await new Promise(r => setTimeout(r, 100));
        const rect = chartContainer.getBoundingClientRect();
        const resultCanvas = document.createElement('canvas');
        resultCanvas.width = rect.width * devicePixelRatio;
        resultCanvas.height = rect.height * devicePixelRatio;
        const ctx = resultCanvas.getContext('2d')!;
        ctx.scale(devicePixelRatio, devicePixelRatio);
        ctx.fillStyle = this.theme.getColors().background;
        ctx.fillRect(0, 0, rect.width, rect.height);
        const canvases = chartContainer.querySelectorAll('canvas');
        for (let i = 0; i < canvases.length; i++) {
            const c = canvases[i];
            const cRect = c.getBoundingClientRect();
            ctx.drawImage(c, cRect.left - rect.left, cRect.top - rect.top, cRect.width, cRect.height);
        }
        const fontSize = Math.max(40, Math.min(rect.width / 8, 80));
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const isDark = this.theme.isDark();
        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${watermarkOpacity})` : `rgba(0, 0, 0, ${watermarkOpacity})`;
        ctx.fillText(watermark, rect.width / 2, rect.height / 2);
        return resultCanvas.toDataURL('image/png');
    }

    public destroy(): void {
        this.panels?.destroy();
        this.candleViewChart.destroy();
        this.marks?.destroy();
        this.dom.destroy();
        if (this.isOwnContainer && this.container.parentNode) {
            this.container.remove();
        }
        window.removeEventListener('resize', () => this.handleResize());
    }
}