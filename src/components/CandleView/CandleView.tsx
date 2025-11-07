import { createChart } from 'lightweight-charts';
import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { ThemeConfig, Dark, Light } from './CandleViewTheme';
import {
  chartTypes,
  switchChartType,
  updateSeriesTheme,
  ChartSeries,
  formatDataForSeries
} from './ChartLayer/ChartTypeManager';
import CandleViewTopPanel from './CandleViewTopPanel';
import './GlobalStyle.css';
import { TechnicalIndicatorManager } from './Indicators/TechnicalIndicatorManager';
import { DAY_TEST_CANDLEVIEW_DATA } from './TestData';
import { ChartLayer } from './ChartLayer';
import { DEFAULT_HEIGHT } from './Global';
import { ChartManager } from './ChartLayer/ChartManager';
import CandleViewLeftPanel from './CandleViewLeftPanel';

export interface CandleViewProps {
  theme?: 'dark' | 'light';
  showToolbar?: boolean;
  showIndicators?: boolean;
  height?: number | string;
  data?: Array<{
    time: string; value: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;

}

interface CandleViewState {
  isIndicatorModalOpen: boolean;
  isTimeframeModalOpen: boolean;
  isTradeModalOpen: boolean;
  isChartTypeModalOpen: boolean;
  isSubChartModalOpen: boolean;
  activeTool: string | null;
  currentTheme: ThemeConfig;
  activeTimeframe: string;
  activeChartType: string;
  chartInitialized: boolean;
  isDarkTheme: boolean;
  selectedEmoji: string;
  activeIndicators: string[];
}

export class CandleView extends React.Component<CandleViewProps, CandleViewState> {
  static defaultProps: CandleViewProps = {
    theme: 'light',
    showToolbar: true,
    showIndicators: true,
    height: DEFAULT_HEIGHT,
    data: DAY_TEST_CANDLEVIEW_DATA,
  };

  private chartRef = React.createRef<HTMLDivElement>();
  private chartContainerRef = React.createRef<HTMLDivElement>();
  private timeframeModalRef = React.createRef<HTMLDivElement>();
  private indicatorModalRef = React.createRef<HTMLDivElement>();
  private chartTypeModalRef = React.createRef<HTMLDivElement>();
  private tradeModalRef = React.createRef<HTMLDivElement>();
  private drawingLayerRef = React.createRef<any>();
  private chart: any = null;
  private lineSeries: any = null;
  private resizeObserver: ResizeObserver | null = null;
  private realTimeInterval: NodeJS.Timeout | null = null;
  // The series of the current main image canvas
  private currentSeries: ChartSeries | null = null;
  private indicatorManager: TechnicalIndicatorManager | null = null;
  private chartManager: ChartManager | null = null;

  constructor(props: CandleViewProps) {
    super(props);
    this.state = {
      isIndicatorModalOpen: false,
      isTimeframeModalOpen: false,
      isTradeModalOpen: false,
      isChartTypeModalOpen: false,
      isSubChartModalOpen: false,
      activeTool: null,
      activeTimeframe: '1D',
      activeChartType: 'candle',
      currentTheme: this.getThemeConfig(props.theme || 'dark'),
      chartInitialized: false,
      isDarkTheme: props.theme === 'light' ? false : true,
      selectedEmoji: '😀',
      activeIndicators: []
    };
  }

