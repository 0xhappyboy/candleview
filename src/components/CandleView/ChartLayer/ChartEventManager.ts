export class ChartEventManager {
    private chart: any = null;
    constructor(chart: any) {
        this.chart = chart;
    }
    public registerClickEvent(callback: (result: string) => void): void {
        this.chart.subscribeClick((param: any) => callback(param));
    }
}