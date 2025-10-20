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
    };
  };
}

export const Dark: ThemeConfig = {
  layout: {
    background: { color: '#1e1e1e' },
    textColor: '#d1d4dc',
  },
  grid: {
    vertLines: { visible: false, color: '#2b2b43' },
    horzLines: { visible: false, color: '#2b2b43' },
  },
  chart: {
    lineColor: '#2962FF',
    topColor: 'rgba(41, 98, 255, 0.4)',
    bottomColor: 'rgba(41, 98, 255, 0)',
    lineWidth: 2,
  },
  toolbar: {
    background: '#2b2b43',
    border: '#3a3a5d',
    button: {
      background: 'transparent',
      hover: '#3a3a5d',
      active: '#2962FF',
      color: '#d1d4dc',
    },
  },
};

export const Light: ThemeConfig = {
  layout: {
    background: { color: '#ffffff' },
    textColor: '#333333',
  },
  grid: {
    vertLines: { visible: false, color: '#e0e0e0' },
    horzLines: { visible: false, color: '#e0e0e0' },
  },
  chart: {
    lineColor: '#2962FF',
    topColor: 'rgba(41, 98, 255, 0.4)',
    bottomColor: 'rgba(41, 98, 255, 0)',
    lineWidth: 2,
  },
  toolbar: {
    background: '#f8f9fa',
    border: '#e0e0e0',
    button: {
      background: 'transparent',
      hover: '#e9ecef',
      active: '#2962FF',
      color: '#495057',
    },
  },
};
