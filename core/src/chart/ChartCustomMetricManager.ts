import { IChartApi, LineSeries, Time, LineData } from 'lightweight-charts';
import { ICandleViewDataPoint, SubChartIndicatorType } from '../types';
import { Chart } from './Chart';

export interface CustomMainSeriesConfig {
    id: string;
    name: string;
    calculator: (data: ICandleViewDataPoint[]) => Array<{ time: Time; value: number }>;
    options?: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        priceScaleId?: string;
        scaleMargins?: { top: number; bottom: number };
    };
}

export interface CustomSimpleLineConfig {
    id: string;
    calculator: (index: number, open: number, high: number, low: number, close: number, volume: number) => number | null;
    options?: {
        name?: string;
        color?: string;
        width?: number;
        style?: 'solid' | 'dashed' | 'dotted';
        visible?: boolean;
    };
}

export interface CustomSubPaneConfig {
    id: string;
    size?: number;
    name?: string;
    series: Array<{
        name: string;
        calculator: (index: number, open: number, high: number, low: number, close: number, volume: number) => number | null;
        type: 'line' | 'histogram' | 'area';
        color: string;
        lineWidth?: number;
        visible?: boolean;
    }>;
    onClose?: (id: string) => void;
}

export class ChartCustomMetricManager {
    private chart: Chart;
    private customMainIndicators: Map<string, any> = new Map();
    private customPanes: Map<string, any> = new Map();

    constructor(chart: Chart) {
        this.chart = chart;
    }

    public addCustomMainIndicator(config: CustomMainSeriesConfig): void {
        const chartInstance = this.chart.getChart();
        if (!chartInstance) return;
        const currentData = this.chart.preprocessedData?.displayData || [];
        const data = config.calculator(currentData);
        if (data.length === 0) return;
        const priceScaleId = config.options?.priceScaleId || `custom_main_${config.id}`;
        const lineWidth = (config.options?.lineWidth || 2) as 1 | 2 | 3 | 4;
        chartInstance.priceScale(priceScaleId).applyOptions({
            scaleMargins: config.options?.scaleMargins || { top: 0.05, bottom: 0.1 },
            autoScale: true,
            borderVisible: true
        });
        const series = chartInstance.addSeries(LineSeries, {
            color: config.options?.color || '#FF6B6B',
            lineWidth: lineWidth,
            title: config.name,
            priceScaleId: priceScaleId,
            priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
        });
        if (config.options?.lineStyle === 'dashed') {
            series.applyOptions({ lineStyle: 2 });
        } else if (config.options?.lineStyle === 'dotted') {
            series.applyOptions({ lineStyle: 3 });
        }
        const typedData: LineData<Time>[] = data.map(item => ({
            time: item.time as Time,
            value: item.value
        }));
        series.setData(typedData);
        this.customMainIndicators.set(config.id, {
            series,
            calculator: config.calculator,  
            config,
            priceScaleId
        });
    }

    public removeCustomMainIndicator(id: string): void {
        const indicator = this.customMainIndicators.get(id);
        const chartInstance = this.chart.getChart();
        if (indicator && chartInstance) {
            try {
                chartInstance.removeSeries(indicator.series);
                this.customMainIndicators.delete(id);
            } catch (e) {
                console.error('Failed to remove custom main indicator:', e);
            }
        }
    }

    public removeAllCustomMainIndicators(): void {
        this.customMainIndicators.forEach((_, id) => {
            this.removeCustomMainIndicator(id);
        });
    }

    public addCustomMainSeries(
        id: string,
        data: Array<{ time: number; value: number }>,
        options?: {
            name?: string;
            color?: string;
            lineWidth?: number;
            lineStyle?: 'solid' | 'dashed' | 'dotted';
            visible?: boolean;
        }
    ): void {
        const chartInstance = this.chart.getChart();
        if (!chartInstance) return;
        if (this.customMainIndicators.has(id)) {
            this.removeCustomMainIndicator(id);
        }
        const filteredData = data.filter(item =>
            item.value !== null &&
            item.value !== undefined &&
            !isNaN(item.value)
        );
        if (filteredData.length === 0) return;
        const lineWidth = (options?.lineWidth || 2) as 1 | 2 | 3 | 4;
        const series = chartInstance.addSeries(LineSeries, {
            color: options?.color || '#FF6B6B',
            lineWidth: lineWidth,
            title: options?.name || id,
            priceLineVisible: false,
            lastValueVisible: true,
            visible: options?.visible !== false,
            priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
        });
        if (options?.lineStyle === 'dashed') {
            series.applyOptions({ lineStyle: 2 });
        } else if (options?.lineStyle === 'dotted') {
            series.applyOptions({ lineStyle: 3 });
        }
        const typedData: LineData<Time>[] = filteredData.map(item => ({
            time: item.time as Time,
            value: item.value
        }));
        series.setData(typedData);
        this.customMainIndicators.set(id, { series, options });
    }

