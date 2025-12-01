import { I18n } from '../I18n';
import {
    AndrewPitchforkIcon, BrushIcon,
    CircleIcon, CursorArrowIcon, CursorCrosshairIcon,
    CursorDotIcon, CursorEmojiIcon, CursorSparkleIcon,
    EllipseIcon, EraserIcon, FibonacciIcon, GannBoxIcon,
    GannFanIcon, PencilIcon, PenIcon,
    RectangleIcon, TextIcon, TriangleIcon,
    MarkerPenIcon,
    ThickArrowLineIcon,
    EnhancedAndrewPitchforkIcon,
    SchiffPitchforkIcon,
    InternalPitchforkIcon,
    WavePitchforkIcon,
    GannRectangleIcon,
    FibonacciTimeZonesIcon,
    FibonacciCircleIcon,
    FibonacciSpiralIcon,
    FibonacciWedgeIcon,
    FibonacciFanIcon,
    FibonacciChannelIcon,
    XABCDPatternIcon,
    HeadAndShouldersIcon,
    ABCDPatternIcon,
    TriangleABCDIcon,
    ElliottImpulseIcon,
    ElliottCorrectiveIcon,
    ElliottTriangleIcon,
    ElliottDoubleComboIcon,
    ElliottTripleComboIcon,
    SectorIcon,
    CurveIcon,
    DoubleCurveIcon,
    TimeRangeIcon,
    PriceRangeIcon,
    TimePriceRangeIcon,
    LongPositionIcon,
    ShortPositionIcon,
    MockKlineIcon,
    PriceNoteIcon,
    BubbleBoxIcon,
    PinIcon,
    SignpostIcon,
    PriceLabelIcon,
    FlagMarkIcon,
    ImageIcon,
    LineSegmentIcon,
    HorizontalLineIcon,
    VerticalLineIcon,
    ArrowLineIcon,
    ParallelChannelIcon,
    DisjointChannelIcon,
    EquidistantChannelIcon,
    LinearRegressionChannelIcon,
    HeatMapIcon,
    FibonacciPriceExtensionIcon,
    FibonacciTimeExtensionIcon,
    FibonacciArcIcon,
    CursorCircleIcon
} from "../Icons";

export interface ToolConfig {
    cursorStyles: Array<{
        id: string;
        name: string;
        description: string;
        icon: React.ComponentType<any>;
    }>;
    penTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: React.ComponentType<any>;
        }>;
    }>;
    drawingTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: React.ComponentType<any>;
        }>;
    }>;
    gannAndFibonacciTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: React.ComponentType<any>;
        }>;
    }>;
    irregularShapeTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: React.ComponentType<any>;
        }>;
    }>;
    projectInfoTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: React.ComponentType<any>;
        }>;
    }>;
    textTools: Array<{
        title: string;
        tools: Array<{
            id: string;
            name: string;
            description: string;
            icon: React.ComponentType<any>;
        }>;
    }>;
}

