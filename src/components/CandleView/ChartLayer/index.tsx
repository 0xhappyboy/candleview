import React from 'react';
import { drawingConfigs, DrawingConfig, registerDrawingConfig, unregisterDrawingConfig } from '../Drawing/DrawingConfigs';
import { CanvasRenderer } from '../Drawing/CanvasRenderer';
import { HistoryManager } from '../Drawing/HistoryManager';
import { ThemeConfig } from '../CandleViewTheme';
import { TechnicalIndicatorsPanel } from '../Indicators/TechnicalIndicatorsPanel';
import { MainChartVolume } from '../Indicators/main/MainChartVolume';
import { OverlayManager } from './OverlayManager';
import { DataPointManager } from './DataPointManager';
import { ChartSeries } from './ChartTypeManager';
import { ChartEventManager } from './ChartEventManager';
import { Drawing, HistoryRecord, MarkType, Point } from '../types';
import { MultiBottomArrowMark } from '../Mark/Static/MultiBottomArrowMark';
import { BottomArrowMark } from '../Mark/Static/BottomArrowMark';
import { TopArrowMark } from '../Mark/Static/TopArrowMark';
import { TextMarkEditorModal } from './TextMarkEditorModal';
import { MultiTopArrowMark } from '../Mark/Static/MultiTopArrowMark';
import { LineSegmentMark } from '../Mark/Line/LineSegmentMark';
import { GraphMarkToolbar } from './GraphMarkToolbar';
import { IGraph } from '../Mark/IGraph';
import { IGraphStyle } from '../Mark/IGraphStyle';
import { TextMarkToolbar } from './TextMarkToolbar';
import { ArrowLineMark } from '../Mark/Arrow/ArrowLineMark';
import { RectangleMark } from '../Mark/Shape/RectangleMark.ts';
import { CircleMark } from '../Mark/Shape/CircleMark';
import { EllipseMark } from '../Mark/Shape/EllipseMark';
import { TriangleMark } from '../Mark/Shape/TriangleMark';
import { SectorMark } from '../Mark/Shape/SectorMark';
import { CurveMark } from '../Mark/Shape/CurveMark';
import { DoubleCurveMark } from '../Mark/Shape/DoubleCurveMark';
import { XABCDMark } from '../Mark/Pattern/XABCDMark';
import { HeadAndShouldersMark } from '../Mark/Pattern/HeadAndShouldersMark';
import { ABCDMark } from '../Mark/Pattern/ABCDMark';
import { TriangleABCDMark } from '../Mark/Pattern/TriangleABCDMark';
import { ElliottImpulseMark } from '../Mark/Pattern/ElliottImpulseMark';
import { ElliottCorrectiveMark } from '../Mark/Pattern/ElliottCorrectiveMark';
import { ElliottTriangleMark } from '../Mark/Pattern/ElliottTriangleMark';
import { ElliottDoubleCombinationMark } from '../Mark/Pattern/ElliottDoubleCombinationMark';
import { ElliottTripleCombinationMark } from '../Mark/Pattern/ElliottTripleCombinationMark';
import { TimeRangeMark } from '../Mark/Range/TimeRangeMark';
import { PriceRangeMark } from '../Mark/Range/PriceRangeMark';
import { TimePriceRangeMark } from '../Mark/Range/TimePriceRangeMark';
import { PencilMark } from '../Mark/Pen/PencilMark';
import { PenMark } from '../Mark/Pen/PenMark';
import { BrushMark } from '../Mark/Pen/BrushMark';
import { MarkerPenMark } from '../Mark/Pen/MarkerPenMark';
import { DisjointChannelMark } from '../Mark/Channel/DisjointChannelMark';
import { EquidistantChannelMark } from '../Mark/Channel/EquidistantChannelMark';
import { LinearRegressionChannelMark } from '../Mark/Channel/LinearRegressionChannelMark';
import { ParallelChannelMark } from '../Mark/Channel/ParallelChannelMark';
import { FibonacciArcMark } from '../Mark/Fibonacci/FibonacciArcMark';
import { FibonacciChannelMark } from '../Mark/Fibonacci/FibonacciChannelMark';
import { FibonacciCircleMark } from '../Mark/Fibonacci/FibonacciCircleMark';
import { FibonacciExtensionBasePriceMark } from '../Mark/Fibonacci/FibonacciExtensionBasePriceMark';
import { FibonacciExtensionBaseTimeMark } from '../Mark/Fibonacci/FibonacciExtensionBaseTimeMark';
import { FibonacciFanMark } from '../Mark/Fibonacci/FibonacciFanMark';
import { FibonacciRetracementMark } from '../Mark/Fibonacci/FibonacciRetracementMark';
import { FibonacciSpiralMark } from '../Mark/Fibonacci/FibonacciSpiralMark';
import { FibonacciTimeZoonMark } from '../Mark/Fibonacci/FibonacciTimeZoonMark';
import { FibonacciWedgeMark } from '../Mark/Fibonacci/FibonacciWedgeMark';
import { AndrewPitchforkMark } from '../Mark/Fork/AndrewPitchforkMark';
import { EnhancedAndrewPitchforkMark } from '../Mark/Fork/EnhancedAndrewPitchforkMark';
import { GannBoxMark } from '../Mark/Gann/GannBoxMark';
import { GannFanMark } from '../Mark/Gann/GannFanMark';
import { GannRectangleMark } from '../Mark/Gann/GannRectangleMark';
import { ThickArrowLineMark } from '../Mark/Arrow/ThickArrowLineMark';
import { ImageUploadModal } from './ImageUploadModal';
import { ImageMark } from '../Mark/Content/ImageMark';
import { TableMark } from '../Mark/Content/TableMark';
import { ChartMarkManager } from './ChartMarkManager';
import { SignPostMark } from '../Mark/Text/SignPostMark';
import { TextMark } from '../Mark/Text/TextMark';
import { EmojiMark } from '../Mark/Text/EmojiMark';

export interface ChartLayerProps {
    chart: any;
    chartSeries: ChartSeries | null;
    currentTheme: ThemeConfig;
    activeTool: string | null;
    onCloseDrawing?: () => void;
    onToolSelect?: (tool: string) => void;
    onTextClick?: (toolId: string) => void;
    onEmojiClick?: (toolId: string) => void;
    selectedEmoji?: string;
    chartData: Array<{
        time: string;
        value: number;
        open: number;
        high: number;
        low: number;
        close: number;
    }>;
    activeIndicators: string[];
    indicatorsHeight?: number;
    title?: string;
}

