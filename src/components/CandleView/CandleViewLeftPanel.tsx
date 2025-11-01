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
  TextIcon,
  EmojiIcon,
  MAIcon,
  BollingerBandsIcon,
  RsiIcon,
  IchimokuIcon,
  MacdIcon,
  VolumeIcon,
  FibonacciExtensionIcon,
  AndrewPitchforkIcon,
  GannFanIcon,
  ArrowIcon,
  ChannelIcon,
  TrendChannelIcon,
  CircleIcon,
  TriangleIcon,
  CycleLinesIcon,
  GannBoxIcon,
  PitchforkIcon,
  EllipseIcon,
} from './CandleViewIcons';

interface CandleViewLeftPanelProps {
  currentTheme: ThemeConfig;
  activeTool: string | null;
  onToolSelect: (tool: string) => void;
  onTradeClick: () => void;
  showToolbar?: boolean;
  drawingLayerRef?: React.RefObject<any>;
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
        { id: 'channel', name: '通道线', description: '绘制价格通道', icon: ChannelIcon },
        { id: 'trend-channel', name: '趋势通道', description: '绘制趋势通道', icon: TrendChannelIcon },
        { id: 'arrow', name: '箭头线', description: '绘制箭头标记', icon: ArrowIcon },
      ]
    },
    {
      title: "图形工具",
      tools: [
        { id: 'rectangle', name: '矩形', description: '绘制矩形区域', icon: RectangleIcon },
        { id: 'circle', name: '圆形', description: '绘制圆形区域', icon: CircleIcon },
        { id: 'ellipse', name: '椭圆', description: '绘制椭圆区域', icon: EllipseIcon },
        { id: 'triangle', name: '三角形', description: '绘制三角形', icon: TriangleIcon },
      ]
    },
    {
      title: "斐波那契工具",
      tools: [
        { id: 'fibonacci', name: '斐波那契回调', description: '斐波那契回撤工具', icon: FibonacciIcon },
        { id: 'fibonacci-extension', name: '斐波那契扩展', description: '斐波那契扩展工具', icon: FibonacciExtensionIcon },
      ]
    },
    {
      title: "分析工具",
      tools: [
        { id: 'andrew-pitchfork', name: '安德鲁分叉线', description: '安德鲁音叉线分析', icon: AndrewPitchforkIcon },
        { id: 'gann-fan', name: '江恩角度线', description: '江恩扇形线分析', icon: GannFanIcon },
        { id: 'cycle-lines', name: '周期线', description: '时间周期分析线', icon: CycleLinesIcon },
        { id: 'gann-box', name: '江恩箱', description: '江恩箱体分析', icon: GannBoxIcon },
        { id: 'pitchfork', name: '音叉线', description: '标准音叉线工具', icon: PitchforkIcon },
      ]
    },
    {
      title: "标注工具",
      tools: [
        { id: 'text', name: '文本', description: '添加文本标注', icon: TextIcon },
        { id: 'emoji', name: '表情', description: '添加表情标记', icon: EmojiIcon },
      ]
    }
  ];

  private technicalIndicators = [
    {
      title: "趋势指标",
      tools: [
        { id: 'ma', name: '移动平均线', description: 'MA 移动平均线', icon: MAIcon },
        { id: 'bollinger-bands', name: '布林带', description: 'Bollinger Bands', icon: BollingerBandsIcon },
        { id: 'ichimoku', name: '一目均衡表', description: 'Ichimoku Cloud', icon: IchimokuIcon },
      ]
    },
    {
      title: "动量指标",
      tools: [
        { id: 'rsi', name: 'RSI', description: '相对强弱指数', icon: RsiIcon },
        { id: 'macd', name: 'MACD', description: '指数平滑异同移动平均线', icon: MacdIcon },
      ]
    },
    {
      title: "成交量指标",
      tools: [
        { id: 'volume', name: '成交量', description: '成交量柱状图', icon: VolumeIcon },
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
          borderRadius: '0px',
          padding: '16px 0px',
          width: '320px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          maxHeight: '500px',
          overflowY: 'auto',
        }}
        className="modal-scrollbar"
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0px',
          paddingBottom: '12px',
          borderBottom: `1px solid ${currentTheme.toolbar.border}`,
          paddingLeft: `12px`,
          paddingRight: `4px`,
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
              borderRadius: '0px',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {this.drawingTools.map((group, index) => (
            <CollapsibleToolGroup
              key={group.title}
              title={group.title}
              tools={group.tools}
              currentTheme={currentTheme}
              activeTool={activeTool}
              onToolSelect={this.handleDrawingToolSelect}
              defaultOpen={index === 0}
            />
          ))}
          {this.technicalIndicators.map((group, index) => (
            <CollapsibleToolGroup
              key={group.title}
              title={group.title}
              tools={group.tools}
              currentTheme={currentTheme}
              activeTool={activeTool}
              onToolSelect={this.handleDrawingToolSelect}
              defaultOpen={index === 0}
            />
          ))}
        </div>

        {activeTool && (
          <div style={{
            marginTop: '16px',
            padding: '15px',
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

    for (const group of this.technicalIndicators) {
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

  private handleTextToolSelect = () => {

    if (this.props.drawingLayerRef && this.props.drawingLayerRef.current) {
      this.props.drawingLayerRef.current.setFirstTimeTextMode(true);
    }
    this.props.onToolSelect('text');
  };

  private handleEmojiToolSelect = () => {
    this.props.onToolSelect('emoji');
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

    const isActive = this.state.isDrawingModalOpen ||
      (this.props.activeTool !== null &&
        (this.drawingTools.some(group => group.tools.some(tool => tool.id === this.props.activeTool)) ||
          this.technicalIndicators.some(group => group.tools.some(tool => tool.id === this.props.activeTool))));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {this.renderToolButton(drawingButton, isActive, this.handleDrawingClick)}
      </div>
    );
  };


  private renderAnnotationTools = () => {
    const { activeTool } = this.props;

    const annotationTools = [
      { id: 'text', icon: TextIcon, title: '文字标记' },
      { id: 'emoji', icon: EmojiIcon, title: '表情标记' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {annotationTools.map(tool => {
          const isActive = activeTool === tool.id;
          const onClick = tool.id === 'text'
            ? this.handleTextToolSelect
            : this.handleEmojiToolSelect;

          return this.renderToolButton(tool, isActive, onClick);
        })}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
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
            gap: '0px',
          }} className="custom-scrollbar">
            {this.renderTradeTools()}
            {/* <div style={{
              height: '1px',
              background: this.props.currentTheme.toolbar.border,
              margin: '10px 0',
            }} /> */}
            {this.renderDrawingTools()}
            {/* <div style={{
              height: '1px',
              background: this.props.currentTheme.toolbar.border,
              margin: '10px 0',
            }} /> */}
            {this.renderAnnotationTools()}
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


interface CollapsibleToolGroupProps {
  title: string;
  tools: Array<{
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
  }>;
  currentTheme: ThemeConfig;
  activeTool: string | null;
  onToolSelect: (toolId: string) => void;
  defaultOpen?: boolean;
}

interface CollapsibleToolGroupState {
  isOpen: boolean;
}

class CollapsibleToolGroup extends React.Component<CollapsibleToolGroupProps, CollapsibleToolGroupState> {
  constructor(props: CollapsibleToolGroupProps) {
    super(props);
    this.state = {
      isOpen: props.defaultOpen || false
    };
  }

  toggleOpen = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  };

  render() {
    const { title, tools, currentTheme, activeTool, onToolSelect } = this.props;
    const { isOpen } = this.state;

    return (
      <div style={{
        borderBottom: `1px solid ${currentTheme.toolbar.border}`,
      }}>
        <button
          onClick={this.toggleOpen}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            padding: '12px 12px',
            color: currentTheme.layout.textColor,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = currentTheme.toolbar.button.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span>{title}</span>
          <span style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            fontSize: '12px',
          }}>
            ▼
          </span>
        </button>

        {isOpen && (
          <div style={{
            padding: '0px',
            background: currentTheme.toolbar.background,
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0px',
            }}>
              {tools.map(tool => {
                const IconComponent = tool.icon;
                const isActive = activeTool === tool.id;

                return (
                  <button
                    key={tool.id}
                    onClick={() => onToolSelect(tool.id)}
                    style={{
                      background: isActive
                        ? currentTheme.toolbar.button.active
                        : 'transparent',
                      border: isActive
                        ? `2px solid ${currentTheme.toolbar.button.active}`
                        : '2px solid transparent',
                      padding: '10px 12px',
                      borderRadius: '0px',
                      color: currentTheme.layout.textColor,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0px',
                      width: '100%',
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
                        : currentTheme.toolbar.button.color
                      }
                    />
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      flex: 1,
                    }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '12px',
                        lineHeight: '1.2',
                      }}>
                        {tool.name}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        opacity: 0.7,
                        lineHeight: '1.2',
                        marginTop: '2px',
                        textAlign: 'left',
                      }}>
                        {tool.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default CandleViewLeftPanel;