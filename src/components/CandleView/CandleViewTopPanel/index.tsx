import React from 'react';
import { ChartTypeIcon, TimeframeIcon, IndicatorIcon, CompareIcon, FullscreenIcon, CameraIcon } from '../CandleViewIcons';
import { ThemeConfig } from '../CandleViewTheme';
import { chartTypes } from '../ChartLayer/ChartTypeManager';
import { mainIndicators, subChartIndicators } from './CandleViewTopPanelConfig';
import { DEFAULT_BOLLINGER, DEFAULT_DONCHIAN, DEFAULT_EMA, DEFAULT_ENVELOPE, DEFAULT_ICHIMOKU, DEFAULT_MA, DEFAULT_VWAP, MainChartIndicatorInfo } from '../Indicators/MainChart/MainChartIndicatorInfo';
import { MainChartIndicatorType, SubChartIndicatorType } from '../types';
import { I18n } from '../I18n';
import { getTimeframeDisplayName } from '../DataAdapter';

interface CandleViewTopPanelProps {
    currentTheme: ThemeConfig;
    activeTimeframe: string;
    activeChartType: string;
    isDarkTheme: boolean;
    isTimeframeModalOpen: boolean;
    isIndicatorModalOpen: boolean;
    isChartTypeModalOpen: boolean;
    isSubChartModalOpen: boolean;
    isTimezoneModalOpen: boolean;
    onThemeToggle: () => void;
    onTimeframeClick: () => void;
    onIndicatorClick: () => void;
    onChartTypeClick: () => void;
    onCompareClick: () => void;
    onFullscreenClick: () => void;
    onReplayClick: () => void;
    onTimezoneClick: () => void;
    onTimeframeSelect: (timeframe: string) => void;
    onChartTypeSelect: (chartType: string) => void;
    onTimezoneSelect: (timezone: string, is24Hour: boolean) => void;
    handleSelectedMainChartIndicator: (indicators: MainChartIndicatorInfo) => void;
    handleSelectedSubChartIndicator: (indicators: SubChartIndicatorType[]) => void;
    showToolbar?: boolean;
    onCloseModals?: () => void;
    onSubChartClick?: () => void;
    selectedSubChartIndicators?: SubChartIndicatorType[];
    onCameraClick: () => void;
    i18n: I18n;
    currentTimezone: string;
    is24HourFormat: boolean;
}

interface CandleViewTopPanelState {
    mainIndicatorsSearch: string;
    subChartIndicatorsSearch: string;
    selectedMainIndicator: MainChartIndicatorInfo | null;
    selectedSubChartIndicators: SubChartIndicatorType[];
    timeframeSections: {
        Second: boolean;
        Minute: boolean;
        Hour: boolean;
        Day: boolean;
        Week: boolean;
        Month: boolean;
    };
    timezoneSearch: string;
}

class CandleViewTopPanel extends React.Component<CandleViewTopPanelProps> {
    private timeframeModalRef = React.createRef<HTMLDivElement>();
    private chartTypeModalRef = React.createRef<HTMLDivElement>();
    private indicatorModalRef = React.createRef<HTMLDivElement>();
    private subChartModalRef = React.createRef<HTMLDivElement>();
    private timezoneModalRef = React.createRef<HTMLDivElement>();

    private mainButtons = [
        { id: 'alert', label: this.props.i18n.toolbarButtons.hint, icon: null },
        { id: 'replay', label: this.props.i18n.toolbarButtons.replay, icon: null },
    ];