export interface ChartLayerState {
    isDrawing: boolean;
    drawingPoints: Point[];
    currentDrawing: any;
    drawingStartPoint: Point | null;
    drawings: Drawing[];
    selectedDrawing: Drawing | null;
    textMarkToolbarPosition: Point;
    graphMarkToolbarPosition: Point;
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
    selectedEmoji: string;
    editingEmojiId: string | null;
    isFirstTimeEmojiMode: boolean;
    mousePosition: Point | null;
    currentOHLC: {
        time: string;
        open: number;
        high: number;
        low: number;
        close: number;
    } | null;
    showOHLC: boolean;
    pendingEmojiMark: string | null;
    isTextMarkEditorOpen: boolean;
    editingTextMark: TextMark | null;
    textMarkEditorPosition: { x: number; y: number };
    textMarkEditorInitialData: {
        text: string;
        color: string;
        fontSize: number;
        isBold: boolean;
        isItalic: boolean;
    };
    lineSegmentMarkStartPoint: Point | null;
    arrowLineMarkStartPoint: Point | null;
    parallelChannelMarkStartPoint: Point | null;
    currentLineSegmentMark: LineSegmentMark | null;
    currentArrowLineMark: ArrowLineMark | null;
    currentParallelChannelMark: ParallelChannelMark | null;
    linearRegressionChannelStartPoint: Point | null;
    currentLinearRegressionChannel: LinearRegressionChannelMark | null;
    equidistantChannelMarkStartPoint: Point | null;
    currentEquidistantChannelMark: EquidistantChannelMark | null;
    // the currently active tagging mode.
    currentMarkMode: MarkType | null;
    // Graphical operation related status
    showGraphMarkToolbar: boolean;
    selectedGraphDrawing: Drawing | null;
    isGraphMarkToolbarDragging: boolean,







    graphMarkToolbarDragStartPoint: Point | null;
    disjointChannelMarkStartPoint: Point | null;
    currentDisjointChannelMark: DisjointChannelMark | null;
    andrewPitchforkHandlePoint: Point | null;
    andrewPitchforkBaseStartPoint: Point | null;
    currentAndrewPitchfork: AndrewPitchforkMark | null;
    enhancedAndrewPitchforkHandlePoint: Point | null;
    enhancedAndrewPitchforkBaseStartPoint: Point | null;
    currentEnhancedAndrewPitchfork: EnhancedAndrewPitchforkMark | null;
    rectangleMarkStartPoint: Point | null;
    currentRectangleMark: RectangleMark | null;
    circleMarkStartPoint: Point | null;
    currentCircleMark: CircleMark | null;
    ellipseMarkStartPoint: Point | null;
    currentEllipseMark: EllipseMark | null;
    triangleMarkStartPoint: Point | null;
    currentTriangleMark: TriangleMark | null;
    gannFanStartPoint: Point | null;
    currentGannFan: GannFanMark | null;
    gannBoxStartPoint: Point | null;
    currentGannBox: GannBoxMark | null;
    gannRectangleStartPoint: Point | null;
    currentGannRectangle: GannRectangleMark | null;
    fibonacciTimeZoonStartPoint: Point | null;
    currentFibonacciTimeZoon: FibonacciTimeZoonMark | null;
    fibonacciRetracementStartPoint: Point | null;
    currentFibonacciRetracement: FibonacciRetracementMark | null;
    fibonacciArcStartPoint: Point | null;
    currentFibonacciArc: FibonacciArcMark | null;
    fibonacciCircleCenterPoint: Point | null;
    currentFibonacciCircle: FibonacciCircleMark | null;
    fibonacciSpiralCenterPoint: Point | null;
    currentFibonacciSpiral: FibonacciSpiralMark | null;
    // fibonacci wdge 
    fibonacciWedgeCenterPoint: Point | null;
    currentFibonacciWedge: FibonacciWedgeMark | null;
    fibonacciWedgeDrawingStep: number;
    fibonacciWedgePoints: Point[];
    // fibonacci fan
    fibonacciFanStartPoint: Point | null;
    currentFibonacciFan: FibonacciFanMark | null;
    // fibonacci channel
    currentFibonacciChannel: FibonacciChannelMark | null;
    isFibonacciChannelMode: boolean;
    fibonacciChannelDrawingStep: number;
    // fibonacci trend-based extension
    fibonacciExtensionBasePricePoints: Point[];
    currentFibonacciExtensionBasePrice: FibonacciExtensionBasePriceMark | null;
    fibonacciExtensionBaseTimePoints: Point[];
    currentFibonacciExtensionBaseTime: FibonacciExtensionBaseTimeMark | null;
    sectorPoints: Point[];
    currentSector: SectorMark | null;
    curveMarkStartPoint: Point | null;
    currentCurveMark: CurveMark | null;
    doubleCurveMarkStartPoint: Point | null;
    currentDoubleCurveMark: DoubleCurveMark | null;
    xabcdPoints: Point[];
    currentXABCDMark: XABCDMark | null;
    headAndShouldersPoints: Point[];
    currentHeadAndShouldersMark: HeadAndShouldersMark | null;
    abcdPoints: Point[];
    currentABCDMark: ABCDMark | null;
    triangleABCDPoints: Point[];
    currentTriangleABCDMark: TriangleABCDMark | null;
    elliottImpulsePoints: Point[];
    currentElliottImpulseMark: ElliottImpulseMark | null;
    elliottCorrectivePoints: Point[];
    currentElliottCorrectiveMark: ElliottCorrectiveMark | null;
    elliottTrianglePoints: Point[];
    currentElliottTriangleMark: ElliottTriangleMark | null;
    elliottDoubleCombinationPoints: Point[];
    currentElliottDoubleCombinationMark: ElliottDoubleCombinationMark | null;
    elliottTripleCombinationPoints: Point[];
    currentElliottTripleCombinationMark: ElliottTripleCombinationMark | null;
    timeRangeMarkStartPoint: Point | null;
    currentTimeRangeMark: TimeRangeMark | null;
    isTimeRangeMarkMode: boolean;
    // price range mark
    priceRangeMarkStartPoint: Point | null;
    currentPriceRangeMark: PriceRangeMark | null;
    isPriceRangeMarkMode: boolean;
    // time price range
    timePriceRangeMarkStartPoint: Point | null;
    currentTimePriceRangeMark: TimePriceRangeMark | null;
    isTimePriceRangeMarkMode: boolean;
    // pencil
    isPencilMode: boolean;
    isPencilDrawing: boolean;
    currentPencilMark: PencilMark | null;
    pencilPoints: Point[];
    // pen
    isPenMode: boolean;
    isPenDrawing: boolean;
    currentPenMark: PenMark | null;
    penPoints: Point[];
    // brush
    isBrushMode: boolean;
    isBrushDrawing: boolean;
    currentBrushMark: BrushMark | null;
    brushPoints: Point[];
    // mark pen
    isMarkerPenMode: boolean;
    isMarkerPenDrawing: boolean;
    currentMarkerPen: MarkerPenMark | null;
    markerPenPoints: Point[];
    // eraser
    isEraserMode?: boolean;
    isErasing?: boolean;
    eraserHoveredMark?: any;
    // thick arrow line
    thickArrowLineMarkStartPoint: Point | null;
    currentThickArrowLineMark: ThickArrowLineMark | null;
    // image mark
    isImageMarkMode: boolean;
    imageMarkStartPoint: Point | null;
    currentImageMark: ImageMark | null;
    showImageModal: boolean;
    selectedImageUrl: string;
    isImageUploadModalOpen: boolean;

