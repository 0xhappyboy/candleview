import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ThemeConfig } from '../../Theme';
import { IIndicatorInfo } from '../../Indicators/SubChart/IIndicator';
import { SubChartIndicatorType } from '../../types';
import { I18n } from '../../I18n';

interface SubChartIndicatorsSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: IIndicatorInfo[]) => void;
  initialParams: IIndicatorInfo[];
  theme?: ThemeConfig;
  parentRef?: React.RefObject<HTMLDivElement | null>;
  indicatorType: SubChartIndicatorType | null;
  i18n: I18n;
}

const SubChartIndicatorsSettingModal: React.FC<SubChartIndicatorsSettingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialParams,
  theme,
  parentRef,
  indicatorType,
  i18n
}) => {
  const [params, setParams] = useState<IIndicatorInfo[]>([]);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const getIndicatorTitle = () => {
    switch (indicatorType) {
      case SubChartIndicatorType.RSI:
        return i18n.indicators?.rsi || 'RSI';
      case SubChartIndicatorType.MACD:
        return i18n.indicators?.macd || 'MACD';
      case SubChartIndicatorType.VOLUME:
        return i18n.indicators?.volume || 'VOLUME';
      case SubChartIndicatorType.SAR:
        return i18n.indicators?.sar || 'SAR';
      case SubChartIndicatorType.KDJ:
        return i18n.indicators?.kdj || 'KDJ';
      case SubChartIndicatorType.ATR:
        return i18n.indicators?.atr || 'ATR';
      case SubChartIndicatorType.STOCHASTIC:
        return i18n.indicators?.stochastic || 'STOCHASTIC';
      case SubChartIndicatorType.CCI:
        return i18n.indicators?.cci || 'CCI';
      case SubChartIndicatorType.BBWIDTH:
        return i18n.indicators?.bbwidth || 'BBWIDTH';
      case SubChartIndicatorType.ADX:
        return i18n.indicators?.adx || 'ADX';
      case SubChartIndicatorType.OBV:
        return i18n.indicators?.obv || 'OBV';
      default:
        return i18n.subChartIndicators || '副图指标设置';
    }
  };

  useEffect(() => {
    if (isOpen && initialParams) {
      setParams([...initialParams]);
    }
  }, [isOpen, initialParams]);

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
    const constraints = getIndicatorConstraints(indicatorType);
    if (params.length >= constraints.maxParams || !constraints.allowAdd) return;

    const usedValues = params.map(p => p.paramValue);
    const availableValues = [6, 12, 14, 24, 26, 9, 20].filter(v => !usedValues.includes(v));
    if (availableValues.length === 0) return;

    const randomColor = getRandomColor();
    const newValue = availableValues[0];
    const newParam: IIndicatorInfo = {
      paramName: `${i18n.modal?.parameterName || 'Param'}${newValue}`,
      paramValue: newValue,
      lineColor: randomColor,
      lineWidth: 1,
      data: []
    };
    setParams([...params, newParam]);
  };

  const removeIndicatorParam = (paramIndex: number) => {
    const constraints = getIndicatorConstraints(indicatorType);
    if (params.length <= constraints.minParams || !constraints.allowDelete) return;

    const newParams = [...params];
    newParams.splice(paramIndex, 1);
    setParams(newParams);
  };

  const updateIndicatorName = (paramIndex: number, name: string) => {
    const newParams = [...params];
    newParams[paramIndex] = {
      ...newParams[paramIndex],
      paramName: name
    };
    setParams(newParams);
  };

  const updateIndicatorValue = (paramIndex: number, value: number) => {
    const newParams = [...params];
    newParams[paramIndex] = {
      ...newParams[paramIndex],
      paramValue: value
    };
    setParams(newParams);
  };

  const updateIndicatorColor = (paramIndex: number, color: string) => {
    const newParams = [...params];
    newParams[paramIndex] = {
      ...newParams[paramIndex],
      lineColor: color
    };
    setParams(newParams);
  };

  const updateIndicatorLineWidth = (paramIndex: number, lineWidth: number) => {
    const newParams = [...params];
    newParams[paramIndex] = {
      ...newParams[paramIndex],
      lineWidth
    };
    setParams(newParams);
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
    onConfirm(params);
  };

  const handleCancel = () => {
    setParams([...initialParams]);
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

  const getIndicatorConstraints = (type: SubChartIndicatorType | null) => {
    switch (type) {
      case SubChartIndicatorType.RSI:
        return {
          minParams: 1,
          maxParams: 1,
          allowAdd: false,
          allowDelete: false,
          defaultParams: [{ paramValue: 14, paramName: i18n.modal?.parameterName || 'Period', lineColor: '#2962FF', lineWidth: 1, data: [] }]
        };
      case SubChartIndicatorType.MACD:
        return {
          minParams: 3,
          maxParams: 3,
          allowAdd: false,
          allowDelete: false,
          defaultParams: [
            { paramValue: 12, paramName: i18n.indicators?.ma || 'Fast', lineColor: '#2962FF', lineWidth: 1, data: [] },
            { paramValue: 26, paramName: i18n.indicators?.ema || 'Slow', lineColor: '#FF6B6B', lineWidth: 1, data: [] },
            { paramValue: 9, paramName: i18n.indicators?.macd || 'Signal', lineColor: '#00C087', lineWidth: 1, data: [] }
          ]
        };
      case SubChartIndicatorType.VOLUME:
        return {
          minParams: 0,
          maxParams: 0,
          allowAdd: false,
          allowDelete: false,
          defaultParams: []
        };
      case SubChartIndicatorType.SAR:
        return {
          minParams: 2,
          maxParams: 2,
          allowAdd: false,
          allowDelete: false,
          defaultParams: [
            { paramValue: 0.02, paramName: i18n.indicators?.sar || 'Step', lineColor: '#2962FF', lineWidth: 1, data: [] },
            { paramValue: 0.2, paramName: i18n.indicators?.sar || 'Max', lineColor: '#FF6B6B', lineWidth: 1, data: [] }
          ]
        };
      case SubChartIndicatorType.KDJ:
        return {
          minParams: 3,
          maxParams: 3,
          allowAdd: false,
          allowDelete: false,
          defaultParams: [
            { paramValue: 9, paramName: 'K', lineColor: '#2962FF', lineWidth: 1, data: [] },
            { paramValue: 3, paramName: 'D', lineColor: '#FF6B6B', lineWidth: 1, data: [] },
            { paramValue: 3, paramName: 'J', lineColor: '#00C087', lineWidth: 1, data: [] }
          ]
        };
      case SubChartIndicatorType.ATR:
        return {
          minParams: 1,
          maxParams: 1,
          allowAdd: false,
          allowDelete: false,
          defaultParams: [{ paramValue: 14, paramName: i18n.modal?.parameterName || 'Period', lineColor: '#2962FF', lineWidth: 1, data: [] }]
        };
      case SubChartIndicatorType.STOCHASTIC:
        return {
          minParams: 3,
          maxParams: 3,
          allowAdd: false,
          allowDelete: false,
          defaultParams: [
            { paramValue: 14, paramName: 'K', lineColor: '#2962FF', lineWidth: 1, data: [] },
            { paramValue: 3, paramName: 'D', lineColor: '#FF6B6B', lineWidth: 1, data: [] },
            { paramValue: 3, paramName: i18n.indicators?.stochastic || 'Smooth', lineColor: '#00C087', lineWidth: 1, data: [] }
          ]
        };
      case SubChartIndicatorType.CCI:
        return {
          minParams: 1,
          maxParams: 1,
          allowAdd: false,
          allowDelete: false,
          defaultParams: [{ paramValue: 20, paramName: i18n.modal?.parameterName || 'Period', lineColor: '#2962FF', lineWidth: 1, data: [] }]
        };
      case SubChartIndicatorType.BBWIDTH:
        return {
          minParams: 1,
          maxParams: 1,
          allowAdd: false,
          allowDelete: false,
          defaultParams: [{ paramValue: 20, paramName: i18n.modal?.parameterName || 'Period', lineColor: '#2962FF', lineWidth: 1, data: [] }]
        };
      case SubChartIndicatorType.ADX:
        return {
          minParams: 1,
          maxParams: 1,
          allowAdd: false,
          allowDelete: false,
          defaultParams: [{ paramValue: 14, paramName: i18n.modal?.parameterName || 'Period', lineColor: '#2962FF', lineWidth: 1, data: [] }]
        };
      case SubChartIndicatorType.OBV:
        return {
          minParams: 0,
          maxParams: 0,
          allowAdd: false,
          allowDelete: false,
          defaultParams: []
        };
      default:
        return {
          minParams: 1,
          maxParams: 5,
          allowAdd: true,
          allowDelete: true,
          defaultParams: []
        };
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
    .subchart-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .subchart-scrollbar::-webkit-scrollbar-track {
      background: ${theme?.toolbar?.background || '#fafafa'};
      border-radius: 3px;
    }
    .subchart-scrollbar::-webkit-scrollbar-thumb {
      background: ${theme?.toolbar?.border || '#d9d9d9'};
      border-radius: 3px;
    }
    .subchart-scrollbar::-webkit-scrollbar-thumb:hover {
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

  const inputStyle: React.CSSProperties = {
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

  if (!isOpen || !params) return null;

  const constraints = getIndicatorConstraints(indicatorType);

  return ReactDOM.createPortal(
    <React.Fragment>
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
            <div style={modalTitleStyle}>
              {getIndicatorTitle()} {i18n.systemSettings?.setting || '设置'}
            </div>
          </div>
          <div style={modalBodyStyle}>
            <div
              style={indicatorsListStyle}
              className="subchart-scrollbar"
            >
              {params.map((param, paramIndex) => (
                <div key={`${param.paramName}-${paramIndex}`} style={indicatorItemStyle}>
                  <div style={itemLabelStyle}>
                    {param.paramName}
                  </div>

                  <input
                    type="text"
                    style={inputStyle}
                    value={param.paramName}
                    onChange={(e) => updateIndicatorName(paramIndex, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={i18n.modal?.parameterName || '参数名'}
                  />

                  <input
                    type="number"
                    style={inputStyle}
                    value={param.paramValue}
                    onChange={(e) => updateIndicatorValue(paramIndex, Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    min="1"
                    max="100"
                    placeholder={i18n.modal?.parameterValue || '数值'}
                  />

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

                  {constraints.allowDelete && (
                    <button
                      onClick={() => removeIndicatorParam(paramIndex)}
                      style={params.length <= constraints.minParams ? deleteButtonDisabledStyle : deleteButtonStyle}
                      disabled={params.length <= constraints.minParams}
                      type="button"
                      title={params.length <= constraints.minParams ?
                        `${i18n.modal?.keepAtLeastOne || '至少保留'}${constraints.minParams}${i18n.modal?.parameterName || '个参数'}` :
                        i18n.modal?.deleteParameter || "删除"}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addIndicatorParam}
              style={params.length >= constraints.maxParams || !constraints.allowAdd ? addButtonDisabledStyle : addButtonStyle}
              disabled={params.length >= constraints.maxParams || !constraints.allowAdd}
              type="button"
              title={params.length >= constraints.maxParams ?
                `${i18n.modal?.maximumParameters || '最多允许'}${constraints.maxParams}${i18n.modal?.parameterName || '个参数'}` :
                (!constraints.allowAdd ? i18n.modal?.keepAtLeastOne || "不允许添加参数" : i18n.modal?.addParameter || "添加参数")}
            >
              {params.length >= constraints.maxParams ?
                `${i18n.modal?.maximumParameters || '已达到最大参数数量'}(${constraints.maxParams}${i18n.modal?.parameterName || '个'})` :
                (!constraints.allowAdd ? i18n.modal?.keepAtLeastOne || "不允许添加参数" : `+ ${i18n.modal?.addParameter || "添加参数"}`)}
            </button>

            <div style={modalActionsStyle}>
              <button
                onClick={handleCancel}
                style={cancelButtonStyle}
                type="button"
              >
                {i18n.systemSettings?.cancel || '取消'}
              </button>
              <button
                onClick={handleConfirm}
                style={confirmButtonStyle}
                type="button"
              >
                {i18n.systemSettings?.confirm || '确定'}
              </button>
            </div>

            <div style={hintTextStyle}>
              {i18n.tooltips?.ctrlEnterToConfirm || 'Ctrl+Enter: 确认'}, {i18n.tooltips?.escToCancel || 'Esc: 取消'}, {i18n.modal?.dragToMove || '拖动标题栏移动'}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>,
    document.body
  );
};

export default SubChartIndicatorsSettingModal;
