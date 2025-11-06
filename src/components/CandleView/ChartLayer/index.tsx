import React from 'react';
import { DrawingToolsManager, DrawingShape } from '../Drawing/DrawingManager';
import { drawingConfigs, DrawingConfig, registerDrawingConfig, unregisterDrawingConfig } from '../Drawing/DrawingConfigs';
import { CanvasRenderer } from '../Drawing/CanvasRenderer';
import { HistoryManager } from '../Drawing/HistoryManager';
import { DrawingOperations } from '../Drawing/DrawingOperations';
import { MarkOperationToolbar } from './MarkOperationToolbar';
import { ThemeConfig } from '../CandleViewTheme';
import { TechnicalIndicatorsPanel } from '../Indicators/TechnicalIndicatorsPanel';
import { MainChartVolume } from '../Indicators/main/MainChartVolume';
import { OverlayManager } from './OverlayManager';
import { DataPointManager } from './DataPointManager';
import { ChartSeries } from './ChartTypeManager';
import { ChartEventManager } from './ChartEventManager';
import { LineMark } from '../Mark/Graph/LineMark';
import { OperableTextMark } from '../Mark/Operable/OperableTextMark';
import { Drawing, HistoryRecord, Point } from '../types';
import { MultiBottomArrowMark } from '../Mark/CandleChart/MultiBottomArrowMark';
import { BottomArrowMark } from '../Mark/CandleChart/BottomArrowMark';
import { TopArrowMark } from '../Mark/CandleChart/TopArrowMark';
import { OperableEmojiMark } from '../Mark/Operable/OperableEmojiMark';
import { TextMarkEditorModal } from './TextMarkEditorModal';
import { MultiTopArrowMark } from '../Mark/CandleChart/MultiTopArrowMark';

export interface ChartLayerProps {
    chart: any;
    chartSeries: ChartSeries | null;
    currentTheme: ThemeConfig;
    activeTool: string | null;
    onDrawingComplete?: (drawing: DrawingShape) => void;
    onCloseDrawing?: () => void;
    onToolSelect?: (tool: string) => void;
    onTextClick?: (toolId: string) => void;
    onEmojiClick?: (toolId: string) => void;
    selectedEmoji?: string;
    chartData: Array<{
        time: string;
        value: number;
        open: number;
        high: number;
        low: number;
        close: number;
    }>;
    activeIndicators: string[];
    indicatorsHeight?: number;
    title?: string;
    chartEventManager: ChartEventManager | null
}

export interface ChartLayerState {
    isDrawing: boolean;
    drawingPoints: Point[];
    currentDrawing: any;
    drawingStartPoint: Point | null;
    drawings: Drawing[];
    selectedDrawing: Drawing | null;
    operationToolbarPosition: Point;
    isDraggingToolbar: boolean;
    dragStartPoint: Point | null;
    history: HistoryRecord[];
    historyIndex: number;
    isDragging: boolean;
    isResizing: boolean;
    isRotating: boolean;
    resizeHandle: string | null;
    isTextInputActive: boolean;
    textInputPosition: Point | null;
    textInputValue: string;
    textInputCursorVisible: boolean;
    textInputCursorTimer: NodeJS.Timeout | null;
    activePanel: null;
    editingTextId: string | null;
    isFirstTimeTextMode: boolean;
    isEmojiInputActive: boolean;
    emojiInputPosition: Point | null;
    selectedEmoji: string;
    editingEmojiId: string | null;
    isFirstTimeEmojiMode: boolean;
    mousePosition: Point | null;
    currentOHLC: {
        time: string;
        open: number;
        high: number;
        low: number;
        close: number;
    } | null;
    showOHLC: boolean;
    isEmojiMarkMode: boolean;
    pendingEmojiMark: string | null;
    isTextMarkMode: boolean;
    isTextMarkEditorOpen: boolean;
    editingTextMark: OperableTextMark | null;
    textMarkEditorPosition: { x: number; y: number };
    textMarkEditorInitialData: {
        text: string;
        color: string;
        fontSize: number;
        isBold: boolean;
        isItalic: boolean;
    };

    isLineMarkMode: boolean;
    lineMarkStartPoint: Point | null;
    currentLineMark: LineMark | null;

}

class ChartLayer extends React.Component<ChartLayerProps, ChartLayerState> {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private containerRef = React.createRef<HTMLDivElement>();
    private drawingManager: DrawingToolsManager | null = null;
    private allDrawings: Drawing[] = [];
    private drawingConfigs = drawingConfigs;
    private historyManager: HistoryManager;
    private readonly MAX_HISTORY_SIZE = 50;
    private doubleClickTimeout: NodeJS.Timeout | null = null;
    private isFirstTimeTextMode: boolean = false;
    private isFirstTimeEmojiMode: boolean = false;
    private overlayManager: OverlayManager | null = null;
    private dataPointManager: DataPointManager | null = null;
    private previewLineMark: LineMark | null = null;

    constructor(props: ChartLayerProps) {
        super(props);
        this.state = {
            isDrawing: false,
            drawingPoints: [],
            currentDrawing: null,
            drawingStartPoint: null,
            drawings: [],
            selectedDrawing: null,
            operationToolbarPosition: { x: 20, y: 20 },
            isDraggingToolbar: false,
            dragStartPoint: null,
            history: [],
            historyIndex: -1,
            isDragging: false,
            isResizing: false,
            isRotating: false,
            resizeHandle: null,
            isTextInputActive: false,
            textInputPosition: null,
            textInputValue: '',
            textInputCursorVisible: true,
            textInputCursorTimer: null,
            activePanel: null,
            editingTextId: null,
            isFirstTimeTextMode: false,
            isEmojiInputActive: false,
            emojiInputPosition: null,
            selectedEmoji: '😀',
            editingEmojiId: null,
            isFirstTimeEmojiMode: false,
            mousePosition: null,
            currentOHLC: null,
            showOHLC: true,
            isEmojiMarkMode: false,
            pendingEmojiMark: null,
            isTextMarkMode: false,
            isTextMarkEditorOpen: false,
            editingTextMark: null,
            textMarkEditorPosition: { x: 0, y: 0 },
            textMarkEditorInitialData: {
                text: '',
                color: '#000000',
                fontSize: 14,
                isBold: false,
                isItalic: false
            },

            isLineMarkMode: false,
            lineMarkStartPoint: null,
            currentLineMark: null,
        };
        this.historyManager = new HistoryManager(this.MAX_HISTORY_SIZE);
    }

