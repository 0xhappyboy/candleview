import { MarkDrawing, Point, CursorType } from '../types';
import { ChartMarkManager } from './ChartMarkManager';

export interface DrawingManagerOptions {
    chartMarkManager: ChartMarkManager;
    onStateUpdate?: (state: Partial<DrawingManagerState>) => void;
    onToolbarShow?: (drawing: MarkDrawing, type: 'graph' | 'text' | 'table') => void;
    onToolbarClose?: () => void;
}

export interface DrawingManagerState {

    isDrawing: boolean;
    drawingPoints: Point[];
    currentDrawing: any;
    drawingStartPoint: Point | null;
    drawings: MarkDrawing[];
    isTextMarkToolbar: boolean;
    dragStartPoint: Point | null;
    isDragging: boolean;
    isResizing: boolean;
    isRotating: boolean;
    resizeHandle: string | null;
    isTextInputActive: boolean;
    textInputPosition: Point | null;
    textInputValue: string;
    textInputCursorVisible: boolean;
    editingTextId: string | null;
    isFirstTimeTextMode: boolean;
    isEmojiInputActive: boolean;
    emojiInputPosition: Point | null;
    editingEmojiId: string | null;
    mousePosition: Point | null;
    selectedTextEditMark: MarkDrawing | null;
    selectedTableMark: MarkDrawing | null;
    selectedGraphMark: MarkDrawing | null;
    markToolBarPosition: { x: number; y: number };
    showGraphMarkToolBar: boolean;
    showTableMarkToolBar: boolean;
    showTextMarkToolBar: boolean;
    isShowGrapTool: boolean;
    isGraphMarkToolbarDragging: boolean;
    graphMarkToolbarDragStartPoint: Point | null;
    cursorType: CursorType | null;


    isPencilMode: boolean;
    isPencilDrawing: boolean;
    currentPencilMark: any;
    pencilPoints: Point[];
    isPenMode: boolean;
    isPenDrawing: boolean;
    currentPenMark: any;
    penPoints: Point[];
    isBrushMode: boolean;
    isBrushDrawing: boolean;
    currentBrushMark: any;
    brushPoints: Point[];
    isMarkerPenMode: boolean;
    isMarkerPenDrawing: boolean;
    currentMarkerPen: any;
    markerPenPoints: Point[];
    isEraserMode: boolean;
    isErasing: boolean;
    eraserHoveredMark: any;


    lineSegmentMarkStartPoint: Point | null;
    arrowLineMarkStartPoint: Point | null;
    thickArrowLineMarkStartPoint: Point | null;
    currentLineSegmentMark: any;
    currentArrowLineMark: any;
    currentThickArrowLineMark: any;


    parallelChannelMarkStartPoint: Point | null;
    currentParallelChannelMark: any;
    linearRegressionChannelStartPoint: Point | null;
    currentLinearRegressionChannel: any;
    equidistantChannelMarkStartPoint: Point | null;
    currentEquidistantChannelMark: any;
    disjointChannelMarkStartPoint: Point | null;
    currentDisjointChannelMark: any;


    andrewPitchforkHandlePoint: Point | null;
    andrewPitchforkBaseStartPoint: Point | null;
    currentAndrewPitchfork: any;
    enhancedAndrewPitchforkHandlePoint: Point | null;
    enhancedAndrewPitchforkBaseStartPoint: Point | null;
    currentEnhancedAndrewPitchfork: any;
    isSchiffPitchforkMode: boolean;
    schiffPitchforkHandlePoint: Point | null;
    schiffPitchforkBaseStartPoint: Point | null;
    currentSchiffPitchfork: any;
    isSchiffPitchforkDragging: boolean;
    schiffPitchforkDragTarget: any;
    schiffPitchforkDragPoint: 'handle' | 'baseStart' | 'baseEnd' | 'line' | null;
    schiffPitchforkDrawingPhase: 'handle' | 'baseStart' | 'baseEnd' | 'none';
    schiffPitchforkAdjustingMode: 'handle' | 'baseStart' | 'baseEnd' | null;


