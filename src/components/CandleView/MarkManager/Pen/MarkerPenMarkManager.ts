import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { MarkerPenMark } from "../../Mark/Pen/MarkerPenMark";
import { Point } from "../../types";

export interface MarkerPenMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface MarkerPenMarkState {
    isMarkerPenMarkMode: boolean;
    isDrawing: boolean;
    currentMarkerPenMark: MarkerPenMark | null;
    isDragging: boolean;
    dragTarget: MarkerPenMark | null;
}

export class MarkerPenMarkManager implements IMarkManager<MarkerPenMark> {
    private props: MarkerPenMarkManagerProps;
    private state: MarkerPenMarkState;
    private MarkerPenMarks: MarkerPenMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private lastPoint: Point | null = null;
    private pointThreshold: number = 3;
    private lineWidth: number = 10;

    constructor(props: MarkerPenMarkManagerProps) {
        this.props = props;
        this.state = {
            isMarkerPenMarkMode: false,
            isDrawing: false,
            currentMarkerPenMark: null,
            isDragging: false,
            dragTarget: null
        };
    }

    public clearState(): void {
        this.state = {
            isMarkerPenMarkMode: false,
            isDrawing: false,
            currentMarkerPenMark: null,
            isDragging: false,
            dragTarget: null
        };
    }

    private updateCursor(): void {
        const { containerRef } = this.props;
        if (!containerRef.current) return;
        if (this.state.isMarkerPenMarkMode) {
            containerRef.current.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\" viewBox=\"0 0 40 40\"><defs><filter id=\"s\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\"><feDropShadow dx=\"1\" dy=\"1\" stdDeviation=\"1.5\" flood-color=\"%23000000\" flood-opacity=\"0.4\"/></filter></defs><g filter=\"url(%23s)\"><ellipse cx=\"20\" cy=\"32\" rx=\"10\" ry=\"6\" fill=\"%23FF6B6B\" stroke=\"%23C53030\" stroke-width=\"1\"/><ellipse cx=\"20\" cy=\"30\" rx=\"7\" ry=\"3\" fill=\"%23FFFFFF\" opacity=\"0.3\"/><rect x=\"15\" y=\"8\" width=\"10\" height=\"24\" rx=\"2\" fill=\"%23FF6B6B\" stroke=\"%23C53030\" stroke-width=\"1\"/><rect x=\"17\" y=\"12\" width=\"6\" height=\"1\" rx=\"0.5\" fill=\"%23FFFFFF\" opacity=\"0.4\"/><rect x=\"17\" y=\"15\" width=\"6\" height=\"1\" rx=\"0.5\" fill=\"%23FFFFFF\" opacity=\"0.4\"/><rect x=\"17\" y=\"18\" width=\"6\" height=\"1\" rx=\"0.5\" fill=\"%23FFFFFF\" opacity=\"0.4\"/><rect x=\"13\" y=\"4\" width=\"14\" height=\"6\" rx=\"3\" fill=\"%234A5568\"/></g></svg>') 20 34, auto";
        } else {
            containerRef.current.style.cursor = "default";
        }
    }

    getCurrentDragPoint(): string | null {
        throw new Error("Method not implemented.");
    }

    public getMarkAtPoint(point: Point): MarkerPenMark | null {
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

            for (let i = this.MarkerPenMarks.length - 1; i >= 0; i--) {
                const mark = this.MarkerPenMarks[i];
                if (mark.isPointNearPath(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): MarkerPenMark | null {
        return this.state.dragTarget;
    }

    public getCurrentOperatingMark(): MarkerPenMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.state.currentMarkerPenMark) {
            return this.state.currentMarkerPenMark;
        }
        return null;
    }

    public getAllMarks(): MarkerPenMark[] {
        return [...this.MarkerPenMarks];
    }

    public cancelOperationMode() {
        return this.cancelMarkerPenMarkMode();
    }

    public setMarkerPenMarkMode = (): MarkerPenMarkState => {
        this.state = {
            ...this.state,
            isMarkerPenMarkMode: true,
            isDrawing: false,
            currentMarkerPenMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.updateCursor();
        this.MarkerPenMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        return this.state;
    };

    public cancelMarkerPenMarkMode = (): MarkerPenMarkState => {
        if (this.state.currentMarkerPenMark && this.state.currentMarkerPenMark.getPointCount() < 2) {
            this.props.chartSeries?.series.detachPrimitive(this.state.currentMarkerPenMark);
        }
        this.MarkerPenMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isMarkerPenMarkMode: false,
            isDrawing: false,
            currentMarkerPenMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.updateCursor();
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): MarkerPenMarkState => {
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
            if (this.state.isMarkerPenMarkMode) {
                const newMarkerPenMark = new MarkerPenMark(
                    [{ time, price }],
                    '#FF6B6B',
                    this.lineWidth,
                    false
                );
                chartSeries.series.attachPrimitive(newMarkerPenMark);
                this.state = {
                    ...this.state,
                    isDrawing: true,
                    currentMarkerPenMark: newMarkerPenMark
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
            if (this.state.isDrawing && this.state.currentMarkerPenMark) {
                if (this.lastPoint) {
                    const distance = Math.sqrt(
                        Math.pow(point.x - this.lastPoint.x, 2) +
                        Math.pow(point.y - this.lastPoint.y, 2)
                    );
                    if (distance >= this.pointThreshold) {
                        this.state.currentMarkerPenMark.addPoint(time, price);
                        this.lastPoint = point;
                    }
                } else {
                    this.state.currentMarkerPenMark.addPoint(time, price);
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
            } else if (!this.state.isMarkerPenMarkMode && !this.state.isDragging && !this.state.isDrawing) {
                const hoveredMark = this.getMarkAtPoint(point);
                this.MarkerPenMarks.forEach(mark => {
                    mark.setShowHandles(mark === hoveredMark);
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): MarkerPenMarkState => {
        if (this.state.isDrawing && this.state.currentMarkerPenMark) {
            if (this.state.currentMarkerPenMark.getPointCount() >= 2) {
                this.MarkerPenMarks.push(this.state.currentMarkerPenMark);
            } else {
                this.props.chartSeries?.series.detachPrimitive(this.state.currentMarkerPenMark);
            }
            this.state = {
                ...this.state,
                isDrawing: false,
                currentMarkerPenMark: null
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

    public handleKeyDown = (event: KeyboardEvent): MarkerPenMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isMarkerPenMarkMode) {
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
                return this.cancelMarkerPenMarkMode();
            }
        }
        return this.state;
    };

    public getState(): MarkerPenMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<MarkerPenMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this.MarkerPenMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.MarkerPenMarks = [];
        if (this.props.containerRef.current) {
            this.props.containerRef.current.style.cursor = "default";
        }
    }

    public getMarkerPenMarks(): MarkerPenMark[] {
        return [...this.MarkerPenMarks];
    }

    public removeMarkerPenMark(mark: MarkerPenMark): void {
        const index = this.MarkerPenMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.MarkerPenMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isDrawing || this.state.isMarkerPenMarkMode;
    }

    public setPointThreshold(threshold: number): void {
        this.pointThreshold = threshold;
    }
}