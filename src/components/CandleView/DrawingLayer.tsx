import React from 'react';
import { ThemeConfig } from './CandleViewTheme';
import { DrawingToolsManager, DrawingShape } from './DrawingManager';

interface DrawingLayerProps {
  chart: any;
  currentTheme: ThemeConfig;
  activeTool: string | null;
  onDrawingComplete?: (drawing: DrawingShape) => void;
  onCloseDrawing?: () => void;
}

interface DrawingLayerState {
  isDrawing: boolean;
  drawingPoints: Array<{ x: number; y: number }>;
  currentDrawing: any;
  drawingStartPoint: { x: number; y: number } | null;
  drawings: Array<{ type: string; points: Array<{ x: number; y: number }>; id: string }>;
}

class DrawingLayer extends React.Component<DrawingLayerProps, DrawingLayerState> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private containerRef = React.createRef<HTMLDivElement>();
  private drawingManager: DrawingToolsManager | null = null;


  private allDrawings: Array<{
    id: string;
    type: string;
    points: Array<{ x: number; y: number }>;
    color: string;
    lineWidth: number;
  }> = [];

  constructor(props: DrawingLayerProps) {
    super(props);
    this.state = {
      isDrawing: false,
      drawingPoints: [],
      currentDrawing: null,
      drawingStartPoint: null,
      drawings: [],
    };
  }

  componentDidMount() {
    this.setupDrawingEvents();
    this.initializeDrawingManager();
    this.setupCanvas();
  }

  componentDidUpdate(prevProps: DrawingLayerProps, prevState: DrawingLayerState) {
    if (prevProps.activeTool !== this.props.activeTool) {
      this.updateCursorStyle();
    }


    if (this.state.isDrawing !== prevState.isDrawing ||
      this.state.drawingPoints !== prevState.drawingPoints) {
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
      this.drawShape(ctx, drawing);
    });


    if (this.state.isDrawing && this.state.drawingPoints.length > 0) {
      this.drawPreview(ctx);
    }
  }

  private drawShape(ctx: CanvasRenderingContext2D, drawing: any) {
    ctx.strokeStyle = drawing.color;
    ctx.lineWidth = drawing.lineWidth;
    ctx.beginPath();

    switch (drawing.type) {
      case 'line':
        if (drawing.points.length === 2) {
          ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
          ctx.lineTo(drawing.points[1].x, drawing.points[1].y);
        }
        break;

      case 'horizontal-line':
        if (drawing.points.length >= 1) {
          const y = drawing.points[0].y;
          ctx.moveTo(0, y);
          ctx.lineTo(ctx.canvas.width, y);
        }
        break;

      case 'vertical-line':
        if (drawing.points.length >= 1) {
          const x = drawing.points[0].x;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, ctx.canvas.height);
        }
        break;

      case 'rectangle':
        if (drawing.points.length === 2) {
          const [start, end] = drawing.points;
          const width = end.x - start.x;
          const height = end.y - start.y;
          ctx.rect(start.x, start.y, width, height);
        }
        break;
    }

    ctx.stroke();
  }

  private drawPreview(ctx: CanvasRenderingContext2D) {
    const { activeTool } = this.props;
    const { drawingPoints } = this.state;

    ctx.strokeStyle = this.props.currentTheme.chart.lineColor + '80';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    switch (activeTool) {
      case 'line':
        if (drawingPoints.length === 2) {
          ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y);
          ctx.lineTo(drawingPoints[1].x, drawingPoints[1].y);
        }
        break;

      case 'horizontal-line':
        if (drawingPoints.length >= 1) {
          const y = drawingPoints[0].y;
          ctx.moveTo(0, y);
          ctx.lineTo(ctx.canvas.width, y);
        }
        break;

      case 'vertical-line':
        if (drawingPoints.length >= 1) {
          const x = drawingPoints[0].x;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, ctx.canvas.height);
        }
        break;

      case 'rectangle':
        if (drawingPoints.length === 2) {
          const [start, end] = drawingPoints;
          const width = end.x - start.x;
          const height = end.y - start.y;
          ctx.rect(start.x, start.y, width, height);
        }
        break;
    }

    ctx.stroke();
    ctx.setLineDash([]);
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

  private handleMouseDown = (event: MouseEvent) => {
    if (!this.containerRef.current || !this.containerRef.current.contains(event.target as Node)) {
      return;
    }

    if (!this.props.activeTool) return;

    const point = this.getMousePosition(event);
    if (!point) return;

    console.log('开始绘图:', { tool: this.props.activeTool, point });

    this.setState({
      isDrawing: true,
      drawingPoints: [point],
      drawingStartPoint: point
    });
  };

  private handleMouseMove = (event: MouseEvent) => {
    const { isDrawing, drawingStartPoint } = this.state;
    const { activeTool } = this.props;

    if (!isDrawing || !activeTool || !drawingStartPoint) return;

    const point = this.getMousePosition(event);
    if (!point) return;

    const currentPoints = this.calculateDrawingPoints(drawingStartPoint, point, activeTool);


    this.setState({
      drawingPoints: currentPoints
    }, () => {

      this.redrawCanvas();
    });
  };

  private handleMouseUp = (event: MouseEvent) => {
    const { isDrawing, drawingStartPoint } = this.state;
    const { activeTool } = this.props;

    if (!isDrawing || !activeTool || !drawingStartPoint) return;

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
  };

  private getMousePosition(event: MouseEvent): { x: number; y: number } | null {
    if (!this.containerRef.current) return null;

    const rect = this.containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;


    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      return null;
    }

    return { x, y };
  }

  private calculateDrawingPoints(
    startPoint: { x: number; y: number } | null,
    currentPoint: { x: number; y: number },
    tool: string
  ): Array<{ x: number; y: number }> {
    if (!startPoint) return [];

    switch (tool) {
      case 'line':
        return [startPoint, currentPoint];
      case 'horizontal-line':
        return [startPoint];
      case 'vertical-line':
        return [startPoint];
      case 'rectangle':
        return [startPoint, currentPoint];
      default:
        return [startPoint];
    }
  }

  private finalizeDrawing = (points: Array<{ x: number; y: number }>, tool: string) => {
    const { currentTheme, onDrawingComplete } = this.props;


    const drawingId = `drawing_${Date.now()}`;
    const drawing = {
      id: drawingId,
      type: tool,
      points: points,
      color: currentTheme.chart.lineColor,
      lineWidth: tool === 'line' ? 2 : 1
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
    this.redrawCanvas();
  };

  render() {
    const { activeTool } = this.props;
    const { isDrawing } = this.state;

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

        {activeTool && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: this.props.currentTheme.toolbar.background,
            color: this.props.currentTheme.layout.textColor,
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 10,
            border: `1px solid ${this.props.currentTheme.toolbar.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>
              绘图模式: {this.getToolName(activeTool)}
              {isDrawing && ' - 绘制中...'}
            </span>
            <button
              onClick={this.clearAllDrawings}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '3px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="清除所有绘图"
            >
              清除
            </button>
            <button
              onClick={this.handleCloseDrawing}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '3px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="退出绘图模式"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  private getToolName(toolId: string): string {
    const toolNames: { [key: string]: string } = {
      'line': '趋势线',
      'horizontal-line': '水平线',
      'vertical-line': '垂直线',
      'rectangle': '矩形',
      'fibonacci': '斐波那契',
      'text': '文本'
    };
    return toolNames[toolId] || toolId;
  }
}

export default DrawingLayer;