    // table mark
    isTableMarkMode: boolean;
    tableMarkStartPoint: Point | null;
    currentTableMark: TableMark | null;
    isTableDragging: boolean;
    tableDragTarget: TableMark | null;
    tableDragPoint: 'table' | 'corner' | null;

    // long positoin mark state
    isLongPositionMarkMode: boolean;
    longPositionMarkStartPoint: Point | null;
    currentLongPositionMark: any | null;
    longPositionDrawingPhase: 'firstPoint' | 'secondPoint' | 'none';
    isLongPositionDragging: boolean;
    dragTarget: any | null;
    dragPoint: string | null;
    adjustingMode: string | null;
    adjustStartData: { time: string; price: number } | null;

    // short position mark state
    isShortPositionMarkMode: boolean,
    shortPositionMarkStartPoint: Point | null;
    currentShortPositionMark: any | null;
    shortPositionDrawingPhase: 'firstPoint' | 'secondPoint' | 'none';
    isShortPositionDragging: boolean;
    shortPositionDragTarget: any | null;
    shortPositionDragPoint: string | null;
    shortPositionAdjustingMode: string | null;
    shortPositionAdjustStartData: { time: string; price: number } | null;

    // price label
    isPriceLabelMarkMode: boolean;
    priceLabelMarkPoint: Point | null;
    currentPriceLabelMark: any | null;
    isPriceLabelDragging: boolean;
    priceLabelDragTarget: any | null;

    // flag mark
    isFlagMarkMode: boolean;
    flagMarkPoint: Point | null;
    currentFlagMark: any | null;
    isFlagDragging: boolean;
    flagDragTarget: any | null;

    // price note
    isPriceNoteMarkMode: boolean;
    priceNoteMarkStartPoint: Point | null;
    currentPriceNoteMark: any | null;
    isPriceNoteDragging: boolean;
    priceNoteDragTarget: any | null;
    priceNoteDragPoint: 'start' | 'end' | 'line' | null;

    // signpost
    isSignpostMarkMode: boolean;
    signpostMarkPoint: Point | null;
    currentSignpostMark: SignPostMark | null;
    isSignpostDragging: boolean;
    signpostDragTarget: SignPostMark | null;
}

class ChartLayer extends React.Component<ChartLayerProps, ChartLayerState> {
    public canvasRef = React.createRef<HTMLCanvasElement>();
    public containerRef = React.createRef<HTMLDivElement>();
    public allDrawings: Drawing[] = [];
    private drawingConfigs = drawingConfigs;
    private historyManager: HistoryManager;
    private readonly MAX_HISTORY_SIZE = 50;
    private doubleClickTimeout: NodeJS.Timeout | null = null;
    private overlayManager: OverlayManager | null = null;
    private dataPointManager: DataPointManager | null = null;
    private previewLineSegmentMark: LineSegmentMark | null = null;
    private chartEventManager: ChartEventManager | null = null;
    private originalChartOptions: any = null;
    public currentGraphSettingsStyle: IGraphStyle | null = null;
    // chart mark manager
    public chartMarkManager: ChartMarkManager | null = null;

    constructor(props: ChartLayerProps) {
        super(props);
        this.state = {
            isDrawing: false,
            drawingPoints: [],
            currentDrawing: null,
            drawingStartPoint: null,
            drawings: [],
            selectedDrawing: null,
            textMarkToolbarPosition: { x: 20, y: 20 },
            graphMarkToolbarPosition: { x: 20, y: 20 },
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
            selectedEmoji: '😀',
            editingEmojiId: null,
            isFirstTimeEmojiMode: false,
            mousePosition: null,
            currentOHLC: null,
            showOHLC: true,
            pendingEmojiMark: null,
            isTextMarkEditorOpen: false,
            editingTextMark: null,
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
            showGraphMarkToolbar: false,
            selectedGraphDrawing: null,
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

            elliottDoubleCombinationPoints: [],
            currentElliottDoubleCombinationMark: null,

            elliottTripleCombinationPoints: [],
            currentElliottTripleCombinationMark: null,

            timeRangeMarkStartPoint: null,
            currentTimeRangeMark: null,
            isTimeRangeMarkMode: false,


            priceRangeMarkStartPoint: null,
            currentPriceRangeMark: null,
            isPriceRangeMarkMode: false,

            timePriceRangeMarkStartPoint: null,
            currentTimePriceRangeMark: null,
            isTimePriceRangeMarkMode: false,





            isPencilMode: false,
            isPencilDrawing: false,
            currentPencilMark: null,
            pencilPoints: [],

            isPenMode: false,
            isPenDrawing: false,
            currentPenMark: null,
            penPoints: [],

            isBrushMode: false,
            isBrushDrawing: false,
            currentBrushMark: null,
            brushPoints: [],

            isMarkerPenMode: false,
            isMarkerPenDrawing: false,
            currentMarkerPen: null,
            markerPenPoints: [],


            isEraserMode: false,
            isErasing: false,
            eraserHoveredMark: null,

            thickArrowLineMarkStartPoint: null,
            currentThickArrowLineMark: null,


            isImageMarkMode: false,
            imageMarkStartPoint: null,
            currentImageMark: null,
            showImageModal: false,
            selectedImageUrl: '',
            isImageUploadModalOpen: false,


            // table mark
            isTableMarkMode: false,
            tableMarkStartPoint: null,
            currentTableMark: null,
            isTableDragging: false,
            tableDragTarget: null,
            tableDragPoint: null,


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
        };
        this.historyManager = new HistoryManager(this.MAX_HISTORY_SIZE);
        this.chartEventManager = new ChartEventManager();
        this.chartMarkManager = new ChartMarkManager();
        this.initializeGraphManager();
    }

