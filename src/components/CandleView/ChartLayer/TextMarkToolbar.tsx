import React from 'react';
import { Drawing, Point } from '../types';
import { ThemeConfig } from '../CandleViewTheme';

interface TextMarkToolBarProps {
  position: Point;
  selectedDrawing: Drawing | null;
  theme: ThemeConfig;
  onClose: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onChangeColor: (color: string) => void;
  onChangeStyle: (style: { isBold?: boolean; isItalic?: boolean }) => void;
  onChangeSize: (size: string) => void;
  onEditText?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDragStart: (point: Point) => void;
  isDragging: boolean;
  getToolName: (toolId: string) => string;
  onPanelChange?: (panel: 'color' | 'style' | null) => void;
}

interface TextMarkToolBarState {
  activePanel: 'color' | 'style' | 'fontSize' | null;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
}

export class TextMarkToolBar extends React.Component<TextMarkToolBarProps, TextMarkToolBarState> {
  private toolbarRef = React.createRef<HTMLDivElement>();

  constructor(props: TextMarkToolBarProps) {
    super(props);
    this.state = {
      activePanel: null,
      fontSize: 14,
      isBold: false,
      isItalic: false
    };
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleDocumentClick);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleDocumentClick);
  }

  private handleDocumentClick = (e: MouseEvent) => {
    if (this.toolbarRef.current && this.toolbarRef.current.contains(e.target as Node)) {
      return;
    }
    if (this.state.activePanel) {
      this.handleClosePanel();
    }
  };

  private stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  private handleDragStart = (e: React.MouseEvent) => {
    this.stopPropagation(e);
    this.props.onDragStart({ x: e.clientX, y: e.clientY });
  };

  private handleButtonClick = (panel: 'color' | 'style' | 'fontSize', e: React.MouseEvent) => {
    this.stopPropagation(e);
    this.setState(prevState => ({
      activePanel: prevState.activePanel === panel ? null : panel
    }));
  };

  private handleClosePanel = () => {
    this.setState({ activePanel: null });
  };

  private handleColorChange = (color: string) => {
    this.props.onChangeColor(color);
  };

  private handleFontSizeChange = (fontSize: number) => {
    this.setState({ fontSize });
    this.props.onChangeSize(fontSize.toString());
  };

  private toggleBold = (e: React.MouseEvent) => {
    this.stopPropagation(e);
    const newIsBold = !this.state.isBold;
    this.setState(prevState => ({ isBold: !prevState.isBold }));
    this.props.onChangeStyle({ isBold: newIsBold });
  };

  private toggleItalic = (e: React.MouseEvent) => {
    this.stopPropagation(e);
    const newIsItalic = !this.state.isItalic;
    this.setState({ isItalic: newIsItalic });
    this.props.onChangeStyle({ isItalic: newIsItalic });
  };

  private renderDragHandle() {
    const { theme } = this.props;
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '6px 4px',
          cursor: this.props.isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        onMouseDown={this.handleDragStart}
        title="拖动工具栏"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.toolbar.button.hover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        {[...Array(3)].map((_, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', gap: '2px' }}>
            {[...Array(2)].map((_, dotIndex) => (
              <div
                key={dotIndex}
                style={{
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  background: theme.layout.textColor,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  private renderIconButton(icon: string, onClick: (e: React.MouseEvent) => void, title: string, isActive?: boolean) {
    const { theme } = this.props;
    return (
      <button
        onClick={onClick}
        style={{
          background: isActive ? theme.toolbar.button.active : theme.toolbar.button.background,
          color: isActive ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color,
          border: `1px solid ${theme.toolbar.border}`,
          borderRadius: '4px',
          padding: '6px',
          fontSize: '14px',
          cursor: 'pointer',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          transition: 'all 0.2s',
        }}
        title={title}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.toolbar.button.hover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isActive ? theme.toolbar.button.active : theme.toolbar.button.background;
        }}
      >
        {icon}
      </button>
    );
  }

  private renderColorPanel() {
    const { selectedDrawing, theme } = this.props;
    return (
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          marginTop: '8px',
          background: theme.toolbar.background,
          color: theme.layout.textColor,
          border: `1px solid ${theme.toolbar.border}`,
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          minWidth: '280px',
          zIndex: 1001,
          userSelect: 'none',
          pointerEvents: 'auto',
        }}
        onClick={this.stopPropagation}
        onMouseDown={this.stopPropagation}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <strong style={{ fontSize: '14px' }}>选择颜色</strong>
          <button
            onClick={this.handleClosePanel}
            onMouseDown={this.stopPropagation}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '12px', minWidth: '40px' }}>拾色器:</span>
          <input
            type="color"
            value={selectedDrawing?.color || '#000000'}
            onChange={(e) => {
              this.handleColorChange(e.target.value);
            }}
            onClick={(e) => {
              this.stopPropagation(e);
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              this.stopPropagation(e);
              e.stopPropagation();
            }}
            onInput={(e) => {
              e.stopPropagation();
            }}
            style={{
              width: '50px',
              height: '40px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: '4px',
          marginBottom: '12px'
        }}>
          {[
            '#FF0000', '#FF3333', '#FF6666', '#FF9999', '#FFCCCC',
            '#CC0000', '#CC3333', '#CC6666', '#CC9999', '#CCCCCC',
            '#00FF00', '#33FF33', '#66FF66', '#99FF99', '#CCFFCC',
            '#00CC00', '#33CC33', '#66CC66', '#99CC99', '#CCCCCC',
            '#0000FF', '#3333FF', '#6666FF', '#9999FF', '#CCCCFF',
            '#0000CC', '#3333CC', '#6666CC', '#9999CC', '#CCCCFF',
            '#FFFF00', '#FFFF33', '#FFFF66', '#FFFF99', '#FFFFCC',
            '#FF9900', '#FFAA33', '#FFBB66', '#FFCC99', '#FFDDCC',
            '#FF00FF', '#FF33FF', '#FF66FF', '#FF99FF', '#FFCCFF',
            '#9900FF', '#AA33FF', '#BB66FF', '#CC99FF', '#DDCCFF',
            '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
            '#111111', '#444444', '#777777', '#AAAAAA', '#DDDDDD',
            '#8B4513', '#A0522D', '#CD853F', '#D2691E', '#F4A460',
            '#D2B48C', '#DEB887', '#F5DEB3', '#FFE4C4', '#FFEBCD',
            '#FF4500', '#FF6347', '#FF7F50', '#FF8C00', '#FFA500',
            '#FFD700', '#ADFF2F', '#7CFC00', '#32CD32', '#00FA9A',
            '#00CED1', '#1E90FF', '#4169E1', '#6A5ACD', '#8A2BE2',
            '#9370DB', '#BA55D3', '#DA70D6', '#EE82EE', '#FFFFFF'
          ].map(color => (
            <button
              key={color}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                this.handleColorChange(color);
                this.handleClosePanel();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{
                width: '20px',
                height: '20px',
                background: color,
                border: `1px solid ${color === '#FFFFFF' || color === '#FFFFCC' ||
                  color === '#FFDDCC' || color === '#FFCCFF' ||
                  color === '#DDCCFF' || color === '#FFFF99' ?
                  theme.toolbar.border : 'transparent'
                  }`,
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
              title={color}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.2)';
                e.currentTarget.style.zIndex = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = '0';
              }}
            />
          ))}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '8px',
          padding: '8px',
          background: theme.toolbar.button.background,
          borderRadius: '4px',
        }}>
          <span style={{ fontSize: '12px' }}>当前颜色:</span>
          <div
            style={{
              width: '24px',
              height: '24px',
              background: selectedDrawing?.color || '#000000',
              border: `1px solid ${theme.toolbar.border}`,
              borderRadius: '3px',
            }}
          />
          <span style={{ fontSize: '12px' }}>{selectedDrawing?.color || '#000000'}</span>
        </div>
      </div>
    );
  }

  private renderFontSizePanel() {
    const { theme } = this.props;
    const { fontSize } = this.state;
    const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

    return (
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          marginTop: '8px',
          background: theme.toolbar.background,
          color: theme.layout.textColor,
          border: `1px solid ${theme.toolbar.border}`,
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          minWidth: '180px',
          zIndex: 1001,
          userSelect: 'none',
        }}
        onClick={this.stopPropagation}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <strong style={{ fontSize: '14px' }}>字体大小</strong>
          <button
            onClick={this.handleClosePanel}
            onMouseDown={this.stopPropagation}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <input
            type="range"
            min="8"
            max="48"
            value={fontSize}
            onChange={(e) => this.handleFontSizeChange(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: theme.toolbar.button.background,
              outline: 'none',
              cursor: 'pointer',
            }}
          />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
          }}>
            <span>大小:</span>
            <span>{fontSize}px</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px',
            marginTop: '8px',
          }}>
            {fontSizes.map(size => (
              <button
                key={size}
                onClick={() => {
                  this.handleFontSizeChange(size);
                  this.handleClosePanel(); // 关闭面板
                }}
                style={{
                  padding: '4px 6px',
                  background: fontSize === size ? theme.toolbar.button.active : theme.toolbar.button.background,
                  color: fontSize === size ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color,
                  border: `1px solid ${theme.toolbar.border}`,
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  renderMainToolbar() {
    const { selectedDrawing, theme, onClose, onDelete, onUndo, onRedo, canUndo, canRedo, onEditText } = this.props;
    const { activePanel, isBold, isItalic } = this.state;

    return (
      <div
        ref={this.toolbarRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: theme.toolbar.background,
          color: theme.layout.textColor,
          border: `1px solid ${theme.toolbar.border}`,
          borderRadius: '8px',
          padding: '6px 8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: this.props.isDragging ? 'grabbing' : 'default',
          userSelect: 'none',
          position: 'relative', pointerEvents: 'auto',
        }}
        onClick={this.stopPropagation}
      >
        {this.renderDragHandle()}
        <div style={{
          width: '1px',
          height: '24px',
          background: theme.toolbar.border,
          margin: '0 4px',
        }} />
        <div style={{ position: 'relative' }}>
          {this.renderIconButton(
            '🎨',
            (e) => this.handleButtonClick('color', e),
            '颜色',
            activePanel === 'color'
          )}
          {activePanel === 'color' && this.renderColorPanel()}
        </div>
        <div style={{ position: 'relative' }}>
          {this.renderIconButton(
            'A',
            (e) => this.handleButtonClick('fontSize', e),
            '字体大小',
            activePanel === 'fontSize'
          )}
          {activePanel === 'fontSize' && this.renderFontSizePanel()}
        </div>
        {this.renderIconButton(
          'B',
          this.toggleBold,
          '粗体',
          isBold
        )}
        {this.renderIconButton(
          'I',
          this.toggleItalic,
          '斜体',
          isItalic
        )}
        {this.renderIconButton(
          '🗑️',
          (e) => { this.stopPropagation(e); onDelete(); },
          '删除'
        )}
        {this.renderIconButton(
          '✕',
          (e) => { this.stopPropagation(e); onClose(); },
          '关闭'
        )}
      </div>
    );
  }

  render() {
    const { position, selectedDrawing } = this.props;

    if (!selectedDrawing) return null;

    return (
      <div
        className='text-mark-operation-toolbar'
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000,
          pointerEvents: 'auto',
        }}
        onClick={this.stopPropagation}
        onMouseDown={this.stopPropagation}
      >
        {this.renderMainToolbar()}
      </div>
    );
  }
}