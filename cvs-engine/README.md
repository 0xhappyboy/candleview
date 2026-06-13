<h1 align="center">
    Candleview Script Engine
</h1>
<h4 align="center">
The DSL engine is used to parse the CandleView scripts, translating JavaScript into the graphical control logic of the CandleView.
</h4>
<p align="center">
<a href="./README_zh-CN.md">简体中文</a> | <a href="./README.md">English</a>
</p>

## ⚙️ Install

```bash
npm i @candleview/cvs-engine
```

```bash
yarn add @candleview/cvs-engine
```

## DSL Built-in Functions

### Data Access

- getClose() - Latest close price, returns number
- getOpen() - Latest open price, returns number
- getHigh() - Latest high price, returns number
- getLow() - Latest low price, returns number
- getVolume() - Latest volume, returns number
- getTime() - Latest timestamp, returns number
- getCloseAt(offset) - Historical close price, offset 0=latest, returns number
- getOpenAt(offset) - Historical open price, returns number
- getHighAt(offset) - Historical high price, returns number
- getLowAt(offset) - Historical low price, returns number
- getVolumeAt(offset) - Historical volume, returns number
- getBarCount() - Total bar count, returns number

### Technical Indicators

- SMA(source, period) - Simple moving average, returns number
- EMA(source, period) - Exponential moving average, returns number
- WMA(source, period) - Weighted moving average, returns number
- SMMA(source, period) - Smoothed moving average, returns number
- RSI(source, period) - Relative strength index, period default 14, returns number
- MACD(source, fast, slow, signal) - MACD, returns {macd, signal, histogram}
- BOLL(source, period, stdDev) - Bollinger Bands, returns {upper, middle, lower}
- KDJ(highs, lows, closes, period) - KDJ indicator, returns {k, d, j}
- ATR(highs, lows, closes, period) - Average true range, returns number
- CCI(highs, lows, closes, period) - Commodity channel index, returns number
- ADX(highs, lows, closes, period) - Average directional index, returns number
- OBV(closes, volumes) - On-balance volume, returns number
- SAR(highs, lows, step, maxStep) - Parabolic SAR, returns number[]
- BBWIDTH(source, period, stdDev) - Bollinger band width, returns number

### Chart Markers

- addTextMark(time, text, direction, options) - Add text marker, direction: 'up'|'down'
- addArrowUp(time, label, color) - Add up arrow marker
- addArrowDown(time, label, color) - Add down arrow marker
- clearAllMarks() - Clear all markers

### Built-in Indicators Control

- openIndicator(name, params) - Open built-in indicator
- closeIndicator(name) - Close built-in indicator
- closeAllIndicators() - Close all built-in indicators

### Custom Indicators

- plotMain(config) - Plot custom main chart indicator
- plotSub(config) - Plot custom sub chart indicator
- updateMain(id) - Update custom main indicator
- updateSub(id) - Update custom sub indicator
- removeMain(id) - Remove custom main indicator
- removeSub(id) - Remove custom sub indicator
- clearAllMain() - Clear all custom main indicators
- clearAllSub() - Clear all custom sub indicators

## Custom Technical Graphics

### Custom Main Chart Technical Graphics

#### plotMain(config)

Draws a custom main chart indicator (overlay on the candlestick chart)

**Config Parameters:**

| Field      | Type     | Description                                                 |
| ---------- | -------- | ----------------------------------------------------------- |
| id         | string   | Unique identifier for the indicator, used for update/remove |
| calculator | function | Calculation function, called once per candlestick           |
| options    | object   | Optional, style configuration                               |

**calculator Parameters:**

| Parameter | Type   | Description                                   |
| --------- | ------ | --------------------------------------------- |
| index     | number | Candlestick index (reverse order, 0 = latest) |
| open      | number | Current candlestick open price                |
| high      | number | Current candlestick high price                |
| low       | number | Current candlestick low price                 |
| close     | number | Current candlestick close price               |
| volume    | number | Current candlestick volume                    |

**options Configuration:**

| Field        | Type                        | Default   | Description            |
| ------------ | --------------------------- | --------- | ---------------------- |
| name         | string                      | -         | Indicator display name |
| color        | string                      | '#FF6B6B' | Line color             |
| width        | number                      | 2         | Line width             |
| style        | 'solid'\|'dashed'\|'dotted' | 'solid'   | Line style             |
| visible      | boolean                     | true      | Visibility             |
| priceScaleId | string                      | 'right'   | Price scale ID         |

**Example:**

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

Draws a custom sub chart indicator (independent panel)

**Config Parameters:**

| Field      | Type     | Description                                                 |
| ---------- | -------- | ----------------------------------------------------------- |
| id         | string   | Unique identifier for the indicator, used for update/remove |
| calculator | function | Calculation function, called once per candlestick           |
| options    | object   | Optional, style configuration                               |

**calculator Parameters:**

| Parameter | Type   | Description                                   |
| --------- | ------ | --------------------------------------------- |
| index     | number | Candlestick index (reverse order, 0 = latest) |
| open      | number | Current candlestick open price                |
| high      | number | Current candlestick high price                |
| low       | number | Current candlestick low price                 |
| close     | number | Current candlestick close price               |
| volume    | number | Current candlestick volume                    |

**options Configuration:**

| Field   | Type                            | Default   | Description            |
| ------- | ------------------------------- | --------- | ---------------------- |
| name    | string                          | -         | Indicator display name |
| color   | string                          | '#FF6B6B' | Line color             |
| width   | number                          | 2         | Line width             |
| type    | 'line' \| 'histogram' \| 'area' | 'line'    | Chart type             |
| visible | boolean                         | true      | Visibility             |

**Example:**

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
