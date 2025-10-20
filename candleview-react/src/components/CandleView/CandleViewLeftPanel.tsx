import React from 'react';
import { ThemeConfig } from './CandleViewTheme';
import { DrawingIcon, FibonacciIcon, SettingsIcon, TradeIcon, BuyIcon, SellIcon, OrderIcon } from './CandleViewIcons';

interface CandleViewLeftPanelProps {
  currentTheme: ThemeConfig;
  activeTool: string | null;
  isDrawingMode: boolean;
  onToolSelect: (tool: string) => void;
  onDrawingToolSelect: (tool: string) => void;
  onTradeClick: () => void;
  onExitDrawingMode: () => void;
  showToolbar?: boolean;
  isDrawingModalOpen: boolean;
  onDrawingClick: () => void;
  onCloseDrawingModal: () => void;
  drawingModalRef?: React.RefObject<HTMLDivElement>;
}

const CandleViewLeftPanel: React.FC<CandleViewLeftPanelProps> = ({
  currentTheme,
  activeTool,
  isDrawingMode,
  onToolSelect,
  onDrawingToolSelect,
  onTradeClick,
  onExitDrawingMode,
  showToolbar = true,
  isDrawingModalOpen,
  onDrawingClick,
  onCloseDrawingModal,
  drawingModalRef
}) => {
  if (!showToolbar) return null;

  const leftPanelTools = [
    { id: 'drawing', icon: DrawingIcon, title: 'Draw Tool' },
  ];

  const analysisTools = [
    { id: 'settings', icon: SettingsIcon, title: 'Setting' },
  ];

  const tradeTools = [
    { id: 'trade', icon: TradeIcon, title: 'Trade' },
    { id: 'buy', icon: BuyIcon, title: 'Buy' },
    { id: 'sell', icon: SellIcon, title: 'Sell' },
    { id: 'orders', icon: OrderIcon, title: 'Order' },
  ];

  return (
    <>
      <div style={{
        background: currentTheme.toolbar.background,
        borderRight: `1px solid ${currentTheme.toolbar.border}`,
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tradeTools.map(tool => {
              const IconComponent = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  title={tool.title}
                  onClick={() => tool.id === 'trade'
                    ? onTradeClick()
                    : onToolSelect(tool.id)
                  }
                  className={tool.id === 'trade' ? 'trade-button' : ''}
                  style={{
                    background: isActive
                      ? currentTheme.toolbar.button.active
                      : 'transparent',
                    border: 'none',
                    borderRadius: '0px',
                    padding: '0px',
                    cursor: 'pointer',
                    color: currentTheme.toolbar.button.color,
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
                    color={currentTheme.toolbar.button.color}
                  />
                </button>
              );
            })}
          </div>
          <div style={{
            height: '1px',
            background: currentTheme.toolbar.border,
            margin: '10px 0',
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leftPanelTools.map(tool => {
              const IconComponent = tool.icon;
              const isActive = activeTool === tool.id || isDrawingModalOpen;
              return (
                <button
                  key={tool.id}
                  title={tool.title}
                  onClick={onDrawingClick}
                  className="drawing-button"
                  style={{
                    background: isActive
                      ? currentTheme.toolbar.button.active
                      : 'transparent',
                    border: isDrawingModalOpen
                      ? `2px solid ${currentTheme.toolbar.button.active}`
                      : 'none',
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
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysisTools.map(tool => {
              const IconComponent = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  title={tool.title}
                  onClick={() => onToolSelect(tool.id)}
                  className={tool.id === 'indicators' ? 'indicator-button' : ''}
                  style={{
                    background: isActive
                      ? currentTheme.toolbar.button.active
                      : 'transparent',
                    border: 'none',
                    borderRadius: '0px',
                    padding: '0px',
                    cursor: 'pointer',
                    color: currentTheme.toolbar.button.color,
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
                    color={currentTheme.toolbar.button.color}
                  />
                </button>
              );
            })}
          </div>
        </div>
        {isDrawingMode && (
          <div style={{
            padding: '8px',
            background: currentTheme.toolbar.button.active,
            color: currentTheme.toolbar.button.activeTextColor || currentTheme.layout.textColor,
            fontSize: '11px',
            textAlign: 'center',
            borderTop: `1px solid ${currentTheme.toolbar.border}`
          }}>
            Drawing Mode: {activeTool}
            <button
              onClick={onExitDrawingMode}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                marginLeft: '8px',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
      {isDrawingModalOpen && (
        <div
          ref={drawingModalRef}
          data-drawing-modal
          style={{
            position: 'absolute',
            top: '80px',
            left: '70px',
            zIndex: 1001,
            background: currentTheme.toolbar.background,
            border: `1px solid ${currentTheme.toolbar.border}`,
            borderRadius: '6px',
            padding: '12px',
            width: '280px',
            maxHeight: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            overflowY: 'auto',
          }}
          className="modal-scrollbar"
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            position: 'sticky',
            top: 0,
            background: currentTheme.toolbar.background,
            paddingBottom: '8px',
            borderBottom: `1px solid ${currentTheme.toolbar.border}`,
          }}>
            <h3 style={{
              margin: 0,
              color: currentTheme.layout.textColor,
              fontSize: '14px',
              fontWeight: '600',
            }}>
              Draw Tools
            </h3>
            <button
              onClick={onCloseDrawingModal}
              style={{
                background: 'transparent',
                border: 'none',
                color: currentTheme.layout.textColor,
                cursor: 'pointer',
                fontSize: '16px',
                padding: '2px 6px',
                borderRadius: '3px',
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
          }}>
            {DRAWING_TOOLS['en'].map(tool => (
              <button
                key={tool.id}
                onClick={() => onDrawingToolSelect(tool.id)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${currentTheme.toolbar.border}`,
                  padding: '10px 8px',
                  borderRadius: '6px',
                  color: currentTheme.layout.textColor,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = currentTheme.toolbar.button.hover;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = currentTheme.toolbar.button.active;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = currentTheme.toolbar.border;
                }}
              >
                <span style={{ fontWeight: '600' }}>{tool.name}</span>
                <span style={{
                  fontSize: '10px',
                  opacity: 0.7,
                  lineHeight: '1.2'
                }}>
                  {tool.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CandleViewLeftPanel;
