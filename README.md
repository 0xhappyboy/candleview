<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/logo/logo_imgtxt_dark_en.png">
    <source media="(prefers-color-scheme: light)" srcset="./assets/logo/logo_imgtxt_light_en.png">
    <img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/logo/logo_imgtxt_light_en.png" alt="Portal" width="300">
  </picture>
</p>
<h4 align="center">
A time-series data visualization and charting engine designed specifically for the financial industry.
</h4>
<p align="center">
  <a href="https://github.com/0xhappyboy/candleview/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-AGPL3.0-d1d1f6.svg?style=flat&labelColor=1C2C2E&color=BEC5C9&logo=googledocs&label=license&logoColor=BEC5C9" alt="License"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=flat&labelColor=1C2C2E&color=007ACC&logo=typescript&logoColor=white" alt="TypeScript"></a>
<a href="https://github.com/0xhappyboy/candleview/stargazers"><img src="https://img.shields.io/github/stars/0xhappyboy/candleview.svg?style=flat&labelColor=1C2C2E&color=FFD700&logo=github&logoColor=white&label=stars" alt="GitHub stars"></a>
<a href="https://github.com/0xhappyboy/candleview/issues"><img src="https://img.shields.io/github/issues/0xhappyboy/candleview.svg?style=flat&labelColor=1C2C2E&color=FF6B6B&logo=github&logoColor=white&label=issues" alt="GitHub issues"></a>
<a href="https://github.com/0xhappyboy/candleview/network/members"><img src="https://img.shields.io/github/forks/0xhappyboy/candleview.svg?style=flat&labelColor=1C2C2E&color=42A5F5&logo=github&logoColor=white&label=forks" alt="GitHub forks"></a>
<a href="https://www.npmjs.com/package/candleview"><img src="https://img.shields.io/npm/v/candleview.svg?style=flat&labelColor=1C2C2E&color=FF5722&logo=npm&logoColor=white&label=npm%20version" alt="npm version"></a>
<a href="https://github.com/0xhappyboy/candleview/releases"><img src="https://img.shields.io/github/v/tag/0xhappyboy/candleview.svg?style=flat&labelColor=1C2C2E&color=9C27B0&logo=github&logoColor=white&label=latest%20release" alt="GitHub release"></a> 
<a href="https://github.com/0xhappyboy/candleview/actions"><img src="https://img.shields.io/github/actions/workflow/status/0xhappyboy/candleview/release.yml?style=flat&labelColor=1C2C2E&color=4CAF50&logo=githubactions&logoColor=white&label=build" alt="Build Status"></a><a href="https://www.npmjs.com/package/candleview"><img src="https://img.shields.io/npm/dt/candleview?style=flat&labelColor=1C2C2E&color=00BCD4&logo=npm&logoColor=white&label=total%20downloads" alt="npm downloads"></a>
<a href="https://www.npmjs.com/package/candleview"><img src="https://img.shields.io/npm/dm/candleview?style=flat&labelColor=1C2C2E&color=00BCD4&logo=npm&logoColor=white&label=downloads/month" alt="npm downloads"></a>
<a href="https://www.npmjs.com/package/candleview"><img src="https://img.shields.io/npm/dw/candleview?style=flat&labelColor=1C2C2E&color=00BCD4&logo=npm&logoColor=white&label=downloads/week" alt="npm downloads"></a>
<a href="https://twitter.com/intent/follow?screen_name=candleview"><img src="https://img.shields.io/twitter/follow/candleview" alt="CandleView"" /></a>
</p>
<p align="center">
<a href="./README_zh-CN.md">简体中文</a> | <a href="./README.md">English</a>
</p>

## ⚙️ Install

```bash
npm i @candleview/core
```

```bash
yarn add @candleview/core
```

# 🌐 Link

| Website                                              | Website(CN)                                          | Emulator                                                         | Markets                                                     |
| ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| <a href="https://candleview.vercel.app/">Website</a> | <a href="https://www.candleview.cn/">Website(CN)</a> | <a href="https://candleview.vercel.app/application">Emulator</a> | <a href="https://candleview.vercel.app/markets">Markets</a> |

# 📚 Directory

