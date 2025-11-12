
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
import { cursorStyles, drawingTools, gannAndFibonacciTools, irregularShapeTools, penTools, projectInfoTools, rulerTools, textTools } from './CandleViewLeftPanelConfig';
import { CandleViewLeftPanelToolManager } from './CandleViewLeftPanelToolManager';

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
    isRulerModalOpen: boolean;
    isCursorModalOpen: boolean;
    selectedEmoji: string;
    selectedEmojiCategory: string;
    selectedCursor: string;
    isFibonacciModalOpen: boolean;
    isGannModalOpen: boolean;
    isProjectInfoModalOpen: boolean;
    isIrregularShapeModalOpen: boolean;
    isTextToolModalOpen: boolean;
    lastSelectedTools: {
        drawing: string;
        brush: string;
        ruler: string;
        cursor: string;
        fibonacci: string;
        projectInfo: string;
        irregularShape: string;
        textTool: string;
    };
}

class CandleViewLeftPanel extends React.Component<CandleViewLeftPanelProps, CandleViewLeftPanelState> {
    private drawingModalRef = React.createRef<HTMLDivElement>();
    private emojiPickerRef = React.createRef<HTMLDivElement>();
    private cursorModalRef = React.createRef<HTMLDivElement>();
    private brushModalRef = React.createRef<HTMLDivElement>();
    private rulerModalRef = React.createRef<HTMLDivElement>();
    private fibonacciModalRef = React.createRef<HTMLDivElement>();
    private gannModalRef = React.createRef<HTMLDivElement>();
    private projectInfoModalRef = React.createRef<HTMLDivElement>();
    private irregularShapeModalRef = React.createRef<HTMLDivElement>();
    private candleViewLeftPanelToolManager: CandleViewLeftPanelToolManager | null = new CandleViewLeftPanelToolManager();
    // Function pop-up window width
    private functionPopUpWidth = '315px';

    constructor(props: CandleViewLeftPanelProps) {
        super(props);
        this.state = {
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isRulerModalOpen: false,
            isCursorModalOpen: false,
            selectedEmoji: props.selectedEmoji || '😀',
            selectedEmojiCategory: 'smileys',
            selectedCursor: 'cursor-crosshair',
            isFibonacciModalOpen: false,
            isGannModalOpen: false,
            isProjectInfoModalOpen: false,
            isIrregularShapeModalOpen: false,
            isTextToolModalOpen: false,
            lastSelectedTools: {
                drawing: 'line-segment',
                brush: 'pencil',
                ruler: 'pencil',
                cursor: 'cursor-crosshair',
                fibonacci: 'fibonacci-retracement',
                projectInfo: 'time-range',
                irregularShape: 'rectangle',
                textTool: 'text'
            }
        };
        this.candleViewLeftPanelToolManager = new CandleViewLeftPanelToolManager();
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

    // ====================== Drawing Tool Selection Start ======================
    private handleDrawingToolSelect = (toolId: string) => {
        this.setState(prevState => ({
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                drawing: toolId
            }
        }));
        this.candleViewLeftPanelToolManager?.handleDrawingToolSelect(this, toolId);
    };

    // ====================== Drawing Tool Selection End ======================

