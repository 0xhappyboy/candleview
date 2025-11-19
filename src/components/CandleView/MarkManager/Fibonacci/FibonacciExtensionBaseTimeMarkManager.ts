import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { FibonacciExtensionBaseTimeMark } from "../../Mark/Fibonacci/FibonacciExtensionBaseTimeMark";
import { IMarkManager } from "../../Mark/IMarkManager";
import { Point } from "../../types";

export interface FibonacciExtensionBaseTimeMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface FibonacciExtensionBaseTimeMarkState {
    isFibonacciExtensionBaseTimeMode: boolean;
    fibonacciExtensionBaseTimePoints: Point[];
    currentFibonacciExtensionBaseTime: FibonacciExtensionBaseTimeMark | null;
    isDragging: boolean;
    dragTarget: FibonacciExtensionBaseTimeMark | null;
    dragPoint: 'start' | 'end' | 'extension' | 'line' | null;
    drawingPhase: 'firstPoint' | 'secondPoint' | 'extensionPoint' | 'none';
}

export class FibonacciExtensionBaseTimeMarkManager implements IMarkManager<FibonacciExtensionBaseTimeMark> {
    private props: FibonacciExtensionBaseTimeMarkManagerProps;
    private state: FibonacciExtensionBaseTimeMarkState;
    private previewFibonacciExtensionBaseTimeMark: FibonacciExtensionBaseTimeMark | null = null;
    private FibonacciExtensionBaseTimeMarks: FibonacciExtensionBaseTimeMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;

    constructor(props: FibonacciExtensionBaseTimeMarkManagerProps) {
        this.props = props;
        this.state = {
            isFibonacciExtensionBaseTimeMode: false,
            fibonacciExtensionBaseTimePoints: [],
            currentFibonacciExtensionBaseTime: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none'
        };
    }

    public clearState(): void {
        this.state = {
            isFibonacciExtensionBaseTimeMode: false,
            fibonacciExtensionBaseTimePoints: [],
            currentFibonacciExtensionBaseTime: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none'
        };
    }

