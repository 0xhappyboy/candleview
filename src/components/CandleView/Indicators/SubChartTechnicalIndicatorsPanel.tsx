import React from 'react';
import { ThemeConfig } from '../CandleViewTheme';
import { RSIIndicator } from './SubChart/RSIIndicator';
import { MACDIndicator } from './SubChart/MACDIndicator';
import { VolumeIndicator } from './SubChart/VolumeIndicator';
import { SARIndicator } from './SubChart/SARIndicator';
import { KDJIndicator } from './SubChart/KDJIndicator';
import { ATRIndicator } from './SubChart/ATRIndicator';
import { StochasticIndicator } from './SubChart/StochasticIndicator';
import { CCIIndicator } from './SubChart/CCIIndicator';
import { BBWidthIndicator } from './SubChart/BBWidthIndicator';
import { ADXIndicator } from './SubChart/ADXIndicator';
import { OBVIndicator } from './SubChart/OBVIndicator';
import { ChartType, ICandleViewDataPoint, SubChartIndicatorType } from '../types';

interface SubChartTechnicalIndicatorsPanelProps {
  currentTheme: ThemeConfig;
  chartData: ICandleViewDataPoint[];
  selectedSubChartIndicators: SubChartIndicatorType[];
  height?: number;
  handleRemoveSubChartIndicator?: (type: SubChartIndicatorType) => void;
  candleViewContainerRef?: React.RefObject<HTMLDivElement | null>;

  adxChartVisibleRange?: { from: number; to: number } | null;
  atrChartVisibleRange?: { from: number; to: number } | null;
  bbwidthChartVisibleRange?: { from: number; to: number } | null;
  cciChartVisibleRange?: { from: number; to: number } | null;
  kdjChartVisibleRange?: { from: number; to: number } | null;
  macdChartVisibleRange?: { from: number; to: number } | null;
  obvhartVisibleRange?: { from: number; to: number } | null;
  rsiChartVisibleRange?: { from: number; to: number } | null;
  sarChartVisibleRange?: { from: number; to: number } | null;
  volumeChartVisibleRange?: { from: number; to: number } | null;

  updateChartVisibleRange?: (chartType: ChartType, subChartType: SubChartIndicatorType | null, visibleRange: { from: number; to: number } | null) => void;
}

interface SubChartTechnicalIndicatorsPanelState {
  indicatorHeights: number[];
  isResizing: boolean;
  resizingIndex: number | null;
}

export class SubChartTechnicalIndicatorsPanel extends React.Component<
  SubChartTechnicalIndicatorsPanelProps,
  SubChartTechnicalIndicatorsPanelState
