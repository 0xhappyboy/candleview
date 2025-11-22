import {
    ICandleViewDataPoint,
    MainChartType,
    TimeframeEnum,
    TimezoneEnum
} from './types';
import {
    aggregateDataForTimeframe,
    generateExtendedVirtualData,
    processAllTimeConfigurations,
    TimeConfig,
    TIMEFRAME_CONFIGS
} from './DataAdapter';

export interface DataProcessingConfig {
    timeframe: TimeframeEnum;
    timezone: TimezoneEnum;
    shouldExtendVirtualData?: boolean;
    virtualDataBeforeCount?: number;
    virtualDataAfterCount?: number;
    chartType?: string;
}

export function buildDefaultDataProcessingConfig(
    timeConfig: TimeConfig,
    chartType: MainChartType,
    virtualDataBeforeCount?: number,
    virtualDataAfterCount?: number): DataProcessingConfig {
    const config: DataProcessingConfig = {
        timeframe: timeConfig.timeframe || TimeframeEnum.ONE_DAY,
        timezone: timeConfig.timezone || TimezoneEnum.SHANGHAI,
        shouldExtendVirtualData: true,
        virtualDataBeforeCount: virtualDataBeforeCount || 0,
        virtualDataAfterCount: virtualDataAfterCount || 0,
        chartType: chartType
    };
    return config;
}

export class DataManager {
    // The raw data undergoes time zone conversion, time frame data aggregation, and virtual data expansion processing. 
    // This data is generally used for charts other than the main chart.
    public static handleData(
        originalData: ICandleViewDataPoint[],
        config: DataProcessingConfig,
        chartType: MainChartType,
    ): ICandleViewDataPoint[] {
        if (!originalData || originalData.length === 0) {
            return [];
        }
        try {
            // Time configuration processing (time zone conversion, etc.)
            const timeFrameProcessedData = this.handleTimeConfigurations(originalData, config);
            // timeframe data aggregation
            const timeFrameAggregatedData = this.aggregateForTimeframe(timeFrameProcessedData, config.timeframe);
            // virtual data extension 
            const finalData = config.shouldExtendVirtualData
                ? this.extendWithVirtualData(timeFrameAggregatedData, config)
                : timeFrameAggregatedData;
            return finalData;
        } catch (error) {
            console.error('Data processing error:', error);
            return originalData;
        }
    }

    // The raw data undergoes time zone conversion, time frame data aggregation, and virtual data expansion processing. 
    // This data is generally used for charts other than the main chart.
    // It can be used for displaying the main chart, and virtual data transparency processing has been added based on the processing of the handleData function.
    // public static handleDisplayData(
    //     originalData: ICandleViewDataPoint[],
    //     config: DataProcessingConfig,
    //     chartType: MainChartType,
    // ): ICandleViewDataPoint[] {
    //     if (!originalData || originalData.length === 0) {
    //         return [];
    //     }
    //     try {
    //         const data = this.handleData(originalData, config, chartType);
    //         const chartDisplayData = this.handleChartDisplayData(data, chartType);
    //         return chartDisplayData;
    //     } catch (error) {
    //         console.error(error);
    //         return originalData;
    //     }
    // }

