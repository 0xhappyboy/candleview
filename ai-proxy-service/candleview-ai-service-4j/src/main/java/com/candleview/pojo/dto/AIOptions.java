package com.candleview.pojo.dto;

import lombok.Data;

/**
 * @ClassName AIOptions
 * @Description
 * @Author happyboy
 * @Date 2025/12/19 2:05
 * @Version 1.0
 */

@Data
public class AIOptions {
  private Double temperature;
  private Integer maxTokens;
}
