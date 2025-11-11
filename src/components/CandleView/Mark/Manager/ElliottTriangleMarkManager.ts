import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { IMarkManager } from "../IMarkManager";
import { ElliottTriangleMark } from "../Pattern/ElliottTriangleMark";

export interface ElliottTriangleMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface ElliottTriangleMarkState {
  isElliottTriangleMode: boolean;
  currentPoints: Point[];
  currentElliottTriangleMark: ElliottTriangleMark | null;
  isDragging: boolean;
  dragTarget: ElliottTriangleMark | null;
  dragPoint: number | null;
}

export class ElliottTriangleMarkManager implements IMarkManager<ElliottTriangleMark> {
  private props: ElliottTriangleMarkManagerProps;
  private state: ElliottTriangleMarkState;
  private previewMark: ElliottTriangleMark | null = null;
  private elliottTriangleMarks: ElliottTriangleMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;
  private defaultColor: string = '#FF6B6B';

  constructor(props: ElliottTriangleMarkManagerProps) {
    this.props = props;
    this.state = {
      isElliottTriangleMode: false,
      currentPoints: [],
      currentElliottTriangleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.defaultColor = '#FF6B6B';
  }

  public getMarkAtPoint(point: Point): ElliottTriangleMark | null {
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
      for (const mark of this.elliottTriangleMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY);
        if (pointIndex !== null) {
          return mark;
        }
      }
    } catch (error) {
      console.error('Error getting mark at point:', error);
    }
    return null;
  }

  public getCurrentDragTarget(): ElliottTriangleMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint !== null ? this.state.dragPoint.toString() : null;
  }

  public getCurrentOperatingMark(): ElliottTriangleMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewMark) {
      return this.previewMark;
    }
    if (this.state.isElliottTriangleMode && this.state.currentElliottTriangleMark) {
      return this.state.currentElliottTriangleMark;
    }
    return null;
  }

  public getAllMarks(): ElliottTriangleMark[] {
    return [...this.elliottTriangleMarks];
  }

  public cancelOperationMode() {
    return this.cancelElliottTriangleMode();
  }

  public setElliottTriangleMode = (): ElliottTriangleMarkState => {
    this.state = {
      ...this.state,
      isElliottTriangleMode: true,
      currentPoints: [],
      currentElliottTriangleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelElliottTriangleMode = (): ElliottTriangleMarkState => {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.elliottTriangleMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isElliottTriangleMode: false,
      currentPoints: [],
      currentElliottTriangleMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): ElliottTriangleMarkState => {
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
      this.mouseDownPoint = point;
      this.dragStartData = { time, price };
      let clickedExistingMark = false;
      for (const mark of this.elliottTriangleMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY, 20);
        if (pointIndex !== null) {
          this.state = {
            ...this.state,
            isElliottTriangleMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: pointIndex
          };
          mark.setDragging(true, pointIndex);
          this.elliottTriangleMarks.forEach(m => {
            m.setShowHandles(true);
          });
          this.isOperating = true;
          clickedExistingMark = true;
          break;
        }
      }
      if (clickedExistingMark) {
        return this.state;
      }

      
      for (const mark of this.elliottTriangleMarks) {
        if ((mark as any).isPointNearGraph(relativeX, relativeY, 15)) {
          this.state = {
            ...this.state,
            isElliottTriangleMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: -1
          };
          mark.setDragging(true, -1);
          this.elliottTriangleMarks.forEach(m => {
            m.setShowHandles(true);
          });
          this.isOperating = true;
          clickedExistingMark = true;
          break;
        }
      }
      if (clickedExistingMark) {
        return this.state;
      }

      
      if (this.state.isElliottTriangleMode && !this.state.isDragging) {
        const timeStr = time.toString();
        let newDataPoints: { time: string; price: number }[];
        if (this.state.currentPoints.length === 0) {
          newDataPoints = [{ time: timeStr, price }];
        } else {
          newDataPoints = [
            ...this.state.currentPoints.map(p => {
              const relX = p.x - (containerRect.left - chartRect.left);
              const relY = p.y - (containerRect.top - chartRect.top);
              const t = timeScale.coordinateToTime(relX);
              const pr = chartSeries.series.coordinateToPrice(relY);
              return { time: t?.toString() || '', price: pr || 0 };
            }),
            { time: timeStr, price }
          ];
        }
        const defaultColor = this.defaultColor;
        
        if (this.state.currentPoints.length === 0) {
          this.previewMark = new ElliottTriangleMark(newDataPoints, defaultColor);
          chartSeries.series.attachPrimitive(this.previewMark);
          this.elliottTriangleMarks.forEach(m => m.setShowHandles(false));
          this.previewMark.setShowHandles(true);
          this.state = {
            ...this.state,
            currentPoints: [point],
            currentElliottTriangleMark: this.previewMark
          };
        } else if (this.state.currentPoints.length < 5) {
          if (this.previewMark) {
            const previewDataPoints = [...newDataPoints];
            while (previewDataPoints.length < 6) {
              previewDataPoints.push({ time: timeStr, price });
            }
            chartSeries.series.detachPrimitive(this.previewMark);
            this.previewMark = new ElliottTriangleMark(previewDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(this.previewMark);
            this.previewMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            currentPoints: [...this.state.currentPoints, point],
            currentElliottTriangleMark: this.previewMark
          };
        } else if (this.state.currentPoints.length === 5) {
          if (this.previewMark) {
            chartSeries.series.detachPrimitive(this.previewMark);
            const finalMark = new ElliottTriangleMark(newDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(finalMark);
            this.elliottTriangleMarks.push(finalMark);
            this.previewMark = null;
            finalMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isElliottTriangleMode: false,
            currentPoints: [],
            currentElliottTriangleMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error('Error placing Elliott Triangle mark:', error);
      this.state = this.cancelElliottTriangleMode();
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

      
      if (this.state.isDragging && this.state.dragTarget && this.state.dragPoint !== null) {
        if (this.state.dragPoint === -1) {
          if (this.dragStartData && this.mouseDownPoint) {
            const deltaX = relativeX - (this.mouseDownPoint.x - (containerRect.left - chartRect.left));
            const deltaY = relativeY - (this.mouseDownPoint.y - (containerRect.top - chartRect.top));
            (this.state.dragTarget as any).moveAllPoints(deltaX, deltaY);
            this.mouseDownPoint = point;
          }
        } else {
          this.state.dragTarget.updatePoint(this.state.dragPoint, time.toString(), price);
        }
        return;
      }

      
      if (this.state.isElliottTriangleMode && this.state.currentPoints.length > 0 && this.previewMark) {
        const timeStr = time.toString();
        let previewDataPoints: { time: string; price: number }[] = [];
        for (let i = 0; i < this.state.currentPoints.length; i++) {
          const p = this.state.currentPoints[i];
          const relX = p.x - (containerRect.left - chartRect.left);
          const relY = p.y - (containerRect.top - chartRect.top);
          const t = timeScale.coordinateToTime(relX);
          const pr = chartSeries.series.coordinateToPrice(relY);
          if (t && pr !== null) {
            previewDataPoints.push({ time: t.toString(), price: pr });
          }
        }
        previewDataPoints.push({ time: timeStr, price });
        while (previewDataPoints.length < 6) {
          previewDataPoints.push({ time: timeStr, price });
        }
        chartSeries.series.detachPrimitive(this.previewMark);
        this.previewMark = new ElliottTriangleMark(previewDataPoints, this.defaultColor);
        chartSeries.series.attachPrimitive(this.previewMark);
        this.previewMark.setShowHandles(true);
      }

      
      if (!this.state.isElliottTriangleMode && !this.state.isDragging) {
        let anyMarkHovered = false;
        for (const mark of this.elliottTriangleMarks) {
          const pointIndex = mark.isPointNearHandle(relativeX, relativeY);
          const shouldShow = pointIndex !== null;
          const isNearGraph = (mark as any).isPointNearGraph(relativeX, relativeY, 15);
          mark.setShowHandles(shouldShow || isNearGraph);
          if (shouldShow || isNearGraph) anyMarkHovered = true;
        }
      }
    } catch (error) {
      console.error('Error updating Elliott Triangle mark:', error);
    }
  };

  public handleMouseUp = (point: Point): ElliottTriangleMarkState => {
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
    this.mouseDownPoint = null;
    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): ElliottTriangleMarkState => {
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
      } else if (this.state.isElliottTriangleMode) {
        return this.cancelElliottTriangleMode();
      }
    }
    return this.state;
  };

  public getState(): ElliottTriangleMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<ElliottTriangleMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.elliottTriangleMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.elliottTriangleMarks = [];
  }

  public getElliottTriangleMarks(): ElliottTriangleMark[] {
    return [...this.elliottTriangleMarks];
  }

  public removeElliottTriangleMark(mark: ElliottTriangleMark): void {
    const index = this.elliottTriangleMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.elliottTriangleMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isElliottTriangleMode;
  }
}