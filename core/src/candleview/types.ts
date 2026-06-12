import { MainChartIndicatorInfo } from "../Indicators/mainchart/MainChartIndicatorInfo";
import { ICandleViewDataPoint, MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from "../types";
import { CandleView } from "./CandleView";

export interface CandleViewConfig {
    container?: HTMLElement;
    containerSelector?: string;
    parent?: HTMLElement;
    parentSelector?: string;
    id?: string;
    title: string;
    data?: ICandleViewDataPoint[];
    theme?: 'light' | 'dark';
    locale?: 'en' | 'zh-cn';
    technologyPanel?: boolean;
    drawingPanel?: boolean;
    chartType?: MainChartType;
    timeframe?: TimeframeEnum;
    timezone?: TimezoneEnum;
    onToolSelect?: (tool: string) => void;
    onTimeframeChange?: (timeframe: TimeframeEnum) => void;
    onChartTypeChange?: (type: MainChartType) => void;
    onMainChartIndicatorSelect?: (indicator: MainChartIndicatorInfo) => void;
    onSubChartIndicatorSelect?: (indicators: SubChartIndicatorType[]) => void;
    onThemeToggle?: (theme: string) => void;
    onCameraClick?: () => void;
    onFullscreenClick?: () => void;
    onTimezoneSelect?: (timezone: TimezoneEnum) => void;
    onTimeframeChangeCallback?: (candleView: CandleView, timeframe: TimeframeEnum) => void;
}