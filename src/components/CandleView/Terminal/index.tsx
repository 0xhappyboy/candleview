import React, { useState, useRef, useEffect } from 'react';
import { ThemeConfig } from '../Theme';
import { I18n } from '../I18n';

export interface TerminalProps {
    currentTheme: ThemeConfig;
    i18n: I18n;
    onCommand?: (command: string) => void;
    placeholder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    showToolbar?: boolean;
    onToggle?: (show: boolean) => void;
    initialShow?: boolean;
}

interface CommandHistory {
    command: string;
    timestamp: number;
}

export const Terminal: React.FC<TerminalProps> = ({
    currentTheme,
    i18n,
    onCommand,
    placeholder = '',
    disabled = false,
    autoFocus = false,
    showToolbar = true,
    onToggle,
    initialShow = true,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    const [caretPosition, setCaretPosition] = useState(0);
    const [showTerminal, setShowTerminal] = useState(initialShow);
    const [terminalCommands, setTerminalCommands] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);
    const isEnglish = i18n.terminal.isEn === "en";

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

    const handleBuiltInCommands = (command: string) => {
        const cmd = command.toLowerCase();
        if (cmd === 'clear' || cmd === 'cls') {
            setTimeout(() => {
                setTerminalCommands([]);
                addOutputToDisplay(isEnglish ? 'Terminal cleared.' : '终端已清空。');
            }, 50);
        } else if (cmd === 'help') {
            addOutputToDisplay(isEnglish ?
                'Available commands: clear, help, theme [light|dark], history' :
                '可用命令: clear, help, theme [light|dark], history'
            );
        } else if (cmd.startsWith('theme ')) {
            const theme = command.split(' ')[1];
            addOutputToDisplay(isEnglish ?
                `Theme set to: ${theme}` :
                `主题设置为: ${theme}`
            );
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
            case 'ArrowUp':
                e.preventDefault();
                if (commandHistory.length > 0) {
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
                if (historyIndex > 0) {
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
                break;
            case 'Escape':
                e.preventDefault();
                setInputValue('');
                setHistoryIndex(-1);
                break;
            case 'l':
            case 'L':
                if (e.ctrlKey) {
                    e.preventDefault();
                    setInputValue('');
                    setHistoryIndex(-1);
                }
                break;
            case 'c':
            case 'C':
                if (e.ctrlKey) {
                    e.preventDefault();
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
                            color: currentTheme.toolbar.button.active,
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
                </div>
            )}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px 12px',
                fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
                fontSize: '12px',
                lineHeight: '1.4',
            }} className="terminal-scrollbar">
                {terminalCommands.map((cmd, index) => (
                    <div
                        key={index}
                        style={{
                            color: cmd.startsWith('$ ')
                                ? currentTheme.toolbar.button.active
                                : currentTheme.layout.textColor,
                            marginBottom: '4px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                        }}
                    >
                        {cmd}
                    </div>
                ))}
            </div>
            <div style={{
                padding: '8px 12px',
                borderTop: `1px solid ${currentTheme.toolbar.border}`,
            }}>
                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            minHeight: '28px',
                            backgroundColor: isFocused
                                ? currentTheme.toolbar.button.hover + '20'
                                : currentTheme.toolbar.background,
                            border: `1px solid ${isFocused
                                ? currentTheme.toolbar.button.active
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
                                color: currentTheme.toolbar.button.active,
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
                                    caretColor: currentTheme.toolbar.button.active,
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
        background: ${currentTheme.toolbar.button.color}40;
        border-radius: 4px;
        border: 2px solid ${currentTheme.panel.backgroundColor};
        min-height: 40px;
    }
    .terminal-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${currentTheme.toolbar.button.color}60;
    }
    .terminal-scrollbar::-webkit-scrollbar-corner {
        background: transparent;
    }
    `}
            </style>
        </div>
    );
};