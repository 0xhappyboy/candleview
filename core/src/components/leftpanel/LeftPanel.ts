import { Theme } from '../../theme';
import { I18n } from '../../i18n';
import { getToolConfig, ToolConfig } from './Config';
import { getEmojiCategories, EMOJI_LIST, EmojiCategory, EmojiItem } from './EmojiConfig';
import { ToolManager } from './ToolManager';

export interface LeftPanelOptions {
    container: HTMLElement;
    theme: Theme;
    i18n: I18n;
    onToolSelect?: (tool: string) => void;
    chartLayerRef?: any;
    selectedEmoji?: string;
    onEmojiSelect?: (emoji: string) => void;
}

interface LeftPanelState {
    isDrawingModalOpen: boolean;
    isEmojiSelectPopUpOpen: boolean;
    isBrushModalOpen: boolean;
    isCursorModalOpen: boolean;
    isFibonacciModalOpen: boolean;
    isProjectInfoModalOpen: boolean;
    isIrregularShapeModalOpen: boolean;
    isTextToolModalOpen: boolean;
    isAIToolsModalOpen: boolean;
    isScriptModalOpen: boolean;
    selectedEmoji: string;
    selectedEmojiCategory: string;
    selectedCursor: string;
    lastSelectedTools: {
        drawing: string;
        brush: string;
        cursor: string;
        fibonacci: string;
        projectInfo: string;
        irregularShape: string;
        textTool: string;
        aiTools: string;
        script: string;
    };
    arrowButtonStates: Record<string, boolean>;
    toolHoverStates: Record<string, boolean>;
    isMarkLocked: boolean;
    isMarkVisibility: boolean;
    containerHeight: number;
    scrollButtonVisibility: { showTop: boolean; showBottom: boolean };
}

export class LeftPanel {
    public options: LeftPanelOptions;
    private theme: Theme;
    private i18n: I18n;
    private element: HTMLElement | null = null;
    private container: HTMLElement;
    private toolManager: ToolManager;
    private state: LeftPanelState;
    private drawingModalRef: HTMLElement | null = null;
    private emojiPickerRef: HTMLElement | null = null;
    private cursorModalRef: HTMLElement | null = null;
    private brushModalRef: HTMLElement | null = null;
    private fibonacciModalRef: HTMLElement | null = null;
    private projectInfoModalRef: HTMLElement | null = null;
    private irregularShapeModalRef: HTMLElement | null = null;
    private textToolModalRef: HTMLElement | null = null;
    private aiModalRef: HTMLElement | null = null;
    private scriptModalRef: HTMLElement | null = null;
    private scrollContainerRef: HTMLElement | null = null;
    private scrollTopBtn: HTMLElement | null = null;
    private scrollBottomBtn: HTMLElement | null = null;

    constructor(options: LeftPanelOptions) {
        this.options = options;
        this.container = options.container;
        this.theme = options.theme;
        this.i18n = options.i18n;
        this.toolManager = new ToolManager();
        this.state = {
            isDrawingModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            isFibonacciModalOpen: false,
            isProjectInfoModalOpen: false,
            isIrregularShapeModalOpen: false,
            isTextToolModalOpen: false,
            isAIToolsModalOpen: false,
            isScriptModalOpen: false,
            selectedEmoji: options.selectedEmoji || '😀',
            selectedEmojiCategory: 'smileys',
            selectedCursor: 'crosshair',
            lastSelectedTools: {
                drawing: 'line-segment',
                brush: 'pencil',
                cursor: 'crosshair',
                fibonacci: 'fibonacci-retracement',
                projectInfo: 'time-range',
                irregularShape: 'rectangle',
                textTool: 'text',
                aiTools: 'describe-chart',
                script: 'price-event'
            },
            arrowButtonStates: {},
            toolHoverStates: {},
            isMarkLocked: false,
            isMarkVisibility: true,
            containerHeight: 0,
            scrollButtonVisibility: { showTop: false, showBottom: false }
        };
        this.init();
    }

    private injectScrollbarStyles(): void {
        if (document.getElementById('candleview-scrollbar-styles')) return;
        const style = document.createElement('style');
        style.id = 'candleview-scrollbar-styles';
        style.textContent = `
        .modal-scrollbar::-webkit-scrollbar,
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .modal-scrollbar::-webkit-scrollbar-track,
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb,
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(128, 128, 128, 0.5);
            border-radius: 3px;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover,
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(128, 128, 128, 0.7);
        }
        .modal-scrollbar,
        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(128, 128, 128, 0.5) transparent;
        }
    `;
        document.head.appendChild(style);
    }

    private init(): void {
        this.injectScrollbarStyles();
        this.createDOM();
        this.bindEvents();
        this.updateContainerHeight();
        window.addEventListener('resize', () => this.updateContainerHeight());
    }

