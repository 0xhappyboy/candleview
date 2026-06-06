import { I18n } from "../../i18n";
import { ThemeConfig } from "../../theme";

export interface TextMarkEditorModalOptions {
    isOpen: boolean;
    position: { x: number; y: number };
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
        if (this.isDragging) {
            const newX = e.clientX - this.dragOffset.x;
            const newY = e.clientY - this.dragOffset.y;
            const maxX = window.innerWidth - 320;
            const maxY = window.innerHeight - 300;
            this.modalPosition = {
                x: Math.max(10, Math.min(newX, maxX)),
                y: Math.max(10, Math.min(newY, maxY))
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

    private getStyles(): { [key: string]: React.CSSProperties } {
        const { theme } = this.options;
        const isDragging = this.isDragging;
        
        return {
            modalOverlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                background: 'transparent',
                userSelect: 'none',
            } as React.CSSProperties,
            modalContent: {
                position: 'absolute',
                left: `${this.modalPosition.x}px`,
                top: `${this.modalPosition.y}px`,
                background: theme.toolbar.background,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '8px',
                padding: '0',
                width: '300px',
                maxWidth: '90vw',
                zIndex: 10000,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                cursor: isDragging ? 'grabbing' : 'default',
                userSelect: isDragging ? 'none' : 'auto',
            } as React.CSSProperties,
            modalHeader: {
                padding: '16px 16px 12px 16px',
                borderBottom: `1px solid ${theme.toolbar.border}`,
                cursor: 'grab',
                userSelect: 'none',
            } as React.CSSProperties,
            modalTitle: {
                fontSize: '14px',
                fontWeight: 'bold',
                color: theme.layout.textColor,
            } as React.CSSProperties,
            modalBody: {
                padding: '16px',
            } as React.CSSProperties,
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
            } as React.CSSProperties,
            formGroup: {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '16px',
            } as React.CSSProperties,
            formRow: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            } as React.CSSProperties,
            label: {
                fontSize: '12px',
                color: theme.layout.textColor,
                minWidth: '60px',
            } as React.CSSProperties,
            colorInput: {
                width: '40px',
                height: '30px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            } as React.CSSProperties,
            select: {
                background: theme.toolbar.background,
                color: theme.layout.textColor,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
            } as React.CSSProperties,
            styleButtons: {
                display: 'flex',
                gap: '8px',
            } as React.CSSProperties,
            styleButton: {
                background: 'transparent',
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                minWidth: '40px',
            } as React.CSSProperties,
            styleButtonActive: {
                background: theme.toolbar.button.active,
                color: theme.toolbar.button.activeTextColor,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                minWidth: '40px',
            } as React.CSSProperties,
            modalActions: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
            } as React.CSSProperties,
            cancelButton: {
                background: 'transparent',
                color: theme.layout.textColor,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
            } as React.CSSProperties,
            confirmButton: {
                background: theme.toolbar.button.active,
                color: theme.toolbar.button.activeTextColor,
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
            } as React.CSSProperties,
            confirmButtonDisabled: {
                background: '#95a5a6',
                color: '#E8EAED',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'not-allowed',
            } as React.CSSProperties,
            hintText: {
                fontSize: '10px',
                color: `${theme.layout.textColor}80`,
                marginTop: '8px',
                textAlign: 'center',
            } as React.CSSProperties,
        };
    }

    private applyStyles(element: HTMLElement, styles: React.CSSProperties): void {
        Object.assign(element.style, styles);
    }

    private createElement<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        className?: string,
        styles?: React.CSSProperties
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (styles) this.applyStyles(element, styles);
        return element;
    }

    private render(): void {
        if (this.container) {
            this.destroy();
        }

        this.container = this.createElement('div', 'text-mark-editor-overlay');
        const styles = this.getStyles();
        this.applyStyles(this.container, styles.modalOverlay);

        this.modalRef = this.createElement('div', 'text-mark-editor-content', styles.modalContent);
        this.modalRef.addEventListener('mousedown', this.handleMouseDown as EventListener);

        this.headerRef = this.createElement('div', 'text-mark-editor-header', styles.modalHeader);
        const title = this.createElement('div', 'text-mark-editor-title', styles.modalTitle);
        title.textContent = this.options.i18n.leftPanel?.text || '文本编辑';
        this.headerRef.appendChild(title);
        this.modalRef.appendChild(this.headerRef);

        const body = this.createElement('div', 'text-mark-editor-body', styles.modalBody);

        this.textareaRef = this.createElement('textarea', 'text-input', styles.textarea);
        this.textareaRef.value = this.text;
        this.textareaRef.placeholder = this.options.i18n.leftPanel?.textDesc || '输入文本';
        this.textareaRef.addEventListener('input', (e) => {
            this.text = (e.target as HTMLTextAreaElement).value;
        });
        this.textareaRef.addEventListener('keydown', this.handleKeyPress as EventListener);
        body.appendChild(this.textareaRef);

        const formGroup = this.createElement('div', 'form-group', styles.formGroup);

        const colorRow = this.createElement('div', 'color-row', styles.formRow);
        const colorLabel = this.createElement('label', 'color-label', styles.label);
        colorLabel.textContent = `${this.options.i18n.toolBar?.color || '颜色'}:`;
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
        fontSizeLabel.textContent = `${this.options.i18n.toolBar?.fontSize || '字体大小'}:`;
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
        styleLabel.textContent = '样式:';
        styleRow.appendChild(styleLabel);
        
        const styleButtons = this.createElement('div', 'style-buttons', styles.styleButtons);
        
        const boldBtn = this.createElement('button', 'bold-btn', 
            this.isBold ? styles.styleButtonActive : styles.styleButton
        );
        boldBtn.textContent = this.options.i18n.toolBar?.bold || '粗体';
        boldBtn.addEventListener('click', () => {
            this.isBold = !this.isBold;
            boldBtn.style.background = this.isBold ? (this.options.theme.toolbar.button.active || '#2962FF') : 'transparent';
            boldBtn.style.color = this.isBold ? (this.options.theme.toolbar.button.activeTextColor || '#fff') : (this.options.theme.layout.textColor || '#000');
        });
        styleButtons.appendChild(boldBtn);
        
        const italicBtn = this.createElement('button', 'italic-btn', 
            this.isItalic ? styles.styleButtonActive : styles.styleButton
        );
        italicBtn.textContent = this.options.i18n.toolBar?.italic || '斜体';
        italicBtn.style.fontStyle = 'italic';
        italicBtn.addEventListener('click', () => {
            this.isItalic = !this.isItalic;
            italicBtn.style.background = this.isItalic ? (this.options.theme.toolbar.button.active || '#2962FF') : 'transparent';
            italicBtn.style.color = this.isItalic ? (this.options.theme.toolbar.button.activeTextColor || '#fff') : (this.options.theme.layout.textColor || '#000');
        });
        styleButtons.appendChild(italicBtn);
        
        styleRow.appendChild(styleButtons);
        formGroup.appendChild(styleRow);
        body.appendChild(formGroup);

        const actions = this.createElement('div', 'modal-actions', styles.modalActions);
        
        const cancelBtn = this.createElement('button', 'cancel-btn', styles.cancelButton);
        cancelBtn.textContent = this.options.i18n.systemSettings?.cancel || '取消';
        cancelBtn.addEventListener('click', () => this.handleCancel());
        actions.appendChild(cancelBtn);
        
        const confirmBtn = this.createElement('button', 'confirm-btn', 
            this.text.trim() ? styles.confirmButton : styles.confirmButtonDisabled
        );
        confirmBtn.textContent = this.options.i18n.systemSettings?.confirm || '确定';
        confirmBtn.disabled = !this.text.trim();
        confirmBtn.addEventListener('click', () => this.handleSave());
        actions.appendChild(confirmBtn);
        body.appendChild(actions);

        const hintText = this.createElement('div', 'hint-text', styles.hintText);
        hintText.textContent = `${this.options.i18n.modal?.dragToMove || '拖动标题栏移动'}, ${this.options.i18n.tooltips?.ctrlEnterToConfirm || 'Ctrl+Enter: 确认'}, ${this.options.i18n.tooltips?.escToCancel || 'Esc: 取消'}`;
        body.appendChild(hintText);

        this.modalRef.appendChild(body);
        this.container.appendChild(this.modalRef);
        this.container.addEventListener('click', this.handleOverlayClick as EventListener);
        document.body.appendChild(this.container);
        
        setTimeout(() => {
            this.textareaRef?.focus();
        }, 0);
    }

    public update(options: Partial<TextMarkEditorModalOptions>): void {
        if (options.initialText !== undefined) this.text = options.initialText;
        if (options.initialColor !== undefined) this.color = options.initialColor;
        if (options.initialFontSize !== undefined) this.fontSize = options.initialFontSize;
        if (options.initialIsBold !== undefined) this.isBold = options.initialIsBold;
        if (options.initialIsItalic !== undefined) this.isItalic = options.initialIsItalic;
        if (options.position !== undefined) this.modalPosition = { ...options.position };
        
        Object.assign(this.options, options);
        
        if (options.isOpen !== undefined) {
            if (options.isOpen) {
                this.render();
            } else {
                this.destroy();
            }
        } else if (this.options.isOpen) {
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