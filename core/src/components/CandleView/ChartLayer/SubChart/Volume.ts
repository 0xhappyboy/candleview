import { HistogramSeries, MouseEventParams } from "lightweight-charts";
import { IIndicator, IIndicatorInfo } from "../../Indicators/SubChart/IIndicator";
import { BaseChartPane } from "../Panes/BaseChartPane";
import { VolumeIndicator } from "../../Indicators/SubChart/VolumeIndicator";

export class Volume extends BaseChartPane {
    private seriesMap: { [key: string]: any } = {};
    private volumeIndicator: IIndicator | null = null;
    private currentValues: { [key: string]: number | null } = {};
    private _default: string = '#ff821cff';

    private volumeIndicatorInfo: IIndicatorInfo[] = [
        {
            paramName: 'VOLUME',
            paramValue: 0,
            lineColor: '',
            lineWidth: 1,
            data: [],
        }
    ];

    public init(chartData: any[], settings?: IIndicatorInfo[]): void {
        this.volumeIndicator = new VolumeIndicator();
        setTimeout(() => {
            this.createInfoElement();
            this.updateSettings(chartData, settings);
            this.updateData(chartData);
        }, 50)
    }

    updateSettings(chartData: any[], settings?: IIndicatorInfo[]): void {
        this.clearAllSeries();
        if (settings) {
            this.volumeIndicatorInfo.forEach(info => {
                settings?.forEach(s => {
                    if (info.paramName === s.paramName) {
                        s.data = info.data;
                    }
                })
            });
            this.volumeIndicatorInfo = settings;
        }
        this.updateInfoParams();
        if (this.chartInstance && this.volumeIndicatorInfo) {
            Object.keys(this.seriesMap).forEach(key => {
                this.chartInstance.removeSeries(this.seriesMap[key]);
            });
            this.seriesMap = {};
            this.updateData(chartData);
        }
    }

    public getParams(): IIndicatorInfo[] {
        return this.volumeIndicatorInfo;
    }

    private getCurrentValue(paramName: string): number | null {
        return this.currentValues[paramName] || null;
    }

    private updateInfoParams(): void {
        if (!this._infoElement) return;
        const paramsContainer = this._infoElement.querySelector('.params-container');
        if (!paramsContainer) return;
        paramsContainer.innerHTML = '';
        this.volumeIndicatorInfo.forEach(info => {
            const paramElement = document.createElement('span');
            paramElement.className = 'param-item';
            paramElement.style.cssText = `
                margin-left: 10px;
                color: ${info.lineColor || '#666666'};
                font-size: 11px;
            `;
            const currentValue = this.getCurrentValue(info.paramName);
            const displayValue = currentValue !== null ? currentValue.toFixed(0) : '--';
            paramElement.textContent = `${info.paramName}: ${displayValue}`;
            paramsContainer.appendChild(paramElement);
        });
    }

    protected getPriceScaleOptions(): any {
        return {
            scaleMargins: {
                top: 0.1,
                bottom: 0.1,
            },
            mode: 1,
            autoScale: true,
            borderVisible: true,
            entireTextOnly: false,
            crosshairMarkerVisible: false,
        };
    }

    updateData(chartData: any[]): void {
        if (!this.paneInstance || !this.volumeIndicator) return;
        const volumeCalData = this.volumeIndicator.calculate(this.volumeIndicatorInfo, chartData);
        volumeCalData.forEach(volume => {
            if (volume.data.length > 0) {
                const series = this.paneInstance.addSeries(HistogramSeries, {
                    color: volume.lineColor || this._default,
                    title: volume.paramName,
                    priceScaleId: this.getDefaultPriceScaleId(),
                    ...this.getPriceScaleOptions()
                });
                series.setData(volume.data);
                this.seriesMap[volume.paramName] = series;
            }
        });
    }

    public getSeries(): { [key: string]: any } {
        return this.seriesMap;
    }

    updateIndicatorSettings(settings: IIndicatorInfo): void {
    }

    getIndicatorSettings(): IIndicatorInfo | null {
        return this.volumeIndicatorInfo.length > 0 ? this.volumeIndicatorInfo[0] : null;
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