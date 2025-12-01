import { ChartLayer } from ".";
import { IDeletableMark } from "../Mark/IDeletableMark";
import { ABCDMarkManager } from "../MarkManager/Pattern/ABCDMarkManager";
import { AndrewPitchforkMarkManager } from "../MarkManager/Fork/AndrewPitchforkMarkManager";
import { CircleMarkManager } from "../MarkManager/Shape/CircleMarkManager";
import { ImageMarkManager } from "../MarkManager/Content/ImageMarkManager";
import { TableMarkManager } from "../MarkManager/Content/TableMarkManager";
import { CurveMarkManager } from "../MarkManager/Shape/CurveMarkManager";
import { DisjointChannelMarkManager } from "../MarkManager/Channel/DisjointChannelMarkManager";
import { DoubleCurveMarkManager } from "../MarkManager/Shape/DoubleCurveMarkManager";
import { ElliottCorrectiveMarkManager } from "../MarkManager/Elliott/ElliottCorrectiveMarkManager";
import { ElliottDoubleCombinationMarkManager } from "../MarkManager/Elliott/ElliottDoubleCombinationMarkManager";
import { ElliottImpulseMarkManager } from "../MarkManager/Elliott/ElliottImpulseMarkManager";
import { ElliottTriangleMarkManager } from "../MarkManager/Elliott/ElliottTriangleMarkManager";
import { ElliottTripleCombinationMarkManager } from "../MarkManager/Elliott/ElliottTripleCombinationMarkManager";
import { EllipseMarkManager } from "../MarkManager/Shape/EllipseMarkManager";
import { EnhancedAndrewPitchforkMarkManager } from "../MarkManager/Fork/EnhancedAndrewPitchforkMarkManager";
import { EquidistantChannelMarkManager } from "../MarkManager/Channel/EquidistantChannelMarkManager";
import { FibonacciArcMarkManager } from "../MarkManager/Fibonacci/FibonacciArcMarkManager";
import { FibonacciChannelMarkManager } from "../MarkManager/Fibonacci/FibonacciChannelMarkManager";
import { FibonacciCircleMarkManager } from "../MarkManager/Fibonacci/FibonacciCircleMarkManager";
import { FibonacciExtensionBasePriceMarkManager } from "../MarkManager/Fibonacci/FibonacciExtensionBasePriceMarkManager";
import { FibonacciExtensionBaseTimeMarkManager } from "../MarkManager/Fibonacci/FibonacciExtensionBaseTimeMarkManager";
import { FibonacciFanMarkManager } from "../MarkManager/Fibonacci/FibonacciFanMarkManager";
import { FibonacciRetracementMarkManager } from "../MarkManager/Fibonacci/FibonacciRetracementMarkManager";
import { FibonacciSpiralMarkManager } from "../MarkManager/Fibonacci/FibonacciSpiralMarkManager";
import { FibonacciTimeZoonMarkManager } from "../MarkManager/Fibonacci/FibonacciTimeZoonMarkManager";
import { FibonacciWedgeMarkManager } from "../MarkManager/Fibonacci/FibonacciWedgeMarkManager";
import { GannBoxMarkManager } from "../MarkManager/Gann/GannBoxMarkManager";
import { GannFanMarkManager } from "../MarkManager/Gann/GannFanMarkManager";
import { GannRectangleMarkManager } from "../MarkManager/Gann/GannRectangleManager";
import { HeadAndShouldersMarkManager } from "../MarkManager/Pattern/HeadAndShouldersMarkManager";
import { LinearRegressionChannelMarkManager } from "../MarkManager/Channel/LinearRegressionChannelMarkManager";
import { ParallelChannelMarkManager } from "../MarkManager/Channel/ParallelChannelMarkManager";
import { BrushMarkManager } from "../MarkManager/Pen/BrushMarkManager";
import { EraserMarkManager } from "../MarkManager/Pen/EraserMarkManager";
import { MarkerPenMarkManager } from "../MarkManager/Pen/MarkerPenMarkManager";
import { PencilMarkManager } from "../MarkManager/Pen/PencilMarkManager";
import { PenMarkManager } from "../MarkManager/Pen/PenMarkManager";
import { PriceRangeMarkManager } from "../MarkManager/Range/PriceRangeMarkManager";
import { LongPositionMarkManager } from "../MarkManager/Range/LongPositionMarkManager";
import { RectangleMarkManager } from "../MarkManager/Shape/RectangleMarkManager";
import { SectorMarkManager } from "../MarkManager/Shape/SectorMarkManager";
import { ThickArrowLineMarkManager } from "../MarkManager/Line/ThickArrowLineMarkManager";
import { TimePriceRangeMarkManager } from "../MarkManager/Range/TimePriceRangeMarkManager";
import { TimeRangeMarkManager } from "../MarkManager/Range/TimeRangeMarkManager";
import { TriangleABCDMarkManager } from "../MarkManager/Pattern/TriangleABCDMarkManager";
import { TriangleMarkManager } from "../MarkManager/Shape/TriangleMarkManager";
import { XABCDMarkManager } from "../MarkManager/Pattern/XABCDMarkManager";
import { MarkType } from "../types";
import { ShortPositionMarkManager } from "../MarkManager/Range/ShortPositionMarkManager";
import { PriceLabelMarkManager } from "../MarkManager/Text/PriceLabelMarkManager";
import { FlagMarkManager } from "../MarkManager/Text/FlagMarkManager";
import { PriceNoteMarkManager } from "../MarkManager/Text/PriceNoteMarkManager";
import { SignPostMarkManager } from "../MarkManager/Text/SignPostMarkManager";
import { EmojiMarkManager } from "../MarkManager/Text/EmojiMarkManager";
import { PinMarkManager } from "../MarkManager/Text/PinMarkManager";
import { BubbleBoxMarkManager } from "../MarkManager/Text/BubbleBoxMarkManager";
import { TextEditMarkManager } from "../MarkManager/Text/TextEditMarkManager";
import { ArrowLineMarkManager } from "../MarkManager/Line/ArrowLineMarkManager";
import { AxisLineMarkManager } from "../MarkManager/Line/AxisLineMarkManager";
import { LineSegmentMarkManager } from "../MarkManager/Line/LineSegmentMarkManager";
import { MockKLineMarkManager } from "../MarkManager/Mock/MockKLineMarkManager";
import { HeatMapMarkManager } from "../MarkManager/Map/HeatMapMarkManager";
import { SchiffPitchforkMarkManager } from "../MarkManager/Fork/SchiffPitchforkMarkManager";
import { IGraph } from "../Mark/IGraph";
import { LineSegmentMark } from "../Mark/Line/LineSegmentMark";
import { ArrowLineMark } from "../Mark/Arrow/ArrowLineMark";
import { ThickArrowLineMark } from "../Mark/Arrow/ThickArrowLineMark";
import { HorizontalLineMark } from "../Mark/Line/HorizontalLineMark";
import { VerticalLineMark } from "../Mark/Line/VerticalLineMark";
import { ParallelChannelMark } from "../Mark/Channel/ParallelChannelMark";
import { LinearRegressionChannelMark } from "../Mark/Channel/LinearRegressionChannelMark";
import { EquidistantChannelMark } from "../Mark/Channel/EquidistantChannelMark";
import { DisjointChannelMark } from "../Mark/Channel/DisjointChannelMark";
import { AndrewPitchforkMark } from "../Mark/Fork/AndrewPitchforkMark";
import { EnhancedAndrewPitchforkMark } from "../Mark/Fork/EnhancedAndrewPitchforkMark";
import { SchiffPitchforkMark } from "../Mark/Fork/SchiffPitchforkMark";
import { CircleMark } from "../Mark/Shape/CircleMark";
import { RectangleMark } from "../Mark/Shape/RectangleMark.ts";
import { EllipseMark } from "../Mark/Shape/EllipseMark";
import { SectorMark } from "../Mark/Shape/SectorMark";
import { TriangleMark } from "../Mark/Shape/TriangleMark";
import { GannBoxMark } from "../Mark/Gann/GannBoxMark";
import { GannFanMark } from "../Mark/Gann/GannFanMark";
import { GannRectangleMark } from "../Mark/Gann/GannRectangleMark";
import { FibonacciRetracementMark } from "../Mark/Fibonacci/FibonacciRetracementMark";
import { FibonacciArcMark } from "../Mark/Fibonacci/FibonacciArcMark";
import { FibonacciCircleMark } from "../Mark/Fibonacci/FibonacciCircleMark";
import { FibonacciSpiralMark } from "../Mark/Fibonacci/FibonacciSpiralMark";
import { FibonacciTimeZoonMark } from "../Mark/Fibonacci/FibonacciTimeZoonMark";
import { MockKLineMark } from "../Mark/Mock/MockKLineMark";
import { PriceNoteMark } from "../Mark/Text/PriceNoteMark";
import { ShortPositionMark } from "../Mark/Range/ShortPositionMark";
import { LongPositionMark } from "../Mark/Range/LongPositionMark";
import { ImageMark } from "../Mark/Content/ImageMark";
import { TableMark } from "../Mark/Content/TableMark";
import { BubbleBoxMark } from "../Mark/Text/BubbleBoxMark";
import { EmojiMark } from "../Mark/Text/EmojiMark";
import { FlagMark } from "../Mark/Text/FlagMark";
import { PinMark } from "../Mark/Text/PinMark";
import { PriceLabelMark } from "../Mark/Text/PriceLabelMark";
import { SignPostMark } from "../Mark/Text/SignPostMark";
import { TextEditMark } from "../Mark/Text/TextEditMark";
import { ElliottImpulseMark } from "../Mark/Pattern/ElliottImpulseMark";
import { ElliottCorrectiveMark } from "../Mark/Pattern/ElliottCorrectiveMark";
import { ABCDMark } from "../Mark/Pattern/ABCDMark";
import { ElliottTriangleMark } from "../Mark/Pattern/ElliottTriangleMark";
import { FibonacciChannelMark } from "../Mark/Fibonacci/FibonacciChannelMark";
import { FibonacciExtensionBasePriceMark } from "../Mark/Fibonacci/FibonacciExtensionBasePriceMark";
import { FibonacciExtensionBaseTimeMark } from "../Mark/Fibonacci/FibonacciExtensionBaseTimeMark";
import { FibonacciFanMark } from "../Mark/Fibonacci/FibonacciFanMark";
import { FibonacciWedgeMark } from "../Mark/Fibonacci/FibonacciWedgeMark";
import { HeadAndShouldersMark } from "../Mark/Pattern/HeadAndShouldersMark";
import { XABCDMark } from "../Mark/Pattern/XABCDMark";
import { CurveMark } from "../Mark/Shape/CurveMark";
import { DoubleCurveMark } from "../Mark/Shape/DoubleCurveMark";
import { TriangleABCDMark } from "../Mark/Pattern/TriangleABCDMark";
import { ElliottTripleCombinationMark } from "../Mark/Pattern/ElliottTripleCombinationMark";
import { PriceRange } from "lightweight-charts";
import { TimePriceRangeMark } from "../Mark/Range/TimePriceRangeMark";
import { ElliottDoubleCombinationMark } from "../Mark/Pattern/ElliottDoubleCombinationMark";
import { TimeRangeMark } from "../Mark/Range/TimeRangeMark";
import { PriceRangeMark } from "../Mark/Range/PriceRangeMark";
import { PencilMark } from "../Mark/Pen/PencilMark";
import { PenMark } from "../Mark/Pen/PenMark";
import { BrushMark } from "../Mark/Pen/BrushMark";
import { MarkerPenMark } from "../Mark/Pen/MarkerPenMark";