| **directory**        | **describe**                                                                                                         |
| :------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **core**             | CandleView Engine Core.                                                                                              |
| **react**            | CandleView React Component.                                                                                          |
| **ai-proxy-service** | This is the scaffolding project for CandleView AI services, which you can use to develop AI services for CandleView. |
| **assets**           | Asset Directory.                                                                                                     |

## 🚀 Quick Start

```typescript
// 1. Create with container element
const chart = new CandleView({ container: document.getElementById("chart") });
// 2. Create with container selector
const chart = new CandleView({ containerSelector: "#chart" });
// 3. Create with element ID
const chart = new CandleView({ id: "chart" });
// 4. Create with parent element (auto creates container)
const chart = new CandleView({ parent: document.getElementById("wrapper") });
// 5. Create with parent selector (auto creates container)
const chart = new CandleView({ parentSelector: "#wrapper" });
```

### Basic Configuration

```typescript
const candleView = new CandleView({
  container: document.getElementById("chart"), // Container DOM element
  title: "AAPL - Daily Chart", // Chart title
  data: candleData, // Candlestick data points array
  theme: "dark", // Theme: "dark" | "light"
  locale: "en", // Language: "en" | "zh-cn"
  showTopPanel: true, // Show top toolbar panel
  showLeftPanel: true, // Show left toolbar panel
  chartType: MainChartType.Candle, // Main chart type, e.g. candlestick chart
  activeTimeframe: TimeframeEnum.ONE_HOUR, // Active time period, e.g. 1 hour
  currentTimezone: TimezoneEnum.NEW_YORK, // Current timezone
  onToolSelect: (tool) => {
    console.log("Tool selected:", tool);
  },
  onTimeframeChange: (timeframe) => {
    console.log("Timeframe changed:", timeframe);
  },
  onChartTypeChange: (type) => {
    console.log("Chart type changed:", type);
  },
  onMainChartIndicatorSelect: (indicator) => {
    console.log("Main chart indicator selected:", indicator);
  },
  onSubChartIndicatorSelect: (indicators) => {
    console.log("Sub-chart indicators selected:", indicators);
  },
  onThemeToggle: (theme) => {
    console.log("Theme toggled:", theme);
  },
  onCameraClick: () => {
    console.log("Screenshot button clicked");
  },
  onFullscreenClick: () => {
    console.log("Fullscreen button clicked");
  },
  onTimezoneSelect: (timezone) => {
    console.log("Timezone changed:", timezone);
  },
  onTimeframeChangeCallback: (candleView, timeframe) => {
    console.log("Timeframe changed (callback):", timeframe);
  },
});
```

### JavaScript

```typescript
const container = document.getElementById("chart");
const chart = new CandleView({ container, title: "BTC/USDT", data: klineData });
```

### React

```typescript
const containerRef = useRef<HTMLDivElement>(null);
useEffect(() => { if (containerRef.current) new CandleView({ container: containerRef.current }); }, []);
return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;

```

### Vue3

```typescript
const containerRef = ref<HTMLDivElement>(null);
onMounted(() => {
  if (containerRef.value) new CandleView({ container: containerRef.value });
});
```

```html
<div ref="containerRef" style="width:100%;height:500px"></div>
```

### Vue2

```typescript
mounted() { this.chart = new CandleView({ container: this.$refs.container }); },
```

```html
<div ref="container" style="width:100%;height:500px"></div>
```

## Real-Time Data Processing

```typescript
import { CandleView, ICandleViewDataPoint } from "candleview";
let lastClose = 50000;
let currentTime = Math.floor(Date.now() / 1000);
function generateNewDataPoint(): ICandleViewDataPoint {
  const changePercent = (Math.random() - 0.5) * 0.01;
  const newClose = lastClose * (1 + changePercent);
  const highLowRange = Math.abs(newClose - lastClose) * 0.5;
  const newPoint = {
    time: currentTime++,
    open: lastClose,
    high: Math.max(lastClose, newClose) + Math.random() * highLowRange,
    low: Math.min(lastClose, newClose) - Math.random() * highLowRange,
    close: newClose,
    volume: Math.random() * 1000 + 500,
  };

  lastClose = newClose;
  return newPoint;
}
const chart = new CandleView({
  container: document.getElementById("chart"),
  title: "BTC/USDT",
  data: initialData,
});
const interval = setInterval(() => {
  const newPoint = generateNewDataPoint();
  chart.updateData([newPoint]);
}, 1000);
```

