import { ThemeConfig } from "./CandleViewTheme";

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