    public setLineMarkMode = () => {
        this.setState({
            isLineMarkMode: true,
            isTextMarkMode: false,
            isEmojiMarkMode: false
        });
    };

    private cancelLineMarkMode = () => {
        this.setState({
            isLineMarkMode: false,
            lineMarkStartPoint: null,
            currentLineMark: null
        });
    };

    private handleLineMarkMouseDown = (point: Point) => {
        const { chartSeries, chart } = this.props;
        if (!this.state.isLineMarkMode || !chartSeries || !chart) {
            return;
        }
        try {
            const chartElement = chart.chartElement();
            if (!chartElement) return;
            const chartRect = chartElement.getBoundingClientRect();
            const containerRect = this.containerRef.current?.getBoundingClientRect();
            if (!containerRect) return;
            const relativeX = point.x - (containerRect.left - chartRect.left);
            const relativeY = point.y - (containerRect.top - chartRect.top);
            const timeScale = chart.timeScale();
            const time = timeScale.coordinateToTime(relativeX);
            const price = chartSeries.series.coordinateToPrice(relativeY);
            if (time === null || price === null) return;
            if (!this.state.lineMarkStartPoint) {
                this.setState({
                    lineMarkStartPoint: point
                });
                this.previewLineMark = new LineMark(
                    time.toString(),
                    price,
                    time.toString(), 
                    price,
                    '#2962FF',
                    2,
                    true 
                );
                chartSeries.series.attachPrimitive(this.previewLineMark);
            } else {
                if (this.previewLineMark) {
                    chartSeries.series.detachPrimitive(this.previewLineMark);
                    const finalLineMark = new LineMark(
                        this.previewLineMark.getStartTime(),
                        this.previewLineMark.getStartPrice(),
                        time.toString(),
                        price,
                        '#2962FF',
                        2,
                        false 
                    );
                    chartSeries.series.attachPrimitive(finalLineMark);
                    this.previewLineMark = null;
                }
                this.cancelLineMarkMode();
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            }
        } catch (error) {
            console.error('Error placing line mark:', error);
            this.cancelLineMarkMode();
        }
    };


    // 处理鼠标移动事件（直线标记预览）
    // 处理鼠标移动事件（直线标记预览）
    private handleLineMarkMouseMove = (point: Point) => {
        if (!this.state.isLineMarkMode || !this.state.lineMarkStartPoint || !this.previewLineMark) {
            return;
        }

        const { chartSeries, chart } = this.props;
        if (!chartSeries || !chart) return;

        try {
            const chartElement = chart.chartElement();
            if (!chartElement) return;

            const chartRect = chartElement.getBoundingClientRect();
            const containerRect = this.containerRef.current?.getBoundingClientRect();
            if (!containerRect) return;

            // 转换坐标
            const relativeX = point.x - (containerRect.left - chartRect.left);
            const relativeY = point.y - (containerRect.top - chartRect.top);

            const timeScale = chart.timeScale();
            const time = timeScale.coordinateToTime(relativeX);
            const price = chartSeries.series.coordinateToPrice(relativeY);

            if (time !== null && price !== null && this.previewLineMark) {
                // 更新预览直线的终点坐标
                this.previewLineMark.updateEndPoint(time.toString(), price);

                // 强制图表重绘
                chart.timeScale().widthChanged();
            }
        } catch (error) {
            console.error('Error updating line mark preview:', error);
        }
    };

    public setFirstTimeEmojiMode = (isFirstTime: boolean) => {
        this.isFirstTimeEmojiMode = isFirstTime;
    };

    public setFirstTimeTextMode = (isFirstTime: boolean) => {
        this.isFirstTimeTextMode = isFirstTime;
    };

    public registerDrawingConfig(config: DrawingConfig) {
        registerDrawingConfig(config);
    }

    public unregisterDrawingConfig(type: string) {
        unregisterDrawingConfig(type);
    }

    public serializeDrawings(): string {
        return JSON.stringify(this.allDrawings);
    }

    private setupEmojiManagerEvents() {
        if (!this.containerRef.current) return;
        this.containerRef.current.addEventListener('emojiSelected', (e: any) => {
            const emojiId = e.detail.emojiId;
            const drawing = this.allDrawings.find(d => d.id === emojiId);
            if (drawing) {
                this.showMarkToolBar(drawing);
                this.setState({ isFirstTimeEmojiMode: false });
                const point = this.getMousePosition(e.detail.originalEvent);
                if (point) {
                    this.setState({
                        isDragging: true,
                        dragStartPoint: point
                    });
                }
            }
        });
    }

