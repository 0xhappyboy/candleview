import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { TextEditMark } from "../../Mark/Text/TextEditMark";
import { Point } from "../../types";

export interface TextEditMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface TextEditMarkState {
    isTextEditMarkMode: boolean;
    textEditMarkPoints: Point[] | null;
    currentTextEditMark: TextEditMark | null;
    isDragging: boolean;
    dragTarget: TextEditMark | null;
    dragType: 'bubble' | null;
}

export class TextEditMarkManager implements IMarkManager<TextEditMark> {
    private props: TextEditMarkManagerProps;
    private state: TextEditMarkState;
    private previewTextEditMark: TextEditMark | null = null;
    private textEditMarks: TextEditMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private isCreatingNewText: boolean = false;
    private creationStep: number = 0;

    constructor(props: TextEditMarkManagerProps) {
        this.props = props;
        this.state = {
            isTextEditMarkMode: false,
            textEditMarkPoints: null,
            currentTextEditMark: null,
            isDragging: false,
            dragTarget: null,
            dragType: null
        };
        this._handleTextEditMarkDragStart = this._handleTextEditMarkDragStart.bind(this);
        this._addEventListeners();
    }

    private _addEventListeners() {
        if (this.props.chart) {
            const chartElement = this.props.chart.chartElement();
            if (chartElement) {
                chartElement.addEventListener('textEditMarkDragStart', this._handleTextEditMarkDragStart);
            }
        }
    }

    private _removeEventListeners() {
        if (this.props.chart) {
            const chartElement = this.props.chart.chartElement();
            if (chartElement) {
                chartElement.removeEventListener('textEditMarkDragStart', this._handleTextEditMarkDragStart);
            }
        }
    }

