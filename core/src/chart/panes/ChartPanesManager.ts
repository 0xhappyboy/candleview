import { Point, SubChartIndicatorType } from "../../types";
import { IChartPane } from "./IChartPanes";
import { ChartPaneFactory } from "./ChartPaneFactory";
import { IIndicatorInfo } from "../../Indicators/subchart/IIndicator";
import { MouseEventParams } from "lightweight-charts";
import { Chart } from "../Chart";
import { ThemeConfig } from "../../theme";
import { Custom, CustomConfig } from "./subchart/Custom";


export class ChartPanesManager {
    private panesCache: Map<string, IChartPane> = new Map();
    private chartInstance: any = null;

    constructor() { }

    public setChartInstance(chart: any): void {
        this.chartInstance = chart;
    }

    public removeCustomPaneById(customId: string): void {
        if (!this.chartInstance) return;
        const paneId = `pane_${customId}`;
        const paneToRemove = this.panesCache.get(paneId);
        if (!paneToRemove) {
            console.warn('[ChartPanesManager] Custom pane not found:', customId);
            return;
        }
        const allPanes: IChartPane[] = [];
        this.panesCache.forEach(pane => {
            allPanes.push(pane);
        });
        const sortedPanes = allPanes.sort((a, b) =>
            a.paneInstance.paneIndex() - b.paneInstance.paneIndex()
        );
        const targetIndex = paneToRemove.paneInstance.paneIndex();
        const panesToReindex: IChartPane[] = [];
        for (let i = 0; i < sortedPanes.length; i++) {
            const pane = sortedPanes[i];
            if (pane.id !== paneToRemove.id &&
                pane.paneInstance.paneIndex() > targetIndex) {
                panesToReindex.push(pane);
            }
        }
        for (let i = 0; i < panesToReindex.length; i++) {
            const pane = panesToReindex[i];
            if ((pane as any)._infoElement) {
                (pane as any)._infoElement.style.opacity = '0';
            }
        }
        if ((paneToRemove as any)._infoElement) {
            (paneToRemove as any)._infoElement.style.opacity = '0';
        }
        requestAnimationFrame(() => {
            try {
                this.chartInstance.removePane(targetIndex);
                paneToRemove.destroy();
                this.panesCache.delete(paneId);
            } catch (e) {
                console.error('[ChartPanesManager] remove target custom pane error:', e);
            }
            const reindexData: Array<{
                pane: IChartPane;
                indicatorType: SubChartIndicatorType;
                size: number;
                vertPosition: 'left' | 'right';
                settings: IIndicatorInfo[];
                onSettingsClick: (type: SubChartIndicatorType) => void;
                onCloseClick: (type: SubChartIndicatorType) => void;
                isCustom: boolean;
                customConfig?: CustomConfig;
            }> = [];
            for (let i = 0; i < panesToReindex.length; i++) {
                const pane = panesToReindex[i];
                const isCustom = pane instanceof Custom;
                reindexData.push({
                    pane,
                    indicatorType: pane.indicatorType,
                    size: pane.size,
                    vertPosition: pane.vertPosition,
                    settings: pane.getParams(),
                    onSettingsClick: pane.onSettingsClick.bind(pane),
                    onCloseClick: pane.onCloseClick.bind(pane),
                    isCustom: isCustom,
                    customConfig: isCustom ? (pane as any).seriesConfigs ? { id: (pane as any).customId, series: (pane as any).seriesConfigs } : undefined : undefined
                });

                try {
                    this.chartInstance.removePane(pane.paneInstance.paneIndex());
                    pane.destroy();
                    this.panesCache.delete(this.buildPanesCacheId(pane.indicatorType));
                } catch (e) {
                    console.error('[ChartPanesManager] remove reindex custom pane error:', e);
                }
            }
            const displayData = (this as any).displayData || [];
            const currentTheme = (this as any).currentTheme;
            for (let i = 0; i < reindexData.length; i++) {
                const data = reindexData[i];
                try {
                    const newPane = this.chartInstance.addPane({
                        vertPosition: data.vertPosition,
                        size: data.size
                    });
                    let chartPane: IChartPane;
                    if (data.isCustom && data.customConfig) {
                        const customPane = new Custom(
                            this.buildPanesCacheId(data.indicatorType),
                            data.size,
                            data.vertPosition,
                            data.indicatorType,
                            this.chartInstance,
                            newPane,
                            currentTheme,
                            data.onSettingsClick,
                            data.onCloseClick
                        );
                        customPane.setConfig(data.customConfig as CustomConfig);
                        customPane.init(displayData);
                        chartPane = customPane;
                    } else {
                        chartPane = ChartPaneFactory.createPane(
                            this.chartInstance,
                            newPane,
                            this.buildPanesCacheId(data.indicatorType),
                            data.size,
                            data.vertPosition,
                            data.indicatorType,
                            currentTheme,
                            data.onSettingsClick,
                            data.onCloseClick
                        );
                        chartPane.init(displayData);
                    }
                    if (data.settings && data.settings.length > 0) {
                        chartPane.updateSettings(displayData, data.settings);
                    }
                    this.panesCache.set(this.buildPanesCacheId(data.indicatorType), chartPane);
                } catch (e) {
                    console.error('[ChartPanesManager] rebuild reindex custom pane error:', e);
                }
            }
        });
    }

