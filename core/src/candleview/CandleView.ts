import { DrawingManagerState } from '../chart/DrawingManager';
import { ThemeConfig } from '../theme';
import { CursorType, ICandleViewDataPoint, MainChartType, PriceEvent } from '../types';
import { CandleViewCore } from './CandleViewCore';
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
}