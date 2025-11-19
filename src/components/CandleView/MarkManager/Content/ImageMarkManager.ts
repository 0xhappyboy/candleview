import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { ImageMark } from "../../Mark/Content/ImageMark";
import { IMarkManager } from "../../Mark/IMarkManager";
import { Point } from "../../types";

export interface ImageMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
}

export interface ImageMarkState {
    isImageMarkMode: boolean;
    imageMarkStartPoint: Point | null;
    currentImageMark: ImageMark | null;
    isDragging: boolean;
    dragTarget: ImageMark | null;
    dragPoint: 'start' | 'end' | 'line' | null;
    showImageModal: boolean;
    selectedImageUrl: string;
}

export class ImageMarkManager implements IMarkManager<ImageMark> {
    private props: ImageMarkManagerProps;
    private state: ImageMarkState;
    private previewImageMark: ImageMark | null = null;
    private imageMarks: ImageMark[] = [];
    private dragStartData: { time: number; price: number } | null = null;
    private isOperating: boolean = false;

    constructor(props: ImageMarkManagerProps) {
        this.props = props;
        this.state = {
            isImageMarkMode: false,
            imageMarkStartPoint: null,
            currentImageMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            showImageModal: false,
            selectedImageUrl: ''
        };
    }

   public clearState(): void {
        this.state = {
            isImageMarkMode: false,
            imageMarkStartPoint: null,
            currentImageMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            showImageModal: false,
            selectedImageUrl: ''
        };
    }

