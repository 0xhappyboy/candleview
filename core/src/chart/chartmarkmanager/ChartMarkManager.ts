import { IGraph } from '../../Mark/IGraph';
import { DrawingType } from '../../types';
import { Chart } from '../Chart';

import {
    LineMarkersManager,
    ChannelMarkersManager,
    ForkMarkersManager,
    ShapeMarkersManager,
    GannMarkersManager,
    FibonacciMarkersManager,
    PatternMarkersManager,
    ElliottMarkersManager,
    RangeMarkersManager,
    PenMarkersManager,
    TextMarkersManager,
    ContentMarkersManager,
    ScriptMarkersManager,
    SpecialMarkersManager,
} from './managers';

import { MarkManagerContext } from './types';

export class ChartMarkManager {
    public lineMarkers: LineMarkersManager = new LineMarkersManager();
    public channelMarkers: ChannelMarkersManager = new ChannelMarkersManager();
    public forkMarkers: ForkMarkersManager = new ForkMarkersManager();
    public shapeMarkers: ShapeMarkersManager = new ShapeMarkersManager();
    public gannMarkers: GannMarkersManager = new GannMarkersManager();
    public fibonacciMarkers: FibonacciMarkersManager = new FibonacciMarkersManager();
    public patternMarkers: PatternMarkersManager = new PatternMarkersManager();
    public elliottMarkers: ElliottMarkersManager = new ElliottMarkersManager();
    public rangeMarkers: RangeMarkersManager = new RangeMarkersManager();
    public penMarkers: PenMarkersManager = new PenMarkersManager();
    public textMarkers: TextMarkersManager = new TextMarkersManager();
    public contentMarkers: ContentMarkersManager = new ContentMarkersManager();
    public scriptMarkers: ScriptMarkersManager = new ScriptMarkersManager();
    public specialMarkers: SpecialMarkersManager = new SpecialMarkersManager();
    get lineSegmentMarkManager() { return this.lineMarkers.lineSegmentMarkManager; }
    get axisLineMarkManager() { return this.lineMarkers.axisLineMarkManager; }
    get arrowLineMarkManager() { return this.lineMarkers.arrowLineMarkManager; }
    get thickArrowLineMarkManager() { return this.lineMarkers.thickArrowLineMarkManager; }
    get parallelChannelMarkManager() { return this.channelMarkers.parallelChannelMarkManager; }
    get linearRegressionChannelMarkManager() { return this.channelMarkers.linearRegressionChannelMarkManager; }
    get equidistantChannelMarkManager() { return this.channelMarkers.equidistantChannelMarkManager; }
    get disjointChannelMarkManager() { return this.channelMarkers.disjointChannelMarkManager; }
    get andrewPitchforkMarkManager() { return this.forkMarkers.andrewPitchforkMarkManager; }
    get enhancedAndrewPitchforkMarkManager() { return this.forkMarkers.enhancedAndrewPitchforkMarkManager; }
    get schiffPitchforkMarkManager() { return this.forkMarkers.schiffPitchforkMarkManager; }
    get rectangleMarkManager() { return this.shapeMarkers.rectangleMarkManager; }
    get circleMarkManager() { return this.shapeMarkers.circleMarkManager; }
    get ellipseMarkManager() { return this.shapeMarkers.ellipseMarkManager; }
    get triangleMarkManager() { return this.shapeMarkers.triangleMarkManager; }
    get sectorMarkManager() { return this.shapeMarkers.sectorMarkManager; }
    get curveMarkManager() { return this.shapeMarkers.curveMarkManager; }
    get doubleCurveMarkManager() { return this.shapeMarkers.doubleCurveMarkManager; }
    get gannFanMarkManager() { return this.gannMarkers.gannFanMarkManager; }
    get gannBoxMarkManager() { return this.gannMarkers.gannBoxMarkManager; }
    get gannRectangleMarkManager() { return this.gannMarkers.gannRectangleMarkManager; }
    get fibonacciTimeZoonMarkManager() { return this.fibonacciMarkers.fibonacciTimeZoonMarkManager; }
    get fibonacciRetracementMarkManager() { return this.fibonacciMarkers.fibonacciRetracementMarkManager; }
    get fibonacciArcMarkManager() { return this.fibonacciMarkers.fibonacciArcMarkManager; }
    get fibonacciCircleMarkManager() { return this.fibonacciMarkers.fibonacciCircleMarkManager; }
    get fibonacciSpiralMarkManager() { return this.fibonacciMarkers.fibonacciSpiralMarkManager; }
    get fibonacciWedgeMarkManager() { return this.fibonacciMarkers.fibonacciWedgeMarkManager; }
    get fibonacciFanMarkManager() { return this.fibonacciMarkers.fibonacciFanMarkManager; }
    get fibonacciChannelMarkManager() { return this.fibonacciMarkers.fibonacciChannelMarkManager; }
    get fibonacciExtensionBasePriceMarkManager() { return this.fibonacciMarkers.fibonacciExtensionBasePriceMarkManager; }
    get fibonacciExtensionBaseTimeMarkManager() { return this.fibonacciMarkers.fibonacciExtensionBaseTimeMarkManager; }
    get xabcdMarkManager() { return this.patternMarkers.xabcdMarkManager; }
    get headAndShouldersMarkManager() { return this.patternMarkers.headAndShouldersMarkManager; }
    get abcdMarkManager() { return this.patternMarkers.abcdMarkManager; }
    get triangleABCDMarkManager() { return this.patternMarkers.triangleABCDMarkManager; }
    get elliottImpulseMarkManager() { return this.elliottMarkers.elliottImpulseMarkManager; }
    get elliottCorrectiveMarkManager() { return this.elliottMarkers.elliottCorrectiveMarkManager; }
    get elliottTriangleMarkManager() { return this.elliottMarkers.elliottTriangleMarkManager; }
    get elliottDoubleCombinationMarkManager() { return this.elliottMarkers.elliottDoubleCombinationMarkManager; }
    get elliottTripleCombinationMarkManager() { return this.elliottMarkers.elliottTripleCombinationMarkManager; }
    get timeRangeMarkManager() { return this.rangeMarkers.timeRangeMarkManager; }
    get priceRangeMarkManager() { return this.rangeMarkers.priceRangeMarkManager; }
    get timePriceRangeMarkManager() { return this.rangeMarkers.timePriceRangeMarkManager; }
    get longPositionMarkManager() { return this.rangeMarkers.longPositionMarkManager; }
    get shortPositionMarkManager() { return this.rangeMarkers.shortPositionMarkManager; }
    get pencilMarkManager() { return this.penMarkers.pencilMarkManager; }
    get penMarkManager() { return this.penMarkers.penMarkManager; }
    get brushMarkManager() { return this.penMarkers.brushMarkManager; }
    get markerPenMarkManager() { return this.penMarkers.markerPenMarkManager; }
    get eraserMarkManager() { return this.penMarkers.eraserMarkManager; }
    get priceLabelMarkManager() { return this.textMarkers.priceLabelMarkManager; }
    get flagMarkManager() { return this.textMarkers.flagMarkManager; }
    get priceNoteMarkManager() { return this.textMarkers.priceNoteMarkManager; }
    get signpostMarkManager() { return this.textMarkers.signpostMarkManager; }
    get emojiMarkManager() { return this.textMarkers.emojiMarkManager; }
    get pinMarkManager() { return this.textMarkers.pinMarkManager; }
    get bubbleBoxMarkManager() { return this.textMarkers.bubbleBoxMarkManager; }
    get textEditMarkManager() { return this.textMarkers.textEditMarkManager; }
    get imageMarkManager() { return this.contentMarkers.imageMarkManager; }
    get timeEventMarkManager() { return this.scriptMarkers.timeEventMarkManager; }
    get priceEventMarkManager() { return this.scriptMarkers.priceEventMarkManager; }
    get mockKLineMarkManager() { return this.specialMarkers.mockKLineMarkManager; }
    get heatMapMarkManager() { return this.specialMarkers.heatMapMarkManager; }

