import React, { useState, useRef, useEffect } from 'react';
import { I18n, EN } from '../I18n';
import { ThemeConfig } from '../Theme';
import { CloseIcon, SaveIcon, PlayIcon, ClearIcon } from '../Icons';

export interface ScriptEditBoxProps {
    currentTheme: ThemeConfig;
    i18n: I18n;
    initialScript?: string;
    onClose: () => void;
    onSave: (script: string) => Promise<void>;
    onRun?: (script: string) => Promise<void>;
    isLoading?: boolean;
    scriptName?: string;
    scriptContext?: Record<string, any>;
}

interface ConsoleEntry {
    id: number;
    type: 'log' | 'info' | 'warn' | 'error' | 'result' | 'system';
    content: string;
    timestamp: Date;
}

class ScriptConsole {
    private entries: ConsoleEntry[] = [];
    private entryId = 0;
    private onLogCallback: (entry: ConsoleEntry) => void;

    constructor(onLogCallback: (entry: ConsoleEntry) => void) {
        this.onLogCallback = onLogCallback;
    }

    private addEntry(type: ConsoleEntry['type'], ...args: any[]) {
        const content = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
        const entry: ConsoleEntry = {
            id: ++this.entryId,
            type,
            content,
            timestamp: new Date()
        };
        this.entries.push(entry);
        this.onLogCallback(entry);
    }
    log(...args: any[]) {
        this.addEntry('log', ...args);
    }
    info(...args: any[]) {
        this.addEntry('info', ...args);
    }
    warn(...args: any[]) {
        this.addEntry('warn', ...args);
    }
    error(...args: any[]) {
        this.addEntry('error', ...args);
    }
    clear() {
        this.entries = [];
    }
    getEntries() {
        return [...this.entries];
    }
}

