import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { type } = await request.json();
    let key = '';
    if (type === 'aliyun') {
      key = process.env.ALIYUN_API_KEY || '';
    } else if (type === 'deepseek') {
      key = process.env.DEEP_SEEK_API_KEY || '';
    }
    return NextResponse.json({ key });
  } catch {
    return NextResponse.json({ key: '' });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  let key = '';
  if (type === 'openai') key = process.env.OPENAI_API_KEY || '';
  if (type === 'aliyun') key = process.env.ALIYUN_API_KEY || '';
  if (type === 'deepseek') key = process.env.DEEPSEEK_API_KEY || '';
  return NextResponse.json({ key });
}
