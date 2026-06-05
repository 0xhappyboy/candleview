import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { SchiffPitchforkMark } from "../../Mark/Fork/SchiffPitchforkMark";
import { IMarkManager } from "../../Mark/IMarkManager";
import { Point } from "../../types";

export interface SchiffPitchforkMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface SchiffPitchforkMarkState {
    isSchiffPitchforkMode: boolean;
    schiffPitchforkHandlePoint: Point | null;
    schiffPitchforkBaseStartPoint: Point | null;
    schiffPitchforkExtensionPoint: Point | null;
    currentSchiffPitchfork: SchiffPitchforkMark | null;
    isDragging: boolean;
    dragTarget: SchiffPitchforkMark | null;
    dragPoint: 'handle' | 'baseStart' | 'baseEnd' | 'extension' | 'line' | null;
    drawingPhase: 'handle' | 'baseStart' | 'baseEnd' | 'extension' | 'none';
    adjustingMode: 'handle' | 'baseStart' | 'baseEnd' | 'extension' | null;
    adjustStartData: {
        handleTime: number; handlePrice: number;
        baseStartTime: number; baseStartPrice: number;
        baseEndTime: number; baseEndPrice: number;
        extensionTime: number; extensionPrice: number;
    } | null;
}

export class SchiffPitchforkMarkManager implements IMarkManager<SchiffPitchforkMark> {
    private props: SchiffPitchforkMarkManagerProps;
    private state: SchiffPitchforkMarkState;
    private previewSchiffPitchfork: SchiffPitchforkMark | null = null;
    private schiffPitchforkMarks: SchiffPitchforkMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private handleTime: number = 0;
    private handlePrice: number = 0;
    private baseStartTime: number = 0;
    private baseStartPrice: number = 0;
    private baseEndTime: number = 0;
    private baseEndPrice: number = 0;
    private extensionTime: number = 0;
    private extensionPrice: number = 0;

    constructor(props: SchiffPitchforkMarkManagerProps) {
        this.props = props;
        this.state = {
            isSchiffPitchforkMode: false,
            schiffPitchforkHandlePoint: null,
            schiffPitchforkBaseStartPoint: null,
            schiffPitchforkExtensionPoint: null,
            currentSchiffPitchfork: null,
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
            isSchiffPitchforkMode: false,
            schiffPitchforkHandlePoint: null,
            schiffPitchforkBaseStartPoint: null,
            schiffPitchforkExtensionPoint: null,
            currentSchiffPitchfork: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'none',
            adjustingMode: null,
            adjustStartData: null
        };
    }

