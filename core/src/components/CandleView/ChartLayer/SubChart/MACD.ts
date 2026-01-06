import { HistogramSeries, LineSeries, MouseEventParams } from "lightweight-charts";
import { IIndicator, IIndicatorInfo } from "../../Indicators/SubChart/IIndicator";
import { MACDIndicator } from "../../Indicators/SubChart/MACDIndicator";
import { BaseChartPane } from "../Panes/BaseChartPane";

export class MACD extends BaseChartPane {
    private seriesMap: { [key: string]: any } = {};
    private macdIndicator: IIndicator | null = null;
    private currentValues: { [key: string]: number | null } = {};

    private macdIndicatorInfo: IIndicatorInfo[] = [
        {
            paramName: 'DIF',
            paramValue: 12,
            lineColor: '#FF6B6B',
            lineWidth: 1,
            data: [],
        },
        {
            paramName: 'DEA',
            paramValue: 26,
            lineColor: '#4ECDC4',
            lineWidth: 1,
            data: [],
        },
        {
            paramName: 'MACD',
            paramValue: 9,
            lineColor: '#45B7D1',
            lineWidth: 1,
            data: [],
        }
    ];

    public init(chartData: any[], settings?: IIndicatorInfo[]): void {
        this.macdIndicator = new MACDIndicator();
        setTimeout(() => {
            this.createInfoElement();
            this.updateSettings(chartData, settings);
            this.updateData(chartData);
        }, 50)
    }

    updateSettings(chartData: any[], settings?: IIndicatorInfo[]): void {
        this.clearAllSeries();
        if (settings) {
            this.macdIndicatorInfo.forEach(info => {
                settings?.forEach(s => {
                    if (info.paramName === s.paramName) {
                        s.data = info.data;
                    }
                })
            });
            this.macdIndicatorInfo = settings;
        }
        this.updateInfoParams();
        if (this.chartInstance && this.macdIndicator) {
            Object.keys(this.seriesMap).forEach(key => {
                this.chartInstance.removeSeries(this.seriesMap[key]);
            });
            this.seriesMap = {};
            this.updateData(chartData);
        }
    }

    private getCurrentValue(paramName: string): number | null {
        return this.currentValues[paramName] || null;
    }

    private updateInfoParams(): void {
        if (!this._infoElement) return;
        const paramsContainer = this._infoElement.querySelector('.params-container');
        if (!paramsContainer) return;
        paramsContainer.innerHTML = '';
        this.macdIndicatorInfo.forEach(info => {
            const paramElement = document.createElement('span');
            paramElement.className = 'param-item';
            paramElement.style.cssText = `
            margin-left: 10px;
            color: ${info.lineColor};
            font-size: 11px;
        `;
            const currentValue = this.getCurrentValue(info.paramName);
            const displayValue = currentValue !== null ? currentValue.toFixed(4) : '--';
            paramElement.textContent = `${info.paramName}(${info.paramValue}) ${displayValue}`;
            paramsContainer.appendChild(paramElement);
        });
    }

    protected getPriceScaleOptions(): any {
        return {
            scaleMargins: {
                top: 0.1,
                bottom: 0.1,
            },
            mode: 2,
            autoScale: true,
            borderVisible: true,
            entireTextOnly: false,
            crosshairMarkerVisible: false,
        };
    }

    updateData(chartData: any[]): void {
        if (!this.paneInstance) return;
        if (!this.macdIndicator) return;
        const macdCalData = this.macdIndicator.calculate(this.macdIndicatorInfo, chartData);
        try {
            macdCalData.forEach(macd => {
                if (macd.data.length > 0) {
                    if (macd.paramName === 'MACD') {
                        const barSeries = this.paneInstance.addSeries(HistogramSeries, {
                            upColor: macd.lineColor,
                            downColor: '#FF6B6B',
                            lineWidth: 1,
                            title: macd.paramName,
                            priceScaleId: this.getDefaultPriceScaleId(),
                            ...this.getPriceScaleOptions()
                        });
                        const barData = macd.data.map(d => ({
                            time: d.time,
                            value: d.value,
                            color: d.value >= 0 ? macd.lineColor : '#FF6B6B'
                        }));
                        barSeries.setData(barData);
                        this.seriesMap[macd.paramName] = barSeries;
                    }
                    else {
                        const series = this.paneInstance.addSeries(LineSeries, {
                            color: macd.lineColor,
                            lineWidth: macd.lineWidth,
                            title: macd.paramName,
                            priceScaleId: this.getDefaultPriceScaleId(),
                            ...this.getPriceScaleOptions()
                        });
                        series.setData(macd.data);
                        this.seriesMap[macd.paramName] = series;
                    }
                }
            })
        } catch (e) { }
    }

    public getSeries(): { [key: string]: any } {
        return this.seriesMap;
    }

    updateIndicatorSettings(settings: IIndicatorInfo): void {
    }

    public getParams(): IIndicatorInfo[] {
        return this.macdIndicatorInfo;
    }

    getIndicatorSettings(): IIndicatorInfo | null {
        return null;
    }

    destroy(): void {
    }

    public handleCrosshairMoveEvent(event: MouseEventParams): void {
        if (!event.time || !this.seriesMap) return;
        Object.keys(this.seriesMap).forEach(paramName => {
            const series = this.seriesMap[paramName];
            const priceData = event.seriesData?.get(series);
            if (priceData && typeof priceData === 'object' && 'value' in priceData) {
                const value = (priceData as any).value;
                this.currentValues[paramName] = value;
                this.updateInfoParams();
            }
        });
    }

    private clearAllSeries(): void {
        this.paneInstance.getSeries().forEach((v: any, k: string) => {
            this.chartInstance.removeSeries(v);
        });
        this.seriesMap = {};
        this.currentValues = {};
    }
}