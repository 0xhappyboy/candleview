import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { HeatMapMark } from "../../Mark/Map/HeatMapMark";
import { Point } from "../../types";

export interface HeatMapMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface HeatMapMarkState {
    isHeatMapMode: boolean;
    heatMapStartPoint: Point | null;
    currentHeatMap: HeatMapMark | null;
    isDragging: boolean;
    dragTarget: HeatMapMark | null;
    dragPoint: 'start' | 'end' | 'body' | null; 
    drawingPhase: 'firstPoint' | 'secondPoint' | 'none';
    adjustingMode: 'start' | 'end' | 'body' | null; 
    adjustStartData: { time: number; price: number; opacity: number } | null;
}

export class HeatMapMarkManager implements IMarkManager<HeatMapMark> {
    private props: HeatMapMarkManagerProps;
    private state: HeatMapMarkState;
    private previewHeatMap: HeatMapMark | null = null;
    private heatMapMarks: HeatMapMark[] = [];
    private isOperating: boolean = false;
    private firstPointTime: number = 0;
    private firstPointPrice: number = 0;
    private secondPointTime: number = 0;
    private secondPointPrice: number = 0;
    private dragStartPoint: Point | null = null; 

    constructor(props: HeatMapMarkManagerProps) {
        this.props = props;
        this.state = {
            isHeatMapMode: false,
            heatMapStartPoint: null,
            currentHeatMap: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
    }

    public clearState(): void {
        this.state = {
            isHeatMapMode: false,
            heatMapStartPoint: null,
            currentHeatMap: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
        this.dragStartPoint = null;
    }

    public getMarkAtPoint(point: Point): HeatMapMark | null {
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
            for (const mark of this.heatMapMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY, 25);
                if (handleType) {
                    return mark;
                }
            }
            for (const mark of this.heatMapMarks) {
                const bounds = mark.getBounds();
                if (bounds && this.isPointInHeatMapArea(relativeX, relativeY, bounds)) {
                    return mark;
                }
            }
        } catch (error) {
        }
        return null;
    }