  componentDidMount() {
    if (this.chart) return;
    setTimeout(() => {
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
    }

    if (prevProps.data !== this.props.data && this.currentSeries && this.currentSeries.series) {
      this.updateChartData();
    }

    if (!this.state.chartInitialized && this.chartContainerRef.current) {
      this.initializeChart();
    }

    if (prevState.activeChartType !== this.state.activeChartType && this.chart && this.props.data) {
      this.switchChartType(this.state.activeChartType);
    }

  }

  componentWillUnmount() {
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
    if (this.indicatorManager) {
      this.indicatorManager.removeAllIndicators();
    }
    document.removeEventListener('mousedown', this.handleClickOutside, true);
  }


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
      console.warn('Chart container not ready');
      return;
    }
    const container = this.chartContainerRef.current;
    const { currentTheme } = this.state;
    const { data } = this.props;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    if (containerWidth === 0 || containerHeight === 0) {
      console.warn('Chart container has zero dimensions');
      return;
    }
    try {
      if (this.chart) {
        this.chart.remove();
        this.currentSeries = null;
        this.indicatorManager = null;
      }
      // create chart manager
      this.chartManager = new ChartManager(this.chartRef.current,
        containerWidth,
        containerHeight,
        currentTheme
      );
      // get chart
      this.chart = this.chartManager.getChart();
      if (data && data.length > 0) {
        const initialChartType = this.state.activeChartType;
        const chartTypeConfig = chartTypes.find(type => type.id === initialChartType);
        if (chartTypeConfig) {
          this.currentSeries = chartTypeConfig.createSeries(this.chart, currentTheme);
          const formattedData = formatDataForSeries(data, initialChartType);
          this.currentSeries.series.setData(formattedData);
          this.chart.timeScale().fitContent();
        }
      }
      this.indicatorManager = new TechnicalIndicatorManager(this.chart, currentTheme);
      this.setupResizeObserver();
      this.setState({ chartInitialized: true });
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }

