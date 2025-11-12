import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { ParallelChannelMark } from "../Channel/ParallelChannelMark";
import { IMarkManager } from "../IMarkManager";

export interface ParallelChannelMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface ParallelChannelMarkState {
    isParallelChannelMarkMode: boolean;
    parallelChannelMarkStartPoint: Point | null;
    currentParallelChannelMark: ParallelChannelMark | null;
    isDragging: boolean;
    dragTarget: ParallelChannelMark | null;
    dragPoint: 'start' | 'end' | 'channel' | 'line' | null;
    drawingPhase: 'firstPoint' | 'secondPoint' | 'widthAdjust' | 'none';
    adjustingMode: 'start' | 'end' | 'channel' | null;
    adjustStartData: { time: string; price: number; channelHeight: number } | null;
}

export class ParallelChannelMarkManager implements IMarkManager<ParallelChannelMark> {
    private props: ParallelChannelMarkManagerProps;
    private state: ParallelChannelMarkState;
    private previewParallelChannelMark: ParallelChannelMark | null = null;
    private channelMarks: ParallelChannelMark[] = [];
    private mouseDownPoint: Point | null = null;
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private firstPointTime: string = '';
    private firstPointPrice: number = 0;
    private secondPointTime: string = '';
    private secondPointPrice: number = 0;
    private hoverPoint: 'start' | 'end' | 'channel' | 'line' | null = null;

    constructor(props: ParallelChannelMarkManagerProps) {
        this.props = props;
        this.state = {
            isParallelChannelMarkMode: false,
            parallelChannelMarkStartPoint: null,
            currentParallelChannelMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
    }

    public getMarkAtPoint(point: Point): ParallelChannelMark | null {
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

            for (const mark of this.channelMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }
            for (const mark of this.channelMarks) {
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

    public getCurrentDragTarget(): ParallelChannelMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): ParallelChannelMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewParallelChannelMark) {
            return this.previewParallelChannelMark;
        }
        if (this.state.isParallelChannelMarkMode && this.state.currentParallelChannelMark) {
            return this.state.currentParallelChannelMark;
        }
        return null;
    }

    public getAllMarks(): ParallelChannelMark[] {
        return [...this.channelMarks];
    }

    public cancelOperationMode() {
        return this.cancelParallelChannelMarkMode();
    }

    public setParallelChannelMarkMode = (): ParallelChannelMarkState => {
        this.state = {
            ...this.state,
            isParallelChannelMarkMode: true,
            parallelChannelMarkStartPoint: null,
            currentParallelChannelMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'firstPoint',
            adjustingMode: null,
            adjustStartData: null
        };
        return this.state;
    };