> {
  private startY = 0;
  private startHeights: number[] = [];
  private containerRef = React.createRef<HTMLDivElement>();
  private isComponentMounted = false;
  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private mouseUpHandler: ((e: MouseEvent) => void) | null = null;

  constructor(props: SubChartTechnicalIndicatorsPanelProps) {
    super(props);

    const initialHeights = this.calculateInitialHeights();
    this.state = {
      indicatorHeights: initialHeights,
      isResizing: false,
      resizingIndex: null
    };

    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.mouseUpHandler = this.handleMouseUp.bind(this);
  }

  componentDidMount() {
    this.isComponentMounted = true;
  }

  componentDidUpdate(prevProps: SubChartTechnicalIndicatorsPanelProps) {
    if (
      prevProps.selectedSubChartIndicators.length !== this.props.selectedSubChartIndicators.length ||
      prevProps.height !== this.props.height
    ) {
      const newHeights = this.calculateInitialHeights();
      this.safeSetState({ indicatorHeights: newHeights });
    }
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
    this.cleanupEventListeners();
  }

  cleanupEventListeners = () => {
    if (this.mouseMoveHandler) {
      document.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    if (this.mouseUpHandler) {
      document.removeEventListener('mouseup', this.mouseUpHandler);
    }
  };

  calculateInitialHeights = () => {
    const { selectedSubChartIndicators, height = 200 } = this.props;
    if (selectedSubChartIndicators.length === 0) return [];
    const separatorHeight = 1;
    const totalSeparatorHeight = separatorHeight * (selectedSubChartIndicators.length - 1);
    const availableChartHeight = height - totalSeparatorHeight;
    const baseHeightPerIndicator = availableChartHeight / selectedSubChartIndicators.length;
    return Array(selectedSubChartIndicators.length).fill(baseHeightPerIndicator);
  };

  calculateHeightLimits = (index: number) => {
    const { selectedSubChartIndicators, height = 200 } = this.props;
    const { indicatorHeights } = this.state;
    const separatorHeight = 1;
    const totalSeparatorHeight = separatorHeight * (selectedSubChartIndicators.length - 1);
    const availableChartHeight = height - totalSeparatorHeight;
    const minHeight = 40;
    const otherIndicatorsMinHeight = (selectedSubChartIndicators.length - 2) * minHeight;
    const maxPairHeight = availableChartHeight - otherIndicatorsMinHeight;
    const currentPairMaxHeight = Math.max(maxPairHeight, minHeight * 2);
    return {
      minHeight,
      maxUpperHeight: currentPairMaxHeight - minHeight,
      maxLowerHeight: currentPairMaxHeight - minHeight
    };
  };

  handleMouseMove(moveEvent: MouseEvent) {
    if (!this.isComponentMounted || !this.state.isResizing) return;
    requestAnimationFrame(() => {
      if (!this.isComponentMounted || !this.state.isResizing) return;
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaY = moveEvent.clientY - this.startY;
      const { resizingIndex } = this.state;
      if (resizingIndex === null) return;
      const newHeights = [...this.startHeights];
      const upperHeight = newHeights[resizingIndex];
      const lowerHeight = newHeights[resizingIndex + 1];
      const { minHeight, maxUpperHeight, maxLowerHeight } = this.calculateHeightLimits(resizingIndex);
      let newUpperHeight = upperHeight + deltaY;
      let newLowerHeight = lowerHeight - deltaY;
      newUpperHeight = Math.max(minHeight, newUpperHeight);
      newLowerHeight = Math.max(minHeight, newLowerHeight);
      newUpperHeight = Math.min(maxUpperHeight, newUpperHeight);
      newLowerHeight = Math.min(maxLowerHeight, newLowerHeight);
      const totalHeight = upperHeight + lowerHeight;
      const newTotalHeight = newUpperHeight + newLowerHeight;
      if (Math.abs(newTotalHeight - totalHeight) > 0.1) {
        if (newUpperHeight >= maxUpperHeight) {
          newLowerHeight = totalHeight - newUpperHeight;
        } else if (newLowerHeight >= maxLowerHeight) {
          newUpperHeight = totalHeight - newLowerHeight;
        }
      }
      newUpperHeight = Math.max(minHeight, newUpperHeight);
      newLowerHeight = Math.max(minHeight, newLowerHeight);
      if (newUpperHeight >= minHeight &&
        newLowerHeight >= minHeight &&
        newUpperHeight <= maxUpperHeight &&
        newLowerHeight <= maxLowerHeight) {
        newHeights[resizingIndex] = newUpperHeight;
        newHeights[resizingIndex + 1] = newLowerHeight;
        this.safeSetState({ indicatorHeights: newHeights });
        this.startY = moveEvent.clientY;
        this.startHeights = newHeights;
      }
    });
  }

  handleMouseUp(upEvent: MouseEvent) {
    if (!this.isComponentMounted) return;
    upEvent.preventDefault();
    upEvent.stopPropagation();
    this.safeSetState({
      isResizing: false,
      resizingIndex: null
    });
    this.cleanupEventListeners();
  }

  handleResizeMouseDown = (index: number, e: React.MouseEvent) => {
    if (!this.isComponentMounted) return;
    e.preventDefault();
    e.stopPropagation();
    this.startY = e.clientY;
    this.startHeights = [...this.state.indicatorHeights];
    this.safeSetState({
      isResizing: true,
      resizingIndex: index
    });
    if (this.mouseMoveHandler && this.mouseUpHandler) {
      document.addEventListener('mousemove', this.mouseMoveHandler);
      document.addEventListener('mouseup', this.mouseUpHandler, { once: true });
    }
  };

  handleDoubleClick = (chartRef: React.MutableRefObject<any>) => {
    return () => {
      if (!this.isComponentMounted) return;
      if (chartRef.current) {
        try {
          if (chartRef.current &&
            typeof chartRef.current.timeScale === 'function' &&
            chartRef.current.timeScale()) {
            chartRef.current.timeScale().fitContent();
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.debug('Chart reset error:', error);
          }
        }
      }
    };
  };

  safeSetState = (state: Partial<SubChartTechnicalIndicatorsPanelState>) => {
    if (this.isComponentMounted) {
      this.setState(state as any);
    }
  };

  resetHeights = () => {
    if (!this.isComponentMounted) return;
    const newHeights = this.calculateInitialHeights();
    this.safeSetState({ indicatorHeights: newHeights });
  };

  render() {
    const { currentTheme, chartData, selectedSubChartIndicators, height = 200 } = this.props;
    const { indicatorHeights, isResizing, resizingIndex } = this.state;
    if (selectedSubChartIndicators.length === 0) return null;
    const timeScaleHeight = 30;
    const separatorHeight = 1;
    return (
      <div
        ref={this.containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: `${height}px`,
          background: currentTheme.layout.background.color,
          pointerEvents: isResizing ? 'none' : 'auto',
        }}
      >
        {selectedSubChartIndicators.map((indicatorType, index) => {
          const exactHeight = indicatorHeights[index] || this.calculateInitialHeights()[index];
          const chartHeight = Math.max(10, exactHeight - timeScaleHeight);
          const props = {
            theme: currentTheme,
            data: chartData,
            height: exactHeight,
            chartHeight: chartHeight,
            width: '100%',
            onDoubleClick: this.handleDoubleClick,
            handleRemoveSubChartIndicator: this.props.handleRemoveSubChartIndicator,
            isComponentMounted: this.isComponentMounted,
            candleViewContainerRef: this.props.candleViewContainerRef,
            updateChartVisibleRange: this.props.updateChartVisibleRange
          };
          return (
            <React.Fragment key={`${indicatorType}-${index}-${exactHeight}`}>
              {index > 0 && (
                <>
                  <div
                    style={{
                      height: `${separatorHeight}px`,
                      background: currentTheme.toolbar.border,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    onMouseDown={(e) => this.handleResizeMouseDown(index - 1, e)}
                    style={{
                      height: '6px',
                      background: isResizing && resizingIndex === index - 1
                        ? currentTheme.toolbar.button.hover
                        : currentTheme.toolbar.border,
                      cursor: isResizing ? 'grabbing' : 'row-resize',
                      position: 'relative',
                      zIndex: 10,
                      transition: isResizing ? 'none' : 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      pointerEvents: 'auto',
                    }}
                    onMouseEnter={(e) => {
                      if (!isResizing && this.isComponentMounted) {
                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if ((!isResizing || resizingIndex !== index - 1) && this.isComponentMounted) {
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
                </>
              )}
              <div
                style={{
                  height: `${exactHeight}px`,
                  minHeight: '40px',
                  overflow: 'hidden',
                  position: 'relative',
                  flexShrink: 0,
                  pointerEvents: isResizing ? 'none' : 'auto',
                }}
              >
                {(() => {
                  switch (indicatorType) {
                    case SubChartIndicatorType.RSI:
                      return <RSIIndicator {...props} rsiChartVisibleRange={this.props.rsiChartVisibleRange} />;
                    case SubChartIndicatorType.MACD:
                      return <MACDIndicator {...props} />;
                    case SubChartIndicatorType.VOLUME:
                      return <VolumeIndicator {...props} />;
                    case SubChartIndicatorType.SAR:
                      return <SARIndicator {...props} />;
                    case SubChartIndicatorType.KDJ:
                      return <KDJIndicator {...props} />;
                    case SubChartIndicatorType.ATR:
                      return <ATRIndicator {...props} />;
                    case SubChartIndicatorType.STOCHASTIC:
                      return <StochasticIndicator {...props} />;
                    case SubChartIndicatorType.CCI:
                      return <CCIIndicator {...props} />;
                    case SubChartIndicatorType.BBWIDTH:
                      return <BBWidthIndicator {...props} />;
                    case SubChartIndicatorType.ADX:
                      return <ADXIndicator {...props} adxChartVisibleRange={this.props.adxChartVisibleRange}/>;
                    case SubChartIndicatorType.OBV:
                      return <OBVIndicator {...props} />;
                    default:
                      return null;
                  }
                })()}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}