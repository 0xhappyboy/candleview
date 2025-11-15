import React from 'react';
import { ChartTypeIcon, TimeframeIcon, IndicatorIcon, CompareIcon, FullscreenIcon } from '../CandleViewIcons';
import { ThemeConfig } from '../CandleViewTheme';
import { chartTypes } from '../ChartLayer/ChartTypeManager';
import { MainChartIndicatorsSettingType } from '../ChartLayer/Modal/MainChartIndicatorsSettingModal';
import { MainChartIndicatorType } from '../types';
import { mainIndicators, subChartIndicators } from './CandleViewTopPanelConfig';

interface CandleViewTopPanelProps {
    currentTheme: ThemeConfig;
    activeTimeframe: string;
    activeChartType: string;
    isDarkTheme: boolean;
    isTimeframeModalOpen: boolean;
    isIndicatorModalOpen: boolean;
    isChartTypeModalOpen: boolean;
    isSubChartModalOpen: boolean;
    onThemeToggle: () => void;
    onTimeframeClick: () => void;
    onIndicatorClick: () => void;
    onChartTypeClick: () => void;
    onCompareClick: () => void;
    onFullscreenClick: () => void;
    onReplayClick: () => void;
    onTimeframeSelect: (timeframe: string) => void;
    onChartTypeSelect: (chartType: string) => void;
    handleSelectedMainChartIndicator: (indicators: MainChartIndicatorsSettingType[]) => void;
    showToolbar?: boolean;
    onCloseModals?: () => void;
    onSubChartClick?: () => void;
}

interface CandleViewTopPanelState {
    mainIndicatorsSearch: string;
    subChartIndicatorsSearch: string;
    selectedMainIndicators: MainChartIndicatorsSettingType[];
    selectedSubChartIndicators: MainChartIndicatorsSettingType[];
    timeframeSections: {
        Second: boolean;
        Minute: boolean;
        Hour: boolean;
        Day: boolean;
        Week: boolean;
        Month: boolean;
    };
}

class CandleViewTopPanel extends React.Component<CandleViewTopPanelProps> {
    private timeframeModalRef = React.createRef<HTMLDivElement>();
    private chartTypeModalRef = React.createRef<HTMLDivElement>();
    private indicatorModalRef = React.createRef<HTMLDivElement>();
    private subChartModalRef = React.createRef<HTMLDivElement>();

    private mainButtons = [
        { id: 'alert', label: 'Hint', icon: null },
        { id: 'replay', label: 'Replay', icon: null },
    ];

    state: CandleViewTopPanelState = {
        mainIndicatorsSearch: '',
        subChartIndicatorsSearch: '',
        selectedMainIndicators: [],
        selectedSubChartIndicators: [],
        timeframeSections: {
            Second: true,
            Minute: true,
            Hour: true,
            Day: true,
            Week: true,
            Month: true
        }
    };

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

    private handleAddIndicator = (indicators: MainChartIndicatorsSettingType | MainChartIndicatorsSettingType[]) => {
        const indicatorArray = Array.isArray(indicators) ? indicators : [indicators];
        this.props.handleSelectedMainChartIndicator(indicatorArray);
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
        this.setState((prevState: { selectedMainIndicators: MainChartIndicatorsSettingType[] }) => {
            const existingIndex = prevState.selectedMainIndicators.findIndex(
                indicator => indicator.id === indicatorId
            );
            let newSelectedMainIndicators: MainChartIndicatorsSettingType[];
            if (existingIndex >= 0) {
                newSelectedMainIndicators = prevState.selectedMainIndicators.filter(
                    indicator => indicator.id !== indicatorId
                );
            } else {
                const indicatorConfig = mainIndicators.find(ind => ind.id === indicatorId);
                const newIndicator: MainChartIndicatorsSettingType = {
                    id: indicatorId,
                    value: 14,
                    color: '#2962FF',
                    lineWidth: 1,
                    type: indicatorConfig ? indicatorConfig.type : null
                };
                newSelectedMainIndicators = [...prevState.selectedMainIndicators, newIndicator];
            }
            return {
                selectedMainIndicators: newSelectedMainIndicators
            };
        }, () => {
            this.props.handleSelectedMainChartIndicator(this.state.selectedMainIndicators);
        });
    };