    constructor() { }

    public initializeMarkManager(chart: Chart): void {
        const context: MarkManagerContext = { chart };
        this.lineMarkers.initialize(context);
        this.channelMarkers.initialize(context);
        this.forkMarkers.initialize(context);
        this.shapeMarkers.initialize(context);
        this.gannMarkers.initialize(context);
        this.fibonacciMarkers.initialize(context);
        this.patternMarkers.initialize(context);
        this.elliottMarkers.initialize(context);
        this.rangeMarkers.initialize(context);
        this.penMarkers.initialize(context);
        this.textMarkers.initialize(context);
        this.contentMarkers.initialize(context);
        this.scriptMarkers.initialize(context);
        this.specialMarkers.initialize(context);
    }

    public initializeMarkManagerProps(chart: Chart): void {
        const context: MarkManagerContext = { chart };
        this.lineMarkers.updateProps(context);
        this.channelMarkers.updateProps(context);
        this.forkMarkers.updateProps(context);
        this.shapeMarkers.updateProps(context);
        this.gannMarkers.updateProps(context);
        this.fibonacciMarkers.updateProps(context);
        this.patternMarkers.updateProps(context);
        this.elliottMarkers.updateProps(context);
        this.rangeMarkers.updateProps(context);
        this.penMarkers.updateProps(context);
        this.textMarkers.updateProps(context);
        this.contentMarkers.updateProps(context);
        this.scriptMarkers.updateProps(context);
        this.specialMarkers.updateProps(context);
    }

