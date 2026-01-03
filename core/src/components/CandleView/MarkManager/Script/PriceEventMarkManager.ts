import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { PriceEventConfig, PriceEventMark } from "../../Mark/Script/PriceEventMark";
import { Point } from "../../types";

export interface PriceEventMarkManagerProps {
    chartSeries: ChartSeries | null;
    chart: any;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onCloseDrawing?: () => void;
    defaultConfig?: Partial<PriceEventConfig>;
    onDoubleClick?: (price: number) => void;
}

export interface PriceEventMarkState {
    isPriceEventMode: boolean;
    isDragging: boolean;
    dragTarget: PriceEventMark | null;
    previewMark: PriceEventMark | null;
}

export class PriceEventMarkManager implements IMarkManager<PriceEventMark> {
    private props: PriceEventMarkManagerProps;
    private state: PriceEventMarkState;
    private priceEventMarks: PriceEventMark[] = [];
    private priceToMarkMap: Map<number, PriceEventMark> = new Map();
    private priceToScriptMap: Map<number, string> = new Map();
    private dragStartData: { price: number; coordinate: number } | null = null;
    private isOperating: boolean = false;
    private lastClickTime: number = 0;
    private lastClickMark: PriceEventMark | null = null;

    constructor(props: PriceEventMarkManagerProps) {
        this.props = props;
        this.state = {
            isPriceEventMode: false,
            isDragging: false,
            dragTarget: null,
            previewMark: null
        };
    }

    public clearState(): void {
        this.state = {
            isPriceEventMode: false,
            isDragging: false,
            dragTarget: null,
            previewMark: null
        };
    }

