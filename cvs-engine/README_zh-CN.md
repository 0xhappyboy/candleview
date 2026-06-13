<h1 align="center">
    Candleview脚本引擎
</h1>
<h4 align="center">
一个DSL引擎用于解析CandleView脚本，将JavaScript转换为CandleView的图形控制逻辑.
</h4>
<p align="center">
<a href="./README_zh-CN.md">简体中文</a> | <a href="./README.md">English</a>
</p>

## ⚙️ 安装

```bash
npm i @candleview/cvs-engine
```

```bash
yarn add @candleview/cvs-engine
```

## DSL 内置函数

### 数据获取

- getClose() - 获取最新收盘价，返回数值
- getOpen() - 获取最新开盘价，返回数值
- getHigh() - 获取最新最高价，返回数值
- getLow() - 获取最新最低价，返回数值
- getVolume() - 获取最新成交量，返回数值
- getTime() - 获取最新时间戳，返回数值
- getCloseAt(offset) - 获取历史收盘价，offset=0为最新，返回数值
- getOpenAt(offset) - 获取历史开盘价，返回数值
- getHighAt(offset) - 获取历史最高价，返回数值
- getLowAt(offset) - 获取历史最低价，返回数值
- getVolumeAt(offset) - 获取历史成交量，返回数值
- getBarCount() - 获取K线总数，返回数值

### 技术指标

- SMA(source, period) - 简单移动平均线，返回数值
- EMA(source, period) - 指数移动平均线，返回数值
- WMA(source, period) - 加权移动平均线，返回数值
- SMMA(source, period) - 平滑移动平均线，返回数值
- RSI(source, period) - 相对强弱指数，默认周期14，返回数值
- MACD(source, fast, slow, signal) - 指数平滑异同移动平均线，返回{macd, signal, histogram}
- BOLL(source, period, stdDev) - 布林带，返回{upper, middle, lower}
- KDJ(highs, lows, closes, period) - 随机指标，返回{k, d, j}
- ATR(highs, lows, closes, period) - 平均真实波幅，返回数值
- CCI(highs, lows, closes, period) - 顺势指标，返回数值
- ADX(highs, lows, closes, period) - 平均趋向指数，返回数值
- OBV(closes, volumes) - 能量潮指标，返回数值
- SAR(highs, lows, step, maxStep) - 抛物线转向，返回数值数组
- BBWIDTH(source, period, stdDev) - 布林带宽度，返回数值

### 图表标记

- addTextMark(time, text, direction, options) - 添加文字标记，direction: 'up'上|'down'下
- addArrowUp(time, label, color) - 添加上箭头标记
- addArrowDown(time, label, color) - 添加下箭头标记
- clearAllMarks() - 清除所有标记

### 内置指标控制

- openIndicator(name, params) - 打开内置指标
- closeIndicator(name) - 关闭内置指标
- closeAllIndicators() - 关闭所有内置指标

### 自定义指标

- plotMain(config) - 绘制自定义主图指标
- plotSub(config) - 绘制自定义副图指标
- updateMain(id) - 更新自定义主图指标
- updateSub(id) - 更新自定义副图指标
- removeMain(id) - 删除自定义主图指标
- removeSub(id) - 删除自定义副图指标
- clearAllMain() - 清除所有自定义主图指标
- clearAllSub() - 清除所有自定义副图指标

## 自定义技术图形

### 自定义主图技术图形

#### plotMain(config)

绘制自定义主图指标（叠加在K线图上）

**Config 参数:**

| 字段       | 类型     | 说明                            |
| ---------- | -------- | ------------------------------- |
| id         | string   | 指标唯一标识，用于后续更新/删除 |
| calculator | function | 计算函数，每个K线调用一次       |
| options    | object   | 可选，样式配置                  |

**calculator 参数:**

| 参数   | 类型   | 说明                    |
| ------ | ------ | ----------------------- |
| index  | number | K线索引（倒序，0=最新） |
| open   | number | 当前K线开盘价           |
| high   | number | 当前K线最高价           |
| low    | number | 当前K线最低价           |
| close  | number | 当前K线收盘价           |
| volume | number | 当前K线成交量           |

**options 配置:**

| 字段         | 类型                        | 默认值    | 说明         |
| ------------ | --------------------------- | --------- | ------------ |
| name         | string                      | -         | 指标显示名称 |
| color        | string                      | '#FF6B6B' | 线条颜色     |
| width        | number                      | 2         | 线条宽度     |
| style        | 'solid'\|'dashed'\|'dotted' | 'solid'   | 线条样式     |
| visible      | boolean                     | true      | 是否可见     |
| priceScaleId | string                      | 'right'   | 价格轴ID     |

**示例:**

```javascript
plotMain({
  id: "MA20",
  calculator: (index, open, high, low, close, volume) => {
    if (getBarCount() < 20) return null;
    let closes = [];
    for (let i = 0; i < 20; i++) closes.push(getCloseAt(i));
    return SMA(closes, 20);
  },
  options: {
    name: "MA20",
    color: "#FF6B6B",
    width: 2,
    style: "solid",
  },
});
```

#### plotSub(config)

绘制自定义副图指标（独立面板显示）

**Config 参数:**

| 字段       | 类型     | 说明                            |
| ---------- | -------- | ------------------------------- |
| id         | string   | 指标唯一标识，用于后续更新/删除 |
| calculator | function | 计算函数，每个K线调用一次       |
| options    | object   | 可选，样式配置                  |

**calculator 参数:**

| 参数   | 类型   | 说明                    |
| ------ | ------ | ----------------------- |
| index  | number | K线索引（倒序，0=最新） |
| open   | number | 当前K线开盘价           |
| high   | number | 当前K线最高价           |
| low    | number | 当前K线最低价           |
| close  | number | 当前K线收盘价           |
| volume | number | 当前K线成交量           |

**options 配置:**

| 字段    | 类型                            | 默认值    | 说明         |
| ------- | ------------------------------- | --------- | ------------ |
| name    | string                          | -         | 指标显示名称 |
| color   | string                          | '#FF6B6B' | 线条颜色     |
| width   | number                          | 2         | 线条宽度     |
| type    | 'line' \| 'histogram' \| 'area' | 'line'    | 图表类型     |
| visible | boolean                         | true      | 是否可见     |

**示例:**

```javascript
plotSub({
  id: "RSI_14",
  calculator: (index, open, high, low, close, volume) => {
    if (getBarCount() < 15) return null;
    let closes = [];
    for (let i = 0; i < 15; i++) closes.push(getCloseAt(i));
    return RSI(closes, 14);
  },
  options: {
    name: "RSI(14)",
    color: "#FF6B6B",
    width: 2,
    type: "line",
  },
});
```
