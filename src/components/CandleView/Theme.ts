export interface ThemeConfig {
  panel: {
    backgroundColor: string;
    borderColor: string;
  },
  modal: {
    textColor: string;
  },
  layout: {
    background: {
      color: string;
    };
    textColor: string;
    attributionLogo: boolean;
  };
  grid: {
    vertLines: {
      visible: boolean;
      color?: string;
    };
    horzLines: {
      visible: boolean;
      color?: string;
    };
  };
  chart: {
    candleUpColor: string;
    candleDownColor: string;
    lineColor: string;
    topColor: string;
    bottomColor: string;
    lineWidth: number;
    upColor: string;
    downColor: string;
    background: string;
    baseLineColor: string;
    histogramColor: string;
    stepLineColor: string;
    areaTopColor: string;
    areaBottomColor: string;
    areaLineColor: string;
  };
  toolbar: {
    background: string;
    border: string;
    button: {
      background: string;
      hover: string;
      active: string;
      color: string;
      activeTextColor: string,
    };
  };
}

export const Dark: ThemeConfig = {
  panel: {
    backgroundColor: '#1A1D24',
    borderColor: '#2D323D'
  },
  modal: {
    textColor: "#FFFFFF",
  },
  layout: {
    background: { color: '#0F1116' },
    textColor: '#E8EAED',
    attributionLogo: false,
  },
  grid: {
    vertLines: { visible: false, color: '#2D323D' },
    horzLines: { visible: false, color: '#2D323D' },
  },
  chart: {
    candleUpColor: '#26a69a',
    candleDownColor: '#ef5350',
    lineColor: '#2962FF',
    topColor: 'rgba(41, 98, 255, 0.4)',
    bottomColor: 'rgba(41, 98, 255, 0)',
    lineWidth: 2,
    upColor: '#00C087',  // 上涨
    downColor: '#FF5B5A', //  下跌
    background: '#0F1116',
    baseLineColor: '#FF9800',
    histogramColor: '#4CAF50',
    stepLineColor: '#9C27B0',
    areaTopColor: 'rgba(33, 150, 243, 0.4)',
    areaBottomColor: 'rgba(33, 150, 243, 0)',
    areaLineColor: '#2196F3',
  },
  toolbar: {
    background: '#1A1D24',
    border: '#2D323D',
    button: {
      background: 'transparent',
      hover: '#2D323D',
      active: '#2962FF',
      color: '#E8EAED',
      activeTextColor: '#FFFFFF',
    },
  },
};

export const Light: ThemeConfig = {
  panel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E5E9'
  },
  modal: {
    textColor: "#1A1D24",
  },
  layout: {
    background: { color: '#FFFFFF' },
    textColor: '#1A1D24',
    attributionLogo: false,
  },
  grid: {
    vertLines: { visible: false, color: '#E1E5E9' },
    horzLines: { visible: false, color: '#E1E5E9' },
  },
  chart: {
    candleUpColor: '#26a69a',
    candleDownColor: '#ef5350',
    lineColor: '#2962FF',
    topColor: 'rgba(41, 98, 255, 0.4)',
    bottomColor: 'rgba(41, 98, 255, 0)',
    lineWidth: 2,
    upColor: '#00C087',  //  上涨
    downColor: '#FF5B5A', //  下跌
    background: '#0F1116',
    baseLineColor: '#FF9800',
    histogramColor: '#4CAF50',
    stepLineColor: '#9C27B0',
    areaTopColor: 'rgba(33, 150, 243, 0.4)',
    areaBottomColor: 'rgba(33, 150, 243, 0)',
    areaLineColor: '#2196F3',
  },
  toolbar: {
    background: '#F8F9FA',
    border: '#E1E5E9',
    button: {
      background: 'transparent',
      hover: '#E1E5E9',
      active: '#2962FF',
      color: '#495057',
      activeTextColor: '#FFFFFF',
    },
  },
};