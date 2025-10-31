import React from 'react';
import { ThemeConfig } from '../CandleViewTheme';

interface DrawingToolbarProps {
  activeTool: string | null;
  isDrawing: boolean;
  theme: ThemeConfig;
  onClearAll: () => void;
  onCloseDrawing: () => void;
  getToolName: (toolId: string) => string;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  isDrawing,
  theme,
  onClearAll,
  onCloseDrawing,
  getToolName
}) => {
  if (!activeTool) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: theme.toolbar.background,
      color: theme.layout.textColor,
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 10,
      border: `1px solid ${theme.toolbar.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span>
        绘图模式: {getToolName(activeTool)}
        {isDrawing && ' - 绘制中...'}
      </span>
      <button
        onClick={onClearAll}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '3px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
        title="清除所有绘图"
      >
        清除
      </button>
      <button
        onClick={onCloseDrawing}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '12px',
          padding: '2px 6px',
          borderRadius: '3px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
        title="退出绘图模式"
      >
        ✕
      </button>
    </div>
  );
};