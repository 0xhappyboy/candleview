import React from 'react';
import { MainChartIndicatorType, Point } from '../types';
import { ThemeConfig } from '../CandleViewTheme';

export interface ChartInfoIndicatorItem {
    id: string;
    type: MainChartIndicatorType;
    name: string;
    params: string[];
    visible: boolean;
    // color
    paramColors?: string[];
    paramValues?: number[];
}

export interface ChartInfoProps {
    currentTheme: ThemeConfig;
    title?: string;
    currentOHLC: any;
    mousePosition: Point | null;
    showOHLC: boolean;
    onToggleOHLC: () => void;
    onOpenIndicatorsModal?: () => void;
    indicators?: ChartInfoIndicatorItem[];
    onRemoveIndicator?: (type: MainChartIndicatorType) => void;
    onToggleIndicator?: (type: MainChartIndicatorType) => void;
    onEditIndicatorParams?: (id: string, newParams: string[]) => void;
    visibleIndicatorTypes?: MainChartIndicatorType[];
    onOpenIndicatorSettings?: (indicator: ChartInfoIndicatorItem) => void;

    maIndicatorValues?: { [key: string]: number };
    emaIndicatorValues?: { [key: string]: number };
    bollingerBandsValues?: { [key: string]: number };
    ichimokuValues?: { [key: string]: number };
    donchianChannelValues?: { [key: string]: number };
    envelopeValues?: { [key: string]: number };
    vwapValue?: number | null;
}

interface ChartInfoState {
    currentOHLC: any;
    mousePosition: Point | null;
    showOHLC: boolean;
    visibleIndicatorsMap: Map<MainChartIndicatorType, boolean>;
}

