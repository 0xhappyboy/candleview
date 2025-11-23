import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { EllipseMark } from "../../Mark/Shape/EllipseMark";
import { Point } from "../../types";

export interface EllipseMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface EllipseMarkState {
  isEllipseMarkMode: boolean;
  ellipseMarkStartPoint: Point | null;
  currentEllipseMark: EllipseMark | null;
  isDragging: boolean;
  dragTarget: EllipseMark | null;
  dragPoint: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'rotate' | 'ellipse' | null;
  isDrawing: boolean;
}

interface DragStartData {
  time: number;
  price: number;
  x: number;
  y: number;
  initialRadiusX?: number;
  initialRadiusY?: number;
  initialAngle?: number;
  initialCenterX?: number;
  initialCenterY?: number;
}

export class EllipseMarkManager implements IMarkManager<EllipseMark> {
  private props: EllipseMarkManagerProps;
  private state: EllipseMarkState;
  private previewEllipseMark: EllipseMark | null = null;
  private ellipseMarks: EllipseMark[] = [];
  private isOperating: boolean = false;
  private dragStartData: DragStartData | null = null;

  constructor(props: EllipseMarkManagerProps) {
    this.props = props;
    this.state = {
      isEllipseMarkMode: false,
      ellipseMarkStartPoint: null,
      currentEllipseMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }
  
  public clearState(): void {
     this.state = {
      isEllipseMarkMode: false,
      ellipseMarkStartPoint: null,
      currentEllipseMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
  }

  public getMarkAtPoint(point: Point): EllipseMark | null {
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

      for (const mark of this.ellipseMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }

      for (const mark of this.ellipseMarks) {
        if (mark.isPointInEllipse(relativeX, relativeY)) {
          return mark;
        }
      }
    } catch (error) {
    }
    return null;
  }

  public getCurrentDragTarget(): EllipseMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): EllipseMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewEllipseMark) {
      return this.previewEllipseMark;
    }
    if (this.state.isEllipseMarkMode && this.state.currentEllipseMark) {
      return this.state.currentEllipseMark;
    }
    return null;
  }

  public getAllMarks(): EllipseMark[] {
    return [...this.ellipseMarks];
  }

  public cancelOperationMode() {
    return this.cancelEllipseMarkMode();
  }

  public setEllipseMarkMode = (): EllipseMarkState => {
    this.state = {
      ...this.state,
      isEllipseMarkMode: true,
      ellipseMarkStartPoint: null,
      currentEllipseMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
    return this.state;
  };

  public cancelEllipseMarkMode = (): EllipseMarkState => {
    if (this.previewEllipseMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewEllipseMark);
      this.previewEllipseMark = null;
    }
    this.ellipseMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isEllipseMarkMode: false,
      ellipseMarkStartPoint: null,
      currentEllipseMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      isDrawing: false
    };
    this.isOperating = false;
    return this.state;
  };

  private getValidTimeFromCoordinate(chart: any, x: number): number | null {
    try {
      const timeScale = chart.timeScale();
      const time = timeScale.coordinateToTime(x);
      if (time === null) {
        const series = chart.series();
        const data = series?.data();
        if (data && data.length > 0) {
          return data[0].time;
        }
        return null;
      }
      return time;
    } catch (error) {
      return null;
    }
  }

  public handleMouseDown = (point: Point): EllipseMarkState => {
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
      const time = this.getValidTimeFromCoordinate(chart, relativeX);
      const price = chartSeries.series.coordinateToPrice(relativeY);

      if (time === null || price === null) {
        console.warn('Cannot get valid time or price from coordinates');
        return this.state;
      }

      let existingMarkClicked = false;

      for (const mark of this.ellipseMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        const isInEllipse = mark.isPointInEllipse(relativeX, relativeY);

        if (handleType || isInEllipse) {
          existingMarkClicked = true;

          const centerX = chart.timeScale().timeToCoordinate(mark.getCenterTime());
          const centerY = chartSeries.series.priceToCoordinate(mark.getCenterPrice());

          this.dragStartData = {
            time: time,
            price: price,
            x: relativeX,
            y: relativeY,
            initialRadiusX: mark.getPixelRadiusX(),
            initialRadiusY: mark.getPixelRadiusY(),
            initialAngle: mark.getAngle(),
            initialCenterX: centerX,
            initialCenterY: centerY
          };

          this.state = {
            ...this.state,
            isEllipseMarkMode: false,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType || 'ellipse'
          };

          if (handleType) {
            mark.setDragging(true, handleType);
          } else {
            mark.setDragging(true, 'ellipse');
          }


          this.ellipseMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });

          this.isOperating = true;
          return this.state;
        }
      }


      if (this.state.isEllipseMarkMode && !existingMarkClicked && !this.state.isDragging) {
        if (!this.state.isDrawing) {

          this.state = {
            ...this.state,
            ellipseMarkStartPoint: { x: relativeX, y: relativeY },
            isDrawing: true
          };

          this.previewEllipseMark = new EllipseMark(
            time,
            price,
            0,
            0,
            0,
            '#2962FF',
            2,
            true
          );

          try {
            chartSeries.series.attachPrimitive(this.previewEllipseMark);

            this.ellipseMarks.forEach(m => m.setShowHandles(false));
          } catch (error) {
            this.previewEllipseMark = null;
            this.state.isDrawing = false;
          }
        } else {

          if (this.previewEllipseMark && this.state.ellipseMarkStartPoint) {
            try {
              const centerTime = this.previewEllipseMark.getCenterTime();
              const centerPrice = this.previewEllipseMark.getCenterPrice();
              const centerX = chart.timeScale().timeToCoordinate(centerTime);
              const centerY = chartSeries.series.priceToCoordinate(centerPrice);

              if (centerX !== null && centerY !== null) {
                const radiusX = Math.abs(relativeX - centerX);
                const radiusY = Math.abs(relativeY - centerY);


                if (radiusX > 5 && radiusY > 5) {

                  const deltaX = relativeX - centerX;
                  const deltaY = relativeY - centerY;
                  const angle = Math.atan2(deltaY, deltaX);

                  const finalEllipseMark = new EllipseMark(
                    centerTime,
                    centerPrice,
                    0,
                    0,
                    angle,
                    '#2962FF',
                    2,
                    false
                  );

                  finalEllipseMark.updatePixelRadii(radiusX, radiusY);
                  chartSeries.series.attachPrimitive(finalEllipseMark);
                  this.ellipseMarks.push(finalEllipseMark);
                  finalEllipseMark.setShowHandles(true);
                }
              }
            } catch (error) {
            }
          }


          if (this.previewEllipseMark) {
            chartSeries.series.detachPrimitive(this.previewEllipseMark);
            this.previewEllipseMark = null;
          }

          this.state = {
            ...this.state,
            isEllipseMarkMode: false,
            ellipseMarkStartPoint: null,
            currentEllipseMark: null,
            isDrawing: false
          };

          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      } else if (!this.state.isEllipseMarkMode && !existingMarkClicked) {

        this.ellipseMarks.forEach(m => m.setShowHandles(false));
      }
    } catch (error) {
      this.state = this.cancelEllipseMarkMode();
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


      if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
        const centerX = chart.timeScale().timeToCoordinate(this.state.dragTarget.getCenterTime());
        const centerY = chartSeries.series.priceToCoordinate(this.state.dragTarget.getCenterPrice());

        if (centerX === null || centerY === null) return;

        switch (this.state.dragPoint) {
          case 'ellipse':

            const deltaX = relativeX - this.dragStartData.x;
            const deltaY = relativeY - this.dragStartData.y;
            this.state.dragTarget.dragEllipseByPixels(deltaX, deltaY);
            this.dragStartData = {
              ...this.dragStartData,
              x: relativeX,
              y: relativeY
            };
            break;

          case 'center':

            const time = this.getValidTimeFromCoordinate(chart, relativeX);
            const price = chartSeries.series.coordinateToPrice(relativeY);
            if (time !== null && price !== null) {
              this.state.dragTarget.updateCenter(time, price);
            }
            break;

          case 'rotate':

            const newAngle = this.state.dragTarget.calculateRotationAngle(relativeX, relativeY);
            this.state.dragTarget.updateAngle(newAngle);
            break;

          case 'top':
          case 'bottom':
          case 'left':
          case 'right':

            this.handleControlPointDrag(relativeX, relativeY);
            break;
        }

        return;
      }


      if (this.state.isDrawing && this.previewEllipseMark && this.state.ellipseMarkStartPoint) {
        const centerTime = this.previewEllipseMark.getCenterTime();
        const centerPrice = this.previewEllipseMark.getCenterPrice();
        const centerX = chart.timeScale().timeToCoordinate(centerTime);
        const centerY = chartSeries.series.priceToCoordinate(centerPrice);

        if (centerX !== null && centerY !== null) {
          const radiusX = Math.abs(relativeX - centerX);
          const radiusY = Math.abs(relativeY - centerY);


          const deltaX = relativeX - centerX;
          const deltaY = relativeY - centerY;
          const angle = Math.atan2(deltaY, deltaX);

          this.previewEllipseMark.updatePixelRadii(radiusX, radiusY);
          this.previewEllipseMark.updateAngle(angle);
        }
      }


      if (!this.state.isEllipseMarkMode && !this.state.isDragging && !this.state.isDrawing) {
        let anyEllipseHovered = false;
        for (const mark of this.ellipseMarks) {
          const handleType = mark.isPointNearHandle(relativeX, relativeY);
          const isInEllipse = mark.isPointInEllipse(relativeX, relativeY);
          const shouldShow = !!handleType || isInEllipse;
          mark.setShowHandles(shouldShow);
          if (shouldShow) anyEllipseHovered = true;
        }
      }
    } catch (error) {
    }
  };


  private handleControlPointDrag(relativeX: number, relativeY: number): void {
    if (!this.state.dragTarget || !this.dragStartData) return;
    const { chartSeries, chart } = this.props;
    if (!chartSeries || !chart) return;
    const centerX = chart.timeScale().timeToCoordinate(this.state.dragTarget.getCenterTime());
    const centerY = chartSeries.series.priceToCoordinate(this.state.dragTarget.getCenterPrice());
    if (centerX === null || centerY === null) return;
    const angle = this.state.dragTarget.getAngle();
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    const deltaX = relativeX - centerX;
    const deltaY = relativeY - centerY;
    const localX = deltaX * cosAngle + deltaY * sinAngle;
    const localY = -deltaX * sinAngle + deltaY * cosAngle;
    let newRadiusX = this.dragStartData.initialRadiusX || 0;
    let newRadiusY = this.dragStartData.initialRadiusY || 0;
    switch (this.state.dragPoint) {
      case 'left':
      case 'right':
        newRadiusX = Math.max(Math.abs(localX), 10);
        break;
      case 'top':
      case 'bottom':
        newRadiusY = Math.max(Math.abs(localY), 10);
        break;
    }
    this.state.dragTarget.updatePixelRadii(newRadiusX, newRadiusY);
  }

  public handleMouseUp = (point: Point): EllipseMarkState => {
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
      this.dragStartData = null;
    }
    return this.state;
  };

  public handleKeyDown = (event: KeyboardEvent): EllipseMarkState => {
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
      } else if (this.state.isEllipseMarkMode || this.state.isDrawing) {
        return this.cancelEllipseMarkMode();
      }
    }
    return this.state;
  };

  public getState(): EllipseMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<EllipseMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewEllipseMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewEllipseMark);
      this.previewEllipseMark = null;
    }
    this.ellipseMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.ellipseMarks = [];
  }

  public getEllipseMarks(): EllipseMark[] {
    return [...this.ellipseMarks];
  }

  public removeEllipseMark(mark: EllipseMark): void {
    const index = this.ellipseMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.ellipseMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isEllipseMarkMode || this.state.isDrawing;
  }

  public onChartUpdate(): void {
    this.ellipseMarks.forEach(mark => {
      if (mark.forceUpdate) {
        mark.forceUpdate();
      }
    });

    if (this.previewEllipseMark && this.previewEllipseMark.forceUpdate) {
      this.previewEllipseMark.forceUpdate();
    }
  }
}