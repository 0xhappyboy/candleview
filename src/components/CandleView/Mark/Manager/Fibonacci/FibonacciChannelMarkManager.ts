import { ChartSeries } from "../../../ChartLayer/ChartTypeManager";
import { Point } from "../../../types";
import { FibonacciChannelMark } from "../../Graph/Fibonacci/FibonacciChannelMark";
import { IMarkManager } from "../../IMarkManager";

export interface FibonacciChannelMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface FibonacciChannelMarkState {
    isFibonacciChannelMarkMode: boolean;
    fibonacciChannelMarkStartPoint: Point | null;
    currentFibonacciChannelMark: FibonacciChannelMark | null;
    isDragging: boolean;
    dragTarget: FibonacciChannelMark | null;
    dragPoint: 'start' | 'end' | 'channel' | 'line' | null;
    drawingPhase: 'firstPoint' | 'secondPoint' | 'widthAdjust' | 'none';
    adjustingMode: 'start' | 'end' | 'channel' | null;
    adjustStartData: { time: string; price: number; channelHeight: number } | null;
}

export class FibonacciChannelMarkManager implements IMarkManager<FibonacciChannelMark> {
    private props: FibonacciChannelMarkManagerProps;
    private state: FibonacciChannelMarkState;
    private previewFibonacciChannelMark: FibonacciChannelMark | null = null;
    private channelMarks: FibonacciChannelMark[] = [];
    private mouseDownPoint: Point | null = null;
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private firstPointTime: string = '';
    private firstPointPrice: number = 0;
    private secondPointTime: string = '';
    private secondPointPrice: number = 0;
    private hoverPoint: 'start' | 'end' | 'channel' | 'line' | null = null;

    constructor(props: FibonacciChannelMarkManagerProps) {
        this.props = props;
        this.state = {
            isFibonacciChannelMarkMode: false,
            fibonacciChannelMarkStartPoint: null,
            currentFibonacciChannelMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
    }

    public getMarkAtPoint(point: Point): FibonacciChannelMark | null {
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
            console.error('Error getting mark at point:', error);
        }
        return null;
    }

