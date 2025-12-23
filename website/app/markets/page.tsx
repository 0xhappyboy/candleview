'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { TEST_CANDLEVIEW_DATA8 } from '../mock/mock_data_1';
import { useI18n } from '../providers/I18nProvider';
import CandleView, { ICandleViewDataPoint } from 'candleview';
import Cryptos from './Cryptos';

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

interface CryptoItem {
  pair: string;
  currentPrice: number;
  change24h: number;
  volume: number;
  priceChange?: number;
}

interface BinanceTicker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

interface BinanceTickerStream {
  e: string;
  E: number;
  s: string;
  p: string;
  P: string;
  w: string;
  x: string;
  c: string;
  Q: string;
  b: string;
  B: string;
  a: string;
  A: string;
  o: string;
  h: string;
  l: string;
  v: string;
  q: string;
  O: number;
  C: number;
  F: number;
  L: number;
  n: number;
}

interface BinanceKlineData {
  0: number;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: number;
  7: string;
  8: number;
  9: string;
  10: string;
  11: string;
}

export default function FullViewportComponent() {
  const { locale } = useI18n();
  const [isDark, setIsDark] = useState(true);
  const [candleViewHeight, setCandleViewHeight] = useState<string | number>("100%");
  const [leftPanelWidth, setLeftPanelWidth] = useState(90);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([1, 2, 3, 4, 5]);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [cryptoList, setCryptoList] = useState<CryptoItem[]>([]);
  const [filteredCryptoList, setFilteredCryptoList] = useState<CryptoItem[]>([]);
  const [displayedCryptoList, setDisplayedCryptoList] = useState<CryptoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'change'>('volume');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [candleData, setCandleData] = useState<ICandleViewDataPoint[]>(TEST_CANDLEVIEW_DATA8);
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [isLoadingCandleData, setIsLoadingCandleData] = useState(false);
  const [candleDataError, setCandleDataError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

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

  const initializeWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket('wss://stream.binance.com:9443/ws');
    wsRef.current = ws;
    ws.onopen = () => {
      setWsConnected(true);
      setError(null);
      fetchInitialData();
      setTimeout(() => {
        const popularPairs = [
          'btcusdt', 'ethusdt', 'bnbusdt', 'solusdt', 'xrpusdt',
          'adausdt', 'dogeusdt', 'dotusdt', 'avaxusdt', 'linkusdt',
          'maticusdt', 'uniusdt', 'ltcusdt', 'atomusdt', 'etcusdt',
          'trxusdt', 'filusdt', 'apeusdt', 'nearusdt', 'algoeust',
          'ftmusdt', 'sandusdt', 'manausdt', 'axsusdt', 'thetaeust',
          'vetusdt', 'icpusdt', 'eosusdt', 'xtzusdt', 'hbarusdt',
          'egldusdt', 'oneusdt', 'fttusdt', 'celousdt', 'enjusdt',
          'chzusdt', 'zilusdt', 'stxusdt', 'hntusdt', 'grtusdt'
        ];
        const batchSize = 10;
        for (let i = 0; i < popularPairs.length; i += batchSize) {
          const batch = popularPairs.slice(i, i + batchSize);
          const subscribeMsg = {
            method: "SUBSCRIBE",
            params: batch.map(pair => `${pair}@ticker`),
            id: i / batchSize + 1
          };
          setTimeout(() => {
            ws.send(JSON.stringify(subscribeMsg));
          }, i * 100);
        }
      }, 1000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.e === '24hrTicker') {
          updateCryptoPrice(data);
        }
      } catch (err) {
      }
    };

    ws.onerror = (error) => {
      setError('WebSocket Connect Error');
      setWsConnected(false);
    };

    ws.onclose = () => {
      setWsConnected(false);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        initializeWebSocket();
      }, 5000);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: BinanceTicker24hr[] = await response.json();
      const formattedData: CryptoItem[] = data
        .filter(item => {
          return item.symbol.endsWith('USDT');
        })
        .map(item => {
          const pair = `${item.symbol.replace('USDT', '')}/USDT`;
          return {
            pair,
            currentPrice: parseFloat(item.lastPrice),
            change24h: parseFloat(item.priceChangePercent),
            volume: parseFloat(item.quoteVolume),
            priceChange: 0
          };
        })
        .filter(item => {
          return !isNaN(item.currentPrice) &&
            !isNaN(item.change24h) &&
            item.currentPrice > 0 &&
            item.volume > 10000;
        });
      setCryptoList(formattedData);
      const sorted = [...formattedData].sort((a, b) => b.volume - a.volume);
      setFilteredCryptoList(sorted);
      setDisplayedCryptoList(sorted.slice(0, displayCount));
      setHasMore(sorted.length > displayCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      const fallbackData: CryptoItem[] = [];
      const samplePairs = [
        'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT',
        'ADA/USDT', 'DOGE/USDT', 'DOT/USDT', 'AVAX/USDT', 'LINK/USDT',
        'MATIC/USDT', 'UNI/USDT', 'LTC/USDT', 'ATOM/USDT', 'ETC/USDT',
        'TRX/USDT', 'FIL/USDT', 'APE/USDT', 'NEAR/USDT', 'ALGO/USDT',
        'FTM/USDT', 'SAND/USDT', 'MANA/USDT', 'AXS/USDT', 'THETA/USDT',
        'VET/USDT', 'ICP/USDT', 'EOS/USDT', 'XTZ/USDT', 'HBAR/USDT',
        'EGLD/USDT', 'ONE/USDT', 'FTT/USDT', 'CELO/USDT', 'ENJ/USDT',
        'CHZ/USDT', 'ZIL/USDT', 'STX/USDT', 'HNT/USDT', 'GRT/USDT',
        'BCH/USDT', 'XLM/USDT', 'AAVE/USDT', 'CRV/USDT', 'SNX/USDT',
        'COMP/USDT', 'MKR/USDT', 'SUSHI/USDT', 'YFI/USDT', 'RUNE/USDT',
        'KSM/USDT', 'DASH/USDT', 'ZEC/USDT', 'XMR/USDT', 'OMG/USDT',
        'BAT/USDT', 'QTUM/USDT', 'IOTA/USDT', 'NEO/USDT', 'ONT/USDT',
        'VTHO/USDT', 'TFUEL/USDT', 'OCEAN/USDT', 'RSR/USDT', 'CVC/USDT',
        'BAND/USDT', 'RLC/USDT', 'STORJ/USDT', 'SKL/USDT', 'ANKR/USDT',
        'DENT/USDT', 'WIN/USDT', 'COS/USDT', 'CTK/USDT', 'DODO/USDT',
        'LIT/USDT', 'BADGER/USDT', 'ALPHA/USDT', 'BEL/USDT', 'DEFI/USDT',
        'TLM/USDT', 'LINA/USDT', 'PERP/USDT', 'DGB/USDT', 'SC/USDT',
        'STMX/USDT', 'HOT/USDT', 'ARPA/USDT', 'DATA/USDT', 'AKRO/USDT',
        'REEF/USDT', 'ORN/USDT', 'PSG/USDT', 'CITY/USDT', 'BAR/USDT'
      ];

      samplePairs.forEach((pair, index) => {
        const basePrice = index < 30 ? 100 * Math.random() + 10 : Math.random() * 10;
        const change = (Math.random() - 0.5) * 20;
        fallbackData.push({
          pair,
          currentPrice: basePrice,
          change24h: change,
          volume: Math.random() * 1000000000 + 1000000,
          priceChange: 0
        });
      });

      setCryptoList(fallbackData);
      const sorted = [...fallbackData].sort((a, b) => b.volume - a.volume);
      setFilteredCryptoList(sorted);
      setDisplayedCryptoList(sorted.slice(0, displayCount));
      setHasMore(sorted.length > displayCount);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const updateCryptoPrice = useCallback((tickerData: BinanceTickerStream) => {
    setCryptoList(prev => {
      const symbol = tickerData.s;
      const newPrice = parseFloat(tickerData.c);
      const priceChangePercent = parseFloat(tickerData.P);
      const quoteVolume = parseFloat(tickerData.q);
      return prev.map(item => {
        if (item.pair === `${symbol.replace('USDT', '')}/USDT`) {
          const oldPrice = item.currentPrice;
          const priceChange = oldPrice ? newPrice - oldPrice : 0;
          return {
            ...item,
            currentPrice: newPrice,
            change24h: priceChangePercent,
            volume: quoteVolume,
            priceChange
          };
        }
        return item;
      });
    });
  }, []);

  const fetchCandleData = async (pair: string) => {
    try {
      setIsLoadingCandleData(true);
      setCandleDataError(null);
      setSelectedPair(pair);
      setProgress(0);
      const binanceSymbol = pair.replace('/', '').toUpperCase();
      const now = Date.now();
      const twoMonthsAgo = now - (60 * 24 * 60 * 60 * 1000);
      let allData: ICandleViewDataPoint[] = [];
      let currentStartTime = twoMonthsAgo;
      const batchLimit = 1000;
      const interval = '1m';
      let batchCount = 0;
      const estimatedBatches = Math.ceil((now - twoMonthsAgo) / (1000 * 60 * batchLimit));
      while (currentStartTime < now) {
        batchCount++;
        setProgress(Math.min(100, Math.round((batchCount / estimatedBatches) * 90)));
        const batchEndTime = Math.min(currentStartTime + (1000 * 60 * batchLimit), now);
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${batchLimit}&startTime=${currentStartTime}&endTime=${batchEndTime}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, symbol: ${binanceSymbol}`);
        }
        const klineData: BinanceKlineData[] = await response.json();
        const formattedData: ICandleViewDataPoint[] = klineData.map(kline => ({
          time: Math.floor(kline[0] / 1000), // 转换为秒
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5]),
          isVirtual: false
        }));
        allData = [...allData, ...formattedData];
        if (klineData.length < batchLimit) {
          break;
        }
        currentStartTime = klineData[klineData.length - 1][0] + 1;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      allData.sort((a, b) => a.time - b.time);
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 100));
      setCandleData(allData);
    } catch (err) {
      setCandleDataError(err instanceof Error ? err.message : 'Failed to fetch candle data');
      const simulatedData = await generateSimulatedCandleData(pair);
      setCandleData(simulatedData);
      setProgress(100);
    } finally {
      setTimeout(() => {
        setIsLoadingCandleData(false);
        setProgress(0);
      }, 300);
    }
  };

  const generateSimulatedCandleData = async (pair: string): Promise<ICandleViewDataPoint[]> => {
    return new Promise((resolve) => {
      const totalMinutes = 60 * 24 * 60;
      const batchSize = 1000;
      const batches = Math.ceil(totalMinutes / batchSize);
      let allData: ICandleViewDataPoint[] = [];
      const generateBatch = (batchIndex: number) => {
        const startMinute = batchIndex * batchSize;
        const endMinute = Math.min(startMinute + batchSize, totalMinutes);
        const currentProgress = Math.min(100, Math.round((batchIndex / batches) * 90));
        setProgress(currentProgress);
        const basePrice = pair.includes('BTC') ? 60000 :
          pair.includes('ETH') ? 3000 :
            pair.includes('BNB') ? 500 :
              Math.random() * 100 + 10;
        let lastClose = basePrice;
        const now = Date.now();
        const batchData: ICandleViewDataPoint[] = [];
        for (let i = startMinute; i < endMinute; i++) {
          const time = now - (totalMinutes - i) * 60000;
          const open = lastClose;
          const change = (Math.random() - 0.5) * 0.02;
          const close = open * (1 + change);
          const high = Math.max(open, close) * (1 + Math.random() * 0.01);
          const low = Math.min(open, close) * (1 - Math.random() * 0.01);
          const volume = Math.random() * 1000 + 100;
          batchData.push({
            time: Math.floor(time / 1000),
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: Math.floor(volume),
            isVirtual: false
          });
          lastClose = close;
        }
        allData = [...allData, ...batchData];
        if (batchIndex < batches - 1) {
          setTimeout(() => generateBatch(batchIndex + 1), 10);
        } else {
          setProgress(100);
          setTimeout(() => {
            resolve(allData);
          }, 100);
        }
      };
      setTimeout(() => generateBatch(0), 10);
    });
  };

  const handleCryptoClick = async (pair: string) => {
    await fetchCandleData(pair);
  };

  useEffect(() => {
    initializeWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initializeWebSocket]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      let sorted = [...cryptoList];
      if (sortBy === 'volume') {
        sorted.sort((a, b) => b.volume - a.volume);
      } else {
        sorted.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
      }
      setFilteredCryptoList(sorted);
      setDisplayedCryptoList(sorted.slice(0, displayCount));
      setHasMore(sorted.length > displayCount);
    } else {
      const filtered = cryptoList.filter(item =>
        item.pair.toLowerCase().includes(searchTerm.toLowerCase())
      );
      let sorted = filtered;
      if (sortBy === 'volume') {
        sorted.sort((a, b) => b.volume - a.volume);
      } else {
        sorted.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
      }
      setFilteredCryptoList(sorted);
      setDisplayedCryptoList(sorted.slice(0, displayCount));
      setHasMore(sorted.length > displayCount);
    }
  }, [searchTerm, sortBy, cryptoList, displayCount]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      const newDisplayCount = displayCount + 50;
      setDisplayCount(newDisplayCount);
      setDisplayedCryptoList(filteredCryptoList.slice(0, newDisplayCount));
      setHasMore(filteredCryptoList.length > newDisplayCount);
      setIsLoadingMore(false);
    }, 300);
  }, [displayCount, filteredCryptoList, hasMore, isLoadingMore]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setDisplayCount(50);
    fetchInitialData();
  };

  const handleSortChange = (newSortBy: 'volume' | 'change') => {
    setSortBy(newSortBy);
    setDisplayCount(50);
  };

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

  const getDisplayData = () => {
    return candleData;
  };

  const [markData, setMarkData] = useState<MarkDataItem[]>([]);

  const cryptoControls = (
    <div className={`sticky top-0 z-10 p-3 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSortChange('volume')}
            className={`px-2 py-1 text-xs rounded ${sortBy === 'volume'
              ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {locale === 'cn' ? '按交易量' : 'By Volume'}
          </button>
          <button
            onClick={() => handleSortChange('change')}
            className={`px-2 py-1 text-xs rounded ${sortBy === 'change'
              ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {locale === 'cn' ? '按波动' : 'By Change'}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`text-xs ${wsConnected ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
            {wsConnected ? '●' : '○'}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-2 py-1 text-xs rounded ${isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
              }`}
          >
            {isRefreshing ? '🔄' : '↻'}
          </button>
        </div>
      </div>
      <input
        type="text"
        placeholder={locale === 'cn' ? '搜索交易对...' : 'Search trading pairs...'}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`w-full px-3 py-2 text-sm rounded ${isDark
          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
          : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
          } border focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-400'}`}
      />
      {isLoading && !isRefreshing && (
        <div className="mt-2 text-xs text-center text-gray-500">
          {locale === 'cn' ? '加载中...' : 'Loading...'}
        </div>
      )}
      {isRefreshing && (
        <div className="mt-2 text-xs text-center text-gray-500">
          {locale === 'cn' ? '刷新中...' : 'Refreshing...'}
        </div>
      )}
      {error && (
        <div className={`mt-2 text-xs text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </div>
      )}
    </div>
  );

  const loadMoreButton = hasMore && (
    <div className={`sticky bottom-0 p-3 border-t ${isDark
      ? 'bg-gray-800 border-gray-700'
      : 'bg-gray-50 border-gray-300'
      }`}>
      <button
        onClick={loadMore}
        disabled={isLoadingMore}
        className={`w-full py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isDark
          ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800'
          : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-400'
          }`}
      >
        {isLoadingMore ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {locale === 'cn' ? '加载中...' : 'Loading...'}
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
            {locale === 'cn' ? `显示更多 (${displayedCryptoList.length}/${filteredCryptoList.length})` : `Load More (${displayedCryptoList.length}/${filteredCryptoList.length})`}
          </span>
        )}
      </button>
    </div>
  );

  const getCandleViewTitle = () => {
    if (selectedPair) {
      return `${selectedPair} - ${locale === 'cn' ? '实时数据' : 'Real Time Data'}`;
    }
    if (realtimeData.length > 0) {
      return locale === 'en' ? 'Real Time Data' : '实时数据';
    }
    return locale === 'en' ? 'Test Data' : '测试数据';
  };

  const menuItems = [
    {
      id: 1,
      title: locale === 'cn' ? '加密货币' : 'Cryptos',
      content: (
        <>
          {cryptoControls}
          <Cryptos
            isDark={isDark}
            locale={locale}
            cryptoList={displayedCryptoList}
            onCryptoClick={handleCryptoClick}
          />
          {loadMoreButton}
          {filteredCryptoList.length > 0 && !hasMore && (
            <div className={`sticky bottom-0 p-2 text-xs text-center border-t ${isDark
              ? 'bg-gray-800 border-gray-700 text-gray-400'
              : 'bg-gray-50 border-gray-300 text-gray-600'
              }`}>
              {locale === 'cn'
                ? `已显示全部 ${filteredCryptoList.length} 个交易对 (WebSocket: ${wsConnected ? '已连接' : '未连接'})`
                : `Showing all ${filteredCryptoList.length} pairs (WS: ${wsConnected ? 'connected' : 'disconnected'})`
              }
            </div>
          )}
        </>
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
          <div className="h-full flex flex-col">
            {isLoadingCandleData && (
              <div className={`absolute inset-0 z-50 flex items-center justify-center ${isDark ? 'bg-gray-900/90' : 'bg-white/90'}`}>
                <div className={`p-6 rounded-xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 mb-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {locale === 'cn' ? `正在加载 ${selectedPair} 数据...` : `Loading ${selectedPair} data...`}
                    </span>
                    <span className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {locale === 'cn' ? '获取2个月的分钟K线数据' : 'Fetching 2 months of minute K-line data'}
                    </span>
                    <div className={`w-64 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            {candleDataError && (
              <div className={`absolute top-4 right-4 z-50 p-3 rounded-lg ${isDark ? 'bg-red-900/90 text-red-200' : 'bg-red-100 text-red-800'}`}>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {candleDataError}
                </div>
              </div>
            )}
            <CandleView
              data={getDisplayData()}
              title={getCandleViewTitle()}
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
                        <div className="transition-all duration-300 ease-in-out">
                          {item.content}
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
