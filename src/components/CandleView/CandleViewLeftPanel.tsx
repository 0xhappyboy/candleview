import React from 'react';
import { ThemeConfig } from './CandleViewTheme';
import {
  DrawingIcon,
  FibonacciIcon,
  SettingsIcon,
  TradeIcon,
  BuyIcon,
  SellIcon,
  OrderIcon,
  LineToolIcon,
  HorizontalLineIcon,
  VerticalLineIcon,
  RectangleIcon,
  TextIcon
} from './CandleViewIcons';

interface CandleViewLeftPanelProps {
  currentTheme: ThemeConfig;
  activeTool: string | null;
  onToolSelect: (tool: string) => void;
  onTradeClick: () => void;
  showToolbar?: boolean;
}

interface CandleViewLeftPanelState {
  isDrawingModalOpen: boolean;
}

class CandleViewLeftPanel extends React.Component<CandleViewLeftPanelProps, CandleViewLeftPanelState> {
  private drawingModalRef = React.createRef<HTMLDivElement>();

  constructor(props: CandleViewLeftPanelProps) {
    super(props);
    this.state = {
      isDrawingModalOpen: false
    };
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside, true);
  }


  private drawingTools = [
    {
      title: "趋势工具",
      tools: [
        { id: 'line', name: '趋势线', description: '绘制趋势线', icon: LineToolIcon },
        { id: 'horizontal-line', name: '水平线', description: '绘制水平线', icon: HorizontalLineIcon },
        { id: 'vertical-line', name: '垂直线', description: '绘制垂直线', icon: VerticalLineIcon },
      ]
    },
    {
      title: "图形工具",
      tools: [
        { id: 'rectangle', name: '矩形', description: '绘制矩形区域', icon: RectangleIcon },
        { id: 'fibonacci', name: '斐波那契', description: '斐波那契回撤', icon: FibonacciIcon },
      ]
    },
    {
      title: "标注工具",
      tools: [
        { id: 'text', name: '文本', description: '添加文本标注', icon: TextIcon },
      ]
    }
  ];

  private handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (this.state.isDrawingModalOpen &&
      this.drawingModalRef.current &&
      !this.drawingModalRef.current.contains(target) &&
      !target.closest('.drawing-button')) {
      this.setState({ isDrawingModalOpen: false });
    }
  };


  private renderDrawingModal = () => {
    const { currentTheme, activeTool } = this.props;
    const { isDrawingModalOpen } = this.state;

    if (!isDrawingModalOpen) return null;

    return (
      <div
        ref={this.drawingModalRef}
        style={{
          position: 'absolute',
          top: '60px',
          left: '60px',
          zIndex: 1000,
          background: currentTheme.toolbar.background,
          border: `1px solid ${currentTheme.toolbar.border}`,
          borderRadius: '8px',
          padding: '16px',
          width: '280px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
        className="modal-scrollbar"
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: `1px solid ${currentTheme.toolbar.border}`,
        }}>
          <h3 style={{
            margin: 0,
            color: currentTheme.layout.textColor,
            fontSize: '14px',
            fontWeight: '600',
          }}>
            绘图工具
          </h3>
          <button
            onClick={this.handleCloseDrawingModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentTheme.layout.textColor,
              cursor: 'pointer',
              fontSize: '16px',
              padding: '2px 8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = currentTheme.toolbar.button.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {this.drawingTools.map(group => (
            <div key={group.title}>
              <div style={{
                color: currentTheme.layout.textColor,
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '12px',
                opacity: 0.8,
                paddingLeft: '4px',
              }}>
                {group.title}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
              }}>
                {group.tools.map(tool => {
                  const IconComponent = tool.icon;
                  const isActive = activeTool === tool.id;

                  return (
                    <button
                      key={tool.id}
                      onClick={() => this.handleDrawingToolSelect(tool.id)}
                      style={{
                        background: isActive
                          ? currentTheme.toolbar.button.active
                          : 'transparent',
                        border: `1px solid ${isActive
                          ? currentTheme.toolbar.button.active
                          : currentTheme.toolbar.border
                          }`,
                        padding: '12px 8px',
                        borderRadius: '6px',
                        color: currentTheme.layout.textColor,
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                          e.currentTarget.style.borderColor = currentTheme.toolbar.button.active;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = currentTheme.toolbar.border;
                        }
                      }}
                    >
                      <IconComponent
                        size={20}
                        color={isActive
                          ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
                          : currentTheme.toolbar.button.color
                        }
                      />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', fontSize: '11px' }}>{tool.name}</div>
                        <div style={{
                          fontSize: '9px',
                          opacity: 0.7,
                          lineHeight: '1.2',
                          marginTop: '2px'
                        }}>
                          {tool.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {activeTool && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: currentTheme.toolbar.button.active + '20',
            border: `1px solid ${currentTheme.toolbar.button.active}`,
            borderRadius: '6px',
            fontSize: '11px',
            color: currentTheme.layout.textColor,
            textAlign: 'center',
          }}>
            已选择: {this.getToolName(activeTool)} - 点击图表开始绘制
          </div>
        )}
      </div>
    );
  };

  private getToolName(toolId: string): string {
    for (const group of this.drawingTools) {
      const tool = group.tools.find(t => t.id === toolId);
      if (tool) return tool.name;
    }
    return toolId;
  }

  private handleDrawingClick = () => {
    this.setState({ isDrawingModalOpen: !this.state.isDrawingModalOpen });
  };

  private handleCloseDrawingModal = () => {
    this.setState({ isDrawingModalOpen: false });
  };

  private handleDrawingToolSelect = (toolId: string) => {
    this.props.onToolSelect(toolId);
    this.setState({ isDrawingModalOpen: false });
  };


  private renderToolButton = (tool: any, isActive: boolean, onClick: () => void) => {
    const { currentTheme } = this.props;
    const IconComponent = tool.icon;

    return (
      <button
        key={tool.id}
        title={tool.title}
        onClick={onClick}
        className={tool.className || ''}
        style={{
          background: isActive
            ? currentTheme.toolbar.button.active
            : 'transparent',
          border: 'none',
          borderRadius: '0px',
          padding: '0px',
          cursor: 'pointer',
          color: isActive
            ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
            : currentTheme.toolbar.button.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          height: '38px',
          width: '38px',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <IconComponent
          size={20}
          color={isActive
            ? currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor
            : currentTheme.toolbar.button.color}
        />
      </button>
    );
  };


  private renderDrawingTools = () => {
    const drawingButton = {
      id: 'drawing',
      icon: DrawingIcon,
      title: 'Drawing Tools',
      className: 'drawing-button'
    };

    const isActive = this.state.isDrawingModalOpen || this.props.activeTool !== null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {this.renderToolButton(drawingButton, isActive, this.handleDrawingClick)}
      </div>
    );
  };


  private renderTradeTools = () => {
    const { activeTool, onToolSelect, onTradeClick } = this.props;

    const tradeTools = [
      { id: 'trade', icon: TradeIcon, title: 'Trade', className: 'trade-button' },
      { id: 'buy', icon: BuyIcon, title: 'Buy' },
      { id: 'sell', icon: SellIcon, title: 'Sell' },
      { id: 'orders', icon: OrderIcon, title: 'Order' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tradeTools.map(tool => {
          const isActive = activeTool === tool.id;
          const onClick = tool.id === 'trade'
            ? onTradeClick
            : () => onToolSelect(tool.id);

          return this.renderToolButton(tool, isActive, onClick);
        })}
      </div>
    );
  };


  private renderAnalysisTools = () => {
    const { activeTool, onToolSelect } = this.props;

    const analysisTools = [
      { id: 'settings', icon: SettingsIcon, title: 'Setting', className: 'indicator-button' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {analysisTools.map(tool => {
          const isActive = activeTool === tool.id;
          const onClick = () => onToolSelect(tool.id);

          return this.renderToolButton(tool, isActive, onClick);
        })}
      </div>
    );
  };

  render() {
    const { showToolbar = true } = this.props;

    if (!showToolbar) return null;

    return (
      <div style={{ position: 'relative' }}>
        <div style={{
          background: this.props.currentTheme.toolbar.background,
          borderRight: `1px solid ${this.props.currentTheme.toolbar.border}`,
          display: 'flex',
          flexDirection: 'column',
          width: '50px',
          boxSizing: 'border-box',
          height: '100%',
          overflow: 'hidden',
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }} className="custom-scrollbar">
            {this.renderTradeTools()}

            <div style={{
              height: '1px',
              background: this.props.currentTheme.toolbar.border,
              margin: '10px 0',
            }} />

            {this.renderDrawingTools()}

            <div style={{
              height: '1px',
              background: this.props.currentTheme.toolbar.border,
              margin: '10px 0',
            }} />

            {this.renderAnalysisTools()}
          </div>
        </div>
        {this.renderDrawingModal()}
      </div>
    );
  }
}

export default CandleViewLeftPanel;