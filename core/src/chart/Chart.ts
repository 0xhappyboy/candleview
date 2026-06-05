import { ICandleViewDataPoint, MainChartType } from '../types';
import { Theme } from '../theme';

interface ChartOptions {
    container: HTMLElement;
    data: ICandleViewDataPoint[];
    theme: Theme;
    chartType: MainChartType;
    onReady?: () => void;
}

export class Chart {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private data: ICandleViewDataPoint[];
    private theme: Theme;
    private chartType: MainChartType;
    private width: number = 0;
    private height: number = 0;
    private resizeObserver: ResizeObserver | null = null;

    constructor(options: ChartOptions) {
        this.container = options.container;
        this.data = options.data;
        this.theme = options.theme;
        this.chartType = options.chartType;
        this.init();
        options.onReady?.();
    }

    private init(): void {
        this.createCanvas();
        this.setupResizeObserver();
        this.render();
    }

    private createCanvas(): void {
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.updateCanvasSize();
    }

    private setupResizeObserver(): void {
        this.resizeObserver = new ResizeObserver(() => {
            this.updateCanvasSize();
            this.render();
        });
        this.resizeObserver.observe(this.container);
    }

    private updateCanvasSize(): void {
        if (!this.canvas || !this.container) return;
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    public updateData(data: ICandleViewDataPoint[]): void {
        this.data = data;
        this.render();
    }

    public updateTheme(theme: Theme): void {
        this.theme = theme;
        this.render();
    }

    public updateChartType(type: MainChartType): void {
        this.chartType = type;
        this.render();
    }

    private render(): void {
        if (!this.ctx || this.width === 0 || this.height === 0) return;
        this.clearCanvas();
        if (this.data.length === 0) return;
        this.drawChart();
    }

    private clearCanvas(): void {
        if (!this.ctx) return;
        this.ctx.fillStyle = this.theme.getColors().background;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    private drawChart(): void {
        const padding = { left: 50, right: 20, top: 20, bottom: 30 };
        const chartWidth = this.width - padding.left - padding.right;
        const chartHeight = this.height - padding.top - padding.bottom;

        if (chartWidth <= 0 || chartHeight <= 0) return;

        const prices = this.data.map(d => d.high);
        const minPrice = Math.min(...this.data.map(d => d.low), ...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;

        const xStep = chartWidth / (this.data.length - 1 || 1);

        if (this.chartType === MainChartType.Candle) {
            this.drawCandles(padding, chartWidth, chartHeight, minPrice, priceRange, xStep);
        } else if (this.chartType === MainChartType.Line) {
            this.drawLine(padding, chartWidth, chartHeight, minPrice, priceRange, xStep);
        } else if (this.chartType === MainChartType.Area) {
            this.drawArea(padding, chartWidth, chartHeight, minPrice, priceRange, xStep);
        }
    }

    private priceToY(price: number, minPrice: number, priceRange: number, chartHeight: number): number {
        if (priceRange === 0) return chartHeight / 2;
        return ((price - minPrice) / priceRange) * chartHeight;
    }

    private drawCandles(
        padding: { left: number; right: number; top: number; bottom: number },
        chartWidth: number,
        chartHeight: number,
        minPrice: number,
        priceRange: number,
        xStep: number
    ): void {
        if (!this.ctx) return;
        const colors = this.theme.getColors();
        const candleWidth = Math.max(2, Math.min(8, xStep * 0.7));

        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            const x = padding.left + i * xStep;
            const openY = padding.top + chartHeight - this.priceToY(item.open, minPrice, priceRange, chartHeight);
            const closeY = padding.top + chartHeight - this.priceToY(item.close, minPrice, priceRange, chartHeight);
            const highY = padding.top + chartHeight - this.priceToY(item.high, minPrice, priceRange, chartHeight);
            const lowY = padding.top + chartHeight - this.priceToY(item.low, minPrice, priceRange, chartHeight);
            const isUp = item.close >= item.open;
            this.ctx.fillStyle = isUp ? colors.chartCandleUp : colors.chartCandleDown;
            this.ctx.strokeStyle = isUp ? colors.chartCandleUp : colors.chartCandleDown;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x, highY);
            this.ctx.lineTo(x, lowY);
            this.ctx.stroke();
            const bodyTop = Math.min(openY, closeY);
            const bodyBottom = Math.max(openY, closeY);
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);
            this.ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        }
    }

    private drawLine(
        padding: { left: number; right: number; top: number; bottom: number },
        chartWidth: number,
        chartHeight: number,
        minPrice: number,
        priceRange: number,
        xStep: number
    ): void {
        if (!this.ctx) return;
        const colors = this.theme.getColors();
        this.ctx.beginPath();
        this.ctx.strokeStyle = colors.chartLine;
        this.ctx.lineWidth = 2;

        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            const x = padding.left + i * xStep;
            const y = padding.top + chartHeight - this.priceToY(item.close, minPrice, priceRange, chartHeight);

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
    }

    private drawArea(
        padding: { left: number; right: number; top: number; bottom: number },
        chartWidth: number,
        chartHeight: number,
        minPrice: number,
        priceRange: number,
        xStep: number
    ): void {
        if (!this.ctx) return;
        const colors = this.theme.getColors();
        this.ctx.beginPath();
        this.ctx.strokeStyle = colors.chartLine;
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            const x = padding.left + i * xStep;
            const y = padding.top + chartHeight - this.priceToY(item.close, minPrice, priceRange, chartHeight);

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        this.ctx.beginPath();
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            const x = padding.left + i * xStep;
            const y = padding.top + chartHeight - this.priceToY(item.close, minPrice, priceRange, chartHeight);

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        const lastX = padding.left + (this.data.length - 1) * xStep;
        const bottomY = padding.top + chartHeight;
        this.ctx.lineTo(lastX, bottomY);
        this.ctx.lineTo(padding.left, bottomY);
        this.ctx.closePath();

        this.ctx.fillStyle = colors.chartAreaTop;
        this.ctx.fill();
    }

    public destroy(): void {
        this.resizeObserver?.disconnect();
        this.canvas?.remove();
    }

    public handleResize(): void {
        this.updateCanvasSize();
        this.render();
    }
}