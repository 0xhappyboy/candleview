import { CandleViewConfig, CoreState } from './types';
import { CandleViewDOM } from './CandleViewDOM';
import { CandleViewData } from './CandleViewData';
import { CandleViewChart } from './CandleViewChart';
import { CandleViewPanels } from './CandleViewPanels';
import { CandleViewPriceEvents } from './CandleViewPriceEvents';
import { CandleViewBrushHint } from './CandleViewBrushHint';
import { Chart } from '../chart/Chart';
import { DrawingManagerState } from '../chart/DrawingManager';
import { DEFAULT_LEFT_PANEL_STATE } from '../components/leftpanel/LeftPanelState';
import { DEFAULT_TOP_PANEL_STATE } from '../components/toppanel/TopPanelState';
import { setLocale, getI18n } from '../i18n';
import { Theme, Dark, Light, ThemeConfig } from '../theme';
import { MainChartType, TimeframeEnum, TimezoneEnum, CursorType, ICandleViewDataPoint, PriceEvent } from '../types';

export class CandleViewCore {
    private state: CoreState;
    public dom: CandleViewDOM;
    public brush: CandleViewBrushHint;
    public data: CandleViewData;
    public chart: CandleViewChart;
    public panels: CandleViewPanels;
    public priceEvents: CandleViewPriceEvents;

    constructor(config: CandleViewConfig) {
        const { container, isOwn } = this.resolveContainer(config);
        const chartType = config.chartType || MainChartType.Candle;
        const theme = new Theme(config.theme || 'dark');
        const currentTheme = theme.isDark() ? Dark : Light;
        setLocale(config.locale || 'zh-cn');
        const i18n = getI18n();
        const topPanelState = { ...DEFAULT_TOP_PANEL_STATE };
        const leftPanelState = { ...DEFAULT_LEFT_PANEL_STATE };

        if (config.activeTimeframe) {
            topPanelState.activeTimeframe = config.activeTimeframe as TimeframeEnum;
        }
        if (config.currentTimezone) {
            topPanelState.currentTimezone = config.currentTimezone;
        }

        this.state = {
            config: {
                title: '',
                data: [],
                theme: 'dark',
                locale: 'zh-cn',
                showTopPanel: true,
                showLeftPanel: true,
                chartType: chartType,
                ...config
            },
            container,
            isOwnContainer: isOwn,
            chartType,
            theme,
            currentTheme,
            i18n,
            topPanelState,
            leftPanelState,
            rawData: config.data || [],
            currentTimeframe: (config.activeTimeframe as TimeframeEnum) || TimeframeEnum.FIFTEEN_MINUTES,
            currentTimezone: (config.currentTimezone as TimezoneEnum) || TimezoneEnum.SHANGHAI,
            rootEl: null,
            chartContainerEl: null
        };
        this.dom = new CandleViewDOM(this.state);
        this.brush = new CandleViewBrushHint(this.state, this.state.i18n);
        this.data = new CandleViewData(this.state);
        this.chart = new CandleViewChart(this.state, this.data, this.brush);
        this.panels = new CandleViewPanels(this.state, this.data, this.brush, this.chart);
        this.priceEvents = new CandleViewPriceEvents(this.state, this.data, this.chart);
        this.init();
    }

    private init(): void {
        this.brush.injectStyles();
        this.dom.create();
        this.data.refreshViewData();
        this.chart.init();
        this.panels.init();
        this.bindEvents();
    }

    private resolveContainer(config: CandleViewConfig): { container: HTMLElement; isOwn: boolean } {
        if (config.container) return { container: config.container, isOwn: false };
        if (config.containerSelector) {
            const el = document.querySelector(config.containerSelector);
            if (!el) throw new Error(`[CandleView] Container element not found: ${config.containerSelector}`);
            return { container: el as HTMLElement, isOwn: false };
        }
        if (config.id) {
            const el = document.getElementById(config.id);
            if (!el) throw new Error(`[CandleView] Container element not found: #${config.id}`);
            return { container: el, isOwn: false };
        }
        if (config.parent) {
            const container = this.createAutoContainer();
            config.parent.appendChild(container);
            return { container, isOwn: true };
        }
        if (config.parentSelector) {
            const parent = document.querySelector(config.parentSelector);
            if (!parent) throw new Error(`[CandleView] Parent element not found: ${config.parentSelector}`);
            const container = this.createAutoContainer();
            parent.appendChild(container);
            return { container, isOwn: true };
        }
        throw new Error('[CandleView] Must provide one of: container, containerSelector, id, parent, or parentSelector');
    }

    private createAutoContainer(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `width:100%;height:100%;position:relative;overflow:hidden;margin:0;padding:0;box-sizing:border-box;`;
        return container;
    }

    private bindEvents(): void {
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }

    private handleResize(): void {
        this.chart.getChart()?.handleResize();
    }

    public getTopPanelState() { return { ...this.state.topPanelState }; }
    public getLeftPanelState() { return { ...this.state.leftPanelState }; }
    public getDrawingState(): DrawingManagerState | null { return this.chart.getChart()?.getDrawingState() || null; }
    public setCursorType(cursorType: CursorType): void { this.chart.getChart()?.setCursorType(cursorType); }
    public showAllMarks(): void { this.chart.getChart()?.showAllMark(); }
    public hideAllMarks(): void { this.chart.getChart()?.hideAllMark(); }
    public clearAllMarks(): void { this.chart.getChart()?.clearAllMark(); }
    public clearCurrentTool(): void { }
    public getCurrentTool(): string | null { return null; }

    public setData(data: ICandleViewDataPoint[]): void {
        this.data.setData(data);
        this.chart.getChart()?.setData(data, this.data.getPreprocessedData()!);
    }

    public getCurrentTheme(): ThemeConfig { return this.state.currentTheme; }

    public setTheme(themeType: 'light' | 'dark'): void {
        this.state.theme.setTheme(themeType);
        this.state.currentTheme = this.state.theme.isDark() ? Dark : Light;
        const colors = this.state.theme.getColors();
        this.state.rootEl?.style.setProperty('background', colors.background);
        this.panels.updateTheme(this.state.theme);
        this.chart.updateTheme(this.state.theme);
        this.brush.updateTheme();
    }

    public setLocale(locale: 'en' | 'zh-cn'): void {
        setLocale(locale);
        this.state.i18n = getI18n();
        this.panels.updateI18n(this.state.i18n);
        this.chart.updateI18n(this.state.i18n);
        this.brush.updateI18n(this.state.i18n);
    }

    public setChartType(type: MainChartType): void {
        this.state.topPanelState.currentMainChartType = type;
        this.state.chartType = type;
        this.chart.getChart()?.updateChartType(type);
    }

    public registerPriceEvents(events: PriceEvent[]): void { this.priceEvents.register(events); }
    public removePriceEventMarker(price: number): void { this.priceEvents.remove(price); }
    public clearAllPriceEventMarkers(): void { this.priceEvents.clearAll(); }
    public getPriceEvents(): PriceEvent[] { return this.priceEvents.getAll(); }
    public getChart(): Chart | null { return this.chart.getChart(); }
    public destroy(): void {
        this.panels.destroy();
        this.chart.destroy();
        this.dom.destroy();
        if (this.state.isOwnContainer && this.state.container.parentNode) {
            this.state.container.remove();
        }
        window.removeEventListener('resize', () => this.handleResize());
    }
}