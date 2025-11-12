import { ChartSeries } from "../ChartLayer/ChartTypeManager";
import { ArrowLineMark } from "../Mark/Arrow/ArrowLineMark";
import { IMarkManager } from "../Mark/IMarkManager";
import { Point } from "../types";

export interface ArrowLineMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface ArrowLineMarkState {
  isArrowLineMarkMode: boolean;
  arrowLineMarkStartPoint: Point | null;
  currentArrowLineMark: ArrowLineMark | null;
  isDragging: boolean;
  dragTarget: ArrowLineMark | null;
  dragPoint: 'start' | 'end' | 'line' | null;
}

export class ArrowLineMarkManager implements IMarkManager<ArrowLineMark> {
  private props: ArrowLineMarkManagerProps;
  private state: ArrowLineMarkState;
  private previewArrowLineMark: ArrowLineMark | null = null;
  private arrowLineMarks: ArrowLineMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: ArrowLineMarkManagerProps) {
    this.props = props;
    this.state = {
      isArrowLineMarkMode: false,
      arrowLineMarkStartPoint: null,
      currentArrowLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): ArrowLineMark | null {
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
      for (const mark of this.arrowLineMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.arrowLineMarks) {
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

  public getCurrentDragTarget(): ArrowLineMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): ArrowLineMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewArrowLineMark) {
      return this.previewArrowLineMark;
    }
    if (this.state.isArrowLineMarkMode && this.state.currentArrowLineMark) {
      return this.state.currentArrowLineMark;
    }
    return null;
  }

  public getAllMarks(): ArrowLineMark[] {
    return [...this.arrowLineMarks];
  }

  public cancelOperationMode() {
    return this.cancelArrowLineMarkMode();
  }

  public setArrowLineMarkMode = (): ArrowLineMarkState => {
    this.state = {
      ...this.state,
      isArrowLineMarkMode: true,
      arrowLineMarkStartPoint: null,
      currentArrowLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelArrowLineMarkMode = (): ArrowLineMarkState => {
    if (this.previewArrowLineMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewArrowLineMark);
      this.previewArrowLineMark = null;
    }
    this.arrowLineMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isArrowLineMarkMode: false,
      arrowLineMarkStartPoint: null,
      currentArrowLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): ArrowLineMarkState => {
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
      for (const mark of this.arrowLineMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          if (!this.state.isArrowLineMarkMode) {
            this.state = {
              ...this.state,
              isArrowLineMarkMode: true,
              isDragging: false,
              dragTarget: mark,
              dragPoint: handleType
            };
            this.arrowLineMarks.forEach(m => {
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
              isArrowLineMarkMode: false,
              isDragging: false,
              dragTarget: null,
              dragPoint: null
            };
            this.isOperating = false;
            this.arrowLineMarks.forEach(m => m.setShowHandles(false));
            if (this.props.onCloseDrawing) {
              this.props.onCloseDrawing();
            }
          }
          return this.state;
        }
      }

      for (const mark of this.arrowLineMarks) {
        const bounds = mark.getBounds();
        if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
          this.state = {
            ...this.state,
            isDragging: true,
            dragTarget: mark,
            dragPoint: 'line'
          };
          mark.setDragging(true, 'line');
          this.arrowLineMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }

      if (this.state.isArrowLineMarkMode && !this.state.isDragging) {
        if (!this.state.arrowLineMarkStartPoint) {
          this.state = {
            ...this.state,
            arrowLineMarkStartPoint: point
          };
          this.previewArrowLineMark = new ArrowLineMark(
            time.toString(),
            price,
            time.toString(),
            price,
            '#2962FF',
            2,
            false
          );
          chartSeries.series.attachPrimitive(this.previewArrowLineMark);
          this.arrowLineMarks.forEach(m => m.setShowHandles(false));
          this.previewArrowLineMark.setShowHandles(true);
        } else {
          if (this.previewArrowLineMark) {
            chartSeries.series.detachPrimitive(this.previewArrowLineMark);
            const finalArrowLineMark = new ArrowLineMark(
              this.previewArrowLineMark.getStartTime(),
              this.previewArrowLineMark.getStartPrice(),
              time.toString(),
              price,
              '#2962FF',
              2,
              false
            );
            chartSeries.series.attachPrimitive(finalArrowLineMark);
            this.arrowLineMarks.push(finalArrowLineMark);
            this.previewArrowLineMark = null;
            finalArrowLineMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isArrowLineMarkMode: false,
            arrowLineMarkStartPoint: null,
            currentArrowLineMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelArrowLineMarkMode();
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
      if (this.state.isArrowLineMarkMode && this.state.dragTarget && this.state.dragPoint &&
        (this.state.dragPoint === 'start' || this.state.dragPoint === 'end')) {
        if (this.state.dragPoint === 'start') {
          this.state.dragTarget.updateStartPoint(time.toString(), price);
        } else if (this.state.dragPoint === 'end') {
          this.state.dragTarget.updateEndPoint(time.toString(), price);
        }
      }
      if (!this.state.isDragging) {
        if (this.state.arrowLineMarkStartPoint && this.previewArrowLineMark) {
          this.previewArrowLineMark.updateEndPoint(time.toString(), price);
          // chart.timeScale().widthChanged();
        }
        if (!this.state.isArrowLineMarkMode && !this.state.isDragging && !this.state.arrowLineMarkStartPoint) {
          let anyLineHovered = false;
          for (const mark of this.arrowLineMarks) {
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

  public handleMouseUp = (point: Point): ArrowLineMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end') {
        this.state = {
          ...this.state,
          isArrowLineMarkMode: false,
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

  public handleKeyDown = (event: KeyboardEvent): ArrowLineMarkState => {
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
      } else if (this.state.isArrowLineMarkMode) {
        return this.cancelArrowLineMarkMode();
      }
    }
    return this.state;
  };

  public getState(): ArrowLineMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<ArrowLineMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewArrowLineMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewArrowLineMark);
      this.previewArrowLineMark = null;
    }

    this.arrowLineMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.arrowLineMarks = [];
  }

  public getArrowLineMarks(): ArrowLineMark[] {
    return [...this.arrowLineMarks];
  }

  public removeArrowLineMark(mark: ArrowLineMark): void {
    const index = this.arrowLineMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.arrowLineMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isArrowLineMarkMode;
  }
}