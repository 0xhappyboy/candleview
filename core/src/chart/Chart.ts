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
import { DrawingManager, DrawingManagerState } from './ChartDrawingManager';
import { ChartMarkManager } from './ChartMarkManager';
import { ChartSeries, switchChartType, updateSeriesTheme } from './ChartTypeManager';
import { ChartInfo, ChartInfoData } from './ChartInfo';
import { I18n, getI18n } from '../i18n';
import { MainChartIndicatorInfo, MainChartIndicatorParam } from '../Indicators/MainChart/MainChartIndicatorInfo';
import { ChartPanesManager } from './panes/ChartPanesManager';
import { MainChartTechnicalIndicatorManager } from '../Indicators/MainChart/MainChartIndicatorManager';
import { IMarkStyle } from '../Mark/IMarkStyle';
import { ChartEventManager } from './ChartEventManager';
import { GraphMarkToolBar } from '../components/GraphMarkToolBar';
import { TextMarkToolBar } from '../components/TextMarkToolBar';
import { IIndicatorInfo } from '../Indicators/SubChart/IIndicator';
import { MainChartIndicatorsSettingModal } from '../components/modal/MainChartIndicatorsSettingModal';
import { SubChartIndicatorsSettingModal } from '../components/modal/SubChartIndicatorsSettingModal';
import { TextMarkEditorModal } from '../components/modal/TextMarkEditorModal';
import { ImageUploadModal } from '../components/modal/ImageUploadModal';

export class Chart {
    private container: HTMLElement;
    public data: ICandleViewDataPoint[];
    private preprocessedData: DataPreprocessResult | null = null;
    private theme: Theme;
    public currentTheme: ThemeConfig;
    private chartType: MainChartType;
    private resizeObserver: ResizeObserver | null = null;
    public chart: IChartApi | null = null;
    public chartSeries: ChartSeries | null = null;
    public hiddenBaseSeries: ChartSeries | null = null;
    public containerRef: { current: HTMLDivElement | null } = { current: null };
    public drawingManager: DrawingManager | null = null;
    public chartMarkManager: ChartMarkManager | null = null;
    public currentDrawingType: DrawingType | null = null;
    public onCloseDrawing?: () => void;
    private chartInfo: ChartInfo | null = null;
    private chartInfoContainer: HTMLElement | null = null;
    public currentMarkSettingsStyle: IMarkStyle | null = null;
    private currentOHLC: { time: string; open: number; high: number; low: number; close: number } | null = null;
    private mousePosition: Point | null = null;
    private showOHLC: boolean = true;
    private indicators: MainChartIndicatorInfo[] = [];
    private visibleIndicatorTypes: MainChartIndicatorType[] = [];
    private maIndicatorValues: { [key: string]: number } = {};
    private emaIndicatorValues: { [key: string]: number } = {};
    private bollingerBandsValues: { [key: string]: number } = {};
    private ichimokuValues: { [key: string]: number } = {};
    private donchianChannelValues: { [key: string]: number } = {};
    private envelopeValues: { [key: string]: number } = {};
    private vwapValue: number | null = null;
    private originalChartOptions: {
        handleScroll?: any;
        handleScale?: any;
    } | null = null;
    public textMarkToolBar: TextMarkToolBar | null = null;
    public graphMarkToolBar: GraphMarkToolBar | null = null;
    public chartPanesManager: ChartPanesManager | null = null;
    private i18n: I18n;
    public mainChartTechnicalIndicatorManager: MainChartTechnicalIndicatorManager | null = null;
    private chartEventManager: ChartEventManager | null = null;
    private onToggleOHLCCallback?: () => void;
    private onOpenIndicatorsModalCallback?: () => void;
    private onRemoveIndicatorCallback?: (type: MainChartIndicatorType) => void;
    private onToggleIndicatorCallback?: (type: MainChartIndicatorType) => void;
    private onEditIndicatorParamsCallback?: (id: string, newParams: MainChartIndicatorParam[]) => void;
    private onOpenIndicatorSettingsCallback?: (indicator: MainChartIndicatorInfo) => void;
    private isDraggingToolbar: boolean = false;
    private toolbarDragStartPoint: Point | null = null;
    private toolbarDragStartPosition: Point | null = null;

    private imageUploadModal: ImageUploadModal | null = null;
    private mainChartIndicatorsModal: MainChartIndicatorsSettingModal | null = null;
    private subChartIndicatorsModal: SubChartIndicatorsSettingModal | null = null;
    private textMarkEditorModal: TextMarkEditorModal | null = null;

    private isImageUploadModalOpen: boolean = false;
    private isMainChartIndicatorsModalOpen: boolean = false;
    private isSubChartIndicatorsModalOpen: boolean = false;
    private isTextMarkEditorModalOpen: boolean = false;

