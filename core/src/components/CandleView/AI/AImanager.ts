import { AIFunctionType, AIBrandType } from "./types";

export class AIManager {

    isChartType(aiToolId: string): boolean {
        const functionType = this.aiToolIdToFunctionType(aiToolId);
        if (functionType) {
            if (functionType === AIFunctionType.ClaudeChart ||
                functionType === AIFunctionType.DeepseekChart ||
                functionType === AIFunctionType.AliyunChart ||
                functionType === AIFunctionType.GeminiChart ||
                functionType === AIFunctionType.OpenaiChart
            ) {
                return true;
            }
        }
        return false;
    }

    aiToolIdToFunctionType(aiToolId: string): AIFunctionType | null {
        const validTypes = Object.values(AIFunctionType);
        if (validTypes.includes(aiToolId as AIFunctionType)) {
            return aiToolId as AIFunctionType;
        }
        return null;
    }

    getAITypeFromFunctionType(functionType: AIFunctionType | null): AIBrandType | null {
        if (!functionType) return null;
        const typeMap: Record<string, AIBrandType> = {
            'openai': AIBrandType.OpenAI,
            'aliyun': AIBrandType.Aliyun,
            'deepseek': AIBrandType.DeepSeek,
            'claude': AIBrandType.Claude,
            'gemini': AIBrandType.Gemini
        };
        const prefix = functionType.split('-')[0].toLowerCase();
        const result = typeMap[prefix];
        return result !== undefined ? result : null;
    }
}