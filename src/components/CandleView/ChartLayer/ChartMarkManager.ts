import { ChartLayer } from ".";
import { IDeletableMark } from "../Mark/IDeletableMark";
import { IGraphStyle } from "../Mark/IGraphStyle";
import { ABCDMarkManager } from "../MarkManager/ABCDMarkManager";
import { AndrewPitchforkMarkManager } from "../MarkManager/AndrewPitchforkMarkManager";
import { ArrowLineMarkManager } from "../MarkManager/ArrowLineMarkManager";
import { AxisLineMarkManager } from "../MarkManager/AxisLineMarkManager";
import { CircleMarkManager } from "../MarkManager/CircleMarkManager";
import { ImageMarkManager } from "../MarkManager/Content/ImageMarkManager";
import { TableMarkManager } from "../MarkManager/Content/TableMarkManager";
import { CurveMarkManager } from "../MarkManager/CurveMarkManager";
import { DisjointChannelMarkManager } from "../MarkManager/DisjointChannelMarkManager";
import { DoubleCurveMarkManager } from "../MarkManager/DoubleCurveMarkManager";
import { ElliottCorrectiveMarkManager } from "../MarkManager/Elliott/ElliottCorrectiveMarkManager";
import { ElliottDoubleCombinationMarkManager } from "../MarkManager/Elliott/ElliottDoubleCombinationMarkManager";
import { ElliottImpulseMarkManager } from "../MarkManager/Elliott/ElliottImpulseMarkManager";
import { ElliottTriangleMarkManager } from "../MarkManager/Elliott/ElliottTriangleMarkManager";
import { ElliottTripleCombinationMarkManager } from "../MarkManager/Elliott/ElliottTripleCombinationMarkManager";
import { EllipseMarkManager } from "../MarkManager/EllipseMarkManager";
import { EnhancedAndrewPitchforkMarkManager } from "../MarkManager/EnhancedAndrewPitchforkMarkManager";
import { EquidistantChannelMarkManager } from "../MarkManager/EquidistantChannelMarkManager";
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
import { HeadAndShouldersMarkManager } from "../MarkManager/HeadAndShouldersMarkManager";
import { LinearRegressionChannelMarkManager } from "../MarkManager/LinearRegressionChannelMarkManager";
import { LineSegmentMarkManager } from "../MarkManager/LineSegmentMarkManager";
import { ParallelChannelMarkManager } from "../MarkManager/ParallelChannelMarkManager";
import { BrushMarkManager } from "../MarkManager/Pen/BrushMarkManager";
import { EraserMarkManager } from "../MarkManager/Pen/EraserMarkManager";
import { MarkerPenMarkManager } from "../MarkManager/Pen/MarkerPenMarkManager";
import { PencilMarkManager } from "../MarkManager/Pen/PencilMarkManager";
import { PenMarkManager } from "../MarkManager/Pen/PenMarkManager";
import { PriceRangeMarkManager } from "../MarkManager/Range/PriceRangeMarkManager";
import { LongPositionMarkManager } from "../MarkManager/Range/LongPositionMarkManager";
import { RectangleMarkManager } from "../MarkManager/RectangleMarkManager";
import { SectorMarkManager } from "../MarkManager/SectorMarkManager";
import { ThickArrowLineMarkManager } from "../MarkManager/ThickArrowLineMarkManager";
import { TimePriceRangeMarkManager } from "../MarkManager/Range/TimePriceRangeMarkManager";
import { TimeRangeMarkManager } from "../MarkManager/Range/TimeRangeMarkManager";
import { TriangleABCDMarkManager } from "../MarkManager/TriangleABCDMarkManager";
import { TriangleMarkManager } from "../MarkManager/TriangleMarkManager";
import { XABCDMarkManager } from "../MarkManager/XABCDMarkManager";
import { MarkType } from "../types";
import { ChartEventManager } from "./ChartEventManager";
import { ShortPositionMarkManager } from "../MarkManager/Range/ShortPositionMarkManager";
import { PriceLabelMarkManager } from "../MarkManager/Text/PriceLabelMarkManager";
import { FlagMarkManager } from "../MarkManager/Text/FlagMarkManager";
import { PriceNoteMarkManager } from "../MarkManager/Text/PriceNoteMarkManager";
import { SignPostMarkManager } from "../MarkManager/Text/SignPostMarkManager";
import { EmojiMarkManager } from "../MarkManager/Text/EmojiMarkManager";
import { PinMarkManager } from "../MarkManager/Text/PinMarkManager";
import { BubbleBoxMarkManager } from "../MarkManager/Text/BubbleBoxMarkManager";
import { TextEditMarkManager } from "../MarkManager/Text/TextEditMarkManager";

export class ChartMarkManager {
    public lineSegmentMarkManager: LineSegmentMarkManager | null = null;
    public axisLineMarkManager: AxisLineMarkManager | null = null;
    public arrowLineMarkManager: ArrowLineMarkManager | null = null;
    private chartEventManager: ChartEventManager | null = null;
    public parallelChannelMarkManager: ParallelChannelMarkManager | null = null;
    public currentOperationMarkType: MarkType | null = null;
    // Original chart options
    private originalChartOptions: any = null;
    // The style interface of the currently selected graphic.
    public currentGraphSettingsStyle: IGraphStyle | null = null;
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
    }

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
            shortPositionAdjustStartData: newState.adjustStartData,
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
            adjustStartData: newState.adjustStartData,
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
        const newState = this.gannRectangleMarkManager.setGannBoxFanMode();
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
    }

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
}