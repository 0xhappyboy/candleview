import React from 'react';
import { Point } from '../types';
import { ThemeConfig } from '../CandleViewTheme';

interface ChartInfoProps {
    currentTheme: ThemeConfig;
    title?: string;
    currentOHLC: any;
    mousePosition: Point | null;
    showOHLC: boolean;
    onToggleOHLC: () => void;
    onOpenIndicatorsModal?: () => void; // 新增
}
interface ChartInfoState {
}

export class ChartInfo extends React.Component<ChartInfoProps, ChartInfoState> {
    constructor(props: ChartInfoProps) {
        super(props);
        this.state = {
            currentOHLC: null,
            mousePosition: null,
            showOHLC: true
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    // 在 ChartInfo 类中添加方法
    private openIndicatorsModal = () => {
        if (this.props.onOpenIndicatorsModal) {
            this.props.onOpenIndicatorsModal();
        }
    };

    renderEyeIcon = (isVisible: boolean) => {
        if (isVisible) {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
        } else {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
            );
        }
    };

    render() {
        const { currentTheme, title, currentOHLC, mousePosition, showOHLC, onToggleOHLC } = this.props;
        const listItems = [
            { id: '1', text: 'MA 5' },
            { id: '2', text: 'MA 10' },
            { id: '3', text: 'MA 20' },
            { id: '4', text: 'MA 30' },
            { id: '5', text: 'MA 60' }
        ];
        return (
            <div
                style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    zIndex: 20,
                    pointerEvents: 'none',
                }}
            >
                <div style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontFamily: 'Arial, sans-serif',
                    color: currentTheme.layout.textColor,
                    lineHeight: '1.1',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'nowrap',
                        whiteSpace: 'nowrap'
                    }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{title || 'Chart'}</span>
                        <span
                            style={{
                                cursor: 'pointer',
                                pointerEvents: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                opacity: showOHLC ? 1 : 0.5,
                                marginLeft: '0px',
                                marginRight: '0px',
                                userSelect: 'none',
                                transition: 'all 0.2s',
                                padding: '2px',
                                borderRadius: '3px',
                            }}
                            onClick={onToggleOHLC}  // 使用传入的回调函数
                            title={showOHLC ? '隐藏 OHLC' : '显示 OHLC'}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                e.currentTarget.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.opacity = showOHLC ? '1' : '0.5';
                            }}
                        >
                            {this.renderEyeIcon(showOHLC)}
                        </span>
                        {currentOHLC && mousePosition && showOHLC ? (
                            <>
                                <span style={{ fontSize: '12px' }}>O:{currentOHLC.open.toFixed(2)}</span>
                                <span style={{ fontSize: '12px' }}>H:{currentOHLC.high.toFixed(2)}</span>
                                <span style={{ fontSize: '12px' }}>L:{currentOHLC.low.toFixed(2)}</span>
                                <span style={{
                                    fontSize: '12px',
                                    color: currentOHLC.close >= currentOHLC.open
                                        ? currentTheme.chart.upColor
                                        : currentTheme.chart.downColor
                                }}>
                                    C:{currentOHLC.close.toFixed(2)}
                                </span>
                                <span style={{ opacity: 0.7, fontSize: '12px' }}>
                                    {currentOHLC.time}
                                </span>
                            </>
                        ) : (
                            <span style={{ opacity: 0.7, fontStyle: 'italic' }}>
                            </span>
                        )}
                    </div>
                </div>


                <div style={{
                    pointerEvents: 'auto',
                    background: 'transparent',
                }}>
                    {listItems.map(item => (
                        <div
                            key={item.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '4px 8px',
                                fontSize: '12px',
                                color: currentTheme.layout.textColor,
                                background: 'transparent',
                                width: 'fit-content',
                                minWidth: 'auto',
                            }}
                        >
                            <span style={{
                                marginRight: '12px',
                                whiteSpace: 'nowrap'
                            }}>
                                {item.text}
                            </span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

                                <button
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: currentTheme.layout.textColor,
                                        opacity: 0.7,
                                        transition: 'all 0.2s',
                                    }}
                                    onClick={this.openIndicatorsModal} 
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.opacity = '0.7';
                                    }}
                                    title="设置"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </svg>
                                </button>


                                <button
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: currentTheme.layout.textColor,
                                        opacity: 0.7,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.opacity = '0.7';
                                    }}
                                    title="关闭"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}