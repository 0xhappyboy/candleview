import React from 'react';
import { MainChartIndicatorType, Point } from '../types';
import { ThemeConfig } from '../CandleViewTheme';
import { getDefaultMainChartIndicators, getMainChartIndicatorInfoParamValue, MainChartIndicatorInfo, MainChartIndicatorParam } from '../Indicators/MainChart/MainChartIndicatorInfo';

export interface ChartInfoProps {
    currentTheme: ThemeConfig;
    title?: string;
    currentOHLC: any;
    mousePosition: Point | null;
    showOHLC: boolean;
    onToggleOHLC: () => void;
    onOpenIndicatorsModal?: () => void;
    indicators?: MainChartIndicatorInfo[];
    onRemoveIndicator?: (type: MainChartIndicatorType) => void;
    onToggleIndicator?: (type: MainChartIndicatorType) => void;
    onEditIndicatorParams?: (id: string, newParams: MainChartIndicatorParam[]) => void;
    visibleIndicatorTypes?: MainChartIndicatorType[];
    onOpenIndicatorSettings?: (indicator: MainChartIndicatorInfo) => void;

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
        const indicators = props.indicators || getDefaultMainChartIndicators();
        indicators.forEach(item => {
            if (item.type) {
                initialVisibleMap.set(item.type, true);
            }
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
            const indicators = this.props.indicators || getDefaultMainChartIndicators();
            indicators.forEach(item => {
                if (item.type) {
                    newMap.set(item.type, true);
                }
            });
            this.setState({ visibleIndicatorsMap: newMap });
        }
    }

    private handleRemoveIndicator = (type: MainChartIndicatorType | null) => {
        if (type && this.props.onRemoveIndicator) {
            this.props.onRemoveIndicator(type);
        }
    };

    private handleToggleIndicator = (type: MainChartIndicatorType | null) => {
        if (!type) return;

        const newMap = new Map(this.state.visibleIndicatorsMap);
        const currentVisibility = newMap.get(type) ?? true;
        newMap.set(type, !currentVisibility);
        this.setState({ visibleIndicatorsMap: newMap });

        if (this.props.onToggleIndicator) {
            this.props.onToggleIndicator(type);
        }
    };

    private handleEditParams = (id: string, newParams: MainChartIndicatorParam[]) => {
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

    renderIndicatorWithValues = (item: MainChartIndicatorInfo) => {
        const { currentTheme } = this.props;
        if (!item.params) return null;

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
                    const displayText = `${param.paramName}(${param.paramValue})`;
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
                                    const newParamName = prompt(`修改参数名`, param.paramName);
                                    if (newParamName !== null && item.params) {
                                        const newParams = [...item.params];
                                        newParams[index] = { ...param, paramName: newParamName };
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
                                {displayText}
                            </span>
                            <span
                                style={{
                                    color: param.lineColor,
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap',
                                    minWidth: '50px'
                                }}
                            >
                                {this.getActualIndicatorValue(item.type, param.paramName).toFixed(2)}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    private getActualIndicatorValue = (type: MainChartIndicatorType | null, paramName: string): number => {
        const {
            maIndicatorValues,
            emaIndicatorValues,
            bollingerBandsValues,
            ichimokuValues,
            donchianChannelValues,
            envelopeValues,
            vwapValue
        } = this.props;
        switch (type) {
            case MainChartIndicatorType.MA:
                return maIndicatorValues?.[paramName] || 3500;
            case MainChartIndicatorType.EMA:
                return emaIndicatorValues?.[paramName] || 3500;
            case MainChartIndicatorType.BOLLINGER:
                return bollingerBandsValues?.[paramName] || 3500;
            case MainChartIndicatorType.ICHIMOKU:
                return ichimokuValues?.[paramName] || 3500;
            case MainChartIndicatorType.DONCHIAN:
                return donchianChannelValues?.[paramName] || 3500;
            case MainChartIndicatorType.ENVELOPE:
                return envelopeValues?.[paramName] || 3500;
            case MainChartIndicatorType.VWAP:
                return vwapValue || 3500;
            default:
                return 3500;
        }
    };

    getFilteredIndicators = (): MainChartIndicatorInfo[] => {
        const { indicators, visibleIndicatorTypes } = this.props;
        const { visibleIndicatorsMap } = this.state;
        const listItems = indicators || getDefaultMainChartIndicators();
        if (!visibleIndicatorTypes || visibleIndicatorTypes.length === 0) {
            return listItems;
        }
        return listItems.filter(item =>
            item.type && visibleIndicatorTypes.includes(item.type)
        );
    };


    renderNormalIndicatorParams = (item: MainChartIndicatorInfo) => {
        const { currentTheme } = this.props;
        if (!item.params) return null;

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: '8px',
                opacity: 0.7,
                fontSize: '11px',
                whiteSpace: 'nowrap',
                flexWrap: 'nowrap',
            }}>
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                }}>
                    {item.params.map((param, index) => {
                        const displayText = `${param.paramName}(${param.paramValue})`;
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
                                        const newValue = prompt(`修改 ${param.paramName} 的值`, param.paramValue.toString());
                                        if (newValue !== null && item.params) {
                                            const newParams = [...item.params];
                                            newParams[index] = {
                                                ...param,
                                                paramValue: Number(newValue)
                                            };
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
                                    {displayText}
                                </span>
                                <span
                                    style={{
                                        color: param.lineColor,
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        minWidth: '50px'
                                    }}
                                >
                                    {this.getActualIndicatorValue(item.type, param.paramName).toFixed(2)}
                                </span>
                            </div>
                        );
                    })}
                </div>
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
                        if (!item.type || !this.state.visibleIndicatorsMap.has(item.type)) {
                            return null;
                        }
                        const isVisible = this.state.visibleIndicatorsMap.get(item.type) ?? true;

                        const getIndicatorDisplayName = (type: MainChartIndicatorType): string => {
                            switch (type) {
                                case MainChartIndicatorType.MA: return 'MA';
                                case MainChartIndicatorType.EMA: return 'EMA';
                                case MainChartIndicatorType.BOLLINGER: return 'BOLL';
                                case MainChartIndicatorType.ICHIMOKU: return 'ICHIMOKU';
                                case MainChartIndicatorType.DONCHIAN: return 'DONCHIAN';
                                case MainChartIndicatorType.ENVELOPE: return 'ENVELOPE';
                                case MainChartIndicatorType.VWAP: return 'VWAP';
                                default: return '指标';
                            }
                        };

                        return (
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
                                    opacity: isVisible ? 1 : 0.5,
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginRight: '12px',
                                    whiteSpace: 'nowrap'
                                }}>
                                    <span>{getIndicatorDisplayName(item.type)}</span>
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
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}