import { CandleViewConfig, ICandleViewDataPoint, MainChartType } from './types';
import { Theme } from './theme';
import { getI18n, I18n, setLocale } from './i18n';
import { Chart } from './chart/Chart';
import { LeftPanel } from './components/leftpanel/LeftPanel';
import { TopPanel } from './components/toppanel/TopPanel';

export class CandleView {
    private container: HTMLElement;
    private config: CandleViewConfig;
    private theme: Theme;
    private i18n: I18n;
    private chart: Chart | null = null;
    private topPanel: TopPanel | null = null;
    private leftPanel: LeftPanel | null = null;

    private rootEl: HTMLElement | null = null;
    private chartContainerEl: HTMLElement | null = null;

    constructor(config: CandleViewConfig) {
        this.container = config.container;
        this.config = {
            title: '',
            data: [],
            theme: 'dark',
            locale: 'zh-cn',
            showTopPanel: true,
            showLeftPanel: true,
            ...config
        };

        this.theme = new Theme(this.config.theme);
        setLocale(this.config.locale || 'zh-cn');
        this.i18n = getI18n();

        this.init();
    }

    private init(): void {
        this.createDOM();
        this.initChart();
        this.initPanels();
        this.bindEvents();
    }

    private createDOM(): void {
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';

        const colors = this.theme.getColors();

        this.rootEl = document.createElement('div');
        this.rootEl.className = 'candleview-root';
        this.rootEl.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: ${colors.background};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            user-select: none;
            overflow: hidden;
        `;

        const topPanelContainer = document.createElement('div');
        topPanelContainer.className = 'candleview-top-panel-container';
        this.rootEl.appendChild(topPanelContainer);

        const mainContent = document.createElement('div');
        mainContent.className = 'candleview-main-content';
        mainContent.style.cssText = `
            display: flex;
            flex: 1;
            min-height: 0;
            position: relative;
        `;

        const leftPanelContainer = document.createElement('div');
        leftPanelContainer.className = 'candleview-left-panel-container';
        mainContent.appendChild(leftPanelContainer);

        this.chartContainerEl = document.createElement('div');
        this.chartContainerEl.className = 'candleview-chart-container';
        this.chartContainerEl.style.cssText = `
            flex: 1;
            position: relative;
            min-height: 0;
        `;
        mainContent.appendChild(this.chartContainerEl);

        this.rootEl.appendChild(mainContent);
        this.container.appendChild(this.rootEl);

        const chartCanvasContainer = document.createElement('div');
        chartCanvasContainer.className = 'candleview-chart-canvas';
        chartCanvasContainer.style.cssText = `
            width: 100%;
            height: 100%;
            position: relative;
        `;
        this.chartContainerEl.appendChild(chartCanvasContainer);

        (this as any).chartCanvasContainer = chartCanvasContainer;
    }

    private initChart(): void {
        this.chart = new Chart({
            container: (this as any).chartCanvasContainer,
            data: this.config.data || [],
            theme: this.theme,
            chartType: MainChartType.Candle
        });
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
                onTimeframeSelect: (tf) => this.handleTimeframeChange(tf),
                onChartTypeSelect: (type) => this.handleChartTypeChange(type),
                onIndicatorSelect: (indicator) => this.handleIndicatorSelect(indicator)
            });
        } else if (topPanelContainer) {
            (topPanelContainer as HTMLElement).style.display = 'none';
        }

        if (this.config.showLeftPanel && leftPanelContainer) {
            this.leftPanel = new LeftPanel({
                container: leftPanelContainer as HTMLElement,
                theme: this.theme,
                i18n: this.i18n,
                onToolSelect: (tool) => this.handleToolSelect(tool)
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
        this.config.onTimeframeChange?.(timeframe);
    }

    private handleChartTypeChange(type: MainChartType): void {
        this.chart?.updateChartType(type);
        this.config.onChartTypeChange?.(type);
    }

    private handleIndicatorSelect(indicator: string): void {
        this.config.onIndicatorSelect?.(indicator);
    }

    private handleToolSelect(tool: string): void {
        this.config.onToolSelect?.(tool);
    }

    public setData(data: ICandleViewDataPoint[]): void {
        this.config.data = data;
        this.chart?.updateData(data);
    }

    public setTheme(theme: 'light' | 'dark'): void {
        this.theme.setTheme(theme);
        const colors = this.theme.getColors();
        if (this.rootEl) {
            this.rootEl.style.background = colors.background;
        }
        this.topPanel?.updateTheme(this.theme);
        this.leftPanel?.updateTheme(this.theme);
        this.chart?.updateTheme(this.theme);
    }

    public setLocale(locale: 'en' | 'zh-cn'): void {
        setLocale(locale);
        this.i18n = getI18n();
        this.topPanel?.updateI18n(this.i18n);
    }

    public destroy(): void {
        this.topPanel?.destroy();
        this.leftPanel?.destroy();
        this.chart?.destroy();
        this.rootEl?.remove();
        window.removeEventListener('resize', () => this.handleResize());
    }
}