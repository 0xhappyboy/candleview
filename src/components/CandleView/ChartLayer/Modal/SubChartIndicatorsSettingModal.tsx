import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ThemeConfig } from '../../CandleViewTheme';
import { IIndicatorInfo } from '../../Indicators/SubChart/IIndicator';

interface SubChartIndicatorsSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: IIndicatorInfo[]) => void;
  initialParams: IIndicatorInfo[];
  theme?: ThemeConfig;
  parentRef?: React.RefObject<HTMLDivElement | null>;
}

const SubChartIndicatorsSettingModal: React.FC<SubChartIndicatorsSettingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialParams,
  theme,
  parentRef
}) => {
  const [params, setParams] = useState<IIndicatorInfo[]>([]);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // 初始化参数
  useEffect(() => {
    if (isOpen && initialParams) {
      setParams([...initialParams]);
    }
  }, [isOpen, initialParams]);

  // 模态框位置计算
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
    if (params.length >= 5) return;
    
    const usedValues = params.map(p => p.paramValue);
    const availableValues = [6, 12, 14, 24, 26, 9, 20].filter(v => !usedValues.includes(v));
    if (availableValues.length === 0) return;
    
    const randomColor = getRandomColor();
    const newValue = availableValues[0];
    const newParam: IIndicatorInfo = {
      paramName: `Param${newValue}`,
      paramValue: newValue,
      lineColor: randomColor,
      lineWidth: 1,
      data: []
    };
    setParams([...params, newParam]);
  };

  const removeIndicatorParam = (paramIndex: number) => {
    if (params.length <= 1) return;
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

  // 样式定义（与RSISettingModal类似）
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
            <div style={modalTitleStyle}>副图指标设置</div>
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
                  />

                  <input
                    type="number"
                    style={inputStyle}
                    value={param.paramValue}
                    onChange={(e) => updateIndicatorValue(paramIndex, Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    min="1"
                    max="100"
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

                  <button
                    onClick={() => removeIndicatorParam(paramIndex)}
                    style={params.length <= 1 ? deleteButtonDisabledStyle : deleteButtonStyle}
                    disabled={params.length <= 1}
                    type="button"
                    title={params.length <= 1 ? "至少保留一个参数" : "删除此参数"}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addIndicatorParam}
              style={params.length >= 5 ? addButtonDisabledStyle : addButtonStyle}
              disabled={params.length >= 5}
              type="button"
              title={params.length >= 5 ? "最多添加5个参数" : "添加参数"}
            >
              {params.length >= 5 ? "已达到最大参数数量(5个)" : "+ 添加参数"}
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

export default SubChartIndicatorsSettingModal;