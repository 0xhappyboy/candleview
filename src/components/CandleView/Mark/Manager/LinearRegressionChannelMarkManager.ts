import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { Point } from "../../types";
import { LinearRegressionChannelMark } from "../Graph/Channel/LinearRegressionChannelMark";
import { IMarkManager } from "../IMarkManager";

export interface LinearRegressionChannelMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface LinearRegressionChannelMarkState {
    isLinearRegressionChannelMode: boolean;
    linearRegressionChannelStartPoint: Point | null;
    currentLinearRegressionChannel: LinearRegressionChannelMark | null;
    isDragging: boolean;
    dragTarget: LinearRegressionChannelMark | null;
    dragPoint: 'start' | 'end' | 'channel' | 'line' | null;
    drawingPhase: 'firstPoint' | 'secondPoint' | 'widthAdjust' | 'none';
    adjustingMode: 'start' | 'end' | 'channel' | 'line' | null;
    adjustStartData: { time: string; price: number; deviation: number } | null;
}

export class LinearRegressionChannelMarkManager implements IMarkManager<LinearRegressionChannelMark> {
    private props: LinearRegressionChannelMarkManagerProps;
    private state: LinearRegressionChannelMarkState;
    private previewLinearRegressionChannel: LinearRegressionChannelMark | null = null;
    private channelMarks: LinearRegressionChannelMark[] = [];
    private mouseDownPoint: Point | null = null;
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private firstPointTime: string = '';
    private firstPointPrice: number = 0;
    private secondPointTime: string = '';
    private secondPointPrice: number = 0;
    private hoverPoint: 'start' | 'end' | 'channel' | 'line' | null = null;

