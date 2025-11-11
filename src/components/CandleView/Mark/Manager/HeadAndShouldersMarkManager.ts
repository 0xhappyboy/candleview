import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { IMarkManager } from "../IMarkManager";
import { HeadAndShouldersMark } from "../Pattern/HeadAndShouldersMark";

export interface HeadAndShouldersMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface HeadAndShouldersMarkState {
  isHeadAndShouldersMode: boolean;
  currentPoints: Point[];
  currentHeadAndShouldersMark: HeadAndShouldersMark | null;
  isDragging: boolean;
  dragTarget: HeadAndShouldersMark | null;
  dragPoint: number | null;
}

export class HeadAndShouldersMarkManager implements IMarkManager<HeadAndShouldersMark> {
  private props: HeadAndShouldersMarkManagerProps;
  private state: HeadAndShouldersMarkState;
  private previewMark: HeadAndShouldersMark | null = null;
  private headAndShouldersMarks: HeadAndShouldersMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;
  private defaultColor: string = '#3964FE';

  constructor(props: HeadAndShouldersMarkManagerProps) {
    this.props = props;
    this.state = {
      isHeadAndShouldersMode: false,
      currentPoints: [],
      currentHeadAndShouldersMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.defaultColor = '#3964FE';
  }

  public getMarkAtPoint(point: Point): HeadAndShouldersMark | null {
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
      for (const mark of this.headAndShouldersMarks) {
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

  public getCurrentDragTarget(): HeadAndShouldersMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint !== null ? this.state.dragPoint.toString() : null;
  }

  public getCurrentOperatingMark(): HeadAndShouldersMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewMark) {
      return this.previewMark;
    }
    if (this.state.isHeadAndShouldersMode && this.state.currentHeadAndShouldersMark) {
      return this.state.currentHeadAndShouldersMark;
    }
    return null;
  }

  public getAllMarks(): HeadAndShouldersMark[] {
    return [...this.headAndShouldersMarks];
  }

  public cancelOperationMode() {
    return this.cancelHeadAndShouldersMode();
  }

  public setHeadAndShouldersMode = (): HeadAndShouldersMarkState => {
    this.state = {
      ...this.state,
      isHeadAndShouldersMode: true,
      currentPoints: [],
      currentHeadAndShouldersMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelHeadAndShouldersMode = (): HeadAndShouldersMarkState => {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.headAndShouldersMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isHeadAndShouldersMode: false,
      currentPoints: [],
      currentHeadAndShouldersMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): HeadAndShouldersMarkState => {
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
      for (const mark of this.headAndShouldersMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY, 20);
        if (pointIndex !== null) {
          this.state = {
            ...this.state,
            isHeadAndShouldersMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: pointIndex
          };
          mark.setDragging(true, pointIndex);
          this.headAndShouldersMarks.forEach(m => {
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
      for (const mark of this.headAndShouldersMarks) {
        if ((mark as any).isPointNearGraph(relativeX, relativeY, 15)) {
          this.state = {
            ...this.state,
            isHeadAndShouldersMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: -1
          };
          mark.setDragging(true, -1);
          this.headAndShouldersMarks.forEach(m => {
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
      if (this.state.isHeadAndShouldersMode && !this.state.isDragging) {
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
        const currentProgress = this.state.currentPoints.length;
        if (this.state.currentPoints.length < 6) {
          if (this.previewMark) {
            const previewDataPoints = [...newDataPoints];
            while (previewDataPoints.length < 7) {
              previewDataPoints.push({ time: timeStr, price });
            }
            chartSeries.series.detachPrimitive(this.previewMark);
            this.previewMark = new HeadAndShouldersMark(previewDataPoints, defaultColor, 2, currentProgress);
            chartSeries.series.attachPrimitive(this.previewMark);
            this.previewMark.setShowHandles(true);
          } else {
            const initialPoints = [...newDataPoints];
            while (initialPoints.length < 7) {
              initialPoints.push({ time: timeStr, price });
            }
            this.previewMark = new HeadAndShouldersMark(initialPoints, defaultColor, 2, currentProgress);
            chartSeries.series.attachPrimitive(this.previewMark);
            this.headAndShouldersMarks.forEach(m => m.setShowHandles(false));
            this.previewMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            currentPoints: [...this.state.currentPoints, point],
            currentHeadAndShouldersMark: this.previewMark
          };
        } else if (this.state.currentPoints.length === 6) {

          if (this.previewMark) {
            chartSeries.series.detachPrimitive(this.previewMark);
            const finalMark = new HeadAndShouldersMark(newDataPoints, defaultColor, 2, 6);
            chartSeries.series.attachPrimitive(finalMark);
            this.headAndShouldersMarks.push(finalMark);
            this.previewMark = null;
            finalMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isHeadAndShouldersMode: false,
            currentPoints: [],
            currentHeadAndShouldersMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelHeadAndShouldersMode();
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
      if (this.state.isHeadAndShouldersMode && this.state.currentPoints.length > 0 && this.previewMark) {
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
        while (previewDataPoints.length < 7) {
          previewDataPoints.push({ time: timeStr, price });
        }
        chartSeries.series.detachPrimitive(this.previewMark);
        const currentProgress = this.state.currentPoints.length + 1;
        this.previewMark = new HeadAndShouldersMark(previewDataPoints, this.defaultColor, 2, currentProgress);
        chartSeries.series.attachPrimitive(this.previewMark);
        this.previewMark.setShowHandles(true);
      }
      if (!this.state.isHeadAndShouldersMode && !this.state.isDragging) {
        let anyMarkHovered = false;
        for (const mark of this.headAndShouldersMarks) {
          const pointIndex = mark.isPointNearHandle(relativeX, relativeY);
          const isNearGraph = (mark as any).isPointNearGraph(relativeX, relativeY, 15);
          mark.setShowHandles(pointIndex !== null || isNearGraph);
          if (pointIndex !== null || isNearGraph) anyMarkHovered = true;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  public handleMouseUp = (point: Point): HeadAndShouldersMarkState => {
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

  public handleKeyDown = (event: KeyboardEvent): HeadAndShouldersMarkState => {
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
      } else if (this.state.isHeadAndShouldersMode) {
        return this.cancelHeadAndShouldersMode();
      }
    }
    return this.state;
  };

  public getState(): HeadAndShouldersMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<HeadAndShouldersMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.headAndShouldersMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.headAndShouldersMarks = [];
  }

  public getHeadAndShouldersMarks(): HeadAndShouldersMark[] {
    return [...this.headAndShouldersMarks];
  }

  public removeHeadAndShouldersMark(mark: HeadAndShouldersMark): void {
    const index = this.headAndShouldersMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.headAndShouldersMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isHeadAndShouldersMode;
  }
}