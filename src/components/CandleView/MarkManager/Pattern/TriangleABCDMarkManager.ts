import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { IMarkManager } from "../../Mark/IMarkManager";
import { TriangleABCDMark } from "../../Mark/Pattern/TriangleABCDMark";

export interface TriangleABCDMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface TriangleABCDMarkState {
  isGlassTriangleABCDMode: boolean;
  currentPoints: Point[];
  currentTriangleABCDMark: TriangleABCDMark | null;
  isDragging: boolean;
  dragTarget: TriangleABCDMark | null;
  dragPoint: number | null;
}

export class TriangleABCDMarkManager implements IMarkManager<TriangleABCDMark> {
  private props: TriangleABCDMarkManagerProps;
  private state: TriangleABCDMarkState;
  private previewMark: TriangleABCDMark | null = null;
  private TriangleABCDMarks: TriangleABCDMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;
  private defaultColor: string = '#396DFE';
  private lastMousePoint: Point | null = null;

  constructor(props: TriangleABCDMarkManagerProps) {
    this.props = props;
    this.state = {
      isGlassTriangleABCDMode: false,
      currentPoints: [],
      currentTriangleABCDMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.defaultColor = '#396DFE';
  }

  public clearState(): void {
    this.state = {
      isGlassTriangleABCDMode: false,
      currentPoints: [],
      currentTriangleABCDMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.lastMousePoint = null;
  }

  public getMarkAtPoint(point: Point): TriangleABCDMark | null {
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
      for (const mark of this.TriangleABCDMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY);
        if (pointIndex !== null) {
          return mark;
        }
      }
    } catch (error) {
    }
    return null;
  }

