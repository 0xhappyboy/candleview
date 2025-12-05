import React from 'react';
import { ThemeConfig } from '../Theme';
import {
  FibonacciIcon,
  TextIcon,
  EmojiIcon,
  PieChartIcon,
  BrushIcon,
  PencilIcon,
  TrashIcon,
  CursorIcon,
  LineWithDotsIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  LockIcon,
  UnlockIcon,
  AIIcon,
} from '../Icons';
import { EMOJI_LIST, getEmojiCategories } from './EmojiConfig';
import { I18n } from '../I18n';
import { getToolConfig } from './Config';
import { ToolManager } from './ToolManager';
import { CursorType } from '../types';
import { AIConfig } from '../AI/types';

interface LeftPanelProps {
  currentTheme: ThemeConfig;
  activeTool: string | null;
  onToolSelect: (tool: string) => void;
  onTradeClick: () => void;
  chartLayerRef?: React.RefObject<any>;
  selectedEmoji?: string;
  onEmojiSelect?: (emoji: string) => void;
  i18n: I18n;
  // cnalde view ref
  candleViewRef?: React.RefObject<HTMLDivElement | null>;
  // enable AI function
  ai: boolean;
  // ai config list
  aiconfigs: AIConfig[];
  // handle AI function options
  handleAIFunctionSelect: (aiTooleId: string) => void;
}

interface LeftPanelState {
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
  isAIToolsModalOpen: boolean;
  selectedAIBrand: string;
  selectedAIFunction: string;
  lastSelectedTools: {
    drawing: string;
    brush: string;
    ruler: string;
    cursor: string;
    fibonacci: string;
    projectInfo: string;
    irregularShape: string;
    textTool: string;
    aiTools: string;
  };
  arrowButtonStates: {
    [key: string]: boolean;
  };
  toolHoverStates: {
    [key: string]: boolean;
  };
  isSystemSettingsModalOpen: boolean;
  systemSettings: any;
  isMarkLocked: boolean;
  isMarkVisibility: boolean;
  containerHeight: number;
  // enable AI function
  ai: boolean;
  // ai config list
  aiconfigs: AIConfig[];
}

class LeftPanel extends React.Component<LeftPanelProps, LeftPanelState> {
  private drawingModalRef = React.createRef<HTMLDivElement>();
  private emojiPickerRef = React.createRef<HTMLDivElement>();
  private cursorModalRef = React.createRef<HTMLDivElement>();
  private brushModalRef = React.createRef<HTMLDivElement>();
  private rulerModalRef = React.createRef<HTMLDivElement>();
  private fibonacciModalRef = React.createRef<HTMLDivElement>();
  private gannModalRef = React.createRef<HTMLDivElement>();
  private projectInfoModalRef = React.createRef<HTMLDivElement>();
  private irregularShapeModalRef = React.createRef<HTMLDivElement>();
  private aiModalRef = React.createRef<HTMLDivElement>();
  private toolManager: ToolManager | null = new ToolManager();
  // Function pop-up window width
  private functionPopUpWidth = '200px';
  private emojiSelectPopUpWidth = '315px';
  private containerRef = React.createRef<HTMLDivElement>();

