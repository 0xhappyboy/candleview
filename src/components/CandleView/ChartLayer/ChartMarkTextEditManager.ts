import { ChartLayer } from ".";

export class ChartMarkTextEditManager {
    constructor() { }


    // =============================== TextEdit Mark Start ===============================
    public setupTextEditMarkEvents(chartLayer: ChartLayer) {
        const handleTextEditMarkDragStart = (e: CustomEvent) => {
        };

        const handleTextEditMarkSelected = (e: CustomEvent) => {
            const { mark, position, text, color, backgroundColor, textColor, fontSize } = e.detail;
            (this as any).currentTextEditMark = mark;
            e.stopPropagation();
        };

        const handleTextEditMarkDeselected = (e: CustomEvent) => {
            if ((this as any).currentTextEditMark && e.detail.mark === (this as any).currentTextEditMark) {
                chartLayer.closeTextMarkToolBar();
                (this as any).currentTextEditMark = null;
            }
            e.stopPropagation();
        };

        const handleTextEditMarkDeleted = (e: CustomEvent) => {
            const { mark } = e.detail;
            if ((this as any).currentTextEditMark && mark === (this as any).currentTextEditMark) {
                chartLayer.closeTextMarkToolBar();
                (this as any).currentTextEditMark = null;
            }
            e.stopPropagation();
        };

        const handleTextEditMarkEditorRequest = (e: CustomEvent) => {
            const { mark, position, text, color, backgroundColor, textColor, fontSize } = e.detail;
            chartLayer.setState({
                isTextMarkEditorOpen: true,
                textMarkEditorPosition: {
                    x: e.detail.clientX || window.innerWidth / 2,
                    y: e.detail.clientY || window.innerHeight / 2
                },
                textMarkEditorInitialData: {
                    text: text,
                    color: color,
                    fontSize: fontSize,
                    isBold: false,
                    isItalic: false
                }
            });
            e.stopPropagation();
        };

        document.addEventListener('textEditMarkDragStart', handleTextEditMarkDragStart as EventListener);
        document.addEventListener('textEditMarkSelected', handleTextEditMarkSelected as EventListener);
        document.addEventListener('textEditMarkDeselected', handleTextEditMarkDeselected as EventListener);
        document.addEventListener('textEditMarkDeleted', handleTextEditMarkDeleted as EventListener);
        document.addEventListener('textEditMarkEditorRequest', handleTextEditMarkEditorRequest as EventListener);

        (this as any).textEditMarkEventHandlers = {
            textEditMarkDragStart: handleTextEditMarkDragStart,
            textEditMarkSelected: handleTextEditMarkSelected,
            textEditMarkDeselected: handleTextEditMarkDeselected,
            textEditMarkDeleted: handleTextEditMarkDeleted,
            textEditMarkEditorRequest: handleTextEditMarkEditorRequest
        };
    }

    public handleTextEditMarkEditorSave = (chartLayer: ChartLayer, text: string, color: string, backgroundColor: string, textColor: string, fontSize: number, isBold: boolean, isItalic: boolean) => {
        chartLayer.setState({
            isTextMarkEditorOpen: false,
            selectedTextMark: null
        });
    };

    public handleTextEditMarkEditorCancel = (chartLayer: ChartLayer) => {
        chartLayer.setState({
            isTextMarkEditorOpen: false,
            selectedTextMark: null
        });
    };

    public cleanupTextEditMarkEvents() {
        if ((this as any).textEditMarkEventHandlers) {
            const handlers = (this as any).textEditMarkEventHandlers;
            document.removeEventListener('textEditMarkDragStart', handlers.textEditMarkDragStart as EventListener);
            document.removeEventListener('textEditMarkSelected', handlers.textEditMarkSelected as EventListener);
            document.removeEventListener('textEditMarkDeselected', handlers.textEditMarkDeselected as EventListener);
            document.removeEventListener('textEditMarkDeleted', handlers.textEditMarkDeleted as EventListener);
            document.removeEventListener('textEditMarkEditorRequest', handlers.textEditMarkEditorRequest as EventListener);
            (this as any).textEditMarkEventHandlers = null;
        }
    }
    // =============================== TextEdit Mark End ===============================


