'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../providers/I18nProvider';
import { siteConfig } from '../config';
import CandleView, { ICandleViewDataPoint } from 'candleview';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  chartData?: ICandleViewDataPoint[];
  dataRange?: {
    basePrice: number;
    volatility: number;
    timeRange: number;
    points: number;
    trend: 'up' | 'down' | 'sideways';
  };
  isChartLoading?: boolean;
}

const generateMockOHLCVData = (range: {
  basePrice: number;
  volatility: number;
  timeRange: number;
  points: number;
  trend: 'up' | 'down' | 'sideways';
}): ICandleViewDataPoint[] => {
  const { basePrice, volatility, timeRange, points, trend } = range;
  const data = [];
  const baseTime = Date.now();
  const timeStep = timeRange / points;
  let currentPrice = basePrice;
  let trendFactor = 0;
  switch (trend) {
    case 'up': trendFactor = 0.001; break;
    case 'down': trendFactor = -0.001; break;
    default: trendFactor = 0;
  }
  for (let i = 0; i < points; i++) {
    const time = baseTime - (points - i) * timeStep;
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const trendChange = trendFactor * i * basePrice;
    const priceChange = randomChange + trendChange;
    const open = currentPrice;
    const close = open + priceChange;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 1000) + 100;
    data.push({ time, open, high, low, close, volume });
    currentPrice = close;
  }
  return data;
};

const parseDataRangeFromAI = (aiResponse: string) => {
  try {
    if (aiResponse.trim().startsWith('{')) {
      const parsed = JSON.parse(aiResponse);
      return {
        basePrice: parsed.basePrice || 100,
        volatility: parsed.volatility || 5,
        timeRange: parsed.timeRange || 86400000,
        points: parsed.points || 100,
        trend: parsed.trend || 'sideways'
      };
    }
    const basePriceMatch = aiResponse.match(/基础价格[：:]?\s*([\d.]+)/) || aiResponse.match(/base[：:]?\s*([\d.]+)/i);
    const volatilityMatch = aiResponse.match(/波动率[：:]?\s*([\d.]+)/) || aiResponse.match(/volatility[：:]?\s*([\d.]+)/i);
    const pointsMatch = aiResponse.match(/数据点[：:]?\s*(\d+)/) || aiResponse.match(/points[：:]?\s*(\d+)/i);
    return {
      basePrice: basePriceMatch ? parseFloat(basePriceMatch[1]) : 100,
      volatility: volatilityMatch ? parseFloat(volatilityMatch[1]) : 5,
      timeRange: 86400000,
      points: pointsMatch ? parseInt(pointsMatch[1]) : 100,
      trend: 'sideways'
    };
  } catch (error) {
    return null;
  }
};

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

interface AIModel {
  value: string;
  label: string;
}

const AI_MODELS: Record<'aliyun' | 'deepseek', AIModel[]> = {
  aliyun: [
    { value: 'qwen-turbo', label: 'Qwen Turbo' },
  ],
  deepseek: [
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  ]
};