    private financialTimezones = [
        { id: 'America/New_York', name: 'New York (EST/EDT)', offset: '-05:00/-04:00' },
        { id: 'America/Chicago', name: 'Chicago (CST/CDT)', offset: '-06:00/-05:00' },
        { id: 'America/Denver', name: 'Denver (MST/MDT)', offset: '-07:00/-06:00' },
        { id: 'America/Los_Angeles', name: 'Los Angeles (PST/PDT)', offset: '-08:00/-07:00' },
        { id: 'America/Toronto', name: 'Toronto (EST/EDT)', offset: '-05:00/-04:00' },
        { id: 'Europe/London', name: 'London (GMT/BST)', offset: '+00:00/+01:00' },
        { id: 'Europe/Paris', name: 'Paris (CET/CEST)', offset: '+01:00/+02:00' },
        { id: 'Europe/Frankfurt', name: 'Frankfurt (CET/CEST)', offset: '+01:00/+02:00' },
        { id: 'Europe/Zurich', name: 'Zurich (CET/CEST)', offset: '+01:00/+02:00' },
        { id: 'Europe/Moscow', name: 'Moscow (MSK)', offset: '+03:00' },
        { id: 'Asia/Dubai', name: 'Dubai (GST)', offset: '+04:00' },
        { id: 'Asia/Karachi', name: 'Karachi (PKT)', offset: '+05:00' },
        { id: 'Asia/Kolkata', name: 'Kolkata (IST)', offset: '+05:30' },
        { id: 'Asia/Shanghai', name: 'Shanghai (CST)', offset: '+08:00' },
        { id: 'Asia/Hong_Kong', name: 'Hong Kong (HKT)', offset: '+08:00' },
        { id: 'Asia/Singapore', name: 'Singapore (SGT)', offset: '+08:00' },
        { id: 'Asia/Tokyo', name: 'Tokyo (JST)', offset: '+09:00' },
        { id: 'Asia/Seoul', name: 'Seoul (KST)', offset: '+09:00' },
        { id: 'Australia/Sydney', name: 'Sydney (AEST/AEDT)', offset: '+10:00/+11:00' },
        { id: 'Pacific/Auckland', name: 'Auckland (NZST/NZDT)', offset: '+12:00/+13:00' },
        { id: 'UTC', name: 'UTC', offset: '+00:00' }
    ];

    state: CandleViewTopPanelState = {
        mainIndicatorsSearch: '',
        subChartIndicatorsSearch: '',
        selectedMainIndicator: null,
        selectedSubChartIndicators: [],
        timeframeSections: {
            Second: true,
            Minute: true,
            Hour: true,
            Day: true,
            Week: true,
            Month: true
        },
        timezoneSearch: ''
    };

    componentDidUpdate(prevProps: CandleViewTopPanelProps) {
        if (prevProps.selectedSubChartIndicators !== this.props.selectedSubChartIndicators) {
            this.setState({
                selectedSubChartIndicators: this.props.selectedSubChartIndicators || []
            });
        }

        if (prevProps.i18n !== this.props.i18n) {
            this.mainButtons = [
                { id: 'alert', label: this.props.i18n.toolbarButtons.hint, icon: null },
                { id: 'replay', label: this.props.i18n.toolbarButtons.replay, icon: null },
            ];
        }
    }

    private handleTimeframeSelect = (timeframe: string) => {
        this.props.onTimeframeSelect(timeframe);
        if (this.props.onCloseModals) {
            this.props.onCloseModals();
        }
    };

    private handleChartTypeSelect = (chartType: string) => {
        this.props.onChartTypeSelect(chartType);
        if (this.props.onCloseModals) {
            this.props.onCloseModals();
        }
    };

    private handleTimezoneSelect = (timezone: string) => {
        this.props.onTimezoneSelect(timezone, this.props.is24HourFormat);
        if (this.props.onCloseModals) {
            this.props.onCloseModals();
        }
    };

    private handleTimeFormatToggle = () => {
        this.props.onTimezoneSelect(this.props.currentTimezone, !this.props.is24HourFormat);
    };

    private handleSubChartClick = () => {
        if (this.props.onSubChartClick) {
            this.props.onSubChartClick();
        }
    };

