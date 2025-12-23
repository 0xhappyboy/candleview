package com.candleview.pojo.dto;

import lombok.Data;

import java.util.List;

/**
 * @ClassName AIRequest
 * @Description
 * @Author happyboy
 * @Date 2025/12/19 2:51
 * @Version 1.0
 */

@Data
public class AIRequest {
  private String provider;
  private List<OHLCVData> data;
  private String i18n;
  private String modelType;
  private String analysisType;
  private String message;
  private AIOptions options;
}
