import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class PriceNoteMark implements IGraph, IMarkStyle {
  private _chart: any;
  private _series: any;
  private _startTime: number;
  private _startPrice: number;
  private _endTime: number;
  private _endPrice: number;
  private _renderer: any;
  private _color: string;
  private _lineWidth: number;
  private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
  private _isPreview: boolean;
  private _isDragging: boolean = false;
  private _dragPoint: 'start' | 'end' | 'line' | null = null;
  private _showHandles: boolean = false;
  private _showPriceNote: boolean = true;
  private _priceNoteBackground: string = '#FFFFFF';
  private _priceNoteTextColor: string = '#333333';
  private _priceNoteFont: string = '12px Arial';
  private markType: MarkType = MarkType.PriceNote;
  private _isItalic: boolean = false;
  private _isBold: boolean = false;
  private _graphColor: string;
  private _graphLineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
  private _graphLineWidth: number;

  constructor(
    startTime: number,
    startPrice: number,
    endTime: number,
    endPrice: number,
    color: string = '#2962FF',
    lineWidth: number = 2,
    isPreview: boolean = false
  ) {
    this._startTime = startTime;
    this._startPrice = startPrice;
    this._endTime = endTime;
    this._endPrice = endPrice;
    this._color = color;
    this._lineWidth = lineWidth;
    this._isPreview = isPreview;
    this._graphColor = color;
    this._graphLineStyle = 'solid';
    this._graphLineWidth = lineWidth;
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

  updateEndPoint(endTime: number, endPrice: number) {
    this._endTime = endTime;
    this._endPrice = endPrice;
    this.requestUpdate();
  }

  updateStartPoint(startTime: number, startPrice: number) {
    this._startTime = startTime;
    this._startPrice = startPrice;
    this.requestUpdate();
  }

  setPreviewMode(isPreview: boolean) {
    this._isPreview = isPreview;
    this.requestUpdate();
  }

  setDragging(isDragging: boolean, dragPoint: 'start' | 'end' | 'line' | null = null) {
    this._isDragging = isDragging;
    this._dragPoint = dragPoint;
    this.requestUpdate();
  }

  setShowHandles(show: boolean) {
    this._showHandles = show;
    this.requestUpdate();
  }

  setShowPriceNote(show: boolean) {
    this._showPriceNote = show;
    this.requestUpdate();
  }

  dragLineByPixels(deltaX: number, deltaY: number) {
    if (isNaN(deltaX) || isNaN(deltaY)) {
      return;
    }
    if (!this._chart || !this._series) return;
    const timeScale = this._chart.timeScale();
    const startX = timeScale.timeToCoordinate(this._startTime);
    const startY = this._series.priceToCoordinate(this._startPrice);
    const endX = timeScale.timeToCoordinate(this._endTime);
    const endY = this._series.priceToCoordinate(this._endPrice);
    if (startX === null || startY === null || endX === null || endY === null) return;
    const newStartX = startX + deltaX;
    const newStartY = startY + deltaY;
    const newEndX = endX + deltaX;
    const newEndY = endY + deltaY;
    const newStartTime = timeScale.coordinateToTime(newStartX);
    const newStartPrice = this._series.coordinateToPrice(newStartY);
    const newEndTime = timeScale.coordinateToTime(newEndX);
    const newEndPrice = this._series.coordinateToPrice(newEndY);
    if (newStartTime !== null && !isNaN(newStartPrice) && newEndTime !== null && !isNaN(newEndPrice)) {
      this._startTime = newStartTime;
      this._startPrice = newStartPrice;
      this._endTime = newEndTime;
      this._endPrice = newEndPrice;
      this.requestUpdate();
    }
  }

  dragLine(deltaTime: number, deltaPrice: number) {
    if (isNaN(deltaTime) || isNaN(deltaPrice)) {
      return;
    }
    this._startTime = this._startTime + deltaTime;
    this._startPrice = this._startPrice + deltaPrice;
    this._endTime = this._endTime + deltaTime;
    this._endPrice = this._endPrice + deltaPrice;
    this.requestUpdate();
  }

  isPointNearHandle(x: number, y: number, threshold: number = 15): 'start' | 'end' | null {
    if (!this._chart || !this._series) return null;
    const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
    const startY = this._series.priceToCoordinate(this._startPrice);
    const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
    const endY = this._series.priceToCoordinate(this._endPrice);
    if (startX == null || startY == null || endX == null || endY == null) return null;
    const distToStart = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
    if (distToStart <= threshold) {
      return 'start';
    }
    const distToEnd = Math.sqrt(Math.pow(x - endX, 2) + Math.pow(y - endY, 2));
    if (distToEnd <= threshold) {
      return 'end';
    }
    return null;
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
    return this._startTime;
  }

  priceValue() {
    return this._startPrice;
  }

  paneViews() {
    if (!this._renderer) {
      this._renderer = {
        draw: (target: any) => {
          const ctx = target.context ?? target._context;
          if (!ctx || !this._chart || !this._series) return;
          const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
          const startY = this._series.priceToCoordinate(this._startPrice);
          const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
          const endY = this._series.priceToCoordinate(this._endPrice);
          if (startX == null || startY == null || endX == null || endY == null) return;
          ctx.save();
          ctx.strokeStyle = this._graphColor;
          ctx.lineWidth = this._graphLineWidth;
          ctx.lineCap = 'round';
          ctx.globalAlpha = (this._isPreview || this._isDragging) ? 0.7 : 1.0;
          if (this._isPreview || this._isDragging) {
            ctx.setLineDash([5, 3]);
          } else {
            ctx.setLineDash(this._getLineDashPattern(this._graphLineStyle));
          }
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          if ((this._showHandles || this._isDragging) && !this._isPreview) {
            this._drawHandles(ctx, startX, startY, endX, endY);
          }
          if (this._showPriceNote && !this._isPreview) {
            this._drawPriceNote(ctx, endX, endY);
          }
          ctx.restore();
        },
      };
    }
    return [{ renderer: () => this._renderer }];
  }

  private _drawHandles(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
    const drawHandle = (x: number, y: number, isActive: boolean = false) => {
      ctx.save();
      ctx.fillStyle = this._graphColor;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      if (isActive) {
        ctx.strokeStyle = this._graphColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    };
    drawHandle(startX, startY, this._dragPoint === 'start');
    drawHandle(endX, endY, this._dragPoint === 'end');
  }

  private _drawPriceNote(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const priceText = this._startPrice.toFixed(2);
    ctx.save();
    ctx.font = this._buildFontString();
    const textMetrics = ctx.measureText(priceText);
    const padding = 6;
    const rectWidth = textMetrics.width + padding * 2;
    const rectHeight = 20;
    const rectX = x - rectWidth / 2;
    const rectY = y - rectHeight - 10;
    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(rectX + radius, rectY);
    ctx.lineTo(rectX + rectWidth - radius, rectY);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius);
    ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight);
    ctx.lineTo(rectX + radius, rectY + rectHeight);
    ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - radius);
    ctx.lineTo(rectX, rectY + radius);
    ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
    ctx.closePath();
    ctx.fillStyle = this._priceNoteBackground;
    ctx.strokeStyle = this._graphColor;
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this._priceNoteTextColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(priceText, x, rectY + rectHeight / 2);
    ctx.restore();
  }

  getStartTime(): number {
    return this._startTime;
  }

  getStartPrice(): number {
    return this._startPrice;
  }

  getEndTime(): number {
    return this._endTime;
  }

  getEndPrice(): number {
    return this._endPrice;
  }

  updateColor(color: string) {
    this._color = color;
    this.requestUpdate();
  }

  updateLineWidth(lineWidth: number) {
    this._lineWidth = lineWidth;
    this.requestUpdate();
  }

  updateLineStyle(lineStyle: "solid" | "dashed" | "dotted"): void {
    this._lineStyle = lineStyle;
    this.requestUpdate();
  }

  updatePriceNoteStyle(background: string, textColor: string, font: string) {
    this._priceNoteBackground = background;
    this._priceNoteTextColor = textColor;
    this._priceNoteFont = font;
    this.requestUpdate();
  }

  public updateStyles(styles: {
    color?: string;
    lineWidth?: number;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    priceNoteBackground?: string;
    priceNoteTextColor?: string;
    priceNoteFont?: string;
    fontSize?: number;
    graphColor?: string;
    graphLineStyle?: 'solid' | 'dashed' | 'dotted';
    graphLineWidth?: number;
    isBold?: boolean;
    isItalic?: boolean;
    [key: string]: any;
  }): void {
    let needsUpdate = false;
    if (styles['isBold'] !== undefined) {
      this._isBold = !!styles['isBold'];
      needsUpdate = true;
    }
    if (styles['isItalic'] !== undefined) {
      this._isItalic = !!styles['isItalic'];
      needsUpdate = true;
    }
    if (styles['graphColor']) {
      this._graphColor = styles['graphColor'];
      needsUpdate = true;
    }
    if (styles['graphLineStyle']) {
      this._graphLineStyle = styles['graphLineStyle'];
      needsUpdate = true;
    }
    if (styles['graphLineWidth']) {
      this._graphLineWidth = styles['graphLineWidth'];
      needsUpdate = true;
    }
    if (styles.color) this._priceNoteTextColor = styles.color;
    if (styles.lineWidth) this._lineWidth = styles.lineWidth;
    if (styles.lineStyle) this._lineStyle = styles.lineStyle;
    if (styles.priceNoteBackground || styles.priceNoteTextColor || styles.priceNoteFont || styles.fontSize) {
      this.updatePriceNoteStyle(
        styles.priceNoteBackground || this._priceNoteBackground,
        styles.priceNoteTextColor || this._priceNoteTextColor,
        this._buildFontString(styles.fontSize || this._getFontSizeFromFontString())
      );
      needsUpdate = true;
    }
    if (needsUpdate) {
      this.requestUpdate();
    }
  }

  public getCurrentStyles(): Record<string, any> {
    return {
      color: this._color,
      lineWidth: this._lineWidth,
      lineStyle: this._lineStyle,
      priceNoteBackground: this._priceNoteBackground,
      priceNoteTextColor: this._priceNoteTextColor,
      priceNoteFont: this._priceNoteFont,
      graphColor: this._graphColor,
      graphLineStyle: this._graphLineStyle,
      graphLineWidth: this._graphLineWidth,
      isBold: this._isBold,
      isItalic: this._isItalic
    };
  }

  private _buildFontString(fontSize?: number): string {
    const finalFontSize = fontSize || this._getFontSizeFromFontString();
    let fontStyle = '';
    let fontWeight = '';

    if (this._isItalic) {
      fontStyle = 'italic ';
    }
    if (this._isBold) {
      fontWeight = 'bold ';
    }

    return `${fontStyle}${fontWeight}${finalFontSize}px Arial, sans-serif`;
  }

  private _getFontSizeFromFontString(): number {
    const match = this._priceNoteFont.match(/(\d+)px/);
    return match ? parseInt(match[1]) : 12;
  }

  private _getLineDashPattern(style: 'solid' | 'dashed' | 'dotted'): number[] {
    switch (style) {
      case 'dashed':
        return [5, 5];
      case 'dotted':
        return [2, 2];
      case 'solid':
      default:
        return [];
    }
  }

  getBounds() {
    if (!this._chart || !this._series) return null;
    const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
    const startY = this._series.priceToCoordinate(this._startPrice);
    const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
    const endY = this._series.priceToCoordinate(this._endPrice);
    if (startX == null || startY == null || endX == null || endY == null) return null;
    return {
      startX, startY, endX, endY,
      minX: Math.min(startX, endX),
      maxX: Math.max(startX, endX),
      minY: Math.min(startY, endY),
      maxY: Math.max(startY, endY)
    };
  }
}