    rectangleMarkStartPoint: Point | null;
    currentRectangleMark: any;
    circleMarkStartPoint: Point | null;
    currentCircleMark: any;
    ellipseMarkStartPoint: Point | null;
    currentEllipseMark: any;
    triangleMarkStartPoint: Point | null;
    currentTriangleMark: any;
    sectorPoints: Point[];
    currentSector: any;
    curveMarkStartPoint: Point | null;
    currentCurveMark: any;
    doubleCurveMarkStartPoint: Point | null;
    currentDoubleCurveMark: any;


    gannFanStartPoint: Point | null;
    currentGannFan: any;
    gannBoxStartPoint: Point | null;
    currentGannBox: any;
    gannRectangleStartPoint: Point | null;
    currentGannRectangle: any;


    fibonacciTimeZoonStartPoint: Point | null;
    currentFibonacciTimeZoon: any;
    fibonacciRetracementStartPoint: Point | null;
    currentFibonacciRetracement: any;
    fibonacciArcStartPoint: Point | null;
    currentFibonacciArc: any;
    fibonacciCircleCenterPoint: Point | null;
    currentFibonacciCircle: any;
    fibonacciSpiralCenterPoint: Point | null;
    currentFibonacciSpiral: any;
    fibonacciWedgeCenterPoint: Point | null;
    currentFibonacciWedge: any;
    fibonacciWedgeDrawingStep: number;
    fibonacciWedgePoints: Point[];
    fibonacciFanStartPoint: Point | null;
    currentFibonacciFan: any;
    currentFibonacciChannel: any;
    isFibonacciChannelMode: boolean;
    fibonacciChannelDrawingStep: number;
    fibonacciExtensionBasePricePoints: Point[];
    currentFibonacciExtensionBasePrice: any;
    fibonacciExtensionBaseTimePoints: Point[];
    currentFibonacciExtensionBaseTime: any;


    xabcdPoints: Point[];
    currentXABCDMark: any;
    headAndShouldersPoints: Point[];
    currentHeadAndShouldersMark: any;
    abcdPoints: Point[];
    currentABCDMark: any;
    triangleABCDPoints: Point[];
    currentTriangleABCDMark: any;


    elliottImpulsePoints: Point[];
    currentElliottImpulseMark: any;
    elliottCorrectivePoints: Point[];
    currentElliottCorrectiveMark: any;
    elliottTrianglePoints: Point[];
    currentElliottTriangleMark: any;
    elliottDoubleCombinationPoints: Point[];
    currentElliottDoubleCombinationMark: any;
    elliottTripleCombinationPoints: Point[];
    currentElliottTripleCombinationMark: any;


    timeRangeMarkStartPoint: Point | null;
    currentTimeRangeMark: any;
    isTimeRangeMarkMode: boolean;
    priceRangeMarkStartPoint: Point | null;
    currentPriceRangeMark: any;
    isPriceRangeMarkMode: boolean;
    timePriceRangeMarkStartPoint: Point | null;
    currentTimePriceRangeMark: any;
    isTimePriceRangeMarkMode: boolean;
    isHeatMapMode: boolean;
    heatMapStartPoint: Point | null;
    currentHeatMap: any;
    isHeatMapDragging: boolean;
    heatMapDragTarget: any;
    heatMapDragPoint: 'start' | 'end' | 'body' | null;
    heatMapDrawingPhase: 'firstPoint' | 'secondPoint' | 'none';
    heatMapAdjustingMode: 'start' | 'end' | 'body' | null;


    isLongPositionMarkMode: boolean;
    longPositionMarkStartPoint: Point | null;
    currentLongPositionMark: any;
    longPositionDrawingPhase: 'firstPoint' | 'secondPoint' | 'none';
    isLongPositionDragging: boolean;
    dragTarget: any;
    dragPoint: string | null;
    adjustingMode: string | null;
    adjustStartData: { time: string; price: number } | null;

    isShortPositionMarkMode: boolean;
    shortPositionMarkStartPoint: Point | null;
    currentShortPositionMark: any;
    shortPositionDrawingPhase: 'firstPoint' | 'secondPoint' | 'none';
    isShortPositionDragging: boolean;
    shortPositionDragTarget: any;
    shortPositionDragPoint: string | null;
    shortPositionAdjustingMode: string | null;
    shortPositionAdjustStartData: { time: string; price: number } | null;


