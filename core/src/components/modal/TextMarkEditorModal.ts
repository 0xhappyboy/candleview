import { I18n } from "../../i18n";
import { ThemeConfig } from "../../theme";

export interface TextMarkEditorModalOptions {
    isOpen: boolean;
    position: { x: number; y: number };
    parentRef?: HTMLElement | null;
    theme: ThemeConfig;
    initialText: string;
    initialColor: string;
    initialFontSize: number;
    initialIsBold: boolean;
    initialIsItalic: boolean;
    onSave: (text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => void;
    onCancel: () => void;
    i18n: I18n;
}

type CSSStyles = Partial<CSSStyleDeclaration>;

export class TextMarkEditorModal {
    private container: HTMLElement | null = null;
    private options: TextMarkEditorModalOptions;
    private text: string;
    private color: string;
    private fontSize: number;
    private isBold: boolean;
    private isItalic: boolean;
    private modalPosition: { x: number; y: number };
    private isDragging: boolean = false;
    private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
    private modalRef: HTMLDivElement | null = null;
    private headerRef: HTMLDivElement | null = null;
    private textareaRef: HTMLTextAreaElement | null = null;
    private boundHandleMouseMove: (e: MouseEvent) => void;
    private boundHandleMouseUp: () => void;

    constructor(options: TextMarkEditorModalOptions) {
        this.options = options;
        this.text = options.initialText;
        this.color = options.initialColor;
        this.fontSize = options.initialFontSize;
        this.isBold = options.initialIsBold;
        this.isItalic = options.initialIsItalic;
        this.modalPosition = { ...options.position };
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);

        if (options.isOpen) {
            this.render();
        }
    }

    private handleSave = (): void => {
        if (this.text.trim()) {
            this.options.onSave(this.text.trim(), this.color, this.fontSize, this.isBold, this.isItalic);
        }
    };

    private handleCancel = (): void => {
        this.options.onCancel();
    };

    private handleMouseDown = (e: MouseEvent): void => {
        if (e.target === this.headerRef || this.headerRef?.contains(e.target as Node)) {
            this.isDragging = true;
            const rect = this.modalRef!.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            e.preventDefault();
            document.addEventListener('mousemove', this.boundHandleMouseMove);
            document.addEventListener('mouseup', this.boundHandleMouseUp);
        }
    };

    private handleMouseMove(e: MouseEvent): void {
        if (this.isDragging && this.options.parentRef) {
            const newX = e.clientX - this.dragOffset.x;
            const newY = e.clientY - this.dragOffset.y;
            const modalWidth = this.modalRef?.offsetWidth || 320;
            const modalHeight = this.modalRef?.offsetHeight || 320;
            const parentRect = this.options.parentRef.getBoundingClientRect();
            const minX = parentRect.left;
            const maxX = parentRect.right - modalWidth;
            const minY = parentRect.top;
            const maxY = parentRect.bottom - modalHeight;

            this.modalPosition = {
                x: Math.max(minX, Math.min(newX, maxX)),
                y: Math.max(minY, Math.min(newY, maxY))
            };
            this.updateModalPosition();
        }
    }