export class ChartInfo extends React.Component<ChartInfoProps, ChartInfoState> {
    constructor(props: ChartInfoProps) {
        super(props);
        const initialVisibleMap = new Map<MainChartIndicatorType, boolean>();
        const indicators = props.indicators || this.getDefaultIndicators();
        indicators.forEach(item => {
            initialVisibleMap.set(item.type, item.visible);
        });
        this.state = {
            currentOHLC: null,
            mousePosition: null,
            showOHLC: true,
            visibleIndicatorsMap: initialVisibleMap
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    componentDidUpdate(prevProps: ChartInfoProps) {
        if (prevProps.indicators !== this.props.indicators) {
            const newMap = new Map(this.state.visibleIndicatorsMap);
            const indicators = this.props.indicators || this.getDefaultIndicators();
            indicators.forEach(item => {
                newMap.set(item.type, true);
            });
            this.setState({ visibleIndicatorsMap: newMap });
        }
    }

    private handleRemoveIndicator = (type: MainChartIndicatorType) => {
        if (this.props.onRemoveIndicator) {
            this.props.onRemoveIndicator(type);
        }
    };

    private handleToggleIndicator = (type: MainChartIndicatorType) => {
        const newMap = new Map(this.state.visibleIndicatorsMap);
        const currentVisibility = newMap.get(type) ?? true;
        newMap.set(type, !currentVisibility);
        this.setState({ visibleIndicatorsMap: newMap });
        if (this.props.onToggleIndicator) {
            this.props.onToggleIndicator(type);
        }
    };

    private handleEditParams = (id: string, newParams: string[]) => {
        if (this.props.onEditIndicatorParams) {
            this.props.onEditIndicatorParams(id, newParams);
        }
    };

    renderEyeIcon = (isVisible: boolean) => {
        const { currentTheme } = this.props;
        const iconColor = currentTheme.layout.textColor;
        if (isVisible) {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
        } else {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
            );
        }
    };

    renderIndicatorWithValues = (item: ChartInfoIndicatorItem) => {
        const {
            currentTheme,
            maIndicatorValues,
            emaIndicatorValues,
            bollingerBandsValues,
            ichimokuValues,
            donchianChannelValues,
            envelopeValues,
            vwapValue
        } = this.props;
        const defaultMAValues = [3500.25, 3520.18, 3480.75, 3465.32, 3440.89];
        const defaultMAColors = ['#FF6B6B', '#6958ffff', '#0ed3ffff', '#3bf79fff', '#f7c933ff'];
        const defaultEMAValues = [3510.45, 3495.67];
        const defaultEMAColors = ['#FF6B6B', '#6958ffff'];
        const defaultBollingerValues = { upper: 3550.12, middle: 3500.25, lower: 3450.38 };
        const defaultIchimokuValues = { tenkan: 3490.15, kijun: 3505.27, senkouA: 3515.42, senkouB: 3485.33, chikou: 3498.76 };
        const defaultDonchianValues = { upper: 3540.18, lower: 3460.32 };
        const defaultEnvelopeValues = { upper: 3535.45, lower: 3465.05 };
        let paramValues: number[] = [];
        let paramColors: string[] = [];
        let displayValues: (number | string)[] = [];
        switch (item.type) {
            case MainChartIndicatorType.MA:
                paramColors = item.paramColors || defaultMAColors.slice(0, item.params.length);
                if (maIndicatorValues && Object.keys(maIndicatorValues).length > 0) {
                    paramValues = Object.values(maIndicatorValues).slice(0, item.params.length);
                } else {
                    paramValues = item.paramValues || defaultMAValues.slice(0, item.params.length);
                }
                displayValues = paramValues;
                break;
            case MainChartIndicatorType.EMA:
                paramColors = item.paramColors || defaultEMAColors.slice(0, item.params.length);
                if (emaIndicatorValues && Object.keys(emaIndicatorValues).length > 0) {
                    paramValues = Object.values(emaIndicatorValues).slice(0, item.params.length);
                } else {
                    paramValues = item.paramValues || defaultEMAValues.slice(0, item.params.length);
                }
                displayValues = paramValues;
                break;
            case MainChartIndicatorType.BOLLINGER:
                paramColors = ['#FF6B6B', '#6958ffff', '#0ed3ffff'];
                if (bollingerBandsValues) {
                    displayValues = [
                        bollingerBandsValues.upper || defaultBollingerValues.upper,
                        bollingerBandsValues.middle || defaultBollingerValues.middle,
                        bollingerBandsValues.lower || defaultBollingerValues.lower
                    ];
                } else {
                    displayValues = [
                        defaultBollingerValues.upper,
                        defaultBollingerValues.middle,
                        defaultBollingerValues.lower
                    ];
                }
                break;
            case MainChartIndicatorType.ICHIMOKU:
                paramColors = ['#FF6B6B', '#6958ffff', '#0ed3ffff', '#3bf79fff', '#f7c933ff'];
                if (ichimokuValues) {
                    displayValues = [
                        ichimokuValues.tenkan || defaultIchimokuValues.tenkan,
                        ichimokuValues.kijun || defaultIchimokuValues.kijun,
                        ichimokuValues.senkouA || defaultIchimokuValues.senkouA,
                        ichimokuValues.senkouB || defaultIchimokuValues.senkouB,
                        ichimokuValues.chikou || defaultIchimokuValues.chikou
                    ];
                } else {
                    displayValues = [
                        defaultIchimokuValues.tenkan,
                        defaultIchimokuValues.kijun,
                        defaultIchimokuValues.senkouA,
                        defaultIchimokuValues.senkouB,
                        defaultIchimokuValues.chikou
                    ];
                }
                break;
            case MainChartIndicatorType.DONCHIAN:
                paramColors = ['#FF6B6B', '#6958ffff'];
                if (donchianChannelValues) {
                    displayValues = [
                        donchianChannelValues.upper || defaultDonchianValues.upper,
                        donchianChannelValues.lower || defaultDonchianValues.lower
                    ];
                } else {
                    displayValues = [
                        defaultDonchianValues.upper,
                        defaultDonchianValues.lower
                    ];
                }
                break;
            case MainChartIndicatorType.ENVELOPE:
                paramColors = ['#FF6B6B', '#6958ffff'];
                if (envelopeValues) {
                    displayValues = [
                        envelopeValues.upper || defaultEnvelopeValues.upper,
                        envelopeValues.lower || defaultEnvelopeValues.lower
                    ];
                } else {
                    displayValues = [
                        defaultEnvelopeValues.upper,
                        defaultEnvelopeValues.lower
                    ];
                }
                break;
            case MainChartIndicatorType.VWAP:
                paramColors = ['#FF6B6B'];
                displayValues = [
                    vwapValue !== undefined && vwapValue !== null ? vwapValue : 3500.25
                ];
                break;

            default:
                return null;
        }
        const finalParamColors = item.params.map((_, index) =>
            paramColors[index] || (defaultMAColors[index] || currentTheme.layout.textColor)
        );
        return (
            <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginLeft: '8px',
                opacity: 0.7,
                fontSize: '11px',
            }}>
                {item.params.map((param, index) => {
                    const color = finalParamColors[index];
                    const value = displayValues[index];
                    return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span
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
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {param}
                            </span>
                            {value !== undefined && value !== null && (
                                <span
                                    style={{
                                        color: color,
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        minWidth: '50px'
                                    }}
                                >
                                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    getDefaultIndicators = (): ChartInfoIndicatorItem[] => {
        return [
            {
                id: '1',
                type: MainChartIndicatorType.MA,
                name: 'MA',
                params: ['MA(5)', 'MA(10)', 'MA(20)', 'MA(30)', 'MA(60)'],
                visible: true,
                paramColors: ['#FF6B6B', '#6958ffff', '#0ed3ffff', '#3bf79fff', '#f7c933ff'],
                paramValues: [3500.25, 3520.18, 3480.75, 3465.32, 3440.89]
            },
            {
                id: '2',
                type: MainChartIndicatorType.EMA,
                name: 'EMA',
                params: ['EMA(12)', 'EMA(26)'],
                visible: true,
                paramColors: ['#FF6B6B', '#6958ffff'],
                paramValues: [3510.45, 3495.67]
            },
            {
                id: '3',
                type: MainChartIndicatorType.BOLLINGER,
                name: 'BOLL',
                params: ['BOLL(20,2)'],
                visible: true
            },
            {
                id: '4',
                type: MainChartIndicatorType.ICHIMOKU,
                name: 'ICHIMOKU',
                params: ['ICHIMOKU(9,26,52)'],
                visible: true
            },
            {
                id: '5',
                type: MainChartIndicatorType.DONCHIAN,
                name: 'DONCHIAN',
                params: ['DONCHIAN(20)'],
                visible: true
            },
            {
                id: '6',
                type: MainChartIndicatorType.ENVELOPE,
                name: 'ENVELOPE',
                params: ['ENVELOPE(20,2.5%)'],
                visible: true
            },
            {
                id: '7',
                type: MainChartIndicatorType.VWAP,
                name: 'VWAP',
                params: ['VWAP'],
                visible: true
            }
        ];
    };

    getFilteredIndicators = (): ChartInfoIndicatorItem[] => {
        const { indicators, visibleIndicatorTypes } = this.props;
        const { visibleIndicatorsMap } = this.state;
        const listItems = indicators || this.getDefaultIndicators();
        if (!visibleIndicatorTypes || visibleIndicatorTypes.length === 0) {
            return listItems;
        }
        return listItems.filter(item =>
            visibleIndicatorTypes.includes(item.type)
        );
    };

    renderMAIndicatorParams = (item: ChartInfoIndicatorItem) => {
        const { currentTheme } = this.props;
        if (item.type !== MainChartIndicatorType.MA) {
            return null;
        }
        const defaultValues = [3500.25, 3520.18, 3480.75, 3465.32, 3440.89];
        const defaultColors = ['#FF6B6B', '#6958ffff', '#0ed3ffff', '#3bf79fff', '#f7c933ff'];
        const paramValues = item.paramValues || defaultValues.slice(0, item.params.length);
        const paramColors = item.paramColors || defaultColors.slice(0, item.params.length);
        return (
            <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginLeft: '8px',
                opacity: 0.7,
                fontSize: '11px',
            }}>
                {item.params.map((param, index) => {
                    const color = paramColors[index] || currentTheme.layout.textColor;
                    const value = paramValues[index];
                    return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span
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
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {param}
                            </span>
                            {value !== undefined && value !== null && (
                                <span
                                    style={{
                                        color: color,
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        minWidth: '50px'
                                    }}
                                >
                                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    renderNormalIndicatorParams = (item: ChartInfoIndicatorItem) => {
        const { currentTheme } = this.props;
        return (
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
        );
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
                    {listItems.map(item => {
                        if (!this.state.visibleIndicatorsMap.has(item.type)) {
                            return null;
                        }
                        const isVisible = this.state.visibleIndicatorsMap.get(item.type) ?? item.visible;
                        return (<div
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
                                        pointerEvents: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '16px',
                                        height: '16px',
                                        marginLeft: '0px',
                                        marginRight: '0px',
                                        userSelect: 'none',
                                        transition: 'all 0.2s',
                                        padding: '1px',
                                        borderRadius: '3px',
                                    }}
                                    onClick={() => this.handleToggleIndicator(item.type)}
                                    title={isVisible ? '隐藏指标' : '显示指标'}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    {this.renderEyeIcon(isVisible)}
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
                                    onClick={() => this.props.onOpenIndicatorSettings?.(item)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.opacity = '0.7';
                                    }}
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
                                    onClick={() => this.handleRemoveIndicator(item.type)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.opacity = '0.7';
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>

                                {item.type === MainChartIndicatorType.MA || item.type === MainChartIndicatorType.EMA ? (
                                    this.renderIndicatorWithValues(item)
                                ) : (
                                    this.renderNormalIndicatorParams(item)
                                )}
                            </div>
                        </div>)
                    })}
                </div>
            </div>
        );
    }
}