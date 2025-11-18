import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ThemeConfig } from '../CandleViewTheme';
import { I18n } from '../I18n';

interface SystemSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (settings: any) => void;
    initialSettings?: any;
    theme?: ThemeConfig;
    parentRef?: React.RefObject<HTMLDivElement | null>;
    candleViewContainerRef?: React.RefObject<HTMLDivElement | null>;
    i18n: I18n;
}

interface SettingSection {
    id: string;
    title: string;
    icon?: string;
    component: React.ComponentType<SettingSectionProps>;
}

interface SettingSectionProps {
    settings: any;
    onSettingsChange: (settings: any) => void;
    theme: ThemeConfig;
    i18n: I18n;
}

const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialSettings = {},
    theme,
    parentRef,
    candleViewContainerRef,
    i18n
}) => {
    const [settings, setSettings] = useState<any>(initialSettings);
    const [activeSection, setActiveSection] = useState<string>('general');
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    const settingSections: SettingSection[] = [
        {
            id: 'general',
            title: i18n.systemSettings.general,
            icon: '⚙️',
            component: GeneralSettings
        },
        {
            id: 'appearance',
            title: i18n.systemSettings.appearance,
            icon: '🎨',
            component: AppearanceSettings
        },
        {
            id: 'chart',
            title: i18n.systemSettings.chart,
            icon: '📊',
            component: ChartSettings
        },
        {
            id: 'performance',
            title: i18n.systemSettings.performance,
            icon: '🚀',
            component: PerformanceSettings
        },
        {
            id: 'shortcuts',
            title: i18n.systemSettings.shortcuts,
            icon: '⌨️',
            component: ShortcutSettings
        }
    ];

    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings, isOpen]);

    useEffect(() => {
        if (isOpen) {
            const calculatePosition = () => {
                const containerRef = candleViewContainerRef || parentRef;
                if (containerRef?.current) {
                    const containerRect = containerRef.current.getBoundingClientRect();
                    const modalWidth = 800;
                    const modalHeight = 600;
                    const x = containerRect.left + (containerRect.width - modalWidth) / 2;
                    const y = containerRect.top + (containerRect.height - modalHeight) / 2;
                    const maxX = window.innerWidth - modalWidth - 10;
                    const maxY = window.innerHeight - modalHeight - 10;
                    return {
                        x: Math.max(10, Math.min(x, maxX)),
                        y: Math.max(10, Math.min(y, maxY))
                    };
                } else {
                    const x = Math.max(10, (window.innerWidth - 800) / 2);
                    const y = Math.max(10, (window.innerHeight - 600) / 2);
                    return { x, y };
                }
            };
            requestAnimationFrame(() => {
                setModalPosition(calculatePosition());
            });
        }
    }, [isOpen, parentRef, candleViewContainerRef]);

    const handleSettingsChange = (newSettings: any) => {
        setSettings((prev: any) => ({ ...prev, ...newSettings }));
    };

    const handleConfirm = () => {
        onConfirm(settings);
    };

    const handleCancel = () => {
        setSettings(initialSettings);
        onClose();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === headerRef.current || headerRef.current?.contains(e.target as Node)) {
            setIsDragging(true);
            const rect = modalRef.current!.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
            e.preventDefault();
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                const maxX = window.innerWidth - 800;
                const maxY = window.innerHeight - 600;
                setModalPosition({
                    x: Math.max(10, Math.min(newX, maxX)),
                    y: Math.max(10, Math.min(newY, maxY))
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleConfirm();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const ActiveSectionComponent = settingSections.find(section => section.id === activeSection)?.component;

    const scrollbarStyle: React.CSSProperties = {
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme?.toolbar?.border || '#d9d9d9'} ${theme?.toolbar?.background || '#fafafa'}`,
    };

    const webkitScrollbarStyle = `
        .settings-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .settings-scrollbar::-webkit-scrollbar-track {
            background: ${theme?.toolbar?.background || '#fafafa'};
            border-radius: 3px;
        }
        .settings-scrollbar::-webkit-scrollbar-thumb {
            background: ${theme?.toolbar?.border || '#d9d9d9'};
            border-radius: 3px;
        }
        .settings-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${theme?.modal?.textColor || '#000000'}80;
        }
    `;

    const modalContentStyle: React.CSSProperties = {
        position: 'fixed',
        left: `${modalPosition.x}px`,
        top: `${modalPosition.y}px`,
        background: theme?.toolbar?.background || '#fafafa',
        border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
        borderRadius: '8px',
        padding: '0',
        width: '800px',
        maxWidth: '90vw',
        height: '600px',
        maxHeight: '80vh',
        zIndex: 10000,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: isDragging ? 'none' : 'auto',
        display: 'flex',
        flexDirection: 'column',
    };

    const modalHeaderStyle: React.CSSProperties = {
        padding: '16px 16px 12px 16px',
        borderBottom: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
        cursor: 'grab',
        userSelect: 'none',
        flexShrink: 0,
    };

    const modalTitleStyle: React.CSSProperties = {
        fontSize: '16px',
        fontWeight: 'bold',
        color: theme?.modal?.textColor || '#000000',
        margin: 0,
    };

    const modalBodyStyle: React.CSSProperties = {
        padding: '0',
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
    };

    const sidebarStyle: React.CSSProperties = {
        width: '200px',
        background: theme?.panel?.backgroundColor || '#f5f5f5',
        borderRight: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
        padding: '16px 0',
        overflowY: 'auto',
        ...scrollbarStyle,
    };

    const contentStyle: React.CSSProperties = {
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        ...scrollbarStyle,
    };

    const sidebarItemStyle = (isActive: boolean): React.CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: isActive ? (theme?.toolbar?.button?.active || '#2962FF') : 'transparent',
        border: 'none',
        color: isActive ? (theme?.toolbar?.button?.activeTextColor || '#ffffff') : (theme?.modal?.textColor || '#000000'),
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: isActive ? '600' : '400',
        transition: 'all 0.2s ease',
        width: '100%',
        textAlign: 'left',
    });

    const modalActionsStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        padding: '16px 24px',
        borderTop: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
        flexShrink: 0,
    };

    const cancelButtonStyle: React.CSSProperties = {
        background: 'transparent',
        color: theme?.modal?.textColor || '#000000',
        border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
        borderRadius: '4px',
        padding: '8px 16px',
        fontSize: '14px',
        cursor: 'pointer',
    };

    const confirmButtonStyle: React.CSSProperties = {
        background: theme?.toolbar?.button?.active || '#2962FF',
        color: theme?.toolbar?.button?.activeTextColor || '#ffffff',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        fontSize: '14px',
        cursor: 'pointer',
    };

    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'transparent',
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <>
            <style>{webkitScrollbarStyle}</style>
            <div
                style={modalOverlayStyle}
                onClick={handleOverlayClick}
            >
                <div
                    ref={modalRef}
                    style={modalContentStyle}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={handleMouseDown}
                    onKeyDown={handleKeyPress}
                >
                    <div
                        ref={headerRef}
                        style={modalHeaderStyle}
                    >
                        <div style={modalTitleStyle}>{i18n.systemSettings.title}</div>
                    </div>

                    <div style={modalBodyStyle}>
                        <div style={sidebarStyle} className="settings-scrollbar">
                            {settingSections.map(section => (
                                <button
                                    key={section.id}
                                    style={sidebarItemStyle(activeSection === section.id)}
                                    onClick={() => setActiveSection(section.id)}
                                    onMouseEnter={(e) => {
                                        if (activeSection !== section.id) {
                                            e.currentTarget.style.background = theme?.toolbar?.button?.hover || 'rgba(0,0,0,0.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activeSection !== section.id) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    <span style={{ fontSize: '16px' }}>{section.icon}</span>
                                    <span>{section.title}</span>
                                </button>
                            ))}
                        </div>
                        <div style={contentStyle} className="settings-scrollbar">
                            {ActiveSectionComponent && (
                                <ActiveSectionComponent
                                    settings={settings}
                                    onSettingsChange={handleSettingsChange}
                                    theme={theme!}
                                    i18n={i18n}
                                />
                            )}
                        </div>
                    </div>
                    <div style={modalActionsStyle}>
                        <button
                            onClick={handleCancel}
                            style={cancelButtonStyle}
                            type="button"
                        >
                            {i18n.systemSettings.cancel}
                        </button>
                        <button
                            onClick={handleConfirm}
                            style={confirmButtonStyle}
                            type="button"
                        >
                            {i18n.systemSettings.saveSettings}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

const GeneralSettings: React.FC<SettingSectionProps> = ({ settings, onSettingsChange, theme, i18n }) => {
    return (
        <div>
            <h3 style={{ color: theme?.modal?.textColor, marginBottom: '20px' }}>{i18n.systemSettings.general}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SettingItem
                    label={i18n.systemSettings.language}
                    description={i18n.settingsDescriptions.language}
                    theme={theme}
                >
                    <select
                        style={{
                            width: '200px',
                            padding: '8px',
                            border: `1px solid ${theme.toolbar?.border || '#d9d9d9'}`,
                            borderRadius: '4px',
                            background: theme.toolbar?.background,
                            color: theme?.modal?.textColor,
                        }}
                        value={settings.language || 'zh-CN'}
                        onChange={(e) => onSettingsChange({ language: e.target.value })}
                    >
                        <option value="zh-CN">{i18n.options.zhCN}</option>
                        <option value="en-US">{i18n.options.enUS}</option>
                        <option value="ja-JP">{i18n.options.jaJP}</option>
                    </select>
                </SettingItem>

                <SettingItem
                    label={i18n.systemSettings.timezone}
                    description={i18n.settingsDescriptions.timezone}
                    theme={theme}
                >
                    <select
                        style={{
                            width: '200px',
                            padding: '8px',
                            border: `1px solid ${theme.toolbar?.border || '#d9d9d9'}`,
                            borderRadius: '4px',
                            background: theme.toolbar?.background,
                            color: theme?.modal?.textColor,
                        }}
                        value={settings.timezone || 'Asia/Shanghai'}
                        onChange={(e) => onSettingsChange({ timezone: e.target.value })}
                    >
                        <option value="Asia/Shanghai">{i18n.options.beijing}</option>
                        <option value="America/New_York">{i18n.options.newYork}</option>
                        <option value="Europe/London">{i18n.options.london}</option>
                    </select>
                </SettingItem>

                <SettingItem
                    label={i18n.systemSettings.autoSave}
                    description={i18n.settingsDescriptions.autoSave}
                    theme={theme}
                >
                    <input
                        type="checkbox"
                        checked={settings.autoSave || false}
                        onChange={(e) => onSettingsChange({ autoSave: e.target.checked })}
                        style={{
                            width: '16px',
                            height: '16px',
                        }}
                    />
                </SettingItem>
            </div>
        </div>
    );
};

const AppearanceSettings: React.FC<SettingSectionProps> = ({ settings, onSettingsChange, theme, i18n }) => {
    return (
        <div>
            <h3 style={{ color: theme?.modal?.textColor, marginBottom: '20px' }}>{i18n.systemSettings.appearance}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SettingItem
                    label={i18n.systemSettings.themeMode}
                    description={i18n.settingsDescriptions.themeMode}
                    theme={theme}
                >
                    <select
                        style={{
                            width: '200px',
                            padding: '8px',
                            border: `1px solid ${theme.toolbar?.border || '#d9d9d9'}`,
                            borderRadius: '4px',
                            background: theme.toolbar?.background,
                            color: theme?.modal?.textColor,
                        }}
                        value={settings.themeMode || 'light'}
                        onChange={(e) => onSettingsChange({ themeMode: e.target.value })}
                    >
                        <option value="light">{i18n.options.light}</option>
                        <option value="dark">{i18n.options.dark}</option>
                        <option value="auto">{i18n.options.auto}</option>
                    </select>
                </SettingItem>

                <SettingItem
                    label={i18n.systemSettings.fontSize}
                    description={i18n.settingsDescriptions.fontSize}
                    theme={theme}
                >
                    <select
                        style={{
                            width: '200px',
                            padding: '8px',
                            border: `1px solid ${theme.toolbar?.border || '#d9d9d9'}`,
                            borderRadius: '4px',
                            background: theme.toolbar?.background,
                            color: theme?.modal?.textColor,
                        }}
                        value={settings.fontSize || 'medium'}
                        onChange={(e) => onSettingsChange({ fontSize: e.target.value })}
                    >
                        <option value="small">{i18n.options.small}</option>
                        <option value="medium">{i18n.options.medium}</option>
                        <option value="large">{i18n.options.large}</option>
                    </select>
                </SettingItem>
                <SettingItem
                    label={i18n.systemSettings.animations}
                    description={i18n.settingsDescriptions.animations}
                    theme={theme}
                >
                    <input
                        type="checkbox"
                        checked={settings.animations !== false}
                        onChange={(e) => onSettingsChange({ animations: e.target.checked })}
                        style={{
                            width: '16px',
                            height: '16px',
                        }}
                    />
                </SettingItem>
            </div>
        </div>
    );
};

const ChartSettings: React.FC<SettingSectionProps> = ({ settings, onSettingsChange, theme, i18n }) => {
    return (
        <div>
            <h3 style={{ color: theme?.modal?.textColor, marginBottom: '20px' }}>{i18n.systemSettings.chart}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SettingItem
                    label={i18n.systemSettings.defaultTimeframe}
                    description={i18n.settingsDescriptions.defaultTimeframe}
                    theme={theme}
                >
                    <select
                        style={{
                            width: '200px',
                            padding: '8px',
                            border: `1px solid ${theme.toolbar?.border || '#d9d9d9'}`,
                            borderRadius: '4px',
                            background: theme.toolbar?.background,
                            color: theme?.modal?.textColor,
                        }}
                        value={settings.defaultTimeframe || '1D'}
                        onChange={(e) => onSettingsChange({ defaultTimeframe: e.target.value })}
                    >
                        <option value="1m">{i18n.timeframes['1m']}</option>
                        <option value="5m">{i18n.timeframes['5m']}</option>
                        <option value="1H">{i18n.timeframes['1H']}</option>
                        <option value="1D">{i18n.timeframes['1D']}</option>
                        <option value="1W">{i18n.timeframes['1W']}</option>
                    </select>
                </SettingItem>
                <SettingItem
                    label={i18n.systemSettings.pricePrecision}
                    description={i18n.settingsDescriptions.pricePrecision}
                    theme={theme}
                >
                    <input
                        type="number"
                        min="2"
                        max="8"
                        value={settings.pricePrecision || 2}
                        onChange={(e) => onSettingsChange({ pricePrecision: parseInt(e.target.value) })}
                        style={{
                            width: '100px',
                            padding: '8px',
                            border: `1px solid ${theme.toolbar?.border || '#d9d9d9'}`,
                            borderRadius: '4px',
                            background: theme.toolbar?.background,
                            color: theme?.modal?.textColor,
                        }}
                    />
                </SettingItem>
                <SettingItem
                    label={i18n.systemSettings.showGrid}
                    description={i18n.settingsDescriptions.showGrid}
                    theme={theme}
                >
                    <input
                        type="checkbox"
                        checked={settings.showGrid !== false}
                        onChange={(e) => onSettingsChange({ showGrid: e.target.checked })}
                        style={{
                            width: '16px',
                            height: '16px',
                        }}
                    />
                </SettingItem>
            </div>
        </div>
    );
};

const PerformanceSettings: React.FC<SettingSectionProps> = ({ settings, onSettingsChange, theme, i18n }) => {
    return (
        <div>
            <h3 style={{ color: theme?.modal?.textColor, marginBottom: '20px' }}>{i18n.systemSettings.performance}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SettingItem
                    label={i18n.systemSettings.hardwareAcceleration}
                    description={i18n.settingsDescriptions.hardwareAcceleration}
                    theme={theme}
                >
                    <input
                        type="checkbox"
                        checked={settings.hardwareAcceleration !== false}
                        onChange={(e) => onSettingsChange({ hardwareAcceleration: e.target.checked })}
                        style={{
                            width: '16px',
                            height: '16px',
                        }}
                    />
                </SettingItem>
                <SettingItem
                    label={i18n.systemSettings.dataPointLimit}
                    description={i18n.settingsDescriptions.dataPointLimit}
                    theme={theme}
                >
                    <input
                        type="number"
                        min="100"
                        max="10000"
                        value={settings.dataPointLimit || 1000}
                        onChange={(e) => onSettingsChange({ dataPointLimit: parseInt(e.target.value) })}
                        style={{
                            width: '120px',
                            padding: '8px',
                            border: `1px solid ${theme.toolbar?.border || '#d9d9d9'}`,
                            borderRadius: '4px',
                            background: theme.toolbar?.background,
                            color: theme?.modal?.textColor,
                        }}
                    />
                </SettingItem>
                <SettingItem
                    label={i18n.systemSettings.realtimeUpdates}
                    description={i18n.settingsDescriptions.realtimeUpdates}
                    theme={theme}
                >
                    <input
                        type="checkbox"
                        checked={settings.realtimeUpdates || false}
                        onChange={(e) => onSettingsChange({ realtimeUpdates: e.target.checked })}
                        style={{
                            width: '16px',
                            height: '16px',
                        }}
                    />
                </SettingItem>
            </div>
        </div>
    );
};

const ShortcutSettings: React.FC<SettingSectionProps> = ({ settings, onSettingsChange, theme, i18n }) => {
    return (
        <div>
            <h3 style={{ color: theme?.modal?.textColor, marginBottom: '20px' }}>{i18n.systemSettings.shortcutsTitle}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <ShortcutItem
                    action={i18n.systemSettings.zoomIn}
                    shortcut="Ctrl + +"
                    theme={theme}
                />
                <ShortcutItem
                    action={i18n.systemSettings.zoomOut}
                    shortcut="Ctrl + -"
                    theme={theme}
                />
                <ShortcutItem
                    action={i18n.systemSettings.resetZoom}
                    shortcut="Ctrl + 0"
                    theme={theme}
                />
                <ShortcutItem
                    action={i18n.systemSettings.saveChart}
                    shortcut="Ctrl + S"
                    theme={theme}
                />
                <ShortcutItem
                    action={i18n.systemSettings.undo}
                    shortcut="Ctrl + Z"
                    theme={theme}
                />
                <ShortcutItem
                    action={i18n.systemSettings.redo}
                    shortcut="Ctrl + Y"
                    theme={theme}
                />
            </div>
        </div>
    );
};

const SettingItem: React.FC<{
    label: string;
    description: string;
    children: React.ReactNode;
    theme?: ThemeConfig;
}> = ({ label, description, children, theme }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: `1px solid ${theme?.toolbar?.border || '#f0f0f0'}`,
        }}>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: theme?.modal?.textColor || '#000000'
                }}>
                    {label}
                </div>
                <div style={{
                    fontSize: '12px',
                    color: `${theme?.modal?.textColor || '#000000'}80`
                }}>
                    {description}
                </div>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
};

const ShortcutItem: React.FC<{
    action: string;
    shortcut: string;
    theme?: ThemeConfig;
}> = ({ action, shortcut, theme }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
        }}>
            <span style={{
                fontWeight: '500',
                color: theme?.modal?.textColor || '#000000'
            }}>
                {action}
            </span>
            <code style={{
                background: theme?.panel?.backgroundColor || '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                border: `1px solid ${theme?.toolbar?.border || '#e0e0e0'}`,
                color: theme?.modal?.textColor || '#000000',
            }}>
                {shortcut}
            </code>
        </div>
    );
};

export default SystemSettingsModal;