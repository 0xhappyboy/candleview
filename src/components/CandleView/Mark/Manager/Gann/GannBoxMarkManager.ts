import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { GannBoxMark } from "../../Graph/Gann/GannBoxMark";
import { IMarkManager } from "../../IMarkManager";

export interface GannBoxMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface GannBoxMarkState {
  isGannBoxMode: boolean;
  gannBoxStartPoint: Point | null;
  currentGannBox: GannBoxMark | null;
  isDragging: boolean;
  dragTarget: GannBoxMark | null;
  dragPoint: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'box' | null;
  isDrawing: boolean;
}

interface DragStartData {
  time: string;
  price: number;
  x: number;
  y: number;
}

export class GannBoxMarkManager implements IMarkManager<GannBoxMark> {
  private props: GannBoxMarkManagerProps;
  private state: GannBoxMarkState;
  private previewGannBox: GannBoxMark | null = null;
  private gannBoxes: GannBoxMark[] = [];
  private isOperating: boolean = false;
  private dragStartData: DragStartData | null = null;

  constructor(props: GannBoxMarkManagerProps) {
    this.props = props;
    this.state = {
      isGannBoxMode: false,
      gannBoxStartPoint: null,
      currentGannBox: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }

  public getMarkAtPoint(point: Point): GannBoxMark | null {
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
      for (const mark of this.gannBoxes) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.gannBoxes) {
        if (mark.isPointInBounds(relativeX, relativeY)) {
          return mark;
        }
      }
    } catch (error) {
      console.error('Error getting mark at point:', error);
    }
    return null;
  }

  public getCurrentDragTarget(): GannBoxMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): GannBoxMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewGannBox) {
      return this.previewGannBox;
    }
    if (this.state.isGannBoxMode && this.state.currentGannBox) {
      return this.state.currentGannBox;
    }
    return null;
  }

  public getAllMarks(): GannBoxMark[] {
    return [...this.gannBoxes];
  }

  public cancelOperationMode() {
    return this.cancelGannBoxMode();
  }

  public setGannBoxMode = (): GannBoxMarkState => {
    this.state = {
      ...this.state,
      isGannBoxMode: true,
      gannBoxStartPoint: null,
      currentGannBox: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
    return this.state;
  };

  public cancelGannBoxMode = (): GannBoxMarkState => {
    if (this.previewGannBox) {
      this.props.chartSeries?.series.detachPrimitive(this.previewGannBox);
      this.previewGannBox = null;
    }
    this.gannBoxes.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isGannBoxMode: false,
      gannBoxStartPoint: null,
      currentGannBox: null,
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
      console.error('Error getting valid time:', error);
      return null;
    }
  }


  public handleMouseDown = (point: Point): GannBoxMarkState => {
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
      for (const mark of this.gannBoxes) {
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
            isGannBoxMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.gannBoxes.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }
      for (const mark of this.gannBoxes) {
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
          this.gannBoxes.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }
      if (this.state.isGannBoxMode && !this.state.isDragging) {
        if (!this.state.isDrawing) {
          this.state = {
            ...this.state,
            gannBoxStartPoint: point,
            isDrawing: true
          };
          this.previewGannBox = new GannBoxMark(
            time,
            price,
            time,
            price,
            '#2962FF',
            2,
            true
          );
          try {
            chartSeries.series.attachPrimitive(this.previewGannBox);
            this.gannBoxes.forEach(m => m.setShowHandles(false));
          } catch (error) {
            console.error('Error attaching preview gann box:', error);
            this.previewGannBox = null;
            this.state.isDrawing = false;
          }
        } else {
          if (this.previewGannBox) {
            try {
              chartSeries.series.detachPrimitive(this.previewGannBox);
              const finalGannBox = new GannBoxMark(
                this.previewGannBox.time(),
                this.previewGannBox.priceValue(),
                time,
                price,
                '#2962FF',
                2,
                false
              );
              chartSeries.series.attachPrimitive(finalGannBox);
              this.gannBoxes.push(finalGannBox);
              this.previewGannBox = null;
              finalGannBox.setShowHandles(true);
            } catch (error) {
              console.error('Error creating final gann box:', error);
            }
          }
          this.state = {
            ...this.state,
            isGannBoxMode: false,
            gannBoxStartPoint: null,
            currentGannBox: null,
            isDrawing: false
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error('Error placing gann box mark:', error);
      this.state = this.cancelGannBoxMode();
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
      if (this.state.isDrawing && this.previewGannBox) {
        this.previewGannBox.updateEndPoint(time, price);
        chart.timeScale().widthChanged();
      }
      if (!this.state.isGannBoxMode && !this.state.isDragging && !this.state.isDrawing) {
        let anyGannBoxHovered = false;
        for (const mark of this.gannBoxes) {
          const handleType = mark.isPointNearHandle(relativeX, relativeY);
          const isInBounds = mark.isPointInBounds(relativeX, relativeY);
          const shouldShow = !!handleType || isInBounds;
          mark.setShowHandles(shouldShow);
          if (shouldShow) anyGannBoxHovered = true;
        }
      }
    } catch (error) {
      console.error('Error updating gann box mark:', error);
    }
  };

  public handleMouseUp = (point: Point): GannBoxMarkState => {
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
      if (this.state.dragPoint && this.state.dragPoint !== 'box') {
        this.state.isGannBoxMode = true;
      } else {
        this.state.isGannBoxMode = false;
        if (this.props.onCloseDrawing) {
          this.props.onCloseDrawing();
        }
      }
    }
    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): GannBoxMarkState => {
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
      } else if (this.state.isGannBoxMode || this.state.isDrawing) {
        return this.cancelGannBoxMode();
      }
    }
    return this.state;
  };

  public getState(): GannBoxMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<GannBoxMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewGannBox) {
      this.props.chartSeries?.series.detachPrimitive(this.previewGannBox);
      this.previewGannBox = null;
    }
    this.gannBoxes.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.gannBoxes = [];
  }

  public getGannBoxes(): GannBoxMark[] {
    return [...this.gannBoxes];
  }

  public removeGannBox(mark: GannBoxMark): void {
    const index = this.gannBoxes.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.gannBoxes.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isGannBoxMode || this.state.isDrawing;
  }
}