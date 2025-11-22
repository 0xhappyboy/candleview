import { TimeframeEnum, TimezoneEnum, ChartType, SubChartIndicatorType } from './types';

export interface VisibleRange {
    from: number;
    to: number;
}

export interface ViewportState {
    savedVisibleRange: VisibleRange | null;
    mainChartVisibleRange: VisibleRange | null;
    adxChartVisibleRange: VisibleRange | null;
    atrChartVisibleRange: VisibleRange | null;
    bbwidthChartVisibleRange: VisibleRange | null;
    cciChartVisibleRange: VisibleRange | null;
    kdjChartVisibleRange: VisibleRange | null;
    macdChartVisibleRange: VisibleRange | null;
    obvhartVisibleRange: VisibleRange | null;
    rsiChartVisibleRange: VisibleRange | null;
    sarChartVisibleRange: VisibleRange | null;
    volumeChartVisibleRange: VisibleRange | null;
    stochasticChartVisibleRange: VisibleRange | null;
}

export interface ViewportConfig {
    timeframe: TimeframeEnum;
    timezone: TimezoneEnum;
}

export class ViewportManager {
    private chart: any = null;
    private currentSeries: any = null;

    constructor(chart: any, currentSeries: any) {
        this.chart = chart;
        this.currentSeries = currentSeries;
    }

