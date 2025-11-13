import { ChartSeries } from "../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../Mark/IMarkManager";
import { DoubleCurveMark } from "../Mark/Shape/DoubleCurveMark";
import { Point } from "../types";

export interface DoubleCurveMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface DoubleCurveMarkState {
    isDoubleCurveMarkMode: boolean;
    doubleCurveMarkStartPoint: Point | null;
    currentDoubleCurveMark: DoubleCurveMark | null;
    isDragging: boolean;
    dragTarget: DoubleCurveMark | null;
    dragPoint: 'start' | 'end' | 'control1' | 'control2' | 'curve' | null;
}

export class DoubleCurveMarkManager implements IMarkManager<DoubleCurveMark> {
    private props: DoubleCurveMarkManagerProps;
    private state: DoubleCurveMarkState;
    private previewDoubleCurveMark: DoubleCurveMark | null = null;
    private doubleCurveMarks: DoubleCurveMark[] = [];
    private dragStartData: { time: string; price: number } | null = null;
    private isOperating: boolean = false;

    constructor(props: DoubleCurveMarkManagerProps) {
        this.props = props;
        this.state = {
            isDoubleCurveMarkMode: false,
            doubleCurveMarkStartPoint: null,
            currentDoubleCurveMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
    }

    public clearState(): void {
        this.state = {
            isDoubleCurveMarkMode: false,
            doubleCurveMarkStartPoint: null,
            currentDoubleCurveMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
    }

    private formatTime(time: any): string | null {
        if (time === null || time === undefined) return null;
        if (typeof time === 'number') {
            const date = new Date(time * 1000);
            return date.toISOString().split('T')[0];
        } else if (typeof time === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(time)) {
                return time;
            } else if (/^\d+$/.test(time)) {
                const date = new Date(parseInt(time) * 1000);
                return date.toISOString().split('T')[0];
            } else {
                try {
                    const date = new Date(time);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                } catch (e) {
                    console.warn('Invalid time format:', time);
                }
            }
        }
        return new Date().toISOString().split('T')[0];
    }

    public getMarkAtPoint(point: Point): DoubleCurveMark | null {
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
            for (const mark of this.doubleCurveMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }
            for (const mark of this.doubleCurveMarks) {
                if (mark.isPointNearCurve(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): DoubleCurveMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): DoubleCurveMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewDoubleCurveMark) {
            return this.previewDoubleCurveMark;
        }
        if (this.state.isDoubleCurveMarkMode && this.state.currentDoubleCurveMark) {
            return this.state.currentDoubleCurveMark;
        }
        return null;
    }

    public getAllMarks(): DoubleCurveMark[] {
        return [...this.doubleCurveMarks];
    }

    public cancelOperationMode() {
        return this.cancelDoubleCurveMarkMode();
    }

    public setDoubleCurveMarkMode = (): DoubleCurveMarkState => {
        this.state = {
            ...this.state,
            isDoubleCurveMarkMode: true,
            doubleCurveMarkStartPoint: null,
            currentDoubleCurveMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
        return this.state;
    };

    public cancelDoubleCurveMarkMode = (): DoubleCurveMarkState => {
        if (this.previewDoubleCurveMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewDoubleCurveMark);
            this.previewDoubleCurveMark = null;
        }
        this.doubleCurveMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isDoubleCurveMarkMode: false,
            doubleCurveMarkStartPoint: null,
            currentDoubleCurveMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): DoubleCurveMarkState => {
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
            const formattedTime = this.formatTime(time);
            if (formattedTime === null || price === null) return this.state;
            this.dragStartData = { time: formattedTime, price };
            for (const mark of this.doubleCurveMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    if (!this.state.isDoubleCurveMarkMode) {
                        this.state = {
                            ...this.state,
                            isDoubleCurveMarkMode: true,
                            isDragging: false,
                            dragTarget: mark,
                            dragPoint: handleType
                        };
                        this.doubleCurveMarks.forEach(m => {
                            m.setShowHandles(m === mark);
                        });
                        this.isOperating = true;
                    } else {
                        this.updateMarkPoint(mark, handleType, formattedTime, price);
                        this.state = {
                            ...this.state,
                            isDoubleCurveMarkMode: false,
                            isDragging: false,
                            dragTarget: null,
                            dragPoint: null
                        };
                        this.isOperating = false;
                        this.doubleCurveMarks.forEach(m => m.setShowHandles(false));
                        if (this.props.onCloseDrawing) {
                            this.props.onCloseDrawing();
                        }
                    }
                    return this.state;
                }
            }
            for (const mark of this.doubleCurveMarks) {
                if (mark.isPointNearCurve(relativeX, relativeY)) {
                    this.state = {
                        ...this.state,
                        isDragging: true,
                        dragTarget: mark,
                        dragPoint: 'curve'
                    };
                    mark.setDragging(true, 'curve');
                    this.doubleCurveMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                    });
                    this.isOperating = true;
                    return this.state;
                }
            }
            if (this.state.isDoubleCurveMarkMode && !this.state.isDragging) {
                if (!this.state.doubleCurveMarkStartPoint) {
                    this.state = {
                        ...this.state,
                        doubleCurveMarkStartPoint: point
                    };
                    this.previewDoubleCurveMark = new DoubleCurveMark(
                        formattedTime, price,
                        formattedTime, price,
                        formattedTime, price,
                        formattedTime, price,
                        '#2962FF', 2, true
                    );
                    chartSeries.series.attachPrimitive(this.previewDoubleCurveMark);
                    this.doubleCurveMarks.forEach(m => m.setShowHandles(false));
                } else {
                    if (this.previewDoubleCurveMark) {
                        chartSeries.series.detachPrimitive(this.previewDoubleCurveMark);
                        const startTime = this.previewDoubleCurveMark.getStartTime();
                        const startPrice = this.previewDoubleCurveMark.getStartPrice();
                        const endTime = formattedTime;
                        const endPrice = price;
                        const startTimeNum = new Date(startTime).getTime();
                        const endTimeNum = new Date(endTime).getTime();
                        const controlTime1Num = startTimeNum + (endTimeNum - startTimeNum) * 0.25;
                        const controlTime1 = new Date(controlTime1Num).toISOString().split('T')[0];
                        const controlPrice1 = startPrice + Math.abs(startPrice - endPrice) * 0.3;
                        const controlTime2Num = startTimeNum + (endTimeNum - startTimeNum) * 0.75;
                        const controlTime2 = new Date(controlTime2Num).toISOString().split('T')[0];
                        const controlPrice2 = endPrice - Math.abs(startPrice - endPrice) * 0.3;
                        const finalDoubleCurveMark = new DoubleCurveMark(
                            startTime, startPrice,
                            endTime, endPrice,
                            controlTime1, controlPrice1,
                            controlTime2, controlPrice2,
                            '#2962FF', 2, false
                        );
                        chartSeries.series.attachPrimitive(finalDoubleCurveMark);
                        this.doubleCurveMarks.push(finalDoubleCurveMark);
                        this.previewDoubleCurveMark = null;
                        finalDoubleCurveMark.setShowHandles(true);
                    }
                    this.state = {
                        ...this.state,
                        isDoubleCurveMarkMode: false,
                        doubleCurveMarkStartPoint: null,
                        currentDoubleCurveMark: null
                    };
                    if (this.props.onCloseDrawing) {
                        this.props.onCloseDrawing();
                    }
                }
            }
        } catch (error) {
            console.error(error);
            this.state = this.cancelDoubleCurveMarkMode();
        }
        return this.state;
    };

    private updateMarkPoint(mark: DoubleCurveMark, pointType: string, time: string, price: number) {
        switch (pointType) {
            case 'start':
                mark.updateStartPoint(time, price);
                break;
            case 'end':
                mark.updateEndPoint(time, price);
                break;
            case 'control1':
                mark.updateControlPoint1(time, price);
                break;
            case 'control2':
                mark.updateControlPoint2(time, price);
                break;
        }
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
            const formattedTime = this.formatTime(time);
            if (formattedTime === null || price === null) return;
            if (this.state.isDragging && this.state.dragTarget && this.dragStartData && this.state.dragPoint === 'curve') {
                if (this.dragStartData.time === null || formattedTime === null) return;
                const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
                const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                const currentX = timeScale.timeToCoordinate(formattedTime);
                const currentY = chartSeries.series.priceToCoordinate(price);
                if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;
                const deltaX = currentX - currentStartX;
                const deltaY = currentY - currentStartY;
                this.state.dragTarget.dragCurveByPixels(deltaX, deltaY);
                this.dragStartData = { time: formattedTime, price };
                return;
            }
            if (this.state.isDoubleCurveMarkMode && this.state.dragTarget && this.state.dragPoint &&
                (this.state.dragPoint === 'start' || this.state.dragPoint === 'end' ||
                    this.state.dragPoint === 'control1' || this.state.dragPoint === 'control2')) {
                this.updateMarkPoint(this.state.dragTarget, this.state.dragPoint, formattedTime, price);
            }
            if (!this.state.isDragging) {
                if (this.state.doubleCurveMarkStartPoint && this.previewDoubleCurveMark) {
                    this.previewDoubleCurveMark.updateEndPoint(formattedTime, price);
                    const startTime = this.previewDoubleCurveMark.getStartTime();
                    const startPrice = this.previewDoubleCurveMark.getStartPrice();
                    const startTimeNum = new Date(startTime).getTime();
                    const endTimeNum = new Date(formattedTime).getTime();
                    const controlTime1Num = startTimeNum + (endTimeNum - startTimeNum) * 0.25;
                    const controlTime1 = new Date(controlTime1Num).toISOString().split('T')[0];
                    const controlPrice1 = startPrice + Math.abs(startPrice - price) * 0.3;
                    const controlTime2Num = startTimeNum + (endTimeNum - startTimeNum) * 0.75;
                    const controlTime2 = new Date(controlTime2Num).toISOString().split('T')[0];
                    const controlPrice2 = price - Math.abs(startPrice - price) * 0.3;
                    this.previewDoubleCurveMark.updateControlPoint1(controlTime1, controlPrice1);
                    this.previewDoubleCurveMark.updateControlPoint2(controlTime2, controlPrice2);
                    // chart.timeScale().widthChanged();
                }
                if (!this.state.isDoubleCurveMarkMode && !this.state.isDragging && !this.state.doubleCurveMarkStartPoint) {
                    let anyCurveHovered = false;
                    for (const mark of this.doubleCurveMarks) {
                        const handleType = mark.isPointNearHandle(relativeX, relativeY);
                        const isNearCurve = mark.isPointNearCurve(relativeX, relativeY);
                        const shouldShow = !!handleType || isNearCurve;
                        mark.setShowHandles(shouldShow);
                        if (shouldShow) anyCurveHovered = true;
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): DoubleCurveMarkState => {
        if (this.state.isDragging) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDragging(false, null);
            }
            if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end' ||
                this.state.dragPoint === 'control1' || this.state.dragPoint === 'control2') {
                this.state = {
                    ...this.state,
                    isDoubleCurveMarkMode: false,
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
        }
        this.dragStartData = null;
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): DoubleCurveMarkState => {
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
            } else if (this.state.isDoubleCurveMarkMode) {
                return this.cancelDoubleCurveMarkMode();
            }
        }
        return this.state;
    };

    public getState(): DoubleCurveMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<DoubleCurveMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewDoubleCurveMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewDoubleCurveMark);
            this.previewDoubleCurveMark = null;
        }

        this.doubleCurveMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.doubleCurveMarks = [];
    }

    public getDoubleCurveMarks(): DoubleCurveMark[] {
        return [...this.doubleCurveMarks];
    }

    public removeDoubleCurveMark(mark: DoubleCurveMark): void {
        const index = this.doubleCurveMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.doubleCurveMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isDoubleCurveMarkMode;
    }
}