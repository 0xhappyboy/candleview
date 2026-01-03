import { LineSeries, MouseEventParams } from "lightweight-charts";
import { IIndicator, IIndicatorInfo } from "../../Indicators/SubChart/IIndicator";
import { ATRIndicator } from "../../Indicators/SubChart/ATRIndicator";
import { BaseChartPane } from "../Panes/BaseChartPane";

export class ATR extends BaseChartPane {
    public seriesMap: { [key: string]: any } = {};
    private atrIndicator: IIndicator | null = null;
    private currentValues: { [key: string]: number | null } = {};

    private atrIndicatorInfo: IIndicatorInfo[] = [
        {
            paramName: 'ATR14',
            paramValue: 14,
            lineColor: '#FF6B6B',
            lineWidth: 1,
            data: [],
        },
        {
            paramName: 'ATR21',
            paramValue: 21,
            lineColor: '#4ECDC4',
            lineWidth: 1,
            data: [],
        },
        {
            paramName: 'ATR50',
            paramValue: 50,
            lineColor: '#45B7D1',
            lineWidth: 1,
            data: [],
        }
    ];

    public init(chartData: any[], settings?: IIndicatorInfo[]): void {
        this.atrIndicator = new ATRIndicator();
        setTimeout(() => {
            this.createInfoElement();
            this.updateSettings(chartData, settings);
            this.updateData(chartData);
        }, 50)
    }

    updateSettings(chartData: any[], settings?: IIndicatorInfo[]): void {
        this.clearAllSeries();
        if (settings) {
            this.atrIndicatorInfo.forEach(info => {
                settings?.forEach(s => {
                    if (info.paramName === s.paramName) {
                        s.data = info.data;
                    }
                })
            });
            this.atrIndicatorInfo = settings;
        }
        this.updateInfoParams();
        if (this.chartInstance && this.atrIndicator) {
            Object.keys(this.seriesMap).forEach(key => {
                this.chartInstance.removeSeries(this.seriesMap[key]);
            });
            this.seriesMap = {};
            this.updateData(chartData);
        }
    }

    public getParams(): IIndicatorInfo[] {
        return this.atrIndicatorInfo;
    }

    private getCurrentValue(paramName: string): number | null {
        return this.currentValues[paramName] || null;
    }

    private updateInfoParams(): void {
        if (!this._infoElement) return;
        const paramsContainer = this._infoElement.querySelector('.params-container');
        if (!paramsContainer) return;
        paramsContainer.innerHTML = '';
        this.atrIndicatorInfo.forEach(info => {
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
        if (!this.atrIndicator) return;
        const atrCalData = this.atrIndicator.calculate(this.atrIndicatorInfo, chartData);
        atrCalData.forEach(atr => {
            if (atr.data.length > 0) {
                const series = this.paneInstance.addSeries(LineSeries, {
                    color: atr.lineColor,
                    lineWidth: atr.lineWidth,
                    title: atr.paramName,
                    priceScaleId: this.getDefaultPriceScaleId(),
                    ...this.getPriceScaleOptions()
                });
                series.setData(atr.data);
                this.seriesMap[atr.paramName] = series;
            }
        })
    }

    public getSeries(): { [key: string]: any } {
        return this.seriesMap;
    }

    updateIndicatorSettings(settings: IIndicatorInfo): void {
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