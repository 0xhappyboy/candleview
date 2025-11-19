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
    const sortedData = [...data].sort((a, b) => {
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

export const TIMEFRAME_DISPLAY_NAMES: { [key: string]: string } = {
    '1s': '1秒', '5s': '5秒', '15s': '15秒', '30s': '30秒',
    '1m': '1分钟', '3m': '3分钟', '5m': '5分钟', '15m': '15分钟',
    '30m': '30分钟', '45m': '45分钟',
    '1H': '1小时', '2H': '2小时', '3H': '3小时', '4H': '4小时',
    '6H': '6小时', '8H': '8小时', '12H': '12小时',
    '1D': '1日', '3D': '3日',
    '1W': '1周', '2W': '2周',
    '1M': '1月', '3M': '3月', '6M': '6月'
};

export function getTimeframeDisplayName(timeframe: string): string {
    return TIMEFRAME_DISPLAY_NAMES[timeframe] || timeframe;
}