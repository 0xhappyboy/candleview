import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { FibonacciExtensionBasePriceMark } from "../../Mark/Fibonacci/FibonacciExtensionBasePriceMark";
import { IMarkManager } from "../../Mark/IMarkManager";
import { Point } from "../../types";

export interface FibonacciExtensionBasePriceMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface FibonacciExtensionBasePriceMarkState {
    isFibonacciExtensionBasePriceMode: boolean;
    fibonacciExtensionBasePricePoints: Point[];
    currentFibonacciExtensionBasePrice: FibonacciExtensionBasePriceMark | null;
    isDragging: boolean;
    dragTarget: FibonacciExtensionBasePriceMark | null;
    dragPoint: 'start' | 'end' | 'extension' | 'line' | null;
    drawingPhase: 'firstPoint' | 'secondPoint' | 'extensionPoint' | 'none';
}

export class FibonacciExtensionBasePriceMarkManager implements IMarkManager<FibonacciExtensionBasePriceMark> {
    private props: FibonacciExtensionBasePriceMarkManagerProps;
    private state: FibonacciExtensionBasePriceMarkState;
    private previewFibonacciExtensionBasePriceMark: FibonacciExtensionBasePriceMark | null = null;
    private FibonacciExtensionBasePriceMarks: FibonacciExtensionBasePriceMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;

    constructor(props: FibonacciExtensionBasePriceMarkManagerProps) {
        this.props = props;
        this.state = {
            isFibonacciExtensionBasePriceMode: false,
            fibonacciExtensionBasePricePoints: [],
            currentFibonacciExtensionBasePrice: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none'
        };
    }

    public clearState(): void {
        this.state = {
            isFibonacciExtensionBasePriceMode: false,
            fibonacciExtensionBasePricePoints: [],
            currentFibonacciExtensionBasePrice: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none'
        };
    }