export const ScriptEditBox: React.FC<ScriptEditBoxProps> = ({
    currentTheme,
    i18n,
    initialScript = '',
    onClose,
    onSave,
    onRun,
    isLoading = false,
    scriptName = 'Untitled',
    scriptContext = {}
}) => {
    const [script, setScript] = useState(initialScript);
    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [splitRatio, setSplitRatio] = useState(0.7);
    const [isDragging, setIsDragging] = useState(false);
    const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const consoleRef = useRef<HTMLDivElement>(null);
    const scriptConsoleRef = useRef<ScriptConsole | null>(null);

    useEffect(() => {
        scriptConsoleRef.current = new ScriptConsole((entry) => {
            setConsoleEntries(prev => [...prev, entry]);
        });
    }, []);

    const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScript(e.target.value);
    };

    const handleSave = async () => {
        if (!script.trim() || isSaving) return;
        setIsSaving(true);
        try {
            await onSave(script);
        } catch (error: any) {
            addErrorMessage(i18n === EN ? `Save failed: ${error.message}` : `保存失败: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRun = async () => {
        if (!script.trim() || isRunning) return;

        setIsRunning(true);
        clearConsole();

        try {
            if (onRun) {
                await onRun(script);
            } else {
                const func = new Function(script);
                func();
            }
        } catch (error: any) {
            addErrorMessage(i18n === EN ? `Execution failed: ${error.message}` : `执行失败: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleRun();
        }
    };

    const entryIdCounter = useRef(0);
    const addSystemMessage = (message: string) => {
        const entry: ConsoleEntry = {
            id: ++entryIdCounter.current,
            type: 'system',
            content: message,
            timestamp: new Date()
        };
        setConsoleEntries(prev => [...prev, entry]);
    };

    const addErrorMessage = (message: string) => {
        const entry: ConsoleEntry = {
            id: ++entryIdCounter.current,
            type: 'error',
            content: message,
            timestamp: new Date()
        };
        setConsoleEntries(prev => [...prev, entry]);
    };

    const clearConsole = () => {
        setConsoleEntries([]);
        scriptConsoleRef.current?.clear();
    };

    const handleSplitterMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const containerHeight = containerRect.height;
            const offsetY = e.clientY - containerRect.top;
            const newRatio = Math.max(0.2, Math.min(0.8, offsetY / containerHeight));
            setSplitRatio(newRatio);
        };
        const handleMouseUp = () => {
            setIsDragging(false);
        };
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [consoleEntries]);

    const editorHeight = `${splitRatio * 100}%`;
    const consoleHeight = `${(1 - splitRatio) * 100}%`;
    const getEntryStyle = (type: ConsoleEntry['type']): React.CSSProperties => {
        switch (type) {
            case 'log':
                return { color: currentTheme.layout.textColor };
            case 'info':
                return { color: '#3498db' };
            case 'warn':
                return { color: '#f39c12', fontWeight: '500' };
            case 'error':
                return { color: '#e74c3c', fontWeight: '500' };
            case 'system':
                return {
                    color: currentTheme.chart.candleUpColor,
                    fontWeight: '600',
                    backgroundColor: currentTheme.chart.candleUpColor + '10',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    margin: '4px 0'
                };
            case 'result':
                return {
                    color: currentTheme.toolbar.button.active,
                    fontWeight: '500',
                    backgroundColor: currentTheme.toolbar.button.active + '10',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    margin: '4px 0'
                };
            default:
                return { color: currentTheme.layout.textColor };
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
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
                        {scriptName}
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    {onRun ? (
                        <button
                            onClick={() => {
                                if (!script.trim() || isRunning) return;
                                setIsRunning(true);
                                setConsoleEntries([]);
                                try {
                                    const originalConsole = {
                                        log: console.log,
                                        info: console.info,
                                        warn: console.warn,
                                        error: console.error
                                    };
                                    const consoleProxy = new Proxy(originalConsole, {
                                        get(target, prop) {
                                            if (prop === 'log') {
                                                return (...args: any[]) => {
                                                    scriptConsoleRef.current?.log(...args);
                                                    originalConsole.log(...args);
                                                };
                                            } else if (prop === 'info') {
                                                return (...args: any[]) => {
                                                    scriptConsoleRef.current?.info(...args);
                                                    originalConsole.info(...args);
                                                };
                                            } else if (prop === 'warn') {
                                                return (...args: any[]) => {
                                                    scriptConsoleRef.current?.warn(...args);
                                                    originalConsole.warn(...args);
                                                };
                                            } else if (prop === 'error') {
                                                return (...args: any[]) => {
                                                    scriptConsoleRef.current?.error(...args);
                                                    originalConsole.error(...args);
                                                };
                                            }
                                            return (target as any)[prop];
                                        }
                                    });
                                    const originalWindowConsole = (window as any).console;
                                    (window as any).console = consoleProxy;
                                    const func = new Function(script);
                                    func();
                                    (window as any).console = originalWindowConsole;
                                } catch (error: any) {
                                    (window as any).console = window.console;
                                    scriptConsoleRef.current?.error(i18n === EN ? `❌ Error: ${error.message}` : `❌ 错误: ${error.message}`);
                                } finally {
                                    setIsRunning(false);
                                }
                            }}
                            disabled={!script.trim() || isRunning}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: currentTheme.toolbar.button.active,
                                color: currentTheme.layout.background.color,
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: script.trim() && !isRunning ? 'pointer' : 'not-allowed',
                                opacity: script.trim() && !isRunning ? 1 : 0.6,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <PlayIcon size={14} />
                            {isRunning ? (i18n === EN ? 'Running...' : '运行中...') : (i18n === EN ? 'Run' : '运行')}
                        </button>
                    ) : (
                        <button
                            onClick={handleRun}
                            disabled={!script.trim() || isRunning}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: currentTheme.toolbar.button.active,
                                color: currentTheme.layout.background.color,
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: script.trim() && !isRunning ? 'pointer' : 'not-allowed',
                                opacity: script.trim() && !isRunning ? 1 : 0.6,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (script.trim() && !isRunning) {
                                    e.currentTarget.style.opacity = '0.9';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (script.trim() && !isRunning) {
                                    e.currentTarget.style.opacity = '1';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            <PlayIcon size={14} />
                            {isRunning
                                ? (i18n === EN ? 'Running...' : '运行中...')
                                : (i18n === EN ? 'Run' : '运行')
                            }
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!script.trim() || isSaving}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: currentTheme.chart.candleUpColor,
                            color: currentTheme.layout.background.color,
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: script.trim() && !isSaving ? 'pointer' : 'not-allowed',
                            opacity: script.trim() && !isSaving ? 1 : 0.6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (script.trim() && !isSaving) {
                                e.currentTarget.style.opacity = '0.9';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (script.trim() && !isSaving) {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        <SaveIcon size={14} />
                        {isSaving
                            ? (i18n === EN ? 'Saving...' : '保存中...')
                            : (i18n === EN ? 'Save' : '保存')
                        }
                    </button>
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
            </div>
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
                <span>
                    {i18n === EN ? 'JavaScript Editor' : 'JavaScript 编辑器'}
                </span>
                <span style={{
                    fontSize: '11px',
                    opacity: 0.6,
                }}>
                    {script.split('\n').length} {i18n === EN ? 'lines' : '行'} |
                    {script.length} {i18n === EN ? 'chars' : '字符'}
                </span>
            </div>
            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <div style={{
                    height: editorHeight,
                    overflow: 'hidden',
                    position: 'relative',
                }}>
                    <textarea
                        ref={textareaRef}
                        value={script}
                        onChange={handleScriptChange}
                        onKeyDown={handleKeyDown}
                        placeholder={i18n === EN
                            ? '// Write JavaScript code here...\n// Use console.log() for output\n// Example:\nconsole.log("Hello, World!");\nconst x = 5 + 3;\nconsole.log("Result:", x);\n\n// Available objects: console, Math, Date, JSON\n// Custom context: ' + Object.keys(scriptContext).join(', ')
                            : `// 在此编写 JavaScript 代码...\n// 使用 console.log() 输出\n// 示例：\nconsole.log("你好，世界！");\nconst x = 5 + 3;\nconsole.log("结果:", x);\n\n// 可用对象：console, Math, Date, JSON\n// 自定义上下文：${Object.keys(scriptContext).join(', ')}`
                        }
                        disabled={isSaving || isRunning}
                        style={{
                            width: '100%',
                            height: '100%',
                            padding: '12px',
                            border: 'none',
                            background: currentTheme.layout.background.color,
                            color: currentTheme.layout.textColor,
                            fontSize: '14px',
                            lineHeight: '1.5',
                            fontFamily: 'monospace',
                            resize: 'none',
                            outline: 'none',
                            whiteSpace: 'pre',
                            overflowWrap: 'normal',
                            overflowX: 'auto',
                            overflowY: 'auto',
                            tabSize: 2,
                            boxSizing: 'border-box',
                        }}
                        spellCheck="false"
                    />
                </div>
                <div
                    onMouseDown={handleSplitterMouseDown}
                    style={{
                        height: '8px',
                        cursor: 'row-resize',
                        backgroundColor: isDragging
                            ? currentTheme.divider.dragging
                            : currentTheme.divider.normal,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={() => {
                        if (!isDragging) {
                            const element = document.getElementById('script-splitter');
                            if (element) {
                                element.style.backgroundColor = currentTheme.divider.hover;
                            }
                        }
                    }}
                    onMouseLeave={() => {
                        if (!isDragging) {
                            const element = document.getElementById('script-splitter');
                            if (element) {
                                element.style.backgroundColor = currentTheme.divider.normal;
                            }
                        }
                    }}
                    id="script-splitter"
                >
                    <div style={{
                        width: '40px',
                        height: '2px',
                        backgroundColor: currentTheme.toolbar.button.color + '60',
                        borderRadius: '1px',
                    }} />
                </div>
                <div style={{
                    height: consoleHeight,
                    minHeight: '20%',
                    background: currentTheme.layout.background.color,
                    borderTop: `1px solid ${currentTheme.toolbar.border}20`,
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{
                        padding: '8px 16px',
                        background: currentTheme.toolbar.background + '80',
                        borderBottom: `1px solid ${currentTheme.toolbar.border}20`,
                        fontSize: '12px',
                        fontWeight: '600',
                        color: currentTheme.layout.textColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <span>
                            {i18n === EN ? 'Console' : '控制台'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                fontSize: '11px',
                                opacity: 0.6,
                                fontFamily: 'monospace',
                            }}>
                                {consoleEntries.length} {i18n === EN ? 'messages' : '条消息'}
                            </span>
                            <button
                                onClick={clearConsole}
                                style={{
                                    padding: '2px 8px',
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: currentTheme.toolbar.button.hover,
                                    color: currentTheme.toolbar.button.color,
                                    cursor: 'pointer',
                                    opacity: 0.7,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = '0.7';
                                }}
                            >
                                <ClearIcon size={12} />
                                {i18n === EN ? 'Clear' : '清空'}
                            </button>
                        </div>
                    </div>
                    <div
                        ref={consoleRef}
                        style={{
                            flex: 1,
                            padding: '12px',
                            overflow: 'auto',
                            color: currentTheme.layout.textColor,
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: '1.4',
                        }}
                    >
                        {consoleEntries.length === 0 ? (
                            <div style={{
                                opacity: 0.6,
                                fontStyle: 'italic',
                                color: currentTheme.toolbar.button.color + '80',
                                padding: '8px 0',
                            }}>
                                {i18n === EN
                                    ? '// Console output will appear here...\n// Use console.log() in your script to see output here.\n// Press Ctrl+Enter or click Run to execute the script.'
                                    : '// 控制台输出将显示在这里...\n// 在脚本中使用 console.log() 来查看输出。\n// 按 Ctrl+Enter 或点击运行按钮执行脚本。'
                                }
                            </div>
                        ) : (
                            consoleEntries.map((entry) => (
                                <div
                                    key={entry.id}
                                    style={{
                                        ...getEntryStyle(entry.type),
                                        padding: '2px 0',
                                        borderBottom: `1px solid ${currentTheme.toolbar.border}10`,
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    <span style={{
                                        opacity: 0.5,
                                        fontSize: '11px',
                                        marginRight: '8px',
                                        fontFamily: 'monospace',
                                    }}>
                                        [{formatTime(entry.timestamp)}]
                                    </span>
                                    {entry.type === 'log' && '> '}
                                    {entry.type === 'info' && 'ℹ '}
                                    {entry.type === 'warn' && '⚠ '}
                                    {entry.type === 'error' && '✗ '}
                                    {entry.content}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <div style={{
                padding: '8px 16px',
                borderTop: `1px solid ${currentTheme.toolbar.border}30`,
                background: currentTheme.toolbar.background,
                fontSize: '11px',
                color: currentTheme.toolbar.button.color,
                opacity: 0.7,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div>
                    {isSaving
                        ? (i18n === EN ? 'Saving...' : '保存中...')
                        : isRunning
                            ? (i18n === EN ? 'Executing script...' : '正在执行脚本...')
                            : (i18n === EN ? 'Ready' : '就绪')
                    }
                </div>
                <div style={{ display: 'flex', gap: '12px', fontFamily: 'monospace' }}>
                    <span>Ctrl+S: {i18n === EN ? 'Save' : '保存'}</span>
                    <span>Ctrl+Enter: {i18n === EN ? 'Run' : '运行'}</span>
                </div>
            </div>
            <style>
                {`
          textarea::-webkit-scrollbar {
            width: 12px;
            height: 12px;
          }
          textarea::-webkit-scrollbar-track {
            background: ${currentTheme.toolbar.background};
            border-radius: 4px;
          }
          textarea::-webkit-scrollbar-thumb {
            background: ${currentTheme.toolbar.button.color}40;
            border-radius: 4px;
            border: 2px solid ${currentTheme.layout.background.color};
          }
          textarea::-webkit-scrollbar-thumb:hover {
            background: ${currentTheme.toolbar.button.color}60;
          }
          .console-scrollbar::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          .console-scrollbar::-webkit-scrollbar-track {
            background: ${currentTheme.toolbar.background}40;
            border-radius: 4px;
          }
          .console-scrollbar::-webkit-scrollbar-thumb {
            background: ${currentTheme.toolbar.button.color}40;
            border-radius: 4px;
          }
          .console-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${currentTheme.toolbar.button.color}60;
          }
          textarea::placeholder {
            color: ${currentTheme.toolbar.button.color}60;
            font-style: italic;
          }
          textarea {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.5;
            letter-spacing: normal;
          }
          body.user-select-none {
            user-select: none;
            -webkit-user-select: none;
            cursor: row-resize !important;
          }
        `}
            </style>
        </div>
    );
};