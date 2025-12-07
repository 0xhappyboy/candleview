import React, { useState, useRef, useEffect } from 'react';
import { I18n, EN } from '../I18n';
import { AIFunctionType, AIConfig, AIBrandLogoMapping, AIBrandNameMapping } from './types';
import { ThemeConfig } from '../Theme';
import { CloseIcon, SendIcon } from '../Icons';
import { AIBrandType, getAIModelTypes } from './types';
import { AliYunModelType, createAliyunAI, DeepSeekModelType, OpenAIModelType } from 'ohlcv-ai';
import { stringToAliYunModelType } from 'ohlcv-ai';
import { stringToOpenAIModelType } from 'ohlcv-ai';
import { createOpenAI } from 'ohlcv-ai';
import { stringToDeepSeekModelType } from 'ohlcv-ai';
import { createDeepSeekAI } from 'ohlcv-ai';
import { ICandleViewDataPoint } from '../types';

export interface AIChatBoxProps {
  currentTheme: ThemeConfig;
  i18n: I18n;
  currentAIFunctionType: AIFunctionType | null;
  aiconfigs: AIConfig[];
  onClose: () => void;
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  initialMessage?: string;
  currentAIBrandType: AIBrandType | null;
  onModelChange?: (model: string) => void;
  data: ICandleViewDataPoint[];
}

export interface AIMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

