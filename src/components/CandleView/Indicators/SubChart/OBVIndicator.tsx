import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';
import ReactDOM from 'react-dom';
import { SubChartIndicatorType, ICandleViewDataPoint } from '../../types';

interface OBVIndicatorProps {
  theme: ThemeConfig;
  data: ICandleViewDataPoint[];
  height: number;
  width?: string;
  handleRemoveSubChartIndicator?: (indicatorType: SubChartIndicatorType) => void;
  onOpenSettings?: () => void;
  candleViewContainerRef?: React.RefObject<HTMLDivElement | null>;
}

interface OBVIndicatorParam {
  paramName: string;
  lineColor: string;
  lineWidth: number;
}

interface OBVIndicatorInfo {
  id: string;
  params: OBVIndicatorParam[];
  nonce: number;
}

interface OBVSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (indicator: OBVIndicatorInfo) => void;
  initialIndicator?: OBVIndicatorInfo | null;
  theme?: ThemeConfig;
  parentRef?: React.RefObject<HTMLDivElement | null>;
}

const OBVSettingModal: React.FC<OBVSettingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialIndicator = null,
  theme,
  parentRef
}) => {
  const [indicator, setIndicator] = useState<OBVIndicatorInfo | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialIndicator) {
      setIndicator(initialIndicator);
    } else {
      const defaultIndicator: OBVIndicatorInfo = {
        id: Date.now().toString(),
        params: [
          {
            paramName: 'OBV',
            lineColor: '#2196F3',
            lineWidth: 1
          }
        ],
        nonce: Date.now()
      };
      setIndicator(defaultIndicator);
    }
  }, [initialIndicator, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const calculatePosition = () => {
        if (parentRef?.current) {
          const candleViewRect = parentRef.current.getBoundingClientRect();
          const modalWidth = 400;
          const modalHeight = 300;
          const x = candleViewRect.left + (candleViewRect.width - modalWidth) / 2;
          const y = candleViewRect.top + (candleViewRect.height - modalHeight) / 2;
          return {
            x: Math.max(10, x),
            y: Math.max(10, y)
          };
        } else {
          const x = Math.max(10, (window.innerWidth - 400) / 2);
          const y = Math.max(10, (window.innerHeight - 300) / 2);
          return { x, y };
        }
      };
      setModalPosition(calculatePosition());
    }
  }, [isOpen, parentRef]);

  const updateIndicatorColor = (paramIndex: number, color: string) => {
    if (!indicator || !indicator.params) return;
    const newParams = [...indicator.params];
    newParams[paramIndex] = { ...newParams[paramIndex], lineColor: color };
    setIndicator({
      ...indicator,
      params: newParams
    });
  };

  const updateIndicatorLineWidth = (paramIndex: number, lineWidth: number) => {
    if (!indicator || !indicator.params) return;
    const newParams = [...indicator.params];
    newParams[paramIndex] = { ...newParams[paramIndex], lineWidth };
    setIndicator({
      ...indicator,
      params: newParams
    });
  };

  const getRandomColor = () => {
    const colors = [
      theme?.chart?.lineColor || '#2962FF',
      theme?.chart?.upColor || '#00C087',
      theme?.chart?.downColor || '#FF5B5A',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#FF6B6B',
      '#556270'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleConfirm = () => {
    if (indicator) {
      onConfirm(indicator);
    }
  };

  const handleCancel = () => {
    if (initialIndicator) {
      setIndicator(initialIndicator);
    }
    onClose();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === headerRef.current || headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      const rect = modalRef.current!.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        const maxX = window.innerWidth - 400;
        const maxY = window.innerHeight - 300;
        setModalPosition({
          x: Math.max(10, Math.min(newX, maxX)),
          y: Math.max(10, Math.min(newY, maxY))
        });
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const scrollbarStyle: React.CSSProperties = {
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme?.toolbar?.border || '#d9d9d9'} ${theme?.toolbar?.background || '#fafafa'}`,
  };

  const webkitScrollbarStyle = `
        .obv-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .obv-scrollbar::-webkit-scrollbar-track {
            background: ${theme?.toolbar?.background || '#fafafa'};
            border-radius: 3px;
        }
        .obv-scrollbar::-webkit-scrollbar-thumb {
            background: ${theme?.toolbar?.border || '#d9d9d9'};
            border-radius: 3px;
        }
        .obv-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${theme?.layout?.textColor || '#000000'}80;
        }
    `;

  const modalContentStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${modalPosition.x}px`,
    top: `${modalPosition.y}px`,
    background: theme?.toolbar?.background || '#fafafa',
    border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
    borderRadius: '8px',
    padding: '0',
    width: '400px',
    maxWidth: '90vw',
    height: '300px',
    maxHeight: '80vh',
    zIndex: 10000,
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    cursor: isDragging ? 'grabbing' : 'default',
    userSelect: isDragging ? 'none' : 'auto',
    display: 'flex',
    flexDirection: 'column',
  };

  const modalHeaderStyle: React.CSSProperties = {
    padding: '16px 16px 12px 16px',
    borderBottom: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
    cursor: 'grab',
    userSelect: 'none',
    flexShrink: 0,
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: theme?.layout?.textColor || '#000000',
    margin: 0,
  };

  const modalBodyStyle: React.CSSProperties = {
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const indicatorsListStyle: React.CSSProperties = {
    marginBottom: '16px',
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    ...scrollbarStyle,
  };

  const indicatorItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    padding: '8px',
    background: theme?.toolbar?.background || '#fafafa',
    border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
    borderRadius: '4px',
  };

  const itemLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: theme?.layout?.textColor || '#000000',
    minWidth: '80px',
    fontWeight: 'bold',
  };

  const lineWidthSelectStyle: React.CSSProperties = {
    width: '60px',
    padding: '4px 8px',
    background: theme?.toolbar?.background || '#fafafa',
    color: theme?.layout?.textColor || '#000000',
    border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
    borderRadius: '4px',
    fontSize: '12px',
  };

  const colorPickerContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    position: 'relative',
  };

  const colorDisplayStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const colorInputStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '24px',
    height: '24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    opacity: 0,
  };

  const modalActionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    flexShrink: 0,
  };

  const cancelButtonStyle: React.CSSProperties = {
    background: 'transparent',
    color: theme?.layout?.textColor || '#000000',
    border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  };

  const confirmButtonStyle: React.CSSProperties = {
    background: theme?.toolbar?.button?.active || '#2962FF',
    color: theme?.toolbar?.button?.activeTextColor || '#ffffff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  };

  const hintTextStyle: React.CSSProperties = {
    fontSize: '10px',
    color: `${theme?.layout?.textColor || '#000000'}80`,
    marginTop: '8px',
    textAlign: 'center',
    flexShrink: 0,
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    background: 'transparent',
  };

  if (!isOpen || !indicator) return null;

  return ReactDOM.createPortal(
    <>
      <style>{webkitScrollbarStyle}</style>
      <div
        style={modalOverlayStyle}
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          style={modalContentStyle}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyPress}
        >
          <div
            ref={headerRef}
            style={modalHeaderStyle}
            onMouseDown={(e) => {
              if (e.target === headerRef.current) {
                e.preventDefault();
              }
            }}
          >
            <div style={modalTitleStyle}>OBV指标设置</div>
          </div>
          <div style={modalBodyStyle}>
            <div
              style={indicatorsListStyle}
              className="obv-scrollbar"
            >
              {indicator.params?.map((param, paramIndex) => (
                <div key={`${indicator.id}-${paramIndex}`} style={indicatorItemStyle}>
                  <div style={itemLabelStyle}>
                    {param.paramName}
                  </div>

                  <select
                    style={lineWidthSelectStyle}
                    value={param.lineWidth}
                    onChange={(e) => updateIndicatorLineWidth(paramIndex, Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value={1}>1px</option>
                    <option value={2}>2px</option>
                    <option value={3}>3px</option>
                    <option value={4}>4px</option>
                    <option value={5}>5px</option>
                  </select>
                  <div style={colorPickerContainerStyle}>
                    <div
                      style={{
                        ...colorDisplayStyle,
                        backgroundColor: param.lineColor
                      }}
                      onClick={(e) => {
                        const colorInput = e.currentTarget.nextSibling as HTMLInputElement;
                        colorInput?.click();
                      }}
                    />
                    <input
                      type="color"
                      style={colorInputStyle}
                      value={param.lineColor}
                      onChange={(e) => updateIndicatorColor(paramIndex, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={modalActionsStyle}>
              <button
                onClick={handleCancel}
                style={cancelButtonStyle}
                type="button"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                style={confirmButtonStyle}
                type="button"
              >
                确定
              </button>
            </div>
            <div style={hintTextStyle}>
              提示: Ctrl+Enter 确认, Esc 取消, 拖动标题栏移动
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export const OBVIndicator: React.FC<OBVIndicatorProps> = ({
  theme,
  data,
  height,
  width,
  handleRemoveSubChartIndicator,
  candleViewContainerRef
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesMapRef = useRef<{ [key: string]: ISeriesApi<'Line'> }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [currentValues, setCurrentValues] = useState<{ [key: string]: number } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [indicatorSettings, setIndicatorSettings] = useState<OBVIndicatorInfo>({
    id: 'obv-indicator',
    params: [
      {
        paramName: 'OBV',
        lineColor: '#2196F3',
        lineWidth: 1
      }
    ],
    nonce: Date.now()
  });

  const calculateOBV = (data: ICandleViewDataPoint[]) => {
    if (data.length === 0) return [];
    const result: { time: number; value: number }[] = [];
    let obv = 0;
    result.push({
      time: data[0].time,
      value: obv
    });
    for (let i = 1; i < data.length; i++) {
      const currentClose = data[i].close;
      const previousClose = data[i - 1].close;
      const currentVolume = data[i].volume;
      if (currentClose > previousClose) {
        obv += currentVolume;
      } else if (currentClose < previousClose) {
        obv -= currentVolume;
      }
      result.push({
        time: data[i].time,
        value: obv
      });
    }
    return result as any;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;
    const containerWidth = container.clientWidth;
    const chart = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: height,
      layout: {
        background: { color: theme.layout.background.color },
        textColor: theme.layout.textColor,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false }
      },
      rightPriceScale: {
        visible: true,
        borderColor: theme.grid.horzLines.color,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        visible: true,
        borderColor: theme.grid.horzLines.color,
        timeVisible: true,
      },
      handleScale: true,
      handleScroll: true,
      crosshair: {
        mode: 1,
      },
    });
    Object.values(seriesMapRef.current).forEach(series => {
      try {
        chart.removeSeries(series);
      } catch (error) {
        console.error(error);
      }
    });
    seriesMapRef.current = {};
    const obvData = calculateOBV(data);

    indicatorSettings.params.forEach(param => {
      if (obvData.length > 0) {
        const series = chart.addSeries(LineSeries, {
          color: param.lineColor,
          title: param.paramName,
          lineWidth: param.lineWidth as any
        });
        series.setData(obvData as any);
        seriesMapRef.current[param.paramName] = series;
      }
    });

    chartRef.current = chart;

    const crosshairMoveHandler = (param: any) => {
      if (!param || !param.time) {
        setCurrentValues(null);
        return;
      }

      try {
        const seriesData = param.seriesData;
        if (seriesData && seriesData.size > 0) {
          const values: { [key: string]: number } = {};
          Object.keys(seriesMapRef.current).forEach(key => {
            const series = seriesMapRef.current[key];
            const dataPoint = seriesData.get(series);
            if (dataPoint && dataPoint.value !== undefined) {
              values[key] = dataPoint.value;
            }
          });
          if (Object.keys(values).length > 0) {
            setCurrentValues(values);
            return;
          }
        }
      } catch (error) {
        console.error(error);
      }
      setCurrentValues(null);
    };

    chart.subscribeCrosshairMove(crosshairMoveHandler);

    setTimeout(() => {
      try {
        chart.timeScale().fitContent();
      } catch (error) {
        console.error(error);
      }
    }, 200);

    const handleDoubleClick = () => {
      if (chartRef.current) {
        try {
          chartRef.current.timeScale().fitContent();
        } catch (error) {
          console.error(error);
        }
      }
    };

    container.addEventListener('dblclick', handleDoubleClick);

    resizeObserverRef.current = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (chartRef.current && width > 0) {
          try {
            chartRef.current.applyOptions({ width });
          } catch (error) {
            console.error(error);
          }
        }
      }
    });

    resizeObserverRef.current.observe(container);

    return () => {
      try {
        chart.unsubscribeCrosshairMove(crosshairMoveHandler);
      } catch (error) {
        console.error(error);
      }

      container.removeEventListener('dblclick', handleDoubleClick);

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (error) {
          console.error(error);
        }
        chartRef.current = null;
        seriesMapRef.current = {};
      }
    };
  }, [data, height, theme, indicatorSettings]);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleConfirmSettings = (newSettings: OBVIndicatorInfo) => {
    setIndicatorSettings(newSettings);
    setIsSettingsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', height: `${height}px`, width: width || '100%' }}>
      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'crosshair'
        }}
      />
      <div style={{
        position: 'absolute',
        top: '5px',
        left: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          color: theme.layout.textColor,
          fontSize: '11px',
          fontWeight: 'bold',
          background: theme.layout.background.color,
          padding: '2px 8px',
          paddingRight: '0px',
          borderRadius: '3px',
          opacity: 0.9,
        }}>
          <span>OBV</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'auto',
          marginTop: '1px'
        }}>
          <button
            style={{
              background: theme.layout.background.color,
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.layout.textColor,
              opacity: 0.7,
              transition: 'all 0.2s',
              width: '20px',
              height: '20px',
            }}
            onClick={handleOpenSettings}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.toolbar.button.hover;
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.layout.background.color;
              e.currentTarget.style.opacity = '0.7';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button
            style={{
              background: theme.layout.background.color,
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.layout.textColor,
              opacity: 0.7,
              transition: 'all 0.2s',
              width: '20px',
              height: '20px',
            }}
            onClick={() => handleRemoveSubChartIndicator && handleRemoveSubChartIndicator(SubChartIndicatorType.OBV)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.toolbar.button.hover;
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.layout.background.color;
              e.currentTarget.style.opacity = '0.7';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {currentValues && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: theme.layout.textColor,
            fontSize: '11px',
            background: theme.layout.background.color,
            padding: '2px 8px',
            borderRadius: '3px',
            opacity: 0.9,
          }}>
            {Object.keys(currentValues).map(key => {
              const paramConfig = indicatorSettings.params.find(param => param.paramName === key);
              const lineColor = paramConfig?.lineColor || theme.layout.textColor;
              return (
                <span key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1px',
                }}>
                  <span style={{
                    fontWeight: 'bold',
                    opacity: 0.8,
                    color: lineColor
                  }}>
                    {key}
                  </span>
                  <span style={{
                    fontWeight: 'normal',
                    color: lineColor,
                    minWidth: '40px'
                  }}>
                    ({currentValues[key].toFixed(0)})
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </div>
      <OBVSettingModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onConfirm={handleConfirmSettings}
        initialIndicator={indicatorSettings}
        theme={theme}
        parentRef={candleViewContainerRef}
      />
    </div>
  );
};