    public destroyMarkManager(): void {
        this.lineMarkers.destroy();
        this.channelMarkers.destroy();
        this.forkMarkers.destroy();
        this.shapeMarkers.destroy();
        this.gannMarkers.destroy();
        this.fibonacciMarkers.destroy();
        this.patternMarkers.destroy();
        this.elliottMarkers.destroy();
        this.rangeMarkers.destroy();
        this.penMarkers.destroy();
        this.textMarkers.destroy();
        this.contentMarkers.destroy();
        this.scriptMarkers.destroy();
        this.specialMarkers.destroy();
    }

    public clearAllMarkManagerState(): void {
        this.lineMarkers.clearState();
        this.channelMarkers.clearState();
        this.forkMarkers.clearState();
        this.shapeMarkers.clearState();
        this.gannMarkers.clearState();
        this.fibonacciMarkers.clearState();
        this.patternMarkers.clearState();
        this.elliottMarkers.clearState();
        this.rangeMarkers.clearState();
        this.penMarkers.clearState();
        this.textMarkers.clearState();
        this.contentMarkers.clearState();
        this.scriptMarkers.clearState();
        this.specialMarkers.clearState();
    }

    public registerAllDeletableMarks(): void {
        this.penMarkers.registerAllDeletableMarks();
    }

    public initializeEraserMarkManager(chart: Chart): void {
        this.penMarkers.initialize({ chart });
    }

    public closeAllBrushTools(chart: Chart): void {
        this.penMarkers.closeAllBrushTools(chart);
    }

    public getDrawingStepFromPhase(phase: 'firstPoint' | 'secondPoint' | 'widthAdjust' | 'none'): number {
        switch (phase) {
            case 'firstPoint': return 1;
            case 'secondPoint': return 2;
            case 'widthAdjust': return 3;
            case 'none': return 0;
            default: return 0;
        }
    }

    public deleteMark(drawingType: DrawingType, iGraph: IGraph): void {
        this.lineMarkers.deleteMark?.(drawingType, iGraph);
        this.channelMarkers.deleteMark?.(drawingType, iGraph);
        this.forkMarkers.deleteMark?.(drawingType, iGraph);
        this.shapeMarkers.deleteMark?.(drawingType, iGraph);
        this.gannMarkers.deleteMark?.(drawingType, iGraph);
        this.fibonacciMarkers.deleteMark?.(drawingType, iGraph);
        this.patternMarkers.deleteMark?.(drawingType, iGraph);
        this.elliottMarkers.deleteMark?.(drawingType, iGraph);
        this.rangeMarkers.deleteMark?.(drawingType, iGraph);
        this.penMarkers.deleteMark?.(drawingType, iGraph);
        this.textMarkers.deleteMark?.(drawingType, iGraph);
        this.contentMarkers.deleteMark?.(drawingType, iGraph);
        this.scriptMarkers.deleteMark?.(drawingType, iGraph);
        this.specialMarkers.deleteMark?.(drawingType, iGraph);
    }

