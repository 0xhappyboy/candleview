import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { ElliottDoubleCombinationMark } from "../../Mark/Pattern/ElliottDoubleCombinationMark";
import { Point } from "../../types";

export interface ElliottDoubleCombinationMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface ElliottDoubleCombinationMarkState {
  isElliottDoubleCombinationMode: boolean;
  currentPoints: Point[];
  currentElliottDoubleCombinationMark: ElliottDoubleCombinationMark | null;
  isDragging: boolean;
  dragTarget: ElliottDoubleCombinationMark | null;
  dragPoint: number | null;
}

export class ElliottDoubleCombinationMarkManager implements IMarkManager<ElliottDoubleCombinationMark> {
  private props: ElliottDoubleCombinationMarkManagerProps;
  private state: ElliottDoubleCombinationMarkState;
  private previewMark: ElliottDoubleCombinationMark | null = null;
  private elliottDoubleCombinationMarks: ElliottDoubleCombinationMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;
  private defaultColor: string = '#3694FE';

  constructor(props: ElliottDoubleCombinationMarkManagerProps) {
    this.props = props;
    this.state = {
      isElliottDoubleCombinationMode: false,
      currentPoints: [],
      currentElliottDoubleCombinationMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.defaultColor = '#3694FE';
  }

  public clearState(): void {
    this.state = {
      isElliottDoubleCombinationMode: false,
      currentPoints: [],
      currentElliottDoubleCombinationMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): ElliottDoubleCombinationMark | null {
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
      for (const mark of this.elliottDoubleCombinationMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY);
        if (pointIndex !== null) {
          return mark;
        }
      }
    } catch (error) {
    }
    return null;
  }

