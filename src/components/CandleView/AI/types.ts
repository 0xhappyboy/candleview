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
}