    /**
     * 获取可见范围及前后缓冲区的数据，用于性能优化
     * @param originalData 原始数据
     * @param config 数据处理配置
     * @param chartType 图表类型
     * @param visibleRange 当前可见时间范围 {from: number, to: number}
     * @param bufferCount 前后缓冲区数据点数量，默认为50
     * @returns 处理后的可见范围数据
     */
    public static getVisibleRangeData(
        originalData: ICandleViewDataPoint[],
        config: DataProcessingConfig,
        chartType: MainChartType,
        visibleRange: { from: number; to: number } | null,
        bufferCount: number = 50
    ): ICandleViewDataPoint[] {
        if (!originalData || originalData.length === 0) {
            return [];
        }
        // 首先获取完整处理后的数据
        const fullData = this.handleData(originalData, config, chartType);
        try {
            // 如果没有可见范围或数据为空，返回完整数据
            if (!visibleRange || fullData.length === 0) {
                return this.handleChartDisplayData(fullData, chartType);
            }
            // 查找可见范围内的数据索引范围
            let startIndex = -1;
            let endIndex = -1;
            for (let i = 0; i < fullData.length; i++) {
                const point = fullData[i];
                const pointTime = typeof point.time === 'string' ?
                    new Date(point.time).getTime() / 1000 : point.time;
                if (startIndex === -1 && pointTime >= visibleRange.from) {
                    startIndex = Math.max(0, i - bufferCount);
                }
                if (pointTime <= visibleRange.to) {
                    endIndex = Math.min(fullData.length - 1, i + bufferCount);
                } else if (endIndex === -1 && pointTime > visibleRange.to) {
                    endIndex = Math.min(fullData.length - 1, i + bufferCount);
                    break;
                }
            }
            // 如果没有找到匹配的范围，返回完整数据
            if (startIndex === -1 || endIndex === -1) {
                return this.handleChartDisplayData(fullData, chartType);
            }
            // 提取可见范围及缓冲区的数据
            const visibleData = fullData.slice(startIndex, endIndex + 1);
            // 对可见数据进行图表显示格式化
            return this.handleChartDisplayData(visibleData, chartType);
        } catch (error) {
            console.error(error);
            // 返回完整处理的数据
            return fullData;
        }
    }

    /**
     * 获取逻辑索引范围内的数据（基于数据索引而非时间戳）
     * @param originalData 原始数据
     * @param config 数据处理配置
     * @param chartType 图表类型
     * @param logicalRange 逻辑索引范围 {from: number, to: number}
     * @param bufferCount 前后缓冲区数据点数量，默认为50
     * @returns 处理后的可见范围数据
     */
    public static getLogicalRangeData(
        originalData: ICandleViewDataPoint[],
        config: DataProcessingConfig,
        chartType: MainChartType,
        logicalRange: { from: number; to: number } | null,
        bufferCount: number = 50
    ): ICandleViewDataPoint[] {
        if (!originalData || originalData.length === 0) {
            return [];
        }
        // 首先获取完整处理后的数据
        const fullData = this.handleData(originalData, config, chartType);
        try {
            // 如果没有逻辑范围或数据为空，返回完整数据
            if (!logicalRange || fullData.length === 0) {
                return this.handleChartDisplayData(fullData, chartType);
            }
            // 计算带缓冲区的索引范围
            const startIndex = Math.max(0, logicalRange.from - bufferCount);
            const endIndex = Math.min(fullData.length - 1, logicalRange.to + bufferCount);
            // 提取范围内的数据
            const rangeData = fullData.slice(startIndex, endIndex + 1);
            // 对范围内的数据进行图表显示格式化
            return this.handleChartDisplayData(rangeData, chartType);
        } catch (error) {
            console.error(error);
            // 出错时返回完整处理的数据
            return fullData;
        }
    }

    private static handleTimeConfigurations(
        data: ICandleViewDataPoint[],
        config: DataProcessingConfig
    ): ICandleViewDataPoint[] {
        const { processedData } = processAllTimeConfigurations(data, {
            timeframe: config.timeframe,
            timezone: config.timezone,
        });
        return processedData;
    }

    private static aggregateForTimeframe(
        data: ICandleViewDataPoint[],
        timeframe: TimeframeEnum
    ): ICandleViewDataPoint[] {
        return aggregateDataForTimeframe(data, timeframe);
    }

    private static extendWithVirtualData(
        data: ICandleViewDataPoint[],
        config: DataProcessingConfig
    ): ICandleViewDataPoint[] {
        const beforeCount = config.virtualDataBeforeCount ?? this.calculateOptimalVirtualDataCount(config.timeframe, 'before');
        const afterCount = config.virtualDataAfterCount ?? this.calculateOptimalVirtualDataCount(config.timeframe, 'after');
        return generateExtendedVirtualData(
            data,
            beforeCount,
            afterCount,
            config.timeframe
        );
    }