    public addCustomPane(
        chartLayer: Chart,
        config: CustomConfig,
        onCloseClick: (id: string) => void,
        onAddCallback?: (indicatorType: SubChartIndicatorType) => void,
        onPaneCreated?: (pane: Custom) => void
    ): void {
        if (!this.chartInstance) return;
        (this as any).chartLayer = chartLayer;
        (this as any).displayData = chartLayer.preprocessedData?.displayData || [];
        (this as any).currentTheme = chartLayer.currentTheme;
        const existingPaneId = `pane_${config.id}`;
        if (this.panesCache.has(existingPaneId)) {
            console.warn('[ChartPanesManager] Custom pane already exists:', config.id);
            return;
        }
        const currentId = config.id;
        const currentCustomType = config.id as SubChartIndicatorType;
        const paneCount = this.panesCache.size;
        const size = config.size || 0.2;
        const vertPosition: 'left' | 'right' = paneCount % 2 === 0 ? 'right' : 'left';
        const newPane = this.chartInstance.addPane({ vertPosition, size });
        const paneId = `pane_${currentId}`;
        const customPane = new Custom(
            paneId,
            size,
            vertPosition,
            currentCustomType,
            this.chartInstance,
            newPane,
            chartLayer.currentTheme,
            () => { },
            (type) => {
                onCloseClick(currentId);
            }
        );
        customPane.setConfig(config);
        customPane.init(chartLayer.preprocessedData?.displayData || []);
        this.panesCache.set(paneId, customPane);
        onAddCallback?.(currentCustomType);
        if (onPaneCreated) {
            onPaneCreated(customPane);
        }
    }

