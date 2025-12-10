'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { TEST_CANDLEVIEW_DATA8 } from '../mock/mock_data_1';
import { useI18n } from '../providers/I18nProvider';
import StaticMarker from './StaticMarker';
import RealtimeData from './RealtimeData';
import RemoteData from './RemoteData';
import DataUpload from './DataUpload';
import Emulator from './Emulator';
import CandleView, { ICandleViewDataPoint } from 'candleview';

interface GeneratorParams {
  volatility: number;
  startTime: string;
  endTime: string;
  minPrice: number;
  maxPrice: number;
  trendDirection: string;
  gapProbability: number;
  volumeCorrelation: number;
  anomalyProbability: number;
  pricePrecision: number;
}

interface MarkDataItem {
  time: number;
  type: string;
  data: { text: string; direction: string }[];
}

export default function FullViewportComponent() {
  const { locale } = useI18n();
  const [isDark, setIsDark] = useState(true);
  const [candleViewHeight, setCandleViewHeight] = useState<string | number>("100%");
  const [leftPanelWidth, setLeftPanelWidth] = useState(90);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([1, 2, 3, 4]);
  const [uploadedCandleData, setUploadedCandleData] = useState<ICandleViewDataPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const getInitialTimes = () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    return {
      startTime: oneHourAgo.toISOString().slice(0, 16),
      endTime: now.toISOString().slice(0, 16),
      nowTime: now.getTime()
    };
  };
  const initialTimes = getInitialTimes();
  const [staticMarkers, setStaticMarkers] = useState<number[]>([]);

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

  const getCandleViewI18n = () => {
    if (locale === 'cn') {
      return 'zh-cn';
    }
    return 'en';
  };

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    startXRef.current = e.clientX;
    startWidthRef.current = leftPanelWidth;
    setIsResizing(true);
  }, [leftPanelWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const deltaX = e.clientX - startXRef.current;
    const deltaPercent = (deltaX / containerWidth) * 100;
    let newWidth = startWidthRef.current + deltaPercent;
    newWidth = Math.max(50, newWidth);
    newWidth = Math.min(90, newWidth);
    setLeftPanelWidth(newWidth);
  }, [isResizing]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResizing);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, handleMouseMove, stopResizing]);

  const toggleMenu = (index: number) => {
    setExpandedMenus(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const [generatedCandleData, setGeneratedCandleData] = useState<ICandleViewDataPoint[]>([]);
  const [realtimeData, setRealtimeData] = useState<ICandleViewDataPoint[]>([]);
  const [generatorParams, setGeneratorParams] = useState<GeneratorParams>({
    volatility: 5,
    startTime: initialTimes.startTime,
    endTime: initialTimes.endTime,
    minPrice: 100,
    maxPrice: 200,
    trendDirection: 'random',
    gapProbability: 5,
    volumeCorrelation: 7,
    anomalyProbability: 2,
    pricePrecision: 2,
  });

  const generateOHLCVData = async () => {
    setIsGenerating(true);

    const {
      volatility,
      startTime,
      endTime,
      minPrice,
      maxPrice,
      trendDirection,
      gapProbability,
      volumeCorrelation,
      anomalyProbability,
      pricePrecision
    } = generatorParams;

    setGeneratedCandleData([]);
    setRealtimeData([]);
    await new Promise(resolve => setTimeout(resolve, 10));
    let start = startTime ? new Date(startTime).getTime() : Date.now() - 3600000;
    let end = endTime ? new Date(endTime).getTime() : Date.now();
    if (start >= end) {
      start = end - 3600000;
    }
    const startSeconds = Math.floor(start / 1000);
    const endSeconds = Math.floor(end / 1000);
    const numPoints = endSeconds - startSeconds + 1;
    if (numPoints <= 0) {
      setIsGenerating(false);
      return;
    }
    const basePrice = (minPrice + maxPrice) / 2;
    const volatilityFactor = volatility / 10;
    const gapFactor = gapProbability / 100;
    const anomalyFactor = anomalyProbability / 100;
    const volumeFactor = volumeCorrelation / 10;
    const data: ICandleViewDataPoint[] = [];
    let lastClose = basePrice;
    let trendBias = 0;
    switch (trendDirection) {
      case 'up':
        trendBias = 0.1;
        break;
      case 'down':
        trendBias = -0.1;
        break;
      case 'sideways':
        trendBias = 0;
        break;
      default:
        trendBias = (Math.random() - 0.5) * 0.2;
    }
    for (let i = 0; i < numPoints; i++) {
      const timestamp = startSeconds + i;
      const random = (Math.random() - 0.5) * 2;
      const cycle = Math.sin(i / 10) * 0.1;
      const priceChange = (random + trendBias + cycle) * volatilityFactor;
      let open = lastClose;
      if (Math.random() < gapFactor) {
        const gapSize = (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
        open = lastClose * (1 + gapSize);
      }
      const close = open * (1 + priceChange / 100);
      const clampedClose = Math.min(maxPrice, Math.max(minPrice, close));
      const range = Math.abs(clampedClose - open) * (1 + volatilityFactor);
      let high = Math.max(open, clampedClose) + range * Math.random() * 0.5;
      let low = Math.min(open, clampedClose) - range * Math.random() * 0.5;
      high = Math.min(maxPrice * 1.01, high);
      low = Math.max(minPrice * 0.99, low);
      if (Math.random() < anomalyFactor) {
        if (Math.random() > 0.5) {
          high = high * (1 + Math.random() * 0.15);
        } else {
          low = low * (1 - Math.random() * 0.15);
        }
      }
      const priceMove = Math.abs(clampedClose - open) / open;
      const baseVolume = 1000 + Math.random() * 9000;
      const correlatedVolume = baseVolume * (1 + priceMove * volumeFactor);
      const volume = Math.floor(correlatedVolume);
      const toPrecision = (num: number) => parseFloat(num.toFixed(pricePrecision));
      data.push({
        time: timestamp,
        open: toPrecision(open),
        high: toPrecision(high),
        low: toPrecision(low),
        close: toPrecision(clampedClose),
        volume: volume,
        isVirtual: false
      });
      lastClose = clampedClose;
      if (data.length % 1000 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    setGeneratedCandleData(data);
    setIsGenerating(false);
  };

  const handleParamChange = (key: keyof GeneratorParams, value: string | number) => {
    setGeneratorParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRealtimeDataGenerated = (data: ICandleViewDataPoint[]) => {
    setRealtimeData(data);
    if (data.length > 0) {
      setGeneratedCandleData(data);
    }
  };

  const getDisplayData = () => {
    if (realtimeData.length > 0) {
      return realtimeData;
    }
    if (generatedCandleData.length > 0) {
      return generatedCandleData;
    }
    if (uploadedCandleData.length > 0) {
      return uploadedCandleData;
    }
    return TEST_CANDLEVIEW_DATA8;
  };

  const [markData, setMarkData] = useState<MarkDataItem[]>([]);

  const handleMarkerAdd = (markerData: { time: number; type: string; data: { text: string; direction: string }[] }) => {
    setMarkData(prev => {
      const existingIndex = prev.findIndex(item => item.time === markerData.time);
      if (existingIndex >= 0) {
        const newMarkData = [...prev];
        const existingData = newMarkData[existingIndex];
        const mergedData = [...existingData.data];
        markerData.data.forEach(newItem => {
          const exists = mergedData.some(
            item => item.text === newItem.text && item.direction === newItem.direction
          );
          if (!exists) {
            mergedData.push(newItem);
          }
        });
        newMarkData[existingIndex] = {
          ...existingData,
          data: mergedData
        };
        return newMarkData;
      } else {
        return [...prev, markerData];
      }
    });
  };

  const handleMarkerRemove = (timestamp: number) => {
    setMarkData(prev => prev.filter(item => item.time !== timestamp));
  };

  const menuItems = [
    {
      id: 1,
      title: locale === 'cn' ? '模拟器' : 'Emulator',
      content: (
        <Emulator
          isDark={isDark}
          locale={locale}
          generatorParams={generatorParams}
          generatedCandleData={generatedCandleData}
          onParamChange={handleParamChange}
          onGenerate={generateOHLCVData}
        />
      )
    },
    {
      id: 2,
      title: locale === 'cn' ? '数据上传' : 'Data Upload',
      content: (
        <DataUpload
          isDark={isDark}
          locale={locale}
          onDataParsed={(data) => {
            setUploadedCandleData(data);
            if (data.length > 0) {
              setGeneratedCandleData(data);
              setRealtimeData([]);
            }
          }}
        />
      )
    },
    {
      id: 3,
      title: locale === 'cn' ? '远程数据' : 'Remote Data',
      content: (
        <RemoteData
          isDark={isDark}
          locale={locale}
          onDataLoaded={(data) => {
            setGeneratedCandleData(data);
            setRealtimeData([]);
          }}
        />
      )
    },
    {
      id: 4,
      title: locale === 'cn' ? '实时数据' : 'Realtime Data',
      content: (
        <RealtimeData
          isDark={isDark}
          locale={locale}
          onDataGenerated={handleRealtimeDataGenerated}
        />
      )
    },
    {
      id: 5,
      title: locale === 'cn' ? '静态标记' : 'Static Markers',
      content: (
        <StaticMarker
          isDark={isDark}
          locale={locale}
          chartData={getDisplayData()}
          onMarkerAdd={handleMarkerAdd}
          onMarkerRemove={handleMarkerRemove}
          onClearAllMarkers={() => {
            setMarkData([]);
          }}
        />
      )
    },
  ];

  const getDividerHandleColor = () => {
    return isDark
      ? 'bg-gray-600 group-hover:bg-blue-600'
      : 'bg-gray-400 group-hover:bg-blue-500';
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
    >
      <div className="w-full h-full flex">
        <div
          className="h-full overflow-hidden"
          style={{
            width: `${leftPanelWidth}%`,
            minWidth: '50%',
            maxWidth: '90%'
          }}
        >
          <CandleView
            data={getDisplayData()}
            title={realtimeData.length > 0 ?
              locale === 'en' ? 'Real Time Data' : '实时数据' :
              locale === 'en' ? 'Test Data' : '测试数据'}
            theme={isDark ? 'dark' : 'light'}
            i18n={getCandleViewI18n()}
            height={candleViewHeight}
            leftpanel={true}
            timeframe='1s'
            toppanel={true}
            markData={markData}
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
        </div>
        <div
          className={`w-2 h-full cursor-col-resize relative group transition-colors duration-200 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
          onMouseDown={startResizing}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-1 h-8 rounded transition-colors duration-200 ${getDividerHandleColor()}`}></div>
          </div>
        </div>
        <div
          className="h-full overflow-hidden flex flex-col"
          style={{
            width: `${100 - leftPanelWidth}%`,
            minWidth: '20%'
          }}
        >
          <div className="flex-1 overflow-hidden relative">
            <div className={`absolute inset-0 overflow-y-auto ${isDark ? 'scrollbar-dark' : 'scrollbar-light'}`}>
              <div className="p-0">
                <div className="space-y-0">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className={`overflow-hidden transition-all duration-300 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                    >
                      <div
                        className={`px-3 py-2 flex justify-between items-center cursor-pointer transition-colors duration-200 ${isDark
                          ? 'hover:bg-gray-700 active:bg-gray-600 border-gray-700'
                          : 'hover:bg-gray-200 active:bg-gray-300 border-gray-300'
                          } border-b `}
                        onClick={() => toggleMenu(item.id)}
                      >
                        <span className={`text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          {item.title}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${expandedMenus.includes(item.id) ? 'rotate-180' : ''
                            } ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {expandedMenus.includes(item.id) && (
                        <div
                          className="px-3 transition-all duration-300 ease-in-out"
                        >
                          <div className={`h-full flex items-center justify-center transition-colors duration-300 ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'
                            }`}>
                            <p className="text-sm">{item.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize"></div>
      )}
      <style jsx global>{`
        .scrollbar-light {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f7fafc;
        }
        .scrollbar-light::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background: linear-gradient(90deg, #f7fafc 0%, #edf2f7 100%);
          border-radius: 10px;
          border: 2px solid #f7fafc;
          box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
          border-radius: 10px;
          border: 2px solid #f7fafc;
          min-height: 40px;
          transition: all 0.3s ease;
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #a0aec0 0%, #718096 100%);
          box-shadow: 0 0 8px rgba(113, 128, 150, 0.4);
          transform: scale(1.05);
        }
        .scrollbar-light::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, #718096 0%, #4a5568 100%);
        }
        .scrollbar-light::-webkit-scrollbar-corner {
          background: #f7fafc;
        }
        .scrollbar-dark {
          scrollbar-width: thin;
          scrollbar-color: #4a5568 #1a202c;
        }
        .scrollbar-dark::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background: linear-gradient(90deg, #1a202c 0%, #2d3748 100%);
          border-radius: 10px;
          border: 2px solid #1a202c;
          box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
          border-radius: 10px;
          border: 2px solid #1a202c;
          min-height: 40px;
          transition: all 0.3s ease;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
          box-shadow: 0 0 8px rgba(66, 153, 225, 0.5);
          transform: scale(1.05);
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, #2d3748 0%, #4299e1 100%);
        }
        .scrollbar-dark::-webkit-scrollbar-corner {
          background: #1a202c;
        }
        @supports (scrollbar-width: thin) {
          .scrollbar-light {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e0 #f7fafc;
          }
          .scrollbar-dark {
            scrollbar-width: thin;
            scrollbar-color: #4a5568 #1a202c;
          }
        }
        .scrollbar-light, .scrollbar-dark {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .scrollbar-light::-webkit-scrollbar-track-piece:start,
        .scrollbar-dark::-webkit-scrollbar-track-piece:start {
          background: transparent;
        }
        .scrollbar-light::-webkit-scrollbar-track-piece:end,
        .scrollbar-dark::-webkit-scrollbar-track-piece:end {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
