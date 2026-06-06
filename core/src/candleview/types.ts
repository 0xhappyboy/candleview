import { LeftPanelState } from "../components/leftpanel/LeftPanelState";
import { TopPanelState } from "../components/toppanel/TopPanelState";
import { I18n } from "../i18n";
import { MainChartIndicatorInfo } from "../Indicators/mainchart/MainChartIndicatorInfo";
import { Theme } from "../theme";
import { ICandleViewDataPoint, MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from "../types";

export interface CandleViewConfig {
    container?: HTMLElement;
    containerSelector?: string;
    parent?: HTMLElement;
    parentSelector?: string;
    id?: string;
    title?: string;
    data?: ICandleViewDataPoint[];
    theme?: 'light' | 'dark';
    locale?: 'en' | 'zh-cn';
    showTopPanel?: boolean;
    showLeftPanel?: boolean;
    chartType?: MainChartType;
    activeTimeframe?: string;
    currentTimezone?: string;
    onToolSelect?: (tool: string) => void;
    onTimeframeChange?: (timeframe: string) => void;
    onChartTypeChange?: (type: MainChartType) => void;
    onMainChartIndicatorSelect?: (indicator: MainChartIndicatorInfo) => void;
    onSubChartIndicatorSelect?: (indicators: SubChartIndicatorType[]) => void;
    onThemeToggle?: (theme: string) => void;
    onCameraClick?: () => void;
    onFullscreenClick?: () => void;
    onTimezoneSelect?: (timezone: string) => void;
}

export interface CoreState {
    config: CandleViewConfig;
    container: HTMLElement;
    isOwnContainer: boolean;
    chartType: MainChartType;
    theme: Theme;
    currentTheme: any;
    i18n: I18n;
    topPanelState: TopPanelState;
    leftPanelState: LeftPanelState;
    rawData: ICandleViewDataPoint[];
    currentTimeframe: TimeframeEnum;
    currentTimezone: TimezoneEnum;
    rootEl: HTMLElement | null;
    chartContainerEl: HTMLElement | null;
}