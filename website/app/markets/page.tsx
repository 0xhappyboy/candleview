'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { TEST_CANDLEVIEW_DATA8 } from '../mock/mock_data_1';
import { useI18n } from '../providers/I18nProvider';
import CandleView, { ICandleViewDataPoint } from 'candleview';
import Cryptos from './Cryptos';
import Stocks from './Stocks';

interface YahooFinanceChartResult {
  meta: {
    currency: string;
    symbol: string;
    exchangeName: string;
    fullExchangeName: string;
    instrumentType: string;
    regularMarketPrice: number;
    regularMarketChange?: number;
    regularMarketChangePercent?: number;
    regularMarketTime: number;
    regularMarketVolume: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketPreviousClose?: number;
    chartPreviousClose?: number;
    longName?: string;
    shortName?: string;
    priceHint: number;
    dataGranularity: string;
    range: string;
  };
  timestamp: number[];
  indicators: {
    quote: Array<{
      open: (number | null)[];
      high: (number | null)[];
      low: (number | null)[];
      close: (number | null)[];
      volume: (number | null)[];
    }>;
  };
}

interface YahooFinanceResponse {
  chart: {
    result: YahooFinanceChartResult[];
    error: any;
  };
}

interface StockItem {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  changeAmount: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  sector?: string;
  exchange?: string;
  lastUpdated?: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  ohlcvData?: {
    timestamp: number[];
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
  };
}
interface StockItem {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  changeAmount: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  sector?: string;
  exchange?: string;
  lastUpdated?: number;
}

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

const BINANCE_INTERVAL_MAP: Record<string, string> = {
  '1s': '1s',
  '5s': '5s',
  '15s': '15s',
  '30s': '30s',
  '1m': '1m',
  '3m': '3m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '45m': '45m',
  '1H': '1h',
  '2H': '2h',
  '3H': '3h',
  '4H': '4h',
  '6H': '6h',
  '8H': '8h',
  '12H': '12h',
  '1D': '1d',
  '3D': '3d',
  '1W': '1w',
  '2W': '2w',
  '1M': '1M',
  '3M': '3M',
  '6M': '6M'
};

