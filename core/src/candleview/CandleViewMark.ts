import { CandleViewChart } from './CandleViewChart';
import { StaticMarkManager, IStaticMarkData } from '../MarkManager/StaticMarkManager';
import { StaticMarkDirection, StaticMarkType, TimezoneEnum } from '../types';

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
    private chartManager: CandleViewChart;
    private staticMarkManager: StaticMarkManager | null = null;
    private storedMarks: IStaticMarkItem[] = [];
    private timezone: TimezoneEnum = TimezoneEnum.NEW_YORK;
    constructor(chartManager: CandleViewChart) {
        this.chartManager = chartManager;
    }
    public setTimezone(timezone: TimezoneEnum): void {
        this.timezone = timezone;
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
        return !!this.staticMarkManager;
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
    private convertToChartTime(timestamp: number): number {
        const TIMEZONE_OFFSETS: Record<TimezoneEnum, number> = {
            [TimezoneEnum.NEW_YORK]: -18000,
            [TimezoneEnum.CHICAGO]: -21600,
            [TimezoneEnum.DENVER]: -25200,
            [TimezoneEnum.LOS_ANGELES]: -28800,
            [TimezoneEnum.TORONTO]: -18000,
            [TimezoneEnum.LONDON]: 0,
            [TimezoneEnum.PARIS]: 3600,
            [TimezoneEnum.FRANKFURT]: 3600,
            [TimezoneEnum.ZURICH]: 3600,
            [TimezoneEnum.MOSCOW]: 10800,
            [TimezoneEnum.DUBAI]: 14400,
            [TimezoneEnum.KARACHI]: 18000,
            [TimezoneEnum.KOLKATA]: 19800,
            [TimezoneEnum.SHANGHAI]: 28800,
            [TimezoneEnum.HONG_KONG]: 28800,
            [TimezoneEnum.SINGAPORE]: 28800,
            [TimezoneEnum.TOKYO]: 32400,
            [TimezoneEnum.SEOUL]: 32400,
            [TimezoneEnum.SYDNEY]: 39600,
            [TimezoneEnum.AUCKLAND]: 43200,
            [TimezoneEnum.UTC]: 0
        };
        const targetOffset = TIMEZONE_OFFSETS[this.timezone] || 0;
        const localOffset = -new Date().getTimezoneOffset() * 60;
        return timestamp + (targetOffset - localOffset);
    }
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
        const markItem: IStaticMarkItem = { time, text, direction, type, options };
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
    public addTextMark(
        time: number,
        text: string,
        direction: StaticMarkDirection,
        options?: IStaticMarkOptions
    ): void {
        this.addStaticMark(time, text, direction, StaticMarkType.Text, options);
    }
    public addArrowMark(
        time: number,
        direction: StaticMarkDirection,
        options?: IStaticMarkOptions & { label?: string }
    ): void {
        const label = options?.label || '';
        this.addStaticMark(time, label, direction, StaticMarkType.Arrow, options);
    }
    public addTextMarks(
        marks: Array<{ time: number; text: string; direction: StaticMarkDirection; options?: IStaticMarkOptions }>
    ): void {
        this.addStaticMarks(marks.map(m => ({
            time: m.time,
            text: m.text,
            direction: m.direction,
            type: StaticMarkType.Text,
            options: m.options
        })));
    }
    public addArrowMarks(
        marks: Array<{ time: number; direction: StaticMarkDirection; options?: IStaticMarkOptions & { label?: string } }>
    ): void {
        this.addStaticMarks(marks.map(m => ({
            time: m.time,
            text: m.options?.label || '',
            direction: m.direction,
            type: StaticMarkType.Arrow,
            options: m.options
        })));
    }
    public clearAllStaticMarks(): void {
        if (this.staticMarkManager) {
            this.staticMarkManager.clearAllMarks();
        }
        this.storedMarks = [];
    }
    public getStaticMarkCount(): number {
        return this.staticMarkManager?.getMarkCount() || 0;
    }
    public refreshMarks(): void {
        this.staticMarkManager?.recalculateMarks();
    }
    public destroy(): void {
        if (this.staticMarkManager) {
            this.staticMarkManager.destroy();
            this.staticMarkManager = null;
        }
        this.storedMarks = [];
    }
}