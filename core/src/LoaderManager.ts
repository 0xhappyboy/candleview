import { I18n } from "./i18n";
import { Theme } from "./theme";

export class LoaderManager {
    private container: HTMLElement;
    private loaderElement: HTMLElement | null = null;
    private progressElement: HTMLElement | null = null;
    private textElement: HTMLElement | null = null;
    private theme: Theme;
    private i18n: I18n;

    constructor(container: HTMLElement, theme: Theme, i18n: I18n) {
        this.container = container;
        this.theme = theme;
        this.i18n = i18n;
        this.createLoader();
    }

    private createLoader(): void {
        this.loaderElement = document.createElement('div');
        this.loaderElement.className = 'candleview-loader-overlay';
        const colors = this.theme.getColors();
        const isDark = this.theme.isDark();
        this.loaderElement.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: ${isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.85)'};
            backdrop-filter: blur(2px);
            z-index: 1000;
            opacity: 1;
            transition: opacity 0.2s ease;
        `;
        const spinner = document.createElement('div');
        spinner.className = 'candleview-loader-spinner';
        spinner.style.cssText = `
            width: 48px;
            height: 48px;
            border: 2px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
            border-top-color: ${isDark ? '#ffffff' : '#333333'};
            border-radius: 50%;
            animation: candleview-spin 0.8s linear infinite;
        `;
        this.progressElement = document.createElement('div');
        this.progressElement.className = 'candleview-loader-progress';
        this.progressElement.style.cssText = `
            margin-top: 16px;
            font-size: 14px;
            font-weight: 500;
            font-family: monospace;
            color: ${isDark ? '#e0e0e0' : '#333333'};
        `;
        this.progressElement.textContent = '0%';
        this.textElement = document.createElement('div');
        this.textElement.className = 'candleview-loader-text';
        this.textElement.style.cssText = `
            margin-top: 8px;
            font-size: 12px;
            color: ${isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
        `;
        this.textElement.textContent = this.i18n.loader?.initializing || 'Loading...';
        this.loaderElement.appendChild(spinner);
        this.loaderElement.appendChild(this.progressElement);
        this.loaderElement.appendChild(this.textElement);
        if (!document.getElementById('candleview-loader-styles')) {
            const style = document.createElement('style');
            style.id = 'candleview-loader-styles';
            style.textContent = `
                @keyframes candleview-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        if (getComputedStyle(this.container).position === 'static') {
            this.container.style.position = 'relative';
        }
        this.container.appendChild(this.loaderElement);
    }

    public show(): void {
        if (this.loaderElement) {
            this.loaderElement.style.opacity = '1';
            this.loaderElement.style.display = 'flex';
            if (this.progressElement) {
                this.progressElement.textContent = '0%';
            }
        } else {
            this.createLoader();
        }
    }

    public updateProgress(percent: number, textKey?: string): void {
        if (!this.loaderElement) {
            this.createLoader();
        }
        if (this.loaderElement && this.loaderElement.style.display === 'none') {
            this.loaderElement.style.display = 'flex';
        }
        if (this.progressElement) {
            this.progressElement.textContent = `${Math.min(100, Math.max(0, percent))}%`;
        }
        if (textKey && this.textElement) {
            const text = this.i18n.loader?.[textKey as keyof typeof this.i18n.loader] || textKey;
            this.textElement.textContent = text;
        }
    }

    public updateTheme(): void {
        if (!this.loaderElement) return;
        const isDark = this.theme.isDark();
        this.loaderElement.style.background = isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.85)';
        const spinner = this.loaderElement.querySelector('.candleview-loader-spinner') as HTMLElement;
        if (spinner) {
            spinner.style.border = `2px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'}`;
            spinner.style.borderTopColor = isDark ? '#ffffff' : '#333333';
        }
        if (this.progressElement) {
            this.progressElement.style.color = isDark ? '#e0e0e0' : '#333333';
        }
        if (this.textElement) {
            this.textElement.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
        }
    }

    public updateI18n(i18n: I18n): void {
        this.i18n = i18n;
        if (this.textElement && this.textElement.textContent) {
            const currentText = this.textElement.textContent;
            if (currentText === 'Loading...' || currentText === '加载中...') {
                this.textElement.textContent = i18n.loader?.initializing || 'Loading...';
            }
        }
    }

    public hide(): void {
        if (this.loaderElement) {
            this.loaderElement.remove();
            this.loaderElement = null;
            this.progressElement = null;
            this.textElement = null;
        }
    }

    public destroy(): void {
        this.loaderElement?.remove();
        this.loaderElement = null;
        this.progressElement = null;
        this.textElement = null;
    }
}