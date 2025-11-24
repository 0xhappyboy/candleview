import { I18n } from "./I18n";
import { ICandleViewDataPoint, TimeframeEnum, TimezoneEnum } from "./types";

export interface TimeframeConfig {
  seconds: number;
  groupBy: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export interface TimeConfig {
  timeframe?: TimeframeEnum;
  timezone?: TimezoneEnum;
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

export interface TimeZoneConfig {
  name: string;
  offset: string;
  displayName: string;
}

export const TIMEZONE_CONFIGS: { [key in TimezoneEnum]: TimeZoneConfig } = {
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

// Aggregation of timeframes - based on fixed time boundaries
export function aggregateForTimeFrame(
  data: ICandleViewDataPoint[],
  timeframe: TimeframeEnum
): ICandleViewDataPoint[] {
  if (!data || data.length === 0) {
    return [];
  }
  try {
    const timeframeSeconds = getTimeframeSeconds(timeframe);
    if (timeframeSeconds <= 0) {
      return [...data];
    }
    const aggregatedData: ICandleViewDataPoint[] = [];
    let currentGroup: ICandleViewDataPoint[] = [];
    let currentGroupKey: number = 0;
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const pointTime = typeof point.time === 'string' ?
        new Date(point.time).getTime() / 1000 : point.time;
      const groupKey = Math.floor(pointTime / timeframeSeconds) * timeframeSeconds;
      if (currentGroup.length === 0) {
        currentGroup.push(point);
        currentGroupKey = groupKey;
      } else if (groupKey === currentGroupKey) {
        currentGroup.push(point);
      } else {
        if (currentGroup.length > 0) {
          const aggregatedPoint = createAggregatedCandle(currentGroup);
          aggregatedData.push(aggregatedPoint);
        }
        currentGroup = [point];
        currentGroupKey = groupKey;
      }
    }
    if (currentGroup.length > 0) {
      const aggregatedPoint = createAggregatedCandle(currentGroup);
      aggregatedData.push(aggregatedPoint);
    }
    return aggregatedData;
  } catch (error) {
    console.error('Timeframe aggregation error:', error);
    return data;
  }
}

// Get the number of seconds corresponding to the time frame
export function getTimeframeSeconds(timeframe: TimeframeEnum): number {
  switch (timeframe) {
    case TimeframeEnum.ONE_SECOND:
      return 1;
    case TimeframeEnum.FIVE_SECONDS:
      return 5;
    case TimeframeEnum.FIFTEEN_SECONDS:
      return 15;
    case TimeframeEnum.THIRTY_SECONDS:
      return 30;
    case TimeframeEnum.ONE_MINUTE:
      return 60;
    case TimeframeEnum.THREE_MINUTES:
      return 3 * 60;
    case TimeframeEnum.FIVE_MINUTES:
      return 5 * 60;
    case TimeframeEnum.FIFTEEN_MINUTES:
      return 15 * 60;
    case TimeframeEnum.THIRTY_MINUTES:
      return 30 * 60;
    case TimeframeEnum.FORTY_FIVE_MINUTES:
      return 45 * 60;
    case TimeframeEnum.ONE_HOUR:
      return 60 * 60;
    case TimeframeEnum.TWO_HOURS:
      return 2 * 60 * 60;
    case TimeframeEnum.THREE_HOURS:
      return 3 * 60 * 60;
    case TimeframeEnum.FOUR_HOURS:
      return 4 * 60 * 60;
    case TimeframeEnum.SIX_HOURS:
      return 6 * 60 * 60;
    case TimeframeEnum.EIGHT_HOURS:
      return 8 * 60 * 60;
    case TimeframeEnum.TWELVE_HOURS:
      return 12 * 60 * 60;
    case TimeframeEnum.ONE_DAY:
      return 24 * 60 * 60;
    case TimeframeEnum.THREE_DAYS:
      return 3 * 24 * 60 * 60;
    case TimeframeEnum.ONE_WEEK:
      return 7 * 24 * 60 * 60;
    case TimeframeEnum.TWO_WEEKS:
      return 14 * 24 * 60 * 60;
    case TimeframeEnum.ONE_MONTH:
      return 30 * 24 * 60 * 60;
    case TimeframeEnum.THREE_MONTHS:
      return 90 * 24 * 60 * 60;
    case TimeframeEnum.SIX_MONTHS:
      return 180 * 24 * 60 * 60;
    default:
      return 0;
  }
}

export function createAggregatedCandle(group: ICandleViewDataPoint[]): ICandleViewDataPoint {
  if (group.length === 1) {
    return { ...group[0] };
  }
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
    isVirtual: group.some(point => point.isVirtual)
  };
}


export function fillMissingCandleTimeframe(
  timeframe: TimeframeEnum,
  data: ICandleViewDataPoint[]
): ICandleViewDataPoint[] {
  if (!data || data.length === 0) return [];
  const sorted = [...data].sort((a, b) => a.time - b.time);
  const timeframeToSeconds = (tf: TimeframeEnum): number => {
    const num = parseInt(tf);
    if (tf.endsWith('s')) return num;
    if (tf.endsWith('m')) return num * 60;
    if (tf.endsWith('H')) return num * 3600;
    if (tf.endsWith('D')) return num * 86400;
    if (tf.endsWith('W')) return num * 86400 * 7;
    if (tf.endsWith('M')) return num * 86400 * 30;
    return 60;
  };
  const step = timeframeToSeconds(timeframe);
  const result: ICandleViewDataPoint[] = [];
  result.push(sorted[0]);
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const next = sorted[i + 1];
    result.push(curr);
    let t = curr.time + step;
    while (t < next.time) {
      result.push({
        time: t,
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
        isVirtual: false,
      });
      t += step;
    }
  }
  result.push(sorted[sorted.length - 1]);
  return result;
}
