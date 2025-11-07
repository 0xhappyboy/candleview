
import React from 'react';
import { ThemeConfig } from '../CandleViewTheme';
import {
    DrawingIcon,
    FibonacciIcon,
    SettingsIcon,
    TradeIcon,
    BuyIcon,
    SellIcon,
    OrderIcon,
    LineToolIcon,
    HorizontalLineIcon,
    VerticalLineIcon,
    RectangleIcon,
    TextIcon,
    EmojiIcon,
    MAIcon,
    BollingerBandsIcon,
    RsiIcon,
    IchimokuIcon,
    MacdIcon,
    VolumeIcon,
    FibonacciExtensionIcon,
    AndrewPitchforkIcon,
    GannFanIcon,
    ArrowIcon,
    ChannelIcon,
    TrendChannelIcon,
    CircleIcon,
    TriangleIcon,
    CycleLinesIcon,
    GannBoxIcon,
    PitchforkIcon,
    EllipseIcon,
    PieChartIcon,
    BrushIcon,
    CalligraphyPenIcon,
    EraserIcon,
    HighlighterIcon,
    MarkerIcon,
    PencilIcon,
    PenIcon,
    SprayIcon,
    RulerIcon,
    TrashIcon,
    CursorArrowIcon,
    CursorCrosshairIcon,
    CursorDotIcon,
    CursorEmojiIcon,
    CursorSparkleIcon,
    CursorIcon,
    LineIcon,
    LineWithDotsIcon,
} from '../CandleViewIcons';
import { EMOJI_CATEGORIES, EMOJI_LIST } from '../Drawing/Emoji/EmojiConfig';


interface CandleViewLeftPanelProps {
    currentTheme: ThemeConfig;
    activeTool: string | null;
    onToolSelect: (tool: string) => void;
    onTradeClick: () => void;
    showToolbar?: boolean;
    drawingLayerRef?: React.RefObject<any>;


    selectedEmoji?: string;
    onEmojiSelect?: (emoji: string) => void;
}

interface CandleViewLeftPanelState {
    isDrawingModalOpen: boolean;
    isEmojiSelectPopUpOpen: boolean;
    isBrushModalOpen: boolean;
    isCursorModalOpen: boolean;
    selectedEmoji: string;
    selectedEmojiCategory: string;
    selectedCursor: string;
    isFibonacciModalOpen: boolean;
    isGannModalOpen: boolean;
    isProjectInfoModalOpen: boolean;
    isIrregularShapeModalOpen: boolean;
}

class CandleViewLeftPanel extends React.Component<CandleViewLeftPanelProps, CandleViewLeftPanelState> {
    private drawingModalRef = React.createRef<HTMLDivElement>();
    private emojiPickerRef = React.createRef<HTMLDivElement>();
    private cursorModalRef = React.createRef<HTMLDivElement>();
    private brushModalRef = React.createRef<HTMLDivElement>();
    private fibonacciModalRef = React.createRef<HTMLDivElement>();
    private gannModalRef = React.createRef<HTMLDivElement>();
    private projectInfoModalRef = React.createRef<HTMLDivElement>();
    private irregularShapeModalRef = React.createRef<HTMLDivElement>();