    componentDidMount() {
        this.setupDocumentMouseTracking();
        this.initializeDrawingManager();
        this.setupCanvas();
        this.setupEmojiManagerEvents();
        this.saveToHistory('init');
        this.setupChartCoordinateListener();
        this.setupDrawingEvents();
        this.initializeDataPointManager();
        document.addEventListener('keydown', this.handleKeyDown);

        if (this.containerRef.current) {
            this.overlayManager = new OverlayManager(this.containerRef.current);
            this.overlayManager.setChartContext(
                this.props.chartData,
                this.props.chart,
                this.canvasRef.current!,
                this.dataPointManager!
            );
            // ======================= 覆盖物 ======================
            setTimeout(() => {
                const mark = new TopArrowMark('2025-01-01', 97.2
                );
                const mark2 = new BottomArrowMark('2025-01-01', 102.3
                );
                const mark3 = new TopArrowMark('2025-01-11', 88.7
                );
                const mark4 = new BottomArrowMark('2025-01-11', 118
                );
                const mark5 = new MultiBottomArrowMark('2025-01-14', 68.5, 5);
                const mark6 = new MultiTopArrowMark('2025-01-14', 68.5, 5);
                const mark7 = new OperableEmojiMark('2025-01-14', 68.5, '🚀', 'ASDFASDF');
                const mark8 = new OperableTextMark('2025-01-14', 68.5, '哈哈哈哈');
                this.props.chartSeries?.series.attachPrimitive(mark);
                this.props.chartSeries?.series.attachPrimitive(mark2);
                this.props.chartSeries?.series.attachPrimitive(mark3);
                this.props.chartSeries?.series.attachPrimitive(mark4);
                this.props.chartSeries?.series.attachPrimitive(mark5);
                this.props.chartSeries?.series.attachPrimitive(mark6);
                this.props.chartSeries?.series.attachPrimitive(mark8);
                // this.props.chartSeries?.series.attachPrimitive(mark7);
            }, 1000);
            // =================== 覆盖物 ====================
        }
        // 注册图表事件
        if (this.props.chartEventManager) {
            // this.props.chartEventManager.registerVisibleTimeRangeChangeEvent((p) => {
            //     console.log('***************1 图表缩放和移动');
            //     console.log(p);
            // });
            // this.props.chartEventManager.registerVisibleLogicalRangeChangeEvent((p) => {
            //     console.log('***************2 图表缩放和移动');
            //     console.log(p);
            // });
        }
        // 添加文字标记事件监听
        this.setupTextMarkEvents();
        // 添加文字标记编辑器模态框事件监听
        this.setupTextMarkEditorEvents();
    }

    public setTextMarkMode = () => {
        this.setState({
            isTextMarkMode: true
        });
    };

    private cancelTextMarkMode = () => {
        this.setState({
            isTextMarkMode: false
        });
    };

    private placeTextMark = (point: Point) => {
        const { chartSeries, chart } = this.props;
        if (!chartSeries || !chart) {
            this.cancelTextMarkMode();
            return;
        }
        try {
            const chartElement = chart.chartElement();
            if (!chartElement) {
                this.cancelTextMarkMode();
                return;
            }
            const chartRect = chartElement.getBoundingClientRect();
            const containerRect = this.containerRef.current?.getBoundingClientRect();
            if (!containerRect) {
                this.cancelTextMarkMode();
                return;
            }
            const relativeX = point.x - (containerRect.left - chartRect.left);
            const relativeY = point.y - (containerRect.top - chartRect.top) + 20;
            const timeScale = chart.timeScale();
            const time = timeScale.coordinateToTime(relativeX);
            const price = chartSeries.series.coordinateToPrice(relativeY);
            if (time === null || price === null) {
                this.cancelTextMarkMode();
                return;
            }
            const textMark = new OperableTextMark(time.toString(), price, '');
            setTimeout(() => {
                if ((textMark as any)._startEditing) {
                    (textMark as any)._startEditing();
                }
            }, 100);
            chartSeries.series.attachPrimitive(textMark);
        } catch (error) {
        }
        this.cancelTextMarkMode();
    };


    private handleChangeTextMarkColor = (color: string) => {
        if (!this.state.selectedDrawing) return;
        this.state.selectedDrawing?.properties.originalMark.updateStyle({ color });
    };

    private handleChangeTextMarkStyle = (style: { isBold?: boolean; isItalic?: boolean }) => {
        let isBold = style.isBold;
        let isItalic = style.isItalic;
        if (!this.state.selectedDrawing) return;
        this.state.selectedDrawing?.properties.originalMark.updateStyle({ isBold, isItalic });
    };

    private handleChangeTextMarkSize = (fontSize: string) => {
        if (!this.state.selectedDrawing) return;
        this.state.selectedDrawing?.properties.originalMark.updateStyle({ fontSize });
    };

    private handleDeleteTextMark = () => {
        if (!this.state.selectedDrawing) return;
        const drawing = this.state.selectedDrawing;
        if (drawing.type === 'text' && drawing.properties?.originalMark) {
            const textMark = drawing.properties.originalMark as OperableTextMark;
            this.props.chartSeries?.series.detachPrimitive(textMark);
            textMark.delete?.();
            textMark.destroy?.();
        }
        this.allDrawings = this.allDrawings.filter(d => d.id !== drawing.id);
        this.saveToHistory(`删除${this.getToolName(drawing.type)}`);
        this.setState({
            selectedDrawing: null,
            operationToolbarPosition: { x: 20, y: 20 }
        });
    };

