import { I18n } from "./I18n";
import { ICandleViewDataPoint, TimeframeEnum, TimezoneEnum } from "./types";

export interface TimeframeConfig {
  seconds: number;
  groupBy: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export const TIMEFRAME_CONFIGS: { [key: string]: TimeframeConfig } = {
  [TimeframeEnum.ONE_SECOND]: { seconds: 1, groupBy: 'second' },
  [TimeframeEnum.FIVE_SECONDS]: { seconds: 5, groupBy: 'second' },
  [TimeframeEnum.FIFTEEN_SECONDS]: { seconds: 15, groupBy: 'second' },
  [TimeframeEnum.THIRTY_SECONDS]: { seconds: 30, groupBy: 'second' },

  [TimeframeEnum.ONE_MINUTE]: { seconds: 60, groupBy: 'minute' },
  [TimeframeEnum.THREE_MINUTES]: { seconds: 180, groupBy: 'minute' },
  [TimeframeEnum.FIVE_MINUTES]: { seconds: 300, groupBy: 'minute' },
  [TimeframeEnum.FIFTEEN_MINUTES]: { seconds: 900, groupBy: 'minute' },
  [TimeframeEnum.THIRTY_MINUTES]: { seconds: 1800, groupBy: 'minute' },
  [TimeframeEnum.FORTY_FIVE_MINUTES]: { seconds: 2700, groupBy: 'minute' },

  [TimeframeEnum.ONE_HOUR]: { seconds: 3600, groupBy: 'hour' },
  [TimeframeEnum.TWO_HOURS]: { seconds: 7200, groupBy: 'hour' },
  [TimeframeEnum.THREE_HOURS]: { seconds: 10800, groupBy: 'hour' },
  [TimeframeEnum.FOUR_HOURS]: { seconds: 14400, groupBy: 'hour' },
  [TimeframeEnum.SIX_HOURS]: { seconds: 21600, groupBy: 'hour' },
  [TimeframeEnum.EIGHT_HOURS]: { seconds: 28800, groupBy: 'hour' },
  [TimeframeEnum.TWELVE_HOURS]: { seconds: 43200, groupBy: 'hour' },

  [TimeframeEnum.ONE_DAY]: { seconds: 86400, groupBy: 'day' },
  [TimeframeEnum.THREE_DAYS]: { seconds: 259200, groupBy: 'day' },

  [TimeframeEnum.ONE_WEEK]: { seconds: 604800, groupBy: 'week' },
  [TimeframeEnum.TWO_WEEKS]: { seconds: 1209600, groupBy: 'week' },

  [TimeframeEnum.ONE_MONTH]: { seconds: 2592000, groupBy: 'month' },
  [TimeframeEnum.THREE_MONTHS]: { seconds: 7776000, groupBy: 'month' },
  [TimeframeEnum.SIX_MONTHS]: { seconds: 15552000, groupBy: 'month' }
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
  return Object.values(TimeframeEnum);
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
    [TimeframeEnum.ONE_SECOND]: '1 Second',
    [TimeframeEnum.FIVE_SECONDS]: '5 Seconds',
    [TimeframeEnum.FIFTEEN_SECONDS]: '15 Seconds',
    [TimeframeEnum.THIRTY_SECONDS]: '30 Seconds',
    [TimeframeEnum.ONE_MINUTE]: '1 Minute',
    [TimeframeEnum.THREE_MINUTES]: '3 Minutes',
    [TimeframeEnum.FIVE_MINUTES]: '5 Minutes',
    [TimeframeEnum.FIFTEEN_MINUTES]: '15 Minutes',
    [TimeframeEnum.THIRTY_MINUTES]: '30 Minutes',
    [TimeframeEnum.FORTY_FIVE_MINUTES]: '45 Minutes',
    [TimeframeEnum.ONE_HOUR]: '1 Hour',
    [TimeframeEnum.TWO_HOURS]: '2 Hours',
    [TimeframeEnum.THREE_HOURS]: '3 Hours',
    [TimeframeEnum.FOUR_HOURS]: '4 Hours',
    [TimeframeEnum.SIX_HOURS]: '6 Hours',
    [TimeframeEnum.EIGHT_HOURS]: '8 Hours',
    [TimeframeEnum.TWELVE_HOURS]: '12 Hours',
    [TimeframeEnum.ONE_DAY]: '1 Day',
    [TimeframeEnum.THREE_DAYS]: '3 Days',
    [TimeframeEnum.ONE_WEEK]: '1 Week',
    [TimeframeEnum.TWO_WEEKS]: '2 Weeks',
    [TimeframeEnum.ONE_MONTH]: '1 Month',
    [TimeframeEnum.THREE_MONTHS]: '3 Months',
    [TimeframeEnum.SIX_MONTHS]: '6 Months'
  };
  return defaultDisplayNames[timeframe] || timeframe;
}

// Add transparent dummy data before and after the original data to expand the X-axis.
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
  // Add original data
  result.push(...originalData);
  // Generate after virtual data
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

