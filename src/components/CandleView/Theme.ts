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
    volumeColor: string;
  };
  toolbar: {
    background: string;
    border: string;
    button: {
      backgroundColor: string;
      background: string;
      hover: string;
      active: string;
      color: string;
      activeTextColor: string,
      boxShadow: string,
      sendButton: {
        normal: string;
        hover: string;
        disabled: string;
      };
      inputFocus: string;
      dropdown: {
        hover: string;
        selected: string;
        borderActive: string;
      };
    };
  };
  divider: {
    normal: string;
    hover: string;
    dragging: string;
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
    upColor: '#00C087',
    downColor: '#FF5B5A',
    background: '#0F1116',
    baseLineColor: '#FF9800',
    histogramColor: '#4CAF50',
    stepLineColor: '#9C27B0',
    areaTopColor: 'rgba(33, 150, 243, 0.4)',
    areaBottomColor: 'rgba(33, 150, 243, 0)',
    areaLineColor: '#2196F3',
    volumeColor: '#4CAF50'
  },
  toolbar: {
    background: '#1A1D24',
    border: '#2D323D',
    button: {
      backgroundColor: '#2D323D',
      background: 'transparent',
      hover: '#2D323D',
      active: '#2962FF',
      color: '#E8EAED',
      activeTextColor: '#FFFFFF',
      boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.3)',
      sendButton: {
        normal: '#7A7F8B',
        hover: '#8F949F',
        disabled: '#3D4759'
      },
      inputFocus: '#8F949F',
      dropdown: {
        hover: '#2D323D',
        selected: '#7A7F8B30',
        borderActive: '#8F949F'
      }
    },
  },
  divider: {
    normal: '#2D323D20',
    hover: '#E8EAED30',
    dragging: '#E8EAED80',
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
    upColor: '#00C087',
    downColor: '#FF5B5A',
    background: '#0F1116',
    baseLineColor: '#FF9800',
    histogramColor: '#4CAF50',
    stepLineColor: '#9C27B0',
    areaTopColor: 'rgba(33, 150, 243, 0.4)',
    areaBottomColor: 'rgba(33, 150, 243, 0)',
    areaLineColor: '#2196F3',
    volumeColor: '#4CAF50'
  },
  toolbar: {
    background: '#F8F9FA',
    border: '#E1E5E9',
    button: {
      backgroundColor: '#FFFFFF',
      background: 'transparent',
      hover: '#E1E5E9',
      active: '#2962FF',
      color: '#495057',
      activeTextColor: '#FFFFFF',
      boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1)',
      sendButton: {
        normal: '#6C757D',
        hover: '#495057',
        disabled: '#E1E5E9'
      },
      inputFocus: '#1A1D24',
      dropdown: {
        hover: '#F1F3F5',
        selected: '#6C757D15',
        borderActive: '#1A1D24'
      }
    },
  },
  divider: {
    normal: '#E1E5E920',
    hover: '#49505730',
    dragging: '#49505780',
  },
};