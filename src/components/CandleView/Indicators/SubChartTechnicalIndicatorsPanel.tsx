import React from 'react';
import { ThemeConfig } from '../CandleViewTheme';
import { RSIIndicator } from './SubChart/RSIIndicator';
import { MACDIndicator } from './SubChart/MACDIndicator';
import { VolumeIndicator } from './SubChart/VolumeIndicator';
import { SARIndicator } from './SubChart/SARIndicator';
import { KDJIndicator } from './SubChart/KDJIndicator';
import { ATRIndicator } from './SubChart/ATRIndicator';
import { StochasticIndicator } from './SubChart/StochasticIndicator';
import { CCIIndicator } from './SubChart/CCIIndicator';
import { BBWidthIndicator } from './SubChart/BBWidthIndicator';
import { ADXIndicator } from './SubChart/ADXIndicator';
import { OBVIndicator } from './SubChart/OBVIndicator';

interface SubChartTechnicalIndicatorsPanelProps {
  currentTheme: ThemeConfig;
  chartData: Array<{ time: string; value: number }>;
  selectedSubChartIndicators: string[];
  height?: number;
}

export const SubChartTechnicalIndicatorsPanel: React.FC<SubChartTechnicalIndicatorsPanelProps> = ({
  currentTheme,
  chartData,
  selectedSubChartIndicators,
  height = 200
}) => {
  if (selectedSubChartIndicators.length === 0) return null;
  const minIndicatorHeight = 120;
  const indicatorHeight = Math.max(height / selectedSubChartIndicators.length, minIndicatorHeight);
  const handleDoubleClick = (chartRef: React.MutableRefObject<any>) => {
    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.timeScale().fitContent();
        } catch (error) {
          console.debug('Chart reset error:', error);
        }
      }
    };
  };
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderTop: `1px solid ${currentTheme.toolbar.border}`,
      background: currentTheme.layout.background.color,


    }}>
      {selectedSubChartIndicators.map((indicator, index) => {
        const props = {
          theme: currentTheme,
          data: chartData,
          height: indicatorHeight,
          width: '100%',
          onDoubleClick: handleDoubleClick
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