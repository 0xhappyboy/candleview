// TopPanelState.ts
import { MainChartIndicatorInfo } from '../../Indicators/mainchart/MainChartIndicatorInfo';
import { MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from '../../types';

export interface TopPanelState {
    // Modal states
    isTimeframeModalOpen: boolean;
    isIndicatorModalOpen: boolean;
    isChartTypeModalOpen: boolean;
    isSubChartModalOpen: boolean;
    isTimezoneModalOpen: boolean;
    isTimeFormatModalOpen: boolean;
    isCloseTimeModalOpen: boolean;
    isTradingDayModalOpen: boolean;
    isAIModalOpen: boolean;
    isMobileMenuOpen: boolean;

    // Active states - 使用枚举
    activeTimeframe: TimeframeEnum;
    currentMainChartType: MainChartType;
    currentTimezone: TimezoneEnum;  // 改为 TimezoneEnum
    selectedSubChartIndicators: SubChartIndicatorType[];
    selectedMainChartIndicator: MainChartIndicatorInfo | null;

    // Search states
    mainIndicatorsSearch: string;
    timezoneSearch: string;
    subChartIndicatorsSearch: string;
    chartTypeSearch: string;
    aiSearch: string;

    // Selected states
    selectedMainIndicator: string | null;
    selectedChartMap: string | null;
    selectedSubIndicator: string | null;

    // Section expand states
    timeframeSections: {
        second: boolean;
        minute: boolean;
        hour: boolean;
        day: boolean;
        week: boolean;
        month: boolean;
    };
    indicatorSections: {
        technicalIndicators: boolean;
        chart: boolean;
        subChartIndicators: boolean;
    };
    aiSections: Record<string, boolean>;

    // Scroll states
    scrollButtonVisibility: {
        showTop: boolean;
        showBottom: boolean;
    };

    // Loading states
    isDataLoading: boolean;
    dataLoadProgress: number;
    loadError: string | null;
}

export const DEFAULT_TOP_PANEL_STATE: TopPanelState = {
    isTimeframeModalOpen: false,
    isIndicatorModalOpen: false,
    isChartTypeModalOpen: false,
    isSubChartModalOpen: false,
    isTimezoneModalOpen: false,
    isTimeFormatModalOpen: false,
    isCloseTimeModalOpen: false,
    isTradingDayModalOpen: false,
    isAIModalOpen: false,
    isMobileMenuOpen: false,

    activeTimeframe: TimeframeEnum.FIFTEEN_MINUTES,
    currentMainChartType: MainChartType.Candle,
    currentTimezone: TimezoneEnum.SHANGHAI,
    selectedSubChartIndicators: [],
    selectedMainChartIndicator: null,

    mainIndicatorsSearch: '',
    timezoneSearch: '',
    subChartIndicatorsSearch: '',
    chartTypeSearch: '',
    aiSearch: '',

    selectedMainIndicator: null,
    selectedChartMap: null,
    selectedSubIndicator: null,

    timeframeSections: {
        second: true,
        minute: true,
        hour: true,
        day: true,
        week: true,
        month: true
    },
    indicatorSections: {
        technicalIndicators: true,
        chart: true,
        subChartIndicators: true
    },
    aiSections: {},

    scrollButtonVisibility: {
        showTop: false,
        showBottom: false
    },

    isDataLoading: false,
    dataLoadProgress: 0,
    loadError: null
};