    public getMarkAtPoint(point: Point): SchiffPitchforkMark | null {
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
            for (const mark of this.schiffPitchforkMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }
            for (const mark of this.schiffPitchforkMarks) {
                const bounds = mark.getBounds();
                if (bounds && this.isPointNearLine(relativeX, relativeY, bounds)) {
                    return mark;
                }
            }
        } catch (error) {
        }
        return null;
    }

    public getCurrentDragTarget(): SchiffPitchforkMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): SchiffPitchforkMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewSchiffPitchfork) {
            return this.previewSchiffPitchfork;
        }
        if (this.state.isSchiffPitchforkMode && this.state.currentSchiffPitchfork) {
            return this.state.currentSchiffPitchfork;
        }
        return null;
    }

    public getAllMarks(): SchiffPitchforkMark[] {
        return [...this.schiffPitchforkMarks];
    }

    public cancelOperationMode() {
        return this.cancelSchiffPitchforkMode();
    }

    public setSchiffPitchforkMode = (): SchiffPitchforkMarkState => {
        this.state = {
            ...this.state,
            isSchiffPitchforkMode: true,
            schiffPitchforkHandlePoint: null,
            schiffPitchforkBaseStartPoint: null,
            schiffPitchforkExtensionPoint: null,
            currentSchiffPitchfork: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            drawingPhase: 'handle',
            adjustingMode: null,
            adjustStartData: null
        };
        return this.state;
    };

    public cancelSchiffPitchforkMode = (): SchiffPitchforkMarkState => {
        if (this.previewSchiffPitchfork) {
            this.props.chartSeries?.series.detachPrimitive(this.previewSchiffPitchfork);
            this.previewSchiffPitchfork = null;
        }
        this.schiffPitchforkMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setHoverPoint(null);
        });
        this.state = {
            ...this.state,
            isSchiffPitchforkMode: false,
            schiffPitchforkHandlePoint: null,
            schiffPitchforkBaseStartPoint: null,
            schiffPitchforkExtensionPoint: null,
            currentSchiffPitchfork: null,
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
        this.extensionTime = 0;
        this.extensionPrice = 0;
        return this.state;
    };

    public handleMouseDown = (point: Point): SchiffPitchforkMarkState => {
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
            for (const mark of this.schiffPitchforkMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    const adjustStartData = {
                        handleTime: mark.getHandleTime(),
                        handlePrice: mark.getHandlePrice(),
                        baseStartTime: mark.getBaseStartTime(),
                        baseStartPrice: mark.getBaseStartPrice(),
                        baseEndTime: mark.getBaseEndTime(),
                        baseEndPrice: mark.getBaseEndPrice(),
                        extensionTime: mark.getExtensionTime(),
                        extensionPrice: mark.getExtensionPrice()
                    };
                    this.state = {
                        ...this.state,
                        isSchiffPitchforkMode: true,
                        isDragging: false,
                        dragTarget: mark,
                        dragPoint: handleType,
                        adjustingMode: handleType,
                        adjustStartData: adjustStartData
                    };
                    this.schiffPitchforkMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                        m.setHoverPoint(null);
                    });
                    this.isOperating = true;
                    return this.state;
                }
            }
            for (const mark of this.schiffPitchforkMarks) {
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
                    this.schiffPitchforkMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                        m.setHoverPoint(null);
                    });
                    this.isOperating = true;
                    return this.state;
                }
            }
        } catch (error) {
            this.state = this.cancelSchiffPitchforkMode();
        }
        return this.state;
    };

    private handleDrawingPhaseMouseDown = (time: number, price: number, point: Point): SchiffPitchforkMarkState => {
        const { chartSeries } = this.props;
        if (this.state.drawingPhase === 'handle') {
            this.handleTime = time;
            this.handlePrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'baseStart',
                schiffPitchforkHandlePoint: point
            };
            this.previewSchiffPitchfork = new SchiffPitchforkMark(
                this.handleTime,
                this.handlePrice,
                time,
                price,
                time,
                price,
                time,
                price,
                '#2962FF',
                '#FF6B6B',
                2,
                true
            );
            chartSeries?.series.attachPrimitive(this.previewSchiffPitchfork);
        } else if (this.state.drawingPhase === 'baseStart') {
            this.baseStartTime = time;
            this.baseStartPrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'baseEnd',
                schiffPitchforkBaseStartPoint: point
            };
            if (this.previewSchiffPitchfork) {
                this.previewSchiffPitchfork.updateBaseStartPoint(time, price);
                this.previewSchiffPitchfork.updateBaseEndPoint(time, price);
                this.previewSchiffPitchfork.updateExtensionPoint(time, price);
            }
        } else if (this.state.drawingPhase === 'baseEnd') {
            this.baseEndTime = time;
            this.baseEndPrice = price;
            this.state = {
                ...this.state,
                drawingPhase: 'extension',
                schiffPitchforkExtensionPoint: point
            };
            if (this.previewSchiffPitchfork) {
                this.previewSchiffPitchfork.updateBaseEndPoint(time, price);
                this.previewSchiffPitchfork.updateExtensionPoint(time, price);
            }
        } else if (this.state.drawingPhase === 'extension') {
            this.extensionTime = time;
            this.extensionPrice = price;
            if (this.previewSchiffPitchfork) {
                this.previewSchiffPitchfork.updateExtensionPoint(time, price);
                this.previewSchiffPitchfork.setPreviewMode(false);
                const finalSchiffPitchfork = new SchiffPitchforkMark(
                    this.handleTime,
                    this.handlePrice,
                    this.baseStartTime,
                    this.baseStartPrice,
                    this.baseEndTime,
                    this.baseEndPrice,
                    this.extensionTime,
                    this.extensionPrice,
                    '#2962FF',
                    '#FF6B6B',
                    2,
                    false
                );
                chartSeries?.series.detachPrimitive(this.previewSchiffPitchfork);
                chartSeries?.series.attachPrimitive(finalSchiffPitchfork);
                this.schiffPitchforkMarks.push(finalSchiffPitchfork);
                this.previewSchiffPitchfork = null;
                finalSchiffPitchfork.setShowHandles(true);
                this.state = {
                    ...this.state,
                    isSchiffPitchforkMode: false,
                    schiffPitchforkHandlePoint: null,
                    schiffPitchforkBaseStartPoint: null,
                    schiffPitchforkExtensionPoint: null,
                    currentSchiffPitchfork: null,
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
        const { handleX, handleY, baseStartX, baseStartY, baseEndX, baseEndY, extensionX, extensionY, minX, maxX, minY, maxY } = bounds;
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
        const extensionDist = this.pointToLineDistance(x, y, baseStartX, baseStartY, extensionX, extensionY);
        if (extensionDist <= threshold) return true;
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
                } else if (this.state.adjustingMode === 'extension') {
                    this.state.dragTarget.updateExtensionPoint(time, price);
                }
            }
            if (this.state.drawingPhase !== 'none') {
                if (this.state.drawingPhase === 'baseStart' && this.previewSchiffPitchfork) {
                    this.previewSchiffPitchfork.updateBaseStartPoint(time, price);
                    this.previewSchiffPitchfork.updateBaseEndPoint(time, price);
                    this.previewSchiffPitchfork.updateExtensionPoint(time, price);
                } else if (this.state.drawingPhase === 'baseEnd' && this.previewSchiffPitchfork) {
                    this.previewSchiffPitchfork.updateBaseEndPoint(time, price);
                    this.previewSchiffPitchfork.updateExtensionPoint(time, price);
                } else if (this.state.drawingPhase === 'extension' && this.previewSchiffPitchfork) {
                    this.previewSchiffPitchfork.updateExtensionPoint(time, price);
                }
                return;
            }
            let newHoverPoint: 'handle' | 'baseStart' | 'baseEnd' | 'extension' | 'line' | null = null;
            for (const mark of this.schiffPitchforkMarks) {
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

    public handleMouseUp = (point: Point): SchiffPitchforkMarkState => {
        if (this.state.adjustingMode) {
            this.state = {
                ...this.state,
                isSchiffPitchforkMode: false,
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

    public handleKeyDown = (event: KeyboardEvent): SchiffPitchforkMarkState => {
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
            } else if (this.state.isSchiffPitchforkMode || this.state.drawingPhase !== 'none') {
                return this.cancelSchiffPitchforkMode();
            }
        }
        return this.state;
    };

    public getState(): SchiffPitchforkMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<SchiffPitchforkMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewSchiffPitchfork) {
            this.props.chartSeries?.series.detachPrimitive(this.previewSchiffPitchfork);
            this.previewSchiffPitchfork = null;
        }
        this.schiffPitchforkMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.schiffPitchforkMarks = [];
        this.hiddenMarks = [];
    }

    public getSchiffPitchforkMarks(): SchiffPitchforkMark[] {
        return [...this.schiffPitchforkMarks];
    }

    public removeSchiffPitchforkMark(mark: SchiffPitchforkMark): void {
        const index = this.schiffPitchforkMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.schiffPitchforkMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isSchiffPitchforkMode ||
            this.state.drawingPhase !== 'none' || this.state.adjustingMode !== null;
    }

    private hiddenMarks: SchiffPitchforkMark[] = [];

    public hideAllMarks(): void {
        this.hiddenMarks.push(...this.schiffPitchforkMarks);
        this.schiffPitchforkMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.schiffPitchforkMarks = [];
    }

    public showAllMarks(): void {
        this.schiffPitchforkMarks.push(...this.hiddenMarks);
        this.hiddenMarks.forEach(mark => {
            this.props.chartSeries?.series.attachPrimitive(mark);
        });
        this.hiddenMarks = [];
    }

    public hideMark(mark: SchiffPitchforkMark): void {
        const index = this.schiffPitchforkMarks.indexOf(mark);
        if (index > -1) {
            this.schiffPitchforkMarks.splice(index, 1);
            this.hiddenMarks.push(mark);
            this.props.chartSeries?.series.detachPrimitive(mark);
        }
    }

    public showMark(mark: SchiffPitchforkMark): void {
        const index = this.hiddenMarks.indexOf(mark);
        if (index > -1) {
            this.hiddenMarks.splice(index, 1);
            this.schiffPitchforkMarks.push(mark);
            this.props.chartSeries?.series.attachPrimitive(mark);
        }
    }
}