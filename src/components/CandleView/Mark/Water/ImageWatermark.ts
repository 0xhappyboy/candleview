import { MarkType } from "../../types";
import { IGraph } from "../IGraph";

export interface ImageWatermarkOptions {
    src: string;
    size?: number;
    opacity?: number;
    offsetX?: number;
    offsetY?: number;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
}

export class ImageWatermark implements IGraph {
    private _chart: any;
    private _renderer: any;
    private _options: ImageWatermarkOptions;
    private _image: HTMLImageElement | null = null;
    private _isLoaded: boolean = false;

    constructor(options: ImageWatermarkOptions) {
        this._options = {
            size: 100,
            opacity: 0.3,
            offsetX: 20,
            offsetY: 20,
            borderColor: 'rgba(128, 128, 128, 0.2)',
            borderWidth: 2,
            borderRadius: 50,
            ...options
        };
        this._loadImage();
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

    private _loadImage(): void {
        this._image = new Image();
        this._image.crossOrigin = "anonymous";
        if (this._options.src.startsWith('data:image')) {
            this._image.src = this._options.src;
        } else {
            this._image.src = this._options.src;
        }
        this._image.onload = () => {
            this._isLoaded = true;
            this.requestUpdate();
        };
        this._image.onerror = (error) => {
            console.error('Failed to load watermark image:', error);
            this._isLoaded = false;
        };
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
                    if (!this._isLoaded || !this._image) return;
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart) return;
                    const canvas = this._chart.chartElement()?.querySelector('canvas');
                    if (!canvas) return;
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    const size = this._options.size || 100;
                    const offsetX = this._options.offsetX || 20;
                    const offsetY = this._options.offsetY || 20;
                    const borderRadius = this._options.borderRadius || 50;
                    const x = canvasWidth - size - offsetX;
                    const y = canvasHeight - size - offsetY;
                    ctx.save();
                    ctx.globalAlpha = this._options.opacity || 0.3;
                    ctx.beginPath();
                    const radius = (size / 2) * (borderRadius / 50);
                    ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(this._image, x, y, size, size);
                    if (this._options.borderWidth && this._options.borderWidth > 0) {
                        ctx.beginPath();
                        ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
                        ctx.strokeStyle = this._options.borderColor || 'rgba(128, 128, 128, 0.2)';
                        ctx.lineWidth = this._options.borderWidth;
                        ctx.stroke();
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    updateImage(src: string): void {
        this._options.src = src;
        this._isLoaded = false;
        this._loadImage();
        this.requestUpdate();
    }

    updateOptions(options: Partial<ImageWatermarkOptions>): void {
        this._options = { ...this._options, ...options };
        if (options.src && options.src !== this._options.src) {
            this._isLoaded = false;
            this._loadImage();
        }
        this.requestUpdate();
    }

    getOptions(): ImageWatermarkOptions {
        return { ...this._options };
    }

    isImageLoaded(): boolean {
        return this._isLoaded;
    }
}