import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries, Time } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';
import ReactDOM from 'react-dom';
import { ChartType, ICandleViewDataPoint, SubChartIndicatorType } from '../../types';

interface BBWidthIndicatorProps {
  theme: ThemeConfig;
  data: ICandleViewDataPoint[];
  height: number;
  width?: string;
  handleRemoveSubChartIndicator?: (indicatorType: SubChartIndicatorType) => void;
  onOpenSettings?: () => void;
  candleViewContainerRef?: React.RefObject<HTMLDivElement | null>;
  bbwidthChartVisibleRange?: { from: number; to: number } | null;
  updateChartVisibleRange?: (chartType: ChartType, subChartType: SubChartIndicatorType | null, visibleRange: { from: number; to: number } | null) => void;
}

interface BBWidthIndicatorParam {
  paramName: string;
  period: number;
  multiplier: number;
  lineColor: string;
  lineWidth: number;
}

interface BBWidthIndicatorInfo {
  id: string;
  params: BBWidthIndicatorParam[];
  nonce: number;
}

interface BBWidthSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (indicator: BBWidthIndicatorInfo) => void;
  initialIndicator?: BBWidthIndicatorInfo | null;
  theme?: ThemeConfig;
  parentRef?: React.RefObject<HTMLDivElement | null>;
}

