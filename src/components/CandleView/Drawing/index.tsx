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
import { TextManager } from './TextManager';
import { TextInputComponent } from './TextInputComponent';


export interface DrawingLayerProps {
  chart: any;
  currentTheme: ThemeConfig;
  activeTool: string | null;
  onDrawingComplete?: (drawing: DrawingShape) => void;
  onCloseDrawing?: () => void;
  // 新增：工具选择回调
  onToolSelect?: (tool: string) => void;
  onTextClick?: (toolId: string) => void; // 新增
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

  // 文字输入相关状态
  isTextInputActive: boolean;
  textInputPosition: Point | null;
  textInputValue: string;
  textInputCursorVisible: boolean;
  textInputCursorTimer: NodeJS.Timeout | null;

  activePanel: null;

  editingTextId: string | null; // 添加 editingTextId 属性
  // 添加这个属性
  isFirstTimeTextMode: boolean;
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

      // 文字输入相关状态
      isTextInputActive: false,
      textInputPosition: null,
      textInputValue: '',
      textInputCursorVisible: true,
      textInputCursorTimer: null,



      activePanel: null, // 添加活动面板状态
      editingTextId: null, // 添加初始值


      // 初始化这个属性
      isFirstTimeTextMode: false,

    };
    this.historyManager = new HistoryManager(this.MAX_HISTORY_SIZE);
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

  public deserializeDrawings(data: string) {
    try {
      const drawings = JSON.parse(data);
      if (Array.isArray(drawings)) {
        this.allDrawings = drawings;

        // 重新渲染文字
        if (this.textManager) {
          this.textManager.renderAllTexts(drawings);
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
    this.saveToHistory('初始化');
  }

  // 在 index.tsx 的 initializeTextManager 方法中
  private initializeTextManager() {
    if (this.containerRef.current) {
      this.textManager = new TextManager(
        this.containerRef.current,  // 使用正确的引用名
        this.props.currentTheme,
        this.props.onTextClick // 传递回调
      );

      // 重新渲染现有的文字
      const textDrawings = this.allDrawings.filter(d => d.type === 'text');
      if (textDrawings.length > 0) {
        this.textManager.renderAllTexts(textDrawings);
      }
    }
  }

  // 修改 setupTextManagerEvents 方法，添加文字选择监听
  // 在 index.tsx 的 setupTextManagerEvents 方法中
  private setupTextManagerEvents() {
    if (!this.containerRef.current || !this.textManager) return;

    // 文字选择事件监听
    this.containerRef.current.addEventListener('textSelected', (e: any) => {
      const textId = e.detail.textId;
      const drawing = this.allDrawings.find(d => d.id === textId);
      if (drawing) {
        this.selectDrawing(drawing);

        if (this.props.onToolSelect) {
          this.props.onToolSelect('text');
        }

        // 设置拖动状态
        const point = this.getMousePosition(e.detail.originalEvent);
        if (point) {
          this.setState({
            isDragging: true,
            dragStartPoint: point
          });
        }
      }
    });

    // 其他事件监听保持不变
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

    // 只绘制非文字图形 - 文字由 TextManager 在 DOM 层处理
    this.allDrawings
      .filter(drawing => drawing.type !== 'text')
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

    // 只对非文字图形绘制选择框
    if (this.state.selectedDrawing && this.state.selectedDrawing.type !== 'text') {
      CanvasRenderer.drawSelection(ctx, this.state.selectedDrawing, this.drawingConfigs);
    }
  }

  // 在 index.tsx 的 handleMouseDown 方法中，修改文字处理逻辑
  // 修改 handleMouseDown 方法
  private handleMouseDown = (event: MouseEvent) => {
    if (!this.containerRef.current || !this.containerRef.current.contains(event.target as Node)) {
      return;
    }

    const target = event.target as HTMLElement;

    // 检查是否点击了操作工具栏或其子元素
    if (target.closest('.drawing-operation-toolbar') ||
      target.closest('.drawing-toolbar-panel') ||
      target.closest('[data-component="text-input"]')) {
      return;
    }

    // 检查是否点击了文字元素
    // 修改 handleMouseDown 方法，移除单击文字时自动打开编辑框的逻辑
    // 修改 handleMouseDown 方法中的文字点击处理
    const textElement = target.closest('.drawing-text-element');
    if (textElement) {
      const textId = textElement.getAttribute('data-text-id');
      if (textId) {
        const drawing = this.allDrawings.find(d => d.id === textId);
        if (drawing) {
          event.stopPropagation();
          event.preventDefault();


          // 选择该文字图形
          this.selectDrawing(drawing);

          // 设置不是第一次进入文字模式
          this.setState({ isFirstTimeTextMode: false });

          if (this.props.onToolSelect) {
            this.props.onToolSelect('text');
          }

          // 关键修改：设置拖动状态，允许文字拖动
          const point = this.getMousePosition(event);
          if (point) {
            this.setState({
              isDragging: true,
              dragStartPoint: point
            });
          }
          return;
        }
      }
    }


    const point = this.getMousePosition(event);
    if (!point) return;


    // 如果文字输入框激活，点击其他地方保存文字并退出绘图模式
    if (this.state.isTextInputActive) {
      this.saveTextInput();
      this.handleCloseDrawing(); // 直接退出绘图模式
      return;
    }

    // 关键修改：当编辑框存在时，点击其他区域直接退出模式
    if (this.props.activeTool === 'text' && this.state.isTextInputActive) {
      this.saveTextInput();
      this.handleCloseDrawing();
      return;
    }

    // 如果文字输入框激活，点击其他地方保存文字
    if (this.state.isTextInputActive) {
      this.saveTextInput();
      return;
    }

    // 检查是否点击了操作工具栏区域
    if (this.isPointInOperationToolbar(point)) {
      if (this.state.selectedDrawing) {
        this.setState({
          isDraggingToolbar: true,
          dragStartPoint: point
        });
      }
      return;
    }

    // 检查是否点击了缩放手柄
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

    // 检查是否点击了图形
    // 在 handleMouseDown 方法中，确保边界检测能正常工作
    // 检查是否点击了图形（包括通过边界检测的文字）
    const selected = DrawingOperations.findDrawingAtPoint(point, this.allDrawings, this.drawingConfigs);
    if (selected) {

      this.selectDrawing(selected);

      // 设置不是第一次进入文字模式
      this.setState({ isFirstTimeTextMode: false });

      if (selected.type === 'text' && this.props.onToolSelect) {
        this.props.onToolSelect('text');
      }

      // 如果是文字，立即打开编辑框
      if (selected.type === 'text') {
        setTimeout(() => {
          this.handleEditText();
        }, 50);
      }

      // 立即进入拖动模式
      this.setState({
        isDragging: true,
        dragStartPoint: point
      });
      return;
    }


    // 路径1：从左侧按钮首次进入文字模式
    if (this.props.activeTool === 'text' && this.isFirstTimeTextMode) {
      this.startTextInput(point);
      this.isFirstTimeTextMode = false; // 标记已经处理过第一次点击
      return;
    }

    // 路径2：第二次点击（无论编辑框状态）退出模式
    if (this.props.activeTool === 'text' && !this.isFirstTimeTextMode) {
      this.handleCloseDrawing();
      return;
    }

    // 正常的绘图逻辑（非文字模式）
    if (this.props.activeTool && this.props.activeTool !== 'text') {
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



  // 新增：处理文字图形点击激活的方法
  private handleTextDrawingActivation = (drawing: Drawing, event: MouseEvent) => {

    // 选择该文字图形
    this.selectDrawing(drawing);

    // 切换到文字绘图模式
    if (this.props.onToolSelect) {
      this.props.onToolSelect('text');
    }

    // 设置拖动状态，允许立即拖动
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
      editingTextId: null // 确保是新创建文字
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
        // 编辑模式：删除原有文字，创建新文字

        // 1. 获取原有文字的属性
        const oldDrawing = this.allDrawings.find(d => d.id === editingTextId);
        if (oldDrawing && oldDrawing.type === 'text') {
          // 2. 删除原有文字
          this.allDrawings = this.allDrawings.filter(d => d.id !== editingTextId);
          if (this.textManager) {
            this.textManager.removeText(editingTextId);
          }

          // 3. 创建新文字，继承原有所有属性（包括位置、颜色、字体大小等）
          const newDrawing: Drawing = {
            id: editingTextId, // 使用相同的ID
            type: 'text',
            points: [...oldDrawing.points], // 保持原有位置
            color: oldDrawing.color,
            lineWidth: oldDrawing.lineWidth,
            rotation: oldDrawing.rotation,
            properties: {
              ...oldDrawing.properties, // 继承所有原有属性
              text: textInputValue.trim() // 只更新文字内容
            }
          };


          // 4. 添加新文字
          this.allDrawings.push(newDrawing);

          // 5. 创建DOM元素
          if (this.textManager) {
            this.textManager.createText(newDrawing);
          }

          // 6. 更新选中状态
          this.setState({
            selectedDrawing: newDrawing
          });

          this.saveToHistory('编辑文字');
        }
      } else {
        // 新建模式：保持原有逻辑不变
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

    // 关闭编辑框
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
      editingTextId: null // 清除编辑状态
    });
  };

  private updateTextInput = (value: string) => {
    this.setState({ textInputValue: value });
  };


  // 在 index.tsx 中修复 handleEditText 方法
  private handleEditText = () => {
    const { selectedDrawing, editingTextId } = this.state;

    // 关键修复：确保有选中的文字图形
    const textDrawing = selectedDrawing && selectedDrawing.type === 'text' ? selectedDrawing :
      editingTextId ? this.allDrawings.find(d => d.id === editingTextId) : null;

    if (textDrawing && textDrawing.points.length > 0) {

      // 如果已经有定时器，先清除
      if (this.state.textInputCursorTimer) {
        clearInterval(this.state.textInputCursorTimer);
      }

      // 启动光标闪烁定时器
      const cursorTimer = setInterval(() => {
        this.setState(prevState => ({
          textInputCursorVisible: !prevState.textInputCursorVisible
        }));
      }, 500);

      // 设置编辑状态
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


  // 在 index.tsx 中完全重写 handleTextSave 方法
  private handleTextSave = (text: string) => {
    const { selectedDrawing, editingTextId } = this.state;


    if (!text.trim()) {
      this.cancelTextInput();
      return;
    }

    // 关键修复：明确判断是编辑模式还是新建模式
    const isEditMode = !!editingTextId || (selectedDrawing && selectedDrawing.type === 'text');
    const textIdToEdit = editingTextId || (selectedDrawing?.id);


    if (isEditMode && textIdToEdit) {
      // 编辑现有文字

      // 找到要编辑的文字图形
      const drawingToEdit = this.allDrawings.find(d => d.id === textIdToEdit);
      if (!drawingToEdit) {
        console.error('未找到要编辑的文字图形:', textIdToEdit);
        this.cancelTextInput();
        return;
      }


      // 更新文字内容
      const updatedDrawing = {
        ...drawingToEdit,
        properties: {
          ...drawingToEdit.properties,
          text: text.trim()
        }
      };


      // 更新 drawings 数组
      this.allDrawings = this.allDrawings.map(d =>
        d.id === textIdToEdit ? updatedDrawing : d
      );

      // 更新 TextManager 中的文字元素
      if (this.textManager) {
        const textElement = this.textManager.getTextElement(textIdToEdit);
        if (textElement) {
          this.textManager.updateText(textElement, updatedDrawing);
        } else {
          this.textManager.createText(updatedDrawing);
        }
      }

      // 更新选中的图形
      this.setState({
        selectedDrawing: updatedDrawing
      });

      this.saveToHistory('编辑文字');

    } else {
      // 创建新文字
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

      // 创建 DOM 文字元素
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

    // 关闭编辑框
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

    // 只有在绘制模式下才处理绘图相关的鼠标移动
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

    // 关键修改：确保文字拖动能正常工作
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
          // 文字拖动：更新文字位置
          const updatedDrawing = DrawingOperations.moveText(drawing, deltaX, deltaY);

          // 同时更新 TextManager 中的文字位置
          if (this.textManager) {
            const textElement = this.textManager.getTextElement(drawing.id);
            if (textElement) {
              this.textManager.updateTextPosition(textElement, updatedDrawing.points[0]);
            }
          }

          return updatedDrawing;
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

    // 如果是文字，不需要重绘画布，因为文字是通过 DOM 渲染的
    if (this.state.selectedDrawing.type !== 'text') {
      this.redrawCanvas();
    }
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


  // 修改 handleMouseUp 方法中的双击处理
  private handleMouseUp = (event: MouseEvent) => {
    const { isDrawing, drawingStartPoint, selectedDrawing, isTextInputActive } = this.state;
    const { activeTool } = this.props;

    // 如果文字输入框激活，不处理其他鼠标事件
    if (isTextInputActive) {
      return;
    }

    // 处理双击事件
    // 处理双击事件
    if (event.detail === 2) {

      if (selectedDrawing && selectedDrawing.type === 'text') {

        // 关键修复：确保 editingTextId 正确设置
        this.setState({
          isDragging: false,
          dragStartPoint: null,
          editingTextId: selectedDrawing.id // 明确设置要编辑的文字ID
        }, () => {
          // 直接调用编辑方法，不延迟
          this.handleEditText();
        });
        return;
      }
    }



    // 原有的其他处理逻辑保持不变
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

  // 修改选择图形方法，确保文字被正确选择
  // 在 selectDrawing 方法中设置操作工具栏位置
  // 修改 selectDrawing 方法
  private selectDrawing = (drawing: Drawing) => {

    // 如果已经选中了这个图形，就不重新设置位置
    if (this.state.selectedDrawing && this.state.selectedDrawing.id === drawing.id) {
      return;
    }

    // 设置操作工具栏位置在图形附近
    let toolbarPosition = { x: 20, y: 20 };
    if (drawing.points.length > 0) {
      toolbarPosition = {
        x: Math.max(10, drawing.points[0].x - 100),
        y: Math.max(10, drawing.points[0].y - 50)
      };
    }

    this.setState({
      selectedDrawing: drawing,
      operationToolbarPosition: toolbarPosition
    });

  };

  private deselectAll() {
    this.setState({ selectedDrawing: null });
  }

  private isPointInOperationToolbar(point: Point): boolean {
    const { selectedDrawing, operationToolbarPosition, activePanel } = this.state;
    if (!selectedDrawing) return false;

    // 估算工具栏和可能展开的面板大小
    const toolbarWidth = 400;
    const toolbarHeight = 50;
    const panelWidth = 250;
    const panelHeight = 150;
    const panelGap = 8;

    const hasActivePanel = activePanel !== null;

    // 检查是否在主工具栏区域内
    const inMainToolbar = point.x >= operationToolbarPosition.x &&
      point.x <= operationToolbarPosition.x + toolbarWidth &&
      point.y >= operationToolbarPosition.y &&
      point.y <= operationToolbarPosition.y + toolbarHeight;

    // 检查是否在展开的面板区域内
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

      // 重新渲染文字
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

      // 重新渲染文字
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

    // 如果是文字，从文字管理器中删除
    if (drawing.type === 'text' && this.textManager) {
      this.textManager.removeText(drawing.id);
    }

    this.allDrawings = this.allDrawings.filter(d => d.id !== drawing.id);
    this.saveToHistory(`删除${this.getToolName(drawing.type)}`);
    this.setState({ selectedDrawing: null });

    // 只有非文字图形需要重绘画布
    if (drawing.type !== 'text') {
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

    // 重置所有状态
    this.setState({
      selectedDrawing: null,
      isDragging: false,
      isResizing: false,
      isDrawing: false,
      drawingPoints: [],
      isTextInputActive: false,
      textInputPosition: null,
      textInputValue: ''
    });

    // 重置第一次进入标志
    this.isFirstTimeTextMode = false;

    // 通知父组件
    if (this.props.onCloseDrawing) {
      this.props.onCloseDrawing();
    }
  };


  private clearAllDrawings = () => {
    // 清除文字元素
    if (this.textManager) {
      this.textManager.clearAll();
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
    // 只有在编辑模式下，点击其他区域才自动保存
    const { isTextInputActive, textInputValue, selectedDrawing } = this.state;

    if (isTextInputActive && selectedDrawing && selectedDrawing.type === 'text') {
      // 编辑模式下，点击其他区域自动保存
      if (textInputValue.trim()) {
        this.handleTextSave(textInputValue);
      } else {
        this.cancelTextInput();
      }
    }
    // 新建模式下，点击其他区域不自动保存，保持输入状态
  };


  // 在 render 方法中，检查操作工具栏的渲染条件
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
      isFirstTimeTextMode
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
          isEditMode={!!this.state.editingTextId} // 使用 editingTextId 来判断是否是编辑模式
        />

        {/* 操作工具栏 - 确保条件正确 */}
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