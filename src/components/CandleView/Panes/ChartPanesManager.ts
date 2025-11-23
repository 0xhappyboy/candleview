import { HistogramSeries, LineSeries } from "lightweight-charts";
import { SubChartIndicatorType } from "../types";
import { ChartLayer } from "../ChartLayer";

export interface PaneConfig {
    id: string;
    size: number;
    vertPosition: 'left' | 'right';
    indicatorType: SubChartIndicatorType;
    series: any;
}

export class ChartPanesManager {
    private panes: Map<string, PaneConfig> = new Map();
    private chartInstance: any = null;

    constructor() { }

    public setChartInstance(chart: any): void {
        this.chartInstance = chart;
    }

    public addSubChart(chartLayer: ChartLayer, subChartIndicatorType: SubChartIndicatorType): void {
        if (!this.chartInstance) {
            return;
        }
        try {
            const existingPane = Array.from(this.panes.values()).find(
                pane => pane.indicatorType === subChartIndicatorType
            );
            if (existingPane) {
                return;
            }
            const paneCount = this.panes.size;
            const size = this.calculatePaneSize(paneCount);
            const vertPosition = paneCount % 2 === 0 ? 'right' : 'left';
            const newPane = this.chartInstance.addPane({
                vertPosition,
                size,
            });
            const paneId = `pane_${Date.now()}_${subChartIndicatorType}`;
            const series = this.createSeriesForIndicator(newPane, subChartIndicatorType);
            const paneConfig: PaneConfig = {
                id: paneId,
                size,
                vertPosition,
                indicatorType: subChartIndicatorType,
                series
            };
            this.panes.set(paneId, paneConfig);
            this.setExampleData(series, subChartIndicatorType, chartLayer.props.chartData);
        } catch (error) {
        }
    }

    public removeSubChart(chartLayer: ChartLayer, subChartIndicatorType: SubChartIndicatorType): void {
        if (!this.chartInstance) return;
        try {
            const paneToRemove = Array.from(this.panes.values()).find(
                pane => pane.indicatorType === subChartIndicatorType
            );

            if (paneToRemove) {
                this.chartInstance.removePane(paneToRemove.series.chart());
                this.panes.delete(paneToRemove.id);
            }
        } catch (error) {
        }
    }

    public removeAllSubCharts(): void {
        if (!this.chartInstance) return;

        try {
            // 获取所有面板（除了主面板）
            const allPanes = (this.chartInstance.panes?.() || []) as any[];
            const mainPane = allPanes[0]; // 第一个是主面板

            // 删除所有非主面板
            allPanes.forEach(pane => {
                if (pane !== mainPane) {
                    try {
                        this.chartInstance.removePane(pane);
                    } catch (error) {
                    }
                }
            });

            this.panes.clear();
        } catch (error) {
        }
    }

    public getPaneByIndicatorType(indicatorType: SubChartIndicatorType): PaneConfig | undefined {
        return Array.from(this.panes.values()).find(
            pane => pane.indicatorType === indicatorType
        );
    }

    public getAllPanes(): PaneConfig[] {
        return Array.from(this.panes.values());
    }

    public hasPane(indicatorType: SubChartIndicatorType): boolean {
        return Array.from(this.panes.values()).some(
            pane => pane.indicatorType === indicatorType
        );
    }

    private calculatePaneSize(paneCount: number): number {
        // 根据面板数量动态计算大小
        const baseSize = 0.3; // 30%
        const maxTotalSize = 0.8; // 所有面板最大占80%
        const maxIndividualSize = 0.4; // 单个面板最大40%
        const availableSize = maxTotalSize - (paneCount * baseSize);
        return Math.min(maxIndividualSize, baseSize + availableSize / (paneCount + 1));
    }

    private createSeriesForIndicator(pane: any, indicatorType: SubChartIndicatorType): any {
        switch (indicatorType) {
            case SubChartIndicatorType.VOLUME:
                return pane.addSeries(HistogramSeries, {
                    color: '#26a69a',
                    priceFormat: {
                        type: 'volume',
                    },
                    priceScaleId: 'volume',
                });

            case SubChartIndicatorType.RSI:
                return pane.addSeries(LineSeries, {
                    color: '#FF6B6B',
                    lineWidth: 2,
                    priceScaleId: 'rsi',
                });

            case SubChartIndicatorType.MACD:
                return pane.addSeries(LineSeries, {
                    color: '#2962FF',
                    lineWidth: 2,
                    priceScaleId: 'macd',
                });

            case SubChartIndicatorType.STOCHASTIC:
                return pane.addSeries(LineSeries, {
                    color: '#FFA726',
                    lineWidth: 2,
                    priceScaleId: 'stochastic',
                });

            default:
                return pane.addSeries(LineSeries, {
                    color: '#666666',
                    lineWidth: 2,
                });
        }
    }

    private setExampleData(series: any, indicatorType: SubChartIndicatorType, chartData: any[]): void {
        if (!chartData || chartData.length === 0) return;
        const indicatorData = chartData.map((item, index) => {
            const baseValue = item.close || item.value || 0;
            switch (indicatorType) {
                case SubChartIndicatorType.VOLUME:
                    return {
                        time: item.time,
                        value: item.volume || Math.random() * 1000,
                        color: item.close >= item.open ? 'rgba(38, 166, 154, 0.8)' : 'rgba(239, 83, 80, 0.8)'
                    };

                case SubChartIndicatorType.RSI:
                    // 简化的RSI计算
                    return {
                        time: item.time,
                        value: 50 + Math.sin(index * 0.1) * 30 // 模拟RSI在20-80之间波动
                    };

                case SubChartIndicatorType.MACD:
                    // 简化的MACD计算
                    return {
                        time: item.time,
                        value: Math.sin(index * 0.05) * 2 // 模拟MACD线
                    };

                case SubChartIndicatorType.STOCHASTIC:
                    // 简化的随机指标计算
                    return {
                        time: item.time,
                        value: 50 + Math.cos(index * 0.1) * 40 // 模拟随机指标在10-90之间波动
                    };

                default:
                    return {
                        time: item.time,
                        value: baseValue * 0.8 + Math.random() * 10
                    };
            }
        });

        if (indicatorData.length > 0) {
            series.setData(indicatorData);
        }
    }

    public updatePaneData(chartData: any[]): void {
        this.panes.forEach(paneConfig => {
            this.setExampleData(paneConfig.series, paneConfig.indicatorType, chartData);
        });
    }
}