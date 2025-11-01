
import React from 'react';
import { Drawing, Point } from './types';
import { ThemeConfig } from '../CandleViewTheme';

interface DrawingOperationToolbarProps {
  position: Point;
  selectedDrawing: Drawing | null;
  theme: ThemeConfig;
  onClose: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onChangeColor: (color: string) => void;
  onEditText?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDragStart: (point: Point) => void;
  isDragging: boolean;
  getToolName: (toolId: string) => string;
  onPanelChange?: (panel: 'color' | 'style' | null) => void;
}

interface DrawingOperationToolbarState {
  activePanel: 'color' | 'style' | null;
  onPanelChange?: (panel: 'color' | 'style' | null) => void;
}

export class DrawingOperationToolbar extends React.Component<DrawingOperationToolbarProps, DrawingOperationToolbarState> {
  private toolbarRef = React.createRef<HTMLDivElement>();
  private panelRef = React.createRef<HTMLDivElement>();

  constructor(props: DrawingOperationToolbarProps) {
    super(props);
    this.state = {
      activePanel: null
    };
  }



  private stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
  };



  private handleDragStart = (e: React.MouseEvent) => {

    if (e.target === this.toolbarRef.current) {
      this.props.onDragStart({ x: e.clientX, y: e.clientY });
    }
    this.stopPropagation(e);
  };



  private handleButtonClick = (panel: 'color' | 'style', e: React.MouseEvent) => {
    this.stopPropagation(e);
    this.setState({ activePanel: panel });


    if (this.props.onPanelChange) {
      this.props.onPanelChange(panel);
    }
  };


  private handleClosePanel = (e?: React.MouseEvent) => {
    if (e) {
      this.stopPropagation(e);
    }
    this.setState({ activePanel: null });


    if (this.props.onPanelChange) {
      this.props.onPanelChange(null);
    }
  };



  private handleColorChange = (color: string) => {
    this.props.onChangeColor(color);
    this.setState({ activePanel: null });
  };


  renderMainToolbar() {
    const { selectedDrawing, theme, onClose, onDelete, onUndo, onRedo, canUndo, canRedo, onEditText, getToolName } = this.props;

    return (
      <div
        ref={this.toolbarRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: theme.toolbar.background,
          color: theme.layout.textColor,
          border: `1px solid ${theme.toolbar.border}`,
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: this.props.isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
        }}
        onMouseDown={this.handleDragStart}
        onClick={this.stopPropagation}
        onDoubleClick={this.stopPropagation}
      >

        <div style={{
          fontSize: '12px',
          fontWeight: 'bold',
          minWidth: '60px',
          marginRight: '8px',
          userSelect: 'none',
        }}>
          {selectedDrawing ? getToolName(selectedDrawing.type) : '操作'}
        </div>


        <button
          onClick={(e) => {
            this.handleButtonClick('color', e);
          }}
          style={{
            background: theme.toolbar.button.background,
            color: theme.toolbar.button.color,
            border: `1px solid ${theme.toolbar.border}`,
            borderRadius: '4px',
            padding: '6px 10px',
            fontSize: '12px',
            cursor: 'pointer',
            minWidth: '50px',
            userSelect: 'none',
          }}
          title="修改颜色"
        >
          颜色
        </button>

        {selectedDrawing?.type === 'text' && onEditText && (
          <button
            onClick={(e) => {
              this.stopPropagation(e);
              onEditText();
            }}
            style={{
              background: theme.toolbar.button.background,
              color: theme.toolbar.button.color,
              border: `1px solid ${theme.toolbar.border}`,
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              minWidth: '50px',
              userSelect: 'none',
            }}
            title="编辑文字"
          >
            编辑
          </button>
        )}

        <button
          onClick={(e) => {
            this.stopPropagation(e);
            onDelete();
          }}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 10px',
            fontSize: '12px',
            cursor: 'pointer',
            minWidth: '50px',
            userSelect: 'none',
          }}
          title="删除图形"
        >
          删除
        </button>

        <button
          onClick={(e) => {
            this.stopPropagation(e);
            onUndo();
          }}
          disabled={!canUndo}
          style={{
            background: canUndo ? theme.toolbar.button.background : '#95a5a6',
            color: canUndo ? theme.toolbar.button.color : '#E8EAED',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 10px',
            fontSize: '12px',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            minWidth: '50px',
            userSelect: 'none',
          }}
          title="撤销"
        >
          撤销
        </button>


        <button
          onClick={(e) => {
            this.stopPropagation(e);
            onRedo();
          }}
          disabled={!canRedo}
          style={{
            background: canRedo ? theme.toolbar.button.background : '#95a5a6',
            color: canRedo ? theme.toolbar.button.color : '#E8EAED',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 10px',
            fontSize: '12px',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            minWidth: '50px',
            userSelect: 'none',
          }}
          title="重做"
        >
          重做
        </button>



        <button
          onClick={(e) => {
            this.stopPropagation(e);
            onClose();
          }}
          style={{
            background: 'transparent',
            color: theme.layout.textColor,
            border: 'none',
            borderRadius: '4px',
            padding: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}
          title="关闭"
        >
          ✕
        </button>
      </div>
    );
  }

  renderColorPanel() {
    const { selectedDrawing, theme } = this.props;

    return (
      <div
        ref={this.panelRef}
        style={{
          background: theme.toolbar.background,
          color: theme.layout.textColor,
          border: `1px solid ${theme.toolbar.border}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '200px',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
        }}
        onClick={this.stopPropagation}
        onMouseDown={this.stopPropagation}
        onDoubleClick={this.stopPropagation}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <strong style={{ fontSize: '14px', userSelect: 'none' }}>选择颜色</strong>
          <button
            onClick={(e) => {
              this.stopPropagation(e);
              this.handleClosePanel();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '16px',
              userSelect: 'none',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', minWidth: '40px', userSelect: 'none' }}>颜色:</label>
            <input
              type="color"
              value={selectedDrawing?.color || '#000000'}
              onChange={(e) => this.handleColorChange(e.target.value)}
              onClick={this.stopPropagation}
              onMouseDown={this.stopPropagation}
              style={{
                width: '40px',
                height: '30px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
          </div>


          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF', '#44FFFF', '#000000', '#FFFFFF'].map(color => (
              <button
                key={color}
                onClick={(e) => {
                  this.stopPropagation(e);
                  this.handleColorChange(color);
                }}
                style={{
                  width: '20px',
                  height: '20px',
                  background: color,
                  border: `1px solid ${theme.toolbar.border}`,
                  borderRadius: '3px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { position, selectedDrawing } = this.props;
    const { activePanel } = this.state;

    if (!selectedDrawing) return null;

    return (
      <div
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
        onClick={this.stopPropagation}
        onMouseDown={this.stopPropagation}
        onDoubleClick={this.stopPropagation}
      >
        {this.renderMainToolbar()}

        {activePanel === 'color' && this.renderColorPanel()}
      </div>
    );
  }
}