export class ChartMarkManager {
    public lineSegmentMarkManager: LineSegmentMarkManager | null = null;
    public axisLineMarkManager: AxisLineMarkManager | null = null;
    public arrowLineMarkManager: ArrowLineMarkManager | null = null;
    public parallelChannelMarkManager: ParallelChannelMarkManager | null = null;
    public currentOperationMarkType: MarkType | null = null;
    public linearRegressionChannelMarkManager: LinearRegressionChannelMarkManager | null = null;
    public equidistantChannelMarkManager: EquidistantChannelMarkManager | null = null;
    public disjointChannelMarkManager: DisjointChannelMarkManager | null = null;
    public andrewPitchforkMarkManager: AndrewPitchforkMarkManager | null = null;
    public enhancedAndrewPitchforkMarkManager: EnhancedAndrewPitchforkMarkManager | null = null;
    public rectangleMarkManager: RectangleMarkManager | null = null;
    public circleMarkManager: CircleMarkManager | null = null;
    public ellipseMarkManager: EllipseMarkManager | null = null;
    public triangleMarkManager: TriangleMarkManager | null = null;
    public gannFanMarkManager: GannFanMarkManager | null = null;
    public gannBoxMarkManager: GannBoxMarkManager | null = null;
    public gannRectangleMarkManager: GannRectangleMarkManager | null = null;
    public fibonacciTimeZoonMarkManager: FibonacciTimeZoonMarkManager | null = null;
    public fibonacciRetracementMarkManager: FibonacciRetracementMarkManager | null = null;
    public fibonacciArcMarkManager: FibonacciArcMarkManager | null = null;
    public fibonacciCircleMarkManager: FibonacciCircleMarkManager | null = null;
    public fibonacciSpiralMarkManager: FibonacciSpiralMarkManager | null = null;
    public fibonacciWedgeMarkManager: FibonacciWedgeMarkManager | null = null;
    public fibonacciFanMarkManager: FibonacciFanMarkManager | null = null;
    public fibonacciChannelMarkManager: FibonacciChannelMarkManager | null = null;
    public fibonacciExtensionBasePriceMarkManager: FibonacciExtensionBasePriceMarkManager | null = null;
    public fibonacciExtensionBaseTimeMarkManager: FibonacciExtensionBaseTimeMarkManager | null = null;
    public sectorMarkManager: SectorMarkManager | null = null;
    public curveMarkManager: CurveMarkManager | null = null;
    public doubleCurveMarkManager: DoubleCurveMarkManager | null = null;
    public xabcdMarkManager: XABCDMarkManager | null = null;
    public headAndShouldersMarkManager: HeadAndShouldersMarkManager | null = null;
    public abcdMarkManager: ABCDMarkManager | null = null;
    public triangleABCDMarkManager: TriangleABCDMarkManager | null = null;
    public elliottImpulseMarkManager: ElliottImpulseMarkManager | null = null;
    public elliottCorrectiveMarkManager: ElliottCorrectiveMarkManager | null = null;
    public elliottTriangleMarkManager: ElliottTriangleMarkManager | null = null;
    public elliottDoubleCombinationMarkManager: ElliottDoubleCombinationMarkManager | null = null;
    public elliottTripleCombinationMarkManager: ElliottTripleCombinationMarkManager | null = null;
    public timeRangeMarkManager: TimeRangeMarkManager | null = null;
    public priceRangeMarkManager: PriceRangeMarkManager | null = null;
    public timePriceRangeMarkManager: TimePriceRangeMarkManager | null = null;
    public pencilMarkManager: PencilMarkManager | null = null;
    public penMarkManager: PenMarkManager | null = null;
    public brushMarkManager: BrushMarkManager | null = null;
    public markerPenMarkManager: MarkerPenMarkManager | null = null;
    public eraserMarkManager: EraserMarkManager | null = null;
    public thickArrowLineMarkManager: ThickArrowLineMarkManager | null = null;
    public imageMarkManager: ImageMarkManager | null = null;
    public tableMarkManager: TableMarkManager | null = null;
    public longPositionMarkManager: LongPositionMarkManager | null = null;
    public shortPositionMarkManager: ShortPositionMarkManager | null = null;
    public priceLabelMarkManager: PriceLabelMarkManager | null = null;
    public flagMarkManager: FlagMarkManager | null = null;
    public priceNoteMarkManager: PriceNoteMarkManager | null = null;
    public signpostMarkManager: SignPostMarkManager | null = null;
    public emojiMarkManager: EmojiMarkManager | null = null;
    public pinMarkManager: PinMarkManager | null = null;
    public bubbleBoxMarkManager: BubbleBoxMarkManager | null = null;
    public textEditMarkManager: TextEditMarkManager | null = null;
    public mockKLineMarkManager: MockKLineMarkManager | null = null;
    public heatMapMarkManager: HeatMapMarkManager | null = null;
    public schiffPitchforkMarkManager: SchiffPitchforkMarkManager | null = null;

    constructor() { }

