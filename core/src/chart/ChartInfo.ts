import { I18n } from '../i18n';
import { getDefaultMainChartIndicators, MainChartIndicatorInfo, MainChartIndicatorParam } from '../Indicators/mainchart/MainChartIndicatorInfo';
import { Theme, ThemeColors } from '../theme';
import { MainChartIndicatorType, Point } from '../types';

export interface ChartInfoOptions {
    container: HTMLElement;
    theme: Theme;
    i18n: I18n;
    title: string;
    indicators?: MainChartIndicatorInfo[];
    onToggleOHLC?: () => void;
    onOpenIndicatorsModal?: () => void;
    onRemoveIndicator?: (type: MainChartIndicatorType) => void;
    onToggleIndicator?: (type: MainChartIndicatorType) => void;
    onEditIndicatorParams?: (id: string, newParams: MainChartIndicatorParam[]) => void;
    onOpenIndicatorSettings?: (indicator: MainChartIndicatorInfo) => void;
}

export interface ChartInfoData {
    currentOHLC: {
        time: string;
        open: number;
        high: number;
        low: number;
        close: number;
    } | null;
    mousePosition: Point | null;
    showOHLC: boolean;
    indicators?: MainChartIndicatorInfo[];
    visibleIndicatorTypes?: MainChartIndicatorType[];
    // Real-time data of main chart technical indicators
    maIndicatorValues?: { [key: string]: number };
    emaIndicatorValues?: { [key: string]: number };
    bollingerBandsValues?: { [key: string]: number };
    ichimokuValues?: { [key: string]: number };
    donchianChannelValues?: { [key: string]: number };
    envelopeValues?: { [key: string]: number };
    vwapValue?: number | null;
}

export class ChartInfo {
    private container: HTMLElement;
    private theme: Theme;
    private i18n: I18n;
    private title: string;
    private options: ChartInfoOptions;
    private data: ChartInfoData;
    private rootEl: HTMLElement | null = null;
    private visibleIndicatorsMap: Map<MainChartIndicatorType, boolean> = new Map();
    private currentVisibleTypes: MainChartIndicatorType[] = [];
    private isInitialized: boolean = false;

    constructor(options: ChartInfoOptions) {
        this.container = options.container;
        this.theme = options.theme;
        this.i18n = options.i18n;
        this.title = options.title;
        this.options = options;
        const indicators = options.indicators || getDefaultMainChartIndicators();
        indicators.forEach(item => {
            if (item.type) {
                this.visibleIndicatorsMap.set(item.type, true);
            }
        });
        this.currentVisibleTypes = indicators
            .filter(item => item.type !== undefined && item.visible !== false)
            .map(item => item.type!);
        this.data = {
            currentOHLC: null,
            mousePosition: null,
            showOHLC: true,
            indicators: indicators,
            visibleIndicatorTypes: [],
            maIndicatorValues: {},
            emaIndicatorValues: {},
            bollingerBandsValues: {},
            ichimokuValues: {},
            donchianChannelValues: {},
            envelopeValues: {},
            vwapValue: null,
        };
        this.render();
        this.bindEvents();
        this.isInitialized = true;
    }

    public setReady(ready: boolean): void {
        if (ready) {
            this.show();
        } else {
            this.hide();
        }
    }

    public setTitle(title: string): void {
        this.title = title;
        this.render();
    }

    public setData(data: Partial<ChartInfoData>): void {
        this.show();
        let needsRender = false;
        if (data.indicators !== undefined) {
            this.data.indicators = data.indicators;
            needsRender = true;
        }
        if (data.visibleIndicatorTypes !== undefined) {
            this.currentVisibleTypes = data.visibleIndicatorTypes;
            needsRender = true;
        }
        if (data.currentOHLC !== undefined) {
            this.data.currentOHLC = data.currentOHLC;
        }
        if (data.mousePosition !== undefined) {
            this.data.mousePosition = data.mousePosition;
        }
        if (data.showOHLC !== undefined) {
            this.data.showOHLC = data.showOHLC;
        }
        if (data.maIndicatorValues !== undefined) {
            this.data.maIndicatorValues = data.maIndicatorValues;
        }
        if (data.emaIndicatorValues !== undefined) {
            this.data.emaIndicatorValues = data.emaIndicatorValues;
        }
        if (data.bollingerBandsValues !== undefined) {
            this.data.bollingerBandsValues = data.bollingerBandsValues;
        }
        if (data.ichimokuValues !== undefined) {
            this.data.ichimokuValues = data.ichimokuValues;
        }
        if (data.donchianChannelValues !== undefined) {
            this.data.donchianChannelValues = data.donchianChannelValues;
        }
        if (data.envelopeValues !== undefined) {
            this.data.envelopeValues = data.envelopeValues;
        }
        if (data.vwapValue !== undefined) {
            this.data.vwapValue = data.vwapValue;
        }

        if (needsRender || data.currentOHLC !== undefined || data.showOHLC !== undefined) {
            this.render();
        } else {
            this.updateValuesOnly();
        }
    }

