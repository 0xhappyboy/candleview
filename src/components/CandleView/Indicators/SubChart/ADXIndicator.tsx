import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineSeries } from 'lightweight-charts';
import { ThemeConfig } from '../../CandleViewTheme';

interface ADXIndicatorProps {
  theme: ThemeConfig;
  data: Array<{ time: string; value: number }>;
  height: number;
  width: string;
}

export const ADXIndicator: React.FC<ADXIndicatorProps> = ({ theme, data, height, width }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const calculateADX = (data: Array<{ time: string; value: number }>, period: number = 14) => {
    if (data.length < period * 2) return [];
    const result = [];
    const trValues = [];
    const plusDM = [];
    const minusDM = [];
    for (let i = 1; i < data.length; i++) {
      const high = data[i].value * 1.002;
      const low = data[i].value * 0.998;
      const prevHigh = data[i - 1].value * 1.002;
      const prevLow = data[i - 1].value * 0.998;
      const prevClose = data[i - 1].value;
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trValues.push(tr);
      const upMove = high - prevHigh;
      const downMove = prevLow - low;
      const plusDm = upMove > downMove && upMove > 0 ? upMove : 0;
      const minusDm = downMove > upMove && downMove > 0 ? downMove : 0;
      plusDM.push(plusDm);
      minusDM.push(minusDm);
    }
    let atr = trValues.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
    let plusDI = (plusDM.slice(0, period).reduce((sum, dm) => sum + dm, 0) / atr) * 100;
    let minusDI = (minusDM.slice(0, period).reduce((sum, dm) => sum + dm, 0) / atr) * 100;
    let dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
    let adx = dx;
    result.push({
      time: data[period].time,
      adx: adx,
      plusDI: plusDI,
      minusDI: minusDI
    });
    for (let i = period; i < trValues.length; i++) {
      atr = (atr * (period - 1) + trValues[i]) / period;
      plusDI = (plusDM[i] + plusDI * (period - 1)) / period / atr * 100;
      minusDI = (minusDM[i] + minusDI * (period - 1)) / period / atr * 100;
      dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
      adx = (adx * (period - 1) + dx) / period;
      result.push({
        time: data[i + 1].time,
        adx: adx,
        plusDI: plusDI,
        minusDI: minusDI
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
        vertLines: {
          visible: true,
          color: `${theme.layout.textColor}10`
        },
        horzLines: {
          visible: true,
          color: `${theme.layout.textColor}10`
        }
      },
      rightPriceScale: {
        visible: true,
        borderColor: theme.grid.horzLines.color,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        mode: 2,
        autoScale: true,
        entireTextOnly: false,
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: true,
        borderColor: theme.grid.horzLines.color,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: true,
      handleScroll: true,
      crosshair: {
        mode: 1,
      },
    });
    const adxData = calculateADX(data);
    const adxSeries = chart.addSeries(LineSeries, {
      color: '#9C27B0',
      lineWidth: 2,
      priceScaleId: 'right',
    });
    const plusDISeries = chart.addSeries(LineSeries, {
      color: '#4CAF50',
      lineWidth: 1,
      priceScaleId: 'right',
    });
    const minusDISeries = chart.addSeries(LineSeries, {
      color: '#F44336',
      lineWidth: 1,
      priceScaleId: 'right',
    });
    const adxLineData = adxData.map(item => ({ time: item.time, value: item.adx }));
    const plusDIData = adxData.map(item => ({ time: item.time, value: item.plusDI }));
    const minusDIData = adxData.map(item => ({ time: item.time, value: item.minusDI }));
    adxSeries.setData(adxLineData);
    plusDISeries.setData(plusDIData);
    minusDISeries.setData(minusDIData);
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
        ADX
      </div>
    </div>
  );
};