    private static calculateOptimalVirtualDataCount(
        timeframe: TimeframeEnum,
        type: 'before' | 'after'
    ): number {
        const baseCount = 100;
        const isSecondTimeframe = [
            TimeframeEnum.ONE_SECOND,
            TimeframeEnum.FIVE_SECONDS,
            TimeframeEnum.FIFTEEN_SECONDS,
            TimeframeEnum.THIRTY_SECONDS
        ].includes(timeframe);
        const isMinuteTimeframe = [
            TimeframeEnum.ONE_MINUTE,
            TimeframeEnum.THREE_MINUTES,
            TimeframeEnum.FIVE_MINUTES,
            TimeframeEnum.FIFTEEN_MINUTES,
            TimeframeEnum.THIRTY_MINUTES,
            TimeframeEnum.FORTY_FIVE_MINUTES
        ].includes(timeframe);
        const isHourTimeframe = [
            TimeframeEnum.ONE_HOUR,
            TimeframeEnum.TWO_HOURS,
            TimeframeEnum.THREE_HOURS,
            TimeframeEnum.FOUR_HOURS,
            TimeframeEnum.SIX_HOURS,
            TimeframeEnum.EIGHT_HOURS,
            TimeframeEnum.TWELVE_HOURS
        ].includes(timeframe);
        const isDaily = [
            TimeframeEnum.ONE_DAY,
            TimeframeEnum.THREE_DAYS
        ].includes(timeframe);
        const isWeekly = [
            TimeframeEnum.ONE_WEEK,
            TimeframeEnum.TWO_WEEKS
        ].includes(timeframe);
        const isMonthly = [
            TimeframeEnum.ONE_MONTH,
            TimeframeEnum.THREE_MONTHS,
            TimeframeEnum.SIX_MONTHS
        ].includes(timeframe);
        if (isSecondTimeframe) {
            return Math.min(baseCount, 50);
        } else if (isMinuteTimeframe) {
            return Math.min(baseCount, 80);
        } else if (isHourTimeframe) {
            return baseCount;
        } else if (isDaily) {
            return baseCount * 2;
        } else if (isWeekly) {
            return baseCount * 3;
        } else if (isMonthly) {
            return baseCount * 4;
        }
        return baseCount;
    }

    public static getDataTimeRange(data: ICandleViewDataPoint[]): { start: number; end: number } | null {
        if (!data || data.length === 0) return null;
        let startTime: number | null = null;
        let endTime: number | null = null;
        data.forEach(point => {
            const timestamp = typeof point.time === 'string'
                ? new Date(point.time).getTime() / 1000
                : point.time;

            if (startTime === null || timestamp < startTime) {
                startTime = timestamp;
            }
            if (endTime === null || timestamp > endTime) {
                endTime = timestamp;
            }
        });

        return startTime !== null && endTime !== null
            ? { start: startTime, end: endTime }
            : null;
    }

