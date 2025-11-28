import { DataPointManager } from './DataPointManager';
import { TimeframeEnum, TimezoneEnum, ChartType, SubChartIndicatorType, ICandleViewDataPoint } from './types';

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

    public zoomIn(): void {
        if (!this.chart) return;
        const timeScale = this.chart.timeScale();
        const visibleRange = timeScale.getVisibleRange();
        if (!visibleRange) return;
        const rangeLength = visibleRange.to - visibleRange.from;
        const zoomFactor = 0.8;
        const newRangeLength = rangeLength * zoomFactor;
        const center = (visibleRange.from + visibleRange.to) / 2;
        timeScale.setVisibleRange({
            from: center - newRangeLength / 2,
            to: center + newRangeLength / 2
        });
    }

    public zoomOut(): void {
        if (!this.chart) return;
        const timeScale = this.chart.timeScale();
        const visibleRange = timeScale.getVisibleRange();
        if (!visibleRange) return;
        const rangeLength = visibleRange.to - visibleRange.from;
        const zoomFactor = 1.2;
        const newRangeLength = rangeLength * zoomFactor;
        const center = (visibleRange.from + visibleRange.to) / 2;
        timeScale.setVisibleRange({
            from: center - newRangeLength / 2,
            to: center + newRangeLength / 2
        });
    }

    scrollChart(direction: 'left' | 'right') {
        if (!this.chart) return;
        const timeScale = this.chart.timeScale();
        const visibleRange = timeScale.getVisibleRange();
        if (!visibleRange) return;
        const rangeLength = visibleRange.to - visibleRange.from;
        const scrollAmount = rangeLength * 0.2;
        if (direction === 'left') {
            timeScale.setVisibleRange({
                from: visibleRange.from - scrollAmount,
                to: visibleRange.to - scrollAmount
            });
        } else {
            timeScale.setVisibleRange({
                from: visibleRange.from + scrollAmount,
                to: visibleRange.to + scrollAmount
            });
        }
    }

    public positionChart(activeTimeframe: TimeframeEnum): void {
        this.setOptimalBarSpacing(activeTimeframe);
        this.scrollToRealData();
        // this.scrollToStablePosition();
    }

    // Get the current viewport time range.
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

    private setVisibleTimeRange(visibleRange: VisibleRange | null): void {
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

    private scrollToRealData(): void {
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

    private scrollToStablePosition(): void {
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

    private setOptimalBarSpacing(activeTimeframe: TimeframeEnum): void {
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

    private beforeViewPortBuffer = 100;
    private afterViewPortBuffer = 0;
    public getViewportDataPoints = (
        visibleRange: { from: number; to: number },
        preparedData: ICandleViewDataPoint[]
    ): ICandleViewDataPoint[] => {
        if (!preparedData || preparedData.length === 0) {
            return [];
        }
        const viewportStart = visibleRange.from - this.beforeViewPortBuffer;
        const viewportEnd = visibleRange.to - this.afterViewPortBuffer;
        const viewportData = preparedData.filter(dataPoint =>
            dataPoint.time >= viewportStart && dataPoint.time <= viewportEnd
        );
        return viewportData;
    };

    private scrollLockState = {
        isScrollLocked: false,
        lockDirection: null as 'left' | 'right' | null,
        safeVisibleRange: null as VisibleRange | null
    };

    public handleChartScrollLock(
        visibleRange: VisibleRange,
        currentData: ICandleViewDataPoint[]
    ): void {
        const timeScale = this.chart.timeScale();
        const realDataRange = DataPointManager.getRealDataRange(currentData);
        if (!realDataRange) {
            return;
        }
        const { firstIndex, lastIndex } = realDataRange;
        if (firstIndex !== -1 && lastIndex !== -1 && currentData.length > 0) {
            const visibleLogicalRange = timeScale.getVisibleLogicalRange();
            if (visibleLogicalRange) {
                const { from: viewportStart, to: viewportEnd } = visibleLogicalRange;
                const atRightEdge = firstIndex >= viewportEnd - 1;
                const atLeftEdge = lastIndex <= viewportStart + 1;
                if (this.scrollLockState.isScrollLocked && this.scrollLockState.safeVisibleRange) {
                    const unlockThreshold = 2;
                    if (this.scrollLockState.lockDirection === 'right') {
                        const movedLeft = visibleRange.from > this.scrollLockState.safeVisibleRange.from + unlockThreshold;
                        if (movedLeft && !atRightEdge) {
                            this.scrollLockState.isScrollLocked = false;
                            this.scrollLockState.lockDirection = null;
                            this.scrollLockState.safeVisibleRange = null;
                        }
                    } else if (this.scrollLockState.lockDirection === 'left') {
                        const movedRight = visibleRange.from < this.scrollLockState.safeVisibleRange.from - unlockThreshold;
                        if (movedRight && !atLeftEdge) {
                            this.scrollLockState.isScrollLocked = false;
                            this.scrollLockState.lockDirection = null;
                            this.scrollLockState.safeVisibleRange = null;
                        }
                    }
                    if (this.scrollLockState.isScrollLocked) {
                        timeScale.setVisibleRange(this.scrollLockState.safeVisibleRange);
                        return;
                    }
                }
                if (!this.scrollLockState.isScrollLocked) {
                    if (atRightEdge) {
                        this.scrollLockState.isScrollLocked = true;
                        this.scrollLockState.lockDirection = 'right';
                        this.scrollLockState.safeVisibleRange = { ...visibleRange };
                        timeScale.setVisibleRange(this.scrollLockState.safeVisibleRange);
                    } else if (atLeftEdge) {
                        this.scrollLockState.isScrollLocked = true;
                        this.scrollLockState.lockDirection = 'left';
                        this.scrollLockState.safeVisibleRange = { ...visibleRange };
                        timeScale.setVisibleRange(this.scrollLockState.safeVisibleRange);
                    }
                }
            }
        }
    }

}