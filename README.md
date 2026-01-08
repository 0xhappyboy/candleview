<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/logo/logo_imgtxt_dark_en.png">
    <source media="(prefers-color-scheme: light)" srcset="./assets/logo/logo_imgtxt_light_en.png">
    <img src="./assets/logo/logo_imgtxt_dark_en.png" alt="Portal" width="300">
  </picture>
</p>
<h4 align="center">
An AI-driven financial time-series data visualization and rendering engine.
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
<a href="https://twitter.com/intent/follow?screen_name=candleview"><img src="https://img.shields.io/twitter/follow/candleview" alt="CandleView" /></a>
</p>
<p align="center">
<a href="./README_zh-CN.md">简体中文</a> | <a href="./README.md">English</a>
</p>

# ⚙️ Install

```bash
npm i candleview
```

```bash
yarn add candleview
```

# 🌐 Link

| Website                                              | Website(CN)                                          | Emulator                                                         | Markets                                                     |
| ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| <a href="https://candleview.vercel.app/">Website</a> | <a href="https://www.candleview.cn/">Website(CN)</a> | <a href="https://candleview.vercel.app/application">Emulator</a> | <a href="https://candleview.vercel.app/markets">Markets</a> |

# 📚 Directory

| **directory**        | **describe**                                                                                                         |
| :------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **core**             | CandleView Engine Core.                                                                                              |
| **website**          | Global official website.                                                                                             |
| **ai-proxy-service** | This is the scaffolding project for CandleView AI services, which you can use to develop AI services for CandleView. |
| **docs**             | Documents.                                                                                                           |
| **assets**           | Asset Directory.                                                                                                     |

# 🚀 Quick Start

```typescript
import { CandleView } from "./CandleView";

const App = () => {
  return (
    <CandleView
      data={candleData}
      title="Test"
      theme={theme}
      i18n={i18n}
      markData={markData}
      height={800}
      leftpanel={true}
      toppanel={true}
      terminal={true}
    />
  );
};
```

# Implement custom timeframe logic.

```typescript
import { CandleView } from "./CandleView";

const App = () => {
  return (
    <CandleView
      data={candleData}
      title="Test"
      theme={theme}
      i18n={i18n}
      markData={a}
      height={800}
      leftpanel={true}
      toppanel={true}
      terminal={true}
      ai={true}
      timezone="America/New_York"
      timeframe="1m"
      isCloseInternalTimeFrameCalculation={true} // the internal timeframe calculation logic has been disabled.
      timeframeCallbacks={{
        "1m": () => {
          // Implement a custom data source switching mechanism for a 1m timeframe.
        },
        "5m": () => {
          // Implement a custom data source switching mechanism for a 5m timeframe.
        },
        "1D": () => {
          // Implement a custom data source switching mechanism for a 1D timeframe.
        },
        "1H": () => {
          // Implement a custom data source switching mechanism for a 1H timeframe.
        },
        "15m": () => {
          // Implement a custom data source switching mechanism for a 15m timeframe.
        },
        "30m": () => {
          // Implement a custom data source switching mechanism for a 30m timeframe.
        },
        "4H": () => {
          // Implement a custom data source switching mechanism for a 4H timeframe.
        },
      }}
      aiconfigs={[
        {
          proxyUrl: "http://localhost:3000/api",
          brand: "aliyun",
          model: "qwen-turbo",
        },
        {
          proxyUrl: "http://localhost:3000/api",
          brand: "deepseek",
          model: "deepseek-chat",
        },
        {
          proxyUrl: "http://localhost:3000/api",
          brand: "deepseek",
          model: "deepseek-chat-lite",
        },
      ]}
    />
  );
};
```

# AI Features

<img src="./assets/ai/ai-data-analysis.gif" alt="CandleView AI" width="100%">

## Supported Brands

- **OpenAI**: GPT series models
- **Aliyun (Alibaba Cloud)**: Tongyi Qianwen and other models
- **DeepSeek**: DeepSeek series models
- **Claude**: Anthropic models
- **Gemini**: Google models

## Function Types

- **Chart Analysis**: AI analyzes current chart data, providing technical analysis, trend judgments, etc.
- **Predictive Analysis**: AI performs price predictions and risk assessments based on historical data

## How to Use

1. **Enable AI Panel**: Select the desired AI function from the left panel (e.g., "OpenAI Chart Analysis")
2. **Select Model**: Choose an appropriate model from the available list in the AI chat box
3. **Configure API Key**: Pre-configure API keys and models for respective brands in the `aiconfigs` property
4. **Start Conversation**: Input questions or analysis requests to receive professional financial analysis from AI

