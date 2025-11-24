import { MouseEventParams } from "lightweight-charts";
import { ChartLayer } from ".";
import { ICandleViewDataPoint, MarkDrawing, MarkType, markTypeName, Point } from "../types";
import { IGraph } from "../Mark/IGraph";
import { IMarkStyle } from "../Mark/IMarkStyle";
import { timestampToDateTime } from "../tools";

export class ChartEventManager {
    constructor() { }
    public registerClickEvent(chart: any, callback: (event: MouseEventParams) => void): void {
        chart.subscribeClick((event: MouseEventParams) => callback(event));
    }
    public registerDblClickEvent(chart: any, callback: (event: MouseEventParams) => void): void {
        chart.subscribeDblClick((event: MouseEventParams) => callback(event));
    }
    public registerCrosshairMoveEvent(chartLayer: ChartLayer): void {
        chartLayer.props.chart.subscribeCrosshairMove((event: MouseEventParams) => {
            this.updateCurrentOHLCByCrosshair(chartLayer, event);
            // diffuse panel event
            if (chartLayer.chartPanesManager) {
                chartLayer.chartPanesManager.handleCrosshairMoveEvent(event);
            }
        });
    }
    private updateCurrentOHLCByCrosshair = (chartLayer: ChartLayer, event: MouseEventParams) => {
        let timeStr = '';
        if (event.time) {
            if (typeof event.time === 'number') {
                const timestamp = event.time;
                const date = new Date(timestamp * 1000);
                timeStr = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')} ${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')}`;
            } else if (typeof event.time === 'object' && 'year' in event.time) {
                const businessDay = event.time as { year: number, month: number, day: number };
                timeStr = `${businessDay.year}-${businessDay.month.toString().padStart(2, '0')}-${businessDay.day.toString().padStart(2, '0')} 00:00:00`;
            } else if (typeof event.time === 'string') {
                timeStr = event.time;
            }
        }
        let open = 0;
        let high = 0;
        let low = 0;
        let close = 0;
        let foundData = false;
        if (event.seriesData && event.seriesData.size > 0) {
            event.seriesData.forEach((data: any, series: any) => {
                if (!foundData && data && typeof data === 'object') {
                    let price = 0;
                    let validPrice = false;
                    if (data.close !== undefined && data.close !== null && data.close !== 0) {
                        price = data.close;
                        close = price;
                        if (data.open !== undefined && data.open !== 0) open = data.open;
                        else open = price;
                        if (data.high !== undefined && data.high !== 0) high = data.high;
                        else high = price;
                        if (data.low !== undefined && data.low !== 0) low = data.low;
                        else low = price;
                        validPrice = true;
                    } else if (data.volume !== undefined && data.volume !== null && data.volume !== 0) {
                        price = data.volume;
                        open = high = low = close = price;
                        validPrice = true;
                    } else if (data.high !== undefined && data.high !== null && data.high !== 0) {
                        price = data.high;
                        open = high = low = close = price;
                        validPrice = true;
                    } else if (data.low !== undefined && data.low !== null && data.low !== 0) {
                        price = data.low;
                        open = high = low = close = price;
                        validPrice = true;
                    } else if (data.open !== undefined && data.open !== null && data.open !== 0) {
                        price = data.open;
                        open = high = low = close = price;
                        validPrice = true;
                    }
                    if (validPrice) {
                        foundData = true;
                    }
                }
            });
        }
        if (foundData) {
            chartLayer.setState({
                currentOHLC: {
                    time: timeStr,
                    open: Number(open.toFixed(2)),
                    high: Number(high.toFixed(2)),
                    low: Number(low.toFixed(2)),
                    close: Number(close.toFixed(2))
                }
            });
        }
    };

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
                if (chartLayer.chartMarkManager?.lineSegmentMarkManager) {
                    const newState = chartLayer.chartMarkManager?.lineSegmentMarkManager.handleKeyDown(event);
                    chartLayer.setState({
                        lineSegmentMarkStartPoint: newState.lineSegmentMarkStartPoint,
                        currentLineSegmentMark: newState.currentLineSegmentMark
                    });
                }
            }
            if (chartLayer.chartMarkManager?.gannRectangleMarkManager && chartLayer.state.currentMarkMode === MarkType.GannRectangle) {
                const newState = chartLayer.chartMarkManager?.gannRectangleMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    gannRectangleStartPoint: newState.gannRectangleStartPoint,
                    currentGannRectangle: newState.currentGannRectangle,
                });
            }
            if (chartLayer.chartMarkManager?.fibonacciTimeZoonMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciTimeZoon) {
                const newState = chartLayer.chartMarkManager?.fibonacciTimeZoonMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciTimeZoonStartPoint: newState.fibonacciTimeZoonStartPoint,
                    currentFibonacciTimeZoon: newState.currentFibonacciTimeZoon,
                });
            }
            if (chartLayer.chartMarkManager?.fibonacciRetracementMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciRetracement) {
                const newState = chartLayer.chartMarkManager?.fibonacciRetracementMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciRetracementStartPoint: newState.fibonacciRetracementStartPoint,
                    currentFibonacciRetracement: newState.currentFibonacciRetracement,
                });
            }
            if (chartLayer.chartMarkManager?.fibonacciCircleMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciCircle) {
                const newState = chartLayer.chartMarkManager?.fibonacciCircleMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciCircleCenterPoint: newState.fibonacciCircleCenterPoint,
                    currentFibonacciCircle: newState.currentFibonacciCircle,
                });
            }
            if (chartLayer.chartMarkManager?.fibonacciSpiralMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciSpiral) {
                const newState = chartLayer.chartMarkManager?.fibonacciSpiralMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciSpiralCenterPoint: newState.fibonacciSpiralCenterPoint,
                    currentFibonacciSpiral: newState.currentFibonacciSpiral,
                });
            }
            if (chartLayer.chartMarkManager?.fibonacciFanMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciFan) {
                const newState = chartLayer.chartMarkManager?.fibonacciFanMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciFanStartPoint: newState.fibonacciFanStartPoint,
                    currentFibonacciFan: newState.currentFibonacciFan,
                });
            }
            if (chartLayer.chartMarkManager?.fibonacciExtensionBasePriceMarkManager && chartLayer.state.currentMarkMode === MarkType.FibonacciExtensionBasePrice) {
                const newState = chartLayer.chartMarkManager?.fibonacciExtensionBasePriceMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    fibonacciExtensionBasePricePoints: newState.fibonacciExtensionBasePricePoints,
                    currentFibonacciExtensionBasePrice: newState.currentFibonacciExtensionBasePrice,
                });
            }
            if (chartLayer.chartMarkManager?.triangleABCDMarkManager && chartLayer.state.currentMarkMode === MarkType.TriangleABCD) {
                const newState = chartLayer.chartMarkManager?.triangleABCDMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    triangleABCDPoints: newState.currentPoints,
                    currentTriangleABCDMark: newState.currentTriangleABCDMark,
                });
            }
            if (chartLayer.chartMarkManager?.pencilMarkManager && chartLayer.state.currentMarkMode === MarkType.Pencil) {
                const newState = chartLayer.chartMarkManager?.pencilMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    isPencilMode: newState.isPencilMode,
                    isDrawing: newState.isDrawing,
                    currentPencilMark: newState.currentPencilMark,
                    isDragging: newState.isDragging,
                });
            }
            if (chartLayer.chartMarkManager?.penMarkManager && chartLayer.state.currentMarkMode === MarkType.Pen) {
                const newState = chartLayer.chartMarkManager?.penMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    isPenMode: newState.isPenMode,
                    isDrawing: newState.isDrawing,
                    currentPenMark: newState.currentPenMark,
                    isDragging: newState.isDragging,
                });
            }
            if (chartLayer.chartMarkManager?.brushMarkManager && chartLayer.state.currentMarkMode === MarkType.Brush) {
                const newState = chartLayer.chartMarkManager?.brushMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    isBrushMode: newState.isBrushMode,
                    isDrawing: newState.isDrawing,
                    currentBrushMark: newState.currentBrushMark,
                    isDragging: newState.isDragging,
                });
            }
            if (chartLayer.chartMarkManager?.markerPenMarkManager && chartLayer.state.currentMarkMode === MarkType.MarkerPen) {
                const newState = chartLayer.chartMarkManager?.markerPenMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    isMarkerPenMode: newState.isMarkerPenMarkMode,
                    isDrawing: newState.isDrawing,
                    currentMarkerPen: newState.currentMarkerPenMark,
                    isDragging: newState.isDragging,
                });
            }
            if (chartLayer.chartMarkManager?.eraserMarkManager && chartLayer.state.currentMarkMode === MarkType.Eraser) {
                const newState = chartLayer.chartMarkManager?.eraserMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    isEraserMode: newState.isEraserMode,
                    isErasing: newState.isErasing,
                    eraserHoveredMark: null
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
        // if (chartLayer.state.currentMarkMode === MarkType.Emoji && chartLayer.state.pendingEmojiMark) {
        //     chartLayer.placeEmojiMark(point, chartLayer.state.pendingEmojiMark);
        //     event.preventDefault();
        //     event.stopPropagation();
        //     if (chartLayer.props.onCloseDrawing) {
        //         chartLayer.props.onCloseDrawing();
        //     }
        //     return;
        // }
        // if (chartLayer.state.currentMarkMode === MarkType.Text) {
        //     chartLayer.placeTextMark(point);
        //     event.preventDefault();
        //     event.stopPropagation();
        //     if (chartLayer.props.onCloseDrawing) {
        //         chartLayer.props.onCloseDrawing();
        //     }
        //     return;
        // }
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

                // propagate panel events
                if (chartLayer.chartPanesManager) {
                    chartLayer.chartPanesManager?.handleMouseDown(point);
                }

                if (chartLayer.chartMarkManager?.textEditMarkManager) {
                    const textEditState = chartLayer.chartMarkManager?.textEditMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isTextEditMarkMode: textEditState.isTextEditMarkMode,
                        isTextEditDragging: textEditState.isDragging,
                        textEditDragTarget: textEditState.dragTarget,
                    });
                    if (chartLayer.chartMarkManager?.textEditMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.bubbleBoxMarkManager) {
                    const bubbleBoxState = chartLayer.chartMarkManager?.bubbleBoxMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isBubbleBoxMarkMode: bubbleBoxState.isBubbleBoxMarkMode,
                        bubbleBoxMarkPoints: bubbleBoxState.bubbleBoxMarkPoints,
                        currentBubbleBoxMark: bubbleBoxState.currentBubbleBoxMark,
                        isBubbleBoxDragging: bubbleBoxState.isDragging,
                        bubbleBoxDragTarget: bubbleBoxState.dragTarget,
                        bubbleBoxDragType: bubbleBoxState.dragType,
                    });
                    if (chartLayer.chartMarkManager?.bubbleBoxMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.pinMarkManager) {
                    const pinState = chartLayer.chartMarkManager?.pinMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isPinMarkMode: pinState.isPinMarkMode,
                        pinMarkPoint: pinState.pinMarkPoint,
                        currentPinMark: pinState.currentPinMark,
                        isPinDragging: pinState.isDragging,
                        pinDragTarget: pinState.dragTarget,
                    });
                    if (chartLayer.chartMarkManager?.pinMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.emojiMarkManager) {
                    const emojiState = chartLayer.chartMarkManager?.emojiMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isEmojiMarkMode: emojiState.isEmojiMarkMode,
                        emojiMarkStartPoint: emojiState.emojiMarkStartPoint,
                        currentEmojiMark: emojiState.currentEmojiMark,
                        isEmojiDragging: emojiState.isDragging,
                        emojiDragTarget: emojiState.dragTarget,
                        emojiDragPoint: emojiState.dragPoint,
                    });
                    if (chartLayer.chartMarkManager?.emojiMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.signpostMarkManager) {
                    const signpostState = chartLayer.chartMarkManager?.signpostMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isSignpostMarkMode: signpostState.isSignPostMarkMode,
                        signpostMarkPoint: signpostState.signPostMarkPoint,
                        currentSignpostMark: signpostState.currentSignPostMark,
                        isSignpostDragging: signpostState.isDragging,
                        signpostDragTarget: signpostState.dragTarget,
                    });
                    if (chartLayer.chartMarkManager?.signpostMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.priceNoteMarkManager) {
                    const priceNoteState = chartLayer.chartMarkManager?.priceNoteMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isPriceNoteMarkMode: priceNoteState.isPriceNoteMarkMode,
                        priceNoteMarkStartPoint: priceNoteState.priceNoteMarkStartPoint,
                        currentPriceNoteMark: priceNoteState.currentPriceNoteMark,
                        isPriceNoteDragging: priceNoteState.isDragging,
                        priceNoteDragTarget: priceNoteState.dragTarget,
                        priceNoteDragPoint: priceNoteState.dragPoint,
                    });
                    if (chartLayer.chartMarkManager?.priceNoteMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.flagMarkManager) {
                    const flagState = chartLayer.chartMarkManager?.flagMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isFlagMarkMode: flagState.isFlagMarkMode,
                        flagMarkPoint: flagState.flagMarkPoint,
                        currentFlagMark: flagState.currentFlagMark,
                        isFlagDragging: flagState.isDragging,
                        flagDragTarget: flagState.dragTarget,
                    });
                    if (chartLayer.chartMarkManager?.flagMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.priceLabelMarkManager) {
                    const priceLabelState = chartLayer.chartMarkManager?.priceLabelMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isPriceLabelMarkMode: priceLabelState.isPriceLabelMarkMode,
                        priceLabelMarkPoint: priceLabelState.priceLabelMarkPoint,
                        currentPriceLabelMark: priceLabelState.currentPriceLabelMark,
                        isPriceLabelDragging: priceLabelState.isDragging,
                        priceLabelDragTarget: priceLabelState.dragTarget,
                    });
                    if (chartLayer.chartMarkManager?.priceLabelMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.shortPositionMarkManager) {
                    const shortPositionState = chartLayer.chartMarkManager?.shortPositionMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isShortPositionMarkMode: shortPositionState.isShortPositionMarkMode,
                        shortPositionMarkStartPoint: shortPositionState.shortPositionMarkStartPoint,
                        currentShortPositionMark: shortPositionState.currentShortPositionMark,
                        isShortPositionDragging: shortPositionState.isDragging,
                        shortPositionDragTarget: shortPositionState.dragTarget,
                        shortPositionDragPoint: shortPositionState.dragPoint,
                        shortPositionDrawingPhase: shortPositionState.drawingPhase,
                        shortPositionAdjustingMode: shortPositionState.adjustingMode,
                    });
                    if (chartLayer.chartMarkManager?.shortPositionMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.longPositionMarkManager) {
                    const longPositionState = chartLayer.chartMarkManager?.longPositionMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isLongPositionMarkMode: longPositionState.isLongPositionMarkMode,
                        longPositionMarkStartPoint: longPositionState.longPositionMarkStartPoint,
                        currentLongPositionMark: longPositionState.currentLongPositionMark,
                        isLongPositionDragging: longPositionState.isDragging,
                        dragTarget: longPositionState.dragTarget,
                        dragPoint: longPositionState.dragPoint,
                        longPositionDrawingPhase: longPositionState.drawingPhase,
                        adjustingMode: longPositionState.adjustingMode,
                    });
                    if (chartLayer.chartMarkManager?.longPositionMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.tableMarkManager) {
                    const tableState = chartLayer.chartMarkManager?.tableMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isTableMarkMode: tableState.isTableMarkMode,
                        tableMarkStartPoint: tableState.tableMarkStartPoint,
                        currentTableMark: tableState.currentTableMark,
                        isTableDragging: tableState.isDragging,
                        tableDragTarget: tableState.dragTarget,
                        tableDragPoint: tableState.dragPoint,
                    });
                    if (chartLayer.chartMarkManager?.tableMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.imageMarkManager) {
                    const imageMarkState = chartLayer.chartMarkManager?.imageMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isImageMarkMode: imageMarkState.isImageMarkMode,
                        imageMarkStartPoint: imageMarkState.imageMarkStartPoint,
                        currentImageMark: imageMarkState.currentImageMark,
                        showImageModal: imageMarkState.showImageModal,
                        selectedImageUrl: imageMarkState.selectedImageUrl
                    });
                    if (chartLayer.chartMarkManager?.imageMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.thickArrowLineMarkManager) {
                    const thickArrowLineState = chartLayer.chartMarkManager?.thickArrowLineMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        thickArrowLineMarkStartPoint: thickArrowLineState.thickArrowLineMarkStartPoint,
                        currentThickArrowLineMark: thickArrowLineState.currentThickArrowLineMark,
                    });
                    if (chartLayer.chartMarkManager?.thickArrowLineMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.eraserMarkManager && chartLayer.state.currentMarkMode === MarkType.Eraser) {
                    const eraserState = chartLayer.chartMarkManager?.eraserMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isEraserMode: eraserState.isEraserMode,
                        isErasing: eraserState.isErasing,
                        eraserHoveredMark: eraserState.hoveredMark
                    });
                    if (chartLayer.chartMarkManager?.eraserMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.markerPenMarkManager && chartLayer.state.currentMarkMode === MarkType.MarkerPen) {
                    const markerPenState = chartLayer.chartMarkManager?.markerPenMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isMarkerPenMode: markerPenState.isMarkerPenMarkMode,
                        isDrawing: markerPenState.isDrawing,
                        currentMarkerPen: markerPenState.currentMarkerPenMark,
                        isDragging: markerPenState.isDragging,
                    });
                    if (chartLayer.chartMarkManager?.markerPenMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.brushMarkManager && chartLayer.state.currentMarkMode === MarkType.Brush) {
                    const brushState = chartLayer.chartMarkManager?.brushMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isBrushMode: brushState.isBrushMode,
                        isDrawing: brushState.isDrawing,
                        currentBrushMark: brushState.currentBrushMark,
                        isDragging: brushState.isDragging,
                    });
                    if (chartLayer.chartMarkManager?.brushMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.penMarkManager && chartLayer.state.currentMarkMode === MarkType.Pen) {
                    const penState = chartLayer.chartMarkManager?.penMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isPenMode: penState.isPenMode,
                        isDrawing: penState.isDrawing,
                        currentPenMark: penState.currentPenMark,
                        isDragging: penState.isDragging,
                    });
                    if (chartLayer.chartMarkManager?.penMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.pencilMarkManager && chartLayer.state.currentMarkMode === MarkType.Pencil) {
                    const pencilState = chartLayer.chartMarkManager?.pencilMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        isPencilMode: pencilState.isPencilMode,
                        isDrawing: pencilState.isDrawing,
                        currentPencilMark: pencilState.currentPencilMark,
                        isDragging: pencilState.isDragging,
                    });
                    if (chartLayer.chartMarkManager?.pencilMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.timePriceRangeMarkManager) {
                    const timePriceRangeState = chartLayer.chartMarkManager?.timePriceRangeMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        timePriceRangeMarkStartPoint: timePriceRangeState.timePriceRangeMarkStartPoint,
                        currentTimePriceRangeMark: timePriceRangeState.currentTimePriceRangeMark,
                        isTimePriceRangeMarkMode: timePriceRangeState.isTimePriceRangeMarkMode,
                    });
                    if (chartLayer.chartMarkManager?.timePriceRangeMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.priceRangeMarkManager) {
                    const priceRangeState = chartLayer.chartMarkManager?.priceRangeMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        priceRangeMarkStartPoint: priceRangeState.priceRangeMarkStartPoint,
                        currentPriceRangeMark: priceRangeState.currentPriceRangeMark,
                    });
                    if (chartLayer.chartMarkManager?.priceRangeMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.timeRangeMarkManager) {
                    const timeRangeState = chartLayer.chartMarkManager?.timeRangeMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        timeRangeMarkStartPoint: timeRangeState.timeRangeMarkStartPoint,
                        currentTimeRangeMark: timeRangeState.currentTimeRangeMark,
                    });
                    if (chartLayer.chartMarkManager?.timeRangeMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.elliottTripleCombinationMarkManager) {
                    const elliottTripleState = chartLayer.chartMarkManager?.elliottTripleCombinationMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        elliottTripleCombinationPoints: elliottTripleState.currentPoints,
                        currentElliottTripleCombinationMark: elliottTripleState.currentElliottTripleCombinationMark,
                    });
                    if (chartLayer.chartMarkManager?.elliottTripleCombinationMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.elliottDoubleCombinationMarkManager) {
                    const elliottDoubleCombinationState = chartLayer.chartMarkManager?.elliottDoubleCombinationMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        elliottDoubleCombinationPoints: elliottDoubleCombinationState.currentPoints,
                        currentElliottDoubleCombinationMark: elliottDoubleCombinationState.currentElliottDoubleCombinationMark,
                    });
                    if (chartLayer.chartMarkManager?.elliottDoubleCombinationMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.elliottTriangleMarkManager) {
                    const elliottTriangleState = chartLayer.chartMarkManager?.elliottTriangleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        elliottTrianglePoints: elliottTriangleState.currentPoints,
                        currentElliottTriangleMark: elliottTriangleState.currentElliottTriangleMark,
                    });
                    if (chartLayer.chartMarkManager?.elliottTriangleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.elliottCorrectiveMarkManager) {
                    const elliottCorrectiveState = chartLayer.chartMarkManager?.elliottCorrectiveMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        elliottCorrectivePoints: elliottCorrectiveState.currentPoints,
                        currentElliottCorrectiveMark: elliottCorrectiveState.currentElliottCorrectiveMark,
                    });
                    if (chartLayer.chartMarkManager?.elliottCorrectiveMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.elliottImpulseMarkManager) {
                    const elliottImpulseState = chartLayer.chartMarkManager?.elliottImpulseMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        elliottImpulsePoints: elliottImpulseState.currentPoints,
                        currentElliottImpulseMark: elliottImpulseState.currentElliottImpulseMark,
                    });
                    if (chartLayer.chartMarkManager?.elliottImpulseMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.triangleABCDMarkManager) {
                    const triangleABCDState = chartLayer.chartMarkManager?.triangleABCDMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        triangleABCDPoints: triangleABCDState.currentPoints,
                        currentTriangleABCDMark: triangleABCDState.currentTriangleABCDMark,
                    });
                    if (chartLayer.chartMarkManager?.triangleABCDMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.abcdMarkManager) {
                    const abcdState = chartLayer.chartMarkManager?.abcdMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        abcdPoints: abcdState.currentPoints,
                        currentABCDMark: abcdState.currentABCDMark,
                    });
                    if (chartLayer.chartMarkManager?.abcdMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.headAndShouldersMarkManager) {
                    const headAndShouldersState = chartLayer.chartMarkManager?.headAndShouldersMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        headAndShouldersPoints: headAndShouldersState.currentPoints,
                        currentHeadAndShouldersMark: headAndShouldersState.currentHeadAndShouldersMark,
                    });
                    if (chartLayer.chartMarkManager?.headAndShouldersMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.xabcdMarkManager) {
                    const xabcdState = chartLayer.chartMarkManager?.xabcdMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        xabcdPoints: xabcdState.currentPoints,
                        currentXABCDMark: xabcdState.currentXABCDMark,
                    });
                    if (chartLayer.chartMarkManager?.xabcdMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.doubleCurveMarkManager) {
                    const doubleCurveMarkManagerState = chartLayer.chartMarkManager?.doubleCurveMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        doubleCurveMarkStartPoint: doubleCurveMarkManagerState.doubleCurveMarkStartPoint,
                        currentDoubleCurveMark: doubleCurveMarkManagerState.currentDoubleCurveMark,
                    });
                    if (chartLayer.chartMarkManager?.doubleCurveMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.curveMarkManager) {
                    const curveMarkManagerState = chartLayer.chartMarkManager?.curveMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        curveMarkStartPoint: curveMarkManagerState.curveMarkStartPoint,
                        currentCurveMark: curveMarkManagerState.currentCurveMark,
                    });
                    if (chartLayer.chartMarkManager?.curveMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.sectorMarkManager) {
                    const sectorMarkManagerState = chartLayer.chartMarkManager?.sectorMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        sectorPoints: sectorMarkManagerState.sectorPoints,
                        currentSector: sectorMarkManagerState.currentSector,
                    });
                    if (chartLayer.chartMarkManager?.sectorMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.fibonacciExtensionBaseTimeMarkManager) {
                    const fibonacciExtensionBaseTimeState = chartLayer.chartMarkManager?.fibonacciExtensionBaseTimeMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciExtensionBaseTimePoints: fibonacciExtensionBaseTimeState.fibonacciExtensionBaseTimePoints,
                        currentFibonacciExtensionBaseTime: fibonacciExtensionBaseTimeState.currentFibonacciExtensionBaseTime,
                    });
                    if (chartLayer.chartMarkManager?.fibonacciExtensionBaseTimeMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.fibonacciExtensionBasePriceMarkManager) {
                    const fibonacciExtensionState = chartLayer.chartMarkManager?.fibonacciExtensionBasePriceMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciExtensionBasePricePoints: fibonacciExtensionState.fibonacciExtensionBasePricePoints,
                        currentFibonacciExtensionBasePrice: fibonacciExtensionState.currentFibonacciExtensionBasePrice,
                    });
                    if (chartLayer.chartMarkManager?.fibonacciExtensionBasePriceMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.fibonacciChannelMarkManager) {
                    const fibonacciChannelState = chartLayer.chartMarkManager?.fibonacciChannelMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        currentFibonacciChannel: fibonacciChannelState.currentFibonacciChannelMark,
                        isFibonacciChannelMode: fibonacciChannelState.isFibonacciChannelMarkMode,
                        fibonacciChannelDrawingStep: chartLayer.chartMarkManager?.getDrawingStepFromPhase(fibonacciChannelState.drawingPhase),
                    });
                    if (chartLayer.chartMarkManager?.fibonacciChannelMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.fibonacciFanMarkManager) {
                    const fibonacciFanMarkManagerState = chartLayer.chartMarkManager?.fibonacciFanMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciFanStartPoint: fibonacciFanMarkManagerState.fibonacciFanStartPoint,
                        currentFibonacciFan: fibonacciFanMarkManagerState.currentFibonacciFan,
                    });
                    if (chartLayer.chartMarkManager?.fibonacciFanMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }

                if (chartLayer.chartMarkManager?.fibonacciWedgeMarkManager) {
                    const fibonacciWedgeMarkManagerState = chartLayer.chartMarkManager?.fibonacciWedgeMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciWedgePoints: fibonacciWedgeMarkManagerState.fibonacciWedgePoints,
                        currentFibonacciWedge: fibonacciWedgeMarkManagerState.currentFibonacciWedge,
                    });
                    if (chartLayer.chartMarkManager?.fibonacciWedgeMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.fibonacciSpiralMarkManager) {
                    const fibonacciSpiralMarkManagerState = chartLayer.chartMarkManager?.fibonacciSpiralMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciSpiralCenterPoint: fibonacciSpiralMarkManagerState.fibonacciSpiralCenterPoint,
                        currentFibonacciSpiral: fibonacciSpiralMarkManagerState.currentFibonacciSpiral,
                    });
                    if (chartLayer.chartMarkManager?.fibonacciSpiralMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.fibonacciCircleMarkManager) {
                    const fibonacciCircleMarkManagerState = chartLayer.chartMarkManager?.fibonacciCircleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciCircleCenterPoint: fibonacciCircleMarkManagerState.fibonacciCircleCenterPoint,
                        currentFibonacciCircle: fibonacciCircleMarkManagerState.currentFibonacciCircle,
                    });
                    if (chartLayer.chartMarkManager?.fibonacciCircleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.fibonacciArcMarkManager) {
                    const fibonacciArcMarkManagerState = chartLayer.chartMarkManager?.fibonacciArcMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciArcStartPoint: fibonacciArcMarkManagerState.fibonacciArcStartPoint,
                        currentFibonacciArc: fibonacciArcMarkManagerState.currentFibonacciArc,
                    });
                    if (chartLayer.chartMarkManager?.fibonacciArcMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.fibonacciRetracementMarkManager
                ) {
                    const fibonacciRetracementMarkManagerState = chartLayer.chartMarkManager?.fibonacciRetracementMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciRetracementStartPoint: fibonacciRetracementMarkManagerState.fibonacciRetracementStartPoint,
                        currentFibonacciRetracement: fibonacciRetracementMarkManagerState.currentFibonacciRetracement,
                    });
                    if (chartLayer.chartMarkManager?.fibonacciRetracementMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.fibonacciTimeZoonMarkManager
                ) {
                    const fibonacciTimeZoonMarkManagerState = chartLayer.chartMarkManager?.fibonacciTimeZoonMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        fibonacciTimeZoonStartPoint: fibonacciTimeZoonMarkManagerState.fibonacciTimeZoonStartPoint,
                        currentFibonacciTimeZoon: fibonacciTimeZoonMarkManagerState.currentFibonacciTimeZoon,
                    });
                    if (chartLayer.chartMarkManager?.fibonacciTimeZoonMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.gannRectangleMarkManager
                ) {
                    const gannRectangleMarkManagerState = chartLayer.chartMarkManager?.gannRectangleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        gannRectangleStartPoint: gannRectangleMarkManagerState.gannRectangleStartPoint,
                        currentGannRectangle: gannRectangleMarkManagerState.currentGannRectangle,
                    });
                    if (chartLayer.chartMarkManager?.gannRectangleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.gannBoxMarkManager
                ) {
                    const gannBoxMarkManagerState = chartLayer.chartMarkManager?.gannBoxMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        gannBoxStartPoint: gannBoxMarkManagerState.gannBoxStartPoint,
                        currentGannBox: gannBoxMarkManagerState.currentGannBox,
                    });
                    if (chartLayer.chartMarkManager?.gannBoxMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.gannFanMarkManager
                ) {
                    const gannFanMarkManagerState = chartLayer.chartMarkManager?.gannFanMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        gannFanStartPoint: gannFanMarkManagerState.gannFanStartPoint,
                        currentGannFan: gannFanMarkManagerState.currentGannFan,
                    });
                    if (chartLayer.chartMarkManager?.gannFanMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.triangleMarkManager
                ) {
                    const triangleMarkManagerState = chartLayer.chartMarkManager?.triangleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        triangleMarkStartPoint: triangleMarkManagerState.triangleMarkStartPoint,
                        currentTriangleMark: triangleMarkManagerState.currentTriangleMark,
                    });
                    if (chartLayer.chartMarkManager?.triangleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.ellipseMarkManager
                ) {
                    const ellipseMarkManagerState = chartLayer.chartMarkManager?.ellipseMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        ellipseMarkStartPoint: ellipseMarkManagerState.ellipseMarkStartPoint,
                        currentEllipseMark: ellipseMarkManagerState.currentEllipseMark,
                    });
                    if (chartLayer.chartMarkManager?.ellipseMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.circleMarkManager
                ) {
                    const circleMarkManagerState = chartLayer.chartMarkManager?.circleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        circleMarkStartPoint: circleMarkManagerState.circleMarkStartPoint,
                        currentCircleMark: circleMarkManagerState.currentCircleMark,
                    });
                    if (chartLayer.chartMarkManager?.circleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.rectangleMarkManager
                ) {
                    const rectangleMarkManagerState = chartLayer.chartMarkManager?.rectangleMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        rectangleMarkStartPoint: rectangleMarkManagerState.rectangleMarkStartPoint,
                        currentRectangleMark: rectangleMarkManagerState.currentRectangleMark,
                    });
                    if (chartLayer.chartMarkManager?.rectangleMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.enhancedAndrewPitchforkMarkManager
                ) {
                    const enhancedAndrewPitchforkMarkManagerState = chartLayer.chartMarkManager?.enhancedAndrewPitchforkMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        enhancedAndrewPitchforkHandlePoint: enhancedAndrewPitchforkMarkManagerState.enhancedAndrewPitchforkHandlePoint,
                        enhancedAndrewPitchforkBaseStartPoint: enhancedAndrewPitchforkMarkManagerState.enhancedAndrewPitchforkBaseStartPoint,
                        currentEnhancedAndrewPitchfork: enhancedAndrewPitchforkMarkManagerState.currentEnhancedAndrewPitchfork,
                    });
                    if (chartLayer.chartMarkManager?.enhancedAndrewPitchforkMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.andrewPitchforkMarkManager
                ) {
                    const andrewPitchforkMarkManagerState = chartLayer.chartMarkManager?.andrewPitchforkMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        andrewPitchforkHandlePoint: andrewPitchforkMarkManagerState.andrewPitchforkHandlePoint,
                        andrewPitchforkBaseStartPoint: andrewPitchforkMarkManagerState.andrewPitchforkBaseStartPoint,
                        currentAndrewPitchfork: andrewPitchforkMarkManagerState.currentAndrewPitchfork,
                    });
                    if (chartLayer.chartMarkManager?.andrewPitchforkMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.lineSegmentMarkManager
                ) {
                    const lineSegmentMarkManagerState = chartLayer.chartMarkManager?.lineSegmentMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        lineSegmentMarkStartPoint: lineSegmentMarkManagerState.lineSegmentMarkStartPoint,
                        currentLineSegmentMark: lineSegmentMarkManagerState.currentLineSegmentMark,
                    });
                    if (chartLayer.chartMarkManager?.lineSegmentMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.arrowLineMarkManager
                ) {
                    const arrowLineMarkManagerState = chartLayer.chartMarkManager?.arrowLineMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        arrowLineMarkStartPoint: arrowLineMarkManagerState.arrowLineMarkStartPoint,
                        currentArrowLineMark: arrowLineMarkManagerState.currentArrowLineMark,
                    });
                    if (chartLayer.chartMarkManager?.arrowLineMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.axisLineMarkManager) {
                    const axisLineMarkManagerState = chartLayer.chartMarkManager?.axisLineMarkManager.handleMouseDown(point);
                    if (chartLayer.chartMarkManager?.axisLineMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.parallelChannelMarkManager
                ) {
                    const parallelChannelMarkManagerState = chartLayer.chartMarkManager?.parallelChannelMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        parallelChannelMarkStartPoint: parallelChannelMarkManagerState.parallelChannelMarkStartPoint,
                        currentParallelChannelMark: parallelChannelMarkManagerState.currentParallelChannelMark,
                    });
                    if (chartLayer.chartMarkManager?.parallelChannelMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.linearRegressionChannelMarkManager
                ) {
                    const linearRegressionChannelMarkManagerState = chartLayer.chartMarkManager?.linearRegressionChannelMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        parallelChannelMarkStartPoint: linearRegressionChannelMarkManagerState.linearRegressionChannelStartPoint,
                        currentLinearRegressionChannel: linearRegressionChannelMarkManagerState.currentLinearRegressionChannel,
                    });
                    if (chartLayer.chartMarkManager?.linearRegressionChannelMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.equidistantChannelMarkManager
                ) {
                    const equidistantChannelMarkManagerState = chartLayer.chartMarkManager?.equidistantChannelMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        equidistantChannelMarkStartPoint: equidistantChannelMarkManagerState.equidistantChannelMarkStartPoint,
                        currentEquidistantChannelMark: equidistantChannelMarkManagerState.currentEquidistantChannelMark,
                    });
                    if (chartLayer.chartMarkManager?.equidistantChannelMarkManager.isOperatingOnChart()) {
                        chartLayer.disableChartMovement();
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                if (chartLayer.chartMarkManager?.disjointChannelMarkManager
                ) {
                    const disjointChannelMarkManagerState = chartLayer.chartMarkManager?.disjointChannelMarkManager.handleMouseDown(point);
                    chartLayer.setState({
                        disjointChannelMarkStartPoint: disjointChannelMarkManagerState.disjointChannelMarkStartPoint,
                        currentDisjointChannelMark: disjointChannelMarkManagerState.currentDisjointChannelMark,
                    });
                    if (chartLayer.chartMarkManager?.disjointChannelMarkManager.isOperatingOnChart()) {
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
            // update chart info 
            this.updateMAValues(chartLayer, point);
            this.updateEMAValues(chartLayer, point);
            this.updateBollingerBandsValues(chartLayer, point);
            this.updateIchimokuValues(chartLayer, point);
            this.updateDonchianChannelValues(chartLayer, point);
            this.updateEnvelopeValues(chartLayer, point);
            this.updateVWAPValues(chartLayer, point);

            // propagate panel events
            if (chartLayer.chartPanesManager) {
                chartLayer.chartPanesManager?.handleMouseMove(point);
            }

            if (chartLayer.chartMarkManager?.textEditMarkManager) {
                chartLayer.chartMarkManager?.textEditMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.textEditMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.bubbleBoxMarkManager) {
                chartLayer.chartMarkManager?.bubbleBoxMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.bubbleBoxMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.pinMarkManager) {
                chartLayer.chartMarkManager?.pinMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.pinMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.emojiMarkManager) {
                chartLayer.chartMarkManager?.emojiMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.emojiMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.signpostMarkManager) {
                chartLayer.chartMarkManager?.signpostMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.signpostMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.priceNoteMarkManager) {
                chartLayer.chartMarkManager?.priceNoteMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.priceNoteMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.flagMarkManager) {
                chartLayer.chartMarkManager?.flagMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.flagMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.priceLabelMarkManager) {
                chartLayer.chartMarkManager?.priceLabelMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.priceLabelMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.shortPositionMarkManager) {
                chartLayer.chartMarkManager?.shortPositionMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.shortPositionMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.longPositionMarkManager) {
                chartLayer.chartMarkManager?.longPositionMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.longPositionMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.tableMarkManager) {
                chartLayer.chartMarkManager?.tableMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.tableMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.imageMarkManager) {
                chartLayer.chartMarkManager?.imageMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.imageMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.thickArrowLineMarkManager) {
                chartLayer.chartMarkManager?.thickArrowLineMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.thickArrowLineMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.markerPenMarkManager) {
                chartLayer.chartMarkManager?.markerPenMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.markerPenMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.brushMarkManager) {
                chartLayer.chartMarkManager?.brushMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.brushMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.penMarkManager) {
                chartLayer.chartMarkManager?.penMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.penMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.pencilMarkManager) {
                chartLayer.chartMarkManager?.pencilMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.pencilMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.timePriceRangeMarkManager) {
                chartLayer.chartMarkManager?.timePriceRangeMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.timePriceRangeMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.priceRangeMarkManager) {
                chartLayer.chartMarkManager?.priceRangeMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.priceRangeMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.timeRangeMarkManager) {
                chartLayer.chartMarkManager?.timeRangeMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.timeRangeMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.elliottTripleCombinationMarkManager) {
                chartLayer.chartMarkManager?.elliottTripleCombinationMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.elliottTripleCombinationMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.elliottDoubleCombinationMarkManager) {
                chartLayer.chartMarkManager?.elliottDoubleCombinationMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.elliottDoubleCombinationMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.elliottTriangleMarkManager) {
                chartLayer.chartMarkManager?.elliottTriangleMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.elliottTriangleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.elliottCorrectiveMarkManager) {
                chartLayer.chartMarkManager?.elliottCorrectiveMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.elliottCorrectiveMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.elliottImpulseMarkManager) {
                chartLayer.chartMarkManager?.elliottImpulseMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.elliottImpulseMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.triangleABCDMarkManager) {
                chartLayer.chartMarkManager?.triangleABCDMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.triangleABCDMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.abcdMarkManager) {
                chartLayer.chartMarkManager?.abcdMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.abcdMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.headAndShouldersMarkManager) {
                chartLayer.chartMarkManager?.headAndShouldersMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.headAndShouldersMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.xabcdMarkManager) {
                chartLayer.chartMarkManager?.xabcdMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.xabcdMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.doubleCurveMarkManager) {
                chartLayer.chartMarkManager?.doubleCurveMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.doubleCurveMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.curveMarkManager) {
                chartLayer.chartMarkManager?.curveMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.curveMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.sectorMarkManager) {
                chartLayer.chartMarkManager?.sectorMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.sectorMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.fibonacciFanMarkManager) {
                chartLayer.chartMarkManager?.fibonacciFanMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.fibonacciFanMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.fibonacciExtensionBaseTimeMarkManager) {
                chartLayer.chartMarkManager?.fibonacciExtensionBaseTimeMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.fibonacciExtensionBaseTimeMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (chartLayer.chartMarkManager?.fibonacciExtensionBasePriceMarkManager) {
                chartLayer.chartMarkManager?.fibonacciExtensionBasePriceMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.fibonacciExtensionBasePriceMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.fibonacciChannelMarkManager) {
                chartLayer.chartMarkManager?.fibonacciChannelMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.fibonacciChannelMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.fibonacciWedgeMarkManager) {
                chartLayer.chartMarkManager?.fibonacciWedgeMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.fibonacciWedgeMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.fibonacciSpiralMarkManager) {
                chartLayer.chartMarkManager?.fibonacciSpiralMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.fibonacciSpiralMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.fibonacciCircleMarkManager) {
                chartLayer.chartMarkManager?.fibonacciCircleMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.fibonacciCircleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.fibonacciArcMarkManager) {
                chartLayer.chartMarkManager?.fibonacciArcMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.fibonacciArcMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.fibonacciRetracementMarkManager
            ) {
                chartLayer.chartMarkManager?.fibonacciRetracementMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.fibonacciRetracementMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.fibonacciTimeZoonMarkManager
            ) {
                chartLayer.chartMarkManager?.fibonacciTimeZoonMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.fibonacciTimeZoonMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.gannRectangleMarkManager
            ) {
                chartLayer.chartMarkManager?.gannRectangleMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.gannRectangleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.gannBoxMarkManager
            ) {
                chartLayer.chartMarkManager?.gannBoxMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.gannBoxMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.gannFanMarkManager
            ) {
                chartLayer.chartMarkManager?.gannFanMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.gannFanMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.triangleMarkManager
            ) {
                chartLayer.chartMarkManager?.triangleMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.triangleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.ellipseMarkManager
            ) {
                chartLayer.chartMarkManager?.ellipseMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.ellipseMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.circleMarkManager
            ) {
                chartLayer.chartMarkManager?.circleMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.circleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.rectangleMarkManager
            ) {
                chartLayer.chartMarkManager?.rectangleMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.rectangleMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.enhancedAndrewPitchforkMarkManager
            ) {
                chartLayer.chartMarkManager?.enhancedAndrewPitchforkMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.enhancedAndrewPitchforkMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.lineSegmentMarkManager
            ) {
                chartLayer.chartMarkManager?.lineSegmentMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.lineSegmentMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.andrewPitchforkMarkManager
            ) {
                chartLayer.chartMarkManager?.andrewPitchforkMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.andrewPitchforkMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.arrowLineMarkManager
            ) {
                chartLayer.chartMarkManager?.arrowLineMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.arrowLineMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.axisLineMarkManager) {
                chartLayer.chartMarkManager?.axisLineMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.axisLineMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.parallelChannelMarkManager
            ) {
                chartLayer.chartMarkManager?.parallelChannelMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.parallelChannelMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.linearRegressionChannelMarkManager
            ) {
                chartLayer.chartMarkManager?.linearRegressionChannelMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.linearRegressionChannelMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.equidistantChannelMarkManager
            ) {
                chartLayer.chartMarkManager?.equidistantChannelMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.equidistantChannelMarkManager.isOperatingOnChart()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (chartLayer.chartMarkManager?.disjointChannelMarkManager
            ) {
                chartLayer.chartMarkManager?.disjointChannelMarkManager.handleMouseMove(point);
                if (chartLayer.chartMarkManager?.disjointChannelMarkManager.isOperatingOnChart()) {
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

                // propagate panel events
                if (chartLayer.chartPanesManager) {
                    chartLayer.chartPanesManager?.handleMouseUp(point);
                }

                if (chartLayer.chartMarkManager?.textEditMarkManager) {
                    const textEditState = chartLayer.chartMarkManager?.textEditMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isTextEditMarkMode: textEditState.isTextEditMarkMode,
                        isTextEditDragging: textEditState.isDragging,
                        textEditDragTarget: textEditState.dragTarget,
                    });
                }

                if (chartLayer.chartMarkManager?.bubbleBoxMarkManager) {
                    const bubbleBoxState = chartLayer.chartMarkManager?.bubbleBoxMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isBubbleBoxMarkMode: bubbleBoxState.isBubbleBoxMarkMode,
                        bubbleBoxMarkPoints: bubbleBoxState.bubbleBoxMarkPoints,
                        currentBubbleBoxMark: bubbleBoxState.currentBubbleBoxMark,
                        isBubbleBoxDragging: bubbleBoxState.isDragging,
                        bubbleBoxDragTarget: bubbleBoxState.dragTarget,
                        bubbleBoxDragType: bubbleBoxState.dragType,
                    });
                }

                if (chartLayer.chartMarkManager?.pinMarkManager) {
                    const pinState = chartLayer.chartMarkManager?.pinMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isPinMarkMode: pinState.isPinMarkMode,
                        pinMarkPoint: pinState.pinMarkPoint,
                        currentPinMark: pinState.currentPinMark,
                        isPinDragging: pinState.isDragging,
                        pinDragTarget: pinState.dragTarget,
                    });
                }

                if (chartLayer.chartMarkManager?.emojiMarkManager) {
                    const emojiState = chartLayer.chartMarkManager?.emojiMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isEmojiMarkMode: emojiState.isEmojiMarkMode,
                        emojiMarkStartPoint: emojiState.emojiMarkStartPoint,
                        currentEmojiMark: emojiState.currentEmojiMark,
                        isEmojiDragging: emojiState.isDragging,
                        emojiDragTarget: emojiState.dragTarget,
                        emojiDragPoint: emojiState.dragPoint,
                    });
                }

                if (chartLayer.chartMarkManager?.signpostMarkManager) {
                    const signpostState = chartLayer.chartMarkManager?.signpostMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isSignpostMarkMode: signpostState.isSignPostMarkMode,
                        signpostMarkPoint: signpostState.signPostMarkPoint,
                        currentSignpostMark: signpostState.currentSignPostMark,
                        isSignpostDragging: signpostState.isDragging,
                        signpostDragTarget: signpostState.dragTarget,
                    });
                }

                if (chartLayer.chartMarkManager?.priceNoteMarkManager) {
                    const priceNoteState = chartLayer.chartMarkManager?.priceNoteMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isPriceNoteMarkMode: priceNoteState.isPriceNoteMarkMode,
                        priceNoteMarkStartPoint: priceNoteState.priceNoteMarkStartPoint,
                        currentPriceNoteMark: priceNoteState.currentPriceNoteMark,
                        isPriceNoteDragging: priceNoteState.isDragging,
                        priceNoteDragTarget: priceNoteState.dragTarget,
                        priceNoteDragPoint: priceNoteState.dragPoint,
                    });
                }

                if (chartLayer.chartMarkManager?.flagMarkManager) {
                    const flagState = chartLayer.chartMarkManager?.flagMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isFlagMarkMode: flagState.isFlagMarkMode,
                        flagMarkPoint: flagState.flagMarkPoint,
                        currentFlagMark: flagState.currentFlagMark,
                        isFlagDragging: flagState.isDragging,
                        flagDragTarget: flagState.dragTarget,
                    });
                }

                if (chartLayer.chartMarkManager?.priceLabelMarkManager) {
                    const priceLabelState = chartLayer.chartMarkManager?.priceLabelMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isPriceLabelMarkMode: priceLabelState.isPriceLabelMarkMode,
                        priceLabelMarkPoint: priceLabelState.priceLabelMarkPoint,
                        currentPriceLabelMark: priceLabelState.currentPriceLabelMark,
                        isPriceLabelDragging: priceLabelState.isDragging,
                        priceLabelDragTarget: priceLabelState.dragTarget,
                    });
                }

                if (chartLayer.chartMarkManager?.shortPositionMarkManager) {
                    const shortPositionState = chartLayer.chartMarkManager?.shortPositionMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isShortPositionMarkMode: shortPositionState.isShortPositionMarkMode,
                        shortPositionMarkStartPoint: shortPositionState.shortPositionMarkStartPoint,
                        currentShortPositionMark: shortPositionState.currentShortPositionMark,
                        isShortPositionDragging: shortPositionState.isDragging,
                        shortPositionDragTarget: shortPositionState.dragTarget,
                        shortPositionDragPoint: shortPositionState.dragPoint,
                        shortPositionDrawingPhase: shortPositionState.drawingPhase,
                        shortPositionAdjustingMode: shortPositionState.adjustingMode,
                    });
                }

                if (chartLayer.chartMarkManager?.longPositionMarkManager) {
                    const longPositionState = chartLayer.chartMarkManager?.longPositionMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isLongPositionMarkMode: longPositionState.isLongPositionMarkMode,
                        longPositionMarkStartPoint: longPositionState.longPositionMarkStartPoint,
                        currentLongPositionMark: longPositionState.currentLongPositionMark,
                        isDragging: longPositionState.isDragging,
                        dragTarget: longPositionState.dragTarget,
                        dragPoint: longPositionState.dragPoint,
                        longPositionDrawingPhase: longPositionState.drawingPhase,
                        adjustingMode: longPositionState.adjustingMode,
                    });
                }

                if (chartLayer.chartMarkManager?.tableMarkManager) {
                    const tableState = chartLayer.chartMarkManager?.tableMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isTableMarkMode: tableState.isTableMarkMode,
                        tableMarkStartPoint: tableState.tableMarkStartPoint,
                        currentTableMark: tableState.currentTableMark,
                        isTableDragging: tableState.isDragging,
                        tableDragTarget: tableState.dragTarget,
                        tableDragPoint: tableState.dragPoint,
                    });
                }

                if (chartLayer.chartMarkManager?.imageMarkManager) {
                    const imageMarkState = chartLayer.chartMarkManager?.imageMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isImageMarkMode: imageMarkState.isImageMarkMode,
                        imageMarkStartPoint: imageMarkState.imageMarkStartPoint,
                        currentImageMark: imageMarkState.currentImageMark,
                        showImageModal: imageMarkState.showImageModal,
                        selectedImageUrl: imageMarkState.selectedImageUrl
                    });
                }

                if (chartLayer.chartMarkManager?.thickArrowLineMarkManager) {
                    const thickArrowLineState = chartLayer.chartMarkManager?.thickArrowLineMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        thickArrowLineMarkStartPoint: thickArrowLineState.thickArrowLineMarkStartPoint,
                        currentThickArrowLineMark: thickArrowLineState.currentThickArrowLineMark,
                    });
                }

                if (chartLayer.chartMarkManager?.eraserMarkManager) {
                    const eraserState = chartLayer.chartMarkManager?.eraserMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isErasing: false,
                        eraserHoveredMark: null
                    });
                }

                if (chartLayer.chartMarkManager?.markerPenMarkManager) {
                    const markerPenState = chartLayer.chartMarkManager?.markerPenMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isMarkerPenMode: markerPenState.isMarkerPenMarkMode,
                        isDrawing: markerPenState.isDrawing,
                        currentMarkerPen: markerPenState.currentMarkerPenMark,
                        isDragging: markerPenState.isDragging,
                    });
                }

                if (chartLayer.chartMarkManager?.brushMarkManager) {
                    const brushState = chartLayer.chartMarkManager?.brushMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isBrushMode: brushState.isBrushMode,
                        isDrawing: brushState.isDrawing,
                        currentBrushMark: brushState.currentBrushMark,
                        isDragging: brushState.isDragging,
                    });
                }

                if (chartLayer.chartMarkManager?.penMarkManager) {
                    const penState = chartLayer.chartMarkManager?.penMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isPenMode: penState.isPenMode,
                        isDrawing: penState.isDrawing,
                        currentPenMark: penState.currentPenMark,
                        isDragging: penState.isDragging,
                    });
                }

                if (chartLayer.chartMarkManager?.pencilMarkManager) {
                    const pencilState = chartLayer.chartMarkManager?.pencilMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        isPencilMode: pencilState.isPencilMode,
                        isDrawing: pencilState.isDrawing,
                        currentPencilMark: pencilState.currentPencilMark,
                        isDragging: pencilState.isDragging,
                    });
                }

                if (chartLayer.chartMarkManager?.timePriceRangeMarkManager) {
                    const timePriceRangeState = chartLayer.chartMarkManager?.timePriceRangeMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        timePriceRangeMarkStartPoint: timePriceRangeState.timePriceRangeMarkStartPoint,
                        currentTimePriceRangeMark: timePriceRangeState.currentTimePriceRangeMark,
                        isTimePriceRangeMarkMode: timePriceRangeState.isTimePriceRangeMarkMode,
                    });
                }

                if (chartLayer.chartMarkManager?.priceRangeMarkManager) {
                    const priceRangeState = chartLayer.chartMarkManager?.priceRangeMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        priceRangeMarkStartPoint: priceRangeState.priceRangeMarkStartPoint,
                        currentPriceRangeMark: priceRangeState.currentPriceRangeMark,
                    });
                }

                if (chartLayer.chartMarkManager?.timeRangeMarkManager) {
                    const timeRangeState = chartLayer.chartMarkManager?.timeRangeMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        timeRangeMarkStartPoint: timeRangeState.timeRangeMarkStartPoint,
                        currentTimeRangeMark: timeRangeState.currentTimeRangeMark,
                    });
                }

                if (chartLayer.chartMarkManager?.elliottTripleCombinationMarkManager) {
                    const elliottTripleState = chartLayer.chartMarkManager?.elliottTripleCombinationMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        elliottTripleCombinationPoints: elliottTripleState.currentPoints,
                        currentElliottTripleCombinationMark: elliottTripleState.currentElliottTripleCombinationMark,
                    });
                }
                if (chartLayer.chartMarkManager?.elliottDoubleCombinationMarkManager) {
                    const elliottDoubleCombinationState = chartLayer.chartMarkManager?.elliottDoubleCombinationMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        elliottDoubleCombinationPoints: elliottDoubleCombinationState.currentPoints,
                        currentElliottDoubleCombinationMark: elliottDoubleCombinationState.currentElliottDoubleCombinationMark,
                    });
                }

                if (chartLayer.chartMarkManager?.elliottTriangleMarkManager) {
                    const elliottTriangleState = chartLayer.chartMarkManager?.elliottTriangleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        elliottTrianglePoints: elliottTriangleState.currentPoints,
                        currentElliottTriangleMark: elliottTriangleState.currentElliottTriangleMark,
                    });
                }

                if (chartLayer.chartMarkManager?.elliottCorrectiveMarkManager) {
                    const elliottCorrectiveState = chartLayer.chartMarkManager?.elliottCorrectiveMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        elliottCorrectivePoints: elliottCorrectiveState.currentPoints,
                        currentElliottCorrectiveMark: elliottCorrectiveState.currentElliottCorrectiveMark,
                    });
                }

                if (chartLayer.chartMarkManager?.elliottImpulseMarkManager) {
                    const elliottImpulseState = chartLayer.chartMarkManager?.elliottImpulseMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        elliottImpulsePoints: elliottImpulseState.currentPoints,
                        currentElliottImpulseMark: elliottImpulseState.currentElliottImpulseMark,
                    });
                }

                if (chartLayer.chartMarkManager?.triangleABCDMarkManager) {
                    const triangleABCDState = chartLayer.chartMarkManager?.triangleABCDMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        triangleABCDPoints: triangleABCDState.currentPoints,
                        currentTriangleABCDMark: triangleABCDState.currentTriangleABCDMark,
                    });
                }

                if (chartLayer.chartMarkManager?.abcdMarkManager) {
                    const abcdState = chartLayer.chartMarkManager?.abcdMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        abcdPoints: abcdState.currentPoints,
                        currentABCDMark: abcdState.currentABCDMark,
                    });
                }

                if (chartLayer.chartMarkManager?.headAndShouldersMarkManager) {
                    const headAndShouldersState = chartLayer.chartMarkManager?.headAndShouldersMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        headAndShouldersPoints: headAndShouldersState.currentPoints,
                        currentHeadAndShouldersMark: headAndShouldersState.currentHeadAndShouldersMark,
                    });
                }

                if (chartLayer.chartMarkManager?.xabcdMarkManager) {
                    const xabcdState = chartLayer.chartMarkManager?.xabcdMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        xabcdPoints: xabcdState.currentPoints,
                        currentXABCDMark: xabcdState.currentXABCDMark,
                    });
                }

                if (chartLayer.chartMarkManager?.doubleCurveMarkManager) {
                    const doubleCurveMarkManagerState = chartLayer.chartMarkManager?.doubleCurveMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        doubleCurveMarkStartPoint: doubleCurveMarkManagerState.doubleCurveMarkStartPoint,
                        currentDoubleCurveMark: doubleCurveMarkManagerState.currentDoubleCurveMark,
                    });
                }

                if (chartLayer.chartMarkManager?.curveMarkManager) {
                    const curveMarkManagerState = chartLayer.chartMarkManager?.curveMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        curveMarkStartPoint: curveMarkManagerState.curveMarkStartPoint,
                        currentCurveMark: curveMarkManagerState.currentCurveMark,
                    });
                }

                if (chartLayer.chartMarkManager?.sectorMarkManager) {
                    const sectorMarkManagerState = chartLayer.chartMarkManager?.sectorMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        sectorPoints: sectorMarkManagerState.sectorPoints,
                        currentSector: sectorMarkManagerState.currentSector,
                    });
                }
                if (chartLayer.chartMarkManager?.fibonacciExtensionBasePriceMarkManager) {
                    const fibonacciExtensionState = chartLayer.chartMarkManager?.fibonacciExtensionBasePriceMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciExtensionBasePricePoints: fibonacciExtensionState.fibonacciExtensionBasePricePoints,
                        currentFibonacciExtensionBasePrice: fibonacciExtensionState.currentFibonacciExtensionBasePrice,
                    });
                }
                if (chartLayer.chartMarkManager?.fibonacciExtensionBaseTimeMarkManager) {
                    const fibonacciExtensionBaseTimeState = chartLayer.chartMarkManager?.fibonacciExtensionBaseTimeMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciExtensionBaseTimePoints: fibonacciExtensionBaseTimeState.fibonacciExtensionBaseTimePoints,
                        currentFibonacciExtensionBaseTime: fibonacciExtensionBaseTimeState.currentFibonacciExtensionBaseTime,
                    });
                }
                if (chartLayer.chartMarkManager?.fibonacciChannelMarkManager) {
                    const fibonacciChannelState = chartLayer.chartMarkManager?.fibonacciChannelMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        currentFibonacciChannel: fibonacciChannelState.currentFibonacciChannelMark,
                        isFibonacciChannelMode: fibonacciChannelState.isFibonacciChannelMarkMode,
                        fibonacciChannelDrawingStep: chartLayer.chartMarkManager?.getDrawingStepFromPhase(fibonacciChannelState.drawingPhase),
                    });
                }
                if (chartLayer.chartMarkManager?.fibonacciFanMarkManager) {
                    const fibonacciFanMarkManagerState = chartLayer.chartMarkManager?.fibonacciFanMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciFanStartPoint: fibonacciFanMarkManagerState.fibonacciFanStartPoint,
                        currentFibonacciFan: fibonacciFanMarkManagerState.currentFibonacciFan,
                    });
                }
                if (chartLayer.chartMarkManager?.fibonacciWedgeMarkManager) {
                    const fibonacciWedgeMarkManagerState = chartLayer.chartMarkManager?.fibonacciWedgeMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciWedgePoints: fibonacciWedgeMarkManagerState.fibonacciWedgePoints,
                        currentFibonacciWedge: fibonacciWedgeMarkManagerState.currentFibonacciWedge,
                    });
                }
                if (chartLayer.chartMarkManager?.fibonacciSpiralMarkManager) {
                    const fibonacciSpiralMarkManagerState = chartLayer.chartMarkManager?.fibonacciSpiralMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciSpiralCenterPoint: fibonacciSpiralMarkManagerState.fibonacciSpiralCenterPoint,
                        currentFibonacciSpiral: fibonacciSpiralMarkManagerState.currentFibonacciSpiral,
                    });
                }
                if (chartLayer.chartMarkManager?.fibonacciCircleMarkManager) {
                    const fibonacciCircleMarkManagerState = chartLayer.chartMarkManager?.fibonacciCircleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciCircleCenterPoint: fibonacciCircleMarkManagerState.fibonacciCircleCenterPoint,
                        currentFibonacciCircle: fibonacciCircleMarkManagerState.currentFibonacciCircle,
                    });
                }
                if (chartLayer.chartMarkManager?.fibonacciArcMarkManager) {
                    const fibonacciArcMarkManagerState = chartLayer.chartMarkManager?.fibonacciArcMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciArcStartPoint: fibonacciArcMarkManagerState.fibonacciArcStartPoint,
                        currentFibonacciArc: fibonacciArcMarkManagerState.currentFibonacciArc,
                    });
                }
                if (chartLayer.chartMarkManager?.fibonacciRetracementMarkManager
                ) {
                    const fibonacciRetracementMarkManagerState = chartLayer.chartMarkManager?.fibonacciRetracementMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciRetracementStartPoint: fibonacciRetracementMarkManagerState.fibonacciRetracementStartPoint,
                        currentFibonacciRetracement: fibonacciRetracementMarkManagerState.currentFibonacciRetracement,
                    });
                }

                if (chartLayer.chartMarkManager?.fibonacciTimeZoonMarkManager
                ) {
                    const fibonacciTimeCycleMarkManagerState = chartLayer.chartMarkManager?.fibonacciTimeZoonMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        fibonacciTimeZoonStartPoint: fibonacciTimeCycleMarkManagerState.fibonacciTimeZoonStartPoint,
                        currentFibonacciTimeZoon: fibonacciTimeCycleMarkManagerState.currentFibonacciTimeZoon,
                    });
                }
                if (chartLayer.chartMarkManager?.gannRectangleMarkManager
                ) {
                    const gannRectangleMarkManagerState = chartLayer.chartMarkManager?.gannRectangleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        gannRectangleStartPoint: gannRectangleMarkManagerState.gannRectangleStartPoint,
                        currentGannRectangle: gannRectangleMarkManagerState.currentGannRectangle,
                    });
                }
                if (chartLayer.chartMarkManager?.gannBoxMarkManager
                ) {
                    const gannBoxMarkManagerState = chartLayer.chartMarkManager?.gannBoxMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        gannBoxStartPoint: gannBoxMarkManagerState.gannBoxStartPoint,
                        currentGannBox: gannBoxMarkManagerState.currentGannBox,
                    });
                }
                if (chartLayer.chartMarkManager?.gannFanMarkManager
                ) {
                    const gannFanMarkManagerState = chartLayer.chartMarkManager?.gannFanMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        gannFanStartPoint: gannFanMarkManagerState.gannFanStartPoint,
                        currentGannFan: gannFanMarkManagerState.currentGannFan,
                    });
                }
                if (chartLayer.chartMarkManager?.triangleMarkManager
                ) {
                    const triangleMarkManagerState = chartLayer.chartMarkManager?.triangleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        triangleMarkStartPoint: triangleMarkManagerState.triangleMarkStartPoint,
                        currentTriangleMark: triangleMarkManagerState.currentTriangleMark,
                    });
                }
                if (chartLayer.chartMarkManager?.ellipseMarkManager
                ) {
                    const ellipseMarkManagerState = chartLayer.chartMarkManager?.ellipseMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        ellipseMarkStartPoint: ellipseMarkManagerState.ellipseMarkStartPoint,
                        currentEllipseMark: ellipseMarkManagerState.currentEllipseMark,
                    });
                }
                if (chartLayer.chartMarkManager?.circleMarkManager
                ) {
                    const circleMarkManagerState = chartLayer.chartMarkManager?.circleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        circleMarkStartPoint: circleMarkManagerState.circleMarkStartPoint,
                        currentCircleMark: circleMarkManagerState.currentCircleMark,
                    });
                }
                if (chartLayer.chartMarkManager?.rectangleMarkManager
                ) {
                    const rectangleMarkManagerState = chartLayer.chartMarkManager?.rectangleMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        rectangleMarkStartPoint: rectangleMarkManagerState.rectangleMarkStartPoint,
                        currentRectangleMark: rectangleMarkManagerState.currentRectangleMark,
                    });
                }
                if (chartLayer.chartMarkManager?.enhancedAndrewPitchforkMarkManager
                ) {
                    const enhancedAndrewPitchforkMarkManagerState = chartLayer.chartMarkManager?.enhancedAndrewPitchforkMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        enhancedAndrewPitchforkHandlePoint: enhancedAndrewPitchforkMarkManagerState.enhancedAndrewPitchforkHandlePoint,
                        enhancedAndrewPitchforkBaseStartPoint: enhancedAndrewPitchforkMarkManagerState.enhancedAndrewPitchforkBaseStartPoint,
                        currentEnhancedAndrewPitchfork: enhancedAndrewPitchforkMarkManagerState.currentEnhancedAndrewPitchfork,
                    });
                }
                if (chartLayer.chartMarkManager?.andrewPitchforkMarkManager
                ) {
                    const andrewPitchforkMarkManagerState = chartLayer.chartMarkManager?.andrewPitchforkMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        andrewPitchforkHandlePoint: andrewPitchforkMarkManagerState.andrewPitchforkHandlePoint,
                        andrewPitchforkBaseStartPoint: andrewPitchforkMarkManagerState.andrewPitchforkBaseStartPoint,
                        currentAndrewPitchfork: andrewPitchforkMarkManagerState.currentAndrewPitchfork,
                    });
                }
                if (chartLayer.chartMarkManager?.lineSegmentMarkManager
                ) {
                    const lineSegmentMarkManagerState = chartLayer.chartMarkManager?.lineSegmentMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        lineSegmentMarkStartPoint: lineSegmentMarkManagerState.lineSegmentMarkStartPoint,
                        currentLineSegmentMark: lineSegmentMarkManagerState.currentLineSegmentMark,
                    });
                }
                if (chartLayer.chartMarkManager?.parallelChannelMarkManager
                ) {
                    const parallelChannelMarkManagerState = chartLayer.chartMarkManager?.parallelChannelMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        parallelChannelMarkStartPoint: parallelChannelMarkManagerState.parallelChannelMarkStartPoint,
                        currentParallelChannelMark: parallelChannelMarkManagerState.currentParallelChannelMark,
                    });
                }
                if (chartLayer.chartMarkManager?.linearRegressionChannelMarkManager
                ) {
                    const linearRegressionChannelMarkManagerState = chartLayer.chartMarkManager?.linearRegressionChannelMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        parallelChannelMarkStartPoint: linearRegressionChannelMarkManagerState.linearRegressionChannelStartPoint,
                        currentLinearRegressionChannel: linearRegressionChannelMarkManagerState.currentLinearRegressionChannel,
                    });
                }
                if (chartLayer.chartMarkManager?.arrowLineMarkManager
                ) {
                    const arrowLineMarkManagerState = chartLayer.chartMarkManager?.arrowLineMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        arrowLineMarkStartPoint: arrowLineMarkManagerState.arrowLineMarkStartPoint,
                        currentArrowLineMark: arrowLineMarkManagerState.currentArrowLineMark,
                    });
                }
                if (chartLayer.chartMarkManager?.equidistantChannelMarkManager
                ) {
                    const equidistantChannelMarkManagerState = chartLayer.chartMarkManager?.equidistantChannelMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        equidistantChannelMarkStartPoint: equidistantChannelMarkManagerState.equidistantChannelMarkStartPoint,
                        currentEquidistantChannelMark: equidistantChannelMarkManagerState.currentEquidistantChannelMark,
                    });
                }
                if (chartLayer.chartMarkManager?.disjointChannelMarkManager
                ) {
                    const disjointChannelMarkManagerState = chartLayer.chartMarkManager?.disjointChannelMarkManager.handleMouseUp(point);
                    chartLayer.setState({
                        disjointChannelMarkStartPoint: disjointChannelMarkManagerState.disjointChannelMarkStartPoint,
                        currentDisjointChannelMark: disjointChannelMarkManagerState.currentDisjointChannelMark,
                    });
                }
                if (chartLayer.chartMarkManager?.axisLineMarkManager) {
                    const axisLineMarkManagerState = chartLayer.chartMarkManager?.axisLineMarkManager.handleMouseUp(point);
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
        if (chartLayer.chartMarkManager?.lineSegmentMarkManager) {
            const newState = chartLayer.chartMarkManager?.lineSegmentMarkManager.handleMouseDown(point);
            chartLayer.setState({
                lineSegmentMarkStartPoint: newState.lineSegmentMarkStartPoint,
                currentLineSegmentMark: newState.currentLineSegmentMark,
            });
        }
    };
    // =============================== text mark end ===============================

    // =============================== Main Chart Indicator Chart Info Update Start ===============================
    private updateMAValues = (chartLayer: ChartLayer, point: Point) => {
        const technicalIndicatorManager = chartLayer.mainChartTechnicalIndicatorManager;
        if (!technicalIndicatorManager) return;
        try {
            const values = technicalIndicatorManager.getMAYAxisValuesAtMouseX(point.x, chartLayer.props.chart);
            chartLayer.setState({
                maIndicatorValues: values || {}
            });
        } catch (error) {
            console.error(error);
        }
    };

    private updateEMAValues = (chartLayer: ChartLayer, point: Point) => {
        const technicalIndicatorManager = chartLayer.mainChartTechnicalIndicatorManager;
        if (!technicalIndicatorManager) return;
        try {
            const values = technicalIndicatorManager.getEMAYAxisValuesAtMouseX(point.x, chartLayer.props.chart);
            chartLayer.setState({
                emaIndicatorValues: values || {}
            });
        } catch (error) {
            console.error(error);
        }
    };

    private updateBollingerBandsValues = (chartLayer: ChartLayer, point: Point) => {
        const technicalIndicatorManager = chartLayer.mainChartTechnicalIndicatorManager;
        if (!technicalIndicatorManager) return;
        try {
            const values = technicalIndicatorManager.getBollingerBandsYAxisValuesAtMouseX(point.x, chartLayer.props.chart);
            chartLayer.setState({
                bollingerBandsValues: values || {}
            });
        } catch (error) {
            console.error(error);
        }
    };

    private updateIchimokuValues = (chartLayer: ChartLayer, point: Point) => {
        const technicalIndicatorManager = chartLayer.mainChartTechnicalIndicatorManager;
        if (!technicalIndicatorManager) return;
        try {
            const values = technicalIndicatorManager.getIchimokuYAxisValuesAtMouseX(point.x, chartLayer.props.chart);
            chartLayer.setState({
                ichimokuValues: values || {}
            });
        } catch (error) {
            console.error(error);
        }
    };

    private updateDonchianChannelValues = (chartLayer: ChartLayer, point: Point) => {
        const technicalIndicatorManager = chartLayer.mainChartTechnicalIndicatorManager;
        if (!technicalIndicatorManager) return;
        try {
            const values = technicalIndicatorManager.getDonchianChannelYAxisValuesAtMouseX(point.x, chartLayer.props.chart);
            chartLayer.setState({
                donchianChannelValues: values || {}
            });
        } catch (error) {
            console.error(error);
        }
    };

    private updateEnvelopeValues = (chartLayer: ChartLayer, point: Point) => {
        const technicalIndicatorManager = chartLayer.mainChartTechnicalIndicatorManager;
        if (!technicalIndicatorManager) return;
        try {
            const values = technicalIndicatorManager.getEnvelopeYAxisValuesAtMouseX(point.x, chartLayer.props.chart);
            chartLayer.setState({
                envelopeValues: values || {}
            });
        } catch (error) {
            console.error(error);
        }
    };

    private updateVWAPValues = (chartLayer: ChartLayer, point: Point) => {
        const technicalIndicatorManager = chartLayer.mainChartTechnicalIndicatorManager;
        if (!technicalIndicatorManager) return;
        try {
            const value = technicalIndicatorManager.getVWAPYAxisValueAtMouseX(point.x, chartLayer.props.chart);
            chartLayer.setState({
                vwapValue: value
            });
        } catch (error) {
            console.error(error);
        }
    };
    // =============================== Main Chart Indicator Chart Info Update End ===============================

    // =============================== OHLC Start ===============================
    private updateCurrentOHLC = (chartLayer: ChartLayer, point: Point) => {
        const { chartData, chart } = chartLayer.props;
        if (!chartData || chartData.length === 0) return;
        const timeScale = chart.timeScale();
        const visibleRange = timeScale.getVisibleLogicalRange();
        if (!visibleRange) return;
        const logicalPosition = timeScale.coordinateToLogical(point.x);
        if (logicalPosition === null) return;
        const dataIndex = Math.max(0, Math.min(chartData.length, Math.round(logicalPosition)));
        if (dataIndex >= 0 && dataIndex < chartData.length) {
            const dataPoint = chartData[dataIndex] as ICandleViewDataPoint;
            const priceAtMouse = this.coordinateToPrice(chartLayer, point.y);
            const basePrice = priceAtMouse;
            const volatility = 0.02;
            const open = basePrice;
            const high = basePrice * (1 + volatility);
            const low = basePrice * (1 - volatility);
            const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
            const timestamp = dataPoint.time;
            const date = new Date(timestamp * 1000);
            const timeStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
            chartLayer.setState({
                currentOHLC: {
                    time: timeStr,
                    open: Number(open.toFixed(2)),
                    high: Number(high.toFixed(2)),
                    low: Number(low.toFixed(2)),
                    close: Number(close.toFixed(2))
                }
            });
        }
    };

    private coordinateToPrice = (chartLayer: ChartLayer, y: number): number => {
        const canvas = chartLayer.canvasRef.current;
        if (!canvas) return 100;
        const priceRange = this.getChartPriceRange(chartLayer);
        if (!priceRange) return 100;
        const percent = 1 - (y / canvas.height);
        return priceRange.min + (priceRange.max - priceRange.min) * percent;
    };

    private getChartPriceRange = (chartLayer: ChartLayer): { min: number; max: number } | null => {
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
        const margin = (maxPrice - minPrice) * 0.1;
        return {
            min: minPrice - margin,
            max: maxPrice + margin
        };
    };

    private updateCurrentOHLCByData = (chartLayer: ChartLayer, point: Point) => {
        const { chartData } = chartLayer.props;
        if (!chartData || chartData.length === 0) return;
        const canvas = chartLayer.canvasRef.current;
        if (!canvas) return;
        const timeIndex = Math.floor((point.x / canvas.width) * chartData.length);
        if (timeIndex >= 0 && timeIndex < chartData.length) {
            const dataPoint = chartData[timeIndex] as ICandleViewDataPoint;
            if (dataPoint.open !== undefined && dataPoint.high !== undefined &&
                dataPoint.low !== undefined && dataPoint.close !== undefined) {
                chartLayer.setState({
                    currentOHLC: {
                        time: timestampToDateTime(dataPoint.time),
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
        const dataPoint = chartData[timeIndex] as ICandleViewDataPoint;
        const priceRange = this.getChartPriceRange(chartLayer);
        if (!priceRange) return;
        const priceAtMouse = this.coordinateToPrice(chartLayer, point.y);
        const basePrice = dataPoint.close !== undefined ? dataPoint.close :
            dataPoint.volume !== undefined ? dataPoint.volume :
                priceAtMouse;
        const volatility = 0.02;
        const open = basePrice;
        const high = basePrice * (1 + volatility);
        const low = basePrice * (1 - volatility);
        const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
        chartLayer.setState({
            currentOHLC: {
                time: timestampToDateTime(dataPoint.time),
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(close.toFixed(2))
            }
        });
    };
    // =============================== OHLC End ===============================


    private getChartPriceRangeByData = (chartLayer: ChartLayer,): { min: number; max: number } | null => {
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
        const margin = (maxPrice - minPrice) * 0.1;
        return {
            min: minPrice - margin,
            max: maxPrice + margin
        };
    };

    private coordinateToPriceByData = (chartLayer: ChartLayer, y: number): number => {
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
            chartLayer.chartMarkManager?.lineSegmentMarkManager,
            chartLayer.chartMarkManager?.axisLineMarkManager,
            chartLayer.chartMarkManager?.arrowLineMarkManager,
            chartLayer.chartMarkManager?.parallelChannelMarkManager,
            chartLayer.chartMarkManager?.linearRegressionChannelMarkManager,
            chartLayer.chartMarkManager?.equidistantChannelMarkManager,
            chartLayer.chartMarkManager?.disjointChannelMarkManager,
            chartLayer.chartMarkManager?.andrewPitchforkMarkManager,
            chartLayer.chartMarkManager?.enhancedAndrewPitchforkMarkManager,
            chartLayer.chartMarkManager?.rectangleMarkManager,
            chartLayer.chartMarkManager?.circleMarkManager,
            chartLayer.chartMarkManager?.ellipseMarkManager,
            chartLayer.chartMarkManager?.triangleMarkManager,
            chartLayer.chartMarkManager?.gannFanMarkManager,
            chartLayer.chartMarkManager?.gannBoxMarkManager,
            chartLayer.chartMarkManager?.gannRectangleMarkManager,
            chartLayer.chartMarkManager?.fibonacciTimeZoonMarkManager,
            chartLayer.chartMarkManager?.fibonacciRetracementMarkManager,
            chartLayer.chartMarkManager?.fibonacciArcMarkManager,
            chartLayer.chartMarkManager?.fibonacciCircleMarkManager,
            chartLayer.chartMarkManager?.fibonacciSpiralMarkManager,
            chartLayer.chartMarkManager?.fibonacciWedgeMarkManager,
            chartLayer.chartMarkManager?.fibonacciFanMarkManager,
            chartLayer.chartMarkManager?.fibonacciChannelMarkManager,
            chartLayer.chartMarkManager?.fibonacciExtensionBasePriceMarkManager,
            chartLayer.chartMarkManager?.fibonacciExtensionBaseTimeMarkManager,
            chartLayer.chartMarkManager?.sectorMarkManager,
            chartLayer.chartMarkManager?.doubleCurveMarkManager,
            chartLayer.chartMarkManager?.xabcdMarkManager,
            chartLayer.chartMarkManager?.headAndShouldersMarkManager,
            chartLayer.chartMarkManager?.abcdMarkManager,
            chartLayer.chartMarkManager?.triangleABCDMarkManager,
            chartLayer.chartMarkManager?.elliottImpulseMarkManager,
            chartLayer.chartMarkManager?.elliottTriangleMarkManager,
            chartLayer.chartMarkManager?.elliottDoubleCombinationMarkManager,
            chartLayer.chartMarkManager?.elliottTripleCombinationMarkManager,
            chartLayer.chartMarkManager?.timeRangeMarkManager,
            chartLayer.chartMarkManager?.timePriceRangeMarkManager,
            chartLayer.chartMarkManager?.pencilMarkManager,
            chartLayer.chartMarkManager?.penMarkManager,
            chartLayer.chartMarkManager?.brushMarkManager,
            chartLayer.chartMarkManager?.markerPenMarkManager,
            chartLayer.chartMarkManager?.thickArrowLineMarkManager,
            chartLayer.chartMarkManager?.priceLabelMarkManager,
            chartLayer.chartMarkManager?.flagMarkManager,
            chartLayer.chartMarkManager?.priceNoteMarkManager,
            chartLayer.chartMarkManager?.signpostMarkManager,
            chartLayer.chartMarkManager?.bubbleBoxMarkManager,
            chartLayer.chartMarkManager?.pinMarkManager,
            chartLayer.chartMarkManager?.textEditMarkManager,
            chartLayer.chartMarkManager?.tableMarkManager,
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
            // table mark
            if (MarkType.Table === markType) {
                const drawing: MarkDrawing = {
                    id: `table_${Date.now()}`,
                    type: markTypeName(markType),
                    markType: markType,
                    mark: graph,
                    points: [point],
                    color: chartLayer.props.currentTheme.chart.lineColor,
                    lineWidth: 1,
                    rotation: 0,
                    properties: {
                        originalMark: graph
                    }
                };
                chartLayer.showTableMarkToolBar(drawing);
                chartLayer.currentMarkSettingsStyle = (graph as IMarkStyle);
                return true;
            }
            // text edit mark
            if (MarkType.TextEdit === markType ||
                MarkType.BubbleBox === markType ||
                MarkType.SignPost === markType ||
                MarkType.Pin === markType) {
                const drawing: MarkDrawing = {
                    id: `text_edit_${Date.now()}`,
                    type: markTypeName(markType),
                    markType: markType,
                    mark: graph,
                    points: [point],
                    color: chartLayer.props.currentTheme.chart.lineColor,
                    lineWidth: 1,
                    rotation: 0,
                    properties: {
                        originalMark: graph
                    }
                };
                chartLayer.showTextMarkToolBar(drawing);
                chartLayer.currentMarkSettingsStyle = (graph as IMarkStyle);
                return true;
            }

            const drawing: MarkDrawing = {
                id: `graph_${Date.now()}`,
                type: markTypeName(markType),
                markType: markType,
                mark: graph,
                points: [point],
                color: chartLayer.props.currentTheme.chart.lineColor,
                lineWidth: 1,
                rotation: 0,
                properties: {
                    originalMark: graph
                }
            };
            chartLayer.showGraphMarkToolBar(drawing);
            chartLayer.currentMarkSettingsStyle = (graph as IMarkStyle);
            return true;
        } else {
            chartLayer.setState({
                showGraphMarkToolBar: false,
                selectedTextMark: null,
                selectedTableMark: null,
                selectedGraphMark: null,
            });
            return false;
        }
    }
}