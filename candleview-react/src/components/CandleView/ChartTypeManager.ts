import {
  LineSeries,
  AreaSeries,
  CandlestickSeries,
  HistogramSeries,
  BaselineSeries,
  BarSeries
} from 'lightweight-charts';

export interface ChartSeries {
  series: any;
  type: string;
}

export interface ChartTypeConfig {
  id: string;
  label: string;
  description: string;
  createSeries: (chart: any, theme: any) => ChartSeries;
  updateSeries?: (series: any, data: any[]) => void;
}

const createLineSeries = (chart: any, theme: any): ChartSeries => {
  const series = chart.addSeries(LineSeries, {
    color: theme.chart.lineColor,
    lineWidth: theme.chart.lineWidth,
    priceLineVisible: true,
    lastValueVisible: true,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
  });
  return { series, type: 'line' };
};

const createAreaSeries = (chart: any, theme: any): ChartSeries => {
  const series = chart.addSeries(AreaSeries, {
    lineColor: theme.chart.lineColor,
    lineWidth: theme.chart.lineWidth,
    topColor: theme.chart.areaTopColor || `${theme.chart.lineColor}20`,
    bottomColor: theme.chart.areaBottomColor || `${theme.chart.lineColor}02`,
    priceLineVisible: true,
    lastValueVisible: true,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
  });
  return { series, type: 'area' };
};

const createCandleSeries = (chart: any, theme: any): ChartSeries => {
  const series = chart.addSeries(CandlestickSeries, {
    upColor: theme.chart.candleUpColor || '#26a69a',
    downColor: theme.chart.candleDownColor || '#ef5350',
    borderVisible: false,
    wickUpColor: theme.chart.candleUpColor || '#26a69a',
    wickDownColor: theme.chart.candleDownColor || '#ef5350',
    priceLineVisible: true,
    lastValueVisible: true,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
  });
  return { series, type: 'candle' };
};

const createHollowCandleSeries = (chart: any, theme: any): ChartSeries => {
  const series = chart.addSeries(CandlestickSeries, {
    upColor: 'transparent',
    downColor: theme.chart.candleDownColor || '#ef5350',
    borderUpColor: theme.chart.candleUpColor || '#26a69a',
    borderDownColor: theme.chart.candleDownColor || '#ef5350',
    wickUpColor: theme.chart.candleUpColor || '#26a69a',
    wickDownColor: theme.chart.candleDownColor || '#ef5350',
    priceLineVisible: true,
    lastValueVisible: true,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
  });
  return { series, type: 'hollow-candle' };
};

const createBarSeries = (chart: any, theme: any): ChartSeries => {
  const series = chart.addSeries(BarSeries, {
    upColor: theme.chart.candleUpColor || '#26a69a',
    downColor: theme.chart.candleDownColor || '#ef5350',
    thinBars: true,
    priceLineVisible: true,
    lastValueVisible: true,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
  });
  return { series, type: 'bar' };
};

const createBaselineSeries = (chart: any, theme: any): ChartSeries => {
  const series = chart.addSeries(BaselineSeries, {
    baseValue: { type: 'price', price: 0 },
    topLineColor: theme.chart.candleUpColor || '#26a69a',
    topFillColor1: `${theme.chart.candleUpColor || '#26a69a'}20`,
    topFillColor2: `${theme.chart.candleUpColor || '#26a69a'}02`,
    bottomLineColor: theme.chart.candleDownColor || '#ef5350',
    bottomFillColor1: `${theme.chart.candleDownColor || '#ef5350'}20`,
    bottomFillColor2: `${theme.chart.candleDownColor || '#ef5350'}02`,
    priceLineVisible: true,
    lastValueVisible: true,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
  });
  return { series, type: 'baseline' };
};

const createHistogramSeries = (chart: any, theme: any): ChartSeries => {
  const series = chart.addSeries(HistogramSeries, {
    color: theme.chart.lineColor,
    priceLineVisible: true,
    lastValueVisible: true,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
  });
  return { series, type: 'histogram' };
};

const createStepLineSeries = (chart: any, theme: any): ChartSeries => {
  const series = chart.addSeries(LineSeries, {
    color: theme.chart.lineColor,
    lineWidth: theme.chart.lineWidth,
    lineStyle: 1, // 0: Solid, 1: Dotted, 2: Dashed, 3: LargeDashed
    priceLineVisible: true,
    lastValueVisible: true,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
  });
  return { series, type: 'stepline' };
};

