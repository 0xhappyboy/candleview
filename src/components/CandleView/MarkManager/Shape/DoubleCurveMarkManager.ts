import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { DoubleCurveMark } from "../../Mark/Shape/DoubleCurveMark";
import { Point } from "../../types";

export interface DoubleCurveMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface DoubleCurveMarkState {
  isDoubleCurveMarkMode: boolean;
  doubleCurveMarkStartPoint: Point | null;
  currentDoubleCurveMark: DoubleCurveMark | null;
  isDragging: boolean;
  dragTarget: DoubleCurveMark | null;
  dragPoint: 'start' | 'end' | 'line' | 'mid1' | 'mid2' | null;
}

export class DoubleCurveMarkManager implements IMarkManager<DoubleCurveMark> {
  private props: DoubleCurveMarkManagerProps;
  private state: DoubleCurveMarkState;
  private previewDoubleCurveMark: DoubleCurveMark | null = null;
  private curveMarks: DoubleCurveMark[] = [];
  private mouseDownPoint: Point | null = null;
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: DoubleCurveMarkManagerProps) {
    this.props = props;
    this.state = {
      isDoubleCurveMarkMode: false,
      doubleCurveMarkStartPoint: null,
      currentDoubleCurveMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public clearState(): void {
    this.state = {
      isDoubleCurveMarkMode: false,
      doubleCurveMarkStartPoint: null,
      currentDoubleCurveMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): DoubleCurveMark | null {
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

  public getCurrentDragTarget(): DoubleCurveMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): DoubleCurveMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewDoubleCurveMark) {
      return this.previewDoubleCurveMark;
    }
    if (this.state.isDoubleCurveMarkMode && this.state.currentDoubleCurveMark) {
      return this.state.currentDoubleCurveMark;
    }
    return null;
  }

  public getAllMarks(): DoubleCurveMark[] {
    return [...this.curveMarks];
  }

  public cancelOperationMode() {
    return this.cancelDoubleCurveMarkMode();
  }

  public setDoubleCurveMarkMode = (): DoubleCurveMarkState => {
    this.state = {
      ...this.state,
      isDoubleCurveMarkMode: true,
      doubleCurveMarkStartPoint: null,
      currentDoubleCurveMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelDoubleCurveMarkMode = (): DoubleCurveMarkState => {
    if (this.previewDoubleCurveMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewDoubleCurveMark);
      this.previewDoubleCurveMark = null;
    }
    this.curveMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isDoubleCurveMarkMode: false,
      doubleCurveMarkStartPoint: null,
      currentDoubleCurveMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): DoubleCurveMarkState => {
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
      for (const mark of this.curveMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          if (!this.state.isDoubleCurveMarkMode) {
            this.state = {
              ...this.state,
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
      if (this.state.isDoubleCurveMarkMode && !this.state.isDragging) {
        if (!this.state.doubleCurveMarkStartPoint) {
          this.state = {
            ...this.state,
            doubleCurveMarkStartPoint: point
          };
          this.previewDoubleCurveMark = new DoubleCurveMark(
            time,
            price,
            time,
            price,
            '#2962FF',
            2,
            false
          );
          chartSeries.series.attachPrimitive(this.previewDoubleCurveMark);
          this.curveMarks.forEach(m => m.setShowHandles(false));
          this.previewDoubleCurveMark.setShowHandles(true);
        } else {
          if (this.previewDoubleCurveMark) {
            chartSeries.series.detachPrimitive(this.previewDoubleCurveMark);
            const finalDoubleCurveMark = new DoubleCurveMark(
              this.previewDoubleCurveMark.getStartTime(),
              this.previewDoubleCurveMark.getStartPrice(),
              time,
              price,
              '#2962FF',
              2,
              false
            );
            chartSeries.series.attachPrimitive(finalDoubleCurveMark);
            this.curveMarks.push(finalDoubleCurveMark);
            this.previewDoubleCurveMark = null;
            finalDoubleCurveMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isDoubleCurveMarkMode: false,
            doubleCurveMarkStartPoint: null,
            currentDoubleCurveMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.state = this.cancelDoubleCurveMarkMode();
    }
    return this.state;
  };

  private isPointNearLine(x: number, y: number, bounds: any, threshold: number = 15): boolean {
    const { startX, startY, endX, endY, minX, maxX, minY, maxY } = bounds;
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

  private cubicBezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
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
        } else if (this.state.dragPoint === 'mid1' || this.state.dragPoint === 'mid2') {
          const startX = timeScale.timeToCoordinate(this.state.dragTarget.getStartTime());
          const startY = chartSeries.series.priceToCoordinate(this.state.dragTarget.getStartPrice());
          const endX = timeScale.timeToCoordinate(this.state.dragTarget.getEndTime());
          const endY = chartSeries.series.priceToCoordinate(this.state.dragTarget.getEndPrice());
          if (startX === null || startY === null || endX === null || endY === null) return;
          const originalMid1X = startX + (endX - startX) * 1 / 3;
          const originalMid1Y = startY + (endY - startY) * 1 / 3;
          const originalMid2X = startX + (endX - startX) * 2 / 3;
          const originalMid2Y = startY + (endY - startY) * 2 / 3;
          const currentMid1OffsetX = this.state.dragTarget.getMid1PixelOffsetX();
          const currentMid1OffsetY = this.state.dragTarget.getMid1PixelOffsetY();
          const currentMid2OffsetX = this.state.dragTarget.getMid2PixelOffsetX();
          const currentMid2OffsetY = this.state.dragTarget.getMid2PixelOffsetY();
          const mid1X = originalMid1X + currentMid1OffsetX;
          const mid1Y = originalMid1Y + currentMid1OffsetY;
          const mid2X = originalMid2X + currentMid2OffsetX;
          const mid2Y = originalMid2Y + currentMid2OffsetY;
          let curveMidX: number, curveMidY: number;
          if (this.state.dragPoint === 'mid1') {
            curveMidX = this.cubicBezierPoint(startX, mid1X, mid2X, endX, 1 / 3);
            curveMidY = this.cubicBezierPoint(startY, mid1Y, mid2Y, endY, 1 / 3);
          } else {
            curveMidX = this.cubicBezierPoint(startX, mid1X, mid2X, endX, 2 / 3);
            curveMidY = this.cubicBezierPoint(startY, mid1Y, mid2Y, endY, 2 / 3);
          }
          const newOffsetX = relativeX - curveMidX;
          const newOffsetY = relativeY - curveMidY;
          const currentOffsetX = this.state.dragPoint === 'mid1' ? currentMid1OffsetX : currentMid2OffsetX;
          const currentOffsetY = this.state.dragPoint === 'mid1' ? currentMid1OffsetY : currentMid2OffsetY;
          if (this.state.dragPoint === 'mid1') {
            this.state.dragTarget.updateMid1Point(currentOffsetX + newOffsetX, currentOffsetY + newOffsetY);
          } else {
            this.state.dragTarget.updateMid2Point(currentOffsetX + newOffsetX, currentOffsetY + newOffsetY);
          }
          this.dragStartData = { time, price };
        }
        return;
      }
      if (!this.state.isDragging) {
        if (this.state.doubleCurveMarkStartPoint && this.previewDoubleCurveMark) {
          this.previewDoubleCurveMark.updateEndPoint(time, price);
        }
        if (!this.state.isDoubleCurveMarkMode && !this.state.isDragging && !this.state.doubleCurveMarkStartPoint) {
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

  public handleMouseUp = (point: Point): DoubleCurveMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end') {
        this.state = {
          ...this.state,
          isDoubleCurveMarkMode: false,
          isDragging: false,
          dragTarget: null,
          dragPoint: null
        };
        if (this.props.onCloseDrawing) {
          this.props.onCloseDrawing();
        }
      } else {
        this.state = {
          ...this.state,
          isDragging: false,
          dragTarget: null,
          dragPoint: null
        };
      }
      this.isOperating = false;
    }
    this.mouseDownPoint = null;
    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): DoubleCurveMarkState => {
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
      } else if (this.state.isDoubleCurveMarkMode) {
        return this.cancelDoubleCurveMarkMode();
      }
    }
    return this.state;
  };

  public getState(): DoubleCurveMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<DoubleCurveMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewDoubleCurveMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewDoubleCurveMark);
      this.previewDoubleCurveMark = null;
    }

    this.curveMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.curveMarks = [];
  }

  public getDoubleCurveMarks(): DoubleCurveMark[] {
    return [...this.curveMarks];
  }

  public removeDoubleCurveMark(mark: DoubleCurveMark): void {
    const index = this.curveMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.curveMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isDoubleCurveMarkMode;
  }
}