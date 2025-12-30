export interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface DataRange {
  basePrice: number;
  volatility: number;
  timeRange: number;
  points: number;
  trend?: 'up' | 'down' | 'sideways';
}

export const generateMockOHLCVData = (range: DataRange): OHLCVData[] => {
  const { basePrice, volatility, timeRange, points, trend = 'sideways' } = range;
  const data: OHLCVData[] = [];
  const baseTime = Date.now();
  const timeStep = timeRange / points;
  let currentPrice = basePrice;
  let trendFactor = 0;
  switch (trend) {
    case 'up':
      trendFactor = 0.001;
      break;
    case 'down':
      trendFactor = -0.001;
      break;
    default:
      trendFactor = 0;
  }
  for (let i = 0; i < points; i++) {
    const time = baseTime - (points - i) * timeStep;
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const trendChange = trendFactor * i * basePrice;
    const priceChange = randomChange + trendChange;
    const open = currentPrice;
    const close = open + priceChange;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 1000) + 100;
    data.push({
      time,
      open,
      high,
      low,
      close,
      volume
    });
    currentPrice = close;
  }
  return data;
};

export const parseDataRangeFromAI = (aiResponse: string): DataRange | null => {
  try {
    if (aiResponse.trim().startsWith('{')) {
      const parsed = JSON.parse(aiResponse);
      return {
        basePrice: parsed.basePrice || 100,
        volatility: parsed.volatility || 5,
        timeRange: parsed.timeRange || 86400000, // 24小时
        points: parsed.points || 100,
        trend: parsed.trend || 'sideways'
      };
    }
    const basePriceMatch = aiResponse.match(/基础价格[：:]?\s*([\d.]+)/) ||
      aiResponse.match(/base[：:]?\s*([\d.]+)/i);
    const volatilityMatch = aiResponse.match(/波动率[：:]?\s*([\d.]+)/) ||
      aiResponse.match(/volatility[：:]?\s*([\d.]+)/i);
    const pointsMatch = aiResponse.match(/数据点[：:]?\s*(\d+)/) ||
      aiResponse.match(/points[：:]?\s*(\d+)/i);
    return {
      basePrice: basePriceMatch ? parseFloat(basePriceMatch[1]) : 100,
      volatility: volatilityMatch ? parseFloat(volatilityMatch[1]) : 5,
      timeRange: 86400000,
      points: pointsMatch ? parseInt(pointsMatch[1]) : 100,
      trend: 'sideways'
    };
  } catch (error) {
    return null;
  }
};
