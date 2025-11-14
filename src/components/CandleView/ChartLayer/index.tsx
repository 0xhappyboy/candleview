import React from 'react';
import { ThemeConfig } from '../CandleViewTheme';
import { TechnicalIndicatorsPanel } from '../Indicators/TechnicalIndicatorsPanel';
import { MainChartVolume } from '../Indicators/main/MainChartVolume';
import { OverlayManager } from './OverlayManager';
import { DataPointManager } from './DataPointManager';
import { ChartSeries } from './ChartTypeManager';
import { ChartEventManager } from './ChartEventManager';
import { HistoryRecord, MarkDrawing, MarkType, Point } from '../types';
import { MultiBottomArrowMark } from '../Mark/Static/MultiBottomArrowMark';
import { BottomArrowMark } from '../Mark/Static/BottomArrowMark';
import { TopArrowMark } from '../Mark/Static/TopArrowMark';
import { TextMarkEditorModal } from './TextMarkEditorModal';
import { MultiTopArrowMark } from '../Mark/Static/MultiTopArrowMark';
import { LineSegmentMark } from '../Mark/Line/LineSegmentMark';
import { IGraph } from '../Mark/IGraph';
import { IMarkStyle } from '../Mark/IMarkStyle';
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
import { PinMark } from '../Mark/Text/PinMark';
import { BubbleBoxMark } from '../Mark/Text/BubbleBoxMark';
import { ChartMarkTextEditManager } from './ChartMarkTextEditManager';
import { TextEditMark } from '../Mark/Text/TextEditMark';
import { TextMarkToolBar } from './TextMarkToolBar';
import { GraphMarkToolBar } from './GraphMarkToolBar';
import { TableMarkToolBar } from './TableMarkToolBar';

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
    showGraphMarkToolBar: boolean;
    // show table mark tool
    showTableMarkToolBar: boolean;
    // show text mark tool
    showTextMarkToolBar: boolean;
    isGraphMarkToolbarDragging: boolean,
    // toolbar
    markToolBarPosition: Point;
    // ============== select mark ================
    selectedTextMark: MarkDrawing | null;
    selectedTableMark: MarkDrawing | null;
    selectedGraphMark: MarkDrawing | null;
    // ============== graph manager ===============
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
    // emoji
    isEmojiMarkMode?: boolean;
    emojiMarkStartPoint?: Point | null;
    currentEmojiMark?: any | null;
    isEmojiDragging?: boolean;
    emojiDragTarget?: any | null;
    emojiDragPoint?: 'start' | 'end' | 'line' | null;
    // pin
    isPinMarkMode: boolean;
    pinMarkPoint: Point | null;
    currentPinMark: PinMark | null;
    isPinDragging: boolean;
    pinDragTarget: PinMark | null;
    // bubble box
    isBubbleBoxMarkMode: boolean;
    bubbleBoxMarkPoints: Point[] | null;
    currentBubbleBoxMark: BubbleBoxMark | null;
    isBubbleBoxDragging: boolean;
    bubbleBoxDragTarget: BubbleBoxMark | null;
    bubbleBoxDragType: 'controlPoint' | 'bubble' | 'connection' | null;
    // text edit 
    isTextEditMarkMode: boolean,
    isTextEditDragging: boolean,
    textEditDragTarget: TextEditMark | null,
}

class ChartLayer extends React.Component<ChartLayerProps, ChartLayerState> {
    public canvasRef = React.createRef<HTMLCanvasElement>();
    public containerRef = React.createRef<HTMLDivElement>();
    public allDrawings: MarkDrawing[] = [];
    private readonly MAX_HISTORY_SIZE = 50;
    private doubleClickTimeout: NodeJS.Timeout | null = null;
    private overlayManager: OverlayManager | null = null;
    private dataPointManager: DataPointManager | null = null;
    private previewLineSegmentMark: LineSegmentMark | null = null;
    private chartEventManager: ChartEventManager | null = null;
    private originalChartOptions: any = null;
    // current mark setting style
    public currentMarkSettingsStyle: IMarkStyle | null = null;
    // chart mark manager
    public chartMarkManager: ChartMarkManager | null = null;
    // chart mark text edit manager
    public chartMarkTextEditManager: ChartMarkTextEditManager | null = null;

