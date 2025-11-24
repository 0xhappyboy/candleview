import { LineSeries, MouseEventParams } from "lightweight-charts";
import { BaseChartPane } from "./BaseChartPane";
import { IIndicator, IIndicatorInfo } from "../Indicators/SubChart/IIndicator";
import { ADX } from "../Indicators/SubChart/ADX";

export class ADXPane extends BaseChartPane {
    private seriesMap: { [key: string]: any } = {};
    private adxIndicator: IIndicator | null = null;
    private currentValues: { [key: string]: number | null } = {};

    private adxIndicatorInfo: IIndicatorInfo[] = [
        {
            paramName: 'ADX',
            paramValue: 14,
            lineColor: '#FF6B6B',
            lineWidth: 1,
            data: [],
        },
        {
            paramName: '+DI',
            paramValue: 14,
            lineColor: '#4ECDC4',
            lineWidth: 1,
            data: [],
        },
        {
            paramName: '-DI',
            paramValue: 14,
            lineColor: '#45B7D1',
            lineWidth: 1,
            data: [],
        }
    ];

    public init(chartData: any[], settings?: IIndicatorInfo[]): void {
        this.adxIndicator = new ADX();
        setTimeout(() => {
            this.createInfoElement();
            this.updateSettings(chartData, settings);
            this.updateData(chartData);
        }, 50)
    }

    updateSettings(chartData: any[], settings?: IIndicatorInfo[]): void {
        if (settings) {
            this.adxIndicatorInfo.forEach(info => {
                settings?.forEach(s => {
                    if (info.paramName === s.paramName) {
                        s.data = info.data;
                    }
                })
            });
            this.adxIndicatorInfo = settings;
        }
        this.updateInfoParams();
    }

    private getCurrentValue(paramName: string): number | null {
        return this.currentValues[paramName] || null;
    }

    private updateInfoParams(): void {
        if (!this._infoElement) return;
        const paramsContainer = this._infoElement.querySelector('.params-container');
        if (!paramsContainer) return;
        paramsContainer.innerHTML = '';
        this.adxIndicatorInfo.forEach(info => {
            const paramElement = document.createElement('span');
            paramElement.className = 'param-item';
            paramElement.style.cssText = `
            margin-left: 10px;
            color: ${info.lineColor};
            font-size: 11px;
        `;
            const currentValue = this.getCurrentValue(info.paramName);
            const displayValue = currentValue !== null ? currentValue.toFixed(2) : '--';
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
            autoScale: false,
            minimum: 0,
            maximum: 100,
            borderVisible: true,
            entireTextOnly: false,
            crosshairMarkerVisible: false,
        };
    }

    updateData(chartData: any[]): void {
        if (!this.paneInstance) return;
        if (!this.adxIndicator) return;
        this.clearAllSeries();
        const adxCalData = this.adxIndicator.calculate(this.adxIndicatorInfo, chartData);
        adxCalData.forEach(adx => {
            if (adx.data.length > 0) {
                const series = this.paneInstance.addSeries(LineSeries, {
                    color: adx.lineColor,
                    lineWidth: adx.lineWidth,
                    title: adx.paramName,
                    priceScaleId: this.getDefaultPriceScaleId(),
                    ...this.getPriceScaleOptions()
                });
                series.setData(adx.data);
                this.seriesMap[adx.paramName] = series;
            }
        })
    }

    private clearAllSeries(): void {
        Object.values(this.seriesMap).forEach(series => {
            try {
                this.paneInstance.removeSeries(series);
            } catch (error) {
            }
        });
        this.seriesMap = {};
    }

    updateIndicatorSettings(settings: IIndicatorInfo): void {
    }

    getIndicatorSettings(): IIndicatorInfo | null {
        return null;
    }

    destroy(): void {
        this.clearAllSeries();
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
}