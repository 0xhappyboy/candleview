import { Chart } from '../../chart/Chart';
import { CursorType, DrawingType } from '../../types';
import { LeftPanel } from './LeftPanel';

export class ToolManager {
    private chart: Chart | null = null;
    private currentTool: DrawingType | null = null;

    constructor(chart?: Chart) {
        this.chart = chart || null;
    }

    public setChart(chart: Chart): void {
        this.chart = chart;
    }

    public getCurrentTool(): DrawingType | null {
        return this.currentTool;
    }


    public clearCurrentTool(): void {
        if (this.currentTool !== null) {
            this.currentTool = null;
            if (this.chart?.onCloseDrawing) {
                this.chart.onCloseDrawing();
            }
        }
    }


    public handleDrawingToolSelect = (leftPanel: LeftPanel, toolId: string): void => {
        const drawingType = this.stringToDrawingType(toolId);
        if (drawingType === null) {
            console.warn(`[ToolManager] Unknown tool: ${toolId}`);
            leftPanel.options.onToolSelect?.(toolId);
            return;
        }
        if (this.currentTool === drawingType) {
            this.clearCurrentTool();
            leftPanel.setActiveTool(null);
            return;
        }
        leftPanel.closeAllModals();
        leftPanel.setActiveTool(toolId);
        this.currentTool = drawingType;
        if (!this.chart) return;
        this.executeDrawingCommand(drawingType, leftPanel);
        leftPanel.options.onToolSelect?.(toolId);
    };

