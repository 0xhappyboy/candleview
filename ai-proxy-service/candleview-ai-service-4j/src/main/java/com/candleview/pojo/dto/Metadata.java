package com.candleview.pojo.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * @ClassName Metadata
 * @Description
 * @Author happyboy
 * @Date 2025/12/19 2:53
 * @Version 1.0
 */

@Data
public class Metadata {
  private int periodCount;
  private String language;
  private String analysisType;
  private LocalDateTime timestamp;

  public Metadata() {
    this.timestamp = LocalDateTime.now();
  }
}
