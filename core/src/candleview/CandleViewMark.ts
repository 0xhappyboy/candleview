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
    private storedMarks: IStaticMarkItem[] = [];

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

    public reapplyMarks(): void {
        if (this.storedMarks.length === 0) return;
        if (this.staticMarkManager) {
            this.staticMarkManager.clearAllMarks();
        }
        this.addStaticMarks(this.storedMarks, false);
    }

    public getStoredMarks(): IStaticMarkItem[] {
        return [...this.storedMarks];
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
        const markItem: IStaticMarkItem = {
            time: time,
            text: text,
            direction: direction,
            type: type,
            options: options
        };
        this.storedMarks.push(markItem);
        const markData: IStaticMarkData = {
            time: this.convertToChartTime(time),
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

    private convertToChartTime(timestamp: number): number {
        const timezone = this.state.currentTimezone;
        if (!timezone) {
            return timestamp;
        }
        const TIMEZONE_CONFIGS: Record<string, { offset: string }> = {
            'Asia/Shanghai': { offset: '+08:00' },
            'Asia/Tokyo': { offset: '+09:00' },
            'Asia/Seoul': { offset: '+09:00' },
            'Asia/Singapore': { offset: '+08:00' },
            'Asia/Hong_Kong': { offset: '+08:00' },
            'Europe/London': { offset: '+00:00' },
            'Europe/Berlin': { offset: '+01:00' },
            'Europe/Paris': { offset: '+01:00' },
            'America/New_York': { offset: '-05:00' },
            'America/Chicago': { offset: '-06:00' },
            'America/Denver': { offset: '-07:00' },
            'America/Los_Angeles': { offset: '-08:00' },
            'Australia/Sydney': { offset: '+11:00' },
            'Australia/Melbourne': { offset: '+11:00' },
            'Australia/Perth': { offset: '+08:00' },
            'UTC': { offset: '+00:00' }
        };
        const tzConfig = TIMEZONE_CONFIGS[timezone];
        if (!tzConfig) {
            return timestamp;
        }
        const offsetMatch = tzConfig.offset.match(/^([+-])(\d{2}):(\d{2})$/);
        if (!offsetMatch) {
            return timestamp;
        }
        const sign = offsetMatch[1];
        const hours = parseInt(offsetMatch[2], 10);
        const minutes = parseInt(offsetMatch[3], 10);
        let targetOffsetSeconds = hours * 3600 + minutes * 60;
        if (sign === '-') {
            targetOffsetSeconds = -targetOffsetSeconds;
        }
        const localDate = new Date(timestamp * 1000);
        const localOffsetMinutes = localDate.getTimezoneOffset();
        const localOffsetSeconds = -localOffsetMinutes * 60;
        const adjustmentSeconds = targetOffsetSeconds - localOffsetSeconds;
        return timestamp + adjustmentSeconds;
    }

    /**
     * Add multiple static marks in batch
     * @param marks Array of marks
     */
    public addStaticMarks(marks: IStaticMarkItem[], shouldStore: boolean = true): void {
        if (!this.ensureManager()) return;
        const chart = this.chartManager.getChart();
        if (!chart || !chart.chartSeries) return;
        if (shouldStore) {
            this.storedMarks.push(...marks);
        }
        const markDataList: IStaticMarkData[] = marks.map(mark => ({
            time: this.convertToChartTime(mark.time),
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
        this.storedMarks = [];
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
        this.storedMarks = [];
    }
}