    public initializeEraserMarkManager(charLayer: ChartLayer) {
        this.eraserMarkManager = new EraserMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: () => {
                if (charLayer.props.onCloseDrawing) {
                    charLayer.props.onCloseDrawing();
                }
            }
        });
        this.registerAllDeletableMarks();
    }

    public registerAllDeletableMarks() {
        if (!this.eraserMarkManager) return;
        const allDeletableMarks: IDeletableMark[] = [];
        if (this.penMarkManager) {
            allDeletableMarks.push(...this.penMarkManager.getAllMarks());
        }
        if (this.pencilMarkManager) {
            allDeletableMarks.push(...this.pencilMarkManager.getAllMarks());
        }
        if (this.brushMarkManager) {
            allDeletableMarks.push(...this.brushMarkManager.getAllMarks());
        }
        if (this.markerPenMarkManager) {
            allDeletableMarks.push(...this.markerPenMarkManager.getAllMarks());
        }
        this.eraserMarkManager.setPenMarks(allDeletableMarks);
    }

    public initializeMarkManager = (charLayer: ChartLayer) => {
        this.initializeEraserMarkManager(charLayer);

        this.schiffPitchforkMarkManager = new SchiffPitchforkMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.heatMapMarkManager = new HeatMapMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });


        this.mockKLineMarkManager = new MockKLineMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing,
        });

        this.textEditMarkManager = new TextEditMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.bubbleBoxMarkManager = new BubbleBoxMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.pinMarkManager = new PinMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.emojiMarkManager = new EmojiMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.signpostMarkManager = new SignPostMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.priceNoteMarkManager = new PriceNoteMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.flagMarkManager = new FlagMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.priceLabelMarkManager = new PriceLabelMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.shortPositionMarkManager = new ShortPositionMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.longPositionMarkManager = new LongPositionMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.tableMarkManager = new TableMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.imageMarkManager = new ImageMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.thickArrowLineMarkManager = new ThickArrowLineMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.markerPenMarkManager = new MarkerPenMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.brushMarkManager = new BrushMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.penMarkManager = new PenMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.pencilMarkManager = new PencilMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.timePriceRangeMarkManager = new TimePriceRangeMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.priceRangeMarkManager = new PriceRangeMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.timeRangeMarkManager = new TimeRangeMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.elliottTripleCombinationMarkManager = new ElliottTripleCombinationMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.elliottDoubleCombinationMarkManager = new ElliottDoubleCombinationMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.elliottTriangleMarkManager = new ElliottTriangleMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.elliottCorrectiveMarkManager = new ElliottCorrectiveMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.elliottImpulseMarkManager = new ElliottImpulseMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.triangleABCDMarkManager = new TriangleABCDMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.abcdMarkManager = new ABCDMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.headAndShouldersMarkManager = new HeadAndShouldersMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.xabcdMarkManager = new XABCDMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.doubleCurveMarkManager = new DoubleCurveMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.curveMarkManager = new CurveMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.sectorMarkManager = new SectorMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.fibonacciExtensionBaseTimeMarkManager = new FibonacciExtensionBaseTimeMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });


        this.fibonacciExtensionBasePriceMarkManager = new FibonacciExtensionBasePriceMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.fibonacciChannelMarkManager = new FibonacciChannelMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.fibonacciFanMarkManager = new FibonacciFanMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.fibonacciWedgeMarkManager = new FibonacciWedgeMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.fibonacciSpiralMarkManager = new FibonacciSpiralMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.fibonacciCircleMarkManager = new FibonacciCircleMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.fibonacciArcMarkManager = new FibonacciArcMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.fibonacciRetracementMarkManager = new FibonacciRetracementMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.fibonacciTimeZoonMarkManager = new FibonacciTimeZoonMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.gannRectangleMarkManager = new GannRectangleMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.gannBoxMarkManager = new GannBoxMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.gannFanMarkManager = new GannFanMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.triangleMarkManager = new TriangleMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.ellipseMarkManager = new EllipseMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.rectangleMarkManager = new RectangleMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.enhancedAndrewPitchforkMarkManager = new EnhancedAndrewPitchforkMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });
        this.andrewPitchforkMarkManager = new AndrewPitchforkMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });
        this.disjointChannelMarkManager = new DisjointChannelMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });
        this.lineSegmentMarkManager = new LineSegmentMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });
        this.axisLineMarkManager = new AxisLineMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });
        this.arrowLineMarkManager = new ArrowLineMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });
        this.parallelChannelMarkManager = new ParallelChannelMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });
        this.linearRegressionChannelMarkManager = new LinearRegressionChannelMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });
        this.equidistantChannelMarkManager = new EquidistantChannelMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });
    }

    public initializeMarkManagerProps = (charLayer: ChartLayer) => {

        this.schiffPitchforkMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
        });

        this.heatMapMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
        });

        this.mockKLineMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
        });

        this.textEditMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.bubbleBoxMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.pinMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.emojiMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.signpostMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.priceNoteMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });


        this.flagMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.priceLabelMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.longPositionMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.shortPositionMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.tableMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.imageMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.thickArrowLineMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.markerPenMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.brushMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.penMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.pencilMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.timePriceRangeMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.priceRangeMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.timeRangeMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.elliottTripleCombinationMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.elliottDoubleCombinationMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.elliottTriangleMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.elliottCorrectiveMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.elliottImpulseMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.triangleABCDMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.abcdMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.headAndShouldersMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.xabcdMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.doubleCurveMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.curveMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.sectorMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.fibonacciExtensionBaseTimeMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.fibonacciExtensionBasePriceMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.fibonacciChannelMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.fibonacciFanMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.fibonacciWedgeMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.fibonacciSpiralMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.fibonacciCircleMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.fibonacciArcMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.fibonacciRetracementMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.fibonacciTimeZoonMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.gannRectangleMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.gannBoxMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.gannFanMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.triangleMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.ellipseMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.circleMarkManager = new CircleMarkManager({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart,
            containerRef: charLayer.containerRef,
            onCloseDrawing: charLayer.props.onCloseDrawing
        });

        this.rectangleMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.enhancedAndrewPitchforkMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });

        this.andrewPitchforkMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });
        this.disjointChannelMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });
        this.lineSegmentMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });
        this.arrowLineMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });
        this.parallelChannelMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });
        this.linearRegressionChannelMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });
        this.equidistantChannelMarkManager?.updateProps({
            chartSeries: charLayer.props.chartSeries,
            chart: charLayer.props.chart
        });
    }

    public destroyMarkManager = () => {
        this.priceLabelMarkManager?.destroy();
        this.lineSegmentMarkManager?.destroy();
        this.shortPositionMarkManager?.destroy();
        this.arrowLineMarkManager?.destroy();
        this.parallelChannelMarkManager?.destroy();
        this.linearRegressionChannelMarkManager?.destroy();
        this.disjointChannelMarkManager?.destroy();
        this.andrewPitchforkMarkManager?.destroy();
        this.enhancedAndrewPitchforkMarkManager?.destroy();
        this.rectangleMarkManager?.destroy();
        this.circleMarkManager?.destroy();
        this.ellipseMarkManager?.destroy();
        this.triangleMarkManager?.destroy();
        this.gannFanMarkManager?.destroy();
        this.gannBoxMarkManager?.destroy();
        this.gannRectangleMarkManager?.destroy();
        this.fibonacciTimeZoonMarkManager?.destroy();
        this.fibonacciRetracementMarkManager?.destroy();
        this.fibonacciArcMarkManager?.destroy();
        this.fibonacciCircleMarkManager?.destroy();
        this.fibonacciSpiralMarkManager?.destroy();
        this.fibonacciWedgeMarkManager?.destroy();
        this.fibonacciFanMarkManager?.destroy();
        this.fibonacciChannelMarkManager?.destroy();
        this.fibonacciExtensionBasePriceMarkManager?.destroy();
        this.fibonacciExtensionBaseTimeMarkManager?.destroy();
        this.sectorMarkManager?.destroy();
        this.curveMarkManager?.destroy();
        this.doubleCurveMarkManager?.destroy();
        this.xabcdMarkManager?.destroy();
        this.headAndShouldersMarkManager?.destroy();
        this.abcdMarkManager?.destroy();
        this.triangleABCDMarkManager?.destroy();
        this.elliottImpulseMarkManager?.destroy();
        this.elliottCorrectiveMarkManager?.destroy();
        this.elliottTriangleMarkManager?.destroy();
        this.elliottDoubleCombinationMarkManager?.destroy();
        this.elliottTripleCombinationMarkManager?.destroy();
        this.timeRangeMarkManager?.destroy();
        this.priceRangeMarkManager?.destroy();
        this.timePriceRangeMarkManager?.destroy();
        this.pencilMarkManager?.destroy();
        this.penMarkManager?.destroy();
        this.brushMarkManager?.destroy();
        this.markerPenMarkManager?.destroy();
        this.eraserMarkManager?.destroy();
        this.thickArrowLineMarkManager?.destroy();
        this.imageMarkManager?.destroy();
        this.tableMarkManager?.destroy();
        this.longPositionMarkManager?.destroy();
        this.shortPositionMarkManager?.destroy();
        this.priceLabelMarkManager?.destroy();
        this.flagMarkManager?.destroy();
        this.priceNoteMarkManager?.destroy();
        this.signpostMarkManager?.destroy();
        this.emojiMarkManager?.destroy();
        this.pinMarkManager?.destroy();
        this.bubbleBoxMarkManager?.destroy();
        this.textEditMarkManager?.destroy();
        this.mockKLineMarkManager?.destroy();
        this.heatMapMarkManager?.destroy();
        this.schiffPitchforkMarkManager?.destroy();
    }

    public setMockKLineMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.mockKLineMarkManager) return;
        const newState = this.mockKLineMarkManager.setMockKLineMarkMode();
        charLayer.setState({
            isMockKLineMarkMode: newState.isMockKLineMarkMode,
            mockKLineMarkStartPoint: newState.mockKLineMarkStartPoint,
            currentMockKLineMark: newState.currentMockKLineMark,
            isMockKLineDragging: newState.isDragging,
            mockKLineDragTarget: newState.dragTarget,
            mockKLineDragPoint: newState.dragPoint,
            currentMarkMode: MarkType.MockKLine
        });
    };

    public setTextEditMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.textEditMarkManager) return;
        const newState = this.textEditMarkManager.setTextEditMarkMode();
        charLayer.setState({
            isTextEditMarkMode: newState.isTextEditMarkMode,
            isTextEditDragging: newState.isDragging,
            textEditDragTarget: newState.dragTarget,
            currentMarkMode: MarkType.TextEdit
        });
    };

    public setBubbleBoxMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.bubbleBoxMarkManager) return;
        const newState = this.bubbleBoxMarkManager.setBubbleBoxMarkMode();
        charLayer.setState({
            isBubbleBoxMarkMode: newState.isBubbleBoxMarkMode,
            bubbleBoxMarkPoints: newState.bubbleBoxMarkPoints,
            currentBubbleBoxMark: newState.currentBubbleBoxMark,
            isBubbleBoxDragging: newState.isDragging,
            bubbleBoxDragTarget: newState.dragTarget,
            bubbleBoxDragType: newState.dragType,
            currentMarkMode: MarkType.BubbleBox
        });
    };

    public setPinMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.pinMarkManager) return;
        const newState = this.pinMarkManager.setPinMarkMode();
        charLayer.setState({
            isPinMarkMode: newState.isPinMarkMode,
            pinMarkPoint: newState.pinMarkPoint,
            currentPinMark: newState.currentPinMark,
            isPinDragging: newState.isDragging,
            pinDragTarget: newState.dragTarget,
            currentMarkMode: MarkType.Pin
        });
    };

    public setEmojiMarkMode = (charLayer: ChartLayer, emoji: string) => {
        this.clearAllMarkMode(charLayer);
        if (!this.emojiMarkManager) return;
        const newState = this.emojiMarkManager.setEmojiMarkMode(emoji);
        charLayer.setState({
            isEmojiMarkMode: newState.isEmojiMarkMode,
            emojiMarkStartPoint: newState.emojiMarkStartPoint,
            currentEmojiMark: newState.currentEmojiMark,
            isEmojiDragging: newState.isDragging,
            emojiDragTarget: newState.dragTarget,
            emojiDragPoint: newState.dragPoint,
            currentMarkMode: MarkType.Emoji
        });
    };

    public setSignpostMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.signpostMarkManager) return;
        const newState = this.signpostMarkManager.setSignPostMarkMode();
        charLayer.setState({
            isSignpostMarkMode: newState.isSignPostMarkMode,
            signpostMarkPoint: newState.signPostMarkPoint,
            currentSignpostMark: newState.currentSignPostMark,
            isSignpostDragging: newState.isDragging,
            signpostDragTarget: newState.dragTarget,
            currentMarkMode: MarkType.SignPost
        });
    };

    public setPriceNoteMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.priceNoteMarkManager) return;
        const newState = this.priceNoteMarkManager.setPriceNoteMarkMode();
        charLayer.setState({
            isPriceNoteMarkMode: newState.isPriceNoteMarkMode,
            priceNoteMarkStartPoint: newState.priceNoteMarkStartPoint,
            currentPriceNoteMark: newState.currentPriceNoteMark,
            isPriceNoteDragging: newState.isDragging,
            priceNoteDragTarget: newState.dragTarget,
            priceNoteDragPoint: newState.dragPoint,
            currentMarkMode: MarkType.PriceNote
        });
    };

    public setFlagMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.flagMarkManager) return;
        const newState = this.flagMarkManager.setFlagMarkMode();
        charLayer.setState({
            isFlagMarkMode: newState.isFlagMarkMode,
            flagMarkPoint: newState.flagMarkPoint,
            currentFlagMark: newState.currentFlagMark,
            isFlagDragging: newState.isDragging,
            flagDragTarget: newState.dragTarget,
            currentMarkMode: MarkType.Flag
        });
    };

    public setPriceLabelMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.priceLabelMarkManager) return;
        const newState = this.priceLabelMarkManager.setPriceLabelMarkMode();
        charLayer.setState({
            isPriceLabelMarkMode: newState.isPriceLabelMarkMode,
            priceLabelMarkPoint: newState.priceLabelMarkPoint,
            currentPriceLabelMark: newState.currentPriceLabelMark,
            isPriceLabelDragging: newState.isDragging,
            priceLabelDragTarget: newState.dragTarget,
            currentMarkMode: MarkType.PriceLabel
        });
    };

    public setShortPositionMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.shortPositionMarkManager) return;
        const newState = this.shortPositionMarkManager.setShortPositionMarkMode();
        charLayer.setState({
            isShortPositionMarkMode: newState.isShortPositionMarkMode,
            shortPositionMarkStartPoint: newState.shortPositionMarkStartPoint,
            currentShortPositionMark: newState.currentShortPositionMark,
            isShortPositionDragging: newState.isDragging,
            shortPositionDragTarget: newState.dragTarget,
            shortPositionDragPoint: newState.dragPoint,
            shortPositionDrawingPhase: newState.drawingPhase,
            shortPositionAdjustingMode: newState.adjustingMode,
            currentMarkMode: MarkType.ShortPosition
        });
    };

    public setLongPositionMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.longPositionMarkManager) return;
        const newState = this.longPositionMarkManager.setLongPositionMarkMode();
        charLayer.setState({
            isLongPositionMarkMode: newState.isLongPositionMarkMode,
            longPositionMarkStartPoint: newState.longPositionMarkStartPoint,
            currentLongPositionMark: newState.currentLongPositionMark,
            isDragging: newState.isDragging,
            dragTarget: newState.dragTarget,
            dragPoint: newState.dragPoint,
            longPositionDrawingPhase: newState.drawingPhase,
            adjustingMode: newState.adjustingMode,
            currentMarkMode: MarkType.LongPosition
        });
    };

    public setTableMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.tableMarkManager) return;
        const newState = this.tableMarkManager.setTableMarkMode();
        charLayer.setState({
            isTableMarkMode: newState.isTableMarkMode,
            tableMarkStartPoint: newState.tableMarkStartPoint,
            currentTableMark: newState.currentTableMark,
            isTableDragging: newState.isDragging,
            tableDragTarget: newState.dragTarget,
            tableDragPoint: newState.dragPoint,
            currentMarkMode: MarkType.Table
        });
    };

    public setThickArrowLineMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.thickArrowLineMarkManager) return;
        const newState = this.thickArrowLineMarkManager.setThickArrowLineMarkMode();
        charLayer.setState({
            thickArrowLineMarkStartPoint: newState.thickArrowLineMarkStartPoint,
            currentThickArrowLineMark: newState.currentThickArrowLineMark,
            currentMarkMode: MarkType.ThickArrowLine
        });
    };

    public setEraserMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (this.eraserMarkManager) {
            this.registerAllDeletableMarks();
            this.eraserMarkManager.setEraserMode();
            charLayer.setState({
                currentMarkMode: MarkType.Eraser,
                isEraserMode: true,
                isErasing: false,
                eraserHoveredMark: null
            });
        }
    };

    public setMarkerPenMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.markerPenMarkManager) return;
        const newState = this.markerPenMarkManager.setMarkerPenMarkMode();
        charLayer.setState({
            isMarkerPenMode: newState.isMarkerPenMarkMode,
            isMarkerPenDrawing: newState.isDrawing,
            currentMarkerPen: newState.currentMarkerPenMark,
            currentMarkMode: MarkType.MarkerPen
        });
    };

    public setBrushMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.brushMarkManager) return;
        const newState = this.brushMarkManager.setBrushMode();
        charLayer.setState({
            isBrushMode: newState.isBrushMode,
            isBrushDrawing: newState.isDrawing,
            currentBrushMark: newState.currentBrushMark,
            currentMarkMode: MarkType.Brush
        });
    };

    public setPenMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.penMarkManager) return;
        const newState = this.penMarkManager.setPenMode();
        charLayer.setState({
            isPenMode: newState.isPenMode,
            isPenDrawing: newState.isDrawing,
            currentPenMark: newState.currentPenMark,
            currentMarkMode: MarkType.Pen
        });
    };

    public setPencilMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.pencilMarkManager) return;
        const newState = this.pencilMarkManager.setPencilMode();
        charLayer.setState({
            isPencilMode: newState.isPencilMode,
            isPencilDrawing: newState.isDrawing,
            currentPencilMark: newState.currentPencilMark,
            currentMarkMode: MarkType.Pencil
        });
    };

    public setTimePriceRangeMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.timePriceRangeMarkManager) return;
        const newState = this.timePriceRangeMarkManager.setTimePriceRangeMarkMode();
        charLayer.setState({
            timePriceRangeMarkStartPoint: newState.timePriceRangeMarkStartPoint,
            currentTimePriceRangeMark: newState.currentTimePriceRangeMark,
            isTimePriceRangeMarkMode: newState.isTimePriceRangeMarkMode,
            currentMarkMode: MarkType.TimePriceRange
        });
    };

    public setPriceRangeMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.priceRangeMarkManager) return;
        const newState = this.priceRangeMarkManager.setPriceRangeMarkMode();
        charLayer.setState({
            priceRangeMarkStartPoint: newState.priceRangeMarkStartPoint,
            currentPriceRangeMark: newState.currentPriceRangeMark,
            isPriceRangeMarkMode: newState.isPriceRangeMarkMode,
            currentMarkMode: MarkType.PriceRange
        });
    };

    public setTimeRangeMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.timeRangeMarkManager) return;
        const newState = this.timeRangeMarkManager.setTimeRangeMarkMode();
        charLayer.setState({
            timeRangeMarkStartPoint: newState.timeRangeMarkStartPoint,
            currentTimeRangeMark: newState.currentTimeRangeMark,
            isTimeRangeMarkMode: newState.isTimeRangeMarkMode,
            currentMarkMode: MarkType.TimeRange
        });
    };

    public setElliottTripleCombinationMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.elliottTripleCombinationMarkManager) return;
        const newState = this.elliottTripleCombinationMarkManager.setElliottTripleCombinationMode();
        charLayer.setState({
            elliottTripleCombinationPoints: newState.currentPoints,
            currentElliottTripleCombinationMark: newState.currentElliottTripleCombinationMark,
            currentMarkMode: MarkType.Elliott_Triple_Combination
        });
    };

    public setElliottDoubleCombinationMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.elliottDoubleCombinationMarkManager) return;
        const newState = this.elliottDoubleCombinationMarkManager.setElliottDoubleCombinationMode();
        charLayer.setState({
            elliottDoubleCombinationPoints: newState.currentPoints,
            currentElliottDoubleCombinationMark: newState.currentElliottDoubleCombinationMark,
            currentMarkMode: MarkType.Elliott_Double_Combination
        });
    };

    public setElliottTriangleMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.elliottTriangleMarkManager) return;
        const newState = this.elliottTriangleMarkManager.setElliottTriangleMode();
        charLayer.setState({
            elliottTrianglePoints: newState.currentPoints,
            currentElliottTriangleMark: newState.currentElliottTriangleMark,
            currentMarkMode: MarkType.Elliott_Triangle
        });
    };

    public setElliottCorrectiveMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.elliottCorrectiveMarkManager) return;
        const newState = this.elliottCorrectiveMarkManager.setElliottCorrectiveMode();
        charLayer.setState({
            elliottCorrectivePoints: newState.currentPoints,
            currentElliottCorrectiveMark: newState.currentElliottCorrectiveMark,
            currentMarkMode: MarkType.Elliott_Corrective
        });
    };

    public setElliottImpulseMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.elliottImpulseMarkManager) return;
        const newState = this.elliottImpulseMarkManager.setElliottImpulseMode();
        charLayer.setState({
            elliottImpulsePoints: newState.currentPoints,
            currentElliottImpulseMark: newState.currentElliottImpulseMark,
            currentMarkMode: MarkType.Elliott_Impulse
        });
    };

    public setTriangleABCDMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.triangleABCDMarkManager) return;
        const newState = this.triangleABCDMarkManager.setGlassTriangleABCDMode();
        charLayer.setState({
            triangleABCDPoints: newState.currentPoints,
            currentTriangleABCDMark: newState.currentTriangleABCDMark,
            currentMarkMode: MarkType.TriangleABCD
        });
    };

    public setABCDMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.abcdMarkManager) return;
        const newState = this.abcdMarkManager.setABCDMode();
        charLayer.setState({
            abcdPoints: newState.currentPoints,
            currentABCDMark: newState.currentABCDMark,
            currentMarkMode: MarkType.ABCD
        });
    };

    public setHeadAndShouldersMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.headAndShouldersMarkManager) return;
        const newState = this.headAndShouldersMarkManager.setHeadAndShouldersMode();
        charLayer.setState({
            headAndShouldersPoints: newState.currentPoints,
            currentHeadAndShouldersMark: newState.currentHeadAndShouldersMark,
            currentMarkMode: MarkType.HeadAndShoulders
        });
    };

    public setXABCDMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.xabcdMarkManager) return;
        const newState = this.xabcdMarkManager.setXABCDMode();
        charLayer.setState({
            xabcdPoints: newState.currentPoints,
            currentXABCDMark: newState.currentXABCDMark,
            currentMarkMode: MarkType.XABCD
        });
    };

    public setDoubleCurveMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.doubleCurveMarkManager) return;
        const newState = this.doubleCurveMarkManager.setDoubleCurveMarkMode();
        charLayer.setState({
            doubleCurveMarkStartPoint: newState.doubleCurveMarkStartPoint,
            currentDoubleCurveMark: newState.currentDoubleCurveMark,
            currentMarkMode: MarkType.DoubleCurve
        });
    };

    public setCurveMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.curveMarkManager) return;
        const newState = this.curveMarkManager.setCurveMarkMode();
        charLayer.setState({
            curveMarkStartPoint: newState.curveMarkStartPoint,
            currentCurveMark: newState.currentCurveMark,
            currentMarkMode: MarkType.Curve
        });
    };

    public setSectorMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.sectorMarkManager) return;
        const newState = this.sectorMarkManager.setSectorMode();
        charLayer.setState({
            sectorPoints: newState.sectorPoints,
            currentSector: newState.currentSector,
            currentMarkMode: MarkType.Sector
        });
    };

    public setFibonacciExtensionBaseTimeMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.fibonacciExtensionBaseTimeMarkManager) return;
        const newState = this.fibonacciExtensionBaseTimeMarkManager.setFibonacciExtensionBaseTimeMode();
        charLayer.setState({
            fibonacciExtensionBaseTimePoints: newState.fibonacciExtensionBaseTimePoints,
            currentFibonacciExtensionBaseTime: newState.currentFibonacciExtensionBaseTime,
            currentMarkMode: MarkType.FibonacciExtensionBaseTime
        });
    };

    public setFibonacciExtensionBasePriceMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.fibonacciExtensionBasePriceMarkManager) return;
        const newState = this.fibonacciExtensionBasePriceMarkManager.setFibonacciExtensionBasePriceMode();
        charLayer.setState({
            fibonacciExtensionBasePricePoints: newState.fibonacciExtensionBasePricePoints,
            currentFibonacciExtensionBasePrice: newState.currentFibonacciExtensionBasePrice,
            currentMarkMode: MarkType.FibonacciExtensionBasePrice
        });
    };

    public setFibonacciChannelMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.fibonacciChannelMarkManager) return;
        const newState = this.fibonacciChannelMarkManager.setFibonacciChannelMarkMode();
        charLayer.setState({
            currentFibonacciChannel: newState.currentFibonacciChannelMark,
            isFibonacciChannelMode: newState.isFibonacciChannelMarkMode,
            fibonacciChannelDrawingStep: this.getDrawingStepFromPhase(newState.drawingPhase),
            currentMarkMode: MarkType.FibonacciChannel
        });
    };

    public setFibonacciFanMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.fibonacciFanMarkManager) return;
        const newState = this.fibonacciFanMarkManager.setFibonacciFanMode();
        charLayer.setState({
            fibonacciFanStartPoint: newState.fibonacciFanStartPoint,
            currentFibonacciFan: newState.currentFibonacciFan,
            currentMarkMode: MarkType.FibonacciFan
        });
    };

    public setFibonacciWedgeMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.fibonacciWedgeMarkManager) return;
        const newState = this.fibonacciWedgeMarkManager.setFibonacciWedgeMode();
        charLayer.setState({
            fibonacciWedgePoints: newState.fibonacciWedgePoints,
            currentFibonacciWedge: newState.currentFibonacciWedge,
            currentMarkMode: MarkType.FibonacciWedge,
            fibonacciWedgeDrawingStep: 0
        });
    };

    public setFibonacciSpiralMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.fibonacciSpiralMarkManager) return;
        const newState = this.fibonacciSpiralMarkManager.setFibonacciSpiralMode();
        charLayer.setState({
            fibonacciSpiralCenterPoint: newState.fibonacciSpiralCenterPoint,
            currentFibonacciSpiral: newState.currentFibonacciSpiral,
            currentMarkMode: MarkType.FibonacciSpiral
        });
    };

    public setFibonacciCircleMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.fibonacciCircleMarkManager) return;
        const newState = this.fibonacciCircleMarkManager.setFibonacciCircleMode();
        charLayer.setState({
            fibonacciCircleCenterPoint: newState.fibonacciCircleCenterPoint,
            currentFibonacciCircle: newState.currentFibonacciCircle,
            currentMarkMode: MarkType.FibonacciCircle
        });
    };
    public setFibonacciArcMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.fibonacciArcMarkManager) return;
        const newState = this.fibonacciArcMarkManager.setFibonacciArcMode();
        charLayer.setState({
            fibonacciArcStartPoint: newState.fibonacciArcStartPoint,
            currentFibonacciArc: newState.currentFibonacciArc,
            currentMarkMode: MarkType.FibonacciArc
        });
    };

    public setFibonacciRetracementMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.fibonacciRetracementMarkManager) return;
        const newState = this.fibonacciRetracementMarkManager.setFibonacciRetracementMode();
        charLayer.setState({
            fibonacciRetracementStartPoint: newState.fibonacciRetracementStartPoint,
            currentFibonacciRetracement: newState.currentFibonacciRetracement,
            currentMarkMode: MarkType.FibonacciRetracement
        });
    };

    public setFibonacciTimeZoonMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.fibonacciTimeZoonMarkManager) return;
        const newState = this.fibonacciTimeZoonMarkManager.setFibonacciTimeZoneMode();
        charLayer.setState({
            fibonacciTimeZoonStartPoint: newState.fibonacciTimeZoonStartPoint,
            currentFibonacciTimeZoon: newState.currentFibonacciTimeZoon,
            currentMarkMode: MarkType.FibonacciTimeZoon
        });
    };

    public setGannRectangleMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.gannRectangleMarkManager) return;
        const newState = this.gannRectangleMarkManager.setGannRectangMode();
        charLayer.setState({
            gannRectangleStartPoint: newState.gannRectangleStartPoint,
            currentGannRectangle: newState.currentGannRectangle,
            currentMarkMode: MarkType.GannRectangle
        });
    };

    public setGannBoxMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.gannBoxMarkManager) return;
        const newState = this.gannBoxMarkManager.setGannBoxMode();
        charLayer.setState({
            gannBoxStartPoint: newState.gannBoxStartPoint,
            currentGannBox: newState.currentGannBox,
            currentMarkMode: MarkType.GannBox
        });
    };

    public setGannFanMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.gannFanMarkManager) return;
        const newState = this.gannFanMarkManager.setGannFanMode();
        charLayer.setState({
            gannFanStartPoint: newState.gannFanStartPoint,
            currentGannFan: newState.currentGannFan,
            currentMarkMode: MarkType.GannFan
        });
    };

    public setTriangleMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.triangleMarkManager) return;
        const newState = this.triangleMarkManager.setTriangleMarkMode();
        charLayer.setState({
            triangleMarkStartPoint: newState.triangleMarkStartPoint,
            currentTriangleMark: newState.currentTriangleMark,
            currentMarkMode: MarkType.Triangle
        });
    };

    public setEllipseMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.ellipseMarkManager) return;
        const newState = this.ellipseMarkManager.setEllipseMarkMode();
        charLayer.setState({
            ellipseMarkStartPoint: newState.ellipseMarkStartPoint,
            currentEllipseMark: newState.currentEllipseMark,
            currentMarkMode: MarkType.Ellipse
        });
    };

    public setCircleMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.circleMarkManager) return;
        const newState = this.circleMarkManager.setCircleMarkMode();
        charLayer.setState({
            circleMarkStartPoint: newState.circleMarkStartPoint,
            currentCircleMark: newState.currentCircleMark,
            currentMarkMode: MarkType.Circle
        });
    };

    public setRectangleMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.rectangleMarkManager) return;
        const newState = this.rectangleMarkManager.setRectangleMarkMode();
        charLayer.setState({
            rectangleMarkStartPoint: newState.rectangleMarkStartPoint,
            currentRectangleMark: newState.currentRectangleMark,
            currentMarkMode: MarkType.Rectangle
        });
    };
    public setEnhancedAndrewPitchforkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.enhancedAndrewPitchforkMarkManager) return;
        const newState = this.enhancedAndrewPitchforkMarkManager.setEnhancedAndrewPitchforkMode();
        charLayer.setState({
            enhancedAndrewPitchforkHandlePoint: newState.enhancedAndrewPitchforkHandlePoint,
            enhancedAndrewPitchforkBaseStartPoint: newState.enhancedAndrewPitchforkBaseStartPoint,
            currentEnhancedAndrewPitchfork: newState.currentEnhancedAndrewPitchfork,
            currentMarkMode: MarkType.EnhancedAndrewPitchfork
        });
    };
    public setAndrewPitchforkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.andrewPitchforkMarkManager) return;
        const newState = this.andrewPitchforkMarkManager.setAndrewPitchforkMode();
        charLayer.setState({
            andrewPitchforkHandlePoint: newState.andrewPitchforkHandlePoint,
            andrewPitchforkBaseStartPoint: newState.andrewPitchforkBaseStartPoint,
            currentAndrewPitchfork: newState.currentAndrewPitchfork,
            currentMarkMode: MarkType.AndrewPitchfork
        });
    };
    public setDisjointChannelMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.disjointChannelMarkManager) return;
        const newState = this.disjointChannelMarkManager.setDisjointChannelMarkMode();
        charLayer.setState({
            disjointChannelMarkStartPoint: newState.disjointChannelMarkStartPoint,
            currentDisjointChannelMark: newState.currentDisjointChannelMark,
            currentMarkMode: MarkType.DisjointChannel
        });
    };
    public setEquidistantChannelMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.equidistantChannelMarkManager) return;
        const newState = this.equidistantChannelMarkManager.setEquidistantChannelMarkMode();
        charLayer.setState({
            equidistantChannelMarkStartPoint: newState.equidistantChannelMarkStartPoint,
            currentEquidistantChannelMark: newState.currentEquidistantChannelMark,
            currentMarkMode: MarkType.EquidistantChannel
        });
    };
    public setLinearRegressionChannelMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.linearRegressionChannelMarkManager) return;
        const newState = this.linearRegressionChannelMarkManager.setLinearRegressionChannelMode();
        charLayer.setState({
            linearRegressionChannelStartPoint: newState.linearRegressionChannelStartPoint,
            currentLinearRegressionChannel: newState.currentLinearRegressionChannel,
            currentMarkMode: MarkType.LinearRegressionChannel
        });
    };
    public setLineSegmentMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.lineSegmentMarkManager) return;
        const newState = this.lineSegmentMarkManager.setLineSegmentMarkMode();
        charLayer.setState({
            lineSegmentMarkStartPoint: newState.lineSegmentMarkStartPoint,
            currentLineSegmentMark: newState.currentLineSegmentMark,
            currentMarkMode: MarkType.LineSegment
        });
    };
    public setHorizontalLineMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.axisLineMarkManager) return;
        const newState = this.axisLineMarkManager.setHorizontalLineMode();
        charLayer.setState({
            currentMarkMode: MarkType.HorizontalLine
        });
    };
    public setVerticalLineMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.axisLineMarkManager) return;
        const newState = this.axisLineMarkManager.setVerticalLineMode();
        charLayer.setState({
            currentMarkMode: MarkType.VerticalLine
        });
    };
    public setArrowLineMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.arrowLineMarkManager) return;
        const newState = this.arrowLineMarkManager.setArrowLineMarkMode();
        charLayer.setState({
            arrowLineMarkStartPoint: newState.arrowLineMarkStartPoint,
            currentArrowLineMark: newState.currentArrowLineMark,
            currentMarkMode: MarkType.ArrowLine
        });
    };
    public setParallelChannelMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.parallelChannelMarkManager) return;
        const newState = this.parallelChannelMarkManager.setParallelChannelMarkMode();
        charLayer.setState({
            parallelChannelMarkStartPoint: newState.parallelChannelMarkStartPoint,
            currentParallelChannelMark: newState.currentParallelChannelMark,
            currentMarkMode: MarkType.ParallelChannel
        });
    };

    public clearAllMarkManagerState = () => {
        this.lineSegmentMarkManager?.clearState();
        this.shortPositionMarkManager?.clearState();
        this.arrowLineMarkManager?.clearState();
        this.parallelChannelMarkManager?.clearState();
        this.linearRegressionChannelMarkManager?.clearState();
        this.disjointChannelMarkManager?.clearState();
        this.andrewPitchforkMarkManager?.clearState();
        this.enhancedAndrewPitchforkMarkManager?.clearState();
        this.rectangleMarkManager?.clearState();
        this.circleMarkManager?.clearState();
        this.ellipseMarkManager?.clearState();
        this.triangleMarkManager?.clearState();
        this.gannFanMarkManager?.clearState();
        this.gannBoxMarkManager?.clearState();
        this.gannRectangleMarkManager?.clearState();
        this.fibonacciTimeZoonMarkManager?.clearState();
        this.fibonacciRetracementMarkManager?.clearState();
        this.fibonacciArcMarkManager?.clearState();
        this.fibonacciCircleMarkManager?.clearState();
        this.fibonacciSpiralMarkManager?.clearState();
        this.fibonacciWedgeMarkManager?.clearState();
        this.fibonacciFanMarkManager?.clearState();
        this.fibonacciChannelMarkManager?.clearState();
        this.fibonacciExtensionBasePriceMarkManager?.clearState();
        this.fibonacciExtensionBaseTimeMarkManager?.clearState();
        this.sectorMarkManager?.clearState();
        this.curveMarkManager?.clearState();
        this.doubleCurveMarkManager?.clearState();
        this.xabcdMarkManager?.clearState();
        this.headAndShouldersMarkManager?.clearState();
        this.abcdMarkManager?.clearState();
        this.triangleABCDMarkManager?.clearState();
        this.elliottImpulseMarkManager?.clearState();
        this.elliottCorrectiveMarkManager?.clearState();
        this.elliottTriangleMarkManager?.clearState();
        this.elliottDoubleCombinationMarkManager?.clearState();
        this.elliottTripleCombinationMarkManager?.clearState();
        this.timeRangeMarkManager?.clearState();
        this.priceRangeMarkManager?.clearState();
        this.timePriceRangeMarkManager?.clearState();
        this.pencilMarkManager?.clearState();
        this.penMarkManager?.clearState();
        this.brushMarkManager?.clearState();
        this.markerPenMarkManager?.clearState();
        this.eraserMarkManager?.clearState();
        this.thickArrowLineMarkManager?.clearState();
        this.imageMarkManager?.clearState();
        this.tableMarkManager?.clearState();
        this.longPositionMarkManager?.clearState();
        this.priceLabelMarkManager?.clearState();
        this.flagMarkManager?.clearState();
        this.priceNoteMarkManager?.clearState();
        this.signpostMarkManager?.clearState();
        this.emojiMarkManager?.clearState();
        this.pinMarkManager?.clearState();
        this.bubbleBoxMarkManager?.clearState();
        this.textEditMarkManager?.clearState();
        this.mockKLineMarkManager?.clearState();
        this.heatMapMarkManager?.clearState();
        this.schiffPitchforkMarkManager?.clearState();
    }

    public setSchiffPitchforkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.schiffPitchforkMarkManager) return;
        const newState = this.schiffPitchforkMarkManager.setSchiffPitchforkMode();
        charLayer.setState({
            isSchiffPitchforkMode: newState.isSchiffPitchforkMode,
            schiffPitchforkHandlePoint: newState.schiffPitchforkHandlePoint,
            schiffPitchforkBaseStartPoint: newState.schiffPitchforkBaseStartPoint,
            currentSchiffPitchfork: newState.currentSchiffPitchfork,
            isSchiffPitchforkDragging: newState.isDragging,
            schiffPitchforkDragTarget: newState.dragTarget,
            currentMarkMode: MarkType.SchiffPitchfork
        });
    };

    public setHeatMapMode = (charLayer: ChartLayer) => {
        this.clearAllMarkMode(charLayer);
        if (!this.heatMapMarkManager) return;
        const newState = this.heatMapMarkManager.setHeatMapMode();
        charLayer.setState({
            isHeatMapMode: newState.isHeatMapMode,
            heatMapStartPoint: newState.heatMapStartPoint,
            currentHeatMap: newState.currentHeatMap,
            isDragging: newState.isDragging,
            dragTarget: newState.dragTarget,
            dragPoint: newState.dragPoint,
            heatMapDrawingPhase: newState.drawingPhase,
            heatMapAdjustingMode: newState.adjustingMode,
            currentMarkMode: MarkType.HeatMap
        });
    };

    public clearAllMarkMode = (charLayer: ChartLayer) => {
        this.clearAllMarkManagerState();
        charLayer.setState({
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
            selectedTextEditMark: null,
            selectedGraphMark: null,
            selectedTableMark: null,
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

            // time range mark state
            timeRangeMarkStartPoint: null,
            currentTimeRangeMark: null,
            isTimeRangeMarkMode: false,
            // price range mark state
            priceRangeMarkStartPoint: null,
            currentPriceRangeMark: null,
            isPriceRangeMarkMode: false,
            // time price range mark state
            timePriceRangeMarkStartPoint: null,
            currentTimePriceRangeMark: null,
            isTimePriceRangeMarkMode: false,
            // pencil mark state
            isPencilMode: false,
            isPencilDrawing: false,
            currentPencilMark: null,
            pencilPoints: [],
            // pen mark state
            isPenMode: false,
            isPenDrawing: false,
            currentPenMark: null,
            penPoints: [],
            // brush mark state
            isBrushMode: false,
            isBrushDrawing: false,
            currentBrushMark: null,
            brushPoints: [],
            // marker pen mark state
            isMarkerPenMode: false,
            isMarkerPenDrawing: false,
            currentMarkerPen: null,
            markerPenPoints: [],
            // eraser state
            isEraserMode: false,
            isErasing: false,
            eraserHoveredMark: null,
            // thick arrow line state
            thickArrowLineMarkStartPoint: null,
            currentThickArrowLineMark: null,
            // image mark state
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
            // long position mark
            isLongPositionMarkMode: false,
            longPositionMarkStartPoint: null,
            currentLongPositionMark: null,
            longPositionDrawingPhase: 'none',
            isLongPositionDragging: false,
            dragTarget: null,
            dragPoint: null,
            adjustingMode: null,
            adjustStartData: null,
            // short position mark
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
            // MockKLine mark state
            isMockKLineMarkMode: false,
            mockKLineMarkStartPoint: null,
            currentMockKLineMark: null,
            isMockKLineDragging: false,
            mockKLineDragTarget: null,
            mockKLineDragPoint: null,
            // heat map mark
            isHeatMapMode: false,
            heatMapStartPoint: null,
            currentHeatMap: null,
            heatMapDrawingPhase: 'none',
            isHeatMapDragging: false,
            heatMapDragTarget: null,
            heatMapDragPoint: null,
            heatMapAdjustingMode: null,
            // clear schiff pitch fork mark state
            isSchiffPitchforkMode: false,
            schiffPitchforkHandlePoint: null,
            schiffPitchforkBaseStartPoint: null,
            currentSchiffPitchfork: null,
            isSchiffPitchforkDragging: false,
            schiffPitchforkDragTarget: null,
            schiffPitchforkDragPoint: null,
            schiffPitchforkDrawingPhase: 'none',
            schiffPitchforkAdjustingMode: null,
        });
    };

    public getDrawingStepFromPhase = (phase: 'firstPoint' | 'secondPoint' | 'widthAdjust' | 'none'): number => {
        switch (phase) {
            case 'firstPoint': return 1;
            case 'secondPoint': return 2;
            case 'widthAdjust': return 3;
            case 'none': return 0;
            default: return 0;
        }
    };

    public deleteMark = (markType: MarkType, iGraph: IGraph) => {
        switch (markType) {
            case MarkType.LineSegment:
                this.lineSegmentMarkManager?.removeLineSegmentMark(iGraph as LineSegmentMark);
                break;
            case MarkType.ArrowLine:
                this.arrowLineMarkManager?.removeArrowLineMark(iGraph as ArrowLineMark);
                break;
            case MarkType.ThickArrowLine:
                this.thickArrowLineMarkManager?.removeThickArrowLineMark(iGraph as ThickArrowLineMark);
                break;
            case MarkType.HorizontalLine:
                this.axisLineMarkManager?.removeHorizontalLine(iGraph as HorizontalLineMark);
                break;
            case MarkType.VerticalLine:
                this.axisLineMarkManager?.removeVerticalLine(iGraph as VerticalLineMark);
                break;
            case MarkType.ParallelChannel:
                this.parallelChannelMarkManager?.removeParallelChannelMark(iGraph as ParallelChannelMark);
                break;
            case MarkType.LinearRegressionChannel:
                this.linearRegressionChannelMarkManager?.removeLinearRegressionChannelMark(iGraph as LinearRegressionChannelMark);
                break;
            case MarkType.EquidistantChannel:
                this.equidistantChannelMarkManager?.removeEquidistantChannelMark(iGraph as EquidistantChannelMark);
                break;
            case MarkType.DisjointChannel:
                this.disjointChannelMarkManager?.removeDisjointChannelMark(iGraph as DisjointChannelMark);
                break;
            case MarkType.Pitchfork:
                break;
            case MarkType.AndrewPitchfork:
                this.andrewPitchforkMarkManager?.removeAndrewPitchforkMark(iGraph as AndrewPitchforkMark);
                break;
            case MarkType.EnhancedAndrewPitchfork:
                this.enhancedAndrewPitchforkMarkManager?.removeEnhancedAndrewPitchforkMark(iGraph as EnhancedAndrewPitchforkMark);
                break;
            case MarkType.SchiffPitchfork:
                this.schiffPitchforkMarkManager?.removeSchiffPitchforkMark(iGraph as SchiffPitchforkMark);
                break;
            case MarkType.Rectangle:
                this.rectangleMarkManager?.removeRectangleMark(iGraph as RectangleMark);
                break;
            case MarkType.Circle:
                this.circleMarkManager?.removeCircleMark(iGraph as CircleMark);
                break;
            case MarkType.Ellipse:
                this.ellipseMarkManager?.removeEllipseMark(iGraph as EllipseMark);
                break;
            case MarkType.Sector:
                this.sectorMarkManager?.removeSectorMark(iGraph as SectorMark);
                break;
            case MarkType.Triangle:
                this.triangleMarkManager?.removeTriangleMark(iGraph as TriangleMark);
                break;
            case MarkType.GannFan:
                this.gannFanMarkManager?.removeGannFan(iGraph as GannFanMark);
                break;
            case MarkType.GannBox:
                this.gannBoxMarkManager?.removeGannBox(iGraph as GannBoxMark);
                break;
            case MarkType.GannRectangle:
                this.gannRectangleMarkManager?.removeGannRectangle(iGraph as GannRectangleMark);
                break;
            case MarkType.FibonacciTimeZoon:
                this.fibonacciTimeZoonMarkManager?.removeFibonacciTimeZoonMark(iGraph as FibonacciTimeZoonMark);
                break;
            case MarkType.FibonacciRetracement:
                this.fibonacciRetracementMarkManager?.removeFibonacciRetracementMark(iGraph as FibonacciRetracementMark);
                break;
            case MarkType.FibonacciArc:
                this.fibonacciArcMarkManager?.removeFibonacciArcMark(iGraph as FibonacciArcMark);
                break;
            case MarkType.FibonacciCircle:
                this.fibonacciCircleMarkManager?.removeFibonacciCircleMark(iGraph as FibonacciCircleMark);
                break;
            case MarkType.FibonacciSpiral:
                this.fibonacciSpiralMarkManager?.removeFibonacciSpiralMark(iGraph as FibonacciSpiralMark);
                break;
            case MarkType.FibonacciWedge:
                this.fibonacciWedgeMarkManager?.removeFibonacciWedgeMark(iGraph as FibonacciWedgeMark);
                break;
            case MarkType.FibonacciFan:
                this.fibonacciFanMarkManager?.removeFibonacciFan(iGraph as FibonacciFanMark);
                break;
            case MarkType.FibonacciChannel:
                this.fibonacciChannelMarkManager?.removeFibonacciChannelMark(iGraph as FibonacciChannelMark);
                break;
            case MarkType.FibonacciExtensionBasePrice:
                this.fibonacciExtensionBasePriceMarkManager?.removeFibonacciExtensionBasePriceMark(iGraph as FibonacciExtensionBasePriceMark);
                break;
            case MarkType.FibonacciExtensionBaseTime:
                this.fibonacciExtensionBaseTimeMarkManager?.removeFibonacciExtensionBaseTimeMark(iGraph as FibonacciExtensionBaseTimeMark);
                break;
            case MarkType.Curve:
                this.curveMarkManager?.removeCurveMark(iGraph as CurveMark);
                break;
            case MarkType.DoubleCurve:
                this.doubleCurveMarkManager?.removeDoubleCurveMark(iGraph as DoubleCurveMark);
                break;
            case MarkType.XABCD:
                this.xabcdMarkManager?.removeXABCDMark(iGraph as XABCDMark);
                break;
            case MarkType.HeadAndShoulders:
                this.headAndShouldersMarkManager?.removeHeadAndShouldersMark(iGraph as HeadAndShouldersMark);
                break;
            case MarkType.ABCD:
                this.abcdMarkManager?.removeABCDMark(iGraph as ABCDMark);
                break;
            case MarkType.TriangleABCD:
                this.triangleABCDMarkManager?.removeTriangleABCDMark(iGraph as TriangleABCDMark);
                break;
            case MarkType.Elliott_Impulse:
                this.elliottImpulseMarkManager?.removeElliottImpulseMark(iGraph as ElliottImpulseMark);
                break;
            case MarkType.Elliott_Corrective:
                this.elliottCorrectiveMarkManager?.removeElliottCorrectiveMark(iGraph as ElliottCorrectiveMark);
                break;
            case MarkType.Elliott_Triangle:
                this.elliottTriangleMarkManager?.removeElliottTriangleMark(iGraph as ElliottTriangleMark);
                break;
            case MarkType.Elliott_Double_Combination:
                this.elliottDoubleCombinationMarkManager?.removeElliottDoubleCombinationMark(iGraph as ElliottDoubleCombinationMark);
                break;
            case MarkType.Elliott_Triple_Combination:
                this.elliottTripleCombinationMarkManager?.removeElliottTripleCombinationMark(iGraph as ElliottTripleCombinationMark);
                break;
            case MarkType.TimeRange:
                this.timeRangeMarkManager?.removeTimeRangeMark(iGraph as TimeRangeMark);
                break;
            case MarkType.PriceRange:
                this.priceRangeMarkManager?.removePriceRangeMark(iGraph as PriceRangeMark);
                break;
            case MarkType.TimePriceRange:
                this.timePriceRangeMarkManager?.removeTimePriceRangeMark(iGraph as TimePriceRangeMark);
                break;
            case MarkType.Pencil:
                this.pencilMarkManager?.removePencilMark(iGraph as PencilMark);
                break;
            case MarkType.Pen:
                this.penMarkManager?.removePenMark(iGraph as PenMark);
                break;
            case MarkType.Brush:
                this.brushMarkManager?.removeBrushMark(iGraph as BrushMark);
                break;
            case MarkType.MarkerPen:
                this.markerPenMarkManager?.removeMarkerPenMark(iGraph as MarkerPenMark);
                break;
            case MarkType.Eraser:
                break;
            case MarkType.Image:
                this.imageMarkManager?.removeImageMark(iGraph as ImageMark);
                break;
            case MarkType.Table:
                this.tableMarkManager?.removeTableMark(iGraph as TableMark);
                break;
            case MarkType.LongPosition:
                this.longPositionMarkManager?.removeLongPositionMark(iGraph as LongPositionMark);
                break;
            case MarkType.ShortPosition:
                this.shortPositionMarkManager?.removeShortPositionMark(iGraph as ShortPositionMark);
                break;
            case MarkType.PriceLabel:
                this.priceLabelMarkManager?.removePriceLabelMark(iGraph as PriceLabelMark);
                break;
            case MarkType.Flag:
                this.flagMarkManager?.removeFlagMark(iGraph as FlagMark);
                break;
            case MarkType.PriceNote:
                this.priceNoteMarkManager?.removePriceNoteMark(iGraph as PriceNoteMark);
                break;
            case MarkType.SignPost:
                this.signpostMarkManager?.removeSignPostMark(iGraph as SignPostMark);
                break;
            case MarkType.Emoji:
                this.emojiMarkManager?.removeEmojiMark(iGraph as EmojiMark);
                break;
            case MarkType.Pin:
                this.pinMarkManager?.removePinMark(iGraph as PinMark);
                break;
            case MarkType.BubbleBox:
                this.bubbleBoxMarkManager?.removeBubbleBoxMark(iGraph as BubbleBoxMark);
                break;
            case MarkType.TextEdit:
                this.textEditMarkManager?.removeTextEditMark(iGraph as TextEditMark);
                break;
            case MarkType.MockKLine:
                this.mockKLineMarkManager?.removeMockKLineMark(iGraph as MockKLineMark);
                break;
            case MarkType.HeatMap:
                break;
            default:
                break;
        }
    };

    public deleteAllMark = () => {
        this.lineSegmentMarkManager?.getLineSegmentMarks().forEach(mark => {
            this.lineSegmentMarkManager?.removeLineSegmentMark(mark);
        });

        this.arrowLineMarkManager?.getArrowLineMarks().forEach(mark => {
            this.arrowLineMarkManager?.removeArrowLineMark(mark);
        });

        this.thickArrowLineMarkManager?.getThickArrowLineMarks().forEach(mark => {
            this.thickArrowLineMarkManager?.removeThickArrowLineMark(mark);
        });

        this.axisLineMarkManager?.getHorizontalLines().forEach(mark => {
            this.axisLineMarkManager?.removeHorizontalLine(mark);
        });

        this.axisLineMarkManager?.getVerticalLines().forEach(mark => {
            this.axisLineMarkManager?.removeVerticalLine(mark);
        });

        this.parallelChannelMarkManager?.getParallelChannelMarks().forEach(mark => {
            this.parallelChannelMarkManager?.removeParallelChannelMark(mark);
        });

        this.linearRegressionChannelMarkManager?.getLinearRegressionChannelMarks().forEach(mark => {
            this.linearRegressionChannelMarkManager?.removeLinearRegressionChannelMark(mark);
        });

        this.equidistantChannelMarkManager?.getEquidistantChannelMarks().forEach(mark => {
            this.equidistantChannelMarkManager?.removeEquidistantChannelMark(mark);
        });

        this.disjointChannelMarkManager?.getDisjointChannelMarks().forEach(mark => {
            this.disjointChannelMarkManager?.removeDisjointChannelMark(mark);
        });

        this.andrewPitchforkMarkManager?.getAndrewPitchforkMarks().forEach(mark => {
            this.andrewPitchforkMarkManager?.removeAndrewPitchforkMark(mark);
        });

        this.enhancedAndrewPitchforkMarkManager?.getEnhancedAndrewPitchforkMarks().forEach(mark => {
            this.enhancedAndrewPitchforkMarkManager?.removeEnhancedAndrewPitchforkMark(mark);
        });

        this.schiffPitchforkMarkManager?.getSchiffPitchforkMarks().forEach(mark => {
            this.schiffPitchforkMarkManager?.removeSchiffPitchforkMark(mark);
        });

        this.rectangleMarkManager?.getRectangleMarks().forEach(mark => {
            this.rectangleMarkManager?.removeRectangleMark(mark);
        });

        this.circleMarkManager?.getCircleMarks().forEach(mark => {
            this.circleMarkManager?.removeCircleMark(mark);
        });

        this.ellipseMarkManager?.getEllipseMarks().forEach(mark => {
            this.ellipseMarkManager?.removeEllipseMark(mark);
        });

        this.sectorMarkManager?.getSectorMarks().forEach(mark => {
            this.sectorMarkManager?.removeSectorMark(mark);
        });

        this.triangleMarkManager?.getTriangleMarks().forEach(mark => {
            this.triangleMarkManager?.removeTriangleMark(mark);
        });

        this.gannFanMarkManager?.getGannFans().forEach(mark => {
            this.gannFanMarkManager?.removeGannFan(mark);
        });

        this.gannBoxMarkManager?.getGannBoxes().forEach(mark => {
            this.gannBoxMarkManager?.removeGannBox(mark);
        });

        this.gannRectangleMarkManager?.getGannRectangles().forEach(mark => {
            this.gannRectangleMarkManager?.removeGannRectangle(mark);
        });

        this.fibonacciTimeZoonMarkManager?.getFibonacciTimeZoonMarks().forEach(mark => {
            this.fibonacciTimeZoonMarkManager?.removeFibonacciTimeZoonMark(mark);
        });

        this.fibonacciRetracementMarkManager?.getFibonacciRetracementMarks().forEach(mark => {
            this.fibonacciRetracementMarkManager?.removeFibonacciRetracementMark(mark);
        });

        this.fibonacciArcMarkManager?.getFibonacciArcMarks().forEach(mark => {
            this.fibonacciArcMarkManager?.removeFibonacciArcMark(mark);
        });

        this.fibonacciCircleMarkManager?.getFibonacciCircleMarks().forEach(mark => {
            this.fibonacciCircleMarkManager?.removeFibonacciCircleMark(mark);
        });

        this.fibonacciSpiralMarkManager?.getFibonacciSpiralMarks().forEach(mark => {
            this.fibonacciSpiralMarkManager?.removeFibonacciSpiralMark(mark);
        });

        this.fibonacciWedgeMarkManager?.getFibonacciWedgeMarks().forEach(mark => {
            this.fibonacciWedgeMarkManager?.removeFibonacciWedgeMark(mark);
        });

        this.fibonacciFanMarkManager?.getFibonacciFans().forEach(mark => {
            this.fibonacciFanMarkManager?.removeFibonacciFan(mark);
        });

        this.fibonacciChannelMarkManager?.getFibonacciChannelMarks().forEach(mark => {
            this.fibonacciChannelMarkManager?.removeFibonacciChannelMark(mark);
        });

        this.fibonacciExtensionBasePriceMarkManager?.getFibonacciExtensionBasePriceMarks().forEach(mark => {
            this.fibonacciExtensionBasePriceMarkManager?.removeFibonacciExtensionBasePriceMark(mark);
        });

        this.fibonacciExtensionBaseTimeMarkManager?.getFibonacciExtensionBaseTimeMarks().forEach(mark => {
            this.fibonacciExtensionBaseTimeMarkManager?.removeFibonacciExtensionBaseTimeMark(mark);
        });

        this.curveMarkManager?.getCurveMarks().forEach(mark => {
            this.curveMarkManager?.removeCurveMark(mark);
        });

        this.doubleCurveMarkManager?.getDoubleCurveMarks().forEach(mark => {
            this.doubleCurveMarkManager?.removeDoubleCurveMark(mark);
        });

        this.xabcdMarkManager?.getXABCDMarks().forEach(mark => {
            this.xabcdMarkManager?.removeXABCDMark(mark);
        });

        this.headAndShouldersMarkManager?.getHeadAndShouldersMarks().forEach(mark => {
            this.headAndShouldersMarkManager?.removeHeadAndShouldersMark(mark);
        });

        this.abcdMarkManager?.getABCDMarks().forEach(mark => {
            this.abcdMarkManager?.removeABCDMark(mark);
        });

        this.triangleABCDMarkManager?.getTriangleABCDMarks().forEach(mark => {
            this.triangleABCDMarkManager?.removeTriangleABCDMark(mark);
        });

        this.elliottImpulseMarkManager?.getElliottImpulseMarks().forEach(mark => {
            this.elliottImpulseMarkManager?.removeElliottImpulseMark(mark);
        });

        this.elliottCorrectiveMarkManager?.getElliottCorrectiveMarks().forEach(mark => {
            this.elliottCorrectiveMarkManager?.removeElliottCorrectiveMark(mark);
        });

        this.elliottTriangleMarkManager?.getElliottTriangleMarks().forEach(mark => {
            this.elliottTriangleMarkManager?.removeElliottTriangleMark(mark);
        });

        this.elliottDoubleCombinationMarkManager?.getElliottDoubleCombinationMarks().forEach(mark => {
            this.elliottDoubleCombinationMarkManager?.removeElliottDoubleCombinationMark(mark);
        });

        this.elliottTripleCombinationMarkManager?.getElliottTripleCombinationMarks().forEach(mark => {
            this.elliottTripleCombinationMarkManager?.removeElliottTripleCombinationMark(mark);
        });

        this.timeRangeMarkManager?.getTimeRangeMarks().forEach(mark => {
            this.timeRangeMarkManager?.removeTimeRangeMark(mark);
        });

        this.priceRangeMarkManager?.getPriceRangeMarks().forEach(mark => {
            this.priceRangeMarkManager?.removePriceRangeMark(mark);
        });

        this.timePriceRangeMarkManager?.getTimePriceRangeMarks().forEach(mark => {
            this.timePriceRangeMarkManager?.removeTimePriceRangeMark(mark);
        });

        this.pencilMarkManager?.getPencilMarks().forEach(mark => {
            this.pencilMarkManager?.removePencilMark(mark);
        });

        this.penMarkManager?.getPenMarks().forEach(mark => {
            this.penMarkManager?.removePenMark(mark);
        });

        this.brushMarkManager?.getBrushMarks().forEach(mark => {
            this.brushMarkManager?.removeBrushMark(mark);
        });

        this.markerPenMarkManager?.getMarkerPenMarks().forEach(mark => {
            this.markerPenMarkManager?.removeMarkerPenMark(mark);
        });

        this.imageMarkManager?.getImageMarks().forEach(mark => {
            this.imageMarkManager?.removeImageMark(mark);
        });

        this.tableMarkManager?.getTableMarks().forEach(mark => {
            this.tableMarkManager?.removeTableMark(mark);
        });

        this.longPositionMarkManager?.getLongPositionMarks().forEach(mark => {
            this.longPositionMarkManager?.removeLongPositionMark(mark);
        });

        this.shortPositionMarkManager?.getShortPositionMarks().forEach(mark => {
            this.shortPositionMarkManager?.removeShortPositionMark(mark);
        });

        this.priceLabelMarkManager?.getPriceLabelMarks().forEach(mark => {
            this.priceLabelMarkManager?.removePriceLabelMark(mark);
        });

        this.flagMarkManager?.getFlagMarks().forEach(mark => {
            this.flagMarkManager?.removeFlagMark(mark);
        });

        this.priceNoteMarkManager?.getPriceNoteMarks().forEach(mark => {
            this.priceNoteMarkManager?.removePriceNoteMark(mark);
        });

        this.signpostMarkManager?.getSignPostMarks().forEach(mark => {
            this.signpostMarkManager?.removeSignPostMark(mark);
        });

        this.emojiMarkManager?.getEmojiMarks().forEach(mark => {
            this.emojiMarkManager?.removeEmojiMark(mark);
        });

        this.pinMarkManager?.getPinMarks().forEach(mark => {
            this.pinMarkManager?.removePinMark(mark);
        });

        this.bubbleBoxMarkManager?.getBubbleBoxMarks().forEach(mark => {
            this.bubbleBoxMarkManager?.removeBubbleBoxMark(mark);
        });

        this.textEditMarkManager?.getTextEditMarks().forEach(mark => {
            this.textEditMarkManager?.removeTextEditMark(mark);
        });

        this.mockKLineMarkManager?.getMockKLineMarks().forEach(mark => {
            this.mockKLineMarkManager?.removeMockKLineMark(mark);
        });

        this.heatMapMarkManager?.getHeatMapMarks().forEach(mark => {
            this.heatMapMarkManager?.removeHeatMapMark(mark);
        });
    }

    public showAllMarks(): void {
        this.lineSegmentMarkManager?.showAllMarks();
        this.arrowLineMarkManager?.showAllMarks();
        this.thickArrowLineMarkManager?.showAllMarks();
        this.axisLineMarkManager?.showAllMarks();
        this.axisLineMarkManager?.showAllMarks();
        this.parallelChannelMarkManager?.showAllMarks();
        this.linearRegressionChannelMarkManager?.showAllMarks();
        this.equidistantChannelMarkManager?.showAllMarks();
        this.disjointChannelMarkManager?.showAllMarks();
        this.andrewPitchforkMarkManager?.showAllMarks();
        this.enhancedAndrewPitchforkMarkManager?.showAllMarks();
        this.schiffPitchforkMarkManager?.showAllMarks();
        this.rectangleMarkManager?.showAllMarks();
        this.circleMarkManager?.showAllMarks();
        this.ellipseMarkManager?.showAllMarks();
        this.sectorMarkManager?.showAllMarks();
        this.triangleMarkManager?.showAllMarks();
        this.gannFanMarkManager?.showAllMarks();
        this.gannBoxMarkManager?.showAllMarks();
        this.gannRectangleMarkManager?.showAllMarks();
        this.fibonacciTimeZoonMarkManager?.showAllMarks();
        this.fibonacciRetracementMarkManager?.showAllMarks();
        this.fibonacciArcMarkManager?.showAllMarks();
        this.fibonacciCircleMarkManager?.showAllMarks();
        this.fibonacciSpiralMarkManager?.showAllMarks();
        this.fibonacciWedgeMarkManager?.showAllMarks();
        this.fibonacciFanMarkManager?.showAllMarks();
        this.fibonacciChannelMarkManager?.showAllMarks();
        this.fibonacciExtensionBasePriceMarkManager?.showAllMarks();
        this.fibonacciExtensionBaseTimeMarkManager?.showAllMarks();
        this.curveMarkManager?.showAllMarks();
        this.doubleCurveMarkManager?.showAllMarks();
        this.xabcdMarkManager?.showAllMarks();
        this.headAndShouldersMarkManager?.showAllMarks();
        this.abcdMarkManager?.showAllMarks();
        this.triangleABCDMarkManager?.showAllMarks();
        this.elliottImpulseMarkManager?.showAllMarks();
        this.elliottCorrectiveMarkManager?.showAllMarks();
        this.elliottTriangleMarkManager?.showAllMarks();
        this.elliottDoubleCombinationMarkManager?.showAllMarks();
        this.elliottTripleCombinationMarkManager?.showAllMarks();
        this.timeRangeMarkManager?.showAllMarks();
        this.priceRangeMarkManager?.showAllMarks();
        this.timePriceRangeMarkManager?.showAllMarks();
        this.pencilMarkManager?.showAllMarks();
        this.penMarkManager?.showAllMarks();
        this.brushMarkManager?.showAllMarks();
        this.markerPenMarkManager?.showAllMarks();
        this.imageMarkManager?.showAllMarks();
        // this.tableMarkManager?.showAllMarks();
        this.longPositionMarkManager?.showAllMarks();
        this.shortPositionMarkManager?.showAllMarks();
        this.priceLabelMarkManager?.showAllMarks();
        this.flagMarkManager?.showAllMarks();
        this.priceNoteMarkManager?.showAllMarks();
        this.signpostMarkManager?.showAllMarks();
        this.emojiMarkManager?.showAllMarks();
        this.pinMarkManager?.showAllMarks();
        this.bubbleBoxMarkManager?.showAllMarks();
        this.textEditMarkManager?.showAllMarks();
        this.mockKLineMarkManager?.showAllMarks();
        this.heatMapMarkManager?.showAllMarks();
    }

    public hideAllMarks(): void {
        this.lineSegmentMarkManager?.hideAllMarks();
        this.arrowLineMarkManager?.hideAllMarks();
        this.thickArrowLineMarkManager?.hideAllMarks();
        this.axisLineMarkManager?.hideAllMarks();
        this.axisLineMarkManager?.hideAllMarks();
        this.parallelChannelMarkManager?.hideAllMarks();
        this.linearRegressionChannelMarkManager?.hideAllMarks();
        this.equidistantChannelMarkManager?.hideAllMarks();
        this.disjointChannelMarkManager?.hideAllMarks();
        this.andrewPitchforkMarkManager?.hideAllMarks();
        this.enhancedAndrewPitchforkMarkManager?.hideAllMarks();
        this.schiffPitchforkMarkManager?.hideAllMarks();
        this.rectangleMarkManager?.hideAllMarks();
        this.circleMarkManager?.hideAllMarks();
        this.ellipseMarkManager?.hideAllMarks();
        this.sectorMarkManager?.hideAllMarks();
        this.triangleMarkManager?.hideAllMarks();
        this.gannFanMarkManager?.hideAllMarks();
        this.gannBoxMarkManager?.hideAllMarks();
        this.gannRectangleMarkManager?.hideAllMarks();
        this.fibonacciTimeZoonMarkManager?.hideAllMarks();
        this.fibonacciRetracementMarkManager?.hideAllMarks();
        this.fibonacciArcMarkManager?.hideAllMarks();
        this.fibonacciCircleMarkManager?.hideAllMarks();
        this.fibonacciSpiralMarkManager?.hideAllMarks();
        this.fibonacciWedgeMarkManager?.hideAllMarks();
        this.fibonacciFanMarkManager?.hideAllMarks();
        this.fibonacciChannelMarkManager?.hideAllMarks();
        this.fibonacciExtensionBasePriceMarkManager?.hideAllMarks();
        this.fibonacciExtensionBaseTimeMarkManager?.hideAllMarks();
        this.curveMarkManager?.hideAllMarks();
        this.doubleCurveMarkManager?.hideAllMarks();
        this.xabcdMarkManager?.hideAllMarks();
        this.headAndShouldersMarkManager?.hideAllMarks();
        this.abcdMarkManager?.hideAllMarks();
        this.triangleABCDMarkManager?.hideAllMarks();
        this.elliottImpulseMarkManager?.hideAllMarks();
        this.elliottCorrectiveMarkManager?.hideAllMarks();
        this.elliottTriangleMarkManager?.hideAllMarks();
        this.elliottDoubleCombinationMarkManager?.hideAllMarks();
        this.elliottTripleCombinationMarkManager?.hideAllMarks();
        this.timeRangeMarkManager?.hideAllMarks();
        this.priceRangeMarkManager?.hideAllMarks();
        this.timePriceRangeMarkManager?.hideAllMarks();
        this.pencilMarkManager?.hideAllMarks();
        this.penMarkManager?.hideAllMarks();
        this.brushMarkManager?.hideAllMarks();
        this.markerPenMarkManager?.hideAllMarks();
        this.imageMarkManager?.hideAllMarks();
        // this.tableMarkManager?.hideAllMarks();
        this.longPositionMarkManager?.hideAllMarks();
        this.shortPositionMarkManager?.hideAllMarks();
        this.priceLabelMarkManager?.hideAllMarks();
        this.flagMarkManager?.hideAllMarks();
        this.priceNoteMarkManager?.hideAllMarks();
        this.signpostMarkManager?.hideAllMarks();
        this.emojiMarkManager?.hideAllMarks();
        this.pinMarkManager?.hideAllMarks();
        this.bubbleBoxMarkManager?.hideAllMarks();
        this.textEditMarkManager?.hideAllMarks();
        this.mockKLineMarkManager?.hideAllMarks();
        this.heatMapMarkManager?.hideAllMarks();
    }

    // close all brush tools.
    public closeAllBrushTools = (chartLayer: ChartLayer) => {
        if (this.pencilMarkManager && chartLayer.state.currentMarkMode === MarkType.Pencil) {
            const newState = this.pencilMarkManager.closeBrush();
            chartLayer.setState({
                isPencilMode: newState.isPencilMode,
                isDrawing: newState.isDrawing,
                currentPencilMark: newState.currentPencilMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.penMarkManager && chartLayer.state.currentMarkMode === MarkType.Pen) {
            const newState = this.penMarkManager.closeBrush();
            chartLayer.setState({
                isPenMode: newState.isPenMode,
                isDrawing: newState.isDrawing,
                currentPenMark: newState.currentPenMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.brushMarkManager && chartLayer.state.currentMarkMode === MarkType.Brush) {
            const newState = this.brushMarkManager.closeBrush();
            chartLayer.setState({
                isBrushMode: newState.isBrushMode,
                isDrawing: newState.isDrawing,
                currentBrushMark: newState.currentBrushMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.markerPenMarkManager && chartLayer.state.currentMarkMode === MarkType.MarkerPen) {
            const newState = this.markerPenMarkManager.closeBrush();
            chartLayer.setState({
                isMarkerPenMode: newState.isMarkerPenMarkMode,
                isDrawing: newState.isDrawing,
                currentMarkerPen: newState.currentMarkerPenMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.eraserMarkManager && chartLayer.state.currentMarkMode === MarkType.Eraser) {
            const newState = this.eraserMarkManager.closeBrush();
            chartLayer.setState({
                isEraserMode: newState.isEraserMode,
                isErasing: newState.isErasing,
                eraserHoveredMark: null
            });
        }
    }
}