export function convertTimeZone(
  data: ICandleViewDataPoint[],
  timezone: TimezoneEnum
): ICandleViewDataPoint[] {
  if (!data || data.length === 0) return data;
  const config = TIMEZONE_CONFIGS[timezone];
  if (!config) {
    console.warn(`Unknown timezone: ${timezone}, returning original data`);
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
      console.warn(`Invalid timezone offset format: ${config.offset}`);
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

export interface TimezoneConfig {
  name: string;
  offset: string;
  displayName: string;
}

export const TIMEZONE_CONFIGS: { [key in TimezoneEnum]: TimezoneConfig } = {
  [TimezoneEnum.NEW_YORK]: { name: 'America/New_York', offset: '-05:00', displayName: 'New York' },
  [TimezoneEnum.CHICAGO]: { name: 'America/Chicago', offset: '-06:00', displayName: 'Chicago' },
  [TimezoneEnum.DENVER]: { name: 'America/Denver', offset: '-07:00', displayName: 'Denver' },
  [TimezoneEnum.LOS_ANGELES]: { name: 'America/Los_Angeles', offset: '-08:00', displayName: 'Los Angeles' },
  [TimezoneEnum.TORONTO]: { name: 'America/Toronto', offset: '-05:00', displayName: 'Toronto' },
  [TimezoneEnum.LONDON]: { name: 'Europe/London', offset: '+00:00', displayName: 'London' },
  [TimezoneEnum.PARIS]: { name: 'Europe/Paris', offset: '+01:00', displayName: 'Paris' },
  [TimezoneEnum.FRANKFURT]: { name: 'Europe/Frankfurt', offset: '+01:00', displayName: 'Frankfurt' },
  [TimezoneEnum.ZURICH]: { name: 'Europe/Zurich', offset: '+01:00', displayName: 'Zurich' },
  [TimezoneEnum.MOSCOW]: { name: 'Europe/Moscow', offset: '+03:00', displayName: 'Moscow' },
  [TimezoneEnum.DUBAI]: { name: 'Asia/Dubai', offset: '+04:00', displayName: 'Dubai' },
  [TimezoneEnum.KARACHI]: { name: 'Asia/Karachi', offset: '+05:00', displayName: 'Karachi' },
  [TimezoneEnum.KOLKATA]: { name: 'Asia/Kolkata', offset: '+05:30', displayName: 'Kolkata' },
  [TimezoneEnum.SHANGHAI]: { name: 'Asia/Shanghai', offset: '+08:00', displayName: 'Shanghai' },
  [TimezoneEnum.HONG_KONG]: { name: 'Asia/Hong_Kong', offset: '+08:00', displayName: 'Hong Kong' },
  [TimezoneEnum.SINGAPORE]: { name: 'Asia/Singapore', offset: '+08:00', displayName: 'Singapore' },
  [TimezoneEnum.TOKYO]: { name: 'Asia/Tokyo', offset: '+09:00', displayName: 'Tokyo' },
  [TimezoneEnum.SEOUL]: { name: 'Asia/Seoul', offset: '+09:00', displayName: 'Seoul' },
  [TimezoneEnum.SYDNEY]: { name: 'Australia/Sydney', offset: '+10:00', displayName: 'Sydney' },
  [TimezoneEnum.AUCKLAND]: { name: 'Pacific/Auckland', offset: '+12:00', displayName: 'Auckland' },
  [TimezoneEnum.UTC]: { name: 'UTC', offset: '+00:00', displayName: 'UTC' }
};

export interface CloseTimeConfig {
  time: string;
  displayName: string;
  hour: number;
  minute: number;
}

export interface TradingDayTypeConfig {
  type: string;
  displayName: string;
  description: string;
}

export function processTimezoneData(
  data: ICandleViewDataPoint[],
  timezone: TimezoneEnum
): ICandleViewDataPoint[] {
  if (!data || data.length === 0) return data;
  const config = TIMEZONE_CONFIGS[timezone];
  if (!config) {
    console.warn(`Unknown timezone: ${timezone}, returning original data`);
    return data;
  }
  return data.map(point => {
    const originalTime = point.time;
    const convertedTime = convertTimezone(originalTime, config.offset);

    return {
      ...point,
      time: convertedTime
    };
  });
}

function convertTimezone(timestamp: number | string, targetOffset: string): number {
  let numericTimestamp: number;
  if (typeof timestamp === 'string') {
    numericTimestamp = new Date(timestamp).getTime() / 1000;
  } else {
    numericTimestamp = timestamp;
  }
  const offsetMatch = targetOffset.match(/^([+-])(\d{2}):(\d{2})$/);
  if (!offsetMatch) {
    console.warn(`Invalid timezone offset format: ${targetOffset}`);
    return numericTimestamp;
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
  return numericTimestamp + adjustmentSeconds;
}

export interface TimeConfig {
  timeframe?: TimeframeEnum;
  timezone?: TimezoneEnum;
}

export function processAllTimeConfigurations(
  data: ICandleViewDataPoint[],
  config: TimeConfig
): {
  processedData: ICandleViewDataPoint[];
  timeConfig: {
    timeframe?: TimeframeConfig;
    timezone?: TimezoneConfig;
    closeTime?: CloseTimeConfig;
    tradingDayType?: TradingDayTypeConfig;
  };
} {
  if (!data || data.length === 0) {
    return {
      processedData: [],
      timeConfig: {}
    };
  }
  let processedData = [...data];
  const resultConfig: any = {};
  if (config.timeframe) {
    processedData = aggregateDataForTimeframe(processedData, config.timeframe);
    resultConfig.timeframe = TIMEFRAME_CONFIGS[config.timeframe];
  }
  if (config.timezone) {
    processedData = processTimezoneData(processedData, config.timezone);
    resultConfig.timezone = TIMEZONE_CONFIGS[config.timezone];
  }
  return {
    processedData,
    timeConfig: resultConfig
  };
}

export function getAvailableTimezones(): TimezoneEnum[] {
  return Object.values(TimezoneEnum);
}

export function isTimezoneSupported(timezone: string): boolean {
  return timezone in TIMEZONE_CONFIGS;
}

export function getTimezoneConfig(timezone: TimezoneEnum): TimezoneConfig | undefined {
  return TIMEZONE_CONFIGS[timezone];
}
