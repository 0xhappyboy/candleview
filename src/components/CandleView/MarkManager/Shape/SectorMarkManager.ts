import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { SectorMark } from "../../Mark/Shape/SectorMark";
import { Point } from "../../types";

export interface SectorMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface SectorMarkState {
    isSectorMode: boolean;
    sectorPoints: Point[];
    currentSector: SectorMark | null;
    isDragging: boolean;
    dragTarget: SectorMark | null;
    dragPoint: 'center' | 'radius' | 'angle' | 'sector' | null;
}

export class SectorMarkManager implements IMarkManager<SectorMark> {
    private props: SectorMarkManagerProps;
    private state: SectorMarkState;
    private previewSectorMark: SectorMark | null = null;
    private sectorMarks: SectorMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;

    constructor(props: SectorMarkManagerProps) {
        this.props = props;
        this.state = {
            isSectorMode: false,
            sectorPoints: [],
            currentSector: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
    }

    public clearState(): void {
        this.state = {
            isSectorMode: false,
            sectorPoints: [],
            currentSector: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
    }

    public getMarkAtPoint(point: Point): SectorMark | null {
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

            for (const mark of this.sectorMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }

            for (const mark of this.sectorMarks) {
                const nearSector = mark.isPointNearSector(relativeX, relativeY);
                if (nearSector) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): SectorMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): SectorMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewSectorMark) {
            return this.previewSectorMark;
        }
        if (this.state.isSectorMode && this.state.currentSector) {
            return this.state.currentSector;
        }
        return null;
    }

    public getAllMarks(): SectorMark[] {
        return [...this.sectorMarks];
    }

    public cancelOperationMode() {
        return this.cancelSectorMode();
    }