## Support Model

### Aliyun

```
qwen-turbo、qwen-plus、qwen-max、qwen-max-longcontext、qwen2.5-0.5b、qwen2.5-0.5b-instruct、qwen2.5-7b、qwen2.5-7b-instruct、qwen2.5-14b、qwen2.5-14b-instruct、qwen2.5-32b、qwen2.5-32b-instruct、qwen2.5-72b、qwen2.5-72b-instruct、qwen2.5-coder、qwen2.5-coder-7b、qwen2.5-coder-14b、qwen2.5-coder-32b、qwen-vl-lite、qwen-vl-plus、qwen-vl-max、qwen-audio-turbo、qwen-audio-chat、qwen-math-7b、llama2-7b-chat-v2、baichuan2-7b-chat-v1、qwen-financial、qwen-financial-14b、qwen-financial-32b、qwen-medical、qwen-medical-14b、qwen-medical-32b、qwen-omni、qwen-omni-pro
```

### DeepSeek

```
deepseek-chat、deepseek-chat-lite、deepseek-chat-pro、deepseek-chat-max、deepseek-coder、deepseek-coder-lite、deepseek-coder-pro、deepseek-math、deepseek-math-pro、deepseek-reasoner、deepseek-reasoner-pro、deepseek-vision、deepseek-vision-pro、deepseek-finance、deepseek-law、deepseek-medical、deepseek-research、deepseek-omni、deepseek-omni-pro、deepseek-llm、deepseek-llm-67b、deepseek-llm-131b
```

### OpenAI

```
gpt-4、gpt-4-0314、gpt-4-0613、gpt-4-32k、gpt-4-32k-0314、gpt-4-32k-0613、gpt-4-turbo、gpt-4-turbo-preview、gpt-4-turbo-2024-04-09、gpt-4o、gpt-4o-2024-05-13、gpt-4o-mini、gpt-4o-mini-2024-07-18、gpt-3.5-turbo、gpt-3.5-turbo-0125、gpt-3.5-turbo-1106、gpt-3.5-turbo-instruct、gpt-3.5-turbo-16k、gpt-3.5-turbo-16k-0613、davinci-002、babbage-002、text-davinci-003、text-davinci-002、text-davinci-001、text-curie-001、text-babbage-001、text-ada-001、text-embedding-ada-002、text-embedding-3-small、text-embedding-3-large、dall-e-2、dall-e-3、whisper-1、tts-1、tts-1-hd、text-moderation-latest、text-moderation-stable
```

## API Integration

The system integrates the following SDKs:

- `ohlcv-ai` library provides official API calls for OpenAI, Aliyun, DeepSeek, and others.

## Configuration Example

```javascript
<CandleView
  data={candleData}
  title="Test"
  theme={theme}
  i18n={i18n}
  markData={a}
  height={800}
  leftpanel={true}
  toppanel={true}
  terminal={true}
  ai={true}
  aiconfigs={[
    // Simultaneously configure different models from multiple AI brands.
    {
      proxyUrl: "http://0.0.0.0/api",
      brand: "aliyun",
      model: "qwen-turbo",
    },
    {
      proxyUrl: "http://0.0.0.0/api",
      brand: "aliyun",
      model: "qwen-omni",
    },
    {
      proxyUrl: "http://0.0.0.0/api",
      brand: "deepseek",
      model: "gpt-4",
    },
    {
      proxyUrl: "http://0.0.0.0/api",
      brand: "openai",
      model: "gpt-3.5-turbo",
    },
  ]}
/>
```

## Proxy Interface Standard

### 💡 Services that must be implemented in the domain configured by proxyUrl.

```
/analyzeOHLCV - A service specifically designed for processing OHLCV data.
```

# Supports price event scripts

<img src="./assets/price_event.gif" alt="CandleView Supports price event scripts" width="100%">

# Multi Panel Performance

<img src="./assets/candleview-multi-panel-2.gif" alt="CandleView Multi Panel" width="100%">

# Performance in AI conversations

<img src="./assets/ai-dialog.gif" alt="CandleView AI Dialog" width="100%">

# 💻 Command System

<img src="./assets/command-system.gif" width="100%">

## Supported Commands

### Basic Commands

| Command              | Description                                | Example      |
| -------------------- | ------------------------------------------ | ------------ |
| `clear` / `cls`      | Clear terminal output                      | `clear`      |
| `help`               | Show all available commands and indicators | `help`       |
| `theme [light dark]` | Switch theme                               | `theme dark` |
| `history`            | Show recently executed command history     | `history`    |

