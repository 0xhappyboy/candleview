import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { FibonacciExtensionMark } from "../Graph/Fibonacci/FibonacciExtensionMark";
import { IMarkManager } from "../IMarkManager";

export interface FibonacciExtensionMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface FibonacciExtensionMarkState {
    isFibonacciExtensionMode: boolean;
    fibonacciExtensionPoints: Point[]; // [start, end, extension]
    currentFibonacciExtension: FibonacciExtensionMark | null;
    isDragging: boolean;
    dragTarget: FibonacciExtensionMark | null;
    dragPoint: 'start' | 'end' | 'extension' | 'line' | null;
    drawingPhase: 'firstPoint' | 'secondPoint' | 'extensionPoint' | 'none';
}

export class FibonacciExtensionMarkManager implements IMarkManager<FibonacciExtensionMark> {
    private props: FibonacciExtensionMarkManagerProps;
    private state: FibonacciExtensionMarkState;
    private previewFibonacciExtensionMark: FibonacciExtensionMark | null = null;
    private fibonacciExtensionMarks: FibonacciExtensionMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;

    constructor(props: FibonacciExtensionMarkManagerProps) {
        this.props = props;
        this.state = {
            isFibonacciExtensionMode: false,
            fibonacciExtensionPoints: [],
            currentFibonacciExtension: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none'
        };
    }

    public getMarkAtPoint(point: Point): FibonacciExtensionMark | null {
        const { chartSeries, chart, containerRef } = this.props;
        if (!chartSeries || !chart) return null;
        try {
            const chartElement = chart.chartElement();
            if (!chartElement) return null;
            const chartRect = chartElement.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();
            if (!containerRect) return null;
            const relativeX = point.x - (containerRect.left - chartRect.left);
            const relativeY = point.y - (containerRect.top - chartRect.top);
            for (const mark of this.fibonacciExtensionMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }
            for (const mark of this.fibonacciExtensionMarks) {
                const nearLine = mark.isPointNearFibonacciLine(relativeX, relativeY);
                if (nearLine !== null) {
                    return mark;
                }
            }
        } catch (error) {
            console.error('Error getting mark at point:', error);
        }
        return null;
    }

