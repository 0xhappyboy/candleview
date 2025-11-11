import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { FibonacciRetracementMark } from "../../Graph/Fibonacci/FibonacciRetracementMark";
import { IMarkManager } from "../../IMarkManager";

export interface FibonacciRetracementMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface FibonacciRetracementMarkState {
  isFibonacciRetracementMode: boolean;
  fibonacciRetracementStartPoint: Point | null;
  currentFibonacciRetracement: FibonacciRetracementMark | null;
  isDragging: boolean;
  dragTarget: FibonacciRetracementMark | null;
  dragPoint: 'start' | 'end' | 'line' | null;
}

export class FibonacciRetracementMarkManager implements IMarkManager<FibonacciRetracementMark> {
  private props: FibonacciRetracementMarkManagerProps;
  private state: FibonacciRetracementMarkState;
  private previewFibonacciRetracementMark: FibonacciRetracementMark | null = null;
  private fibonacciRetracementMarks: FibonacciRetracementMark[] = [];
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: FibonacciRetracementMarkManagerProps) {
    this.props = props;
    this.state = {
      isFibonacciRetracementMode: false,
      fibonacciRetracementStartPoint: null,
      currentFibonacciRetracement: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): FibonacciRetracementMark | null {
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
      for (const mark of this.fibonacciRetracementMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.fibonacciRetracementMarks) {
        const nearLine = mark.isPointNearFibonacciLine(relativeX, relativeY);
        if (nearLine !== null) {
          return mark;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public getCurrentDragTarget(): FibonacciRetracementMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): FibonacciRetracementMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewFibonacciRetracementMark) {
      return this.previewFibonacciRetracementMark;
    }
    if (this.state.isFibonacciRetracementMode && this.state.currentFibonacciRetracement) {
      return this.state.currentFibonacciRetracement;
    }
    return null;
  }

  public getAllMarks(): FibonacciRetracementMark[] {
    return [...this.fibonacciRetracementMarks];
  }

  public cancelOperationMode() {
    return this.cancelFibonacciRetracementMode();
  }

  public setFibonacciRetracementMode = (): FibonacciRetracementMarkState => {
    this.state = {
      ...this.state,
      isFibonacciRetracementMode: true,
      fibonacciRetracementStartPoint: null,
      currentFibonacciRetracement: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelFibonacciRetracementMode = (): FibonacciRetracementMarkState => {
    if (this.previewFibonacciRetracementMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciRetracementMark);
      this.previewFibonacciRetracementMark = null;
    }
    this.fibonacciRetracementMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isFibonacciRetracementMode: false,
      fibonacciRetracementStartPoint: null,
      currentFibonacciRetracement: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): FibonacciRetracementMarkState => {
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
      for (const mark of this.fibonacciRetracementMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          this.state = {
            ...this.state,
            isFibonacciRetracementMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.fibonacciRetracementMarks.forEach(m => {
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
        for (const mark of this.fibonacciRetracementMarks) {
          const nearLine = mark.isPointNearFibonacciLine(relativeX, relativeY);
          if (nearLine !== null) {
            this.state = {
              ...this.state,
              isFibonacciRetracementMode: true,
              isDragging: true,
              dragTarget: mark,
              dragPoint: 'line'
            };
            this.fibonacciRetracementMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            mark.setDragging(true, 'line');
            this.isOperating = true;
            lineFound = true;
            break;
          }
        }
        if (!lineFound && this.state.isFibonacciRetracementMode) {
          if (!this.state.fibonacciRetracementStartPoint) {
            this.state = {
              ...this.state,
              fibonacciRetracementStartPoint: point,
              currentFibonacciRetracement: null
            };
            this.previewFibonacciRetracementMark = new FibonacciRetracementMark(
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
              chartSeries.series.attachPrimitive(this.previewFibonacciRetracementMark);
            }
            this.fibonacciRetracementMarks.forEach(m => m.setShowHandles(false));
            if (this.previewFibonacciRetracementMark.setShowHandles) {
              this.previewFibonacciRetracementMark.setShowHandles(true);
            }
          } else {
            if (this.previewFibonacciRetracementMark) {
              const startPrice = this.previewFibonacciRetracementMark.getStartPrice();
              const startTime = this.previewFibonacciRetracementMark.getStartTime();
              if (chartSeries.series.detachPrimitive) {
                chartSeries.series.detachPrimitive(this.previewFibonacciRetracementMark);
              }
              const finalFibonacciRetracementMark = new FibonacciRetracementMark(
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
                chartSeries.series.attachPrimitive(finalFibonacciRetracementMark);
              }
              this.fibonacciRetracementMarks.push(finalFibonacciRetracementMark);
              this.previewFibonacciRetracementMark = null;
              if (finalFibonacciRetracementMark.setShowHandles) {
                finalFibonacciRetracementMark.setShowHandles(true);
              }
            }
            this.state = {
              ...this.state,
              isFibonacciRetracementMode: false,
              fibonacciRetracementStartPoint: null,
              currentFibonacciRetracement: null
            };
            if (this.props.onCloseDrawing) {
              this.props.onCloseDrawing();
            }
          }
        } else if (!this.state.isFibonacciRetracementMode) {
          this.fibonacciRetracementMarks.forEach(mark => {
            if (mark.setShowHandles) {
              mark.setShowHandles(false);
            }
          });
        }
      }
    } catch (error) {
      this.state = this.cancelFibonacciRetracementMode();
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

  private getPriceRange(): { min: number; max: number } | null {
    const { chartSeries } = this.props;
    if (!chartSeries || !chartSeries.series) return null;
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
          return { min: 0, max: 100 };
        }
        const margin = (max - min) * 0.1;
        return { min: min - margin, max: max + margin };
      }
    } catch (error) {
    }

    return { min: 0, max: 100 };
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
        if (this.state.fibonacciRetracementStartPoint && this.previewFibonacciRetracementMark) {
          console.log('更新预览终点', price, time.toString());
          if (this.previewFibonacciRetracementMark.updateEndPoint) {
            this.previewFibonacciRetracementMark.updateEndPoint(price, time.toString());
          }
          try {
            if (chart.timeScale().widthChanged) {
              // chart.timeScale().widthChanged();
            }
          } catch (e) {
            console.error(e);
          }
        }
        if (!this.state.isFibonacciRetracementMode && !this.state.fibonacciRetracementStartPoint) {
          let anyLineHovered = false;
          for (const mark of this.fibonacciRetracementMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            const isNearLine = mark.isPointNearFibonacciLine(relativeX, relativeY) !== null;
            const shouldShow = !!handleType || isNearLine;
            if (mark.setShowHandles) {
              mark.setShowHandles(shouldShow);
            }
            if (shouldShow) anyLineHovered = true;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  public handleMouseUp = (point: Point): FibonacciRetracementMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end' || this.state.dragPoint === 'line') {
        this.state = {
          ...this.state,
          isFibonacciRetracementMode: false,
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

  public handleKeyDown = (event: KeyboardEvent): FibonacciRetracementMarkState => {
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
      } else if (this.state.isFibonacciRetracementMode) {
        return this.cancelFibonacciRetracementMode();
      }
    }
    return this.state;
  };

  public getState(): FibonacciRetracementMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<FibonacciRetracementMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewFibonacciRetracementMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciRetracementMark);
      this.previewFibonacciRetracementMark = null;
    }
    this.fibonacciRetracementMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.fibonacciRetracementMarks = [];
  }

  public getFibonacciRetracementMarks(): FibonacciRetracementMark[] {
    return [...this.fibonacciRetracementMarks];
  }

  public removeFibonacciRetracementMark(mark: FibonacciRetracementMark): void {
    const index = this.fibonacciRetracementMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.fibonacciRetracementMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isFibonacciRetracementMode;
  }
}