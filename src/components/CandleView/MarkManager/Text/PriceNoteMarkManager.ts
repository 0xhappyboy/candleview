import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { PriceNoteMark } from "../../Mark/Text/PriceNoteMark";
import { Point } from "../../types";

export interface PriceNoteMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface PriceNoteMarkState {
    isPriceNoteMarkMode: boolean;
    priceNoteMarkStartPoint: Point | null;
    currentPriceNoteMark: PriceNoteMark | null;
    isDragging: boolean;
    dragTarget: PriceNoteMark | null;
    dragPoint: 'start' | 'end' | 'line' | null;
}

export class PriceNoteMarkManager implements IMarkManager<PriceNoteMark> {
    private props: PriceNoteMarkManagerProps;
    private state: PriceNoteMarkState;
    private previewPriceNoteMark: PriceNoteMark | null = null;
    private priceNoteMarks: PriceNoteMark[] = [];
    private mouseDownPoint: Point | null = null;
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;

    constructor(props: PriceNoteMarkManagerProps) {
        this.props = props;
        this.state = {
            isPriceNoteMarkMode: false,
            priceNoteMarkStartPoint: null,
            currentPriceNoteMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
    }

    public clearState(): void {
        this.state = {
            isPriceNoteMarkMode: false,
            priceNoteMarkStartPoint: null,
            currentPriceNoteMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
    }

    public getMarkAtPoint(point: Point): PriceNoteMark | null {
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
            for (const mark of this.priceNoteMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }
            for (const mark of this.priceNoteMarks) {
                const bounds = mark.getBounds();
                if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): PriceNoteMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): PriceNoteMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewPriceNoteMark) {
            return this.previewPriceNoteMark;
        }
        if (this.state.isPriceNoteMarkMode && this.state.currentPriceNoteMark) {
            return this.state.currentPriceNoteMark;
        }
        return null;
    }

    public getAllMarks(): PriceNoteMark[] {
        return [...this.priceNoteMarks];
    }

    public cancelOperationMode() {
        return this.cancelPriceNoteMarkMode();
    }

