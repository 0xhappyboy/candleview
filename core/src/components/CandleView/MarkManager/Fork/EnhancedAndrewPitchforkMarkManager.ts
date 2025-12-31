import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { EnhancedAndrewPitchforkMark } from "../../Mark/Fork/EnhancedAndrewPitchforkMark";
import { IMarkManager } from "../../Mark/IMarkManager";
import { Point } from "../../types";

export interface EnhancedAndrewPitchforkMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface EnhancedAndrewPitchforkMarkState {
    isEnhancedAndrewPitchforkMode: boolean;
    enhancedAndrewPitchforkHandlePoint: Point | null;
    enhancedAndrewPitchforkBaseStartPoint: Point | null;
    currentEnhancedAndrewPitchfork: EnhancedAndrewPitchforkMark | null;
    isDragging: boolean;
    dragTarget: EnhancedAndrewPitchforkMark | null;
    dragPoint: 'handle' | 'baseStart' | 'baseEnd' | 'line' | null;
    drawingPhase: 'handle' | 'baseStart' | 'baseEnd' | 'none';
    adjustingMode: 'handle' | 'baseStart' | 'baseEnd' | null;
    adjustStartData: {
        handleTime: number; handlePrice: number;
        baseStartTime: number; baseStartPrice: number;
        baseEndTime: number; baseEndPrice: number;
    } | null;
}

export class EnhancedAndrewPitchforkMarkManager implements IMarkManager<EnhancedAndrewPitchforkMark> {
    private props: EnhancedAndrewPitchforkMarkManagerProps;
    private state: EnhancedAndrewPitchforkMarkState;
    private previewEnhancedAndrewPitchfork: EnhancedAndrewPitchforkMark | null = null;
    private enhancedAndrewPitchforkMarks: EnhancedAndrewPitchforkMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private handleTime: number = 0;
    private handlePrice: number = 0;
    private baseStartTime: number = 0;
    private baseStartPrice: number = 0;
    private baseEndTime: number = 0;
    private baseEndPrice: number = 0;

