import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import {
  updateSeriesTheme,
  ChartSeries,
  createDrawSeries,
} from './ChartLayer/ChartTypeManager';
import { ChartLayer } from './ChartLayer';
import { ChartManager } from './ChartLayer/ChartManager';
import { MainChartIndicatorInfo } from './Indicators/MainChart/MainChartIndicatorInfo';
import { EN, I18n, zhCN } from './I18n';
import { ICandleViewDataPoint, MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from './types';
import { captureWithCanvas } from './Camera';
import { IStaticMarkData } from './MarkManager/StaticMarkManager';
import { mapTimeframe, mapTimezone } from './tools';
import { buildDefaultDataProcessingConfig, DataManager } from './DataManager';
import { ViewportManager } from './ViewportManager';
import { ChartEventManager } from './ChartLayer/ChartEventManager';
import { ThemeConfig, Light, Dark } from './Theme';
import { LeftArrowIcon, MinusIcon, PlusIcon, RefreshIcon, RightArrowIcon } from './Icons';
import { AIBrandType, AIConfig, AIFunctionType } from './AI/types';
import { AIChatBox } from './AI/AIChatBox';
import { AIManager } from './AI/AImanager';
import { Terminal } from './Terminal';
import LeftPanel from './LeftPanel';
import TopPanel from './TopPanel';
import { ImageWatermarkManager } from './MarkManager/Water/ImageWatermarkManager';
import { LOGO } from './logo';

export interface CandleViewProps {
  // theme config
  theme?: 'dark' | 'light';
  // i18n config
  i18n?: 'en' | 'zh-cn';
  // height
  height?: number | string;
  // width
  width?: number | string;
  // title
  title: string;
  // show top panel
  toppanel?: boolean;
  // show left panel
  leftpanel?: boolean;
  // mark data
  markData?: IStaticMarkData[];
  // time frame
  timeframe?: string;
  // time zone
  timezone?: string;
  // data
  data?: ICandleViewDataPoint[];
  // enable AI function
  ai?: boolean;
  // ai config list
  aiconfigs?: AIConfig[];
  // terminal
  terminal?: boolean;
  // is mobile mode
  isMobileMode?: boolean;
  // is open viewport segmentation
  isOpenViewportSegmentation?: boolean;
  // is open internal time frame calculation
  isCloseInternalTimeFrameCalculation?: boolean;
  // timeframe callback mapping
  timeframeCallbacks?: Partial<Record<TimeframeEnum, () => void>>;
  // handle screenshot capture
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
  // show top panel
  toppanel: boolean;
  // show left panel
  leftpanel: boolean;
  // enable AI function
  ai: boolean;
  // ai config list
  aiconfigs: AIConfig[];
  // open ai chat
  openAiChat: boolean;
  // current ai function type
  currentAIFunctionType: AIFunctionType | null;
  // current ai brand type
  currentAIBrandType: AIBrandType | null;
  // AI panel width ratio
  aiPanelWidthRatio: number;
  // is adjusting the AI panel size
  isResizingAiPanel: boolean;
  // terminal state
  terminalCommand: string;
  terminal: boolean;
  terminalHeightRatio: number;
  isResizingTerminal: boolean;
  // mark data
  markData: IStaticMarkData[];
}

export class CandleView extends React.Component<CandleViewProps, CandleViewState> {
  public candleViewRef = React.createRef<HTMLDivElement>();
  private chartRef = React.createRef<HTMLDivElement>();
  private chartContainerRef = React.createRef<HTMLDivElement>();
  private chartLayerRef = React.createRef<any>();
  private chart: any = null;
  private resizeObserver: ResizeObserver | null = null;
  private realTimeInterval: NodeJS.Timeout | null = null;
  // The series of the current main image canvas
  private currentSeries: ChartSeries | null = null;
  private chartManager: ChartManager | null = null;
  private updateTimeout: NodeJS.Timeout | null = null;
  private viewportManager: ViewportManager | null = null;
  private chartEventManager: ChartEventManager | null = null;
  // AI panel drag-and-drop  
  private aiPanelResizeRef = React.createRef<HTMLDivElement>();
  private isDragging: boolean = false;
  private startX: number = 0;
  private startChartWidth: number = 0;
  private containerWidth: number = 0;
  // terminal panel drag-and-drop  
  private terminalResizeRef = React.createRef<HTMLDivElement>();
  private isDraggingTerminal: boolean = false;
  private startY: number = 0;
  private startTerminalHeightRatio: number = 0;
  // ===================== Internal Data Buffer =====================
  // prepared data
  private preparedData: ICandleViewDataPoint[] = [];
  // original data
  private originalData: ICandleViewDataPoint[] = [];
  // ===================== Internal Data Buffer =====================
  // ai manager
  private aiManager: AIManager | null = null;

  constructor(props: CandleViewProps) {
    super(props);
    const initialAiPanelWidthRatio = 1;
    const initialTerminalHeightRatio = 0.3;
    const dafultTimeFrame = mapTimeframe(props.timeframe) || TimeframeEnum.FIFTEEN_MINUTES;
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
      // time
      activeTimeframe: dafultTimeFrame,
      timeframe: dafultTimeFrame,
      timezone: mapTimezone(props.timezone) || TimezoneEnum.SHANGHAI,
      savedVisibleRange: null,
      virtualDataBeforeCount: 500,
      virtualDataAfterCount: 500,
      // display data
      displayData: [],
      isDataLoading: false,
      dataLoadProgress: 0,
      loadError: null,
      toppanel: props.toppanel || false,
      leftpanel: props.leftpanel || false,
      // enable AI function
      ai: props.ai || false,
      // ai config list
      aiconfigs: props.aiconfigs || [],
      // open ai chat
      openAiChat: false,
      // current ai function type
      currentAIFunctionType: null,
      // current ai brand type
      currentAIBrandType: null,
      // AI panel width ratio 
      aiPanelWidthRatio: initialAiPanelWidthRatio,
      // is adjusting the AI panel size
      isResizingAiPanel: false,
      // terminal
      terminalCommand: '',
      terminal: this.props.terminal || false,
      terminalHeightRatio: initialTerminalHeightRatio,
      isResizingTerminal: false,
      // mark data
      markData: this.props.markData || [],
    };
    this.chartEventManager = new ChartEventManager();
    this.aiManager = new AIManager();
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
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleTerminalMouseMove);
    document.addEventListener('mouseup', this.handleTerminalMouseUp);
    // mobile 
    document.addEventListener('touchstart', this.handleClickOutside, true);
  }

  componentDidUpdate(prevProps: CandleViewProps, prevState: CandleViewState) {
    if (prevProps.theme !== this.props.theme) {
      const theme = this.props.theme || 'dark';
      this.setState({
        currentTheme: this.getThemeConfig(theme),
      });
      this.handleThemeToggle();
    }
    const isExternalDataChange = prevProps.data !== this.props.data;
    if (isExternalDataChange) {
      const isIncremental = this.isIncrementalDataUpdate(prevProps.data, this.props.data);
      if (isIncremental && this.chart && this.currentSeries && this.props.data) {
        this.originalData = this.props.data;
        this.refreshInternalData(() => {
          this.refreshChart();
        });
      } else {
        // clear static marks
        this.clearStaticMarks();
        this.setState({
          isDataLoading: true,
          dataLoadProgress: 0
        });
        this.loadDataAsync(() => {
          this.refreshChart();
        });
      }
      return;
    }
    if (prevProps.markData !== this.props.markData) {
      if (this.props.markData) {
        this.setState({
          markData: this.props.markData,
        });
      }
    }
    if (prevProps.terminal !== this.props.terminal) {
      if (this.props.terminal) {
        this.setState({
          terminal: this.props.terminal,
        });
      }
    }
    if (prevState.openAiChat !== this.state.openAiChat) {
      this.setState({
        aiPanelWidthRatio: this.state.openAiChat ? 0.7 : 1
      });
    }
    if (prevProps.aiconfigs !== this.props.aiconfigs) {
      if (this.props.aiconfigs) {
        this.setState({
          aiconfigs: this.props.aiconfigs
        });
      }
    }
    if (prevProps.i18n !== this.props.i18n) {
      this.setState({
        currentI18N: this.getI18nConfig(this.props.i18n || 'en')
      });
      this.updateChartI18n(this.props.i18n || 'en');
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
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('mousemove', this.handleTerminalMouseMove);
    document.removeEventListener('mouseup', this.handleTerminalMouseUp);
  }
  // ======================================== life cycle end ========================================

  // clear static marks
  private clearStaticMarks() {
    // clear mark
    if (this.chartLayerRef && this.chartLayerRef.current) {
      if (this.chartLayerRef.current.staticMarkManager) {
        if (this.chartLayerRef.current.staticMarkManager.clearAllMarks) {
          this.chartLayerRef.current.staticMarkManager.clearAllMarks();
        }
      }
    }
  }

  // Incremental data checking function
  private isIncrementalDataUpdate(
    prevData: ICandleViewDataPoint[] | undefined,
    newData: ICandleViewDataPoint[] | undefined
  ): boolean {
    if (!prevData || !newData || prevData.length === 0 || newData.length === 0) {
      return false;
    }
    if (newData.length > prevData.length) {
      const checkCount = Math.min(prevData.length, 10);
      for (let i = 0; i < checkCount; i++) {
        const prevTime = typeof prevData[i].time === 'string' ? new Date(prevData[i].time).getTime() : prevData[i].time;
        const newTime = typeof newData[i].time === 'string' ? new Date(newData[i].time).getTime() : newData[i].time;
        if (prevTime !== newTime) {
          return false;
        }
      }
      return true;
    }
    if (prevData.length === newData.length) {
      const prevLast = prevData[prevData.length - 1];
      const newLast = newData[newData.length - 1];
      const prevLastTime = typeof prevLast.time === 'string' ? new Date(prevLast.time).getTime() : prevLast.time;
      const newLastTime = typeof newLast.time === 'string' ? new Date(newLast.time).getTime() : newLast.time;
      if (prevLastTime === newLastTime) {
        return true;
      }
      const prevFirst = prevData[0];
      const newFirst = newData[0];
      const prevFirstTime = typeof prevFirst.time === 'string' ? new Date(prevFirst.time).getTime() : prevFirst.time;
      const newFirstTime = typeof newFirst.time === 'string' ? new Date(newFirst.time).getTime() : newFirst.time;
      return prevFirstTime === newFirstTime;
    }
    return false;
  }

  // ============================= Terminal drag and drop processing method =============================
  private handleTerminalResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    this.isDraggingTerminal = true;
    this.setState({ isResizingTerminal: true });
    const container = this.candleViewRef.current;
    if (container) {
      this.startY = e.clientY;
      this.startTerminalHeightRatio = this.state.terminalHeightRatio;
    }
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  private handleTerminalMouseMove = (e: MouseEvent) => {
    if (!this.isDraggingTerminal) return;
    const container = this.candleViewRef.current;
    if (!container) return;
    const currentContainerHeight = container.clientHeight;
    if (currentContainerHeight <= 0) return;
    const deltaY = this.startY - e.clientY;
    const newRatio = this.startTerminalHeightRatio + (deltaY / currentContainerHeight);
    const clampedRatio = Math.max(0.2, Math.min(0.5, newRatio));
    this.setState({
      terminalHeightRatio: clampedRatio
    });
  };

  private handleTerminalMouseUp = () => {
    if (this.isDraggingTerminal) {
      this.isDraggingTerminal = false;
      this.setState({ isResizingTerminal: false });
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  };

  // ============================= Starting with AI panel dragging methods =============================
  private handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    this.isDragging = true;
    this.setState({ isResizingAiPanel: true });
    if (this.aiPanelResizeRef.current) {
      this.aiPanelResizeRef.current.style.backgroundColor = this.state.currentTheme.divider.dragging;
    }
    const container = this.candleViewRef.current;
    if (container) {
      this.containerWidth = container.clientWidth;
      this.startX = e.clientX;
      this.startChartWidth = this.state.aiPanelWidthRatio;
    }
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging || !this.containerWidth) return;
    const deltaX = e.clientX - this.startX;
    if (!this.state.ai) return;
    const newChartWidth = Math.max(0.3, Math.min(0.9, this.startChartWidth + (deltaX / this.containerWidth)));
    this.setState({
      aiPanelWidthRatio: newChartWidth
    }, () => {
      if (this.chart) {
        const chartContainer = this.chartContainerRef.current;
        if (chartContainer) {
          const width = chartContainer.clientWidth;
          const height = chartContainer.clientHeight;
          if (width > 0 && height > 0) {
            this.chart.applyOptions({
              width: width,
              height: height,
            });
          }
        }
      }
    });
  };

  private handleMouseUp = () => {
    if (this.isDragging) {
      this.isDragging = false;
      this.setState({ isResizingAiPanel: false });
      if (this.aiPanelResizeRef.current) {
        this.aiPanelResizeRef.current.style.backgroundColor = this.state.currentTheme.divider.normal;
      }
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  };
  // ============================= Ending with AI panel dragging methods =============================

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
        this.setState({
          dataLoadProgress: 100,
          isDataLoading: false,
          loadError: null
        }, () => {
          if (callback) {
            callback();
          }
        });
      })
      .catch((error) => {
        this.setState({
          isDataLoading: false,
          loadError: error.message
        });
      });
  };

  // load external data
  private loadExternalData = async (): Promise<void> => {
    // clear original data  
    this.clearOriginalData();
    return new Promise((resolve, reject) => {
      try {
        this.setState({ dataLoadProgress: 10 });
        const data = this.props.data || [];
        this.originalData = data;
        this.setState({ dataLoadProgress: 30 });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // load internal data
  private loadInternalData = async (): Promise<void> => {
    return new Promise((resolve) => {
      this.setState({ dataLoadProgress: 40 });
      // clear chart 
      this.clearChart(() => {
        const preparedData = DataManager.handleData(
          this.originalData,
          buildDefaultDataProcessingConfig({
            timeframe: this.state.timeframe,
            timezone: this.state.timezone,
          },
            this.state.currentMainChartType,
            this.state.virtualDataBeforeCount,
            this.state.virtualDataAfterCount
          ),
          this.state.currentMainChartType,
          this.props.isCloseInternalTimeFrameCalculation || false,
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
    });
  };

  // clear original data
  private clearOriginalData() {
    this.originalData = [];
  }

  // clear chart
  private clearChart(callback?: () => void) {
    if (this.currentSeries) {
      if (this.currentSeries.series) {
        this.currentSeries.series.setData([]);
      }
    }
    this.preparedData = [];
    this.setState(
      {
        displayData: []
      }, () => {
        callback?.();
      }
    );
  }

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
      this.currentSeries = createDrawSeries(this.chart, currentTheme);
      const imageWatermarkManager = new ImageWatermarkManager({
        chartSeries: this.currentSeries,
        chart: this.chart
      });
      imageWatermarkManager.addWatermark({
        src: LOGO,
        size: 40,
        opacity: 2,
        offsetX: 20,
        offsetY: 45
      });
      if (this.state.displayData && this.state.displayData.length > 0) {
        this.setState({ dataLoadProgress: 85 });
        this.refreshInternalData(() => {
          this.initChart();
          this.viewportManager?.positionChart();
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
    this.clearChart();
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
          this.viewportManager?.positionChart();
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
    this.clearChart();
    // open internal timeframe calculation.
    if (this.props.isCloseInternalTimeFrameCalculation) {
      const timeframeEnum = timeframe as TimeframeEnum;
      this.setState({
        activeTimeframe: timeframeEnum,
        timeframe: timeframeEnum,
      }, () => {
        if (this.props.timeframeCallbacks) {
          const callback = this.props.timeframeCallbacks[timeframeEnum];
          if (callback) {
            callback();
          }
        }
      });
    } else {
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
            this.viewportManager?.positionChart();
            setTimeout(() => {
              this.setState({
                isDataLoading: false,
                dataLoadProgress: 100
              });
            }, 50);
          });
        }, 500);
      });
    }
  };

  private loadInternalDataAsync = (callback?: () => void): Promise<void> => {
    return new Promise((resolve) => {
      if (!this.state.isDataLoading) {
        this.setState({ isDataLoading: true });
      }
      this.setState({ dataLoadProgress: 10 });
      const scheduleTask = () => {
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
            this.state.currentMainChartType,
            this.props.isCloseInternalTimeFrameCalculation || false,
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
        }, 0);
      };
      const delay = 0;
      setTimeout(scheduleTask, delay);
    });
  };

  private initChart = () => {
    if (!this.currentSeries || !this.currentSeries.series) return;
    try {
      if (this.state.isDataLoading) {
        this.setState({ dataLoadProgress: 80 });
      }
      this.currentSeries.series.setData(this.preparedData);
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
    const data = this.props.data || [];
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
      this.state.currentMainChartType,
      this.props.isCloseInternalTimeFrameCalculation || false,
    );
    this.preparedData = preparedData;
    this.setState({
      displayData: preparedData
    }, () => {
      callback?.();
    });
  }

  // ========================== handle sub chart indicator start ==========================
  public handleExternalSelectedSubChartIndicator = (indicatorType: SubChartIndicatorType) => {
    this.setState((prevState: CandleViewState) => {
      const isSelected = prevState.selectedSubChartIndicators.includes(indicatorType);
      let newSelectedSubChartIndicators: SubChartIndicatorType[];
      if (isSelected) {
        newSelectedSubChartIndicators = prevState.selectedSubChartIndicators.filter(
          type => type !== indicatorType
        );
      } else {
        newSelectedSubChartIndicators = [...prevState.selectedSubChartIndicators, indicatorType];
      }
      return {
        selectedSubChartIndicators: newSelectedSubChartIndicators
      };
    });
  };

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
    if (this.chartLayerRef.current) {
      return this.chartLayerRef.current.serializeDrawings();
    }
    return '[]';
  };

  handleSubChartClick = () => {
    this.setState({ isSubChartModalOpen: !this.state.isSubChartModalOpen });
  };

  deserializeDrawings = (data: string) => {
    if (this.chartLayerRef.current) {
      this.chartLayerRef.current.deserializeDrawings(data);
    }
  };

  clearAllDrawings = () => {
    if (this.chartLayerRef.current) {
      this.chartLayerRef.current.clearAllDrawings();
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
    const viewportData: ICandleViewDataPoint[] = this.props.isOpenViewportSegmentation ? this.viewportManager?.getViewportDataPoints(event, this.preparedData) || [] : this.preparedData;
    this.setState({
      displayData: viewportData
    })
  };
  // =========================== Main Chart timeline processing End ===========================

  setupResizeObserver() {
    if (!this.chartContainerRef.current) return;
    this.resizeObserver = new ResizeObserver((entries: any) => {
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

  updateChartI18n(i18n: 'en' | 'zh-cn') {
    if (this.chart) {
      this.chart.applyOptions({
        localization: {
          locale: i18n,
        },
      });
    }
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

  handleClickOutside = (event: Event) => {
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

  public handleSelectedMainChartIndicator = (selectedMainChartIndicator: MainChartIndicatorInfo) => {
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
          this.viewportManager?.positionChart();
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

  // handle ai function select
  handleAIFunctionSelect = (aiTooleId: string) => {
    const aiFunctionType = this.aiManager?.aiToolIdToFunctionType(aiTooleId);
    if (aiFunctionType) {
      this.setState({
        currentAIFunctionType: aiFunctionType
      }, () => {
      });
      this.setState({
        openAiChat: this.aiManager?.isChartType(aiTooleId) || false
      }, () => { });
      const aiBrandType = this.aiManager?.getAITypeFromFunctionType(aiFunctionType);
      if (aiBrandType) {
        this.setState({
          currentAIBrandType: aiBrandType,
        }, () => { });
      }
    }
  }

  private handleTerminalCommand = (command: string) => {
    this.setState({ terminalCommand: command });
  };

  public openTerminal = (): void => {
    this.setState({
      terminal: true
    });
  };

  public closeTerminal = (): void => {
    this.setState({
      terminal: false
    });
  };

  render() {
    const { currentTheme, isDataLoading, ai, openAiChat, terminal, terminalHeightRatio } = this.state;
    const { height = '100%', width = '100%' } = this.props;
    const chartFlexValue = ai ? this.state.aiPanelWidthRatio : 1;
    const panelFlexValue = ai ? 1 - this.state.aiPanelWidthRatio : 0;
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
    .terminal-input-history {
    max-height: 200px;
    overflow-y: auto;
    }
    .terminal-command-output {
    font-family: '"SF Mono", Monaco, "Cascadia Code", monospace';
    font-size: 13px;
    line-height: 1.4;
    white-space: pre-wrap;
    word-break: break-all;
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
        ref={this.candleViewRef}
        style={{
          position: 'relative',
          width: width,
          height: height,
          background: currentTheme.layout.background.color,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          userSelect: 'none',
          overflowX: "hidden",
          overflowY: "hidden"
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
              zIndex: 4,
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
              zIndex: 2,
              background: 'transparent',
            }}
            onClick={this.handleCloseModals}
          />
        )}
        {this.state.toppanel && (
          <TopPanel
            candleViewRef={this.candleViewRef}
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
            isMobileMenuOpen={this.state.isMobileMenuOpen}
            onMobileMenuToggle={this.handleMobileMenuToggle}
            timeframe={this.state.timeframe}
            timezone={this.state.timezone}
            isCloseInternalTimeFrameCalculation={this.props.isCloseInternalTimeFrameCalculation || false}
            timeframeCallbacks={this.props.timeframeCallbacks || {}}
            isMobileMode={this.props.isMobileMode || false}
          />)}
        <div style={{
          display: 'flex',
          flex: terminal ? `calc(100% - ${terminalHeightRatio * 100}%)` : '100%',
          minHeight: 0,
          position: 'relative',
        }}>
          {this.state.leftpanel && !this.props.isMobileMode && (
            <LeftPanel
              currentTheme={currentTheme}
              activeTool={this.state.activeTool}
              onToolSelect={this.handleToolSelect}
              onTradeClick={this.handleTradeClick}
              chartLayerRef={this.chartLayerRef}
              selectedEmoji={this.state.selectedEmoji}
              onEmojiSelect={this.handleEmojiSelect}
              i18n={this.state.currentI18N}
              candleViewRef={this.candleViewRef}
              ai={this.state.ai}
              aiconfigs={this.state.aiconfigs}
              handleAIFunctionSelect={this.handleAIFunctionSelect}
              candleView={this}
              isMobileMode={this.props.isMobileMode || false}
            />
          )}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            minWidth: 0,
            minHeight: 0,
            position: 'relative',
          }}>
            <div style={{
              flex: chartFlexValue,
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
                    ref={this.chartLayerRef}
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
                    markData={this.state.markData}
                    onMainChartIndicatorChange={this.handleMainChartIndicatorChange}
                    handleRemoveSubChartIndicator={this.handleRemoveSubChartIndicator}
                    currentMainChartType={this.state.currentMainChartType}
                    viewportManager={this.viewportManager}
                    ai={this.state.ai}
                    aiconfigs={this.state.aiconfigs}
                    currentAIFunctionType={this.state.currentAIFunctionType}
                    timeframe={this.state.timeframe}
                    timezone={this.state.timezone}
                  />
                )}
                {/* Chart Adjustment Button Group */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    zIndex: 3,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'auto',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.stopPropagation();
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0';
                    e.stopPropagation();
                  }}
                >
                  <button
                    onClick={this.handleZoomOut}
                    style={{
                      width: '25px',
                      height: '25px',
                      borderRadius: '6px',
                      border: 'none',
                      background: currentTheme.toolbar.button.backgroundColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: currentTheme.toolbar.button.boxShadow,
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <MinusIcon size={14} color={currentTheme.toolbar.button.iconColor} />
                  </button>
                  <button
                    onClick={this.handleLeftArrowClick}
                    style={{
                      width: '25px',
                      height: '25px',
                      borderRadius: '6px',
                      border: 'none',
                      background: currentTheme.toolbar.button.backgroundColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: currentTheme.toolbar.button.boxShadow,
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <LeftArrowIcon size={14} color={currentTheme.toolbar.button.iconColor} />
                  </button>
                  <button
                    onClick={this.handleRefreshClick}
                    style={{
                      width: '25px',
                      height: '25px',
                      borderRadius: '6px',
                      border: 'none',
                      background: currentTheme.toolbar.button.backgroundColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: currentTheme.toolbar.button.boxShadow,
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <RefreshIcon size={16} color={currentTheme.toolbar.button.iconColor} />
                  </button>
                  <button
                    onClick={this.handleRightArrowClick}
                    style={{
                      width: '25px',
                      height: '25px',
                      borderRadius: '6px',
                      border: 'none',
                      background: currentTheme.toolbar.button.backgroundColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: currentTheme.toolbar.button.boxShadow,
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <RightArrowIcon size={14} color={currentTheme.toolbar.button.iconColor} />
                  </button>
                  <button
                    onClick={this.handleZoomIn}
                    style={{
                      width: '25px',
                      height: '25px',
                      borderRadius: '6px',
                      border: 'none',
                      background: currentTheme.toolbar.button.backgroundColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: currentTheme.toolbar.button.boxShadow,
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <PlusIcon size={14} color={currentTheme.toolbar.button.iconColor} />
                  </button>
                </div>
              </div>
            </div>
            {openAiChat && (
              <div
                ref={this.aiPanelResizeRef}
                style={{
                  width: '8px',
                  cursor: 'col-resize',
                  backgroundColor: this.state.currentTheme.divider.normal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                }}
                onMouseDown={this.handleResizeMouseDown}
                onMouseEnter={() => {
                  if (!this.isDragging) {
                    if (this.aiPanelResizeRef.current) {
                      this.aiPanelResizeRef.current.style.backgroundColor = this.state.currentTheme.divider.hover;
                    }
                  }
                }}
                onMouseLeave={() => {
                  if (!this.isDragging) {
                    if (this.aiPanelResizeRef.current) {
                      this.aiPanelResizeRef.current.style.backgroundColor = this.state.currentTheme.divider.normal;
                    }
                  }
                }}
              >
                <div
                  style={{
                    width: '2px',
                    height: '40px',
                    backgroundColor: this.state.currentTheme.toolbar.button.color + '60',
                    borderRadius: '1px',
                  }}
                />
              </div>
            )}
            {openAiChat && (
              <div style={{
                flex: panelFlexValue,
                minWidth: '200px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: currentTheme.layout.background.color,
                borderLeft: `1px solid ${currentTheme.toolbar.border}30`,
                overflow: 'hidden',
              }}>
                <AIChatBox
                  currentTheme={currentTheme}
                  i18n={this.state.currentI18N}
                  currentAIFunctionType={this.state.currentAIFunctionType}
                  aiconfigs={this.state.aiconfigs}
                  currentAIBrandType={this.state.currentAIBrandType}
                  onClose={() => {
                    this.setState({ openAiChat: false });
                  }}
                  onSendMessage={async (message: string) => {
                    return new Promise(resolve => {
                      setTimeout(() => {
                        resolve();
                      }, 1000);
                    });
                  }}
                  data={this.originalData}
                />
              </div>
            )}
          </div>
        </div>
        {/* Terminal Start */}
        {terminal && (
          <div
            ref={this.terminalResizeRef}
            style={{
              height: '8px',
              cursor: 'row-resize',
              backgroundColor: this.state.isResizingTerminal
                ? currentTheme.divider.dragging
                : currentTheme.divider.normal,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'background-color 0.2s',
            }}
            onMouseDown={this.handleTerminalResizeMouseDown}
            onMouseEnter={() => {
              if (!this.isDraggingTerminal) {
                if (this.terminalResizeRef.current) {
                  this.terminalResizeRef.current.style.backgroundColor = currentTheme.divider.hover;
                }
              }
            }}
            onMouseLeave={() => {
              if (!this.isDraggingTerminal) {
                if (this.terminalResizeRef.current) {
                  this.terminalResizeRef.current.style.backgroundColor = currentTheme.divider.normal;
                }
              }
            }}
          >
            <div
              style={{
                width: '40px',
                height: '2px',
                backgroundColor: currentTheme.toolbar.button.color + '60',
                borderRadius: '1px',
              }}
            />
          </div>
        )}
        {terminal && (
          <div style={{
            flex: terminal ? `${terminalHeightRatio * 100}%` : '0',
            minHeight: '130px',
            maxHeight: '50%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: currentTheme.layout.background.color,
            borderTop: `1px solid ${currentTheme.toolbar.border}30`,
            overflow: 'hidden',
          }}>
            <Terminal
              currentTheme={currentTheme}
              i18n={this.state.currentI18N}
              placeholder={
                this.state.currentI18N === EN
                  ? "Enter command (e.g., 'help', 'clear', 'theme light')..."
                  : "输入命令 (例如: 'help', 'clear', 'theme light')..."
              }
              onCommand={this.handleTerminalCommand}
              autoFocus={false}
              candleView={this}
              chartLayerRef={this.chartLayerRef}
            />
          </div>
        )}
        {/* Terminal End */}
      </div>
    );
  }
}