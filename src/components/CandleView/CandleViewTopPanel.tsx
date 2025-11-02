import React from 'react';
import { ThemeConfig } from './CandleViewTheme';
import { TimeframeIcon, IndicatorIcon, ChartTypeIcon, CompareIcon, FullscreenIcon } from './CandleViewIcons';
import { chartTypes } from './ChartTypeManager';

interface CandleViewTopPanelProps {
  currentTheme: ThemeConfig;
  activeTimeframe: string;
  activeChartType: string;
  isDarkTheme: boolean;
  isTimeframeModalOpen: boolean;
  isIndicatorModalOpen: boolean;
  isChartTypeModalOpen: boolean;
  onThemeToggle: () => void;
  onTimeframeClick: () => void;
  onIndicatorClick: () => void;
  onChartTypeClick: () => void;
  onCompareClick: () => void;
  onFullscreenClick: () => void;
  onReplayClick: () => void;
  onTimeframeSelect: (timeframe: string) => void;
  onChartTypeSelect: (chartType: string) => void;
  onAddIndicator: (indicator: string) => void;
  showToolbar?: boolean;
  onCloseModals?: () => void;
}

const CandleViewTopPanel: React.FC<CandleViewTopPanelProps> = ({
  currentTheme,
  activeTimeframe,
  activeChartType,
  isDarkTheme,
  isTimeframeModalOpen,
  isIndicatorModalOpen,
  isChartTypeModalOpen,
  onThemeToggle,
  onTimeframeClick,
  onIndicatorClick,
  onChartTypeClick,
  onCompareClick,
  onFullscreenClick,
  onReplayClick,
  onTimeframeSelect,
  onChartTypeSelect,
  onAddIndicator,
  showToolbar = true,
  onCloseModals,
}) => {
  const timeframeModalRef = React.useRef<HTMLDivElement>(null);
  const chartTypeModalRef = React.useRef<HTMLDivElement>(null);
  const indicatorModalRef = React.useRef<HTMLDivElement>(null);
  const subChartModalRef = React.useRef<HTMLDivElement>(null);

  // 新增状态管理副图指标弹窗
  const [isSubChartModalOpen, setIsSubChartModalOpen] = React.useState(false);

  const handleTimeframeSelect = (timeframe: string) => {
    console.log('Selecting timeframe:', timeframe);
    onTimeframeSelect(timeframe);
    if (onCloseModals) {
      onCloseModals();
    }
  };

  const handleChartTypeSelect = (chartType: string) => {
    console.log('Selecting chart type:', chartType);
    onChartTypeSelect(chartType);
    if (onCloseModals) {
      onCloseModals();
    }
  };

  // 在 CandleViewTopPanel.tsx 中修改 handleAddIndicator 方法
  const handleAddIndicator = (indicator: string) => {
    console.log('Adding indicator to sub-chart only:', indicator);

    // 只添加到副图面板，不添加到主图表
    onAddIndicator(indicator);

    if (onCloseModals) {
      onCloseModals();
    }
  };

  const handleCloseTimeframeModal = () => {
    console.log('Closing timeframe modal');
    if (onCloseModals) {
      onCloseModals();
    }
  };

  const handleCloseChartTypeModal = () => {
    console.log('Closing chart type modal');
    if (onCloseModals) {
      onCloseModals();
    }
  };

  const handleCloseIndicatorModal = () => {
    console.log('Closing indicator modal');
    if (onCloseModals) {
      onCloseModals();
    }
  };

  // 新增副图指标弹窗控制方法
  const handleSubChartClick = () => {
    setIsSubChartModalOpen(!isSubChartModalOpen);
  };

  const handleCloseSubChartModal = () => {
    setIsSubChartModalOpen(false);
    if (onCloseModals) {
      onCloseModals();
    }
  };

  if (!showToolbar) return null;

  const mainButtons = [
    { id: 'alert', label: 'Hint', icon: null },
    { id: 'replay', label: 'Replay', icon: null },
  ];

  const timeframeGroups = [
    {
      title: 'Commonly',
      timeframes: ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M']
    },
    {
      title: 'Second',
      timeframes: ['1s', '5s', '15s', '30s']
    },
    {
      title: 'Minute',
      timeframes: ['1m', '3m', '5m', '15m', '30m', '45m']
    },
    {
      title: 'Hour',
      timeframes: ['1H', '2H', '3H', '4H', '6H', '8H', '12H']
    },
    {
      title: 'day,week,month',
      timeframes: ['1D', '3D', '1W', '2W', '1M', '3M', '6M']
    }
  ];

  // 主图指标（在主图显示的指标）
  // 主图指标（在主图显示的指标）
  const mainIndicators = [
    { id: 'ma', name: 'Moving Average (MA)', icon: '📊' },
    { id: 'ema', name: 'Exponential Moving Average (EMA)', icon: '📈' },
    { id: 'bollinger', name: 'Bollinger Bands', icon: '📉' },
    { id: 'ichimoku', name: 'Ichimoku Cloud', icon: '☁️' },
    { id: 'donchian', name: 'Donchian Channel', icon: '📐' },
    { id: 'envelope', name: 'Envelope', icon: '📨' },
    { id: 'vwap', name: 'Volume Weighted Average Price (VWAP)', icon: '⚖️' },
  ];

  // 副图指标（在副图显示的指标）
  const subChartIndicators = [
    { id: 'rsi', name: 'Relative Strength Index (RSI)', icon: '⚡' },
    { id: 'macd', name: 'MACD', icon: '🔍' },
    { id: 'volume', name: 'Volume', icon: '📦' },
    { id: 'sar', name: 'Parabolic SAR (SAR)', icon: '🔄' },
    { id: 'kdj', name: 'KDJ', icon: '🎯' },
    { id: 'atr', name: 'Average True Range (ATR)', icon: '📏' },
    { id: 'stochastic', name: 'Stochastic Oscillator', icon: '🔄' },
    { id: 'cci', name: 'Commodity Channel Index (CCI)', icon: '📊' },
    { id: 'bbwidth', name: 'Bollinger Bands Width', icon: '📈' },
    { id: 'adx', name: 'Average Directional Index (ADX)', icon: '🎯' },
    { id: 'obv', name: 'On Balance Volume (OBV)', icon: '💧' },
  ];

  const renderTimeframeModal = () => {
    if (!isTimeframeModalOpen) return null;
    return (
      <div
        ref={timeframeModalRef}
        data-timeframe-modal="true"
        style={{
          position: 'absolute',
          top: '43px',
          left: '0px',
          zIndex: 1000,
          background: currentTheme.toolbar.background,
          border: `1px solid ${currentTheme.toolbar.border}`,
          borderRadius: '8px',
          padding: '16px',
          minWidth: '220px',
          maxHeight: '400px',
          overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        }}
        className="modal-scrollbar"
      >
        {/* 时间周期弹窗内容保持不变 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h3 style={{
            margin: 0,
            color: currentTheme.layout.textColor,
            fontSize: '14px',
            fontWeight: '600',
          }}>
            Select Time
          </h3>
          <button
            onClick={handleCloseTimeframeModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentTheme.layout.textColor,
              cursor: 'pointer',
              fontSize: '14px',
              padding: '6px 10px',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
              minWidth: '32px',
              minHeight: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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

        {timeframeGroups.map((group, index) => (
          <div key={group.title} style={{
            marginBottom: index < timeframeGroups.length - 1 ? '16px' : '0'
          }}>
            <div style={{
              color: currentTheme.layout.textColor,
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '10px',
              opacity: 0.8,
              paddingLeft: '4px',
            }}>
              {group.title}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
            }}>
              {group.timeframes.map(timeframe => (
                <button
                  key={timeframe}
                  onClick={() => handleTimeframeSelect(timeframe)}
                  style={{
                    background: activeTimeframe === timeframe
                      ? currentTheme.toolbar.button.active
                      : 'transparent',
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '6px',
                    padding: '10px 6px',
                    cursor: 'pointer',
                    color: currentTheme.toolbar.button.color,
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    minHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTimeframe !== timeframe) {
                      e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTimeframe !== timeframe) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderChartTypeModal = () => {
    if (!isChartTypeModalOpen) return null;

    return (
      <div
        ref={chartTypeModalRef}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {chartTypes.map(chartType => {
            const IconComponent = ChartTypeIcon;
            const isActive = activeChartType === chartType.id;

            return (
              <button
                key={chartType.id}
                onClick={() => handleChartTypeSelect(chartType.id)}
                style={{
                  background: isActive
                    ? currentTheme.toolbar.button.active
                    : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  color: isActive
                    ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                    : currentTheme.toolbar.button.color,
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minHeight: '40px',
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

  const renderIndicatorModal = () => {
    if (!isIndicatorModalOpen) return null;
    return (
      <div
        ref={indicatorModalRef}
        data-indicator-modal="true"
        style={{
          position: 'absolute',
          top: '43px',
          zIndex: 1000,
          background: currentTheme.toolbar.background,
          border: `1px solid ${currentTheme.toolbar.border}`,
          borderRadius: '8px',
          padding: '8px',
          minWidth: '200px',
          maxHeight: '400px',
          overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        }}
        className="modal-scrollbar"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {mainIndicators.map(indicator => (
            <button
              key={indicator.id}
              onClick={() => handleAddIndicator(indicator.id)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                fontSize: '16px',
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
          ))}
        </div>
      </div>
    );
  };

  // 新增副图指标弹窗渲染
  const renderSubChartModal = () => {
    if (!isSubChartModalOpen) return null;
    return (
      <div
        ref={subChartModalRef}
        data-subchart-modal="true"
        style={{
          position: 'absolute',
          top: '43px',
          zIndex: 1000,
          background: currentTheme.toolbar.background,
          border: `1px solid ${currentTheme.toolbar.border}`,
          borderRadius: '8px',
          padding: '8px',
          minWidth: '200px',
          maxHeight: '400px',
          overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        }}
        className="modal-scrollbar"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {subChartIndicators.map(indicator => (
            <button
              key={indicator.id}
              onClick={() => handleAddIndicator(indicator.id)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                fontSize: '16px',
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
          ))}
        </div>
      </div>
    );
  };

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
      gap: '15px',
      position: 'relative',
    }}>
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
            border: `1px solid ${currentTheme.toolbar.border}`,
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        {mainButtons.map(button => (
          <button
            key={button.id}
            onClick={onReplayClick}
            style={{
              background: 'transparent',
              border: `1px solid ${currentTheme.toolbar.border}`,
              borderRadius: '3px',
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
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={onTimeframeClick}
          className="timeframe-button"
          style={{
            background: isTimeframeModalOpen
              ? currentTheme.toolbar.button.active
              : 'transparent',
            border: `1px solid ${currentTheme.toolbar.border}`,
            borderRadius: '3px',
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
        {renderTimeframeModal()}
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={onChartTypeClick}
          className="chart-type-button"
          style={{
            background: isChartTypeModalOpen
              ? currentTheme.toolbar.button.active
              : 'transparent',
            border: `1px solid ${currentTheme.toolbar.border}`,
            borderRadius: '3px',
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
        {renderChartTypeModal()}
      </div>

      {/* 主图指标按钮 */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={onIndicatorClick}
          className="indicator-button"
          style={{
            background: isIndicatorModalOpen
              ? currentTheme.toolbar.button.active
              : 'transparent',
            border: `1px solid ${currentTheme.toolbar.border}`,
            borderRadius: '3px',
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
        {renderIndicatorModal()}
      </div>

      {/* 新增副图指标按钮 */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={handleSubChartClick}
          className="subchart-button"
          style={{
            background: isSubChartModalOpen
              ? currentTheme.toolbar.button.active
              : 'transparent',
            border: `1px solid ${currentTheme.toolbar.border}`,
            borderRadius: '3px',
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
        {renderSubChartModal()}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <button
          title="Contrast"
          onClick={onCompareClick}
          style={{
            background: 'transparent',
            border: `1px solid ${currentTheme.toolbar.border}`,
            borderRadius: '3px',
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

        <button
          title="Full Screen"
          onClick={onFullscreenClick}
          style={{
            background: 'transparent',
            border: `1px solid ${currentTheme.toolbar.border}`,
            borderRadius: '3px',
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
      </div>
    </div>
  );
};

export default CandleViewTopPanel;