import { LineSeries } from "lightweight-charts";
import { BaseChartPane } from "./BaseChartPane";

interface RSIIndicatorParam {
    paramName: string;
    paramValue: number;
    lineColor: string;
    lineWidth: number;
}

interface RSIIndicatorInfo {
    id: string;
    params: RSIIndicatorParam[];
    nonce: number;
}

export class RSIPane extends BaseChartPane {

    private rsiIndicatorSetting: RSIIndicatorInfo = {
        id: Date.now().toString(),
        params: [
            {
                paramName: 'RSI6',
                paramValue: 6,
                lineColor: '#FF6B6B',
                lineWidth: 1
            },
            {
                paramName: 'RSI12',
                paramValue: 12,
                lineColor: '#4ECDC4',
                lineWidth: 1
            },
            {
                paramName: 'RSI24',
                paramValue: 24,
                lineColor: '#45B7D1',
                lineWidth: 1
            }
        ],
        nonce: Date.now()
    }

    private seriesMap: { [key: string]: any } = {};

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
        };
    }

    updateData(chartData: any[]): void {
        if (!this.paneInstance) return;
        this.clearAllSeries();
        const rsiDataSets = this.calculateMultipleRSI(chartData);
        this.rsiIndicatorSetting.params.forEach(param => {
            const rsiData = rsiDataSets[param.paramName];
            if (rsiData && rsiData.length > 0) {
                try {
                    const series = this.paneInstance.addSeries(LineSeries, {
                        color: param.lineColor,
                        lineWidth: param.lineWidth,
                        title: param.paramName,
                        priceScaleId: this.getDefaultPriceScaleId(),
                        ...this.getPriceScaleOptions()
                    });
                    series.setData(rsiData);
                    this.seriesMap[param.paramName] = series;
                } catch (error) {
                    console.error(`Error creating series for ${param.paramName}:`, error);
                }
            }
        });
    }

    private clearAllSeries(): void {
        Object.values(this.seriesMap).forEach(series => {
            try {
                this.paneInstance.removeSeries(series);
            } catch (error) {
                console.error('Error removing series:', error);
            }
        });
        this.seriesMap = {};
    }

    private calculateRSI(data: any[], period: number): any[] {
        if (data.length < period + 1) return [];
        const rsiData: { time: any; value: number; color?: string }[] = [];
        const gains: number[] = [];
        const losses: number[] = [];
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
        const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const firstRSI = 100 - (100 / (1 + firstRS));
        rsiData.push({
            time: data[period].time,
            value: firstRSI,
            ...(data[period].isVirtual && { color: 'transparent' })
        });
        for (let i = period; i < gains.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            rsiData.push({
                time: data[i + 1].time,
                value: rsi,
                ...(data[i + 1].isVirtual && { color: 'transparent' })
            });
        }
        return rsiData;
    }

    private calculateMultipleRSI(data: any[]): { [key: string]: any[] } {
        const result: { [key: string]: any[] } = {};
        this.rsiIndicatorSetting.params.forEach(param => {
            const rsiData = this.calculateRSI(data, param.paramValue);
            if (rsiData.length > 0) {
                result[param.paramName] = rsiData;
            }
        });
        return result;
    }

    calculateIndicatorData(chartData: any[]): any[] {
        if (!chartData || chartData.length === 0) return [];
        const rsiDataSets = this.calculateMultipleRSI(chartData);
        const firstParam = this.rsiIndicatorSetting.params[0];
        return rsiDataSets[firstParam.paramName] || [];
    }

    updateIndicatorSettings(settings: RSIIndicatorInfo): void {
        this.rsiIndicatorSetting = settings;
    }

    getIndicatorSettings(): RSIIndicatorInfo {
        return this.rsiIndicatorSetting;
    }

    destroy(): void {
        this.clearAllSeries();
    }
}