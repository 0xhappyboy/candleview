import { ISeriesPrimitive, LineSeries, SeriesAttachedParameter, Time } from "lightweight-charts";
import { SubChartIndicatorType } from "../types";
import { IChartPane } from "./IChartPanes";
import { PaneInfo, PaneInfoConfig } from "./PaneInfo";
import { ThemeConfig } from "../CandleViewTheme";

export abstract class BaseChartPane implements IChartPane {
    private _buttonPrimitive: PaneInfo | null = null;
    private _paneInfo: PaneInfo | null = null;

    constructor(
        public readonly id: string,
        public readonly size: number,
        public readonly vertPosition: 'left' | 'right',
        public readonly indicatorType: SubChartIndicatorType,
        protected paneInstance: any,
        public theme: ThemeConfig,
        public onSettingsClick: () => void,
        public onCloseClick: () => void,
    ) {
        this._addPaneInfo();
    }

    private _addPaneInfo() {
        if (!this.paneInstance) return;
        const config: PaneInfoConfig = {
            name: this.id,
            param1: "MA(5,10,20)",
            param2: "VOL: 1.2M",
            onSettingsClick: () => this.onSettingsClick(),
            onCloseClick: () => this.onCloseClick(),
            backgroundColor: 'rgba(0, 123, 255, 0.9)',
            textColor: 'white',
            fontSize: 12,
            theme: this.theme,
        };
        this._paneInfo = new PaneInfo(config);
        this.paneInstance.attachPrimitive(this._paneInfo);
    }

    public updatePaneInfo(config: Partial<PaneInfoConfig>) {
        if (this._paneInfo) {
            this._paneInfo.updateConfig(config);
        }
    }


    destroy(): void {
        if (this._paneInfo && this.paneInstance) {
            const series = this.paneInstance.series && this.paneInstance.series[0];
            if (series) {
                series.detachPrimitive(this._paneInfo);
            }
        }
        this._paneInfo = null;
    }

    getChart(): any {
        return this.paneInstance;
    }

    updateData(chartData: any[]): void { }

    setStyles(styles: any): void { }

    setVisible(visible: boolean): void { }

    updateThme(theme: ThemeConfig): void {
        this._paneInfo?.updateTheme(theme);
    }

    updateSettings(chartData: any[], settings: {
        paramName: string,
        paramValue: number,
        lineColor: string,
        lineWidth: number
    }[]): void { }

    public updatePaneInfoParams(params: { name: string, value: string, color: string }[]) {
        this._paneInfo?.updateParams(params);
    }

    protected getDefaultPriceScaleId(): string {
        return 'right';
    }
}