    public getMarkAtPoint(point: Point): FibonacciExtensionBaseTimeMark | null {
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

            for (const mark of this.FibonacciExtensionBaseTimeMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }

            for (const mark of this.FibonacciExtensionBaseTimeMarks) {
                const nearLine = mark.isPointNearFibonacciLine(relativeX, relativeY);
                if (nearLine !== null) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): FibonacciExtensionBaseTimeMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): FibonacciExtensionBaseTimeMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewFibonacciExtensionBaseTimeMark) {
            return this.previewFibonacciExtensionBaseTimeMark;
        }
        if (this.state.isFibonacciExtensionBaseTimeMode && this.state.currentFibonacciExtensionBaseTime) {
            return this.state.currentFibonacciExtensionBaseTime;
        }
        return null;
    }

    public getAllMarks(): FibonacciExtensionBaseTimeMark[] {
        return [...this.FibonacciExtensionBaseTimeMarks];
    }

    public cancelOperationMode() {
        return this.cancelFibonacciExtensionMode();
    }

    public setFibonacciExtensionBaseTimeMode = (): FibonacciExtensionBaseTimeMarkState => {
        this.state = {
            ...this.state,
            isFibonacciExtensionBaseTimeMode: true,
            fibonacciExtensionBaseTimePoints: [],
            currentFibonacciExtensionBaseTime: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'firstPoint'
        };
        return this.state;
    };

    public cancelFibonacciExtensionMode = (): FibonacciExtensionBaseTimeMarkState => {
        if (this.previewFibonacciExtensionBaseTimeMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciExtensionBaseTimeMark);
            this.previewFibonacciExtensionBaseTimeMark = null;
        }
        this.FibonacciExtensionBaseTimeMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isFibonacciExtensionBaseTimeMode: false,
            fibonacciExtensionBaseTimePoints: [],
            currentFibonacciExtensionBaseTime: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none'
        };
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): FibonacciExtensionBaseTimeMarkState => {
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

            for (const mark of this.FibonacciExtensionBaseTimeMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    this.state = {
                        ...this.state,
                        isFibonacciExtensionBaseTimeMode: true,
                        isDragging: true,
                        dragTarget: mark,
                        dragPoint: handleType
                    };
                    this.FibonacciExtensionBaseTimeMarks.forEach(m => {
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
                for (const mark of this.FibonacciExtensionBaseTimeMarks) {
                    const nearLine = mark.isPointNearFibonacciLine(relativeX, relativeY);
                    if (nearLine !== null) {
                        this.state = {
                            ...this.state,
                            isFibonacciExtensionBaseTimeMode: true,
                            isDragging: true,
                            dragTarget: mark,
                            dragPoint: 'line'
                        };
                        this.FibonacciExtensionBaseTimeMarks.forEach(m => {
                            m.setShowHandles(m === mark);
                        });
                        mark.setDragging(true, 'line');
                        this.isOperating = true;
                        lineFound = true;
                        break;
                    }
                }

                if (!lineFound && this.state.isFibonacciExtensionBaseTimeMode) {
                    const currentPoints = [...this.state.fibonacciExtensionBaseTimePoints];
                    if (this.state.drawingPhase === 'firstPoint') {
                        currentPoints.push(point);
                        this.state = {
                            ...this.state,
                            fibonacciExtensionBaseTimePoints: currentPoints,
                            drawingPhase: 'secondPoint'
                        };
                        this.previewFibonacciExtensionBaseTimeMark = new FibonacciExtensionBaseTimeMark(
                            time, time, time,
                            price, price, price,
                            '#2962FF', 1, true, 3
                        );
                        if (chartSeries.series.attachPrimitive) {
                            chartSeries.series.attachPrimitive(this.previewFibonacciExtensionBaseTimeMark);
                        }
                        this.FibonacciExtensionBaseTimeMarks.forEach(m => m.setShowHandles(false));
                    } else if (this.state.drawingPhase === 'secondPoint') {
                        if (this.previewFibonacciExtensionBaseTimeMark && currentPoints.length === 1) {
                            this.previewFibonacciExtensionBaseTimeMark.updateEndPoint(time, price);
                            currentPoints.push(point);
                            this.state = {
                                ...this.state,
                                fibonacciExtensionBaseTimePoints: currentPoints,
                                drawingPhase: 'extensionPoint'
                            };
                        }
                    } else if (this.state.drawingPhase === 'extensionPoint') {
                        if (this.previewFibonacciExtensionBaseTimeMark && currentPoints.length === 2) {
                            const startTime = this.previewFibonacciExtensionBaseTimeMark.getStartTime();
                            const endTime = this.previewFibonacciExtensionBaseTimeMark.getEndTime();
                            const startPrice = this.previewFibonacciExtensionBaseTimeMark.getStartPrice();
                            const endPrice = this.previewFibonacciExtensionBaseTimeMark.getEndPrice();

                            if (chartSeries.series.detachPrimitive) {
                                chartSeries.series.detachPrimitive(this.previewFibonacciExtensionBaseTimeMark);
                            }

                            const finalFibonacciExtensionBaseTimeMark = new FibonacciExtensionBaseTimeMark(
                                startTime, endTime, time,
                                startPrice, endPrice, price,
                                '#2962FF', 1, false, 3
                            );

                            if (chartSeries.series.attachPrimitive) {
                                chartSeries.series.attachPrimitive(finalFibonacciExtensionBaseTimeMark);
                            }

                            this.FibonacciExtensionBaseTimeMarks.push(finalFibonacciExtensionBaseTimeMark);
                            this.previewFibonacciExtensionBaseTimeMark = null;

                            if (finalFibonacciExtensionBaseTimeMark.setShowHandles) {
                                finalFibonacciExtensionBaseTimeMark.setShowHandles(true);
                            }

                            this.state = {
                                ...this.state,
                                isFibonacciExtensionBaseTimeMode: false,
                                fibonacciExtensionBaseTimePoints: [],
                                currentFibonacciExtensionBaseTime: null,
                                isDragging: false,
                                dragTarget: null,
                                dragPoint: null,
                                drawingPhase: 'none'
                            };
                            this.isOperating = false;

                            if (this.props.onCloseDrawing) {
                                this.props.onCloseDrawing();
                            }
                        }
                    }
                } else if (!this.state.isFibonacciExtensionBaseTimeMode) {
                    this.FibonacciExtensionBaseTimeMarks.forEach(mark => {
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

            if (this.state.isDragging && this.state.dragTarget && this.dragStartData &&
                (this.state.dragPoint === 'start' || this.state.dragPoint === 'end' || this.state.dragPoint === 'extension')) {

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

                const deltaY = currentY - currentStartY;
                const deltaX = currentX - currentStartX;

                if (this.state.dragTarget.dragHandleByPixels) {
                    this.state.dragTarget.dragHandleByPixels(deltaX, deltaY, this.state.dragPoint);
                    if (this.state.dragPoint === 'extension') {
                        setTimeout(() => {
                            if (this.state.dragTarget && this.state.dragTarget.adjustChartTimeRangeForExtension) {
                                this.state.dragTarget.adjustChartTimeRangeForExtension();
                            }
                        }, 10);
                    }
                }
                this.dragStartData = { time, price };
                return;
            }

            if (this.state.isDragging && this.state.dragTarget && this.dragStartData &&
                this.state.dragPoint === 'line') {

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

                const deltaY = currentY - currentStartY;
                const deltaX = currentX - currentStartX;

                if (this.state.dragTarget.dragLineByPixels) {
                    this.state.dragTarget.dragLineByPixels(deltaX, deltaY);
                }
                this.dragStartData = { time, price };
                return;
            }

            if (!this.state.isDragging && this.state.isFibonacciExtensionBaseTimeMode && this.previewFibonacciExtensionBaseTimeMark) {
                if (this.state.drawingPhase === 'secondPoint') {
                    this.previewFibonacciExtensionBaseTimeMark.updateEndPoint(time, price);
                } else if (this.state.drawingPhase === 'extensionPoint') {
                    this.previewFibonacciExtensionBaseTimeMark.updateExtensionPoint(time, price);
                }
            }

            if (!this.state.isFibonacciExtensionBaseTimeMode && !this.state.isDragging) {
                let anyLineHovered = false;
                for (const mark of this.FibonacciExtensionBaseTimeMarks) {
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
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): FibonacciExtensionBaseTimeMarkState => {
        if (this.state.isDragging) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDragging(false, null);
            }

            if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end' || this.state.dragPoint === 'extension' || this.state.dragPoint === 'line') {
                this.state = {
                    ...this.state,
                    isFibonacciExtensionBaseTimeMode: false,
                    isDragging: false,
                    dragTarget: null,
                    dragPoint: null
                };
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            } else {
                this.state = {
                    ...this.state,
                    isDragging: false,
                    dragTarget: null,
                    dragPoint: null
                };
            }
            this.isOperating = false;
        }
        this.dragStartData = null;
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): FibonacciExtensionBaseTimeMarkState => {
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
            } else if (this.state.isFibonacciExtensionBaseTimeMode) {
                return this.cancelFibonacciExtensionMode();
            }
        }
        return this.state;
    };

    public getState(): FibonacciExtensionBaseTimeMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<FibonacciExtensionBaseTimeMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewFibonacciExtensionBaseTimeMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciExtensionBaseTimeMark);
            this.previewFibonacciExtensionBaseTimeMark = null;
        }
        this.FibonacciExtensionBaseTimeMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.FibonacciExtensionBaseTimeMarks = [];
    }

    public getFibonacciExtensionBaseTimeMarks(): FibonacciExtensionBaseTimeMark[] {
        return [...this.FibonacciExtensionBaseTimeMarks];
    }

    public removeFibonacciExtensionBaseTimeMark(mark: FibonacciExtensionBaseTimeMark): void {
        const index = this.FibonacciExtensionBaseTimeMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.FibonacciExtensionBaseTimeMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isFibonacciExtensionBaseTimeMode;
    }
}