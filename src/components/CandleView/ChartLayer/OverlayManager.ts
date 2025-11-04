export interface OverlayMarker {
    id: string;
    type: 'marker' | 'vertical-line' | 'special-marker';
    element: HTMLElement;
    labelElement?: HTMLElement;
    data: {
        index: number;
        time: string;
        price: number;
        x: number;
        y: number;
    };
}

export interface ChartDataPoint {
    time: string;
    value: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface PriceRange {
    min: number;
    max: number;
}

export class OverlayManager {
    private container: HTMLElement;
    private overlays: Map<string, OverlayMarker> = new Map();
    private testContainer: HTMLElement | null = null;
    private chartData: ChartDataPoint[] = [];
    private chart: any = null;
    private canvas: HTMLCanvasElement | null = null;
    constructor(container: HTMLElement) {
        this.container = container;
    }
    public setChartContext(
        chartData: ChartDataPoint[],
        chart: any,
        canvas: HTMLCanvasElement
    ): void {
        this.chartData = chartData;
        this.chart = chart;
        this.canvas = canvas;
    }


    private priceToCoordinate(price: number): number {
        if (!this.canvas) return 0;
        const containerRect = this.container.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        const chartAreaHeight = canvasRect.height - 60;
        if (chartAreaHeight <= 0) return 0;
        const visiblePriceRange = this.getVisiblePriceRange();
        if (!visiblePriceRange) return chartAreaHeight / 2;
        console.log(`价格转换调试: 
        price=${price}, 
        visibleRange=[${visiblePriceRange.min.toFixed(2)}, ${visiblePriceRange.max.toFixed(2)}], 
        canvasHeight=${canvasRect.height},
        chartAreaHeight=${chartAreaHeight}`);
        const priceRangeSize = visiblePriceRange.max - visiblePriceRange.min;
        if (priceRangeSize <= 0) return chartAreaHeight / 2;
        const normalizedPrice = Math.max(visiblePriceRange.min, Math.min(visiblePriceRange.max, price));
        const pricePositionRatio = (visiblePriceRange.max - normalizedPrice) / priceRangeSize;
        const yCoordinate = pricePositionRatio * chartAreaHeight;
        console.log(`价格转换结果: 
        normalizedPrice=${normalizedPrice.toFixed(2)}, 
        ratio=${pricePositionRatio.toFixed(4)}, 
        y=${yCoordinate.toFixed(2)}`);
        return yCoordinate;
    }


    private getVisiblePriceRange(): { min: number; max: number } | null {
        if (!this.chartData || this.chartData.length === 0 || !this.chart) return null;
        try {
            const timeScale = this.chart.timeScale();
            if (!timeScale) return this.getChartPriceRange();
            const visibleRange = timeScale.getVisibleLogicalRange();
            if (!visibleRange) return this.getChartPriceRange();
            const fromIndex = Math.max(0, Math.floor(visibleRange.from));
            const toIndex = Math.min(this.chartData.length - 1, Math.ceil(visibleRange.to));
            console.log(`可见范围索引: ${fromIndex} 到 ${toIndex}, 总数据点: ${this.chartData.length}`);
            let minPrice = Number.MAX_VALUE;
            let maxPrice = Number.MIN_VALUE;
            for (let i = fromIndex; i <= toIndex; i++) {
                const dataPoint = this.chartData[i];
                if (dataPoint.high > maxPrice) maxPrice = dataPoint.high;
                if (dataPoint.low < minPrice) minPrice = dataPoint.low;
            }
            if (minPrice > maxPrice) {
                return this.getChartPriceRange();
            }
            const margin = (maxPrice - minPrice) * 0.05;
            const visibleRangeResult = {
                min: minPrice - margin,
                max: maxPrice + margin
            };
            console.log(`可见价格范围: [${visibleRangeResult.min.toFixed(2)}, ${visibleRangeResult.max.toFixed(2)}]`);
            return visibleRangeResult;
        } catch (error) {
            console.warn('获取可见价格范围失败，使用全量范围:', error);
            return this.getChartPriceRange();
        }
    }


    private getChartPriceRange(): { min: number; max: number } | null {
        if (!this.chartData || this.chartData.length === 0) return null;

        let minPrice = Number.MAX_VALUE;
        let maxPrice = Number.MIN_VALUE;


        this.chartData.forEach(item => {
            if (item.high > maxPrice) maxPrice = item.high;
            if (item.low < minPrice) minPrice = item.low;
        });


        if (minPrice > maxPrice) {
            minPrice = 0;
            maxPrice = 100;
        }

        const margin = (maxPrice - minPrice) * 0.1;
        return {
            min: minPrice - margin,
            max: maxPrice + margin
        };
    }


