import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { IMarkManager } from "../../IMarkManager";
import { ElliottImpulseMark } from "../../Pattern/ElliottImpulseMark";

export interface ElliottImpulseMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface ElliottImpulseMarkState {
  isElliottImpulseMode: boolean;
  currentPoints: Point[];
  currentElliottImpulseMark: ElliottImpulseMark | null;
  isDragging: boolean;
  dragTarget: ElliottImpulseMark | null;
  dragPoint: number | null;
}

export class ElliottImpulseMarkManager implements IMarkManager<ElliottImpulseMark> {
  private props: ElliottImpulseMarkManagerProps;
  private state: ElliottImpulseMarkState;
  private previewMark: ElliottImpulseMark | null = null;
  private elliottImpulseMarks: ElliottImpulseMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;
  private defaultColor: string = '#3964FE';

  constructor(props: ElliottImpulseMarkManagerProps) {
    this.props = props;
    this.state = {
      isElliottImpulseMode: false,
      currentPoints: [],
      currentElliottImpulseMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.defaultColor = '#3964FE';
  }

  public getMarkAtPoint(point: Point): ElliottImpulseMark | null {
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
      for (const mark of this.elliottImpulseMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY);
        if (pointIndex !== null) {
          return mark;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public getCurrentDragTarget(): ElliottImpulseMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint !== null ? this.state.dragPoint.toString() : null;
  }

  public getCurrentOperatingMark(): ElliottImpulseMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewMark) {
      return this.previewMark;
    }
    if (this.state.isElliottImpulseMode && this.state.currentElliottImpulseMark) {
      return this.state.currentElliottImpulseMark;
    }
    return null;
  }

  public getAllMarks(): ElliottImpulseMark[] {
    return [...this.elliottImpulseMarks];
  }

  public cancelOperationMode() {
    return this.cancelElliottImpulseMode();
  }

  public setElliottImpulseMode = (): ElliottImpulseMarkState => {
    this.state = {
      ...this.state,
      isElliottImpulseMode: true,
      currentPoints: [],
      currentElliottImpulseMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelElliottImpulseMode = (): ElliottImpulseMarkState => {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.elliottImpulseMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isElliottImpulseMode: false,
      currentPoints: [],
      currentElliottImpulseMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): ElliottImpulseMarkState => {
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


      for (const mark of this.elliottImpulseMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY, 20);
        if (pointIndex !== null) {
          this.state = {
            ...this.state,
            isElliottImpulseMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: pointIndex
          };
          mark.setDragging(true, pointIndex);
          this.elliottImpulseMarks.forEach(m => {
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


      for (const mark of this.elliottImpulseMarks) {
        if ((mark as any).isPointNearGraph(relativeX, relativeY, 15)) {
          this.state = {
            ...this.state,
            isElliottImpulseMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: -1
          };
          mark.setDragging(true, -1);
          this.elliottImpulseMarks.forEach(m => {
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
      if (this.state.isElliottImpulseMode && !this.state.isDragging) {
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
          this.previewMark = new ElliottImpulseMark(newDataPoints, defaultColor);
          chartSeries.series.attachPrimitive(this.previewMark);
          this.elliottImpulseMarks.forEach(m => m.setShowHandles(false));
          this.previewMark.setShowHandles(true);
          this.state = {
            ...this.state,
            currentPoints: [point],
            currentElliottImpulseMark: this.previewMark
          };
        } else if (this.state.currentPoints.length < 5) {
          if (this.previewMark) {
            const previewDataPoints = [...newDataPoints];
            while (previewDataPoints.length < 6) {
              previewDataPoints.push({ time: timeStr, price });
            }
            chartSeries.series.detachPrimitive(this.previewMark);
            this.previewMark = new ElliottImpulseMark(previewDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(this.previewMark);
            this.previewMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            currentPoints: [...this.state.currentPoints, point],
            currentElliottImpulseMark: this.previewMark
          };
        } else if (this.state.currentPoints.length === 5) {
          if (this.previewMark) {
            chartSeries.series.detachPrimitive(this.previewMark);
            const finalMark = new ElliottImpulseMark(newDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(finalMark);
            this.elliottImpulseMarks.push(finalMark);
            this.previewMark = null;
            finalMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isElliottImpulseMode: false,
            currentPoints: [],
            currentElliottImpulseMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelElliottImpulseMode();
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
      if (this.state.isElliottImpulseMode && this.state.currentPoints.length > 0 && this.previewMark) {
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
        this.previewMark = new ElliottImpulseMark(previewDataPoints, this.defaultColor);
        chartSeries.series.attachPrimitive(this.previewMark);
        this.previewMark.setShowHandles(true);
      }
      if (!this.state.isElliottImpulseMode && !this.state.isDragging) {
        let anyMarkHovered = false;
        for (const mark of this.elliottImpulseMarks) {
          const pointIndex = mark.isPointNearHandle(relativeX, relativeY);
          const shouldShow = pointIndex !== null;
          const isNearGraph = (mark as any).isPointNearGraph(relativeX, relativeY, 15);
          mark.setShowHandles(shouldShow || isNearGraph);
          if (shouldShow || isNearGraph) anyMarkHovered = true;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  public handleMouseUp = (point: Point): ElliottImpulseMarkState => {
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

  public handleKeyDown = (event: KeyboardEvent): ElliottImpulseMarkState => {
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
      } else if (this.state.isElliottImpulseMode) {
        return this.cancelElliottImpulseMode();
      }
    }
    return this.state;
  };

  public getState(): ElliottImpulseMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<ElliottImpulseMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.elliottImpulseMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.elliottImpulseMarks = [];
  }

  public getElliottImpulseMarks(): ElliottImpulseMark[] {
    return [...this.elliottImpulseMarks];
  }

  public removeElliottImpulseMark(mark: ElliottImpulseMark): void {
    const index = this.elliottImpulseMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.elliottImpulseMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isElliottImpulseMode;
  }
}