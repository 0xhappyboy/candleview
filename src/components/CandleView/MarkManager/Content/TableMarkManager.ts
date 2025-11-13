import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { TableMark } from "../../Mark/Content/TableMark";
import { IMarkManager } from "../../Mark/IMarkManager";
import { Point } from "../../types";

export interface TableMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface TableMarkState {
    isTableMarkMode: boolean;
    tableMarkStartPoint: Point | null;
    currentTableMark: TableMark | null;
    isDragging: boolean;
    dragTarget: TableMark | null;
    dragPoint: 'table' | 'corner' | null;
}

export class TableMarkManager implements IMarkManager<TableMark> {
    private props: TableMarkManagerProps;
    private state: TableMarkState;
    private previewTableMark: TableMark | null = null;
    private tableMarks: TableMark[] = [];
    private mouseDownPoint: Point | null = null;
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;

    constructor(props: TableMarkManagerProps) {
        this.props = props;
        this.state = {
            isTableMarkMode: false,
            tableMarkStartPoint: null,
            currentTableMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
    }

   public clearState(): void {
        this.state = {
            isTableMarkMode: false,
            tableMarkStartPoint: null,
            currentTableMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
    }

    public getMarkAtPoint(point: Point): TableMark | null {
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

            for (const mark of this.tableMarks) {
                const tablePoint = mark.isPointNearTable(relativeX, relativeY);
                if (tablePoint) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }

        return null;
    }

    public getCurrentDragTarget(): TableMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): TableMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewTableMark) {
            return this.previewTableMark;
        }
        if (this.state.isTableMarkMode && this.state.currentTableMark) {
            return this.state.currentTableMark;
        }
        return null;
    }

    public getAllMarks(): TableMark[] {
        return [...this.tableMarks];
    }

    public cancelOperationMode() {
        return this.cancelTableMarkMode();
    }

    public setTableMarkMode = (): TableMarkState => {
        this.state = {
            ...this.state,
            isTableMarkMode: true,
            tableMarkStartPoint: null,
            currentTableMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
        return this.state;
    };

    public cancelTableMarkMode = (): TableMarkState => {
        if (this.previewTableMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewTableMark);
            this.previewTableMark = null;
        }

        this.tableMarks.forEach(mark => {
            mark.setShowHandles(false);
        });

        this.state = {
            ...this.state,
            isTableMarkMode: false,
            tableMarkStartPoint: null,
            currentTableMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };

        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): TableMarkState => {
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

            this.mouseDownPoint = point;
            this.dragStartData = { time, price };


            for (const mark of this.tableMarks) {
                const tablePoint = mark.isPointNearTable(relativeX, relativeY);
                if (tablePoint) {
                    if (!this.state.isTableMarkMode) {
                        this.state = {
                            ...this.state,
                            isTableMarkMode: true,
                            isDragging: true,
                            dragTarget: mark,
                            dragPoint: tablePoint
                        };

                        this.tableMarks.forEach(m => {
                            m.setShowHandles(m === mark);
                        });

                        mark.setDragging(true, tablePoint);
                        this.isOperating = true;
                    }
                    return this.state;
                }
            }


            if (this.state.isTableMarkMode && !this.state.isDragging) {
                if (!this.state.tableMarkStartPoint) {
                    this.state = {
                        ...this.state,
                        tableMarkStartPoint: point
                    };

                    this.previewTableMark = new TableMark(
                        time.toString(),
                        price,
                        time.toString(),
                        price,
                        3,
                        3,
                        true
                    );

                    chartSeries.series.attachPrimitive(this.previewTableMark);
                    this.tableMarks.forEach(m => m.setShowHandles(false));
                } else {
                    if (this.previewTableMark) {
                        chartSeries.series.detachPrimitive(this.previewTableMark);

                        const finalTableMark = new TableMark(
                            this.previewTableMark.getTableInfo().startTime,
                            this.previewTableMark.getTableInfo().startPrice,
                            time.toString(),
                            price,
                            3,
                            3,
                            false
                        );

                        chartSeries.series.attachPrimitive(finalTableMark);
                        this.tableMarks.push(finalTableMark);
                        this.previewTableMark = null;
                        finalTableMark.setShowHandles(true);
                    }

                    this.state = {
                        ...this.state,
                        isTableMarkMode: false,
                        tableMarkStartPoint: null,
                        currentTableMark: null
                    };

                    if (this.props.onCloseDrawing) {
                        this.props.onCloseDrawing();
                    }
                }
            }
        } catch (error) {
            console.error(error);
            this.state = this.cancelTableMarkMode();
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
                if (this.state.dragPoint === 'table') {

                    if (this.dragStartData.time === null || time === null) return;

                    const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
                    const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                    const currentX = timeScale.timeToCoordinate(time);
                    const currentY = chartSeries.series.priceToCoordinate(price);

                    if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;

                    const deltaX = currentX - currentStartX;
                    const deltaY = currentY - currentStartY;

                    this.state.dragTarget.dragTableByPixels(deltaX, deltaY);
                    this.dragStartData = { time, price };
                } else if (this.state.dragPoint === 'corner') {

                    this.state.dragTarget.resizeTableByCorner(time.toString(), price);
                }
                return;
            }


            if (!this.state.isDragging) {
                if (this.state.tableMarkStartPoint && this.previewTableMark) {
                    this.previewTableMark.updatePosition(
                        this.previewTableMark.getTableInfo().startTime,
                        this.previewTableMark.getTableInfo().startPrice,
                        time.toString(),
                        price
                    );
                }


                if (!this.state.isTableMarkMode && !this.state.isDragging && !this.state.tableMarkStartPoint) {
                    let anyTableHovered = false;

                    for (const mark of this.tableMarks) {
                        const tablePoint = mark.isPointNearTable(relativeX, relativeY);
                        const shouldShow = !!tablePoint;
                        mark.setShowHandles(shouldShow);
                        if (shouldShow) anyTableHovered = true;
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): TableMarkState => {
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

        this.mouseDownPoint = null;
        this.dragStartData = null;
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): TableMarkState => {
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
            } else if (this.state.isTableMarkMode) {
                return this.cancelTableMarkMode();
            }
        }
        return this.state;
    };

    public getState(): TableMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<TableMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewTableMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewTableMark);
            this.previewTableMark = null;
        }

        this.tableMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.tableMarks = [];
    }

    public addRowToTable(mark: TableMark, position: 'top' | 'bottom' = 'bottom'): void {
        mark.addRow(position);
    }

    public addColumnToTable(mark: TableMark, position: 'left' | 'right' = 'right'): void {
        mark.addColumn(position);
    }

    public removeRowFromTable(mark: TableMark, rowIndex: number): void {
        mark.removeRow(rowIndex);
    }

    public removeColumnFromTable(mark: TableMark, colIndex: number): void {
        mark.removeColumn(colIndex);
    }

    public updateTableCell(mark: TableMark, row: number, col: number, content: string): void {
        mark.updateCellContent(row, col, content);
    }

    public getTableMarks(): TableMark[] {
        return [...this.tableMarks];
    }

    public removeTableMark(mark: TableMark): void {
        const index = this.tableMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.tableMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isTableMarkMode;
    }
}