    public deleteAllMark(): void {
        this.lineMarkers.deleteAllMarks?.();
        this.channelMarkers.deleteAllMarks?.();
        this.forkMarkers.deleteAllMarks?.();
        this.shapeMarkers.deleteAllMarks?.();
        this.gannMarkers.deleteAllMarks?.();
        this.fibonacciMarkers.deleteAllMarks?.();
        this.patternMarkers.deleteAllMarks?.();
        this.elliottMarkers.deleteAllMarks?.();
        this.rangeMarkers.deleteAllMarks?.();
        this.penMarkers.deleteAllMarks?.();
        this.textMarkers.deleteAllMarks?.();
        this.contentMarkers.deleteAllMarks?.();
        this.scriptMarkers.deleteAllMarks?.();
        this.specialMarkers.deleteAllMarks?.();
    }

    public showAllMarks(): void {
        this.lineMarkers.showAllMarks?.();
        this.channelMarkers.showAllMarks?.();
        this.forkMarkers.showAllMarks?.();
        this.shapeMarkers.showAllMarks?.();
        this.gannMarkers.showAllMarks?.();
        this.fibonacciMarkers.showAllMarks?.();
        this.patternMarkers.showAllMarks?.();
        this.elliottMarkers.showAllMarks?.();
        this.rangeMarkers.showAllMarks?.();
        this.penMarkers.showAllMarks?.();
        this.textMarkers.showAllMarks?.();
        this.contentMarkers.showAllMarks?.();
        this.scriptMarkers.showAllMarks?.();
        this.specialMarkers.showAllMarks?.();
    }

    public hideAllMarks(): void {
        this.lineMarkers.hideAllMarks?.();
        this.channelMarkers.hideAllMarks?.();
        this.forkMarkers.hideAllMarks?.();
        this.shapeMarkers.hideAllMarks?.();
        this.gannMarkers.hideAllMarks?.();
        this.fibonacciMarkers.hideAllMarks?.();
        this.patternMarkers.hideAllMarks?.();
        this.elliottMarkers.hideAllMarks?.();
        this.rangeMarkers.hideAllMarks?.();
        this.penMarkers.hideAllMarks?.();
        this.textMarkers.hideAllMarks?.();
        this.contentMarkers.hideAllMarks?.();
        this.scriptMarkers.hideAllMarks?.();
        this.specialMarkers.hideAllMarks?.();
    }

    public setLineSegmentMarkMode(chart: Chart): void {
        const newState = this.lineMarkers.setLineSegmentMarkMode(chart);
        chart.drawingManager?.updateState({ lineSegmentMarkStartPoint: newState?.lineSegmentMarkStartPoint, currentLineSegmentMark: newState?.currentLineSegmentMark });
    }

    public setArrowLineMarkMode(chart: Chart): void {
        const newState = this.lineMarkers.setArrowLineMarkMode(chart);
        chart.drawingManager?.updateState({ arrowLineMarkStartPoint: newState?.arrowLineMarkStartPoint, currentArrowLineMark: newState?.currentArrowLineMark });
    }

    public setThickArrowLineMode(chart: Chart): void {
        const newState = this.lineMarkers.setThickArrowLineMode(chart);
        chart.drawingManager?.updateState({ thickArrowLineMarkStartPoint: newState?.thickArrowLineMarkStartPoint, currentThickArrowLineMark: newState?.currentThickArrowLineMark });
    }

    public setHorizontalLineMode(chart: Chart): void {
        this.lineMarkers.setHorizontalLineMode(chart);
    }