    public setSectorMode = (): SectorMarkState => {
        this.state = {
            ...this.state,
            isSectorMode: true,
            sectorPoints: [],
            currentSector: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
        return this.state;
    };

    public cancelSectorMode = (): SectorMarkState => {
        if (this.previewSectorMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewSectorMark);
            this.previewSectorMark = null;
        }
        this.sectorMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isSectorMode: false,
            sectorPoints: [],
            currentSector: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): SectorMarkState => {
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
            let price: number | null = null;
            let time: number | null = null;

            try {
                time = timeScale.coordinateToTime(relativeX);
                if (chartSeries.series && typeof chartSeries.series.coordinateToPrice === 'function') {
                    price = chartSeries.series.coordinateToPrice(relativeY);
                } else {
                    price = this.coordinateToPriceFallback(relativeY);
                }
            } catch (error) {
                return this.state;
            }

            if (time === null || price === null) {
                return this.state;
            }

            this.dragStartData = { time, price };
            let handleFound = false;

            for (const mark of this.sectorMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    this.state = {
                        ...this.state,
                        isSectorMode: true,
                        isDragging: true,
                        dragTarget: mark,
                        dragPoint: handleType
                    };
                    this.sectorMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                    });
                    mark.setDragging(true, handleType);
                    this.isOperating = true;
                    handleFound = true;
                    break;
                }
            }

            if (!handleFound) {
                let sectorFound = false;
                for (const mark of this.sectorMarks) {
                    const nearSector = mark.isPointNearSector(relativeX, relativeY);
                    const insideSector = mark.isPointInsideSector(relativeX, relativeY);

                    if (nearSector || insideSector) {
                        this.state = {
                            ...this.state,
                            isSectorMode: true,
                            isDragging: true,
                            dragTarget: mark,
                            dragPoint: 'sector'
                        };
                        this.sectorMarks.forEach(m => {
                            m.setShowHandles(m === mark);
                        });
                        mark.setDragging(true, 'sector');
                        this.isOperating = true;
                        sectorFound = true;
                        break;
                    }
                }

                if (!sectorFound && this.state.isSectorMode) {
                    const pointsCount = this.state.sectorPoints.length;
                    if (pointsCount === 0) {
                        this.state = {
                            ...this.state,
                            sectorPoints: [point],
                            currentSector: null
                        };
                        this.previewSectorMark = new SectorMark(
                            price, price, price,
                            time, time, time,
                            '#2962FF', 1, true
                        );
                        if (chartSeries.series.attachPrimitive) {
                            chartSeries.series.attachPrimitive(this.previewSectorMark);
                        }
                        this.sectorMarks.forEach(m => m.setShowHandles(false));
                    } else if (pointsCount === 1) {
                        this.state = {
                            ...this.state,
                            sectorPoints: [...this.state.sectorPoints, point]
                        };
                        if (this.previewSectorMark) {
                            this.previewSectorMark.updateRadiusPoint(price, time);
                        }
                    } else if (pointsCount === 2) {
                        if (this.previewSectorMark) {
                            const centerPrice = this.previewSectorMark.getCenterPrice();
                            const centerTime = this.previewSectorMark.getCenterTime();
                            const radiusPrice = this.previewSectorMark.getRadiusPrice();
                            const radiusTime = this.previewSectorMark.getRadiusTime();

                            if (chartSeries.series.detachPrimitive) {
                                chartSeries.series.detachPrimitive(this.previewSectorMark);
                            }

                            const finalSectorMark = new SectorMark(
                                centerPrice, radiusPrice, price,
                                centerTime, radiusTime, time,
                                '#2962FF', 1, false
                            );

                            if (chartSeries.series.attachPrimitive) {
                                chartSeries.series.attachPrimitive(finalSectorMark);
                            }

                            this.sectorMarks.push(finalSectorMark);
                            this.previewSectorMark = null;
                            finalSectorMark.setShowHandles(true);

                            this.state = {
                                ...this.state,
                                isSectorMode: false,
                                sectorPoints: [],
                                currentSector: null
                            };

                            if (this.props.onCloseDrawing) {
                                this.props.onCloseDrawing();
                            }
                        }
                    }
                } else if (!this.state.isSectorMode) {
                    this.sectorMarks.forEach(mark => {
                        mark.setShowHandles(false);
                    });
                }
            }
        } catch (error) {
            this.state = this.cancelSectorMode();
        }
        return this.state;
    };

    private coordinateToPriceFallback(y: number): number {
        const { chartSeries } = this.props;
        if (!chartSeries || !chartSeries.series) return 100;

        try {
            const data = chartSeries.series.data();
            if (data && data.length > 0) {
                let min = Number.MAX_VALUE;
                let max = Number.MIN_VALUE;
                data.forEach((item: any) => {
                    if (item.value !== undefined) {
                        if (item.value < min) min = item.value;
                        if (item.value > max) max = item.value;
                    }
                    if (item.low !== undefined && item.high !== undefined) {
                        if (item.low < min) min = item.low;
                        if (item.high > max) max = item.high;
                    }
                });
                if (min > max) {
                    min = 0;
                    max = 100;
                }
                const margin = (max - min) * 0.1;
                const chartElement = this.props.chart?.chartElement();
                const chartHeight = chartElement?.clientHeight || 500;
                const percent = 1 - (y / chartHeight);
                return min - margin + (max - min + 2 * margin) * percent;
            }
        } catch (error) {

        }
        return 100;
    }

    private priceToCoordinateFallback(price: number): number {
        const { chartSeries } = this.props;
        if (!chartSeries || !chartSeries.series) return 250;

        try {
            const data = chartSeries.series.data();
            if (data && data.length > 0) {
                let min = Number.MAX_VALUE;
                let max = Number.MIN_VALUE;
                data.forEach((item: any) => {
                    if (item.value !== undefined) {
                        if (item.value < min) min = item.value;
                        if (item.value > max) max = item.value;
                    }
                    if (item.low !== undefined && item.high !== undefined) {
                        if (item.low < min) min = item.low;
                        if (item.high > max) max = item.high;
                    }
                });
                if (min > max) {
                    min = 0;
                    max = 100;
                }
                const margin = (max - min) * 0.1;
                const chartElement = this.props.chart?.chartElement();
                const chartHeight = chartElement?.clientHeight || 500;
                const normalizedPrice = Math.max(min - margin, Math.min(max + margin, price));
                const percent = (normalizedPrice - (min - margin)) / ((max + margin) - (min - margin));
                return chartHeight * (1 - percent);
            }
        } catch (error) {
        }
        return 250;
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
            let price: number | null = null;
            let time: number | null = null;

            try {
                time = timeScale.coordinateToTime(relativeX);
                if (chartSeries.series && typeof chartSeries.series.coordinateToPrice === 'function') {
                    price = chartSeries.series.coordinateToPrice(relativeY);
                } else {
                    price = this.coordinateToPriceFallback(relativeY);
                }
            } catch (error) {
                return;
            }
            if (time === null || price === null) return;
            if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
                let currentStartY: number | null = null;
                let currentY: number | null = null;
                let currentStartX: number | null = null;
                let currentX: number | null = null;
                if (chartSeries.series && typeof chartSeries.series.priceToCoordinate === 'function') {
                    currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                    currentY = chartSeries.series.priceToCoordinate(price);
                } else {
                    currentStartY = this.priceToCoordinateFallback(this.dragStartData.price);
                    currentY = this.priceToCoordinateFallback(price);
                }
                currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
                currentX = timeScale.timeToCoordinate(time);
                if (currentStartY === null || currentY === null || currentStartX === null || currentX === null) return;
                const deltaY = currentY - currentStartY;
                const deltaX = currentX - currentStartX;
                if (this.state.dragPoint === 'center' || this.state.dragPoint === 'radius' || this.state.dragPoint === 'angle') {
                    if (this.state.dragTarget.dragHandleByPixels) {
                        this.state.dragTarget.dragHandleByPixels(deltaY, deltaX, this.state.dragPoint as 'center' | 'radius' | 'angle');
                    }
                } else if (this.state.dragPoint === 'sector') {
                    if (this.state.dragTarget.dragSectorByPixels) {
                        this.state.dragTarget.dragSectorByPixels(deltaY, deltaX);
                    }
                }

                this.dragStartData = { time, price };
                return;
            }

            if (!this.state.isDragging) {
                const pointsCount = this.state.sectorPoints.length;
                if (pointsCount === 1 && this.previewSectorMark) {
                    if (this.previewSectorMark.updateRadiusPoint) {
                        this.previewSectorMark.updateRadiusPoint(price, time);
                    }
                } else if (pointsCount === 2 && this.previewSectorMark) {
                    if (this.previewSectorMark.updateAnglePoint) {
                        this.previewSectorMark.updateAnglePoint(price, time);
                    }
                }

                if (!this.state.isSectorMode && pointsCount === 0) {
                    let anyMarkHovered = false;
                    for (const mark of this.sectorMarks) {
                        const handleType = mark.isPointNearHandle(relativeX, relativeY);
                        const isNearSector = mark.isPointNearSector(relativeX, relativeY);
                        const isInsideSector = mark.isPointInsideSector(relativeX, relativeY);
                        const shouldShow = !!handleType || isNearSector || isInsideSector;
                        mark.setShowHandles(shouldShow);
                        if (shouldShow) anyMarkHovered = true;
                    }
                    if (!anyMarkHovered) {
                        this.sectorMarks.forEach(mark => {
                            mark.setShowHandles(false);
                        });
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): SectorMarkState => {
        if (this.state.isDragging) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDragging(false, null);
            }

            this.state = {
                ...this.state,
                isSectorMode: false,
                isDragging: false,
                dragTarget: null,
                dragPoint: null
            };

            if (this.props.onCloseDrawing) {
                this.props.onCloseDrawing();
            }

            this.isOperating = false;
        }

        this.dragStartData = null;
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): SectorMarkState => {
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
            } else if (this.state.isSectorMode) {
                return this.cancelSectorMode();
            }
        }
        return this.state;
    };

    public getState(): SectorMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<SectorMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewSectorMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewSectorMark);
            this.previewSectorMark = null;
        }
        this.sectorMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.sectorMarks = [];
    }

    public getSectorMarks(): SectorMark[] {
        return [...this.sectorMarks];
    }

    public removeSectorMark(mark: SectorMark): void {
        const index = this.sectorMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.sectorMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isSectorMode;
    }
}