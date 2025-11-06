
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setText(initialText);
    setColor(initialColor);
    setFontSize(initialFontSize);
    setIsBold(initialIsBold);
    setIsItalic(initialIsItalic);
  }, [initialText, initialColor, initialFontSize, initialIsBold, initialIsItalic]);

  if (!isOpen) return null;

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

  return (
    <div
      style={{
        position: 'absolute',
        left: `${Math.max(10, Math.min(position.x, window.innerWidth - 320))}px`,
        top: `${Math.max(10, Math.min(position.y, window.innerHeight - 300))}px`,
        background: theme.toolbar.background,
        border: `1px solid ${theme.toolbar.border}`,
        borderRadius: '8px',
        padding: '16px',
        width: '300px', 
        maxWidth: '90vw', 
        zIndex: 1000,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{
        marginBottom: '12px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: theme.layout.textColor,
      }}>
        文字编辑
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyPress}
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
              onClick={() => setIsBold(!isBold)}
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
              onClick={() => setIsItalic(!isItalic)}
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
          onClick={onCancel}
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
          onClick={handleSave}
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
        提示: Ctrl+Enter 保存, Esc 取消
      </div>
    </div>
  );
};