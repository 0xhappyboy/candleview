import { ICandleViewDataPoint, TimeframeEnum, TimezoneEnum, TIMEFRAME_CONFIGS, TIMEZONE_CONFIGS } from './types';

export function convertTimeZone(
    data: ICandleViewDataPoint[],
    timezone: TimezoneEnum
): ICandleViewDataPoint[] {
    if (!data || data.length === 0) return data;

    const config = TIMEZONE_CONFIGS[timezone];
    if (!config) {
        return data;
    }

    return data.map(point => {
        const originalTime = point.time;
        let numericTimestamp: number;
        if (typeof originalTime === 'string') {
            numericTimestamp = new Date(originalTime).getTime() / 1000;
        } else {
            numericTimestamp = originalTime;
        }

        const offsetMatch = config.offset.match(/^([+-])(\d{2}):(\d{2})$/);
        if (!offsetMatch) {
            return {
                ...point,
                time: numericTimestamp
            };
        }

        const sign = offsetMatch[1];
        const hours = parseInt(offsetMatch[2], 10);
        const minutes = parseInt(offsetMatch[3], 10);
        let targetOffsetSeconds = hours * 3600 + minutes * 60;
        if (sign === '-') {
            targetOffsetSeconds = -targetOffsetSeconds;
        }

        const localDate = new Date(numericTimestamp * 1000);
        const localOffsetMinutes = localDate.getTimezoneOffset();
        const localOffsetSeconds = -localOffsetMinutes * 60;
        const adjustmentSeconds = targetOffsetSeconds - localOffsetSeconds;
        const convertedTime = numericTimestamp + adjustmentSeconds;

        return {
            ...point,
            time: convertedTime
        };
    });
}

