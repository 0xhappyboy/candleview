import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export interface TimeEventConfig {
  time: number;
  title?: string;
  description?: string;
  color?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: number;
  arrowHeight?: number;
  borderRadius?: number;
  isPreview?: boolean;
}

export class TimeEventMark implements IGraph, IMarkStyle {
  private _chart: any;
  private _series: any;
  private _time: number;
  private _title: string;
  private _description: string;
  private _color: string;
  private _backgroundColor: string;
  private _textColor: string;
  private _fontSize: number;
  private _padding: number;
  private _arrowHeight: number;
  private _borderRadius: number;
  private _isPreview: boolean;
  private _renderer: any;
  private _showHandles: boolean = false;
  private _isDragging: boolean = false;
  private markType: MarkType = MarkType.TimeEvent;
  private _bottomMargin: number = 28;

  constructor(config: TimeEventConfig) {
    this._time = config.time;
    this._title = config.title || 'Event';
    this._description = config.description || '';
    this._color = config.color || '#2962FF';
    this._backgroundColor = config.backgroundColor || '#FFFFFF';
    this._textColor = config.textColor || '#333333';
    this._fontSize = config.fontSize || 12;
    this._padding = config.padding || 8;
    this._arrowHeight = config.arrowHeight || 6;
    this._borderRadius = config.borderRadius || 4;
    this._isPreview = config.isPreview || false;
  }

  getMarkType(): MarkType {
    return this.markType;
  }

  attached(param: any) {
    this._chart = param.chart;
    this._series = param.series;
    this.requestUpdate();
  }

  updateAllViews() { }

  updateTime(time: number) {
    this._time = time;
    this.requestUpdate();
  }

  updateTitle(title: string) {
    this._title = title;
    this.requestUpdate();
  }

  updateDescription(description: string) {
    this._description = description;
    this.requestUpdate();
  }

  setPreviewMode(isPreview: boolean) {
    this._isPreview = isPreview;
    this.requestUpdate();
  }

  setDragging(isDragging: boolean) {
    this._isDragging = isDragging;
    this.requestUpdate();
  }

  setShowHandles(show: boolean) {
    this._showHandles = show;
    this.requestUpdate();
  }

  setBottomMargin(margin: number) {
    this._bottomMargin = margin;
    this.requestUpdate();
  }

  isPointNear(x: number, y: number, threshold: number = 15): boolean {
    if (!this._chart) return false;
    const bubbleBounds = this.getBubbleBounds();
    if (!bubbleBounds) return false;
    const { minX, maxX, minY, maxY } = bubbleBounds;
    return x >= minX - threshold &&
      x <= maxX + threshold &&
      y >= minY - threshold &&
      y <= maxY + threshold;
  }

  dragByPixels(deltaX: number) {
    if (isNaN(deltaX) || !this._chart) return;
    const timeScale = this._chart.timeScale();
    const currentX = timeScale.timeToCoordinate(this._time);
    if (currentX === null) return;
    const newX = currentX + deltaX;
    const newTime = timeScale.coordinateToTime(newX);
    if (newTime !== null) {
      this._time = newTime;
      this.requestUpdate();
    }
  }

  private requestUpdate() {
    if (this._chart && this._series) {
      try {
        this._chart.timeScale().applyOptions({});
      } catch (error) {
      }
      if (this._series._internal__dataChanged) {
        this._series._internal__dataChanged();
      }
      if (this._chart._internal__paneUpdate) {
        this._chart._internal__paneUpdate();
      }
    }
  }

  time() {
    return this._time;
  }

  priceValue() {
    return 0;
  }

  getBubbleBounds() {
    if (!this._chart) return null;
    const timeScale = this._chart.timeScale();
    const bubbleX = timeScale.timeToCoordinate(this._time);
    const bubbleHeight = 60;
    if (bubbleX === null) return null;
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return null;
    ctx.font = `${this._fontSize}px Arial`;
    const titleWidth = ctx.measureText(this._title).width;
    const descWidth = this._description ? ctx.measureText(this._description).width : 0;
    const maxTextWidth = Math.max(titleWidth, descWidth);
    const bubbleWidth = maxTextWidth + this._padding * 2;
    const chartHeight = this._chart.chartElement()?.clientHeight || 0;
    const bottomY = chartHeight - this._bottomMargin;
    const bubbleY = bottomY - this._arrowHeight - bubbleHeight;
    return {
      x: bubbleX,
      y: bubbleY,
      width: bubbleWidth,
      height: bubbleHeight,
      minX: bubbleX - bubbleWidth / 2,
      maxX: bubbleX + bubbleWidth / 2,
      minY: bubbleY,
      maxY: bottomY
    };
  }

