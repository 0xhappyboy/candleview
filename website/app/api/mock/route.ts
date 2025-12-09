import { NextRequest, NextResponse } from 'next/server';

interface OHLCVPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function generateOHLCVData(params: any): OHLCVPoint[] {
  const {
    count = 100,
    symbol = 'MOCK',
    interval = '1h',
    startPrice = 100,
    volatility = 0.02
  } = params;
  const data: OHLCVPoint[] = [];
  let lastClose = startPrice;
  const now = Date.now();
  let timeStep = 3600;
  if (interval === '1d') timeStep = 86400;
  if (interval === '1w') timeStep = 604800;
  if (interval === '1m') timeStep = 2592000;
  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - 1 - i) * timeStep * 1000;
    const random = (Math.random() - 0.5) * 2;
    const trend = Math.sin(i / 20) * 0.3;
    const priceChange = (random + trend) * volatility;
    const open = i === 0 ? startPrice : lastClose;
    const close = open * (1 + priceChange);
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    const volume = Math.floor(1000 + Math.random() * 9000);
    data.push({
      time: Math.floor(timestamp / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume
    });

    lastClose = close;
  }
  return data;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      count: parseInt(searchParams.get('count') || '100'),
      symbol: searchParams.get('symbol') || 'MOCK',
      interval: searchParams.get('interval') || '1h',
      startPrice: parseFloat(searchParams.get('startPrice') || '100'),
      volatility: parseFloat(searchParams.get('volatility') || '0.02')
    };
    const data = generateOHLCVData(params);
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate data',
        data: generateOHLCVData({})
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = generateOHLCVData(body);
    return NextResponse.json({
      success: true,
      count: data.length,
      data: data,
      metadata: {
        generatedAt: new Date().toISOString(),
        params: body
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate data',
        data: generateOHLCVData({})
      },
      { status: 500 }
    );
  }
}
