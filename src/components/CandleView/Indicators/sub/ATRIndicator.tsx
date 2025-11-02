import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';

interface ATRIndicatorProps {
  theme: ThemeConfig;
  data: Array<{ time: string; value: number }>;
  height: number;
  width: string;
}

export const ATRIndicator: React.FC<ATRIndicatorProps> = ({ theme, data, height, width }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // ATR 计算方法
  const calculateATR = (data: Array<{ time: string; value: number }>, period: number = 14) => {
    if (data.length < period + 1) return [];

    const result = [];
    const trueRanges: number[] = [];

    // 计算 True Range
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      const high = current.value * 1.002; // 模拟高价
      const low = current.value * 0.998;  // 模拟低价
      const previousClose = previous.value;
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - previousClose);
      const tr3 = Math.abs(low - previousClose);
      
      const trueRange = Math.max(tr1, tr2, tr3);
      trueRanges.push(trueRange);
    }

    // 计算初始 ATR（前 period 个 TR 的平均值）
    let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
    
    result.push({
      time: data[period].time,
      value: atr
    });

    // 计算后续 ATR 值（使用 Wilder 的平滑方法）
    for (let i = period; i < trueRanges.length; i++) {
      atr = (atr * (period - 1) + trueRanges[i]) / period;
      result.push({
        time: data[i + 1].time,
        value: atr
      });
    }

    return result;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;
    const containerWidth = container.clientWidth;
    
    // 创建图表
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

    // 计算 ATR 数据
    const atrData = calculateATR(data);

    // 添加 ATR 系列
    const atrSeries = chart.addSeries(LineSeries, {
      color: '#9C27B0',
      lineWidth: 1,
      priceScaleId: 'right',
    });

    atrSeries.setData(atrData);

    chartRef.current = chart;

    // 设置 resize observer
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
        ATR
      </div>
      <div style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        color: theme.layout.textColor,
        fontSize: '10px',
        opacity: 0.7,
      }}>
        {data.length > 0 ? `当前: ${data[data.length - 1].value.toFixed(4)}` : ''}
      </div>
    </div>
  );
};