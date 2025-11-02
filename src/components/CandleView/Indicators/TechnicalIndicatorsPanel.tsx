import React from 'react';
import { ThemeConfig } from '../CandleViewTheme';
import { RSIIndicator } from './sub/RSIIndicator';
import { MACDIndicator } from './sub/MACDIndicator';
import { VolumeIndicator } from './sub/VolumeIndicator';
import { SARIndicator } from './sub/SARIndicator';
import { KDJIndicator } from './sub/KDJIndicator';
import { ATRIndicator } from './sub/ATRIndicator';
import { StochasticIndicator } from './sub/StochasticIndicator';
import { CCIIndicator } from './sub/CCIIndicator';
import { BBWidthIndicator } from './sub/BBWidthIndicator';
import { ADXIndicator } from './sub/ADXIndicator';
import { OBVIndicator } from './sub/OBVIndicator';

interface TechnicalIndicatorsPanelProps {
  currentTheme: ThemeConfig;
  chartData: Array<{ time: string; value: number }>;
  activeIndicators: string[];
  height?: number;
}

export const TechnicalIndicatorsPanel: React.FC<TechnicalIndicatorsPanelProps> = ({
  currentTheme,
  chartData,
  activeIndicators,
  height = 200
}) => {
  if (activeIndicators.length === 0) return null;
  const indicatorHeight = Math.max(height / activeIndicators.length, 80);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderTop: `1px solid ${currentTheme.toolbar.border}`,
      background: currentTheme.layout.background.color,
    }}>
      {activeIndicators.map((indicator, index) => {
        const props = {
          theme: currentTheme,
          data: chartData,
          height: indicatorHeight,
          width: '100%'
        };

        return (
          <React.Fragment key={indicator}>
            {index > 0 && (
              <div
                style={{
                  height: '1px',
                  background: currentTheme.toolbar.border,
                }}
              />
            )}
            {(() => {
              switch (indicator) {
                case 'rsi':
                  return <RSIIndicator {...props} />;
                case 'macd':
                  return <MACDIndicator {...props} />;
                case 'volume':
                  return <VolumeIndicator {...props} />;
                case 'sar':
                  return <SARIndicator {...props} />;
                case 'kdj':
                  return <KDJIndicator {...props} />;
                case 'atr':
                  return <ATRIndicator {...props} />;
                case 'stochastic':
                  return <StochasticIndicator {...props} />;
                case 'cci':
                  return <CCIIndicator {...props} />;
                case 'bbwidth':
                  return <BBWidthIndicator {...props} />;
                case 'adx':
                  return <ADXIndicator {...props} />;
                case 'obv':
                  return <OBVIndicator {...props} />;
                default:
                  return null;
              }
            })()}
          </React.Fragment>
        );
      })}
    </div>
  );
};