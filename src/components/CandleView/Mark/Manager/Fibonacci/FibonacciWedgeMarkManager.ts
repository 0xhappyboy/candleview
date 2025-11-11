import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { FibonacciWedgeMark } from "../../Graph/Fibonacci/FibonacciWedgeMark";
import { IMarkManager } from "../../IMarkManager";

export interface FibonacciWedgeMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface FibonacciWedgeMarkState {
  isFibonacciWedgeMode: boolean;
  fibonacciWedgePoints: Point[];
  currentFibonacciWedge: FibonacciWedgeMark | null;
  isDragging: boolean;
  dragTarget: FibonacciWedgeMark | null;
  dragPoint: 'center' | 'radius' | 'angle' | 'wedge' | null;
}

export class FibonacciWedgeMarkManager implements IMarkManager<FibonacciWedgeMark> {
  private props: FibonacciWedgeMarkManagerProps;
  private state: FibonacciWedgeMarkState;
  private previewFibonacciWedgeMark: FibonacciWedgeMark | null = null;
  private fibonacciWedgeMarks: FibonacciWedgeMark[] = [];
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: FibonacciWedgeMarkManagerProps) {
    this.props = props;
    this.state = {
      isFibonacciWedgeMode: false,
      fibonacciWedgePoints: [],
      currentFibonacciWedge: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): FibonacciWedgeMark | null {
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

      for (const mark of this.fibonacciWedgeMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }

      for (const mark of this.fibonacciWedgeMarks) {
        const nearWedge = mark.isPointNearFibonacciWedge(relativeX, relativeY);
        if (nearWedge !== null) {
          return mark;
        }
      }
    } catch (error) {
      console.error('Error getting mark at point:', error);
    }
    return null;
  }

  public getCurrentDragTarget(): FibonacciWedgeMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): FibonacciWedgeMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewFibonacciWedgeMark) {
      return this.previewFibonacciWedgeMark;
    }
    if (this.state.isFibonacciWedgeMode && this.state.currentFibonacciWedge) {
      return this.state.currentFibonacciWedge;
    }
    return null;
  }

  public getAllMarks(): FibonacciWedgeMark[] {
    return [...this.fibonacciWedgeMarks];
  }

  public cancelOperationMode() {
    return this.cancelFibonacciWedgeMode();
  }

  public setFibonacciWedgeMode = (): FibonacciWedgeMarkState => {
    this.state = {
      ...this.state,
      isFibonacciWedgeMode: true,
      fibonacciWedgePoints: [],
      currentFibonacciWedge: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelFibonacciWedgeMode = (): FibonacciWedgeMarkState => {
    if (this.previewFibonacciWedgeMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciWedgeMark);
      this.previewFibonacciWedgeMark = null;
    }
    this.fibonacciWedgeMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isFibonacciWedgeMode: false,
      fibonacciWedgePoints: [],
      currentFibonacciWedge: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): FibonacciWedgeMarkState => {
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


      for (const mark of this.fibonacciWedgeMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          this.state = {
            ...this.state,
            isFibonacciWedgeMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.fibonacciWedgeMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          mark.setDragging(true, handleType);
          this.isOperating = true;
          handleFound = true;
          break;
        }
      }
      if (!handleFound) {
        let wedgeFound = false;
        for (const mark of this.fibonacciWedgeMarks) {
          const nearWedge = mark.isPointNearFibonacciWedge(relativeX, relativeY);
          const nearLine = this.isPointNearLine(mark, relativeX, relativeY);

          if (nearWedge !== null || nearLine) {
            this.state = {
              ...this.state,
              isFibonacciWedgeMode: true,
              isDragging: true,
              dragTarget: mark,
              dragPoint: 'wedge'
            };
            this.fibonacciWedgeMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            mark.setDragging(true, 'wedge');
            this.isOperating = true;
            wedgeFound = true;
            break;
          }
        }

        if (!wedgeFound && this.state.isFibonacciWedgeMode) {
          const pointsCount = this.state.fibonacciWedgePoints.length;
          if (pointsCount === 0) {
            this.state = {
              ...this.state,
              fibonacciWedgePoints: [point],
              currentFibonacciWedge: null
            };
            this.previewFibonacciWedgeMark = new FibonacciWedgeMark(
              price, price, price,
              time.toString(), time.toString(), time.toString(),
              '#2962FF', 1, true
            );
            if (chartSeries.series.attachPrimitive) {
              chartSeries.series.attachPrimitive(this.previewFibonacciWedgeMark);
            }
            this.fibonacciWedgeMarks.forEach(m => m.setShowHandles(false));
          } else if (pointsCount === 1) {

            this.state = {
              ...this.state,
              fibonacciWedgePoints: [...this.state.fibonacciWedgePoints, point]
            };
            if (this.previewFibonacciWedgeMark) {
              this.previewFibonacciWedgeMark.updateRadiusPoint(price, time.toString());
            }
          } else if (pointsCount === 2) {

            if (this.previewFibonacciWedgeMark) {
              const centerPrice = this.previewFibonacciWedgeMark.getCenterPrice();
              const centerTime = this.previewFibonacciWedgeMark.getCenterTime();
              const radiusPrice = this.previewFibonacciWedgeMark.getRadiusPrice();
              const radiusTime = this.previewFibonacciWedgeMark.getRadiusTime();

              if (chartSeries.series.detachPrimitive) {
                chartSeries.series.detachPrimitive(this.previewFibonacciWedgeMark);
              }

              const finalFibonacciWedgeMark = new FibonacciWedgeMark(
                centerPrice, radiusPrice, price,
                centerTime, radiusTime, time.toString(),
                '#2962FF', 1, false
              );

              if (chartSeries.series.attachPrimitive) {
                chartSeries.series.attachPrimitive(finalFibonacciWedgeMark);
              }

              this.fibonacciWedgeMarks.push(finalFibonacciWedgeMark);
              this.previewFibonacciWedgeMark = null;
              finalFibonacciWedgeMark.setShowHandles(true);

              this.state = {
                ...this.state,
                isFibonacciWedgeMode: false,
                fibonacciWedgePoints: [],
                currentFibonacciWedge: null
              };

              if (this.props.onCloseDrawing) {
                this.props.onCloseDrawing();
              }
            }
          }
        } else if (!this.state.isFibonacciWedgeMode) {
          this.fibonacciWedgeMarks.forEach(mark => {
            mark.setShowHandles(false);
          });
        }
      }
    } catch (error) {
      this.state = this.cancelFibonacciWedgeMode();
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
        (this.state.dragPoint === 'center' || this.state.dragPoint === 'radius' || this.state.dragPoint === 'angle')) {
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
          this.state.dragTarget.dragHandleByPixels(deltaY, deltaX, this.state.dragPoint as 'center' | 'radius' | 'angle');
        }
        this.dragStartData = { time, price };
        return;
      }
      if (this.state.isDragging && this.state.dragTarget && this.dragStartData && this.state.dragPoint === 'wedge') {
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
        if (this.state.dragTarget.dragWedgeByPixels) {
          this.state.dragTarget.dragWedgeByPixels(deltaY, deltaX);
        }
        this.dragStartData = { time, price };
        return;
      }
      if (!this.state.isDragging) {
        const pointsCount = this.state.fibonacciWedgePoints.length;
        if (pointsCount === 1 && this.previewFibonacciWedgeMark) {
          if (this.previewFibonacciWedgeMark.updateRadiusPoint) {
            this.previewFibonacciWedgeMark.updateRadiusPoint(price, time.toString());
          }
        } else if (pointsCount === 2 && this.previewFibonacciWedgeMark) {
          if (this.previewFibonacciWedgeMark.updateAnglePoint) {
            this.previewFibonacciWedgeMark.updateAnglePoint(price, time.toString());
          }
        }
        if (!this.state.isFibonacciWedgeMode && pointsCount === 0) {
          let anyMarkHovered = false;
          for (const mark of this.fibonacciWedgeMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            const isNearWedge = mark.isPointNearFibonacciWedge(relativeX, relativeY) !== null;
            const isNearLine = this.isPointNearLine(mark, relativeX, relativeY);
            const isInsideWedge = this.isPointInsideWedge(mark, relativeX, relativeY);
            const shouldShow = !!handleType || isNearWedge || isNearLine || isInsideWedge;
            mark.setShowHandles(shouldShow);
            if (shouldShow) anyMarkHovered = true;
          }
          if (!anyMarkHovered) {
            this.fibonacciWedgeMarks.forEach(mark => {
              mark.setShowHandles(false);
            });
          }
        }
      }
    } catch (error) {
      console.error('error', error);
    }
  };

  private isPointInsideWedge(mark: FibonacciWedgeMark, x: number, y: number): boolean {
    if (!this.props.chart || !this.props.chartSeries) return false;
    try {
      const chart = this.props.chart;
      const series = this.props.chartSeries.series;
      const timeScale = chart.timeScale();
      const centerY = series.priceToCoordinate(mark.getCenterPrice());
      const centerX = timeScale.timeToCoordinate(mark.getCenterTime());
      if (centerY === null || centerX === null) return false;
      const distanceToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const maxDistance = 200;
      return distanceToCenter <= maxDistance;
    } catch (error) {
      console.error('Error checking point inside wedge:', error);
    }
    return false;
  }

  private isPointNearLine(mark: FibonacciWedgeMark, x: number, y: number, threshold: number = 10): boolean {
    if (!this.props.chart || !this.props.chartSeries) return false;
    try {
      const chart = this.props.chart;
      const series = this.props.chartSeries.series;
      const timeScale = chart.timeScale();
      const centerY = series.priceToCoordinate(mark.getCenterPrice());
      const centerX = timeScale.timeToCoordinate(mark.getCenterTime());
      const radiusY = series.priceToCoordinate(mark.getRadiusPrice());
      const radiusX = timeScale.timeToCoordinate(mark.getRadiusTime());
      const angleY = series.priceToCoordinate(mark.getAnglePrice());
      const angleX = timeScale.timeToCoordinate(mark.getAngleTime());
      if (centerY === null || centerX === null || radiusY === null ||
        radiusX === null || angleY === null || angleX === null) return false;
      const distToRadiusLine = this.distanceToLine(x, y, centerX, centerY, radiusX, radiusY);
      if (distToRadiusLine <= threshold) return true;
      const distToAngleLine = this.distanceToLine(x, y, centerX, centerY, angleX, angleY);
      if (distToAngleLine <= threshold) return true;
    } catch (error) {
      console.error('Error checking point near line:', error);
    }
    return false;
  }

  private distanceToLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    const xx = x1 + param * C;
    const yy = y1 + param * D;
    return Math.sqrt(Math.pow(px - xx, 2) + Math.pow(py - yy, 2));
  }


  public handleMouseUp = (point: Point): FibonacciWedgeMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'center' || this.state.dragPoint === 'radius' ||
        this.state.dragPoint === 'angle' || this.state.dragPoint === 'wedge') {
        this.state = {
          ...this.state,
          isFibonacciWedgeMode: false,
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

  public handleKeyDown = (event: KeyboardEvent): FibonacciWedgeMarkState => {
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
      } else if (this.state.isFibonacciWedgeMode) {
        return this.cancelFibonacciWedgeMode();
      }
    }
    return this.state;
  };

  public getState(): FibonacciWedgeMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<FibonacciWedgeMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewFibonacciWedgeMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciWedgeMark);
      this.previewFibonacciWedgeMark = null;
    }
    this.fibonacciWedgeMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.fibonacciWedgeMarks = [];
  }

  public getFibonacciWedgeMarks(): FibonacciWedgeMark[] {
    return [...this.fibonacciWedgeMarks];
  }

  public removeFibonacciWedgeMark(mark: FibonacciWedgeMark): void {
    const index = this.fibonacciWedgeMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.fibonacciWedgeMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isFibonacciWedgeMode;
  }
}