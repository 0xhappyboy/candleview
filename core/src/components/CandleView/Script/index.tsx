import React, { useState, useRef, useEffect } from 'react';
import { I18n, EN } from '../I18n';
import { ThemeConfig } from '../Theme';
import { CloseIcon, SaveIcon, PlayIcon } from '../Icons';

export interface ScriptEditBoxProps {
    currentTheme: ThemeConfig;
    i18n: I18n;
    initialScript?: string;
    onClose: () => void;
    onSave: (script: string) => Promise<void>;
    onRun?: (script: string) => Promise<void>;
    isLoading?: boolean;
    scriptName?: string;
}

export const ScriptEditBox: React.FC<ScriptEditBoxProps> = ({
    currentTheme,
    i18n,
    initialScript = '',
    onClose,
    onSave,
    onRun,
    isLoading = false,
    scriptName = 'Untitled'
}) => {
    const [script, setScript] = useState(initialScript);
    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const adjustHeight = () => {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.max(textarea.scrollHeight, 200)}px`;
        };
        adjustHeight();
    }, [script]);

    const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScript(e.target.value);
    };

    const handleSave = async () => {
        if (!script.trim() || isSaving) return;
        setIsSaving(true);
        try {
            await onSave(script);
        } catch (error) {
        } finally {
            setIsSaving(false);
        }
    };

    const handleRun = async () => {
        if (!script.trim() || isRunning || !onRun) return;
        setIsRunning(true);
        try {
            await onRun(script);
        } catch (error) {
        } finally {
            setIsRunning(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleRun();
        }
    };

    const getLineNumbers = () => {
        const lines = script.split('\n');
        return lines.map((_, index) => index + 1).join('\n');
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
                    {onRun && (
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
                            {i18n === EN ? 'Run' : '运行'}
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
                    {i18n === EN ? 'Script Editor' : '脚本编辑器'}
                </span>
                <span style={{
                    fontSize: '11px',
                    opacity: 0.6,
                }}>
                    {script.split('\n').length} {i18n === EN ? 'lines' : '行'} |
                    {script.length} {i18n === EN ? 'chars' : '字符'}
                </span>
            </div>
            <div style={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <div style={{
                    width: '50px',
                    padding: '12px 0 12px 12px',
                    background: currentTheme.toolbar.background + '40',
                    borderRight: `1px solid ${currentTheme.toolbar.border}20`,
                    color: currentTheme.toolbar.button.color,
                    fontSize: '13px',
                    lineHeight: '1.5',
                    textAlign: 'right',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    userSelect: 'none',
                    opacity: 0.7,
                }}>
                    <pre style={{ margin: 0 }}>{getLineNumbers()}</pre>
                </div>
                <textarea
                    ref={textareaRef}
                    value={script}
                    onChange={handleScriptChange}
                    onKeyDown={handleKeyDown}
                    placeholder={i18n === EN
                        ? 'Write your script here...\n// Use Ctrl+S to save\n// Use Ctrl+Enter to run'
                        : '在此编写脚本...\n// 使用 Ctrl+S 保存\n// 使用 Ctrl+Enter 运行'
                    }
                    disabled={isSaving || isRunning}
                    style={{
                        flex: 1,
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
                    }}
                    spellCheck="false"
                />
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
                            ? (i18n === EN ? 'Running...' : '运行中...')
                            : (i18n === EN ? 'Ready' : '就绪')
                    }
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <span>Ctrl+S: {i18n === EN ? 'Save' : '保存'}</span>
                    {onRun && <span>Ctrl+Enter: {i18n === EN ? 'Run' : '运行'}</span>}
                </div>
            </div>

            <style>
                {`
          textarea::-webkit-scrollbar {
            width: 10px;
            height: 10px;
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
          textarea::placeholder {
            color: ${currentTheme.toolbar.button.color}60;
            font-style: italic;
          }
          .line-numbers::-webkit-scrollbar {
            width: 6px;
          }
          .line-numbers::-webkit-scrollbar-thumb {
            background: ${currentTheme.toolbar.button.color}30;
          }
        `}
            </style>
        </div>
    );
};