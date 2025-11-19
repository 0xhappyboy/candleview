import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { PinMark } from "../../Mark/Text/PinMark";
import { Point } from "../../types";

export interface PinMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface PinMarkState {
    isPinMarkMode: boolean;
    pinMarkPoint: Point | null;
    currentPinMark: PinMark | null;
    isDragging: boolean;
    dragTarget: PinMark | null;
}

export class PinMarkManager implements IMarkManager<PinMark> {
    private props: PinMarkManagerProps;
    private state: PinMarkState;
    private previewPinMark: PinMark | null = null;
    private pinMarks: PinMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private isCreatingNewPin: boolean = false;

    constructor(props: PinMarkManagerProps) {
        this.props = props;
        this.state = {
            isPinMarkMode: false,
            pinMarkPoint: null,
            currentPinMark: null,
            isDragging: false,
            dragTarget: null
        };
        this._handlePinMarkDragStart = this._handlePinMarkDragStart.bind(this);
        this._addEventListeners();
    }

    private _addEventListeners() {
        if (this.props.chart) {
            const chartElement = this.props.chart.chartElement();
            if (chartElement) {
                chartElement.addEventListener('pinMarkDragStart', this._handlePinMarkDragStart);
            }
        }
    }

    private _removeEventListeners() {
        if (this.props.chart) {
            const chartElement = this.props.chart.chartElement();
            if (chartElement) {
                chartElement.removeEventListener('pinMarkDragStart', this._handlePinMarkDragStart);
            }
        }
    }

    private _handlePinMarkDragStart(event: CustomEvent) {
        const { mark, clientX, clientY } = event.detail;
        this.state = {
            ...this.state,
            isPinMarkMode: true,
            isDragging: true,
            dragTarget: mark
        };
        this.isOperating = true;
        this.isCreatingNewPin = false;
        if (clientX !== undefined && clientY !== undefined) {
            const { chartSeries, chart, containerRef } = this.props;
            if (!chartSeries || !chart) return;
            try {
                const chartElement = chart.chartElement();
                if (!chartElement) return;
                const chartRect = chartElement.getBoundingClientRect();
                const containerRect = containerRef.current?.getBoundingClientRect();
                if (!containerRect) return;
                const relativeX = clientX - (containerRect.left - chartRect.left);
                const relativeY = clientY - (containerRect.top - chartRect.top);
                const timeScale = chart.timeScale();
                const time = timeScale.coordinateToTime(relativeX);
                const price = chartSeries.series.coordinateToPrice(relativeY);
                if (time !== null && price !== null) {
                    this.dragStartData = { time, price };
                }
            } catch (error) {
                console.error(error);
            }
        }
        event.stopPropagation();
    }

    public clearState(): void {
        this.state = {
            isPinMarkMode: false,
            pinMarkPoint: null,
            currentPinMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isCreatingNewPin = false;
    }

    public getMarkAtPoint(point: Point): PinMark | null {
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

            for (const mark of this.pinMarks) {
                if (mark.isPointNearPin(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): PinMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return 'pin';
    }

    public getCurrentOperatingMark(): PinMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewPinMark) {
            return this.previewPinMark;
        }
        if (this.state.isPinMarkMode && this.state.currentPinMark) {
            return this.state.currentPinMark;
        }
        return null;
    }

    public getAllMarks(): PinMark[] {
        return [...this.pinMarks];
    }

    public cancelOperationMode() {
        return this.cancelPinMarkMode();
    }

    public setPinMarkMode = (): PinMarkState => {
        this.state = {
            ...this.state,
            isPinMarkMode: true,
            pinMarkPoint: null,
            currentPinMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isCreatingNewPin = true;
        return this.state;
    };

    public cancelPinMarkMode = (): PinMarkState => {
        if (this.previewPinMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewPinMark);
            this.previewPinMark = null;
        }
        this.hideAllBubbles();
        this.state = {
            ...this.state,
            isPinMarkMode: false,
            pinMarkPoint: null,
            currentPinMark: null,
            isDragging: false,
            dragTarget: null
        };
        this.isOperating = false;
        this.isCreatingNewPin = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): PinMarkState => {
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
                this.hideAllBubbles();
                clickedMark.setShowBubble(true);
                this.state = {
                    ...this.state,
                    isDragging: true,
                    dragTarget: clickedMark,
                    currentPinMark: clickedMark
                };
                this.isOperating = true;
                this.isCreatingNewPin = false;
                if (this.props.chart) {
                    const chartElement = this.props.chart.chartElement();
                    chartElement.dispatchEvent(new CustomEvent('pinMarkDragStart', {
                        detail: { mark: clickedMark, clientX: point.x, clientY: point.y }
                    }));
                }
                return this.state;
            }
            if (!clickedMark) {
                this.hideAllBubbles();
                if (this.state.isPinMarkMode && this.isCreatingNewPin) {
                    const finalPinMark = new PinMark(
                        time, 
                        price,
                        '#3964FE',
                        'rgba(57, 100, 254, 0.9)',
                        '#FFFFFF',
                        12,
                        2,
                        `定位点 ${this.pinMarks.length + 1}`
                    );
                    chartSeries.series.attachPrimitive(finalPinMark);
                    this.pinMarks.push(finalPinMark);
                    this.state = {
                        ...this.state,
                        isPinMarkMode: false,
                        pinMarkPoint: null,
                        currentPinMark: null
                    };
                    this.isCreatingNewPin = false;
                    if (this.props.onCloseDrawing) {
                        this.props.onCloseDrawing();
                    }
                } else if (this.state.isPinMarkMode) {
                    return this.cancelPinMarkMode();
                }
            }
        } catch (error) {
            console.error(error);
            this.state = this.cancelPinMarkMode();
        }
        return this.state;
    };

    private hideAllBubbles(): void {
        this.pinMarks.forEach(mark => {
            mark.setShowBubble(false);
        });
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
            if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
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

    public handleMouseUp = (point: Point): PinMarkState => {
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

    public handleKeyDown = (event: KeyboardEvent): PinMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isDragging) {
                if (this.state.dragTarget) {
                    this.state.dragTarget.setDragging(false);
                    this.state.dragTarget.setShowBubble(false);
                }
                this.state = {
                    ...this.state,
                    isDragging: false,
                    dragTarget: null
                };
                this.isCreatingNewPin = false;
            } else if (this.state.isPinMarkMode) {
                return this.cancelPinMarkMode();
            }
        }
        return this.state;
    };

    public getState(): PinMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<PinMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this._removeEventListeners();
        if (this.previewPinMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewPinMark);
            this.previewPinMark = null;
        }
        this.pinMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.pinMarks = [];
    }

    public getPinMarks(): PinMark[] {
        return [...this.pinMarks];
    }

    public removePinMark(mark: PinMark): void {
        const index = this.pinMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.pinMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isPinMarkMode;
    }

    public updatePinText(mark: PinMark, text: string): void {
        mark.updateBubbleText(text);
    }
}