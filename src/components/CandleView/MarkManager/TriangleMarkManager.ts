import { ChartSeries } from "../ChartLayer/ChartTypeManager";
import { Point } from "../types";
import { TriangleMark } from "../Mark/Shape/TriangleMark";
import { IMarkManager } from "../Mark/IMarkManager";

export interface TriangleMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface TriangleMarkState {
  isTriangleMarkMode: boolean;
  triangleMarkStartPoint: Point | null;
  currentTriangleMark: TriangleMark | null;
  isDragging: boolean;
  dragTarget: TriangleMark | null;
  dragPoint: 'center' | 'vertex1' | 'vertex2' | 'vertex3' | 'triangle' | 'rotation' | null;
  isDrawing: boolean;
}

interface DragStartData {
  time: string;
  price: number;
  x: number;
  y: number;
  vertexIndex?: number;
}

export class TriangleMarkManager implements IMarkManager<TriangleMark> {
  private props: TriangleMarkManagerProps;
  private state: TriangleMarkState;
  private previewTriangleMark: TriangleMark | null = null;
  private triangleMarks: TriangleMark[] = [];
  private isOperating: boolean = false;
  private dragStartData: DragStartData | null = null;

  constructor(props: TriangleMarkManagerProps) {
    this.props = props;
    this.state = {
      isTriangleMarkMode: false,
      triangleMarkStartPoint: null,
      currentTriangleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }

  public clearState(): void {
    this.state = {
      isTriangleMarkMode: false,
      triangleMarkStartPoint: null,
      currentTriangleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }

  public getMarkAtPoint(point: Point): TriangleMark | null {
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

      for (const mark of this.triangleMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }

      for (const mark of this.triangleMarks) {
        if (mark.isPointInTriangle(relativeX, relativeY)) {
          return mark;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public getCurrentDragTarget(): TriangleMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): TriangleMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewTriangleMark) {
      return this.previewTriangleMark;
    }
    if (this.state.isTriangleMarkMode && this.state.currentTriangleMark) {
      return this.state.currentTriangleMark;
    }
    return null;
  }

  public getAllMarks(): TriangleMark[] {
    return [...this.triangleMarks];
  }

  public cancelOperationMode() {
    return this.cancelTriangleMarkMode();
  }

  public setTriangleMarkMode = (): TriangleMarkState => {
    this.state = {
      ...this.state,
      isTriangleMarkMode: true,
      triangleMarkStartPoint: null,
      currentTriangleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
    return this.state;
  };

  public cancelTriangleMarkMode = (): TriangleMarkState => {
    if (this.previewTriangleMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewTriangleMark);
      this.previewTriangleMark = null;
    }

    this.triangleMarks.forEach(mark => {
      mark.setShowHandles(false);
    });

    this.state = {
      ...this.state,
      isTriangleMarkMode: false,
      triangleMarkStartPoint: null,
      currentTriangleMark: null,
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

  public handleMouseDown = (point: Point): TriangleMarkState => {
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

      for (const mark of this.triangleMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          let vertexIndex: number | undefined;

          if (handleType.startsWith('vertex')) {
            vertexIndex = parseInt(handleType.replace('vertex', '')) - 1;
          }

          this.dragStartData = {
            time: time,
            price: price,
            x: relativeX,
            y: relativeY,
            vertexIndex
          };

          this.state = {
            ...this.state,
            isTriangleMarkMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType as any
          };

          this.triangleMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });

          this.isOperating = true;
          return this.state;
        }
      }


      for (const mark of this.triangleMarks) {
        if (mark.isPointInTriangle(relativeX, relativeY)) {
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
            dragPoint: 'triangle'
          };

          mark.setDragging(true, 'triangle');
          this.triangleMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });

          this.isOperating = true;
          return this.state;
        }
      }


      if (this.state.isTriangleMarkMode && !this.state.isDragging) {
        if (!this.state.isDrawing) {
          this.state = {
            ...this.state,
            triangleMarkStartPoint: point,
            isDrawing: true
          };

          this.previewTriangleMark = new TriangleMark(
            time,
            price,
            0,
            0,
            '#2962FF',
            2,
            true
          );

          try {
            chartSeries.series.attachPrimitive(this.previewTriangleMark);
            this.triangleMarks.forEach(m => m.setShowHandles(false));
          } catch (error) {
            console.error(error);
            this.previewTriangleMark = null;
            this.state.isDrawing = false;
          }
        } else {

          if (this.previewTriangleMark) {
            try {
              chartSeries.series.detachPrimitive(this.previewTriangleMark);

              const centerTime = this.previewTriangleMark.getCenterTime();
              const centerPrice = this.previewTriangleMark.getCenterPrice();
              const centerX = chart.timeScale().timeToCoordinate(centerTime);
              const centerY = chartSeries.series.priceToCoordinate(centerPrice);

              if (centerX !== null && centerY !== null) {
                const pixelSize = Math.sqrt(
                  Math.pow(relativeX - centerX, 2) + Math.pow(relativeY - centerY, 2)
                );

                const finalTriangleMark = new TriangleMark(
                  centerTime,
                  centerPrice,
                  0,
                  0,
                  '#2962FF',
                  2,
                  false
                );

                finalTriangleMark.updatePixelSize(pixelSize);
                chartSeries.series.attachPrimitive(finalTriangleMark);
                this.triangleMarks.push(finalTriangleMark);
                this.previewTriangleMark = null;
                finalTriangleMark.setShowHandles(true);
              }
            } catch (error) {
              console.error(error);
            }
          }

          this.state = {
            ...this.state,
            isTriangleMarkMode: false,
            triangleMarkStartPoint: null,
            currentTriangleMark: null,
            isDrawing: false
          };

          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelTriangleMarkMode();
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
        if (this.state.dragPoint === 'triangle') {
          const deltaX = relativeX - this.dragStartData.x;
          const deltaY = relativeY - this.dragStartData.y;
          this.state.dragTarget.dragTriangleByPixels(deltaX, deltaY);

          this.dragStartData = {
            time: this.dragStartData.time,
            price: this.dragStartData.price,
            x: relativeX,
            y: relativeY
          };
        } else if (this.state.dragPoint === 'rotation') {

          this.state.dragTarget.rotateTriangle(relativeX, relativeY);
        } else if (this.state.dragPoint?.startsWith('vertex')) {
          const vertexIndex = this.dragStartData.vertexIndex;
          if (vertexIndex !== undefined) {
            this.state.dragTarget.dragVertex(vertexIndex, relativeX, relativeY);
          }
        } else if (this.state.dragPoint === 'center') {
          this.state.dragTarget.updateCenter(time, price);
        }

        return;
      }
      if (this.state.isDrawing && this.previewTriangleMark) {
        const centerTime = this.previewTriangleMark.getCenterTime();
        const centerPrice = this.previewTriangleMark.getCenterPrice();
        const centerX = chart.timeScale().timeToCoordinate(centerTime);
        const centerY = chartSeries.series.priceToCoordinate(centerPrice);
        if (centerX !== null && centerY !== null) {
          const pixelSize = Math.sqrt(
            Math.pow(relativeX - centerX, 2) + Math.pow(relativeY - centerY, 2)
          );
          this.previewTriangleMark.updatePixelSize(pixelSize);
        }
        // chart.timeScale().widthChanged();
      }
      if (!this.state.isTriangleMarkMode && !this.state.isDragging && !this.state.isDrawing) {
        let anyTriangleHovered = false;

        for (const mark of this.triangleMarks) {
          const handleType = mark.isPointNearHandle(relativeX, relativeY);
          const isInTriangle = mark.isPointInTriangle(relativeX, relativeY);
          const shouldShow = !!handleType || isInTriangle;
          mark.setShowHandles(shouldShow);

          if (shouldShow) anyTriangleHovered = true;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  public handleMouseUp = (point: Point): TriangleMarkState => {
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

      if (this.state.dragPoint === 'center' || this.state.dragPoint?.startsWith('vertex') || this.state.dragPoint === 'rotation') {
        this.state.isTriangleMarkMode = true;
      } else {
        this.state.isTriangleMarkMode = false;
        if (this.props.onCloseDrawing) {
          this.props.onCloseDrawing();
        }
      }
    }

    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): TriangleMarkState => {
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
      } else if (this.state.isTriangleMarkMode || this.state.isDrawing) {
        return this.cancelTriangleMarkMode();
      }
    }

    return this.state;
  };

  public getState(): TriangleMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<TriangleMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewTriangleMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewTriangleMark);
      this.previewTriangleMark = null;
    }

    this.triangleMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });

    this.triangleMarks = [];
  }

  public getTriangleMarks(): TriangleMark[] {
    return [...this.triangleMarks];
  }

  public removeTriangleMark(mark: TriangleMark): void {
    const index = this.triangleMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.triangleMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isTriangleMarkMode || this.state.isDrawing;
  }
}