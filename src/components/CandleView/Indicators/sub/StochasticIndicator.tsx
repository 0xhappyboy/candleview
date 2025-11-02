import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';

interface StochasticIndicatorProps {
  theme: ThemeConfig;
  data: Array<{ time: string; value: number }>;
  height: number;
  width: string;
}

export const StochasticIndicator: React.FC<StochasticIndicatorProps> = ({ theme, data, height, width }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const calculateStochastic = (data: Array<{ time: string; value: number }>, period: number = 14, kPeriod: number = 3, dPeriod: number = 3) => {
    if (data.length < period) return [];

    const result = [];

    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1);
      const values = periodData.map(d => d.value);
      const high = Math.max(...values);
      const low = Math.min(...values);
      const close = data[i].value;

      const k = ((close - low) / (high - low)) * 100;

      result.push({
        time: data[i].time,
        k: k,
        d: k
      });
    }

    for (let i = kPeriod - 1; i < result.length; i++) {
      const kValues = result.slice(i - kPeriod + 1, i + 1).map(r => r.k);
      result[i].d = kValues.reduce((sum, val) => sum + val, 0) / kPeriod;
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
        mode: 2,
      },
      timeScale: {
        visible: true,
        borderColor: theme.grid.horzLines.color,
        timeVisible: true,
      },
      handleScale: true,
      handleScroll: true,
    });

    const stochasticData = calculateStochastic(data);

    const kSeries = chart.addSeries(LineSeries, {
      color: '#2962FF',
      lineWidth: 1,
      priceScaleId: 'right',
    });

    const dSeries = chart.addSeries(LineSeries, {
      color: '#FF6B6B',
      lineWidth: 1,
      priceScaleId: 'right',
    });

    const kData = stochasticData.map(item => ({ time: item.time, value: item.k }));
    const dData = stochasticData.map(item => ({ time: item.time, value: item.d }));

    kSeries.setData(kData);
    dSeries.setData(dData);


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
        Stochastic
      </div>
    </div>
  );
};