    private updateValuesOnly(): void {
        if (!this.rootEl) return;
        const valueSpans = this.rootEl.querySelectorAll('[data-indicator-value]');
        valueSpans.forEach(span => {
            const key = span.getAttribute('data-indicator-value');
            if (key) {
                const value = this.getIndicatorValueByKey(key);
                span.textContent = value.toFixed(2);
            }
        });
        if (this.data.currentOHLC && this.data.mousePosition && this.data.showOHLC) {
            const ohlcContainer = this.rootEl.querySelector('.chart-info-ohlc');
            if (ohlcContainer) {
                const { currentOHLC } = this.data;
                const colors = this.theme.getColors();
                const closeColor = currentOHLC.close >= currentOHLC.open
                    ? colors.chartCandleUp
                    : colors.chartCandleDown;
                ohlcContainer.innerHTML = `
                    <span style="font-size: 12px;">O:${currentOHLC.open.toFixed(2)}</span>
                    <span style="font-size: 12px;">H:${currentOHLC.high.toFixed(2)}</span>
                    <span style="font-size: 12px;">L:${currentOHLC.low.toFixed(2)}</span>
                    <span style="font-size: 12px; color: ${closeColor};">C:${currentOHLC.close.toFixed(2)}</span>
                    <span style="opacity: 0.7; font-size: 12px;">${currentOHLC.time}</span>
                `;
            }
        }
    }

    private getIndicatorValueByKey(key: string): number {
        const parts = key.split('|');
        const type = parts[0] as MainChartIndicatorType;
        const paramValue = parseInt(parts[2], 10);
        switch (type) {
            case MainChartIndicatorType.MA:
                return this.data.maIndicatorValues?.[`MA${paramValue}`] ?? 0;
            case MainChartIndicatorType.EMA:
                return this.data.emaIndicatorValues?.[`EMA${paramValue}`] ?? 0;
            case MainChartIndicatorType.BOLLINGER:
                const paramName = parts[1];
                return this.data.bollingerBandsValues?.[paramName] ?? 0;
            case MainChartIndicatorType.ICHIMOKU:
                const ichimokuParamName = parts[1];
                return this.data.ichimokuValues?.[ichimokuParamName] ?? 0;
            case MainChartIndicatorType.DONCHIAN:
                const donchianParamName = parts[1];
                return this.data.donchianChannelValues?.[donchianParamName] ?? 0;
            case MainChartIndicatorType.ENVELOPE:
                const envelopeParamName = parts[1];
                return this.data.envelopeValues?.[envelopeParamName] ?? 0;
            case MainChartIndicatorType.VWAP:
                const vwap = this.data.vwapValue;
                return typeof vwap === 'number' && !isNaN(vwap) ? vwap : 0;
            default:
                return 0;
        }
    }

    private getActualIndicatorValue(
        type: MainChartIndicatorType | null,
        paramName: string,
        paramValue: number
    ): number {
        switch (type) {
            case MainChartIndicatorType.MA:
                return this.data.maIndicatorValues?.[`MA${paramValue}`] ?? 0;
            case MainChartIndicatorType.EMA:
                return this.data.emaIndicatorValues?.[`EMA${paramValue}`] ?? 0;
            case MainChartIndicatorType.BOLLINGER:
                return this.data.bollingerBandsValues?.[paramName] ?? 0;
            case MainChartIndicatorType.ICHIMOKU:
                return this.data.ichimokuValues?.[paramName] ?? 0;
            case MainChartIndicatorType.DONCHIAN:
                return this.data.donchianChannelValues?.[paramName] ?? 0;
            case MainChartIndicatorType.ENVELOPE:
                return this.data.envelopeValues?.[paramName] ?? 0;
            case MainChartIndicatorType.VWAP:
                const vwap = this.data.vwapValue;
                return typeof vwap === 'number' && !isNaN(vwap) ? vwap : 0;
            default:
                return 0;
        }
    }