<img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/real_time_data_demo.gif" alt="CandleView"  width="100%">

## Open the main chart technical indicators and the sub-chart technical indicators

```typescript
import {
  CandleView,
  MainChartIndicatorType,
  SubChartIndicatorType,
} from "candleview";

// 1. Initialize the chart
const candleView = new CandleView({
  container: document.getElementById("chart"),
  title: "BTC/USDT",
  data: candleData, // Array of candlestick data
  theme: "dark",
  locale: "en",
});

// ========== Main Chart Indicators ==========
// Open MA indicator (Moving Average)
candleView.openMainChartIndicator(MainChartIndicatorType.MA);
// Open EMA indicator (Exponential Moving Average)
candleView.openMainChartIndicator(MainChartIndicatorType.EMA);
// Open Bollinger Bands indicator
candleView.openMainChartIndicator(MainChartIndicatorType.BOLLINGER);
// Open VWAP indicator
candleView.openMainChartIndicator(MainChartIndicatorType.VWAP);
// Close MA indicator
candleView.closeMainChartIndicator(MainChartIndicatorType.MA);
// Close all main chart indicators
candleView.closeAllMainChartIndicators();
// Check if an indicator is enabled
const isMAEnabled = candleView.isMainChartIndicatorEnabled(
  MainChartIndicatorType.MA,
console.log("MA enabled:", isMAEnabled);
// Get all enabled main chart indicators
const enabledIndicators = candleView.getEnabledMainChartIndicators();
console.log("Enabled indicators:", enabledIndicators);
// ========== Sub Chart Indicators ==========
// Open RSI indicator (Relative Strength Index)
candleView.openSubChartIndicator(SubChartIndicatorType.RSI);
// Open MACD indicator
candleView.openSubChartIndicator(SubChartIndicatorType.MACD);
// Open Volume indicator
candleView.openSubChartIndicator(SubChartIndicatorType.VOLUME);
// Close RSI indicator
candleView.closeSubChartIndicator(SubChartIndicatorType.RSI);
// Close all sub chart indicators
candleView.closeAllSubChartIndicators();
// Check if an indicator is enabled
const isRSIEnabled = candleView.isSubChartIndicatorEnabled(
  SubChartIndicatorType.RSI,
);
// Get all enabled sub chart indicators
const enabledSubIndicators = candleView.getEnabledSubChartIndicators();
// ========== Open with Callbacks (for settings modal) ==========
candleView.openSubChartIndicator(
  SubChartIndicatorType.MACD,
  (type) => {
    // Callback when indicator is opened (e.g., to show settings panel)
    console.log("MACD opened, ready to show settings");
  },
  (type) => {
    // Callback when indicator is closed
    console.log("MACD closed");
  },
);
// ========== Destroy Chart ==========
candleView.destroy();
```

<img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/technical_indicators_demo.gif" alt="CandleView" width="100%">

## Static Mark

### Static Mark Interface parameters

```typescript
interface IStaticMarkOptions {
  textColor?: string; // Text color, default white
  backgroundColor?: string; // Background color, default red for Top, green for Bottom
  isCircular?: boolean; // Circular background, default true
  fontSize?: number; // Font size, default 9-11
  padding?: number; // Padding, default 3
  label?: string; // Label text for arrow marks
}
```

### Example

#### Add Single Text Mark

```typescript
import { CandleView, StaticMarkDirection, StaticMarkType } from "candleview";
// Create chart instance
const chart = new CandleView({
  container: document.getElementById("chart"),
  title: "BTC/USDT",
  theme: "dark",
  data: yourKlineData,
});
// Top text mark (red background)
chart.addTextMark(
  1704067200, // timestamp
  "📈 Resistance", // text content
  StaticMarkDirection.Top, // direction: Top
  {
    textColor: "#ffffff",
    backgroundColor: "#ff4444",
    isCircular: true,
    fontSize: 10,
    padding: 4,
  },
);
// Bottom text mark (green background)
chart.addTextMark(1704067300, "📉 Support", StaticMarkDirection.Bottom, {
  textColor: "#ffffff",
  backgroundColor: "#44ff44",
  isCircular: true,
  fontSize: 10,
  padding: 4,
});
```

