import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { CurveMark } from "../../Mark/Shape/CurveMark";
import { Point } from "../../types";

export interface CurveMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface CurveMarkState {
  isCurveMarkMode: boolean;
  curveMarkStartPoint: Point | null;
  currentCurveMark: CurveMark | null;
  isDragging: boolean;
  dragTarget: CurveMark | null;
  dragPoint: 'start' | 'end' | 'line' | 'mid' | null;
}

export class CurveMarkManager implements IMarkManager<CurveMark> {
  private props: CurveMarkManagerProps;
  private state: CurveMarkState;
  private previewCurveMark: CurveMark | null = null;
  private curveMarks: CurveMark[] = [];
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: CurveMarkManagerProps) {
    this.props = props;
    this.state = {
      isCurveMarkMode: false,
      curveMarkStartPoint: null,
      currentCurveMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public clearState(): void {
    this.state = {
      isCurveMarkMode: false,
      curveMarkStartPoint: null,
      currentCurveMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): CurveMark | null {
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
      for (const mark of this.curveMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.curveMarks) {
        const bounds = mark.getBounds();
        if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
          return mark;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public getCurrentDragTarget(): CurveMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): CurveMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewCurveMark) {
      return this.previewCurveMark;
    }
    if (this.state.isCurveMarkMode && this.state.currentCurveMark) {
      return this.state.currentCurveMark;
    }
    return null;
  }

  public getAllMarks(): CurveMark[] {
    return [...this.curveMarks];
  }

  public cancelOperationMode() {
    return this.cancelCurveMarkMode();
  }

  public setCurveMarkMode = (): CurveMarkState => {
    this.state = {
      ...this.state,
      isCurveMarkMode: true,
      curveMarkStartPoint: null,
      currentCurveMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelCurveMarkMode = (): CurveMarkState => {
    if (this.previewCurveMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewCurveMark);
      this.previewCurveMark = null;
    }
    this.curveMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isCurveMarkMode: false,
      curveMarkStartPoint: null,
      currentCurveMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): CurveMarkState => {
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
      this.dragStartData = { time, price };
      for (const mark of this.curveMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          if (!this.state.isCurveMarkMode) {
            this.state = {
              ...this.state,
              isCurveMarkMode: true,
              isDragging: true,
              dragTarget: mark,
              dragPoint: handleType
            };
            this.curveMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            mark.setDragging(true, handleType);
            this.isOperating = true;
          }
          return this.state;
        }
      }
      for (const mark of this.curveMarks) {
        const isNearCurve = mark.isPointNearCurve(relativeX, relativeY);
        if (isNearCurve) {
          this.state = {
            ...this.state,
            isDragging: true,
            dragTarget: mark,
            dragPoint: 'line'
          };
          mark.setDragging(true, 'line');
          this.curveMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }
      if (this.state.isCurveMarkMode && !this.state.isDragging) {
        if (!this.state.curveMarkStartPoint) {
          this.state = {
            ...this.state,
            curveMarkStartPoint: point
          };
          this.previewCurveMark = new CurveMark(
            time,
            price,
            time,
            price,
            '#2962FF',
            2,
            false
          );
          chartSeries.series.attachPrimitive(this.previewCurveMark);
          this.curveMarks.forEach(m => m.setShowHandles(false));
          this.previewCurveMark.setShowHandles(true);
        } else {
          if (this.previewCurveMark) {
            chartSeries.series.detachPrimitive(this.previewCurveMark);
            const finalCurveMark = new CurveMark(
              this.previewCurveMark.getStartTime(),
              this.previewCurveMark.getStartPrice(),
              time,
              price,
              '#2962FF',
              2,
              false
            );
            chartSeries.series.attachPrimitive(finalCurveMark);
            this.curveMarks.push(finalCurveMark);
            this.previewCurveMark = null;
            finalCurveMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isCurveMarkMode: false,
            curveMarkStartPoint: null,
            currentCurveMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelCurveMarkMode();
    }
    return this.state;
  };

  private isPointNearLine(x: number, y: number, bounds: any, threshold: number = 15): boolean {
    if (!bounds) return false;
    const { startX, startY, endX, endY, minX, maxX, minY, maxY } = bounds;
    if (startX == null || startY == null || endX == null || endY == null ||
      minX == null || maxX == null || minY == null || maxY == null) {
      return false;
    }
    if (x < minX - threshold || x > maxX + threshold || y < minY - threshold || y > maxY + threshold) {
      return false;
    }
    const A = x - startX;
    const B = y - startY;
    const C = endX - startX;
    const D = endY - startY;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    let xx, yy;
    if (param < 0) {
      xx = startX;
      yy = startY;
    } else if (param > 1) {
      xx = endX;
      yy = endY;
    } else {
      xx = startX + param * C;
      yy = startY + param * D;
    }
    const dx = x - xx;
    const dy = y - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= threshold;
  }

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
      if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
        if (this.state.dragPoint === 'line') {
          if (this.dragStartData.time === null || time === null) return;
          const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
          const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
          const currentX = timeScale.timeToCoordinate(time);
          const currentY = chartSeries.series.priceToCoordinate(price);
          if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;
          const deltaX = currentX - currentStartX;
          const deltaY = currentY - currentStartY;
          this.state.dragTarget.dragLineByPixels(deltaX, deltaY);
          this.dragStartData = { time, price };
        } else if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end') {
          if (this.state.dragPoint === 'start') {
            this.state.dragTarget.updateStartPoint(time, price);
          } else if (this.state.dragPoint === 'end') {
            this.state.dragTarget.updateEndPoint(time, price);
          }
          this.dragStartData = { time, price };
        } else if (this.state.dragPoint === 'mid') {

          const startX = timeScale.timeToCoordinate(this.state.dragTarget.getStartTime());
          const startY = chartSeries.series.priceToCoordinate(this.state.dragTarget.getStartPrice());
          const endX = timeScale.timeToCoordinate(this.state.dragTarget.getEndTime());
          const endY = chartSeries.series.priceToCoordinate(this.state.dragTarget.getEndPrice());
          if (startX === null || startY === null || endX === null || endY === null) return;
          const originalMidX = (startX + endX) / 2;
          const originalMidY = (startY + endY) / 2;
          const currentMidX = this.state.dragTarget.getMidPixelOffsetX() + originalMidX;
          const currentMidY = this.state.dragTarget.getMidPixelOffsetY() + originalMidY;
          const curveMidX = this.quadraticBezierPoint(startX, currentMidX, endX, 0.5);
          const curveMidY = this.quadraticBezierPoint(startY, currentMidY, endY, 0.5);
          const newOffsetX = relativeX - curveMidX;
          const newOffsetY = relativeY - curveMidY;
          const currentOffsetX = this.state.dragTarget.getMidPixelOffsetX();
          const currentOffsetY = this.state.dragTarget.getMidPixelOffsetY();
          this.state.dragTarget.updateMidPoint(currentOffsetX + newOffsetX, currentOffsetY + newOffsetY);
          this.dragStartData = { time, price };
        }
        return;
      }
      if (!this.state.isDragging) {
        if (this.state.curveMarkStartPoint && this.previewCurveMark) {
          this.previewCurveMark.updateEndPoint(time, price);
        }
        if (!this.state.isCurveMarkMode && !this.state.isDragging && !this.state.curveMarkStartPoint) {
          let anyCurveHovered = false;
          for (const mark of this.curveMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            const isNearCurve = mark.isPointNearCurve(relativeX, relativeY);
            const shouldShow = !!handleType || isNearCurve;
            mark.setShowHandles(shouldShow);
            if (shouldShow) anyCurveHovered = true;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  private quadraticBezierPoint(p0: number, p1: number, p2: number, t: number): number {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  }

  public handleMouseUp = (point: Point): CurveMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      this.state = {
        ...this.state,
        isCurveMarkMode: false,
        isDragging: false,
        dragTarget: null,
        dragPoint: null
      };
      this.isOperating = false;
      this.curveMarks.forEach(m => m.setShowHandles(false));
      if (this.props.onCloseDrawing) {
        this.props.onCloseDrawing();
      }
    }
    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): CurveMarkState => {
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
      } else if (this.state.isCurveMarkMode) {
        return this.cancelCurveMarkMode();
      }
    }
    return this.state;
  };

  public getState(): CurveMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<CurveMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewCurveMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewCurveMark);
      this.previewCurveMark = null;
    }

    this.curveMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.curveMarks = [];
  }

  public getCurveMarks(): CurveMark[] {
    return [...this.curveMarks];
  }

  public removeCurveMark(mark: CurveMark): void {
    const index = this.curveMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.curveMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isCurveMarkMode;
  }
}