    public setVerticalLineMode(chart: Chart): void {
        this.lineMarkers.setVerticalLineMode(chart);
    }

    public setParallelChannelMarkMode(chart: Chart): void {
        const newState = this.channelMarkers.setParallelChannelMarkMode(chart);
        chart.drawingManager?.updateState({ parallelChannelMarkStartPoint: newState?.parallelChannelMarkStartPoint, currentParallelChannelMark: newState?.currentParallelChannelMark });
    }

    public setLinearRegressionChannelMode(chart: Chart): void {
        const newState = this.channelMarkers.setLinearRegressionChannelMode(chart);
        chart.drawingManager?.updateState({ linearRegressionChannelStartPoint: newState?.linearRegressionChannelStartPoint, currentLinearRegressionChannel: newState?.currentLinearRegressionChannel });
    }

    public setEquidistantChannelMarkMode(chart: Chart): void {
        const newState = this.channelMarkers.setEquidistantChannelMarkMode(chart);
        chart.drawingManager?.updateState({ equidistantChannelMarkStartPoint: newState?.equidistantChannelMarkStartPoint, currentEquidistantChannelMark: newState?.currentEquidistantChannelMark });
    }

    public setDisjointChannelMarkMode(chart: Chart): void {
        const newState = this.channelMarkers.setDisjointChannelMarkMode(chart);
        chart.drawingManager?.updateState({ disjointChannelMarkStartPoint: newState?.disjointChannelMarkStartPoint, currentDisjointChannelMark: newState?.currentDisjointChannelMark });
    }

    public setAndrewPitchforkMode(chart: Chart): void {
        const newState = this.forkMarkers.setAndrewPitchforkMode(chart);
        chart.drawingManager?.updateState({ andrewPitchforkHandlePoint: newState?.andrewPitchforkHandlePoint, andrewPitchforkBaseStartPoint: newState?.andrewPitchforkBaseStartPoint, currentAndrewPitchfork: newState?.currentAndrewPitchfork });
    }

    public setEnhancedAndrewPitchforkMode(chart: Chart): void {
        const newState = this.forkMarkers.setEnhancedAndrewPitchforkMode(chart);
        chart.drawingManager?.updateState({ enhancedAndrewPitchforkHandlePoint: newState?.enhancedAndrewPitchforkHandlePoint, enhancedAndrewPitchforkBaseStartPoint: newState?.enhancedAndrewPitchforkBaseStartPoint, currentEnhancedAndrewPitchfork: newState?.currentEnhancedAndrewPitchfork });
    }