#### Add Single Arrow Mark

```typescript
// Create chart instance
const chart = new CandleView({
  container: document.getElementById("chart"),
  title: "BTC/USDT",
  theme: "dark",
  data: yourKlineData,
});
// Top arrow (sell signal)
chart.addArrowMark(1704067400, StaticMarkDirection.Top, {
  label: "SELL",
  backgroundColor: "#ff0000",
});
// Bottom arrow (buy signal)
chart.addArrowMark(1704067500, StaticMarkDirection.Bottom, {
  label: "BUY",
  backgroundColor: "#00ff00",
});
```

#### Batch Add Text Marks

```typescript
// Create chart instance
const chart = new CandleView({
  container: document.getElementById("chart"),
  title: "BTC/USDT",
  theme: "dark",
  data: yourKlineData,
});
chart.addTextMarks([
  {
    time: 1704067600,
    text: "📊 Open",
    direction: StaticMarkDirection.Top,
    options: { backgroundColor: "#ff8800", textColor: "#ffffff" },
  },
  {
    time: 1704067700,
    text: "💰 Add",
    direction: StaticMarkDirection.Bottom,
    options: {
      backgroundColor: "#00ff88",
      textColor: "#ffffff",
      isCircular: true,
    },
  },
  {
    time: 1704067800,
    text: "🎯 Take Profit",
    direction: StaticMarkDirection.Top,
    options: { backgroundColor: "#44aaff", textColor: "#ffffff", fontSize: 12 },
  },
]);
```

#### Batch Add Arrow Marks

```typescript
// Create chart instance
const chart = new CandleView({
  container: document.getElementById("chart"),
  title: "BTC/USDT",
  theme: "dark",
  data: yourKlineData,
});
chart.addArrowMarks([
  {
    time: 1704067900,
    direction: StaticMarkDirection.Top,
    options: { label: "🔻 Sell" },
  },
  {
    time: 1704068000,
    direction: StaticMarkDirection.Bottom,
    options: { label: "🔺 Buy" },
  },
  {
    time: 1704068100,
    direction: StaticMarkDirection.Top,
    options: { label: "⚠️ Caution" },
  },
]);
```

#### Mixed Marks (Text + Arrow)

```typescript
// Create chart instance
const chart = new CandleView({
  container: document.getElementById("chart"),
  title: "BTC/USDT",
  theme: "dark",
  data: yourKlineData,
});
chart.addStaticMarks([
  {
    time: 1704068200,
    text: "📉 Strong Support",
    direction: StaticMarkDirection.Bottom,
    type: StaticMarkType.Text,
    options: { backgroundColor: "#00cc88", textColor: "#ffffff" },
  },
  {
    time: 1704068300,
    text: "",
    direction: StaticMarkDirection.Top,
    type: StaticMarkType.Arrow,
    options: { backgroundColor: "#ff5566", label: "Resistance" },
  },
  {
    time: 1704068400,
    text: "🏆 Target Hit",
    direction: StaticMarkDirection.Top,
    type: StaticMarkType.Text,
    options: {
      backgroundColor: "#ff44aa",
      textColor: "#ffffff",
      fontSize: 11,
      isCircular: false,
      padding: 6,
    },
  },
]);
```

#### Manage Marks

```typescript
// Create chart instance
const chart = new CandleView({
  container: document.getElementById("chart"),
  title: "BTC/USDT",
  theme: "dark",
  data: yourKlineData,
});
// Get mark count
const count = chart.getStaticMarkCount();
console.log(`Current mark count: ${count}`);
// Clear all marks
chart.clearAllStaticMarks();
```

<img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/static_mark_demo.gif" alt="CandleView"  width="100%">

## Multi Panel Performance

<img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/candleview-multi-panel-2.gif" alt="CandleView" Multi Panel" width="100%">

## Technical Indicators In The Sub Chart.

<img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/sub-chart.gif" width="100%">

## Preview

### Draw Graphics

#### Fibonacci