    isPriceLabelMarkMode: boolean;
    priceLabelMarkPoint: Point | null;
    currentPriceLabelMark: any;
    isPriceLabelDragging: boolean;
    priceLabelDragTarget: any;

    isFlagMarkMode: boolean;
    flagMarkPoint: Point | null;
    currentFlagMark: any;
    isFlagDragging: boolean;
    flagDragTarget: any;

    isPriceNoteMarkMode: boolean;
    priceNoteMarkStartPoint: Point | null;
    currentPriceNoteMark: any;
    isPriceNoteDragging: boolean;
    priceNoteDragTarget: any;
    priceNoteDragPoint: 'start' | 'end' | 'line' | null;

    isSignpostMarkMode: boolean;
    signpostMarkPoint: Point | null;
    currentSignpostMark: any;
    isSignpostDragging: boolean;
    signpostDragTarget: any;

    isEmojiMarkMode: boolean;
    emojiMarkStartPoint: Point | null;
    currentEmojiMark: any;
    isEmojiDragging: boolean;
    emojiDragTarget: any;
    emojiDragPoint: 'start' | 'end' | 'line' | null;

    isPinMarkMode: boolean;
    pinMarkPoint: Point | null;
    currentPinMark: any;
    isPinDragging: boolean;
    pinDragTarget: any;

    isBubbleBoxMarkMode: boolean;
    bubbleBoxMarkPoints: Point[] | null;
    currentBubbleBoxMark: any;
    isBubbleBoxDragging: boolean;
    bubbleBoxDragTarget: any;
    bubbleBoxDragType: 'controlPoint' | 'bubble' | 'connection' | null;

    isTextEditMarkMode: boolean;
    isTextEditDragging: boolean;
    textEditDragTarget: any;


    isImageMarkMode: boolean;
    imageMarkStartPoint: Point | null;
    currentImageMark: any;
    showImageModal: boolean;
    selectedImageUrl: string;
    isImageUploadModalOpen: boolean;


    isMockKLineMarkMode: boolean;
    mockKLineMarkStartPoint: Point | null;
    currentMockKLineMark: any;
    isMockKLineDragging: boolean;
    mockKLineDragTarget: any;
    mockKLineDragPoint: 'start' | 'end' | 'line' | null;


    isTimeEventMode: boolean;
    isTimeEventDragging: boolean;
    timeEventDragTarget: any;
    currentTimeEventMark: any;
    isPriceEventMode: boolean;
    isPriceEventDragging: boolean;
    priceEventDragTarget: any;
    currentPriceEventMark: any;


    isTextMarkEditorOpen: boolean;
    textMarkEditorPosition: { x: number; y: number };
    textMarkEditorInitialData: {
        text: string;
        color: string;
        fontSize: number;
        isBold: boolean;
        isItalic: boolean;
    };
    pendingEmojiMark: string | null;
}



export class DrawingManager {
    private chartMarkManager: ChartMarkManager | null = null;
    private onStateUpdate?: (state: Partial<DrawingManagerState>) => void;
    private onToolbarShow?: (drawing: MarkDrawing, type: 'graph' | 'text' | 'table') => void;
    private onToolbarClose?: () => void;
    private state: DrawingManagerState = {} as DrawingManagerState;

    constructor(options: DrawingManagerOptions) {
        this.chartMarkManager = options.chartMarkManager;
        this.onStateUpdate = options.onStateUpdate;
        this.onToolbarShow = options.onToolbarShow;
        this.onToolbarClose = options.onToolbarClose;
    }

    public updateState(updates: Partial<DrawingManagerState>): void {
        this.state = { ...this.state, ...updates };
        this.onStateUpdate?.(updates);
    }

    public getState(): DrawingManagerState {
        return this.state;
    }

    public getCursorType(): CursorType | null {
        return this.state.cursorType;
    }

    public setCursorType(cursorType: CursorType): void {
        this.updateState({ cursorType });
    }