    public getCurrentDragTarget(): FibonacciExtensionMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): FibonacciExtensionMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewFibonacciExtensionMark) {
            return this.previewFibonacciExtensionMark;
        }
        if (this.state.isFibonacciExtensionMode && this.state.currentFibonacciExtension) {
            return this.state.currentFibonacciExtension;
        }
        return null;
    }

    public getAllMarks(): FibonacciExtensionMark[] {
        return [...this.fibonacciExtensionMarks];
    }

    public cancelOperationMode() {
        return this.cancelFibonacciExtensionMode();
    }

    public setFibonacciExtensionMode = (): FibonacciExtensionMarkState => {
        this.state = {
            ...this.state,
            isFibonacciExtensionMode: true,
            fibonacciExtensionPoints: [],
            currentFibonacciExtension: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'firstPoint'
        };
        return this.state;
    };

    public cancelFibonacciExtensionMode = (): FibonacciExtensionMarkState => {
        if (this.previewFibonacciExtensionMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciExtensionMark);
            this.previewFibonacciExtensionMark = null;
        }
        this.fibonacciExtensionMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isFibonacciExtensionMode: false,
            fibonacciExtensionPoints: [],
            currentFibonacciExtension: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none'
        };
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): FibonacciExtensionMarkState => {
        const { chartSeries, chart, containerRef } = this.props;
        if (!chartSeries || !chart) {
            return this.state;
        }
        try {
            const chartElement = chart.chartElement();
            if (!chartElement) return this.state;
            const chartRect = chartElement.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();
            if (!containerRect) return this.state;
            const relativeX = point.x - (containerRect.left - chartRect.left);
            const relativeY = point.y - (containerRect.top - chartRect.top);
            const timeScale = chart.timeScale();
            let price: number | null = null;
            let time: number | null = null;
            try {
                time = timeScale.coordinateToTime(relativeX);
                if (chartSeries.series && typeof chartSeries.series.coordinateToPrice === 'function') {
                    price = chartSeries.series.coordinateToPrice(relativeY);
                } else {
                    price = this.coordinateToPriceFallback(relativeY);
                }
            } catch (error) {
                return this.state;
            }
            if (time === null || price === null) {
                return this.state;
            }
            this.dragStartData = { time, price };
            let handleFound = false;
            for (const mark of this.fibonacciExtensionMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    this.state = {
                        ...this.state,
                        isFibonacciExtensionMode: true,
                        isDragging: true,
                        dragTarget: mark,
                        dragPoint: handleType
                    };
                    this.fibonacciExtensionMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                    });
                    mark.setDragging(true, handleType);
                    this.isOperating = true;
                    handleFound = true;
                    break;
                }
            }
            if (!handleFound) {
                let lineFound = false;
                for (const mark of this.fibonacciExtensionMarks) {
                    const nearLine = mark.isPointNearFibonacciLine(relativeX, relativeY);
                    if (nearLine !== null) {
                        this.state = {
                            ...this.state,
                            isFibonacciExtensionMode: true,
                            isDragging: true,
                            dragTarget: mark,
                            dragPoint: 'line'
                        };
                        this.fibonacciExtensionMarks.forEach(m => {
                            m.setShowHandles(m === mark);
                        });
                        mark.setDragging(true, 'line');
                        this.isOperating = true;
                        lineFound = true;
                        break;
                    }
                }
                if (!lineFound && this.state.isFibonacciExtensionMode) {
                    const currentPoints = [...this.state.fibonacciExtensionPoints];
                    if (this.state.drawingPhase === 'firstPoint') {
                        currentPoints.push(point);
                        this.state = {
                            ...this.state,
                            fibonacciExtensionPoints: currentPoints,
                            drawingPhase: 'secondPoint'
                        };
                        this.previewFibonacciExtensionMark = new FibonacciExtensionMark(
                            price, price, price,
                            time.toString(), time.toString(), time.toString(),
                            '#2962FF', 1, true, 3
                        );
                        if (chartSeries.series.attachPrimitive) {
                            chartSeries.series.attachPrimitive(this.previewFibonacciExtensionMark);
                        }
                        this.fibonacciExtensionMarks.forEach(m => m.setShowHandles(false));
                    } else if (this.state.drawingPhase === 'secondPoint') {
                        if (this.previewFibonacciExtensionMark && currentPoints.length === 1) {
                            this.previewFibonacciExtensionMark.updateEndPoint(price, time.toString());
                            currentPoints.push(point);
                            this.state = {
                                ...this.state,
                                fibonacciExtensionPoints: currentPoints,
                                drawingPhase: 'extensionPoint'
                            };
                        }
                    } else if (this.state.drawingPhase === 'extensionPoint') {
                        if (this.previewFibonacciExtensionMark && currentPoints.length === 2) {
                            const startPrice = this.previewFibonacciExtensionMark.getStartPrice();
                            const endPrice = this.previewFibonacciExtensionMark.getEndPrice();
                            const startTime = this.previewFibonacciExtensionMark.getStartTime();
                            const endTime = this.previewFibonacciExtensionMark.getEndTime();
                            if (chartSeries.series.detachPrimitive) {
                                chartSeries.series.detachPrimitive(this.previewFibonacciExtensionMark);
                            }
                            const finalFibonacciExtensionMark = new FibonacciExtensionMark(
                                startPrice, endPrice, price,
                                startTime, endTime, time.toString(),
                                '#2962FF', 1, false, 3
                            );
                            if (chartSeries.series.attachPrimitive) {
                                chartSeries.series.attachPrimitive(finalFibonacciExtensionMark);
                            }
                            this.fibonacciExtensionMarks.push(finalFibonacciExtensionMark);
                            this.previewFibonacciExtensionMark = null;
                            if (finalFibonacciExtensionMark.setShowHandles) {
                                finalFibonacciExtensionMark.setShowHandles(true);
                            }
                            this.state = {
                                ...this.state,
                                isFibonacciExtensionMode: false,
                                fibonacciExtensionPoints: [],
                                currentFibonacciExtension: null,
                                drawingPhase: 'none'
                            };
                            if (this.props.onCloseDrawing) {
                                this.props.onCloseDrawing();
                            }
                        }
                    }
                } else if (!this.state.isFibonacciExtensionMode) {
                    this.fibonacciExtensionMarks.forEach(mark => {
                        if (mark.setShowHandles) {
                            mark.setShowHandles(false);
                        }
                    });
                }
            }
        } catch (error) {
            this.state = this.cancelFibonacciExtensionMode();
        }
        return this.state;
    };

    private coordinateToPriceFallback(y: number): number {
        const { chartSeries } = this.props;
        if (!chartSeries || !chartSeries.series) return 100;
        try {
            const data = chartSeries.series.data();
            if (data && data.length > 0) {
                let min = Number.MAX_VALUE;
                let max = Number.MIN_VALUE;
                data.forEach((item: any) => {
                    if (item.value !== undefined) {
                        if (item.value < min) min = item.value;
                        if (item.value > max) max = item.value;
                    }
                    if (item.low !== undefined && item.high !== undefined) {
                        if (item.low < min) min = item.low;
                        if (item.high > max) max = item.high;
                    }
                });
                if (min > max) {
                    min = 0;
                    max = 100;
                }
                const margin = (max - min) * 0.1;
                const chartElement = this.props.chart?.chartElement();
                const chartHeight = chartElement?.clientHeight || 500;
                const percent = 1 - (y / chartHeight);
                return min - margin + (max - min + 2 * margin) * percent;
            }
        } catch (error) {
        }
        return 100;
    }

    private priceToCoordinateFallback(price: number): number {
        const { chartSeries } = this.props;
        if (!chartSeries || !chartSeries.series) return 250;
        try {
            const data = chartSeries.series.data();
            if (data && data.length > 0) {
                let min = Number.MAX_VALUE;
                let max = Number.MIN_VALUE;
                data.forEach((item: any) => {
                    if (item.value !== undefined) {
                        if (item.value < min) min = item.value;
                        if (item.value > max) max = item.value;
                    }
                    if (item.low !== undefined && item.high !== undefined) {
                        if (item.low < min) min = item.low;
                        if (item.high > max) max = item.high;
                    }
                });
                if (min > max) {
                    min = 0;
                    max = 100;
                }
                const margin = (max - min) * 0.1;
                const chartElement = this.props.chart?.chartElement();
                const chartHeight = chartElement?.clientHeight || 500;
                const normalizedPrice = Math.max(min - margin, Math.min(max + margin, price));
                const percent = (normalizedPrice - (min - margin)) / ((max + margin) - (min - margin));
                return chartHeight * (1 - percent);
            }
        } catch (error) {
        }
        return 250;
    }

    public handleMouseMove = (point: Point): void => {
        const { chartSeries, chart, containerRef } = this.props;
        if (!chartSeries || !chart) return;

        try {
            const chartElement = chart.chartElement();
            if (!chartElement) return;
            const chartRect = chartElement.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();
            if (!containerRect) return;

            const relativeX = point.x - (containerRect.left - chartRect.left);
            const relativeY = point.y - (containerRect.top - chartRect.top);
            const timeScale = chart.timeScale();
            let price: number | null = null;
            let time: number | null = null;
            try {
                time = timeScale.coordinateToTime(relativeX);
                if (chartSeries.series && typeof chartSeries.series.coordinateToPrice === 'function') {
                    price = chartSeries.series.coordinateToPrice(relativeY);
                } else {
                    price = this.coordinateToPriceFallback(relativeY);
                }
            } catch (error) {
                return;
            }
            if (time === null || price === null) return;
            if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
                let currentStartY: number | null = null;
                let currentY: number | null = null;
                let currentStartX: number | null = null;
                let currentX: number | null = null;
                if (chartSeries.series && typeof chartSeries.series.priceToCoordinate === 'function') {
                    currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                    currentY = chartSeries.series.priceToCoordinate(price);
                } else {
                    currentStartY = this.priceToCoordinateFallback(this.dragStartData.price);
                    currentY = this.priceToCoordinateFallback(price);
                }
                currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
                currentX = timeScale.timeToCoordinate(time);
                if (currentStartY === null || currentY === null || currentStartX === null || currentX === null) return;
                // Reduce drag sensitivity
                const sensitivity = 0.5; // Reduce sensitivity to 50%
                const deltaY = (currentY - currentStartY) * sensitivity;
                const deltaX = (currentX - currentStartX) * sensitivity;
                if (this.state.dragPoint === 'line') {
                    if (this.state.dragTarget.dragLineByPixels) {
                        this.state.dragTarget.dragLineByPixels(deltaY, deltaX);
                    }
                } else if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end' || this.state.dragPoint === 'extension') {
                    if (this.state.dragTarget.dragHandleByPixels) {
                        this.state.dragTarget.dragHandleByPixels(deltaY, deltaX, this.state.dragPoint);
                        if (this.state.dragPoint === 'extension') {
                            setTimeout(() => {
                                if (this.state.dragTarget && this.state.dragTarget.adjustChartPriceRangeForExtension) {
                                    this.state.dragTarget.adjustChartPriceRangeForExtension();
                                }
                            }, 10);
                        }
                    }
                }
                this.dragStartData = { time, price };
                return;
            }
            if (!this.state.isDragging && this.state.isFibonacciExtensionMode && this.previewFibonacciExtensionMark) {
                if (this.state.drawingPhase === 'secondPoint') {
                    this.previewFibonacciExtensionMark.updateEndPoint(price, time.toString());
                } else if (this.state.drawingPhase === 'extensionPoint') {
                    this.previewFibonacciExtensionMark.updateExtensionPoint(price, time.toString());
                }
                try {
                    if (chart.timeScale().widthChanged) {
                        chart.timeScale().widthChanged();
                    }
                } catch (e) {
                }
            }
            if (!this.state.isFibonacciExtensionMode && !this.state.isDragging) {
                let anyLineHovered = false;
                for (const mark of this.fibonacciExtensionMarks) {
                    const handleType = mark.isPointNearHandle(relativeX, relativeY);
                    const isNearLine = mark.isPointNearFibonacciLine(relativeX, relativeY) !== null;
                    const shouldShow = !!handleType || isNearLine;
                    if (mark.setShowHandles) {
                        mark.setShowHandles(shouldShow);
                    }
                    if (shouldShow) anyLineHovered = true;
                }
            }
        } catch (error) {
        }
    };

    public handleMouseUp = (point: Point): FibonacciExtensionMarkState => {
        if (this.state.isDragging) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDragging(false, null);
            }
            this.state = {
                ...this.state,
                isDragging: false,
                dragTarget: null,
                dragPoint: null
            };
            this.isOperating = false;
        }
        this.dragStartData = null;
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): FibonacciExtensionMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isDragging) {
                if (this.state.dragTarget) {
                    this.state.dragTarget.setDragging(false, null);
                }
                this.state = {
                    ...this.state,
                    isDragging: false,
                    dragTarget: null,
                    dragPoint: null
                };
            } else if (this.state.isFibonacciExtensionMode) {
                return this.cancelFibonacciExtensionMode();
            }
        }
        return this.state;
    };

    public getState(): FibonacciExtensionMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<FibonacciExtensionMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewFibonacciExtensionMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciExtensionMark);
            this.previewFibonacciExtensionMark = null;
        }
        this.fibonacciExtensionMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.fibonacciExtensionMarks = [];
    }

    public getFibonacciExtensionMarks(): FibonacciExtensionMark[] {
        return [...this.fibonacciExtensionMarks];
    }

    public removeFibonacciExtensionMark(mark: FibonacciExtensionMark): void {
        const index = this.fibonacciExtensionMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.fibonacciExtensionMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isFibonacciExtensionMode;
    }
}