<table>
  <tr>
    <td align="left">
    <h4>Arc</h4>
    </td>
    <td align="left">
    <h4>Channel</h4>
    </td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/fibonacci/fibonacci-arc.gif" width="100%"></td>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/fibonacci/fibonacci-channel.gif" width="100%"></td>
  </tr>
   <tr>
    <td align="left">
    <h4>Fan</h4>
    </td>
    <td align="left">
    <h4>Price Extension</h4>
    </td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/fibonacci/fibonacci-fan.gif" width="100%"></td>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/fibonacci/fibonacci-price-extension.gif" width="100%"></td>
  </tr>
   <tr>
    <td align="left">
    <h4>Spiral</h4>
    </td>
    <td align="left">
    <h4>Time Expansion</h4>
    </td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/fibonacci/fibonacci-spiral.gif" width="100%"></td>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/fibonacci/fibonacci-time-expansion.gif" width="100%"></td>
  </tr>
   <tr>
    <td align="left">
    <h4>Wedge</h4>
    </td>
    <td align="left">
    <h4>Retracement</h4>
    </td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/fibonacci/fibonacci-wedge.gif" width="100%"></td>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/fibonacci/fibonacci-retracement.gif" width="100%"></td>
  </tr>
   <tr>
   <td align="left">
    <h4>Time Zoon</h4>
    </td>
      <td align="left">
    <h4>Circle</h4>
    </td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/fibonacci/fibonacci-time-zoon.gif" width="100%"></td>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/fibonacci/fibonacci-circle.gif" width="100%"></td>
  </tr>
</table>

#### Gann

<table>
  <tr>
    <td align="left">
    <h4>Box</h4>
    </td>
    <td align="left">
    <h4>Fan</h4>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/gann/gann-box.gif" width="100%"></td>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/gann/gann-fan.gif" width="100%"></td>
  </tr>
  <tr>
     <td align="left">
    <h4>Rectangle</h4>
    </td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/gann//gann-rectangle.gif" width="100%"></td>
  </tr>
</table>

#### Mark

<img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/mark.gif" width="100%">

### Theme

<table>
  <tr>
    <td align="left">
    <h4>Dark</h4>
    </td>
    <td align="left">
    <h4>Light</h4>
    </td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/preview_theme_dark.png" width="400"></td>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/preview_theme_light.png" width="400"></td>
  </tr>
</table>

### I18n

<table>
  <tr>
    <td align="left">
    <h4>En</h4>
    </td>
    <td align="left">
    <h4>zh-CN</h4>
    </td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/preview_i18n_en.png" width="400"></td>
    <td align="center"><img src="https://raw.githubusercontent.com/0xhappyboy/candleview/main/assets/preview_i18n_zh-CN.png" width="400"></td>
  </tr>
</table>

## 🔧 Configuration Options

### ⏰ Supported Timeframes

#### Second-based Timeframes

| Value   | Display Name       | Description |
| ------- | ------------------ | ----------- |
| `'1S'`  | 1 秒 / 1 Second    | 1 second    |
| `'5S'`  | 5 秒 / 5 Seconds   | 5 seconds   |
| `'15S'` | 15 秒 / 15 Seconds | 15 seconds  |
| `'30S'` | 30 秒 / 30 Seconds | 30 seconds  |

#### Minute-based Timeframes

| Value   | Display Name       | Description |
| ------- | ------------------ | ----------- |
| `'1M'`  | 1 分 / 1 Minute    | 1 minute    |
| `'3M'`  | 3 分 / 3 Minutes   | 3 minutes   |
| `'5M'`  | 5 分 / 5 Minutes   | 5 minutes   |
| `'15M'` | 15 分 / 15 Minutes | 15 minutes  |
| `'30M'` | 30 分 / 30 Minutes | 30 minutes  |
| `'45M'` | 45 分 / 45 Minutes | 45 minutes  |

#### Hour-based Timeframes

| Value   | Display Name       | Description |
| ------- | ------------------ | ----------- |
| `'1H'`  | 1 小时 / 1 Hour    | 1 hour      |
| `'2H'`  | 2 小时 / 2 Hours   | 2 hours     |
| `'3H'`  | 3 小时 / 3 Hours   | 3 hours     |
| `'4H'`  | 4 小时 / 4 Hours   | 4 hours     |
| `'6H'`  | 6 小时 / 6 Hours   | 6 hours     |
| `'8H'`  | 8 小时 / 8 Hours   | 8 hours     |
| `'12H'` | 12 小时 / 12 Hours | 12 hours    |