    public addSubChart(
        chartLayer: Chart,
        subChartIndicatorType: SubChartIndicatorType,
        onSettingsClick: (subChartIndicatorType: SubChartIndicatorType) => void,
        onCloseClick: (subChartIndicatorType: SubChartIndicatorType) => void,
    ): void {
        if (!this.chartInstance || this.hasPane(subChartIndicatorType)) {
            return;
        }
        (this as any).chartLayer = chartLayer;
        (this as any).displayData = chartLayer.preprocessedData?.displayData || [];
        (this as any).currentTheme = chartLayer.currentTheme;
        if (this.hasPane(subChartIndicatorType)) {
            this.removePaneBySubChartIndicatorType(subChartIndicatorType);
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
            chartLayer.currentTheme,
            onSettingsClick,
            onCloseClick);
        this.panesCache.set(paneId, chartPane);
        chartPane.init(chartLayer.preprocessedData?.displayData!);
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
        if (!paneToRemove) {
            console.warn('[ChartPanesManager] Pane not found:', subChartIndicatorType);
            return;
        }
        if (!(this as any).displayData && (this as any).chartLayer) {
            (this as any).displayData = (this as any).chartLayer.preprocessedData?.displayData || [];
            (this as any).currentTheme = (this as any).chartLayer.currentTheme;
        }
        const allPanes: IChartPane[] = [];
        this.panesCache.forEach(pane => {
            allPanes.push(pane);
        });
        const sortedPanes = allPanes.sort((a, b) =>
            a.paneInstance.paneIndex() - b.paneInstance.paneIndex()
        );
        const targetIndex = paneToRemove.paneInstance.paneIndex();
        const panesToReindex: IChartPane[] = [];
        for (let i = 0; i < sortedPanes.length; i++) {
            const pane = sortedPanes[i];
            if (pane.indicatorType !== subChartIndicatorType &&
                pane.paneInstance.paneIndex() > targetIndex) {
                panesToReindex.push(pane);
            }
        }
        for (let i = 0; i < panesToReindex.length; i++) {
            const pane = panesToReindex[i];
            if ((pane as any)._infoElement) {
                (pane as any)._infoElement.style.opacity = '0';
            }
        }
        if ((paneToRemove as any)._infoElement) {
            (paneToRemove as any)._infoElement.style.opacity = '0';
        }
        requestAnimationFrame(() => {
            try {
                this.chartInstance.removePane(targetIndex);
                paneToRemove.destroy();
                this.panesCache.delete(this.buildPanesCacheId(subChartIndicatorType));
            } catch (e) {
                console.error('[ChartPanesManager] remove target pane error:', e);
            }
            const reindexData: Array<{
                indicatorType: SubChartIndicatorType;
                size: number;
                vertPosition: 'left' | 'right';
                settings: IIndicatorInfo[];
                onSettingsClick: (type: SubChartIndicatorType) => void;
                onCloseClick: (type: SubChartIndicatorType) => void;
            }> = [];
            for (let i = 0; i < panesToReindex.length; i++) {
                const pane = panesToReindex[i];
                reindexData.push({
                    indicatorType: pane.indicatorType,
                    size: pane.size,
                    vertPosition: pane.vertPosition,
                    settings: pane.getParams(),
                    onSettingsClick: pane.onSettingsClick.bind(pane),
                    onCloseClick: pane.onCloseClick.bind(pane)
                });
                try {
                    this.chartInstance.removePane(pane.paneInstance.paneIndex());
                    pane.destroy();
                    this.panesCache.delete(this.buildPanesCacheId(pane.indicatorType));
                } catch (e) {
                    console.error('[ChartPanesManager] remove reindex pane error:', e);
                }
            }
            const displayData = (this as any).displayData || [];
            const currentTheme = (this as any).currentTheme;
            for (let i = 0; i < reindexData.length; i++) {
                const data = reindexData[i];
                try {
                    const newPane = this.chartInstance.addPane({
                        vertPosition: data.vertPosition,
                        size: data.size
                    });
                    const chartPane = ChartPaneFactory.createPane(
                        this.chartInstance,
                        newPane,
                        this.buildPanesCacheId(data.indicatorType),
                        data.size,
                        data.vertPosition,
                        data.indicatorType,
                        currentTheme,
                        data.onSettingsClick,
                        data.onCloseClick
                    );
                    chartPane.init(displayData);
                    if (data.settings && data.settings.length > 0) {
                        chartPane.updateSettings(displayData, data.settings);
                    }
                    this.panesCache.set(this.buildPanesCacheId(data.indicatorType), chartPane);
                } catch (e) {
                    console.error('[ChartPanesManager] rebuild reindex pane error:', e);
                }
            }
            if ((this as any).onPaneRemoved) {
                (this as any).onPaneRemoved(subChartIndicatorType);
            }
        });
    }

