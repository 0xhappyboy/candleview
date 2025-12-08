'use client';

import { useEffect, useState, useRef } from 'react';
import { siteConfig } from '../config';
import { useI18n } from '../providers/I18nProvider';
import { CandleView, ICandleViewDataPoint } from 'candleview';

interface LocalizableContent {
  en: string;
  cn: string;
  [key: string]: string;
}

type LocalizableConfig = string | LocalizableContent;

const getLocalizedContent = (config: LocalizableConfig, locale: string): string => {
  if (typeof config === 'object') {
    const obj = config as Record<string, string>;
    if (obj[locale]) {
      return obj[locale];
    }
    if (obj['en']) {
      return obj['en'];
    }
  }
  return config as string;
};

const renderHighlightedTitle = (title: string, highlight: string) => {
  if (!title.includes(highlight)) {
    return <span className="text-foreground">{title}</span>;
  }
  const parts = title.split(highlight);
  return (
    <span className="text-foreground">
      {parts[0]}
      <span className="relative">
        <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
          {highlight}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-xl opacity-50" />
      </span>
      {parts[1]}
    </span>
  );
};

const generateSecondLevelData = (
  basePrice: number,
  startTime: Date,
  durationSeconds: number,
  volatility: number,
  minPrice: number,
  maxPrice: number
): ICandleViewDataPoint[] => {
  const data: ICandleViewDataPoint[] = [];
  let currentPrice = basePrice;

  for (let i = 0; i < durationSeconds; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility;
    currentPrice = currentPrice * (1 + change / 100);
    currentPrice = Math.max(minPrice, Math.min(maxPrice, currentPrice));
    const open = i === 0 ? basePrice : data[i - 1].close;
    const close = currentPrice;
    const high = Math.max(open, close) * (1 + Math.random() * 0.001);
    const low = Math.min(open, close) * (1 - Math.random() * 0.001);
    const timestamp = new Date(startTime.getTime() + i * 1000);
    const volume = Math.random() * 1000 + 100;
    data.push({
      time: timestamp.getTime(),
      open,
      high,
      low,
      close,
      volume
    });
  }
  return data;
};

const generateNewDataPoint = (
  lastDataPoint: ICandleViewDataPoint,
  volatility: number,
  minPrice: number,
  maxPrice: number
): ICandleViewDataPoint => {
  const change = (Math.random() - 0.5) * 2 * volatility;
  let currentPrice = lastDataPoint.close * (1 + change / 100);
  currentPrice = Math.max(minPrice, Math.min(maxPrice, currentPrice));
  const close = currentPrice;
  const open = lastDataPoint.close;
  const high = Math.max(open, close) * (1 + Math.random() * 0.001);
  const low = Math.min(open, close) * (1 - Math.random() * 0.001);
  const timestamp = new Date(lastDataPoint.time + 1000);
  const volume = Math.random() * 1000 + 100;
  return {
    time: timestamp.getTime(),
    open,
    high,
    low,
    close,
    volume
  };
};

const panelI18n = {
  title: {
    en: 'Virtual Second-Level Data Generator',
    cn: '虚拟秒级数据生成器'
  },
  basePrice: {
    en: 'Base Price',
    cn: '基准价格'
  },
  durationSeconds: {
    en: 'Duration (seconds)',
    cn: '时间段（秒）'
  },
  volatility: {
    en: 'Volatility (%)',
    cn: '波动性（%）'
  },
  minPrice: {
    en: 'Minimum Price',
    cn: '最低价格'
  },
  maxPrice: {
    en: 'Maximum Price',
    cn: '最高价格'
  },
  generateData: {
    en: 'Generate Virtual Data',
    cn: '生成虚拟数据'
  },
  restoreTestData: {
    en: 'Restore Test Data',
    cn: '恢复测试数据'
  },
  startDynamicData: {
    en: 'Start Dynamic Data',
    cn: '启动动态数据'
  },
  stopDynamicData: {
    en: 'Stop Dynamic Data',
    cn: '停止动态数据'
  },
  generatedPoints: {
    en: 'generated data points',
    cn: '个数据点'
  }
};