    private onImageConfirmCallback?: (imageUrl: string) => void;
    private onMainChartIndicatorConfirmCallback?: (indicator: MainChartIndicatorInfo) => void;
    private onSubChartIndicatorConfirmCallback?: (params: IIndicatorInfo[]) => void;
    private onTextMarkEditorSaveCallback?: (text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => void;
    private onTextMarkEditorCancelCallback?: () => void;

    private pendingImageUrl: string = '';
    private editingIndicator: MainChartIndicatorInfo | null = null;
    private editingSubChartParams: IIndicatorInfo[] = [];
    private currentSubChartType: SubChartIndicatorType | null = null;
    private textMarkEditorPosition: { x: number; y: number } = { x: 0, y: 0 };
    private textMarkEditorData: {
        text: string;
        color: string;
        fontSize: number;
        isBold: boolean;
        isItalic: boolean;
    } = {
            text: '',
            color: '#000000',
            fontSize: 14,
            isBold: false,
            isItalic: false
        };


    constructor(options: {
        container: HTMLElement;
        data: ICandleViewDataPoint[];
        theme: Theme;
        chartType: MainChartType;
        preprocessedData?: DataPreprocessResult;
        i18n: I18n;
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

    }) {

        this.onImageConfirmCallback = options.onImageConfirm;
        this.onMainChartIndicatorConfirmCallback = options.onMainChartIndicatorConfirm;
        this.onSubChartIndicatorConfirmCallback = options.onSubChartIndicatorConfirm;
        this.onTextMarkEditorSaveCallback = options.onTextMarkEditorSave;
        this.onTextMarkEditorCancelCallback = options.onTextMarkEditorCancel;

        this.onCloseDrawing = options.onCloseDrawing;
        this.container = options.container;
        this.containerRef.current = this.container as HTMLDivElement;
        this.data = options.data;
        this.theme = options.theme;
        this.currentTheme = this.theme.isDark() ? Dark : Light;
        this.chartType = options.chartType;
        this.preprocessedData = options.preprocessedData || null;
        this.i18n = options.i18n;
        this.onToggleOHLCCallback = options.onToggleOHLC;
        this.onOpenIndicatorsModalCallback = options.onOpenIndicatorsModal;
        this.onRemoveIndicatorCallback = options.onRemoveIndicator;
        this.onToggleIndicatorCallback = options.onToggleIndicator;
        this.onEditIndicatorParamsCallback = options.onEditIndicatorParams;
        this.onOpenIndicatorSettingsCallback = options.onOpenIndicatorSettings;
        this.init();
        this.initDrawingManager();
        this.initChartInfo();
        this.initEventManager();
        options.onReady?.();
    }

    private initMainChartTechnicalIndicatorManager(): void {
        this.mainChartTechnicalIndicatorManager = new MainChartTechnicalIndicatorManager(this.currentTheme);
    }

    private initPanesManager(): void {
        this.chartPanesManager = new ChartPanesManager();
        this.chartPanesManager.setChartInstance(this.chart);
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
        this.createMainSeries();
        this.initPanesManager();
        this.initMainChartTechnicalIndicatorManager();
        this.fitContent();
        this.initEventManager();
    }

    private initDrawingManager(): void {
        this.chartMarkManager = new ChartMarkManager();
        this.drawingManager = new DrawingManager({
            chartMarkManager: this.chartMarkManager,
        });
        this.chartMarkManager?.initializeMarkManager(this as any);
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

        this.chartInfo = new ChartInfo({
            container: this.chartInfoContainer,
            theme: this.theme,
            i18n: i18n,
            title: '',
            onToggleOHLC: () => {
                this.showOHLC = !this.showOHLC;
                this.updateChartInfoData();
                this.onToggleOHLCCallback?.();
            },
            onOpenIndicatorsModal: () => {
                this.onOpenIndicatorsModalCallback?.();
            },
            onRemoveIndicator: (type) => {
                this.onRemoveIndicatorCallback?.(type);
            },
            onToggleIndicator: (type) => {
                this.onToggleIndicatorCallback?.(type);
            },
            onEditIndicatorParams: (id, newParams) => {
                this.onEditIndicatorParamsCallback?.(id, newParams);
            },
            onOpenIndicatorSettings: (indicator) => {
                this.onOpenIndicatorSettingsCallback?.(indicator);
            },
        });
    }

    public getI18n(): I18n {
        return this.i18n;
    }


    /**
     * 打开图片上传模态框
     */
    public openImageUploadModal(): void {
        this.isImageUploadModalOpen = true;
        this.updateImageUploadModal();
    }

    /**
     * 关闭图片上传模态框
     */
    public closeImageUploadModal(): void {
        this.isImageUploadModalOpen = false;
        this.updateImageUploadModal();
    }

    /**
     * 更新图片上传模态框
     */
    private updateImageUploadModal(): void {
        if (this.isImageUploadModalOpen) {
            if (!this.imageUploadModal) {
                this.imageUploadModal = new ImageUploadModal({
                    isOpen: true,
                    onClose: () => this.closeImageUploadModal(),
                    onConfirm: (imageUrl: string) => {
                        this.pendingImageUrl = imageUrl;
                        this.onImageConfirmCallback?.(imageUrl);
                        this.closeImageUploadModal();
                    },
                    theme: this.currentTheme,
                    i18n: this.i18n
                });
            } else {
                this.imageUploadModal.update({
                    isOpen: true,
                    theme: this.currentTheme,
                    i18n: this.i18n
                });
            }
        } else {
            if (this.imageUploadModal) {
                this.imageUploadModal.destroy();
                this.imageUploadModal = null;
            }
        }
    }

    /**
     * 打开主图指标设置模态框
     */
    public openMainChartIndicatorsModal(indicator?: MainChartIndicatorInfo | null): void {
        this.isMainChartIndicatorsModalOpen = true;
        if (indicator) {
            this.editingIndicator = indicator;
        }
        this.updateMainChartIndicatorsModal();
    }

    /**
     * 关闭主图指标设置模态框
     */
    public closeMainChartIndicatorsModal(): void {
        this.isMainChartIndicatorsModalOpen = false;
        this.editingIndicator = null;
        this.updateMainChartIndicatorsModal();
    }

    /**
     * 更新主图指标设置模态框
     */
    private updateMainChartIndicatorsModal(): void {
        if (this.isMainChartIndicatorsModalOpen) {
            if (!this.mainChartIndicatorsModal) {
                this.mainChartIndicatorsModal = new MainChartIndicatorsSettingModal({
                    isOpen: true,
                    onClose: () => this.closeMainChartIndicatorsModal(),
                    onConfirm: (indicator: MainChartIndicatorInfo) => {
                        this.onMainChartIndicatorConfirmCallback?.(indicator);
                        this.closeMainChartIndicatorsModal();
                    },
                    initialIndicator: this.editingIndicator,
                    theme: this.currentTheme,
                    parentRef: this.container,
                    indicatorType: this.editingIndicator?.type || null,
                    i18n: this.i18n
                });
            } else {
                this.mainChartIndicatorsModal.update({
                    isOpen: true,
                    initialIndicator: this.editingIndicator,
                    theme: this.currentTheme,
                    parentRef: this.container,
                    indicatorType: this.editingIndicator?.type || null,
                    i18n: this.i18n
                });
            }
        } else {
            if (this.mainChartIndicatorsModal) {
                this.mainChartIndicatorsModal.destroy();
                this.mainChartIndicatorsModal = null;
            }
        }
    }

    /**
     * 打开副图指标设置模态框
     */
    public openSubChartIndicatorsModal(params: IIndicatorInfo[], indicatorType: SubChartIndicatorType): void {
        this.isSubChartIndicatorsModalOpen = true;
        this.editingSubChartParams = [...params];
        this.currentSubChartType = indicatorType;
        this.updateSubChartIndicatorsModal();
    }

    /**
     * 关闭副图指标设置模态框
     */
    public closeSubChartIndicatorsModal(): void {
        this.isSubChartIndicatorsModalOpen = false;
        this.editingSubChartParams = [];
        this.currentSubChartType = null;
        this.updateSubChartIndicatorsModal();
    }

    /**
     * 更新副图指标设置模态框
     */
    private updateSubChartIndicatorsModal(): void {
        if (this.isSubChartIndicatorsModalOpen) {
            if (!this.subChartIndicatorsModal) {
                this.subChartIndicatorsModal = new SubChartIndicatorsSettingModal({
                    isOpen: true,
                    onClose: () => this.closeSubChartIndicatorsModal(),
                    onConfirm: (params: IIndicatorInfo[]) => {
                        this.onSubChartIndicatorConfirmCallback?.(params);
                        this.closeSubChartIndicatorsModal();
                    },
                    initialParams: this.editingSubChartParams,
                    theme: this.currentTheme,
                    parentRef: this.container,
                    indicatorType: this.currentSubChartType,
                    i18n: this.i18n
                });
            } else {
                this.subChartIndicatorsModal.update({
                    isOpen: true,
                    initialParams: this.editingSubChartParams,
                    theme: this.currentTheme,
                    parentRef: this.container,
                    indicatorType: this.currentSubChartType,
                    i18n: this.i18n
                });
            }
        } else {
            if (this.subChartIndicatorsModal) {
                this.subChartIndicatorsModal.destroy();
                this.subChartIndicatorsModal = null;
            }
        }
    }

    /**
     * 打开文本标记编辑器模态框
     */
    public openTextMarkEditorModal(
        position: { x: number; y: number },
        text: string,
        color: string,
        fontSize: number,
        isBold: boolean,
        isItalic: boolean
    ): void {
        this.isTextMarkEditorModalOpen = true;
        this.textMarkEditorPosition = { ...position };
        this.textMarkEditorData = {
            text,
            color,
            fontSize,
            isBold,
            isItalic
        };
        this.updateTextMarkEditorModal();
    }

    /**
     * 关闭文本标记编辑器模态框
     */
    public closeTextMarkEditorModal(): void {
        this.isTextMarkEditorModalOpen = false;
        this.updateTextMarkEditorModal();
    }

    /**
     * 更新文本标记编辑器模态框
     */
    private updateTextMarkEditorModal(): void {
        if (this.isTextMarkEditorModalOpen) {
            if (!this.textMarkEditorModal) {
                this.textMarkEditorModal = new TextMarkEditorModal({
                    isOpen: true,
                    position: this.textMarkEditorPosition,
                    theme: this.currentTheme,
                    initialText: this.textMarkEditorData.text,
                    initialColor: this.textMarkEditorData.color,
                    initialFontSize: this.textMarkEditorData.fontSize,
                    initialIsBold: this.textMarkEditorData.isBold,
                    initialIsItalic: this.textMarkEditorData.isItalic,
                    onSave: (text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => {
                        this.onTextMarkEditorSaveCallback?.(text, color, fontSize, isBold, isItalic);
                        this.closeTextMarkEditorModal();
                    },
                    onCancel: () => {
                        this.onTextMarkEditorCancelCallback?.();
                        this.closeTextMarkEditorModal();
                    },
                    i18n: this.i18n
                });
            } else {
                this.textMarkEditorModal.update({
                    isOpen: true,
                    position: this.textMarkEditorPosition,
                    theme: this.currentTheme,
                    initialText: this.textMarkEditorData.text,
                    initialColor: this.textMarkEditorData.color,
                    initialFontSize: this.textMarkEditorData.fontSize,
                    initialIsBold: this.textMarkEditorData.isBold,
                    initialIsItalic: this.textMarkEditorData.isItalic,
                    i18n: this.i18n
                });
            }
        } else {
            if (this.textMarkEditorModal) {
                this.textMarkEditorModal.destroy();
                this.textMarkEditorModal = null;
            }
        }
    }

    /**
     * 更新所有模态框的主题
     */
    public updateModalsTheme(): void {
        if (this.imageUploadModal) {
            this.imageUploadModal.update({ theme: this.currentTheme, i18n: this.i18n });
        }
        if (this.mainChartIndicatorsModal) {
            this.mainChartIndicatorsModal.update({ theme: this.currentTheme, i18n: this.i18n });
        }
        if (this.subChartIndicatorsModal) {
            this.subChartIndicatorsModal.update({ theme: this.currentTheme, i18n: this.i18n });
        }
        if (this.textMarkEditorModal) {
            this.textMarkEditorModal.update({ theme: this.currentTheme, i18n: this.i18n });
        }
    }

    /**
     * 更新所有模态框的国际化
     */
    public updateModalsI18n(i18n: I18n): void {
        this.i18n = i18n;
        if (this.imageUploadModal) {
            this.imageUploadModal.update({ i18n });
        }
        if (this.mainChartIndicatorsModal) {
            this.mainChartIndicatorsModal.update({ i18n });
        }
        if (this.subChartIndicatorsModal) {
            this.subChartIndicatorsModal.update({ i18n });
        }
        if (this.textMarkEditorModal) {
            this.textMarkEditorModal.update({ i18n });
        }
    }


    /**
     * 更新 ChartInfo 数据
     */
    private updateChartInfoData(): void {
        if (!this.chartInfo) return;
        const data: Partial<ChartInfoData> = {
            currentOHLC: this.currentOHLC,
            mousePosition: this.mousePosition,
            showOHLC: this.showOHLC,
            indicators: this.indicators,
            visibleIndicatorTypes: this.visibleIndicatorTypes,
            maIndicatorValues: this.maIndicatorValues,
            emaIndicatorValues: this.emaIndicatorValues,
            bollingerBandsValues: this.bollingerBandsValues,
            ichimokuValues: this.ichimokuValues,
            donchianChannelValues: this.donchianChannelValues,
            envelopeValues: this.envelopeValues,
            vwapValue: this.vwapValue,
        };

        this.chartInfo.updateData(data);
    }

    public setTitle(title: string): void {
        if (this.chartInfo) {
            this.updateChartInfoData();
        }
    }

    public setIndicators(
        indicators: MainChartIndicatorInfo[],
        visibleTypes: MainChartIndicatorType[]
    ): void {
        this.indicators = indicators;
        this.visibleIndicatorTypes = visibleTypes;
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
        if (values.ma) this.maIndicatorValues = values.ma;
        if (values.ema) this.emaIndicatorValues = values.ema;
        if (values.bollinger) this.bollingerBandsValues = values.bollinger;
        if (values.ichimoku) this.ichimokuValues = values.ichimoku;
        if (values.donchian) this.donchianChannelValues = values.donchian;
        if (values.envelope) this.envelopeValues = values.envelope;
        if (values.vwap !== undefined) this.vwapValue = values.vwap;

        this.updateChartInfoData();
    }

    /**
     * 设置 OHLC 可见性
     */
    public setShowOHLC(show: boolean): void {
        this.showOHLC = show;
        this.updateChartInfoData();
    }

    /**
     * 手动触发 OHLC 更新（用于外部数据变化时）
     */
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
            localization: { locale: 'zh-CN' },
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

        let baseData: ICandleViewDataPoint[] = [];
        if (this.preprocessedData && this.preprocessedData.hiddenBaseData.length > 0) {
            baseData = this.preprocessedData.hiddenBaseData;
        } else {
            baseData = this.data;
        }

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

    private createMainSeries(): void {
        if (!this.chart) return;
        const chartData = this.convertDataByType();
        this.chartSeries = switchChartType(
            this.chart,
            null,
            this.chartType,
            chartData,
            this.theme
        );
    }

    private convertDataByType(): any[] {
        const sourceData = this.preprocessedData?.displayData ?? this.data;

        switch (this.chartType) {
            case MainChartType.Line:
                return sourceData.map(item => ({ time: item.time as Time, value: item.close }));
            case MainChartType.Area:
                return sourceData.map(item => ({ time: item.time as Time, value: item.close }));
            case MainChartType.Candle:
            case MainChartType.HollowCandle:
            case MainChartType.Bar:
            case MainChartType.HeikinAshi:
                return sourceData.map(item => ({
                    time: item.time as Time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                }));
            case MainChartType.Histogram:
                const colors = this.theme.getColors();
                return sourceData.map(item => ({
                    time: item.time as Time,
                    value: item.volume || 0,
                    color: item.close >= item.open ? colors.chartCandleUp : colors.chartCandleDown,
                }));
            case MainChartType.BaselineArea:
                return sourceData.map(item => ({ time: item.time as Time, value: item.close }));
            default:
                return sourceData.map(item => ({
                    time: item.time as Time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                }));
        }
    }

    private fitContent(): void {
        if (this.chart) {
            this.chart.timeScale().fitContent();
        }
    }

    private setupResizeObserver(): void {
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.container);
    }

    public handleResize(): void {
        if (this.chart && this.container) {
            this.chart.applyOptions({ width: this.container.clientWidth, height: this.container.clientHeight });
        }
    }

    public updateData(data: ICandleViewDataPoint[], preprocessedData?: DataPreprocessResult): void {
        this.data = data;
        if (preprocessedData) this.preprocessedData = preprocessedData;
        if (this.hiddenBaseSeries && this.hiddenBaseSeries.series) {
            let baseData = this.preprocessedData?.hiddenBaseData.length
                ? this.preprocessedData.hiddenBaseData
                : this.data;
            const candleData = baseData.map(item => ({
                time: item.time as Time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
            }));
            this.hiddenBaseSeries.series.setData(candleData);
        }
        if (this.chartSeries && this.chartSeries.series) {
            const chartData = this.convertDataByType();
            this.chartSeries.series.setData(chartData);
        }
        this.fitContent();
    }

    public getCurrentTheme(): ThemeConfig {
        return this.currentTheme;
    }

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
        this.mainChartTechnicalIndicatorManager?.updateTheme(this.currentTheme);
        this.chartInfo?.updateTheme(theme);
        this.updateChartInfoData();
        this.updateModalsTheme();
    }

