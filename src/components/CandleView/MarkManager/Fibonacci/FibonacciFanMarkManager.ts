import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { FibonacciFanMark } from "../../Mark/Fibonacci/FibonacciFanMark";
import { IMarkManager } from "../../Mark/IMarkManager";
import { Point } from "../../types";

export interface FibonacciFanMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface FibonacciFanMarkState {
  isFibonacciFanMode: boolean;
  fibonacciFanStartPoint: Point | null;
  currentFibonacciFan: FibonacciFanMark | null;
  isDragging: boolean;
  dragTarget: FibonacciFanMark | null;
  dragPoint: 'start' | 'center' | 'fan' | null;
  isDrawing: boolean;
}

interface DragStartData {
  time: string;
  price: number;
  x: number;
  y: number;
}

export class FibonacciFanMarkManager implements IMarkManager<FibonacciFanMark> {
  private props: FibonacciFanMarkManagerProps;
  private state: FibonacciFanMarkState;
  private previewFibonacciFan: FibonacciFanMark | null = null;
  private fibonacciFans: FibonacciFanMark[] = [];
  private isOperating: boolean = false;
  private dragStartData: DragStartData | null = null;

  constructor(props: FibonacciFanMarkManagerProps) {
    this.props = props;
    this.state = {
      isFibonacciFanMode: false,
      fibonacciFanStartPoint: null,
      currentFibonacciFan: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }

  public clearState(): void {
    this.state = {
      isFibonacciFanMode: false,
      fibonacciFanStartPoint: null,
      currentFibonacciFan: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }

  public getMarkAtPoint(point: Point): FibonacciFanMark | null {
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

      for (const mark of this.fibonacciFans) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }

      for (const mark of this.fibonacciFans) {
        if (mark.isPointInBounds(relativeX, relativeY)) {
          return mark;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public getCurrentDragTarget(): FibonacciFanMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): FibonacciFanMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewFibonacciFan) {
      return this.previewFibonacciFan;
    }
    if (this.state.isFibonacciFanMode && this.state.currentFibonacciFan) {
      return this.state.currentFibonacciFan;
    }
    return null;
  }

  public getAllMarks(): FibonacciFanMark[] {
    return [...this.fibonacciFans];
  }

  public cancelOperationMode() {
    return this.cancelFibonacciFanMode();
  }

  public setFibonacciFanMode = (): FibonacciFanMarkState => {
    this.state = {
      ...this.state,
      isFibonacciFanMode: true,
      fibonacciFanStartPoint: null,
      currentFibonacciFan: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
    return this.state;
  };

  public cancelFibonacciFanMode = (): FibonacciFanMarkState => {
    if (this.previewFibonacciFan) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciFan);
      this.previewFibonacciFan = null;
    }

    this.fibonacciFans.forEach(mark => {
      mark.setShowHandles(false);
    });

    this.state = {
      ...this.state,
      isFibonacciFanMode: false,
      fibonacciFanStartPoint: null,
      currentFibonacciFan: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
    this.isOperating = false;
    return this.state;
  };

  private getValidTimeFromCoordinate(chart: any, x: number): string | null {
    try {
      const timeScale = chart.timeScale();
      const time = timeScale.coordinateToTime(x);
      if (time === null) {
        const series = chart.series();
        const data = series?.data();
        if (data && data.length > 0) {
          return data[0].time;
        }
        return null;
      }
      return time.toString();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public handleMouseDown = (point: Point): FibonacciFanMarkState => {
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

      const time = this.getValidTimeFromCoordinate(chart, relativeX);
      const price = chartSeries.series.coordinateToPrice(relativeY);

      if (time === null || price === null) {
        console.warn('Cannot get valid time or price from coordinates');
        return this.state;
      }

      for (const mark of this.fibonacciFans) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          this.dragStartData = {
            time: time,
            price: price,
            x: relativeX,
            y: relativeY
          };
          this.state = {
            ...this.state,
            isFibonacciFanMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.fibonacciFans.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }

      for (const mark of this.fibonacciFans) {
        if (mark.isPointInBounds(relativeX, relativeY)) {
          this.dragStartData = {
            time: time,
            price: price,
            x: relativeX,
            y: relativeY
          };
          this.state = {
            ...this.state,
            isDragging: true,
            dragTarget: mark,
            dragPoint: 'fan'
          };
          mark.setDragging(true, 'start');
          this.fibonacciFans.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }

      if (this.state.isFibonacciFanMode && !this.state.isDragging) {
        if (!this.state.isDrawing) {
          this.state = {
            ...this.state,
            fibonacciFanStartPoint: point,
            isDrawing: true
          };

          this.previewFibonacciFan = new FibonacciFanMark(
            time,
            price,
            time,
            price,
            '#2962FF',
            2,
            true
          );

          try {
            chartSeries.series.attachPrimitive(this.previewFibonacciFan);
            this.fibonacciFans.forEach(m => m.setShowHandles(false));
          } catch (error) {
            console.error(error);
            this.previewFibonacciFan = null;
            this.state.isDrawing = false;
          }
        } else {

          if (this.previewFibonacciFan) {
            try {
              chartSeries.series.detachPrimitive(this.previewFibonacciFan);
              const finalFibonacciFan = new FibonacciFanMark(
                this.previewFibonacciFan.time(),
                this.previewFibonacciFan.priceValue(),
                time,
                price,
                '#2962FF',
                2,
                false
              );
              chartSeries.series.attachPrimitive(finalFibonacciFan);
              this.fibonacciFans.push(finalFibonacciFan);
              this.previewFibonacciFan = null;
              finalFibonacciFan.setShowHandles(true);
            } catch (error) {
              console.error(error);
            }
          }

          this.state = {
            ...this.state,
            isFibonacciFanMode: false,
            fibonacciFanStartPoint: null,
            currentFibonacciFan: null,
            isDrawing: false
          };

          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelFibonacciFanMode();
    }
    return this.state;
  };

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

      const time = this.getValidTimeFromCoordinate(chart, relativeX);
      const price = chartSeries.series.coordinateToPrice(relativeY);

      if (time === null || price === null) return;

      if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
        if (this.state.dragPoint === 'start') {
          this.state.dragTarget.updateStartPoint(time, price);
        } else if (this.state.dragPoint === 'center') {
          this.state.dragTarget.updateEndPoint(time, price);
        } else if (this.state.dragPoint === 'fan') {
          const deltaX = relativeX - this.dragStartData.x;
          const deltaY = relativeY - this.dragStartData.y;
          this.state.dragTarget.dragFibonacciFanByPixels(deltaX, deltaY);
          this.dragStartData = {
            time: this.dragStartData.time,
            price: this.dragStartData.price,
            x: relativeX,
            y: relativeY
          };
        }
        return;
      }

      if (this.state.isDrawing && this.previewFibonacciFan) {
        this.previewFibonacciFan.updateEndPoint(time, price);
        // chart.timeScale().widthChanged();
      }

      if (!this.state.isFibonacciFanMode && !this.state.isDragging && !this.state.isDrawing) {
        let anyFibonacciFanHovered = false;
        for (const mark of this.fibonacciFans) {
          const handleType = mark.isPointNearHandle(relativeX, relativeY);
          const isInBounds = mark.isPointInBounds(relativeX, relativeY);
          const shouldShow = !!handleType || isInBounds;
          mark.setShowHandles(shouldShow);
          if (shouldShow) anyFibonacciFanHovered = true;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  public handleMouseUp = (point: Point): FibonacciFanMarkState => {
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
      this.isOperating = false;

      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'center') {
        this.state.isFibonacciFanMode = true;
      } else {
        this.state.isFibonacciFanMode = false;
        if (this.props.onCloseDrawing) {
          this.props.onCloseDrawing();
        }
      }
    }
    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): FibonacciFanMarkState => {
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
      } else if (this.state.isFibonacciFanMode || this.state.isDrawing) {
        return this.cancelFibonacciFanMode();
      }
    }
    return this.state;
  };

  public getState(): FibonacciFanMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<FibonacciFanMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewFibonacciFan) {
      this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciFan);
      this.previewFibonacciFan = null;
    }
    this.fibonacciFans.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.fibonacciFans = [];
  }

  public getFibonacciFans(): FibonacciFanMark[] {
    return [...this.fibonacciFans];
  }

  public removeFibonacciFan(mark: FibonacciFanMark): void {
    const index = this.fibonacciFans.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.fibonacciFans.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isFibonacciFanMode || this.state.isDrawing;
  }
}