import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { IMarkManager } from "../IMarkManager";
import { XABCDMark } from "../Pattern/XABCDMark";

export interface XABCDMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface XABCDMarkState {
  isXABCDMode: boolean;
  currentPoints: Point[];
  currentXABCDMark: XABCDMark | null;
  isDragging: boolean;
  dragTarget: XABCDMark | null;
  dragPoint: number | null;
}

export class XABCDMarkManager implements IMarkManager<XABCDMark> {
  private props: XABCDMarkManagerProps;
  private state: XABCDMarkState;
  private previewMark: XABCDMark | null = null;
  private xabcdMarks: XABCDMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;
  private defaultColor: string = '#396DFE';

  constructor(props: XABCDMarkManagerProps) {
    this.props = props;
    this.state = {
      isXABCDMode: false,
      currentPoints: [],
      currentXABCDMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.defaultColor = '#396DFE';
  }

  public getMarkAtPoint(point: Point): XABCDMark | null {
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
      for (const mark of this.xabcdMarks) {
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

  public getCurrentDragTarget(): XABCDMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint !== null ? this.state.dragPoint.toString() : null;
  }

  public getCurrentOperatingMark(): XABCDMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewMark) {
      return this.previewMark;
    }
    if (this.state.isXABCDMode && this.state.currentXABCDMark) {
      return this.state.currentXABCDMark;
    }
    return null;
  }

  public getAllMarks(): XABCDMark[] {
    return [...this.xabcdMarks];
  }

  public cancelOperationMode() {
    return this.cancelXABCDMode();
  }

  public setXABCDMode = (): XABCDMarkState => {
    this.state = {
      ...this.state,
      isXABCDMode: true,
      currentPoints: [],
      currentXABCDMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelXABCDMode = (): XABCDMarkState => {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.xabcdMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isXABCDMode: false,
      currentPoints: [],
      currentXABCDMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): XABCDMarkState => {
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
      for (const mark of this.xabcdMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY, 20);
        if (pointIndex !== null) {
          this.state = {
            ...this.state,
            isXABCDMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: pointIndex
          };
          mark.setDragging(true, pointIndex);
          this.xabcdMarks.forEach(m => {
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
      for (const mark of this.xabcdMarks) {
        if ((mark as any).isPointNearGraph(relativeX, relativeY, 15)) {
          this.state = {
            ...this.state,
            isXABCDMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: -1
          };
          mark.setDragging(true, -1);
          this.xabcdMarks.forEach(m => {
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
      if (this.state.isXABCDMode && !this.state.isDragging) {
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
          this.previewMark = new XABCDMark(newDataPoints, defaultColor);
          chartSeries.series.attachPrimitive(this.previewMark);
          this.xabcdMarks.forEach(m => m.setShowHandles(false));
          this.previewMark.setShowHandles(true);
          this.state = {
            ...this.state,
            currentPoints: [point],
            currentXABCDMark: this.previewMark
          };
        } else if (this.state.currentPoints.length < 4) {
          if (this.previewMark) {
            const previewDataPoints = [...newDataPoints];
            while (previewDataPoints.length < 5) {
              previewDataPoints.push({ time: timeStr, price });
            }
            chartSeries.series.detachPrimitive(this.previewMark);
            this.previewMark = new XABCDMark(previewDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(this.previewMark);
            this.previewMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            currentPoints: [...this.state.currentPoints, point],
            currentXABCDMark: this.previewMark
          };
        } else if (this.state.currentPoints.length === 4) {
          if (this.previewMark) {
            chartSeries.series.detachPrimitive(this.previewMark);
            const finalMark = new XABCDMark(newDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(finalMark);
            this.xabcdMarks.push(finalMark);
            this.previewMark = null;
            finalMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isXABCDMode: false,
            currentPoints: [],
            currentXABCDMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error('Error placing XABCD mark:', error);
      this.state = this.cancelXABCDMode();
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
      if (this.state.isXABCDMode && this.state.currentPoints.length > 0 && this.previewMark) {
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
        while (previewDataPoints.length < 5) {
          previewDataPoints.push({ time: timeStr, price });
        }
        chartSeries.series.detachPrimitive(this.previewMark);
        this.previewMark = new XABCDMark(previewDataPoints, this.defaultColor);
        chartSeries.series.attachPrimitive(this.previewMark);
        this.previewMark.setShowHandles(true);
      }
      if (!this.state.isXABCDMode && !this.state.isDragging) {
        let anyMarkHovered = false;
        for (const mark of this.xabcdMarks) {
          const pointIndex = mark.isPointNearHandle(relativeX, relativeY);
          const shouldShow = pointIndex !== null;
          const isNearGraph = (mark as any).isPointNearGraph(relativeX, relativeY, 15);
          mark.setShowHandles(shouldShow || isNearGraph);
          if (shouldShow || isNearGraph) anyMarkHovered = true;
        }
      }
    } catch (error) {
      console.error('Error updating XABCD mark:', error);
    }
  };

  public handleMouseUp = (point: Point): XABCDMarkState => {
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

  public handleKeyDown = (event: KeyboardEvent): XABCDMarkState => {
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
      } else if (this.state.isXABCDMode) {
        return this.cancelXABCDMode();
      }
    }
    return this.state;
  };

  public getState(): XABCDMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<XABCDMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.xabcdMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.xabcdMarks = [];
  }

  public getXABCDMarks(): XABCDMark[] {
    return [...this.xabcdMarks];
  }

  public removeXABCDMark(mark: XABCDMark): void {
    const index = this.xabcdMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.xabcdMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isXABCDMode;
  }
}