    constructor(props: EnhancedAndrewPitchforkMarkManagerProps) {
        this.props = props;
        this.state = {
            isEnhancedAndrewPitchforkMode: false,
            enhancedAndrewPitchforkHandlePoint: null,
            enhancedAndrewPitchforkBaseStartPoint: null,
            currentEnhancedAndrewPitchfork: null,
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
            isEnhancedAndrewPitchforkMode: false,
            enhancedAndrewPitchforkHandlePoint: null,
            enhancedAndrewPitchforkBaseStartPoint: null,
            currentEnhancedAndrewPitchfork: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
    }

    public getMarkAtPoint(point: Point): EnhancedAndrewPitchforkMark | null {
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
            for (const mark of this.enhancedAndrewPitchforkMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }
            for (const mark of this.enhancedAndrewPitchforkMarks) {
                const bounds = mark.getBounds();
                if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
                    return mark;
                }
            }
        } catch (error) {
        }
        return null;
    }

    public getCurrentDragTarget(): EnhancedAndrewPitchforkMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): EnhancedAndrewPitchforkMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewEnhancedAndrewPitchfork) {
            return this.previewEnhancedAndrewPitchfork;
        }
        if (this.state.isEnhancedAndrewPitchforkMode && this.state.currentEnhancedAndrewPitchfork) {
            return this.state.currentEnhancedAndrewPitchfork;
        }
        return null;
    }

    public getAllMarks(): EnhancedAndrewPitchforkMark[] {
        return [...this.enhancedAndrewPitchforkMarks];
    }

    public cancelOperationMode() {
        return this.cancelEnhancedAndrewPitchforkMode();
    }

    public setEnhancedAndrewPitchforkMode = (): EnhancedAndrewPitchforkMarkState => {
        this.state = {
            ...this.state,
            isEnhancedAndrewPitchforkMode: true,
            enhancedAndrewPitchforkHandlePoint: null,
            enhancedAndrewPitchforkBaseStartPoint: null,
            currentEnhancedAndrewPitchfork: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'handle',
            adjustingMode: null,
            adjustStartData: null
        };
        return this.state;
    };

    public cancelEnhancedAndrewPitchforkMode = (): EnhancedAndrewPitchforkMarkState => {
        if (this.previewEnhancedAndrewPitchfork) {
            this.props.chartSeries?.series.detachPrimitive(this.previewEnhancedAndrewPitchfork);
            this.previewEnhancedAndrewPitchfork = null;
        }
        this.enhancedAndrewPitchforkMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setHoverPoint(null);
        });
        this.state = {
            ...this.state,
            isEnhancedAndrewPitchforkMode: false,
            enhancedAndrewPitchforkHandlePoint: null,
            enhancedAndrewPitchforkBaseStartPoint: null,
            currentEnhancedAndrewPitchfork: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
        this.isOperating = false;
        this.handleTime = 0;
        this.handlePrice = 0;
        this.baseStartTime = 0;
        this.baseStartPrice = 0;
        this.baseEndTime = 0;
        this.baseEndPrice = 0;
        return this.state;
    };

    public handleMouseDown = (point: Point): EnhancedAndrewPitchforkMarkState => {
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
            this.dragStartData = { time, price };
            if (this.state.drawingPhase !== 'none') {
                return this.handleDrawingPhaseMouseDown(time, price, point);
            }
            for (const mark of this.enhancedAndrewPitchforkMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    const adjustStartData = {
                        handleTime: mark.getHandleTime(),
                        handlePrice: mark.getHandlePrice(),
                        baseStartTime: mark.getBaseStartTime(),
                        baseStartPrice: mark.getBaseStartPrice(),
                        baseEndTime: mark.getBaseEndTime(),
                        baseEndPrice: mark.getBaseEndPrice()
                    };
                    this.state = {
                        ...this.state,
                        isEnhancedAndrewPitchforkMode: true,
                        isDragging: false,
                        dragTarget: mark,
                        dragPoint: handleType,
                        adjustingMode: handleType,
                        adjustStartData: adjustStartData
                    };
                    this.enhancedAndrewPitchforkMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                        m.setHoverPoint(null);
                    });
                    this.isOperating = true;
                    return this.state;
                }
            }
            for (const mark of this.enhancedAndrewPitchforkMarks) {
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
                    this.enhancedAndrewPitchforkMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                        m.setHoverPoint(null);
                    });
                    this.isOperating = true;
                    return this.state;
                }
            }
        } catch (error) {
            this.state = this.cancelEnhancedAndrewPitchforkMode();
        }
        return this.state;
    };

    private handleDrawingPhaseMouseDown = (time: number, price: number, point: Point): EnhancedAndrewPitchforkMarkState => {
        const { chartSeries } = this.props;
        if (this.state.drawingPhase === 'handle') {
            this.handleTime = time;
            this.handlePrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'baseStart',
                enhancedAndrewPitchforkHandlePoint: point
            };
            this.previewEnhancedAndrewPitchfork = new EnhancedAndrewPitchforkMark(
                this.handleTime,
                this.handlePrice,
                time,
                price,
                time,
                price,
                '#2962FF',
                '#FF6B6B',
                2,
                true
            );
            chartSeries?.series.attachPrimitive(this.previewEnhancedAndrewPitchfork);
        } else if (this.state.drawingPhase === 'baseStart') {
            this.baseStartTime = time;
            this.baseStartPrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'baseEnd',
                enhancedAndrewPitchforkBaseStartPoint: point
            };
            if (this.previewEnhancedAndrewPitchfork) {
                this.previewEnhancedAndrewPitchfork.updateBaseStartPoint(time, price);
                this.previewEnhancedAndrewPitchfork.updateBaseEndPoint(time, price);
            }
        } else if (this.state.drawingPhase === 'baseEnd') {
            this.baseEndTime = time;
            this.baseEndPrice = price;
            if (this.previewEnhancedAndrewPitchfork) {
                this.previewEnhancedAndrewPitchfork.updateBaseEndPoint(time, price);
                this.previewEnhancedAndrewPitchfork.setPreviewMode(false);
                const finalEnhancedAndrewPitchfork = new EnhancedAndrewPitchforkMark(
                    this.handleTime,
                    this.handlePrice,
                    this.baseStartTime,
                    this.baseStartPrice,
                    this.baseEndTime,
                    this.baseEndPrice,
                    '#2962FF',
                    '#FF6B6B',
                    2,
                    false
                );
                chartSeries?.series.detachPrimitive(this.previewEnhancedAndrewPitchfork);
                chartSeries?.series.attachPrimitive(finalEnhancedAndrewPitchfork);
                this.enhancedAndrewPitchforkMarks.push(finalEnhancedAndrewPitchfork);
                this.previewEnhancedAndrewPitchfork = null;
                finalEnhancedAndrewPitchfork.setShowHandles(true);
                this.state = {
                    ...this.state,
                    isEnhancedAndrewPitchforkMode: false,
                    enhancedAndrewPitchforkHandlePoint: null,
                    enhancedAndrewPitchforkBaseStartPoint: null,
                    currentEnhancedAndrewPitchfork: null,
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
        const { handleX, handleY, baseStartX, baseStartY, baseEndX, baseEndY, minX, maxX, minY, maxY } = bounds;
        if (x < minX - threshold || x > maxX + threshold || y < minY - threshold || y > maxY + threshold) {
            return false;
        }
        const baseMidX = (baseStartX + baseEndX) / 2;
        const baseMidY = (baseStartY + baseEndY) / 2;
        const handleVectorX = handleX - baseMidX;
        const handleVectorY = handleY - baseMidY;
        const basePoints = [];
        for (let i = 0; i < 5; i++) {
            const t = i / 4;
            const pointX = baseStartX + (baseEndX - baseStartX) * t;
            const pointY = baseStartY + (baseEndY - baseStartY) * t;
            basePoints.push({ x: pointX, y: pointY });
        }
        const lines = basePoints.map(point => ({
            start: point.x,
            startY: point.y,
            endX: point.x + handleVectorX,
            endY: point.y + handleVectorY
        }));
        for (const line of lines) {
            const dist = this.pointToLineDistance(x, y, line.start, line.startY, line.endX, line.endY);
            if (dist <= threshold) return true;
        }
        const handleDist = this.pointToLineDistance(x, y, baseMidX, baseMidY, handleX, handleY);
        if (handleDist <= threshold) return true;
        const baseDist = this.pointToLineDistance(x, y, baseStartX, baseStartY, baseEndX, baseEndY);
        if (baseDist <= threshold) return true;
        return false;
    }

    private pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
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
                if (this.state.adjustingMode === 'handle') {
                    this.state.dragTarget.updateHandlePoint(time, price);
                } else if (this.state.adjustingMode === 'baseStart') {
                    this.state.dragTarget.updateBaseStartPoint(time, price);
                } else if (this.state.adjustingMode === 'baseEnd') {
                    this.state.dragTarget.updateBaseEndPoint(time, price);
                }
            }
            if (this.state.drawingPhase !== 'none') {
                if (this.state.drawingPhase === 'baseStart' && this.previewEnhancedAndrewPitchfork) {
                    this.previewEnhancedAndrewPitchfork.updateBaseStartPoint(time, price);
                    this.previewEnhancedAndrewPitchfork.updateBaseEndPoint(time, price);
                } else if (this.state.drawingPhase === 'baseEnd' && this.previewEnhancedAndrewPitchfork) {
                    this.previewEnhancedAndrewPitchfork.updateBaseEndPoint(time, price);
                }
                return;
            }
            let newHoverPoint: 'handle' | 'baseStart' | 'baseEnd' | 'line' | null = null;
            for (const mark of this.enhancedAndrewPitchforkMarks) {
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
        } catch (error) {
        }
    };

    public handleMouseUp = (point: Point): EnhancedAndrewPitchforkMarkState => {
        if (this.state.adjustingMode) {
            this.state = {
                ...this.state,
                isEnhancedAndrewPitchforkMode: false,
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
        this.dragStartData = null;
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): EnhancedAndrewPitchforkMarkState => {
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
            } else if (this.state.isEnhancedAndrewPitchforkMode || this.state.drawingPhase !== 'none') {
                return this.cancelEnhancedAndrewPitchforkMode();
            }
        }
        return this.state;
    };

    public getState(): EnhancedAndrewPitchforkMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<EnhancedAndrewPitchforkMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewEnhancedAndrewPitchfork) {
            this.props.chartSeries?.series.detachPrimitive(this.previewEnhancedAndrewPitchfork);
            this.previewEnhancedAndrewPitchfork = null;
        }
        this.enhancedAndrewPitchforkMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.enhancedAndrewPitchforkMarks = [];
        this.hiddenMarks = [];
    }

    public getEnhancedAndrewPitchforkMarks(): EnhancedAndrewPitchforkMark[] {
        return [...this.enhancedAndrewPitchforkMarks];
    }

    public removeEnhancedAndrewPitchforkMark(mark: EnhancedAndrewPitchforkMark): void {
        const index = this.enhancedAndrewPitchforkMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.enhancedAndrewPitchforkMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isEnhancedAndrewPitchforkMode ||
            this.state.drawingPhase !== 'none' || this.state.adjustingMode !== null;
    }

    private hiddenMarks: EnhancedAndrewPitchforkMark[] = [];

    public hideAllMarks(): void {
        this.hiddenMarks.push(...this.enhancedAndrewPitchforkMarks);
        this.enhancedAndrewPitchforkMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.enhancedAndrewPitchforkMarks = [];
    }

    public showAllMarks(): void {
        this.enhancedAndrewPitchforkMarks.push(...this.hiddenMarks);
        this.hiddenMarks.forEach(mark => {
            this.props.chartSeries?.series.attachPrimitive(mark);
        });
        this.hiddenMarks = [];
    }

    public hideMark(mark: EnhancedAndrewPitchforkMark): void {
        const index = this.enhancedAndrewPitchforkMarks.indexOf(mark);
        if (index > -1) {
            this.enhancedAndrewPitchforkMarks.splice(index, 1);
            this.hiddenMarks.push(mark);
            this.props.chartSeries?.series.detachPrimitive(mark);
        }
    }

    public showMark(mark: EnhancedAndrewPitchforkMark): void {
        const index = this.hiddenMarks.indexOf(mark);
        if (index > -1) {
            this.hiddenMarks.splice(index, 1);
            this.enhancedAndrewPitchforkMarks.push(mark);
            this.props.chartSeries?.series.attachPrimitive(mark);
        }
    }
}