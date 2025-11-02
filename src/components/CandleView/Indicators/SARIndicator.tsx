import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
import { ThemeConfig } from '../CandleViewTheme';

interface SARIndicatorProps {
  theme: ThemeConfig;
  data: Array<{ time: string; value: number }>;
  height: number;
  width: string,
}

export const SARIndicator: React.FC<SARIndicatorProps> = ({ theme, data, height }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const calculateSAR = (data: Array<{ time: string; value: number }>) => {
    const result = [];
    let sar = data[0].value;
    let trend = 1; // 1: uptrend, -1: downtrend
    let af = 0.02; // acceleration factor
    let ep = data[0].value; // extreme point

    for (let i = 0; i < data.length; i++) {
      const value = data[i].value;

      if (trend === 1) {
        sar = sar + af * (ep - sar);
        if (value > ep) {
          ep = value;
          af = Math.min(af + 0.02, 0.2);
        }
        if (value < sar) {
          trend = -1;
          sar = ep;
          af = 0.02;
          ep = value;
        }
      } else {
        sar = sar + af * (ep - sar);
        if (value < ep) {
          ep = value;
          af = Math.min(af + 0.02, 0.2);
        }
        if (value > sar) {
          trend = 1;
          sar = ep;
          af = 0.02;
          ep = value;
        }
      }

      result.push({
        time: data[i].time,
        value: sar
      });
    }

    return result;
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
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        visible: false,
      },
      handleScale: false,
      handleScroll: false,
    });

    const sarData = calculateSAR(data);

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (chart && width > 0) {
          chart.applyOptions({ width });
        }
      }
    });

    resizeObserver.observe(container);

    const sarSeries = chart.addSeries(LineSeries, {
      color: '#FFA726',
      lineWidth: 1,
      priceScaleId: 'right',
    });

    sarSeries.setData(sarData);

    const priceSeries = chart.addSeries(LineSeries, {
      color: '#66666650',
      lineWidth: 1,
      priceScaleId: 'right',
    });

    priceSeries.setData(data);

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
        SAR
      </div>
    </div>
  );
};