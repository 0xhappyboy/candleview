import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { LineMark } from "../Graph/Line/LineMark";

export interface LineMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface LineMarkState {
  isLineMarkMode: boolean;
  lineMarkStartPoint: Point | null;
  currentLineMark: LineMark | null;
  isDragging: boolean;
  dragTarget: LineMark | null;
  dragPoint: 'start' | 'end' | 'line' | null;
}

export class LineMarkManager {
  private props: LineMarkManagerProps;
  private state: LineMarkState;
  private previewLineMark: LineMark | null = null;
  private lineMarks: LineMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { x: number; y: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: LineMarkManagerProps) {
    this.props = props;
    this.state = {
      isLineMarkMode: false,
      lineMarkStartPoint: null,
      currentLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public setLineMarkMode = (): LineMarkState => {
    this.state = {
      ...this.state,
      isLineMarkMode: true,
      lineMarkStartPoint: null,
      currentLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelLineMarkMode = (): LineMarkState => {
    if (this.previewLineMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewLineMark);
      this.previewLineMark = null;
    }
    this.lineMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isLineMarkMode: false,
      lineMarkStartPoint: null,
      currentLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): LineMarkState => {
    const { chartSeries, chart, containerRef } = this.props;
    if (!chartSeries || !chart) {
      return this.state;
    }

    try {
      const chartElement = chart.chartElement();
      if (!chartElement) return this.state;

      const chartRect = chartElement.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return this.state;

      // 直接使用相对坐标（像素坐标）
      const relativeX = point.x - (containerRect.left - chartRect.left);
      const relativeY = point.y - (containerRect.top - chartRect.top);

      this.mouseDownPoint = point;
      // 保存像素坐标用于拖动计算
      this.dragStartData = { x: relativeX, y: relativeY };

      // 1. 首先检查是否点击了控制点
      for (const mark of this.lineMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          if (!this.state.isLineMarkMode) {
            this.state = {
              ...this.state,
              isLineMarkMode: true,
              isDragging: false,
              dragTarget: mark,
              dragPoint: handleType
            };
            this.lineMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
          } else {
            if (this.state.dragPoint === 'start') {
              mark.updateStartPoint(relativeX, relativeY);
            } else if (this.state.dragPoint === 'end') {
              mark.updateEndPoint(relativeX, relativeY);
            }
            this.state = {
              ...this.state,
              isLineMarkMode: false,
              isDragging: false,
              dragTarget: null,
              dragPoint: null
            };
            this.lineMarks.forEach(m => m.setShowHandles(false));
            if (this.props.onCloseDrawing) {
              this.props.onCloseDrawing();
            }
          }
          this.isOperating = true;
          return this.state;
        }
      }
      for (const mark of this.lineMarks) {
        const bounds = mark.getBounds();
        if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
          this.state = {
            ...this.state,
            isDragging: true,
            dragTarget: mark,
            dragPoint: 'line'
          };
          mark.setDragging(true, 'line');
          this.lineMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }
      if (this.state.isLineMarkMode && !this.state.isDragging) {
        if (!this.state.lineMarkStartPoint) {
          this.state = {
            ...this.state,
            lineMarkStartPoint: point
          };
          this.previewLineMark = new LineMark(
            relativeX,  // 起点X
            relativeY,  // 起点Y
            relativeX,  // 终点X（初始与起点相同）
            relativeY,  // 终点Y
            '#2962FF',
            2,
            false   
          );
          chartSeries.series.attachPrimitive(this.previewLineMark);
          this.lineMarks.forEach(m => m.setShowHandles(false));
          this.previewLineMark.setShowHandles(true);
        } else {
          if (this.previewLineMark) {
            chartSeries.series.detachPrimitive(this.previewLineMark);
            const finalLineMark = new LineMark(
              this.previewLineMark.getStartX(),
              this.previewLineMark.getStartY(),
              relativeX,  // 终点X
              relativeY,  // 终点Y
              '#2962FF',
              2,
              false
            );
            chartSeries.series.attachPrimitive(finalLineMark);
            this.lineMarks.push(finalLineMark);
            this.previewLineMark = null;
            finalLineMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isLineMarkMode: false,
            lineMarkStartPoint: null,
            currentLineMark: null
          };

          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error('Error placing line mark:', error);
      this.state = this.cancelLineMarkMode();
    }
    return this.state;
  };


  private isPointNearLine(x: number, y: number, bounds: any, threshold: number = 15): boolean {
    const { startX, startY, endX, endY, minX, maxX, minY, maxY } = bounds;
    if (x < minX - threshold || x > maxX + threshold || y < minY - threshold || y > maxY + threshold) {
      return false;
    }
    const A = x - startX;
    const B = y - startY;
    const C = endX - startX;
    const D = endY - startY;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    let xx, yy;
    if (param < 0) {
      xx = startX;
      yy = startY;
    } else if (param > 1) {
      xx = endX;
      yy = endY;
    } else {
      xx = startX + param * C;
      yy = startY + param * D;
    }
    const dx = x - xx;
    const dy = y - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= threshold;
  }

  public handleMouseMove = (point: Point): void => {
    const { chartSeries, chart, containerRef } = this.props;
    if (!chartSeries || !chart) return;

    try {
      const chartElement = chart.chartElement();
      if (!chartElement) return;

      const chartRect = chartElement.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const relativeX = point.x - (containerRect.left - chartRect.left);
      const relativeY = point.y - (containerRect.top - chartRect.top);

      if (this.state.isDragging && this.state.dragTarget && this.dragStartData && this.state.dragPoint === 'line') {
        const deltaX = relativeX - this.dragStartData.x;
        const deltaY = relativeY - this.dragStartData.y;
        this.state.dragTarget.dragLine(deltaX, deltaY);
        return;
      }

      if (this.state.isLineMarkMode && this.state.dragTarget && this.state.dragPoint &&
        (this.state.dragPoint === 'start' || this.state.dragPoint === 'end')) {

        if (this.state.dragPoint === 'start') {
          this.state.dragTarget.updateStartPoint(relativeX, relativeY);
        } else if (this.state.dragPoint === 'end') {
          this.state.dragTarget.updateEndPoint(relativeX, relativeY);
        }
      }

      if (!this.state.isDragging) {
        if (this.state.lineMarkStartPoint && this.previewLineMark) {
          this.previewLineMark.updateEndPoint(relativeX, relativeY);
          chart.timeScale().widthChanged();
        }

        if (!this.state.isLineMarkMode && !this.state.isDragging && !this.state.lineMarkStartPoint) {
          let anyLineHovered = false;
          for (const mark of this.lineMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            const isNearLine = this.isPointNearLine(relativeX, relativeY, mark.getBounds());
            const shouldShow = !!handleType || isNearLine;
            mark.setShowHandles(shouldShow);
            if (shouldShow) anyLineHovered = true;
          }
        }
      }
    } catch (error) {
      console.error('Error updating line mark:', error);
    }
  };

  public handleMouseUp = (point: Point): LineMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end') {
        this.state = {
          ...this.state,
          isLineMarkMode: false,
          isDragging: false,
          dragTarget: null,
          dragPoint: null
        };
        if (this.props.onCloseDrawing) {
          this.props.onCloseDrawing();
        }
      } else {
        this.state = {
          ...this.state,
          isDragging: false,
          dragTarget: null,
          dragPoint: null
        };
      }
      this.isOperating = false;
    }
    this.mouseDownPoint = null;
    this.dragStartData = null;
    return { ...this.state };
  };


  public handleKeyDown = (event: KeyboardEvent): LineMarkState => {
    if (event.key === 'Escape') {
      if (this.state.isDragging) {
        if (this.state.dragTarget) {
          this.state.dragTarget.setDragging(false, null);
        }
        this.state = {
          ...this.state,
          isDragging: false,
          dragTarget: null,
          dragPoint: null
        };
      } else if (this.state.isLineMarkMode) {
        return this.cancelLineMarkMode();
      }
    }
    return this.state;
  };

  public getState(): LineMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<LineMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewLineMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewLineMark);
      this.previewLineMark = null;
    }

    this.lineMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.lineMarks = [];
  }

  public getLineMarks(): LineMark[] {
    return [...this.lineMarks];
  }

  public removeLineMark(mark: LineMark): void {
    const index = this.lineMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.lineMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isLineMarkMode;
  }
}