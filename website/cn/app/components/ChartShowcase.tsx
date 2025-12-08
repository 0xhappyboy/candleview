'use client';

import {
  LineChart, BarChart3, TrendingUp,
  CandlestickChart, AreaChart, Layers, GitCompare,
  BarChart, TrendingDown, Mountain, Waves, Minus,
  Activity
} from 'lucide-react';
import { useI18n } from '@/app/providers/I18nProvider';

import enMessages from '@/messages/en.json';
import cnMessages from '@/messages/cn.json';

interface DrawingToolCategory {
  categoryKey: string;
  toolKeys: string[];
}

export default function ChartShowcase() {
  const locale = 'cn';
  const t = (key: string): string => {
    const currentMessages = locale === 'cn' ? cnMessages : enMessages;
    const keys = key.split('.');
    let value: unknown = currentMessages;
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };

  const compactChartTypes = [
    { icon: LineChart, titleKey: 'ChartShowcase.lineChart', gradient: 'from-blue-500 to-cyan-500' },
    { icon: AreaChart, titleKey: 'ChartShowcase.areaChart', gradient: 'from-green-500 to-emerald-500' },
    { icon: CandlestickChart, titleKey: 'ChartShowcase.hollowCandlestick', gradient: 'from-purple-500 to-pink-500' },
    { icon: BarChart, titleKey: 'ChartShowcase.ohlcChart', gradient: 'from-orange-500 to-amber-500' },
    { icon: Minus, titleKey: 'ChartShowcase.baselineChart', gradient: 'from-indigo-500 to-violet-500' },
    { icon: BarChart3, titleKey: 'ChartShowcase.histogramChart', gradient: 'from-rose-500 to-pink-500' },
    { icon: TrendingDown, titleKey: 'ChartShowcase.stepLineChart', gradient: 'from-teal-500 to-green-500' },
    { icon: Layers, titleKey: 'ChartShowcase.heikinAshi', gradient: 'from-yellow-500 to-orange-500' },
    { icon: Activity, titleKey: 'ChartShowcase.newPriceLine', gradient: 'from-blue-500 to-indigo-500' },
    { icon: Mountain, titleKey: 'ChartShowcase.mountainChart', gradient: 'from-green-500 to-teal-500' },
    { icon: Waves, titleKey: 'ChartShowcase.baselineArea', gradient: 'from-purple-500 to-blue-500' },
    { icon: TrendingUp, titleKey: 'ChartShowcase.highLowChart', gradient: 'from-red-500 to-orange-500' },
    { icon: GitCompare, titleKey: 'ChartShowcase.hlcAreaChart', gradient: 'from-cyan-500 to-blue-500' },
  ];

  const mainIndicators = [
    { name: "MA", fullName: "移动平均线 (MA)" },
    { name: "EMA", fullName: "指数移动平均线 (EMA)" },
    { name: "BB", fullName: "布林带 (Bollinger Bands)" },
    { name: "Ichimoku", fullName: "一目均衡表 (Ichimoku Cloud)" },
    { name: "Donchian", fullName: "唐奇安通道 (Donchian Channel)" },
    { name: "Envelope", fullName: "包络线 (Envelope)" },
    { name: "VWAP", fullName: "成交量加权平均价 (VWAP)" },
    { name: "HeatMap", fullName: "热力图 (Heat Map)" },
    { name: "MarketProfile", fullName: "市场轮廓图 (Market Profile)" }
  ];

  const subIndicators = [
    { name: "RSI", fullName: "相对强弱指数 (RSI)" },
    { name: "MACD", fullName: "指数平滑异同平均线 (MACD)" },
    { name: "Volume", fullName: "成交量 (Volume)" },
    { name: "SAR", fullName: "抛物线转向指标 (SAR)" },
    { name: "KDJ", fullName: "随机指标 (KDJ)" },
    { name: "ATR", fullName: "平均真实波幅 (ATR)" },
    { name: "Stochastic", fullName: "随机振荡器 (Stochastic Oscillator)" },
    { name: "CCI", fullName: "商品通道指数 (CCI)" },
    { name: "BBWidth", fullName: "布林带宽度 (Bollinger Bands Width)" },
    { name: "ADX", fullName: "平均趋向指数 (ADX)" },
    { name: "OBV", fullName: "能量潮指标 (OBV)" }
  ];

  const drawingTools: DrawingToolCategory[] = [
    {
      categoryKey: 'ChartShowcase.basicTools',
      toolKeys: [
        'ChartShowcase.tools.basic.drawingTools',
        'ChartShowcase.tools.basic.lines',
        'ChartShowcase.tools.basic.arrows'
      ]
    },
    {
      categoryKey: 'ChartShowcase.channelTools',
      toolKeys: [
        'ChartShowcase.tools.channel.parallel',
        'ChartShowcase.tools.channel.regression',
        'ChartShowcase.tools.channel.equal',
        'ChartShowcase.tools.channel.discontinuous'
      ]
    },
    {
      categoryKey: 'ChartShowcase.fibonacciTools',
      toolKeys: [
        'ChartShowcase.tools.fibonacci.retracement',
        'ChartShowcase.tools.fibonacci.timeZones',
        'ChartShowcase.tools.fibonacci.arcs',
        'ChartShowcase.tools.fibonacci.circles',
        'ChartShowcase.tools.fibonacci.spiral',
        'ChartShowcase.tools.fibonacci.fan',
        'ChartShowcase.tools.fibonacci.channel',
        'ChartShowcase.tools.fibonacci.priceExtension',
        'ChartShowcase.tools.fibonacci.timeExtension'
      ]
    },
    {
      categoryKey: 'ChartShowcase.gannTools',
      toolKeys: [
        'ChartShowcase.tools.gann.fan',
        'ChartShowcase.tools.gann.box',
        'ChartShowcase.tools.gann.rectangle'
      ]
    },
    {
      categoryKey: 'ChartShowcase.patternTools',
      toolKeys: [
        'ChartShowcase.tools.pattern.andrewsPitchfork',
        'ChartShowcase.tools.pattern.enhancedPitchfork',
        'ChartShowcase.tools.pattern.schiffPitchfork',
        'ChartShowcase.tools.pattern.xabcdPattern',
        'ChartShowcase.tools.pattern.headShoulders',
        'ChartShowcase.tools.pattern.abcdPattern',
        'ChartShowcase.tools.pattern.triangleABCD',
        'ChartShowcase.tools.pattern.elliottWave',
        'ChartShowcase.tools.pattern.impulseWave',
        'ChartShowcase.tools.pattern.correctiveWave',
        'ChartShowcase.tools.pattern.triangleWave',
        'ChartShowcase.tools.pattern.doubleCombination',
        'ChartShowcase.tools.pattern.tripleCombination'
      ]
    },
    {
      categoryKey: 'ChartShowcase.geometricShapes',
      toolKeys: [
        'ChartShowcase.tools.geometric.shapes',
        'ChartShowcase.tools.geometric.curves'
      ]
    },
    {
      categoryKey: 'ChartShowcase.annotationTools',
      toolKeys: [
        'ChartShowcase.tools.annotation.text',
        'ChartShowcase.tools.annotation.markers',
        'ChartShowcase.tools.annotation.flags',
        'ChartShowcase.tools.annotation.image'
      ]
    },
    {
      categoryKey: 'ChartShowcase.rangeTools',
      toolKeys: [
        'ChartShowcase.tools.range.timePrice',
        'ChartShowcase.tools.range.combined',
        'ChartShowcase.tools.range.heatmap'
      ]
    },
    {
      categoryKey: 'ChartShowcase.tradingTools',
      toolKeys: [
        'ChartShowcase.tools.trading.positions',
        'ChartShowcase.tools.trading.simulation'
      ]
    }
  ];

  const features = [
    {
      titleKey: 'ChartShowcase.realTimeCalculation',
      descKey: 'ChartShowcase.realTimeCalculationDesc',
      gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      titleKey: 'ChartShowcase.smartInteraction',
      descKey: 'ChartShowcase.smartInteractionDesc',
      gradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      titleKey: 'ChartShowcase.highCustomization',
      descKey: 'ChartShowcase.highCustomizationDesc',
      gradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  const scrollbarStyles = `
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #94a3b8 #f1f5f9;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }

    /* Dark mode styles */
    .dark .custom-scrollbar {
      scrollbar-color: #475569 #1e293b;
    }

    .dark .custom-scrollbar::-webkit-scrollbar-track {
      background: #1e293b;
    }

    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #475569;
    }

    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
  `;

  return (
    <>
      <style jsx global>{scrollbarStyles}</style>
      <section className="py-10 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('ChartShowcase.title')}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('ChartShowcase.subtitle')}
            </p>
          </div>
          <div className="mt-12">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold tracking-tight">
                {t('ChartShowcase.basicCharts')}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('ChartShowcase.basicChartsDesc')}
              </p>
            </div>
            <div className="bg-card rounded-xl border p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {compactChartTypes.map((chart, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r ${chart.gradient} flex items-center justify-center`}>
                      <chart.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium truncate">
                      {t(chart.titleKey)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl border p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 p-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">
                  {t('ChartShowcase.technicalIndicators')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <h4 className="font-semibold text-sm">
                      {t('ChartShowcase.mainIndicators')}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {mainIndicators.map((indicator, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-300 mt-2 flex-shrink-0"></div>
                        <span className="text-sm">
                          {locale === 'cn' ? indicator.fullName : indicator.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <h4 className="font-semibold text-sm">
                      {t('ChartShowcase.subIndicators')}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {subIndicators.map((indicator, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-300 mt-2 flex-shrink-0"></div>
                        <span className="text-sm">
                          {locale === 'cn' ? indicator.fullName : indicator.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('ChartShowcase.indicatorFeatures')}
                </p>
              </div>
            </div>
            <div className="bg-card rounded-2xl border p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500 p-2">
                  <LineChart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">
                  {t('ChartShowcase.drawingTools')}
                </h3>
              </div>
              <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {drawingTools.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      <h4 className="font-semibold text-sm">
                        {t(category.categoryKey)}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.toolKeys.map((toolKey, toolIndex) => (
                        <span
                          key={toolIndex}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                        >
                          {t(toolKey)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('ChartShowcase.toolFeatures')}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.gradient} rounded-xl p-6`}
              >
                <div className={`${feature.color} font-semibold mb-3`}>
                  {t(feature.titleKey)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
