import React from 'react';
import { ThemeConfig } from '../CandleViewTheme';
import { RSIIndicator } from './RSIIndicator';
import { MACDIndicator } from './MACDIndicator';
import { VolumeIndicator } from './VolumeIndicator';
import { SARIndicator } from './SARIndicator';
import { KDJIndicator } from './KDJIndicator';

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
      height: `${height}px`,
      borderTop: `1px solid ${currentTheme.toolbar.border}`,
      background: currentTheme.layout.background.color,
    }}>
      {activeIndicators.map(indicator => {
        const props = {
          theme: currentTheme,
          data: chartData,
          height: indicatorHeight,
          width: '100%'  
        };

        switch (indicator) {
          case 'rsi':
            return <RSIIndicator key="rsi" {...props} />;
          case 'macd':
            return <MACDIndicator key="macd" {...props} />;
          case 'volume':
            return <VolumeIndicator key="volume" {...props} />;
          case 'sar':
            return <SARIndicator key="sar" {...props} />;
          case 'kdj':
            return <KDJIndicator key="kdj" {...props} />;
          default:
            return null;
        }
      })}
    </div>
  );
};