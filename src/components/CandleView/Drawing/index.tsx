import React from 'react';
import { DrawingToolsManager, DrawingShape } from './DrawingManager';
import { drawingConfigs, registerDrawingConfig, unregisterDrawingConfig, DrawingConfig } from './DrawingConfigs';
import { CanvasRenderer } from './CanvasRenderer';
import { HistoryManager } from './HistoryManager';
import { DrawingOperations } from './DrawingOperations';
import { FloatingPanel } from './FloatingPanel';
import { DrawingToolbar } from './DrawingToolbar';
import { DrawingLayerProps, DrawingLayerState, Drawing, Point } from './types';

class DrawingLayer extends React.Component<DrawingLayerProps, DrawingLayerState> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private containerRef = React.createRef<HTMLDivElement>();
  private drawingManager: DrawingToolsManager | null = null;
  private allDrawings: Drawing[] = [];
  private drawingConfigs = drawingConfigs;
  private historyManager: HistoryManager;
  private readonly MAX_HISTORY_SIZE = 50;

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


  private handleMouseDown = (event: MouseEvent) => {
    if (!this.containerRef.current || !this.containerRef.current.contains(event.target as Node)) {
      return;
    }

    const point = this.getMousePosition(event);
    if (!point) return;

    if (this.isPointInFloatingPanel(point)) {
      this.setState({
        isDraggingFloatingPanel: true,
        dragStartPoint: point
      });
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
      this.setState({
        isDragging: true,
        dragStartPoint: point
      });
      return;
    }

    if (this.props.activeTool) {
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

  private handleMouseMove = (event: MouseEvent) => {
    const point = this.getMousePosition(event);
    if (!point) return;

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


  private moveSelectedDrawing(deltaX: number, deltaY: number) {
    if (!this.state.selectedDrawing) return;

    const updatedDrawings = this.allDrawings.map(drawing => {
      if (drawing.id === this.state.selectedDrawing!.id) {
        return DrawingOperations.moveDrawing(drawing, deltaX, deltaY);
      }
      return drawing;
    });

    this.allDrawings = updatedDrawings;
    this.setState({
      selectedDrawing: updatedDrawings.find(d => d.id === this.state.selectedDrawing!.id) || null
    });
    this.redrawCanvas();
  }

  private resizeSelectedDrawing(deltaX: number, deltaY: number, handle: string) {
    if (!this.state.selectedDrawing) return;

    const updatedDrawing = DrawingOperations.resizeDrawing(this.state.selectedDrawing, deltaX, deltaY, handle);
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
    const { isDrawing, selectedDrawing, floatingPanelPosition, isDraggingFloatingPanel } = this.state;
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
          pointerEvents: 'auto',
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

  private handleMouseUp = (event: MouseEvent) => {
    const { isDrawing, drawingStartPoint } = this.state;
    const { activeTool } = this.props;


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


  private selectDrawing(drawing: Drawing) {
    this.setState({ selectedDrawing: drawing });
  }

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
