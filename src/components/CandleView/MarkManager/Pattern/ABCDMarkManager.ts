import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { ABCDMark } from "../../Mark/Pattern/ABCDMark";
import { Point } from "../../types";

export interface ABCDMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface ABCDMarkState {
  isABCDMode: boolean;
  currentPoints: Point[];
  currentABCDMark: ABCDMark | null;
  isDragging: boolean;
  dragTarget: ABCDMark | null;
  dragPoint: number | null;
}

export class ABCDMarkManager implements IMarkManager<ABCDMark> {
  private props: ABCDMarkManagerProps;
  private state: ABCDMarkState;
  private previewMark: ABCDMark | null = null;
  private abcdMarks: ABCDMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;
  private defaultColor: string = '#396DFE';

  constructor(props: ABCDMarkManagerProps) {
    this.props = props;
    this.state = {
      isABCDMode: false,
      currentPoints: [],
      currentABCDMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.defaultColor = '#396DFE';
  }

  public clearState(): void {
    this.state = {
      isABCDMode: false,
      currentPoints: [],
      currentABCDMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): ABCDMark | null {
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
      for (const mark of this.abcdMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY);
        if (pointIndex !== null) {
          return mark;
        }
      }
    } catch (error) {
    }
    return null;
  }

  public getCurrentDragTarget(): ABCDMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint !== null ? this.state.dragPoint.toString() : null;
  }

  public getCurrentOperatingMark(): ABCDMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewMark) {
      return this.previewMark;
    }
    if (this.state.isABCDMode && this.state.currentABCDMark) {
      return this.state.currentABCDMark;
    }
    return null;
  }

  public getAllMarks(): ABCDMark[] {
    return [...this.abcdMarks];
  }

  public cancelOperationMode() {
    return this.cancelABCDMode();
  }

  public setABCDMode = (): ABCDMarkState => {
    this.state = {
      ...this.state,
      isABCDMode: true,
      currentPoints: [],
      currentABCDMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelABCDMode = (): ABCDMarkState => {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.abcdMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isABCDMode: false,
      currentPoints: [],
      currentABCDMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): ABCDMarkState => {
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
      this.dragStartData = { time: time as number, price };
      let clickedExistingMark = false;
      for (const mark of this.abcdMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY, 20);
        if (pointIndex !== null) {
          this.state = {
            ...this.state,
            isABCDMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: pointIndex
          };
          mark.setDragging(true, pointIndex);
          this.abcdMarks.forEach(m => {
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
      for (const mark of this.abcdMarks) {
        if ((mark as any).isPointNearGraph(relativeX, relativeY, 15)) {
          this.state = {
            ...this.state,
            isABCDMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: -1
          };
          mark.setDragging(true, -1);
          this.abcdMarks.forEach(m => {
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
      if (this.state.isABCDMode && !this.state.isDragging) {
        const timeNum = time as number;
        let newDataPoints: { time: number; price: number }[];

        if (this.state.currentPoints.length === 0) {
          newDataPoints = [{ time: timeNum, price }];
        } else {
          newDataPoints = [
            ...this.state.currentPoints.map(p => {
              const relX = p.x - (containerRect.left - chartRect.left);
              const relY = p.y - (containerRect.top - chartRect.top);
              const t = timeScale.coordinateToTime(relX);
              const pr = chartSeries.series.coordinateToPrice(relY);
              return { time: t as number || 0, price: pr || 0 };
            }),
            { time: timeNum, price }
          ];
        }
        const defaultColor = this.defaultColor;
        if (this.state.currentPoints.length === 0) {
          this.previewMark = new ABCDMark(newDataPoints, defaultColor);
          chartSeries.series.attachPrimitive(this.previewMark);
          this.abcdMarks.forEach(m => m.setShowHandles(false));
          this.previewMark.setShowHandles(true);
          this.state = {
            ...this.state,
            currentPoints: [point],
            currentABCDMark: this.previewMark
          };
        } else if (this.state.currentPoints.length < 3) {
          if (this.previewMark) {
            const previewDataPoints = [...newDataPoints];
            while (previewDataPoints.length < 4) {
              previewDataPoints.push({ time: timeNum, price });
            }
            chartSeries.series.detachPrimitive(this.previewMark);
            this.previewMark = new ABCDMark(previewDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(this.previewMark);
            this.previewMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            currentPoints: [...this.state.currentPoints, point],
            currentABCDMark: this.previewMark
          };
        } else if (this.state.currentPoints.length === 3) {
          if (this.previewMark) {
            chartSeries.series.detachPrimitive(this.previewMark);
            const finalMark = new ABCDMark(newDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(finalMark);
            this.abcdMarks.push(finalMark);
            this.previewMark = null;
            finalMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isABCDMode: false,
            currentPoints: [],
            currentABCDMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      this.state = this.cancelABCDMode();
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
          this.state.dragTarget.updatePoint(this.state.dragPoint, time as number, price);
        }
        return;
      }
      if (this.state.isABCDMode && this.state.currentPoints.length > 0 && this.previewMark) {
        const timeNum = time as number;
        let previewDataPoints: { time: number; price: number }[] = [];
        for (let i = 0; i < this.state.currentPoints.length; i++) {
          const p = this.state.currentPoints[i];
          const relX = p.x - (containerRect.left - chartRect.left);
          const relY = p.y - (containerRect.top - chartRect.top);
          const t = timeScale.coordinateToTime(relX);
          const pr = chartSeries.series.coordinateToPrice(relY);
          if (t && pr !== null) {
            previewDataPoints.push({ time: t as number, price: pr });
          }
        }
        previewDataPoints.push({ time: timeNum, price });
        while (previewDataPoints.length < 4) {
          previewDataPoints.push({ time: timeNum, price });
        }
        chartSeries.series.detachPrimitive(this.previewMark);
        this.previewMark = new ABCDMark(previewDataPoints, this.defaultColor);
        chartSeries.series.attachPrimitive(this.previewMark);
        this.previewMark.setShowHandles(true);
      }
      if (!this.state.isABCDMode && !this.state.isDragging) {
        let anyMarkHovered = false;
        for (const mark of this.abcdMarks) {
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

  public handleMouseUp = (point: Point): ABCDMarkState => {
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

  public handleKeyDown = (event: KeyboardEvent): ABCDMarkState => {
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
      } else if (this.state.isABCDMode) {
        return this.cancelABCDMode();
      }
    }
    return this.state;
  };

  public getState(): ABCDMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<ABCDMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.abcdMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.abcdMarks = [];
  }

  public getABCDMarks(): ABCDMark[] {
    return [...this.abcdMarks];
  }

  public removeABCDMark(mark: ABCDMark): void {
    const index = this.abcdMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.abcdMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isABCDMode;
  }
}