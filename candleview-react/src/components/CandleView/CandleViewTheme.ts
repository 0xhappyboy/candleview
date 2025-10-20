export interface ThemeConfig {
  layout: {
    background: {
      color: string;
    };
    textColor: string;
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
    lineColor: string;
    topColor: string;
    bottomColor: string;
    lineWidth: number;
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
  layout: {
    background: { color: '#0F1116' },
    textColor: '#E8EAED',
  },
  grid: {
    vertLines: { visible: false, color: '#2D323D' },
    horzLines: { visible: false, color: '#2D323D' },
  },
  chart: {
    lineColor: '#2962FF',
    topColor: 'rgba(41, 98, 255, 0.4)',
    bottomColor: 'rgba(41, 98, 255, 0)',
    lineWidth: 2,
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
  layout: {
    background: { color: '#FFFFFF' },
    textColor: '#1A1D24',
  },
  grid: {
    vertLines: { visible: false, color: '#E1E5E9' },
    horzLines: { visible: false, color: '#E1E5E9' },
  },
  chart: {
    lineColor: '#2962FF',
    topColor: 'rgba(41, 98, 255, 0.4)',
    bottomColor: 'rgba(41, 98, 255, 0)',
    lineWidth: 2,
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
