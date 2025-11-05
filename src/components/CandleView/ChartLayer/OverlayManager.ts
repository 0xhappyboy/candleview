import { DataPointManager } from "./DataPointManager";

export interface OverlayMarker {
    id: string;
    type: 'marker' | 'vertical-line' | 'special-marker';
    element: HTMLElement;
    labelElement?: HTMLElement;
    data: {
        index: number;
        time: string;
        price: number;
        x: number;
        y: number;
    };
}

export interface ChartDataPoint {
    time: string;
    value: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface PriceRange {
    min: number;
    max: number;
}

export class OverlayManager {
    private container: HTMLElement;
    private overlays: Map<string, OverlayMarker> = new Map();
    private testContainer: HTMLElement | null = null;
    private chartData: ChartDataPoint[] = [];
    private chart: any = null;
    private canvas: HTMLCanvasElement | null = null;
    private dataPointManager: DataPointManager | null = null;
    constructor(container: HTMLElement) {
        this.container = container;
    }
    public setChartContext(
        chartData: ChartDataPoint[],
        chart: any,
        canvas: HTMLCanvasElement,
        dataPointManager: DataPointManager
    ): void {
        this.chartData = chartData;
        this.chart = chart;
        this.canvas = canvas;
        this.dataPointManager = dataPointManager;
    }

    // 获取可见价格范围
    private getVisiblePriceRange(): { min: number; max: number } | null {
        if (!this.chartData || this.chartData.length === 0 || !this.chart) return null;
        try {
            const timeScale = this.chart.timeScale();
            if (!timeScale) return this.getChartPriceRange();
            const visibleRange = timeScale.getVisibleLogicalRange();
            if (!visibleRange) return this.getChartPriceRange();
            const fromIndex = Math.max(0, Math.floor(visibleRange.from));
            const toIndex = Math.min(this.chartData.length - 1, Math.ceil(visibleRange.to));
            let minPrice = Number.MAX_VALUE;
            let maxPrice = Number.MIN_VALUE;
            // 遍历可见范围内的数据点，找到真正的最高价和最低价
            for (let i = fromIndex; i <= toIndex; i++) {
                const dataPoint = this.chartData[i];
                if (dataPoint.high > maxPrice) maxPrice = dataPoint.high;
                if (dataPoint.low < minPrice) minPrice = dataPoint.low;
            }
            if (minPrice > maxPrice) {
                return this.getChartPriceRange();
            }
            // 为蜡烛图添加适当的边距
            const margin = (maxPrice - minPrice) * 0.1;
            const visibleRangeResult = {
                min: minPrice - margin,
                max: maxPrice + margin
            };
            console.log(`可见价格范围: [${visibleRangeResult.min.toFixed(2)}, ${visibleRangeResult.max.toFixed(2)}]`);
            return visibleRangeResult;

        } catch (error) {
            console.warn('获取可见价格范围失败，使用全量范围:', error);
            return this.getChartPriceRange();
        }
    }

    private getChartPriceRange(): { min: number; max: number } | null {
        if (!this.chartData || this.chartData.length === 0) return null;
        let minPrice = Number.MAX_VALUE;
        let maxPrice = Number.MIN_VALUE;
        this.chartData.forEach(item => {
            if (item.high > maxPrice) maxPrice = item.high;
            if (item.low < minPrice) minPrice = item.low;
        });
        if (minPrice > maxPrice) {
            minPrice = 0;
            maxPrice = 100;
        }
        const margin = (maxPrice - minPrice) * 0.1;
        return {
            min: minPrice - margin,
            max: maxPrice + margin
        };
    }

    public getAllOverlays(): OverlayMarker[] {
        return Array.from(this.overlays.values());
    }

    public getOverlaysByType(type: OverlayMarker['type']): OverlayMarker[] {
        return this.getAllOverlays().filter(overlay => overlay.type === type);
    }

    public updateOverlayPosition(overlayId: string, newX: number, newY: number): boolean {
        const overlay = this.overlays.get(overlayId);
        if (overlay) {
            overlay.element.style.left = `${newX}px`;
            overlay.element.style.top = `${newY}px`;
            if (overlay.labelElement) {
                overlay.labelElement.style.left = `${newX}px`;
                overlay.labelElement.style.top = `${newY - 20}px`;
            }
            overlay.data.x = newX;
            overlay.data.y = newY;
            return true;
        }
        return false;
    }

    public updateOverlaysPositions(updates: Array<{ id: string; x: number; y: number }>): void {
        updates.forEach(update => {
            this.updateOverlayPosition(update.id, update.x, update.y);
        });
    }

    public setOverlayVisibility(overlayId: string, visible: boolean): boolean {
        const overlay = this.overlays.get(overlayId);
        if (overlay) {
            overlay.element.style.display = visible ? 'block' : 'none';
            if (overlay.labelElement) {
                overlay.labelElement.style.display = visible ? 'block' : 'none';
            }
            return true;
        }
        return false;
    }

    public setAllOverlaysVisibility(visible: boolean): void {
        this.overlays.forEach(overlay => {
            this.setOverlayVisibility(overlay.id, visible);
        });
    }

    public destroy(): void {
        this.overlays.clear();
    }
}