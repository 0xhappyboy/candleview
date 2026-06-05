
import {
  LineSeries,
  AreaSeries,
  CandlestickSeries,
  HistogramSeries,
  BaselineSeries,
  BarSeries
} from 'lightweight-charts';
import { MainChartType } from '../types';
import { Theme, ThemeColors } from '../theme';

export interface ChartSeries {
  series: any;
  type: string;
}

export interface ChartTypeConfig {
  id: string;
  label: string;
  description: string;
  createSeries: (chart: any, colors: ThemeColors) => ChartSeries;
  updateSeries?: (series: any, colors: ThemeColors) => void;
  type: MainChartType;
}

export const createDrawSeries = (chart: any, colors: ThemeColors): ChartSeries => {
  const series = chart.addSeries(CandlestickSeries, {
    visible: false,
  });
  return { series, type: 'candle' };
};

const createLineSeries = (chart: any, colors: ThemeColors): ChartSeries => {
  const series = chart.addSeries(LineSeries, {
    color: colors.chartLine,
    lineWidth: 2,
    priceLineVisible: true,
    lastValueVisible: true,
    priceFormat: {
      type: 'price',
      precision: 2,
      minMove: 0.01,
    },
    crosshairMarkerVisible: false,
  });
  return { series, type: 'line' };
};

