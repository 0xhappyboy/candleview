import { IDeletableMark } from "../Mark/IDeletableMark";
import { ABCDMarkManager } from "../MarkManager/Pattern/ABCDMarkManager";
import { AndrewPitchforkMarkManager } from "../MarkManager/Fork/AndrewPitchforkMarkManager";
import { CircleMarkManager } from "../MarkManager/Shape/CircleMarkManager";
import { ImageMarkManager } from "../MarkManager/Content/ImageMarkManager";
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
import { DrawingType, ScriptType } from "../types";
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
import { TimePriceRangeMark } from "../Mark/Range/TimePriceRangeMark";
import { ElliottDoubleCombinationMark } from "../Mark/Pattern/ElliottDoubleCombinationMark";
import { TimeRangeMark } from "../Mark/Range/TimeRangeMark";
import { PriceRangeMark } from "../Mark/Range/PriceRangeMark";
import { PencilMark } from "../Mark/Pen/PencilMark";
import { PenMark } from "../Mark/Pen/PenMark";
import { BrushMark } from "../Mark/Pen/BrushMark";
import { MarkerPenMark } from "../Mark/Pen/MarkerPenMark";
import { TimeEventMarkManager } from "../MarkManager/Script/TimeEventMarkManager";
import { TimeEventMark } from "../Mark/Script/TimeEventMark";
import { PriceEventMarkManager } from "../MarkManager/Script/PriceEventMarkManager";
import { PriceEventMark } from "../Mark/Script/PriceEventMark";
import { Chart } from "./Chart";

export class ChartMarkManager {
    public lineSegmentMarkManager: LineSegmentMarkManager | null = null;
    public axisLineMarkManager: AxisLineMarkManager | null = null;
    public arrowLineMarkManager: ArrowLineMarkManager | null = null;
    public parallelChannelMarkManager: ParallelChannelMarkManager | null = null;
    public currentOperationDrawingType: DrawingType | null = null;
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
    public timeEventMarkManager: TimeEventMarkManager | null = null;
    public priceEventMarkManager: PriceEventMarkManager | null = null;
    constructor() { }

    public initializeEraserMarkManager(chart: Chart) {
        this.eraserMarkManager = new EraserMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: () => {
                if (chart.onCloseDrawing) {
                    chart.onCloseDrawing();
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

    public initializeMarkManager = (chart: Chart) => {
        this.initializeEraserMarkManager(chart);
        this.priceEventMarkManager = new PriceEventMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing,
            onDoubleClick: (id, price, script) => {
                // open script editor
            }
        });

        this.timeEventMarkManager = new TimeEventMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing,
            onDoubleClick: (id, time, script) => {
                // open script editor
            }
        });

