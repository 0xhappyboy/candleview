import React from 'react';
import { DrawingToolsManager, DrawingShape } from './DrawingManager';
import { drawingConfigs, registerDrawingConfig, unregisterDrawingConfig, DrawingConfig } from './DrawingConfigs';
import { CanvasRenderer } from './CanvasRenderer';
import { HistoryManager } from './HistoryManager';
import { DrawingOperations } from './DrawingOperations';
import { DrawingToolbar } from './DrawingToolbar';
import { Drawing, Point, HistoryRecord } from './types';
import { DrawingOperationToolbar } from './DrawingOperationToolbar';
import { ThemeConfig } from '../CandleViewTheme';
import { TextManager } from './Text/TextManager';
import { TextInputComponent } from './Text/TextInputComponent';
import { createDefaultEmojiProperties } from './Emoji/EmojiConfig';
import { EmojiManager } from './Emoji/EmojiManager';

export interface DrawingLayerProps {
  chart: any;
  currentTheme: ThemeConfig;
  activeTool: string | null;
  onDrawingComplete?: (drawing: DrawingShape) => void;
  onCloseDrawing?: () => void;
  onToolSelect?: (tool: string) => void;
  onTextClick?: (toolId: string) => void;
  onEmojiClick?: (toolId: string) => void;
    
  selectedEmoji?: string;
}

export interface DrawingLayerState {
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
}

class DrawingLayer extends React.Component<DrawingLayerProps, DrawingLayerState> {
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

