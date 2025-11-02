import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';

interface KDJIndicatorProps {
    theme: ThemeConfig;
    data: Array<{ time: string; value: number }>;
    height: number;
    width?: string;
}

export const KDJIndicator: React.FC<KDJIndicatorProps> = ({ theme, data, height, width }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const calculateKDJ = (data: Array<{ time: string; value: number }>, period: number = 9) => {
        const result = [];

        for (let i = period - 1; i < data.length; i++) {
            const periodData = data.slice(i - period + 1, i + 1);
            const high = Math.max(...periodData.map(d => d.value));
            const low = Math.min(...periodData.map(d => d.value));
            const close = data[i].value;

            const rsv = ((close - low) / (high - low)) * 100;

            const k = 50 + (rsv - 50) * 2 / 3;
            const d = 50 + (k - 50) * 2 / 3;
            const j = 3 * k - 2 * d;

            result.push({
                time: data[i].time,
                k,
                d,
                j
            });
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

        const kdjData = calculateKDJ(data);

        chart.addSeries(LineSeries, {
            color: '#2962FF',
            lineWidth: 1,
        }).setData(kdjData.map(d => ({ time: d.time, value: d.k })));

        chart.addSeries(LineSeries, {
            color: '#FF6B6B',
            lineWidth: 1,
        }).setData(kdjData.map(d => ({ time: d.time, value: d.d })));

        chart.addSeries(LineSeries, {
            color: '#FFA726',
            lineWidth: 1,
        }).setData(kdjData.map(d => ({ time: d.time, value: d.j })));

        chart.addSeries(LineSeries, {
            color: '#2962FF',
            lineWidth: 2,
        }).setData([
            { time: data[0]?.time, value: 80 },
            { time: data[data.length - 1]?.time, value: 80 }
        ]);

        chart.addSeries(LineSeries, {
            color: '#2962FF',
            lineWidth: 2,
        }).setData([
            { time: data[0]?.time, value: 20 },
            { time: data[data.length - 1]?.time, value: 20 }
        ]);

        setTimeout(() => {
            try {
                chart.timeScale().fitContent();
            } catch (error) {
                console.debug('Initial fit content error:', error);
            }
        }, 100);

        chartRef.current = chart;

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
                KDJ
            </div>
        </div>
    );
};