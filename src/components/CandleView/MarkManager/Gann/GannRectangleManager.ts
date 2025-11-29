import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { GannRectangleMark } from "../../Mark/Gann/GannRectangleMark";
import { IMarkManager } from "../../Mark/IMarkManager";
import { Point } from "../../types";

export interface GannRectangleMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface GannRectangleMarkState {
  gannRectangleStartPoint: Point | null;
  currentGannRectangle: GannRectangleMark | null;
  isDragging: boolean;
  dragTarget: GannRectangleMark | null;
  dragPoint: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'box' | null;
  isDrawing: boolean;
}

interface DragStartData {
  time: number;
  price: number;
  x: number;
  y: number;
}

export class GannRectangleMarkManager implements IMarkManager<GannRectangleMark> {
  private props: GannRectangleMarkManagerProps;
  private state: GannRectangleMarkState;
  private previewGannRectang: GannRectangleMark | null = null;
  private gannBoxFans: GannRectangleMark[] = [];
  private isOperating: boolean = false;
  private dragStartData: DragStartData | null = null;

  constructor(props: GannRectangleMarkManagerProps) {
    this.props = props;
    this.state = {
      gannRectangleStartPoint: null,
      currentGannRectangle: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }

  public clearState(): void {
    this.state = {
      gannRectangleStartPoint: null,
      currentGannRectangle: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }

  public getMarkAtPoint(point: Point): GannRectangleMark | null {
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
      for (const mark of this.gannBoxFans) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.gannBoxFans) {
        if (mark.isPointInBounds(relativeX, relativeY)) {
          return mark;
        }
      }
    } catch (error) {
    }
    return null;
  }

  public getCurrentDragTarget(): GannRectangleMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): GannRectangleMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewGannRectang) {
      return this.previewGannRectang;
    }
    if (this.state.currentGannRectangle) {
      return this.state.currentGannRectangle;
    }
    return null;
  }

  public getAllMarks(): GannRectangleMark[] {
    return [...this.gannBoxFans];
  }

  public cancelOperationMode() {
    return this.cancelGannRectangMode();
  }

  public setGannRectangMode = (): GannRectangleMarkState => {
    this.previewGannRectang = new GannRectangleMark(
      0,
      0,
      0,
      0,
      '#2962FF',
      2,
      true
    );
    this.state = {
      gannRectangleStartPoint: null,
      currentGannRectangle: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
    return this.state;
  };

  public cancelGannRectangMode = (): GannRectangleMarkState => {
    if (this.previewGannRectang) {
      this.props.chartSeries?.series.detachPrimitive(this.previewGannRectang);
      this.previewGannRectang = null;
    }
    this.gannBoxFans.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      gannRectangleStartPoint: null,
      currentGannRectangle: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
    this.isOperating = false;
    return this.state;
  };

  private getValidTimeFromCoordinate(chart: any, x: number): number | null {
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
      return time;
    } catch (error) {
      return null;
    }
  }

  public handleMouseDown = (point: Point): GannRectangleMarkState => {
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
        return this.state;
      }
      for (const mark of this.gannBoxFans) {
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
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.gannBoxFans.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }
      for (const mark of this.gannBoxFans) {
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
            dragPoint: 'box'
          };
          mark.setDragging(true, null);
          this.gannBoxFans.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }
      if (this.state.isDrawing && this.previewGannRectang) {
        try {
          chartSeries.series.detachPrimitive(this.previewGannRectang);
          const finalGannRectang = new GannRectangleMark(
            this.previewGannRectang.time(),
            this.previewGannRectang.priceValue(),
            time,
            price,
            '#2962FF',
            2,
            false
          );
          chartSeries.series.attachPrimitive(finalGannRectang);
          this.gannBoxFans.push(finalGannRectang);
          this.previewGannRectang = null;
          finalGannRectang.setShowHandles(true);
        } catch (error) {
        }
        this.state = {
          ...this.state,
          gannRectangleStartPoint: null,
          currentGannRectangle: null,
          isDrawing: false
        };
        if (this.props.onCloseDrawing) {
          this.props.onCloseDrawing();
        }
        return this.state;
      }
      if (this.previewGannRectang && !this.state.isDrawing && !this.state.isDragging) {
        this.state = {
          ...this.state,
          gannRectangleStartPoint: point,
          isDrawing: true
        };
        try {
          chartSeries.series.attachPrimitive(this.previewGannRectang);
          this.previewGannRectang.updateStartPoint(time, price);
          this.previewGannRectang.updateEndPoint(time, price);
          this.gannBoxFans.forEach(m => m.setShowHandles(false));
        } catch (error) {
          this.previewGannRectang = null;
          this.state.isDrawing = false;
        }
      }
    } catch (error) {
      this.state = this.cancelGannRectangMode();
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
        if (this.state.dragPoint && this.state.dragPoint !== 'box') {
          this.state.dragTarget.updateByCornerDrag(this.state.dragPoint, time, price);
        } else if (this.state.dragPoint === 'box') {
          const deltaX = relativeX - this.dragStartData.x;
          const deltaY = relativeY - this.dragStartData.y;
          this.state.dragTarget.dragGannBoxByPixels(deltaX, deltaY);
          this.dragStartData = {
            time: this.dragStartData.time,
            price: this.dragStartData.price,
            x: relativeX,
            y: relativeY
          };
        }
        return;
      }
      if (this.state.isDrawing && this.previewGannRectang) {
        this.previewGannRectang.updateEndPoint(time, price);
        // chart.timeScale().widthChanged();
      }
      if (!this.state.isDragging && !this.state.isDrawing) {
        let anyGannRectangHovered = false;
        for (const mark of this.gannBoxFans) {
          const handleType = mark.isPointNearHandle(relativeX, relativeY);
          const isInBounds = mark.isPointInBounds(relativeX, relativeY);
          const shouldShow = !!handleType || isInBounds;
          mark.setShowHandles(shouldShow);
          if (shouldShow) anyGannRectangHovered = true;
        }
      }
    } catch (error) {
    }
  };

  public handleMouseUp = (point: Point): GannRectangleMarkState => {
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
    }
    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): GannRectangleMarkState => {
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
      } else if (this.state.isDrawing) {
        return this.cancelGannRectangMode();
      }
    }
    return this.state;
  };

  public getState(): GannRectangleMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<GannRectangleMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewGannRectang) {
      this.props.chartSeries?.series.detachPrimitive(this.previewGannRectang);
      this.previewGannRectang = null;
    }
    this.gannBoxFans.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.gannBoxFans = [];
  }

  public getGannRectangles(): GannRectangleMark[] {
    return [...this.gannBoxFans];
  }

  public removeGannRectangle(mark: GannRectangleMark): void {
    const index = this.gannBoxFans.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.gannBoxFans.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isDrawing;
  }

  public updateMarkStyles(mark: GannRectangleMark, styles: any): void {
    mark.updateStyles(styles);
  }

  public getMarkStyles(mark: GannRectangleMark): Record<string, any> {
    return mark.getCurrentStyles();
  }

  public clearAllMarks(): void {
    this.gannBoxFans.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.gannBoxFans = [];
  }

  public setAllMarksVisible(visible: boolean): void {
    this.gannBoxFans.forEach(mark => {
      mark.setShowHandles(visible);
    });
  }
}