    public getMarkAtPoint(point: Point): ImageMark | null {
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
            for (const mark of this.imageMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    return mark;
                }
            }
            for (const mark of this.imageMarks) {
                const isInRectangle = mark.isPointInRectangle(relativeX, relativeY);
                if (isInRectangle) {
                    return mark;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public getCurrentDragTarget(): ImageMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragPoint;
    }

    public getCurrentOperatingMark(): ImageMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.previewImageMark) {
            return this.previewImageMark;
        }
        if (this.state.isImageMarkMode && this.state.currentImageMark) {
            return this.state.currentImageMark;
        }
        return null;
    }

    public getAllMarks(): ImageMark[] {
        return [...this.imageMarks];
    }

    public cancelOperationMode() {
        return this.cancelImageMarkMode();
    }

    public openImageUploadModal = (): void => {
        this.state = {
            ...this.state,
            showImageModal: true
        };
    };

    public closeImageUploadModal = (): void => {
        this.state = {
            ...this.state,
            showImageModal: false,
            selectedImageUrl: ''
        };
    };

    public setSelectedImageUrl = (url: string): void => {
        this.state = {
            ...this.state,
            selectedImageUrl: url
        };
    };

    public confirmImageSelection = (): void => {
        if (this.state.selectedImageUrl) {
            this.startImageMarkMode();
            this.closeImageUploadModal();
        }
    };

    public startImageMarkMode = (): ImageMarkState => {
        this.state = {
            ...this.state,
            isImageMarkMode: true,
            imageMarkStartPoint: null,
            currentImageMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null
        };
        return this.state;
    };

    public cancelImageMarkMode = (): ImageMarkState => {
        if (this.previewImageMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewImageMark);
            this.previewImageMark = null;
        }
        this.imageMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            ...this.state,
            isImageMarkMode: false,
            imageMarkStartPoint: null,
            currentImageMark: null,
            isDragging: false,
            dragTarget: null,
            dragPoint: null,
            showImageModal: false,
            selectedImageUrl: ''
        };
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): ImageMarkState => {
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
            let foundMark = false;
            for (const mark of this.imageMarks) {
                const handleType = mark.isPointNearHandle(relativeX, relativeY);
                if (handleType) {
                    this.state = {
                        ...this.state,
                        isImageMarkMode: true,
                        isDragging: true,
                        dragTarget: mark,
                        dragPoint: handleType
                    };
                    this.imageMarks.forEach(m => {
                        m.setShowHandles(m === mark);
                    });
                    this.isOperating = true;
                    foundMark = true;
                    break;
                }
            }
            if (!foundMark) {
                for (const mark of this.imageMarks) {
                    const isInRectangle = mark.isPointInRectangle(relativeX, relativeY);
                    if (isInRectangle) {
                        this.state = {
                            ...this.state,
                            isDragging: true,
                            dragTarget: mark,
                            dragPoint: 'line'
                        };
                        mark.setDragging(true, 'line');
                        this.imageMarks.forEach(m => {
                            m.setShowHandles(m === mark);
                        });
                        this.isOperating = true;
                        foundMark = true;
                        break;
                    }
                }
            }
            if (!foundMark && this.state.isImageMarkMode) {
                if (!this.state.imageMarkStartPoint) {
                    this.state = {
                        ...this.state,
                        imageMarkStartPoint: point
                    };
                    this.previewImageMark = new ImageMark(
                        time,
                        price,
                        time,
                        price,
                        this.state.selectedImageUrl,
                        '#2962FF',
                        2,
                        'transparent',
                        1.0,
                        true
                    );
                    chartSeries.series.attachPrimitive(this.previewImageMark);
                    this.imageMarks.forEach(m => m.setShowHandles(false));
                } else {
                    if (this.previewImageMark) {
                        chartSeries.series.detachPrimitive(this.previewImageMark);
                        const finalImageMark = new ImageMark(
                            this.previewImageMark.getStartTime(),
                            this.previewImageMark.getStartPrice(),
                            time,
                            price,
                            this.state.selectedImageUrl,
                            '#2962FF',
                            2,
                            'transparent',
                            1.0,
                            false
                        );
                        chartSeries.series.attachPrimitive(finalImageMark);
                        this.imageMarks.push(finalImageMark);
                        this.previewImageMark = null;
                        finalImageMark.setShowHandles(true);
                    }
                    this.state = {
                        ...this.state,
                        isImageMarkMode: false,
                        imageMarkStartPoint: null,
                        currentImageMark: null,
                        selectedImageUrl: ''
                    };
                    this.isOperating = false;
                    if (this.props.onCloseDrawing) {
                        this.props.onCloseDrawing();
                    }
                }
            }
        } catch (error) {
            console.error(error);
            this.state = this.cancelImageMarkMode();
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
            if (this.state.isDragging && this.state.dragTarget && this.dragStartData && this.state.dragPoint === 'line') {
                if (this.dragStartData.time === null || time === null) return;
                const currentStartX = timeScale.timeToCoordinate(this.dragStartData.time);
                const currentStartY = chartSeries.series.priceToCoordinate(this.dragStartData.price);
                const currentX = timeScale.timeToCoordinate(time);
                const currentY = chartSeries.series.priceToCoordinate(price);
                if (currentStartX === null || currentStartY === null || currentX === null || currentY === null) return;
                const deltaX = currentX - currentStartX;
                const deltaY = currentY - currentStartY;
                this.state.dragTarget.dragLineByPixels(deltaX, deltaY);
                this.dragStartData = { time, price };
                return;
            }
            if (this.state.isImageMarkMode && this.state.dragTarget && this.state.dragPoint &&
                (this.state.dragPoint === 'start' || this.state.dragPoint === 'end')) {
                if (this.state.dragPoint === 'start') {
                    this.state.dragTarget.updateStartPoint(time, price);
                } else if (this.state.dragPoint === 'end') {
                    this.state.dragTarget.updateEndPoint(time, price);
                }
            }
            if (!this.state.isDragging) {
                if (this.state.imageMarkStartPoint && this.previewImageMark) {
                    this.previewImageMark.updateEndPoint(time, price);
                }
                if (!this.state.isImageMarkMode && !this.state.isDragging && !this.state.imageMarkStartPoint) {
                    let anyImageHovered = false;
                    for (const mark of this.imageMarks) {
                        const handleType = mark.isPointNearHandle(relativeX, relativeY);
                        const isInRectangle = mark.isPointInRectangle(relativeX, relativeY);
                        const shouldShow = !!handleType || isInRectangle;
                        mark.setShowHandles(shouldShow);
                        if (shouldShow) anyImageHovered = true;
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    public handleMouseUp = (point: Point): ImageMarkState => {
        if (this.state.isDragging) {
            if (this.state.dragTarget) {
                this.state.dragTarget.setDragging(false, null);
            }
            if (this.state.dragPoint === 'start' || this.state.dragPoint === 'end') {
                this.state = {
                    ...this.state,
                    isImageMarkMode: false,
                    isDragging: false,
                    dragTarget: null,
                    dragPoint: null
                };
                if (this.props.onCloseDrawing) {
                    this.props.onCloseDrawing();
                }
            } else {
                this.state = {
                    ...this.state,
                    isDragging: false,
                    dragTarget: null,
                    dragPoint: null
                };
            }
            this.isOperating = false;
        }
        this.dragStartData = null;
        return { ...this.state };
    };

    public handleKeyDown = (event: KeyboardEvent): ImageMarkState => {
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
            } else if (this.state.isImageMarkMode) {
                return this.cancelImageMarkMode();
            } else if (this.state.showImageModal) {
                this.closeImageUploadModal();
            }
        }
        return this.state;
    };

    public getState(): ImageMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<ImageMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.previewImageMark) {
            this.props.chartSeries?.series.detachPrimitive(this.previewImageMark);
            this.previewImageMark = null;
        }

        this.imageMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.imageMarks = [];
    }

    public getImageMarks(): ImageMark[] {
        return [...this.imageMarks];
    }

    public removeImageMark(mark: ImageMark): void {
        const index = this.imageMarks.indexOf(mark);
        if (index > -1) {
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.imageMarks.splice(index, 1);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isImageMarkMode;
    }
}