    private handleTextMarkEditorSave = (text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => {
        if (this.state.editingTextMark) {
            this.state.editingTextMark.updateTextContent(text, color, fontSize, isBold, isItalic);
        }
        this.setState({
            isTextMarkEditorOpen: false,
            editingTextMark: null
        });
    };
    private handleTextMarkEditorCancel = () => {
        this.setState({
            isTextMarkEditorOpen: false,
            editingTextMark: null
        });
    };

    private setupTextMarkEditorEvents() {
        const handleTextMarkEditorRequest = (e: any) => {
            const { mark, position, text, color, fontSize, isBold, isItalic } = e.detail;
            const drawing: Drawing = {
                id: `textmark_${Date.now()}`,
                type: 'text',
                points: [{ x: position.x, y: position.y }],
                color: color || this.props.currentTheme.chart.lineColor,
                lineWidth: 1,
                rotation: 0,
                properties: {
                    text: text,
                    fontSize: fontSize || 14,
                    isBold: isBold || false,
                    isItalic: isItalic || false,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    originalMark: mark
                }
            };
            this.showMarkToolBar(drawing);
            this.setState({
                isTextMarkEditorOpen: true,
                editingTextMark: mark,
                textMarkEditorPosition: {
                    x: e.detail.clientX || window.innerWidth / 2,
                    y: e.detail.clientY || window.innerHeight / 2
                },
                textMarkEditorInitialData: {
                    text: text,
                    color: color,
                    fontSize: fontSize,
                    isBold: isBold,
                    isItalic: isItalic
                }
            });
            e.stopPropagation();
        };
        document.addEventListener('textMarkEditorRequest', handleTextMarkEditorRequest);
        (this as any).textMarkEditorEventHandler = handleTextMarkEditorRequest;
    }

    private setupTextMarkEvents() {
        const handleTextMarkSelected = (e: any) => {
            const { mark, position, text, color, fontSize, isBold, isItalic } = e.detail;
            const drawing: Drawing = {
                id: `textmark_${Date.now()}`,
                type: 'text',
                points: [{ x: position.x, y: position.y }],
                color: color || this.props.currentTheme.chart.lineColor,
                lineWidth: 1,
                rotation: 0,
                properties: {
                    text: text,
                    fontSize: fontSize || 14,
                    isBold: isBold || false,
                    isItalic: isItalic || false,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    originalMark: mark
                }
            };
            this.showMarkToolBar(drawing);
            (this as any).currentTextMark = mark;
            e.stopPropagation();
        };

        const handleTextMarkDeselected = (e: any) => {
            if ((this as any).currentTextMark && e.detail.mark === (this as any).currentTextMark) {
                this.closeMarkToolBar();
                (this as any).currentTextMark = null;
            } else {
            }
            e.stopPropagation();
        };

        const handleTextMarkDeleted = (e: any) => {
            const { mark } = e.detail;
            if ((this as any).currentTextMark && mark === (this as any).currentTextMark) {
                this.closeMarkToolBar();
                (this as any).currentTextMark = null;
            }
            e.stopPropagation();
        };
        document.addEventListener('textMarkSelected', handleTextMarkSelected);
        document.addEventListener('textMarkDeselected', handleTextMarkDeselected);
        document.addEventListener('textMarkDeleted', handleTextMarkDeleted);
        (this as any).textMarkEventHandlers = {
            textMarkSelected: handleTextMarkSelected,
            textMarkDeselected: handleTextMarkDeselected,
            textMarkDeleted: handleTextMarkDeleted
        };
    }

    private initializeDataPointManager(): void {
        if (this.containerRef.current && this.canvasRef.current) {
            this.dataPointManager = new DataPointManager({
                container: this.containerRef.current,
                canvas: this.canvasRef.current,
                chartData: this.props.chartData,
                getChartPriceRange: this.getChartPriceRange,
                coordinateToTime: this.coordinateToTime,
                coordinateToPrice: this.coordinateToPrice,
                chart: this.props.chart,
                chartSeries: this.props.chartSeries,
            });
        }
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (this.state.isLineMarkMode) {
                this.cancelLineMarkMode();
            }
            // 其他模式的取消逻辑...
        }
    };

    componentDidUpdate(prevProps: ChartLayerProps, prevState: ChartLayerState) {
        if (prevProps.activeTool !== this.props.activeTool ||
            prevState.isTextMarkMode !== this.state.isTextMarkMode ||
            prevState.isEmojiMarkMode !== this.state.isEmojiMarkMode ||
            prevState.isLineMarkMode !== this.state.isLineMarkMode) { // 新增条件
            this.updateCursorStyle();
            this.closeMarkToolBar();
        }

        if (this.state.isDrawing !== prevState.isDrawing ||
            this.state.drawingPoints !== prevState.drawingPoints ||
            this.state.selectedDrawing !== prevState.selectedDrawing) {
            this.redrawCanvas();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleDocumentMouseMove);
        document.removeEventListener('keydown', this.handleKeyDown);
        if (this.drawingManager) {
            this.drawingManager.destroy();
        }
        if (this.doubleClickTimeout) {
            clearTimeout(this.doubleClickTimeout);
        }
        if (this.overlayManager) {
            this.overlayManager.destroy();
        }
        this.cleanupDrawingEvents();
    }

    private setupCanvas() {
        const canvas = this.canvasRef.current;
        const container = this.containerRef.current;
        if (!canvas || !container) return;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        this.redrawCanvas();
    }

    private redrawCanvas() {
        const canvas = this.canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.allDrawings
            .filter(drawing => drawing.type !== 'text' && drawing.type !== 'emoji')
            .forEach(drawing => {
                CanvasRenderer.drawShape(ctx, drawing, this.drawingConfigs);
            });
        if (this.state.isDrawing && this.state.drawingPoints.length > 0) {
            CanvasRenderer.drawPreview(
                ctx,
                this.state.drawingPoints,
                this.props.activeTool,
                this.props.currentTheme.chart.lineColor + '80',
                this.drawingConfigs
            );
        }
        if (this.state.selectedDrawing &&
            this.state.selectedDrawing.type !== 'text' &&
            this.state.selectedDrawing.type !== 'emoji') {
            CanvasRenderer.drawSelection(ctx, this.state.selectedDrawing, this.drawingConfigs);
        }
    }


    public setEmojiMarkMode = (emoji: string) => {
        this.setState({
            isEmojiMarkMode: true,
            pendingEmojiMark: emoji
        });
    };

    private cancelEmojiMarkMode = () => {
        this.setState({
            isEmojiMarkMode: false,
            pendingEmojiMark: null
        });
    };

