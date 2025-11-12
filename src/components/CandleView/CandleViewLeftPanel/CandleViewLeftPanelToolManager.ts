import CandleViewLeftPanel from ".";

export class CandleViewLeftPanelToolManager {
    constructor() { }
    public handleDrawingToolSelect = (candleViewLeftPanel: CandleViewLeftPanel, toolId: string) => {
        candleViewLeftPanel.setState({
            isDrawingModalOpen: !candleViewLeftPanel.state.isDrawingModalOpen,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            isFibonacciModalOpen: false,
            isGannModalOpen: false,
            isIrregularShapeModalOpen: false,
            isProjectInfoModalOpen: false
        });
        if (toolId === 'line-segment') {
            // line segment
            if (candleViewLeftPanel.props.drawingLayerRef && candleViewLeftPanel.props.drawingLayerRef.current) {
                if (candleViewLeftPanel.props.drawingLayerRef.current.setLineSegmentMarkMode) {
                    candleViewLeftPanel.props.drawingLayerRef.current.setLineSegmentMarkMode();
                }
            }
        } else if (toolId === 'arrow-line') {
            // arrow line
            if (candleViewLeftPanel.props.drawingLayerRef && candleViewLeftPanel.props.drawingLayerRef.current) {
                if (candleViewLeftPanel.props.drawingLayerRef.current.setArrowLineMarkMode) {
                    candleViewLeftPanel.props.drawingLayerRef.current.setArrowLineMarkMode();
                }
            }
        } else if (toolId === 'thick-arrow-line') {
            // arrow line
            if (candleViewLeftPanel.props.drawingLayerRef && candleViewLeftPanel.props.drawingLayerRef.current) {
                if (candleViewLeftPanel.props.drawingLayerRef.current.setThickArrowLineMode) {
                    candleViewLeftPanel.props.drawingLayerRef.current.setThickArrowLineMode();
                }
            }
        } else if (toolId === 'horizontal-line') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setHorizontalLineMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setHorizontalLineMode();
            }
        } else if (toolId === 'vertical-line') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setVerticalLineMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setVerticalLineMode();
            }
        } else if (toolId === 'parallel-channel') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setParallelChannelMarkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setParallelChannelMarkMode();
            }
        } else if (toolId === 'linear-regression-channel') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setLinearRegressionChannelMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setLinearRegressionChannelMode();
            }
        } else if (toolId === 'equidistant-channel') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setEquidistantChannelMarkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setEquidistantChannelMarkMode();
            }
        } else if (toolId === 'disjoint-channel') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setDisjointChannelMarkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setDisjointChannelMarkMode();
            }
        } else if (toolId === 'pitch-fork') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setPitchforkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setPitchforkMode();
            }
        } else if (toolId === 'andrew-pitchfork') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setAndrewPitchforkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setAndrewPitchforkMode();
            }
        } else if (toolId === 'enhanced-andrew-pitch-fork') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setEnhancedAndrewPitchforkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setEnhancedAndrewPitchforkMode();
            }
        } else if (toolId === 'rectangle') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setRectangleMarkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setRectangleMarkMode();
            }
        } else if (toolId === 'circle') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setCircleMarkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setCircleMarkMode();
            }
        } else if (toolId === 'ellipse') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setEllipseMarkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setEllipseMarkMode();
            }
        } else if (toolId === 'triangle') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setTriangleMarkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setTriangleMarkMode();
            }
        } else if (toolId === 'gann-fan') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setGannFanMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setGannFanMode();
            }
        } else if (toolId === 'gann-box') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setGannBoxMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setGannBoxMode();
            }
        } else if (toolId === 'gann-rectang') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setGannRectangleMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setGannRectangleMode();
            }
        } else if (toolId === 'fibonacci-time-zoon') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setFibonacciTimeZoonMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setFibonacciTimeZoonMode();
            }
        } else if (toolId === 'fibonacci-retracement') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setFibonacciRetracementMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setFibonacciRetracementMode();
            }
        } else if (toolId === 'fibonacci-arc') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setFibonacciArcMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setFibonacciArcMode();
            }
        } else if (toolId === 'fibonacci-circle') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setFibonacciCircleMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setFibonacciCircleMode();
            }
        } else if (toolId === 'fibonacci-spiral') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setFibonacciSpiralMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setFibonacciSpiralMode();
            }
        } else if (toolId === 'fibonacci-wedge') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setFibonacciWedgeMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setFibonacciWedgeMode();
            }
        } else if (toolId === 'fibonacci-fan') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setFibonacciFanMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setFibonacciFanMode();
            }
        } else if (toolId === 'fibonacci-channel') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setFibonacciChannelMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setFibonacciChannelMode();
            }
        } else if (toolId === 'fibonacci-extension-base-price') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setFibonacciExtensionBasePriceMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setFibonacciExtensionBasePriceMode();
            }
        } else if (toolId === 'fibonacci-extension-base-time') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setFibonacciExtensionBaseTimeMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setFibonacciExtensionBaseTimeMode();
            }
        } else if (toolId === 'sector') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setSectorMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setSectorMode();
            }
        } else if (toolId === 'curve') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setCurveMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setCurveMode();
            }
        } else if (toolId === 'double-curve') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setDoubleCurveMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setDoubleCurveMode();
            }
        } else if (toolId === 'xabcd') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setXABCDMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setXABCDMode();
            }
        } else if (toolId === 'head-and-shoulders') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setHeadAndShouldersMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setHeadAndShouldersMode();
            }
        } else if (toolId === 'abcd') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setABCDMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setABCDMode();
            }
        } else if (toolId === 'triangle-abcd') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setTriangleABCDMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setTriangleABCDMode();
            }
        } else if (toolId === 'elliott-lmpulse') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setElliottImpulseMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setElliottImpulseMode();
            }
        } else if (toolId === 'elliott-corrective') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setElliottCorrectiveMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setElliottCorrectiveMode();
            }
        } else if (toolId === 'elliott-triangle') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setElliottTriangleMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setElliottTriangleMode();
            }
        } else if (toolId === 'elliott-double-combo') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setElliottDoubleCombinationMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setElliottDoubleCombinationMode();
            }
        } else if (toolId === 'elliott-triple-combo') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setElliottTripleCombinationMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setElliottTripleCombinationMode();
            }
        } else if (toolId === 'time-range') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setTimeRangeMarkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setTimeRangeMarkMode();
            }
        } else if (toolId === 'price-range') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setPriceRangeMarkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setPriceRangeMarkMode();
            }
        } else if (toolId === 'time-price-range') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setTimePriceRangeMarkMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setTimePriceRangeMarkMode();
            }
        } else if (toolId === 'text') {
            candleViewLeftPanel.handleTextToolSelect('text');
        } else if (toolId === 'pencil') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setPencilMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setPencilMode();
            }
        } else if (toolId === 'pen') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setPenMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setPenMode();
            }
        } else if (toolId === 'brush') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setBrushMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setBrushMode();
            }
        } else if (toolId === 'marker-pen') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setMarkerPenMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setMarkerPenMode();
            }
        } else if (toolId === 'eraser') {
            if (candleViewLeftPanel.props.drawingLayerRef?.current?.setEraserMode) {
                candleViewLeftPanel.props.drawingLayerRef.current.setEraserMode();
            }
        }
        candleViewLeftPanel.props.onToolSelect(toolId);
        candleViewLeftPanel.setState({ isDrawingModalOpen: false });
    };
}