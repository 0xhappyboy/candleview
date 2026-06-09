import {
    createChart,
    IChartApi,
    Time,
    CandlestickData,
    CandlestickSeries,
} from 'lightweight-charts';
import { ICandleViewDataPoint, MainChartType, CursorType, DrawingType, Point, MainChartIndicatorType, SubChartIndicatorType, MarkDrawing } from '../types';
import { Dark, Light, Theme, ThemeConfig } from '../theme';
import { DataPreprocessResult } from '../DataPreprocessor';
import { DrawingManagerState } from './DrawingManager';
import { ChartInfo, ChartInfoData } from './ChartInfo';
import { I18n, getI18n, zhCN } from '../i18n';
import { MainChartIndicatorInfo, MainChartIndicatorParam } from '../Indicators/mainchart/MainChartIndicatorInfo';
import { IMarkStyle } from '../Mark/IMarkStyle';
import { IIndicatorInfo } from '../Indicators/subchart/IIndicator';
import { MainChartManager } from './mainchart/MainChartManager';
import { MarketProfile } from './mainchart/MarketProfile';
import { VolumeHeatMap } from './mainchart/VolumeHeatMap';
import { LOGO } from '../logo';
import { ImageWatermarkManager } from '../MarkManager/Water/ImageWatermarkManager';
import { LeftPanel } from '../components/leftpanel';
import { ChartSeries, updateSeriesTheme } from './ChartTypeManager';
import { ChartEventManager } from './EventManager';

import { ChartIndicatorsManager } from './ChartIndicatorsManager';
import { ChartModalsManager } from './ChartModalsManager';
import { ChartTools } from './ChartTools';

export class Chart {
    public container: HTMLElement;
    public originalData: ICandleViewDataPoint[];
    public preprocessedData: DataPreprocessResult | null = null;
    private theme: Theme;
    private title: string;
    public currentTheme: ThemeConfig;
    private chartType: MainChartType;
    private resizeObserver: ResizeObserver | null = null;
    public chart: IChartApi | null = null;
    public chartSeries: ChartSeries | null = null;
    public hiddenBaseSeries: ChartSeries | null = null;
    public containerRef: { current: HTMLDivElement | null } = { current: null };
    public onCloseDrawing?: () => void;
    private chartInfo: ChartInfo | null = null;
    private chartInfoContainer: HTMLElement | null = null;
    private currentOHLC: { time: string; open: number; high: number; low: number; close: number } | null = null;
    private mousePosition: Point | null = null;
    private showOHLC: boolean = true;
    private originalChartOptions: { handleScroll?: any; handleScale?: any } | null = null;
    private i18n: I18n;
    private chartEventManager: ChartEventManager | null = null;
    private marketProfile: MarketProfile | null = null;
    private volumeHeatMap: VolumeHeatMap | null = null;
    public mainChartManager: MainChartManager | null = null;
    private indicatorUpdateTimer: any = null;
    private panesUpdateTimer: any = null;
    private marketProfileUpdateTimer: any = null;
    private heatMapUpdateTimer: any = null;
    public indicatorsManager: ChartIndicatorsManager;
    public modalsManager: ChartModalsManager;
    public tools: ChartTools;
    public get drawingManager() { return this.tools.drawingManager; }
    public get chartMarkManager() { return this.tools.chartMarkManager; }
    public get currentDrawingType() { return this.tools.currentDrawingType; }
    public set currentDrawingType(v) { this.tools.currentDrawingType = v; }
    public get textMarkToolBar() { return this.tools.textMarkToolBar; }
    public get graphMarkToolBar() { return this.tools.graphMarkToolBar; }
    public get currentMarkSettingsStyle() { return this.tools.currentMarkSettingsStyle; }
    public set currentMarkSettingsStyle(v) { this.tools.currentMarkSettingsStyle = v; }
    public get chartPanesManager() { return this.tools.chartPanesManager; }
    public get leftPanel() { return this.tools.leftPanel; }
    public set leftPanel(v) { this.tools.leftPanel = v; }
    public get onExitBrushMode() { return this.tools.onExitBrushMode; }
    public set onExitBrushMode(v) { this.tools.onExitBrushMode = v; }
    public get indicators() { return this.indicatorsManager.indicators; }
    public get visibleIndicatorTypes() { return this.indicatorsManager.visibleIndicatorTypes; }
    public get mainChartTechnicalIndicatorManager() { return this.indicatorsManager.mainChartTechnicalIndicatorManager; }
    public get maIndicatorValues() { return this.indicatorsManager.maIndicatorValues; }
    public get emaIndicatorValues() { return this.indicatorsManager.emaIndicatorValues; }
    public get bollingerBandsValues() { return this.indicatorsManager.bollingerBandsValues; }
    public get ichimokuValues() { return this.indicatorsManager.ichimokuValues; }
    public get donchianChannelValues() { return this.indicatorsManager.donchianChannelValues; }
    public get envelopeValues() { return this.indicatorsManager.envelopeValues; }
    public get vwapValue() { return this.indicatorsManager.vwapValue; }
    public get imageUploadModal() { return this.modalsManager.imageUploadModal; }
    public get mainChartIndicatorsModal() { return this.modalsManager.mainChartIndicatorsModal; }
    public get subChartIndicatorsModal() { return this.modalsManager.subChartIndicatorsModal; }
    public get textMarkEditorModal() { return this.modalsManager.textMarkEditorModal; }
    public get currentSubChartType() { return this.modalsManager.currentSubChartType; }
    public set currentSubChartType(v) { this.modalsManager.currentSubChartType = v; }

