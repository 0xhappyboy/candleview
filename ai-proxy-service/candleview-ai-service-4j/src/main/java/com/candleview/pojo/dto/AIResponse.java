package com.candleview.pojo.dto;

import lombok.Data;

/**
 * @ClassName AIResponse
 * @Description
 * @Author happyboy
 * @Date 2025/12/19 2:50
 * @Version 1.0
 */

@Data
public class AIResponse {
  private boolean success;
  private String provider;
  private String model;
  private String analysis;
  private Long duration;
  private String error;
  private Metadata metadata;
}