    private handleMainIndicatorToggle = (indicatorId: string) => {
        const indicatorConfig = mainIndicators.find(ind => ind.id === indicatorId);
        let mainChartIndicatorInfo: MainChartIndicatorInfo | null;
        switch (indicatorConfig?.type) {
            case MainChartIndicatorType.MA:
                mainChartIndicatorInfo = {
                    ...DEFAULT_MA,
                    nonce: Date.now()
                };
                break;
            case MainChartIndicatorType.EMA:
                mainChartIndicatorInfo = {
                    ...DEFAULT_EMA,
                    nonce: Date.now()
                };
                break;
            case MainChartIndicatorType.BOLLINGER:
                mainChartIndicatorInfo = {
                    ...DEFAULT_BOLLINGER,
                    nonce: Date.now()
                };
                break;
            case MainChartIndicatorType.ICHIMOKU:
                mainChartIndicatorInfo = {
                    ...DEFAULT_ICHIMOKU,
                    nonce: Date.now()
                };
                break;
            case MainChartIndicatorType.DONCHIAN:
                mainChartIndicatorInfo = {
                    ...DEFAULT_DONCHIAN,
                    nonce: Date.now()
                };
                break;
            case MainChartIndicatorType.ENVELOPE:
                mainChartIndicatorInfo = {
                    ...DEFAULT_ENVELOPE,
                    nonce: Date.now()
                };
                break;
            case MainChartIndicatorType.VWAP:
                mainChartIndicatorInfo = {
                    ...DEFAULT_VWAP,
                    nonce: Date.now()
                };
                break;
            default:
                mainChartIndicatorInfo = null;
                break;
        }
        if (!mainChartIndicatorInfo) { return; }
        this.setState({ selectedMainIndicator: mainChartIndicatorInfo });
        this.props.handleSelectedMainChartIndicator(mainChartIndicatorInfo);
    };

    private handleSubChartIndicatorToggle = (indicatorType: SubChartIndicatorType) => {
        this.setState((prevState: CandleViewTopPanelState) => {
            const isSelected = prevState.selectedSubChartIndicators.includes(indicatorType);
            let newSelectedSubChartIndicators: SubChartIndicatorType[];
            if (isSelected) {
                newSelectedSubChartIndicators = prevState.selectedSubChartIndicators.filter(
                    type => type !== indicatorType
                );
            } else {
                newSelectedSubChartIndicators = [...prevState.selectedSubChartIndicators, indicatorType];
            }
            if (this.props.handleSelectedSubChartIndicator) {
                this.props.handleSelectedSubChartIndicator(newSelectedSubChartIndicators);
            }
            return {
                selectedSubChartIndicators: newSelectedSubChartIndicators
            };
        });
    };