  setupResizeObserver() {
    if (!this.chartContainerRef.current) return;
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === this.chartContainerRef.current && this.chart) {
          const { width, height } = entry.contentRect;
          const validWidth = Math.max(width, 100);
          const validHeight = Math.max(height, 100);
          try {
            this.chart.applyOptions({
              width: validWidth,
              height: validHeight,
            });
            this.chart.timeScale().fitContent();
          } catch (error) {
            console.error('Error resizing chart:', error);
          }
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
        console.error('Error updating chart theme:', error);
      }
    }
    if (this.currentSeries) {
      updateSeriesTheme(this.currentSeries, currentTheme);
    }
  }

  getThemeConfig(theme: 'dark' | 'light'): ThemeConfig {
    return theme === 'light' ? Light : Dark;
  }

  handleEmojiSelect = (emoji: string) => {
    this.setState({ selectedEmoji: emoji });
    console.log(`Selected emoji: ${emoji}`);
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
  };

  handleToolSelect = (tool: string) => {
    this.setState({ activeTool: tool });
    console.log(`Selected tool: ${tool}`);
  };

  handleTimeframeSelect = (timeframe: string) => {
    this.setState({
      activeTimeframe: timeframe,
      isTimeframeModalOpen: false
    });
    console.log(`Selected timeframe: ${timeframe}`);
  };

  handleChartTypeSelect = (chartType: string) => {
    this.setState({
      activeChartType: chartType,
      isChartTypeModalOpen: false
    });
    console.log(`Selected chart type: ${chartType}`);
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

  handleAddIndicator = (indicator: string) => {
    if (!this.indicatorManager || !this.props.data) {
      console.warn('Indicator manager or data not ready');
      return;
    }
    const chartData = this.props.data.map(item => ({
      time: item.time,
      value: item.value,
      close: item.value,
      open: item.value,
      high: item.value,
      low: item.value
    }));
    const success = this.indicatorManager.addIndicator(indicator, chartData);
    if (success) {
      console.log(`Successfully added indicator: ${indicator}`);
    } else {
      console.error(`Failed to add indicator: ${indicator}`);
    }
    this.setState(prevState => {
      if (prevState.activeIndicators.includes(indicator)) {
        return {
          activeIndicators: prevState.activeIndicators.filter(item => item !== indicator),
          isIndicatorModalOpen: false
        };
      }
      return {
        activeIndicators: [...prevState.activeIndicators, indicator],
        isIndicatorModalOpen: false
      };
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
    console.log(`Trade action: ${action}`);
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
    console.log('Compare clicked');
  };

  handleReplayClick = () => {
    this.startRealTimeDataSimulation(100);
  };

  handleCloseModals = () => {
    this.setState({
      isTimeframeModalOpen: false,
      isIndicatorModalOpen: false,
      isChartTypeModalOpen: false,
      isTradeModalOpen: false,
      isSubChartModalOpen: false,
    });
  };

  addDataPoint = (newDataPoint: { time: string; value: number }) => {
    if (!this.currentSeries || !this.currentSeries.series) {
      console.warn('Chart series not initialized');
      return;
    }
    try {
      const formattedData = formatDataForSeries([newDataPoint], this.state.activeChartType);
      this.currentSeries.series.update(formattedData[0]);
      console.log('Added new data point:', newDataPoint);
    } catch (error) {
      console.error('Error adding data point:', error);
    }
  };
  addMultipleDataPoints = (newDataPoints: Array<{ time: string; value: number }>) => {
    if (!this.currentSeries || !this.currentSeries.series) {
      console.warn('Chart series not initialized');
      return;
    }
    try {
      const formattedData = formatDataForSeries(newDataPoints, this.state.activeChartType);
      const currentData = this.currentSeries.series.data || [];
      const updatedData = [...currentData, ...formattedData];
      this.currentSeries.series.setData(updatedData);
      this.chart.timeScale().fitContent();
      console.log('Added multiple data points:', newDataPoints.length);
    } catch (error) {
      console.error('Error adding multiple data points:', error);
    }
  };

  startRealTimeDataSimulation = (interval: number = 1000) => {
    if (!this.currentSeries || !this.currentSeries.series) {
      console.warn('Chart series not initialized');
      return;
    }
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
    }
    const currentData = this.currentSeries.series.data || [];
    let lastTime = currentData.length > 0 ? currentData[currentData.length - 1].time : '2024-01-07';
    let lastValue = currentData.length > 0 ? currentData[currentData.length - 1].value : 115;

    this.realTimeInterval = setInterval(() => {
      try {
        const lastDate = new Date(lastTime);
        lastDate.setDate(lastDate.getDate() + 1);
        const newTime = lastDate.toISOString().split('T')[0];

        const newValue = Number((lastValue + (Math.random() * 10 - 5)).toFixed(2));

        this.addDataPoint({
          time: newTime,
          value: newValue
        });

        lastTime = newTime;
        lastValue = newValue;

      } catch (error) {
        console.error('Error in real-time data simulation:', error);
      }
    }, interval);
  };

  stopRealTimeDataSimulation = () => {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
      this.realTimeInterval = null;
      console.log('Real-time data simulation stopped');
    }
  };

  updateChartData() {
    const { data } = this.props;
    if (this.currentSeries && this.currentSeries.series && data) {
      try {
        const formattedData = formatDataForSeries(data, this.state.activeChartType);
        this.currentSeries.series.setData(formattedData);
        this.chart.timeScale().fitContent();
      } catch (error) {
        console.error('Error updating chart data:', error);
      }
    }
  }

  switchChartType = (chartType: string) => {
    if (!this.chart || !this.props.data) {
      console.warn('Chart or data not ready');
      return;
    }

    try {
      this.currentSeries = switchChartType(
        this.chart,
        this.currentSeries,
        chartType,
        this.props.data,
        this.state.currentTheme
      );

      console.log(`Switched to chart type: ${chartType}`);
    } catch (error) {
      console.error('Error switching chart type:', error);
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

  render() {
    const { currentTheme } = this.state;
    const { height = 500, showToolbar = true, showIndicators = true } = this.props;

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
      this.state.isSubChartModalOpen;

    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: height,
        background: currentTheme.layout.background.color,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>

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
          onThemeToggle={this.handleThemeToggle}
          onTimeframeClick={this.handleTimeframeClick}
          onIndicatorClick={this.handleIndicatorClick}
          onChartTypeClick={this.handleChartTypeClick}
          onCompareClick={this.handleCompareClick}
          onFullscreenClick={this.handleFullscreen}
          onReplayClick={this.handleReplayClick}
          onTimeframeSelect={this.handleTimeframeSelect}
          onChartTypeSelect={this.handleChartTypeSelect}
          onAddIndicator={this.handleAddIndicator}
          showToolbar={showToolbar}
          onCloseModals={this.handleCloseModals}
          onSubChartClick={this.handleSubChartClick}
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
          />
          <div
            ref={this.chartContainerRef}
            style={{
              flex: 1,
              position: 'relative',
              minWidth: 0,
              minHeight: 0,
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
                chartData={this.props.data || []}
                activeIndicators={this.state.activeIndicators}
                indicatorsHeight={this.state.activeIndicators.length > 0 ? 150 : 0}
                title='BTC/USDT'
              />
            )}
          </div>
        </div>
        {this.renderTradeModal()}
      </div>
    );
  }
}
