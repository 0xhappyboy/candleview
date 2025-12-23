package com.candleview.service.impl;

import com.candleview.pojo.dto.AIRequest;
import com.candleview.pojo.dto.AIResponse;
import com.candleview.pojo.dto.Metadata;
import com.candleview.pojo.dto.OHLCVData;
import com.candleview.service.IAIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @ClassName AIServiceImpl
 * @Description
 * @Author happyboy
 * @Date 2025/12/18 23:10
 * @Version 1.0
 */

@Service
@Slf4j
public class AIServiceImpl implements IAIService {

  @Value("${ai.openai.api-key}")
  private String openaiApiKey;

  @Value("${ai.aliyun.api-key}")
  private String aliyunApiKey;

  @Value("${ai.deepseek.api-key}")
  private String deepseekApiKey;

  @Value("${ai.openai.endpoint:https://api.openai.com/v1/chat/completions}")
  private String openaiEndpoint;

  @Value("${ai.aliyun.endpoint:https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions}")
  private String aliyunEndpoint;

  @Value("${ai.deepseek.endpoint:https://api.deepseek.com/chat/completions}")
  private String deepseekEndpoint;

  private final RestTemplate restTemplate;

  public AIServiceImpl() {
    this.restTemplate = new RestTemplate();
  }

  @Override
  public AIResponse analyzeOHLCV(AIRequest request) {
    long startTime = System.currentTimeMillis();
    AIResponse response = new AIResponse();
    response.setProvider(request.getProvider());
    try {
      validateRequest(request);
      String apiKey = getApiKey(request.getProvider());
      String endpoint = getEndpoint(request.getProvider());
      String model = request.getModelType() != null ?
        request.getModelType() : getDefaultModel(request.getProvider());
      // Build request body
      Map<String, Object> aiRequest = buildAIRequest(request, model);
      // Send request
      ResponseEntity<Map> aiResponse = sendRequest(endpoint, apiKey, aiRequest);
      // Parse response
      String analysis = extractAnalysis(aiResponse.getBody());
      // Build return result
      response.setSuccess(true);
      response.setModel(model);
      response.setAnalysis(analysis);
      response.setDuration(System.currentTimeMillis() - startTime);
      Metadata metadata = new Metadata();
      metadata.setPeriodCount(request.getData().size());
      metadata.setLanguage(request.getI18n());
      metadata.setAnalysisType(request.getAnalysisType() != null ?
        request.getAnalysisType() : "comprehensive");
      response.setMetadata(metadata);
    } catch (Exception e) {
      log.error("AI analysis failed: {}", e.getMessage(), e);
      response.setSuccess(false);
      response.setError(e.getMessage());
      response.setDuration(System.currentTimeMillis() - startTime);
      Metadata metadata = new Metadata();
      metadata.setPeriodCount(0);
      metadata.setLanguage(request != null ? request.getI18n() : "en");
      metadata.setAnalysisType("comprehensive");
      response.setMetadata(metadata);
    }
    return response;
  }

  @Override
  public boolean testConnection(String provider) {
    try {
      String apiKey = getApiKey(provider);
      return apiKey != null && !apiKey.trim().isEmpty();
    } catch (Exception e) {
      return false;
    }
  }

  private void validateRequest(AIRequest request) {
    if (request == null) {
      throw new IllegalArgumentException("Request cannot be null");
    }
    if (request.getProvider() == null || request.getProvider().trim().isEmpty()) {
      throw new IllegalArgumentException("Provider cannot be empty");
    }
    if (request.getData() == null || request.getData().isEmpty()) {
      throw new IllegalArgumentException("Data cannot be empty");
    }
    if (request.getI18n() == null || (!"en".equals(request.getI18n()) && !"cn".equals(request.getI18n()))) {
      throw new IllegalArgumentException("Language must be 'en' or 'cn'");
    }
  }

  private String getApiKey(String provider) {
    String lowerProvider = provider.toLowerCase();
    if ("openai".equals(lowerProvider)) {
      return openaiApiKey;
    } else if ("aliyun".equals(lowerProvider)) {
      return aliyunApiKey;
    } else if ("deepseek".equals(lowerProvider)) {
      return deepseekApiKey;
    } else {
      throw new IllegalArgumentException("Unsupported provider: " + provider);
    }
  }

  private String getEndpoint(String provider) {
    String lowerProvider = provider.toLowerCase();
    if ("openai".equals(lowerProvider)) {
      return openaiEndpoint;
    } else if ("aliyun".equals(lowerProvider)) {
      return aliyunEndpoint;
    } else if ("deepseek".equals(lowerProvider)) {
      return deepseekEndpoint;
    } else {
      throw new IllegalArgumentException("Unsupported provider: " + provider);
    }
  }

