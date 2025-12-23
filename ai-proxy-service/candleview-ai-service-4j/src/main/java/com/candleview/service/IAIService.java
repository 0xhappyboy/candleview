package com.candleview.service;


import com.candleview.pojo.dto.AIRequest;
import com.candleview.pojo.dto.AIResponse;


/**
 * @ClassName AIServiceImpl
 * @Description
 * @Author happyboy
 * @Date 2025/12/18 23:08
 * @Version 1.0
 */

public interface IAIService {
  AIResponse analyzeOHLCV(AIRequest request);

  boolean testConnection(String provider);
}
