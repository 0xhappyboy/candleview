import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { LongPositionMark } from "../../Mark/Range/LongPositionMark";
import { Point } from "../../types";

export interface LongPositionMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface LongPositionMarkState {
    isLongPositionMarkMode: boolean;
    longPositionMarkStartPoint: Point | null;
    currentLongPositionMark: LongPositionMark | null;
    isDragging: boolean;
    dragTarget: LongPositionMark | null;
    dragPoint: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'middle' | null;
    drawingPhase: 'firstPoint' | 'secondPoint' | 'none';
    adjustingMode: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'middle' | null;
    adjustStartData: { time: number; price: number } | null; 
}

export class LongPositionMarkManager implements IMarkManager<LongPositionMark> {
    private props: LongPositionMarkManagerProps;
    private state: LongPositionMarkState;
    private previewLongPositionMark: LongPositionMark | null = null;
    private longPositionMarks: LongPositionMark[] = [];
    private dragStartData: { time: number; price: number; x: number; y: number } | null = null; 
    private isOperating: boolean = false;
    private firstPointTime: number = 0; 
    private firstPointPrice: number = 0;
    private secondPointTime: number = 0; 
    private secondPointPrice: number = 0;

    constructor(props: LongPositionMarkManagerProps) {
        this.props = props;
        this.state = {
            isLongPositionMarkMode: false,
            longPositionMarkStartPoint: null,
            currentLongPositionMark: null,
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
            isLongPositionMarkMode: false,
            longPositionMarkStartPoint: null,
            currentLongPositionMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
    }

    public getMarkAtPoint(point: Point): LongPositionMark | null {
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

            for (const mark of this.longPositionMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }

            for (const mark of this.longPositionMarks) {
                if (mark.isPointInRect(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): LongPositionMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): LongPositionMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewLongPositionMark) {
            return this.previewLongPositionMark;
        }
        if (this.state.isLongPositionMarkMode && this.state.currentLongPositionMark) {
            return this.state.currentLongPositionMark;
        }
        return null;
    }

    public getAllMarks(): LongPositionMark[] {
        return [...this.longPositionMarks];
    }

    public cancelOperationMode() {
        return this.cancelLongPositionMarkMode();
    }

    public setLongPositionMarkMode = (): LongPositionMarkState => {
        this.state = {
            ...this.state,
            isLongPositionMarkMode: true,
            longPositionMarkStartPoint: null,
            currentLongPositionMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'firstPoint',
            adjustingMode: null,
            adjustStartData: null
        };
        return this.state;
    };

    public cancelLongPositionMarkMode = (): LongPositionMarkState => {
        if (this.previewLongPositionMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewLongPositionMark);
            this.previewLongPositionMark = null;
        }

        this.longPositionMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setHoverPoint(null);
        });
        this.state = {
            ...this.state,
            isLongPositionMarkMode: false,
            longPositionMarkStartPoint: null,
            currentLongPositionMark: null,
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

    public handleMouseDown = (point: Point): LongPositionMarkState => {
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
            this.dragStartData = {
                time: time, 
                price,
                x: relativeX,
                y: relativeY
            };
            if (this.state.drawingPhase === 'firstPoint') {
                this.firstPointTime = time; 
                this.firstPointPrice = price;
                this.state = {
                    ...this.state,
                    drawingPhase: 'secondPoint',
                    longPositionMarkStartPoint: point
                };
                const range = price * 0.1;
                this.previewLongPositionMark = new LongPositionMark(
                    this.firstPointTime,
                    time, 
                    price + range,
                    price - range,
                    '#000000',
                    2,
                    true
                );
                chartSeries?.series.attachPrimitive(this.previewLongPositionMark);
            } else if (this.state.drawingPhase === 'secondPoint') {
                this.secondPointTime = time; 
                this.secondPointPrice = price;
                this.completeLongPositionMark();
            } else if (this.state.drawingPhase === 'none') {
                return this.handleExistingMarkInteraction(relativeX, relativeY, time, price); 
            }
        } catch (error) {
            console.error(error);
            this.state = this.cancelLongPositionMarkMode();
        }
        return this.state;
    };

    private handleExistingMarkInteraction(relativeX: number, relativeY: number, time: number, price: number): LongPositionMarkState { 
        for (const mark of this.longPositionMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            if (handleType) {
                const adjustStartData = {
                    time: time, 
                    price: price
                };
                this.state = {
                    ...this.state,
                    isLongPositionMarkMode: true,
                    isDragging: false,
                    dragTarget: mark,
                    dragPoint: handleType,
                    adjustingMode: handleType,
                    adjustStartData: adjustStartData
                };
                mark.setDragging(true, handleType);
                this.longPositionMarks.forEach(m => {
                    m.setShowHandles(m === mark);
                    m.setHoverPoint(null);
                });
                this.isOperating = true;
                return this.state;
            }
        }

        for (const mark of this.longPositionMarks) {
            if (mark.isPointInRect(relativeX, relativeY)) {

                const middleHandle = mark.isPointNearHandle(relativeX, relativeY, 10);
                if (middleHandle === 'middle') {

                    const adjustStartData = {
                        time: time, 
                        price: price
                    };
                    this.state = {
                        ...this.state,
                        isLongPositionMarkMode: true,
                        isDragging: false,
                        dragTarget: mark,
                        dragPoint: 'middle',
                        adjustingMode: 'middle',
                        adjustStartData: adjustStartData
                    };
                    mark.setDragging(true, 'middle');
                } else {
                    this.state = {
                        ...this.state,
                        isDragging: true,
                        dragTarget: mark,
                        dragPoint: 'middle',
                        adjustingMode: null,
                        adjustStartData: null
                    };
                    mark.setDragging(true, 'middle');
                }
                this.longPositionMarks.forEach(m => {
                    m.setShowHandles(m === mark);
                    m.setHoverPoint(null);
                });
                this.isOperating = true;
                return this.state;
            }
        }
        this.longPositionMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setHoverPoint(null);
        });
        return this.state;
    }

    private completeLongPositionMark(): void {
        const { chartSeries } = this.props;
        if (this.previewLongPositionMark) {
            const finalLongPositionMark = new LongPositionMark(
                this.firstPointTime,
                this.secondPointTime,
                this.previewLongPositionMark.getUpperPrice(),
                this.previewLongPositionMark.getLowerPrice(),
                '#000000',
                2,
                false
            );
            chartSeries?.series.detachPrimitive(this.previewLongPositionMark);
            chartSeries?.series.attachPrimitive(finalLongPositionMark);
            this.longPositionMarks.push(finalLongPositionMark);
            this.previewLongPositionMark = null;
            finalLongPositionMark.setShowHandles(true);
            this.state = {
                ...this.state,
                isLongPositionMarkMode: false,
                longPositionMarkStartPoint: null,
                currentLongPositionMark: null,
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
            if (this.state.isDragging && this.state.dragTarget && this.dragStartData && this.state.dragPoint === 'middle') {
                const deltaX = relativeX - this.dragStartData.x;
                const deltaY = relativeY - this.dragStartData.y;
                this.state.dragTarget.dragByPixels(deltaX, deltaY);
                this.dragStartData = {
                    time: this.dragStartData.time,
                    price: this.dragStartData.price,
                    x: relativeX,
                    y: relativeY
                };
                return;
            }
            if (this.state.adjustingMode && this.state.dragTarget) {
                this.state.dragTarget.adjustByHandle(this.state.adjustingMode, time, price); 
                return;
            }
            if (this.state.drawingPhase === 'secondPoint' && this.previewLongPositionMark) {
                const range = Math.abs(price - this.firstPointPrice) * 0.5;
                const upperPrice = this.firstPointPrice + range;
                const lowerPrice = this.firstPointPrice - range;
                this.previewLongPositionMark.updatePrices(upperPrice, lowerPrice);
                this.previewLongPositionMark.updateTimeRange(this.firstPointTime, time); 
                return;
            }
            if (this.state.drawingPhase === 'none') {
                let newHoverPoint: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'middle' | null = null;
                for (const mark of this.longPositionMarks) {
                    const handleType = mark.isPointNearHandle(relativeX, relativeY);
                    const isInRect = mark.isPointInRect(relativeX, relativeY);
                    if (handleType) {
                        newHoverPoint = handleType;
                        mark.setHoverPoint(handleType);
                    } else if (isInRect) {
                        newHoverPoint = 'middle';
                        mark.setHoverPoint('middle');
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

    public handleMouseUp = (point: Point): LongPositionMarkState => {
        if (this.state.adjustingMode) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDragging(false, null);
            }
            this.state = {
                ...this.state,
                isLongPositionMarkMode: false,
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

    public handleKeyDown = (event: KeyboardEvent): LongPositionMarkState => {
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
            } else if (this.state.isLongPositionMarkMode || this.state.drawingPhase !== 'none') {
                return this.cancelLongPositionMarkMode();
            }
        }
        return this.state;
    };

    public getState(): LongPositionMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<LongPositionMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewLongPositionMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewLongPositionMark);
            this.previewLongPositionMark = null;
        }
        this.longPositionMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.longPositionMarks = [];
    }

    public getLongPositionMarks(): LongPositionMark[] {
        return [...this.longPositionMarks];
    }

    public removeLongPositionMark(mark: LongPositionMark): void {
        const index = this.longPositionMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.longPositionMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isLongPositionMarkMode ||
            this.state.drawingPhase !== 'none' || this.state.adjustingMode !== null;
    }
}