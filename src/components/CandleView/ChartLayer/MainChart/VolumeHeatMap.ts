import { ChartLayer } from "..";
import { I18n } from "../../I18n";
import { ThemeConfig } from "../../Theme";

export class VolumeHeatMap {
    private _chart: any = null;
    private _series: any = null;
    private _renderer: any = null;
    private _chartData: any[] = [];
    private _width: number = 0;
    private _height: number = 0;
    private _isAttached: boolean = false;
    private _menu: HTMLElement | null = null;
    private _heatMapRect: { x: number; y: number; width: number; height: number } = { x: 0, y: 0, width: 0, height: 0 };
    private _i18n: I18n | undefined;
    private _theme: ThemeConfig | undefined;
    private _closeCallBack: (() => void) | undefined;

    constructor(chartLayer: ChartLayer, i18n: I18n, theme: ThemeConfig, closeCallBack: () => void) {
        this._closeCallBack = closeCallBack;
        this.initializeHeatMap(chartLayer, i18n, theme);
    }

    private initializeHeatMap(chartLayer: ChartLayer, i18n: I18n, theme: ThemeConfig): void {
        this._chartData = chartLayer.props.chartData || [];
        this._i18n = i18n;
        this._theme = theme;
        if (chartLayer.props.chartSeries && chartLayer.props.chartSeries.series) {
            this.attached({
                chart: chartLayer.props.chart,
                series: chartLayer.props.chartSeries.series
            });
            chartLayer.props.chartSeries.series.attachPrimitive(this);
            this._isAttached = true;
            this.bindContextMenu(chartLayer.props.chart);
        }
    }

    private _contextMenuHandler: ((e: MouseEvent) => void) | null = null;
    private _clickHandler: ((e: Event) => void) | null = null;
    private _resizeHandler: (() => void) | null = null;

    private bindContextMenu(chart: any): void {
        const chartElement = chart.chartElement();
        if (!chartElement) return;

        this._contextMenuHandler = (e: MouseEvent) => {
            if (this.isInHeatMapArea(e.offsetX, e.offsetY)) {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY);
            }
        };
        this._clickHandler = (e: Event) => {
            if (this._menu && !this._menu.contains(e.target as Node)) {
                this.hideContextMenu();
            }
        };
        this._resizeHandler = () => this.updateHeatMapRect();

