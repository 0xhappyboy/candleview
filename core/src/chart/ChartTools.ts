import { IChartApi, Time } from 'lightweight-charts';
import { Point, CursorType, MarkDrawing, DrawingType, SubChartIndicatorType } from '../types';
import { DrawingManager, DrawingManagerState } from './DrawingManager';
import { ChartPanesManager } from './panes/ChartPanesManager';
import { IMarkStyle } from '../Mark/IMarkStyle';
import { GraphMarkToolBar } from '../components/GraphMarkToolBar';
import { TextMarkToolBar } from '../components/TextMarkToolBar';
import { LeftPanel } from '../components/leftpanel';
import { ThemeConfig } from '../theme';
import { I18n } from '../i18n';
import { Chart } from './Chart';
import { ChartMarkManager } from './chartmarkmanager/ChartMarkManager';

export class ChartTools {
    private chart: Chart;
    public drawingManager: DrawingManager | null = null;
    public chartMarkManager: ChartMarkManager | null = null;
    public chartPanesManager: ChartPanesManager | null = null;
    public currentDrawingType: DrawingType | null = null;
    public textMarkToolBar: TextMarkToolBar | null = null;
    public graphMarkToolBar: GraphMarkToolBar | null = null;
    public currentMarkSettingsStyle: IMarkStyle | null = null;
    public leftPanel: LeftPanel | null = null;
    public onCloseDrawing?: () => void;
    public onExitBrushMode?: () => void;
    public isDraggingToolbar: boolean = false;
    public toolbarDragStartPoint: Point | null = null;
    public toolbarDragStartPosition: Point | null = null;
    private movementDisableCount: number = 0;
    private originalChartOptions: { handleScroll?: any; handleScale?: any } | null = null;

    constructor(chart: Chart) {
        this.chart = chart;
    }

    public initDrawingManager(): void {
        this.chartMarkManager = new ChartMarkManager();
        this.drawingManager = new DrawingManager({ chartMarkManager: this.chartMarkManager });
        this.chartMarkManager?.initializeMarkManager(this.chart as any);
    }

    public initPanesManager(): void {
        if (this.chartPanesManager) return;
        this.chartPanesManager = new ChartPanesManager();
        this.chartPanesManager.setChartInstance(this.chart.chart);
    }

    public addSubChart(
        indicatorType: SubChartIndicatorType,
        onSettingsClick: (type: SubChartIndicatorType) => void,
        onCloseClick: (type: SubChartIndicatorType) => void
    ): void {
        this.chartPanesManager?.addSubChart(
            this.chart as any,
            indicatorType,
            onSettingsClick,
            onCloseClick
        );
    }

    public removeSubChart(indicatorType: SubChartIndicatorType): void {
        this.chartPanesManager?.removePaneBySubChartIndicatorType(indicatorType);
    }

    public getDrawingState(): DrawingManagerState | null {
        return this.drawingManager?.getState() || null;
    }

    public setCursorType(cursorType: CursorType): void {
        this.drawingManager?.setCursorType(cursorType);
    }

