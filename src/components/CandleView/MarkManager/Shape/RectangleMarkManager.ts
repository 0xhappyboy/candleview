import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { RectangleMark } from "../../Mark/Shape/RectangleMark.ts";
import { Point } from "../../types";

export interface RectangleMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface RectangleMarkState {
  isRectangleMarkMode: boolean;
  rectangleMarkStartPoint: Point | null;
  currentRectangleMark: RectangleMark | null;
  isDragging: boolean;
  dragTarget: RectangleMark | null;
  dragPoint: 'start' | 'end' | 'line' | null;
}

export class RectangleMarkManager implements IMarkManager<RectangleMark> {
  private props: RectangleMarkManagerProps;
  private state: RectangleMarkState;
  private previewRectangleMark: RectangleMark | null = null;
  private rectangleMarks: RectangleMark[] = [];
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: RectangleMarkManagerProps) {
    this.props = props;
    this.state = {
      isRectangleMarkMode: false,
      rectangleMarkStartPoint: null,
      currentRectangleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public clearState(): void {
    this.state = {
      isRectangleMarkMode: false,
      rectangleMarkStartPoint: null,
      currentRectangleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): RectangleMark | null {
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

      for (const mark of this.rectangleMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }

      for (const mark of this.rectangleMarks) {
        const isInRectangle = mark.isPointInRectangle(relativeX, relativeY);
        if (isInRectangle) {
          return mark;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public getCurrentDragTarget(): RectangleMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): RectangleMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewRectangleMark) {
      return this.previewRectangleMark;
    }
    if (this.state.isRectangleMarkMode && this.state.currentRectangleMark) {
      return this.state.currentRectangleMark;
    }
    return null;
  }

  public getAllMarks(): RectangleMark[] {
    return [...this.rectangleMarks];
  }

  public cancelOperationMode() {
    return this.cancelRectangleMarkMode();
  }

  public setRectangleMarkMode = (): RectangleMarkState => {
    this.state = {
      ...this.state,
      isRectangleMarkMode: true,
      rectangleMarkStartPoint: null,
      currentRectangleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelRectangleMarkMode = (): RectangleMarkState => {
    if (this.previewRectangleMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewRectangleMark);
      this.previewRectangleMark = null;
    }
    this.rectangleMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isRectangleMarkMode: false,
      rectangleMarkStartPoint: null,
      currentRectangleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): RectangleMarkState => {
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
      const price = chartSeries.series.coordinateToPrice(relativeY);
      if (time === null || price === null) return this.state;
      this.dragStartData = { time, price };
      let foundMark = false;
      for (const mark of this.rectangleMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          this.state = {
            ...this.state,
            isRectangleMarkMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.rectangleMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          foundMark = true;
          break;
        }
      }
      if (!foundMark) {
        for (const mark of this.rectangleMarks) {
          const isInRectangle = mark.isPointInRectangle(relativeX, relativeY);
          if (isInRectangle) {
            this.state = {
              ...this.state,
              isDragging: true,
              dragTarget: mark,
              dragPoint: 'line'
            };
            mark.setDragging(true, 'line');
            this.rectangleMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            this.isOperating = true;
            foundMark = true;
            break;
          }
        }
      }
      if (!foundMark && this.state.isRectangleMarkMode) {
        if (!this.state.rectangleMarkStartPoint) {
          this.state = {
            ...this.state,
            rectangleMarkStartPoint: point
          };
          this.previewRectangleMark = new RectangleMark(
            time.toString(),
            price,
            time.toString(),
            price,
            '#2962FF',
            2,
            'rgba(41, 98, 255, 0.1)',
            true
          );
          chartSeries.series.attachPrimitive(this.previewRectangleMark);
          this.rectangleMarks.forEach(m => m.setShowHandles(false));
        } else {

          if (this.previewRectangleMark) {
            chartSeries.series.detachPrimitive(this.previewRectangleMark);
            const finalRectangleMark = new RectangleMark(
              this.previewRectangleMark.getStartTime(),
              this.previewRectangleMark.getStartPrice(),
              time.toString(),
              price,
              '#2962FF',
              2,
              'rgba(41, 98, 255, 0.1)',
              false
            );
            chartSeries.series.attachPrimitive(finalRectangleMark);
            this.rectangleMarks.push(finalRectangleMark);
            this.previewRectangleMark = null;
            finalRectangleMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isRectangleMarkMode: false,
            rectangleMarkStartPoint: null,
            currentRectangleMark: null
          };
          this.isOperating = false;
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelRectangleMarkMode();
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
      const timeScale = chart.timeScale();
      const time = timeScale.coordinateToTime(relativeX);
      const price = chartSeries.series.coordinateToPrice(relativeY);
      if (time === null || price === null) return;
      if (this.state.isDragging && this.state.dragTarget && this.dragStartData && this.state.dragPoint === 'line') {
        if (this.dragStartData.time === null || time === null) return;
        const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
        const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
        const currentX = timeScale.timeToCoordinate(time);
        const currentY = chartSeries.series.priceToCoordinate(price);
        if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;
        const deltaX = currentX - currentStartX;
        const deltaY = currentY - currentStartY;
        this.state.dragTarget.dragLineByPixels(deltaX, deltaY);
        this.dragStartData = { time, price };
        return;
      }
      if (this.state.isRectangleMarkMode && this.state.dragTarget && this.state.dragPoint &&
        (this.state.dragPoint === 'start' || this.state.dragPoint === 'end')) {
        if (this.state.dragPoint === 'start') {
          this.state.dragTarget.updateStartPoint(time.toString(), price);
        } else if (this.state.dragPoint === 'end') {
          this.state.dragTarget.updateEndPoint(time.toString(), price);
        }
      }
      if (!this.state.isDragging) {
        if (this.state.rectangleMarkStartPoint && this.previewRectangleMark) {
          this.previewRectangleMark.updateEndPoint(time.toString(), price);
        }
        if (!this.state.isRectangleMarkMode && !this.state.isDragging && !this.state.rectangleMarkStartPoint) {
          let anyRectangleHovered = false;
          for (const mark of this.rectangleMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            const isInRectangle = mark.isPointInRectangle(relativeX, relativeY);
            const shouldShow = !!handleType || isInRectangle;
            mark.setShowHandles(shouldShow);
            if (shouldShow) anyRectangleHovered = true;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  public handleMouseUp = (point: Point): RectangleMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end') {
        this.state = {
          ...this.state,
          isRectangleMarkMode: false,
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

  public handleKeyDown = (event: KeyboardEvent): RectangleMarkState => {
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
      } else if (this.state.isRectangleMarkMode) {
        return this.cancelRectangleMarkMode();
      }
    }
    return this.state;
  };

  public getState(): RectangleMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<RectangleMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewRectangleMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewRectangleMark);
      this.previewRectangleMark = null;
    }

    this.rectangleMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.rectangleMarks = [];
  }

  public getRectangleMarks(): RectangleMark[] {
    return [...this.rectangleMarks];
  }

  public removeRectangleMark(mark: RectangleMark): void {
    const index = this.rectangleMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.rectangleMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isRectangleMarkMode;
  }
}