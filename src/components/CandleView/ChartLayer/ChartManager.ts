import { createChart } from "lightweight-charts";
import { ThemeConfig } from "../Theme";
import { ChartSeries } from "./ChartTypeManager";
export class ChartManager {
    private chart: any;
    private series: ChartSeries | null = null;
    private locale: 'en' | 'zh-cn';

    constructor(
        container: string | HTMLElement,
        width: number,
        height: number,
        theme: ThemeConfig,
        locale: 'en' | 'zh-cn' = 'en'
    ) {
        this.locale = locale;
        this.chart = createChart(container, {
            width: width,
            height: height,
            layout: theme.layout,
            grid: {
                vertLines: {
                    color: theme.grid.vertLines.color + '30',
                    style: 1,
                    visible: true,
                },
                horzLines: {
                    color: theme.grid.horzLines.color + '30',
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
                borderColor: theme.grid.vertLines.color,
            },
            rightPriceScale: {
                borderColor: theme.grid.horzLines.color,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
                entireTextOnly: false,
            },
            handleScale: {
                axisPressedMouseMove: true,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
            },
            localization: {
                locale: this.locale,
            },
        });
    }

    public getChart(): any {
        return this.chart;
    }

    public getSeries(): ChartSeries | null {
        return this.series;
    }

    public getLocale(): 'en' | 'zh-cn' {
        return this.locale;
    }
}