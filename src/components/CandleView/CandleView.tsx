
import { createChart, LineSeries } from 'lightweight-charts';
import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { ThemeConfig, Dark, Light } from './CandleViewTheme';
import {
  LineToolIcon, FibonacciIcon, IndicatorIcon, SettingsIcon,
  ChartTypeIcon, TimeframeIcon, CompareIcon, FullscreenIcon,
  TradeIcon,
  BuyIcon,
  SellIcon,
  OrderIcon
} from './CandleViewIcons';
import {
  chartTypes,
  switchChartType,
  updateSeriesTheme,
  ChartSeries,
  formatDataForSeries
} from './ChartTypeManager';
import CandleViewTopPanel from './CandleViewTopPanel';
import CandleViewLeftPanel from './CandleViewLeftPanel';

export interface CandleViewProps {
  theme?: 'dark' | 'light';
  showToolbar?: boolean;
  showIndicators?: boolean;
  height?: number | string;
  data?: Array<{ time: string; value: number }>;
}

interface CandleViewState {
  isIndicatorModalOpen: boolean;
  isTimeframeModalOpen: boolean;
  isTradeModalOpen: boolean;
  isChartTypeModalOpen: boolean;
  activeTool: string | null;
  currentTheme: ThemeConfig;
  activeTimeframe: string;
  activeChartType: string;
  chartInitialized: boolean;
  isDarkTheme: boolean;
  isDrawingMode: boolean;
  drawingTool: string | null;
  isDrawingModalOpen: boolean;
}

class CandleView extends React.Component<CandleViewProps, CandleViewState> {
  static defaultProps: CandleViewProps = {
    theme: 'dark',
    showToolbar: true,
    showIndicators: true,
    height: 500,
    data: [
      { time: '2024-01-01', value: 100 },
      { time: '2024-01-02', value: 120 },
      { time: '2024-01-03', value: 90 },
      { time: '2024-01-04', value: 110 },
      { time: '2024-01-05', value: 95 },
      { time: '2024-01-06', value: 130 },
      { time: '2024-01-07', value: 115 },
    ]
  };

  private chartRef = React.createRef<HTMLDivElement>();
  private chartContainerRef = React.createRef<HTMLDivElement>();
  private timeframeModalRef = React.createRef<HTMLDivElement>();
  private indicatorModalRef = React.createRef<HTMLDivElement>();
  private drawingModalRef = React.createRef<HTMLDivElement>();

  private chartTypeModalRef = React.createRef<HTMLDivElement>();
  private tradeModalRef = React.createRef<HTMLDivElement>();
  private chart: any = null;
  private lineSeries: any = null;
  private resizeObserver: ResizeObserver | null = null;

  private realTimeInterval: NodeJS.Timeout | null = null;
  private currentSeries: ChartSeries | null = null;

  constructor(props: CandleViewProps) {
    super(props);
    this.state = {
      isIndicatorModalOpen: false,
      isTimeframeModalOpen: false,
      isTradeModalOpen: false,
      isChartTypeModalOpen: false,
      activeTool: null,
      activeTimeframe: '1D',
      activeChartType: 'line',
      currentTheme: this.getThemeConfig(props.theme || 'dark'),
      chartInitialized: false,
      isDarkTheme: props.theme === 'light' ? false : true,
      isDrawingMode: false,
      drawingTool: null,
      isDrawingModalOpen: false,
    };
  }

  componentDidMount() {
    if (this.chart) return;


    setTimeout(() => {
      this.initializeChart();
    }, 100);

    document.addEventListener('mousedown', this.handleClickOutside, true);
  }


  handleDrawingClick = () => {
    this.setState({ isDrawingModalOpen: !this.state.isDrawingModalOpen });
  };


  handleDrawingToolSelect = (tool: string) => {
    this.setState({
      drawingTool: tool,
      isDrawingMode: true,
      activeTool: tool
    });
    console.log(`Selected drawing tool: ${tool}`);
  };


  handleChartClick = (event: React.MouseEvent) => {
    if (!this.state.isDrawingMode || !this.state.drawingTool) return;

    const chartContainer = this.chartContainerRef.current;
    if (!chartContainer) return;


    const rect = chartContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log(`Drawing at position: x=${x}, y=${y}`);



  };

  componentDidUpdate(prevProps: CandleViewProps) {
    if (prevProps.theme !== this.props.theme) {
      const theme = this.props.theme || 'dark';
      this.setState({
        currentTheme: this.getThemeConfig(theme),
      });
      this.updateChartTheme();
    }

    if (prevProps.data !== this.props.data && this.lineSeries) {
      this.updateChartData();
    }


    if (!this.state.chartInitialized && this.chartContainerRef.current) {
      this.initializeChart();
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
    document.removeEventListener('mousedown', this.handleClickOutside, true);
  }




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
      }