### Indicator Operations

| Command             | Description                                 | Example     |
| ------------------- | ------------------------------------------- | ----------- |
| `open [indicator]`  | Open specified main or sub chart indicator  | `open ma`   |
| `close [indicator]` | Close specified main or sub chart indicator | `close rsi` |

### Main Chart Indicators

- **ma** - Moving Average
- **ema** - Exponential Moving Average
- **bollinger** - Bollinger Bands
- **ichimoku** - Ichimoku Cloud
- **donchian** - Donchian Channel
- **envelope** - Envelope
- **vwap** - Volume Weighted Average Price
- **heatmap** - Heatmap
- **marketprofile** - Market Profile

### Sub Chart Indicators

- **rsi** - Relative Strength Index
- **macd** - Moving Average Convergence Divergence
- **volume** - Volume
- **sar** - Parabolic SAR
- **kdj** - KDJ (Stochastic Oscillator)
- **atr** - Average True Range
- **stochastic** - Stochastic Oscillator
- **cci** - Commodity Channel Index
- **bbwidth** - Bollinger Bands Width
- **adx** - Average Directional Index
- **obv** - On Balance Volume

### Keyboard Shortcuts

| Shortcut   | Function                               |
| ---------- | -------------------------------------- |
| `↑` / `↓`  | Navigate command history               |
| `Tab`      | Auto-complete current suggestion       |
| `Enter`    | Execute command or confirm completion  |
| `Ctrl + L` | Clear input field                      |
| `Ctrl + C` | Cancel current operation               |
| `Esc`      | Clear input field and hide suggestions |

### Usage Examples

```bash
$ open ma # Open Moving Average indicator
$ close bollinger # Close Bollinger Bands indicator
$ theme light # Switch to light theme
$ history # View recent command history
```

# Technical Indicators In The Sub Chart.

<img src="./assets/sub-chart.gif" width="100%">

# Preview

## Draw Graphics

### Fibonacci

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
    <td align="center"><img src="./assets/fibonacci/fibonacci-arc.gif" width="100%"></td>
    <td align="center"><img src="./assets/fibonacci/fibonacci-channel.gif" width="100%"></td>
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
    <td align="center"><img src="./assets/fibonacci/fibonacci-fan.gif" width="100%"></td>
    <td align="center"><img src="./assets/fibonacci/fibonacci-price-extension.gif" width="100%"></td>
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
    <td align="center"><img src="./assets/fibonacci/fibonacci-spiral.gif" width="100%"></td>
    <td align="center"><img src="./assets/fibonacci/fibonacci-time-expansion.gif" width="100%"></td>
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
    <td align="center"><img src="./assets/fibonacci/fibonacci-wedge.gif" width="100%"></td>
    <td align="center"><img src="./assets/fibonacci/fibonacci-retracement.gif" width="100%"></td>
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
    <td align="center"><img src="./assets/fibonacci/fibonacci-time-zoon.gif" width="100%"></td>
    <td align="center"><img src="./assets/fibonacci/fibonacci-circle.gif" width="100%"></td>
  </tr>
</table>

### Gann

<table>
  <tr>
    <td align="left">
    <h4>Box</h4>
    </td>
    <td align="left">
    <h4>Fan</h4>
  </tr>
  <tr>
    <td align="center"><img src="./assets/gann/gann-box.gif" width="100%"></td>
    <td align="center"><img src="./assets/gann/gann-fan.gif" width="100%"></td>
  </tr>
  <tr>
     <td align="left">
    <h4>Rectangle</h4>
    </td>
  </tr>
  <tr>
    <td align="center"><img src="./assets/gann//gann-rectangle.gif" width="100%"></td>
  </tr>
</table>

### Mark

<img src="./assets/mark.gif" width="100%">

## Theme

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
    <td align="center"><img src="./assets/preview_theme_dark.png" width="400"></td>
    <td align="center"><img src="./assets/preview_theme_light.png" width="400"></td>
  </tr>
</table>

## I18n

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
    <td align="center"><img src="./assets/preview_i18n_en.png" width="400"></td>
    <td align="center"><img src="./assets/preview_i18n_zh-CN.png" width="400"></td>
  </tr>
</table>

# 🔧 Configuration Options

## Props

