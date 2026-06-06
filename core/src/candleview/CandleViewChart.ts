import { CoreState } from './types';
import { CandleViewData } from './CandleViewData';
import { Chart } from '../chart/Chart';
import { CandleViewBrushHint } from './CandleViewBrushHint';
import { IIndicatorInfo } from '../Indicators/subchart/IIndicator';
import { I18n } from '../i18n';
import { Theme } from '../theme';

export class CandleViewChart {
    private state: CoreState;
    private chart: Chart | null = null;
    private dataManager: CandleViewData;
    private brushManager: CandleViewBrushHint;

    constructor(state: CoreState, dataManager: CandleViewData, brushManager: CandleViewBrushHint) {
        this.state = state;
        this.dataManager = dataManager;
        this.brushManager = brushManager;
    }

    public init(): void {
        if (this.chart) {
            console.warn('[CandleView] Chart already initialized, skipping');
            return;
        }

        const chartContainerEl = this.state.chartContainerEl;
        if (!chartContainerEl) return;

        const preprocessedData = this.dataManager.getPreprocessedData() || this.dataManager.preprocessData(this.state.config.data || []);

        this.chart = new Chart({
            container: chartContainerEl,
            data: this.state.config.data || [],
            theme: this.state.theme,
            chartType: this.state.chartType,
            preprocessedData: preprocessedData,
            i18n: this.state.i18n,
            onExitBrushMode: () => {
                this.brushManager.hide();
            },
            onCloseDrawing: () => {
                this.state.config.onToolSelect?.('');
            },
            onToggleOHLC: () => { },
            onOpenIndicatorsModal: () => { },
            onRemoveIndicator: (type) => { this.chart?.removeMainChartIndicator(type); },
            onToggleIndicator: (type) => { this.chart?.toggleIndicatorVisibility(type); },
            onEditIndicatorParams: (id, params) => { this.chart?.updateIndicatorParams(id, params); },
            onOpenIndicatorSettings: (indicator) => { this.chart?.openMainChartIndicatorsModal(indicator); },
            onMainChartIndicatorConfirm: (indicator) => { this.chart?.addOrUpdateMainChartIndicator(indicator); },
            onSubChartIndicatorConfirm: (params: IIndicatorInfo[]) => {
                if (this.chart?.currentSubChartType) {
                    this.chart?.chartPanesManager?.updateSettingsBySubChartIndicatorType(
                        this.chart.data, params, this.chart.currentSubChartType
                    );
                }
            },
        });

        if (this.chart) {
            this.chart.currentTheme = this.state.currentTheme;
        }
    }

    public getChart(): Chart | null { return this.chart; }
    public updateTheme(theme: Theme): void { this.chart?.updateTheme(theme); }
    public updateI18n(i18n: I18n): void { this.chart?.updateI18n(i18n); }

    public destroy(): void {
        this.chart?.destroy();
        this.chart = null;
    }
}