  constructor(props: DrawingLayerProps) {
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

    };
    this.historyManager = new HistoryManager(this.MAX_HISTORY_SIZE);
  }



  public setFirstTimeEmojiMode = (isFirstTime: boolean) => {
    this.isFirstTimeEmojiMode = isFirstTime;
  };


  private handleEmojiSelect = (drawingId: string, event: MouseEvent) => {


    console.log('Emoji 选择回调:', drawingId);
  };


  private handleEmojiDragStart = (drawingId: string, event: MouseEvent) => {
    const drawing = this.allDrawings.find(d => d.id === drawingId);
    if (drawing) {

      this.selectDrawing(drawing);


      if (this.props.onToolSelect) {
        this.props.onToolSelect('emoji');
      }


      this.setState({ isFirstTimeEmojiMode: false });


      const point = this.getMousePosition(event);
      if (point) {
        this.setState({
          isDragging: true,
          dragStartPoint: point
        });
      }
    }
  };


  
  private initializeEmojiManager() {
    if (this.containerRef.current) {
      console.log('初始化 EmojiManager，传递 onEmojiClick 回调');

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

    console.log('设置 Emoji 事件监听...');

    
    this.containerRef.current.addEventListener('emojiSelected', (e: any) => {
      console.log('Emoji 选择事件触发:', e.detail.emojiId);
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
      console.log('Emoji 双击:', emojiId);
      
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

        this.saveToHistory('加载绘图数据');
        this.redrawCanvas();
      }
    } catch (error) {
      console.error('反序列化绘图数据失败:', error);
    }
  }


  componentDidMount() {
    this.setupDrawingEvents();
    this.initializeDrawingManager();
    this.setupCanvas();
    this.initializeTextManager();
    this.setupTextManagerEvents();
    this.initializeEmojiManager();
    this.setupEmojiManagerEvents();
    this.saveToHistory('初始化');
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
      if (drawing) {
        this.selectDrawing(drawing);

        if (this.props.onToolSelect) {
          this.props.onToolSelect('text');
        }


        const point = this.getMousePosition(e.detail.originalEvent);
        if (point) {
          this.setState({
            isDragging: true,
            dragStartPoint: point
          });
        }
      }
    });


    this.containerRef.current.addEventListener('textDoubleClick', (e: any) => {
      const textId = e.detail.textId;
      const drawing = this.allDrawings.find(d => d.id === textId);
      if (drawing && drawing.points.length > 0) {
        this.handleEditText();
      }
    });

    this.containerRef.current.addEventListener('textUpdated', (e: any) => {
      this.saveToHistory('更新文字');
    });
  }


  componentDidUpdate(prevProps: DrawingLayerProps, prevState: DrawingLayerState) {
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
    if (selected) {
      this.selectDrawing(selected);


      if (selected.type === 'text') {
        this.setState({ isFirstTimeTextMode: false });
        if (this.props.onToolSelect) {
          this.props.onToolSelect('text');
        }
      } else if (selected.type === 'emoji') {
        this.setState({ isFirstTimeEmojiMode: false });
        if (this.props.onToolSelect) {
          this.props.onToolSelect('emoji');
        }
      } else {

        if (this.props.onToolSelect) {
          this.props.onToolSelect(selected.type);
        }
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
      this.startEmojiInput(point);
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
    }
  };

 
  private startEmojiInput = (position: Point) => {
  console.log('开始创建 Emoji，位置:', position);
  
  
  const emojiToUse = this.props.selectedEmoji || this.state.selectedEmoji;
  
  const drawingId = `emoji_${Date.now()}`;
  const drawing: Drawing = {
    id: drawingId,
    type: 'emoji',
    points: [position],
    color: this.props.currentTheme.chart.lineColor,
    lineWidth: 1,
    rotation: 0,
    properties: {
      ...createDefaultEmojiProperties(),
      emoji: emojiToUse  
    }
  };

  console.log('创建的 Drawing 对象:', drawing);

  this.allDrawings.push(drawing);
  console.log('allDrawings 长度:', this.allDrawings.length);

  if (this.emojiManager) {
    console.log('调用 emojiManager 更新');
    this.emojiManager.updateEmoji(drawing);
  } else {
    console.log('emojiManager 不存在!');
  }

  console.log('准备选中新创建的 Emoji');
  this.selectDrawing(drawing);
  if (this.props.onToolSelect) {
    this.props.onToolSelect('emoji');
  }

  this.saveToHistory('添加表情');
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



  private handleEditEmoji = () => {
    const { selectedDrawing } = this.state;

    if (selectedDrawing && selectedDrawing.type === 'emoji') {


      this.setState({
        isDragging: false,
        dragStartPoint: null
      });
    }
  };



  private handleTextDrawingActivation = (drawing: Drawing, event: MouseEvent) => {


    this.selectDrawing(drawing);


    if (this.props.onToolSelect) {
      this.props.onToolSelect('text');
    }


    const point = this.getMousePosition(event);
    if (point) {
      this.setState({
        isDragging: true,
        dragStartPoint: point
      });
    }
  };


  private isClickOnTextInput = (target: Node): boolean => {
    let currentElement: Node | null = target;
    while (currentElement) {
      if (currentElement instanceof HTMLElement) {
        const element = currentElement as HTMLElement;
        if (
          element.tagName === 'TEXTAREA' ||
          element.getAttribute('data-component') === 'text-input' ||
          element.closest('[data-component="text-input"]')
        ) {
          return true;
        }
      }
      currentElement = currentElement.parentNode;
    }
    return false;
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



  private handleEditText = () => {
    const { selectedDrawing, editingTextId } = this.state;


    const textDrawing = selectedDrawing && selectedDrawing.type === 'text' ? selectedDrawing :
      editingTextId ? this.allDrawings.find(d => d.id === editingTextId) : null;

    if (textDrawing && textDrawing.points.length > 0) {


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

    } else {
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
        console.error('未找到要编辑的文字图形:', textIdToEdit);
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

      this.saveToHistory('添加文字标注');
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
    console.log('=== selectDrawing 开始 ===');
    console.log('要选择的 Drawing:', drawing);

    
    if (this.state.selectedDrawing && this.state.selectedDrawing.id === drawing.id) {
      console.log('已经选中了这个图形，跳过');
      return;
    }

    
    let toolbarPosition = { x: 20, y: 20 };
    if (drawing.points.length > 0) {
      toolbarPosition = {
        x: Math.max(10, drawing.points[0].x - 100),
        y: Math.max(10, drawing.points[0].y - 50)
      };
    }

    console.log('设置工具栏位置:', toolbarPosition);

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
      console.log('调用 onToolSelect:', drawing.type);
      this.props.onToolSelect(drawing.type);
    }
    console.log('=== selectDrawing 结束 ===');
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
    if (!this.containerRef.current) return null;
    const rect = this.containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
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

  private coordinateToTime(x: number): string {
    const canvas = this.canvasRef.current;
    if (!canvas) return new Date().toISOString().split('T')[0];
    const percent = x / canvas.width;
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - Math.floor((1 - percent) * 30));
    return baseDate.toISOString().split('T')[0];
  }

  private coordinateToPrice(y: number): number {
    const canvas = this.canvasRef.current;
    if (!canvas) return 100;
    const percent = 1 - (y / canvas.height);
    return 50 + (100 * percent);
  }

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



  private clearAllDrawings = () => {

    if (this.textManager) {
      this.textManager.clearAll();
    }


    if (this.emojiManager) {
      this.emojiManager.clearAll();
    }

    this.allDrawings = [];
    this.saveToHistory('清除所有绘图');
    this.setState({ selectedDrawing: null });
    this.redrawCanvas();
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
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  private cleanupDrawingEvents() {
    if (!this.containerRef.current) return;
    const container = this.containerRef.current;
    container.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
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



  render() {
    const { activeTool, currentTheme } = this.props;
    const {
      isDrawing,
      selectedDrawing,
      operationToolbarPosition,
      isDraggingToolbar,
      isTextInputActive,
      textInputPosition,
      textInputValue,
      textInputCursorVisible,
      activePanel,
      isFirstTimeTextMode,
      isEmojiInputActive,
      emojiInputPosition,
      selectedEmoji
    } = this.state;

    const canUndo = this.historyManager.canUndo();
    const canRedo = this.historyManager.canRedo();

    return (
      <div
        ref={this.containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 5,
          pointerEvents: activeTool ? 'auto' : 'none',
          opacity: activeTool ? 1 : 0.7,
        }}
      >
        <canvas
          ref={this.canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* 文字输入组件 */}
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

        {/* Emoji 输入组件 */}
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

        {/* 操作工具栏 - 确保条件正确 */}
        {/* 操作工具栏 - 添加调试信息 */}
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

        {/* 绘图模式工具栏 */}
        {activeTool && (
          <DrawingToolbar
            activeTool={activeTool}
            isDrawing={isDrawing}
            theme={currentTheme}
            onClearAll={this.clearAllDrawings}
            onCloseDrawing={this.handleCloseDrawing}
            getToolName={this.getToolName}
          />
        )}
      </div>
    );
  }

}

export { DrawingLayer };
export type { Drawing };