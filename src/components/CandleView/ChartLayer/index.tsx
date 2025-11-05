import React from 'react';
import { DrawingToolsManager, DrawingShape } from '../Drawing/DrawingManager';
import { drawingConfigs, DrawingConfig, registerDrawingConfig, unregisterDrawingConfig } from '../Drawing/DrawingConfigs';
import { CanvasRenderer } from '../Drawing/CanvasRenderer';
import { HistoryManager } from '../Drawing/HistoryManager';
import { DrawingOperations } from '../Drawing/DrawingOperations';
import { Drawing, Point, HistoryRecord } from '../Drawing/types';
import { DrawingOperationToolbar } from '../Drawing/DrawingOperationToolbar';
import { ThemeConfig } from '../CandleViewTheme';
import { TextManager } from '../Drawing/Text/TextManager';
import { TextInputComponent } from '../Drawing/Text/TextInputComponent';
import { createDefaultEmojiProperties } from '../Drawing/Emoji/EmojiConfig';
import { EmojiManager } from '../Drawing/Emoji/EmojiManager';
import { TechnicalIndicatorsPanel } from '../Indicators/TechnicalIndicatorsPanel';
import { MainChartVolume } from '../Indicators/main/MainChartVolume';
import { OverlayManager, OverlayMarker } from './OverlayManager';
import { DataPointManager } from './DataPointManager';
import { ChartSeries } from './ChartTypeManager';
import { ChartEventManager } from './ChartEventManager';
import { Coordinate, SeriesAttachedParameter } from 'lightweight-charts';
import { TopArrowMark } from '../Mark/Candle/TopArrowMark';
import { BottomArrowMark } from '../Mark/Candle/BottomArrowMark';
import { MultiBottomArrowMark } from '../Mark/Candle/MultiBottomArrowMark';
import { MultiTopArrowMark } from '../Mark/Candle/MultiTopArrowMark';

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

}

