export enum AIType {
  Aliyun,
  OpenAI,
  DeepSeek,
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

export function aiToolIdToFunctionType(aiToolId: string): AIFunctionType | null {
  const validTypes = Object.values(AIFunctionType);
  if (validTypes.includes(aiToolId as AIFunctionType)) {
    return aiToolId as AIFunctionType;
  }
  return null;
}

export interface AIConfig {
  apiKey: string;
  type: AIType;
}
