import { NextResponse } from 'next/server';
import { AliyunAI, DeepSeekAI, AliYunModelType, DeepSeekModelType } from 'ohlcv-ai';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

const API_KEYS = {
  "aliyun": process.env.ALIYUN_API_KEY || '',
  "deepseek": process.env.DEEPSEEK_API_KEY || ''
};

export interface ChatServiceRequest {
  provider: 'aliyun' | 'deepseek';
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  i18n: 'en' | 'cn';
  modelType?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
}

export interface ChatServiceResponse {
  success: boolean;
  provider: string;
  model: string;
  message: string;
  duration: number;
  error?: string;
  metadata: {
    messageCount: number;
    language: string;
    timestamp: string;
  };
}

async function handleAliyun(apiKey: string, body: ChatServiceRequest) {
  const modelType = body.modelType ?
    (body.modelType as AliYunModelType) :
    undefined;
  const client = new AliyunAI({ apiKey: apiKey, modelType: modelType });
  const userMessages = body.messages.filter(msg => msg.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
  let messages = [...body.messages];
  if (body.options?.systemPrompt) {
    messages = [
      { role: 'system', content: body.options.systemPrompt },
      ...messages.filter(msg => msg.role !== 'system')
    ];
  }
  const response = await client.chat(lastUserMessage, body.i18n, {
    temperature: body.options?.temperature,
    maxTokens: body.options?.maxTokens,
    systemPrompt: body.options?.systemPrompt
  });
  return {
    response,
    model: client.getCurrentModel().name
  };
}

async function handleDeepSeek(apiKey: string, body: ChatServiceRequest) {
  const modelType = body.modelType ?
    (body.modelType as DeepSeekModelType) :
    undefined;
  const client = new DeepSeekAI({ apiKey: apiKey, modelType: modelType });
  const userMessages = body.messages.filter(msg => msg.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
  let messages = [...body.messages];
  if (body.options?.systemPrompt) {
    messages = [
      { role: 'system', content: body.options.systemPrompt },
      ...messages.filter(msg => msg.role !== 'system')
    ];
  }
  const response = await client.chat(lastUserMessage, body.i18n, {
    temperature: body.options?.temperature,
    maxTokens: body.options?.maxTokens,
    systemPrompt: body.options?.systemPrompt
  });
  return {
    response,
    model: client.getCurrentModel().name
  };
}

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json() as ChatServiceRequest;
    if (!body.provider || !body.messages || !body.i18n) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: provider, messages, i18n' },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'messages must be a non-empty array' },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    const lastMessage = body.messages[body.messages.length - 1];
    if (lastMessage.role !== 'user') {
      return NextResponse.json(
        { success: false, error: 'Last message must be from user' },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    let result: { response: string; model: string };
    const apiKey = API_KEYS[body.provider];
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: `${body.provider} API key is not configured or unsupported provider` },
        { status: 500, headers: CORS_HEADERS }
      );
    }
    switch (body.provider) {
      case 'aliyun':
        result = await handleAliyun(apiKey, body);
        break;
      case 'deepseek':
        result = await handleDeepSeek(apiKey, body);
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Unsupported provider: ${body.provider}` },
          { status: 400, headers: CORS_HEADERS }
        );
    }
    const duration = Date.now() - startTime;
    const response: ChatServiceResponse = {
      success: true,
      provider: body.provider,
      model: result.model,
      message: result.response,
      duration,
      metadata: {
        messageCount: body.messages.length,
        language: body.i18n,
        timestamp: new Date().toISOString()
      }
    };
    return NextResponse.json(response, { headers: CORS_HEADERS });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorResponse: Partial<ChatServiceResponse> = {
      success: false,
      provider: 'unknown',
      model: '',
      message: '',
      duration,
      error: errorMessage,
      metadata: {
        messageCount: 0,
        language: 'en',
        timestamp: new Date().toISOString()
      }
    };
    return NextResponse.json(errorResponse, { status: 500, headers: CORS_HEADERS });
  }
}

export async function GET(request: Request) {
  const providers = Object.keys(API_KEYS).filter(key => API_KEYS[key as keyof typeof API_KEYS]);
  return NextResponse.json({
    available_providers: providers,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  }, { headers: CORS_HEADERS });
}

export async function HEAD(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-API-Status': 'Healthy',
      'X-Available-Providers': Object.keys(API_KEYS).filter(key => API_KEYS[key as keyof typeof API_KEYS]).join(','),
      ...CORS_HEADERS
    }
  });
}
