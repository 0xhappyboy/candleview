import { DrawingManagerState } from '../chart/DrawingManager';
import { ThemeConfig } from '../theme';
import { CursorType, ICandleViewDataPoint, MainChartType, PriceEvent, StaticMarkDirection, StaticMarkType } from '../types';
import { CandleViewCore } from './CandleViewCore';
import { IStaticMarkOptions, IStaticMarkItem } from './CandleViewMark';
import { CandleViewConfig } from './types';

export class CandleView {
    private core: CandleViewCore;

    constructor(config: CandleViewConfig) {
        this.core = new CandleViewCore(config);
    }

    // ==================== Panel State ====================
    public getTopPanelState() { return this.core.getTopPanelState(); }
    public getLeftPanelState() { return this.core.getLeftPanelState(); }

    // ==================== Drawing ====================
    public getDrawingState(): DrawingManagerState | null { return this.core.getDrawingState(); }
    public setCursorType(cursorType: CursorType): void { this.core.setCursorType(cursorType); }
    public showAllMarks(): void { this.core.showAllMarks(); }
    public hideAllMarks(): void { this.core.hideAllMarks(); }
    public clearAllMarks(): void { this.core.clearAllMarks(); }
    public clearCurrentTool(): void { this.core.clearCurrentTool(); }
    public getCurrentTool(): string | null { return this.core.getCurrentTool(); }

    // ==================== Data ====================
    public setData(data: ICandleViewDataPoint[]): void { this.core.setData(data); }
    public updateData(newData: ICandleViewDataPoint[]): void {
        this.core.updateData(newData);
    }
    // ==================== Theme & Locale ====================
    public getCurrentTheme(): ThemeConfig { return this.core.getCurrentTheme(); }
    public setTheme(themeType: 'light' | 'dark'): void { this.core.setTheme(themeType); }
    public setLocale(locale: 'en' | 'zh-cn'): void { this.core.setLocale(locale); }
    public setChartType(type: MainChartType): void { this.core.setChartType(type); }

    // ==================== Price Events ====================
    public registerPriceEvents(events: PriceEvent[]): void { this.core.registerPriceEvents(events); }
    public removePriceEventMarker(price: number): void { this.core.removePriceEventMarker(price); }
    public clearAllPriceEventMarkers(): void { this.core.clearAllPriceEventMarkers(); }
    public getPriceEvents(): PriceEvent[] { return this.core.getPriceEvents(); }

    // ==================== Internal (for components) ====================
    public getChart() { return this.core.getChart(); }

    // ==================== Lifecycle ====================
    public destroy(): void { this.core.destroy(); }

    // ==================== Static Marks ====================
    /**
     * Add a single static mark
     * @param time Timestamp
     * @param text Mark text
     * @param direction Mark direction (StaticMarkDirection.Top or StaticMarkDirection.Bottom)
     * @param type Mark type (StaticMarkType.Text or StaticMarkType.Arrow)
     * @param options Optional configuration
     */
    public addStaticMark(
        time: number,
        text: string,
        direction: StaticMarkDirection,
        type: StaticMarkType,
        options?: IStaticMarkOptions
    ): void {
        this.core.marks.addStaticMark(time, text, direction, type, options);
    }

    /**
     * Add multiple static marks in batch
     * @param marks Array of marks
     */
    public addStaticMarks(marks: IStaticMarkItem[]): void {
        this.core.marks.addStaticMarks(marks);
    }

    /**
     * Add a text mark (convenience method)
     * @param time Timestamp
     * @param text Mark text
     * @param direction Mark direction
     * @param options Optional configuration
     */
    public addTextMark(
        time: number,
        text: string,
        direction: StaticMarkDirection,
        options?: IStaticMarkOptions
    ): void {
        this.core.marks.addTextMark(time, text, direction, options);
    }

    /**
     * Add an arrow mark (convenience method)
     * @param time Timestamp
     * @param direction Mark direction
     * @param options Optional configuration
     */
    public addArrowMark(
        time: number,
        direction: StaticMarkDirection,
        options?: IStaticMarkOptions & { label?: string }
    ): void {
        this.core.marks.addArrowMark(time, direction, options);
    }

    /**
     * Add multiple text marks in batch
     * @param marks Array of text marks
     */
    public addTextMarks(
        marks: Array<{
            time: number;
            text: string;
            direction: StaticMarkDirection;
            options?: IStaticMarkOptions;
        }>
    ): void {
        this.core.marks.addTextMarks(marks);
    }

    /**
     * Add multiple arrow marks in batch
     * @param marks Array of arrow marks
     */
    public addArrowMarks(
        marks: Array<{
            time: number;
            direction: StaticMarkDirection;
            options?: IStaticMarkOptions & { label?: string };
        }>
    ): void {
        this.core.marks.addArrowMarks(marks);
    }

    /**
     * Clear all static marks
     */
    public clearAllStaticMarks(): void {
        this.core.marks.clearAllStaticMarks();
    }

    /**
     * Get the count of static marks
     */
    public getStaticMarkCount(): number {
        return this.core.marks.getStaticMarkCount();
    }
}