const BBWidthSettingModal: React.FC<BBWidthSettingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialIndicator = null,
  theme,
  parentRef
}) => {
  const [indicator, setIndicator] = useState<BBWidthIndicatorInfo | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const standardPeriods = [10, 14, 20, 21, 26];
  const standardMultipliers = [1.5, 2, 2.5, 3];

  useEffect(() => {
    if (initialIndicator) {
      setIndicator(initialIndicator);
    } else {
      const defaultIndicator: BBWidthIndicatorInfo = {
        id: Date.now().toString(),
        params: [
          {
            paramName: 'BBW(20,2)',
            period: 20,
            multiplier: 2,
            lineColor: '#4CAF50',
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
          const modalWidth = 450;
          const modalHeight = 450;
          const x = candleViewRect.left + (candleViewRect.width - modalWidth) / 2;
          const y = candleViewRect.top + (candleViewRect.height - modalHeight) / 2;
          return {
            x: Math.max(10, x),
            y: Math.max(10, y)
          };
        } else {
          const x = Math.max(10, (window.innerWidth - 450) / 2);
          const y = Math.max(10, (window.innerHeight - 450) / 2);
          return { x, y };
        }
      };
      setModalPosition(calculatePosition());
    }
  }, [isOpen, parentRef]);

  const addIndicatorParam = () => {
    if (!indicator || indicator.params.length >= 5) return;
    const usedCombinations = indicator.params.map(p => `${p.period}-${p.multiplier}`);
    const availablePeriods = standardPeriods.filter(p =>
      !indicator.params.some(param => param.period === p)
    );
    if (availablePeriods.length === 0) return;
    const randomColor = getRandomColor();
    const newPeriod = availablePeriods[0];
    const defaultMultiplier = 2;
    const newParam: BBWidthIndicatorParam = {
      paramName: `BBW(${newPeriod},${defaultMultiplier})`,
      period: newPeriod,
      multiplier: defaultMultiplier,
      lineColor: randomColor,
      lineWidth: 1
    };
    setIndicator({
      ...indicator,
      params: [...indicator.params, newParam]
    });
  };

  const removeIndicatorParam = (paramIndex: number) => {
    if (!indicator || !indicator.params || indicator.params.length <= 1) return;
    const newParams = [...indicator.params];
    newParams.splice(paramIndex, 1);
    setIndicator({
      ...indicator,
      params: newParams
    });
  };

  const updateIndicatorPeriod = (paramIndex: number, period: number) => {
    if (!indicator || !indicator.params) return;
    const isPeriodUsed = indicator.params.some((param, index) =>
      index !== paramIndex && param.period === period
    );
    if (isPeriodUsed) return;
    const newParams = [...indicator.params];
    newParams[paramIndex] = {
      ...newParams[paramIndex],
      period: period,
      paramName: `BBW(${period},${newParams[paramIndex].multiplier})`
    };
    setIndicator({
      ...indicator,
      params: newParams
    });
  };

  const updateIndicatorMultiplier = (paramIndex: number, multiplier: number) => {
    if (!indicator || !indicator.params) return;
    const newParams = [...indicator.params];
    newParams[paramIndex] = {
      ...newParams[paramIndex],
      multiplier: multiplier,
      paramName: `BBW(${newParams[paramIndex].period},${multiplier})`
    };
    setIndicator({
      ...indicator,
      params: newParams
    });
  };

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
      '#556270',
      '#4CAF50',
      '#FF9800',
      '#9C27B0'
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
        const maxX = window.innerWidth - 450;
        const maxY = window.innerHeight - 450;
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
        .bbw-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .bbw-scrollbar::-webkit-scrollbar-track {
            background: ${theme?.toolbar?.background || '#fafafa'};
            border-radius: 3px;
        }
        .bbw-scrollbar::-webkit-scrollbar-thumb {
            background: ${theme?.toolbar?.border || '#d9d9d9'};
            border-radius: 3px;
        }
        .bbw-scrollbar::-webkit-scrollbar-thumb:hover {
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
    width: '450px',
    maxWidth: '90vw',
    height: '450px',
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
    minWidth: '100px',
    fontWeight: 'bold',
  };

  const selectStyle: React.CSSProperties = {
    width: '80px',
    padding: '4px 8px',
    background: theme?.toolbar?.background || '#fafafa',
    color: theme?.layout?.textColor || '#000000',
    border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
    borderRadius: '4px',
    fontSize: '12px',
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

  const deleteButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme?.chart?.downColor || '#ff4d4f',
  };

  const deleteButtonDisabledStyle: React.CSSProperties = {
    ...deleteButtonStyle,
    color: `${theme?.toolbar?.border || '#d9d9d9'}`,
    cursor: 'not-allowed',
  };

  const addButtonStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    color: theme?.chart?.lineColor || '#2962FF',
    border: `2px dashed ${theme?.toolbar?.border || '#d9d9d9'}`,
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '12px',
    cursor: 'pointer',
    marginBottom: '16px',
    flexShrink: 0,
  };

  const addButtonDisabledStyle: React.CSSProperties = {
    ...addButtonStyle,
    color: `${theme?.toolbar?.border || '#d9d9d9'}`,
    cursor: 'not-allowed',
    borderColor: `${theme?.toolbar?.border || '#d9d9d9'}`,
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
            <div style={modalTitleStyle}>布林带宽度(BB Width)指标设置</div>
          </div>
          <div style={modalBodyStyle}>
            <div
              style={indicatorsListStyle}
              className="bbw-scrollbar"
            >
              {indicator.params?.map((param, paramIndex) => {
                const availablePeriods = standardPeriods.filter(p =>
                  !indicator.params.some((param, idx) => idx !== paramIndex && param.period === p)
                );
                return (
                  <div key={`${indicator.id}-${paramIndex}`} style={indicatorItemStyle}>
                    <div style={itemLabelStyle}>
                      {param.paramName}
                    </div>
                    <select
                      style={selectStyle}
                      value={param.period}
                      onChange={(e) => updateIndicatorPeriod(paramIndex, Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {standardPeriods.map(period => (
                        <option
                          key={period}
                          value={period}
                          disabled={!availablePeriods.includes(period) && period !== param.period}
                        >
                          {period}
                        </option>
                      ))}
                    </select>
                    <select
                      style={selectStyle}
                      value={param.multiplier}
                      onChange={(e) => updateIndicatorMultiplier(paramIndex, Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {standardMultipliers.map(multiplier => (
                        <option key={multiplier} value={multiplier}>
                          {multiplier}
                        </option>
                      ))}
                    </select>
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
                    <button
                      onClick={() => removeIndicatorParam(paramIndex)}
                      style={indicator.params.length <= 1 ? deleteButtonDisabledStyle : deleteButtonStyle}
                      disabled={!indicator.params || indicator.params.length <= 1}
                      type="button"
                      title={indicator.params.length <= 1 ? "至少保留一个参数" : "删除此参数"}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={addIndicatorParam}
              style={indicator.params.length >= 5 ? addButtonDisabledStyle : addButtonStyle}
              disabled={indicator.params.length >= 5}
              type="button"
              title={indicator.params.length >= 5 ? "最多添加5个BB Width参数" : "添加BB Width参数"}
            >
              {indicator.params.length >= 5 ? "已达到最大参数数量(5个)" : "+ 添加BB Width参数"}
            </button>
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

export const BBWidthIndicator: React.FC<BBWidthIndicatorProps> = ({
  theme,
  data,
  height,
  width,
  handleRemoveSubChartIndicator,
  candleViewContainerRef,
  bbwidthChartVisibleRange,
  updateChartVisibleRange
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesMapRef = useRef<{ [key: string]: ISeriesApi<'Line'> }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [currentValues, setCurrentValues] = useState<{ [key: string]: number } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isMountedRef = useRef(true);
  const [isMouseOverChart, setIsMouseOverChart] = useState(false);
  const isMouseOverChartRef = useRef(false);
  const [indicatorSettings, setIndicatorSettings] = useState<BBWidthIndicatorInfo>({
    id: 'bbwidth-indicator',
    params: [
      {
        paramName: 'BBW(20,2)',
        period: 20,
        multiplier: 2,
        lineColor: '#4CAF50',
        lineWidth: 1
      }
    ],
    nonce: Date.now()
  });

  const calculateBBWidth = (data: ICandleViewDataPoint[], period: number, multiplier: number) => {
    if (data.length < period) return [];
    const result: { time: Time; value: number; color?: string }[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1);
      const values = periodData.map(d => d.close);
      const sma = values.reduce((sum, value) => sum + value, 0) / period;
      const variance = values.reduce((sum, value) =>
        sum + Math.pow(value - sma, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      const bbWidth = (2 * multiplier * stdDev) / sma * 100;
      result.push({
        time: data[i].time as Time,
        value: bbWidth,
        ...(data[i].isVirtual && { color: 'transparent' })
      });
    }
    return result;
  };

  const calculateMultipleBBWidth = (data: ICandleViewDataPoint[]) => {
    const result: { [key: string]: { time: Time; value: number }[] } = {};
    indicatorSettings.params.forEach(param => {
      const bbWidthData = calculateBBWidth(data, param.period, param.multiplier);
      if (bbWidthData.length > 0) {
        result[param.paramName] = bbWidthData;
      }
    });
    return result;
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      setIsMouseOverChart(true);
      isMouseOverChartRef.current = true;
    };
    const handleMouseLeave = () => {
      setIsMouseOverChart(false);
      isMouseOverChartRef.current = false;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !bbwidthChartVisibleRange) return;
    try {
      const timeScale = chartRef.current.timeScale();
      const currentRange = timeScale.getVisibleRange();
      if (!isMouseOverChart && currentRange &&
        (currentRange.from !== bbwidthChartVisibleRange.from ||
          currentRange.to !== bbwidthChartVisibleRange.to)) {
        timeScale.setVisibleRange({
          from: bbwidthChartVisibleRange.from as any,
          to: bbwidthChartVisibleRange.to as any
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
    }
  }, [bbwidthChartVisibleRange, isMouseOverChart]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
        rightOffset: 0,
        minBarSpacing: 0.1,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScale: {
        axisPressedMouseMove: false,
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      crosshair: {
        mode: 1,
      },
    });

    if (updateChartVisibleRange) {
      chart.timeScale().subscribeVisibleTimeRangeChange((timeRange: any) => {
        if (!timeRange) return;
        const visibleRange = {
          from: timeRange.from,
          to: timeRange.to
        };
        if (isMouseOverChartRef.current) {
          updateChartVisibleRange(ChartType.SubChart, SubChartIndicatorType.BBWIDTH, visibleRange);
        }
      });
    }

    Object.values(seriesMapRef.current).forEach(series => {
      try {
        chart.removeSeries(series);
      } catch (error) {
        console.error(error);
      }
    });
    seriesMapRef.current = {};
    const bbWidthDataSets = calculateMultipleBBWidth(data);

    indicatorSettings.params.forEach(param => {
      const bbWidthData = bbWidthDataSets[param.paramName];
      if (bbWidthData && bbWidthData.length > 0) {
        const series = chart.addSeries(LineSeries, {
          color: param.lineColor,
          title: param.paramName,
          lineWidth: param.lineWidth as any
        });
        series.setData(bbWidthData);
        seriesMapRef.current[param.paramName] = series;
      }
    });

    chartRef.current = chart;
    const initializeVisibleRange = () => {
      if (bbwidthChartVisibleRange) {
        try {
          chart.timeScale().setVisibleRange({
            from: bbwidthChartVisibleRange.from as any,
            to: bbwidthChartVisibleRange.to as any
          });
        } catch (error) {
          console.error(error);
          setTimeout(() => {
            try {
              chart.timeScale().fitContent();
            } catch (fitError) {
              console.error(fitError);
            }
          }, 200);
        }
      } else {
        setTimeout(() => {
          try {
            chart.timeScale().fitContent();
          } catch (error) {
            console.error(error);
          }
        }, 200);
      }
    };
    setTimeout(initializeVisibleRange, 100);

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
  }, [height, theme]);

  useEffect(() => {
    if (!chartRef.current) return;
    const bbWidthDataSets = calculateMultipleBBWidth(data);
    Object.values(seriesMapRef.current).forEach(series => {
      try {
        chartRef.current?.removeSeries(series);
      } catch (error) {
        console.error(error);
      }
    });
    seriesMapRef.current = {};
    indicatorSettings.params.forEach(param => {
      const bbWidthData = bbWidthDataSets[param.paramName];
      if (bbWidthData && bbWidthData.length > 0) {
        const series = chartRef.current!.addSeries(LineSeries, {
          color: param.lineColor,
          title: param.paramName,
          lineWidth: param.lineWidth as any
        });
        series.setData(bbWidthData);
        seriesMapRef.current[param.paramName] = series;
      }
    });
  }, [data, indicatorSettings]);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleConfirmSettings = (newSettings: BBWidthIndicatorInfo) => {
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
          <span>BB Width</span>
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
            onClick={() => handleRemoveSubChartIndicator && handleRemoveSubChartIndicator(SubChartIndicatorType.BBWIDTH)}
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
                    ({currentValues[key].toFixed(2)})
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </div>
      <BBWidthSettingModal
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