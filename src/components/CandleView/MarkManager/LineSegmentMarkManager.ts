import { ChartSeries } from "../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../Mark/IMarkManager";
import { LineSegmentMark } from "../Mark/Line/LineSegmentMark";
import { Point } from "../types";

export interface LineSegmentMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface LineSegmentMarkState {
  isLineSegmentMarkMode: boolean;
  lineSegmentMarkStartPoint: Point | null;
  currentLineSegmentMark: LineSegmentMark | null;
  isDragging: boolean;
  dragTarget: LineSegmentMark | null;
  dragPoint: 'start' | 'end' | 'line' | null;
}

export class LineSegmentMarkManager implements IMarkManager<LineSegmentMark> {
  private props: LineSegmentMarkManagerProps;
  private state: LineSegmentMarkState;
  private previewLineSegmentMark: LineSegmentMark | null = null;
  private lineMarks: LineSegmentMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: LineSegmentMarkManagerProps) {
    this.props = props;
    this.state = {
      isLineSegmentMarkMode: false,
      lineSegmentMarkStartPoint: null,
      currentLineSegmentMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): LineSegmentMark | null {
    const { chartSeries, chart, containerRef } = this.props;
    if (!chartSeries || !chart) return null;
    try {
      const chartElement = chart.chartElement();
      if (!chartElement) return null;
      const chartRect = chartElement.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return null;
      const relativeX = point.x - (containerRect.left - chartRect.left);
      const relativeY = point.y - (containerRect.top - chartRect.top);
      for (const mark of this.lineMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.lineMarks) {
        const bounds = mark.getBounds();
        if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
          return mark;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public getCurrentDragTarget(): LineSegmentMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): LineSegmentMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewLineSegmentMark) {
      return this.previewLineSegmentMark;
    }
    if (this.state.isLineSegmentMarkMode && this.state.currentLineSegmentMark) {
      return this.state.currentLineSegmentMark;
    }
    return null;
  }

  public getAllMarks(): LineSegmentMark[] {
    return [...this.lineMarks];
  }

  public cancelOperationMode() {
    return this.cancelLineSegmentMarkMode();
  }

  public setLineSegmentMarkMode = (): LineSegmentMarkState => {
    this.state = {
      ...this.state,
      isLineSegmentMarkMode: true,
      lineSegmentMarkStartPoint: null,
      currentLineSegmentMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelLineSegmentMarkMode = (): LineSegmentMarkState => {
    if (this.previewLineSegmentMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewLineSegmentMark);
      this.previewLineSegmentMark = null;
    }
    this.lineMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isLineSegmentMarkMode: false,
      lineSegmentMarkStartPoint: null,
      currentLineSegmentMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): LineSegmentMarkState => {
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
      const relativeX = point.x - (containerRect.left - chartRect.left);
      const relativeY = point.y - (containerRect.top - chartRect.top);
      const timeScale = chart.timeScale();
      const time = timeScale.coordinateToTime(relativeX);
      const price = chartSeries.series.coordinateToPrice(relativeY);
      if (time === null || price === null) return this.state;
      this.mouseDownPoint = point;
      this.dragStartData = { time, price };
      for (const mark of this.lineMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          if (!this.state.isLineSegmentMarkMode) {
            this.state = {
              ...this.state,
              isLineSegmentMarkMode: true,
              isDragging: false,
              dragTarget: mark,
              dragPoint: handleType
            };
            this.lineMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            this.isOperating = true;
          } else {
            if (this.state.dragPoint === 'start') {
              mark.updateStartPoint(time.toString(), price);
            } else if (this.state.dragPoint === 'end') {
              mark.updateEndPoint(time.toString(), price);
            }
            this.state = {
              ...this.state,
              isLineSegmentMarkMode: false,
              isDragging: false,
              dragTarget: null,
              dragPoint: null
            };
            this.isOperating = false;
            this.lineMarks.forEach(m => m.setShowHandles(false));
            if (this.props.onCloseDrawing) {
              this.props.onCloseDrawing();
            }
          }
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

      if (this.state.isLineSegmentMarkMode && !this.state.isDragging) {
        if (!this.state.lineSegmentMarkStartPoint) {
          this.state = {
            ...this.state,
            lineSegmentMarkStartPoint: point
          };
          this.previewLineSegmentMark = new LineSegmentMark(
            time.toString(),
            price,
            time.toString(),
            price,
            '#2962FF',
            2,
            false
          );
          chartSeries.series.attachPrimitive(this.previewLineSegmentMark);
          this.lineMarks.forEach(m => m.setShowHandles(false));
          this.previewLineSegmentMark.setShowHandles(true);
        } else {
          if (this.previewLineSegmentMark) {
            chartSeries.series.detachPrimitive(this.previewLineSegmentMark);
            const finalLineSegmentMark = new LineSegmentMark(
              this.previewLineSegmentMark.getStartTime(),
              this.previewLineSegmentMark.getStartPrice(),
              time.toString(),
              price,
              '#2962FF',
              2,
              false
            );
            chartSeries.series.attachPrimitive(finalLineSegmentMark);
            this.lineMarks.push(finalLineSegmentMark);
            this.previewLineSegmentMark = null;
            finalLineSegmentMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isLineSegmentMarkMode: false,
            lineSegmentMarkStartPoint: null,
            currentLineSegmentMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelLineSegmentMarkMode();
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
      const timeScale = chart.timeScale();
      const time = timeScale.coordinateToTime(relativeX);
      const price = chartSeries.series.coordinateToPrice(relativeY);
      if (time === null || price === null) return;
      if (this.state.isDragging && this.state.dragTarget && this.dragStartData && this.state.dragPoint === 'line') {
        if (this.dragStartData.time === null || time === null) return;
        const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
        const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
        const currentX = timeScale.timeToCoordinate(time);
        const currentY = chartSeries.series.priceToCoordinate(price);
        if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;
        const deltaX = currentX - currentStartX;
        const deltaY = currentY - currentStartY;
        this.state.dragTarget.dragLineByPixels(deltaX, deltaY);
        this.dragStartData = { time, price };
        return;
      }
      if (this.state.isLineSegmentMarkMode && this.state.dragTarget && this.state.dragPoint &&
        (this.state.dragPoint === 'start' || this.state.dragPoint === 'end')) {
        if (this.state.dragPoint === 'start') {
          this.state.dragTarget.updateStartPoint(time.toString(), price);
        } else if (this.state.dragPoint === 'end') {
          this.state.dragTarget.updateEndPoint(time.toString(), price);
        }
      }
      if (!this.state.isDragging) {
        if (this.state.lineSegmentMarkStartPoint && this.previewLineSegmentMark) {
          this.previewLineSegmentMark.updateEndPoint(time.toString(), price);
          // chart.timeScale().widthChanged();
        }
        if (!this.state.isLineSegmentMarkMode && !this.state.isDragging && !this.state.lineSegmentMarkStartPoint) {
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
      console.error(error);
    }
  };

  public handleMouseUp = (point: Point): LineSegmentMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end') {
        this.state = {
          ...this.state,
          isLineSegmentMarkMode: false,
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

  public handleKeyDown = (event: KeyboardEvent): LineSegmentMarkState => {
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
      } else if (this.state.isLineSegmentMarkMode) {
        return this.cancelLineSegmentMarkMode();
      }
    }
    return this.state;
  };

  public getState(): LineSegmentMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<LineSegmentMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewLineSegmentMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewLineSegmentMark);
      this.previewLineSegmentMark = null;
    }

    this.lineMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.lineMarks = [];
  }

  public getLineSegmentMarks(): LineSegmentMark[] {
    return [...this.lineMarks];
  }

  public removeLineSegmentMark(mark: LineSegmentMark): void {
    const index = this.lineMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.lineMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isLineSegmentMarkMode;
  }
}