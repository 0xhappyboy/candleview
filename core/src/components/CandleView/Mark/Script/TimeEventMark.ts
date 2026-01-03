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
  id?: string;
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
  private _id: string;

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
    this._id = config.id || this.generateId();
  }

  private generateId(): string {
    return 'time-event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  public id(): string {
    return this._id;
  }

  public setId(id: string): void {
    this._id = id;
    this.requestUpdate();
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
    if (bubbleX === null) return null;
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return null;
    ctx.font = `${this._fontSize}px Arial`;
    const timeStr = this.getTimeString();
    const titleWidth = ctx.measureText(timeStr).width;
    const descWidth = this._description ? ctx.measureText(this._description).width : 0;
    const maxTextWidth = Math.max(titleWidth, descWidth);
    const bubbleWidth = maxTextWidth + this._padding * 2 + 20;
    const bubbleHeight = this._description ? this._fontSize * 2 + this._padding * 2 + 8 : this._fontSize + this._padding * 2;
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
          const timeStr = this.getTimeString();
          const timeWidth = ctx.measureText(timeStr).width;
          const descWidth = this._description ? ctx.measureText(this._description).width : 0;
          const maxTextWidth = Math.max(timeWidth, descWidth);
          const bubbleWidth = maxTextWidth + this._padding * 2 + 20;
          const bubbleHeight = this._description ? this._fontSize * 2 + this._padding * 2 + 8 : this._fontSize + this._padding * 2;
          const chartHeight = this._chart.chartElement()?.clientHeight || 0;
          const bottomY = chartHeight - this._bottomMargin;
          const bubbleY = bottomY - this._arrowHeight - bubbleHeight;
          ctx.fillStyle = this._color;
          ctx.beginPath();
          ctx.moveTo(bubbleX, bottomY);
          ctx.lineTo(bubbleX - this._arrowHeight, bottomY - this._arrowHeight);
          ctx.lineTo(bubbleX + this._arrowHeight, bottomY - this._arrowHeight);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = this._color;
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
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const textY = bubbleY + bubbleHeight / 2;
          if (this._description) {
            const timeY = textY - this._fontSize / 2;
            ctx.fillText(timeStr, bubbleX, timeY);
            ctx.font = `${this._fontSize - 2}px Arial`;
            ctx.fillStyle = '#666666';
            const descY = textY + this._fontSize / 2 + 4;
            ctx.fillText(this._description, bubbleX, descY);
          } else {
            ctx.fillText(timeStr, bubbleX, textY);
          }
          ctx.restore();
        }
      };
    }
    return [{ renderer: () => this._renderer }];
  }

  private getTimeString(): string {
    if (!this._chart) return 'No Chart';
    try {
      const timeScale = this._chart.timeScale();
      const timeScaleOptions = timeScale.options();
      if (timeScaleOptions && timeScaleOptions.timeFormatter && typeof timeScaleOptions.timeFormatter === 'function') {
        const formattedTime = timeScaleOptions.timeFormatter(this._time);
        if (formattedTime) return formattedTime;
      }
      if (timeScale.formatter && typeof timeScale.formatter === 'function') {
        const formattedTime = timeScale.formatter(this._time);
        if (formattedTime) return formattedTime;
      }
      let timezone = 'UTC';
      if (this._chart.options && this._chart.options.timeScale && this._chart.options.timeScale.timezone) {
        timezone = this._chart.options.timeScale.timezone;
      }
      return this.formatTimeWithTimezone(this._time, timezone);
    } catch (error) {
      return this.formatTimeWithTimezone(this._time, 'UTC');
    }
  }

  private formatTimeWithTimezone(timestamp: number, timezone: string): string {
    try {
      let date: Date;
      const secondsTimestamp = timestamp * 1000;
      date = new Date(secondsTimestamp);
      if (isNaN(date.getTime())) {
        date = new Date(timestamp);
      }
      if (isNaN(date.getTime())) {
        return timestamp.toString();
      }
      let timezoneStr = 'UTC';
      if (timezone && timezone !== '') {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: timezone });
          timezoneStr = timezone;
        } catch (e) {
          timezoneStr = 'UTC';
        }
      }
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezoneStr,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('zh-CN', options);
      const formattedParts = formatter.formatToParts(date);
      const parts: Record<string, string> = {};
      formattedParts.forEach(part => {
        parts[part.type] = part.value;
      });
      const year = parts.year || date.getFullYear().toString();
      const month = parts.month || String(date.getMonth() + 1).padStart(2, '0');
      const day = parts.day || String(date.getDate()).padStart(2, '0');
      const hour = parts.hour || String(date.getHours()).padStart(2, '0');
      const minute = parts.minute || String(date.getMinutes()).padStart(2, '0');
      const second = parts.second || String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    } catch (error) {
      return this.formatSimpleUTCTime(timestamp);
    }
  }

  private formatSimpleUTCTime(timestamp: number): string {
    try {
      let date: Date;
      const secondsTimestamp = timestamp * 1000;
      date = new Date(secondsTimestamp);
      if (isNaN(date.getTime())) {
        date = new Date(timestamp);
      }
      if (isNaN(date.getTime())) {
        return timestamp.toString();
      }
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return timestamp.toString();
    }
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