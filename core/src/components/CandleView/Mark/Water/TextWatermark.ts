import { MarkType } from "../../types";
import { IGraph } from "../IGraph";

export interface TextWatermarkOptions {
  text: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  fontFamily?: string;
  fontWeight?: string;
  textShadow?: string;
}

export class TextWatermark implements IGraph {
  private _chart: any;
  private _renderer: any;
  private _options: TextWatermarkOptions;

  constructor(options: TextWatermarkOptions) {
    this._options = {
      fontSize: 48,
      color: 'rgba(128, 128, 128, 0.2)',
      opacity: 0.2,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      ...options
    };
  }
  getMarkType(): MarkType {
    throw new Error("Method not implemented.");
  }

  attached(param: any) {
    this._chart = param.chart;
    this.requestUpdate();
  }

  updateAllViews() { }

  private requestUpdate() {
    if (this._chart) {
      try {
        this._chart.timeScale().applyOptions({});
      } catch (error) {
      }
    }
  }

  time() {
    return Date.now();
  }

  priceValue() {
    return 0;
  }

  paneViews() {
    if (!this._renderer) {
      this._renderer = {
        draw: (target: any) => {
          const ctx = target.context ?? target._context;
          if (!ctx || !this._chart) return;
          const canvas = this._chart.chartElement()?.querySelector('canvas');
          if (!canvas) return;
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          ctx.save();
          ctx.fillStyle = this._options.color;
          ctx.globalAlpha = this._options.opacity || 0.2;
          ctx.font = `${this._options.fontWeight || 'normal'} ${this._options.fontSize}px ${this._options.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (this._options.textShadow) {
            ctx.shadowColor = this._options.textShadow;
            ctx.shadowBlur = 2;
          }
          const centerX = canvasWidth / 2;
          const centerY = canvasHeight / 2;
          ctx.fillText(this._options.text, centerX, centerY);
          ctx.shadowBlur = 0;
          ctx.restore();
        },
      };
    }
    return [{ renderer: () => this._renderer }];
  }

  updateText(text: string) {
    this._options.text = text;
    this.requestUpdate();
  }

  updateOptions(options: Partial<TextWatermarkOptions>) {
    this._options = { ...this._options, ...options };
    this.requestUpdate();
  }

  getOptions(): TextWatermarkOptions {
    return { ...this._options };
  }
}
