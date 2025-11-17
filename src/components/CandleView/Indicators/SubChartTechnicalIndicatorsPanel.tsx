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
  const timeScaleHeight = 30;
  const minChartHeight = 40;
  const separatorHeight = 1;
  const calculateBaseHeights = () => {
    const totalSeparatorHeight = separatorHeight * (selectedSubChartIndicators.length - 1);
    const availableChartHeight = height - totalSeparatorHeight;
    const baseHeightPerIndicator = availableChartHeight / selectedSubChartIndicators.length;
    const chartHeightPerIndicator = Math.max(baseHeightPerIndicator - timeScaleHeight, minChartHeight);
    return {
      baseHeightPerIndicator,
      chartHeightPerIndicator,
      totalSeparatorHeight
    };
  };
  const { baseHeightPerIndicator, chartHeightPerIndicator, totalSeparatorHeight } = calculateBaseHeights();
  const calculateExactHeights = () => {
    const heights: number[] = [];
    let remainingHeight = height - totalSeparatorHeight;
    for (let i = 0; i < selectedSubChartIndicators.length - 1; i++) {
      heights.push(baseHeightPerIndicator);
      remainingHeight -= baseHeightPerIndicator;
    }
    heights.push(remainingHeight);
    return heights;
  };
  const exactHeights = calculateExactHeights();
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
      height: `${height}px`,
      background: currentTheme.layout.background.color,
    }}>
      {selectedSubChartIndicators.map((indicator, index) => {
        const exactHeight = exactHeights[index];
        const chartHeight = exactHeight - timeScaleHeight;
        const props = {
          theme: currentTheme,
          data: chartData,
          height: exactHeight,
          chartHeight: chartHeight,
          width: '100%',
          onDoubleClick: handleDoubleClick
        };
        return (
          <React.Fragment key={indicator}>
            {index > 0 && (
              <div
                style={{
                  height: `${separatorHeight}px`,
                  background: currentTheme.toolbar.border,
                  flexShrink: 0,
                }}
              />
            )}
            <div
              style={{
                height: `${exactHeight}px`,
                minHeight: `${minChartHeight + timeScaleHeight}px`,
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
              }}
            >
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
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};