    public getCurrentDragTarget(): HeatMapMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): HeatMapMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewHeatMap) {
            return this.previewHeatMap;
        }
        if (this.state.isHeatMapMode && this.state.currentHeatMap) {
            return this.state.currentHeatMap;
        }
        return null;
    }

    public getAllMarks(): HeatMapMark[] {
        return [...this.heatMapMarks];
    }

    public cancelOperationMode() {
        return this.cancelHeatMapMode();
    }

    public setHeatMapMode = (): HeatMapMarkState => {
        this.state = {
            ...this.state,
            isHeatMapMode: true,
            heatMapStartPoint: null,
            currentHeatMap: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'firstPoint',
            adjustingMode: null,
            adjustStartData: null
        };
        return this.state;
    };

    public cancelHeatMapMode = (): HeatMapMarkState => {
        if (this.previewHeatMap) {
            this.props.chartSeries?.series.detachPrimitive(this.previewHeatMap);
            this.previewHeatMap = null;
        }
        
        this.heatMapMarks.forEach(mark => {
            mark.setDragging(false, null);
            mark.setHoverPoint(null);
            mark.setShowHandles(false);
        });
        
        this.state = {
            ...this.state,
            isHeatMapMode: false,
            heatMapStartPoint: null,
            currentHeatMap: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
        
        this.isOperating = false;
        this.firstPointTime = 0;
        this.firstPointPrice = 0;
        this.secondPointTime = 0;
        this.secondPointPrice = 0;
        this.dragStartPoint = null;
        
        return this.state;
    };

    public handleMouseDown = (point: Point): HeatMapMarkState => {
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
                return this.handleDrawingPhaseMouseDown(time, price, point);
            }
            let clickedMark: HeatMapMark | null = null;
            let handleType: 'start' | 'end' | 'body' | null = null;
            for (const mark of this.heatMapMarks) {
                handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    clickedMark = mark;
                    break;
                }
            }
            if (clickedMark && handleType) {
                const adjustStartData = {
                    time: time,
                    price: price,
                    opacity: clickedMark.getOpacity()
                };
                this.state = {
                    ...this.state,
                    isHeatMapMode: true,
                    isDragging: true,
                    dragTarget: clickedMark,
                    dragPoint: handleType,
                    adjustingMode: handleType,
                    adjustStartData: adjustStartData
                };
                this.dragStartPoint = { x: relativeX, y: relativeY };
                clickedMark.setDragging(true, handleType);
                this.heatMapMarks.forEach(m => {
                    m.setShowHandles(m === clickedMark);
                    m.setHoverPoint(null);
                });
                this.isOperating = true;
                return this.state;
            }
            if (this.state.isHeatMapMode) {
                return this.setHeatMapMode();
            }
            return this.state;
        } catch (error) {
            this.state = this.cancelHeatMapMode();
        }
        return this.state;
    };

    private handleDrawingPhaseMouseDown = (time: number, price: number, point: Point): HeatMapMarkState => {
        const { chartSeries } = this.props;
        if (this.state.drawingPhase === 'firstPoint') {
            this.firstPointTime = time;
            this.firstPointPrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'secondPoint',
                heatMapStartPoint: point
            };
            this.previewHeatMap = new HeatMapMark(
                time,
                price,
                time,
                price,
                '#2962FF',
                2,
                true
            );
            chartSeries?.series.attachPrimitive(this.previewHeatMap);
        } else if (this.state.drawingPhase === 'secondPoint') {
            this.secondPointTime = time;
            this.secondPointPrice = price;
            const finalHeatMap = new HeatMapMark(
                this.firstPointTime,
                this.firstPointPrice,
                this.secondPointTime,
                this.secondPointPrice,
                '#2962FF',
                2,
                false
            );
            finalHeatMap.updateOpacity(0.7);
            if (this.previewHeatMap) {
                chartSeries?.series.detachPrimitive(this.previewHeatMap);
                this.previewHeatMap = null;
            }
            chartSeries?.series.attachPrimitive(finalHeatMap);
            this.heatMapMarks.push(finalHeatMap);
            finalHeatMap.setShowHandles(true);
            this.state = {
                ...this.state,
                isHeatMapMode: false,
                heatMapStartPoint: null,
                currentHeatMap: null,
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
            if (this.state.isDragging && this.state.dragTarget && this.state.adjustingMode && this.state.adjustStartData && this.dragStartPoint) {
                if (this.state.adjustingMode === 'start') {
                    this.state.dragTarget.updateStartPoint(time, price);
                } else if (this.state.adjustingMode === 'end') {
                    this.state.dragTarget.updateEndPoint(time, price);
                } else if (this.state.adjustingMode === 'body') {
                    const deltaX = relativeX - this.dragStartPoint.x;
                    const deltaY = relativeY - this.dragStartPoint.y;
                    this.state.dragTarget.dragLineByPixels(deltaX, deltaY);
                    this.dragStartPoint = { x: relativeX, y: relativeY };
                }
                return;
            }
            if (this.state.drawingPhase === 'secondPoint' && this.previewHeatMap) {
                this.previewHeatMap.updateEndPoint(time, price);
            }
            if (this.state.drawingPhase === 'none' && !this.state.isDragging) {
                let foundHover = false;
                for (const mark of this.heatMapMarks) {
                    const handleType = mark.isPointNearHandle(relativeX, relativeY);
                    const bounds = mark.getBounds();
                    const isInHeatMap = bounds && this.isPointInHeatMapArea(relativeX, relativeY, bounds);
                    if (isInHeatMap || handleType) {
                        mark.setShowHandles(true);
                        if (handleType) {
                            mark.setHoverPoint(handleType);
                        } else {
                            mark.setHoverPoint(null);
                        }
                        foundHover = true;
                    } else {
                        mark.setShowHandles(false);
                        mark.setHoverPoint(null);
                    }
                }
            }
        } catch (error) {
        }
    };

    private isPointInHeatMapArea(x: number, y: number, bounds: any): boolean {
        const { minX, maxX, minY, maxY } = bounds;
        const padding = 15;
        return (x >= minX - padding && x <= maxX + padding &&
                y >= minY - padding && y <= maxY + padding);
    }

    public handleMouseUp = (point: Point): HeatMapMarkState => {
        if (this.state.isDragging || this.state.adjustingMode) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDragging(false, null);
                this.state.dragTarget.setHoverPoint(null);
                this.state.dragTarget.setShowHandles(false);
            }
            this.state = {
                ...this.state,
                isHeatMapMode: false,
                isDragging: false,
                dragTarget: null,
                dragPoint: null,
                adjustingMode: null,
                adjustStartData: null
            };
            this.isOperating = false;
            this.dragStartPoint = null;
            if (this.props.onCloseDrawing) {
                this.props.onCloseDrawing();
            }
        }
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): HeatMapMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isDragging || this.state.adjustingMode || this.state.isHeatMapMode || this.state.drawingPhase !== 'none') {
                return this.cancelHeatMapMode();
            }
        }
        return this.state;
    };

    public getState(): HeatMapMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<HeatMapMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewHeatMap) {
            this.props.chartSeries?.series.detachPrimitive(this.previewHeatMap);
            this.previewHeatMap = null;
        }
        this.heatMapMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.heatMapMarks = [];
    }

    public getHeatMapMarks(): HeatMapMark[] {
        return [...this.heatMapMarks];
    }

    public removeHeatMapMark(mark: HeatMapMark): void {
        const index = this.heatMapMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.heatMapMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isHeatMapMode || this.state.drawingPhase !== 'none' || this.state.adjustingMode !== null;
    }
}