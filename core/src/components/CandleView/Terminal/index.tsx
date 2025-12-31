import React, { useState, useRef, useEffect } from 'react';
import { ThemeConfig } from '../Theme';
import { I18n } from '../I18n';
import { MainChartIndicatorType, SubChartIndicatorType } from '../types';
import {
    DEFAULT_BOLLINGER, DEFAULT_DONCHIAN, DEFAULT_EMA, DEFAULT_ENVELOPE, DEFAULT_HEATMAP,
    DEFAULT_ICHIMOKU, DEFAULT_MA, DEFAULT_MARKETPROFILE, DEFAULT_VWAP
} from '../Indicators/MainChart/MainChartIndicatorInfo';
import { CandleView } from '../CandleView';
import { CloseIcon } from '../Icons';

export interface TerminalProps {
    currentTheme: ThemeConfig;
    i18n: I18n;
    onCommand?: (command: string) => void;
    placeholder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    showToolbar?: boolean;
    initialShow?: boolean;
    // chart layer ref
    chartLayerRef: React.RefObject<any>;
    // cnalde view ref
    candleView: CandleView;
}

interface CommandHistory {
    command: string;
    timestamp: number;
}

const COMMAND_LIST = [
    'clear', 'cls', 'help', 'theme', 'history', 'open', 'close'
];

const INDICATOR_LIST = [
    ...Object.values(MainChartIndicatorType).map(ind => ind.toLowerCase().replace(/_/g, ' ')),
    ...Object.values(SubChartIndicatorType).map(ind => ind.toLowerCase().replace(/_/g, ' '))
];

