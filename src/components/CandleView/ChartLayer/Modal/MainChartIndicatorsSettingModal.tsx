import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ThemeConfig } from '../../Theme';
import { MainChartIndicatorType } from '../../types';
import { MainChartIndicatorInfo, MainChartIndicatorParam } from '../../Indicators/MainChart/MainChartIndicatorInfo';

interface MainChartIndicatorsSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (indicator: MainChartIndicatorInfo) => void;
    initialIndicator?: MainChartIndicatorInfo | null;
    theme?: ThemeConfig;
    parentRef?: React.RefObject<HTMLDivElement | null>;
    indicatorType?: MainChartIndicatorType | null;
}

const MainChartIndicatorsSettingModal: React.FC<MainChartIndicatorsSettingModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialIndicator = null,
    theme,
    parentRef,
    indicatorType = null
}) => {
    const [indicator, setIndicator] = useState<MainChartIndicatorInfo | null>(null);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialIndicator) {
            setIndicator(initialIndicator);
        } else {
            const defaultIndicator = getDefaultIndicatorByType(indicatorType);
            setIndicator(defaultIndicator);
        }
    }, [initialIndicator, isOpen, theme, indicatorType]);

    useEffect(() => {
        if (isOpen) {
            const calculatePosition = () => {
                if (parentRef?.current) {
                    const parentRect = parentRef.current.getBoundingClientRect();
                    const x = parentRect.left + (parentRect.width - 400) / 2;
                    const y = parentRect.top + (parentRect.height - 400) / 2;
                    return { x, y };
                } else {
                    const x = Math.max(10, (window.innerWidth - 400) / 2);
                    const y = Math.max(10, (window.innerHeight - 400) / 2);
                    return { x, y };
                }
            };
            setModalPosition(calculatePosition());
        }
    }, [isOpen, parentRef]);

    const getDefaultIndicatorByType = (type: MainChartIndicatorType | null): MainChartIndicatorInfo => {
        const defaultColor = theme?.chart?.lineColor || '#2962FF';
        switch (type) {
            case MainChartIndicatorType.VWAP:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.VWAP,
                    params: [{
                        paramName: 'VWAP',
                        paramValue: 0,
                        lineColor: defaultColor,
                        lineWidth: 1
                    }], nonce: Date.now()
                };

            case MainChartIndicatorType.ENVELOPE:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.ENVELOPE,
                    params: [
                        {
                            paramName: '周期',
                            paramValue: 20,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: '偏移百分比',
                            paramValue: 2.5,
                            lineColor: getRandomColor(),
                            lineWidth: 1
                        }
                    ], nonce: Date.now()
                };

            case MainChartIndicatorType.DONCHIAN:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.DONCHIAN,
                    params: [
                        {
                            paramName: '周期',
                            paramValue: 20,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: '上轨周期',
                            paramValue: 20,
                            lineColor: getRandomColor(),
                            lineWidth: 1
                        },
                        {
                            paramName: '下轨周期',
                            paramValue: 20,
                            lineColor: getRandomColor(),
                            lineWidth: 1
                        }
                    ], nonce: Date.now()
                };

            case MainChartIndicatorType.BOLLINGER:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.BOLLINGER,
                    params: [
                        {
                            paramName: '周期',
                            paramValue: 20,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: '上轨标准差',
                            paramValue: 2,
                            lineColor: getRandomColor(),
                            lineWidth: 1
                        },
                        {
                            paramName: '下轨标准差',
                            paramValue: 2,
                            lineColor: getRandomColor(),
                            lineWidth: 1
                        }
                    ], nonce: Date.now()
                };

            case MainChartIndicatorType.EMA:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.EMA,
                    params: [
                        {
                            paramName: '周期1',
                            paramValue: 12,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: '周期2',
                            paramValue: 26,
                            lineColor: getRandomColor(),
                            lineWidth: 1
                        }
                    ], nonce: Date.now()
                };

            case MainChartIndicatorType.ICHIMOKU:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.ICHIMOKU,
                    params: [
                        {
                            paramName: '转换线周期',
                            paramValue: 9,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: '基准线周期',
                            paramValue: 26,
                            lineColor: getRandomColor(),
                            lineWidth: 1
                        },
                        {
                            paramName: '先行跨度周期',
                            paramValue: 52,
                            lineColor: getRandomColor(),
                            lineWidth: 1
                        },
                        {
                            paramName: '滞后跨度周期',
                            paramValue: 26,
                            lineColor: getRandomColor(),
                            lineWidth: 1
                        }
                    ], nonce: Date.now()
                };

            case MainChartIndicatorType.MA:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.MA,
                    params: [
                        {
                            paramName: '周期1',
                            paramValue: 5,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: '周期2',
                            paramValue: 10,
                            lineColor: getRandomColor(),
                            lineWidth: 1
                        },
                        {
                            paramName: '周期3',
                            paramValue: 20,
                            lineColor: getRandomColor(),
                            lineWidth: 1
                        }
                    ], nonce: Date.now()
                };
            default:
                return {
                    id: Date.now().toString(),
                    type: type,
                    params: [{
                        paramName: '周期1',
                        paramValue: 0,
                        lineColor: defaultColor,
                        lineWidth: 1
                    }], nonce: Date.now()
                };
        }
    };

    const canModifyItems = (): boolean => {
        return indicatorType === MainChartIndicatorType.MA ||
            indicatorType === MainChartIndicatorType.EMA;
    };

    const addIndicatorParam = () => {
        if (!canModifyItems() || !indicator) return;
        const randomColor = getRandomColor();
        const paramCount = indicator?.params?.length || 0;
        let paramName = '';
        if (indicatorType === MainChartIndicatorType.MA) {
            paramName = `MA`;
        } else if (indicatorType === MainChartIndicatorType.EMA) {
            paramName = `EMA`;
        } else {
            paramName = getIndicatorItemLabel(paramCount);
        }
        const newParam: MainChartIndicatorParam = {
            paramName: paramName,
            paramValue: 0,
            lineColor: randomColor,
            lineWidth: 1
        };
        setIndicator({
            ...indicator,
            params: [...(indicator.params || []), newParam]
        });
    };

    const removeIndicatorParam = (paramIndex: number) => {
        if (!canModifyItems() || !indicator || !indicator.params) return;
        if (indicator.params.length > 1) {
            const newParams = [...indicator.params];
            newParams.splice(paramIndex, 1);
            const updatedParams = newParams.map((param, index) => {
                let newParamName = '';
                if (indicatorType === MainChartIndicatorType.MA || indicatorType === MainChartIndicatorType.EMA) {
                    newParamName = `MA`;
                }
                return {
                    ...param,
                    paramName: newParamName
                };
            });
            setIndicator({
                ...indicator,
                params: updatedParams
            });
        }
    };

    const updateIndicatorValue = (paramIndex: number, value: number) => {
        if (!indicator || !indicator.params) return;

        const newParams = [...indicator.params];
        newParams[paramIndex] = { ...newParams[paramIndex], paramValue: value };

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
            '#DDA0DD'
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
        } else {
            setIndicator(getDefaultIndicatorByType(indicatorType));
        }
        onClose();
    };

    const getIndicatorTypeName = (): string => {
        switch (indicatorType) {
            case MainChartIndicatorType.MA:
                return '移动平均线 (MA)';
            case MainChartIndicatorType.EMA:
                return '指数移动平均线 (EMA)';
            case MainChartIndicatorType.BOLLINGER:
                return '布林通道 (BOLL)';
            case MainChartIndicatorType.ICHIMOKU:
                return '一目均衡表 (ICHIMOKU)';
            case MainChartIndicatorType.DONCHIAN:
                return '唐奇安通道 (DONCHIAN)';
            case MainChartIndicatorType.ENVELOPE:
                return '包络线 (ENVELOPE)';
            case MainChartIndicatorType.VWAP:
                return '成交量加权平均价 (VWAP)';
            default:
                return '技术指标设置';
        }
    };

    const getIndicatorItemLabel = (index: number): string => {
        if (indicatorType === MainChartIndicatorType.BOLLINGER) {
            const labels = ['周期', '上轨标准差', '下轨标准差'];
            return labels[index] || `参数 ${index + 1}`;
        }
        if (indicatorType === MainChartIndicatorType.ICHIMOKU) {
            const labels = ['转换线周期', '基准线周期', '先行跨度周期', '滞后跨度周期'];
            return labels[index] || `参数 ${index + 1}`;
        }
        if (indicatorType === MainChartIndicatorType.DONCHIAN) {
            const labels = ['周期', '上轨周期', '下轨周期'];
            return labels[index] || `参数 ${index + 1}`;
        }
        if (indicatorType === MainChartIndicatorType.ENVELOPE) {
            const labels = ['周期', '偏移百分比'];
            return labels[index] || `参数 ${index + 1}`;
        }
        if (indicatorType === MainChartIndicatorType.VWAP) {
            return '锚定时间';
        }
        if (indicatorType === MainChartIndicatorType.EMA || indicatorType === MainChartIndicatorType.MA) {
            return `周期 ${index + 1}`;
        }
        return `参数 ${index + 1}`;
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
                const maxY = window.innerHeight - 400;
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
        .indicators-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .indicators-scrollbar::-webkit-scrollbar-track {
            background: ${theme?.toolbar?.background || '#fafafa'};
            border-radius: 3px;
        }
        .indicators-scrollbar::-webkit-scrollbar-thumb {
            background: ${theme?.toolbar?.border || '#d9d9d9'};
            border-radius: 3px;
        }
        .indicators-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${theme?.layout?.textColor || '#000000'}80;
        }
    `;

    const modalContentStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${modalPosition.x}px`,
        top: `${modalPosition.y}px`,
        background: theme?.toolbar?.background || '#fafafa',
        border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
        borderRadius: '8px',
        padding: '0',
        width: '400px',
        maxWidth: '90vw',
        height: '400px',
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

    const numberInputStyle: React.CSSProperties = {
        width: '60px',
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
                        <div style={modalTitleStyle}>{getIndicatorTypeName()}</div>
                    </div>
                    <div style={modalBodyStyle}>
                        <div
                            style={indicatorsListStyle}
                            className="indicators-scrollbar"
                        >
                            {indicator.params?.map((param, paramIndex) => (
                                <div key={`${indicator.id}-${paramIndex}`} style={indicatorItemStyle}>
                                    <div style={itemLabelStyle}>
                                        {getIndicatorItemLabel(paramIndex)}
                                    </div>

                                    <input
                                        type="number"
                                        style={numberInputStyle}
                                        value={param.paramValue}
                                        onChange={(e) => updateIndicatorValue(paramIndex, Number(e.target.value))}
                                        onClick={(e) => e.stopPropagation()}
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

                                    {canModifyItems() && indicator.params && (
                                        <button
                                            onClick={() => removeIndicatorParam(paramIndex)}
                                            style={indicator.params.length <= 1 ? deleteButtonDisabledStyle : deleteButtonStyle}
                                            disabled={!indicator.params || indicator.params.length <= 1}
                                            type="button"
                                            title={indicator.params.length <= 1 ? "至少保留一个参数" : "删除此参数"}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {canModifyItems() && (
                            <button
                                onClick={addIndicatorParam}
                                style={addButtonStyle}
                                type="button"
                            >
                                + 添加参数
                            </button>
                        )}
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

export default MainChartIndicatorsSettingModal;