    private static formatCache: { key: string; result: any[] } | null = null;
    public static handleChartDisplayData(data: ICandleViewDataPoint[], mainChartType: MainChartType): ICandleViewDataPoint[] {
        if (!data || data.length === 0) return [];
        const cacheKey = `${mainChartType}-${data.length}-${data[0]?.time}-${data[data.length - 1]?.time}`;
        if (this.formatCache && this.formatCache.key === cacheKey) {
            return this.formatCache.result;
        }
        let result: any[] = [];
        try {
            if (mainChartType === MainChartType.Candle || mainChartType === MainChartType.HollowCandle || mainChartType === MainChartType.Bar) {
                result = data.map((item, index) => {
                    const baseData = {
                        time: item.time,
                        open: Number(item.open),
                        high: Number(item.high),
                        low: Number(item.low),
                        close: Number(item.close),
                        volume: Number(item.volume)
                    };
                    if (item.isVirtual) {
                        return {
                            ...baseData,
                            color: 'transparent',
                            borderColor: 'transparent',
                            wickColor: 'transparent'
                        };
                    }
                    return baseData;
                });
            } else if (mainChartType === MainChartType.BaseLine) {
                result = data.map(item => {
                    const isVirtual = item.isVirtual || item.volume === -1;
                    const baseData = {
                        time: item.time,
                        value: Number(item.close),
                    };
                    if (isVirtual) {
                        return {
                            ...baseData,
                            color: 'transparent'
                        };
                    }
                    return baseData;
                });
            } else if (mainChartType === MainChartType.Line || mainChartType === MainChartType.Area || mainChartType === MainChartType.StepLine) {
                result = data.map(item => {
                    const isVirtual = item.isVirtual || item.volume === -1;
                    const baseData = {
                        time: item.time,
                        value: Number(item.close),
                    };
                    if (isVirtual) {
                        return {
                            ...baseData,
                            color: 'transparent'
                        };
                    }
                    return baseData;
                });
            } else if (mainChartType === MainChartType.Histogram) {
                result = data.map(item => {
                    const isVirtual = item.isVirtual || item.volume === -1;
                    const baseData = {
                        time: item.time,
                        value: item.volume || 0,
                    };
                    if (isVirtual) {
                        return {
                            ...baseData,
                            color: 'transparent'
                        };
                    }
                    return {
                        ...baseData,
                        color: (item.volume || 0) > 100 ? '#26a69a' : '#ef5350'
                    };
                });
            } else {
                result = data.map(item => {
                    const isVirtual = item.isVirtual || item.volume === -1;
                    return {
                        time: item.time,
                        value: Number(item.close),
                        ...(isVirtual && { color: 'transparent' })
                    };
                });
            }
            this.formatCache = { key: cacheKey, result };
            return result;
        } catch (error) {
            console.error('Error formatting data for chart type:', mainChartType, error);
            return [];
        }
    };

    public static filterRealData(data: ICandleViewDataPoint[]): ICandleViewDataPoint[] {
        return data.filter(point =>
            !point.isVirtual && point.volume !== -1 && point.volume !== 0
        );
    }

    public static getTimeframeConfig(timeframe: TimeframeEnum) {
        return TIMEFRAME_CONFIGS[timeframe];
    }

    public static validateData(data: ICandleViewDataPoint[]): boolean {
        if (!data || !Array.isArray(data)) return false;
        return data.every(point =>
            point.time !== undefined &&
            point.open !== undefined &&
            point.high !== undefined &&
            point.low !== undefined &&
            point.close !== undefined
        );
    }

    public static sampleData(
        data: ICandleViewDataPoint[],
        sampleRate: number = 1
    ): ICandleViewDataPoint[] {
        if (sampleRate >= 1 || data.length <= 1000) {
            return data;
        }
        const sampledData: ICandleViewDataPoint[] = [];
        const step = Math.floor(1 / sampleRate);
        for (let i = 0; i < data.length; i += step) {
            if (i < data.length) {
                sampledData.push(data[i]);
            }
        }
        return sampledData;
    }
}

export const processChartData = (
    originalData: ICandleViewDataPoint[],
    config: DataProcessingConfig,
    chartType: MainChartType
): ICandleViewDataPoint[] => {
    return DataManager.handleData(originalData, config, chartType);
};

export const getVisibleRangeData = (
    originalData: ICandleViewDataPoint[],
    config: DataProcessingConfig,
    chartType: MainChartType,
    visibleRange: { from: number; to: number } | null,
    bufferCount: number = 50
): ICandleViewDataPoint[] => {
    return DataManager.getVisibleRangeData(originalData, config, chartType, visibleRange, bufferCount);
};

export const getLogicalRangeData = (
    originalData: ICandleViewDataPoint[],
    config: DataProcessingConfig,
    chartType: MainChartType,
    logicalRange: { from: number; to: number } | null,
    bufferCount: number = 50
): ICandleViewDataPoint[] => {
    return DataManager.getLogicalRangeData(originalData, config, chartType, logicalRange, bufferCount);
};