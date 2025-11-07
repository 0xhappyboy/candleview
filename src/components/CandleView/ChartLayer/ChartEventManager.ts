import { MouseEventParams } from "lightweight-charts";
import { ChartLayer } from ".";
import { MarkType, Point } from "../types";

export class ChartEventManager {
    constructor() {
    }
    public registerClickEvent(chart: any, callback: (event: MouseEventParams) => void): void {
        chart.subscribeClick((event: MouseEventParams) => callback(event));
    }
    public registerDblClickEvent(chart: any, callback: (event: MouseEventParams) => void): void {
        chart.subscribeDblClick((event: MouseEventParams) => callback(event));
    }
    public registerCrosshairMoveEvent(chart: any, callback: (event: MouseEventParams) => void): void {
        chart.subscribeCrosshairMove((event: MouseEventParams) => callback(event));
    }
    public registerVisibleTimeRangeChangeEvent(chart: any, callback: (event: { from: number, to: number } | null) => void): void {
        chart.timeScale().subscribeVisibleTimeRangeChange((event: { from: number, to: number } | null) => callback(event));
    }
    public registerVisibleLogicalRangeChangeEvent(chart: any, callback: (event: { from: number, to: number } | null) => void): void {
        chart.timeScale().subscribeVisibleLogicalRangeChange((event: { from: number, to: number } | null) => callback(event));
    }
    // =============================== Keyboard events start ===============================
    public handleKeyDown = (chartLayer: ChartLayer, event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (chartLayer.state.currentMarkMode === MarkType.LineSegment) {
                const newState = chartLayer.lineSegmentMarkManager.handleKeyDown(event);
                chartLayer.setState({
                    isLineSegmentMarkMode: newState.isLineSegmentMarkMode,
                    lineSegmentMarkStartPoint: newState.lineSegmentMarkStartPoint,
                    currentLineSegmentMark: newState.currentLineSegmentMark
                });
            }
        }
    };
    // =============================== Keyboard events end ===============================

    // =============================== mouse events start ===============================
    public mouseUp(chartLayer: ChartLayer, event: MouseEvent) { }

    public mouseMove(chartLayer: ChartLayer, event: MouseEvent) {

    }

    public mouseDown(chartLayer: ChartLayer, event: MouseEvent) {
        if (!chartLayer.containerRef.current || !chartLayer.containerRef.current.contains(event.target as Node)) {
            return;
        }
        const point = this.getMousePosition(chartLayer, event);
        if (!point) return;
        if (chartLayer.state.currentMarkMode === MarkType.Emoji && chartLayer.state.pendingEmojiMark) {
            chartLayer.placeEmojiMark(point, chartLayer.state.pendingEmojiMark);
            event.preventDefault();
            event.stopPropagation();
            if (chartLayer.props.onCloseDrawing) {
                chartLayer.props.onCloseDrawing();
            }
            return;
        }
        if (chartLayer.state.currentMarkMode === MarkType.Text) {
            chartLayer.placeTextMark(point);
            event.preventDefault();
            event.stopPropagation();
            if (chartLayer.props.onCloseDrawing) {
                chartLayer.props.onCloseDrawing();
            }
            return;
        }
    }

    public documentMouseDown(chartLayer: ChartLayer, event: MouseEvent) {
        if (!chartLayer.containerRef.current) return;
        const rect = chartLayer.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
            const point = this.getMousePosition(chartLayer, event);
            // 线段处理
            if (point) {
                const newState = chartLayer.lineSegmentMarkManager.handleMouseDown(point);
                chartLayer.setState({
                    lineSegmentMarkStartPoint: newState.lineSegmentMarkStartPoint,
                    currentLineSegmentMark: newState.currentLineSegmentMark,
                    isLineSegmentMarkMode: newState.isLineSegmentMarkMode
                });
                // 如果正在操作线段，阻止事件冒泡
                if (chartLayer.lineSegmentMarkManager.isOperatingOnChart()) {
                    chartLayer.disableChartMovement();
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return;
                }
            }
            return;
        }
    };

    public documentMouseMove(chartLayer: ChartLayer, event: MouseEvent) {
        if (!chartLayer.containerRef.current) return;
        const rect = chartLayer.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
            const point = { x, y };
            chartLayer.setState({ mousePosition: point });
            this.updateCurrentOHLC(chartLayer, point);
            // 直线标记模式
            chartLayer.lineSegmentMarkManager.handleMouseMove(point);
            if (chartLayer.lineSegmentMarkManager.isOperatingOnChart()) {
                event.preventDefault();
                event.stopPropagation();
            }
            return;
        }
    };

    public documentMouseUp(chartLayer: ChartLayer, event: MouseEvent) {
        chartLayer.enableChartMovement();
        if (!chartLayer.containerRef.current) return;
        const rect = chartLayer.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
            const point = this.getMousePosition(chartLayer, event);
            if (point) {
                const newState = chartLayer.lineSegmentMarkManager.handleMouseUp(point);
                chartLayer.setState({
                    lineSegmentMarkStartPoint: newState.lineSegmentMarkStartPoint,
                    currentLineSegmentMark: newState.currentLineSegmentMark,
                    isLineSegmentMarkMode: newState.isLineSegmentMarkMode
                });
            }
            return;
        }
    };

    public documentMouseWheel(chartLayer: ChartLayer, event: MouseEvent) {
        if (!chartLayer.containerRef.current) return;
        const rect = chartLayer.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Mouse in drawing area
        if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
            if (this.isPriceArea(x, rect.width)) {
                this.handleDocumentMainChartPriceAreaMouseWheel(event);
            }
            if (this.isTimeArea(y, rect.height)) {
                this.handleDocumentMainChartTimeAreaMouseWheel(event);
            }
            if (this.isChartArea(x, y, rect.width, rect.height)) {
                this.handleDocumentMainChartAreaMouseWheel(event);
            }
        }
    };
    private getMousePosition(chartLayer: ChartLayer, event: MouseEvent): Point | null {
        if (!chartLayer.containerRef.current) {
            return null;
        }
        const rect = chartLayer.containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const isInside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
        if (!isInside) {
            return null;
        }
        return { x, y };
    }
    // =============================== mouse events end===============================

    // =============================== text mark start ===============================
    private handleLineMarkMouseDown = (chartLayer: ChartLayer, point: Point) => {
        const newState = chartLayer.lineSegmentMarkManager.handleMouseDown(point);
        chartLayer.setState({
            lineSegmentMarkStartPoint: newState.lineSegmentMarkStartPoint,
            currentLineSegmentMark: newState.currentLineSegmentMark,
            isLineSegmentMarkMode: newState.isLineSegmentMarkMode
        });
    };
    // =============================== text mark end ===============================


    private updateCurrentOHLC = (chartLayer: ChartLayer, point: Point) => {
        const { chartData } = chartLayer.props;
        if (!chartData || chartData.length === 0) return;
        const canvas = chartLayer.canvasRef.current;
        if (!canvas) return;
        const timeIndex = Math.floor((point.x / canvas.width) * chartData.length);
        if (timeIndex >= 0 && timeIndex < chartData.length) {
            const dataPoint = chartData[timeIndex];
            if (dataPoint.open !== undefined && dataPoint.high !== undefined &&
                dataPoint.low !== undefined && dataPoint.close !== undefined) {
                chartLayer.setState({
                    currentOHLC: {
                        time: dataPoint.time,
                        open: dataPoint.open,
                        high: dataPoint.high,
                        low: dataPoint.low,
                        close: dataPoint.close
                    }
                });
            } else {
                this.calculateOHLCFromCoordinates(chartLayer, point, timeIndex);
            }
        }
    };

    private calculateOHLCFromCoordinates = (chartLayer: ChartLayer, point: Point, timeIndex: number) => {
        const canvas = chartLayer.canvasRef.current;
        const container = chartLayer.containerRef.current;
        if (!canvas || !container) return;
        const { chartData } = chartLayer.props;
        const dataPoint = chartData[timeIndex];
        const priceRange = this.getChartPriceRange(chartLayer);
        const timeRange = chartData.length;
        if (!priceRange) return;
        const priceAtMouse = this.coordinateToPrice(chartLayer, point.y);
        const basePrice = dataPoint.value || priceAtMouse;
        const volatility = 0.02;
        const open = basePrice;
        const high = basePrice * (1 + volatility);
        const low = basePrice * (1 - volatility);
        const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
        chartLayer.setState({
            currentOHLC: {
                time: dataPoint.time,
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(close.toFixed(2))
            }
        });
    };

    private getChartPriceRange = (chartLayer: ChartLayer,): { min: number; max: number } | null => {
        const { chartData } = chartLayer.props;
        if (!chartData || chartData.length === 0) return null;

        let minPrice = Number.MAX_VALUE;
        let maxPrice = Number.MIN_VALUE;

        chartData.forEach(item => {
            if (item.high > maxPrice) maxPrice = item.high;
            if (item.low < minPrice) minPrice = item.low;
        });

        if (minPrice > maxPrice) {
            minPrice = 0;
            maxPrice = 100;
        }

        const margin = (maxPrice - minPrice) * 0.1; // 10% 边距
        return {
            min: minPrice - margin,
            max: maxPrice + margin
        };
    };

    private coordinateToPrice = (chartLayer: ChartLayer, y: number): number => {
        const canvas = chartLayer.canvasRef.current;
        if (!canvas) return 100;
        const priceRange = this.getChartPriceRange(chartLayer);
        if (!priceRange) return 100;
        const percent = 1 - (y / canvas.height);
        return priceRange.min + (priceRange.max - priceRange.min) * percent;
    };


    private isChartArea = (x: number, y: number, w: number, h: number): boolean => {
        if (x <= w && x <= w - 58 && y <= h && y <= h - 28) {
            return true;
        }
        return false;
    }
    private isPriceArea = (x: number, w: number): boolean => {
        if (x <= w && x >= w - 58) {
            return true;
        }
        return false;
    }
    private isTimeArea = (y: number, h: number): boolean => {
        if (y <= h && y >= h - 28) {
            return true;
        }
        return false;
    }
    // Handle mouse wheel events for the price area of the main icon.
    private handleDocumentMainChartPriceAreaMouseWheel = (event: MouseEvent) => {
    }
    // Handle mouse scroll events for the time area in the main chart area.
    private handleDocumentMainChartTimeAreaMouseWheel = (event: MouseEvent) => {
    }
    // Handle mouse scroll events for the time area in the main chart area.
    private handleDocumentMainChartAreaMouseWheel = (event: MouseEvent) => {
    }
    // Handling of mouse click and move events for the main chart.
    private handleDocumentMainChartMouseDownMove = (event: MouseEvent) => {
    }
}