const createAreaSeries = (chart: any, colors: ThemeColors): ChartSeries => {
  const series = chart.addSeries(AreaSeries, {
    lineColor: colors.chartLine,
    lineWidth: 2,
    topColor: colors.chartAreaTop,
    bottomColor: colors.chartAreaBottom,
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

const createCandleSeries = (chart: any, colors: ThemeColors): ChartSeries => {
  const series = chart.addSeries(CandlestickSeries, {
    upColor: colors.chartCandleUp,
    downColor: colors.chartCandleDown,
    borderVisible: false,
    wickUpColor: colors.chartCandleUp,
    wickDownColor: colors.chartCandleDown,
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

const createHollowCandleSeries = (chart: any, colors: ThemeColors): ChartSeries => {
  const series = chart.addSeries(CandlestickSeries, {
    upColor: 'transparent',
    downColor: colors.chartCandleDown,
    borderUpColor: colors.chartCandleUp,
    borderDownColor: colors.chartCandleDown,
    wickUpColor: colors.chartCandleUp,
    wickDownColor: colors.chartCandleDown,
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

const createBarSeries = (chart: any, colors: ThemeColors): ChartSeries => {
  const series = chart.addSeries(BarSeries, {
    upColor: colors.chartCandleUp,
    downColor: colors.chartCandleDown,
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

const createBaselineSeries = (chart: any, colors: ThemeColors): ChartSeries => {
  const series = chart.addSeries(BaselineSeries, {
    baseValue: { type: 'price', price: 0 },
    topLineColor: colors.chartCandleUp,
    topFillColor1: colors.chartAreaTop,
    topFillColor2: colors.chartAreaBottom,
    bottomLineColor: colors.chartCandleDown,
    bottomFillColor1: colors.chartAreaBottom,
    bottomFillColor2: colors.chartAreaTop,
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

const createHistogramSeries = (chart: any, colors: ThemeColors): ChartSeries => {
  const series = chart.addSeries(HistogramSeries, {
    color: colors.chartLine,
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

const createStepLineSeries = (chart: any, colors: ThemeColors): ChartSeries => {
  const series = chart.addSeries(LineSeries, {
    color: colors.chartLine,
    lineWidth: 2,
    lineStyle: 1,
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

export const chartTypes: ChartTypeConfig[] = [
  {
    id: 'line',
    label: 'Line Chart',
    description: 'Line Chart',
    createSeries: createLineSeries,
    updateSeries: (series, colors) => {
      series.applyOptions({ color: colors.chartLine, lineWidth: 2 });
    },
    type: MainChartType.Line
  },
  {
    id: 'area',
    label: 'Area Chart',
    description: 'Area Chart',
    createSeries: createAreaSeries,
    updateSeries: (series, colors) => {
      series.applyOptions({
        lineColor: colors.chartLine,
        topColor: colors.chartAreaTop,
        bottomColor: colors.chartAreaBottom,
      });
    },
    type: MainChartType.Area
  },
  {
    id: 'candle',
    label: 'Candlestick',
    description: 'Candlestick',
    createSeries: createCandleSeries,
    updateSeries: (series, colors) => {
      series.applyOptions({
        upColor: colors.chartCandleUp,
        downColor: colors.chartCandleDown,
        wickUpColor: colors.chartCandleUp,
        wickDownColor: colors.chartCandleDown,
      });
    },
    type: MainChartType.Candle
  },
  {
    id: 'hollow-candle',
    label: 'Hollow Candlestick',
    description: 'Hollow Candlestick',
    createSeries: createHollowCandleSeries,
    updateSeries: (series, colors) => {
      series.applyOptions({
        downColor: colors.chartCandleDown,
        borderUpColor: colors.chartCandleUp,
        borderDownColor: colors.chartCandleDown,
        wickUpColor: colors.chartCandleUp,
        wickDownColor: colors.chartCandleDown,
      });
    },
    type: MainChartType.HollowCandle
  },
  {
    id: 'bar',
    label: 'Bar Chart',
    description: 'Bar Chart',
    createSeries: createBarSeries,
    updateSeries: (series, colors) => {
      series.applyOptions({
        upColor: colors.chartCandleUp,
        downColor: colors.chartCandleDown,
      });
    },
    type: MainChartType.Bar
  },
  {
    id: 'baseline',
    label: 'Baseline',
    description: 'Baseline',
    createSeries: createBaselineSeries,
    updateSeries: (series, colors) => {
      series.applyOptions({
        topLineColor: colors.chartCandleUp,
        topFillColor1: colors.chartAreaTop,
        topFillColor2: colors.chartAreaBottom,
        bottomLineColor: colors.chartCandleDown,
        bottomFillColor1: colors.chartAreaBottom,
        bottomFillColor2: colors.chartAreaTop,
      });
    },
    type: MainChartType.BaseLine
  },
  {
    id: 'histogram',
    label: 'Histogram',
    description: 'Histogram',
    createSeries: createHistogramSeries,
    updateSeries: (series, colors) => {
      series.applyOptions({ color: colors.chartLine });
    },
    type: MainChartType.Histogram
  },
  {
    id: 'stepline',
    label: 'Step Line',
    description: 'Step Line',
    createSeries: createStepLineSeries,
    updateSeries: (series, colors) => {
      series.applyOptions({ color: colors.chartLine });
    },
    type: MainChartType.StepLine
  },
  {
    id: 'heikinashi',
    label: 'Heikin Ashi',
    description: 'Heikin Ashi',
    createSeries: createCandleSeries,
    updateSeries: (series, colors) => {
      series.applyOptions({
        upColor: colors.chartCandleUp,
        downColor: colors.chartCandleDown,
        wickUpColor: colors.chartCandleUp,
        wickDownColor: colors.chartCandleDown,
      });
    },
    type: MainChartType.HeikinAshi
  },
  {
    id: 'linebreak',
    label: 'LineBreak',
    description: 'LineBreak',
    createSeries: createLineSeries,
    type: MainChartType.LineBreak
  },
  {
    id: 'mountain',
    label: 'Mountain',
    description: 'Mountain',
    createSeries: createAreaSeries,
    type: MainChartType.Mountain
  },
  {
    id: 'baselinearea',
    label: 'BaselineArea',
    description: 'BaselineArea',
    createSeries: createBaselineSeries,
    type: MainChartType.BaselineArea
  },
  {
    id: 'highlow',
    label: 'HighLow',
    description: 'HighLow',
    createSeries: createBarSeries,
    type: MainChartType.HighLow
  },
  {
    id: 'hlcarea',
    label: 'HLCArea',
    description: 'HLCArea',
    createSeries: createAreaSeries,
    type: MainChartType.HLCArea
  },
];

export const switchChartType = (
  chart: any,
  currentSeries: ChartSeries | null,
  newMainChartType: MainChartType,
  data: any[],
  theme: Theme
): ChartSeries => {
  const colors = theme.getColors();
  if (currentSeries && currentSeries.series) {
    try {
      chart.removeSeries(currentSeries.series);
    } catch (error) {
      console.error(error);
    }
  }
  const chartTypeConfig = chartTypes.find(t => t.type === newMainChartType);
  if (!chartTypeConfig) {
    throw new Error(`Unknown chart type: ${newMainChartType}`);
  }
  const newSeries = chartTypeConfig.createSeries(chart, colors);
  if (data && data.length > 0) {
    newSeries.series.setData(data);
  }
  chart.timeScale().fitContent();
  return newSeries;
};

export const updateSeriesTheme = (series: ChartSeries | null, theme: Theme): void => {
  if (!series || !series.series) return;
  const config = chartTypes.find(type => type.id === series.type);
  if (!config) return;
  const colors = theme.getColors();
  try {
    if (config.updateSeries) {
      config.updateSeries(series.series, colors);
    } else {
      
      switch (series.type) {
        case 'line':
        case 'stepline':
          series.series.applyOptions({ color: colors.chartLine, lineWidth: 2 });
          break;
        case 'area':
          series.series.applyOptions({
            lineColor: colors.chartLine,
            topColor: colors.chartAreaTop,
            bottomColor: colors.chartAreaBottom,
          });
          break;
        case 'candle':
        case 'hollow-candle':
        case 'heikinashi':
          series.series.applyOptions({
            upColor: colors.chartCandleUp,
            downColor: colors.chartCandleDown,
            wickUpColor: colors.chartCandleUp,
            wickDownColor: colors.chartCandleDown,
          });
          break;
        case 'bar':
          series.series.applyOptions({
            upColor: colors.chartCandleUp,
            downColor: colors.chartCandleDown,
          });
          break;
        case 'baseline':
          series.series.applyOptions({
            topLineColor: colors.chartCandleUp,
            topFillColor1: colors.chartAreaTop,
            topFillColor2: colors.chartAreaBottom,
            bottomLineColor: colors.chartCandleDown,
            bottomFillColor1: colors.chartAreaBottom,
            bottomFillColor2: colors.chartAreaTop,
          });
          break;
        case 'histogram':
          series.series.applyOptions({ color: colors.chartLine });
          break;
      }
    }
  } catch (error) {
    console.error('Error updating series theme:', error);
  }
};