    // =============================== Pin Mark Start ===============================
    public setupPinMarkEvents(chartLayer: ChartLayer) {
        const handlePinMarkDragStart = (e: CustomEvent) => {
        };
        const handlePinMarkSelected = (e: CustomEvent) => {
            const { mark, position, bubbleText, color, backgroundColor, textColor, fontSize } = e.detail;
            e.stopPropagation();
        };
        const handlePinMarkDeselected = (e: CustomEvent) => {
            chartLayer.closeTextMarkToolBar();
            e.stopPropagation();
        };
        const handlePinMarkDeleted = (e: CustomEvent) => {
            chartLayer.closeTextMarkToolBar();
            e.stopPropagation();
        };
        const handlePinMarkEditorRequest = (e: CustomEvent) => {
            const { mark, position, bubbleText, color, backgroundColor, textColor, fontSize } = e.detail;
            chartLayer.setState({
                isTextMarkEditorOpen: true,
                textMarkEditorPosition: {
                    x: e.detail.clientX || window.innerWidth / 2,
                    y: e.detail.clientY || window.innerHeight / 2
                },
                textMarkEditorInitialData: {
                    text: bubbleText,
                    color: color,
                    fontSize: fontSize,
                    isBold: false,
                    isItalic: false
                }
            });
            e.stopPropagation();
        };
        document.addEventListener('pinMarkDragStart', handlePinMarkDragStart as EventListener);
        document.addEventListener('pinMarkSelected', handlePinMarkSelected as EventListener);
        document.addEventListener('pinMarkDeselected', handlePinMarkDeselected as EventListener);
        document.addEventListener('pinMarkDeleted', handlePinMarkDeleted as EventListener);
        document.addEventListener('pinMarkEditorRequest', handlePinMarkEditorRequest as EventListener);
        (this as any).pinMarkEventHandlers = {
            pinMarkDragStart: handlePinMarkDragStart,
            pinMarkSelected: handlePinMarkSelected,
            pinMarkDeselected: handlePinMarkDeselected,
            pinMarkDeleted: handlePinMarkDeleted,
            pinMarkEditorRequest: handlePinMarkEditorRequest
        };
    }

    public cleanupPinMarkEvents() {
        if ((this as any).pinMarkEventHandlers) {
            const handlers = (this as any).pinMarkEventHandlers;
            document.removeEventListener('pinMarkDragStart', handlers.pinMarkDragStart as EventListener);
            document.removeEventListener('pinMarkSelected', handlers.pinMarkSelected as EventListener);
            document.removeEventListener('pinMarkDeselected', handlers.pinMarkDeselected as EventListener);
            document.removeEventListener('pinMarkDeleted', handlers.pinMarkDeleted as EventListener);
            document.removeEventListener('pinMarkEditorRequest', handlers.pinMarkEditorRequest as EventListener);
            (this as any).pinMarkEventHandlers = null;
        }
    }
    // =============================== Pin Mark End ===============================

    // =============================== SignPost Mark Start =============================
    public setupSignPostMarkEvents(chartLayer: ChartLayer) {
        const handleSignPostMarkSelected = (e: any) => {
            const { mark } = e.detail;
            (this as any).currentSignPostMark = mark;
            e.stopPropagation();
        };
        const handleSignPostMarkDeselected = (e: any) => {
            if ((this as any).currentSignPostMark && e.detail.mark === (this as any).currentSignPostMark) {
                chartLayer.closeTextMarkToolBar();
                (this as any).currentSignPostMark = null;
            }
            e.stopPropagation();
        };
        const handleSignPostMarkDeleted = (e: any) => {
            const { mark } = e.detail;
            if ((this as any).currentSignPostMark && mark === (this as any).currentSignPostMark) {
                chartLayer.closeTextMarkToolBar();
                (this as any).currentSignPostMark = null;
            }
            e.stopPropagation();
        };
        const handleSignPostMarkEditorRequest = (e: any) => {
            const { text, color, fontSize } = e.detail;
            chartLayer.setState({
                isTextMarkEditorOpen: true,
                textMarkEditorPosition: {
                    x: e.detail.clientX || window.innerWidth / 2,
                    y: e.detail.clientY || window.innerHeight / 2
                },
                textMarkEditorInitialData: {
                    text: text,
                    color: color,
                    fontSize: fontSize,
                    isBold: false,
                    isItalic: false
                }
            });
            e.stopPropagation();
        };
        document.addEventListener('signPostMarkSelected', handleSignPostMarkSelected);
        document.addEventListener('signPostMarkDeselected', handleSignPostMarkDeselected);
        document.addEventListener('signPostMarkDeleted', handleSignPostMarkDeleted);
        document.addEventListener('signPostMarkEditorRequest', handleSignPostMarkEditorRequest);
        (this as any).signPostMarkEventHandlers = {
            signPostMarkSelected: handleSignPostMarkSelected,
            signPostMarkDeselected: handleSignPostMarkDeselected,
            signPostMarkDeleted: handleSignPostMarkDeleted,
            signPostMarkEditorRequest: handleSignPostMarkEditorRequest
        };
    }

