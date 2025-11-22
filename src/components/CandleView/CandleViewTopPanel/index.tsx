import React from 'react';
import { ChartTypeIcon, TimeframeIcon, IndicatorIcon, CompareIcon, FullscreenIcon, CameraIcon } from '../Icons';
import { ThemeConfig } from '../CandleViewTheme';
import { chartTypes } from '../ChartLayer/ChartTypeManager';
import { mainIndicators, subChartIndicators } from './CandleViewTopPanelConfig';
import { DEFAULT_BOLLINGER, DEFAULT_DONCHIAN, DEFAULT_EMA, DEFAULT_ENVELOPE, DEFAULT_ICHIMOKU, DEFAULT_MA, DEFAULT_VWAP, MainChartIndicatorInfo } from '../Indicators/MainChart/MainChartIndicatorInfo';
import { MainChartIndicatorType, MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from '../types';
import { I18n } from '../I18n';
import { getTimeframeDisplayName } from '../DataAdapter';

interface CandleViewTopPanelProps {
    currentTheme: ThemeConfig;
    activeTimeframe: string;
    activeMainChartType: MainChartType;
    isDarkTheme: boolean;
    isTimeframeModalOpen: boolean;
    isIndicatorModalOpen: boolean;
    isChartTypeModalOpen: boolean;
    isSubChartModalOpen: boolean;
    isTimezoneModalOpen: boolean;
    isTimeFormatModalOpen: boolean;
    isCloseTimeModalOpen: boolean;
    isTradingDayModalOpen: boolean;
    onThemeToggle: () => void;
    onTimeframeClick: () => void;
    onIndicatorClick: () => void;
    onChartTypeClick: () => void;
    onCompareClick: () => void;
    onFullscreenClick: () => void;
    onReplayClick: () => void;
    onTimezoneClick: () => void;
    onTimeFormatClick: () => void;
    onCloseTimeClick: () => void;
    onTradingDayClick: () => void;
    onTimeframeSelect: (timeframe: string) => void;
    onChartTypeSelect: (mainChartType: MainChartType) => void;
    onTimezoneSelect: (timezone: string) => void;
    handleSelectedMainChartIndicator: (indicators: MainChartIndicatorInfo) => void;
    handleSelectedSubChartIndicator: (indicators: SubChartIndicatorType[]) => void;
    showToolbar?: boolean;
    onCloseModals?: () => void;
    onSubChartClick?: () => void;
    selectedSubChartIndicators?: SubChartIndicatorType[];
    onCameraClick: () => void;
    i18n: I18n;
    currentTimezone: string;
    currentCloseTime: string;
    currentTradingDayType: string;
}

interface CandleViewTopPanelState {
    mainIndicatorsSearch: string;
    subChartIndicatorsSearch: string;
    chartTypeSearch: string;
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
    private timeFormatModalRef = React.createRef<HTMLDivElement>();
    private closeTimeModalRef = React.createRef<HTMLDivElement>();
    private tradingDayModalRef = React.createRef<HTMLDivElement>();

    private mainButtons = [
        { id: 'alert', label: this.props.i18n.toolbarButtons.hint, icon: null },
        { id: 'replay', label: this.props.i18n.toolbarButtons.replay, icon: null },
    ];

    private financialTimezones = [
        { id: TimezoneEnum.NEW_YORK, name: 'New York (EST/EDT)', offset: '-05:00/-04:00' },
        { id: TimezoneEnum.CHICAGO, name: 'Chicago (CST/CDT)', offset: '-06:00/-05:00' },
        { id: TimezoneEnum.DENVER, name: 'Denver (MST/MDT)', offset: '-07:00/-06:00' },
        { id: TimezoneEnum.LOS_ANGELES, name: 'Los Angeles (PST/PDT)', offset: '-08:00/-07:00' },
        { id: TimezoneEnum.TORONTO, name: 'Toronto (EST/EDT)', offset: '-05:00/-04:00' },
        { id: TimezoneEnum.LONDON, name: 'London (GMT/BST)', offset: '+00:00/+01:00' },
        { id: TimezoneEnum.PARIS, name: 'Paris (CET/CEST)', offset: '+01:00/+02:00' },
        { id: TimezoneEnum.FRANKFURT, name: 'Frankfurt (CET/CEST)', offset: '+01:00/+02:00' },
        { id: TimezoneEnum.ZURICH, name: 'Zurich (CET/CEST)', offset: '+01:00/+02:00' },
        { id: TimezoneEnum.MOSCOW, name: 'Moscow (MSK)', offset: '+03:00' },
        { id: TimezoneEnum.DUBAI, name: 'Dubai (GST)', offset: '+04:00' },
        { id: TimezoneEnum.KARACHI, name: 'Karachi (PKT)', offset: '+05:00' },
        { id: TimezoneEnum.KOLKATA, name: 'Kolkata (IST)', offset: '+05:30' },
        { id: TimezoneEnum.SHANGHAI, name: 'Shanghai (CST)', offset: '+08:00' },
        { id: TimezoneEnum.HONG_KONG, name: 'Hong Kong (HKT)', offset: '+08:00' },
        { id: TimezoneEnum.SINGAPORE, name: 'Singapore (SGT)', offset: '+08:00' },
        { id: TimezoneEnum.TOKYO, name: 'Tokyo (JST)', offset: '+09:00' },
        { id: TimezoneEnum.SEOUL, name: 'Seoul (KST)', offset: '+09:00' },
        { id: TimezoneEnum.SYDNEY, name: 'Sydney (AEST/AEDT)', offset: '+10:00/+11:00' },
        { id: TimezoneEnum.AUCKLAND, name: 'Auckland (NZST/NZDT)', offset: '+12:00/+13:00' },
        { id: TimezoneEnum.UTC, name: 'UTC', offset: '+00:00' }
    ];

    state: CandleViewTopPanelState = {
        mainIndicatorsSearch: '',
        subChartIndicatorsSearch: '',
        chartTypeSearch: '',
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

    private handleChartTypeSelect = (mainChartType: MainChartType) => {
        this.props.onChartTypeSelect(mainChartType);
        if (this.props.onCloseModals) {
            this.props.onCloseModals();
        }
    };

    private handleTimezoneSelect = (timezone: string) => {
        this.props.onTimezoneSelect(timezone);
        if (this.props.onCloseModals) {
            this.props.onCloseModals();
        }
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
            {
                type: i18n.timeframeSections.second,
                sectionKey: 'Second' as keyof CandleViewTopPanelState['timeframeSections'],
                values: [
                    TimeframeEnum.ONE_SECOND,
                    TimeframeEnum.FIVE_SECONDS,
                    TimeframeEnum.FIFTEEN_SECONDS,
                    TimeframeEnum.THIRTY_SECONDS
                ]
            },
            {
                type: i18n.timeframeSections.minute,
                sectionKey: 'Minute' as keyof CandleViewTopPanelState['timeframeSections'],
                values: [
                    TimeframeEnum.ONE_MINUTE,
                    TimeframeEnum.THREE_MINUTES,
                    TimeframeEnum.FIVE_MINUTES,
                    TimeframeEnum.FIFTEEN_MINUTES,
                    TimeframeEnum.THIRTY_MINUTES,
                    TimeframeEnum.FORTY_FIVE_MINUTES
                ]
            },
            {
                type: i18n.timeframeSections.hour,
                sectionKey: 'Hour' as keyof CandleViewTopPanelState['timeframeSections'],
                values: [
                    TimeframeEnum.ONE_HOUR,
                    TimeframeEnum.TWO_HOURS,
                    TimeframeEnum.THREE_HOURS,
                    TimeframeEnum.FOUR_HOURS,
                    TimeframeEnum.SIX_HOURS,
                    TimeframeEnum.EIGHT_HOURS,
                    TimeframeEnum.TWELVE_HOURS
                ]
            },
            {
                type: i18n.timeframeSections.day,
                sectionKey: 'Day' as keyof CandleViewTopPanelState['timeframeSections'],
                values: [
                    TimeframeEnum.ONE_DAY,
                    TimeframeEnum.THREE_DAYS
                ]
            },
            {
                type: i18n.timeframeSections.week,
                sectionKey: 'Week' as keyof CandleViewTopPanelState['timeframeSections'],
                values: [
                    TimeframeEnum.ONE_WEEK,
                    TimeframeEnum.TWO_WEEKS
                ]
            },
            {
                type: i18n.timeframeSections.month,
                sectionKey: 'Month' as keyof CandleViewTopPanelState['timeframeSections'],
                values: [
                    TimeframeEnum.ONE_MONTH,
                    TimeframeEnum.THREE_MONTHS,
                    TimeframeEnum.SIX_MONTHS
                ]
            }
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

    private getChartTypeLabel = (mainChartType: MainChartType): string => {
        const { i18n } = this.props;
        switch (mainChartType) {
            case MainChartType.Candle:
                return i18n.chartTypes.candle;
            case MainChartType.HollowCandle:
                return i18n.chartTypes.hollowCandle;
            case MainChartType.Bar:
                return i18n.chartTypes.bar;
            case MainChartType.BaseLine:
                return i18n.chartTypes.baseline;
            case MainChartType.Line:
                return i18n.chartTypes.line;
            case MainChartType.Area:
                return i18n.chartTypes.area;
            case MainChartType.StepLine:
                return i18n.chartTypes.stepLine;
            case MainChartType.Histogram:
                return i18n.chartTypes.heikinAshi;
            default:
                return "";
        }
    };

    private getCurrentTimezoneDisplayName(): string {
        const { i18n } = this.props;
        const timezoneMap: { [key: string]: string } = {
            [TimezoneEnum.NEW_YORK]: i18n.options.newYork.split(' ')[0],
            [TimezoneEnum.CHICAGO]: i18n.options.chicago.split(' ')[0],
            [TimezoneEnum.DENVER]: i18n.options.denver.split(' ')[0],
            [TimezoneEnum.LOS_ANGELES]: i18n.options.losAngeles.split(' ')[0],
            [TimezoneEnum.TORONTO]: i18n.options.toronto.split(' ')[0],
            [TimezoneEnum.LONDON]: i18n.options.london.split(' ')[0],
            [TimezoneEnum.PARIS]: i18n.options.paris.split(' ')[0],
            [TimezoneEnum.FRANKFURT]: i18n.options.frankfurt.split(' ')[0],
            [TimezoneEnum.ZURICH]: i18n.options.zurich.split(' ')[0],
            [TimezoneEnum.MOSCOW]: i18n.options.moscow.split(' ')[0],
            [TimezoneEnum.DUBAI]: i18n.options.dubai.split(' ')[0],
            [TimezoneEnum.KARACHI]: i18n.options.karachi.split(' ')[0],
            [TimezoneEnum.KOLKATA]: i18n.options.kolkata.split(' ')[0],
            [TimezoneEnum.SHANGHAI]: i18n.options.shanghai.split(' ')[0],
            [TimezoneEnum.HONG_KONG]: i18n.options.hongKong.split(' ')[0],
            [TimezoneEnum.SINGAPORE]: i18n.options.singapore.split(' ')[0],
            [TimezoneEnum.TOKYO]: i18n.options.tokyo.split(' ')[0],
            [TimezoneEnum.SEOUL]: i18n.options.seoul.split(' ')[0],
            [TimezoneEnum.SYDNEY]: i18n.options.sydney.split(' ')[0],
            [TimezoneEnum.AUCKLAND]: i18n.options.auckland.split(' ')[0],
            [TimezoneEnum.UTC]: 'UTC'
        };
        return timezoneMap[this.props.currentTimezone] || this.props.currentTimezone.split('/').pop() || this.props.currentTimezone;
    }

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
                    borderRadius: '0px',
                    padding: '0',
                    minWidth: '180px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                }}
                className="modal-scrollbar"
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}>
                    {timeframeGroups.map(group => {
                        const isExpanded = timeframeSections[group.sectionKey];

                        return (
                            <div key={group.type}>
                                <button
                                    onClick={() => this.toggleTimeframeSection(group.sectionKey)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '0px',
                                        padding: '12px 10px',
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
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                                                        borderRadius: '0px',
                                                        padding: '6px 15px',
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

    private handleChartTypeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ chartTypeSearch: e.target.value });
    };

    private renderChartTypeModal = () => {
        const { isChartTypeModalOpen, currentTheme, activeMainChartType, i18n } = this.props;
        const { chartTypeSearch } = this.state;
        if (!isChartTypeModalOpen) return null;
        const filteredChartTypes = chartTypeSearch
            ? chartTypes.filter(chartType =>
                this.getChartTypeLabel(chartType.type).toLowerCase().includes(chartTypeSearch.toLowerCase())
            )
            : chartTypes;
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
                    borderRadius: '0px',
                    padding: '0',
                    minWidth: '200px',
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
                            placeholder={i18n.searchChartTypes}
                            value={chartTypeSearch}
                            onChange={this.handleChartTypeSearch}
                            style={{
                                width: '100%',
                                background: currentTheme.toolbar.background,
                                border: `1px solid ${currentTheme.toolbar.border}`,
                                borderRadius: '0px',
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
                        {chartTypeSearch && (
                            <button
                                onClick={() => this.setState({ chartTypeSearch: '' })}
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
                    {filteredChartTypes.map(chartType => {
                        const IconComponent = ChartTypeIcon;
                        const isActive = activeMainChartType === chartType.type;
                        return (
                            <button
                                key={chartType.type}
                                onClick={() => this.handleChartTypeSelect(chartType.type)}
                                style={{
                                    background: isActive
                                        ? currentTheme.toolbar.button.active
                                        : 'transparent',
                                    border: 'none',
                                    borderRadius: '0px',
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
                                    {this.getChartTypeLabel(chartType.type)}
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
                    borderRadius: '0px',
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
                                borderRadius: '0px',
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
                                    borderRadius: '0px',
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
                    borderRadius: '0px',
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
                                borderRadius: '0px',
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
                        const isSelected = selectedSubChartIndicators.includes(indicator.type);
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
                                    borderRadius: '0px',
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
                                    position: 'relative',
                                }}>
                                    {isSelected && (
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#ffffff"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                        >
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
        const { isTimezoneModalOpen, currentTheme, i18n } = this.props;
        const { timezoneSearch } = this.state;
        if (!isTimezoneModalOpen) return null;
        const financialTimezones = [
            { id: TimezoneEnum.NEW_YORK, name: i18n.options.newYork, offset: '-05:00/-04:00' },
            { id: TimezoneEnum.CHICAGO, name: i18n.options.chicago, offset: '-06:00/-05:00' },
            { id: TimezoneEnum.DENVER, name: i18n.options.denver, offset: '-07:00/-06:00' },
            { id: TimezoneEnum.LOS_ANGELES, name: i18n.options.losAngeles, offset: '-08:00/-07:00' },
            { id: TimezoneEnum.TORONTO, name: i18n.options.toronto, offset: '-05:00/-04:00' },
            { id: TimezoneEnum.LONDON, name: i18n.options.london, offset: '+00:00/+01:00' },
            { id: TimezoneEnum.PARIS, name: i18n.options.paris, offset: '+01:00/+02:00' },
            { id: TimezoneEnum.FRANKFURT, name: i18n.options.frankfurt, offset: '+01:00/+02:00' },
            { id: TimezoneEnum.ZURICH, name: i18n.options.zurich, offset: '+01:00/+02:00' },
            { id: TimezoneEnum.MOSCOW, name: i18n.options.moscow, offset: '+03:00' },
            { id: TimezoneEnum.DUBAI, name: i18n.options.dubai, offset: '+04:00' },
            { id: TimezoneEnum.KARACHI, name: i18n.options.karachi, offset: '+05:00' },
            { id: TimezoneEnum.KOLKATA, name: i18n.options.kolkata, offset: '+05:30' },
            { id: TimezoneEnum.SHANGHAI, name: i18n.options.shanghai, offset: '+08:00' },
            { id: TimezoneEnum.HONG_KONG, name: i18n.options.hongKong, offset: '+08:00' },
            { id: TimezoneEnum.SINGAPORE, name: i18n.options.singapore, offset: '+08:00' },
            { id: TimezoneEnum.TOKYO, name: i18n.options.tokyo, offset: '+09:00' },
            { id: TimezoneEnum.SEOUL, name: i18n.options.seoul, offset: '+09:00' },
            { id: TimezoneEnum.SYDNEY, name: i18n.options.sydney, offset: '+10:00/+11:00' },
            { id: TimezoneEnum.AUCKLAND, name: i18n.options.auckland, offset: '+12:00/+13:00' },
            { id: TimezoneEnum.UTC, name: i18n.options.utc, offset: '+00:00' }
        ];

        const filteredTimezones = timezoneSearch
            ? financialTimezones.filter(timezone =>
                timezone.name.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
                timezone.id.toLowerCase().includes(timezoneSearch.toLowerCase())
            )
            : financialTimezones;
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
                    borderRadius: '0px',
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
                            placeholder={i18n.searchTimezones}
                            value={timezoneSearch}
                            onChange={this.handleTimezoneSearch}
                            style={{
                                width: '100%',
                                background: currentTheme.toolbar.background,
                                border: `1px solid ${currentTheme.toolbar.border}`,
                                borderRadius: '0px',
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
                                    borderRadius: '0px',
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
            activeMainChartType,
            isDarkTheme,
            isTimeframeModalOpen,
            isIndicatorModalOpen,
            isChartTypeModalOpen,
            isSubChartModalOpen,
            isTimezoneModalOpen,
            isTimeFormatModalOpen,
            isCloseTimeModalOpen,
            isTradingDayModalOpen,
            onThemeToggle,
            onTimeframeClick,
            onIndicatorClick,
            onChartTypeClick,
            onCompareClick,
            onFullscreenClick,
            onReplayClick,
            onTimezoneClick,
            onTimeFormatClick,
            onCloseTimeClick,
            onTradingDayClick,
            showToolbar = true,
            onCameraClick,
            i18n,
            currentTimezone,
            currentCloseTime,
            currentTradingDayType,


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
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {this.getCurrentTimezoneDisplayName()}
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
                        {this.getChartTypeLabel(activeMainChartType)}
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