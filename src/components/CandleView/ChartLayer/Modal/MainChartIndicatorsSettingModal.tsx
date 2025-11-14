import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ThemeConfig } from '../../CandleViewTheme';

export interface MainChartIndicatorsSettingModalItem {
    id: string;
    value: number;
    color: string;
}

interface MainChartIndicatorsSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (indicators: MainChartIndicatorsSettingModalItem[]) => void;
    initialIndicators?: MainChartIndicatorsSettingModalItem[];
    theme?: ThemeConfig;
    parentRef?: React.RefObject<HTMLDivElement | null>;
}

const MainChartIndicatorsSettingModal: React.FC<MainChartIndicatorsSettingModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialIndicators = [],
    theme,
    parentRef
}) => {
    const [indicators, setIndicators] = useState<MainChartIndicatorsSettingModalItem[]>([]);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialIndicators.length > 0) {
            setIndicators(initialIndicators);
        } else {
            setIndicators([{ id: '1', value: 0, color: theme?.chart?.lineColor || '#2962FF' }]);
        }
    }, [initialIndicators, isOpen, theme]);

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

    const addIndicator = () => {
        const newId = Date.now().toString();
        const randomColor = getRandomColor();
        setIndicators([
            ...indicators,
            { id: newId, value: 0, color: randomColor }
        ]);
    };

    const removeIndicator = (id: string) => {
        if (indicators.length <= 1) return;
        setIndicators(indicators.filter(item => item.id !== id));
    };

    const updateIndicatorValue = (id: string, value: number) => {
        setIndicators(
            indicators.map(item =>
                item.id === id ? { ...item, value } : item
            )
        );
    };

    const updateIndicatorColor = (id: string, color: string) => {
        setIndicators(
            indicators.map(item =>
                item.id === id ? { ...item, color } : item
            )
        );
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
        onConfirm(indicators);
    };

    const handleCancel = () => {
        if (initialIndicators.length > 0) {
            setIndicators(initialIndicators);
        } else {
            setIndicators([{ id: '1', value: 0, color: theme?.chart?.lineColor || '#2962FF' }]);
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

    const itemNumberStyle: React.CSSProperties = {
        fontSize: '12px',
        color: theme?.layout?.textColor || '#000000',
        minWidth: '20px',
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

    if (!isOpen) return null;

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
                        <div style={modalTitleStyle}>主图指标设置</div>
                    </div>
                    <div style={modalBodyStyle}>
                        <div
                            style={indicatorsListStyle}
                            className="indicators-scrollbar"
                        >
                            {indicators.map((item, index) => (
                                <div key={item.id} style={indicatorItemStyle}>
                                    <div style={itemNumberStyle}>
                                        {index + 1}.
                                    </div>


                                    <input
                                        type="number"
                                        style={numberInputStyle}
                                        value={item.value}
                                        onChange={(e) => updateIndicatorValue(item.id, Number(e.target.value))}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div style={colorPickerContainerStyle}>
                                        <div
                                            style={{
                                                ...colorDisplayStyle,
                                                backgroundColor: item.color
                                            }}
                                            onClick={(e) => {

                                                const colorInput = e.currentTarget.nextSibling as HTMLInputElement;
                                                colorInput?.click();
                                            }}
                                        />
                                        <input
                                            type="color"
                                            style={colorInputStyle}
                                            value={item.color}
                                            onChange={(e) => updateIndicatorColor(item.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeIndicator(item.id)}
                                        disabled={indicators.length <= 1}
                                        style={indicators.length <= 1 ? deleteButtonDisabledStyle : deleteButtonStyle}
                                        type="button"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addIndicator}
                            style={addButtonStyle}
                            type="button"
                        >
                            + 添加指标
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

export default MainChartIndicatorsSettingModal;