    private getIndicatorDisplayName(type: MainChartIndicatorType): string {
        switch (type) {
            case MainChartIndicatorType.MA: return this.i18n.indicators.ma;
            case MainChartIndicatorType.EMA: return this.i18n.indicators.ema;
            case MainChartIndicatorType.BOLLINGER: return this.i18n.indicators.bollinger;
            case MainChartIndicatorType.ICHIMOKU: return this.i18n.indicators.ichimoku;
            case MainChartIndicatorType.DONCHIAN: return this.i18n.indicators.donchian;
            case MainChartIndicatorType.ENVELOPE: return this.i18n.indicators.envelope;
            case MainChartIndicatorType.VWAP: return this.i18n.indicators.vwap;
            default: return this.i18n.Indicators;
        }
    }

    private renderEyeIcon(isVisible: boolean, iconColor: string): string {
        if (isVisible) {
            return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </svg>`;
        } else {
            return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </svg>`;
        }
    }

    private renderIndicatorWithValues(item: MainChartIndicatorInfo, colors: ThemeColors): string {
        if (!item.params) return '';
        const isVisible = this.currentVisibleTypes.some(t => String(t) === String(item.type));
        if (!isVisible) return '';
        return `
    <div style="display: flex; gap: 8px; align-items: center; margin-left: 8px; opacity: 0.7; font-size: 11px; flex-wrap: wrap; max-width: 1000px;">
        ${item.params.map((param: MainChartIndicatorParam, index: number) => {
            const displayText = `${param.paramName}(${param.paramValue})`;
            const value = this.getActualIndicatorValue(item.type, param.paramName, param.paramValue);
            const displayValue = typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : '--';
            return `
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span
                            class="chart-info-param-name"
                            data-param-index="${index}"
                            data-indicator-id="${item.id}"
                            data-param-name="${param.paramName}"
                            data-param-value="${param.paramValue}"
                            style="cursor: pointer; padding: 1px 4px; border-radius: 2px; transition: all 0.2s; white-space: nowrap;"
                        >
                            ${displayText}
                        </span>
                        <span
                            style="color: ${param.lineColor}; font-weight: bold; white-space: nowrap; min-width: 50px;"
                            data-indicator-value="${item.type}|${param.paramName}|${param.paramValue}"
                        >
                            ${displayValue}
                        </span>
                    </div>
                `;
        }).join('')}
    </div>
    `;
    }

    private renderNormalIndicatorParams(item: MainChartIndicatorInfo, colors: ThemeColors): string {
        if (!item.params) return '';
        const isVisible = this.currentVisibleTypes.some(t => String(t) === String(item.type));
        if (!isVisible) return '';
        return `
    <div style="display: flex; align-items: center; margin-left: 8px; opacity: 0.7; font-size: 11px; white-space: nowrap; flex-wrap: nowrap;">
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            ${item.params.map((param: MainChartIndicatorParam, index: number) => {
            const isVWAP = item.type === MainChartIndicatorType.VWAP;
            const displayText = isVWAP
                ? `${param.paramName}`
                : `${param.paramName}(${param.paramValue})`;
            const value = this.getActualIndicatorValue(item.type, param.paramName, param.paramValue);
            const displayValue = typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : '--';
            return `
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span
                            class="chart-info-param-value"
                            data-param-index="${index}"
                            data-indicator-id="${item.id}"
                            data-param-name="${param.paramName}"
                            data-param-value="${param.paramValue}"
                            style="cursor: pointer; padding: 1px 4px; border-radius: 2px; transition: all 0.2s; white-space: nowrap;"
                        >
                            ${displayText}
                        </span>
                        <span
                            style="color: ${param.lineColor}; font-weight: bold; white-space: nowrap; min-width: 50px;"
                            data-indicator-value="${item.type}|${param.paramName}|${param.paramValue}"
                        >
                            ${displayValue}
                        </span>
                    </div>
                `;
        }).join('')}
        </div>
    </div>
    `;
    }

    private getFilteredIndicators(): MainChartIndicatorInfo[] {
        const listItems = this.data.indicators || getDefaultMainChartIndicators();
        return listItems.filter(item =>
            item.type !== MainChartIndicatorType.HEATMAP &&
            item.type !== MainChartIndicatorType.MARKETPROFILE
        );
    }

    private handleParamEdit(indicatorId: string, paramIndex: number, currentParamName: string, currentParamValue: number): void {
        const indicator = this.data.indicators?.find(i => i.id === indicatorId);
        if (!indicator || !indicator.params) return;

        const newValue = prompt(`${this.i18n.modal.parameterName} ${currentParamName}`, currentParamValue.toString());
        if (newValue !== null) {
            const newParams = [...indicator.params];
            newParams[paramIndex] = {
                ...newParams[paramIndex],
                paramValue: Number(newValue)
            };
            this.options.onEditIndicatorParams?.(indicatorId, newParams);
        }
    }