| Parameter                 | Type                                                                                                     | Default           | Description                              | Required |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------- | -------- |
| `theme`                   | `'dark' \| 'light'`                                                                                      | `'dark'`          | Theme mode                               | No       |
| `i18n`                    | `'en' \| 'zh-cn'`                                                                                        | `'zh-cn'`         | Language setting                         | No       |
| `height`                  | `number \| string`                                                                                       | `500`             | Chart height (px or percentage)          | No       |
| `title`                   | `string`                                                                                                 | `''`              | Chart title displayed on the chart       | Yes      |
| `showToolbar`             | `boolean`                                                                                                | `true`            | Show top toolbar                         | No       |
| `showLeftPanel`           | `boolean`                                                                                                | `true`            | Show left drawing tools panel            | No       |
| `showTopPanel`            | `boolean`                                                                                                | `true`            | Show top settings panel                  | No       |
| `showIndicators`          | `boolean`                                                                                                | `true`            | Show indicators panel                    | No       |
| `timeframe`               | `string`                                                                                                 | `'1d'`            | Chart timeframe (e.g., '1m', '1h', '1d') | No       |
| `timezone`                | `string`                                                                                                 | `'Asia/Shanghai'` | Timezone for data display                | No       |
| `data`                    | `ICandleViewDataPoint[]`                                                                                 | `[]`              | K-line data array                        | No       |
| `url`                     | `string`                                                                                                 | `''`              | URL to fetch data from                   | No       |
| `markData`                | `IStaticMarkData[]`                                                                                      | `[]`              | Pre-drawn marks data                     | No       |
| `handleScreenshotCapture` | `(imageData: { dataUrl: string; blob: Blob; width: number; height: number; timestamp: number }) => void` | `undefined`       | Callback for screenshot capture          | No       |

## ⏰ Supported Timeframes

### Second-based Timeframes

| Value   | Display Name       | Description |
| ------- | ------------------ | ----------- |
| `'1S'`  | 1 秒 / 1 Second    | 1 second    |
| `'5S'`  | 5 秒 / 5 Seconds   | 5 seconds   |
| `'15S'` | 15 秒 / 15 Seconds | 15 seconds  |
| `'30S'` | 30 秒 / 30 Seconds | 30 seconds  |

### Minute-based Timeframes

| Value   | Display Name       | Description |
| ------- | ------------------ | ----------- |
| `'1M'`  | 1 分 / 1 Minute    | 1 minute    |
| `'3M'`  | 3 分 / 3 Minutes   | 3 minutes   |
| `'5M'`  | 5 分 / 5 Minutes   | 5 minutes   |
| `'15M'` | 15 分 / 15 Minutes | 15 minutes  |
| `'30M'` | 30 分 / 30 Minutes | 30 minutes  |
| `'45M'` | 45 分 / 45 Minutes | 45 minutes  |

### Hour-based Timeframes

| Value   | Display Name       | Description |
| ------- | ------------------ | ----------- |
| `'1H'`  | 1 小时 / 1 Hour    | 1 hour      |
| `'2H'`  | 2 小时 / 2 Hours   | 2 hours     |
| `'3H'`  | 3 小时 / 3 Hours   | 3 hours     |
| `'4H'`  | 4 小时 / 4 Hours   | 4 hours     |
| `'6H'`  | 6 小时 / 6 Hours   | 6 hours     |
| `'8H'`  | 8 小时 / 8 Hours   | 8 hours     |
| `'12H'` | 12 小时 / 12 Hours | 12 hours    |

### Day-based Timeframes

| Value  | Display Name  | Description |
| ------ | ------------- | ----------- |
| `'1D'` | 1 日 / 1 Day  | 1 day       |
| `'3D'` | 3 日 / 3 Days | 3 days      |

### Week-based Timeframes

| Value  | Display Name   | Description |
| ------ | -------------- | ----------- |
| `'1W'` | 1 周 / 1 Week  | 1 week      |
| `'2W'` | 2 周 / 2 Weeks | 2 weeks     |

### Month-based Timeframes

| Value    | Display Name    | Description |
| -------- | --------------- | ----------- |
| `'1MON'` | 1 月 / 1 Month  | 1 month     |
| `'3MON'` | 3 月 / 3 Months | 3 months    |
| `'6MON'` | 6 月 / 6 Months | 6 months    |

## 🌍 Supported Timezones

### Americas

| Timezone ID             | Display Name         | UTC Offset  | Major Cities               |
| ----------------------- | -------------------- | ----------- | -------------------------- |
| `'America/New_York'`    | 纽约 / New York      | UTC-5/UTC-4 | New York, Washington DC    |
| `'America/Chicago'`     | 芝加哥 / Chicago     | UTC-6/UTC-5 | Chicago, Dallas            |
| `'America/Denver'`      | 丹佛 / Denver        | UTC-7/UTC-6 | Denver, Phoenix            |
| `'America/Los_Angeles'` | 洛杉矶 / Los Angeles | UTC-8/UTC-7 | Los Angeles, San Francisco |
| `'America/Toronto'`     | 多伦多 / Toronto     | UTC-5/UTC-4 | Toronto, Montreal          |

