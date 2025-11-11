import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { IMarkManager } from "../../IMarkManager";
import { PenMark } from "../../Pen/PenMark";

export interface PenMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface PenMarkState {
    isPenMode: boolean;
    isDrawing: boolean;
    currentPenMark: PenMark | null;
    isDragging: boolean;
    dragTarget: PenMark | null;
}

export class PenMarkManager implements IMarkManager<PenMark> {
    private props: PenMarkManagerProps;
    private state: PenMarkState;
    private PenMarks: PenMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private lastPoint: Point | null = null;
    private pointThreshold: number = 2;
    private lineWidth: number = 4;

    constructor(props: PenMarkManagerProps) {
        this.props = props;
        this.state = {
            isPenMode: false,
            isDrawing: false,
            currentPenMark: null,
            isDragging: false,
            dragTarget: null
        };
    }

    private updateCursor(): void {
        const { containerRef } = this.props;
        if (!containerRef.current) return;
        if (this.state.isPenMode) {
            containerRef.current.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\"><defs><linearGradient id=\"silver\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\"><stop offset=\"0%\" style=\"stop-color:%23e0e0e0;stop-opacity:1\" /><stop offset=\"100%\" style=\"stop-color:%23999;stop-opacity:1\" /></linearGradient><filter id=\"outline\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\"><feMorphology operator=\"dilate\" radius=\"1\" in=\"SourceAlpha\" result=\"thicker\"/><feFlood flood-color=\"white\" result=\"whiteFill\"/><feComposite in=\"whiteFill\" in2=\"thicker\" operator=\"in\" result=\"whiteOutline\"/><feMerge><feMergeNode in=\"whiteOutline\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter></defs><g filter=\"url(%23outline)\"><path fill=\"%230074D9\" d=\"M12 19L19 12L22 15L15 22L12 19Z\"/><path fill=\"url(%23silver)\" d=\"M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z\"/><path fill=\"%23666\" d=\"M2 2L9.5 9.5\"/><path fill=\"white\" fill-opacity=\"0.3\" d=\"M17.5 12l-5 5 1.5 1.5 5-5-1.5-1.5z\"/></g></svg>') 2 2, crosshair";
        } else {
            containerRef.current.style.cursor = "default";
        }
    }

    getCurrentDragPoint(): string | null {
        throw new Error("Method not implemented.");
    }

    public getMarkAtPoint(point: Point): PenMark | null {
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
            for (let i = this.PenMarks.length - 1; i >= 0; i--) {
                const mark = this.PenMarks[i];
                if (mark.isPointNearPath(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): PenMark | null {
        return this.state.dragTarget;
    }

    public getCurrentOperatingMark(): PenMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.state.currentPenMark) {
            return this.state.currentPenMark;
        }
        return null;
    }

    public getAllMarks(): PenMark[] {
        return [...this.PenMarks];
    }

    public cancelOperationMode() {
        return this.cancelPenMode();
    }

    public setPenMode = (): PenMarkState => {
        this.state = {
            ...this.state,
            isPenMode: true,
            isDrawing: false,
            currentPenMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.updateCursor();
        this.PenMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        return this.state;
    };

    public cancelPenMode = (): PenMarkState => {
        if (this.state.currentPenMark && this.state.currentPenMark.getPointCount() < 2) {
            this.props.chartSeries?.series.detachPrimitive(this.state.currentPenMark);
        }
        this.PenMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isPenMode: false,
            isDrawing: false,
            currentPenMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.updateCursor();
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): PenMarkState => {
        const { chartSeries, chart, containerRef } = this.props;
        if (!chartSeries || !chart) return this.state;
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
            this.lastPoint = point;
            this.dragStartData = { time, price };
            if (this.state.isPenMode) {
                const newPenMark = new PenMark(
                    [{ time: time.toString(), price }],
                    '#0074D9',
                    this.lineWidth,
                    false
                );
                chartSeries.series.attachPrimitive(newPenMark);
                this.state = {
                    ...this.state,
                    isDrawing: true,
                    currentPenMark: newPenMark
                };
                this.isOperating = true;
            } else {
                const targetMark = this.getMarkAtPoint(point);
                if (targetMark) {
                    this.state = {
                        ...this.state,
                        isDragging: true,
                        dragTarget: targetMark
                    };
                    targetMark.setDragging(true);
                    targetMark.setShowHandles(true);
                    this.isOperating = true;
                }
            }
        } catch (error) {
            console.error(error);
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
            if (this.state.isDrawing && this.state.currentPenMark) {
                if (this.lastPoint) {
                    const distance = Math.sqrt(
                        Math.pow(point.x - this.lastPoint.x, 2) +
                        Math.pow(point.y - this.lastPoint.y, 2)
                    );
                    if (distance >= this.pointThreshold) {
                        this.state.currentPenMark.addPoint(time.toString(), price);
                        this.lastPoint = point;
                    }
                } else {
                    this.state.currentPenMark.addPoint(time.toString(), price);
                    this.lastPoint = point;
                }
            } else if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
                if (this.dragStartData.time === null || time === null) return;
                const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
                const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                const currentX = timeScale.timeToCoordinate(time);
                const currentY = chartSeries.series.priceToCoordinate(price);
                if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;
                const deltaX = currentX - currentStartX;
                const deltaY = currentY - currentStartY;
                this.state.dragTarget.dragByPixels(deltaX, deltaY);
                this.dragStartData = { time, price };
            } else if (!this.state.isPenMode && !this.state.isDragging && !this.state.isDrawing) {
                const hoveredMark = this.getMarkAtPoint(point);
                this.PenMarks.forEach(mark => {
                    mark.setShowHandles(mark === hoveredMark);
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): PenMarkState => {
        if (this.state.isDrawing && this.state.currentPenMark) {
            if (this.state.currentPenMark.getPointCount() >= 2) {
                this.PenMarks.push(this.state.currentPenMark);
            } else {
                this.props.chartSeries?.series.detachPrimitive(this.state.currentPenMark);
            }
            this.state = {
                ...this.state,
                isDrawing: false,
                currentPenMark: null
            };
        } else if (this.state.isDragging && this.state.dragTarget) {
            this.state.dragTarget.setDragging(false);
            this.state = {
                ...this.state,
                isDragging: false,
                dragTarget: null
            };
        }
        this.dragStartData = null;
        this.lastPoint = null;
        this.isOperating = false;
        return this.state;
    };

    public handleKeyDown = (event: KeyboardEvent): PenMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isPenMode) {
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
                return this.cancelPenMode();
            }
        }
        return this.state;
    };

    public getState(): PenMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<PenMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this.PenMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.PenMarks = [];
        if (this.props.containerRef.current) {
            this.props.containerRef.current.style.cursor = "default";
        }
    }

    public getPenMarks(): PenMark[] {
        return [...this.PenMarks];
    }

    public removePenMark(mark: PenMark): void {
        const index = this.PenMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.PenMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isDrawing || this.state.isPenMode;
    }

    public setPointThreshold(threshold: number): void {
        this.pointThreshold = threshold;
    }
}