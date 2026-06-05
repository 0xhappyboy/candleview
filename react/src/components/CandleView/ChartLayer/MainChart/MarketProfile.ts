import { ChartLayer } from "..";
import { I18n } from "../../I18n";
import { ThemeConfig } from "../../Theme";

export class MarketProfile {
    private _chart: any = null;
    private _series: any = null;
    private _renderer: any = null;
    private _chartData: any[] = [];
    private _width: number = 0;
    private _height: number = 0;
    private _isAttached: boolean = false;
    private _config: MarketProfileConfig;
    private _cachedProfile: CachedProfile | null = null;
    private _lastDataHash: string = '';
    private _widthProportion: number = 0.35;
    private _menu: HTMLElement | null = null;
    private _profileRect: { x: number; y: number; width: number; height: number } = { x: 0, y: 0, width: 0, height: 0 };
    private _i18n: I18n | undefined;
    private _theme: ThemeConfig | undefined;
    private _closeCallBack: (() => void) | undefined;

    constructor(chartLayer: ChartLayer, i18n: I18n, theme: ThemeConfig, closeCallBack: () => void) {
        this._closeCallBack = closeCallBack;
        this._config = {
            profileWidth: 0.15,
            timeSlotMinutes: 30,
            valueAreaPercent: 0.7,
            tickSize: 0.01,
            showInitialBalance: true,
            showValueArea: true,
            maxPriceLevels: 80,
            simplifyTPO: true
        };
        this.initializeMarketProfile(chartLayer, i18n, theme);
    }

