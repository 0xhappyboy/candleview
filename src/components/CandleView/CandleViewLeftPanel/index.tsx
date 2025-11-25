
import React from 'react';
import { ThemeConfig } from '../Theme';
import {
    FibonacciIcon,
    SettingsIcon,
    TextIcon,
    EmojiIcon,
    PieChartIcon,
    BrushIcon,
    PencilIcon,
    TrashIcon,
    CursorIcon,
    LineWithDotsIcon,
} from '../Icons';
import { CandleViewLeftPanelToolManager } from './CandleViewLeftPanelToolManager';
import { EMOJI_CATEGORIES, EMOJI_LIST } from './EmojiConfig';
import { I18n } from '../I18n';
import { getToolConfig } from './CandleViewLeftPanelConfig';
import SystemSettingsModal from './SystemSettingsModal';

interface CandleViewLeftPanelProps {
    currentTheme: ThemeConfig;
    activeTool: string | null;
    onToolSelect: (tool: string) => void;
    onTradeClick: () => void;
    showToolbar?: boolean;
    drawingLayerRef?: React.RefObject<any>;
    selectedEmoji?: string;
    onEmojiSelect?: (emoji: string) => void;
    i18n: I18n;
    candleViewContainerRef?: React.RefObject<HTMLDivElement | null>;
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
    arrowButtonStates: {
        [key: string]: boolean;
    };
    toolHoverStates: {
        [key: string]: boolean;
    };
    isSystemSettingsModalOpen: boolean;
    systemSettings: any;
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
            },
            arrowButtonStates: {},
            toolHoverStates: {},
            isSystemSettingsModalOpen: false,
            systemSettings: {
                language: 'zh-CN',
                themeMode: 'light',
                autoSave: true,
                showGrid: true,
                hardwareAcceleration: true,
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

    private getToolConfig() {
        return getToolConfig(this.props.i18n);
    }

    private handleArrowButtonClick = (toolId: string, currentModalState: boolean) => {
        const newModalState = !currentModalState;
        const modalStateUpdates: any = {
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isRulerModalOpen: false,
            isCursorModalOpen: false,
            isFibonacciModalOpen: false,
            isGannModalOpen: false,
            isProjectInfoModalOpen: false,
            isIrregularShapeModalOpen: false,
            isTextToolModalOpen: false,
            arrowButtonStates: {}
        };
        if (newModalState) {
            switch (toolId) {
                case 'drawing':
                    modalStateUpdates.isDrawingModalOpen = true;
                    break;
                case 'brush':
                    modalStateUpdates.isBrushModalOpen = true;
                    break;
                case 'ruler':
                    modalStateUpdates.isRulerModalOpen = true;
                    break;
                case 'cursor':
                    modalStateUpdates.isCursorModalOpen = true;
                    break;
                case 'text':
                    modalStateUpdates.isTextToolModalOpen = true;
                    break;
                case 'fibonacci':
                    modalStateUpdates.isFibonacciModalOpen = true;
                    break;
                case 'project-info':
                    modalStateUpdates.isProjectInfoModalOpen = true;
                    break;
                case 'irregular-shape':
                    modalStateUpdates.isIrregularShapeModalOpen = true;
                    break;
                case 'emoji':
                    modalStateUpdates.isEmojiSelectPopUpOpen = true;
                    break;
            }
            modalStateUpdates.arrowButtonStates = {
                [toolId]: true
            };
        }
        this.setState(modalStateUpdates);
        if (!newModalState) {
            this.props.onToolSelect('');
        }
    };

    private handleMainButtonClick = (toolType: string) => {
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
            isTextToolModalOpen: false,
            arrowButtonStates: {}
        });
        this.handleDirectToolSelect(toolType);
    };

    private handleEmojiClick = () => {
        this.handleArrowButtonClick('emoji', this.state.isEmojiSelectPopUpOpen);
    };
    // ====================== Drawing Tool Selection Start ======================
    private handleDrawingToolSelect = (toolId: string) => {
        this.setState(prevState => ({
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                drawing: toolId
            },
            arrowButtonStates: {
                ...prevState.arrowButtonStates,
                drawing: false
            }
        }));
        this.candleViewLeftPanelToolManager?.handleDrawingToolSelect(this, toolId);
        this.props.onToolSelect(toolId);
    };


    // ====================== Drawing Tool Selection End ======================

    // tap elsewhere on the screen to close all modals.
    private handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;

        const isArrowButton = target.closest('.arrow-button');
        if (isArrowButton) {
            return;
        }

        const modalCloseUpdates: Partial<CandleViewLeftPanelState> = {
            arrowButtonStates: {}
        };

        if (this.state.isEmojiSelectPopUpOpen &&
            this.emojiPickerRef.current &&
            !this.emojiPickerRef.current.contains(target) &&
            !target.closest('.emoji-button')) {
            modalCloseUpdates.isEmojiSelectPopUpOpen = false;
            modalCloseUpdates.arrowButtonStates!['emoji'] = false;
        }

        if (this.state.isTextToolModalOpen &&
            this.rulerModalRef.current &&
            !this.rulerModalRef.current.contains(target) &&
            !target.closest('.ruler-button')) {
            modalCloseUpdates.isTextToolModalOpen = false;
            modalCloseUpdates.arrowButtonStates!['text'] = false;
        }

        if (this.state.isRulerModalOpen &&
            this.rulerModalRef.current &&
            !this.rulerModalRef.current.contains(target) &&
            !target.closest('.ruler-button')) {
            modalCloseUpdates.isRulerModalOpen = false;
            modalCloseUpdates.arrowButtonStates!['ruler'] = false;
        }

        if (this.state.isDrawingModalOpen &&
            this.drawingModalRef.current &&
            !this.drawingModalRef.current.contains(target) &&
            !target.closest('.drawing-button')) {
            modalCloseUpdates.isDrawingModalOpen = false;
            modalCloseUpdates.arrowButtonStates!['drawing'] = false;
        }

        if (this.state.isEmojiSelectPopUpOpen &&
            this.emojiPickerRef.current &&
            !this.emojiPickerRef.current.contains(target) &&
            !target.closest('.emoji-button')) {
            modalCloseUpdates.isEmojiSelectPopUpOpen = false;
        }

        if (this.state.isBrushModalOpen &&
            this.brushModalRef.current &&
            !this.brushModalRef.current.contains(target) &&
            !target.closest('.brush-button')) {
            modalCloseUpdates.isBrushModalOpen = false;
            modalCloseUpdates.arrowButtonStates!['brush'] = false;
        }

        if (this.state.isCursorModalOpen &&
            this.cursorModalRef.current &&
            !this.cursorModalRef.current.contains(target) &&
            !target.closest('.cursor-button')) {
            modalCloseUpdates.isCursorModalOpen = false;
            modalCloseUpdates.arrowButtonStates!['cursor'] = false;
        }

        if (this.state.isFibonacciModalOpen &&
            this.fibonacciModalRef.current &&
            !this.fibonacciModalRef.current.contains(target) &&
            !target.closest('.fibonacci-button')) {
            modalCloseUpdates.isFibonacciModalOpen = false;
            modalCloseUpdates.arrowButtonStates!['fibonacci'] = false;
        }

        if (this.state.isGannModalOpen &&
            this.gannModalRef.current &&
            !this.gannModalRef.current.contains(target) &&
            !target.closest('.gann-button')) {
            modalCloseUpdates.isGannModalOpen = false;
            modalCloseUpdates.arrowButtonStates!['gann'] = false;
        }

        if (this.state.isProjectInfoModalOpen &&
            this.projectInfoModalRef.current &&
            !this.projectInfoModalRef.current.contains(target) &&
            !target.closest('.project-info-button')) {
            modalCloseUpdates.isProjectInfoModalOpen = false;
            modalCloseUpdates.arrowButtonStates!['project-info'] = false;
        }

        if (this.state.isIrregularShapeModalOpen &&
            this.irregularShapeModalRef.current &&
            !this.irregularShapeModalRef.current.contains(target) &&
            !target.closest('.irregular-shape-button')) {
            modalCloseUpdates.isIrregularShapeModalOpen = false;
            modalCloseUpdates.arrowButtonStates!['irregular-shape'] = false;
        }

        if (Object.keys(modalCloseUpdates).length > 1) {
            this.setState(modalCloseUpdates as any);
        }
    };

    private handleCursorStyleSelect = (cursorId: string) => {
        this.setState(prevState => ({
            isCursorModalOpen: false,
            selectedCursor: cursorId,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                cursor: cursorId
            },
            arrowButtonStates: {
                ...prevState.arrowButtonStates,
                cursor: false
            }
        }));
        this.props.onToolSelect(cursorId);
    };

    private handleRulerToolSelect = (toolId: string) => {
        this.setState(prevState => ({
            isRulerModalOpen: false,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                ruler: toolId
            },
            arrowButtonStates: {
                ...prevState.arrowButtonStates,
                ruler: false
            }
        }));
        this.props.onToolSelect(toolId);
    };



    private handleBrushToolSelect = (toolId: string) => {
        this.setState(prevState => ({
            isBrushModalOpen: false,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                brush: toolId
            },
            arrowButtonStates: {
                ...prevState.arrowButtonStates,
                brush: false
            }
        }));
        this.candleViewLeftPanelToolManager?.handleDrawingToolSelect(this, toolId);
        this.props.onToolSelect(toolId);
    };


    private renderCursorModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isCursorModalOpen } = this.state;
        const { cursorStyles } = this.getToolConfig();

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
        const { lastSelectedTools } = this.state;
        const { cursorStyles } = this.getToolConfig();
        const selectedCursor = cursorStyles.find(tool => tool.id === lastSelectedTools.cursor);
        const cursorButton = {
            id: 'cursor',
            icon: selectedCursor?.icon || CursorIcon,
            title: 'Mouse Cursor',
            className: 'cursor-button',
            onMainClick: () => this.handleMainButtonClick('cursor'),
            onArrowClick: this.handleCursorClick
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {this.renderToolButton(
                    cursorButton,
                    cursorButton.onMainClick,
                    cursorButton.onArrowClick,
                    true,
                    selectedCursor?.icon
                )}
            </div>
        );
    };

    private renderBrushModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isBrushModalOpen } = this.state;
        const { penTools } = this.getToolConfig();

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
        const { textTools } = this.getToolConfig();
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

    private getBrushToolName(toolId: string): string {
        const { penTools } = this.getToolConfig();
        for (const group of penTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    // handle emoji select
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
                {/* <div style={{
                    padding: '12px',
                    background: currentTheme.toolbar.button.active + '20',
                    borderTop: `1px solid ${currentTheme.toolbar.button.active}`,
                    fontSize: '12px',
                    color: currentTheme.layout.textColor,
                    textAlign: 'center',
                    flexShrink: 0,
                }}>
                    已选择: {this.state.selectedEmoji} - 点击图表放置表情
                </div> */}
            </div>
        );
    };

    private renderDrawingModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isDrawingModalOpen } = this.state;
        const { drawingTools } = this.getToolConfig();
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
        const { drawingTools } = this.getToolConfig();
        for (const group of drawingTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    private handleDrawingClick = () => {
        this.handleArrowButtonClick('drawing', this.state.isDrawingModalOpen);
    };

    private handleBrushClick = () => {
        this.handleArrowButtonClick('brush', this.state.isBrushModalOpen);
    };

    private handleRulerClick = () => {
        this.handleArrowButtonClick('ruler', this.state.isRulerModalOpen);
    };

    private handleCursorClick = () => {
        this.handleArrowButtonClick('cursor', this.state.isCursorModalOpen);
    };

    private handleTextToolClick = () => {
        this.handleArrowButtonClick('text', this.state.isTextToolModalOpen);
    };

    private handleFibonacciClick = () => {
        this.handleArrowButtonClick('fibonacci', this.state.isFibonacciModalOpen);
    };

    private handleProjectInfoClick = () => {
        this.handleArrowButtonClick('project-info', this.state.isProjectInfoModalOpen);
    };

    private handleIrregularShapeClick = () => {
        this.handleArrowButtonClick('irregular-shape', this.state.isIrregularShapeModalOpen);
    };

    public handleTextToolSelect = (toolId: string) => {
        this.setState(prevState => ({
            isTextToolModalOpen: false,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                textTool: toolId
            },
            arrowButtonStates: {
                ...prevState.arrowButtonStates,
                text: false
            }
        }));
        this.candleViewLeftPanelToolManager?.handleDrawingToolSelect(this, toolId);
    };

    private handleFibonacciToolSelect = (toolId: string) => {
        this.setState(prevState => ({
            isFibonacciModalOpen: false,
            lastSelectedTools: {
                ...prevState.lastSelectedTools,
                fibonacci: toolId
            },
            arrowButtonStates: {
                ...prevState.arrowButtonStates,
                fibonacci: false
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
            },
            arrowButtonStates: {
                ...prevState.arrowButtonStates,
                'project-info': false
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
            },
            arrowButtonStates: {
                ...prevState.arrowButtonStates,
                'irregular-shape': false
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
            isTextToolModalOpen: false,
            arrowButtonStates: {}
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

    private renderToolButton = (
        tool: any,
        onMainButtonClick: () => void,
        onArrowButtonClick: () => void,
        hasArrow: boolean = false,
        dynamicIcon?: React.ComponentType<any>
    ) => {
        const { currentTheme } = this.props;
        const IconComponent = dynamicIcon || tool.icon;
        const isArrowActive = this.state.arrowButtonStates[tool.id] || false;
        const showArrow = this.state.toolHoverStates[tool.id] || false;

        return (
            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    background: 'transparent',
                    transition: 'all 0.2s ease',
                }}
                className="tool-button-container"
                onMouseEnter={() => this.setState(prevState => ({
                    toolHoverStates: {
                        ...prevState.toolHoverStates,
                        [tool.id]: true
                    }
                }))}
                onMouseLeave={() => this.setState(prevState => ({
                    toolHoverStates: {
                        ...prevState.toolHoverStates,
                        [tool.id]: false
                    }
                }))}
            >
                <button
                    key={tool.id}
                    title={tool.title}
                    onClick={onMainButtonClick}
                    className={tool.className || ''}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '0px',
                        padding: '0px',
                        cursor: 'pointer',
                        color: currentTheme.toolbar.button.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        height: '35px',
                        width: hasArrow ? '35px' : '100%',
                        flex: 'none',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <IconComponent
                        size={20}
                        color={currentTheme.toolbar.button.color}
                    />
                </button>

                {hasArrow && showArrow && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onArrowButtonClick();
                        }}
                        className="arrow-button"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0px',
                            cursor: 'pointer',
                            color: currentTheme.toolbar.button.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            height: '35px',
                            width: '13px',
                            flex: 'none',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            position: 'absolute',
                            paddingLeft: '8px',
                            marginLeft: '30px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.active;
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                        }}
                    >
                        <span style={{
                            fontSize: '18px',
                        }}>
                            {isArrowActive ? '‹' : '›'}
                        </span>
                    </button>
                )}
            </div>
        );
    };

    private renderLineTools = () => {
        const { drawingTools } = this.getToolConfig();
        const { lastSelectedTools } = this.state;
        const selectedDrawingTool = this.findToolInGroups(drawingTools, lastSelectedTools.drawing);
        const drawingButton = {
            id: 'drawing',
            icon: selectedDrawingTool?.icon || LineWithDotsIcon,
            title: 'Drawing Tools',
            className: 'drawing-button',
            onMainClick: () => this.handleMainButtonClick('drawing'),
            onArrowClick: this.handleDrawingClick
        };

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0px',
                width: '100%'
            }}>
                {this.renderToolButton(
                    drawingButton,
                    drawingButton.onMainClick,
                    drawingButton.onArrowClick,
                    true,
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
        const { gannAndFibonacciTools } = this.getToolConfig();
        for (const group of gannAndFibonacciTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    private getProjectInfoToolName(toolId: string): string {
        const { projectInfoTools } = this.getToolConfig();
        for (const group of projectInfoTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    private getIrregularShapeToolName(toolId: string): string {
        const { irregularShapeTools } = this.getToolConfig();
        for (const group of irregularShapeTools) {
            const tool = group.tools.find(t => t.id === toolId);
            if (tool) return tool.name;
        }
        return toolId;
    }

    private renderFibonacciModal = () => {
        const { currentTheme, activeTool } = this.props;
        const { isFibonacciModalOpen } = this.state;
        const { gannAndFibonacciTools } = this.getToolConfig();
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
        const { projectInfoTools } = this.getToolConfig();
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
        const { irregularShapeTools } = this.getToolConfig();
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

    private renderTecGraphTools = () => {
        const { lastSelectedTools } = this.state;
        const { irregularShapeTools, gannAndFibonacciTools, projectInfoTools } = this.getToolConfig();
        const selectedFibonacciTool = this.findToolInGroups(gannAndFibonacciTools, lastSelectedTools.fibonacci);
        const selectedProjectInfoTool = this.findToolInGroups(projectInfoTools, lastSelectedTools.projectInfo);
        const selectedIrregularShapeTool = this.findToolInGroups(irregularShapeTools, lastSelectedTools.irregularShape);
        const additionalTools = [
            {
                id: 'fibonacci',
                icon: selectedFibonacciTool?.icon || FibonacciIcon,
                title: '斐波那契工具',
                className: 'fibonacci-button',
                onMainClick: () => this.handleMainButtonClick('fibonacci'),
                onArrowClick: this.handleFibonacciClick
            },
            {
                id: 'project-info',
                icon: selectedProjectInfoTool?.icon || PieChartIcon,
                title: '项目信息工具',
                className: 'project-info-button',
                onMainClick: () => this.handleMainButtonClick('project-info'),
                onArrowClick: this.handleProjectInfoClick
            },
            {
                id: 'irregular-shape',
                icon: selectedIrregularShapeTool?.icon || PencilIcon,
                title: '图形工具',
                className: 'irregular-shape-button',
                onMainClick: () => this.handleMainButtonClick('irregular-shape'),
                onArrowClick: this.handleIrregularShapeClick
            },
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {additionalTools.map(tool => (
                    this.renderToolButton(
                        tool,
                        tool.onMainClick,
                        tool.onArrowClick,
                        true,
                        tool.id === 'fibonacci' ? selectedFibonacciTool?.icon :
                            tool.id === 'project-info' ? selectedProjectInfoTool?.icon :
                                selectedIrregularShapeTool?.icon
                    )
                ))}
            </div>
        );
    };

    private renderMarkTools = () => {
        const { lastSelectedTools } = this.state;
        const { penTools, textTools } = this.getToolConfig();
        const selectedBrushTool = this.findToolInGroups(penTools, lastSelectedTools.brush);
        // const selectedRulerTool = this.findToolInGroups(rulerTools, lastSelectedTools.ruler);
        const selectedTextTool = this.findToolInGroups(textTools, lastSelectedTools.textTool);
        const annotationTools = [
            {
                id: 'brush',
                icon: selectedBrushTool?.icon || BrushIcon,
                title: '画笔',
                className: 'brush-button',
                hasArrow: true,
                onMainClick: () => this.handleMainButtonClick('brush'),
                onArrowClick: this.handleBrushClick
            },
            // {
            //     id: 'ruler',
            //     icon: selectedRulerTool?.icon || RulerIcon,
            //     title: '标尺工具',
            //     className: 'ruler-button',
            //     hasArrow: true,
            //     onMainClick: () => this.handleMainButtonClick('ruler'),
            //     onArrowClick: this.handleRulerClick
            // },
            {
                id: 'text',
                icon: selectedTextTool?.icon || TextIcon,
                title: '文字标记',
                className: 'text-button',
                hasArrow: true,
                onMainClick: () => this.handleMainButtonClick('text'),
                onArrowClick: this.handleTextToolClick
            },
            {
                id: 'emoji',
                icon: EmojiIcon,
                title: '表情标记',
                className: 'emoji-button',
                hasArrow: true,
                onMainClick: () => this.handleMainButtonClick('emoji'),
                onArrowClick: this.handleEmojiClick
            },
            {
                id: 'clear-all-mark',
                icon: TrashIcon,
                title: '删除工具',
                className: 'trash-button',
                hasArrow: false,
                onMainClick: this.handleClearAllMark,
                onArrowClick: this.handleClearAllMark
            },
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {annotationTools.map(tool => (
                    this.renderToolButton(
                        tool,
                        tool.onMainClick,
                        tool.onArrowClick,
                        tool.hasArrow,
                        tool.id === 'brush' ? selectedBrushTool?.icon :
                            // tool.id === 'ruler' ? selectedRulerTool?.icon :
                            tool.id === 'text' ? selectedTextTool?.icon : undefined
                    )
                ))}
            </div>
        );
    };


    // 

    private handleSystemSettingsOpen = () => {
        this.setState({
            isSystemSettingsModalOpen: true,
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
        });
    };

    private handleSystemSettingsClose = () => {
        this.setState({ isSystemSettingsModalOpen: false });
    };

    private handleSystemSettingsConfirm = (settings: any) => {
        this.setState({
            systemSettings: settings,
            isSystemSettingsModalOpen: false
        });
    };

    private renderAnalysisTools = () => {
        const analysisTools = [
            {
                id: 'settings',
                icon: SettingsIcon,
                title: '系统设置',
                className: 'indicator-button',
                onMainClick: this.handleSystemSettingsOpen,
                onArrowClick: this.handleSystemSettingsOpen
            },
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {analysisTools.map(tool => (
                    this.renderToolButton(
                        tool,
                        tool.onMainClick,
                        tool.onArrowClick,
                        false,
                        undefined
                    )
                ))}
            </div>
        );
    };

    render() {
        const { showToolbar = true } = this.props;
        if (!showToolbar) return null;
        return (
            <div style={{ position: 'relative' }}>
                <SystemSettingsModal
                    isOpen={this.state.isSystemSettingsModalOpen}
                    onClose={this.handleSystemSettingsClose}
                    onConfirm={this.handleSystemSettingsConfirm}
                    initialSettings={this.state.systemSettings}
                    theme={this.props.currentTheme}
                    candleViewContainerRef={this.props.candleViewContainerRef}
                    i18n={this.props.i18n}
                />
                <div style={{
                    background: this.props.currentTheme.panel.backgroundColor,
                    borderRight: `1px solid ${this.props.currentTheme.panel.borderColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '50px',
                    boxSizing: 'border-box',
                    height: '100%',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        flex: 1,
                        overflowY: 'hidden',
                        overflowX: 'hidden',
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
                {/* {this.renderRulerModal()} */}
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