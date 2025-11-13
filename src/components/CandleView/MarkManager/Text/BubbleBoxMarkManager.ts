import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { BubbleBoxMark } from "../../Mark/Text/BubbleBoxMark";
import { Point } from "../../types";

export interface BubbleBoxMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface BubbleBoxMarkState {
    isBubbleBoxMarkMode: boolean;
    bubbleBoxMarkPoints: Point[] | null;
    currentBubbleBoxMark: BubbleBoxMark | null;
    isDragging: boolean;
    dragTarget: BubbleBoxMark | null;
    dragType: 'controlPoint' | 'bubble' | 'connection' | null;
}

export class BubbleBoxMarkManager implements IMarkManager<BubbleBoxMark> {
    private props: BubbleBoxMarkManagerProps;
    private state: BubbleBoxMarkState;
    private previewBubbleBoxMark: BubbleBoxMark | null = null;
    private bubbleBoxMarks: BubbleBoxMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private isCreatingNewBubble: boolean = false;
    private creationStep: number = 0;

    constructor(props: BubbleBoxMarkManagerProps) {
        this.props = props;
        this.state = {
            isBubbleBoxMarkMode: false,
            bubbleBoxMarkPoints: null,
            currentBubbleBoxMark: null,
            isDragging: false,
            dragTarget: null,
            dragType: null
        };
        this._handleBubbleBoxMarkDragStart = this._handleBubbleBoxMarkDragStart.bind(this);
        this._addEventListeners();
    }

    private _addEventListeners() {
        if (this.props.chart) {
            const chartElement = this.props.chart.chartElement();
            if (chartElement) {
                chartElement.addEventListener('bubbleBoxMarkDragStart', this._handleBubbleBoxMarkDragStart);
            }
        }
    }

    private _removeEventListeners() {
        if (this.props.chart) {
            const chartElement = this.props.chart.chartElement();
            if (chartElement) {
                chartElement.removeEventListener('bubbleBoxMarkDragStart', this._handleBubbleBoxMarkDragStart);
            }
        }
    }

    private _handleBubbleBoxMarkDragStart(event: CustomEvent) {
        const { mark, dragType, clientX, clientY } = event.detail;
        this.state = {
            ...this.state,
            isBubbleBoxMarkMode: true,
            isDragging: true,
            dragTarget: mark,
            dragType: dragType
        };
        if (dragType === 'controlPoint') {
            mark.setDraggingControlPoint(true);
        } else if (dragType === 'bubble') {
            mark.setDraggingBubble(true);
        }
        this.isOperating = true;
        this.isCreatingNewBubble = false;
        if (clientX !== undefined && clientY !== undefined) {
            this.dragStartData = {
                time: clientX,
                price: clientY
            };
        }
        event.stopPropagation();
    }

    public clearState(): void {
        this.state = {
            isBubbleBoxMarkMode: false,
            bubbleBoxMarkPoints: null,
            currentBubbleBoxMark: null,
            isDragging: false,
            dragTarget: null,
            dragType: null
        };
        this.isCreatingNewBubble = false;
        this.creationStep = 0;
    }