export default function AIDialog() {
  const { locale } = useI18n();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [textareaHeight, setTextareaHeight] = useState('auto');
  const [selectedProvider, setSelectedProvider] = useState<'aliyun' | 'deepseek'>('aliyun');
  const [selectedModel, setSelectedModel] = useState('qwen-turbo');
  const [availableModels, setAvailableModels] = useState<AIModel[]>(AI_MODELS.aliyun);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const aiDialog = siteConfig.aiDialog;
  const localizedTitle = getLocalizedContent(aiDialog.title, locale);
  const localizedDescription = getLocalizedContent(aiDialog.description, locale);
  const localizedPlaceholder = getLocalizedContent(aiDialog.placeholder, locale);
  const localizedSendButton = getLocalizedContent(aiDialog.sendButton, locale);
  const localizedClearButton = getLocalizedContent(aiDialog.clearButton, locale);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: locale === 'cn'
            ? '您好！我是数据分析助手，我可以帮您分析图表数据、解释技术问题，并提供相关建议。请随时向我提问！'
            : 'Hello! I am a data analysis assistant. I can help you analyze chart data, explain technical questions, and provide relevant suggestions. Feel free to ask me anything!'
        }
      ]);
    }
  }, [locale]);

  useEffect(() => {
    setAvailableModels(AI_MODELS[selectedProvider]);
    if (selectedProvider === 'aliyun') {
      setSelectedModel('qwen-turbo');
    } else {
      setSelectedModel('deepseek-chat');
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const previousHeight = textarea.style.height;
      textarea.style.height = '60px';
      textarea.style.overflowY = 'hidden';
      const contentHeight = textarea.scrollHeight;
      const maxHeight = 200;
      const newHeight = Math.min(contentHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      setTextareaHeight(`${newHeight}px`);
      if (contentHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [inputValue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  };

  useEffect(() => {
    if (messages.length > 1) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage
    }]);
    setIsLoading(true);
    try {
      const requestData = {
        provider: selectedProvider,
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          {
            role: 'user',
            content: `用户问题：${userMessage}
请根据用户的问题，如果需要生成图表数据，请返回一个JSON对象来描述数据范围，不要返回实际数据点。
格式要求：
{
  "basePrice": 基础价格（数字）,
  "volatility": 波动率（数字，如5表示5%）,
  "timeRange": 时间范围（毫秒）,
  "points": 数据点数,
  "trend": "up"|"down"|"sideways"
}
如果问题不需要图表数据，请正常回答问题。
限制：请确保返回的内容简洁，主要用于生成数据范围。`
          }
        ],
        i18n: locale as 'en' | 'cn',
        modelType: selectedModel,
        options: {
          temperature: 0.3,
          maxTokens: 300,
          systemPrompt: locale === 'cn'
            ? '你是一个专业的数据分析和可视化助手。当用户询问需要图表数据的问题时，请返回数据范围描述（JSON格式）。当用户询问其他问题时，请正常回答。保持响应简洁。'
            : 'You are a professional data analysis and visualization assistant. When users ask questions that require chart data, please return a data range description (JSON format). When users ask other questions, answer normally. Keep responses concise.'
        }
      };
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        const aiResponse = result.message;
        const dataRange = parseDataRangeFromAI(aiResponse);
        if (dataRange) {
          const newAIMessage: Message = {
            role: 'assistant',
            content: locale === 'cn'
              ? `${aiResponse}\n\n已为您生成图表数据范围：
               - 基础价格：${dataRange.basePrice}
               - 波动率：${dataRange.volatility}%
               - 数据点数：${dataRange.points}
               - 趋势：${dataRange.trend === 'up' ? '上涨' : dataRange.trend === 'down' ? '下跌' : '横盘'}
               正在生成模拟数据并绘制图表...`
              : `${aiResponse}\n\nChart data range generated:
               - Base Price: ${dataRange.basePrice}
               - Volatility: ${dataRange.volatility}%
               - Data Points: ${dataRange.points}
               - Trend: ${dataRange.trend}

               Generating mock data and drawing chart...`,
            dataRange,
            isChartLoading: true,
            chartData: []
          };
          setMessages(prev => [...prev, newAIMessage]);
          setTimeout(() => {
            const mockData = generateMockOHLCVData(dataRange);
            setMessages(prev => prev.map((msg, index) => {
              if (index === prev.length - 1 && msg.role === 'assistant') {
                return {
                  ...msg,
                  chartData: mockData,
                  isChartLoading: false
                };
              }
              return msg;
            }));
          }, 800);
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: aiResponse,
            chartData: undefined,
            isChartLoading: false
          }]);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: locale === 'cn'
            ? `抱歉，处理您的请求时出现了问题: ${result.error || '未知错误'}。请稍后重试。`
            : `Sorry, there was a problem processing your request: ${result.error || 'Unknown error'}. Please try again later.`,
          chartData: undefined,
          isChartLoading: false
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: locale === 'cn'
          ? `网络连接错误或服务器异常: ${error instanceof Error ? error.message : '未知错误'}。请检查网络连接后重试。`
          : `Network connection error or server exception: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your network connection and try again.`,
        chartData: undefined,
        isChartLoading: false
      }]);
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = '60px';
        setTextareaHeight('60px');
      }
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: locale === 'cn'
          ? '对话已清空。有什么关于数据分析或可视化的疑问吗？我很乐意帮助您！'
          : 'Chat cleared. Do you have any questions about data analysis or visualization? I\'d be happy to help!',
        chartData: undefined,
        isChartLoading: false
      }
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <section className="w-full py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="relative">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  {localizedTitle}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-xl opacity-50" />
              </span>
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              {localizedDescription}
            </p>
          </div>
          <div className={`mb-2 rounded-xl ${isDark
            ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700'
            : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
            }`}>
            <div className="flex flex-row items-center gap-4 p-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {locale === 'cn' ? 'AI品牌' : 'AI Brand'}
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as 'aliyun' | 'deepseek')}
                  className={`w-48 px-3 py-2 rounded-lg border ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-800'
                    } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                >
                  <option value="aliyun">
                    {locale === 'cn' ? '阿里云通义千问' : 'Alibaba Cloud'}
                  </option>
                  <option value="deepseek">
                    DeepSeek
                  </option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {locale === 'cn' ? '选择模型' : 'Select Model'}
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className={`w-64 px-3 py-2 rounded-lg border ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-800'
                    } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                >
                  {availableModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-shrink-0 ml-auto">
                <div className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ padding: '14px' }}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {locale === 'cn' ? '当前选择' : 'Selected'}
                  </div>
                  <div className="text-sm font-medium">
                    {selectedProvider === 'aliyun' ?
                      locale === 'cn' ? '阿里云' : 'Aliyun'
                      :
                      locale === 'cn' ? 'DeepSeek' : 'DeepSeek'} • {
                      availableModels.find(m => m.value === selectedModel)?.label
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isFullscreen && (
            <div className="fixed inset-0 z-50 flex flex-col">
              <div className={`flex items-center justify-between px-6 py-4 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className={`p-2 rounded-lg transition-all ${isDark
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    aria-label={locale === 'cn' ? '退出全屏' : 'Exit Fullscreen'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="text-sm font-medium">
                    {locale === 'cn' ? 'AI 对话 - 全屏模式' : 'AI Chat - Fullscreen Mode'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    {selectedProvider === 'aliyun' ? locale === 'cn' ? '阿里云' : 'Aliyun' : locale === 'cn' ? 'DeepSeek' : 'DeepSeek'} • {
                      availableModels.find(m => m.value === selectedModel)?.label
                    }
                  </div>
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto custom-scrollbar"
                style={{
                  overflow: 'auto',
                  overscrollBehavior: 'contain',
                  scrollbarWidth: 'thin',
                  backgroundColor: isDark ? '#1f2937' : '#ffffff'
                }}
              >
                <div className="p-6 space-y-6">
                  {messages.map((message, index) => (
                    <div key={index} className="space-y-4">
                      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] ${message.role === 'assistant' && message.dataRange ? 'w-full' : ''} rounded-2xl p-4 ${message.role === 'user'
                            ? isDark
                              ? 'bg-gradient-to-r from-primary to-primary/80 text-white rounded-br-none'
                              : 'bg-gradient-to-r from-primary to-primary/60 text-white rounded-br-none'
                            : isDark
                              ? 'bg-gray-700 text-white rounded-bl-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}
                        >
                          <div className="flex items-start space-x-3">
                            {message.role === 'assistant' && (
                              <div className={`flex-shrink-0 p-2 rounded-lg ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {message.role === 'user'
                                  ? (locale === 'cn' ? '您' : 'You')
                                  : (locale === 'cn' ? 'AI助手' : 'AI Assistant')
                                }
                              </div>
                              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                              {message.role === 'assistant' && message.dataRange && (
                                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {locale === 'cn' ? '数据分析图表' : 'Data Analysis Chart'}
                                    </h4>
                                    {message.dataRange && (
                                      <div className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                        {message.dataRange.trend === 'up' ? (locale === 'cn' ? '📈 上涨' : '📈 Up')
                                          : message.dataRange.trend === 'down' ? (locale === 'cn' ? '📉 下跌' : '📉 Down')
                                            : (locale === 'cn' ? '➡️ 横盘' : '➡️ Sideways')}
                                      </div>
                                    )}
                                  </div>
                                  {message.isChartLoading ? (
                                    <div className="h-[500px] flex items-center justify-center">
                                      <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {locale === 'cn' ? '正在生成模拟数据...' : 'Generating mock data...'}
                                        </p>
                                      </div>
                                    </div>
                                  ) : message.chartData && message.chartData.length > 0 ? (
                                    <div className="h-[500px]">
                                      <CandleView
                                        data={message.chartData}
                                        title={locale === 'cn' ? '模拟数据图表' : 'Mock Data Chart'}
                                        theme={isDark ? 'dark' : 'light'}
                                        i18n={locale === 'cn' ? 'zh-cn' : 'en'}
                                        height={500}
                                        leftpanel={true}
                                        toppanel={true}
                                        timeframe='1h'
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-[500px] flex items-center justify-center border border-dashed rounded-lg">
                                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {locale === 'cn' ? '无图表数据' : 'No chart data'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            {message.role === 'user' && (
                              <div className={`flex-shrink-0 p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className={`max-w-[80%] rounded-2xl p-4 ${isDark
                        ? 'bg-gray-700 text-white rounded-bl-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}>
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className={`border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="p-4">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={localizedPlaceholder}
                      className={`w-full py-3 px-4 border rounded-xl resize-none focus:outline-none transition-all custom-scrollbar ${isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                      style={{
                        height: textareaHeight,
                        minHeight: '60px',
                        maxHeight: '150px',
                        overflowY: 'hidden',
                      }}
                      disabled={isLoading}
                      rows={1}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        onClick={handleClearChat}
                        disabled={isLoading}
                        className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        aria-label={localizedClearButton}
                        title={localizedClearButton}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsFullscreen(false)}
                        disabled={isLoading}
                        className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        aria-label={locale === 'cn' ? '退出全屏' : 'Exit Fullscreen'}
                        title={locale === 'cn' ? '退出全屏' : 'Exit Fullscreen'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${isLoading || !inputValue.trim()
                          ? isDark
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary to-primary/80 text-white hover:opacity-90 active:scale-95 transition-transform'
                          }`}
                        aria-label={localizedSendButton}
                        title={localizedSendButton}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!isFullscreen && (
            <div className={`rounded-2xl shadow-2xl overflow-hidden ${isDark
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700'
              : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
              }`}>
              <div
                className="h-[600px] overflow-y-auto p-6 space-y-6 custom-scrollbar"
                style={{
                  overscrollBehavior: 'contain',
                }}
              >
                {messages.map((message, index) => (
                  <div key={index} className="space-y-4">
                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] ${message.role === 'assistant' && message.dataRange ? 'w-full' : ''} rounded-2xl p-4 ${message.role === 'user'
                          ? isDark
                            ? 'bg-gradient-to-r from-primary to-primary/80 text-white rounded-br-none'
                            : 'bg-gradient-to-r from-primary to-primary/60 text-white rounded-br-none'
                          : isDark
                            ? 'bg-gray-700 text-white rounded-bl-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                      >
                        <div className="flex items-start space-x-3">
                          {message.role === 'assistant' && (
                            <div className={`flex-shrink-0 p-2 rounded-lg ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {message.role === 'user'
                                ? (locale === 'cn' ? '您' : 'You')
                                : (locale === 'cn' ? 'AI助手' : 'AI Assistant')
                              }
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            {message.role === 'assistant' && message.dataRange && (
                              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {locale === 'cn' ? '数据分析图表' : 'Data Analysis Chart'}
                                  </h4>
                                  {message.dataRange && (
                                    <div className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                      {message.dataRange.trend === 'up' ? (locale === 'cn' ? '📈 上涨' : '📈 Up')
                                        : message.dataRange.trend === 'down' ? (locale === 'cn' ? '📉 下跌' : '📉 Down')
                                          : (locale === 'cn' ? '➡️ 横盘' : '➡️ Sideways')}
                                    </div>
                                  )}
                                </div>
                                {message.isChartLoading ? (
                                  <div className="h-[500px] flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                      <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {locale === 'cn' ? '正在生成模拟数据...' : 'Generating mock data...'}
                                      </p>
                                    </div>
                                  </div>
                                ) : message.chartData && message.chartData.length > 0 ? (
                                  <div className="h-[500px]">
                                    <CandleView
                                      data={message.chartData}
                                      title={locale === 'cn' ? '模拟数据图表' : 'Mock Data Chart'}
                                      theme={isDark ? 'dark' : 'light'}
                                      i18n={locale === 'cn' ? 'zh-cn' : 'en'}
                                      height={500}
                                      leftpanel={true}
                                      toppanel={true}
                                      timeframe='1h'
                                    />
                                  </div>
                                ) : (
                                  <div className="h-[500px] flex items-center justify-center border border-dashed rounded-lg">
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {locale === 'cn' ? '无图表数据' : 'No chart data'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {message.role === 'user' && (
                            <div className={`flex-shrink-0 p-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={`max-w-[80%] rounded-2xl p-4 ${isDark
                      ? 'bg-gray-700 text-white rounded-bl-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className={`relative border-t ${isDark
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-gray-50/50 border-gray-200'
                }`}>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={localizedPlaceholder}
                    className={`w-full pt-4 px-4 pb-12 border-0 resize-none focus:outline-none transition-all custom-scrollbar ${isDark
                      ? 'bg-transparent text-white placeholder-gray-400'
                      : 'bg-transparent text-gray-800 placeholder-gray-500'
                      }`}
                    style={{
                      height: textareaHeight,
                      minHeight: '60px',
                      maxHeight: '200px',
                      overflowY: 'hidden',
                    }}
                    disabled={isLoading}
                    rows={1}
                  />
                  <div className={`absolute bottom-3 right-3 flex items-center gap-2`}>
                    <button
                      onClick={handleClearChat}
                      disabled={isLoading}
                      className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      aria-label={localizedClearButton}
                      title={localizedClearButton}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsFullscreen(true)}
                      disabled={isLoading}
                      className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      aria-label={locale === 'cn' ? '全屏' : 'Fullscreen'}
                      title={locale === 'cn' ? '全屏' : 'Fullscreen'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${isLoading || !inputValue.trim()
                        ? isDark
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-primary/80 text-white hover:opacity-90 active:scale-95 transition-transform'
                        }`}
                      aria-label={localizedSendButton}
                      title={localizedSendButton}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!isFullscreen && (
            <div className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
              }`} style={{ padding: "14px" }}>
              <p>
                {locale === 'cn'
                  ? '提示：AI助手可以回答关于数据分析、可视化技术和产品功能的问题'
                  : 'Tip: The AI assistant can answer questions about data analysis, visualization techniques, and product features'
                }
              </p>
              <p className="mt-1 text-xs opacity-75">
                {locale === 'cn'
                  ? `当前使用: ${selectedProvider === 'aliyun' ? '阿里云' : 'DeepSeek'} - ${availableModels.find(m => m.value === selectedModel)?.label
                  }`
                  : `Currently using: ${selectedProvider === 'aliyun' ? 'Alibaba Cloud' : 'DeepSeek'} - ${availableModels.find(m => m.value === selectedModel)?.label
                  }`
                }
              </p>
            </div>
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
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(75, 85, 99, 0.5);
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(107, 114, 128, 0.8);
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:active {
      background: rgba(156, 163, 175, 0.9);
    }
    :not(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(209, 213, 219, 0.5);
    }
    :not(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(156, 163, 175, 0.8);
    }
    :not(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:active {
      background: rgba(107, 114, 128, 0.9);
    }
    textarea.custom-scrollbar::-webkit-scrollbar-track {
      margin-top: 4px;
      margin-bottom: 60px;
    }
    textarea.custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    textarea.custom-scrollbar::-webkit-scrollbar-thumb {
      border-radius: 3px;
    }
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: transparent transparent;
    }
    .dark .custom-scrollbar {
      scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
    }
    :not(.dark) .custom-scrollbar {
      scrollbar-color: rgba(209, 213, 219, 0.5) transparent;
    }
    textarea {
      transition: height 0.2s ease-out;
    }
    .overflow-y-auto {
      overscroll-behavior: contain;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    body:has(.fixed.inset-0.z-50) {
      overflow: hidden !important;
    }
  `}</style>
      </section>
    </>
  );
}
