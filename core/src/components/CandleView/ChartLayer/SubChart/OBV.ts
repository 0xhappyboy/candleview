import { LineSeries, MouseEventParams } from "lightweight-charts";
import { IIndicator, IIndicatorInfo } from "../../Indicators/SubChart/IIndicator";
import { OBVIndicator } from "../../Indicators/SubChart/OBVIndicator";
import { BaseChartPane } from "../Panes/BaseChartPane";

export class OBV extends BaseChartPane {
    private seriesMap: { [key: string]: any } = {};
    private obvIndicator: IIndicator | null = null;
    private currentValues: { [key: string]: number | null } = {};

    private obvIndicatorInfo: IIndicatorInfo[] = [
        {
            paramName: 'OBV',
            paramValue: 0,
            lineColor: '#2962FF',
            lineWidth: 1,
            data: [],
        }
    ];

    public init(chartData: any[], settings?: IIndicatorInfo[]): void {
        this.obvIndicator = new OBVIndicator();
        setTimeout(() => {
            this.createInfoElement();
            this.updateSettings(chartData, settings);
            this.updateData(chartData);
        }, 50)
    }

    updateSettings(chartData: any[], settings?: IIndicatorInfo[]): void {
        if (settings) {
            this.obvIndicatorInfo.forEach(info => {
                settings?.forEach(s => {
                    if (info.paramName === s.paramName) {
                        s.data = info.data;
                    }
                })
            });
            this.obvIndicatorInfo = settings;
        }
        this.updateInfoParams();
        if (this.chartInstance && this.obvIndicator) {
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
        this.obvIndicatorInfo.forEach(info => {
            const paramElement = document.createElement('span');
            paramElement.className = 'param-item';
            paramElement.style.cssText = `
            margin-left: 10px;
            color: ${info.lineColor};
            font-size: 11px;
        `;
            const currentValue = this.getCurrentValue(info.paramName);
            const displayValue = currentValue !== null ? currentValue.toFixed(2) : '--';
            paramElement.textContent = `${info.paramName} ${displayValue}`;
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
        if (!this.obvIndicator) return;
        const obvCalData = this.obvIndicator.calculate(this.obvIndicatorInfo, chartData);
        obvCalData.forEach(obv => {
            if (obv.data.length > 0) {
                const series = this.paneInstance.addSeries(LineSeries, {
                    color: obv.lineColor,
                    lineWidth: obv.lineWidth,
                    title: obv.paramName,
                    priceScaleId: this.getDefaultPriceScaleId(),
                    ...this.getPriceScaleOptions()
                });
                series.setData(obv.data);
                this.seriesMap[obv.paramName] = series;
            }
        })
    }

    public getSeries(): { [key: string]: any } {
        return this.seriesMap;
    }

    updateIndicatorSettings(settings: IIndicatorInfo): void {
    }

    public getParams(): IIndicatorInfo[] {
        return this.obvIndicatorInfo;
    }

    getIndicatorSettings(): IIndicatorInfo | null {
        return this.obvIndicatorInfo.length > 0 ? this.obvIndicatorInfo[0] : null;
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

    protected calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map((item, index) => ({
            time: item.time,
            value: index * 1000 + Math.random() * 5000
        }));
    }
}