    public removeAllPane(): void {
        if (!this.chartInstance) return;
        const panes = Array.from(this.panesCache.values());
        for (let i = panes.length - 1; i >= 0; i--) {
            const pane = panes[i];
            try {
                pane.destroy();
                this.chartInstance.removePane(pane.paneInstance.paneIndex());
            } catch (e) {
                console.error('[ChartPanesManager] remove pane error:', e);
            }
        }
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

    public getEnabledSubChartIndicators(): SubChartIndicatorType[] {
        return Array.from(this.panesCache.values()).map(pane => pane.indicatorType);
    }

    public isSubChartIndicatorEnabled(indicatorType: SubChartIndicatorType): boolean {
        return this.hasPane(indicatorType);
    }

    public removeAllCustomPanesByIds(customIds: string[]): void {
        if (!this.chartInstance || customIds.length === 0) return;
        const panesToRemove: Array<{ id: string; paneId: string; pane: IChartPane; index: number }> = [];
        for (const customId of customIds) {
            const paneId = `pane_${customId}`;
            const pane = this.panesCache.get(paneId);
            if (pane) {
                panesToRemove.push({
                    id: customId,
                    paneId: paneId,
                    pane: pane,
                    index: pane.paneInstance.paneIndex()
                });
            }
        }
        if (panesToRemove.length === 0) return;
        panesToRemove.sort((a, b) => b.index - a.index);
        const remainingPanes: IChartPane[] = [];
        this.panesCache.forEach(pane => {
            const isToRemove = panesToRemove.some(p => p.paneId === pane.id);
            if (!isToRemove) {
                remainingPanes.push(pane);
            }
        });
        for (const item of panesToRemove) {
            if ((item.pane as any)._infoElement) {
                (item.pane as any)._infoElement.style.opacity = '0';
            }
        }
        for (const item of panesToRemove) {
            this.panesCache.delete(item.paneId);
        }
        requestAnimationFrame(() => {
            for (const item of panesToRemove) {
                try {
                    this.chartInstance.removePane(item.index);
                    item.pane.destroy();
                } catch (e) {
                    console.error('[ChartPanesManager] remove custom pane error:', item.id, e);
                }
            }
            if (remainingPanes.length === 0) return;
            const reindexInfo = remainingPanes.map(pane => {
                const isCustom = pane instanceof Custom;
                return {
                    pane,
                    isCustom,
                    id: pane.id,
                    size: pane.size,
                    vertPosition: pane.vertPosition,
                    indicatorType: pane.indicatorType,
                    settings: pane.getParams(),
                    onSettingsClick: pane.onSettingsClick.bind(pane),
                    onCloseClick: pane.onCloseClick.bind(pane),
                    customId: isCustom ? (pane as any).customId : undefined,
                    seriesConfigs: isCustom ? (pane as any).seriesConfigs : undefined
                };
            });
            const displayData = (this as any).displayData || [];
            const currentTheme = (this as any).currentTheme;
            for (const info of reindexInfo) {
                try {
                    const oldIndex = info.pane.paneInstance.paneIndex();
                    this.chartInstance.removePane(oldIndex);
                    info.pane.destroy();
                    this.panesCache.delete(info.id);
                } catch (e) {
                    console.error('[ChartPanesManager] remove remaining pane error:', e);
                }
            }
            for (const info of reindexInfo) {
                try {
                    const newPane = this.chartInstance.addPane({
                        vertPosition: info.vertPosition,
                        size: info.size
                    });

                    let chartPane: IChartPane;
                    if (info.isCustom && info.customId) {
                        const customPane = new Custom(
                            info.id,
                            info.size,
                            info.vertPosition,
                            info.indicatorType,
                            this.chartInstance,
                            newPane,
                            currentTheme,
                            info.onSettingsClick,
                            info.onCloseClick
                        );
                        customPane.setConfig({
                            id: info.customId,
                            series: info.seriesConfigs || []
                        });
                        customPane.init(displayData);
                        chartPane = customPane;
                    } else {
                        chartPane = ChartPaneFactory.createPane(
                            this.chartInstance,
                            newPane,
                            info.id,
                            info.size,
                            info.vertPosition,
                            info.indicatorType,
                            currentTheme,
                            info.onSettingsClick,
                            info.onCloseClick
                        );
                        chartPane.init(displayData);
                    }

                    if (info.settings && info.settings.length > 0) {
                        chartPane.updateSettings(displayData, info.settings);
                    }

                    this.panesCache.set(info.id, chartPane);
                } catch (e) {
                    console.error('[ChartPanesManager] rebuild remaining pane error:', e);
                }
            }
        });
    }
}