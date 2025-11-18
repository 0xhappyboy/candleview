import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { TimePriceRangeMark } from "../../Mark/Range/TimePriceRangeMark";
import { Point } from "../../types";

export interface TimePriceRangeMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface TimePriceRangeMarkState {
    isTimePriceRangeMarkMode: boolean;
    timePriceRangeMarkStartPoint: Point | null;
    currentTimePriceRangeMark: TimePriceRangeMark | null;
    isDragging: boolean;
    dragTarget: TimePriceRangeMark | null;
    dragPoint: 'start' | 'end' | 'line' | null;
    drawingPhase: 'firstPoint' | 'secondPoint' | 'none';
    adjustingMode: 'start' | 'end' | null;
    adjustStartData: { time: number; price: number } | null;
}

export class TimePriceRangeMarkManager implements IMarkManager<TimePriceRangeMark> {
    private props: TimePriceRangeMarkManagerProps;
    private state: TimePriceRangeMarkState;
    private previewTimePriceRangeMark: TimePriceRangeMark | null = null;
    private timePriceRangeMarks: TimePriceRangeMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private firstPointTime: number = 0;
    private firstPointPrice: number = 0;
    private secondPointTime: number = 0;
    private secondPointPrice: number = 0;

    constructor(props: TimePriceRangeMarkManagerProps) {
        this.props = props;
        this.state = {
            isTimePriceRangeMarkMode: false,
            timePriceRangeMarkStartPoint: null,
            currentTimePriceRangeMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
    }

    public clearState(): void {
        this.state = {
            isTimePriceRangeMarkMode: false,
            timePriceRangeMarkStartPoint: null,
            currentTimePriceRangeMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
    }

    public getMarkAtPoint(point: Point): TimePriceRangeMark | null {
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

            if (this.state.drawingPhase !== 'none') {
                return null;
            }

            for (const mark of this.timePriceRangeMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }

            for (const mark of this.timePriceRangeMarks) {
                if (mark.isPointInRect(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): TimePriceRangeMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): TimePriceRangeMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewTimePriceRangeMark) {
            return this.previewTimePriceRangeMark;
        }
        if (this.state.isTimePriceRangeMarkMode && this.state.currentTimePriceRangeMark) {
            return this.state.currentTimePriceRangeMark;
        }
        return null;
    }

    public getAllMarks(): TimePriceRangeMark[] {
        return [...this.timePriceRangeMarks];
    }

    public cancelOperationMode() {
        return this.cancelTimePriceRangeMarkMode();
    }

    public setTimePriceRangeMarkMode = (): TimePriceRangeMarkState => {
        this.state = {
            ...this.state,
            isTimePriceRangeMarkMode: true,
            timePriceRangeMarkStartPoint: null,
            currentTimePriceRangeMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'firstPoint',
            adjustingMode: null,
            adjustStartData: null
        };
        return this.state;
    };

    public cancelTimePriceRangeMarkMode = (): TimePriceRangeMarkState => {
        if (this.previewTimePriceRangeMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewTimePriceRangeMark);
            this.previewTimePriceRangeMark = null;
        }

        this.timePriceRangeMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setHoverPoint(null);
        });
        this.state = {
            ...this.state,
            isTimePriceRangeMarkMode: false,
            timePriceRangeMarkStartPoint: null,
            currentTimePriceRangeMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
        this.isOperating = false;
        this.firstPointTime = 0;
        this.firstPointPrice = 0;
        this.secondPointTime = 0;
        this.secondPointPrice = 0;
        return this.state;
    };

