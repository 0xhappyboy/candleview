import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { TextWatermark, TextWatermarkOptions } from "../../Mark/Water/TextWatermark";

export interface TextWatermarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
}

export class TextWatermarkManager {
    private props: TextWatermarkManagerProps;
    private watermark: TextWatermark | null = null;
    private isVisible: boolean = true;

    constructor(props: TextWatermarkManagerProps) {
        this.props = props;
    }

    public addWatermark(options: TextWatermarkOptions): void {
        const { chartSeries } = this.props;
        if (!chartSeries || this.watermark) return;

        this.watermark = new TextWatermark(options);
        chartSeries.series.attachPrimitive(this.watermark);
        this.isVisible = true;
    }

    public updateWatermarkText(text: string): void {
        if (this.watermark) {
            this.watermark.updateText(text);
        }
    }

    public updateWatermarkOptions(options: Partial<TextWatermarkOptions>): void {
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

    public getWatermarkOptions(): TextWatermarkOptions | null {
        return this.watermark ? this.watermark.getOptions() : null;
    }

    public isWatermarkVisible(): boolean {
        return this.isVisible;
    }

    public updateProps(newProps: Partial<TextWatermarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this.removeWatermark();
    }
}