  private String getDefaultModel(String provider) {
    String lowerProvider = provider.toLowerCase();
    if ("openai".equals(lowerProvider)) {
      return "gpt-3.5-turbo";
    } else if ("aliyun".equals(lowerProvider)) {
      return "qwen-turbo";
    } else if ("deepseek".equals(lowerProvider)) {
      return "deepseek-chat";
    } else {
      throw new IllegalArgumentException("Unsupported provider: " + provider);
    }
  }

  private Map<String, Object> buildAIRequest(AIRequest request, String model) {
    Map<String, Object> aiRequest = new HashMap<>();
    aiRequest.put("model", model);
    String systemPrompt = buildSystemPrompt(request);
    String userMessage = buildUserMessage(request);
    aiRequest.put("messages", new Object[]{
      Map.of("role", "system", "content", systemPrompt),
      Map.of("role", "user", "content", userMessage)
    });
    if (request.getOptions() != null) {
      if (request.getOptions().getTemperature() != null) {
        aiRequest.put("temperature", request.getOptions().getTemperature());
      }
      if (request.getOptions().getMaxTokens() != null) {
        aiRequest.put("max_tokens", request.getOptions().getMaxTokens());
      }
    }
    return aiRequest;
  }

  private String buildSystemPrompt(AIRequest request) {
    String analysisType = request.getAnalysisType() != null ?
      request.getAnalysisType() : "comprehensive";
    String instruction = getAnalysisInstruction(analysisType, request.getI18n());
    String languagePrompt = "en".equals(request.getI18n()) ?
      "Please respond in English only." : "请使用中文回答。";
    StringBuilder sb = new StringBuilder();
    sb.append("You are a professional financial data analyst.\n");
    sb.append("Analysis focus: ").append(instruction).append("\n");
    sb.append(languagePrompt).append("\n\n");
    sb.append("Please provide:\n");
    sb.append("1. Clear and structured analysis\n");
    sb.append("2. Key observations from the data\n");
    sb.append("3. Potential implications or insights\n");
    sb.append("4. Recommendations or considerations (if applicable)");
    return sb.toString();
  }

  private String getAnalysisInstruction(String analysisType, String language) {
    if ("cn".equals(language)) {
      switch (analysisType) {
        case "trend":
          return "提供详细的趋势分析";
        case "volume":
          return "分析成交量模式";
        case "technical":
          return "进行技术分析";
        case "comprehensive":
        default:
          return "提供全面分析";
      }
    } else {
      switch (analysisType) {
        case "trend":
          return "Provide a detailed trend analysis";
        case "volume":
          return "Analyze the volume patterns";
        case "technical":
          return "Perform technical analysis";
        case "comprehensive":
        default:
          return "Provide a comprehensive analysis";
      }
    }
  }

  private String buildUserMessage(AIRequest request) {
    StringBuilder sb = new StringBuilder();
    sb.append("Here is the OHLCV data (").append(request.getData().size()).append(" periods):\n");
    sb.append("[");
    for (int i = 0; i < request.getData().size(); i++) {
      OHLCVData data = request.getData().get(i);
      if (i > 0) sb.append(",");
      sb.append(String.format(
        "{\"open\":%.2f,\"high\":%.2f,\"low\":%.2f,\"close\":%.2f,\"volume\":%.0f}",
        data.getOpen(), data.getHigh(), data.getLow(), data.getClose(), data.getVolume()
      ));
    }
    sb.append("]");
    if (request.getMessage() != null && !request.getMessage().trim().isEmpty()) {
      sb.append("\n\nMy specific question or request: ").append(request.getMessage());
    }
    return sb.toString();
  }

  private ResponseEntity<Map> sendRequest(String endpoint, String apiKey, Map<String, Object> request) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(apiKey);
    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
    return restTemplate.exchange(
      endpoint,
      HttpMethod.POST,
      entity,
      Map.class
    );
  }

  private String extractAnalysis(Map<String, Object> response) {
    if (response == null) {
      throw new IllegalStateException("AI response is empty");
    }
    if (response.containsKey("choices")) {
      @SuppressWarnings("unchecked")
      List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
      if (!choices.isEmpty()) {
        Map<String, Object> firstChoice = choices.get(0);
        if (firstChoice.containsKey("message")) {
          @SuppressWarnings("unchecked")
          Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
          return (String) message.get("content");
        }
      }
    }
    if (response.containsKey("output")) {
      @SuppressWarnings("unchecked")
      Map<String, Object> output = (Map<String, Object>) response.get("output");
      if (output.containsKey("text")) {
        return (String) output.get("text");
      }
    }
    throw new IllegalStateException("Unable to parse AI response: " + response);
  }
}