    public handleSignPostMarkEditorSave = (chartLayer: ChartLayer, text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => {
        chartLayer.setState({
            isTextMarkEditorOpen: false,
            selectedTextMark: null
        });
    };

    public handleSignPostMarkEditorCancel = (chartLayer: ChartLayer) => {
        chartLayer.setState({
            isTextMarkEditorOpen: false,
            selectedTextMark: null
        });
    };

    public cleanupSignPostMarkEvents() {
        if ((this as any).signPostMarkEventHandlers) {
            const handlers = (this as any).signPostMarkEventHandlers;
            document.removeEventListener('signPostMarkSelected', handlers.signPostMarkSelected);
            document.removeEventListener('signPostMarkDeselected', handlers.signPostMarkDeselected);
            document.removeEventListener('signPostMarkDeleted', handlers.signPostMarkDeleted);
            document.removeEventListener('signPostMarkEditorRequest', handlers.signPostMarkEditorRequest);
            (this as any).signPostMarkEventHandlers = null;
        }
    }
    // =============================== SignPost Mark End ===============================

    // =============================== Bubble Box Mark Start =============================
    public setupBubbleBoxMarkEvents(chartLayer: ChartLayer) {
        const handleBubbleBoxMarkSelected = (e: any) => {
            const { mark, position, text, color, backgroundColor, textColor, fontSize } = e.detail;
            (this as any).currentBubbleBoxMark = mark;
            e.stopPropagation();
        };
        const handleBubbleBoxMarkDeselected = (e: any) => {
            if ((this as any).currentBubbleBoxMark && e.detail.mark === (this as any).currentBubbleBoxMark) {
                chartLayer.closeTextMarkToolBar();
                (this as any).currentBubbleBoxMark = null;
            }
            e.stopPropagation();
        };
        const handleBubbleBoxMarkDeleted = (e: any) => {
            const { mark } = e.detail;
            if ((this as any).currentBubbleBoxMark && mark === (this as any).currentBubbleBoxMark) {
                chartLayer.closeTextMarkToolBar();
                (this as any).currentBubbleBoxMark = null;
            }
            e.stopPropagation();
        };
        const handleBubbleBoxMarkEditorRequest = (e: any) => {
            const { mark, position, text, color, backgroundColor, textColor, fontSize } = e.detail;
            chartLayer.setState({
                isTextMarkEditorOpen: true,
                textMarkEditorPosition: {
                    x: e.detail.clientX || window.innerWidth / 2,
                    y: e.detail.clientY || window.innerHeight / 2
                },
                textMarkEditorInitialData: {
                    text: text,
                    color: color,
                    fontSize: fontSize,
                    isBold: false,
                    isItalic: false
                }
            });
            e.stopPropagation();
        };
        document.addEventListener('bubbleBoxMarkSelected', handleBubbleBoxMarkSelected);
        document.addEventListener('bubbleBoxMarkDeselected', handleBubbleBoxMarkDeselected);
        document.addEventListener('bubbleBoxMarkDeleted', handleBubbleBoxMarkDeleted);
        document.addEventListener('bubbleBoxMarkEditorRequest', handleBubbleBoxMarkEditorRequest);
        (this as any).bubbleBoxMarkEventHandlers = {
            bubbleBoxMarkSelected: handleBubbleBoxMarkSelected,
            bubbleBoxMarkDeselected: handleBubbleBoxMarkDeselected,
            bubbleBoxMarkDeleted: handleBubbleBoxMarkDeleted,
            bubbleBoxMarkEditorRequest: handleBubbleBoxMarkEditorRequest
        };
    }

    public handleBubbleBoxMarkEditorSave = (chartLayer: ChartLayer, text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => {
        chartLayer.setState({
            isTextMarkEditorOpen: false,
            selectedTextMark: null
        });
    };

    public handleBubbleBoxMarkEditorCancel = (chartLayer: ChartLayer) => {
        chartLayer.setState({
            isTextMarkEditorOpen: false,
            selectedTextMark: null
        });
    };

    public cleanupBubbleBoxMarkEvents() {
        if ((this as any).signPostMarkEventHandlers) {
            const handlers = (this as any).signPostMarkEventHandlers;
            document.removeEventListener('bubbleBoxMarkSelected', handlers.signPostMarkSelected);
            document.removeEventListener('bubbleBoxMarkDeselected', handlers.signPostMarkDeselected);
            document.removeEventListener('bubbleBoxMarkDeleted', handlers.signPostMarkDeleted);
            document.removeEventListener('bubbleBoxMarkEditorRequest', handlers.signPostMarkEditorRequest);
            (this as any).signPostMarkEventHandlers = null;
        }
    }
    // =============================== Bubble Box Mark End ===============================
}