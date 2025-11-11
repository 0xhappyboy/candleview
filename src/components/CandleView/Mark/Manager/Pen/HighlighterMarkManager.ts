import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { IMarkManager } from "../../IMarkManager";
import { HighlighterPenMark } from "../../Pen/HighlighterPenMark";

export interface HighlighterPenMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface HighlighterPenMarkState {
    isHighlighterMode: boolean;
    isDrawing: boolean;
    currentHighlighterPenMark: HighlighterPenMark | null;
    isDragging: boolean;
    dragTarget: HighlighterPenMark | null;
}

export class HighlighterPenMarkManager implements IMarkManager<HighlighterPenMark> {
    private props: HighlighterPenMarkManagerProps;
    private state: HighlighterPenMarkState;
    private HighlighterPenMarks: HighlighterPenMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private lastPoint: Point | null = null;
    private pointThreshold: number = 3;
    private lineWidth: number = 10;
    private penColor: string = 'rgba(82, 255, 59, 0.3)';

    constructor(props: HighlighterPenMarkManagerProps) {
        this.props = props;
        this.state = {
            isHighlighterMode: false,
            isDrawing: false,
            currentHighlighterPenMark: null,
            isDragging: false,
            dragTarget: null
        };
    }

    private updateCursor(): void {
        const { containerRef } = this.props;
        if (!containerRef.current) return;
        if (this.state.isHighlighterMode) {
            const cursorSVG = `
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                    <defs>
                        <filter id="highlighterGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                            <feMerge>
                                <feMergeNode in="blur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <g filter="url(#highlighterGlow)" opacity="0.8">
                        <path d="M6 20 L26 8 L28 12 L8 24 Z" 
                              fill="#FFEB3B" 
                              stroke="#FFC107" 
                              stroke-width="1"
                              stroke-linejoin="round"/>
                        <path d="M8 22 L26 10" 
                              stroke="white" 
                              stroke-width="1" 
                              stroke-opacity="0.6"
                              stroke-linecap="round"/>
                        <rect x="22" y="4" width="6" height="20" rx="2" 
                              fill="#4CAF50" 
                              stroke="#388E3C" 
                              stroke-width="1"/>
                        <rect x="23" y="7" width="4" height="2" rx="1" fill="#81C784"/>
                        <rect x="23" y="11" width="4" height="2" rx="1" fill="#81C784"/>
                        <rect x="23" y="15" width="4" height="2" rx="1" fill="#81C784"/>
                    </g>
                    <circle cx="8" cy="22" r="1" fill="#FF5722" opacity="0.9"/>
                </svg>
            `;
            const encodedSVG = encodeURIComponent(cursorSVG);
            containerRef.current.style.cursor = `url('data:image/svg+xml;utf8,${encodedSVG}') 8 22, crosshair`;
        } else {
            containerRef.current.style.cursor = "default";
        }
    }

    getCurrentDragPoint(): string | null {
        throw new Error("Method not implemented.");
    }

    public getMarkAtPoint(point: Point): HighlighterPenMark | null {
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

            for (let i = this.HighlighterPenMarks.length - 1; i >= 0; i--) {
                const mark = this.HighlighterPenMarks[i];
                if (mark.isPointNearPath(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error('Error getting mark at point:', error);
        }
        return null;
    }

    public getCurrentDragTarget(): HighlighterPenMark | null {
        return this.state.dragTarget;
    }

    public getCurrentOperatingMark(): HighlighterPenMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.state.currentHighlighterPenMark) {
            return this.state.currentHighlighterPenMark;
        }
        return null;
    }

    public getAllMarks(): HighlighterPenMark[] {
        return [...this.HighlighterPenMarks];
    }

    public cancelOperationMode() {
        return this.cancelHighlighterMode();
    }

    public setHighlighterPenMode = (): HighlighterPenMarkState => {
        this.state = {
            ...this.state,
            isHighlighterMode: true,
            isDrawing: false,
            currentHighlighterPenMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.updateCursor();
        this.HighlighterPenMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        return this.state;
    };

    public cancelHighlighterMode = (): HighlighterPenMarkState => {
        if (this.state.currentHighlighterPenMark && this.state.currentHighlighterPenMark.getPointCount() < 2) {
            this.props.chartSeries?.series.detachPrimitive(this.state.currentHighlighterPenMark);
        }
        this.HighlighterPenMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isHighlighterMode: false,
            isDrawing: false,
            currentHighlighterPenMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.updateCursor();
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): HighlighterPenMarkState => {
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
            if (this.state.isHighlighterMode) {
                const newHighlighterPenMark = new HighlighterPenMark(
                    [{ time: time.toString(), price }],
                    this.penColor,
                    this.lineWidth,
                    false
                );
                chartSeries.series.attachPrimitive(newHighlighterPenMark);
                this.state = {
                    ...this.state,
                    isDrawing: true,
                    currentHighlighterPenMark: newHighlighterPenMark
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
            console.error('Error starting Highlighter drawing:', error);
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
            if (this.state.isDrawing && this.state.currentHighlighterPenMark) {
                if (this.lastPoint) {
                    const distance = Math.sqrt(
                        Math.pow(point.x - this.lastPoint.x, 2) +
                        Math.pow(point.y - this.lastPoint.y, 2)
                    );
                    if (distance >= this.pointThreshold) {
                        this.state.currentHighlighterPenMark.addPoint(time.toString(), price);
                        this.lastPoint = point;
                    }
                } else {
                    this.state.currentHighlighterPenMark.addPoint(time.toString(), price);
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
            } else if (!this.state.isHighlighterMode && !this.state.isDragging && !this.state.isDrawing) {
                const hoveredMark = this.getMarkAtPoint(point);
                this.HighlighterPenMarks.forEach(mark => {
                    mark.setShowHandles(mark === hoveredMark);
                });
            }
        } catch (error) {
            console.error('Error updating Highlighter drawing:', error);
        }
    };

    public handleMouseUp = (point: Point): HighlighterPenMarkState => {
        if (this.state.isDrawing && this.state.currentHighlighterPenMark) {
            if (this.state.currentHighlighterPenMark.getPointCount() >= 2) {
                this.HighlighterPenMarks.push(this.state.currentHighlighterPenMark);
            } else {
                this.props.chartSeries?.series.detachPrimitive(this.state.currentHighlighterPenMark);
            }
            this.state = {
                ...this.state,
                isDrawing: false,
                currentHighlighterPenMark: null
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

    public handleKeyDown = (event: KeyboardEvent): HighlighterPenMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isHighlighterMode) {
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
                return this.cancelHighlighterMode();
            }
        }
        return this.state;
    };

    public getState(): HighlighterPenMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<HighlighterPenMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this.HighlighterPenMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.HighlighterPenMarks = [];
        if (this.props.containerRef.current) {
            this.props.containerRef.current.style.cursor = "default";
        }
    }

    public getHighlighterPenMarks(): HighlighterPenMark[] {
        return [...this.HighlighterPenMarks];
    }

    public removeHighlighterPenMark(mark: HighlighterPenMark): void {
        const index = this.HighlighterPenMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.HighlighterPenMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isDrawing || this.state.isHighlighterMode;
    }

    public setPointThreshold(threshold: number): void {
        this.pointThreshold = threshold;
    }
}