import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { IMarkManager } from "../../IMarkManager";
import { ElliottTripleCombinationMark } from "../../Pattern/ElliottTripleCombinationMark";

export interface ElliottTripleCombinationMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface ElliottTripleCombinationMarkState {
  isElliottTripleCombinationMode: boolean;
  currentPoints: Point[];
  currentElliottTripleCombinationMark: ElliottTripleCombinationMark | null;
  isDragging: boolean;
  dragTarget: ElliottTripleCombinationMark | null;
  dragPoint: number | null;
}

export class ElliottTripleCombinationMarkManager implements IMarkManager<ElliottTripleCombinationMark> {
  private props: ElliottTripleCombinationMarkManagerProps;
  private state: ElliottTripleCombinationMarkState;
  private previewMark: ElliottTripleCombinationMark | null = null;
  private ElliottTripleCombinationMarks: ElliottTripleCombinationMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;
  private defaultColor: string = '#3694FE';

  constructor(props: ElliottTripleCombinationMarkManagerProps) {
    this.props = props;
    this.state = {
      isElliottTripleCombinationMode: false,
      currentPoints: [],
      currentElliottTripleCombinationMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.defaultColor = '#3694FE';
  }

  public getMarkAtPoint(point: Point): ElliottTripleCombinationMark | null {
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
      for (const mark of this.ElliottTripleCombinationMarks) {
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

  public getCurrentDragTarget(): ElliottTripleCombinationMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint !== null ? this.state.dragPoint.toString() : null;
  }

  public getCurrentOperatingMark(): ElliottTripleCombinationMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewMark) {
      return this.previewMark;
    }
    if (this.state.isElliottTripleCombinationMode && this.state.currentElliottTripleCombinationMark) {
      return this.state.currentElliottTripleCombinationMark;
    }
    return null;
  }

  public getAllMarks(): ElliottTripleCombinationMark[] {
    return [...this.ElliottTripleCombinationMarks];
  }

  public cancelOperationMode() {
    return this.cancelElliottTripleCombinationMode();
  }

  public setElliottTripleCombinationMode = (): ElliottTripleCombinationMarkState => {
    this.state = {
      ...this.state,
      isElliottTripleCombinationMode: true,
      currentPoints: [],
      currentElliottTripleCombinationMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelElliottTripleCombinationMode = (): ElliottTripleCombinationMarkState => {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.ElliottTripleCombinationMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isElliottTripleCombinationMode: false,
      currentPoints: [],
      currentElliottTripleCombinationMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): ElliottTripleCombinationMarkState => {
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


      for (const mark of this.ElliottTripleCombinationMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY, 20);
        if (pointIndex !== null) {
          this.state = {
            ...this.state,
            isElliottTripleCombinationMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: pointIndex
          };
          mark.setDragging(true, pointIndex);
          this.ElliottTripleCombinationMarks.forEach(m => {
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
      for (const mark of this.ElliottTripleCombinationMarks) {
        if ((mark as any).isPointNearGraph(relativeX, relativeY, 15)) {
          this.state = {
            ...this.state,
            isElliottTripleCombinationMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: -1
          };
          mark.setDragging(true, -1);
          this.ElliottTripleCombinationMarks.forEach(m => {
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
      if (this.state.isElliottTripleCombinationMode && !this.state.isDragging) {
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
          this.previewMark = new ElliottTripleCombinationMark(newDataPoints, defaultColor);
          chartSeries.series.attachPrimitive(this.previewMark);
          this.ElliottTripleCombinationMarks.forEach(m => m.setShowHandles(false));
          this.previewMark.setShowHandles(true);
          this.state = {
            ...this.state,
            currentPoints: [point],
            currentElliottTripleCombinationMark: this.previewMark
          };
        } else if (this.state.currentPoints.length < 6) {
          if (this.previewMark) {
            const previewDataPoints = [...newDataPoints];
            while (previewDataPoints.length < 6) {
              previewDataPoints.push({ time: timeStr, price });
            }
            chartSeries.series.detachPrimitive(this.previewMark);
            this.previewMark = new ElliottTripleCombinationMark(previewDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(this.previewMark);
            this.previewMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            currentPoints: [...this.state.currentPoints, point],
            currentElliottTripleCombinationMark: this.previewMark
          };
        } else if (this.state.currentPoints.length === 6) {
          if (this.previewMark) {
            chartSeries.series.detachPrimitive(this.previewMark);
            const finalMark = new ElliottTripleCombinationMark(newDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(finalMark);
            this.ElliottTripleCombinationMarks.push(finalMark);
            this.previewMark = null;
            finalMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isElliottTripleCombinationMode: false,
            currentPoints: [],
            currentElliottTripleCombinationMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelElliottTripleCombinationMode();
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


      if (this.state.isElliottTripleCombinationMode && this.state.currentPoints.length > 0 && this.previewMark) {
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
        this.previewMark = new ElliottTripleCombinationMark(previewDataPoints, this.defaultColor);
        chartSeries.series.attachPrimitive(this.previewMark);
        this.previewMark.setShowHandles(true);
      }

      if (!this.state.isElliottTripleCombinationMode && !this.state.isDragging) {
        let anyMarkHovered = false;
        for (const mark of this.ElliottTripleCombinationMarks) {
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

  public handleMouseUp = (point: Point): ElliottTripleCombinationMarkState => {
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

  public handleKeyDown = (event: KeyboardEvent): ElliottTripleCombinationMarkState => {
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
      } else if (this.state.isElliottTripleCombinationMode) {
        return this.cancelElliottTripleCombinationMode();
      }
    }
    return this.state;
  };

  public getState(): ElliottTripleCombinationMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<ElliottTripleCombinationMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.ElliottTripleCombinationMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.ElliottTripleCombinationMarks = [];
  }

  public getElliottTripleCombinationMarks(): ElliottTripleCombinationMark[] {
    return [...this.ElliottTripleCombinationMarks];
  }

  public removeElliottTripleCombinationMark(mark: ElliottTripleCombinationMark): void {
    const index = this.ElliottTripleCombinationMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.ElliottTripleCombinationMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isElliottTripleCombinationMode;
  }
}