    public updateI18n(i18n: I18n): void {
        this.i18n = i18n;
        this.chartInfo?.updateI18n(i18n);
        this.updateChartInfoData();
        this.updateModalsI18n(i18n);
    }

    public updateChartType(type: MainChartType): void {
        if (!this.chart) return;
        this.chartType = type;
        const chartData = this.convertDataByType();
        this.chartSeries = switchChartType(
            this.chart,
            this.chartSeries,
            type,
            chartData,
            this.theme
        );
    }

    public getDrawingState(): DrawingManagerState | null {
        return this.drawingManager?.getState() || null;
    }

    public setCursorType(cursorType: CursorType): void {
        this.drawingManager?.setCursorType(cursorType);
    }

    public setLineSegmentMarkMode(): void { this.drawingManager?.setLineSegmentMarkMode(); }
    public setArrowLineMarkMode(): void { this.drawingManager?.setArrowLineMarkMode(); }
    public setThickArrowLineMode(): void { this.drawingManager?.setThickArrowLineMode(); }
    public setHorizontalLineMode(): void { this.drawingManager?.setHorizontalLineMode(); }
    public setVerticalLineMode(): void { this.drawingManager?.setVerticalLineMode(); }
    public setParallelChannelMarkMode(): void { this.drawingManager?.setParallelChannelMarkMode(); }
    public setLinearRegressionChannelMode(): void { this.drawingManager?.setLinearRegressionChannelMode(); }
    public setEquidistantChannelMarkMode(): void { this.drawingManager?.setEquidistantChannelMarkMode(); }
    public setDisjointChannelMarkMode(): void { this.drawingManager?.setDisjointChannelMarkMode(); }
    public setAndrewPitchforkMode(): void { this.drawingManager?.setAndrewPitchforkMode(); }
    public setEnhancedAndrewPitchforkMode(): void { this.drawingManager?.setEnhancedAndrewPitchforkMode(); }
    public setSchiffPitchforkMode(): void { this.drawingManager?.setSchiffPitchforkMode(); }
    public setRectangleMarkMode(): void { this.drawingManager?.setRectangleMarkMode(); }
    public setCircleMarkMode(): void { this.drawingManager?.setCircleMarkMode(); }
    public setEllipseMarkMode(): void { this.drawingManager?.setEllipseMarkMode(); }
    public setTriangleMarkMode(): void { this.drawingManager?.setTriangleMarkMode(); }
    public setSectorMode(): void { this.drawingManager?.setSectorMode(); }
    public setCurveMode(): void { this.drawingManager?.setCurveMode(); }
    public setDoubleCurveMode(): void { this.drawingManager?.setDoubleCurveMode(); }
    public setGannFanMode(): void { this.drawingManager?.setGannFanMode(); }
    public setGannBoxMode(): void { this.drawingManager?.setGannBoxMode(); }
    public setGannRectangleMode(): void { this.drawingManager?.setGannRectangleMode(); }
    public setFibonacciTimeZoonMode(): void { this.drawingManager?.setFibonacciTimeZoonMode(); }
    public setFibonacciRetracementMode(): void { this.drawingManager?.setFibonacciRetracementMode(); }
    public setFibonacciArcMode(): void { this.drawingManager?.setFibonacciArcMode(); }
    public setFibonacciCircleMode(): void { this.drawingManager?.setFibonacciCircleMode(); }
    public setFibonacciSpiralMode(): void { this.drawingManager?.setFibonacciSpiralMode(); }
    public setFibonacciWedgeMode(): void { this.drawingManager?.setFibonacciWedgeMode(); }
    public setFibonacciFanMode(): void { this.drawingManager?.setFibonacciFanMode(); }
    public setFibonacciChannelMode(): void { this.drawingManager?.setFibonacciChannelMode(); }
    public setFibonacciExtensionBasePriceMode(): void { this.drawingManager?.setFibonacciExtensionBasePriceMode(); }
    public setFibonacciExtensionBaseTimeMode(): void { this.drawingManager?.setFibonacciExtensionBaseTimeMode(); }
    public setXABCDMode(): void { this.drawingManager?.setXABCDMode(); }
    public setHeadAndShouldersMode(): void { this.drawingManager?.setHeadAndShouldersMode(); }
    public setABCDMode(): void { this.drawingManager?.setABCDMode(); }
    public setTriangleABCDMode(): void { this.drawingManager?.setTriangleABCDMode(); }
    public setElliottImpulseMode(): void { this.drawingManager?.setElliottImpulseMode(); }
    public setElliottCorrectiveMode(): void { this.drawingManager?.setElliottCorrectiveMode(); }
    public setElliottTriangleMode(): void { this.drawingManager?.setElliottTriangleMode(); }
    public setElliottDoubleCombinationMode(): void { this.drawingManager?.setElliottDoubleCombinationMode(); }
    public setElliottTripleCombinationMode(): void { this.drawingManager?.setElliottTripleCombinationMode(); }
    public setTimeRangeMarkMode(): void { this.drawingManager?.setTimeRangeMarkMode(); }
    public setPriceRangeMarkMode(): void { this.drawingManager?.setPriceRangeMarkMode(); }
    public setTimePriceRangeMarkMode(): void { this.drawingManager?.setTimePriceRangeMarkMode(); }
    public setHeatMapMode(): void { this.drawingManager?.setHeatMapMode(); }
    public setLongPositionMarkMode(): void { this.drawingManager?.setLongPositionMarkMode(); }
    public setShortPositionMarkMode(): void { this.drawingManager?.setShortPositionMarkMode(); }
    public setMockKLineMarkMode(): void { this.drawingManager?.setMockKLineMarkMode(); }
    public setPencilMode(): void { this.drawingManager?.setPencilMode(); }
    public setPenMode(): void { this.drawingManager?.setPenMode(); }
    public setBrushMode(): void { this.drawingManager?.setBrushMode(); }
    public setMarkerPenMode(): void { this.drawingManager?.setMarkerPenMode(); }
    public setEraserMode(): void { this.drawingManager?.setEraserMode(); }
    public setTextEditMarkMode(): void { this.drawingManager?.setTextEditMarkMode(); }
    public setPriceNoteMarkMode(): void { this.drawingManager?.setPriceNoteMarkMode(); }
    public setBubbleBoxMarkMode(): void { this.drawingManager?.setBubbleBoxMarkMode(); }
    public setPinMarkMode(): void { this.drawingManager?.setPinMarkMode(); }
    public setSignpostMarkMode(): void { this.drawingManager?.setSignpostMarkMode(); }
    public setPriceLabelMode(): void { this.drawingManager?.setPriceLabelMode(); }
    public setFlagMarkMode(): void { this.drawingManager?.setFlagMarkMode(); }
    public setImageMarkMode(): void { this.drawingManager?.setImageMarkMode(); }
    public setEmojiMarkMode(emoji: string): void { this.drawingManager?.setEmojiMarkMode(emoji); }
    public setPriceEventMode(): void { this.drawingManager?.setPriceEventMode(); }
    public setTimeEventMode(): void { this.drawingManager?.setTimeEventMode(); }

