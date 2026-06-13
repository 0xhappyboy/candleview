
import { MainChartIndicatorInfo } from '../../Indicators/mainchart/MainChartIndicatorInfo';
import { MainChartType, SubChartIndicatorType, TimeframeEnum, TimezoneEnum } from '../../types';

export interface TopPanelState {
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
    activeTimeframe: TimeframeEnum;
    currentMainChartType: MainChartType;
    currentTimezone: TimezoneEnum;  
    // selectedSubChartIndicators: SubChartIndicatorType[];
    selectedMainChartIndicator: MainChartIndicatorInfo | null;
    mainIndicatorsSearch: string;
    timezoneSearch: string;
    subChartIndicatorsSearch: string;
    chartTypeSearch: string;
    aiSearch: string;
    selectedMainIndicator: string | null;
    selectedChartMap: string | null;
    selectedSubIndicator: string | null;
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
    scrollButtonVisibility: {
        showTop: boolean;
        showBottom: boolean;
    };
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
    // selectedSubChartIndicators: [],
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