    private handleParamNameEdit(indicatorId: string, paramIndex: number, currentParamName: string): void {
        const indicator = this.data.indicators?.find(i => i.id === indicatorId);
        if (!indicator || !indicator.params) return;

        const newParamName = prompt(this.i18n.modal.parameterName, currentParamName);
        if (newParamName !== null) {
            const newParams = [...indicator.params];
            newParams[paramIndex] = {
                ...newParams[paramIndex],
                paramName: newParamName
            };
            this.options.onEditIndicatorParams?.(indicatorId, newParams);
        }
    }

    private bindEvents(): void {
        if (!this.rootEl) return;
        if ((this.rootEl as any).__delegateHandler) {
            this.rootEl.removeEventListener('click', (this.rootEl as any).__delegateHandler);
        }
        const handler = (e: Event) => {
            e.stopPropagation();
            e.preventDefault();
            const target = e.target as HTMLElement;
            const toggleBtn = target.closest('.chart-info-toggle-indicator');
            if (toggleBtn) {
                e.stopPropagation();
                const typeAttr = toggleBtn.getAttribute('data-indicator-type');
                if (typeAttr) {
                    const indicatorType = typeAttr as MainChartIndicatorType;
                    const normalizedType = String(indicatorType);
                    const isVisible = this.currentVisibleTypes.some(t => String(t) === normalizedType);

                    if (isVisible) {
                        this.currentVisibleTypes = this.currentVisibleTypes.filter(t => String(t) !== normalizedType);
                    } else {
                        this.currentVisibleTypes = [...this.currentVisibleTypes, indicatorType];
                    }
                    this.visibleIndicatorsMap.set(indicatorType, !isVisible);
                    this.options.onToggleIndicator?.(indicatorType);
                    this.render();
                }
                return;
            }
            const ohlcEye = target.closest('.chart-info-eye-icon');
            if (ohlcEye && !ohlcEye.hasAttribute('data-indicator-type')) {
                this.data.showOHLC = !this.data.showOHLC;
                this.options.onToggleOHLC?.();
                this.render();
                return;
            }
            const removeBtn = target.closest('.chart-info-remove-indicator');
            if (removeBtn) {
                const type = removeBtn.getAttribute('data-indicator-type');
                if (type) {
                    this.options.onRemoveIndicator?.(type as MainChartIndicatorType);
                }
                return;
            }
            const settingsBtn = target.closest('.chart-info-settings-indicator');
            if (settingsBtn) {
                const indicatorId = settingsBtn.getAttribute('data-indicator-id');
                if (indicatorId) {
                    const indicator = this.data.indicators?.find(i => i.id === indicatorId);
                    if (indicator) {
                        this.options.onOpenIndicatorSettings?.(indicator);
                    }
                }
                return;
            }
            const paramValue = target.closest('.chart-info-param-value');
            if (paramValue) {
                const indicatorId = paramValue.getAttribute('data-indicator-id');
                const paramIndex = parseInt(paramValue.getAttribute('data-param-index') || '0', 10);
                const paramName = paramValue.getAttribute('data-param-name') || '';
                const paramValueNum = parseInt(paramValue.getAttribute('data-param-value') || '0', 10);
                if (indicatorId) {
                    this.handleParamEdit(indicatorId, paramIndex, paramName, paramValueNum);
                }
                return;
            }
            const paramNameSpan = target.closest('.chart-info-param-name');
            if (paramNameSpan) {
                const indicatorId = paramNameSpan.getAttribute('data-indicator-id');
                const paramIndex = parseInt(paramNameSpan.getAttribute('data-param-index') || '0', 10);
                const paramName = paramNameSpan.getAttribute('data-param-name') || '';
                if (indicatorId) {
                    this.handleParamNameEdit(indicatorId, paramIndex, paramName);
                }
                return;
            }
        };
        this.rootEl.addEventListener('click', handler);
        (this.rootEl as any).__delegateHandler = handler;
    }

    public updateTheme(theme: Theme): void {
        this.theme = theme;
        this.render();
    }

    public updateI18n(i18n: I18n): void {
        this.i18n = i18n;
        this.render();
    }

