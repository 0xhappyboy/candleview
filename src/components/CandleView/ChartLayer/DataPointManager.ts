import { ChartSeries } from "./ChartTypeManager";

export interface DataPoint {
    index: number;
    canvasX: number;
    canvasY: number;
    time: string;
    value: number;
    data: {
        open: number;
        high: number;
        low: number;
        close: number;
    };
}

export interface ViewportPoint extends DataPoint {
    viewportX: number;
    viewportY: number;
}

export interface DataPointManagerConfig {
    container: HTMLElement;
    canvas: HTMLCanvasElement;
    chart: any,
    chartSeries: ChartSeries | null,
    chartData: Array<{
        time: string;
        value: number;
        open: number;
        high: number;
        low: number;
        close: number;
    }>;
    getChartPriceRange: () => { min: number; max: number } | null;
    coordinateToTime: (x: number) => string;
    coordinateToPrice: (y: number) => number;
}

export class DataPointManager {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private chartData: Array<{
        time: string;
        value: number;
        open: number;
        high: number;
        low: number;
        close: number;
    }>;
    private getChartPriceRange: () => { min: number; max: number } | null;
    private coordinateToTime: (x: number) => string;
    private coordinateToPrice: (y: number) => number;
    private chart: any = null;
    private currentSeries: ChartSeries | null = null;

    constructor(config: DataPointManagerConfig) {
        this.container = config.container;
        this.canvas = config.canvas;
        this.chartData = config.chartData;
        this.getChartPriceRange = config.getChartPriceRange;
        this.coordinateToTime = config.coordinateToTime;
        this.coordinateToPrice = config.coordinateToPrice;
        this.chart = config.chart;
        this.currentSeries = config.chartSeries;
    }

    // 根据索引获取数据点在Canvas中的坐标
    public getDataPointInCanvasByIndex(index: number): DataPoint | null {
        if (!this.canvas || !this.chartData || this.chartData.length === 0) {
            return null;
        }
        if (index < 0 || index >= this.chartData.length) {
            return null;
        }
        const dataPoint = this.chartData[index];
        const priceRange = this.getChartPriceRange();
        if (!priceRange) return null;
        const containerRect = this.container.getBoundingClientRect();
        const chartAreaLeft = 0;
        const chartAreaTop = 0;
        const chartAreaWidth = containerRect.width - 58;
        const chartAreaHeight = containerRect.height - 28;
        // 修复X坐标计算：使用 lightweight-charts 原生的坐标转换
        let canvasX: number;
        // 如果存在chart实例，优先使用原生的timeToCoordinate方法
        if (this.chart && this.chart.timeScale) {
            const timeScale = this.chart.timeScale();
            if (timeScale && typeof timeScale.timeToCoordinate === 'function') {
                const nativeX = timeScale.timeToCoordinate(dataPoint.time);
                if (nativeX !== null && nativeX !== undefined) {
                    canvasX = nativeX;
                } else {
                    throw new Error('原生坐标返回null');
                }
            } else {
                throw new Error('timeScale不可用');
            }
        } else {
            const xPositionRatio = index / Math.max(1, (this.chartData.length - 1));
            canvasX = chartAreaLeft + (xPositionRatio * chartAreaWidth);
        }
        const canvasY = this.currentSeries?.series.priceToCoordinate(dataPoint.high) - 70;
        console.log(`数据点坐标计算: index=${index}, x=${canvasX.toFixed(2)}, y=${canvasY.toFixed(2)}, close=${dataPoint.close}`);
        return {
            index,
            canvasX,
            canvasY,
            time: dataPoint.time,
            value: dataPoint.value,
            data: {
                open: dataPoint.open,
                high: dataPoint.high,
                low: dataPoint.low,
                close: dataPoint.close
            }
        };
    }

    // 根据索引获取数据点在视口中的坐标
    public getDataPointInViewportByIndex(index: number): ViewportPoint | null {
        const canvasPoint = this.getDataPointInCanvasByIndex(index);
        if (!canvasPoint) return null;

        const containerRect = this.container.getBoundingClientRect();
        const viewportX = containerRect.left + canvasPoint.canvasX;
        const viewportY = containerRect.top + canvasPoint.canvasY;

        return {
            ...canvasPoint,
            viewportX,
            viewportY
        };
    }

