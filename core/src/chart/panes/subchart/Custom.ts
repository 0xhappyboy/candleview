import { LineSeries, HistogramSeries, AreaSeries } from "lightweight-charts";
import { BaseChartPane } from "../BaseChartPane";
import { IIndicatorInfo } from "../../../Indicators/subchart/IIndicator";
import { SubChartIndicatorType } from "../../../types";
import { ThemeConfig } from "../../../theme";

export interface CustomSeriesConfig {
    name: string;
    calculator: (index: number, open: number, high: number, low: number, close: number, volume: number) => number | null;
    type: 'line' | 'histogram' | 'area';
    color: string;
    lineWidth?: number;
    visible?: boolean;
}

export interface CustomConfig {
    id: string;
    size?: number;
    name?: string;
    series: CustomSeriesConfig[];
    onClose?: (id: string) => void;
}

export class Custom extends BaseChartPane {
    private seriesMap: Map<string, any> = new Map();
    private seriesConfigs: CustomSeriesConfig[] = [];
    private paneName: string = 'Custom';
    private customId: string = '';
    private onClosePaneCallback?: (id: string) => void;

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(
        id: string,
        size: number,
        vertPosition: 'left' | 'right',
        indicatorType: SubChartIndicatorType,
        chartInstance: any,
        paneInstance: any,
        theme: ThemeConfig,
        onSettingsClick: (subChartIndicatorType: SubChartIndicatorType) => void,
        onCloseClick: (subChartIndicatorType: SubChartIndicatorType) => void
    ) {
        super(
            id,
            size,
            vertPosition,
            indicatorType,
            chartInstance,
            paneInstance,
            theme,
            onSettingsClick,
            onCloseClick
        );
    }

    public setConfig(config: CustomConfig): void {
        this.customId = config.id;
        this.paneName = config.name || config.id;
        this.seriesConfigs = config.series;
        this.onClosePaneCallback = config.onClose;
    }

    public init(chartData: any[]): void {
        setTimeout(() => {
            this.createInfoElement();
            if (this._infoElement) {
                const nameSpan = this._infoElement.querySelector('span:first-child') as HTMLElement;
                if (nameSpan) {
                    nameSpan.textContent = this.paneName;
                }
            }
            if (this._settingsButton) {
                this._settingsButton.style.display = 'none';
            }
            if (this._closeButton) {
                this._closeButton.style.display = 'flex';
            }
            if (this._paramsContainer) {
                this._paramsContainer.style.display = 'none';
            }
            this.updateData(chartData);
        }, 0);
    }

    public updateData(chartData: any[]): void {
        if (!this.paneInstance) {
            console.warn('[Custom] updateData: paneInstance is null');
            return;
        }
        const displayData = chartData.filter(item => !item.isVirtual);
        if (displayData.length === 0) return;
        this.clearAllSeries();
        this.seriesConfigs.forEach(config => {
            const seriesData = this.computeSeriesData(displayData, config.calculator);
            if (seriesData.length === 0) return;
            const typedData = seriesData.map(item => ({
                time: item.time,
                value: item.value
            }));
            try {
                const series = this.createSeries(config);
                if (series) {
                    series.setData(typedData);
                    this.seriesMap.set(config.name, series);
                }
            } catch (error) {
                console.error('[Custom] Error creating series:', config.name, error);
            }
        });
        if (this.paneInstance && typeof this.paneInstance.resize === 'function') {
            this.paneInstance.resize();
        }
    }

    private clearAllSeries(): void {
        this.seriesMap.forEach((series) => {
            try {
                if (this.chartInstance && series) {
                    this.chartInstance.removeSeries(series);
                }
            } catch (e) {
            }
        });
        this.seriesMap.clear();
    }

    private computeSeriesData(
        displayData: any[],
        calculator: (index: number, open: number, high: number, low: number, close: number, volume: number) => number | null
    ): Array<{ time: any; value: number }> {
        const result: Array<{ time: any; value: number }> = [];
        for (let i = 0; i < displayData.length; i++) {
            const item = displayData[i];
            const value = calculator(
                i,
                item.open,
                item.high,
                item.low,
                item.close,
                item.volume || 0
            );

            if (value !== null && value !== undefined && !isNaN(value)) {
                result.push({
                    time: item.time,
                    value: value
                });
            }
        }
        return result;
    }

    private createSeries(config: CustomSeriesConfig): any {
        if (!this.paneInstance) return null;
        const priceScaleId = `custom_pane_${this.id}_${config.name}`;
        const lineWidth = (config.lineWidth || 2) as 1 | 2 | 3 | 4;
        switch (config.type) {
            case 'line':
                return this.paneInstance.addSeries(LineSeries, {
                    color: config.color,
                    lineWidth: lineWidth,
                    title: config.name,
                    priceScaleId: priceScaleId,
                    visible: config.visible !== false,
                    priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
                });
            case 'histogram':
                return this.paneInstance.addSeries(HistogramSeries, {
                    color: config.color,
                    title: config.name,
                    priceScaleId: priceScaleId,
                    visible: config.visible !== false,
                    priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
                });
            case 'area':
                return this.paneInstance.addSeries(AreaSeries, {
                    lineColor: config.color,
                    topColor: `${config.color}40`,
                    bottomColor: `${config.color}00`,
                    lineWidth: lineWidth,
                    title: config.name,
                    priceScaleId: priceScaleId,
                    visible: config.visible !== false,
                    priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
                });
            default:
                return this.paneInstance.addSeries(LineSeries, {
                    color: config.color,
                    lineWidth: lineWidth,
                    title: config.name,
                    priceScaleId: priceScaleId,
                    visible: config.visible !== false,
                    priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
                });
        }
    }

    public getSeries(): { [key: string]: any } {
        const result: { [key: string]: any } = {};
        this.seriesMap.forEach((series, name) => {
            result[name] = series;
        });
        return result;
    }

    public getParams(): IIndicatorInfo[] {
        return [];
    }

    public destroy(): void {
        this.seriesMap.forEach((series) => {
            try {
                if (this.chartInstance && series) {
                    this.chartInstance.removeSeries(series);
                }
            } catch (e) { }
        });
        this.seriesMap.clear();
        super.destroy();
    }

    public updateThme(theme: ThemeConfig): void {
        super.updateThme(theme);
    }

    updateSettings(chartData: any[], settings: IIndicatorInfo[]): void { }
    setStyles(styles: any): void { }
    setVisible(visible: boolean): void { }
}