    public createTestContainer(): void {
        this.removeTestContainer();

        this.testContainer = document.createElement('div');
        this.testContainer.className = 'test-overlay-container';
        this.testContainer.style.position = 'absolute';
        this.testContainer.style.top = '0';
        this.testContainer.style.left = '0';
        this.testContainer.style.width = '100%';
        this.testContainer.style.height = '100%';
        this.testContainer.style.pointerEvents = 'none';
        this.testContainer.style.zIndex = '1000';
        this.container.appendChild(this.testContainer);
    }

    public addDataPoinBottomOverlayElements(): void { 
         // .......
    }

    public addDataPoinTopOverlayElements(): void {
        this.removeAllOverlays();
        if (!this.chartData || this.chartData.length === 0 || !this.chart) {
            console.warn('图表数据或chart实例未设置，无法创建覆盖物');
            return;
        }
        const timeScale = this.chart.timeScale();
        if (!timeScale) {
            console.warn('时间轴实例未找到');
            return;
        }
        let createdCount = 0;
        let skippedCount = 0;
        console.log('=== 开始创建覆盖物标记 ===');
        this.chartData.forEach((dataPoint, index) => {
            if (index % 5 === 0) {
                const xCoordinate = timeScale.timeToCoordinate(dataPoint.time);
                if (xCoordinate !== null && xCoordinate >= 0) {
                    const yCoordinate = this.priceToCoordinate(dataPoint.high);
                    const containerRect = this.container.getBoundingClientRect();
                    if (yCoordinate >= 0 && yCoordinate <= containerRect.height - 60) {
                        this.createMarker(
                            xCoordinate,
                            index,
                            dataPoint,
                            yCoordinate,
                            {
                                markerColor: '#ff4444',
                                markerSize: 12,
                                showLabel: true,
                                offsetY: 0
                            }
                        );
                        createdCount++;
                        console.log(`创建标记 ${index}: 
                        time=${dataPoint.time}, 
                        high=${dataPoint.high}, 
                        x=${xCoordinate.toFixed(2)}, 
                        y=${yCoordinate.toFixed(2)}`);
                    } else {
                        console.warn(`坐标超出范围，跳过标记 ${index}: 
                        y=${yCoordinate.toFixed(2)}, 
                        containerHeight=${containerRect.height}`);
                        skippedCount++;
                    }
                } else {
                    console.warn(`X坐标计算失败，跳过标记 ${index}: xCoordinate=${xCoordinate}`);
                    skippedCount++;
                }
            }
        });
        console.log(`=== 覆盖物创建完成 ===`);
        console.log(`成功创建: ${createdCount} 个标记`);
        console.log(`跳过: ${skippedCount} 个标记`);
        console.log(`总数据点: ${this.chartData.length}`);
    }


    public addSpecificTimeMarkers(
        timeIndices: number[],
        options?: {
            markerColor?: string;
            markerSize?: number;
            showLabel?: boolean;
            offsetY?: number;
        }
    ): string[] {
        const markerIds: string[] = [];

        if (!this.chartData || this.chartData.length === 0 || !this.chart) {
            console.warn('图表数据或chart实例未设置，无法创建特定时间点标记');
            return markerIds;
        }

        const timeScale = this.chart.timeScale();
        if (!timeScale) {
            console.warn('时间轴实例未找到');
            return markerIds;
        }

        timeIndices.forEach(index => {
            if (index >= 0 && index < this.chartData.length) {
                const dataPoint = this.chartData[index];
                const xCoordinate = timeScale.timeToCoordinate(dataPoint.time);

                if (xCoordinate !== null && xCoordinate >= 0) {
                    const yCoordinate = this.priceToCoordinate(dataPoint.high);

                    const markerId = this.createMarker(
                        xCoordinate,
                        index,
                        dataPoint,
                        yCoordinate,
                        options
                    );

                    markerIds.push(markerId);
                }
            }
        });

        return markerIds;
    }