    componentDidMount() {
        this.setupCanvas();
        this.setupAllDocumentEvents();
        this.setupAllContainerEvents();
        // this.saveToHistory('init');
        // this.setupChartCoordinateListener();
        this.initializeDataPointManager();
        if (this.containerRef.current) {
            this.overlayManager = new OverlayManager(this.containerRef.current);
            this.overlayManager.setChartContext(
                this.props.chartData,
                this.props.chart,
                this.canvasRef.current!,
                this.dataPointManager!
            );
            // ======================= 覆盖物 ======================
            setTimeout(() => {
                const mark = new TopArrowMark('2025-01-01', 97.2
                );
                const mark2 = new BottomArrowMark('2025-01-01', 102.3
                );
                const mark3 = new TopArrowMark('2025-01-11', 88.7
                );
                const mark4 = new BottomArrowMark('2025-01-11', 118
                );
                const mark5 = new MultiBottomArrowMark('2025-01-14', 68.5, 5);
                const mark6 = new MultiTopArrowMark('2025-01-14', 68.5, 5);
                const mark7 = new EmojiMark('2025-01-14', 68.5, '🚀', 'ASDFASDF');
                this.props.chartSeries?.series.attachPrimitive(mark);
                this.props.chartSeries?.series.attachPrimitive(mark2);
                this.props.chartSeries?.series.attachPrimitive(mark3);
                this.props.chartSeries?.series.attachPrimitive(mark4);
                this.props.chartSeries?.series.attachPrimitive(mark5);
                this.props.chartSeries?.series.attachPrimitive(mark6);
                // this.props.chartSeries?.series.attachPrimitive(mark7);
            }, 1000);
            // =================== 覆盖物 ====================
        }
        // 注册图表事件
        // this.props.chartEventManager.registerVisibleTimeRangeChangeEvent((p) => {
        //     console.log('***************1 图表缩放和移动');
        //     console.log(p);
        // });
        // this.props.chartEventManager.registerVisibleLogicalRangeChangeEvent((p) => {
        //     console.log('***************2 图表缩放和移动');
        //     console.log(p);
        // });
        // 添加文字标记事件监听
        this.setupTextMarkEvents();
        // 添加文字标记编辑器模态框事件监听
        this.setupTextMarkEditorEvents();
    }

    componentDidUpdate(prevProps: ChartLayerProps) {
        if (prevProps.chartSeries !== this.props.chartSeries ||
            prevProps.chart !== this.props.chart) {
            this.initializeGraphManagerProps();
        }
    }

    componentWillUnmount() {
        this.cleanupAllDocumentEvents();
        document.removeEventListener('keydown', this.handleKeyDown);
        if (this.doubleClickTimeout) {
            clearTimeout(this.doubleClickTimeout);
        }
        if (this.overlayManager) {
            this.overlayManager.destroy();
        }
        this.cleanupAllContainerEvents();
        this.destroyGraphManager();
    }

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

    public setSignpostMarkMode = () => {
        this.chartMarkManager?.setSignpostMarkMode(this);
    };

    public setPriceNoteMarkMode = () => {
        this.chartMarkManager?.setPriceNoteMarkMode(this);
    };

    public setFlagMarkMode = () => {
        this.chartMarkManager?.setFlagMarkMode(this);
    };

    public setPriceLabelMode = () => {
        this.chartMarkManager?.setPriceLabelMode(this);
    };

    public setShortPositionMarkMode = () => {
        this.chartMarkManager?.setShortPositionMarkMode(this);
    };

    public setLongPositionMarkMode = () => {
        this.chartMarkManager?.setLongPositionMarkMode(this);
    };

    public setTableMarkMode = () => {
        this.chartMarkManager?.setTableMarkMode(this);
    };

    public setThickArrowLineMode = () => {
        this.chartMarkManager?.setThickArrowLineMode(this);
    };

    public setEraserMode = () => {
        this.chartMarkManager?.setEraserMode(this);
    };

    public setMarkerPenMode = () => {
        this.chartMarkManager?.setMarkerPenMode(this);
    };

    public setBrushMode = () => {
        this.chartMarkManager?.setBrushMode(this);
    };

    public setPenMode = () => {
        this.chartMarkManager?.setPenMode(this);
    };

    public setPencilMode = () => {
        this.chartMarkManager?.setPencilMode(this);
    };

    public setTimePriceRangeMarkMode = () => {
        this.chartMarkManager?.setTimePriceRangeMarkMode(this);
    };

    public setPriceRangeMarkMode = () => {
        this.chartMarkManager?.setPriceRangeMarkMode(this);
    };

    public setTimeRangeMarkMode = () => {
        this.chartMarkManager?.setTimeRangeMarkMode(this);
    };

    public setElliottTripleCombinationMode = () => {
        this.chartMarkManager?.setElliottTripleCombinationMode(this);
    };

    public setElliottDoubleCombinationMode = () => {
        this.chartMarkManager?.setElliottDoubleCombinationMode(this);
    };

    public setElliottTriangleMode = () => {
        this.chartMarkManager?.setElliottTriangleMode(this);
    };

    public setElliottCorrectiveMode = () => {
        this.chartMarkManager?.setElliottCorrectiveMode(this);
    };

    public setElliottImpulseMode = () => {
        this.chartMarkManager?.setElliottImpulseMode(this);
    };

    public setTriangleABCDMode = () => {
        this.chartMarkManager?.setTriangleABCDMode(this);
    };

    public setABCDMode = () => {
        this.chartMarkManager?.setABCDMode(this);
    };

    public setHeadAndShouldersMode = () => {
        this.chartMarkManager?.setHeadAndShouldersMode(this);
    };

    public setXABCDMode = () => {
        this.chartMarkManager?.setXABCDMode(this);
    };

    public setDoubleCurveMode = () => {
        this.chartMarkManager?.setDoubleCurveMode(this);
    };

    public setCurveMode = () => {
        this.chartMarkManager?.setCurveMode(this);
    };

