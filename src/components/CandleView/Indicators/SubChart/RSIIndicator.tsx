import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';

interface RSIIndicatorProps {
    theme: ThemeConfig;
    data: Array<{ time: string; value: number }>;
    height: number;
    width?: string;
    handleRemoveSubChartIndicator?: (indicatorId: string) => void;
    onOpenSettings?: () => void;
}

export const RSIIndicator: React.FC<RSIIndicatorProps> = ({
    theme,
    data,
    height,
    width,
    handleRemoveSubChartIndicator,
    onOpenSettings
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesMapRef = useRef<{ [key: string]: ISeriesApi<'Line'> }>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const [currentValues, setCurrentValues] = useState<{ [key: string]: number } | null>(null);

    const calculateMultipleRSI = (data: Array<{ time: string; value: number }>) => {
        const periods = [6, 12, 24]; // RSI6, RSI12, RSI24
        const result: { [key: string]: Array<{ time: string; value: number }> } = {};
        periods.forEach(period => {
            if (data.length < period + 1) return;
            const rsiData = [];
            const gains: number[] = [];
            const losses: number[] = [];
            for (let i = 1; i < data.length; i++) {
                const change = data[i].value - data[i - 1].value;
                gains.push(change > 0 ? change : 0);
                losses.push(change < 0 ? Math.abs(change) : 0);
            }
            let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
            let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
            const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const firstRSI = 100 - (100 / (1 + firstRS));
            rsiData.push({
                time: data[period].time,
                value: firstRSI
            });
            for (let i = period; i < gains.length; i++) {
                avgGain = (avgGain * (period - 1) + gains[i]) / period;
                avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                const rsi = 100 - (100 / (1 + rs));
                rsiData.push({
                    time: data[i + 1].time,
                    value: rsi
                });
            }
            result[`RSI${period}`] = rsiData;
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
            },
            handleScale: true,
            handleScroll: true,
            crosshair: {
                mode: 1,
            },
        });
        const rsiDataSets = calculateMultipleRSI(data);
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
        Object.keys(rsiDataSets).forEach((key, index) => {
            const series = chart.addSeries(LineSeries, {
                color: colors[index] || '#FF6B6B',
                lineWidth: 1,
                title: key,
            });
            const rsiData = rsiDataSets[key];
            if (rsiData.length > 0) {
                series.setData(rsiData);
            }
            seriesMapRef.current[key] = series;
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
                console.debug('Error getting crosshair values:', error);
            }
            setCurrentValues(null);
        };
        chart.subscribeCrosshairMove(crosshairMoveHandler);
        setTimeout(() => {
            try {
                chart.timeScale().fitContent();
            } catch (error) {
                console.debug('Initial fit content error:', error);
            }
        }, 200);
        const handleDoubleClick = () => {
            if (chartRef.current) {
                try {
                    chartRef.current.timeScale().fitContent();
                } catch (error) {
                    console.debug('Chart reset error:', error);
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
                        console.debug('Chart already disposed');
                    }
                }
            }
        });
        resizeObserverRef.current.observe(container);
        return () => {
            try {
                chart.unsubscribeCrosshairMove(crosshairMoveHandler);
            } catch (error) {
                console.debug('Error unsubscribing crosshair move:', error);
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
                    console.debug('Chart removal error:', error);
                }
                chartRef.current = null;
                seriesMapRef.current = {};
            }
        };
    }, [data, height, theme]);

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
                        onClick={onOpenSettings}
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
                        onClick={() => handleRemoveSubChartIndicator && handleRemoveSubChartIndicator("rsi")}
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
                        {Object.keys(currentValues).map(key => (
                            <span key={key} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1px',
                            }}>
                                <span style={{ fontWeight: 'bold', opacity: 0.8 }}>{key}</span>
                                <span style={{
                                    fontWeight: 'normal',
                                    color: theme.layout.textColor,
                                    minWidth: '40px'
                                }}>
                                    ({currentValues[key].toFixed(2)})
                                </span>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};