    private onToggleOHLCCallback?: () => void;
    private onOpenIndicatorsModalCallback?: () => void;
    private onRemoveIndicatorCallback?: (type: MainChartIndicatorType) => void;
    private onToggleIndicatorCallback?: (type: MainChartIndicatorType) => void;
    private onEditIndicatorParamsCallback?: (id: string, newParams: MainChartIndicatorParam[]) => void;
    private onOpenIndicatorSettingsCallback?: (indicator: MainChartIndicatorInfo) => void;

    constructor(options: {
        container: HTMLElement;
        data: ICandleViewDataPoint[];
        theme: Theme;
        chartType: MainChartType;
        preprocessedData: DataPreprocessResult;
        i18n: I18n;
        title: string;
        onReady?: () => void;
        onCloseDrawing?: () => void;
        onToggleOHLC?: () => void;
        onOpenIndicatorsModal?: () => void;
        onRemoveIndicator?: (type: MainChartIndicatorType) => void;
        onToggleIndicator?: (type: MainChartIndicatorType) => void;
        onEditIndicatorParams?: (id: string, newParams: MainChartIndicatorParam[]) => void;
        onOpenIndicatorSettings?: (indicator: MainChartIndicatorInfo) => void;
        onImageConfirm?: (imageUrl: string) => void;
        onMainChartIndicatorConfirm?: (indicator: MainChartIndicatorInfo) => void;
        onSubChartIndicatorConfirm?: (params: IIndicatorInfo[]) => void;
        onTextMarkEditorSave?: (text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => void;
        onTextMarkEditorCancel?: () => void;
        onExitBrushMode?: () => void;
        onCrosshairPrice?: (price: number) => void;
    }) {
        this.container = options.container;
        this.containerRef.current = this.container as HTMLDivElement;
        this.originalData = options.data;
        this.theme = options.theme;
        this.title = options.title;
        this.currentTheme = this.theme.isDark() ? Dark : Light;
        this.chartType = options.chartType;
        this.preprocessedData = options.preprocessedData || null;
        this.i18n = options.i18n;
        this.onCloseDrawing = options.onCloseDrawing;
        this.indicatorsManager = new ChartIndicatorsManager(this);
        this.modalsManager = new ChartModalsManager(this, this.container, this.currentTheme, this.i18n);
        this.tools = new ChartTools(this);
        this.tools.onExitBrushMode = options.onExitBrushMode;
        this.modalsManager.setCallbacks({
            onImageConfirm: options.onImageConfirm,
            onMainChartIndicatorConfirm: options.onMainChartIndicatorConfirm,
            onSubChartIndicatorConfirm: options.onSubChartIndicatorConfirm,
            onTextMarkEditorSave: options.onTextMarkEditorSave,
            onTextMarkEditorCancel: options.onTextMarkEditorCancel,
        });
        this.init();
        this.initDrawingManager();
        this.initChartInfo();
        this.initEventManager();
        this.onToggleOHLCCallback = () => {
            this.showOHLC = !this.showOHLC;
            this.updateChartInfoData();
        };
        this.onRemoveIndicatorCallback = (type: MainChartIndicatorType) => {
            this.removeMainChartIndicator(type);
        };
        this.onToggleIndicatorCallback = (type: MainChartIndicatorType) => {
            this.toggleIndicatorVisibility(type);
        };
        this.onEditIndicatorParamsCallback = (id: string, newParams: MainChartIndicatorParam[]) => {
            this.updateIndicatorParams(id, newParams);
        };
        this.onOpenIndicatorSettingsCallback = (indicator: MainChartIndicatorInfo) => {
            this.openMainChartIndicatorsModal(indicator);
        };
        options.onReady?.();
    }

    public showMarketProfile(): void {
        if (this.marketProfile) {
            this.marketProfile.destroy();
            this.marketProfile = null;
        }
        this.marketProfile = new MarketProfile(
            this,
            this.i18n,
            this.currentTheme,
            () => { this.marketProfile = null; }
        );
    }

    public hideMarketProfile(): void {
        this.marketProfile?.destroy();
        this.marketProfile = null;
    }

    public showHeatMap(): void {
        if (this.volumeHeatMap) {
            this.volumeHeatMap.destroy();
            this.volumeHeatMap = null;
        }
        this.volumeHeatMap = new VolumeHeatMap(
            this,
            this.i18n,
            this.currentTheme,
            () => { this.volumeHeatMap = null; }
        );
    }

    public hideHeatMap(): void {
        this.volumeHeatMap?.destroy();
        this.volumeHeatMap = null;
    }

    private initPanesManager(): void {
        this.tools.initPanesManager();
    }

    private initEventManager(): void {
        this.chartEventManager = new ChartEventManager();
        if (this.chart) {
            this.chartEventManager.registerCrosshairMoveEvent(this);
        }
        this.setupDocumentEvents();
        this.setupContainerEvents();
    }

    private setupContainerEvents(): void {
        if (!this.containerRef.current) return;
        const container = this.containerRef.current;
        container.addEventListener('mousedown', this.handleMouseDown);
        container.addEventListener('mousemove', this.handleMouseMove);
        container.addEventListener('mouseup', this.handleMouseUp);
    }

    private setupDocumentEvents(): void {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('mousemove', this.handleDocumentMouseMove);
        document.addEventListener('mousedown', this.handleDocumentMouseDown);
        document.addEventListener('mouseup', this.handleDocumentMouseUp);
        document.addEventListener('wheel', this.handleDocumentMouseWheel);
    }

    private handleMouseDown = (event: MouseEvent): void => {
        this.chartEventManager?.mouseDown(this, event);
    };

    private handleMouseMove = (event: MouseEvent): void => {
        this.chartEventManager?.mouseMove(this, event);
    };

    private handleMouseUp = (event: MouseEvent): void => {
        this.chartEventManager?.mouseUp(this, event);
    };

    private handleDocumentMouseDown = (event: MouseEvent): void => {
        this.chartEventManager?.documentMouseDown(this, event);
    };

    private handleDocumentMouseMove = (event: MouseEvent): void => {
        this.chartEventManager?.documentMouseMove(this, event);
    };

    private handleDocumentMouseUp = (event: MouseEvent): void => {
        this.chartEventManager?.documentMouseUp(this, event);
    };

    private handleDocumentMouseWheel = (event: WheelEvent): void => {
        this.chartEventManager?.documentMouseWheel(this, event as unknown as MouseEvent);
    };

    private handleKeyDown = (event: KeyboardEvent): void => {
        this.chartEventManager?.handleKeyDown(this, event);
    };

    private init(): void {
        this.createChart();
        this.setupResizeObserver();
        this.createHiddenBaseSeries();
        this.initPanesManager();
        this.indicatorsManager.init(this.currentTheme);
        this.initEventManager();
        this.addWatermarkToHiddenSeries();
    }

    private addWatermarkToHiddenSeries(): void {
        if (!this.hiddenBaseSeries || !this.hiddenBaseSeries.series) return;
        const imageWatermarkManager = new ImageWatermarkManager({
            chartSeries: this.hiddenBaseSeries,
            chart: this.chart
        });
        imageWatermarkManager.addWatermark({
            src: LOGO,
            size: 40,
            opacity: 2,
            offsetX: 20,
            offsetY: 45
        });
    }

    private initDrawingManager(): void {
        this.tools.initDrawingManager();
    }

    private initChartInfo(): void {
        this.chartInfoContainer = document.createElement('div');
        this.chartInfoContainer.style.position = 'absolute';
        this.chartInfoContainer.style.top = '0';
        this.chartInfoContainer.style.left = '0';
        this.chartInfoContainer.style.width = '100%';
        this.chartInfoContainer.style.height = '100%';
        this.chartInfoContainer.style.pointerEvents = 'none';
        this.chartInfoContainer.style.zIndex = '20';
        this.container.appendChild(this.chartInfoContainer);
        const i18n = getI18n();
        const self = this;
        this.chartInfo = new ChartInfo({
            container: this.chartInfoContainer,
            theme: this.theme,
            i18n: i18n,
            title: this.title,
            onToggleOHLC: () => {
                self.showOHLC = !self.showOHLC;
                self.updateChartInfoData();
            },
            onOpenIndicatorsModal: () => {
            },
            onRemoveIndicator: (type) => {
                self.removeMainChartIndicator(type);
            },
            onToggleIndicator: (type) => {
                self.toggleIndicatorVisibility(type);
            },
            onEditIndicatorParams: (id, newParams) => {
                self.updateIndicatorParams(id, newParams);
            },
            onOpenIndicatorSettings: (indicator) => {
                self.openMainChartIndicatorsModal(indicator);
            },
        });
    }

    public getI18n(): I18n {
        return this.i18n;
    }

    public openImageUploadModal(): void { this.modalsManager.openImageUploadModal(); }
    public closeImageUploadModal(): void { this.modalsManager.closeImageUploadModal(); }
    public openMainChartIndicatorsModal(indicator?: MainChartIndicatorInfo | null): void { this.modalsManager.openMainChartIndicatorsModal(indicator); }
    public closeMainChartIndicatorsModal(): void { this.modalsManager.closeMainChartIndicatorsModal(); }
    public openSubChartIndicatorsModal(params: IIndicatorInfo[], indicatorType: SubChartIndicatorType): void { this.modalsManager.openSubChartIndicatorsModal(params, indicatorType); }
    public closeSubChartIndicatorsModal(): void { this.modalsManager.closeSubChartIndicatorsModal(); }
    public openTextMarkEditorModal(position: { x: number; y: number }, text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean): void {
        this.modalsManager.openTextMarkEditorModal(position, text, color, fontSize, isBold, isItalic);
    }
    public closeTextMarkEditorModal(): void { this.modalsManager.closeTextMarkEditorModal(); }
    public updateModalsTheme(): void { this.modalsManager.updateTheme(this.currentTheme); }
    public updateModalsI18n(i18n: I18n): void { this.modalsManager.updateI18n(i18n); }

    public updateChartInfoData(): void {
        if (!this.chartInfo) return;
        const data: Partial<ChartInfoData> = {
            currentOHLC: this.currentOHLC,
            mousePosition: this.mousePosition,
            showOHLC: this.showOHLC,
            indicators: this.indicatorsManager.indicators,
            visibleIndicatorTypes: this.indicatorsManager.visibleIndicatorTypes,
            maIndicatorValues: this.indicatorsManager.maIndicatorValues,
            emaIndicatorValues: this.indicatorsManager.emaIndicatorValues,
            bollingerBandsValues: this.indicatorsManager.bollingerBandsValues,
            ichimokuValues: this.indicatorsManager.ichimokuValues,
            donchianChannelValues: this.indicatorsManager.donchianChannelValues,
            envelopeValues: this.indicatorsManager.envelopeValues,
            vwapValue: this.indicatorsManager.vwapValue,
        };
        this.chartInfo.setData(data);
    }

    public setTitle(title: string): void {
        if (this.chartInfo) {
            this.updateChartInfoData();
        }
    }

    public setIndicators(indicators: MainChartIndicatorInfo[], visibleTypes: MainChartIndicatorType[]): void {
        this.indicatorsManager.indicators = indicators;
        this.indicatorsManager.visibleIndicatorTypes = visibleTypes;
        this.updateChartInfoData();
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
        this.indicatorsManager.setIndicatorValues(values);
    }

    public setShowOHLC(show: boolean): void {
        this.showOHLC = show;
        this.updateChartInfoData();
    }

    public updateOHLC(ohlc: { time: string; open: number; high: number; low: number; close: number } | null, mousePos?: Point): void {
        this.currentOHLC = ohlc;
        if (mousePos) {
            this.mousePosition = mousePos;
        }
        this.updateChartInfoData();
    }

    private createChart(): void {
        const colors = this.theme.getColors();
        this.chart = createChart(this.container, {
            width: this.container.clientWidth,
            height: this.container.clientHeight,
            layout: {
                background: { color: colors.background },
                textColor: colors.textColor,
                fontSize: 12,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: colors.panelBorder + '30', style: 1, visible: true },
                horzLines: { color: colors.panelBorder + '30', style: 1, visible: true },
            },
            crosshair: { mode: 0 },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: colors.panelBorder,
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            rightPriceScale: {
                borderColor: colors.panelBorder,
                scaleMargins: { top: 0.1, bottom: 0.1 },
                entireTextOnly: false,
            },
            handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
            handleScroll: { mouseWheel: true, pressedMouseMove: true },
            localization: { locale: this.i18n === zhCN ? 'zh-CN' : 'en' },
        });
    }