    public showAllMark(): void { this.drawingManager?.showAllMark(); }
    public hideAllMark(): void { this.drawingManager?.hideAllMark(); }
    public clearAllMark(): void { this.drawingManager?.clearAllMark(); }

    public getDrawingManager(): DrawingManager | null {
        return this.drawingManager;
    }

    public showTableMarkToolBar(drawing: MarkDrawing): void {
        this.drawingManager?.showTableMarkToolBar(drawing);
    }

    public showTextEditMarkToolBar(drawing: MarkDrawing, isShowGrapTool: boolean): void {
        this.closeTextMarkToolBar();
        this.closeGraphMarkToolBar();
        const containerRect = this.container.getBoundingClientRect();
        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            toolbarPosition = {
                x: containerRect.left + Math.max(10, point.x - 150),
                y: containerRect.top + Math.max(10, point.y - 80)
            };
        }
        this.textMarkToolBar = new TextMarkToolBar({
            position: toolbarPosition,
            selectedDrawing: drawing,
            theme: this.currentTheme,
            i18n: this.i18n,
            container: this.container,
            onClose: () => this.closeTextMarkToolBar(),
            onDelete: () => {
                if (drawing.properties?.originalMark) {
                    this.chartMarkManager?.deleteMark(drawing.markType, drawing.properties.originalMark);
                }
                this.closeTextMarkToolBar();
            },
            onChangeTextColor: (color) => {
                if (this.currentMarkSettingsStyle) {
                    this.currentMarkSettingsStyle.updateStyles({ color });
                }
            },
            onChangeTextStyle: (style) => {
                if (this.currentMarkSettingsStyle) {
                    this.currentMarkSettingsStyle.updateStyles({
                        isBold: style.isBold,
                        isItalic: style.isItalic
                    });
                }
            },
            onChangeTextSize: (size) => {
                if (this.currentMarkSettingsStyle) {
                    this.currentMarkSettingsStyle.updateStyles({ fontSize: size });
                }
            },
            onChangeGraphColor: (color) => {
                if (this.currentMarkSettingsStyle) {
                    this.currentMarkSettingsStyle.updateStyles({ graphColor: color });
                }
            },
            onChangeGraphStyle: (lineStyle) => {
                if (this.currentMarkSettingsStyle) {
                    this.currentMarkSettingsStyle.updateStyles({ graphLineStyle: lineStyle });
                }
            },
            onChangeGraphLineWidth: (width) => {
                if (this.currentMarkSettingsStyle) {
                    this.currentMarkSettingsStyle.updateStyles({ graphLineWidth: width });
                }
            },
            onDragStart: (startPoint) => {
                let lastX = startPoint.x;
                let lastY = startPoint.y;
                let isDragging = true;
                const onMouseMove = (e: MouseEvent) => {
                    if (!isDragging) return;
                    if ((e.buttons & 1) === 0) {
                        onMouseUp();
                        return;
                    }
                    const deltaX = e.clientX - lastX;
                    const deltaY = e.clientY - lastY;
                    lastX = e.clientX;
                    lastY = e.clientY;
                    const toolbar = this.textMarkToolBar?.getContainer();
                    if (toolbar) {
                        const currentLeft = parseInt(toolbar.style.left, 10);
                        const currentTop = parseInt(toolbar.style.top, 10);
                        let newLeft = currentLeft + deltaX;
                        let newTop = currentTop + deltaY;
                        const containerRect = this.container.getBoundingClientRect();
                        const toolbarRect = toolbar.getBoundingClientRect();
                        newLeft = Math.max(containerRect.left, Math.min(newLeft, containerRect.right - toolbarRect.width));
                        newTop = Math.max(containerRect.top, Math.min(newTop, containerRect.bottom - toolbarRect.height));
                        this.textMarkToolBar?.updatePosition({ x: newLeft, y: newTop });
                    }
                };
                const onMouseUp = () => {
                    isDragging = false;
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            },
            isShowGrapTool
        });
    }