    private placeEmojiMark = (point: Point, emoji: string) => {
        const { chartSeries, chart } = this.props;
        if (!chartSeries || !chart) {
            this.cancelEmojiMarkMode();
            return;
        }
        try {
            const chartElement = chart.chartElement();
            if (!chartElement) {
                this.cancelEmojiMarkMode();
                return;
            }
            const chartRect = chartElement.getBoundingClientRect();
            const containerRect = this.containerRef.current?.getBoundingClientRect();
            if (!containerRect) {
                this.cancelEmojiMarkMode();
                return;
            }
            const relativeX = point.x - (containerRect.left - chartRect.left);
            const relativeY = point.y - (containerRect.top - chartRect.top) + 20;
            const timeScale = chart.timeScale();
            const time = timeScale.coordinateToTime(relativeX);
            const price = chartSeries.series.coordinateToPrice(relativeY);
            if (time === null || price === null) {
                this.cancelEmojiMarkMode();
                return;
            }
            const emojiMark = new OperableEmojiMark(time.toString(), price, emoji);
            chartSeries.series.attachPrimitive(emojiMark);
        } catch (error) {
        }
        this.cancelEmojiMarkMode();
    };

    private convertToChartCoordinates(point: Point): { time: string | null; price: number | null } {
        const { chartSeries, chart } = this.props;
        if (!chartSeries || !chart) return { time: null, price: null };

        try {
            const chartElement = chart.chartElement();
            if (!chartElement) return { time: null, price: null };

            const chartRect = chartElement.getBoundingClientRect();
            const containerRect = this.containerRef.current?.getBoundingClientRect();
            if (!containerRect) return { time: null, price: null };

            const relativeX = point.x - (containerRect.left - chartRect.left);
            const relativeY = point.y - (containerRect.top - chartRect.top);

            const timeScale = chart.timeScale();
            const time = timeScale.coordinateToTime(relativeX);
            const price = chartSeries.series.coordinateToPrice(relativeY);

            return { time: time !== null ? time.toString() : null, price };
        } catch (error) {
            console.error('Error converting coordinates:', error);
            return { time: null, price: null };
        }
    }

    private handleMouseDown = (event: MouseEvent) => {
        if (!this.containerRef.current || !this.containerRef.current.contains(event.target as Node)) {
            return;
        }
        const point = this.getMousePosition(event);
        if (!point) return;

        // 直线标记模式处理 - 放在最前面
        if (this.state.isLineMarkMode) {
            this.handleLineMarkMouseDown(point);
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (this.state.isEmojiMarkMode && this.state.pendingEmojiMark) {
            this.placeEmojiMark(point, this.state.pendingEmojiMark);
            event.preventDefault();
            event.stopPropagation();
            if (this.props.onCloseDrawing) {
                this.props.onCloseDrawing();
            }
            return;
        }
        if (this.state.isTextMarkMode) {
            this.placeTextMark(point);
            event.preventDefault();
            event.stopPropagation();
            if (this.props.onCloseDrawing) {
                this.props.onCloseDrawing();
            }
            return;
        }
    };
    // ======================= Document flow events =======================
    // Document flow events are used to separate them from the events of the drawing layer.
    private isDocumentMouseDown: boolean = false;
    private setupDocumentMouseTracking() {
        //mousedown
        document.addEventListener('mousemove', this.handleDocumentMouseMove);
        document.addEventListener('mousedown', this.handleDocumentMouseDown);
        document.addEventListener('mouseup', this.handleDocumentMouseUp);
        document.addEventListener('wheel', this.handleDocumentMouseWheel);
    }
    private handleDocumentMouseUp = (event: MouseEvent) => {
        this.isDocumentMouseDown = false;
    }
    private handleDocumentMouseDown = (event: MouseEvent) => {
        this.isDocumentMouseDown = true;
    }

    private handleDocumentMouseMove = (event: MouseEvent) => {
        if (!this.containerRef.current) return;

        const rect = this.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Mouse in drawing area
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
            const point = { x, y };
            this.setState({ mousePosition: point });
            this.updateCurrentOHLC(point);

            // 直线标记预览
            if (this.state.isLineMarkMode) {
                this.handleLineMarkMouseMove(point);
            }

            if (this.isDocumentMouseDown && !this.isPriceArea(x, rect.width) && !this.isTimeArea(y, rect.height)) {
                this.handleDocumentMainChartMouseDownMove(event);
            }
        }
    };

