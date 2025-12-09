import React, { useState } from 'react';
import { ICandleViewDataPoint } from 'candleview';

interface RemoteDataProps {
  isDark: boolean;
  locale: string;
  onDataLoaded: (data: ICandleViewDataPoint[]) => void;
}

const DEFAULT_API = '/api/mock?count=100';

const RemoteData: React.FC<RemoteDataProps> = ({
  isDark,
  locale,
  onDataLoaded,
}) => {
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_API);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const loadData = async () => {
    if (!apiUrl.trim()) {
      setMessage(locale === 'cn' ? '请输入API地址' : 'Please enter API URL');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const formattedData: ICandleViewDataPoint[] = Array.isArray(data)
        ? data.map((item: any) => ({
            time: item.time || Date.now() / 1000,
            open: parseFloat(item.open) || 0,
            high: parseFloat(item.high) || 0,
            low: parseFloat(item.low) || 0,
            close: parseFloat(item.close) || 0,
            volume: parseFloat(item.volume) || 0,
            isVirtual: false
          }))
        : [];
      if (formattedData.length === 0) {
        throw new Error('No data');
      }
      onDataLoaded(formattedData);
      setMessage(`${locale === 'cn' ? '成功加载' : 'Loaded'} ${formattedData.length} ${locale === 'cn' ? '条数据' : 'data points'}`);
    } catch (error: any) {
      setMessage(`${locale === 'cn' ? '加载失败' : 'Load failed'}: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full p-4 space-y-4">
      <div className="space-y-4">
        <div className={`p-3 rounded ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <div className={`text-sm font-medium mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            {locale === 'cn' ? '本地数据服务' : 'Local Data Service'}
          </div>
          <div className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {locale === 'cn'
              ? '使用内置模拟数据生成器'
              : 'Using built-in mock data generator'
            }
          </div>
        </div>
        <div className="space-y-2">
          <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {locale === 'cn' ? '数据API地址' : 'Data API URL'}
          </div>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className={`w-full px-3 py-2 text-sm rounded border ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setApiUrl('/api/mock?count=50')}
              className={`px-3 py-1 text-xs rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              {locale === 'cn' ? '50个点' : '50 points'}
            </button>
            <button
              onClick={() => setApiUrl('/api/mock?count=100&interval=1d')}
              className={`px-3 py-1 text-xs rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              {locale === 'cn' ? '日线' : 'Daily'}
            </button>
            <button
              onClick={() => setApiUrl('/api/mock')}
              className={`px-3 py-1 text-xs rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              {locale === 'cn' ? '默认' : 'Default'}
            </button>
          </div>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className={`w-full py-2 rounded ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          {isLoading
            ? (locale === 'cn' ? '加载中...' : 'Loading...')
            : (locale === 'cn' ? '加载数据' : 'Load Data')
          }
        </button>
      </div>
      {message && (
        <div className={`p-3 rounded ${
          message.includes('成功') || message.includes('Loaded')
            ? isDark ? 'bg-green-900/30' : 'bg-green-100'
            : isDark ? 'bg-red-900/30' : 'bg-red-100'
        }`}>
          <div className={`text-sm ${
            message.includes('成功') || message.includes('Loaded')
              ? isDark ? 'text-green-400' : 'text-green-700'
              : isDark ? 'text-red-400' : 'text-red-700'
          }`}>
            {message}
          </div>
        </div>
      )}
      <div className={`p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '使用示例' : 'Examples'}
        </div>
        <div className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span>/api/mock?count=50</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span>/api/mock?interval=1d&startPrice=200</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span>/api/mock?volatility=0.05</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteData;
