import { ICandleViewDataPoint } from 'candleview';
import React from 'react';

interface EmulatorProps {
  isDark: boolean;
  locale: string;
  generatorParams: GeneratorParams;
  generatedCandleData: ICandleViewDataPoint[];
  onParamChange: (key: keyof GeneratorParams, value: string | number) => void;
  onGenerate: () => void;
}

type GeneratorParams = {
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
};

const Emulator: React.FC<EmulatorProps> = ({
  isDark,
  locale,
  generatorParams,
  generatedCandleData,
  onParamChange,
  onGenerate,
}) => {
  const handleParamChange = (key: keyof GeneratorParams, value: string | number) => {
    onParamChange(key, value);
  };

  const handleTrendChange = (direction: 'random' | 'up' | 'down' | 'sideways') => {
    onParamChange('trendDirection', direction);
  };

  return (
    <div className="h-full p-3 space-y-4 overflow-y-auto">
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '趋势方向' : 'Trend Direction'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['random', 'up', 'down', 'sideways'] as const).map((direction) => (
            <button
              key={direction}
              onClick={() => handleTrendChange(direction)}
              className={`px-2 py-1 text-sm rounded transition-colors ${generatorParams.trendDirection === direction
                ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {locale === 'cn'
                ? { random: '随机', up: '上涨', down: '下跌', sideways: '震荡' }[direction]
                : { random: 'Random', up: 'Up', down: 'Down', sideways: 'Sideways' }[direction]
              }
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '波动性' : 'Volatility'} ({generatorParams.volatility})
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={generatorParams.volatility}
          onChange={(e) => handleParamChange('volatility', parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: isDark
              ? 'linear-gradient(to right, #4a5568, #3182ce)'
              : 'linear-gradient(to right, #cbd5e0, #3182ce)'
          }}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{locale === 'cn' ? '低' : 'Low'}</span>
          <span>{locale === 'cn' ? '高' : 'High'}</span>
        </div>
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '跳空概率' : 'Gap Probability'} ({generatorParams.gapProbability}%)
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={generatorParams.gapProbability}
          onChange={(e) => handleParamChange('gapProbability', parseInt(e.target.value))}
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
          {locale === 'cn' ? '成交量相关性' : 'Volume Correlation'} ({generatorParams.volumeCorrelation})
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={generatorParams.volumeCorrelation}
          onChange={(e) => handleParamChange('volumeCorrelation', parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: isDark
              ? 'linear-gradient(to right, #4a5568, #f59e0b)'
              : 'linear-gradient(to right, #cbd5e0, #f59e0b)'
          }}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{locale === 'cn' ? '无相关' : 'No correlation'}</span>
          <span>{locale === 'cn' ? '强相关' : 'Strong correlation'}</span>
        </div>
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '异常值概率' : 'Anomaly Probability'} ({generatorParams.anomalyProbability}%)
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={generatorParams.anomalyProbability}
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
          {locale === 'cn' ? '时间区间' : 'Time Range'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="datetime-local"
            value={generatorParams.startTime}
            onChange={(e) => handleParamChange('startTime', e.target.value)}
            className={`px-2 py-1 text-sm rounded border ${isDark
              ? 'bg-gray-700 border-gray-600 text-gray-200'
              : 'bg-white border-gray-300 text-gray-800'}`}
          />
          <input
            type="datetime-local"
            value={generatorParams.endTime}
            onChange={(e) => handleParamChange('endTime', e.target.value)}
            className={`px-2 py-1 text-sm rounded border ${isDark
              ? 'bg-gray-700 border-gray-600 text-gray-200'
              : 'bg-white border-gray-300 text-gray-800'}`}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '价格范围' : 'Price Range'}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {locale === 'cn' ? '最低价' : 'Low Price'}
            </span>
            <input
              type="number"
              value={generatorParams.minPrice}
              onChange={(e) => handleParamChange('minPrice', parseFloat(e.target.value))}
              step="0.01"
              className={`w-full px-2 py-1 text-sm rounded border ${isDark
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-800'}`}
            />
          </div>
          <div className="space-y-1">
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {locale === 'cn' ? '最高价' : 'High Price'}
            </span>
            <input
              type="number"
              value={generatorParams.maxPrice}
              onChange={(e) => handleParamChange('maxPrice', parseFloat(e.target.value))}
              step="0.01"
              className={`w-full px-2 py-1 text-sm rounded border ${isDark
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-800'}`}
            />
          </div>
        </div>
      </div>
      <button
        onClick={onGenerate}
        className={`w-full py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isDark
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
      >
        {locale === 'cn' ? '生成并应用到CandleView' : 'Generate & Apply to CandleView'}
      </button>
      {generatedCandleData.length > 0 && (
        <div className={`text-xs p-2 rounded ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-green-50 text-green-800'}`}>
          {locale === 'cn'
            ? `已生成 ${generatedCandleData.length} 个秒级数据点`
            : `Generated ${generatedCandleData.length} second-level data points`
          }
        </div>
      )}
    </div>
  );
};

export default Emulator;