export default function Preview() {
  const locale = 'cn';
  const [isDark, setIsDark] = useState(true);
  const preview = siteConfig.preview;
  const localizedTitleMain = getLocalizedContent(preview.title.main, locale);
  const localizedTitleHighlight = getLocalizedContent(preview.title.highlight, locale);
  const localizedSubtitleText = getLocalizedContent(preview.subtitle.text, locale);
  const [dataParams, setDataParams] = useState<{
    basePrice: number | string;
    durationSeconds: number | string;
    volatility: number | string;
    minPrice: number | string;
    maxPrice: number | string;
  }>({
    basePrice: 100,
    durationSeconds: 300,
    volatility: 0.5,
    minPrice: 90,
    maxPrice: 110,
  });
  const [candleData, setCandleData] = useState<ICandleViewDataPoint[]>([]);
  const [isDynamicAdding, setIsDynamicAdding] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const checkTheme = () => {
      const isDarkTheme = document.documentElement.classList.contains('dark');
      setIsDark(isDarkTheme);
    };
    checkTheme();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const initialParams = {
      basePrice: 100,
      durationSeconds: 300,
      volatility: 0.5,
      minPrice: 90,
      maxPrice: 110,
    };

    const startTime = new Date(Date.now() - initialParams.durationSeconds * 1000);
    const initialData = generateSecondLevelData(
      initialParams.basePrice,
      startTime,
      initialParams.durationSeconds,
      initialParams.volatility,
      initialParams.minPrice,
      initialParams.maxPrice
    );
    setCandleData(initialData);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getCandleViewI18n = () => {
    if (locale === 'cn') {
      return 'zh-cn';
    }
    return 'en';
  };

  const handleInputChange = (field: keyof typeof dataParams, value: string) => {
    const numValue = value === '' ? '' : Number(value);
    setDataParams(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.stopPropagation();
    }
  };

  const handleGenerateData = () => {
    const params = {
      basePrice: typeof dataParams.basePrice === 'number' ? dataParams.basePrice : 100,
      durationSeconds: typeof dataParams.durationSeconds === 'number' ? dataParams.durationSeconds : 300,
      volatility: typeof dataParams.volatility === 'number' ? dataParams.volatility : 0.5,
      minPrice: typeof dataParams.minPrice === 'number' ? dataParams.minPrice : 90,
      maxPrice: typeof dataParams.maxPrice === 'number' ? dataParams.maxPrice : 110,
    };
    const startTime = new Date(Date.now() - params.durationSeconds * 1000);
    const newData = generateSecondLevelData(
      params.basePrice,
      startTime,
      params.durationSeconds,
      params.volatility,
      params.minPrice,
      params.maxPrice
    );
    setCandleData(newData);
  };

  const toggleDynamicData = () => {
    if (isDynamicAdding) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsDynamicAdding(false);
    } else {
      setIsDynamicAdding(true);
      intervalRef.current = setInterval(() => {
        setCandleData(prevData => {
          if (prevData.length === 0) return prevData;
          const lastDataPoint = prevData[prevData.length - 1];
          const volatility = typeof dataParams.volatility === 'number' ? dataParams.volatility : 0.5;
          const minPrice = typeof dataParams.minPrice === 'number' ? dataParams.minPrice : 90;
          const maxPrice = typeof dataParams.maxPrice === 'number' ? dataParams.maxPrice : 110;
          const newDataPoint = generateNewDataPoint(
            lastDataPoint,
            volatility,
            minPrice,
            maxPrice
          );
          const newData = [...prevData.slice(-999), newDataPoint];
          return newData;
        });
      }, 1000);
    }
  };

  const getPanelText = (key: keyof typeof panelI18n) => {
    return panelI18n[key][locale] || panelI18n[key].en;
  };

  return (
    <section className={preview.container.className}>
      <h2 className={preview.title.className}>
        {renderHighlightedTitle(localizedTitleMain, localizedTitleHighlight)}
      </h2>
      <p className={preview.subtitle.className}>
        {localizedSubtitleText}
      </p>
      <div className="w-full max-w-[80%] mb-2 p-4 bg-card border border-border rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3">{getPanelText('title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1">{getPanelText('basePrice')}</label>
            <input
              type="number"
              value={dataParams.basePrice}
              onChange={(e) => handleInputChange('basePrice', e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border border-border rounded bg-background text-foreground"
              step="0.1"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{getPanelText('durationSeconds')}</label>
            <input
              type="number"
              value={dataParams.durationSeconds}
              onChange={(e) => handleInputChange('durationSeconds', e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border border-border rounded bg-background text-foreground"
              min="60"
              max="3600"
              placeholder="300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{getPanelText('volatility')}</label>
            <input
              type="number"
              value={dataParams.volatility}
              onChange={(e) => handleInputChange('volatility', e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border border-border rounded bg-background text-foreground"
              step="0.1"
              min="0.1"
              max="10"
              placeholder="0.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{getPanelText('minPrice')}</label>
            <input
              type="number"
              value={dataParams.minPrice}
              onChange={(e) => handleInputChange('minPrice', e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border border-border rounded bg-background text-foreground"
              step="0.1"
              placeholder="90"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{getPanelText('maxPrice')}</label>
            <input
              type="number"
              value={dataParams.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border border-border rounded bg-background text-foreground"
              step="0.1"
              placeholder="110"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleGenerateData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            {getPanelText('generateData')}
          </button>
          <button
            onClick={() => {
              const defaultParams = {
                basePrice: 100,
                durationSeconds: 300,
                volatility: 0.5,
                minPrice: 90,
                maxPrice: 110,
              };
              setDataParams(defaultParams);
              const startTime = new Date(Date.now() - defaultParams.durationSeconds * 1000);
              const defaultData = generateSecondLevelData(
                defaultParams.basePrice,
                startTime,
                defaultParams.durationSeconds,
                defaultParams.volatility,
                defaultParams.minPrice,
                defaultParams.maxPrice
              );
              setCandleData(defaultData);
              if (isDynamicAdding) {
                toggleDynamicData();
              }
            }}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
          >
            {getPanelText('restoreTestData')}
          </button>
          {/* <button
            onClick={toggleDynamicData}
            className={`px-4 py-2 rounded transition-colors ${
              isDynamicAdding
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isDynamicAdding ? getPanelText('stopDynamicData') : getPanelText('startDynamicData')}
          </button> */}
          <div className="text-sm text-muted-foreground ml-auto">
            {candleData.length} {getPanelText('generatedPoints')}
            {isDynamicAdding && <span className="ml-2 text-green-500 animate-pulse">● 动态添加中</span>}
          </div>
        </div>
      </div>
      <div className={preview.previewArea.className}>
        {candleData.length > 0 && (
          <CandleView
            data={candleData}
            title='Test'
            theme={isDark ? 'dark' : 'light'}
            i18n={getCandleViewI18n()}
            height={600}
            timeframe='15m'
            leftpanel={true}
            toppanel={true}
            terminal={true}
            ai={true}
            aiconfigs={[
              {
                proxyUrl: '/api',
                brand: 'aliyun',
                model: 'qwen-turbo',
              },
              {
                proxyUrl: '/api',
                brand: 'deepseek',
                model: 'deepseek-chat',
              },
            ]}
          />
        )}
      </div>
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
