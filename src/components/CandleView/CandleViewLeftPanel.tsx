
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
  PieChartIcon,
} from './CandleViewIcons';
import { EMOJI_CATEGORIES, EMOJI_LIST } from './Drawing/Emoji/EmojiConfig';


interface CandleViewLeftPanelProps {
  currentTheme: ThemeConfig;
  activeTool: string | null;
  onToolSelect: (tool: string) => void;
  onTradeClick: () => void;
  showToolbar?: boolean;
  drawingLayerRef?: React.RefObject<any>;


  selectedEmoji?: string;
  onEmojiSelect?: (emoji: string) => void;
}

interface CandleViewLeftPanelState {
  isDrawingModalOpen: boolean;
  isEmojiSelectPopUpOpen: boolean;
  selectedEmoji: string;
  selectedEmojiCategory: string;
}

class CandleViewLeftPanel extends React.Component<CandleViewLeftPanelProps, CandleViewLeftPanelState> {
  private drawingModalRef = React.createRef<HTMLDivElement>();
  private emojiPickerRef = React.createRef<HTMLDivElement>();

  constructor(props: CandleViewLeftPanelProps) {
    super(props);
    this.state = {
      isDrawingModalOpen: false,
      isEmojiSelectPopUpOpen: false,
      selectedEmoji: props.selectedEmoji || '😀',
      selectedEmojiCategory: 'smileys'
    };
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside, true);
  }

  componentDidUpdate(prevProps: CandleViewLeftPanelProps) {

    if (prevProps.selectedEmoji !== this.props.selectedEmoji && this.props.selectedEmoji) {
      this.setState({
        selectedEmoji: this.props.selectedEmoji
      });
    }
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

    if (this.state.isEmojiSelectPopUpOpen &&
      this.emojiPickerRef.current &&
      !this.emojiPickerRef.current.contains(target) &&
      !target.closest('.emoji-button')) {
      this.setState({ isEmojiSelectPopUpOpen: false });
    }
  };

  private handleEmojiToolSelect = () => {
    if (this.state.isEmojiSelectPopUpOpen) {
      this.setState({ isEmojiSelectPopUpOpen: false });
      return;
    }

    this.setState({
      isDrawingModalOpen: false,
      isEmojiSelectPopUpOpen: true
    });

    this.props.onToolSelect('emoji');
  };


  private handleEmojiSelect = (emoji: string) => {
    this.setState({
      selectedEmoji: emoji,
      isEmojiSelectPopUpOpen: false
    });


    if (this.props.onEmojiSelect) {
      this.props.onEmojiSelect(emoji);
    }

    if (this.props.drawingLayerRef && this.props.drawingLayerRef.current) {
      if (this.props.drawingLayerRef.current.setFirstTimeEmojiMode) {
        this.props.drawingLayerRef.current.setFirstTimeEmojiMode(true);
      }
    }

    this.props.onToolSelect('emoji');
  };

  private handleCategorySelect = (categoryId: string) => {
    this.setState({ selectedEmojiCategory: categoryId });
  };


  private renderEmojiSelectPopUp = () => {
    const { currentTheme } = this.props;
    const { isEmojiSelectPopUpOpen, selectedEmojiCategory } = this.state;

    if (!isEmojiSelectPopUpOpen) return null;

    const currentCategoryEmojis = EMOJI_LIST.filter(emoji =>
      emoji.category === selectedEmojiCategory
    );

    return (
      <div
        ref={this.emojiPickerRef}
        style={{
          position: 'absolute',
          top: '60px',
          left: '60px',
          zIndex: 1000,
          background: currentTheme.toolbar.background,
          border: `1px solid ${currentTheme.toolbar.border}`,
          padding: '0px',
          width: '320px',
          maxHeight: '400px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="modal-scrollbar"
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: `1px solid ${currentTheme.toolbar.border}`,
          background: currentTheme.toolbar.background,
          flexShrink: 0,
        }}>
          <h3 style={{
            margin: 0,
            color: currentTheme.layout.textColor,
            fontSize: '14px',
            fontWeight: '600',
          }}>
            选择表情
          </h3>
          <button
            onClick={() => this.setState({ isEmojiSelectPopUpOpen: false })}
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

        {/* 分类选择区域 - 固定不滚动 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          padding: '8px 12px',
          borderBottom: `1px solid ${currentTheme.toolbar.border}`,
          background: currentTheme.toolbar.background,
          flexShrink: 0,
          gap: '4px',
          maxHeight: '80px',
          overflowY: 'auto',
        }} className="custom-scrollbar">
          {EMOJI_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => this.handleCategorySelect(category.id)}
              style={{
                background: selectedEmojiCategory === category.id
                  ? currentTheme.toolbar.button.active
                  : 'transparent',
                border: `1px solid ${selectedEmojiCategory === category.id
                  ? currentTheme.toolbar.button.active
                  : currentTheme.toolbar.border
                  }`,
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                color: currentTheme.layout.textColor,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                height: '28px',
              }}
              onMouseEnter={(e) => {
                if (selectedEmojiCategory !== category.id) {
                  e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedEmojiCategory !== category.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
        {/* Emoji 选择区域 - 可滚动 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          maxHeight: '250px',
        }} className="custom-scrollbar">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '8px',
            justifyItems: 'center',
          }}>
            {currentCategoryEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => this.handleEmojiSelect(emoji.character)}
                style={{
                  background: 'transparent',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '22px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  minHeight: '40px',
                  minWidth: '40px',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                  e.currentTarget.style.borderColor = currentTheme.toolbar.border;
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title={emoji.name}
              >
                {emoji.character}
              </button>
            ))}
          </div>
        </div>

        {/* 底部信息区域 - 固定不滚动 */}
        <div style={{
          padding: '12px',
          background: currentTheme.toolbar.button.active + '20',
          borderTop: `1px solid ${currentTheme.toolbar.button.active}`,
          fontSize: '12px',
          color: currentTheme.layout.textColor,
          textAlign: 'center',
          flexShrink: 0,
        }}>
          已选择: {this.state.selectedEmoji} - 点击图表放置表情
        </div>
      </div>
    );
  };




  private getDisplayEmojis() {
    return EMOJI_LIST.slice(0, 42);
  }

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
    // 修复：点击绘图按钮时取消其他工具的选择
    if (!this.state.isDrawingModalOpen) {
      this.props.onToolSelect(''); // 清空激活的工具
    }

    this.setState({
      isEmojiSelectPopUpOpen: false,
      isDrawingModalOpen: !this.state.isDrawingModalOpen
    });
  };

  private handleCloseDrawingModal = () => {
    this.setState({ isDrawingModalOpen: false });
  };

  private handleDrawingToolSelect = (toolId: string) => {
    this.setState({
      isEmojiSelectPopUpOpen: false
    });
    this.props.onToolSelect(toolId);
    this.setState({ isDrawingModalOpen: false });
  };

  private handleTextToolSelect = () => {
    this.setState({
      isEmojiSelectPopUpOpen: false
    });

    if (this.props.drawingLayerRef && this.props.drawingLayerRef.current) {
      if (this.props.drawingLayerRef.current.setFirstTimeTextMode) {
        this.props.drawingLayerRef.current.setFirstTimeTextMode(true);
      }
    }
    this.props.onToolSelect('text');
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

  private renderTecGraphTools = () => {
    const drawingButton = {
      id: 'drawing',
      icon: PieChartIcon,
      title: 'Drawing Tools',
      className: 'drawing-button'
    };
    const isActive = this.state.isDrawingModalOpen;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {this.renderToolButton(drawingButton, isActive, this.handleDrawingClick)}
      </div>
    );
  };

  private renderMarkTools = () => {
    const { activeTool } = this.props;
    const { isEmojiSelectPopUpOpen } = this.state;
    const annotationTools = [
      {
        id: 'text',
        icon: TextIcon,
        title: '文字标记',
        className: 'text-button'
      },
      {
        id: 'emoji',
        icon: EmojiIcon,
        title: '表情标记',
        className: 'emoji-button'
      },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {annotationTools.map(tool => {
          const isActive = activeTool === tool.id || (tool.id === 'emoji' && isEmojiSelectPopUpOpen);
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
            {/* Technical graphics drawing tools */}
            {this.renderTecGraphTools()}
            {/* Text mark tool */}
            {this.renderMarkTools()}
            <div style={{
              height: '1px',
              background: this.props.currentTheme.toolbar.border,
              margin: '10px 0',
            }} />
            {this.renderAnalysisTools()}
          </div>
        </div>
        {this.renderDrawingModal()}
        {/*  */}
        {this.renderEmojiSelectPopUp()}
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