    /**
     * 获取所有数据点在Canvas中的坐标
     */
    public getAllDataPointsInCanvas(): DataPoint[] {
        if (!this.canvas || !this.container || !this.chartData || this.chartData.length === 0) {
            return [];
        }

        const priceRange = this.getChartPriceRange();
        if (!priceRange) return [];

        const containerRect = this.container.getBoundingClientRect();
        const chartAreaWidth = containerRect.width - 58;
        const chartAreaHeight = containerRect.height - 28;

        const points: DataPoint[] = [];
        for (let i = 0; i < this.chartData.length; i++) {
            const dataPoint = this.chartData[i];
            const xPositionRatio = i / (this.chartData.length - 1);
            const canvasX = xPositionRatio * chartAreaWidth;

            const priceRangeSize = priceRange.max - priceRange.min;
            const pricePositionRatio = (dataPoint.close - priceRange.min) / priceRangeSize;
            const canvasY = chartAreaHeight - (pricePositionRatio * chartAreaHeight);
            points.push({
                index: i,
                canvasX,
                canvasY,
                time: dataPoint.time,
                value: dataPoint.value,
                data: {
                    open: dataPoint.open,
                    high: dataPoint.high,
                    low: dataPoint.low,
                    close: dataPoint.close
                }
            });
        }
        return points;
    }

    /**
     * 获取所有数据点在视口中的坐标
     */
    public getAllDataPointsInViewport(): ViewportPoint[] {
        const canvasPoints = this.getAllDataPointsInCanvas();
        const containerRect = this.container.getBoundingClientRect();
        return canvasPoints.map(point => ({
            ...point,
            viewportX: containerRect.left + point.canvasX,
            viewportY: containerRect.top + point.canvasY
        }));
    }

    /**
     * 根据Canvas坐标获取最近的数据点
     */
    public getNearestDataPointByCanvasCoordinate(canvasX: number, canvasY: number): DataPoint | null {
        const allPoints = this.getAllDataPointsInCanvas();
        if (allPoints.length === 0) return null;
        let nearestPoint = allPoints[0];
        let minDistance = Number.MAX_SAFE_INTEGER;
        for (const point of allPoints) {
            const distance = Math.sqrt(
                Math.pow(point.canvasX - canvasX, 2) + Math.pow(point.canvasY - canvasY, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = point;
            }
        }
        return nearestPoint;
    }

    /**
     * 根据视口坐标获取最近的数据点
     */
    public getNearestDataPointByViewportCoordinate(viewportX: number, viewportY: number): ViewportPoint | null {
        const containerRect = this.container.getBoundingClientRect();
        const canvasX = viewportX - containerRect.left;
        const canvasY = viewportY - containerRect.top;

        const canvasPoint = this.getNearestDataPointByCanvasCoordinate(canvasX, canvasY);
        if (!canvasPoint) return null;

        return {
            ...canvasPoint,
            viewportX,
            viewportY
        };
    }

    /**
     * 获取价格对应的Canvas Y坐标
     */
    public priceToCoordinate(price: number): number {
        const containerRect = this.container.getBoundingClientRect();
        const chartAreaHeight = containerRect.height - 28;

        const priceRange = this.getChartPriceRange();
        if (!priceRange) return 0;

        const priceRangeSize = priceRange.max - priceRange.min;
        if (priceRangeSize <= 0) return chartAreaHeight / 2;

        const pricePositionRatio = (price - priceRange.min) / priceRangeSize;
        const yCoordinate = chartAreaHeight - (pricePositionRatio * chartAreaHeight);

        return yCoordinate;
    }

    /**
     * 获取时间对应的Canvas X坐标
     */
    public timeToCoordinate(time: string): number {
        const containerRect = this.container.getBoundingClientRect();
        const chartAreaWidth = containerRect.width - 58;

        const timeIndex = this.chartData.findIndex(data => data.time === time);
        if (timeIndex === -1) return 0;

        const xPositionRatio = timeIndex / (this.chartData.length - 1);
        return xPositionRatio * chartAreaWidth;
    }

    /**
     * 调试坐标计算
     */
    public debugCoordinateCalculation(): void {
        const firstPoint = this.getDataPointInCanvasByIndex(0);
        const lastPoint = this.getDataPointInCanvasByIndex(this.chartData.length - 1);
        console.log('坐标计算调试信息:');
        console.log('第一个数据点:', firstPoint);
        console.log('最后一个数据点:', lastPoint);
        console.log('容器尺寸:', this.container.getBoundingClientRect());
        console.log('Canvas尺寸:', this.canvas.getBoundingClientRect());
        console.log('价格范围:', this.getChartPriceRange());
    }

    /**
     * 更新图表数据
     */
    public updateChartData(chartData: Array<{
        time: string;
        value: number;
        open: number;
        high: number;
        low: number;
        close: number;
    }>): void {
        this.chartData = chartData;
    }

    /**
     * 更新容器和Canvas引用
     */
    public updateContainerAndCanvas(container: HTMLElement, canvas: HTMLCanvasElement): void {
        this.container = container;
        this.canvas = canvas;
    }
}