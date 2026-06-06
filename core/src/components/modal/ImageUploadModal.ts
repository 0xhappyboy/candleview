import { I18n } from "../../i18n";
import { ThemeConfig } from "../../theme";

export interface ImageUploadModalOptions {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (imageUrl: string) => void;
    theme: ThemeConfig;
    i18n: I18n;
}

export class ImageUploadModal {
    private container: HTMLElement | null = null;
    private options: ImageUploadModalOptions;
    private imageUrl: string = '';
    private modalPosition: { x: number; y: number };
    private isDragging: boolean = false;
    private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
    private fileInput: HTMLInputElement | null = null;
    private modalRef: HTMLDivElement | null = null;
    private headerRef: HTMLDivElement | null = null;
    private boundHandleMouseMove: (e: MouseEvent) => void;
    private boundHandleMouseUp: () => void;

    constructor(options: ImageUploadModalOptions) {
        this.options = options;
        this.modalPosition = {
            x: window.innerWidth / 2 - 175,
            y: window.innerHeight / 2 - 120
        };
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
        
        if (options.isOpen) {
            this.render();
        }
    }

    private handleFileSelect = (event: Event): void => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            this.imageUrl = URL.createObjectURL(file);
            this.updatePreview();
        }
    };

    private handleUrlChange = (event: Event): void => {
        const input = event.target as HTMLInputElement;
        this.imageUrl = input.value;
        this.updatePreview();
    };

    private handleConfirm = (): void => {
        if (this.imageUrl) {
            this.options.onConfirm(this.imageUrl);
        }
    };

    private handleFileButtonClick = (): void => {
        this.fileInput?.click();
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
            const maxX = window.innerWidth - 350;
            const maxY = window.innerHeight - 240;
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
            this.options.onClose();
        }
    };

    private handleKeyPress = (e: KeyboardEvent): void => {
        if (e.key === 'Enter' && e.ctrlKey) {
            this.handleConfirm();
        } else if (e.key === 'Escape') {
            this.options.onClose();
        }
    };

    private updatePreview(): void {
        const previewImg = this.container?.querySelector('.image-preview');
        if (previewImg && this.imageUrl) {
            (previewImg as HTMLImageElement).src = this.imageUrl;
            (previewImg as HTMLElement).style.display = 'block';
        } else if (previewImg) {
            (previewImg as HTMLElement).style.display = 'none';
        }
    }

    private updateModalPosition(): void {
        if (this.modalRef) {
            this.modalRef.style.left = `${this.modalPosition.x}px`;
            this.modalRef.style.top = `${this.modalPosition.y}px`;
        }
    }

    private getStyles(): { [key: string]: React.CSSProperties } {
        const { theme } = this.options;
        return {
            modalOverlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                background: 'transparent',
            } as React.CSSProperties,
            modalContent: {
                position: 'absolute',
                left: `${this.modalPosition.x}px`,
                top: `${this.modalPosition.y}px`,
                background: theme.toolbar.background,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '8px',
                padding: '0',
                width: '350px',
                maxWidth: '90vw',
                zIndex: 10000,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                cursor: this.isDragging ? 'grabbing' : 'default',
                userSelect: this.isDragging ? 'none' : 'auto',
            } as React.CSSProperties,
            modalHeader: {
                padding: '12px 16px',
                borderBottom: `1px solid ${theme.toolbar.border}`,
                cursor: 'grab',
                userSelect: 'none',
            } as React.CSSProperties,
            modalTitle: {
                fontSize: '13px',
                fontWeight: 'bold',
                color: theme.layout.textColor,
                margin: 0,
            } as React.CSSProperties,
            modalBody: {
                padding: '16px',
            } as React.CSSProperties,
            uploadSection: {
                marginBottom: '12px',
            } as React.CSSProperties,
            uploadButton: {
                background: theme.toolbar.button.active,
                color: theme.toolbar.button.activeTextColor,
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                width: '100%',
            } as React.CSSProperties,
            urlSection: {
                marginBottom: '12px',
            } as React.CSSProperties,
            urlLabel: {
                display: 'block',
                marginBottom: '4px',
                fontSize: '12px',
                color: theme.layout.textColor,
                fontWeight: '500',
            } as React.CSSProperties,
            urlInput: {
                width: '100%',
                padding: '6px 8px',
                background: theme.toolbar.background,
                color: theme.layout.textColor,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                fontSize: '12px',
                boxSizing: 'border-box',
            } as React.CSSProperties,
            previewSection: {
                marginBottom: '12px',
            } as React.CSSProperties,
            previewLabel: {
                display: 'block',
                marginBottom: '4px',
                fontSize: '12px',
                color: theme.layout.textColor,
                fontWeight: '500',
            } as React.CSSProperties,
            imagePreview: {
                maxWidth: '100%',
                maxHeight: '120px',
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
            } as React.CSSProperties,
            modalActions: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '16px',
            } as React.CSSProperties,
            cancelButton: {
                background: 'transparent',
                color: theme.layout.textColor,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                minWidth: '60px',
            } as React.CSSProperties,
            confirmButton: {
                background: theme.toolbar.button.active,
                color: theme.toolbar.button.activeTextColor,
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                minWidth: '60px',
            } as React.CSSProperties,
            confirmButtonDisabled: {
                background: '#6c757d',
                color: '#E8EAED',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'not-allowed',
                opacity: 0.6,
                minWidth: '60px',
            } as React.CSSProperties,
            hintText: {
                fontSize: '10px',
                color: `${theme.layout.textColor}80`,
                marginTop: '12px',
                textAlign: 'center',
                lineHeight: '1.3',
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

        this.container = this.createElement('div', 'image-upload-modal-overlay');
        const styles = this.getStyles();
        this.applyStyles(this.container, styles.modalOverlay);

        this.modalRef = this.createElement('div', 'image-upload-modal-content', styles.modalContent);
        this.modalRef.addEventListener('mousedown', this.handleMouseDown as EventListener);
        this.modalRef.addEventListener('keydown', this.handleKeyPress as EventListener);

        this.headerRef = this.createElement('div', 'image-upload-modal-header', styles.modalHeader);
        const title = this.createElement('div', 'image-upload-modal-title', styles.modalTitle);
        title.textContent = this.options.i18n.leftPanel?.image || '图片上传';
        this.headerRef.appendChild(title);
        this.modalRef.appendChild(this.headerRef);

        const body = this.createElement('div', 'image-upload-modal-body', styles.modalBody);

        const uploadSection = this.createElement('div', 'upload-section', styles.uploadSection);
        const uploadButton = this.createElement('button', 'upload-button', styles.uploadButton);
        uploadButton.textContent = this.options.i18n.leftPanel?.imageDesc || '选择文件';
        uploadButton.addEventListener('click', this.handleFileButtonClick);
        uploadSection.appendChild(uploadButton);

        this.fileInput = this.createElement('input', 'file-input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*';
        this.fileInput.style.display = 'none';
        this.fileInput.addEventListener('change', this.handleFileSelect);
        uploadSection.appendChild(this.fileInput);
        body.appendChild(uploadSection);

        const urlSection = this.createElement('div', 'url-section', styles.urlSection);
        const urlLabel = this.createElement('label', 'url-label', styles.urlLabel);
        urlLabel.textContent = this.options.i18n.leftPanel?.imageDesc || '或输入图片URL:';
        urlSection.appendChild(urlLabel);
        const urlInput = this.createElement('input', 'url-input', styles.urlInput);
        urlInput.type = 'text';
        urlInput.placeholder = this.options.i18n.leftPanel?.imageDesc || '输入图片URL';
        urlInput.value = this.imageUrl;
        urlInput.addEventListener('input', this.handleUrlChange);
        urlSection.appendChild(urlInput);
        body.appendChild(urlSection);

        const previewSection = this.createElement('div', 'preview-section', styles.previewSection);
        const previewLabel = this.createElement('label', 'preview-label', styles.previewLabel);
        previewLabel.textContent = this.options.i18n.leftPanel?.selectedTool || '预览:';
        previewSection.appendChild(previewLabel);
        const previewImg = this.createElement('img', 'image-preview', styles.imagePreview);
        previewImg.alt = '预览';
        if (this.imageUrl) previewImg.src = this.imageUrl;
        else previewImg.style.display = 'none';
        previewSection.appendChild(previewImg);
        body.appendChild(previewSection);

        const actions = this.createElement('div', 'modal-actions', styles.modalActions);
        const cancelBtn = this.createElement('button', 'cancel-btn', styles.cancelButton);
        cancelBtn.textContent = this.options.i18n.systemSettings?.cancel || '取消';
        cancelBtn.addEventListener('click', () => this.options.onClose());
        actions.appendChild(cancelBtn);

        const confirmBtn = this.createElement('button', 'confirm-btn', this.imageUrl ? styles.confirmButton : styles.confirmButtonDisabled);
        confirmBtn.textContent = this.options.i18n.systemSettings?.confirm || '确定';
        confirmBtn.disabled = !this.imageUrl;
        confirmBtn.addEventListener('click', this.handleConfirm);
        actions.appendChild(confirmBtn);
        body.appendChild(actions);

        const hintText = this.createElement('div', 'hint-text', styles.hintText);
        hintText.textContent = `${this.options.i18n.tooltips?.ctrlEnterToConfirm || 'Ctrl+Enter: 确认'}, ${this.options.i18n.tooltips?.escToCancel || 'Esc: 取消'}, ${this.options.i18n.modal?.dragToMove || '拖动标题栏移动'}`;
        body.appendChild(hintText);

        this.modalRef.appendChild(body);
        this.container.appendChild(this.modalRef);
        this.container.addEventListener('click', this.handleOverlayClick as EventListener);
        document.body.appendChild(this.container);
    }

    public update(options: Partial<ImageUploadModalOptions>): void {
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
        this.fileInput = null;
        this.imageUrl = '';
    }
}