    // Handling of wheel for the main chart.
    private handleDocumentMouseWheel = (event: MouseEvent) => {
        if (!this.containerRef.current) return;
        const rect = this.containerRef.current.getBoundingClientRect();
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

    // ======================= Document flow events =======================

    // ======================= Data point operations =======================
    public debugCoordinateCalculation(): void {
        const firstPoint = this.dataPointManager?.getDataPointInCanvasByIndex(0);
        const lastPoint = this.dataPointManager?.getDataPointInCanvasByIndex(this.props.chartData.length - 1);
    }

    // 图表变化监听来测试坐标更新
    private setupChartCoordinateListener(): void {
        const { chart } = this.props;
        if (chart) {
            const timeScale = chart.timeScale();
            if (timeScale) {
                timeScale.subscribeVisibleTimeRangeChange(() => {
                });
                timeScale.subscribeSizeChange(() => {
                });
            }
        }
    }
    // ======================= Data point operations =======================

    // ======================= Drawing layer operations =======================
    // 获取绘图层DOM元素的位置信息
    public getDrawingLayerElementsPosition(): Array<{
        id: string;
        type: string;
        position: { x: number; y: number };
        element?: HTMLElement;
    }> {
        const elements: Array<{
            id: string;
            type: string;
            position: { x: number; y: number };
            element?: HTMLElement;
        }> = [];
        if (!this.containerRef.current) return elements;
        const textElements = this.containerRef.current.querySelectorAll('.drawing-text-element');
        textElements.forEach(element => {
            const textId = element.getAttribute('data-text-id');
            if (textId) {
                const htmlElement = element as HTMLElement;
                const rect = htmlElement.getBoundingClientRect();
                const containerRect = this.containerRef.current!.getBoundingClientRect();
                elements.push({
                    id: textId,
                    type: 'text',
                    position: {
                        x: rect.left - containerRect.left,
                        y: rect.top - containerRect.top
                    },
                    element: htmlElement
                });
            }
        });
        const emojiElements = this.containerRef.current.querySelectorAll('.drawing-emoji-element');
        emojiElements.forEach(element => {
            const emojiId = element.getAttribute('data-emoji-id');
            if (emojiId) {
                const htmlElement = element as HTMLElement;
                const rect = htmlElement.getBoundingClientRect();
                const containerRect = this.containerRef.current!.getBoundingClientRect();
                elements.push({
                    id: emojiId,
                    type: 'emoji',
                    position: {
                        x: rect.left - containerRect.left,
                        y: rect.top - containerRect.top
                    },
                    element: htmlElement
                });
            }
        });
        return elements;
    }

    // 设置绘图层DOM元素的位置
    public setDrawingLayerElementsPosition(
        positions: Array<{
            id: string;
            type: string;
            position: { x: number; y: number };
        }>
    ): void {
        if (!this.containerRef.current) return;
        positions.forEach(pos => {
            let element: HTMLElement | null = null;
            if (pos.type === 'text') {
                element = this.containerRef.current!.querySelector(`[data-text-id="${pos.id}"]`) as HTMLElement;
            } else if (pos.type === 'emoji') {
                element = this.containerRef.current!.querySelector(`[data-emoji-id="${pos.id}"]`) as HTMLElement;
            }

            if (element) {
                element.style.position = 'absolute';
                element.style.left = `${pos.position.x}px`;
                element.style.top = `${pos.position.y}px`;
                const drawingIndex = this.allDrawings.findIndex(d => d.id === pos.id);
                if (drawingIndex !== -1 && this.allDrawings[drawingIndex].points.length > 0) {
                    this.allDrawings[drawingIndex].points[0] = { ...pos.position };
                }
            }
        });
        this.saveToHistory('设置DOM元素位置');
    }

    // 批量移动绘图层DOM元素（相对移动）
    public moveDrawingLayerElements(deltaX: number, deltaY: number): void {
        if (!this.containerRef.current) return;
        const textElements = this.containerRef.current.querySelectorAll('.drawing-text-element');
        textElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            const currentLeft = parseInt(htmlElement.style.left) || 0;
            const currentTop = parseInt(htmlElement.style.top) || 0;
            htmlElement.style.left = `${currentLeft + deltaX}px`;
            htmlElement.style.top = `${currentTop + deltaY}px`;
        });
        const emojiElements = this.containerRef.current.querySelectorAll('.drawing-emoji-element');
        emojiElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            const currentLeft = parseInt(htmlElement.style.left) || 0;
            const currentTop = parseInt(htmlElement.style.top) || 0;
            htmlElement.style.left = `${currentLeft + deltaX}px`;
            htmlElement.style.top = `${currentTop + deltaY}px`;
        });
        this.allDrawings.forEach(drawing => {
            if ((drawing.type === 'text' || drawing.type === 'emoji') && drawing.points.length > 0) {
                drawing.points[0].x += deltaX;
                drawing.points[0].y += deltaY;
            }
        });
        this.saveToHistory('移动DOM元素');
    }

    // 获取特定类型的所有DOM元素位置
    public getDrawingLayerElementsByType(type: 'text' | 'emoji'): Array<{
        id: string;
        position: { x: number; y: number };
        element: HTMLElement;
    }> {
        const elements: Array<{
            id: string;
            position: { x: number; y: number };
            element: HTMLElement;
        }> = [];
        if (!this.containerRef.current) return elements;
        const selector = type === 'text' ? '.drawing-text-element' : '.drawing-emoji-element';
        const attribute = type === 'text' ? 'data-text-id' : 'data-emoji-id';
        const domElements = this.containerRef.current.querySelectorAll(selector);
        domElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            const elementId = htmlElement.getAttribute(attribute);
            if (elementId) {
                const rect = htmlElement.getBoundingClientRect();
                const containerRect = this.containerRef.current!.getBoundingClientRect();
                elements.push({
                    id: elementId,
                    position: {
                        x: rect.left - containerRect.left,
                        y: rect.top - containerRect.top
                    },
                    element: htmlElement
                });
            }
        });
        return elements;
    }
    // ======================= Drawing layer operations =======================

    private updateCurrentOHLC = (point: Point) => {
        const { chartData } = this.props;
        if (!chartData || chartData.length === 0) return;
        const canvas = this.canvasRef.current;
        if (!canvas) return;
        const timeIndex = Math.floor((point.x / canvas.width) * chartData.length);
        if (timeIndex >= 0 && timeIndex < chartData.length) {
            const dataPoint = chartData[timeIndex];
            if (dataPoint.open !== undefined && dataPoint.high !== undefined &&
                dataPoint.low !== undefined && dataPoint.close !== undefined) {
                this.setState({
                    currentOHLC: {
                        time: dataPoint.time,
                        open: dataPoint.open,
                        high: dataPoint.high,
                        low: dataPoint.low,
                        close: dataPoint.close
                    }
                });
            } else {
                this.calculateOHLCFromCoordinates(point, timeIndex);
            }
        }
    };

    private calculateOHLCFromCoordinates = (point: Point, timeIndex: number) => {
        const canvas = this.canvasRef.current;
        const container = this.containerRef.current;
        if (!canvas || !container) return;
        const { chartData } = this.props;
        const dataPoint = chartData[timeIndex];
        const priceRange = this.getChartPriceRange();
        const timeRange = chartData.length;
        if (!priceRange) return;
        const priceAtMouse = this.coordinateToPrice(point.y);
        const basePrice = dataPoint.value || priceAtMouse;
        const volatility = 0.02;
        const open = basePrice;
        const high = basePrice * (1 + volatility);
        const low = basePrice * (1 - volatility);
        const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
        this.setState({
            currentOHLC: {
                time: dataPoint.time,
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(close.toFixed(2))
            }
        });
    };

    // 修正获取价格范围的方法，使用实际的最高价和最低价
    private getChartPriceRange = (): { min: number; max: number } | null => {
        const { chartData } = this.props;
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

    private coordinateToPrice = (y: number): number => {
        const canvas = this.canvasRef.current;
        if (!canvas) return 100;
        const priceRange = this.getChartPriceRange();
        if (!priceRange) return 100;
        const percent = 1 - (y / canvas.height);
        return priceRange.min + (priceRange.max - priceRange.min) * percent;
    };


    private coordinateToTime = (x: number): string => {
        const canvas = this.canvasRef.current;
        const { chartData } = this.props;
        if (!canvas || !chartData || chartData.length === 0) {
            return new Date().toISOString().split('T')[0];
        }


        const timeIndex = Math.floor((x / canvas.width) * chartData.length);
        if (timeIndex >= 0 && timeIndex < chartData.length) {
            return chartData[timeIndex].time;
        }

        return chartData[chartData.length - 1]?.time || new Date().toISOString().split('T')[0];
    };

    // 显示标记工具bar
    private showMarkToolBar = (drawing: Drawing) => {
        if (this.state.selectedDrawing && this.state.selectedDrawing.id === drawing.id) {
            return;
        }
        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            const point = drawing.points[0];
            toolbarPosition = {
                x: Math.max(10, point.x - 150),  // 从 -100 改为 -150，向左偏移更多
                y: Math.max(10, point.y - 80)    // 从 -50 改为 -80，向上偏移更多
            };
            const canvas = this.canvasRef.current;
            if (canvas && toolbarPosition.x + 400 > canvas.width) {
                toolbarPosition.x = Math.max(10, point.x - 400);
            }
            if (canvas && toolbarPosition.y + 100 > canvas.height) {
                toolbarPosition.y = Math.max(10, point.y - 120);
            }
        }
        this.setState({
            selectedDrawing: drawing,
            operationToolbarPosition: toolbarPosition,
            isFirstTimeEmojiMode: drawing.type === 'emoji' ? false : this.state.isFirstTimeEmojiMode,
            isFirstTimeTextMode: drawing.type === 'text' ? false : this.state.isFirstTimeTextMode,
            isDragging: false,
            dragStartPoint: null
        }, () => {
        });
        if (this.props.onToolSelect) {
            this.props.onToolSelect(drawing.type);
        }
    };

    private closeMarkToolBar() {
        this.setState({ selectedDrawing: null });
    }

    private getMousePosition(event: MouseEvent): Point | null {
        if (!this.containerRef.current) {
            return null;
        }
        const rect = this.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const isInside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
        if (!isInside) {
            return null;
        }
        return { x, y };
    }

    private saveToHistory(description: string) {
        this.historyManager.saveState(this.allDrawings, description);
        this.setState({
            history: this.historyManager.getHistory(),
            historyIndex: this.historyManager.getHistoryIndex()
        });
    }

    private undo = () => {
        const drawings = this.historyManager.undo();
        if (drawings) {
            this.allDrawings = drawings;
            this.setState({
                historyIndex: this.historyManager.getHistoryIndex(),
                selectedDrawing: null
            });
            this.redrawCanvas();
        }
    };

    private redo = () => {
        const drawings = this.historyManager.redo();
        if (drawings) {
            this.allDrawings = drawings;
            this.setState({
                historyIndex: this.historyManager.getHistoryIndex(),
                selectedDrawing: null
            });
            this.redrawCanvas();
        }
    };

    private handleToolbarDrag = (startPoint: Point) => {
        this.setState({
            isDraggingToolbar: true,
            dragStartPoint: startPoint
        });

        const handleMouseMove = (event: MouseEvent) => {
            if (this.state.isDraggingToolbar && this.state.dragStartPoint) {
                const deltaX = event.clientX - this.state.dragStartPoint.x;
                const deltaY = event.clientY - this.state.dragStartPoint.y;

                this.setState(prevState => ({
                    operationToolbarPosition: {
                        x: Math.max(0, prevState.operationToolbarPosition.x + deltaX),
                        y: Math.max(0, prevState.operationToolbarPosition.y + deltaY)
                    },
                    dragStartPoint: { x: event.clientX, y: event.clientY }
                }));
            }
        };

        const handleMouseUp = () => {
            this.setState({
                isDraggingToolbar: false,
                dragStartPoint: null
            });
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };


    private updateCursorStyle = () => {
        if (!this.containerRef.current) return;
        const container = this.containerRef.current;

        if (this.state.isLineMarkMode) {
            container.style.cursor = 'crosshair';
        } else if (this.state.isTextMarkMode) {
            container.style.cursor = 'text';
        } else if (this.state.isEmojiMarkMode) {
            container.style.cursor = 'crosshair';
        } else if (this.props.activeTool) {
            container.style.cursor = 'crosshair';
        } else {
            container.style.cursor = 'default';
        }
    };


    private getToolName = (toolId: string): string => {
        const config = this.drawingConfigs.get(toolId);
        return config ? config.name : toolId;
    };

    private initializeDrawingManager() {
        this.drawingManager = new DrawingToolsManager();
    }


    private setupDrawingEvents() {
        if (!this.containerRef.current) return;
        const container = this.containerRef.current;
        container.addEventListener('mousedown', this.handleMouseDown);
        // container.addEventListener('mousemove', this.handleMouseMove);
    }

    private cleanupDrawingEvents() {
        if (!this.containerRef.current) return;
        const container = this.containerRef.current;
        container.removeEventListener('mousedown', this.handleMouseDown);
        // container.removeEventListener('mousemove', this.handleMouseMove);
    }

    private toggleOHLCVisibility = () => {
        this.setState(prevState => ({
            showOHLC: !prevState.showOHLC
        }));
    };

    private renderEyeIcon = (isVisible: boolean) => {
        const { currentTheme } = this.props;
        if (isVisible) {
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={currentTheme.layout.textColor}
                    strokeWidth="2"
                >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
        } else {
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={currentTheme.layout.textColor}
                    strokeWidth="2"
                >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
            );
        }
    };

    // chart info
    private renderChartInfo = () => {
        const { currentTheme, title } = this.props;
        const { currentOHLC, mousePosition } = this.state;
        return (
            <div
                style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    padding: '4px 8px',
                    zIndex: 20,
                    fontSize: '11px',
                    fontFamily: 'Arial, sans-serif',
                    color: currentTheme.layout.textColor,
                    pointerEvents: 'none',
                    lineHeight: '1.1',
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'nowrap',
                    whiteSpace: 'nowrap'
                }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{title || 'Chart'}</span>
                    <span
                        style={{
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            opacity: this.state.showOHLC ? 1 : 0.5,
                            marginLeft: '0px',
                            marginRight: '0px',
                            userSelect: 'none',
                            transition: 'all 0.2s',
                            padding: '2px',
                            borderRadius: '3px',
                        }}
                        onClick={this.toggleOHLCVisibility}
                        title={this.state.showOHLC ? '隐藏 OHLC' : '显示 OHLC'}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                            e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.opacity = this.state.showOHLC ? '1' : '0.5';
                        }}
                    >
                        {this.renderEyeIcon(this.state.showOHLC)}
                    </span>
                    {currentOHLC && mousePosition && this.state.showOHLC ? (
                        <>
                            <span style={{ fontSize: '12px' }}>O:{currentOHLC.open.toFixed(2)}</span>
                            <span style={{ fontSize: '12px' }}>H:{currentOHLC.high.toFixed(2)}</span>
                            <span style={{ fontSize: '12px' }}>L:{currentOHLC.low.toFixed(2)}</span>
                            <span style={{
                                fontSize: '12px',
                                color: currentOHLC.close >= currentOHLC.open
                                    ? currentTheme.chart.upColor
                                    : currentTheme.chart.downColor
                            }}>
                                C:{currentOHLC.close.toFixed(2)}
                            </span>
                            <span style={{ opacity: 0.7, fontSize: '12px' }}>
                                {currentOHLC.time}
                            </span>
                        </>
                    ) : (
                        <span style={{ opacity: 0.7, fontStyle: 'italic' }}>
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // chart volume
    private renderChartVolume = () => {
        const { currentTheme } = this.props;
        return (
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: 'calc(100% - 60px)',
                height: '60px',
                zIndex: 1,
                background: 'transparent',
                pointerEvents: 'none'
            }}>
                <MainChartVolume
                    theme={currentTheme}
                    data={this.props.chartData}
                    height={60}
                    width="100%"
                    chart={this.props.chart}
                />
            </div>
        );
    };

    // Main chart drawing area
    private renderMainChart = () => {
        return (
            <canvas
                ref={this.canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 'calc(100% - 60px)',
                    height: 'calc(100% - 60px)',
                    pointerEvents: 'none',
                    zIndex: 1,
                }}
            />
        );
    };

    render() {
        const { activeTool, currentTheme } = this.props;
        const {
            selectedDrawing,
            operationToolbarPosition,
            isDraggingToolbar,
        } = this.state;

        const canUndo = this.historyManager.canUndo();
        const canRedo = this.historyManager.canRedo();
        const hasIndicators = this.props.activeIndicators && this.props.activeIndicators.length > 0;
        return (
            <div
                style={{
                    width: '100%',
                }}>
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 5,
                        pointerEvents: activeTool ? 'auto' : 'none',
                        opacity: 1,
                        display: 'block',
                        // overflow: 'hidden'
                    }}
                >
                    {/* information layer */}
                    <div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            minHeight: '300px'
                        }}
                    >
                        {this.renderChartInfo()}
                        {this.renderChartVolume()}
                    </div>
                    {/* Main chart layer */}
                    <div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            minHeight: '300px'
                        }}
                    >
                        {this.renderMainChart()}
                    </div>
                    {/* drawing layer */}
                    <div
                        ref={this.containerRef}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            minHeight: '300px'
                        }}
                    >
                        {/* 添加文本标记编辑器模态框 */}
                        {this.state.isTextMarkEditorOpen && (
                            <TextMarkEditorModal
                                isOpen={this.state.isTextMarkEditorOpen}
                                position={this.state.textMarkEditorPosition}
                                theme={this.props.currentTheme}
                                initialText={this.state.textMarkEditorInitialData.text}
                                initialColor={this.state.textMarkEditorInitialData.color}
                                initialFontSize={this.state.textMarkEditorInitialData.fontSize}
                                initialIsBold={this.state.textMarkEditorInitialData.isBold}
                                initialIsItalic={this.state.textMarkEditorInitialData.isItalic}
                                onSave={this.handleTextMarkEditorSave}
                                onCancel={this.handleTextMarkEditorCancel}
                            />
                        )}
                        {selectedDrawing && (
                            <MarkOperationToolbar
                                position={operationToolbarPosition}
                                selectedDrawing={selectedDrawing}
                                theme={currentTheme}
                                onClose={() => this.setState({ selectedDrawing: null, activePanel: null })}
                                onDelete={this.handleDeleteTextMark}
                                onUndo={this.undo}
                                onRedo={this.redo}
                                onChangeColor={this.handleChangeTextMarkColor}
                                onChangeStyle={this.handleChangeTextMarkStyle}
                                onChangeSize={this.handleChangeTextMarkSize}
                                canUndo={canUndo}
                                canRedo={canRedo}
                                onDragStart={this.handleToolbarDrag}
                                isDragging={isDraggingToolbar}
                                getToolName={this.getToolName}
                            />
                        )}
                    </div>
                </div>
                {hasIndicators && (
                    <TechnicalIndicatorsPanel
                        currentTheme={currentTheme}
                        chartData={this.props.chartData}
                        activeIndicators={this.props.activeIndicators}
                        height={this.props.indicatorsHeight}
                    />
                )}
            </div>
        );
    }
}

export { ChartLayer };
export type { Drawing };