    private render(): void {
        const colors = this.theme.getColors();
        const listItems = this.getFilteredIndicators();
        const { currentOHLC, mousePosition, showOHLC } = this.data;
        const html = `
            <div class="chart-info-root" style="
                position: absolute;
                top: 5px;
                left: 5px;
                z-index: 20;
                pointer-events: none;
                max-width: calc(100vw - 200px);
                width: auto;
            ">
                <div style="
                    padding: 4px 8px;
                    font-size: 11px;
                    font-family: Arial, sans-serif;
                    color: ${colors.textColor};
                    line-height: 1.1;
                    display: inline-block;
                    max-width: 100%;
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        flex-wrap: wrap;
                        max-width: 100%;
                    ">
                        <span style="font-weight: bold; font-size: 14px;">${this.title}</span>
                        <span
                            class="chart-info-eye-icon"
                            style="
                                cursor: pointer;
                                pointer-events: auto;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 20px;
                                height: 20px;
                                opacity: ${showOHLC ? 1 : 0.5};
                                user-select: none;
                                transition: all 0.2s;
                                padding: 2px;
                                border-radius: 3px;
                            "
                        >
                            ${this.renderEyeIcon(showOHLC, colors.textColor)}
                        </span>
                        ${currentOHLC && mousePosition && showOHLC ? `
                            <div class="chart-info-ohlc" style="
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                flex-wrap: wrap;
                                max-width: 100%;
                            ">
                                <span style="font-size: 12px;">O:${currentOHLC.open.toFixed(2)}</span>
                                <span style="font-size: 12px;">H:${currentOHLC.high.toFixed(2)}</span>
                                <span style="font-size: 12px;">L:${currentOHLC.low.toFixed(2)}</span>
                                <span style="font-size: 12px; color: ${currentOHLC.close >= currentOHLC.open ? colors.chartCandleUp : colors.chartCandleDown};">
                                    C:${currentOHLC.close.toFixed(2)}
                                </span>
                                <span style="opacity: 0.7; font-size: 12px;">${currentOHLC.time}</span>
                            </div>
                        ` : '<span style="opacity: 0.7; font-style: italic;"></span>'}
                    </div>
                </div>
                <div style="
                    pointer-events: auto;
                    background: transparent;
                    display: flex;
                    flex-direction: column;
                    flex-wrap: wrap;
                    gap: 2px;
                    max-height: 200px;
                ">
                    ${listItems.map(item => {
            if (!item.type) return '';
            const isVisible = this.currentVisibleTypes?.some(t => String(t) === String(item.type)) ?? true;
            const indicatorName = this.getIndicatorDisplayName(item.type);
            return `
                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    padding: 4px 8px;
                                    font-size: 12px;
                                    color: ${colors.textColor};
                                    background: transparent;
                                    width: fit-content;
                                    min-width: auto;
                                    opacity: ${isVisible ? 1 : 0.5};
                                    flex-wrap: wrap;
                                    gap: 4px;
                                "
                            >
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    margin-right: 12px;
                                    white-space: nowrap;
                                ">
                                    <span>${indicatorName}</span>
                                </div>
                                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                                    <span
    class="chart-info-toggle-indicator"
    data-indicator-type="${item.type}"
    style="
        cursor: pointer;
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 4px;
    "
    onmouseenter="this.style.backgroundColor='${colors.buttonHover}';"
    onmouseleave="this.style.backgroundColor='transparent';"
>
    ${this.renderEyeIcon(isVisible, colors.textColor)}
</span>
                                     <button
    class="chart-info-settings-indicator"
    data-indicator-id="${item.id}"
    style="
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${colors.textColor};
        opacity: 0.85;
    "
    onmouseenter="this.style.backgroundColor='${colors.buttonHover}'; this.style.opacity='1';"
    onmouseleave="this.style.backgroundColor='transparent'; this.style.opacity='0.85';"
>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
</button>
<button
    class="chart-info-remove-indicator"
    data-indicator-type="${item.type}"
    style="
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${colors.textColor};
        opacity: 0.85;
    "
    onmouseenter="this.style.backgroundColor='${colors.buttonHover}'; this.style.opacity='1';"
    onmouseleave="this.style.backgroundColor='transparent'; this.style.opacity='0.85';"
>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
</button>
                                    ${item.type === MainChartIndicatorType.MA || item.type === MainChartIndicatorType.EMA
                    ? this.renderIndicatorWithValues(item, colors)
                    : this.renderNormalIndicatorParams(item, colors)
                }
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;

        if (this.rootEl) {
            this.rootEl.innerHTML = html;
        } else {
            this.rootEl = document.createElement('div');
            this.rootEl.innerHTML = html;
            this.container.appendChild(this.rootEl);
        }

    }

    public show(): void {
        if (this.rootEl) {
            this.render();
            this.rootEl.style.display = '';
        }
    }

    public hide(): void {
        if (this.rootEl) {
            this.rootEl.style.display = 'none';
        }
    }

    public destroy(): void {
        if (this.rootEl) {
            this.rootEl.remove();
            this.rootEl = null;
        }
    }
}