#### Day-based Timeframes

| Value  | Display Name  | Description |
| ------ | ------------- | ----------- |
| `'1D'` | 1 日 / 1 Day  | 1 day       |
| `'3D'` | 3 日 / 3 Days | 3 days      |

#### Week-based Timeframes

| Value  | Display Name   | Description |
| ------ | -------------- | ----------- |
| `'1W'` | 1 周 / 1 Week  | 1 week      |
| `'2W'` | 2 周 / 2 Weeks | 2 weeks     |

#### Month-based Timeframes

| Value    | Display Name    | Description |
| -------- | --------------- | ----------- |
| `'1MON'` | 1 月 / 1 Month  | 1 month     |
| `'3MON'` | 3 月 / 3 Months | 3 months    |
| `'6MON'` | 6 月 / 6 Months | 6 months    |

### 🌍 Supported Timezones

#### Americas

| Timezone ID             | Display Name         | UTC Offset  | Major Cities               |
| ----------------------- | -------------------- | ----------- | -------------------------- |
| `'America/New_York'`    | 纽约 / New York      | UTC-5/UTC-4 | New York, Washington DC    |
| `'America/Chicago'`     | 芝加哥 / Chicago     | UTC-6/UTC-5 | Chicago, Dallas            |
| `'America/Denver'`      | 丹佛 / Denver        | UTC-7/UTC-6 | Denver, Phoenix            |
| `'America/Los_Angeles'` | 洛杉矶 / Los Angeles | UTC-8/UTC-7 | Los Angeles, San Francisco |
| `'America/Toronto'`     | 多伦多 / Toronto     | UTC-5/UTC-4 | Toronto, Montreal          |

#### Europe

| Timezone ID       | Display Name         | UTC Offset  | Major Cities         |
| ----------------- | -------------------- | ----------- | -------------------- |
| `'Europe/London'` | 伦敦 / London        | UTC+0/UTC+1 | London, Dublin       |
| `'Europe/Paris'`  | 巴黎 / Paris         | UTC+1/UTC+2 | Paris, Berlin        |
| `'Europe/Berlin'` | 法兰克福 / Frankfurt | UTC+1/UTC+2 | Frankfurt, Amsterdam |
| `'Europe/Zurich'` | 苏黎世 / Zurich      | UTC+1/UTC+2 | Zurich, Vienna       |
| `'Europe/Moscow'` | 莫斯科 / Moscow      | UTC+3       | Moscow, Istanbul     |

#### Asia

| Timezone ID        | Display Name       | UTC Offset | Major Cities            |
| ------------------ | ------------------ | ---------- | ----------------------- |
| `'Asia/Dubai'`     | 迪拜 / Dubai       | UTC+4      | Dubai, Abu Dhabi        |
| `'Asia/Karachi'`   | 卡拉奇 / Karachi   | UTC+5      | Karachi, Lahore         |
| `'Asia/Kolkata'`   | 加尔各答 / Kolkata | UTC+5:30   | Kolkata, Mumbai         |
| `'Asia/Shanghai'`  | 上海 / Shanghai    | UTC+8      | Shanghai, Beijing       |
| `'Asia/Hong_Kong'` | 香港 / Hong Kong   | UTC+8      | Hong Kong, Macau        |
| `'Asia/Singapore'` | 新加坡 / Singapore | UTC+8      | Singapore, Kuala Lumpur |
| `'Asia/Tokyo'`     | 东京 / Tokyo       | UTC+9      | Tokyo, Seoul            |
| `'Asia/Seoul'`     | 首尔 / Seoul       | UTC+9      | Seoul, Pyongyang        |

#### Pacific

| Timezone ID          | Display Name      | UTC Offset    | Major Cities         |
| -------------------- | ----------------- | ------------- | -------------------- |
| `'Australia/Sydney'` | 悉尼 / Sydney     | UTC+10/UTC+11 | Sydney, Melbourne    |
| `'Pacific/Auckland'` | 奥克兰 / Auckland | UTC+12/UTC+13 | Auckland, Wellington |

