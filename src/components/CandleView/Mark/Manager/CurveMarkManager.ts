import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { CurveMark } from "../Graph/Shape/CurveMark";
import { IMarkManager } from "../IMarkManager";

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
  dragPoint: 'start' | 'end' | 'control' | 'curve' | null;
}

export class CurveMarkManager implements IMarkManager<CurveMark> {
  private props: CurveMarkManagerProps;
  private state: CurveMarkState;
  private previewCurveMark: CurveMark | null = null;
  private curveMarks: CurveMark[] = [];
  private dragStartData: { time: string; price: number } | null = null;
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


  private formatTime(time: any): string | null {
    if (time === null || time === undefined) return null;

    if (typeof time === 'number') {

      const date = new Date(time * 1000);
      return date.toISOString().split('T')[0];
    } else if (typeof time === 'string') {

      if (/^\d{4}-\d{2}-\d{2}$/.test(time)) {
        return time;
      } else if (/^\d+$/.test(time)) {
        const date = new Date(parseInt(time) * 1000);
        return date.toISOString().split('T')[0];
      } else {

        try {
          const date = new Date(time);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn('Invalid time format:', time);
        }
      }
    }

    return new Date().toISOString().split('T')[0];
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
        if (mark.isPointNearCurve(relativeX, relativeY)) {
          return mark;
        }
      }
    } catch (error) {
      console.error('Error getting mark at point:', error);
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
      const formattedTime = this.formatTime(time);
      if (formattedTime === null || price === null) return this.state;
      this.dragStartData = { time: formattedTime, price };
      for (const mark of this.curveMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          if (!this.state.isCurveMarkMode) {
            this.state = {
              ...this.state,
              isCurveMarkMode: true,
              isDragging: false,
              dragTarget: mark,
              dragPoint: handleType
            };
            this.curveMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            this.isOperating = true;
          } else {

            if (this.state.dragPoint === 'start') {
              mark.updateStartPoint(formattedTime, price);
            } else if (this.state.dragPoint === 'end') {
              mark.updateEndPoint(formattedTime, price);
            } else if (this.state.dragPoint === 'control') {
              mark.updateControlPoint(formattedTime, price);
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
          return this.state;
        }
      }


      for (const mark of this.curveMarks) {
        if (mark.isPointNearCurve(relativeX, relativeY)) {
          this.state = {
            ...this.state,
            isDragging: true,
            dragTarget: mark,
            dragPoint: 'curve'
          };
          mark.setDragging(true, 'curve');
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
            formattedTime,
            price,
            formattedTime,
            price,
            formattedTime,
            price,
            '#2962FF',
            2,
            true
          );
          chartSeries.series.attachPrimitive(this.previewCurveMark);
          this.curveMarks.forEach(m => m.setShowHandles(false));
        } else {

          if (this.previewCurveMark) {
            chartSeries.series.detachPrimitive(this.previewCurveMark);


            const startTime = this.previewCurveMark.getStartTime();
            const startPrice = this.previewCurveMark.getStartPrice();
            const endTime = formattedTime;
            const endPrice = price;


            const startTimeNum = new Date(startTime).getTime();
            const endTimeNum = new Date(endTime).getTime();
            const controlTimeNum = (startTimeNum + endTimeNum) / 2;
            const controlTime = new Date(controlTimeNum).toISOString().split('T')[0];
            const controlPrice = (startPrice + endPrice) / 2 + Math.abs(startPrice - endPrice) * 0.2;

            const finalCurveMark = new CurveMark(
              startTime,
              startPrice,
              endTime,
              endPrice,
              controlTime,
              controlPrice,
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
      console.error('Error placing curve mark:', error);
      this.state = this.cancelCurveMarkMode();
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


      const formattedTime = this.formatTime(time);
      if (formattedTime === null || price === null) return;


      if (this.state.isDragging && this.state.dragTarget && this.dragStartData && this.state.dragPoint === 'curve') {
        if (this.dragStartData.time === null || formattedTime === null) return;
        const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
        const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
        const currentX = timeScale.timeToCoordinate(formattedTime);
        const currentY = chartSeries.series.priceToCoordinate(price);
        if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;
        const deltaX = currentX - currentStartX;
        const deltaY = currentY - currentStartY;
        this.state.dragTarget.dragCurveByPixels(deltaX, deltaY);
        this.dragStartData = { time: formattedTime, price };
        return;
      }


      if (this.state.isCurveMarkMode && this.state.dragTarget && this.state.dragPoint &&
        (this.state.dragPoint === 'start' || this.state.dragPoint === 'end' || this.state.dragPoint === 'control')) {
        if (this.state.dragPoint === 'start') {
          this.state.dragTarget.updateStartPoint(formattedTime, price);
        } else if (this.state.dragPoint === 'end') {
          this.state.dragTarget.updateEndPoint(formattedTime, price);
        } else if (this.state.dragPoint === 'control') {
          this.state.dragTarget.updateControlPoint(formattedTime, price);
        }
      }


      if (!this.state.isDragging) {
        if (this.state.curveMarkStartPoint && this.previewCurveMark) {
          this.previewCurveMark.updateEndPoint(formattedTime, price);


          const startTime = this.previewCurveMark.getStartTime();
          const startPrice = this.previewCurveMark.getStartPrice();

          const startTimeNum = new Date(startTime).getTime();
          const endTimeNum = new Date(formattedTime).getTime();
          const controlTimeNum = (startTimeNum + endTimeNum) / 2;
          const controlTime = new Date(controlTimeNum).toISOString().split('T')[0];
          const controlPrice = (startPrice + price) / 2 + Math.abs(startPrice - price) * 0.2;

          this.previewCurveMark.updateControlPoint(controlTime, controlPrice);
          chart.timeScale().widthChanged();
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
      console.error('Error updating curve mark:', error);
    }
  };

  public handleMouseUp = (point: Point): CurveMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end' || this.state.dragPoint === 'control') {
        this.state = {
          ...this.state,
          isCurveMarkMode: false,
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