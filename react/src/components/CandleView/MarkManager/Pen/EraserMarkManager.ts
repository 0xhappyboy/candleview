import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IDeletableMark } from "../../Mark/IDeletableMark";
import { IMarkManager } from "../../Mark/IMarkManager";
import { Point } from "../../types";

export interface EraserMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface EraserMarkState {
    isEraserMode: boolean;
    isErasing: boolean;
    hoveredMark: IDeletableMark | null;
}

export class EraserMarkManager implements IMarkManager<IDeletableMark> {
    private props: EraserMarkManagerProps;
    private state: EraserMarkState;
    private penMarks: IDeletableMark[] = [];
    private isOperating: boolean = false;

    constructor(props: EraserMarkManagerProps) {
        this.props = props;
        this.state = {
            isEraserMode: false,
            isErasing: false,
            hoveredMark: null
        };
    }

    public clearState(): void {
        this.state = {
            isEraserMode: false,
            isErasing: false,
            hoveredMark: null
        };
    }

    private updateCursor(): void {
        const { containerRef } = this.props;
        if (!containerRef.current) return;
        if (this.state.isEraserMode) {
            containerRef.current.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><polygon points=\"4,6 20,6 16,18 0,18\" fill=\"white\" stroke=\"%23000\" stroke-width=\"1\"/><polygon points=\"4,6 20,6 18,12 2,12\" fill=\"black\"/></svg>') 12 12, not-allowed";
        } else {
            containerRef.current.style.cursor = "default";
        }
    }

    public setEraserMode = (): EraserMarkState => {
        this.state = {
            ...this.state,
            isEraserMode: true,
            isErasing: false,
            hoveredMark: null
        };
        this.updateCursor();
        return this.state;
    };

    public cancelEraserMode = (): EraserMarkState => {
        this.state = {
            ...this.state,
            isEraserMode: false,
            isErasing: false,
            hoveredMark: null
        };
        this.updateCursor();
        this.isOperating = false;
        return this.state;
    };

    public getMarkAtPoint(point: Point): IDeletableMark | null {
        const { chartSeries, chart, containerRef } = this.props;
        if (!chartSeries || !chart) return null;

        try {
            const directX = point.x;
            const directY = point.y;
            const chartElement = chart.chartElement();
            if (chartElement) {
                const chartRect = chartElement.getBoundingClientRect();
                const containerRect = containerRef.current?.getBoundingClientRect();
                if (containerRect) {
                    const scaleX = chartRect.width / containerRect.width;
                    const scaleY = chartRect.height / containerRect.height;
                    const canvasX = point.x * scaleX;
                    const canvasY = point.y * scaleY;
                    for (let i = this.penMarks.length - 1; i >= 0; i--) {
                        const mark = this.penMarks[i];
                        if (!this.isMarkValid(mark)) continue;
                        const isNear = mark.isPointNearPath(canvasX, canvasY, 20);
                        if (isNear) return mark;
                    }
                }
            }
            for (let i = this.penMarks.length - 1; i >= 0; i--) {
                const mark = this.penMarks[i];
                if (!this.isMarkValid(mark)) continue;
                const isNear = mark.isPointNearPath(directX, directY, 25);
                if (isNear) return mark;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    private isMarkValid(mark: IDeletableMark): boolean {
        if (!mark) return false;
        const hasChartRef = !!(mark as any)._chart || !!(mark as any)._series;
        if (!hasChartRef) {
            return false;
        }
        const pointCount = (mark as any).getPointCount?.();
        if (pointCount !== undefined && pointCount < 2) {
            return false;
        }
        return true;
    }

    public handleMouseDown = (point: Point): EraserMarkState => {
        if (!this.state.isEraserMode) return this.state;
        const targetMark = this.getMarkAtPoint(point);
        if (targetMark) {
            this.removePenMark(targetMark);
            this.state = {
                ...this.state,
                isErasing: true
            };
            this.isOperating = true;
        }
        return this.state;
    };

    public handleMouseMove = (point: Point): void => {
        if (!this.state.isEraserMode) return;
        const hoveredMark = this.getMarkAtPoint(point);
        if (hoveredMark !== this.state.hoveredMark) {
            this.state = {
                ...this.state,
                hoveredMark
            };
            if (hoveredMark) {
                this.props.containerRef.current!.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><polygon points=\"4,6 20,6 16,18 0,18\" fill=\"white\" stroke=\"%23FF4136\" stroke-width=\"1.5\"/><polygon points=\"4,6 20,6 18,12 2,12\" fill=\"black\"/></svg>') 12 12, pointer";
            } else {
                this.updateCursor();
            }
        }
        if (this.state.isErasing && hoveredMark) {
            this.removePenMark(hoveredMark);
        }
    };

    public handleMouseUp = (point: Point): EraserMarkState => {
        if (this.state.isErasing) {
            this.state = {
                ...this.state,
                isErasing: false
            };
            this.isOperating = false;
        }
        return this.state;
    };

    public handleKeyDown = (event: KeyboardEvent): EraserMarkState => {
        if (event.key === 'Escape' && this.state.isEraserMode) {
            if (this.props.onCloseDrawing) {
                this.props.onCloseDrawing();
            }
            return this.cancelEraserMode();
        }
        return this.state;
    };

    public closeBrush = (): EraserMarkState => {
        if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
        }
        return this.cancelEraserMode();
    };

    public getCurrentDragPoint(): string | null {
        return null;
    }

    public getCurrentDragTarget(): IDeletableMark | null {
        return null;
    }

    public getCurrentOperatingMark(): IDeletableMark | null {
        return this.state.hoveredMark;
    }

    public getAllMarks(): IDeletableMark[] {
        return [...this.penMarks];
    }

    public cancelOperationMode() {
        return this.cancelEraserMode();
    }

    public getState(): EraserMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<EraserMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        this.penMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.penMarks = [];
        if (this.props.containerRef.current) {
            this.props.containerRef.current.style.cursor = "default";
        }
        this.hiddenPenMarks = [];
        this.penMarks = [];
    }

    public getPenMarks(): IDeletableMark[] {
        return [...this.penMarks];
    }

    public removePenMark(mark: IDeletableMark): void {
        const index = this.penMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.penMarks.splice(index, 1);
        }
    }

    public addPenMark(mark: IDeletableMark): void {
        this.penMarks.push(mark);
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isEraserMode || this.state.isErasing;
    }

    public setPenMarks(marks: IDeletableMark[]): void {
        this.penMarks = [...marks];
    }

    private hiddenPenMarks: IDeletableMark[] = [];

    public hideAllMarks(): void {
        this.hiddenPenMarks.push(...this.penMarks);
        this.penMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.penMarks = [];
    }

    public showAllMarks(): void {
        this.penMarks.push(...this.hiddenPenMarks);
        this.hiddenPenMarks.forEach(mark => {
            this.props.chartSeries?.series.attachPrimitive(mark);
        });
        this.hiddenPenMarks = [];
    }

    public hideMark(mark: IDeletableMark): void {
        const index = this.penMarks.indexOf(mark);
        if (index > -1) {
            this.penMarks.splice(index, 1);
            this.hiddenPenMarks.push(mark);
            this.props.chartSeries?.series.detachPrimitive(mark);
        }
    }

    public showMark(mark: IDeletableMark): void {
        const index = this.hiddenPenMarks.indexOf(mark);
        if (index > -1) {
            this.hiddenPenMarks.splice(index, 1);
            this.penMarks.push(mark);
            this.props.chartSeries?.series.attachPrimitive(mark);
        }
    }
}