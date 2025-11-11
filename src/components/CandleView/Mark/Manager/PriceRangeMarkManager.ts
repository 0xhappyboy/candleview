import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { IMarkManager } from "../IMarkManager";
import { PriceRangeMark } from "../Range/PriceRangeMark";

export interface PriceRangeMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface PriceRangeMarkState {
    isPriceRangeMarkMode: boolean;
    priceRangeMarkStartPoint: Point | null;
    currentPriceRangeMark: PriceRangeMark | null;
    isDragging: boolean;
    dragTarget: PriceRangeMark | null;
    dragPoint: 'start' | 'end' | 'line' | null;
    drawingPhase: 'firstPoint' | 'secondPoint' | 'none';
    adjustingMode: 'start' | 'end' | null;
    adjustStartData: { time: string; price: number } | null;
}

export class PriceRangeMarkManager implements IMarkManager<PriceRangeMark> {
    private props: PriceRangeMarkManagerProps;
    private state: PriceRangeMarkState;
    private previewPriceRangeMark: PriceRangeMark | null = null;
    private priceRangeMarks: PriceRangeMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private firstPointPrice: number = 0;
    private firstPointTime: string = '';
    private secondPointPrice: number = 0;
    private secondPointTime: string = '';

    constructor(props: PriceRangeMarkManagerProps) {
        this.props = props;
        this.state = {
            isPriceRangeMarkMode: false,
            priceRangeMarkStartPoint: null,
            currentPriceRangeMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
    }

    public getMarkAtPoint(point: Point): PriceRangeMark | null {
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

            for (const mark of this.priceRangeMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }

            for (const mark of this.priceRangeMarks) {
                if (mark.isPointInRect(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error('Error getting mark at point:', error);
        }
        return null;
    }

    public getCurrentDragTarget(): PriceRangeMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): PriceRangeMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewPriceRangeMark) {
            return this.previewPriceRangeMark;
        }
        if (this.state.isPriceRangeMarkMode && this.state.currentPriceRangeMark) {
            return this.state.currentPriceRangeMark;
        }
        return null;
    }

    public getAllMarks(): PriceRangeMark[] {
        return [...this.priceRangeMarks];
    }

    public cancelOperationMode() {
        return this.cancelPriceRangeMarkMode();
    }

    public setPriceRangeMarkMode = (): PriceRangeMarkState => {
        this.state = {
            ...this.state,
            isPriceRangeMarkMode: true,
            priceRangeMarkStartPoint: null,
            currentPriceRangeMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'firstPoint',
            adjustingMode: null,
            adjustStartData: null
        };
        return this.state;
    };

    public cancelPriceRangeMarkMode = (): PriceRangeMarkState => {
        if (this.previewPriceRangeMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewPriceRangeMark);
            this.previewPriceRangeMark = null;
        }

