import { LineSeries, MouseEventParams } from "lightweight-charts";
import { BaseChartPane } from "./BaseChartPane";
import { IIndicator, IIndicatorInfo } from "../Indicators/SubChart/IIndicator";
import { CCI } from "../Indicators/SubChart/CCI";

export class CCIPane extends BaseChartPane {
    public seriesMap: { [key: string]: any } = {};
    private cciIndicator: IIndicator | null = null;
    private currentValues: { [key: string]: number | null } = {};

    private cciIndicatorInfo: IIndicatorInfo[] = [
        {
            paramName: 'CCI',
            paramValue: 14,
            lineColor: '#FF6B6B',
            lineWidth: 1,
            data: [],
        }
    ];

    public init(chartData: any[], settings?: IIndicatorInfo[]): void {
        this.cciIndicator = new CCI();
        setTimeout(() => {
            this.createInfoElement();
            this.updateSettings(chartData, settings);
            this.updateData(chartData);
        }, 50)
    }

    updateSettings(chartData: any[], settings?: IIndicatorInfo[]): void {
        if (settings) {
            this.cciIndicatorInfo.forEach(info => {
                settings?.forEach(s => {
                    if (info.paramName === s.paramName) {
                        s.data = info.data;
                    }
                })
            });
            this.cciIndicatorInfo = settings;
        }
        this.updateInfoParams();
        this.updateData(chartData);
    }

    public getParams(): IIndicatorInfo[] {
        return this.cciIndicatorInfo;
    }

    private getCurrentValue(paramName: string): number | null {
        return this.currentValues[paramName] || null;
    }

    private updateInfoParams(): void {
        if (!this._infoElement) return;
        const paramsContainer = this._infoElement.querySelector('.params-container');
        if (!paramsContainer) return;
        paramsContainer.innerHTML = '';
        this.cciIndicatorInfo.forEach(info => {
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
            minimum: -200,
            maximum: 200,
            borderVisible: true,
            entireTextOnly: false,
            crosshairMarkerVisible: false,
        };
    }

    updateData(chartData: any[]): void {
        if (!this.paneInstance) return;
        if (!this.cciIndicator) return;
        const cciCalData = this.cciIndicator.calculate(this.cciIndicatorInfo, chartData);
        cciCalData.forEach(cci => {
            if (cci.data.length > 0) {
                const series = this.paneInstance.addSeries(LineSeries, {
                    color: cci.lineColor,
                    lineWidth: cci.lineWidth,
                    title: cci.paramName,
                    priceScaleId: this.getDefaultPriceScaleId(),
                    ...this.getPriceScaleOptions()
                });
                series.setData(cci.data);
                this.seriesMap[cci.paramName] = series;
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
}