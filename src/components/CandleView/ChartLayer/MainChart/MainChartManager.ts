import { ChartLayer } from "..";
import { ThemeConfig } from "../../Theme";
import { MainChartType } from "../../types";
import { IMainChart } from "./IMainChart";
import { Candlestick } from "./Candlestick";
import { Bar } from "./Bar";
import { Line } from "./Line";
import { Area } from "./Area";
import { StepLine } from "./StepLine";
import { BaseLine } from "./BaseLine";
import { Histogram } from "./Histogram";
import { HollowCandlestick } from "./HollowCandle";
import { HeikinAshi } from "./HeikinAshi";

export class MainChartManager {
    private currentChart: IMainChart | null = null;
    private currentType: MainChartType | null = null;
    private chartLayer: ChartLayer;
    private theme: ThemeConfig;

    constructor(chartLayer: ChartLayer, theme: ThemeConfig) {
        this.chartLayer = chartLayer;
        this.theme = theme;
    }

    public switchChartType(type: MainChartType): void {
        // 如果已经是当前类型，则不切换
        if (this.currentType === type && this.currentChart) {
            return;
        }

        // 销毁当前图表
        this.destroyCurrentChart();

        // 创建新的图表类型
        this.currentType = type;
        switch (type) {
            case MainChartType.Candle:
                this.currentChart = new Candlestick(this.chartLayer, this.theme);
                break;
            case MainChartType.HollowCandle:
                this.currentChart = new HollowCandlestick(this.chartLayer, this.theme);
                break;
            case MainChartType.Bar:
                this.currentChart = new Bar(this.chartLayer, this.theme);
                break;
            case MainChartType.Line:
                this.currentChart = new Line(this.chartLayer, this.theme);
                break;
            case MainChartType.Area:
                this.currentChart = new Area(this.chartLayer, this.theme);
                break;
            case MainChartType.StepLine:
                this.currentChart = new StepLine(this.chartLayer, this.theme);
                break;
            case MainChartType.BaseLine:
                this.currentChart = new BaseLine(this.chartLayer, this.theme);
                break;
            case MainChartType.Histogram:
                this.currentChart = new Histogram(this.chartLayer, this.theme);
                break;
            case MainChartType.HeikinAshi:
                this.currentChart = new HeikinAshi(this.chartLayer, this.theme);
                break;
            default:
                console.warn(`Unknown chart type: ${type}`);
                this.currentChart = new Candlestick(this.chartLayer, this.theme);
                break;
        }
    }

    public refreshData(): void {
        if (this.currentChart) {
            this.currentChart.refreshData(this.chartLayer);
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
            this.currentChart.destroy(this.chartLayer);
            this.currentChart = null;
        }
    }

    public destroy(): void {
        this.destroyCurrentChart();
        this.currentType = null;
    }
}