    public createMarker(
        x: number,
        index: number,
        dataPoint: any,
        yCoordinate: number,
        options?: {
            markerColor?: string;
            markerSize?: number;
            showLabel?: boolean;
            offsetY?: number;
        }
    ): string {
        if (!this.testContainer) {
            this.createTestContainer();
        }

        const markerId = `marker_${Date.now()}_${index}`;
        const markerColor = options?.markerColor || '#ff4444';
        const markerSize = options?.markerSize || 12;
        const showLabel = options?.showLabel !== false;
        const offsetY = options?.offsetY || 10;


        const finalY = yCoordinate - offsetY;


        const markerElement = document.createElement('div');
        markerElement.className = 'test-data-marker';
        markerElement.style.position = 'absolute';
        markerElement.style.left = `${x}px`;
        markerElement.style.top = `${finalY}px`;
        markerElement.style.width = `${markerSize}px`;
        markerElement.style.height = `${markerSize}px`;
        markerElement.style.backgroundColor = markerColor;
        markerElement.style.border = '2px solid #ffffff';
        markerElement.style.borderRadius = '50%';
        markerElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        markerElement.style.pointerEvents = 'none';
        markerElement.style.zIndex = '1001';
        markerElement.style.transform = 'translate(-50%, -50%)';
        markerElement.title = `数据点 ${index}\n时间: ${dataPoint.time}\n最高价: ${dataPoint.high}\nX坐标: ${Math.round(x)}\nY坐标: ${Math.round(finalY)}`;

        let labelElement: HTMLElement | undefined;


        if (showLabel) {
            labelElement = document.createElement('div');
            labelElement.className = 'test-marker-label';
            labelElement.style.position = 'absolute';
            labelElement.style.left = `${x}px`;
            labelElement.style.top = `${finalY - 20}px`;
            labelElement.style.color = markerColor;
            labelElement.style.fontSize = '11px';
            labelElement.style.fontWeight = 'bold';
            labelElement.style.backgroundColor = 'rgba(255,255,255,0.9)';
            labelElement.style.padding = '2px 6px';
            labelElement.style.borderRadius = '3px';
            labelElement.style.border = `1px solid ${markerColor}`;
            labelElement.style.pointerEvents = 'none';
            labelElement.style.zIndex = '1002';
            labelElement.style.transform = 'translate(-50%, -100%)';
            labelElement.style.whiteSpace = 'nowrap';
            labelElement.textContent = `#${index} (H:${dataPoint.high})`;

            this.testContainer!.appendChild(labelElement);
        }

        this.testContainer!.appendChild(markerElement);


        const overlay: OverlayMarker = {
            id: markerId,
            type: 'marker',
            element: markerElement,
            labelElement,
            data: {
                index,
                time: dataPoint.time,
                price: dataPoint.high,
                x,
                y: finalY
            }
        };

        this.overlays.set(markerId, overlay);
        return markerId;
    }


    public createVerticalLine(
        x: number,
        index: number,
        time: string,
        dataPoint: any,
        options?: {
            lineColor?: string;
            lineWidth?: number;
            showLabel?: boolean;
        }
    ): string {
        if (!this.testContainer) {
            this.createTestContainer();
        }

        const lineId = `line_${Date.now()}_${index}`;
        const lineColor = options?.lineColor || 'rgba(255, 0, 0, 0.3)';
        const lineWidth = options?.lineWidth || 2;
        const showLabel = options?.showLabel !== false;


        const lineElement = document.createElement('div');
        lineElement.className = 'test-vertical-line';
        lineElement.style.position = 'absolute';
        lineElement.style.left = `${x}px`;
        lineElement.style.top = '0';
        lineElement.style.width = `${lineWidth}px`;
        lineElement.style.height = '100%';
        lineElement.style.backgroundColor = lineColor;
        lineElement.style.pointerEvents = 'none';
        lineElement.style.zIndex = '1001';
        lineElement.title = `数据点 ${index}\n时间: ${time}\nX坐标: ${Math.round(x)}`;

        let labelElement: HTMLElement | undefined;


        if (showLabel) {
            labelElement = document.createElement('div');
            labelElement.className = 'test-line-label';
            labelElement.style.position = 'absolute';
            labelElement.style.left = `${x + 5}px`;
            labelElement.style.top = '5px';
            labelElement.style.color = '#ff0000';
            labelElement.style.fontSize = '10px';
            labelElement.style.fontWeight = 'bold';
            labelElement.style.backgroundColor = 'rgba(255,255,255,0.8)';
            labelElement.style.padding = '1px 4px';
            labelElement.style.borderRadius = '2px';
            labelElement.style.pointerEvents = 'none';
            labelElement.style.zIndex = '1002';
            labelElement.textContent = `#${index}`;

            this.testContainer!.appendChild(labelElement);
        }

        this.testContainer!.appendChild(lineElement);


        const overlay: OverlayMarker = {
            id: lineId,
            type: 'vertical-line',
            element: lineElement,
            labelElement,
            data: {
                index,
                time,
                price: dataPoint?.high || 0,
                x,
                y: 0
            }
        };

        this.overlays.set(lineId, overlay);
        return lineId;
    }


