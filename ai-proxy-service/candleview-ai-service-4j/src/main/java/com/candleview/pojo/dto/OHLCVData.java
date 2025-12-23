package com.candleview.pojo.dto;

import lombok.Data;

/**
 * @ClassName OHLCVData
 * @Description
 * @Author happyboy
 * @Date 2025/12/19 1:20
 * @Version 1.0
 */

@Data
public class OHLCVData {
  private double open;
  private double high;
  private double low;
  private double close;
  private double volume;
}
