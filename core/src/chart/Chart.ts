import {
    createChart,
    IChartApi,
    ISeriesApi,
    CandlestickData,
    LineData,
    AreaData,
    BarData,
    HistogramData,
    BaselineData,
    Time,
    CandlestickSeries,
    LineSeries,
    AreaSeries,
    BarSeries,
    HistogramSeries,
    BaselineSeries,
    CandlestickSeriesOptions,
    LineSeriesOptions,
    AreaSeriesOptions,
    BarSeriesOptions,
    HistogramSeriesOptions,
    BaselineSeriesOptions
} from 'lightweight-charts';
import { ICandleViewDataPoint, MainChartType } from '../types';
import { Theme } from '../theme';

interface ChartOptions {
    container: HTMLElement;
    data: ICandleViewDataPoint[];
    theme: Theme;
    chartType: MainChartType;
    onReady?: () => void;
}

type SeriesType = ISeriesApi<"Candlestick"> |
    ISeriesApi<"Line"> |
    ISeriesApi<"Area"> |
    ISeriesApi<"Bar"> |
    ISeriesApi<"Histogram"> |
    ISeriesApi<"Baseline">;

export class Chart {
    private container: HTMLElement;
    private chart: IChartApi | null = null;
    private series: SeriesType | null = null;
    private data: ICandleViewDataPoint[];
    private theme: Theme;
    private chartType: MainChartType;
    private resizeObserver: ResizeObserver | null = null;

    constructor(options: ChartOptions) {
        this.container = options.container;
        this.data = options.data;
        this.theme = options.theme;
        this.chartType = options.chartType;
        this.init();
        options.onReady?.();
    }

    private init(): void {
        this.createChart();
        this.setupResizeObserver();
        this.render();
    }

    private createChart(): void {
        const colors = this.theme.getColors();
        const isDark = this.theme.isDark();
        this.chart = createChart(this.container, {
            width: this.container.clientWidth,
            height: this.container.clientHeight,
            layout: {
                background: { color: colors.background },
                textColor: colors.textColor,
                fontSize: 12,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                attributionLogo: false,
            },
            grid: {
                vertLines: {
                    color: colors.panelBorder + '30',
                    style: 1,
                    visible: true,
                },
                horzLines: {
                    color: colors.panelBorder + '30',
                    style: 1,
                    visible: true,
                },
            },
            crosshair: {
                mode: 0,
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: colors.panelBorder,
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            rightPriceScale: {
                borderColor: colors.panelBorder,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
                entireTextOnly: false,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
            },
            localization: {
                locale: 'zh-CN',
            },
        });
    }

    private setupResizeObserver(): void {
        this.resizeObserver = new ResizeObserver(() => {
            this.handleResize();
        });
        this.resizeObserver.observe(this.container);
    }

    public handleResize(): void {
        if (this.chart && this.container) {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            this.chart.applyOptions({ width, height });
        }
    }

    private convertToCandleData(): CandlestickData<Time>[] {
        return this.data.map(item => ({
            time: item.time as Time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
        }));
    }

    private convertToLineData(): LineData<Time>[] {
        return this.data.map(item => ({
            time: item.time as Time,
            value: item.close,
        }));
    }

    private convertToAreaData(): AreaData<Time>[] {
        return this.data.map(item => ({
            time: item.time as Time,
            value: item.close,
        }));
    }

    private convertToBarData(): BarData<Time>[] {
        return this.data.map(item => ({
            time: item.time as Time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
        }));
    }

    private convertToHistogramData(): HistogramData<Time>[] {
        const colors = this.theme.getColors();
        return this.data.map(item => ({
            time: item.time as Time,
            value: item.volume,
            color: item.close >= item.open ? colors.chartCandleUp : colors.chartCandleDown,
        }));
    }

    private convertToBaselineData(): BaselineData<Time>[] {
        return this.data.map(item => ({
            time: item.time as Time,
            value: item.close,
        }));
    }

    private calculateHeikinAshi(): CandlestickData<Time>[] {
        const result: CandlestickData<Time>[] = [];
        let prevHaClose = 0;

        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            const haOpen = i === 0 ? item.open : (prevHaClose + prevHaClose) / 2;
            const haClose = (item.open + item.high + item.low + item.close) / 4;
            const haHigh = Math.max(item.high, haOpen, haClose);
            const haLow = Math.min(item.low, haOpen, haClose);

            result.push({
                time: item.time as Time,
                open: haOpen,
                high: haHigh,
                low: haLow,
                close: haClose,
            });
            prevHaClose = haClose;
        }
        return result;
    }

    private createCandleSeries(): void {
        const colors = this.theme.getColors();
        this.series = this.chart?.addSeries(CandlestickSeries, {
            upColor: colors.chartCandleUp,
            downColor: colors.chartCandleDown,
            borderVisible: false,
            wickUpColor: colors.chartCandleUp,
            wickDownColor: colors.chartCandleDown,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        }) as ISeriesApi<"Candlestick"> ?? null;

        const data = this.convertToCandleData();
        if (data.length > 0 && this.series) {
            this.series.setData(data);
        }
    }

    private createLineSeries(): void {
        const colors = this.theme.getColors();
        this.series = this.chart?.addSeries(LineSeries, {
            color: colors.chartLine,
            lineWidth: 2,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
            crosshairMarkerVisible: false,
        }) as ISeriesApi<"Line"> ?? null;

        const data = this.convertToLineData();
        if (data.length > 0 && this.series) {
            this.series.setData(data);
        }
    }