    public createSpecialMarker(
        x: number,
        time: string,
        dataPoint: any,
        yCoordinate: number,
        options?: {
            markerColor?: string;
            markerSize?: number;
            offsetY?: number;
        }
    ): string {
        if (!this.testContainer) {
            this.createTestContainer();
        }

        const markerId = `special_${Date.now()}`;
        const markerColor = options?.markerColor || 'rgba(0, 255, 0, 0.8)';
        const markerSize = options?.markerSize || 16;
        const offsetY = options?.offsetY || 10;


        const finalY = yCoordinate - offsetY;


        const markerElement = document.createElement('div');
        markerElement.className = 'test-special-marker';
        markerElement.style.position = 'absolute';
        markerElement.style.left = `${x}px`;
        markerElement.style.top = `${finalY}px`;
        markerElement.style.width = `${markerSize}px`;
        markerElement.style.height = `${markerSize}px`;
        markerElement.style.backgroundColor = markerColor;
        markerElement.style.border = '2px solid #ffffff';
        markerElement.style.borderRadius = '50%';
        markerElement.style.pointerEvents = 'none';
        markerElement.style.zIndex = '1001';
        markerElement.style.transform = 'translate(-50%, -50%)';
        markerElement.title = `特殊标记\n时间: ${time}\n最高价: ${dataPoint.high}\nY坐标: ${Math.round(finalY)}`;

        this.testContainer!.appendChild(markerElement);


        const overlay: OverlayMarker = {
            id: markerId,
            type: 'special-marker',
            element: markerElement,
            data: {
                index: -1,
                time,
                price: dataPoint.high,
                x,
                y: finalY
            }
        };

        this.overlays.set(markerId, overlay);
        return markerId;
    }


    public removeOverlay(overlayId: string): boolean {
        const overlay = this.overlays.get(overlayId);
        if (overlay) {
            overlay.element.remove();
            if (overlay.labelElement) {
                overlay.labelElement.remove();
            }
            this.overlays.delete(overlayId);
            return true;
        }
        return false;
    }


    public removeAllOverlays(): void {
        this.overlays.forEach(overlay => {
            overlay.element.remove();
            if (overlay.labelElement) {
                overlay.labelElement.remove();
            }
        });
        this.overlays.clear();
    }


    public removeTestContainer(): void {
        if (this.testContainer) {
            this.testContainer.remove();
            this.testContainer = null;
            this.overlays.clear();
        }
    }


    public getAllOverlays(): OverlayMarker[] {
        return Array.from(this.overlays.values());
    }


    public getOverlaysByType(type: OverlayMarker['type']): OverlayMarker[] {
        return this.getAllOverlays().filter(overlay => overlay.type === type);
    }


    public updateOverlayPosition(overlayId: string, newX: number, newY: number): boolean {
        const overlay = this.overlays.get(overlayId);
        if (overlay) {
            overlay.element.style.left = `${newX}px`;
            overlay.element.style.top = `${newY}px`;

            if (overlay.labelElement) {
                overlay.labelElement.style.left = `${newX}px`;
                overlay.labelElement.style.top = `${newY - 20}px`;
            }


            overlay.data.x = newX;
            overlay.data.y = newY;

            return true;
        }
        return false;
    }


    public updateOverlaysPositions(updates: Array<{ id: string; x: number; y: number }>): void {
        updates.forEach(update => {
            this.updateOverlayPosition(update.id, update.x, update.y);
        });
    }


    public setOverlayVisibility(overlayId: string, visible: boolean): boolean {
        const overlay = this.overlays.get(overlayId);
        if (overlay) {
            overlay.element.style.display = visible ? 'block' : 'none';
            if (overlay.labelElement) {
                overlay.labelElement.style.display = visible ? 'block' : 'none';
            }
            return true;
        }
        return false;
    }


    public setAllOverlaysVisibility(visible: boolean): void {
        this.overlays.forEach(overlay => {
            this.setOverlayVisibility(overlay.id, visible);
        });
    }


    public destroy(): void {
        this.removeTestContainer();
        this.overlays.clear();
    }
}