    private _handleTextEditMarkDragStart(event: CustomEvent) {
        const { mark, dragType, clientX, clientY } = event.detail;
        this.state = {
            ...this.state,
            isTextEditMarkMode: true,
            isDragging: true,
            dragTarget: mark,
            dragType: dragType
        };
        if (dragType === 'bubble') {
            mark.setDraggingBubble(true);
        }
        this.isOperating = true;
        this.isCreatingNewText = false;
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
            isTextEditMarkMode: false,
            textEditMarkPoints: null,
            currentTextEditMark: null,
            isDragging: false,
            dragTarget: null,
            dragType: null
        };
        this.isCreatingNewText = false;
        this.creationStep = 0;
    }

    public getMarkAtPoint(point: Point): TextEditMark | null {
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

            for (const mark of this.textEditMarks) {
                if (mark.isPointNearBubble(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
        }
        return null;
    }

    public getMarkAtPointWithType(point: Point): { mark: TextEditMark; type: 'bubble' } | null {
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

            for (const mark of this.textEditMarks) {
                if (mark.isPointNearBubble(relativeX, relativeY)) {
                    return { mark, type: 'bubble' };
                }
            }
        } catch (error) {
        }
        return null;
    }

    public getCurrentDragTarget(): TextEditMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragType;
    }

    public getCurrentOperatingMark(): TextEditMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewTextEditMark) {
            return this.previewTextEditMark;
        }
        if (this.state.isTextEditMarkMode && this.state.currentTextEditMark) {
            return this.state.currentTextEditMark;
        }
        return null;
    }

    public getAllMarks(): TextEditMark[] {
        return [...this.textEditMarks];
    }

    public cancelOperationMode() {
        return this.cancelTextEditMarkMode();
    }

    public setTextEditMarkMode = (): TextEditMarkState => {
        this.state = {
            ...this.state,
            isTextEditMarkMode: true,
            textEditMarkPoints: null,
            currentTextEditMark: null,
            isDragging: false,
            dragTarget: null,
            dragType: null
        };
        this.isCreatingNewText = true;
        this.creationStep = 0;
        return this.state;
    };

    public cancelTextEditMarkMode = (): TextEditMarkState => {
        if (this.previewTextEditMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewTextEditMark);
            this.previewTextEditMark = null;
        }
        this.state = {
            ...this.state,
            isTextEditMarkMode: false,
            textEditMarkPoints: null,
            currentTextEditMark: null,
            isDragging: false,
            dragTarget: null,
            dragType: null
        };
        this.isOperating = false;
        this.isCreatingNewText = false;
        this.creationStep = 0;
        return this.state;
    };

    public handleMouseDown = (point: Point): TextEditMarkState => {
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
                    isTextEditMarkMode: true,
                    isDragging: true,
                    dragTarget: mark,
                    dragType: type
                };
                if (type === 'bubble') {
                    mark.setDraggingBubble(true);
                }
                this.isOperating = true;
                this.isCreatingNewText = false;
                return this.state;
            }
            if (this.state.isTextEditMarkMode && !this.state.isDragging && this.isCreatingNewText) {
                const textEditMark = new TextEditMark(
                    time,
                    price,
                    '',
                    '#000000',
                    'rgba(41, 98, 255)',
                    '#FFFFFF',
                    12,
                    1,
                );
                chartSeries.series.attachPrimitive(textEditMark);
                this.textEditMarks.push(textEditMark);
                setTimeout(() => {
                    textEditMark.startEditingImmediately();
                }, 0);
                this.state = {
                    ...this.state,
                    isTextEditMarkMode: false,
                    textEditMarkPoints: null,
                    currentTextEditMark: null
                };
                this.isCreatingNewText = false;
                this.creationStep = 0;
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            } else if (this.state.isTextEditMarkMode && !this.isCreatingNewText) {
                return this.cancelTextEditMarkMode();
            }
        } catch (error) {
            this.state = this.cancelTextEditMarkMode();
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
                const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
                const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                const currentX = timeScale.timeToCoordinate(time);
                const currentY = chartSeries.series.priceToCoordinate(price);
                if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;
                const deltaX = currentX - currentStartX;
                const deltaY = currentY - currentStartY;

                if (this.state.dragType === 'bubble') {
                    this.state.dragTarget.dragBubbleByPixels(deltaX, deltaY);
                }
                this.dragStartData = { time, price };
                return;
            }
        } catch (error) {
        }
    };

    public handleMouseUp = (point: Point): TextEditMarkState => {
        if (this.state.isDragging) {
            if (this.state.dragTarget) {
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

    public handleKeyDown = (event: KeyboardEvent): TextEditMarkState => {
        if (event.key === 'Escape') {
            if (this.state.isDragging) {
                if (this.state.dragTarget) {
                    this.state.dragTarget.setDraggingBubble(false);
                }
                this.state = {
                    ...this.state,
                    isDragging: false,
                    dragTarget: null,
                    dragType: null
                };
                this.isCreatingNewText = false;
                this.creationStep = 0;
            } else if (this.state.isTextEditMarkMode) {
                if (this.previewTextEditMark) {
                    this.props.chartSeries?.series.detachPrimitive(this.previewTextEditMark);
                    this.previewTextEditMark = null;
                }
                return this.cancelTextEditMarkMode();
            }
        }
        return this.state;
    };

    public getState(): TextEditMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<TextEditMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this._removeEventListeners();
        if (this.previewTextEditMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewTextEditMark);
            this.previewTextEditMark = null;
        }
        this.textEditMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.textEditMarks = [];
        this.hiddenTextEditMarks = [];
    }

    public getTextEditMarks(): TextEditMark[] {
        return [...this.textEditMarks];
    }

    public removeTextEditMark(mark: TextEditMark): void {
        const index = this.textEditMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.textEditMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isTextEditMarkMode;
    }

    public updateTextEditText(mark: TextEditMark, text: string): void {
        mark.updateText(text);
    }

    private hiddenTextEditMarks: TextEditMark[] = [];

    public hideAllMarks(): void {
        this.hiddenTextEditMarks.push(...this.textEditMarks);
        this.textEditMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.textEditMarks = [];
    }

    public showAllMarks(): void {
        this.textEditMarks.push(...this.hiddenTextEditMarks);
        this.hiddenTextEditMarks.forEach(mark => {
            this.props.chartSeries?.series.attachPrimitive(mark);
        });
        this.hiddenTextEditMarks = [];
    }

    public hideMark(mark: TextEditMark): void {
        const index = this.textEditMarks.indexOf(mark);
        if (index > -1) {
            this.textEditMarks.splice(index, 1);
            this.hiddenTextEditMarks.push(mark);
            this.props.chartSeries?.series.detachPrimitive(mark);
        }
    }

    public showMark(mark: TextEditMark): void {
        const index = this.hiddenTextEditMarks.indexOf(mark);
        if (index > -1) {
            this.hiddenTextEditMarks.splice(index, 1);
            this.textEditMarks.push(mark);
            this.props.chartSeries?.series.attachPrimitive(mark);
        }
    }
}