import ResizeObserver from 'resize-observer-polyfill';
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';
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
    const trValues = []; // True Range
    const plusDM = []; // +DM
    const minusDM = []; // -DM

    // 计算 TR, +DM, -DM
    for (let i = 1; i < data.length; i++) {
      const high = data[i].value * 1.002; // 模拟高价
      const low = data[i].value * 0.998;  // 模拟低价
      const prevHigh = data[i - 1].value * 1.002;
      const prevLow = data[i - 1].value * 0.998;
      const prevClose = data[i - 1].value;

      // True Range
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trValues.push(tr);

      // +DM and -DM
      const upMove = high - prevHigh;
      const downMove = prevLow - low;

      const plusDm = upMove > downMove && upMove > 0 ? upMove : 0;
      const minusDm = downMove > upMove && downMove > 0 ? downMove : 0;

      plusDM.push(plusDm);
      minusDM.push(minusDm);
    }

    // 计算平滑值并计算ADX
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

    // 计算后续值
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

    // 创建图表
    const chart = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: height,
      layout: {
        background: { color: theme.layout.background.color },
        textColor: theme.layout.textColor,
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
        mode: 2, // 百分比模式
        autoScale: true,
        entireTextOnly: false,
      },
      leftPriceScale: {
        visible: false, // 通常只用一个价格刻度
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

    // 添加 ADX 系列
    const adxSeries = chart.addSeries(LineSeries, {
      color: '#9C27B0',
      lineWidth: 2,
      priceScaleId: 'right',
    });

    // 添加 +DI 系列
    const plusDISeries = chart.addSeries(LineSeries, {
      color: '#4CAF50',
      lineWidth: 1,
      priceScaleId: 'right',
    });

    // 添加 -DI 系列
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

    chartRef.current = chart;

    // 创建 ResizeObserver
    resizeObserverRef.current = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (chartRef.current && width > 0) {
          try {
            chartRef.current.applyOptions({ width });
          } catch (error) {
            // 图表可能已被销毁，忽略错误
            console.debug('Chart already disposed');
          }
        }
      }
    });

    resizeObserverRef.current.observe(container);

    return () => {
      // 先断开观察者
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      
      // 再销毁图表
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (error) {
          // 忽略销毁错误
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