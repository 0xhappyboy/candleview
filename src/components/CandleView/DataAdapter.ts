import { I18n } from "./I18n";
import { ICandleViewDataPoint } from "./types";

export interface TimeframeConfig {
    seconds: number;
    groupBy: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export const TIMEFRAME_CONFIGS: { [key: string]: TimeframeConfig } = {
    // s
    '1s': { seconds: 1, groupBy: 'second' },
    '5s': { seconds: 5, groupBy: 'second' },
    '15s': { seconds: 15, groupBy: 'second' },
    '30s': { seconds: 30, groupBy: 'second' },
    // m
    '1m': { seconds: 60, groupBy: 'minute' },
    '3m': { seconds: 180, groupBy: 'minute' },
    '5m': { seconds: 300, groupBy: 'minute' },
    '15m': { seconds: 900, groupBy: 'minute' },
    '30m': { seconds: 1800, groupBy: 'minute' },
    '45m': { seconds: 2700, groupBy: 'minute' },
    // h
    '1H': { seconds: 3600, groupBy: 'hour' },
    '2H': { seconds: 7200, groupBy: 'hour' },
    '3H': { seconds: 10800, groupBy: 'hour' },
    '4H': { seconds: 14400, groupBy: 'hour' },
    '6H': { seconds: 21600, groupBy: 'hour' },
    '8H': { seconds: 28800, groupBy: 'hour' },
    '12H': { seconds: 43200, groupBy: 'hour' },
    // d
    '1D': { seconds: 86400, groupBy: 'day' },
    '3D': { seconds: 259200, groupBy: 'day' },
    // w
    '1W': { seconds: 604800, groupBy: 'week' },
    '2W': { seconds: 1209600, groupBy: 'week' },
    // m
    '1M': { seconds: 2592000, groupBy: 'month' },
    '3M': { seconds: 7776000, groupBy: 'month' },
    '6M': { seconds: 15552000, groupBy: 'month' }
};

export function getWindowStartTime(timestamp: number, timeframe: string): number {
    const config = TIMEFRAME_CONFIGS[timeframe];
    if (!config) return timestamp;
    const date = new Date(timestamp * 1000);
    switch (config.groupBy) {
        case 'second':
            const seconds = Math.floor(date.getSeconds() / config.seconds) * config.seconds;
            date.setSeconds(seconds, 0);
            break;
        case 'minute':
            const intervalMinutes = config.seconds / 60;
            const minutes = Math.floor(date.getMinutes() / intervalMinutes) * intervalMinutes;
            date.setMinutes(minutes, 0, 0);
            break;
        case 'hour':
            const intervalHours = config.seconds / 3600;
            const hours = Math.floor(date.getHours() / intervalHours) * intervalHours;
            date.setHours(hours, 0, 0, 0);
            break;
        case 'day':
            date.setHours(0, 0, 0, 0);
            break;
        case 'week':
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            date.setDate(diff);
            date.setHours(0, 0, 0, 0);
            break;
        case 'month':
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            break;
    }
    return Math.floor(date.getTime() / 1000);
}

function fillMissingTimeIntervals(
    data: ICandleViewDataPoint[],
    timeframe: string
): ICandleViewDataPoint[] {
    if (data.length === 0) return [];
    const config = TIMEFRAME_CONFIGS[timeframe];
    if (!config) return data;
    const sortedData = [...data].sort((a, b) => {
        const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time;
        const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time;
        return timeA - timeB;
    });
    const filledData: ICandleViewDataPoint[] = [];
    let lastValidPoint: ICandleViewDataPoint | null = null;
    for (let i = 0; i < sortedData.length; i++) {
        const currentPoint = sortedData[i];
        const currentTimestamp = typeof currentPoint.time === 'string' ?
            new Date(currentPoint.time).getTime() / 1000 : currentPoint.time;
        if (i === 0) {
            filledData.push(currentPoint);
            lastValidPoint = currentPoint;
            continue;
        }
        const previousPoint = sortedData[i - 1];
        const previousTimestamp = typeof previousPoint.time === 'string' ?
            new Date(previousPoint.time).getTime() / 1000 : previousPoint.time;
        const timeDiff = currentTimestamp - previousTimestamp;
        if (timeDiff > config.seconds) {
            const numIntervals = Math.floor(timeDiff / config.seconds);
            for (let j = 1; j <= numIntervals; j++) {
                const fillTimestamp = previousTimestamp + j * config.seconds;
                const filledPoint: ICandleViewDataPoint = {
                    time: fillTimestamp,
                    open: lastValidPoint!.close,
                    high: lastValidPoint!.close,
                    low: lastValidPoint!.close,
                    close: lastValidPoint!.close,
                    volume: 0
                };
                filledData.push(filledPoint);
                lastValidPoint = filledPoint;
            }
        }
        filledData.push(currentPoint);
        lastValidPoint = currentPoint;
    }
    return filledData;
}

export function aggregateDataForTimeframe(
    data: ICandleViewDataPoint[],
    timeframe: string
): ICandleViewDataPoint[] {
    if (!data || data.length === 0) return [];
    const config = TIMEFRAME_CONFIGS[timeframe];
    if (!config) {
        console.warn(`Unknown timeframe: ${timeframe}, returning original data`);
        return data;
    }
    const filledData = fillMissingTimeIntervals(data, timeframe);
    const sortedData = filledData.sort((a, b) => {
        const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time;
        const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time;
        return timeA - timeB;
    });
    const aggregatedMap = new Map<number, ICandleViewDataPoint>();
    sortedData.forEach(point => {
        const timestamp = typeof point.time === 'string' ?
            new Date(point.time).getTime() / 1000 : point.time;
        const windowStart = getWindowStartTime(timestamp, timeframe);

        if (aggregatedMap.has(windowStart)) {
            const existing = aggregatedMap.get(windowStart)!;
            updateCandleOHLC(existing, point);
        } else {
            aggregatedMap.set(windowStart, createCandleFromPoint(point, windowStart));
        }
    });

    return Array.from(aggregatedMap.values())
        .sort((a, b) => (a.time as number) - (b.time as number));
}

function updateCandleOHLC(existing: ICandleViewDataPoint, newPoint: ICandleViewDataPoint): void {
    if (newPoint.high > existing.high) {
        existing.high = newPoint.high;
    }
    if (newPoint.low < existing.low) {
        existing.low = newPoint.low;
    }
    existing.close = newPoint.close;
    existing.volume = (existing.volume || 0) + (newPoint.volume || 0);
}

function createCandleFromPoint(point: ICandleViewDataPoint, windowStart: number): ICandleViewDataPoint {
    return {
        time: windowStart,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume || 0
    };
}

export function adaptDataForTimeframe(
    data: ICandleViewDataPoint[],
    timeframe: string
): ICandleViewDataPoint[] {
    return aggregateDataForTimeframe(data, timeframe);
}

export function getAvailableTimeframes(): string[] {
    return Object.keys(TIMEFRAME_CONFIGS);
}

export function isTimeframeSupported(timeframe: string): boolean {
    return timeframe in TIMEFRAME_CONFIGS;
}

export function getTimeframeDisplayName(timeframe: string, i18n: I18n): string {
    if (!i18n) {
        return getDefaultTimeframeDisplayName(timeframe);
    }
    if (timeframe in i18n.timeframes) {
        return i18n.timeframes[timeframe as keyof typeof i18n.timeframes];
    }
    return getDefaultTimeframeDisplayName(timeframe);
}

function getDefaultTimeframeDisplayName(timeframe: string): string {
    const defaultDisplayNames: { [key: string]: string } = {
        '1s': '1 Second', '5s': '5 Seconds', '15s': '15 Seconds', '30s': '30 Seconds',
        '1m': '1 Minute', '3m': '3 Minutes', '5m': '5 Minutes', '15m': '15 Minutes',
        '30m': '30 Minutes', '45m': '45 Minutes',
        '1H': '1 Hour', '2H': '2 Hours', '3H': '3 Hours', '4H': '4 Hours',
        '6H': '6 Hours', '8H': '8 Hours', '12H': '12 Hours',
        '1D': '1 Day', '3D': '3 Days',
        '1W': '1 Week', '2W': '2 Weeks',
        '1M': '1 Month', '3M': '3 Months', '6M': '6 Months'
    };
    return defaultDisplayNames[timeframe] || timeframe;
}

export const formatDataForSeries = (data: ICandleViewDataPoint[], chartType: string): any[] => {
    if (chartType === 'candle') {
        return data.map((item, index) => {
            return {
                time: item.time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                ...(item.isVirtual && {
                    color: 'transparent',
                    borderColor: 'transparent',
                    wickColor: 'transparent'
                })
            };
        });
    } else if (chartType === 'hollow-candle' || chartType === 'bar') {
        return data.map((item, index) => {
            return {
                time: item.time,
                open: item.volume * 0.95 + (Math.random() * item.volume * 0.1),
                high: item.volume * 1.1 + (Math.random() * item.volume * 0.05),
                low: item.volume * 0.9 - (Math.random() * item.volume * 0.05),
                close: item.volume,
                ...(item.isVirtual && {
                    color: 'transparent',
                    borderColor: 'transparent'
                })
            };
        });
    } else if (chartType === 'histogram') {
        return data.map(item => {
            return {
                time: item.time,
                value: item.volume,
                color: item.isVirtual ? 'transparent' : (item.volume > 100 ? '#26a69a' : '#ef5350')
            };
        });
    } else {
        return data.map(item => {
            const isVirtual = item.volume === 0;
            return {
                time: item.time,
                value: item.volume,
                ...(isVirtual && {
                    color: 'transparent'
                })
            };
        });
    }
};

// Add transparent dummy data before and after the original data to expand the X-axis.
export function generateExtendedVirtualData(
    originalData: ICandleViewDataPoint[],
    beforeCount: number = 200,
    afterCount: number = 200,
    interval: number = 86400
): ICandleViewDataPoint[] {
    if (!originalData || originalData.length === 0) {
        return [];
    }
    const result: ICandleViewDataPoint[] = [];
    const firstDataPoint = originalData[0];
    const lastDataPoint = originalData[originalData.length - 1];
    const avgPrice = originalData.reduce((sum, item) => sum + item.close, 0) / originalData.length;
    const firstTime = typeof firstDataPoint.time === 'string' ?
        new Date(firstDataPoint.time).getTime() / 1000 : firstDataPoint.time;
    const lastTime = typeof lastDataPoint.time === 'string' ?
        new Date(lastDataPoint.time).getTime() / 1000 : lastDataPoint.time;
    let currentTime = firstTime;
    for (let i = beforeCount; i > 0; i--) {
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
    for (let i = 0; i < afterCount; i++) {
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