    private executeDrawingCommand(drawingType: DrawingType, leftPanel: LeftPanel): void {
        if (!this.chart) return;
        switch (drawingType) {

            case DrawingType.LineSegment:
                this.chart.setLineSegmentMarkMode();
                break;
            case DrawingType.ArrowLine:
                this.chart.setArrowLineMarkMode();
                break;
            case DrawingType.ThickArrowLine:
                this.chart.setThickArrowLineMode();
                break;
            case DrawingType.HorizontalLine:
                this.chart.setHorizontalLineMode();
                break;
            case DrawingType.VerticalLine:
                this.chart.setVerticalLineMode();
                break;


            case DrawingType.ParallelChannel:
                this.chart.setParallelChannelMarkMode();
                break;
            case DrawingType.LinearRegressionChannel:
                this.chart.setLinearRegressionChannelMode();
                break;
            case DrawingType.EquidistantChannel:
                this.chart.setEquidistantChannelMarkMode();
                break;
            case DrawingType.DisjointChannel:
                this.chart.setDisjointChannelMarkMode();
                break;


            case DrawingType.AndrewPitchfork:
                this.chart.setAndrewPitchforkMode();
                break;
            case DrawingType.EnhancedAndrewPitchfork:
                this.chart.setEnhancedAndrewPitchforkMode();
                break;
            case DrawingType.SchiffPitchfork:
                this.chart.setSchiffPitchforkMode();
                break;


            case DrawingType.Rectangle:
                this.chart.setRectangleMarkMode();
                break;
            case DrawingType.Circle:
                this.chart.setCircleMarkMode();
                break;
            case DrawingType.Ellipse:
                this.chart.setEllipseMarkMode();
                break;
            case DrawingType.Triangle:
                this.chart.setTriangleMarkMode();
                break;
            case DrawingType.Sector:
                this.chart.setSectorMode();
                break;
            case DrawingType.Curve:
                this.chart.setCurveMode();
                break;
            case DrawingType.DoubleCurve:
                this.chart.setDoubleCurveMode();
                break;


            case DrawingType.GannFan:
                this.chart.setGannFanMode();
                break;
            case DrawingType.GannBox:
                this.chart.setGannBoxMode();
                break;
            case DrawingType.GannRectangle:
                this.chart.setGannRectangleMode();
                break;


            case DrawingType.FibonacciTimeZoon:
                this.chart.setFibonacciTimeZoonMode();
                break;
            case DrawingType.FibonacciRetracement:
                this.chart.setFibonacciRetracementMode();
                break;
            case DrawingType.FibonacciArc:
                this.chart.setFibonacciArcMode();
                break;
            case DrawingType.FibonacciCircle:
                this.chart.setFibonacciCircleMode();
                break;
            case DrawingType.FibonacciSpiral:
                this.chart.setFibonacciSpiralMode();
                break;
            case DrawingType.FibonacciWedge:
                this.chart.setFibonacciWedgeMode();
                break;
            case DrawingType.FibonacciFan:
                this.chart.setFibonacciFanMode();
                break;
            case DrawingType.FibonacciChannel:
                this.chart.setFibonacciChannelMode();
                break;
            case DrawingType.FibonacciExtensionBasePrice:
                this.chart.setFibonacciExtensionBasePriceMode();
                break;
            case DrawingType.FibonacciExtensionBaseTime:
                this.chart.setFibonacciExtensionBaseTimeMode();
                break;


            case DrawingType.XABCD:
                this.chart.setXABCDMode();
                break;
            case DrawingType.HeadAndShoulders:
                this.chart.setHeadAndShouldersMode();
                break;
            case DrawingType.ABCD:
                this.chart.setABCDMode();
                break;
            case DrawingType.TriangleABCD:
                this.chart.setTriangleABCDMode();
                break;


            case DrawingType.Elliott_Impulse:
                this.chart.setElliottImpulseMode();
                break;
            case DrawingType.Elliott_Corrective:
                this.chart.setElliottCorrectiveMode();
                break;
            case DrawingType.Elliott_Triangle:
                this.chart.setElliottTriangleMode();
                break;
            case DrawingType.Elliott_Double_Combination:
                this.chart.setElliottDoubleCombinationMode();
                break;
            case DrawingType.Elliott_Triple_Combination:
                this.chart.setElliottTripleCombinationMode();
                break;


            case DrawingType.TimeRange:
                this.chart.setTimeRangeMarkMode();
                break;
            case DrawingType.PriceRange:
                this.chart.setPriceRangeMarkMode();
                break;
            case DrawingType.TimePriceRange:
                this.chart.setTimePriceRangeMarkMode();
                break;
            case DrawingType.HeatMap:
                this.chart.setHeatMapMode();
                break;


            case DrawingType.LongPosition:
                this.chart.setLongPositionMarkMode();
                break;
            case DrawingType.ShortPosition:
                this.chart.setShortPositionMarkMode();
                break;


            case DrawingType.MockKLine:
                this.chart.setMockKLineMarkMode();
                break;


            case DrawingType.Pencil:
                this.chart.setPencilMode();
                break;
            case DrawingType.Pen:
                this.chart.setPenMode();
                break;
            case DrawingType.Brush:
                this.chart.setBrushMode();
                break;
            case DrawingType.MarkerPen:
                this.chart.setMarkerPenMode();
                break;
            case DrawingType.Eraser:
                this.chart.setEraserMode();
                break;


            case DrawingType.Text:
                this.chart.setTextEditMarkMode();
                break;
            case DrawingType.PriceNote:
                this.chart.setPriceNoteMarkMode();
                break;
            case DrawingType.BubbleBox:
                this.chart.setBubbleBoxMarkMode();
                break;
            case DrawingType.Pin:
                this.chart.setPinMarkMode();
                break;
            case DrawingType.SignPost:
                this.chart.setSignpostMarkMode();
                break;
            case DrawingType.PriceLabel:
                this.chart.setPriceLabelMode();
                break;
            case DrawingType.Flag:
                this.chart.setFlagMarkMode();
                break;


            case DrawingType.Image:
                this.chart.setImageMarkMode();
                break;


            case DrawingType.Emoji:
                const selectedEmoji = leftPanel.options.state?.selectedEmoji || '😀';
                this.chart.setEmojiMarkMode(selectedEmoji);
                break;


            case DrawingType.TimeEvent:
                this.chart.setTimeEventMode();
                break;
            case DrawingType.PriceEvent:
                this.chart.setPriceEventMode();
                break;


            case DrawingType.TextEdit:
                this.chart.setTextEditMarkMode();
                break;

            default:
                console.warn(`[ToolManager] Unhandled drawing type: ${drawingType}`);
                break;
        }
    }