    constructor(props: CandleViewLeftPanelProps) {
        super(props);
        this.state = {
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            selectedEmoji: props.selectedEmoji || '😀',
            selectedEmojiCategory: 'smileys',
            selectedCursor: 'cursor-crosshair',
            isFibonacciModalOpen: false,
            isGannModalOpen: false,
            isProjectInfoModalOpen: false,
            isIrregularShapeModalOpen: false,
        };
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside, true);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside, true);
    }

    componentDidUpdate(prevProps: CandleViewLeftPanelProps) {

        if (prevProps.selectedEmoji !== this.props.selectedEmoji && this.props.selectedEmoji) {
            this.setState({
                selectedEmoji: this.props.selectedEmoji
            });
        }
    }


    private cursorStyles = [
        { id: 'cursor-crosshair', name: '十字准星', description: '带空格的十字准星', icon: CursorCrosshairIcon },
        { id: 'cursor-dot', name: '点状光标', description: '圆点光标样式', icon: CursorDotIcon },
        { id: 'cursor-arrow', name: '箭头光标', description: '箭头指示样式', icon: CursorArrowIcon },
        { id: 'cursor-sparkle', name: '烟花棒', description: '烟花效果光标', icon: CursorSparkleIcon },
        { id: 'cursor-emoji', name: '表情光标', description: '表情符号光标', icon: CursorEmojiIcon },
    ];


    private brushTools = [
        {
            title: "基础画笔",
            tools: [
                { id: 'pencil', name: '铅笔', description: '细线绘制工具', icon: PencilIcon },
                { id: 'pen', name: '钢笔', description: '流畅线条绘制', icon: PenIcon },
                { id: 'brush', name: '刷子', description: '柔和笔刷效果', icon: BrushIcon },
                { id: 'marker', name: '马克笔', description: '粗体标记笔', icon: MarkerIcon },
            ]
        },
        {
            title: "特效画笔",
            tools: [
                { id: 'highlighter', name: '荧光笔', description: '半透明高亮效果', icon: HighlighterIcon },
                { id: 'calligraphy-pen', name: '书法笔', description: '书法风格笔触', icon: CalligraphyPenIcon },
                { id: 'spray', name: '喷枪', description: '喷雾效果笔刷', icon: SprayIcon },
            ]
        },
        {
            title: "修改工具",
            tools: [
                { id: 'eraser', name: '橡皮擦', description: '擦除绘制内容', icon: EraserIcon },
            ]
        }
    ];

    private drawingTools = [
        {
            title: "线性工具",
            tools: [
                { id: 'line', name: '直线', description: '绘制直线', icon: LineToolIcon },
                { id: 'arrow', name: '箭头线', description: '绘制箭头线标记', icon: ArrowIcon },
                { id: 'arrow', name: '水平线', description: '绘制水平线标记', icon: ArrowIcon },
                { id: 'arrow', name: '垂直线', description: '绘制垂直线标记', icon: ArrowIcon },
            ]
        },
        {
            title: "通道工具",
            tools: [
                { id: 'parallel-channel', name: '并行通道', description: '绘制并行通道', icon: LineToolIcon },
                { id: 'channel', name: '回归趋势', description: '绘制回归趋势', icon: ChannelIcon },
                { id: 'trend-channel', name: '平顶/平底', description: '绘制平顶/平底', icon: TrendChannelIcon },
                { id: 'arrow', name: '不相交通道', description: '绘制不相交通道', icon: ArrowIcon },
            ]
        },
        {
            title: "叉工具",
            tools: [
                { id: 'line', name: '叉子', description: '绘制叉子', icon: LineToolIcon },
                { id: 'channel', name: '希夫干草叉', description: '绘制希夫干草叉', icon: ChannelIcon },
            ]
        },
        {
            title: "图形工具",
            tools: [
                { id: 'rectangle', name: '矩形', description: '绘制矩形区域', icon: RectangleIcon },
                { id: 'circle', name: '圆形', description: '绘制圆形区域', icon: CircleIcon },
                { id: 'ellipse', name: '椭圆', description: '绘制椭圆区域', icon: EllipseIcon },
                { id: 'triangle', name: '三角形', description: '绘制三角形', icon: TriangleIcon },
            ]
        },
        {
            title: "斐波那契工具",
            tools: [
                { id: 'fibonacci', name: '斐波那契回调', description: '斐波那契回撤工具', icon: FibonacciIcon },
                { id: 'fibonacci-extension', name: '斐波那契扩展', description: '斐波那契扩展工具', icon: FibonacciExtensionIcon },
            ]
        },
        {
            title: "分析工具",
            tools: [
                { id: 'andrew-pitchfork', name: '安德鲁分叉线', description: '安德鲁音叉线分析', icon: AndrewPitchforkIcon },
                { id: 'gann-fan', name: '江恩角度线', description: '江恩扇形线分析', icon: GannFanIcon },
                { id: 'cycle-lines', name: '周期线', description: '时间周期分析线', icon: CycleLinesIcon },
                { id: 'gann-box', name: '江恩箱', description: '江恩箱体分析', icon: GannBoxIcon },
                { id: 'pitchfork', name: '音叉线', description: '标准音叉线工具', icon: PitchforkIcon },
            ]
        }
    ];



    private fibonacciTools = [
        {
            title: "斐波那契工具",
            tools: [
                { id: 'fibonacci-retracement', name: '斐波那契回调', description: '绘制斐波那契回调线', icon: FibonacciIcon },
                { id: 'fibonacci-extension', name: '斐波那契扩展', description: '绘制斐波那契扩展线', icon: FibonacciExtensionIcon },
                { id: 'fibonacci-time-zones', name: '斐波那契时间区间', description: '斐波那契时间区间分析', icon: CycleLinesIcon },
                { id: 'fibonacci-arc', name: '斐波那契弧线', description: '绘制斐波那契弧线', icon: CircleIcon },
                { id: 'fibonacci-fan', name: '斐波那契扇形', description: '斐波那契扇形线分析', icon: GannFanIcon },
            ]
        }
    ];


    private gannTools = [
        {
            title: "江恩分析工具",
            tools: [
                { id: 'gann-fan', name: '江恩角度线', description: '江恩扇形线分析工具', icon: GannFanIcon },
                { id: 'gann-box', name: '江恩箱', description: '江恩箱体分析工具', icon: GannBoxIcon },
                { id: 'gann-square', name: '江恩四方图', description: '江恩四方图分析', icon: RectangleIcon },
                { id: 'gann-wheel', name: '江恩轮', description: '江恩轮分析工具', icon: CircleIcon },
                { id: 'gann-swings', name: '江恩摆动', description: '江恩摆动分析', icon: TrendChannelIcon },
            ]
        }
    ];

    private projectInfoTools = [
        {
            title: "项目信息工具",
            tools: [
                { id: 'project-milestone', name: '项目里程碑', description: '标记项目重要节点', icon: MarkerIcon },
                { id: 'project-timeline', name: '项目时间线', description: '绘制项目时间线', icon: LineToolIcon },
                { id: 'project-phase', name: '项目阶段', description: '标记项目不同阶段', icon: RectangleIcon },
                { id: 'project-resource', name: '资源分配', description: '资源分配标记工具', icon: PieChartIcon },
                { id: 'project-risk', name: '风险标记', description: '项目风险标记工具', icon: TriangleIcon },
            ]
        }
    ];

    private irregularShapeTools = [
        {
            title: "不规则图形",
            tools: [
                { id: 'freehand-shape', name: '自由绘制', description: '手绘不规则图形', icon: PencilIcon },
                { id: 'polygon-shape', name: '多边形', description: '绘制多边形图形', icon: LineToolIcon },
                { id: 'bezier-curve', name: '贝塞尔曲线', description: '绘制贝塞尔曲线', icon: PenIcon },
                { id: 'star-shape', name: '星形', description: '绘制星形图案', icon: CursorSparkleIcon },
                { id: 'cloud-shape', name: '云形标注', description: '云形标注工具', icon: TextIcon },
            ]
        }
    ];

    private handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;

        if (this.state.isDrawingModalOpen &&
            this.drawingModalRef.current &&
            !this.drawingModalRef.current.contains(target) &&
            !target.closest('.drawing-button')) {
            this.setState({ isDrawingModalOpen: false });
        }

        if (this.state.isEmojiSelectPopUpOpen &&
            this.emojiPickerRef.current &&
            !this.emojiPickerRef.current.contains(target) &&
            !target.closest('.emoji-button')) {
            this.setState({ isEmojiSelectPopUpOpen: false });
        }

        if (this.state.isBrushModalOpen &&
            this.brushModalRef.current &&
            !this.brushModalRef.current.contains(target) &&
            !target.closest('.brush-button')) {
            this.setState({ isBrushModalOpen: false });
        }

        if (this.state.isCursorModalOpen &&
            this.cursorModalRef.current &&
            !this.cursorModalRef.current.contains(target) &&
            !target.closest('.cursor-button')) {
            this.setState({ isCursorModalOpen: false });
        }


        if (this.state.isFibonacciModalOpen &&
            this.fibonacciModalRef.current &&
            !this.fibonacciModalRef.current.contains(target) &&
            !target.closest('.fibonacci-button')) {
            this.setState({ isFibonacciModalOpen: false });
        }


        if (this.state.isGannModalOpen &&
            this.gannModalRef.current &&
            !this.gannModalRef.current.contains(target) &&
            !target.closest('.gann-button')) {
            this.setState({ isGannModalOpen: false });
        }


        if (this.state.isProjectInfoModalOpen &&
            this.projectInfoModalRef.current &&
            !this.projectInfoModalRef.current.contains(target) &&
            !target.closest('.project-info-button')) {
            this.setState({ isProjectInfoModalOpen: false });
        }


        if (this.state.isIrregularShapeModalOpen &&
            this.irregularShapeModalRef.current &&
            !this.irregularShapeModalRef.current.contains(target) &&
            !target.closest('.irregular-shape-button')) {
            this.setState({ isIrregularShapeModalOpen: false });
        }
    };

    private handleCursorClick = () => {
        if (!this.state.isCursorModalOpen) {
            this.props.onToolSelect('');
        }

        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: !this.state.isCursorModalOpen
        });
    };


    private handleCursorStyleSelect = (cursorId: string) => {
        this.setState({
            isCursorModalOpen: false,
            selectedCursor: cursorId
        });
    };


    private getSelectedCursorIcon = () => {
        const selectedTool = this.cursorStyles.find(tool => tool.id === this.state.selectedCursor);
        return selectedTool ? selectedTool.icon : CursorIcon;
    };


    private handleBrushClick = () => {
        if (!this.state.isBrushModalOpen) {
            this.props.onToolSelect('');
        }

        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: !this.state.isBrushModalOpen
        });
    };


    private handleBrushToolSelect = (toolId: string) => {
        this.setState({
            isBrushModalOpen: false
        });
        this.props.onToolSelect(toolId);
    };



    private renderCursorModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isCursorModalOpen } = this.state;

        if (!isCursorModalOpen) return null;

        return (
            <div
                ref={this.cursorModalRef}
                style={{
                    position: 'absolute',
                    top: '60px',
                    left: '60px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '16px 0px',
                    width: '320px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto',
                }}
                className="modal-scrollbar"
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    paddingLeft: `12px`,
                    paddingRight: `4px`,
                }}>
                    <h3 style={{
                        margin: 0,
                        color: currentTheme.layout.textColor,
                        fontSize: '14px',
                        fontWeight: '600',
                    }}>
                        鼠标样式
                    </h3>
                    <button
                        onClick={() => this.setState({ isCursorModalOpen: false })}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: currentTheme.layout.textColor,
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '2px 8px',
                            borderRadius: '0px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    padding: '12px',
                }}>
                    {this.cursorStyles.map(tool => {
                        const IconComponent = tool.icon;
                        const isActive = activeTool === tool.id;

                        return (
                            <button
                                key={tool.id}
                                onClick={() => this.handleCursorStyleSelect(tool.id)}
                                style={{
                                    background: isActive
                                        ? currentTheme.toolbar.button.active
                                        : 'transparent',
                                    border: `1px solid ${isActive
                                        ? currentTheme.toolbar.button.active
                                        : currentTheme.toolbar.border
                                        }`,
                                    padding: '12px 8px',
                                    borderRadius: '6px',
                                    color: currentTheme.layout.textColor,
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '100%',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <IconComponent
                                    size={24}
                                    color={isActive
                                        ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                        : currentTheme.toolbar.button.color
                                    }
                                />
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '2px',
                                }}>
                                    <div style={{
                                        fontWeight: '600',
                                        fontSize: '11px',
                                        lineHeight: '1.2',
                                        textAlign: 'center',
                                    }}>
                                        {tool.name}
                                    </div>
                                    <div style={{
                                        fontSize: '9px',
                                        opacity: 0.7,
                                        lineHeight: '1.2',
                                        textAlign: 'center',
                                    }}>
                                        {tool.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };


    private renderCursorTools = () => {
        const cursorButton = {
            id: 'cursor',
            icon: this.getSelectedCursorIcon(),
            title: 'Mouse Cursor',
            className: 'cursor-button'
        };
        const isActive = this.state.isCursorModalOpen ||
            this.cursorStyles.some(tool => tool.id === this.props.activeTool);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {this.renderToolButton(cursorButton, isActive, this.handleCursorClick)}
            </div>
        );
    };


    private renderBrushModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isBrushModalOpen } = this.state;

        if (!isBrushModalOpen) return null;

        return (
            <div
                ref={this.brushModalRef}
                style={{
                    position: 'absolute',
                    top: '60px',
                    left: '60px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '16px 0px',
                    width: '320px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto',
                }}
                className="modal-scrollbar"
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    paddingLeft: `12px`,
                    paddingRight: `4px`,
                }}>
                    <h3 style={{
                        margin: 0,
                        color: currentTheme.layout.textColor,
                        fontSize: '14px',
                        fontWeight: '600',
                    }}>
                        画笔工具
                    </h3>
                    <button
                        onClick={() => this.setState({ isBrushModalOpen: false })}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: currentTheme.layout.textColor,
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '2px 8px',
                            borderRadius: '0px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {this.brushTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleBrushToolSelect}
                            defaultOpen={index === 0}
                        />
                    ))}
                </div>

                {activeTool && (
                    <div style={{
                        marginTop: '16px',
                        padding: '15px',
                        background: currentTheme.toolbar.button.active + '20',
                        border: `1px solid ${currentTheme.toolbar.button.active}`,
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: currentTheme.layout.textColor,
                        textAlign: 'center',
                    }}>
                        已选择: {this.getBrushToolName(activeTool)} - 点击图表开始绘制
                    </div>
                )}
            </div>
        );
    };


    private getBrushToolName(toolId: string): string {
        for (const group of this.brushTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }


    private handleEmojiToolSelect = () => {
        if (this.state.isEmojiSelectPopUpOpen) {
            this.setState({ isEmojiSelectPopUpOpen: false });
            return;
        }
        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: true,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            isGannModalOpen: false,
            isProjectInfoModalOpen: false,
            isIrregularShapeModalOpen: false,
            isFibonacciModalOpen: false
        });

        this.props.onToolSelect('emoji');
    };

    private handleEmojiSelect = (emoji: string) => {
        this.setState({
            selectedEmoji: emoji,
            isEmojiSelectPopUpOpen: false
        });
        if (this.props.onEmojiSelect) {
            this.props.onEmojiSelect(emoji);
        }
        if (this.props.drawingLayerRef && this.props.drawingLayerRef.current) {
            if (this.props.drawingLayerRef.current.setEmojiMarkMode) {
                this.props.drawingLayerRef.current.setEmojiMarkMode(emoji);
            }
        }
        this.props.onToolSelect('emoji');
    };


    private handleCategorySelect = (categoryId: string) => {
        this.setState({ selectedEmojiCategory: categoryId });
    };


    private renderEmojiSelectPopUp = () => {
        const { currentTheme } = this.props;
        const { isEmojiSelectPopUpOpen, selectedEmojiCategory } = this.state;

        if (!isEmojiSelectPopUpOpen) return null;

        const currentCategoryEmojis = EMOJI_LIST.filter(emoji =>
            emoji.category === selectedEmojiCategory
        );

        return (
            <div
                ref={this.emojiPickerRef}
                style={{
                    position: 'absolute',
                    top: '60px',
                    left: '60px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    padding: '0px',
                    width: '320px',
                    maxHeight: '400px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                className="modal-scrollbar"
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    background: currentTheme.toolbar.background,
                    flexShrink: 0,
                }}>
                    <h3 style={{
                        margin: 0,
                        color: currentTheme.layout.textColor,
                        fontSize: '14px',
                        fontWeight: '600',
                    }}>
                        选择表情
                    </h3>
                    <button
                        onClick={() => this.setState({ isEmojiSelectPopUpOpen: false })}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: currentTheme.layout.textColor,
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        ×
                    </button>
                </div>


                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    padding: '8px 12px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    background: currentTheme.toolbar.background,
                    flexShrink: 0,
                    gap: '4px',
                    maxHeight: '80px',
                    overflowY: 'auto',
                }} className="custom-scrollbar">
                    {EMOJI_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => this.handleCategorySelect(category.id)}
                            style={{
                                background: selectedEmojiCategory === category.id
                                    ? currentTheme.toolbar.button.active
                                    : 'transparent',
                                border: `1px solid ${selectedEmojiCategory === category.id
                                    ? currentTheme.toolbar.button.active
                                    : currentTheme.toolbar.border
                                    }`,
                                borderRadius: '6px',
                                padding: '6px 10px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                color: currentTheme.layout.textColor,
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                height: '28px',
                            }}
                            onMouseEnter={(e) => {
                                if (selectedEmojiCategory !== category.id) {
                                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedEmojiCategory !== category.id) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '12px',
                    maxHeight: '250px',
                }} className="custom-scrollbar">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: '8px',
                        justifyItems: 'center',
                    }}>
                        {currentCategoryEmojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => this.handleEmojiSelect(emoji.character)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid transparent',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    fontSize: '22px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    minHeight: '40px',
                                    minWidth: '40px',
                                    width: '100%',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                    e.currentTarget.style.borderColor = currentTheme.toolbar.border;
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                title={emoji.name}
                            >
                                {emoji.character}
                            </button>
                        ))}
                    </div>
                </div>


                <div style={{
                    padding: '12px',
                    background: currentTheme.toolbar.button.active + '20',
                    borderTop: `1px solid ${currentTheme.toolbar.button.active}`,
                    fontSize: '12px',
                    color: currentTheme.layout.textColor,
                    textAlign: 'center',
                    flexShrink: 0,
                }}>
                    已选择: {this.state.selectedEmoji} - 点击图表放置表情
                </div>
            </div>
        );
    };




    private getDisplayEmojis() {
        return EMOJI_LIST.slice(0, 42);
    }

    private renderDrawingModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isDrawingModalOpen } = this.state;

        if (!isDrawingModalOpen) return null;

        return (
            <div
                ref={this.drawingModalRef}
                style={{
                    position: 'absolute',
                    top: '60px',
                    left: '60px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '16px 0px',
                    width: '320px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto',
                }}
                className="modal-scrollbar"
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    paddingLeft: `12px`,
                    paddingRight: `4px`,
                }}>
                    <h3 style={{
                        margin: 0,
                        color: currentTheme.layout.textColor,
                        fontSize: '14px',
                        fontWeight: '600',
                    }}>
                        绘图工具
                    </h3>
                    <button
                        onClick={this.handleCloseDrawingModal}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: currentTheme.layout.textColor,
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '2px 8px',
                            borderRadius: '0px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {this.drawingTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleDrawingToolSelect}
                            defaultOpen={index === 0}
                        />
                    ))}
                </div>

                {activeTool && (
                    <div style={{
                        marginTop: '16px',
                        padding: '15px',
                        background: currentTheme.toolbar.button.active + '20',
                        border: `1px solid ${currentTheme.toolbar.button.active}`,
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: currentTheme.layout.textColor,
                        textAlign: 'center',
                    }}>
                        已选择: {this.getToolName(activeTool)} - 点击图表开始绘制
                    </div>
                )}
            </div>
        );
    };

    private getToolName(toolId: string): string {
        for (const group of this.drawingTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    private handleDrawingClick = () => {
        if (!this.state.isDrawingModalOpen) {
            this.props.onToolSelect('');
        }




        this.setState({
            isDrawingModalOpen: !this.state.isDrawingModalOpen,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            isFibonacciModalOpen: false,
            isGannModalOpen: false,
            isIrregularShapeModalOpen: false,
            isProjectInfoModalOpen: false
        });
    };

    private handleCloseDrawingModal = () => {
        this.setState({ isDrawingModalOpen: false });
    };


    private handleDrawingToolSelect = (toolId: string) => {
        this.setState({
            isEmojiSelectPopUpOpen: false
        });
        if (toolId === 'line') {
            // straight line
            if (this.props.drawingLayerRef && this.props.drawingLayerRef.current) {
                if (this.props.drawingLayerRef.current.setLineMarkMode) {
                    this.props.drawingLayerRef.current.setLineMarkMode();
                }
            }
        } else if (toolId === 'parallel-channel') {
            // parallel channel
            if (this.props.drawingLayerRef && this.props.drawingLayerRef.current) {
                if (this.props.drawingLayerRef.current.setParallelChannelMode) {
                    this.props.drawingLayerRef.current.setParallelChannelMode();
                }
            }
        }
        this.props.onToolSelect(toolId);
        this.setState({ isDrawingModalOpen: false });
    };

    private handleTextToolSelect = () => {
        this.setState({
            isEmojiSelectPopUpOpen: false
        });

        if (this.props.drawingLayerRef && this.props.drawingLayerRef.current) {
            if (this.props.drawingLayerRef.current.setTextMarkMode) {
                this.props.drawingLayerRef.current.setTextMarkMode();
            }
            if (this.props.drawingLayerRef.current.setFirstTimeTextMode) {
                this.props.drawingLayerRef.current.setFirstTimeTextMode(true);
            }
        }
        this.props.onToolSelect('text');
        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            isGannModalOpen: false,
            isProjectInfoModalOpen: false,
            isIrregularShapeModalOpen: false,
            isFibonacciModalOpen: false
        });
    };

    private renderToolButton = (tool: any, isActive: boolean, onClick: () => void) => {
        const { currentTheme } = this.props;
        const IconComponent = tool.icon;

        return (
            <button
                key={tool.id}
                title={tool.title}
                onClick={onClick}
                className={tool.className || ''}
                style={{
                    background: isActive
                        ? currentTheme.toolbar.button.active
                        : 'transparent',
                    border: 'none',
                    borderRadius: '0px',
                    padding: '0px',
                    cursor: 'pointer',
                    color: isActive
                        ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                        : currentTheme.toolbar.button.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    height: '38px',
                    width: '38px',
                }}
                onMouseEnter={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                    }
                }}
            >
                <IconComponent
                    size={20}
                    color={isActive
                        ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                        : currentTheme.toolbar.button.color}
                />
            </button>
        );
    };

    private renderLineTools = () => {
        const drawingButton = {
            id: 'drawing',
            icon: LineWithDotsIcon,
            title: 'Drawing Tools',
            className: 'drawing-button'
        };
        const isActive = this.state.isDrawingModalOpen;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {this.renderToolButton(drawingButton, isActive, this.handleDrawingClick)}
            </div>
        );
    };



    private getFibonacciToolName(toolId: string): string {
        for (const group of this.fibonacciTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    private getGannToolName(toolId: string): string {
        for (const group of this.gannTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    private getProjectInfoToolName(toolId: string): string {
        for (const group of this.projectInfoTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    private getIrregularShapeToolName(toolId: string): string {
        for (const group of this.irregularShapeTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    private renderFibonacciModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isFibonacciModalOpen } = this.state;
        if (!isFibonacciModalOpen) return null;
        return (
            <div
                ref={this.fibonacciModalRef}
                style={{
                    position: 'absolute',
                    top: '60px',
                    left: '60px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '16px 0px',
                    width: '320px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto',
                }}
                className="modal-scrollbar"
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    paddingLeft: `12px`,
                    paddingRight: `4px`,
                }}>
                    <h3 style={{
                        margin: 0,
                        color: currentTheme.layout.textColor,
                        fontSize: '14px',
                        fontWeight: '600',
                    }}>
                        斐波那契工具
                    </h3>
                    <button
                        onClick={() => this.setState({ isFibonacciModalOpen: false })}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: currentTheme.layout.textColor,
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '2px 8px',
                            borderRadius: '0px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {this.fibonacciTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleFibonacciToolSelect}
                            defaultOpen={index === 0}
                        />
                    ))}
                </div>

                {activeTool && (
                    <div style={{
                        marginTop: '16px',
                        padding: '15px',
                        background: currentTheme.toolbar.button.active + '20',
                        border: `1px solid ${currentTheme.toolbar.button.active}`,
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: currentTheme.layout.textColor,
                        textAlign: 'center',
                    }}>
                        已选择: {this.getFibonacciToolName(activeTool)} - 点击图表开始绘制
                    </div>
                )}
            </div>
        );
    };


    private renderGannModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isGannModalOpen } = this.state;
        if (!isGannModalOpen) return null;
        return (
            <div
                ref={this.gannModalRef}
                style={{
                    position: 'absolute',
                    top: '60px',
                    left: '60px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '16px 0px',
                    width: '320px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto',
                }}
                className="modal-scrollbar"
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    paddingLeft: `12px`,
                    paddingRight: `4px`,
                }}>
                    <h3 style={{
                        margin: 0,
                        color: currentTheme.layout.textColor,
                        fontSize: '14px',
                        fontWeight: '600',
                    }}>
                        江恩分析工具
                    </h3>
                    <button
                        onClick={() => this.setState({ isGannModalOpen: false })}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: currentTheme.layout.textColor,
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '2px 8px',
                            borderRadius: '0px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {this.gannTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleGannToolSelect}
                            defaultOpen={index === 0}
                        />
                    ))}
                </div>

                {activeTool && (
                    <div style={{
                        marginTop: '16px',
                        padding: '15px',
                        background: currentTheme.toolbar.button.active + '20',
                        border: `1px solid ${currentTheme.toolbar.button.active}`,
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: currentTheme.layout.textColor,
                        textAlign: 'center',
                    }}>
                        已选择: {this.getGannToolName(activeTool)} - 点击图表开始绘制
                    </div>
                )}
            </div>
        );
    };


    private renderProjectInfoModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isProjectInfoModalOpen } = this.state;
        if (!isProjectInfoModalOpen) return null;
        return (
            <div
                ref={this.projectInfoModalRef}
                style={{
                    position: 'absolute',
                    top: '60px',
                    left: '60px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '16px 0px',
                    width: '320px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto',
                }}
                className="modal-scrollbar"
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    paddingLeft: `12px`,
                    paddingRight: `4px`,
                }}>
                    <h3 style={{
                        margin: 0,
                        color: currentTheme.layout.textColor,
                        fontSize: '14px',
                        fontWeight: '600',
                    }}>
                        项目信息工具
                    </h3>
                    <button
                        onClick={() => this.setState({ isProjectInfoModalOpen: false })}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: currentTheme.layout.textColor,
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '2px 8px',
                            borderRadius: '0px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {this.projectInfoTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleProjectInfoToolSelect}
                            defaultOpen={index === 0}
                        />
                    ))}
                </div>
                {activeTool && (
                    <div style={{
                        marginTop: '16px',
                        padding: '15px',
                        background: currentTheme.toolbar.button.active + '20',
                        border: `1px solid ${currentTheme.toolbar.button.active}`,
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: currentTheme.layout.textColor,
                        textAlign: 'center',
                    }}>
                        已选择: {this.getProjectInfoToolName(activeTool)} - 点击图表开始绘制
                    </div>
                )}
            </div>
        );
    };

    private renderIrregularShapeModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isIrregularShapeModalOpen } = this.state;
        if (!isIrregularShapeModalOpen) return null;
        return (
            <div
                ref={this.irregularShapeModalRef}
                style={{
                    position: 'absolute',
                    top: '60px',
                    left: '60px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '16px 0px',
                    width: '320px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto',
                }}
                className="modal-scrollbar"
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${currentTheme.toolbar.border}`,
                    paddingLeft: `12px`,
                    paddingRight: `4px`,
                }}>
                    <h3 style={{
                        margin: 0,
                        color: currentTheme.layout.textColor,
                        fontSize: '14px',
                        fontWeight: '600',
                    }}>
                        不规则图形工具
                    </h3>
                    <button
                        onClick={() => this.setState({ isIrregularShapeModalOpen: false })}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: currentTheme.layout.textColor,
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '2px 8px',
                            borderRadius: '0px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {this.irregularShapeTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleIrregularShapeToolSelect}
                            defaultOpen={index === 0}
                        />
                    ))}
                </div>

                {activeTool && (
                    <div style={{
                        marginTop: '16px',
                        padding: '15px',
                        background: currentTheme.toolbar.button.active + '20',
                        border: `1px solid ${currentTheme.toolbar.button.active}`,
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: currentTheme.layout.textColor,
                        textAlign: 'center',
                    }}>
                        已选择: {this.getIrregularShapeToolName(activeTool)} - 点击图表开始绘制
                    </div>
                )}
            </div>
        );
    };


    private handleFibonacciToolSelect = (toolId: string) => {
        this.setState({
            isFibonacciModalOpen: false
        });
        this.props.onToolSelect(toolId);
    };


    private handleGannToolSelect = (toolId: string) => {
        this.setState({
            isGannModalOpen: false
        });
        this.props.onToolSelect(toolId);
    };


    private handleProjectInfoToolSelect = (toolId: string) => {
        this.setState({
            isProjectInfoModalOpen: false
        });
        this.props.onToolSelect(toolId);
    };


    private handleIrregularShapeToolSelect = (toolId: string) => {
        this.setState({
            isIrregularShapeModalOpen: false
        });
        this.props.onToolSelect(toolId);
    };



    private handleFibonacciClick = () => {
        if (!this.state.isFibonacciModalOpen) {
            this.props.onToolSelect('');
        }
        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            isGannModalOpen: false,
            isProjectInfoModalOpen: false,
            isIrregularShapeModalOpen: false,
            isFibonacciModalOpen: !this.state.isFibonacciModalOpen
        });
    };


    private handleGannClick = () => {
        if (!this.state.isGannModalOpen) {
            this.props.onToolSelect('');
        }
        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            isFibonacciModalOpen: false,
            isProjectInfoModalOpen: false,
            isIrregularShapeModalOpen: false,
            isGannModalOpen: !this.state.isGannModalOpen
        });
    };


    private handleProjectInfoClick = () => {
        if (!this.state.isProjectInfoModalOpen) {
            this.props.onToolSelect('');
        }

        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            isFibonacciModalOpen: false,
            isGannModalOpen: false,
            isIrregularShapeModalOpen: false,
            isProjectInfoModalOpen: !this.state.isProjectInfoModalOpen
        });
    };


    private handleIrregularShapeClick = () => {
        if (!this.state.isIrregularShapeModalOpen) {
            this.props.onToolSelect('');
        }

        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            isFibonacciModalOpen: false,
            isGannModalOpen: false,
            isProjectInfoModalOpen: false,
            isIrregularShapeModalOpen: !this.state.isIrregularShapeModalOpen
        });
    };

    private renderTecGraphTools = () => {
        const additionalTools = [
            {
                id: 'fibonacci',
                icon: FibonacciIcon,
                title: '斐波那契工具',
                className: 'fibonacci-button'
            },
            {
                id: 'gann',
                icon: GannFanIcon,
                title: '江恩分析工具',
                className: 'gann-button'
            },
            {
                id: 'project-info',
                icon: PieChartIcon,
                title: '项目信息工具',
                className: 'project-info-button'
            },
            {
                id: 'irregular-shape',
                icon: PencilIcon,
                title: '不规则图形工具',
                className: 'irregular-shape-button'
            },
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {additionalTools.map(tool => {
                    const isActive =
                        (tool.id === 'fibonacci' && this.state.isFibonacciModalOpen) ||
                        (tool.id === 'gann' && this.state.isGannModalOpen) ||
                        (tool.id === 'project-info' && this.state.isProjectInfoModalOpen) ||
                        (tool.id === 'irregular-shape' && this.state.isIrregularShapeModalOpen);
                    const onClick =
                        tool.id === 'fibonacci' ? this.handleFibonacciClick :
                            tool.id === 'gann' ? this.handleGannClick :
                                tool.id === 'project-info' ? this.handleProjectInfoClick :
                                    this.handleIrregularShapeClick;
                    return this.renderToolButton(tool, isActive, onClick);
                })}
            </div>
        );
    };

    private renderMarkTools = () => {
        const { activeTool } = this.props;
        const { isEmojiSelectPopUpOpen, isBrushModalOpen } = this.state;
        const annotationTools = [
            {
                id: 'brush',
                icon: BrushIcon,
                title: '画笔工具',
                className: 'brush-button'
            },
            {
                id: 'ruler',
                icon: RulerIcon,
                title: '标尺工具',
                className: 'ruler-button'
            },
            {
                id: 'text',
                icon: TextIcon,
                title: '文字标记',
                className: 'text-button'
            },
            {
                id: 'emoji',
                icon: EmojiIcon,
                title: '表情标记',
                className: 'emoji-button'
            },
            {
                id: 'trash',
                icon: TrashIcon,
                title: '删除工具',
                className: 'trash-button'
            },
        ];
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {annotationTools.map(tool => {
                    const isActive = activeTool === tool.id ||
                        (tool.id === 'emoji' && isEmojiSelectPopUpOpen) ||
                        (tool.id === 'brush' && isBrushModalOpen);

                    const onClick = tool.id === 'text'
                        ? this.handleTextToolSelect
                        : tool.id === 'emoji'
                            ? this.handleEmojiToolSelect
                            : tool.id === 'brush'
                                ? this.handleBrushClick
                                : () => this.props.onToolSelect(tool.id);

                    return this.renderToolButton(tool, isActive, onClick);
                })}
            </div>
        );
    };

    private renderAnalysisTools = () => {
        const { activeTool, onToolSelect } = this.props;

        const analysisTools = [
            { id: 'settings', icon: SettingsIcon, title: 'Setting', className: 'indicator-button' },
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {analysisTools.map(tool => {
                    const isActive = activeTool === tool.id;
                    const onClick = () => onToolSelect(tool.id);

                    return this.renderToolButton(tool, isActive, onClick);
                })}
            </div>
        );
    };

    render() {
        const { showToolbar = true } = this.props;

        if (!showToolbar) return null;

        return (
            <div style={{ position: 'relative' }}>
                <div style={{
                    background: this.props.currentTheme.toolbar.background,
                    borderRight: `1px solid ${this.props.currentTheme.toolbar.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '50px',
                    boxSizing: 'border-box',
                    height: '100%',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '12px 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0px',
                    }} className="custom-scrollbar">
                        {this.renderCursorTools()}
                        {this.renderLineTools()}
                        {this.renderTecGraphTools()}
                        {this.renderMarkTools()}
                        <div style={{
                            height: '1px',
                            background: this.props.currentTheme.toolbar.border,
                            margin: '10px 0',
                        }} />
                        {this.renderAnalysisTools()}
                    </div>
                </div>
                {this.renderDrawingModal()}
                {this.renderBrushModal()}
                {this.renderCursorModal()}
                {this.renderEmojiSelectPopUp()}
                {this.renderFibonacciModal()}
                {this.renderGannModal()}
                {this.renderProjectInfoModal()}
                {this.renderIrregularShapeModal()}
            </div>
        );
    }
}

