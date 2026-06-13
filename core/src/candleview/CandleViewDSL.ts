import { CandleView } from './CandleView';
import { MainChartIndicatorType, StaticMarkDirection, SubChartIndicatorType } from '../types';
import { AreaSeries, HistogramSeries, LineSeries } from 'lightweight-charts';

export class CandleViewDSL {
    private candleview: CandleView;
    private newCandleCallbacks: Array<() => void> = [];
    private customMainIndicators: Map<string, any> = new Map();
    private customSubIndicators: Map<string, any> = new Map();

    constructor(candleview: CandleView) {
        this.candleview = candleview;
    }

    getClose(): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.close ?? 0;
    }

    getOpen(): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.open ?? 0;
    }

    getHigh(): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.high ?? 0;
    }

    getLow(): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.low ?? 0;
    }

    getVolume(): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.volume ?? 0;
    }

    getTime(): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        return displayData[displayData.length - 1]?.time ?? 0;
    }

    getCloseAt(offset: number): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        const index = displayData.length - 1 - offset;
        if (index < 0 || index >= displayData.length) return 0;
        return displayData[index]?.close ?? 0;
    }

    getOpenAt(offset: number): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        const index = displayData.length - 1 - offset;
        if (index < 0 || index >= displayData.length) return 0;
        return displayData[index]?.open ?? 0;
    }

    getHighAt(offset: number): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        const index = displayData.length - 1 - offset;
        if (index < 0 || index >= displayData.length) return 0;
        return displayData[index]?.high ?? 0;
    }

    getLowAt(offset: number): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        const index = displayData.length - 1 - offset;
        if (index < 0 || index >= displayData.length) return 0;
        return displayData[index]?.low ?? 0;
    }

    getVolumeAt(offset: number): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return 0;
        const index = displayData.length - 1 - offset;
        if (index < 0 || index >= displayData.length) return 0;
        return displayData[index]?.volume ?? 0;
    }

    getBarCount(): number {
        const displayData = (this.candleview as any).dataManager?.getPreprocessedData().displayData;
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

    WMA(source: number[], period: number): number {
        if (!source || source.length < period) return 0;
        let weightSum = 0;
        let valueSum = 0;
        for (let i = 0; i < period; i++) {
            const weight = i + 1;
            weightSum += weight;
            valueSum += source[source.length - period + i] * weight;
        }
        return valueSum / weightSum;
    }

    SMMA(source: number[], period: number): number {
        if (!source || source.length === 0) return 0;
        if (source.length <= period) {
            return source.reduce((a, b) => a + b, 0) / source.length;
        }
        let smma = source.slice(0, period).reduce((a, b) => a + b, 0) / period;
        for (let i = period; i < source.length; i++) {
            smma = (smma * (period - 1) + source[i]) / period;
        }
        return smma;
    }

    RSI(source: number[], period: number = 14): number {
        if (!source || source.length < period + 1) return 0;
        let avgGain = 0;
        let avgLoss = 0;
        for (let i = source.length - period; i < source.length; i++) {
            const change = source[i] - source[i - 1];
            if (change > 0) {
                avgGain += change;
            } else {
                avgLoss += Math.abs(change);
            }
        }
        avgGain /= period;
        avgLoss /= period;
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    MACD(source: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { macd: number; signal: number; histogram: number } {
        if (!source || source.length < slowPeriod + signalPeriod) {
            return { macd: 0, signal: 0, histogram: 0 };
        }
        const fastEMA = this.EMA(source, fastPeriod);
        const slowEMA = this.EMA(source, slowPeriod);
        const macdLine = fastEMA - slowEMA;
        return { macd: macdLine, signal: 0, histogram: 0 };
    }

    BOLL(source: number[], period: number = 20, stdDev: number = 2): { upper: number; middle: number; lower: number } {
        if (!source || source.length < period) {
            return { upper: 0, middle: 0, lower: 0 };
        }
        const middle = this.SMA(source, period);
        let sum = 0;
        const recent = source.slice(-period);
        for (let i = 0; i < recent.length; i++) {
            sum += Math.pow(recent[i] - middle, 2);
        }
        const deviation = Math.sqrt(sum / period);
        return {
            upper: middle + deviation * stdDev,
            middle: middle,
            lower: middle - deviation * stdDev
        };
    }

    KDJ(highs: number[], lows: number[], closes: number[], period: number = 9, smoothK: number = 3, smoothD: number = 3): { k: number; d: number; j: number } {
        if (!highs || highs.length < period || !lows || lows.length < period || !closes || closes.length < period) {
            return { k: 0, d: 0, j: 0 };
        }
        const highest = Math.max(...highs.slice(-period));
        const lowest = Math.min(...lows.slice(-period));
        const rsv = (closes[closes.length - 1] - lowest) / (highest - lowest) * 100;
        const k = rsv;
        const d = rsv;
        const j = 3 * k - 2 * d;
        return { k, d, j };
    }

    ATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
        if (!highs || highs.length < period + 1) return 0;
        const tr: number[] = [];
        for (let i = highs.length - period; i < highs.length; i++) {
            const hl = highs[i] - lows[i];
            const hc = Math.abs(highs[i] - closes[i - 1]);
            const lc = Math.abs(lows[i] - closes[i - 1]);
            tr.push(Math.max(hl, hc, lc));
        }
        return tr.reduce((a, b) => a + b, 0) / period;
    }

    CCI(highs: number[], lows: number[], closes: number[], period: number = 20): number {
        if (!highs || highs.length < period) return 0;
        const tp: number[] = [];
        for (let i = highs.length - period; i < highs.length; i++) {
            tp.push((highs[i] + lows[i] + closes[i]) / 3);
        }
        const sma = tp.reduce((a, b) => a + b, 0) / period;
        let md = 0;
        for (let i = 0; i < tp.length; i++) {
            md += Math.abs(tp[i] - sma);
        }
        md /= period;
        if (md === 0) return 0;
        return (tp[tp.length - 1] - sma) / (0.015 * md);
    }

    ADX(highs: number[], lows: number[], closes: number[], period: number = 14): number {
        if (!highs || highs.length < period + 1) return 0;
        const plusDM: number[] = [];
        const minusDM: number[] = [];
        const tr: number[] = [];
        for (let i = highs.length - period; i < highs.length; i++) {
            const plus = highs[i] - highs[i - 1];
            const minus = lows[i - 1] - lows[i];
            plusDM.push(plus > minus && plus > 0 ? plus : 0);
            minusDM.push(minus > plus && minus > 0 ? minus : 0);
            const hl = highs[i] - lows[i];
            const hc = Math.abs(highs[i] - closes[i - 1]);
            const lc = Math.abs(lows[i] - closes[i - 1]);
            tr.push(Math.max(hl, hc, lc));
        }
        const plusDI = plusDM.reduce((a, b) => a + b, 0) / tr.reduce((a, b) => a + b, 0);
        const minusDI = minusDM.reduce((a, b) => a + b, 0) / tr.reduce((a, b) => a + b, 0);
        const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
        return dx;
    }

    OBV(closes: number[], volumes: number[]): number {
        if (!closes || closes.length === 0) return 0;
        let obv = 0;
        for (let i = 1; i < closes.length; i++) {
            if (closes[i] > closes[i - 1]) {
                obv += volumes[i];
            } else if (closes[i] < closes[i - 1]) {
                obv -= volumes[i];
            }
        }
        return obv;
    }

    SAR(highs: number[], lows: number[], step: number = 0.02, maxStep: number = 0.2): number[] {
        if (!highs || highs.length < 2) return [0];
        const sar: number[] = [lows[0]];
        let af = step;
        let ep = highs[0];
        let isUp = true;
        for (let i = 1; i < highs.length; i++) {
            let currentSar = sar[i - 1] + af * (ep - sar[i - 1]);
            if (isUp) {
                currentSar = Math.min(currentSar, lows[i - 1], lows[i - 2] || lows[i - 1]);
                if (currentSar > lows[i]) {
                    isUp = false;
                    af = step;
                    ep = lows[i];
                    currentSar = ep;
                }
            } else {
                currentSar = Math.max(currentSar, highs[i - 1], highs[i - 2] || highs[i - 1]);
                if (currentSar < highs[i]) {
                    isUp = true;
                    af = step;
                    ep = highs[i];
                    currentSar = ep;
                }
            }
            sar.push(currentSar);
            if ((isUp && highs[i] > ep) || (!isUp && lows[i] < ep)) {
                ep = isUp ? highs[i] : lows[i];
                af = Math.min(af + step, maxStep);
            }
        }
        return sar;
    }

    BBWIDTH(source: number[], period: number = 20, stdDev: number = 2): number {
        const boll = this.BOLL(source, period, stdDev);
        return boll.upper - boll.lower;
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
        this.candleview.addTextMark(
            time,
            text,
            direction === 'up' ? StaticMarkDirection.Bottom : StaticMarkDirection.Top,
            options
        );
    }

    addArrowUp(time: number, label?: string, color?: string): void {
        this.candleview.addArrowMark(
            time,
            StaticMarkDirection.Bottom,
            { label, textColor: color }
        );
    }

    addArrowDown(time: number, label?: string, color?: string): void {
        this.candleview.addArrowMark(
            time,
            StaticMarkDirection.Top,
            { label, textColor: color }
        );
    }

    clearAllMarks(): void {
        this.candleview.clearAllStaticMarks();
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
        switch (upperName) {
            case 'MA':
                this.candleview.openMainChartIndicator(MainChartIndicatorType.MA, params);
                return;
            case 'EMA':
                this.candleview.openMainChartIndicator(MainChartIndicatorType.EMA, params);
                return;
            case 'BOLL':
            case 'BOLLINGER':
                this.candleview.openMainChartIndicator(MainChartIndicatorType.BOLLINGER, params);
                return;
            case 'ICHIMOKU':
                this.candleview.openMainChartIndicator(MainChartIndicatorType.ICHIMOKU, params);
                return;
            case 'DONCHIAN':
                this.candleview.openMainChartIndicator(MainChartIndicatorType.DONCHIAN, params);
                return;
            case 'ENVELOPE':
                this.candleview.openMainChartIndicator(MainChartIndicatorType.ENVELOPE, params);
                return;
            case 'VWAP':
                this.candleview.openMainChartIndicator(MainChartIndicatorType.VWAP, params);
                return;
            case 'HEATMAP':
                this.candleview.openMainChartIndicator(MainChartIndicatorType.HEATMAP, params);
                return;
            case 'MARKETPROFILE':
                this.candleview.openMainChartIndicator(MainChartIndicatorType.MARKETPROFILE, params);
                return;
        }
        switch (upperName) {
            case 'RSI':
                this.candleview.openSubChartIndicator(SubChartIndicatorType.RSI);
                return;
            case 'MACD':
                this.candleview.openSubChartIndicator(SubChartIndicatorType.MACD);
                return;
            case 'VOLUME':
                this.candleview.openSubChartIndicator(SubChartIndicatorType.VOLUME);
                return;
            case 'SAR':
                this.candleview.openSubChartIndicator(SubChartIndicatorType.SAR);
                return;
            case 'KDJ':
                this.candleview.openSubChartIndicator(SubChartIndicatorType.KDJ);
                return;
            case 'ATR':
                this.candleview.openSubChartIndicator(SubChartIndicatorType.ATR);
                return;
            case 'STOCH':
            case 'STOCHASTIC':
                this.candleview.openSubChartIndicator(SubChartIndicatorType.STOCHASTIC);
                return;
            case 'CCI':
                this.candleview.openSubChartIndicator(SubChartIndicatorType.CCI);
                return;
            case 'BBWIDTH':
                this.candleview.openSubChartIndicator(SubChartIndicatorType.BBWIDTH);
                return;
            case 'ADX':
                this.candleview.openSubChartIndicator(SubChartIndicatorType.ADX);
                return;
            case 'OBV':
                this.candleview.openSubChartIndicator(SubChartIndicatorType.OBV);
                return;
        }
    }

    closeIndicator(name: string): void {
        const upperName = name.toUpperCase();
        switch (upperName) {
            case 'MA': this.candleview.closeMainChartIndicator(MainChartIndicatorType.MA); return;
            case 'EMA': this.candleview.closeMainChartIndicator(MainChartIndicatorType.EMA); return;
            case 'BOLL':
            case 'BOLLINGER': this.candleview.closeMainChartIndicator(MainChartIndicatorType.BOLLINGER); return;
            case 'ICHIMOKU': this.candleview.closeMainChartIndicator(MainChartIndicatorType.ICHIMOKU); return;
            case 'DONCHIAN': this.candleview.closeMainChartIndicator(MainChartIndicatorType.DONCHIAN); return;
            case 'ENVELOPE': this.candleview.closeMainChartIndicator(MainChartIndicatorType.ENVELOPE); return;
            case 'VWAP': this.candleview.closeMainChartIndicator(MainChartIndicatorType.VWAP); return;
            case 'HEATMAP': this.candleview.closeMainChartIndicator(MainChartIndicatorType.HEATMAP); return;
            case 'MARKETPROFILE': this.candleview.closeMainChartIndicator(MainChartIndicatorType.MARKETPROFILE); return;
            case 'RSI': this.candleview.closeSubChartIndicator(SubChartIndicatorType.RSI); return;
            case 'MACD': this.candleview.closeSubChartIndicator(SubChartIndicatorType.MACD); return;
            case 'VOLUME': this.candleview.closeSubChartIndicator(SubChartIndicatorType.VOLUME); return;
            case 'SAR': this.candleview.closeSubChartIndicator(SubChartIndicatorType.SAR); return;
            case 'KDJ': this.candleview.closeSubChartIndicator(SubChartIndicatorType.KDJ); return;
            case 'ATR': this.candleview.closeSubChartIndicator(SubChartIndicatorType.ATR); return;
            case 'STOCH':
            case 'STOCHASTIC': this.candleview.closeSubChartIndicator(SubChartIndicatorType.STOCHASTIC); return;
            case 'CCI': this.candleview.closeSubChartIndicator(SubChartIndicatorType.CCI); return;
            case 'BBWIDTH': this.candleview.closeSubChartIndicator(SubChartIndicatorType.BBWIDTH); return;
            case 'ADX': this.candleview.closeSubChartIndicator(SubChartIndicatorType.ADX); return;
            case 'OBV': this.candleview.closeSubChartIndicator(SubChartIndicatorType.OBV); return;
        }
    }

    closeAllIndicators(): void {
        this.candleview.closeAllMainChartIndicators();
        this.candleview.closeAllSubChartIndicators();
    }



    // ==================================

    plotMain(
        id: string,
        calculator: (index: number, open: number, high: number, low: number, close: number, volume: number) => number | null,
        options?: {
            name?: string;
            color?: string;
            width?: number;
            style?: 'solid' | 'dashed' | 'dotted';
            visible?: boolean;
        }
    ): void {
        this.candleview.dsl.addCustomMainIndicator(id, calculator, options);
    }

    plotSub(
        id: string,
        calculator: (index: number, open: number, high: number, low: number, close: number, volume: number) => number | null,
        options?: {
            name?: string;
            color?: string;
            width?: number;
            type?: 'line' | 'histogram' | 'area';
            visible?: boolean;
        }
    ): void {
        this.candleview.dsl.addCustomSubIndicator(id, calculator, options);
    }

    updateMain(id: string): void {
        this.candleview.dsl.updateCustomMainIndicator(id);
    }

    updateSub(id: string): void {
        this.candleview.dsl.updateCustomSubIndicator(id);
    }

    removeMain(id: string): void {
        this.candleview.dsl.removeCustomMainIndicator(id);
    }

    removeSub(id: string): void {
        this.candleview.dsl.removeCustomSubIndicator(id);
    }

    clearAllMain(): void {
        this.candleview.dsl.clearAllCustomMainIndicators();
    }

    clearAllSub(): void {
        this.candleview.dsl.clearAllCustomSubIndicators();
    }

    public addCustomMainIndicator(
        id: string,
        calculator: (index: number, open: number, high: number, low: number, close: number, volume: number) => number | null,
        options?: {
            name?: string;
            color?: string;
            width?: number;
            style?: 'solid' | 'dashed' | 'dotted';
            visible?: boolean;
        }
    ): void {
        const chart = this.candleview.getChart()?.chart;
        if (!chart) return;
        if (this.customMainIndicators.has(id)) {
            this.removeCustomMainIndicator(id);
        }
        const data = this.computeIndicatorData(calculator);
        if (data.length === 0) return;
        const series = chart.addSeries(LineSeries, {
            color: options?.color || '#FF6B6B',
            lineWidth: (options?.width as 1 | 2 | 3 | 4) || 2,
            title: options?.name || id,
            priceLineVisible: false,
            lastValueVisible: true,
            visible: options?.visible !== false,
            priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
        });
        if (options?.style === 'dashed') {
            series.applyOptions({ lineStyle: 2 });
        } else if (options?.style === 'dotted') {
            series.applyOptions({ lineStyle: 3 });
        }
        // series.setData(data);
        this.customMainIndicators.set(id, {
            series,
            calculator,
            options,
            data
        });
    }

    public updateCustomMainIndicator(id: string): void {
        const indicator = this.customMainIndicators.get(id);
        if (!indicator) return;
        const newData = this.computeIndicatorData(indicator.calculator);
        if (newData.length === 0) return;
        indicator.series.setData(newData);
        indicator.data = newData;
    }

    public removeCustomMainIndicator(id: string): void {
        const indicator = this.customMainIndicators.get(id);
        if (indicator?.series && this.candleview.getChart()?.chart) {
            try {
                this.candleview.getChart()?.chart?.removeSeries(indicator.series);
            } catch (e) { }
            this.customMainIndicators.delete(id);
        }
    }

    public clearAllCustomMainIndicators(): void {
        this.customMainIndicators.forEach((_, id) => {
            this.removeCustomMainIndicator(id);
        });
    }

    public addCustomSubIndicator(
        id: string,
        calculator: (index: number, open: number, high: number, low: number, close: number, volume: number) => number | null,
        options?: {
            name?: string;
            color?: string;
            width?: number;
            type?: 'line' | 'histogram' | 'area';
            visible?: boolean;
        }
    ): void {
        const chart = this.candleview.getChart()?.chart;
        if (!chart) return;
        if (this.customSubIndicators.has(id)) {
            this.removeCustomSubIndicator(id);
        }
        const data = this.computeIndicatorData(calculator);
        if (data.length === 0) return;
        const type = options?.type || 'line';
        const color = options?.color || '#FF6B6B';
        let series: any;
        switch (type) {
            case 'line':
                series = chart.addSeries(LineSeries, {
                    color: color,
                    lineWidth: (options?.width as 1 | 2 | 3 | 4) || 2,
                    title: options?.name || id,
                    priceLineVisible: false,
                    lastValueVisible: true,
                    visible: options?.visible !== false,
                    priceScaleId: `custom_sub_${id}`,
                    priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
                });
                break;
            case 'histogram':
                series = chart.addSeries(HistogramSeries, {
                    color: color,
                    title: options?.name || id,
                    priceLineVisible: false,
                    lastValueVisible: true,
                    visible: options?.visible !== false,
                    priceScaleId: `custom_sub_${id}`,
                    priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
                });
                break;
            case 'area':
                series = chart.addSeries(AreaSeries, {
                    lineColor: color,
                    topColor: `${color}40`,
                    bottomColor: `${color}00`,
                    lineWidth: (options?.width as 1 | 2 | 3 | 4) || 2,
                    title: options?.name || id,
                    priceLineVisible: false,
                    lastValueVisible: true,
                    visible: options?.visible !== false,
                    priceScaleId: `custom_sub_${id}`,
                    priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
                });
                break;
            default:
                return;
        }
        series.setData(data);
        this.customSubIndicators.set(id, {
            series,
            calculator,
            options,
            data,
            type
        });
    }

    public updateCustomSubIndicator(id: string): void {
        const indicator = this.customSubIndicators.get(id);
        if (!indicator) return;
        const newData = this.computeIndicatorData(indicator.calculator);
        if (newData.length === 0) return;
        indicator.series.setData(newData);
        indicator.data = newData;
    }

    public removeCustomSubIndicator(id: string): void {
        const indicator = this.customSubIndicators.get(id);
        if (indicator?.series && this.candleview.getChart()?.chart) {
            try {
                this.candleview.getChart()?.chart?.removeSeries(indicator.series);
            } catch (e) { }
            this.customSubIndicators.delete(id);
        }
    }

    public clearAllCustomSubIndicators(): void {
        this.customSubIndicators.forEach((_, id) => {
            this.removeCustomSubIndicator(id);
        });
    }

    public updateAllCustomIndicators(): void {
        this.customMainIndicators.forEach((_, id) => {
            this.updateCustomMainIndicator(id);
        });
        this.customSubIndicators.forEach((_, id) => {
            this.updateCustomSubIndicator(id);
        });
    }

    private computeIndicatorData(
        calculator: (index: number, open: number, high: number, low: number, close: number, volume: number) => number | null
    ): Array<{ time: number; value: number }> {
        const displayData = this.candleview?.dataManager.getPreprocessedData().displayData;
        if (!displayData || displayData.length === 0) return [];
        const result: Array<{ time: number; value: number }> = [];
        for (let i = 0; i < displayData.length; i++) {
            const item = displayData[i];
            const value = calculator(
                displayData.length - 1 - i,
                item.open,
                item.high,
                item.low,
                item.close,
                item.volume || 0
            );
            if (value !== null && value !== undefined && !isNaN(value)) {
                result.push({
                    time: item.time as number,
                    value: value
                });
            }
        }
        return result;
    }
}