        chartElement.addEventListener('contextmenu', this._contextMenuHandler);
        document.addEventListener('click', this._clickHandler);
        window.addEventListener('resize', this._resizeHandler);
    }

    private isInHeatMapArea(mouseX: number, mouseY: number): boolean {
        this.updateHeatMapRect();
        return (
            mouseX >= this._heatMapRect.x &&
            mouseX <= this._heatMapRect.x + this._heatMapRect.width &&
            mouseY >= this._heatMapRect.y &&
            mouseY <= this._heatMapRect.y + this._heatMapRect.height
        );
    }

    private updateHeatMapRect(): void {
        if (!this._chart) return;
        const chartElement = this._chart.chartElement();
        if (!chartElement) return;
        const chartRect = chartElement.getBoundingClientRect();
        const heatMapWidth = chartRect.width * 0.25;
        const heatMapX = chartRect.width - heatMapWidth;
        this._heatMapRect = {
            x: heatMapX,
            y: 0,
            width: heatMapWidth,
            height: chartRect.height - 29
        };
    }

    private showContextMenu(x: number, y: number): void {
        this.hideContextMenu();
        this._menu = document.createElement('div');
        this._menu.style.position = 'fixed';
        this._menu.style.left = `${x}px`;
        this._menu.style.top = `${y}px`;
        this._menu.style.background = this._theme?.panel.backgroundColor || '#FFFFFF';
        this._menu.style.border = `1px solid ${this._theme?.panel.borderColor || '#E1E5E9'}`;
        this._menu.style.borderRadius = '4px';
        this._menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        this._menu.style.zIndex = '1000';
        this._menu.style.padding = '4px 0';
        this._menu.style.minWidth = '120px';
        this._menu.style.fontFamily = 'Arial, sans-serif';
        this._menu.style.fontSize = '14px';
        const closeButton = document.createElement('button');
        closeButton.textContent = this._i18n?.close || 'Close';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.padding = '6px 12px';
        closeButton.style.width = '100%';
        closeButton.style.textAlign = 'left';
        closeButton.style.cursor = 'pointer';
        closeButton.style.color = this._theme?.modal.textColor || '#2D323D';
        closeButton.style.transition = 'background-color 0.2s';
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.backgroundColor = this._theme?.toolbar.button.hover || '#2D323D';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.backgroundColor = 'transparent';
        });
        closeButton.addEventListener('click', () => {
            this.destroy();
            this.hideContextMenu();
        });
        this._menu.appendChild(closeButton);
        document.body.appendChild(this._menu);
    }

    private hideContextMenu(): void {
        if (this._menu) {
            document.body.removeChild(this._menu);
            this._menu = null;
        }
    }

    public refreshData = (chartLayer: ChartLayer): void => {
        this._chartData = chartLayer.props.chartData || [];
        this.requestUpdate();
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this.requestUpdate();
        setTimeout(() => this.updateHeatMapRect(), 0);
    }

    updateAllViews() {
        this.requestUpdate();
        this.updateHeatMapRect();
    }

    time() {
        return this._chartData.length > 0 ? this._chartData[0].time : 0;
    }

    priceValue() {
        return this._chartData.length > 0 ? this._chartData[0].close : 0;
    }

    updateI18n(i18n: I18n) {
        this._i18n = i18n;
    }

    updateTheme(theme: ThemeConfig) {
        this._theme = theme;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart) return;
                    const chartElement = this._chart.chartElement();
                    if (!chartElement) return;
                    const chartRect = chartElement.getBoundingClientRect();
                    this._width = chartRect.width;
                    this._height = chartRect.height - 29;
                    if (this._width <= 0 || this._height <= 0) return;
                    this.drawHeatMap(ctx);
                    this.updateHeatMapRect();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private drawHeatMap(ctx: CanvasRenderingContext2D): void {
        const chartData = this._chartData;
        if (!chartData || chartData.length === 0) return;
        const validData = chartData.filter(item => !item.isVirtual && item.volume);
        if (validData.length === 0) return;
        const minPrice = Math.min(...validData.map(item => item.low));
        const maxPrice = Math.max(...validData.map(item => item.high));
        const priceDiff = maxPrice - minPrice;
        if (priceDiff <= 0) return;
        const heatMapWidth = this._width * 0.25;
        const heatMapX = this._width - heatMapWidth;
        // ctx.clearRect(heatMapX, 0, heatMapWidth, this._height);
        const priceLevels = Math.min(200, Math.floor(this._height / 2));
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
        if (maxLevelVolume === 0) return;
        const minWidth = 2;
        const cellHeight = this._height / priceLevels;
        ctx.save();
        for (let i = 0; i < priceLevels; i++) {
            const volume = volumeByPrice[i];
            if (volume === 0) continue;
            const volumeRatio = volume / maxLevelVolume;
            const minVolumeRatio = 0.01;
            const effectiveVolumeRatio = Math.max(volumeRatio, minVolumeRatio);
            const cellWidth = Math.max(minWidth, heatMapWidth * effectiveVolumeRatio);
            const intensity = Math.pow(effectiveVolumeRatio, 0.5);
            let red, green, blue;
            if (intensity < 0.5) {
                const t = intensity * 2;
                red = Math.floor(0);
                green = Math.floor(165 * t);
                blue = Math.floor(255 * (1 - t) + 255 * t);
            } else {
                const t = (intensity - 0.5) * 2;
                red = Math.floor(255 * t);
                green = Math.floor(255 * (1 - t));
                blue = Math.floor(255 * (1 - t));
            }
            const alpha = 0.4 + intensity * 0.6;
            const color = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            const x = heatMapX + (heatMapWidth - cellWidth);
            const y = this._height - (i + 1) * cellHeight;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, cellWidth, cellHeight);
        }
        ctx.restore();
    }

    private requestUpdate(): void {
        if (this._chart && this._isAttached) {
            try {
                if (this._chart._internal__paneUpdate) {
                    this._chart._internal__paneUpdate();
                }
                if (this._series && this._series._internal__dataChanged) {
                    this._series._internal__dataChanged();
                }
            } catch (error) {
            }
        }
    }

    public destroy(): void {
        const chartElement = this._chart?.chartElement();
        if (chartElement && this._contextMenuHandler) {
            chartElement.removeEventListener('contextmenu', this._contextMenuHandler);
        }
        if (this._clickHandler) {
            document.removeEventListener('click', this._clickHandler);
        }
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }
        if (this._series && this._isAttached) {
            try {
                this._series.detachPrimitive(this);
                this._isAttached = false;
            } catch (error) {
            }
        }
        this.hideContextMenu();
        this._renderer = null;
        this._isAttached = false;
        this._menu = null;
        this._contextMenuHandler = null;
        this._clickHandler = null;
        this._resizeHandler = null;
        this._closeCallBack?.();
    }

    public reactivate(): void {
        if (this._chart && this._series && !this._isAttached) {
            try {
                this._series.attachPrimitive(this);
                this._isAttached = true;
                this.bindContextMenu(this._chart);
                this.requestUpdate();
            } catch (error) {
            }
        }
    }
}