    public setPriceNoteMarkMode = (): PriceNoteMarkState => {
        this.state = {
            ...this.state,
            isPriceNoteMarkMode: true,
            priceNoteMarkStartPoint: null,
            currentPriceNoteMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
        return this.state;
    };

    public cancelPriceNoteMarkMode = (): PriceNoteMarkState => {
        if (this.previewPriceNoteMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewPriceNoteMark);
            this.previewPriceNoteMark = null;
        }
        this.priceNoteMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setShowPriceNote(false);
        });
        this.state = {
            ...this.state,
            isPriceNoteMarkMode: false,
            priceNoteMarkStartPoint: null,
            currentPriceNoteMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): PriceNoteMarkState => {
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
            for (const mark of this.priceNoteMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    if (!this.state.isPriceNoteMarkMode) {
                        this.state = {
                            ...this.state,
                            isPriceNoteMarkMode: true,
                            isDragging: false,
                            dragTarget: mark,
                            dragPoint: handleType
                        };
                        this.priceNoteMarks.forEach(m => {
                            m.setShowHandles(m === mark);
                            m.setShowPriceNote(m === mark);
                        });
                        this.isOperating = true;
                    } else {
                        if (this.state.dragPoint === 'start') {
                            mark.updateStartPoint(time.toString(), price);
                        } else if (this.state.dragPoint === 'end') {
                            mark.updateEndPoint(time.toString(), price);
                        }
                        this.state = {
                            ...this.state,
                            isPriceNoteMarkMode: false,
                            isDragging: false,
                            dragTarget: null,
                            dragPoint: null
                        };
                        this.isOperating = false;
                        this.priceNoteMarks.forEach(m => {
                            m.setShowHandles(false);
                            m.setShowPriceNote(true);
                        });
                        if (this.props.onCloseDrawing) {
                            this.props.onCloseDrawing();
                        }
                    }
                    return this.state;
                }
            }

            for (const mark of this.priceNoteMarks) {
                const bounds = mark.getBounds();
                if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
                    this.state = {
                        ...this.state,
                        isDragging: true,
                        dragTarget: mark,
                        dragPoint: 'line'
                    };
                    mark.setDragging(true, 'line');
                    this.priceNoteMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                        m.setShowPriceNote(m === mark);
                    });
                    this.isOperating = true;
                    return this.state;
                }
            }

            if (this.state.isPriceNoteMarkMode && !this.state.isDragging) {
                if (!this.state.priceNoteMarkStartPoint) {
                    this.state = {
                        ...this.state,
                        priceNoteMarkStartPoint: point
                    };
                    this.previewPriceNoteMark = new PriceNoteMark(
                        time.toString(),
                        price,
                        time.toString(),
                        price,
                        '#2962FF',
                        2,
                        false
                    );
                    chartSeries.series.attachPrimitive(this.previewPriceNoteMark);
                    this.priceNoteMarks.forEach(m => {
                        m.setShowHandles(false);
                        m.setShowPriceNote(true);
                    });
                    this.previewPriceNoteMark.setShowHandles(true);
                    this.previewPriceNoteMark.setShowPriceNote(true);
                } else {
                    if (this.previewPriceNoteMark) {
                        chartSeries.series.detachPrimitive(this.previewPriceNoteMark);
                        const finalPriceNoteMark = new PriceNoteMark(
                            this.previewPriceNoteMark.getStartTime(),
                            this.previewPriceNoteMark.getStartPrice(),
                            time.toString(),
                            price,
                            '#2962FF',
                            2,
                            false
                        );
                        chartSeries.series.attachPrimitive(finalPriceNoteMark);
                        this.priceNoteMarks.push(finalPriceNoteMark);
                        this.previewPriceNoteMark = null;
                        finalPriceNoteMark.setShowHandles(true);
                        finalPriceNoteMark.setShowPriceNote(true);
                    }
                    this.state = {
                        ...this.state,
                        isPriceNoteMarkMode: false,
                        priceNoteMarkStartPoint: null,
                        currentPriceNoteMark: null
                    };
                    if (this.props.onCloseDrawing) {
                        this.props.onCloseDrawing();
                    }
                }
            }
        } catch (error) {
            console.error(error);
            this.state = this.cancelPriceNoteMarkMode();
        }
        return this.state;
    };

    private isPointNearLine(x: number, y: number, bounds: any, threshold: number = 15): boolean {
        const { startX, startY, endX, endY, minX, maxX, minY, maxY } = bounds;
        if (x < minX - threshold || x > maxX + threshold || y < minY - threshold || y > maxY + threshold) {
            return false;
        }
        const A = x - startX;
        const B = y - startY;
        const C = endX - startX;
        const D = endY - startY;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        let xx, yy;
        if (param < 0) {
            xx = startX;
            yy = startY;
        } else if (param > 1) {
            xx = endX;
            yy = endY;
        } else {
            xx = startX + param * C;
            yy = startY + param * D;
        }
        const dx = x - xx;
        const dy = y - yy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= threshold;
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
            if (this.state.isPriceNoteMarkMode && this.state.dragTarget && this.state.dragPoint &&
                (this.state.dragPoint === 'start' || this.state.dragPoint === 'end')) {
                if (this.state.dragPoint === 'start') {
                    this.state.dragTarget.updateStartPoint(time.toString(), price);
                } else if (this.state.dragPoint === 'end') {
                    this.state.dragTarget.updateEndPoint(time.toString(), price);
                }
            }
            if (!this.state.isDragging) {
                if (this.state.priceNoteMarkStartPoint && this.previewPriceNoteMark) {
                    this.previewPriceNoteMark.updateEndPoint(time.toString(), price);
                }
                if (!this.state.isPriceNoteMarkMode && !this.state.isDragging && !this.state.priceNoteMarkStartPoint) {
                    let anyPriceNoteHovered = false;
                    for (const mark of this.priceNoteMarks) {
                        const handleType = mark.isPointNearHandle(relativeX, relativeY);
                        const isNearLine = this.isPointNearLine(relativeX, relativeY, mark.getBounds());
                        const shouldShow = !!handleType || isNearLine;
                        mark.setShowHandles(shouldShow);
                        mark.setShowPriceNote(true);
                        if (shouldShow) anyPriceNoteHovered = true;
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): PriceNoteMarkState => {
        if (this.state.isDragging) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDragging(false, null);
            }
            if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end') {
                this.state = {
                    ...this.state,
                    isPriceNoteMarkMode: false,
                    isDragging: false,
                    dragTarget: null,
                    dragPoint: null
                };
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            } else {
                this.state = {
                    ...this.state,
                    isDragging: false,
                    dragTarget: null,
                    dragPoint: null
                };
            }
            this.isOperating = false;
            this.priceNoteMarks.forEach(mark => {
                mark.setShowPriceNote(true);
            });
        }
        this.mouseDownPoint = null;
        this.dragStartData = null;
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): PriceNoteMarkState => {
        if (event.key === 'Escape') {
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
            } else if (this.state.isPriceNoteMarkMode) {
                return this.cancelPriceNoteMarkMode();
            }
        }
        return this.state;
    };

    public getState(): PriceNoteMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<PriceNoteMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewPriceNoteMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewPriceNoteMark);
            this.previewPriceNoteMark = null;
        }

        this.priceNoteMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.priceNoteMarks = [];
    }

    public getPriceNoteMarks(): PriceNoteMark[] {
        return [...this.priceNoteMarks];
    }

    public removePriceNoteMark(mark: PriceNoteMark): void {
        const index = this.priceNoteMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.priceNoteMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isPriceNoteMarkMode;
    }
}