export const AIChatBox: React.FC<AIChatBoxProps> = ({
  currentTheme,
  i18n,
  currentAIFunctionType,
  aiconfigs,
  onClose,
  onSendMessage,
  isLoading = false,
  initialMessage = '',
  currentAIBrandType,
  onModelChange,
  data
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const [maxData, setMaxData] = useState<number>(10);
  const DEFAULT_MAX_DATA = 10;

  useEffect(() => {
    if (currentAIBrandType && selectedModel) {
      const config = aiconfigs.find(config =>
        config.brand === currentAIBrandType &&
        config.model === selectedModel
      );
      setMaxData(config?.maxAnalyzeData ?? DEFAULT_MAX_DATA);
    } else {
      setMaxData(DEFAULT_MAX_DATA);
    }
  }, [currentAIBrandType, selectedModel, aiconfigs]);

  const buildAnalyzeData = () => {
    return data.length > maxData ? data.slice(-maxData) : data;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMatchedModels = (
    standardModels: (OpenAIModelType | AliYunModelType | DeepSeekModelType)[],
    configuredModels: string[]
  ): string[] => {
    const matchedModels: string[] = [];
    configuredModels.forEach(configuredModel => {
      let isMatched = false;
      for (const standardModel of standardModels) {
        if (standardModel.toString() === configuredModel) {
          isMatched = true;
          break;
        }
      }
      if (isMatched) {
        matchedModels.push(configuredModel);
      } else {
        const configuredLower = configuredModel.toLowerCase();
        const caseInsensitiveMatch = standardModels.find(standardModel =>
          standardModel.toString().toLowerCase() === configuredLower
        );
        if (caseInsensitiveMatch) {
          matchedModels.push(configuredModel);
        }
      }
    });
    return matchedModels.filter((model, index, self) =>
      self.indexOf(model) === index
    );
  };

  useEffect(() => {
    if (currentAIBrandType !== undefined && currentAIBrandType !== null) {
      try {
        const allStandardModels = getAIModelTypes(currentAIBrandType);
        const configuredModels = aiconfigs
          .filter(config => config.brand === currentAIBrandType)
          .map(config => config.model);
        const matchedModels = getMatchedModels(allStandardModels, configuredModels);
        setAvailableModels(matchedModels);
        if (matchedModels.length > 0) {
          if (!matchedModels.includes(selectedModel)) {
            const firstModel = matchedModels[0];
            setSelectedModel(firstModel);
            if (onModelChange) {
              onModelChange(firstModel);
            }
          }
        } else {
          setSelectedModel('');
          if (onModelChange) {
            onModelChange('');
          }
        }
      } catch (error) {
        setAvailableModels([]);
        setSelectedModel('');
      }
    } else {
      setAvailableModels([]);
      setSelectedModel('');
    }
  }, [currentAIBrandType, aiconfigs, onModelChange, selectedModel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const welcomeMessage = i18n === EN
      ? `Welcome to AI analysis. How can I help you?`
      : `欢迎使用AI分析。有什么可以帮助您的?`;
    setMessages([
      {
        id: 'welcome',
        content: welcomeMessage,
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  }, [currentAIFunctionType, i18n]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  }, [inputValue]);

  useEffect(() => {
    if (currentAIBrandType !== undefined && currentAIBrandType !== null) {
      try {
        const brandModels = aiconfigs
          .filter(config => config.brand === currentAIBrandType)
          .map(config => config.model);
        const uniqueModels = brandModels.filter((model, index, self) => {
          return self.indexOf(model) === index;
        });
        setAvailableModels(uniqueModels);
        if (uniqueModels.length > 0) {
          if (!uniqueModels.includes(selectedModel)) {
            const firstModel = uniqueModels[0];
            setSelectedModel(firstModel);
            if (onModelChange) {
              onModelChange(firstModel);
            }
          }
        } else {
          setSelectedModel('');
          if (onModelChange) {
            onModelChange('');
          }
        }
      } catch (error) {
        setAvailableModels([]);
        setSelectedModel('');
      }
    } else {
      setAvailableModels([]);
      setSelectedModel('');
    }
  }, [currentAIBrandType, aiconfigs, onModelChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setIsModelDropdownOpen(false);
    if (onModelChange) {
      onModelChange(model);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;
    const userMessage = inputValue.trim();
    const userMessageObj: AIMessage = {
      id: Date.now().toString(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessageObj]);
    setInputValue('');
    setIsSending(true);
    const loadingMessage: AIMessage = {
      id: `loading-${Date.now()}`,
      content: i18n === EN ? 'Analyzing data...' : '分析数据中...',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);
    try {
      if (!currentAIBrandType || !selectedModel) {
        throw new Error(i18n === EN
          ? 'Please select an AI brand and model.'
          : '请选择AI品牌和模型。'
        );
      }
      const config = aiconfigs.find(config =>
        config.brand === currentAIBrandType &&
        config.model === selectedModel
      );
      if (!config || !config.apiKey) {
        throw new Error(i18n === EN
          ? `No API Key configured for ${getAIBrandName()}. Please add configuration.`
          : `未配置${getAIBrandName()}的API密钥。请添加配置。`
        );
      }
      const language = i18n === EN ? 'en' : 'cn';
      let aiResponse: string;
      switch (currentAIBrandType) {
        case AIBrandType.Aliyun:
          try {
            const modelType = stringToAliYunModelType(selectedModel);
            if (!modelType) {
              throw new Error(`Invalid AliYun model: ${selectedModel}`);
            }
            const ai = createAliyunAI(config.apiKey, modelType);
            const options = {
              temperature: 0.5,
              maxTokens: 1000,
              systemPrompt: i18n === EN
                ? 'You are a helpful AI assistant specialized in financial analysis.'
                : '你是一个专门从事金融分析的有用AI助手。'
            };
            aiResponse = await ai.analyzeOHLCV(buildAnalyzeData(), language, 'comprehensive', userMessage, options);
          } catch (error: any) {
            throw new Error(i18n === EN
              ? `Aliyun AI API error: ${error.message}`
              : `阿里云AI API错误：${error.message}`
            );
          }
          break;
        case AIBrandType.OpenAI:
          try {
            const modelType = stringToOpenAIModelType(selectedModel);
            if (!modelType) {
              throw new Error(`Invalid OpenAI model: ${selectedModel}`);
            }
            const ai = createOpenAI(config.apiKey, modelType);
            const options = {
              temperature: 0.5,
              maxTokens: 1000,
              systemPrompt: i18n === EN
                ? 'You are a helpful AI assistant specialized in financial analysis.'
                : '你是一个专门从事金融分析的有用AI助手。'
            };
            aiResponse = await ai.analyzeOHLCV(buildAnalyzeData(), language, 'comprehensive', userMessage, options);
          } catch (error: any) {
            throw new Error(i18n === EN
              ? `OpenAI API error: ${error.message}`
              : `OpenAI API错误：${error.message}`
            );
          }
          break;
        case AIBrandType.DeepSeek:
          try {
            const modelType = stringToDeepSeekModelType(selectedModel);
            if (!modelType) {
              throw new Error(`Invalid DeepSeek model: ${selectedModel}`);
            }
            const ai = createDeepSeekAI(config.apiKey, modelType);
            const options = {
              temperature: 0.5,
              maxTokens: 1000,
              modelType: modelType,
              systemPrompt: i18n === EN
                ? 'You are a helpful AI assistant specialized in financial analysis.'
                : '你是一个专门从事金融分析的有用AI助手。'
            };
            aiResponse = await ai.analyzeOHLCV(buildAnalyzeData(), language, 'comprehensive', userMessage, options);
          } catch (error: any) {
            throw new Error(i18n === EN
              ? `DeepSeek AI API error: ${error.message}`
              : `DeepSeek AI API错误：${error.message}`
            );
          }
          break;
        case AIBrandType.Claude:
          // TODO
          aiResponse = i18n === EN
            ? `[${getAIBrandName()} Analysis] I've analyzed the OHLCV data with ${buildAnalyzeData().length} periods. Based on the data: ${JSON.stringify(buildAnalyzeData())}, and your query: "${userMessage}", here's my analysis. (Note: ${getAIBrandName()} analyzeOHLCV API not yet implemented)`
            : `[${getAIBrandName()} 分析] 我已经分析了包含 ${buildAnalyzeData().length} 个周期的OHLCV数据。基于数据：${JSON.stringify(buildAnalyzeData())}，以及您的查询："${userMessage}"，这是我的分析。（注意：${getAIBrandName()} analyzeOHLCV API尚未实现）`;
          break;
        case AIBrandType.Gemini:
          // TODO
          aiResponse = i18n === EN
            ? `[${getAIBrandName()} Analysis] I've analyzed the OHLCV data with ${buildAnalyzeData().length} periods. Based on the data: ${JSON.stringify(buildAnalyzeData())}, and your query: "${userMessage}", here's my analysis. (Note: ${getAIBrandName()} analyzeOHLCV API not yet implemented)`
            : `[${getAIBrandName()} 分析] 我已经分析了包含 ${buildAnalyzeData().length} 个周期的OHLCV数据。基于数据：${JSON.stringify(buildAnalyzeData())}，以及您的查询："${userMessage}"，这是我的分析。（注意：${getAIBrandName()} analyzeOHLCV API尚未实现）`;
          break;
        default:
          throw new Error(i18n === EN
            ? `Unsupported AI brand: ${currentAIBrandType}`
            : `不支持的AI品牌：${currentAIBrandType}`
          );
      }

      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        return [...filtered, aiMessage];
      });
    } catch (error: any) {
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
        const errorMessage: AIMessage = {
          id: (Date.now() + 2).toString(),
          content: i18n === EN
            ? `Sorry, there was an error: ${error.message}`
            : `抱歉，出现错误：${error.message}`,
          sender: 'ai',
          timestamp: new Date()
        };
        return [...filtered, errorMessage];
      });
    } finally {
      setIsSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAIBrandName = () => {
    if (!currentAIBrandType) return '';
    const brandNames = {
      [AIBrandType.OpenAI]: 'OpenAI',
      [AIBrandType.Aliyun]: i18n.ai.aliyun,
      [AIBrandType.DeepSeek]: 'DeepSeek',
      [AIBrandType.Claude]: 'Claude',
      [AIBrandType.Gemini]: 'Gemini'
    };
    return brandNames[currentAIBrandType] || '';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: currentTheme.layout.background.color,
      border: `1px solid ${currentTheme.toolbar.border}30`,
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: currentTheme.toolbar.background,
        borderBottom: `1px solid ${currentTheme.toolbar.border}30`,
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: currentTheme.chart.candleUpColor,
          }} />
          <span style={{
            color: currentTheme.layout.textColor,
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {getAIBrandName()}
          </span>
        </div>
        {currentAIBrandType !== undefined && currentAIBrandType !== null && availableModels.length > 0 && (
          <div ref={modelDropdownRef} style={{
            position: 'relative',
            flex: 1,
            minWidth: '150px',
            maxWidth: '250px',
          }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                borderRadius: '6px',
                border: `1px solid ${currentTheme.toolbar.border}50`,
                background: currentTheme.layout.background.color,
                color: currentTheme.layout.textColor,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = currentTheme.toolbar.button.active;
              }}
              onMouseLeave={(e) => {
                if (!isModelDropdownOpen) {
                  e.currentTarget.style.borderColor = currentTheme.toolbar.border + '50';
                }
              }}
            >
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {selectedModel || (i18n === EN ? 'Select Model' : '选择模型')}
              </span>
              <svg
                style={{
                  width: '16px',
                  height: '16px',
                  marginLeft: '8px',
                  flexShrink: 0,
                  transform: isModelDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {isModelDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  borderRadius: '6px',
                  border: `1px solid ${currentTheme.toolbar.border}50`,
                  background: currentTheme.layout.background.color,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
                className="model-dropdown"
              >
                {availableModels.map((model, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      color: currentTheme.layout.textColor,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      backgroundColor: model === selectedModel
                        ? currentTheme.toolbar.button.active + '30'
                        : 'transparent',
                      borderBottom: index < availableModels.length - 1
                        ? `1px solid ${currentTheme.toolbar.border}20`
                        : 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => handleModelChange(model)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = model === selectedModel
                        ? currentTheme.toolbar.button.active + '40'
                        : currentTheme.toolbar.button.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = model === selectedModel
                        ? currentTheme.toolbar.button.active + '30'
                        : 'transparent';
                    }}
                  >
                    {model}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: currentTheme.toolbar.button.color,
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = currentTheme.toolbar.button.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <CloseIcon size={18} />
        </button>
      </div>
      {currentAIBrandType !== undefined && (
        <div style={{
          padding: '4px 16px',
          background: currentTheme.toolbar.background + '80',
          borderBottom: `1px solid ${currentTheme.toolbar.border}20`,
          fontSize: '12px',
          color: currentTheme.layout.textColor,
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>{getAIBrandName()}</span>
          <span style={{
            fontSize: '11px',
            opacity: 0.6,
          }}>
            {i18n === EN ? 'Selected Model' : '已选模型'}: {selectedModel}
          </span>
        </div>
      )}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }} className="modal-scrollbar">
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: currentTheme.toolbar.button.color,
            opacity: 0.7,
            textAlign: 'center',
            padding: '20px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              marginBottom: '16px',
              opacity: 0.5,
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: currentTheme.toolbar.button.active,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentTheme.layout.background.color,
                fontSize: '24px',
              }}>
                AI
              </div>
            </div>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              {i18n === EN ? 'Select an AI function to start' : '选择AI功能开始对话'}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.6 }}>
              {i18n === EN ? 'Choose from the left panel' : '从左侧面板选择'}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  maxWidth: '85%',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: message.sender === 'user'
                      ? currentTheme.chart.candleUpColor
                      : currentAIBrandType ? 'transparent' : currentTheme.toolbar.button.active,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: currentTheme.layout.background.color,
                    fontSize: '12px',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                  }}>
                    {message.sender === 'user' ? (
                      'U'
                    ) : currentAIBrandType ? (
                      <img
                        src={AIBrandLogoMapping[currentAIBrandType]}
                        alt={getAIBrandName()}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '50%',
                        }}
                      />
                    ) : (
                      'AI'
                    )}
                  </div>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: message.sender === 'user'
                      ? currentTheme.chart.candleUpColor + '20'
                      : currentTheme.toolbar.background,
                    border: `1px solid ${message.sender === 'user'
                      ? currentTheme.chart.candleUpColor + '30'
                      : currentTheme.toolbar.border + '30'}`,
                    color: currentTheme.layout.textColor,
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    animation: message.isLoading ? 'pulse 1.5s infinite' : 'none',
                  }}>
                    {message.content}
                    {message.isLoading && (
                      <span style={{ display: 'inline-block', marginLeft: '4px' }}>
                        <span style={{ animationDelay: '0s' }}>.</span>
                        <span style={{ animationDelay: '0.2s' }}>.</span>
                        <span style={{ animationDelay: '0.4s' }}>.</span>
                      </span>
                    )}
                  </div>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: currentTheme.toolbar.button.color,
                  opacity: 0.6,
                  marginTop: '4px',
                  marginLeft: message.sender === 'user' ? '0' : '36px',
                  marginRight: message.sender === 'user' ? '36px' : '0',
                }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <div style={{
        padding: '16px',
        borderTop: `1px solid ${currentTheme.toolbar.border}30`,
        background: currentTheme.layout.background.color,
      }}>
        <div style={{
          position: 'relative',
        }}>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={i18n === EN
              ? 'Ask about analysis... (Shift+Enter for new line)'
              : '输入关于V分析的问题... (Shift+Enter换行)'
            }
            disabled={isSending}
            style={{
              width: '100%',
              height: 'auto',
              minHeight: '60px',
              maxHeight: '200px',
              padding: '12px 48px 12px 12px',
              borderRadius: '8px',
              border: `1px solid ${currentTheme.toolbar.border}50`,
              background: currentTheme.toolbar.background,
              color: currentTheme.layout.textColor,
              fontSize: '14px',
              lineHeight: '1.5',
              resize: 'none',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s, height 0.2s',
              boxSizing: 'border-box',
              overflowY: 'auto',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = currentTheme.toolbar.button.active;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = currentTheme.toolbar.border + '50';
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending}
            style={{
              position: 'absolute',
              right: '12px',
              bottom: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: 'none',
              background: inputValue.trim() && !isSending
                ? currentTheme.toolbar.button.active
                : currentTheme.toolbar.button.backgroundColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputValue.trim() && !isSending ? 'pointer' : 'not-allowed',
              opacity: inputValue.trim() && !isSending ? 1 : 0.5,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (inputValue.trim() && !isSending) {
                e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (inputValue.trim() && !isSending) {
                e.currentTarget.style.background = currentTheme.toolbar.button.active;
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <SendIcon
              size={18}
              color={inputValue.trim() && !isSending
                ? currentTheme.layout.background.color
                : currentTheme.toolbar.button.color
              }
            />
          </button>
        </div>
        <div style={{
          fontSize: '11px',
          color: currentTheme.toolbar.button.color,
          opacity: 0.6,
          marginTop: '8px',
          textAlign: 'center',
        }}>
          {currentAIBrandType ? (
            i18n === EN
              ? `Powered by ${AIBrandNameMapping[currentAIBrandType]}`
              : `由 ${AIBrandNameMapping[currentAIBrandType]} 提供支持`
          ) : null}
          {selectedModel && ` - ${selectedModel}`}
        </div>
      </div>
      <style>
        {`
              .model-dropdown::-webkit-scrollbar { width: 8px; }
              .model-dropdown::-webkit-scrollbar-track { background: ${currentTheme.toolbar.background}; border-radius: 4px; margin: 4px 0; }
              .model-dropdown::-webkit-scrollbar-thumb {
               background: ${currentTheme.toolbar.button.color}40;
               border-radius: 4px;
               border: 2px solid ${currentTheme.layout.background.color};
               min-height: 40px;
               }
              .model-dropdown::-webkit-scrollbar-thumb:hover {
              background: ${currentTheme.toolbar.button.color}60;
              }
              .model-dropdown::-webkit-scrollbar-corner {
              background: transparent;
               }
               .modal-scrollbar::-webkit-scrollbar {
               width: 8px;
               }
               .modal-scrollbar::-webkit-scrollbar-track {
               background: ${currentTheme.toolbar.background};
               border-radius: 4px;
               margin: 4px 0;
               }
               .modal-scrollbar::-webkit-scrollbar-thumb {
               background: ${currentTheme.toolbar.button.color}40;
               border-radius: 4px;
               border: 2px solid ${currentTheme.layout.background.color};
               min-height: 40px;
               }
               .modal-scrollbar::-webkit-scrollbar-thumb:hover {
               background: ${currentTheme.toolbar.button.color}60;
               }
               @keyframes pulse {
               0%, 100% { opacity: 1; }
               50% { opacity: 0.5; }
               }
               textarea::placeholder { color: ${currentTheme.toolbar.button.color}60; }
               textarea::-webkit-scrollbar { width: 8px; }
               textarea::-webkit-scrollbar-track { background: ${currentTheme.toolbar.background}; border-radius: 4px; }
               textarea::-webkit-scrollbar-thumb { background: ${currentTheme.toolbar.button.color}40; border-radius: 4px; }
               textarea::-webkit-scrollbar-thumb:hover { background: ${currentTheme.toolbar.button.color}60; }
              `}
      </style>
    </div>
  );
};