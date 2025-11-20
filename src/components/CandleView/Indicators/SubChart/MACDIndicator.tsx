import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries, HistogramSeries, Time } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';
import ReactDOM from 'react-dom';
import { SubChartIndicatorType, ICandleViewDataPoint } from '../../types';

interface MACDIndicatorProps {
    theme: ThemeConfig;
    data: ICandleViewDataPoint[];
    height: number;
    width?: string;
    handleRemoveSubChartIndicator?: (indicatorType: SubChartIndicatorType) => void;
    onOpenSettings?: () => void;
    candleViewContainerRef?: React.RefObject<HTMLDivElement | null>;
}

interface MACDIndicatorParam {
    paramName: string;
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
    macdLineColor: string;
    signalLineColor: string;
    histogramColor: string;
    histogramUpColor: string;
    histogramDownColor: string;
    lineWidth: number;
}

interface MACDIndicatorInfo {
    id: string;
    params: MACDIndicatorParam[];
    nonce: number;
}

interface MACDSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (indicator: MACDIndicatorInfo) => void;
    initialIndicator?: MACDIndicatorInfo | null;
    theme?: ThemeConfig;
    parentRef?: React.RefObject<HTMLDivElement | null>;
}

const MACDSettingModal: React.FC<MACDSettingModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialIndicator = null,
    theme,
    parentRef
}) => {
    const [indicator, setIndicator] = useState<MACDIndicatorInfo | null>(null);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    const fastPeriodOptions = [8, 12, 13, 14, 15, 16, 20, 21, 26];
    const slowPeriodOptions = [12, 21, 24, 25, 26, 27, 30, 50, 52];
    const signalPeriodOptions = [5, 7, 8, 9, 10, 11, 12, 14, 15];

    useEffect(() => {
        if (initialIndicator) {
            setIndicator(initialIndicator);
        } else {
            const defaultIndicator: MACDIndicatorInfo = {
                id: Date.now().toString(),
                params: [
                    {
                        paramName: 'MACD',
                        fastPeriod: 12,
                        slowPeriod: 26,
                        signalPeriod: 9,
                        macdLineColor: '#2962FF',
                        signalLineColor: '#FF6B6B',
                        histogramColor: '#26C6DA',
                        histogramUpColor: '#26C6DA',
                        histogramDownColor: '#FF6B6B',
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

    const updateFastPeriod = (paramIndex: number, value: number) => {
        if (!indicator || !indicator.params) return;
        const newParams = [...indicator.params];
        newParams[paramIndex] = {
            ...newParams[paramIndex],
            fastPeriod: value
        };
        setIndicator({
            ...indicator,
            params: newParams
        });
    };

    const updateSlowPeriod = (paramIndex: number, value: number) => {
        if (!indicator || !indicator.params) return;
        const newParams = [...indicator.params];
        newParams[paramIndex] = {
            ...newParams[paramIndex],
            slowPeriod: value
        };
        setIndicator({
            ...indicator,
            params: newParams
        });
    };

    const updateSignalPeriod = (paramIndex: number, value: number) => {
        if (!indicator || !indicator.params) return;
        const newParams = [...indicator.params];
        newParams[paramIndex] = {
            ...newParams[paramIndex],
            signalPeriod: value
        };
        setIndicator({
            ...indicator,
            params: newParams
        });
    };

    const updateMACDLineColor = (paramIndex: number, color: string) => {
        if (!indicator || !indicator.params) return;
        const newParams = [...indicator.params];
        newParams[paramIndex] = { ...newParams[paramIndex], macdLineColor: color };
        setIndicator({
            ...indicator,
            params: newParams
        });
    };

    const updateSignalLineColor = (paramIndex: number, color: string) => {
        if (!indicator || !indicator.params) return;
        const newParams = [...indicator.params];
        newParams[paramIndex] = { ...newParams[paramIndex], signalLineColor: color };
        setIndicator({
            ...indicator,
            params: newParams
        });
    };

    const updateHistogramUpColor = (paramIndex: number, color: string) => {
        if (!indicator || !indicator.params) return;
        const newParams = [...indicator.params];
        newParams[paramIndex] = { ...newParams[paramIndex], histogramUpColor: color };
        setIndicator({
            ...indicator,
            params: newParams
        });
    };

    const updateHistogramDownColor = (paramIndex: number, color: string) => {
        if (!indicator || !indicator.params) return;
        const newParams = [...indicator.params];
        newParams[paramIndex] = { ...newParams[paramIndex], histogramDownColor: color };
        setIndicator({
            ...indicator,
            params: newParams
        });
    };

    const updateLineWidth = (paramIndex: number, lineWidth: number) => {
        if (!indicator || !indicator.params) return;
        const newParams = [...indicator.params];
        newParams[paramIndex] = { ...newParams[paramIndex], lineWidth };
        setIndicator({
            ...indicator,
            params: newParams
        });
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
        .macd-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .macd-scrollbar::-webkit-scrollbar-track {
            background: ${theme?.toolbar?.background || '#fafafa'};
            border-radius: 3px;
        }
        .macd-scrollbar::-webkit-scrollbar-thumb {
            background: ${theme?.toolbar?.border || '#d9d9d9'};
            border-radius: 3px;
        }
        .macd-scrollbar::-webkit-scrollbar-thumb:hover {
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
        marginBottom: '16px',
        padding: '12px',
        background: theme?.toolbar?.background || '#fafafa',
        border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
        borderRadius: '4px',
    };

    const itemLabelStyle: React.CSSProperties = {
        fontSize: '12px',
        color: theme?.layout?.textColor || '#000000',
        fontWeight: 'bold',
        marginBottom: '8px',
    };

    const paramRowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
    };

    const paramLabelStyle: React.CSSProperties = {
        fontSize: '11px',
        color: theme?.layout?.textColor || '#000000',
        minWidth: '80px',
    };

    const selectStyle: React.CSSProperties = {
        width: '80px',
        padding: '4px 8px',
        background: theme?.toolbar?.background || '#fafafa',
        color: theme?.layout?.textColor || '#000000',
        border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
        borderRadius: '4px',
        fontSize: '11px',
    };

    const lineWidthSelectStyle: React.CSSProperties = {
        width: '60px',
        padding: '4px 8px',
        background: theme?.toolbar?.background || '#fafafa',
        color: theme?.layout?.textColor || '#000000',
        border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
        borderRadius: '4px',
        fontSize: '11px',
    };

    const colorPickerContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        position: 'relative',
    };

    const colorDisplayStyle: React.CSSProperties = {
        width: '20px',
        height: '20px',
        border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
        borderRadius: '3px',
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
        minWidth: '60px',
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
                        <div style={modalTitleStyle}>MACD指标设置</div>
                    </div>
                    <div style={modalBodyStyle}>
                        <div
                            style={indicatorsListStyle}
                            className="macd-scrollbar"
                        >
                            {indicator.params?.map((param, paramIndex) => (
                                <div key={`${indicator.id}-${paramIndex}`} style={indicatorItemStyle}>
                                    <div style={itemLabelStyle}>
                                        {param.paramName}
                                    </div>
                                    <div style={paramRowStyle}>
                                        <div style={paramLabelStyle}>快速EMA:</div>
                                        <select
                                            style={selectStyle}
                                            value={param.fastPeriod}
                                            onChange={(e) => updateFastPeriod(paramIndex, Number(e.target.value))}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {fastPeriodOptions.map(period => (
                                                <option key={period} value={period}>
                                                    {period}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={paramRowStyle}>
                                        <div style={paramLabelStyle}>慢速EMA:</div>
                                        <select
                                            style={selectStyle}
                                            value={param.slowPeriod}
                                            onChange={(e) => updateSlowPeriod(paramIndex, Number(e.target.value))}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {slowPeriodOptions.map(period => (
                                                <option key={period} value={period}>
                                                    {period}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={paramRowStyle}>
                                        <div style={paramLabelStyle}>信号周期:</div>
                                        <select
                                            style={selectStyle}
                                            value={param.signalPeriod}
                                            onChange={(e) => updateSignalPeriod(paramIndex, Number(e.target.value))}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {signalPeriodOptions.map(period => (
                                                <option key={period} value={period}>
                                                    {period}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={paramRowStyle}>
                                        <div style={paramLabelStyle}>线宽:</div>
                                        <select
                                            style={lineWidthSelectStyle}
                                            value={param.lineWidth}
                                            onChange={(e) => updateLineWidth(paramIndex, Number(e.target.value))}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value={1}>1px</option>
                                            <option value={2}>2px</option>
                                            <option value={3}>3px</option>
                                            <option value={4}>4px</option>
                                            <option value={5}>5px</option>
                                        </select>
                                    </div>
                                    <div style={paramRowStyle}>
                                        <div style={colorLabelStyle}>MACD线:</div>
                                        <div style={colorPickerContainerStyle}>
                                            <div
                                                style={{
                                                    ...colorDisplayStyle,
                                                    backgroundColor: param.macdLineColor
                                                }}
                                                onClick={(e) => {
                                                    const colorInput = e.currentTarget.nextSibling as HTMLInputElement;
                                                    colorInput?.click();
                                                }}
                                            />
                                            <input
                                                type="color"
                                                style={colorInputStyle}
                                                value={param.macdLineColor}
                                                onChange={(e) => updateMACDLineColor(paramIndex, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div style={paramRowStyle}>
                                        <div style={colorLabelStyle}>信号线:</div>
                                        <div style={colorPickerContainerStyle}>
                                            <div
                                                style={{
                                                    ...colorDisplayStyle,
                                                    backgroundColor: param.signalLineColor
                                                }}
                                                onClick={(e) => {
                                                    const colorInput = e.currentTarget.nextSibling as HTMLInputElement;
                                                    colorInput?.click();
                                                }}
                                            />
                                            <input
                                                type="color"
                                                style={colorInputStyle}
                                                value={param.signalLineColor}
                                                onChange={(e) => updateSignalLineColor(paramIndex, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div style={paramRowStyle}>
                                        <div style={colorLabelStyle}>上涨柱:</div>
                                        <div style={colorPickerContainerStyle}>
                                            <div
                                                style={{
                                                    ...colorDisplayStyle,
                                                    backgroundColor: param.histogramUpColor
                                                }}
                                                onClick={(e) => {
                                                    const colorInput = e.currentTarget.nextSibling as HTMLInputElement;
                                                    colorInput?.click();
                                                }}
                                            />
                                            <input
                                                type="color"
                                                style={colorInputStyle}
                                                value={param.histogramUpColor}
                                                onChange={(e) => updateHistogramUpColor(paramIndex, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div style={paramRowStyle}>
                                        <div style={colorLabelStyle}>下跌柱:</div>
                                        <div style={colorPickerContainerStyle}>
                                            <div
                                                style={{
                                                    ...colorDisplayStyle,
                                                    backgroundColor: param.histogramDownColor
                                                }}
                                                onClick={(e) => {
                                                    const colorInput = e.currentTarget.nextSibling as HTMLInputElement;
                                                    colorInput?.click();
                                                }}
                                            />
                                            <input
                                                type="color"
                                                style={colorInputStyle}
                                                value={param.histogramDownColor}
                                                onChange={(e) => updateHistogramDownColor(paramIndex, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
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

export const MACDIndicator: React.FC<MACDIndicatorProps> = ({
    theme,
    data,
    height,
    width,
    handleRemoveSubChartIndicator,
    candleViewContainerRef
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesMapRef = useRef<{
        macdLine?: ISeriesApi<'Line'>;
        signalLine?: ISeriesApi<'Line'>;
        histogram?: ISeriesApi<'Histogram'>;
    }>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const [currentValues, setCurrentValues] = useState<{
        MACD?: number;
        Signal?: number;
        Histogram?: number
    } | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [indicatorSettings, setIndicatorSettings] = useState<MACDIndicatorInfo>({
        id: 'macd-indicator',
        params: [
            {
                paramName: 'MACD',
                fastPeriod: 12,
                slowPeriod: 26,
                signalPeriod: 9,
                macdLineColor: '#2962FF',
                signalLineColor: '#FF6B6B',
                histogramColor: '#26C6DA',
                histogramUpColor: '#26C6DA',
                histogramDownColor: '#FF6B6B',
                lineWidth: 1
            }
        ],
        nonce: Date.now()
    });

    const calculateMACD = (data: ICandleViewDataPoint[], fastPeriod: number, slowPeriod: number, signalPeriod: number) => {
        const calculateEMA = (data: number[], period: number) => {
            if (data.length < period) return [];
            const multiplier = 2 / (period + 1);
            const ema = [data[0]];

            for (let i = 1; i < data.length; i++) {
                ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
            }
            return ema;
        };
        const values = data.map(d => d.close);
        if (values.length < slowPeriod) return [];
        const emaFast = calculateEMA(values, fastPeriod);
        const emaSlow = calculateEMA(values, slowPeriod);
        const macdLine: number[] = [];
        const startIndex = Math.max(fastPeriod, slowPeriod) - 1;
        for (let i = startIndex; i < values.length; i++) {
            macdLine.push(emaFast[i] - emaSlow[i]);
        }
        if (macdLine.length < signalPeriod) return [];
        const signalLine = calculateEMA(macdLine, signalPeriod);
        const histogram: number[] = [];
        const finalStartIndex = signalPeriod - 1;
        for (let i = finalStartIndex; i < macdLine.length; i++) {
            histogram.push(macdLine[i] - signalLine[i - finalStartIndex]);
        }
        const result = [];
        const timeOffset = startIndex + finalStartIndex;
        for (let i = 0; i < histogram.length; i++) {
            if (data[timeOffset + i]) {
                const originalTime = data[timeOffset + i].time;
                const timeValue = typeof originalTime === 'string' ?
                    new Date(originalTime).getTime() / 1000 : originalTime;
                result.push({
                    time: timeValue, 
                    macd: macdLine[finalStartIndex + i],
                    signal: signalLine[i],
                    histogram: histogram[i]
                });
            }
        }
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
            },
            handleScale: true,
            handleScroll: true,
            crosshair: {
                mode: 1,
            },
        });

        Object.values(seriesMapRef.current).forEach(series => {
            if (series) {
                try {
                    chart.removeSeries(series);
                } catch (error) {
                    console.error(error);
                }
            }
        });
        seriesMapRef.current = {};
        const param = indicatorSettings.params[0];
        const macdData = calculateMACD(data, param.fastPeriod, param.slowPeriod, param.signalPeriod);
        if (macdData.length > 0) {
            const macdLineSeries = chart.addSeries(LineSeries, {
                color: param.macdLineColor,
                title: 'MACD',
                lineWidth: param.lineWidth as any
            });
            macdLineSeries.setData(macdData.map(d => ({
                time: d.time as Time,
                value: d.macd
            })));
            seriesMapRef.current.macdLine = macdLineSeries;
            const signalLineSeries = chart.addSeries(LineSeries, {
                color: param.signalLineColor,
                title: 'Signal',
                lineWidth: param.lineWidth as any
            });
            signalLineSeries.setData(macdData.map(d => ({
                time: d.time as Time,
                value: d.signal
            })));
            seriesMapRef.current.signalLine = signalLineSeries;
            const histogramSeries = chart.addSeries(HistogramSeries, {
                color: param.histogramColor,
                title: 'Histogram'
            });
            histogramSeries.setData(macdData.map(d => ({
                time: d.time as Time,
                value: d.histogram,
                color: d.histogram >= 0 ? param.histogramUpColor : param.histogramDownColor
            })));
            seriesMapRef.current.histogram = histogramSeries;
        }
        chartRef.current = chart;
        const crosshairMoveHandler = (param: any) => {
            if (!param || !param.time) {
                setCurrentValues(null);
                return;
            }
            try {
                const seriesData = param.seriesData;
                if (seriesData && seriesData.size > 0) {
                    const values: { MACD?: number; Signal?: number; Histogram?: number } = {};
                    if (seriesMapRef.current.macdLine) {
                        const macdValue = seriesData.get(seriesMapRef.current.macdLine);
                        if (macdValue && macdValue.value !== undefined) {
                            values.MACD = macdValue.value;
                        }
                    }
                    if (seriesMapRef.current.signalLine) {
                        const signalValue = seriesData.get(seriesMapRef.current.signalLine);
                        if (signalValue && signalValue.value !== undefined) {
                            values.Signal = signalValue.value;
                        }
                    }
                    if (seriesMapRef.current.histogram) {
                        const histogramValue = seriesData.get(seriesMapRef.current.histogram);
                        if (histogramValue && histogramValue.value !== undefined) {
                            values.Histogram = histogramValue.value;
                        }
                    }
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

    const handleConfirmSettings = (newSettings: MACDIndicatorInfo) => {
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
                    <span>MACD</span>
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
                        onClick={() => handleRemoveSubChartIndicator && handleRemoveSubChartIndicator(SubChartIndicatorType.MACD)}
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
                        {currentValues.MACD !== undefined && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{
                                    fontWeight: 'bold',
                                    opacity: 0.8,
                                    color: indicatorSettings.params[0].macdLineColor
                                }}>
                                    MACD
                                </span>
                                <span style={{
                                    fontWeight: 'normal',
                                    color: indicatorSettings.params[0].macdLineColor,
                                    minWidth: '45px'
                                }}>
                                    ({currentValues.MACD.toFixed(4)})
                                </span>
                            </span>
                        )}
                        {currentValues.Signal !== undefined && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{
                                    fontWeight: 'bold',
                                    opacity: 0.8,
                                    color: indicatorSettings.params[0].signalLineColor
                                }}>
                                    Signal
                                </span>
                                <span style={{
                                    fontWeight: 'normal',
                                    color: indicatorSettings.params[0].signalLineColor,
                                    minWidth: '45px'
                                }}>
                                    ({currentValues.Signal.toFixed(4)})
                                </span>
                            </span>
                        )}
                        {currentValues.Histogram !== undefined && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{
                                    fontWeight: 'bold',
                                    opacity: 0.8,
                                    color: currentValues.Histogram >= 0
                                        ? indicatorSettings.params[0].histogramUpColor
                                        : indicatorSettings.params[0].histogramDownColor
                                }}>
                                    Hist
                                </span>
                                <span style={{
                                    fontWeight: 'normal',
                                    color: currentValues.Histogram >= 0
                                        ? indicatorSettings.params[0].histogramUpColor
                                        : indicatorSettings.params[0].histogramDownColor,
                                    minWidth: '45px'
                                }}>
                                    ({currentValues.Histogram.toFixed(4)})
                                </span>
                            </span>
                        )}
                    </div>
                )}
            </div>
            <MACDSettingModal
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