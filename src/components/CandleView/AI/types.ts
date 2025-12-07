import {
  AliYunModelType,
  DeepSeekModelType,
  getAvailableAliYunModelTypes,
  getAvailableDeepSeekModelTypes,
  getAvailableOpenAIModelTypes,
  OpenAIModelType
} from "ohlcv-ai";

export enum AIBrandType {
  Aliyun = 'aliyun',
  OpenAI = 'openai',
  DeepSeek = 'deepseek',
  Claude = 'claude',
  Gemini = 'gemini'
}

export const AIBrandLogoMapping: Record<AIBrandType, string> = {
  [AIBrandType.Aliyun]: 'https://cdn.simpleicons.org/alibabacloud/FF6A00',
  [AIBrandType.OpenAI]: 'https://cdn.simpleicons.org/openai/412991',
  [AIBrandType.DeepSeek]: 'https://www.deepseek.com/favicon.ico',
  [AIBrandType.Claude]: 'https://cdn.simpleicons.org/anthropic/FF6B35',
  [AIBrandType.Gemini]: 'https://cdn.simpleicons.org/google/4285F4',
};

export const AIBrandNameMapping: Record<AIBrandType, string> = {
  [AIBrandType.Aliyun]: 'Aliyun',
  [AIBrandType.OpenAI]: 'OpenAI',
  [AIBrandType.DeepSeek]: 'DeepSeek',
  [AIBrandType.Claude]: 'Claude',
  [AIBrandType.Gemini]: 'Gemini',
};

export interface AIModelTypeMapping {
  [AIBrandType.OpenAI]: OpenAIModelType;
  [AIBrandType.Aliyun]: AliYunModelType;
  [AIBrandType.DeepSeek]: DeepSeekModelType;
}

export function getAIModelTypes(aiType: AIBrandType | null): (OpenAIModelType | AliYunModelType | DeepSeekModelType)[] {
  switch (aiType) {
    case AIBrandType.OpenAI:
      return getAvailableOpenAIModelTypes();
    case AIBrandType.Aliyun:
      return getAvailableAliYunModelTypes();
    case AIBrandType.DeepSeek:
      return getAvailableDeepSeekModelTypes();
    case AIBrandType.Claude:
      return [];
    case AIBrandType.Gemini:
      return [];
    default:
      return [];
  }
}

export enum AIFunctionType {
  OpenaiChart = 'openai-chart',
  OpenaiPredict = 'openai-predict',
  AliyunChart = 'aliyun-chart',
  AliyunPredict = 'aliyun-predict',
  DeepseekChart = 'deepseek-chart',
  DeepseekPredict = 'deepseek-predict',
  ClaudeChart = 'claude-chart',
  ClaudePredict = 'claude-predict',
  GeminiChart = 'gemini-chart',
  GeminiPredict = 'gemini-predict',
}

export interface AIConfig {
  apiKey: string;
  brand: AIBrandType;
  model: string;
  maxAnalyzeData?: number;
}