    // tap elsewhere on the screen to close all modals.
    private handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (this.state.isTextToolModalOpen &&
            this.rulerModalRef.current &&
            !this.rulerModalRef.current.contains(target) &&
            !target.closest('.ruler-button')) {
            this.setState({ isTextToolModalOpen: false });
        }
        if (this.state.isRulerModalOpen &&
            this.rulerModalRef.current &&
            !this.rulerModalRef.current.contains(target) &&
            !target.closest('.ruler-button')) {
            this.setState({ isRulerModalOpen: false });
        }
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
            isRulerModalOpen: false,
            isCursorModalOpen: !this.state.isCursorModalOpen
        });
    };

    private handleCursorStyleSelect = (cursorId: string) => {
        this.setState(prevState => ({
            isCursorModalOpen: false,
            selectedCursor: cursorId,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                cursor: cursorId
            }
        }));
    };

    private handleRulerToolSelect = (toolId: string) => {
        this.setState(prevState => ({
            isRulerModalOpen: false,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                ruler: toolId
            }
        }));
        this.props.onToolSelect(toolId);
    };

    private getSelectedCursorIcon = () => {
        const selectedTool = cursorStyles.find(tool => tool.id === this.state.selectedCursor);
        return selectedTool ? selectedTool.icon : CursorIcon;
    };

    private handleRulerClick = () => {
        if (!this.state.isRulerModalOpen) {
            this.props.onToolSelect('');
        }
        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isRulerModalOpen: !this.state.isRulerModalOpen
        });
    };

    private handleBrushClick = () => {
        if (!this.state.isBrushModalOpen) {
            this.props.onToolSelect('');
        }
        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isRulerModalOpen: false,
            isBrushModalOpen: !this.state.isBrushModalOpen
        });
    };

    private handleBrushToolSelect = (toolId: string) => {
        this.setState(prevState => ({
            isBrushModalOpen: false,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                brush: toolId
            }
        }));
        this.candleViewLeftPanelToolManager?.handleDrawingToolSelect(this, toolId);
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
                    padding: '0px 0px',
                    width: `${this.functionPopUpWidth}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto', paddingBottom: '0px'
                }}
                className="modal-scrollbar"
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    padding: '12px',
                }}>
                    {cursorStyles.map(tool => {
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

    private handleClearAllMark = () => {
        if (this.props.drawingLayerRef?.current?.clearAllMark) {
            this.props.drawingLayerRef.current.clearAllMark();
        }
    }


    private renderCursorTools = () => {
        const { lastSelectedTools, isCursorModalOpen } = this.state;
        const selectedCursor = cursorStyles.find(tool => tool.id === lastSelectedTools.cursor);
        const cursorButton = {
            id: 'cursor',
            icon: selectedCursor?.icon || CursorIcon,
            title: 'Mouse Cursor',
            className: 'cursor-button'
        };

        const isActive = isCursorModalOpen || cursorStyles.some(tool => tool.id === this.props.activeTool);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {this.renderToolButton(
                    cursorButton,
                    isActive,
                    this.handleCursorClick,
                    true,
                    isCursorModalOpen,
                    selectedCursor?.icon
                )}
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
                    padding: '0px 0px',
                    width: `${this.functionPopUpWidth}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto', paddingBottom: '0px'
                }}
                className="modal-scrollbar"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {penTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleBrushToolSelect}
                            defaultOpen={true}
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


    private renderTextToolModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isTextToolModalOpen } = this.state;

        if (!isTextToolModalOpen) return null;

        return (
            <div
                ref={this.rulerModalRef}
                style={{
                    position: 'absolute',
                    top: '60px',
                    left: '60px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '0px 0px',
                    width: `${this.functionPopUpWidth}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto', paddingBottom: '0px'
                }}
                className="modal-scrollbar"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {textTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleTextToolSelect}
                            defaultOpen={true}
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

    private renderRulerModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isRulerModalOpen } = this.state;

        if (!isRulerModalOpen) return null;

        return (
            <div
                ref={this.rulerModalRef}
                style={{
                    position: 'absolute',
                    top: '60px',
                    left: '60px',
                    zIndex: 1000,
                    background: currentTheme.toolbar.background,
                    border: `1px solid ${currentTheme.toolbar.border}`,
                    borderRadius: '0px',
                    padding: '0px 0px',
                    width: `${this.functionPopUpWidth}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto', paddingBottom: '0px'
                }}
                className="modal-scrollbar"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {rulerTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleRulerToolSelect}
                            defaultOpen={true}
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
        for (const group of penTools) {
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
                    width: `${this.functionPopUpWidth}`,
                    maxHeight: '400px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column', paddingBottom: '0px'
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
                    padding: '0px 0px',
                    width: `${this.functionPopUpWidth}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto', paddingBottom: '0px'
                }}
                className="modal-scrollbar"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {drawingTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleDrawingToolSelect}
                            defaultOpen={true}
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
        for (const group of drawingTools) {
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


    public handleTextToolSelect = (toolId: string = 'text') => {
        this.setState(prevState => ({
            isTextToolModalOpen: false,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                textTool: toolId
            }
        }));

        if (toolId === 'text') {
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
        } else {
            this.candleViewLeftPanelToolManager?.handleDrawingToolSelect(this, toolId);
        }
    };

    private handleTextToolClick = () => {
        if (!this.state.isTextToolModalOpen) {
            this.props.onToolSelect('');
        }
        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isRulerModalOpen: false,
            isTextToolModalOpen: !this.state.isTextToolModalOpen
        });
    };

    private handleFibonacciToolSelect = (toolId: string) => {
        this.setState(prevState => ({
            isFibonacciModalOpen: false,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                fibonacci: toolId
            }
        }));
        this.candleViewLeftPanelToolManager?.handleDrawingToolSelect(this, toolId);
    };

    private handleProjectInfoToolSelect = (toolId: string) => {
        this.setState(prevState => ({
            isProjectInfoModalOpen: false,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                projectInfo: toolId
            }
        }));
        this.candleViewLeftPanelToolManager?.handleDrawingToolSelect(this, toolId);
    };

    private handleIrregularShapeToolSelect = (toolId: string) => {
        this.setState(prevState => ({
            isIrregularShapeModalOpen: false,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                irregularShape: toolId
            }
        }));
        this.candleViewLeftPanelToolManager?.handleDrawingToolSelect(this, toolId);
    };

    private handleDirectToolSelect = (toolType: string) => {
        const { lastSelectedTools } = this.state;
        const toolId = lastSelectedTools[toolType as keyof typeof lastSelectedTools];
        this.setState({
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isRulerModalOpen: false,
            isCursorModalOpen: false,
            isFibonacciModalOpen: false,
            isGannModalOpen: false,
            isProjectInfoModalOpen: false,
            isIrregularShapeModalOpen: false,
            isTextToolModalOpen: false
        });
        switch (toolType) {
            case 'drawing':
                this.handleDrawingToolSelect(toolId);
                break;
            case 'brush':
                this.handleBrushToolSelect(toolId);
                break;
            case 'ruler':
                this.handleRulerToolSelect(toolId);
                break;
            case 'cursor':
                this.handleCursorStyleSelect(toolId);
                break;
            case 'fibonacci':
                this.handleFibonacciToolSelect(toolId);
                break;
            case 'projectInfo':
                this.handleProjectInfoToolSelect(toolId);
                break;
            case 'irregularShape':
                this.handleIrregularShapeToolSelect(toolId);
                break;
            case 'textTool':
                this.handleTextToolSelect(toolId);
                break;
        }
    };

    private renderToolButton = (tool: any, isActive: boolean, onClick: () => void, hasArrow: boolean = false, modalOpen: boolean = false, dynamicIcon?: React.ComponentType<any>) => {
        const { currentTheme } = this.props;
        const IconComponent = dynamicIcon || tool.icon;

        return (
            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    background: isActive
                        ? currentTheme.toolbar.button.active
                        : 'transparent',
                    transition: 'all 0.2s ease',
                }}
                className="tool-button-container"
                onMouseEnter={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                    }
                    const arrowBtn = e.currentTarget.querySelector('.arrow-button') as HTMLElement;
                    if (arrowBtn) {
                        arrowBtn.style.opacity = '1';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                    }
                    const arrowBtn = e.currentTarget.querySelector('.arrow-button') as HTMLElement;
                    if (arrowBtn) {
                        arrowBtn.style.opacity = '0';
                    }
                }}
            >
                <button
                    key={tool.id}
                    title={tool.title}
                    onClick={onClick}
                    className={tool.className || ''}
                    style={{
                        background: 'transparent',
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
                        height: '35px',
                        width: '35px',
                        flex: 'none',
                    }}
                >
                    <IconComponent
                        size={20}
                        color={isActive
                            ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                            : currentTheme.toolbar.button.color}
                    />
                </button>
                {hasArrow && (
                    <button
                        onClick={onClick}
                        className="arrow-button"
                        style={{
                            background: 'transparent',
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
                            height: '35px',
                            width: '12px',
                            flex: 'none',
                            opacity: 0,
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <span style={{
                            fontSize: '18px',
                            paddingRight: '8px'
                        }}>
                            {modalOpen ? '‹' : '›'}
                        </span>
                    </button>
                )}
            </div>
        );
    };

    private renderLineTools = () => {
        const { lastSelectedTools, isDrawingModalOpen } = this.state;
        const selectedDrawingTool = this.findToolInGroups(drawingTools, lastSelectedTools.drawing);
        const drawingButton = {
            id: 'drawing',
            icon: selectedDrawingTool?.icon || LineWithDotsIcon,
            title: 'Drawing Tools',
            className: 'drawing-button'
        };
        const isActive = isDrawingModalOpen;
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0px',
                width: '100%'
            }}>
                {this.renderToolButton(
                    drawingButton,
                    isActive,
                    this.handleDrawingClick,
                    true,
                    isDrawingModalOpen,
                    selectedDrawingTool?.icon
                )}
            </div>
        );
    };

    private findToolInGroups(toolGroups: any[], toolId: string) {
        for (const group of toolGroups) {
            const tool = group.tools.find((t: any) => t.id === toolId);
            if (tool) return tool;
        }
        return null;
    }

    private getFibonacciToolName(toolId: string): string {
        for (const group of gannAndFibonacciTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    private getProjectInfoToolName(toolId: string): string {
        for (const group of projectInfoTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    private getIrregularShapeToolName(toolId: string): string {
        for (const group of irregularShapeTools) {
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
                    padding: '0px 0px',
                    width: `${this.functionPopUpWidth}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto', paddingBottom: '0px'
                }}
                className="modal-scrollbar"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {gannAndFibonacciTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleFibonacciToolSelect}
                            defaultOpen={true}
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
                    padding: '0px 0px',
                    width: `${this.functionPopUpWidth}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto', paddingBottom: '0px'
                }}
                className="modal-scrollbar"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {projectInfoTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleProjectInfoToolSelect}
                            defaultOpen={true}
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
                    padding: '0px 0px',
                    width: `${this.functionPopUpWidth}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    maxHeight: '500px',
                    overflowY: 'auto', paddingBottom: '0px'
                }}
                className="modal-scrollbar"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {irregularShapeTools.map((group, index) => (
                        <CollapsibleToolGroup
                            key={group.title}
                            title={group.title}
                            tools={group.tools}
                            currentTheme={currentTheme}
                            activeTool={activeTool}
                            onToolSelect={this.handleIrregularShapeToolSelect}
                            defaultOpen={true}
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
        const { lastSelectedTools, isFibonacciModalOpen, isProjectInfoModalOpen, isIrregularShapeModalOpen } = this.state;

        const selectedFibonacciTool = this.findToolInGroups(gannAndFibonacciTools, lastSelectedTools.fibonacci);
        const selectedProjectInfoTool = this.findToolInGroups(projectInfoTools, lastSelectedTools.projectInfo);
        const selectedIrregularShapeTool = this.findToolInGroups(irregularShapeTools, lastSelectedTools.irregularShape);

        const additionalTools = [
            {
                id: 'fibonacci',
                icon: selectedFibonacciTool?.icon || FibonacciIcon,
                title: '斐波那契工具',
                className: 'fibonacci-button',
                modalState: isFibonacciModalOpen
            },
            {
                id: 'project-info',
                icon: selectedProjectInfoTool?.icon || PieChartIcon,
                title: '项目信息工具',
                className: 'project-info-button',
                modalState: isProjectInfoModalOpen
            },
            {
                id: 'irregular-shape',
                icon: selectedIrregularShapeTool?.icon || PencilIcon,
                title: '图形工具',
                className: 'irregular-shape-button',
                modalState: isIrregularShapeModalOpen
            },
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {additionalTools.map(tool => {
                    const isActive = tool.modalState;
                    const onClick = tool.id === 'fibonacci'
                        ? this.handleFibonacciClick
                        : tool.id === 'project-info'
                            ? this.handleProjectInfoClick
                            : this.handleIrregularShapeClick;
                    return this.renderToolButton(
                        tool,
                        isActive,
                        onClick,
                        true,
                        tool.modalState,
                        tool.id === 'fibonacci' ? selectedFibonacciTool?.icon :
                            tool.id === 'project-info' ? selectedProjectInfoTool?.icon :
                                selectedIrregularShapeTool?.icon
                    );
                })}
            </div>
        );
    };

    private handleToolButtonClick = (toolType: string) => {
        switch (toolType) {
            case 'cursor':
                this.handleCursorClick();
                break;
            case 'drawing':
                this.handleDrawingClick();
                break;
            case 'brush':
                this.handleBrushClick();
                break;
            case 'ruler':
                this.handleRulerClick();
                break;
            case 'text':
                this.handleTextToolClick();
                break;
            case 'fibonacci':
                this.handleFibonacciClick();
                break;
            case 'projectInfo':
                this.handleProjectInfoClick();
                break;
            case 'irregularShape':
                this.handleIrregularShapeClick();
                break;
        }
    };

    private renderMarkTools = () => {
        const { activeTool } = this.props;
        const { isEmojiSelectPopUpOpen, isBrushModalOpen, isRulerModalOpen, isTextToolModalOpen, lastSelectedTools } = this.state;
        const selectedBrushTool = this.findToolInGroups(penTools, lastSelectedTools.brush);
        const selectedRulerTool = this.findToolInGroups(rulerTools, lastSelectedTools.ruler);
        const selectedTextTool = this.findToolInGroups(textTools, lastSelectedTools.textTool);
        const annotationTools = [
            {
                id: 'brush',
                icon: selectedBrushTool?.icon || BrushIcon,
                title: '画笔',
                className: 'brush-button',
                hasArrow: true,
                modalState: isBrushModalOpen
            },
            {
                id: 'ruler',
                icon: selectedRulerTool?.icon || RulerIcon,
                title: '标尺工具',
                className: 'ruler-button',
                hasArrow: true,
                modalState: isRulerModalOpen
            },
            {
                id: 'text',
                icon: selectedTextTool?.icon || TextIcon,
                title: '文字标记',
                className: 'text-button',
                hasArrow: true,
                modalState: isTextToolModalOpen
            },
            {
                id: 'emoji',
                icon: EmojiIcon,
                title: '表情标记',
                className: 'emoji-button',
                hasArrow: false
            },
            {
                id: 'clear-all-mark',
                icon: TrashIcon,
                title: '删除工具',
                className: 'trash-button',
                hasArrow: false
            },
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {annotationTools.map(tool => {
                    const isActive = activeTool === tool.id ||
                        (tool.id === 'emoji' && isEmojiSelectPopUpOpen) ||
                        (tool.id === 'brush' && isBrushModalOpen) ||
                        (tool.id === 'ruler' && isRulerModalOpen) ||
                        (tool.id === 'text' && isTextToolModalOpen);
                    const onClick = tool.id === 'text'
                        ? this.handleTextToolClick
                        : tool.id === 'emoji'
                            ? this.handleEmojiToolSelect
                            : tool.id === 'brush'
                                ? this.handleBrushClick
                                : tool.id === 'ruler'
                                    ? this.handleRulerClick
                                    : tool.id == 'clear-all-mark'
                                        ? this.handleClearAllMark
                                        : () => this.props.onToolSelect(tool.id);
                    return this.renderToolButton(
                        tool,
                        isActive,
                        onClick,
                        tool.hasArrow,
                        tool.modalState,
                        tool.id === 'brush' ? selectedBrushTool?.icon :
                            tool.id === 'ruler' ? selectedRulerTool?.icon :
                                tool.id === 'text' ? selectedTextTool?.icon : undefined
                    );
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
                {this.renderRulerModal()}
                {this.renderCursorModal()}
                {this.renderEmojiSelectPopUp()}
                {this.renderFibonacciModal()}
                {/* {this.renderGannModal()} */}
                {this.renderProjectInfoModal()}
                {this.renderIrregularShapeModal()}
                {this.renderTextToolModal()}
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