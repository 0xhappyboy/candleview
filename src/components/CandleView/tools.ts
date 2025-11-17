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