    private handleSubChartIndicatorToggle = (indicatorId: string) => {
        this.setState((prevState: { selectedSubChartIndicators: MainChartIndicatorsSettingType[] }) => {
            const existingIndex = prevState.selectedSubChartIndicators.findIndex(
                indicator => indicator.id === indicatorId
            );
            let newSelectedSubChartIndicators: MainChartIndicatorsSettingType[];
            if (existingIndex >= 0) {
                newSelectedSubChartIndicators = prevState.selectedSubChartIndicators.filter(
                    indicator => indicator.id !== indicatorId
                );
            } else {
                const newIndicator: MainChartIndicatorsSettingType = {
                    id: indicatorId,
                    value: 14,
                    color: '#2962FF',
                    lineWidth: 1,
                    type: null
                };
                newSelectedSubChartIndicators = [...prevState.selectedSubChartIndicators, newIndicator];
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

    private getAllTimeframes = () => {
        return [
            { type: 'Second', values: ['1s', '5s', '15s', '30s'] },
            { type: 'Minute', values: ['1m', '3m', '5m', '15m', '30m', '45m'] },
            { type: 'Hour', values: ['1H', '2H', '3H', '4H', '6H', '8H', '12H'] },
            { type: 'Day', values: ['1D', '3D'] },
            { type: 'Week', values: ['1W', '2W'] },
            { type: 'Month', values: ['1M', '3M', '6M'] }
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

    private renderTimeframeModal = () => {
        const { isTimeframeModalOpen, currentTheme, activeTimeframe } = this.props;
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
                        const isExpanded = timeframeSections[group.type as keyof CandleViewTopPanelState['timeframeSections']];
                        return (
                            <div key={group.type}>
                                <button
                                    onClick={() => this.toggleTimeframeSection(group.type as keyof CandleViewTopPanelState['timeframeSections'])}
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
                                                        {timeframe}
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

    private renderChartTypeModal = () => {
        const { isChartTypeModalOpen, currentTheme, activeChartType } = this.props;

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
                                    {chartType.label}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    private renderIndicatorModal = () => {
        const { isIndicatorModalOpen, currentTheme } = this.props;
        const { mainIndicatorsSearch, selectedMainIndicators } = this.state;
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
                            placeholder="Search indicators..."
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
                        const isSelected = selectedMainIndicators.some(
                            selected => selected.id === indicator.id
                        );

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

    private renderSubChartModal = () => {
        const { isSubChartModalOpen, currentTheme } = this.props;
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
                            placeholder="Search indicators..."
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
                            selected => selected.id === indicator.id
                        );

                        return (
                            <button
                                key={indicator.id}
                                onClick={() => {
                                    this.handleSubChartIndicatorToggle(indicator.id);
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
            onThemeToggle,
            onTimeframeClick,
            onIndicatorClick,
            onChartTypeClick,
            onCompareClick,
            onFullscreenClick,
            onReplayClick,
            showToolbar = true,
        } = this.props;
        if (!showToolbar) return null;
        return (
            <div style={{
                background: currentTheme.toolbar.background,
                borderBottom: `1px solid ${currentTheme.toolbar.border}`,
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
                        {chartTypes.find(type => type.id === activeChartType)?.label || 'Chart Type'}
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
                        Main Indicators
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
                        Sub-chart Indicators
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
                        title="Contrast"
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
                        title="Full Screen"
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
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                        fontSize: '12px',
                        color: currentTheme.toolbar.button.color,
                        fontWeight: '500',
                        opacity: 0.8,
                    }}>
                        Theme
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
                        {isDarkTheme ? 'Dark' : 'Light'}
                    </span>
                </div>
            </div>
        );
    }
}

export default CandleViewTopPanel;