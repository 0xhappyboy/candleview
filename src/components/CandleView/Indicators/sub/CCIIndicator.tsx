import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';

interface CCIIndicatorProps {
  theme: ThemeConfig;
  data: Array<{ time: string; value: number }>;
  height: number;
  width: string;
}

export const CCIIndicator: React.FC<CCIIndicatorProps> = ({ theme, data, height, width }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const calculateCCI = (data: Array<{ time: string; value: number }>, period: number = 20) => {
    if (data.length < period) return [];

    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1);
      
      const typicalPrices = periodData.map(d => d.value);
      const sma = typicalPrices.reduce((sum, price) => sum + price, 0) / period;
      
      const meanDeviation = typicalPrices.reduce((sum, price) => 
        sum + Math.abs(price - sma), 0) / period;
      
      const cci = meanDeviation !== 0 ? (typicalPrices[typicalPrices.length - 1] - sma) / (0.015 * meanDeviation) : 0;
      
      result.push({
        time: data[i].time,
        value: cci
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
        horzLines: { 
          visible: true,
          color: `${theme.layout.textColor}20`
        }
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

    const cciData = calculateCCI(data);

    const cciSeries = chart.addSeries(LineSeries, {
      color: '#FF9800',
      lineWidth: 1,
      priceScaleId: 'right',
    });

    cciSeries.setData(cciData);

    
    const referenceLines = [
      { value: 100, color: '#f44336', text: '+100' },
      { value: -100, color: '#f44336', text: '-100' },
      { value: 0, color: '#666666', text: '0' }
    ];

    referenceLines.forEach(line => {
      const series = chart.addSeries(LineSeries, {
        color: line.color,
        lineWidth: 1,
        lineStyle: 2,
        priceScaleId: 'right',
      });
      series.setData(cciData.map(item => ({ time: item.time, value: line.value })));
    });

      
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
        CCI
      </div>
    </div>
  );
};