import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { ThemeConfig, Dark, Light } from './CandleViewTheme';
import {
  chartTypes,
  switchChartType,
  updateSeriesTheme,
  ChartSeries,
} from './ChartLayer/ChartTypeManager';
import CandleViewTopPanel from './CandleViewTopPanel';
// import './GlobalStyle.css';
import { DAY_TEST_CANDLEVIEW_DATA } from './TestData';
import { ChartLayer } from './ChartLayer';
import { DEFAULT_HEIGHT } from './Global';
import { ChartManager } from './ChartLayer/ChartManager';
import CandleViewLeftPanel from './CandleViewLeftPanel';
import { MainChartIndicatorInfo } from './Indicators/MainChart/MainChartIndicatorInfo';
import { SubChartTechnicalIndicatorsPanel } from './Indicators/SubChartTechnicalIndicatorsPanel';
import { EN, I18n, zhCN } from './I18n';
import { ICandleViewDataPoint, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from './types';
import { captureWithCanvas } from './Camera';
import { IStaticMarkData } from './MarkManager/StaticMarkManager';
import { aggregateDataForTimeframe, formatDataForSeries, generateExtendedVirtualData, processAllTimeConfigurations, TIMEFRAME_CONFIGS } from './DataAdapter';
import { mapTimeframe, mapTimezone } from './tools';

export interface CandleViewProps {
  theme?: 'dark' | 'light';
  i18n?: 'en' | 'zh-cn';
  showToolbar?: boolean;
  showIndicators?: boolean;
  height?: number | string;
  data: ICandleViewDataPoint[];
  title: string;
  topMark?: IStaticMarkData[];
  bottomMark?: IStaticMarkData[];
  // time config
  timeframe?: string;
  timezone?: string;
}

interface CandleViewState {
  isIndicatorModalOpen: boolean;
  isTimeframeModalOpen: boolean;
  isTradeModalOpen: boolean;
  isChartTypeModalOpen: boolean;
  isSubChartModalOpen: boolean;
  activeTool: string | null;
  currentTheme: ThemeConfig;
  currentI18N: I18n;
  activeChartType: string;
  chartInitialized: boolean;
  isDarkTheme: boolean;
  selectedEmoji: string;
  selectedSubChartIndicators: SubChartIndicatorType[];
  selectedMainChartIndicator: MainChartIndicatorInfo | null;
  subChartPanelHeight: number;
  isResizing: boolean;
  showInfoLayer: boolean;
  isTimezoneModalOpen: boolean;
  currentTimezone: string;
  isTimeFormatModalOpen: boolean;
  isCloseTimeModalOpen: boolean;
  isTradingDayModalOpen: boolean;
  currentCloseTime: string;
  currentTradingDayType: string;
  // time config
  activeTimeframe: TimeframeEnum;
  timeframe?: TimeframeEnum;
  timezone?: TimezoneEnum;
  savedVisibleRange: { from: number; to: number } | null;
  // The main chart visible range is used to synchronize the visible range position between the main chart and the sub chart.
  mainChartVisibleRange: { from: number; to: number } | null;
  adxChartVisibleRange: { from: number; to: number } | null;
  atrChartVisibleRange: { from: number; to: number } | null;
  bbwidthChartVisibleRange: { from: number; to: number } | null;
  cciChartVisibleRange: { from: number; to: number } | null;
  kdjChartVisibleRange: { from: number; to: number } | null;
  macdChartVisibleRange: { from: number; to: number } | null;
  obvhartVisibleRange: { from: number; to: number } | null;
  rsiChartVisibleRange: { from: number; to: number } | null;
  sarChartVisibleRange: { from: number; to: number } | null;
  volumeChartVisibleRange: { from: number; to: number } | null;
}

export class CandleView extends React.Component<CandleViewProps, CandleViewState> {
  public candleViewContainerRef = React.createRef<HTMLDivElement>();
  private chartRef = React.createRef<HTMLDivElement>();
  private chartContainerRef = React.createRef<HTMLDivElement>();
  private tradeModalRef = React.createRef<HTMLDivElement>();
  private drawingLayerRef = React.createRef<any>();
  private chart: any = null;
  private lineSeries: any = null;
  private resizeObserver: ResizeObserver | null = null;
  private realTimeInterval: NodeJS.Timeout | null = null;
  // The series of the current main image canvas
  private currentSeries: ChartSeries | null = null;
  private chartManager: ChartManager | null = null;
  private resizeHandleRef = React.createRef<HTMLDivElement>();
  private startY = 0;
  private startHeight = 0;
  private isUpdatingData: boolean = false;
  private updateTimeout: NodeJS.Timeout | null = null;

  constructor(props: CandleViewProps) {
    super(props);
    this.state = {
      isIndicatorModalOpen: false,
      isTimeframeModalOpen: false,
      isTradeModalOpen: false,
      isChartTypeModalOpen: false,
      isSubChartModalOpen: false,
      activeTool: null,
      activeChartType: 'candle',
      currentTheme: this.getThemeConfig(props.theme || 'dark'),
      currentI18N: this.getI18nConfig(props.i18n || 'zh-cn'),
      chartInitialized: false,
      isDarkTheme: props.theme === 'light' ? false : true,
      selectedEmoji: '😀',
      selectedSubChartIndicators: [],
      selectedMainChartIndicator: null,
      subChartPanelHeight: 200,
      isResizing: false,
      showInfoLayer: true,
      isTimezoneModalOpen: false,
      currentTimezone: 'Asia/Shanghai',
      isTimeFormatModalOpen: false,
      isCloseTimeModalOpen: false,
      isTradingDayModalOpen: false,
      currentCloseTime: '17:00',
      currentTradingDayType: 'trading-session',
      // time
      activeTimeframe: TimeframeEnum.ONE_DAY,
      timeframe: mapTimeframe(props.timeframe) || TimeframeEnum.ONE_DAY,
      timezone: mapTimezone(props.timezone) || TimezoneEnum.SHANGHAI,
      savedVisibleRange: null,
      mainChartVisibleRange: null,
      adxChartVisibleRange: null,
      atrChartVisibleRange: null,
      bbwidthChartVisibleRange: null,
      cciChartVisibleRange: null,
      kdjChartVisibleRange: null,
      macdChartVisibleRange: null,
      obvhartVisibleRange: null,
      rsiChartVisibleRange: null,
      sarChartVisibleRange: null,
      volumeChartVisibleRange: null,
    };
  }

  handleTimeFormatClick = () => {
    this.setState({
      isTimeFormatModalOpen: true,
    });
  }

  handleCloseTimeClick = () => {
    this.setState({
      isCloseTimeModalOpen: true,
    });
  }

  handleTradingDayClick = () => {
    this.setState({
      isTradingDayModalOpen: true,
    });
  }

  scrollToOriginalData = () => {
    if (!this.chart) return;
    const { data } = this.props;
    if (!data || data.length === 0) return;
    const config = TIMEFRAME_CONFIGS[this.state.activeTimeframe];
    const interval = config ? config.seconds : 86400;
    try {
      const timeScale = this.chart.timeScale();
      const currentData = this.currentSeries?.series?.data || [];
      if (currentData.length === 0) return;
      const { firstIndex } = this.getRealDataRange();
      if (firstIndex !== -1) {
        const visibleBars = 30;
        timeScale.setVisibleLogicalRange({
          from: Math.max(0, firstIndex - 5),
          to: Math.min(currentData.length - 1, firstIndex + visibleBars)
        });
      } else {
        const firstOriginalTime = data[0].time;
        timeScale.setVisibleRange({
          from: firstOriginalTime - (interval * 10),
          to: firstOriginalTime + (interval * 30)
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  componentDidMount() {
    if (this.chart) return;
    setTimeout(() => {
      this.initializeChart();
    }, 100);
    document.addEventListener('mousedown', this.handleClickOutside, true);
  }

  handleTimezoneClick = () => {
    this.setState({
      isTimezoneModalOpen: true,
    });
  }

  handleTimezoneSelect = (timezone: string) => {
    this.setState({
      currentTimezone: timezone,
      timezone: timezone as TimezoneEnum,
      isTimezoneModalOpen: false
    });
  };

  handleCloseModals = () => {
    this.setState({
      isTimeframeModalOpen: false,
      isIndicatorModalOpen: false,
      isChartTypeModalOpen: false,
      isSubChartModalOpen: false,
      isTimezoneModalOpen: false,
      isTimeFormatModalOpen: false,
      isCloseTimeModalOpen: false,
      isTradingDayModalOpen: false
    });
  }

  private getAggregatedData(): ICandleViewDataPoint[] {
    const { data } = this.props;
    const { processedData } = this.processAllTimeConfigurations();
    return processedData;
  }

  private getVisibleTimeRange(): { from: number; to: number } | null {
    if (!this.chart) return null;
    try {
      const timeScale = this.chart.timeScale();
      const timeRange = timeScale.getVisibleRange();
      if (!timeRange) return null;
      return {
        from: timeRange.from,
        to: timeRange.to
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private setVisibleTimeRange(visibleRange: { from: number; to: number } | null) {
    if (!this.chart || !visibleRange) return;
    const timeScale = this.chart.timeScale();
    try {
      timeScale.setVisibleRange({
        from: visibleRange.from,
        to: visibleRange.to
      });
    } catch (error) {
      console.error(error);
      this.scrollToRealData();
    }
  }

  private getRealDataTimeRange(): { firstRealTime: number; lastRealTime: number } | null {
    const currentData = this.currentSeries?.series?.data || [];
    let firstRealTime: number | null = null;
    let lastRealTime: number | null = null;
    for (const dataPoint of currentData) {
      const isRealData = !dataPoint.isVirtual && dataPoint.volume !== -1 && dataPoint.volume !== 0;
      if (isRealData) {
        const timestamp = typeof dataPoint.time === 'string' ?
          new Date(dataPoint.time).getTime() / 1000 : dataPoint.time;
        if (firstRealTime === null || timestamp < firstRealTime) {
          firstRealTime = timestamp;
        }
        if (lastRealTime === null || timestamp > lastRealTime) {
          lastRealTime = timestamp;
        }
      }
    }
    return firstRealTime !== null && lastRealTime !== null ?
      { firstRealTime, lastRealTime } : null;
  }

  updateChartData() {
    const aggregatedData = this.getAggregatedData();
    if (this.currentSeries && this.currentSeries.series && aggregatedData.length > 0) {
      try {
        const visibleRange = this.getVisibleTimeRange();
        const formattedData = formatDataForSeries(aggregatedData, this.state.activeChartType);
        this.currentSeries.series.setData(formattedData);
        if (visibleRange) {
          setTimeout(() => {
            this.setVisibleTimeRange(visibleRange);
          }, 0);
        } else {
          setTimeout(() => {
            this.scrollToRight();
          }, 0);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  handleTimeframeSelect = (timeframe: string) => {
    const timeframeEnum = timeframe as TimeframeEnum;
    const currentVisibleRange = this.getVisibleTimeRange();
    this.setState({
      activeTimeframe: timeframeEnum,
      timeframe: timeframeEnum,
      savedVisibleRange: currentVisibleRange,
      isTimeframeModalOpen: false
    }, () => {
      setTimeout(() => {
        this.updateWithAggregatedAndExtendedData();
        this.setOptimalBarSpacing();
        if (this.state.savedVisibleRange) {
          setTimeout(() => {
            this.setVisibleTimeRange(this.state.savedVisibleRange);
          }, 200);
        } else {
          this.scrollToRealData();
        }
      }, 0);
    });
  };

  private setOptimalBarSpacing = () => {
    if (!this.chart) return;
    const timeScale = this.chart.timeScale();
    const optimalBarSpacing: { [key: string]: number } = {
      [TimeframeEnum.ONE_SECOND]: 1,
      [TimeframeEnum.FIVE_SECONDS]: 2,
      [TimeframeEnum.FIFTEEN_SECONDS]: 3,
      [TimeframeEnum.THIRTY_SECONDS]: 4,
      [TimeframeEnum.ONE_MINUTE]: 5,
      [TimeframeEnum.THREE_MINUTES]: 6,
      [TimeframeEnum.FIVE_MINUTES]: 7,
      [TimeframeEnum.FIFTEEN_MINUTES]: 8,
      [TimeframeEnum.THIRTY_MINUTES]: 9,
      [TimeframeEnum.FORTY_FIVE_MINUTES]: 10,
      [TimeframeEnum.ONE_HOUR]: 12,
      [TimeframeEnum.TWO_HOURS]: 14,
      [TimeframeEnum.THREE_HOURS]: 16,
      [TimeframeEnum.FOUR_HOURS]: 18,
      [TimeframeEnum.SIX_HOURS]: 20,
      [TimeframeEnum.EIGHT_HOURS]: 22,
      [TimeframeEnum.TWELVE_HOURS]: 24,
      [TimeframeEnum.ONE_DAY]: 15,
      [TimeframeEnum.THREE_DAYS]: 20,
      [TimeframeEnum.ONE_WEEK]: 25,
      [TimeframeEnum.TWO_WEEKS]: 30,
      [TimeframeEnum.ONE_MONTH]: 35,
      [TimeframeEnum.THREE_MONTHS]: 40,
      [TimeframeEnum.SIX_MONTHS]: 45
    };
    const spacing = optimalBarSpacing[this.state.activeTimeframe] || 10;
    try {
      timeScale.applyOptions({
        barSpacing: spacing,
        minBarSpacing: 0.5,
        maxBarSpacing: 50
      });
    } catch (error) {
      console.error(error);
    }
  };

  private getRealDataRange(): {
    firstIndex: number;
    lastIndex: number;
    realDataCount: number;
    virtualBeforeCount: number;
    virtualAfterCount: number;
  } {
    const currentData = this.currentSeries?.series?.data || [];
    let firstIndex = -1;
    let lastIndex = -1;
    let realDataCount = 0;
    let virtualBeforeCount = 0;
    let virtualAfterCount = 0;
    for (let i = 0; i < currentData.length; i++) {
      const dataPoint = currentData[i];
      const isRealData = !dataPoint.isVirtual && dataPoint.volume !== -1 && dataPoint.volume !== 0;
      if (isRealData) {
        firstIndex = i;
        virtualBeforeCount = i;
        break;
      }
    }
    for (let i = currentData.length - 1; i >= 0; i--) {
      const dataPoint = currentData[i];
      const isRealData = !dataPoint.isVirtual && dataPoint.volume !== -1 && dataPoint.volume !== 0;

      if (isRealData) {
        lastIndex = i;
        virtualAfterCount = currentData.length - 1 - i;
        break;
      }
    }
    if (firstIndex !== -1 && lastIndex !== -1) {
      for (let i = firstIndex; i <= lastIndex; i++) {
        const dataPoint = currentData[i];
        const isRealData = !dataPoint.isVirtual && dataPoint.volume !== -1 && dataPoint.volume !== 0;
        if (isRealData) {
          realDataCount++;
        }
      }
    }
    return { firstIndex, lastIndex, realDataCount, virtualBeforeCount, virtualAfterCount };
  }

  scrollToRealData = () => {
    this.scrollToStablePosition();
  };


  scrollToRight = () => {
    if (!this.chart) return;
    try {
      const timeScale = this.chart.timeScale();
      const currentData = this.currentSeries?.series?.data || [];
      if (currentData.length === 0) return;
      const { lastIndex, virtualAfterCount } = this.getRealDataRange();
      if (lastIndex === -1) {
        timeScale.scrollToRealTime();
        return;
      }
      const visibleBars = 100;
      const fromIndex = Math.max(0, lastIndex - visibleBars + 1);
      const toIndex = Math.min(currentData.length - 1, lastIndex + Math.min(10, virtualAfterCount));
      timeScale.setVisibleLogicalRange({
        from: fromIndex,
        to: toIndex
      });
    } catch (error) {
      console.error(error);
    }
  };

  componentDidUpdate(prevProps: CandleViewProps, prevState: CandleViewState) {
    if (prevProps.theme !== this.props.theme) {
      const theme = this.props.theme || 'dark';
      this.setState({
        currentTheme: this.getThemeConfig(theme),
      });
      this.updateChartTheme();
      return;
    }

    const shouldUpdateData =
      prevState.timeframe !== this.state.timeframe ||
      prevState.timezone !== this.state.timezone ||
      prevProps.data !== this.props.data ||
      prevState.activeChartType !== this.state.activeChartType;

    if (shouldUpdateData && this.currentSeries && this.currentSeries.series) {
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
      }
      this.updateTimeout = setTimeout(() => {
        if (prevState.activeChartType !== this.state.activeChartType) {
          this.switchChartType(this.state.activeChartType);
          setTimeout(() => {
            this.updateWithAggregatedAndExtendedData();
          }, 50);
        } else {
          this.updateWithAggregatedAndExtendedData();
        }
      }, 10);
    }
  }


  private processAllTimeConfigurations = (): {
    processedData: ICandleViewDataPoint[];
    timeConfig: any;
  } => {
    const { data } = this.props;
    const {
      timeframe = TimeframeEnum.ONE_DAY,
      timezone = TimezoneEnum.SHANGHAI,
    } = this.state;

    return processAllTimeConfigurations(data || [], {
      timeframe: timeframe,
      timezone: timezone,
    });
  };

  private updateWithAggregatedAndExtendedData = () => {
    const { data } = this.props;
    if (!data || data.length === 0 || !this.currentSeries || !this.currentSeries.series) return;
    if (this.isUpdatingData) return;
    this.isUpdatingData = true;
    try {
      const currentVisibleRange = this.getVisibleTimeRange();
      const { processedData: aggregatedData } = this.processAllTimeConfigurations();
      const extendedData = generateExtendedVirtualData(
        aggregatedData,
        100,
        100,
        this.state.activeTimeframe
      );

      if (extendedData.length > 0) {
        const formattedData = formatDataForSeries(extendedData, this.state.activeChartType);
        this.currentSeries.series.setData(formattedData);
        setTimeout(() => {
          this.setOptimalBarSpacing();
          if (currentVisibleRange) {
            this.setVisibleTimeRange(currentVisibleRange);
          } else {
            this.scrollToRealData();
          }
          this.isUpdatingData = false;
        }, 50);
      } else {
        this.isUpdatingData = false;
      }
    } catch (error) {
      console.error(error);
      this.isUpdatingData = false;
    }
  };



  private findLastRealDataIndex = (): number => {
    const currentData = this.currentSeries?.series?.data || [];
    for (let i = currentData.length - 1; i >= 0; i--) {
      const dataPoint = currentData[i];
      const isRealData = !dataPoint.isVirtual && dataPoint.volume !== -1 && dataPoint.volume !== 0;
      if (isRealData) {
        return i;
      }
    }
    return -1;
  };

  componentWillUnmount() {
    const currentVisibleRange = this.getVisibleTimeRange();
    if (currentVisibleRange) {
      try {
        localStorage.setItem('candleView_visibleRange', JSON.stringify(currentVisibleRange));
      } catch (e) {
        console.error(e);
      }
    }
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    if (this.resizeObserver && this.chartContainerRef.current) {
      this.resizeObserver.unobserve(this.chartContainerRef.current);
      this.resizeObserver.disconnect();
    }
    if (this.chart) {
      this.chart.remove();
    }
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
    }
    document.removeEventListener('mousedown', this.handleClickOutside, true);
  }

  // ========================== handle sub chart indicator start ==========================
  handleSelectedSubChartIndicator = (indicators: SubChartIndicatorType[]) => {
    this.setState({
      selectedSubChartIndicators: indicators,
      isSubChartModalOpen: false
    });
  };


  handleRemoveSubChartIndicator = (indicatorId: string) => {
    this.setState((prevState: CandleViewState) => {
      const newSelectedSubChartIndicators = prevState.selectedSubChartIndicators.filter(
        id => id !== indicatorId
      );
      return {
        selectedSubChartIndicators: newSelectedSubChartIndicators
      };
    });
  };
  // ========================== handle sub chart indicator end ==========================

  handleCameraClick = () => {
    captureWithCanvas(this);
  };

  serializeDrawings = (): string => {
    if (this.drawingLayerRef.current) {
      return this.drawingLayerRef.current.serializeDrawings();
    }
    return '[]';
  };

  handleSubChartClick = () => {
    this.setState({ isSubChartModalOpen: !this.state.isSubChartModalOpen });
  };

  deserializeDrawings = (data: string) => {
    if (this.drawingLayerRef.current) {
      this.drawingLayerRef.current.deserializeDrawings(data);
    }
  };

  clearAllDrawings = () => {
    if (this.drawingLayerRef.current) {
      this.drawingLayerRef.current.clearAllDrawings();
    }
  };

  initializeChart() {
    if (!this.chartRef.current || !this.chartContainerRef.current) {
      return;
    }
    const container = this.chartContainerRef.current;
    const { currentTheme } = this.state;
    const { data } = this.props;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    if (containerWidth === 0 || containerHeight === 0) {
      return;
    }
    try {
      if (this.chart) {
        this.chart.remove();
        this.currentSeries = null;
      }
      this.chartManager = new ChartManager(
        this.chartRef.current,
        containerWidth,
        containerHeight,
        currentTheme
      );
      this.chart = this.chartManager.getChart();
      this.setupTimeScaleListener();
      if (data && data.length > 0) {
        const initialChartType = this.state.activeChartType;
        const chartTypeConfig = chartTypes.find(type => type.id === initialChartType);
        if (chartTypeConfig) {
          this.currentSeries = chartTypeConfig.createSeries(this.chart, currentTheme);
          const { processedData: aggregatedData } = this.processAllTimeConfigurations();
          const extendedData = generateExtendedVirtualData(
            aggregatedData,
            100,
            100,
            this.state.activeTimeframe
          );
          const formattedData = formatDataForSeries(extendedData, initialChartType);
          this.currentSeries.series.setData(formattedData);
          requestAnimationFrame(() => {
            this.setOptimalBarSpacing();
            setTimeout(() => {
              this.scrollToStablePosition();
            }, 150);
          });
        }
      }
      this.setupResizeObserver();
      this.setState({ chartInitialized: true });
    } catch (error) {
      console.error(error);
      this.setState({ chartInitialized: false });
    }
  }

  // =========================== Main Chart timeline processing Start ===========================
  private setupTimeScaleListener = () => {
    if (!this.chart) return;
    this.chart.timeScale().subscribeVisibleTimeRangeChange((visibleRange: { from: number; to: number }) => {
      this.updateChartVisibleRange(visibleRange);
    });
  };

  public updateChartVisibleRange = (visibleRange: { from: number; to: number } | null) => {
    this.setState({
      adxChartVisibleRange: visibleRange,
      atrChartVisibleRange: visibleRange,
      bbwidthChartVisibleRange: visibleRange,
      cciChartVisibleRange: visibleRange,
      kdjChartVisibleRange: visibleRange,
      macdChartVisibleRange: visibleRange,
      obvhartVisibleRange: visibleRange,
      rsiChartVisibleRange: visibleRange,
      sarChartVisibleRange: visibleRange,
      volumeChartVisibleRange: visibleRange,
    });
  };
  // =========================== Main Chart timeline processing End ===========================

  private scrollToStablePosition = () => {
    if (!this.chart) return;

    try {
      const timeScale = this.chart.timeScale();
      const currentData = this.currentSeries?.series?.data || [];

      if (currentData.length === 0) {
        timeScale.fitContent();
        return;
      }

      if (this.state.savedVisibleRange) {
        this.setVisibleTimeRange(this.state.savedVisibleRange);
        return;
      }

      const visibleBars = 50;
      timeScale.setVisibleLogicalRange({
        from: Math.max(0, currentData.length - visibleBars),
        to: currentData.length - 1
      });
    } catch (error) {
      console.error(error);
      if (this.chart) {
        this.chart.timeScale().fitContent();
      }
    }
  };

  setupResizeObserver() {
    if (!this.chartContainerRef.current) return;
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === this.chartContainerRef.current && this.chart) {
          const { width, height } = entry.contentRect;
          const validWidth = Math.max(width, 100);
          const validHeight = Math.max(height, 100);
          requestAnimationFrame(() => {
            try {
              if (this.chart) {
                const timeScale = this.chart.timeScale();
                const currentVisibleRange = timeScale.getVisibleRange();
                this.chart.applyOptions({
                  width: validWidth,
                  height: validHeight,
                });
                if (currentVisibleRange) {
                  setTimeout(() => {
                    try {
                      timeScale.setVisibleRange(currentVisibleRange);
                    } catch (error) {
                      console.error(error);
                    }
                  }, 10);
                }
              }
            } catch (error) {
              console.error(error);
            }
          });
        }
      }
    });
    this.resizeObserver.observe(this.chartContainerRef.current);
  }

  updateChartTheme() {
    const { currentTheme } = this.state;
    if (this.chart) {
      try {
        this.chart.applyOptions({
          layout: currentTheme.layout,
          grid: {
            vertLines: {
              color: currentTheme.grid.vertLines.color + '30',
              style: 1,
              visible: true,
            },
            horzLines: {
              color: currentTheme.grid.horzLines.color + '30',
              style: 1,
              visible: true,
            },
          },
        });
        this.chart.applyOptions({
          timeScale: {
            borderColor: currentTheme.grid.vertLines.color,
          },
          rightPriceScale: {
            borderColor: currentTheme.grid.horzLines.color,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
    if (this.currentSeries) {
      updateSeriesTheme(this.currentSeries, currentTheme);
    }
  }

  getThemeConfig(theme: 'dark' | 'light'): ThemeConfig {
    return theme === 'light' ? Light : Dark;
  }

  getI18nConfig(i18n: 'en' | 'zh-cn'): I18n {
    return i18n === 'en' ? EN : zhCN;
  }

  handleEmojiSelect = (emoji: string) => {
    this.setState({ selectedEmoji: emoji });
  };

  handleThemeToggle = () => {
    this.setState(prevState => {
      const newIsDarkTheme = !prevState.isDarkTheme;
      const newTheme = newIsDarkTheme ? 'dark' : 'light';
      return {
        isDarkTheme: newIsDarkTheme,
        currentTheme: this.getThemeConfig(newTheme),
      };
    }, () => {
      this.updateChartTheme();
    });
  };

  handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    const shouldCloseTimeFormatModal =
      this.state.isTimeFormatModalOpen &&
      !target.closest('.time-format-button') &&
      !target.closest('[data-timeformat-modal]');

    const shouldCloseCloseTimeModal =
      this.state.isCloseTimeModalOpen &&
      !target.closest('.close-time-button') &&
      !target.closest('[data-close-time-modal]');

    const shouldCloseTradingDayModal =
      this.state.isTradingDayModalOpen &&
      !target.closest('.trading-day-button') &&
      !target.closest('[data-trading-day-modal]');
    const shouldCloseTimezoneModal =
      this.state.isTimezoneModalOpen &&
      !target.closest('.timezone-button') &&
      !target.closest('[data-timezone-modal]');
    const shouldCloseTimeframeModal =
      this.state.isTimeframeModalOpen &&
      !target.closest('.timeframe-button') &&
      !target.closest('[data-timeframe-modal]');
    const shouldCloseIndicatorModal =
      this.state.isIndicatorModalOpen &&
      !target.closest('.indicator-button') &&
      !target.closest('[data-indicator-modal]');
    const shouldCloseTradeModal =
      this.state.isTradeModalOpen &&
      !target.closest('.trade-button') &&
      !target.closest('[data-trade-modal]');
    const shouldCloseChartTypeModal =
      this.state.isChartTypeModalOpen &&
      !target.closest('.chart-type-button') &&
      !target.closest('[data-chart-type-modal]');
    const shouldCloseSubChartModal =
      this.state.isSubChartModalOpen &&
      !target.closest('.subchart-button') &&
      !target.closest('[data-subchart-modal]');
    if (shouldCloseSubChartModal) {
      this.setState({ isSubChartModalOpen: false });
    }
    if (shouldCloseTimeframeModal) {
      this.setState({ isTimeframeModalOpen: false });
    }
    if (shouldCloseIndicatorModal) {
      this.setState({ isIndicatorModalOpen: false });
    }
    if (shouldCloseTradeModal) {
      this.setState({ isTradeModalOpen: false });
    }
    if (shouldCloseChartTypeModal) {
      this.setState({ isChartTypeModalOpen: false });
    }
    if (shouldCloseTimezoneModal) {
      this.setState({ isTimezoneModalOpen: false });
    }
    if (shouldCloseTimeFormatModal) {
      this.setState({ isTimeFormatModalOpen: false });
    }
    if (shouldCloseCloseTimeModal) {
      this.setState({ isCloseTimeModalOpen: false });
    }
    if (shouldCloseTradingDayModal) {
      this.setState({ isTradingDayModalOpen: false });
    }
  };

  handleToolSelect = (tool: string) => {
    this.setState({ activeTool: tool });
  };

  handleChartTypeSelect = (chartType: string) => {
    this.setState({
      activeChartType: chartType,
      isChartTypeModalOpen: false
    });
  };

  handleCloseChartTypeModal = () => {
    this.setState({ isChartTypeModalOpen: false });
  };

  handleCloseDrawing = () => {
    this.setState({ activeTool: null });
  };

  handleTimeframeClick = () => {
    this.setState({ isTimeframeModalOpen: !this.state.isTimeframeModalOpen });
  };

  handleChartTypeClick = () => {
    this.setState({ isChartTypeModalOpen: !this.state.isChartTypeModalOpen });
  };

  handleIndicatorClick = () => {
    this.setState({ isIndicatorModalOpen: !this.state.isIndicatorModalOpen });
  };

  handleTradeClick = () => {
    this.setState({ isTradeModalOpen: !this.state.isTradeModalOpen });
  };

  handleSelectedMainChartIndicator = (selectedMainChartIndicator: MainChartIndicatorInfo) => {
    this.setState({
      selectedMainChartIndicator: selectedMainChartIndicator,
      isIndicatorModalOpen: false
    });
  };

  handleCloseIndicatorModal = () => {
    this.setState({ isIndicatorModalOpen: false });
  };

  handleCloseTimeframeModal = () => {
    this.setState({ isTimeframeModalOpen: false });
  };

  handleCloseTradeModal = () => {
    this.setState({ isTradeModalOpen: false });
  };

  handleTradeAction = (action: string) => {
    this.setState({ isTradeModalOpen: false });
  };

  handleFullscreen = () => {
    const container = this.chartContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  handleCompareClick = () => {
  };

  handleReplayClick = () => {
    this.startRealTimeDataSimulation(100);
  };

  addDataPoint = (newDataPoint: ICandleViewDataPoint) => {
    if (!this.currentSeries || !this.currentSeries.series) {
      return;
    }
    try {
      const visibleRange = this.getVisibleTimeRange();
      const formattedData = formatDataForSeries([newDataPoint], this.state.activeChartType);
      this.currentSeries.series.update(formattedData[0]);
      if (visibleRange) {
        setTimeout(() => {
          this.setVisibleTimeRange(visibleRange);
        }, 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  addMultipleDataPoints = (newDataPoints: ICandleViewDataPoint[]) => {
    if (!this.currentSeries || !this.currentSeries.series) {
      return;
    }
    try {
      const visibleRange = this.getVisibleTimeRange();
      const formattedData = formatDataForSeries(newDataPoints, this.state.activeChartType);
      const currentData = this.currentSeries.series.data || [];
      const updatedData = [...currentData, ...formattedData];
      this.currentSeries.series.setData(updatedData);
      if (visibleRange) {
        setTimeout(() => {
          this.setVisibleTimeRange(visibleRange);
        }, 0);
      } else {
        this.chart.timeScale().fitContent();
      }
    } catch (error) {
      console.error(error);
    }
  };

  startRealTimeDataSimulation = (interval: number = 1000) => {
    if (!this.currentSeries || !this.currentSeries.series) {
      return;
    }
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
    }
    const currentData = this.currentSeries.series.data || [];
    let lastDataPoint: ICandleViewDataPoint;
    if (currentData.length > 0) {
      const lastPoint = currentData[currentData.length - 1];
      lastDataPoint = {
        time: lastPoint.time,
        open: lastPoint.open,
        high: lastPoint.high,
        low: lastPoint.low,
        close: lastPoint.close,
        volume: lastPoint.volume || 0
      };
    } else {
      const now = Math.floor(Date.now() / 1000);
      lastDataPoint = {
        time: now,
        open: 115,
        high: 120,
        low: 110,
        close: 115,
        volume: 1000
      };
    }
    this.realTimeInterval = setInterval(() => {
      try {
        const newTime = lastDataPoint.time + 86400;
        const basePrice = lastDataPoint.close;
        const priceChange = (Math.random() * 10 - 5);
        const newClose = Number((basePrice + priceChange).toFixed(2));
        const newOpen = lastDataPoint.close;
        const newHigh = Number((Math.max(newOpen, newClose) + Math.random() * 3).toFixed(2));
        const newLow = Number((Math.min(newOpen, newClose) - Math.random() * 3).toFixed(2));
        const newVolume = Math.floor(lastDataPoint.volume * (0.8 + Math.random() * 0.4));
        const newDataPoint: ICandleViewDataPoint = {
          time: newTime,
          open: Number(newOpen.toFixed(2)),
          high: newHigh,
          low: newLow,
          close: Number(newClose.toFixed(2)),
          volume: newVolume
        };
        this.addDataPoint(newDataPoint);
        lastDataPoint = newDataPoint;
      } catch (error) {
        console.error(error);
      }
    }, interval);
  };

  stopRealTimeDataSimulation = () => {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
      this.realTimeInterval = null;
    }
  };

  switchChartType = (chartType: string) => {
    if (!this.chart || !this.props.data || this.isUpdatingData) {
      return;
    }
    try {
      this.isUpdatingData = true;
      const currentVisibleRange = this.getVisibleTimeRange();
      const { processedData: aggregatedData } = this.processAllTimeConfigurations();
      const extendedData = generateExtendedVirtualData(
        aggregatedData,
        500,
        500,
        this.state.activeTimeframe
      );
      const formattedData = formatDataForSeries(extendedData, chartType);
      this.currentSeries = switchChartType(
        this.chart,
        this.currentSeries,
        chartType,
        formattedData,
        this.state.currentTheme
      );
      setTimeout(() => {
        this.setOptimalBarSpacing();
        if (currentVisibleRange) {
          this.setVisibleTimeRange(currentVisibleRange);
        } else {
          this.scrollToRealData();
        }
        this.isUpdatingData = false;
      }, 10);
    } catch (error) {
      console.error(error);
      this.isUpdatingData = false;
    }
  };

  renderTradeModal() {
    const { currentTheme, isTradeModalOpen } = this.state;
    if (!isTradeModalOpen) return null;
    const tradeActions = [
      { id: 'market-buy', label: 'Market Buy', color: '#22c55e' },
      { id: 'market-sell', label: 'Market Sell', color: '#ef4444' },
      { id: 'limit-buy', label: 'Limit Buy', color: '#22c55e' },
      { id: 'limit-sell', label: 'Limit Sell', color: '#ef4444' },
      { id: 'stop-limit', label: 'Take Profit and Stop Loss', color: '#f59e0b' },
    ];
    return (
      <div
        ref={this.tradeModalRef}
        style={{
          position: 'absolute',
          top: '60px',
          left: '60px',
          zIndex: 1000,
          background: currentTheme.toolbar.background,
          border: `1px solid ${currentTheme.toolbar.border}`,
          borderRadius: '6px',
          padding: '12px',
          minWidth: '150px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <h3 style={{
            margin: 0,
            color: currentTheme.layout.textColor,
            fontSize: '13px',
            fontWeight: '600',
          }}>
            Fast Trade
          </h3>
          <button
            onClick={this.handleCloseTradeModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentTheme.layout.textColor,
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '3px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = currentTheme.toolbar.button.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ×
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tradeActions.map(action => (
            <button
              key={action.id}
              onClick={() => this.handleTradeAction(action.id)}
              style={{
                background: 'transparent',
                border: `1px solid ${currentTheme.toolbar.border}`,
                padding: '6px 8px',
                borderRadius: '4px',
                color: action.color,
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  private subChartContainerRef = React.createRef<HTMLDivElement>();
  handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.startY = e.clientY;
    this.startHeight = this.state.subChartPanelHeight;
    this.setState({ isResizing: true });
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!this.state.isResizing) return;
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaY = this.startY - moveEvent.clientY;
      const containerHeight = this.chartContainerRef.current?.parentElement?.clientHeight || 500;
      const maxHeight = containerHeight * 0.8;
      const minHeight = 50;
      const newHeight = Math.max(minHeight, Math.min(maxHeight, this.startHeight + deltaY));
      if (this.subChartContainerRef.current) {
        this.subChartContainerRef.current.style.height = `${newHeight}px`;
      }
      this.startY = moveEvent.clientY;
      this.startHeight = newHeight;
      const { height = 500 } = this.props;
      const totalHeight = typeof height === 'string' ? parseInt(height) : height;
      const showInfoLayer = newHeight < totalHeight * 0.7;
      this.setState({ showInfoLayer });
    };
    const onMouseUp = (upEvent: MouseEvent) => {
      upEvent.preventDefault();
      upEvent.stopPropagation();
      const finalHeight = this.subChartContainerRef.current
        ? parseInt(this.subChartContainerRef.current.style.height)
        : this.state.subChartPanelHeight;
      const { height = 500 } = this.props;
      const totalHeight = typeof height === 'string' ? parseInt(height) : height;
      const finalShowInfoLayer = finalHeight < totalHeight * 0.7;
      this.setState({
        subChartPanelHeight: finalHeight,
        isResizing: false,
        showInfoLayer: finalShowInfoLayer
      });
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp, { once: true });
  };

  private getAggregatedAndExtendedData = (): ICandleViewDataPoint[] => {
    const { data } = this.props;
    if (!data || data.length === 0) return [];
    const { processedData: aggregatedData } = this.processAllTimeConfigurations();
    const extendedData = generateExtendedVirtualData(
      aggregatedData,
      100,
      100,
      this.state.activeTimeframe
    );
    return extendedData;
  };

  render() {
    const { currentTheme, subChartPanelHeight, isResizing } = this.state;
    const { height = 500, showToolbar = true } = this.props;

    const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: ${currentTheme.toolbar.background};
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: ${currentTheme.toolbar.border};
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: ${currentTheme.toolbar.button.hover};
    }
    .modal-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .modal-scrollbar::-webkit-scrollbar-track {
      background: ${currentTheme.toolbar.background};
      border-radius: 4px;
    }
    .modal-scrollbar::-webkit-scrollbar-thumb {
      background: ${currentTheme.toolbar.button.color}40;
      border-radius: 4px;
    }
    .modal-scrollbar::-webkit-scrollbar-thumb:hover {
      background: ${currentTheme.toolbar.button.color}60;
    }
  `;

    const hasOpenModal = this.state.isTimeframeModalOpen ||
      this.state.isIndicatorModalOpen ||
      this.state.isTradeModalOpen ||
      this.state.isChartTypeModalOpen ||
      this.state.isSubChartModalOpen ||
      this.state.isTimezoneModalOpen ||
      this.state.isTimeFormatModalOpen ||
      this.state.isCloseTimeModalOpen ||
      this.state.isTradingDayModalOpen;

    return (
      <div
        ref={this.candleViewContainerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: height,
          background: currentTheme.layout.background.color,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          userSelect: 'none'
        }}
        candleview-container="true"
      >
        <style>{scrollbarStyles}</style>
        {hasOpenModal && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
              background: 'transparent',
            }}
            onClick={this.handleCloseModals}
          />
        )}
        <CandleViewTopPanel
          currentTheme={currentTheme}
          activeTimeframe={this.state.activeTimeframe}
          activeChartType={this.state.activeChartType}
          isDarkTheme={this.state.isDarkTheme}
          isTimeframeModalOpen={this.state.isTimeframeModalOpen}
          isIndicatorModalOpen={this.state.isIndicatorModalOpen}
          isChartTypeModalOpen={this.state.isChartTypeModalOpen}
          isSubChartModalOpen={this.state.isSubChartModalOpen}
          isTimezoneModalOpen={this.state.isTimezoneModalOpen}
          onThemeToggle={this.handleThemeToggle}
          onTimeframeClick={this.handleTimeframeClick}
          onIndicatorClick={this.handleIndicatorClick}
          onChartTypeClick={this.handleChartTypeClick}
          onCompareClick={this.handleCompareClick}
          onFullscreenClick={this.handleFullscreen}
          onReplayClick={this.handleReplayClick}
          onTimezoneClick={this.handleTimezoneClick}
          onTimeframeSelect={this.handleTimeframeSelect}
          onChartTypeSelect={this.handleChartTypeSelect}
          onTimezoneSelect={this.handleTimezoneSelect}
          handleSelectedSubChartIndicator={this.handleSelectedSubChartIndicator}
          handleSelectedMainChartIndicator={this.handleSelectedMainChartIndicator}
          showToolbar={showToolbar}
          onCloseModals={this.handleCloseModals}
          onSubChartClick={this.handleSubChartClick}
          selectedSubChartIndicators={this.state.selectedSubChartIndicators}
          onCameraClick={this.handleCameraClick}
          i18n={this.state.currentI18N}
          currentTimezone={this.state.currentTimezone}
          isTimeFormatModalOpen={this.state.isTimeFormatModalOpen}
          isCloseTimeModalOpen={this.state.isCloseTimeModalOpen}
          isTradingDayModalOpen={this.state.isTradingDayModalOpen}
          onTimeFormatClick={this.handleTimeFormatClick}
          onCloseTimeClick={this.handleCloseTimeClick}
          onTradingDayClick={this.handleTradingDayClick}
          currentCloseTime={this.state.currentCloseTime}
          currentTradingDayType={this.state.currentTradingDayType}
        />
        <div style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          position: 'relative',
        }}>
          <CandleViewLeftPanel
            currentTheme={currentTheme}
            activeTool={this.state.activeTool}
            onToolSelect={this.handleToolSelect}
            onTradeClick={this.handleTradeClick}
            showToolbar={showToolbar}
            drawingLayerRef={this.drawingLayerRef}
            selectedEmoji={this.state.selectedEmoji}
            onEmojiSelect={this.handleEmojiSelect}
            i18n={this.state.currentI18N}
            candleViewContainerRef={this.candleViewContainerRef}
          />
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            position: 'relative',
          }}>
            <div
              ref={this.chartContainerRef}
              style={{
                flex: 1,
                position: 'relative',
                minHeight: this.state.selectedSubChartIndicators.length > 0 ? '50px' : '0',
              }}
            >
              <div
                ref={this.chartRef}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
              {this.state.chartInitialized && (
                <ChartLayer
                  ref={this.drawingLayerRef}
                  chart={this.chart}
                  chartSeries={this.currentSeries}
                  currentTheme={currentTheme}
                  activeTool={this.state.activeTool}
                  onCloseDrawing={this.handleCloseDrawing}
                  onTextClick={this.handleToolSelect}
                  onEmojiClick={this.handleToolSelect}
                  selectedEmoji={this.state.selectedEmoji}
                  chartData={this.getAggregatedAndExtendedData()}
                  title={this.props.title}
                  selectedMainChartIndicator={this.state.selectedMainChartIndicator}
                  showInfoLayer={this.state.showInfoLayer}
                  i18n={this.state.currentI18N}
                  topMark={this.props.topMark}
                  bottomMark={this.props.bottomMark}
                />
              )}
            </div>
            {this.state.selectedSubChartIndicators.length > 0 && (
              <div
                onMouseDown={this.handleResizeMouseDown}
                style={{
                  height: '6px',
                  background: isResizing
                    ? currentTheme.toolbar.button.hover
                    : currentTheme.toolbar.border,
                  cursor: 'row-resize',
                  position: 'relative',
                  zIndex: 10,
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  if (!isResizing) {
                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isResizing) {
                    e.currentTarget.style.background = currentTheme.toolbar.border;
                  }
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '3px',
                    background: currentTheme.layout.textColor,
                    opacity: 0.5,
                    borderRadius: '2px',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            )}
            <div style={{
              background: currentTheme.toolbar.background,
              borderTop: `1px solid ${currentTheme.toolbar.border}`,
            }}>
              {this.state.selectedSubChartIndicators.length > 0 && (
                <div
                  ref={this.subChartContainerRef}
                  style={{
                    height: `${this.state.subChartPanelHeight}px`,
                    maxHeight: '100%',
                    overflow: 'hidden',
                    background: currentTheme.toolbar.background,
                    transition: isResizing ? 'none' : 'height 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <SubChartTechnicalIndicatorsPanel
                    currentTheme={currentTheme}
                    chartData={this.getAggregatedAndExtendedData()}
                    selectedSubChartIndicators={this.state.selectedSubChartIndicators}
                    height={this.state.subChartPanelHeight}
                    handleRemoveSubChartIndicator={this.handleRemoveSubChartIndicator}
                    candleViewContainerRef={this.candleViewContainerRef}
                    rsiChartVisibleRange={this.state.rsiChartVisibleRange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {this.renderTradeModal()}
      </div>
    );
  }

}