    private stringToDrawingType(toolId: string): DrawingType | null {
        if (toolId.startsWith('cursor-')) {
            this.handleCursorTool(toolId);
            return null;
        }
        if (toolId === 'show-all-marks' || toolId === 'hide-all-marks' || toolId === 'clear-all-marks') {
            this.handleMarkManagementTool(toolId);
            return null;
        }
        if (toolId === 'openai-chart' || toolId === 'aliyun-chart' ||
            toolId === 'deepseek-chart' || toolId === 'claude-chart' ||
            toolId === 'gemini-chart') {
            return null;
        }
        const mapping: Record<string, DrawingType> = {
            'line-segment': DrawingType.LineSegment,
            'arrow-line': DrawingType.ArrowLine,
            'thick-arrow-line': DrawingType.ThickArrowLine,
            'horizontal-line': DrawingType.HorizontalLine,
            'vertical-line': DrawingType.VerticalLine,
            'parallel-channel': DrawingType.ParallelChannel,
            'linear-regression-channel': DrawingType.LinearRegressionChannel,
            'equidistant-channel': DrawingType.EquidistantChannel,
            'disjoint-channel': DrawingType.DisjointChannel,
            'andrew-pitchfork': DrawingType.AndrewPitchfork,
            'enhanced-andrew-pitch-fork': DrawingType.EnhancedAndrewPitchfork,
            'schiff-pitch-fork': DrawingType.SchiffPitchfork,
            'rectangle': DrawingType.Rectangle,
            'circle': DrawingType.Circle,
            'ellipse': DrawingType.Ellipse,
            'triangle': DrawingType.Triangle,
            'sector': DrawingType.Sector,
            'curve': DrawingType.Curve,
            'double-curve': DrawingType.DoubleCurve,
            'gann-fan': DrawingType.GannFan,
            'gann-box': DrawingType.GannBox,
            'gann-rectang': DrawingType.GannRectangle,
            'fibonacci-time-zoon': DrawingType.FibonacciTimeZoon,
            'fibonacci-retracement': DrawingType.FibonacciRetracement,
            'fibonacci-arc': DrawingType.FibonacciArc,
            'fibonacci-circle': DrawingType.FibonacciCircle,
            'fibonacci-spiral': DrawingType.FibonacciSpiral,
            'fibonacci-wedge': DrawingType.FibonacciWedge,
            'fibonacci-fan': DrawingType.FibonacciFan,
            'fibonacci-channel': DrawingType.FibonacciChannel,
            'fibonacci-extension-base-price': DrawingType.FibonacciExtensionBasePrice,
            'fibonacci-extension-base-time': DrawingType.FibonacciExtensionBaseTime,
            'xabcd': DrawingType.XABCD,
            'head-and-shoulders': DrawingType.HeadAndShoulders,
            'abcd': DrawingType.ABCD,
            'triangle-abcd': DrawingType.TriangleABCD,
            'elliott-impulse': DrawingType.Elliott_Impulse,
            'elliott-lmpulse': DrawingType.Elliott_Impulse,
            'elliott-corrective': DrawingType.Elliott_Corrective,
            'elliott-triangle': DrawingType.Elliott_Triangle,
            'elliott-double-combo': DrawingType.Elliott_Double_Combination,
            'elliott-triple-combo': DrawingType.Elliott_Triple_Combination,
            'time-range': DrawingType.TimeRange,
            'price-range': DrawingType.PriceRange,
            'time-price-range': DrawingType.TimePriceRange,
            'heat-map': DrawingType.HeatMap,
            'long-position': DrawingType.LongPosition,
            'short-position': DrawingType.ShortPosition,
            'mock-kline': DrawingType.MockKLine,
            'pencil': DrawingType.Pencil,
            'pen': DrawingType.Pen,
            'brush': DrawingType.Brush,
            'marker-pen': DrawingType.MarkerPen,
            'eraser': DrawingType.Eraser,
            'text': DrawingType.Text,
            'price-note': DrawingType.PriceNote,
            'bubble-box': DrawingType.BubbleBox,
            'pin': DrawingType.Pin,
            'signpost': DrawingType.SignPost,
            'price-label': DrawingType.PriceLabel,
            'flag-mark': DrawingType.Flag,
            'image': DrawingType.Image,
            'emoji': DrawingType.Emoji,
            'price-event': DrawingType.PriceEvent,
            'time-event': DrawingType.TimeEvent,
        };

        return mapping[toolId] || null;
    }

    private handleCursorTool(toolId: string): void {
        if (!this.chart) return;

        switch (toolId) {
            case 'cursor-crosshair':
                this.chart.setCursorType(CursorType.Crosshair);
                break;
            case 'cursor-circle':
                this.chart.setCursorType(CursorType.Circle);
                break;
            case 'cursor-dot':
                this.chart.setCursorType(CursorType.Dot);
                break;
            case 'cursor-arrow':
                this.chart.setCursorType(CursorType.Default);
                break;
            case 'cursor-sparkle':
                this.chart.setCursorType(CursorType.Crosshair);
                break;
            case 'cursor-emoji':
                this.chart.setCursorType(CursorType.Crosshair);
                break;
            default:
                console.warn(`[ToolManager] Unknown cursor tool: ${toolId}`);
                break;
        }
    }

    private handleMarkManagementTool(toolId: string): void {
        if (!this.chart) return;

        switch (toolId) {
            case 'show-all-marks':
                this.chart.showAllMark();
                break;
            case 'hide-all-marks':
                this.chart.hideAllMark();
                break;
            case 'clear-all-marks':
                this.chart.clearAllMark();
                break;
            default:
                console.warn(`[ToolManager] Unknown mark management tool: ${toolId}`);
                break;
        }
    }

    public handleToolSelect = this.handleDrawingToolSelect;
}