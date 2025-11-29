import React from 'react';
import { ChartTypeIcon, CompareIcon, FullscreenIcon, CameraIcon, FunctionIcon, getMainChartIcon } from '../Icons';
import { ThemeConfig } from '../Theme';
import { chartTypes } from '../ChartLayer/ChartTypeManager';
import { getAllTimeframes, mainChartMaps, mainIndicators, subChartIndicators } from './Config';
import { MainChartIndicatorInfo } from '../Indicators/MainChart/MainChartIndicatorInfo';
import { MainChartType, SubChartIndicatorType, TimezoneEnum } from '../types';
import { I18n } from '../I18n';
import { getTimeframeDisplayName } from '../DataAdapter';
import { handleMainIndicatorToggle, handleSubChartIndicatorToggle } from './IndicatorProcessing';

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
    isMobileMenuOpen: boolean; 
    onMobileMenuToggle: () => void; 
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

export interface CandleViewTopPanelState {
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
    indicatorSections: {
        technicalIndicators: boolean;
        chart: boolean;
        subChartIndicators: boolean;
    };
    windowWidth: number;
}

class CandleViewTopPanel extends React.Component<CandleViewTopPanelProps> {
    private timeframeModalRef = React.createRef<HTMLDivElement>();
    private chartTypeModalRef = React.createRef<HTMLDivElement>();
    private indicatorModalRef = React.createRef<HTMLDivElement>();
    private timezoneModalRef = React.createRef<HTMLDivElement>();
    private mobileMenuModalRef = React.createRef<HTMLDivElement>();

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
        timezoneSearch: '',
        indicatorSections: {
            technicalIndicators: true,
            chart: true,
            subChartIndicators: true
        },
        windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1024
    };

    componentDidMount() {
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this.handleResize);
        }
    }

    componentWillUnmount() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.handleResize);
        }
    }

    componentDidUpdate(prevProps: CandleViewTopPanelProps) {
        if (prevProps.selectedSubChartIndicators !== this.props.selectedSubChartIndicators) {
            this.setState({
                selectedSubChartIndicators: this.props.selectedSubChartIndicators || []
            });
        }
    }

    private handleResize = () => {
        this.setState({ windowWidth: window.innerWidth });
    };

    private isMobileView = () => {
        return this.state.windowWidth <= 500;
    };

    private toggleMobileMenu = () => {
        this.props.onMobileMenuToggle();
    };

    private closeMobileMenu = () => {
        if (this.props.isMobileMenuOpen) {
            this.props.onMobileMenuToggle();
        }
    };

    private handleTimeframeSelect = (timeframe: string) => {
        this.props.onTimeframeSelect(timeframe);
        if (this.props.onCloseModals) {
            this.props.onCloseModals();
        }
        this.closeMobileMenu();
    };

    private handleChartTypeSelect = (mainChartType: MainChartType) => {
        this.props.onChartTypeSelect(mainChartType);
        if (this.props.onCloseModals) {
            this.props.onCloseModals();
        }
        this.closeMobileMenu();
    };

    private handleTimezoneSelect = (timezone: string) => {
        this.props.onTimezoneSelect(timezone);
        if (this.props.onCloseModals) {
            this.props.onCloseModals();
        }
        this.closeMobileMenu();
    };

    private handleMainIndicatorsSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ mainIndicatorsSearch: e.target.value });
    };

    private handleTimezoneSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ timezoneSearch: e.target.value });
    };

    private filteredMaps = () => {
        const { mainIndicatorsSearch } = this.state;
        if (!mainIndicatorsSearch) return mainChartMaps;
        return mainChartMaps.filter(indicator =>
            indicator.name.toLowerCase().includes(mainIndicatorsSearch.toLowerCase())
        );
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

    private toggleTimeframeSection = (sectionType: keyof CandleViewTopPanelState['timeframeSections']) => {
        this.setState((prevState: CandleViewTopPanelState) => ({
            timeframeSections: {
                ...prevState.timeframeSections,
                [sectionType]: !prevState.timeframeSections[sectionType]
            }
        }));
    };

    private toggleIndicatorSection = (sectionType: keyof CandleViewTopPanelState['indicatorSections']) => {
        this.setState((prevState: CandleViewTopPanelState) => ({
            indicatorSections: {
                ...prevState.indicatorSections,
                [sectionType]: !prevState.indicatorSections[sectionType]
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
            case MainChartType.HeikinAshi:
                return i18n.chartTypes.heikinAshi;
            case MainChartType.Histogram:
                return i18n.chartTypes.histogram;
            case MainChartType.LineBreak:
                return i18n.chartTypes.linebreak;
            case MainChartType.Mountain:
                return i18n.chartTypes.mountain;
            case MainChartType.BaselineArea:
                return i18n.chartTypes.baselinearea;
            case MainChartType.HighLow:
                return i18n.chartTypes.highlow;
            case MainChartType.HLCArea:
                return i18n.chartTypes.hlcarea;
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

    private handleMenuItemClick = (callback?: () => void) => {
        if (this.props.onCloseModals) {
            this.props.onCloseModals();
        }
        if (callback) {
            callback();
        }
    };

    private renderMobileMenuModal() {
        const { isMobileMenuOpen } = this.props;
        const { currentTheme, i18n, activeTimeframe, activeMainChartType, currentTimezone } = this.props;
        if (!isMobileMenuOpen) return null;
        return (
            <div
                ref={this.mobileMenuModalRef}
                data-mobile-menu-modal="true"
                style={{
                    position: 'absolute',
                    top: '43px',
                    left: '0px',
                    zIndex: 1001,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '8px 0',
                    minWidth: '200px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                }}
                className="modal-scrollbar"
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                }}>
                    <button
                        onClick={() => this.handleMenuItemClick(this.props.onTimeframeClick)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: currentTheme.layout.textColor,
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            minHeight: '40px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            {i18n.timeframe || 'Timeframe'}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            opacity: 0.7,
                        }}>
                            {activeTimeframe}
                        </div>
                    </button>

                    <button
                        onClick={() => this.handleMenuItemClick(this.props.onTimezoneClick)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: currentTheme.layout.textColor,
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            minHeight: '40px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            {i18n.timezone || 'Timezone'}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            opacity: 0.7,
                        }}>
                            {this.getCurrentTimezoneDisplayName()}
                        </div>
                    </button>

                    <button
                        onClick={() => this.handleMenuItemClick(this.props.onChartTypeClick)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: currentTheme.layout.textColor,
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            minHeight: '40px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            {i18n.chartType || 'Chart Type'}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <div style={{
                                fontSize: '13px',
                                opacity: 0.7,
                            }}>
                                {this.getChartTypeLabel(activeMainChartType)}
                            </div>
                            {getMainChartIcon(activeMainChartType, { size: 16 })}
                        </div>
                    </button>

                    <button
                        onClick={() => this.handleMenuItemClick(this.props.onIndicatorClick)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: currentTheme.layout.textColor,
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            minHeight: '40px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            {i18n.Indicators}
                        </div>
                        <FunctionIcon size={16} color={currentTheme.toolbar.button.color} />
                    </button>

                    <button
                        onClick={() => this.handleMenuItemClick(this.props.onCompareClick)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: currentTheme.layout.textColor,
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            minHeight: '40px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            {i18n.toolbarButtons.contrast}
                        </div>
                        <CompareIcon size={16} color={currentTheme.toolbar.button.color} />
                    </button>

                    <button
                        onClick={() => this.handleMenuItemClick(this.props.onFullscreenClick)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: currentTheme.layout.textColor,
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            minHeight: '40px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            {i18n.toolbarButtons.fullScreen}
                        </div>
                        <FullscreenIcon size={16} color={currentTheme.toolbar.button.color} />
                    </button>

                    <button
                        onClick={() => this.handleMenuItemClick(this.props.onCameraClick)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: currentTheme.layout.textColor,
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            minHeight: '40px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            {i18n.toolbarButtons.screenshot}
                        </div>
                        <CameraIcon size={16} color={currentTheme.toolbar.button.color} />
                    </button>

                    <button
                        onClick={() => this.handleMenuItemClick(this.props.onThemeToggle)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: currentTheme.layout.textColor,
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            minHeight: '40px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            {i18n.theme}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <div style={{
                                fontSize: '13px',
                                opacity: 0.7,
                            }}>
                                {this.props.isDarkTheme ? i18n.dark : i18n.light}
                            </div>
                            <div style={{
                                width: '32px',
                                height: '18px',
                                borderRadius: '9px',
                                background: this.props.isDarkTheme ? currentTheme.toolbar.button.active : currentTheme.toolbar.border,
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '2px',
                            }}>
                                <div style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    background: currentTheme.layout.textColor,
                                    transform: this.props.isDarkTheme ? 'translateX(14px)' : 'translateX(0)',
                                    transition: 'transform 0.3s ease',
                                }} />
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    private renderTimeframeModal() {
        const { isTimeframeModalOpen, currentTheme, activeTimeframe } = this.props;
        const { timeframeSections } = this.state;
        if (!isTimeframeModalOpen) return null;
        const timeframeGroups = getAllTimeframes(this.props.i18n);
        return (
            <div
                ref={this.timeframeModalRef}
                data-timeframe-modal="true"
                style={{
                    position: 'absolute',
                    top: this.isMobileView() ? '43px' : '43px',
                    left: this.isMobileView() ? '0px' : '0px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '0',
                    minWidth: this.isMobileView() ? 'calc(100vw - 20px)' : '180px',
                    maxWidth: this.isMobileView() ? 'calc(100vw - 20px)' : 'none',
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
                    top: this.isMobileView() ? '43px' : '43px',
                    left: this.isMobileView() ? '0px' : '0',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '0',
                    minWidth: this.isMobileView() ? 'calc(100vw - 20px)' : '200px',
                    maxWidth: this.isMobileView() ? 'calc(100vw - 20px)' : 'none',
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
                                    {getMainChartIcon(chartType.type,
                                        {
                                            size: 30,
                                        }
                                    )}
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
        const { mainIndicatorsSearch, indicatorSections } = this.state;
        const filteredIndicators = this.filteredMainIndicators();
        const filteredMaps = this.filteredMaps();
        const filteredSubChartIndicators = this.filteredSubChartIndicators();
        if (!isIndicatorModalOpen) return null;
        const indicatorGroups = [
            {
                type: i18n.mainChartIndicators || '技术指标',
                sectionKey: 'technicalIndicators' as keyof CandleViewTopPanelState['indicatorSections'],
                values: filteredIndicators
            },
            {
                type: i18n.subChartIndicators || '副图指标',
                sectionKey: 'subChartIndicators' as keyof CandleViewTopPanelState['indicatorSections'],
                values: filteredSubChartIndicators
            },
            {
                type: i18n.chartMaps || '图',
                sectionKey: 'chart' as keyof CandleViewTopPanelState['indicatorSections'],
                values: filteredMaps
            },
        ];
        return (
            <div
                ref={this.indicatorModalRef}
                data-indicator-modal="true"
                style={{
                    position: 'absolute',
                    top: this.isMobileView() ? '43px' : '43px',
                    left: this.isMobileView() ? '0px' : '0',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '0',
                    minWidth: this.isMobileView() ? 'calc(100vw - 20px)' : '280px',
                    maxWidth: this.isMobileView() ? 'calc(100vw - 20px)' : 'none',
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
                    gap: '4px',
                    overflowY: 'auto',
                    flex: 1,
                    padding: '8px',
                    maxHeight: '352px',
                }}
                    className="modal-scrollbar"
                >
                    {indicatorGroups.map(group => {
                        const isExpanded = indicatorSections[group.sectionKey];
                        const isSubChartGroup = group.sectionKey === 'subChartIndicators';

                        return (
                            <div key={group.type}>
                                <button
                                    onClick={() => this.toggleIndicatorSection(group.sectionKey)}
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
                                        {group.values.map(indicator => {
                                            const isSelected = isSubChartGroup
                                                ? this.state.selectedSubChartIndicators.includes(indicator.type as SubChartIndicatorType)
                                                : false;
                                            return (
                                                <button
                                                    key={indicator.id}
                                                    onClick={() => {
                                                        if (isSubChartGroup) {
                                                            handleSubChartIndicatorToggle(this, indicator.type as SubChartIndicatorType);
                                                        } else {
                                                            handleMainIndicatorToggle(this, indicator.id);
                                                        }
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
                                                    {isSubChartGroup ? (
                                                        <>
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
                                                        </>
                                                    ) : (
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
                                                    )}

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
                                )}
                            </div>
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
                    top: this.isMobileView() ? '43px' : '43px',
                    left: this.isMobileView() ? '0px' : '0px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '0',
                    minWidth: this.isMobileView() ? 'calc(100vw - 20px)' : '300px',
                    maxWidth: this.isMobileView() ? 'calc(100vw - 20px)' : 'none',
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
            isTimezoneModalOpen,
            isMobileMenuOpen,
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
        } = this.props;
        if (!showToolbar) return null;
        if (this.isMobileView()) {
            return (
                <div style={{
                    background: currentTheme.panel.backgroundColor,
                    borderBottom: `1px solid ${currentTheme.panel.borderColor}`,
                    padding: '9px 13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '43px',
                    boxSizing: 'border-box',
                    gap: '0',
                    position: 'relative',
                }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button
                            onClick={this.toggleMobileMenu}
                            className="mobile-menu-button"
                            style={{
                                background: isMobileMenuOpen
                                    ? currentTheme.toolbar.button.active
                                    : 'transparent',
                                border: 'none',
                                borderRadius: '0',
                                padding: '7px 11px',
                                cursor: 'pointer',
                                color: isMobileMenuOpen
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
                                if (!isMobileMenuOpen) {
                                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isMobileMenuOpen) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        {this.renderMobileMenuModal()}
                    </div>

                    <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: currentTheme.layout.textColor,
                    }}>
                        {activeTimeframe}
                    </div>

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

                    {this.renderTimeframeModal()}
                    {this.renderChartTypeModal()}
                    {this.renderIndicatorModal()}
                    {this.renderTimezoneModal()}
                </div>
            );
        }

        // Original desktop view
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
                            color: isChartTypeModalOpen
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
                        {getMainChartIcon(activeMainChartType, {
                            size: 17,
                        })}
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
                            padding: '3px 11px',
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
                        <FunctionIcon size={25}
                            color={isIndicatorModalOpen
                                ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                : currentTheme.toolbar.button.color}
                        />
                        {i18n.Indicators}
                    </button>
                    <div style={{
                        width: '1px',
                        height: '16px',
                        background: currentTheme.toolbar.border,
                        margin: '0 4px',
                    }} />
                    {this.renderIndicatorModal()}
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
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="4.22" />
                                    <line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                            )}
                        </div>
                    </button>
                </div>
            </div>
        );
    }
}

export default CandleViewTopPanel;