    public handleMouseDown = (point: Point): TimePriceRangeMarkState => {
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
            const time = timeScale.coordinateToTime(relativeX);
            const price = chartSeries.series.coordinateToPrice(relativeY);
            if (time === null || price === null) return this.state;

            this.dragStartData = { time, price };

            if (this.state.drawingPhase === 'firstPoint') {
                this.firstPointTime = time;
                this.firstPointPrice = price;
                this.state = {
                    ...this.state,
                    drawingPhase: 'secondPoint',
                    timePriceRangeMarkStartPoint: point
                };
                this.previewTimePriceRangeMark = new TimePriceRangeMark(
                    this.firstPointTime,
                    this.firstPointPrice,
                    this.firstPointTime,
                    this.firstPointPrice,
                    '#3964FE',
                    2,
                    true
                );
                chartSeries?.series.attachPrimitive(this.previewTimePriceRangeMark);
            } else if (this.state.drawingPhase === 'secondPoint') {
                this.secondPointTime = time;
                this.secondPointPrice = price;
                this.completeTimePriceRangeMark();
            } else if (this.state.drawingPhase === 'none') {
                return this.handleExistingMarkInteraction(relativeX, relativeY, time, price);
            }
        } catch (error) {
            console.error(error);
            this.state = this.cancelTimePriceRangeMarkMode();
        }
        return this.state;
    };

    private handleExistingMarkInteraction(relativeX: number, relativeY: number, time: number, price: number): TimePriceRangeMarkState {
        for (const mark of this.timePriceRangeMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            if (handleType) {
                const adjustStartData = {
                    time: time,
                    price: price
                };
                this.state = {
                    ...this.state,
                    isTimePriceRangeMarkMode: true,
                    isDragging: false,
                    dragTarget: mark,
                    dragPoint: handleType,
                    adjustingMode: handleType,
                    adjustStartData: adjustStartData
                };
                this.timePriceRangeMarks.forEach(m => {
                    m.setShowHandles(m === mark);
                    m.setHoverPoint(null);
                });
                this.isOperating = true;
                return this.state;
            }
        }
        for (const mark of this.timePriceRangeMarks) {
            if (mark.isPointInRect(relativeX, relativeY)) {
                this.state = {
                    ...this.state,
                    isDragging: true,
                    dragTarget: mark,
                    dragPoint: 'line',
                    adjustingMode: null,
                    adjustStartData: null
                };
                mark.setDragging(true, 'line');
                this.timePriceRangeMarks.forEach(m => {
                    m.setShowHandles(m === mark);
                    m.setHoverPoint(null);
                });
                this.isOperating = true;
                return this.state;
            }
        }
        return this.state;
    }

    private completeTimePriceRangeMark(): void {
        const { chartSeries } = this.props;
        if (this.previewTimePriceRangeMark) {
            this.previewTimePriceRangeMark.updateEndPoint(this.secondPointTime, this.secondPointPrice);
            this.previewTimePriceRangeMark.setPreviewMode(false);
            const finalTimePriceRangeMark = new TimePriceRangeMark(
                this.firstPointTime,
                this.firstPointPrice,
                this.secondPointTime,
                this.secondPointPrice,
                '#3964FE',
                2,
                false
            );
            chartSeries?.series.detachPrimitive(this.previewTimePriceRangeMark);
            chartSeries?.series.attachPrimitive(finalTimePriceRangeMark);
            this.timePriceRangeMarks.push(finalTimePriceRangeMark);
            this.previewTimePriceRangeMark = null;
            finalTimePriceRangeMark.setShowHandles(true);
            this.state = {
                ...this.state,
                isTimePriceRangeMarkMode: false,
                timePriceRangeMarkStartPoint: null,
                currentTimePriceRangeMark: null,
                drawingPhase: 'none',
                adjustingMode: null,
                adjustStartData: null
            };
            this.firstPointTime = 0;
            this.firstPointPrice = 0;
            this.secondPointTime = 0;
            this.secondPointPrice = 0;
            if (this.props.onCloseDrawing) {
                this.props.onCloseDrawing();
            }
        }
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
            const time = timeScale.coordinateToTime(relativeX);
            const price = chartSeries.series.coordinateToPrice(relativeY);
            if (time === null || price === null) return;

            if (this.state.isDragging && this.state.dragTarget && this.dragStartData && this.state.dragPoint === 'line') {
                if (this.dragStartData.time === null || time === null) return;
                const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
                const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                const currentX = timeScale.timeToCoordinate(time);
                const currentY = chartSeries.series.priceToCoordinate(price);
                if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;
                const deltaX = currentX - currentStartX;
                const deltaY = currentY - currentStartY;
                this.state.dragTarget.dragLineByPixels(deltaX, deltaY);
                this.dragStartData = { time, price };
                return;
            }
            if (this.state.adjustingMode && this.state.dragTarget && this.state.adjustStartData) {
                if (this.state.adjustingMode === 'start') {
                    this.state.dragTarget.updateStartPoint(time, price);
                } else if (this.state.adjustingMode === 'end') {
                    this.state.dragTarget.updateEndPoint(time, price);
                }
            }
            if (this.state.drawingPhase === 'secondPoint' && this.previewTimePriceRangeMark) {
                this.previewTimePriceRangeMark.updateEndPoint(time, price);
            }
            if (this.state.drawingPhase === 'none') {
                let newHoverPoint: 'start' | 'end' | 'line' | null = null;
                for (const mark of this.timePriceRangeMarks) {
                    const handleType = mark.isPointNearHandle(relativeX, relativeY);
                    const isInRect = mark.isPointInRect(relativeX, relativeY);
                    if (handleType) {
                        newHoverPoint = handleType;
                        mark.setHoverPoint(handleType);
                    } else if (isInRect) {
                        newHoverPoint = 'line';
                        mark.setHoverPoint('line');
                    } else {
                        mark.setHoverPoint(null);
                    }
                    if (newHoverPoint) break;
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): TimePriceRangeMarkState => {
        if (this.state.adjustingMode) {
            this.state = {
                ...this.state,
                isTimePriceRangeMarkMode: false,
                isDragging: false,
                dragTarget: null,
                dragPoint: null,
                adjustingMode: null,
                adjustStartData: null
            };
            this.isOperating = false;
            if (this.props.onCloseDrawing) {
                this.props.onCloseDrawing();
            }
        }
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

    public handleKeyDown = (event: KeyboardEvent): TimePriceRangeMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isDragging || this.state.adjustingMode) {
                if (this.state.dragTarget) {
                    this.state.dragTarget.setDragging(false, null);
                    this.state.dragTarget.setHoverPoint(null);
                }
                this.state = {
                    ...this.state,
                    isDragging: false,
                    dragTarget: null,
                    dragPoint: null,
                    adjustingMode: null,
                    adjustStartData: null
                };
            } else if (this.state.isTimePriceRangeMarkMode || this.state.drawingPhase !== 'none') {
                return this.cancelTimePriceRangeMarkMode();
            }
        }
        return this.state;
    };

    public getState(): TimePriceRangeMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<TimePriceRangeMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewTimePriceRangeMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewTimePriceRangeMark);
            this.previewTimePriceRangeMark = null;
        }
        this.timePriceRangeMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.timePriceRangeMarks = [];
    }

    public getTimePriceRangeMarks(): TimePriceRangeMark[] {
        return [...this.timePriceRangeMarks];
    }

    public removeTimePriceRangeMark(mark: TimePriceRangeMark): void {
        const index = this.timePriceRangeMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.timePriceRangeMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isTimePriceRangeMarkMode ||
            this.state.drawingPhase !== 'none' || this.state.adjustingMode !== null;
    }
}