    public getMarkAtPoint(point: Point): PriceEventMark | null {
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
            for (const mark of this.priceEventMarks) {
                if (mark.isPointNear(relativeX, relativeY)) {
                    return mark;
                }
            }
        } catch (error) {
        }
        return null;
    }

    public getMarkByPrice(price: number): PriceEventMark | null {
        return this.priceToMarkMap.get(price) || null;
    }

    public hasMarkAtPrice(price: number): boolean {
        return this.priceToMarkMap.has(price);
    }

    public getCurrentDragTarget(): PriceEventMark | null {
        return this.state.dragTarget;
    }

    public getCurrentDragPoint(): string | null {
        return this.state.dragTarget ? 'bubble' : null;
    }

    public getCurrentOperatingMark(): PriceEventMark | null {
        if (this.state.dragTarget) {
            return this.state.dragTarget;
        }
        if (this.state.previewMark) {
            return this.state.previewMark;
        }
        return null;
    }

    public getAllMarks(): PriceEventMark[] {
        return [...this.priceEventMarks];
    }

    public getAllPrices(): number[] {
        return Array.from(this.priceToMarkMap.keys());
    }

    public cancelOperationMode() {
        return this.cancelPriceEventMode();
    }

    public setPriceEventMode = (): PriceEventMarkState => {
        this.state = {
            ...this.state,
            isPriceEventMode: true,
            previewMark: null
        };
        return this.state;
    };

    public cancelPriceEventMode = (): PriceEventMarkState => {
        if (this.state.previewMark) {
            const price = this.state.previewMark.price();
            this.props.chartSeries?.series.detachPrimitive(this.state.previewMark);

            this.priceToScriptMap.delete(price);
        }
        this.priceEventMarks.forEach(mark => {
            mark.setShowHandles(false);
        });
        this.state = {
            isPriceEventMode: false,
            isDragging: false,
            dragTarget: null,
            previewMark: null
        };
        this.isOperating = false;
        return this.state;
    };

    public handleMouseDown = (point: Point): PriceEventMarkState => {
        const { chartSeries, chart, containerRef, defaultConfig } = this.props;
        if (!chartSeries || !chart) return this.state;
        try {
            const chartElement = chart.chartElement();
            if (!chartElement) return this.state;
            const chartRect = chartElement.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();
            if (!containerRect) return this.state;
            const relativeX = point.x - (containerRect.left - chartRect.left);
            const relativeY = point.y - (containerRect.top - chartRect.top);
            const price = chartSeries.series.coordinateToPrice(relativeY);
            if (price === null) return this.state;
            const clickedMark = this.getMarkAtPoint(point);
            const currentTime = Date.now();
            const isDoubleClick =
                clickedMark &&
                clickedMark === this.lastClickMark &&
                currentTime - this.lastClickTime < 300;
            if (isDoubleClick && this.props.onDoubleClick) {
                this.props.onDoubleClick(clickedMark.price());
                this.lastClickTime = 0;
                this.lastClickMark = null;
                if (this.state.isPriceEventMode) {
                    return this.cancelPriceEventMode();
                }
                return this.state;
            }
            this.lastClickMark = clickedMark;
            this.lastClickTime = currentTime;
            if (clickedMark) {
                this.state = {
                    ...this.state,
                    isDragging: true,
                    dragTarget: clickedMark,
                    isPriceEventMode: false
                };
                this.priceEventMarks.forEach(m => {
                    m.setShowHandles(m === clickedMark);
                });
                this.dragStartData = { price, coordinate: relativeY };
                this.isOperating = true;
                clickedMark.setDragging(true);
                return this.state;
            }
            if (this.state.isPriceEventMode) {
                if (!this.state.previewMark) {
                    const defaultTitle = defaultConfig?.title || '';
                    const config: PriceEventConfig = {
                        price,
                        time: defaultConfig?.time || Date.now(),
                        title: defaultTitle,
                        description: defaultConfig?.description || '',
                        color: defaultConfig?.color || '#007c15ff',
                        backgroundColor: defaultConfig?.backgroundColor || '#FFFFFF',
                        textColor: defaultConfig?.textColor || '#333333',
                        fontSize: defaultConfig?.fontSize || 12,
                        padding: defaultConfig?.padding || 8,
                        arrowWidth: defaultConfig?.arrowWidth || 6,
                        borderRadius: defaultConfig?.borderRadius || 4,
                        isPreview: true
                    };
                    const previewMark = new PriceEventMark(config);
                    chartSeries.series.attachPrimitive(previewMark);
                    this.state = {
                        ...this.state,
                        previewMark
                    };
                    this.priceEventMarks.forEach(m => m.setShowHandles(false));
                    previewMark.setShowHandles(true);
                    this.priceToScriptMap.set(price, '');
                } else {
                    const finalMark = this.state.previewMark;
                    finalMark.setPreviewMode(false);
                    finalMark.setShowHandles(true);
                    const finalPrice = finalMark.price();
                    this.priceEventMarks.push(finalMark);
                    this.priceToMarkMap.set(finalPrice, finalMark);
                    if (!this.priceToScriptMap.has(finalPrice)) {
                        this.priceToScriptMap.set(finalPrice, '');
                    }
                    this.state = {
                        ...this.state,
                        isPriceEventMode: false,
                        previewMark: null
                    };
                    if (this.props.onCloseDrawing) {
                        this.props.onCloseDrawing();
                    }
                }
            } else {
                this.priceEventMarks.forEach(m => m.setShowHandles(false));
            }
        } catch (error) {
            this.state = this.cancelPriceEventMode();
        }
        return this.state;
    };

    public clearDoubleClickState(): void {
        this.lastClickTime = 0;
        this.lastClickMark = null;
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
            const relativeY = point.y - (containerRect.top - chartRect.top);
            const price = chartSeries.series.coordinateToPrice(relativeY);
            if (price === null) return;
            if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
                const deltaY = relativeY - this.dragStartData.coordinate;
                this.state.dragTarget.dragByPixels(deltaY);
                const oldPrice = this.state.dragTarget.price();
                const newPrice = price;
                if (oldPrice !== newPrice) {
                    this.priceToMarkMap.delete(oldPrice);
                    this.priceToMarkMap.set(newPrice, this.state.dragTarget);
                    const script = this.priceToScriptMap.get(oldPrice);
                    if (script !== undefined) {
                        this.priceToScriptMap.delete(oldPrice);
                        this.priceToScriptMap.set(newPrice, script);
                    }
                }
                this.dragStartData = { price, coordinate: relativeY };
                return;
            }
            if (this.state.previewMark && this.state.isPriceEventMode) {
                this.state.previewMark.updatePrice(price);

                const oldPrice = this.state.previewMark.price();
                if (oldPrice !== price) {
                    const script = this.priceToScriptMap.get(oldPrice);
                    if (script !== undefined) {
                        this.priceToScriptMap.delete(oldPrice);
                        this.priceToScriptMap.set(price, script);
                    }
                }
            }
            if (!this.state.isPriceEventMode && !this.state.isDragging) {
                const hoveredMark = this.getMarkAtPoint(point);
                this.priceEventMarks.forEach(mark => {
                    mark.setShowHandles(mark === hoveredMark);
                });
            }
        } catch (error) {
        }
    };

    public handleMouseUp = (point: Point): PriceEventMarkState => {
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

    public handleKeyDown = (event: KeyboardEvent): PriceEventMarkState => {
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
            } else if (this.state.isPriceEventMode) {
                return this.cancelPriceEventMode();
            }
        }
        return this.state;
    };

    public getState(): PriceEventMarkState {
        return { ...this.state };
    }

    public updateProps(newProps: Partial<PriceEventMarkManagerProps>): void {
        this.props = { ...this.props, ...newProps };
    }

    public destroy(): void {
        if (this.state.previewMark) {
            this.props.chartSeries?.series.detachPrimitive(this.state.previewMark);
        }
        this.priceEventMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.priceEventMarks = [];
        this.priceToMarkMap.clear();
        this.priceToScriptMap.clear();
    }

    public getPriceEventMarks(): PriceEventMark[] {
        return [...this.priceEventMarks];
    }

    public removePriceEventMark(mark: PriceEventMark): void {
        const index = this.priceEventMarks.indexOf(mark);
        if (index > -1) {
            const price = mark.price();
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.priceEventMarks.splice(index, 1);
            this.priceToMarkMap.delete(price);
            this.priceToScriptMap.delete(price);
        }
    }

    public isOperatingOnChart(): boolean {
        return this.isOperating || this.state.isDragging || this.state.isPriceEventMode;
    }

    private hiddenMarks: PriceEventMark[] = [];

    public hideAllMarks(): void {
        this.hiddenMarks.push(...this.priceEventMarks);
        this.priceEventMarks.forEach(mark => {
            this.props.chartSeries?.series.detachPrimitive(mark);
        });
        this.priceEventMarks = [];
    }

    public showAllMarks(): void {
        this.priceEventMarks.push(...this.hiddenMarks);
        this.hiddenMarks.forEach(mark => {
            this.props.chartSeries?.series.attachPrimitive(mark);
        });
        this.hiddenMarks = [];
    }

    public hideMark(mark: PriceEventMark): void {
        const index = this.priceEventMarks.indexOf(mark);
        if (index > -1) {
            this.priceEventMarks.splice(index, 1);
            this.hiddenMarks.push(mark);
            this.props.chartSeries?.series.detachPrimitive(mark);
        }
    }

    public showMark(mark: PriceEventMark): void {
        const index = this.hiddenMarks.indexOf(mark);
        if (index > -1) {
            this.hiddenMarks.splice(index, 1);
            this.priceEventMarks.push(mark);
            this.props.chartSeries?.series.attachPrimitive(mark);
        }
    }

    public getScriptByPrice(price: number): string | null {
        return this.priceToScriptMap.get(price) || null;
    }

    public setScriptForPrice(price: number, script: string): void {
        this.priceToScriptMap.set(price, script);
    }

    public removeScriptForPrice(price: number): void {
        this.priceToScriptMap.delete(price);
    }

    public getAllPricesWithScript(): number[] {
        return Array.from(this.priceToScriptMap.keys());
    }

    public getAllScripts(): string[] {
        return Array.from(this.priceToScriptMap.values());
    }

    public getPriceToScriptMap(): Map<number, string> {
        return new Map(this.priceToScriptMap);
    }

    public importScripts(scripts: Map<number, string> | Record<number, string>): void {
        if (scripts instanceof Map) {
            this.priceToScriptMap = new Map(scripts);
        } else {
            this.priceToScriptMap.clear();
            Object.entries(scripts).forEach(([price, script]) => {
                this.priceToScriptMap.set(Number(price), script);
            });
        }
    }

    public clearAllScripts(): void {
        this.priceToScriptMap.clear();
    }

    public hasScriptAtPrice(price: number): boolean {
        return this.priceToScriptMap.has(price);
    }

    public executeScriptAtPrice(price: number): any {
        const script = this.priceToScriptMap.get(price);
        if (!script || script.trim() === '') {
            return null;
        }
        try {
            const context = {
                price,
                chart: this.props.chart,
                chartSeries: this.props.chartSeries,
                manager: this
            };
            const executeScript = new Function(
                'ctx',
                `try { 
                with(ctx) { 
                    return (${script}); 
                }
            } catch(e) { 
                return null;
            }`
            );
            return executeScript.call(null, context);
        } catch (error) {
            return null;
        }
    }
}