    private initializeMarketProfile(chartLayer: ChartLayer, i18n: I18n, theme: ThemeConfig): void {
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
            if (this.isInProfileArea(e.offsetX, e.offsetY)) {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY);
            }
        };
        this._clickHandler = (e: Event) => {
            if (this._menu && !this._menu.contains(e.target as Node)) {
                this.hideContextMenu();
            }
        };
        this._resizeHandler = () => this.updateProfileRect();

        chartElement.addEventListener('contextmenu', this._contextMenuHandler);
        document.addEventListener('click', this._clickHandler);
        window.addEventListener('resize', this._resizeHandler);
    }

    private isInProfileArea(mouseX: number, mouseY: number): boolean {
        this.updateProfileRect();
        return (
            mouseX >= this._profileRect.x &&
            mouseX <= this._profileRect.x + this._profileRect.width &&
            mouseY >= this._profileRect.y &&
            mouseY <= this._profileRect.y + this._profileRect.height
        );
    }

    private updateProfileRect(): void {
        if (!this._chart) return;
        const chartElement = this._chart.chartElement();
        if (!chartElement) return;
        const chartRect = chartElement.getBoundingClientRect();
        const profileWidth = chartRect.width * this._widthProportion;
        const profileX = 0;
        this._profileRect = {
            x: profileX,
            y: 0,
            width: profileWidth,
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
        this._cachedProfile = null;
        this.requestUpdate();
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this.requestUpdate();
        setTimeout(() => this.updateProfileRect(), 0);
    }

    updateAllViews() {
        this.requestUpdate();
        this.updateProfileRect();
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
                    this.drawMarketProfile(ctx);
                    this.updateProfileRect();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private drawMarketProfile(ctx: CanvasRenderingContext2D): void {
        const chartData = this._chartData;
        if (!chartData || chartData.length === 0) return;
        const currentHash = this.getDataHash(chartData);
        if (!this._cachedProfile || this._lastDataHash !== currentHash) {
            this._cachedProfile = this.calculateProfile(chartData);
            this._lastDataHash = currentHash;
        }
        if (!this._cachedProfile) return;
        const profileWidth = this._width * this._widthProportion;
        ctx.clearRect(0, 0, profileWidth, this._height);
        this.drawProfileBars(ctx, this._cachedProfile, profileWidth);
        if (this._config.showValueArea) {
            this.drawValueArea(ctx, this._cachedProfile, profileWidth);
        }
    }

    private getDataHash(data: any[]): string {
        if (data.length === 0) return 'empty';
        return `${data.length}_${data[0].time}_${data[data.length - 1].time}`;
    }

    private calculateProfile(data: any[]): CachedProfile | null {
        if (data.length === 0) return null;
        const validData = data.filter(item => !item.isVirtual);
        if (validData.length === 0) return null;
        const minPrice = Math.min(...validData.map(item => item.low));
        const maxPrice = Math.max(...validData.map(item => item.high));
        const priceRange = maxPrice - minPrice;
        if (priceRange <= 0) return null;
        const priceLevels = Math.min(this._config.maxPriceLevels, Math.floor(this._height / 3));
        const levelHeight = priceRange / priceLevels;
        const levels: ProfileLevel[] = [];
        for (let i = 0; i <= priceLevels; i++) {
            levels.push({
                price: minPrice + (i * levelHeight),
                count: 0,
                volume: 0
            });
        }
        validData.forEach(item => {
            const highLevel = this.findPriceLevel(levels, item.high);
            const lowLevel = this.findPriceLevel(levels, item.low);
            for (let level = lowLevel; level <= highLevel; level++) {
                levels[level].count++;
                levels[level].volume += (item.volume || 0);
            }
        });
        const maxCount = Math.max(...levels.map(level => level.count));
        const pocLevel = levels.find(level => level.count === maxCount);
        const valueArea = this.calculateSimpleValueArea(levels, this._config.valueAreaPercent);
        return {
            levels,
            minPrice,
            maxPrice,
            priceRange,
            poc: pocLevel ? pocLevel.price : minPrice + priceRange / 2,
            valueAreaHigh: valueArea.high,
            valueAreaLow: valueArea.low,
            maxCount
        };
    }

    private findPriceLevel(levels: ProfileLevel[], price: number): number {
        const firstPrice = levels[0].price;
        const lastPrice = levels[levels.length - 1].price;
        const priceRange = lastPrice - firstPrice;
        if (price <= firstPrice) return 0;
        if (price >= lastPrice) return levels.length - 1;
        return Math.min(levels.length - 1,
            Math.max(0, Math.floor(((price - firstPrice) / priceRange) * levels.length))
        );
    }

    private calculateSimpleValueArea(levels: ProfileLevel[], percent: number): { high: number, low: number } {
        const totalCount = levels.reduce((sum, level) => sum + level.count, 0);
        const targetCount = totalCount * percent;
        const maxCount = Math.max(...levels.map(level => level.count));
        const pocIndex = levels.findIndex(level => level.count === maxCount);
        let accumulated = 0;
        let highIndex = pocIndex;
        let lowIndex = pocIndex;
        while (accumulated < targetCount && (highIndex < levels.length - 1 || lowIndex > 0)) {
            let nextHigh = highIndex < levels.length - 1 ? levels[highIndex + 1].count : 0;
            let nextLow = lowIndex > 0 ? levels[lowIndex - 1].count : 0;
            if (nextHigh >= nextLow && highIndex < levels.length - 1) {
                highIndex++;
                accumulated += levels[highIndex].count;
            } else if (lowIndex > 0) {
                lowIndex--;
                accumulated += levels[lowIndex].count;
            } else {
                break;
            }
        }
        return {
            high: levels[highIndex].price,
            low: levels[lowIndex].price
        };
    }

    private drawProfileBars(ctx: CanvasRenderingContext2D, profile: CachedProfile, profileWidth: number): void {
        const { levels, minPrice, maxPrice, priceRange, maxCount } = profile;
        if (priceRange <= 0) return;
        ctx.save();
        const barWidth = profileWidth;
        const cellHeight = this._height / levels.length;
        levels.forEach(level => {
            if (level.count === 0) return;
            const priceRatio = (level.price - minPrice) / priceRange;
            const y = this._height - (priceRatio * this._height);
            const intensity = level.count / maxCount;
            const barHeight = cellHeight;
            const color = this.getProfileColor(intensity);
            ctx.fillStyle = color;
            const width = Math.max(2, barWidth * intensity * 0.8);
            ctx.fillRect(0, y - barHeight / 2, width, barHeight);
        });
        ctx.restore();
    }

    private drawValueArea(ctx: CanvasRenderingContext2D, profile: CachedProfile, profileWidth: number): void {
        const { valueAreaHigh, valueAreaLow, minPrice, maxPrice, priceRange, poc } = profile;
        if (priceRange <= 0) return;
        const highRatio = (valueAreaHigh - minPrice) / priceRange;
        const lowRatio = (valueAreaLow - minPrice) / priceRange;
        const pocRatio = (poc - minPrice) / priceRange;
        const yHigh = this._height - (highRatio * this._height);
        const yLow = this._height - (lowRatio * this._height);
        const yPOC = this._height - (pocRatio * this._height);
        ctx.save();
        ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
        ctx.fillRect(0, yHigh, profileWidth, yLow - yHigh);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(0, yHigh);
        ctx.lineTo(profileWidth, yHigh);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, yLow);
        ctx.lineTo(profileWidth, yLow);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, yPOC);
        ctx.lineTo(profileWidth, yPOC);
        ctx.stroke();
        ctx.restore();
    }

    private getProfileColor(intensity: number): string {
        if (intensity < 0.3) return 'rgba(100, 150, 255, 0.4)';
        if (intensity < 0.6) return 'rgba(50, 100, 200, 0.6)';
        return 'rgba(0, 50, 150, 0.8)';
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

interface MarketProfileConfig {
    profileWidth: number;
    timeSlotMinutes: number;
    valueAreaPercent: number;
    tickSize: number;
    showInitialBalance: boolean;
    showValueArea: boolean;
    maxPriceLevels: number;
    simplifyTPO: boolean;
}

interface ProfileLevel {
    price: number;
    count: number;
    volume: number;
}

interface CachedProfile {
    levels: ProfileLevel[];
    minPrice: number;
    maxPrice: number;
    priceRange: number;
    poc: number;
    valueAreaHigh: number;
    valueAreaLow: number;
    maxCount: number;
}