import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ThemeConfig } from '../CandleViewTheme';

interface TextMarkEditorModalProps {
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
}

export const TextMarkEditorModal: React.FC<TextMarkEditorModalProps> = ({
  isOpen,
  position,
  theme,
  initialText,
  initialColor,
  initialFontSize,
  initialIsBold,
  initialIsItalic,
  onSave,
  onCancel
}) => {
  const [text, setText] = useState(initialText);
  const [color, setColor] = useState(initialColor);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [isBold, setIsBold] = useState(initialIsBold);
  const [isItalic, setIsItalic] = useState(initialIsItalic);
  const [modalPosition, setModalPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(initialText);
    setColor(initialColor);
    setFontSize(initialFontSize);
    setIsBold(initialIsBold);
    setIsItalic(initialIsItalic);
    setModalPosition(position);
  }, [initialText, initialColor, initialFontSize, initialIsBold, initialIsItalic, position]);

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
        const maxX = window.innerWidth - 320;
        const maxY = window.innerHeight - 300;
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
      onCancel();
    }
  };

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim(), color, fontSize, isBold, isItalic);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'transparent'
      }}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        style={{
          position: 'absolute',
          left: `${modalPosition.x}px`,
          top: `${modalPosition.y}px`,
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
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
      >
        <div
          ref={headerRef}
          style={{
            padding: '16px 16px 12px 16px',
            borderBottom: `1px solid ${theme.toolbar.border}`,
            cursor: 'grab',
            userSelect: 'none',
          }}
          onMouseDown={(e) => {
            if (e.target === headerRef.current) {
              e.preventDefault();
            }
          }}
        >
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: theme.layout.textColor,
          }}>
            文字编辑
          </div>
        </div>
        <div style={{ padding: '16px' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            onClick={(e) => e.stopPropagation()}
            placeholder="输入文字内容..."
            autoFocus
            style={{
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
            }}
          />

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: theme.layout.textColor, minWidth: '60px' }}>
                颜色:
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '40px',
                  height: '30px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: theme.layout.textColor, minWidth: '60px' }}>
                字体大小:
              </label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: theme.toolbar.background,
                  color: theme.layout.textColor,
                  border: `1px solid ${theme.toolbar.border}`,
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                }}
              >
                <option value="12">12px</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
                <option value="20">20px</option>
                <option value="24">24px</option>
                <option value="28">28px</option>
                <option value="32">32px</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ fontSize: '12px', color: theme.layout.textColor, minWidth: '60px' }}>
                样式:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBold(!isBold);
                  }}
                  style={{
                    background: isBold ? theme.toolbar.button.active : theme.toolbar.background,
                    color: isBold ? theme.toolbar.button.activeTextColor : theme.layout.textColor,
                    border: `1px solid ${theme.toolbar.border}`,
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    minWidth: '40px',
                  }}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsItalic(!isItalic);
                  }}
                  style={{
                    background: isItalic ? theme.toolbar.button.active : theme.toolbar.background,
                    color: isItalic ? theme.toolbar.button.activeTextColor : theme.layout.textColor,
                    border: `1px solid ${theme.toolbar.border}`,
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    cursor: 'pointer',
                    minWidth: '40px',
                  }}
                >
                  I
                </button>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              style={{
                background: 'transparent',
                color: theme.layout.textColor,
                border: `1px solid ${theme.toolbar.border}`,
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={!text.trim()}
              style={{
                background: text.trim() ? theme.toolbar.button.active : '#95a5a6',
                color: text.trim() ? theme.toolbar.button.activeTextColor : '#E8EAED',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: text.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              确定
            </button>
          </div>
          <div style={{
            fontSize: '10px',
            color: theme.layout.textColor + '80',
            marginTop: '8px',
            textAlign: 'center',
          }}>
            提示: Ctrl+Enter 保存, Esc 取消, 拖动标题栏移动
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};