const TIMEFRAME_CONFIGS: Record<string, {
  totalCandles: number,
  limit: number,
  description: (locale: string) => string
}> = {
  '1s': {
    totalCandles: 5000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '1秒 - 5,000条' : '1s - 5,000 candles'
  },
  '5s': {
    totalCandles: 5000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '5秒 - 5,000条' : '5s - 5,000 candles'
  },
  '15s': {
    totalCandles: 5000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '15秒 - 5,000条' : '15s - 5,000 candles'
  },
  '30s': {
    totalCandles: 5000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '30秒 - 5,000条' : '30s - 5,000 candles'
  },
  '1m': {
    totalCandles: 5000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '1分钟 - 5,000条' : '1m - 5,000 candles'
  },
  '3m': {
    totalCandles: 5000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '3分钟 - 5,000条' : '3m - 5,000 candles'
  },
  '5m': {
    totalCandles: 5000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '5分钟 - 5,000条' : '5m - 5,000 candles'
  },
  '15m': {
    totalCandles: 5000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '15分钟 - 5,000条' : '15m - 5,000 candles'
  },
  '30m': {
    totalCandles: 5000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '30分钟 - 5,000条' : '30m - 5,000 candles'
  },
  '45m': {
    totalCandles: 5000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '45分钟 - 5,000条' : '45m - 5,000 candles'
  },
  '1H': {
    totalCandles: 4000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '1小时 - 4,000条' : '1H - 4,000 candles'
  },
  '2H': {
    totalCandles: 3000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '2小时 - 3,000条' : '2H - 3,000 candles'
  },
  '3H': {
    totalCandles: 2000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '3小时 - 2,000条' : '3H - 2,000 candles'
  },
  '4H': {
    totalCandles: 2000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '4小时 - 2,000条' : '4H - 2,000 candles'
  },
  '6H': {
    totalCandles: 2000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '6小时 - 2,000条' : '6H - 2,000 candles'
  },
  '8H': {
    totalCandles: 2000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '8小时 - 2,000条' : '8H - 2,000 candles'
  },
  '12H': {
    totalCandles: 2000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '12小时 - 2,000条' : '12H - 2,000 candles'
  },
  '1D': {
    totalCandles: 1000,
    limit: 1000,
    description: (locale: string) => locale === 'cn' ? '1日 - 1,000条 (约2.7年)' : '1D - 1,000 candles (~2.7 years)'
  },
  '3D': {
    totalCandles: 800,
    limit: 500,
    description: (locale: string) => locale === 'cn' ? '3日 - 800条 (约6.6年)' : '3D - 800 candles (~6.6 years)'
  },
  '1W': {
    totalCandles: 500,
    limit: 500,
    description: (locale: string) => locale === 'cn' ? '1周 - 500条 (约9.6年)' : '1W - 500 candles (~9.6 years)'
  },
  '2W': {
    totalCandles: 400,
    limit: 400,
    description: (locale: string) => locale === 'cn' ? '2周 - 400条 (约15.4年)' : '2W - 400 candles (~15.4 years)'
  },
  '1M': {
    totalCandles: 300,
    limit: 300,
    description: (locale: string) => locale === 'cn' ? '1月 - 300条 (约25年)' : '1M - 300 candles (~25 years)'
  },
  '3M': {
    totalCandles: 200,
    limit: 200,
    description: (locale: string) => locale === 'cn' ? '3月 - 200条 (约50年)' : '3M - 200 candles (~50 years)'
  },
  '6M': {
    totalCandles: 100,
    limit: 100,
    description: (locale: string) => locale === 'cn' ? '6月 - 100条 (约50年)' : '6M - 100 candles (~50 years)'
  }
};

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
  const [currentTimeframe, setCurrentTimeframe] = useState<string>('1m');
  // stocks
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [filteredStockList, setFilteredStockList] = useState<StockItem[]>([]);
  const [displayedStockList, setDisplayedStockList] = useState<StockItem[]>([]);
  const [stockSearchTerm, setStockSearchTerm] = useState('');
  const [stockSortBy, setStockSortBy] = useState<'volume' | 'change' | 'marketCap'>('volume');
  const [stockDisplayCount, setStockDisplayCount] = useState(50);
  const [stockHasMore, setStockHasMore] = useState(true);
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [isRefreshingStocks, setIsRefreshingStocks] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [currentStockApiIndex, setCurrentStockApiIndex] = useState(0);
  const [popularStocks, setPopularStocks] = useState<string[]>([
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'BRK-B', 'JPM', 'V',
    'JNJ', 'WMT', 'UNH', 'PG', 'MA', 'HD', 'CVX', 'BAC', 'XOM', 'PFE'
  ]);
  const [candleViewTimeframe, setCandleViewTimeframe] = useState<string>('15m');

  const STOCK_APIS = [
    {
      name: 'yfinance',
      baseUrl: 'https://query1.finance.yahoo.com',
      endpoints: {
        chart: '/v8/finance/chart',
        quoteSummary: '/v10/finance/quoteSummary'
      }
    }
  ];

  const fetchStockData = async () => {
    try {
      setIsLoadingStocks(true);
      setIsRefreshingStocks(true);
      setStockError(null);
      const successfulStocks: StockItem[] = [];
      const maxStocks = 10;
      for (let i = 0; i < Math.min(popularStocks.length, maxStocks); i++) {
        const symbol = popularStocks[i];
        try {
          const stockData = await fetchStockFromYahoo(symbol);
          if (stockData) {
            successfulStocks.push(stockData);
          }
          if (i < Math.min(popularStocks.length, maxStocks) - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (err) {
        }
      }
      if (successfulStocks.length === 0) {
        const fallbackStocks = createFallbackStockData();
        updateStockState(fallbackStocks);
      } else {
        updateStockState(successfulStocks);
      }
    } catch (err) {
      setStockError('Failed to retrieve stock data, please try again later.');
      const fallbackStocks = createFallbackStockData();
      updateStockState(fallbackStocks);

    } finally {
      setIsLoadingStocks(false);
      setIsRefreshingStocks(false);
    }
  };

  const updateStockState = (stocks: StockItem[]) => {
    setStockList(stocks);
    let sorted = [...stocks];
    if (stockSortBy === 'volume') {
      sorted.sort((a, b) => b.volume - a.volume);
    } else if (stockSortBy === 'change') {
      sorted.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    } else {
      sorted.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    }
    setFilteredStockList(sorted);
    setDisplayedStockList(sorted.slice(0, stockDisplayCount));
    setStockHasMore(sorted.length > stockDisplayCount);
  };

  // Yahoo Finance API
  const fetchStockFromYahoo = async (symbol: string): Promise<StockItem | null> => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1m`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: YahooFinanceResponse = await response.json();
      if (data.chart.error || !data.chart.result || data.chart.result.length === 0) {
        return null;
      }
      const result = data.chart.result[0];
      const meta = result.meta;
      const indicators = result.indicators;
      const quote = indicators.quote[0];
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.regularMarketPreviousClose || meta.chartPreviousClose || currentPrice * 0.99;
      const changeAmount = currentPrice - previousClose;
      const changePercent = (changeAmount / previousClose) * 100;
      const closeValues = quote.close.filter(v => v !== null) as number[];
      const openValues = quote.open.filter(v => v !== null) as number[];
      const highValues = quote.high.filter(v => v !== null) as number[];
      const lowValues = quote.low.filter(v => v !== null) as number[];
      const volumeValues = quote.volume.filter(v => v !== null) as number[];
      const ohlcvData = {
        timestamp: result.timestamp.slice(0, closeValues.length),
        open: openValues,
        high: highValues,
        low: lowValues,
        close: closeValues,
        volume: volumeValues
      };
      return {
        symbol: meta.symbol,
        name: meta.longName || meta.shortName || symbol,
        currentPrice,
        changePercent,
        changeAmount,
        volume: meta.regularMarketVolume,
        marketCap: undefined,
        sector: undefined,
        exchange: meta.fullExchangeName,
        lastUpdated: meta.regularMarketTime * 1000,
        open: openValues[openValues.length - 1],
        high: meta.regularMarketDayHigh,
        low: meta.regularMarketDayLow,
        previousClose,
        ohlcvData: ohlcvData.close.length > 0 ? ohlcvData : undefined
      };
    } catch (err) {
      return null;
    }
  };

  const createFallbackStockData = (): StockItem[] => {
    const stockTemplates = [
      { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 185, sector: 'Technology' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 415, sector: 'Technology' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 153, sector: 'Technology' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 178, sector: 'Consumer' },
      { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 245, sector: 'Automotive' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 950, sector: 'Technology' },
      { symbol: 'META', name: 'Meta Platforms', basePrice: 485, sector: 'Technology' },
      { symbol: 'JPM', name: 'JPMorgan Chase', basePrice: 189, sector: 'Financial' },
      { symbol: 'V', name: 'Visa Inc.', basePrice: 279, sector: 'Financial' },
      { symbol: 'JNJ', name: 'Johnson & Johnson', basePrice: 161, sector: 'Healthcare' }
    ];
    return stockTemplates.map(stock => {
      const changePercent = (Math.random() - 0.5) * 5; // -2.5% 到 +2.5%
      const currentPrice = stock.basePrice * (1 + changePercent / 100);
      const changeAmount = currentPrice - stock.basePrice;
      const volume = Math.random() * 1e7 + 1e6;
      const timestamps: number[] = [];
      const opens: number[] = [];
      const highs: number[] = [];
      const lows: number[] = [];
      const closes: number[] = [];
      const volumes: number[] = [];
      const now = Math.floor(Date.now() / 1000);
      for (let i = 0; i < 24; i++) {
        const timestamp = now - (24 - i) * 3600;
        const basePrice = stock.basePrice;
        const open = basePrice * (0.99 + Math.random() * 0.02);
        const close = basePrice * (0.99 + Math.random() * 0.02);
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (0.99 - Math.random() * 0.01);
        const vol = Math.random() * 1e6 + 5e5;
        timestamps.push(timestamp);
        opens.push(open);
        highs.push(high);
        lows.push(low);
        closes.push(close);
        volumes.push(vol);
      }
      return {
        symbol: stock.symbol,
        name: stock.name,
        currentPrice,
        changePercent,
        changeAmount,
        volume,
        marketCap: stock.basePrice * (Math.random() * 5e6 + 1e6),
        sector: stock.sector,
        exchange: 'NASDAQ',
        lastUpdated: Date.now(),
        previousClose: stock.basePrice,
        ohlcvData: {
          timestamp: timestamps,
          open: opens,
          high: highs,
          low: lows,
          close: closes,
          volume: volumes
        }
      };
    });
  };

  const handleStockClick = async (symbol: string) => {
    try {
      setIsLoadingCandleData(true);
      setCandleDataError(null);
      setSelectedPair(symbol);
      setCandleViewTimeframe('15m');
      setCurrentTimeframe('15m');
      setProgress(0);
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=15m`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const data: YahooFinanceResponse = await response.json();
      if (data.chart.error || !data.chart.result || data.chart.result.length === 0) {
        throw new Error(`error: ${symbol}`);
      }
      const result = data.chart.result[0];
      const quote = result.indicators.quote[0];
      const timestamps = result.timestamp;
      const candleData: ICandleViewDataPoint[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quote.open[i] !== null &&
          quote.high[i] !== null &&
          quote.low[i] !== null &&
          quote.close[i] !== null &&
          quote.volume[i] !== null) {
          candleData.push({
            time: timestamps[i],
            open: quote.open[i] as number,
            high: quote.high[i] as number,
            low: quote.low[i] as number,
            close: quote.close[i] as number,
            volume: quote.volume[i] as number,
            isVirtual: false
          });
        }
      }
      setCandleData(candleData);
      setProgress(100);
      if (locale === 'cn') {
        setCandleDataError(`${symbol} 数据加载成功`);
      } else {
        setCandleDataError(`${symbol} data loaded successfully`);
      }
      setTimeout(() => setCandleDataError(null), 3000);
    } catch (err) {
      setCandleDataError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setTimeout(() => {
        setIsLoadingCandleData(false);
        setProgress(0);
      }, 300);
    }
  };

  const handleStockSortChange = (newSortBy: 'volume' | 'change' | 'marketCap') => {
    setStockSortBy(newSortBy);
    setStockDisplayCount(50);
    let sorted = [...filteredStockList];
    if (newSortBy === 'volume') {
      sorted.sort((a, b) => b.volume - a.volume);
    } else if (newSortBy === 'change') {
      sorted.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    } else {
      sorted.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    }
    setFilteredStockList(sorted);
    setDisplayedStockList(sorted.slice(0, stockDisplayCount));
  };

  const loadMoreStocks = useCallback(() => {
    if (stockHasMore) {
      const newDisplayCount = stockDisplayCount + 30;
      setStockDisplayCount(newDisplayCount);
      setDisplayedStockList(filteredStockList.slice(0, newDisplayCount));
      setStockHasMore(filteredStockList.length > newDisplayCount);
    }
  }, [stockDisplayCount, filteredStockList, stockHasMore]);

  const handleRefreshStocks = () => {
    setIsRefreshingStocks(true);
    setStockDisplayCount(50);
    const nextApiIndex = (currentStockApiIndex + 1) % STOCK_APIS.length;
    setCurrentStockApiIndex(nextApiIndex);
    setTimeout(() => {
      fetchStockData();
    }, 100);
  };

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

  const fetchCandleDataByTimeframe = async (pair: string, timeframe: string) => {
    try {
      setIsLoadingCandleData(true);
      setCandleDataError(null);
      setSelectedPair(pair);
      setCandleViewTimeframe(timeframe);
      setCurrentTimeframe(timeframe);
      setProgress(0);
      const binanceSymbol = pair.replace('/', '').toUpperCase();
      const binanceInterval = BINANCE_INTERVAL_MAP[timeframe] || '1m';
      const { limit, totalCandles } = TIMEFRAME_CONFIGS[timeframe] || TIMEFRAME_CONFIGS['1m'];
      let allData: ICandleViewDataPoint[] = [];
      let endTime = Date.now();
      let startTime: number;
      const timeIntervalMs = getTimeIntervalInMs(timeframe);
      if (timeframe.includes('D') || timeframe.includes('W') || timeframe.includes('M')) {
        const daysToFetch = getDaysToFetch(timeframe);
        startTime = endTime - (daysToFetch * 24 * 60 * 60 * 1000);
      } else {
        startTime = endTime - (totalCandles * timeIntervalMs);
      }
      const batchSize = Math.min(limit, 1000);
      let currentEndTime = endTime;
      let fetchedCount = 0;
      const maxBatches = 10;
      for (let batch = 0; batch < maxBatches && fetchedCount < totalCandles && currentEndTime > startTime; batch++) {
        try {
          const batchStartTime = Math.max(startTime, currentEndTime - (batchSize * timeIntervalMs));
          const response = await fetch(
            `https://api.binance.com/api/v3/klines?` +
            `symbol=${binanceSymbol}&` +
            `interval=${binanceInterval}&` +
            `limit=${batchSize}&` +
            `startTime=${batchStartTime}&` +
            `endTime=${currentEndTime}`
          );
          if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
          }
          const klineData: BinanceKlineData[] = await response.json();
          if (klineData.length === 0) {
            break;
          }
          const formattedData: ICandleViewDataPoint[] = klineData.map(kline => ({
            time: Math.floor(kline[0] / 1000),
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4]),
            volume: parseFloat(kline[5]),
            isVirtual: false
          }));
          allData = [...formattedData, ...allData];
          fetchedCount += klineData.length;
          currentEndTime = klineData[0][0] - 1;
          const progressPercent = Math.min(100, Math.round((fetchedCount / totalCandles) * 100));
          setProgress(progressPercent);
          await new Promise(resolve => setTimeout(resolve, 50));

        } catch (batchError) {
          break;
        }
      }
      allData.sort((a, b) => a.time - b.time);
      if (allData.length === 0) {
        throw new Error(locale === 'cn'
          ? `未获取到 ${pair} 的 ${timeframe} 数据`
          : `No ${timeframe} data obtained for ${pair}`
        );
      }
      if (allData.length > totalCandles) {
        allData = allData.slice(-totalCandles);
      }
      setCandleData(allData);
      setProgress(100);

    } catch (err) {
      setCandleDataError(err instanceof Error ? err.message : locale === 'cn' ? '获取数据失败' : 'Failed to fetch data');
      if (timeframe !== '15m') {
        return fetchCandleDataByTimeframe(pair, '15m');
      }
    } finally {
      setTimeout(() => {
        setIsLoadingCandleData(false);
        setProgress(0);
      }, 300);
    }
  };

  const getCandleViewTitle = () => {
    if (selectedPair) {
      return `${selectedPair}`;
    }
  };

  const getDaysToFetch = (timeframe: string): number => {
    const unit = timeframe.slice(-1);
    const value = parseInt(timeframe.slice(0, -1)) || 1;
    switch (unit) {
      case 'D':
        return value * 1000;
      case 'W':
        return value * 1000 * 7;
      case 'M':
        return value * 1000 * 30;
      default:
        return 30;
    }
  };

  const getTimeIntervalInMs = (timeframe: string): number => {
    const unit = timeframe.slice(-1);
    const value = parseInt(timeframe.slice(0, -1)) || 1;
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'H': return value * 60 * 60 * 1000;
      case 'D': return value * 24 * 60 * 60 * 1000;
      case 'W': return value * 7 * 24 * 60 * 60 * 1000;
      case 'M': return value * 30 * 24 * 60 * 60 * 1000;
      default: return 60 * 1000;
    }
  };

  const handleCryptoClick = async (pair: string) => {
    setCandleViewTimeframe('15m');
    await fetchCandleDataByTimeframe(pair, '15m');
  };

  useEffect(() => {
    initializeWebSocket();
    fetchStockData();
    const stockInterval = setInterval(() => {
      if (!isLoadingStocks && !isRefreshingStocks) {
        fetchStockData();
      }
    }, 30000);
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      clearInterval(stockInterval);
    };
  }, [initializeWebSocket]);

  useEffect(() => {
    if (!stockSearchTerm.trim()) {
      let sorted = [...stockList];
      if (stockSortBy === 'volume') {
        sorted.sort((a, b) => b.volume - a.volume);
      } else if (stockSortBy === 'change') {
        sorted.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
      } else {
        sorted.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
      }
      setFilteredStockList(sorted);
      setDisplayedStockList(sorted.slice(0, stockDisplayCount));
      setStockHasMore(sorted.length > stockDisplayCount);
    } else {
      const filtered = stockList.filter(item =>
        item.symbol.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
        (item.sector && item.sector.toLowerCase().includes(stockSearchTerm.toLowerCase()))
      );
      let sorted = filtered;
      if (stockSortBy === 'volume') {
        sorted.sort((a, b) => b.volume - a.volume);
      } else if (stockSortBy === 'change') {
        sorted.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
      } else {
        sorted.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
      }
      setFilteredStockList(sorted);
      setDisplayedStockList(sorted.slice(0, stockDisplayCount));
      setStockHasMore(sorted.length > stockDisplayCount);
    }
  }, [stockSearchTerm, stockSortBy, stockList, stockDisplayCount]);

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

  const stockControls = (
    <div className={`sticky top-0 z-10 p-3 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleStockSortChange('volume')}
            disabled={isLoadingStocks}
            className={`px-2 py-1 text-xs rounded ${stockSortBy === 'volume'
              ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
              }`}
          >
            {locale === 'cn' ? '成交量' : 'Volume'}
          </button>
          <button
            onClick={() => handleStockSortChange('change')}
            disabled={isLoadingStocks}
            className={`px-2 py-1 text-xs rounded ${stockSortBy === 'change'
              ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
              }`}
          >
            {locale === 'cn' ? '涨跌幅' : 'Change'}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            Yahoo Finance
          </div>
          <button
            onClick={handleRefreshStocks}
            disabled={isLoadingStocks || isRefreshingStocks}
            className={`px-2 py-1 text-xs rounded ${isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
              }`}
          >
            {isRefreshingStocks ? '🔄' : '↻'}
          </button>
        </div>
      </div>

      <div className="mb-2">
        <input
          type="text"
          placeholder={locale === 'cn' ? '搜索股票代码或名称...' : 'Search stock symbol or name...'}
          value={stockSearchTerm}
          onChange={(e) => setStockSearchTerm(e.target.value)}
          disabled={isLoadingStocks}
          className={`w-full px-3 py-2 text-sm rounded ${isDark
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:opacity-50'
            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 disabled:opacity-50'
            } border focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-400'}`}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {isLoadingStocks ? (
            <span className="flex items-center">
              <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {locale === 'cn' ? '加载中...' : 'Loading...'}
            </span>
          ) : displayedStockList.length > 0 ? (
            <span>
              {locale === 'cn'
                ? `显示 ${displayedStockList.length} 只股票`
                : `Showing ${displayedStockList.length} stocks`
              }
            </span>
          ) : null}
        </div>
        {stockError && (
          <div className={`${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
            ⚠️ {stockError}
          </div>
        )}
      </div>
    </div>
  );

  const stockLoadMoreButton = stockHasMore && (
    <div className={`sticky bottom-0 p-3 border-t ${isDark
      ? 'bg-gray-800 border-gray-700'
      : 'bg-gray-50 border-gray-300'
      }`}>
      <button
        onClick={loadMoreStocks}
        disabled={isLoadingStocks || isRefreshingStocks}
        className={`w-full py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isDark
          ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-800'
          : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-green-400'
          }`}
      >
        {isLoadingStocks ? (
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
            {locale === 'cn' ? `加载更多股票 (${displayedStockList.length}/${filteredStockList.length})` : `Load More Stocks (${displayedStockList.length}/${filteredStockList.length})`}
          </span>
        )}
      </button>
    </div>
  );

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
    {
      id: 2,
      title: locale === 'cn' ? '美国股票' : 'US Stocks',
      content: (
        <>
          {stockControls}
          {isLoadingStocks && displayedStockList.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <svg className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {locale === 'cn' ? '正在加载股票数据...' : 'Loading stock data...'}
              </div>
            </div>
          ) : displayedStockList.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {locale === 'cn' ? '暂无股票数据' : 'No stock data available'}
              </div>
            </div>
          ) : (
            <>
              <Stocks
                isDark={isDark}
                locale={locale}
                stockList={displayedStockList}
                onStockClick={handleStockClick}
              />
              {stockLoadMoreButton}
            </>
          )}
          {filteredStockList.length > 0 && !stockHasMore && (
            <div className={`sticky bottom-0 p-2 text-xs text-center border-t ${isDark
              ? 'bg-gray-800 border-gray-700 text-gray-400'
              : 'bg-gray-50 border-gray-300 text-gray-600'
              }`}>
              {locale === 'cn'
                ? `已显示全部 ${filteredStockList.length} 只股票 (API: ${STOCK_APIS[currentStockApiIndex].name})`
                : `Showing all ${filteredStockList.length} stocks (API: ${STOCK_APIS[currentStockApiIndex].name})`
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
                      {TIMEFRAME_CONFIGS[currentTimeframe] ? TIMEFRAME_CONFIGS[currentTimeframe].description(locale) : `Timeframe: ${currentTimeframe}`}
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
              timeframe={candleViewTimeframe}
              toppanel={true}
              markData={markData}
              ai={true}
              isCloseInternalTimeFrameCalculation={true}
              timeframeCallbacks={{
                "1s": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "1s");
                  }
                },
                "5s": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "5s");
                  }
                },
                "15s": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "15s");
                  }
                },
                "30s": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "30s");
                  }
                },
                "1m": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "1m");
                  }
                },
                "3m": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "3m");
                  }
                },
                "5m": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "5m");
                  }
                },
                "15m": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "15m");
                  }
                },
                "30m": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "30m");
                  }
                },
                "45m": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "45m");
                  }
                },
                "1H": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "1H");
                  }
                },
                "2H": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "2H");
                  }
                },
                "3H": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "3H");
                  }
                },
                "4H": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "4H");
                  }
                },
                "6H": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "6H");
                  }
                },
                "8H": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "8H");
                  }
                },
                "12H": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "12H");
                  }
                },
                "1D": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "1D");
                  }
                },
                "3D": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "3D");
                  }
                },
                "1W": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "1W");
                  }
                },
                "2W": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "2W");
                  }
                },
                "1M": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "1M");
                  }
                },
                "3M": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "3M");
                  }
                },
                "6M": async () => {
                  if (selectedPair) {
                    await fetchCandleDataByTimeframe(selectedPair, "6M");
                  }
                }
              }}
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