export const getToolConfig = (i18n: I18n): ToolConfig => {
    return {
        cursorStyles: [
            { id: 'default', name: i18n.leftPanel.cursorArrow, description: i18n.leftPanel.cursorArrowDesc, icon: CursorArrowIcon },
            { id: 'crosshair', name: i18n.leftPanel.cursorCrosshair, description: i18n.leftPanel.cursorCrosshairDesc, icon: CursorCrosshairIcon },
            { id: 'circle', name: i18n.leftPanel.cursorCircle, description: i18n.leftPanel.cursorCircleDesc, icon: CursorCircleIcon },
            { id: 'dot', name: i18n.leftPanel.cursorDot, description: i18n.leftPanel.cursorDotDesc, icon: CursorDotIcon },
            { id: 'sparkle', name: i18n.leftPanel.cursorSparkle, description: i18n.leftPanel.cursorSparkleDesc, icon: CursorSparkleIcon },
            { id: 'emoji', name: i18n.leftPanel.cursorEmoji, description: i18n.leftPanel.cursorEmojiDesc, icon: CursorEmojiIcon },
        ],
        penTools: [
            {
                title: i18n.leftPanel.penTools,
                tools: [
                    { id: 'pencil', name: i18n.leftPanel.pencil, description: i18n.leftPanel.pencilDesc, icon: PencilIcon },
                    { id: 'pen', name: i18n.leftPanel.pen, description: i18n.leftPanel.penDesc, icon: PenIcon },
                    { id: 'brush', name: i18n.leftPanel.brush, description: i18n.leftPanel.brushDesc, icon: BrushIcon },
                    { id: 'marker-pen', name: i18n.leftPanel.markerPen, description: i18n.leftPanel.markerPenDesc, icon: MarkerPenIcon },
                    { id: 'eraser', name: i18n.leftPanel.eraser, description: i18n.leftPanel.eraserDesc, icon: EraserIcon },
                ]
            },
        ],
        drawingTools: [
            {
                title: i18n.leftPanel.lineTools,
                tools: [
                    { id: 'line-segment', name: i18n.leftPanel.lineSegment, description: i18n.leftPanel.lineSegmentDesc, icon: LineSegmentIcon },
                    { id: 'horizontal-line', name: i18n.leftPanel.horizontalLine, description: i18n.leftPanel.horizontalLineDesc, icon: HorizontalLineIcon },
                    { id: 'vertical-line', name: i18n.leftPanel.verticalLine, description: i18n.leftPanel.verticalLineDesc, icon: VerticalLineIcon },
                ]
            },
            {
                title: i18n.leftPanel.arrowTools,
                tools: [
                    { id: 'arrow-line', name: i18n.leftPanel.arrowLine, description: i18n.leftPanel.arrowLineDesc, icon: ArrowLineIcon },
                    { id: 'thick-arrow-line', name: i18n.leftPanel.thickArrowLine, description: i18n.leftPanel.thickArrowLineDesc, icon: ThickArrowLineIcon },
                ]
            },
            {
                title: i18n.leftPanel.channelTools,
                tools: [
                    { id: 'parallel-channel', name: i18n.leftPanel.parallelChannel, description: i18n.leftPanel.parallelChannelDesc, icon: ParallelChannelIcon },
                    { id: 'linear-regression-channel', name: i18n.leftPanel.linearRegressionChannel, description: i18n.leftPanel.linearRegressionChannelDesc, icon: LinearRegressionChannelIcon },
                    { id: 'equidistant-channel', name: i18n.leftPanel.equidistantChannel, description: i18n.leftPanel.equidistantChannelDesc, icon: EquidistantChannelIcon },
                    { id: 'disjoint-channel', name: i18n.leftPanel.disjointChannel, description: i18n.leftPanel.disjointChannelDesc, icon: DisjointChannelIcon },
                ]
            },
            {
                title: i18n.leftPanel.pitchforkTools,
                tools: [
                    { id: 'andrew-pitchfork', name: i18n.leftPanel.andrewPitchfork, description: i18n.leftPanel.andrewPitchforkDesc, icon: AndrewPitchforkIcon },
                    { id: 'enhanced-andrew-pitch-fork', name: i18n.leftPanel.enhancedAndrewPitchfork, description: i18n.leftPanel.enhancedAndrewPitchforkDesc, icon: EnhancedAndrewPitchforkIcon },
                    { id: 'schiff-pitch-fork', name: i18n.leftPanel.schiffPitchfork, description: i18n.leftPanel.schiffPitchforkDesc, icon: SchiffPitchforkIcon },
                ]
            },
        ],
        gannAndFibonacciTools: [
            {
                title: i18n.leftPanel.gannTools,
                tools: [
                    { id: 'gann-fan', name: i18n.leftPanel.gannFan, description: i18n.leftPanel.gannFanDesc, icon: GannFanIcon },
                    { id: 'gann-box', name: i18n.leftPanel.gannBox, description: i18n.leftPanel.gannBoxDesc, icon: GannBoxIcon },
                    { id: 'gann-rectang', name: i18n.leftPanel.gannRectangle, description: i18n.leftPanel.gannRectangleDesc, icon: GannRectangleIcon },
                ]
            },
            {
                title: i18n.leftPanel.fibonacciTools,
                tools: [
                    { id: 'fibonacci-time-zoon', name: i18n.leftPanel.fibonacciTimeZones, description: i18n.leftPanel.fibonacciTimeZonesDesc, icon: FibonacciTimeZonesIcon },
                    { id: 'fibonacci-retracement', name: i18n.leftPanel.fibonacciRetracement, description: i18n.leftPanel.fibonacciRetracementDesc, icon: FibonacciIcon },
                    { id: 'fibonacci-arc', name: i18n.leftPanel.fibonacciArc, description: i18n.leftPanel.fibonacciArcDesc, icon: FibonacciArcIcon },
                    { id: 'fibonacci-circle', name: i18n.leftPanel.fibonacciCircle, description: i18n.leftPanel.fibonacciCircleDesc, icon: FibonacciCircleIcon },
                    { id: 'fibonacci-spiral', name: i18n.leftPanel.fibonacciSpiral, description: i18n.leftPanel.fibonacciSpiralDesc, icon: FibonacciSpiralIcon },
                    { id: 'fibonacci-wedge', name: i18n.leftPanel.fibonacciWedge, description: i18n.leftPanel.fibonacciWedgeDesc, icon: FibonacciWedgeIcon },
                    { id: 'fibonacci-fan', name: i18n.leftPanel.fibonacciFan, description: i18n.leftPanel.fibonacciFanDesc, icon: FibonacciFanIcon },
                    { id: 'fibonacci-channel', name: i18n.leftPanel.fibonacciChannel, description: i18n.leftPanel.fibonacciChannelDesc, icon: FibonacciChannelIcon },
                    { id: 'fibonacci-extension-base-price', name: i18n.leftPanel.fibonacciExtensionPrice, description: i18n.leftPanel.fibonacciExtensionPriceDesc, icon: FibonacciPriceExtensionIcon },
                    { id: 'fibonacci-extension-base-time', name: i18n.leftPanel.fibonacciExtensionTime, description: i18n.leftPanel.fibonacciExtensionTimeDesc, icon: FibonacciTimeExtensionIcon },
                ]
            }
        ],
        irregularShapeTools: [
            {
                title: i18n.leftPanel.technicalPatterns,
                tools: [
                    { id: 'xabcd', name: i18n.leftPanel.xabcdPattern, description: i18n.leftPanel.xabcdPatternDesc, icon: XABCDPatternIcon },
                    { id: 'head-and-shoulders', name: i18n.leftPanel.headAndShoulders, description: i18n.leftPanel.headAndShouldersDesc, icon: HeadAndShouldersIcon },
                    { id: 'abcd', name: i18n.leftPanel.abcdPattern, description: i18n.leftPanel.abcdPatternDesc, icon: ABCDPatternIcon },
                    { id: 'triangle-abcd', name: i18n.leftPanel.triangleAbcd, description: i18n.leftPanel.triangleAbcdDesc, icon: TriangleABCDIcon },
                ]
            },
            {
                title: i18n.leftPanel.elliottWave,
                tools: [
                    { id: 'elliott-lmpulse', name: i18n.leftPanel.elliottImpulse, description: i18n.leftPanel.elliottImpulseDesc, icon: ElliottImpulseIcon },
                    { id: 'elliott-corrective', name: i18n.leftPanel.elliottCorrective, description: i18n.leftPanel.elliottCorrectiveDesc, icon: ElliottCorrectiveIcon },
                    { id: 'elliott-triangle', name: i18n.leftPanel.elliottTriangle, description: i18n.leftPanel.elliottTriangleDesc, icon: ElliottTriangleIcon },
                    { id: 'elliott-double-combo', name: i18n.leftPanel.elliottDoubleCombo, description: i18n.leftPanel.elliottDoubleComboDesc, icon: ElliottDoubleComboIcon },
                    { id: 'elliott-triple-combo', name: i18n.leftPanel.elliottTripleCombo, description: i18n.leftPanel.elliottTripleComboDesc, icon: ElliottTripleComboIcon },
                ]
            },
            {
                title: i18n.leftPanel.regularShapes,
                tools: [
                    { id: 'rectangle', name: i18n.leftPanel.rectangle, description: i18n.leftPanel.rectangleDesc, icon: RectangleIcon },
                    { id: 'circle', name: i18n.leftPanel.circle, description: i18n.leftPanel.circleDesc, icon: CircleIcon },
                    { id: 'ellipse', name: i18n.leftPanel.ellipse, description: i18n.leftPanel.ellipseDesc, icon: EllipseIcon },
                    { id: 'triangle', name: i18n.leftPanel.triangle, description: i18n.leftPanel.triangleDesc, icon: TriangleIcon },
                    { id: 'sector', name: i18n.leftPanel.sector, description: i18n.leftPanel.sectorDesc, icon: SectorIcon },
                    { id: 'curve', name: i18n.leftPanel.curve, description: i18n.leftPanel.curveDesc, icon: CurveIcon },
                    { id: 'double-curve', name: i18n.leftPanel.doubleCurve, description: i18n.leftPanel.doubleCurveDesc, icon: DoubleCurveIcon },
                ]
            },
        ],
        projectInfoTools: [
            {
                title: i18n.leftPanel.rangeTools,
                tools: [
                    { id: 'time-range', name: i18n.leftPanel.timeRange, description: i18n.leftPanel.timeRangeDesc, icon: TimeRangeIcon },
                    { id: 'price-range', name: i18n.leftPanel.priceRange, description: i18n.leftPanel.priceRangeDesc, icon: PriceRangeIcon },
                    { id: 'time-price-range', name: i18n.leftPanel.timePriceRange, description: i18n.leftPanel.timePriceRangeDesc, icon: TimePriceRangeIcon },
                    { id: 'heat-map', name: i18n.leftPanel.heatMap, description: i18n.leftPanel.heatMap, icon: HeatMapIcon },
                ]
            },
            {
                title: i18n.leftPanel.positionTools,
                tools: [
                    { id: 'long-position', name: i18n.leftPanel.longPosition, description: i18n.leftPanel.longPositionDesc, icon: LongPositionIcon },
                    { id: 'short-position', name: i18n.leftPanel.shortPosition, description: i18n.leftPanel.shortPositionDesc, icon: ShortPositionIcon },
                ]
            },
            {
                title: i18n.leftPanel.simulationTools,
                tools: [
                    { id: 'mock-kline', name: i18n.leftPanel.mockKline, description: i18n.leftPanel.mockKlineDesc, icon: MockKlineIcon },
                ]
            },
        ],
        textTools: [
            {
                title: i18n.leftPanel.textTools,
                tools: [
                    { id: 'text', name: i18n.leftPanel.text, description: i18n.leftPanel.textDesc, icon: TextIcon },
                    { id: 'price-note', name: i18n.leftPanel.priceNote, description: i18n.leftPanel.priceNoteDesc, icon: PriceNoteIcon },
                    { id: 'bubble-box', name: i18n.leftPanel.bubbleBox, description: i18n.leftPanel.bubbleBoxDesc, icon: BubbleBoxIcon },
                    { id: 'pin', name: i18n.leftPanel.pin, description: i18n.leftPanel.pinDesc, icon: PinIcon },
                    { id: 'signpost', name: i18n.leftPanel.signpost, description: i18n.leftPanel.signpostDesc, icon: SignpostIcon },
                    { id: 'price-label', name: i18n.leftPanel.priceLabel, description: i18n.leftPanel.priceLabelDesc, icon: PriceLabelIcon },
                    { id: 'flag-mark', name: i18n.leftPanel.flagMark, description: i18n.leftPanel.flagMarkDesc, icon: FlagMarkIcon },
                ]
            },
            {
                title: i18n.leftPanel.contentTools,
                tools: [
                    { id: 'image', name: i18n.leftPanel.image, description: i18n.leftPanel.imageDesc, icon: ImageIcon },
                ]
            },
        ]
    };
};