import { Theme } from '../../theme';
import { MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from '../../types';
import { getAllTimeframes, getMainIndicators, getMainChartMaps, getSubChartIndicators, timezones } from './Config';
import { handleMainIndicatorToggle, handleSubChartIndicatorToggle } from './IndicatorProcessing';
import { I18n } from '../../i18n';
import { TopPanelState } from './TopPanelState';
import { MainChartIndicatorInfo } from '../../Indicators/mainchart/MainChartIndicatorInfo';

export interface TopPanelOptions {
    container: HTMLElement;
    theme: Theme;
    i18n: I18n;
    activeTimeframe?: TimeframeEnum;
    activeMainChartType?: MainChartType;
    currentTimezone?: string;
    onTimeframeSelect?: (timeframe: TimeframeEnum) => void;
    onChartTypeSelect?: (type: MainChartType) => void;
    onIndicatorSelect?: (indicator: string) => void;
    onMainChartIndicatorSelect?: (indicator: MainChartIndicatorInfo) => void;
    onSubChartIndicatorSelect?: (indicators: SubChartIndicatorType[]) => void;
    onThemeToggle?: () => void;
    onCameraClick?: () => void;
    onFullscreenClick?: () => void;
    onTimezoneSelect?: (timezone: string) => void;
    state: TopPanelState;
    onStateChange: (updates: Partial<TopPanelState>) => void;
}

export class TopPanel {
    public options: TopPanelOptions;
    private theme: Theme;
    private i18n: I18n;
    private element: HTMLElement | null = null;
    private container: HTMLElement;
    private state: TopPanelState;

    private modalElement: HTMLElement | null = null;

    constructor(options: TopPanelOptions) {
        this.options = options;
        this.container = options.container;
        this.theme = options.theme;
        this.i18n = options.i18n;
        this.state = options.state;
        this.init();
    }

    private injectScrollbarStyles(): void {
        if (document.getElementById('candleview-top-scrollbar-styles')) return;
        const style = document.createElement('style');
        style.id = 'candleview-top-scrollbar-styles';
        style.textContent = `
        .modal-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .modal-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(128, 128, 128, 0.5);
            border-radius: 3px;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(128, 128, 128, 0.7);
        }
        .modal-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(128, 128, 128, 0.5) transparent;
        }
    `;
        document.head.appendChild(style);
    }

    private init(): void {
        this.injectScrollbarStyles();
        this.createDOM();
        this.bindEvents();
    }

    private createDOM(): void {
        const colors = this.theme.getColors();

        this.element = document.createElement('div');
        this.element.className = 'candleview-top-panel';
        this.element.style.cssText = `
            background: ${colors.panelBg};
            border-bottom: 1px solid ${colors.panelBorder};
            padding: 8px 0;
            display: flex;
            align-items: center;
            height: 43px;
            box-sizing: border-box;
            gap: 0;
            position: relative;
            overflow-x: auto;
            overflow-y: hidden;
        `;

        const scrollContainer = document.createElement('div');
        scrollContainer.style.cssText = `
            flex: 1;
            overflow-x: auto;
            overflow-y: hidden;
            display: flex;
            align-items: center;
            gap: 0;
            padding: 0 13px;
            scrollbar-width: none;
        `;

        const timeframeBtn = this.createButton(this.options.activeTimeframe || '15m', 'timeframe');
        timeframeBtn.onclick = () => this.toggleModal('timeframe');
        scrollContainer.appendChild(timeframeBtn);
        scrollContainer.appendChild(this.createDivider());

        const timezoneDisplay = this.getCurrentTimezoneDisplayName();
        const timezoneBtn = this.createIconButton(this.getClockIcon(), timezoneDisplay, 'timezone');

        timezoneBtn.onclick = () => this.toggleModal('timezone');
        scrollContainer.appendChild(timezoneBtn);
        scrollContainer.appendChild(this.createDivider());

        const chartTypeBtn = this.createIconButton(
            this.getChartTypeIconForType(this.state.currentMainChartType, this.theme.getColors().buttonColor),
            '',
            'chart-type'
        );
        chartTypeBtn.onclick = () => this.toggleModal('chartType');
        scrollContainer.appendChild(chartTypeBtn);
        scrollContainer.appendChild(this.createDivider());

        const indicatorBtn = this.createIconButton(this.getFunctionIcon(), this.i18n.t('Indicators'), 'indicator');
        indicatorBtn.onclick = () => this.toggleModal('indicator');
        scrollContainer.appendChild(indicatorBtn);
        scrollContainer.appendChild(this.createDivider());

        const cameraBtn = this.createIconButton(this.getCameraIcon(), '', 'camera');
        cameraBtn.onclick = () => this.options.onCameraClick?.();
        scrollContainer.appendChild(cameraBtn);
        scrollContainer.appendChild(this.createDivider());

        const fullscreenBtn = this.createIconButton(this.getFullscreenIcon(), '', 'fullscreen');
        fullscreenBtn.onclick = () => this.options.onFullscreenClick?.();
        scrollContainer.appendChild(fullscreenBtn);
        scrollContainer.appendChild(this.createDivider());

        const themeBtn = this.createThemeToggle();
        themeBtn.onclick = () => this.options.onThemeToggle?.();
        scrollContainer.appendChild(themeBtn);

        this.element.appendChild(scrollContainer);
        this.container.appendChild(this.element);
    }

    private createButton(text: string, type: string): HTMLElement {
        const colors = this.theme.getColors();
        const isDark = this.theme.isDark();
        const hoverColor = isDark ? colors.buttonHover : '#E1E5E9';

        const btn = document.createElement('button');
        btn.textContent = text;
        btn.className = `top-btn-${type}`;
        btn.style.cssText = `
        background: transparent;
        border: none;
        border-radius: 0;
        padding: 7px 11px;
        cursor: pointer;
        color: ${colors.buttonColor};
        font-size: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 7px;
        transition: all 0.1s ease;
        min-height: 31px;
        white-space: nowrap;
    `;
        btn.onmouseenter = () => { btn.style.background = hoverColor; };
        btn.onmouseleave = () => { btn.style.background = 'transparent'; };
        return btn;
    }

    private createIconButton(icon: string, text: string, type: string): HTMLElement {
        const colors = this.theme.getColors();
        const isDark = this.theme.isDark();
        const hoverColor = isDark ? colors.buttonHover : '#E1E5E9';

        const btn = document.createElement('button');
        btn.className = `top-btn-${type}`;
        btn.style.cssText = `
        background: transparent;
        border: none;
        border-radius: 0;
        padding: 7px 11px;
        cursor: pointer;
        color: ${colors.buttonColor};
        font-size: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        transition: all 0.1s ease;
        min-height: 31px;
        white-space: nowrap;
    `;
        const iconSpan = document.createElement('span');
        iconSpan.className = 'icon-span';
        iconSpan.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    `;
        iconSpan.innerHTML = icon;
        btn.appendChild(iconSpan);
        if (text && text.trim() !== '') {
            const textSpan = document.createElement('span');
            textSpan.textContent = text;
            btn.appendChild(textSpan);
        }
        btn.onmouseenter = () => { btn.style.background = hoverColor; };
        btn.onmouseleave = () => { btn.style.background = 'transparent'; };
        return btn;
    }

    private createThemeToggle(): HTMLElement {
        const colors = this.theme.getColors();
        const isDark = this.theme.isDark();
        const hoverColor = isDark ? colors.buttonHover : '#E1E5E9';

        const btn = document.createElement('button');
        btn.className = 'theme-toggle-btn';
        btn.style.cssText = `
        background: transparent;
        border: none;
        border-radius: 20px;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: ${isDark ? 'flex-end' : 'flex-start'};
        width: 44px;
        height: 24px;
        transition: all 0.3s ease;
        position: relative;
    `;
        const track = document.createElement('div');
        track.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: ${isDark ? '#2D323D' : '#E1E5E9'};
        border-radius: 20px;
        transition: all 0.3s ease;
    `;
        btn.appendChild(track);
        const slider = document.createElement('div');
        slider.style.cssText = `
        position: relative;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${colors.buttonActive};
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
    `;
        slider.innerHTML = isDark
            ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
            : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="4.22"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

        btn.appendChild(slider);
        const updateThemeToggle = (dark: boolean) => {
            btn.style.justifyContent = dark ? 'flex-end' : 'flex-start';
            if (track) {
                track.style.background = dark ? '#2D323D' : '#E1E5E9';
            }
            slider.innerHTML = dark
                ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
                : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="4.22"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
        };
        (btn as any).updateThemeToggle = updateThemeToggle;
        btn.onmouseenter = () => { btn.style.background = hoverColor; };
        btn.onmouseleave = () => { btn.style.background = 'transparent'; };
        return btn;
    }

    private createDivider(): HTMLElement {
        const colors = this.theme.getColors();
        const isDark = this.theme.isDark();
        const dividerColor = isDark ? colors.panelBorder : '#EEEEEE';
        const divider = document.createElement('div');
        divider.style.cssText = `
        width: 1px;
        height: 16px;
        background: ${dividerColor};
        margin: 0 4px;
    `;
        return divider;
    }

    private toggleModal(type: string): void {
        this.closeModal();

        switch (type) {
            case 'timeframe':
                this.showTimeframeModal();
                break;
            case 'chartType':
                this.showChartTypeModal();
                break;
            case 'indicator':
                this.showIndicatorModal();
                break;
            case 'timezone':
                this.showTimezoneModal();
                break;
        }
    }

    private getMaxModalHeight(): number {
        const viewportHeight = window.innerHeight;
        const btnRect = this.element?.querySelector('.top-btn-timeframe')?.getBoundingClientRect();
        const topPosition = btnRect ? btnRect.bottom + 5 : 50;
        return viewportHeight - topPosition - 20;
    }

    private showTimeframeModal(): void {
        const colors = this.theme.getColors();
        const allTimeframeGroups = getAllTimeframes(this.i18n);
        const btnRect = this.element?.querySelector('.top-btn-timeframe')?.getBoundingClientRect();
        const self = this;

        this.modalElement = document.createElement('div');
        this.modalElement.className = 'candleview-modal modal-scrollbar';
        this.modalElement.style.cssText = `
        position: absolute;
        top: ${btnRect ? btnRect.bottom + 5 : 50}px;
        left: ${btnRect ? btnRect.left : 20}px;
        background: ${colors.panelBg};
        border: 1px solid ${colors.panelBorder};
        min-width: 180px;
        max-height: ${this.getMaxModalHeight()}px;
        overflow-y: auto;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        z-index: 1000;
    `;

        const contentContainer = document.createElement('div');
        contentContainer.className = 'timeframe-content-container';
        this.modalElement.appendChild(contentContainer);

        allTimeframeGroups.forEach(function (group) {
            const isExpanded = self.state.timeframeSections[group.sectionKey as keyof typeof self.state.timeframeSections];
            const groupHeader = document.createElement('div');
            groupHeader.style.cssText = `
            padding: 10px 12px;
            cursor: pointer;
            color: ${colors.textColor};
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid ${colors.panelBorder};
        `;
            groupHeader.innerHTML = `<span>${group.type}</span><span>${isExpanded ? '▼' : '▶'}</span>`;
            groupHeader.onclick = (e) => {
                e.stopPropagation();
                self.setState({ timeframeSections: { ...self.state.timeframeSections, [group.sectionKey]: !isExpanded } });
                self.refreshTimeframeModalContent();
            };
            contentContainer.appendChild(groupHeader);

            if (isExpanded) {
                group.values.forEach(tf => {
                    const item = document.createElement('div');
                    item.textContent = tf;
                    item.style.cssText = `
                    padding: 8px 12px 8px 24px;
                    cursor: pointer;
                    color: ${colors.textColor};
                    font-size: 13px;
                `;
                    item.onclick = () => {
                        self.options.onTimeframeSelect?.(tf);
                        const timeframeBtn = self.element?.querySelector('.top-btn-timeframe');
                        if (timeframeBtn) {
                            timeframeBtn.textContent = tf;
                        }
                        self.closeModal();
                    };
                    item.onmouseenter = () => { item.style.background = colors.buttonHover; };
                    item.onmouseleave = () => { item.style.background = 'transparent'; };
                    contentContainer.appendChild(item);
                });
            }
        });

        document.body.appendChild(this.modalElement);
        this.bindOutsideClick();
    }

    private showChartTypeModal(): void {
        const colors = this.theme.getColors();
        const isDark = this.theme.isDark();
        const hoverColor = isDark ? colors.buttonHover : '#E1E5E9';
        const btnRect = this.element?.querySelector('.top-btn-chart-type')?.getBoundingClientRect();
        const chartTypes = [
            { type: MainChartType.Candle, name: this.i18n.t('candle') },
            { type: MainChartType.HollowCandle, name: this.i18n.t('hollowCandle') },
            { type: MainChartType.Bar, name: this.i18n.t('bar') },
            { type: MainChartType.BaseLine, name: this.i18n.t('baseline') },
            { type: MainChartType.Line, name: this.i18n.t('line') },
            { type: MainChartType.Area, name: this.i18n.t('area') },
            { type: MainChartType.StepLine, name: this.i18n.t('stepLine') },
            { type: MainChartType.HeikinAshi, name: this.i18n.t('heikinAshi') },
            { type: MainChartType.Histogram, name: this.i18n.t('histogram') },
            { type: MainChartType.LineBreak, name: this.i18n.t('linebreak') },
            { type: MainChartType.Mountain, name: this.i18n.t('mountain') },
            { type: MainChartType.BaselineArea, name: this.i18n.t('baselinearea') },
            { type: MainChartType.HighLow, name: this.i18n.t('highlow') },
            { type: MainChartType.HLCArea, name: this.i18n.t('hlcarea') }
        ];
        const modalHeight = this.getMaxModalHeight();
        const modalWidth = 200;
        let left = btnRect ? btnRect.left : 20;
        if (this.element) {
            const containerRect = this.element.getBoundingClientRect();
            const containerLeft = containerRect.left;
            const expectedRight = containerLeft + left + modalWidth;
            const containerRight = containerRect.right;
            if (expectedRight > containerRight) {
                const availableSpace = containerRight - containerLeft;
                if (availableSpace > modalWidth) {
                    left = availableSpace - modalWidth;
                } else {
                    left = 10;
                }
            }
        }
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'candleview-modal modal-scrollbar';
        this.modalElement.style.cssText = `
        position: absolute;
        top: ${btnRect ? btnRect.bottom + 5 : 50}px;
        left: ${left}px;
        background: ${colors.panelBg};
        border: 1px solid ${colors.panelBorder};
        min-width: 200px;
        max-height: ${modalHeight}px;
        overflow-y: auto;
        overflow-x: hidden;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        z-index: 1000;
    `;
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
        padding: 8px;
        border-bottom: 1px solid ${colors.panelBorder};
        flex-shrink: 0;
    `;
        const searchWrapper = document.createElement('div');
        searchWrapper.style.cssText = `position: relative; width: 100%;`;
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = this.i18n.t('searchChartTypes');
        searchInput.style.cssText = `
        width: 100%;
        box-sizing: border-box;
        padding: 8px 32px 8px 12px;
        background: ${colors.background};
        border: 1px solid ${colors.panelBorder};
        color: ${colors.textColor};
        border-radius: 0px;
        outline: none;
        font-size: 13px;
    `;
        searchInput.onfocus = (e) => {
            (e.target as HTMLInputElement).style.borderColor = colors.buttonActive;
        };
        searchInput.onblur = (e) => {
            (e.target as HTMLInputElement).style.borderColor = colors.panelBorder;
        };
        const contentContainer = document.createElement('div');
        contentContainer.className = 'chart-type-content-container';
        contentContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow-y: auto;
        flex: 1;
        padding: 8px;
        max-height: ${modalHeight - 73}px;
    `;
        contentContainer.classList.add('modal-scrollbar');
        const renderList = (searchTerm: string) => {
            contentContainer.innerHTML = '';
            const filteredTypes = chartTypes.filter(ct =>
                ct.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            filteredTypes.forEach(ct => {
                const isActive = this.options.activeMainChartType === ct.type;
                const item = document.createElement('div');
                item.style.cssText = `
                cursor: pointer;
                background: ${isActive ? colors.buttonActive : 'transparent'};
                color: ${isActive ? '#FFFFFF' : colors.textColor};
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.2s ease;
                min-height: 32px;
            `;
                const iconContainer = document.createElement('div');
                iconContainer.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            `;
                iconContainer.innerHTML = this.getChartTypeIconForType(ct.type, isActive ? '#FFFFFF' : colors.buttonColor);
                const nameSpan = document.createElement('span');
                nameSpan.textContent = ct.name;
                nameSpan.style.cssText = `
                font-size: 13px;
                font-weight: 500;
                flex: 1;
                text-align: left;
                color: ${isActive ? '#FFFFFF' : colors.textColor};
            `;

                item.appendChild(iconContainer);
                item.appendChild(nameSpan);

                item.onclick = () => {
                    this.options.onChartTypeSelect?.(ct.type);
                    const iconSpan = this.element?.querySelector('.top-btn-chart-type .icon-span');
                    if (iconSpan) {
                        iconSpan.innerHTML = this.getChartTypeIconForType(ct.type, this.theme.getColors().buttonColor);
                    }
                    this.closeModal();
                };
                item.onmouseenter = () => {
                    if (!isActive) {
                        item.style.background = hoverColor;
                    }
                };
                item.onmouseleave = () => {
                    if (!isActive) {
                        item.style.background = 'transparent';
                    }
                };
                contentContainer.appendChild(item);
            });
        };
        searchInput.oninput = (e) => {
            e.stopPropagation();
            renderList((e.target as HTMLInputElement).value);
        };
        const clearBtn = document.createElement('button');
        clearBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${colors.buttonColor}" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        clearBtn.style.cssText = `
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        color: ${colors.buttonColor};
        opacity: 0.6;
        transition: all 0.2s ease;
        padding: 0;
    `;
        clearBtn.onclick = () => {
            searchInput.value = '';
            renderList('');
            clearBtn.style.display = 'none';
        };
        clearBtn.onmouseenter = () => {
            clearBtn.style.background = colors.buttonHover;
            clearBtn.style.opacity = '1';
        };
        clearBtn.onmouseleave = () => {
            clearBtn.style.background = 'transparent';
            clearBtn.style.opacity = '0.6';
        };

        searchInput.addEventListener('input', () => {
            const val = searchInput.value;
            renderList(val);
            clearBtn.style.display = val ? 'flex' : 'none';
        });
        searchWrapper.appendChild(searchInput);
        searchWrapper.appendChild(clearBtn);
        searchContainer.appendChild(searchWrapper);
        this.modalElement.appendChild(searchContainer);
        this.modalElement.appendChild(contentContainer);
        document.body.appendChild(this.modalElement);
        renderList('');
        this.bindOutsideClick();
    }

    private getChartTypeIconForType(type: MainChartType, color: string): string {
        const size = 17;
        switch (type) {
            case MainChartType.Candle:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M6 5V2H18V5" stroke-linecap="round"/><path d="M6 19V22H18V19" stroke-linecap="round"/><rect x="5" y="5" width="14" height="14" fill="none"/><path d="M12 5V19" stroke-linecap="round"/></svg>`;
            case MainChartType.HollowCandle:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M6 5V2H18V5" stroke-linecap="round"/><path d="M6 19V22H18V19" stroke-linecap="round"/><rect x="5" y="5" width="14" height="14" fill="none"/><path d="M12 5V19" stroke-linecap="round"/><path d="M6 8H18" stroke-linecap="round"/><path d="M6 16H18" stroke-linecap="round"/></svg>`;
            case MainChartType.Bar:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M5 6V18" stroke-linecap="round"/><path d="M9 4V18" stroke-linecap="round"/><path d="M13 8V18" stroke-linecap="round"/><path d="M17 2V18" stroke-linecap="round"/><path d="M3 18H21" stroke-linecap="round"/></svg>`;
            case MainChartType.BaseLine:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 12H22" stroke-linecap="round"/><path d="M12 2V22" stroke-linecap="round"/><circle cx="12" cy="12" r="2.5" stroke="${color}" stroke-width="1.5" fill="none"/></svg>`;
            case MainChartType.Line:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 18L6 6L10 14L14 4L18 8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
            case MainChartType.Area:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 18L6 6L10 14L14 4L18 8V18H2Z" stroke-linecap="round" stroke-linejoin="round" fill="${color}20"/><path d="M2 18L6 6L10 14L14 4L18 8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
            case MainChartType.StepLine:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 12H6V8H10V12H14V6H18" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
            case MainChartType.HeikinAshi:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="5" y="4" width="14" height="16" fill="none"/><path d="M12 4V20" stroke-linecap="round"/><rect x="6" y="5" width="12" height="14" fill="${color}30" stroke="${color}" stroke-width="1"/></svg>`;
            case MainChartType.Histogram:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="3" y="6" width="5" height="10" fill="${color}" fill-opacity="0.8"/><rect x="8" y="2" width="5" height="14" fill="${color}" fill-opacity="0.8"/><rect x="13" y="4" width="5" height="12" fill="${color}" fill-opacity="0.8"/><path d="M2 18H22" stroke-linecap="round"/></svg>`;
            case MainChartType.LineBreak:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 6H6V10H10V14H14V18" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="2" cy="6" r="1.5" fill="${color}"/><circle cx="6" cy="10" r="1.5" fill="${color}"/><circle cx="10" cy="14" r="1.5" fill="${color}"/><circle cx="14" cy="18" r="1.5" fill="${color}"/></svg>`;
            case MainChartType.Mountain:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 18L6 8L10 14L14 6L18 10V18H2Z" stroke-linecap="round" stroke-linejoin="round" fill="${color}40"/><path d="M2 18L6 8L10 14L14 6L18 10" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
            case MainChartType.BaselineArea:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 12L6 6L10 8L14 4L18 6V18H2V12Z" stroke-linecap="round" stroke-linejoin="round" fill="${color}30"/><path d="M2 12H22" stroke-linecap="round" stroke-dasharray="2 2"/><path d="M2 12L6 6L10 8L14 4L18 6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
            case MainChartType.HighLow:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M5 4V20" stroke-linecap="round"/><path d="M15 6V18" stroke-linecap="round"/><circle cx="5" cy="4" r="1.5" fill="${color}"/><circle cx="5" cy="20" r="1.5" fill="${color}"/><circle cx="15" cy="6" r="1.5" fill="${color}"/><circle cx="15" cy="18" r="1.5" fill="${color}"/><path d="M5 4H15" stroke-linecap="round" stroke-dasharray="2 2"/><path d="M5 20H15" stroke-linecap="round" stroke-dasharray="2 2"/></svg>`;
            case MainChartType.HLCArea:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><path d="M2 18L6 10L10 14L14 8L18 10V18H2Z" stroke-linecap="round" stroke-linejoin="round" fill="${color}20"/><path d="M6 6V10" stroke-linecap="round"/><path d="M14 4V8" stroke-linecap="round"/><circle cx="6" cy="6" r="1.5" fill="${color}"/><circle cx="6" cy="10" r="1.5" fill="${color}"/><circle cx="14" cy="4" r="1.5" fill="${color}"/><circle cx="14" cy="8" r="1.5" fill="${color}"/><path d="M2 18L6 10L10 14L14 8L18 10" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
            default:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="5" y="5" width="14" height="14" fill="none"/></svg>`;
        }
    }

    private showIndicatorModal(): void {
        const colors = this.theme.getColors();
        const btnRect = this.element?.querySelector('.top-btn-indicator')?.getBoundingClientRect();
        const mainIndicators = getMainIndicators(this.i18n);
        const mainChartMaps = getMainChartMaps(this.i18n);
        const subChartIndicators = getSubChartIndicators(this.i18n);
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'candleview-modal modal-scrollbar';
        this.modalElement.style.cssText = `
        position: absolute;
        top: ${btnRect ? btnRect.bottom + 5 : 50}px;
        left: ${btnRect ? btnRect.left : 20}px;
        background: ${colors.panelBg};
        border: 1px solid ${colors.panelBorder};
        min-width: 260px;
        max-width: 350px;
        max-height: ${this.getMaxModalHeight()}px;
        overflow-y: auto;
        overflow-x: hidden;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        z-index: 1000;
    `;
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
        padding: 8px 12px;
        border-bottom: 1px solid ${colors.panelBorder};
        flex-shrink: 0;
    `;
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = this.i18n.t('searchIndicators');
        searchInput.style.cssText = `
        width: 100%;
        box-sizing: border-box;
        padding: 6px 10px;
        background: ${colors.background};
        border: 1px solid ${colors.panelBorder};
        color: ${colors.textColor};
        border-radius: 4px;
        outline: none;
    `;
        searchInput.oninput = (e) => {
            e.stopPropagation();
            this.setState({ mainIndicatorsSearch: (e.target as HTMLInputElement).value });
            this.closeModal();
            this.showIndicatorModal();
        };
        searchContainer.appendChild(searchInput);
        this.modalElement.appendChild(searchContainer);
        const contentContainer = document.createElement('div');
        contentContainer.className = 'indicator-content-container';
        contentContainer.style.cssText = `
        overflow-y: auto;
        overflow-x: hidden;
        flex: 1;
    `;
        const searchTerm = this.state.mainIndicatorsSearch.toLowerCase();
        const techGroup = this.createIndicatorGroup(this.i18n.t('mainChartIndicators'), mainIndicators.filter(i => i.name.toLowerCase().includes(searchTerm)), false);
        if (techGroup) contentContainer.appendChild(techGroup);
        const subGroup = this.createIndicatorGroup(this.i18n.t('subChartIndicators'), subChartIndicators.filter(i => i.name.toLowerCase().includes(searchTerm)), true);
        if (subGroup) contentContainer.appendChild(subGroup);
        const mapsGroup = this.createIndicatorGroup(this.i18n.t('chartMaps'), mainChartMaps.filter(i => i.name.toLowerCase().includes(searchTerm)), false);
        if (mapsGroup) contentContainer.appendChild(mapsGroup);
        this.modalElement.appendChild(contentContainer);
        document.body.appendChild(this.modalElement);
        this.bindOutsideClick();
    }

    private refreshTimeframeModalContent(): void {
        if (!this.modalElement) return;
        const colors = this.theme.getColors();
        const allTimeframeGroups = getAllTimeframes(this.i18n);
        const self = this;
        const contentContainer = this.modalElement.querySelector('.timeframe-content-container');
        if (contentContainer) {
            contentContainer.innerHTML = '';
            allTimeframeGroups.forEach(function (group) {
                const isExpanded = self.state.timeframeSections[group.sectionKey as keyof typeof self.state.timeframeSections];
                const groupHeader = document.createElement('div');
                groupHeader.style.cssText = `
                padding: 10px 12px;
                cursor: pointer;
                color: ${colors.textColor};
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid ${colors.panelBorder};
            `;
                groupHeader.innerHTML = `<span>${group.type}</span><span>${isExpanded ? '▼' : '▶'}</span>`;
                groupHeader.onclick = (e) => {
                    e.stopPropagation();
                    self.setState({ timeframeSections: { ...self.state.timeframeSections, [group.sectionKey]: !isExpanded } });
                    self.refreshTimeframeModalContent();
                };
                contentContainer.appendChild(groupHeader);
                if (isExpanded) {
                    group.values.forEach(tf => {
                        const item = document.createElement('div');
                        item.textContent = tf;
                        item.style.cssText = `
                        padding: 8px 12px 8px 24px;
                        cursor: pointer;
                        color: ${colors.textColor};
                        font-size: 13px;
                    `;
                        item.onclick = () => {
                            self.options.onTimeframeSelect?.(tf);
                            const timeframeBtn = self.element?.querySelector('.top-btn-timeframe');
                            if (timeframeBtn) {
                                timeframeBtn.textContent = tf;
                            }
                            self.closeModal();
                        };
                        item.onmouseenter = () => { item.style.background = colors.buttonHover; };
                        item.onmouseleave = () => { item.style.background = 'transparent'; };
                        contentContainer.appendChild(item);
                    });
                }
            });
        }
    }

    private refreshIndicatorModalContent(): void {
        if (!this.modalElement) return;
        const colors = this.theme.getColors();
        const mainIndicators = getMainIndicators(this.i18n);
        const mainChartMaps = getMainChartMaps(this.i18n);
        const subChartIndicators = getSubChartIndicators(this.i18n);
        const searchTerm = this.state.mainIndicatorsSearch.toLowerCase();
        const contentContainer = this.modalElement.querySelector('.indicator-content-container');
        if (contentContainer) {
            contentContainer.innerHTML = '';
            const techGroup = this.createIndicatorGroup(this.i18n.t('mainChartIndicators'), mainIndicators.filter(i => i.name.toLowerCase().includes(searchTerm)), false);
            if (techGroup) contentContainer.appendChild(techGroup);
            const subGroup = this.createIndicatorGroup(this.i18n.t('subChartIndicators'), subChartIndicators.filter(i => i.name.toLowerCase().includes(searchTerm)), true);
            if (subGroup) contentContainer.appendChild(subGroup);
            const mapsGroup = this.createIndicatorGroup(this.i18n.t('chartMaps'), mainChartMaps.filter(i => i.name.toLowerCase().includes(searchTerm)), false);
            if (mapsGroup) contentContainer.appendChild(mapsGroup);
        }
    }

    private createIndicatorGroup(title: string, indicators: any[], isSubChart: boolean): HTMLElement | null {
        if (indicators.length === 0) return null;
        const colors = this.theme.getColors();
        const group = document.createElement('div');
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 10px 12px;
            cursor: pointer;
            color: ${colors.textColor};
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid ${colors.panelBorder};
            background: ${colors.panelBg};
        `;
        const isExpanded = this.state.indicatorSections[title === this.i18n.t('mainChartIndicators') ? 'technicalIndicators' : title === this.i18n.t('subChartIndicators') ? 'subChartIndicators' : 'chart'];
        header.innerHTML = `<span>${title}</span><span>${isExpanded ? '▼' : '▶'}</span>`;
        header.onclick = (e) => {
            e.stopPropagation();
            const sectionKey = title === this.i18n.t('mainChartIndicators') ? 'technicalIndicators' : title === this.i18n.t('subChartIndicators') ? 'subChartIndicators' : 'chart';
            this.setState({ indicatorSections: { ...this.state.indicatorSections, [sectionKey]: !isExpanded } });
            this.refreshIndicatorModalContent();
        };
        group.appendChild(header);
        if (isExpanded) {
            indicators.forEach(ind => {
                const item = document.createElement('div');
                item.style.cssText = `
                    padding: 8px 12px 8px 24px;
                    cursor: pointer;
                    color: ${colors.textColor};
                    font-size: 13px;
                `;
                if (isSubChart) {
                    const isSelected = this.state.selectedSubChartIndicators.includes(ind.type);
                    item.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:14px;height:14px;border:2px solid ${isSelected ? colors.buttonActive : colors.panelBorder};border-radius:3px;background:${isSelected ? colors.buttonActive : 'transparent'};display:flex;align-items:center;justify-content:center;font-size:10px;line-height:1;">${isSelected ? '✓' : ''}</div>
            <span>${ind.name}</span>
        </div>
    `;
                    item.onclick = (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleSubChartIndicatorToggle(this, ind.type);
                        const isNowSelected = this.state.selectedSubChartIndicators.includes(ind.type);
                        const checkboxDiv = item.querySelector('div:first-child div') as HTMLElement;
                        if (checkboxDiv) {
                            checkboxDiv.style.border = `2px solid ${isNowSelected ? colors.buttonActive : colors.panelBorder}`;
                            checkboxDiv.style.background = isNowSelected ? colors.buttonActive : 'transparent';
                            checkboxDiv.innerHTML = isNowSelected ? '✓' : '';
                            checkboxDiv.style.display = 'flex';
                            checkboxDiv.style.alignItems = 'center';
                            checkboxDiv.style.justifyContent = 'center';
                            checkboxDiv.style.fontSize = '10px';
                            checkboxDiv.style.lineHeight = '1';
                        }
                    };
                } else {
                    item.textContent = ind.name;
                    item.onclick = (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleMainIndicatorToggle(this, ind.id);
                        this.closeModal();
                    };
                }
                item.onmouseenter = () => { item.style.background = colors.buttonHover; };
                item.onmouseleave = () => { item.style.background = 'transparent'; };
                group.appendChild(item);
            });
        }
        return group;
    }

    private showTimezoneModal(): void {
        const colors = this.theme.getColors();
        const btnRect = this.element?.querySelector('.top-btn-timezone')?.getBoundingClientRect();
        const filteredTimezones = timezones.filter(tz => tz.name.toLowerCase().includes(this.state.timezoneSearch.toLowerCase()));
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'candleview-modal modal-scrollbar';
        this.modalElement.style.cssText = `
        position: absolute;
        top: ${btnRect ? btnRect.bottom + 5 : 50}px;
        left: ${btnRect ? btnRect.left : 20}px;
        background: ${colors.panelBg};
        border: 1px solid ${colors.panelBorder};
        min-width: 280px;
        max-width: 350px;
        max-height: ${this.getMaxModalHeight()}px;
        overflow-y: auto;
        overflow-x: hidden;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        z-index: 1000;
    `;
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
        padding: 8px 12px;
        border-bottom: 1px solid ${colors.panelBorder};
        flex-shrink: 0;
    `;
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = this.i18n.t('searchTimezones');
        searchInput.style.cssText = `
        width: 100%;
        box-sizing: border-box;
        padding: 6px 10px;
        background: ${colors.background};
        border: 1px solid ${colors.panelBorder};
        color: ${colors.textColor};
        border-radius: 4px;
        outline: none;
    `;
        searchInput.value = this.state.timezoneSearch;
        searchInput.oninput = (e) => {
            e.stopPropagation();
            const newValue = (e.target as HTMLInputElement).value;
            this.setState({ timezoneSearch: newValue });
            const contentContainer = this.modalElement?.querySelector('.timezone-content-container');
            if (contentContainer) {
                contentContainer.innerHTML = '';
                const filteredTimezones = timezones.filter(tz => tz.name.toLowerCase().includes(newValue.toLowerCase()));
                filteredTimezones.forEach(tz => {
                    const isActive = this.options.currentTimezone === tz.id;
                    const item = document.createElement('div');
                    item.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                background: ${isActive ? colors.buttonActive : 'transparent'};
                color: ${isActive ? '#FFFFFF' : colors.textColor};
                border-radius: 0px;
                transition: all 0.2s ease;
            `;
                    item.innerHTML = `<div><strong>${tz.name}</strong></div><div style="font-size:11px;opacity:0.7;">${tz.id} • UTC${tz.offset}</div>`;
                    item.onclick = () => {
                        this.setState({ currentTimezone: tz.id });
                        this.options.onTimezoneSelect?.(tz.id);
                        const timezoneBtn = this.element?.querySelector('.top-btn-timezone span:last-child');
                        if (timezoneBtn) {
                            timezoneBtn.textContent = tz.name;
                        }
                        this.closeModal();
                    };
                    item.onmouseenter = () => { if (!isActive) item.style.background = colors.buttonHover; };
                    item.onmouseleave = () => { if (!isActive) item.style.background = 'transparent'; };
                    contentContainer.appendChild(item);
                });
            }
        };
        searchContainer.appendChild(searchInput);
        this.modalElement.appendChild(searchContainer);
        const contentContainer = document.createElement('div');
        contentContainer.className = 'timezone-content-container';
        contentContainer.style.cssText = `
        overflow-y: auto;
        overflow-x: hidden;
        flex: 1;
        padding: 8px;
    `;
        filteredTimezones.forEach(tz => {
            const isActive = this.options.currentTimezone === tz.id;
            const item = document.createElement('div');
            item.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        background: ${isActive ? colors.buttonActive : 'transparent'};
        color: ${isActive ? '#FFFFFF' : colors.textColor};
        border-radius: 0px;
        transition: all 0.2s ease;
    `;
            item.innerHTML = `<div><strong>${tz.name}</strong></div><div style="font-size:11px;opacity:0.7;">${tz.id} • UTC${tz.offset}</div>`;
            item.onclick = () => {
                this.setState({ currentTimezone: tz.id });
                this.options.onTimezoneSelect?.(tz.id);
                const timezoneBtn = this.element?.querySelector('.top-btn-timezone span:last-child');
                if (timezoneBtn) {
                    timezoneBtn.textContent = tz.name;
                }
                this.closeModal();
            };
            item.onmouseenter = () => { if (!isActive) item.style.background = colors.buttonHover; };
            item.onmouseleave = () => { if (!isActive) item.style.background = 'transparent'; };
            contentContainer.appendChild(item);
        });
        this.modalElement.appendChild(contentContainer);
        document.body.appendChild(this.modalElement);
        this.bindOutsideClick();
    }

    private closeModal(): void {
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
        }
        this.setState({
            isTimeframeModalOpen: false,
            isChartTypeModalOpen: false,
            isIndicatorModalOpen: false,
            isTimezoneModalOpen: false,
            isAIModalOpen: false
        });
    }

    private bindOutsideClick(): void {
    }

    private bindEvents(): void {
        document.addEventListener('click', this.handleDocumentClick);
    }

    private handleDocumentClick = (e: MouseEvent): void => {
        const target = e.target as HTMLElement;
        if (this.modalElement && this.modalElement.contains(target)) {
            return;
        }
        if (target.closest('.top-btn-timeframe') ||
            target.closest('.top-btn-timezone') ||
            target.closest('.top-btn-chart-type') ||
            target.closest('.top-btn-indicator')) {
            return;
        }
        if (this.element && !this.element.contains(target)) {
            this.closeModal();
        }
    };

    private getCurrentTimezoneDisplayName(): string {
        const currentTz = this.state.currentTimezone;
        if (!currentTz) return 'UTC';
        let tz = timezones.find(t => t.id === currentTz);
        if (tz) return tz.name;
        tz = timezones.find(t => t.name === currentTz);
        if (tz) return tz.name;
        return currentTz.split('/').pop() || 'UTC';
    }

    private getClockIcon(): string {
        return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    }

    private getChartTypeIcon(): string {
        return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display: block; margin: 0 auto;"><path d="M6 5V2H18V5" stroke-linecap="round"/><path d="M6 19V22H18V19" stroke-linecap="round"/><rect x="5" y="5" width="14" height="14" fill="none"/><path d="M12 5V19" stroke-linecap="round"/></svg>`;
    }

    private getFunctionIcon(): string {
        return `<svg width="21" height="21" viewBox="0 0 56 56" fill="currentColor" stroke="none"><path d="M 27.9266 43.8337 C 28.6400 43.8337 29.1436 43.4350 29.1436 42.7216 C 29.1436 42.4069 29.0597 42.2391 28.8289 41.7984 C 26.2691 37.8329 24.8213 33.2799 24.8213 28.3492 C 24.8213 23.5863 26.1852 18.8235 28.8289 14.8369 C 29.0597 14.3963 29.1436 14.2285 29.1436 13.9137 C 29.1436 13.2423 28.6400 12.8017 27.9266 12.8017 C 27.2343 12.8017 26.6677 13.1164 25.9963 14.0396 C 22.8491 18.0471 21.2545 23.0408 21.2545 28.3282 C 21.2545 33.6156 22.7861 38.4623 25.9963 42.5958 C 26.6677 43.5189 27.2343 43.8337 27.9266 43.8337 Z M 49.3490 43.8337 C 50.0413 43.8337 50.5870 43.5189 51.2582 42.5958 C 54.4685 38.4623 56 33.6156 56 28.3282 C 56 23.0408 54.4264 18.0471 51.2582 14.0396 C 50.5870 13.1164 50.0413 12.8017 49.3490 12.8017 C 48.6357 12.8017 48.1321 13.2423 48.1321 13.9137 C 48.1321 14.2285 48.1948 14.3963 48.4256 14.8369 C 51.0906 18.8235 52.4541 23.5863 52.4541 28.3492 C 52.4541 33.2799 50.9858 37.8329 48.4466 41.7984 C 48.1948 42.2391 48.1321 42.4069 48.1321 42.7216 C 48.1321 43.3931 48.6357 43.8337 49.3490 43.8337 Z M 2.8325 43.7917 C 6.9449 43.7917 8.8543 42.0292 9.8404 37.3084 L 12.2323 25.8314 L 16.0300 25.8314 C 17.2470 25.8314 18.0233 25.1809 18.0233 24.1318 C 18.0233 23.2296 17.4358 22.6631 16.4706 22.6631 L 12.9247 22.6631 L 13.5122 19.8096 C 14.0577 17.1449 14.8970 16.0539 17.2260 16.0539 C 17.5617 16.0539 17.8974 16.0329 18.1282 16.0119 C 19.1773 15.9070 19.6389 15.4244 19.6389 14.5222 C 19.6389 13.3472 18.6527 12.8227 16.6385 12.8227 C 12.6310 12.8227 10.5748 14.8160 9.6516 19.3060 L 8.9382 22.6631 L 6.3365 22.6631 C 5.1195 22.6631 4.3222 23.3136 4.3222 24.3626 C 4.3222 25.2648 4.9307 25.8314 5.8959 25.8314 L 8.2668 25.8314 L 5.9588 36.8048 C 5.3713 39.5534 4.5110 40.5605 2.2660 40.5605 C 1.9723 40.5605 1.6995 40.5815 1.4897 40.6025 C .5245 40.7284 0 41.2529 0 42.1342 C 0 43.2672 .9652 43.7917 2.8325 43.7917 Z M 32.3118 38.2735 C 33.0042 38.2735 33.4658 38.0427 33.9904 37.2874 L 38.5853 30.7411 L 38.6691 30.7411 L 43.3692 37.3923 C 43.8939 38.1267 44.3971 38.2735 44.9007 38.2735 C 45.9079 38.2735 46.5796 37.5601 46.5796 36.6999 C 46.5796 36.3012 46.4537 35.9236 46.1808 35.5669 L 40.8095 28.2652 L 46.1808 21.0685 C 46.4537 20.7118 46.5796 20.3341 46.5796 19.8935 C 46.5796 18.9913 45.8241 18.3619 44.9849 18.3619 C 44.2295 18.3619 43.7886 18.7396 43.3903 19.3480 L 38.9630 25.8314 L 38.8582 25.8314 L 34.4100 19.3270 C 34.0114 18.7185 33.5078 18.3619 32.7105 18.3619 C 31.7453 18.3619 31.0109 19.1382 31.0109 19.9774 C 31.0109 20.5859 31.1788 20.9636 31.4726 21.3203 L 36.5711 28.1603 L 31.1578 35.6508 C 30.8431 36.0495 30.7802 36.4062 30.7802 36.8258 C 30.7802 37.6441 31.4726 38.2735 32.3118 38.2735 Z" fill="currentColor"/></svg>`;
    }

    private getCameraIcon(): string {
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
    }

    private getFullscreenIcon(): string {
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3H5C4.44772 3 4 3.44772 4 4V7"/><path d="M16 3H19C19.5523 3 20 3.44772 20 4V7"/><path d="M8 21H5C4.44772 21 4 20.5523 4 20V17"/><path d="M16 21H19C19.5523 21 20 20.5523 20 20V17"/></svg>`;
    }

    private setState(updates: Partial<TopPanelState>): void {
        Object.assign(this.state, updates);
    }

    public getSelectedSubChartIndicators(): SubChartIndicatorType[] {
        return this.state.selectedSubChartIndicators;
    }

    public setSelectedSubChartIndicators(indicators: SubChartIndicatorType[]): void {
        this.setState({ selectedSubChartIndicators: indicators });
    }

    public updateTheme(theme: Theme): void {
        this.theme = theme;
        const colors = theme.getColors();
        const isDark = theme.isDark();
        const hoverColor = isDark ? colors.buttonHover : '#E1E5E9';
        const dividerColor = isDark ? colors.panelBorder : '#EEEEEE';
        if (this.element) {
            this.element.style.background = colors.panelBg;
            this.element.style.borderBottomColor = colors.panelBorder;
        }
        const dividers = this.element?.querySelectorAll('[style*="width: 1px"]');
        dividers?.forEach(div => {
            const divElement = div as HTMLElement;
            divElement.style.background = dividerColor;
        });
        const scrollContainer = this.element?.querySelector('div');
        if (scrollContainer) {
            const buttons = scrollContainer.querySelectorAll('button');
            buttons.forEach(btn => {
                const btnElement = btn as HTMLElement;
                btnElement.style.background = 'transparent';
                btnElement.style.color = colors.buttonColor;
                btnElement.onmouseenter = () => {
                    btnElement.style.background = hoverColor;
                };
                btnElement.onmouseleave = () => {
                    btnElement.style.background = 'transparent';
                };
            });
        }
        const themeToggle = this.element?.querySelector('.theme-toggle-btn') as HTMLElement | null;
        if (themeToggle && (themeToggle as any).updateThemeToggle) {
            (themeToggle as any).updateThemeToggle(isDark);
            themeToggle.onmouseenter = () => {
                themeToggle.style.background = hoverColor;
            };
            themeToggle.onmouseleave = () => {
                themeToggle.style.background = 'transparent';
            };
        }

        const chartTypeIconSpan = this.element?.querySelector('.top-btn-chart-type .icon-span');
        if (chartTypeIconSpan) {
            const currentChartType = this.state.currentMainChartType;
            chartTypeIconSpan.innerHTML = this.getChartTypeIconForType(currentChartType, colors.buttonColor);
        }

        const indicatorIconSpan = this.element?.querySelector('.top-btn-indicator .icon-span');
        if (indicatorIconSpan) {
            indicatorIconSpan.innerHTML = this.getFunctionIcon();
        }

        const existingStyle = document.getElementById('candleview-top-scrollbar-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        this.injectScrollbarStyles();
        this.closeModal();
    }

    public updateI18n(i18n: I18n): void {
        this.i18n = i18n;
        const indicatorBtn = this.createIconButton(this.getFunctionIcon(), this.i18n.t('Indicators'), 'indicator');
        if (indicatorBtn) indicatorBtn.textContent = i18n.t('Indicators');
        this.closeModal();
    }

    public destroy(): void {
        this.closeModal();
        this.element?.remove();
        document.removeEventListener('click', this.handleDocumentClick);
    }

    public updateState(updates: Partial<TopPanelState>): void {
        Object.assign(this.state, updates);
    }
}