export interface I18n {
    mainChartIndicators: string;
    subChartIndicators: string;
    searchIndicators: string;
    theme: string;
    light: string;
    dark: string;
    timeframeSections: {
        second: string;
        minute: string;
        hour: string;
        day: string;
        week: string;
        month: string;
    };
    chartTypes: {
        candle: string;
        line: string;
        area: string;
        baseline: string;
        hollowCandle: string;
        heikinAshi: string;
        column: string;
        lineWithMarkers: string;
        stepLine: string;
    };
    toolbarButtons: {
        hint: string;
        replay: string;
        fullScreen: string;
        screenshot: string;
        contrast: string;
    };
    indicators: {
        ma: string;
        ema: string;
        bollinger: string;
        ichimoku: string;
        donchian: string;
        envelope: string;
        vwap: string;
    };
}

export const EN: I18n = {
    mainChartIndicators: "Main Chart Indicators",
    subChartIndicators: "Sub Chart Indicators",
    searchIndicators: "Search indicators...",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    timeframeSections: {
        second: "Second",
        minute: "Minute",
        hour: "Hour",
        day: "Day",
        week: "Week",
        month: "Month"
    },
    chartTypes: {
        candle: "Candlestick",
        line: "Line",
        area: "Area",
        baseline: "Baseline",
        hollowCandle: "Hollow Candle",
        heikinAshi: "Heikin Ashi",
        column: "Column",
        lineWithMarkers: "Line with Markers",
        stepLine: "Step Line"
    },
    toolbarButtons: {
        hint: "Hint",
        replay: "Replay",
        fullScreen: "Full Screen",
        screenshot: "Screenshot",
        contrast: "Contrast"
    },
    indicators: {
        ma: "Moving Average",
        ema: "Exponential Moving Average",
        bollinger: "Bollinger Bands",
        ichimoku: "Ichimoku Cloud",
        donchian: "Donchian Channel",
        envelope: "Envelope",
        vwap: "VWAP"
    }
}

export const zhCN: I18n = {
    mainChartIndicators: "主图指标",
    subChartIndicators: "副图指标",
    searchIndicators: "搜索指标...",
    theme: "主题",
    light: "浅色",
    dark: "深色",
    timeframeSections: {
        second: "秒",
        minute: "分钟",
        hour: "小时",
        day: "天",
        week: "周",
        month: "月"
    },
    chartTypes: {
        candle: "蜡烛图",
        line: "线图",
        area: "面积图",
        baseline: "基线图",
        hollowCandle: "空心蜡烛图",
        heikinAshi: "平均K线图",
        column: "柱状图",
        lineWithMarkers: "带标记线图",
        stepLine: "阶梯线图"
    },
    toolbarButtons: {
        hint: "提示",
        replay: "回放",
        fullScreen: "全屏",
        screenshot: "截图",
        contrast: "对比"
    },
    indicators: {
        ma: "移动平均线",
        ema: "指数移动平均线",
        bollinger: "布林带",
        ichimoku: "一目均衡表",
        donchian: "唐奇安通道",
        envelope: "包络线",
        vwap: "成交量加权平均价"
    }
}