    constructor(props: ChartLayerProps) {
        super(props);
        this.state = {
            isDrawing: false,
            drawingPoints: [],
            currentDrawing: null,
            drawingStartPoint: null,
            drawings: [],

            selectedTextMark: null,
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
        };
        this.chartEventManager = new ChartEventManager();
        this.chartMarkManager = new ChartMarkManager();
        this.chartMarkTextEditManager = new ChartMarkTextEditManager();
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
        // this.setupTextMarkEvents();
        // 添加文字标记编辑器模态框事件监听
        // this.setupTextMarkEditorEvents();
        // 添加气泡框事件监听
        this.chartMarkTextEditManager?.setupBubbleBoxMarkEvents(this);
        // 添加路标事件监听
        this.chartMarkTextEditManager?.setupSignPostMarkEvents(this);
        // 添加pin事件监听
        this.chartMarkTextEditManager?.setupPinMarkEvents(this);
        // 添加文本编辑标记的事件监听
        this.chartMarkTextEditManager?.setupTextEditMarkEvents(this);
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
        this.chartMarkTextEditManager?.cleanupBubbleBoxMarkEvents();
        this.chartMarkTextEditManager?.cleanupSignPostMarkEvents();
        this.chartMarkTextEditManager?.cleanupPinMarkEvents();
        this.chartMarkTextEditManager?.cleanupTextEditMarkEvents();
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

    public setTextEditMarkMode = () => {
        this.chartMarkManager?.setTextEditMarkMode(this);
    };

    public setBubbleBoxMarkMode = () => {
        this.chartMarkManager?.setBubbleBoxMarkMode(this);
    };

    public setPinMarkMode = () => {
        this.chartMarkManager?.setPinMarkMode(this);
    };

    public setEmojiMarkMode = (emoji: string) => {
        this.chartMarkManager?.setEmojiMarkMode(this, emoji);
    };

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

    private closeGraphMarkToolBar = () => {
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

    private closeTableMarkToolBar = () => {
        this.setState({
            showTableMarkToolBar: false,
        });
    };

    // show text mark tool
    public showTextMarkToolBar = (drawing: MarkDrawing) => {
        if (this.state.selectedTextMark && this.state.selectedTextMark.id === drawing.id) {
            return;
        }
        if (this.state.selectedTextMark) {
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
            selectedTextMark: drawing,
            markToolBarPosition: toolbarPosition,
            showTextMarkToolBar: true
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
        if (!this.state.selectedTextMark) return;
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'color': color });
        }
    };

