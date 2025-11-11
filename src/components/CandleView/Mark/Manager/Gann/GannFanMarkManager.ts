import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { GannFanMark } from "../../Graph/Gann/GannFanMark";
import { IMarkManager } from "../../IMarkManager";

export interface GannFanMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface GannFanMarkState {
  isGannFanMode: boolean;
  gannFanStartPoint: Point | null;
  currentGannFan: GannFanMark | null;
  isDragging: boolean;
  dragTarget: GannFanMark | null;
  dragPoint: 'start' | 'center' | 'fan' | null;
  isDrawing: boolean;
}

interface DragStartData {
  time: string;
  price: number;
  x: number;
  y: number;
}

export class GannFanMarkManager implements IMarkManager<GannFanMark> {
  private props: GannFanMarkManagerProps;
  private state: GannFanMarkState;
  private previewGannFan: GannFanMark | null = null;
  private gannFans: GannFanMark[] = [];
  private isOperating: boolean = false;
  private dragStartData: DragStartData | null = null;

  constructor(props: GannFanMarkManagerProps) {
    this.props = props;
    this.state = {
      isGannFanMode: false,
      gannFanStartPoint: null,
      currentGannFan: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }

  public getMarkAtPoint(point: Point): GannFanMark | null {
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
      for (const mark of this.gannFans) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.gannFans) {
        if (mark.isPointInBounds(relativeX, relativeY)) {
          return mark;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public getCurrentDragTarget(): GannFanMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): GannFanMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewGannFan) {
      return this.previewGannFan;
    }
    if (this.state.isGannFanMode && this.state.currentGannFan) {
      return this.state.currentGannFan;
    }
    return null;
  }

  public getAllMarks(): GannFanMark[] {
    return [...this.gannFans];
  }

  public cancelOperationMode() {
    return this.cancelGannFanMode();
  }

  public setGannFanMode = (): GannFanMarkState => {
    this.state = {
      ...this.state,
      isGannFanMode: true,
      gannFanStartPoint: null,
      currentGannFan: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
    return this.state;
  };

  public cancelGannFanMode = (): GannFanMarkState => {
    if (this.previewGannFan) {
      this.props.chartSeries?.series.detachPrimitive(this.previewGannFan);
      this.previewGannFan = null;
    }

    this.gannFans.forEach(mark => {
      mark.setShowHandles(false);
    });

    this.state = {
      ...this.state,
      isGannFanMode: false,
      gannFanStartPoint: null,
      currentGannFan: null,
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

  public handleMouseDown = (point: Point): GannFanMarkState => {
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
      for (const mark of this.gannFans) {
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
            isGannFanMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.gannFans.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }
      for (const mark of this.gannFans) {
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
          this.gannFans.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }
      if (this.state.isGannFanMode && !this.state.isDragging) {
        if (!this.state.isDrawing) {
          this.state = {
            ...this.state,
            gannFanStartPoint: point,
            isDrawing: true
          };
          this.previewGannFan = new GannFanMark(
            time,
            price,
            time,
            price,
            '#2962FF',
            2,
            true
          );
          try {
            chartSeries.series.attachPrimitive(this.previewGannFan);
            this.gannFans.forEach(m => m.setShowHandles(false));
          } catch (error) {
            console.error(error);
            this.previewGannFan = null;
            this.state.isDrawing = false;
          }
        } else {
          if (this.previewGannFan) {
            try {
              chartSeries.series.detachPrimitive(this.previewGannFan);
              const finalGannFan = new GannFanMark(
                this.previewGannFan.time(),
                this.previewGannFan.priceValue(),
                time,
                price,
                '#2962FF',
                2,
                false
              );
              chartSeries.series.attachPrimitive(finalGannFan);
              this.gannFans.push(finalGannFan);
              this.previewGannFan = null;
              finalGannFan.setShowHandles(true);
            } catch (error) {
              console.error(error);
            }
          }
          this.state = {
            ...this.state,
            isGannFanMode: false,
            gannFanStartPoint: null,
            currentGannFan: null,
            isDrawing: false
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelGannFanMode();
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
          this.state.dragTarget.dragGannFanByPixels(deltaX, deltaY);
          this.dragStartData = {
            time: this.dragStartData.time,
            price: this.dragStartData.price,
            x: relativeX,
            y: relativeY
          };
        }
        return;
      }
      if (this.state.isDrawing && this.previewGannFan) {
        this.previewGannFan.updateEndPoint(time, price);
        // chart.timeScale().widthChanged();
      }
      if (!this.state.isGannFanMode && !this.state.isDragging && !this.state.isDrawing) {
        let anyGannFanHovered = false;
        for (const mark of this.gannFans) {
          const handleType = mark.isPointNearHandle(relativeX, relativeY);
          const isInBounds = mark.isPointInBounds(relativeX, relativeY);
          const shouldShow = !!handleType || isInBounds;
          mark.setShowHandles(shouldShow);
          if (shouldShow) anyGannFanHovered = true;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  public handleMouseUp = (point: Point): GannFanMarkState => {
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
        this.state.isGannFanMode = true;
      } else {
        this.state.isGannFanMode = false;
        if (this.props.onCloseDrawing) {
          this.props.onCloseDrawing();
        }
      }
    }
    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): GannFanMarkState => {
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
      } else if (this.state.isGannFanMode || this.state.isDrawing) {
        return this.cancelGannFanMode();
      }
    }
    return this.state;
  };

  public getState(): GannFanMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<GannFanMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewGannFan) {
      this.props.chartSeries?.series.detachPrimitive(this.previewGannFan);
      this.previewGannFan = null;
    }
    this.gannFans.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.gannFans = [];
  }

  public getGannFans(): GannFanMark[] {
    return [...this.gannFans];
  }

  public removeGannFan(mark: GannFanMark): void {
    const index = this.gannFans.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.gannFans.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isGannFanMode || this.state.isDrawing;
  }
}