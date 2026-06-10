import { Chart } from '../chart/Chart';
import { Dark, Light, Theme } from '../theme';
import { I18n } from '../i18n';
import { MainChartType } from '../types';
import { DataPreprocessResult } from '../DataPreprocessor';
import { LoaderManager } from '../LoaderManager';

export class CandleViewChart {
    private chart: Chart | null = null;
    private container: HTMLElement;
    private theme: Theme;
    private i18n: I18n;
    private chartType: MainChartType;
    private title: string;
    private loader: LoaderManager | null = null;

    constructor(container: HTMLElement, theme: Theme, i18n: I18n, chartType: MainChartType, title: string) {
        this.container = container;
        this.theme = theme;
        this.i18n = i18n;
        this.chartType = chartType;
        this.title = title;
    }

    public showLoader(): void {
        if (!this.loader) {
            this.loader = new LoaderManager(this.container, this.theme, this.i18n);
        } else {
            this.loader.show();
        }
    }

    public updateLoaderProgress(percent: number, textKey?: string): void {
        if (this.loader) {
            this.loader.updateProgress(percent, textKey);
        } else {
            this.loader = new LoaderManager(this.container, this.theme, this.i18n);
            this.loader.updateProgress(percent, textKey);
        }
    }

    public hideLoader(): void {
        if (this.loader) {
            this.loader.hide();
            this.loader = null;
        }
    }

    public updateTheme(theme: Theme): void {
        this.theme = theme;
        this.chart?.updateTheme(theme);
        if (this.loader) {
            this.loader.updateTheme();
        }
    }

    public updateI18n(i18n: I18n): void {
        this.i18n = i18n;
        this.chart?.updateI18n(i18n);
        if (this.loader) {
            this.loader.updateI18n(i18n);
        }
    }

    public init(preprocessedData: DataPreprocessResult): void {
        if (this.chart) return;
        this.chart = new Chart({
            container: this.container,
            data: [],
            theme: this.theme,
            title: this.title,
            chartType: this.chartType,
            preprocessedData: preprocessedData,
            i18n: this.i18n,
            onExitBrushMode: () => { },
            onCloseDrawing: () => { },
            onToggleOHLC: () => { },
            onOpenIndicatorsModal: () => { },
            onRemoveIndicator: (type) => this.chart?.removeMainChartIndicator(type),
            onToggleIndicator: (type) => this.chart?.toggleIndicatorVisibility(type),
            onEditIndicatorParams: (id, params) => this.chart?.updateIndicatorParams(id, params),
            onOpenIndicatorSettings: (indicator) => this.chart?.openMainChartIndicatorsModal(indicator),
            onMainChartIndicatorConfirm: (indicator) => this.chart?.addOrUpdateMainChartIndicator(indicator),
            onSubChartIndicatorConfirm: (params) => {
                if (this.chart?.currentSubChartType && this.chart.preprocessedData?.displayData) {
                    this.chart.chartPanesManager?.updateSettingsBySubChartIndicatorType(
                        this.chart.preprocessedData.displayData, params, this.chart.currentSubChartType
                    );
                }
            },
            onTextMarkEditorSave: (text, color, fontSize, isBold, isItalic) => {
                if (this.chart?.currentMarkSettingsStyle) {
                    this.chart.currentMarkSettingsStyle.updateStyles({ text, color, fontSize, isBold, isItalic });
                    this.chart.chart?.timeScale().applyOptions({});
                }
            },
            onTextMarkEditorCancel: () => { },
            onImageConfirm: (imageUrl) => this.chart?.drawingManager?.handleImageConfirm(imageUrl),
        });
        if (this.chart) {
            this.chart.currentTheme = this.theme.isDark() ? Dark : Light;
        }
    }

    public getChart(): Chart | null { return this.chart; }
    public setData(data: DataPreprocessResult): void { this.chart?.setData(data); }
    public updateChartType(type: MainChartType): void { this.chart?.updateChartType(type); }

    public destroy(): void {
        if (this.loader) {
            this.loader.destroy();
            this.loader = null;
        }
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}