      this.chart = createChart(this.chartRef.current, {
        width: containerWidth,
        height: containerHeight,
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
        crosshair: {
          mode: 1,
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: currentTheme.grid.vertLines.color,
        },
        rightPriceScale: {
          borderColor: currentTheme.grid.horzLines.color,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        handleScale: {
          axisPressedMouseMove: true,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
        },
      });


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
    updateSeriesTheme(this.currentSeries, currentTheme);
  }

  getThemeConfig(theme: 'dark' | 'light'): ThemeConfig {
    return theme === 'light' ? Light : Dark;
  }

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

  handleChartTypeClick = () => {
    this.setState({ isChartTypeModalOpen: !this.state.isChartTypeModalOpen });
  };

  addMultipleDataPoints = (newDataPoints: Array<{ time: string; value: number }>) => {
    if (!this.lineSeries) {
      console.warn('Line series not initialized');
      return;
    }
    try {
      const formattedData = newDataPoints.map(item => ({
        time: item.time,
        value: Number(item.value)
      }));
      const currentData = this.lineSeries.data || [];
      const updatedData = [...currentData, ...formattedData];
      this.lineSeries.setData(updatedData);
      this.chart.timeScale().fitContent();
      console.log('Added multiple data points:', newDataPoints.length);
    } catch (error) {
      console.error('Error adding multiple data points:', error);
    }
  };
  startRealTimeDataSimulation = (interval: number = 1000) => {
    if (!this.lineSeries) {
      console.warn('Line series not initialized');
      return;
    }
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
    }
    const currentData = this.lineSeries.data || [];
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



  handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;

    console.log('Click outside detected, target:', target.className);

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

    const shouldCloseDrawingModal =
      this.state.isDrawingModalOpen &&
      !target.closest('.drawing-button') &&
      !target.closest('[data-drawing-modal]');

    console.log('Should close modals:', {
      timeframe: shouldCloseTimeframeModal,
      indicator: shouldCloseIndicatorModal,
      trade: shouldCloseTradeModal,
      chartType: shouldCloseChartTypeModal
    });

    if (shouldCloseDrawingModal) {
      console.log('Closing drawing modal');
      this.setState({ isDrawingModalOpen: false });
    }

    if (shouldCloseTimeframeModal) {
      console.log('Closing timeframe modal');
      this.setState({ isTimeframeModalOpen: false });
    }

    if (shouldCloseIndicatorModal) {
      console.log('Closing indicator modal');
      this.setState({ isIndicatorModalOpen: false });
    }

    if (shouldCloseTradeModal) {
      console.log('Closing trade modal');
      this.setState({ isTradeModalOpen: false });
    }

