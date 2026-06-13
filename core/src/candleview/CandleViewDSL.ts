import { CandleView } from './CandleView';
import { MainChartIndicatorType, StaticMarkDirection, SubChartIndicatorType } from '../types';

export class CandleViewDSL {
    private chart: CandleView;
    private newCandleCallbacks: Array<() => void> = [];

    constructor(chart: CandleView) {
        this.chart = chart;
    }

    getClose(): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.close ?? 0;
    }

    getOpen(): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.open ?? 0;
    }

    getHigh(): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.high ?? 0;
    }

    getLow(): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.low ?? 0;
    }

    getVolume(): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.volume ?? 0;
    }

    getTime(): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.time ?? 0;
    }

    getCloseAt(offset: number): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        const index = displayData.length - 1 - offset;
        if (index < 0 || index >= displayData.length) return 0;
        return displayData[index]?.close ?? 0;
    }

    getOpenAt(offset: number): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        const index = displayData.length - 1 - offset;
        if (index < 0 || index >= displayData.length) return 0;
        return displayData[index]?.open ?? 0;
    }

    getHighAt(offset: number): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        const index = displayData.length - 1 - offset;
        if (index < 0 || index >= displayData.length) return 0;
        return displayData[index]?.high ?? 0;
    }

    getLowAt(offset: number): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        const index = displayData.length - 1 - offset;
        if (index < 0 || index >= displayData.length) return 0;
        return displayData[index]?.low ?? 0;
    }

    getVolumeAt(offset: number): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        const index = displayData.length - 1 - offset;
        if (index < 0 || index >= displayData.length) return 0;
        return displayData[index]?.volume ?? 0;
    }

    getBarCount(): number {
        const displayData = (this.chart as any).dataManager?.getPreprocessedData().displayData;
        return displayData?.length || 0;
    }

    SMA(source: number[], period: number): number {
        if (!source || source.length < period) return 0;
        const sum = source.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }

    EMA(source: number[], period: number): number {
        if (!source || source.length === 0) return 0;
        const multiplier = 2 / (period + 1);
        let ema = source[0];
        for (let i = 1; i < source.length; i++) {
            ema = (source[i] - ema) * multiplier + ema;
        }
        return ema;
    }

    RSI(period: number = 14): number {
        const chart = (this.chart as any).candleViewChart?.getChart();
        return chart?.indicatorsManager?.rsiValue || 0;
    }

    MACD(): { macd: number; signal: number; histogram: number } {
        const chart = (this.chart as any).candleViewChart?.getChart();
        return chart?.indicatorsManager?.macdValue || { macd: 0, signal: 0, histogram: 0 };
    }

    BOLL(period: number = 20, stdDev: number = 2): { upper: number; middle: number; lower: number } {
        const chart = (this.chart as any).candleViewChart?.getChart();
        return chart?.indicatorsManager?.bollingerBandsValues || { upper: 0, middle: 0, lower: 0 };
    }

    addTextMark(
        time: number,
        text: string,
        direction: 'up' | 'down',
        options?: {
            textColor?: string;
            backgroundColor?: string;
            isCircular?: boolean;
            fontSize?: number;
            padding?: number;
        }
    ): void {
        this.chart.addTextMark(
            time,
            text,
            direction === 'up' ? StaticMarkDirection.Bottom : StaticMarkDirection.Top,
            options
        );
    }

    addArrowUp(time: number, label?: string, color?: string): void {
        this.chart.addArrowMark(
            time,
            StaticMarkDirection.Bottom,
            { label, textColor: color }
        );
    }

    addArrowDown(time: number, label?: string, color?: string): void {
        this.chart.addArrowMark(
            time,
            StaticMarkDirection.Top,
            { label, textColor: color }
        );
    }

    clearAllMarks(): void {
        this.chart.clearAllStaticMarks();
    }

    on(event: 'newCandle', callback: () => void): void {
        if (event === 'newCandle') {
            this.newCandleCallbacks.push(callback);
        }
    }

    off(event: 'newCandle', callback: () => void): void {
        if (event === 'newCandle') {
            const index = this.newCandleCallbacks.indexOf(callback);
            if (index !== -1) {
                this.newCandleCallbacks.splice(index, 1);
            }
        }
    }

    emitNewCandle(): void {
        this.newCandleCallbacks.forEach(cb => cb());
    }

    openIndicator(name: string, params?: Record<string, any>): void {
        const upperName = name.toUpperCase();
        const mainIndicators: Record<string, MainChartIndicatorType> = {
            'MA': MainChartIndicatorType.MA,
            'EMA': MainChartIndicatorType.EMA,
            'BOLL': MainChartIndicatorType.BOLLINGER,
            'BOLLINGER': MainChartIndicatorType.BOLLINGER,
            'ICHIMOKU': MainChartIndicatorType.ICHIMOKU,
            'DONCHIAN': MainChartIndicatorType.DONCHIAN,
            'ENVELOPE': MainChartIndicatorType.ENVELOPE,
            'VWAP': MainChartIndicatorType.VWAP,
            'HEATMAP': MainChartIndicatorType.HEATMAP,
            'MARKETPROFILE': MainChartIndicatorType.MARKETPROFILE,
        };
        const subIndicators: Record<string, SubChartIndicatorType> = {
            'RSI': SubChartIndicatorType.RSI,
            'MACD': SubChartIndicatorType.MACD,
            'VOLUME': SubChartIndicatorType.VOLUME,
            'SAR': SubChartIndicatorType.SAR,
            'KDJ': SubChartIndicatorType.KDJ,
            'ATR': SubChartIndicatorType.ATR,
            'STOCH': SubChartIndicatorType.STOCHASTIC,
            'STOCHASTIC': SubChartIndicatorType.STOCHASTIC,
            'CCI': SubChartIndicatorType.CCI,
            'BBWIDTH': SubChartIndicatorType.BBWIDTH,
            'ADX': SubChartIndicatorType.ADX,
            'OBV': SubChartIndicatorType.OBV,
        };

        if (mainIndicators[upperName]) {
            this.chart.openMainChartIndicator(mainIndicators[upperName], params);
        } else if (subIndicators[upperName]) {
            this.chart.openSubChartIndicator(subIndicators[upperName]);
        }
    }

    closeIndicator(name: string): void {
        const upperName = name.toUpperCase();
        const mainIndicators: Record<string, MainChartIndicatorType> = {
            'MA': MainChartIndicatorType.MA,
            'EMA': MainChartIndicatorType.EMA,
            'BOLL': MainChartIndicatorType.BOLLINGER,
            'ICHIMOKU': MainChartIndicatorType.ICHIMOKU,
            'DONCHIAN': MainChartIndicatorType.DONCHIAN,
            'ENVELOPE': MainChartIndicatorType.ENVELOPE,
            'VWAP': MainChartIndicatorType.VWAP,
            'HEATMAP': MainChartIndicatorType.HEATMAP,
            'MARKETPROFILE': MainChartIndicatorType.MARKETPROFILE,
        };
        const subIndicators: Record<string, SubChartIndicatorType> = {
            'RSI': SubChartIndicatorType.RSI,
            'MACD': SubChartIndicatorType.MACD,
            'VOLUME': SubChartIndicatorType.VOLUME,
            'SAR': SubChartIndicatorType.SAR,
            'KDJ': SubChartIndicatorType.KDJ,
            'ATR': SubChartIndicatorType.ATR,
            'STOCH': SubChartIndicatorType.STOCHASTIC,
            'CCI': SubChartIndicatorType.CCI,
            'BBWIDTH': SubChartIndicatorType.BBWIDTH,
            'ADX': SubChartIndicatorType.ADX,
            'OBV': SubChartIndicatorType.OBV,
        };
        if (mainIndicators[upperName]) {
            this.chart.closeMainChartIndicator(mainIndicators[upperName]);
        } else if (subIndicators[upperName]) {
            this.chart.closeSubChartIndicator(subIndicators[upperName]);
        }
    }

    closeAllIndicators(): void {
        this.chart.closeAllMainChartIndicators();
        this.chart.closeAllSubChartIndicators();
    }
}