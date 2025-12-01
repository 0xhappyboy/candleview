import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ThemeConfig } from '../../Theme';
import { I18n } from '../../I18n';

export const ImageUploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (imageUrl: string) => void;
    theme: ThemeConfig;
    i18n: I18n;
}> = ({ isOpen, onClose, onConfirm, theme, i18n }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [modalPosition, setModalPosition] = useState({ x: window.innerWidth / 2 - 175, y: window.innerHeight / 2 - 120 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setImageUrl('');
            setModalPosition({
                x: window.innerWidth / 2 - 175,
                y: window.innerHeight / 2 - 120
            });
        }
    }, [isOpen]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
        }
    };

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setImageUrl(event.target.value);
    };

    const handleConfirm = () => {
        if (imageUrl) {
            onConfirm(imageUrl);
        }
    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === headerRef.current || headerRef.current?.contains(e.target as Node)) {
            setIsDragging(true);
            const rect = modalRef.current!.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
            e.preventDefault();
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                const maxX = window.innerWidth - 350;
                const maxY = window.innerHeight - 240;
                setModalPosition({
                    x: Math.max(10, Math.min(newX, maxX)),
                    y: Math.max(10, Math.min(newY, maxY))
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleConfirm();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const modalContentStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${modalPosition.x}px`,
        top: `${modalPosition.y}px`,
        background: theme.toolbar.background,
        border: `1px solid ${theme.toolbar.border}`,
        borderRadius: '8px',
        padding: '0',
        width: '350px',
        maxWidth: '90vw',
        zIndex: 10000,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: isDragging ? 'none' : 'auto',
    };

    const modalHeaderStyle: React.CSSProperties = {
        padding: '12px 16px',
        borderBottom: `1px solid ${theme.toolbar.border}`,
        cursor: 'grab',
        userSelect: 'none',
    };

    const modalTitleStyle: React.CSSProperties = {
        fontSize: '13px',
        fontWeight: 'bold',
        color: theme.layout.textColor,
        margin: 0,
    };

    const modalBodyStyle: React.CSSProperties = {
        padding: '16px',
    };

    const uploadSectionStyle: React.CSSProperties = {
        marginBottom: '12px',
    };

    const uploadButtonStyle: React.CSSProperties = {
        background: theme.toolbar.button.active,
        color: theme.toolbar.button.activeTextColor,
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        width: '100%',
    };

    const urlSectionStyle: React.CSSProperties = {
        marginBottom: '12px',
    };

    const urlLabelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '4px',
        fontSize: '12px',
        color: theme.layout.textColor,
        fontWeight: '500',
    };

    const urlInputStyle: React.CSSProperties = {
        width: '100%',
        padding: '6px 8px',
        background: theme.toolbar.background,
        color: theme.layout.textColor,
        border: `1px solid ${theme.toolbar.border}`,
        borderRadius: '4px',
        fontSize: '12px',
        boxSizing: 'border-box',
    };

    const previewSectionStyle: React.CSSProperties = {
        marginBottom: '12px',
    };

    const previewLabelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '4px',
        fontSize: '12px',
        color: theme.layout.textColor,
        fontWeight: '500',
    };

    const imagePreviewStyle: React.CSSProperties = {
        maxWidth: '100%',
        maxHeight: '120px',
        border: `1px solid ${theme.toolbar.border}`,
        borderRadius: '4px',
    };

    const modalActionsStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        marginTop: '16px',
    };

    const cancelButtonStyle: React.CSSProperties = {
        background: 'transparent',
        color: theme.layout.textColor,
        border: `1px solid ${theme.toolbar.border}`,
        borderRadius: '4px',
        padding: '6px 12px',
        fontSize: '12px',
        cursor: 'pointer',
        minWidth: '60px',
    };

    const confirmButtonStyle: React.CSSProperties = {
        background: theme.toolbar.button.active,
        color: theme.toolbar.button.activeTextColor,
        border: 'none',
        borderRadius: '4px',
        padding: '6px 12px',
        fontSize: '12px',
        cursor: 'pointer',
        minWidth: '60px',
    };

    const confirmButtonDisabledStyle: React.CSSProperties = {
        background: '#6c757d',
        color: '#E8EAED',
        border: 'none',
        borderRadius: '4px',
        padding: '6px 12px',
        fontSize: '12px',
        cursor: 'not-allowed',
        opacity: 0.6,
        minWidth: '60px',
    };

    const hintTextStyle: React.CSSProperties = {
        fontSize: '10px',
        color: `${theme.layout.textColor}80`,
        marginTop: '12px',
        textAlign: 'center',
        lineHeight: '1.3',
    };

    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'transparent',
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            style={modalOverlayStyle}
            onClick={handleOverlayClick}
        >
            <div
                ref={modalRef}
                style={modalContentStyle}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={handleMouseDown}
                onKeyDown={handleKeyPress}
            >
                <div
                    ref={headerRef}
                    style={modalHeaderStyle}
                    onMouseDown={(e) => {
                        if (e.target === headerRef.current) {
                            e.preventDefault();
                        }
                    }}
                >
                    <div style={modalTitleStyle}>
                        {i18n.leftPanel?.image || '图片上传'}
                    </div>
                </div>
                <div style={modalBodyStyle}>
                    <div style={uploadSectionStyle}>
                        <button
                            type="button"
                            onClick={handleFileButtonClick}
                            style={uploadButtonStyle}
                        >
                            {i18n.leftPanel?.imageDesc || '选择文件'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div style={urlSectionStyle}>
                        <label style={urlLabelStyle}>
                            {i18n.leftPanel?.imageDesc || '或输入图片URL:'}
                        </label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={handleUrlChange}
                            placeholder={i18n.leftPanel?.imageDesc || '输入图片URL'}
                            style={urlInputStyle}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {imageUrl && (
                        <div style={previewSectionStyle}>
                            <label style={previewLabelStyle}>
                                {i18n.leftPanel?.selectedTool || '预览:'}
                            </label>
                            <img src={imageUrl} alt="预览" style={imagePreviewStyle} />
                        </div>
                    )}
                    <div style={modalActionsStyle}>
                        <button
                            onClick={onClose}
                            style={cancelButtonStyle}
                            type="button"
                        >
                            {i18n.systemSettings?.cancel || '取消'}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!imageUrl}
                            style={!imageUrl ? confirmButtonDisabledStyle : confirmButtonStyle}
                            type="button"
                        >
                            {i18n.systemSettings?.confirm || '确定'}
                        </button>
                    </div>
                    <div style={hintTextStyle}>
                        {i18n.tooltips?.ctrlEnterToConfirm || 'Ctrl+Enter: 确认'}, {i18n.tooltips?.escToCancel || 'Esc: 取消'}, {i18n.modal?.dragToMove || '拖动标题栏移动'}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};