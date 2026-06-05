import { ThemeConfig } from "./Theme";
import { TimeframeEnum, TimezoneEnum } from "./types";

export function getRandomColor(theme: ThemeConfig): string {
  const colors = [
    theme?.chart?.lineColor || '#2962FF',
    theme?.chart?.upColor || '#00C087',
    theme?.chart?.downColor || '#FF5B5A',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function timestampToDateTime(
  timestamp: number,
  separator: string = '-',
  timeSeparator: string = ':',
  includeTime: boolean = true
): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${separator}${month}${separator}${day}`;
  if (!includeTime) {
    return dateStr;
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}${timeSeparator}${minutes}${timeSeparator}${seconds}`;
  return `${dateStr} ${timeStr}`;
}

export function timestampToFriendlyTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const date = new Date(timestamp);
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  }
  const today = new Date();
  if (date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()) {
    return `今天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  const yesterday = new Date(now - 24 * 60 * 60 * 1000);
  if (date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()) {
    return `昨天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  if (date.getFullYear() === today.getFullYear()) {
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  return timestampToDateTime(timestamp);
}

export function mapTimeframe(timeframeStr?: string): TimeframeEnum | null {
  if (!timeframeStr) return null;
  const timeframeMap: { [key: string]: TimeframeEnum } = {
    '1s': TimeframeEnum.ONE_SECOND,
    '5s': TimeframeEnum.FIVE_SECONDS,
    '15s': TimeframeEnum.FIFTEEN_SECONDS,
    '30s': TimeframeEnum.THIRTY_SECONDS,
    '1m': TimeframeEnum.ONE_MINUTE,
    '3m': TimeframeEnum.THREE_MINUTES,
    '5m': TimeframeEnum.FIVE_MINUTES,
    '15m': TimeframeEnum.FIFTEEN_MINUTES,
    '30m': TimeframeEnum.THIRTY_MINUTES,
    '45m': TimeframeEnum.FORTY_FIVE_MINUTES,
    '1h': TimeframeEnum.ONE_HOUR,
    '2h': TimeframeEnum.TWO_HOURS,
    '3h': TimeframeEnum.THREE_HOURS,
    '4h': TimeframeEnum.FOUR_HOURS,
    '6h': TimeframeEnum.SIX_HOURS,
    '8h': TimeframeEnum.EIGHT_HOURS,
    '12h': TimeframeEnum.TWELVE_HOURS,
    '1d': TimeframeEnum.ONE_DAY,
    '3d': TimeframeEnum.THREE_DAYS,
    '1w': TimeframeEnum.ONE_WEEK,
    '2w': TimeframeEnum.TWO_WEEKS,
    '1M': TimeframeEnum.ONE_MONTH,
    '3M': TimeframeEnum.THREE_MONTHS,
    '6M': TimeframeEnum.SIX_MONTHS
  };
  return timeframeMap[timeframeStr] || null;
}

export function mapTimezone(timezoneStr?: string): TimezoneEnum | null {
  if (!timezoneStr) return null;
  const timezoneMap: { [key: string]: TimezoneEnum } = {
    'America/New_York': TimezoneEnum.NEW_YORK,
    'America/Chicago': TimezoneEnum.CHICAGO,
    'America/Denver': TimezoneEnum.DENVER,
    'America/Los_Angeles': TimezoneEnum.LOS_ANGELES,
    'America/Toronto': TimezoneEnum.TORONTO,
    'Europe/London': TimezoneEnum.LONDON,
    'Europe/Paris': TimezoneEnum.PARIS,
    'Europe/Frankfurt': TimezoneEnum.FRANKFURT,
    'Europe/Zurich': TimezoneEnum.ZURICH,
    'Europe/Moscow': TimezoneEnum.MOSCOW,
    'Asia/Dubai': TimezoneEnum.DUBAI,
    'Asia/Karachi': TimezoneEnum.KARACHI,
    'Asia/Kolkata': TimezoneEnum.KOLKATA,
    'Asia/Shanghai': TimezoneEnum.SHANGHAI,
    'Asia/Hong_Kong': TimezoneEnum.HONG_KONG,
    'Asia/Singapore': TimezoneEnum.SINGAPORE,
    'Asia/Tokyo': TimezoneEnum.TOKYO,
    'Asia/Seoul': TimezoneEnum.SEOUL,
    'Australia/Sydney': TimezoneEnum.SYDNEY,
    'Pacific/Auckland': TimezoneEnum.AUCKLAND,
    'UTC': TimezoneEnum.UTC
  };
  return timezoneMap[timezoneStr] || null;
}