    private createHiddenBaseSeries(): void {
        if (!this.chart) return;
        const series = this.chart.addSeries(CandlestickSeries, {
            upColor: 'transparent',
            downColor: 'transparent',
            borderVisible: false,
            wickUpColor: 'transparent',
            wickDownColor: 'transparent',
            priceLineVisible: false,
            lastValueVisible: false,
            visible: false,
            priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
        });
        this.hiddenBaseSeries = { series, type: 'candle' };
        let baseData: ICandleViewDataPoint[] = this.preprocessedData!.displayData!;
        const candleData: CandlestickData<Time>[] = baseData.map(item => ({
            time: item.time as Time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
        }));
        if (candleData.length > 0) {
            this.hiddenBaseSeries.series.setData(candleData);
        }
    }

    public addOrUpdateMainChartIndicator(indicator: MainChartIndicatorInfo): void { this.indicatorsManager.addOrUpdateIndicator(indicator); }
    public removeMainChartIndicator(type: MainChartIndicatorType): void { this.indicatorsManager.removeIndicator(type); }
    public toggleIndicatorVisibility(type: MainChartIndicatorType): void { this.indicatorsManager.toggleVisibility(type); }
    public updateIndicatorParams(indicatorId: string, newParams: MainChartIndicatorParam[]): void { this.indicatorsManager.updateParams(indicatorId, newParams); }
    public getMainChartIndicators(): MainChartIndicatorInfo[] { return this.indicatorsManager.getIndicators(); }
    public getVisibleIndicatorTypes(): MainChartIndicatorType[] { return this.indicatorsManager.getVisibleTypes(); }

