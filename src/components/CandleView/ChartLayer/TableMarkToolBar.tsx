import React from 'react';
import { MarkDrawing, Point } from '../types';
import { ThemeConfig } from '../CandleViewTheme';

interface TableMarkToolBarProps {
    position: Point;
    selectedDrawing: MarkDrawing | null;
    theme: ThemeConfig;
    onClose: () => void;
    onDelete: () => void;
    onChangeColor: (color: string) => void;
    onChangeStyle: (lineStyle: 'solid' | 'dashed' | 'dotted') => void;
    onEditText?: () => void;
    onDragStart: (point: Point) => void;
    isDragging: boolean;
    getToolName: (toolId: string) => string;
    onPanelChange?: (panel: 'color' | 'style' | null) => void;
    onAddColumn?: () => void;
    onAddRow?: () => void;
    onChangeBorderColor?: (color: string) => void;
    onChangeBackgroundColor?: (color: string) => void;
    borderColor?: string;
    backgroundColor?: string;
}

interface TableMarkToolBarState {
    activePanel: 'color' | 'style' | 'lineSize' | 'lineStyle' | 'borderColor' | 'backgroundColor' | null;
    lineWidth: number;
    lineStyle: 'solid' | 'dashed' | 'dotted';
    isBold: boolean;
    isItalic: boolean;
}

export class TableMarkToolBar extends React.Component<TableMarkToolBarProps, TableMarkToolBarState> {
    private toolbarRef = React.createRef<HTMLDivElement>();

