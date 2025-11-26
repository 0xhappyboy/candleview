import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { MockKLineMark } from "../../Mark/Mock/MockKLineMark";
import { Point } from "../../types";

export interface MockKLineMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface MockKLineMarkState {
  isMockKLineMarkMode: boolean;
  mockKLineMarkStartPoint: Point | null;
  currentMockKLineMark: MockKLineMark | null;
  isDragging: boolean;
  dragTarget: MockKLineMark | null;
  dragPoint: 'start' | 'end' | 'line' | null;
}

export class MockKLineMarkManager implements IMarkManager<MockKLineMark> {
  private props: MockKLineMarkManagerProps;
  private state: MockKLineMarkState;
  private previewMockKLineMark: MockKLineMark | null = null;
  private mockKLineMarks: MockKLineMark[] = [];
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: MockKLineMarkManagerProps) {
    this.props = props;
    this.state = {
      isMockKLineMarkMode: false,
      mockKLineMarkStartPoint: null,
      currentMockKLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public clearState(): void {
    this.state = {
      isMockKLineMarkMode: false,
      mockKLineMarkStartPoint: null,
      currentMockKLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
  }

  public getMarkAtPoint(point: Point): MockKLineMark | null {
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
      for (const mark of this.mockKLineMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.mockKLineMarks) {
        const bounds = mark.getBounds();
        if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
          return mark;
        }
      }
    } catch (error) {
    }
    return null;
  }

  public getCurrentDragTarget(): MockKLineMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): MockKLineMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewMockKLineMark) {
      return this.previewMockKLineMark;
    }
    if (this.state.isMockKLineMarkMode && this.state.currentMockKLineMark) {
      return this.state.currentMockKLineMark;
    }
    return null;
  }

  public getAllMarks(): MockKLineMark[] {
    return [...this.mockKLineMarks];
  }

  public cancelOperationMode() {
    return this.cancelMockKLineMarkMode();
  }

  public setMockKLineMarkMode = (): MockKLineMarkState => {
    this.state = {
      ...this.state,
      isMockKLineMarkMode: true,
      mockKLineMarkStartPoint: null,
      currentMockKLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    return this.state;
  };

  public cancelMockKLineMarkMode = (): MockKLineMarkState => {
    if (this.previewMockKLineMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMockKLineMark);
      this.previewMockKLineMark = null;
    }
    this.mockKLineMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isMockKLineMarkMode: false,
      mockKLineMarkStartPoint: null,
      currentMockKLineMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): MockKLineMarkState => {
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
      for (const mark of this.mockKLineMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          if (!this.state.isMockKLineMarkMode) {
            this.state = {
              ...this.state,
              isMockKLineMarkMode: true,
              isDragging: false,
              dragTarget: mark,
              dragPoint: handleType
            };
            this.mockKLineMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            this.isOperating = true;
          } else {
            if (this.state.dragPoint === 'start') {
              mark.updateStartPoint(time, price);
            } else if (this.state.dragPoint === 'end') {
              mark.updateEndPoint(time, price);
            }
            this.state = {
              ...this.state,
              isMockKLineMarkMode: false,
              isDragging: false,
              dragTarget: null,
              dragPoint: null
            };
            this.isOperating = false;
            this.mockKLineMarks.forEach(m => m.setShowHandles(false));
            if (this.props.onCloseDrawing) {
              this.props.onCloseDrawing();
            }
          }
          return this.state;
        }
      }

      for (const mark of this.mockKLineMarks) {
        const bounds = mark.getBounds();
        if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
          this.state = {
            ...this.state,
            isDragging: true,
            dragTarget: mark,
            dragPoint: 'line'
          };
          mark.setDragging(true, 'line');
          this.mockKLineMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          return this.state;
        }
      }

      if (this.state.isMockKLineMarkMode && !this.state.isDragging) {
        if (!this.state.mockKLineMarkStartPoint) {
          this.state = {
            ...this.state,
            mockKLineMarkStartPoint: point
          };
          this.previewMockKLineMark = new MockKLineMark(
            time,
            price,
            time,
            price,
            '#2962FF',
            2,
            false
          );
          chartSeries.series.attachPrimitive(this.previewMockKLineMark);
          this.mockKLineMarks.forEach(m => m.setShowHandles(false));
          this.previewMockKLineMark.setShowHandles(true);
        } else {
          if (this.previewMockKLineMark) {
            chartSeries.series.detachPrimitive(this.previewMockKLineMark);
            const finalMockKLineMark = new MockKLineMark(
              this.previewMockKLineMark.getStartTime(),
              this.previewMockKLineMark.getStartPrice(),
              time,
              price,
              '#2962FF',
              2,
              false
            );
            chartSeries.series.attachPrimitive(finalMockKLineMark);
            this.mockKLineMarks.push(finalMockKLineMark);
            this.previewMockKLineMark = null;
            finalMockKLineMark.setShowHandles(true);
          }
          this.state = {
            ...this.state,
            isMockKLineMarkMode: false,
            mockKLineMarkStartPoint: null,
            currentMockKLineMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
    } catch (error) {
      this.state = this.cancelMockKLineMarkMode();
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

      if (this.state.isDragging && this.state.dragTarget && this.dragStartData && this.state.dragPoint === 'line') {
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
        return;
      }
      if (this.state.isMockKLineMarkMode && this.state.dragTarget && this.state.dragPoint &&
        (this.state.dragPoint === 'start' || this.state.dragPoint === 'end')) {
        if (this.state.dragPoint === 'start') {
          this.state.dragTarget.updateStartPoint(time, price);
        } else if (this.state.dragPoint === 'end') {
          this.state.dragTarget.updateEndPoint(time, price);
        }
      }
      if (!this.state.isDragging) {
        if (this.state.mockKLineMarkStartPoint && this.previewMockKLineMark && !this.state.dragTarget) {
          this.previewMockKLineMark.updateEndPoint(time, price);
        }
        if (!this.state.isMockKLineMarkMode && !this.state.isDragging && !this.state.mockKLineMarkStartPoint) {
          let anyLineHovered = false;
          for (const mark of this.mockKLineMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            const isNearLine = this.isPointNearLine(relativeX, relativeY, mark.getBounds());
            const shouldShow = !!handleType || isNearLine;
            mark.setShowHandles(shouldShow);
            if (shouldShow) anyLineHovered = true;
          }
        }
      }
    } catch (error) {
    }
  };

  public handleMouseUp = (point: Point): MockKLineMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end') {
        this.state = {
          ...this.state,
          isMockKLineMarkMode: false,
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

  public handleKeyDown = (event: KeyboardEvent): MockKLineMarkState => {
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
      } else if (this.state.isMockKLineMarkMode) {
        return this.cancelMockKLineMarkMode();
      }
    }
    return this.state;
  };

  public getState(): MockKLineMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<MockKLineMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewMockKLineMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewMockKLineMark);
      this.previewMockKLineMark = null;
    }

    this.mockKLineMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.mockKLineMarks = [];
  }

  public getMockKLineMarks(): MockKLineMark[] {
    return [...this.mockKLineMarks];
  }

  public removeMockKLineMark(mark: MockKLineMark): void {
    const index = this.mockKLineMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.mockKLineMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isMockKLineMarkMode;
  }
}