function calculateOptimalVirtualDataCount(
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

export function generateExtendedVirtualData(
    originalData: ICandleViewDataPoint[],
    beforeCount: number,
    afterCount: number,
    timeframe: string = TimeframeEnum.ONE_DAY
): ICandleViewDataPoint[] {
    if (!originalData || originalData.length === 0) {
        return [];
    }

    const config = TIMEFRAME_CONFIGS[timeframe];
    const interval = config ? config.seconds : 86400;
    const result: ICandleViewDataPoint[] = [];
    const firstDataPoint = originalData[0];
    const lastDataPoint = originalData[originalData.length - 1];
    const avgPrice = originalData.reduce((sum, item) => sum + item.close, 0) / originalData.length;
    const firstTime = typeof firstDataPoint.time === 'string' ?
        new Date(firstDataPoint.time).getTime() / 1000 : firstDataPoint.time;
    const lastTime = typeof lastDataPoint.time === 'string' ?
        new Date(lastDataPoint.time).getTime() / 1000 : lastDataPoint.time;
    const MAX_VIRTUAL_DATA = 10000;
    const adjustedBeforeCount = Math.min(beforeCount, MAX_VIRTUAL_DATA);
    const adjustedAfterCount = Math.min(afterCount, MAX_VIRTUAL_DATA);
    let currentTime = firstTime;
    for (let i = adjustedBeforeCount; i > 0; i--) {
        currentTime -= interval;
        const virtualDataPoint: ICandleViewDataPoint = {
            time: currentTime,
            open: avgPrice,
            high: avgPrice,
            low: avgPrice,
            close: avgPrice,
            volume: -1,
            isVirtual: true,
        };
        result.unshift(virtualDataPoint);
    }
    result.push(...originalData);
    currentTime = lastTime;
    for (let i = 0; i < adjustedAfterCount; i++) {
        currentTime += interval;
        const virtualDataPoint: ICandleViewDataPoint = {
            time: currentTime,
            open: avgPrice,
            high: avgPrice,
            low: avgPrice,
            close: avgPrice,
            volume: -1,
            isVirtual: true,
        };
        result.push(virtualDataPoint);
    }
    return result;
}

export interface DataPreprocessResult {
    displayData: ICandleViewDataPoint[];
    hiddenBaseData: ICandleViewDataPoint[];
    realDataRange: { firstIndex: number; lastIndex: number };
}

export interface DataPreprocessConfig {
    timeframe?: TimeframeEnum;
    timezone?: TimezoneEnum;
    virtualDataBeforeCount?: number;
    virtualDataAfterCount?: number;
}

export class DataPreprocessor {

    public static preprocess(
        originalData: ICandleViewDataPoint[],
        config: DataPreprocessConfig = {}
    ): DataPreprocessResult {
        if (!originalData || originalData.length === 0) {
            return {
                displayData: [],
                hiddenBaseData: [],
                realDataRange: { firstIndex: -1, lastIndex: -1 }
            };
        }
        const { timeframe, timezone, virtualDataBeforeCount, virtualDataAfterCount } = config;
        let timezoneData = [...originalData];
        if (timezone) {
            timezoneData = convertTimeZone(timezoneData, timezone);
        }
        let aggregatedData = timezoneData;
        if (timeframe) {
            aggregatedData = aggregateByTimeframe(timezoneData, timeframe);
        }
        let beforeCount = virtualDataBeforeCount;
        let afterCount = virtualDataAfterCount;
        if (beforeCount === undefined || afterCount === undefined) {
            if (timeframe) {
                const optimalBefore = calculateOptimalVirtualDataCount(timeframe, 'before');
                const optimalAfter = calculateOptimalVirtualDataCount(timeframe, 'after');
                if (beforeCount === undefined) beforeCount = optimalBefore;
                if (afterCount === undefined) afterCount = optimalAfter;
            } else {
                if (beforeCount === undefined) beforeCount = 100;
                if (afterCount === undefined) afterCount = 100;
            }
        }
        const timeframeStr = timeframe || TimeframeEnum.ONE_DAY;
        const hiddenBaseData = generateExtendedVirtualData(
            aggregatedData,
            beforeCount,
            afterCount,
            timeframeStr
        );
        const displayData = aggregatedData.filter(item => !item.isVirtual);
        const realDataRange = DataPreprocessor.getRealDataRange(displayData);
        return {
            displayData,
            hiddenBaseData,
            realDataRange
        };
    }

    private static getRealDataRange(data: ICandleViewDataPoint[]): { firstIndex: number; lastIndex: number } {
        if (data.length === 0) {
            return { firstIndex: -1, lastIndex: -1 };
        }

        let firstIndex = -1;
        let lastIndex = -1;

        for (let i = 0; i < data.length; i++) {
            if (!data[i].isVirtual) {
                firstIndex = i;
                break;
            }
        }

        for (let i = data.length - 1; i >= 0; i--) {
            if (!data[i].isVirtual) {
                lastIndex = i;
                break;
            }
        }

        return { firstIndex, lastIndex };
    }
}

export function aggregateByTimeframe(
    data: ICandleViewDataPoint[],
    timeframe: TimeframeEnum
): ICandleViewDataPoint[] {
    if (!data || data.length === 0) return [];
    const seconds = getTimeframeSeconds(timeframe);
    if (seconds <= 0) return [...data];
    const result: ICandleViewDataPoint[] = [];
    let currentGroup: ICandleViewDataPoint[] = [];
    let currentGroupKey: number = 0;
    for (const point of data) {
        const pointTime = typeof point.time === 'string'
            ? new Date(point.time).getTime() / 1000
            : point.time;
        const groupKey = Math.floor(pointTime / seconds) * seconds;
        if (currentGroup.length === 0) {
            currentGroup.push(point);
            currentGroupKey = groupKey;
        } else if (groupKey === currentGroupKey) {
            currentGroup.push(point);
        } else {
            result.push(mergeKlines(currentGroup));
            currentGroup = [point];
            currentGroupKey = groupKey;
        }
    }
    if (currentGroup.length > 0) {
        result.push(mergeKlines(currentGroup));
    }
    return result;
}

function mergeKlines(group: ICandleViewDataPoint[]): ICandleViewDataPoint {
    if (group.length === 1) return { ...group[0] };
    const open = group[0].open;
    const close = group[group.length - 1].close;
    let high = -Infinity;
    let low = Infinity;
    let volume = 0;
    for (const point of group) {
        high = Math.max(high, point.high);
        low = Math.min(low, point.low);
        volume += point.volume || 0;
    }
    return {
        time: group[0].time,
        open,
        high,
        low,
        close,
        volume,
        isVirtual: group.some(p => p.isVirtual)
    };
}

function getTimeframeSeconds(timeframe: TimeframeEnum): number {
    const map: Record<string, number> = {
        [TimeframeEnum.ONE_SECOND]: 1,
        [TimeframeEnum.FIVE_SECONDS]: 5,
        [TimeframeEnum.FIFTEEN_SECONDS]: 15,
        [TimeframeEnum.THIRTY_SECONDS]: 30,
        [TimeframeEnum.ONE_MINUTE]: 60,
        [TimeframeEnum.THREE_MINUTES]: 180,
        [TimeframeEnum.FIVE_MINUTES]: 300,
        [TimeframeEnum.FIFTEEN_MINUTES]: 900,
        [TimeframeEnum.THIRTY_MINUTES]: 1800,
        [TimeframeEnum.FORTY_FIVE_MINUTES]: 2700,
        [TimeframeEnum.ONE_HOUR]: 3600,
        [TimeframeEnum.TWO_HOURS]: 7200,
        [TimeframeEnum.THREE_HOURS]: 10800,
        [TimeframeEnum.FOUR_HOURS]: 14400,
        [TimeframeEnum.SIX_HOURS]: 21600,
        [TimeframeEnum.EIGHT_HOURS]: 28800,
        [TimeframeEnum.TWELVE_HOURS]: 43200,
        [TimeframeEnum.ONE_DAY]: 86400,
        [TimeframeEnum.THREE_DAYS]: 259200,
        [TimeframeEnum.ONE_WEEK]: 604800,
        [TimeframeEnum.TWO_WEEKS]: 1209600,
        [TimeframeEnum.ONE_MONTH]: 2592000,
        [TimeframeEnum.THREE_MONTHS]: 7776000,
        [TimeframeEnum.SIX_MONTHS]: 15552000
    };
    return map[timeframe] || 0;
}