import { TopPanel } from './TopPanel';
import { MainChartIndicatorType, SubChartIndicatorType } from '../../types';
import { getMainIndicators, getMainChartMaps } from './Config';
import { DEFAULT_BOLLINGER, DEFAULT_DONCHIAN, DEFAULT_EMA, DEFAULT_ENVELOPE, DEFAULT_HEATMAP, DEFAULT_ICHIMOKU, DEFAULT_MA, DEFAULT_MARKETPROFILE, DEFAULT_VWAP, MainChartIndicatorInfo } from '../../Indicators/MainChart/MainChartIndicatorInfo';

export function handleMainIndicatorToggle(topPanel: TopPanel, indicatorId: string) {
    const { i18n } = topPanel.options;
    const mainIndicatorsList = getMainIndicators(i18n);
    const mainChartMapsList = getMainChartMaps(i18n);
    let indicatorConfig = mainIndicatorsList.find(ind => ind.id === indicatorId);
    if (!indicatorConfig) {
        indicatorConfig = mainChartMapsList.find(ind => ind.id === indicatorId);
    }
    let mainChartIndicatorInfo: MainChartIndicatorInfo | null;
    switch (indicatorConfig?.type) {
        case MainChartIndicatorType.MA:
            mainChartIndicatorInfo = { ...DEFAULT_MA, nonce: Date.now() };
            break;
        case MainChartIndicatorType.EMA:
            mainChartIndicatorInfo = { ...DEFAULT_EMA, nonce: Date.now() };
            break;
        case MainChartIndicatorType.BOLLINGER:
            mainChartIndicatorInfo = { ...DEFAULT_BOLLINGER, nonce: Date.now() };
            break;
        case MainChartIndicatorType.ICHIMOKU:
            mainChartIndicatorInfo = { ...DEFAULT_ICHIMOKU, nonce: Date.now() };
            break;
        case MainChartIndicatorType.DONCHIAN:
            mainChartIndicatorInfo = { ...DEFAULT_DONCHIAN, nonce: Date.now() };
            break;
        case MainChartIndicatorType.ENVELOPE:
            mainChartIndicatorInfo = { ...DEFAULT_ENVELOPE, nonce: Date.now() };
            break;
        case MainChartIndicatorType.VWAP:
            mainChartIndicatorInfo = { ...DEFAULT_VWAP, nonce: Date.now() };
            break;
        case MainChartIndicatorType.HEATMAP:
            mainChartIndicatorInfo = { ...DEFAULT_HEATMAP, nonce: Date.now() };
            break;
        case MainChartIndicatorType.MARKETPROFILE:
            mainChartIndicatorInfo = { ...DEFAULT_MARKETPROFILE, nonce: Date.now() };
            break;
        default:
            mainChartIndicatorInfo = null;
            break;
    }
    if (!mainChartIndicatorInfo) return;
    topPanel.options.onMainChartIndicatorSelect?.(mainChartIndicatorInfo);
}

export function handleSubChartIndicatorToggle(topPanel: TopPanel, indicatorType: SubChartIndicatorType) {
    const selected = topPanel.getSelectedSubChartIndicators();
    const isSelected = selected.includes(indicatorType);
    let newSelected: SubChartIndicatorType[];
    if (isSelected) {
        newSelected = selected.filter(type => type !== indicatorType);
    } else {
        newSelected = [...selected, indicatorType];
    }
    topPanel.setSelectedSubChartIndicators(newSelected);
    topPanel.options.onSubChartIndicatorSelect?.(newSelected);
}