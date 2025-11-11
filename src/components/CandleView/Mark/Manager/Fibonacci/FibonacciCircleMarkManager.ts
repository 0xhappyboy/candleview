import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { FibonacciCircleMark } from "../../Graph/Fibonacci/FibonacciCircleMark";
import { IMarkManager } from "../../IMarkManager";

export interface FibonacciCircleMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface FibonacciCircleMarkState {
  isFibonacciCircleMode: boolean;
  fibonacciCircleCenterPoint: Point | null;
  currentFibonacciCircle: FibonacciCircleMark | null;
  isDragging: boolean;
  dragTarget: FibonacciCircleMark | null;
  dragPoint: 'center' | 'radius' | 'circle' | null;
}

export class FibonacciCircleMarkManager implements IMarkManager<FibonacciCircleMark> {
  private props: FibonacciCircleMarkManagerProps;
  private state: FibonacciCircleMarkState;
  private previewFibonacciCircleMark: FibonacciCircleMark | null = null;
  private fibonacciCircleMarks: FibonacciCircleMark[] = [];
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: FibonacciCircleMarkManagerProps) {
    this.props = props;
    this.state = {
      isFibonacciCircleMode: false,
      fibonacciCircleCenterPoint: null,
      currentFibonacciCircle: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): FibonacciCircleMark | null {
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

      for (const mark of this.fibonacciCircleMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }

      for (const mark of this.fibonacciCircleMarks) {
        const nearCircle = mark.isPointNearFibonacciCircle(relativeX, relativeY);
        if (nearCircle !== null) {
          return mark;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public getCurrentDragTarget(): FibonacciCircleMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): FibonacciCircleMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewFibonacciCircleMark) {
      return this.previewFibonacciCircleMark;
    }
    if (this.state.isFibonacciCircleMode && this.state.currentFibonacciCircle) {
      return this.state.currentFibonacciCircle;
    }
    return null;
  }

  public getAllMarks(): FibonacciCircleMark[] {
    return [...this.fibonacciCircleMarks];
  }

  public cancelOperationMode() {
    return this.cancelFibonacciCircleMode();
  }

  public setFibonacciCircleMode = (): FibonacciCircleMarkState => {
    this.state = {
      ...this.state,
      isFibonacciCircleMode: true,
      fibonacciCircleCenterPoint: null,
      currentFibonacciCircle: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelFibonacciCircleMode = (): FibonacciCircleMarkState => {
    if (this.previewFibonacciCircleMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciCircleMark);
      this.previewFibonacciCircleMark = null;
    }
    this.fibonacciCircleMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isFibonacciCircleMode: false,
      fibonacciCircleCenterPoint: null,
      currentFibonacciCircle: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): FibonacciCircleMarkState => {
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

      for (const mark of this.fibonacciCircleMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          this.state = {
            ...this.state,
            isFibonacciCircleMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.fibonacciCircleMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          mark.setDragging(true, handleType);
          this.isOperating = true;
          handleFound = true;
          break;
        }
      }

      if (!handleFound) {
        let circleFound = false;
        for (const mark of this.fibonacciCircleMarks) {
          const nearCircle = mark.isPointNearFibonacciCircle(relativeX, relativeY);
          if (nearCircle !== null) {
            this.state = {
              ...this.state,
              isFibonacciCircleMode: true,
              isDragging: true,
              dragTarget: mark,
              dragPoint: 'circle'
            };
            this.fibonacciCircleMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            mark.setDragging(true, 'circle');
            this.isOperating = true;
            circleFound = true;
            break;
          }
        }

        if (!circleFound && this.state.isFibonacciCircleMode) {
          if (!this.state.fibonacciCircleCenterPoint) {
            this.state = {
              ...this.state,
              fibonacciCircleCenterPoint: point,
              currentFibonacciCircle: null
            };
            this.previewFibonacciCircleMark = new FibonacciCircleMark(
              price,
              price,
              time.toString(),
              time.toString(),
              '#2962FF',
              1,
              true
            );
            if (chartSeries.series.attachPrimitive) {
              chartSeries.series.attachPrimitive(this.previewFibonacciCircleMark);
            }
            this.fibonacciCircleMarks.forEach(m => m.setShowHandles(false));
            if (this.previewFibonacciCircleMark.setShowHandles) {
              this.previewFibonacciCircleMark.setShowHandles(true);
            }
          } else {
            if (this.previewFibonacciCircleMark) {
              const centerPrice = this.previewFibonacciCircleMark.getCenterPrice();
              const centerTime = this.previewFibonacciCircleMark.getCenterTime();
              if (chartSeries.series.detachPrimitive) {
                chartSeries.series.detachPrimitive(this.previewFibonacciCircleMark);
              }
              const finalFibonacciCircleMark = new FibonacciCircleMark(
                centerPrice,
                price,
                centerTime,
                time.toString(),
                '#2962FF',
                1,
                false
              );
              if (chartSeries.series.attachPrimitive) {
                chartSeries.series.attachPrimitive(finalFibonacciCircleMark);
              }
              this.fibonacciCircleMarks.push(finalFibonacciCircleMark);
              this.previewFibonacciCircleMark = null;
              if (finalFibonacciCircleMark.setShowHandles) {
                finalFibonacciCircleMark.setShowHandles(true);
              }
            }
            this.state = {
              ...this.state,
              isFibonacciCircleMode: false,
              fibonacciCircleCenterPoint: null,
              currentFibonacciCircle: null
            };
            if (this.props.onCloseDrawing) {
              this.props.onCloseDrawing();
            }
          }
        } else if (!this.state.isFibonacciCircleMode) {
          this.fibonacciCircleMarks.forEach(mark => {
            if (mark.setShowHandles) {
              mark.setShowHandles(false);
            }
          });
        }
      }
    } catch (error) {
      this.state = this.cancelFibonacciCircleMode();
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
        (this.state.dragPoint === 'center' || this.state.dragPoint === 'radius')) {
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
        this.state.dragPoint === 'circle') {
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
        if (this.state.dragTarget.dragCircleByPixels) {
          this.state.dragTarget.dragCircleByPixels(deltaY, deltaX);
        }
        this.dragStartData = { time, price };
        return;
      }

      if (!this.state.isDragging) {
        if (this.state.fibonacciCircleCenterPoint && this.previewFibonacciCircleMark) {
          if (this.previewFibonacciCircleMark.updateRadiusPoint) {
            this.previewFibonacciCircleMark.updateRadiusPoint(price, time.toString());
          }
          try {
            if (chart.timeScale().widthChanged) {
              // chart.timeScale().widthChanged();
            }
          } catch (e) {
            console.error(e);
          }
        }

        if (!this.state.isFibonacciCircleMode && !this.state.fibonacciCircleCenterPoint) {
          let anyCircleHovered = false;
          for (const mark of this.fibonacciCircleMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            const isNearCircle = mark.isPointNearFibonacciCircle(relativeX, relativeY) !== null;
            const shouldShow = !!handleType || isNearCircle;
            if (mark.setShowHandles) {
              mark.setShowHandles(shouldShow);
            }
            if (shouldShow) anyCircleHovered = true;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  public handleMouseUp = (point: Point): FibonacciCircleMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'center' || this.state.dragPoint === 'radius' || this.state.dragPoint === 'circle') {
        this.state = {
          ...this.state,
          isFibonacciCircleMode: false,
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

  public handleKeyDown = (event: KeyboardEvent): FibonacciCircleMarkState => {
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
      } else if (this.state.isFibonacciCircleMode) {
        return this.cancelFibonacciCircleMode();
      }
    }
    return this.state;
  };

  public getState(): FibonacciCircleMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<FibonacciCircleMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewFibonacciCircleMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciCircleMark);
      this.previewFibonacciCircleMark = null;
    }
    this.fibonacciCircleMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.fibonacciCircleMarks = [];
  }

  public getFibonacciCircleMarks(): FibonacciCircleMark[] {
    return [...this.fibonacciCircleMarks];
  }

  public removeFibonacciCircleMark(mark: FibonacciCircleMark): void {
    const index = this.fibonacciCircleMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.fibonacciCircleMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isFibonacciCircleMode;
  }
}