import React from 'react';
import { ThemeConfig } from '../Theme';
import { ChartSeries } from './ChartTypeManager';
import { ChartEventManager } from './ChartEventManager';
import { CursorType, HistoryRecord, ICandleViewDataPoint, MainChartIndicatorType, MainChartType, MarkDrawing, MarkType, Point, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from '../types';
import { TextMarkEditorModal } from './Modal/TextMarkEditorModal';
import { IMarkStyle } from '../Mark/IMarkStyle';
import { ImageUploadModal } from './Modal/ImageUploadModal';
import { ChartMarkManager } from './ChartMarkManager';
import { ChartMarkTextEditManager } from './ChartMarkTextEditManager';
import { TextMarkToolBar } from './ToolBar/TextMarkToolBar';
import { GraphMarkToolBar } from './ToolBar/GraphMarkToolBar';
import { MainChartTechnicalIndicatorManager } from '../Indicators/MainChart/MainChartIndicatorManager';
import { ChartMarkState } from './ChartLayerMarkState';
import { getDefaultMainChartIndicators, MainChartIndicatorInfo } from '../Indicators/MainChart/MainChartIndicatorInfo';
import { ChartInfo } from './ChartInfo';
import MainChartIndicatorsSettingModal from './Modal/MainChartIndicatorsSettingModal';
import { I18n } from '../I18n';
import { IStaticMarkData, StaticMarkManager } from '../MarkManager/StaticMarkManager';
import { ChartPanesManager } from './Panes/ChartPanesManager';
import { IIndicatorInfo } from '../Indicators/SubChart/IIndicator';
import SubChartIndicatorsSettingModal from './Modal/SubChartIndicatorsSettingModal';
import { Volume } from './MainChart/Volume';
import { MainChartManager } from './MainChart/MainChartManager';
import { VolumeHeatMap } from './MainChart/VolumeHeatMap';
import { MarketProfile } from './MainChart/MarketProfile';
import { TextEditMark } from '../Mark/Text/TextEditMark';
import { BubbleBoxMark } from '../Mark/Text/BubbleBoxMark';
import { PinMark } from '../Mark/Text/PinMark';
import { SignPostMark } from '../Mark/Text/SignPostMark';
import { ViewportManager } from '../ViewportManager';
import { AIConfig, AIFunctionType } from '../AI/types';
import { CandleView } from '../CandleView';

export interface ChartLayerProps {
    chart: any;
    chartSeries: ChartSeries | null;
    currentTheme: ThemeConfig;
    activeTool: string | null;
    candleView: CandleView,
    onCloseDrawing?: () => void;
    onToolSelect?: (tool: string) => void;
    onTextClick?: (toolId: string) => void;
    onEmojiClick?: (toolId: string) => void;
    selectedEmoji?: string;
    chartData: ICandleViewDataPoint[];
    title?: string;
    // top panel selected main chart indicator
    selectedMainChartIndicator: MainChartIndicatorInfo | null;
    // top panel selected sub chart indicator
    selectedSubChartIndicators: SubChartIndicatorType[];
    handleRemoveSubChartIndicator?: (type: SubChartIndicatorType) => void;
    showInfoLayer: boolean;
    i18n: I18n;
    markData?: IStaticMarkData[];
    onMainChartIndicatorChange: (indicator: MainChartIndicatorInfo | null) => void;
    // current main chart type
    currentMainChartType: MainChartType;
    // view port manager
    viewportManager: ViewportManager | null;
    // enable AI function
    ai: boolean;
    // ai config list
    aiconfigs: AIConfig[];
    // current ai function type
    currentAIFunctionType: AIFunctionType | null;
    // time frame
    timeframe?: TimeframeEnum;
    // time zone
    timezone?: TimezoneEnum;
}

export interface ChartLayerState extends ChartMarkState {
    isDrawing: boolean;
    drawingPoints: Point[];
    currentDrawing: any;
    drawingStartPoint: Point | null;
    drawings: MarkDrawing[];
    isTextMarkToolbar: boolean;
    dragStartPoint: Point | null;
    history: HistoryRecord[];
    historyIndex: number;
    isDragging: boolean;
    isResizing: boolean;
    isRotating: boolean;
    resizeHandle: string | null;
    isTextInputActive: boolean;
    textInputPosition: Point | null;
    textInputValue: string;
    textInputCursorVisible: boolean;
    textInputCursorTimer: NodeJS.Timeout | null;
    activePanel: null;
    editingTextId: string | null;
    isFirstTimeTextMode: boolean;
    isEmojiInputActive: boolean;
    emojiInputPosition: Point | null;
    editingEmojiId: string | null;
    mousePosition: Point | null;
    // ============== chart info start ==============
    currentOHLC: {
        time: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume?: number;
    } | null;
    // is show ohlc
    showOHLC: boolean;
    // ============== chart info end ==============
    // ============== chart info indicators data start ==============
    maIndicatorValues?: { [key: string]: number };
    emaIndicatorValues?: { [key: string]: number };
    bollingerBandsValues?: { [key: string]: number };
    ichimokuValues?: { [key: string]: number };
    donchianChannelValues?: { [key: string]: number };
    envelopeValues?: { [key: string]: number };
    vwapValue?: number | null;
    // ============== chart info indicators data end ==============
    // main chart indicators modal open
    isMainChartIndicatorsModalOpen: boolean;
    // selected main chart indicators
    selectedMainChartIndicators: MainChartIndicatorInfo[];
    // selected main chart indicator type
    selectedMainChartIndicatorTypes: MainChartIndicatorType[];
    // Start editing chart info indicator items
    modalEditingChartInfoIndicator: MainChartIndicatorInfo | null;
    // Technical indicator arrays edited and saved in the modal frame
    modalConfirmChartInfoIndicators: MainChartIndicatorInfo[];
    // sub chart indicator settings modal
    isSubChartIndicatorsSettingModalOpen: boolean;
    subChartIndicatorsSettingModalParams: IIndicatorInfo[];
    currentSubChartIndicatorType: SubChartIndicatorType | null;
    // cursor type
    cursorType: CursorType | null;
    // enable AI function
    ai: boolean;
    // ai config list
    aiconfigs: AIConfig[];
    // current ai function type
    currentAIFunctionType: AIFunctionType | null;
}

class ChartLayer extends React.Component<ChartLayerProps, ChartLayerState> {
    public canvasRef = React.createRef<HTMLCanvasElement>();
    public containerRef = React.createRef<HTMLDivElement>();
    public allDrawings: MarkDrawing[] = [];
    private doubleClickTimeout: NodeJS.Timeout | null = null;
    private chartEventManager: ChartEventManager | null = null;
    private originalChartOptions: any = null;
    // current mark setting style
    public currentMarkSettingsStyle: IMarkStyle | null = null;
    // main chart mark manager
    public chartMarkManager: ChartMarkManager | null = null;
    // main chart mark text edit manager
    public chartMarkTextEditManager: ChartMarkTextEditManager | null = null;
    // main chart indicator manager
    public mainChartTechnicalIndicatorManager: MainChartTechnicalIndicatorManager | null = null;
    // main chart stataic mark manager
    private staticMarkManager: StaticMarkManager | null = null;
    public chartPanesManager: ChartPanesManager | null;
    // chart volume
    private volume: Volume | null = null;
    // volume heat map
    private volumeHeatMap: VolumeHeatMap | null = null;
    // market profile 
    private marketProfile: MarketProfile | null = null;
    // mian chart manager
    public mainChartManager: MainChartManager | null = null;

    constructor(props: ChartLayerProps) {
        super(props);
        this.state = {
            isDrawing: false,
            drawingPoints: [],
            currentDrawing: null,
            drawingStartPoint: null,
            drawings: [],
            selectedTextEditMark: null,
            selectedTableMark: null,
            selectedGraphMark: null,
            markToolBarPosition: { x: 20, y: 20 },
            isTextMarkToolbar: false,
            dragStartPoint: null,
            history: [],
            historyIndex: -1,
            isDragging: false,
            isResizing: false,
            isRotating: false,
            resizeHandle: null,
            isTextInputActive: false,
            textInputPosition: null,
            textInputValue: '',
            textInputCursorVisible: true,
            textInputCursorTimer: null,
            activePanel: null,
            editingTextId: null,
            isFirstTimeTextMode: false,
            isEmojiInputActive: false,
            emojiInputPosition: null,
            editingEmojiId: null,
            mousePosition: null,
            currentOHLC: null,
            showOHLC: true,
            pendingEmojiMark: null,
            isTextMarkEditorOpen: false,
            textMarkEditorPosition: { x: 0, y: 0 },
            textMarkEditorInitialData: {
                text: '',
                color: '#000000',
                fontSize: 14,
                isBold: false,
                isItalic: false
            },
            lineSegmentMarkStartPoint: null,
            arrowLineMarkStartPoint: null,
            parallelChannelMarkStartPoint: null,
            currentLineSegmentMark: null,
            currentArrowLineMark: null,
            currentParallelChannelMark: null,
            currentMarkMode: null,
            showGraphMarkToolBar: false,
            showTableMarkToolBar: false,
            showTextMarkToolBar: false,
            isShowGrapTool: false,
            isGraphMarkToolbarDragging: false,
            graphMarkToolbarDragStartPoint: null,
            linearRegressionChannelStartPoint: null,
            currentLinearRegressionChannel: null,
            equidistantChannelMarkStartPoint: null,
            currentEquidistantChannelMark: null,
            disjointChannelMarkStartPoint: null,
            currentDisjointChannelMark: null,
            andrewPitchforkHandlePoint: null,
            andrewPitchforkBaseStartPoint: null,
            currentAndrewPitchfork: null,
            enhancedAndrewPitchforkHandlePoint: null,
            enhancedAndrewPitchforkBaseStartPoint: null,
            currentEnhancedAndrewPitchfork: null,
            rectangleMarkStartPoint: null,
            currentRectangleMark: null,
            circleMarkStartPoint: null,
            currentCircleMark: null,
            ellipseMarkStartPoint: null,
            currentEllipseMark: null,
            triangleMarkStartPoint: null,
            currentTriangleMark: null,
            gannFanStartPoint: null,
            currentGannFan: null,
            gannBoxStartPoint: null,
            currentGannBox: null,
            gannRectangleStartPoint: null,
            currentGannRectangle: null,
            fibonacciTimeZoonStartPoint: null,
            currentFibonacciTimeZoon: null,
            fibonacciRetracementStartPoint: null,
            currentFibonacciRetracement: null,
            fibonacciArcStartPoint: null,
            currentFibonacciArc: null,
            fibonacciCircleCenterPoint: null,
            currentFibonacciCircle: null,
            fibonacciSpiralCenterPoint: null,
            currentFibonacciSpiral: null,
            fibonacciWedgeCenterPoint: null,
            currentFibonacciWedge: null,
            fibonacciWedgeDrawingStep: 0,
            fibonacciWedgePoints: [],
            fibonacciFanStartPoint: null,
            currentFibonacciFan: null,
            currentFibonacciChannel: null,
            isFibonacciChannelMode: false,
            fibonacciChannelDrawingStep: 0,
            fibonacciExtensionBasePricePoints: [],
            currentFibonacciExtensionBasePrice: null,
            fibonacciExtensionBaseTimePoints: [],
            currentFibonacciExtensionBaseTime: null,
            sectorPoints: [],
            currentSector: null,
            curveMarkStartPoint: null,
            currentCurveMark: null,
            doubleCurveMarkStartPoint: null,
            currentDoubleCurveMark: null,
            xabcdPoints: [],
            currentXABCDMark: null,
            headAndShouldersPoints: [],
            currentHeadAndShouldersMark: null,
            abcdPoints: [],
            currentABCDMark: null,
            triangleABCDPoints: [],
            currentTriangleABCDMark: null,
            elliottImpulsePoints: [],
            currentElliottImpulseMark: null,
            elliottCorrectivePoints: [],
            currentElliottCorrectiveMark: null,
            elliottTrianglePoints: [],
            currentElliottTriangleMark: null,
            // elliott double combination
            elliottDoubleCombinationPoints: [],
            currentElliottDoubleCombinationMark: null,
            // elliott triple combination points
            elliottTripleCombinationPoints: [],
            currentElliottTripleCombinationMark: null,
            // time range mark
            timeRangeMarkStartPoint: null,
            currentTimeRangeMark: null,
            isTimeRangeMarkMode: false,
            // prica range mark 
            priceRangeMarkStartPoint: null,
            currentPriceRangeMark: null,
            isPriceRangeMarkMode: false,
            // time price range
            timePriceRangeMarkStartPoint: null,
            currentTimePriceRangeMark: null,
            isTimePriceRangeMarkMode: false,
            // pencil
            isPencilMode: false,
            isPencilDrawing: false,
            currentPencilMark: null,
            pencilPoints: [],
            // pen
            isPenMode: false,
            isPenDrawing: false,
            currentPenMark: null,
            penPoints: [],
            // brush
            isBrushMode: false,
            isBrushDrawing: false,
            currentBrushMark: null,
            brushPoints: [],
            // marker pen
            isMarkerPenMode: false,
            isMarkerPenDrawing: false,
            currentMarkerPen: null,
            markerPenPoints: [],
            // eraser
            isEraserMode: false,
            isErasing: false,
            eraserHoveredMark: null,
            // thick arrow
            thickArrowLineMarkStartPoint: null,
            currentThickArrowLineMark: null,
            isImageMarkMode: false,
            imageMarkStartPoint: null,
            currentImageMark: null,
            showImageModal: false,
            selectedImageUrl: '',
            isImageUploadModalOpen: false,
            // long position
            isLongPositionMarkMode: false,
            longPositionMarkStartPoint: null,
            currentLongPositionMark: null,
            longPositionDrawingPhase: 'none',
            // long position mark state
            isLongPositionDragging: false,
            dragTarget: null,
            dragPoint: null,
            adjustingMode: null,
            adjustStartData: null,
            // short position mark state
            isShortPositionMarkMode: false,
            shortPositionMarkStartPoint: null,
            currentShortPositionMark: null,
            shortPositionDrawingPhase: 'none',
            isShortPositionDragging: false,
            shortPositionDragTarget: null,
            shortPositionDragPoint: null,
            shortPositionAdjustingMode: null,
            shortPositionAdjustStartData: null,
            // price label
            isPriceLabelMarkMode: false,
            priceLabelMarkPoint: null,
            currentPriceLabelMark: null,
            isPriceLabelDragging: false,
            priceLabelDragTarget: null,
            // flag mark state
            isFlagMarkMode: false,
            flagMarkPoint: null,
            currentFlagMark: null,
            isFlagDragging: false,
            flagDragTarget: null,
            // price note mark state
            isPriceNoteMarkMode: false,
            priceNoteMarkStartPoint: null,
            currentPriceNoteMark: null,
            isPriceNoteDragging: false,
            priceNoteDragTarget: null,
            priceNoteDragPoint: null,
            // signpost
            isSignpostMarkMode: false,
            signpostMarkPoint: null,
            currentSignpostMark: null,
            isSignpostDragging: false,
            signpostDragTarget: null,
            // emoji
            isEmojiMarkMode: false,
            emojiMarkStartPoint: null,
            currentEmojiMark: null,
            isEmojiDragging: false,
            emojiDragTarget: null,
            emojiDragPoint: null,
            // pin
            isPinMarkMode: false,
            pinMarkPoint: null,
            currentPinMark: null,
            isPinDragging: false,
            pinDragTarget: null,
            // buble box
            isBubbleBoxMarkMode: false,
            bubbleBoxMarkPoints: null,
            currentBubbleBoxMark: null,
            isBubbleBoxDragging: false,
            bubbleBoxDragTarget: null,
            bubbleBoxDragType: null,
            // text edit mark
            isTextEditMarkMode: false,
            isTextEditDragging: false,
            textEditDragTarget: null,
            // main chart indicators modal
            isMainChartIndicatorsModalOpen: false,
            // select main chart indicators
            selectedMainChartIndicators: [],
            selectedMainChartIndicatorTypes: [],
            modalEditingChartInfoIndicator: null,
            modalConfirmChartInfoIndicators: getDefaultMainChartIndicators(),
            // ============== chart info indicators data start ==============
            maIndicatorValues: {},
            emaIndicatorValues: {},
            bollingerBandsValues: {},
            ichimokuValues: {},
            donchianChannelValues: {},
            envelopeValues: {},
            vwapValue: null,
            // ============== chart info indicators data end ==============
            isSubChartIndicatorsSettingModalOpen: false,
            subChartIndicatorsSettingModalParams: [],
            currentSubChartIndicatorType: null,
            // mock kline mark state
            isMockKLineMarkMode: false,
            mockKLineMarkStartPoint: null,
            currentMockKLineMark: null,
            isMockKLineDragging: false,
            mockKLineDragTarget: null,
            mockKLineDragPoint: null,
            // heat map mark state
            isHeatMapMode: false,
            heatMapStartPoint: null,
            currentHeatMap: null,
            isHeatMapDragging: false,
            heatMapDragTarget: null,
            heatMapDragPoint: null,
            heatMapDrawingPhase: 'none',
            heatMapAdjustingMode: null,
            // schiff pitch fork mark state
            isSchiffPitchforkMode: false,
            schiffPitchforkHandlePoint: null,
            schiffPitchforkBaseStartPoint: null,
            currentSchiffPitchfork: null,
            isSchiffPitchforkDragging: false,
            schiffPitchforkDragTarget: null,
            schiffPitchforkDragPoint: null,
            schiffPitchforkDrawingPhase: 'none',
            schiffPitchforkAdjustingMode: null,
            // cursor type
            cursorType: CursorType.Crosshair,
            // enable AI function
            ai: this.props.ai || false,
            // ai config list
            aiconfigs: this.props.aiconfigs || [],
            // current ai function type
            currentAIFunctionType: this.props.currentAIFunctionType || null,
            isTimeEventMode: false,
            isTimeEventDragging: false,
            timeEventDragTarget: null,
            currentTimeEventMark: null,
            isPriceEventMode: false,
            isPriceEventDragging: false,
            priceEventDragTarget: null,
            currentPriceEventMark: null,
        };
        this.chartEventManager = new ChartEventManager();
        this.chartMarkManager = new ChartMarkManager();
        this.chartMarkTextEditManager = new ChartMarkTextEditManager();
        // main chart technical indicator manager
        this.mainChartTechnicalIndicatorManager = new MainChartTechnicalIndicatorManager(this.props.currentTheme);
        this.initializeGraphManager();
        // main chart static mark manager
        this.staticMarkManager = new StaticMarkManager();
        this.chartPanesManager = new ChartPanesManager();
        // main chart manager
        this.mainChartManager = new MainChartManager(this, this.props.currentTheme);
    }

    componentDidMount() {
        this.setupCanvas();
        this.setupAllDocumentEvents();
        this.setupAllContainerEvents();
        // init main chart indicators
        this.initializeMainChartIndicators();
        // add a bubble event listener
        this.chartMarkTextEditManager?.setupBubbleBoxMarkEvents(this);
        // add sign event listener
        this.chartMarkTextEditManager?.setupSignPostMarkEvents(this);
        // add pin event listener
        this.chartMarkTextEditManager?.setupPinMarkEvents(this);
        // add event listeners for text editing marks
        this.chartMarkTextEditManager?.setupTextEditMarkEvents(this);
        // init static mark
        this.initStaticMark();
        // register crosshair move event
        if (this.props.chart) {
            this.chartEventManager?.registerCrosshairMoveEvent(this);
        } else {
            setTimeout(() => {
                if (this.props.chart) {
                    this.chartEventManager?.registerCrosshairMoveEvent(this);
                }
            }, 100);
        }
        // show volume 
        setTimeout(() => {
            this.mainChartManager?.switchChartType(MainChartType.Candle);
            this.volume = new Volume(this);
            if (this.props.chart) {
                this.chartPanesManager?.setChartInstance(this.props.chart);
            }
        }, 50);
    }

    componentDidUpdate(prevProps: ChartLayerProps) {
        if (prevProps.chartSeries !== this.props.chartSeries ||
            prevProps.chart !== this.props.chart) {
            this.initializeGraphManagerProps();
        }
        if (prevProps.i18n !== this.props.i18n) {
            this.volumeHeatMap?.updateI18n(this.props.i18n);
            this.marketProfile?.updateI18n(this.props.i18n);
        }
        if (prevProps.currentTheme !== this.props.currentTheme) {
            this.volumeHeatMap?.updateTheme(this.props.currentTheme);
            this.marketProfile?.updateTheme(this.props.currentTheme);
        }
        if (prevProps.ai !== this.props.ai) {
            if (this.props.ai) {
                this.setState({
                    ai: this.props.ai
                });
            }
        }
        if (prevProps.aiconfigs !== this.props.aiconfigs) {
            if (this.props.aiconfigs) {
                this.setState({
                    aiconfigs: this.props.aiconfigs
                });
            }
        }
        if (prevProps.currentAIFunctionType !== this.props.currentAIFunctionType) {
            if (this.props.currentAIFunctionType) {
                this.setState({
                    currentAIFunctionType: this.props.currentAIFunctionType
                });
            }
        }
        if (prevProps.timeframe !== this.props.timeframe || prevProps.timezone !== this.props.timezone) {
            if (this.volume) {
                this.volume.destroy(this);
                this.volume = new Volume(this);
                this.volume.refreshData(this);
            }
        }
        if (this.hasChartDataChanged(prevProps.chartData, this.props.chartData)) {
            // update static mark
            setTimeout(() => {
                this.updateStaticMark();
            }, 0);
            // update main chart maps
            this.handleUpdateMainChartMaps();
            // update main chart indicator
            // this.updateMainChartIndicators();
            this.updateAllMainChartIndicatorData();
            // update sub chart indicator
            this.chartPanesManager?.updateAllPaneData(this.props.chartData);
            // update volume
            this.volume?.refreshData(this);
            // refresh main chart data
            this.mainChartManager?.refreshData();
            // update volume heat map
            this.volumeHeatMap?.refreshData(this);
        } else if (this.hasMainChartIndicatorChanged(prevProps.selectedMainChartIndicator, this.props.selectedMainChartIndicator)) {
            // update main chart maps
            this.handleInitMainChartMaps();
            // update selected main chart indicators
            this.updateSelectedMainChartIndicators();
            // update sub chart indicator
            this.chartPanesManager?.updateAllPaneData(this.props.chartData);
            // update volume
            this.volume?.refreshData(this);
            // refresh main chart data
            this.mainChartManager?.refreshData();
        }
        if (prevProps.currentMainChartType !== this.props.currentMainChartType) {
            this.swtichMainChartType();
        }
        if (prevProps.markData !== this.props.markData) {
            this.staticMarkManager?.clearAllMarks();
            this.updateStaticMark();
        }
        if (prevProps.currentTheme !== this.props.currentTheme) {
            this.chartPanesManager?.updateAllPaneTheme(this.props.currentTheme);
        }
        if (prevProps.selectedSubChartIndicators !== this.props.selectedSubChartIndicators) {
            this.chartPanesManager?.removeAllPane();
            setTimeout(() => {
                this.props.selectedSubChartIndicators.forEach(type => {
                    this.chartPanesManager?.addSubChart(
                        this,
                        type,
                        (indicatorType: SubChartIndicatorType) => {
                            this.showSubChartSettingModal(this.chartPanesManager?.getParamsByIndicatorType(indicatorType), indicatorType);
                        },
                        (indicatorType: SubChartIndicatorType) => {
                            this.chartPanesManager?.removePaneBySubChartIndicatorType(indicatorType);
                            if (this.props.handleRemoveSubChartIndicator) {
                                this.props.handleRemoveSubChartIndicator(indicatorType);
                            }
                        });
                })
            }, 0);
        }
    }

    componentWillUnmount() {
        this.cleanupAllDocumentEvents();
        document.removeEventListener('keydown', this.handleKeyDown);
        if (this.doubleClickTimeout) {
            clearTimeout(this.doubleClickTimeout);
        }
        this.cleanupAllContainerEvents();
        this.destroyGraphManager();
        this.chartMarkTextEditManager?.cleanupBubbleBoxMarkEvents();
        this.chartMarkTextEditManager?.cleanupSignPostMarkEvents();
        this.chartMarkTextEditManager?.cleanupPinMarkEvents();
        this.chartMarkTextEditManager?.cleanupTextEditMarkEvents();
        this.volumeHeatMap?.destroy();
        this.marketProfile?.destroy();
        this.mainChartManager?.destroy();
        this.volume?.destroy(this);
    }

    // handle main chart technical map
    private handleInitMainChartMaps(): void {
        if (!this.props.selectedMainChartIndicator) return;
        if (this.props.selectedMainChartIndicator.type === MainChartIndicatorType.HEATMAP) {
            if (!this.volumeHeatMap) {
                this.volumeHeatMap = new VolumeHeatMap(this, this.props.i18n, this.props.currentTheme, () => {
                    this.volumeHeatMap = null;
                });
                // update volume heat map
                this.volumeHeatMap?.refreshData(this);
            }
        }
        // market profile
        if (this.props.selectedMainChartIndicator.type === MainChartIndicatorType.MARKETPROFILE) {
            if (!this.marketProfile) {
                this.marketProfile = new MarketProfile(this, this.props.i18n, this.props.currentTheme, () => {
                    this.marketProfile = null;
                });
                this.marketProfile?.refreshData(this);
            }
        }
    }

    private handleUpdateMainChartMaps(): void {
        if (!this.props.selectedMainChartIndicator) return;
        // heat map
        if (this.volumeHeatMap) {
            // update volume heat map
            this.volumeHeatMap?.refreshData(this);
        }
        // market profile
        if (this.marketProfile) {
            this.marketProfile?.refreshData(this);
        }
    }

    private hasChartDataChanged(prevData: ICandleViewDataPoint[], currentData: ICandleViewDataPoint[]): boolean {
        if (prevData === currentData) return false;
        if (!prevData || !currentData) return true;
        if (prevData.length !== currentData.length) return true;
        const compareLength = Math.min(prevData.length, currentData.length, 5);
        for (let i = 0; i < compareLength; i++) {
            if (prevData[i].time !== currentData[i].time) {
                return true;
            }
        }
        return false;
    }

    private hasMainChartIndicatorChanged(prevIndicator: MainChartIndicatorInfo | null, currentIndicator: MainChartIndicatorInfo | null): boolean {
        if (prevIndicator === currentIndicator) return false;
        if (!prevIndicator || !currentIndicator) return true;
        return prevIndicator.type !== currentIndicator.type ||
            prevIndicator.nonce !== currentIndicator.nonce ||
            JSON.stringify(prevIndicator.params) !== JSON.stringify(currentIndicator.params);
    }

    // init static mark
    private initStaticMark() {
        setTimeout(() => {
            if (this.props.markData) {
                this.staticMarkManager?.addMark(this.props.markData, {
                    series: this.mainChartManager?.getCurrentSeries(),
                    type: "mark",
                });
            }
        }, 200);
    }

    // update static mark
    private updateStaticMark() {
        if (this.props.markData) {
            this.staticMarkManager?.addMark(this.props.markData, {
                series: this.mainChartManager?.getCurrentSeries(),
                type: "mark",
            });
        }
    }

    // swtich main chart type
    private swtichMainChartType = (): void => {
        this.mainChartManager?.switchChartType(this.props.currentMainChartType);
        this.mainChartManager?.refreshData();
        this.updateStaticMark();
    }

    // set cursor type
    public setCursorType = (cursorType: CursorType): void => {
        if (cursorType) {
            this.setState({
                cursorType: cursorType
            });
        }
    }

    // ========================== Main Chart Indicator  Start ==========================
    private initializeMainChartIndicators = (): void => {
        if (!this.mainChartTechnicalIndicatorManager) {
            return;
        }
        const { selectedMainChartIndicator } = this.props;
        if (selectedMainChartIndicator) {
            this.updateSelectedMainChartIndicators();
        }
    };

    private updateAllMainChartIndicatorData = (): void => {
        const { selectedMainChartIndicators } = this.state;
        selectedMainChartIndicators.forEach(indicator => {
            if (indicator.type !== null) {
                this.mainChartTechnicalIndicatorManager?.updateAllMainChartIndicatorData(this, indicator);
            }
        })
    }

    private updateMainChartIndicators = (): void => {
        const { selectedMainChartIndicators } = this.state;
        selectedMainChartIndicators.forEach(indicator => {
            if (indicator.type !== null) {
                this.mainChartTechnicalIndicatorManager?.removeIndicator(this.props.chart, indicator.type);
                this.mainChartTechnicalIndicatorManager?.updateMainChartIndicator(this, indicator);
            }
        })
    }

    private updateSelectedMainChartIndicators = (): void => {
        if (!this.mainChartTechnicalIndicatorManager || !this.props.chartData) {
            return;
        }
        const { selectedMainChartIndicator } = this.props;
        if (!selectedMainChartIndicator) {
            return;
        }
        // maps technology that does not process main chart
        if (MainChartIndicatorType.HEATMAP === selectedMainChartIndicator.type ||
            MainChartIndicatorType.MARKETPROFILE === selectedMainChartIndicator.type
        ) {
            return;
        }
        this.setState(prevState => {
            const isTypeExists = prevState.selectedMainChartIndicators.some(
                indicator => indicator.type === selectedMainChartIndicator.type
            );
            let updatedIndicators: MainChartIndicatorInfo[];
            if (isTypeExists) {
                updatedIndicators = prevState.selectedMainChartIndicators.map(indicator =>
                    indicator.type === selectedMainChartIndicator.type ? selectedMainChartIndicator : indicator
                );
            } else {
                updatedIndicators = [...prevState.selectedMainChartIndicators, selectedMainChartIndicator];
            }
            const types: MainChartIndicatorType[] = updatedIndicators
                .map(indicator => indicator.type)
                .filter((type): type is MainChartIndicatorType => type !== null);
            const updatedModalIndicators = getDefaultMainChartIndicators().map(indicator => {
                if (indicator.type && types.includes(indicator.type)) {
                    const currentConfig = updatedIndicators.find(
                        selected => selected.type === indicator.type
                    );
                    return {
                        ...indicator,
                        visible: true,
                        params: currentConfig?.params || indicator.params
                    };
                }
                return {
                    ...indicator,
                    visible: false
                };
            });
            return {
                selectedMainChartIndicators: updatedIndicators,
                selectedMainChartIndicatorTypes: types,
                modalConfirmChartInfoIndicators: updatedModalIndicators
            };
        }, () => {
            this.updateMainChartIndicators();
        });
    };

    private handleOpenIndicatorSettings = (indicator: MainChartIndicatorInfo) => {
        if (!indicator.type) return;
        this.setState({
            modalEditingChartInfoIndicator: indicator,
            isMainChartIndicatorsModalOpen: true
        });
    };

    private handleMainChartIndicatorsSettingConfirm = (updatedIndicator: MainChartIndicatorInfo) => {
        if (updatedIndicator.params) {
            updatedIndicator.params = updatedIndicator.params.filter(param =>
                param.paramValue !== 0
            );
        }
        try {
            this.mainChartTechnicalIndicatorManager?.updateMainChartIndicator(this, updatedIndicator);
            this.setState(prevState => ({
                selectedMainChartIndicators: prevState.selectedMainChartIndicators.map(indicator =>
                    indicator.type === updatedIndicator.type ? updatedIndicator : indicator
                ),
            }));
            this.setState({
                isMainChartIndicatorsModalOpen: false,
                modalEditingChartInfoIndicator: null
            });
        } catch (error) {
            this.setState({
                isMainChartIndicatorsModalOpen: false,
                modalEditingChartInfoIndicator: null
            });
        }
    };

    private handleRemoveIndicator = (type: MainChartIndicatorType | null) => {
        if (!type || !this.mainChartTechnicalIndicatorManager || !this.props.chart) {
            return;
        }
        if (type === MainChartIndicatorType.HEATMAP) {
            setTimeout(() => {
                if (this.volumeHeatMap) {
                    this.volumeHeatMap.destroy();
                    this.volumeHeatMap = null;
                }
            }, 0);
            return;
        }
        if (type === MainChartIndicatorType.MARKETPROFILE) {
            setTimeout(() => {
                if (this.marketProfile) {
                    this.marketProfile.destroy();
                    this.marketProfile = null;
                }
            }, 0);
            return;
        }
        this.mainChartTechnicalIndicatorManager.removeIndicator(this.props.chart, type);
        this.setState(prevState => ({
            selectedMainChartIndicators: prevState.selectedMainChartIndicators.filter(
                indicator => indicator.type !== type
            ),
            selectedMainChartIndicatorTypes: prevState.selectedMainChartIndicatorTypes.filter(t => t !== type),
        }));
        if (this.props.onMainChartIndicatorChange && this.props.selectedMainChartIndicator?.type === type) {
            this.props.onMainChartIndicatorChange(null);
        }
        if (this.props.onToolSelect && this.props.selectedMainChartIndicator?.type === type) {
            this.props.onToolSelect('');
        }
    };

    // ========================== Main Chart Indicator End ==========================

    public setPriceEventMode = () => {
        this.chartMarkManager?.setPriceEventMode(this);
    };

    public setTimeEventMode = () => {
        this.chartMarkManager?.setTimeEventMode(this);
    };

    public setMockKLineMarkMode = () => {
        this.chartMarkManager?.setMockKLineMarkMode(this);
    };

    // Initialize the graphics manager
    private initializeGraphManager = () => {
        this.chartMarkManager?.initializeMarkManager(this);
    }

    // Initialize the graphics manager props
    private initializeGraphManagerProps = () => {
        this.chartMarkManager?.initializeMarkManagerProps(this);
    }

    // Destroy Graph Manager
    private destroyGraphManager = () => {
        this.chartMarkManager?.destroyMarkManager();
    }

    // ================= Left Panel Callback Function Start =================
    public showAllMark = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.showAllMarks();
    };

    public hideAllMark = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.hideAllMarks();
    };

    public clearAllMark = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.deleteAllMark();
    };

    public setSchiffPitchforkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setSchiffPitchforkMode(this);
    };

    public setHeatMapMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setHeatMapMode(this);
    };

    public setTextEditMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setTextEditMarkMode(this);
    };

    public setBubbleBoxMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setBubbleBoxMarkMode(this);
    };

    public setPinMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setPinMarkMode(this);
    };

    public setEmojiMarkMode = (emoji: string) => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setEmojiMarkMode(this, emoji);
    };

    public setSignpostMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setSignpostMarkMode(this);
    };

    public setPriceNoteMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setPriceNoteMarkMode(this);
    };

    public setFlagMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setFlagMarkMode(this);
    };

    public setPriceLabelMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setPriceLabelMode(this);
    };

    public setShortPositionMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setShortPositionMarkMode(this);
    };

    public setLongPositionMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setLongPositionMarkMode(this);
    };

    public setThickArrowLineMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setThickArrowLineMode(this);
    };

    public setEraserMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setEraserMode(this);
    };

    public setMarkerPenMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setMarkerPenMode(this);
    };

    public setBrushMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setBrushMode(this);
    };

    public setPenMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setPenMode(this);
    };

    public setPencilMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setPencilMode(this);
    };

    public setTimePriceRangeMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setTimePriceRangeMarkMode(this);
    };

    public setPriceRangeMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setPriceRangeMarkMode(this);
    };

    public setTimeRangeMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setTimeRangeMarkMode(this);
    };

    public setElliottTripleCombinationMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setElliottTripleCombinationMode(this);
    };

    public setElliottDoubleCombinationMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setElliottDoubleCombinationMode(this);
    };

    public setElliottTriangleMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setElliottTriangleMode(this);
    };

    public setElliottCorrectiveMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setElliottCorrectiveMode(this);
    };

    public setElliottImpulseMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setElliottImpulseMode(this);
    };

    public setTriangleABCDMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setTriangleABCDMode(this);
    };

    public setABCDMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setABCDMode(this);
    };

    public setHeadAndShouldersMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setHeadAndShouldersMode(this);
    };

    public setXABCDMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setXABCDMode(this);
    };

    public setDoubleCurveMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setDoubleCurveMode(this);
    };

    public setCurveMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setCurveMode(this);
    };

    public setSectorMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setSectorMode(this);
    };

    public setFibonacciExtensionBaseTimeMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setFibonacciExtensionBaseTimeMode(this);
    };

    public setFibonacciExtensionBasePriceMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setFibonacciExtensionBasePriceMode(this);
    };

    public setFibonacciChannelMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setFibonacciChannelMode(this);
    };

    public setFibonacciFanMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setFibonacciFanMode(this);
    };

    public setFibonacciWedgeMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setFibonacciWedgeMode(this);
    };

    public setFibonacciSpiralMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setFibonacciSpiralMode(this);
    };

    public setFibonacciCircleMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setFibonacciCircleMode(this);
    };

    public setFibonacciArcMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setFibonacciArcMode(this);
    };

    public setFibonacciRetracementMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setFibonacciRetracementMode(this);
    };

    public setFibonacciTimeZoonMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setFibonacciTimeZoonMode(this);
    };

    public setGannRectangleMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setGannRectangleMode(this);
    };

    public setGannBoxMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setGannBoxMode(this);
    };

    public setGannFanMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setGannFanMode(this);
    };

    public setTriangleMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setTriangleMarkMode(this);
    };

    public setEllipseMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setEllipseMarkMode(this);
    };

    public setCircleMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setCircleMarkMode(this);
    };

    public setRectangleMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setRectangleMarkMode(this);
    };

    public setEnhancedAndrewPitchforkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setEnhancedAndrewPitchforkMode(this);
    };

    public setAndrewPitchforkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setAndrewPitchforkMode(this);
    };

    public setDisjointChannelMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setDisjointChannelMarkMode(this);
    };

    public setEquidistantChannelMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setEquidistantChannelMarkMode(this);
    };

    public setLinearRegressionChannelMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setLinearRegressionChannelMode(this);
    };

    public setLineSegmentMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setLineSegmentMarkMode(this);
    };

    public setHorizontalLineMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setHorizontalLineMode(this);
    };

    public setVerticalLineMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setVerticalLineMode(this);
    };

    public setArrowLineMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setArrowLineMarkMode(this);
    };

    public setParallelChannelMarkMode = () => {
        this.chartMarkManager?.closeAllBrushTools(this);
        this.chartMarkManager?.setParallelChannelMarkMode(this);
    };
    // ================= Left Panel Callback Function End =================


    // ================= Tool Bar Start =================
    // show graph mark tool
    public showGraphMarkToolBar = (drawing: MarkDrawing) => {
        if (this.state.selectedGraphMark && this.state.selectedGraphMark.id === drawing.id) {
            return;
        }
        if (this.state.selectedGraphMark) {
            return;
        }
        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            toolbarPosition = {
                x: Math.max(10, point.x - 150),
                y: Math.max(10, point.y - 80)
            };
        }
        this.setState({
            selectedGraphMark: drawing,
            markToolBarPosition: toolbarPosition,
            showGraphMarkToolBar: true
        });
    };

    public closeGraphMarkToolBar = () => {
        this.setState({
            showGraphMarkToolBar: false,
        });
    };

    // show table mark tool
    public showTableMarkToolBar = (drawing: MarkDrawing) => {
        if (this.state.selectedTableMark && this.state.selectedTableMark.id === drawing.id) {
            return;
        }
        if (this.state.selectedTableMark) {
            return;
        }
        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            toolbarPosition = {
                x: Math.max(10, point.x - 150),
                y: Math.max(10, point.y - 80)
            };
        }
        this.setState({
            selectedTableMark: drawing,
            markToolBarPosition: toolbarPosition,
            showTableMarkToolBar: true
        });
    };

    public closeTableMarkToolBar = () => {
        this.setState({
            showTableMarkToolBar: false,
        });
    };

    // show text mark tool
    public showTextEditMarkToolBar = (drawing: MarkDrawing, isShowGrapTool: boolean) => {
        if (this.state.selectedTextEditMark && this.state.selectedTextEditMark.id === drawing.id) {
            return;
        }
        if (this.state.selectedTextEditMark) {
            return;
        }
        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            toolbarPosition = {
                x: Math.max(10, point.x - 150),
                y: Math.max(10, point.y - 80)
            };
        }
        this.setState({
            selectedTextEditMark: drawing,
            markToolBarPosition: toolbarPosition,
            showTextMarkToolBar: true,
            isShowGrapTool: isShowGrapTool,
        });
    };

    public closeTextMarkToolBar = () => {
        this.setState({
            showTextMarkToolBar: false,
        });
    };
    // ================= Tool Bar End =================


    private setupAllContainerEvents() {
        if (!this.containerRef.current) return;
        const container = this.containerRef.current;
        container.addEventListener('mousedown', this.handleMouseDown);
        container.addEventListener('mousemove', this.handleMouseMove);
        container.addEventListener('mouseup', this.handleMouseUp);
    }

    private cleanupAllContainerEvents() {
        if (!this.containerRef.current) return;
        const container = this.containerRef.current;
        container.removeEventListener('mousedown', this.handleMouseDown);
        container.removeEventListener('mousemove', this.handleMouseMove);
        container.removeEventListener('mouseup', this.handleMouseUp);
    }

    private setupAllDocumentEvents() {
        // keydown
        document.addEventListener('keydown', this.handleKeyDown);
        //mousedown
        document.addEventListener('mousemove', this.handleDocumentMouseMove);
        document.addEventListener('mousedown', this.handleDocumentMouseDown);
        document.addEventListener('mouseup', this.handleDocumentMouseUp);
        document.addEventListener('wheel', this.handleDocumentMouseWheel);
    }

    private cleanupAllDocumentEvents() {
        // keydown
        document.removeEventListener('keydown', this.handleKeyDown);
        //mousedown
        document.removeEventListener('mousemove', this.handleDocumentMouseMove);
        document.removeEventListener('mousedown', this.handleDocumentMouseDown);
        document.removeEventListener('mouseup', this.handleDocumentMouseUp);
        document.removeEventListener('wheel', this.handleDocumentMouseWheel);
    }

    private handleMouseDown = (event: MouseEvent) => {
        this.chartEventManager?.mouseDown(this, event);
    };

    private handleMouseUp = (event: MouseEvent) => {
        this.chartEventManager?.mouseUp(this, event);
    };

    private handleMouseMove = (event: MouseEvent) => {
        this.chartEventManager?.mouseMove(this, event);
    };

    public serializeDrawings(): string {
        return JSON.stringify(this.allDrawings);
    }

    // =============================== Viewport Manager Operation Start ===============================
    handleViewportShiftLeft = () => {
        if (this.props.chart && this.props.viewportManager) {
            this.props.viewportManager.scrollChart('left');
        }
    };

    handleViewportShiftRight = () => {
        if (this.props.chart && this.props.viewportManager) {
            this.props.viewportManager.scrollChart('right');
        }
    };

    handleZoomIn = () => {
        if (this.props.viewportManager) {
            this.props.viewportManager.zoomIn();
        }
    };

    handleZoomOut = () => {
        if (this.props.viewportManager) {
            this.props.viewportManager.zoomOut();
        }
    };
    // =============================== Viewport Manager Operation End ===============================


    // =============================== Indicators Modal Start ===============================
    public openIndicatorsModal = (): void => {
        this.setState({
            isMainChartIndicatorsModalOpen: true
        });
    };

    private handleToggleIndicator = (type: MainChartIndicatorType | null) => {
        if (!type) return;
        if (this.mainChartTechnicalIndicatorManager?.isVisible(type)) {
            this.mainChartTechnicalIndicatorManager?.hideIndicator(type);
        } else {
            this.mainChartTechnicalIndicatorManager?.showIndicator(type);
        }
    };

    // chart info
    private renderChartInfo = () => {
        const { currentTheme, title } = this.props;
        const {
            currentOHLC,
            mousePosition,
            showOHLC,
            maIndicatorValues,
            emaIndicatorValues,
            bollingerBandsValues,
            ichimokuValues,
            donchianChannelValues,
            envelopeValues,
            vwapValue,
            selectedMainChartIndicators
        } = this.state;
        return (
            <ChartInfo
                currentTheme={currentTheme}
                title={title}
                currentOHLC={currentOHLC}
                mousePosition={mousePosition}
                showOHLC={showOHLC}
                onToggleOHLC={this.toggleOHLCVisibility}
                onOpenIndicatorsModal={this.openIndicatorsModal}
                onOpenIndicatorSettings={this.handleOpenIndicatorSettings}
                onRemoveIndicator={this.handleRemoveIndicator}
                onToggleIndicator={this.handleToggleIndicator}
                visibleIndicatorTypes={this.state.selectedMainChartIndicatorTypes}
                indicators={selectedMainChartIndicators}
                maIndicatorValues={maIndicatorValues}
                emaIndicatorValues={emaIndicatorValues}
                bollingerBandsValues={bollingerBandsValues}
                ichimokuValues={ichimokuValues}
                donchianChannelValues={donchianChannelValues}
                envelopeValues={envelopeValues}
                vwapValue={vwapValue}
                i18n={this.props.i18n}
            />
        );
    };

    private handleIndicatorsClose = () => {
        this.setState({
            isMainChartIndicatorsModalOpen: false,
            modalEditingChartInfoIndicator: null,
            selectedMainChartIndicators: []
        });
    };
    // =============================== Indicators Modal End ===============================

    // =============================== Image Mark Start ===============================
    public setImageMarkMode = (): void => {
        if (!this.chartMarkManager?.imageMarkManager) return;
        this.setState({
            isImageUploadModalOpen: true,
        });
    };

    private handleImageConfirm = (imageUrl: string) => {
        this.setSelectedImageUrl(imageUrl);
        this.setState({
            isImageUploadModalOpen: false
        });
        if (this.chartMarkManager?.imageMarkManager) {
            this.chartMarkManager?.imageMarkManager.setSelectedImageUrl(imageUrl);
            const newState = this.chartMarkManager?.imageMarkManager.startImageMarkMode();
            this.setState({
                isImageMarkMode: newState.isImageMarkMode,
                imageMarkStartPoint: newState.imageMarkStartPoint,
                currentImageMark: newState.currentImageMark,
                currentMarkMode: MarkType.Image
            });
        }
    };

    private handleImageUploadClose = () => {
        this.setState({
            isImageUploadModalOpen: false,
        });
        if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
        }
    };

    private setSelectedImageUrl = (url: string): void => {
        if (this.chartMarkManager?.imageMarkManager) {
            this.chartMarkManager?.imageMarkManager.setSelectedImageUrl(url);
        }
        this.setState({
            selectedImageUrl: url
        });
    };
    // =============================== Image Mark End ===============================

    // =============================== Text Tool Bar Edit Callback Start ===============================
    private handleChangeTextMarkFontColor = (color: string) => {
        if (!this.state.selectedTextEditMark) return;
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'color': color });
        }
    };

    private handleChangeTextMarkStyle = (style: { isBold?: boolean; isItalic?: boolean }) => {
        let isBold = style.isBold;
        let isItalic = style.isItalic;
        if (!this.state.selectedTextEditMark) return;
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'isBold': isBold, 'isItalic': isItalic });
        }
    };

    private handleChangeTextMarkFontSize = (fontSize: number) => {
        if (!this.state.selectedTextEditMark) return;
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'fontSize': fontSize });
        }
    };

    // set graph mark color
    private handleChangeTextMarkGraphColor = (color: string) => {
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'graphColor': color });
        }
    };

    // set graph mark style
    private handleChangeTextMarkGraphLineStyle = (lineStyle: 'solid' | 'dashed' | 'dotted') => {
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'graphLineStyle': lineStyle });
        }
    };

    // set graph mark line width
    private handleChangeTextMarkGraphLineWidth = (width: number) => {
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'graphLineWidth': width });
        }
    };

    // handle delete text edit mark
    private handleDeleteTextEditMark = () => {
        if (!this.state.selectedTextEditMark) return;
        const textMark = this.state.selectedTextEditMark;
        const markType = textMark.markType;
        this.chartMarkManager?.deleteMark(markType, textMark.properties.originalMark);
        this.setState({
            selectedTextEditMark: null,
            markToolBarPosition: { x: 20, y: 20 }
        });
    };

    private handleTextMarkEditorSave = (text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => {
        this.setState({
            isTextMarkEditorOpen: false,
        });
        if (!this.state.selectedTextEditMark) return;
        if (color) {
            this.handleChangeTextMarkFontColor(color);
        }
        if (fontSize) {
            this.handleChangeTextMarkFontSize(fontSize);
        }
        if (isBold) {
            this.handleChangeTextMarkStyle({ isBold: isBold });
        }
        if (isItalic) {
            this.handleChangeTextMarkStyle({ isItalic: isItalic });
        }
        // update text
        if (text) {
            switch (this.state.selectedTextEditMark.markType) {
                case MarkType.TextEdit:
                    (this.state.selectedTextEditMark.mark as TextEditMark).updateText(text);
                    break;
                case MarkType.BubbleBox:
                    (this.state.selectedTextEditMark.mark as BubbleBoxMark).updateText(text);
                    break;
                case MarkType.Pin:
                    (this.state.selectedTextEditMark.mark as PinMark).updateText(text);
                    break;
                case MarkType.SignPost:
                    (this.state.selectedTextEditMark.mark as SignPostMark).updateText(text);
                    break;
                default:
                    break;
            }
        }

    };

    private handleTextMarkEditorCancel = () => {
        this.setState({
            isTextMarkEditorOpen: false,
        });
        if (!this.state.selectedTextEditMark) return;
    };
    // =============================== Text Tool Bar Edit Callback End ===============================

    // =============================== Graph Mark Tool Bar Start ===============================
    private handleDeleteGraphMark = () => {
        if (!this.state.selectedGraphMark) return;
        const drawing = this.state.selectedGraphMark;
        if (drawing.properties?.originalMark) {
            this.chartMarkManager?.deleteMark(drawing.markType, drawing.properties.originalMark);
        }
        this.closeGraphMarkToolBar();
    };

    // set graph mark color
    private handleChangeGraphMarkColor = (color: string) => {
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'color': color });
        }
    };

    // set graph mark style
    private handleChangeGraphMarkStyle = (lineStyle: 'solid' | 'dashed' | 'dotted') => {
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'lineStyle': lineStyle });
        }
    };

    // set graph mark line width
    private handleChangeGraphMarkWidth = (width: number) => {
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'lineWidth': width });
        }
    };

    private handleGraphToolbarDrag = (startPoint: Point) => {
        this.setState({
            isGraphMarkToolbarDragging: true,
            graphMarkToolbarDragStartPoint: startPoint
        });
        const handleMouseMove = (event: MouseEvent) => {
            if (this.state.isGraphMarkToolbarDragging && this.state.graphMarkToolbarDragStartPoint) {
                const deltaX = event.clientX - this.state.graphMarkToolbarDragStartPoint.x;
                const deltaY = event.clientY - this.state.graphMarkToolbarDragStartPoint.y;

                this.setState(prevState => ({
                    markToolBarPosition: {
                        x: Math.max(0, prevState.markToolBarPosition.x + deltaX),
                        y: Math.max(0, prevState.markToolBarPosition.y + deltaY)
                    },
                    graphMarkToolbarDragStartPoint: { x: event.clientX, y: event.clientY }
                }));
            }
        };
        const handleMouseUp = () => {
            this.setState({
                isGraphMarkToolbarDragging: false,
                graphMarkToolbarDragStartPoint: null
            });
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    // =============================== Graph Mark Tool Bar End ===============================

    private handleKeyDown = (event: KeyboardEvent) => {
        this.chartEventManager?.handleKeyDown(this, event);
    };

    private setupCanvas() {
        const canvas = this.canvasRef.current;
        const container = this.containerRef.current;
        if (!canvas || !container) return;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    // ======================= Document flow events =======================
    // Document flow events are used to separate them from the events of the drawing layer.
    private handleDocumentMouseUp = (event: MouseEvent) => {
        this.chartEventManager?.documentMouseUp(this, event);
    }

    private handleDocumentMouseDown = (event: MouseEvent) => {
        this.chartEventManager?.documentMouseDown(this, event);
    }

    private handleDocumentMouseMove = (event: MouseEvent) => {
        this.chartEventManager?.documentMouseMove(this, event);
    };

    // Handling of wheel for the main chart.
    private handleDocumentMouseWheel = (event: MouseEvent) => {
        this.chartEventManager?.documentMouseWheel(this, event);
    };
    // ======================= Document flow events =======================

    // ======================= Drawing layer operations =======================
    // 获取绘图层DOM元素的位置信息
    public getDrawingLayerElementsPosition(): Array<{
        id: string;
        type: string;
        position: { x: number; y: number };
        element?: HTMLElement;
    }> {
        const elements: Array<{
            id: string;
            type: string;
            position: { x: number; y: number };
            element?: HTMLElement;
        }> = [];
        if (!this.containerRef.current) return elements;
        const textElements = this.containerRef.current.querySelectorAll('.drawing-text-element');
        textElements.forEach(element => {
            const textId = element.getAttribute('data-text-id');
            if (textId) {
                const htmlElement = element as HTMLElement;
                const rect = htmlElement.getBoundingClientRect();
                const containerRect = this.containerRef.current!.getBoundingClientRect();
                elements.push({
                    id: textId,
                    type: 'text',
                    position: {
                        x: rect.left - containerRect.left,
                        y: rect.top - containerRect.top
                    },
                    element: htmlElement
                });
            }
        });
        const emojiElements = this.containerRef.current.querySelectorAll('.drawing-emoji-element');
        emojiElements.forEach(element => {
            const emojiId = element.getAttribute('data-emoji-id');
            if (emojiId) {
                const htmlElement = element as HTMLElement;
                const rect = htmlElement.getBoundingClientRect();
                const containerRect = this.containerRef.current!.getBoundingClientRect();
                elements.push({
                    id: emojiId,
                    type: 'emoji',
                    position: {
                        x: rect.left - containerRect.left,
                        y: rect.top - containerRect.top
                    },
                    element: htmlElement
                });
            }
        });
        return elements;
    }

    public setDrawingLayerElementsPosition(
        positions: Array<{
            id: string;
            type: string;
            position: { x: number; y: number };
        }>
    ): void {
        if (!this.containerRef.current) return;
        positions.forEach(pos => {
            let element: HTMLElement | null = null;
            if (pos.type === 'text') {
                element = this.containerRef.current!.querySelector(`[data-text-id="${pos.id}"]`) as HTMLElement;
            } else if (pos.type === 'emoji') {
                element = this.containerRef.current!.querySelector(`[data-emoji-id="${pos.id}"]`) as HTMLElement;
            }

            if (element) {
                element.style.position = 'absolute';
                element.style.left = `${pos.position.x}px`;
                element.style.top = `${pos.position.y}px`;
                const drawingIndex = this.allDrawings.findIndex(d => d.id === pos.id);
                if (drawingIndex !== -1 && this.allDrawings[drawingIndex].points.length > 0) {
                    this.allDrawings[drawingIndex].points[0] = { ...pos.position };
                }
            }
        });
    }

    public moveDrawingLayerElements(deltaX: number, deltaY: number): void {
        if (!this.containerRef.current) return;
        const textElements = this.containerRef.current.querySelectorAll('.drawing-text-element');
        textElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            const currentLeft = parseInt(htmlElement.style.left) || 0;
            const currentTop = parseInt(htmlElement.style.top) || 0;
            htmlElement.style.left = `${currentLeft + deltaX}px`;
            htmlElement.style.top = `${currentTop + deltaY}px`;
        });
        const emojiElements = this.containerRef.current.querySelectorAll('.drawing-emoji-element');
        emojiElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            const currentLeft = parseInt(htmlElement.style.left) || 0;
            const currentTop = parseInt(htmlElement.style.top) || 0;
            htmlElement.style.left = `${currentLeft + deltaX}px`;
            htmlElement.style.top = `${currentTop + deltaY}px`;
        });
        this.allDrawings.forEach(drawing => {
            if ((drawing.type === 'text' || drawing.type === 'emoji') && drawing.points.length > 0) {
                drawing.points[0].x += deltaX;
                drawing.points[0].y += deltaY;
            }
        });
    }

    public getDrawingLayerElementsByType(type: 'text' | 'emoji'): Array<{
        id: string;
        position: { x: number; y: number };
        element: HTMLElement;
    }> {
        const elements: Array<{
            id: string;
            position: { x: number; y: number };
            element: HTMLElement;
        }> = [];
        if (!this.containerRef.current) return elements;
        const selector = type === 'text' ? '.drawing-text-element' : '.drawing-emoji-element';
        const attribute = type === 'text' ? 'data-text-id' : 'data-emoji-id';
        const domElements = this.containerRef.current.querySelectorAll(selector);
        domElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            const elementId = htmlElement.getAttribute(attribute);
            if (elementId) {
                const rect = htmlElement.getBoundingClientRect();
                const containerRect = this.containerRef.current!.getBoundingClientRect();
                elements.push({
                    id: elementId,
                    position: {
                        x: rect.left - containerRect.left,
                        y: rect.top - containerRect.top
                    },
                    element: htmlElement
                });
            }
        });
        return elements;
    }
    // ======================= Drawing layer operations =======================

    private handleTextMarkToolBarDrag = (startPoint: Point) => {
        this.setState({
            isTextMarkToolbar: true,
            dragStartPoint: startPoint
        });
        const handleMouseMove = (event: MouseEvent) => {
            if (this.state.isTextMarkToolbar && this.state.dragStartPoint) {
                const deltaX = event.clientX - this.state.dragStartPoint.x;
                const deltaY = event.clientY - this.state.dragStartPoint.y;
                this.setState(prevState => ({
                    markToolBarPosition: {
                        x: Math.max(0, prevState.markToolBarPosition.x + deltaX),
                        y: Math.max(0, prevState.markToolBarPosition.y + deltaY)
                    },
                    dragStartPoint: { x: event.clientX, y: event.clientY }
                }));
            }
        };
        const handleMouseUp = () => {
            this.setState({
                isTextMarkToolbar: false,
                dragStartPoint: null
            });
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    private getToolName = (toolId: string): string => {
        return "";
    };


    private toggleOHLCVisibility = () => {
        this.setState(prevState => ({
            showOHLC: !prevState.showOHLC
        }));
    };

    // 禁用图表移动
    public disableChartMovement() {
        if (this.props.chart) {
            this.originalChartOptions = this.props.chart.options();
            this.props.chart.applyOptions({
                handleScroll: false,
                handleScale: false,
            });
        }
    }

    // 启用图表移动
    public enableChartMovement() {
        this.props.chart.applyOptions({
            handleScroll: true,
            handleScale: true,
        });
    }

    // Main chart drawing area
    private renderMainChart = () => {
        return (
            <canvas
                ref={this.canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 'calc(100% - 60px)',
                    height: 'calc(100% - 60px)',
                    pointerEvents: 'none',
                    zIndex: 1,
                }}
            />
        );
    };

    public showSubChartSettingModal = (initialParams: IIndicatorInfo[] = [], subChartIndicatorType: SubChartIndicatorType): void => {
        this.setState({
            isSubChartIndicatorsSettingModalOpen: true,
            subChartIndicatorsSettingModalParams: initialParams,
            currentSubChartIndicatorType: subChartIndicatorType
        });
    };

    private handleSubChartSettingClose = (): void => {
        this.setState({
            isSubChartIndicatorsSettingModalOpen: false,
            subChartIndicatorsSettingModalParams: [],
            currentSubChartIndicatorType: null,
        });
    };

    private handleSubChartSettingConfirm = (params: IIndicatorInfo[]): void => {
        if (this.state.currentSubChartIndicatorType) {
            this.chartPanesManager?.updateSettingsBySubChartIndicatorType(this.props.chartData, params, this.state.currentSubChartIndicatorType);
        }
        this.handleSubChartSettingClose();
    };

    render() {
        const { activeTool, currentTheme, showInfoLayer = true } = this.props;
        const {
            isTextMarkToolbar,
            showGraphMarkToolBar,
            showTableMarkToolBar,
            markToolBarPosition,
            showTextMarkToolBar,
            selectedTextEditMark,
            selectedTableMark,
            selectedGraphMark,
            isMainChartIndicatorsModalOpen,
            isSubChartIndicatorsSettingModalOpen,
            subChartIndicatorsSettingModalParams,
            currentSubChartIndicatorType
        } = this.state;
        return (
            <div
                style={{
                    width: '100%',
                }}>
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: activeTool ? 'auto' : 'none',
                        opacity: 1,
                        display: 'block',
                        // overflow: 'hidden'
                    }}
                >
                    {/* information layer */}
                    {showInfoLayer && (
                        <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
                            {this.renderChartInfo()}
                        </div>
                    )}
                    {/* Main chart layer */}
                    <div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        {this.renderMainChart()}
                    </div>
                    {/* drawing layer */}
                    <div
                        ref={this.containerRef}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            minHeight: '300px'
                        }}
                    >
                        {this.state.isTextMarkEditorOpen && (
                            <TextMarkEditorModal
                                isOpen={this.state.isTextMarkEditorOpen}
                                position={this.state.textMarkEditorPosition}
                                theme={this.props.currentTheme}
                                initialText={this.state.textMarkEditorInitialData.text}
                                initialColor={this.state.textMarkEditorInitialData.color}
                                initialFontSize={this.state.textMarkEditorInitialData.fontSize}
                                initialIsBold={this.state.textMarkEditorInitialData.isBold}
                                initialIsItalic={this.state.textMarkEditorInitialData.isItalic}
                                onSave={this.handleTextMarkEditorSave}
                                onCancel={this.handleTextMarkEditorCancel}
                                i18n={this.props.i18n}
                            />
                        )}
                        {isSubChartIndicatorsSettingModalOpen && (
                            <SubChartIndicatorsSettingModal
                                isOpen={isSubChartIndicatorsSettingModalOpen}
                                onClose={this.handleSubChartSettingClose}
                                onConfirm={this.handleSubChartSettingConfirm}
                                initialParams={subChartIndicatorsSettingModalParams}
                                theme={currentTheme}
                                parentRef={this.containerRef}
                                indicatorType={currentSubChartIndicatorType}
                                i18n={this.props.i18n}
                            />
                        )}
                        {this.state.isImageUploadModalOpen && (
                            <ImageUploadModal
                                isOpen={this.state.isImageUploadModalOpen}
                                onClose={this.handleImageUploadClose}
                                onConfirm={this.handleImageConfirm}
                                theme={currentTheme}
                                i18n={this.props.i18n}
                            />
                        )}
                        {isMainChartIndicatorsModalOpen && (
                            <MainChartIndicatorsSettingModal
                                isOpen={isMainChartIndicatorsModalOpen}
                                onClose={this.handleIndicatorsClose}
                                onConfirm={this.handleMainChartIndicatorsSettingConfirm}
                                initialIndicator={this.state.modalEditingChartInfoIndicator}
                                theme={currentTheme}
                                parentRef={this.containerRef}
                                indicatorType={this.state.modalEditingChartInfoIndicator?.type || null}
                                i18n={this.props.i18n}
                            />
                        )}
                        {showTextMarkToolBar && (
                            <TextMarkToolBar
                                position={markToolBarPosition}
                                selectedDrawing={selectedTextEditMark}
                                theme={currentTheme}
                                onClose={this.closeTextMarkToolBar}
                                onDelete={this.handleDeleteTextEditMark}
                                onChangeTextColor={this.handleChangeTextMarkFontColor}
                                onChangeTextStyle={this.handleChangeTextMarkStyle}
                                onChangeTextSize={this.handleChangeTextMarkFontSize}
                                onDragStart={this.handleTextMarkToolBarDrag}
                                isDragging={isTextMarkToolbar}
                                getToolName={this.getToolName}
                                isShowGrapTool={this.state.isShowGrapTool}
                                onChangeGraphColor={this.handleChangeTextMarkGraphColor}
                                onChangeGraphStyle={this.handleChangeTextMarkGraphLineStyle}
                                onChangeGraphLineWidth={this.handleChangeTextMarkGraphLineWidth}
                                i18n={this.props.i18n}
                            />
                        )}
                        {showGraphMarkToolBar && (
                            <GraphMarkToolBar
                                position={markToolBarPosition}
                                selectedDrawing={selectedGraphMark}
                                theme={currentTheme}
                                onClose={this.closeGraphMarkToolBar}
                                onDelete={this.handleDeleteGraphMark}
                                onChangeColor={this.handleChangeGraphMarkColor}
                                onChangeStyle={this.handleChangeGraphMarkStyle}
                                onChangeWidth={this.handleChangeGraphMarkWidth}
                                onDragStart={this.handleGraphToolbarDrag}
                                isDragging={false}
                                getToolName={this.getToolName}
                                i18n={this.props.i18n}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export { ChartLayer };
export type { MarkDrawing };