  public getCurrentDragTarget(): TriangleABCDMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint !== null ? this.state.dragPoint.toString() : null;
  }

  public getCurrentOperatingMark(): TriangleABCDMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewMark) {
      return this.previewMark;
    }
    if (this.state.isGlassTriangleABCDMode && this.state.currentTriangleABCDMark) {
      return this.state.currentTriangleABCDMark;
    }
    return null;
  }

  public getAllMarks(): TriangleABCDMark[] {
    return [...this.TriangleABCDMarks];
  }

  public cancelOperationMode() {
    return this.cancelGlassTriangleABCDMode();
  }

  public setGlassTriangleABCDMode = (): TriangleABCDMarkState => {
    this.state = {
      ...this.state,
      isGlassTriangleABCDMode: true,
      currentPoints: [],
      currentTriangleABCDMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.lastMousePoint = null;
    return this.state;
  };

  public cancelGlassTriangleABCDMode = (): TriangleABCDMarkState => {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.TriangleABCDMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isGlassTriangleABCDMode: false,
      currentPoints: [],
      currentTriangleABCDMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    this.lastMousePoint = null;
    return this.state;
  };

  public handleMouseDown = (point: Point): TriangleABCDMarkState => {
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
      this.lastMousePoint = point;
      this.dragStartData = { time, price };
      
      let clickedExistingMark = false;
      
      for (const mark of this.TriangleABCDMarks) {
        const pointIndex = mark.isPointNearHandle(relativeX, relativeY, 20);
        if (pointIndex !== null) {
          this.state = {
            ...this.state,
            isGlassTriangleABCDMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: pointIndex
          };
          mark.setDragging(true, pointIndex);
          this.TriangleABCDMarks.forEach(m => {
            if (m !== mark) m.setShowHandles(false);
          });
          this.isOperating = true;
          clickedExistingMark = true;
          break;
        }
      }
      if (clickedExistingMark) {
        return this.state;
      }
      
      
      for (const mark of this.TriangleABCDMarks) {
        if (mark.isPointNearGraph(relativeX, relativeY, 15)) {
          this.state = {
            ...this.state,
            isGlassTriangleABCDMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: -1
          };
          mark.setDragging(true, -1);
          this.TriangleABCDMarks.forEach(m => {
            if (m !== mark) m.setShowHandles(false);
          });
          this.isOperating = true;
          clickedExistingMark = true;
          break;
        }
      }
      if (clickedExistingMark) {
        return this.state;
      }
      
      
      if (this.state.isGlassTriangleABCDMode && !this.state.isDragging) {
        const timeNum = time;
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
              return { time: t || 0, price: pr || 0 };
            }),
            { time: timeNum, price }
          ];
        }
        
        const defaultColor = this.defaultColor;
        
        if (this.state.currentPoints.length < 3) {
          if (this.previewMark) {
            const previewDataPoints = [...newDataPoints];
            while (previewDataPoints.length < 4) {
              previewDataPoints.push({ time: timeNum, price });
            }
            chartSeries.series.detachPrimitive(this.previewMark);
            this.previewMark = new TriangleABCDMark(previewDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(this.previewMark);
            this.previewMark.setShowHandles(true);
          } else {
            this.previewMark = new TriangleABCDMark(newDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(this.previewMark);
            this.TriangleABCDMarks.forEach(m => m.setShowHandles(false));
            this.previewMark.setShowHandles(true);
          }
          
          this.state = {
            ...this.state,
            currentPoints: [...this.state.currentPoints, point],
            currentTriangleABCDMark: this.previewMark
          };
        } else if (this.state.currentPoints.length === 3) {
          if (this.previewMark) {
            chartSeries.series.detachPrimitive(this.previewMark);
            const finalMark = new TriangleABCDMark(newDataPoints, defaultColor);
            chartSeries.series.attachPrimitive(finalMark);
            this.TriangleABCDMarks.push(finalMark);
            this.previewMark = null;
            finalMark.setShowHandles(true);
          }
          
          this.state = {
            ...this.state,
            isGlassTriangleABCDMode: false,
            currentPoints: [],
            currentTriangleABCDMark: null
          };
          
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      this.state = this.cancelGlassTriangleABCDMode();
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
          
          if (this.lastMousePoint) {
            
            const lastRelativeX = this.lastMousePoint.x - (containerRect.left - chartRect.left);
            const lastRelativeY = this.lastMousePoint.y - (containerRect.top - chartRect.top);
            
            const deltaX = relativeX - lastRelativeX;
            const deltaY = relativeY - lastRelativeY;
            
            this.state.dragTarget.moveAllPoints(deltaX, deltaY);
          }
        } else {
          
          this.state.dragTarget.updatePoint(this.state.dragPoint, time, price);
        }
        this.lastMousePoint = point;
        return;
      }
      
      
      if (this.state.isGlassTriangleABCDMode && this.state.currentPoints.length > 0 && this.previewMark) {
        const timeNum = time;
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
        
        previewDataPoints.push({ time: timeNum, price });
        while (previewDataPoints.length < 4) {
          previewDataPoints.push({ time: timeNum, price });
        }
        
        chartSeries.series.detachPrimitive(this.previewMark);
        this.previewMark = new TriangleABCDMark(previewDataPoints, this.defaultColor);
        chartSeries.series.attachPrimitive(this.previewMark);
        this.previewMark.setShowHandles(true);
      }
      
      
      if (!this.state.isGlassTriangleABCDMode && !this.state.isDragging) {
        let anyMarkHovered = false;
        for (const mark of this.TriangleABCDMarks) {
          const pointIndex = mark.isPointNearHandle(relativeX, relativeY);
          const isNearGraph = mark.isPointNearGraph(relativeX, relativeY, 15);
          const shouldShow = pointIndex !== null || isNearGraph;
          mark.setShowHandles(shouldShow);
          if (shouldShow) anyMarkHovered = true;
        }
        
        if (!anyMarkHovered) {
          this.TriangleABCDMarks.forEach(mark => {
            mark.setShowHandles(false);
          });
        }
      }
      
      this.lastMousePoint = point;
    } catch (error) {
    }
  };

  public handleMouseUp = (point: Point): TriangleABCDMarkState => {
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
    this.lastMousePoint = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): TriangleABCDMarkState => {
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
      } else if (this.state.isGlassTriangleABCDMode) {
        return this.cancelGlassTriangleABCDMode();
      }
    }
    return this.state;
  };

  public getState(): TriangleABCDMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<TriangleABCDMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMark);
      this.previewMark = null;
    }
    this.TriangleABCDMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.TriangleABCDMarks = [];
    this.lastMousePoint = null;
  }

  public getTriangleABCDMarks(): TriangleABCDMark[] {
    return [...this.TriangleABCDMarks];
  }

  public removeTriangleABCDMark(mark: TriangleABCDMark): void {
    const index = this.TriangleABCDMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.TriangleABCDMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isGlassTriangleABCDMode;
  }
}