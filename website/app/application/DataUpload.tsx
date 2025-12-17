
import { ICandleViewDataPoint } from 'candleview';
import React, { useCallback } from 'react';

interface DataUploadProps {
  isDark: boolean;
  locale: string;
  onDataParsed: (data: ICandleViewDataPoint[]) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({
  isDark,
  locale,
  onDataParsed,
}) => {
  const [uploadStatus, setUploadStatus] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [parsedCount, setParsedCount] = React.useState<number>(0);

  const parseJSONData = useCallback((jsonData: any[]): ICandleViewDataPoint[] => {
    const parsed: ICandleViewDataPoint[] = [];
    jsonData.forEach((item, index) => {
      try {
        const time = item.time || item.timestamp || item.date || item.Date || index;
        const open = parseFloat(item.open || item.Open || item.o);
        const high = parseFloat(item.high || item.High || item.h);
        const low = parseFloat(item.low || item.Low || item.l);
        const close = parseFloat(item.close || item.Close || item.c);
        const volume = item.volume !== undefined ? parseFloat(item.volume || item.Volume || item.v || '0') : 0;
        if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
          let timestamp = time;
          if (typeof timestamp === 'string') {
            const date = new Date(timestamp);
            timestamp = date.getTime() / 1000;
          } else if (timestamp > 10000000000) {
            timestamp = timestamp / 1000;
          }
          parsed.push({
            time: timestamp,
            open,
            high,
            low,
            close,
            volume,
            isVirtual: false
          });
        }
      } catch (error) {
      }
    });
    return parsed;
  }, []);

