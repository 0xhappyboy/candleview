import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { ThickArrowLineMark } from "../../Mark/Arrow/ThickArrowLineMark";
import { IMarkManager } from "../../Mark/IMarkManager";
import { Point } from "../../types";

export interface ThickArrowLineMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface ThickArrowLineMarkState {
  isThickArrowLineMarkMode: boolean;
  thickArrowLineMarkStartPoint: Point | null;
  currentThickArrowLineMark: ThickArrowLineMark | null;
  isDragging: boolean;
  dragTarget: ThickArrowLineMark | null;
  dragPoint: 'start' | 'end' | 'line' | null;
}

export class ThickArrowLineMarkManager implements IMarkManager<ThickArrowLineMark> {
  private props: ThickArrowLineMarkManagerProps;
  private state: ThickArrowLineMarkState;
  private previewThickArrowLineMark: ThickArrowLineMark | null = null;
  private thickArrowLineMarks: ThickArrowLineMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: ThickArrowLineMarkManagerProps) {
    this.props = props;
    this.state = {
      isThickArrowLineMarkMode: false,
      thickArrowLineMarkStartPoint: null,
      currentThickArrowLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public clearState(): void {
    this.state = {
      isThickArrowLineMarkMode: false,
      thickArrowLineMarkStartPoint: null,
      currentThickArrowLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): ThickArrowLineMark | null {
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
      for (const mark of this.thickArrowLineMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.thickArrowLineMarks) {
        const bounds = mark.getBounds();
        if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
          return mark;
        }
      }
    } catch (error) {
    }
    return null;
  }

  public getCurrentDragTarget(): ThickArrowLineMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): ThickArrowLineMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewThickArrowLineMark) {
      return this.previewThickArrowLineMark;
    }
    if (this.state.isThickArrowLineMarkMode && this.state.currentThickArrowLineMark) {
      return this.state.currentThickArrowLineMark;
    }
    return null;
  }

  public getAllMarks(): ThickArrowLineMark[] {
    return [...this.thickArrowLineMarks];
  }

  public cancelOperationMode() {
    return this.cancelThickArrowLineMarkMode();
  }

  public setThickArrowLineMarkMode = (): ThickArrowLineMarkState => {
    this.state = {
      ...this.state,
      isThickArrowLineMarkMode: true,
      thickArrowLineMarkStartPoint: null,
      currentThickArrowLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelThickArrowLineMarkMode = (): ThickArrowLineMarkState => {
    if (this.previewThickArrowLineMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewThickArrowLineMark);
      this.previewThickArrowLineMark = null;
    }
    this.thickArrowLineMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isThickArrowLineMarkMode: false,
      thickArrowLineMarkStartPoint: null,
      currentThickArrowLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): ThickArrowLineMarkState => {
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
      for (const mark of this.thickArrowLineMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          if (!this.state.isThickArrowLineMarkMode) {
            this.state = {
              ...this.state,
              isThickArrowLineMarkMode: true,
              isDragging: false,
              dragTarget: mark,
              dragPoint: handleType
            };
            this.thickArrowLineMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            this.isOperating = true;
          } else {
            if (this.state.dragPoint === 'start') {
              mark.updateStartPoint(time, price);
            } else if (this.state.dragPoint === 'end') {
              mark.updateEndPoint(time, price);
            }
            this.state = {
              ...this.state,
              isThickArrowLineMarkMode: false,
              isDragging: false,
              dragTarget: null,
              dragPoint: null
            };
            this.isOperating = false;
            this.thickArrowLineMarks.forEach(m => m.setShowHandles(false));
            if (this.props.onCloseDrawing) {
              this.props.onCloseDrawing();
            }
          }
          return this.state;
        }
      }

      for (const mark of this.thickArrowLineMarks) {
        const bounds = mark.getBounds();
        if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
          this.state = {
            ...this.state,
            isDragging: true,
            dragTarget: mark,
            dragPoint: 'line'
          };
          mark.setDragging(true, 'line');
          this.thickArrowLineMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }

      if (this.state.isThickArrowLineMarkMode && !this.state.isDragging) {
        if (!this.state.thickArrowLineMarkStartPoint) {
          this.state = {
            ...this.state,
            thickArrowLineMarkStartPoint: point
          };
          this.previewThickArrowLineMark = new ThickArrowLineMark(
            time,
            price,
            time,
            price,
            '#2962FF',
            3,
            false
          );
          chartSeries.series.attachPrimitive(this.previewThickArrowLineMark);
          this.thickArrowLineMarks.forEach(m => m.setShowHandles(false));
          this.previewThickArrowLineMark.setShowHandles(true);
        } else {
          if (this.previewThickArrowLineMark) {
            chartSeries.series.detachPrimitive(this.previewThickArrowLineMark);
            const finalThickArrowLineMark = new ThickArrowLineMark(
              this.previewThickArrowLineMark.getStartTime(),
              this.previewThickArrowLineMark.getStartPrice(),
              time,
              price,
              '#2962FF',
              3,
              false
            );
            chartSeries.series.attachPrimitive(finalThickArrowLineMark);
            this.thickArrowLineMarks.push(finalThickArrowLineMark);
            this.previewThickArrowLineMark = null;
            finalThickArrowLineMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isThickArrowLineMarkMode: false,
            thickArrowLineMarkStartPoint: null,
            currentThickArrowLineMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      this.state = this.cancelThickArrowLineMarkMode();
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
      if (this.state.isThickArrowLineMarkMode && this.state.dragTarget && this.state.dragPoint &&
        (this.state.dragPoint === 'start' || this.state.dragPoint === 'end')) {
        if (this.state.dragPoint === 'start') {
          this.state.dragTarget.updateStartPoint(time, price);
        } else if (this.state.dragPoint === 'end') {
          this.state.dragTarget.updateEndPoint(time, price);
        }
      }
      if (!this.state.isDragging) {
        if (this.state.thickArrowLineMarkStartPoint && this.previewThickArrowLineMark) {
          this.previewThickArrowLineMark.updateEndPoint(time, price);
        }
        if (!this.state.isThickArrowLineMarkMode && !this.state.isDragging && !this.state.thickArrowLineMarkStartPoint) {
          let anyLineHovered = false;
          for (const mark of this.thickArrowLineMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            const isNearLine = this.isPointNearLine(relativeX, relativeY, mark.getBounds());
            const shouldShow = !!handleType || isNearLine;
            mark.setShowHandles(shouldShow);
            if (shouldShow) anyLineHovered = true;
          }
        }
      }
    } catch (error) {
    }
  };

  public handleMouseUp = (point: Point): ThickArrowLineMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end') {
        this.state = {
          ...this.state,
          isThickArrowLineMarkMode: false,
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

  public handleKeyDown = (event: KeyboardEvent): ThickArrowLineMarkState => {
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
      } else if (this.state.isThickArrowLineMarkMode) {
        return this.cancelThickArrowLineMarkMode();
      }
    }
    return this.state;
  };

  public getState(): ThickArrowLineMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<ThickArrowLineMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewThickArrowLineMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewThickArrowLineMark);
      this.previewThickArrowLineMark = null;
    }

    this.thickArrowLineMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.thickArrowLineMarks = [];
  }

  public getThickArrowLineMarks(): ThickArrowLineMark[] {
    return [...this.thickArrowLineMarks];
  }

  public removeThickArrowLineMark(mark: ThickArrowLineMark): void {
    const index = this.thickArrowLineMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.thickArrowLineMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isThickArrowLineMarkMode;
  }
}