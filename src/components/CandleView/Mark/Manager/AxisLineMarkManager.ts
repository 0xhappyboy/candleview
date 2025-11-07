import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { MarkType, Point } from "../../types";
import { HorizontalLineMark } from "../Graph/Line/HorizontalLineMark";
import { VerticalLineMark } from "../Graph/Line/VerticalLineMark";
import { IMarkManager } from "../IMarkManager";

export interface AxisLineMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface AxisLineMarkState {
    isHorizontalLineMode: boolean;
    isVerticalLineMode: boolean;
    currentHorizontalLine: HorizontalLineMark | null;
    currentVerticalLine: VerticalLineMark | null;
    isDragging: boolean;
    dragTarget: HorizontalLineMark | VerticalLineMark | null;
}

export class AxisLineMarkManager implements IMarkManager<HorizontalLineMark | VerticalLineMark> {
    private props: AxisLineMarkManagerProps;
    private state: AxisLineMarkState;
    private horizontalLines: HorizontalLineMark[] = [];
    private verticalLines: VerticalLineMark[] = [];
    private mouseDownPoint: Point | null = null;
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;

    constructor(props: AxisLineMarkManagerProps) {
        this.props = props;
        this.state = {
            isHorizontalLineMode: false,
            isVerticalLineMode: false,
            currentHorizontalLine: null,
            currentVerticalLine: null,
            isDragging: false,
            dragTarget: null
        };
    }