class ChartLayer extends React.Component<ChartLayerProps, ChartLayerState> {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private containerRef = React.createRef<HTMLDivElement>();
    private drawingManager: DrawingToolsManager | null = null;
    private allDrawings: Drawing[] = [];
    private drawingConfigs = drawingConfigs;
    private historyManager: HistoryManager;
    private readonly MAX_HISTORY_SIZE = 50;
    private textManager: TextManager | null = null;
    private doubleClickTimeout: NodeJS.Timeout | null = null;
    private isFirstTimeTextMode: boolean = false;
    private emojiManager: EmojiManager | null = null;
    private isFirstTimeEmojiMode: boolean = false;
    // 覆盖物管理器
    private overlayManager: OverlayManager | null = null;
    // 在 ChartLayer 类中添加
    private dataPointManager: DataPointManager | null = null;

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
        };
        this.historyManager = new HistoryManager(this.MAX_HISTORY_SIZE);

    }

    public setFirstTimeEmojiMode = (isFirstTime: boolean) => {
        this.isFirstTimeEmojiMode = isFirstTime;
    };

    private initializeEmojiManager() {
        if (this.containerRef.current) {

            this.emojiManager = new EmojiManager(
                this.containerRef.current,
                this.props.onEmojiClick
            );

            const emojiDrawings = this.allDrawings.filter(d => d.type === 'emoji');
            emojiDrawings.forEach(drawing => {
                this.emojiManager!.updateEmoji(drawing);
            });
        }
    }


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
                this.selectDrawing(drawing);
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


        this.containerRef.current.addEventListener('emojiDoubleClick', (e: any) => {
            const emojiId = e.detail.emojiId;
        });
    }

    public deserializeDrawings(data: string) {
        try {
            const drawings = JSON.parse(data);
            if (Array.isArray(drawings)) {
                this.allDrawings = drawings;
                if (this.textManager) {
                    this.textManager.renderAllTexts(drawings);
                }
                if (this.emojiManager) {
                    drawings.filter(d => d.type === 'emoji').forEach(drawing => {
                        this.emojiManager!.updateEmoji(drawing);
                    });
                }
                this.saveToHistory('');
                this.redrawCanvas();
            }
        } catch (error) {
        }
    }


    componentDidMount() {
        this.setupDrawingEvents();

        this.setupDocumentMouseTracking();

        this.initializeDrawingManager();
        this.setupCanvas();
        this.initializeTextManager();
        this.setupTextManagerEvents();
        this.initializeEmojiManager();
        this.setupEmojiManagerEvents();
        this.saveToHistory('init');
        this.setupChartCoordinateListener();
        // 初始化 DataPointManager
        this.initializeDataPointManager();
        // 初始化覆盖物管理器
        if (this.containerRef.current) {
            this.overlayManager = new OverlayManager(this.containerRef.current);
            // 设置图表上下文（现在只需要传入基本数据）
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


                this.props.chartSeries?.series.attachPrimitive(mark);
                this.props.chartSeries?.series.attachPrimitive(mark2);
                this.props.chartSeries?.series.attachPrimitive(mark3);
                this.props.chartSeries?.series.attachPrimitive(mark4);
                this.props.chartSeries?.series.attachPrimitive(mark5);
                this.props.chartSeries?.series.attachPrimitive(mark6);

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
    }

    // 初始化 DataPointManager
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

    private initializeTextManager() {
        if (this.containerRef.current) {
            this.textManager = new TextManager(
                this.containerRef.current,
                this.props.currentTheme,
                this.props.onTextClick
            );
            const textDrawings = this.allDrawings.filter(d => d.type === 'text');
            if (textDrawings.length > 0) {
                this.textManager.renderAllTexts(textDrawings);
            }
        }
    }


    private setupTextManagerEvents() {
        if (!this.containerRef.current || !this.textManager) return;
        this.containerRef.current.addEventListener('textSelected', (e: any) => {
            const textId = e.detail.textId;
            const drawing = this.allDrawings.find(d => d.id === textId);
            if (drawing && drawing.type === 'text') {

                this.handleEditText(drawing);
            }
        });

        this.containerRef.current.addEventListener('textSelectedForDrawing', (e: any) => {
            const { textId, drawing } = e.detail;
            this.selectDrawing(drawing);
        });

        this.containerRef.current.addEventListener('textDoubleClick', (e: any) => {
            const textId = e.detail.textId;
            const drawing = this.allDrawings.find(d => d.id === textId);
            if (drawing && drawing.points.length > 0) {
                this.handleEditText();
            }
        });

        this.containerRef.current.addEventListener('textUpdated', (e: any) => {
            this.saveToHistory('');
        });
    }


    componentDidUpdate(prevProps: ChartLayerProps, prevState: ChartLayerState) {
        if (prevProps.activeTool !== this.props.activeTool) {
            this.updateCursorStyle();
            this.deselectAll();
        }

        if (this.state.isDrawing !== prevState.isDrawing ||
            this.state.drawingPoints !== prevState.drawingPoints ||
            this.state.selectedDrawing !== prevState.selectedDrawing) {
            this.redrawCanvas();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleDocumentMouseMove);
        if (this.textManager) {
            this.textManager.destroy();
        }
        if (this.emojiManager) {

        }
        this.cleanupDrawingEvents();
        if (this.drawingManager) {
            this.drawingManager.destroy();
        }
        if (this.doubleClickTimeout) {
            clearTimeout(this.doubleClickTimeout);
        }
        if (this.overlayManager) {
            this.overlayManager.destroy();
        }
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


    private handleMouseDown = (event: MouseEvent) => {
        if (!this.containerRef.current || !this.containerRef.current.contains(event.target as Node)) {
            return;
        }
        const point = this.getMousePosition(event);
        if (!point) return;
        if (this.state.isTextInputActive) {
            this.saveTextInput();
            this.handleCloseDrawing();
            return;
        }
        const target = event.target as HTMLElement;
        const isTextElement = target.closest('.drawing-text-element');
        const isTextHandle = target.classList.contains('text-resize-handle');
        if (isTextElement || isTextHandle) {
            return;
        }
        if (this.textManager) {
            this.textManager.clearSelection();
        }
        if (this.emojiManager) {
            this.emojiManager.clearSelection();
        }
        if (this.isPointInOperationToolbar(point)) {
            if (this.state.selectedDrawing) {
                this.setState({
                    isDraggingToolbar: true,
                    dragStartPoint: point
                });
            }
            return;
        }
        if (this.state.selectedDrawing) {
            const handle = DrawingOperations.getResizeHandleAtPoint(point, this.state.selectedDrawing, this.drawingConfigs);
            if (handle) {
                this.setState({
                    isResizing: true,
                    resizeHandle: handle,
                    dragStartPoint: point
                });
                return;
            }
        }
        const selected = DrawingOperations.findDrawingAtPoint(point, this.allDrawings, this.drawingConfigs);
        if (selected && selected.type !== 'text' && selected.type !== 'emoji') {
            this.selectDrawing(selected);
            if (this.props.onToolSelect) {
                this.props.onToolSelect(selected.type);
            }

            this.setState({
                isDragging: true,
                dragStartPoint: point
            });
            return;
        }
        if (this.props.activeTool === 'text' && this.isFirstTimeTextMode) {
            this.startTextInput(point);
            this.isFirstTimeTextMode = false;
            return;
        }
        if (this.props.activeTool === 'emoji' && this.isFirstTimeEmojiMode) {
            const emojiToUse = this.props.selectedEmoji || this.state.selectedEmoji;
            const drawingId = `emoji_${Date.now()}`;
            const drawing: Drawing = {
                id: drawingId,
                type: 'emoji',
                points: [point],
                color: this.props.currentTheme.chart.lineColor,
                lineWidth: 1,
                rotation: 0,
                properties: {
                    ...createDefaultEmojiProperties(),
                    emoji: emojiToUse
                }
            };
            this.allDrawings.push(drawing);
            if (this.emojiManager) {
                this.emojiManager.updateEmoji(drawing);
            } else {
            }
            this.selectDrawing(drawing);
            if (this.props.onToolSelect) {
                this.props.onToolSelect('emoji');
            }
            this.saveToHistory('');
            this.isFirstTimeEmojiMode = false;
            return;
        }
        if ((this.props.activeTool === 'text' && !this.isFirstTimeTextMode) ||
            (this.props.activeTool === 'emoji' && !this.isFirstTimeEmojiMode)) {
            this.handleCloseDrawing();
            return;
        }
        if (this.props.activeTool && this.props.activeTool !== 'text' && this.props.activeTool !== 'emoji') {
            this.setState({
                isDrawing: true,
                drawingPoints: [point],
                drawingStartPoint: point,
                selectedDrawing: null
            });
        } else {

            this.deselectAll();
            if (this.props.onCloseDrawing) {
                this.props.onCloseDrawing();
            }
        }
    };

    private saveEmojiInput = () => {
        const { emojiInputPosition, editingEmojiId } = this.state;
        const emojiToUse = this.props.selectedEmoji || this.state.selectedEmoji;
        if (!emojiInputPosition) return;
        if (editingEmojiId) {
            const drawingToEdit = this.allDrawings.find(d => d.id === editingEmojiId);
            if (drawingToEdit && drawingToEdit.type === 'emoji') {
                const updatedDrawing = {
                    ...drawingToEdit,
                    properties: {
                        ...drawingToEdit.properties,
                        emoji: emojiToUse
                    }
                };
                this.allDrawings = this.allDrawings.map(d =>
                    d.id === editingEmojiId ? updatedDrawing : d
                );
                if (this.emojiManager) {
                    this.emojiManager.updateEmoji(updatedDrawing);
                }
                this.setState({
                    selectedDrawing: updatedDrawing
                });
                this.saveToHistory('编辑表情');
            }
        } else {
            const drawingId = `emoji_${Date.now()}`;
            const drawing: Drawing = {
                id: drawingId,
                type: 'emoji',
                points: [emojiInputPosition],
                color: this.props.currentTheme.chart.lineColor,
                lineWidth: 1,
                rotation: 0,
                properties: {
                    ...createDefaultEmojiProperties(),
                    emoji: emojiToUse
                }
            };
            this.allDrawings.push(drawing);
            if (this.emojiManager) {
                this.emojiManager.updateEmoji(drawing);
            }
            if (this.props.onDrawingComplete) {
                const chartDrawing: DrawingShape = {
                    id: drawingId,
                    type: 'emoji',
                    points: [{
                        time: this.coordinateToTime(emojiInputPosition.x),
                        price: this.coordinateToPrice(emojiInputPosition.y)
                    }],
                    properties: {
                        emoji: emojiToUse,
                        fontSize: 24
                    }
                };
                this.props.onDrawingComplete(chartDrawing);
            }
            this.saveToHistory('添加表情');
        }
        this.cancelEmojiInput();
    };

    private cancelEmojiInput = () => {
        this.setState({
            isEmojiInputActive: false,
            emojiInputPosition: null,
            editingEmojiId: null
        });
    };

    private startTextInput = (position: Point) => {
        const cursorTimer = setInterval(() => {
            this.setState(prevState => ({
                textInputCursorVisible: !prevState.textInputCursorVisible
            }));
        }, 500);

        this.setState({
            isTextInputActive: true,
            textInputPosition: position,
            textInputValue: '',
            textInputCursorVisible: true,
            textInputCursorTimer: cursorTimer,
            editingTextId: null
        });
    };

    private saveTextInput = () => {
        const { textInputValue, textInputPosition, textInputCursorTimer, editingTextId } = this.state;
        if (!textInputValue.trim()) {
            this.cancelTextInput();
            return;
        }
        if (textInputCursorTimer) {
            clearInterval(textInputCursorTimer);
        }
        if (textInputValue.trim() && textInputPosition) {
            if (editingTextId) {
                const oldDrawing = this.allDrawings.find(d => d.id === editingTextId);
                if (oldDrawing && oldDrawing.type === 'text') {
                    this.allDrawings = this.allDrawings.filter(d => d.id !== editingTextId);
                    if (this.textManager) {
                        this.textManager.removeText(editingTextId);
                    }
                    const newDrawing: Drawing = {
                        id: editingTextId,
                        type: 'text',
                        points: [...oldDrawing.points],
                        color: oldDrawing.color,
                        lineWidth: oldDrawing.lineWidth,
                        rotation: oldDrawing.rotation,
                        properties: {
                            ...oldDrawing.properties,
                            text: textInputValue.trim()
                        }
                    };
                    this.allDrawings.push(newDrawing);
                    if (this.textManager) {
                        this.textManager.createText(newDrawing);
                    }
                    this.setState({
                        selectedDrawing: newDrawing
                    });
                    this.saveToHistory('编辑文字');
                }
            } else {
                const drawingId = `text_${Date.now()}`;
                const drawing: Drawing = {
                    id: drawingId,
                    type: 'text',
                    points: [textInputPosition],
                    color: this.props.currentTheme.chart.lineColor,
                    lineWidth: 1,
                    rotation: 0,
                    properties: {
                        text: textInputValue.trim(),
                        fontSize: 14,
                        isBold: false,
                        isItalic: false,
                        textAlign: 'left',
                        textBaseline: 'top',
                    }
                };
                this.allDrawings.push(drawing);
                if (this.textManager) {
                    this.textManager.createText(drawing);
                }
                if (this.props.onDrawingComplete) {
                    const chartDrawing: DrawingShape = {
                        id: drawingId,
                        type: 'text',
                        points: [{
                            time: this.coordinateToTime(textInputPosition.x),
                            price: this.coordinateToPrice(textInputPosition.y)
                        }],
                        properties: {
                            text: textInputValue.trim(),
                            color: this.props.currentTheme.chart.lineColor,
                            fontSize: 14,
                            isBold: false,
                            isItalic: false,
                        }
                    };
                    this.props.onDrawingComplete(chartDrawing);
                }
                this.saveToHistory('添加文字标注');
            }
        }
        this.setState({
            isTextInputActive: false,
            textInputPosition: null,
            textInputValue: '',
            textInputCursorVisible: false,
            textInputCursorTimer: null,
            editingTextId: null
        });
    };

    private cancelTextInput = () => {
        const { textInputCursorTimer } = this.state;

        if (textInputCursorTimer) {
            clearInterval(textInputCursorTimer);
        }

        this.setState({
            isTextInputActive: false,
            textInputPosition: null,
            textInputValue: '',
            textInputCursorVisible: false,
            textInputCursorTimer: null,
            editingTextId: null
        });
    };

    private updateTextInput = (value: string) => {
        this.setState({ textInputValue: value });
    };

    private handleEditText = (drawing?: Drawing) => {
        const textDrawing = drawing || this.state.selectedDrawing;

        if (textDrawing && textDrawing.type === 'text' && textDrawing.points.length > 0) {

            if (this.state.textInputCursorTimer) {
                clearInterval(this.state.textInputCursorTimer);
            }

            const cursorTimer = setInterval(() => {
                this.setState(prevState => ({
                    textInputCursorVisible: !prevState.textInputCursorVisible
                }));
            }, 500);


            this.setState({
                isTextInputActive: true,
                textInputPosition: { ...textDrawing.points[0] },
                textInputValue: textDrawing.properties?.text || '',
                textInputCursorVisible: true,
                textInputCursorTimer: cursorTimer,
                editingTextId: textDrawing.id,
                isDragging: false,
                dragStartPoint: null
            });
        }
    };


    private handleTextSave = (text: string) => {
        const { selectedDrawing, editingTextId } = this.state;
        if (!text.trim()) {
            this.cancelTextInput();
            return;
        }
        const isEditMode = !!editingTextId || (selectedDrawing && selectedDrawing.type === 'text');
        const textIdToEdit = editingTextId || (selectedDrawing?.id);
        if (isEditMode && textIdToEdit) {
            const drawingToEdit = this.allDrawings.find(d => d.id === textIdToEdit);
            if (!drawingToEdit) {
                this.cancelTextInput();
                return;
            }
            const updatedDrawing = {
                ...drawingToEdit,
                properties: {
                    ...drawingToEdit.properties,
                    text: text.trim()
                }
            };
            this.allDrawings = this.allDrawings.map(d =>
                d.id === textIdToEdit ? updatedDrawing : d
            );


            if (this.textManager) {
                const textElement = this.textManager.getTextElement(textIdToEdit);
                if (textElement) {
                    this.textManager.updateText(textElement, updatedDrawing);
                } else {
                    this.textManager.createText(updatedDrawing);
                }
            }


            this.setState({
                selectedDrawing: updatedDrawing
            });

            this.saveToHistory('编辑文字');

        } else {

            const drawingId = `text_${Date.now()}`;
            const drawing: Drawing = {
                id: drawingId,
                type: 'text',
                points: [this.state.textInputPosition!],
                color: this.props.currentTheme.chart.lineColor,
                lineWidth: 1,
                rotation: 0,
                properties: {
                    text: text.trim(),
                    fontSize: 14,
                    isBold: false,
                    isItalic: false,
                    textAlign: 'left',
                    textBaseline: 'top',
                }
            };


            this.allDrawings.push(drawing);
            if (this.textManager) {
                this.textManager.createText(drawing);
            }
            if (this.props.onDrawingComplete) {
                const chartDrawing: DrawingShape = {
                    id: drawingId,
                    type: 'text',
                    points: [{
                        time: this.coordinateToTime(this.state.textInputPosition!.x),
                        price: this.coordinateToPrice(this.state.textInputPosition!.y)
                    }],
                    properties: {
                        text: text.trim(),
                        color: this.props.currentTheme.chart.lineColor,
                        fontSize: 14,
                        isBold: false,
                        isItalic: false,
                    }
                };
                this.props.onDrawingComplete(chartDrawing);
            }
            this.saveToHistory('');
        }

        this.setState({
            isTextInputActive: false,
            textInputPosition: null,
            textInputValue: '',
            textInputCursorVisible: false,
            textInputCursorTimer: null,
            editingTextId: null
        });

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


    private handleMouseMove = (event: MouseEvent) => {
        const point = this.getMousePosition(event);
        if (!point) return;
        if (!this.props.activeTool) {
            return;
        }
        if (this.state.isDraggingToolbar && this.state.dragStartPoint) {
            const deltaX = point.x - this.state.dragStartPoint.x;
            const deltaY = point.y - this.state.dragStartPoint.y;
            this.setState(prevState => ({
                operationToolbarPosition: {
                    x: prevState.operationToolbarPosition.x + deltaX,
                    y: prevState.operationToolbarPosition.y + deltaY
                },
                dragStartPoint: point
            }));
            return;
        }
        if (this.state.isDragging && this.state.selectedDrawing && this.state.dragStartPoint) {
            const deltaX = point.x - this.state.dragStartPoint.x;
            const deltaY = point.y - this.state.dragStartPoint.y;
            this.moveSelectedDrawing(deltaX, deltaY);
            this.setState({ dragStartPoint: point });
            return;
        }
        if (this.state.isResizing && this.state.selectedDrawing && this.state.dragStartPoint && this.state.resizeHandle) {
            const deltaX = point.x - this.state.dragStartPoint.x;
            const deltaY = point.y - this.state.dragStartPoint.y;
            this.resizeSelectedDrawing(deltaX, deltaY, this.state.resizeHandle);
            this.setState({ dragStartPoint: point });
            return;
        }
        const { isDrawing, drawingStartPoint } = this.state;
        const { activeTool } = this.props;
        if (isDrawing && activeTool && drawingStartPoint) {
            const currentPoints = DrawingOperations.calculateDrawingPoints(
                drawingStartPoint,
                point,
                activeTool,
                this.drawingConfigs
            );
            this.setState({
                drawingPoints: currentPoints
            }, () => {
                this.redrawCanvas();
            });
        }
    };


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
    // 修正全量价格范围计算方法
    private getChartPriceRange = (): { min: number; max: number } | null => {
        const { chartData } = this.props;
        if (!chartData || chartData.length === 0) return null;

        let minPrice = Number.MAX_VALUE;
        let maxPrice = Number.MIN_VALUE;

        // 遍历所有数据点找到真正的最高价和最低价
        chartData.forEach(item => {
            if (item.high > maxPrice) maxPrice = item.high;
            if (item.low < minPrice) minPrice = item.low;
        });

        // 如果数据异常，使用默认值
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


    private moveSelectedDrawing(deltaX: number, deltaY: number) {
        if (!this.state.selectedDrawing) return;

        const updatedDrawings = this.allDrawings.map(drawing => {
            if (drawing.id === this.state.selectedDrawing!.id) {
                if (drawing.type === 'text') {

                    const updatedDrawing = DrawingOperations.moveText(drawing, deltaX, deltaY);
                    if (this.textManager) {
                        const textElement = this.textManager.getTextElement(drawing.id);
                        if (textElement) {
                            this.textManager.updateTextPosition(textElement, updatedDrawing.points[0]);
                        }
                    }
                    return updatedDrawing;
                } else if (drawing.type === 'emoji') {


                    return DrawingOperations.moveDrawing(drawing, deltaX, deltaY);
                } else {
                    return DrawingOperations.moveDrawing(drawing, deltaX, deltaY);
                }
            }
            return drawing;
        });

        this.allDrawings = updatedDrawings;
        this.setState({
            selectedDrawing: updatedDrawings.find(d => d.id === this.state.selectedDrawing!.id) || null
        });
    }

    private resizeSelectedDrawing(deltaX: number, deltaY: number, handle: string) {
        if (!this.state.selectedDrawing) return;

        const updatedDrawing = DrawingOperations.resizeDrawing(
            this.state.selectedDrawing,
            deltaX,
            deltaY,
            handle
        );
        const updatedDrawings = this.allDrawings.map(d =>
            d.id === this.state.selectedDrawing!.id ? updatedDrawing : d
        );

        this.allDrawings = updatedDrawings;
        this.setState({
            selectedDrawing: updatedDrawing
        });
        this.redrawCanvas();
    }




    private handleMouseUp = (event: MouseEvent) => {
        const {
            isDrawing,
            drawingStartPoint,
            selectedDrawing,
            isTextInputActive
        } = this.state;
        const { activeTool } = this.props;


        if (isTextInputActive) {
            return;
        }


        if (event.detail === 2) {
            if (selectedDrawing && selectedDrawing.type === 'text') {
                this.setState({
                    isDragging: false,
                    dragStartPoint: null,
                    editingTextId: selectedDrawing.id
                }, () => {
                    this.handleEditText();
                });
                return;
            }
        }


        if (this.state.isDraggingToolbar) {
            this.setState({
                isDraggingToolbar: false,
                dragStartPoint: null
            });
            return;
        }

        if (this.state.isDragging) {
            this.setState({
                isDragging: false,
                dragStartPoint: null
            });
            this.saveToHistory('移动图形');
            return;
        }

        if (this.state.isResizing) {
            this.setState({
                isResizing: false,
                resizeHandle: null,
                dragStartPoint: null
            });
            this.saveToHistory('调整图形大小');
            return;
        }

        if (isDrawing && activeTool && drawingStartPoint) {
            const point = this.getMousePosition(event);
            if (!point) return;

            const finalPoints = this.calculateDrawingPoints(drawingStartPoint, point, activeTool);

            if (finalPoints.length > 0) {
                this.finalizeDrawing(finalPoints, activeTool);
            }

            this.setState({
                isDrawing: false,
                drawingPoints: [],
                drawingStartPoint: null
            });
        }
    };


    private calculateDrawingPoints(
        startPoint: { x: number; y: number } | null,
        currentPoint: { x: number; y: number },
        tool: string
    ): Array<{ x: number; y: number }> {
        if (!startPoint) return [];

        const config = this.drawingConfigs.get(tool);
        if (config) {
            if (config.maxPoints === 1) {
                return [startPoint];
            } else if (config.maxPoints === 2) {
                return [startPoint, currentPoint];
            }
        }

        return [startPoint];
    }


    private selectDrawing = (drawing: Drawing) => {

        if (this.state.selectedDrawing && this.state.selectedDrawing.id === drawing.id) {
            return;
        }


        let toolbarPosition = { x: 20, y: 20 };
        if (drawing.points.length > 0) {
            toolbarPosition = {
                x: Math.max(10, drawing.points[0].x - 100),
                y: Math.max(10, drawing.points[0].y - 50)
            };
        }

        this.setState({
            selectedDrawing: drawing,
            operationToolbarPosition: toolbarPosition,
            isFirstTimeEmojiMode: drawing.type === 'emoji' ? false : this.state.isFirstTimeEmojiMode,
            isFirstTimeTextMode: drawing.type === 'text' ? false : this.state.isFirstTimeTextMode
        }, () => {
            console.log('selectDrawing 完成，新状态:', {
                selectedDrawing: this.state.selectedDrawing,
                operationToolbarPosition: this.state.operationToolbarPosition
            });
        });


        if (this.props.onToolSelect) {
            this.props.onToolSelect(drawing.type);
        }
    };


    private deselectAll() {
        this.setState({ selectedDrawing: null });
    }

    private isPointInOperationToolbar(point: Point): boolean {
        const { selectedDrawing, operationToolbarPosition, activePanel } = this.state;
        if (!selectedDrawing) return false;


        const toolbarWidth = 400;
        const toolbarHeight = 50;
        const panelWidth = 250;
        const panelHeight = 150;
        const panelGap = 8;

        const hasActivePanel = activePanel !== null;


        const inMainToolbar = point.x >= operationToolbarPosition.x &&
            point.x <= operationToolbarPosition.x + toolbarWidth &&
            point.y >= operationToolbarPosition.y &&
            point.y <= operationToolbarPosition.y + toolbarHeight;


        const inPanel = hasActivePanel &&
            point.x >= operationToolbarPosition.x &&
            point.x <= operationToolbarPosition.x + panelWidth &&
            point.y >= operationToolbarPosition.y + toolbarHeight + panelGap &&
            point.y <= operationToolbarPosition.y + toolbarHeight + panelGap + panelHeight;

        return inMainToolbar || inPanel;
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


    private finalizeDrawing = (points: Array<{ x: number; y: number }>, tool: string) => {
        const { currentTheme, onDrawingComplete } = this.props;

        const drawingId = `drawing_${Date.now()}`;
        const drawing: Drawing = {
            id: drawingId,
            type: tool,
            points: points,
            color: currentTheme.chart.lineColor,
            lineWidth: tool === 'line' ? 2 : 1,
            rotation: 0
        };

        this.allDrawings.push(drawing);

        if (onDrawingComplete) {
            const chartDrawing: DrawingShape = {
                id: drawingId,
                type: tool,
                points: points.map(p => ({
                    time: this.coordinateToTime(p.x),
                    price: this.coordinateToPrice(p.y)
                })),
                properties: {
                    color: currentTheme.chart.lineColor,
                    lineWidth: tool === 'line' ? 2 : 1
                }
            };
            onDrawingComplete(chartDrawing);
        }

        this.saveToHistory(`绘制${this.getToolName(tool)}`);
        this.redrawCanvas();
    };

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


            if (this.textManager) {
                this.textManager.renderAllTexts(drawings);
            }

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


            if (this.textManager) {
                this.textManager.renderAllTexts(drawings);
            }

            this.setState({
                historyIndex: this.historyManager.getHistoryIndex(),
                selectedDrawing: null
            });
            this.redrawCanvas();
        }
    };

    private deleteSelectedDrawing = () => {
        if (!this.state.selectedDrawing) return;

        const drawing = this.state.selectedDrawing;


        if (drawing.type === 'text' && this.textManager) {
            this.textManager.removeText(drawing.id);
        }

        if (drawing.type === 'emoji' && this.emojiManager) {
            this.emojiManager.removeEmoji(drawing.id);
        }
        this.allDrawings = this.allDrawings.filter(d => d.id !== drawing.id);
        this.saveToHistory(`删除${this.getToolName(drawing.type)}`);
        this.setState({ selectedDrawing: null });



        if (drawing.type !== 'text' && drawing.type !== 'emoji') {
            this.redrawCanvas();
        }
    };

    private changeDrawingColor = (color: string) => {
        if (!this.state.selectedDrawing) return;
        const updatedDrawings = this.allDrawings.map(drawing => {
            if (drawing.id === this.state.selectedDrawing!.id) {
                return { ...drawing, color };
            }
            return drawing;
        });
        this.allDrawings = updatedDrawings;
        this.setState({
            selectedDrawing: updatedDrawings.find(d => d.id === this.state.selectedDrawing!.id) || null
        });
        this.saveToHistory('修改图形颜色');
        this.redrawCanvas();
    };

    private updateCursorStyle = () => {
        if (!this.containerRef.current) return;
        const container = this.containerRef.current;
        if (this.props.activeTool) {
            container.style.cursor = 'crosshair';
        } else {
            container.style.cursor = 'default';
        }
    };

    private handleCloseDrawing = () => {
        this.setState({
            selectedDrawing: null,
            isDragging: false,
            isResizing: false,
            isDrawing: false,
            drawingPoints: [],
            isTextInputActive: false,
            textInputPosition: null,
            textInputValue: '',
            isEmojiInputActive: false,
            emojiInputPosition: null
        });
        this.isFirstTimeTextMode = false;
        this.isFirstTimeEmojiMode = false;
        if (this.props.onToolSelect) {
            this.props.onToolSelect('');
        }
        if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
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
        container.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    private cleanupDrawingEvents() {
        if (!this.containerRef.current) return;
        const container = this.containerRef.current;
        container.removeEventListener('mousedown', this.handleMouseDown);
        container.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    private handleTextInputBlur = () => {
        const { isTextInputActive, textInputValue, selectedDrawing } = this.state;
        if (isTextInputActive && selectedDrawing && selectedDrawing.type === 'text') {
            if (textInputValue.trim()) {
                this.handleTextSave(textInputValue);
            } else {
                this.cancelTextInput();
            }
        }
    };

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
            isTextInputActive,
            textInputPosition,
            textInputValue,
            textInputCursorVisible,
            isEmojiInputActive,
            emojiInputPosition,
            selectedEmoji
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
                        overflow: 'hidden'
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
                        <TextInputComponent
                            isActive={isTextInputActive}
                            position={textInputPosition}
                            value={textInputValue}
                            theme={currentTheme}
                            cursorVisible={textInputCursorVisible}
                            onChange={this.updateTextInput}
                            onSave={this.handleTextSave}
                            onCancel={this.cancelTextInput}
                            onBlur={this.handleTextInputBlur}
                            isEditMode={!!this.state.editingTextId}
                        />
                        {isEmojiInputActive && emojiInputPosition && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${emojiInputPosition.x}px`,
                                    top: `${emojiInputPosition.y}px`,
                                    background: currentTheme.toolbar.background,
                                    border: `1px solid ${currentTheme.toolbar.border}`,
                                    borderRadius: '4px',
                                    padding: '8px',
                                    zIndex: 100,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <span style={{ fontSize: '24px' }}>{selectedEmoji}</span>
                                <button
                                    onClick={this.saveEmojiInput}
                                    style={{
                                        background: currentTheme.toolbar.button.active,
                                        border: 'none',
                                        borderRadius: '2px',
                                        color: currentTheme.toolbar.button.activeTextColor,
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    确认
                                </button>
                                <button
                                    onClick={this.cancelEmojiInput}
                                    style={{
                                        background: 'transparent',
                                        border: `1px solid ${currentTheme.toolbar.border}`,
                                        borderRadius: '2px',
                                        color: currentTheme.layout.textColor,
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    取消
                                </button>
                            </div>
                        )}
                        {selectedDrawing && (
                            <DrawingOperationToolbar
                                position={operationToolbarPosition}
                                selectedDrawing={selectedDrawing}
                                theme={currentTheme}
                                onClose={() => this.setState({ selectedDrawing: null, activePanel: null })}
                                onDelete={this.deleteSelectedDrawing}
                                onUndo={this.undo}
                                onRedo={this.redo}
                                onChangeColor={this.changeDrawingColor}
                                onEditText={this.handleEditText}
                                canUndo={canUndo}
                                canRedo={canRedo}
                                onDragStart={(point) => this.setState({
                                    isDraggingToolbar: true,
                                    dragStartPoint: point
                                })}
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