    public showGraphMarkToolBar(drawing: MarkDrawing): void {
        this.closeTextMarkToolBar();
        this.closeGraphMarkToolBar();
        const containerRect = this.container.getBoundingClientRect();
        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            toolbarPosition = {
                x: containerRect.left + Math.max(10, point.x - 150),
                y: containerRect.top + Math.max(10, point.y - 80)
            };
        }
        this.graphMarkToolBar = new GraphMarkToolBar({
            position: toolbarPosition,
            selectedDrawing: drawing,
            theme: this.currentTheme,
            i18n: this.i18n,
            container: this.container,
            onClose: () => this.closeGraphMarkToolBar(),
            onDelete: () => {
                if (drawing.properties?.originalMark) {
                    this.chartMarkManager?.deleteMark(drawing.markType, drawing.properties.originalMark);
                }
                this.closeGraphMarkToolBar();
            },
            onChangeColor: (color) => {
                if (this.currentMarkSettingsStyle) {
                    this.currentMarkSettingsStyle.updateStyles({ color });
                }
            },
            onChangeStyle: (lineStyle) => {
                if (this.currentMarkSettingsStyle) {
                    this.currentMarkSettingsStyle.updateStyles({ lineStyle });
                }
            },
            onChangeWidth: (width) => {
                if (this.currentMarkSettingsStyle) {
                    this.currentMarkSettingsStyle.updateStyles({ lineWidth: width });
                }
            },
            onDragStart: (startPoint) => {
                let lastX = startPoint.x;
                let lastY = startPoint.y;
                let isDragging = true;
                const onMouseMove = (e: MouseEvent) => {
                    if (!isDragging) return;
                    if ((e.buttons & 1) === 0) {
                        onMouseUp();
                        return;
                    }
                    const deltaX = e.clientX - lastX;
                    const deltaY = e.clientY - lastY;
                    lastX = e.clientX;
                    lastY = e.clientY;
                    const toolbar = this.graphMarkToolBar?.getContainer();
                    if (toolbar) {
                        const currentLeft = parseInt(toolbar.style.left, 10);
                        const currentTop = parseInt(toolbar.style.top, 10);
                        let newLeft = currentLeft + deltaX;
                        let newTop = currentTop + deltaY;
                        const containerRect = this.container.getBoundingClientRect();
                        const toolbarRect = toolbar.getBoundingClientRect();
                        newLeft = Math.max(containerRect.left, Math.min(newLeft, containerRect.right - toolbarRect.width));
                        newTop = Math.max(containerRect.top, Math.min(newTop, containerRect.bottom - toolbarRect.height));
                        this.graphMarkToolBar?.updatePosition({ x: newLeft, y: newTop });
                    }
                };

                const onMouseUp = () => {
                    isDragging = false;
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        });
    }

    public closeTextMarkToolBar(): void {
        if (this.textMarkToolBar) {
            this.textMarkToolBar.destroy();
            this.textMarkToolBar = null;
        }
    }

    public closeGraphMarkToolBar(): void {
        if (this.graphMarkToolBar) {
            this.graphMarkToolBar.destroy();
            this.graphMarkToolBar = null;
        }
    }

    public closeTableMarkToolBar(): void {
        this.drawingManager?.closeTableMarkToolBar();
    }

    private movementDisableCount: number = 0;
    public disableChartMovement(): void {
        if (!this.chart) return;
        this.movementDisableCount++;
        if (this.movementDisableCount === 1) {
            const currentOptions = this.chart.options();
            this.originalChartOptions = {
                handleScroll: currentOptions.handleScroll,
                handleScale: currentOptions.handleScale,
            };
            this.chart.applyOptions({
                handleScroll: false,
                handleScale: false,
            });
        }
    }

    public enableChartMovement(): void {
        if (!this.chart) return;
        this.chart.applyOptions({
            handleScroll: true,
            handleScale: true,
        });
        this.movementDisableCount = 0;
        this.originalChartOptions = null;
    }

    public handleViewportShiftLeft(): void {
        if (!this.chart) return;
        const timeScale = this.chart.timeScale();
        const logicalRange = timeScale.getVisibleLogicalRange();
        if (!logicalRange) return;
        const { from, to } = logicalRange;
        const range = to - from;
        const shiftAmount = range * 0.2;
        timeScale.setVisibleLogicalRange({
            from: from - shiftAmount,
            to: to - shiftAmount
        });
    }
    public handleViewportShiftRight(): void {
        if (!this.chart) return;
        const timeScale = this.chart.timeScale();
        const logicalRange = timeScale.getVisibleLogicalRange();
        if (!logicalRange) return;
        const { from, to } = logicalRange;
        const range = to - from;
        const shiftAmount = range * 0.2;
        timeScale.setVisibleLogicalRange({
            from: from + shiftAmount,
            to: to + shiftAmount
        });
    }

    /**
 * 放大图表（缩小时间范围）
 */
    public handleZoomIn(): void {
        if (!this.chart) return;

        const timeScale = this.chart.timeScale();
        const logicalRange = timeScale.getVisibleLogicalRange();

        if (!logicalRange) return;

        const { from, to } = logicalRange;
        const center = (from + to) / 2;
        const halfRange = (to - from) / 2;
        const newHalfRange = halfRange * 0.7;

        timeScale.setVisibleLogicalRange({
            from: center - newHalfRange,
            to: center + newHalfRange
        });
    }

    /**
     * 缩小图表（放大时间范围）
     */
    public handleZoomOut(): void {
        if (!this.chart) return;

        const timeScale = this.chart.timeScale();
        const logicalRange = timeScale.getVisibleLogicalRange();

        if (!logicalRange) return;

        const { from, to } = logicalRange;
        const center = (from + to) / 2;
        const halfRange = (to - from) / 2;
        const newHalfRange = halfRange * 1.3;

        timeScale.setVisibleLogicalRange({
            from: center - newHalfRange,
            to: center + newHalfRange
        });
    }

    public addSubChart(
        indicatorType: SubChartIndicatorType,
        onSettingsClick: (type: SubChartIndicatorType) => void,
        onCloseClick: (type: SubChartIndicatorType) => void
    ): void {
        this.chartPanesManager?.addSubChart(
            this as any,
            indicatorType,
            onSettingsClick,
            onCloseClick
        );
    }

    public removeSubChart(indicatorType: SubChartIndicatorType): void {
        this.chartPanesManager?.removePaneBySubChartIndicatorType(indicatorType);
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
        this.drawingManager?.destroy();
        if (this.chart) {
            this.mainChartTechnicalIndicatorManager?.destroy(this.chart);
        }
        this.chartInfo?.destroy();
        this.chartInfoContainer?.remove();
        this.chartPanesManager?.removeAllPane();
        if (this.chartSeries && this.chartSeries.series && this.chart) {
            try {
                this.chart.removeSeries(this.chartSeries.series);
            } catch (e) { }
        }

        if (this.hiddenBaseSeries && this.hiddenBaseSeries.series && this.chart) {
            try {
                this.chart.removeSeries(this.hiddenBaseSeries.series);
            } catch (e) { }
        }

        if (this.imageUploadModal) {
            this.imageUploadModal.destroy();
            this.imageUploadModal = null;
        }
        if (this.mainChartIndicatorsModal) {
            this.mainChartIndicatorsModal.destroy();
            this.mainChartIndicatorsModal = null;
        }
        if (this.subChartIndicatorsModal) {
            this.subChartIndicatorsModal.destroy();
            this.subChartIndicatorsModal = null;
        }
        if (this.textMarkEditorModal) {
            this.textMarkEditorModal.destroy();
            this.textMarkEditorModal = null;
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