    public getMarkAtPoint(point: Point): FibonacciExtensionBasePriceMark | null {
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
            for (const mark of this.FibonacciExtensionBasePriceMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }
            for (const mark of this.FibonacciExtensionBasePriceMarks) {
                const nearLine = mark.isPointNearFibonacciLine(relativeX, relativeY);
                if (nearLine !== null) {
                    return mark;
                }
            }
        } catch (error) {
        }
        return null;
    }

    public getCurrentDragTarget(): FibonacciExtensionBasePriceMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): FibonacciExtensionBasePriceMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewFibonacciExtensionBasePriceMark) {
            return this.previewFibonacciExtensionBasePriceMark;
        }
        if (this.state.isFibonacciExtensionBasePriceMode && this.state.currentFibonacciExtensionBasePrice) {
            return this.state.currentFibonacciExtensionBasePrice;
        }
        return null;
    }

    public getAllMarks(): FibonacciExtensionBasePriceMark[] {
        return [...this.FibonacciExtensionBasePriceMarks];
    }

    public cancelOperationMode() {
        return this.cancelFibonacciExtensionMode();
    }

    public setFibonacciExtensionBasePriceMode = (): FibonacciExtensionBasePriceMarkState => {
        this.state = {
            ...this.state,
            isFibonacciExtensionBasePriceMode: true,
            fibonacciExtensionBasePricePoints: [],
            currentFibonacciExtensionBasePrice: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'firstPoint'
        };
        return this.state;
    };

    public cancelFibonacciExtensionMode = (): FibonacciExtensionBasePriceMarkState => {
        if (this.previewFibonacciExtensionBasePriceMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciExtensionBasePriceMark);
            this.previewFibonacciExtensionBasePriceMark = null;
        }
        this.FibonacciExtensionBasePriceMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isFibonacciExtensionBasePriceMode: false,
            fibonacciExtensionBasePricePoints: [],
            currentFibonacciExtensionBasePrice: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none'
        };
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): FibonacciExtensionBasePriceMarkState => {
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
            for (const mark of this.FibonacciExtensionBasePriceMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    this.state = {
                        ...this.state,
                        isFibonacciExtensionBasePriceMode: true,
                        isDragging: true,
                        dragTarget: mark,
                        dragPoint: handleType
                    };
                    this.FibonacciExtensionBasePriceMarks.forEach(m => {
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
                for (const mark of this.FibonacciExtensionBasePriceMarks) {
                    const nearLine = mark.isPointNearFibonacciLine(relativeX, relativeY);
                    if (nearLine !== null) {
                        this.state = {
                            ...this.state,
                            isFibonacciExtensionBasePriceMode: true,
                            isDragging: true,
                            dragTarget: mark,
                            dragPoint: 'line'
                        };
                        this.FibonacciExtensionBasePriceMarks.forEach(m => {
                            m.setShowHandles(m === mark);
                        });
                        mark.setDragging(true, 'line');
                        this.isOperating = true;
                        lineFound = true;
                        break;
                    }
                }
                if (!lineFound && this.state.isFibonacciExtensionBasePriceMode) {
                    const currentPoints = [...this.state.fibonacciExtensionBasePricePoints];
                    if (this.state.drawingPhase === 'firstPoint') {
                        currentPoints.push(point);
                        this.state = {
                            ...this.state,
                            fibonacciExtensionBasePricePoints: currentPoints,
                            drawingPhase: 'secondPoint'
                        };
                        this.previewFibonacciExtensionBasePriceMark = new FibonacciExtensionBasePriceMark(
                            price, price, price,
                            time, time, time,
                            '#2962FF', 1, true, 3
                        );
                        if (chartSeries.series.attachPrimitive) {
                            chartSeries.series.attachPrimitive(this.previewFibonacciExtensionBasePriceMark);
                        }
                        this.FibonacciExtensionBasePriceMarks.forEach(m => m.setShowHandles(false));
                    } else if (this.state.drawingPhase === 'secondPoint') {
                        if (this.previewFibonacciExtensionBasePriceMark && currentPoints.length === 1) {
                            this.previewFibonacciExtensionBasePriceMark.updateEndPoint(price, time);
                            currentPoints.push(point);
                            this.state = {
                                ...this.state,
                                fibonacciExtensionBasePricePoints: currentPoints,
                                drawingPhase: 'extensionPoint'
                            };
                        }
                    } else if (this.state.drawingPhase === 'extensionPoint') {
                        if (this.previewFibonacciExtensionBasePriceMark && currentPoints.length === 2) {
                            const startPrice = this.previewFibonacciExtensionBasePriceMark.getStartPrice();
                            const endPrice = this.previewFibonacciExtensionBasePriceMark.getEndPrice();
                            const startTime = this.previewFibonacciExtensionBasePriceMark.getStartTime();
                            const endTime = this.previewFibonacciExtensionBasePriceMark.getEndTime();
                            if (chartSeries.series.detachPrimitive) {
                                chartSeries.series.detachPrimitive(this.previewFibonacciExtensionBasePriceMark);
                            }
                            const finalFibonacciExtensionBasePriceMark = new FibonacciExtensionBasePriceMark(
                                startPrice, endPrice, price,
                                startTime, endTime, time,
                                '#2962FF', 1, false, 3
                            );
                            if (chartSeries.series.attachPrimitive) {
                                chartSeries.series.attachPrimitive(finalFibonacciExtensionBasePriceMark);
                            }
                            this.FibonacciExtensionBasePriceMarks.push(finalFibonacciExtensionBasePriceMark);
                            this.previewFibonacciExtensionBasePriceMark = null;
                            if (finalFibonacciExtensionBasePriceMark.setShowHandles) {
                                finalFibonacciExtensionBasePriceMark.setShowHandles(true);
                            }
                            this.state = {
                                ...this.state,
                                isFibonacciExtensionBasePriceMode: false,
                                fibonacciExtensionBasePricePoints: [],
                                currentFibonacciExtensionBasePrice: null,
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
                } else if (!this.state.isFibonacciExtensionBasePriceMode) {
                    this.FibonacciExtensionBasePriceMarks.forEach(mark => {
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
                    this.state.dragTarget.dragHandleByPixels(deltaY, deltaX, this.state.dragPoint);
                    if (this.state.dragPoint === 'extension') {
                        setTimeout(() => {
                            if (this.state.dragTarget && this.state.dragTarget.adjustChartPriceRangeForExtension) {
                                this.state.dragTarget.adjustChartPriceRangeForExtension();
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
                    this.state.dragTarget.dragLineByPixels(deltaY, deltaX);
                }
                this.dragStartData = { time, price };
                return;
            }


            if (!this.state.isDragging && this.state.isFibonacciExtensionBasePriceMode && this.previewFibonacciExtensionBasePriceMark) {
                if (this.state.drawingPhase === 'secondPoint') {
                    this.previewFibonacciExtensionBasePriceMark.updateEndPoint(price, time);
                } else if (this.state.drawingPhase === 'extensionPoint') {
                    this.previewFibonacciExtensionBasePriceMark.updateExtensionPoint(price, time);
                }
            }

            if (!this.state.isFibonacciExtensionBasePriceMode && !this.state.isDragging) {
                let anyLineHovered = false;
                for (const mark of this.FibonacciExtensionBasePriceMarks) {
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

    public handleMouseUp = (point: Point): FibonacciExtensionBasePriceMarkState => {
        if (this.state.isDragging) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDragging(false, null);
            }


            if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end' || this.state.dragPoint === 'extension' || this.state.dragPoint === 'line') {
                this.state = {
                    ...this.state,
                    isFibonacciExtensionBasePriceMode: false,
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

    public handleKeyDown = (event: KeyboardEvent): FibonacciExtensionBasePriceMarkState => {
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
            } else if (this.state.isFibonacciExtensionBasePriceMode) {
                return this.cancelFibonacciExtensionMode();
            }
        }
        return this.state;
    };

    public getState(): FibonacciExtensionBasePriceMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<FibonacciExtensionBasePriceMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewFibonacciExtensionBasePriceMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciExtensionBasePriceMark);
            this.previewFibonacciExtensionBasePriceMark = null;
        }
        this.FibonacciExtensionBasePriceMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.FibonacciExtensionBasePriceMarks = [];
        this.hiddenMarks = [];
    }

    public getFibonacciExtensionBasePriceMarks(): FibonacciExtensionBasePriceMark[] {
        return [...this.FibonacciExtensionBasePriceMarks];
    }

    public removeFibonacciExtensionBasePriceMark(mark: FibonacciExtensionBasePriceMark): void {
        const index = this.FibonacciExtensionBasePriceMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.FibonacciExtensionBasePriceMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isFibonacciExtensionBasePriceMode;
    }

    private hiddenMarks: FibonacciExtensionBasePriceMark[] = [];

    public hideAllMarks(): void {
        this.hiddenMarks.push(...this.FibonacciExtensionBasePriceMarks);
        this.FibonacciExtensionBasePriceMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.FibonacciExtensionBasePriceMarks = [];
    }

    public showAllMarks(): void {
        this.FibonacciExtensionBasePriceMarks.push(...this.hiddenMarks);
        this.hiddenMarks.forEach(mark => {
            this.props.chartSeries?.series.attachPrimitive(mark);
        });
        this.hiddenMarks = [];
    }

    public hideMark(mark: FibonacciExtensionBasePriceMark): void {
        const index = this.FibonacciExtensionBasePriceMarks.indexOf(mark);
        if (index > -1) {
            this.FibonacciExtensionBasePriceMarks.splice(index, 1);
            this.hiddenMarks.push(mark);
            this.props.chartSeries?.series.detachPrimitive(mark);
        }
    }

    public showMark(mark: FibonacciExtensionBasePriceMark): void {
        const index = this.hiddenMarks.indexOf(mark);
        if (index > -1) {
            this.hiddenMarks.splice(index, 1);
            this.FibonacciExtensionBasePriceMarks.push(mark);
            this.props.chartSeries?.series.attachPrimitive(mark);
        }
    }
}