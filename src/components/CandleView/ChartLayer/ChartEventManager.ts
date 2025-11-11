import { MouseEventParams } from "lightweight-charts";
import { ChartLayer } from ".";
import { Drawing, MarkType, markTypeName, Point } from "../types";
import { IGraph } from "../Mark/Graph/IGraph";
import { IGraphStyle } from "../Mark/Graph/IGraphStyle";

export class ChartEventManager {
    constructor() { }
    public registerClickEvent(chart: any, callback: (event: MouseEventParams) => void): void {
        chart.subscribeClick((event: MouseEventParams) => callback(event));
    }
    public registerDblClickEvent(chart: any, callback: (event: MouseEventParams) => void): void {
        chart.subscribeDblClick((event: MouseEventParams) => callback(event));
    }
    public registerCrosshairMoveEvent(chart: any, callback: (event: MouseEventParams) => void): void {
        chart.subscribeCrosshairMove((event: MouseEventParams) => callback(event));
    }
    public registerVisibleTimeRangeChangeEvent(chart: any, callback: (event: { from: number, to: number } | null) => void): void {
        chart.timeScale().subscribeVisibleTimeRangeChange((event: { from: number, to: number } | null) => callback(event));
    }
    public registerVisibleLogicalRangeChangeEvent(chart: any, callback: (event: { from: number, to: number } | null) => void): void {
        chart.timeScale().subscribeVisibleLogicalRangeChange((event: { from: number, to: number } | null) => callback(event));
    }
    // =============================== Keyboard events start ===============================
    public handleKeyDown = (chartLayer: ChartLayer, event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (chartLayer.state.currentMarkMode === MarkType.LineSegment) {
                if (chartLayer.lineSegmentMarkManager) {
                    const newState = chartLayer.lineSegmentMarkManager.handleKeyDown(event);
                    chartLayer.setState({
                        lineSegmentMarkStartPoint: newState.lineSegmentMarkStartPoint,
                        currentLineSegmentMark: newState.currentLineSegmentMark
                    });
                }
            }
            if (chartLayer.gannRectangleMarkManager && chartLayer.state.currentMarkMode === MarkType.GannRectangle) {
                const newState = chartLayer.gannRectangleMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    gannRectangleStartPoint: newState.gannRectangleStartPoint,
                    currentGannRectangle: newState.currentGannRectangle,
                });
            }
            if (chartLayer.fibonacciTimeZoonMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciTimeZoon) {
                const newState = chartLayer.fibonacciTimeZoonMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciTimeZoonStartPoint: newState.fibonacciTimeZoonStartPoint,
                    currentFibonacciTimeZoon: newState.currentFibonacciTimeZoon,
                });
            }
            if (chartLayer.fibonacciRetracementMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciRetracement) {
                const newState = chartLayer.fibonacciRetracementMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciRetracementStartPoint: newState.fibonacciRetracementStartPoint,
                    currentFibonacciRetracement: newState.currentFibonacciRetracement,
                });
            }
            if (chartLayer.fibonacciCircleMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciCircle) {
                const newState = chartLayer.fibonacciCircleMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciCircleCenterPoint: newState.fibonacciCircleCenterPoint,
                    currentFibonacciCircle: newState.currentFibonacciCircle,
                });
            }
            if (chartLayer.fibonacciSpiralMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciSpiral) {
                const newState = chartLayer.fibonacciSpiralMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciSpiralCenterPoint: newState.fibonacciSpiralCenterPoint,
                    currentFibonacciSpiral: newState.currentFibonacciSpiral,
                });
            }
            if (chartLayer.fibonacciFanMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciFan) {
                const newState = chartLayer.fibonacciFanMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciFanStartPoint: newState.fibonacciFanStartPoint,
                    currentFibonacciFan: newState.currentFibonacciFan,
                });
            }
            if (chartLayer.fibonacciExtensionBasePriceMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciExtensionBasePrice) {
                const newState = chartLayer.fibonacciExtensionBasePriceMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciExtensionBasePricePoints: newState.fibonacciExtensionBasePricePoints,
                    currentFibonacciExtensionBasePrice: newState.currentFibonacciExtensionBasePrice,
                });
            }
            if (chartLayer.triangleABCDMarkManager && chartLayer.state.currentMarkMode === MarkType.TriangleABCD) {
                const newState = chartLayer.triangleABCDMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    triangleABCDPoints: newState.currentPoints,
                    currentTriangleABCDMark: newState.currentTriangleABCDMark,
                });
            }
        }
    };
    // =============================== Keyboard events end ===============================

    // =============================== mouse events start ===============================
    public mouseUp(chartLayer: ChartLayer, event: MouseEvent) { }

    public mouseMove(chartLayer: ChartLayer, event: MouseEvent) { }

    public mouseDown(chartLayer: ChartLayer, event: MouseEvent) {
        if (!chartLayer.containerRef.current || !chartLayer.containerRef.current.contains(event.target as Node)) {
            return;
        }
        const point = this.getMousePosition(chartLayer, event);
        if (!point) return;
        if (chartLayer.state.currentMarkMode === MarkType.Emoji && chartLayer.state.pendingEmojiMark) {
            chartLayer.placeEmojiMark(point, chartLayer.state.pendingEmojiMark);
            event.preventDefault();
            event.stopPropagation();
            if (chartLayer.props.onCloseDrawing) {
                chartLayer.props.onCloseDrawing();
            }
            return;
        }
        if (chartLayer.state.currentMarkMode === MarkType.Text) {
            chartLayer.placeTextMark(point);
            event.preventDefault();
            event.stopPropagation();
            if (chartLayer.props.onCloseDrawing) {
                chartLayer.props.onCloseDrawing();
            }
            return;
        }
    }

    public documentMouseDown(chartLayer: ChartLayer, event: MouseEvent) {
        if (!chartLayer.containerRef.current) return;
        const rect = chartLayer.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
            const point = this.getMousePosition(chartLayer, event);
            if (point) {
                // ========= 图形样式操作 =========
                this.handleGraphStyle(chartLayer, point);
                // ==============================

                if (chartLayer.timeRangeMarkManager) {
                    const timeRangeState = chartLayer.timeRangeMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        timeRangeMarkStartPoint: timeRangeState.timeRangeMarkStartPoint,
                        currentTimeRangeMark: timeRangeState.currentTimeRangeMark,
                    });
                    if (chartLayer.timeRangeMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.elliottTripleCombinationMarkManager) {
                    const elliottTripleState = chartLayer.elliottTripleCombinationMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        elliottTripleCombinationPoints: elliottTripleState.currentPoints,
                        currentElliottTripleCombinationMark: elliottTripleState.currentElliottTripleCombinationMark,
                    });
                    if (chartLayer.elliottTripleCombinationMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.elliottDoubleCombinationMarkManager) {
                    const elliottDoubleCombinationState = chartLayer.elliottDoubleCombinationMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        elliottDoubleCombinationPoints: elliottDoubleCombinationState.currentPoints,
                        currentElliottDoubleCombinationMark: elliottDoubleCombinationState.currentElliottDoubleCombinationMark,
                    });
                    if (chartLayer.elliottDoubleCombinationMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.elliottTriangleMarkManager) {
                    const elliottTriangleState = chartLayer.elliottTriangleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        elliottTrianglePoints: elliottTriangleState.currentPoints,
                        currentElliottTriangleMark: elliottTriangleState.currentElliottTriangleMark,
                    });
                    if (chartLayer.elliottTriangleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.elliottCorrectiveMarkManager) {
                    const elliottCorrectiveState = chartLayer.elliottCorrectiveMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        elliottCorrectivePoints: elliottCorrectiveState.currentPoints,
                        currentElliottCorrectiveMark: elliottCorrectiveState.currentElliottCorrectiveMark,
                    });
                    if (chartLayer.elliottCorrectiveMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.elliottImpulseMarkManager) {
                    const elliottImpulseState = chartLayer.elliottImpulseMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        elliottImpulsePoints: elliottImpulseState.currentPoints,
                        currentElliottImpulseMark: elliottImpulseState.currentElliottImpulseMark,
                    });
                    if (chartLayer.elliottImpulseMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.triangleABCDMarkManager) {
                    const triangleABCDState = chartLayer.triangleABCDMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        triangleABCDPoints: triangleABCDState.currentPoints,
                        currentTriangleABCDMark: triangleABCDState.currentTriangleABCDMark,
                    });
                    if (chartLayer.triangleABCDMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.abcdMarkManager) {
                    const abcdState = chartLayer.abcdMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        abcdPoints: abcdState.currentPoints,
                        currentABCDMark: abcdState.currentABCDMark,
                    });
                    if (chartLayer.abcdMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.headAndShouldersMarkManager) {
                    const headAndShouldersState = chartLayer.headAndShouldersMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        headAndShouldersPoints: headAndShouldersState.currentPoints,
                        currentHeadAndShouldersMark: headAndShouldersState.currentHeadAndShouldersMark,
                    });
                    if (chartLayer.headAndShouldersMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.xabcdMarkManager) {
                    const xabcdState = chartLayer.xabcdMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        xabcdPoints: xabcdState.currentPoints,
                        currentXABCDMark: xabcdState.currentXABCDMark,
                    });
                    if (chartLayer.xabcdMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.doubleCurveMarkManager) {
                    const doubleCurveMarkManagerState = chartLayer.doubleCurveMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        doubleCurveMarkStartPoint: doubleCurveMarkManagerState.doubleCurveMarkStartPoint,
                        currentDoubleCurveMark: doubleCurveMarkManagerState.currentDoubleCurveMark,
                    });
                    if (chartLayer.doubleCurveMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.curveMarkManager) {
                    const curveMarkManagerState = chartLayer.curveMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        curveMarkStartPoint: curveMarkManagerState.curveMarkStartPoint,
                        currentCurveMark: curveMarkManagerState.currentCurveMark,
                    });
                    if (chartLayer.curveMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.sectorMarkManager) {
                    const sectorMarkManagerState = chartLayer.sectorMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        sectorPoints: sectorMarkManagerState.sectorPoints,
                        currentSector: sectorMarkManagerState.currentSector,
                    });
                    if (chartLayer.sectorMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.fibonacciExtensionBaseTimeMarkManager) {
                    const fibonacciExtensionBaseTimeState = chartLayer.fibonacciExtensionBaseTimeMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciExtensionBaseTimePoints: fibonacciExtensionBaseTimeState.fibonacciExtensionBaseTimePoints,
                        currentFibonacciExtensionBaseTime: fibonacciExtensionBaseTimeState.currentFibonacciExtensionBaseTime,
                    });
                    if (chartLayer.fibonacciExtensionBaseTimeMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.fibonacciExtensionBasePriceMarkManager) {
                    const fibonacciExtensionState = chartLayer.fibonacciExtensionBasePriceMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciExtensionBasePricePoints: fibonacciExtensionState.fibonacciExtensionBasePricePoints,
                        currentFibonacciExtensionBasePrice: fibonacciExtensionState.currentFibonacciExtensionBasePrice,
                    });
                    if (chartLayer.fibonacciExtensionBasePriceMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.fibonacciChannelMarkManager) {
                    const fibonacciChannelState = chartLayer.fibonacciChannelMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        currentFibonacciChannel: fibonacciChannelState.currentFibonacciChannelMark,
                        isFibonacciChannelMode: fibonacciChannelState.isFibonacciChannelMarkMode,
                        fibonacciChannelDrawingStep: chartLayer.getDrawingStepFromPhase(fibonacciChannelState.drawingPhase),
                    });
                    if (chartLayer.fibonacciChannelMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.fibonacciFanMarkManager) {
                    const fibonacciFanMarkManagerState = chartLayer.fibonacciFanMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciFanStartPoint: fibonacciFanMarkManagerState.fibonacciFanStartPoint,
                        currentFibonacciFan: fibonacciFanMarkManagerState.currentFibonacciFan,
                    });
                    if (chartLayer.fibonacciFanMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.fibonacciWedgeMarkManager) {
                    const fibonacciWedgeMarkManagerState = chartLayer.fibonacciWedgeMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciWedgePoints: fibonacciWedgeMarkManagerState.fibonacciWedgePoints,
                        currentFibonacciWedge: fibonacciWedgeMarkManagerState.currentFibonacciWedge,
                    });
                    if (chartLayer.fibonacciWedgeMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.fibonacciSpiralMarkManager) {
                    const fibonacciSpiralMarkManagerState = chartLayer.fibonacciSpiralMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciSpiralCenterPoint: fibonacciSpiralMarkManagerState.fibonacciSpiralCenterPoint,
                        currentFibonacciSpiral: fibonacciSpiralMarkManagerState.currentFibonacciSpiral,
                    });
                    if (chartLayer.fibonacciSpiralMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.fibonacciCircleMarkManager) {
                    const fibonacciCircleMarkManagerState = chartLayer.fibonacciCircleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciCircleCenterPoint: fibonacciCircleMarkManagerState.fibonacciCircleCenterPoint,
                        currentFibonacciCircle: fibonacciCircleMarkManagerState.currentFibonacciCircle,
                    });
                    if (chartLayer.fibonacciCircleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.fibonacciArcMarkManager) {
                    const fibonacciArcMarkManagerState = chartLayer.fibonacciArcMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciArcStartPoint: fibonacciArcMarkManagerState.fibonacciArcStartPoint,
                        currentFibonacciArc: fibonacciArcMarkManagerState.currentFibonacciArc,
                    });
                    if (chartLayer.fibonacciArcMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.fibonacciRetracementMarkManager
                ) {
                    const fibonacciRetracementMarkManagerState = chartLayer.fibonacciRetracementMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciRetracementStartPoint: fibonacciRetracementMarkManagerState.fibonacciRetracementStartPoint,
                        currentFibonacciRetracement: fibonacciRetracementMarkManagerState.currentFibonacciRetracement,
                    });
                    if (chartLayer.fibonacciRetracementMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.fibonacciTimeZoonMarkManager
                ) {
                    const fibonacciTimeZoonMarkManagerState = chartLayer.fibonacciTimeZoonMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciTimeZoonStartPoint: fibonacciTimeZoonMarkManagerState.fibonacciTimeZoonStartPoint,
                        currentFibonacciTimeZoon: fibonacciTimeZoonMarkManagerState.currentFibonacciTimeZoon,
                    });
                    if (chartLayer.fibonacciTimeZoonMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.gannRectangleMarkManager
                ) {
                    const gannRectangleMarkManagerState = chartLayer.gannRectangleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        gannRectangleStartPoint: gannRectangleMarkManagerState.gannRectangleStartPoint,
                        currentGannRectangle: gannRectangleMarkManagerState.currentGannRectangle,
                    });
                    if (chartLayer.gannRectangleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.gannBoxMarkManager
                ) {
                    const gannBoxMarkManagerState = chartLayer.gannBoxMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        gannBoxStartPoint: gannBoxMarkManagerState.gannBoxStartPoint,
                        currentGannBox: gannBoxMarkManagerState.currentGannBox,
                    });
                    if (chartLayer.gannBoxMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.gannFanMarkManager
                ) {
                    const gannFanMarkManagerState = chartLayer.gannFanMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        gannFanStartPoint: gannFanMarkManagerState.gannFanStartPoint,
                        currentGannFan: gannFanMarkManagerState.currentGannFan,
                    });
                    if (chartLayer.gannFanMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.triangleMarkManager
                ) {
                    const triangleMarkManagerState = chartLayer.triangleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        triangleMarkStartPoint: triangleMarkManagerState.triangleMarkStartPoint,
                        currentTriangleMark: triangleMarkManagerState.currentTriangleMark,
                    });
                    if (chartLayer.triangleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.ellipseMarkManager
                ) {
                    const ellipseMarkManagerState = chartLayer.ellipseMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        ellipseMarkStartPoint: ellipseMarkManagerState.ellipseMarkStartPoint,
                        currentEllipseMark: ellipseMarkManagerState.currentEllipseMark,
                    });
                    if (chartLayer.ellipseMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.circleMarkManager
                ) {
                    const circleMarkManagerState = chartLayer.circleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        circleMarkStartPoint: circleMarkManagerState.circleMarkStartPoint,
                        currentCircleMark: circleMarkManagerState.currentCircleMark,
                    });
                    if (chartLayer.circleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.rectangleMarkManager
                ) {
                    const rectangleMarkManagerState = chartLayer.rectangleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        rectangleMarkStartPoint: rectangleMarkManagerState.rectangleMarkStartPoint,
                        currentRectangleMark: rectangleMarkManagerState.currentRectangleMark,
                    });
                    if (chartLayer.rectangleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.enhancedAndrewPitchforkMarkManager
                ) {
                    const enhancedAndrewPitchforkMarkManagerState = chartLayer.enhancedAndrewPitchforkMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        enhancedAndrewPitchforkHandlePoint: enhancedAndrewPitchforkMarkManagerState.enhancedAndrewPitchforkHandlePoint,
                        enhancedAndrewPitchforkBaseStartPoint: enhancedAndrewPitchforkMarkManagerState.enhancedAndrewPitchforkBaseStartPoint,
                        currentEnhancedAndrewPitchfork: enhancedAndrewPitchforkMarkManagerState.currentEnhancedAndrewPitchfork,
                    });
                    if (chartLayer.enhancedAndrewPitchforkMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.andrewPitchforkMarkManager
                ) {
                    const andrewPitchforkMarkManagerState = chartLayer.andrewPitchforkMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        andrewPitchforkHandlePoint: andrewPitchforkMarkManagerState.andrewPitchforkHandlePoint,
                        andrewPitchforkBaseStartPoint: andrewPitchforkMarkManagerState.andrewPitchforkBaseStartPoint,
                        currentAndrewPitchfork: andrewPitchforkMarkManagerState.currentAndrewPitchfork,
                    });
                    if (chartLayer.andrewPitchforkMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.lineSegmentMarkManager
                ) {
                    const lineSegmentMarkManagerState = chartLayer.lineSegmentMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        lineSegmentMarkStartPoint: lineSegmentMarkManagerState.lineSegmentMarkStartPoint,
                        currentLineSegmentMark: lineSegmentMarkManagerState.currentLineSegmentMark,
                    });
                    if (chartLayer.lineSegmentMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.arrowLineMarkManager
                ) {
                    const arrowLineMarkManagerState = chartLayer.arrowLineMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        arrowLineMarkStartPoint: arrowLineMarkManagerState.arrowLineMarkStartPoint,
                        currentArrowLineMark: arrowLineMarkManagerState.currentArrowLineMark,
                    });
                    if (chartLayer.arrowLineMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.axisLineMarkManager) {
                    const axisLineMarkManagerState = chartLayer.axisLineMarkManager.handleMouseDown(point);
                    if (chartLayer.axisLineMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        return;
                    }
                }
                if (chartLayer.parallelChannelMarkManager
                ) {
                    const parallelChannelMarkManagerState = chartLayer.parallelChannelMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        parallelChannelMarkStartPoint: parallelChannelMarkManagerState.parallelChannelMarkStartPoint,
                        currentParallelChannelMark: parallelChannelMarkManagerState.currentParallelChannelMark,
                    });
                    if (chartLayer.parallelChannelMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.linearRegressionChannelMarkManager
                ) {
                    const linearRegressionChannelMarkManagerState = chartLayer.linearRegressionChannelMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        parallelChannelMarkStartPoint: linearRegressionChannelMarkManagerState.linearRegressionChannelStartPoint,
                        currentLinearRegressionChannel: linearRegressionChannelMarkManagerState.currentLinearRegressionChannel,
                    });
                    if (chartLayer.linearRegressionChannelMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.equidistantChannelMarkManager
                ) {
                    const equidistantChannelMarkManagerState = chartLayer.equidistantChannelMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        equidistantChannelMarkStartPoint: equidistantChannelMarkManagerState.equidistantChannelMarkStartPoint,
                        currentEquidistantChannelMark: equidistantChannelMarkManagerState.currentEquidistantChannelMark,
                    });
                    if (chartLayer.equidistantChannelMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.disjointChannelMarkManager
                ) {
                    const disjointChannelMarkManagerState = chartLayer.disjointChannelMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        disjointChannelMarkStartPoint: disjointChannelMarkManagerState.disjointChannelMarkStartPoint,
                        currentDisjointChannelMark: disjointChannelMarkManagerState.currentDisjointChannelMark,
                    });
                    if (chartLayer.disjointChannelMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

            }
            return;
        }
    };

    public documentMouseMove(chartLayer: ChartLayer, event: MouseEvent) {
        if (!chartLayer.containerRef.current) return;
        const rect = chartLayer.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
            const point = { x, y };
            chartLayer.setState({ mousePosition: point });
            this.updateCurrentOHLC(chartLayer, point);

            if (chartLayer.timeRangeMarkManager) {
                chartLayer.timeRangeMarkManager.handleMouseMove(point);
                if (chartLayer.timeRangeMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.elliottTripleCombinationMarkManager) {
                chartLayer.elliottTripleCombinationMarkManager.handleMouseMove(point);
                if (chartLayer.elliottTripleCombinationMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.elliottDoubleCombinationMarkManager) {
                chartLayer.elliottDoubleCombinationMarkManager.handleMouseMove(point);
                if (chartLayer.elliottDoubleCombinationMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.elliottTriangleMarkManager) {
                chartLayer.elliottTriangleMarkManager.handleMouseMove(point);
                if (chartLayer.elliottTriangleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.elliottCorrectiveMarkManager) {
                chartLayer.elliottCorrectiveMarkManager.handleMouseMove(point);
                if (chartLayer.elliottCorrectiveMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.elliottImpulseMarkManager) {
                chartLayer.elliottImpulseMarkManager.handleMouseMove(point);
                if (chartLayer.elliottImpulseMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.triangleABCDMarkManager) {
                chartLayer.triangleABCDMarkManager.handleMouseMove(point);
                if (chartLayer.triangleABCDMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.abcdMarkManager) {
                chartLayer.abcdMarkManager.handleMouseMove(point);
                if (chartLayer.abcdMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.headAndShouldersMarkManager) {
                chartLayer.headAndShouldersMarkManager.handleMouseMove(point);
                if (chartLayer.headAndShouldersMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.xabcdMarkManager) {
                chartLayer.xabcdMarkManager.handleMouseMove(point);
                if (chartLayer.xabcdMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.doubleCurveMarkManager) {
                chartLayer.doubleCurveMarkManager.handleMouseMove(point);
                if (chartLayer.doubleCurveMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.curveMarkManager) {
                chartLayer.curveMarkManager.handleMouseMove(point);
                if (chartLayer.curveMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.sectorMarkManager) {
                chartLayer.sectorMarkManager.handleMouseMove(point);
                if (chartLayer.sectorMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.fibonacciFanMarkManager) {
                chartLayer.fibonacciFanMarkManager.handleMouseMove(point);
                if (chartLayer.fibonacciFanMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.fibonacciExtensionBaseTimeMarkManager) {
                chartLayer.fibonacciExtensionBaseTimeMarkManager.handleMouseMove(point);
                if (chartLayer.fibonacciExtensionBaseTimeMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.fibonacciExtensionBasePriceMarkManager) {
                chartLayer.fibonacciExtensionBasePriceMarkManager.handleMouseMove(point);
                if (chartLayer.fibonacciExtensionBasePriceMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.fibonacciChannelMarkManager) {
                chartLayer.fibonacciChannelMarkManager.handleMouseMove(point);
                if (chartLayer.fibonacciChannelMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.fibonacciWedgeMarkManager) {
                chartLayer.fibonacciWedgeMarkManager.handleMouseMove(point);
                if (chartLayer.fibonacciWedgeMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.fibonacciSpiralMarkManager) {
                chartLayer.fibonacciSpiralMarkManager.handleMouseMove(point);
                if (chartLayer.fibonacciSpiralMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.fibonacciCircleMarkManager) {
                chartLayer.fibonacciCircleMarkManager.handleMouseMove(point);
                if (chartLayer.fibonacciCircleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.fibonacciArcMarkManager) {
                chartLayer.fibonacciArcMarkManager.handleMouseMove(point);
                if (chartLayer.fibonacciArcMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.fibonacciRetracementMarkManager
            ) {
                chartLayer.fibonacciRetracementMarkManager.handleMouseMove(point);
                if (chartLayer.fibonacciRetracementMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.fibonacciTimeZoonMarkManager
            ) {
                chartLayer.fibonacciTimeZoonMarkManager.handleMouseMove(point);
                if (chartLayer.fibonacciTimeZoonMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.gannRectangleMarkManager
            ) {
                chartLayer.gannRectangleMarkManager.handleMouseMove(point);
                if (chartLayer.gannRectangleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.gannBoxMarkManager
            ) {
                chartLayer.gannBoxMarkManager.handleMouseMove(point);
                if (chartLayer.gannBoxMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.gannFanMarkManager
            ) {
                chartLayer.gannFanMarkManager.handleMouseMove(point);
                if (chartLayer.gannFanMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.triangleMarkManager
            ) {
                chartLayer.triangleMarkManager.handleMouseMove(point);
                if (chartLayer.triangleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.ellipseMarkManager
            ) {
                chartLayer.ellipseMarkManager.handleMouseMove(point);
                if (chartLayer.ellipseMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.circleMarkManager
            ) {
                chartLayer.circleMarkManager.handleMouseMove(point);
                if (chartLayer.circleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.rectangleMarkManager
            ) {
                chartLayer.rectangleMarkManager.handleMouseMove(point);
                if (chartLayer.rectangleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.enhancedAndrewPitchforkMarkManager
            ) {
                chartLayer.enhancedAndrewPitchforkMarkManager.handleMouseMove(point);
                if (chartLayer.enhancedAndrewPitchforkMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.lineSegmentMarkManager
            ) {
                chartLayer.lineSegmentMarkManager.handleMouseMove(point);
                if (chartLayer.lineSegmentMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.andrewPitchforkMarkManager
            ) {
                chartLayer.andrewPitchforkMarkManager.handleMouseMove(point);
                if (chartLayer.andrewPitchforkMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.arrowLineMarkManager
            ) {
                chartLayer.arrowLineMarkManager.handleMouseMove(point);
                if (chartLayer.arrowLineMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.axisLineMarkManager) {
                chartLayer.axisLineMarkManager.handleMouseMove(point);
                if (chartLayer.axisLineMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.parallelChannelMarkManager
            ) {
                chartLayer.parallelChannelMarkManager.handleMouseMove(point);
                if (chartLayer.parallelChannelMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.linearRegressionChannelMarkManager
            ) {
                chartLayer.linearRegressionChannelMarkManager.handleMouseMove(point);
                if (chartLayer.linearRegressionChannelMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.equidistantChannelMarkManager
            ) {
                chartLayer.equidistantChannelMarkManager.handleMouseMove(point);
                if (chartLayer.equidistantChannelMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.disjointChannelMarkManager
            ) {
                chartLayer.disjointChannelMarkManager.handleMouseMove(point);
                if (chartLayer.disjointChannelMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            return;
        }
    };

    public documentMouseUp(chartLayer: ChartLayer, event: MouseEvent) {
        chartLayer.enableChartMovement();
        if (!chartLayer.containerRef.current) return;
        const rect = chartLayer.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
            const point = this.getMousePosition(chartLayer, event);
            if (point) {

                if (chartLayer.timeRangeMarkManager) {
                    const timeRangeState = chartLayer.timeRangeMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        timeRangeMarkStartPoint: timeRangeState.timeRangeMarkStartPoint,
                        currentTimeRangeMark: timeRangeState.currentTimeRangeMark,
                    });
                }

                if (chartLayer.elliottTripleCombinationMarkManager) {
                    const elliottTripleState = chartLayer.elliottTripleCombinationMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        elliottTripleCombinationPoints: elliottTripleState.currentPoints,
                        currentElliottTripleCombinationMark: elliottTripleState.currentElliottTripleCombinationMark,
                    });
                }
                if (chartLayer.elliottDoubleCombinationMarkManager) {
                    const elliottDoubleCombinationState = chartLayer.elliottDoubleCombinationMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        elliottDoubleCombinationPoints: elliottDoubleCombinationState.currentPoints,
                        currentElliottDoubleCombinationMark: elliottDoubleCombinationState.currentElliottDoubleCombinationMark,
                    });
                }

                if (chartLayer.elliottTriangleMarkManager) {
                    const elliottTriangleState = chartLayer.elliottTriangleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        elliottTrianglePoints: elliottTriangleState.currentPoints,
                        currentElliottTriangleMark: elliottTriangleState.currentElliottTriangleMark,
                    });
                }

                if (chartLayer.elliottCorrectiveMarkManager) {
                    const elliottCorrectiveState = chartLayer.elliottCorrectiveMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        elliottCorrectivePoints: elliottCorrectiveState.currentPoints,
                        currentElliottCorrectiveMark: elliottCorrectiveState.currentElliottCorrectiveMark,
                    });
                }

                if (chartLayer.elliottImpulseMarkManager) {
                    const elliottImpulseState = chartLayer.elliottImpulseMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        elliottImpulsePoints: elliottImpulseState.currentPoints,
                        currentElliottImpulseMark: elliottImpulseState.currentElliottImpulseMark,
                    });
                }

                if (chartLayer.triangleABCDMarkManager) {
                    const triangleABCDState = chartLayer.triangleABCDMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        triangleABCDPoints: triangleABCDState.currentPoints,
                        currentTriangleABCDMark: triangleABCDState.currentTriangleABCDMark,
                    });
                }

                if (chartLayer.abcdMarkManager) {
                    const abcdState = chartLayer.abcdMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        abcdPoints: abcdState.currentPoints,
                        currentABCDMark: abcdState.currentABCDMark,
                    });
                }

                if (chartLayer.headAndShouldersMarkManager) {
                    const headAndShouldersState = chartLayer.headAndShouldersMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        headAndShouldersPoints: headAndShouldersState.currentPoints,
                        currentHeadAndShouldersMark: headAndShouldersState.currentHeadAndShouldersMark,
                    });
                }

                if (chartLayer.xabcdMarkManager) {
                    const xabcdState = chartLayer.xabcdMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        xabcdPoints: xabcdState.currentPoints,
                        currentXABCDMark: xabcdState.currentXABCDMark,
                    });
                }

                if (chartLayer.doubleCurveMarkManager) {
                    const doubleCurveMarkManagerState = chartLayer.doubleCurveMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        doubleCurveMarkStartPoint: doubleCurveMarkManagerState.doubleCurveMarkStartPoint,
                        currentDoubleCurveMark: doubleCurveMarkManagerState.currentDoubleCurveMark,
                    });
                }

                if (chartLayer.curveMarkManager) {
                    const curveMarkManagerState = chartLayer.curveMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        curveMarkStartPoint: curveMarkManagerState.curveMarkStartPoint,
                        currentCurveMark: curveMarkManagerState.currentCurveMark,
                    });
                }

                if (chartLayer.sectorMarkManager) {
                    const sectorMarkManagerState = chartLayer.sectorMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        sectorPoints: sectorMarkManagerState.sectorPoints,
                        currentSector: sectorMarkManagerState.currentSector,
                    });
                }
                if (chartLayer.fibonacciExtensionBasePriceMarkManager) {
                    const fibonacciExtensionState = chartLayer.fibonacciExtensionBasePriceMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciExtensionBasePricePoints: fibonacciExtensionState.fibonacciExtensionBasePricePoints,
                        currentFibonacciExtensionBasePrice: fibonacciExtensionState.currentFibonacciExtensionBasePrice,
                    });
                }
                if (chartLayer.fibonacciExtensionBaseTimeMarkManager) {
                    const fibonacciExtensionBaseTimeState = chartLayer.fibonacciExtensionBaseTimeMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciExtensionBaseTimePoints: fibonacciExtensionBaseTimeState.fibonacciExtensionBaseTimePoints,
                        currentFibonacciExtensionBaseTime: fibonacciExtensionBaseTimeState.currentFibonacciExtensionBaseTime,
                    });
                }
                if (chartLayer.fibonacciChannelMarkManager) {
                    const fibonacciChannelState = chartLayer.fibonacciChannelMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        currentFibonacciChannel: fibonacciChannelState.currentFibonacciChannelMark,
                        isFibonacciChannelMode: fibonacciChannelState.isFibonacciChannelMarkMode,
                        fibonacciChannelDrawingStep: chartLayer.getDrawingStepFromPhase(fibonacciChannelState.drawingPhase),
                    });
                }
                if (chartLayer.fibonacciFanMarkManager) {
                    const fibonacciFanMarkManagerState = chartLayer.fibonacciFanMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciFanStartPoint: fibonacciFanMarkManagerState.fibonacciFanStartPoint,
                        currentFibonacciFan: fibonacciFanMarkManagerState.currentFibonacciFan,
                    });
                }
                if (chartLayer.fibonacciWedgeMarkManager) {
                    const fibonacciWedgeMarkManagerState = chartLayer.fibonacciWedgeMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciWedgePoints: fibonacciWedgeMarkManagerState.fibonacciWedgePoints,
                        currentFibonacciWedge: fibonacciWedgeMarkManagerState.currentFibonacciWedge,
                    });
                }
                if (chartLayer.fibonacciSpiralMarkManager) {
                    const fibonacciSpiralMarkManagerState = chartLayer.fibonacciSpiralMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciSpiralCenterPoint: fibonacciSpiralMarkManagerState.fibonacciSpiralCenterPoint,
                        currentFibonacciSpiral: fibonacciSpiralMarkManagerState.currentFibonacciSpiral,
                    });
                }
                if (chartLayer.fibonacciCircleMarkManager) {
                    const fibonacciCircleMarkManagerState = chartLayer.fibonacciCircleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciCircleCenterPoint: fibonacciCircleMarkManagerState.fibonacciCircleCenterPoint,
                        currentFibonacciCircle: fibonacciCircleMarkManagerState.currentFibonacciCircle,
                    });
                }
                if (chartLayer.fibonacciArcMarkManager) {
                    const fibonacciArcMarkManagerState = chartLayer.fibonacciArcMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciArcStartPoint: fibonacciArcMarkManagerState.fibonacciArcStartPoint,
                        currentFibonacciArc: fibonacciArcMarkManagerState.currentFibonacciArc,
                    });
                }
                if (chartLayer.fibonacciRetracementMarkManager
                ) {
                    const fibonacciRetracementMarkManagerState = chartLayer.fibonacciRetracementMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciRetracementStartPoint: fibonacciRetracementMarkManagerState.fibonacciRetracementStartPoint,
                        currentFibonacciRetracement: fibonacciRetracementMarkManagerState.currentFibonacciRetracement,
                    });
                }

                if (chartLayer.fibonacciTimeZoonMarkManager
                ) {
                    const fibonacciTimeCycleMarkManagerState = chartLayer.fibonacciTimeZoonMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciTimeZoonStartPoint: fibonacciTimeCycleMarkManagerState.fibonacciTimeZoonStartPoint,
                        currentFibonacciTimeZoon: fibonacciTimeCycleMarkManagerState.currentFibonacciTimeZoon,
                    });
                }
                if (chartLayer.gannRectangleMarkManager
                ) {
                    const gannRectangleMarkManagerState = chartLayer.gannRectangleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        gannRectangleStartPoint: gannRectangleMarkManagerState.gannRectangleStartPoint,
                        currentGannRectangle: gannRectangleMarkManagerState.currentGannRectangle,
                    });
                }
                if (chartLayer.gannBoxMarkManager
                ) {
                    const gannBoxMarkManagerState = chartLayer.gannBoxMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        gannBoxStartPoint: gannBoxMarkManagerState.gannBoxStartPoint,
                        currentGannBox: gannBoxMarkManagerState.currentGannBox,
                    });
                }
                if (chartLayer.gannFanMarkManager
                ) {
                    const gannFanMarkManagerState = chartLayer.gannFanMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        gannFanStartPoint: gannFanMarkManagerState.gannFanStartPoint,
                        currentGannFan: gannFanMarkManagerState.currentGannFan,
                    });
                }
                if (chartLayer.triangleMarkManager
                ) {
                    const triangleMarkManagerState = chartLayer.triangleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        triangleMarkStartPoint: triangleMarkManagerState.triangleMarkStartPoint,
                        currentTriangleMark: triangleMarkManagerState.currentTriangleMark,
                    });
                }
                if (chartLayer.ellipseMarkManager
                ) {
                    const ellipseMarkManagerState = chartLayer.ellipseMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        ellipseMarkStartPoint: ellipseMarkManagerState.ellipseMarkStartPoint,
                        currentEllipseMark: ellipseMarkManagerState.currentEllipseMark,
                    });
                }
                if (chartLayer.circleMarkManager
                ) {
                    const circleMarkManagerState = chartLayer.circleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        circleMarkStartPoint: circleMarkManagerState.circleMarkStartPoint,
                        currentCircleMark: circleMarkManagerState.currentCircleMark,
                    });
                }
                if (chartLayer.rectangleMarkManager
                ) {
                    const rectangleMarkManagerState = chartLayer.rectangleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        rectangleMarkStartPoint: rectangleMarkManagerState.rectangleMarkStartPoint,
                        currentRectangleMark: rectangleMarkManagerState.currentRectangleMark,
                    });
                }
                if (chartLayer.enhancedAndrewPitchforkMarkManager
                ) {
                    const enhancedAndrewPitchforkMarkManagerState = chartLayer.enhancedAndrewPitchforkMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        enhancedAndrewPitchforkHandlePoint: enhancedAndrewPitchforkMarkManagerState.enhancedAndrewPitchforkHandlePoint,
                        enhancedAndrewPitchforkBaseStartPoint: enhancedAndrewPitchforkMarkManagerState.enhancedAndrewPitchforkBaseStartPoint,
                        currentEnhancedAndrewPitchfork: enhancedAndrewPitchforkMarkManagerState.currentEnhancedAndrewPitchfork,
                    });
                }
                if (chartLayer.andrewPitchforkMarkManager
                ) {
                    const andrewPitchforkMarkManagerState = chartLayer.andrewPitchforkMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        andrewPitchforkHandlePoint: andrewPitchforkMarkManagerState.andrewPitchforkHandlePoint,
                        andrewPitchforkBaseStartPoint: andrewPitchforkMarkManagerState.andrewPitchforkBaseStartPoint,
                        currentAndrewPitchfork: andrewPitchforkMarkManagerState.currentAndrewPitchfork,
                    });
                }
                if (chartLayer.lineSegmentMarkManager
                ) {
                    const lineSegmentMarkManagerState = chartLayer.lineSegmentMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        lineSegmentMarkStartPoint: lineSegmentMarkManagerState.lineSegmentMarkStartPoint,
                        currentLineSegmentMark: lineSegmentMarkManagerState.currentLineSegmentMark,
                    });
                }
                if (chartLayer.parallelChannelMarkManager
                ) {
                    const parallelChannelMarkManagerState = chartLayer.parallelChannelMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        parallelChannelMarkStartPoint: parallelChannelMarkManagerState.parallelChannelMarkStartPoint,
                        currentParallelChannelMark: parallelChannelMarkManagerState.currentParallelChannelMark,
                    });
                }
                if (chartLayer.linearRegressionChannelMarkManager
                ) {
                    const linearRegressionChannelMarkManagerState = chartLayer.linearRegressionChannelMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        parallelChannelMarkStartPoint: linearRegressionChannelMarkManagerState.linearRegressionChannelStartPoint,
                        currentLinearRegressionChannel: linearRegressionChannelMarkManagerState.currentLinearRegressionChannel,
                    });
                }
                if (chartLayer.arrowLineMarkManager
                ) {
                    const arrowLineMarkManagerState = chartLayer.arrowLineMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        arrowLineMarkStartPoint: arrowLineMarkManagerState.arrowLineMarkStartPoint,
                        currentArrowLineMark: arrowLineMarkManagerState.currentArrowLineMark,
                    });
                }
                if (chartLayer.equidistantChannelMarkManager
                ) {
                    const equidistantChannelMarkManagerState = chartLayer.equidistantChannelMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        equidistantChannelMarkStartPoint: equidistantChannelMarkManagerState.equidistantChannelMarkStartPoint,
                        currentEquidistantChannelMark: equidistantChannelMarkManagerState.currentEquidistantChannelMark,
                    });
                }
                if (chartLayer.disjointChannelMarkManager
                ) {
                    const disjointChannelMarkManagerState = chartLayer.disjointChannelMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        disjointChannelMarkStartPoint: disjointChannelMarkManagerState.disjointChannelMarkStartPoint,
                        currentDisjointChannelMark: disjointChannelMarkManagerState.currentDisjointChannelMark,
                    });
                }
                if (chartLayer.axisLineMarkManager) {
                    const axisLineMarkManagerState = chartLayer.axisLineMarkManager.handleMouseUp(point);
                }
            }
            return;
        }
    };

    public documentMouseWheel(chartLayer: ChartLayer, event: MouseEvent) {
        if (!chartLayer.containerRef.current) return;
        const rect = chartLayer.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Mouse in drawing area
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
            if (this.isPriceArea(x, rect.width)) {
                this.handleDocumentMainChartPriceAreaMouseWheel(event);
            }
            if (this.isTimeArea(y, rect.height)) {
                this.handleDocumentMainChartTimeAreaMouseWheel(event);
            }
            if (this.isChartArea(x, y, rect.width, rect.height)) {
                this.handleDocumentMainChartAreaMouseWheel(event);
            }
        }
    };
    private getMousePosition(chartLayer: ChartLayer, event: MouseEvent): Point | null {
        if (!chartLayer.containerRef.current) {
            return null;
        }
        const rect = chartLayer.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const isInside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
        if (!isInside) {
            return null;
        }
        return { x, y };
    }
    // =============================== mouse events end===============================

    // =============================== text mark start ===============================
    private handleLineMarkMouseDown = (chartLayer: ChartLayer, point: Point) => {
        if (chartLayer.lineSegmentMarkManager) {
            const newState = chartLayer.lineSegmentMarkManager.handleMouseDown(point);
            chartLayer.setState({
                lineSegmentMarkStartPoint: newState.lineSegmentMarkStartPoint,
                currentLineSegmentMark: newState.currentLineSegmentMark,
            });
        }
    };
    // =============================== text mark end ===============================

    private updateCurrentOHLC = (chartLayer: ChartLayer, point: Point) => {
        const { chartData } = chartLayer.props;
        if (!chartData || chartData.length === 0) return;
        const canvas = chartLayer.canvasRef.current;
        if (!canvas) return;
        const timeIndex = Math.floor((point.x / canvas.width) * chartData.length);
        if (timeIndex >= 0 && timeIndex < chartData.length) {
            const dataPoint = chartData[timeIndex];
            if (dataPoint.open !== undefined && dataPoint.high !== undefined &&
                dataPoint.low !== undefined && dataPoint.close !== undefined) {
                chartLayer.setState({
                    currentOHLC: {
                        time: dataPoint.time,
                        open: dataPoint.open,
                        high: dataPoint.high,
                        low: dataPoint.low,
                        close: dataPoint.close
                    }
                });
            } else {
                this.calculateOHLCFromCoordinates(chartLayer, point, timeIndex);
            }
        }
    };

    private calculateOHLCFromCoordinates = (chartLayer: ChartLayer, point: Point, timeIndex: number) => {
        const canvas = chartLayer.canvasRef.current;
        const container = chartLayer.containerRef.current;
        if (!canvas || !container) return;
        const { chartData } = chartLayer.props;
        const dataPoint = chartData[timeIndex];
        const priceRange = this.getChartPriceRange(chartLayer);
        const timeRange = chartData.length;
        if (!priceRange) return;
        const priceAtMouse = this.coordinateToPrice(chartLayer, point.y);
        const basePrice = dataPoint.value || priceAtMouse;
        const volatility = 0.02;
        const open = basePrice;
        const high = basePrice * (1 + volatility);
        const low = basePrice * (1 - volatility);
        const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
        chartLayer.setState({
            currentOHLC: {
                time: dataPoint.time,
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(close.toFixed(2))
            }
        });
    };

    private getChartPriceRange = (chartLayer: ChartLayer,): { min: number; max: number } | null => {
        const { chartData } = chartLayer.props;
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

    private coordinateToPrice = (chartLayer: ChartLayer, y: number): number => {
        const canvas = chartLayer.canvasRef.current;
        if (!canvas) return 100;
        const priceRange = this.getChartPriceRange(chartLayer);
        if (!priceRange) return 100;
        const percent = 1 - (y / canvas.height);
        return priceRange.min + (priceRange.max - priceRange.min) * percent;
    };

    private isChartArea = (x: number, y: number, w: number, h: number): boolean => {
        if (x <= w && x <= w - 58 && y <= h && y <= h - 28) {
            return true;
        }
        return false;
    }
    private isPriceArea = (x: number, w: number): boolean => {
        if (x <= w && x >= w - 58) {
            return true;
        }
        return false;
    }
    private isTimeArea = (y: number, h: number): boolean => {
        if (y <= h && y >= h - 28) {
            return true;
        }
        return false;
    }

    // Handle mouse wheel events for the price area of the main icon.
    private handleDocumentMainChartPriceAreaMouseWheel = (event: MouseEvent) => {
    }

    // Handle mouse scroll events for the time area in the main chart area.
    private handleDocumentMainChartTimeAreaMouseWheel = (event: MouseEvent) => {
    }

    // Handle mouse scroll events for the time area in the main chart area.
    private handleDocumentMainChartAreaMouseWheel = (event: MouseEvent) => {
    }

    // Handling of mouse click and move events for the main chart.
    private handleDocumentMainChartMouseDownMove = (event: MouseEvent) => {
    }

    // Working with graphic styles
    private handleGraphStyle = (chartLayer: ChartLayer, point: Point) => {
        let graph: any = null;
        const managers = [
            chartLayer.lineSegmentMarkManager,
            chartLayer.axisLineMarkManager,
            chartLayer.arrowLineMarkManager,
            chartLayer.parallelChannelMarkManager,
            chartLayer.linearRegressionChannelMarkManager,
            chartLayer.equidistantChannelMarkManager,
            chartLayer.disjointChannelMarkManager,
            chartLayer.andrewPitchforkMarkManager,
            chartLayer.enhancedAndrewPitchforkMarkManager,
            chartLayer.rectangleMarkManager,
            chartLayer.circleMarkManager,
            chartLayer.ellipseMarkManager,
            chartLayer.triangleMarkManager,
            chartLayer.gannFanMarkManager,
            chartLayer.gannBoxMarkManager,
            chartLayer.gannRectangleMarkManager,
            chartLayer.fibonacciTimeZoonMarkManager,
            chartLayer.fibonacciRetracementMarkManager,
            chartLayer.fibonacciArcMarkManager,
            chartLayer.fibonacciCircleMarkManager,
            chartLayer.fibonacciSpiralMarkManager,
            chartLayer.fibonacciWedgeMarkManager,
            chartLayer.fibonacciFanMarkManager,
            chartLayer.fibonacciChannelMarkManager,
            chartLayer.fibonacciExtensionBasePriceMarkManager,
            chartLayer.fibonacciExtensionBaseTimeMarkManager,
            chartLayer.sectorMarkManager,
            chartLayer.doubleCurveMarkManager,
            chartLayer.xabcdMarkManager,
            chartLayer.headAndShouldersMarkManager,
            chartLayer.abcdMarkManager,
            chartLayer.triangleABCDMarkManager,
            chartLayer.elliottImpulseMarkManager,
            chartLayer.elliottTriangleMarkManager,
            chartLayer.elliottDoubleCombinationMarkManager, 
            chartLayer.elliottTripleCombinationMarkManager,
            chartLayer.timeRangeMarkManager
        ];
        const allGraphs: any[] = [];
        for (const manager of managers) {
            if (!manager) continue;
            if (manager.getMarkAtPoint) {
                const foundGraph = manager.getMarkAtPoint(point);
                if (foundGraph) {
                    allGraphs.push(foundGraph);
                }
            }
        }
        if (allGraphs.length > 0) {
            graph = allGraphs[allGraphs.length - 1];
        }
        if (graph) {
            const markType = (graph as IGraph).getMarkType();
            const drawing: Drawing = {
                id: `graph_${Date.now()}`,
                type: markTypeName(markType),
                points: [point],
                color: chartLayer.props.currentTheme.chart.lineColor,
                lineWidth: 1,
                rotation: 0,
                properties: {
                    originalMark: graph
                }
            };
            chartLayer.showGraphMarkToolbar(drawing);
            chartLayer.currentGraphSettingsStyle = (graph as IGraphStyle);
            return true;
        } else {
            chartLayer.setState({
                showGraphMarkToolbar: false,
                selectedGraphDrawing: null
            });
            return false;
        }
    }
}