interface CollapsibleToolGroupProps {
    title: string;
    tools: Array<{
        id: string;
        name: string;
        description: string;
        icon: React.ComponentType<any>;
    }>;
    currentTheme: ThemeConfig;
    activeTool: string | null;
    onToolSelect: (toolId: string) => void;
    defaultOpen?: boolean;
}

interface CollapsibleToolGroupState {
    isOpen: boolean;
}

class CollapsibleToolGroup extends React.Component<CollapsibleToolGroupProps, CollapsibleToolGroupState> {
    constructor(props: CollapsibleToolGroupProps) {
        super(props);
        this.state = {
            isOpen: props.defaultOpen || false
        };
    }

    toggleOpen = () => {
        this.setState(prevState => ({ isOpen: !prevState.isOpen }));
    };

    render() {
        const { title, tools, currentTheme, activeTool, onToolSelect } = this.props;
        const { isOpen } = this.state;

        return (
            <div style={{
                borderBottom: `1px solid ${currentTheme.toolbar.border}`,
            }}>
                <button
                    onClick={this.toggleOpen}
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: '12px 12px',
                        color: currentTheme.layout.textColor,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <span>{title}</span>
                    <span style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        fontSize: '12px',
                    }}>
                        ▼
                    </span>
                </button>

                {isOpen && (
                    <div style={{
                        padding: '0px',
                        background: currentTheme.toolbar.background,
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0px',
                        }}>
                            {tools.map(tool => {
                                const IconComponent = tool.icon;
                                const isActive = activeTool === tool.id;

                                return (
                                    <button
                                        key={tool.id}
                                        onClick={() => onToolSelect(tool.id)}
                                        style={{
                                            background: isActive
                                                ? currentTheme.toolbar.button.active
                                                : 'transparent',
                                            border: isActive
                                                ? `2px solid ${currentTheme.toolbar.button.active}`
                                                : '2px solid transparent',
                                            padding: '10px 12px',
                                            borderRadius: '0px',
                                            color: currentTheme.layout.textColor,
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0px',
                                            width: '100%',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        <IconComponent
                                            size={20}
                                            color={isActive
                                                ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                                                : currentTheme.toolbar.button.color
                                            }
                                        />
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            flex: 1,
                                        }}>
                                            <div style={{
                                                fontWeight: '600',
                                                fontSize: '12px',
                                                lineHeight: '1.2',
                                            }}>
                                                {tool.name}
                                            </div>
                                            <div style={{
                                                fontSize: '10px',
                                                opacity: 0.7,
                                                lineHeight: '1.2',
                                                marginTop: '2px',
                                                textAlign: 'left',
                                            }}>
                                                {tool.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default CandleViewLeftPanel;