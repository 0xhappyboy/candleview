import React from 'react';
import { Drawing, FloatingPanelPosition, Point } from './types';
import { ThemeConfig } from '../CandleViewTheme';

interface FloatingPanelProps {
  position: FloatingPanelPosition;
  selectedDrawing: Drawing;
  theme: ThemeConfig;
  onClose: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onChangeColor: (color: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onDragStart: (point: Point) => void;
  isDragging: boolean;
  getToolName: (toolId: string) => string;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  position,
  selectedDrawing,
  theme,
  onClose,
  onDelete,
  onUndo,
  onRedo,
  onChangeColor,
  canUndo,
  canRedo,
  onDragStart,
  isDragging,
  getToolName
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: theme.toolbar.background,
        color: theme.layout.textColor,
        border: `1px solid ${theme.toolbar.border}`,
        borderRadius: '6px',
        padding: '12px',
        minWidth: '200px',
        zIndex: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onDragStart({ x: e.clientX, y: e.clientY });
        }
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        paddingBottom: '8px',
        borderBottom: `1px solid ${theme.toolbar.border}`,
      }}>
        <strong>图形操作</strong>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div>类型: {getToolName(selectedDrawing.type)}</div>
        <div>点数: {selectedDrawing.points.length}</div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '12px',
      }}>
        <button
          onClick={onDelete}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          删除
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            background: canUndo ? theme.toolbar.button.background : '#95a5a6',
            color: canUndo ? theme.toolbar.button.color : '#E8EAED',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            fontSize: '12px',
          }}
        >
          撤销
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            background: canRedo ? theme.toolbar.button.background : '#95a5a6',
            color: canRedo ? theme.toolbar.button.color : '#E8EAED',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            fontSize: '12px',
          }}
        >
          重做
        </button>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={{ fontSize: '12px', marginRight: '8px' }}>颜色:</label>
        <input
          type="color"
          value={selectedDrawing.color}
          onChange={(e) => onChangeColor(e.target.value)}
          style={{
            width: '30px',
            height: '20px',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
};