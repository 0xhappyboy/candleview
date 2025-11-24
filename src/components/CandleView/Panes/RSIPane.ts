import { LineSeries } from "lightweight-charts";
import { BaseChartPane } from "./BaseChartPane";
import { IIndicator, IIndicatorInfo } from "../Indicators/SubChart/IIndicator";
import { RSI } from "../Indicators/SubChart/RSI";

export class RSIPane extends BaseChartPane {

    private seriesMap: { [key: string]: any } = {};
    private rsiIndicator: IIndicator | null = null;

    private rsiIndicatorInfo: IIndicatorInfo[] = [
        {
            paramName: 'RSI6',
            paramValue: 6,
            lineColor: '#FF6B6B',
            lineWidth: 1,
            data: [],
        },
        {
            paramName: 'RSI12',
            paramValue: 12,
            lineColor: '#4ECDC4',
            lineWidth: 1,
            data: [],
        },
        {
            paramName: 'RSI24',
            paramValue: 24,
            lineColor: '#45B7D1',
            lineWidth: 1,
            data: [],
        }
    ];


    public init(chartData: any[], settings?: IIndicatorInfo[]): void {
        this.rsiIndicator = new RSI();
        setTimeout(() => {
            this.createInfoElement();
            this.updateSettings(chartData, settings);
            this.updateData(chartData);
        }, 50)
    }

    updateSettings(chartData: any[], settings?: IIndicatorInfo[]): void {
        if (settings) {
            this.rsiIndicatorInfo.forEach(info => {
                settings?.forEach(s => {
                    if (info.paramName === s.paramName) {
                        s.data = info.data;
                    }
                })
            });
            this.rsiIndicatorInfo = settings;
        }
        this.updateInfoParams();
    }

    private updateInfoParams(): void {
        if (!this._infoElement) return;
        const paramsContainer = this._infoElement.querySelector('.params-container');
        if (!paramsContainer) return;
        paramsContainer.innerHTML = '';
        this.rsiIndicatorInfo.forEach(info => {
            const paramElement = document.createElement('span');
            paramElement.className = 'param-item';
            paramElement.style.cssText = `
                margin-left: 10px;
                color: ${info.lineColor};
                font-size: 11px;
            `;
            paramElement.textContent = `${info.paramName}(${info.paramValue}) 156198498`;
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
        if (!this.rsiIndicator) return;
        this.clearAllSeries();
        const sriCalData = this.rsiIndicator.calculate(this.rsiIndicatorInfo, chartData);
        sriCalData.forEach(rsi => {
            if (rsi.data.length > 0) {
                const series = this.paneInstance.addSeries(LineSeries, {
                    color: rsi.lineColor,
                    lineWidth: rsi.lineWidth,
                    title: rsi.paramName,
                    priceScaleId: this.getDefaultPriceScaleId(),
                    ...this.getPriceScaleOptions()
                });
                series.setData(rsi.data);
                this.seriesMap[rsi.paramName] = series;
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
}