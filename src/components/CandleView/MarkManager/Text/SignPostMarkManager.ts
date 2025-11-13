import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { SignPostMark } from "../../Mark/Text/SignPostMark";
import { Point } from "../../types";

export interface SignPostMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface SignPostMarkState {
    isSignPostMarkMode: boolean;
    signPostMarkPoint: Point | null;
    currentSignPostMark: SignPostMark | null;
    isDragging: boolean;
    dragTarget: SignPostMark | null;
}

export class SignPostMarkManager implements IMarkManager<SignPostMark> {
    private props: SignPostMarkManagerProps;
    private state: SignPostMarkState;
    private previewSignPostMark: SignPostMark | null = null;
    private landmarkLabelMarks: SignPostMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private isCreatingNewLabel: boolean = false;

    constructor(props: SignPostMarkManagerProps) {
        this.props = props;
        this.state = {
            isSignPostMarkMode: false,
            signPostMarkPoint: null,
            currentSignPostMark: null,
            isDragging: false,
            dragTarget: null
        };
    }

    public clearState(): void {
        this.state = {
            isSignPostMarkMode: false,
            signPostMarkPoint: null,
            currentSignPostMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isCreatingNewLabel = false;
    }

    public getMarkAtPoint(point: Point): SignPostMark | null {
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

            for (const mark of this.landmarkLabelMarks) {
                if (mark.isPointNearLabel(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): SignPostMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return 'label';
    }

    public getCurrentOperatingMark(): SignPostMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewSignPostMark) {
            return this.previewSignPostMark;
        }
        if (this.state.isSignPostMarkMode && this.state.currentSignPostMark) {
            return this.state.currentSignPostMark;
        }
        return null;
    }

    public getAllMarks(): SignPostMark[] {
        return [...this.landmarkLabelMarks];
    }

    public cancelOperationMode() {
        return this.cancelSignPostMarkMode();
    }

    public setSignPostMarkMode = (): SignPostMarkState => {
        this.state = {
            ...this.state,
            isSignPostMarkMode: true,
            signPostMarkPoint: null,
            currentSignPostMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isCreatingNewLabel = true;
        return this.state;
    };

    public cancelSignPostMarkMode = (): SignPostMarkState => {
        if (this.previewSignPostMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewSignPostMark);
            this.previewSignPostMark = null;
        }
        this.state = {
            ...this.state,
            isSignPostMarkMode: false,
            signPostMarkPoint: null,
            currentSignPostMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isOperating = false;
        this.isCreatingNewLabel = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): SignPostMarkState => {
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
            const clickedMark = this.getMarkAtPoint(point);
            if (clickedMark) {
                if (!this.state.isSignPostMarkMode) {
                    this.state = {
                        ...this.state,
                        isSignPostMarkMode: true,
                        isDragging: true,
                        dragTarget: clickedMark
                    };
                    clickedMark.setDragging(true);
                    this.isOperating = true;
                    this.isCreatingNewLabel = false;
                } else {
                    this.state = {
                        ...this.state,
                        isSignPostMarkMode: false,
                        isDragging: false,
                        dragTarget: null
                    };
                    this.isOperating = false;
                    this.isCreatingNewLabel = false;
                    if (this.props.onCloseDrawing) {
                        this.props.onCloseDrawing();
                    }
                }
                return this.state;
            }
            if (this.state.isSignPostMarkMode && !this.state.isDragging && this.isCreatingNewLabel) {
                const finalSignPostMark = new SignPostMark(
                    time.toString(),
                    price,
                    "",
                    '#FFFFFF',
                    'FFFFFF',
                    '#FFFFFF',
                    12,
                    2,
                );
                chartSeries.series.attachPrimitive(finalSignPostMark);
                finalSignPostMark.attached({ chart: chart, series: chartSeries.series });
                const snappedData = finalSignPostMark.snapToNearestBar(time.toString());
                finalSignPostMark.updatePosition(snappedData.time, snappedData.price);
                this.landmarkLabelMarks.push(finalSignPostMark);
                this.state = {
                    ...this.state,
                    isSignPostMarkMode: false,
                    signPostMarkPoint: null,
                    currentSignPostMark: null
                };
                this.isCreatingNewLabel = false;
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            } else if (this.state.isSignPostMarkMode && !this.isCreatingNewLabel) {
                return this.cancelSignPostMarkMode();
            }
        } catch (error) {
            console.error(error);
            this.state = this.cancelSignPostMarkMode();
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
            if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
                if (this.dragStartData.time === null || time === null) return;
                const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
                const currentX = timeScale.timeToCoordinate(time);
                const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                const currentY = chartSeries.series.priceToCoordinate(price);
                if (currentStartX === null || currentX === null || currentStartY === null || currentY === null) return;
                const deltaX = currentX - currentStartX;
                const deltaY = currentY - currentStartY;
                this.state.dragTarget.dragByPixels(deltaX, deltaY);
                this.dragStartData = { time, price };
                return;
            }
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): SignPostMarkState => {
        if (this.state.isDragging) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDragging(false);
            }
            this.state = {
                ...this.state,
                isDragging: false,
                dragTarget: null
            };
            this.isOperating = false;
        }
        this.dragStartData = null;
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): SignPostMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isDragging) {
                if (this.state.dragTarget) {
                    this.state.dragTarget.setDragging(false);
                }
                this.state = {
                    ...this.state,
                    isDragging: false,
                    dragTarget: null
                };
                this.isCreatingNewLabel = false;
            } else if (this.state.isSignPostMarkMode) {
                return this.cancelSignPostMarkMode();
            }
        }
        return this.state;
    };

    public getState(): SignPostMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<SignPostMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewSignPostMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewSignPostMark);
            this.previewSignPostMark = null;
        }

        this.landmarkLabelMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.landmarkLabelMarks = [];
    }

    public getSignPostMarks(): SignPostMark[] {
        return [...this.landmarkLabelMarks];
    }

    public removeSignPostMark(mark: SignPostMark): void {
        const index = this.landmarkLabelMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.landmarkLabelMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isSignPostMarkMode;
    }
}