    public setSectorMode = () => {
        this.chartMarkManager?.setSectorMode(this);
    };

    public setFibonacciExtensionBaseTimeMode = () => {
        this.chartMarkManager?.setFibonacciExtensionBaseTimeMode(this);
    };

    public setFibonacciExtensionBasePriceMode = () => {
        this.chartMarkManager?.setFibonacciExtensionBasePriceMode(this);
    };

    public setFibonacciChannelMode = () => {
        this.chartMarkManager?.setFibonacciChannelMode(this);
    };

    public setFibonacciFanMode = () => {
        this.chartMarkManager?.setFibonacciFanMode(this);
    };

    public setFibonacciWedgeMode = () => {
        this.chartMarkManager?.setFibonacciWedgeMode(this);
    };

    public setFibonacciSpiralMode = () => {
        this.chartMarkManager?.setFibonacciSpiralMode(this);
    };

    public setFibonacciCircleMode = () => {
        this.chartMarkManager?.setFibonacciCircleMode(this);
    };

    public setFibonacciArcMode = () => {
        this.chartMarkManager?.setFibonacciArcMode(this);
    };

    public setFibonacciRetracementMode = () => {
        this.chartMarkManager?.setFibonacciRetracementMode(this);
    };

    public setFibonacciTimeZoonMode = () => {
        this.chartMarkManager?.setFibonacciTimeZoonMode(this);
    };

    public setGannRectangleMode = () => {
        this.chartMarkManager?.setGannRectangleMode(this);
    };

    public setGannBoxMode = () => {
        this.chartMarkManager?.setGannBoxMode(this);
    };

    public setGannFanMode = () => {
        this.chartMarkManager?.setGannFanMode(this);
    };

    public setTriangleMarkMode = () => {
        this.chartMarkManager?.setTriangleMarkMode(this);
    };

    public setEllipseMarkMode = () => {
        this.chartMarkManager?.setEllipseMarkMode(this);
    };

    public setCircleMarkMode = () => {
        this.chartMarkManager?.setCircleMarkMode(this);
    };

    public setRectangleMarkMode = () => {
        this.chartMarkManager?.setRectangleMarkMode(this);
    };

    public setEnhancedAndrewPitchforkMode = () => {
        this.chartMarkManager?.setEnhancedAndrewPitchforkMode(this);
    };

    public setAndrewPitchforkMode = () => {
        this.chartMarkManager?.setAndrewPitchforkMode(this);
    };

    public setDisjointChannelMarkMode = () => {
        this.chartMarkManager?.setDisjointChannelMarkMode(this);
    };

    public setEquidistantChannelMarkMode = () => {
        this.chartMarkManager?.setEquidistantChannelMarkMode(this);
    };

    public setLinearRegressionChannelMode = () => {
        this.chartMarkManager?.setLinearRegressionChannelMode(this);
    };

    public setLineSegmentMarkMode = () => {
        this.chartMarkManager?.setLineSegmentMarkMode(this);
    };

    public setHorizontalLineMode = () => {
        this.chartMarkManager?.setHorizontalLineMode(this);
    };

    public setVerticalLineMode = () => {
        this.chartMarkManager?.setVerticalLineMode(this);
    };

    public setArrowLineMarkMode = () => {
        this.chartMarkManager?.setArrowLineMarkMode(this);
    };

    public setParallelChannelMarkMode = () => {
        this.chartMarkManager?.setParallelChannelMarkMode(this);
    };

    // ================= Left Panel Callback Function End =================

