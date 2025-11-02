import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';

interface RSIIndicatorProps {
    theme: ThemeConfig;
    data: Array<{ time: string; value: number }>;
    height: number;
    width?: string;
}

export const RSIIndicator: React.FC<RSIIndicatorProps> = ({ theme, data, height, width }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const calculateRSI = (data: Array<{ time: string; value: number }>, period: number = 14) => {
        if (data.length < period + 1) return [];

        const result = [];
        const gains: number[] = [];
        const losses: number[] = [];

        for (let i = 1; i < data.length; i++) {
            const change = data[i].value - data[i - 1].value;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);
        }

        let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

        for (let i = period; i < data.length; i++) {
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));

            result.push({
                time: data[i].time,
                value: rsi
            });

            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
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
        });

        const series = chart.addSeries(LineSeries, {
            color: '#FF6B6B',
            lineWidth: 1,
        });

        const rsiData = calculateRSI(data);

        if (rsiData.length > 0) {
            series.setData(rsiData);
        }

        chart.addSeries(LineSeries, {
            color: '#2962FF',
            lineWidth: 2,
        }).setData([
            { time: data[0]?.time, value: 70 },
            { time: data[data.length - 1]?.time, value: 70 }
        ]);

        chart.addSeries(LineSeries, {
            color: '#2962FF',
            lineWidth: 2,
        }).setData([
            { time: data[0]?.time, value: 30 },
            { time: data[data.length - 1]?.time, value: 30 }
        ]);

        setTimeout(() => {
            try {
                chart.timeScale().fitContent();
            } catch (error) {
                console.debug('Initial fit content error:', error);
            }
        }, 100);


        chartRef.current = chart;
        seriesRef.current = series;

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
            }
        };
    }, [data, height, theme]);

    return (
        <div ref={containerRef} style={{ position: 'relative', height: `${height}px`, width: width || '100%' }}>
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
            <div style={{
                position: 'absolute',
                top: '5px',
                left: '5px',
                color: theme.layout.textColor,
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                RSI
            </div>
        </div>
    );
};