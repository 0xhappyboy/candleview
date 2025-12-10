import { ICandleViewDataPoint } from 'candleview';
import React, { useState, useEffect } from 'react';

interface StaticMarkerProps {
  isDark: boolean;
  locale: string;
  chartData: ICandleViewDataPoint[];
  onMarkerAdd?: (markerData: { time: number; type: string; data: { text: string; direction: string }[] }) => void;
  onMarkerRemove?: (timestamp: number) => void;
  onClearAllMarkers?: () => void;
}

const StaticMarker: React.FC<StaticMarkerProps> = ({
  isDark,
  locale,
  chartData,
  onMarkerAdd,
  onMarkerRemove,
  onClearAllMarkers
}) => {
  const [markers, setMarkers] = useState<Array<{ timestamp: number, label?: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('static-markers');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const [labelInput, setLabelInput] = useState<string>('');
  const [direction, setDirection] = useState<'Top' | 'Bottom'>('Top');
  const [inputError, setInputError] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('static-markers', JSON.stringify(markers));
    }
  }, [markers]);

  const getChartTimestamps = () => {
    return chartData.map(data => data.time).slice(0, 20);
  };

  const handleSelectTimestamp = (timestamp: number) => {
    setSelectedTimestamp(timestamp);
    setInputError('');
  };

  const handleAddMarker = () => {
    setInputError('');
    if (selectedTimestamp === null) {
      setInputError(locale === 'cn' ? '请先选择时间戳' : 'Please select a timestamp first');
      return;
    }
    const existingMarker = markers.find(m => m.timestamp === selectedTimestamp);
    const label = labelInput.trim() || undefined;
    if (existingMarker) {
      const newMarkers = markers.map(m =>
        m.timestamp === selectedTimestamp
          ? { ...m, label }
          : m
      );
      setMarkers(newMarkers);
    } else {
      const newMarker = {
        timestamp: selectedTimestamp,
        label
      };
      const newMarkers = [...markers, newMarker];
      setMarkers(newMarkers);
    }
    const markerData = {
      time: selectedTimestamp,
      type: 'Text' as const,
      data: [{
        text: label || 'Marker',
        direction: direction
      }]
    };
    if (onMarkerAdd) {
      onMarkerAdd(markerData);
    }
    setLabelInput('');
  };

  const handleRemoveMarker = (timestamp: number) => {
    const newMarkers = markers.filter(m => m.timestamp !== timestamp);
    setMarkers(newMarkers);
    if (selectedTimestamp === timestamp) {
      setSelectedTimestamp(null);
    }
    if (onMarkerRemove) {
      onMarkerRemove(timestamp);
    }
  };

  const handleClearAll = () => {
    if (window.confirm(locale === 'cn'
      ? '确定要清除所有标记吗？'
      : 'Are you sure you want to clear all markers?')) {
      setMarkers([]);
      setSelectedTimestamp(null);
      if (onClearAllMarkers) {
        onClearAllMarkers();
      }
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString(locale === 'cn' ? 'zh-CN' : 'en-US');
    } catch (e) {
      return '';
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString(locale === 'cn' ? 'zh-CN' : 'en-US');
    } catch (e) {
      return '';
    }
  };

  const chartTimestamps = getChartTimestamps();

  return (
    <div className="h-full p-3 space-y-4 overflow-y-auto">
      <div className="space-y-2">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '静态标记设置' : 'Static Marker Settings'}
        </label>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {locale === 'cn' ? '已有标记' : 'Existing Markers'} ({markers.length})
            </span>
            {markers.length > 0 && (
              <button
                onClick={handleClearAll}
                className={`text-xs px-2 py-1 rounded transition-colors ${isDark
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
              >
                {locale === 'cn' ? '清除所有' : 'Clear All'}
              </button>
            )}
          </div>
          <div className={`max-h-40 overflow-y-auto ${isDark ? 'scrollbar-dark' : 'scrollbar-light'}`}>
            {markers.length === 0 ? (
              <div className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {locale === 'cn' ? '暂无标记' : 'No markers yet'}
              </div>
            ) : (
              <div className="space-y-1">
                {markers.map((marker) => (
                  <div
                    key={marker.timestamp}
                    className={`flex justify-between items-center p-2 rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(marker.timestamp)}
                        </span>
                        <span className={`ml-2 text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                          {formatTime(marker.timestamp)}
                        </span>
                      </div>
                      {marker.label && (
                        <div className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          📝 {marker.label}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveMarker(marker.timestamp)}
                      className={`text-xs px-2 py-1 rounded transition-colors ml-2 ${isDark
                        ? 'bg-gray-600 hover:bg-red-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-red-200 text-gray-700'
                        }`}
                    >
                      {locale === 'cn' ? '移除' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {locale === 'cn' ? '图表数据时间（前20个）' : 'Chart Data Times (First 20)'}
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {chartData.length} {locale === 'cn' ? '个数据点' : 'data points'}
            </span>
          </div>
          <div className={`max-h-40 overflow-y-auto ${isDark ? 'scrollbar-dark' : 'scrollbar-light'}`}>
            {chartTimestamps.length === 0 ? (
              <div className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {locale === 'cn' ? '暂无图表数据' : 'No chart data yet'}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {chartTimestamps.map((timestamp, index) => {
                  const isSelected = selectedTimestamp === timestamp;
                  return (
                    <button
                      key={`chart-${timestamp}-${index}`}
                      onClick={() => handleSelectTimestamp(timestamp)}
                      className={`p-2 rounded text-left transition-colors ${isSelected
                        ? isDark
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <div className="text-xs">
                        #{index + 1}
                      </div>
                      <div className="text-sm truncate">
                        {formatTime(timestamp)}
                      </div>
                      <div className="text-xs opacity-70 truncate">
                        {formatDate(timestamp)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {selectedTimestamp !== null && (
          <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex justify-between items-center">
              <div>
                <div className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                  {locale === 'cn' ? '当前选择的时间戳' : 'Selected Timestamp'}
                </div>
                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {formatDate(selectedTimestamp)} {formatTime(selectedTimestamp)}
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                  Unix: {selectedTimestamp}
                </div>
              </div>
              <button
                onClick={() => setSelectedTimestamp(null)}
                className={`text-xs px-2 py-1 rounded transition-colors ${isDark
                  ? 'bg-blue-700 hover:bg-blue-600 text-white'
                  : 'bg-blue-200 hover:bg-blue-300 text-blue-700'
                  }`}
              >
                {locale === 'cn' ? '取消选择' : 'Clear'}
              </button>
            </div>
          </div>
        )}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {locale === 'cn' ? '标记方向' : 'Marker Direction'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDirection('Top')}
                className={`px-3 py-2 text-sm rounded transition-colors ${direction === 'Top'
                  ? isDark
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {locale === 'cn' ? '上方 (Top)' : 'Top'}
              </button>
              <button
                onClick={() => setDirection('Bottom')}
                className={`px-3 py-2 text-sm rounded transition-colors ${direction === 'Bottom'
                  ? isDark
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {locale === 'cn' ? '下方 (Bottom)' : 'Bottom'}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {locale === 'cn' ? '标记文本' : 'Marker Text'}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => {
                  setLabelInput(e.target.value);
                  setInputError('');
                }}
                placeholder={locale === 'cn' ? '输入标记文本...' : 'Enter marker text...'}
                className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${inputError
                  ? isDark
                    ? 'border-red-500 bg-red-900/20 text-red-300'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
                  }`}
                maxLength={50}
              />
              <button
                onClick={handleAddMarker}
                disabled={selectedTimestamp === null}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedTimestamp === null
                  ? isDark
                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
              >
                {locale === 'cn' ? '添加标记' : 'Add Marker'}
              </button>
            </div>
            {inputError && (
              <div className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {inputError}
              </div>
            )}
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1 space-y-1`}>
              <div>
                {locale === 'cn'
                  ? '1. 从上方图表时间列表中选择时间戳'
                  : '1. Select timestamp from chart data list above'}
              </div>
              <div>
                {locale === 'cn'
                  ? '2. 选择标记方向（上方或下方）'
                  : '2. Select marker direction (Top or Bottom)'}
              </div>
              <div>
                {locale === 'cn'
                  ? '3. 输入标记文本内容'
                  : '3. Enter marker text content'}
              </div>
              <div>
                {locale === 'cn'
                  ? '4. 点击"添加标记"按钮'
                  : '4. Click "Add Marker" button'}
              </div>
              <div className="pt-1 italic">
                {locale === 'cn'
                  ? '提示：相同时间戳的标记会合并到同一数组中'
                  : 'Tip: Markers with same timestamp will be merged into same array'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticMarker;
