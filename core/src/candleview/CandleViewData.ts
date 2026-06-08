import { DataPreprocessor, DataPreprocessResult } from '../DataPreprocessor';
import { ICandleViewDataPoint, PriceEvent, TimeframeEnum, TimezoneEnum } from '../types';

export class CandleViewData {
    private rawData: ICandleViewDataPoint[];
    private timeframe: TimeframeEnum;
    private timezone: TimezoneEnum;
    private preprocessedData: DataPreprocessResult = { displayData: [], realDataRange: { firstIndex: -1, lastIndex: -1 } };
    private priceEvents: Map<number, PriceEvent> = new Map();
    constructor(data: ICandleViewDataPoint[], timeframe: TimeframeEnum, timezone: TimezoneEnum) {
        this.rawData = data || [];
        this.timeframe = timeframe;
        this.timezone = timezone;
        this.refresh();
    }
    public refresh(): void {
        if (this.rawData.length === 0) return;
        this.preprocessedData = DataPreprocessor.preprocess(this.rawData, {
            timeframe: this.timeframe,
            timezone: this.timezone,
            virtualDataBeforeCount: 100,
            virtualDataAfterCount: 100
        });
        this.checkLatestDataPrice(this.rawData);
    }
    public setData(data: ICandleViewDataPoint[]): void {
        this.rawData = data;
        this.refresh();
    }
    public appendData(newData: ICandleViewDataPoint[]): void {
        this.rawData = [...this.rawData, ...newData];
        this.refresh();
    }
    public setTimeframe(timeframe: TimeframeEnum): void { this.timeframe = timeframe; }
    public setTimezone(timezone: TimezoneEnum): void { this.timezone = timezone; }
    public getPreprocessedData(): DataPreprocessResult { return this.preprocessedData; }
    public getRawData(): ICandleViewDataPoint[] { return this.rawData; }
    public addPriceEvent(price: number, event: PriceEvent): void {
        this.priceEvents.set(price, event);
    }
    public removePriceEvent(price: number): void {
        this.priceEvents.delete(price);
    }
    public clearPriceEvents(): void {
        this.priceEvents.clear();
    }
    public getPriceEvents(): PriceEvent[] {
        return Array.from(this.priceEvents.values());
    }
    private checkLatestDataPrice(data: ICandleViewDataPoint[]): void {
        if (!data || data.length === 0 || this.priceEvents.size === 0) return;
        const lastData = data[data.length - 1];
        const latestPrice = lastData.close;
        this.priceEvents.forEach((event, price) => {
            const tolerance = Math.abs(price * 0.001);
            if (Math.abs(latestPrice - price) <= tolerance) {
                event.callback(price, latestPrice);
            }
        });
    }
}