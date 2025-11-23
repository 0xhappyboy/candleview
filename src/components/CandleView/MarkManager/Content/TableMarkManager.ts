import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { TableMark } from "../../Mark/Content/TableMark";
import { IMarkManager } from "../../Mark/IMarkManager";
import { Point } from "../../types";

export interface TableMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
    onCellEditStart?: (mark: TableMark, row: number, col: number) => void;
    onCellEditEnd?: (mark: TableMark, row: number, col: number, content: string) => void;
}

export interface TableMarkState {
    isTableMarkMode: boolean;
    tableMarkStartPoint: Point | null;
    currentTableMark: TableMark | null;
    isDragging: boolean;
    dragTarget: TableMark | null;
    dragPoint: 'table' | 'corner' | null;
    editingCell: { mark: TableMark; row: number; col: number } | null;
}

export class TableMarkManager implements IMarkManager<TableMark> {
    private props: TableMarkManagerProps;
    private state: TableMarkState;
    private previewTableMark: TableMark | null = null;
    private tableMarks: TableMark[] = [];
    private mouseDownPoint: Point | null = null;
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;
    private lastClickTime: number = 0;

    constructor(props: TableMarkManagerProps) {
        this.props = props;
        this.state = {
            isTableMarkMode: false,
            tableMarkStartPoint: null,
            currentTableMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            editingCell: null
        };
    }

