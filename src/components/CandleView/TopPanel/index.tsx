import React from 'react';
import { FullscreenIcon, CameraIcon, FunctionIcon, getMainChartIcon } from '../Icons';
import { ThemeConfig } from '../Theme';
import { chartTypes } from '../ChartLayer/ChartTypeManager';
import { getAllTimeframes, getMainChartMaps, getMainIndicators, getSubChartIndicators } from './Config';
import { MainChartIndicatorInfo } from '../Indicators/MainChart/MainChartIndicatorInfo';
import { MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from '../types';
import { I18n } from '../I18n';
import { getTimeframeDisplayName } from '../DataAdapter';
import { handleMainIndicatorToggle, handleSubChartIndicatorToggle } from './IndicatorProcessing';

interface TopPanelProps {
  candleViewRef?: React.RefObject<HTMLDivElement | null>;
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
  onCloseModals?: () => void;
  onSubChartClick?: () => void;
  selectedSubChartIndicators?: SubChartIndicatorType[];
  onCameraClick: () => void;
  i18n: I18n;
  currentTimezone: string;
  timeframe?: TimeframeEnum;
  timezone?: TimezoneEnum;
  // is open internal time frame calculation
  isCloseInternalTimeFrameCalculation: boolean;
  // timeframe callback mapping
  timeframeCallbacks: Partial<Record<TimeframeEnum, () => void>>;
  // is mobile mode
  isMobileMode?: boolean;
}

export interface TopPanelState {
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
  scrollButtonVisibility: {
    showLeft: boolean,
    showRight: boolean,
  },
}

class TopPanel extends React.Component<TopPanelProps> {
  private timeframeModalRef = React.createRef<HTMLDivElement>();
  private chartTypeModalRef = React.createRef<HTMLDivElement>();
  private indicatorModalRef = React.createRef<HTMLDivElement>();
  private timezoneModalRef = React.createRef<HTMLDivElement>();
  private scrollContainerRef = React.createRef<HTMLDivElement>();
  state: TopPanelState = {
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
    scrollButtonVisibility: {
      showLeft: false,
      showRight: false,
    },
  };

  componentDidMount() {
    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', this.handleClickOutside, true);
    }
    // mobile 
    document.addEventListener('touchstart', this.handleClickOutside, true);
    this.checkScrollPosition();
    window.addEventListener('resize', this.checkScrollPosition);
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      document.removeEventListener('mousedown', this.handleClickOutside, true);
    }
    window.removeEventListener('resize', this.checkScrollPosition);
  }

  componentDidUpdate(prevProps: TopPanelProps) {
    if (prevProps.selectedSubChartIndicators !== this.props.selectedSubChartIndicators) {
      this.setState({
        selectedSubChartIndicators: this.props.selectedSubChartIndicators || []
      });
    }
  }

  private checkScrollPosition = () => {
    const container = this.scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      this.setState({
        scrollButtonVisibility: {
          showLeft: scrollLeft > 10,
          showRight: scrollLeft < scrollWidth - clientWidth - 10,
        },
      });
    }
  };

  private scrollToLeft = () => {
    if (this.scrollContainerRef.current) {
      this.scrollContainerRef.current.scrollLeft = 0;
      this.checkScrollPosition();
    }
  };

  private scrollToRight = () => {
    if (this.scrollContainerRef.current) {
      const container = this.scrollContainerRef.current;
      container.scrollLeft = container.scrollWidth;
      this.checkScrollPosition();
    }
  };

  private handleClickOutside = (event: Event) => {
    const target = event.target as Element;
    const isModalClick = target.closest('[data-timeframe-modal]') ||
      target.closest('[data-chart-type-modal]') ||
      target.closest('[data-indicator-modal]') ||
      target.closest('[data-timezone-modal]') ||
      target.closest('[data-mobile-menu-modal]');
    const isButtonClick = target.closest('.timeframe-button') ||
      target.closest('.chart-type-button') ||
      target.closest('.indicator-button') ||
      target.closest('.timezone-button') ||
      target.closest('.mobile-menu-button');
    if (isModalClick || isButtonClick) {
      return;
    }
    const {
      isTimeframeModalOpen,
      isChartTypeModalOpen,
      isIndicatorModalOpen,
      isTimezoneModalOpen,
      isMobileMenuOpen
    } = this.props;
    if (isTimeframeModalOpen || isChartTypeModalOpen || isIndicatorModalOpen ||
      isTimezoneModalOpen || isMobileMenuOpen) {
      if (this.props.onCloseModals) {
        this.props.onCloseModals();
      }
    }
  };

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

  private handleMainIndicatorsSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ mainIndicatorsSearch: e.target.value });
  };

  private handleTimezoneSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ timezoneSearch: e.target.value });
  };

  private filteredMaps = () => {
    const { mainIndicatorsSearch } = this.state;
    const { i18n } = this.props;
    const maps = getMainChartMaps(i18n);
    if (!mainIndicatorsSearch) return maps;
    return maps.filter(indicator =>
      indicator.name.toLowerCase().includes(mainIndicatorsSearch.toLowerCase())
    );
  };

  private filteredMainIndicators = () => {
    const { mainIndicatorsSearch } = this.state;
    const { i18n } = this.props;
    const indicators = getMainIndicators(i18n);
    if (!mainIndicatorsSearch) return indicators;
    return indicators.filter(indicator =>
      indicator.name.toLowerCase().includes(mainIndicatorsSearch.toLowerCase())
    );
  };

  private filteredSubChartIndicators = () => {
    const { subChartIndicatorsSearch } = this.state;
    const { i18n } = this.props;
    const indicators = getSubChartIndicators(i18n);
    if (!subChartIndicatorsSearch) return indicators;
    return indicators.filter(indicator =>
      indicator.name.toLowerCase().includes(subChartIndicatorsSearch.toLowerCase())
    );
  };

  private toggleTimeframeSection = (sectionType: keyof TopPanelState['timeframeSections']) => {
    this.setState((prevState: TopPanelState) => ({
      timeframeSections: {
        ...prevState.timeframeSections,
        [sectionType]: !prevState.timeframeSections[sectionType]
      }
    }));
  };

  private toggleIndicatorSection = (sectionType: keyof TopPanelState['indicatorSections']) => {
    this.setState((prevState: TopPanelState) => ({
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
    const targetTimezone = this.props.timezone || this.props.currentTimezone;
    return timezoneMap[targetTimezone] || targetTimezone.split('/').pop() || targetTimezone;
  }

  private getCandleViewHeight = (): number => {
    if (this.props.candleViewRef && this.props.candleViewRef.current) {
      return this.props.candleViewRef.current.clientHeight || 0;
    }
    return window.innerHeight * 0.7;
  };

  private calculateModalHeight = (): number => {
    const candleViewHeight = this.getCandleViewHeight();
    return Math.min(candleViewHeight * 0.8, 400);
  };

  private calculateModalTop = (): string => {
    const topOffset = this.getCandleViewHeight() * 0.045;
    return `${topOffset}px`;
  };

  private calculateModalPosition = (defaultLeft: string, modalWidth: number = 280): { left: string, width?: number } => {
    const container = this.scrollContainerRef.current;
    if (!container) return { left: defaultLeft };
    const containerRect = container.getBoundingClientRect();
    const containerLeft = containerRect.left;
    const containerRight = containerRect.right;
    const containerWidth = containerRect.width;
    const defaultLeftValue = parseFloat(defaultLeft);
    const expectedRight = containerLeft + defaultLeftValue + modalWidth;
    if (expectedRight > containerRight) {
      const availableSpace = containerRight - containerLeft;
      if (availableSpace > modalWidth) {
        const adjustedLeft = availableSpace - modalWidth;
        return { left: `${adjustedLeft}px` };
      }
      else {
        const adjustedWidth = availableSpace - 20;
        return { left: '10px', width: Math.max(200, adjustedWidth) };
      }
    }
    return { left: defaultLeft };
  };

  private renderTimeframeModal() {
    const { isTimeframeModalOpen, currentTheme, activeTimeframe, timeframeCallbacks, isCloseInternalTimeFrameCalculation, isMobileMode } = this.props;
    const { timeframeSections } = this.state;
    if (!isTimeframeModalOpen) return null;
    const allTimeframeGroups = getAllTimeframes(this.props.i18n);
    let timeframeGroups = allTimeframeGroups;
    if (isCloseInternalTimeFrameCalculation && timeframeCallbacks) {
      const availableTimeframes = Object.keys(timeframeCallbacks) as TimeframeEnum[];
      timeframeGroups = allTimeframeGroups.map(group => ({
        ...group,
        values: group.values.filter(tf =>
          availableTimeframes.includes(tf as TimeframeEnum)
        )
      })).filter(group => group.values.length > 0);
    }
    const modalHeight = this.calculateModalHeight();
    const topOffset = this.calculateModalTop();
    const modalWidth = 180;
    const position = this.calculateModalPosition('13px', modalWidth);
    const modalContent = (
      <div
        ref={this.timeframeModalRef}
        data-timeframe-modal="true"
        style={{
          background: currentTheme.toolbar.background,
          border: `1px solid ${currentTheme.toolbar.border}`,
          borderRadius: '0px',
          padding: '0',
          minWidth: '180px',
          width: isMobileMode ? '100%' : (position.width ? `${position.width}px` : '180px'),
          maxWidth: isMobileMode ? '400px' : 'none',
          maxHeight: isMobileMode ? '80vh' : `${modalHeight}px`,
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

    if (isMobileMode) {
      return (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={this.props.onCloseModals}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              width: '90%',
              maxWidth: '400px',
              maxHeight: '80vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {modalContent}
          </div>
        </>
      );
    } else {
      return (
        <div
          style={{
            position: 'absolute',
            top: topOffset,
            left: position.left,
            zIndex: 1000,
          }}
        >
          {modalContent}
        </div>
      );
    }
  }


  private handleChartTypeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ chartTypeSearch: e.target.value });
  };

  private renderChartTypeModal = () => {
    const { isChartTypeModalOpen, currentTheme, activeMainChartType, i18n, isMobileMode } = this.props;
    const { chartTypeSearch } = this.state;
    if (!isChartTypeModalOpen) return null;
    const filteredChartTypes = chartTypeSearch
      ? chartTypes.filter(chartType =>
        this.getChartTypeLabel(chartType.type).toLowerCase().includes(chartTypeSearch.toLowerCase())
      )
      : chartTypes;
    const modalHeight = this.calculateModalHeight();
    const topOffset = this.calculateModalTop();
    const modalWidth = 200;
    const position = this.calculateModalPosition('138px', modalWidth);
    const modalContent = (
      <div
        ref={this.chartTypeModalRef}
        data-chart-type-modal="true"
        style={{
          background: currentTheme.toolbar.background,
          border: `1px solid ${currentTheme.toolbar.border}`,
          borderRadius: '0px',
          padding: '0',
          minWidth: '200px',
          width: isMobileMode ? '100%' : (position.width ? `${position.width}px` : '180px'),
          maxWidth: isMobileMode ? '400px' : 'none',
          maxHeight: isMobileMode ? '80vh' : `${modalHeight}px`,
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
          maxHeight: isMobileMode ? 'calc(80vh - 73px)' : `calc(${modalHeight}px - 73px)`,
        }}
          className="modal-scrollbar"
        >
          {filteredChartTypes.map(chartType => {
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

    if (isMobileMode) {
      return (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={this.props.onCloseModals}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              width: '90%',
              maxWidth: '400px',
              maxHeight: '80vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {modalContent}
          </div>
        </>
      );
    } else {
      return (
        <div
          style={{
            position: 'absolute',
            top: topOffset,
            left: position.left,
            zIndex: 1000,
          }}
        >
          {modalContent}
        </div>
      );
    }
  };

  private renderIndicatorModal = () => {
    const { isIndicatorModalOpen, currentTheme, i18n, isMobileMode } = this.props;
    const { mainIndicatorsSearch, indicatorSections } = this.state;
    const filteredIndicators = this.filteredMainIndicators();
    const filteredMaps = this.filteredMaps();
    const filteredSubChartIndicators = this.filteredSubChartIndicators();
    if (!isIndicatorModalOpen) return null;
    const indicatorGroups = [
      {
        type: i18n.mainChartIndicators || '技术指标',
        sectionKey: 'technicalIndicators' as keyof TopPanelState['indicatorSections'],
        values: filteredIndicators
      },
      {
        type: i18n.subChartIndicators || '副图指标',
        sectionKey: 'subChartIndicators' as keyof TopPanelState['indicatorSections'],
        values: filteredSubChartIndicators
      },
      {
        type: i18n.chartMaps || '图',
        sectionKey: 'chart' as keyof TopPanelState['indicatorSections'],
        values: filteredMaps
      },
    ];
    const modalHeight = this.calculateModalHeight();
    const topOffset = this.calculateModalTop();
    const modalWidth = 280;
    const position = this.calculateModalPosition('185px', modalWidth);
    const modalContent = (
      <div
        ref={this.indicatorModalRef}
        data-indicator-modal="true"
        style={{
          background: currentTheme.toolbar.background,
          border: `1px solid ${currentTheme.toolbar.border}`,
          borderRadius: '0px',
          padding: '0',
          minWidth: '280px',
          width: isMobileMode ? '100%' : (position.width ? `${position.width}px` : '180px'),
          maxWidth: isMobileMode ? '400px' : 'none',
          maxHeight: isMobileMode ? '80vh' : `${modalHeight}px`,
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
          maxHeight: isMobileMode ? 'calc(80vh - 73px)' : `calc(${modalHeight}px - 73px)`,
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
                    {(group.values as any[]).map(indicator => {
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
                            <React.Fragment>
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
                            </React.Fragment>
                          ) : (
                            null
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

    if (isMobileMode) {
      return (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={this.props.onCloseModals}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              width: '90%',
              maxWidth: '400px',
              maxHeight: '80vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {modalContent}
          </div>
        </>
      );
    } else {
      return (
        <div
          style={{
            position: 'absolute',
            top: topOffset,
            left: position.left,
            zIndex: 1000,
          }}
        >
          {modalContent}
        </div>
      );
    }
  };

  private renderTimezoneModal() {
    const { isTimezoneModalOpen, currentTheme, i18n, isMobileMode } = this.props;
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
    const modalHeight = this.calculateModalHeight();
    const topOffset = this.calculateModalTop();
    const modalWidth = 300;
    const position = this.calculateModalPosition('60px', modalWidth);
    const modalContent = (
      <div
        ref={this.timezoneModalRef}
        data-timezone-modal="true"
        style={{
          background: currentTheme.toolbar.background,
          border: `1px solid ${currentTheme.toolbar.border}`,
          borderRadius: '0px',
          padding: '0',
          minWidth: '300px',
          width: isMobileMode ? '100%' : (position.width ? `${position.width}px` : '180px'),
          maxWidth: isMobileMode ? '400px' : 'none',
          maxHeight: isMobileMode ? '80vh' : `${modalHeight}px`,
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
          maxHeight: isMobileMode ? 'calc(80vh - 73px)' : `calc(${modalHeight}px - 73px)`,
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

    if (isMobileMode) {
      return (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={this.props.onCloseModals}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              width: '90%',
              maxWidth: '400px',
              maxHeight: '80vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {modalContent}
          </div>
        </>
      );
    } else {
      return (
        <div
          style={{
            position: 'absolute',
            top: topOffset,
            left: position.left,
            zIndex: 1000,
          }}
        >
          {modalContent}
        </div>
      );
    }
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
      onThemeToggle,
      onTimeframeClick,
      onIndicatorClick,
      onChartTypeClick,
      onFullscreenClick,
      onTimezoneClick,
      onCameraClick,
      i18n,
    } = this.props;
    const { scrollButtonVisibility } = this.state;
    return (
      <>
        <div style={{
          background: currentTheme.panel.backgroundColor,
          borderBottom: `1px solid ${currentTheme.panel.borderColor}`,
          padding: '9px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          height: '43px',
          boxSizing: 'border-box',
          gap: '0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {scrollButtonVisibility.showLeft && (
            <button
              onClick={this.scrollToLeft}
              style={{
                position: 'absolute',
                left: '0',
                top: '0',
                bottom: '0',
                zIndex: 10,
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: 'none',
                borderRight: `1px solid rgba(255, 255, 255, 0.1)`,
                borderRadius: '0px',
                padding: '0 6px',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                width: '30px',
                height: '100%',
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
              }}
            >
              <span style={{ fontSize: '16px' }}>‹</span>
            </button>
          )}
          <div
            ref={this.scrollContainerRef}
            style={{
              flex: 1,
              overflowX: 'auto',
              overflowY: 'hidden',
              display: 'flex',
              alignItems: 'center',
              gap: '0',
              padding: '0 13px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onScroll={this.checkScrollPosition}
          >
            <style>{`
          [style*="overflowX: auto"]::-webkit-scrollbar {
            height: 0px;
            background: transparent;
          }
          [style*="overflowX: auto"]::-webkit-scrollbar-thumb {
            background: transparent;
          }
          [style*="overflowX: auto"]::-webkit-scrollbar-track {
            background: transparent;
          }
        `}</style>
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
                {this.props.timeframe || activeTimeframe}
              </button>
              <div style={{
                width: '1px',
                height: '16px',
                background: currentTheme.toolbar.border,
                margin: '0 4px',
              }} />
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
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
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
          {scrollButtonVisibility.showRight && (
            <button
              onClick={this.scrollToRight}
              style={{
                position: 'absolute',
                right: '0',
                top: '0',
                bottom: '0',
                zIndex: 10,
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: 'none',
                borderLeft: `1px solid rgba(255, 255, 255, 0.1)`,
                borderRadius: '0px',
                padding: '0 6px',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                width: '30px',
                height: '100%',
                boxShadow: 'none',
              }}
            >
              <span style={{ fontSize: '16px' }}>›</span>
            </button>
          )}
        </div>
        {this.renderTimeframeModal()}
        {this.renderTimezoneModal()}
        {this.renderChartTypeModal()}
        {this.renderIndicatorModal()}
      </>
    );
  }
}

export default TopPanel;
