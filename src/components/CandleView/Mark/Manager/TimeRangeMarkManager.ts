import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { IMarkManager } from "../IMarkManager";
import { TimeRangeMark } from "../Range/TimeRangeMark";

export interface TimeRangeMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface TimeRangeMarkState {
    isTimeRangeMarkMode: boolean;
    timeRangeMarkStartPoint: Point | null;
    currentTimeRangeMark: TimeRangeMark | null;
    isDragging: boolean;
    dragTarget: TimeRangeMark | null;
    dragPoint: 'start' | 'end' | 'line' | null;
    drawingPhase: 'firstPoint' | 'secondPoint' | 'none';
    adjustingMode: 'start' | 'end' | null;
    adjustStartData: { time: string; price: number } | null;
}

export class TimeRangeMarkManager implements IMarkManager<TimeRangeMark> {
    private props: TimeRangeMarkManagerProps;
    private state: TimeRangeMarkState;
    private previewTimeRangeMark: TimeRangeMark | null = null;
    private timeRangeMarks: TimeRangeMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private firstPointTime: string = '';
    private firstPointPrice: number = 0;
    private secondPointTime: string = '';
    private secondPointPrice: number = 0;

    constructor(props: TimeRangeMarkManagerProps) {
        this.props = props;
        this.state = {
            isTimeRangeMarkMode: false,
            timeRangeMarkStartPoint: null,
            currentTimeRangeMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
    }

    public getMarkAtPoint(point: Point): TimeRangeMark | null {
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


            for (const mark of this.timeRangeMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }


            for (const mark of this.timeRangeMarks) {
                if (mark.isPointInRect(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): TimeRangeMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): TimeRangeMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewTimeRangeMark) {
            return this.previewTimeRangeMark;
        }
        if (this.state.isTimeRangeMarkMode && this.state.currentTimeRangeMark) {
            return this.state.currentTimeRangeMark;
        }
        return null;
    }

    public getAllMarks(): TimeRangeMark[] {
        return [...this.timeRangeMarks];
    }

    public cancelOperationMode() {
        return this.cancelTimeRangeMarkMode();
    }

    public setTimeRangeMarkMode = (): TimeRangeMarkState => {
        this.state = {
            ...this.state,
            isTimeRangeMarkMode: true,
            timeRangeMarkStartPoint: null,
            currentTimeRangeMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'firstPoint',
            adjustingMode: null,
            adjustStartData: null
        };
        return this.state;
    };

    public cancelTimeRangeMarkMode = (): TimeRangeMarkState => {
        if (this.previewTimeRangeMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewTimeRangeMark);
            this.previewTimeRangeMark = null;
        }

        this.timeRangeMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setHoverPoint(null);
        });
        this.state = {
            ...this.state,
            isTimeRangeMarkMode: false,
            timeRangeMarkStartPoint: null,
            currentTimeRangeMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
        this.isOperating = false;
        this.firstPointTime = '';
        this.firstPointPrice = 0;
        this.secondPointTime = '';
        this.secondPointPrice = 0;
        return this.state;
    };

    public handleMouseDown = (point: Point): TimeRangeMarkState => {
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
                this.firstPointTime = time.toString();
                this.firstPointPrice = price;
                this.state = {
                    ...this.state,
                    drawingPhase: 'secondPoint',
                    timeRangeMarkStartPoint: point
                };
                this.previewTimeRangeMark = new TimeRangeMark(
                    this.firstPointTime,
                    this.firstPointPrice,
                    this.firstPointTime,
                    this.firstPointPrice,
                    '#3964FE',
                    2,
                    true
                );
                chartSeries?.series.attachPrimitive(this.previewTimeRangeMark);
            } else if (this.state.drawingPhase === 'secondPoint') {
                this.secondPointTime = time.toString();
                this.secondPointPrice = price;
                this.completeTimeRangeMark();
            } else if (this.state.drawingPhase === 'none') {
                return this.handleExistingMarkInteraction(relativeX, relativeY, time.toString(), price);
            }
        } catch (error) {
            console.error(error);
            this.state = this.cancelTimeRangeMarkMode();
        }
        return this.state;
    };

    private handleExistingMarkInteraction(relativeX: number, relativeY: number, time: string, price: number): TimeRangeMarkState {
        for (const mark of this.timeRangeMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            if (handleType) {
                const adjustStartData = {
                    time: time,
                    price: price
                };
                this.state = {
                    ...this.state,
                    isTimeRangeMarkMode: true,
                    isDragging: false,
                    dragTarget: mark,
                    dragPoint: handleType,
                    adjustingMode: handleType,
                    adjustStartData: adjustStartData
                };
                this.timeRangeMarks.forEach(m => {
                    m.setShowHandles(m === mark);
                    m.setHoverPoint(null);
                });
                this.isOperating = true;
                return this.state;
            }
        }
        for (const mark of this.timeRangeMarks) {
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
                this.timeRangeMarks.forEach(m => {
                    m.setShowHandles(m === mark);
                    m.setHoverPoint(null);
                });
                this.isOperating = true;
                return this.state;
            }
        }
        return this.state;
    }

    private completeTimeRangeMark(): void {
        const { chartSeries } = this.props;
        if (this.previewTimeRangeMark) {
            this.previewTimeRangeMark.updateEndPoint(this.secondPointTime, this.secondPointPrice);
            this.previewTimeRangeMark.setPreviewMode(false);
            const finalTimeRangeMark = new TimeRangeMark(
                this.firstPointTime,
                this.firstPointPrice,
                this.secondPointTime,
                this.secondPointPrice,
                '#3964FE',
                2,
                false
            );
            chartSeries?.series.detachPrimitive(this.previewTimeRangeMark);
            chartSeries?.series.attachPrimitive(finalTimeRangeMark);
            this.timeRangeMarks.push(finalTimeRangeMark);
            this.previewTimeRangeMark = null;
            finalTimeRangeMark.setShowHandles(true);
            this.state = {
                ...this.state,
                isTimeRangeMarkMode: false,
                timeRangeMarkStartPoint: null,
                currentTimeRangeMark: null,
                drawingPhase: 'none',
                adjustingMode: null,
                adjustStartData: null
            };
            this.firstPointTime = '';
            this.firstPointPrice = 0;
            this.secondPointTime = '';
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
                    this.state.dragTarget.updateStartPoint(time.toString(), price);
                } else if (this.state.adjustingMode === 'end') {
                    this.state.dragTarget.updateEndPoint(time.toString(), price);
                }
            }
            if (this.state.drawingPhase === 'secondPoint' && this.previewTimeRangeMark) {
                this.previewTimeRangeMark.updateEndPoint(time.toString(), price);
            }
            if (this.state.drawingPhase === 'none') {
                let newHoverPoint: 'start' | 'end' | 'line' | null = null;
                for (const mark of this.timeRangeMarks) {
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
            // chart.timeScale().widthChanged();
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): TimeRangeMarkState => {
        if (this.state.adjustingMode) {
            this.state = {
                ...this.state,
                isTimeRangeMarkMode: false,
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

    public handleKeyDown = (event: KeyboardEvent): TimeRangeMarkState => {
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
            } else if (this.state.isTimeRangeMarkMode || this.state.drawingPhase !== 'none') {
                return this.cancelTimeRangeMarkMode();
            }
        }
        return this.state;
    };

    public getState(): TimeRangeMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<TimeRangeMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewTimeRangeMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewTimeRangeMark);
            this.previewTimeRangeMark = null;
        }

        this.timeRangeMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.timeRangeMarks = [];
    }

    public getTimeRangeMarks(): TimeRangeMark[] {
        return [...this.timeRangeMarks];
    }

    public removeTimeRangeMark(mark: TimeRangeMark): void {
        const index = this.timeRangeMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.timeRangeMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isTimeRangeMarkMode ||
            this.state.drawingPhase !== 'none' || this.state.adjustingMode !== null;
    }
}