### Europe

| Timezone ID       | Display Name         | UTC Offset  | Major Cities         |
| ----------------- | -------------------- | ----------- | -------------------- |
| `'Europe/London'` | 伦敦 / London        | UTC+0/UTC+1 | London, Dublin       |
| `'Europe/Paris'`  | 巴黎 / Paris         | UTC+1/UTC+2 | Paris, Berlin        |
| `'Europe/Berlin'` | 法兰克福 / Frankfurt | UTC+1/UTC+2 | Frankfurt, Amsterdam |
| `'Europe/Zurich'` | 苏黎世 / Zurich      | UTC+1/UTC+2 | Zurich, Vienna       |
| `'Europe/Moscow'` | 莫斯科 / Moscow      | UTC+3       | Moscow, Istanbul     |

### Asia

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

### Pacific

| Timezone ID          | Display Name      | UTC Offset    | Major Cities         |
| -------------------- | ----------------- | ------------- | -------------------- |
| `'Australia/Sydney'` | 悉尼 / Sydney     | UTC+10/UTC+11 | Sydney, Melbourne    |
| `'Pacific/Auckland'` | 奥克兰 / Auckland | UTC+12/UTC+13 | Auckland, Wellington |

### Global

| Timezone ID | Display Name | UTC Offset | Description                |
| ----------- | ------------ | ---------- | -------------------------- |
| `'UTC'`     | UTC / UTC    | UTC+0      | Coordinated Universal Time |

## 📄 Data structure

```typescript
interface ICandleViewDataPoint {
  time: number; // timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface IStaticMarkData {
  time: number;
  type: string;
  data: {
    direction: string;
    text: string;
    fontSize?: number;
    textColor?: string;
    backgroundColor?: string;
    isCircular?: boolean;
    padding?: number;
  }[];
}
```

# 🌟 Core Features

## 📈 Supported Technical Indicators

### Main Chart Indicators

- Moving Average (MA)
- Exponential Moving Average (EMA)
- Bollinger Bands
- Ichimoku Cloud
- Donchian Channel
- Envelope
- Volume Weighted Average Price (VWAP)
- Heat Map
- Market Profile

### Sub Chart Indicators

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

## 🎨 Supported Drawing Tools

### Basic Tools

- Pencil, Pen, Brush, Marker Pen, Eraser
- Line Segment, Horizontal Line, Vertical Line
- Arrow Line, Thick Arrow Line

### Channel Tools

- Parallel Channel
- Linear Regression Channel
- Equidistant Channel
- Disjoint Channel

### Fibonacci Tools

- Fibonacci Retracement
- Fibonacci Time Zones
- Fibonacci Arc
- Fibonacci Circle
- Fibonacci Spiral
- Fibonacci Fan
- Fibonacci Channel
- Fibonacci Price Extension
- Fibonacci Time Extension

### Gann Tools

- Gann Fan
- Gann Box
- Gann Rectangle

### Pattern Tools

- Andrew Pitchfork
- Enhanced Andrew Pitchfork
- Schiff Pitchfork
- XABCD Pattern
- Head and Shoulders
- ABCD Pattern
- Triangle ABCD Pattern

### Elliott Wave

- Elliott Impulse Wave
- Elliott Corrective Wave
- Elliott Triangle
- Elliott Double Combination
- Elliott Triple Combination

### Geometric Shapes

- Rectangle, Circle, Ellipse, Triangle
- Sector, Curve, Double Curve

### Annotation Tools

- Text Annotation, Price Note
- Bubble Box, Pin, Signpost
- Price Label, Flag Mark
- Image Insertion

### Range Tools

- Time Range, Price Range
- Time-Price Range
- Heat Map

### Trading Tools

- Long Position, Short Position
- Mock K-line

## ⏰ Supported Timeframes

### Second-based

- 1s, 5s, 15s, 30s

### Minute-based

- 1m, 3m, 5m, 15m
- 30m, 45m

### Hour-based

- 1h, 2h, 3h, 4h
- 6h, 8h, 12h

### Day-based

- 1d, 3d

### Week-based

- 1w, 2w

### Month-based

- 1M, 3M, 6M

## 🌍 Supported Timezones

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

## 🎯 Supported Chart Types

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
