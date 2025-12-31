import { EN, I18n } from "../I18n";
import { ICandleViewDataPoint } from "../types";
import { ProxyService } from "./types";

function ensureNoTrailingSlash(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

// Remote call to analyze OHLCV data service
export async function callProxyAnalyzeOHLCVService(
    i18n: I18n,
    baseProxyUrl: string,
    provider: string,
    modelType: string,
    data: ICandleViewDataPoint[],
    userMessage: string
): Promise<string> {
    const ohlcvData = data.map(item => ({
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
    }));
    const requestBody = {
        provider,
        data: ohlcvData,
        i18n: i18n === EN ? 'en' : 'cn',
        modelType: modelType,
        analysisType: 'comprehensive',
        message: userMessage,
        options: {
            temperature: 0.5,
            maxTokens: 1000
        }
    };
    const normalizedBaseUrl = ensureNoTrailingSlash(baseProxyUrl);
    const fullProxyUrl = `${normalizedBaseUrl}${ProxyService.AnalyzeOHLCV}`;
    try {
        const response = await fetch(fullProxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
            return result.analysis;
        } else {
            throw new Error(result.error || 'Unknown error from AI service');
        }
    } catch (error: any) {
        throw new Error(`AI service error: ${error.message || 'Network error'}`);
    }
};