    public setLineSegmentMarkMode(): void { this.drawingManager?.setLineSegmentMarkMode(); }
    public setArrowLineMarkMode(): void { this.drawingManager?.setArrowLineMarkMode(); }
    public setThickArrowLineMode(): void { this.drawingManager?.setThickArrowLineMode(); }
    public setHorizontalLineMode(): void { this.drawingManager?.setHorizontalLineMode(); }
    public setVerticalLineMode(): void { this.drawingManager?.setVerticalLineMode(); }
    public setParallelChannelMarkMode(): void { this.drawingManager?.setParallelChannelMarkMode(); }
    public setLinearRegressionChannelMode(): void { this.drawingManager?.setLinearRegressionChannelMode(); }
    public setEquidistantChannelMarkMode(): void { this.drawingManager?.setEquidistantChannelMarkMode(); }
    public setDisjointChannelMarkMode(): void { this.drawingManager?.setDisjointChannelMarkMode(); }
    public setAndrewPitchforkMode(): void { this.drawingManager?.setAndrewPitchforkMode(); }
    public setEnhancedAndrewPitchforkMode(): void { this.drawingManager?.setEnhancedAndrewPitchforkMode(); }
    public setSchiffPitchforkMode(): void { this.drawingManager?.setSchiffPitchforkMode(); }
    public setRectangleMarkMode(): void { this.drawingManager?.setRectangleMarkMode(); }
    public setCircleMarkMode(): void { this.drawingManager?.setCircleMarkMode(); }
    public setEllipseMarkMode(): void { this.drawingManager?.setEllipseMarkMode(); }
    public setTriangleMarkMode(): void { this.drawingManager?.setTriangleMarkMode(); }
    public setSectorMode(): void { this.drawingManager?.setSectorMode(); }
    public setCurveMode(): void { this.drawingManager?.setCurveMode(); }
    public setDoubleCurveMode(): void { this.drawingManager?.setDoubleCurveMode(); }
    public setGannFanMode(): void { this.drawingManager?.setGannFanMode(); }
    public setGannBoxMode(): void { this.drawingManager?.setGannBoxMode(); }
    public setGannRectangleMode(): void { this.drawingManager?.setGannRectangleMode(); }
    public setFibonacciTimeZoonMode(): void { this.drawingManager?.setFibonacciTimeZoonMode(); }
    public setFibonacciRetracementMode(): void { this.drawingManager?.setFibonacciRetracementMode(); }
    public setFibonacciArcMode(): void { this.drawingManager?.setFibonacciArcMode(); }
    public setFibonacciCircleMode(): void { this.drawingManager?.setFibonacciCircleMode(); }
    public setFibonacciSpiralMode(): void { this.drawingManager?.setFibonacciSpiralMode(); }
    public setFibonacciWedgeMode(): void { this.drawingManager?.setFibonacciWedgeMode(); }
    public setFibonacciFanMode(): void { this.drawingManager?.setFibonacciFanMode(); }
    public setFibonacciChannelMode(): void { this.drawingManager?.setFibonacciChannelMode(); }
    public setFibonacciExtensionBasePriceMode(): void { this.drawingManager?.setFibonacciExtensionBasePriceMode(); }
    public setFibonacciExtensionBaseTimeMode(): void { this.drawingManager?.setFibonacciExtensionBaseTimeMode(); }
    public setXABCDMode(): void { this.drawingManager?.setXABCDMode(); }
    public setHeadAndShouldersMode(): void { this.drawingManager?.setHeadAndShouldersMode(); }
    public setABCDMode(): void { this.drawingManager?.setABCDMode(); }
    public setTriangleABCDMode(): void { this.drawingManager?.setTriangleABCDMode(); }
    public setElliottImpulseMode(): void { this.drawingManager?.setElliottImpulseMode(); }
    public setElliottCorrectiveMode(): void { this.drawingManager?.setElliottCorrectiveMode(); }
    public setElliottTriangleMode(): void { this.drawingManager?.setElliottTriangleMode(); }
    public setElliottDoubleCombinationMode(): void { this.drawingManager?.setElliottDoubleCombinationMode(); }
    public setElliottTripleCombinationMode(): void { this.drawingManager?.setElliottTripleCombinationMode(); }
    public setTimeRangeMarkMode(): void { this.drawingManager?.setTimeRangeMarkMode(); }
    public setPriceRangeMarkMode(): void { this.drawingManager?.setPriceRangeMarkMode(); }
    public setTimePriceRangeMarkMode(): void { this.drawingManager?.setTimePriceRangeMarkMode(); }
    public setHeatMapMode(): void { this.drawingManager?.setHeatMapMode(); }
    public setLongPositionMarkMode(): void { this.drawingManager?.setLongPositionMarkMode(); }
    public setShortPositionMarkMode(): void { this.drawingManager?.setShortPositionMarkMode(); }
    public setMockKLineMarkMode(): void { this.drawingManager?.setMockKLineMarkMode(); }
    public setPencilMode(): void { this.drawingManager?.setPencilMode(); }
    public setPenMode(): void { this.drawingManager?.setPenMode(); }
    public setBrushMode(): void { this.drawingManager?.setBrushMode(); }
    public setMarkerPenMode(): void { this.drawingManager?.setMarkerPenMode(); }
    public setEraserMode(): void { this.drawingManager?.setEraserMode(); }
    public setTextEditMarkMode(): void { this.drawingManager?.setTextEditMarkMode(); }
    public setPriceNoteMarkMode(): void { this.drawingManager?.setPriceNoteMarkMode(); }
    public setBubbleBoxMarkMode(): void { this.drawingManager?.setBubbleBoxMarkMode(); }
    public setPinMarkMode(): void { this.drawingManager?.setPinMarkMode(); }
    public setSignpostMarkMode(): void { this.drawingManager?.setSignpostMarkMode(); }
    public setPriceLabelMode(): void { this.drawingManager?.setPriceLabelMode(); }
    public setFlagMarkMode(): void { this.drawingManager?.setFlagMarkMode(); }
    public setImageMarkMode(): void { this.drawingManager?.setImageMarkMode(); }
    public setEmojiMarkMode(emoji: string): void { this.drawingManager?.setEmojiMarkMode(emoji); }
    public setPriceEventMode(): void { this.drawingManager?.setPriceEventMode(); }
    public setTimeEventMode(): void { this.drawingManager?.setTimeEventMode(); }