export const formatDataForSeries = (data: any[], chartType: string): any[] => {
  if (chartType === 'candle' || chartType === 'hollow-candle' || chartType === 'bar') {
    return data.map((item, index) => ({
      time: item.time,
      open: item.value * 0.95 + (Math.random() * item.value * 0.1),
      high: item.value * 1.1 + (Math.random() * item.value * 0.05),
      low: item.value * 0.9 - (Math.random() * item.value * 0.05),
      close: item.value
    }));
  } else if (chartType === 'histogram') {
    return data.map(item => ({
      time: item.time,
      value: item.value,
      color: item.value > 100 ? '#26a69a' : '#ef5350'
    }));
  } else {
    return data.map(item => ({
      time: item.time,
      value: item.value
    }));
  }
};

export const chartTypes: ChartTypeConfig[] = [
  {
    id: 'line',
    label: 'Line Chart',
    description: 'Line Chart',
    createSeries: createLineSeries
  },
  {
    id: 'area',
    label: 'Area Chart',
    description: 'Area Chart',
    createSeries: createAreaSeries
  },
  {
    id: 'candle',
    label: 'Candlestick',
    description: 'Candlestick',
    createSeries: createCandleSeries
  },
  {
    id: 'hollow-candle',
    label: 'Hollow Candlestick',
    description: 'Hollow Candlestick',
    createSeries: createHollowCandleSeries
  },
  {
    id: 'bar',
    label: 'Bar Chart',
    description: 'Bar Chart',
    createSeries: createBarSeries
  },
  {
    id: 'baseline',
    label: 'Baseline',
    description: 'Baseline',
    createSeries: createBaselineSeries
  },
  {
    id: 'histogram',
    label: 'Histogram',
    description: 'Histogram',
    createSeries: createHistogramSeries
  },
  {
    id: 'stepline',
    label: 'Step Line',
    description: 'Step Line',
    createSeries: createStepLineSeries
  }
];

export const switchChartType = (
  chart: any,
  currentSeries: ChartSeries | null,
  newChartType: string,
  data: any[],
  theme: any
): ChartSeries => {
  if (currentSeries && currentSeries.series) {
    try {
      chart.removeSeries(currentSeries.series);
    } catch (error) {
      console.warn('Error removing existing series:', error);
    }
  }

  const chartTypeConfig = chartTypes.find(type => type.id === newChartType);
  if (!chartTypeConfig) {
    throw new Error(`Unknown chart type: ${newChartType}`);
  }

  const newSeries = chartTypeConfig.createSeries(chart, theme);

  const formattedData = formatDataForSeries(data, newChartType);
  newSeries.series.setData(formattedData);

  chart.timeScale().fitContent();

  return newSeries;
};

export const updateSeriesTheme = (series: ChartSeries | null, theme: any): void => {
  if (!series || !series.series) return;

  const config = chartTypes.find(type => type.id === series.type);
  if (!config) return;

  try {
    switch (series.type) {
      case 'line':
      case 'stepline':
        series.series.applyOptions({
          color: theme.chart.lineColor,
          lineWidth: theme.chart.lineWidth,
        });
        break;
      case 'area':
        series.series.applyOptions({
          lineColor: theme.chart.lineColor,
          lineWidth: theme.chart.lineWidth,
          topColor: theme.chart.areaTopColor || `${theme.chart.lineColor}20`,
          bottomColor: theme.chart.areaBottomColor || `${theme.chart.lineColor}02`,
        });
        break;
      case 'candle':
        series.series.applyOptions({
          upColor: theme.chart.candleUpColor || '#26a69a',
          downColor: theme.chart.candleDownColor || '#ef5350',
          wickUpColor: theme.chart.candleUpColor || '#26a69a',
          wickDownColor: theme.chart.candleDownColor || '#ef5350',
        });
        break;
      case 'hollow-candle':
        series.series.applyOptions({
          downColor: theme.chart.candleDownColor || '#ef5350',
          borderUpColor: theme.chart.candleUpColor || '#26a69a',
          borderDownColor: theme.chart.candleDownColor || '#ef5350',
          wickUpColor: theme.chart.candleUpColor || '#26a69a',
          wickDownColor: theme.chart.candleDownColor || '#ef5350',
        });
        break;
      case 'bar':
        series.series.applyOptions({
          upColor: theme.chart.candleUpColor || '#26a69a',
          downColor: theme.chart.candleDownColor || '#ef5350',
        });
        break;
      case 'baseline':
        series.series.applyOptions({
          topLineColor: theme.chart.candleUpColor || '#26a69a',
          topFillColor1: `${theme.chart.candleUpColor || '#26a69a'}20`,
          topFillColor2: `${theme.chart.candleUpColor || '#26a69a'}02`,
          bottomLineColor: theme.chart.candleDownColor || '#ef5350',
          bottomFillColor1: `${theme.chart.candleDownColor || '#ef5350'}20`,
          bottomFillColor2: `${theme.chart.candleDownColor || '#ef5350'}02`,
        });
        break;
      case 'histogram':
        series.series.applyOptions({
          color: theme.chart.lineColor,
        });
        break;
    }
  } catch (error) {
    console.error('Error updating series theme:', error);
  }
};