    private setupResizeObserver(): void {
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.container);
    }

    public handleResize(): void {
        if (this.chart && this.container) {
            this.chart.applyOptions({ width: this.container.clientWidth, height: this.container.clientHeight });
        }
    }

    public getChart(): IChartApi | null { return this.chart; }

    public setData(preprocessedData: DataPreprocessResult): void {
        if (preprocessedData) {
            this.preprocessedData = preprocessedData;
        }
        const displayData = this.preprocessedData?.displayData!;
        if (this.hiddenBaseSeries && this.hiddenBaseSeries.series) {
            const candleData = displayData.map(item => ({
                time: item.time as Time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
            }));
            this.hiddenBaseSeries.series.setData(candleData);
        }
        if (!this.mainChartManager) {
            this.mainChartManager = new MainChartManager(this, this.currentTheme);
        }
        if (this.mainChartManager) {
            if (this.mainChartManager.getCurrentType() !== this.chartType) {
                this.mainChartManager.switchChartType(this.chartType);
            }
            this.chartSeries = {
                series: this.mainChartManager.getCurrentSeries(),
                type: this.chartType
            };
            this.mainChartManager.refreshData();
        }
        if (this.indicatorUpdateTimer) clearTimeout(this.indicatorUpdateTimer);
        this.indicatorUpdateTimer = setTimeout(() => {
            this.indicatorsManager.updateAllIndicatorsData(displayData);
            this.indicatorUpdateTimer = null;
        }, 50);

        if (this.panesUpdateTimer) clearTimeout(this.panesUpdateTimer);
        this.panesUpdateTimer = setTimeout(() => {
            this.tools.chartPanesManager?.updateAllPaneData(displayData);
            this.panesUpdateTimer = null;
        }, 50);

        if (this.marketProfileUpdateTimer) clearTimeout(this.marketProfileUpdateTimer);
        this.marketProfileUpdateTimer = setTimeout(() => {
            this.marketProfile?.refreshData(this);
            this.marketProfileUpdateTimer = null;
        }, 50);

        if (this.heatMapUpdateTimer) clearTimeout(this.heatMapUpdateTimer);
        this.heatMapUpdateTimer = setTimeout(() => {
            this.volumeHeatMap?.refreshData(this);
            this.heatMapUpdateTimer = null;
        }, 50);
    }

    public updateChartType(type: MainChartType): void {
        if (!this.chart) return;
        this.chartType = type;
        if (this.mainChartManager) {
            this.mainChartManager.switchChartType(type);
            this.chartSeries = {
                series: this.mainChartManager.getCurrentSeries(),
                type: type
            };
            this.mainChartManager.refreshData();
        }
    }

    public getCurrentTheme(): ThemeConfig { return this.currentTheme; }

    public setTheme(themeType: 'light' | 'dark'): void {
        this.theme.setTheme(themeType);
        this.currentTheme = this.theme.isDark() ? Dark : Light;
        this.updateTheme(this.theme);
    }

    public updateTheme(theme: Theme): void {
        this.theme = theme;
        this.currentTheme = this.theme.isDark() ? Dark : Light;
        const colors = this.theme.getColors();
        this.chart?.applyOptions({
            layout: { background: { color: colors.background }, textColor: colors.textColor },
            grid: { vertLines: { color: colors.panelBorder + '30' }, horzLines: { color: colors.panelBorder + '30' } },
            timeScale: { borderColor: colors.panelBorder },
            rightPriceScale: { borderColor: colors.panelBorder },
        });
        if (this.chartSeries) {
            updateSeriesTheme(this.chartSeries, this.theme);
        }
        this.indicatorsManager.updateTheme(this.currentTheme);
        this.chartInfo?.updateTheme(theme);
        this.updateChartInfoData();
        this.modalsManager.updateTheme(this.currentTheme);
        this.tools.updateTheme(this.currentTheme);
        this.marketProfile?.updateTheme(this.currentTheme);
        this.volumeHeatMap?.updateTheme(this.currentTheme);
        if (this.tools.chartPanesManager) {
            this.tools.chartPanesManager.updateAllPaneTheme(this.currentTheme);
        }
    }

    public updateI18n(i18n: I18n): void {
        this.i18n = i18n;
        this.chartInfo?.updateI18n(i18n);
        this.updateChartInfoData();
        this.modalsManager.updateI18n(i18n);
        this.tools.updateI18n(i18n);
        this.chart?.applyOptions({
            localization: { locale: i18n === zhCN ? 'zh-CN' : 'en' }
        });
    }

    public getDrawingState(): DrawingManagerState | null { return this.tools.getDrawingState(); }
    public setCursorType(cursorType: CursorType): void { this.tools.setCursorType(cursorType); }
    public setLineSegmentMarkMode(): void { this.tools.setLineSegmentMarkMode(); }
    public setArrowLineMarkMode(): void { this.tools.setArrowLineMarkMode(); }
    public setThickArrowLineMode(): void { this.tools.setThickArrowLineMode(); }
    public setHorizontalLineMode(): void { this.tools.setHorizontalLineMode(); }
    public setVerticalLineMode(): void { this.tools.setVerticalLineMode(); }
    public setParallelChannelMarkMode(): void { this.tools.setParallelChannelMarkMode(); }
    public setLinearRegressionChannelMode(): void { this.tools.setLinearRegressionChannelMode(); }
    public setEquidistantChannelMarkMode(): void { this.tools.setEquidistantChannelMarkMode(); }
    public setDisjointChannelMarkMode(): void { this.tools.setDisjointChannelMarkMode(); }
    public setAndrewPitchforkMode(): void { this.tools.setAndrewPitchforkMode(); }
    public setEnhancedAndrewPitchforkMode(): void { this.tools.setEnhancedAndrewPitchforkMode(); }
    public setSchiffPitchforkMode(): void { this.tools.setSchiffPitchforkMode(); }
    public setRectangleMarkMode(): void { this.tools.setRectangleMarkMode(); }
    public setCircleMarkMode(): void { this.tools.setCircleMarkMode(); }
    public setEllipseMarkMode(): void { this.tools.setEllipseMarkMode(); }
    public setTriangleMarkMode(): void { this.tools.setTriangleMarkMode(); }
    public setSectorMode(): void { this.tools.setSectorMode(); }
    public setCurveMode(): void { this.tools.setCurveMode(); }
    public setDoubleCurveMode(): void { this.tools.setDoubleCurveMode(); }
    public setGannFanMode(): void { this.tools.setGannFanMode(); }
    public setGannBoxMode(): void { this.tools.setGannBoxMode(); }
    public setGannRectangleMode(): void { this.tools.setGannRectangleMode(); }
    public setFibonacciTimeZoonMode(): void { this.tools.setFibonacciTimeZoonMode(); }
    public setFibonacciRetracementMode(): void { this.tools.setFibonacciRetracementMode(); }
    public setFibonacciArcMode(): void { this.tools.setFibonacciArcMode(); }
    public setFibonacciCircleMode(): void { this.tools.setFibonacciCircleMode(); }
    public setFibonacciSpiralMode(): void { this.tools.setFibonacciSpiralMode(); }
    public setFibonacciWedgeMode(): void { this.tools.setFibonacciWedgeMode(); }
    public setFibonacciFanMode(): void { this.tools.setFibonacciFanMode(); }
    public setFibonacciChannelMode(): void { this.tools.setFibonacciChannelMode(); }
    public setFibonacciExtensionBasePriceMode(): void { this.tools.setFibonacciExtensionBasePriceMode(); }
    public setFibonacciExtensionBaseTimeMode(): void { this.tools.setFibonacciExtensionBaseTimeMode(); }
    public setXABCDMode(): void { this.tools.setXABCDMode(); }
    public setHeadAndShouldersMode(): void { this.tools.setHeadAndShouldersMode(); }
    public setABCDMode(): void { this.tools.setABCDMode(); }
    public setTriangleABCDMode(): void { this.tools.setTriangleABCDMode(); }
    public setElliottImpulseMode(): void { this.tools.setElliottImpulseMode(); }
    public setElliottCorrectiveMode(): void { this.tools.setElliottCorrectiveMode(); }
    public setElliottTriangleMode(): void { this.tools.setElliottTriangleMode(); }
    public setElliottDoubleCombinationMode(): void { this.tools.setElliottDoubleCombinationMode(); }
    public setElliottTripleCombinationMode(): void { this.tools.setElliottTripleCombinationMode(); }
    public setTimeRangeMarkMode(): void { this.tools.setTimeRangeMarkMode(); }
    public setPriceRangeMarkMode(): void { this.tools.setPriceRangeMarkMode(); }
    public setTimePriceRangeMarkMode(): void { this.tools.setTimePriceRangeMarkMode(); }
    public setHeatMapMode(): void { this.tools.setHeatMapMode(); }
    public setLongPositionMarkMode(): void { this.tools.setLongPositionMarkMode(); }
    public setShortPositionMarkMode(): void { this.tools.setShortPositionMarkMode(); }
    public setMockKLineMarkMode(): void { this.tools.setMockKLineMarkMode(); }
    public setPencilMode(): void { this.tools.setPencilMode(); }
    public setPenMode(): void { this.tools.setPenMode(); }
    public setBrushMode(): void { this.tools.setBrushMode(); }
    public setMarkerPenMode(): void { this.tools.setMarkerPenMode(); }
    public setEraserMode(): void { this.tools.setEraserMode(); }
    public setTextEditMarkMode(): void { this.tools.setTextEditMarkMode(); }
    public setPriceNoteMarkMode(): void { this.tools.setPriceNoteMarkMode(); }
    public setBubbleBoxMarkMode(): void { this.tools.setBubbleBoxMarkMode(); }
    public setPinMarkMode(): void { this.tools.setPinMarkMode(); }
    public setSignpostMarkMode(): void { this.tools.setSignpostMarkMode(); }
    public setPriceLabelMode(): void { this.tools.setPriceLabelMode(); }
    public setFlagMarkMode(): void { this.tools.setFlagMarkMode(); }
    public setImageMarkMode(): void { this.tools.setImageMarkMode(); }
    public setEmojiMarkMode(emoji: string): void { this.tools.setEmojiMarkMode(emoji); }
    public setPriceEventMode(): void { this.tools.setPriceEventMode(); }
    public setTimeEventMode(): void { this.tools.setTimeEventMode(); }

    public showAllMark(): void { this.tools.showAllMark(); }
    public hideAllMark(): void { this.tools.hideAllMark(); }
    public clearAllMark(): void { this.tools.clearAllMark(); }
    public getDrawingManager() { return this.tools.drawingManager; }
    public showTableMarkToolBar(drawing: MarkDrawing): void { this.tools.showTableMarkToolBar(drawing); }
    public showTextEditMarkToolBar(drawing: MarkDrawing, isShowGrapTool: boolean): void { this.tools.showTextEditMarkToolBar(drawing, isShowGrapTool); }
    public showGraphMarkToolBar(drawing: MarkDrawing): void { this.tools.showGraphMarkToolBar(drawing); }
    public closeTextMarkToolBar(): void { this.tools.closeTextMarkToolBar(); }
    public closeGraphMarkToolBar(): void { this.tools.closeGraphMarkToolBar(); }
    public closeTableMarkToolBar(): void { this.tools.closeTableMarkToolBar(); }
    public disableChartMovement(): void { this.tools.disableChartMovement(); }
    public enableChartMovement(): void { this.tools.enableChartMovement(); }
    public handleViewportShiftLeft(): void { this.tools.handleViewportShiftLeft(); }
    public handleViewportShiftRight(): void { this.tools.handleViewportShiftRight(); }
    public handleZoomIn(): void { this.tools.handleZoomIn(); }
    public handleZoomOut(): void { this.tools.handleZoomOut(); }
    public addSubChart(indicatorType: SubChartIndicatorType, onSettingsClick: (type: SubChartIndicatorType) => void, onCloseClick: (type: SubChartIndicatorType) => void): void {
        this.tools.addSubChart(indicatorType, onSettingsClick, onCloseClick);
    }
    public removeSubChart(indicatorType: SubChartIndicatorType): void { this.tools.removeSubChart(indicatorType); }
    public getEnabledMainChartIndicators(): MainChartIndicatorType[] {
        const enabled: MainChartIndicatorType[] = [];
        enabled.push(...this.indicatorsManager.getEnabledIndicators());
        if (this.volumeHeatMap !== null) {
            enabled.push(MainChartIndicatorType.HEATMAP);
        }
        if (this.marketProfile !== null) {
            enabled.push(MainChartIndicatorType.MARKETPROFILE);
        }
        return enabled;
    }
    public getEnabledSubChartIndicators(): SubChartIndicatorType[] {
        return this.tools.chartPanesManager?.getEnabledSubChartIndicators() ?? [];
    }
    public isMainChartIndicatorEnabled(indicatorType: MainChartIndicatorType): boolean {
        if (indicatorType === MainChartIndicatorType.HEATMAP) {
            return this.volumeHeatMap !== null;
        }
        if (indicatorType === MainChartIndicatorType.MARKETPROFILE) {
            return this.marketProfile !== null;
        }
        return this.indicatorsManager.isIndicatorEnabled(indicatorType);
    }
    public isSubChartIndicatorEnabled(indicatorType: SubChartIndicatorType): boolean {
        return this.tools.chartPanesManager?.isSubChartIndicatorEnabled(indicatorType) ?? false;
    }
    private cleanupEvents(): void {
        if (this.containerRef.current) {
            this.containerRef.current.removeEventListener('mousedown', this.handleMouseDown);
            this.containerRef.current.removeEventListener('mousemove', this.handleMouseMove);
            this.containerRef.current.removeEventListener('mouseup', this.handleMouseUp);
        }
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('mousemove', this.handleDocumentMouseMove);
        document.removeEventListener('mousedown', this.handleDocumentMouseDown);
        document.removeEventListener('mouseup', this.handleDocumentMouseUp);
        document.removeEventListener('wheel', this.handleDocumentMouseWheel);
    }

    public destroy(): void {
        this.resizeObserver?.disconnect();
        this.tools.destroy();
        this.indicatorsManager.destroy();
        if (this.chart) {
            this.indicatorsManager.mainChartTechnicalIndicatorManager?.destroy(this.chart);
        }
        this.chartInfo?.destroy();
        this.chartInfoContainer?.remove();
        this.tools.chartPanesManager?.removeAllPane();
        this.hideMarketProfile();
        this.hideHeatMap();
        this.modalsManager.destroy();

        if (this.chartSeries && this.chartSeries.series && this.chart) {
            try { this.chart.removeSeries(this.chartSeries.series); } catch (e) { }
        }
        if (this.hiddenBaseSeries && this.hiddenBaseSeries.series && this.chart) {
            try { this.chart.removeSeries(this.hiddenBaseSeries.series); } catch (e) { }
        }
        if (this.chart) {
            this.chart.remove();
            this.chart = null;
        }
        this.chartSeries = null;
        this.hiddenBaseSeries = null;
        this.cleanupEvents();
    }
}