    public showGraphMarkToolbar = (drawing: Drawing) => {
        if (this.state.selectedGraphDrawing && this.state.selectedGraphDrawing.id === drawing.id) {
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
            selectedGraphDrawing: drawing,
            graphMarkToolbarPosition: toolbarPosition,
            showGraphMarkToolbar: true
        });
    };

    private closeGraphMarkToolbar = () => {
        this.setState({
            showGraphMarkToolbar: false,
            selectedGraphDrawing: null
        });
    };

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

    public registerDrawingConfig(config: DrawingConfig) {
        registerDrawingConfig(config);
    }

    public unregisterDrawingConfig(type: string) {
        unregisterDrawingConfig(type);
    }

    public serializeDrawings(): string {
        return JSON.stringify(this.allDrawings);
    }

    // =============================== Text Mark Start ===============================
    public setTextMarkMode = () => {
        this.setState({
            currentMarkMode: MarkType.Text
        });
    };

    private cancelTextMarkMode = () => {
        this.setState({
            currentMarkMode: null
        });
    };

    public placeTextMark = (point: Point) => {
        const { chartSeries, chart } = this.props;
        if (!chartSeries || !chart) {
            this.cancelTextMarkMode();
            return;
        }
        try {
            const chartElement = chart.chartElement();
            if (!chartElement) {
                this.cancelTextMarkMode();
                return;
            }
            const chartRect = chartElement.getBoundingClientRect();
            const containerRect = this.containerRef.current?.getBoundingClientRect();
            if (!containerRect) {
                this.cancelTextMarkMode();
                return;
            }
            const relativeX = point.x - (containerRect.left - chartRect.left);
            const relativeY = point.y - (containerRect.top - chartRect.top) + 20;
            const timeScale = chart.timeScale();
            const time = timeScale.coordinateToTime(relativeX);
            const price = chartSeries.series.coordinateToPrice(relativeY);
            if (time === null || price === null) {
                this.cancelTextMarkMode();
                return;
            }
            const textMark = new TextMark(time.toString(), price, '');
            setTimeout(() => {
                if ((textMark as any)._startEditing) {
                    (textMark as any)._startEditing();
                }
            }, 100);
            chartSeries.series.attachPrimitive(textMark);
        } catch (error) {
        }
        this.cancelTextMarkMode();
    };

    private handleChangeTextMarkColor = (color: string) => {
        if (!this.state.selectedDrawing) return;
        this.state.selectedDrawing?.properties.originalMark.updateStyle({ color });
    };

    private handleChangeTextMarkStyle = (style: { isBold?: boolean; isItalic?: boolean }) => {
        let isBold = style.isBold;
        let isItalic = style.isItalic;
        if (!this.state.selectedDrawing) return;
        this.state.selectedDrawing?.properties.originalMark.updateStyle({ isBold, isItalic });
    };

    private handleChangeTextMarkSize = (fontSize: string) => {
        if (!this.state.selectedDrawing) return;
        this.state.selectedDrawing?.properties.originalMark.updateStyle({ fontSize });
    };

    private handleDeleteTextMark = () => {
        if (!this.state.selectedDrawing) return;
        const drawing = this.state.selectedDrawing;
        if (drawing.type === 'text' && drawing.properties?.originalMark) {
            const textMark = drawing.properties.originalMark as TextMark;
            this.props.chartSeries?.series.detachPrimitive(textMark);
            textMark.delete?.();
            textMark.destroy?.();
        }
        this.allDrawings = this.allDrawings.filter(d => d.id !== drawing.id);
        this.saveToHistory(`删除${this.getToolName(drawing.type)}`);
        this.setState({
            selectedDrawing: null,
            textMarkToolbarPosition: { x: 20, y: 20 }
        });
    };

    private handleTextMarkEditorSave = (text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => {
        if (this.state.editingTextMark) {
            this.state.editingTextMark.updateTextContent(text, color, fontSize, isBold, isItalic);
        }
        this.setState({
            isTextMarkEditorOpen: false,
            editingTextMark: null
        });
    };

    private handleTextMarkEditorCancel = () => {
        this.setState({
            isTextMarkEditorOpen: false,
            editingTextMark: null
        });
    };

    private setupTextMarkEditorEvents() {
        const handleTextMarkEditorRequest = (e: any) => {
            const { mark, position, text, color, fontSize, isBold, isItalic } = e.detail;
            const drawing: Drawing = {
                id: `textmark_${Date.now()}`,
                type: 'text',
                points: [{ x: position.x, y: position.y }],
                color: color || this.props.currentTheme.chart.lineColor,
                lineWidth: 1,
                rotation: 0,
                properties: {
                    text: text,
                    fontSize: fontSize || 14,
                    isBold: isBold || false,
                    isItalic: isItalic || false,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    originalMark: mark
                }
            };
            this.showMarkToolBar(drawing);
            this.setState({
                isTextMarkEditorOpen: true,
                editingTextMark: mark,
                textMarkEditorPosition: {
                    x: e.detail.clientX || window.innerWidth / 2,
                    y: e.detail.clientY || window.innerHeight / 2
                },
                textMarkEditorInitialData: {
                    text: text,
                    color: color,
                    fontSize: fontSize,
                    isBold: isBold,
                    isItalic: isItalic
                }
            });
            e.stopPropagation();
        };
        document.addEventListener('textMarkEditorRequest', handleTextMarkEditorRequest);
        (this as any).textMarkEditorEventHandler = handleTextMarkEditorRequest;
    }

    private setupTextMarkEvents() {
        const handleTextMarkSelected = (e: any) => {
            const { mark, position, text, color, fontSize, isBold, isItalic } = e.detail;
            const drawing: Drawing = {
                id: `textmark_${Date.now()}`,
                type: 'text',
                points: [{ x: position.x, y: position.y }],
                color: color || this.props.currentTheme.chart.lineColor,
                lineWidth: 1,
                rotation: 0,
                properties: {
                    text: text,
                    fontSize: fontSize || 14,
                    isBold: isBold || false,
                    isItalic: isItalic || false,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    originalMark: mark
                }
            };
            this.showMarkToolBar(drawing);
            (this as any).currentTextMark = mark;
            e.stopPropagation();
        };

        const handleTextMarkDeselected = (e: any) => {
            if ((this as any).currentTextMark && e.detail.mark === (this as any).currentTextMark) {
                this.closeMarkToolBar();
                (this as any).currentTextMark = null;
            } else {
            }
            e.stopPropagation();
        };

        const handleTextMarkDeleted = (e: any) => {
            const { mark } = e.detail;
            if ((this as any).currentTextMark && mark === (this as any).currentTextMark) {
                this.closeMarkToolBar();
                (this as any).currentTextMark = null;
            }
            e.stopPropagation();
        };
        document.addEventListener('textMarkSelected', handleTextMarkSelected);
        document.addEventListener('textMarkDeselected', handleTextMarkDeselected);
        document.addEventListener('textMarkDeleted', handleTextMarkDeleted);
        (this as any).textMarkEventHandlers = {
            textMarkSelected: handleTextMarkSelected,
            textMarkDeselected: handleTextMarkDeselected,
            textMarkDeleted: handleTextMarkDeleted
        };
    }
    // =============================== Text Mark End ===============================

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


    // =============================== Graph Mark Start ===============================
    private handleDeleteGraphMark = () => {
        if (!this.state.selectedGraphDrawing) return;
        const drawing = this.state.selectedGraphDrawing;
        if (drawing.properties?.originalMark) {
            const graphMark = drawing.properties.originalMark as IGraph;
            this.props.chartSeries?.series.detachPrimitive(graphMark);
        }
        this.closeGraphMarkToolbar();
    };

    private handleChangeGraphMarkColor = (color: string) => {
        if (this.chartMarkManager?.currentGraphSettingsStyle) {
            this.chartMarkManager?.currentGraphSettingsStyle.updateColor(color);
        }
    };

    private handleChangeGraphMarkStyle = (lineStyle: 'solid' | 'dashed' | 'dotted') => {
        if (this.chartMarkManager?.currentGraphSettingsStyle) {
            this.chartMarkManager?.currentGraphSettingsStyle.updateLineStyle(lineStyle);
        }
    };

    private handleChangeGraphMarkWidth = (width: number) => {
        if (this.chartMarkManager?.currentGraphSettingsStyle) {
            this.chartMarkManager?.currentGraphSettingsStyle.updateLineWidth(width);
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
                    graphMarkToolbarPosition: {
                        x: Math.max(0, prevState.graphMarkToolbarPosition.x + deltaX),
                        y: Math.max(0, prevState.graphMarkToolbarPosition.y + deltaY)
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
    // =============================== Graph Mark End ===============================

    private initializeDataPointManager(): void {
        if (this.containerRef.current && this.canvasRef.current) {
            this.dataPointManager = new DataPointManager({
                container: this.containerRef.current,
                canvas: this.canvasRef.current,
                chartData: this.props.chartData,
                getChartPriceRange: this.getChartPriceRange,
                coordinateToTime: this.coordinateToTime,
                coordinateToPrice: this.coordinateToPrice,
                chart: this.props.chart,
                chartSeries: this.props.chartSeries,
            });
        }
    }

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
        this.redrawCanvas();
    }

    private redrawCanvas() {
        const canvas = this.canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.allDrawings
            .filter(drawing => drawing.type !== 'text' && drawing.type !== 'emoji')
            .forEach(drawing => {
                CanvasRenderer.drawShape(ctx, drawing, this.drawingConfigs);
            });
        if (this.state.isDrawing && this.state.drawingPoints.length > 0) {
            CanvasRenderer.drawPreview(
                ctx,
                this.state.drawingPoints,
                this.props.activeTool,
                this.props.currentTheme.chart.lineColor + '80',
                this.drawingConfigs
            );
        }
        if (this.state.selectedDrawing &&
            this.state.selectedDrawing.type !== 'text' &&
            this.state.selectedDrawing.type !== 'emoji') {
            CanvasRenderer.drawSelection(ctx, this.state.selectedDrawing, this.drawingConfigs);
        }
    }


    public setEmojiMarkMode = (emoji: string) => {
        this.setState({
            currentMarkMode: MarkType.Emoji,
            pendingEmojiMark: emoji
        });
    };

    private cancelEmojiMarkMode = () => {
        this.setState({
            currentMarkMode: null,
            pendingEmojiMark: null
        });
    };

    public placeEmojiMark = (point: Point, emoji: string) => {
        const { chartSeries, chart } = this.props;
        if (!chartSeries || !chart) {
            this.cancelEmojiMarkMode();
            return;
        }
        try {
            const chartElement = chart.chartElement();
            if (!chartElement) {
                this.cancelEmojiMarkMode();
                return;
            }
            const chartRect = chartElement.getBoundingClientRect();
            const containerRect = this.containerRef.current?.getBoundingClientRect();
            if (!containerRect) {
                this.cancelEmojiMarkMode();
                return;
            }
            const relativeX = point.x - (containerRect.left - chartRect.left);
            const relativeY = point.y - (containerRect.top - chartRect.top) + 20;
            const timeScale = chart.timeScale();
            const time = timeScale.coordinateToTime(relativeX);
            const price = chartSeries.series.coordinateToPrice(relativeY);
            if (time === null || price === null) {
                this.cancelEmojiMarkMode();
                return;
            }
            const emojiMark = new EmojiMark(time.toString(), price, emoji);
            chartSeries.series.attachPrimitive(emojiMark);
        } catch (error) {
        }
        this.cancelEmojiMarkMode();
    };

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
        this.saveToHistory('');
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
        this.saveToHistory('');
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

    private getChartPriceRange = (): { min: number; max: number } | null => {
        const { chartData } = this.props;
        if (!chartData || chartData.length === 0) return null;
        let minPrice = Number.MAX_VALUE;
        let maxPrice = Number.MIN_VALUE;
        chartData.forEach(item => {
            if (item.high > maxPrice) maxPrice = item.high;
            if (item.low < minPrice) minPrice = item.low;
        });
        if (minPrice > maxPrice) {
            minPrice = 0;
            maxPrice = 100;
        }
        const margin = (maxPrice - minPrice) * 0.1; // 10% 边距
        return {
            min: minPrice - margin,
            max: maxPrice + margin
        };
    };

    private coordinateToPrice = (y: number): number => {
        const canvas = this.canvasRef.current;
        if (!canvas) return 100;
        const priceRange = this.getChartPriceRange();
        if (!priceRange) return 100;
        const percent = 1 - (y / canvas.height);
        return priceRange.min + (priceRange.max - priceRange.min) * percent;
    };


    private coordinateToTime = (x: number): string => {
        const canvas = this.canvasRef.current;
        const { chartData } = this.props;
        if (!canvas || !chartData || chartData.length === 0) {
            return new Date().toISOString().split('T')[0];
        }
        const timeIndex = Math.floor((x / canvas.width) * chartData.length);
        if (timeIndex >= 0 && timeIndex < chartData.length) {
            return chartData[timeIndex].time;
        }
        return chartData[chartData.length - 1]?.time || new Date().toISOString().split('T')[0];
    };

    private showMarkToolBar = (drawing: Drawing) => {
        if (this.state.selectedDrawing && this.state.selectedDrawing.id === drawing.id) {
            return;
        }
        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            toolbarPosition = {
                x: Math.max(10, point.x - 150),  // 从 -100 改为 -150，向左偏移更多
                y: Math.max(10, point.y - 80)    // 从 -50 改为 -80，向上偏移更多
            };
            const canvas = this.canvasRef.current;
            if (canvas && toolbarPosition.x + 400 > canvas.width) {
                toolbarPosition.x = Math.max(10, point.x - 400);
            }
            if (canvas && toolbarPosition.y + 100 > canvas.height) {
                toolbarPosition.y = Math.max(10, point.y - 120);
            }
        }
        this.setState({
            selectedDrawing: drawing,
            textMarkToolbarPosition: toolbarPosition,
            isFirstTimeEmojiMode: drawing.type === 'emoji' ? false : this.state.isFirstTimeEmojiMode,
            isFirstTimeTextMode: drawing.type === 'text' ? false : this.state.isFirstTimeTextMode,
            isDragging: false,
            dragStartPoint: null
        }, () => {
        });
        if (this.props.onToolSelect) {
            this.props.onToolSelect(drawing.type);
        }
    };

    private closeMarkToolBar() {
        this.setState({ selectedDrawing: null });
    }

    public saveToHistory(description: string) {
        this.historyManager.saveState(this.allDrawings, description);
        this.setState({
            history: this.historyManager.getHistory(),
            historyIndex: this.historyManager.getHistoryIndex()
        });
    }

    private undo = () => {
        const drawings = this.historyManager.undo();
        if (drawings) {
            this.allDrawings = drawings;
            this.setState({
                historyIndex: this.historyManager.getHistoryIndex(),
                selectedDrawing: null
            });
            this.redrawCanvas();
        }
    };

    private redo = () => {
        const drawings = this.historyManager.redo();
        if (drawings) {
            this.allDrawings = drawings;
            this.setState({
                historyIndex: this.historyManager.getHistoryIndex(),
                selectedDrawing: null
            });
            this.redrawCanvas();
        }
    };

    private handleToolbarDrag = (startPoint: Point) => {
        this.setState({
            isTextMarkToolbar: true,
            dragStartPoint: startPoint
        });
        const handleMouseMove = (event: MouseEvent) => {
            if (this.state.isTextMarkToolbar && this.state.dragStartPoint) {
                const deltaX = event.clientX - this.state.dragStartPoint.x;
                const deltaY = event.clientY - this.state.dragStartPoint.y;

                this.setState(prevState => ({
                    textMarkToolbarPosition: {
                        x: Math.max(0, prevState.textMarkToolbarPosition.x + deltaX),
                        y: Math.max(0, prevState.textMarkToolbarPosition.y + deltaY)
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
        const config = this.drawingConfigs.get(toolId);
        return config ? config.name : toolId;
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

    private renderEyeIcon = (isVisible: boolean) => {
        const { currentTheme } = this.props;
        if (isVisible) {
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={currentTheme.layout.textColor}
                    strokeWidth="2"
                >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
        } else {
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={currentTheme.layout.textColor}
                    strokeWidth="2"
                >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
            );
        }
    };

    // chart info
    private renderChartInfo = () => {
        const { currentTheme, title } = this.props;
        const { currentOHLC, mousePosition } = this.state;
        return (
            <div
                style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    padding: '4px 8px',
                    zIndex: 20,
                    fontSize: '11px',
                    fontFamily: 'Arial, sans-serif',
                    color: currentTheme.layout.textColor,
                    pointerEvents: 'none',
                    lineHeight: '1.1',
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'nowrap',
                    whiteSpace: 'nowrap'
                }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{title || 'Chart'}</span>
                    <span
                        style={{
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            opacity: this.state.showOHLC ? 1 : 0.5,
                            marginLeft: '0px',
                            marginRight: '0px',
                            userSelect: 'none',
                            transition: 'all 0.2s',
                            padding: '2px',
                            borderRadius: '3px',
                        }}
                        onClick={this.toggleOHLCVisibility}
                        title={this.state.showOHLC ? '隐藏 OHLC' : '显示 OHLC'}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                            e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.opacity = this.state.showOHLC ? '1' : '0.5';
                        }}
                    >
                        {this.renderEyeIcon(this.state.showOHLC)}
                    </span>
                    {currentOHLC && mousePosition && this.state.showOHLC ? (
                        <>
                            <span style={{ fontSize: '12px' }}>O:{currentOHLC.open.toFixed(2)}</span>
                            <span style={{ fontSize: '12px' }}>H:{currentOHLC.high.toFixed(2)}</span>
                            <span style={{ fontSize: '12px' }}>L:{currentOHLC.low.toFixed(2)}</span>
                            <span style={{
                                fontSize: '12px',
                                color: currentOHLC.close >= currentOHLC.open
                                    ? currentTheme.chart.upColor
                                    : currentTheme.chart.downColor
                            }}>
                                C:{currentOHLC.close.toFixed(2)}
                            </span>
                            <span style={{ opacity: 0.7, fontSize: '12px' }}>
                                {currentOHLC.time}
                            </span>
                        </>
                    ) : (
                        <span style={{ opacity: 0.7, fontStyle: 'italic' }}>
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // chart volume
    private renderChartVolume = () => {
        const { currentTheme } = this.props;
        return (
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: 'calc(100% - 60px)',
                height: '60px',
                zIndex: 1,
                background: 'transparent',
                pointerEvents: 'none'
            }}>
                <MainChartVolume
                    theme={currentTheme}
                    data={this.props.chartData}
                    height={60}
                    width="100%"
                    chart={this.props.chart}
                />
            </div>
        );
    };

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

    render() {
        const { activeTool, currentTheme } = this.props;
        const {
            selectedDrawing,
            textMarkToolbarPosition,
            isTextMarkToolbar,
            showGraphMarkToolbar,
            graphMarkToolbarPosition,
            selectedGraphDrawing,
        } = this.state;

        const canUndo = this.historyManager.canUndo();
        const canRedo = this.historyManager.canRedo();
        const hasIndicators = this.props.activeIndicators && this.props.activeIndicators.length > 0;
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
                        zIndex: 5,
                        pointerEvents: activeTool ? 'auto' : 'none',
                        opacity: 1,
                        display: 'block',
                        // overflow: 'hidden'
                    }}
                >
                    {/* information layer */}
                    <div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            minHeight: '300px'
                        }}
                    >
                        {this.renderChartInfo()}
                        {this.renderChartVolume()}
                    </div>
                    {/* Main chart layer */}
                    <div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            minHeight: '300px'
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
                            />
                        )}

                        {this.state.isImageUploadModalOpen && (
                            <ImageUploadModal
                                isOpen={this.state.isImageUploadModalOpen}
                                onClose={this.handleImageUploadClose}
                                onConfirm={this.handleImageConfirm}
                                theme={currentTheme}
                            />
                        )}

                        {selectedDrawing && (
                            <TextMarkToolbar
                                position={textMarkToolbarPosition}
                                selectedDrawing={selectedDrawing}
                                theme={currentTheme}
                                onClose={() => this.setState({ selectedDrawing: null, activePanel: null })}
                                onDelete={this.handleDeleteTextMark}
                                onUndo={this.undo}
                                onRedo={this.redo}
                                onChangeColor={this.handleChangeTextMarkColor}
                                onChangeStyle={this.handleChangeTextMarkStyle}
                                onChangeSize={this.handleChangeTextMarkSize}
                                canUndo={canUndo}
                                canRedo={canRedo}
                                onDragStart={this.handleToolbarDrag}
                                isDragging={isTextMarkToolbar}
                                getToolName={this.getToolName}
                            />
                        )}

                        {showGraphMarkToolbar && selectedGraphDrawing && (
                            <GraphMarkToolbar
                                position={graphMarkToolbarPosition}
                                selectedDrawing={selectedGraphDrawing}
                                theme={currentTheme}
                                onClose={this.closeGraphMarkToolbar}
                                onDelete={this.handleDeleteGraphMark}
                                onUndo={this.undo}
                                onRedo={this.redo}
                                onChangeColor={this.handleChangeGraphMarkColor}
                                onChangeStyle={this.handleChangeGraphMarkStyle}
                                onChangeWidth={this.handleChangeGraphMarkWidth}
                                canUndo={canUndo}
                                canRedo={canRedo}
                                onDragStart={this.handleGraphToolbarDrag}
                                isDragging={false}
                                getToolName={this.getToolName}
                            />
                        )}

                    </div>
                </div>
                {hasIndicators && (
                    <TechnicalIndicatorsPanel
                        currentTheme={currentTheme}
                        chartData={this.props.chartData}
                        activeIndicators={this.props.activeIndicators}
                        height={this.props.indicatorsHeight}
                    />
                )}
            </div>
        );
    }
}

export { ChartLayer };
export type { Drawing };