    if (shouldCloseChartTypeModal) {
      console.log('Closing chart type modal');
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

      this.setState({
        activeChartType: chartType,
        isChartTypeModalOpen: false
      });

      console.log(`Switched to chart type: ${chartType}`);
    } catch (error) {
      console.error('Error switching chart type:', error);
    }
  };

  handleCloseChartTypeModal = () => {
    this.setState({ isChartTypeModalOpen: false });
  };

  handleTimeframeClick = () => {
    this.setState({ isTimeframeModalOpen: !this.state.isTimeframeModalOpen });
  };

  handleIndicatorClick = () => {
    this.setState({ isIndicatorModalOpen: !this.state.isIndicatorModalOpen });
  };

  handleTradeClick = () => {
    this.setState({ isTradeModalOpen: !this.state.isTradeModalOpen });
  };

  handleAddIndicator = (indicator: string) => {
    console.log(`Adding indicator: ${indicator}`);
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


  renderLeftToolbar() {
    const { currentTheme, activeTool, isDrawingMode } = this.state;
    const { showToolbar = true } = this.props;

    if (!showToolbar) return null;

    const drawingTools = [
      { id: 'line', icon: LineToolIcon, title: 'TrendLine' },
      { id: 'fibonacci', icon: FibonacciIcon, title: 'Fibonacci' },
    ];

    const analysisTools = [
      { id: 'settings', icon: SettingsIcon, title: 'Setting' },
    ];

    const tradeTools = [
      { id: 'trade', icon: TradeIcon, title: 'Trade' },
      { id: 'buy', icon: BuyIcon, title: 'Buy' },
      { id: 'sell', icon: SellIcon, title: 'Sell' },
      { id: 'orders', icon: OrderIcon, title: 'Order' },
    ];

    return (
      <div style={{
        background: currentTheme.toolbar.background,
        borderRight: `1px solid ${currentTheme.toolbar.border}`,
        display: 'flex',
        flexDirection: 'column',
        width: '50px',
        boxSizing: 'border-box',
        height: '100%',
        overflow: 'hidden',
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }} className="custom-scrollbar">

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tradeTools.map(tool => {
              const IconComponent = tool.icon;
              const isActive = activeTool === tool.id;

              return (
                <button
                  key={tool.id}
                  title={tool.title}
                  onClick={() => tool.id === 'trade'
                    ? this.handleTradeClick()
                    : this.handleToolSelect(tool.id)
                  }
                  className={tool.id === 'trade' ? 'trade-button' : ''}
                  style={{
                    background: isActive
                      ? currentTheme.toolbar.button.active
                      : 'transparent',
                    border: 'none',
                    borderRadius: '0px',
                    padding: '0px',
                    cursor: 'pointer',
                    color: currentTheme.toolbar.button.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    height: '38px',
                    width: '38px',
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
                  <IconComponent
                    size={20}
                    color={currentTheme.toolbar.button.color}
                  />
                </button>
              );
            })}
          </div>

          <div style={{
            height: '1px',
            background: currentTheme.toolbar.border,
            margin: '10px 0',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {drawingTools.map((tool, index) => {
              const IconComponent = tool.icon;
              const isActive = activeTool === tool.id || (isDrawingMode && tool.id === 'line');

              return (
                <button
                  key={tool.id}
                  title={tool.title}
                  onClick={() => {
                    if (index === 0) {
                      this.handleDrawingToolSelect('line');
                    } else {
                      this.handleToolSelect(tool.id);
                    }
                  }}
                  style={{
                    background: isActive
                      ? currentTheme.toolbar.button.active
                      : 'transparent',
                    border: isDrawingMode && tool.id === 'line'
                      ? `2px solid ${currentTheme.toolbar.button.active}`
                      : 'none',
                    borderRadius: '0px',
                    padding: '0px',
                    cursor: 'pointer',
                    color: isActive
                      ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                      : currentTheme.toolbar.button.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    height: '38px',
                    width: '38px',
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
                  <IconComponent
                    size={20}
                    color={isActive
                      ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                      : currentTheme.toolbar.button.color}
                  />
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysisTools.map(tool => {
              const IconComponent = tool.icon;
              const isActive = activeTool === tool.id;

              return (
                <button
                  key={tool.id}
                  title={tool.title}
                  onClick={() => this.handleToolSelect(tool.id)}
                  className={tool.id === 'indicators' ? 'indicator-button' : ''}
                  style={{
                    background: isActive
                      ? currentTheme.toolbar.button.active
                      : 'transparent',
                    border: 'none',
                    borderRadius: '0px',
                    padding: '0px',
                    cursor: 'pointer',
                    color: currentTheme.toolbar.button.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    height: '38px',
                    width: '38px',
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
                  <IconComponent
                    size={20}
                    color={currentTheme.toolbar.button.color}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {isDrawingMode && (
          <div style={{
            padding: '8px',
            background: currentTheme.toolbar.button.active,
            color: currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor,
            fontSize: '11px',
            textAlign: 'center',
            borderTop: `1px solid ${currentTheme.toolbar.border}`
          }}>
            Drawing Mode: Line
            <button
              onClick={() => this.setState({ isDrawingMode: false, drawingTool: null })}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                marginLeft: '8px',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

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

  handleCloseDrawingModal = () => {
    this.setState({ isDrawingModalOpen: false });
  };

  render() {
    const { currentTheme } = this.state;
    const { height = 500 } = this.props;

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
      this.state.isDrawingModalOpen;

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
            onClick={() => {
              this.setState({
                isTimeframeModalOpen: false,
                isIndicatorModalOpen: false,
                isTradeModalOpen: false,
                isChartTypeModalOpen: false,
                isDrawingModalOpen: false,
              });
            }}
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
          onThemeToggle={this.handleThemeToggle}
          onTimeframeClick={this.handleTimeframeClick}
          onIndicatorClick={this.handleIndicatorClick}
          onChartTypeClick={this.handleChartTypeClick}
          onCompareClick={() => console.log('Compare clicked')}
          onFullscreenClick={this.handleFullscreen}
          onReplayClick={() => this.startRealTimeDataSimulation(100)}
          onTimeframeSelect={this.handleTimeframeSelect}
          onChartTypeSelect={this.handleChartTypeSelect}
          onAddIndicator={this.handleAddIndicator}
          showToolbar={this.props.showToolbar}
          onCloseModals={() => {
            this.setState({
              isTimeframeModalOpen: false,
              isIndicatorModalOpen: false,
              isChartTypeModalOpen: false,
              isTradeModalOpen: false,
              isDrawingModalOpen: false,
            });
          }}
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
            isDrawingMode={this.state.isDrawingMode}
            onToolSelect={this.handleToolSelect}
            onDrawingToolSelect={this.handleDrawingToolSelect}
            onTradeClick={this.handleTradeClick}
            onExitDrawingMode={() => this.setState({ isDrawingMode: false, drawingTool: null })}
            showToolbar={this.props.showToolbar}
            isDrawingModalOpen={this.state.isDrawingModalOpen}
            onDrawingClick={this.handleDrawingClick}
            onCloseDrawingModal={() => this.setState({ isDrawingModalOpen: false })}
            drawingModalRef={this.drawingModalRef}
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
          </div>
        </div>
        {this.renderTradeModal()}
      </div>
    );
  }
}

export default CandleView;
