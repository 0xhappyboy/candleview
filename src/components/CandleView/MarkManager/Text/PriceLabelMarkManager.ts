import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { PriceLabelMark } from "../../Mark/Text/PriceLabelMark";
import { Point } from "../../types";

export interface PriceLabelMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface PriceLabelMarkState {
    isPriceLabelMarkMode: boolean;
    priceLabelMarkPoint: Point | null;
    currentPriceLabelMark: PriceLabelMark | null;
    isDragging: boolean;
    dragTarget: PriceLabelMark | null;
}

export class PriceLabelMarkManager implements IMarkManager<PriceLabelMark> {
    private props: PriceLabelMarkManagerProps;
    private state: PriceLabelMarkState;
    private previewPriceLabelMark: PriceLabelMark | null = null;
    private priceLabelMarks: PriceLabelMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private isCreatingNewLabel: boolean = false;

    constructor(props: PriceLabelMarkManagerProps) {
        this.props = props;
        this.state = {
            isPriceLabelMarkMode: false,
            priceLabelMarkPoint: null,
            currentPriceLabelMark: null,
            isDragging: false,
            dragTarget: null
        };
    }

    public clearState(): void {
        this.state = {
            isPriceLabelMarkMode: false,
            priceLabelMarkPoint: null,
            currentPriceLabelMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isCreatingNewLabel = false;
    }

    public getMarkAtPoint(point: Point): PriceLabelMark | null {
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

            for (const mark of this.priceLabelMarks) {
                if (mark.isPointNearLabel(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
        }
        return null;
    }

    public getCurrentDragTarget(): PriceLabelMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return 'label';
    }

    public getCurrentOperatingMark(): PriceLabelMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewPriceLabelMark) {
            return this.previewPriceLabelMark;
        }
        if (this.state.isPriceLabelMarkMode && this.state.currentPriceLabelMark) {
            return this.state.currentPriceLabelMark;
        }
        return null;
    }

    public getAllMarks(): PriceLabelMark[] {
        return [...this.priceLabelMarks];
    }

    public cancelOperationMode() {
        return this.cancelPriceLabelMarkMode();
    }

    public setPriceLabelMarkMode = (): PriceLabelMarkState => {
        this.state = {
            ...this.state,
            isPriceLabelMarkMode: true,
            priceLabelMarkPoint: null,
            currentPriceLabelMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isCreatingNewLabel = true;
        return this.state;
    };

    public cancelPriceLabelMarkMode = (): PriceLabelMarkState => {
        if (this.previewPriceLabelMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewPriceLabelMark);
            this.previewPriceLabelMark = null;
        }
        this.state = {
            ...this.state,
            isPriceLabelMarkMode: false,
            priceLabelMarkPoint: null,
            currentPriceLabelMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isOperating = false;
        this.isCreatingNewLabel = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): PriceLabelMarkState => {
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
                if (!this.state.isPriceLabelMarkMode) {
                    this.state = {
                        ...this.state,
                        isPriceLabelMarkMode: true,
                        isDragging: true,
                        dragTarget: clickedMark
                    };
                    clickedMark.setDragging(true);
                    this.isOperating = true;
                    this.isCreatingNewLabel = false;
                } else {
                    this.state = {
                        ...this.state,
                        isPriceLabelMarkMode: false,
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
            if (this.state.isPriceLabelMarkMode && !this.state.isDragging && this.isCreatingNewLabel) {
                const finalPriceLabelMark = new PriceLabelMark(
                    time,
                    price,
                    '#2962FF',
                    'rgba(41, 98, 255, 0.9)',
                    '#FFFFFF',
                    12,
                    1,
                );
                chartSeries.series.attachPrimitive(finalPriceLabelMark);
                this.priceLabelMarks.push(finalPriceLabelMark);
                this.state = {
                    ...this.state,
                    isPriceLabelMarkMode: false,
                    priceLabelMarkPoint: null,
                    currentPriceLabelMark: null
                };
                this.isCreatingNewLabel = false;
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            } else if (this.state.isPriceLabelMarkMode && !this.isCreatingNewLabel) {
                return this.cancelPriceLabelMarkMode();
            }
        } catch (error) {
            this.state = this.cancelPriceLabelMarkMode();
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
                const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                const currentX = timeScale.timeToCoordinate(time);
                const currentY = chartSeries.series.priceToCoordinate(price);
                if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;
                const deltaX = currentX - currentStartX;
                const deltaY = currentY - currentStartY;
                this.state.dragTarget.dragByPixels(deltaX, deltaY);
                this.dragStartData = { time, price };
                return;
            }
        } catch (error) {
        }
    };

    public handleMouseUp = (point: Point): PriceLabelMarkState => {
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

    public handleKeyDown = (event: KeyboardEvent): PriceLabelMarkState => {
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
            } else if (this.state.isPriceLabelMarkMode) {
                return this.cancelPriceLabelMarkMode();
            }
        }
        return this.state;
    };

    public getState(): PriceLabelMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<PriceLabelMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewPriceLabelMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewPriceLabelMark);
            this.previewPriceLabelMark = null;
        }

        this.priceLabelMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.priceLabelMarks = [];
        this.hiddenPriceLabelMarks = [];
    }

    public getPriceLabelMarks(): PriceLabelMark[] {
        return [...this.priceLabelMarks];
    }

    public removePriceLabelMark(mark: PriceLabelMark): void {
        const index = this.priceLabelMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.priceLabelMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isPriceLabelMarkMode;
    }

    private hiddenPriceLabelMarks: PriceLabelMark[] = [];

    public hideAllMarks(): void {
        this.hiddenPriceLabelMarks.push(...this.priceLabelMarks);
        this.priceLabelMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.priceLabelMarks = [];
    }

    public showAllMarks(): void {
        this.priceLabelMarks.push(...this.hiddenPriceLabelMarks);
        this.hiddenPriceLabelMarks.forEach(mark => {
            this.props.chartSeries?.series.attachPrimitive(mark);
        });
        this.hiddenPriceLabelMarks = [];
    }

    public hideMark(mark: PriceLabelMark): void {
        const index = this.priceLabelMarks.indexOf(mark);
        if (index > -1) {
            this.priceLabelMarks.splice(index, 1);
            this.hiddenPriceLabelMarks.push(mark);
            this.props.chartSeries?.series.detachPrimitive(mark);
        }
    }

    public showMark(mark: PriceLabelMark): void {
        const index = this.hiddenPriceLabelMarks.indexOf(mark);
        if (index > -1) {
            this.hiddenPriceLabelMarks.splice(index, 1);
            this.priceLabelMarks.push(mark);
            this.props.chartSeries?.series.attachPrimitive(mark);
        }
    }
}