    private createDOM(): void {
        const colors = this.theme.getColors();
        this.element = document.createElement('div');
        this.element.className = 'candleview-left-panel';
        this.element.style.cssText = `
            position: relative;
            height: 100%;
        `;
        const panel = document.createElement('div');
        panel.style.cssText = `
            background: ${colors.panelBg};
            border-right: 1px solid ${colors.panelBorder};
            display: flex;
            flex-direction: column;
            width: 50px;
            box-sizing: border-box;
            height: 100%;
            overflow: hidden;
            position: relative;
        `;
        const scrollContainerWrapper = document.createElement('div');
        scrollContainerWrapper.style.cssText = `
            flex: 1;
            overflow: hidden;
            position: relative;
        `;
        this.scrollContainerRef = document.createElement('div');
        this.scrollContainerRef.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 12px 6px;
            display: flex;
            flex-direction: column;
            gap: 0px;
            scrollbar-width: none;
            -ms-overflow-style: none;
        `;
        this.scrollContainerRef.appendChild(this.renderCursorTools());
        this.scrollContainerRef.appendChild(this.renderLineTools());
        this.scrollContainerRef.appendChild(this.renderTecGraphTools());
        this.scrollContainerRef.appendChild(this.renderMarkTools());
        this.addDivider();
        this.scrollContainerRef.appendChild(this.renderAITools());
        this.scrollContainerRef.appendChild(this.renderTerminalButton());
        this.addDivider();
        this.scrollContainerRef.appendChild(this.renderOtherTools());
        this.addDivider();
        this.scrollContainerRef.appendChild(this.renderTrash());
        scrollContainerWrapper.appendChild(this.scrollContainerRef);
        panel.appendChild(scrollContainerWrapper);
        this.scrollTopBtn = document.createElement('button');
        this.scrollTopBtn.className = 'scroll-top-btn';
        this.scrollTopBtn.innerHTML = '▲';
        this.scrollTopBtn.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 10;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(8px);
            border: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0;
            padding: 6px;
            cursor: pointer;
            color: rgba(255, 255, 255, 0.9);
            display: none;
            align-items: center;
            justify-content: center;
            height: 30px;
            width: 100%;
            margin: 0;
            box-shadow: none;
        `;
        this.scrollTopBtn.onclick = () => this.scrollToTop();

        this.scrollBottomBtn = document.createElement('button');
        this.scrollBottomBtn.className = 'scroll-bottom-btn';
        this.scrollBottomBtn.innerHTML = '▼';
        this.scrollBottomBtn.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 10;
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(8px);
            border: none;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0;
            padding: 6px;
            cursor: pointer;
            color: rgba(255, 255, 255, 0.9);
            display: none;
            align-items: center;
            justify-content: center;
            height: 30px;
            width: 100%;
            margin: 0;
            box-shadow: none;
        `;
        this.scrollBottomBtn.onclick = () => this.scrollToBottom();

        panel.appendChild(this.scrollTopBtn);
        panel.appendChild(this.scrollBottomBtn);

        this.element.appendChild(panel);
        this.container.appendChild(this.element);

        this.updateScrollButtonsUI();
    }

    private scrollToTop(): void {
        if (this.scrollContainerRef) {
            this.scrollContainerRef.scrollTop = 0;
            this.updateScrollButtons();
        }
    }

    private scrollToBottom(): void {
        if (this.scrollContainerRef) {
            this.scrollContainerRef.scrollTop = this.scrollContainerRef.scrollHeight;
            this.updateScrollButtons();
        }
    }

    private addDivider(): void {
        const colors = this.theme.getColors();
        const divider = document.createElement('div');
        divider.style.cssText = `
            height: 1px;
            background: ${colors.panelBorder};
            margin: 10px 0;
            flex-shrink: 0;
        `;
        this.scrollContainerRef?.appendChild(divider);
    }

    private renderCursorTools(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `display: flex; flex-direction: column; gap: 0px;`;

        const { cursorStyles } = this.getToolConfig();
        const selectedCursor = cursorStyles.find(c => c.id === this.state.lastSelectedTools.cursor) || cursorStyles[0];

        const btn = this.createToolButton({
            id: 'cursor',
            icon: selectedCursor?.icon || '',
            selectedToolId: this.state.lastSelectedTools.cursor,
            toolGroup: 'cursor',
            hasArrow: true,
            onMainClick: () => this.handleToolAction('activate-tool', 'cursor'),
            onArrowClick: () => this.handleToolAction('toggle-cursor')
        });
        container.appendChild(btn);
        return container;
    }

    private renderLineTools(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `display: flex; flex-direction: column; gap: 0px; width: 100%;`;

        const { drawingTools } = this.getToolConfig();
        const selectedDrawingTool = this.findToolInGroups(drawingTools, this.state.lastSelectedTools.drawing);

        const btn = this.createToolButton({
            id: 'drawing',
            icon: selectedDrawingTool?.icon || '',
            selectedToolId: this.state.lastSelectedTools.drawing,
            toolGroup: 'drawing',
            hasArrow: true,
            onMainClick: () => this.handleToolAction('activate-tool', 'drawing'),
            onArrowClick: () => this.handleToolAction('toggle-drawing')
        });
        container.appendChild(btn);
        return container;
    }

    private renderTecGraphTools(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `display: flex; flex-direction: column; gap: 0px;`;

        const { gannAndFibonacciTools, projectInfoTools, irregularShapeTools } = this.getToolConfig();
        const selectedFibonacciTool = this.findToolInGroups(gannAndFibonacciTools, this.state.lastSelectedTools.fibonacci);
        const selectedProjectInfoTool = this.findToolInGroups(projectInfoTools, this.state.lastSelectedTools.projectInfo);
        const selectedIrregularShapeTool = this.findToolInGroups(irregularShapeTools, this.state.lastSelectedTools.irregularShape);

        const tools = [
            { id: 'fibonacci', icon: selectedFibonacciTool?.icon || '', selectedToolId: this.state.lastSelectedTools.fibonacci, toolGroup: 'fibonacci', onMainClick: () => this.handleToolAction('activate-tool', 'fibonacci'), onArrowClick: () => this.handleToolAction('toggle-fibonacci') },
            { id: 'project-info', icon: selectedProjectInfoTool?.icon || '', selectedToolId: this.state.lastSelectedTools.projectInfo, toolGroup: 'projectInfo', onMainClick: () => this.handleToolAction('activate-tool', 'projectInfo'), onArrowClick: () => this.handleToolAction('toggle-project-info') },
            { id: 'irregular-shape', icon: selectedIrregularShapeTool?.icon || '', selectedToolId: this.state.lastSelectedTools.irregularShape, toolGroup: 'irregularShape', onMainClick: () => this.handleToolAction('activate-tool', 'irregularShape'), onArrowClick: () => this.handleToolAction('toggle-irregular-shape') }
        ];

        tools.forEach(tool => {
            container.appendChild(this.createToolButton({
                id: tool.id,
                icon: tool.icon,
                selectedToolId: tool.selectedToolId,
                toolGroup: tool.toolGroup,
                hasArrow: true,
                onMainClick: tool.onMainClick,
                onArrowClick: tool.onArrowClick
            }));
        });
        return container;
    }

    private renderMarkTools(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `display: flex; flex-direction: column; gap: 0px;`;

        const { penTools, textTools } = this.getToolConfig();
        const selectedBrushTool = this.findToolInGroups(penTools, this.state.lastSelectedTools.brush);
        const selectedTextTool = this.findToolInGroups(textTools, this.state.lastSelectedTools.textTool);

        const tools = [
            { id: 'brush', icon: selectedBrushTool?.icon || '', selectedToolId: this.state.lastSelectedTools.brush, toolGroup: 'brush', hasArrow: true, onMainClick: () => this.handleToolAction('activate-tool', 'brush'), onArrowClick: () => this.handleToolAction('toggle-brush') },
            { id: 'text', icon: selectedTextTool?.icon || '', selectedToolId: this.state.lastSelectedTools.textTool, toolGroup: 'textTool', hasArrow: true, onMainClick: () => this.handleToolAction('activate-tool', 'textTool'), onArrowClick: () => this.handleToolAction('toggle-text') },
            { id: 'script', icon: this.getIconSvg('script'), selectedToolId: this.state.lastSelectedTools.script, toolGroup: 'script', hasArrow: true, onMainClick: () => this.handleToolAction('toggle-script'), onArrowClick: () => this.handleToolAction('toggle-script') },
            { id: 'emoji', icon: this.getIconSvg('emoji'), selectedToolId: 'emoji', toolGroup: 'emoji', hasArrow: true, onMainClick: () => this.handleToolAction('activate-tool', 'emoji'), onArrowClick: () => this.handleToolAction('toggle-emoji') }
        ];

        tools.forEach(tool => {
            container.appendChild(this.createToolButton({
                id: tool.id,
                icon: tool.icon,
                selectedToolId: tool.selectedToolId,
                toolGroup: tool.toolGroup,
                hasArrow: tool.hasArrow,
                onMainClick: tool.onMainClick,
                onArrowClick: tool.onArrowClick
            }));
        });
        return container;
    }

    private renderAITools(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `display: flex; flex-direction: column; gap: 0px;`;

        const { aiTools } = this.getToolConfig();
        let selectedAITool = null;
        for (const group of aiTools) {
            const tool = group.tools.find(t => t.id === this.state.lastSelectedTools.aiTools);
            if (tool) { selectedAITool = tool; break; }
        }

        const btn = this.createToolButton({
            id: 'ai',
            icon: selectedAITool?.icon || this.getIconSvg('ai'),
            selectedToolId: this.state.lastSelectedTools.aiTools,
            toolGroup: 'aiTools',
            hasArrow: true,
            onMainClick: () => this.handleToolAction('toggle-ai-tools'),
            onArrowClick: () => this.handleToolAction('toggle-ai-tools')
        });
        container.appendChild(btn);
        return container;
    }

    private renderTerminalButton(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `display: flex; flex-direction: column; gap: 0px;`;

        const btn = this.createToolButton({
            id: 'terminal',
            icon: this.getIconSvg('terminal'),
            selectedToolId: 'terminal',
            toolGroup: 'terminal',
            hasArrow: false,
            onMainClick: () => console.log('Terminal clicked'),
            onArrowClick: () => { }
        });
        container.appendChild(btn);
        return container;
    }

    private renderOtherTools(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `display: flex; flex-direction: column; gap: 0px;`;

        const tools = [
            { id: 'lock', icon: this.state.isMarkLocked ? this.getIconSvg('lock') : this.getIconSvg('unlock'), hasArrow: false, onMainClick: () => this.toggleLock() },
            { id: 'eye', icon: this.state.isMarkVisibility ? this.getIconSvg('eyeOpen') : this.getIconSvg('eyeClosed'), hasArrow: false, onMainClick: () => this.toggleVisibility() }
        ];

        tools.forEach(tool => {
            container.appendChild(this.createToolButton({
                id: tool.id,
                icon: tool.icon,
                selectedToolId: tool.id,
                toolGroup: 'other',
                hasArrow: false,
                onMainClick: tool.onMainClick,
                onArrowClick: () => { }
            }));
        });
        return container;
    }

    private renderTrash(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `display: flex; flex-direction: column; gap: 0px;`;

        const btn = this.createToolButton({
            id: 'trash',
            icon: this.getIconSvg('trash'),
            selectedToolId: 'trash',
            toolGroup: 'trash',
            hasArrow: false,
            onMainClick: () => this.options.chartLayerRef?.clearAllMark?.(),
            onArrowClick: () => { }
        });
        container.appendChild(btn);
        return container;
    }

    private createToolButton(config: {
        id: string;
        icon: string;
        selectedToolId: string;
        toolGroup: string;
        hasArrow: boolean;
        onMainClick: () => void;
        onArrowClick: () => void
    }): HTMLElement {
        const colors = this.theme.getColors();
        const isArrowActive = this.state.arrowButtonStates[config.toolGroup] || false;

        const wrapper = document.createElement('div');
        wrapper.className = 'tool-btn-wrapper';
        wrapper.style.cssText = `
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        background: transparent;
        transition: all 0.2s ease;
    `;
        wrapper.onmouseenter = () => {
            if (config.hasArrow && arrow) {
                arrow.style.display = 'flex';
            }
        };
        wrapper.onmouseleave = () => {
            if (config.hasArrow && arrow) {
                arrow.style.display = 'none';
            }
        };

        const btn = document.createElement('button');
        btn.innerHTML = config.icon;
        btn.className = `tool-btn tool-btn-${config.id}`;
        btn.style.cssText = `
        background: transparent;
        border: none;
        border-radius: 0px;
        padding: 0px;
        cursor: pointer;
        color: ${colors.buttonColor};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        height: 35px;
        width: ${config.hasArrow ? '35px' : '100%'};
        flex: none;
    `;
        btn.onmouseenter = () => {
            if (btn.style.background !== colors.buttonActive) {
                btn.style.background = colors.buttonHover;
            }
        };
        btn.onmouseleave = () => {
            if (btn.style.background !== colors.buttonActive) {
                btn.style.background = 'transparent';
            }
        };
        btn.onclick = config.onMainClick;
        wrapper.appendChild(btn);
        let arrow: HTMLElement | null = null;
        if (config.hasArrow) {
            arrow = document.createElement('button');
            arrow.innerHTML = isArrowActive ? '<span style="font-size:18px;">‹</span>' : '<span style="font-size:18px;">›</span>';
            arrow.className = 'arrow-button';
            arrow.style.cssText = `
            background: transparent;
            border: none;
            border-radius: 0px;
            cursor: pointer;
            color: ${colors.buttonColor};
            display: none;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            height: 35px;
            width: 13px;
            flex: none;
            position: absolute;
            padding-left: 8px;
            margin-left: 30px;
        `;
            arrow.onmouseenter = (e) => {
                (e.target as HTMLElement).style.background = colors.buttonHover;
            };
            arrow.onmouseleave = (e) => {
                (e.target as HTMLElement).style.background = 'transparent';
            };
            arrow.onclick = (e) => {
                e.stopPropagation();
                config.onArrowClick();
                const newActive = !isArrowActive;
                this.setState({
                    arrowButtonStates: {
                        ...this.state.arrowButtonStates,
                        [config.toolGroup]: newActive
                    }
                });
                if (arrow) {
                    arrow.innerHTML = newActive ? '<span style="font-size:18px;">‹</span>' : '<span style="font-size:18px;">›</span>';
                }
            };
            wrapper.appendChild(arrow);
        }
        return wrapper;
    }

    private handleToolAction = (actionType: string, toolId?: string) => {
        this.closeAllModals();

        switch (actionType) {
            case 'toggle-drawing':
                this.setState({ isDrawingModalOpen: !this.state.isDrawingModalOpen, arrowButtonStates: { drawing: !this.state.isDrawingModalOpen } });
                if (this.state.isDrawingModalOpen) this.showDrawingModal();
                break;
            case 'toggle-brush':
                this.setState({ isBrushModalOpen: !this.state.isBrushModalOpen, arrowButtonStates: { brush: !this.state.isBrushModalOpen } });
                if (this.state.isBrushModalOpen) this.showBrushModal();
                break;
            case 'toggle-cursor':
                this.setState({ isCursorModalOpen: !this.state.isCursorModalOpen, arrowButtonStates: { cursor: !this.state.isCursorModalOpen } });
                if (this.state.isCursorModalOpen) this.showCursorModal();
                break;
            case 'toggle-fibonacci':
                this.setState({ isFibonacciModalOpen: !this.state.isFibonacciModalOpen, arrowButtonStates: { fibonacci: !this.state.isFibonacciModalOpen } });
                if (this.state.isFibonacciModalOpen) this.showFibonacciModal();
                break;
            case 'toggle-project-info':
                this.setState({ isProjectInfoModalOpen: !this.state.isProjectInfoModalOpen, arrowButtonStates: { 'project-info': !this.state.isProjectInfoModalOpen } });
                if (this.state.isProjectInfoModalOpen) this.showProjectInfoModal();
                break;
            case 'toggle-irregular-shape':
                this.setState({ isIrregularShapeModalOpen: !this.state.isIrregularShapeModalOpen, arrowButtonStates: { 'irregular-shape': !this.state.isIrregularShapeModalOpen } });
                if (this.state.isIrregularShapeModalOpen) this.showIrregularShapeModal();
                break;
            case 'toggle-text':
                this.setState({ isTextToolModalOpen: !this.state.isTextToolModalOpen, arrowButtonStates: { text: !this.state.isTextToolModalOpen } });
                if (this.state.isTextToolModalOpen) this.showTextToolModal();
                break;
            case 'toggle-ai-tools':
                this.setState({ isAIToolsModalOpen: !this.state.isAIToolsModalOpen, arrowButtonStates: { ai: !this.state.isAIToolsModalOpen } });
                if (this.state.isAIToolsModalOpen) this.showAIToolsModal();
                break;
            case 'toggle-script':
                this.setState({ isScriptModalOpen: !this.state.isScriptModalOpen, arrowButtonStates: { script: !this.state.isScriptModalOpen } });
                if (this.state.isScriptModalOpen) this.showScriptModal();
                break;
            case 'toggle-emoji':
                this.setState({ isEmojiSelectPopUpOpen: !this.state.isEmojiSelectPopUpOpen, arrowButtonStates: { emoji: !this.state.isEmojiSelectPopUpOpen } });
                if (this.state.isEmojiSelectPopUpOpen) this.showEmojiModal();
                break;
            case 'activate-tool':
                if (toolId === 'drawing') {
                    const drawingTool = this.state.lastSelectedTools.drawing;
                    this.toolManager.handleDrawingToolSelect(this, drawingTool);
                    this.updateToolButtonIcon('drawing', drawingTool);
                } else if (toolId === 'brush') {
                    const brushTool = this.state.lastSelectedTools.brush;
                    this.toolManager.handleDrawingToolSelect(this, brushTool);
                    this.updateToolButtonIcon('brush', brushTool);
                } else if (toolId === 'fibonacci') {
                    const fibonacciTool = this.state.lastSelectedTools.fibonacci;
                    this.toolManager.handleDrawingToolSelect(this, fibonacciTool);
                    this.updateToolButtonIcon('fibonacci', fibonacciTool);
                } else if (toolId === 'projectInfo') {
                    const projectInfoTool = this.state.lastSelectedTools.projectInfo;
                    this.toolManager.handleDrawingToolSelect(this, projectInfoTool);
                    this.updateToolButtonIcon('project-info', projectInfoTool);
                } else if (toolId === 'irregularShape') {
                    const irregularShapeTool = this.state.lastSelectedTools.irregularShape;
                    this.toolManager.handleDrawingToolSelect(this, irregularShapeTool);
                    this.updateToolButtonIcon('irregular-shape', irregularShapeTool);
                } else if (toolId === 'textTool') {
                    const textTool = this.state.lastSelectedTools.textTool;
                    this.toolManager.handleDrawingToolSelect(this, textTool);
                    this.updateToolButtonIcon('text', textTool);
                } else if (toolId === 'cursor') {
                    const cursorTool = this.state.selectedCursor;
                    this.toolManager.handleDrawingToolSelect(this, cursorTool);
                } else if (toolId === 'emoji') {
                    this.setState({ isEmojiSelectPopUpOpen: true });
                }
                break;
            case 'select-drawing':
                if (toolId) {
                    this.setState({ lastSelectedTools: { ...this.state.lastSelectedTools, drawing: toolId } });
                    this.updateToolButtonIcon('drawing', toolId);
                    this.toolManager.handleDrawingToolSelect(this, toolId);
                }
                break;
            case 'select-brush':
                if (toolId) {
                    this.setState({ lastSelectedTools: { ...this.state.lastSelectedTools, brush: toolId } });
                    this.updateToolButtonIcon('brush', toolId);
                    this.toolManager.handleDrawingToolSelect(this, toolId);
                }
                break;
            case 'select-text':
                if (toolId) {
                    this.setState({ lastSelectedTools: { ...this.state.lastSelectedTools, textTool: toolId } });
                    this.updateToolButtonIcon('text', toolId);
                    this.toolManager.handleDrawingToolSelect(this, toolId);
                }
                break;
            case 'select-cursor':
                if (toolId) {
                    this.setState({ selectedCursor: toolId, lastSelectedTools: { ...this.state.lastSelectedTools, cursor: toolId } });
                    this.updateToolButtonIcon('cursor', toolId);
                    this.toolManager.handleDrawingToolSelect(this, toolId);
                }
                break;
            case 'select-fibonacci':
                if (toolId) {
                    this.setState({ lastSelectedTools: { ...this.state.lastSelectedTools, fibonacci: toolId } });
                    this.updateToolButtonIcon('fibonacci', toolId);
                    this.toolManager.handleDrawingToolSelect(this, toolId);
                }
                break;
            case 'select-project-info':
                if (toolId) {
                    this.setState({ lastSelectedTools: { ...this.state.lastSelectedTools, projectInfo: toolId } });
                    this.updateToolButtonIcon('project-info', toolId);
                    this.toolManager.handleDrawingToolSelect(this, toolId);
                }
                break;
            case 'select-irregular-shape':
                if (toolId) {
                    this.setState({ lastSelectedTools: { ...this.state.lastSelectedTools, irregularShape: toolId } });
                    this.updateToolButtonIcon('irregular-shape', toolId);
                    this.toolManager.handleDrawingToolSelect(this, toolId);
                }
                break;
            case 'select-ai':
                if (toolId) {
                    this.setState({ lastSelectedTools: { ...this.state.lastSelectedTools, aiTools: toolId } });
                    this.updateToolButtonIcon('ai', toolId);
                }
                break;
            case 'select-script':
                if (toolId) {
                    this.setState({ lastSelectedTools: { ...this.state.lastSelectedTools, script: toolId } });
                    this.updateToolButtonIcon('script', toolId);
                    this.toolManager.handleDrawingToolSelect(this, toolId);
                }
                break;
        }
    };

    private updateToolButtonIcon(buttonId: string, toolId: string): void {
        const btn = this.element?.querySelector(`.tool-btn-${buttonId}`) as HTMLElement;
        if (!btn) return;
        const colors = this.theme.getColors();
        const { drawingTools, penTools, gannAndFibonacciTools, projectInfoTools, irregularShapeTools, textTools, cursorStyles, aiTools, scriptTools } = this.getToolConfig();
        let newIcon = '';
        if (buttonId === 'drawing') {
            const tool = this.findToolInGroups(drawingTools, toolId);
            newIcon = tool?.icon || '';
        } else if (buttonId === 'brush') {
            const tool = this.findToolInGroups(penTools, toolId);
            newIcon = tool?.icon || '';
        } else if (buttonId === 'fibonacci') {
            const tool = this.findToolInGroups(gannAndFibonacciTools, toolId);
            newIcon = tool?.icon || '';
        } else if (buttonId === 'project-info') {
            const tool = this.findToolInGroups(projectInfoTools, toolId);
            newIcon = tool?.icon || '';
        } else if (buttonId === 'irregular-shape') {
            const tool = this.findToolInGroups(irregularShapeTools, toolId);
            newIcon = tool?.icon || '';
        } else if (buttonId === 'text') {
            const tool = this.findToolInGroups(textTools, toolId);
            newIcon = tool?.icon || '';
        } else if (buttonId === 'cursor') {
            const tool = cursorStyles.find(c => c.id === toolId);
            newIcon = tool?.icon || '';
        } else if (buttonId === 'ai') {
            for (const group of aiTools) {
                const tool = group.tools.find(t => t.id === toolId);
                if (tool) {
                    newIcon = tool.icon;
                    break;
                }
            }
        } else if (buttonId === 'script') {
            for (const group of scriptTools) {
                const tool = group.tools.find(t => t.id === toolId);
                if (tool) {
                    newIcon = tool.icon;
                    break;
                }
            }
        }
        if (newIcon) {
            btn.innerHTML = newIcon;
        }
        const allBtns = this.element?.querySelectorAll('.tool-btn');
        allBtns?.forEach(b => {
            const bElement = b as HTMLElement;
            if (bElement.className.includes(`tool-btn-${buttonId}`)) {
                bElement.style.background = colors.buttonActive;
                bElement.style.color = '#FFFFFF';
            } else if (!bElement.className.includes('tool-btn-lock') && !bElement.className.includes('tool-btn-eye') && !bElement.className.includes('tool-btn-trash') && !bElement.className.includes('tool-btn-terminal')) {
                bElement.style.background = 'transparent';
                bElement.style.color = colors.buttonColor;
            }
        });
    }

    private showDrawingModal(): void {
        this.closeModal('drawing');
        const colors = this.theme.getColors();
        const modal = document.createElement('div');
        modal.className = 'candleview-modal modal-scrollbar';
        modal.style.cssText = `
            position: absolute;
            top: ${this.getModalTop()}px;
            left: 60px;
            z-index: 1000;
            background: ${colors.panelBg};
            border: 1px solid ${colors.panelBorder};
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            max-height: 400px;
            overflow-y: auto;
        `;

        const { drawingTools } = this.getToolConfig();
        drawingTools.forEach(group => {
            const groupTitle = document.createElement('div');
            groupTitle.style.cssText = `padding: 8px 12px; font-weight: bold; color: ${colors.textColor}; border-bottom: 1px solid ${colors.panelBorder};`;
            groupTitle.textContent = group.title;
            modal.appendChild(groupTitle);

            group.tools.forEach(tool => {
                const item = document.createElement('div');
                item.style.cssText = `padding: 8px 12px; cursor: pointer; color: ${colors.textColor}; display: flex; align-items: center; gap: 8px;`;
                item.innerHTML = `${tool.icon}<span>${tool.name}</span>`;
                item.onclick = () => {
                    this.handleToolAction('select-drawing', tool.id);
                    this.closeModal('drawing');
                };
                item.onmouseenter = () => { item.style.background = colors.buttonHover; };
                item.onmouseleave = () => { item.style.background = 'transparent'; };
                modal.appendChild(item);
            });
        });

        this.drawingModalRef = modal;
        document.body.appendChild(modal);
        this.bindOutsideClick(modal, () => this.closeModal('drawing'));
    }

    private showBrushModal(): void {
        this.closeModal('brush');
        const colors = this.theme.getColors();
        const modal = document.createElement('div');
        modal.className = 'candleview-modal modal-scrollbar';
        modal.style.cssText = `
            position: absolute;
            top: ${this.getModalTop()}px;
            left: 60px;
            z-index: 1000;
            background: ${colors.panelBg};
            border: 1px solid ${colors.panelBorder};
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            max-height: 400px;
            overflow-y: auto;
        `;

        const { penTools } = this.getToolConfig();
        penTools.forEach(group => {
            const groupTitle = document.createElement('div');
            groupTitle.style.cssText = `padding: 8px 12px; font-weight: bold; color: ${colors.textColor}; border-bottom: 1px solid ${colors.panelBorder};`;
            groupTitle.textContent = group.title;
            modal.appendChild(groupTitle);

            group.tools.forEach(tool => {
                const item = document.createElement('div');
                item.style.cssText = `padding: 8px 12px; cursor: pointer; color: ${colors.textColor}; display: flex; align-items: center; gap: 8px;`;
                item.innerHTML = `${tool.icon}<span>${tool.name}</span>`;
                item.onclick = () => {
                    this.handleToolAction('select-brush', tool.id);
                    this.closeModal('brush');
                };
                item.onmouseenter = () => { item.style.background = colors.buttonHover; };
                item.onmouseleave = () => { item.style.background = 'transparent'; };
                modal.appendChild(item);
            });
        });

        this.brushModalRef = modal;
        document.body.appendChild(modal);
        this.bindOutsideClick(modal, () => this.closeModal('brush'));
    }

    private showCursorModal(): void {
        this.closeModal('cursor');
        const colors = this.theme.getColors();
        const modal = document.createElement('div');
        modal.className = 'candleview-modal modal-scrollbar';
        modal.style.cssText = `
            position: absolute;
            top: ${this.getModalTop()}px;
            left: 60px;
            z-index: 1000;
            background: ${colors.panelBg};
            border: 1px solid ${colors.panelBorder};
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        `;

        const { cursorStyles } = this.getToolConfig();
        cursorStyles.forEach(cursor => {
            const item = document.createElement('div');
            item.style.cssText = `padding: 8px 12px; cursor: pointer; color: ${colors.textColor}; display: flex; align-items: center; gap: 8px;`;
            item.innerHTML = `${cursor.icon}<span>${cursor.name}</span>`;
            item.onclick = () => {
                this.handleToolAction('select-cursor', cursor.id);
                this.closeModal('cursor');
            };
            item.onmouseenter = () => { item.style.background = colors.buttonHover; };
            item.onmouseleave = () => { item.style.background = 'transparent'; };
            modal.appendChild(item);
        });

        this.cursorModalRef = modal;
        document.body.appendChild(modal);
        this.bindOutsideClick(modal, () => this.closeModal('cursor'));
    }

    private showFibonacciModal(): void {
        this.closeModal('fibonacci');
        const colors = this.theme.getColors();
        const modal = document.createElement('div');
        modal.className = 'candleview-modal modal-scrollbar';
        modal.style.cssText = `
            position: absolute;
            top: ${this.getModalTop()}px;
            left: 60px;
            z-index: 1000;
            background: ${colors.panelBg};
            border: 1px solid ${colors.panelBorder};
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            max-height: 400px;
            overflow-y: auto;
        `;

        const { gannAndFibonacciTools } = this.getToolConfig();
        gannAndFibonacciTools.forEach(group => {
            const groupTitle = document.createElement('div');
            groupTitle.style.cssText = `padding: 8px 12px; font-weight: bold; color: ${colors.textColor}; border-bottom: 1px solid ${colors.panelBorder};`;
            groupTitle.textContent = group.title;
            modal.appendChild(groupTitle);

            group.tools.forEach(tool => {
                const item = document.createElement('div');
                item.style.cssText = `padding: 8px 12px; cursor: pointer; color: ${colors.textColor}; display: flex; align-items: center; gap: 8px;`;
                item.innerHTML = `${tool.icon}<span>${tool.name}</span>`;
                item.onclick = () => {
                    this.handleToolAction('select-fibonacci', tool.id);
                    this.closeModal('fibonacci');
                };
                item.onmouseenter = () => { item.style.background = colors.buttonHover; };
                item.onmouseleave = () => { item.style.background = 'transparent'; };
                modal.appendChild(item);
            });
        });

        this.fibonacciModalRef = modal;
        document.body.appendChild(modal);
        this.bindOutsideClick(modal, () => this.closeModal('fibonacci'));
    }

    private showProjectInfoModal(): void {
        this.closeModal('projectInfo');
        const colors = this.theme.getColors();
        const modal = document.createElement('div');
        modal.className = 'candleview-modal modal-scrollbar';
        modal.style.cssText = `
            position: absolute;
            top: ${this.getModalTop()}px;
            left: 60px;
            z-index: 1000;
            background: ${colors.panelBg};
            border: 1px solid ${colors.panelBorder};
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            max-height: 400px;
            overflow-y: auto;
        `;

        const { projectInfoTools } = this.getToolConfig();
        projectInfoTools.forEach(group => {
            const groupTitle = document.createElement('div');
            groupTitle.style.cssText = `padding: 8px 12px; font-weight: bold; color: ${colors.textColor}; border-bottom: 1px solid ${colors.panelBorder};`;
            groupTitle.textContent = group.title;
            modal.appendChild(groupTitle);

            group.tools.forEach(tool => {
                const item = document.createElement('div');
                item.style.cssText = `padding: 8px 12px; cursor: pointer; color: ${colors.textColor}; display: flex; align-items: center; gap: 8px;`;
                item.innerHTML = `${tool.icon}<span>${tool.name}</span>`;
                item.onclick = () => {
                    this.handleToolAction('select-project-info', tool.id);
                    this.closeModal('projectInfo');
                };
                item.onmouseenter = () => { item.style.background = colors.buttonHover; };
                item.onmouseleave = () => { item.style.background = 'transparent'; };
                modal.appendChild(item);
            });
        });

        this.projectInfoModalRef = modal;
        document.body.appendChild(modal);
        this.bindOutsideClick(modal, () => this.closeModal('projectInfo'));
    }

    private showIrregularShapeModal(): void {
        this.closeModal('irregularShape');
        const colors = this.theme.getColors();
        const modal = document.createElement('div');
        modal.className = 'candleview-modal modal-scrollbar';
        modal.style.cssText = `
            position: absolute;
            top: ${this.getModalTop()}px;
            left: 60px;
            z-index: 1000;
            background: ${colors.panelBg};
            border: 1px solid ${colors.panelBorder};
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            max-height: 400px;
            overflow-y: auto;
        `;

        const { irregularShapeTools } = this.getToolConfig();
        irregularShapeTools.forEach(group => {
            const groupTitle = document.createElement('div');
            groupTitle.style.cssText = `padding: 8px 12px; font-weight: bold; color: ${colors.textColor}; border-bottom: 1px solid ${colors.panelBorder};`;
            groupTitle.textContent = group.title;
            modal.appendChild(groupTitle);

            group.tools.forEach(tool => {
                const item = document.createElement('div');
                item.style.cssText = `padding: 8px 12px; cursor: pointer; color: ${colors.textColor}; display: flex; align-items: center; gap: 8px;`;
                item.innerHTML = `${tool.icon}<span>${tool.name}</span>`;
                item.onclick = () => {
                    this.handleToolAction('select-irregular-shape', tool.id);
                    this.closeModal('irregularShape');
                };
                item.onmouseenter = () => { item.style.background = colors.buttonHover; };
                item.onmouseleave = () => { item.style.background = 'transparent'; };
                modal.appendChild(item);
            });
        });

        this.irregularShapeModalRef = modal;
        document.body.appendChild(modal);
        this.bindOutsideClick(modal, () => this.closeModal('irregularShape'));
    }

    private showTextToolModal(): void {
        this.closeModal('textTool');
        const colors = this.theme.getColors();
        const modal = document.createElement('div');
        modal.className = 'candleview-modal modal-scrollbar';
        modal.style.cssText = `
            position: absolute;
            top: ${this.getModalTop()}px;
            left: 60px;
            z-index: 1000;
            background: ${colors.panelBg};
            border: 1px solid ${colors.panelBorder};
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            max-height: 400px;
            overflow-y: auto;
        `;

        const { textTools } = this.getToolConfig();
        textTools.forEach(group => {
            const groupTitle = document.createElement('div');
            groupTitle.style.cssText = `padding: 8px 12px; font-weight: bold; color: ${colors.textColor}; border-bottom: 1px solid ${colors.panelBorder};`;
            groupTitle.textContent = group.title;
            modal.appendChild(groupTitle);

            group.tools.forEach(tool => {
                const item = document.createElement('div');
                item.style.cssText = `padding: 8px 12px; cursor: pointer; color: ${colors.textColor}; display: flex; align-items: center; gap: 8px;`;
                item.innerHTML = `${tool.icon}<span>${tool.name}</span>`;
                item.onclick = () => {
                    this.handleToolAction('select-text', tool.id);
                    this.closeModal('textTool');
                };
                item.onmouseenter = () => { item.style.background = colors.buttonHover; };
                item.onmouseleave = () => { item.style.background = 'transparent'; };
                modal.appendChild(item);
            });
        });

        this.textToolModalRef = modal;
        document.body.appendChild(modal);
        this.bindOutsideClick(modal, () => this.closeModal('textTool'));
    }

    private showAIToolsModal(): void {
        this.closeModal('aiTools');
        const colors = this.theme.getColors();
        const modal = document.createElement('div');
        modal.className = 'candleview-modal modal-scrollbar';
        modal.style.cssText = `
            position: absolute;
            top: ${this.getModalTop()}px;
            left: 60px;
            z-index: 1000;
            background: ${colors.panelBg};
            border: 1px solid ${colors.panelBorder};
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            max-height: 400px;
            overflow-y: auto;
        `;

        const { aiTools } = this.getToolConfig();
        aiTools.forEach(group => {
            const groupTitle = document.createElement('div');
            groupTitle.style.cssText = `padding: 8px 12px; font-weight: bold; color: ${colors.textColor}; border-bottom: 1px solid ${colors.panelBorder};`;
            groupTitle.textContent = group.title;
            modal.appendChild(groupTitle);

            group.tools.forEach(tool => {
                const item = document.createElement('div');
                item.style.cssText = `padding: 8px 12px; cursor: pointer; color: ${colors.textColor}; display: flex; align-items: center; gap: 8px;`;
                item.innerHTML = `${tool.icon}<span>${tool.name}</span>`;
                item.onclick = () => {
                    this.handleToolAction('select-ai', tool.id);
                    this.closeModal('aiTools');
                };
                item.onmouseenter = () => { item.style.background = colors.buttonHover; };
                item.onmouseleave = () => { item.style.background = 'transparent'; };
                modal.appendChild(item);
            });
        });

        this.aiModalRef = modal;
        document.body.appendChild(modal);
        this.bindOutsideClick(modal, () => this.closeModal('aiTools'));
    }

    private showScriptModal(): void {
        this.closeModal('script');
        const colors = this.theme.getColors();
        const modal = document.createElement('div');
        modal.className = 'candleview-modal modal-scrollbar';
        modal.style.cssText = `
            position: absolute;
            top: ${this.getModalTop()}px;
            left: 60px;
            z-index: 1000;
            background: ${colors.panelBg};
            border: 1px solid ${colors.panelBorder};
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        `;

        const { scriptTools } = this.getToolConfig();
        scriptTools.forEach(group => {
            group.tools.forEach(tool => {
                const item = document.createElement('div');
                item.style.cssText = `padding: 8px 12px; cursor: pointer; color: ${colors.textColor}; display: flex; align-items: center; gap: 8px;`;
                item.innerHTML = `${tool.icon}<span>${tool.name}</span>`;
                item.onclick = () => {
                    this.handleToolAction('select-script', tool.id);
                    this.closeModal('script');
                };
                item.onmouseenter = () => { item.style.background = colors.buttonHover; };
                item.onmouseleave = () => { item.style.background = 'transparent'; };
                modal.appendChild(item);
            });
        });

        this.scriptModalRef = modal;
        document.body.appendChild(modal);
        this.bindOutsideClick(modal, () => this.closeModal('script'));
    }

    private showEmojiModal(): void {
        this.closeModal('emoji');
        const colors = this.theme.getColors();
        const categories = getEmojiCategories(this.i18n);
        const currentCategoryEmojis = EMOJI_LIST.filter(e => e.category === this.state.selectedEmojiCategory);
        const modal = document.createElement('div');
        modal.className = 'candleview-modal modal-scrollbar';
        modal.style.cssText = `
        position: absolute;
        top: ${this.getModalTop()}px;
        left: 60px;
        z-index: 1000;
        background: ${colors.panelBg};
        border: 1px solid ${colors.panelBorder};
        width: 280px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        max-height: 400px;
        display: flex;
        flex-direction: column;
        border-radius: 0px;
        overflow: hidden;
    `;
        const header = document.createElement('div');
        header.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid ${colors.panelBorder}; flex-shrink: 0;`;
        header.innerHTML = `<span style="color:${colors.textColor};font-weight:600;font-size:14px;">${this.i18n.t('selectEmoji')}</span>`;
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.onclick = () => this.closeModal('emoji');
        closeBtn.style.cssText = `background:transparent;border:none;color:${colors.textColor};cursor:pointer;font-size:20px;padding:0 8px;`;
        header.appendChild(closeBtn);
        modal.appendChild(header);
        const categoryWrapper = document.createElement('div');
        categoryWrapper.style.cssText = `
        display: flex;
        align-items: center;
        border-bottom: 1px solid ${colors.panelBorder};
        flex-shrink: 0;
        background: ${colors.panelBg};
        position: relative;
    `;
        const leftScrollBtn = document.createElement('button');
        leftScrollBtn.className = 'category-scroll-btn';
        leftScrollBtn.innerHTML = '‹';
        leftScrollBtn.style.cssText = `
        width: 24px;
        height: 100%;
        background: ${colors.panelBg};
        border: none;
        border-right: 1px solid ${colors.panelBorder};
        cursor: pointer;
        color: ${colors.textColor};
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        z-index: 1;
        opacity: 0.6;
        transition: opacity 0.2s;
    `;
        leftScrollBtn.onmouseenter = () => { leftScrollBtn.style.opacity = '1'; };
        leftScrollBtn.onmouseleave = () => { leftScrollBtn.style.opacity = '0.6'; };
        leftScrollBtn.onclick = (e) => {
            e.stopPropagation();
            categoryScrollContainer.scrollBy({ left: -150, behavior: 'smooth' });
        };
        const rightScrollBtn = document.createElement('button');
        rightScrollBtn.className = 'category-scroll-btn';
        rightScrollBtn.innerHTML = '›';
        rightScrollBtn.style.cssText = `
        width: 24px;
        height: 100%;
        background: ${colors.panelBg};
        border: none;
        border-left: 1px solid ${colors.panelBorder};
        cursor: pointer;
        color: ${colors.textColor};
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        z-index: 1;
        opacity: 0.6;
        transition: opacity 0.2s;
    `;
        rightScrollBtn.onmouseenter = () => { rightScrollBtn.style.opacity = '1'; };
        rightScrollBtn.onmouseleave = () => { rightScrollBtn.style.opacity = '0.6'; };
        rightScrollBtn.onclick = (e) => {
            e.stopPropagation();
            categoryScrollContainer.scrollBy({ left: 150, behavior: 'smooth' });
        };
        const categoryScrollContainer = document.createElement('div');
        categoryScrollContainer.style.cssText = `
        flex: 1;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
        -ms-overflow-style: none;
    `;
        categoryScrollContainer.classList.add('no-scrollbar');
        const categoryBar = document.createElement('div');
        categoryBar.style.cssText = `
        display: flex;
        gap: 6px;
        padding: 10px 12px;
        white-space: nowrap;
    `;

        categories.forEach(cat => {
            const catBtn = document.createElement('button');
            catBtn.className = 'category-btn';
            catBtn.textContent = cat.name;
            catBtn.style.cssText = `
            background: ${this.state.selectedEmojiCategory === cat.id ? colors.buttonActive : 'transparent'};
            border: 1px solid ${this.state.selectedEmojiCategory === cat.id ? colors.buttonActive : colors.panelBorder};
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 11px;
            cursor: pointer;
            color: ${colors.textColor};
            transition: all 0.2s ease;
            white-space: nowrap;
            flex-shrink: 0;
        `;
            catBtn.onclick = () => {
                this.setState({ selectedEmojiCategory: cat.id });
                this.closeModal('emoji');
                this.showEmojiModal();
            };
            catBtn.onmouseenter = () => {
                if (this.state.selectedEmojiCategory !== cat.id) {
                    catBtn.style.background = colors.buttonHover;
                }
            };
            catBtn.onmouseleave = () => {
                if (this.state.selectedEmojiCategory !== cat.id) {
                    catBtn.style.background = 'transparent';
                }
            };
            categoryBar.appendChild(catBtn);
        });

        categoryScrollContainer.appendChild(categoryBar);
        categoryWrapper.appendChild(leftScrollBtn);
        categoryWrapper.appendChild(categoryScrollContainer);
        categoryWrapper.appendChild(rightScrollBtn);
        modal.appendChild(categoryWrapper);
        const noScrollbarStyle = document.createElement('style');
        noScrollbarStyle.textContent = `
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
    `;
        if (!document.querySelector('#no-scrollbar-style')) {
            noScrollbarStyle.id = 'no-scrollbar-style';
            document.head.appendChild(noScrollbarStyle);
        }
        const emojiGrid = document.createElement('div');
        emojiGrid.className = 'custom-scrollbar';
        emojiGrid.style.cssText = `display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; padding: 8px; overflow-y: auto; overflow-x: hidden; flex: 1; min-height: 0;`;
        currentCategoryEmojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.textContent = emoji.character;
            emojiBtn.style.cssText = `
            background: transparent;
            border: 1px solid transparent;
            border-radius: 6px;
            padding: 4px;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 0;
        `;
            emojiBtn.onmouseenter = () => {
                emojiBtn.style.background = colors.buttonHover;
                emojiBtn.style.transform = 'scale(1.05)';
                emojiBtn.style.borderColor = colors.panelBorder;
            };
            emojiBtn.onmouseleave = () => {
                emojiBtn.style.background = 'transparent';
                emojiBtn.style.transform = 'scale(1)';
                emojiBtn.style.borderColor = 'transparent';
            };
            emojiBtn.onclick = () => {
                this.setState({ selectedEmoji: emoji.character });
                this.options.onEmojiSelect?.(emoji.character);
                this.toolManager.handleDrawingToolSelect(this, 'emoji');
                this.closeModal('emoji');
            };
            emojiGrid.appendChild(emojiBtn);
        });
        modal.appendChild(emojiGrid);
        this.emojiPickerRef = modal;
        document.body.appendChild(modal);
        this.bindOutsideClick(modal, () => this.closeModal('emoji'));
    }

    private closeModal(type: string): void {
        const refs: Record<string, HTMLElement | null> = {
            drawing: this.drawingModalRef,
            brush: this.brushModalRef,
            cursor: this.cursorModalRef,
            fibonacci: this.fibonacciModalRef,
            projectInfo: this.projectInfoModalRef,
            irregularShape: this.irregularShapeModalRef,
            textTool: this.textToolModalRef,
            aiTools: this.aiModalRef,
            script: this.scriptModalRef,
            emoji: this.emojiPickerRef
        };

        if (refs[type]) {
            refs[type]?.remove();
            refs[type] = null;
        }

        this.setState({
            isDrawingModalOpen: false,
            isBrushModalOpen: false,
            isCursorModalOpen: false,
            isFibonacciModalOpen: false,
            isProjectInfoModalOpen: false,
            isIrregularShapeModalOpen: false,
            isTextToolModalOpen: false,
            isAIToolsModalOpen: false,
            isScriptModalOpen: false,
            isEmojiSelectPopUpOpen: false,
            arrowButtonStates: {}
        });
    }

    public closeAllModals(): void {
        this.closeModal('drawing');
        this.closeModal('brush');
        this.closeModal('cursor');
        this.closeModal('fibonacci');
        this.closeModal('projectInfo');
        this.closeModal('irregularShape');
        this.closeModal('textTool');
        this.closeModal('aiTools');
        this.closeModal('script');
        this.closeModal('emoji');
        this.setState({
            arrowButtonStates: {}
        });
        const allArrows = this.element?.querySelectorAll('.arrow-button');
        allArrows?.forEach(arrow => {
            (arrow as HTMLElement).innerHTML = '<span style="font-size:18px;">›</span>';
        });
    }

    private bindOutsideClick(modal: HTMLElement, onClose: () => void): void {

    }

    public setActiveTool(toolId: string): void {
        const colors = this.theme.getColors();
        const btns = this.element?.querySelectorAll('.tool-btn');
        btns?.forEach(btn => {
            const btnElement = btn as HTMLElement;
            if (btnElement.className.includes(`tool-btn-${toolId}`)) {
                btnElement.style.background = colors.buttonActive;
                btnElement.style.color = '#FFFFFF';
            } else if (!btnElement.className.includes('tool-btn-lock') && !btnElement.className.includes('tool-btn-eye') && !btnElement.className.includes('tool-btn-trash') && !btnElement.className.includes('tool-btn-terminal')) {
                btnElement.style.background = 'transparent';
                btnElement.style.color = colors.buttonColor;
            }
        });
    }

    private toggleLock(): void {
        this.setState({ isMarkLocked: !this.state.isMarkLocked });
        this.updateOtherTools();
    }

    private toggleVisibility(): void {
        const newVisibility = !this.state.isMarkVisibility;
        this.setState({ isMarkVisibility: newVisibility });
        if (newVisibility) {
            this.options.chartLayerRef?.showAllMark?.();
        } else {
            this.options.chartLayerRef?.hideAllMark?.();
        }
        this.updateOtherTools();
    }

    private updateOtherTools(): void {
        const lockBtn = this.element?.querySelector('.tool-btn-lock');
        const eyeBtn = this.element?.querySelector('.tool-btn-eye');
        if (lockBtn) lockBtn.innerHTML = this.state.isMarkLocked ? this.getIconSvg('lock') : this.getIconSvg('unlock');
        if (eyeBtn) eyeBtn.innerHTML = this.state.isMarkVisibility ? this.getIconSvg('eyeOpen') : this.getIconSvg('eyeClosed');
    }

    private getToolConfig() {
        return getToolConfig(this.i18n);
    }

    private findToolInGroups(toolGroups: any[], toolId: string): any {
        for (const group of toolGroups) {
            const tool = group.tools.find((t: any) => t.id === toolId);
            if (tool) return tool;
        }
        return null;
    }

    private getIconSvg(name: string): string {
        const icons: Record<string, string> = {
            script: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V8L14 2Z"/><path d="M14 2V8H19"/><path d="M9 12H15"/><path d="M9 16H12"/></svg>`,
            emoji: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>`,
            ai: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="20" rx="10" ry="3"/><circle cx="12" cy="10.5" r="8"/><path d="M7 8C9 6 15 6 17 8"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><path d="M12 5L14 2L16 5L19 6L16 7L14 10L12 7L9 6Z" fill="currentColor"/></svg>`,
            terminal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M6 9L9 12L6 15"/><path d="M11 15H15"/></svg>`,
            lock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10"/><circle cx="12" cy="15" r="1" fill="currentColor"/><path d="M12 15V17"/></svg>`,
            unlock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7" stroke-dasharray="12 12"/><circle cx="12" cy="15" r="1" fill="currentColor"/><path d="M12 15V17"/></svg>`,
            eyeOpen: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,
            eyeClosed: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12C2 12 6 4 13 4C20 4 24 12 24 12C24 12 20 20 13 20C6 20 2 12 2 12Z"/><path d="M4.93 4.93L19.07 19.07"/><path d="M9.76 14.24C8.79 13.27 8.79 11.73 9.76 10.76C10.73 9.79 12.27 9.79 13.24 10.76"/></svg>`,
            trash: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6H5H21"/><path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"/><path d="M10 11V17"/><path d="M14 11V17"/></svg>`,
        };
        return icons[name] || '';
    }

    private getModalTop(): number {
        const container = this.element?.getBoundingClientRect();
        return (container?.top || 0) + 50;
    }

    private updateContainerHeight(): void {
        if (this.element) {
            const height = this.element.clientHeight;
            this.setState({ containerHeight: height });
            this.updateScrollButtons();
        }
    }

    private updateScrollButtons(): void {
        if (this.scrollContainerRef) {
            const { scrollTop, scrollHeight, clientHeight } = this.scrollContainerRef;
            const showTop = scrollTop > 10;
            const showBottom = scrollTop < scrollHeight - clientHeight - 10;

            this.state.scrollButtonVisibility = { showTop, showBottom };
            this.updateScrollButtonsUI();
        }
    }

    private updateScrollButtonsUI(): void {
        if (this.scrollTopBtn) {
            this.scrollTopBtn.style.display = this.state.scrollButtonVisibility.showTop ? 'flex' : 'none';
        }
        if (this.scrollBottomBtn) {
            this.scrollBottomBtn.style.display = this.state.scrollButtonVisibility.showBottom ? 'flex' : 'none';
        }
    }

    private bindEvents(): void {
        if (this.scrollContainerRef) {
            this.scrollContainerRef.addEventListener('scroll', () => this.updateScrollButtons());
        }
        document.addEventListener('click', this.handleClickOutside);
    }

    private handleClickOutside = (e: MouseEvent): void => {
        const target = e.target as HTMLElement;
        if (target.closest('.tool-btn-emoji')) {
            return;
        }
    };

    private setState(updates: Partial<LeftPanelState>): void {
        Object.assign(this.state, updates);
        if (updates.isMarkLocked !== undefined || updates.isMarkVisibility !== undefined) {
            this.updateOtherTools();
        }
    }

    public updateTheme(theme: Theme): void {
        this.theme = theme;
        const colors = theme.getColors();
        if (this.element) {
            const panel = this.element.querySelector('div');
            if (panel) {
                (panel as HTMLElement).style.background = colors.panelBg;
                (panel as HTMLElement).style.borderRightColor = colors.panelBorder;
            }
        }
        const existingStyle = document.getElementById('candleview-scrollbar-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        this.injectScrollbarStyles();
        if (this.scrollTopBtn) {
            this.scrollTopBtn.style.background = 'rgba(0, 0, 0, 0.3)';
            this.scrollTopBtn.style.color = 'rgba(255, 255, 255, 0.9)';
        }
        if (this.scrollBottomBtn) {
            this.scrollBottomBtn.style.background = 'rgba(0, 0, 0, 0.1)';
            this.scrollBottomBtn.style.color = 'rgba(255, 255, 255, 0.9)';
        }
        this.closeAllModals();
    }

    public updateI18n(i18n: I18n): void {
        this.i18n = i18n;
        this.closeAllModals();
    }

    public destroy(): void {
        this.closeAllModals();
        this.element?.remove();
        document.removeEventListener('click', this.handleClickOutside);
    }
}