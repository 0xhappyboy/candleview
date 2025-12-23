package com.candleview.controller;

import com.candleview.pojo.dto.AIRequest;
import com.candleview.pojo.dto.AIResponse;
import com.candleview.service.IAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;


/**
 * @ClassName AIController
 * @Description
 * @Author happyboy
 * @Date 2025/12/19 0:10
 * @Version 1.0
 */

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIController {

  private final IAIService aiService;

  @PostMapping("/analyze")
  public ResponseEntity<AIResponse> analyzeOHLCV(@RequestBody AIRequest request) {
    try {
      AIResponse response = aiService.analyzeOHLCV(request);
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      AIResponse errorResponse = new AIResponse();
      errorResponse.setSuccess(false);
      errorResponse.setError(e.getMessage());
      errorResponse.setProvider(request != null ? request.getProvider() : "unknown");
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
  }

  @GetMapping("/providers")
  public ResponseEntity<Map<String, Boolean>> getAvailableProviders() {
    Map<String, Boolean> providers = new HashMap<>();
    providers.put("openai", aiService.testConnection("openai"));
    providers.put("aliyun", aiService.testConnection("aliyun"));
    providers.put("deepseek", aiService.testConnection("deepseek"));
    return ResponseEntity.ok(providers);
  }

  @GetMapping("/health")
  public ResponseEntity<String> healthCheck() {
    return ResponseEntity.ok("AI Service is running");
  }

  @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
  public ResponseEntity<Void> handleOptions() {
    return ResponseEntity.ok()
      .header("Access-Control-Allow-Origin", "*")
      .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      .header("Access-Control-Allow-Headers", "Content-Type, Authorization")
      .header("Access-Control-Max-Age", "86400")
      .build();
  }
}
