import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { FlagMark } from "../../Mark/Text/FlagMark";
import { Point } from "../../types";

export interface FlagMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface FlagMarkState {
    isFlagMarkMode: boolean;
    flagMarkPoint: Point | null;
    currentFlagMark: FlagMark | null;
    isDragging: boolean;
    dragTarget: FlagMark | null;
}

export class FlagMarkManager implements IMarkManager<FlagMark> {
    private props: FlagMarkManagerProps;
    private state: FlagMarkState;
    private previewFlagMark: FlagMark | null = null;
    private flagMarks: FlagMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private isCreatingNewFlag: boolean = false;

    constructor(props: FlagMarkManagerProps) {
        this.props = props;
        this.state = {
            isFlagMarkMode: false,
            flagMarkPoint: null,
            currentFlagMark: null,
            isDragging: false,
            dragTarget: null
        };
    }

    public clearState(): void {
        this.state = {
            isFlagMarkMode: false,
            flagMarkPoint: null,
            currentFlagMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isCreatingNewFlag = false;
    }

    public getMarkAtPoint(point: Point): FlagMark | null {
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

            for (const mark of this.flagMarks) {
                if (mark.isPointNearFlag(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): FlagMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return 'flag';
    }

    public getCurrentOperatingMark(): FlagMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewFlagMark) {
            return this.previewFlagMark;
        }
        if (this.state.isFlagMarkMode && this.state.currentFlagMark) {
            return this.state.currentFlagMark;
        }
        return null;
    }

    public getAllMarks(): FlagMark[] {
        return [...this.flagMarks];
    }

    public cancelOperationMode() {
        return this.cancelFlagMarkMode();
    }

    public setFlagMarkMode = (): FlagMarkState => {
        this.state = {
            ...this.state,
            isFlagMarkMode: true,
            flagMarkPoint: null,
            currentFlagMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isCreatingNewFlag = true;
        return this.state;
    };

    public cancelFlagMarkMode = (): FlagMarkState => {
        if (this.previewFlagMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewFlagMark);
            this.previewFlagMark = null;
        }
        this.state = {
            ...this.state,
            isFlagMarkMode: false,
            flagMarkPoint: null,
            currentFlagMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isOperating = false;
        this.isCreatingNewFlag = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): FlagMarkState => {
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
                if (!this.state.isFlagMarkMode) {
                    this.state = {
                        ...this.state,
                        isFlagMarkMode: true,
                        isDragging: true,
                        dragTarget: clickedMark
                    };
                    clickedMark.setDragging(true);
                    this.isOperating = true;
                    this.isCreatingNewFlag = false;
                } else {
                    this.state = {
                        ...this.state,
                        isFlagMarkMode: false,
                        isDragging: false,
                        dragTarget: null
                    };
                    this.isOperating = false;
                    this.isCreatingNewFlag = false;
                    if (this.props.onCloseDrawing) {
                        this.props.onCloseDrawing();
                    }
                }
                return this.state;
            }
            if (this.state.isFlagMarkMode && !this.state.isDragging && this.isCreatingNewFlag) {
                const finalFlagMark = new FlagMark(
                    time, 
                    price,
                    '#FF6B6B',
                    'rgba(255, 107, 107, 0.9)',
                    '#FFFFFF',
                    12,
                    2,
                    20
                );
                chartSeries.series.attachPrimitive(finalFlagMark);
                this.flagMarks.push(finalFlagMark);
                this.state = {
                    ...this.state,
                    isFlagMarkMode: false,
                    flagMarkPoint: null,
                    currentFlagMark: null
                };
                this.isCreatingNewFlag = false;
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            } else if (this.state.isFlagMarkMode && !this.isCreatingNewFlag) {
                return this.cancelFlagMarkMode();
            }
        } catch (error) {
            console.error(error);
            this.state = this.cancelFlagMarkMode();
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
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): FlagMarkState => {
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

    public handleKeyDown = (event: KeyboardEvent): FlagMarkState => {
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
                this.isCreatingNewFlag = false;
            } else if (this.state.isFlagMarkMode) {
                return this.cancelFlagMarkMode();
            }
        }
        return this.state;
    };

    public getState(): FlagMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<FlagMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewFlagMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewFlagMark);
            this.previewFlagMark = null;
        }

        this.flagMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.flagMarks = [];
    }

    public getFlagMarks(): FlagMark[] {
        return [...this.flagMarks];
    }

    public removeFlagMark(mark: FlagMark): void {
        const index = this.flagMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.flagMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isFlagMarkMode;
    }
}