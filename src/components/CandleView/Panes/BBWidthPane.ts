import { LineSeries, MouseEventParams } from "lightweight-charts";
import { BaseChartPane } from "./BaseChartPane";
import { IIndicator, IIndicatorInfo } from "../Indicators/SubChart/IIndicator";
import { BBWidth } from "../Indicators/SubChart/BBWidth";

export class BBWidthPane extends BaseChartPane {
    private seriesMap: { [key: string]: any } = {};
    private bbWidthIndicator: IIndicator | null = null;
    private currentValues: { [key: string]: number | null } = {};

    private bbWidthIndicatorInfo: IIndicatorInfo[] = [
        {
            paramName: 'BBWidth',
            paramValue: 20,
            lineColor: '#FF6B6B',
            lineWidth: 1,
            data: [],
        }
    ];

    public init(chartData: any[], settings?: IIndicatorInfo[]): void {
        this.bbWidthIndicator = new BBWidth();
        setTimeout(() => {
            this.createInfoElement();
            this.updateSettings(chartData, settings);
            this.updateData(chartData);
        }, 50)
    }

    updateSettings(chartData: any[], settings?: IIndicatorInfo[]): void {
        if (settings) {
            this.bbWidthIndicatorInfo.forEach(info => {
                settings?.forEach(s => {
                    if (info.paramName === s.paramName) {
                        s.data = info.data;
                    }
                })
            });
            this.bbWidthIndicatorInfo = settings;
        }
        this.updateInfoParams();
        this.updateData(chartData);
    }

    private getCurrentValue(paramName: string): number | null {
        return this.currentValues[paramName] || null;
    }

    private updateInfoParams(): void {
        if (!this._infoElement) return;
        const paramsContainer = this._infoElement.querySelector('.params-container');
        if (!paramsContainer) return;
        paramsContainer.innerHTML = '';
        this.bbWidthIndicatorInfo.forEach(info => {
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

    public getParams(): IIndicatorInfo[] {
        return this.bbWidthIndicatorInfo;
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
        if (!this.bbWidthIndicator) return;
        this.clearAllSeries();
        const bbWidthCalData = this.bbWidthIndicator.calculate(this.bbWidthIndicatorInfo, chartData);
        bbWidthCalData.forEach(bbWidth => {
            if (bbWidth.data.length > 0) {
                const series = this.paneInstance.addSeries(LineSeries, {
                    color: bbWidth.lineColor,
                    lineWidth: bbWidth.lineWidth,
                    title: bbWidth.paramName,
                    priceScaleId: this.getDefaultPriceScaleId(),
                    ...this.getPriceScaleOptions()
                });
                series.setData(bbWidth.data);
                this.seriesMap[bbWidth.paramName] = series;
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

        const index = this.bbWidthIndicatorInfo.findIndex(info => info.paramName === settings.paramName);
        if (index !== -1) {
            this.bbWidthIndicatorInfo[index] = { ...this.bbWidthIndicatorInfo[index], ...settings };
        }
    }

    getIndicatorSettings(): IIndicatorInfo | null {
        return this.bbWidthIndicatorInfo.length > 0 ? this.bbWidthIndicatorInfo[0] : null;
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


    protected calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map((item, index) => ({
            time: item.time,
            value: Math.sin(index * 0.06) * 2 + 3
        }));
    }
}