    private handleMouseUp(): void {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.boundHandleMouseMove);
        document.removeEventListener('mouseup', this.boundHandleMouseUp);
    }

    private handleOverlayClick = (e: MouseEvent): void => {
        if (e.target === e.currentTarget) {
            this.handleCancel();
        }
    };

    private handleKeyPress = (e: KeyboardEvent): void => {
        if (e.key === 'Enter' && e.ctrlKey) {
            this.handleSave();
        } else if (e.key === 'Escape') {
            this.handleCancel();
        }
    };

    private updateModalPosition(): void {
        if (this.modalRef) {
            this.modalRef.style.left = `${this.modalPosition.x}px`;
            this.modalRef.style.top = `${this.modalPosition.y}px`;
        }
    }

    private getStyles(): Record<string, CSSStyles> {
        const { theme } = this.options;
        const isDragging = this.isDragging;

        return {
            modalOverlay: {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                zIndex: '9999',
                background: 'transparent',
                userSelect: 'none',
            },
            modalContent: {
                position: 'absolute',
                left: `${this.modalPosition.x}px`,
                top: `${this.modalPosition.y}px`,
                background: theme.toolbar.background,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '8px',
                padding: '0',
                width: `${Math.min(320, (this.options.parentRef?.clientWidth || 320) - 40)}px`,
                maxWidth: '90vw',
                zIndex: '10000',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                cursor: isDragging ? 'grabbing' : 'default',
                userSelect: isDragging ? 'none' : 'auto',
                display: 'flex',
                flexDirection: 'column',
            },
            modalHeader: {
                padding: '16px 16px 12px 16px',
                borderBottom: `1px solid ${theme.toolbar.border}`,
                cursor: 'grab',
                userSelect: 'none',
            },
            modalTitle: {
                fontSize: '14px',
                fontWeight: 'bold',
                color: theme.layout.textColor,
            },
            modalBody: {
                padding: '16px',
            },
            textarea: {
                width: '94%',
                minHeight: '80px',
                background: theme.toolbar.background,
                color: theme.layout.textColor,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                padding: '8px',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '12px',
                fontFamily: 'Arial, sans-serif',
            },
            formGroup: {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '16px',
            },
            formRow: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            },
            label: {
                fontSize: '12px',
                color: theme.layout.textColor,
                minWidth: '60px',
            },
            colorInput: {
                width: '40px',
                height: '30px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            },
            select: {
                background: theme.toolbar.background,
                color: theme.layout.textColor,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
            },
            styleButtons: {
                display: 'flex',
                gap: '8px',
            },
            styleButton: {
                background: 'transparent',
                color: theme.layout.textColor,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                minWidth: '40px',
            },
            styleButtonActive: {
                background: theme.toolbar.button.active,
                color: theme.toolbar.button.activeTextColor,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                minWidth: '40px',
            },
            modalActions: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
            },
            cancelButton: {
                background: 'transparent',
                color: theme.layout.textColor,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
            },
            confirmButton: {
                background: theme.toolbar.button.active,
                color: theme.toolbar.button.activeTextColor,
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
            },
            confirmButtonDisabled: {
                background: '#95a5a6',
                color: '#E8EAED',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'not-allowed',
            },
            hintText: {
                fontSize: '10px',
                color: `${theme.layout.textColor}80`,
                marginTop: '8px',
                textAlign: 'center',
            },
        };
    }

    private applyStyles(element: HTMLElement, styles: CSSStyles): void {
        for (const [key, value] of Object.entries(styles)) {
            if (value !== undefined) {
                (element.style as any)[key] = value;
            }
        }
    }

    private createElement<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        className?: string,
        styles?: CSSStyles
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (styles) this.applyStyles(element, styles);
        return element;
    }

    private getMaxModalHeight(): number {
        const parentEl = this.options.parentRef;
        if (parentEl) {
            const parentRect = parentEl.getBoundingClientRect();
            const modalTop = this.modalPosition.y;
            const maxHeight = parentRect.bottom - modalTop - 20;
            return Math.max(200, Math.min(500, maxHeight));
        }
        return 500;
    }

    private render(): void {
        if (this.container) {
            this.destroy();
        }
        this.injectScrollbarStyles();
        this.container = this.createElement('div', 'text-mark-editor-overlay');
        const styles = this.getStyles();
        this.applyStyles(this.container, styles.modalOverlay);
        this.modalRef = this.createElement('div', 'text-mark-editor-content', styles.modalContent);
        this.modalRef.classList.add('text-editor-scrollbar');
        const maxHeight = this.getMaxModalHeight();
        this.modalRef.style.maxHeight = `${maxHeight}px`;
        this.modalRef.style.overflowY = 'auto';
        this.modalRef.addEventListener('mousedown', this.handleMouseDown as EventListener);
        this.headerRef = this.createElement('div', 'text-mark-editor-header', styles.modalHeader);
        const title = this.createElement('div', 'text-mark-editor-title', styles.modalTitle);
        title.textContent = this.options.i18n.leftPanel?.text || 'Text Edut';
        this.headerRef.appendChild(title);
        this.modalRef.appendChild(this.headerRef);
        const body = this.createElement('div', 'text-mark-editor-body', styles.modalBody);
        this.textareaRef = this.createElement('textarea', 'text-input', styles.textarea);
        this.textareaRef.value = this.text;
        this.textareaRef.placeholder = this.options.i18n.leftPanel?.textDesc || 'Input Text';
        this.textareaRef.addEventListener('input', (e) => {
            this.text = (e.target as HTMLTextAreaElement).value;
        });
        this.textareaRef.addEventListener('keydown', this.handleKeyPress as EventListener);
        body.appendChild(this.textareaRef);
        const formGroup = this.createElement('div', 'form-group', styles.formGroup);
        const colorRow = this.createElement('div', 'color-row', styles.formRow);
        const colorLabel = this.createElement('label', 'color-label', styles.label);
        colorLabel.textContent = `${this.options.i18n.toolBar?.color || 'Color'}:`;
        colorRow.appendChild(colorLabel);
        const colorInput = this.createElement('input', 'color-input', styles.colorInput);
        colorInput.type = 'color';
        colorInput.value = this.color;
        colorInput.addEventListener('change', (e) => {
            this.color = (e.target as HTMLInputElement).value;
        });
        colorRow.appendChild(colorInput);
        formGroup.appendChild(colorRow);
        const fontSizeRow = this.createElement('div', 'font-size-row', styles.formRow);
        const fontSizeLabel = this.createElement('label', 'font-size-label', styles.label);
        fontSizeLabel.textContent = `${this.options.i18n.toolBar?.fontSize || 'Font Size'}:`;
        fontSizeRow.appendChild(fontSizeLabel);
        const fontSizeSelect = this.createElement('select', 'font-size-select', styles.select);
        [12, 14, 16, 18, 20, 24, 28, 32].forEach(size => {
            const option = this.createElement('option', '');
            option.value = size.toString();
            option.textContent = `${size}px`;
            if (this.fontSize === size) option.selected = true;
            fontSizeSelect.appendChild(option);
        });
        fontSizeSelect.addEventListener('change', (e) => {
            this.fontSize = Number((e.target as HTMLSelectElement).value);
        });
        fontSizeRow.appendChild(fontSizeSelect);
        formGroup.appendChild(fontSizeRow);
        const styleRow = this.createElement('div', 'style-row', styles.formRow);
        const styleLabel = this.createElement('label', 'style-label', styles.label);
        styleLabel.textContent = 'Style:';
        styleRow.appendChild(styleLabel);
        const styleButtons = this.createElement('div', 'style-buttons', styles.styleButtons);
        const boldBtn = this.createElement('button', 'bold-btn',
            this.isBold ? styles.styleButtonActive : styles.styleButton
        );
        boldBtn.textContent = this.options.i18n.toolBar?.bold || 'Bold';
        boldBtn.addEventListener('click', () => {
            this.isBold = !this.isBold;
            if (this.isBold) {
                this.applyStyles(boldBtn, styles.styleButtonActive);
            } else {
                this.applyStyles(boldBtn, styles.styleButton);
            }
        });
        styleButtons.appendChild(boldBtn);
        const italicBtn = this.createElement('button', 'italic-btn',
            this.isItalic ? styles.styleButtonActive : styles.styleButton
        );
        italicBtn.textContent = this.options.i18n.toolBar?.italic || 'Italic';
        italicBtn.style.fontStyle = 'italic';
        italicBtn.addEventListener('click', () => {
            this.isItalic = !this.isItalic;
            if (this.isItalic) {
                this.applyStyles(italicBtn, styles.styleButtonActive);
            } else {
                this.applyStyles(italicBtn, styles.styleButton);
            }
        });
        styleButtons.appendChild(italicBtn);
        styleRow.appendChild(styleButtons);
        formGroup.appendChild(styleRow);
        body.appendChild(formGroup);
        const actions = this.createElement('div', 'modal-actions', styles.modalActions);
        const cancelBtn = this.createElement('button', 'cancel-btn', styles.cancelButton);
        cancelBtn.textContent = this.options.i18n.systemSettings?.cancel || 'Cancel';
        cancelBtn.addEventListener('click', () => this.handleCancel());
        actions.appendChild(cancelBtn);
        const confirmBtn = this.createElement('button', 'confirm-btn',
            this.text.trim() ? styles.confirmButton : styles.confirmButtonDisabled
        );
        confirmBtn.textContent = this.options.i18n.systemSettings?.confirm || 'Confirm';
        (confirmBtn as HTMLButtonElement).disabled = !this.text.trim();
        confirmBtn.addEventListener('click', () => this.handleSave());
        actions.appendChild(confirmBtn);
        body.appendChild(actions);
        this.modalRef.appendChild(body);
        this.container.appendChild(this.modalRef);
        this.container.addEventListener('click', this.handleOverlayClick as EventListener);
        const target = this.options.parentRef || document.body;
        target.appendChild(this.container);
        this.adjustModalPosition();
        setTimeout(() => {
            this.textareaRef?.focus();
        }, 0);
    }

    private adjustModalPosition(): void {
        if (!this.modalRef || !this.options.parentRef) return;
        const parentRect = this.options.parentRef.getBoundingClientRect();
        const modalRect = this.modalRef.getBoundingClientRect();
        let needUpdate = false;
        let newX = this.modalPosition.x;
        let newY = this.modalPosition.y;
        if (modalRect.right > parentRect.right) {
            newX = parentRect.right - modalRect.width - 10;
            needUpdate = true;
        }
        if (newX < parentRect.left) {
            newX = parentRect.left + 10;
            needUpdate = true;
        }
        if (modalRect.bottom > parentRect.bottom) {
            newY = parentRect.bottom - modalRect.height - 10;
            needUpdate = true;
        }
        if (newY < parentRect.top) {
            newY = parentRect.top + 10;
            needUpdate = true;
        }
        if (needUpdate) {
            this.modalPosition = { x: newX, y: newY };
            this.updateModalPosition();
        }
    }

    private injectScrollbarStyles(): void {
        const styleId = 'text-mark-editor-modal-styles';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
        .text-editor-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .text-editor-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 3px;
        }
        .text-editor-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(128, 128, 128, 0.5);
            border-radius: 3px;
        }
        .text-editor-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(128, 128, 128, 0.7);
        }
        .text-editor-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(128, 128, 128, 0.5) transparent;
        }
    `;
        document.head.appendChild(style);
    }

    public update(options: Partial<TextMarkEditorModalOptions>): void {
        let needsRender = false;

        if (options.initialText !== undefined) {
            this.text = options.initialText;
            needsRender = true;
        }
        if (options.initialColor !== undefined) {
            this.color = options.initialColor;
            needsRender = true;
        }
        if (options.initialFontSize !== undefined) {
            this.fontSize = options.initialFontSize;
            needsRender = true;
        }
        if (options.initialIsBold !== undefined) {
            this.isBold = options.initialIsBold;
            needsRender = true;
        }
        if (options.initialIsItalic !== undefined) {
            this.isItalic = options.initialIsItalic;
            needsRender = true;
        }
        if (options.position !== undefined) {
            this.modalPosition = { ...options.position };
            needsRender = true;
        }

        Object.assign(this.options, options);

        if (options.isOpen !== undefined) {
            if (options.isOpen) {
                this.render();
            } else {
                this.destroy();
            }
        } else if (needsRender && this.options.isOpen) {
            this.render();
        }
    }

    public destroy(): void {
        if (this.container) {
            document.removeEventListener('mousemove', this.boundHandleMouseMove);
            document.removeEventListener('mouseup', this.boundHandleMouseUp);
            this.container.remove();
            this.container = null;
        }
        this.modalRef = null;
        this.headerRef = null;
        this.textareaRef = null;
    }
}