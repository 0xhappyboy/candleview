import { NextResponse } from 'next/server';
import { OpenAI, AliyunAI, DeepSeekAI, OpenAIModelType, AliYunModelType, DeepSeekModelType } from 'ohlcv-ai';

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
  "openai": process.env.OPENAI_API_KEY || '',
  "aliyun": process.env.ALIYUN_API_KEY || '',
  "deepseek": process.env.DEEPSEEK_API_KEY || ''
};

export interface CandleViewAIServiceRequest {
  provider: string;
  data: {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  i18n: 'en' | 'cn';
  modelType: string;
  analysisType?: 'trend' | 'volume' | 'technical' | 'comprehensive';
  message?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface CandleViewAIServiceResponse {
  success: boolean;
  provider: string;
  model: string;
  analysis: string;
  duration: number;
  error?: string;
  metadata: {
    periodCount: number;
    language: string;
    analysisType: string;
    timestamp: string;
  };
}

async function handleOpenAI(apiKey: string, body: CandleViewAIServiceRequest) {
  const modelType = body.modelType ?
    (body.modelType as OpenAIModelType) :
    undefined;
  const client = new OpenAI({ apiKey: apiKey, modelType: modelType });

  const analysis = await client.analyzeOHLCV(
    body.data, body.i18n, body.analysisType, body.message, {
    temperature: body.options?.temperature,
    maxTokens: body.options?.maxTokens
  }
  );
  return { analysis, model: client.getCurrentModel().name };
}

async function handleAliyun(apiKey: string, body: CandleViewAIServiceRequest) {
  const modelType = body.modelType ?
    (body.modelType as AliYunModelType) :
    undefined;
  const client = new AliyunAI({ apiKey: apiKey, modelType: modelType });

  const analysis = await client.analyzeOHLCV(
    body.data, body.i18n, body.analysisType, body.message, {
    temperature: body.options?.temperature,
    maxTokens: body.options?.maxTokens
  }
  );
  return { analysis, model: client.getCurrentModel().name };
}

async function handleDeepSeek(apiKey: string, body: CandleViewAIServiceRequest) {
  const modelType = body.modelType ?
    (body.modelType as DeepSeekModelType) :
    undefined;
  const client = new DeepSeekAI({ apiKey: apiKey, modelType: modelType });
  const analysis = await client.analyzeOHLCV(
    body.data, body.i18n, body.analysisType, body.message, {
    temperature: body.options?.temperature,
    maxTokens: body.options?.maxTokens
  }
  );
  return { analysis, model: client.getCurrentModel().name };
}

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json() as CandleViewAIServiceRequest;
    if (!body.provider || !body.data || !body.i18n || !body.modelType) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: provider, data, i18n' },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    if (!Array.isArray(body.data) || body.data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'data must be a non-empty array' },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    let result: { analysis: string; model: string };
    const apiKey = API_KEYS[body.provider as keyof typeof API_KEYS];
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: `${body.provider} API key is not configured or unsupported provider` },
        { status: 500, headers: CORS_HEADERS }
      );
    }
    switch (body.provider) {
      case 'openai':
        result = await handleOpenAI(apiKey, body);
        break;
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
    const response: CandleViewAIServiceResponse = {
      success: true,
      provider: body.provider,
      model: result.model,
      analysis: result.analysis,
      duration,
      metadata: {
        periodCount: body.data.length,
        language: body.i18n,
        analysisType: body.analysisType || 'comprehensive',
        timestamp: new Date().toISOString()
      }
    };
    return NextResponse.json(response, { headers: CORS_HEADERS });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorResponse: Partial<CandleViewAIServiceResponse> = {
      success: false,
      provider: 'unknown',
      model: '',
      analysis: '',
      duration,
      error: errorMessage,
      metadata: {
        periodCount: 0,
        language: 'en',
        analysisType: 'comprehensive',
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
