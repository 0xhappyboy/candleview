import { ISeriesPrimitive, LineSeries, SeriesAttachedParameter, Time } from "lightweight-charts";
import { SubChartIndicatorType } from "../types";
import { IChartPane } from "./IChartPanes";
import { PaneInfo, PaneInfoConfig } from "./PaneInfo";

export abstract class BaseChartPane implements IChartPane {
    private _buttonPrimitive: PaneInfo | null = null;
    private _paneInfo: PaneInfo | null = null;

    constructor(
        public readonly id: string,
        public readonly size: number,
        public readonly vertPosition: 'left' | 'right',
        public readonly indicatorType: SubChartIndicatorType,
        protected paneInstance: any
    ) {
        this._addPaneInfo();
    }

    private _addPaneInfo() {
        if (!this.paneInstance) return;
        const config: PaneInfoConfig = {
            name: this.id,
            param1: "MA(5,10,20)",
            param2: "VOL: 1.2M",
            onSettingsClick: () => this._onSettingsClick(),
            onCloseClick: () => this._onCloseClick(),
            backgroundColor: 'rgba(0, 123, 255, 0.9)',
            textColor: 'white',
            fontSize: 12
        };
        this._paneInfo = new PaneInfo(config);
        this.paneInstance.attachPrimitive(this._paneInfo);
    }

    private _onSettingsClick() {
    }

    private _onCloseClick() {
    }

    public updatePaneInfo(config: Partial<PaneInfoConfig>) {
        if (this._paneInfo) {
            this._paneInfo.updateConfig(config);
        }
    }

    public updatePaneParams(param1?: string, param2?: string) {
        if (this._paneInfo) {
            this._paneInfo.updateParams(param1, param2);
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

    protected getDefaultPriceScaleId(): string {
        return 'right';
    }
}
