import { CoreState } from './types';
import { CandleViewData } from './CandleViewData';
import { CandleViewChart } from './CandleViewChart';
import { PriceEventMarkManager } from '../MarkManager/Script/PriceEventMarkManager';
import { PriceEvent } from '../types';
import { PriceEventMark } from '../Mark/Script/PriceEventMark';

export class CandleViewPriceEvents {
    private state: CoreState;
    private dataManager: CandleViewData;
    private chartManager: CandleViewChart;
    private priceEventMarkManager: PriceEventMarkManager | null = null;

    constructor(state: CoreState, dataManager: CandleViewData, chartManager: CandleViewChart) {
        this.state = state;
        this.dataManager = dataManager;
        this.chartManager = chartManager;
    }

    private initManager(): void {
        const chart = this.chartManager.getChart();
        if (!chart || !chart.chartSeries) return;

        this.priceEventMarkManager = new PriceEventMarkManager({
            chartSeries: chart.chartSeries,
            chart: chart.chart,
            containerRef: chart.containerRef,
            onCloseDrawing: () => { },
            onDoubleClick: () => { }
        });
    }

    public register(events: PriceEvent[]): void {
        const chart = this.chartManager.getChart();
        if (!chart || !chart.chartSeries) {
            console.warn('[CandleView] Chart not ready, will retry in 100ms');
            setTimeout(() => this.register(events), 100);
            return;
        }

        if (!this.priceEventMarkManager) {
            this.initManager();
        }

        if (!this.priceEventMarkManager) {
            console.error('[CandleView] Failed to initialize PriceEventMarkManager');
            return;
        }

        events.forEach(event => {
            this.dataManager.addPriceEvent(event.price, event);

            const config = {
                price: event.price,
                time: Date.now(),
                title: `Price: ${event.price}`,
                description: '',
                color: '#FF5722',
                backgroundColor: this.state.currentTheme.panel.backgroundColor,
                textColor: this.state.currentTheme.modal.textColor,
                fontSize: 12,
                padding: 8,
                arrowWidth: 6,
                borderRadius: 4,
                isPreview: false,
                showPrice: true
            };
            const mark = new PriceEventMark(config);
            chart.chartSeries!.series.attachPrimitive(mark);

            (this.priceEventMarkManager as any).priceEventMarks.push(mark);
            (this.priceEventMarkManager as any).priceToMarkMap.set(event.price, mark);
        });
    }

    public remove(price: number): void {
        if (this.priceEventMarkManager) {
            const mark = (this.priceEventMarkManager as any).priceToMarkMap.get(price);
            if (mark) {
                this.chartManager.getChart()?.chartSeries?.series.detachPrimitive(mark);
                (this.priceEventMarkManager as any).priceToMarkMap.delete(price);
                const index = (this.priceEventMarkManager as any).priceEventMarks.indexOf(mark);
                if (index > -1) {
                    (this.priceEventMarkManager as any).priceEventMarks.splice(index, 1);
                }
            }
        }
        this.dataManager.removePriceEvent(price);
    }

    public clearAll(): void {
        if (this.priceEventMarkManager) {
            (this.priceEventMarkManager as any).priceEventMarks.forEach((mark: any) => {
                this.chartManager.getChart()?.chartSeries?.series.detachPrimitive(mark);
            });
            (this.priceEventMarkManager as any).priceEventMarks = [];
            (this.priceEventMarkManager as any).priceToMarkMap.clear();
        }
        this.dataManager.clearPriceEvents();
    }

    public getAll(): PriceEvent[] {
        return this.dataManager.getPriceEvents();
    }
}