    constructor(props: LinearRegressionChannelMarkManagerProps) {
        this.props = props;
        this.state = {
            isLinearRegressionChannelMode: false,
            linearRegressionChannelStartPoint: null,
            currentLinearRegressionChannel: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
    }

    public getMarkAtPoint(point: Point): LinearRegressionChannelMark | null {
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

    public getCurrentDragTarget(): LinearRegressionChannelMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): LinearRegressionChannelMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewLinearRegressionChannel) {
            return this.previewLinearRegressionChannel;
        }
        if (this.state.isLinearRegressionChannelMode && this.state.currentLinearRegressionChannel) {
            return this.state.currentLinearRegressionChannel;
        }
        return null;
    }

    public getAllMarks(): LinearRegressionChannelMark[] {
        return [...this.channelMarks];
    }

    public cancelOperationMode() {
        return this.cancelLinearRegressionChannelMode();
    }

    public setLinearRegressionChannelMode = (): LinearRegressionChannelMarkState => {
        this.state = {
            ...this.state,
            isLinearRegressionChannelMode: true,
            linearRegressionChannelStartPoint: null,
            currentLinearRegressionChannel: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'firstPoint',
            adjustingMode: null,
            adjustStartData: null
        };
        return this.state;
    };

    public cancelLinearRegressionChannelMode = (): LinearRegressionChannelMarkState => {
        if (this.previewLinearRegressionChannel) {
            this.props.chartSeries?.series.detachPrimitive(this.previewLinearRegressionChannel);
            this.previewLinearRegressionChannel = null;
        }
        this.channelMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setHoverPoint(null);
        });
        this.state = {
            ...this.state,
            isLinearRegressionChannelMode: false,
            linearRegressionChannelStartPoint: null,
            currentLinearRegressionChannel: null,
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

    public handleMouseDown = (point: Point): LinearRegressionChannelMarkState => {
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
                        deviation: mark.getDeviation()  
                    };

                    this.state = {
                        ...this.state,
                        isLinearRegressionChannelMode: true,
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
            console.error('Error placing linear regression channel mark:', error);
            this.state = this.cancelLinearRegressionChannelMode();
        }
        return this.state;
    };

    private handleDrawingPhaseMouseDown = (time: string, price: number, point: Point): LinearRegressionChannelMarkState => {
        const { chartSeries } = this.props;

        if (this.state.drawingPhase === 'firstPoint') {
            this.firstPointTime = time;
            this.firstPointPrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'secondPoint',
                linearRegressionChannelStartPoint: point
            };

            this.previewLinearRegressionChannel = new LinearRegressionChannelMark(
                time,
                price,
                time,
                price,
                '#2962FF',
                2,
                true
            );
            chartSeries?.series.attachPrimitive(this.previewLinearRegressionChannel);

        } else if (this.state.drawingPhase === 'secondPoint') {
            this.secondPointTime = time;
            this.secondPointPrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'widthAdjust'
            };

            if (this.previewLinearRegressionChannel) {
                this.previewLinearRegressionChannel.updateEndPoint(time, price);
                this.previewLinearRegressionChannel.setPreviewMode(false);
                
                this.previewLinearRegressionChannel.updateDeviation(2);
            }

        } else if (this.state.drawingPhase === 'widthAdjust') {
            if (this.previewLinearRegressionChannel) {
                const deviation = this.previewLinearRegressionChannel.getDeviation();
                const finalLinearRegressionChannel = new LinearRegressionChannelMark(
                    this.firstPointTime,
                    this.firstPointPrice,
                    this.secondPointTime,
                    this.secondPointPrice,
                    '#2962FF',
                    2,
                    false
                );
                finalLinearRegressionChannel.updateDeviation(deviation);
                chartSeries?.series.detachPrimitive(this.previewLinearRegressionChannel);
                chartSeries?.series.attachPrimitive(finalLinearRegressionChannel);
                this.channelMarks.push(finalLinearRegressionChannel);
                this.previewLinearRegressionChannel = null;
                finalLinearRegressionChannel.setShowHandles(true);
                this.state = {
                    ...this.state,
                    isLinearRegressionChannelMode: false,
                    linearRegressionChannelStartPoint: null,
                    currentLinearRegressionChannel: null,
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

        const A = x - startX;
        const B = y - startY;
        const C = dx;
        const D = dy;
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
        const dx2 = x - xx;
        const dy2 = y - yy;
        const distance = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (distance <= threshold) {
            return true;
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
                    const priceDiff = price - this.state.adjustStartData.price;
                    const sensitivity = 0.1; 
                    const newDeviation = Math.max(0.1, this.state.adjustStartData.deviation + priceDiff * sensitivity);
                    this.state.dragTarget.updateDeviation(newDeviation);
                }
            }

            if (this.state.drawingPhase !== 'none') {
                if (this.state.drawingPhase === 'secondPoint' && this.previewLinearRegressionChannel) {
                    this.previewLinearRegressionChannel.updateEndPoint(time.toString(), price);
                } else if (this.state.drawingPhase === 'widthAdjust' && this.previewLinearRegressionChannel) {
                    
                    const priceDiff = Math.abs(price - this.firstPointPrice);
                    const basePrice = Math.max(0.001, this.firstPointPrice);
                    const deviation = Math.max(0.1, priceDiff / basePrice * 10);
                    this.previewLinearRegressionChannel.updateDeviation(deviation);
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
            console.error('Error updating linear regression channel mark:', error);
        }
    };

    public handleMouseUp = (point: Point): LinearRegressionChannelMarkState => {
        if (this.state.adjustingMode) {
            this.state = {
                ...this.state,
                isLinearRegressionChannelMode: false,
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

    public handleKeyDown = (event: KeyboardEvent): LinearRegressionChannelMarkState => {
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
            } else if (this.state.isLinearRegressionChannelMode || this.state.drawingPhase !== 'none') {
                return this.cancelLinearRegressionChannelMode();
            }
        }
        return this.state;
    };

    public getState(): LinearRegressionChannelMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<LinearRegressionChannelMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewLinearRegressionChannel) {
            this.props.chartSeries?.series.detachPrimitive(this.previewLinearRegressionChannel);
            this.previewLinearRegressionChannel = null;
        }
        this.channelMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.channelMarks = [];
    }

    public getLinearRegressionChannelMarks(): LinearRegressionChannelMark[] {
        return [...this.channelMarks];
    }

    public removeLinearRegressionChannelMark(mark: LinearRegressionChannelMark): void {
        const index = this.channelMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.channelMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isLinearRegressionChannelMode || this.state.drawingPhase !== 'none' || this.state.adjustingMode !== null;
    }
}