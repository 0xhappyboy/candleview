import { ThemeConfig } from "../../theme";
import { MainChartType } from "../../types";
import { Chart } from "../Chart";
import { Area } from "./Area";
import { Bar } from "./Bar";
import { BaseLine } from "./BaseLine";
import { BaseLineArea } from "./BaselineArea";
import { Candlestick } from "./Candlestick";
import { HeikinAshi } from "./HeikinAshi";
import { HighLow } from "./HighLow";
import { Histogram } from "./Histogram";
import { HLCArea } from "./HLCArea";
import { HollowCandlestick } from "./HollowCandle";
import { IMainChart } from "./IMainChart";
import { Line } from "./Line";
import { LineBreak } from "./LineBreak";
import { Mountain } from "./Mountain";
import { StepLine } from "./StepLine";

export class MainChartManager {
    private currentChart: IMainChart | null = null;
    private currentType: MainChartType | null = null;
    private chart: Chart;
    private theme: ThemeConfig;

    constructor(chart: Chart, theme: ThemeConfig) {
        this.chart = chart;
        this.theme = theme;
    }

    public switchChartType(type: MainChartType): void {
        if (this.currentType === type && this.currentChart) {
            return;
        }
        this.destroyCurrentChart();
        this.currentType = type;
        switch (type) {
            case MainChartType.Candle:
                this.currentChart = new Candlestick(this.chart, this.theme);
                break;
            case MainChartType.HollowCandle:
                this.currentChart = new HollowCandlestick(this.chart, this.theme);
                break;
            case MainChartType.Bar:
                this.currentChart = new Bar(this.chart, this.theme);
                break;
            case MainChartType.Line:
                this.currentChart = new Line(this.chart, this.theme);
                break;
            case MainChartType.Area:
                this.currentChart = new Area(this.chart, this.theme);
                break;
            case MainChartType.StepLine:
                this.currentChart = new StepLine(this.chart, this.theme);
                break;
            case MainChartType.BaseLine:
                this.currentChart = new BaseLine(this.chart, this.theme);
                break;
            case MainChartType.Histogram:
                this.currentChart = new Histogram(this.chart, this.theme);
                break;
            case MainChartType.HeikinAshi:
                this.currentChart = new HeikinAshi(this.chart, this.theme);
                break;
            case MainChartType.LineBreak:
                this.currentChart = new LineBreak(this.chart, this.theme);
                break;
            case MainChartType.Mountain:
                this.currentChart = new Mountain(this.chart, this.theme);
                break;
            case MainChartType.BaselineArea:
                this.currentChart = new BaseLineArea(this.chart, this.theme);
                break;
            case MainChartType.HighLow:
                this.currentChart = new HighLow(this.chart, this.theme);
                break;
            case MainChartType.HLCArea:
                this.currentChart = new HLCArea(this.chart, this.theme);
                break;
            default:
                console.warn(`Unknown chart type: ${type}`);
                this.currentChart = new Candlestick(this.chart, this.theme);
                break;
        }
    }

    public refreshData(): void {
        if (this.currentChart) {
            this.currentChart.refreshData(this.chart);
        }
    }

    public updateStyle(options: any): void {
        if (this.currentChart) {
            this.currentChart.updateStyle(options);
        }
    }

    public getCurrentSeries(): any {
        return this.currentChart ? this.currentChart.getSeries() : null;
    }

    public getCurrentType(): MainChartType | null {
        return this.currentType;
    }

    private destroyCurrentChart(): void {
        if (this.currentChart) {
            this.currentChart.destroy(this.chart);
            this.currentChart = null;
        }
    }

    public updateTheme(theme: ThemeConfig): void {
        this.theme = theme;
        if (this.currentChart && 'updateTheme' in this.currentChart) {
            (this.currentChart as any).updateTheme?.(theme);
        }
        if (this.currentChart) {
            this.currentChart.refreshData(this.chart);
        }
    }

    public destroy(): void {
        this.destroyCurrentChart();
        this.currentType = null;
    }
}