import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { FibonacciSpiralMark } from "../../Graph/Fibonacci/FibonacciSpiralMark";
import { IMarkManager } from "../../IMarkManager";

export interface FibonacciSpiralMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface FibonacciSpiralMarkState {
  isFibonacciSpiralMode: boolean;
  fibonacciSpiralCenterPoint: Point | null;
  currentFibonacciSpiral: FibonacciSpiralMark | null;
  isDragging: boolean;
  dragTarget: FibonacciSpiralMark | null;
  dragPoint: 'center' | 'radius' | 'spiral' | null;
}

export class FibonacciSpiralMarkManager implements IMarkManager<FibonacciSpiralMark> {
  private props: FibonacciSpiralMarkManagerProps;
  private state: FibonacciSpiralMarkState;
  private previewFibonacciSpiralMark: FibonacciSpiralMark | null = null;
  private fibonacciSpiralMarks: FibonacciSpiralMark[] = [];
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: FibonacciSpiralMarkManagerProps) {
    this.props = props;
    this.state = {
      isFibonacciSpiralMode: false,
      fibonacciSpiralCenterPoint: null,
      currentFibonacciSpiral: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): FibonacciSpiralMark | null {
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
      for (const mark of this.fibonacciSpiralMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.fibonacciSpiralMarks) {
        const nearSpiral = mark.isPointNearSpiral(relativeX, relativeY);
        if (nearSpiral) {
          return mark;
        }
      }
    } catch (error) {
      console.error('Error getting mark at point:', error);
    }
    return null;
  }

  public getCurrentDragTarget(): FibonacciSpiralMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): FibonacciSpiralMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewFibonacciSpiralMark) {
      return this.previewFibonacciSpiralMark;
    }
    if (this.state.isFibonacciSpiralMode && this.state.currentFibonacciSpiral) {
      return this.state.currentFibonacciSpiral;
    }
    return null;
  }

  public getAllMarks(): FibonacciSpiralMark[] {
    return [...this.fibonacciSpiralMarks];
  }

  public cancelOperationMode() {
    return this.cancelFibonacciSpiralMode();
  }

  public setFibonacciSpiralMode = (): FibonacciSpiralMarkState => {
    this.state = {
      ...this.state,
      isFibonacciSpiralMode: true,
      fibonacciSpiralCenterPoint: null,
      currentFibonacciSpiral: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelFibonacciSpiralMode = (): FibonacciSpiralMarkState => {
    if (this.previewFibonacciSpiralMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciSpiralMark);
      this.previewFibonacciSpiralMark = null;
    }
    this.fibonacciSpiralMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isFibonacciSpiralMode: false,
      fibonacciSpiralCenterPoint: null,
      currentFibonacciSpiral: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): FibonacciSpiralMarkState => {
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
      for (const mark of this.fibonacciSpiralMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          this.state = {
            ...this.state,
            isFibonacciSpiralMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.fibonacciSpiralMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          mark.setDragging(true, handleType);
          this.isOperating = true;
          handleFound = true;
          break;
        }
      }
      if (!handleFound) {
        let spiralFound = false;
        for (const mark of this.fibonacciSpiralMarks) {
          const nearSpiral = mark.isPointNearSpiral(relativeX, relativeY);
          if (nearSpiral) {
            this.state = {
              ...this.state,
              isFibonacciSpiralMode: true,
              isDragging: true,
              dragTarget: mark,
              dragPoint: 'spiral'
            };
            this.fibonacciSpiralMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            mark.setDragging(true, 'spiral');
            this.isOperating = true;
            spiralFound = true;
            break;
          }
        }
        if (!spiralFound && this.state.isFibonacciSpiralMode) {
          if (!this.state.fibonacciSpiralCenterPoint) {
            this.state = {
              ...this.state,
              fibonacciSpiralCenterPoint: point,
              currentFibonacciSpiral: null
            };
            const initialRadius = Math.abs(price) * 0.01;
            this.previewFibonacciSpiralMark = new FibonacciSpiralMark(
              price,
              time.toString(),
              initialRadius,
              '#2962FF',
              1,
              true
            );
            if (chartSeries.series.attachPrimitive) {
              chartSeries.series.attachPrimitive(this.previewFibonacciSpiralMark);
            }
            this.fibonacciSpiralMarks.forEach(m => m.setShowHandles(false));
            if (this.previewFibonacciSpiralMark.setShowHandles) {
              this.previewFibonacciSpiralMark.setShowHandles(true);
            }
          } else {
            if (this.previewFibonacciSpiralMark) {
              const centerPrice = this.previewFibonacciSpiralMark.getCenterPrice();
              const centerTime = this.previewFibonacciSpiralMark.getCenterTime();
              const radius = this.previewFibonacciSpiralMark.getRadius();
              if (chartSeries.series.detachPrimitive) {
                chartSeries.series.detachPrimitive(this.previewFibonacciSpiralMark);
              }
              const finalFibonacciSpiralMark = new FibonacciSpiralMark(
                centerPrice,
                centerTime,
                radius,
                '#2962FF',
                1,
                false
              );
              if (chartSeries.series.attachPrimitive) {
                chartSeries.series.attachPrimitive(finalFibonacciSpiralMark);
              }
              this.fibonacciSpiralMarks.push(finalFibonacciSpiralMark);
              this.previewFibonacciSpiralMark = null;
              if (finalFibonacciSpiralMark.setShowHandles) {
                finalFibonacciSpiralMark.setShowHandles(true);
              }
            }
            this.state = {
              ...this.state,
              isFibonacciSpiralMode: false,
              fibonacciSpiralCenterPoint: null,
              currentFibonacciSpiral: null
            };
            if (this.props.onCloseDrawing) {
              this.props.onCloseDrawing();
            }
          }
        } else if (!this.state.isFibonacciSpiralMode) {
          this.fibonacciSpiralMarks.forEach(mark => {
            if (mark.setShowHandles) {
              mark.setShowHandles(false);
            }
          });
        }
      }
    } catch (error) {
      this.state = this.cancelFibonacciSpiralMode();
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

      if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
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

        if (this.state.dragPoint === 'center' || this.state.dragPoint === 'radius') {
          if (this.state.dragTarget.dragHandleByPixels) {
            this.state.dragTarget.dragHandleByPixels(deltaY, deltaX, this.state.dragPoint);
          }
        } else if (this.state.dragPoint === 'spiral') {
          if (this.state.dragTarget.dragSpiralByPixels) {
            this.state.dragTarget.dragSpiralByPixels(deltaY, deltaX);
          }
        }
        this.dragStartData = { time, price };
        return;
      }

      if (!this.state.isDragging) {
        if (this.state.fibonacciSpiralCenterPoint && this.previewFibonacciSpiralMark) {

          const centerPrice = this.previewFibonacciSpiralMark.getCenterPrice();
          const centerTime = this.previewFibonacciSpiralMark.getCenterTime();

          const centerY = chartSeries.series.priceToCoordinate(centerPrice);
          const timeScale = chart.timeScale();
          const centerX = timeScale.timeToCoordinate(centerTime);

          if (centerY !== null && centerX !== null) {

            const dx = relativeX - centerX;
            const dy = relativeY - centerY;
            const pixelDistance = Math.sqrt(dx * dx + dy * dy);


            const radiusY = centerY + pixelDistance;
            const radiusPrice = chartSeries.series.coordinateToPrice(radiusY);
            const newRadiusPrice = Math.abs(radiusPrice - centerPrice);

            if (this.previewFibonacciSpiralMark.updateRadius) {
              this.previewFibonacciSpiralMark.updateRadius(newRadiusPrice);
            }


            const angle = Math.atan2(dy, dx);
            const radiusPointX = centerX + pixelDistance * Math.cos(angle);
            const radiusPointY = centerY + pixelDistance * Math.sin(angle);
            this.previewFibonacciSpiralMark.setRadiusPoint({ x: radiusPointX, y: radiusPointY });
          }

          try {
            if (chart.timeScale().widthChanged) {
              chart.timeScale().widthChanged();
            }
          } catch (e) {
            console.error('宽度变化触发失败', e);
          }
        }

        if (!this.state.isFibonacciSpiralMode && !this.state.fibonacciSpiralCenterPoint) {
          let anySpiralHovered = false;
          for (const mark of this.fibonacciSpiralMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            const isNearSpiral = mark.isPointNearSpiral(relativeX, relativeY);
            const shouldShow = !!handleType || isNearSpiral;
            if (mark.setShowHandles) {
              mark.setShowHandles(shouldShow);
            }
            if (shouldShow) anySpiralHovered = true;
          }
        }
      }
    } catch (error) {
      console.error('error', error);
    }
  };

  public handleMouseUp = (point: Point): FibonacciSpiralMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'center' || this.state.dragPoint === 'radius' || this.state.dragPoint === 'spiral') {
        this.state = {
          ...this.state,
          isFibonacciSpiralMode: false,
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

  public handleKeyDown = (event: KeyboardEvent): FibonacciSpiralMarkState => {
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
      } else if (this.state.isFibonacciSpiralMode) {
        return this.cancelFibonacciSpiralMode();
      }
    }
    return this.state;
  };

  public getState(): FibonacciSpiralMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<FibonacciSpiralMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewFibonacciSpiralMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciSpiralMark);
      this.previewFibonacciSpiralMark = null;
    }
    this.fibonacciSpiralMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.fibonacciSpiralMarks = [];
  }

  public getFibonacciSpiralMarks(): FibonacciSpiralMark[] {
    return [...this.fibonacciSpiralMarks];
  }

  public removeFibonacciSpiralMark(mark: FibonacciSpiralMark): void {
    const index = this.fibonacciSpiralMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.fibonacciSpiralMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isFibonacciSpiralMode;
  }
}