    private handleMainIndicatorsSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ mainIndicatorsSearch: e.target.value });
    };

    private handleSubChartIndicatorsSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ subChartIndicatorsSearch: e.target.value });
    };

    private handleTimezoneSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ timezoneSearch: e.target.value });
    };

    private filteredMainIndicators = () => {
        const { mainIndicatorsSearch } = this.state;
        if (!mainIndicatorsSearch) return mainIndicators;

        return mainIndicators.filter(indicator =>
            indicator.name.toLowerCase().includes(mainIndicatorsSearch.toLowerCase())
        );
    };

    private filteredSubChartIndicators = () => {
        const { subChartIndicatorsSearch } = this.state;
        if (!subChartIndicatorsSearch) return subChartIndicators;

        return subChartIndicators.filter(indicator =>
            indicator.name.toLowerCase().includes(subChartIndicatorsSearch.toLowerCase())
        );
    };

    private filteredTimezones = () => {
        const { timezoneSearch } = this.state;
        if (!timezoneSearch) return this.financialTimezones;

        return this.financialTimezones.filter(timezone =>
            timezone.name.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
            timezone.id.toLowerCase().includes(timezoneSearch.toLowerCase())
        );
    };

    private getAllTimeframes = () => {
        const { i18n } = this.props;
        return [
            { type: i18n.timeframeSections.second, values: ['1s', '5s', '15s', '30s'] },
            { type: i18n.timeframeSections.minute, values: ['1m', '3m', '5m', '15m', '30m', '45m'] },
            { type: i18n.timeframeSections.hour, values: ['1H', '2H', '3H', '4H', '6H', '8H', '12H'] },
            { type: i18n.timeframeSections.day, values: ['1D', '3D'] },
            { type: i18n.timeframeSections.week, values: ['1W', '2W'] },
            { type: i18n.timeframeSections.month, values: ['1M', '3M', '6M'] }
        ];
    };

    private toggleTimeframeSection = (sectionType: keyof CandleViewTopPanelState['timeframeSections']) => {
        this.setState((prevState: CandleViewTopPanelState) => ({
            timeframeSections: {
                ...prevState.timeframeSections,
                [sectionType]: !prevState.timeframeSections[sectionType]
            }
        }));
    };

    private getChartTypeLabel = (chartTypeId: string): string => {
        const { i18n } = this.props;
        const chartTypeMap: { [key: string]: string } = {
            'candle': i18n.chartTypes.candle,
            'line': i18n.chartTypes.line,
            'area': i18n.chartTypes.area,
            'baseline': i18n.chartTypes.baseline,
            'hollowCandle': i18n.chartTypes.hollowCandle,
            'heikinAshi': i18n.chartTypes.heikinAshi,
            'column': i18n.chartTypes.column,
            'lineWithMarkers': i18n.chartTypes.lineWithMarkers,
            'stepLine': i18n.chartTypes.stepLine
        };

        return chartTypeMap[chartTypeId] || chartTypeId;
    };

    private getCurrentTimezoneDisplayName = (): string => {
        const currentTimezone = this.financialTimezones.find(tz => tz.id === this.props.currentTimezone);
        return currentTimezone ? currentTimezone.name.split(' ')[0] : this.props.currentTimezone;
    };

    private renderTimeframeModal() {
        const { isTimeframeModalOpen, currentTheme, activeTimeframe, i18n } = this.props;
        const { timeframeSections } = this.state;

        if (!isTimeframeModalOpen) return null;

        const timeframeGroups = this.getAllTimeframes();

        return (
            <div
                ref={this.timeframeModalRef}
                data-timeframe-modal="true"
                style={{
                    position: 'absolute',
                    top: '43px',
                    left: '0px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '8px',
                    padding: '8px',
                    minWidth: '180px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                }}
                className="modal-scrollbar"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {timeframeGroups.map(group => {
                        const sectionKey = Object.keys(i18n.timeframeSections).find(
                            key => i18n.timeframeSections[key as keyof typeof i18n.timeframeSections] === group.type
                        ) as keyof CandleViewTopPanelState['timeframeSections'] | undefined;

                        const isExpanded = sectionKey ? timeframeSections[sectionKey] : false;

                        return (
                            <div key={group.type}>
                                <button
                                    onClick={() => sectionKey && this.toggleTimeframeSection(sectionKey)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 8px',
                                        cursor: 'pointer',
                                        color: currentTheme.layout.textColor,
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        minHeight: '32px',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        opacity: 0.8,
                                        textTransform: 'uppercase',
                                    }}>
                                        {group.type}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '16px',
                                        height: '16px',
                                        transition: 'transform 0.2s ease',
                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '8px' }}>
                                        {group.values.map(timeframe => {
                                            const isActive = activeTimeframe === timeframe;

                                            return (
                                                <button
                                                    key={timeframe}
                                                    onClick={() => this.handleTimeframeSelect(timeframe)}
                                                    style={{
                                                        background: isActive
                                                            ? currentTheme.toolbar.button.active
                                                            : 'transparent',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '6px 8px',
                                                        cursor: 'pointer',
                                                        color: isActive
                                                            ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                                            : currentTheme.toolbar.button.color,
                                                        textAlign: 'left',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        minHeight: '32px',
                                                        width: '100%',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isActive) {
                                                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isActive) {
                                                            e.currentTarget.style.background = 'transparent';
                                                        }
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        color: isActive
                                                            ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                                            : currentTheme.toolbar.button.color,
                                                        flex: 1,
                                                        textAlign: 'left',
                                                    }}>
                                                        {getTimeframeDisplayName(timeframe, this.props.i18n)}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    private renderChartTypeModal = () => {
        const { isChartTypeModalOpen, currentTheme, activeChartType, i18n } = this.props;

        if (!isChartTypeModalOpen) return null;

        return (
            <div
                ref={this.chartTypeModalRef}
                data-chart-type-modal="true"
                style={{
                    position: 'absolute',
                    top: '43px',
                    left: '0',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '8px',
                    padding: '8px',
                    minWidth: '160px',
                    maxHeight: '320px',
                    overflowY: 'auto',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                }}
                className="modal-scrollbar"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {chartTypes.map(chartType => {
                        const IconComponent = ChartTypeIcon;
                        const isActive = activeChartType === chartType.id;

                        return (
                            <button
                                key={chartType.id}
                                onClick={() => this.handleChartTypeSelect(chartType.id)}
                                style={{
                                    background: isActive
                                        ? currentTheme.toolbar.button.active
                                        : 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                    color: isActive
                                        ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                        : currentTheme.toolbar.button.color,
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    minHeight: '32px',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '20px',
                                    height: '20px',
                                    flexShrink: 0,
                                }}>
                                    <IconComponent
                                        size={16}
                                        color={isActive
                                            ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                            : currentTheme.toolbar.button.color}
                                    />
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: isActive
                                        ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                        : currentTheme.toolbar.button.color,
                                    flex: 1,
                                    textAlign: 'left',
                                }}>
                                    {this.getChartTypeLabel(chartType.id)}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    private renderIndicatorModal = () => {
        const { isIndicatorModalOpen, currentTheme, i18n } = this.props;
        const { mainIndicatorsSearch } = this.state;
        const filteredIndicators = this.filteredMainIndicators();

        if (!isIndicatorModalOpen) return null;

        return (
            <div
                ref={this.indicatorModalRef}
                data-indicator-modal="true"
                style={{
                    position: 'absolute',
                    top: '43px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '8px',
                    padding: '0',
                    minWidth: '280px',
                    maxHeight: '400px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{
                    padding: '8px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    flexShrink: 0,
                }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                    }}>
                        <input
                            type="text"
                            placeholder={i18n.searchIndicators}
                            value={mainIndicatorsSearch}
                            onChange={this.handleMainIndicatorsSearch}
                            style={{
                                width: '100%',
                                background: currentTheme.toolbar.background,
                                border: `1px solid ${currentTheme.toolbar.border}`,
                                borderRadius: '6px',
                                padding: '8px 32px 8px 12px',
                                color: currentTheme.layout.textColor,
                                fontSize: '13px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = currentTheme.toolbar.button.active;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = currentTheme.toolbar.border;
                            }}
                        />

                        {mainIndicatorsSearch && (
                            <button
                                onClick={() => this.setState({ mainIndicatorsSearch: '' })}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: currentTheme.toolbar.button.color,
                                    opacity: 0.6,
                                    transition: 'all 0.2s ease',
                                    fontSize: '12px',
                                    padding: 0,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                    e.currentTarget.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.opacity = '0.6';
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    overflowY: 'auto',
                    flex: 1,
                    padding: '8px',
                    maxHeight: '352px',
                }}
                    className="modal-scrollbar"
                >
                    {filteredIndicators.map(indicator => {
                        return (
                            <button
                                key={indicator.id}
                                onClick={() => {
                                    this.handleMainIndicatorToggle(indicator.id);
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease',
                                    minHeight: '32px',
                                    width: '100%',
                                    textAlign: 'left',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '14px',
                                    marginRight: '10px',
                                    flexShrink: 0,
                                }}>
                                    {indicator.icon}
                                </div>

                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: currentTheme.layout.textColor,
                                    textAlign: 'left',
                                    flex: 1,
                                    lineHeight: '1.4',
                                }}>
                                    {indicator.name}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    private renderSubChartModal = () => {
        const { isSubChartModalOpen, currentTheme, i18n } = this.props;
        const { subChartIndicatorsSearch, selectedSubChartIndicators } = this.state;
        const filteredIndicators = this.filteredSubChartIndicators();

        if (!isSubChartModalOpen) return null;

        return (
            <div
                ref={this.subChartModalRef}
                data-subchart-modal="true"
                style={{
                    position: 'absolute',
                    top: '43px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '8px',
                    padding: '0',
                    minWidth: '280px',
                    maxHeight: '400px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{
                    padding: '8px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    flexShrink: 0,
                }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                    }}>
                        <input
                            type="text"
                            placeholder={i18n.searchIndicators}
                            value={subChartIndicatorsSearch}
                            onChange={this.handleSubChartIndicatorsSearch}
                            style={{
                                width: '100%',
                                background: currentTheme.toolbar.background,
                                border: `1px solid ${currentTheme.toolbar.border}`,
                                borderRadius: '6px',
                                padding: '8px 32px 8px 12px',
                                color: currentTheme.layout.textColor,
                                fontSize: '13px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = currentTheme.toolbar.button.active;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = currentTheme.toolbar.border;
                            }}
                        />
                        {subChartIndicatorsSearch && (
                            <button
                                onClick={() => this.setState({ subChartIndicatorsSearch: '' })}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: currentTheme.toolbar.button.color,
                                    opacity: 0.6,
                                    transition: 'all 0.2s ease',
                                    fontSize: '12px',
                                    padding: 0,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                    e.currentTarget.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.opacity = '0.6';
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    overflowY: 'auto',
                    flex: 1,
                    padding: '8px',
                    maxHeight: '352px',
                }}
                    className="modal-scrollbar"
                >
                    {filteredIndicators.map(indicator => {
                        const isSelected = selectedSubChartIndicators.some(
                            selected => selected === indicator.id
                        );
                        return (
                            <button
                                key={indicator.id}
                                onClick={() => {
                                    this.handleSubChartIndicatorToggle(indicator.type);
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease',
                                    minHeight: '32px',
                                    width: '100%',
                                    textAlign: 'left',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '16px',
                                    height: '16px',
                                    border: `2px solid ${isSelected ? currentTheme.toolbar.button.active : currentTheme.toolbar.border}`,
                                    borderRadius: '3px',
                                    marginRight: '10px',
                                    background: isSelected ? currentTheme.toolbar.button.active : 'transparent',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0,
                                }}>
                                    {isSelected && (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '14px',
                                    marginRight: '10px',
                                    flexShrink: 0,
                                }}>
                                    {indicator.icon}
                                </div>

                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: currentTheme.layout.textColor,
                                    textAlign: 'left',
                                    flex: 1,
                                    lineHeight: '1.4',
                                }}>
                                    {indicator.name}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    private renderTimezoneModal() {
        const { isTimezoneModalOpen, currentTheme, i18n, is24HourFormat } = this.props;
        const { timezoneSearch } = this.state;

        if (!isTimezoneModalOpen) return null;

        const filteredTimezones = this.filteredTimezones();

        return (
            <div
                ref={this.timezoneModalRef}
                data-timezone-modal="true"
                style={{
                    position: 'absolute',
                    top: '43px',
                    left: '0px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '8px',
                    padding: '0',
                    minWidth: '300px',
                    maxHeight: '400px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{
                    padding: '8px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    flexShrink: 0,
                }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                    }}>
                        <input
                            type="text"
                            placeholder="Search timezones..."
                            value={timezoneSearch}
                            onChange={this.handleTimezoneSearch}
                            style={{
                                width: '100%',
                                background: currentTheme.toolbar.background,
                                border: `1px solid ${currentTheme.toolbar.border}`,
                                borderRadius: '6px',
                                padding: '8px 32px 8px 12px',
                                color: currentTheme.layout.textColor,
                                fontSize: '13px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = currentTheme.toolbar.button.active;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = currentTheme.toolbar.border;
                            }}
                        />

                        {timezoneSearch && (
                            <button
                                onClick={() => this.setState({ timezoneSearch: '' })}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: currentTheme.toolbar.button.color,
                                    opacity: 0.6,
                                    transition: 'all 0.2s ease',
                                    fontSize: '12px',
                                    padding: 0,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                    e.currentTarget.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.opacity = '0.6';
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    overflowY: 'auto',
                    flex: 1,
                    padding: '8px',
                    maxHeight: '300px',
                }}
                    className="modal-scrollbar"
                >
                    {filteredTimezones.map(timezone => {
                        const isActive = this.props.currentTimezone === timezone.id;

                        return (
                            <button
                                key={timezone.id}
                                onClick={() => this.handleTimezoneSelect(timezone.id)}
                                style={{
                                    background: isActive
                                        ? currentTheme.toolbar.button.active
                                        : 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    color: isActive
                                        ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                        : currentTheme.toolbar.button.color,
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    minHeight: '48px',
                                    width: '100%',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: isActive
                                        ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                        : currentTheme.layout.textColor,
                                    textAlign: 'left',
                                }}>
                                    {timezone.name}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '400',
                                    color: isActive
                                        ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                        : currentTheme.toolbar.button.color,
                                    opacity: 0.7,
                                    textAlign: 'left',
                                }}>
                                    {timezone.id} • UTC{timezone.offset}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    render() {
        const {
            currentTheme,
            activeTimeframe,
            activeChartType,
            isDarkTheme,
            isTimeframeModalOpen,
            isIndicatorModalOpen,
            isChartTypeModalOpen,
            isSubChartModalOpen,
            isTimezoneModalOpen,
            onThemeToggle,
            onTimeframeClick,
            onIndicatorClick,
            onChartTypeClick,
            onCompareClick,
            onFullscreenClick,
            onReplayClick,
            onTimezoneClick,
            showToolbar = true,
            onCameraClick,
            i18n,
            currentTimezone,
            is24HourFormat,
        } = this.props;
        if (!showToolbar) return null;
        return (
            <div style={{
                background: currentTheme.panel.backgroundColor,
                borderBottom: `1px solid ${currentTheme.panel.borderColor}`,
                padding: '9px 13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: '43px',
                boxSizing: 'border-box',
                gap: '0',
                position: 'relative',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                    {this.mainButtons.map(button => (
                        <div key={button.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <button
                                onClick={onReplayClick}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '0',
                                    padding: '7px 11px',
                                    cursor: 'pointer',
                                    color: currentTheme.toolbar.button.color,
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    minHeight: '31px',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {button.label}
                            </button>
                            <div style={{
                                width: '1px',
                                height: '16px',
                                background: currentTheme.toolbar.border,
                                margin: '0 4px',
                            }} />
                        </div>
                    ))}
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={onTimeframeClick}
                        className="timeframe-button"
                        style={{
                            background: isTimeframeModalOpen
                                ? currentTheme.toolbar.button.active
                                : 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            padding: '7px 11px',
                            cursor: 'pointer',
                            color: isTimeframeModalOpen
                                ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                : currentTheme.toolbar.button.color,
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            transition: 'all 0.2s ease',
                            minHeight: '31px',
                        }}
                        onMouseEnter={(e) => {
                            if (!isTimeframeModalOpen) {
                                e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isTimeframeModalOpen) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <TimeframeIcon size={15} color={currentTheme.toolbar.button.color} />
                        {activeTimeframe}
                    </button>
                    <div style={{
                        width: '1px',
                        height: '16px',
                        background: currentTheme.toolbar.border,
                        margin: '0 4px',
                    }} />
                    {this.renderTimeframeModal()}
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={onTimezoneClick}
                        className="timezone-button"
                        style={{
                            background: isTimezoneModalOpen
                                ? currentTheme.toolbar.button.active
                                : 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            padding: '7px 11px',
                            cursor: 'pointer',
                            color: isTimezoneModalOpen
                                ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                : currentTheme.toolbar.button.color,
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            transition: 'all 0.2s ease',
                            minHeight: '31px',
                        }}
                        onMouseEnter={(e) => {
                            if (!isTimezoneModalOpen) {
                                e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isTimezoneModalOpen) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {this.getCurrentTimezoneDisplayName()} {is24HourFormat ? '24H' : '12H'}
                    </button>
                    <div style={{
                        width: '1px',
                        height: '16px',
                        background: currentTheme.toolbar.border,
                        margin: '0 4px',
                    }} />
                    {this.renderTimezoneModal()}
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={onChartTypeClick}
                        className="chart-type-button"
                        style={{
                            background: isChartTypeModalOpen
                                ? currentTheme.toolbar.button.active
                                : 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            padding: '7px 11px',
                            cursor: 'pointer',
                            color: currentTheme.toolbar.button.color,
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            transition: 'all 0.2s ease',
                            minHeight: '31px',
                        }}
                        onMouseEnter={(e) => {
                            if (!isChartTypeModalOpen) {
                                e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isChartTypeModalOpen) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <ChartTypeIcon size={15}
                            color={isChartTypeModalOpen
                                ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                : currentTheme.toolbar.button.color}
                        />
                        {this.getChartTypeLabel(activeChartType)}
                    </button>
                    <div style={{
                        width: '1px',
                        height: '16px',
                        background: currentTheme.toolbar.border,
                        margin: '0 4px',
                    }} />
                    {this.renderChartTypeModal()}
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={onIndicatorClick}
                        className="indicator-button"
                        style={{
                            background: isIndicatorModalOpen
                                ? currentTheme.toolbar.button.active
                                : 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            padding: '7px 11px',
                            cursor: 'pointer',
                            color: isIndicatorModalOpen
                                ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                : currentTheme.toolbar.button.color,
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            transition: 'all 0.2s ease',
                            minHeight: '31px',
                        }}
                        onMouseEnter={(e) => {
                            if (!isIndicatorModalOpen) {
                                e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isIndicatorModalOpen) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <IndicatorIcon size={15}
                            color={isIndicatorModalOpen
                                ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                : currentTheme.toolbar.button.color}
                        />
                        {i18n.mainChartIndicators}
                    </button>
                    <div style={{
                        width: '1px',
                        height: '16px',
                        background: currentTheme.toolbar.border,
                        margin: '0 4px',
                    }} />
                    {this.renderIndicatorModal()}
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={this.handleSubChartClick}
                        className="subchart-button"
                        style={{
                            background: isSubChartModalOpen
                                ? currentTheme.toolbar.button.active
                                : 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            padding: '7px 11px',
                            cursor: 'pointer',
                            color: isSubChartModalOpen
                                ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                : currentTheme.toolbar.button.color,
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            transition: 'all 0.2s ease',
                            minHeight: '31px',
                        }}
                        onMouseEnter={(e) => {
                            if (!isSubChartModalOpen) {
                                e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSubChartModalOpen) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <IndicatorIcon size={15}
                            color={isSubChartModalOpen
                                ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                : currentTheme.toolbar.button.color}
                        />
                        {i18n.subChartIndicators}
                    </button>
                    <div style={{
                        width: '1px',
                        height: '16px',
                        background: currentTheme.toolbar.border,
                        margin: '0 4px',
                    }} />
                    {this.renderSubChartModal()}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                    <button
                        title={i18n.toolbarButtons.contrast}
                        onClick={onCompareClick}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            padding: '7px',
                            cursor: 'pointer',
                            color: currentTheme.toolbar.button.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            minHeight: '31px',
                            minWidth: '31px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <CompareIcon size={17} color={currentTheme.toolbar.button.color} />
                    </button>
                    <div style={{
                        width: '1px',
                        height: '16px',
                        background: currentTheme.toolbar.border,
                        margin: '0 4px',
                    }} />

                    <button
                        title={i18n.toolbarButtons.fullScreen}
                        onClick={onFullscreenClick}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            padding: '7px',
                            cursor: 'pointer',
                            color: currentTheme.toolbar.button.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            minHeight: '31px',
                            minWidth: '31px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <FullscreenIcon size={17} color={currentTheme.toolbar.button.color} />
                    </button>
                    <div style={{
                        width: '1px',
                        height: '16px',
                        background: currentTheme.toolbar.border,
                        margin: '0 4px',
                    }} />
                    <button
                        title={i18n.toolbarButtons.screenshot}
                        onClick={onCameraClick}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            padding: '7px',
                            cursor: 'pointer',
                            color: currentTheme.toolbar.button.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            minHeight: '31px',
                            minWidth: '31px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <CameraIcon size={17} color={currentTheme.toolbar.button.color} />
                    </button>
                    <div style={{
                        width: '1px',
                        height: '16px',
                        background: currentTheme.toolbar.border,
                        margin: '0 4px',
                    }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                        fontSize: '12px',
                        color: currentTheme.toolbar.button.color,
                        fontWeight: '500',
                        opacity: 0.8,
                    }}>
                        {i18n.theme}
                    </span>
                    <button
                        onClick={onThemeToggle}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isDarkTheme ? 'flex-end' : 'flex-start',
                            width: '44px',
                            height: '24px',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: isDarkTheme ? currentTheme.toolbar.button.active : currentTheme.toolbar.button.color,
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {isDarkTheme ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            ) : (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                            )}
                        </div>
                    </button>
                    <span style={{
                        fontSize: '12px',
                        color: currentTheme.toolbar.button.color,
                        fontWeight: '500',
                        opacity: 0.8,
                    }}>
                        {isDarkTheme ? i18n.dark : i18n.light}
                    </span>
                </div>
            </div>
        );
    }
}

export default CandleViewTopPanel;