        this.priceRangeMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setHoverPoint(null);
        });
        this.state = {
            ...this.state,
            isPriceRangeMarkMode: false,
            priceRangeMarkStartPoint: null,
            currentPriceRangeMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
        this.isOperating = false;
        this.firstPointPrice = 0;
        this.firstPointTime = '';
        this.secondPointPrice = 0;
        this.secondPointTime = '';
        return this.state;
    };

    public handleMouseDown = (point: Point): PriceRangeMarkState => {
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
                this.firstPointPrice = price;
                this.firstPointTime = time.toString();
                this.state = {
                    ...this.state,
                    drawingPhase: 'secondPoint',
                    priceRangeMarkStartPoint: point
                };
                this.previewPriceRangeMark = new PriceRangeMark(
                    this.firstPointPrice,
                    this.firstPointPrice,
                    this.firstPointTime,
                    this.firstPointTime,
                    '#3964FE',
                    2,
                    true
                );
                chartSeries?.series.attachPrimitive(this.previewPriceRangeMark);
            } else if (this.state.drawingPhase === 'secondPoint') {
                this.secondPointPrice = price;
                this.secondPointTime = time.toString();
                this.completePriceRangeMark();
            } else if (this.state.drawingPhase === 'none') {
                return this.handleExistingMarkInteraction(relativeX, relativeY, time.toString(), price);
            }
        } catch (error) {
            console.error('Error placing price range mark:', error);
            this.state = this.cancelPriceRangeMarkMode();
        }
        return this.state;
    };

    private handleExistingMarkInteraction(relativeX: number, relativeY: number, time: string, price: number): PriceRangeMarkState {
        for (const mark of this.priceRangeMarks) {
            const handleType = mark.isPointNearHandle(relativeX, relativeY);
            if (handleType) {
                const adjustStartData = {
                    time: time,
                    price: price
                };
                this.state = {
                    ...this.state,
                    isPriceRangeMarkMode: true,
                    isDragging: false,
                    dragTarget: mark,
                    dragPoint: handleType,
                    adjustingMode: handleType,
                    adjustStartData: adjustStartData
                };
                this.priceRangeMarks.forEach(m => {
                    m.setShowHandles(m === mark);
                    m.setHoverPoint(null);
                });
                this.isOperating = true;
                return this.state;
            }
        }
        for (const mark of this.priceRangeMarks) {
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
                this.priceRangeMarks.forEach(m => {
                    m.setShowHandles(m === mark);
                    m.setHoverPoint(null);
                });
                this.isOperating = true;
                return this.state;
            }
        }
        return this.state;
    }

    private completePriceRangeMark(): void {
        const { chartSeries } = this.props;
        if (this.previewPriceRangeMark) {
            this.previewPriceRangeMark.updateEndPoint(this.secondPointPrice, this.secondPointTime);
            this.previewPriceRangeMark.setPreviewMode(false);
            const finalPriceRangeMark = new PriceRangeMark(
                this.firstPointPrice,
                this.secondPointPrice,
                this.firstPointTime,
                this.secondPointTime,
                '#3964FE',
                2,
                false
            );
            chartSeries?.series.detachPrimitive(this.previewPriceRangeMark);
            chartSeries?.series.attachPrimitive(finalPriceRangeMark);
            this.priceRangeMarks.push(finalPriceRangeMark);
            this.previewPriceRangeMark = null;
            finalPriceRangeMark.setShowHandles(true);
            this.state = {
                ...this.state,
                isPriceRangeMarkMode: false,
                priceRangeMarkStartPoint: null,
                currentPriceRangeMark: null,
                drawingPhase: 'none',
                adjustingMode: null,
                adjustStartData: null
            };
            this.firstPointPrice = 0;
            this.firstPointTime = '';
            this.secondPointPrice = 0;
            this.secondPointTime = '';
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
                    this.state.dragTarget.updateStartPoint(price, time.toString());
                } else if (this.state.adjustingMode === 'end') {
                    this.state.dragTarget.updateEndPoint(price, time.toString());
                }
            }
            if (this.state.drawingPhase === 'secondPoint' && this.previewPriceRangeMark) {
                this.previewPriceRangeMark.updateEndPoint(price, time.toString());
            }
            if (this.state.drawingPhase === 'none') {
                let newHoverPoint: 'start' | 'end' | 'line' | null = null;
                for (const mark of this.priceRangeMarks) {
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
            chart.timeScale().widthChanged();
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): PriceRangeMarkState => {
        if (this.state.adjustingMode) {
            this.state = {
                ...this.state,
                isPriceRangeMarkMode: false,
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

    public handleKeyDown = (event: KeyboardEvent): PriceRangeMarkState => {
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
            } else if (this.state.isPriceRangeMarkMode || this.state.drawingPhase !== 'none') {
                return this.cancelPriceRangeMarkMode();
            }
        }
        return this.state;
    };

    public getState(): PriceRangeMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<PriceRangeMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewPriceRangeMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewPriceRangeMark);
            this.previewPriceRangeMark = null;
        }

        this.priceRangeMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.priceRangeMarks = [];
    }

    public getPriceRangeMarks(): PriceRangeMark[] {
        return [...this.priceRangeMarks];
    }

    public removePriceRangeMark(mark: PriceRangeMark): void {
        const index = this.priceRangeMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.priceRangeMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isPriceRangeMarkMode ||
            this.state.drawingPhase !== 'none' || this.state.adjustingMode !== null;
    }
}