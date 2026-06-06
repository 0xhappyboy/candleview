import { DataPreprocessor, DataPreprocessResult } from '../DataPreprocessor';
import { ICandleViewDataPoint, PriceEvent, TimeframeEnum, TimezoneEnum } from '../types';
import { CoreState } from './types';

export class CandleViewData {
    private state: CoreState;
    private preprocessedData: DataPreprocessResult | null = null;
    private priceEvents: Map<number, PriceEvent> = new Map();

    constructor(state: CoreState) {
        this.state = state;
    }

    public refreshViewData(): void {
        this.preprocessedData = DataPreprocessor.preprocess(this.state.rawData, {
            timeframe: this.state.currentTimeframe,
            timezone: this.state.currentTimezone,
            virtualDataBeforeCount: 100,
            virtualDataAfterCount: 100
        });
    }

    public preprocessData(
        originalData: ICandleViewDataPoint[],
        options?: {
            timeframe?: TimeframeEnum;
            timezone?: TimezoneEnum;
            virtualDataBeforeCount?: number;
            virtualDataAfterCount?: number;
        }
    ): DataPreprocessResult {
        return DataPreprocessor.preprocess(originalData, {
            timeframe: options?.timeframe,
            timezone: options?.timezone,
            virtualDataBeforeCount: options?.virtualDataBeforeCount,
            virtualDataAfterCount: options?.virtualDataAfterCount,
        });
    }

    public setData(data: ICandleViewDataPoint[]): void {
        this.state.rawData = data;
        this.refreshViewData();
        this.checkLatestDataPrice(data);
    }

    public checkLatestDataPrice(data: ICandleViewDataPoint[]): void {
        if (!data || data.length === 0) return;
        if (this.priceEvents.size === 0) return;

        const lastData = data[data.length - 1];
        const latestPrice = lastData.close;

        this.priceEvents.forEach((event, price) => {
            const tolerance = Math.abs(price * 0.001);
            if (Math.abs(latestPrice - price) <= tolerance) {
                event.callback(price, latestPrice);
            }
        });
    }

    public getPreprocessedData(): DataPreprocessResult | null { return this.preprocessedData; }
    public getRawData(): ICandleViewDataPoint[] { return this.state.rawData; }
    public addPriceEvent(price: number, event: PriceEvent): void { this.priceEvents.set(price, event); }
    public removePriceEvent(price: number): void { this.priceEvents.delete(price); }
    public clearPriceEvents(): void { this.priceEvents.clear(); }
    public getPriceEvents(): PriceEvent[] { return Array.from(this.priceEvents.values()); }
}