    public showAllMark(): void { this.drawingManager?.showAllMark(); }
    public hideAllMark(): void { this.drawingManager?.hideAllMark(); }
    public clearAllMark(): void { this.drawingManager?.clearAllMark(); }

    public showTableMarkToolBar(drawing: MarkDrawing): void {
        this.drawingManager?.showTableMarkToolBar(drawing);
    }

    public showTextEditMarkToolBar(drawing: MarkDrawing, isShowGrapTool: boolean): void {
        this.closeTextMarkToolBar();
        this.closeGraphMarkToolBar();
        const containerRect = this.chart.container.getBoundingClientRect();
        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            let relativeX = point.x;
            let relativeY = point.y;
            toolbarPosition = {
                x: Math.max(10, Math.min(relativeX - 150, containerRect.width - 200)),
                y: Math.max(10, Math.min(relativeY - 80, containerRect.height - 100))
            };
        }
        this.textMarkToolBar = new TextMarkToolBar({
            position: toolbarPosition,
            selectedDrawing: drawing,
            theme: this.chart.currentTheme,
            i18n: this.chart.getI18n(),
            container: this.chart.container,
            onClose: () => this.closeTextMarkToolBar(),
            onDelete: () => {
                if (drawing.properties?.originalMark) {
                    this.chartMarkManager?.deleteMark(drawing.markType, drawing.properties.originalMark);
                }
                this.closeTextMarkToolBar();
            },
            onChangeTextColor: (color) => this.currentMarkSettingsStyle?.updateStyles({ color }),
            onChangeTextStyle: (style) => this.currentMarkSettingsStyle?.updateStyles({ isBold: style.isBold, isItalic: style.isItalic }),
            onChangeTextSize: (size) => this.currentMarkSettingsStyle?.updateStyles({ fontSize: size }),
            onChangeGraphColor: (color) => this.currentMarkSettingsStyle?.updateStyles({ graphColor: color }),
            onChangeGraphStyle: (lineStyle) => this.currentMarkSettingsStyle?.updateStyles({ graphLineStyle: lineStyle }),
            onChangeGraphLineWidth: (width) => this.currentMarkSettingsStyle?.updateStyles({ graphLineWidth: width }),
            onDragStart: (startPoint) => this.setupToolbarDrag(startPoint, 'text'),
            isShowGrapTool
        });
    }

    public showGraphMarkToolBar(drawing: MarkDrawing): void {
        this.closeTextMarkToolBar();
        this.closeGraphMarkToolBar();
        const containerRect = this.chart.container.getBoundingClientRect();
        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            let relativeX = point.x;
            let relativeY = point.y;
            toolbarPosition = {
                x: Math.max(10, Math.min(relativeX - 150, containerRect.width - 200)),
                y: Math.max(10, Math.min(relativeY - 80, containerRect.height - 100))
            };
        }
        this.graphMarkToolBar = new GraphMarkToolBar({
            position: toolbarPosition,
            selectedDrawing: drawing,
            theme: this.chart.currentTheme,
            i18n: this.chart.getI18n(),
            container: this.chart.container,
            onClose: () => this.closeGraphMarkToolBar(),
            onDelete: () => {
                if (drawing.properties?.originalMark) {
                    this.chartMarkManager?.deleteMark(drawing.markType, drawing.properties.originalMark);
                }
                this.closeGraphMarkToolBar();
            },
            onChangeColor: (color) => this.currentMarkSettingsStyle?.updateStyles({ color }),
            onChangeStyle: (lineStyle) => this.currentMarkSettingsStyle?.updateStyles({ lineStyle }),
            onChangeWidth: (width) => this.currentMarkSettingsStyle?.updateStyles({ lineWidth: width }),
            onDragStart: (startPoint) => this.setupToolbarDrag(startPoint, 'graph'),
        });
    }

    private setupToolbarDrag(startPoint: Point, type: 'text' | 'graph'): void {
        let lastX = startPoint.x;
        let lastY = startPoint.y;
        let isDragging = true;
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            if ((e.buttons & 1) === 0) { onMouseUp(); return; }
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            const toolbar = type === 'text' ? this.textMarkToolBar?.getContainer() : this.graphMarkToolBar?.getContainer();
            if (toolbar) {
                const currentLeft = parseInt(toolbar.style.left, 10);
                const currentTop = parseInt(toolbar.style.top, 10);
                let newLeft = currentLeft + deltaX;
                let newTop = currentTop + deltaY;
                const chartContainer = this.chart.containerRef.current;
                if (chartContainer) {
                    const containerRect = chartContainer.getBoundingClientRect();
                    const toolbarRect = toolbar.getBoundingClientRect();
                    const minX = 0;
                    const minY = 0;
                    const maxX = containerRect.width - toolbarRect.width;
                    const maxY = containerRect.height - toolbarRect.height;
                    newLeft = Math.max(minX, Math.min(newLeft, maxX));
                    newTop = Math.max(minY, Math.min(newTop, maxY));
                }
                if (type === 'text') {
                    this.textMarkToolBar?.updatePosition({ x: newLeft, y: newTop });
                } else {
                    this.graphMarkToolBar?.updatePosition({ x: newLeft, y: newTop });
                }
            }
        };
        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    public closeTextMarkToolBar(): void {
        this.textMarkToolBar?.destroy();
        this.textMarkToolBar = null;
    }

    public closeGraphMarkToolBar(): void {
        this.graphMarkToolBar?.destroy();
        this.graphMarkToolBar = null;
    }

    public closeTableMarkToolBar(): void {
        this.drawingManager?.closeTableMarkToolBar();
    }

    public disableChartMovement(): void {
        if (!this.chart.chart) return;
        this.movementDisableCount++;
        if (this.movementDisableCount === 1) {
            const currentOptions = this.chart.chart.options();
            this.originalChartOptions = {
                handleScroll: currentOptions.handleScroll,
                handleScale: currentOptions.handleScale,
            };
            this.chart.chart.applyOptions({ handleScroll: false, handleScale: false });
        }
    }

    public enableChartMovement(): void {
        if (!this.chart.chart) return;
        this.chart.chart.applyOptions({ handleScroll: true, handleScale: true });
        this.movementDisableCount = 0;
        this.originalChartOptions = null;
    }

    public handleViewportShiftLeft(): void {
        if (!this.chart.chart) return;
        const timeScale = this.chart.chart.timeScale();
        const logicalRange = timeScale.getVisibleLogicalRange();
        if (!logicalRange) return;
        const { from, to } = logicalRange;
        const shiftAmount = (to - from) * 0.2;
        timeScale.setVisibleLogicalRange({ from: from - shiftAmount, to: to - shiftAmount });
    }

    public handleViewportShiftRight(): void {
        if (!this.chart.chart) return;
        const timeScale = this.chart.chart.timeScale();
        const logicalRange = timeScale.getVisibleLogicalRange();
        if (!logicalRange) return;
        const { from, to } = logicalRange;
        const shiftAmount = (to - from) * 0.2;
        timeScale.setVisibleLogicalRange({ from: from + shiftAmount, to: to + shiftAmount });
    }

    public handleZoomIn(): void {
        if (!this.chart.chart) return;
        const timeScale = this.chart.chart.timeScale();
        const logicalRange = timeScale.getVisibleLogicalRange();
        if (!logicalRange) return;
        const { from, to } = logicalRange;
        const center = (from + to) / 2;
        const halfRange = (to - from) / 2;
        timeScale.setVisibleLogicalRange({ from: center - halfRange * 0.7, to: center + halfRange * 0.7 });
    }

    public handleZoomOut(): void {
        if (!this.chart.chart) return;
        const timeScale = this.chart.chart.timeScale();
        const logicalRange = timeScale.getVisibleLogicalRange();
        if (!logicalRange) return;
        const { from, to } = logicalRange;
        const center = (from + to) / 2;
        const halfRange = (to - from) / 2;
        timeScale.setVisibleLogicalRange({ from: center - halfRange * 1.3, to: center + halfRange * 1.3 });
    }

    public updateTheme(theme: ThemeConfig): void {
        this.textMarkToolBar?.updateTheme(theme);
        this.graphMarkToolBar?.updateTheme(theme);
        this.drawingManager?.updateTheme(theme);
        this.chartPanesManager?.updateAllPaneTheme(theme);
    }

    public updateI18n(i18n: I18n): void {
        this.textMarkToolBar?.updateI18n(i18n);
        this.graphMarkToolBar?.updateI18n(i18n);
        this.drawingManager?.updateI18n(i18n);
    }

    public destroy(): void {
        this.drawingManager?.destroy();
        this.chartPanesManager?.removeAllPane();
        this.closeTextMarkToolBar();
        this.closeGraphMarkToolBar();
        this.drawingManager = null;
        this.chartMarkManager = null;
        this.chartPanesManager = null;
    }
}