    public getMarkAtPoint(point: Point): HorizontalLineMark | VerticalLineMark | null {
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
            for (const mark of this.horizontalLines) {
                if (mark.isPointNearLine(relativeX, relativeY)) {
                    return mark;
                }
            }
            for (const mark of this.verticalLines) {
                if (mark.isPointNearLine(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error('Error getting axis mark at point:', error);
        }
        return null;
    }

    getCurrentDragPoint(): string | null {
        throw new Error("Method not implemented.");
    }

    public getCurrentDragTarget(): HorizontalLineMark | VerticalLineMark | null {
        return this.state.dragTarget;
    }

    public getCurrentOperatingMark(): HorizontalLineMark | VerticalLineMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        return null;
    }

    public getAllMarks(): (HorizontalLineMark | VerticalLineMark)[] {
        return [...this.horizontalLines, ...this.verticalLines];
    }

    public cancelOperationMode() {
        return this.cancelAxisLineMode();
    }

    public setHorizontalLineMode = (): AxisLineMarkState => {
        this.state = {
            ...this.state,
            isHorizontalLineMode: true,
            isVerticalLineMode: false,
            currentHorizontalLine: null,
            currentVerticalLine: null,
            isDragging: false,
            dragTarget: null
        };
        return this.state;
    };

    public setVerticalLineMode = (): AxisLineMarkState => {
        this.state = {
            ...this.state,
            isHorizontalLineMode: false,
            isVerticalLineMode: true,
            currentHorizontalLine: null,
            currentVerticalLine: null,
            isDragging: false,
            dragTarget: null
        };
        return this.state;
    };

    public cancelAxisLineMode = (): AxisLineMarkState => {
        this.horizontalLines.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.verticalLines.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isHorizontalLineMode: false,
            isVerticalLineMode: false,
            currentHorizontalLine: null,
            currentVerticalLine: null,
            isDragging: false,
            dragTarget: null
        };
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): AxisLineMarkState => {
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
            this.mouseDownPoint = point;
            this.dragStartData = { time, price };
            for (const mark of this.horizontalLines) {
                if (mark.isPointNearLine(relativeX, relativeY)) {
                    this.state = {
                        ...this.state,
                        isDragging: true,
                        dragTarget: mark
                    };
                    mark.setDragging(true);
                    mark.setShowHandles(true);
                    this.horizontalLines.forEach(m => m.setShowHandles(m === mark));
                    this.verticalLines.forEach(m => m.setShowHandles(false));
                    this.isOperating = true;
                    return this.state;
                }
            }

            for (const mark of this.verticalLines) {
                if (mark.isPointNearLine(relativeX, relativeY)) {
                    this.state = {
                        ...this.state,
                        isDragging: true,
                        dragTarget: mark
                    };
                    mark.setDragging(true);
                    mark.setShowHandles(true);
                    this.verticalLines.forEach(m => m.setShowHandles(m === mark));
                    this.horizontalLines.forEach(m => m.setShowHandles(false));
                    this.isOperating = true;
                    return this.state;
                }
            }

            if (this.state.isHorizontalLineMode) {
                const horizontalLine = new HorizontalLineMark(
                    price,
                    '#2962FF',
                    2
                );
                chartSeries.series.attachPrimitive(horizontalLine);
                this.horizontalLines.push(horizontalLine);
                horizontalLine.setShowHandles(true);

                this.state = {
                    ...this.state,
                    isHorizontalLineMode: false,
                    currentHorizontalLine: horizontalLine
                };
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            } else if (this.state.isVerticalLineMode) {
                const verticalLine = new VerticalLineMark(
                    time.toString(),
                    '#2962FF',
                    2
                );
                chartSeries.series.attachPrimitive(verticalLine);
                this.verticalLines.push(verticalLine);
                verticalLine.setShowHandles(true);

                this.state = {
                    ...this.state,
                    isVerticalLineMode: false,
                    currentVerticalLine: verticalLine
                };
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            }
        } catch (error) {
            console.error('Error placing axis line mark:', error);
            this.state = this.cancelAxisLineMode();
        }
        return this.state;
    };

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

            if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
                if (this.state.dragTarget instanceof HorizontalLineMark) {
                    const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                    const currentY = chartSeries.series.priceToCoordinate(price);
                    if (currentStartY === null || currentY === null) return;
                    const deltaY = currentY - currentStartY;
                    this.state.dragTarget.dragLineByPixels(deltaY);
                    this.dragStartData = { time, price };
                } else if (this.state.dragTarget instanceof VerticalLineMark) {
                    const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
                    const currentX = timeScale.timeToCoordinate(time);
                    if (currentStartX === null || currentX === null) return;
                    const deltaX = currentX - currentStartX;
                    this.state.dragTarget.dragLineByPixels(deltaX);
                    this.dragStartData = { time, price };
                }
                return;
            }

            if (!this.state.isDragging && !this.state.isHorizontalLineMode && !this.state.isVerticalLineMode) {
                let anyLineHovered = false;

                for (const mark of this.horizontalLines) {
                    const isNearLine = mark.isPointNearLine(relativeX, relativeY);
                    mark.setShowHandles(isNearLine);
                    if (isNearLine) anyLineHovered = true;
                }

                for (const mark of this.verticalLines) {
                    const isNearLine = mark.isPointNearLine(relativeX, relativeY);
                    mark.setShowHandles(isNearLine);
                    if (isNearLine) anyLineHovered = true;
                }
            }
        } catch (error) {
            console.error('Error updating axis line mark:', error);
        }
    };

    public handleMouseUp = (point: Point): AxisLineMarkState => {
        if (this.state.isDragging) {
            if (this.state.dragTarget) {
                if (this.state.dragTarget instanceof HorizontalLineMark) {
                    this.state.dragTarget.setDragging(false);
                } else if (this.state.dragTarget instanceof VerticalLineMark) {
                    this.state.dragTarget.setDragging(false);
                }
            }
            this.state = {
                ...this.state,
                isDragging: false,
                dragTarget: null
            };
            this.isOperating = false;
        }
        this.mouseDownPoint = null;
        this.dragStartData = null;
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): AxisLineMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isDragging) {
                if (this.state.dragTarget) {
                    if (this.state.dragTarget instanceof HorizontalLineMark) {
                        this.state.dragTarget.setDragging(false);
                    } else if (this.state.dragTarget instanceof VerticalLineMark) {
                        this.state.dragTarget.setDragging(false);
                    }
                }
                this.state = {
                    ...this.state,
                    isDragging: false,
                    dragTarget: null
                };
            } else if (this.state.isHorizontalLineMode || this.state.isVerticalLineMode) {
                return this.cancelAxisLineMode();
            }
        }
        return this.state;
    };

    public getState(): AxisLineMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<AxisLineMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this.horizontalLines.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.verticalLines.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.horizontalLines = [];
        this.verticalLines = [];
    }

    public getHorizontalLines(): HorizontalLineMark[] {
        return [...this.horizontalLines];
    }

    public getVerticalLines(): VerticalLineMark[] {
        return [...this.verticalLines];
    }

    public removeHorizontalLine(mark: HorizontalLineMark): void {
        const index = this.horizontalLines.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.horizontalLines.splice(index, 1);
        }
    }

    public removeVerticalLine(mark: VerticalLineMark): void {
        const index = this.verticalLines.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.verticalLines.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isHorizontalLineMode || this.state.isVerticalLineMode;
    }
}