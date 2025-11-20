import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries, Time } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';
import ReactDOM from 'react-dom';
import { SubChartIndicatorType, ICandleViewDataPoint } from '../../types';

interface StochasticIndicatorProps {
  theme: ThemeConfig;
  data: ICandleViewDataPoint[];
  height: number;
  width?: string;
  handleRemoveSubChartIndicator?: (indicatorType: SubChartIndicatorType) => void;
  onOpenSettings?: () => void;
  candleViewContainerRef?: React.RefObject<HTMLDivElement | null>;
}

interface StochasticIndicatorParam {
  paramName: string;
  kPeriod: number;
  dPeriod: number;
  smooth: number;
  kLineColor: string;
  dLineColor: string;
  lineWidth: number;
}

interface StochasticIndicatorInfo {
  id: string;
  params: StochasticIndicatorParam[];
  nonce: number;
}

interface StochasticSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (indicator: StochasticIndicatorInfo) => void;
  initialIndicator?: StochasticIndicatorInfo | null;
  theme?: ThemeConfig;
  parentRef?: React.RefObject<HTMLDivElement | null>;
}

const StochasticSettingModal: React.FC<StochasticSettingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialIndicator = null,
  theme,
  parentRef
}) => {
  const [indicator, setIndicator] = useState<StochasticIndicatorInfo | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const kPeriods = [5, 9, 14, 21];
  const dPeriods = [3, 5, 9];
  const smoothPeriods = [1, 3, 5, 9];

  useEffect(() => {
    if (initialIndicator) {
      setIndicator(initialIndicator);
    } else {
      const defaultIndicator: StochasticIndicatorInfo = {
        id: Date.now().toString(),
        params: [
          {
            paramName: 'Stochastic(14,3,3)',
            kPeriod: 14,
            dPeriod: 3,
            smooth: 3,
            kLineColor: '#2962FF',
            dLineColor: '#FF6B6B',
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
          const modalHeight = 500;
          const x = candleViewRect.left + (candleViewRect.width - modalWidth) / 2;
          const y = candleViewRect.top + (candleViewRect.height - modalHeight) / 2;
          return {
            x: Math.max(10, x),
            y: Math.max(10, y)
          };
        } else {
          const x = Math.max(10, (window.innerWidth - 450) / 2);
          const y = Math.max(10, (window.innerHeight - 500) / 2);
          return { x, y };
        }
      };
      setModalPosition(calculatePosition());
    }
  }, [isOpen, parentRef]);

  const addIndicatorParam = () => {
    if (!indicator || indicator.params.length >= 3) return;

    const randomKColor = getRandomColor();
    const randomDColor = getRandomColor();
    const newParam: StochasticIndicatorParam = {
      paramName: `Stochastic(14,3,3)`,
      kPeriod: 14,
      dPeriod: 3,
      smooth: 3,
      kLineColor: randomKColor,
      dLineColor: randomDColor,
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

  const updateKPeriod = (paramIndex: number, value: number) => {
    if (!indicator || !indicator.params) return;
    const newParams = [...indicator.params];
    newParams[paramIndex] = {
      ...newParams[paramIndex],
      kPeriod: value,
      paramName: `Stochastic(${value},${newParams[paramIndex].dPeriod},${newParams[paramIndex].smooth})`
    };
    setIndicator({
      ...indicator,
      params: newParams
    });
  };

  const updateDPeriod = (paramIndex: number, value: number) => {
    if (!indicator || !indicator.params) return;
    const newParams = [...indicator.params];
    newParams[paramIndex] = {
      ...newParams[paramIndex],
      dPeriod: value,
      paramName: `Stochastic(${newParams[paramIndex].kPeriod},${value},${newParams[paramIndex].smooth})`
    };
    setIndicator({
      ...indicator,
      params: newParams
    });
  };

  const updateSmoothPeriod = (paramIndex: number, value: number) => {
    if (!indicator || !indicator.params) return;
    const newParams = [...indicator.params];
    newParams[paramIndex] = {
      ...newParams[paramIndex],
      smooth: value,
      paramName: `Stochastic(${newParams[paramIndex].kPeriod},${newParams[paramIndex].dPeriod},${value})`
    };
    setIndicator({
      ...indicator,
      params: newParams
    });
  };

  const updateKLineColor = (paramIndex: number, color: string) => {
    if (!indicator || !indicator.params) return;
    const newParams = [...indicator.params];
    newParams[paramIndex] = { ...newParams[paramIndex], kLineColor: color };
    setIndicator({
      ...indicator,
      params: newParams
    });
  };

  const updateDLineColor = (paramIndex: number, color: string) => {
    if (!indicator || !indicator.params) return;
    const newParams = [...indicator.params];
    newParams[paramIndex] = { ...newParams[paramIndex], dLineColor: color };
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
        const maxX = window.innerWidth - 450;
        const maxY = window.innerHeight - 500;
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
        .stochastic-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .stochastic-scrollbar::-webkit-scrollbar-track {
            background: ${theme?.toolbar?.background || '#fafafa'};
            border-radius: 3px;
        }
        .stochastic-scrollbar::-webkit-scrollbar-thumb {
            background: ${theme?.toolbar?.border || '#d9d9d9'};
            border-radius: 3px;
        }
        .stochastic-scrollbar::-webkit-scrollbar-thumb:hover {
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
    height: '500px',
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
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
    padding: '12px',
    background: theme?.toolbar?.background || '#fafafa',
    border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
    borderRadius: '4px',
  };

  const itemRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const itemLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: theme?.layout?.textColor || '#000000',
    minWidth: '100px',
    fontWeight: 'bold',
  };

  const selectStyle: React.CSSProperties = {
    width: '70px',
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
    gap: '8px',
  };

  const colorPickerItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    position: 'relative',
  };

  const colorDisplayStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const colorInputStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '20px',
    height: '20px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    opacity: 0,
  };

  const colorLabelStyle: React.CSSProperties = {
    fontSize: '10px',
    color: theme?.layout?.textColor || '#000000',
    minWidth: '30px',
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
            <div style={modalTitleStyle}>Stochastic指标设置</div>
          </div>
          <div style={modalBodyStyle}>
            <div
              style={indicatorsListStyle}
              className="stochastic-scrollbar"
            >
              {indicator.params?.map((param, paramIndex) => (
                <div key={`${indicator.id}-${paramIndex}`} style={indicatorItemStyle}>
                  <div style={itemRowStyle}>
                    <div style={itemLabelStyle}>
                      {param.paramName}
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

                  <div style={itemRowStyle}>
                    <span style={colorLabelStyle}>%K周期:</span>
                    <select
                      style={selectStyle}
                      value={param.kPeriod}
                      onChange={(e) => updateKPeriod(paramIndex, Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {kPeriods.map(period => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>

                    <span style={colorLabelStyle}>%D周期:</span>
                    <select
                      style={selectStyle}
                      value={param.dPeriod}
                      onChange={(e) => updateDPeriod(paramIndex, Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {dPeriods.map(period => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>

                    <span style={colorLabelStyle}>平滑:</span>
                    <select
                      style={selectStyle}
                      value={param.smooth}
                      onChange={(e) => updateSmoothPeriod(paramIndex, Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {smoothPeriods.map(period => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={itemRowStyle}>
                    <div style={colorPickerContainerStyle}>
                      <div style={colorPickerItemStyle}>
                        <span style={colorLabelStyle}>%K线:</span>
                        <div
                          style={{
                            ...colorDisplayStyle,
                            backgroundColor: param.kLineColor
                          }}
                          onClick={(e) => {
                            const colorInput = e.currentTarget.nextSibling as HTMLInputElement;
                            colorInput?.click();
                          }}
                        />
                        <input
                          type="color"
                          style={colorInputStyle}
                          value={param.kLineColor}
                          onChange={(e) => updateKLineColor(paramIndex, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div style={colorPickerItemStyle}>
                        <span style={colorLabelStyle}>%D线:</span>
                        <div
                          style={{
                            ...colorDisplayStyle,
                            backgroundColor: param.dLineColor
                          }}
                          onClick={(e) => {
                            const colorInput = e.currentTarget.nextSibling as HTMLInputElement;
                            colorInput?.click();
                          }}
                        />
                        <input
                          type="color"
                          style={colorInputStyle}
                          value={param.dLineColor}
                          onChange={(e) => updateDLineColor(paramIndex, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <span style={colorLabelStyle}>线宽:</span>
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addIndicatorParam}
              style={indicator.params.length >= 3 ? addButtonDisabledStyle : addButtonStyle}
              disabled={indicator.params.length >= 3}
              type="button"
              title={indicator.params.length >= 3 ? "最多添加3个Stochastic参数" : "添加Stochastic参数"}
            >
              {indicator.params.length >= 3 ? "已达到最大参数数量(3个)" : "+ 添加Stochastic参数"}
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

interface StochasticDataPoint {
  time: Time;
  value: number;
}

export const StochasticIndicator: React.FC<StochasticIndicatorProps> = ({
  theme,
  data,
  height,
  width,
  handleRemoveSubChartIndicator,
  candleViewContainerRef
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesMapRef = useRef<{ [key: string]: { kSeries: ISeriesApi<'Line'>; dSeries: ISeriesApi<'Line'> } }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [currentValues, setCurrentValues] = useState<{ [key: string]: { k: number; d: number } } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [indicatorSettings, setIndicatorSettings] = useState<StochasticIndicatorInfo>({
    id: 'stochastic-indicator',
    params: [
      {
        paramName: 'Stochastic(14,3,3)',
        kPeriod: 14,
        dPeriod: 3,
        smooth: 3,
        kLineColor: '#2962FF',
        dLineColor: '#FF6B6B',
        lineWidth: 1
      }
    ],
    nonce: Date.now()
  });

  const calculateStochastic = (
    data: ICandleViewDataPoint[],
    kPeriod: number,
    dPeriod: number,
    smooth: number
  ) => {
    if (data.length < kPeriod + smooth - 1) return { k: [], d: [] };

    const kValues: StochasticDataPoint[] = [];

    for (let i = kPeriod - 1; i < data.length; i++) {
      const periodData = data.slice(i - kPeriod + 1, i + 1);
      const highs = periodData.map(d => d.high);
      const lows = periodData.map(d => d.low);
      const high = Math.max(...highs);
      const low = Math.min(...lows);
      const close = data[i].close;

      if (high === low) {
        kValues.push({ time: data[i].time as Time, value: 50 });
      } else {
        const k = ((close - low) / (high - low)) * 100;
        kValues.push({ time: data[i].time as Time, value: k });
      }
    }

    const smoothedKValues: StochasticDataPoint[] = [];
    for (let i = smooth - 1; i < kValues.length; i++) {
      const smoothData = kValues.slice(i - smooth + 1, i + 1);
      const smoothedValue = smoothData.reduce((sum, item) => sum + item.value, 0) / smooth;
      smoothedKValues.push({
        time: kValues[i].time,
        value: smoothedValue
      });
    }

    const dValues: StochasticDataPoint[] = [];
    for (let i = dPeriod - 1; i < smoothedKValues.length; i++) {
      const dPeriodData = smoothedKValues.slice(i - dPeriod + 1, i + 1);
      const dValue = dPeriodData.reduce((sum, item) => sum + item.value, 0) / dPeriod;
      dValues.push({
        time: smoothedKValues[i].time,
        value: dValue
      });
    }

    const finalKValues = smoothedKValues.slice(dPeriod - 1);
    const finalDValues = dValues;

    return { k: finalKValues, d: finalDValues };
  };


  const calculateMultipleStochastic = (data: ICandleViewDataPoint[]) => {
    const result: {
      [key: string]: {
        k: StochasticDataPoint[];
        d: StochasticDataPoint[];
      }
    } = {};

    indicatorSettings.params.forEach(param => {
      const stochasticData = calculateStochastic(data, param.kPeriod, param.dPeriod, param.smooth);
      if (stochasticData.k.length > 0 && stochasticData.d.length > 0) {
        result[param.paramName] = stochasticData;
      }
    });

    return result;
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
        mode: 2,
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

    Object.values(seriesMapRef.current).forEach(({ kSeries, dSeries }) => {
      try {
        chart.removeSeries(kSeries);
        chart.removeSeries(dSeries);
      } catch (error) {
        console.error(error);
      }
    });
    seriesMapRef.current = {};

    const stochasticDataSets = calculateMultipleStochastic(data);

    indicatorSettings.params.forEach(param => {
      const stochasticData = stochasticDataSets[param.paramName];
      if (stochasticData && stochasticData.k.length > 0 && stochasticData.d.length > 0) {
        const kSeries = chart.addSeries(LineSeries, {
          color: param.kLineColor,
          title: `${param.paramName} %K`,
          lineWidth: param.lineWidth as any,
          priceScaleId: 'right'
        });

        const dSeries = chart.addSeries(LineSeries, {
          color: param.dLineColor,
          title: `${param.paramName} %D`,
          lineWidth: param.lineWidth as any,
          priceScaleId: 'right'
        });

        kSeries.setData(stochasticData.k);
        dSeries.setData(stochasticData.d);

        seriesMapRef.current[param.paramName] = { kSeries, dSeries };
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
          const values: { [key: string]: { k: number; d: number } } = {};
          Object.keys(seriesMapRef.current).forEach(key => {
            const { kSeries, dSeries } = seriesMapRef.current[key];
            const kDataPoint = seriesData.get(kSeries);
            const dDataPoint = seriesData.get(dSeries);

            if (kDataPoint && kDataPoint.value !== undefined && dDataPoint && dDataPoint.value !== undefined) {
              values[key] = {
                k: kDataPoint.value,
                d: dDataPoint.value
              };
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

  const handleConfirmSettings = (newSettings: StochasticIndicatorInfo) => {
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
          <span>Stochastic</span>
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
            onClick={() => handleRemoveSubChartIndicator && handleRemoveSubChartIndicator(SubChartIndicatorType.STOCHASTIC)}
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
            gap: '8px',
            color: theme.layout.textColor,
            fontSize: '11px',
            background: theme.layout.background.color,
            padding: '2px 8px',
            borderRadius: '3px',
            opacity: 0.9,
          }}>
            {Object.keys(currentValues).map(key => {
              const paramConfig = indicatorSettings.params.find(param => param.paramName === key);
              const kLineColor = paramConfig?.kLineColor || theme.layout.textColor;
              const dLineColor = paramConfig?.dLineColor || theme.layout.textColor;
              return (
                <span key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span style={{
                    fontWeight: 'bold',
                    opacity: 0.8,
                  }}>
                    {key}
                  </span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}>
                    <span style={{ color: kLineColor }}>K:{currentValues[key].k.toFixed(2)}</span>
                    <span style={{ opacity: 0.6 }}>|</span>
                    <span style={{ color: dLineColor }}>D:{currentValues[key].d.toFixed(2)}</span>
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </div>
      <StochasticSettingModal
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