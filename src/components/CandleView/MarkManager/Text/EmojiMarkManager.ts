import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { EmojiMark } from "../../Mark/Text/EmojiMark";
import { Point } from "../../types";

export interface EmojiMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
}

export interface EmojiMarkState {
  isEmojiMarkMode: boolean;
  emojiMarkStartPoint: Point | null;
  currentEmojiMark: EmojiMark | null;
  isDragging: boolean;
  dragTarget: EmojiMark | null;
  dragPoint: 'start' | 'end' | 'line' | null;
  selectedEmoji: string | undefined;
}

export class EmojiMarkManager implements IMarkManager<EmojiMark> {
  private props: EmojiMarkManagerProps;
  private state: EmojiMarkState;
  private previewEmojiMark: EmojiMark | null = null;
  private emojiMarks: EmojiMark[] = [];
  private dragStartData: { time: number; price: number } | null = null;
  private isOperating: boolean = false;

  constructor(props: EmojiMarkManagerProps) {
    this.props = props;
    this.state = {
      isEmojiMarkMode: false,
      emojiMarkStartPoint: null,
      currentEmojiMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      selectedEmoji: undefined,
    };
  }

  public clearState(): void {
    this.state = {
      isEmojiMarkMode: false,
      emojiMarkStartPoint: null,
      currentEmojiMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      selectedEmoji: undefined,
    };
  }

  public getMarkAtPoint(point: Point): EmojiMark | null {
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

      for (const mark of this.emojiMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          return mark;
        }
      }
      for (const mark of this.emojiMarks) {
        const isInRectangle = mark.isPointInRectangle(relativeX, relativeY);
        if (isInRectangle) {
          return mark;
        }
      }
    } catch (error) {
    }
    return null;
  }

  public getCurrentDragTarget(): EmojiMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragPoint;
  }

  public getCurrentOperatingMark(): EmojiMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.previewEmojiMark) {
      return this.previewEmojiMark;
    }
    if (this.state.isEmojiMarkMode && this.state.currentEmojiMark) {
      return this.state.currentEmojiMark;
    }
    return null;
  }

  public getAllMarks(): EmojiMark[] {
    return [...this.emojiMarks];
  }

  public cancelOperationMode() {
    return this.cancelEmojiMarkMode();
  }

  public setEmojiMarkMode = (emoji: string): EmojiMarkState => {
    this.state = {
      ...this.state,
      isEmojiMarkMode: true,
      emojiMarkStartPoint: null,
      currentEmojiMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null,
      selectedEmoji: emoji
    };
    return this.state;
  };

  public cancelEmojiMarkMode = (): EmojiMarkState => {
    if (this.previewEmojiMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewEmojiMark);
      this.previewEmojiMark = null;
    }
    this.emojiMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      ...this.state,
      isEmojiMarkMode: false,
      emojiMarkStartPoint: null,
      currentEmojiMark: null,
      isDragging: false,
      dragTarget: null,
      dragPoint: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): EmojiMarkState => {
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
      let foundMark = false;
      for (const mark of this.emojiMarks) {
        const handleType = mark.isPointNearHandle(relativeX, relativeY);
        if (handleType) {
          this.state = {
            ...this.state,
            isEmojiMarkMode: true,
            isDragging: true,
            dragTarget: mark,
            dragPoint: handleType
          };
          this.emojiMarks.forEach(m => {
            m.setShowHandles(m === mark);
          });
          this.isOperating = true;
          foundMark = true;
          break;
        }
      }
      if (!foundMark) {
        for (const mark of this.emojiMarks) {
          const isInRectangle = mark.isPointInRectangle(relativeX, relativeY);
          if (isInRectangle) {
            this.state = {
              ...this.state,
              isDragging: true,
              dragTarget: mark,
              dragPoint: 'line'
            };
            mark.setDragging(true, 'line');
            this.emojiMarks.forEach(m => {
              m.setShowHandles(m === mark);
            });
            this.isOperating = true;
            foundMark = true;
            break;
          }
        }
      }
      if (!foundMark && this.state.isEmojiMarkMode) {
        const defaultWidth = 40;
        const defaultHeight = 40;

        const endTimeCoord = timeScale.timeToCoordinate(time) + defaultWidth;
        const endTime = timeScale.coordinateToTime(endTimeCoord);
        const endPriceCoord = chartSeries.series.priceToCoordinate(price) + defaultHeight;
        const endPrice = chartSeries.series.coordinateToPrice(endPriceCoord);

        if (endTime === null || endPrice === null) return this.state;

        const newEmojiMark = new EmojiMark(
          time, 
          price,
          endTime, 
          endPrice,
          this.state.selectedEmoji || '😊',
          '#2962FF',
          2,
          'rgba(41, 98, 255, 0.1)',
          24,
          false
        );
        chartSeries.series.attachPrimitive(newEmojiMark);
        this.emojiMarks.push(newEmojiMark);
        newEmojiMark.setShowHandles(true);

        this.state = {
          ...this.state,
          isEmojiMarkMode: false,
          emojiMarkStartPoint: null,
          currentEmojiMark: null,
          isDragging: false,
          dragTarget: null,
          dragPoint: null
        };
        this.isOperating = false;
        if (this.props.onCloseDrawing) {
          this.props.onCloseDrawing();
        }
      }
    } catch (error) {
      this.state = this.cancelEmojiMarkMode();
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
      if (this.state.isEmojiMarkMode && this.state.dragTarget && this.state.dragPoint &&
        (this.state.dragPoint === 'start' || this.state.dragPoint === 'end')) {
        if (this.state.dragPoint === 'start') {
          this.state.dragTarget.updateStartPoint(time, price);
        } else if (this.state.dragPoint === 'end') {
          this.state.dragTarget.updateEndPoint(time, price);
        }
      }
      if (!this.state.isDragging && !this.state.isEmojiMarkMode) {
        let anyEmojiHovered = false;
        for (const mark of this.emojiMarks) {
          const handleType = mark.isPointNearHandle(relativeX, relativeY);
          const isInRectangle = mark.isPointInRectangle(relativeX, relativeY);
          const shouldShow = !!handleType || isInRectangle;
          mark.setShowHandles(shouldShow);
          if (shouldShow) anyEmojiHovered = true;
        }
      }
    } catch (error) {
    }
  };

  public handleMouseUp = (point: Point): EmojiMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false, null);
      }
      if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end') {
        this.state = {
          ...this.state,
          isEmojiMarkMode: false,
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

  public handleKeyDown = (event: KeyboardEvent): EmojiMarkState => {
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
      } else if (this.state.isEmojiMarkMode) {
        return this.cancelEmojiMarkMode();
      } else {
        
        this.emojiMarks.forEach(mark => {
          
        });
      }
    }
    return this.state;
  };

  public getState(): EmojiMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<EmojiMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.previewEmojiMark) {
      this.props.chartSeries?.series.detachPrimitive(this.previewEmojiMark);
      this.previewEmojiMark = null;
    }

    this.emojiMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.emojiMarks = [];
  }

  public getEmojiMarks(): EmojiMark[] {
    return [...this.emojiMarks];
  }

  public removeEmojiMark(mark: EmojiMark): void {
    const index = this.emojiMarks.indexOf(mark);
    if (index > -1) {
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.emojiMarks.splice(index, 1);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isEmojiMarkMode;
  }
}