    public clearState(): void {
        this.state = {
            isTableMarkMode: false,
            tableMarkStartPoint: null,
            currentTableMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            editingCell: null
        };
        this.isOperating = false;
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
        }
        return null;
    }

    public getCellAtPoint(point: Point): { mark: TableMark; row: number; col: number } | null {
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
                const cellInfo = mark.isPointInCell(relativeX, relativeY);
                if (cellInfo) {
                    return { mark, row: cellInfo.row, col: cellInfo.col };
                }
            }
        } catch (error) {
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
            dragPoint: null,
            editingCell: null
        };
        this.isOperating = true;
        return this.state;
    };

    public cancelTableMarkMode = (): TableMarkState => {
        if (this.previewTableMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewTableMark);
            this.previewTableMark = null;
        }
        this.tableMarks.forEach(mark => {
            mark.setShowHandles(false);
            mark.setTableSelected(false);
        });
        this.state = {
            ...this.state,
            isTableMarkMode: false,
            tableMarkStartPoint: null,
            currentTableMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            editingCell: null
        };
        this.isOperating = false;
        return this.state;
    };

    private lastClickInfo: {
        time: number;
        target: { mark: TableMark; row: number; col: number } | null
    } = { time: 0, target: null };

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
            const cellInfo = this.getCellAtPoint(point);
            const currentTime = Date.now();
            const isDoubleClick = cellInfo &&
                this.lastClickInfo.target &&
                this.lastClickInfo.target.mark === cellInfo.mark &&
                this.lastClickInfo.target.row === cellInfo.row &&
                this.lastClickInfo.target.col === cellInfo.col &&
                (currentTime - this.lastClickInfo.time) < 500;
            this.lastClickInfo = {
                time: currentTime,
                target: cellInfo
            };
            if (this.state.editingCell) {
                if (!cellInfo || cellInfo.mark !== this.state.editingCell.mark ||
                    cellInfo.row !== this.state.editingCell.row || cellInfo.col !== this.state.editingCell.col) {
                    this.finishCellEditing(this.state.editingCell.mark.getSelectedCellContent());
                }
                this.isOperating = false;
                return this.state;
            }
            if (isDoubleClick && cellInfo) {
                this.startCellEditing(cellInfo.mark, cellInfo.row, cellInfo.col);
                this.isOperating = true;
                return this.state;
            }
            let clickedExistingTable = false;
            for (const mark of this.tableMarks) {
                const tablePoint = mark.isPointNearTable(relativeX, relativeY);
                if (tablePoint) {
                    clickedExistingTable = true;
                    this.state = {
                        ...this.state,
                        isTableMarkMode: false,
                        isDragging: true,
                        dragTarget: mark,
                        dragPoint: tablePoint
                    };
                    this.tableMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                        m.setTableSelected(m === mark);
                    });
                    mark.setDragging(true, tablePoint);
                    this.isOperating = true;
                    break;
                }
            }
            if (clickedExistingTable) {
                return this.state;
            }
            if (cellInfo) {
                this.selectCell(cellInfo.mark, cellInfo.row, cellInfo.col);
                this.isOperating = false;
                return this.state;
            }
            this.clearAllSelections();
            this.isOperating = false;
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
                    this.tableMarks.forEach(m => {
                        m.setShowHandles(false);
                        m.setTableSelected(false);
                    });
                    this.isOperating = true;
                } else {
                    if (this.previewTableMark) {
                        const tableInfo = this.previewTableMark.getTableInfo();
                        const finalTableMark = new TableMark(
                            tableInfo.startTime,
                            tableInfo.startPrice,
                            time.toString(),
                            price,
                            3,
                            3,
                            false
                        );
                        chartSeries.series.detachPrimitive(this.previewTableMark);
                        chartSeries.series.attachPrimitive(finalTableMark);
                        this.tableMarks.push(finalTableMark);
                        this.previewTableMark = null;
                        finalTableMark.setShowHandles(true);
                        finalTableMark.setTableSelected(true);
                        this.state = {
                            isTableMarkMode: false,
                            tableMarkStartPoint: null,
                            currentTableMark: null,
                            isDragging: false,
                            dragTarget: null,
                            dragPoint: null,
                            editingCell: null
                        };
                        this.isOperating = false;
                        if (this.props.onCloseDrawing) {
                            this.props.onCloseDrawing();
                        }
                    }
                }
            }
        } catch (error) {
            this.state = this.cancelTableMarkMode();
        }
        return this.state;
    };

    private startCellEditing(mark: TableMark, row: number, col: number) {
        this.clearAllSelections();
        this.state = {
            ...this.state,
            editingCell: { mark, row, col }
        };
        mark.selectCell(row, col);
        mark.setShowHandles(true);
        mark.startEditingCell(row, col);
        if (this.props.onCellEditStart) {
            this.props.onCellEditStart(mark, row, col);
        }
        this.isOperating = true;
    }

    private selectCell(mark: TableMark, row: number, col: number) {
        this.tableMarks.forEach(m => {
            if (m !== mark) {
                m.setTableSelected(false);
                m.setShowHandles(false);
            }
        });
        const success = mark.selectCell(row, col);
        if (success) {
            mark.setShowHandles(true);
        } else {
        }
    }

    private clearAllSelections() {
        this.tableMarks.forEach(mark => {
            mark.setTableSelected(false);
            mark.setShowHandles(false);
        });
    }

    public handleMouseMove = (point: Point): void => {
        if (this.state.editingCell) {
            return;
        }
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
                    const bounds = this.state.dragTarget.getBounds();
                    if (!bounds) return;
                    const corners = [
                        { x: bounds.startX, y: bounds.startY, type: 'top-left' as const },
                        { x: bounds.endX, y: bounds.startY, type: 'top-right' as const },
                        { x: bounds.startX, y: bounds.endY, type: 'bottom-left' as const },
                        { x: bounds.endX, y: bounds.endY, type: 'bottom-right' as const }
                    ];
                    let closestCorner = corners[0];
                    let minDistance = Math.sqrt(Math.pow(relativeX - corners[0].x, 2) + Math.pow(relativeY - corners[0].y, 2));
                    for (let i = 1; i < corners.length; i++) {
                        const distance = Math.sqrt(Math.pow(relativeX - corners[i].x, 2) + Math.pow(relativeY - corners[i].y, 2));
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestCorner = corners[i];
                        }
                    }
                    this.state.dragTarget.resizeTableByCorner(closestCorner.type, time.toString(), price);
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
            if (this.state.editingCell) {
                this.cancelCellEditing();
                return this.state;
            } else if (this.state.isDragging) {
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
            } else if (this.state.isTableMarkMode) {
                return this.cancelTableMarkMode();
            } else {
                this.clearAllSelections();
                this.isOperating = false;
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
            (mark as any).destroy?.();
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

        if (this.props.onCellEditEnd) {
            this.props.onCellEditEnd(mark, row, col, content);
        }
    }

    public getTableMarks(): TableMark[] {
        return [...this.tableMarks];
    }

    public removeTableMark(mark: TableMark): void {
        const index = this.tableMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            (mark as any).destroy?.();
            this.tableMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.state.isDragging ||
            this.state.isTableMarkMode ||
            (this.state.tableMarkStartPoint !== null);
    }

    public finishCellEditing(content: string): void {
        if (this.state.editingCell) {
            const { mark, row, col } = this.state.editingCell;
            this.updateTableCell(mark, row, col, content);
            this.state = {
                ...this.state,
                editingCell: null
            };
            this.isOperating = false;
            if (this.props.onCellEditEnd) {
                this.props.onCellEditEnd(mark, row, col, content);
            }
        }
    }

    public cancelCellEditing(): void {
        if (this.state.editingCell) {
            this.state.editingCell.mark.cancelEditingCell();
            this.state = {
                ...this.state,
                editingCell: null
            };
            this.isOperating = false;
        }
    }

    public setOperatingState(operating: boolean): void {
        this.isOperating = operating;
    }
}