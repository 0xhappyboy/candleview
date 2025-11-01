import React from 'react';
import { DrawingToolsManager, DrawingShape } from './DrawingManager';
import { drawingConfigs, registerDrawingConfig, unregisterDrawingConfig, DrawingConfig } from './DrawingConfigs';
import { CanvasRenderer } from './CanvasRenderer';
import { HistoryManager } from './HistoryManager';
import { DrawingOperations } from './DrawingOperations';
import { FloatingPanel } from './FloatingPanel';
import { DrawingToolbar } from './DrawingToolbar';
import { DrawingLayerProps, DrawingLayerState, Drawing, Point } from './types';
import { TextEditorModal } from './TextEditorModal';
import { TextInputComponent } from './TextInputComponent';

class DrawingLayer extends React.Component<DrawingLayerProps, DrawingLayerState> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private containerRef = React.createRef<HTMLDivElement>();
  private drawingManager: DrawingToolsManager | null = null;
  private allDrawings: Drawing[] = [];
  private drawingConfigs = drawingConfigs;
  private historyManager: HistoryManager;
  private readonly MAX_HISTORY_SIZE = 50;
  // 添加文字编辑相关状态
  private textEditorState = {
    isTextEditorOpen: false,
    textEditorPosition: { x: 0, y: 0 },
    editingTextDrawing: null as Drawing | null,
  };

  // 添加 doubleClickTimeout 属性
  private doubleClickTimeout: NodeJS.Timeout | null = null;

  constructor(props: DrawingLayerProps) {
    super(props);
    this.state = {
      isDrawing: false,
      drawingPoints: [],
      currentDrawing: null,
      drawingStartPoint: null,
      drawings: [],
      selectedDrawing: null,
      floatingPanelPosition: { x: 20, y: 20 },
      isDraggingFloatingPanel: false,
      dragStartPoint: null,
      history: [],
      historyIndex: -1,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      resizeHandle: null,

      // 新增文字输入状态
      isTextInputActive: false,
      textInputPosition: null,
      textInputValue: '',
      textInputCursorVisible: true,
      textInputCursorTimer: null,
    };
    this.historyManager = new HistoryManager(this.MAX_HISTORY_SIZE);
  }

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
    this.saveToHistory('初始化');
    // 添加双击事件监听
    document.addEventListener('dblclick', this.handleDoubleClick);
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
    this.cleanupDrawingEvents();
    if (this.drawingManager) {
      this.drawingManager.destroy();
    }
    if (this.doubleClickTimeout) {
      clearTimeout(this.doubleClickTimeout);
    }
    // 移除双击事件监听
    document.removeEventListener('dblclick', this.handleDoubleClick);
  }

  // 添加双击事件处理
  private handleDoubleClick = (event: MouseEvent) => {
    if (!this.containerRef.current || !this.containerRef.current.contains(event.target as Node)) {
      return;
    }

    const point = this.getMousePosition(event);
    if (!point) return;

    // 检查是否双击了文字图形
    const selected = DrawingOperations.findDrawingAtPoint(point, this.allDrawings, this.drawingConfigs);
    if (selected && selected.type === 'text' && selected.points.length > 0) {
      // 打开文字编辑弹窗
      this.openTextEditor(selected.points[0], selected);
    }
  };

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

    this.allDrawings.forEach(drawing => {
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

    if (this.state.selectedDrawing) {
      CanvasRenderer.drawSelection(ctx, this.state.selectedDrawing, this.drawingConfigs);
    }
  }


  // 在 index.tsx 中修改 handleMouseDown 方法
  private handleMouseDown = (event: MouseEvent) => {
    if (!this.containerRef.current || !this.containerRef.current.contains(event.target as Node)) {
      return;
    }

    // 检查是否点击了文字输入框或其子元素
    const isClickOnTextInput = this.isClickOnTextInput(event.target as Node);
    if (isClickOnTextInput) {
      // 如果点击了文字输入框，不处理其他逻辑，允许继续输入
      return;
    }

    const point = this.getMousePosition(event);
    if (!point) return;

    // 如果文字编辑器打开，不处理其他点击事件
    if (this.textEditorState.isTextEditorOpen) {
      return;
    }

    // 如果文字输入框激活，点击其他地方保存文字
    if (this.state.isTextInputActive) {
      this.saveTextInput();
      return;
    }

    if (this.isPointInFloatingPanel(point)) {
      this.setState({
        isDraggingFloatingPanel: true,
        dragStartPoint: point
      });
      return;
    }

    // 检查是否点击了缩放手柄（优先于选择图形）
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
    const selected = DrawingOperations.findDrawingAtPoint(point, this.allDrawings, this.drawingConfigs);
    if (selected) {
      this.selectDrawing(selected);

      // 立即进入拖动模式
      this.setState({
        isDragging: true,
        dragStartPoint: point
      });
      return;
    }

    // 如果没有点击任何图形，且处于绘制模式，开始新的绘制
    if (this.props.activeTool) {
      // 如果当前是文字工具，启动文字输入
      if (this.props.activeTool === 'text') {
        this.startTextInput(point);
      } else {
        // 其他工具开始绘制
        this.setState({
          isDrawing: true,
          drawingPoints: [point],
          drawingStartPoint: point,
          selectedDrawing: null
        });
      }
    } else {
      this.deselectAll();
    }
  };


  // 检查是否点击了文字输入框
  private isClickOnTextInput = (target: Node): boolean => {
    // 检查点击目标是否是文字输入框或其子元素
    let currentElement: Node | null = target;
    while (currentElement) {
      if (currentElement instanceof HTMLElement) {
        // 检查是否是文字输入框组件
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

  // 启动文字输入
  private startTextInput = (position: Point) => {
    // 启动光标闪烁
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
    });
  };

  // 保存文字输入
  private saveTextInput = () => {
    // 添加保护，防止在输入过程中意外保存
    const { textInputValue, textInputPosition, textInputCursorTimer } = this.state;

    // 如果输入框内容为空，直接取消
    if (!textInputValue.trim()) {
      this.cancelTextInput();
      return;
    }

    // 清理光标定时器
    if (textInputCursorTimer) {
      clearInterval(textInputCursorTimer);
    }

    if (textInputValue.trim() && textInputPosition) {
      // 创建文字图形
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
      this.redrawCanvas();
    }

    // 关闭文字输入
    this.setState({
      isTextInputActive: false,
      textInputPosition: null,
      textInputValue: '',
      textInputCursorVisible: false,
      textInputCursorTimer: null,
    });
  };

  // 取消文字输入
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
    });
  };

  // 修改文字输入内容
  private updateTextInput = (value: string) => {
    this.setState({ textInputValue: value });
  };

  // 添加打开文字编辑器的方法
  private openTextEditor = (position: Point, existingDrawing: Drawing | null = null) => {
    this.textEditorState = {
      isTextEditorOpen: true,
      textEditorPosition: position,
      editingTextDrawing: existingDrawing,
    };

    // 强制重新渲染
    this.forceUpdate();
  };

  // 添加关闭文字编辑器的方法
  private closeTextEditor = () => {
    this.textEditorState = {
      isTextEditorOpen: false,
      textEditorPosition: { x: 0, y: 0 },
      editingTextDrawing: null,
    };
    this.forceUpdate();
  };

  // 添加保存文字的方法
  private handleTextSave = (
    text: string,
    color: string,
    fontSize: number,
    isBold: boolean,
    isItalic: boolean
  ) => {
    const { editingTextDrawing, textEditorPosition } = this.textEditorState;

    if (editingTextDrawing) {
      // 编辑现有文字
      const updatedDrawings = this.allDrawings.map(drawing => {
        if (drawing.id === editingTextDrawing.id) {
          return {
            ...drawing,
            color,
            properties: {
              ...drawing.properties,
              text,
              fontSize,
              isBold,
              isItalic,
            }
          };
        }
        return drawing;
      });

      this.allDrawings = updatedDrawings;
      this.saveToHistory('编辑文字');
    } else {
      // 创建新文字
      const drawingId = `text_${Date.now()}`;
      const drawing: Drawing = {
        id: drawingId,
        type: 'text',
        points: [textEditorPosition],
        color,
        lineWidth: 1,
        rotation: 0,
        properties: {
          text,
          fontSize,
          isBold,
          isItalic,
          textAlign: 'left',
          textBaseline: 'top',
        }
      };

      this.allDrawings.push(drawing);

      if (this.props.onDrawingComplete) {
        const chartDrawing: DrawingShape = {
          id: drawingId,
          type: 'text',
          points: [{
            time: this.coordinateToTime(textEditorPosition.x),
            price: this.coordinateToPrice(textEditorPosition.y)
          }],
          properties: {
            text,
            color,
            fontSize,
            isBold,
            isItalic,
          }
        };
        this.props.onDrawingComplete(chartDrawing);
      }

      this.saveToHistory('添加文字标注');
    }

    this.closeTextEditor();
    this.redrawCanvas();
  };

  private handleMouseMove = (event: MouseEvent) => {
    const point = this.getMousePosition(event);
    if (!point) return;

    // 只有在绘制模式下才处理绘图相关的鼠标移动
    if (!this.props.activeTool) {
      return;
    }

    if (this.state.isDraggingFloatingPanel && this.state.dragStartPoint) {
      const deltaX = point.x - this.state.dragStartPoint.x;
      const deltaY = point.y - this.state.dragStartPoint.y;

      this.setState(prevState => ({
        floatingPanelPosition: {
          x: prevState.floatingPanelPosition.x + deltaX,
          y: prevState.floatingPanelPosition.y + deltaY
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


  // 修改移动选中图形的方法
  // 修改移动选中图形的方法
  private moveSelectedDrawing(deltaX: number, deltaY: number) {
    if (!this.state.selectedDrawing) return;

    console.log('移动图形:', deltaX, deltaY); // 调试日志

    const updatedDrawings = this.allDrawings.map(drawing => {
      if (drawing.id === this.state.selectedDrawing!.id) {
        if (drawing.type === 'text') {
          return DrawingOperations.moveText(drawing, deltaX, deltaY);
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
    this.redrawCanvas();
  }



  // 修改调整大小的方法
  // 修改调整大小的方法
  private resizeSelectedDrawing(deltaX: number, deltaY: number, handle: string) {
    if (!this.state.selectedDrawing) return;

    console.log('调整大小:', deltaX, deltaY, handle); // 调试日志

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

  render() {
    const { activeTool, currentTheme } = this.props;
    const {
      isDrawing,
      selectedDrawing,
      floatingPanelPosition,
      isDraggingFloatingPanel,
      isTextInputActive,
      textInputPosition,
      textInputValue,
      textInputCursorVisible
    } = this.state;
    const { isTextEditorOpen, textEditorPosition, editingTextDrawing } = this.textEditorState;
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
          // 关键修改：只在绘制模式下接收指针事件
          pointerEvents: activeTool ? 'auto' : 'none',
          // 可选：在非绘制模式下添加视觉提示
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
          onSave={this.saveTextInput}
          onCancel={this.cancelTextInput}
        />

        {/* 文字编辑弹窗 - 只在双击现有文字时显示 */}
        {this.textEditorState.isTextEditorOpen && (
          <TextEditorModal
            isOpen={this.textEditorState.isTextEditorOpen}
            position={this.textEditorState.textEditorPosition}
            theme={currentTheme}
            initialText={this.textEditorState.editingTextDrawing?.properties?.text || ''}
            initialColor={this.textEditorState.editingTextDrawing?.color || currentTheme.chart.lineColor}
            initialFontSize={this.textEditorState.editingTextDrawing?.properties?.fontSize || 14}
            initialIsBold={this.textEditorState.editingTextDrawing?.properties?.isBold || false}
            initialIsItalic={this.textEditorState.editingTextDrawing?.properties?.isItalic || false}
            onSave={this.handleTextSave}
            onCancel={this.closeTextEditor}
          />
        )}

        {/* 只在绘制模式下显示工具栏 */}
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

        {selectedDrawing && (
          <FloatingPanel
            position={floatingPanelPosition}
            selectedDrawing={selectedDrawing}
            theme={currentTheme}
            onClose={() => this.setState({ selectedDrawing: null })}
            onDelete={this.deleteSelectedDrawing}
            onUndo={this.undo}
            onRedo={this.redo}
            onChangeColor={this.changeDrawingColor}
            canUndo={canUndo}
            canRedo={canRedo}
            onDragStart={(point) => this.setState({
              isDraggingFloatingPanel: true,
              dragStartPoint: point
            })}
            isDragging={isDraggingFloatingPanel}
            getToolName={this.getToolName}
          />
        )}

        <DrawingToolbar
          activeTool={activeTool}
          isDrawing={isDrawing}
          theme={currentTheme}
          onClearAll={this.clearAllDrawings}
          onCloseDrawing={this.handleCloseDrawing}
          getToolName={this.getToolName}
        />

        {selectedDrawing && (
          <FloatingPanel
            position={floatingPanelPosition}
            selectedDrawing={selectedDrawing}
            theme={currentTheme}
            onClose={() => this.setState({ selectedDrawing: null })}
            onDelete={this.deleteSelectedDrawing}
            onUndo={this.undo}
            onRedo={this.redo}
            onChangeColor={this.changeDrawingColor}
            canUndo={canUndo}
            canRedo={canRedo}
            onDragStart={(point) => this.setState({
              isDraggingFloatingPanel: true,
              dragStartPoint: point
            })}
            isDragging={isDraggingFloatingPanel}
            getToolName={this.getToolName}
          />
        )}
      </div>
    );
  }

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

  // 移除原来的双击处理，改为在鼠标按下时处理双击
  private handleMouseUp = (event: MouseEvent) => {
    const { isDrawing, drawingStartPoint, selectedDrawing } = this.state;
    const { activeTool } = this.props;

    // 处理双击事件
    if (event.detail === 2 && selectedDrawing && selectedDrawing.type === 'text') {
      // 双击文字图形，打开编辑弹窗
      this.openTextEditor(selectedDrawing.points[0], selectedDrawing);
      return;
    }

    // 只有在绘制模式下才处理绘图相关的鼠标释放
    if (!this.props.activeTool) {
      return;
    }

    if (this.state.isDraggingFloatingPanel) {
      this.setState({
        isDraggingFloatingPanel: false,
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

  // 修改选择图形的逻辑 - 双击文字打开编辑弹窗
  // 修改选择图形的方法，支持双击文字进行编辑
  // 修改选择图形的方法，移除双击延迟
  private selectDrawing = (drawing: Drawing) => {
    this.setState({ selectedDrawing: drawing });
  };

  private handleTextDoubleClick = (event: MouseEvent) => {
    // 检查是否双击了文字图形
    const point = this.getMousePosition(event);
    if (!point) return;

    const selected = DrawingOperations.findDrawingAtPoint(point, this.allDrawings, this.drawingConfigs);
    if (selected && selected.type === 'text' && selected.points.length > 0) {
      // 打开文字编辑弹窗
      this.openTextEditor(selected.points[0], selected);
    }

    document.removeEventListener('dblclick', this.handleTextDoubleClick);
    if (this.doubleClickTimeout) {
      clearTimeout(this.doubleClickTimeout);
      this.doubleClickTimeout = null;
    }
  };


  private deselectAll() {
    this.setState({ selectedDrawing: null });
  }

  private isPointInFloatingPanel(point: Point): boolean {
    const panel = this.state.floatingPanelPosition;
    return point.x >= panel.x && point.x <= panel.x + 200 &&
      point.y >= panel.y && point.y <= panel.y + 150;
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

    console.log('图形绘制完成:', drawing);
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

  private deleteSelectedDrawing = () => {
    if (!this.state.selectedDrawing) return;
    this.allDrawings = this.allDrawings.filter(d => d.id !== this.state.selectedDrawing!.id);
    this.saveToHistory(`删除${this.getToolName(this.state.selectedDrawing.type)}`);
    this.setState({ selectedDrawing: null });
    this.redrawCanvas();
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
    if (this.props.onCloseDrawing) {
      this.props.onCloseDrawing();
    }
  };

  private clearAllDrawings = () => {
    this.allDrawings = [];
    this.saveToHistory('清除所有绘图');
    this.setState({ selectedDrawing: null });
    this.redrawCanvas();
  };

  private getToolName = (toolId: string): string => {
    const config = this.drawingConfigs.get(toolId);
    return config ? config.name : toolId;
  };
}

export { DrawingLayer };
export type { Drawing };