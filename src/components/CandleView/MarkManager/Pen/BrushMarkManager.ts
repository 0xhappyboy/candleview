import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { BrushMark } from "../../Mark/Pen/BrushMark";
import { Point } from "../../types";

export interface BrushMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface BrushMarkState {
    isBrushMode: boolean;
    isDrawing: boolean;
    currentBrushMark: BrushMark | null;
    isDragging: boolean;
    dragTarget: BrushMark | null;
}

export class BrushMarkManager implements IMarkManager<BrushMark> {
    private props: BrushMarkManagerProps;
    private state: BrushMarkState;
    private BrushMarks: BrushMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private lastPoint: Point | null = null;
    private pointThreshold: number = 0.5;
    private lineWidth: number = 20;

    constructor(props: BrushMarkManagerProps) {
        this.props = props;
        this.state = {
            isBrushMode: false,
            isDrawing: false,
            currentBrushMark: null,
            isDragging: false,
            dragTarget: null
        };
    }

    public clearState(): void {
        this.state = {
            isBrushMode: false,
            isDrawing: false,
            currentBrushMark: null,
            isDragging: false,
            dragTarget: null
        };
    }

    private updateCursor(): void {
        const { containerRef } = this.props;
        if (!containerRef.current) return;
        if (this.state.isBrushMode) {
            containerRef.current.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"%23396\" d=\"M20.71 4.63l-1.34-1.34c-.37-.39-1.02-.39-1.41 0L9.75 12.5l2.75 2.75 7.21-7.21c.39-.39.39-1.02 0-1.41zM7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3z\"/></svg>') 2 18, auto";
        } else {
            containerRef.current.style.cursor = "default";
        }
    }

    getCurrentDragPoint(): string | null {
        throw new Error("Method not implemented.");
    }

    public getMarkAtPoint(point: Point): BrushMark | null {
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

            for (let i = this.BrushMarks.length - 1; i >= 0; i--) {
                const mark = this.BrushMarks[i];
                if (mark.isPointNearPath(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
        }
        return null;
    }

    public getCurrentDragTarget(): BrushMark | null {
        return this.state.dragTarget;
    }

    public getCurrentOperatingMark(): BrushMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.state.currentBrushMark) {
            return this.state.currentBrushMark;
        }
        return null;
    }

    public getAllMarks(): BrushMark[] {
        return [...this.BrushMarks];
    }

    public cancelOperationMode() {
        return this.cancelBrushMode();
    }

    public setBrushMode = (): BrushMarkState => {
        this.state = {
            ...this.state,
            isBrushMode: true,
            isDrawing: false,
            currentBrushMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.updateCursor();
        this.BrushMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        return this.state;
    };

    public cancelBrushMode = (): BrushMarkState => {
        if (this.state.currentBrushMark && this.state.currentBrushMark.getPointCount() < 2) {
            this.props.chartSeries?.series.detachPrimitive(this.state.currentBrushMark);
        }
        this.BrushMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isBrushMode: false,
            isDrawing: false,
            currentBrushMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.updateCursor();
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): BrushMarkState => {
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
            if (this.state.isBrushMode) {
                const newBrushMark = new BrushMark(
                    [{ time, price }],
                    '#FF6B35',
                    this.lineWidth,
                    false
                );
                chartSeries.series.attachPrimitive(newBrushMark);
                this.state = {
                    ...this.state,
                    isDrawing: true,
                    currentBrushMark: newBrushMark
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
            if (this.state.isDrawing && this.state.currentBrushMark) {
                if (this.lastPoint) {
                    const distance = Math.sqrt(
                        Math.pow(point.x - this.lastPoint.x, 2) +
                        Math.pow(point.y - this.lastPoint.y, 2)
                    );
                    if (distance >= this.pointThreshold) {
                        this.state.currentBrushMark.addPoint(time, price);
                        this.lastPoint = point;
                    }
                } else {
                    this.state.currentBrushMark.addPoint(time, price);
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
            } else if (!this.state.isBrushMode && !this.state.isDragging && !this.state.isDrawing) {
                const hoveredMark = this.getMarkAtPoint(point);
                this.BrushMarks.forEach(mark => {
                    mark.setShowHandles(mark === hoveredMark);
                });
            }
        } catch (error) {
        }
    };

    public handleMouseUp = (point: Point): BrushMarkState => {
        if (this.state.isDrawing && this.state.currentBrushMark) {
            if (this.state.currentBrushMark.getPointCount() >= 2) {
                this.BrushMarks.push(this.state.currentBrushMark);
            } else {
                this.props.chartSeries?.series.detachPrimitive(this.state.currentBrushMark);
            }
            this.state = {
                ...this.state,
                isDrawing: false,
                currentBrushMark: null
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

    public handleKeyDown = (event: KeyboardEvent): BrushMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isBrushMode) {
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
                return this.cancelBrushMode();
            }
        }
        return this.state;
    };

    public getState(): BrushMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<BrushMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this.BrushMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.BrushMarks = [];
        if (this.props.containerRef.current) {
            this.props.containerRef.current.style.cursor = "default";
        }
        this.hiddenBrushMarks = [];
        this.BrushMarks = [];
    }

    public getBrushMarks(): BrushMark[] {
        return [...this.BrushMarks];
    }

    public removeBrushMark(mark: BrushMark): void {
        const index = this.BrushMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.BrushMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isDrawing || this.state.isBrushMode;
    }

    public setPointThreshold(threshold: number): void {
        this.pointThreshold = threshold;
    }

    private hiddenBrushMarks: BrushMark[] = [];

    public hideAllMarks(): void {
        this.hiddenBrushMarks.push(...this.BrushMarks);
        this.BrushMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.BrushMarks = [];
    }

    public showAllMarks(): void {
        this.BrushMarks.push(...this.hiddenBrushMarks);
        this.hiddenBrushMarks.forEach(mark => {
            this.props.chartSeries?.series.attachPrimitive(mark);
        });
        this.hiddenBrushMarks = [];
    }

    public hideMark(mark: BrushMark): void {
        const index = this.BrushMarks.indexOf(mark);
        if (index > -1) {
            this.BrushMarks.splice(index, 1);
            this.hiddenBrushMarks.push(mark);
            this.props.chartSeries?.series.detachPrimitive(mark);
        }
    }

    public showMark(mark: BrushMark): void {
        const index = this.hiddenBrushMarks.indexOf(mark);
        if (index > -1) {
            this.hiddenBrushMarks.splice(index, 1);
            this.BrushMarks.push(mark);
            this.props.chartSeries?.series.attachPrimitive(mark);
        }
    }
}