    constructor(props: TableMarkToolBarProps) {
        super(props);
        this.state = {
            activePanel: null,
            lineWidth: 1,
            lineStyle: 'solid',
            isBold: false,
            isItalic: false
        };
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleDocumentClick);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleDocumentClick);
    }

    private handleDocumentClick = (e: MouseEvent) => {
        if (this.toolbarRef.current && this.toolbarRef.current.contains(e.target as Node)) {
            return;
        }
        if (this.state.activePanel) {
            this.handleClosePanel();
        }
    };

    private stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    private handleDragStart = (e: React.MouseEvent) => {
        this.stopPropagation(e);
        this.props.onDragStart({ x: e.clientX, y: e.clientY });
    };

    private handleButtonClick = (panel: 'color' | 'style' | 'lineSize' | 'lineStyle' | 'borderColor' | 'backgroundColor', e: React.MouseEvent) => {
        this.stopPropagation(e);
        this.setState(prevState => ({
            activePanel: prevState.activePanel === panel ? null : panel
        }));
    };

    private handleClosePanel = () => {
        this.setState({ activePanel: null });
    };

    private handleColorChange = (color: string) => {
        this.props.onChangeColor(color);
    };

    private handleBorderColorChange = (color: string) => {
        this.props.onChangeBorderColor?.(color);
    };

    private handleBackgroundColorChange = (color: string) => {
        this.props.onChangeBackgroundColor?.(color);
    };

    private handleLineSizeChange = (width: number) => {
        this.setState({ lineWidth: width });
        this.handleClosePanel();
    };

    private handleLineStyleChange = (lineStyle: 'solid' | 'dashed' | 'dotted') => {
        this.setState({ lineStyle });
        this.props.onChangeStyle(lineStyle);
        this.handleClosePanel();
    };

    private renderDragHandle() {
        const { theme } = this.props;
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    padding: '6px 4px',
                    cursor: this.props.isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                }}
                onMouseDown={this.handleDragStart}
                title="拖动工具栏"
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.toolbar.button.hover
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                }}
            >
                {[...Array(3)].map((_, rowIndex) => (
                    <div key={rowIndex} style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(2)].map((_, dotIndex) => (
                            <div
                                key={dotIndex}
                                style={{
                                    width: '3px',
                                    height: '3px',
                                    borderRadius: '50%',
                                    background: theme.layout.textColor,
                                    opacity: 0.6,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    private renderIconButton(icon: string | React.ReactNode, onClick: (e: React.MouseEvent) => void, title: string, isActive?: boolean, color?: string) {
        const { theme } = this.props;
        return (
            <button
                onClick={onClick}
                style={{
                    background: isActive ? theme.toolbar.button.active : theme.toolbar.button.background,
                    color: isActive ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color,
                    border: `1px solid ${theme.toolbar.border}`,
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    transition: 'all 0.2s',
                    fontSize: '12px',
                }}
                title={title}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.toolbar.button.hover;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = isActive ? theme.toolbar.button.active : theme.toolbar.button.background;
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '12px' }}>
                    {icon}
                </div>
                {color && (
                    <div
                        style={{
                            width: '16px',
                            height: '4px',
                            background: color,
                            border: `1px solid ${theme.toolbar.border}`,
                            borderRadius: '1px',
                            marginTop: '2px',
                        }}
                    />
                )}
            </button>
        );
    }

    private renderTableButton(icon: React.ReactNode, onClick: (e: React.MouseEvent) => void, title: string) {
        const { theme } = this.props;
        return (
            <button
                onClick={onClick}
                style={{
                    background: theme.toolbar.button.background,
                    color: theme.toolbar.button.color,
                    border: `1px solid ${theme.toolbar.border}`,
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    transition: 'all 0.2s',
                    fontSize: '12px',
                }}
                title={title}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.toolbar.button.hover;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.toolbar.button.background;
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16px' }}>
                    {icon}
                </div>
            </button>
        );
    }


    private renderColorPanel(type: 'borderColor' | 'backgroundColor' | 'color') {
        const { theme, borderColor, backgroundColor, selectedDrawing } = this.props;
        let currentColor = '#000000';
        let title = '';

        if (type === 'borderColor') {
            currentColor = borderColor || '#000000';
            title = '边框颜色';
        } else if (type === 'backgroundColor') {
            currentColor = backgroundColor || '#000000';
            title = '背景颜色';
        } else if (type === 'color') {
            currentColor = selectedDrawing?.color || '#000000';
            title = '字体颜色';
        }

        const handleColorChange = (color: string) => {
            if (type === 'borderColor') {
                this.handleBorderColorChange(color);
            } else if (type === 'backgroundColor') {
                this.handleBackgroundColorChange(color);
            } else if (type === 'color') {
                this.handleColorChange(color);
            }
        };

        return (
            <div
                style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    marginTop: '8px',
                    background: theme.toolbar.background,
                    color: theme.layout.textColor,
                    border: `1px solid ${theme.toolbar.border}`,
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    minWidth: '280px',
                    zIndex: 1001,
                    userSelect: 'none',
                    pointerEvents: 'auto',
                }}
                onClick={this.stopPropagation}
                onMouseDown={this.stopPropagation}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                }}>
                    <strong style={{ fontSize: '14px' }}>选择{title}</strong>
                    <button
                        onClick={this.handleClosePanel}
                        onMouseDown={this.stopPropagation}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px',
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                }}>
                    <span style={{ fontSize: '12px', minWidth: '40px' }}>拾色器:</span>
                    <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => {
                            handleColorChange(e.target.value);
                        }}
                        onClick={(e) => {
                            this.stopPropagation(e);
                            e.stopPropagation();
                        }}
                        onMouseDown={(e) => {
                            this.stopPropagation(e);
                            e.stopPropagation();
                        }}
                        onInput={(e) => {
                            e.stopPropagation();
                        }}
                        style={{
                            width: '50px',
                            height: '40px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                        }}
                    />
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(10, 1fr)',
                    gap: '4px',
                    marginBottom: '12px'
                }}>
                    {[
                        '#FF0000', '#FF3333', '#FF6666', '#FF9999', '#FFCCCC',
                        '#CC0000', '#CC3333', '#CC6666', '#CC9999', '#CCCCCC',
                        '#00FF00', '#33FF33', '#66FF66', '#99FF99', '#CCFFCC',
                        '#00CC00', '#33CC33', '#66CC66', '#99CC99', '#CCCCCC',
                        '#0000FF', '#3333FF', '#6666FF', '#9999FF', '#CCCCFF',
                        '#0000CC', '#3333CC', '#6666CC', '#9999CC', '#CCCCFF',
                        '#FFFF00', '#FFFF33', '#FFFF66', '#FFFF99', '#FFFFCC',
                        '#FF9900', '#FFAA33', '#FFBB66', '#FFCC99', '#FFDDCC',
                        '#FF00FF', '#FF33FF', '#FF66FF', '#FF99FF', '#FFCCFF',
                        '#9900FF', '#AA33FF', '#BB66FF', '#CC99FF', '#DDCCFF',
                        '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
                        '#111111', '#444444', '#777777', '#AAAAAA', '#DDDDDD',
                        '#8B4513', '#A0522D', '#CD853F', '#D2691E', '#F4A460',
                        '#D2B48C', '#DEB887', '#F5DEB3', '#FFE4C4', '#FFEBCD',
                        '#FF4500', '#FF6347', '#FF7F50', '#FF8C00', '#FFA500',
                        '#FFD700', '#ADFF2F', '#7CFC00', '#32CD32', '#00FA9A',
                        '#00CED1', '#1E90FF', '#4169E1', '#6A5ACD', '#8A2BE2',
                        '#9370DB', '#BA55D3', '#DA70D6', '#EE82EE', '#FFFFFF'
                    ].map(color => (
                        <button
                            key={color}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                                handleColorChange(color);
                                this.handleClosePanel();
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            style={{
                                width: '20px',
                                height: '20px',
                                background: color,
                                border: `1px solid ${color === '#FFFFFF' || color === '#FFFFCC' ||
                                    color === '#FFDDCC' || color === '#FFCCFF' ||
                                    color === '#DDCCFF' || color === '#FFFF99' ?
                                    theme.toolbar.border : 'transparent'
                                    }`,
                                borderRadius: '3px',
                                cursor: 'pointer',
                                transition: 'all 0.1s',
                            }}
                            title={color}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.2)';
                                e.currentTarget.style.zIndex = '1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.zIndex = '0';
                            }}
                        />
                    ))}
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    padding: '8px',
                    background: theme.toolbar.button.background,
                    borderRadius: '4px',
                }}>
                    <span style={{ fontSize: '12px' }}>当前颜色:</span>
                    <div
                        style={{
                            width: '24px',
                            height: '24px',
                            background: currentColor,
                            border: `1px solid ${theme.toolbar.border}`,
                            borderRadius: '3px',
                        }}
                    />
                    <span style={{ fontSize: '12px' }}>{currentColor}</span>
                </div>
            </div>
        );
    }

    private renderLineSizeDropdown() {
        const { theme } = this.props;
        const { lineWidth } = this.state;
        const lineSizes = [1, 2, 3, 4];

        return (
            <div
                style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    marginTop: '8px',
                    background: theme.toolbar.background,
                    color: theme.layout.textColor,
                    border: `1px solid ${theme.toolbar.border}`,
                    borderRadius: '8px',
                    padding: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    minWidth: '120px',
                    zIndex: 1001,
                    userSelect: 'none',
                }}
                onClick={this.stopPropagation}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                }}>
                    <strong style={{ fontSize: '12px' }}>线条粗细</strong>
                    <button
                        onClick={this.handleClosePanel}
                        onMouseDown={this.stopPropagation}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '2px',
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}>
                    {lineSizes.map(size => (
                        <button
                            key={size}
                            onClick={() => this.handleLineSizeChange(size)}
                            style={{
                                padding: '6px 8px',
                                background: lineWidth === size ? theme.toolbar.button.active : theme.toolbar.button.background,
                                color: lineWidth === size ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color,
                                border: `1px solid ${theme.toolbar.border}`,
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div
                                style={{
                                    width: '24px',
                                    height: `${size}px`,
                                    background: theme.layout.textColor,
                                    borderRadius: '1px',
                                }}
                            />
                            <span>{size}px</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    private renderLineStyleDropdown() {
        const { theme } = this.props;
        const { lineStyle } = this.state;
        const lineStyles = [
            { id: 'solid' as const, name: '实线', pattern: 'solid' },
            { id: 'dashed' as const, name: '虚线', pattern: 'dashed' },
            { id: 'dotted' as const, name: '点状线', pattern: 'dotted' }
        ];

        return (
            <div
                style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    marginTop: '8px',
                    background: theme.toolbar.background,
                    color: theme.layout.textColor,
                    border: `1px solid ${theme.toolbar.border}`,
                    borderRadius: '8px',
                    padding: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    minWidth: '120px',
                    zIndex: 1001,
                    userSelect: 'none',
                }}
                onClick={this.stopPropagation}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                }}>
                    <strong style={{ fontSize: '12px' }}>线条样式</strong>
                    <button
                        onClick={this.handleClosePanel}
                        onMouseDown={this.stopPropagation}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '2px',
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}>
                    {lineStyles.map(style => (
                        <button
                            key={style.id}
                            onClick={() => this.handleLineStyleChange(style.id)}
                            style={{
                                padding: '6px 8px',
                                background: lineStyle === style.id ? theme.toolbar.button.active : theme.toolbar.button.background,
                                color: lineStyle === style.id ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color,
                                border: `1px solid ${theme.toolbar.border}`,
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div
                                style={{
                                    width: '24px',
                                    height: '2px',
                                    background: theme.layout.textColor,
                                    border: style.pattern === 'solid' ? 'none' :
                                        style.pattern === 'dashed' ? 'dashed 2px' :
                                            'dotted 2px',
                                    borderTop: style.pattern === 'solid' ? 'none' :
                                        `2px ${style.pattern} ${theme.layout.textColor}`,
                                }}
                            />
                            <span>{style.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    renderMainToolbar() {
        const { selectedDrawing, theme, onClose, onDelete, onAddColumn, onAddRow, borderColor, backgroundColor } = this.props;
        const { activePanel, isBold, isItalic } = this.state;
        const AddColumnIcon = () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="4" x2="8" y2="20" />
                <line x1="12" y1="12" x2="16" y2="12" />
                <line x1="14" y1="10" x2="14" y2="14" />
            </svg>
        );
        const AddRowIcon = () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
        );
        const PenIcon = () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
        );
        const PaintBucketIcon = () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 11L5 11" />
                <path d="M12 4L12 18" />
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
        );
        const TextIcon = () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold">T</text>
            </svg>
        );
        return (
            <div
                ref={this.toolbarRef}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: theme.toolbar.background,
                    color: theme.layout.textColor,
                    border: `1px solid ${theme.toolbar.border}`,
                    borderRadius: '8px',
                    padding: '6px 8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    cursor: this.props.isDragging ? 'grabbing' : 'default',
                    userSelect: 'none',
                    position: 'relative', pointerEvents: 'auto',
                }}
                onClick={this.stopPropagation}
            >
                {this.renderDragHandle()}

                {/* 列添加按钮 */}
                <div style={{ position: 'relative' }}>
                    {this.renderTableButton(
                        <AddColumnIcon />,
                        (e) => { this.stopPropagation(e); onAddColumn?.(); },
                        '添加列'
                    )}
                </div>

                {/* 行添加按钮 */}
                <div style={{ position: 'relative' }}>
                    {this.renderTableButton(
                        <AddRowIcon />,
                        (e) => { this.stopPropagation(e); onAddRow?.(); },
                        '添加行'
                    )}
                </div>

                {/* 边框颜色按钮 - 使用 renderIconButton 并传入 borderColor */}
                <div style={{ position: 'relative' }}>
                    {this.renderIconButton(
                        <PenIcon />,
                        (e) => this.handleButtonClick('borderColor', e),
                        '边框颜色',
                        activePanel === 'borderColor',
                        borderColor
                    )}
                    {activePanel === 'borderColor' && this.renderColorPanel('borderColor')}
                </div>

                {/* 背景颜色按钮 - 使用 renderIconButton 并传入 backgroundColor */}
                <div style={{ position: 'relative' }}>
                    {this.renderIconButton(
                        <PaintBucketIcon />,
                        (e) => this.handleButtonClick('backgroundColor', e),
                        '背景颜色',
                        activePanel === 'backgroundColor',
                        backgroundColor
                    )}
                    {activePanel === 'backgroundColor' && this.renderColorPanel('backgroundColor')}
                </div>

                <div style={{
                    width: '1px',
                    height: '24px',
                    background: theme.toolbar.border,
                    margin: '0 4px',
                }} />

                {/* 字体颜色按钮 */}
                <div style={{ position: 'relative' }}>
                    {this.renderIconButton(
                        <TextIcon />,
                        (e) => this.handleButtonClick('color', e),
                        '字体颜色',
                        activePanel === 'color',
                        selectedDrawing?.color
                    )}
                    {activePanel === 'color' && this.renderColorPanel('color')}
                </div>

                <div style={{ position: 'relative' }}>
                    {this.renderIconButton(
                        '━',
                        (e) => this.handleButtonClick('lineSize', e),
                        '线条粗细',
                        activePanel === 'lineSize'
                    )}
                    {activePanel === 'lineSize' && this.renderLineSizeDropdown()}
                </div>
                <div style={{ position: 'relative' }}>
                    {this.renderIconButton(
                        '─·',
                        (e) => this.handleButtonClick('lineStyle', e),
                        '线条样式',
                        activePanel === 'lineStyle'
                    )}
                    {activePanel === 'lineStyle' && this.renderLineStyleDropdown()}
                </div>
                {this.renderIconButton(
                    '🗑️',
                    (e) => { this.stopPropagation(e); onDelete(); },
                    '删除'
                )}
                {this.renderIconButton(
                    '✕',
                    (e) => { this.stopPropagation(e); onClose(); },
                    '关闭'
                )}
            </div>
        );
    }

    render() {
        const { position, selectedDrawing } = this.props;
        if (!selectedDrawing) return null;
        return (
            <div
                className='table-mark-operation-toolbar'
                style={{
                    position: 'absolute',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    zIndex: 1000,
                    pointerEvents: 'auto',
                }}
                onClick={this.stopPropagation}
                onMouseDown={this.stopPropagation}
            >
                {this.renderMainToolbar()}
            </div>
        );
    }
}