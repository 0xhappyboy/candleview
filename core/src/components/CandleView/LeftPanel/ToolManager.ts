import LeftPanel from ".";

export class ToolManager {
    constructor() { }
    public handleDrawingToolSelect = (leftPanel: LeftPanel, toolId: string) => {
        leftPanel.setState({
            isDrawingModalOpen: !leftPanel.state.isDrawingModalOpen,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            isFibonacciModalOpen: false,
            isGannModalOpen: false,
            isIrregularShapeModalOpen: false,
            isProjectInfoModalOpen: false
        });
        // mark lock
        if (leftPanel.state.isMarkLocked) {
            return;
        }
        if (toolId === 'time-event') {
            if (leftPanel.props.chartLayerRef && leftPanel.props.chartLayerRef.current) {
                if (leftPanel.props.chartLayerRef.current.setTimeEventMode) {
                    leftPanel.props.chartLayerRef.current.setTimeEventMode();
                }
            }
        } else if (toolId === 'arrow-line') {
            // arrow line
            if (leftPanel.props.chartLayerRef && leftPanel.props.chartLayerRef.current) {
                if (leftPanel.props.chartLayerRef.current.setArrowLineMarkMode) {
                    leftPanel.props.chartLayerRef.current.setArrowLineMarkMode();
                }
            }
        } else if (toolId === 'thick-arrow-line') {
            // arrow line
            if (leftPanel.props.chartLayerRef && leftPanel.props.chartLayerRef.current) {
                if (leftPanel.props.chartLayerRef.current.setThickArrowLineMode) {
                    leftPanel.props.chartLayerRef.current.setThickArrowLineMode();
                }
            }
        } else if (toolId === 'horizontal-line') {
            if (leftPanel.props.chartLayerRef?.current?.setHorizontalLineMode) {
                leftPanel.props.chartLayerRef.current.setHorizontalLineMode();
            }
        } else if (toolId === 'vertical-line') {
            if (leftPanel.props.chartLayerRef?.current?.setVerticalLineMode) {
                leftPanel.props.chartLayerRef.current.setVerticalLineMode();
            }
        } else if (toolId === 'parallel-channel') {
            if (leftPanel.props.chartLayerRef?.current?.setParallelChannelMarkMode) {
                leftPanel.props.chartLayerRef.current.setParallelChannelMarkMode();
            }
        } else if (toolId === 'linear-regression-channel') {
            if (leftPanel.props.chartLayerRef?.current?.setLinearRegressionChannelMode) {
                leftPanel.props.chartLayerRef.current.setLinearRegressionChannelMode();
            }
        } else if (toolId === 'equidistant-channel') {
            if (leftPanel.props.chartLayerRef?.current?.setEquidistantChannelMarkMode) {
                leftPanel.props.chartLayerRef.current.setEquidistantChannelMarkMode();
            }
        } else if (toolId === 'disjoint-channel') {
            if (leftPanel.props.chartLayerRef?.current?.setDisjointChannelMarkMode) {
                leftPanel.props.chartLayerRef.current.setDisjointChannelMarkMode();
            }
        } else if (toolId === 'pitch-fork') {
            if (leftPanel.props.chartLayerRef?.current?.setPitchforkMode) {
                leftPanel.props.chartLayerRef.current.setPitchforkMode();
            }
        } else if (toolId === 'andrew-pitchfork') {
            if (leftPanel.props.chartLayerRef?.current?.setAndrewPitchforkMode) {
                leftPanel.props.chartLayerRef.current.setAndrewPitchforkMode();
            }
        } else if (toolId === 'enhanced-andrew-pitch-fork') {
            if (leftPanel.props.chartLayerRef?.current?.setEnhancedAndrewPitchforkMode) {
                leftPanel.props.chartLayerRef.current.setEnhancedAndrewPitchforkMode();
            }
        } else if (toolId === 'rectangle') {
            if (leftPanel.props.chartLayerRef?.current?.setRectangleMarkMode) {
                leftPanel.props.chartLayerRef.current.setRectangleMarkMode();
            }
        } else if (toolId === 'circle') {
            if (leftPanel.props.chartLayerRef?.current?.setCircleMarkMode) {
                leftPanel.props.chartLayerRef.current.setCircleMarkMode();
            }
        } else if (toolId === 'ellipse') {
            if (leftPanel.props.chartLayerRef?.current?.setEllipseMarkMode) {
                leftPanel.props.chartLayerRef.current.setEllipseMarkMode();
            }
        } else if (toolId === 'triangle') {
            if (leftPanel.props.chartLayerRef?.current?.setTriangleMarkMode) {
                leftPanel.props.chartLayerRef.current.setTriangleMarkMode();
            }
        } else if (toolId === 'gann-fan') {
            if (leftPanel.props.chartLayerRef?.current?.setGannFanMode) {
                leftPanel.props.chartLayerRef.current.setGannFanMode();
            }
        } else if (toolId === 'gann-box') {
            if (leftPanel.props.chartLayerRef?.current?.setGannBoxMode) {
                leftPanel.props.chartLayerRef.current.setGannBoxMode();
            }
        } else if (toolId === 'gann-rectang') {
            if (leftPanel.props.chartLayerRef?.current?.setGannRectangleMode) {
                leftPanel.props.chartLayerRef.current.setGannRectangleMode();
            }
        } else if (toolId === 'fibonacci-time-zoon') {
            if (leftPanel.props.chartLayerRef?.current?.setFibonacciTimeZoonMode) {
                leftPanel.props.chartLayerRef.current.setFibonacciTimeZoonMode();
            }
        } else if (toolId === 'fibonacci-retracement') {
            if (leftPanel.props.chartLayerRef?.current?.setFibonacciRetracementMode) {
                leftPanel.props.chartLayerRef.current.setFibonacciRetracementMode();
            }
        } else if (toolId === 'fibonacci-arc') {
            if (leftPanel.props.chartLayerRef?.current?.setFibonacciArcMode) {
                leftPanel.props.chartLayerRef.current.setFibonacciArcMode();
            }
        } else if (toolId === 'fibonacci-circle') {
            if (leftPanel.props.chartLayerRef?.current?.setFibonacciCircleMode) {
                leftPanel.props.chartLayerRef.current.setFibonacciCircleMode();
            }
        } else if (toolId === 'fibonacci-spiral') {
            if (leftPanel.props.chartLayerRef?.current?.setFibonacciSpiralMode) {
                leftPanel.props.chartLayerRef.current.setFibonacciSpiralMode();
            }
        } else if (toolId === 'fibonacci-wedge') {
            if (leftPanel.props.chartLayerRef?.current?.setFibonacciWedgeMode) {
                leftPanel.props.chartLayerRef.current.setFibonacciWedgeMode();
            }
        } else if (toolId === 'fibonacci-fan') {
            if (leftPanel.props.chartLayerRef?.current?.setFibonacciFanMode) {
                leftPanel.props.chartLayerRef.current.setFibonacciFanMode();
            }
        } else if (toolId === 'fibonacci-channel') {
            if (leftPanel.props.chartLayerRef?.current?.setFibonacciChannelMode) {
                leftPanel.props.chartLayerRef.current.setFibonacciChannelMode();
            }
        } else if (toolId === 'fibonacci-extension-base-price') {
            if (leftPanel.props.chartLayerRef?.current?.setFibonacciExtensionBasePriceMode) {
                leftPanel.props.chartLayerRef.current.setFibonacciExtensionBasePriceMode();
            }
        } else if (toolId === 'fibonacci-extension-base-time') {
            if (leftPanel.props.chartLayerRef?.current?.setFibonacciExtensionBaseTimeMode) {
                leftPanel.props.chartLayerRef.current.setFibonacciExtensionBaseTimeMode();
            }
        } else if (toolId === 'sector') {
            if (leftPanel.props.chartLayerRef?.current?.setSectorMode) {
                leftPanel.props.chartLayerRef.current.setSectorMode();
            }
        } else if (toolId === 'curve') {
            if (leftPanel.props.chartLayerRef?.current?.setCurveMode) {
                leftPanel.props.chartLayerRef.current.setCurveMode();
            }
        } else if (toolId === 'double-curve') {
            if (leftPanel.props.chartLayerRef?.current?.setDoubleCurveMode) {
                leftPanel.props.chartLayerRef.current.setDoubleCurveMode();
            }
        } else if (toolId === 'xabcd') {
            if (leftPanel.props.chartLayerRef?.current?.setXABCDMode) {
                leftPanel.props.chartLayerRef.current.setXABCDMode();
            }
        } else if (toolId === 'head-and-shoulders') {
            if (leftPanel.props.chartLayerRef?.current?.setHeadAndShouldersMode) {
                leftPanel.props.chartLayerRef.current.setHeadAndShouldersMode();
            }
        } else if (toolId === 'abcd') {
            if (leftPanel.props.chartLayerRef?.current?.setABCDMode) {
                leftPanel.props.chartLayerRef.current.setABCDMode();
            }
        } else if (toolId === 'triangle-abcd') {
            if (leftPanel.props.chartLayerRef?.current?.setTriangleABCDMode) {
                leftPanel.props.chartLayerRef.current.setTriangleABCDMode();
            }
        } else if (toolId === 'elliott-lmpulse') {
            if (leftPanel.props.chartLayerRef?.current?.setElliottImpulseMode) {
                leftPanel.props.chartLayerRef.current.setElliottImpulseMode();
            }
        } else if (toolId === 'elliott-corrective') {
            if (leftPanel.props.chartLayerRef?.current?.setElliottCorrectiveMode) {
                leftPanel.props.chartLayerRef.current.setElliottCorrectiveMode();
            }
        } else if (toolId === 'elliott-triangle') {
            if (leftPanel.props.chartLayerRef?.current?.setElliottTriangleMode) {
                leftPanel.props.chartLayerRef.current.setElliottTriangleMode();
            }
        } else if (toolId === 'elliott-double-combo') {
            if (leftPanel.props.chartLayerRef?.current?.setElliottDoubleCombinationMode) {
                leftPanel.props.chartLayerRef.current.setElliottDoubleCombinationMode();
            }
        } else if (toolId === 'elliott-triple-combo') {
            if (leftPanel.props.chartLayerRef?.current?.setElliottTripleCombinationMode) {
                leftPanel.props.chartLayerRef.current.setElliottTripleCombinationMode();
            }
        } else if (toolId === 'time-range') {
            if (leftPanel.props.chartLayerRef?.current?.setTimeRangeMarkMode) {
                leftPanel.props.chartLayerRef.current.setTimeRangeMarkMode();
            }
        } else if (toolId === 'price-range') {
            if (leftPanel.props.chartLayerRef?.current?.setPriceRangeMarkMode) {
                leftPanel.props.chartLayerRef.current.setPriceRangeMarkMode();
            }
        } else if (toolId === 'time-price-range') {
            if (leftPanel.props.chartLayerRef?.current?.setTimePriceRangeMarkMode) {
                leftPanel.props.chartLayerRef.current.setTimePriceRangeMarkMode();
            }
        } else if (toolId === 'text') {
            if (leftPanel.props.chartLayerRef?.current?.setTextEditMarkMode) {
                leftPanel.props.chartLayerRef.current.setTextEditMarkMode();
            }
        } else if (toolId === 'pencil') {
            if (leftPanel.props.chartLayerRef?.current?.setPencilMode) {
                leftPanel.props.chartLayerRef.current.setPencilMode();
            }
        } else if (toolId === 'pen') {
            if (leftPanel.props.chartLayerRef?.current?.setPenMode) {
                leftPanel.props.chartLayerRef.current.setPenMode();
            }
        } else if (toolId === 'brush') {
            if (leftPanel.props.chartLayerRef?.current?.setBrushMode) {
                leftPanel.props.chartLayerRef.current.setBrushMode();
            }
        } else if (toolId === 'marker-pen') {
            if (leftPanel.props.chartLayerRef?.current?.setMarkerPenMode) {
                leftPanel.props.chartLayerRef.current.setMarkerPenMode();
            }
        } else if (toolId === 'eraser') {
            if (leftPanel.props.chartLayerRef?.current?.setEraserMode) {
                leftPanel.props.chartLayerRef.current.setEraserMode();
            }
        } else if (toolId === 'image') {
            if (leftPanel.props.chartLayerRef?.current?.setImageMarkMode) {
                leftPanel.props.chartLayerRef.current.setImageMarkMode();
            }
        } else if (toolId === 'table') {
            if (leftPanel.props.chartLayerRef?.current?.setTableMarkMode) {
                leftPanel.props.chartLayerRef.current.setTableMarkMode();
            }
        } else if (toolId === 'long-position') {
            if (leftPanel.props.chartLayerRef?.current?.setLongPositionMarkMode) {
                leftPanel.props.chartLayerRef.current.setLongPositionMarkMode();
            }
        } else if (toolId === 'short-position') {
            if (leftPanel.props.chartLayerRef?.current?.setShortPositionMarkMode) {
                leftPanel.props.chartLayerRef.current.setShortPositionMarkMode();
            }
        } else if (toolId === 'price-label') {
            if (leftPanel.props.chartLayerRef?.current?.setPriceLabelMode) {
                leftPanel.props.chartLayerRef.current.setPriceLabelMode();
            }
        } else if (toolId === 'flag-mark') {
            if (leftPanel.props.chartLayerRef?.current?.setFlagMarkMode) {
                leftPanel.props.chartLayerRef.current.setFlagMarkMode();
            }
        } else if (toolId === 'price-note') {
            if (leftPanel.props.chartLayerRef?.current?.setPriceNoteMarkMode) {
                leftPanel.props.chartLayerRef.current.setPriceNoteMarkMode();
            }
        } else if (toolId === 'signpost') {
            if (leftPanel.props.chartLayerRef?.current?.setSignpostMarkMode) {
                leftPanel.props.chartLayerRef.current.setSignpostMarkMode();
            }
        } else if (toolId === 'pin') {
            if (leftPanel.props.chartLayerRef?.current?.setPinMarkMode) {
                leftPanel.props.chartLayerRef.current.setPinMarkMode();
            }
        } else if (toolId === 'bubble-box') {
            if (leftPanel.props.chartLayerRef?.current?.setBubbleBoxMarkMode) {
                leftPanel.props.chartLayerRef.current.setBubbleBoxMarkMode();
            }
        } else if (toolId === 'emoji') {
            if (leftPanel.props.chartLayerRef?.current?.selectedEmoji) {
                leftPanel.props.chartLayerRef.current.selectedEmoji();
            }
        } else if (toolId === 'mock-kline') {
            if (leftPanel.props.chartLayerRef?.current?.setMockKLineMarkMode) {
                leftPanel.props.chartLayerRef.current.setMockKLineMarkMode();
            }
        } else if (toolId === 'heat-map') {
            if (leftPanel.props.chartLayerRef?.current?.setHeatMapMode) {
                leftPanel.props.chartLayerRef.current.setHeatMapMode();
            }
        } else if (toolId === 'schiff-pitch-fork') {
            if (leftPanel.props.chartLayerRef?.current?.setSchiffPitchforkMode) {
                leftPanel.props.chartLayerRef.current.setSchiffPitchforkMode();
            }
        }
        leftPanel.props.onToolSelect(toolId);
        leftPanel.setState({ isDrawingModalOpen: false });
    };
}