  const parseCSVData = useCallback((csvText: string): ICandleViewDataPoint[] => {
    const parsed: ICandleViewDataPoint[] = [];
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return parsed;
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const timeIndex = headers.findIndex(h =>
      h.includes('time') || h.includes('timestamp') || h.includes('date')
    );
    const openIndex = headers.findIndex(h =>
      h.includes('open') || h === 'o'
    );
    const highIndex = headers.findIndex(h =>
      h.includes('high') || h === 'h'
    );
    const lowIndex = headers.findIndex(h =>
      h.includes('low') || h === 'l'
    );
    const closeIndex = headers.findIndex(h =>
      h.includes('close') || h === 'c'
    );
    const volumeIndex = headers.findIndex(h =>
      h.includes('volume') || h === 'v'
    );
    if (openIndex === -1 || highIndex === -1 || lowIndex === -1 || closeIndex === -1) {
    }
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map(v => v.trim());
      try {
        const open = parseFloat(values[openIndex]);
        const high = parseFloat(values[highIndex]);
        const low = parseFloat(values[lowIndex]);
        const close = parseFloat(values[closeIndex]);
        if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
          let timestamp = Date.now() / 1000 + i;
          if (timeIndex !== -1 && values[timeIndex]) {
            const timeValue = values[timeIndex];
            if (/^\d+$/.test(timeValue)) {
              timestamp = parseFloat(timeValue);
              if (timestamp > 10000000000) {
                timestamp = timestamp / 1000;
              }
            } else {
              const date = new Date(timeValue);
              timestamp = date.getTime() / 1000;
            }
          }
          const volume = volumeIndex !== -1 && values[volumeIndex]
            ? parseFloat(values[volumeIndex])
            : Math.floor(Math.random() * 10000);
          parsed.push({
            time: timestamp,
            open,
            high,
            low,
            close,
            volume,
            isVirtual: false
          });
        }
      } catch (error) {
      }
    }
    return parsed;
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus(locale === 'cn' ? '正在解析文件...' : 'Parsing file...');
    setErrorMessage('');
    setParsedCount(0);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let parsedData: ICandleViewDataPoint[] = [];
        if (file.name.toLowerCase().endsWith('.json')) {
          const jsonData = JSON.parse(content);
          if (!Array.isArray(jsonData)) {
            throw new Error(locale === 'cn' ? 'JSON文件应该是一个数组' : 'JSON file should be an array');
          }
          parsedData = parseJSONData(jsonData);
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          parsedData = parseCSVData(content);
        } else {
          throw new Error(locale === 'cn' ? '不支持的文件格式' : 'Unsupported file format');
        }
        if (parsedData.length === 0) {
          throw new Error(locale === 'cn' ? '未解析出有效数据' : 'No valid data parsed');
        }
        parsedData.sort((a, b) => a.time - b.time);
        setParsedCount(parsedData.length);
        onDataParsed(parsedData);
        setUploadStatus(locale === 'cn'
          ? `成功解析 ${parsedData.length} 条数据`
          : `Successfully parsed ${parsedData.length} data points`
        );
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : locale === 'cn' ? '解析失败' : 'Parse failed');
        setUploadStatus(locale === 'cn' ? '解析失败' : 'Parse failed');
      }
    };
    reader.onerror = () => {
      setErrorMessage(locale === 'cn' ? '文件读取失败' : 'Failed to read file');
      setUploadStatus(locale === 'cn' ? '读取失败' : 'Read failed');
    };
    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsText(file);
    }
  }, [locale, parseJSONData, parseCSVData, onDataParsed]);

  const downloadSampleJSON = useCallback(() => {
    const generateSampleData = () => {
      const data = [];
      let baseTime = 1672531200;
      let lastClose = 100.0;
      const totalPoints = 2400;
      const secondsPerPoint = 86400 / totalPoints;
      for (let i = 0; i < totalPoints; i++) {
        const timestamp = baseTime + i * secondsPerPoint;
        const volatility = 0.03;
        const hourProgress = (i % 100) / 100;
        let timeFactor = 1.0;
        if (hourProgress < 0.25) {
          timeFactor = 1.5;
        } else if (hourProgress > 0.75) {
          timeFactor = 1.8;
        } else if (hourProgress > 0.4 && hourProgress < 0.6) {
          timeFactor = 0.6;
        }
        const randomChange = (Math.random() - 0.5) * 2 * volatility * timeFactor;
        const trend = Math.sin(i / 50) * 0.02;
        const cycle = Math.sin(i / 10) * 0.01;
        let open = lastClose;
        if (Math.random() < 0.05) {
          const gap = (Math.random() > 0.5 ? 1 : -1) * (0.01 + Math.random() * 0.02);
          open = lastClose * (1 + gap);
        }
        const priceChange = (randomChange + trend + cycle);
        let close = open * (1 + priceChange);
        close = Math.max(50, Math.min(200, close));
        const priceRange = Math.abs(close - open) * (2 + Math.random());
        let high = Math.max(open, close) + priceRange * Math.random() * 0.5;
        let low = Math.min(open, close) - priceRange * Math.random() * 0.5;
        if (high <= low) {
          high = Math.max(open, close) * 1.001;
          low = Math.min(open, close) * 0.999;
        }
        if (Math.random() < 0.01) {
          if (Math.random() > 0.5) {
            high *= 1 + Math.random() * 0.1;
          } else {
            low *= 1 - Math.random() * 0.1;
          }
        }
        const priceMove = Math.abs(close - open) / open;
        const baseVolume = 5000 + Math.random() * 15000;
        const volume = Math.floor(baseVolume * (1 + priceMove * 3));
        data.push({
          time: timestamp,
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close: parseFloat(close.toFixed(2)),
          volume: volume
        });
        lastClose = close;
      }
      return data;
    };
    const sampleData = generateSampleData();
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '1day-second-level-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);


  const downloadSampleCSV = useCallback(() => {
    const generateCSVData = () => {
      let csv = 'timestamp,open,high,low,close,volume\n';
      let baseTime = 1672531200;
      let lastClose = 100.0;
      const totalPoints = 1000;
      const interval = 86400 / totalPoints;
      for (let i = 0; i < totalPoints; i++) {
        const timestamp = baseTime + Math.floor(i * interval);
        const volatility = 0.05;
        const timeOfDay = (i * interval) / 86400;
        let timeFactor = 1.0;
        if (timeOfDay < 0.0833) {
          timeFactor = 0.8;
        } else if (timeOfDay < 0.1667) {
          timeFactor = 1.0;
        } else if (timeOfDay < 0.25) {
          timeFactor = 1.5;
        } else if (timeOfDay < 0.3333) {
          timeFactor = 2.0;
        } else if (timeOfDay < 0.4167) {
          timeFactor = 2.5;
        } else if (timeOfDay < 0.5) {
          timeFactor = 2.0;
        } else if (timeOfDay < 0.5833) {
          timeFactor = 1.5;
        } else if (timeOfDay < 0.6667) {
          timeFactor = 1.8;
        } else if (timeOfDay < 0.75) {
          timeFactor = 2.2;
        } else if (timeOfDay < 0.8333) {
          timeFactor = 1.2;
        } else if (timeOfDay < 0.9167) {
          timeFactor = 1.0;
        } else {
          timeFactor = 0.7;
        }
        const randomChange = (Math.random() - 0.5) * 2 * volatility * timeFactor;
        const trend = Math.sin(i / 200) * 0.03;
        const cycle = Math.sin(i / 20) * 0.02;
        let open = lastClose;
        if (i % 100 === 0 && i > 0) {
          if (Math.random() < 0.5) {
            const gap = (Math.random() > 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.03);
            open = lastClose * (1 + gap);
          }
        }
        let close = open * (1 + randomChange + trend + cycle);
        close = Math.max(50, Math.min(300, close));
        const priceRange = Math.abs(close - open) * (3 + Math.random() * 2);
        let high = Math.max(open, close) + priceRange * Math.random() * 0.6;
        let low = Math.min(open, close) - priceRange * Math.random() * 0.6;
        if (high <= low) {
          const mid = (open + close) / 2;
          high = mid * 1.01;
          low = mid * 0.99;
        }
        if (Math.random() < 0.01) {
          if (Math.random() > 0.5) {
            high *= 1 + Math.random() * 0.15;
          } else {
            low *= 1 - Math.random() * 0.15;
          }
        }
        const priceMove = Math.abs(close - open) / open;
        const baseVolume = 10000 + Math.random() * 20000;
        const volume = Math.floor(baseVolume * (1 + priceMove * 5) * timeFactor);
        csv += `${timestamp},${open.toFixed(2)},${high.toFixed(2)},${low.toFixed(2)},${close.toFixed(2)},${volume}\n`;
        lastClose = close;
      }
      return csv;
    };
    const csvContent = generateCSVData();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'high-volatility-day-second-level.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className={`h-full p-3 space-y-4 overflow-y-auto ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="space-y-3">
        <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {locale === 'cn' ? '数据上传' : 'Data Upload'}
        </h3>

        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <p className="text-xs mb-2">
            {locale === 'cn' ? '支持的文件格式:' : 'Supported formats:'}
          </p>
          <ul className="text-xs space-y-1 ml-2">
            <li>• JSON: {locale === 'cn' ? '包含 time/open/high/low/close/volume 字段的数组' : 'Array with time/open/high/low/close/volume fields'}</li>
            <li>• CSV: {locale === 'cn' ? '包含时间戳、OHLCV数据的CSV文件' : 'CSV with timestamp and OHLCV data'}</li>
          </ul>
        </div>

        <div className="space-y-2">
          <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {locale === 'cn' ? '选择文件' : 'Select File'}
          </label>
          <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isDark
            ? 'border-gray-500 hover:border-gray-400'
            : 'border-gray-300 hover:border-gray-400'
            }`}>
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-2">
                <svg className={`w-8 h-8 mx-auto ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm">
                  {locale === 'cn' ? '点击上传JSON或CSV文件' : 'Click to upload JSON or CSV file'}
                </p>
                <p className="text-xs opacity-70">
                  {locale === 'cn' ? '或拖放文件到此处' : 'or drag and drop'}
                </p>
              </div>
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {locale === 'cn' ? '下载示例文件' : 'Download Sample Files'}
          </label>
          <div className="flex space-x-2">
            <button
              onClick={downloadSampleJSON}
              className={`flex-1 px-3 py-2 text-sm rounded transition-colors flex items-center justify-center space-x-1 ${isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>JSON</span>
            </button>
            <button
              onClick={downloadSampleCSV}
              className={`flex-1 px-3 py-2 text-sm rounded transition-colors flex items-center justify-center space-x-1 ${isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>CSV</span>
            </button>
          </div>
        </div>
        {uploadStatus && (
          <div className={`p-3 rounded-lg text-sm ${errorMessage
            ? (isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700')
            : (isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700')
            }`}>
            <div className="flex items-center space-x-2">
              {errorMessage ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{errorMessage || uploadStatus}</span>
            </div>
            {errorMessage && (
              <p className="text-xs mt-1 opacity-80">
                {locale === 'cn'
                  ? '请确保文件格式正确并包含OHLC数据'
                  : 'Please ensure the file is in correct format and contains OHLC data'}
              </p>
            )}
          </div>
        )}
        {parsedCount > 0 && !errorMessage && (
          <div className={`p-2 rounded text-xs ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex justify-between items-center">
              <span>{locale === 'cn' ? '解析统计:' : 'Parsed statistics:'}</span>
              <span className="font-medium">{parsedCount} {locale === 'cn' ? '条记录' : 'records'}</span>
            </div>
            <div className="mt-1 text-xs opacity-70">
              {locale === 'cn'
                ? '数据已应用到图表，您可以调整面板大小查看完整效果'
                : 'Data applied to chart. You can resize panels to view complete effect'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataUpload;