  public getCurrentDragTarget(): ElliottDoubleCombinationMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint !== null ? this.state.dragPoint.toString() : null;
  }

  public getCurrentOperatingMark(): ElliottDoubleCombinationMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewMark) {
      return this.previewMark;
    }
    if (this.state.isElliottDoubleCombinationMode && this.state.currentElliottDoubleCombinationMark) {
      return this.state.currentElliottDoubleCombinationMark;
    }
    return null;
  }

  public getAllMarks(): ElliottDoubleCombinationMark[] {
    return [...this.elliottDoubleCombinationMarks];
  }

  public cancelOperationMode() {
    return this.cancelElliottDoubleCombinationMode();
  }

  public setElliottDoubleCombinationMode = (): ElliottDoubleCombinationMarkState => {
    this.state = {
      ...this.state,
      isElliottDoubleCombinationMode: true,
      currentPoints: [],
      currentElliottDoubleCombinationMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelElliottDoubleCombinationMode = (): ElliottDoubleCombinationMarkState => {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.elliottDoubleCombinationMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isElliottDoubleCombinationMode: false,
      currentPoints: [],
      currentElliottDoubleCombinationMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): ElliottDoubleCombinationMarkState => {
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
      for (const mark of this.elliottDoubleCombinationMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY, 20);
        if (pointIndex !== null) {
          this.state = {
            ...this.state,
            isElliottDoubleCombinationMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: pointIndex
          };
          mark.setDragging(true, pointIndex);
          this.elliottDoubleCombinationMarks.forEach(m => {
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
      for (const mark of this.elliottDoubleCombinationMarks) {
        if ((mark as any).isPointNearGraph(relativeX, relativeY, 15)) {
          this.state = {
            ...this.state,
            isElliottDoubleCombinationMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: -1
          };
          mark.setDragging(true, -1);
          this.elliottDoubleCombinationMarks.forEach(m => {
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
      if (this.state.isElliottDoubleCombinationMode && !this.state.isDragging) {
        let newDataPoints: { time: number; price: number }[];
        if (this.state.currentPoints.length === 0) {
          newDataPoints = [{ time, price }];
        } else {
          newDataPoints = [
            ...this.state.currentPoints.map(p => {
              const relX = p.x - (containerRect.left - chartRect.left);
              const relY = p.y - (containerRect.top - chartRect.top);
              const t = timeScale.coordinateToTime(relX);
              const pr = chartSeries.series.coordinateToPrice(relY);
              return { time: t || 0, price: pr || 0 };
            }),
            { time, price }
          ];
        }
        const defaultColor = this.defaultColor;
        if (this.state.currentPoints.length === 0) {
          this.previewMark = new ElliottDoubleCombinationMark(newDataPoints, defaultColor);
          chartSeries.series.attachPrimitive(this.previewMark);
          this.elliottDoubleCombinationMarks.forEach(m => m.setShowHandles(false));
          this.previewMark.setShowHandles(true);
          this.state = {
            ...this.state,
            currentPoints: [point],
            currentElliottDoubleCombinationMark: this.previewMark
          };
        } else if (this.state.currentPoints.length < 3) {
          if (this.previewMark) {
            const previewDataPoints = [...newDataPoints];
            while (previewDataPoints.length < 4) {
              previewDataPoints.push({ time, price });
            }
            chartSeries.series.detachPrimitive(this.previewMark);
            this.previewMark = new ElliottDoubleCombinationMark(previewDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(this.previewMark);
            this.previewMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            currentPoints: [...this.state.currentPoints, point],
            currentElliottDoubleCombinationMark: this.previewMark
          };
        } else if (this.state.currentPoints.length === 3) {
          if (this.previewMark) {
            chartSeries.series.detachPrimitive(this.previewMark);
            const finalMark = new ElliottDoubleCombinationMark(newDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(finalMark);
            this.elliottDoubleCombinationMarks.push(finalMark);
            this.previewMark = null;
            finalMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isElliottDoubleCombinationMode: false,
            currentPoints: [],
            currentElliottDoubleCombinationMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      this.state = this.cancelElliottDoubleCombinationMode();
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
          this.state.dragTarget.updatePoint(this.state.dragPoint, time, price);
        }
        return;
      }
      if (this.state.isElliottDoubleCombinationMode && this.state.currentPoints.length > 0 && this.previewMark) {
        let previewDataPoints: { time: number; price: number }[] = [];
        for (let i = 0; i < this.state.currentPoints.length; i++) {
          const p = this.state.currentPoints[i];
          const relX = p.x - (containerRect.left - chartRect.left);
          const relY = p.y - (containerRect.top - chartRect.top);
          const t = timeScale.coordinateToTime(relX);
          const pr = chartSeries.series.coordinateToPrice(relY);
          if (t && pr !== null) {
            previewDataPoints.push({ time: t, price: pr });
          }
        }
        previewDataPoints.push({ time, price });
        while (previewDataPoints.length < 4) {
          previewDataPoints.push({ time, price });
        }
        chartSeries.series.detachPrimitive(this.previewMark);
        this.previewMark = new ElliottDoubleCombinationMark(previewDataPoints, this.defaultColor);
        chartSeries.series.attachPrimitive(this.previewMark);
        this.previewMark.setShowHandles(true);
      }
      if (!this.state.isElliottDoubleCombinationMode && !this.state.isDragging) {
        let anyMarkHovered = false;
        for (const mark of this.elliottDoubleCombinationMarks) {
          const pointIndex = mark.isPointNearHandle(relativeX, relativeY);
          const shouldShow = pointIndex !== null;
          const isNearGraph = (mark as any).isPointNearGraph(relativeX, relativeY, 15);
          mark.setShowHandles(shouldShow || isNearGraph);
          if (shouldShow || isNearGraph) anyMarkHovered = true;
        }
      }
    } catch (error) {
    }
  };

  public handleMouseUp = (point: Point): ElliottDoubleCombinationMarkState => {
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

  public handleKeyDown = (event: KeyboardEvent): ElliottDoubleCombinationMarkState => {
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
      } else if (this.state.isElliottDoubleCombinationMode) {
        return this.cancelElliottDoubleCombinationMode();
      }
    }
    return this.state;
  };

  public getState(): ElliottDoubleCombinationMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<ElliottDoubleCombinationMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.elliottDoubleCombinationMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.elliottDoubleCombinationMarks = [];
    this.hiddenMarks = [];
  }

  public getElliottDoubleCombinationMarks(): ElliottDoubleCombinationMark[] {
    return [...this.elliottDoubleCombinationMarks];
  }

  public removeElliottDoubleCombinationMark(mark: ElliottDoubleCombinationMark): void {
    const index = this.elliottDoubleCombinationMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.elliottDoubleCombinationMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isElliottDoubleCombinationMode;
  }

  private hiddenMarks: ElliottDoubleCombinationMark[] = [];

  public hideAllMarks(): void {
    this.hiddenMarks.push(...this.elliottDoubleCombinationMarks);
    this.elliottDoubleCombinationMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.elliottDoubleCombinationMarks = [];
  }

  public showAllMarks(): void {
    this.elliottDoubleCombinationMarks.push(...this.hiddenMarks);
    this.hiddenMarks.forEach(mark => {
      this.props.chartSeries?.series.attachPrimitive(mark);
    });
    this.hiddenMarks = [];
  }

  public hideMark(mark: ElliottDoubleCombinationMark): void {
    const index = this.elliottDoubleCombinationMarks.indexOf(mark);
    if (index > -1) {
      this.elliottDoubleCombinationMarks.splice(index, 1);
      this.hiddenMarks.push(mark);
      this.props.chartSeries?.series.detachPrimitive(mark);
    }
  }

  public showMark(mark: ElliottDoubleCombinationMark): void {
    const index = this.hiddenMarks.indexOf(mark);
    if (index > -1) {
      this.hiddenMarks.splice(index, 1);
      this.elliottDoubleCombinationMarks.push(mark);
      this.props.chartSeries?.series.attachPrimitive(mark);
    }
  }
}