    public getCurrentDragTarget(): FibonacciChannelMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): FibonacciChannelMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewFibonacciChannelMark) {
            return this.previewFibonacciChannelMark;
        }
        if (this.state.isFibonacciChannelMarkMode && this.state.currentFibonacciChannelMark) {
            return this.state.currentFibonacciChannelMark;
        }
        return null;
    }

    public getAllMarks(): FibonacciChannelMark[] {
        return [...this.channelMarks];
    }

    public cancelOperationMode() {
        return this.cancelFibonacciChannelMarkMode();
    }

    public setFibonacciChannelMarkMode = (): FibonacciChannelMarkState => {
        this.state = {
            ...this.state,
            isFibonacciChannelMarkMode: true,
            fibonacciChannelMarkStartPoint: null,
            currentFibonacciChannelMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'firstPoint',
            adjustingMode: null,
            adjustStartData: null
        };
        return this.state;
    };

    public cancelFibonacciChannelMarkMode = (): FibonacciChannelMarkState => {
        if (this.previewFibonacciChannelMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciChannelMark);
            this.previewFibonacciChannelMark = null;
        }
        this.channelMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setHoverPoint(null);
        });
        this.state = {
            ...this.state,
            isFibonacciChannelMarkMode: false,
            fibonacciChannelMarkStartPoint: null,
            currentFibonacciChannelMark: null,
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

    public handleMouseDown = (point: Point): FibonacciChannelMarkState => {
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
                        isFibonacciChannelMarkMode: true,
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
            console.error('Error placing fibonacci channel mark:', error);
            this.state = this.cancelFibonacciChannelMarkMode();
        }
        return this.state;
    };

    private handleDrawingPhaseMouseDown = (time: string, price: number, point: Point): FibonacciChannelMarkState => {
        const { chartSeries } = this.props;

        if (this.state.drawingPhase === 'firstPoint') {
            this.firstPointTime = time;
            this.firstPointPrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'secondPoint',
                fibonacciChannelMarkStartPoint: point
            };

            this.previewFibonacciChannelMark = new FibonacciChannelMark(
                time,
                price,
                time,
                price,
                '#FF6B35',
                2,
                true
            );
            chartSeries?.series.attachPrimitive(this.previewFibonacciChannelMark);
        } else if (this.state.drawingPhase === 'secondPoint') {
            this.secondPointTime = time;
            this.secondPointPrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'widthAdjust'
            };
            if (this.previewFibonacciChannelMark) {
                this.previewFibonacciChannelMark.updateEndPoint(time, price);
                this.previewFibonacciChannelMark.setPreviewMode(false);
                const priceDiff = Math.abs(price - this.firstPointPrice);
                const initialHeight = priceDiff * 1.618;
                this.previewFibonacciChannelMark.updateChannelHeight(initialHeight);
            }
        } else if (this.state.drawingPhase === 'widthAdjust') {
            if (this.previewFibonacciChannelMark) {
                const channelHeight = this.previewFibonacciChannelMark.getChannelHeight();
                const finalFibonacciChannelMark = new FibonacciChannelMark(
                    this.firstPointTime,
                    this.firstPointPrice,
                    this.secondPointTime,
                    this.secondPointPrice,
                    '#FF6B35',
                    2,
                    false
                );
                finalFibonacciChannelMark.updateChannelHeight(channelHeight);
                chartSeries?.series.detachPrimitive(this.previewFibonacciChannelMark);
                chartSeries?.series.attachPrimitive(finalFibonacciChannelMark);
                this.channelMarks.push(finalFibonacciChannelMark);
                this.previewFibonacciChannelMark = null;
                finalFibonacciChannelMark.setShowHandles(true);
                this.state = {
                    ...this.state,
                    isFibonacciChannelMarkMode: false,
                    fibonacciChannelMarkStartPoint: null,
                    currentFibonacciChannelMark: null,
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


        for (let i = 0; i <= 10; i++) {
            const level = i / 10;
            const offsetX = perpX * 30 * level;
            const offsetY = perpY * 30 * level;
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


            if (this.state.isDragging && this.state.dragTarget && this.mouseDownPoint && this.state.dragPoint === 'line') {
                const deltaX = relativeX - this.mouseDownPoint.x;
                const deltaY = relativeY - this.mouseDownPoint.y;
                this.state.dragTarget.dragLineByPixels(deltaX, deltaY);
                this.mouseDownPoint = { x: relativeX, y: relativeY };
                return;
            }


            if (this.state.adjustingMode && this.state.dragTarget && this.state.adjustStartData) {
                if (this.state.adjustingMode === 'start') {
                    this.state.dragTarget.updateStartPoint(time.toString(), price);
                } else if (this.state.adjustingMode === 'end') {
                    this.state.dragTarget.updateEndPoint(time.toString(), price);
                } else if (this.state.adjustingMode === 'channel') {

                    const startPrice = this.state.dragTarget.getStartPrice();
                    const endPrice = this.state.dragTarget.getEndPrice();
                    const midPrice = (startPrice + endPrice) / 2;


                    const currentMidY = chartSeries.series.priceToCoordinate(midPrice);
                    if (currentMidY === null) return;

                    const mouseY = relativeY;
                    const verticalDiff = mouseY - currentMidY;


                    const priceRange = Math.abs(endPrice - startPrice);
                    const startYCoord = chartSeries.series.priceToCoordinate(startPrice);
                    const endYCoord = chartSeries.series.priceToCoordinate(endPrice);

                    if (startYCoord === null || endYCoord === null) return;

                    const yRange = Math.abs(startYCoord - endYCoord);
                    const pricePerPixel = yRange > 0 ? priceRange / yRange : 0.01;


                    const heightChange = verticalDiff * pricePerPixel;
                    const newChannelHeight = Math.max(0.001, Math.abs(this.state.adjustStartData.channelHeight + heightChange));

                    this.state.dragTarget.updateChannelHeight(newChannelHeight);
                }
            }


            if (this.state.drawingPhase !== 'none') {
                if (this.state.drawingPhase === 'secondPoint' && this.previewFibonacciChannelMark) {
                    this.previewFibonacciChannelMark.updateEndPoint(time.toString(), price);
                } else if (this.state.drawingPhase === 'widthAdjust' && this.previewFibonacciChannelMark) {

                    const startPrice = this.previewFibonacciChannelMark.getStartPrice();
                    const priceDiff = Math.abs(price - startPrice);
                    const channelHeight = priceDiff * 1.618;
                    this.previewFibonacciChannelMark.updateChannelHeight(channelHeight);
                }
                chart.timeScale().widthChanged();
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
            console.error('Error updating fibonacci channel mark:', error);
        }
    };

    public handleMouseUp = (point: Point): FibonacciChannelMarkState => {
        if (this.state.adjustingMode) {
            this.state = {
                ...this.state,
                isFibonacciChannelMarkMode: false,
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

    public handleKeyDown = (event: KeyboardEvent): FibonacciChannelMarkState => {
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
            } else if (this.state.isFibonacciChannelMarkMode || this.state.drawingPhase !== 'none') {
                return this.cancelFibonacciChannelMarkMode();
            }
        }
        return this.state;
    };

    public getState(): FibonacciChannelMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<FibonacciChannelMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewFibonacciChannelMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewFibonacciChannelMark);
            this.previewFibonacciChannelMark = null;
        }
        this.channelMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.channelMarks = [];
    }

    public getFibonacciChannelMarks(): FibonacciChannelMark[] {
        return [...this.channelMarks];
    }

    public removeFibonacciChannelMark(mark: FibonacciChannelMark): void {
        const index = this.channelMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.channelMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isFibonacciChannelMarkMode || this.state.drawingPhase !== 'none' || this.state.adjustingMode !== null;
    }
}