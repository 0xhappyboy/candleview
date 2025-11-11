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
    private isOperating: boolean = false;
    private firstPointTime: string = '';
    private firstPointPrice: number = 0;
    private secondPointTime: string = '';
    private secondPointPrice: number = 0;

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
                const handleType = mark.isPointNearHandle(relativeX, relativeY, 25);
                if (handleType) {
                    return mark;
                }
            }
            for (const mark of this.channelMarks) {
                const bounds = mark.getBounds();
                if (bounds && this.isPointInChannelArea(relativeX, relativeY, bounds)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
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
            mark.setDragging(false, null);
            mark.setHoverPoint(null);
            mark.setShowHandles(false);
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
            if (this.state.drawingPhase !== 'none') {
                return this.handleDrawingPhaseMouseDown(time.toString(), price, point);
            }
            let clickedMark: LinearRegressionChannelMark | null = null;
            let handleType: 'start' | 'end' | 'channel' | 'line' | null = null;
            for (const mark of this.channelMarks) {
                handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    clickedMark = mark;
                    break;
                }
            }
            if (clickedMark && handleType && (handleType === 'start' || handleType === 'end')) {
                const adjustStartData = {
                    time: time.toString(),
                    price: price,
                    deviation: clickedMark.getDeviation()
                };
                this.state = {
                    ...this.state,
                    isLinearRegressionChannelMode: true,
                    isDragging: true,
                    dragTarget: clickedMark,
                    dragPoint: handleType,
                    adjustingMode: handleType,
                    adjustStartData: adjustStartData
                };
                clickedMark.setDragging(true, handleType);
                this.channelMarks.forEach(m => {
                    m.setShowHandles(m === clickedMark);
                    m.setHoverPoint(null);
                });
                this.isOperating = true;
                return this.state;
            }
            if (this.state.isLinearRegressionChannelMode) {
                return this.setLinearRegressionChannelMode();
            }
            return this.state;
        } catch (error) {
            console.error(error);
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
            const finalLinearRegressionChannel = new LinearRegressionChannelMark(
                this.firstPointTime,
                this.firstPointPrice,
                this.secondPointTime,
                this.secondPointPrice,
                '#2962FF',
                2,
                false
            );
            finalLinearRegressionChannel.updateDeviation(2);
            if (this.previewLinearRegressionChannel) {
                chartSeries?.series.detachPrimitive(this.previewLinearRegressionChannel);
                this.previewLinearRegressionChannel = null;
            }
            chartSeries?.series.attachPrimitive(finalLinearRegressionChannel);
            this.channelMarks.push(finalLinearRegressionChannel);
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
            if (this.state.isDragging && this.state.dragTarget && this.state.adjustingMode && this.state.adjustStartData) {
                if (this.state.adjustingMode === 'start') {
                    this.state.dragTarget.updateStartPoint(time.toString(), price);
                } else if (this.state.adjustingMode === 'end') {
                    this.state.dragTarget.updateEndPoint(time.toString(), price);
                }
                // chart.timeScale().widthChanged();
                return;
            }
            if (this.state.drawingPhase === 'secondPoint' && this.previewLinearRegressionChannel) {
                this.previewLinearRegressionChannel.updateEndPoint(time.toString(), price);
                // chart.timeScale().widthChanged();
            }
            if (this.state.drawingPhase === 'none' && !this.state.isDragging) {
                let foundHover = false;
                for (const mark of this.channelMarks) {
                    const handleType = mark.isPointNearHandle(relativeX, relativeY);
                    const bounds = mark.getBounds();
                    const isInChannel = bounds && this.isPointInChannelArea(relativeX, relativeY, bounds);
                    if (isInChannel || handleType) {
                        mark.setShowHandles(true);
                        if (handleType) {
                            mark.setHoverPoint(handleType);
                        } else {
                            mark.setHoverPoint('line');
                        }
                        foundHover = true;
                    } else {
                        mark.setShowHandles(false);
                        mark.setHoverPoint(null);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    private isPointInChannelArea(x: number, y: number, bounds: any): boolean {
        const { minX, maxX, minY, maxY } = bounds;
        const padding = 15;
        return (x >= minX - padding && x <= maxX + padding &&
            y >= minY - padding && y <= maxY + padding);
    }

    public handleMouseUp = (point: Point): LinearRegressionChannelMarkState => {
        if (this.state.isDragging || this.state.adjustingMode) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDragging(false, null);
                this.state.dragTarget.setHoverPoint(null);
                this.state.dragTarget.setShowHandles(false);
            }
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
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): LinearRegressionChannelMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isDragging || this.state.adjustingMode || this.state.isLinearRegressionChannelMode || this.state.drawingPhase !== 'none') {
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