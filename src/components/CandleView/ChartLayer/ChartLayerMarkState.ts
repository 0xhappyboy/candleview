import { ArrowLineMark } from "../Mark/Arrow/ArrowLineMark";
import { ThickArrowLineMark } from "../Mark/Arrow/ThickArrowLineMark";
import { DisjointChannelMark } from "../Mark/Channel/DisjointChannelMark";
import { EquidistantChannelMark } from "../Mark/Channel/EquidistantChannelMark";
import { LinearRegressionChannelMark } from "../Mark/Channel/LinearRegressionChannelMark";
import { ParallelChannelMark } from "../Mark/Channel/ParallelChannelMark";
import { ImageMark } from "../Mark/Content/ImageMark";
import { TableMark } from "../Mark/Content/TableMark";
import { FibonacciArcMark } from "../Mark/Fibonacci/FibonacciArcMark";
import { FibonacciChannelMark } from "../Mark/Fibonacci/FibonacciChannelMark";
import { FibonacciCircleMark } from "../Mark/Fibonacci/FibonacciCircleMark";
import { FibonacciExtensionBasePriceMark } from "../Mark/Fibonacci/FibonacciExtensionBasePriceMark";
import { FibonacciExtensionBaseTimeMark } from "../Mark/Fibonacci/FibonacciExtensionBaseTimeMark";
import { FibonacciFanMark } from "../Mark/Fibonacci/FibonacciFanMark";
import { FibonacciRetracementMark } from "../Mark/Fibonacci/FibonacciRetracementMark";
import { FibonacciSpiralMark } from "../Mark/Fibonacci/FibonacciSpiralMark";
import { FibonacciTimeZoonMark } from "../Mark/Fibonacci/FibonacciTimeZoonMark";
import { FibonacciWedgeMark } from "../Mark/Fibonacci/FibonacciWedgeMark";
import { AndrewPitchforkMark } from "../Mark/Fork/AndrewPitchforkMark";
import { EnhancedAndrewPitchforkMark } from "../Mark/Fork/EnhancedAndrewPitchforkMark";
import { GannBoxMark } from "../Mark/Gann/GannBoxMark";
import { GannFanMark } from "../Mark/Gann/GannFanMark";
import { GannRectangleMark } from "../Mark/Gann/GannRectangleMark";
import { LineSegmentMark } from "../Mark/Line/LineSegmentMark";
import { ABCDMark } from "../Mark/Pattern/ABCDMark";
import { ElliottCorrectiveMark } from "../Mark/Pattern/ElliottCorrectiveMark";
import { ElliottDoubleCombinationMark } from "../Mark/Pattern/ElliottDoubleCombinationMark";
import { ElliottImpulseMark } from "../Mark/Pattern/ElliottImpulseMark";
import { ElliottTriangleMark } from "../Mark/Pattern/ElliottTriangleMark";
import { ElliottTripleCombinationMark } from "../Mark/Pattern/ElliottTripleCombinationMark";
import { HeadAndShouldersMark } from "../Mark/Pattern/HeadAndShouldersMark";
import { TriangleABCDMark } from "../Mark/Pattern/TriangleABCDMark";
import { XABCDMark } from "../Mark/Pattern/XABCDMark";
import { BrushMark } from "../Mark/Pen/BrushMark";
import { MarkerPenMark } from "../Mark/Pen/MarkerPenMark";
import { PencilMark } from "../Mark/Pen/PencilMark";
import { PenMark } from "../Mark/Pen/PenMark";
import { PriceRangeMark } from "../Mark/Range/PriceRangeMark";
import { TimePriceRangeMark } from "../Mark/Range/TimePriceRangeMark";
import { TimeRangeMark } from "../Mark/Range/TimeRangeMark";
import { CircleMark } from "../Mark/Shape/CircleMark";
import { CurveMark } from "../Mark/Shape/CurveMark";
import { DoubleCurveMark } from "../Mark/Shape/DoubleCurveMark";
import { EllipseMark } from "../Mark/Shape/EllipseMark";
import { RectangleMark } from "../Mark/Shape/RectangleMark.ts";
import { SectorMark } from "../Mark/Shape/SectorMark";
import { TriangleMark } from "../Mark/Shape/TriangleMark";
import { BubbleBoxMark } from "../Mark/Text/BubbleBoxMark";
import { PinMark } from "../Mark/Text/PinMark";
import { SignPostMark } from "../Mark/Text/SignPostMark";
import { TextEditMark } from "../Mark/Text/TextEditMark";
import { MarkType, MarkDrawing, Point } from "../types";

export interface ChartMarkState {
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