    public updateCustomMainSeries(id: string, data: Array<{ time: number; value: number }>): void {
        const item = this.customMainIndicators.get(id);
        if (item?.series && data.length > 0) {
            const typedData: LineData<Time>[] = data.map(item => ({
                time: item.time as Time,
                value: item.value
            }));
            item.series.setData(typedData);
        }
    }

    public addCustomSubPane(config: CustomSubPaneConfig): void {
        const chartInstance = this.chart.getChart();
        if (!chartInstance) return;
        const panesManager = this.chart.chartPanesManager;
        if (!panesManager) return;
        const onAddCallback = (this.chart as any).onCustomSubPaneAdded;
        panesManager.addCustomPane(
            this.chart,
            {
                id: config.id,
                size: config.size,
                name: config.name,
                series: config.series
            },
            (id: string) => {
                this.removeCustomSubPane(id);
                config.onClose?.(id);
                const onRemoveCallback = (this.chart as any).onCustomSubPaneRemoved;
                onRemoveCallback?.(id as SubChartIndicatorType);
            },
            onAddCallback,
            (addedPane: any) => {
                if (addedPane) {
                    this.customPanes.set(config.id, addedPane);
                }
            }
        );
    }

    public removeCustomSubPane(id: string): void {
        const panesManager = this.chart.chartPanesManager;
        if (!panesManager) return;

        panesManager.removeCustomPaneById(id);
        this.customPanes.delete(id);
    }

    public getCustomPanes(): Map<string, any> {
        return this.customPanes;
    }

    public updateAllCustomIndicators(displayData: ICandleViewDataPoint[]): void {
        this.customMainIndicators.forEach((indicator, id) => {
        });
        const data = displayData || this.chart.preprocessedData?.displayData;
        if (!data || data.length === 0) {
            console.warn('[ChartCustomMetricManager] No display data available');
            return;
        }
        this.customMainIndicators.forEach((indicator, id) => {
            if (indicator.calculator && typeof indicator.calculator === 'function') {
                this.updateCustomMainIndicator(id, data);
            } else {
                console.warn(`[ChartCustomMetricManager] Indicator ${id} has no calculator function, skipping`);
            }
        });
        this.customPanes.forEach((pane, id) => {
            if (pane && typeof pane.updateData === 'function') {
                pane.updateData(data);
            } else {
                console.warn('[ChartCustomMetricManager] Invalid pane in customPanes:', id, pane);
            }
        });
    }

    public updateCustomMainIndicator(id: string, displayData?: ICandleViewDataPoint[]): void {
        const indicator = this.customMainIndicators.get(id);
        if (!indicator) {
            console.warn(`[ChartCustomMetricManager] Indicator ${id} not found`);
            return;
        }
        if (!indicator.calculator || typeof indicator.calculator !== 'function') {
            console.warn(`[ChartCustomMetricManager] Indicator ${id} has no calculator function`);
            return;
        }
        const data = displayData || this.chart.preprocessedData?.displayData;
        if (!data || data.length === 0) return;
        let newData;
        try {
            newData = indicator.calculator(data);
        } catch (error) {
            console.error(`[ChartCustomMetricManager] Calculator error for ${id}:`, error);
            return;
        }
        if (newData && newData.length > 0 && indicator.series) {
            const typedData: LineData<Time>[] = newData.map((item: any) => ({
                time: item.time as Time,
                value: item.value
            }));
            try {
                indicator.series.setData([]);
                indicator.series.setData(typedData);
                const chartInstance = this.chart.getChart();
                if (chartInstance) {
                    const rightPriceScale = chartInstance.priceScale('right');
                    if (rightPriceScale) {
                        rightPriceScale.applyOptions({ autoScale: true });
                    }
                    if (indicator.priceScaleId) {
                        const customPriceScale = chartInstance.priceScale(indicator.priceScaleId);
                        if (customPriceScale) {
                            customPriceScale.applyOptions({ autoScale: true });
                        }
                    }
                }
            } catch (error) {
                console.error(`[ChartCustomMetricManager] Failed to update indicator ${id}:`, error);
            }
        }
    }

    public updateCustomSubPane(id: string, displayData?: ICandleViewDataPoint[]): void {
        const pane = this.customPanes.get(id);
        if (!pane) return;
        const data = displayData || this.chart.preprocessedData?.displayData;
        if (data && typeof pane.updateData === 'function') {
            pane.updateData(data);
        }
    }

    public destroy(): void {
        this.removeAllCustomMainIndicators();
        this.customPanes.forEach((_, id) => {
            this.removeCustomSubPane(id);
        });
        this.customMainIndicators.clear();
        this.customPanes.clear();
    }
}