  constructor(props: LeftPanelProps) {
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
      isAIToolsModalOpen: false,
      selectedAIBrand: 'openai',
      selectedAIFunction: 'describe-chart',
      lastSelectedTools: {
        drawing: 'line-segment',
        brush: 'pencil',
        ruler: 'pencil',
        cursor: 'cursor-crosshair',
        fibonacci: 'fibonacci-retracement',
        projectInfo: 'time-range',
        irregularShape: 'rectangle',
        textTool: 'text',
        aiTools: 'describe-chart'
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
      },
      isMarkLocked: false,
      isMarkVisibility: true,
      containerHeight: 0,
      // enable AI function
      ai: this.props.ai || false,
      // ai config list
      aiconfigs: this.props.aiconfigs || [],
    };
    this.toolManager = new ToolManager();
  }

  componentDidMount() {
    document.addEventListener('mousedown', (e) => this.handleClickOutside(e), true);
    this.updateContainerHeight();
    window.addEventListener('resize', this.updateContainerHeight);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', (e) => this.handleClickOutside(e), true);
    window.removeEventListener('resize', this.updateContainerHeight);
  }

  componentDidUpdate(prevProps: LeftPanelProps) {
    if (prevProps.ai !== this.props.ai) {
      if (this.props.ai) {
        this.setState({
          ai: this.props.ai
        });
      }
    }
    if (prevProps.aiconfigs !== this.props.aiconfigs) {
      if (this.props.aiconfigs) {
        this.setState({
          aiconfigs: this.props.aiconfigs
        });
      }
    }
    if (prevProps.selectedEmoji !== this.props.selectedEmoji && this.props.selectedEmoji) {
      this.setState({
        selectedEmoji: this.props.selectedEmoji
      });
    }
  }

  private updateContainerHeight = () => {
    if (this.containerRef.current) {
      const height = this.containerRef.current.clientHeight;
      this.setState({ containerHeight: height });
    }
  };

  private getToolConfig() {
    return getToolConfig(this.props.i18n);
  }

  // execute ai
  private exeAI = (aiToolId: string) => {
    this.props.handleAIFunctionSelect(aiToolId)
    // execute ai
  }

  private handleToolAction = (actionType: string, toolId?: string) => {
    const { lastSelectedTools } = this.state;
    // Close all modals first
    const modalCloseUpdates: Partial<LeftPanelState> = {
      arrowButtonStates: {}
    };
    switch (actionType) {
      // Modal toggle actions
      case 'toggle-drawing':
        modalCloseUpdates.isDrawingModalOpen = !this.state.isDrawingModalOpen;
        modalCloseUpdates.arrowButtonStates = { drawing: !this.state.isDrawingModalOpen };
        break;
      case 'toggle-emoji':
        modalCloseUpdates.isEmojiSelectPopUpOpen = !this.state.isEmojiSelectPopUpOpen;
        modalCloseUpdates.arrowButtonStates = { emoji: !this.state.isEmojiSelectPopUpOpen };
        break;
      case 'toggle-brush':
        modalCloseUpdates.isBrushModalOpen = !this.state.isBrushModalOpen;
        modalCloseUpdates.arrowButtonStates = { brush: !this.state.isBrushModalOpen };
        break;
      case 'toggle-cursor':
        modalCloseUpdates.isCursorModalOpen = !this.state.isCursorModalOpen;
        modalCloseUpdates.arrowButtonStates = { cursor: !this.state.isCursorModalOpen };
        break;
      case 'toggle-text':
        modalCloseUpdates.isTextToolModalOpen = !this.state.isTextToolModalOpen;
        modalCloseUpdates.arrowButtonStates = { text: !this.state.isTextToolModalOpen };
        break;
      case 'toggle-fibonacci':
        modalCloseUpdates.isFibonacciModalOpen = !this.state.isFibonacciModalOpen;
        modalCloseUpdates.arrowButtonStates = { fibonacci: !this.state.isFibonacciModalOpen };
        break;
      case 'toggle-project-info':
        modalCloseUpdates.isProjectInfoModalOpen = !this.state.isProjectInfoModalOpen;
        modalCloseUpdates.arrowButtonStates = { 'project-info': !this.state.isProjectInfoModalOpen };
        break;
      case 'toggle-irregular-shape':
        modalCloseUpdates.isIrregularShapeModalOpen = !this.state.isIrregularShapeModalOpen;
        modalCloseUpdates.arrowButtonStates = { 'irregular-shape': !this.state.isIrregularShapeModalOpen };
        break;
      case 'toggle-ai-tools':
        modalCloseUpdates.isAIToolsModalOpen = !this.state.isAIToolsModalOpen;
        modalCloseUpdates.arrowButtonStates = { ai: !this.state.isAIToolsModalOpen };
        break;
      // Tool selection actions
      case 'select-drawing':
        if (toolId) {
          this.setState(prevState => ({
            lastSelectedTools: {
              ...prevState.lastSelectedTools,
              drawing: toolId
            }
          }));
          this.toolManager?.handleDrawingToolSelect(this, toolId);
          this.props.onToolSelect(toolId);
        }
        break;
      case 'select-cursor':
        if (toolId) {
          this.setState(prevState => ({
            selectedCursor: toolId,
            lastSelectedTools: {
              ...prevState.lastSelectedTools,
              cursor: toolId
            }
          }));
          this.handleCursorStyleSelect(toolId);
        }
        break;
      case 'select-brush':
        if (toolId) {
          this.setState(prevState => ({
            lastSelectedTools: {
              ...prevState.lastSelectedTools,
              brush: toolId
            }
          }));
          this.toolManager?.handleDrawingToolSelect(this, toolId);
          this.props.onToolSelect(toolId);
        }
        break;
      case 'select-text':
        if (toolId) {
          this.setState(prevState => ({
            lastSelectedTools: {
              ...prevState.lastSelectedTools,
              textTool: toolId
            }
          }));
          this.toolManager?.handleDrawingToolSelect(this, toolId);
        }
        break;
      case 'select-fibonacci':
        if (toolId) {
          this.setState(prevState => ({
            lastSelectedTools: {
              ...prevState.lastSelectedTools,
              fibonacci: toolId
            }
          }));
          this.toolManager?.handleDrawingToolSelect(this, toolId);
        }
        break;
      case 'select-project-info':
        if (toolId) {
          this.setState(prevState => ({
            lastSelectedTools: {
              ...prevState.lastSelectedTools,
              projectInfo: toolId
            }
          }));
          this.toolManager?.handleDrawingToolSelect(this, toolId);
        }
        break;
      case 'select-irregular-shape':
        if (toolId) {
          this.setState(prevState => ({
            lastSelectedTools: {
              ...prevState.lastSelectedTools,
              irregularShape: toolId
            }
          }));
          this.toolManager?.handleDrawingToolSelect(this, toolId);
        }
        break;
      case 'select-ai':
        if (toolId) {
          this.setState(prevState => ({
            lastSelectedTools: {
              ...prevState.lastSelectedTools,
              ai: toolId
            }
          }));
          this.exeAI(toolId);
        }
        break;
      // Direct tool activation
      case 'activate-tool':
        if (toolId) {
          const toolType = toolId as keyof typeof lastSelectedTools;
          const actualToolId = lastSelectedTools[toolType];
          this.handleDirectToolActivation(toolType, actualToolId);
        }
        break;
      case 'open-system-settings':
        this.setState({ isSystemSettingsModalOpen: true });
        break;
      default:
        break;
    }
    // Apply modal state updates
    if (Object.keys(modalCloseUpdates).length > 0) {
      this.setState(modalCloseUpdates as any);
    }
  };

  private handleDirectToolActivation = (toolType: string, toolId: string) => {
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
      isAIToolsModalOpen: false,
      arrowButtonStates: {}
    });
    switch (toolType) {
      case 'drawing':
        this.handleToolAction('select-drawing', toolId);
        break;
      case 'brush':
        this.handleToolAction('select-brush', toolId);
        break;
      case 'cursor':
        this.handleToolAction('select-cursor', toolId);
        break;
      case 'fibonacci':
        this.handleToolAction('select-fibonacci', toolId);
        break;
      case 'projectInfo':
        this.handleToolAction('select-project-info', toolId);
        break;
      case 'irregularShape':
        this.handleToolAction('select-irregular-shape', toolId);
        break;
      case 'textTool':
        this.handleToolAction('select-text', toolId);
        break;
      case 'aiTools':
        this.handleToolAction('select-ai-function', toolId);
        break;
    }
  };

  // ====================== Drawing Tool Selection Start ======================

  // ====================== Drawing Tool Selection End ======================

  // tap elsewhere on the screen to close all modals.
  private handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    const isArrowButton = target.closest('.arrow-button');
    if (isArrowButton) {
      return;
    }
    const modalCloseUpdates: Partial<LeftPanelState> = {
      arrowButtonStates: {}
    };

    if (this.state.isAIToolsModalOpen &&
      this.aiModalRef.current &&
      !this.aiModalRef.current.contains(target) &&
      !target.closest('.ai-tools-button')) {
      modalCloseUpdates.isAIToolsModalOpen = false;
      modalCloseUpdates.arrowButtonStates!['aiTools'] = false;
    }

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
    switch (cursorId) {
      case 'default':
        this.props.chartLayerRef?.current.setCursorType(CursorType.Default);
        break;
      case 'crosshair':
        this.props.chartLayerRef?.current.setCursorType(CursorType.Crosshair);
        break;
      case 'circle':
        this.props.chartLayerRef?.current.setCursorType(CursorType.Circle);
        break;
      case 'dot':
        this.props.chartLayerRef?.current.setCursorType(CursorType.Dot);
        break;
      case 'sparkle':
        this.props.chartLayerRef?.current.setCursorType(CursorType.Crosshair);
        break;
      case 'emoji':
        this.props.chartLayerRef?.current.setCursorType(CursorType.Crosshair);
        break;
    }
  };

  // handle emoji select
  private handleEmojiSelect = (emoji: string) => {
    this.setState({
      isEmojiSelectPopUpOpen: false
    });
    if (this.state.isMarkLocked) {
      return;
    }
    this.setState({
      selectedEmoji: emoji,
    });
    if (this.props.onEmojiSelect) {
      this.props.onEmojiSelect(emoji);
    }
    if (this.props.chartLayerRef && this.props.chartLayerRef.current) {
      if (this.props.chartLayerRef.current.setEmojiMarkMode) {
        this.props.chartLayerRef.current.setEmojiMarkMode(emoji);
      }
    }
    this.props.onToolSelect('emoji');
  };

  private handleCategorySelect = (categoryId: string) => {
    this.setState({ selectedEmojiCategory: categoryId });
  };

  private renderCursorModal = () => {
    const { currentTheme, activeTool, i18n } = this.props;
    const { isCursorModalOpen } = this.state;
    const { cursorStyles } = this.getToolConfig();
    if (!isCursorModalOpen) return null;
    const maxModalHeight = Math.max(this.state.containerHeight - 100, 200);
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
          maxHeight: `${maxModalHeight}px`,
          overflowY: 'auto',
          paddingBottom: '0px'
        }}
        className="modal-scrollbar"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          <CollapsibleToolGroup
            title={i18n.leftPanel.mouseCursor}
            tools={cursorStyles}
            currentTheme={currentTheme}
            activeTool={activeTool}
            onToolSelect={(toolId) => this.handleToolAction('select-cursor', toolId)}
            defaultOpen={true}
          />
        </div>
      </div>
    );
  };

  private renderCursorTools = () => {
    const { cursorStyles } = this.getToolConfig();
    const selectedCursor = cursorStyles[0];
    const cursorButton = {
      id: 'cursor',
      icon: selectedCursor?.icon || CursorIcon,
      className: 'cursor-button',
      onMainClick: () => this.handleToolAction('activate-tool', 'cursor'),
      onArrowClick: () => this.handleToolAction('toggle-cursor')
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
    const maxModalHeight = Math.max(this.state.containerHeight - 100, 200);
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
          maxHeight: `${maxModalHeight}px`,
          overflowY: 'auto',
          paddingBottom: '0px'
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
              onToolSelect={(toolId) => this.handleToolAction('select-brush', toolId)}
              defaultOpen={true}
            />
          ))}
        </div>
      </div>
    );
  };

  private renderTextToolModal = () => {
    const { currentTheme, activeTool } = this.props;
    const { isTextToolModalOpen } = this.state;
    const { textTools } = this.getToolConfig();
    if (!isTextToolModalOpen) return null;
    const maxModalHeight = Math.max(this.state.containerHeight - 100, 200);
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
          maxHeight: `${maxModalHeight}px`,
          overflowY: 'auto',
          paddingBottom: '0px'
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
              onToolSelect={(toolId) => this.handleToolAction('select-text', toolId)}
              defaultOpen={true}
            />
          ))}
        </div>
      </div>
    );
  };

  private renderEmojiSelectPopUp = () => {
    const { currentTheme } = this.props;
    const { isEmojiSelectPopUpOpen, selectedEmojiCategory } = this.state;
    const localizedCategories = getEmojiCategories(this.props.i18n);
    const currentCategoryEmojis = EMOJI_LIST.filter(emoji =>
      emoji.category === selectedEmojiCategory
    );
    if (!isEmojiSelectPopUpOpen) return null;
    const maxModalHeight = Math.max(this.state.containerHeight - 100, 200);
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
          width: `${this.emojiSelectPopUpWidth}`,
          maxHeight: `${maxModalHeight}px`,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '0px'
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
            {this.props.i18n.leftPanel.selectEmoji}
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
          overflowY: 'auto',
        }} className="custom-scrollbar">
          {localizedCategories.map((category) => (
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
              {category.getName ? category.getName(this.props.i18n) : category.name}
            </button>
          ))}
        </div>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          maxHeight: `${Math.max(maxModalHeight - 150, 100)}px`,
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
                title={emoji.getName ? emoji.getName(this.props.i18n) : emoji.name}
              >
                {emoji.character}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  private renderAIToolsModal = () => {
    const { currentTheme, activeTool } = this.props;
    const { isAIToolsModalOpen } = this.state;
    const { aiTools } = this.getToolConfig();
    if (!isAIToolsModalOpen) return null;
    const filteredAiTools = aiTools.filter(group => {
      const brandExists = this.state.aiconfigs.some(config =>
        config.brand === group.title.toLowerCase()
      );
      return brandExists;
    });
    const maxModalHeight = Math.max(this.state.containerHeight - 100, 200);
    return (
      <div
        ref={this.aiModalRef}
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
          maxHeight: `${maxModalHeight}px`,
          overflowY: 'auto',
          paddingBottom: '0px'
        }}
        className="modal-scrollbar"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {filteredAiTools.map((group, index) => (
            <CollapsibleToolGroup
              key={group.title}
              title={group.title}
              tools={group.tools}
              currentTheme={currentTheme}
              activeTool={activeTool}
              onToolSelect={(toolId) => this.handleToolAction('select-ai', toolId)}
              defaultOpen={true}
            />
          ))}
        </div>
      </div>
    );
  };

  private renderDrawingModal = () => {
    const { currentTheme, activeTool } = this.props;
    const { isDrawingModalOpen } = this.state;
    const { drawingTools } = this.getToolConfig();
    if (!isDrawingModalOpen) return null;
    const maxModalHeight = Math.max(this.state.containerHeight - 100, 200);
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
          maxHeight: `${maxModalHeight}px`,
          overflowY: 'auto',
          paddingBottom: '0px'
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
              onToolSelect={(toolId) => this.handleToolAction('select-drawing', toolId)}
              defaultOpen={true}
            />
          ))}
        </div>
      </div>
    );
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
            size={23}
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
      className: 'drawing-button',
      onMainClick: () => this.handleToolAction('activate-tool', 'drawing'),
      onArrowClick: () => this.handleToolAction('toggle-drawing')
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

  private renderFibonacciModal = () => {
    const { currentTheme, activeTool } = this.props;
    const { isFibonacciModalOpen } = this.state;
    const { gannAndFibonacciTools } = this.getToolConfig();
    if (!isFibonacciModalOpen) return null;
    const maxModalHeight = Math.max(this.state.containerHeight - 100, 200);
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
          maxHeight: `${maxModalHeight}px`,
          overflowY: 'auto',
          paddingBottom: '0px'
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
              onToolSelect={(toolId) => this.handleToolAction('select-fibonacci', toolId)}
              defaultOpen={true}
            />
          ))}
        </div>
      </div>
    );
  };

  private renderProjectInfoModal = () => {
    const { currentTheme, activeTool } = this.props;
    const { isProjectInfoModalOpen } = this.state;
    const { projectInfoTools } = this.getToolConfig();
    if (!isProjectInfoModalOpen) return null;
    const maxModalHeight = Math.max(this.state.containerHeight - 100, 200);
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
          maxHeight: `${maxModalHeight}px`,
          overflowY: 'auto',
          paddingBottom: '0px'
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
              onToolSelect={(toolId) => this.handleToolAction('select-project-info', toolId)}
              defaultOpen={true}
            />
          ))}
        </div>
      </div>
    );
  };

  private renderIrregularShapeModal = () => {
    const { currentTheme, activeTool } = this.props;
    const { isIrregularShapeModalOpen } = this.state;
    const { irregularShapeTools } = this.getToolConfig();
    if (!isIrregularShapeModalOpen) return null;
    const maxModalHeight = Math.max(this.state.containerHeight - 100, 200);
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
          maxHeight: `${maxModalHeight}px`,
          overflowY: 'auto',
          paddingBottom: '0px'
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
              onToolSelect={(toolId) => this.handleToolAction('select-irregular-shape', toolId)}
              defaultOpen={true}
            />
          ))}
        </div>
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
        className: 'fibonacci-button',
        onMainClick: () => this.handleToolAction('activate-tool', 'fibonacci'),
        onArrowClick: () => this.handleToolAction('toggle-fibonacci')
      },
      {
        id: 'project-info',
        icon: selectedProjectInfoTool?.icon || PieChartIcon,
        className: 'project-info-button',
        onMainClick: () => this.handleToolAction('activate-tool', 'projectInfo'),
        onArrowClick: () => this.handleToolAction('toggle-project-info')
      },
      {
        id: 'irregular-shape',
        icon: selectedIrregularShapeTool?.icon || PencilIcon,
        className: 'irregular-shape-button',
        onMainClick: () => this.handleToolAction('activate-tool', 'irregularShape'),
        onArrowClick: () => this.handleToolAction('toggle-irregular-shape')
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

  private renderTrash = () => {
    const { lastSelectedTools } = this.state;
    const { penTools, textTools } = this.getToolConfig();
    const selectedBrushTool = this.findToolInGroups(penTools, lastSelectedTools.brush);
    const selectedTextTool = this.findToolInGroups(textTools, lastSelectedTools.textTool);
    const annotationTools = [
      {
        id: 'clear-all-mark',
        icon: TrashIcon,
        className: 'trash-button',
        hasArrow: false,
        onMainClick: () => {
          if (this.props.chartLayerRef?.current?.clearAllMark) {
            this.props.chartLayerRef.current.clearAllMark();
          }
        },
        onArrowClick: () => { }
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
              tool.id === 'text' ? selectedTextTool?.icon : undefined
          )
        ))}
      </div>
    );
  }

  private renderMarkTools = () => {
    const { lastSelectedTools } = this.state;
    const { penTools, textTools } = this.getToolConfig();
    const selectedBrushTool = this.findToolInGroups(penTools, lastSelectedTools.brush);
    const selectedTextTool = this.findToolInGroups(textTools, lastSelectedTools.textTool);
    const annotationTools = [
      {
        id: 'brush',
        icon: selectedBrushTool?.icon || BrushIcon,
        className: 'brush-button',
        hasArrow: true,
        onMainClick: () => this.handleToolAction('activate-tool', 'brush'),
        onArrowClick: () => this.handleToolAction('toggle-brush')
      },
      {
        id: 'text',
        icon: selectedTextTool?.icon || TextIcon,
        className: 'text-button',
        hasArrow: true,
        onMainClick: () => this.handleToolAction('activate-tool', 'textTool'),
        onArrowClick: () => this.handleToolAction('toggle-text')
      },
      {
        id: 'emoji',
        icon: EmojiIcon,
        className: 'emoji-button',
        hasArrow: true,
        onMainClick: () => this.handleToolAction('activate-tool', 'emoji'),
        onArrowClick: () => this.handleToolAction('toggle-emoji')
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
              tool.id === 'text' ? selectedTextTool?.icon : undefined
          )
        ))}
      </div>
    );
  };

  private renderAITools = () => {
    const { aiTools } = this.getToolConfig();
    const { lastSelectedTools } = this.state;
    let selectedAITool = null;
    for (const group of aiTools) {
      const tool = group.tools.find(t => t.id === lastSelectedTools.aiTools);
      if (tool) {
        selectedAITool = tool;
        break;
      }
    }
    const aiButton = {
      id: 'ai',
      icon: selectedAITool?.icon || AIIcon,
      className: 'ai-tools-button',
      onMainClick: () => {
        this.handleToolAction('toggle-ai-tools');
      },
      onArrowClick: () => {
        this.handleToolAction('toggle-ai-tools');
      }
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {this.renderToolButton(
          aiButton,
          aiButton.onMainClick,
          aiButton.onArrowClick,
          true,
          selectedAITool?.icon
        )}
      </div>
    );
  };

  private renderOtherTools = () => {
    const { isMarkLocked, isMarkVisibility } = this.state;
    const analysisTools = [
      {
        id: 'lock',
        icon: isMarkLocked ? LockIcon : UnlockIcon,
        className: 'lock-button',
        onMainClick: () => {
          this.setState({ isMarkLocked: !isMarkLocked });
        },
        onArrowClick: () => { }
      },
      {
        id: 'eye',
        icon: isMarkVisibility ? EyeOpenIcon : EyeClosedIcon,
        className: 'eye-button',
        onMainClick: () => {
          const visibility = !isMarkVisibility;
          this.setState({ isMarkVisibility: visibility });
          if (this.props.chartLayerRef && this.props.chartLayerRef.current) {
            if (visibility) {
              if (this.props.chartLayerRef.current.showAllMark) {
                this.props.chartLayerRef.current.showAllMark();
              }
            } else {
              if (this.props.chartLayerRef.current.hideAllMark) {
                this.props.chartLayerRef.current.hideAllMark();
              }
            }
          }
        },
        onArrowClick: () => { }
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
    return (
      <div ref={this.containerRef} style={{ position: 'relative', height: '100%' }}>
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
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '12px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0px',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE 10+
            }}>
              <style>{`
              [style*="overflowY: auto"]::-webkit-scrollbar {
                width: 0px;
                height: 0px;
                background: transparent;
              }
              [style*="overflowY: auto"]::-webkit-scrollbar-thumb {
                background: transparent;
              }
              [style*="overflowY: auto"]::-webkit-scrollbar-track {
                background: transparent;
              }
            `}</style>
              {this.renderCursorTools()}
              {this.renderLineTools()}
              {this.renderTecGraphTools()}
              {this.renderMarkTools()}
              {this.props.ai && (
                <div style={{
                  height: '1px',
                  background: this.props.currentTheme.toolbar.border,
                  margin: '10px 0',
                }} />
              )}
              {this.props.ai && this.renderAITools()}
              <div style={{
                height: '1px',
                background: this.props.currentTheme.toolbar.border,
                margin: '10px 0',
              }} />
              {this.renderOtherTools()}
              <div style={{
                height: '1px',
                background: this.props.currentTheme.toolbar.border,
                margin: '10px 0',
              }} />
              {this.renderTrash()}
            </div>
          </div>
        </div>
        {this.renderDrawingModal()}
        {this.renderBrushModal()}
        {this.renderCursorModal()}
        {this.renderEmojiSelectPopUp()}
        {this.renderFibonacciModal()}
        {this.renderProjectInfoModal()}
        {this.renderIrregularShapeModal()}
        {this.renderTextToolModal()}
        {this.props.ai && (
          this.renderAIToolsModal()
        )}
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
                      padding: '10px 10px',
                      borderRadius: '0px',
                      color: isActive
                        ? currentTheme.toolbar.button.activeTextColor || '#FFFFFF'
                        : currentTheme.layout.textColor,
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
                      size={24}
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
                      paddingLeft: '5px',
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

export default LeftPanel;
