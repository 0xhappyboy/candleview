import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { PencilMark } from "../../Mark/Pen/PencilMark";
import { Point } from "../../types";

export interface PencilMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface PencilMarkState {
    isPencilMode: boolean;
    isDrawing: boolean;
    currentPencilMark: PencilMark | null;
    isDragging: boolean;
    dragTarget: PencilMark | null;
}

export class PencilMarkManager implements IMarkManager<PencilMark> {
    private props: PencilMarkManagerProps;
    private state: PencilMarkState;
    private PencilMarks: PencilMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private lastPoint: Point | null = null;
    private pointThreshold: number = 3;

    constructor(props: PencilMarkManagerProps) {
        this.props = props;
        this.state = {
            isPencilMode: false,
            isDrawing: false,
            currentPencilMark: null,
            isDragging: false,
            dragTarget: null
        };
    }

    public clearState(): void {
        this.state = {
            isPencilMode: false,
            isDrawing: false,
            currentPencilMark: null,
            isDragging: false,
            dragTarget: null
        };
    }

    private updateCursor(): void {
        const { containerRef } = this.props;
        if (!containerRef.current) return;
        if (this.state.isPencilMode) {
            containerRef.current.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><defs><filter id=\"outline\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\"><feMorphology operator=\"dilate\" radius=\"1\" in=\"SourceAlpha\" result=\"thicker\"/><feFlood flood-color=\"white\" result=\"whiteFill\"/><feComposite in=\"whiteFill\" in2=\"thicker\" operator=\"in\" result=\"whiteOutline\"/><feMerge><feMergeNode in=\"whiteOutline\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter></defs><g filter=\"url(%23outline)\"><path fill=\"black\" d=\"M6 22.5V28h5.5L26 13.5 20.5 8 6 22.5z\"/><path fill=\"%23333\" d=\"M26 13.5l2.5-2.5-5-5-2.5 2.5 5 5z\"/><rect x=\"18\" y=\"6\" width=\"2\" height=\"20\" rx=\"1\" fill=\"%23666\" transform=\"rotate(45 19 16)\"/><circle cx=\"7\" cy=\"25\" r=\"2\" fill=\"%23D32F2F\" stroke=\"white\" stroke-width=\"1\"/><path fill=\"white\" fill-opacity=\"0.3\" d=\"M6.5 23l14-14 0.5 0.5L7 23.5l-0.5-0.5z\"/></g></svg>') 6 26, auto";
        } else {
            containerRef.current.style.cursor = "default";
        }
    }

    getCurrentDragPoint(): string | null {
        throw new Error("Method not implemented.");
    }

    public getMarkAtPoint(point: Point): PencilMark | null {
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

            for (let i = this.PencilMarks.length - 1; i >= 0; i--) {
                const mark = this.PencilMarks[i];
                if (mark.isPointNearPath(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
        }
        return null;
    }

    public getCurrentDragTarget(): PencilMark | null {
        return this.state.dragTarget;
    }

    public getCurrentOperatingMark(): PencilMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.state.currentPencilMark) {
            return this.state.currentPencilMark;
        }
        return null;
    }

    public getAllMarks(): PencilMark[] {
        return [...this.PencilMarks];
    }

    public cancelOperationMode() {
        return this.cancelPencilMode();
    }

    public setPencilMode = (): PencilMarkState => {
        this.state = {
            ...this.state,
            isPencilMode: true,
            isDrawing: false,
            currentPencilMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.updateCursor();
        this.PencilMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        return this.state;
    };

    public cancelPencilMode = (): PencilMarkState => {
        if (this.state.currentPencilMark && this.state.currentPencilMark.getPointCount() < 2) {
            this.props.chartSeries?.series.detachPrimitive(this.state.currentPencilMark);
        }
        this.PencilMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isPencilMode: false,
            isDrawing: false,
            currentPencilMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.updateCursor();
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): PencilMarkState => {
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
            if (this.state.isPencilMode) {
                const newPencilMark = new PencilMark(
                    [{ time, price }],
                    '#2962FF',
                    2,
                    false
                );
                chartSeries.series.attachPrimitive(newPencilMark);
                this.state = {
                    ...this.state,
                    isDrawing: true,
                    currentPencilMark: newPencilMark
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
            if (this.state.isDrawing && this.state.currentPencilMark) {
                if (this.lastPoint) {
                    const distance = Math.sqrt(
                        Math.pow(point.x - this.lastPoint.x, 2) +
                        Math.pow(point.y - this.lastPoint.y, 2)
                    );
                    if (distance >= this.pointThreshold) {
                        this.state.currentPencilMark.addPoint(time, price);
                        this.lastPoint = point;
                    }
                } else {
                    this.state.currentPencilMark.addPoint(time, price);
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
            } else if (!this.state.isPencilMode && !this.state.isDragging && !this.state.isDrawing) {
                const hoveredMark = this.getMarkAtPoint(point);
                this.PencilMarks.forEach(mark => {
                    mark.setShowHandles(mark === hoveredMark);
                });
            }
        } catch (error) {
        }
    };

    public handleMouseUp = (point: Point): PencilMarkState => {
        if (this.state.isDrawing && this.state.currentPencilMark) {
            if (this.state.currentPencilMark.getPointCount() >= 2) {
                this.PencilMarks.push(this.state.currentPencilMark);
            } else {
                this.props.chartSeries?.series.detachPrimitive(this.state.currentPencilMark);
            }
            this.state = {
                ...this.state,
                isDrawing: false,
                currentPencilMark: null
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

    public handleKeyDown = (event: KeyboardEvent): PencilMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isPencilMode) {
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
                return this.cancelPencilMode();
            }
        }
        return this.state;
    };

    public getState(): PencilMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<PencilMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this.PencilMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.PencilMarks = [];
        if (this.props.containerRef.current) {
            this.props.containerRef.current.style.cursor = "default";
        }
        this.hiddenPencilMarks = [];
        this.PencilMarks = [];
    }

    public getPencilMarks(): PencilMark[] {
        return [...this.PencilMarks];
    }

    public removePencilMark(mark: PencilMark): void {
        const index = this.PencilMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.PencilMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isDrawing || this.state.isPencilMode;
    }

    public setPointThreshold(threshold: number): void {
        this.pointThreshold = threshold;
    }

    private hiddenPencilMarks: PencilMark[] = [];

    public hideAllMarks(): void {
        this.hiddenPencilMarks.push(...this.PencilMarks);
        this.PencilMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.PencilMarks = [];
    }

    public showAllMarks(): void {
        this.PencilMarks.push(...this.hiddenPencilMarks);
        this.hiddenPencilMarks.forEach(mark => {
            this.props.chartSeries?.series.attachPrimitive(mark);
        });
        this.hiddenPencilMarks = [];
    }

    public hideMark(mark: PencilMark): void {
        const index = this.PencilMarks.indexOf(mark);
        if (index > -1) {
            this.PencilMarks.splice(index, 1);
            this.hiddenPencilMarks.push(mark);
            this.props.chartSeries?.series.detachPrimitive(mark);
        }
    }

    public showMark(mark: PencilMark): void {
        const index = this.hiddenPencilMarks.indexOf(mark);
        if (index > -1) {
            this.hiddenPencilMarks.splice(index, 1);
            this.PencilMarks.push(mark);
            this.props.chartSeries?.series.attachPrimitive(mark);
        }
    }
}