    private handleChangeTextMarkStyle = (style: { isBold?: boolean; isItalic?: boolean }) => {
        let isBold = style.isBold;
        let isItalic = style.isItalic;
        if (!this.state.selectedTextMark) return;
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'isBold': isBold, 'isItalic': isItalic });
        }
    };

    private handleChangeTextMarkFontSize = (fontSize: number) => {
        if (!this.state.selectedTextMark) return;
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'fontSize': fontSize });
        }
    };

    private handleDeleteTextMark = () => {
        if (!this.state.selectedTextMark) return;
        const textMark = this.state.selectedTextMark;
        const markType = textMark.markType;
        if (MarkType.TextEdit === markType) {
            this.chartMarkManager?.textEditMarkManager?.removeTextEditMark(textMark.mark as TextEditMark);
        }
        if (MarkType.BubbleBox === markType) {
            this.chartMarkManager?.bubbleBoxMarkManager?.removeBubbleBoxMark(textMark.mark as BubbleBoxMark);
        }
        if (MarkType.SignPost === markType) {
            this.chartMarkManager?.signpostMarkManager?.removeSignPostMark(textMark.mark as SignPostMark);
        }
        if (MarkType.Pin === markType) {
            this.chartMarkManager?.pinMarkManager?.removePinMark(textMark.mark as PinMark);
        }
        this.setState({
            selectedTextMark: null,
            markToolBarPosition: { x: 20, y: 20 }
        });
    };

    private handleTextMarkEditorSave = (text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => {
        this.setState({
            isTextMarkEditorOpen: false,
        });
    };

    private handleTextMarkEditorCancel = () => {
        this.setState({
            isTextMarkEditorOpen: false,
        });
    };
    // =============================== Text Tool Bar Edit Callback End ===============================

    // =============================== Table Tool Bar Edit Callback Start ===============================
    private handleChangeTableMarkColor = (color: string) => {
        if (!this.state.selectedTextMark) return;
        this.state.selectedTextMark?.properties.originalMark.updateStyle({ color });
    };

    private handleChangeTableMarkStyle = (style: 'solid' | 'dashed' | 'dotted') => {
        if (!this.state.selectedTextMark) return;
    };

    private handleChangeTableMarkSize = (fontSize: string) => {
        if (!this.state.selectedTextMark) return;
        this.state.selectedTextMark?.properties.originalMark.updateStyle({ fontSize });
    };

    private handleDeleteTableMark = () => {
        if (!this.state.selectedTextMark) return;
        const drawing = this.state.selectedTextMark;
        this.allDrawings = this.allDrawings.filter(d => d.id !== drawing.id);
        this.setState({
            selectedTextMark: null,
            markToolBarPosition: { x: 20, y: 20 }
        });
    };

    private handleTableMarkEditorSave = (text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => {
        this.setState({
            isTextMarkEditorOpen: false,
        });
    };

    private handleTableMarkEditorCancel = () => {
        this.setState({
            isTextMarkEditorOpen: false,
        });
    };
    private handleTableMarkToolbarDrag = (startPoint: Point) => {
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
    // =============================== Tabel Tool Bar Edit Callback End ===============================

    // =============================== Graph Mark Tool Bar Start ===============================
    private handleDeleteGraphMark = () => {
        if (!this.state.selectedGraphMark) return;
        const drawing = this.state.selectedGraphMark;
        if (drawing.properties?.originalMark) {
            const graphMark = drawing.properties.originalMark as IGraph;
            this.props.chartSeries?.series.detachPrimitive(graphMark);
        }
        this.closeGraphMarkToolBar();
    };

    private handleChangeGraphMarkColor = (color: string) => {
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'color': color });
        }
    };

    private handleChangeGraphMarkStyle = (lineStyle: 'solid' | 'dashed' | 'dotted') => {
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'lineStyle': lineStyle });
        }
    };

    private handleChangeGraphMarkWidth = (width: number) => {
        if (this.currentMarkSettingsStyle) {
            this.currentMarkSettingsStyle.updateStyles({ 'lineWidht': width });
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
            isTextMarkToolbar,
            showGraphMarkToolBar,
            showTableMarkToolBar,
            markToolBarPosition,
            showTextMarkToolBar,
            selectedTextMark,
            selectedTableMark,
            selectedGraphMark
        } = this.state;

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

                        {showTextMarkToolBar && (
                            <TextMarkToolBar
                                position={markToolBarPosition}
                                selectedDrawing={selectedTextMark}
                                theme={currentTheme}
                                onClose={this.closeTextMarkToolBar}
                                onDelete={this.handleDeleteTextMark}
                                onChangeColor={this.handleChangeTextMarkFontColor}
                                onChangeStyle={this.handleChangeTextMarkStyle}
                                onChangeSize={this.handleChangeTextMarkFontSize}
                                onDragStart={this.handleTextMarkToolBarDrag}
                                isDragging={isTextMarkToolbar}
                                getToolName={this.getToolName}
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
                            />
                        )}

                        {showTableMarkToolBar && (
                            <TableMarkToolBar
                                position={markToolBarPosition}
                                selectedDrawing={selectedTableMark}
                                theme={currentTheme}
                                onClose={this.closeTableMarkToolBar}
                                onDelete={this.handleDeleteTableMark}
                                onChangeColor={this.handleChangeTableMarkColor}
                                onChangeStyle={this.handleChangeTableMarkStyle}
                                onDragStart={this.handleTableMarkToolbarDrag}
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
export type { MarkDrawing };