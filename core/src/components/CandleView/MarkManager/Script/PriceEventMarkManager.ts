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
    onDoubleClick?: (id: string, time: number, script: string) => void;
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
    private idToMarkMap: Map<string, PriceEventMark> = new Map();
    private idToScriptMap: Map<string, string> = new Map();
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
                this.props.onDoubleClick(clickedMark.id(), clickedMark.price(), this.idToScriptMap.get(clickedMark.id()) || '');
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
                    this.idToScriptMap.set(previewMark.id(), '');
                } else {
                    const finalMark = this.state.previewMark;
                    finalMark.setPreviewMode(false);
                    finalMark.setShowHandles(true);
                    const finalPrice = finalMark.price();
                    const finalId = finalMark.id();
                    this.priceEventMarks.push(finalMark);
                    this.priceToMarkMap.set(finalPrice, finalMark);
                    this.idToMarkMap.set(finalId, finalMark);
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
        this.idToMarkMap.clear();
        this.idToScriptMap.clear();
    }

    public getPriceEventMarks(): PriceEventMark[] {
        return [...this.priceEventMarks];
    }

    public removePriceEventMark(mark: PriceEventMark): void {
        const index = this.priceEventMarks.indexOf(mark);
        if (index > -1) {
            const price = mark.price();
            const id = mark.id();
            this.props.chartSeries?.series.detachPrimitive(mark);
            this.priceEventMarks.splice(index, 1);
            this.priceToMarkMap.delete(price);
            this.priceToScriptMap.delete(price);
            this.idToMarkMap.delete(id);
            this.idToScriptMap.delete(id);
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

    public getScriptById(id: string): string | null {
        return this.idToScriptMap.get(id) || null;
    }

    public setScriptById(id: string, script: string): void {
        this.idToScriptMap.set(id, script);
    }

    public getScriptByPrice(price: number): string | null {
        const mark = this.priceToMarkMap.get(price);
        if (mark) {
            return this.idToScriptMap.get(mark.id()) || null;
        }
        return null;
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

    public getIdToScriptMap(): Map<string, string> {
        return new Map(this.idToScriptMap);
    }

    public getPriceToScriptMap(): Map<number, string> {
        const map = new Map<number, string>();
        this.priceToMarkMap.forEach((mark, price) => {
            const script = this.idToScriptMap.get(mark.id());
            if (script !== undefined) {
                map.set(price, script);
            }
        });
        return map;
    }

    public importScripts(scripts: Map<number, string> | Record<number, string>): void {
        if (scripts instanceof Map) {
            this.idToScriptMap.clear();
            scripts.forEach((script, price) => {
                const mark = this.priceToMarkMap.get(price);
                if (mark) {
                    this.idToScriptMap.set(mark.id(), script);
                }
            });
        } else {
            this.idToScriptMap.clear();
            Object.entries(scripts).forEach(([priceStr, script]) => {
                const price = Number(priceStr);
                const mark = this.priceToMarkMap.get(price);
                if (mark) {
                    this.idToScriptMap.set(mark.id(), script);
                }
            });
        }
    }


    public clearAllScripts(): void {
        this.priceToScriptMap.clear();
    }

    public hasScriptAtPrice(price: number): boolean {
        return this.priceToScriptMap.has(price);
    }

    public executeScriptAtPrice(
        open: number,
        high: number,
        low: number,
        close: number
    ): any {
        const minPrice = Math.min(open, high, low, close);
        const maxPrice = Math.max(open, high, low, close);
        const matchedMarks: Array<{
            mark: PriceEventMark;
            price: number;
            script: string;
        }> = [];
        this.priceToMarkMap.forEach((mark, price) => {
            if (price >= minPrice && price <= maxPrice) {
                const script = this.idToScriptMap.get(mark.id());
                if (script && script.trim() !== '') {
                    matchedMarks.push({
                        mark,
                        price,
                        script
                    });
                }
            }
        });
        if (matchedMarks.length === 0) {
            return null;
        }
        const results: Array<{
            price: number;
            markId: string;
            result: any;
            consoleOutput?: any[];
            timestamp: number;
        }> = [];
        matchedMarks.forEach(item => {
            const { mark, price, script } = item;
            try {
                const capturedOutput: any[] = [];
                const customConsole = {
                    log: (...args: any[]) => {
                        capturedOutput.push({ type: 'log', args });
                        console.log(`[PriceEvent Script @ ${price}]`, ...args);
                    },
                    info: (...args: any[]) => {
                        capturedOutput.push({ type: 'info', args });
                        console.info(`[PriceEvent Script @ ${price}]`, ...args);
                    },
                    warn: (...args: any[]) => {
                        capturedOutput.push({ type: 'warn', args });
                        console.warn(`[PriceEvent Script @ ${price}]`, ...args);
                    },
                    error: (...args: any[]) => {
                        capturedOutput.push({ type: 'error', args });
                        console.error(`[PriceEvent Script @ ${price}]`, ...args);
                    },
                    clear: () => {
                        capturedOutput.length = 0;
                        console.clear();
                    }
                };
                const context = {
                    price,
                    open,
                    high,
                    low,
                    close,
                    priceRange: {
                        min: minPrice,
                        max: maxPrice
                    },
                    id: mark.id(),
                    chart: this.props.chart,
                    chartSeries: this.props.chartSeries,
                    manager: this,
                    console: customConsole,
                    Math,
                    Date,
                    JSON,
                    setTimeout,
                    setInterval,
                    clearTimeout,
                    clearInterval
                };
                const executeScript = new Function(
                    'ctx',
                    `
                    const { 
                        price, open, high, low, close, priceRange,
                        id, chart, chartSeries, manager, 
                        console, Math, Date, JSON, 
                        setTimeout, setInterval, clearTimeout, clearInterval 
                    } = ctx;
                    
                    try {
                        return (function() {
                            ${script}
                        })();
                    } catch(e) {
                        console.error('Script execution error:', e.message);
                        throw e;
                    }
                `
                );
                const result = executeScript.call(null, context);
                const resultObj: {
                    price: number;
                    markId: string;
                    result: any;
                    consoleOutput?: any[];
                    timestamp: number;
                } = {
                    price,
                    markId: mark.id(),
                    result,
                    timestamp: Date.now()
                };
                if (capturedOutput.length > 0) {
                    resultObj.consoleOutput = capturedOutput;
                }
                results.push(resultObj);
            } catch (error: any) {
                const errorResult: {
                    price: number;
                    markId: string;
                    result: any;
                    consoleOutput?: any[];
                    timestamp: number;
                } = {
                    price,
                    markId: mark.id(),
                    result: {
                        error: error.message
                    },
                    timestamp: Date.now()
                };
                results.push(errorResult);
            }
        });
        if (results.length === 1) {
            return results[0];
        }
        return {
            total: results.length,
            executions: results,
            priceRange: {
                min: minPrice,
                max: maxPrice
            },
            timestamp: Date.now()
        };
    }
}