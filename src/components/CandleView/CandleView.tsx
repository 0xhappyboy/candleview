import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import {
  updateSeriesTheme,
  ChartSeries,
  createDrawSeries,
} from './ChartLayer/ChartTypeManager';
import CandleViewTopPanel from './TopPanel';
import { ChartLayer } from './ChartLayer';
import { ChartManager } from './ChartLayer/ChartManager';
import CandleViewLeftPanel from './LeftPanel';
import { MainChartIndicatorInfo } from './Indicators/MainChart/MainChartIndicatorInfo';
import { EN, I18n, zhCN } from './I18n';
import { ICandleViewDataPoint, MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from './types';
import { captureWithCanvas } from './Camera';
import { IStaticMarkData } from './MarkManager/StaticMarkManager';
import { mapTimeframe, mapTimezone } from './tools';
import { buildDefaultDataProcessingConfig, DataManager } from './DataManager';
import { ViewportManager } from './ViewportManager';
import { ChartEventManager } from './ChartLayer/ChartEventManager';
import { DataLoader } from './DataLoader';
import { ThemeConfig, Light, Dark } from './Theme';
import { LeftArrowIcon, MinusIcon, PlusIcon, RefreshIcon, RightArrowIcon } from './Icons';

export interface CandleViewProps {
  // theme config
  theme?: 'dark' | 'light';
  // i18n config
  i18n?: 'en' | 'zh-cn';
  showToolbar?: boolean;
  showIndicators?: boolean;
  // height
  height?: number | string;
  // title
  title: string;
  // show top panel
  showTopPanel?: boolean;
  // show left panel
  showLeftPanel?: boolean;
  // mark data
  markData?: IStaticMarkData[];
  // ============== time config ==============
  timeframe?: string;
  timezone?: string;
  // ============== data source ==============
  // data
  data?: ICandleViewDataPoint[];
  // json file path
  jsonFilePath?: string;
  // json url 
  url?: string;
  handleScreenshotCapture?: (imageData: {
    dataUrl: string;
    blob: Blob;
    width: number;
    height: number;
    timestamp: number;
  }) => void;
}

interface CandleViewState {
  isIndicatorModalOpen: boolean;
  isTimeframeModalOpen: boolean;
  isTradeModalOpen: boolean;
  isChartTypeModalOpen: boolean;
  isSubChartModalOpen: boolean;
  isMobileMenuOpen: boolean;
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
  currentMainChartType: MainChartType;
  selectedSubChartIndicators: SubChartIndicatorType[];
  selectedMainChartIndicator: MainChartIndicatorInfo | null;
  // =============== chart coinfig end ===============
  virtualDataBeforeCount: number;
  virtualDataAfterCount: number;
  // display data
  displayData: ICandleViewDataPoint[];
  isDataLoading: boolean;
  dataLoadProgress: number;
  loadError: string | null;
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
  // ===================== Internal Data Buffer =====================
  // prepared data
  private preparedData: ICandleViewDataPoint[] = [];
  // original data
  private originalData: ICandleViewDataPoint[] = [];
  // ===================== Internal Data Buffer =====================

  constructor(props: CandleViewProps) {
    const defaultProps: Partial<CandleViewProps> = {
      showLeftPanel: false,
      showTopPanel: false,
    };
    super({ ...defaultProps, ...props });
    this.state = {
      isIndicatorModalOpen: false,
      isTimeframeModalOpen: false,
      isTradeModalOpen: false,
      isChartTypeModalOpen: false,
      isSubChartModalOpen: false,
      isMobileMenuOpen: false,
      activeTool: null,
      currentMainChartType: MainChartType.Candle,
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
      virtualDataBeforeCount: 500,
      virtualDataAfterCount: 500,
      // display data
      displayData: [],
      isDataLoading: false,
      dataLoadProgress: 0,
      loadError: null,
    };
    this.chartEventManager = new ChartEventManager();
  }

  // ======================================== life cycle start ========================================
  componentDidMount() {
    if (this.chart) return;
    this.setState({ isDataLoading: true });
    this.loadDataAsync(() => {
      setTimeout(() => {
        this.initializeChart();
      }, 50);
    });
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
    const isExternalDataChange = prevProps.data !== this.props.data ||
      prevProps.jsonFilePath !== this.props.jsonFilePath ||
      prevProps.url !== this.props.url;
    if (isExternalDataChange) {
      this.setState({
        isDataLoading: true,
        dataLoadProgress: 0
      });
      this.loadDataAsync(() => {
        this.refreshChart();
      });
      return;
    }
  }

  componentWillUnmount() {
    const currentVisibleRange = this.viewportManager?.getVisibleTimeRange();
    if (currentVisibleRange) {
      try {
        localStorage.setItem('candleView_visibleRange', JSON.stringify(currentVisibleRange));
      } catch (e) {
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
  private loadDataAsync = (callback?: () => void) => {
    this.setState({
      dataLoadProgress: 0,
      isDataLoading: true
    });
    this.loadExternalData()
      .then(() => {
        this.setState({ dataLoadProgress: 30 });
        return this.loadInternalData();
      })
      .then(() => {
        this.setState({ dataLoadProgress: 70 });
        if (callback) {
          callback();
        }
        this.setState({
          dataLoadProgress: 100,
          isDataLoading: false,
          loadError: null
        });
      })
      .catch((error) => {
        this.setState({
          isDataLoading: false,
          loadError: error.message
        });
      });
  };

  private loadExternalData = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        this.setState({ dataLoadProgress: 10 });
        const data = DataLoader.loadData({
          jsonFilePath: this.props.jsonFilePath,
          data: this.props.data,
          url: this.props.url
        });
        this.originalData = data;
        this.setState({ dataLoadProgress: 30 });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  private loadInternalData = async (): Promise<void> => {
    return new Promise((resolve) => {
      this.setState({ dataLoadProgress: 40 });
      const preparedData = DataManager.handleData(
        this.originalData,
        buildDefaultDataProcessingConfig({
          timeframe: this.state.timeframe,
          timezone: this.state.timezone
        },
          this.state.currentMainChartType,
          this.state.virtualDataBeforeCount,
          this.state.virtualDataAfterCount
        ),
        this.state.currentMainChartType
      );
      this.setState({ dataLoadProgress: 50 });
      setTimeout(() => {
        this.preparedData = preparedData;
        this.setState({ dataLoadProgress: 60 });
        this.setState({
          displayData: preparedData,
          dataLoadProgress: 70
        }, () => {
          resolve();
        });
      }, 50);
    });
  };

  // init chart
  initializeChart() {
    if (!this.chartRef.current || !this.chartContainerRef.current) {
      return;
    }
    const container = this.chartContainerRef.current;
    const { currentTheme, chartInitialized } = this.state;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    if (containerWidth === 0 || containerHeight === 0) {
      return;
    }
    if (chartInitialized) {
      return;
    }
    try {
      this.setState({ dataLoadProgress: 75 });
      if (this.chart) {
        this.chart.remove();
        this.currentSeries = null;
      }
      this.chartManager = new ChartManager(
        this.chartRef.current,
        containerWidth,
        containerHeight,
        currentTheme,
        this.props.i18n
      );
      this.chart = this.chartManager.getChart();
      this.setState({ dataLoadProgress: 80 });
      // init viewport manager
      this.viewportManager = new ViewportManager(this.chart, this.currentSeries);
      // register visible time range change event
      this.chartEventManager?.registerVisibleTimeRangeChangeEvent(this.chart, (event: { from: number, to: number } | null) => {
        this.handleVisibleTimeRangeChange(event);
      });
      if (this.state.displayData && this.state.displayData.length > 0) {
        this.currentSeries = createDrawSeries(this.chart, currentTheme);
        this.setState({ dataLoadProgress: 85 });
        this.refreshInternalData(() => {
          this.initChart();
          this.viewportManager?.positionChart(this.state.activeTimeframe);
          this.setState({ dataLoadProgress: 90 });
          this.setupResizeObserver();
          this.setState({
            chartInitialized: true,
            dataLoadProgress: 95
          });
          setTimeout(() => {
            this.setState({ dataLoadProgress: 100 });
          }, 50);
        });
      }
    } catch (error) {
      this.setState({
        chartInitialized: false,
        dataLoadProgress: 100
      });
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

  handleCloseModals = () => {
    this.setState({
      isTimeframeModalOpen: false,
      isIndicatorModalOpen: false,
      isChartTypeModalOpen: false,
      isSubChartModalOpen: false,
      isTimezoneModalOpen: false,
      isTimeFormatModalOpen: false,
      isCloseTimeModalOpen: false,
      isTradingDayModalOpen: false,
      isMobileMenuOpen: false
    });
  }

  // select time zone
  handleTimezoneSelect = (timezone: string) => {
    this.setState({
      currentTimezone: timezone,
      timezone: timezone as TimezoneEnum,
      isTimezoneModalOpen: false,
      isDataLoading: true,
      dataLoadProgress: 0
    }, () => {
      setTimeout(() => {
        this.setState({ dataLoadProgress: 20 });
        this.loadInternalDataAsync(() => {
          this.setState({ dataLoadProgress: 70 });
          this.initChart();
          this.viewportManager?.positionChart(this.state.activeTimeframe);
          setTimeout(() => {
            this.setState({
              isDataLoading: false,
              dataLoadProgress: 100
            });
          }, 50);
        });
      }, 50);
    });
  };

  // select time frame
  handleTimeframeSelect = (timeframe: string) => {
    const timeframeEnum = timeframe as TimeframeEnum;
    this.setState({
      activeTimeframe: timeframeEnum,
      timeframe: timeframeEnum,
      isTimeframeModalOpen: false,
      isDataLoading: true,
      dataLoadProgress: 0
    }, () => {
      setTimeout(() => {
        this.setState({ dataLoadProgress: 10 });
        this.loadInternalDataAsync(() => {
          this.setState({ dataLoadProgress: 60 });
          this.initChart();
          this.viewportManager?.positionChart(this.state.activeTimeframe);
          setTimeout(() => {
            this.setState({
              isDataLoading: false,
              dataLoadProgress: 100
            });
          }, 50);
        });
      }, 50);
    });
  };


  private loadInternalDataAsync = (callback?: () => void): Promise<void> => {
    return new Promise((resolve) => {
      if (!this.state.isDataLoading) {
        this.setState({ isDataLoading: true });
      }
      this.setState({ dataLoadProgress: 10 });
      const asyncExecutor = typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback
        : (fn: Function) => setTimeout(fn, 0);
      asyncExecutor(() => {
        setTimeout(() => {
          this.setState({ dataLoadProgress: 30 });
          const preparedData = DataManager.handleData(
            this.originalData,
            buildDefaultDataProcessingConfig({
              timeframe: this.state.timeframe,
              timezone: this.state.timezone
            },
              this.state.currentMainChartType,
              this.state.virtualDataBeforeCount,
              this.state.virtualDataAfterCount
            ),
            this.state.currentMainChartType
          );
          this.setState({ dataLoadProgress: 50 });
          setTimeout(() => {
            this.preparedData = preparedData;
            this.setState({
              displayData: preparedData,
              dataLoadProgress: 60
            }, () => {
              if (callback) {
                callback();
              }
              resolve();
            });
          }, 50);
        }, 50);
      });
    });
  };

  private initChart = () => {
    if (!this.state.displayData || this.state.displayData.length === 0 || !this.currentSeries || !this.currentSeries.series) return;
    try {
      if (this.state.isDataLoading) {
        this.setState({ dataLoadProgress: 80 });
      }
      this.currentSeries.series.setData(this.state.displayData);
      if (this.state.isDataLoading) {
        setTimeout(() => {
          this.setState({ dataLoadProgress: 90 });
        }, 50);
      }
    } catch (error) {
      this.setState({
        isDataLoading: false,
        dataLoadProgress: 100
      });
    }
  };

  private refreshChart = () => {
    if (!this.state.displayData || this.state.displayData.length === 0 || !this.currentSeries || !this.currentSeries.series || !this.chart) return;
    try {
      const timeScale = this.chart.timeScale();
      const currentVisibleRange = timeScale.getVisibleRange();
      if (this.state.isDataLoading) {
        this.setState({ dataLoadProgress: 85 });
      }
      this.currentSeries.series.setData(this.state.displayData);
      if (currentVisibleRange) {
        setTimeout(() => {
          try {
            timeScale.setVisibleRange(currentVisibleRange);
            if (this.state.isDataLoading) {
              setTimeout(() => {
                this.setState({ dataLoadProgress: 95 });
              }, 50);
            }
          } catch (error) {
            if (this.state.isDataLoading) {
              this.setState({
                isDataLoading: false,
                dataLoadProgress: 100
              });
            }
          }
        }, 10);
      }
    } catch (error) {
      if (this.state.isDataLoading) {
        this.setState({
          isDataLoading: false,
          dataLoadProgress: 100
        });
      }
    }
  };

  private refreshExternalData(callback?: () => void) {
    const data = DataLoader.loadData({
      jsonFilePath: this.props.jsonFilePath,
      data: this.props.data,
      url: this.props.url
    });
    this.originalData = data;
    callback?.();
  }

  private refreshInternalData(callback?: () => void) {
    const preparedData = DataManager.handleData(this.originalData,
      buildDefaultDataProcessingConfig({
        timeframe: this.state.timeframe,
        timezone: this.state.timezone
      },
        this.state.currentMainChartType,
        this.state.virtualDataBeforeCount,
        this.state.virtualDataAfterCount
      ),
      this.state.currentMainChartType
    );
    this.preparedData = preparedData;
    this.setState({
      displayData: preparedData
    }, () => {
      callback?.();
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
    const { handleScreenshotCapture } = this.props;
    if (handleScreenshotCapture) {
      captureWithCanvas(this, (result) => {
        if (result.success && result.dataUrl && result.blob) {
          handleScreenshotCapture({
            dataUrl: result.dataUrl,
            blob: result.blob,
            width: result.width,
            height: result.height,
            timestamp: result.timestamp
          });
        } else {
          this.fallbackToDownload(result.dataUrl);
        }
      });
    } else {
      captureWithCanvas(this);
    }
  };

  private fallbackToDownload = (dataUrl?: string) => {
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `chart-screenshot-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } else {
      captureWithCanvas(this);
    }
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
  // Viewport data buffer size
  private viewportDataBufferSize: number = 500;
  // handle visible time Range Change
  private handleVisibleTimeRangeChange = (event: { from: number, to: number } | null) => {
    if (!event) return;
    // buffer
    if (event.from > this.viewportDataBufferSize) {
      event.from = event.from - this.viewportDataBufferSize;
    }
    const viewportData: ICandleViewDataPoint[] = this.viewportManager?.getViewportDataPoints(event, this.preparedData) || [];
    this.setState({
      displayData: viewportData
    })
    // chart scroll lock
    // this.viewportManager?.handleChartScrollLock(event, this.state.displayData);
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
                    }
                  }, 10);
                }
              }
            } catch (error) {
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

  handleMobileMenuToggle = () => {
    this.setState(prevState => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen
    }));
  };

  handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    const shouldCloseMobileMenuModal =
      this.state.isMobileMenuOpen &&
      !target.closest('.mobile-menu-button') &&
      !target.closest('[data-mobile-menu-modal]');
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
    if (shouldCloseMobileMenuModal) {
      this.setState({ isMobileMenuOpen: false });
    }
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
      currentMainChartType: mainChartType,
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

  };

  // Disable all browser default menus
  private handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  handleLeftArrowClick = () => {
    if (this.chart && this.viewportManager) {
      this.viewportManager.scrollChart('left');
    }
  };

  handleRightArrowClick = () => {
    if (this.chart && this.viewportManager) {
      this.viewportManager.scrollChart('right');
    }
  };

  handleRefreshClick = () => {
    this.setState({
      isDataLoading: true,
      dataLoadProgress: 0
    });
    setTimeout(() => {
      this.setState({ dataLoadProgress: 20 });
      this.refreshExternalData(() => {
        this.setState({ dataLoadProgress: 50 });
        this.refreshInternalData(() => {
          this.setState({ dataLoadProgress: 80 });
          this.refreshChart();
          this.viewportManager?.positionChart(this.state.activeTimeframe);
          this.setState({
            isDataLoading: false,
            dataLoadProgress: 100
          });
        });
      });
    }, 100);
  };

  handleZoomIn = () => {
    if (this.viewportManager) {
      this.viewportManager.zoomIn();
    }
  };

  handleZoomOut = () => {
    if (this.viewportManager) {
      this.viewportManager.zoomOut();
    }
  };

  render() {
    const { currentTheme, isDataLoading } = this.state;
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
      this.state.isTradingDayModalOpen ||
      this.state.isMobileMenuOpen;

    const loadingText = this.state.currentI18N === EN ? 'Loading data...' : '正在加载数据...';
    const errorText = this.state.currentI18N === EN ? 'Load failed' : '加载失败';

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
        onContextMenu={this.handleContextMenu}
      >
        <style>{scrollbarStyles}</style>
        {isDataLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              backgroundColor: currentTheme.layout.background.color + '10',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              backdropFilter: 'blur(1.5px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  border: `4px solid ${currentTheme.toolbar.border}30`,
                  borderTop: `4px solid ${currentTheme.toolbar.button.active}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div style={{
                color: currentTheme.layout.textColor,
                fontSize: '16px',
                fontWeight: 500,
                textAlign: 'center',
              }}>
                {loadingText}
              </div>
              {this.state.dataLoadProgress > 0 && (
                <div style={{
                  width: '240px',
                  marginTop: '8px',
                  textAlign: 'center',
                }}>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      background: currentTheme.toolbar.border + '30', 
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: `${this.state.dataLoadProgress}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${currentTheme.toolbar.button.active}, ${currentTheme.chart.candleUpColor})`,
                        transition: 'width 0.3s ease',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: currentTheme.toolbar.button.color,
                      opacity: 0.8,
                    }}
                  >
                    {this.state.dataLoadProgress}%
                  </div>
                </div>
              )}
              {this.state.loadError && (
                <div style={{
                  color: currentTheme.chart.candleDownColor,
                  fontSize: '14px',
                  textAlign: 'center',
                  marginTop: '12px',
                  padding: '8px 16px',
                  backgroundColor: currentTheme.chart.candleDownColor + '15',
                  borderRadius: '6px',
                  maxWidth: '320px',
                }}>
                  {errorText}: {this.state.loadError}
                </div>
              )}
            </div>
          </div>
        )}
        <style>
          {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
        </style>
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
        {this.props.showTopPanel && (
          <CandleViewTopPanel
            currentTheme={currentTheme}
            activeTimeframe={this.state.activeTimeframe}
            activeMainChartType={this.state.currentMainChartType}
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
            isMobileMenuOpen={this.state.isMobileMenuOpen}
            onMobileMenuToggle={this.handleMobileMenuToggle}
          />)}
        <div style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          position: 'relative',
        }}>
          {this.props.showLeftPanel && (
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
          )}
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
                  selectedSubChartIndicators={this.state.selectedSubChartIndicators}
                  showInfoLayer={this.state.showInfoLayer}
                  i18n={this.state.currentI18N}
                  markData={this.props.markData}
                  onMainChartIndicatorChange={this.handleMainChartIndicatorChange}
                  handleRemoveSubChartIndicator={this.handleRemoveSubChartIndicator}
                  currentMainChartType={this.state.currentMainChartType}
                  viewportManager={this.viewportManager}
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: '110px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '25px',
                  zIndex: 100,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0';
                }}
              >
                <button
                  onClick={this.handleZoomOut}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: currentTheme.toolbar.button.backgroundColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: currentTheme.toolbar.button.boxShadow,
                  }}
                >
                  <MinusIcon size={18} color={currentTheme.toolbar.button.color} />
                </button>
                <button
                  onClick={this.handleLeftArrowClick}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: currentTheme.toolbar.button.backgroundColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: currentTheme.toolbar.button.boxShadow,
                  }}
                >
                  <LeftArrowIcon size={18} color={currentTheme.toolbar.button.color} />
                </button>
                <button
                  onClick={this.handleRefreshClick}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    background: currentTheme.toolbar.button.backgroundColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: currentTheme.toolbar.button.boxShadow,
                  }}
                >
                  <RefreshIcon size={20} color={currentTheme.toolbar.button.color} />
                </button>
                <button
                  onClick={this.handleRightArrowClick}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: currentTheme.toolbar.button.backgroundColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: currentTheme.toolbar.button.boxShadow,
                  }}
                >
                  <RightArrowIcon size={18} color={currentTheme.toolbar.button.color} />
                </button>
                <button
                  onClick={this.handleZoomIn}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: currentTheme.toolbar.button.backgroundColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: currentTheme.toolbar.button.boxShadow,
                  }}
                >
                  <PlusIcon size={18} color={currentTheme.toolbar.button.color} />
                </button>
              </div>


            </div>
          </div>
        </div>
      </div>
    );
  }
}