    private createAreaSeries(): void {
        const colors = this.theme.getColors();
        this.series = this.chart?.addSeries(AreaSeries, {
            lineColor: colors.chartLine,
            lineWidth: 2,
            topColor: colors.chartAreaTop,
            bottomColor: colors.chartAreaBottom,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        }) as ISeriesApi<"Area"> ?? null;

        const data = this.convertToAreaData();
        if (data.length > 0 && this.series) {
            this.series.setData(data);
        }
    }

    private createBarSeries(): void {
        const colors = this.theme.getColors();
        this.series = this.chart?.addSeries(BarSeries, {
            upColor: colors.chartCandleUp,
            downColor: colors.chartCandleDown,
            thinBars: true,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        }) as ISeriesApi<"Bar"> ?? null;

        const data = this.convertToBarData();
        if (data.length > 0 && this.series) {
            this.series.setData(data);
        }
    }

    private createHollowCandleSeries(): void {
        const colors = this.theme.getColors();
        this.series = this.chart?.addSeries(CandlestickSeries, {
            upColor: 'transparent',
            downColor: colors.chartCandleDown,
            borderUpColor: colors.chartCandleUp,
            borderDownColor: colors.chartCandleDown,
            wickUpColor: colors.chartCandleUp,
            wickDownColor: colors.chartCandleDown,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        }) as ISeriesApi<"Candlestick"> ?? null;

        const data = this.convertToCandleData();
        if (data.length > 0 && this.series) {
            this.series.setData(data);
        }
    }

    private createHeikinAshiSeries(): void {
        const colors = this.theme.getColors();
        this.series = this.chart?.addSeries(CandlestickSeries, {
            upColor: colors.chartCandleUp,
            downColor: colors.chartCandleDown,
            borderVisible: false,
            wickUpColor: colors.chartCandleUp,
            wickDownColor: colors.chartCandleDown,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        }) as ISeriesApi<"Candlestick"> ?? null;

        const data = this.calculateHeikinAshi();
        if (data.length > 0 && this.series) {
            this.series.setData(data);
        }
    }

    private createStepLineSeries(): void {
        const colors = this.theme.getColors();
        this.series = this.chart?.addSeries(LineSeries, {
            color: colors.chartLine,
            lineWidth: 2,
            lineType: 1,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        }) as ISeriesApi<"Line"> ?? null;

        const data = this.convertToLineData();
        if (data.length > 0 && this.series) {
            this.series.setData(data);
        }
    }

    private createHistogramSeries(): void {
        const colors = this.theme.getColors();
        this.series = this.chart?.addSeries(HistogramSeries, {
            color: colors.chartLine,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        }) as ISeriesApi<"Histogram"> ?? null;

        const data = this.convertToHistogramData();
        if (data.length > 0 && this.series) {
            this.series.setData(data);
        }
    }

    private createBaselineSeries(): void {
        const colors = this.theme.getColors();
        this.series = this.chart?.addSeries(BaselineSeries, {
            baseValue: { type: 'price', price: 0 },
            topLineColor: colors.chartCandleUp,
            topFillColor1: colors.chartAreaTop,
            topFillColor2: colors.chartAreaBottom,
            bottomLineColor: colors.chartCandleDown,
            bottomFillColor1: colors.chartAreaBottom,
            bottomFillColor2: colors.chartAreaTop,
            priceLineVisible: true,
            lastValueVisible: true,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        }) as ISeriesApi<"Baseline"> ?? null;

        const data = this.convertToBaselineData();
        if (data.length > 0 && this.series) {
            this.series.setData(data);
        }
    }

    private switchSeries(): void {
        if (this.series && this.chart) {
            this.chart.removeSeries(this.series);
            this.series = null;
        }

        switch (this.chartType) {
            case MainChartType.Candle:
                this.createCandleSeries();
                break;
            case MainChartType.Line:
                this.createLineSeries();
                break;
            case MainChartType.Area:
                this.createAreaSeries();
                break;
            case MainChartType.Bar:
                this.createBarSeries();
                break;
            case MainChartType.HollowCandle:
                this.createHollowCandleSeries();
                break;
            case MainChartType.HeikinAshi:
                this.createHeikinAshiSeries();
                break;
            case MainChartType.StepLine:
                this.createStepLineSeries();
                break;
            case MainChartType.Histogram:
                this.createHistogramSeries();
                break;
            case MainChartType.BaselineArea:
                this.createBaselineSeries();
                break;
            default:
                this.createCandleSeries();
                break;
        }
    }

    private render(): void {
        if (!this.chart) return;
        if (this.data.length === 0) return;
        this.switchSeries();
        this.chart.timeScale().fitContent();
    }

    public updateData(data: ICandleViewDataPoint[]): void {
        this.data = data;
        this.render();
    }

    public updateTheme(theme: Theme): void {
        this.theme = theme;
        const colors = this.theme.getColors();

        this.chart?.applyOptions({
            layout: {
                background: { color: colors.background },
                textColor: colors.textColor,
            },
            grid: {
                vertLines: { color: colors.panelBorder + '30' },
                horzLines: { color: colors.panelBorder + '30' },
            },
            timeScale: {
                borderColor: colors.panelBorder,
            },
            rightPriceScale: {
                borderColor: colors.panelBorder,
            },
        });

        this.render();
    }

    public updateChartType(type: MainChartType): void {
        this.chartType = type;
        this.render();
    }

    public destroy(): void {
        this.resizeObserver?.disconnect();
        if (this.chart) {
            this.chart.remove();
            this.chart = null;
        }
    }
}