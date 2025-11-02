import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, HistogramSeries } from 'lightweight-charts';
import { ThemeConfig } from '../CandleViewTheme';

interface VolumeIndicatorProps {
  theme: ThemeConfig;
  data: Array<{ time: string; value: number }>;
  height: number;
  width: string,
}

export const VolumeIndicator: React.FC<VolumeIndicatorProps> = ({ theme, data, height }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const calculateVolume = (data: Array<{ time: string; value: number }>) => {
    return data.map((item, index) => ({
      time: item.time,
      value: Math.abs(Math.sin(index * 0.1)) * 1000 + 500,
      color: index > 0 && item.value > data[index - 1].value ? '#26C6DA' : '#FF6B6B'
    }));
  };
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;
    const containerWidth = container.clientWidth;
    resizeObserverRef.current = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (chartRef.current && width > 0) {
          chartRef.current.applyOptions({ width });
        }
      }
    });
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
        visible: false,
      },
      handleScale: false,
      handleScroll: false,
    });
    const volumeData = calculateVolume(data);
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (chart && width > 0) {
          chart.applyOptions({ width });
        }
      }
    });
    resizeObserver.observe(container);
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26C6DA',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'right',
    });
    volumeSeries.setData(volumeData);
    chartRef.current = chart;
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [data, height, theme]);

  return (
    <div ref={containerRef} style={{ position: 'relative', height: `${height}px`, width: '${width}px' || '100%' }}>
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        top: '5px',
        left: '5px',
        color: theme.layout.textColor,
        fontSize: '10px',
        fontWeight: 'bold',
      }}>
        VOLUME
      </div>
    </div>
  );
};