        this.schiffPitchforkMarkManager = new SchiffPitchforkMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.heatMapMarkManager = new HeatMapMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });


        this.mockKLineMarkManager = new MockKLineMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing,
        });

        this.textEditMarkManager = new TextEditMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.bubbleBoxMarkManager = new BubbleBoxMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.pinMarkManager = new PinMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.emojiMarkManager = new EmojiMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.signpostMarkManager = new SignPostMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.priceNoteMarkManager = new PriceNoteMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.flagMarkManager = new FlagMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.priceLabelMarkManager = new PriceLabelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.shortPositionMarkManager = new ShortPositionMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.longPositionMarkManager = new LongPositionMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.imageMarkManager = new ImageMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.thickArrowLineMarkManager = new ThickArrowLineMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.markerPenMarkManager = new MarkerPenMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.brushMarkManager = new BrushMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.penMarkManager = new PenMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.pencilMarkManager = new PencilMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.timePriceRangeMarkManager = new TimePriceRangeMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.priceRangeMarkManager = new PriceRangeMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.timeRangeMarkManager = new TimeRangeMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.elliottTripleCombinationMarkManager = new ElliottTripleCombinationMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.elliottDoubleCombinationMarkManager = new ElliottDoubleCombinationMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.elliottTriangleMarkManager = new ElliottTriangleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.elliottCorrectiveMarkManager = new ElliottCorrectiveMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.elliottImpulseMarkManager = new ElliottImpulseMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.triangleABCDMarkManager = new TriangleABCDMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.abcdMarkManager = new ABCDMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.headAndShouldersMarkManager = new HeadAndShouldersMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.xabcdMarkManager = new XABCDMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.doubleCurveMarkManager = new DoubleCurveMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.curveMarkManager = new CurveMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.sectorMarkManager = new SectorMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.fibonacciExtensionBaseTimeMarkManager = new FibonacciExtensionBaseTimeMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });


        this.fibonacciExtensionBasePriceMarkManager = new FibonacciExtensionBasePriceMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.fibonacciChannelMarkManager = new FibonacciChannelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.fibonacciFanMarkManager = new FibonacciFanMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.fibonacciWedgeMarkManager = new FibonacciWedgeMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.fibonacciSpiralMarkManager = new FibonacciSpiralMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.fibonacciCircleMarkManager = new FibonacciCircleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.fibonacciArcMarkManager = new FibonacciArcMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.fibonacciRetracementMarkManager = new FibonacciRetracementMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.fibonacciTimeZoonMarkManager = new FibonacciTimeZoonMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.gannRectangleMarkManager = new GannRectangleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.gannBoxMarkManager = new GannBoxMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.gannFanMarkManager = new GannFanMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.triangleMarkManager = new TriangleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.ellipseMarkManager = new EllipseMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.rectangleMarkManager = new RectangleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });

        this.enhancedAndrewPitchforkMarkManager = new EnhancedAndrewPitchforkMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.andrewPitchforkMarkManager = new AndrewPitchforkMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.disjointChannelMarkManager = new DisjointChannelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.lineSegmentMarkManager = new LineSegmentMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.axisLineMarkManager = new AxisLineMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.arrowLineMarkManager = new ArrowLineMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.parallelChannelMarkManager = new ParallelChannelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.linearRegressionChannelMarkManager = new LinearRegressionChannelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.equidistantChannelMarkManager = new EquidistantChannelMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });
        this.circleMarkManager = new CircleMarkManager({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: chart.onCloseDrawing
        });
    }

    public initializeMarkManagerProps = (chart: Chart) => {

        this.priceEventMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
        });

        this.timeEventMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
        });

        this.schiffPitchforkMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
        });

        this.heatMapMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
        });

        this.mockKLineMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart,
        });

        this.textEditMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.bubbleBoxMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.pinMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.emojiMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.signpostMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.priceNoteMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });


        this.flagMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.priceLabelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.longPositionMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.shortPositionMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.imageMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.thickArrowLineMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.markerPenMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.brushMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.penMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.pencilMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.timePriceRangeMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.priceRangeMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.timeRangeMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.elliottTripleCombinationMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.elliottDoubleCombinationMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.elliottTriangleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.elliottCorrectiveMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.elliottImpulseMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.triangleABCDMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.abcdMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.headAndShouldersMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.xabcdMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.doubleCurveMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.curveMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.sectorMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.fibonacciExtensionBaseTimeMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.fibonacciExtensionBasePriceMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.fibonacciChannelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.fibonacciFanMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.fibonacciWedgeMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.fibonacciSpiralMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.fibonacciCircleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.fibonacciArcMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.fibonacciRetracementMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.fibonacciTimeZoonMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.gannRectangleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.gannBoxMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.gannFanMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.triangleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.ellipseMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.circleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.rectangleMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.enhancedAndrewPitchforkMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });

        this.andrewPitchforkMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.disjointChannelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.lineSegmentMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.arrowLineMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.parallelChannelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.linearRegressionChannelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
        });
        this.equidistantChannelMarkManager?.updateProps({
            chartSeries: chart.hiddenBaseSeries,
            chart: chart.chart
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
        this.timeEventMarkManager?.destroy();
        this.priceEventMarkManager?.destroy();
    }

    public setMockKLineMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.mockKLineMarkManager) return;
        const newState = this.mockKLineMarkManager.setMockKLineMarkMode();
        chart.currentDrawingType = DrawingType.MockKLine;
        chart.drawingManager?.updateState({
            isMockKLineMarkMode: newState.isMockKLineMarkMode,
            mockKLineMarkStartPoint: newState.mockKLineMarkStartPoint,
            currentMockKLineMark: newState.currentMockKLineMark,
            isMockKLineDragging: newState.isDragging,
            mockKLineDragTarget: newState.dragTarget,
            mockKLineDragPoint: newState.dragPoint,
        });
    };

    public setTextEditMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.textEditMarkManager) return;
        const newState = this.textEditMarkManager.setTextEditMarkMode();
        chart.currentDrawingType = DrawingType.TextEdit;
        chart.drawingManager?.updateState({
            isTextEditMarkMode: newState.isTextEditMarkMode,
            isTextEditDragging: newState.isDragging,
            textEditDragTarget: newState.dragTarget,
        });
    };

    public setBubbleBoxMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.bubbleBoxMarkManager) return;
        const newState = this.bubbleBoxMarkManager.setBubbleBoxMarkMode();
        chart.currentDrawingType = DrawingType.BubbleBox;
        chart.drawingManager?.updateState({
            isBubbleBoxMarkMode: newState.isBubbleBoxMarkMode,
            bubbleBoxMarkPoints: newState.bubbleBoxMarkPoints,
            currentBubbleBoxMark: newState.currentBubbleBoxMark,
            isBubbleBoxDragging: newState.isDragging,
            bubbleBoxDragTarget: newState.dragTarget,
            bubbleBoxDragType: newState.dragType,
        });
    };

    public setPinMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.pinMarkManager) return;
        const newState = this.pinMarkManager.setPinMarkMode();
        chart.currentDrawingType = DrawingType.Pin;
        chart.drawingManager?.updateState({
            isPinMarkMode: newState.isPinMarkMode,
            pinMarkPoint: newState.pinMarkPoint,
            currentPinMark: newState.currentPinMark,
            isPinDragging: newState.isDragging,
            pinDragTarget: newState.dragTarget,
        });
    };

    public setEmojiMarkMode = (chart: Chart, emoji: string) => {
        this.clearAllMarkMode(chart);
        if (!this.emojiMarkManager) return;
        const newState = this.emojiMarkManager.setEmojiMarkMode(emoji);
        chart.currentDrawingType = DrawingType.Emoji;
        chart.drawingManager?.updateState({
            isEmojiMarkMode: newState.isEmojiMarkMode,
            emojiMarkStartPoint: newState.emojiMarkStartPoint,
            currentEmojiMark: newState.currentEmojiMark,
            isEmojiDragging: newState.isDragging,
            emojiDragTarget: newState.dragTarget,
            emojiDragPoint: newState.dragPoint,
        });
    };

    public setSignpostMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.signpostMarkManager) return;
        const newState = this.signpostMarkManager.setSignPostMarkMode();
        chart.currentDrawingType = DrawingType.SignPost;
        chart.drawingManager?.updateState({
            isSignpostMarkMode: newState.isSignPostMarkMode,
            signpostMarkPoint: newState.signPostMarkPoint,
            currentSignpostMark: newState.currentSignPostMark,
            isSignpostDragging: newState.isDragging,
            signpostDragTarget: newState.dragTarget,
        });
    };

    public setPriceNoteMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.priceNoteMarkManager) return;
        const newState = this.priceNoteMarkManager.setPriceNoteMarkMode();
        chart.currentDrawingType = DrawingType.PriceNote;

        chart.drawingManager?.updateState({
            isPriceNoteMarkMode: newState.isPriceNoteMarkMode,
            priceNoteMarkStartPoint: newState.priceNoteMarkStartPoint,
            currentPriceNoteMark: newState.currentPriceNoteMark,
            isPriceNoteDragging: newState.isDragging,
            priceNoteDragTarget: newState.dragTarget,
            priceNoteDragPoint: newState.dragPoint,
        });
    };

    public setFlagMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.flagMarkManager) return;
        const newState = this.flagMarkManager.setFlagMarkMode();
        chart.currentDrawingType = DrawingType.Flag;

        chart.drawingManager?.updateState({
            isFlagMarkMode: newState.isFlagMarkMode,
            flagMarkPoint: newState.flagMarkPoint,
            currentFlagMark: newState.currentFlagMark,
            isFlagDragging: newState.isDragging,
            flagDragTarget: newState.dragTarget,
        });
    };

    public setPriceLabelMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.priceLabelMarkManager) return;
        const newState = this.priceLabelMarkManager.setPriceLabelMarkMode();
        chart.currentDrawingType = DrawingType.PriceLabel;
        chart.drawingManager?.updateState({
            isPriceLabelMarkMode: newState.isPriceLabelMarkMode,
            priceLabelMarkPoint: newState.priceLabelMarkPoint,
            currentPriceLabelMark: newState.currentPriceLabelMark,
            isPriceLabelDragging: newState.isDragging,
            priceLabelDragTarget: newState.dragTarget,
        });
    };

    public setShortPositionMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.shortPositionMarkManager) return;
        const newState = this.shortPositionMarkManager.setShortPositionMarkMode();
        chart.currentDrawingType = DrawingType.ShortPosition;
        chart.drawingManager?.updateState({
            isShortPositionMarkMode: newState.isShortPositionMarkMode,
            shortPositionMarkStartPoint: newState.shortPositionMarkStartPoint,
            currentShortPositionMark: newState.currentShortPositionMark,
            isShortPositionDragging: newState.isDragging,
            shortPositionDragTarget: newState.dragTarget,
            shortPositionDragPoint: newState.dragPoint,
            shortPositionDrawingPhase: newState.drawingPhase,
            shortPositionAdjustingMode: newState.adjustingMode,
        });
    };

    public setLongPositionMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.longPositionMarkManager) return;
        const newState = this.longPositionMarkManager.setLongPositionMarkMode();
        chart.currentDrawingType = DrawingType.LongPosition;
        chart.drawingManager?.updateState({
            isLongPositionMarkMode: newState.isLongPositionMarkMode,
            longPositionMarkStartPoint: newState.longPositionMarkStartPoint,
            currentLongPositionMark: newState.currentLongPositionMark,
            isDragging: newState.isDragging,
            dragTarget: newState.dragTarget,
            dragPoint: newState.dragPoint,
            longPositionDrawingPhase: newState.drawingPhase,
            adjustingMode: newState.adjustingMode,
        });
    };

    public setThickArrowLineMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.thickArrowLineMarkManager) return;
        const newState = this.thickArrowLineMarkManager.setThickArrowLineMarkMode();
        chart.currentDrawingType = DrawingType.ThickArrowLine;
        chart.drawingManager?.updateState({
            thickArrowLineMarkStartPoint: newState.thickArrowLineMarkStartPoint,
            currentThickArrowLineMark: newState.currentThickArrowLineMark,
        });
    };

    public setEraserMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (this.eraserMarkManager) {
            this.registerAllDeletableMarks();
            this.eraserMarkManager.setEraserMode();
            chart.currentDrawingType = DrawingType.Eraser;
            chart.drawingManager?.updateState({
                isEraserMode: true,
                isErasing: false,
                eraserHoveredMark: null
            });
        }
    };

    public setMarkerPenMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.markerPenMarkManager) return;
        const newState = this.markerPenMarkManager.setMarkerPenMarkMode();
        chart.currentDrawingType = DrawingType.MarkerPen;
        chart.drawingManager?.updateState({
            isMarkerPenMode: newState.isMarkerPenMarkMode,
            isMarkerPenDrawing: newState.isDrawing,
            currentMarkerPen: newState.currentMarkerPenMark,
        });
    };

    public setBrushMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.brushMarkManager) return;
        const newState = this.brushMarkManager.setBrushMode();
        chart.currentDrawingType = DrawingType.Brush;
        chart.drawingManager?.updateState({
            isBrushMode: newState.isBrushMode,
            isBrushDrawing: newState.isDrawing,
            currentBrushMark: newState.currentBrushMark,
        });
    };

    public setPenMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.penMarkManager) return;
        const newState = this.penMarkManager.setPenMode();
        chart.currentDrawingType = DrawingType.Pen;
        chart.drawingManager?.updateState({
            isPenMode: newState.isPenMode,
            isPenDrawing: newState.isDrawing,
            currentPenMark: newState.currentPenMark,
        });
    };

    public setPencilMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.pencilMarkManager) return;
        const newState = this.pencilMarkManager.setPencilMode();
        chart.currentDrawingType = DrawingType.Pencil;
        chart.drawingManager?.updateState({
            isPencilMode: newState.isPencilMode,
            isPencilDrawing: newState.isDrawing,
            currentPencilMark: newState.currentPencilMark,
        });
    };

    public setTimePriceRangeMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.timePriceRangeMarkManager) return;
        const newState = this.timePriceRangeMarkManager.setTimePriceRangeMarkMode();
        chart.currentDrawingType = DrawingType.TimePriceRange;
        chart.drawingManager?.updateState({
            timePriceRangeMarkStartPoint: newState.timePriceRangeMarkStartPoint,
            currentTimePriceRangeMark: newState.currentTimePriceRangeMark,
            isTimePriceRangeMarkMode: newState.isTimePriceRangeMarkMode,
        });
    };

    public setPriceRangeMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.priceRangeMarkManager) return;
        const newState = this.priceRangeMarkManager.setPriceRangeMarkMode();
        chart.currentDrawingType = DrawingType.PriceRange;
        chart.drawingManager?.updateState({
            priceRangeMarkStartPoint: newState.priceRangeMarkStartPoint,
            currentPriceRangeMark: newState.currentPriceRangeMark,
            isPriceRangeMarkMode: newState.isPriceRangeMarkMode,
        });
    };

    public setTimeRangeMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.timeRangeMarkManager) return;
        const newState = this.timeRangeMarkManager.setTimeRangeMarkMode();
        chart.currentDrawingType = DrawingType.TimeRange;
        chart.drawingManager?.updateState({
            timeRangeMarkStartPoint: newState.timeRangeMarkStartPoint,
            currentTimeRangeMark: newState.currentTimeRangeMark,
            isTimeRangeMarkMode: newState.isTimeRangeMarkMode,
        });
    };

    public setElliottTripleCombinationMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.elliottTripleCombinationMarkManager) return;
        const newState = this.elliottTripleCombinationMarkManager.setElliottTripleCombinationMode();
        chart.currentDrawingType = DrawingType.Elliott_Triple_Combination;
        chart.drawingManager?.updateState({
            elliottTripleCombinationPoints: newState.currentPoints,
            currentElliottTripleCombinationMark: newState.currentElliottTripleCombinationMark,
        });
    };

    public setElliottDoubleCombinationMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.elliottDoubleCombinationMarkManager) return;
        const newState = this.elliottDoubleCombinationMarkManager.setElliottDoubleCombinationMode();
        chart.currentDrawingType = DrawingType.Elliott_Double_Combination;
        chart.drawingManager?.updateState({
            elliottDoubleCombinationPoints: newState.currentPoints,
            currentElliottDoubleCombinationMark: newState.currentElliottDoubleCombinationMark,
        });
    };

    public setElliottTriangleMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.elliottTriangleMarkManager) return;
        const newState = this.elliottTriangleMarkManager.setElliottTriangleMode();
        chart.currentDrawingType = DrawingType.Elliott_Triangle;
        chart.drawingManager?.updateState({
            elliottTrianglePoints: newState.currentPoints,
            currentElliottTriangleMark: newState.currentElliottTriangleMark,
        });
    };

    public setElliottCorrectiveMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.elliottCorrectiveMarkManager) return;
        const newState = this.elliottCorrectiveMarkManager.setElliottCorrectiveMode();
        chart.currentDrawingType = DrawingType.Elliott_Corrective;
        chart.drawingManager?.updateState({
            elliottCorrectivePoints: newState.currentPoints,
            currentElliottCorrectiveMark: newState.currentElliottCorrectiveMark,
        });
    };

    public setElliottImpulseMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.elliottImpulseMarkManager) return;
        const newState = this.elliottImpulseMarkManager.setElliottImpulseMode();
        chart.currentDrawingType = DrawingType.Elliott_Impulse;
        chart.drawingManager?.updateState({
            elliottImpulsePoints: newState.currentPoints,
            currentElliottImpulseMark: newState.currentElliottImpulseMark,
        });
    };

    public setTriangleABCDMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.triangleABCDMarkManager) return;
        const newState = this.triangleABCDMarkManager.setGlassTriangleABCDMode();
        chart.currentDrawingType = DrawingType.TriangleABCD;
        chart.drawingManager?.updateState({
            triangleABCDPoints: newState.currentPoints,
            currentTriangleABCDMark: newState.currentTriangleABCDMark,
        });
    };

    public setABCDMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.abcdMarkManager) return;
        const newState = this.abcdMarkManager.setABCDMode();
        chart.currentDrawingType = DrawingType.ABCD;
        chart.drawingManager?.updateState({
            abcdPoints: newState.currentPoints,
            currentABCDMark: newState.currentABCDMark,
        });
    };

    public setHeadAndShouldersMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.headAndShouldersMarkManager) return;
        const newState = this.headAndShouldersMarkManager.setHeadAndShouldersMode();
        chart.currentDrawingType = DrawingType.HeadAndShoulders;
        chart.drawingManager?.updateState({
            headAndShouldersPoints: newState.currentPoints,
            currentHeadAndShouldersMark: newState.currentHeadAndShouldersMark,
        });
    };

    public setXABCDMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.xabcdMarkManager) return;
        const newState = this.xabcdMarkManager.setXABCDMode();
        chart.currentDrawingType = DrawingType.XABCD;
        chart.drawingManager?.updateState({
            xabcdPoints: newState.currentPoints,
            currentXABCDMark: newState.currentXABCDMark,
        });
    };

    public setDoubleCurveMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.doubleCurveMarkManager) return;
        const newState = this.doubleCurveMarkManager.setDoubleCurveMarkMode();
        chart.currentDrawingType = DrawingType.DoubleCurve;
        chart.drawingManager?.updateState({
            doubleCurveMarkStartPoint: newState.doubleCurveMarkStartPoint,
            currentDoubleCurveMark: newState.currentDoubleCurveMark,
        });
    };

    public setCurveMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.curveMarkManager) return;
        const newState = this.curveMarkManager.setCurveMarkMode();
        chart.currentDrawingType = DrawingType.Curve;
        chart.drawingManager?.updateState({
            curveMarkStartPoint: newState.curveMarkStartPoint,
            currentCurveMark: newState.currentCurveMark,
        });
    };

    public setSectorMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.sectorMarkManager) return;
        const newState = this.sectorMarkManager.setSectorMode();
        chart.currentDrawingType = DrawingType.Sector;
        chart.drawingManager?.updateState({
            sectorPoints: newState.sectorPoints,
            currentSector: newState.currentSector,
        });
    };

    public setFibonacciExtensionBaseTimeMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.fibonacciExtensionBaseTimeMarkManager) return;
        const newState = this.fibonacciExtensionBaseTimeMarkManager.setFibonacciExtensionBaseTimeMode();
        chart.currentDrawingType = DrawingType.FibonacciExtensionBaseTime;
        chart.drawingManager?.updateState({
            fibonacciExtensionBaseTimePoints: newState.fibonacciExtensionBaseTimePoints,
            currentFibonacciExtensionBaseTime: newState.currentFibonacciExtensionBaseTime,
        });
    };

    public setFibonacciExtensionBasePriceMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.fibonacciExtensionBasePriceMarkManager) return;
        const newState = this.fibonacciExtensionBasePriceMarkManager.setFibonacciExtensionBasePriceMode();
        chart.currentDrawingType = DrawingType.FibonacciExtensionBasePrice;
        chart.drawingManager?.updateState({
            fibonacciExtensionBasePricePoints: newState.fibonacciExtensionBasePricePoints,
            currentFibonacciExtensionBasePrice: newState.currentFibonacciExtensionBasePrice,
        });
    };

    public setFibonacciChannelMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.fibonacciChannelMarkManager) return;
        const newState = this.fibonacciChannelMarkManager.setFibonacciChannelMarkMode();
        chart.currentDrawingType = DrawingType.FibonacciChannel;
        chart.drawingManager?.updateState({
            currentFibonacciChannel: newState.currentFibonacciChannelMark,
            isFibonacciChannelMode: newState.isFibonacciChannelMarkMode,
            fibonacciChannelDrawingStep: this.getDrawingStepFromPhase(newState.drawingPhase),
        });
    };

    public setFibonacciFanMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.fibonacciFanMarkManager) return;
        const newState = this.fibonacciFanMarkManager.setFibonacciFanMode();
        chart.currentDrawingType = DrawingType.FibonacciFan;
        chart.drawingManager?.updateState({
            fibonacciFanStartPoint: newState.fibonacciFanStartPoint,
            currentFibonacciFan: newState.currentFibonacciFan,
        });
    };

    public setFibonacciWedgeMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.fibonacciWedgeMarkManager) return;
        const newState = this.fibonacciWedgeMarkManager.setFibonacciWedgeMode();
        chart.currentDrawingType = DrawingType.FibonacciWedge;
        chart.drawingManager?.updateState({
            fibonacciWedgePoints: newState.fibonacciWedgePoints,
            currentFibonacciWedge: newState.currentFibonacciWedge,
            fibonacciWedgeDrawingStep: 0
        });
    };

    public setFibonacciSpiralMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.fibonacciSpiralMarkManager) return;
        const newState = this.fibonacciSpiralMarkManager.setFibonacciSpiralMode();
        chart.currentDrawingType = DrawingType.FibonacciSpiral;
        chart.drawingManager?.updateState({
            fibonacciSpiralCenterPoint: newState.fibonacciSpiralCenterPoint,
            currentFibonacciSpiral: newState.currentFibonacciSpiral,
        });
    };

    public setFibonacciCircleMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.fibonacciCircleMarkManager) return;
        const newState = this.fibonacciCircleMarkManager.setFibonacciCircleMode();
        chart.currentDrawingType = DrawingType.FibonacciCircle;
        chart.drawingManager?.updateState({
            fibonacciCircleCenterPoint: newState.fibonacciCircleCenterPoint,
            currentFibonacciCircle: newState.currentFibonacciCircle,
        });
    };

    public setFibonacciArcMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.fibonacciArcMarkManager) return;
        const newState = this.fibonacciArcMarkManager.setFibonacciArcMode();
        chart.currentDrawingType = DrawingType.FibonacciArc;
        chart.drawingManager?.updateState({
            fibonacciArcStartPoint: newState.fibonacciArcStartPoint,
            currentFibonacciArc: newState.currentFibonacciArc,
        });
    };

    public setFibonacciRetracementMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.fibonacciRetracementMarkManager) return;
        const newState = this.fibonacciRetracementMarkManager.setFibonacciRetracementMode();
        chart.currentDrawingType = DrawingType.FibonacciRetracement;
        chart.drawingManager?.updateState({
            fibonacciRetracementStartPoint: newState.fibonacciRetracementStartPoint,
            currentFibonacciRetracement: newState.currentFibonacciRetracement,
        });
    };

    public setFibonacciTimeZoonMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.fibonacciTimeZoonMarkManager) return;
        const newState = this.fibonacciTimeZoonMarkManager.setFibonacciTimeZoneMode();
        chart.currentDrawingType = DrawingType.FibonacciTimeZoon;
        chart.drawingManager?.updateState({
            fibonacciTimeZoonStartPoint: newState.fibonacciTimeZoonStartPoint,
            currentFibonacciTimeZoon: newState.currentFibonacciTimeZoon,
        });
    };

    public setGannRectangleMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.gannRectangleMarkManager) return;
        const newState = this.gannRectangleMarkManager.setGannRectangMode();
        chart.currentDrawingType = DrawingType.GannRectangle;
        chart.drawingManager?.updateState({
            gannRectangleStartPoint: newState.gannRectangleStartPoint,
            currentGannRectangle: newState.currentGannRectangle,
        });
    };

    public setGannBoxMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.gannBoxMarkManager) return;
        const newState = this.gannBoxMarkManager.setGannBoxMode();
        chart.currentDrawingType = DrawingType.GannBox;
        chart.drawingManager?.updateState({
            gannBoxStartPoint: newState.gannBoxStartPoint,
            currentGannBox: newState.currentGannBox,
        });
    };

    public setGannFanMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.gannFanMarkManager) return;
        const newState = this.gannFanMarkManager.setGannFanMode();
        chart.currentDrawingType = DrawingType.GannFan;
        chart.drawingManager?.updateState({
            gannFanStartPoint: newState.gannFanStartPoint,
            currentGannFan: newState.currentGannFan,
        });
    };

    public setTriangleMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.triangleMarkManager) return;
        const newState = this.triangleMarkManager.setTriangleMarkMode();
        chart.currentDrawingType = DrawingType.Triangle;
        chart.drawingManager?.updateState({
            triangleMarkStartPoint: newState.triangleMarkStartPoint,
            currentTriangleMark: newState.currentTriangleMark,
        });
    };

    public setEllipseMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.ellipseMarkManager) return;
        const newState = this.ellipseMarkManager.setEllipseMarkMode();
        chart.currentDrawingType = DrawingType.Ellipse;
        chart.drawingManager?.updateState({
            ellipseMarkStartPoint: newState.ellipseMarkStartPoint,
            currentEllipseMark: newState.currentEllipseMark,
        });
    };

    public setCircleMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.circleMarkManager) return;
        const newState = this.circleMarkManager.setCircleMarkMode();
        chart.currentDrawingType = DrawingType.Circle;
        chart.drawingManager?.updateState({
            circleMarkStartPoint: newState.circleMarkStartPoint,
            currentCircleMark: newState.currentCircleMark,
        });
    };

    public setRectangleMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.rectangleMarkManager) return;
        const newState = this.rectangleMarkManager.setRectangleMarkMode();
        chart.currentDrawingType = DrawingType.Rectangle;
        chart.drawingManager?.updateState({
            rectangleMarkStartPoint: newState.rectangleMarkStartPoint,
            currentRectangleMark: newState.currentRectangleMark,
        });
    };

    public setEnhancedAndrewPitchforkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.enhancedAndrewPitchforkMarkManager) return;
        const newState = this.enhancedAndrewPitchforkMarkManager.setEnhancedAndrewPitchforkMode();
        chart.currentDrawingType = DrawingType.EnhancedAndrewPitchfork;
        chart.drawingManager?.updateState({
            enhancedAndrewPitchforkHandlePoint: newState.enhancedAndrewPitchforkHandlePoint,
            enhancedAndrewPitchforkBaseStartPoint: newState.enhancedAndrewPitchforkBaseStartPoint,
            currentEnhancedAndrewPitchfork: newState.currentEnhancedAndrewPitchfork,
        });
    };

    public setAndrewPitchforkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.andrewPitchforkMarkManager) return;
        const newState = this.andrewPitchforkMarkManager.setAndrewPitchforkMode();

        chart.currentDrawingType = DrawingType.AndrewPitchfork;
        chart.drawingManager?.updateState({
            andrewPitchforkHandlePoint: newState.andrewPitchforkHandlePoint,
            andrewPitchforkBaseStartPoint: newState.andrewPitchforkBaseStartPoint,
            currentAndrewPitchfork: newState.currentAndrewPitchfork,
        });
    };

    public setDisjointChannelMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.disjointChannelMarkManager) return;
        const newState = this.disjointChannelMarkManager.setDisjointChannelMarkMode();

        chart.currentDrawingType = DrawingType.DisjointChannel;
        chart.drawingManager?.updateState({
            disjointChannelMarkStartPoint: newState.disjointChannelMarkStartPoint,
            currentDisjointChannelMark: newState.currentDisjointChannelMark,
        });
    };

    public setEquidistantChannelMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.equidistantChannelMarkManager) return;
        const newState = this.equidistantChannelMarkManager.setEquidistantChannelMarkMode();
        chart.currentDrawingType = DrawingType.EquidistantChannel;
        chart.drawingManager?.updateState({
            equidistantChannelMarkStartPoint: newState.equidistantChannelMarkStartPoint,
            currentEquidistantChannelMark: newState.currentEquidistantChannelMark,
        });
    };

    public setLinearRegressionChannelMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.linearRegressionChannelMarkManager) return;
        const newState = this.linearRegressionChannelMarkManager.setLinearRegressionChannelMode();
        chart.currentDrawingType = DrawingType.LinearRegressionChannel;

        chart.currentDrawingType = DrawingType.LinearRegressionChannel;
        chart.drawingManager?.updateState({
            linearRegressionChannelStartPoint: newState.linearRegressionChannelStartPoint,
            currentLinearRegressionChannel: newState.currentLinearRegressionChannel,
        });
    };
    public setLineSegmentMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.lineSegmentMarkManager) return;
        const newState = this.lineSegmentMarkManager.setLineSegmentMarkMode();
        chart.currentDrawingType = DrawingType.LineSegment;
        chart.drawingManager?.updateState({
            lineSegmentMarkStartPoint: newState.lineSegmentMarkStartPoint,
            currentLineSegmentMark: newState.currentLineSegmentMark,
        });
    };

    public setHorizontalLineMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.axisLineMarkManager) return;
        const newState = this.axisLineMarkManager.setHorizontalLineMode();
        chart.currentDrawingType = DrawingType.HorizontalLine;
    };

    public setVerticalLineMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.axisLineMarkManager) return;
        const newState = this.axisLineMarkManager.setVerticalLineMode();
        chart.currentDrawingType = DrawingType.VerticalLine;
    };

    public setArrowLineMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.arrowLineMarkManager) return;
        const newState = this.arrowLineMarkManager.setArrowLineMarkMode();
        chart.currentDrawingType = DrawingType.ArrowLine;
        chart.drawingManager?.updateState({
            arrowLineMarkStartPoint: newState.arrowLineMarkStartPoint,
            currentArrowLineMark: newState.currentArrowLineMark,
        });
    };
    public setParallelChannelMarkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.parallelChannelMarkManager) return;
        const newState = this.parallelChannelMarkManager.setParallelChannelMarkMode();
        chart.currentDrawingType = DrawingType.ParallelChannel;
        chart.drawingManager?.updateState({
            parallelChannelMarkStartPoint: newState.parallelChannelMarkStartPoint,
            currentParallelChannelMark: newState.currentParallelChannelMark,
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
        this.timeEventMarkManager?.clearState();
        this.priceEventMarkManager?.clearState();
    }

    public setPriceEventMode = (chart: Chart): void => {
        this.clearAllMarkMode(chart);
        if (!this.priceEventMarkManager) return;
        const newState = this.priceEventMarkManager.setPriceEventMode();
        chart.currentDrawingType = DrawingType.PriceEvent;
        chart.drawingManager?.updateState({
            isPriceEventMode: newState.isPriceEventMode,
            isPriceEventDragging: newState.isDragging,
            priceEventDragTarget: newState.dragTarget,
            currentPriceEventMark: newState.previewMark,
        });
    };

    public setTimeEventMode = (chart: Chart): void => {
        this.clearAllMarkMode(chart);
        if (!this.timeEventMarkManager) return;
        const newState = this.timeEventMarkManager.setTimeEventMode();
        chart.currentDrawingType = DrawingType.TimeEvent;
        chart.drawingManager?.updateState({
            isTimeEventMode: newState.isTimeEventMode,
            isTimeEventDragging: newState.isDragging,
            timeEventDragTarget: newState.dragTarget,
            currentTimeEventMark: newState.previewMark,
        });
    };

    public setSchiffPitchforkMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.schiffPitchforkMarkManager) return;
        const newState = this.schiffPitchforkMarkManager.setSchiffPitchforkMode();
        chart.currentDrawingType = DrawingType.SchiffPitchfork;
        chart.drawingManager?.updateState({
            isSchiffPitchforkMode: newState.isSchiffPitchforkMode,
            schiffPitchforkHandlePoint: newState.schiffPitchforkHandlePoint,
            schiffPitchforkBaseStartPoint: newState.schiffPitchforkBaseStartPoint,
            currentSchiffPitchfork: newState.currentSchiffPitchfork,
            isSchiffPitchforkDragging: newState.isDragging,
            schiffPitchforkDragTarget: newState.dragTarget,
        });
    };

    public setHeatMapMode = (chart: Chart) => {
        this.clearAllMarkMode(chart);
        if (!this.heatMapMarkManager) return;
        const newState = this.heatMapMarkManager.setHeatMapMode();
        chart.currentDrawingType = DrawingType.HeatMap;
        chart.drawingManager?.updateState({
            isHeatMapMode: newState.isHeatMapMode,
            heatMapStartPoint: newState.heatMapStartPoint,
            currentHeatMap: newState.currentHeatMap,
            isDragging: newState.isDragging,
            dragTarget: newState.dragTarget,
            dragPoint: newState.dragPoint,
            heatMapDrawingPhase: newState.drawingPhase,
            heatMapAdjustingMode: newState.adjustingMode,
        });
    };

    public clearAllMarkMode = (chart: Chart) => {
        this.clearAllMarkManagerState();
        chart.currentDrawingType = null;
        chart.drawingManager?.updateState({
            lineSegmentMarkStartPoint: null,
            arrowLineMarkStartPoint: null,
            parallelChannelMarkStartPoint: null,
            currentLineSegmentMark: null,
            currentArrowLineMark: null,
            currentParallelChannelMark: null,
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
            isLongPositionMarkMode: false,
            longPositionMarkStartPoint: null,
            currentLongPositionMark: null,
            longPositionDrawingPhase: 'none',
            isLongPositionDragging: false,
            dragTarget: null,
            dragPoint: null,
            adjustingMode: null,
            adjustStartData: null,
            isShortPositionMarkMode: false,
            shortPositionMarkStartPoint: null,
            currentShortPositionMark: null,
            shortPositionDrawingPhase: 'none',
            isShortPositionDragging: false,
            shortPositionDragTarget: null,
            shortPositionDragPoint: null,
            shortPositionAdjustingMode: null,
            shortPositionAdjustStartData: null,
            isPriceLabelMarkMode: false,
            priceLabelMarkPoint: null,
            currentPriceLabelMark: null,
            isPriceLabelDragging: false,
            priceLabelDragTarget: null,
            isFlagMarkMode: false,
            flagMarkPoint: null,
            currentFlagMark: null,
            isFlagDragging: false,
            flagDragTarget: null,
            isPriceNoteMarkMode: false,
            priceNoteMarkStartPoint: null,
            currentPriceNoteMark: null,
            isPriceNoteDragging: false,
            priceNoteDragTarget: null,
            priceNoteDragPoint: null,
            isSignpostMarkMode: false,
            signpostMarkPoint: null,
            currentSignpostMark: null,
            isSignpostDragging: false,
            signpostDragTarget: null,
            isEmojiMarkMode: false,
            emojiMarkStartPoint: null,
            currentEmojiMark: null,
            isEmojiDragging: false,
            emojiDragTarget: null,
            emojiDragPoint: null,
            isPinMarkMode: false,
            pinMarkPoint: null,
            currentPinMark: null,
            isPinDragging: false,
            pinDragTarget: null,
            isBubbleBoxMarkMode: false,
            bubbleBoxMarkPoints: null,
            currentBubbleBoxMark: null,
            isBubbleBoxDragging: false,
            bubbleBoxDragTarget: null,
            bubbleBoxDragType: null,
            isTextEditMarkMode: false,
            isTextEditDragging: false,
            textEditDragTarget: null,
            isMockKLineMarkMode: false,
            mockKLineMarkStartPoint: null,
            currentMockKLineMark: null,
            isMockKLineDragging: false,
            mockKLineDragTarget: null,
            mockKLineDragPoint: null,
            isHeatMapMode: false,
            heatMapStartPoint: null,
            currentHeatMap: null,
            heatMapDrawingPhase: 'none',
            isHeatMapDragging: false,
            heatMapDragTarget: null,
            heatMapDragPoint: null,
            heatMapAdjustingMode: null,
            isSchiffPitchforkMode: false,
            schiffPitchforkHandlePoint: null,
            schiffPitchforkBaseStartPoint: null,
            currentSchiffPitchfork: null,
            isSchiffPitchforkDragging: false,
            schiffPitchforkDragTarget: null,
            schiffPitchforkDragPoint: null,
            schiffPitchforkDrawingPhase: 'none',
            schiffPitchforkAdjustingMode: null,
            isTimeEventMode: false,
            isTimeEventDragging: false,
            timeEventDragTarget: null,
            currentTimeEventMark: null,
            isPriceEventMode: false,
            isPriceEventDragging: false,
            priceEventDragTarget: null,
            currentPriceEventMark: null,
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

    public deleteMark = (drawingType: DrawingType, iGraph: IGraph) => {
        switch (drawingType) {
            case DrawingType.PriceEvent:
                this.priceEventMarkManager?.removePriceEventMark(iGraph as PriceEventMark);
                break;
            case DrawingType.TimeEvent:
                this.timeEventMarkManager?.removeTimeEventMark(iGraph as TimeEventMark);
                break;
            case DrawingType.LineSegment:
                this.lineSegmentMarkManager?.removeLineSegmentMark(iGraph as LineSegmentMark);
                break;
            case DrawingType.ArrowLine:
                this.arrowLineMarkManager?.removeArrowLineMark(iGraph as ArrowLineMark);
                break;
            case DrawingType.ThickArrowLine:
                this.thickArrowLineMarkManager?.removeThickArrowLineMark(iGraph as ThickArrowLineMark);
                break;
            case DrawingType.HorizontalLine:
                this.axisLineMarkManager?.removeHorizontalLine(iGraph as HorizontalLineMark);
                break;
            case DrawingType.VerticalLine:
                this.axisLineMarkManager?.removeVerticalLine(iGraph as VerticalLineMark);
                break;
            case DrawingType.ParallelChannel:
                this.parallelChannelMarkManager?.removeParallelChannelMark(iGraph as ParallelChannelMark);
                break;
            case DrawingType.LinearRegressionChannel:
                this.linearRegressionChannelMarkManager?.removeLinearRegressionChannelMark(iGraph as LinearRegressionChannelMark);
                break;
            case DrawingType.EquidistantChannel:
                this.equidistantChannelMarkManager?.removeEquidistantChannelMark(iGraph as EquidistantChannelMark);
                break;
            case DrawingType.DisjointChannel:
                this.disjointChannelMarkManager?.removeDisjointChannelMark(iGraph as DisjointChannelMark);
                break;
            case DrawingType.Pitchfork:
                break;
            case DrawingType.AndrewPitchfork:
                this.andrewPitchforkMarkManager?.removeAndrewPitchforkMark(iGraph as AndrewPitchforkMark);
                break;
            case DrawingType.EnhancedAndrewPitchfork:
                this.enhancedAndrewPitchforkMarkManager?.removeEnhancedAndrewPitchforkMark(iGraph as EnhancedAndrewPitchforkMark);
                break;
            case DrawingType.SchiffPitchfork:
                this.schiffPitchforkMarkManager?.removeSchiffPitchforkMark(iGraph as SchiffPitchforkMark);
                break;
            case DrawingType.Rectangle:
                this.rectangleMarkManager?.removeRectangleMark(iGraph as RectangleMark);
                break;
            case DrawingType.Circle:
                this.circleMarkManager?.removeCircleMark(iGraph as CircleMark);
                break;
            case DrawingType.Ellipse:
                this.ellipseMarkManager?.removeEllipseMark(iGraph as EllipseMark);
                break;
            case DrawingType.Sector:
                this.sectorMarkManager?.removeSectorMark(iGraph as SectorMark);
                break;
            case DrawingType.Triangle:
                this.triangleMarkManager?.removeTriangleMark(iGraph as TriangleMark);
                break;
            case DrawingType.GannFan:
                this.gannFanMarkManager?.removeGannFan(iGraph as GannFanMark);
                break;
            case DrawingType.GannBox:
                this.gannBoxMarkManager?.removeGannBox(iGraph as GannBoxMark);
                break;
            case DrawingType.GannRectangle:
                this.gannRectangleMarkManager?.removeGannRectangle(iGraph as GannRectangleMark);
                break;
            case DrawingType.FibonacciTimeZoon:
                this.fibonacciTimeZoonMarkManager?.removeFibonacciTimeZoonMark(iGraph as FibonacciTimeZoonMark);
                break;
            case DrawingType.FibonacciRetracement:
                this.fibonacciRetracementMarkManager?.removeFibonacciRetracementMark(iGraph as FibonacciRetracementMark);
                break;
            case DrawingType.FibonacciArc:
                this.fibonacciArcMarkManager?.removeFibonacciArcMark(iGraph as FibonacciArcMark);
                break;
            case DrawingType.FibonacciCircle:
                this.fibonacciCircleMarkManager?.removeFibonacciCircleMark(iGraph as FibonacciCircleMark);
                break;
            case DrawingType.FibonacciSpiral:
                this.fibonacciSpiralMarkManager?.removeFibonacciSpiralMark(iGraph as FibonacciSpiralMark);
                break;
            case DrawingType.FibonacciWedge:
                this.fibonacciWedgeMarkManager?.removeFibonacciWedgeMark(iGraph as FibonacciWedgeMark);
                break;
            case DrawingType.FibonacciFan:
                this.fibonacciFanMarkManager?.removeFibonacciFan(iGraph as FibonacciFanMark);
                break;
            case DrawingType.FibonacciChannel:
                this.fibonacciChannelMarkManager?.removeFibonacciChannelMark(iGraph as FibonacciChannelMark);
                break;
            case DrawingType.FibonacciExtensionBasePrice:
                this.fibonacciExtensionBasePriceMarkManager?.removeFibonacciExtensionBasePriceMark(iGraph as FibonacciExtensionBasePriceMark);
                break;
            case DrawingType.FibonacciExtensionBaseTime:
                this.fibonacciExtensionBaseTimeMarkManager?.removeFibonacciExtensionBaseTimeMark(iGraph as FibonacciExtensionBaseTimeMark);
                break;
            case DrawingType.Curve:
                this.curveMarkManager?.removeCurveMark(iGraph as CurveMark);
                break;
            case DrawingType.DoubleCurve:
                this.doubleCurveMarkManager?.removeDoubleCurveMark(iGraph as DoubleCurveMark);
                break;
            case DrawingType.XABCD:
                this.xabcdMarkManager?.removeXABCDMark(iGraph as XABCDMark);
                break;
            case DrawingType.HeadAndShoulders:
                this.headAndShouldersMarkManager?.removeHeadAndShouldersMark(iGraph as HeadAndShouldersMark);
                break;
            case DrawingType.ABCD:
                this.abcdMarkManager?.removeABCDMark(iGraph as ABCDMark);
                break;
            case DrawingType.TriangleABCD:
                this.triangleABCDMarkManager?.removeTriangleABCDMark(iGraph as TriangleABCDMark);
                break;
            case DrawingType.Elliott_Impulse:
                this.elliottImpulseMarkManager?.removeElliottImpulseMark(iGraph as ElliottImpulseMark);
                break;
            case DrawingType.Elliott_Corrective:
                this.elliottCorrectiveMarkManager?.removeElliottCorrectiveMark(iGraph as ElliottCorrectiveMark);
                break;
            case DrawingType.Elliott_Triangle:
                this.elliottTriangleMarkManager?.removeElliottTriangleMark(iGraph as ElliottTriangleMark);
                break;
            case DrawingType.Elliott_Double_Combination:
                this.elliottDoubleCombinationMarkManager?.removeElliottDoubleCombinationMark(iGraph as ElliottDoubleCombinationMark);
                break;
            case DrawingType.Elliott_Triple_Combination:
                this.elliottTripleCombinationMarkManager?.removeElliottTripleCombinationMark(iGraph as ElliottTripleCombinationMark);
                break;
            case DrawingType.TimeRange:
                this.timeRangeMarkManager?.removeTimeRangeMark(iGraph as TimeRangeMark);
                break;
            case DrawingType.PriceRange:
                this.priceRangeMarkManager?.removePriceRangeMark(iGraph as PriceRangeMark);
                break;
            case DrawingType.TimePriceRange:
                this.timePriceRangeMarkManager?.removeTimePriceRangeMark(iGraph as TimePriceRangeMark);
                break;
            case DrawingType.Pencil:
                this.pencilMarkManager?.removePencilMark(iGraph as PencilMark);
                break;
            case DrawingType.Pen:
                this.penMarkManager?.removePenMark(iGraph as PenMark);
                break;
            case DrawingType.Brush:
                this.brushMarkManager?.removeBrushMark(iGraph as BrushMark);
                break;
            case DrawingType.MarkerPen:
                this.markerPenMarkManager?.removeMarkerPenMark(iGraph as MarkerPenMark);
                break;
            case DrawingType.Eraser:
                break;
            case DrawingType.Image:
                this.imageMarkManager?.removeImageMark(iGraph as ImageMark);
                break;
            case DrawingType.LongPosition:
                this.longPositionMarkManager?.removeLongPositionMark(iGraph as LongPositionMark);
                break;
            case DrawingType.ShortPosition:
                this.shortPositionMarkManager?.removeShortPositionMark(iGraph as ShortPositionMark);
                break;
            case DrawingType.PriceLabel:
                this.priceLabelMarkManager?.removePriceLabelMark(iGraph as PriceLabelMark);
                break;
            case DrawingType.Flag:
                this.flagMarkManager?.removeFlagMark(iGraph as FlagMark);
                break;
            case DrawingType.PriceNote:
                this.priceNoteMarkManager?.removePriceNoteMark(iGraph as PriceNoteMark);
                break;
            case DrawingType.SignPost:
                this.signpostMarkManager?.removeSignPostMark(iGraph as SignPostMark);
                break;
            case DrawingType.Emoji:
                this.emojiMarkManager?.removeEmojiMark(iGraph as EmojiMark);
                break;
            case DrawingType.Pin:
                this.pinMarkManager?.removePinMark(iGraph as PinMark);
                break;
            case DrawingType.BubbleBox:
                this.bubbleBoxMarkManager?.removeBubbleBoxMark(iGraph as BubbleBoxMark);
                break;
            case DrawingType.TextEdit:
                this.textEditMarkManager?.removeTextEditMark(iGraph as TextEditMark);
                break;
            case DrawingType.MockKLine:
                this.mockKLineMarkManager?.removeMockKLineMark(iGraph as MockKLineMark);
                break;
            case DrawingType.HeatMap:
                break;
            default:
                break;
        }
    };

    public deleteAllMark = () => {
        this.priceEventMarkManager?.getPriceEventMarks().forEach(mark => {
            this.priceEventMarkManager?.removePriceEventMark(mark);
        });
        this.timeEventMarkManager?.getTimeEventMarks().forEach(mark => {
            this.timeEventMarkManager?.removeTimeEventMark(mark);
        });
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
        this.priceEventMarkManager?.showAllMarks();
        this.timeEventMarkManager?.showAllMarks();
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
        this.priceEventMarkManager?.hideAllMarks();
        this.timeEventMarkManager?.hideAllMarks();
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
    public closeAllBrushTools = (chart: Chart) => {
        if (this.pencilMarkManager && chart.currentDrawingType === DrawingType.Pencil) {
            const newState = this.pencilMarkManager.closeBrush();
            chart.drawingManager?.updateState({
                isPencilMode: newState.isPencilMode,
                isDrawing: newState.isDrawing,
                currentPencilMark: newState.currentPencilMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.penMarkManager && chart.currentDrawingType === DrawingType.Pen) {
            const newState = this.penMarkManager.closeBrush();
            chart.drawingManager?.updateState({
                isPenMode: newState.isPenMode,
                isDrawing: newState.isDrawing,
                currentPenMark: newState.currentPenMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.brushMarkManager && chart.currentDrawingType === DrawingType.Brush) {
            const newState = this.brushMarkManager.closeBrush();
            chart.drawingManager?.updateState({
                isBrushMode: newState.isBrushMode,
                isDrawing: newState.isDrawing,
                currentBrushMark: newState.currentBrushMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.markerPenMarkManager && chart.currentDrawingType === DrawingType.MarkerPen) {
            const newState = this.markerPenMarkManager.closeBrush();
            chart.drawingManager?.updateState({
                isMarkerPenMode: newState.isMarkerPenMarkMode,
                isDrawing: newState.isDrawing,
                currentMarkerPen: newState.currentMarkerPenMark,
                isDragging: newState.isDragging,
            });
        }
        if (this.eraserMarkManager && chart.currentDrawingType === DrawingType.Eraser) {
            const newState = this.eraserMarkManager.closeBrush();
            chart.drawingManager?.updateState({
                isEraserMode: newState.isEraserMode,
                isErasing: newState.isErasing,
                eraserHoveredMark: null
            });
        }
    };
}