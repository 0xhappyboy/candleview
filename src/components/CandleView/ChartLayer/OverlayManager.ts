// OverlayManager.ts
import { Point } from '../Drawing/types';

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

export class OverlayManager {
    private container: HTMLElement;
    private overlays: Map<string, OverlayMarker> = new Map();
    private testContainer: HTMLElement | null = null;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    // 创建测试容器
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

    // 创建标记点 - 修改Y坐标计算
    public createMarker(
        x: number, 
        index: number, 
        dataPoint: any, 
        yCoordinate: number,
        options?: {
            markerColor?: string;
            markerSize?: number;
            showLabel?: boolean;
            offsetY?: number; // 新增：Y轴偏移量
        }
    ): string {
        if (!this.testContainer) {
            this.createTestContainer();
        }

        const markerId = `marker_${Date.now()}_${index}`;
        const markerColor = options?.markerColor || '#ff4444';
        const markerSize = options?.markerSize || 12;
        const showLabel = options?.showLabel !== false;
        const offsetY = options?.offsetY || 10; // 默认偏移10px

        // 计算Y坐标：在最高价位置上方10px处
        const finalY = yCoordinate - offsetY;

        // 创建标记元素
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

        // 创建标签元素 - 标签也相应调整位置
        if (showLabel) {
            labelElement = document.createElement('div');
            labelElement.className = 'test-marker-label';
            labelElement.style.position = 'absolute';
            labelElement.style.left = `${x}px`;
            labelElement.style.top = `${finalY - 20}px`; // 标签在标记点上方
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

        // 存储覆盖物信息
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
                y: finalY // 存储调整后的Y坐标
            }
        };

        this.overlays.set(markerId, overlay);
        return markerId;
    }

    // 创建垂直线 - 也相应调整
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

        // 创建线元素
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

        // 创建标签元素
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

        // 存储覆盖物信息
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

    // 创建特殊标记 - 也相应调整
    public createSpecialMarker(
        x: number, 
        time: string, 
        dataPoint: any, 
        yCoordinate: number,
        options?: {
            markerColor?: string;
            markerSize?: number;
            offsetY?: number; // 新增：Y轴偏移量
        }
    ): string {
        if (!this.testContainer) {
            this.createTestContainer();
        }

        const markerId = `special_${Date.now()}`;
        const markerColor = options?.markerColor || 'rgba(0, 255, 0, 0.8)';
        const markerSize = options?.markerSize || 16;
        const offsetY = options?.offsetY || 10; // 默认偏移10px

        // 计算Y坐标：在最高价位置上方10px处
        const finalY = yCoordinate - offsetY;

        // 创建特殊标记元素
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

        // 存储覆盖物信息
        const overlay: OverlayMarker = {
            id: markerId,
            type: 'special-marker',
            element: markerElement,
            data: {
                index: -1,
                time,
                price: dataPoint.high,
                x,
                y: finalY // 存储调整后的Y坐标
            }
        };

        this.overlays.set(markerId, overlay);
        return markerId;
    }

    // 移除单个覆盖物
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

    // 移除所有覆盖物
    public removeAllOverlays(): void {
        this.overlays.forEach(overlay => {
            overlay.element.remove();
            if (overlay.labelElement) {
                overlay.labelElement.remove();
            }
        });
        this.overlays.clear();
    }

    // 移除测试容器
    public removeTestContainer(): void {
        if (this.testContainer) {
            this.testContainer.remove();
            this.testContainer = null;
            this.overlays.clear();
        }
    }

    // 获取所有覆盖物
    public getAllOverlays(): OverlayMarker[] {
        return Array.from(this.overlays.values());
    }

    // 根据类型获取覆盖物
    public getOverlaysByType(type: OverlayMarker['type']): OverlayMarker[] {
        return this.getAllOverlays().filter(overlay => overlay.type === type);
    }

    // 更新覆盖物位置
    public updateOverlayPosition(overlayId: string, newX: number, newY: number): boolean {
        const overlay = this.overlays.get(overlayId);
        if (overlay) {
            overlay.element.style.left = `${newX}px`;
            overlay.element.style.top = `${newY}px`;
            
            if (overlay.labelElement) {
                overlay.labelElement.style.left = `${newX}px`;
                overlay.labelElement.style.top = `${newY - 20}px`;
            }

            // 更新数据
            overlay.data.x = newX;
            overlay.data.y = newY;
            
            return true;
        }
        return false;
    }

    // 批量更新覆盖物位置
    public updateOverlaysPositions(updates: Array<{id: string; x: number; y: number}>): void {
        updates.forEach(update => {
            this.updateOverlayPosition(update.id, update.x, update.y);
        });
    }

    // 设置覆盖物可见性
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

    // 设置所有覆盖物可见性
    public setAllOverlaysVisibility(visible: boolean): void {
        this.overlays.forEach(overlay => {
            this.setOverlayVisibility(overlay.id, visible);
        });
    }

    // 销毁管理器
    public destroy(): void {
        this.removeTestContainer();
        this.overlays.clear();
    }
}