#### Global

| Timezone ID | Display Name | UTC Offset | Description                |
| ----------- | ------------ | ---------- | -------------------------- |
| `'UTC'`     | UTC / UTC    | UTC+0      | Coordinated Universal Time |

## 🌟 Core Features

### 📈 Supported Technical Indicators

#### Main Chart Indicators

- Moving Average (MA)
- Exponential Moving Average (EMA)
- Bollinger Bands
- Ichimoku Cloud
- Donchian Channel
- Envelope
- Volume Weighted Average Price (VWAP)
- Heat Map
- Market Profile

#### Sub Chart Indicators

- Relative Strength Index (RSI)
- Moving Average Convergence Divergence (MACD)
- Volume
- Parabolic SAR
- KDJ Indicator
- Average True Range (ATR)
- Stochastic Oscillator
- Commodity Channel Index (CCI)
- Bollinger Bands Width
- Average Directional Index (ADX)
- On Balance Volume (OBV)

### 🎨 Supported Drawing Tools

#### Basic Tools

- Pencil, Pen, Brush, Marker Pen, Eraser
- Line Segment, Horizontal Line, Vertical Line
- Arrow Line, Thick Arrow Line

#### Channel Tools

- Parallel Channel
- Linear Regression Channel
- Equidistant Channel
- Disjoint Channel

#### Fibonacci Tools

- Fibonacci Retracement
- Fibonacci Time Zones
- Fibonacci Arc
- Fibonacci Circle
- Fibonacci Spiral
- Fibonacci Fan
- Fibonacci Channel
- Fibonacci Price Extension
- Fibonacci Time Extension

#### Gann Tools

- Gann Fan
- Gann Box
- Gann Rectangle

#### Pattern Tools

- Andrew Pitchfork
- Enhanced Andrew Pitchfork
- Schiff Pitchfork
- XABCD Pattern
- Head and Shoulders
- ABCD Pattern
- Triangle ABCD Pattern

#### Elliott Wave

- Elliott Impulse Wave
- Elliott Corrective Wave
- Elliott Triangle
- Elliott Double Combination
- Elliott Triple Combination

#### Geometric Shapes

- Rectangle, Circle, Ellipse, Triangle
- Sector, Curve, Double Curve

#### Annotation Tools

- Text Annotation, Price Note
- Bubble Box, Pin, Signpost
- Price Label, Flag Mark
- Image Insertion

#### Range Tools

- Time Range, Price Range
- Time-Price Range
- Heat Map

#### Trading Tools

- Long Position, Short Position
- Mock K-line

### ⏰ Supported Timeframes

#### Second-based

- 1s, 5s, 15s, 30s

#### Minute-based

- 1m, 3m, 5m, 15m
- 30m, 45m

#### Hour-based

- 1h, 2h, 3h, 4h
- 6h, 8h, 12h

#### Day-based

- 1d, 3d

#### Week-based

- 1w, 2w

#### Month-based

- 1M, 3M, 6M

### 🌍 Supported Timezones

- New York (America/New_York)
- Chicago (America/Chicago)
- Denver (America/Denver)
- Los Angeles (America/Los_Angeles)
- Toronto (America/Toronto)
- London (Europe/London)
- Paris (Europe/Paris)
- Frankfurt (Europe/Berlin)
- Zurich (Europe/Zurich)
- Moscow (Europe/Moscow)
- Dubai (Asia/Dubai)
- Karachi (Asia/Karachi)
- Kolkata (Asia/Kolkata)
- Shanghai (Asia/Shanghai)
- Hong Kong (Asia/Hong_Kong)
- Singapore (Asia/Singapore)
- Tokyo (Asia/Tokyo)
- Seoul (Asia/Seoul)
- Sydney (Australia/Sydney)
- Auckland (Pacific/Auckland)
- UTC

### 🎯 Supported Chart Types

- Candlestick Chart
- Hollow Candlestick Chart
- Bar Chart (OHLC)
- BaseLine Chart
- Line Chart
- Area Chart
- Step Line Chart
- Heikin Ashi Chart
- Histogram Chart
- Line Break Chart
- Mountain Chart
- Baseline Area Chart
- High Low Chart
- HLCArea Chart
