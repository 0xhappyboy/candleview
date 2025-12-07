import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { ImageWatermark, ImageWatermarkOptions } from "../../Mark/Water/ImageWatermark";

export interface ImageWatermarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
}

export class ImageWatermarkManager {
    private props: ImageWatermarkManagerProps;
    private watermark: ImageWatermark | null = null;
    private isVisible: boolean = true;

    constructor(props: ImageWatermarkManagerProps) {
        this.props = props;
    }

    public addWatermark(options: ImageWatermarkOptions): Promise<boolean> {
        const { chartSeries } = this.props;
        if (!chartSeries || this.watermark) return Promise.resolve(false);
        this.watermark = new ImageWatermark(options);
        chartSeries.series.attachPrimitive(this.watermark);
        this.isVisible = true;
        return new Promise((resolve) => {
            const checkLoaded = () => {
                if (this.watermark?.isImageLoaded()) {
                    resolve(true);
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            setTimeout(checkLoaded, 100);
        });
    }

    public updateWatermarkImage(src: string): void {
        if (this.watermark) {
            this.watermark.updateImage(src);
        }
    }

    public updateWatermarkOptions(options: Partial<ImageWatermarkOptions>): void {
        if (this.watermark) {
            this.watermark.updateOptions(options);
        }
    }

    public setVisible(visible: boolean): void {
        const { chartSeries } = this.props;
        if (!chartSeries || !this.watermark) return;

        if (visible && !this.isVisible) {
            chartSeries.series.attachPrimitive(this.watermark);
            this.isVisible = true;
        } else if (!visible && this.isVisible) {
            chartSeries.series.detachPrimitive(this.watermark);
            this.isVisible = false;
        }
    }

    public toggleVisibility(): boolean {
        this.setVisible(!this.isVisible);
        return this.isVisible;
    }

    public removeWatermark(): void {
        const { chartSeries } = this.props;
        if (chartSeries && this.watermark) {
            chartSeries.series.detachPrimitive(this.watermark);
            this.watermark = null;
            this.isVisible = false;
        }
    }

    public getWatermarkOptions(): ImageWatermarkOptions | null {
        return this.watermark ? this.watermark.getOptions() : null;
    }

    public isWatermarkVisible(): boolean {
        return this.isVisible;
    }

    public isImageLoaded(): boolean {
        return this.watermark ? this.watermark.isImageLoaded() : false;
    }

    public updateProps(newProps: Partial<ImageWatermarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this.removeWatermark();
    }

    public static async imageToBase64(imageUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            img.src = imageUrl;
        });
    }
}