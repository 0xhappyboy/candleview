import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { TimeEventConfig, TimeEventMark } from "../../Mark/Script/TimeEventMark";
import { Point } from "../../types";

export interface TimeEventMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
  defaultConfig?: Partial<TimeEventConfig>;
}

export interface TimeEventMarkState {
  isTimeEventMode: boolean;
  isDragging: boolean;
  dragTarget: TimeEventMark | null;
  previewMark: TimeEventMark | null;
}

export class TimeEventMarkManager implements IMarkManager<TimeEventMark> {
  private props: TimeEventMarkManagerProps;
  private state: TimeEventMarkState;
  private timeEventMarks: TimeEventMark[] = [];
  private dragStartData: { time: number; coordinate: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: TimeEventMarkManagerProps) {
    this.props = props;
    this.state = {
      isTimeEventMode: false,
      isDragging: false,
      dragTarget: null,
      previewMark: null
    };
  }

  public clearState(): void {
    this.state = {
      isTimeEventMode: false,
      isDragging: false,
      dragTarget: null,
      previewMark: null
    };
  }

  public getMarkAtPoint(point: Point): TimeEventMark | null {
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
      for (const mark of this.timeEventMarks) {
        if (mark.isPointNear(relativeX, relativeY)) {
          return mark;
        }
      }
    } catch (error) {
    }
    return null;
  }

  public getCurrentDragTarget(): TimeEventMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragTarget ? 'bubble' : null;
  }

  public getCurrentOperatingMark(): TimeEventMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.state.previewMark) {
      return this.state.previewMark;
    }
    return null;
  }

  public getAllMarks(): TimeEventMark[] {
    return [...this.timeEventMarks];
  }

  public cancelOperationMode() {
    return this.cancelTimeEventMode();
  }

  public setTimeEventMode = (): TimeEventMarkState => {
    this.state = {
      ...this.state,
      isTimeEventMode: true,
      previewMark: null
    };
    return this.state;
  };

  public cancelTimeEventMode = (): TimeEventMarkState => {
    if (this.state.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.state.previewMark);
    }
    this.timeEventMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      isTimeEventMode: false,
      isDragging: false,
      dragTarget: null,
      previewMark: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): TimeEventMarkState => {
    const { chartSeries, chart, containerRef, defaultConfig } = this.props;
    if (!chartSeries || !chart) return this.state;
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
      if (time === null) return this.state;
      const clickedMark = this.getMarkAtPoint(point);
      if (clickedMark) {
        this.state = {
          ...this.state,
          isDragging: true,
          dragTarget: clickedMark,
          isTimeEventMode: false
        };
        this.timeEventMarks.forEach(m => {
          m.setShowHandles(m === clickedMark);
        });
        this.dragStartData = { time, coordinate: relativeX };
        this.isOperating = true;
        clickedMark.setDragging(true);
        return this.state;
      }
      if (this.state.isTimeEventMode) {
        if (!this.state.previewMark) {
          const defaultTitle = defaultConfig?.title || 'Event';
          const config: TimeEventConfig = {
            time,
            title: defaultTitle,
            description: defaultConfig?.description || '',
            color: defaultConfig?.color || '#2962FF',
            backgroundColor: defaultConfig?.backgroundColor || '#FFFFFF',
            textColor: defaultConfig?.textColor || '#333333',
            fontSize: defaultConfig?.fontSize || 12,
            padding: defaultConfig?.padding || 8,
            arrowHeight: defaultConfig?.arrowHeight || 6,
            borderRadius: defaultConfig?.borderRadius || 4,
            isPreview: true
          };
          const previewMark = new TimeEventMark(config);
          chartSeries.series.attachPrimitive(previewMark);
          this.state = {
            ...this.state,
            previewMark
          };
          this.timeEventMarks.forEach(m => m.setShowHandles(false));
          previewMark.setShowHandles(true);
        } 
        else {
          const finalMark = this.state.previewMark;
          finalMark.setPreviewMode(false);
          finalMark.setShowHandles(true);
          this.timeEventMarks.push(finalMark);
          this.state = {
            ...this.state,
            isTimeEventMode: false,
            previewMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      }
      else {
        this.timeEventMarks.forEach(m => m.setShowHandles(false));
      }
    } catch (error) {
      this.state = this.cancelTimeEventMode();
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
      const timeScale = chart.timeScale();
      const time = timeScale.coordinateToTime(relativeX);
      if (time === null) return;
      if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
        const deltaX = relativeX - this.dragStartData.coordinate;
        this.state.dragTarget.dragByPixels(deltaX);
        this.dragStartData = { time, coordinate: relativeX };
        return;
      }
      if (this.state.previewMark && this.state.isTimeEventMode) {
        this.state.previewMark.updateTime(time);
      }
      if (!this.state.isTimeEventMode && !this.state.isDragging) {
        const hoveredMark = this.getMarkAtPoint(point);
        this.timeEventMarks.forEach(mark => {
          mark.setShowHandles(mark === hoveredMark);
        });
      }
    } catch (error) {
    }
  };

  public handleMouseUp = (point: Point): TimeEventMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false);
      }
      this.state = {
        ...this.state,
        isDragging: false,
        dragTarget: null
      };
      this.isOperating = false;
    }
    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): TimeEventMarkState => {
    if (event.key === 'Escape') {
      if (this.state.isDragging) {
        if (this.state.dragTarget) {
          this.state.dragTarget.setDragging(false);
        }
        this.state = {
          ...this.state,
          isDragging: false,
          dragTarget: null
        };
      } else if (this.state.isTimeEventMode) {
        return this.cancelTimeEventMode();
      }
    }
    return this.state;
  };

  public getState(): TimeEventMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<TimeEventMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.state.previewMark) {
      this.props.chartSeries?.series.detachPrimitive(this.state.previewMark);
    }
    this.timeEventMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.timeEventMarks = [];
  }

  public getTimeEventMarks(): TimeEventMark[] {
    return [...this.timeEventMarks];
  }

  public removeTimeEventMark(mark: TimeEventMark): void {
    const index = this.timeEventMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.timeEventMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isTimeEventMode;
  }

  private hiddenMarks: TimeEventMark[] = [];

  public hideAllMarks(): void {
    this.hiddenMarks.push(...this.timeEventMarks);
    this.timeEventMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.timeEventMarks = [];
  }

  public showAllMarks(): void {
    this.timeEventMarks.push(...this.hiddenMarks);
    this.hiddenMarks.forEach(mark => {
      this.props.chartSeries?.series.attachPrimitive(mark);
    });
    this.hiddenMarks = [];
  }

  public hideMark(mark: TimeEventMark): void {
    const index = this.timeEventMarks.indexOf(mark);
    if (index > -1) {
      this.timeEventMarks.splice(index, 1);
      this.hiddenMarks.push(mark);
      this.props.chartSeries?.series.detachPrimitive(mark);
    }
  }

  public showMark(mark: TimeEventMark): void {
    const index = this.hiddenMarks.indexOf(mark);
    if (index > -1) {
      this.hiddenMarks.splice(index, 1);
      this.timeEventMarks.push(mark);
      this.props.chartSeries?.series.attachPrimitive(mark);
    }
  }
}