    public closeAllBrushTools(): void {
        this.updateState({
            isPencilMode: false,
            isPencilDrawing: false,
            isPenMode: false,
            isPenDrawing: false,
            isBrushMode: false,
            isBrushDrawing: false,
            isMarkerPenMode: false,
            isMarkerPenDrawing: false,
            isEraserMode: false,
            isErasing: false,
        });
    }


    public setLineSegmentMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            lineSegmentMarkStartPoint: null,
        });
        this.chartMarkManager?.setLineSegmentMarkMode(this as any);
    }

    public setArrowLineMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            arrowLineMarkStartPoint: null,
        });
        this.chartMarkManager?.setArrowLineMarkMode(this as any);
    }

    public setThickArrowLineMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            thickArrowLineMarkStartPoint: null,
        });
        this.chartMarkManager?.setThickArrowLineMode(this as any);
    }

    public setHorizontalLineMode(): void {
        this.closeAllBrushTools();
        this.chartMarkManager?.setHorizontalLineMode(this as any);
    }

    public setVerticalLineMode(): void {
        this.closeAllBrushTools();
        this.chartMarkManager?.setVerticalLineMode(this as any);
    }


    public setParallelChannelMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            parallelChannelMarkStartPoint: null,
        });
        this.chartMarkManager?.setParallelChannelMarkMode(this as any);
    }

    public setLinearRegressionChannelMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            linearRegressionChannelStartPoint: null,
        });
        this.chartMarkManager?.setLinearRegressionChannelMode(this as any);
    }

    public setEquidistantChannelMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            equidistantChannelMarkStartPoint: null,
        });
        this.chartMarkManager?.setEquidistantChannelMarkMode(this as any);
    }

    public setDisjointChannelMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            disjointChannelMarkStartPoint: null,
        });
        this.chartMarkManager?.setDisjointChannelMarkMode(this as any);
    }


    public setAndrewPitchforkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            andrewPitchforkHandlePoint: null,
            andrewPitchforkBaseStartPoint: null,
        });
        this.chartMarkManager?.setAndrewPitchforkMode(this as any);
    }

    public setEnhancedAndrewPitchforkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            enhancedAndrewPitchforkHandlePoint: null,
            enhancedAndrewPitchforkBaseStartPoint: null,
        });
        this.chartMarkManager?.setEnhancedAndrewPitchforkMode(this as any);
    }

    public setSchiffPitchforkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isSchiffPitchforkMode: true,
        });
        this.chartMarkManager?.setSchiffPitchforkMode(this as any);
    }


    public setRectangleMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            rectangleMarkStartPoint: null,
        });
        this.chartMarkManager?.setRectangleMarkMode(this as any);
    }

    public setCircleMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            circleMarkStartPoint: null,
        });
        this.chartMarkManager?.setCircleMarkMode(this as any);
    }

    public setEllipseMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            ellipseMarkStartPoint: null,
        });
        this.chartMarkManager?.setEllipseMarkMode(this as any);
    }

    public setTriangleMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            triangleMarkStartPoint: null,
        });
        this.chartMarkManager?.setTriangleMarkMode(this as any);
    }

    public setSectorMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            sectorPoints: [],
        });
        this.chartMarkManager?.setSectorMode(this as any);
    }

    public setCurveMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            curveMarkStartPoint: null,
        });
        this.chartMarkManager?.setCurveMode(this as any);
    }

    public setDoubleCurveMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            doubleCurveMarkStartPoint: null,
        });
        this.chartMarkManager?.setDoubleCurveMode(this as any);
    }


    public setGannFanMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            gannFanStartPoint: null,
        });
        this.chartMarkManager?.setGannFanMode(this as any);
    }

    public setGannBoxMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            gannBoxStartPoint: null,
        });
        this.chartMarkManager?.setGannBoxMode(this as any);
    }

    public setGannRectangleMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            gannRectangleStartPoint: null,
        });
        this.chartMarkManager?.setGannRectangleMode(this as any);
    }


    public setFibonacciTimeZoonMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            fibonacciTimeZoonStartPoint: null,
        });
        this.chartMarkManager?.setFibonacciTimeZoonMode(this as any);
    }

    public setFibonacciRetracementMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            fibonacciRetracementStartPoint: null,
        });
        this.chartMarkManager?.setFibonacciRetracementMode(this as any);
    }

    public setFibonacciArcMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            fibonacciArcStartPoint: null,
        });
        this.chartMarkManager?.setFibonacciArcMode(this as any);
    }

    public setFibonacciCircleMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            fibonacciCircleCenterPoint: null,
        });
        this.chartMarkManager?.setFibonacciCircleMode(this as any);
    }

    public setFibonacciSpiralMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            fibonacciSpiralCenterPoint: null,
        });
        this.chartMarkManager?.setFibonacciSpiralMode(this as any);
    }

    public setFibonacciWedgeMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            fibonacciWedgeCenterPoint: null,
            fibonacciWedgeDrawingStep: 0,
            fibonacciWedgePoints: [],
        });
        this.chartMarkManager?.setFibonacciWedgeMode(this as any);
    }

    public setFibonacciFanMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            fibonacciFanStartPoint: null,
        });
        this.chartMarkManager?.setFibonacciFanMode(this as any);
    }

    public setFibonacciChannelMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isFibonacciChannelMode: true,
            fibonacciChannelDrawingStep: 0,
        });
        this.chartMarkManager?.setFibonacciChannelMode(this as any);
    }

    public setFibonacciExtensionBasePriceMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            fibonacciExtensionBasePricePoints: [],
        });
        this.chartMarkManager?.setFibonacciExtensionBasePriceMode(this as any);
    }

    public setFibonacciExtensionBaseTimeMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            fibonacciExtensionBaseTimePoints: [],
        });
        this.chartMarkManager?.setFibonacciExtensionBaseTimeMode(this as any);
    }


    public setXABCDMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            xabcdPoints: [],
        });
        this.chartMarkManager?.setXABCDMode(this as any);
    }

    public setHeadAndShouldersMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            headAndShouldersPoints: [],
        });
        this.chartMarkManager?.setHeadAndShouldersMode(this as any);
    }

    public setABCDMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            abcdPoints: [],
        });
        this.chartMarkManager?.setABCDMode(this as any);
    }

    public setTriangleABCDMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            triangleABCDPoints: [],
        });
        this.chartMarkManager?.setTriangleABCDMode(this as any);
    }


    public setElliottImpulseMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            elliottImpulsePoints: [],
        });
        this.chartMarkManager?.setElliottImpulseMode(this as any);
    }

    public setElliottCorrectiveMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            elliottCorrectivePoints: [],
        });
        this.chartMarkManager?.setElliottCorrectiveMode(this as any);
    }

    public setElliottTriangleMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            elliottTrianglePoints: [],
        });
        this.chartMarkManager?.setElliottTriangleMode(this as any);
    }

    public setElliottDoubleCombinationMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            elliottDoubleCombinationPoints: [],
        });
        this.chartMarkManager?.setElliottDoubleCombinationMode(this as any);
    }

    public setElliottTripleCombinationMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            elliottTripleCombinationPoints: [],
        });
        this.chartMarkManager?.setElliottTripleCombinationMode(this as any);
    }


    public setTimeRangeMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            timeRangeMarkStartPoint: null,
        });
        this.chartMarkManager?.setTimeRangeMarkMode(this as any);
    }

    public setPriceRangeMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            priceRangeMarkStartPoint: null,
        });
        this.chartMarkManager?.setPriceRangeMarkMode(this as any);
    }

    public setTimePriceRangeMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            timePriceRangeMarkStartPoint: null,
        });
        this.chartMarkManager?.setTimePriceRangeMarkMode(this as any);
    }

    public setHeatMapMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isHeatMapMode: true,
        });
        this.chartMarkManager?.setHeatMapMode(this as any);
    }


    public setLongPositionMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isLongPositionMarkMode: true,
        });
        this.chartMarkManager?.setLongPositionMarkMode(this as any);
    }

    public setShortPositionMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isShortPositionMarkMode: true,
        });
        this.chartMarkManager?.setShortPositionMarkMode(this as any);
    }


    public setMockKLineMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isMockKLineMarkMode: true,
        });
        this.chartMarkManager?.setMockKLineMarkMode(this as any);
    }


    public setPencilMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isPencilMode: true,
            isPencilDrawing: false,
            pencilPoints: [],
        });
        this.chartMarkManager?.setPencilMode(this as any);
    }

    public setPenMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isPenMode: true,
            isPenDrawing: false,
            penPoints: [],
        });
        this.chartMarkManager?.setPenMode(this as any);
    }

    public setBrushMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isBrushMode: true,
            isBrushDrawing: false,
            brushPoints: [],
        });
        this.chartMarkManager?.setBrushMode(this as any);
    }

    public setMarkerPenMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isMarkerPenMode: true,
            isMarkerPenDrawing: false,
            markerPenPoints: [],
        });
        this.chartMarkManager?.setMarkerPenMode(this as any);
    }

    public setEraserMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isEraserMode: true,
            isErasing: false,
        });
        this.chartMarkManager?.setEraserMode(this as any);
    }


    public setTextEditMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isTextEditMarkMode: true,
        });
        this.chartMarkManager?.setTextEditMarkMode(this as any);
    }

    public setPriceNoteMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isPriceNoteMarkMode: true,
        });
        this.chartMarkManager?.setPriceNoteMarkMode(this as any);
    }

    public setBubbleBoxMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isBubbleBoxMarkMode: true,
        });
        this.chartMarkManager?.setBubbleBoxMarkMode(this as any);
    }

    public setPinMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isPinMarkMode: true,
        });
        this.chartMarkManager?.setPinMarkMode(this as any);
    }

    public setSignpostMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isSignpostMarkMode: true,
        });
        this.chartMarkManager?.setSignpostMarkMode(this as any);
    }

    public setPriceLabelMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isPriceLabelMarkMode: true,
        });
        this.chartMarkManager?.setPriceLabelMode(this as any);
    }

    public setFlagMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isFlagMarkMode: true,
        });
        this.chartMarkManager?.setFlagMarkMode(this as any);
    }


    public setImageMarkMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isImageUploadModalOpen: true,
        });
    }


    public setEmojiMarkMode(emoji: string): void {
        this.closeAllBrushTools();
        this.updateState({
            isEmojiMarkMode: true,
        });
        this.chartMarkManager?.setEmojiMarkMode(this as any, emoji);
    }


    public setPriceEventMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isPriceEventMode: true,
        });
        this.chartMarkManager?.setPriceEventMode(this as any);
    }

    public setTimeEventMode(): void {
        this.closeAllBrushTools();
        this.updateState({
            isTimeEventMode: true,
        });
        this.chartMarkManager?.setTimeEventMode(this as any);
    }


    public showGraphMarkToolBar(drawing: MarkDrawing): void {
        if (this.state.selectedGraphMark && this.state.selectedGraphMark.id === drawing.id) return;
        if (this.state.selectedGraphMark) return;

        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            toolbarPosition = {
                x: Math.max(10, point.x - 150),
                y: Math.max(10, point.y - 80)
            };
        }

        this.updateState({
            selectedGraphMark: drawing,
            markToolBarPosition: toolbarPosition,
            showGraphMarkToolBar: true
        });
        this.onToolbarShow?.(drawing, 'graph');
    }

    public closeGraphMarkToolBar(): void {
        this.updateState({ showGraphMarkToolBar: false });
        this.onToolbarClose?.();
    }

    public showTableMarkToolBar(drawing: MarkDrawing): void {
        if (this.state.selectedTableMark && this.state.selectedTableMark.id === drawing.id) return;
        if (this.state.selectedTableMark) return;

        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            toolbarPosition = {
                x: Math.max(10, point.x - 150),
                y: Math.max(10, point.y - 80)
            };
        }

        this.updateState({
            selectedTableMark: drawing,
            markToolBarPosition: toolbarPosition,
            showTableMarkToolBar: true
        });
        this.onToolbarShow?.(drawing, 'table');
    }

    public closeTableMarkToolBar(): void {
        this.updateState({ showTableMarkToolBar: false });
        this.onToolbarClose?.();
    }

    public showTextEditMarkToolBar(drawing: MarkDrawing, isShowGrapTool: boolean): void {
        if (this.state.selectedTextEditMark && this.state.selectedTextEditMark.id === drawing.id) return;
        if (this.state.selectedTextEditMark) return;

        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            toolbarPosition = {
                x: Math.max(10, point.x - 150),
                y: Math.max(10, point.y - 80)
            };
        }

        this.updateState({
            selectedTextEditMark: drawing,
            markToolBarPosition: toolbarPosition,
            showTextMarkToolBar: true,
            isShowGrapTool: isShowGrapTool,
        });
        this.onToolbarShow?.(drawing, 'text');
    }

    public closeTextMarkToolBar(): void {
        this.updateState({ showTextMarkToolBar: false });
        this.onToolbarClose?.();
    }

    public handleDeleteGraphMark(): void {
        if (!this.state.selectedGraphMark) return;
        const drawing = this.state.selectedGraphMark;
        if (drawing.properties?.originalMark) {
            this.chartMarkManager?.deleteMark(drawing.markType, drawing.properties.originalMark);
        }
        this.closeGraphMarkToolBar();
    }

    public handleDeleteTextEditMark(): void {
        if (!this.state.selectedTextEditMark) return;
        const textMark = this.state.selectedTextEditMark;
        const markType = textMark.markType;
        this.chartMarkManager?.deleteMark(markType, textMark.properties.originalMark);
        this.updateState({
            selectedTextEditMark: null,
            markToolBarPosition: { x: 20, y: 20 }
        });
    }


    public openTextMarkEditor(position: { x: number; y: number }, initialData: {
        text: string;
        color: string;
        fontSize: number;
        isBold: boolean;
        isItalic: boolean;
    }): void {

    }


    public setSelectedImageUrl(url: string): void {
        this.updateState({ selectedImageUrl: url });
    }

    public handleImageConfirm(imageUrl: string): void {
        this.updateState({
            selectedImageUrl: imageUrl,
            isImageUploadModalOpen: false
        });
        if (this.chartMarkManager?.imageMarkManager) {
            this.chartMarkManager.imageMarkManager.setSelectedImageUrl(imageUrl);
            this.updateState({
                isImageMarkMode: true,
                imageMarkStartPoint: null,
                currentImageMark: null,
            });
        }
    }

    public handleImageUploadClose(): void {
        this.updateState({ isImageUploadModalOpen: false });
    }


    public showAllMark(): void {
        this.closeAllBrushTools();
        this.chartMarkManager?.showAllMarks();
    }

    public hideAllMark(): void {
        this.closeAllBrushTools();
        this.chartMarkManager?.hideAllMarks();
    }

    public clearAllMark(): void {
        this.closeAllBrushTools();
        this.chartMarkManager?.deleteAllMark();
    }


    public startToolbarDrag(startPoint: Point, type: 'text' | 'graph'): void {
        if (type === 'text') {
            this.updateState({
                isTextMarkToolbar: true,
                dragStartPoint: startPoint
            });
        } else {
            this.updateState({
                isGraphMarkToolbarDragging: true,
                graphMarkToolbarDragStartPoint: startPoint
            });
        }
    }

    public updateToolbarPosition(deltaX: number, deltaY: number): void {
        this.updateState({
            markToolBarPosition: {
                x: Math.max(0, this.state.markToolBarPosition.x + deltaX),
                y: Math.max(0, this.state.markToolBarPosition.y + deltaY)
            }
        });
    }

    public endToolbarDrag(type: 'text' | 'graph'): void {
        if (type === 'text') {
            this.updateState({
                isTextMarkToolbar: false,
                dragStartPoint: null
            });
        } else {
            this.updateState({
                isGraphMarkToolbarDragging: false,
                graphMarkToolbarDragStartPoint: null
            });
        }
    }


    public destroy(): void {
        this.chartMarkManager = null;
        this.onStateUpdate = undefined;
        this.onToolbarShow = undefined;
        this.onToolbarClose = undefined;
    }
}