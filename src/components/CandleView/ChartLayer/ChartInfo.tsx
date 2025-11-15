import React from 'react';
import { MainChartIndicatorType, Point } from '../types';
import { ThemeConfig } from '../CandleViewTheme';

interface IndicatorItem {
    id: string;
    type: MainChartIndicatorType;
    name: string;
    params: string[];
    visible: boolean;
}

interface ChartInfoProps {
    currentTheme: ThemeConfig;
    title?: string;
    currentOHLC: any;
    mousePosition: Point | null;
    showOHLC: boolean;
    onToggleOHLC: () => void;
    onOpenIndicatorsModal?: () => void;
    indicators?: IndicatorItem[];
    onRemoveIndicator?: (id: string) => void;
    onToggleIndicator?: (id: string) => void;
    onEditIndicatorParams?: (id: string, newParams: string[]) => void;
    visibleIndicatorTypes?: MainChartIndicatorType[];
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

    private openIndicatorsModal = () => {
        if (this.props.onOpenIndicatorsModal) {
            this.props.onOpenIndicatorsModal();
        }
    };

    private handleRemoveIndicator = (id: string) => {
        if (this.props.onRemoveIndicator) {
            this.props.onRemoveIndicator(id);
        }
    };

    private handleToggleIndicator = (id: string) => {
        if (this.props.onToggleIndicator) {
            this.props.onToggleIndicator(id);
        }
    };

    private handleEditParams = (id: string, newParams: string[]) => {
        if (this.props.onEditIndicatorParams) {
            this.props.onEditIndicatorParams(id, newParams);
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

    getDefaultIndicators = (): IndicatorItem[] => {
        return [
            { id: '1', type: MainChartIndicatorType.MA, name: 'MA', params: ['MA(5)', 'MA(10)', 'MA(20)', 'MA(30)', 'MA(60)'], visible: true },
            { id: '2', type: MainChartIndicatorType.EMA, name: 'EMA', params: ['EMA(12)', 'EMA(26)'], visible: true },
            { id: '3', type: MainChartIndicatorType.BOLLINGER, name: 'BOLL', params: ['BOLL(20,2)'], visible: true },
            { id: '4', type: MainChartIndicatorType.ICHIMOKU, name: 'ICHIMOKU', params: ['ICHIMOKU(9,26,52)'], visible: true },
            { id: '5', type: MainChartIndicatorType.DONCHIAN, name: 'DONCHIAN', params: ['DONCHIAN(20)'], visible: true },
            { id: '6', type: MainChartIndicatorType.ENVELOPE, name: 'ENVELOPE', params: ['ENVELOPE(20,2.5%)'], visible: true },
            { id: '7', type: MainChartIndicatorType.VWAP, name: 'VWAP', params: ['VWAP'], visible: true }
        ];
    };

    getFilteredIndicators = (): IndicatorItem[] => {
        const { indicators, visibleIndicatorTypes } = this.props;
        const listItems = indicators || this.getDefaultIndicators();
        if (!visibleIndicatorTypes || visibleIndicatorTypes.length === 0) {
            return listItems;
        }
        return listItems.filter(item => visibleIndicatorTypes.includes(item.type));
    };

    render() {
        const { currentTheme, title, currentOHLC, mousePosition, showOHLC, onToggleOHLC } = this.props;
        const listItems = this.getFilteredIndicators();
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
                            onClick={onToggleOHLC}
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
                                opacity: item.visible ? 1 : 0.5,
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginRight: '12px',
                                whiteSpace: 'nowrap'
                            }}>
                                <span>{item.name}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '16px',
                                        height: '16px',
                                        userSelect: 'none',
                                        transition: 'all 0.2s',
                                        opacity: item.visible ? 1 : 0.5,
                                    }}
                                    onClick={() => this.handleToggleIndicator(item.id)}
                                    title={item.visible ? '隐藏指标' : '显示指标'}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    {this.renderEyeIcon(item.visible)}
                                </span>
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
                                    onClick={() => this.handleRemoveIndicator(item.id)}
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
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center',
                                    marginLeft: '8px',
                                    opacity: 0.7,
                                    fontSize: '11px',
                                }}>
                                    {item.params.map((param, index) => (
                                        <span
                                            key={index}
                                            style={{
                                                cursor: 'pointer',
                                                padding: '1px 4px',
                                                borderRadius: '2px',
                                                transition: 'all 0.2s',
                                                whiteSpace: 'nowrap',
                                            }}
                                            onClick={() => {
                                                const newParam = prompt(`修改参数`, param);
                                                if (newParam !== null) {
                                                    const newParams = [...item.params];
                                                    newParams[index] = newParam;
                                                    this.handleEditParams(item.id, newParams);
                                                }
                                            }}
                                            title="点击修改参数"
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            {param}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}