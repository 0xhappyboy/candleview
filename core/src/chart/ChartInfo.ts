import { I18n } from '../i18n';
import { getDefaultMainChartIndicators, MainChartIndicatorInfo, MainChartIndicatorParam } from '../Indicators/MainChart/MainChartIndicatorInfo';
import { Theme, ThemeColors } from '../theme';
import { MainChartIndicatorType, Point } from '../types';

export interface ChartInfoOptions {
    container: HTMLElement;
    theme: Theme;
    i18n: I18n;
    title?: string;
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
    private options: ChartInfoOptions;
    private data: ChartInfoData;
    private rootEl: HTMLElement | null = null;
    private visibleIndicatorsMap: Map<MainChartIndicatorType, boolean> = new Map();

    constructor(options: ChartInfoOptions) {
        this.container = options.container;
        this.theme = options.theme;
        this.i18n = options.i18n;
        this.options = options;

        const indicators = options.indicators || getDefaultMainChartIndicators();
        indicators.forEach(item => {
            if (item.type) {
                this.visibleIndicatorsMap.set(item.type, true);
            }
        });

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
    }

    public updateData(data: Partial<ChartInfoData>): void {
        let needsRender = false;

        if (data.indicators !== undefined) {
            const newIndicators = data.indicators || getDefaultMainChartIndicators();
            newIndicators.forEach(item => {
                if (item.type) {
                    if (!this.visibleIndicatorsMap.has(item.type)) {
                        this.visibleIndicatorsMap.set(item.type, item.visible !== false);
                    } else {
                        if (item.visible !== undefined) {
                            this.visibleIndicatorsMap.set(item.type, item.visible);
                        }
                    }
                }
            });
            needsRender = true;
        }

        if (data.visibleIndicatorTypes !== undefined) {
            const visibleSet = new Set(data.visibleIndicatorTypes);
            this.visibleIndicatorsMap.forEach((_, type) => {
                const shouldBeVisible = visibleSet.has(type);
                if (this.visibleIndicatorsMap.get(type) !== shouldBeVisible) {
                    this.visibleIndicatorsMap.set(type, shouldBeVisible);
                }
            });
            needsRender = true;
        }

        Object.assign(this.data, data);

        if (needsRender || data.currentOHLC !== undefined || data.showOHLC !== undefined) {
            this.render();
        } else {
            this.updateValuesOnly();
        }
    }

    private handleToggleIndicator = (type: MainChartIndicatorType | null) => {
        if (!type) return;
        const newVisibility = !(this.visibleIndicatorsMap.get(type) ?? true);
        this.visibleIndicatorsMap.set(type, newVisibility);
        this.render();
        this.options.onToggleIndicator?.(type);
    };



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
        const paramName = parts[1];
        const paramValue = parseInt(parts[2], 10);

