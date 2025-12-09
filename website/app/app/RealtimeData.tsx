import React, { useState, useEffect } from 'react';
import { ICandleViewDataPoint } from 'candleview';

interface RealtimeDataPanelProps {
  isDark: boolean;
  locale: string;
  onDataGenerated: (data: ICandleViewDataPoint[]) => void;
}

interface RealtimeParams {
  interval: number;
  volatility: number;
  basePrice: number;
  trendDirection: 'up' | 'down' | 'sideways' | 'random';
  volumeMultiplier: number;
  anomalyProbability: number;
  maxDataPoints: number;
  isRunning: boolean;
}

const RealtimeDataPanel: React.FC<RealtimeDataPanelProps> = ({
  isDark,
  locale,
  onDataGenerated,
}) => {
  const [params, setParams] = useState<RealtimeParams>({
    interval: 1000,
    volatility: 5,
    basePrice: 150,
    trendDirection: 'random',
    volumeMultiplier: 1,
    anomalyProbability: 2,
    maxDataPoints: 1000,
    isRunning: false,
  });

  const [generatedData, setGeneratedData] = useState<ICandleViewDataPoint[]>([]);
  const [dataCount, setDataCount] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<number>(0);

  const handleParamChange = (key: keyof RealtimeParams, value: any) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generateInitialData = (count: number = 200) => {
    const {
      volatility,
      basePrice,
      trendDirection,
      volumeMultiplier,
      anomalyProbability
    } = params;
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
      default: // random
        trendBias = (Math.random() - 0.5) * 0.2;
    }
    const volatilityFactor = volatility / 10;
    const data: ICandleViewDataPoint[] = [];
    const startTime = Math.floor(Date.now() / 1000) - (count - 1);
    let lastClose = basePrice;
    for (let i = 0; i < count; i++) {
      const timestamp = startTime + i;
      const random = (Math.random() - 0.5) * 2;
      const cycle = Math.sin(i / 10) * 0.1;
      const priceChange = (random + trendBias + cycle) * volatilityFactor;
      const open = i === 0 ? basePrice : lastClose;
      let close = open * (1 + priceChange / 100);
      const range = Math.abs(close - open) * (1 + volatilityFactor);
      let high = Math.max(open, close) + range * Math.random() * 0.5;
      let low = Math.min(open, close) - range * Math.random() * 0.5;
      if (Math.random() < (anomalyProbability / 100)) {
        if (Math.random() > 0.5) {
          high = high * (1 + Math.random() * 0.15);
        } else {
          low = low * (1 - Math.random() * 0.15);
        }
      }
      const priceMove = Math.abs(close - open) / open;
      const baseVolume = 1000 + Math.random() * 9000;
      const volume = Math.floor(baseVolume * volumeMultiplier * (1 + priceMove));
      data.push({
        time: timestamp,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: volume,
        isVirtual: false
      });
      lastClose = close;
    }
    if (data.length > 0) {
      setLastTimestamp(data[data.length - 1].time);
    }
    return data;
  };

  const generateNextDataPoint = (lastData: ICandleViewDataPoint): ICandleViewDataPoint => {
    const {
      volatility,
      trendDirection,
      volumeMultiplier,
      anomalyProbability
    } = params;
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
      default: // random
        trendBias = (Math.random() - 0.5) * 0.2;
    }
    const newTime = lastData.time + 1;
    const volatilityFactor = volatility / 10;
    const random = (Math.random() - 0.5) * 2;
    const cycle = Math.sin(dataCount / 10) * 0.1;
    const priceChange = (random + trendBias + cycle) * volatilityFactor;
    const open = lastData.close;
    let close = open * (1 + priceChange / 100);
    const range = Math.abs(close - open) * (1 + volatilityFactor);
    let high = Math.max(open, close) + range * Math.random() * 0.5;
    let low = Math.min(open, close) - range * Math.random() * 0.5;
    if (Math.random() < (anomalyProbability / 100)) {
      if (Math.random() > 0.5) {
        high = high * (1 + Math.random() * 0.15);
      } else {
        low = low * (1 - Math.random() * 0.15);
      }
    }
    const priceMove = Math.abs(close - open) / open;
    const baseVolume = 1000 + Math.random() * 9000;
    const volume = Math.floor(baseVolume * volumeMultiplier * (1 + priceMove));
    return {
      time: newTime,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume,
      isVirtual: false
    };
  };

  const toggleRealtime = () => {
    if (params.isRunning) {
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
      setParams(prev => ({ ...prev, isRunning: false }));
    } else {
      if (generatedData.length === 0) {
        const initialData = generateInitialData(200);
        setGeneratedData(initialData);
        setDataCount(initialData.length);
        setLastTimestamp(initialData[initialData.length - 1].time);
        onDataGenerated(initialData);
      }
      const id = setInterval(() => {
        setGeneratedData(prevData => {
          if (prevData.length === 0) return prevData;
          const lastData = prevData[prevData.length - 1];
          const newPoint = generateNextDataPoint(lastData);
          let newData = [...prevData, newPoint];
          if (newData.length > params.maxDataPoints) {
            newData = newData.slice(newData.length - params.maxDataPoints);
          }
          setDataCount(newData.length);
          setLastTimestamp(newPoint.time);
          onDataGenerated(newData);
          return newData;
        });
      }, params.interval);
      setTimerId(id);
      setParams(prev => ({ ...prev, isRunning: true }));
    }
  };

  const regenerateInitialData = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    const initialData = generateInitialData(200);
    setGeneratedData(initialData);
    setDataCount(initialData.length);
    setLastTimestamp(initialData[initialData.length - 1].time);
    setParams(prev => ({ ...prev, isRunning: false }));
    onDataGenerated(initialData);
  };

  const clearData = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    setGeneratedData([]);
    setDataCount(0);
    setLastTimestamp(0);
    setParams(prev => ({ ...prev, isRunning: false }));
    onDataGenerated([]);
  };

  const addNextDataPoint = () => {
    if (generatedData.length === 0) {
      const initialData = generateInitialData(200);
      setGeneratedData(initialData);
      setDataCount(initialData.length);
      setLastTimestamp(initialData[initialData.length - 1].time);
      onDataGenerated(initialData);
    } else {
      const lastData = generatedData[generatedData.length - 1];
      const newPoint = generateNextDataPoint(lastData);
      const newData = [...generatedData, newPoint];
      const finalData = newData.length > params.maxDataPoints
        ? newData.slice(newData.length - params.maxDataPoints)
        : newData;
      setGeneratedData(finalData);
      setDataCount(finalData.length);
      setLastTimestamp(newPoint.time);
      onDataGenerated(finalData);
    }
  };

  useEffect(() => {
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timerId]);

  return (
    <div className="h-full p-3 space-y-4 overflow-y-auto">
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '实时数据控制' : 'Realtime Data Control'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={toggleRealtime}
            className={`py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${params.isRunning
                ? isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                : isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
              } text-white`}
          >
            {params.isRunning
              ? (locale === 'cn' ? '停止' : 'Stop')
              : (locale === 'cn' ? '开始实时' : 'Start Realtime')
            }
          </button>
          <button
            onClick={clearData}
            className={`py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
          >
            {locale === 'cn' ? '清除所有' : 'Clear All'}
          </button>
          <button
            onClick={regenerateInitialData}
            className={`py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            {locale === 'cn' ? '重新生成200秒' : 'Regen 200s'}
          </button>
          <button
            onClick={addNextDataPoint}
            className={`py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isDark
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
          >
            {locale === 'cn' ? '添加下一秒' : 'Add Next Second'}
          </button>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {locale === 'cn' ? '状态' : 'Status'}:
            </span>
            <span className={`ml-2 text-sm font-medium ${params.isRunning ? 'text-green-500' : 'text-red-500'}`}>
              {params.isRunning
                ? (locale === 'cn' ? '运行中' : 'Running')
                : (locale === 'cn' ? '已停止' : 'Stopped')
              }
            </span>
          </div>
          <div>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {locale === 'cn' ? '最后时间' : 'Last Time'}:
            </span>
            <span className={`ml-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {lastTimestamp > 0 ? new Date(lastTimestamp * 1000).toLocaleTimeString() : '-'}
            </span>
          </div>
        </div>
        <div className="mt-3 text-center">
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {dataCount}
          </span>
          <span className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {locale === 'cn' ? '个秒级数据点' : 'second-level data points'}
          </span>
        </div>
        <div className="mt-2 text-center">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {locale === 'cn' ? '时间连续性：每秒递增' : 'Time continuity: +1 second each'}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '生成间隔 (ms)' : 'Interval (ms)'}: {params.interval}
        </label>
        <input
          type="range"
          min="100"
          max="5000"
          step="100"
          value={params.interval}
          onChange={(e) => handleParamChange('interval', parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: isDark
              ? 'linear-gradient(to right, #4a5568, #8b5cf6)'
              : 'linear-gradient(to right, #cbd5e0, #8b5cf6)'
          }}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>100ms</span>
          <span>5s</span>
        </div>
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '波动性' : 'Volatility'}: {params.volatility}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={params.volatility}
          onChange={(e) => handleParamChange('volatility', parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: isDark
              ? 'linear-gradient(to right, #4a5568, #10b981)'
              : 'linear-gradient(to right, #cbd5e0, #10b981)'
          }}
        />
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '趋势方向' : 'Trend Direction'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['up', 'down', 'sideways', 'random'] as const).map((direction) => (
            <button
              key={direction}
              onClick={() => handleParamChange('trendDirection', direction)}
              className={`px-2 py-1 text-sm rounded transition-colors ${params.trendDirection === direction
                  ? isDark ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {locale === 'cn'
                ? { up: '上涨', down: '下跌', sideways: '震荡', random: '随机' }[direction]
                : direction.charAt(0).toUpperCase() + direction.slice(1)
              }
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '基础价格' : 'Base Price'}
        </label>
        <input
          type="number"
          value={params.basePrice}
          onChange={(e) => handleParamChange('basePrice', parseFloat(e.target.value))}
          step="0.01"
          className={`w-full px-2 py-1 text-sm rounded border ${isDark
              ? 'bg-gray-700 border-gray-600 text-gray-200'
              : 'bg-white border-gray-300 text-gray-800'
            }`}
        />
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '成交量乘数' : 'Volume Multiplier'}: {params.volumeMultiplier.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={params.volumeMultiplier}
          onChange={(e) => handleParamChange('volumeMultiplier', parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: isDark
              ? 'linear-gradient(to right, #4a5568, #f59e0b)'
              : 'linear-gradient(to right, #cbd5e0, #f59e0b)'
          }}
        />
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '异常值概率 (%)' : 'Anomaly Probability (%)'}: {params.anomalyProbability}
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={params.anomalyProbability}
          onChange={(e) => handleParamChange('anomalyProbability', parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: isDark
              ? 'linear-gradient(to right, #4a5568, #ef4444)'
              : 'linear-gradient(to right, #cbd5e0, #ef4444)'
          }}
        />
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '最大数据点数' : 'Max Data Points'}: {params.maxDataPoints}
        </label>
        <input
          type="range"
          min="100"
          max="5000"
          step="100"
          value={params.maxDataPoints}
          onChange={(e) => handleParamChange('maxDataPoints', parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: isDark
              ? 'linear-gradient(to right, #4a5568, #3b82f6)'
              : 'linear-gradient(to right, #cbd5e0, #3b82f6)'
          }}
        />
      </div>
      {generatedData.length > 0 && (
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="flex justify-between items-center mb-2">
            <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {locale === 'cn' ? '数据详情' : 'Data Details'}
            </h4>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {locale === 'cn' ? '时间递增：每秒' : 'Time increment: +1s each'}
            </span>
          </div>
          <div className="text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>起始时间:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                    {new Date(generatedData[0].time * 1000).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>结束时间:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                    {new Date(generatedData[generatedData.length - 1].time * 1000).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>持续时间:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                    {generatedData.length} 秒
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>数据间隔:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                    1 秒
                  </span>
                </div>
              </div>
            </div>
            <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-300'} pt-2`}>
              <h5 className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {locale === 'cn' ? '最新数据点' : 'Latest Data Point'}
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>O:</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                      {generatedData[generatedData.length - 1].open.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>H:</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                      {generatedData[generatedData.length - 1].high.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>L:</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                      {generatedData[generatedData.length - 1].low.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>C:</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                      {generatedData[generatedData.length - 1].close.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>V:</span>
                <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                  {generatedData[generatedData.length - 1].volume.toLocaleString()}
                </span>
              </div>
            </div>
            {generatedData.length >= 2 && (
              <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-300'} pt-2`}>
                <h5 className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {locale === 'cn' ? '时间连续性验证' : 'Time Continuity Check'}
                </h5>
                <div className="flex justify-between text-xs">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>最后两个时间差:</span>
                  <span className={
                    generatedData[generatedData.length - 1].time - generatedData[generatedData.length - 2].time === 1
                      ? 'text-green-500'
                      : 'text-red-500'
                  }>
                    {generatedData[generatedData.length - 1].time - generatedData[generatedData.length - 2].time} 秒
                    {generatedData[generatedData.length - 1].time - generatedData[generatedData.length - 2].time === 1
                      ? ' ✓'
                      : ' ✗'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeDataPanel;