    public cancelParallelChannelMarkMode = (): ParallelChannelMarkState => {
        if (this.previewParallelChannelMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewParallelChannelMark);
            this.previewParallelChannelMark = null;
        }
        this.channelMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setHoverPoint(null);
        });
        this.state = {
            ...this.state,
            isParallelChannelMarkMode: false,
            parallelChannelMarkStartPoint: null,
            currentParallelChannelMark: null,
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
        this.hoverPoint = null;
        return this.state;
    };

    public handleMouseDown = (point: Point): ParallelChannelMarkState => {
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

            if (this.state.drawingPhase !== 'none') {
                return this.handleDrawingPhaseMouseDown(time.toString(), price, point);
            }

            for (const mark of this.channelMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    const adjustStartData = {
                        time: time.toString(),
                        price: price,
                        channelHeight: mark.getChannelHeight()
                    };

                    this.state = {
                        ...this.state,
                        isParallelChannelMarkMode: true,
                        isDragging: false,
                        dragTarget: mark,
                        dragPoint: handleType,
                        adjustingMode: handleType,
                        adjustStartData: adjustStartData
                    };

                    this.channelMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                        m.setHoverPoint(null);
                    });
                    this.isOperating = true;
                    return this.state;
                }
            }

            for (const mark of this.channelMarks) {
                const bounds = mark.getBounds();
                if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
                    this.state = {
                        ...this.state,
                        isDragging: true,
                        dragTarget: mark,
                        dragPoint: 'line',
                        adjustingMode: null,
                        adjustStartData: null
                    };
                    mark.setDragging(true, 'line');
                    this.channelMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                        m.setHoverPoint(null);
                    });
                    this.isOperating = true;
                    return this.state;
                }
            }

        } catch (error) {
            console.error(error);
            this.state = this.cancelParallelChannelMarkMode();
        }
        return this.state;
    };

    private handleDrawingPhaseMouseDown = (time: string, price: number, point: Point): ParallelChannelMarkState => {
        const { chartSeries } = this.props;

        if (this.state.drawingPhase === 'firstPoint') {
            this.firstPointTime = time;
            this.firstPointPrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'secondPoint',
                parallelChannelMarkStartPoint: point
            };

            this.previewParallelChannelMark = new ParallelChannelMark(
                time,
                price,
                time,
                price,
                '#2962FF',
                2,
                true
            );
            chartSeries?.series.attachPrimitive(this.previewParallelChannelMark);

        } else if (this.state.drawingPhase === 'secondPoint') {
            this.secondPointTime = time;
            this.secondPointPrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'widthAdjust'
            };

            if (this.previewParallelChannelMark) {
                this.previewParallelChannelMark.updateEndPoint(time, price);
                this.previewParallelChannelMark.setPreviewMode(false);
                const initialHeight = Math.abs(price - this.firstPointPrice) * 0.3;
                this.previewParallelChannelMark.updateChannelHeight(initialHeight);
            }

        } else if (this.state.drawingPhase === 'widthAdjust') {
            if (this.previewParallelChannelMark) {
                const channelHeight = this.previewParallelChannelMark.getChannelHeight();
                const finalParallelChannelMark = new ParallelChannelMark(
                    this.firstPointTime,
                    this.firstPointPrice,
                    this.secondPointTime,
                    this.secondPointPrice,
                    '#2962FF',
                    2,
                    false
                );
                finalParallelChannelMark.updateChannelHeight(channelHeight);
                chartSeries?.series.detachPrimitive(this.previewParallelChannelMark);
                chartSeries?.series.attachPrimitive(finalParallelChannelMark);
                this.channelMarks.push(finalParallelChannelMark);
                this.previewParallelChannelMark = null;
                finalParallelChannelMark.setShowHandles(true);
                this.state = {
                    ...this.state,
                    isParallelChannelMarkMode: false,
                    parallelChannelMarkStartPoint: null,
                    currentParallelChannelMark: null,
                    drawingPhase: 'none',
                    adjustingMode: null,
                    adjustStartData: null
                };
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            }
        }

        return this.state;
    };

    private isPointNearLine(x: number, y: number, bounds: any, threshold: number = 15): boolean {
        const { startX, startY, endX, endY, minX, maxX, minY, maxY } = bounds;
        if (x < minX - threshold || x > maxX + threshold || y < minY - threshold || y > maxY + threshold) {
            return false;
        }
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return false;
        const perpX = -dy / length;
        const perpY = dx / length;
        for (let i = -1; i <= 1; i++) {
            const offsetX = perpX * 30 * i;
            const offsetY = perpY * 30 * i;
            const lineStartX = startX + offsetX;
            const lineStartY = startY + offsetY;
            const lineEndX = endX + offsetX;
            const lineEndY = endY + offsetY;
            const A = x - lineStartX;
            const B = y - lineStartY;
            const C = lineEndX - lineStartX;
            const D = lineEndY - lineStartY;
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            if (lenSq !== 0) {
                param = dot / lenSq;
            }
            let xx, yy;
            if (param < 0) {
                xx = lineStartX;
                yy = lineStartY;
            } else if (param > 1) {
                xx = lineEndX;
                yy = lineEndY;
            } else {
                xx = lineStartX + param * C;
                yy = lineStartY + param * D;
            }
            const dx = x - xx;
            const dy = y - yy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= threshold) {
                return true;
            }
        }
        return false;
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
                } else if (this.state.adjustingMode === 'channel') {
                    const startPrice = this.state.dragTarget.getStartPrice();
                    const priceDiff = price - this.state.adjustStartData.price;
                    const newChannelHeight = Math.max(0.001, this.state.adjustStartData.channelHeight + priceDiff);
                    this.state.dragTarget.updateChannelHeight(newChannelHeight);
                }
            }
            if (this.state.drawingPhase !== 'none') {
                if (this.state.drawingPhase === 'secondPoint' && this.previewParallelChannelMark) {
                    this.previewParallelChannelMark.updateEndPoint(time.toString(), price);
                } else if (this.state.drawingPhase === 'widthAdjust' && this.previewParallelChannelMark) {
                    const channelHeight = Math.abs(price - this.firstPointPrice);
                    this.previewParallelChannelMark.updateChannelHeight(channelHeight);
                }
                // chart.timeScale().widthChanged();
                return;
            }

            let newHoverPoint: 'start' | 'end' | 'channel' | 'line' | null = null;
            for (const mark of this.channelMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                const isNearLine = this.isPointNearLine(relativeX, relativeY, mark.getBounds());
                if (handleType) {
                    newHoverPoint = handleType;
                    mark.setHoverPoint(handleType);
                } else if (isNearLine) {
                    newHoverPoint = 'line';
                    mark.setHoverPoint('line');
                } else {
                    mark.setHoverPoint(null);
                }
                if (newHoverPoint) break;
            }
            this.hoverPoint = newHoverPoint;
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): ParallelChannelMarkState => {
        if (this.state.adjustingMode) {
            this.state = {
                ...this.state,
                isParallelChannelMarkMode: false,
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
        this.mouseDownPoint = null;
        this.dragStartData = null;
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): ParallelChannelMarkState => {
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
            } else if (this.state.isParallelChannelMarkMode || this.state.drawingPhase !== 'none') {
                return this.cancelParallelChannelMarkMode();
            }
        }
        return this.state;
    };

    public getState(): ParallelChannelMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<ParallelChannelMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewParallelChannelMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewParallelChannelMark);
            this.previewParallelChannelMark = null;
        }
        this.channelMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.channelMarks = [];
    }

    public getParallelChannelMarks(): ParallelChannelMark[] {
        return [...this.channelMarks];
    }

    public removeParallelChannelMark(mark: ParallelChannelMark): void {
        const index = this.channelMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.channelMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isParallelChannelMarkMode || this.state.drawingPhase !== 'none' || this.state.adjustingMode !== null;
    }
}