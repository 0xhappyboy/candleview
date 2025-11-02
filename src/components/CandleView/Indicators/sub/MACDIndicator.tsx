import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries, HistogramSeries } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';

interface MACDIndicatorProps {
    theme: ThemeConfig;
    data: Array<{ time: string; value: number }>;
    height: number;
    width?: string;
}

export const MACDIndicator: React.FC<MACDIndicatorProps> = ({ theme, data, height, width }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const calculateMACD = (data: Array<{ time: string; value: number }>) => {
        const calculateEMA = (data: number[], period: number) => {
            const multiplier = 2 / (period + 1);
            const ema = [data[0]];

            for (let i = 1; i < data.length; i++) {
                ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
            }
            return ema;
        };

        const values = data.map(d => d.value);
        const ema12 = calculateEMA(values, 12);
        const ema26 = calculateEMA(values, 26);

        const macdLine: any[] = [];
        for (let i = 0; i < values.length; i++) {
            macdLine.push(ema12[i] - ema26[i]);
        }

        const signalLine = calculateEMA(macdLine, 9);
        const histogram: any[] = [];

        for (let i = 0; i < values.length; i++) {
            histogram.push(macdLine[i] - signalLine[i]);
        }

        return data.map((d, i) => ({
            time: d.time,
            macd: macdLine[i],
            signal: signalLine[i],
            histogram: histogram[i]
        }));
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
            },
            timeScale: {
                visible: true,
                borderColor: theme.grid.horzLines.color,
                timeVisible: true,
            },
            handleScale: true,
            handleScroll: true,
        });

        const macdData = calculateMACD(data);

        chart.addSeries(LineSeries, {
            color: '#2962FF',
            lineWidth: 1,
        }).setData(macdData.map(d => ({ time: d.time, value: d.macd })));

        chart.addSeries(LineSeries, {
            color: '#FF6B6B',
            lineWidth: 1,
        }).setData(macdData.map(d => ({ time: d.time, value: d.signal })));

        chart.addSeries(HistogramSeries, {
            color: '#26C6DA',
        }).setData(macdData.map(d => ({
            time: d.time,
            value: d.histogram,
            color: d.histogram >= 0 ? '#26C6DA' : '#FF6B6B'
        })));

        chartRef.current = chart;

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
                MACD
            </div>
        </div>
    );
};