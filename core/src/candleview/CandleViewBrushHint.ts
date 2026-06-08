import { Theme } from '../theme';
import { I18n } from '../i18n';

export class CandleViewBrushHint {
    private theme: Theme;
    private i18n: I18n;
    private indicator: HTMLElement | null = null;

    constructor(theme: Theme, i18n: I18n) {
        this.theme = theme;
        this.i18n = i18n;
    }

    public injectStyles(): void {
        if (document.getElementById('candleview-brush-styles')) return;
        const style = document.createElement('style');
        style.id = 'candleview-brush-styles';
        style.textContent = `@keyframes brush-pulse{0%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.2)}100%{opacity:1;transform:scale(1)}}`;
        document.head.appendChild(style);
    }

    public show(parent: HTMLElement): void {
        if (this.indicator) {
            this.indicator.style.display = 'flex';
            return;
        }

        this.indicator = document.createElement('div');
        this.indicator.className = 'candleview-brush-indicator';
        Object.assign(this.indicator.style, {
            position: 'absolute', bottom: '38px', left: '12px', zIndex: '100',
            display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
            borderRadius: '20px', fontSize: '12px', pointerEvents: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        });

        this.indicator.innerHTML = `
            <span class="brush-pulse" style="display:inline-block;width:8px;height:8px;border-radius:50%;animation:brush-pulse 1.5s infinite;"></span>
            <span class="brush-text">${this.i18n.t('brushActive') || 'Brush Mode'}</span>
            <span class="brush-hint" style="margin-left:4px;font-size:10px;opacity:0.7;">ESC</span>
        `;

        this.updateTheme();
        parent.style.position = 'relative';
        parent.appendChild(this.indicator);
    }

    public hide(): void {
        if (this.indicator) this.indicator.style.display = 'none';
    }

    public updateTheme(): void {
        if (!this.indicator) return;
        const colors = this.theme.getColors();
        Object.assign(this.indicator.style, {
            background: colors.panelBg,
            border: `1px solid ${colors.panelBorder}`,
            color: colors.textColor
        });
        const pulse = this.indicator.querySelector('.brush-pulse') as HTMLElement;
        if (pulse) pulse.style.background = this.theme.isDark() ? '#FF6B35' : '#E64A19';
    }

    public updateI18n(i18n: I18n): void {
        this.i18n = i18n;
        const textSpan = this.indicator?.querySelector('.brush-text');
        if (textSpan) textSpan.textContent = this.i18n.t('brushActive') || 'Brush Mode';
    }
}