    public setSchiffPitchforkMode(chart: Chart): void {
        const newState = this.forkMarkers.setSchiffPitchforkMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setRectangleMarkMode(chart: Chart): void {
        const newState = this.shapeMarkers.setRectangleMarkMode(chart);
        chart.drawingManager?.updateState({ rectangleMarkStartPoint: newState?.rectangleMarkStartPoint, currentRectangleMark: newState?.currentRectangleMark });
    }

    public setCircleMarkMode(chart: Chart): void {
        const newState = this.shapeMarkers.setCircleMarkMode(chart);
        chart.drawingManager?.updateState({ circleMarkStartPoint: newState?.circleMarkStartPoint, currentCircleMark: newState?.currentCircleMark });
    }

    public setEllipseMarkMode(chart: Chart): void {
        const newState = this.shapeMarkers.setEllipseMarkMode(chart);
        chart.drawingManager?.updateState({ ellipseMarkStartPoint: newState?.ellipseMarkStartPoint, currentEllipseMark: newState?.currentEllipseMark });
    }

    public setTriangleMarkMode(chart: Chart): void {
        const newState = this.shapeMarkers.setTriangleMarkMode(chart);
        chart.drawingManager?.updateState({ triangleMarkStartPoint: newState?.triangleMarkStartPoint, currentTriangleMark: newState?.currentTriangleMark });
    }

    public setSectorMode(chart: Chart): void {
        const newState = this.shapeMarkers.setSectorMode(chart);
        chart.drawingManager?.updateState({ sectorPoints: newState?.sectorPoints, currentSector: newState?.currentSector });
    }

    public setCurveMode(chart: Chart): void {
        const newState = this.shapeMarkers.setCurveMode(chart);
        chart.drawingManager?.updateState({ curveMarkStartPoint: newState?.curveMarkStartPoint, currentCurveMark: newState?.currentCurveMark });
    }

    public setDoubleCurveMode(chart: Chart): void {
        const newState = this.shapeMarkers.setDoubleCurveMode(chart);
        chart.drawingManager?.updateState({ doubleCurveMarkStartPoint: newState?.doubleCurveMarkStartPoint, currentDoubleCurveMark: newState?.currentDoubleCurveMark });
    }

    public setGannFanMode(chart: Chart): void {
        const newState = this.gannMarkers.setGannFanMode(chart);
        chart.drawingManager?.updateState({ gannFanStartPoint: newState?.gannFanStartPoint, currentGannFan: newState?.currentGannFan });
    }

    public setGannBoxMode(chart: Chart): void {
        const newState = this.gannMarkers.setGannBoxMode(chart);
        chart.drawingManager?.updateState({ gannBoxStartPoint: newState?.gannBoxStartPoint, currentGannBox: newState?.currentGannBox });
    }

    public setGannRectangleMode(chart: Chart): void {
        const newState = this.gannMarkers.setGannRectangleMode(chart);
        chart.drawingManager?.updateState({ gannRectangleStartPoint: newState?.gannRectangleStartPoint, currentGannRectangle: newState?.currentGannRectangle });
    }

    public setFibonacciTimeZoonMode(chart: Chart): void {
        const newState = this.fibonacciMarkers.setFibonacciTimeZoonMode(chart);
        chart.drawingManager?.updateState({ fibonacciTimeZoonStartPoint: newState?.fibonacciTimeZoonStartPoint, currentFibonacciTimeZoon: newState?.currentFibonacciTimeZoon });
    }

    public setFibonacciRetracementMode(chart: Chart): void {
        const newState = this.fibonacciMarkers.setFibonacciRetracementMode(chart);
        chart.drawingManager?.updateState({ fibonacciRetracementStartPoint: newState?.fibonacciRetracementStartPoint, currentFibonacciRetracement: newState?.currentFibonacciRetracement });
    }

    public setFibonacciArcMode(chart: Chart): void {
        const newState = this.fibonacciMarkers.setFibonacciArcMode(chart);
        chart.drawingManager?.updateState({ fibonacciArcStartPoint: newState?.fibonacciArcStartPoint, currentFibonacciArc: newState?.currentFibonacciArc });
    }

    public setFibonacciCircleMode(chart: Chart): void {
        const newState = this.fibonacciMarkers.setFibonacciCircleMode(chart);
        chart.drawingManager?.updateState({ fibonacciCircleCenterPoint: newState?.fibonacciCircleCenterPoint, currentFibonacciCircle: newState?.currentFibonacciCircle });
    }

    public setFibonacciSpiralMode(chart: Chart): void {
        const newState = this.fibonacciMarkers.setFibonacciSpiralMode(chart);
        chart.drawingManager?.updateState({ fibonacciSpiralCenterPoint: newState?.fibonacciSpiralCenterPoint, currentFibonacciSpiral: newState?.currentFibonacciSpiral });
    }

    public setFibonacciWedgeMode(chart: Chart): void {
        const newState = this.fibonacciMarkers.setFibonacciWedgeMode(chart);
        chart.drawingManager?.updateState({ fibonacciWedgePoints: newState?.fibonacciWedgePoints, currentFibonacciWedge: newState?.currentFibonacciWedge, fibonacciWedgeDrawingStep: 0 });
    }

    public setFibonacciFanMode(chart: Chart): void {
        const newState = this.fibonacciMarkers.setFibonacciFanMode(chart);
        chart.drawingManager?.updateState({ fibonacciFanStartPoint: newState?.fibonacciFanStartPoint, currentFibonacciFan: newState?.currentFibonacciFan });
    }

    public setFibonacciChannelMode(chart: Chart): void {
        const newState = this.fibonacciMarkers.setFibonacciChannelMode(chart);
        chart.drawingManager?.updateState({ currentFibonacciChannel: newState?.currentFibonacciChannel, isFibonacciChannelMode: newState?.isFibonacciChannelMode, fibonacciChannelDrawingStep: this.getDrawingStepFromPhase(newState?.drawingPhase) });
    }

    public setFibonacciExtensionBasePriceMode(chart: Chart): void {
        const newState = this.fibonacciMarkers.setFibonacciExtensionBasePriceMode(chart);
        chart.drawingManager?.updateState({ fibonacciExtensionBasePricePoints: newState?.fibonacciExtensionBasePricePoints, currentFibonacciExtensionBasePrice: newState?.currentFibonacciExtensionBasePrice });
    }

    public setFibonacciExtensionBaseTimeMode(chart: Chart): void {
        const newState = this.fibonacciMarkers.setFibonacciExtensionBaseTimeMode(chart);
        chart.drawingManager?.updateState({ fibonacciExtensionBaseTimePoints: newState?.fibonacciExtensionBaseTimePoints, currentFibonacciExtensionBaseTime: newState?.currentFibonacciExtensionBaseTime });
    }

    public setXABCDMode(chart: Chart): void {
        const newState = this.patternMarkers.setXABCDMode(chart);
        chart.drawingManager?.updateState({ xabcdPoints: newState?.xabcdPoints, currentXABCDMark: newState?.currentXABCDMark });
    }

    public setHeadAndShouldersMode(chart: Chart): void {
        const newState = this.patternMarkers.setHeadAndShouldersMode(chart);
        chart.drawingManager?.updateState({ headAndShouldersPoints: newState?.headAndShouldersPoints, currentHeadAndShouldersMark: newState?.currentHeadAndShouldersMark });
    }

    public setABCDMode(chart: Chart): void {
        const newState = this.patternMarkers.setABCDMode(chart);
        chart.drawingManager?.updateState({ abcdPoints: newState?.abcdPoints, currentABCDMark: newState?.currentABCDMark });
    }

    public setTriangleABCDMode(chart: Chart): void {
        const newState = this.patternMarkers.setTriangleABCDMode(chart);
        chart.drawingManager?.updateState({ triangleABCDPoints: newState?.triangleABCDPoints, currentTriangleABCDMark: newState?.currentTriangleABCDMark });
    }

    public setElliottImpulseMode(chart: Chart): void {
        const newState = this.elliottMarkers.setElliottImpulseMode(chart);
        chart.drawingManager?.updateState({ elliottImpulsePoints: newState?.elliottImpulsePoints, currentElliottImpulseMark: newState?.currentElliottImpulseMark });
    }

    public setElliottCorrectiveMode(chart: Chart): void {
        const newState = this.elliottMarkers.setElliottCorrectiveMode(chart);
        chart.drawingManager?.updateState({ elliottCorrectivePoints: newState?.elliottCorrectivePoints, currentElliottCorrectiveMark: newState?.currentElliottCorrectiveMark });
    }

    public setElliottTriangleMode(chart: Chart): void {
        const newState = this.elliottMarkers.setElliottTriangleMode(chart);
        chart.drawingManager?.updateState({ elliottTrianglePoints: newState?.elliottTrianglePoints, currentElliottTriangleMark: newState?.currentElliottTriangleMark });
    }

    public setElliottDoubleCombinationMode(chart: Chart): void {
        const newState = this.elliottMarkers.setElliottDoubleCombinationMode(chart);
        chart.drawingManager?.updateState({ elliottDoubleCombinationPoints: newState?.elliottDoubleCombinationPoints, currentElliottDoubleCombinationMark: newState?.currentElliottDoubleCombinationMark });
    }

    public setElliottTripleCombinationMode(chart: Chart): void {
        const newState = this.elliottMarkers.setElliottTripleCombinationMode(chart);
        chart.drawingManager?.updateState({ elliottTripleCombinationPoints: newState?.elliottTripleCombinationPoints, currentElliottTripleCombinationMark: newState?.currentElliottTripleCombinationMark });
    }

    public setTimeRangeMarkMode(chart: Chart): void {
        const newState = this.rangeMarkers.setTimeRangeMarkMode(chart);
        chart.drawingManager?.updateState({ timeRangeMarkStartPoint: newState?.timeRangeMarkStartPoint, currentTimeRangeMark: newState?.currentTimeRangeMark, isTimeRangeMarkMode: newState?.isTimeRangeMarkMode });
    }

    public setPriceRangeMarkMode(chart: Chart): void {
        const newState = this.rangeMarkers.setPriceRangeMarkMode(chart);
        chart.drawingManager?.updateState({ priceRangeMarkStartPoint: newState?.priceRangeMarkStartPoint, currentPriceRangeMark: newState?.currentPriceRangeMark, isPriceRangeMarkMode: newState?.isPriceRangeMarkMode });
    }

    public setTimePriceRangeMarkMode(chart: Chart): void {
        const newState = this.rangeMarkers.setTimePriceRangeMarkMode(chart);
        chart.drawingManager?.updateState({ timePriceRangeMarkStartPoint: newState?.timePriceRangeMarkStartPoint, currentTimePriceRangeMark: newState?.currentTimePriceRangeMark, isTimePriceRangeMarkMode: newState?.isTimePriceRangeMarkMode });
    }

    public setLongPositionMarkMode(chart: Chart): void {
        const newState = this.rangeMarkers.setLongPositionMarkMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setShortPositionMarkMode(chart: Chart): void {
        const newState = this.rangeMarkers.setShortPositionMarkMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setMockKLineMarkMode(chart: Chart): void {
        const newState = this.specialMarkers.setMockKLineMarkMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setTextEditMarkMode(chart: Chart): void {
        const newState = this.textMarkers.setTextEditMarkMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setBubbleBoxMarkMode(chart: Chart): void {
        const newState = this.textMarkers.setBubbleBoxMarkMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setPinMarkMode(chart: Chart): void {
        const newState = this.textMarkers.setPinMarkMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setEmojiMarkMode(chart: Chart, emoji: string): void {
        const newState = this.textMarkers.setEmojiMarkMode(chart, emoji);
        chart.drawingManager?.updateState(newState);
    }

    public setSignpostMarkMode(chart: Chart): void {
        const newState = this.textMarkers.setSignpostMarkMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setPriceNoteMarkMode(chart: Chart): void {
        const newState = this.textMarkers.setPriceNoteMarkMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setFlagMarkMode(chart: Chart): void {
        const newState = this.textMarkers.setFlagMarkMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setPriceLabelMode(chart: Chart): void {
        const newState = this.textMarkers.setPriceLabelMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setImageMarkMode(chart: Chart): void {
        this.contentMarkers.setImageMarkMode(chart);
    }

    public setHeatMapMode(chart: Chart): void {
        const newState = this.specialMarkers.setHeatMapMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setPriceEventMode(chart: Chart): void {
        const newState = this.scriptMarkers.setPriceEventMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setTimeEventMode(chart: Chart): void {
        const newState = this.scriptMarkers.setTimeEventMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setPencilMode(chart: Chart): void {
        const newState = this.penMarkers.setPencilMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setPenMode(chart: Chart): void {
        const newState = this.penMarkers.setPenMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setBrushMode(chart: Chart): void {
        const newState = this.penMarkers.setBrushMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setMarkerPenMode(chart: Chart): void {
        const newState = this.penMarkers.setMarkerPenMode(chart);
        chart.drawingManager?.updateState(newState);
    }

    public setEraserMode(chart: Chart): void {
        const newState = this.penMarkers.setEraserMode(chart);
        chart.drawingManager?.updateState(newState);
    }

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
            // bubbleBoxMarkPoints: null,
            currentBubbleBoxMark: null,
            isBubbleBoxDragging: false,
            bubbleBoxDragTarget: null,
            // bubbleBoxDragType: null,
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

}