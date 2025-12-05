import React, { useState, useRef, useEffect } from 'react';
import { I18n, EN } from '../I18n';
import { AIFunctionType, AIConfig } from './types';
import { ThemeConfig } from '../Theme';
import { CloseIcon, SendIcon } from '../Icons';

export interface AIChatBoxProps {
    currentTheme: ThemeConfig;
    i18n: I18n;
    currentAIFunctionType: AIFunctionType | null;
    aiconfigs: AIConfig[];
    onClose: () => void;
    onSendMessage: (message: string) => Promise<void>;
    isLoading?: boolean;
    initialMessage?: string;
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
    initialMessage = ''
}) => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const welcomeMessage = i18n === EN
            ? `Welcome to AI analysis. How can I help you?`
            : `欢迎使用AI分析。有什么可以帮助您的？`;
        setMessages([
            {
                id: 'welcome',
                content: welcomeMessage,
                sender: 'ai',
                timestamp: new Date()
            }
        ]);
    }, [currentAIFunctionType, aiconfigs, i18n]);

    useEffect(() => {
        const textarea = inputRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = `${newHeight}px`;
    }, [inputValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    const simulateAIResponse = async (userMessage: string): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        let response = '';
        if (i18n === EN) {
            response = `I've analyzed your query about "${userMessage}". Based on the chart data, I can provide insights about the current trend, key support and resistance levels, and potential trading opportunities.`;
        } else {
            response = `我已经分析了您关于"${userMessage}"的查询。根据图表数据，我可以提供关于当前趋势、关键支撑和阻力位以及潜在交易机会的洞察。`;

        }
        return response;
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
            content: i18n === EN ? 'Thinking...' : '思考中...',
            sender: 'ai',
            timestamp: new Date(),
            isLoading: true
        };
        setMessages(prev => [...prev, loadingMessage]);
        try {
            if (onSendMessage) {
                await onSendMessage(userMessage);
            }
            const aiResponse = await simulateAIResponse(userMessage);
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
        } catch (error) {
            setMessages(prev => {
                const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
                const errorMessage: AIMessage = {
                    id: (Date.now() + 2).toString(),
                    content: i18n === EN
                        ? 'Sorry, there was an error processing your request. Please try again.'
                        : '抱歉，处理您的请求时出错。请重试。',
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

    const getCurrentAIFunctionName = () => {
        return 'AI Assistant';
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
                        {getCurrentAIFunctionName()}
                    </span>
                </div>
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
                                            : currentTheme.toolbar.button.active,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        color: currentTheme.layout.background.color,
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                    }}>
                                        {message.sender === 'user' ? 'U' : 'AI'}
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
                            ? 'Type your message... (Shift+Enter for new line)'
                            : '输入消息... (Shift+Enter换行)'
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
                    {i18n === EN
                        ? `AI Assistant is ready`
                        : `AI助手准备就绪`
                    }
                </div>
            </div>
            <style>
                {`
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        textarea::placeholder {
            color: ${currentTheme.toolbar.button.color}60;
        }
        textarea::-webkit-scrollbar {
            width: 8px;
        }
        textarea::-webkit-scrollbar-track {
            background: ${currentTheme.toolbar.background};
            border-radius: 4px;
        }
        textarea::-webkit-scrollbar-thumb {
            background: ${currentTheme.toolbar.button.color}40;
            border-radius: 4px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
            background: ${currentTheme.toolbar.button.color}60;
        }
    `}
            </style>
        </div>
    );
};