import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineSeries } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';

interface OBVIndicatorProps {
  theme: ThemeConfig;
  data: Array<{ time: string; value: number }>;
  height: number;
  width: string;
}

export const OBVIndicator: React.FC<OBVIndicatorProps> = ({ theme, data, height, width }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const calculateOBV = (data: Array<{ time: string; value: number }>) => {
    if (data.length < 2) return [];
    const result = [];
    let obv = 0;
    result.push({
      time: data[0].time,
      value: obv
    });
    for (let i = 1; i < data.length; i++) {
      const currentClose = data[i].value;
      const previousClose = data[i - 1].value;
      const volume = 1000;
      if (currentClose > previousClose) {
        obv += volume;
      } else if (currentClose < previousClose) {
        obv -= volume;
      }
      result.push({
        time: data[i].time,
        value: obv
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
    });
    const obvData = calculateOBV(data);
    const obvSeries = chart.addSeries(LineSeries, {
      color: '#2196F3',
      lineWidth: 1,
      priceScaleId: 'right',
    });
    obvSeries.setData(obvData);
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
        OBV
      </div>
    </div>
  );
};