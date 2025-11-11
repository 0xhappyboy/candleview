import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { FibonacciArcMark } from "../../Graph/Fibonacci/FibonacciArcMark";
import { IMarkManager } from "../../IMarkManager";

export interface FibonacciArcMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface FibonacciArcMarkState {
  isFibonacciArcMode: boolean;
  fibonacciArcStartPoint: Point | null;
  currentFibonacciArc: FibonacciArcMark | null;
  isDragging: boolean;
  dragTarget: FibonacciArcMark | null;
  dragPoint: 'start' | 'end' | 'line' | null;
}

export class FibonacciArcMarkManager implements IMarkManager<FibonacciArcMark> {
  private props: FibonacciArcMarkManagerProps;
  private state: FibonacciArcMarkState;
  private previewFibonacciArcMark: FibonacciArcMark | null = null;
  private fibonacciArcMarks: FibonacciArcMark[] = [];
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: FibonacciArcMarkManagerProps) {
    this.props = props;
    this.state = {
      isFibonacciArcMode: false,
      fibonacciArcStartPoint: null,
      currentFibonacciArc: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): FibonacciArcMark | null {
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
      for (const mark of this.fibonacciArcMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.fibonacciArcMarks) {
        const nearArc = mark.isPointNearArc(relativeX, relativeY);
        if (nearArc !== null) {
          return mark;
        }
      }
    } catch (error) {
      console.error('Error getting mark at point:', error);
    }
    return null;
  }

  public getCurrentDragTarget(): FibonacciArcMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): FibonacciArcMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewFibonacciArcMark) {
      return this.previewFibonacciArcMark;
    }
    if (this.state.isFibonacciArcMode && this.state.currentFibonacciArc) {
      return this.state.currentFibonacciArc;
    }
    return null;
  }

  public getAllMarks(): FibonacciArcMark[] {
    return [...this.fibonacciArcMarks];
  }

  public cancelOperationMode() {
    return this.cancelFibonacciArcMode();
  }

  public setFibonacciArcMode = (): FibonacciArcMarkState => {
    this.state = {
      ...this.state,
      isFibonacciArcMode: true,
      fibonacciArcStartPoint: null,
      currentFibonacciArc: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelFibonacciArcMode = (): FibonacciArcMarkState => {
    if (this.previewFibonacciArcMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciArcMark);
      this.previewFibonacciArcMark = null;
    }
    this.fibonacciArcMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isFibonacciArcMode: false,
      fibonacciArcStartPoint: null,
      currentFibonacciArc: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): FibonacciArcMarkState => {
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
      let price: number | null = null;
      let time: number | null = null;
      try {
        time = timeScale.coordinateToTime(relativeX);
        if (chartSeries.series && typeof chartSeries.series.coordinateToPrice === 'function') {
          price = chartSeries.series.coordinateToPrice(relativeY);
        } else {
          price = this.coordinateToPriceFallback(relativeY);
        }
      } catch (error) {
        return this.state;
      }
      if (time === null || price === null) {
        return this.state;
      }
      this.dragStartData = { time, price };
      let handleFound = false;
      for (const mark of this.fibonacciArcMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          this.state = {
            ...this.state,
            isFibonacciArcMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.fibonacciArcMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          mark.setDragging(true, handleType);
          this.isOperating = true;
          handleFound = true;
          break;
        }
      }
      if (!handleFound) {
        let arcFound = false;
        for (const mark of this.fibonacciArcMarks) {
          const nearArc = mark.isPointNearArc(relativeX, relativeY);
          if (nearArc !== null) {
            this.state = {
              ...this.state,
              isFibonacciArcMode: true,
              isDragging: true,
              dragTarget: mark,
              dragPoint: 'line'
            };
            this.fibonacciArcMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            mark.setDragging(true, 'line');
            this.isOperating = true;
            arcFound = true;
            break;
          }
        }
        if (!arcFound && this.state.isFibonacciArcMode) {
          if (!this.state.fibonacciArcStartPoint) {
            this.state = {
              ...this.state,
              fibonacciArcStartPoint: point,
              currentFibonacciArc: null
            };
            this.previewFibonacciArcMark = new FibonacciArcMark(
              price,
              price,
              time.toString(),
              time.toString(),
              '#2962FF',
              1,
              true,
              3
            );
            if (chartSeries.series.attachPrimitive) {
              chartSeries.series.attachPrimitive(this.previewFibonacciArcMark);
            }
            this.fibonacciArcMarks.forEach(m => m.setShowHandles(false));
            if (this.previewFibonacciArcMark.setShowHandles) {
              this.previewFibonacciArcMark.setShowHandles(true);
            }
          } else {
            if (this.previewFibonacciArcMark) {
              const startPrice = this.previewFibonacciArcMark.getStartPrice();
              const startTime = this.previewFibonacciArcMark.getStartTime();
              if (chartSeries.series.detachPrimitive) {
                chartSeries.series.detachPrimitive(this.previewFibonacciArcMark);
              }
              const finalFibonacciArcMark = new FibonacciArcMark(
                startPrice,
                price,
                startTime,
                time.toString(),
                '#2962FF',
                1,
                false,
                3
              );
              if (chartSeries.series.attachPrimitive) {
                chartSeries.series.attachPrimitive(finalFibonacciArcMark);
              }
              this.fibonacciArcMarks.push(finalFibonacciArcMark);
              this.previewFibonacciArcMark = null;
              if (finalFibonacciArcMark.setShowHandles) {
                finalFibonacciArcMark.setShowHandles(true);
              }
            }
            this.state = {
              ...this.state,
              isFibonacciArcMode: false,
              fibonacciArcStartPoint: null,
              currentFibonacciArc: null
            };
            if (this.props.onCloseDrawing) {
              this.props.onCloseDrawing();
            }
          }
        } else if (!this.state.isFibonacciArcMode) {
          this.fibonacciArcMarks.forEach(mark => {
            if (mark.setShowHandles) {
              mark.setShowHandles(false);
            }
          });
        }
      }
    } catch (error) {
      this.state = this.cancelFibonacciArcMode();
    }
    return this.state;
  };

  private coordinateToPriceFallback(y: number): number {
    const { chartSeries } = this.props;
    if (!chartSeries || !chartSeries.series) return 100;
    try {
      const data = chartSeries.series.data();
      if (data && data.length > 0) {
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;
        data.forEach((item: any) => {
          if (item.value !== undefined) {
            if (item.value < min) min = item.value;
            if (item.value > max) max = item.value;
          }
          if (item.low !== undefined && item.high !== undefined) {
            if (item.low < min) min = item.low;
            if (item.high > max) max = item.high;
          }
        });
        if (min > max) {
          min = 0;
          max = 100;
        }
        const margin = (max - min) * 0.1;
        const chartElement = this.props.chart?.chartElement();
        const chartHeight = chartElement?.clientHeight || 500;
        const percent = 1 - (y / chartHeight);
        return min - margin + (max - min + 2 * margin) * percent;
      }
    } catch (error) {
    }
    return 100;
  }

  private priceToCoordinateFallback(price: number): number {
    const { chartSeries } = this.props;
    if (!chartSeries || !chartSeries.series) return 250;
    try {
      const data = chartSeries.series.data();
      if (data && data.length > 0) {
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;
        data.forEach((item: any) => {
          if (item.value !== undefined) {
            if (item.value < min) min = item.value;
            if (item.value > max) max = item.value;
          }
          if (item.low !== undefined && item.high !== undefined) {
            if (item.low < min) min = item.low;
            if (item.high > max) max = item.high;
          }
        });
        if (min > max) {
          min = 0;
          max = 100;
        }
        const margin = (max - min) * 0.1;
        const chartElement = this.props.chart?.chartElement();
        const chartHeight = chartElement?.clientHeight || 500;
        const normalizedPrice = Math.max(min - margin, Math.min(max + margin, price));
        const percent = (normalizedPrice - (min - margin)) / ((max + margin) - (min - margin));
        return chartHeight * (1 - percent);
      }
    } catch (error) {
    }
    return 250;
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
      let price: number | null = null;
      let time: number | null = null;
      try {
        time = timeScale.coordinateToTime(relativeX);
        if (chartSeries.series && typeof chartSeries.series.coordinateToPrice === 'function') {
          price = chartSeries.series.coordinateToPrice(relativeY);
        } else {
          price = this.coordinateToPriceFallback(relativeY);
        }
      } catch (error) {
        return;
      }
      if (time === null || price === null) return;
      if (this.state.isDragging && this.state.dragTarget && this.dragStartData &&
        (this.state.dragPoint === 'start' || this.state.dragPoint === 'end')) {
        let currentStartY: number | null = null;
        let currentY: number | null = null;
        let currentStartX: number | null = null;
        let currentX: number | null = null;
        if (chartSeries.series && typeof chartSeries.series.priceToCoordinate === 'function') {
          currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
          currentY = chartSeries.series.priceToCoordinate(price);
        } else {
          currentStartY = this.priceToCoordinateFallback(this.dragStartData.price);
          currentY = this.priceToCoordinateFallback(price);
        }
        currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
        currentX = timeScale.timeToCoordinate(time);
        if (currentStartY === null || currentY === null || currentStartX === null || currentX === null) return;
        const deltaY = currentY - currentStartY;
        const deltaX = currentX - currentStartX;
        if (this.state.dragTarget.dragHandleByPixels) {
          this.state.dragTarget.dragHandleByPixels(deltaY, deltaX, this.state.dragPoint);
        }
        this.dragStartData = { time, price };
        return;
      }
      if (this.state.isDragging && this.state.dragTarget && this.dragStartData &&
        this.state.dragPoint === 'line') {
        let currentStartY: number | null = null;
        let currentY: number | null = null;
        let currentStartX: number | null = null;
        let currentX: number | null = null;
        if (chartSeries.series && typeof chartSeries.series.priceToCoordinate === 'function') {
          currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
          currentY = chartSeries.series.priceToCoordinate(price);
        } else {
          currentStartY = this.priceToCoordinateFallback(this.dragStartData.price);
          currentY = this.priceToCoordinateFallback(price);
        }
        currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
        currentX = timeScale.timeToCoordinate(time);
        if (currentStartY === null || currentY === null || currentStartX === null || currentX === null) return;
        const deltaY = currentY - currentStartY;
        const deltaX = currentX - currentStartX;
        if (this.state.dragTarget.dragLineByPixels) {
          this.state.dragTarget.dragLineByPixels(deltaY, deltaX);
        }
        this.dragStartData = { time, price };
        return;
      }
      if (!this.state.isDragging) {
        if (this.state.fibonacciArcStartPoint && this.previewFibonacciArcMark) {
          if (this.previewFibonacciArcMark.updateEndPoint) {
            this.previewFibonacciArcMark.updateEndPoint(price, time.toString());
          }
          try {
            if (chart.timeScale().widthChanged) {
              chart.timeScale().widthChanged();
            }
          } catch (e) {
            console.error('宽度变化触发失败', e);
          }
        }
        if (!this.state.isFibonacciArcMode && !this.state.fibonacciArcStartPoint) {
          let anyArcHovered = false;
          for (const mark of this.fibonacciArcMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            const isNearArc = mark.isPointNearArc(relativeX, relativeY) !== null;
            const shouldShow = !!handleType || isNearArc;
            if (mark.setShowHandles) {
              mark.setShowHandles(shouldShow);
            }
            if (shouldShow) anyArcHovered = true;
          }
        }
      }
    } catch (error) {
      console.error('error', error);
    }
  };

  public handleMouseUp = (point: Point): FibonacciArcMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end' || this.state.dragPoint === 'line') {
        this.state = {
          ...this.state,
          isFibonacciArcMode: false,
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
    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): FibonacciArcMarkState => {
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
      } else if (this.state.isFibonacciArcMode) {
        return this.cancelFibonacciArcMode();
      }
    }
    return this.state;
  };

  public getState(): FibonacciArcMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<FibonacciArcMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewFibonacciArcMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciArcMark);
      this.previewFibonacciArcMark = null;
    }
    this.fibonacciArcMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.fibonacciArcMarks = [];
  }

  public getFibonacciArcMarks(): FibonacciArcMark[] {
    return [...this.fibonacciArcMarks];
  }

  public removeFibonacciArcMark(mark: FibonacciArcMark): void {
    const index = this.fibonacciArcMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.fibonacciArcMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isFibonacciArcMode;
  }
}