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
import { ChartLayer } from './ChartLayer';
import { ChartManager } from './ChartLayer/ChartManager';
import CandleViewLeftPanel from './CandleViewLeftPanel';
import { MainChartIndicatorInfo } from './Indicators/MainChart/MainChartIndicatorInfo';
import { SubChartTechnicalIndicatorsPanel } from './Indicators/SubChartTechnicalIndicatorsPanel';
import { EN, I18n, zhCN } from './I18n';
import { ChartType, ICandleViewDataPoint, MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from './types';
import { captureWithCanvas } from './Camera';
import { IStaticMarkData } from './MarkManager/StaticMarkManager';
import { mapTimeframe, mapTimezone } from './tools';
import { buildDefaultDataProcessingConfig, DataManager } from './DataManager';
import { ViewportManager } from './ViewportManager';
import { ChartEventManager } from './ChartLayer/ChartEventManager';

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
  chartInitialized: boolean;
  isDarkTheme: boolean;
  selectedEmoji: string;
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
  // =============== chart coinfig start ===============
  activeMainChartType: MainChartType;
  selectedSubChartIndicators: SubChartIndicatorType[];
  selectedMainChartIndicator: MainChartIndicatorInfo | null;
  // =============== chart coinfig end ===============
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
  stochasticChartVisibleRange: { from: number; to: number } | null;
  // prepared data
  preparedData: ICandleViewDataPoint[];
  // display data
  displayData: ICandleViewDataPoint[];
  virtualDataBeforeCount: number;
  virtualDataAfterCount: number;
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
  private viewportManager: ViewportManager | null = null;
  private chartEventManager: ChartEventManager | null = null;

  constructor(props: CandleViewProps) {
    super(props);
    this.state = {
      isIndicatorModalOpen: false,
      isTimeframeModalOpen: false,
      isTradeModalOpen: false,
      isChartTypeModalOpen: false,
      isSubChartModalOpen: false,
      activeTool: null,
      activeMainChartType: MainChartType.Candle,
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
      stochasticChartVisibleRange: null,
      virtualDataBeforeCount: 500,
      virtualDataAfterCount: 500,
      // display data
      displayData: [],
      // prepare data
      preparedData: [],
    };
    this.chartEventManager = new ChartEventManager();
  }

  // ======================================== life cycle start ========================================
  componentDidMount() {
    if (this.chart) return;
    // refresh display data
    this.refreshDisplayData();
    setTimeout(() => {
      // init display data
      this.initializeChart();
    }, 100);
    document.addEventListener('mousedown', this.handleClickOutside, true);
  }

  componentDidUpdate(prevProps: CandleViewProps, prevState: CandleViewState) {
    if (prevProps.theme !== this.props.theme) {
      const theme = this.props.theme || 'dark';
      this.setState({
        currentTheme: this.getThemeConfig(theme),
      });
      this.updateChartTheme();
      return;
    }
    if (prevState.mainChartVisibleRange !== this.state.mainChartVisibleRange) {
      this.syncMainChartVisibleRange();
    }
    const shouldUpdateData =
      prevState.timeframe !== this.state.timeframe ||
      prevState.timezone !== this.state.timezone ||
      prevProps.data !== this.props.data ||
      prevState.activeMainChartType !== this.state.activeMainChartType;
    if (shouldUpdateData && this.currentSeries && this.currentSeries.series) {
      // refresh display data
      this.refreshDisplayData();
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
      }
      this.updateTimeout = setTimeout(() => {
        if (prevState.activeMainChartType !== this.state.activeMainChartType) {
          this.switchChartType(this.state.activeMainChartType);
          setTimeout(() => {
            this.updateData();
          }, 50);
        } else {
          this.updateData();
        }
      }, 10);
    }
  }

  componentWillUnmount() {
    const currentVisibleRange = this.viewportManager?.getVisibleTimeRange();
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
  // ======================================== life cycle end ========================================

  // init chart
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
      // init viewport manager
      this.viewportManager = new ViewportManager(this.chart, this.currentSeries);
      // register visible time range change event
      this.chartEventManager?.registerVisibleTimeRangeChangeEvent(this.chart, (event: { from: number, to: number } | null) => {
        this.handleVisibleTimeRangeChange(event);
      });
      if (data && data.length > 0) {
        const initialChartType = this.state.activeMainChartType;
        const chartTypeConfig = chartTypes.find(t => t.type === initialChartType);
        if (chartTypeConfig) {
          this.currentSeries = chartTypeConfig.createSeries(this.chart, currentTheme);
          // init process data
          const formattedData = DataManager.handleChartDisplayData(this.state.displayData, this.state.activeMainChartType);
          this.currentSeries.series.setData(formattedData);
          requestAnimationFrame(() => {
            setTimeout(() => {
              this.viewportManager?.positionChart(this.state.activeTimeframe);
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

  handleTimeframeSelect = (timeframe: string) => {
    const timeframeEnum = timeframe as TimeframeEnum;
    this.setState({
      activeTimeframe: timeframeEnum,
      timeframe: timeframeEnum,
      isTimeframeModalOpen: false,
    }, () => {
      // refresh display data
      this.refreshDisplayData();
      this.viewportManager?.positionChart(this.state.activeTimeframe);
      setTimeout(() => {
        this.updateData();
      }, 0);
    });
  };

  private updateData = () => {
    const { data } = this.props;
    if (!data || data.length === 0 || !this.currentSeries || !this.currentSeries.series) return;
    if (this.isUpdatingData) return;
    this.isUpdatingData = true;
    try {
      this.currentSeries.series.setData(DataManager.handleChartDisplayData(this.state.displayData, this.state.activeMainChartType));
      setTimeout(() => {
        this.isUpdatingData = false;
      }, 50);
    } catch (error) {
      console.error(error);
      this.isUpdatingData = false;
    }
  };

  private refreshDisplayData() {
    const preparedData = DataManager.handleData(this.props.data,
      buildDefaultDataProcessingConfig({
        timeframe: this.state.timeframe,
        timezone: this.state.timezone
      },
        this.state.activeMainChartType,
        this.state.virtualDataBeforeCount,
        this.state.virtualDataAfterCount
      ),
      this.state.activeMainChartType
    );
    const displayData = preparedData.slice(-(this.state.virtualDataAfterCount + 500));
    this.setState({
      preparedData: preparedData,
      displayData: displayData
    });
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

  // =========================== Main Chart timeline processing Start ===========================

  // handle visible time Range Change
  private handleVisibleTimeRangeChange = (event: { from: number, to: number } | null) => {
    if (!event) return;
    // update chart visible range state
    this.updateChartVisibleRangeState(ChartType.MainChart, null, event);
    // chart scroll lock
    // this.viewportManager?.handleChartScrollLock(visibleRange, this.state.displayData);
    const viewportData: ICandleViewDataPoint[] = this.viewportManager?.getViewportDataPoints(event, this.state.preparedData) || [];
    this.setState({
      displayData: viewportData
    });
  };

  // ======================= data poin =======================

  public updateChartVisibleRangeState = (chartType: ChartType, subChartType: SubChartIndicatorType | null, visibleRange: { from: number; to: number } | null) => {
    if (ChartType.MainChart === chartType) {
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
        stochasticChartVisibleRange: visibleRange,
      });
      return;
    }
    if (ChartType.SubChart === chartType) {
      switch (subChartType) {
        case SubChartIndicatorType.RSI:
          this.setState({
            mainChartVisibleRange: visibleRange,
            adxChartVisibleRange: visibleRange,
            atrChartVisibleRange: visibleRange,
            bbwidthChartVisibleRange: visibleRange,
            cciChartVisibleRange: visibleRange,
            kdjChartVisibleRange: visibleRange,
            macdChartVisibleRange: visibleRange,
            obvhartVisibleRange: visibleRange,
            sarChartVisibleRange: visibleRange,
            volumeChartVisibleRange: visibleRange,
          });
          break;
        case SubChartIndicatorType.ADX:
          this.setState({
            mainChartVisibleRange: visibleRange,
            rsiChartVisibleRange: visibleRange,
            atrChartVisibleRange: visibleRange,
            bbwidthChartVisibleRange: visibleRange,
            cciChartVisibleRange: visibleRange,
            kdjChartVisibleRange: visibleRange,
            macdChartVisibleRange: visibleRange,
            obvhartVisibleRange: visibleRange,
            sarChartVisibleRange: visibleRange,
            volumeChartVisibleRange: visibleRange,
          });
          break;
        case SubChartIndicatorType.ATR:
          this.setState({
            mainChartVisibleRange: visibleRange,
            rsiChartVisibleRange: visibleRange,
            adxChartVisibleRange: visibleRange,
            bbwidthChartVisibleRange: visibleRange,
            cciChartVisibleRange: visibleRange,
            kdjChartVisibleRange: visibleRange,
            macdChartVisibleRange: visibleRange,
            obvhartVisibleRange: visibleRange,
            sarChartVisibleRange: visibleRange,
            volumeChartVisibleRange: visibleRange,
          });
          break;
        case SubChartIndicatorType.BBWIDTH:
          this.setState({
            mainChartVisibleRange: visibleRange,
            rsiChartVisibleRange: visibleRange,
            adxChartVisibleRange: visibleRange,
            atrChartVisibleRange: visibleRange,
            cciChartVisibleRange: visibleRange,
            kdjChartVisibleRange: visibleRange,
            macdChartVisibleRange: visibleRange,
            obvhartVisibleRange: visibleRange,
            sarChartVisibleRange: visibleRange,
            volumeChartVisibleRange: visibleRange,
          });
          break;
        case SubChartIndicatorType.CCI:
          this.setState({
            mainChartVisibleRange: visibleRange,
            rsiChartVisibleRange: visibleRange,
            adxChartVisibleRange: visibleRange,
            atrChartVisibleRange: visibleRange,
            bbwidthChartVisibleRange: visibleRange,
            kdjChartVisibleRange: visibleRange,
            macdChartVisibleRange: visibleRange,
            obvhartVisibleRange: visibleRange,
            sarChartVisibleRange: visibleRange,
            volumeChartVisibleRange: visibleRange,
          });
          break;
        case SubChartIndicatorType.KDJ:
          this.setState({
            mainChartVisibleRange: visibleRange,
            rsiChartVisibleRange: visibleRange,
            adxChartVisibleRange: visibleRange,
            atrChartVisibleRange: visibleRange,
            bbwidthChartVisibleRange: visibleRange,
            cciChartVisibleRange: visibleRange,
            macdChartVisibleRange: visibleRange,
            obvhartVisibleRange: visibleRange,
            sarChartVisibleRange: visibleRange,
            volumeChartVisibleRange: visibleRange,
          });
          break;
        case SubChartIndicatorType.MACD:
          this.setState({
            mainChartVisibleRange: visibleRange,
            rsiChartVisibleRange: visibleRange,
            adxChartVisibleRange: visibleRange,
            atrChartVisibleRange: visibleRange,
            bbwidthChartVisibleRange: visibleRange,
            cciChartVisibleRange: visibleRange,
            kdjChartVisibleRange: visibleRange,
            obvhartVisibleRange: visibleRange,
            sarChartVisibleRange: visibleRange,
            volumeChartVisibleRange: visibleRange,
          });
          break;
        case SubChartIndicatorType.VOLUME:
          this.setState({
            mainChartVisibleRange: visibleRange,
            rsiChartVisibleRange: visibleRange,
            adxChartVisibleRange: visibleRange,
            atrChartVisibleRange: visibleRange,
            bbwidthChartVisibleRange: visibleRange,
            cciChartVisibleRange: visibleRange,
            kdjChartVisibleRange: visibleRange,
            obvhartVisibleRange: visibleRange,
            sarChartVisibleRange: visibleRange,
            macdChartVisibleRange: visibleRange,
          });
          break;
        case SubChartIndicatorType.OBV:
          this.setState({
            mainChartVisibleRange: visibleRange,
            rsiChartVisibleRange: visibleRange,
            adxChartVisibleRange: visibleRange,
            atrChartVisibleRange: visibleRange,
            bbwidthChartVisibleRange: visibleRange,
            cciChartVisibleRange: visibleRange,
            kdjChartVisibleRange: visibleRange,
            volumeChartVisibleRange: visibleRange,
            sarChartVisibleRange: visibleRange,
            macdChartVisibleRange: visibleRange,
          });
          break;
        case SubChartIndicatorType.SAR:
          this.setState({
            mainChartVisibleRange: visibleRange,
            sarChartVisibleRange: visibleRange,
            adxChartVisibleRange: visibleRange,
            atrChartVisibleRange: visibleRange,
            bbwidthChartVisibleRange: visibleRange,
            cciChartVisibleRange: visibleRange,
            kdjChartVisibleRange: visibleRange,
            volumeChartVisibleRange: visibleRange,
            obvhartVisibleRange: visibleRange,
            macdChartVisibleRange: visibleRange,
          });
          break;
        case SubChartIndicatorType.STOCHASTIC:
          this.setState({
            mainChartVisibleRange: visibleRange,
            stochasticChartVisibleRange: visibleRange,
            adxChartVisibleRange: visibleRange,
            atrChartVisibleRange: visibleRange,
            bbwidthChartVisibleRange: visibleRange,
            cciChartVisibleRange: visibleRange,
            kdjChartVisibleRange: visibleRange,
            volumeChartVisibleRange: visibleRange,
            obvhartVisibleRange: visibleRange,
            macdChartVisibleRange: visibleRange,
          });
          break;
      }
      return;
    }
  };

  private syncMainChartVisibleRange = () => {
    const { mainChartVisibleRange } = this.state;
    if (!mainChartVisibleRange || !this.chart) {
      return;
    }
    try {
      const timeScale = this.chart.timeScale();
      const currentVisibleRange = this.viewportManager?.getVisibleTimeRange();
      if (currentVisibleRange &&
        currentVisibleRange.from === mainChartVisibleRange.from &&
        currentVisibleRange.to === mainChartVisibleRange.to) {
        return;
      }
      timeScale.setVisibleRange({
        from: mainChartVisibleRange.from,
        to: mainChartVisibleRange.to
      });
    } catch (error) {
      console.error(error);
    }
  };
  // =========================== Main Chart timeline processing End ===========================

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

  handleChartTypeSelect = (mainChartType: MainChartType) => {
    this.setState({
      activeMainChartType: mainChartType,
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

  handleMainChartIndicatorChange = (indicator: MainChartIndicatorInfo | null) => {
    this.setState({
      selectedMainChartIndicator: indicator
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
  };

  stopRealTimeDataSimulation = () => {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
      this.realTimeInterval = null;
    }
  };

  switchChartType = (mainChartType: MainChartType) => {
    if (!this.chart || !this.props.data || this.isUpdatingData) {
      return;
    }
    try {
      this.isUpdatingData = true;
      const formattedData = DataManager.handleChartDisplayData(this.state.displayData, this.state.activeMainChartType);
      this.currentSeries = switchChartType(
        this.chart,
        this.currentSeries,
        mainChartType,
        formattedData,
        this.state.currentTheme
      );
      setTimeout(() => {
        this.isUpdatingData = false;
      }, 10);
    } catch (error) {
      console.error(error);
      this.isUpdatingData = false;
    }
  };

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

  render() {
    const { currentTheme, isResizing } = this.state;
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
          activeMainChartType={this.state.activeMainChartType}
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
                  chartData={this.state.displayData}
                  title={this.props.title}
                  selectedMainChartIndicator={this.state.selectedMainChartIndicator}
                  showInfoLayer={this.state.showInfoLayer}
                  i18n={this.state.currentI18N}
                  topMark={this.props.topMark}
                  bottomMark={this.props.bottomMark}
                  onMainChartIndicatorChange={this.handleMainChartIndicatorChange}
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
                    chartData={this.state.displayData}
                    selectedSubChartIndicators={this.state.selectedSubChartIndicators}
                    height={this.state.subChartPanelHeight}
                    handleRemoveSubChartIndicator={this.handleRemoveSubChartIndicator}
                    candleViewContainerRef={this.candleViewContainerRef}
                    updateChartVisibleRange={this.updateChartVisibleRangeState}
                    rsiChartVisibleRange={this.state.rsiChartVisibleRange}
                    adxChartVisibleRange={this.state.adxChartVisibleRange}
                    atrChartVisibleRange={this.state.atrChartVisibleRange}
                    bbwidthChartVisibleRange={this.state.bbwidthChartVisibleRange}
                    cciChartVisibleRange={this.state.cciChartVisibleRange}
                    kdjChartVisibleRange={this.state.kdjChartVisibleRange}
                    macdChartVisibleRange={this.state.macdChartVisibleRange}
                    volumeChartVisibleRange={this.state.volumeChartVisibleRange}
                    stochasticChartVisibleRange={this.state.stochasticChartVisibleRange}
                    obvhartVisibleRange={this.state.obvhartVisibleRange}
                    sarChartVisibleRange={this.state.sarChartVisibleRange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
