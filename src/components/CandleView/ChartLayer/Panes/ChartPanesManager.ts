import { Point, SubChartIndicatorType } from "../../types";
import { ChartLayer } from "..";
import { IChartPane, PaneConfig } from "./IChartPanes";
import { ChartPaneFactory } from "./ChartPaneFactory";
import { ThemeConfig } from "../../Theme";
import { IIndicatorInfo } from "../../Indicators/SubChart/IIndicator";
import { MouseEventParams } from "lightweight-charts";


export class ChartPanesManager {
    private panesCache: Map<string, IChartPane> = new Map();
    private chartInstance: any = null;

    constructor() { }

    public setChartInstance(chart: any): void {
        this.chartInstance = chart;
    }

    public addSubChart(
        chartLayer: ChartLayer,
        subChartIndicatorType: SubChartIndicatorType,
        onSettingsClick: (subChartIndicatorType: SubChartIndicatorType) => void,
        onCloseClick: (subChartIndicatorType: SubChartIndicatorType) => void,
    ): void {
        if (!this.chartInstance || this.hasPane(subChartIndicatorType)) {
            return;
        }
        const paneCount = this.panesCache.size;
        const size = this.calculatePaneSize(paneCount);
        const vertPosition = paneCount % 2 === 0 ? 'right' : 'left';
        const newPane = this.chartInstance.addPane({ vertPosition, size });
        const paneId = this.buildPanesCacheId(subChartIndicatorType);
        const chartPane = ChartPaneFactory.createPane(
            this.chartInstance,
            newPane,
            paneId,
            size,
            vertPosition,
            subChartIndicatorType,
            chartLayer.props.currentTheme,
            onSettingsClick,
            onCloseClick);
        this.panesCache.set(paneId, chartPane);
        chartPane.init(chartLayer.props.chartData);
    }

    public updatePaneDataBySubChartIndicatorType(chartData: any[], subChartIndicatorType: SubChartIndicatorType): void {
        const pane = this.getPaneByIndicatorType(subChartIndicatorType);
        if (pane) {
            pane.updateData(chartData);
        }
    }

    public updateAllPaneData(chartData: any[]): void {
        this.removeAllSeries();
        this.panesCache.forEach(pane => {
            pane.updateData(chartData);
        });
    }

    public updatePaneThemeBySubChartIndicatorType(theme: ThemeConfig, subChartIndicatorType: SubChartIndicatorType): void {
        const pane = this.getPaneByIndicatorType(subChartIndicatorType);
        if (pane) {
            pane.updateThme(theme);
        }
    }

    public updateAllPaneTheme(theme: ThemeConfig): void {
        this.panesCache.forEach(pane => {
            pane.updateThme(theme);
        });
    }

    public updateSettingsBySubChartIndicatorType(chartData: any[], settings: IIndicatorInfo[], subChartIndicatorType: SubChartIndicatorType): void {
        const pane = this.getPaneByIndicatorType(subChartIndicatorType);
        if (pane) {
            pane.updateSettings(chartData, settings);
        }
    }

    public removePaneBySubChartIndicatorType(subChartIndicatorType: SubChartIndicatorType): void {
        if (!this.chartInstance) return;
        const paneToRemove = this.getPaneByIndicatorType(subChartIndicatorType);
        if (paneToRemove) {
            this.chartInstance.removePane(paneToRemove.paneInstance.paneIndex());
            this.panesCache.delete(this.buildPanesCacheId(subChartIndicatorType));
        }
    }

    public removeAllPane(): void {
        if (!this.chartInstance) return;
        this.panesCache.forEach((value, key) => {
            this.chartInstance.removePane(value.paneInstance.paneIndex());
        });
        this.panesCache.clear();
    }

    public removeAllSeries(): void {
        if (!this.chartInstance) return;
        this.panesCache.forEach((value, key) => {
            value.paneInstance.getSeries().forEach((v: any, k: string) => {
                this.chartInstance.removeSeries(v);
            });
        });
    }

    public getParamsByIndicatorType(indicatorType: SubChartIndicatorType): IIndicatorInfo[] {
        const pane = this.getPaneByIndicatorType(indicatorType);
        if (pane) {
            return pane.getParams();
        }
        return [];
    }

    public getPaneByIndicatorType(indicatorType: SubChartIndicatorType): IChartPane | undefined {
        return Array.from(this.panesCache.values()).find(
            pane => pane.indicatorType === indicatorType
        );
    }

    public getAllPanes(): IChartPane[] {
        return Array.from(this.panesCache.values());
    }

    public hasPane(indicatorType: SubChartIndicatorType): boolean {
        return Array.from(this.panesCache.values()).some(
            pane => pane.indicatorType === indicatorType
        );
    }

    private calculatePaneSize(paneCount: number): number {
        const baseSize = 0.3;
        const maxTotalSize = 0.8;
        const maxIndividualSize = 0.4;
        const availableSize = maxTotalSize - (paneCount * baseSize);
        return Math.min(maxIndividualSize, baseSize + availableSize / (paneCount + 1));
    }

    private buildPanesCacheId(subChartIndicatorType: SubChartIndicatorType): string {
        return `pane_${subChartIndicatorType}`;
    }

    // =================== Mouse event spreading Start ===================
    public handleMouseDown(poin: Point): void {
        this.panesCache.forEach(pane => {
            pane.handleMouseDown(poin);
        });
    }

    public handleMouseMove(poin: Point): void {
        this.panesCache.forEach(pane => {
            pane.handleMouseMove(poin);
        });
    }

    public handleMouseUp(poin: Point): void {
        this.panesCache.forEach(pane => {
            pane.handleMouseUp(poin);
        });
    }

    public handleCrosshairMoveEvent(event: MouseEventParams): void {
        this.panesCache.forEach(pane => {
            pane.handleCrosshairMoveEvent(event);
        });
    }
    // =================== Mouse event spreading Start ===================

}