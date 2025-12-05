import TopPanel, { TopPanelState } from ".";
import { MainChartIndicatorInfo, DEFAULT_MA, DEFAULT_EMA, DEFAULT_BOLLINGER, DEFAULT_ICHIMOKU, DEFAULT_DONCHIAN, DEFAULT_ENVELOPE, DEFAULT_VWAP, DEFAULT_HEATMAP, DEFAULT_MARKETPROFILE } from "../Indicators/MainChart/MainChartIndicatorInfo";
import { MainChartIndicatorType, SubChartIndicatorType } from "../types";
import { mainIndicators, mainChartMaps } from "./Config";

export function handleMainIndicatorToggle(topPanel: TopPanel, indicatorId: string) {
    var indicatorConfig = mainIndicators.find(ind => ind.id === indicatorId);
    if (!indicatorConfig) {
        indicatorConfig = mainChartMaps.find(ind => ind.id === indicatorId);
    }
    let mainChartIndicatorInfo: MainChartIndicatorInfo | null;
    switch (indicatorConfig?.type) {
        case MainChartIndicatorType.MA:
            mainChartIndicatorInfo = {
                ...DEFAULT_MA,
                nonce: Date.now()
            };
            break;
        case MainChartIndicatorType.EMA:
            mainChartIndicatorInfo = {
                ...DEFAULT_EMA,
                nonce: Date.now()
            };
            break;
        case MainChartIndicatorType.BOLLINGER:
            mainChartIndicatorInfo = {
                ...DEFAULT_BOLLINGER,
                nonce: Date.now()
            };
            break;
        case MainChartIndicatorType.ICHIMOKU:
            mainChartIndicatorInfo = {
                ...DEFAULT_ICHIMOKU,
                nonce: Date.now()
            };
            break;
        case MainChartIndicatorType.DONCHIAN:
            mainChartIndicatorInfo = {
                ...DEFAULT_DONCHIAN,
                nonce: Date.now()
            };
            break;
        case MainChartIndicatorType.ENVELOPE:
            mainChartIndicatorInfo = {
                ...DEFAULT_ENVELOPE,
                nonce: Date.now()
            };
            break;
        case MainChartIndicatorType.VWAP:
            mainChartIndicatorInfo = {
                ...DEFAULT_VWAP,
                nonce: Date.now()
            };
            break;
        case MainChartIndicatorType.HEATMAP:
            mainChartIndicatorInfo = {
                ...DEFAULT_HEATMAP,
                nonce: Date.now()
            };
            break;
        case MainChartIndicatorType.MARKETPROFILE:
            mainChartIndicatorInfo = {
                ...DEFAULT_MARKETPROFILE,
                nonce: Date.now()
            };
            break;
        default:
            mainChartIndicatorInfo = null;
            break;
    }
    if (!mainChartIndicatorInfo) { return; }
    topPanel.setState({ selectedMainIndicator: mainChartIndicatorInfo });
    topPanel.props.handleSelectedMainChartIndicator(mainChartIndicatorInfo);
};

export function handleSubChartIndicatorToggle(topPanel: TopPanel, indicatorType: SubChartIndicatorType) {
    topPanel.setState((prevState: TopPanelState) => {
        const isSelected = prevState.selectedSubChartIndicators.includes(indicatorType);
        let newSelectedSubChartIndicators: SubChartIndicatorType[];
        if (isSelected) {
            newSelectedSubChartIndicators = prevState.selectedSubChartIndicators.filter(
                type => type !== indicatorType
            );
        } else {
            newSelectedSubChartIndicators = [...prevState.selectedSubChartIndicators, indicatorType];
        }
        if (topPanel.props.handleSelectedSubChartIndicator) {
            topPanel.props.handleSelectedSubChartIndicator(newSelectedSubChartIndicators);
        }
        return {
            selectedSubChartIndicators: newSelectedSubChartIndicators
        };
    });
};