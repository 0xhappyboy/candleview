import { ChartLayer } from "..";

export class VolumeHeatMap {
    private heatMapCanvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private resizeObserver: ResizeObserver | null = null;

    constructor(chartLayer: ChartLayer) {
        this.initializeHeatMap(chartLayer);
    }

    private initializeHeatMap(chartLayer: ChartLayer): void {
        this.heatMapCanvas = document.createElement('canvas');
        this.ctx = this.heatMapCanvas.getContext('2d');
        const container = chartLayer.containerRef.current;
        if (!container || !this.ctx) return;
        this.heatMapCanvas.style.position = 'absolute';
        this.heatMapCanvas.style.top = '0';
        this.heatMapCanvas.style.height = '100%';
        this.heatMapCanvas.style.zIndex = '10';
        this.heatMapCanvas.style.pointerEvents = 'none';
        container.appendChild(this.heatMapCanvas);
        this.updatePosition(container);
        this.setupResizeObserver(container);
    }

    private setupResizeObserver(container: HTMLElement): void {
        this.resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                this.updatePosition(container);
            }
        });
        this.resizeObserver.observe(container);
    }

    private updatePosition(container: HTMLElement): void {
        if (!this.heatMapCanvas) return;
        this.heatMapCanvas.style.left = '0px';
        this.heatMapCanvas.style.right = 'auto';
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        if (!this.ctx || !this.heatMapCanvas) return;
        const container = chartLayer.containerRef.current;
        if (container) {
            this.updatePosition(container);
        }
        const chartData = chartLayer.props.chartData;
        if (!chartData || chartData.length === 0) {
            if (this.ctx && this.heatMapCanvas) {
                const containerRect = container?.getBoundingClientRect();
                const maxWidth = containerRect ? containerRect.width * 0.25 : 0;
                const height = containerRect ? containerRect.height - 29 : 0;
                this.heatMapCanvas.style.width = `${maxWidth}px`;
                this.heatMapCanvas.style.height = `${height}px`;
                this.heatMapCanvas.width = maxWidth;
                this.heatMapCanvas.height = height;
                this.ctx.clearRect(0, 0, maxWidth, height);
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
                this.ctx.fillRect(0, 0, maxWidth, height);
            }
            return;
        }
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const maxWidth = containerRect.width * 0.25;
        const height = containerRect.height - 29;
        this.heatMapCanvas.style.width = `${maxWidth}px`;
        this.heatMapCanvas.style.height = `${height}px`;
        this.heatMapCanvas.width = maxWidth;
        this.heatMapCanvas.height = height;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        this.ctx.fillRect(0, 0, maxWidth, height);
        this.ctx.clearRect(0, 0, maxWidth, height);
        const validData = chartData.filter(item => !item.isVirtual && item.volume);
        if (validData.length === 0) {
            this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, 0, maxWidth, height);
            return;
        }
        const minPrice = Math.min(...validData.map(item => item.low));
        const maxPrice = Math.max(...validData.map(item => item.high));
        const priceDiff = maxPrice - minPrice;
        if (priceDiff <= 0) {
            this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, 0, maxWidth, height);
            return;
        }
        const priceLevels = Math.min(200, Math.floor(height / 2));
        const volumeByPrice: number[] = new Array(priceLevels).fill(0);
        validData.forEach(item => {
            const highLevel = Math.min(priceLevels - 1, Math.max(0,
                Math.floor(((item.high - minPrice) / priceDiff) * priceLevels)
            ));
            const lowLevel = Math.min(priceLevels - 1, Math.max(0,
                Math.floor(((item.low - minPrice) / priceDiff) * priceLevels)
            ));
            const levels = Math.max(1, highLevel - lowLevel + 1);
            const volumePerLevel = item.volume / levels;

            for (let level = lowLevel; level <= highLevel; level++) {
                volumeByPrice[level] += volumePerLevel;
            }
        });
        const maxLevelVolume = Math.max(...volumeByPrice);
        if (maxLevelVolume === 0) {
            this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, 0, maxWidth, height);
            return;
        }
        const minWidth = 2;
        const cellHeight = height / priceLevels;
        for (let i = 0; i < priceLevels; i++) {
            const volume = volumeByPrice[i];
            if (volume === 0) continue;
            const volumeRatio = volume / maxLevelVolume;
            const cellWidth = minWidth + (maxWidth - minWidth) * volumeRatio;
            const intensity = Math.sqrt(volumeRatio);
            const red = Math.floor(255 * intensity);
            const green = Math.floor(255 * (1 - intensity));
            const blue = 0;
            const alpha = 0.3 + intensity * 0.7;
            const color = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            const x = 0;
            const y = height - (i + 1) * cellHeight;
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, cellWidth, cellHeight);
        }
        this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0, 0, maxWidth, height);
    }

    public destroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.heatMapCanvas) {
            this.heatMapCanvas.remove();
            this.heatMapCanvas = null;
            this.ctx = null;
        }
    }
}