    public getVisibleTimeRange(): VisibleRange | null {
        if (!this.chart) return null;
        try {
            const timeScale = this.chart.timeScale();
            const timeRange = timeScale.getVisibleRange();
            if (!timeRange) return null;
            return {
                from: timeRange.from,
                to: timeRange.to
            };
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    public setVisibleTimeRange(visibleRange: VisibleRange | null): void {
        if (!this.chart || !visibleRange) return;
        const timeScale = this.chart.timeScale();
        try {
            timeScale.setVisibleRange({
                from: visibleRange.from,
                to: visibleRange.to
            });
        } catch (error) {
            console.error(error);
            this.scrollToRealData();
        }
    }

    public scrollToRealData(): void {
        if (!this.chart) return;
        try {
            const timeScale = this.chart.timeScale();
            const currentData = this.currentSeries?.series?.data || [];
            if (currentData.length === 0) {
                timeScale.fitContent();
                return;
            }
            const { firstIndex, lastIndex, virtualAfterCount } = this.getRealDataRange();
            if (firstIndex === -1 || lastIndex === -1) {
                timeScale.fitContent();
                return;
            }
            const visibleBars = Math.min(100, lastIndex - firstIndex + 1 + 10);
            const fromIndex = Math.max(0, firstIndex - 5); 
            const toIndex = Math.min(currentData.length - 1, lastIndex + Math.min(10, virtualAfterCount));
            timeScale.setVisibleLogicalRange({
                from: fromIndex,
                to: toIndex
            });
        } catch (error) {
            console.error(error);
            this.scrollToStablePosition();
        }
    }

    public scrollToRight(): void {
        if (!this.chart) return;
        try {
            const timeScale = this.chart.timeScale();
            const currentData = this.currentSeries?.series?.data || [];
            if (currentData.length === 0) return;
            const { lastIndex, virtualAfterCount } = this.getRealDataRange();
            if (lastIndex === -1) {
                timeScale.scrollToRealTime();
                return;
            }
            const visibleBars = 100;
            const fromIndex = Math.max(0, lastIndex - visibleBars + 1);
            const toIndex = Math.min(currentData.length - 1, lastIndex + Math.min(10, virtualAfterCount));
            timeScale.setVisibleLogicalRange({
                from: fromIndex,
                to: toIndex
            });
        } catch (error) {
            console.error(error);
        }
    }

    public scrollToOriginalData(): void {
        if (!this.chart) return;
        const currentData = this.currentSeries?.series?.data || [];
        if (currentData.length === 0) return;
        try {
            const timeScale = this.chart.timeScale();
            const { firstIndex } = this.getRealDataRange();

            if (firstIndex !== -1) {
                const visibleBars = 30;
                timeScale.setVisibleLogicalRange({
                    from: Math.max(0, firstIndex - 5),
                    to: Math.min(currentData.length - 1, firstIndex + visibleBars)
                });
            } else {
                timeScale.fitContent();
            }
        } catch (error) {
            console.error(error);
        }
    }

    public scrollToStablePosition(): void {
        if (!this.chart) return;
        try {
            const timeScale = this.chart.timeScale();
            const currentData = this.currentSeries?.series?.data || [];
            if (currentData.length === 0) {
                timeScale.fitContent();
                return;
            }
            const { lastIndex } = this.getRealDataRange();
            if (lastIndex === -1) {
                const visibleBars = 50;
                timeScale.setVisibleLogicalRange({
                    from: Math.max(0, currentData.length - visibleBars),
                    to: currentData.length - 1
                });
            } else {
                const visibleBars = 50;
                const fromIndex = Math.max(0, lastIndex - visibleBars + 1);
                const toIndex = Math.min(currentData.length - 1, lastIndex + 5);
                timeScale.setVisibleLogicalRange({
                    from: fromIndex,
                    to: toIndex
                });
            }
        } catch (error) {
            console.error(error);
            if (this.chart) {
                this.chart.timeScale().fitContent();
            }
        }
    }

    public getRealDataRange(): {
        firstIndex: number;
        lastIndex: number;
        realDataCount: number;
        virtualBeforeCount: number;
        virtualAfterCount: number;
    } {
        const currentData = this.currentSeries?.series?.data || [];
        let firstIndex = -1;
        let lastIndex = -1;
        let realDataCount = 0;
        let virtualBeforeCount = 0;
        let virtualAfterCount = 0;
        for (let i = 0; i < currentData.length; i++) {
            const dataPoint = currentData[i];
            const isRealData = !dataPoint.isVirtual &&
                dataPoint.volume !== -1 &&
                dataPoint.volume !== 0 &&
                dataPoint.open !== undefined &&
                dataPoint.high !== undefined &&
                dataPoint.low !== undefined &&
                dataPoint.close !== undefined;
            if (isRealData) {
                firstIndex = i;
                virtualBeforeCount = i; 
                break;
            }
        }
        for (let i = currentData.length - 1; i >= 0; i--) {
            const dataPoint = currentData[i];
            const isRealData = !dataPoint.isVirtual &&
                dataPoint.volume !== -1 &&
                dataPoint.volume !== 0 &&
                dataPoint.open !== undefined &&
                dataPoint.high !== undefined &&
                dataPoint.low !== undefined &&
                dataPoint.close !== undefined;
            if (isRealData) {
                lastIndex = i;
                virtualAfterCount = currentData.length - 1 - i; 
                break;
            }
        }
        if (firstIndex !== -1 && lastIndex !== -1) {
            for (let i = firstIndex; i <= lastIndex; i++) {
                const dataPoint = currentData[i];
                const isRealData = !dataPoint.isVirtual &&
                    dataPoint.volume !== -1 &&
                    dataPoint.volume !== 0 &&
                    dataPoint.open !== undefined &&
                    dataPoint.high !== undefined &&
                    dataPoint.low !== undefined &&
                    dataPoint.close !== undefined;

                if (isRealData) {
                    realDataCount++;
                }
            }
        }
        return { firstIndex, lastIndex, realDataCount, virtualBeforeCount, virtualAfterCount };
    }

    public updateChartVisibleRange(
        chartType: ChartType,
        subChartType: SubChartIndicatorType | null,
        visibleRange: VisibleRange | null
    ): ViewportState {
        const stateUpdate: Partial<ViewportState> = {};
        if (ChartType.MainChart === chartType) {
            stateUpdate.adxChartVisibleRange = visibleRange;
            stateUpdate.atrChartVisibleRange = visibleRange;
            stateUpdate.bbwidthChartVisibleRange = visibleRange;
            stateUpdate.cciChartVisibleRange = visibleRange;
            stateUpdate.kdjChartVisibleRange = visibleRange;
            stateUpdate.macdChartVisibleRange = visibleRange;
            stateUpdate.obvhartVisibleRange = visibleRange;
            stateUpdate.rsiChartVisibleRange = visibleRange;
            stateUpdate.sarChartVisibleRange = visibleRange;
            stateUpdate.volumeChartVisibleRange = visibleRange;
            stateUpdate.stochasticChartVisibleRange = visibleRange;
        } else if (ChartType.SubChart === chartType) {
            stateUpdate.mainChartVisibleRange = visibleRange;
            const allSubCharts = {
                adxChartVisibleRange: SubChartIndicatorType.ADX !== subChartType ? visibleRange : undefined,
                atrChartVisibleRange: SubChartIndicatorType.ATR !== subChartType ? visibleRange : undefined,
                bbwidthChartVisibleRange: SubChartIndicatorType.BBWIDTH !== subChartType ? visibleRange : undefined,
                cciChartVisibleRange: SubChartIndicatorType.CCI !== subChartType ? visibleRange : undefined,
                kdjChartVisibleRange: SubChartIndicatorType.KDJ !== subChartType ? visibleRange : undefined,
                macdChartVisibleRange: SubChartIndicatorType.MACD !== subChartType ? visibleRange : undefined,
                obvhartVisibleRange: SubChartIndicatorType.OBV !== subChartType ? visibleRange : undefined,
                rsiChartVisibleRange: SubChartIndicatorType.RSI !== subChartType ? visibleRange : undefined,
                sarChartVisibleRange: SubChartIndicatorType.SAR !== subChartType ? visibleRange : undefined,
                volumeChartVisibleRange: SubChartIndicatorType.VOLUME !== subChartType ? visibleRange : undefined,
                stochasticChartVisibleRange: SubChartIndicatorType.STOCHASTIC !== subChartType ? visibleRange : undefined,
            };
            Object.assign(stateUpdate, allSubCharts);
        }
        return stateUpdate as ViewportState;
    }

    public syncMainChartVisibleRange(mainChartVisibleRange: VisibleRange | null): void {
        if (!mainChartVisibleRange || !this.chart) {
            return;
        }
        try {
            const timeScale = this.chart.timeScale();
            const currentVisibleRange = this.getVisibleTimeRange();
            if (currentVisibleRange &&
                currentVisibleRange.from === mainChartVisibleRange.from &&
                currentVisibleRange.to === mainChartVisibleRange.to) {
                return;
            }
            timeScale.setVisibleRange({
                from: mainChartVisibleRange.from,
                to: mainChartVisibleRange.to
            });
        } catch (error) {
            console.error(error);
        }
    }

    public setOptimalBarSpacing(activeTimeframe: TimeframeEnum): void {
        if (!this.chart) return;
        const timeScale = this.chart.timeScale();
        const currentOptions = timeScale.options();
        const currentBarSpacing = currentOptions.barSpacing || 10;
        const optimalBarSpacing: { [key: string]: number } = {
            [TimeframeEnum.ONE_SECOND]: 1,
            [TimeframeEnum.FIVE_SECONDS]: 2,
            [TimeframeEnum.FIFTEEN_SECONDS]: 3,
            [TimeframeEnum.THIRTY_SECONDS]: 4,
            [TimeframeEnum.ONE_MINUTE]: 5,
            [TimeframeEnum.THREE_MINUTES]: 6,
            [TimeframeEnum.FIVE_MINUTES]: 7,
            [TimeframeEnum.FIFTEEN_MINUTES]: 8,
            [TimeframeEnum.THIRTY_MINUTES]: 9,
            [TimeframeEnum.FORTY_FIVE_MINUTES]: 10,
            [TimeframeEnum.ONE_HOUR]: 12,
            [TimeframeEnum.TWO_HOURS]: 14,
            [TimeframeEnum.THREE_HOURS]: 16,
            [TimeframeEnum.FOUR_HOURS]: 18,
            [TimeframeEnum.SIX_HOURS]: 20,
            [TimeframeEnum.EIGHT_HOURS]: 22,
            [TimeframeEnum.TWELVE_HOURS]: 24,
            [TimeframeEnum.ONE_DAY]: 15,
            [TimeframeEnum.THREE_DAYS]: 20,
            [TimeframeEnum.ONE_WEEK]: 25,
            [TimeframeEnum.TWO_WEEKS]: 30,
            [TimeframeEnum.ONE_MONTH]: 35,
            [TimeframeEnum.THREE_MONTHS]: 40,
            [TimeframeEnum.SIX_MONTHS]: 45
        };
        const defaultSpacing = optimalBarSpacing[activeTimeframe] || 10;
        let spacing = defaultSpacing;
        if (Math.abs(currentBarSpacing - defaultSpacing) > 2) {
            spacing = currentBarSpacing;
        }
        try {
            timeScale.applyOptions({
                barSpacing: spacing,
                minBarSpacing: 0.5,
                maxBarSpacing: 50
            });
        } catch (error) {
            console.error(error);
        }
    }

    public setupTimeScaleListener(onVisibleRangeChange: (visibleRange: VisibleRange) => void): void {
        if (!this.chart) return;
        this.chart.timeScale().subscribeVisibleTimeRangeChange((visibleRange: VisibleRange) => {
            onVisibleRangeChange(visibleRange);
        });
    }

    public saveVisibleRangeToStorage(): void {
        const currentVisibleRange = this.getVisibleTimeRange();
        if (currentVisibleRange) {
            try {
                localStorage.setItem('candleView_visibleRange', JSON.stringify(currentVisibleRange));
            } catch (e) {
                console.error(e);
            }
        }
    }

    public loadVisibleRangeFromStorage(): VisibleRange | null {
        try {
            const saved = localStorage.getItem('candleView_visibleRange');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}