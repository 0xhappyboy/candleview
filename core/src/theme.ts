export type ThemeType = 'light' | 'dark';

export interface ThemeColors {
    background: string;
    panelBg: string;
    panelBorder: string;
    textColor: string;
    buttonHover: string;
    buttonActive: string;
    buttonColor: string;
    chartCandleUp: string;
    chartCandleDown: string;
    chartLine: string;
    chartAreaTop: string;
    chartAreaBottom: string;
}

const darkTheme: ThemeColors = {
    background: '#0F1116',
    panelBg: '#1A1D24',
    panelBorder: '#2D323D',
    textColor: '#E8EAED',
    buttonHover: '#2D323D',
    buttonActive: '#2962FF',
    buttonColor: '#E8EAED',
    chartCandleUp: '#26a69a',
    chartCandleDown: '#ef5350',
    chartLine: '#2962FF',
    chartAreaTop: 'rgba(41, 98, 255, 0.4)',
    chartAreaBottom: 'rgba(41, 98, 255, 0)'
};

const lightTheme: ThemeColors = {
    background: '#FFFFFF',
    panelBg: '#F8F9FA',
    panelBorder: '#E1E5E9',
    textColor: '#1A1D24',
    buttonHover: '#E1E5E9',
    buttonActive: '#2962FF',
    buttonColor: '#495057',
    chartCandleUp: '#26a69a',
    chartCandleDown: '#ef5350',
    chartLine: '#2962FF',
    chartAreaTop: 'rgba(41, 98, 255, 0.2)',
    chartAreaBottom: 'rgba(41, 98, 255, 0)'
};

export class Theme {
    private theme: ThemeType;
    private colors: ThemeColors;

    constructor(theme: ThemeType = 'dark') {
        this.theme = theme;
        this.colors = theme === 'dark' ? darkTheme : lightTheme;
    }

    public getColors(): ThemeColors {
        return this.colors;
    }

    public setTheme(theme: ThemeType): void {
        this.theme = theme;
        this.colors = theme === 'dark' ? darkTheme : lightTheme;
    }

    public isDark(): boolean {
        return this.theme === 'dark';
    }
}