    public getMarkAtPoint(point: Point): BubbleBoxMark | null {
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

            for (const mark of this.bubbleBoxMarks) {
                if (mark.isPointNearControlPoint(relativeX, relativeY) ||
                    mark.isPointNearBubble(relativeX, relativeY) ||
                    mark.isPointNearConnectionLine(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getMarkAtPointWithType(point: Point): { mark: BubbleBoxMark; type: 'controlPoint' | 'bubble' | 'connection' } | null {
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

            for (const mark of this.bubbleBoxMarks) {
                if (mark.isPointNearControlPoint(relativeX, relativeY)) {
                    return { mark, type: 'controlPoint' };
                }
                if (mark.isPointNearBubble(relativeX, relativeY)) {
                    return { mark, type: 'bubble' };
                }
                if (mark.isPointNearConnectionLine(relativeX, relativeY)) {
                    return { mark, type: 'connection' };
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): BubbleBoxMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragType;
    }

    public getCurrentOperatingMark(): BubbleBoxMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewBubbleBoxMark) {
            return this.previewBubbleBoxMark;
        }
        if (this.state.isBubbleBoxMarkMode && this.state.currentBubbleBoxMark) {
            return this.state.currentBubbleBoxMark;
        }
        return null;
    }

    public getAllMarks(): BubbleBoxMark[] {
        return [...this.bubbleBoxMarks];
    }

    public cancelOperationMode() {
        return this.cancelBubbleBoxMarkMode();
    }

    public setBubbleBoxMarkMode = (): BubbleBoxMarkState => {
        this.state = {
            ...this.state,
            isBubbleBoxMarkMode: true,
            bubbleBoxMarkPoints: null,
            currentBubbleBoxMark: null,
            isDragging: false,
            dragTarget: null,
            dragType: null
        };
        this.isCreatingNewBubble = true;
        this.creationStep = 0;
        return this.state;
    };

    public cancelBubbleBoxMarkMode = (): BubbleBoxMarkState => {
        if (this.previewBubbleBoxMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewBubbleBoxMark);
            this.previewBubbleBoxMark = null;
        }
        this.state = {
            ...this.state,
            isBubbleBoxMarkMode: false,
            bubbleBoxMarkPoints: null,
            currentBubbleBoxMark: null,
            isDragging: false,
            dragTarget: null,
            dragType: null
        };
        this.isOperating = false;
        this.isCreatingNewBubble = false;
        this.creationStep = 0;
        return this.state;
    };

    public handleMouseDown = (point: Point): BubbleBoxMarkState => {
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
            const clickedMarkInfo = this.getMarkAtPointWithType(point);
            if (clickedMarkInfo) {
                const { mark, type } = clickedMarkInfo;
                this.state = {
                    ...this.state,
                    isBubbleBoxMarkMode: true,
                    isDragging: true,
                    dragTarget: mark,
                    dragType: type
                };
                if (type === 'controlPoint') {
                    mark.setDraggingControlPoint(true);
                } else if (type === 'bubble' || type === 'connection') {
                    mark.setDraggingBubble(true);
                }
                this.isOperating = true;
                this.isCreatingNewBubble = false;
                return this.state;
            }
            if (this.state.isBubbleBoxMarkMode && !this.state.isDragging && this.isCreatingNewBubble) {
                if (this.creationStep === 0) {
                    this.previewBubbleBoxMark = new BubbleBoxMark(
                        time.toString(),
                        price,
                        time.toString(),
                        price,
                        'Text',
                        '#2962FF',
                        'rgba(41, 98, 255)',
                        '#FFFFFF',
                        12,
                        1,
                    );
                    chartSeries.series.attachPrimitive(this.previewBubbleBoxMark);
                    this.creationStep = 1;
                } else if (this.creationStep === 1 && this.previewBubbleBoxMark) {
                    const finalBubbleBoxMark = new BubbleBoxMark(
                        this.previewBubbleBoxMark.getControlPointTime(),
                        this.previewBubbleBoxMark.getControlPointPrice(),
                        time.toString(),
                        price,
                        'Text',
                        '#2962FF',
                        'rgba(41, 98, 255)',
                        '#FFFFFF',
                        12,
                        1,
                    );
                    chartSeries.series.attachPrimitive(finalBubbleBoxMark);
                    this.bubbleBoxMarks.push(finalBubbleBoxMark);
                    this.props.chartSeries?.series.detachPrimitive(this.previewBubbleBoxMark);
                    this.previewBubbleBoxMark = null;
                    this.state = {
                        ...this.state,
                        isBubbleBoxMarkMode: false,
                        bubbleBoxMarkPoints: null,
                        currentBubbleBoxMark: null
                    };
                    this.isCreatingNewBubble = false;
                    this.creationStep = 0;
                    if (this.props.onCloseDrawing) {
                        this.props.onCloseDrawing();
                    }
                }
            } else if (this.state.isBubbleBoxMarkMode && !this.isCreatingNewBubble) {
                return this.cancelBubbleBoxMarkMode();
            }
        } catch (error) {
            console.error('handleMouseDown error:', error);
            this.state = this.cancelBubbleBoxMarkMode();
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
                console.log('正在拖动:', this.state.dragType, 'delta计算中...');
                const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
                const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                const currentX = timeScale.timeToCoordinate(time);
                const currentY = chartSeries.series.priceToCoordinate(price);
                if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;
                const deltaX = currentX - currentStartX;
                const deltaY = currentY - currentStartY;

                if (this.state.dragType === 'controlPoint') {
                    this.state.dragTarget.dragControlPointByPixels(deltaX, deltaY);
                } else if (this.state.dragType === 'bubble') {
                    this.state.dragTarget.dragBubbleByPixels(deltaX, deltaY);
                } else if (this.state.dragType === 'connection') {
                    this.state.dragTarget.dragControlPointByPixels(deltaX, deltaY);
                    this.state.dragTarget.dragBubbleByPixels(deltaX, deltaY);
                }
                this.dragStartData = { time, price };
                return;
            }

            if (this.state.isBubbleBoxMarkMode && this.isCreatingNewBubble && this.previewBubbleBoxMark) {
                if (this.creationStep === 1) {
                    this.previewBubbleBoxMark.updateBubblePosition(time.toString(), price);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): BubbleBoxMarkState => {
        if (this.state.isDragging) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDraggingControlPoint(false);
                this.state.dragTarget.setDraggingBubble(false);
            }
            this.state = {
                ...this.state,
                isDragging: false,
                dragTarget: null,
                dragType: null
            };
            this.isOperating = false;
            this.dragStartData = null;
        }

        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): BubbleBoxMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isDragging) {
                if (this.state.dragTarget) {
                    this.state.dragTarget.setDraggingControlPoint(false);
                    this.state.dragTarget.setDraggingBubble(false);
                }
                this.state = {
                    ...this.state,
                    isDragging: false,
                    dragTarget: null,
                    dragType: null
                };
                this.isCreatingNewBubble = false;
                this.creationStep = 0;
            } else if (this.state.isBubbleBoxMarkMode) {
                if (this.previewBubbleBoxMark) {
                    this.props.chartSeries?.series.detachPrimitive(this.previewBubbleBoxMark);
                    this.previewBubbleBoxMark = null;
                }
                return this.cancelBubbleBoxMarkMode();
            }
        }
        return this.state;
    };

    public getState(): BubbleBoxMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<BubbleBoxMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this._removeEventListeners();
        if (this.previewBubbleBoxMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewBubbleBoxMark);
            this.previewBubbleBoxMark = null;
        }
        this.bubbleBoxMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.bubbleBoxMarks = [];
    }

    public getBubbleBoxMarks(): BubbleBoxMark[] {
        return [...this.bubbleBoxMarks];
    }

    public removeBubbleBoxMark(mark: BubbleBoxMark): void {
        const index = this.bubbleBoxMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.bubbleBoxMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isBubbleBoxMarkMode;
    }

    public updateBubbleText(mark: BubbleBoxMark, text: string): void {
        mark.updateText(text);
    }
}