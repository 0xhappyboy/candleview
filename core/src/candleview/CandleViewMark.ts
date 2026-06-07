import { CoreState } from './types';
import { CandleViewChart } from './CandleViewChart';
import { StaticMarkManager, IStaticMarkData } from '../MarkManager/StaticMarkManager';
import { StaticMarkDirection, StaticMarkType } from '../types';

export interface IStaticMarkOptions {
    textColor?: string;
    backgroundColor?: string;
    isCircular?: boolean;
    fontSize?: number;
    padding?: number;
    label?: string;
}

export interface IStaticMarkItem {
    time: number;
    text: string;
    direction: StaticMarkDirection;
    type: StaticMarkType;
    options?: IStaticMarkOptions;
}

export class CandleViewMark {
    private state: CoreState;
    private chartManager: CandleViewChart;
    private staticMarkManager: StaticMarkManager | null = null;

    constructor(state: CoreState, chartManager: CandleViewChart) {
        this.state = state;
        this.chartManager = chartManager;
    }

    private initStaticMarkManager(): void {
        const chart = this.chartManager.getChart();
        if (!chart || !chart.chartSeries) {
            console.warn('[CandleView] Chart not ready for static marks');
            return;
        }
        this.staticMarkManager = new StaticMarkManager();
    }

    private ensureManager(): boolean {
        const chart = this.chartManager.getChart();
        if (!chart || !chart.chartSeries) {
            console.warn('[CandleView] Chart not ready for static marks');
            return false;
        }

        if (!this.staticMarkManager) {
            this.initStaticMarkManager();
        }

        if (!this.staticMarkManager) {
            console.error('[CandleView] Failed to initialize StaticMarkManager');
            return false;
        }

        return true;
    }

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
        if (!this.ensureManager()) return;

        const chart = this.chartManager.getChart();
        if (!chart || !chart.chartSeries) return;

        const markData: IStaticMarkData = {
            time: time,
            type: type,
            data: [{
                direction: direction,
                text: text,
                textColor: options?.textColor,
                backgroundColor: options?.backgroundColor,
                isCircular: options?.isCircular,
                fontSize: options?.fontSize,
                padding: options?.padding
            }]
        };

        this.staticMarkManager!.addMark([markData], chart.chartSeries);
    }

    /**
     * Add multiple static marks in batch
     * @param marks Array of marks
     */
    public addStaticMarks(marks: IStaticMarkItem[]): void {
        if (!this.ensureManager()) return;

        const chart = this.chartManager.getChart();
        if (!chart || !chart.chartSeries) return;

        const markDataList: IStaticMarkData[] = marks.map(mark => ({
            time: mark.time,
            type: mark.type,
            data: [{
                direction: mark.direction,
                text: mark.text,
                textColor: mark.options?.textColor,
                backgroundColor: mark.options?.backgroundColor,
                isCircular: mark.options?.isCircular,
                fontSize: mark.options?.fontSize,
                padding: mark.options?.padding
            }]
        }));

        this.staticMarkManager!.addMark(markDataList, chart.chartSeries);
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
        this.addStaticMark(time, text, direction, StaticMarkType.Text, options);
    }

    /**
     * Add an arrow mark (convenience method)
     * @param time Timestamp
     * @param direction Mark direction
     * @param options Optional configuration (label is used as additional identifier for arrow marks)
     */
    public addArrowMark(
        time: number,
        direction: StaticMarkDirection,
        options?: IStaticMarkOptions & { label?: string }
    ): void {
        const label = options?.label || '';
        this.addStaticMark(time, label, direction, StaticMarkType.Arrow, options);
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
        this.addStaticMarks(marks.map(m => ({
            time: m.time,
            text: m.text,
            direction: m.direction,
            type: StaticMarkType.Text,
            options: m.options
        })));
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
        this.addStaticMarks(marks.map(m => ({
            time: m.time,
            text: m.options?.label || '',
            direction: m.direction,
            type: StaticMarkType.Arrow,
            options: m.options
        })));
    }

    /**
     * Clear all static marks
     */
    public clearAllStaticMarks(): void {
        if (this.staticMarkManager) {
            this.staticMarkManager.clearAllMarks();
        }
    }

    /**
     * Get the count of static marks
     */
    public getStaticMarkCount(): number {
        return this.staticMarkManager?.getMarkCount() || 0;
    }

    /**
     * Refresh marks (call when chart data changes)
     */
    public refreshMarks(): void {
        if (this.staticMarkManager) {
            this.staticMarkManager.recalculateMarks();
        }
    }

    /**
     * Destroy the mark manager
     */
    public destroy(): void {
        if (this.staticMarkManager) {
            this.staticMarkManager.destroy();
            this.staticMarkManager = null;
        }
    }
}