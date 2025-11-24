import { HistogramSeries, MouseEventParams } from "lightweight-charts";
import { BaseChartPane } from "./BaseChartPane";
import { IIndicator, IIndicatorInfo } from "../Indicators/SubChart/IIndicator";

export class VolumePane extends BaseChartPane {
    private seriesMap: { [key: string]: any } = {};
    private currentValues: { [key: string]: number | null } = {};

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
        setTimeout(() => {
            this.createInfoElement();
            this.updateSettings(chartData, settings);
            this.updateData(chartData);
        }, 50)
    }

    updateSettings(chartData: any[], settings?: IIndicatorInfo[]): void {
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
        if (!this.paneInstance) return;
        this.clearAllSeries();
        
        const volumeData = this.calculateIndicatorData(chartData);
        
        if (volumeData.length > 0) {
            const series = this.paneInstance.addSeries(HistogramSeries, {
                color: '#888888',
                title: 'VOLUME',
                priceScaleId: this.getDefaultPriceScaleId(),
                ...this.getPriceScaleOptions()
            });
            series.setData(volumeData);
            this.seriesMap['VOLUME'] = series;
            
            // 更新指标信息数据
            this.volumeIndicatorInfo[0].data = volumeData;
        }
    }

    private clearAllSeries(): void {
        Object.values(this.seriesMap).forEach(series => {
            try {
                this.paneInstance.removeSeries(series);
            } catch (error) {
                // 忽略移除系列时的错误
            }
        });
        this.seriesMap = {};
    }

    protected calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map(item => ({
            time: item.time,
            value: item.volume || 0,
            color: item.close >= item.open ? 'rgba(38, 166, 154, 0.8)' : 'rgba(239, 83, 80, 0.8)'
        }));
    }

    updateIndicatorSettings(settings: IIndicatorInfo): void {
        // 可以在这里实现成交量指标的特殊设置逻辑
    }

    getIndicatorSettings(): IIndicatorInfo | null {
        return this.volumeIndicatorInfo.length > 0 ? this.volumeIndicatorInfo[0] : null;
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