  paneViews() {
    if (!this._renderer) {
      this._renderer = {
        draw: (target: any) => {
          const ctx = target.context ?? target._context;
          if (!ctx || !this._chart) return;
          const timeScale = this._chart.timeScale();
          const bubbleX = timeScale.timeToCoordinate(this._time);
          if (bubbleX === null) return;
          ctx.save();
          ctx.font = `${this._fontSize}px Arial`;
          const titleWidth = ctx.measureText(this._title).width;
          const descWidth = this._description ? ctx.measureText(this._description).width : 0;
          const maxTextWidth = Math.max(titleWidth, descWidth);
          const bubbleWidth = maxTextWidth + this._padding * 2;
          const bubbleHeight = 60;
          const chartHeight = this._chart.chartElement()?.clientHeight || 0;
          const bottomY = chartHeight - this._bottomMargin;
          ctx.fillStyle = this._color;
          ctx.beginPath();
          ctx.moveTo(bubbleX, bottomY);
          ctx.lineTo(bubbleX - this._arrowHeight, bottomY - this._arrowHeight);
          ctx.lineTo(bubbleX + this._arrowHeight, bottomY - this._arrowHeight);
          ctx.closePath();
          ctx.fill();
          const bubbleY = bottomY - this._arrowHeight - bubbleHeight;
          ctx.fillStyle = this._backgroundColor;
          ctx.strokeStyle = this._color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(
            bubbleX - bubbleWidth / 2,
            bubbleY,
            bubbleWidth,
            bubbleHeight,
            this._borderRadius
          );
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = this._textColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(this._title, bubbleX, bubbleY + this._padding);
          if (this._description) {
            ctx.font = `${this._fontSize - 2}px Arial`;
            ctx.fillStyle = '#666666';
            ctx.fillText(this._description, bubbleX, bubbleY + this._padding + this._fontSize + 4);
          }
          if (this._isPreview || this._isDragging) {
            ctx.strokeStyle = this._color;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.strokeRect(
              bubbleX - bubbleWidth / 2,
              bubbleY,
              bubbleWidth,
              bubbleHeight
            );
          }
          if (this._showHandles && !this._isPreview) {
            const handleY = bottomY - this._arrowHeight - bubbleHeight / 2;
            ctx.fillStyle = this._color;
            ctx.beginPath();
            ctx.arc(bubbleX, handleY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(bubbleX, handleY, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      };
    }
    return [{ renderer: () => this._renderer }];
  }

  updateColor(color: string) {
    this._color = color;
    this.requestUpdate();
  }

  updateBackgroundColor(backgroundColor: string) {
    this._backgroundColor = backgroundColor;
    this.requestUpdate();
  }

  updateTextColor(textColor: string) {
    this._textColor = textColor;
    this.requestUpdate();
  }

  updateFontSize(fontSize: number) {
    this._fontSize = fontSize;
    this.requestUpdate();
  }

  updateStyles(styles: {
    color?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    padding?: number;
    arrowHeight?: number;
    borderRadius?: number;
    bottomMargin?: number;
    [key: string]: any;
  }): void {
    if (styles.color) this.updateColor(styles.color);
    if (styles.backgroundColor) this.updateBackgroundColor(styles.backgroundColor);
    if (styles.textColor) this.updateTextColor(styles.textColor);
    if (styles.fontSize) this.updateFontSize(styles.fontSize);
    if (styles.padding) this._padding = styles.padding;
    if (styles.arrowHeight) this._arrowHeight = styles.arrowHeight;
    if (styles.borderRadius) this._borderRadius = styles.borderRadius;
    if (styles.bottomMargin !== undefined) this._bottomMargin = styles.bottomMargin;
    this.requestUpdate();
  }

  getCurrentStyles(): Record<string, any> {
    return {
      color: this._color,
      backgroundColor: this._backgroundColor,
      textColor: this._textColor,
      fontSize: this._fontSize,
      padding: this._padding,
      arrowHeight: this._arrowHeight,
      borderRadius: this._borderRadius,
      bottomMargin: this._bottomMargin
    };
  }
}