export const Terminal: React.FC<TerminalProps> = ({
    currentTheme,
    i18n,
    onCommand,
    placeholder = '',
    disabled = false,
    autoFocus = false,
    showToolbar = true,
    initialShow = true,
    chartLayerRef,
    candleView
}) => {
    const [inputValue, setInputValue] = useState('');
    const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    const [caretPosition, setCaretPosition] = useState(0);
    const [showTerminal, setShowTerminal] = useState(initialShow);
    const [terminalCommands, setTerminalCommands] = useState<string[]>([]);
    const [isCloseHovered, setIsCloseHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);
    const isEnglish = i18n.terminal.isEn === "en";
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const welcomeMessage = isEnglish
            ? `🕯️ Welcome to CandleView Terminal v1.0 Type 'help' to see available commands 
This software is licensed under AGPL 3.0
Author: <a href="https://github.com/0xhappyboy" target="_blank" rel="noopener noreferrer">GitHub</a> · <a href="https://x.com/0xhappyboy_" target="_blank" rel="noopener noreferrer">X</a> · <a href="mailto:superhappyboy1995@gmail.com" target="_blank" rel="noopener noreferrer">Email</a>
GitHub: <a href="https://github.com/0xhappyboy/candleview" target="_blank" rel="noopener noreferrer">https://github.com/0xhappyboy/candleview</a>
License: <a href="https://github.com/0xhappyboy/candleview/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">https://github.com/0xhappyboy/candleview/blob/main/LICENSE</a>
Npm: <a href="https://www.npmjs.com/package/candleview" target="_blank" rel="noopener noreferrer">https://www.npmjs.com/package/candleview</a>`
            : `🕯️ 欢迎使用 CandleView 终端 v1.0 输入 'help' 查看可用命令
本软件采用 AGPL 3.0 开源许可
作者: <a href="https://github.com/0xhappyboy" target="_blank" rel="noopener noreferrer">GitHub</a> · <a href="https://x.com/0xhappyboy_" target="_blank" rel="noopener noreferrer">X</a> · <a href="mailto:superhappyboy1995@gmail.com" target="_blank" rel="noopener noreferrer">superhappyboy1995@gmail.com</a>
GitHub: <a href="https://github.com/0xhappyboy/candleview" target="_blank" rel="noopener noreferrer">https://github.com/0xhappyboy/candleview</a>
开源许可: <a href="https://github.com/0xhappyboy/candleview/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">https://github.com/0xhappyboy/candleview/blob/main/LICENSE</a>
Npm: <a href="https://www.npmjs.com/package/candleview" target="_blank" rel="noopener noreferrer">https://www.npmjs.com/package/candleview</a>`;
        setTerminalCommands([welcomeMessage]);
    }, [isEnglish]);

    useEffect(() => {
        if (!inputValue.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const input = inputValue.toLowerCase().trim();
        const words = input.split(' ');
        const lastWord = words[words.length - 1];
        let matchedSuggestions: string[] = [];
        if (words.length === 1) {
            matchedSuggestions = COMMAND_LIST.filter(cmd =>
                cmd.startsWith(lastWord)
            );
        } else if (words.length === 2) {
            const firstWord = words[0];
            if (firstWord === 'open' || firstWord === 'close') {
                matchedSuggestions = INDICATOR_LIST.filter(ind =>
                    ind.startsWith(lastWord)
                );
            } else if (firstWord === 'theme') {
                matchedSuggestions = ['light', 'dark'].filter(theme =>
                    theme.startsWith(lastWord)
                );
            }
        }
        matchedSuggestions = matchedSuggestions.slice(0, 5);
        setSuggestions(matchedSuggestions);
        setShowSuggestions(matchedSuggestions.length > 0);
        setSelectedSuggestionIndex(-1);
    }, [inputValue]);

    useEffect(() => {
        if (autoFocus && !disabled && showTerminal) {
            inputRef.current?.focus();
        }
    }, [autoFocus, disabled, showTerminal]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('terminal_command_history');
        if (savedHistory) {
            try {
                const history = JSON.parse(savedHistory);
                setCommandHistory(Array.isArray(history) ? history.slice(-50) : []);
            } catch (e) {
                setCommandHistory([]);
            }
        }
    }, []);

    const applySuggestion = (suggestion: string) => {
        const words = inputValue.split(' ');
        if (words.length === 0) return;
        words[words.length - 1] = suggestion;
        const newValue = words.join(' ');
        setInputValue(newValue);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.selectionStart = newValue.length;
                inputRef.current.selectionEnd = newValue.length;
                setCaretPosition(newValue.length);
            }
        }, 0);
    };

    const saveCommandToHistory = (command: string) => {
        if (!command.trim()) return;
        const newHistory: CommandHistory = {
            command,
            timestamp: Date.now(),
        };
        const updatedHistory = [...commandHistory, newHistory].slice(-100);
        setCommandHistory(updatedHistory);
        try {
            localStorage.setItem('terminal_command_history', JSON.stringify(updatedHistory));
        } catch (e) {
        }
    };

    const addCommandToDisplay = (command: string) => {
        setTerminalCommands(prev => [...prev, `$ ${command}`]);
    };

    const addOutputToDisplay = (output: string) => {
        setTerminalCommands(prev => [...prev, output]);
    };

    useEffect(() => {
        const terminalScroll = document.querySelector('.terminal-scrollbar');
        if (terminalScroll) {
            terminalScroll.scrollTop = terminalScroll.scrollHeight;
        }
    }, [terminalCommands]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedCommand = inputValue.trim();
        if (!trimmedCommand) return;
        addCommandToDisplay(trimmedCommand);
        if (onCommand) {
            onCommand(trimmedCommand);
        }
        handleBuiltInCommands(trimmedCommand);
        saveCommandToHistory(trimmedCommand);
        setInputValue('');
        setHistoryIndex(-1);
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        setTimeout(() => {
            const terminalScroll = document.querySelector('.terminal-scrollbar');
            if (terminalScroll) {
                terminalScroll.scrollTop = terminalScroll.scrollHeight;
            }
        }, 50);
        if (!disabled && showTerminal) {
            inputRef.current?.focus();
            setCaretPosition(0);
        }
    };

    // ================================ Main chart technical indicators start ================================
    const handleMAIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleSelectedMainChartIndicator && open) {
            const mainChartIndicatorInfo = {
                ...DEFAULT_MA,
                nonce: Date.now()
            };
            candleView.handleSelectedMainChartIndicator(mainChartIndicatorInfo);
        }
        if (chartLayerRef?.current && !open) {
            if (chartLayerRef?.current.handleRemoveIndicator) {
                chartLayerRef?.current.handleRemoveIndicator(MainChartIndicatorType.MA);
            }
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Moving Average (MA) indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}移动平均线(MA)指标`
        );
    };

    const handleEMAIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleSelectedMainChartIndicator && open) {
            const mainChartIndicatorInfo = {
                ...DEFAULT_EMA,
                nonce: Date.now()
            };
            candleView.handleSelectedMainChartIndicator(mainChartIndicatorInfo);
        }
        if (chartLayerRef?.current && !open) {
            if (chartLayerRef?.current.handleRemoveIndicator) {
                chartLayerRef?.current.handleRemoveIndicator(MainChartIndicatorType.EMA);
            }
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Exponential Moving Average (EMA) indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}指数移动平均线(EMA)指标`
        );
    };

    const handleBollingerIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleSelectedMainChartIndicator && open) {
            const mainChartIndicatorInfo = {
                ...DEFAULT_BOLLINGER,
                nonce: Date.now()
            };
            candleView.handleSelectedMainChartIndicator(mainChartIndicatorInfo);
        } if (chartLayerRef?.current && !open) {
            if (chartLayerRef?.current.handleRemoveIndicator) {
                chartLayerRef?.current.handleRemoveIndicator(MainChartIndicatorType.BOLLINGER);
            }
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Bollinger Bands indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}布林带(Bollinger)指标`
        );
    };

    const handleIchimokuIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleSelectedMainChartIndicator && open) {
            const mainChartIndicatorInfo = {
                ...DEFAULT_ICHIMOKU,
                nonce: Date.now()
            };
            candleView.handleSelectedMainChartIndicator(mainChartIndicatorInfo);
        }
        if (chartLayerRef?.current && !open) {
            if (chartLayerRef?.current.handleRemoveIndicator) {
                chartLayerRef?.current.handleRemoveIndicator(MainChartIndicatorType.ICHIMOKU);
            }
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Ichimoku Cloud indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}一目均衡表(Ichimoku)指标`
        );
    };

    const handleDonchianIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleSelectedMainChartIndicator && open) {
            const mainChartIndicatorInfo = {
                ...DEFAULT_DONCHIAN,
                nonce: Date.now()
            };
            candleView.handleSelectedMainChartIndicator(mainChartIndicatorInfo);
        }
        if (chartLayerRef?.current && !open) {
            if (chartLayerRef?.current.handleRemoveIndicator) {
                chartLayerRef?.current.handleRemoveIndicator(MainChartIndicatorType.BOLLINGER);
            }
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Donchian Channel indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}唐奇安通道(Donchian)指标`
        );
    };

    const handleEnvelopeIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleSelectedMainChartIndicator && open) {
            const mainChartIndicatorInfo = {
                ...DEFAULT_ENVELOPE,
                nonce: Date.now()
            };
            candleView.handleSelectedMainChartIndicator(mainChartIndicatorInfo);
        }
        if (chartLayerRef?.current && !open) {
            if (chartLayerRef?.current.handleRemoveIndicator) {
                chartLayerRef?.current.handleRemoveIndicator(MainChartIndicatorType.ENVELOPE);
            }
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Envelope indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}包络线(Envelope)指标`
        );
    };

    const handleVWAPIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleSelectedMainChartIndicator) {
            const mainChartIndicatorInfo = {
                ...DEFAULT_VWAP,
                nonce: Date.now()
            };
            candleView.handleSelectedMainChartIndicator(mainChartIndicatorInfo);
        }
        if (chartLayerRef?.current && !open) {
            if (chartLayerRef?.current.handleRemoveIndicator) {
                chartLayerRef?.current.handleRemoveIndicator(MainChartIndicatorType.VWAP);
            }
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Volume Weighted Average Price (VWAP) indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}成交量加权平均价(VWAP)指标`
        );
    };

    const handleHeatmapIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleSelectedMainChartIndicator) {
            const mainChartIndicatorInfo = {
                ...DEFAULT_HEATMAP,
                nonce: Date.now()
            };
            candleView.handleSelectedMainChartIndicator(mainChartIndicatorInfo);
        }
        if (chartLayerRef?.current && !open) {
            if (chartLayerRef?.current.handleRemoveIndicator) {
                chartLayerRef?.current.handleRemoveIndicator(MainChartIndicatorType.HEATMAP);
            }
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Heatmap indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}热力图(Heatmap)指标`
        );
    };

    const handleMarketProfileIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleSelectedMainChartIndicator) {
            const mainChartIndicatorInfo = {
                ...DEFAULT_MARKETPROFILE,
                nonce: Date.now()
            };
            candleView.handleSelectedMainChartIndicator(mainChartIndicatorInfo);
        }
        if (chartLayerRef?.current && !open) {
            if (chartLayerRef?.current.handleRemoveIndicator) {
                chartLayerRef?.current.handleRemoveIndicator(MainChartIndicatorType.MARKETPROFILE);
            }
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Market Profile indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}市场概况(Market Profile)指标`
        );
    };
    // ================================ Main chart technical indicators end ================================

    // ================================ Sub chart technical indicators start ================================
    const handleRSIIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleExternalSelectedSubChartIndicator && open) {
            candleView.handleExternalSelectedSubChartIndicator(SubChartIndicatorType.RSI);
        }
        if (candleView?.handleRemoveSubChartIndicator && !open) {
            candleView.handleRemoveSubChartIndicator(SubChartIndicatorType.RSI);
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Relative Strength Index (RSI) indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}相对强弱指数(RSI)指标`
        );
    };

    const handleMACDIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleExternalSelectedSubChartIndicator && open) {
            candleView.handleExternalSelectedSubChartIndicator(SubChartIndicatorType.MACD);
        }
        if (candleView?.handleRemoveSubChartIndicator && !open) {
            candleView.handleRemoveSubChartIndicator(SubChartIndicatorType.MACD);
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Moving Average Convergence Divergence (MACD) indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}指数平滑异同移动平均线(MACD)指标`
        );
    };

    const handleVolumeIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleExternalSelectedSubChartIndicator && open) {
            candleView.handleExternalSelectedSubChartIndicator(SubChartIndicatorType.VOLUME);
        }
        if (candleView?.handleRemoveSubChartIndicator && !open) {
            candleView.handleRemoveSubChartIndicator(SubChartIndicatorType.VOLUME);
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Volume indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}成交量(Volume)指标`
        );
    };

    const handleSARIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleExternalSelectedSubChartIndicator && open) {
            candleView.handleExternalSelectedSubChartIndicator(SubChartIndicatorType.SAR);
        }
        if (candleView?.handleRemoveSubChartIndicator && !open) {
            candleView.handleRemoveSubChartIndicator(SubChartIndicatorType.SAR);
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Parabolic SAR indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}抛物线转向(SAR)指标`
        );
    };

    const handleKDJIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleExternalSelectedSubChartIndicator && open) {
            candleView.handleExternalSelectedSubChartIndicator(SubChartIndicatorType.KDJ);
        }
        if (candleView?.handleRemoveSubChartIndicator && !open) {
            candleView.handleRemoveSubChartIndicator(SubChartIndicatorType.KDJ);
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} KDJ indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}随机指标(KDJ)`
        );
    };

    const handleATRIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleExternalSelectedSubChartIndicator && open) {
            candleView.handleExternalSelectedSubChartIndicator(SubChartIndicatorType.ATR);
        }
        if (candleView?.handleRemoveSubChartIndicator && !open) {
            candleView.handleRemoveSubChartIndicator(SubChartIndicatorType.ATR);
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Average True Range (ATR) indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}平均真实波幅(ATR)指标`
        );
    };

    const handleStochasticIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleExternalSelectedSubChartIndicator && open) {
            candleView.handleExternalSelectedSubChartIndicator(SubChartIndicatorType.STOCHASTIC);
        }
        if (candleView?.handleRemoveSubChartIndicator && !open) {
            candleView.handleRemoveSubChartIndicator(SubChartIndicatorType.STOCHASTIC);
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Stochastic Oscillator indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}随机震荡指标(Stochastic)`
        );
    };

    const handleCCIIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleExternalSelectedSubChartIndicator && open) {
            candleView.handleExternalSelectedSubChartIndicator(SubChartIndicatorType.CCI);
        }
        if (candleView?.handleRemoveSubChartIndicator && !open) {
            candleView.handleRemoveSubChartIndicator(SubChartIndicatorType.CCI);
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Commodity Channel Index (CCI) indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}商品通道指数(CCI)指标`
        );
    };

    const handleBBWidthIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleExternalSelectedSubChartIndicator && open) {
            candleView.handleExternalSelectedSubChartIndicator(SubChartIndicatorType.BBWIDTH);
        }
        if (candleView?.handleRemoveSubChartIndicator && !open) {
            candleView.handleRemoveSubChartIndicator(SubChartIndicatorType.BBWIDTH);
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Bollinger Bands Width (BBWIDTH) indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}布林带宽度(BBWIDTH)指标`
        );
    };

    const handleADXIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleExternalSelectedSubChartIndicator && open) {
            candleView.handleExternalSelectedSubChartIndicator(SubChartIndicatorType.ADX);
        }
        if (candleView?.handleRemoveSubChartIndicator && !open) {
            candleView.handleRemoveSubChartIndicator(SubChartIndicatorType.ADX);
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} Average Directional Index (ADX) indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}平均趋向指数(ADX)指标`
        );
    };

    const handleOBVIndicator = (open: boolean) => {
        const action = open ? '开启' : '关闭';
        const actionEn = open ? 'Opening' : 'Closing';
        if (candleView?.handleExternalSelectedSubChartIndicator && open) {
            candleView.handleExternalSelectedSubChartIndicator(SubChartIndicatorType.OBV);
        }
        if (candleView?.handleRemoveSubChartIndicator && !open) {
            candleView.handleRemoveSubChartIndicator(SubChartIndicatorType.OBV);
        }
        addOutputToDisplay(isEnglish ?
            `[<span style="color: #52c41a">INFO</span>] ${actionEn} On Balance Volume (OBV) indicator` :
            `[<span style="color: #52c41a">信息</span>] ${action}能量潮(OBV)指标`
        );
    };
    // ================================ Sub chart technical indicators end ================================

    const handleBuiltInCommands = (command: string) => {
        const cmd = command.toLowerCase().trim();
        if (cmd.startsWith('open ') || cmd.startsWith('close ')) {
            const [action, ...rest] = cmd.split(' ');
            const indicatorName = rest.join(' ').toUpperCase();
            const isMainChartIndicator = Object.values(MainChartIndicatorType).includes(indicatorName as MainChartIndicatorType);
            const isSubChartIndicator = Object.values(SubChartIndicatorType).includes(indicatorName as SubChartIndicatorType);
            if (!isMainChartIndicator && !isSubChartIndicator) {
                const mainList = Object.values(MainChartIndicatorType)
                    .map(ind => ind.toLowerCase().replace(/_/g, ' '))
                    .join(', ');
                const subList = Object.values(SubChartIndicatorType)
                    .map(ind => ind.toLowerCase().replace(/_/g, ' '))
                    .join(', ');
                addOutputToDisplay(isEnglish ?
                    `[<span style="color: #c41a1aff">ERROR</span>] Invalid indicator: "${indicatorName}".\nMain chart indicators: ${mainList}\nSub chart indicators: ${subList}` :
                    `[<span style="color: #c41a1aff">错误</span>] 无效的指标: "${indicatorName}"。\n主图指标: ${mainList}\n副图指标: ${subList}`
                );
                return;
            }
            const isOpen = action === 'open';
            if (isMainChartIndicator) {
                const indicatorType = indicatorName as MainChartIndicatorType;
                switch (indicatorType) {
                    case MainChartIndicatorType.MA:
                        handleMAIndicator(isOpen);
                        break;
                    case MainChartIndicatorType.EMA:
                        handleEMAIndicator(isOpen);
                        break;
                    case MainChartIndicatorType.BOLLINGER:
                        handleBollingerIndicator(isOpen);
                        break;
                    case MainChartIndicatorType.ICHIMOKU:
                        handleIchimokuIndicator(isOpen);
                        break;
                    case MainChartIndicatorType.DONCHIAN:
                        handleDonchianIndicator(isOpen);
                        break;
                    case MainChartIndicatorType.ENVELOPE:
                        handleEnvelopeIndicator(isOpen);
                        break;
                    case MainChartIndicatorType.VWAP:
                        handleVWAPIndicator(isOpen);
                        break;
                    case MainChartIndicatorType.HEATMAP:
                        handleHeatmapIndicator(isOpen);
                        break;
                    case MainChartIndicatorType.MARKETPROFILE:
                        handleMarketProfileIndicator(isOpen);
                        break;
                    default:
                        const displayName = indicatorName.toLowerCase().replace(/_/g, ' ');
                        const displayAction = action === 'open' ? '开启' : '关闭';
                        const actionEn = action === 'open' ? 'Opening' : 'Closing';
                        addOutputToDisplay(isEnglish ?
                            `[<span style="color: #52c41a">INFO</span>] ${actionEn} main chart indicator: ${displayName}` :
                            `[<span style="color: #52c41a">信息</span>] ${displayAction}主图指标: ${displayName}`
                        );
                        break;
                }
            } else if (isSubChartIndicator) {
                const indicatorType = indicatorName as SubChartIndicatorType;
                switch (indicatorType) {
                    case SubChartIndicatorType.RSI:
                        handleRSIIndicator(isOpen);
                        break;
                    case SubChartIndicatorType.MACD:
                        handleMACDIndicator(isOpen);
                        break;
                    case SubChartIndicatorType.VOLUME:
                        handleVolumeIndicator(isOpen);
                        break;
                    case SubChartIndicatorType.SAR:
                        handleSARIndicator(isOpen);
                        break;
                    case SubChartIndicatorType.KDJ:
                        handleKDJIndicator(isOpen);
                        break;
                    case SubChartIndicatorType.ATR:
                        handleATRIndicator(isOpen);
                        break;
                    case SubChartIndicatorType.STOCHASTIC:
                        handleStochasticIndicator(isOpen);
                        break;
                    case SubChartIndicatorType.CCI:
                        handleCCIIndicator(isOpen);
                        break;
                    case SubChartIndicatorType.BBWIDTH:
                        handleBBWidthIndicator(isOpen);
                        break;
                    case SubChartIndicatorType.ADX:
                        handleADXIndicator(isOpen);
                        break;
                    case SubChartIndicatorType.OBV:
                        handleOBVIndicator(isOpen);
                        break;
                    default:
                        const displayName = indicatorName.toLowerCase().replace(/_/g, ' ');
                        const displayAction = action === 'open' ? '开启' : '关闭';
                        const actionEn = action === 'open' ? 'Opening' : 'Closing';
                        addOutputToDisplay(isEnglish ?
                            `[<span style="color: #52c41a">INFO</span>] ${actionEn} sub chart indicator: ${displayName}` :
                            `[<span style="color: #52c41a">信息</span>] ${displayAction}副图指标: ${displayName}`
                        );
                        break;
                }
            }
            return;
        }
        if (cmd === 'clear' || cmd === 'cls') {
            setTimeout(() => {
                setTerminalCommands([]);
                addOutputToDisplay(isEnglish ? 'Terminal cleared.' : '终端已清空。');
            }, 50);
        } else if (cmd === 'help') {
            const mainIndicatorList = Object.values(MainChartIndicatorType)
                .map(ind => ind.toLowerCase().replace(/_/g, ' '))
                .join(', ');
            const subIndicatorList = Object.values(SubChartIndicatorType)
                .map(ind => ind.toLowerCase().replace(/_/g, ' '))
                .join(', ');
            addOutputToDisplay(isEnglish ?
                `Available commands:
  clear/cls - Clear terminal
  help - Show this help
  theme [light|dark] - Change theme
  history - Show command history
  open [indicator] - Open chart indicator
  close [indicator] - Close chart indicator
  
  Available main chart indicators: ${mainIndicatorList}
  Available sub chart indicators: ${subIndicatorList}` :
                `可用命令:
  clear/cls - 清空终端
  help - 显示帮助
  theme [light|dark] - 切换主题
  history - 显示命令历史
  open [指标] - 开启图表指标
  close [指标] - 关闭图表指标
  
  可用主图指标: ${mainIndicatorList}
  可用副图指标: ${subIndicatorList}`
            );
        } else if (cmd.startsWith('theme ')) {
            const theme = command.split(' ')[1];
            if (theme === 'dark' || theme === 'light') {
                candleView.setState({
                    currentTheme: candleView.getThemeConfig(theme),
                });
                candleView.handleThemeToggle();
                addOutputToDisplay(isEnglish ?
                    `[<span style="color: #52c41a">INFO</span>] Theme set to: ${theme}` :
                    `[<span style="color: #52c41a">信息</span>[] 主题设置为: ${theme}`
                );
            } else {
                addOutputToDisplay(isEnglish ?
                    `[<span style="color: #c41a1aff">ERROR</span>] Invalid theme: "${theme}". Available options: dark, light` :
                    `[<span style="color: #c41a1aff">错误</span>] 无效的主题: "${theme}"。可用选项: dark, light`
                );
            }
        } else if (cmd === 'history') {
            const historyText = commandHistory.slice(-5).map(h => h.command).join('\n');
            addOutputToDisplay(isEnglish ?
                `Recent commands:\n${historyText}` :
                `最近命令:\n${historyText}`
            );
        } else {
            addOutputToDisplay(isEnglish ?
                `Command executed: ${command}` :
                `命令已执行: ${command}`
            );
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
                e.stopPropagation();
                break;
            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                if (showSuggestions && suggestions.length > 0) {
                    // 在建议列表中向上导航
                    const newIndex = selectedSuggestionIndex > 0 ? selectedSuggestionIndex - 1 : suggestions.length - 1;
                    setSelectedSuggestionIndex(newIndex);
                } else if (commandHistory.length > 0) {
                    const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : 0;
                    setHistoryIndex(newIndex);
                    setInputValue(commandHistory[commandHistory.length - 1 - newIndex]?.command || '');
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.selectionStart = inputRef.current.value.length;
                            inputRef.current.selectionEnd = inputRef.current.value.length;
                            setCaretPosition(inputRef.current.value.length);
                        }
                    }, 0);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                if (showSuggestions && suggestions.length > 0) {
                    const newIndex = selectedSuggestionIndex < suggestions.length - 1 ? selectedSuggestionIndex + 1 : 0;
                    setSelectedSuggestionIndex(newIndex);
                } else if (historyIndex > 0) {
                    const newIndex = historyIndex - 1;
                    setHistoryIndex(newIndex);
                    setInputValue(commandHistory[commandHistory.length - 1 - newIndex]?.command || '');
                } else if (historyIndex === 0) {
                    setHistoryIndex(-1);
                    setInputValue('');
                }
                break;
            case 'Tab':
                e.preventDefault();
                e.stopPropagation();
                if (showSuggestions && suggestions.length > 0) {
                    const index = selectedSuggestionIndex >= 0 ? selectedSuggestionIndex : 0;
                    applySuggestion(suggestions[index]);
                }
                break;
            case 'Enter':
                if (showSuggestions && selectedSuggestionIndex >= 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    applySuggestion(suggestions[selectedSuggestionIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                setInputValue('');
                setHistoryIndex(-1);
                setShowSuggestions(false);
                break;
            case 'l':
            case 'L':
                if (e.ctrlKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    setInputValue('');
                    setHistoryIndex(-1);
                }
                break;
            case 'c':
            case 'C':
                if (e.ctrlKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    setInputValue('');
                    setHistoryIndex(-1);
                    if (onCommand) {
                        onCommand('^C');
                    }
                }
                break;
            default:
                setTimeout(() => {
                    if (inputRef.current) {
                        setCaretPosition(inputRef.current.selectionStart || 0);
                    }
                }, 0);
        }
    };

    const handleClearHistory = () => {
        localStorage.removeItem('terminal_command_history');
        setCommandHistory([]);
        setTerminalCommands([]);
        addOutputToDisplay(isEnglish ? 'History cleared.' : '历史记录已清除。');
    };

    return (
        <div
            ref={terminalRef}
            style={{
                borderTop: `1px solid ${currentTheme.toolbar.border}`,
                backgroundColor: currentTheme.panel.backgroundColor,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {showToolbar && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <span style={{
                            color: currentTheme.layout.textColor,
                            fontSize: '12px',
                            fontWeight: 500,
                            fontFamily: '"SF Mono", Monaco, monospace',
                        }}>
                            ⚡ {isEnglish ? 'Terminal' : '终端'}
                        </span>
                        <button
                            onClick={handleClearHistory}
                            style={{
                                fontSize: '11px',
                                color: currentTheme.toolbar.button.color,
                                backgroundColor: currentTheme.toolbar.button.backgroundColor,
                                border: `1px solid ${currentTheme.toolbar.border}`,
                                borderRadius: '4px',
                                padding: '2px 8px',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            {isEnglish ? 'Clear History' : '清除历史'}
                        </button>
                    </div>
                    <button
                        onClick={() => candleView?.closeTerminal()}
                        onMouseEnter={() => setIsCloseHovered(true)}
                        onMouseLeave={() => setIsCloseHovered(false)}
                        style={{
                            fontSize: '20px',
                            color: currentTheme.toolbar.button.color,
                            backgroundColor: isCloseHovered
                                ? currentTheme.toolbar.button.hover + '20'
                                : 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '30px',
                            height: '30px',
                            opacity: isCloseHovered ? 1 : 0.7,
                            transition: 'opacity 0.2s, background-color 0.2s',
                        }}
                        title={isEnglish ? 'Close Terminal' : '关闭终端'}
                    >
                        <CloseIcon size={30} color={currentTheme.toolbar.button.color} />
                    </button>
                </div>
            )}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px 12px',
                fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
                fontSize: '12px',
                lineHeight: '1.4',
                userSelect: 'text',
                WebkitUserSelect: 'text',
                MozUserSelect: 'text',
                msUserSelect: 'text',
            }} className="terminal-scrollbar">
                {terminalCommands.map((cmd, index) => (
                    <div
                        key={index}
                        style={{
                            color: currentTheme.layout.textColor,
                            marginBottom: '4px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            userSelect: 'text',
                            WebkitUserSelect: 'text',
                            MozUserSelect: 'text',
                            msUserSelect: 'text',
                            cursor: 'text',
                        }}
                        onClick={() => {
                            if (!disabled && showTerminal) {
                                inputRef.current?.focus();
                            }
                        }}
                        onMouseDown={(e) => {
                            if ((e.target as HTMLElement).tagName === 'A') {
                                e.stopPropagation();
                            }
                        }}
                        dangerouslySetInnerHTML={{ __html: cmd }}
                    />
                ))}
            </div>
            <div style={{
                padding: '8px 12px',
                borderTop: `1px solid ${currentTheme.toolbar.border}`,
            }}>
                <form onSubmit={handleSubmit}>
                    {showSuggestions && suggestions.length > 0 && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 'calc(28px + 8px + 8px + 8px + 1px)',
                                left: 0,
                                right: 0,
                                backgroundColor: currentTheme.panel.backgroundColor,
                                border: `1px solid ${currentTheme.toolbar.border}`,
                                borderRadius: '6px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                zIndex: 1000,
                                maxHeight: '200px',
                                overflowY: 'auto',
                                margin: '0 12px',
                            }}
                        >
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    onClick={() => applySuggestion(suggestion)}
                                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        backgroundColor: index === selectedSuggestionIndex
                                            ? currentTheme.toolbar.button.hover + '20'
                                            : 'transparent',
                                        color: currentTheme.layout.textColor,
                                        fontSize: '12px',
                                        fontFamily: '"SF Mono", Monaco, monospace',
                                        borderBottom: index < suggestions.length - 1
                                            ? `1px solid ${currentTheme.toolbar.border}`
                                            : 'none',
                                        transition: 'background-color 0.2s',
                                    }}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            minHeight: '28px',
                            backgroundColor: isFocused
                                ? currentTheme.toolbar.button.hover + '20'
                                : currentTheme.toolbar.background,
                            border: `1px solid ${isFocused
                                ? currentTheme.toolbar.border
                                : currentTheme.toolbar.border
                                }`,
                            borderRadius: '6px',
                            padding: '8px 12px',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            opacity: disabled ? 0.6 : 1,
                        }}
                    >
                        <span
                            style={{
                                color: currentTheme.layout.textColor,
                                marginRight: '8px',
                                userSelect: 'none',
                                flexShrink: 0,
                            }}
                        >
                            $
                        </span>
                        <div
                            style={{
                                flex: 1,
                                position: 'relative',
                                minWidth: 0,
                            }}
                        >
                            {!inputValue && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        color: currentTheme.toolbar.button.color + '60',
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                    }}
                                >
                                    {placeholder || (isEnglish ? 'Enter command...' : '输入命令...')}
                                </span>
                            )}
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    setHistoryIndex(-1);
                                    setCaretPosition(e.target.selectionStart || 0);
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                disabled={disabled}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: currentTheme.layout.textColor,
                                    fontFamily: 'inherit',
                                    fontSize: 'inherit',
                                    lineHeight: 'inherit',
                                    caretColor: currentTheme.layout.textColor,
                                    padding: 0,
                                    margin: 0,
                                }}
                                autoCapitalize="off"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                            />
                        </div>
                        {!disabled && (
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '4px',
                                    marginLeft: '12px',
                                    flexShrink: 0,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '11px',
                                        color: currentTheme.toolbar.button.color + '60',
                                        backgroundColor: currentTheme.toolbar.button.backgroundColor,
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        border: `1px solid ${currentTheme.toolbar.border}`,
                                        userSelect: 'none',
                                    }}
                                    title={isEnglish ? 'Clear (Ctrl+L)' : '清除 (Ctrl+L)'}
                                >
                                    ⌃L
                                </span>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        color: currentTheme.toolbar.button.color + '60',
                                        backgroundColor: currentTheme.toolbar.button.backgroundColor,
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        border: `1px solid ${currentTheme.toolbar.border}`,
                                        userSelect: 'none',
                                    }}
                                    title={isEnglish ? 'Cancel (Ctrl+C)' : '取消 (Ctrl+C)'}
                                >
                                    ⌃C
                                </span>
                            </div>
                        )}
                    </div>
                </form>
            </div>
            <style>
                {`
    .terminal-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    .terminal-scrollbar::-webkit-scrollbar-track {
        background: ${currentTheme.toolbar.background};
        border-radius: 4px;
        margin: 4px 0;
    }
    .terminal-scrollbar::-webkit-scrollbar-thumb {
        background: ${currentTheme.panel.borderColor}80;
        border-radius: 4px;
        border: 2px solid ${currentTheme.panel.borderColor};
        min-height: 40px;
    }
    .terminal-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${currentTheme.toolbar.button.color}60;
    }
    .terminal-scrollbar::-webkit-scrollbar-corner {
        background: transparent;
    }
    .terminal-scrollbar a {
        color: ${currentTheme.layout.textColor || '#4dabf7'} !important;
        text-decoration: none;
        cursor: pointer;
    }
    
    .terminal-scrollbar a:hover {
        text-decoration: underline;
    }
    `}
            </style>
        </div>
    );
};