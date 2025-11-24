import { Point, SubChartIndicatorType } from "../types";
import { ChartLayer } from "../ChartLayer";
import { IChartPane, PaneConfig } from "./IChartPanes";
import { ChartPaneFactory } from "./ChartPaneFactory";
import { ThemeConfig } from "../CandleViewTheme";


export class ChartPanesManager {
    private panes: Map<string, IChartPane> = new Map();
    private chartInstance: any = null;

    constructor() { }

    public setChartInstance(chart: any): void {
        this.chartInstance = chart;
    }

    public addSubChart(
        chartLayer: ChartLayer,
        subChartIndicatorType: SubChartIndicatorType,
        onSettingsClick: () => void,
        onCloseClick: () => void,
    ): void {
        if (!this.chartInstance || this.hasPane(subChartIndicatorType)) {
            return;
        }
        const paneCount = this.panes.size;
        const size = this.calculatePaneSize(paneCount);
        const vertPosition = paneCount % 2 === 0 ? 'right' : 'left';
        const newPane = this.chartInstance.addPane({ vertPosition, size });
        const paneId = `pane_${Date.now()}_${subChartIndicatorType}`;
        const chartPane = ChartPaneFactory.createPane(
            newPane,
            paneId,
            size,
            vertPosition,
            subChartIndicatorType,
            chartLayer.props.currentTheme,
            onSettingsClick,
            onCloseClick);
        this.panes.set(paneId, chartPane);
        chartPane.init(chartLayer.props.chartData);
    }

    public updatePaneDataBySubChartIndicatorType(chartData: any[], subChartIndicatorType: SubChartIndicatorType): void {
        const pane = this.getPaneByIndicatorType(subChartIndicatorType);
        if (pane) {
            pane.updateData(chartData);
        }
    }

    public updateAllPaneData(chartData: any[]): void {
        this.panes.forEach(pane => {
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
        this.panes.forEach(pane => {
            pane.updateThme(theme);
        });
    }

    public removePaneBySubChartIndicatorType(chartLayer: ChartLayer, subChartIndicatorType: SubChartIndicatorType): void {
        if (!this.chartInstance) return;
        const paneToRemove = this.getPaneByIndicatorType(subChartIndicatorType);
        if (paneToRemove) {
            this.chartInstance.removePane(paneToRemove.getChart());
            this.panes.delete(paneToRemove.id);
        }
    }

    public removeAllPane(): void {
        if (!this.chartInstance) return;
        const allPanes = (this.chartInstance.panes?.() || []) as any[];
        const mainPane = allPanes[0];
        allPanes.forEach(pane => {
            if (pane !== mainPane) {
                this.chartInstance.removePane(pane);
            }
        });
        this.panes.clear();
    }

    public getPaneByIndicatorType(indicatorType: SubChartIndicatorType): IChartPane | undefined {
        return Array.from(this.panes.values()).find(
            pane => pane.indicatorType === indicatorType
        );
    }

    public getAllPanes(): IChartPane[] {
        return Array.from(this.panes.values());
    }

    public hasPane(indicatorType: SubChartIndicatorType): boolean {
        return Array.from(this.panes.values()).some(
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


    // =================== Mouse event spreading Start ===================
    public handleMouseDown(poin: Point): void {
        this.panes.forEach(pane => {
            pane.handleMouseDown(poin);
        });
    }

    public handleMouseMove(poin: Point): void {
        this.panes.forEach(pane => {
            pane.handleMouseMove(poin);
        });
    }

    public handleMouseUp(poin: Point): void {
        this.panes.forEach(pane => {
            pane.handleMouseUp(poin);
        });
    }
    // =================== Mouse event spreading Start ===================

}