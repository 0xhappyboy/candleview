import { MouseEventParams } from "lightweight-charts";

export class ChartEventManager {
    private chart: any = null;
    constructor(chart: any) {
        this.chart = chart;
    }
    public registerClickEvent(callback: (event: MouseEventParams) => void): void {
        this.chart.subscribeClick((event: MouseEventParams) => callback(event));
    }
    public registerDblClickEvent(callback: (event: MouseEventParams) => void): void {
        this.chart.subscribeDblClick((event: MouseEventParams) => callback(event));
    }
    public registerCrosshairMoveEvent(callback: (event: MouseEventParams) => void): void {
        this.chart.subscribeCrosshairMove((event: MouseEventParams) => callback(event));
    }
    public registerVisibleTimeRangeChangeEvent(callback: (event: { from: number, to: number } | null) => void): void {
        this.chart.timeScale().subscribeVisibleTimeRangeChange((event: { from: number, to: number } | null) => callback(event));
    }
    public registerVisibleLogicalRangeChangeEvent(callback: (event: { from: number, to: number } | null) => void): void {
        this.chart.timeScale().subscribeVisibleLogicalRangeChange((event: { from: number, to: number } | null) => callback(event));
    }
}