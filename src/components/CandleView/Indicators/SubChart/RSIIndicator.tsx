import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';
import ReactDOM from 'react-dom';
import { ICandleViewDataPoint, SubChartIndicatorType } from '../../types';

interface RSIIndicatorProps {
    theme: ThemeConfig;
    data: ICandleViewDataPoint[];
    height: number;
    width?: string;
    handleRemoveSubChartIndicator?: (indicatorType: SubChartIndicatorType) => void;
    onOpenSettings?: () => void;
    candleViewContainerRef?: React.RefObject<HTMLDivElement | null>;
}

interface RSIIndicatorParam {
    paramName: string;
    paramValue: number;
    lineColor: string;
    lineWidth: number;
}

interface RSIIndicatorInfo {
    id: string;
    params: RSIIndicatorParam[];
    nonce: number;
}

interface RSISettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (indicator: RSIIndicatorInfo) => void;
    initialIndicator?: RSIIndicatorInfo | null;
    theme?: ThemeConfig;
    parentRef?: React.RefObject<HTMLDivElement | null>;
}

const RSISettingModal: React.FC<RSISettingModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialIndicator = null,
    theme,
    parentRef
}) => {
    const [indicator, setIndicator] = useState<RSIIndicatorInfo | null>(null);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const rsiPeriods = [6, 12, 14, 24, 30];
    useEffect(() => {
        if (initialIndicator) {
            setIndicator(initialIndicator);
        } else {
            const defaultIndicator: RSIIndicatorInfo = {
                id: Date.now().toString(),
                params: [
                    {
                        paramName: 'RSI6',
                        paramValue: 6,
                        lineColor: '#FF6B6B',
                        lineWidth: 1
                    },
                    {
                        paramName: 'RSI12',
                        paramValue: 12,
                        lineColor: '#4ECDC4',
                        lineWidth: 1
                    },
                    {
                        paramName: 'RSI24',
                        paramValue: 24,
                        lineColor: '#45B7D1',
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
                    const modalHeight = 400;
                    const x = candleViewRect.left + (candleViewRect.width - modalWidth) / 2;
                    const y = candleViewRect.top + (candleViewRect.height - modalHeight) / 2;
                    return {
                        x: Math.max(10, x),
                        y: Math.max(10, y)
                    };
                } else {
                    const x = Math.max(10, (window.innerWidth - 400) / 2);
                    const y = Math.max(10, (window.innerHeight - 400) / 2);
                    return { x, y };
                }
            };
            setModalPosition(calculatePosition());
        }
    }, [isOpen, parentRef]);

    const addIndicatorParam = () => {
        if (!indicator || indicator.params.length >= 5) return;
        const usedPeriods = indicator.params.map(p => p.paramValue);
        const availablePeriods = rsiPeriods.filter(p => !usedPeriods.includes(p));
        if (availablePeriods.length === 0) return;
        const randomColor = getRandomColor();
        const newPeriod = availablePeriods[0];
        const newParam: RSIIndicatorParam = {
            paramName: `RSI${newPeriod}`,
            paramValue: newPeriod,
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

    const updateIndicatorValue = (paramIndex: number, value: number) => {
        if (!indicator || !indicator.params) return;
        const validValue = rsiPeriods.includes(value) ? value : 14;
        const isValueUsed = indicator.params.some((param, index) =>
            index !== paramIndex && param.paramValue === validValue
        );
        if (isValueUsed) return;
        const newParams = [...indicator.params];
        newParams[paramIndex] = {
            ...newParams[paramIndex],
            paramValue: validValue,
            paramName: `RSI${validValue}`
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
        .rsi-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .rsi-scrollbar::-webkit-scrollbar-track {
            background: ${theme?.toolbar?.background || '#fafafa'};
            border-radius: 3px;
        }
        .rsi-scrollbar::-webkit-scrollbar-thumb {
            background: ${theme?.toolbar?.border || '#d9d9d9'};
            border-radius: 3px;
        }
        .rsi-scrollbar::-webkit-scrollbar-thumb:hover {
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

    const numberSelectStyle: React.CSSProperties = {
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
                        <div style={modalTitleStyle}>RSI指标设置</div>
                    </div>
                    <div style={modalBodyStyle}>
                        <div
                            style={indicatorsListStyle}
                            className="rsi-scrollbar"
                        >
                            {indicator.params?.map((param, paramIndex) => {
                                const availablePeriods = rsiPeriods.filter(p =>
                                    !indicator.params.some((param, idx) => idx !== paramIndex && param.paramValue === p)
                                );

                                return (
                                    <div key={`${indicator.id}-${paramIndex}`} style={indicatorItemStyle}>
                                        <div style={itemLabelStyle}>
                                            {param.paramName}
                                        </div>

                                        <select
                                            style={numberSelectStyle}
                                            value={param.paramValue}
                                            onChange={(e) => updateIndicatorValue(paramIndex, Number(e.target.value))}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {rsiPeriods.map(period => (
                                                <option
                                                    key={period}
                                                    value={period}
                                                    disabled={!availablePeriods.includes(period) && period !== param.paramValue}
                                                >
                                                    {period}
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
                            title={indicator.params.length >= 5 ? "最多添加5个RSI参数" : "添加RSI参数"}
                        >
                            {indicator.params.length >= 5 ? "已达到最大参数数量(5个)" : "+ 添加RSI参数"}
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

export const RSIIndicator: React.FC<RSIIndicatorProps> = ({
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
    const [indicatorSettings, setIndicatorSettings] = useState<RSIIndicatorInfo>({
        id: 'rsi-indicator',
        params: [
            {
                paramName: 'RSI6',
                paramValue: 6,
                lineColor: '#FF6B6B',
                lineWidth: 1
            },
            {
                paramName: 'RSI12',
                paramValue: 12,
                lineColor: '#4ECDC4',
                lineWidth: 1
            },
            {
                paramName: 'RSI24',
                paramValue: 24,
                lineColor: '#45B7D1',
                lineWidth: 1
            }
        ],
        nonce: Date.now()
    });

    const calculateRSI = (data: ICandleViewDataPoint[], period: number) => {
        if (data.length < period + 1) return [];
        const rsiData: { time: any; value: number }[] = [];
        const gains: number[] = [];
        const losses: number[] = [];
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
        const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const firstRSI = 100 - (100 / (1 + firstRS));
        rsiData.push({
            time: data[period].time as any,
            value: firstRSI
        });
        for (let i = period; i < gains.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            rsiData.push({
                time: data[i + 1].time as any,
                value: rsi
            });
        }
        return rsiData;
    };

    const calculateMultipleRSI = (data: ICandleViewDataPoint[]) => {
        const result: { [key: string]: { time: any; value: number }[] } = {};
        indicatorSettings.params.forEach(param => {
            const rsiData = calculateRSI(data, param.paramValue);
            if (rsiData.length > 0) {
                result[param.paramName] = rsiData;
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
            },
            timeScale: {
                visible: true,
                borderColor: theme.grid.horzLines.color,
                timeVisible: true,
                tickMarkFormatter: (time: number) => {
                    const date = new Date(time * 1000);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                },
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
        const rsiDataSets = calculateMultipleRSI(data);
        indicatorSettings.params.forEach(param => {
            const rsiData = rsiDataSets[param.paramName];
            if (rsiData && rsiData.length > 0) {
                const series = chart.addSeries(LineSeries, {
                    color: param.lineColor,
                    title: param.paramName,
                    lineWidth: param.lineWidth as any
                });
                series.setData(rsiData);
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

    const handleConfirmSettings = (newSettings: RSIIndicatorInfo) => {
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
                    <span>RSI</span>
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
                        onClick={() => handleRemoveSubChartIndicator && handleRemoveSubChartIndicator(SubChartIndicatorType.RSI)}
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
            <RSISettingModal
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