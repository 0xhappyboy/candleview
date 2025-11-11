import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { FibonacciTimeZoonMark } from "../../Graph/Fibonacci/FibonacciTimeZoonMark";
import { IMarkManager } from "../../IMarkManager";

export interface FibonacciTimeZoonMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface FibonacciTimeZoonMarkState {
  isFibonacciTimeZoneMode: boolean;
  fibonacciTimeZoonStartPoint: Point | null;
  currentFibonacciTimeZoon: FibonacciTimeZoonMark | null;
  isDragging: boolean;
  dragTarget: FibonacciTimeZoonMark | null;
  dragPoint: 'start' | 'end' | 'line' | null;
}

export class FibonacciTimeZoonMarkManager implements IMarkManager<FibonacciTimeZoonMark> {
  private props: FibonacciTimeZoonMarkManagerProps;
  private state: FibonacciTimeZoonMarkState;
  private previewFibonacciTimeZoonMark: FibonacciTimeZoonMark | null = null;
  private fibonacciTimeZoneMarks: FibonacciTimeZoonMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: FibonacciTimeZoonMarkManagerProps) {
    this.props = props;
    this.state = {
      isFibonacciTimeZoneMode: false,
      fibonacciTimeZoonStartPoint: null,
      currentFibonacciTimeZoon: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): FibonacciTimeZoonMark | null {
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
      for (const mark of this.fibonacciTimeZoneMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.fibonacciTimeZoneMarks) {
        const nearLine = mark.isPointNearFibonacciLine(relativeX, relativeY);
        if (nearLine !== null) {
          return mark;
        }
      }
    } catch (error) {
      console.error('Error getting mark at point:', error);
    }
    return null;
  }

  public getCurrentDragTarget(): FibonacciTimeZoonMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): FibonacciTimeZoonMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewFibonacciTimeZoonMark) {
      return this.previewFibonacciTimeZoonMark;
    }
    if (this.state.isFibonacciTimeZoneMode && this.state.currentFibonacciTimeZoon) {
      return this.state.currentFibonacciTimeZoon;
    }
    return null;
  }

  public getAllMarks(): FibonacciTimeZoonMark[] {
    return [...this.fibonacciTimeZoneMarks];
  }

  public cancelOperationMode() {
    return this.cancelFibonacciTimeZoneMode();
  }

  public setFibonacciTimeZoneMode = (): FibonacciTimeZoonMarkState => {
    this.state = {
      ...this.state,
      isFibonacciTimeZoneMode: true,
      fibonacciTimeZoonStartPoint: null,
      currentFibonacciTimeZoon: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelFibonacciTimeZoneMode = (): FibonacciTimeZoonMarkState => {
    if (this.previewFibonacciTimeZoonMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciTimeZoonMark);
      this.previewFibonacciTimeZoonMark = null;
    }
    this.fibonacciTimeZoneMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isFibonacciTimeZoneMode: false,
      fibonacciTimeZoonStartPoint: null,
      currentFibonacciTimeZoon: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): FibonacciTimeZoonMarkState => {
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
      if (time === null) return this.state;
      this.mouseDownPoint = point;
      this.dragStartData = { time, price: 0 };
      let handleFound = false;
      for (const mark of this.fibonacciTimeZoneMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          this.state = {
            ...this.state,
            isFibonacciTimeZoneMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.fibonacciTimeZoneMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          mark.setDragging(true, handleType);
          this.isOperating = true;
          handleFound = true;
          break;
        }
      }
      if (!handleFound) {
        let lineFound = false;
        for (const mark of this.fibonacciTimeZoneMarks) {
          const nearLine = mark.isPointNearFibonacciLine(relativeX, relativeY);
          if (nearLine !== null) {
            this.state = {
              ...this.state,
              isFibonacciTimeZoneMode: true,
              isDragging: true,
              dragTarget: mark,
              dragPoint: 'line'
            };
            this.fibonacciTimeZoneMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            mark.setDragging(true, 'line');
            this.isOperating = true;
            lineFound = true;
            break;
          }
        }
        if (!lineFound) {
          if (this.state.isFibonacciTimeZoneMode && !this.state.isDragging) {
            if (!this.state.fibonacciTimeZoonStartPoint) {
              this.state = {
                ...this.state,
                fibonacciTimeZoonStartPoint: point
              };
              this.previewFibonacciTimeZoonMark = new FibonacciTimeZoonMark(
                time.toString(),
                time.toString(),
                '#2962FF',
                1,
                false,
                3
              );
              chartSeries.series.attachPrimitive(this.previewFibonacciTimeZoonMark);
              this.fibonacciTimeZoneMarks.forEach(m => m.setShowHandles(false));
              this.previewFibonacciTimeZoonMark.setShowHandles(true);
            } else {
              if (this.previewFibonacciTimeZoonMark) {
                chartSeries.series.detachPrimitive(this.previewFibonacciTimeZoonMark);
                const finalFibonacciTimeZoonMark = new FibonacciTimeZoonMark(
                  this.previewFibonacciTimeZoonMark.getStartTime(),
                  time.toString(),
                  '#2962FF',
                  1,
                  false,
                  3
                );
                chartSeries.series.attachPrimitive(finalFibonacciTimeZoonMark);
                this.fibonacciTimeZoneMarks.push(finalFibonacciTimeZoonMark);
                this.previewFibonacciTimeZoonMark = null;
                finalFibonacciTimeZoonMark.setShowHandles(true);
              }
              this.state = {
                ...this.state,
                isFibonacciTimeZoneMode: false,
                fibonacciTimeZoonStartPoint: null,
                currentFibonacciTimeZoon: null
              };
              if (this.props.onCloseDrawing) {
                this.props.onCloseDrawing();
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error placing fibonacci time zone mark:', error);
      this.state = this.cancelFibonacciTimeZoneMode();
    }
    return this.state;
  };
  private isPointNearVerticalLine(x: number, y: number, bounds: any, threshold: number = 15): boolean {
    const { minX, maxX, minY, maxY, fibonacciLinePositions } = bounds;
    if (x < minX - threshold || x > maxX + threshold || y < minY - threshold || y > maxY + threshold) {
      return false;
    }
    if (fibonacciLinePositions) {
      for (const line of fibonacciLinePositions) {
        const distance = Math.abs(x - line.x);
        if (distance <= threshold) {
          return true;
        }
      }
    }
    return false;
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
      if (time === null) return;
      if (this.state.isDragging && this.state.dragTarget && this.dragStartData &&
        (this.state.dragPoint === 'start' || this.state.dragPoint === 'end')) {
        if (this.dragStartData.time === null || time === null) return;
        const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
        const currentX = timeScale.timeToCoordinate(time);
        if (currentStartX === null || currentX === null) return;
        const deltaX = currentX - currentStartX;
        this.state.dragTarget.dragHandleByPixels(deltaX, this.state.dragPoint);
        this.dragStartData = { time, price: 0 };
        return;
      }
      if (this.state.isDragging && this.state.dragTarget && this.dragStartData &&
        this.state.dragPoint === 'line') {
        if (this.dragStartData.time === null || time === null) return;
        const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
        const currentX = timeScale.timeToCoordinate(time);
        if (currentStartX === null || currentX === null) return;
        const deltaX = currentX - currentStartX;
        this.state.dragTarget.dragLineByPixels(deltaX);
        this.dragStartData = { time, price: 0 };
        return;
      }
      if (!this.state.isDragging) {
        if (this.state.fibonacciTimeZoonStartPoint && this.previewFibonacciTimeZoonMark) {
          this.previewFibonacciTimeZoonMark.updateEndPoint(time.toString());
          chart.timeScale().widthChanged();
        }
        if (!this.state.isFibonacciTimeZoneMode && !this.state.isDragging && !this.state.fibonacciTimeZoonStartPoint) {
          let anyLineHovered = false;
          for (const mark of this.fibonacciTimeZoneMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            const isNearLine = this.isPointNearVerticalLine(relativeX, relativeY, mark.getBounds());
            const shouldShow = !!handleType || isNearLine;
            mark.setShowHandles(shouldShow);
            if (shouldShow) anyLineHovered = true;
          }
        }
      }
    } catch (error) {
      console.error('Error updating fibonacci time zone mark:', error);
    }
  };

  public handleMouseUp = (point: Point): FibonacciTimeZoonMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end' || this.state.dragPoint === 'line') {
        this.state = {
          ...this.state,
          isFibonacciTimeZoneMode: false,
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

  public handleKeyDown = (event: KeyboardEvent): FibonacciTimeZoonMarkState => {
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
      } else if (this.state.isFibonacciTimeZoneMode) {
        return this.cancelFibonacciTimeZoneMode();
      }
    }
    return this.state;
  };

  public getState(): FibonacciTimeZoonMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<FibonacciTimeZoonMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewFibonacciTimeZoonMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciTimeZoonMark);
      this.previewFibonacciTimeZoonMark = null;
    }
    this.fibonacciTimeZoneMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.fibonacciTimeZoneMarks = [];
  }

  public getFibonacciTimeZoonMarks(): FibonacciTimeZoonMark[] {
    return [...this.fibonacciTimeZoneMarks];
  }

  public removeFibonacciTimeZoonMark(mark: FibonacciTimeZoonMark): void {
    const index = this.fibonacciTimeZoneMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.fibonacciTimeZoneMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isFibonacciTimeZoneMode;
  }
}