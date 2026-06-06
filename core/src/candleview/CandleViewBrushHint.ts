import { I18n } from '../i18n';
import { CoreState } from './types';

export class CandleViewBrushHint {
    private state: CoreState;
    private brushIndicator: HTMLElement | null = null;
    private i18n: I18n;

    constructor(state: CoreState, i18n: I18n) {
        this.state = state;
        this.i18n = i18n;
    }

    public injectStyles(): void {
        if (document.getElementById('candleview-brush-styles')) return;
        const style = document.createElement('style');
        style.id = 'candleview-brush-styles';
        style.textContent = `@keyframes brush-pulse{0%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.2)}100%{opacity:1;transform:scale(1)}}`;
        document.head.appendChild(style);
    }

    public show(): void {
        const chartContainerEl = this.state.chartContainerEl;
        if (!chartContainerEl) return;

        if (this.brushIndicator) {
            this.brushIndicator.style.display = 'flex';
            this.updateTheme();
            return;
        }

        this.brushIndicator = document.createElement('div');
        this.brushIndicator.className = 'candleview-brush-indicator';
        this.brushIndicator.style.position = 'absolute';
        this.brushIndicator.style.bottom = '38px';
        this.brushIndicator.style.left = '12px';
        this.brushIndicator.style.zIndex = '100';
        this.brushIndicator.style.display = 'flex';
        this.brushIndicator.style.alignItems = 'center';
        this.brushIndicator.style.gap = '6px';
        this.brushIndicator.style.padding = '4px 10px';
        this.brushIndicator.style.borderRadius = '20px';
        this.brushIndicator.style.fontSize = '12px';
        this.brushIndicator.style.pointerEvents = 'none';
        this.brushIndicator.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.brushIndicator.innerHTML = `
            <span class="brush-pulse" style="display:inline-block;width:8px;height:8px;border-radius:50%;animation:brush-pulse 1.5s infinite;"></span>
            <span class="brush-text"></span>
            <span class="brush-hint" style="margin-left:4px;font-size:10px;opacity:0.7;">ESC</span>
        `;
        this.updateTheme();
        this.updateText();

        chartContainerEl.style.position = 'relative';
        chartContainerEl.appendChild(this.brushIndicator);
    }

    public hide(): void {
        if (this.brushIndicator) {
            this.brushIndicator.style.display = 'none';
        }
    }

    public updateTheme(): void {
        if (!this.brushIndicator) return;
        const colors = this.state.theme.getColors();
        const isDark = this.state.theme.isDark();

        this.brushIndicator.style.background = colors.panelBg;
        this.brushIndicator.style.border = `1px solid ${colors.panelBorder}`;
        this.brushIndicator.style.color = colors.textColor;

        const pulse = this.brushIndicator.querySelector('.brush-pulse') as HTMLElement;
        if (pulse) {
            pulse.style.background = isDark ? '#FF6B35' : '#E64A19';
        }

        const text = this.brushIndicator.querySelector('.brush-text') as HTMLElement;
        if (text) text.style.color = colors.textColor;

        const hint = this.brushIndicator.querySelector('.brush-hint') as HTMLElement;
        if (hint) hint.style.color = colors.textColor;
    }

    public updateText(): void {
        if (!this.brushIndicator) return;
        const textSpan = this.brushIndicator.querySelector('.brush-text');
        if (textSpan) {
            textSpan.textContent = this.i18n.t('brushActive') || 'Brush Mode';
        }
    }

    public updateI18n(i18n: I18n): void {
        this.i18n = i18n;
        this.updateText();
    }
}