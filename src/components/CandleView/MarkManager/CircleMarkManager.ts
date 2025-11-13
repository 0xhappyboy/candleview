import { ChartSeries } from "../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../Mark/IMarkManager";
import { CircleMark } from "../Mark/Shape/CircleMark";
import { Point } from "../types";

export interface CircleMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface CircleMarkState {
  isCircleMarkMode: boolean;
  circleMarkStartPoint: Point | null;
  currentCircleMark: CircleMark | null;
  isDragging: boolean;
  dragTarget: CircleMark | null;
  dragPoint: 'center' | 'radius' | 'circle' | null;
  isDrawing: boolean;
}

interface DragStartData {
  time: string;
  price: number;
  x: number;
  y: number;
  initialAngle?: number;
}

export class CircleMarkManager implements IMarkManager<CircleMark> {
  private props: CircleMarkManagerProps;
  private state: CircleMarkState;
  private previewCircleMark: CircleMark | null = null;
  private circleMarks: CircleMark[] = [];
  private isOperating: boolean = false;
  private dragStartData: DragStartData | null = null;

  constructor(props: CircleMarkManagerProps) {
    this.props = props;
    this.state = {
      isCircleMarkMode: false,
      circleMarkStartPoint: null,
      currentCircleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }

  public clearState(): void {
    this.state = {
      isCircleMarkMode: false,
      circleMarkStartPoint: null,
      currentCircleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }

  public getMarkAtPoint(point: Point): CircleMark | null {
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
      for (const mark of this.circleMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.circleMarks) {
        if (mark.isPointInCircle(relativeX, relativeY)) {
          return mark;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public getCurrentDragTarget(): CircleMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): CircleMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewCircleMark) {
      return this.previewCircleMark;
    }
    if (this.state.isCircleMarkMode && this.state.currentCircleMark) {
      return this.state.currentCircleMark;
    }
    return null;
  }

  public getAllMarks(): CircleMark[] {
    return [...this.circleMarks];
  }

  public cancelOperationMode() {
    return this.cancelCircleMarkMode();
  }

  public setCircleMarkMode = (): CircleMarkState => {
    this.state = {
      ...this.state,
      isCircleMarkMode: true,
      circleMarkStartPoint: null,
      currentCircleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
    return this.state;
  };

  public cancelCircleMarkMode = (): CircleMarkState => {
    if (this.previewCircleMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewCircleMark);
      this.previewCircleMark = null;
    }
    this.circleMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isCircleMarkMode: false,
      circleMarkStartPoint: null,
      currentCircleMark: null,
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

  public handleMouseDown = (point: Point): CircleMarkState => {
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
      for (const mark of this.circleMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          if (handleType === 'radius') {
            const centerX = chart.timeScale().timeToCoordinate(mark.getCenterTime());
            const centerY = chartSeries.series.priceToCoordinate(mark.getCenterPrice());
            if (centerX !== null && centerY !== null) {
              const initialAngle = mark.calculateAngleFromCenter(relativeX, relativeY);
              mark.updateRadiusHandleAngle(initialAngle);
              this.dragStartData = {
                time: mark.getCenterTime(),
                price: mark.getCenterPrice(),
                x: centerX,
                y: centerY,
                initialAngle: initialAngle
              };
            }
          } else {
            this.dragStartData = {
              time: time,
              price: price,
              x: relativeX,
              y: relativeY
            };
          }
          this.state = {
            ...this.state,
            isCircleMarkMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.circleMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }
      for (const mark of this.circleMarks) {
        if (mark.isPointInCircle(relativeX, relativeY)) {
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
            dragPoint: 'circle'
          };
          mark.setDragging(true, 'circle');
          this.circleMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }
      if (this.state.isCircleMarkMode && !this.state.isDragging) {
        if (!this.state.isDrawing) {
          this.state = {
            ...this.state,
            circleMarkStartPoint: point,
            isDrawing: true
          };
          this.previewCircleMark = new CircleMark(
            time,
            price,
            0,
            0,
            '#2962FF',
            2,
            true
          );
          try {
            chartSeries.series.attachPrimitive(this.previewCircleMark);
            this.circleMarks.forEach(m => m.setShowHandles(false));
          } catch (error) {
            console.error(error);
            this.previewCircleMark = null;
            this.state.isDrawing = false;
          }
        } else {
          if (this.previewCircleMark) {
            try {
              chartSeries.series.detachPrimitive(this.previewCircleMark);
              const centerTime = this.previewCircleMark.getCenterTime();
              const centerPrice = this.previewCircleMark.getCenterPrice();
              const centerX = chart.timeScale().timeToCoordinate(centerTime);
              const centerY = chartSeries.series.priceToCoordinate(centerPrice);
              if (centerX !== null && centerY !== null) {
                const pixelRadius = Math.sqrt(
                  Math.pow(relativeX - centerX, 2) + Math.pow(relativeY - centerY, 2)
                );
                const finalCircleMark = new CircleMark(
                  centerTime,
                  centerPrice,
                  0,
                  0,
                  '#2962FF',
                  2,
                  false
                );
                finalCircleMark.updatePixelRadius(pixelRadius);
                finalCircleMark.updateRadiusHandleAngle(0);
                chartSeries.series.attachPrimitive(finalCircleMark);
                this.circleMarks.push(finalCircleMark);
                this.previewCircleMark = null;
                finalCircleMark.setShowHandles(true);
              }
            } catch (error) {
              console.error('Error creating final circle:', error);
            }
          }
          this.state = {
            ...this.state,
            isCircleMarkMode: false,
            circleMarkStartPoint: null,
            currentCircleMark: null,
            isDrawing: false
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelCircleMarkMode();
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
        if (this.state.dragPoint === 'circle') {
          const deltaX = relativeX - this.dragStartData.x;
          const deltaY = relativeY - this.dragStartData.y;
          this.state.dragTarget.dragCircleByPixels(deltaX, deltaY);
          this.dragStartData = {
            time: this.dragStartData.time,
            price: this.dragStartData.price,
            x: relativeX,
            y: relativeY
          };
        } else if (this.state.dragPoint === 'radius') {
          const centerX = this.dragStartData.x;
          const centerY = this.dragStartData.y;
          if (centerX !== null && centerY !== null) {
            const currentAngle = this.state.dragTarget.calculateAngleFromCenter(relativeX, relativeY);
            const currentDistance = Math.sqrt(
              Math.pow(relativeX - centerX, 2) + Math.pow(relativeY - centerY, 2)
            );
            this.state.dragTarget.updatePixelRadius(currentDistance);
            this.state.dragTarget.updateRadiusHandleAngle(currentAngle);
          }
        } else if (this.state.dragPoint === 'center') {
          this.state.dragTarget.updateCenter(time, price);
        }
        return;
      }
      if (this.state.isDrawing && this.previewCircleMark) {
        const centerTime = this.previewCircleMark.getCenterTime();
        const centerPrice = this.previewCircleMark.getCenterPrice();
        const centerX = chart.timeScale().timeToCoordinate(centerTime);
        const centerY = chartSeries.series.priceToCoordinate(centerPrice);
        if (centerX !== null && centerY !== null) {
          const pixelRadius = Math.sqrt(
            Math.pow(relativeX - centerX, 2) + Math.pow(relativeY - centerY, 2)
          );
          this.previewCircleMark.updatePixelRadius(pixelRadius);
        }
        // chart.timeScale().widthChanged();
      }
      if (!this.state.isCircleMarkMode && !this.state.isDragging && !this.state.isDrawing) {
        let anyCircleHovered = false;
        for (const mark of this.circleMarks) {
          const handleType = mark.isPointNearHandle(relativeX, relativeY);
          const isInCircle = mark.isPointInCircle(relativeX, relativeY);
          const shouldShow = !!handleType || isInCircle;
          mark.setShowHandles(shouldShow);
          if (shouldShow) anyCircleHovered = true;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  public handleMouseUp = (point: Point): CircleMarkState => {
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
      if (this.state.dragPoint === 'center' || this.state.dragPoint === 'radius') {
        this.state.isCircleMarkMode = true;
      } else {
        this.state.isCircleMarkMode = false;
        if (this.props.onCloseDrawing) {
          this.props.onCloseDrawing();
        }
      }
    }
    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): CircleMarkState => {
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
      } else if (this.state.isCircleMarkMode || this.state.isDrawing) {
        return this.cancelCircleMarkMode();
      }
    }
    return this.state;
  };

  public getState(): CircleMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<CircleMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewCircleMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewCircleMark);
      this.previewCircleMark = null;
    }
    this.circleMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.circleMarks = [];
  }

  public getCircleMarks(): CircleMark[] {
    return [...this.circleMarks];
  }

  public removeCircleMark(mark: CircleMark): void {
    const index = this.circleMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.circleMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isCircleMarkMode || this.state.isDrawing;
  }
}