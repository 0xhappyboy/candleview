import React, { useState, useRef, useEffect, useCallback } from 'react';

export const ImageUploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (imageUrl: string) => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    const [imageUrl, setImageUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!isOpen) {
            setImageUrl('');
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
        alert(123)
        if (imageUrl) {
            onConfirm(imageUrl);
        }
    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    const handleContentClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    const styles = {
        modalOverlay: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        },
        modalContent: {
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '600px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        modalTitle: {
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
        },
        uploadSection: {
            margin: '15px 0',
        },
        uploadButton: {
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
        },
        urlSection: {
            margin: '15px 0',
        },
        urlLabel: {
            display: 'block',
            marginBottom: '5px',
            fontSize: '14px',
            color: '#555',
        },
        urlInput: {
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box' as const,
        },
        previewSection: {
            margin: '15px 0',
        },
        previewLabel: {
            display: 'block',
            marginBottom: '5px',
            fontSize: '14px',
            color: '#555',
        },
        imagePreview: {
            maxWidth: '100%',
            maxHeight: '200px',
            marginTop: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
        },
        modalActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '20px',
        },
        cancelButton: {
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
        },
        confirmButton: {
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
        },
        confirmButtonDisabled: {
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'not-allowed',
            fontSize: '14px',
            opacity: 0.6,
        },
    };

    if (!isOpen) return null;

    return (
        <div
            style={styles.modalOverlay}
            onClick={handleOverlayClick}
        >
            <div
                ref={modalContentRef}
                style={styles.modalContent}
                onClick={handleContentClick}
            >
                <h3 style={styles.modalTitle}>上传图片</h3>

                <div style={styles.uploadSection}>
                    <button
                        type="button"
                        onClick={handleFileButtonClick}
                        style={styles.uploadButton}
                    >
                        选择文件
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>

                <div style={styles.urlSection}>
                    <label style={styles.urlLabel}>或输入图片URL:</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={handleUrlChange}
                        placeholder=""
                        style={styles.urlInput}
                    />
                </div>

                {imageUrl && (
                    <div style={styles.previewSection}>
                        <label style={styles.previewLabel}>预览:</label>
                        <img src={imageUrl} alt="预览" style={styles.imagePreview} />
                    </div>
                )}

                <div style={styles.modalActions}>
                    <button
                        onClick={onClose}
                        style={styles.cancelButton}
                        type="button"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!imageUrl}
                        style={!imageUrl ? styles.confirmButtonDisabled : styles.confirmButton}
                        type="button"
                    >
                        确定
                    </button>
                </div>
            </div>
        </div>
    );
};