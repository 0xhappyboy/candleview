

export interface LeftPanelState {

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
    selectedAITool: string | null;
    selectedScriptTool: string | null;


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


    toolSearch: string;


    containerHeight: number;
    scrollButtonVisibility: {
        showTop: boolean;
        showBottom: boolean;
    };

    isBrushActive: boolean;
}

export const DEFAULT_LEFT_PANEL_STATE: LeftPanelState = {
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

    selectedEmoji: '😀',
    selectedEmojiCategory: 'smileys',
    selectedCursor: 'crosshair',
    selectedAITool: null,
    selectedScriptTool: null,

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

    toolSearch: '',

    containerHeight: 0,
    scrollButtonVisibility: {
        showTop: false,
        showBottom: false
    },

    isBrushActive: false,

};