        switch (type) {
            case MainChartIndicatorType.MA:
                return this.data.maIndicatorValues?.[paramName + paramValue] || 0;
            case MainChartIndicatorType.EMA:
                return this.data.emaIndicatorValues?.[paramName + paramValue] || 0;
            case MainChartIndicatorType.BOLLINGER:
                return this.data.bollingerBandsValues?.[paramName] || 0;
            case MainChartIndicatorType.ICHIMOKU:
                return this.data.ichimokuValues?.[paramName] || 0;
            case MainChartIndicatorType.DONCHIAN:
                return this.data.donchianChannelValues?.[paramName] || 0;
            case MainChartIndicatorType.ENVELOPE:
                return this.data.envelopeValues?.[paramName] || 0;
            case MainChartIndicatorType.VWAP:
                return this.data.vwapValue || 0;
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
                return this.data.maIndicatorValues?.[paramName + paramValue] || 0;
            case MainChartIndicatorType.EMA:
                return this.data.emaIndicatorValues?.[paramName + paramValue] || 0;
            case MainChartIndicatorType.BOLLINGER:
                return this.data.bollingerBandsValues?.[paramName] || 0;
            case MainChartIndicatorType.ICHIMOKU:
                return this.data.ichimokuValues?.[paramName] || 0;
            case MainChartIndicatorType.DONCHIAN:
                return this.data.donchianChannelValues?.[paramName] || 0;
            case MainChartIndicatorType.ENVELOPE:
                return this.data.envelopeValues?.[paramName] || 0;
            case MainChartIndicatorType.VWAP:
                return this.data.vwapValue || 0;
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
        return `
        <div style="display: flex; gap: 8px; align-items: center; margin-left: 8px; opacity: 0.7; font-size: 11px; flex-wrap: wrap; max-width: 1000px;">
            ${item.params.map((param: MainChartIndicatorParam, index: number) => {
            const displayText = `${param.paramName}(${param.paramValue})`;
            const value = this.getActualIndicatorValue(item.type, param.paramName, param.paramValue);
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
                            ${value.toFixed(2)}
                        </span>
                    </div>
                `;
        }).join('')}
        </div>
    `;
    }

    private renderNormalIndicatorParams(item: MainChartIndicatorInfo, colors: ThemeColors): string {
        if (!item.params) return '';
        return `
        <div style="display: flex; align-items: center; margin-left: 8px; opacity: 0.7; font-size: 11px; white-space: nowrap; flex-wrap: nowrap;">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                ${item.params.map((param: MainChartIndicatorParam, index: number) => {
            const displayText = `${param.paramName}(${param.paramValue})`;
            const value = this.getActualIndicatorValue(item.type, param.paramName, param.paramValue);
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
                                ${value.toFixed(2)}
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
        return listItems;
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
        const eyeIcon = this.rootEl.querySelector('.chart-info-eye-icon');
        if (eyeIcon) {
            eyeIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.data.showOHLC = !this.data.showOHLC;
                this.options.onToggleOHLC?.();
                this.render();
            });
        }
        const toggleButtons = this.rootEl.querySelectorAll('.chart-info-toggle-indicator');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = btn.getAttribute('data-indicator-type');
                if (type) {
                    const indicatorType = type as MainChartIndicatorType;
                    const currentVisibility = this.visibleIndicatorsMap.get(indicatorType) ?? true;
                    this.visibleIndicatorsMap.set(indicatorType, !currentVisibility);
                    this.options.onToggleIndicator?.(indicatorType);
                    this.render();
                }
            });
        });
        const removeButtons = this.rootEl.querySelectorAll('.chart-info-remove-indicator');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = btn.getAttribute('data-indicator-type');
                if (type) {
                    this.options.onRemoveIndicator?.(type as MainChartIndicatorType);
                }
            });
        });
        const settingsButtons = this.rootEl.querySelectorAll('.chart-info-settings-indicator');
        settingsButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const indicatorId = btn.getAttribute('data-indicator-id');
                if (indicatorId) {
                    const indicator = this.data.indicators?.find(i => i.id === indicatorId);
                    if (indicator) {
                        this.options.onOpenIndicatorSettings?.(indicator);
                    }
                }
            });
        });
        const paramValueSpans = this.rootEl.querySelectorAll('.chart-info-param-value');
        paramValueSpans.forEach(span => {
            span.addEventListener('click', (e) => {
                e.stopPropagation();
                const indicatorId = span.getAttribute('data-indicator-id');
                const paramIndex = parseInt(span.getAttribute('data-param-index') || '0', 10);
                const paramName = span.getAttribute('data-param-name') || '';
                const paramValue = parseInt(span.getAttribute('data-param-value') || '0', 10);
                if (indicatorId) {
                    this.handleParamEdit(indicatorId, paramIndex, paramName, paramValue);
                }
            });
        });
        const paramNameSpans = this.rootEl.querySelectorAll('.chart-info-param-name');
        paramNameSpans.forEach(span => {
            span.addEventListener('click', (e) => {
                e.stopPropagation();
                const indicatorId = span.getAttribute('data-indicator-id');
                const paramIndex = parseInt(span.getAttribute('data-param-index') || '0', 10);
                const paramName = span.getAttribute('data-param-name') || '';
                if (indicatorId) {
                    this.handleParamNameEdit(indicatorId, paramIndex, paramName);
                }
            });
        });
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
                        <span style="font-weight: bold; font-size: 14px;">${this.options.title || this.i18n.Indicators}</span>
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
            if (!item.type || !this.visibleIndicatorsMap.has(item.type)) return '';
            const isVisible = this.visibleIndicatorsMap.get(item.type) ?? true;
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
                                            width: 16px;
                                            height: 16px;
                                            margin-left: 0px;
                                            margin-right: 0px;
                                            user-select: none;
                                            transition: all 0.2s;
                                            padding: 1px;
                                            border-radius: 3px;
                                        "
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
                                            padding: 2px;
                                            border-radius: 3px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: ${colors.textColor};
                                            opacity: 0.7;
                                            transition: all 0.2s;
                                        "
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                                            padding: 2px;
                                            border-radius: 3px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: ${colors.textColor};
                                            opacity: 0.7;
                                            transition: all 0.2s;
                                        "
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

        this.bindEvents();
    }

    public show(): void {
        if (this.rootEl) {
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