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
    isDragging: boolean;
    dragTarget: TextEditMark | null;
}

export class TextEditMarkManager implements IMarkManager<TextEditMark> {
    private props: TextEditMarkManagerProps;
    private state: TextEditMarkState;
    private textEditMarks: TextEditMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private isCreatingNewText: boolean = false;

    constructor(props: TextEditMarkManagerProps) {
        this.props = props;
        this.state = {
            isTextEditMarkMode: false,
            isDragging: false,
            dragTarget: null
        };
        this._handleTextEditMarkDragStart = this._handleTextEditMarkDragStart.bind(this);
        this._addEventListeners();
    }
    getCurrentDragPoint(): string | null {
        throw new Error("Method not implemented.");
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
        const { mark, clientX, clientY } = event.detail;
        this.state = {
            ...this.state,
            isTextEditMarkMode: true,
            isDragging: true,
            dragTarget: mark
        };
        mark.setDragging(true);
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
            isDragging: false,
            dragTarget: null
        };
        this.isCreatingNewText = false;
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
                if (mark.isPointInTextBox(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): TextEditMark | null {
        return this.state.dragTarget;
    }

    public getCurrentOperatingMark(): TextEditMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
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
            isTextEditMarkMode: true
        };
        this.isCreatingNewText = true;
        return this.state;
    };

    public cancelTextEditMarkMode = (): TextEditMarkState => {
        this.state = {
            ...this.state,
            isTextEditMarkMode: false,
            isDragging: false,
            dragTarget: null
        };
        this.isOperating = false;
        this.isCreatingNewText = false;
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
            const clickedMark = this.getMarkAtPoint(point);

            if (clickedMark) {
                this.state = {
                    ...this.state,
                    isTextEditMarkMode: true,
                    isDragging: true,
                    dragTarget: clickedMark
                };
                clickedMark.setDragging(true);
                this.isOperating = true;
                this.isCreatingNewText = false;
                return this.state;
            }
            if (this.state.isTextEditMarkMode && this.isCreatingNewText && !this.state.isDragging) {
                const newTextEditMark = new TextEditMark(
                    time.toString(),
                    price,
                    '',
                    '#2962FF',
                    'rgba(255, 255, 255)',
                    '#333333',
                    14,
                    2,
                    200,
                    100
                );
                chartSeries.series.attachPrimitive(newTextEditMark);
                this.textEditMarks.push(newTextEditMark);
                this.state = {
                    ...this.state,
                    isTextEditMarkMode: false
                };
                this.isCreatingNewText = false;
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            }
        } catch (error) {
            console.error('handleMouseDown error:', error);
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
                this.state.dragTarget.dragByPixels(deltaX, deltaY);
                this.dragStartData = { time, price };
            }
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): TextEditMarkState => {
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
            this.dragStartData = null;
        }

        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): TextEditMarkState => {
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
                this.isCreatingNewText = false;
            } else if (this.state.isTextEditMarkMode) {
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
        this.textEditMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.textEditMarks = [];
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

    public updateTextContent(mark: TextEditMark, text: string): void {
        mark.updateText(text);
    }
}